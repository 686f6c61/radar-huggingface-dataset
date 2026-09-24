# enzolabs/parakeet-ultra-coreml

## Resumen

Parakeet Ultra — Core ML es una conversion a Core ML del modelo de reconocimiento de voz moondream/parakeet-ultra (revision `73175eb7aeb0d82f1e2a6b53b3aabc10a90bcd0b`), que a su vez es un fine-tune de NVIDIA Parakeet TDT 0.6B v3 realizado por Moondream. El artefacto lo publica el usuario enzolabs y esta pensado para ejecutarse en local sobre Macs con Apple Silicon, cubriendo tareas de dictado, transcripcion de reuniones y subtitulado en directo.

Tecnicamente es un token-and-duration transducer (TDT) de aproximadamente 0.6 mil millones de parametros, con vocabulario de 8.192 tokens y soporte declarado para 25 idiomas europeos, incluyendo marcas temporales por palabra. El cambio introducido por enzolabs es exclusivamente de pesos: los tensores `ParakeetForTDT` del formato Transformers se renombran al layout de NeMo y se insertan en los grafos v3 ya fijados de FluidInference, que permanecen identicos byte a byte. El encoder conserva paletas de 6 bits (reajustadas a los nuevos pesos) y el resto de tensores quedan en FP16; el joint elimina las salidas top-K no utilizadas y adopta un perfil "greedy" que solo produce token, probabilidad y duracion.

Su relevancia practica esta en que permite inferencia ASR on-device en el ecosistema Apple sin depender de servicios en la nube, con un paquete de 0.5 GB y resultados de WER medidos en un M4 que igualan o superan a alternativas Core ML previas en LibriSpeech y FLEURS. La licencia CC BY 4.0 permite redistribucion y uso comercial con atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Token-and-duration transducer (TDT) tipo Parakeet, encoder-decoder con prediccion conjunta de token y duracion |
| Parametros totales | 0,6 B (600 M), segun el modelo base NVIDIA Parakeet TDT 0.6B v3 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica / no disponible: modelo ASR que procesa audio por fragmentos, no una ventana de contexto en tokens |
| Tipos de cuantizacion | Encoder con paletas de 6 bits reajustadas a los nuevos pesos; resto de tensores en FP16 |
| Idiomas soportados | 25 idiomas europeos (heredados de Parakeet TDT 0.6B v3; la model card no los enumera) |
| Licencia | CC BY 4.0 |
| Formato de pesos | Core ML `.mlpackage` (Preprocessor, Encoder, Decoder, JointDecisionv3), mas `parakeet_vocab.json` y `bundle.json` con SHA-256 |

Datos adicionales del repositorio: 0 descargas, 1 like, tamano de 0.5 GB, biblioteca declarada `coreml`, pipeline `automatic-speech-recognition`, creado y actualizado el 24 de septiembre de 2026.

## Arquitectura y entrenamiento

El modelo es un transducer TDT, la arquitectura de ASR de NVIDIA Parakeet en la que el decodificador predice conjuntamente el token siguiente y su duracion, lo que permite emitir marcas temporales por palabra de forma nativa. La conversion a Core ML separa el grafo en cuatro `.mlpackage` (Preprocessor, Encoder, Decoder y JointDecisionv3) y reutiliza los grafos v3 fijados de FluidInference/parakeet-tdt-0.6b-v3-coreml en la revision `7dd20fe6b1797d35f5e3307e8b1732d9a178edfe`, que se mantienen byte-identicos. El joint se simplifica al perfil "greedy", descartando las salidas top-K y limitando la salida a token, probabilidad y duracion. La cabeza de deteccion de actividad de voz (VAD) presente en el checkpoint de origen no se incluye en este bundle.

