# asounimelb/whisper-tiny-ckb-onnx

## Resumen

Whisper Tiny: Central Kurdish (ONNX) es una adaptacion del modelo de reconocimiento automatico de voz openai/whisper-tiny (39 millones de parametros) ajustada por el usuario asounimelb para transcribir kurdo central (sorani, codigo de idioma `ckb`). El modelo resuelve un problema concreto: Whisper no dispone de token de idioma para kurdo central, de modo que el ajuste fino se realizo utilizando el token de ingles `<|en|>` como marcador de posicion, y la decodificacion debe hacerse siempre con `language: "en"` y `task: "transcribe"`.

A diferencia del modelo original, esta version se distribuye exclusivamente en formato ONNX (encoder en fp32 y decoder combinado en int8 y en 4 bits) para su uso con Transformers.js en navegador o Node.js, y con ONNX Runtime. El repositorio ocupa 0,2 GB y su encoder pesa 33 MB, lo que permite ejecucion en cliente sin GPU dedicada.

El ajuste se hizo sobre un corpus muy reducido: aproximadamente 2 horas y 18 minutos de voz leida, 1.653 enunciados, de un unico hablante nativo con acento de Mariwan. Existen dos variantes adicionales del mismo autor con la misma receta de entrenamiento: whisper-base-ckb-onnx (74M) y whisper-small-ckb-onnx (244M).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), con decoder combinado con y sin KV cache en un unico grafo ONNX |
| Parametros totales | 39 millones |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (80 bins log-Mel a 16 kHz); para audio mas largo se requiere chunking con `chunk_length_s: 30, stride_length_s: 5` |
| Tipos de cuantizacion | Encoder fp32 (33 MB); decoder merged int8/q8 (50 MB); decoder merged 4-bit/q4 (99 MB) |
| Idiomas soportados | Kurdo central (sorani, `ckb`) como salida; la decodificacion debe forzarse con el token `<|en|>` |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (encoder_model.onnx, decoder_model_merged_quantized.onnx, decoder_model_merged_q4.onnx) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper Tiny: un transformer encoder-decoder con front end estandar de 80 bins log-Mel sobre audio mono a 16 kHz. El modelo base es la version multilingue de openai/whisper-tiny. La particularidad del export es el decoder combinado (`decoder_model_merged`), que fusiona en un solo grafo las variantes con y sin cache KV, lo que simplifica el despliegue en Transformers.js.

El entrenamiento consistio en un ajuste fino supervisado (no se menciona RLHF ni DPO) durante 1 epoca, con batch size 2, optimizador AdamW y learning rate 1e-5. Los tokens especiales utilizados fueron `<|en|>`, `<|transcribe|>` y `<|notimestamps|>`. El corpus consta de unas 2 horas y 18 minutos de voz leida (1.653 enunciados) de un unico hablante masculino nativo (Aso Mahmudi) con acento de Mariwan, grabado en estudio domestico con microfono de condensador USB. Las transcripciones provienen del texto completo del libro *Mesele-y Wijdan* de Ahmad Mukhtar Jaff (1896-1935), que aporta unos 49 minutos de audio, y de textos diversos de sitios web kurdos (noticias, deporte, temas generales). Todas las transcripciones fueron revisadas manualmente. La particion de datos fue aleatoria 90/10 con semilla 42.

## Capacidades

- Reconocimiento automatico de voz (ASR) en kurdo central (sorani) con salida en escritura arabe kurda estandar (por ejemplo `کوردی`).
- Transcripcion de voz leida con puntuacion y formato aprendidos de los textos editados del corpus.
- Ejecucion en navegador y en Node.js mediante Transformers.js, y en entornos nativos via ONNX Runtime.
- Entrada de audio por URL o como `Float32Array` de audio mono a 16 kHz.
- Procesamiento de audio de duracion arbitraria mediante chunking de 30 segundos con solapamiento de 5 segundos.
- Seleccion de precision en tiempo de carga (encoder fp32 combinado con decoder q8 o q4).
- No dispone de tool calling, function calling, capacidades de agente, vision, audio generativo ni modo de razonamiento explicito.

## Casos de uso

