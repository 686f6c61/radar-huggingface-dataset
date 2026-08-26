# Bbkblo/indri-0.1-124m-tts-ONNX

## Resumen

Indri-0.1-124M-TTS es un modelo de texto a voz (TTS) ultraligero desarrollado por 11mlabs, perteneciente a una serie de modelos de audio multimodales que tambien cubren reconocimiento de voz (ASR) y continuacion de audio. Esta ficha describe el exportado ONNX del modelo de lenguaje GPT-2 subyacente, publicado por el usuario Bbkblo, que permite la generacion de tokens de audio en entornos sin dependencias de PyTorch. El modelo original cuenta con 124 millones de parametros y soporta dos idiomas: ingles e hindi.

La relevancia de este modelo reside en su tamano extremadamente reducido y su capacidad para generar audio de alta calidad con clonacion de estilo del hablante consistente, utilizando muestras de referencia de menos de 5 segundos. En una GPU RTX 6000 Ada alcanza velocidades de hasta 400 tokens por segundo (4 segundos de audio por segundo de computo) y un tiempo hasta el primer token inferior a 20 ms. Sin embargo, esta version ONNX solo incluye el modelo de lenguaje; el codec Mimi de Kyutai, necesario para decodificar la forma de onda, no es exportable a ONNX y requiere la ruta GGUF con llama.cpp para el pipeline completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (GPT-2) |
| Parametros totales | 124 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | int8 dinamica, fp32 |
| Idiomas soportados | ingles, hindi |
| Licencia | other (investigacion, no comercial) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es un GPT-2 de 124 M parametros adaptado para modelar audio como tokens. Utiliza un vocabulario ampliado de 70 016 entradas, donde los 50 257 primeros tokens corresponden al vocabulario original de GPT-2 y el resto se distribuyen en 8 codebooks de 2048 entradas cada uno, gestionados mediante un procesador de logits de codebooks alternados con offset 50257 y token de parada `[stop]`. El modelo genera logits de dimension (B, S, 70016) a partir de las entradas `input_ids`, `attention_mask` y `position_ids`.

El entrenamiento se realizo sobre datos de audio en ingles e hindi, e incluye capacidad de clonacion de voz con fragmentos de referencia de menos de 5 segundos. Para la decodificacion de la forma de onda se emplea el codec Mimi de Kyutai, que no es exportable a ONNX, por lo que esta version se limita a la generacion de tokens de audio y requiere la ruta GGUF + llama.cpp para obtener el audio final.

## Capacidades

- Generacion de voz a partir de texto (TTS) en ingles e hindi.
- Clonacion de voz con fragmentos de referencia cortos (menos de 5 segundos).
- Continuacion de audio (audio continuation) dentro de la familia de modelos Indri.
- Generacion de tokens de audio con 8 codebooks alternados (offset 50257, 2048 entradas por codebook).
- Reconocimiento de voz (ASR) como capacidad adicional del modelo base, aunque no se ha verificado en esta exportacion ONNX.
- Inferencia en CPU gracias a la cuantizacion int8 dinamica (342 MB).
- Compatibilidad con lotes de hasta 1000 secuencias con contexto completo de 1024 tokens en GPU RTX 6000 Ada.

## Casos de uso

- Asistentes de voz en dispositivos embebidos: el modelo de 124 M parametros puede ejecutarse en hardware con recursos limitados para generar respuestas de voz en tiempo real, aprovechando su baja latencia de primer token (menos de 20 ms).
- Doblaje con clonacion de voz: clonar la voz de un locutor o actor con una muestra de menos de 5 segundos y generar dialogo en ingles o hindi manteniendo la consistencia del estilo.
- Audiolibros y narracion automatizada: producir narracion de larga duracion con una voz consistente, gracias a la clonacion de estilo y la capacidad de continuacion de audio.
- Sistemas de accesibilidad: conversion de texto a voz en aplicaciones de lectura para personas con discapacidad visual, con despliegue local sin dependencias de servicios en la nube.
- Educacion de idiomas: generacion de ejemplos de pronunciacion en ingles e hindi para aplicaciones de aprendizaje de lenguas.
- Investigacion en TTS eficiente: servir como base de estudio para arquitecturas Transformer de tamano reducido en generacion de audio, especialmente en entornos con restricciones de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MOS, WER, RTF, etc.) en la informacion disponible. Segun el repositorio oficial, en una GPU RTX 6000 Ada se alcanzan velocidades de hasta 400 tokens por segundo (equivalentes a 4 segundos de audio por segundo de computo), un tiempo hasta el primer token inferior a 20 ms y soporte de lotes de aproximadamente 1000 secuencias con contexto completo de 1024 tokens.

## Requisitos de hardware

- Version int8 (342 MB): puede ejecutarse en CPU con memoria limitada, aunque la generacion de tokens sera mas lenta que en GPU.
- Version fp32 (739 MB): requiere mas memoria y una GPU con al menos 2 GB de VRAM para inferencia comoda.
- GPU de referencia: RTX 6000 Ada (segun el repositorio oficial), aunque GPUs de gama media como RTX 4090 o incluso tarjetas con 8 GB de VRAM pueden ejecutar el modelo sin problemas.
- Despliegue del modelo de lenguaje: ONNX Runtime, vLLM (si se adapta), o llama.cpp para la ruta GGUF completa.
- Despliegue completo: requiere el codec Mimi de Kyutai, que no se exporta en ONNX; la ruta GGUF + llama.cpp es la alternativa oficial.
- Latencia estimada: menos de 20 ms de tiempo hasta primer token y 400 tokens/s en RTX 6000 Ada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Indri-0.1-124M-TTS (ONNX) | 124 M | 1024 | en, hi | no comercial | ONNX |
| Indri-0.1-124M-TTS (GGUF) | 124 M | 1024 | en, hi | no comercial | GGUF |
| Indri-0.1-124M-TTS (original) | 124 M | 1024 | en, hi | no comercial | PyTorch |

No se dispone de modelos comparables de la misma categoria (TTS ultraligero con clonacion de voz) en la informacion disponible.

## Limitaciones y advertencias

- Licencia de investigacion y no comercial: prohibido el uso en produccion comercial sin autorizacion expresa de 11mlabs.
- El codec Mimi no es exportable a ONNX: esta version solo genera tokens de audio; la decodificacion de la forma de onda requiere la ruta GGUF + llama.cpp.
- Contexto limitado a 1024 tokens: la generacion de audio de larga duracion puede verse restringida por la ventana de contexto.
- Solo soporta dos idiomas (ingles e hindi), lo que limita su aplicacion en entornos multilingues.
- No se han publicado evaluaciones de sesgos o robustez para este modelo, por lo que se recomienda una evaluacion especifica antes de uso en produccion.
- Riesgo de alucinacion en la generacion de audio: puede producir salidas inconsistentes con la referencia si la muestra de clonacion es de baja calidad o el texto es ambiguo.

## Enlaces

- Repositorio HuggingFace (ONNX): https://huggingface.co/Bbkblo/indri-0.1-124m-tts-ONNX
- Modelo base en HuggingFace: https://huggingface.co/11mlabs/indri-0.1-124m-tts
- Variante GGUF en HuggingFace: https://huggingface.co/11mlabs/indri-0.1-124m-tts-GGUF
- Repositorio GitHub de inferencia: https://github.com/indri-voice/indri
- Documentacion alternativa en GitHub: https://github.com/cmeraki/indri/blob/master/README.md
