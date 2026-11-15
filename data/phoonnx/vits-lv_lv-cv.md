# Phoonnx/vits-lv_lv-cv

## Resumen

vits-lv_lv-cv es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Coqui y empaquetado por Phoonnx en formato ONNX para su uso con la libreria phoonnx. El modelo convierte texto en letón (lv-LV) en audio, empleando una entrada basada en caracteres (graphemes) procesada mediante el fonemizador `GraphemePhonemizer` de la libreria scriptconv. Su relevancia radica en que ofrece una via de inferencia TTS ligera y portable (repo de 0,1 GB) para una lengua de recursos limitados como el letón, con licencia permisiva BSD-3-Clause.

El modelo procede del paquete original `tts_models--lv--cv--vits.zip` publicado en las releases de Coqui TTS v0.8.0, entrenado sobre el corpus Common Voice en letón. Phoonnx lo ha reconvertido a ONNX para permitir su ejecucion fuera del ecosistema PyTorch original, integrandolo en su gestor de voces y en el plugin `ovos-tts-plugin-phoonnx` para asistentes OVOS.

Se trata de un modelo especializado y de un unico idioma, sin capacidades de razonamiento, codigo ni vision. Su interes es practico: despliegue de sintesis de voz en letón en entornos Python y OVOS con requisitos de recursos modestos y una licencia que facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos ONNX empaquetados) |
| Idiomas soportados | leton (lv-LV) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura de sintesis end-to-end que combina un encoder de texto, un prior y posterior variacional, un decoder basado en flujos normalizadores y un discriminador adversarial multiperiodo, junto con un decoder de audio (HiFi-GAN) para generar la forma de onda. El modelo original fue entrenado por Coqui sobre el corpus Common Voice en leton, segun indica la model card, aunque no se especifican el numero de horas de audio, tokens ni detalles del pipeline de entrenamiento.

El empaquetado de Phoonnx convierte los pesos del modelo original a ONNX para permitir inferencia sin dependencia de PyTorch. El front-end de texto se delega a scriptconv, que normaliza el texto y lo convierte en la entrada del modelo mediante `GraphemePhonemizer`, es decir, una representacion a nivel de caracteres (graphemes) en lugar de fonemas. No se documentan innovaciones adicionales como decodificacion especulativa ni atencion lineal.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto en leton (lv-LV).
- Entrada basada en caracteres (graphemes) mediante `GraphemePhonemizer` de scriptconv.
- Generacion de audio en formato WAV mediante `synthesize_wav`.
- Integracion con el gestor de voces de phoonnx (`TTSModelManager`).
- Integracion con OVOS a traves del plugin `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step.
- No soporta vision, audio de entrada ni modo thinking.
- Monolingue: unicamente leton.

## Casos de uso

- Sintesis de voz para asistentes OVOS: el modelo se selecciona como voz en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx`, permitiendo respuestas habladas en leton en asistentes de voz autoalojados.
- Lectura de contenido en leton: conversion de articulos, noticias o documentacion a audio para consumo pasivo o accesibilidad, usando `synthesize_wav` sobre frases individuales.
- Generacion de avisos y mensajes automatizados: produccion de locuciones para sistemas de megafonia, notificaciones o IVR en leton, aprovechando el tamano reducido del modelo (0,1 GB) para despliegues ligeros.
- Accesibilidad para personas con discapacidad visual: integracion en lectores de pantalla o aplicaciones de lectura que requieran una voz en leton con licencia permisiva.
- Prototipado de aplicaciones de voz en Python: uso de la API de phoonnx para validar rapidamente pipelines TTS en leton sin depender de PyTorch ni de servicios en la nube.
- Investigacion en TTS para lenguas de bajos recursos: el modelo sirve como linea base VITS para experimentos con el corpus Common Voice en leton y para comparaciones con otros sistemas TTS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano del repositorio es de 0,1 GB, lo que sugiere un modelo compacto apto para CPU.
- GPU recomendadas: no disponible. Por el tamano del modelo, es previsible que funcione en CPU y en GPUs de consumo, aunque no se documentan requisitos oficiales.
- Cabe en GPU de consumo: no disponible de forma explicita; el tamano de 0,1 GB hace plausible su ejecucion en cualquier GPU consumer, pero no se confirma en la informacion proporcionada.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ejecucion ONNX Runtime subyacente.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto/entrada |
|---|---|---|---|---|---|
| Phoonnx/vits-lv_lv-cv | VITS | leton (lv-LV) | ONNX | BSD-3-Clause | Caracteres (graphemes) |
| Coqui TTS `tts_models--lv--cv--vits` | VITS | leton (lv-LV) | PyTorch | BSD-3-Clause | Caracteres |
| Otros modelos VITS de la coleccion Phoonnx | VITS | varios | ONNX | segun modelo | Caracteres |

No se dispone de datos de rendimiento comparativo con otros modelos TTS en la informacion proporcionada. La alternativa mas directa es el paquete original de Coqui del que deriva este modelo, con la diferencia del formato de pesos (PyTorch frente a ONNX) y el ecosistema de ejecucion (Coqui TTS frente a phoonnx).

## Limitaciones y advertencias

- Modelo monolingue: solo sintetiza leton (lv-LV); el texto en otros idiomas producira resultados incorrectos.
- Entrada a nivel de caracteres (graphemes) sin fonemizacion linguistica completa, lo que puede afectar la pronunciacion de palabras irregulares o extranjerismos.
- Riesgo de artefactos y pronunciacion incorrecta inherente a los sistemas TTS entrenados sobre corpus limitados como Common Voice.
- No se documentan sesgos especificos, pero al entrenarse sobre Common Voice pueden reflejar las caracteristicas demograficas y de grabacion de dicho corpus.
- No apto para tareas de razonamiento, codigo, matematicas, vision ni agentes.
- Licencia BSD-3-Clause: permisiva para uso comercial, con obligacion de conservar el aviso de copyright y la clausula de no aval.
- No se especifican requisitos de hardware ni latencias, por lo que el rendimiento en produccion debe validarse empiricamente.
- Modelo con solo 27 descargas y 0 likes en el momento de la consulta: comunidad reducida y poca validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-lv_lv-cv
- Paquete original de Coqui TTS: https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--lv--cv--vits.zip
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