- Transcripcion de audio en el navegador sin servidor: el modelo pesa 83 MB en la combinacion fp32+q8 y se ejecuta en cliente con Transformers.js, por lo que se puede ofrecer dictado o subtitulado en kurdo central sin enviar el audio a infraestructura propia.
- Archivado y digitalizacion de material audiovisual en kurdo sorani: grabaciones de voz leida, entrevistas preparadas o lecturas pueden transcribirse por lotes mediante ONNX Runtime para generar subtitulos o indices de busqueda.
- Investigacion linguistica sobre kurdo central: la salida en escritura arabe kurda estandar facilita la creacion de corpus anotados, aunque requiere revision humana por los errores de espaciado entre palabras.
- Aplicaciones educativas offline: al ser un modelo pequeno y ejecutable en CPU, puede integrarse en herramientas de aprendizaje de kurdo que funcionen sin conexion.
- Prototipado rapido y validacion de producto: con 0,2 GB de repositorio y dependencia unica de `@huggingface/transformers`, sirve para comprobar la viabilidad de una funcionalidad de ASR kurdo antes de invertir en un modelo mayor.
- Comparativa de escalado en la misma familia: al existir las variantes base (74M) y small (244M) entrenadas con los mismos datos, este modelo permite medir la ganancia de precision frente al coste de computo en un mismo pipeline.
- Preprocesado de datos para otros sistemas de PNL en kurdo: transcripciones automaticas de audio de un solo hablante y voz leida como paso previo a la anotacion manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no existe evaluacion sobre un conjunto de test independiente y recomienda evaluar el modelo con datos propios antes de usarlo en produccion. El unico dato de evaluacion mencionado es una comprobacion puntual (spot check) segun la cual las variantes q8 y q4 producen transcripciones casi identicas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 0,2 GB en la configuracion fp32 + q8 (encoder de 33 MB y decoder de 50 MB); la variante q4 anade 99 MB para el decoder a cambio de un menor tamano de descarga en la variante alternativa.
- GPU recomendadas: no se requiere GPU. El modelo esta pensado para CPU y para ejecucion en navegador; en GPU puede acelerarse mediante WebGPU en el navegador o mediante los execution providers de ONNX Runtime (CUDA, DirectML).
- Compatibilidad con GPU de consumo: si, cabe con holgura en cualquier GPU de consumo, e incluso en dispositivos sin GPU dedicada. El cuello de botella es el computo, no la memoria.
- Opciones de despliegue: Transformers.js (navegador y Node.js) y ONNX Runtime. No se proporcionan pesos en safetensors, GGUF ni integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La model card no publica mediciones de velocidad ni de RTF (factor de tiempo real) para ninguna configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma objetivo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| asounimelb/whisper-tiny-ckb-onnx (este modelo) | 39M | 30 s de audio por ventana | Kurdo central (sorani) | ONNX fp32 + q8/q4 | Apache 2.0 | HuggingFace, 0 descargas |
| asounimelb/whisper-base-ckb-onnx | 74M | 30 s de audio por ventana | Kurdo central (sorani) | ONNX | Apache 2.0 | HuggingFace |
| asounimelb/whisper-small-ckb-onnx | 244M | 30 s de audio por ventana | Kurdo central (sorani) | ONNX | Apache 2.0 | HuggingFace |
| openai/whisper-tiny | 39M | 30 s de audio por ventana | 99 idiomas, sin kurdo central | safetensors / multiples | Apache 2.0 | HuggingFace |

Las tres variantes en kurdo central fueron ajustadas con los mismos datos y la misma receta, por lo que la diferencia entre ellas es exclusivamente el tamano del modelo base y el coste de inferencia asociado. No se dispone en la informacion proporcionada de datos de rendimiento comparativos entre ellas, ni de otros modelos de ASR en kurdo central con los que contrastar.

## Limitaciones y advertencias

- Sesgo de hablante unico: todo el corpus proviene de un solo hablante masculino con acento de Mariwan. Se espera una precision notablemente menor con otros hablantes, acentos y dialectos (Sulaimani, Erbil, Kirkuk).
- Dominio restringido: solo voz leida. El rendimiento cae previsiblemente con habla espontanea o conversacional, audio con ruido y audio con calidad telefonica.
- Puntuacion inferida: el modelo aprendio el formato de textos editados, por lo que puede insertar puntuacion que el hablante no marco de forma clara.
- Errores de espaciado: buena parte de los errores residuales son variantes de separacion entre palabras (por ejemplo `بە کار` frente a `بەکار`), una ambiguedad habitual en la ortografia kurda.
- Ausencia de benchmark formal: no hay evaluacion publicada sobre un conjunto de test independiente. Es obligatorio validar con datos propios antes de usar el modelo en produccion.
- Riesgo de alucinacion: aplican las advertencias habituales de Whisper, incluida la generacion de texto inventado ante silencios o audio no vocal.
- Restriccion de decodificacion: el token de idioma debe ser `<|en|>`. Cualquier otro ajuste de idioma degrada gravemente los resultados, lo que puede provocar errores de integracion en pipelines genericos de ASR.
- Licencia: Apache 2.0, sin restricciones conocidas para uso comercial, pero el autor no ofrece garantias de calidad ni soporte.
- Adopcion practicamente nula: el repositorio registra 0 descargas y 0 valoraciones en el momento de la consulta, por lo que no existe validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/asounimelb/whisper-tiny-ckb-onnx
- Variante base (74M): https://huggingface.co/asounimelb/whisper-base-ckb-onnx
- Variante small (244M): https://huggingface.co/asounimelb/whisper-small-ckb-onnx
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Documentacion de Transformers.js: https://huggingface.co/docs/transformers.js
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
