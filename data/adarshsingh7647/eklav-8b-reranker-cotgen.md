# AdarshSingh7647/Eklav-8B-Reranker-CotGen

## Resumen

Eklav-8B-Reranker-CotGen es un modelo de reranking de pasajes desarrollado por AdarshSingh7647, construido sobre el modelo base Qwen/Qwen3-8B. Forma parte de la familia Eklav, cuyo objetivo es entrenar a un modelo para que continúe el razonamiento de un profesor a partir de una traza parcial, en lugar de imitar la traza completa. Este checkpoint concreto es el baseline de destilación de cadena de pensamiento (CoT) estándar, es decir, un fine-tuning con SFT sobre la traza completa, utilizado para medir la mejora del método Eklav a esta escala.

El modelo está especializado en tareas de reranking de pasajes, evaluado en los benchmarks BRIGHT y NevIR, y se distribuye como un checkpoint fusionado en bf16. Con 8.190 millones de parámetros, es un modelo de tamaño medio que puede ejecutarse en GPUs de consumo con cuantización. Su relevancia radica en que explora una alternativa a la destilación de CoT tradicional para mejorar la calidad del reranking en sistemas de recuperación de información.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-8B) |
| Parametros totales | 8.190.735.360 (8,19B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint bf16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (merged bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer causal con arquitectura estándar de decoder-only. El entrenamiento consiste en un fine-tuning supervisado (SFT) sobre trazas completas de cadena de pensamiento (full trace CoT), generadas por un profesor. En este baseline, el modelo aprende a reproducir la traza completa del profesor y a generar la respuesta final. La diferencia con el método Eklav es que este último condiciona el razonamiento del estudiante a una traza parcial del profesor, eliminando la cola que revela la respuesta, mientras que aquí se usa la traza completa.

No se especifican detalles sobre el dataset de entrenamiento, el número de tokens ni el uso de técnicas como RLHF o DPO. El checkpoint se publica fusionado en bf16, listo para inferencia con transformers.

## Capacidades

- Reranking de pasajes: el modelo puntúa la relevancia de documentos frente a una consulta, orientado a benchmarks como BRIGHT y NevIR.
- Generación de texto: al ser un modelo causal, puede generar texto, aunque su uso principal es el reranking.
- Razonamiento de cadena de pensamiento: entrenado para producir razonamientos intermedios antes de la respuesta, lo que mejora la calidad en tareas de retrieval complejas.
- Integración con pipelines de generación aumentada por recuperación (RAG): puede usarse como reranker en sistemas de búsqueda.
- No se documentan capacidades de tool calling, visión, audio ni multilingüismo específicas.

## Casos de uso

- Mejora de motores de búsqueda internos: el modelo puede reranker los resultados de una búsqueda inicial (por ejemplo, BM25 o embeddings) para reordenar los documentos más relevantes, aprovechando su razonamiento CoT para entender consultas complejas.
- Pipelines RAG en producción: integrado como reranker entre la recuperación inicial y la generación final, reduce el ruido y mejora la precisión de las respuestas en asistentes conversacionales.
- Recuperación de información en dominios especializados: útil para reordenar pasajes en bases de conocimiento técnicas o científicas, donde la relevancia depende de matices semánticos.
- Evaluación de sistemas de búsqueda: sirve como baseline para comparar métodos de destilación de CoT en reranking, como se hace en el paper de TabRank.
- Filtrado de documentos en procesos de due diligence: puede priorizar pasajes relevantes en grandes volúmenes de texto legal o financiero.
- Investigación académica en retrieval: permite experimentar con destilación de razonamiento y comparar arquitecturas de reranking a escala 8B.

## Benchmarks y rendimiento

El único dato publicado es el rendimiento en BRIGHT, con un nDCG@10 promedio de 31,5. No se proporcionan resultados desglosados por dominio ni comparaciones con otros modelos.

| Benchmark | Metrica | Resultado |
|---|---|---|
| BRIGHT | nDCG@10 (promedio) | 31,5 |

No se han publicado resultados en NevIR ni en otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en bf16 ocupa aproximadamente 16,4 GB, por lo que se necesitan al menos 20 GB de VRAM para cargar el modelo completo. Con cuantización a 4 bits (por ejemplo, GPTQ o AWQ), la huella se reduce a unos 5-6 GB, permitiendo su ejecución en GPUs de consumo como RTX 3090, RTX 4090 o incluso RTX 4060 Ti 16 GB.
- GPU recomendadas: para inferencia sin cuantizar, una A100 40 GB o H100; con cuantización, una RTX 4090 (24 GB) es suficiente.
- Opciones de despliegue: compatible con transformers, vLLM, TGI (text-generation-inference) y llama.cpp (si se convierte a GGUF). El modelo está marcado como compatible con endpoints de Hugging Face.
- Latencia y throughput: no se han publicado datos. En una RTX 4090, un modelo 8B en bf16 suele generar entre 20 y 40 tokens por segundo, pero depende de la longitud de la secuencia y del batch.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros rerankers de tamaño similar. Modelos como BGE-Reranker-v2-M3 (568M), Cohere Rerank 3 (no open source) o Qwen3-8B base (sin fine-tuning) podrían ser alternativas, pero no hay datos de rendimiento comparables en la informacion disponible.

## Limitaciones y advertencias

- Licencia no disponible: no se especifica la licencia del modelo, lo que genera incertidumbre sobre su uso comercial. Se recomienda contactar al autor antes de desplegarlo en producción.
- Especialización limitada: el modelo está entrenado específicamente para reranking de pasajes; su uso en otras tareas de generación puede degradar la calidad.
- Sesgos del modelo base: al derivar de Qwen3-8B, puede heredar sesgos presentes en los datos de preentrenamiento de Qwen.
- Riesgo de alucinación: al ser un modelo generativo, puede producir razonamientos plausibles pero incorrectos, lo que afecta a la fiabilidad en tareas de retrieval críticas.
- Sin datos de contexto: no se indica la longitud máxima de contexto soportada, lo que limita su aplicación en documentos muy largos.
- Evaluación limitada: solo se reporta un resultado en BRIGHT; falta evidencia en otros benchmarks y en escenarios reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdarshSingh7647/Eklav-8B-Reranker-CotGen
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Paper relacionado (TabRank, menciona CoTGen): https://arxiv.org/html/2607.25182v1
- Otros modelos del autor: https://huggingface.co/AdarshSingh7647/TabRankSingleTableNaive, https://huggingface.co/AdarshSingh7647/forge-CoTCond
