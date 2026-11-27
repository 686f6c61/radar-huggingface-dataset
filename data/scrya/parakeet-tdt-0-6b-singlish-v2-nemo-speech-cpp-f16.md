# Scrya/parakeet-tdt-0.6b-singlish-v2-nemo-speech-cpp-f16

## Resumen

`Scrya/parakeet-tdt-0.6b-singlish-v2-nemo-speech-cpp-f16` es una distribucion en formato GGUF f16 del modelo de reconocimiento automatico del habla (ASR) `Scrya/parakeet-tdt-0.6b-singlish-v2`, un ajuste fino de NVIDIA Parakeet-TDT-0.6B-v3 sobre 1.386 horas de ingles de Singapur conversacional procedente de cinco partes del National Speech Corpus (NSC) de IMDA. El ajuste esta orientado especificamente a audio de salas de reunion, y esta version 2 corrige errores respecto a la version 1.

El modelo emplea una arquitectura transducer TDT (Token-and-Duration Transducer) con 637.329.158 parametros, emite texto con puntuacion y mayusculas, y escribe los numeros con palabras ("twenty five" en lugar de "25"). Esta pensado para transcripcion de reuniones en entornos donde se habla singlish, una variante del ingles con fuerte influencia del ingles de Singapur.

La relevancia de este repositorio concreto es el empaquetado: convierte el modelo original (safetensors y `.nemo`) en un unico fichero GGUF de 1,30 GB ejecutable con NeMo-Speech.cpp 0.3.0, el runtime en C++ de NVIDIA para modelos de voz de NeMo, lo que permite despliegue en GPU de consumo con una velocidad de 176x tiempo real en una RTX 5090.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer transducer TDT (Token-and-Duration Transducer) |
| Parametros totales | 637.329.158 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16 (este repo); q8_0 disponible en repo hermano |
| Idiomas soportados | en (ingles de Singapur / singlish) |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF f16 (1,30 GB); safetensors y `.nemo` en el repo principal |
| Runtime | NeMo-Speech.cpp 0.3.0 |
| Entrada | audio (ASR) |
| Salida | texto con puntuacion, mayusculas y numeros escritos con palabras |

## Arquitectura y entrenamiento

El modelo base es NVIDIA Parakeet-TDT-0.6B-v3, un transducer TDT. En lugar de predecir solo tokens, un TDT predice conjuntamente el token y su duracion, lo que reduce el numero de pasos de decodificacion frente a un CTC o un transducer RNN-T clasico. El ajuste fino se realizo sobre 1.386 horas de ingles de Singapur conversacional extraidas de cinco partes del National Speech Corpus (NSC) de IMDA, con datos y configuracion de entrenamiento seleccionados para discurso en salas de reunion.

La informacion disponible no detalla el numero de tokens de entrenamiento del preentrenamiento original, la composicion completa del dataset ni si se aplico RLHF o DPO (no aplica de forma habitual en ASR). El resultado del ajuste se evalua con WER normalizado (minusculas, sin puntuacion, reglas ortograficas del NSC) y WER formateado (texto tal cual, contando mayusculas y puntuacion). La decodificacion de referencia del modelo original usa transformers en fp32 con decodificacion greedy y limite de 3 tokens por frame de audio; este fichero GGUF reproduce esa misma salida.

## Capacidades

- Reconocimiento automatico del habla en ingles de Singapur (singlish) conversacional, con enfasis en audio de salas de reunion.
- Transcripcion con puntuacion y mayusculas automaticas.
- Normalizacion de numeros a palabras ("twenty five" en lugar de "25").
- Procesamiento por lotes de ficheros y carpetas mediante el CLI de NeMo-Speech.cpp, con salida en JSON y concurrencia configurable.
- Ejecucion en GPU CUDA y, presumiblemente, en CPU mediante el runtime C++, aunque la model card solo documenta el flag `--device cuda:0`.
- No soporta tool calling, agentes, vision ni audio generation: es un modelo puramente ASR.
- Capacidad multilingue limitada al ingles; no se documentan otros idiomas.

## Casos de uso

