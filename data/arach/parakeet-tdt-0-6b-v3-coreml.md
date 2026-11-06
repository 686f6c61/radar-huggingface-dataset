# arach/parakeet-tdt-0.6b-v3-coreml

## Resumen

Parakeet TDT 0.6B v3 Core ML es la conversion a formato Core ML del modelo de reconocimiento automatico del habla (ASR) Parakeet TDT 0.6B v3 de NVIDIA, realizada por el autor arach con coremltools. Su objetivo es ejecutar transcripcion de ficheros de audio directamente sobre la Apple Neural Engine (ANE) en Macs con Apple Silicon, sin depender de CUDA ni de GPUs dedicadas. Es el modelo que da servicio al identificador `parakeet:v3` de la aplicacion Vox.

El modelo base es un sistema ASR de tipo Token-and-Duration Transducer (TDT) con 0.6 mil millones de parametros y una ventana de audio de 15 segundos a 16 kHz mono. La conversion mantiene el preprocesador en 32 bits, los modulos de decodificacion y joint en 16 bits, y comprime los pesos del encoder mediante paletas de 6 bits agrupadas por cada 16 canales de salida, lo que reduce el tamano del repositorio a 0.5 GB.

Su relevancia radica en que permite desplegar un ASR multilingue (25 idiomas europeos) en hardware de consumo Apple con una calidad cercana al modelo original: 2.76 % de WER en LibriSpeech test-clean y 4.11 % en test-other con decodificacion greedy. Requiere macOS 15 o superior sobre Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer) con encoder, decoder y joint network; convertido a Core ML |
| Parametros totales | 0.6 mil millones (modelo base NVIDIA) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de audio de 15 segundos (240 000 muestras a 16 kHz mono); salida de encoder [1, 1024, 188] |
| Tipos de cuantizacion | encoder con paletas de 6 bits (una paleta por grupo de 16 canales de salida); decoder y joint en 16 bits; preprocesador en 32 bits |
| Idiomas soportados | bg, cs, da, de, el, en, es, et, fi, fr, hr, hu, it, lt, lv, mt, nl, pl, pt, ro, ru, sk, sl, sv, uk |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Core ML (`.mlmodelc`); vocabulario en JSON (`parakeet_vocab.json`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TDT (Token-and-Duration Transducer), una variante de los transducers RNN-T en la que la red conjunta predice de forma conjunta el token siguiente y su duracion. La conversion separa el pipeline en cuatro submodelos Core ML: `Preprocessor` (extraccion de mel), `Encoder` (representacion acustica), `Decoder` (prediccion del token previo con estado oculto h/c) y `JointDecisionv3` (decision greedy TDT con token, probabilidad, duracion y top-k). El vocabulario es SentencePiece de 8192 tokens con el blank en el indice 8192.

Los datos de entrenamiento originales no se detallan en la informacion disponible; se trata de una redistribucion en formato Core ML del checkpoint de NVIDIA, no de un reentrenamiento. La innovacion tecnica principal es la compresion del encoder mediante paletas de 6 bits por grupo de 16 canales, que reduce el peso del repositorio a 0.5 GB manteniendo precision aceptable, junto con la ejecucion del encoder sobre la Apple Neural Engine.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) en 25 idiomas europeos.
- Decodificacion greedy TDT con prediccion conjunta de token y duracion.
- Procesamiento de audio en ventanas de 15 segundos a 16 kHz mono.
- Salida con identificadores de token, probabilidades y duraciones, ademas de top-k de logits para analisis posterior.
- Ejecucion nativa en Apple Silicon mediante Core ML y Apple Neural Engine.
- No soporta tool calling, function calling, agentes, vision, audio generativo ni modo thinking; es exclusivamente ASR.

## Casos de uso

