# Phoonnx/vits-fi_fi-css10

## Resumen

vits-fi_fi-css10 es un modelo de sintesis de voz (text-to-speech) en finlandes, empaquetado en formato ONNX por Phoonnx a partir del modelo original VITS de Coqui entrenado sobre el corpus CSS10. No es un modelo de lenguaje: es un sistema TTS de extremo a extremo que convierte texto en audio, y su relevancia radica en que permite sintesis de voz en finlandes dentro del ecosistema phoonnx y OVOS sin depender del stack original de Coqui TTS en PyTorch.

El modelo usa la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un sistema condicional VAE con normalizing flows, decoder HiFi-GAN y entrenamiento adversarial, que genera audio de forma directa a partir de texto sin necesidad de un vocoder separado. El repositorio ocupa 0,1 GB, lo que corresponde a un modelo pequeno orientado a inferencia en CPU o GPU modestas.

Este empaquetado concreto esta pensado para su uso mediante la libreria phoonnx, que expone el modelo como voz (`coqui/fi-css10-vits`) y lo integra como plugin de TTS en OVOS. Es una pieza de infraestructura para asistentes de voz en finlandes mas que un modelo de proposito general, y su licencia BSD-3-Clause facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (VAE condicional con normalizing flows, decoder HiFi-GAN y entrenamiento adversarial) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, sin ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | finlandes (fi-FI) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz de extremo a extremo que combina un encoder de texto, un prior condicional, normalizing flows para modelar la distribucion del audio, un decoder basado en HiFi-GAN y un discriminador multiple entrenado de forma adversarial junto con una perdida de reconstruccion espectral y una estimacion de alineamiento monotono (MAS). Esto permite generar waveforms directamente desde la secuencia de texto sin un vocoder externo ni un modelo acustico intermedio.

El modelo original fue entrenado por Coqui sobre el corpus CSS10, un conjunto de audiolibros en dominio publico con alineamientos a nivel de frase, y distribuido en el release v0.8.0 de Coqui TTS. No se dispone en la informacion proporcionada de detalles sobre el numero de horas de audio, el numero de tokens de entrenamiento ni la composicion exacta del dataset mas alla de su origen en CSS10. El empaquetado de Phoonnx convierte los pesos a ONNX y anade un front-end de texto basado en `GraphemePhonemizer` de la libreria scriptconv, que normaliza el texto y lo convierte en la entrada del modelo a nivel de grafemas, sin fonemizacion linguistica especifica.

## Capacidades

- Sintesis de voz en finlandes (fi-FI) a partir de texto plano.
- Generacion de audio WAV mediante `voice.synthesize_wav(text, wav_file)` en phoonnx.
- Entrada basada en caracteres (grafemas) procesada por `GraphemePhonemizer` de scriptconv.
- Integracion como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`) configurable via `mycroft.conf`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es exclusivamente un modelo TTS.
- No soporta vision, audio de entrada ni modo thinking.
- Multilingue: no; unicamente finlandes.

## Casos de uso

- Asistentes de voz en finlandes sobre OVOS: el modelo se selecciona como modulo TTS en `mycroft.conf` y sintetiza las respuestas del asistente en tiempo de ejecucion, aprovechando el empaquetado ONNX para despliegue ligero.
- Lectura de contenido en aplicaciones de accesibilidad: conversion de articulos, notificaciones o mensajes de interfaz a voz en finlandes para usuarios con discapacidad visual, con un modelo de 0,1 GB que puede ejecutarse en local.
- Generacion de avisos y anuncios pregrabados: sintesis por lotes de mensajes de transporte publico, aeropuertos o comercios en finlandes, donde la naturalidad de VITS es suficiente y el coste computacional es bajo.
- Prototipado de interfaces conversacionales en finlandes: equipos que desarrollan un producto de voz pueden integrar esta voz para validar flujos de dialogo sin contratar un servicio TTS en la nube.
- Sistemas embebidos y edge: al distribuirse en ONNX y ocupar 0,1 GB, puede desplegarse en dispositivos con recursos limitados donde un modelo TTS en PyTorch no seria viable.
- Investigacion en TTS: sirve como referencia de una voz VITS en un idioma de bajos recursos y como base para comparaciones o ajuste fino en finlandes, dado que los pesos y el pipeline estan disponibles publicamente con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por el tamano del repositorio (0,1 GB) el modelo es muy ligero y cabe holgadamente en cualquier GPU consumer con 4 GB o mas, e incluso puede ejecutarse en CPU.
- GPU recomendadas: no se especifican en la informacion; cualquier GPU moderna (RTX 3060 o superior, A100, H100) es sobredimensionada para este modelo.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer actual e incluso en CPU.
- Opciones de despliegue: phoonnx (Python) y el plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documentan opciones para vLLM, llama.cpp ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phoonnx/vits-fi_fi-css10 | VITS | finlandes (fi-FI) | ONNX | BSD-3-Clause | Hugging Face, via phoonnx |
| Coqui TTS tts_models--fi--css10--vits | VITS | finlandes (fi-FI) | PyTorch (checkpoint) | BSD-3-Clause | Release v0.8.0 de Coqui TTS |
| Otras voces de la coleccion Phoonnx VITS | VITS | varios idiomas | ONNX | segun modelo | Coleccion VITS de Phoonnx en Hugging Face |

El modelo es esencialmente el mismo que el checkpoint original de Coqui para finlandes CSS10, reempaquetado en ONNX; la diferencia practica es el formato y el runtime (phoonnx frente a Coqui TTS). No se dispone de datos de rendimiento comparativo con otras voces TTS en finlandes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo unicamente de sintesis de voz: no realiza comprension de texto, razonamiento ni generacion de lenguaje.
- Idioma limitado al finlandes (fi-FI); el texto en otros idiomas producira una pronunciacion incorrecta o fallos.
- Entrada a nivel de grafemas sin fonemizacion linguistica, lo que puede reducir la precision en palabras extranas, siglas o numeros no normalizados correctamente por scriptconv.
- Sesgos: no se documentan sesgos especificos, pero al entrenarse sobre audiolibros en dominio publico (CSS10) la voz y el estilo pueden estar sesgados hacia ese registro y no cubrir bien otros acentos o estilos.
- Riesgo de alucinacion en el sentido de prosodia o pronunciacion erronea en entradas atipicas; no se documentan evaluaciones de calidad subjetiva (MOS).
- Licencia BSD-3-Clause: permite uso comercial con atribucion y sin endoso; conviene conservar el aviso de copyright y verificar los terminos del corpus CSS10 subyacente antes de un despliegue comercial.
- No se documentan requisitos de latencia ni limites de longitud de texto; en produccion conviene segmentar entradas largas.
- Empaquetado de terceros (Phoonnx) sobre un modelo de Coqui descatalogado; el soporte y las actualizaciones dependen del proyecto phoonnx.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-fi_fi-css10
- Modelo original de Coqui TTS: https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--fi--css10--vits.zip
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion de modelos VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