- Transcripcion de reuniones en Singapur y el sudeste asiatico: el ajuste sobre 1.386 horas de NSC conversacional y la seleccion de datos orientada a salas de reunion lo hacen adecuado para actas y resumenes posteriores de reuniones donde los participantes hablan singlish.
- Subtitulado y archivado de reuniones corporativas: el CLI acepta carpetas completas con `--concurrency 16` y salida JSON, lo que permite procesar grandes volumenes de grabaciones en lote.
- Pipelines de post-procesado con LLM: la salida ya lleva puntuacion y mayusculas, de modo que puede alimentar directamente un modelo de resumen o un sistema de busqueda sin una etapa adicional de formateo.
- Despliegue en hardware de consumo: con 1,30 GB en f16 y 176x tiempo real en una RTX 5090, cabe en estaciones de trabajo con GPU consumer para transcripcion local sin depender de la nube.
- Investigacion en ASR de variedades del ingles: sirve como punto de comparacion reproducible (WER normalizado y formateado por particion del NSC) frente a modelos genericos.
- Evaluacion de runtimes: util para medir la fidelidad de NeMo-Speech.cpp frente a transformers, ya que la model card documenta que reproduce exactamente la salida del modelo original en 4.892 de 5.000 clips.
- Transcripcion verbatim de entrevistas y grupos focales: el flag `--verbatim` evita que el runtime reescriba el texto, preservando la forma literal de lo dicho.

## Benchmarks y rendimiento

Evaluacion sobre una muestra de 5.000 clips (1.000 por cada una de las cinco partes del NSC, 7,15 horas en total), con pesos iguales por parte. La comparacion es contra el modelo original en transformers (fp32, greedy, limite de 3 tokens por frame).

| Modelo | WER normalizado | WER formateado | Diferencia normalizada | Velocidad (RTX 5090) |
|---|---:|---:|---|---:|
| Original (transformers, fp32) | 8,25% | 15,27% | — | no disponible |
| Este fichero f16 (NeMo-Speech.cpp) | 8,25% | 15,27% | 0,00 [-0,03, +0,04] | 176x tiempo real |

Desglose por particion del NSC:

| Particion | Original normalizado | Este f16 normalizado | Original formateado | Este f16 formateado |
|---|---:|---:|---:|---:|
| Part 3 SDM | 9,12% | 9,11% | 15,45% | 15,45% |
| Part 3 Same Room | 10,45% | 10,49% | 15,67% | 15,73% |
| Part 4 | 14,27% | 14,26% | 22,56% | 22,57% |
| Part 5 | 6,19% | 6,20% | 12,57% | 12,57% |
| Part 6.3 | 6,00% | 6,00% | 13,71% | 13,70% |

Comparacion con la version 1 del mismo ajuste (f16, mismo runtime y misma muestra):

| Particion | v1 normalizado | v2 normalizado | Diferencia | v1 formateado | v2 formateado | Diferencia |
|---|---:|---:|---|---:|---:|---|
| Part 3 SDM | 9,89% | 9,11% | -0,78 [-1,20, -0,38] | 16,56% | 15,45% | -1,11 [-1,64, -0,63] |
| Part 3 Same Room | 10,78% | 10,49% | -0,30 [-0,63, +0,01] | 16,11% | 15,73% | -0,37 [-0,77, +0,01] |
| Part 4 | 14,70% | 14,26% | -0,44 [-0,91, +0,02] | 23,22% | 22,57% | -0,65 [-1,39, -0,02] |
| Part 5 | 6,38% | 6,20% | -0,19 [-0,35, -0,01] | 12,94% | 12,57% | -0,36 [-0,59, -0,12] |
| Part 6.3 | 6,08% | 6,00% | -0,08 [-0,23, +0,08] | 14,01% | 13,70% | -0,31 [-0,62, -0,03] |
| Todas las partes | 8,52% | 8,25% | -0,27 [-0,39, -0,15] | 15,75% | 15,27% | -0,48 [-0,66, -0,30] |

