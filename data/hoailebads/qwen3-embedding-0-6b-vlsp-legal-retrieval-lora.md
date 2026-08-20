# hoailebads/Qwen3-Embedding-0.6B-VLSP-Legal-Retrieval-LoRA

## Resumen

Qwen3-Embedding-0.6B-VLSP-Legal-Retrieval-LoRA es un modelo de recuperación (retrieval) bi-encoder desarrollado por hoailebads para la tarea de búsqueda de artículos legales vietnamitas en el marco del desafío VLSP Legal Text Retrieval. Se construye sobre el modelo base Qwen/Qwen3-Embedding-0.6B, que permanece congelado, y utiliza una arquitectura dual-LoRA: dos adaptadores LoRA independientes que comparten el mismo modelo base — `query_adapter` para codificar preguntas y `passage_adapter` para codificar artículos de ley. Esta separación permite optimizar cada representación por separado, lo que mejora la calidad de la recuperación frente a un único adaptador.

El modelo es el mejor checkpoint de un proceso de entrenamiento secuencial de 22 fases, medido sobre un conjunto de evaluación de 219 preguntas únicas del corpus VLSP. Alcanza un Recall@100 de 94.98, lo que lo convierte en la primera etapa de un pipeline de recuperación en dos fases: este modelo genera los 100 candidatos principales y un reranker (Qwen3-Reranker-8B) los reordena posteriormente. Su relevancia radica en que aborda un dominio especializado —texto legal vietnamita— con una solución eficiente y de bajo coste computacional, al tratarse de un modelo de 0.6B parámetros con adaptadores LoRA que solo añaden un 3.28% de parámetros entrenables por adaptador.

La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas. El modelo está diseñado exclusivamente para vietnamita y no se ha evaluado en otros idiomas o dominios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bi-encoder dual-LoRA sobre Qwen3-Embedding-0.6B (base congelado) |
| Parametros totales | 615,961,600 (base) + 2 × 20,185,088 (adaptadores LoRA) = 656,331,776 |
| Parametros activos | 20,185,088 por adaptador (3.28% del base) |
| Longitud de contexto | 1024 tokens (max_length utilizado en entrenamiento e inferencia) |
| Tipos de cuantizacion | bf16 (entrenamiento); no se documentan cuantizaciones adicionales |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura bi-encoder con dos adaptadores LoRA independientes sobre un modelo base Qwen3-Embedding-0.6B congelado. Cada adaptador se aplica a las proyecciones `q, k, v, o, gate, up, down_proj` con rango `r=16`, `alpha=32` y dropout `0.05`. La codificación de consultas y pasajes se realiza por separado: las preguntas se procesan con `query_adapter` y los artículos legales con `passage_adapter`. El pooling consiste en tomar el hidden state del último token real y aplicar normalización L2. No se utiliza ningún prefijo de instrucción; el texto se codifica en bruto.

El entrenamiento se realizó en múltiples fases secuenciales, donde cada fase mina hard negatives a partir del checkpoint anterior y continúa el entrenamiento sobre una variante sintética nueva. La fase final, `train_synthetic_hoi_dap`, utilizó un dataset de 2,038 muestras compuesto por datos originales de VLSP y preguntas sintéticas generadas en formato pregunta-respuesta. La función de pérdida fue `fast_cached_mnrl_dual` (multiple negatives ranking con caché, temperatura 0.05), con 1 hard negative por consulta, batch size 256 (mini-batch cacheado de 16), 5 épocas y 20 pasos de optimización. El entrenamiento se ejecutó en 2 GPUs con torchrun, precisión bf16 y Flash Attention 2. La pérdida de entrenamiento descendió de 1.5675 a 1.3703.

## Capacidades

- Recuperación de artículos legales vietnamitas a partir de preguntas en lenguaje natural.
- Codificación de texto en vectores densos de 1024 dimensiones, normalizados L2, listos para búsqueda por similitud coseno o producto interno.
- Soporte de búsqueda semántica en corpus de gran tamaño (67,561 chunks / 59,628 artículos en la evaluación).
- Generación de listas de candidatos top-k para pipelines de retrieval-augmented generation (RAG) o reranking.
- Funcionamiento como bi-encoder: las representaciones de consultas y pasajes se precomputan y almacenan para búsqueda eficiente.
- No soporta generación de texto, tool calling ni capacidades multimodales; es exclusivamente un modelo de embeddings.

## Casos de uso

- Búsqueda semántica en corpus legales vietnamitas: el modelo permite indexar artículos de ley y recuperar los más relevantes ante una consulta en lenguaje natural, gracias a su representación dual optimizada para el dominio legal.
- Primera fase de un pipeline RAG legal: genera los 100 candidatos principales que luego un reranker (p. ej., Qwen3-Reranker-8B) reordena, reduciendo el coste computacional del reranking al limitar el número de pasajes a procesar.
- Asistente jurídico para ciudadanos: dado un corpus de normativa vietnamita, el modelo puede responder a preguntas como "¿Cuál es la multa por no usar casco en moto?" recuperando los artículos pertinentes.
- Herramienta de investigación para abogados y estudiantes de derecho: permite localizar rápidamente disposiciones legales específicas a partir de descripciones de situaciones o conceptos.
- Sistema de soporte a la decisión en despachos: integrado en un flujo de trabajo que combina recuperación y reranking, facilita la localización de jurisprudencia y normativa aplicable a casos concretos.
- Evaluación de cobertura de corpus: al conocer el Recall@100 (94.98), se puede usar para detectar lagunas en la base de conocimiento legal, identificando consultas que no obtienen respuestas correctas entre los candidatos.

## Benchmarks y rendimiento

