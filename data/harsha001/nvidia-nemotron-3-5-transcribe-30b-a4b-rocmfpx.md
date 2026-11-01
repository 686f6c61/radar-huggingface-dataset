# Harsha001/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-ROCmFPX

## Resumen

NVIDIA Nemotron 3.5 Transcribe 30B-A4B ROCmFPX es una cuantizacion en formato GGUF del modelo de reconocimiento automatico del habla (ASR) nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B, publicada por el usuario Harsha001. El modelo original combina un codificador de voz con un decodificador de lenguaje Nemotron 3.5 de arquitectura MoE (Mixture of Experts) de 30B parametros totales y aproximadamente 4B activos. Esta version concreta esta orientada a la bifurcacion ROCmFPX de llama.cpp, con tipos de peso optimizados para GPUs AMD.

El interes de esta publicacion es practico: ofrece los pesos del decodificador en cuantizaciones de 8, 6 y 4 bits, ademas del codificador de voz en F16, lo que permite ejecutar un modelo ASR de gran tamano en hardware con memoria limitada. La model card reporta que la calidad de transcripcion (WER) de las versiones cuantizadas es practicamente equivalente a la del modelo en BF16 sobre el conjunto de prueba empleado.

Conviene senalar que esta es una republicacion de terceros, no oficial de NVIDIA. La licencia del modelo original es OpenMDW 1.1, y los archivos incluidos son versiones modificadas (cuantizadas) de los pesos originales. El modelo esta pensado para transcripcion multilingue en 13 idiomas y se ejecuta mediante NeMo-Speech.cpp compilado contra el arbol ROCmFPX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de voz + decodificador de lenguaje Nemotron 3.5 MoE |
| Parametros totales | 30B (segun model card); 783.857.231 en safetensors del repo |
| Parametros activos | Aproximadamente 4B (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (ROCmFPX 8-bit), Q6_K (expertos 6-bit, resto 8-bit), Q4_0 (expertos 4-bit, resto 8-bit, para Strix Halo); codificador en F16 |
| Idiomas soportados | en, de, fr, es, it, pt, nl, pl, cs, sk, hi, ja, ko, zh, multilingual |
| Licencia | OpenMDW 1.1 (openmdw-1.1) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de dos componentes: un codificador de voz que procesa la senal de audio y un decodificador de lenguaje basado en Nemotron 3.5 con arquitectura MoE, de 30B parametros totales y unos 4B activos por token. La model card menciona que los archivos conservan la capa de prediccion multi-token (multi-token prediction). No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

En cuanto al proceso de cuantizacion, el decodificador se convirtio primero a BF16 con el conversor propio de NVIDIA incluido en NeMo-Speech.cpp y despues se cuantizo con ROCmFPX usando `LLAMA_ROCMFPX_TENSOR_SCALE=1` y una importance matrix. Los embeddings de tokens se mantienen en Q8_0 y el codificador es el F16 original de NVIDIA sin modificar. Los archivos del decodificador incorporan tensores de escala por tensor (`.scale`) y requieren ROCmFPX en el commit `367cdf8bf` o posterior.

## Capacidades

- Reconocimiento automatico del habla (ASR) y transcripcion de audio a texto.
- Soporte multilingue en 13 idiomas: ingles, aleman, frances, espanol, italiano, portugues, neerlandes, polaco, checo, eslovaco, hindi, japones, coreano y chino.
- Procesamiento de audio de entrada mediante codificador de voz dedicado.
- Decodificacion de lenguaje con arquitectura MoE, con capacidad de generacion de texto a partir de las representaciones de audio.
- Capa de prediccion multi-token conservada en los archivos cuantizados.
- No se documenta en la informacion disponible soporte de tool calling, function calling, agentes, vision ni audio bidireccional.

## Casos de uso

- Transcripcion de reuniones: el modelo puede convertir grabaciones de audio de reuniones en texto, seleccionando el idioma con el parametro `-l`, como muestra el ejemplo de la model card (`nemo-speech transcribe meeting.wav`).
- Subtitulado multilingue: al cubrir 13 idiomas, permite generar subtitulos para contenido audiovisual en distintos mercados sin cambiar de modelo.
- Archivado y busqueda de contenido hablado: transcripcion de podcasts, entrevistas o grabaciones para indexacion y busqueda textual posterior.
- Atencion al cliente basada en voz: conversion de llamadas o notas de voz a texto para su analisis, clasificacion o registro en sistemas CRM.
- Documentacion clinica o legal dictada: transcripcion de dictados en entornos donde se requiere procesamiento local por privacidad, usando despliegue en hardware propio.
- Investigacion en ASR: evaluacion y ajuste de un modelo ASR de gran tamano en entornos con GPUs AMD, gracias a los tipos de peso ROCmFPX.
- Despliegue en hardware de consumo o estaciones AMD: la variante Q4_0 orientada a Strix Halo permite ejecutar el modelo en equipos con memoria unificada limitada.

## Benchmarks y rendimiento

La model card reporta WER sobre 73 clips limpios en ingles de LibriSpeech (`hf-internal-testing/librispeech_asr_dummy`), en CPU, decodificacion greedy (menor es mejor), y KLD y coincidencia de token superior frente a BF16 en texto.

| Decodificador | WER | KLD vs BF16 | Mismo token superior |
|---|---|---|---|
| BF16 (referencia) | 2,09 % | 0 | 100 % |
| stock Q8_0 | 1,91 % | 0,0124 | 95,6 % |
| NVIDIA IQ4_NL expertos | 2,17 % | 0,0338 | 92,1 % |
| Q8_0_ROCMFPX | 2,43 % | 0,0175 | 94,4 % |
| Q6_K_ROCMFPX | 2,35 % | 0,0228 | 93,6 % |
| Q4_0_ROCMFP4_STRIX | 2,35 % | 0,0411 | 91,2 % |

La model card advierte que en 73 clips cortos un error de una palabra mueve el WER aproximadamente 0,07 %, por lo que todos los archivos transcriben de forma similar a BF16. La velocidad solo se midio en la CPU ARM de un NVIDIA DGX Spark, donde el tipo ROCmFPX de 6 bits resulta lento por falta de kernel para ARM; no se aportan cifras de rendimiento en GPU AMD.

## Requisitos de hardware

- VRAM estimada segun el archivo del decodificador: Q8_0 unos 34,0 GB, Q6_K unos 27,6 GB, Q4_0 unos 18,7 GB; mas el codificador F16 de 1,67 GB.
- El tamano total del repositorio es de 81,9 GB, ya que incluye todas las variantes.
- GPU recomendadas: no especificadas en la informacion disponible; los tipos ROCmFPX estan orientados a GPUs AMD y la variante Q4_0 se etiqueta para Strix Halo.
- En GPU de consumo: la variante Q4_0 (18,7 GB + 1,67 GB) podria encajar en GPUs con 24 GB de VRAM o en sistemas con memoria unificada como Strix Halo; no se confirma en la informacion disponible.
- Opciones de despliegue: NeMo-Speech.cpp de NVIDIA compilado contra ROCmFPX (probado en el commit `d8a1abf` de NeMo-Speech.cpp y `367cdf8bf` de ROCmFPX). Para tipos estandar de llama.cpp existe la alternativa AtomicChat/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-GGUF.
- Latencia y throughput: solo se menciona que el tipo de 6 bits ROCmFPX es lento en CPU ARM del DGX Spark; no hay cifras concretas de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| NVIDIA Nemotron 3.5 Transcribe 30B-A4B (BF16) | 30B (aprox. 4B activos) | no disponible | BF16 | OpenMDW 1.1 | Referencia de calidad, WER 2,09 % |
| AtomicChat/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-GGUF | 30B (aprox. 4B activos) | no disponible | GGUF estandar | OpenMDW 1.1 | Tipos stock de llama.cpp; Q8_0 con WER 1,91 % |
| Esta version (ROCmFPX) | 30B (aprox. 4B activos) | no disponible | GGUF ROCmFPX | OpenMDW 1.1 | Optimizada para GPUs AMD; requiere fork ROCmFPX |

No se dispone en la informacion proporcionada de otros modelos ASR comparables con datos verificables de parametros y rendimiento.

## Limitaciones y advertencias

- Es una republicacion no oficial de terceros; la autoria del modelo original es de NVIDIA.
- Los archivos son versiones modificadas (cuantizadas) de los pesos originales, con posibles diferencias de calidad frente a BF16.
- Requiere el fork ROCmFPX de llama.cpp en el commit `367cdf8bf` o posterior; no funciona con llama.cpp estandar.
- El parche incluido desactiva la decodificacion especulativa (drafter) porque su llamada al codigo comun de llama.cpp difiere en ROCmFPX.
- Solo se ha probado la compilacion para CPU; no hay validacion publicada en GPU AMD.
- El tipo de 6 bits ROCmFPX es lento en CPU ARM por ausencia de kernel.
- La evaluacion de calidad se limita a 73 clips cortos en ingles de LibriSpeech; no hay evaluacion publicada en los otros 12 idiomas.
- Riesgo de alucinacion y errores de transcripcion inherentes a los modelos ASR, especialmente en audio ruidoso o con acentos no representados en el conjunto de prueba.
- Sesgos: no se documentan en la informacion disponible.
- Licencia OpenMDW 1.1: deben revisarse sus terminos para uso comercial; la model card incluye LICENSE, THIRD_PARTY_NOTICES.md y licenses/ copiados del repositorio original.
- La longitud de contexto no esta disponible, lo que limita la planificacion de transcripciones de audio muy largas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Harsha001/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-ROCmFPX
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Alternativa GGUF estandar: https://huggingface.co/AtomicChat/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-GGUF
- Runtime ROCmFPX: https://github.com/HarshaVardhan3002/ROCmFPX
- NVIDIA NeMo-Speech.cpp: https://github.com/NVIDIA/NeMo-Speech.cpp
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
