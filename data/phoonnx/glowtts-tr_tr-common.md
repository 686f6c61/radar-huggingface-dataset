# Phoonnx/glowtts-tr_tr-common

## Resumen

glowtts-tr_tr-common es un modelo de sintesis de voz (text-to-speech) para turco de Turquia (tr-TR) basado en la arquitectura Glow-TTS desarrollada originalmente por Coqui. El modelo procede del paquete oficial `tts_models--tr--common-voice--glow-tts` de Coqui TTS v0.6.1, entrenado sobre el corpus Common Voice en turco, y ha sido reempaquetado por Phoonnx en formato ONNX para su uso con la libreria de inferencia `phoonnx`.

El modelo no genera audio directamente: produce un espectrograma a partir de una secuencia de caracteres del texto de entrada, que posteriormente es convertido a forma de onda por el vocoder HiFi-GAN `hifigan-tr_tr-common`, descargado automaticamente por la libreria. Esta separacion en dos etapas (acustica + vocoder) es el patron habitual en los sistemas TTS neuronales de la familia Coqui.

Su relevancia actual es practica: ofrece una via ligera (repositorio de 0,1 GB) y con licencia MIT para incorporar sintesis de voz en turco en asistentes de voz, sistemas de accesibilidad o pipelines de audio dentro del ecosistema OVOS/Mycroft, sin depender de servicios en la nube. No es un modelo de gran tamano ni compite en naturalidad con los sistemas TTS neuronales de ultima generacion, pero su huella reducida y su integracion con ONNX lo hacen util en despliegues locales y embebidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (modelo acustico normalizing flow) + vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada por caracteres, sin ventana declarada) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | turco (tr-TR) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | caracteres del texto (GraphemePhonemizer de scriptconv) |
| Vocoder asociado | hifigan-tr_tr-common |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |

## Arquitectura y entrenamiento

Glow-TTS es un modelo acustico generativo basado en normalizing flows que aprende una correspondencia monotona y alineada entre la secuencia de texto y el espectrograma mel, sin necesidad de un alineador externo tipo attention. La arquitectura combina un encoder de texto con un bloque de flows invertibles que transforma una distribucion latente simple en la distribucion del espectrograma condicionada por el texto. El modelo original fue desarrollado por Coqui y publicado en su repositorio TTS (version 0.6.1 de los modelos).

El entrenamiento se realizo sobre el corpus Common Voice en turco, segun indica el nombre del paquete upstream (`common-voice`). No se dispone en la informacion proporcionada del numero de horas de audio, del numero de tokens de texto ni de si se aplicaron etapas de ajuste adicionales. El front-end de texto utiliza el `GraphemePhonemizer` de la libreria scriptconv, es decir, trabaja directamente sobre grafemas normalizados en lugar de una transcripcion fonetica completa. La sintesis final la realiza el vocoder HiFi-GAN `hifigan-tr_tr-common`, que convierte el espectrograma en audio.

## Capacidades

