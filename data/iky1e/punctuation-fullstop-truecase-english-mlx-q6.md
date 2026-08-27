# iky1e/punctuation-fullstop-truecase-english-mlx-q6

## Resumen

El modelo `iky1e/punctuation-fullstop-truecase-english-mlx-q6` es una conversión a MLX con cuantización de 6 bits (affine, group size 64 y tensores residuales FP16) del modelo original `1-800-BAD-CODE/punctuation_fullstop_truecase_english`. Este clasificador de texto realiza en una sola pasada tres tareas sobre texto inglés en minúsculas y sin puntuación: restauración de puntuación (punto, coma, interrogación, etc.), true-casing (capitalización correcta de palabras) y detección de límites de oraciones. Con 11.585.949 parámetros, está pensado como componente de post-procesado en pipelines de transcripción de voz.

La relevancia de esta variante Q6 radica en su equilibrio entre tamaño y fidelidad: reduce los pesos de 209,5 MB (ONNX FP32) a 42,8 MB, manteniendo un 99,8777 % de acuerdo de caracteres y un 99,3681 % de acuerdo de palabras respecto al modelo original. El autor, iky1e, lo distribuye bajo licencia Apache 2.0 y lo integra como modelo de puntuación por defecto en el proyecto Granite-MLX, que transcribe vídeo mediante modelos de reconocimiento de voz.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (clasificador de texto de una sola pasada) |
| Parametros totales | 11.585.949 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q6 (affine, 6 bits, group size 64, residual FP16) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (con tokenizer SentencePiece Unigram) |

## Arquitectura y entrenamiento

No se han publicado detalles de la arquitectura interna del modelo original (número de capas, tipo de atención, dimensiones) ni de su entrenamiento (dataset, número de tokens, método de optimización) en la información disponible. Lo que se sabe es que el modelo original de 1-800-BAD-CODE realiza tres tareas de clasificación en una única pasada: restauración de puntuación, true-casing y segmentación de oraciones. La conversión MLX aplica cuantización affine de 6 bits con group size 64 y tensores residuales en FP16, una técnica que reduce el tamaño de los pesos a un 20,4 % del original ONNX FP32 (42,8 MB frente a 209,5 MB). La validación se ha realizado comparando la salida formateada del modelo Q6 con la del ONNX FP32 sobre una transcripción de una conferencia de 69.168 caracteres.

## Capacidades

- Restauración de puntuación: añade puntos, comas, signos de interrogación y exclamación a texto sin puntuación.
- True-casing: capitaliza correctamente nombres propios y comienzos de oración.
- Detección de límites de oraciones: segmenta el texto en frases completas.
- Entrada específica: acepta texto en inglés en minúsculas y sin puntuación, típicamente salida cruda de un sistema ASR.
- Salida formateada: texto con puntuación, mayúsculas y segmentación de frases.
- Integración nativa con Granite-MLX para el post-procesado de transcripciones de vídeo.
- No es un modelo de generación de texto: no soporta tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Post-procesado de transcripciones ASR: el modelo convierte la salida cruda en minúsculas de sistemas como Whisper o Granite en texto legible con puntuación y mayúsculas, mejorando la calidad de subtítulos y actas.
- Integración en Granite-MLX: se usa como modelo de puntuación por defecto en el pipeline de transcripción de vídeo, ejecutando `granite-mlx recording.mp4 --punctuation-model iky1e/punctuation-fullstop-truecase-english-mlx-q6`.
- Preprocesado de texto para NLP: normaliza corpus de texto sin puntuación antes de aplicar análisis de sentimiento, extracción de entidades o etiquetado gramatical, mejorando la precisión de estos modelos.
- Generación de subtítulos automáticos: formatea las transcripciones de vídeo para que los subtítulos sean más legibles y naturales.
- Limpieza de corpus de entrenamiento: prepara grandes volúmenes de texto transcrito sin puntuación para entrenar otros modelos de lenguaje, evitando la introducción de ruido en los datos.
- Transcripción de reuniones y entrevistas: convierte grabaciones de voz en documentos de texto formateados, listos para su revisión o archivo.
- Asistencia de escritura por voz: en aplicaciones de dictado, el modelo añade puntuación y mayúsculas a la entrada de voz en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar de LLM (MMLU, HumanEval, GSM8K) porque el modelo es un clasificador de texto, no un modelo de generación. La model card incluye una comparación de las variantes MLX frente al modelo original ONNX FP32, medida sobre la salida formateada de una transcripción de 69.168 caracteres:

