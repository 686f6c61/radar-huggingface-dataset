# mbehr90/multilingual-e5-large-instruct-nvfp4

## Resumen

El modelo `mbehr90/multilingual-e5-large-instruct-nvfp4` es una cuantización NVFP4 (4 bits) del modelo de embeddings multilingüe `intfloat/multilingual-e5-large-instruct`, desarrollado originalmente por Microsoft Research. Esta versión cuantizada ha sido producida por el usuario mbehr90 utilizando la librería `llm-compressor` 0.13.0 y está pensada para su despliegue eficiente en entornos de producción con vLLM. El modelo base emplea una arquitectura XLM-RoBERTa-large con 24 capas, 560 millones de parámetros y genera vectores densos de 1024 dimensiones, soportando aproximadamente 100 idiomas.

La cuantización NVFP4 reduce el tamaño del checkpoint de 1068 MiB a 675 MiB (una reducción del 37%) manteniendo un rendimiento casi idéntico en tareas de similitud semántica, aunque con una pérdida de 1.7 puntos porcentuales en recuperación de información (nDCG@10). El modelo está diseñado para ser servido mediante vLLM con el modo `pooling`, y su licencia MIT permite uso comercial sin restricciones. Es relevante porque ofrece una alternativa ligera y rápida para sistemas de búsqueda semántica y clasificación multilingüe en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-large) con cuantización NVFP4 en capas lineales |
| Parametros totales | 559.890.432 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base XLM-RoBERTa-large soporta 512 tokens, pero no se especifica en la documentación) |
| Tipos de cuantizacion | NVFP4 (4 bits) en capas lineales; embeddings, posiciones, pooler y cabezas de clasificación en bf16 |
| Idiomas soportados | aproximadamente 100 idiomas (según fuentes externas; la model card no lo detalla) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `intfloat/multilingual-e5-large-instruct` es un encoder transformer basado en XLM-RoBERTa-large, con 24 capas y una dimensión de embedding de 1024. Fue entrenado mediante contraste pre-training sobre 1.000 millones de pares de textos multilingües, seguido de un fine-tuning con instrucciones (instruction tuning) para mejorar su capacidad de seguir tareas de recuperación y similitud semántica. El modelo resultante produce vectores densos que pueden usarse para retrieval, clustering, clasificación y otras tareas de representación de texto.

La versión NVFP4 aquí presentada es una cuantización post-entrenamiento realizada con `llm-compressor` 0.13.0. Solo las capas lineales del encoder se cuantizan a NVFP4 (4 bits); el resto de componentes (embeddings, posiciones, token-type, pooler y cabezas de clasificación) permanecen en bf16. El proceso de cuantización requirió una corrección manual del mecanismo de fusión de escalas en vLLM, ya que la implementación original de `llm-compressor` no reconocía los nombres de capas `query`/`key`/`value` típicos de BERT/RoBERTa, lo que provocaba una degradación catastrófica del rendimiento (nDCG@10 de 0.042). Tras añadir estos nombres a la lista de fusión, el rendimiento se recuperó hasta 0.704.

## Capacidades

- Generación de embeddings densos de 1024 dimensiones para texto multilingüe.
- Recuperación de información (retrieval) y reranking de documentos.
- Similitud semántica entre frases y párrafos.
- Clustering y clasificación de textos.
- Soporte multilingüe (aproximadamente 100 idiomas).
- Fine-tuning posterior posible sobre el modelo base (aunque la versión cuantizada está pensada para inferencia).
- Integración con vLLM para servir embeddings a través de API OpenAI compatible.
- No soporta generación de texto, tool calling ni agentes, al ser un modelo encoder.

## Casos de uso

- Búsqueda semántica en bases de conocimiento multilingües: el modelo puede indexar documentos en varios idiomas y recuperar los más relevantes para una consulta, aprovechando su ventana de contexto de 512 tokens (si se confirma) y su capacidad de representación densa.
- Reranking de resultados de búsqueda: dado un conjunto de candidatos recuperados por un sistema más simple (por ejemplo, BM25), el modelo puede reordenarlos según similitud semántica, mejorando la precisión final.
- Clasificación de tickets de soporte en empresas internacionales: los embeddings generados permiten agrupar o clasificar consultas de clientes en múltiples idiomas sin necesidad de traducción previa.
- Detección de duplicados en bases de datos textuales: comparando embeddings de pares de documentos se pueden identificar entradas redundantes en catálogos, foros o repositorios.
- Sistemas de recomendación basados en contenido: representar artículos, productos o noticias como vectores permite recomendar elementos similares según su significado.
- Análisis de sentimiento y opinión en redes sociales multilingües: los embeddings pueden alimentar clasificadores ligeros para tareas de análisis de sentimiento en varios idiomas.

