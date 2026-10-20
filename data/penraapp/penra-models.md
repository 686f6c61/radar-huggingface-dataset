# PenraApp/penra-models

## Resumen

`PenraApp/penra-models` no es un modelo entrenado por su autor, sino un repositorio de distribucion de artefactos convertidos y empaquetados para la aplicacion de notas Penra (Android). Contiene los ficheros que la app descarga para ejecutar reconocimiento de escritura manual, transcripcion de voz, diarizacion de hablantes y busqueda semantica de notas **integramente en el dispositivo**, sin servidor. El repositorio ocupa 3,0 GB e incluye un `manifest.json` con tamano y SHA-256 de cada fichero, que la app verifica antes de usarlo.

Los componentes proceden de modelos abiertos de terceros: bundles LiteRT-LM derivados de Gemma 4 (variantes E4B y E2B, con vocabulario recortado y una firma de vision de 1120 tokens), `EmbeddingGemma 2` (270M) para busqueda por significado, `UVDoc` de PaddlePaddle para enderezar paginas fotografiadas, y el sistema ASR en streaming `Nemotron 3.5 ASR Streaming 0.6B` de NVIDIA convertido a TensorFlow Lite con cuantizacion int8, mas un GGUF q8_0 de `Nemotron 3 Diarization` marcado como planificado. Se completa con listas de palabras de FrequencyWords (Hermit Dave) para la comprobacion posterior de lecturas.

Su relevancia es practica: es un ejemplo documentado de pipeline OCR/ASR on-device con seleccion de bundle segun la memoria del telefono (8 GB para E4B, menos memoria para E2B). No obstante, no aporta informacion sobre entrenamiento, parametros totales, contexto ni evaluacion, y su licencia es mixta (Apache 2.0 mas OpenMDW 1.1 mas CC BY-SA 4.0), lo que condiciona su reutilizacion comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible como conjunto. Componentes: bundles LiteRT-LM derivados de Gemma 4 (transformer multimodal, detalles no disponibles), modelo de embeddings EmbeddingGemma 2, UVDoc (PaddlePaddle, correccion de docu mentos), ASR Nemotron 3.5 Streaming 0.6B con red RNN-T (encoder en streaming, predictor y joint), diarizacion Nemotron 3 |
| Parametros totales | No disponible. Se indica la nomenclatura de Gemma 4 E4B y E2B y 0,6B para el ASR; el desglose de parametros totales y activos no se publica |
| Parametros activos | No disponible (el autor no especifica si las variantes E4B/E2B son MoE ni su numero de expertos) |
| Longitud de contexto | No disponible. El dato "1120" de los bundles corresponde a la firma de vision (1120 tokens), no a la ventana de contexto |
| Tipos de cuantizacion | int8 (encoder ASR `nemotron-asr-step-dwi8.tflite`), q8_0 en GGUF (diarizacion), bundles LiteRT-LM con cuantizacion no especificada, ONNX (UVDoc, precision no indicada) |
| Idiomas soportados | No disponible. Existen listas de palabras por idioma en `wordlists/<lang>/<lang>_50k.txt`, sin listado de idiomas publicado |
| Licencia | Mixta: Apache 2.0 (Gemma 4, EmbeddingGemma 2, UVDoc), OpenMDW License 1.1 (Nemotron ASR y diarizacion), CC BY-SA 4.0 (listas de palabras) |
| Formato de pesos | `.litertlm` (LiteRT-LM), `.tflite` (TensorFlow Lite), `.onnx` (ONNX), `.gguf` (GGUF q8_0) |

## Arquitectura y entrenamiento

El repositorio es un contenedor de artefactos, no un modelo con un proceso de entrenamiento propio. Cada fichero es una forma modificada del modelo original: conversion de formato, cuantizacion y reempaquetado. El nucleo de lectura de escritura y voz son bundles LiteRT-LM derivados de Gemma 4 en dos variantes (E4B y E2B) con el vocabulario recortado y una firma de vision de 1120 tokens; la app elige un bundle u otro segun la memoria del telefono. La busqueda semantica usa EmbeddingGemma 2 en formato LiteRT-LM, y el preprocesado de imagenes emplea UVDoc (PaddlePaddle) en ONNX para aplanar la perspectiva de una pagina fotografiada antes de leerla.

El subsistema de voz esta separado en dos ficheros TFLite: un paso de encoder en streaming cuantizado a int8 y un segundo fichero con la red de prediccion y la joint de un esquema RNN-T, lo que permite transcripcion incremental mientras se graba. La diarizacion (quien habla y cuando) se distribuye como GGUF q8_0 y aparece marcada como planificada, es decir, no necesariamente activa en la app. No se publican datos de entrenamiento, numero de tokens, composicion del corpus ni procesos de alineacion (RLHF/DPO) para ninguno de los componentes; esa informacion solo podria obtenerse de las fichas de los modelos originales de Google y NVIDIA.

