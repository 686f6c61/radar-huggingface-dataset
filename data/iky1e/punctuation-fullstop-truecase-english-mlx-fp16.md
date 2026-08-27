# iky1e/punctuation-fullstop-truecase-english-mlx-fp16

## Resumen

Este repositorio contiene los pesos del modelo `punctuation_fullstop_truecase_english` convertidos a formato MLX en precisión FP16, sin cuantización, para su uso en hardware Apple Silicon. El modelo original, desarrollado por 1-800-BAD-CODE, realiza en una sola pasada tres tareas sobre texto inglés en minúsculas y sin puntuación: restauración de puntuación, true-casing (capitalización correcta) y detección de límites de oración (segmentación). Es un modelo de clasificación de texto (pipeline `text-classification`) que opera a nivel de token, con 52,3 millones de parámetros.

La relevancia de esta conversión radica en que permite ejecutar el modelo de forma eficiente en entornos MLX (Machine Learning for Apple Silicon) sin necesidad de convertir manualmente desde ONNX. El autor de la conversión, `iky1e`, mantiene un proyecto llamado Granite-MLX que integra este modelo como componente para formatear transcripciones de voz. La conversión conserva un acuerdo de caracteres del 99,99 % con el modelo ONNX original, según las métricas publicadas, reduciendo el tamaño de los pesos a la mitad (104,7 MB frente a 209,5 MB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de clasificación de tokens, probablemente Transformer, pero no se especifica en la información) |
| Parametros totales | 52.344.749 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP16 (este repositorio); también existen variantes Q8, Q6, Q5 y Q4 en repositorios hermanos |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura interna del modelo original (número de capas, tipo de atención, etc.). La model card indica que es un modelo de clasificación de texto con un tokenizador SentencePiece Unigram de 32k vocabulario (archivo `spe_32k_lc_en.model`). El modelo original fue exportado a ONNX y luego convertido a MLX mediante un script del proyecto Granite-MLX. No hay información pública sobre el conjunto de datos de entrenamiento, el número de tokens procesados o si se utilizaron técnicas como RLHF o DPO. La conversión MLX FP16 no introduce cambios en la arquitectura; solo cambia la representación de los pesos.

## Capacidades

- Restauración de puntuación: añade comas, puntos, signos de interrogación, etc., a texto sin puntuación.
- True-casing: capitaliza correctamente nombres propios, inicios de oración y otras palabras que requieren mayúsculas.
- Segmentación de oraciones: detecta los límites entre oraciones y añade los separadores correspondientes (punto y mayúscula).
- Entrada de texto en minúsculas y sin puntuación; salida con puntuación y capitalización normalizadas.
- Es un modelo de clasificación de tokens, no un modelo generativo: no genera texto nuevo, solo etiqueta cada token con una clase de puntuación y mayúscula.
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-paso.

## Casos de uso

- Preprocesamiento de transcripciones de voz: cualquier sistema de ASR (reconocimiento automático del habla) que devuelva texto sin puntuación puede alimentar este modelo para obtener un texto legible. Es el caso de uso principal del proyecto Granite-MLX.
- Generación de subtítulos para vídeo: los subtítulos generados por ASR suelen carecer de puntuación; este modelo puede añadirla y capitalizar correctamente los nombres propios.
- Normalización de texto para análisis de sentimiento o minería de opiniones: la puntuación y las mayúsculas son relevantes para la precisión de clasificadores posteriores. Aplicar este modelo mejora la calidad de entrada.
- Corrección de texto en plataformas de mensajería o foros: usuarios que escriben todo en minúsculas y sin puntuación pueden ver su texto formateado de forma automática antes de publicarlo.
- Segmentación de oraciones para motores de búsqueda o indexación: al detectar límites de oración, se pueden dividir textos largos en unidades más manejables para recuperación de información.
- Preparación de datos para modelos de lenguaje: alimentar un LLM con texto puntuado y capitalizado en lugar de texto plano sin formato puede mejorar la coherencia de las respuestas, especialmente en tareas que dependen de la estructura sintáctica.
- Integración en pipelines de NLP como paso de limpieza: por ejemplo, antes de un análisis de dependencias o de un parser sintáctico que requiere puntuación para funcionar correctamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye una tabla comparativa de las distintas variantes MLX frente al modelo ONNX original, midiendo el acuerdo de caracteres y palabras sobre una transcripción real de una conferencia de 101 minutos (69.168 caracteres de entrada). Estos datos son específicos de la conversión y no de la calidad del modelo en tareas de comprensión.

