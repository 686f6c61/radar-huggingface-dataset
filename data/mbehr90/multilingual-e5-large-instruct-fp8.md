# mbehr90/multilingual-e5-large-instruct-fp8

## Resumen

`mbehr90/multilingual-e5-large-instruct-fp8` es una versión cuantizada en FP8 dinámico del modelo de embeddings multilingüe `intfloat/multilingual-e5-large-instruct`, desarrollada por mbehr90. El modelo original es un encoder transformer basado en XLM-RoBERTa large, con 24 capas y dimensión de embedding 1024, entrenado para generar representaciones densas de texto en 100 idiomas. Esta variante FP8 reduce el tamaño del checkpoint de 1068 MiB a 802 MiB (un 25 % menos) manteniendo prácticamente intacto el rendimiento en tareas de retrieval y similitud semántica, según las mediciones del autor.

La cuantización se aplica únicamente a las capas lineales del encoder, mientras que los embeddings, la posición, el token-type, el pooler y las cabezas de clasificación permanecen en bf16. El modelo está pensado para despliegue eficiente en producción con vLLM, donde el ahorro de memoria no sacrifica el throughput. Es relevante para equipos que necesitan embeddings multilingües de alta calidad con un consumo de VRAM reducido, especialmente en entornos con GPUs limitadas o costes de inferencia sensibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (basado en XLM-RoBERTa large) |
| Parametros totales | 559.890.432 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8_DYNAMIC (capas lineales), bf16 (embeddings, pooler, cabezas) |
| Idiomas soportados | no disponible (el modelo base soporta 100 idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `intfloat/multilingual-e5-large-instruct` es un encoder transformer de 24 capas con dimensión de embedding 1024, inicializado desde XLM-RoBERTa large. Se entrenó en dos etapas: primero un preentrenamiento contrastivo sobre 1 billón de pares de texto débilmente supervisados, y después un ajuste fino con instrucciones para mejorar el seguimiento de tareas. La variante FP8 se obtiene aplicando cuantización FP8 dinámica a las capas lineales del encoder mediante `llm-compressor` 0.13.0, manteniendo el resto de componentes en bf16. No se aplicó RLHF ni DPO; la cuantización es puramente post-entrenamiento.

## Capacidades

- Generacion de embeddings densos para texto multilingüe (el modelo base cubre 100 idiomas).
- Búsqueda semántica y retrieval: recuperación de documentos relevantes mediante similitud coseno.
- Similitud semántica de textos (STS) en pares y entre idiomas.
- Clasificación de textos y clustering mediante representaciones vectoriales.
- Soporte de instrucciones: el modelo base fue ajustado para seguir instrucciones en tareas de embedding.
- Integración con vLLM para inferencia eficiente con agrupación (pooling) de embeddings.

## Casos de uso

- Búsqueda semántica multilingüe: indexar documentos en varios idiomas y recuperar los más relevantes para una consulta, usando los embeddings generados por el modelo. Su tamaño reducido permite desplegarlo en GPUs de gama media.
- Generación aumentada por recuperación (RAG): combinar el modelo con un almacén vectorial para alimentar a un LLM con contexto relevante. La cuantización FP8 reduce la huella de memoria sin degradar la calidad de los embeddings.
- Deduplicación de documentos: calcular similitud entre pares de textos para detectar duplicados o casi duplicados en grandes corpus, gracias a la capacidad de STS del modelo.
- Clasificación de textos: usar los embeddings como características de entrada para clasificadores ligeros (regresión logística, SVM) en tareas como análisis de sentimiento o categorización de tickets.
- Sistemas de recomendación: representar ítems y usuarios en el mismo espacio vectorial para recomendar contenido basado en similitud semántica.
- Análisis de sentimiento en redes sociales: procesar comentarios en múltiples idiomas y agruparlos por polaridad usando los embeddings, con un coste de inferencia reducido gracias a la cuantización.

## Benchmarks y rendimiento

El autor proporciona mediciones comparativas entre la variante bf16 original, la FP8 y una variante NVFP4 (también disponible). Los resultados se obtuvieron en NVIDIA H100 80 GB con vLLM 0.26.0.

| Variante | Tamano | SciFact nDCG@10 | STS-B de ρ | STS17 en-de ρ | texts/s (bs=256) |
|---|---|---|---|---|---|
| bf16 source | 1068 MiB | 0.7204 | 0.8347 | 0.8525 | 1488 |
| FP8 | 802 MiB | 0.7164 | 0.8349 | 0.8526 | 1511 |
| NVFP4 | 675 MiB | 0.7036 | 0.8371 | 0.8440 | – |

La variante FP8 mantiene el rendimiento dentro de 0.004 puntos en SciFact y prácticamente idéntico en STS, con un throughput ligeramente superior al bf16. El ahorro de memoria es del 25 % sin penalización en velocidad.

## Requisitos de hardware

- VRAM estimada: 802 MiB para el checkpoint FP8, más overhead de runtime. Cabe en cualquier GPU consumer con al menos 2 GB de VRAM.
- GPUs recomendadas: NVIDIA H100 para despliegue a gran escala; también funciona en RTX 3090, RTX 4090, A100, etc. La cuantización FP8 requiere soporte de hardware (Ampere o posterior).
- Opciones de despliegue: vLLM (comando `vllm serve mbehr90/multilingual-e5-large-instruct-fp8 --runner pooling`), también puede cargarse con Transformers si se gestiona la cuantización.
- Latencia y throughput: 1511 textos/s con batch size 256 en H100, según las mediciones del autor. En GPUs más pequeñas el throughput será menor, pero la huella de memoria reducida permite batches mayores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano | Licencia | Notas |
|---|---|---|---|---|---|
| intfloat/multilingual-e5-large-instruct (bf16) | 559 M | no disponible | 1068 MiB | MIT | Modelo original sin cuantizar |
| mbehr90/multilingual-e5-large-instruct-fp8 | 559 M | no disponible | 802 MiB | MIT | Cuantización FP8, -25 % tamano |
| mbehr90/multilingual-e5-large-instruct-nvfp4 | 559 M | no disponible | 675 MiB | MIT | Cuantización NVFP4, -37 % tamano, ligera pérdida en retrieval |

No se dispone de comparación con otros modelos de embeddings multilingües (p. ej., BGE-M3, E5-mistral) en la información proporcionada.

## Limitaciones y advertencias

- La cuantización FP8 introduce una pérdida mínima en tareas de retrieval (0.004 nDCG@10 en SciFact), aunque en STS el rendimiento es prácticamente idéntico. Para casos de uso donde la precisión de retrieval sea crítica, conviene evaluar la variante bf16.
- El modelo base puede heredar sesgos de los datos de entrenamiento (XLM-RoBERTa large), aunque no se han documentado sesgos específicos en esta variante.
- La longitud de contexto no está documentada en la ficha; se recomienda consultar la documentación del modelo base para conocer el límite de tokens.
- La cuantización FP8 requiere hardware compatible (NVIDIA Ampere o posterior) y soporte en el runtime (vLLM). No funcionará en GPUs antiguas o en CPU.
- La licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantías sobre el rendimiento en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mbehr90/multilingual-e5-large-instruct-fp8
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-large-instruct
- Variante NVFP4: https://huggingface.co/mbehr90/multilingual-e5-large-instruct-nvfp4
- Repositorio de llm-compressor: https://github.com/vllm-project/llm-compressor