Resultados sobre el conjunto de evaluación VLSP (219 preguntas únicas, corpus de 67,561 chunks / 59,628 artículos, FAISS inner-product, dedup por `aid`):

| K | Recall@K | Precision@K | Hit@K |
|---|---|---|---|
| 1 | 45.81 | 52.97 | 52.97 |
| 3 | 62.60 | 25.27 | 71.69 |
| 5 | 69.29 | 16.99 | 79.00 |
| 10 | 80.90 | 10.18 | 89.95 |
| 100 | 94.98 | 1.25 | 98.63 |

Comparación con otros checkpoints del mismo proceso de entrenamiento (mismo conjunto de evaluación):

| Run | R@1 | R@10 | R@100 |
|---|---|---|---|
| **train_synthetic_hoi_dap** (este modelo) | **45.81** | 80.90 | **94.98** |
| train_synthetic_only_hn (checkpoint padre) | 44.22 | 81.28 | 94.18 |
| train_dual_syn_ques_filtered_cont | 44.22 | 77.82 | 94.98 |
| train_dual_vlsp_only_original | 43.61 | 78.77 | 94.33 |
| train_synthetic_binh_dan | 42.62 | 81.20 | 93.42 |
| train_synthetic_dong_nghia_new | 42.54 | 81.43 | 94.03 |
| single-adapter LoRA (train_single_vlsp_only) | 41.02 | 79.22 | 94.10 |
| fast_cached_mnrl_hn_dual_syn_ques (versión temprana) | 32.99 | 68.38 | 86.68 |

Los resultados muestran que la arquitectura dual-adapter supera a la de adaptador único en +4.8 puntos de R@1, y que el aumento de datos sintéticos en formato pregunta-respuesta aporta +1.6 puntos adicionales sobre el checkpoint padre.

## Requisitos de hardware

- Al tratarse de un modelo base de 0.6B parámetros con adaptadores LoRA, la inferencia es ligera y puede ejecutarse en GPUs de consumo.
- VRAM estimada: aproximadamente 2-4 GB en bf16 para el modelo base más los adaptadores, dependiendo de la longitud de los textos procesados (máximo 1024 tokens).
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1660, RTX 2060, RTX 3060, RTX 4090). También es viable en CPU para lotes pequeños, aunque con mayor latencia.
- Opciones de despliegue: al ser un modelo PEFT, se puede cargar con la librería `peft` de HuggingFace y `transformers`. Para búsqueda a gran escala, se recomienda precomputar los embeddings de los pasajes y usar FAISS u otro índice vectorial.
- Latencia y throughput: no se han publicado mediciones específicas. Dado el tamaño reducido, se espera una latencia de decenas de milisegundos por lote en GPU moderna, pero estos datos no están disponibles.

## Comparativa con modelos similares

La comparación más directa es con los otros checkpoints del mismo autor, ya que comparten base y tarea. No se dispone de información sobre modelos externos de recuperación legal vietnamita para comparar.

| Modelo | Arquitectura | R@1 | R@10 | R@100 | Licencia |
|---|---|---|---|---|---|
| Qwen3-Embedding-0.6B-VLSP-Legal-Retrieval-LoRA (este) | Dual-LoRA bi-encoder | 45.81 | 80.90 | 94.98 | Apache 2.0 |
| Qwen3-Embedding-0.6B-VLSP-Legal-Retrieval-LoRA (single-adapter) | Single-LoRA bi-encoder | 41.02 | 79.22 | 94.10 | Apache 2.0 |
| Qwen3-Embedding-0.6B-VLSP-Legal-Retrieval-LoRA (versión temprana) | Dual-LoRA bi-encoder | 32.99 | 68.38 | 86.68 | Apache 2.0 |

La ventaja del modelo presentado es su mejor Recall@1 y Recall@100, lo que lo hace más adecuado como primera etapa de recuperación. La versión single-adapter es más simple de desplegar (un solo adaptador) pero rinde peor.

## Limitaciones y advertencias

- El modelo solo se ha evaluado en textos legales vietnamitas; no hay evidencia de su rendimiento en otros dominios o idiomas.
- La arquitectura dual-LoRA requiere cargar ambos adaptadores y alternar entre ellos según el tipo de texto. Usar el adaptador incorrecto (p. ej., `passage_adapter` para consultas) degrada significativamente los resultados.
- No se debe añadir ningún prefijo de instrucción al codificar; hacerlo desvía la distribución y empeora la recuperación.
- El pooling debe realizarse sobre el hidden state del último token real, seguido de normalización L2. Cualquier otra estrategia de pooling invalida los resultados.
- El modelo es un encoder, no genera texto; no es adecuado para tareas de generación o diálogo.
- El entrenamiento se realizó con un dataset relativamente pequeño (2,038 muestras) y hard negatives minados del propio checkpoint padre, lo que puede introducir sesgos del proceso de minería.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo no ha sido auditado para producción legal real; las decisiones basadas en sus resultados deben ser revisadas por profesionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hoailebads/Qwen3-Embedding-0.6B-VLSP-Legal-Retrieval-LoRA
- Repositorio de código y métricas completas: https://github.com/hoaileba/Qwen-Retrieval-Tuning
- Reranker principal asociado: https://huggingface.co/hoailebads/Qwen3-Reranker-8B-VLSP-Legal-LoRA
- Reranker ligero asociado: https://huggingface.co/hoailebads/Qwen3-Reranker-0.6B-VLSP-Legal-LoRA
- Versión retrieval para corpus Zalo: https://huggingface.co/hoailebads/Qwen3-Embedding-0.6B-Zalo-Legal-Retrieval-LoRA