| Variante | Tamaño de pesos | Acuerdo de caracteres | Acuerdo de palabras | Tiempo de formateo |
|---|---:|---:|---:|---:|
| ONNX FP32 (original) | 209,5 MB | 100,0000 % | 100,0000 % | 2,044 s |
| MLX FP16 | 104,7 MB | 99,9916 % | 99,9559 % | 0,417 s |
| MLX Q8 | 55,8 MB | 99,9536 % | 99,7575 % | 0,260 s |
| MLX Q6 (este modelo) | 42,8 MB | 99,8777 % | 99,3681 % | 0,346 s |
| MLX Q5 | 36,2 MB | 99,6066 % | 97,9941 % | 0,350 s |
| MLX Q4 | 29,7 MB | 99,2899 % | 96,4879 % | 0,330 s |

El acuerdo se mide contra la salida del modelo ONNX FP32, no contra una transcripción humana. El tiempo de formateo excluye el arranque del proceso y la carga del modelo.

## Requisitos de hardware

- El modelo Q6 pesa 42,8 MB, por lo que cabe en cualquier Mac con Apple Silicon; no requiere GPU dedicada.
- VRAM estimada: menos de 1 GB en la práctica, ya que el modelo tiene 11,6 millones de parámetros.
- Inferencia: usa MLX, la librería de aprendizaje automático de Apple optimizada para la GPU unificada de Apple Silicon.
- Despliegue: se integra directamente en Granite-MLX o en scripts Python con MLX. Para otras plataformas (Linux, Windows), se puede usar el modelo original en formato ONNX con ONNX Runtime.
- Latencia: 0,346 s para procesar 69.168 caracteres de entrada en un hardware no especificado en la card; la variante Q8 fue la más rápida medida (0,260 s).

## Comparativa con modelos similares

La comparativa más directa es con las variantes del mismo modelo y el original ONNX FP32:

| Modelo | Parámetros | Tamaño de pesos | Acuerdo de caracteres | Acuerdo de palabras | Licencia |
|---|---:|---:|---:|---:|---|
| ONNX FP32 original | 11,6 M | 209,5 MB | 100 % | 100 % | Apache 2.0 |
| MLX FP16 | 11,6 M | 104,7 MB | 99,9916 % | 99,9559 % | Apache 2.0 |
| MLX Q8 | 11,6 M | 55,8 MB | 99,9536 % | 99,7575 % | Apache 2.0 |
| MLX Q6 (este) | 11,6 M | 42,8 MB | 99,8777 % | 99,3681 % | Apache 2.0 |
| MLX Q5 | 11,6 M | 36,2 MB | 99,6066 % | 97,9941 % | Apache 2.0 |
| MLX Q4 | 11,6 M | 29,7 MB | 99,2899 % | 96,4879 % | Apache 2.0 |

No se dispone de comparación con otros modelos de restauración de puntuación (por ejemplo, `punctuators` de 1-800-BAD-CODE) en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no es válido para otros idiomas.
- La entrada debe estar en minúsculas y sin puntuación; el modelo no está diseñado para texto ya puntuado o en mayúsculas.
- El true-casing puede fallar en nombres propios, acrónimos o palabras poco frecuentes, especialmente si el texto contiene errores de ASR.
- La cuantización Q6 introduce una pérdida de calidad del 0,12 % en acuerdo de caracteres y del 0,63 % en acuerdo de palabras frente al modelo ONNX FP32.
- No es un modelo de generación de texto: no soporta tool calling, agentes ni razonamiento de múltiples pasos.
- La versión MLX requiere Apple Silicon; para otras plataformas hay que usar el modelo ONNX original.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías implícitas.

## Enlaces

- Modelo Q6 en HuggingFace: https://huggingface.co/iky1e/punctuation-fullstop-truecase-english-mlx-q6
- Modelo original (1-800-B