## Capacidades

- Lectura de escritura manual sobre notas: reconocimiento de trazos convertidos a imagen o a representacion compatible con el bundle de vision.
- Transcripcion de voz en streaming con salida incremental, gracias a la separacion encoder / predictor-joint del RNN-T en TFLite.
- Busqueda semantica de notas mediante embeddings de texto (EmbeddingGemma 2, 270M), sin conexion.
- Correccion o validacion de lecturas con listas de frecuencia por idioma (`<lang>_50k.txt`).
- Normalizacion geometrica de paginas fotografiadas (UVDoc) antes de la lectura.
- Diarizacion de hablantes (planificada) a partir de audio de reunion o nota de voz.
- Ejecucion completamente offline: ninguna de las capacidades requiere servidor ni conexion de red.
- Verificacion de integridad de los artefactos mediante SHA-256 y tamanos declarados en `manifest.json`.
- Capacidades de generacion de texto, razonamiento, codigo, matematicas o tool calling: no disponibles en la informacion proporcionada (los bundles derivan de un modelo multimodal de Google, pero el autor no documenta estas funciones en el contexto de la app).

## Casos de uso

- **Aplicacion de notas con reconocimiento de escritura offline**: Penra descarga `penra-ocr-1120.litertlm` en telefonos con 8 GB de memoria y `penra-e2b-1120.litertlm` en el resto, de modo que el usuario escribe a mano y obtiene texto sin enviar la imagen a ningun servidor.
- **Dictado y notas de voz sin conexion**: el par `nemotron-asr-step-dwi8.tflite` mas `nemotron-decoder.tflite` permite mostrar texto mientras se graba en entornos sin cobertura (obra, campo, avion), con la latencia de un encoder en streaming int8.
- **Busqueda semantica en un corpus personal de notas**: indexar las notas con `embeddinggemma-2-text-270m.litertlm` y recuperar por significado en lugar de por coincidencia exacta de palabras, manteniendo el indice en el dispositivo.
- **Digitalizacion de apuntes y documentos fotografiados**: aplicar `uvdoc.onnx` para enderezar la perspectiva de la foto y pasar despues el resultado al bundle de lectura, lo que reduce errores en paginas curvadas o inclinadas.
- **Actas de reunion con atribucion de hablantes**: usar el GGUF de diarizacion (cuando este disponible) junto al ASR para separar intervenciones y generar un acta con hablante y marca temporal, todo local.
- **Postproceso y control de calidad de OCR**: contrastar las palabras leidas con las listas de frecuencia de 50k entradas del idioma para detectar lecturas improbables y marcarlas para revision manual.
- **Escenarios con requisitos estrictos de privacidad**: cuadernos de campo clinico o legal donde el texto manuscrito no puede salir del dispositivo; el diseno offline y la verificacion por hash de los artefactos facilitan el cumplimiento.
- **Integracion en apps Android de terceros**: reutilizar los `.litertlm` y `.tflite` como artefactos empaquetados en una aplicacion propia, respetando las licencias de cada componente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de precision (CER/WER), tasas de acierto en lectura de escritura, calidad de recuperacion de embeddings ni latencias medidas. Tampoco se compara con alternativas.

## Requisitos de hardware

- **Memoria del dispositivo**: el bundle basado en Gemma 4 E4B esta pensado para telefonos con 8 GB de RAM; el bundle E2B cubre telefonos con menos memoria. Es el unico criterio de seleccion documentado.
- **VRAM en GPU de escritorio**: no disponible. Los formatos distribuidos (`.litertlm`, `.tflite`) estan orientados a aceleradores moviles (CPU, GPU o NPU del telefono via LiteRT), no a CUDA.
- **Cabe en GPU de consumo**: no aplica en el formato entregado. El unico artefacto con formato habitual en escritorio es `nemotron-3-diarization-q8_0.gguf` (GGUF q8_0), ejecutable con llama.cpp u otro runtime compatible GGUF; sus requisitos concretos de VRAM no se indican.
- **Despliegue**: LiteRT / LiteRT-LM para los bundles y el ASR, ONNX Runtime para `uvdoc.onnx`, y un runtime GGUF (llama.cpp y derivados) para la diarizacion. No se mencionan vLLM, TGI ni Ollama.
- **Latencia y throughput**: no disponibles. La unica indicacion cualitativa es que el ASR funciona en streaming con encoder int8, lo que sugiere baja latencia por chunk, pero sin cifras publicadas.
- **Almacenamiento**: 3,0 GB de repositorio; la app descarga solo el bundle de lectura correspondiente a la memoria del telefono, mas el resto de artefactos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formatos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Penra offline models (este repo) | No disponible (E4B/E2B y 0,6B en ASR) | No disponible | litertlm, tflite, onnx, gguf | Mixta: Apache 2.0 + OpenMDW 1.1 + CC BY-SA 4.0 | Publico en HuggingFace, 0 descargas, 0 likes |
| Gemma 4 E4B / E2B (modelo original de Google) | No disponible en esta informacion | No disponible | Pesos originales de Google (no detallados aqui) | Apache 2.0 | Publico, mantenido por Google |
| EmbeddingGemma 2 (modelo original) | 270M (segun el nombre del fichero) | No disponible | Pesos originales (no detallados aqui) | Apache 2.0 | Publico, mantenido por Google |
| NVIDIA Nemotron 3.5 ASR Streaming 0.6B (original) | 0,6B | No disponible | Pesos originales (no detallados aqui) | OpenMDW 1.1 | Publico en HuggingFace (`nvidia/nemotron-3.5-asr-streaming-0.6b`) |

