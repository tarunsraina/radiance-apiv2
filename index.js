import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import jwt  from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config()
const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

const PORT = process.env.PORT || 4000;
let refreshTokens = []

app.get('/',async(req,res)=>{
    res.send('Server up and running..')
})

app.post('/login',(req,res)=>{
    let status1;
    console.log(req.body.username);
    console.log(req.body.password);
    if(req.body.username===undefined || req.body.password===undefined){
        console.log("Request body is undefined!!!!!!")
        status1 = 400;
    }

    let user = {
        username : req.body.username,
        password : req.body.password
    }


   fetch('https://upright-guppy-78.hasura.app/api/rest/login',{
        method : 'POST',
        body : JSON.stringify(user),
        headers : {'Content-Type': 'application/json','x-hasura-admin-secret':'QWt8paaZtf80a2xU37gnOhAAFIVTXFR2Atw26ASX3Y3zImS26Gp09ypnOD7B9ajT'}
    }).then(res => Promise.all([res.status, res.text()]))
    .then(([status, textData]) => {
        if(textData.includes("[]" || status1==400)){
            res.status(401).send("No user found")
        }else if(textData.includes("FATAL") || textData.includes("failed")){
            res.status(500).send("Internal server error");
        }else{
        const accessToken = generateAccessToken(user)
        const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN)
        refreshTokens.push(refreshToken);
        //res.sendStatus(200);
        return res.json({
            accessToken,refreshToken
          })
        }
      })


})

function generateAccessToken(data) {
    return jwt.sign({data}, process.env.ACCESS_TOKEN, { expiresIn: '1000000s' })
  }

app.listen(PORT,()=>console.log('server up and running..'))
