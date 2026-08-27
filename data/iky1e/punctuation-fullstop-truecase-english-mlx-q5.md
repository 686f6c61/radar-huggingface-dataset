# iky1e/punctuation-fullstop-truecase-english-mlx-q5

## Resumen

El modelo `iky1e/punctuation-fullstop-truecase-english-mlx-q5` es una conversión a MLX (Machine Learning Framework de Apple) de un modelo de restauración de puntuación, capitalización y segmentación de oraciones para texto en inglés. El modelo original, `1-800-BAD-CODE/punctuation_fullstop_truecase_english`, acepta texto en inglés en minúsculas y sin puntuación y, en una sola pasada, añade puntos, comas, signos de interrogación y exclamación, restaura las mayúsculas (true-casing) y detecta los límites de las oraciones. Esta versión concreta aplica una cuantización afín de 5 bits con grupo de tamaño 64 y tensores residuales en FP16, reduciendo el peso a 36,2 MB frente a los 209,5 MB del original ONNX FP32, con una pérdida de acuerdo de caracteres de solo 0,39 puntos porcentuales.

El modelo está pensado para integrarse en pipelines de transcripción de voz, subtitulado, preprocesamiento de texto o cualquier flujo que necesite convertir texto plano sin formato en texto legible con puntuación y mayúsculas correctas. Su tamaño compacto lo hace adecuado para entornos con recursos limitados, especialmente en Apple Silicon, donde MLX aprovecha la memoria unificada. Aunque el repositorio indica que la salida formateada está diseñada para ser el valor por defecto del proyecto Granite-MLX, el modelo se puede usar de forma independiente mediante la librería MLX o con runtimes compatibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de clasificación de texto, arquitectura exacta no especificada) |
| Parámetros totales | 9.955.597 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q5 (5-bit affine, group size 64, residual FP16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La información proporcionada no incluye detalles sobre la arquitectura interna del modelo original ni sobre su proceso de entrenamiento. El modelo base `punctuation_fullstop_truecase_english` está definido como un modelo de clasificación de texto que, a partir de una secuencia de tokens en minúsculas y sin puntuación, predice simultáneamente las marcas de puntuación, las mayúsculas y los límites de oración. No se especifican ni el número de capas ni el tipo de atención (transformer, etc.) ni el dataset utilizado. La conversión a MLX se realizó mediante un script del proyecto Granite-MLX, que exporta los pesos a formato safetensors y aplica cuantización afín de 5 bits con grupo de tamaño 64 y residuos en FP16. El tokenizer es un SentencePiece Unigram de 32k subwords, incluido en el repositorio.

## Capacidades

- Restauración de puntuación: añade puntos, comas, signos de interrogación, exclamación y otros signos a texto en inglés sin ellos.
- True-casing: restaura las mayúsculas en nombres propios, inicios de oración y otras palabras que lo requieran.
- Detección de límites de oración: segmenta el texto en frases completas, útil para tareas de análisis posterior.
- Funciona con texto en minúsculas y sin puntuación como entrada, lo que lo hace ideal para salidas de reconocimiento de voz.
- No soporta tool calling, agentes, visión ni otras modalidades; es un modelo especializado en una sola tarea de preprocesamiento.

## Casos de uso

- Transcripción de voz a texto: el modelo puede tomar la salida de un sistema de reconocimiento de voz (que suele ser texto en minúsculas y sin puntuación) y añadir puntuación y mayúsculas automáticamente, mejorando la legibilidad de transcripciones de reuniones, entrevistas o clases.
- Generación de subtítulos: para vídeos o podcasts, el modelo puede convertir las transcripciones automáticas en subtítulos con puntuación correcta, facilitando la lectura y el cumplimiento de las normas de accesibilidad.
- Preprocesamiento para análisis de sentimiento o extracción de entidades: la puntuación y las mayúsculas ayudan a los modelos de NLP a identificar mejor los límites de oración y las entidades nombradas, mejorando la precisión de tareas posteriores.
- Mejora de textos generados por modelos de lenguaje sin puntuación: algunos modelos de lenguaje pequeños o generadores de voz pueden emitir texto sin puntuación; este modelo puede corregirlo antes de la publicación.
- Indexación y búsqueda de documentos: al normalizar la puntuación y las mayúsculas, facilita la indexación de transcripciones y su búsqueda con motores de texto completo.
- Creación de datos de entrenamiento: puede usarse para etiquetar automáticamente grandes volúmenes de texto sin puntuación, generando conjuntos de datos anotados para otros modelos de NLP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o GSM8K) para este modelo. La información disponible incluye una comparación de las variantes MLX con el modelo ONNX FP32 original, medida sobre la salida formateada de una transcripción de 6.118,72 segundos de una conferencia. La tabla siguiente resume el acuerdo de caracteres y palabras, el tamaño del archivo y el tiempo de inferencia de la variante Q5 respecto al original y a otras cuantizaciones.