## Benchmarks y rendimiento

La model card del autor proporciona mediciones comparativas entre la versión bf16 original, una cuantización FP8 y la versión NVFP4, evaluadas en tareas de retrieval y similitud semántica. Los resultados se resumen en la siguiente tabla:

| Variante | Tamaño | SciFact nDCG@10 | STS-B de ρ | STS17 en-de ρ | Throughput (textos/s, bs=256) |
|---|---|---|---|---|---|
| bf16 original | 1068 MiB | 0.7204 | 0.8347 | 0.8525 | 1488 |
| FP8 | 802 MiB | 0.7164 | 0.8349 | 0.8526 | 1511 |
| NVFP4 | 675 MiB | 0.7036 | 0.8371 | 0.8440 | no disponible |

La pérdida de rendimiento en retrieval (SciFact) es de 1.7 puntos porcentuales respecto a bf16, mientras que en similitud semántica (STS-B y STS17) el rendimiento se mantiene prácticamente igual o incluso ligeramente superior. No se han publicado resultados de benchmarks adicionales (como MTEB completo) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint NVFP4 ocupa 675 MiB, por lo que la inferencia puede ejecutarse en cualquier GPU con al menos 1 GB de VRAM, incluyendo GPUs consumer como la NVIDIA GTX 1060 o superiores.
- GPU recomendadas: para un despliegue óptimo con vLLM se recomienda una GPU con soporte para FP4 (por ejemplo, NVIDIA H100, A100 o RTX 4090 con capacidades de cómputo adecuadas). En GPUs sin soporte nativo para NVFP4, vLLM puede emular la cuantización, aunque con menor eficiencia.
- Opciones de despliegue: vLLM (con `--runner pooling`), también puede cargarse con transformers si se desactiva la cuantización o se usa el modelo base bf16.
- Latencia y throughput: no se han medido para NVFP4 en la documentación; la versión FP8 alcanza 1511 textos/s con batch size 256 en una H100, y se espera que NVFP4 sea similar o superior.
- El modelo es adecuado para entornos con restricciones de memoria o despliegue en edge, dado su reducido tamaño.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tamaño | Licencia | Rendimiento (SciFact nDCG@10) |
|---|---|---|---|---|---|
| multilingual-e5-large-instruct (bf16) | 560M | 512 (no confirmado) | 1068 MiB | MIT | 0.7204 |
| multilingual-e5-large-instruct (FP8) | 560M | 512 (no confirmado) | 802 MiB | MIT | 0.7164 |
| multilingual-e5-large-instruct (NVFP4) | 560M | 512 (no confirmado) | 675 MiB | MIT | 0.7036 |
| BGE-M3 (para comparación) | 568M | 8192 | ~1.1 GB | MIT | no disponible |

La comparativa se centra en las variantes del mismo modelo base, ya que no se dispone de datos de otros modelos en las mismas tareas. La versión NVFP4 ofrece el menor tamaño con una pérdida mínima de rendimiento, siendo la opción más ligera para despliegue en producción.

## Limitaciones y advertencias

- La cuantización NVFP4 introduce una pérdida de 1.7 puntos porcentuales en tareas de retrieval (nDCG@10) respecto al modelo bf16, lo que puede ser relevante en aplicaciones donde la precisión de recuperación es crítica.
- El modelo no soporta generación de texto ni tareas de razonamiento; es exclusivamente un encoder de embeddings.
- La longitud de contexto no está documentada en la model card; se asume que es la del modelo base (512 tokens), pero no se ha confirmado.
- El proceso de cuantización manual requiere conocer el bug de fusión de escalas en vLLM; si se intenta cuantizar un modelo BERT/RoBERTa con `llm-compressor` sin la corrección, el rendimiento puede degradarse drásticamente.
- Aunque la licencia es MIT, el modelo base puede tener restricciones adicionales en cuanto a atribución; se recomienda revisar la documentación original.
- No se han evaluado sesgos o alucinaciones específicos de esta versión cuantizada; el modelo base puede heredar sesgos de los datos de entrenamiento.

## Enlaces

- Modelo cuantizado: https://huggingface.co/mbehr90/multilingual-e5-large-instruct-nvfp4
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-large-instruct
- Paper técnico de E5 multilingüe: https://arxiv.org/html/2402.05672v1
- Repositorio de llm-compressor: https://github.com/vllm-project/llm-compressor
- Documentación de vLLM: https://docs.vllm.ai
