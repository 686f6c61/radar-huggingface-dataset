# codefuse-ai/F2LLM-v2-4B

## Resumen

F2LLM-v2-4B es un modelo de embeddings de texto multilingüe desarrollado por el equipo CodeFuse de Alibaba, perteneciente a la familia F2LLM-v2, que incluye ocho tamaños desde 80M hasta 14B parámetros. Está diseñado para tareas de recuperación de información, búsqueda semántica y clasificación de texto, con un énfasis especial en lenguas de recursos medios y bajos, de las que soporta más de 200. El modelo se entrena sobre un conjunto curado de 60 millones de ejemplos públicos de alta calidad y se publica bajo licencia Apache 2.0, con acceso abierto a datos, código y checkpoints intermedios. Su arquitectura se basa en Qwen3, lo que le permite aprovechar un transformer estándar optimizado para generación de representaciones densas. La versión de 4B parámetros es la intermedia de la familia, pensada para equilibrar calidad de embeddings y coste computacional, y se distribuye en formato safetensors compatible con Transformers y Sentence Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3) |
| Parametros totales | 4.022.468.096 (4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en bfloat16) |
| Idiomas soportados | Más de 200, incluyendo en, zh, ru, es, fr, de, ar, nl, vi, hi, ko, ja, it, id, pt, pl, tr, da, th, sv, fa, uk, cs, no, el, ca, ro, fi, bg, tl, gl, my, hy, km, ne, hu, eu, he, lo, sw, az, lv, si, sk, tg, et, lt, ms, hr, is, sl, sr, ur, bn, af, ta, ka, te, ml, mn, nn, kk, cy, mr, sq, nb, mk, jv, kn, eo, la, gu, uz, am, oc, be, mg, vo, pa, lb, ht, br, ga, xh, tt, bs, yo |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

F2LLM-v2-4B es un modelo de embeddings basado en la arquitectura transformer de Qwen3, adaptado para producir representaciones densas de texto. No se trata de un modelo generativo, sino de un encoder que mapea frases o documentos a vectores de 2560 dimensiones (según el ejemplo de uso). El entrenamiento se realizó sobre un conjunto de datos compuesto por 60 millones de ejemplos públicos curados, con especial atención a lenguas de recursos medios y bajos. La familia F2LLM-v2 incluye modelos base y modelos instruct; los tres tamaños más pequeños (80M, 160M, 330M) se obtuvieron por poda y entrenamiento adicional a partir del modelo base de 0.6B. No se han publicado detalles sobre el uso de RLHF o DPO, pero la existencia de variantes instruct sugiere un ajuste por instrucciones para mejorar la calidad de los embeddings en tareas específicas. El modelo se libera de forma completamente abierta, incluyendo datos de entrenamiento, código y checkpoints intermedios.

## Capacidades

- Generación de embeddings de texto densos de alta calidad, con salida de 2560 dimensiones.
- Búsqueda semántica y recuperación de información multilingüe, con soporte para más de 200 idiomas.
- Clasificación de texto y agrupación semántica (clustering) mediante similitud coseno.
- Soporte para consultas y documentos con prompts diferenciados (encode_query y encode_document en Sentence Transformers).
- Capacidad multilingüe amplia, con énfasis en lenguas de bajos recursos tradicionalmente desatendidas.
- Compatible con el ecosistema Transformers y Sentence Transformers, así como con text-embeddings-inference para despliegue en producción.
- No es un modelo generativo: no produce texto, solo representaciones vectoriales.

## Casos de uso

- Búsqueda semántica en corpus multilingües: permite indexar documentos en decenas de idiomas y recuperar los más relevantes para una consulta en cualquier idioma soportado, gracias a su cobertura de más de 200 lenguas.
- Sistemas de recomendación basados en contenido: se pueden generar embeddings de artículos, productos o noticias y calcular similitudes para sugerir elementos relacionados al usuario.
- Clasificación automática de documentos: los embeddings pueden alimentar clasificadores supervisados o servir para agrupación no supervisada (clustering) de grandes volúmenes de texto en entornos empresariales.
- Deduplicación de contenido: comparando embeddings de documentos se pueden detectar duplicados o versiones casi idénticas en bases de datos multilingües.
- Recuperación aumentada por generación (RAG): como modelo de retrieval, puede integrarse en pipelines de RAG para seleccionar pasajes relevantes de una base de conocimiento antes de pasarlos a un LLM generativo.
- Búsqueda en bases de datos de código: aunque no está especializado en código, su soporte multilingüe permite indexar comentarios y documentación técnica en varios idiomas para búsqueda semántica.