| Variante | Tamaño del archivo | Acuerdo de caracteres | Acuerdo de palabras | Tiempo de inferencia |
|---|---|---|---|---|
| ONNX FP32 (original) | 209,5 MB | 100,0000 % | 100,0000 % | 2,044 s |
| MLX FP16 | 104,7 MB | 99,9916 % | 99,9559 % | 0,417 s |
| MLX Q8 | 55,8 MB | 99,9536 % | 99,7575 % | 0,260 s |
| MLX Q6 | 42,8 MB | 99,8777 % | 99,3681 % | 0,346 s |
| MLX Q5 (este modelo) | 36,2 MB | 99,6066 % | 97,9941 % | 0,350 s |
| MLX Q4 | 29,7 MB | 99,2899 % | 96,4879 % | 0,330 s |

El acuerdo se calcula como `100 − distancia de Levenshtein normalizada` entre la salida del modelo y la del ONNX FP32. El tiempo de inferencia se midió en la misma máquina y excluye el arranque del proceso y la carga del modelo.

## Requisitos de hardware

- El modelo ocupa 36,2 MB en su versión Q5, por lo que puede cargarse en la memoria de cualquier dispositivo moderno, incluso en una Raspberry Pi o en un teléfono.
- Al ser un modelo MLX, está optimizado para Apple Silicon (Macs con chips M1/M2/M3). Se puede ejecutar en CPU o GPU unificada sin necesidad de una tarjeta gráfica dedicada.
- Para otros entornos, se puede usar el modelo ONNX original o convertir los pesos a formato GGUF u otros, aunque no se proporcionan instrucciones específicas.
- Se recomienda el uso de la librería MLX para la inferencia, o el proyecto Granite-MLX, que integra este modelo como opción de puntuación por defecto.
- El tiempo de inferencia medido para Q5 es de 0,350 s para un texto de ~71k caracteres, lo que equivale a aproximadamente 200k caracteres por segundo. En una MacBook con chip M1, el proceso completo (incluyendo carga) es adecuado para uso en tiempo real en transcripciones de voz.

## Comparativa con modelos similares

La tabla siguiente compara las variantes de cuantización del mismo modelo base, ya que no se dispone de datos de otros modelos de restauración de puntuación con las mismas características.

| Modelo | Tamaño | Acuerdo de caracteres | Acuerdo de palabras | Licencia | Formato |
|---|---|---|---|---|---|
| ONNX FP32 (original) | 209,5 MB | 100,00 % | 100,00 % | Apache 2.0 | ONNX |
| MLX Q8 | 55,8 MB | 99,95 % | 99,76 % | Apache 2.0 | safetensors (MLX) |
| MLX Q5 (este modelo) | 36,2 MB | 99,61 % | 97,99 % | Apache 2.0 | safetensors (MLX) |
| MLX Q4 | 29,7 MB | 99,29 % | 96,49 % | Apache 2.0 | safetensors (MLX) |

No se han encontrado otros modelos de restauración de puntuación y capitalización comparables con el mismo tamaño y licencia en la información disponible.

## Limitaciones y advertencias

- El modelo está entrenado únicamente para inglés (en); no funciona con otros idiomas.
- La entrada debe estar en minúsculas y sin puntuación; si se le suministra texto con mayúsculas o puntuación, el rendimiento puede degradarse.
- La cuantización Q5 introduce una pérdida de calidad respecto al modelo original, especialmente en la precisión de las palabras (acuerdo del 97,99 %), lo que puede afectar a palabras poco frecuentes o nombres propios.
- No se han documentado sesgos específicos, pero al ser un modelo de NLP, puede presentar sesgos derivados de los datos de entrenamiento originales (no especificados).
- No se dispone de información sobre la longitud máxima de contexto que soporta; se recomienda probar con textos de la longitud esperada en el caso de uso.
- La licencia Apache 2.0 permite uso comercial, pero los pesos convertidos se distribuyen con la misma licencia; se debe mantener el aviso de copyright si se redistribuyen.
- El modelo no es un LLM generativo; no genera texto libre, solo restaura formato sobre texto existente.

## Enlaces

- [Hugging Face - iky1e/punctuation-fullstop-truecase-english-mlx-q5](https://huggingface.co/iky1e/punctuation-fullstop-truecase-english-mlx-q5)
- [Modelo original - 1-800-BAD-CODE/punctuation_fullstop_truecase_english](https://huggingface.co/1-800-BAD-CODE/punctuation_fullstop_truecase_english)
- [Proyecto Granite-MLX](https://github.com/kylehowells/Granite-MLX)
- [Repositorio punctuators de 1-800-BAD-CODE](https://github.com/1-800-BAD-CODE/punctuators)
- [Variantes MLX del modelo (FP16, Q8, Q6, Q4)](https://huggingface.co/iky1e)
