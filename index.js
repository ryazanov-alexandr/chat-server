const express = require('express');
const dotenv = require('dotenv');
const app = express();
const http = require('http');
const server = http.createServer(app);

dotenv.config(); 

const corsOptions = {
    origin: process.env.CORS_ORIGIN.split(','),
    methods: ["GET", "POST"],
};

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', corsOptions.origin);
    res.setHeader('Access-Control-Allow-Methods', corsOptions.methods.join(','));
    next();
})

app.get('/', (req, res) => {
    res.send('Hello')
})

const io = require("socket.io")(server, {
    cors: corsOptions,
    maxHttpBufferSize: 1e7
  });

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log("start listenning "+ PORT);
})

let connectedUsers = []; 

io.on('connection', onConnected);

function onConnected(socket) {
    socket.on('connect user', (data) => {
        data.socketId = socket.id;
        connectedUsers.push(data);
        io.emit('connect user', connectedUsers);
    })

    socket.on('chat message', (data) => {
        socket.broadcast.emit('chat message', data);
    })

    socket.on('feedback', (data) => {
        socket.broadcast.emit('feedback', data);
    })

    socket.on('disconnect', () => {
        connectedUsers = connectedUsers.filter(user => user.socketId != socket.id);
        io.emit('connect user', connectedUsers);
    })
}