No se detalla en la informacion disponible el proceso de entrenamiento del modelo base Parakeet Ultra (numero de tokens, composicion del dataset, uso de RLHF o DPO). Lo que si se documenta es el procedimiento de conversion: los tensores `ParakeetForTDT` del formato Transformers se renombraron al layout de NeMo y se escribieron en los grafos v3 de FluidAudio, y el metodo se verifico convirtiendo el v3 base del mismo modo y reproduciendo exactamente todos los tensores FP16 del bundle de referencia. La receta esta en `tools/evaluation/asr-wer/ultra-coreml/convert_hf.py` dentro del repositorio Enzo, con evidencias en `conversion.json` y `optimization.json`.

## Capacidades

- Reconocimiento de voz (ASR) en 25 idiomas europeos, con salida de transcripcion en texto.
- Marcas temporales a nivel de palabra, gracias al mecanismo token-and-duration del TDT.
- Decodificacion greedy con salida de token, probabilidad y duracion por paso.
- Adecuado para dictado, transcripcion de reuniones y transcripcion en directo, segun declara el autor.
- Ejecucion on-device en Apple Silicon mediante Core ML, sin necesidad de conexion a servicios externos.
- Vocabulario de 8.192 tokens compatible con el de Parakeet TDT v3.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje, es un modelo especializado de reconocimiento de voz.
- No se documentan capacidades de vision, audio distinto de voz, traduccion ni diarizacion de hablantes.

## Casos de uso

- Dictado en macOS: el modelo puede transcribir voz a texto en tiempo real sobre el Neural Engine de un Mac, con marcas temporales que permiten segmentar el texto dictado; es el caso de uso que el propio autor declara.
- Transcripcion de reuniones: con el corpus AMI como referencia medida, encaja en la transcripcion de intervenciones de reunion, donde el WER de 7,26% sobre 188 clips es competitivo frente a alternativas Core ML.
- Subtitulado en directo: la salida con duracion por token permite generar subtitulos sincronizados sin un alineador externo, ejecutandose en local para evitar enviar audio a terceros.
- Aplicaciones macOS de notas de voz: al distribuirse como `.mlpackage` compilable en el Mac de destino, se puede empaquetar dentro de una app nativa y funcionar sin backend.
- Transcripcion multilingue europea: los 25 idiomas soportados permiten cubrir contenido en varios idiomas europeos con un unico modelo, con un WER de 7,75% en FLEURS sobre 8 idiomas y 128 clips.
- Pipelines de evaluacion ASR: el bundle incluye `conversion.json`, `optimization.json` y `bundle.json` con SHA-256, lo que facilita reproducir y auditar la conversion en experimentos comparativos de WER.
- Archivado y busqueda de audio: transcripcion por lotes de grabaciones en un Mac para indexar contenido hablado y hacerlo buscable, aprovechando el procesamiento local.
- Accesibilidad: conversion de voz a texto para personas con dificultades auditivas o para generar transcripciones automáticas de material audiovisual.

## Benchmarks y rendimiento

Medidas declaradas por el autor en Apple M4 con macOS 15.5, expresadas como word error rate (WER) con el normalizador de ingles de Whisper.

| Corpus | Este bundle | orukeet r3 (Core ML) | Parakeet TDT v2 |
|---|---|---|---|
| LibriSpeech dev-clean, 342 clips | 1,91% | 1,89% | 2,28% |
| LibriSpeech dev-other, 381 clips | 3,61% | 3,76% | 3,35% |
| FLEURS, 8 idiomas, 128 clips | 7,75% | 8,54% | 79,27% |
| AMI meeting utterances, 188 clips | 7,26% | 7,46% | no disponible |

No se han publicado en la informacion disponible datos de latencia, throughput ni consumo energetico.

## Requisitos de hardware

