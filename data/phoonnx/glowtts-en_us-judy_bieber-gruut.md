# Phoonnx/glowtts-en_us-judy_bieber-gruut

## Resumen

Glow-TTS en_us-judy_bieber-gruut es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura Glow-TTS, desarrollado originalmente por Rhasspy dentro del proyecto Larynx y empaquetado para la libreria ONNX phoonnx por el usuario Phoonnx. El modelo genera espectrogramas a partir de fonemas IPA en ingles estadounidense (en-US) y depende de un vocoder externo, en este caso hifigan-multi-vctk-small, para convertir dichos espectrogramas en audio.

Se trata de un modelo compacto (el repositorio ocupa aproximadamente 0,1 GB) orientado a sintesis de voz local y de baja latencia, pensado para integrarse en asistentes de voz como OVOS/Mycroft mediante el plugin ovos-tts-plugin-phoonnx. No es un modelo de lenguaje ni un transformer autoregresivo de gran escala: es un sistema TTS de flujo no autoregresivo que transforma fonemas en representaciones acusticas.

Su relevancia actual es limitada pero concreta: cubre la necesidad de voces TTS ligeras, ejecutables en CPU y desplegables en entornos embebidos o asistentes domoticos, donde modelos TTS neuronales mas grandes resultan excesivos. La licencia no esta registrada, lo que supone una advertencia importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (flow-based, no autoregresiva) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica contexto de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | ingles estadounidense (en-US) |
| Licencia | other (sin licencia registrada; consultar upstream) |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Vocoder asociado | hifigan-multi-vctk-small |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

Glow-TTS es una arquitectura de sintesis de voz basada en flujos normalizadores (normalizing flows) y alineamiento monotono, que aprende una correspondencia directa entre secuencias de fonemas y espectrogramas mel sin necesidad de un modelo de atencion autoregresivo ni de un alineador externo. Esto permite una sintesis paralela y rapida en comparacion con modelos autoregresivos como Tacotron 2.

El modelo concreto procede del proyecto Larynx de Rhasspy (version 1.0), que entrena voces TTS sobre corpus de voz publicos. No se dispone de informacion sobre el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o ajuste fino adicional. El front-end de texto utiliza el fonemizador Gruut de la libreria scriptconv, que normaliza el texto y lo convierte a fonemas IPA antes de la inferencia. El vocoder hifigan-multi-vctk-small se descarga junto con la voz y transforma el espectrograma en forma de onda.

## Capacidades

- Sintesis de voz (text-to-speech) en ingles estadounidense a partir de texto plano.
- Conversion de texto a fonemas IPA mediante el fonemizador Gruut (scriptconv).
- Generacion de espectrogramas mel que se convierten en audio mediante HiFi-GAN.
- Integracion con asistentes de voz OVOS/Mycroft a traves de ovos-tts-plugin-phoonnx.
- Ejecucion sobre ONNX Runtime, lo que permite inferencia en CPU sin GPU dedicada.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio de entrada.
- No es multilingue: unicamente en-US.

## Casos de uso

- Asistentes de voz locales: el modelo se integra en OVOS/Mycroft como motor TTS para leer respuestas del asistente en ingles, con inferencia en CPU y sin dependencia de servicios en la nube.
- Sistemas embebidos y domotica: su tamano reducido (0,1 GB) y su ejecucion sobre ONNX Runtime permiten desplegarlo en dispositivos con recursos limitados, como Raspberry Pi, para anuncios por voz.
- Lectura de notificaciones y alertas: sintesis de mensajes cortos en ingles para sistemas de monitorizacion, alarmas o paneles de control.
- Accesibilidad: conversion de texto a voz para aplicaciones de lectura de pantalla o asistencia a personas con discapacidad visual en entornos de habla inglesa.
- Prototipado de interfaces conversacionales: generacion rapida de audio de prueba para validar flujos de dialogo antes de invertir en voces comerciales de mayor calidad.
- Generacion de locuciones para contenido educativo o demos: sintesis de frases en ingles para materiales de formacion o pruebas de concepto, dado su bajo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ejecutarse sobre ONNX Runtime, puede correr en CPU sin GPU.
- GPU recomendadas: no se especifican; cualquier GPU compatible con ONNX Runtime es suficiente, aunque no es necesaria.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU consumer e incluso en CPU, dado el tamano del repositorio (0,1 GB).
- Opciones de despliegue: phoonnx (Python), plugin ovos-tts-plugin-phoonnx para OVOS/Mycroft, ONNX Runtime.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato |
|---|---|---|---|---|---|
| glowtts-en_us-judy_bieber-gruut | Glow-TTS + HiFi-GAN | en-US | 0,1 GB (repo) | other (sin registrar) | ONNX |
| Piper (rhasspy) | VITS | multiidioma | variable | MIT (segun proyecto) | ONNX |
| Coqui TTS | Tacotron 2 / VITS / otros | multiidioma | variable | MPL-2.0 (proyecto) | varios |
| Kokoro TTS | StyleTTS2 / otros | en y otros | variable | Apache-2.0 (segun proyecto) | ONNX / safetensors |

Nota: los datos de los modelos comparados no provienen de la informacion proporcionada en esta ficha y deben verificarse en sus respectivas fichas oficiales.

## Limitaciones y advertencias

- Licencia no registrada: la model card indica explicitamente que no hay licencia registrada y recomienda consultar la release upstream antes de usarlo; el uso comercial es incierto.
- Solo soporta ingles estadounidense (en-US); no es adecuado para otros idiomas.
- Requiere un vocoder externo (hifigan-multi-vctk-small) para producir audio final.
- El front-end depende del fonemizador Gruut (scriptconv), por lo que el texto debe normalizarse correctamente antes de la sintesis.
- Riesgo de artefactos o pronunciaciones incorrectas en palabras fuera de vocabulario o nombres propios.
- No es un modelo de lenguaje: no genera texto, razona ni responde preguntas.
- Sin datos publicados de benchmarks, latencia o calidad subjetiva (MOS); la evaluacion debe hacerse de forma empirica.
- Popularidad muy baja (18 descargas, 0 likes), lo que implica escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-judy_bieber-gruut
- Release upstream (Rhasspy Larynx v1.0): https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_judy_bieber-glow_tts.tar.gz
- Vocoder HiFi-GAN: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Coleccion Glow-TTS en phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