La comparacion relevante no es de calidad, sino de empaquetado: este repositorio ofrece los mismos modelos en formatos moviles listos para LiteRT, con vocabulario recortado y verificacion por hash, a cambio de perder informacion de entrenamiento, contexto y evaluacion. No se dispone de datos para comparar precision o latencia frente a los originales ni frente a alternativas de OCR/ASR en la nube.

## Limitaciones y advertencias

- **No es un modelo entrenado por el autor**: son formas modificadas de modelos de Google y NVIDIA (conversion, cuantizacion, reempaquetado), entregadas "as is" y sin garantia.
- **Ausencia total de evaluacion**: no hay CER/WER, ni metricas de recuperacion, ni pruebas de robustez por idioma o tipo de letra. Cualquier uso en produccion requiere evaluacion propia.
- **Riesgo de error en lectura y transcripcion**: como todo OCR/ASR, puede producir texto plausible pero incorrecto; la comprobacion con listas de frecuencia reduce pero no elimina el problema, y no hay deteccion de confianza documentada.
- **Sesgos**: no documentados. Dependen de los datos de entrenamiento originales de Gemma 4, EmbeddingGemma 2 y Nemotron, sobre los que esta ficha no aporta informacion.
- **Idiomas no listados**: aunque existen listas de palabras por idioma, no se publica que idiomas cubre el OCR ni el ASR; el rendimiento fuera de los idiomas principales es desconocido.
- **Restricciones de licencia**: la licencia es mixta y hay que cumplirla componente a componente. Gemma 4 se distribuye bajo Apache 2.0 segun el autor, pero el enlace apunta a la licencia especifica de Gemma 4, que conviene revisar. El ASR y la diarizacion estan bajo OpenMDW 1.1, con posibles condiciones de atribucion y uso. Las listas de palabras son CC BY-SA 4.0, lo que impone compartir igual las obras derivadas de esas listas.
- **Diarizacion no operativa**: el fichero GGUF esta marcado como "planned"; no debe asumirse su disponibilidad.
- **Dependencia de plataforma**: los formatos `.litertlm` y `.tflite` estan atados al ecosistema LiteRT/TensorFlow Lite; no hay pesos en safetensors ni GGUF de los componentes de lectura y voz, lo que dificulta la reutilizacion fuera de movil.
- **Verificacion obligatoria de integridad**: si se sirven estos ficheros desde un servidor propio, deben respetarse los tamanos y SHA-256 de `manifest.json`; el autor no publica firmas criptograficas mas alla del hash.
- **Actividad nula en el repositorio**: 0 descargas y 0 likes en el momento del registro, sin senales de mantenimiento o comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/PenraApp/penra-models
- Aplicacion Penra en Google Play: https://play.google.com/store/apps/details?id=com.ouxyz.penra
- Licencia de Gemma 4 referenciada por el autor: https://ai.google.dev/gemma/docs/gemma_4_license
- Modelo original del ASR (NVIDIA Nemotron 3.5 ASR Streaming 0.6B): https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Listas de palabras FrequencyWords (Hermit Dave), commit 525f9b5: incluidas en `wordlists/<lang>/<lang>_50k.txt` dentro del repositorio (no se ha proporcionado una URL externa).
- UVDoc (PaddlePaddle): no se ha proporcionado URL en la informacion disponible.
- EmbeddingGemma 2: no se ha proporcionado URL en la informacion disponible.
- Nota: la busqueda web asociada no devolvio resultados tecnicos relevantes sobre este modelo; los enlaces anteriores proceden de la model card.