- Sintesis de voz a partir de texto en turco (tr-TR) con salida en formato WAV.
- Generacion de espectrogramas mel mediante el modelo acustico Glow-TTS.
- Conversion de espectrograma a audio mediante el vocoder HiFi-GAN asociado.
- Normalizacion y conversion de texto de entrada a traves de scriptconv (GraphemePhonemizer).
- Integracion con el ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion local en formato ONNX, sin dependencia de servicios externos.
- No soporta tool calling, agentes, vision, audio de entrada ni modo de razonamiento; es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz locales en turco: el modelo puede integrarse en OVOS/Mycroft seleccionando la voz `coqui-tr-common-voice-glow-tts` en `mycroft.conf`, permitiendo respuestas habladas sin conexion a internet.
- Accesibilidad y lectura de pantalla: conversion de texto a voz para aplicaciones de lectura asistida en turco, con un repositorio de solo 0,1 GB que facilita su empaquetado en aplicaciones de escritorio.
- Sistemas embebidos y dispositivos de bajo consumo: el formato ONNX y el reducido tamano permiten ejecutar la sintesis en hardware limitado, incluidos dispositivos tipo Raspberry Pi, siempre que se valide el rendimiento del vocoder.
- Generacion de audiolibros o contenido pregrabado: sintesis por lotes de textos largos en turco para producir narraciones automatizadas, dividiendo el texto en fragmentos.
- Prototipado de interfaces conversacionales: generacion rapida de respuestas habladas en turco durante el desarrollo de bots de voz, sin coste de API.
- Pruebas de integracion en pipelines de audio: uso como componente TTS de referencia en pruebas automatizadas de sistemas de voz que requieran una salida de audio determinista y local.
- Aplicaciones educativas de aprendizaje de turco: generacion de pronunciaciones de texto para ejercicios de idioma, con la advertencia de que la calidad depende del vocoder y del corpus de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,1 GB, por lo que la huella de memoria es reducida, pero no se especifica el consumo exacto en ejecucion.
- GPU recomendadas: no disponible. Al ser un modelo pequeno en ONNX, es probable que funcione en CPU, pero no se confirma en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible de forma explicita; el tamano reducido sugiere que cabria en GPU de consumo, pero no hay datos que lo confirmen.
- Opciones de despliegue: libreria `phoonnx` (Python) y plugin `ovos-tts-plugin-phoonnx` para OVOS. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamano | Disponibilidad |
|---|---|---|---|---|---|---|
| glowtts-tr_tr-common | Glow-TTS + HiFi-GAN | tr-TR | MIT | ONNX | 0,1 GB | Hugging Face (Phoonnx) |
| Otros modelos Glow-TTS de la coleccion Phoonnx | Glow-TTS + HiFi-GAN | varios | MIT (segun upstream) | ONNX | no disponible | Hugging Face (coleccion Phoonnx) |
| Modelos TTS de Coqui TTS v0.6.1 | VITS, Glow-TTS, Tacotron2, etc. | varios | MIT (segun lista Coqui) | PyTorch | variable | GitHub Coqui TTS |

La comparacion detallada con alternativas de la misma categoria (mismo idioma y mismo tamano) no esta disponible en la informacion proporcionada. La coleccion Glow-TTS de Phoonnx incluye otros modelos empaquetados de la misma familia, pero no se detallan sus caracteristicas en esta ficha.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en turco (tr-TR); no soporta otros idiomas.
- Entrada basada en grafemas, sin fonemizacion completa, lo que puede afectar a la pronunciacion de palabras extranas o siglas.
- La calidad final depende del vocoder HiFi-GAN asociado; no se han publicado metricas objetivas (MOS, etc.) en la informacion disponible.
- Riesgo de artefactos y errores de prosodia en textos largos o con puntuacion compleja, habitual en modelos TTS de esta generacion.
- No se dispone de informacion sobre sesgos del corpus Common Voice en turco ni sobre su representatividad demografica.
- Licencia MIT declarada por el upstream en la lista de modelos de Coqui TTS; se recomienda verificar los terminos del corpus Common Voice para usos comerciales concretos.
- El modelo esta empaquetado para la libreria phoonnx; su uso fuera de ese ecosistema requiere convertir o adaptar los pesos ONNX.
- No apto para clonacion de voz ni para control de estilo o emocion; es un TTS de voz unica.
- Fecha de creacion del repositorio en Hugging Face: 2026-11-14, segun los metadatos; conviene verificar la vigencia del paquete upstream de Coqui.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-tr_tr-common
- Vocoder asociado: https://huggingface.co/Phoonnx/hifigan-tr_tr-common
- Paquete upstream de Coqui TTS: https://github.com/coqui-ai/TTS/releases/download/v0.6.1_models/tts_models--tr--common-voice--glow-tts.zip
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