- Diseno especifico para Apple Silicon: las medidas se tomaron en un Apple M4 con macOS 15.5.
- Memoria unificada estimada: el repositorio completo ocupa 0.5 GB, con encoder en paletas de 6 bits y resto de tensores en FP16; el peso en memoria es del orden de ese tamano mas el overhead de Core ML, no disponible con precision.
- No esta pensado para GPUs NVIDIA ni AMD: el formato de pesos es Core ML, no safetensors, GGUF ni tensores PyTorch.
- Los `.mlpackage` deben compilarse en el Mac de destino, ya que la cache compilada es especifica de la version de sistema operativo.
- Opciones de despliegue: Core ML sobre Apple Silicon, con los grafos de FluidAudio / FluidInference como base; no aplican vLLM, llama.cpp, Ollama ni TGI al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER LibriSpeech dev-clean | WER FLEURS (8 idiomas) | Licencia | Formato |
|---|---|---|---|---|---|---|
| enzolabs/parakeet-ultra-coreml | 0,6 B | no aplica (ASR) | 1,91% | 7,75% | CC BY 4.0 | Core ML `.mlpackage` |
| orukeet r3 (Core ML) | no disponible | no aplica (ASR) | 1,89% | 8,54% | no disponible | Core ML |
| Parakeet TDT v2 | no disponible | no aplica (ASR) | 2,28% | 79,27% | no disponible | no disponible |
| NVIDIA Parakeet TDT 0.6B v3 | 0,6 B | no aplica (ASR) | no disponible en esta informacion | no disponible en esta informacion | CC BY 4.0 | NeMo / Transformers |

El bundle se comporta de forma practicamente identica a orukeet r3 en LibriSpeech dev-clean y dev-other, mejora en FLEURS y AMI, y supera con claridad a Parakeet TDT v2 en el corpus multilingue FLEURS. La comparacion con el modelo base (Parakeet TDT 0.6B v3) en terminos de WER no esta publicada en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto libre, no razona y no soporta tool calling ni agentes; cualquier uso en ese sentido es inadecuado.
- La model card no detalla sesgos conocidos ni la composicion del dataset de entrenamiento del modelo base, por lo que no es posible evaluar sesgos de acento, genero o variedad dialectal mas alla de las cifras de WER.
- Riesgo de alucinacion y de errores de transcripcion en audio con ruido, solapamiento de hablantes o acentos no representados; el WER en dev-other (3,61%) y AMI (7,26%) es notablemente superior al de dev-clean (1,91%).
- El bundle no incluye la cabeza de deteccion de actividad de voz del checkpoint original, de modo que la segmentacion de silencios debe resolverse en la capa de aplicacion.
- La decodificacion es greedy y el joint elimina las salidas top-K; no estan disponibles modos de decodificacion con haz o con puntuaciones top-K.
- Los idiomas concretos incluidos en los "25 idiomas europeos" no se enumeran en la model card, por lo que conviene verificar cobertura antes de desplegar en produccion.
- Los `.mlpackage` deben compilarse en el Mac de destino y la cache compilada depende de la version de macOS; esto complica la distribucion binaria entre versiones de sistema.
- Requiere hardware Apple Silicon; no es ejecutable en GPUs NVIDIA ni en CPU x86 convencional.
- Licencia CC BY 4.0: permite uso comercial y redistribucion siempre que se atribuya correctamente a Moondream (Parakeet Ultra) y a NVIDIA (Parakeet TDT 0.6B v3); los grafos Core ML originales de FluidInference se distribuyen bajo Apache-2.0.
- El modelo tiene 0 descargas y 1 like, esta creado el 24 de septiembre de 2026 y carece de adopcion documentada, por lo que la validacion corre por cuenta del usuario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/enzolabs/parakeet-ultra-coreml
- Modelo base (Parakeet Ultra, Moondream): https://huggingface.co/moondream/parakeet-ultra
- Modelo de origen (NVIDIA Parakeet TDT 0.6B v3): https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Grafos Core ML de referencia (FluidInference): https://huggingface.co/FluidInference/parakeet-tdt-0.6b-v3-coreml
- Repositorio Enzo (receta `tools/evaluation/asr-wer/ultra-coreml/convert_hf.py`, `conversion.json`, `optimization.json`): referenciado en la model card, URL no disponible en la informacion proporcionada
- FluidAudio: referenciado en la model card, URL no disponible en la informacion proporcionada
