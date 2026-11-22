# Phoonnx/vits-ur_pk-fasih-medium-espeak

## Resumen

vits-ur_pk-fasih-medium-espeak es una voz de síntesis de habla (text-to-speech) en urdu de Pakistan (ur-PK) basada en la arquitectura VITS, en su variante Piper. El modelo original fue entrenado por IhorShevchuk y publicado dentro del repositorio rhasspy/piper-voices; TigreGotico Lda lo ha convertido a formato ONNX para su uso con la libreria phoonnx, sin modificar los pesos. Se distribuye bajo licencia MIT.

El modelo resuelve la generacion de audio de voz sintetica en urdu a partir de texto con fonemas espeak-ng (alfabeto IPA), con una unica hablante y una frecuencia de muestreo de 22050 Hz. Su interes practico esta en el despliegue ligero: el grafo ONNX ocupa 64,8 MB y el pico de memoria residente medido es de 262,7 MB, con un RTF de 0,042 sobre CPU de escritorio (Intel i9-11900H, 4 hilos), lo que lo hace apto para entornos sin GPU.

La relevancia actual es limitada pero concreta: cubre un idioma con poca representacion en TTS open source y se integra en el ecosistema phoonnx. No obstante, el propio autor advierte que la voz no supera el control de calidad (QA) con ASR y que queda fuera del indice de voces de phoonnx por una discrepancia en el mapeo de pares vocalicos entre phoonnx y Piper (phoonnx issue 838).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (TTS; entrada de texto con puntuacion de clausula , . ! ? : ;) |
| Tipos de cuantizacion | fp32 (int8 no publicado: fallo en el control int8) |
| Idiomas soportados | ur-PK (urdu de Pakistan) |
| Licencia | MIT |
| Formato de pesos | ONNX (model.onnx + config.json) |
| Frecuencia de muestreo | 22050 Hz |
| Hablantes | 1 (voz "fasih") |
| Fonemizador | espeak-ng, voz ur (IPA) |
| Tamano del grafo | 64,8 MB |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo emplea VITS, un modelo generativo de sintesis de habla de extremo a extremo que combina un encoder de texto, un predictor de duraciones y un decodificador generativo con modelado variacional, en la implementacion de Piper. La entrada de texto se convierte a fonemas IPA mediante espeak-ng con la voz ur; la salida es audio mono a 22050 Hz con una unica hablante. La version publicada aqui es una conversion a ONNX del checkpoint original, sin cambios en los pesos.

No se registra informacion sobre el conjunto de datos de entrenamiento: la model card upstream no indica URL de dataset, numero de tokens ni composicion. Tampoco se documenta el checkpoint base ni si hubo ajuste por RLHF o DPO (no aplicable en la practica a un TTS de este tipo). El entrenamiento original corresponde a IhorShevchuk; la conversion y publicacion ONNX corresponde a TigreGotico Lda. La unica innovacion tecnica documentada es la propia conversion a ONNX para inferencia en CPU con phoonnx, junto con la preservacion de la puntuacion de clausula en la sintesis a partir de phoonnx 1.96.1a1.

## Capacidades

- Sintesis de voz (text-to-speech) en urdu de Pakistan a partir de texto con fonemas espeak-ng en IPA.
- Una unica hablante ("fasih"), sin soporte multi-hablante ni cambio de voz.
- Manejo de puntuacion de clausula (, . ! ? : ;) en la sintesis con phoonnx 1.96.1a1 o posterior.
- Salida de audio WAV a 22050 Hz mediante la API `TTSVoice.synthesize_wav`.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- No soporta vision, audio de entrada ni modo thinking.
- Capacidad multilingue: unicamente ur-PK; no se documentan otros idiomas.
- Inferencia en CPU sin GPU, con grafo ONNX de 64,8 MB.

## Casos de uso