- Transcripcion de reuniones en local: procesar ficheros de audio de 15 segundos por ventana sobre la ANE de un Mac, sin enviar datos a la nube, util para entornos con requisitos de privacidad.
- Subtitulado de video en macOS: integrar los cuatro submodelos Core ML en una app de edicion para generar subtitulos en 25 idiomas europeos con WER cercano al 3-4 % en ingles limpio.
- Dictado por voz en aplicaciones de escritorio: usar el pipeline para convertir voz a texto en tiempo casi real en un Mac con Apple Silicon, aprovechando la carga en aproximadamente dos segundos tras la primera compilacion.
- Archivado y busqueda de audio: transcribir grandes volumenes de grabaciones (podcasts, llamadas, entrevistas) en lote sobre hardware Apple para indexar contenido textual.
- Accesibilidad: generar transcripciones en vivo para personas con discapacidad auditiva en entornos macOS, con soporte multilingue para hablantes de lenguas eslavas, nordicas y romance.
- Investigacion en ASR multilingue: usar el modelo convertido como referencia de inferencia en ANE para comparar latencia y calidad frente a ejecuciones en CUDA o CPU.
- Prototipado de asistentes de voz: emplear la salida de top-k logits y duraciones para construir sistemas de deteccion de confianza o correccion posterior.

## Benchmarks y rendimiento

Word error rate en LibriSpeech (conjuntos de test completos, decodificacion greedy):

| Metrica | test-clean | test-other |
|---|---|---|
| Esta conversion | 2.76 % | 4.11 % |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks, por no ser aplicables a un modelo ASR. Tampoco se detallan latencia ni throughput medidos.

## Requisitos de hardware

- macOS 15 o superior sobre Apple Silicon (obligatorio).
- VRAM estimada: no disponible; el modelo se ejecuta sobre la Apple Neural Engine y memoria unificada del Mac.
- GPU recomendadas: no aplica GPU discreta; requiere chip Apple Silicon con Neural Engine.
- Cabe en equipos de consumo Apple Silicon (Mac con chip M-series), dado el tamano de repositorio de 0.5 GB.
- Primera carga: compila el encoder para la Neural Engine del Mac, entre uno y dos minutos; cargas posteriores en torno a dos segundos.
- Opciones de despliegue: Core ML (`.mlmodelc`) mediante coremltools o APIs nativas de Apple; no compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| arach/parakeet-tdt-0.6b-v3-coreml | 0.6 B | ventana 15 s | 25 europeos | CC-BY-4.0 | Core ML |
| nvidia/parakeet-tdt-0.6b-v3 | 0.6 B | ventana 15 s | 25 europeos | CC-BY-4.0 | pesos NVIDIA (NeMo) |
| Whisper large-v3 | no disponible en la informacion | no disponible | multilingue amplio | no disponible en la informacion | no disponible en la informacion |

La comparativa con alternativas fuera del ecosistema Apple no esta detallada en la informacion proporcionada.

## Limitaciones y advertencias

- Solo funciona en macOS 15 o superior con Apple Silicon; no es portable a Linux, Windows ni GPUs NVIDIA.
- Ventana fija de 15 segundos por inferencia; audios mas largos requieren segmentacion externa.
- La cuantizacion del encoder a paletas de 6 bits puede degradar la precision frente al checkpoint original de NVIDIA, aunque el WER reportado es bajo en ingles.
- El WER solo se ha publicado para LibriSpeech en ingles; el rendimiento en los otros 24 idiomas no esta cuantificado en la informacion disponible.
- Riesgo de errores en audio con ruido, acentos marcados, solapamiento de hablantes o vocabulario tecnico fuera del dominio de entrenamiento.
- No incluye deteccion de hablantes, puntuacion automatica ni diarizacion.
- Licencia CC-BY-4.0: permite uso comercial con atribucion a NVIDIA y al autor de la conversion; es necesario conservar el credito indicado en la model card.
- La primera carga implica compilacion para la Neural Engine (uno a dos minutos), lo que afecta a despliegues con arranque en frio.
- El autor del repositorio (arach) no parece tener relacion con resultados de busqueda web homonimos (juegos, empresas); no debe confundirse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arach/parakeet-tdt-0.6b-v3-coreml
- Modelo base NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Aplicacion Vox: https://voxd.cc
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