## Benchmarks y rendimiento

La model card indica que la familia F2LLM-v2 establece un nuevo estado del arte en una amplia gama de benchmarks MTEB, incluyendo Code, European, Scandinavian, German, French, Spanish, Polish, Dutch, Japanese, Vietnamese, Thai, Indic, Persian, entre otros. Sin embargo, no se proporcionan valores numéricos concretos en la información disponible. Se remite al leaderboard de MTEB para consultar los resultados detallados. No se dispone de comparaciones numéricas con otros modelos en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 4.022 millones de parámetros. En bfloat16 (2 bytes por parámetro) ocupa aproximadamente 8 GB de memoria. Con overhead de activaciones y atención, se recomienda al menos 12 GB de VRAM para inferencia cómoda.
- GPU recomendadas: una RTX 3090, RTX 4090, A10, A100 o similar con 16 GB o más de VRAM es suficiente. Para despliegues de alta concurrencia, se recomienda A100 o H100.
- En GPU de consumo: cabe en RTX 3090/4090 (24 GB) sin problemas, y en GPUs de 16 GB como la RTX 4080 o la A10 de forma ajustada.
- Opciones de despliegue: compatible con Sentence Transformers, Transformers, y text-embeddings-inference (TEI) para servir endpoints de embeddings. También se puede usar con vLLM si se adapta, aunque no está documentado explícitamente.
- Latencia y throughput: no se han publicado datos específicos. Para un modelo de 4B, se espera una latencia de decenas de milisegundos por lote pequeño en GPU moderna, y throughput del orden de cientos de peticiones por segundo con batching adecuado en TEI.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de embeddings de tamaño similar (por ejemplo, BGE-M3, E5-mistral-7b, o GTE-Qwen2-7B). La model card menciona que F2LLM-v2 supera a los existentes en varios benchmarks MTEB, pero no se ofrecen cifras concretas. Se recomienda consultar el leaderboard de MTEB para comparaciones actualizadas. En términos de licencia, Apache 2.0 es más permisiva que muchas alternativas comerciales. El soporte de más de 200 idiomas es un diferenciador frente a modelos que cubren menos lenguas.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos o comportamientos discriminatorios. Al entrenarse sobre datos web públicos, puede heredar sesgos presentes en esos datos.
- Al ser un modelo de embeddings, no genera texto, por lo que el riesgo de alucinación no aplica directamente. Sin embargo, los embeddings pueden reflejar sesgos en la representación de ciertos grupos o lenguas.
- La longitud de contexto no está documentada; se desconoce el número máximo de tokens que puede procesar por entrada, lo que puede limitar su uso con documentos muy largos.
- El tamaño del repositorio (80.5 GB) sugiere que se incluyen múltiples archivos o versiones, pero no se especifican cuantizaciones disponibles. El uso en producción requerirá convertir el modelo a formatos optimizados (por ejemplo, ONNX o TensorRT) si se necesita menor latencia.
- Aunque la licencia Apache 2.0 permite uso comercial, es recomendable verificar la procedencia de los datos de entrenamiento para cumplir con requisitos legales específicos de cada jurisdicción.
- El modelo está orientado a embeddings; no es adecuado para tareas generativas o de razonamiento conversacional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/codefuse-ai/F2LLM-v2-4B
- Modelo base (Preview): https://huggingface.co/codefuse-ai/F2LLM-v2-4B-Preview
- Dataset de entrenamiento: https://huggingface.co/datasets/codefuse-ai/F2LLM-v2
- Paper (arXiv): https://arxiv.org/abs/2603.19223
- Leaderboard MTEB: https://huggingface.co/spaces/mteb/leaderboard
