# Harsha001/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-ROCmFPX

## Resumen

NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-ROCmFPX es una cuantizacion en formato GGUF del modelo de reconocimiento automatico del habla (ASR) nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B, publicada por el usuario Harsha001. El modelo original combina un codificador de voz con un decodificador de lenguaje Nemotron 3.5 de arquitectura MoE (mixture of experts) de 30B parametros totales y aproximadamente 4B activos, disenado para transcripcion multilingue de audio a texto.

Esta publicacion no es un modelo nuevo, sino una conversion de pesos orientada a GPUs AMD mediante el fork ROCmFPX de llama.cpp, con tipos de cuantizacion propios (ROCmFPX 8-bit, 6-bit y 4-bit en expertos) pensados para ejecutarse en hardware como el AMD Strix Halo. Se distribuye junto al codificador de voz en F16, que es obligatorio para cualquier inferencia, y requiere una version concreta de ROCmFPX (commit `367cdf8bf` o posterior) por el uso de tensores de escala por tensor.

Es relevante para desarrolladores que quieran desplegar transcripcion multilingue de alta calidad en hardware AMD sin depender de CUDA, aunque el propio autor advierte que las cuantizaciones estandar de llama.cpp (Q8_0) ofrecen una calidad igual o ligeramente superior en sus pruebas, por lo que el valor principal de esta ficha es la compatibilidad con el ecosistema ROCmFPX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de voz + decodificador de lenguaje Nemotron 3.5 MoE (transformer con mezcla de expertos) |
| Parametros totales | 30B en el modelo original (el dato de safetensors del repo, 783.857.231, corresponde a un componente parcial, no al total) |
| Parametros activos | Aproximadamente 4B (segun la nomenclatura A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ROCmFPX Q8_0, Q6_K (expertos 6-bit, resto 8-bit), Q4_0 con expertos ROCmFP4 (4-bit, resto 8-bit); codificador en F16 |
| Idiomas soportados | en, de, fr, es, it, pt, nl, pl, cs, sk, hi, ja, ko, zh, multilingue |
| Licencia | OpenMDW License 1.1 (openmdw-1.1) |
| Formato de pesos | GGUF (con tensores `.scale` por tensor, requiere ROCmFPX) |

## Arquitectura y entrenamiento

El modelo original es un sistema ASR compuesto por dos partes: un codificador de voz que procesa el audio y un decodificador de lenguaje Nemotron 3.5 con arquitectura MoE de 30B parametros totales y unos 4B activos por token. La nomenclatura A4B indica esa activacion dispersa, que reduce el coste computacional por token frente a un modelo denso del mismo tamano. Esta publicacion conserva el codificador original de NVIDIA en F16 sin modificaciones y cuantiza unicamente el decodificador.

La conversion se realizo en dos pasos: primero se convirtio el decodificador a BF16 con el conversor propio de NVIDIA incluido en NeMo-Speech.cpp (`conversion/`) y despues se cuantizo con ROCmFPX usando `LLAMA_ROCMFPX_TENSOR_SCALE=1` y una importance matrix. Los embeddings de tokens se mantienen en Q8_0 y la capa de prediccion multi-token se conserva en los ficheros. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original.

## Capacidades

- Transcripcion de audio a texto (ASR) en 14 idiomas: ingles, aleman, frances, espanol, italiano, portugues, neerlandes, polaco, checo, eslovaco, hindi, japones, coreano y chino.
- Procesamiento de audio mediante un codificador de voz dedicado, separado del decodificador de lenguaje.
- Decodificacion autoregresiva con soporte de prediccion multi-token (la capa MTP se mantiene en los ficheros).
- Ejecucion en CPU y en GPUs AMD mediante ROCmFPX; el autor solo ha probado la compilacion para CPU.
- Compatibilidad con el binario `nemo-speech` de NeMo-Speech.cpp para transcripcion por linea de comandos con seleccion de idioma (`-l`).
- No se documentan capacidades de tool calling, agentes, vision ni audio en tiempo real en la informacion disponible.

## Casos de uso

- Transcripcion de reuniones y actas: el modelo puede procesar ficheros de audio completos (`nemo-speech transcribe meeting.wav`) y generar la transcripcion con seleccion explicita de idioma, util para equipos multilingues en Europa.
- Subtitulado de contenido audiovisual: al soportar 14 idiomas, permite generar subtitulos para videos en castellano, aleman, frances o japones con un unico modelo y flujo de trabajo.
- Archivado y busqueda de grabaciones: transcripcion por lotes de llamadas o entrevistas para indexar el contenido textual y habilitar busqueda sobre audio historico.
- Atencion al cliente con analitica: conversion de grabaciones de call center a texto para analisis de calidad y deteccion de temas, ejecutable en infraestructura AMD sin depender de CUDA.
- Investigacion en ASR multilingue: punto de partida cuantizado para experimentar con el decodificador MoE Nemotron 3.5 en entornos ROCm y comparar WER frente a BF16.
- Despliegue en estaciones de trabajo con AMD Strix Halo: la variante Q4_0 con expertos ROCmFP4 (18,7 GB) permite ejecutar el modelo en una maquina de 128 GB de memoria unificada sin GPU NVIDIA.
- Prototipado en CPU: la version Q8_0 ROCmFPX funciona en CPU (probada en el ARM de un DGX Spark), adecuada para validaciones y pipelines de bajo volumen.

## Benchmarks y rendimiento

Datos publicados por el autor sobre 73 clips limpios en ingles de LibriSpeech (`hf-internal-testing/librispeech_asr_dummy`), CPU, decodificacion greedy. WER mas bajo es mejor; KLD y "same top" comparan las predicciones del decodificador con BF16 sobre texto.

| Decodificador | WER | KLD vs BF16 | Same top token |
|---|---|---|---|
| BF16 (referencia) | 2,09 % | 0 | 100 % |
| stock Q8_0 | 1,91 % | 0,0124 | 95,6 % |
| NVIDIA IQ4_NL expertos | 2,17 % | 0,0338 | 92,1 % |
| Q8_0_ROCMFPX | 2,43 % | 0,0175 | 94,4 % |
| Q6_K_ROCMFPX | 2,35 % | 0,0228 | 93,6 % |
| Q4_0_ROCMFP4_STRIX | 2,35 % | 0,0411 | 91,2 % |

El autor senala que en 73 clips cortos un error de una palabra mueve el WER aproximadamente 0,07 %, por lo que todas las variantes transcriben de forma equivalente a BF16. La muestra de JFK ("ask not what your country can do for you") se reproduce palabra por palabra con Q8_0_ROCMFPX. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) porque no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM/memoria estimada: Q8_0_ROCMFPX 34,0 GB; Q6_K_ROCMFPX 27,6 GB; Q4_0_ROCMFP4_STRIX 18,7 GB; mas 1,67 GB del codificador F16 obligatorio en todos los casos.
- GPU recomendadas: no se especifican modelos concretos; el autor orienta la variante Q4_0 a AMD Strix Halo (128 GB de memoria unificada) y menciona que las cifras en GPU AMD de la comunidad estan pendientes.
- Cabe en GPU de consumo: no hay datos confirmados; la variante de 18,7 GB podria ajustarse en GPUs con 24 GB o mas, pero no esta verificado por el autor.
- Opciones de despliegue: NeMo-Speech.cpp (probado en el commit `d8a1abf`) compilado contra ROCmFPX, con el parche `nemo-speech-cpp-rocmfpx.patch` que desactiva la decodificacion especulativa. No se menciona soporte en vLLM, Ollama o TGI.
- Latencia y throughput: solo se midio en la CPU ARM de un NVIDIA DGX Spark, donde el tipo ROCmFPX de 6 bits resulta lento por falta de kernel para ARM. No hay cifras de latencia ni throughput publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (Nemotron 3.5 Transcribe 30B-A4B ROCmFPX) | 30B totales, ~4B activos | no disponible | 14 | OpenMDW 1.1 | GGUF ROCmFPX |
| nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B (original) | 30B totales, ~4B activos | no disponible | 14 | OpenMDW 1.1 | safetensors/BF16 |
| AtomicChat/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-GGUF | 30B totales, ~4B activos | no disponible | 14 | OpenMDW 1.1 | GGUF estandar (Q8_0 etc.) |