Fidelidad de salida: este fichero escribe exactamente el mismo texto que el modelo original en 4.892 de los 5.000 clips, frente a 4.734 del fichero q8_0. Los intervalos entre corchetes son intervalos de confianza al 95% por bootstrap sobre hablantes.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 637 millones de parametros en f16 el peso del modelo ronda 1,3 GB, por lo que la VRAM necesaria es modesta y el cuello de botella sera el buffer de audio y el runtime.
- GPU recomendada en la model card: RTX 5090, con 176x tiempo real medido sobre el lote completo de 5.000 clips (incluyendo arranque del runtime y carga del modelo).
- Cabe en GPU consumer: si, dado el tamano del fichero (1,30 GB) y el consumo medido en una RTX 5090; no se documentan mediciones en GPUs de gama inferior.
- Opciones de despliegue: NeMo-Speech.cpp 0.3.0 (CLI `nemo-speech transcribe`, con `--device cuda:0`, `--verbatim`, `--format json`, `--output-dir` y `--concurrency`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no estan orientados a modelos transducer de voz.
- Latencia y throughput: 176x tiempo real en RTX 5090 para el lote de 5.000 clips; no se publica latencia por clip individual.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (muestra NSC) | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| Este f16 (v2) | 637 M | no disponible | 8,25% norm. / 15,27% form. | cc-by-4.0 | GGUF f16 / NeMo-Speech.cpp |
| v2 q8_0 (repo hermano) | 637 M | no disponible | mismo resultado en la muestra | cc-by-4.0 | GGUF q8_0 / NeMo-Speech.cpp |
| v1 f16 (repo hermano) | 637 M | no disponible | 8,52% norm. / 15,75% form. | cc-by-4.0 | GGUF f16 / NeMo-Speech.cpp |
| Modelo original v2 (transformers) | 637 M | no disponible | 8,25% norm. / 15,27% form. | cc-by-4.0 | safetensors / `.nemo` / transformers |

No se dispone de datos de benchmarks frente a otros modelos ASR de la misma categoria (por ejemplo, Whisper u otros Parakeet) en la informacion proporcionada.

## Limitaciones y advertencias

- Dominio restringido: el ajuste esta orientado a ingles de Singapur conversacional en salas de reunion; el rendimiento fuera de ese dominio (otros acentos, otros idiomas, audio limpio de estudio) no esta documentado.
- Solo ingles: la model card declara unicamente `en`; no hay soporte multilingue.
- Formato de salida fijo: los numeros se escriben con palabras, lo que puede requerir post-procesado si se necesitan cifras.
- La muestra de evaluacion (1.000 clips por parte, 7,15 horas) es pequena y su WER es inferior al de los conjuntos de test completos, mayoritariamente de la Part 3; algunas diferencias por particion tienen intervalos que incluyen cero.
- Riesgo de alucinacion: no evaluado en la informacion disponible; en ASR los errores se manifiestan como sustituciones, omisiones e inserciones, cuantificadas por el WER.
- Sesgos: no documentados; el corpus de entrenamiento (NSC de IMDA) condiciona el sesgo hacia hablantes y contextos de Singapur.
- Licencia cc-by-4.0: permite uso comercial con atribucion; conviene verificar las condiciones del modelo base NVIDIA Parakeet-TDT-0.6B-v3 y del corpus NSC antes de un despliegue en produccion.
- Dependencia de runtime: requiere NeMo-Speech.cpp 0.3.0; no hay garantia de compatibilidad con otras versiones ni con otros motores de inferencia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Scrya/parakeet-tdt-0.6b-singlish-v2-nemo-speech-cpp-f16
- Modelo base (safetensors y `.nemo`): https://huggingface.co/Scrya/parakeet-tdt-0.6b-singlish-v2
- Version cuantizada q8_0: https://huggingface.co/Scrya/parakeet-tdt-0.6b-singlish-v2-nemo-speech-cpp-q8_0
- Version 1 en f16: https://huggingface.co/Scrya/parakeet-tdt-0.6b-singlish-v1-nemo-speech-cpp-f16
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Runtime NeMo-Speech.cpp: https://github.com/NVIDIA/NeMo-Speech.cpp