- Lectura de contenido en urdu en aplicaciones moviles o de escritorio: el modelo sintetiza texto en urdu-PK con un grafo de 64,8 MB y 262,7 MB de pico de memoria, adecuado para dispositivos con recursos limitados y sin GPU.
- Accesibilidad para personas con discapacidad visual: conversion de articulos, avisos o documentos en urdu a audio, con RTF de 0,042 en CPU de escritorio, lo que permite generar audio mas rapido que en tiempo real.
- Asistentes de voz embebidos en entornos sin GPU: integracion via phoonnx en pipelines de Python que requieran TTS local y determinista, sin dependencia de servicios en la nube.
- Generacion de avisos y notificaciones habladas en urdu: sintesis de frases cortas con puntuacion de clausula para mejorar la prosodia en mensajes de sistemas de alerta o domotica.
- Prototipado de interfaces conversacionales en urdu: uso como componente TTS en pruebas de concepto de asistentes o chatbots, aprovechando la licencia MIT y la ausencia de coste por API.
- Investigacion en TTS de bajos recursos: punto de partida para evaluar o adaptar una voz urdu en experimentos academicos, dado que los pesos son ONNX y la licencia permite modificacion y redistribucion.
- Pruebas de regresion de fonemizacion: comparacion del comportamiento de espeak-ng frente al port espyak en urdu, util para validar pipelines de fonemizacion.

## Benchmarks y rendimiento

Los unicos datos publicados son los del control de calidad (QA) del autor, medidos en un Intel Core i9-11900H a 2,50 GHz con 4 hilos. No hay resultados de benchmarks estandar de TTS (MOS, WER, etc.) en la informacion disponible.

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado del control QA | fail | no publicado |
| Caracteres por segundo | 17,8 a 19,3 | - |
| Longitud, int8 / fp32 | - | 1,00 a 1,00 |
| Tamano del grafo | 64,8 MB | - |
| Pico de memoria residente (RSS) | 262,7 MB | - |
| RTF (mediana de 3, 4 hilos) | 0,042 | - |

Metodo de QA: sin ASR, comprobacion de longitud y silencio; frases de FLORES-200 devtest (3 frases). El control int8 fallo, por lo que no se publica copia int8.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. La comparacion se limita a caracteristicas estructurales conocidas del ecosistema Piper.

| Modelo | Idioma | Arquitectura | Formato | Licencia | Contexto / notas |
|---|---|---|---|---|---|
| vits-ur_pk-fasih-medium-espeak | ur-PK | VITS (Piper) | ONNX | MIT | Voz unica, 22050 Hz, fuera del indice de phoonnx |
| rhasspy/piper-voices (ur/ur_PK/fasih/medium) | ur-PK | VITS (Piper) | Piper (upstream) | MIT | Modelo original del que deriva esta conversion |
| Otras voces Piper | varios | VITS (Piper) | ONNX / Piper | MIT (segun voz) | Disponibilidad y calidad variables por idioma; datos no disponibles |

## Limitaciones y advertencias

- El control de calidad con ASR no supera la validacion (resultado "fail" en fp32); la calidad de pronunciacion no esta garantizada.
- La voz queda fuera del indice de voces de phoonnx por una discrepancia en el mapeo de pares vocalicos entre phoonnx y Piper (phoonnx issue 838), lo que puede afectar a la pronunciacion de determinadas palabras.
- No se publica copia int8: el control int8 fallo, por lo que no hay opcion cuantizada para reducir memoria o latencia.
- El uso de espyak en lugar de espeak-ng puede producir pronunciaciones incorrectas en algunas palabras, segun advierte el autor.
- El modelo solo cubre urdu de Pakistan (ur-PK); no soporta otros idiomas ni variantes regionales.
- Una unica hablante: no hay control de prosodia por hablante ni variedad vocal.
- No se documenta el conjunto de datos de entrenamiento, lo que impide evaluar sesgos de dominio, dialecto o genero.
- Riesgo de artefactos y errores de pronunciacion en palabras fuera del dominio de entrenamiento; al ser un TTS, no aplica el riesgo de alucinacion textual, pero si el de audio malformado o silencios anomalos.
- Licencia MIT: permite uso comercial y modificacion, con atribucion a IhorShevchuk (entrenamiento) y a TigreGotico Lda (conversion ONNX).
- Para produccion, conviene validar manualmente la pronunciacion en el dominio concreto y fijar la version de phoonnx (1.96.1a1 o posterior) para preservar la puntuacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-ur_pk-fasih-medium-espeak
- Modelo upstream (Piper): https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/ur/ur_PK/fasih/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Issue de phoonnx sobre el mapeo de pares vocalicos: phoonnx issue 838 (referenciado en la model card; no se proporciona URL directa)