La comparativa se limita a variantes del mismo modelo porque no se dispone de datos de benchmarks frente a otros sistemas ASR en la informacion proporcionada. Frente a la version original, esta cuantizacion reduce el peso a 18,7-34 GB y anade compatibilidad con ROCmFPX, a costa de una ligera perdida de fidelidad (KLD 0,0175-0,0411 frente a BF16). Frente a la version GGUF estandar de AtomicChat, el propio autor reconoce que su Q8_0 stock obtiene mejor WER (1,91 % frente a 2,43 %) y menor KLD.

## Limitaciones y advertencias

- Solo se ha probado la compilacion para CPU; no hay validacion publicada en GPU AMD, que es el objetivo declarado de la cuantizacion.
- Requiere ROCmFPX en el commit `367cdf8bf` o posterior y el parche `nemo-speech-cpp-rocmfpx.patch`; no funciona con llama.cpp estandar.
- La decodificacion especulativa queda desactivada en este fork, lo que puede reducir el rendimiento frente a configuraciones con drafter.
- El tipo ROCmFPX de 6 bits es lento en CPU ARM por ausencia de kernel especifico.
- La calidad medida en ingles es ligeramente inferior a la cuantizacion Q8_0 estandar; el autor recomienda esta ultima si no se necesita ROCmFPX.
- Los benchmarks se limitan a 73 clips cortos de LibriSpeech en ingles; no hay evaluacion publicada en los otros 13 idiomas ni en audio con ruido, acentos o solapamientos.
- Riesgo de alucinacion y errores de transcripcion inherente a los modelos ASR, no cuantificado en la informacion disponible.
- Licencia OpenMDW 1.1: es necesario revisar sus terminos para uso comercial; los ficheros son versiones modificadas (cuantizadas) de los pesos originales de NVIDIA.
- El dato de parametros totales del repo (783.857.231) no coincide con los 30B declarados y probablemente corresponde a un subcomponente; conviene no usarlo como referencia del tamano real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Harsha001/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-ROCmFPX
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Version GGUF estandar: https://huggingface.co/AtomicChat/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-GGUF
- Runtime ROCmFPX: https://github.com/HarshaVardhan3002/ROCmFPX
- NeMo-Speech.cpp: https://github.com/NVIDIA/NeMo-Speech.cpp
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
