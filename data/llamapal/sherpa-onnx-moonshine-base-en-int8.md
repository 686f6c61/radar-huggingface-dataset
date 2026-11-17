# LlamaPal/sherpa-onnx-moonshine-base-en-int8

## Resumen

Este repositorio contiene una copia sin modificaciones de los ficheros ONNX cuantizados a int8 del modelo de reconocimiento automatico del habla (ASR) Moonshine Base, empaquetados para su uso con el runtime sherpa-onnx en dispositivos Android. El modelo original lo desarrolla Useful Sensors y esta pensado para transcripcion de voz en ingles de baja latencia y ejecucion completamente local. El autor de este repositorio, LlamaPal, lo publica como espejo de los ficheros de `csukuangfj/sherpa-onnx-moonshine-base-en-int8` para integrarlos en su aplicacion de chat por voz sin conexion para Android.

La relevancia de esta ficha es acotada: no se trata de un modelo nuevo ni de un entrenamiento propio, sino de un artefacto de despliegue (pesos ONNX int8 mas tokenizador) que permite ejecutar ASR en un telefono sin red ni cuenta de usuario. No hay informacion publicada en el repositorio sobre arquitectura interna, numero de parametros, datos de entrenamiento o resultados de benchmarks, por lo que muchos campos de esta ficha se marcan como no disponibles.

El repositorio ocupa 0,3 GB e incluye cinco ficheros: un modulo de preprocesado, un encoder int8, dos decoders int8 (con y sin cache) y el vocabulario de tokens. La licencia es MIT, heredada del proyecto original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR Moonshine Base de Useful Sensors; ficheros ONNX encoder/decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (ficheros `encode.int8.onnx`, `uncached_decode.int8.onnx`, `cached_decode.int8.onnx`); `preprocess.onnx` sin cuantizacion indicada |
| Idiomas soportados | ingles (sufijo `-en` en el nombre del modelo; no hay lista de idiomas publicada) |
| Licencia | MIT |
| Formato de pesos | ONNX (int8), mas `tokens.txt` como vocabulario |

Desglose de ficheros del repositorio:

| Fichero | Tamano | SHA-256 |
|---|---|---|
| `preprocess.onnx` | 14 MB | `ffa630d395c5ccf76f5d4954be5b882df76aaf6491519ec01fd82ea7a3819fb2` |
| `encode.int8.onnx` | 50 MB | `7e38770f776f2e5583a53b052936005df2ba5c833d7e09c2a5fd796b94bf73e2` |
| `uncached_decode.int8.onnx` | 122 MB | `c01f4b35093bcac20d352d23a75a539e772964579f9d024a90e5e6f09cae9987` |
| `cached_decode.int8.onnx` | 100 MB | `2db74e51cedf64a8b1be3c8192e0bb5e4923af0e90bd9e87f8e8771873f8ea03` |
| `tokens.txt` | 437 KB | `1165c2aeb9f72f457a83be2d459a09054f27490acd9b41bd43794dfd25e296ea` |

## Arquitectura y entrenamiento

No hay informacion en el repositorio sobre la arquitectura interna del modelo mas alla de la estructura de ficheros: un modulo de preprocesado de audio, un encoder y dos variantes de decoder (con cache y sin cache), lo que es coherente con un esquema encoder-decoder autoregresivo para ASR. Tampoco se detallan datos de entrenamiento, numero de tokens, composicion del dataset ni si hubo ajuste por RLHF o DPO.

El unico detalle tecnico verificable es el proceso de publicacion: se trata de una copia byte a byte de los ficheros de `csukuangfj/sherpa-onnx-moonshine-base-en-int8` en el commit `052b0798ad1b`, con los mismos hashes SHA-256. La innovacion practica no esta en el modelo sino en el empaquetado: la existencia de un decoder con cache (`cached_decode.int8.onnx`) sugiere decodificacion incremental para reducir coste por token en streaming, habitual en despliegues sherpa-onnx sobre movil.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) en ingles.
- Ejecucion completamente offline en dispositivo, sin llamadas de red.
- Inferencia sobre runtime sherpa-onnx con pesos ONNX int8.
- Decodificacion con cache para flujos de streaming (fichero `cached_decode.int8.onnx`).
- Integracion en aplicaciones Android mediante el ecosistema sherpa-onnx.
- No se documenta soporte de tool calling, agentes, vision, audio generativo ni modo de razonamiento; es un modelo ASR, no un LLM conversacional.