| Variante | Tamaño del archivo | Acuerdo de caracteres | Acuerdo de palabras | Tiempo de inferencia |
|---|---|---|---|---|
| ONNX FP32 (original) | 209,5 MB | 100,00 % | 100,00 % | 2,044 s |
| FP16 (este repositorio) | 104,7 MB | 99,9916 % | 99,9559 % | 0,417 s |
| Q8 | 55,8 MB | 99,9536 % | 99,7575 % | 0,260 s |
| Q6 | 42,8 MB | 99,8777 % | 99,3681 % | 0,346 s |
| Q5 | 36,2 MB | 99,6066 % | 97,9941 % | 0,350 s |
| Q4 | 29,7 MB | 99,2899 % | 96,4879 % | 0,330 s |

Nota: el acuerdo se mide contra la salida del modelo ONNX original, no contra una transcripción humana. El tiempo de inferencia excluye el arranque del proceso y la carga del modelo.

## Requisitos de hardware

- El modelo es muy ligero: 104,7 MB en FP16. Requiere menos de 1 GB de RAM/VRAM para la inferencia.
- Diseñado para Apple Silicon: requiere macOS con chip M1 o posterior y la librería MLX. No se puede ejecutar en GPU NVIDIA o AMD con los pesos MLX directamente.
- Cualquier Mac con al menos 8 GB de RAM unificada puede ejecutarlo sin problemas.
- Opciones de despliegue: se integra en el proyecto Granite-MLX (línea de comandos `granite-mlx`), y también se puede cargar directamente con `mlx` en Python.
- No se requieren GPU dedicadas; el modelo se ejecuta en la CPU/GPU unificada de Apple.
- La latencia medida en la tabla anterior (0,417 s para 69k caracteres) es indicativa; en hardware moderno probablemente sea menor.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de restauración de puntuación y true-casing comparables en el contexto de esta ficha. Existen variantes del mismo modelo en otros formatos (ONNX, MLX cuantizado) que se pueden considerar alternativas:

| Modelo | Formato | Tamaño | Acuerdo de caracteres | Licencia |
|---|---|---|---|---|
| `1-800-BAD-CODE/punctuation_fullstop_truecase_english` (ONNX) | ONNX | 209,5 MB | 100 % | Apache 2.0 |
| `iky1e/punctuation-fullstop-truecase-english-mlx-q8` | MLX Q8 | 55,8 MB | 99,95 % | Apache 2.0 |
| `iky1e/punctuation-fullstop-truecase-english-mlx-fp16` (este) | MLX FP16 | 104,7 MB | 99,99 % | Apache 2.0 |

No hay modelos de la misma categoría (restauración de puntuación) en la información proporcionada para una comparativa más amplia.

## Limitaciones y advertencias

- El modelo está entrenado únicamente para inglés; no funciona con otros idiomas.
- Espera una entrada en minúsculas y sin puntuación. Si el texto de entrada ya contiene mayúsculas o puntuación, el modelo puede producir salidas erróneas o duplicadas.
- No se ha evaluado su comportamiento con texto muy largo o con dominios especializados (por ejemplo, jerga técnica o nombres propios poco comunes).
- La calidad de la salida depende de la calidad de la transcripción de entrada: si el ASR comete errores de palabras, el modelo no los corrige.
- Aunque la licencia Apache 2.0 permite uso comercial, se recomienda revisar los términos del modelo original y de la conversión.
- No es un modelo generativo: no produce texto nuevo, solo etiqueta tokens existentes.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos de texto en inglés, puede heredar sesgos de género, culturales o de estilo presentes en los datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iky1e/punctuation-fullstop-truecase-english-mlx-fp16
- Modelo original: https://huggingface.co/1-800-BAD-CODE/punctuation_fullstop_truecase_english
- Proyecto Granite-MLX (conversor y uso): https://github.com/kylehowells/Granite-MLX
- Repositorio de la librería de inferencia `punctuators`: https://github.com/1-800-BAD-CODE/punctuators
- Colección de modelos de `iky1e`: https://huggingface.co/collections/iky1e/language-models