## Casos de uso

- Dictado por voz en aplicaciones Android: el modelo transcribe audio del microfono localmente, sin enviar grabaciones a servidores, lo que encaja en apps de notas o mensajeria con requisitos de privacidad.
- Asistente de voz offline en el telefono: combinado con un LLM local, permite cadenas de voz a texto y texto a voz sin conexion, util en entornos sin cobertura o con datos sensibles.
- Subtitulado en tiempo real de audio capturado en el dispositivo: la variante con cache del decoder facilita la transcripcion incremental mientras se graba.
- Accesibilidad: conversion de voz a texto para usuarios con dificultades motoras o auditivas en aplicaciones moviles, con procesamiento local y sin cuotas de API.
- Prototipado de pipelines ASR en movil: sirve como bloque de referencia para validar latencia y consumo en Android antes de elegir un modelo mayor o un servicio en la nube.
- Investigacion sobre ASR en el borde: al ser un artefacto ONNX int8 pequeno (0,3 GB de repositorio), es util para experimentos de cuantizacion y comparativas de rendimiento en hardware movil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el objetivo declarado es ejecucion en telefono Android, no en GPU de servidor.
- Huella en disco de los pesos: aproximadamente 286 MB sumando los cuatro ficheros ONNX int8 (14 + 50 + 122 + 100 MB) mas 437 KB de vocabulario.
- GPU recomendadas: no aplica para el caso de uso previsto; no hay datos de despliegue en A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: no documentada; el runtime objetivo es sherpa-onnx en CPU movil.
- Opciones de despliegue: sherpa-onnx (runtime nativo para Android y otras plataformas); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a un modelo ASR ONNX.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de otros modelos ASR comparables (por ejemplo, Whisper en sus distintas variantes o el propio Moonshine en formato completo) con parametros, contexto o rendimiento verificables, por lo que no se puede construir una comparativa rigurosa sin inventar cifras.

## Limitaciones y advertencias

- Solo ingles: el sufijo `-en` del nombre indica un modelo entrenado para ingles; no hay lista de idiomas publicada ni evidencia de soporte multilingue.
- Es un espejo, no un modelo original: cualquier correccion o actualizacion debe buscarse en el repositorio de origen de Useful Sensors o en `csukuangfj/sherpa-onnx-moonshine-base-en-int8`.
- Sin datos de evaluacion: no hay benchmarks ni metricas de error (WER) publicadas en este repositorio, lo que impide estimar su calidad frente a alternativas.
- Riesgo de transcripciones erroneas en audio con ruido, acentos no cubiertos por el entrenamiento o vocabulario tecnico; como todo ASR, puede alucinar palabras plausibles en segmentos ambiguos.
- Restricciones de licencia: MIT permite uso comercial y modificacion con atribucion; aun asi, conviene revisar el fichero `LICENSE` del repositorio y los terminos del proyecto original.
- Dependencia del runtime: los ficheros solo son utiles con sherpa-onnx u otro runtime compatible con el grafo ONNX concreto; no son pesos de transformers ni de llama.cpp.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin senales de uso comunitario ni soporte del autor mas alla del espejo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LlamaPal/sherpa-onnx-moonshine-base-en-int8
- Repositorio de origen (csukuangfj): https://huggingface.co/csukuangfj/sherpa-onnx-moonshine-base-en-int8/tree/052b0798ad1bf046a140fdd4efcd9426530fa3f5
- Proyecto original Moonshine (Useful Sensors): https://github.com/usefulsensors/moonshine
- Aplicacion LlamaPal en Google Play: https://play.google.com/store/apps/details?id=com.vishistv.llamapal
- Sitio web de LlamaPal: https://llamapal.cc/
- Instagram de LlamaPal: https://www.instagram.com/llamapalhq/
