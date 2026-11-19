# perplexity-ai/pplx-embed-v2-late-0.6b

## Resumen

pplx-embed-v2-late-0.6b es un modelo de embeddings de recuperación de información basado en interacción tardía (late interaction, estilo ColBERT) desarrollado por Perplexity AI. Forma parte de una familia multimodal que indexa y consulta texto, imágenes y documentos visuales, generando un vector de 128 dimensiones por token y calculando la similitud consulta-documento mediante MaxSim en lugar de una única representación vectorial agregada.

El modelo se construye sobre Qwen3.5 con atención bidireccional y cuenta con 594.321.600 parámetros totales (340M activos según la model card). Su relevancia actual reside en que combina recuperación multimodal con un tamaño contenido: el modelo de 0.6B comparte espacio de embeddings con la variante de 9B, de modo que puede consultar un índice construido con el modelo grande sin reindexar, lo que abarata el despliegue en producción.

La familia se distribuye bajo licencia MIT y está pensada para integrarse en pipelines de búsqueda y RAG mediante `sentence-transformers` (versión 6.0.0 o superior) y `transformers` 5.4.0 o superior, sin necesidad de código Python personalizado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5) con atención bidireccional; recuperación por interacción tardía (ColBERT) |
| Parametros totales | 594.321.600 |
| Parametros activos | 340M (según model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | multilingüe (sin listado de idiomas concreto) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería sentence-transformers) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer derivado de Qwen3.5 con atención bidireccional, adaptado al paradigma de interacción tardía: en lugar de producir un único vector por documento, emite una matriz de embeddings de 128 dimensiones por token, y la puntuación se obtiene con MaxSim sobre las representaciones de consulta y documento. La familia es multimodal, ya que procesa texto, imágenes y documentos visuales dentro del mismo espacio de representación.

El entrenamiento se realizó por destilación desde un profesor ColBERT interno de 18B, usando datos de pares y tripletas y un objetivo de destilación a nivel de token de estilo LEAF. El modelo de 0.6B se ajustó de forma completa (full fine-tuning). La variante de 9B, con la que comparte espacio de embeddings, se entrenó ajustando completamente las ocho últimas capas del transformer y aplicando LoRA al resto de capas y al codificador visual.

## Capacidades

- Generación de embeddings multilingües para búsqueda semántica y recuperación densa.
- Recuperación multimodal: codifica texto, imágenes y documentos visuales (páginas escaneadas, capturas, PDF renderizados).
- Puntuación por interacción tardía (MaxSim) con vectores de 128 dimensiones por token.
- Interoperabilidad de índices: el modelo de 0.6B puede consultar un índice construido con el de 9B al compartir espacio de embeddings.
- Integración nativa con `sentence-transformers` mediante `MultiVectorEncoder`, con métodos `encode_query`, `encode_document` y `similarity`.
- Soporte de documentos en formato Markdown para recuperación sobre documentación técnica.
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento multi-paso por sí mismo; se usa como componente de recuperación dentro de pipelines mayores.

## Casos de uso

- RAG sobre documentación técnica: se indexan páginas en Markdown y se consultan con `encode_query`, aprovechando la puntuación MaxSim para recuperar pasajes con coincidencia léxica y semántica fina.
- Búsqueda sobre documentos escaneados: se renderizan páginas a imagen y se codifican con `encode_document`, permitiendo recuperación visual directa sin OCR previo.
- Motor de búsqueda interno multilingüe: el soporte multilingüe permite indexar corpus en varios idiomas y consultar en cualquiera de ellos dentro del mismo espacio vectorial.
- Indexación económica con consulta de alta calidad: se construye el índice con el modelo de 9B (mayor calidad de representación documental) y se consulta con el de 0.6B, reduciendo el coste de la ruta de consulta en producción.
- Recuperación en atención al cliente: indexación de base de conocimiento y tickets históricos para recuperar respuestas y artículos relevantes antes de pasarlos a un LLM generativo.
- Búsqueda de capturas y material visual: catalogación de imágenes de producto o material de soporte y recuperación por consulta textual gracias a la codificación conjunta texto-imagen.
- Evaluación de recuperación con MTEB/ViDoRe: el modelo está etiquetado para MTEB, lo que facilita su inclusión en suites de evaluación comparativa de retrievers.

## Benchmarks y rendimiento

| Modelo | Params activos | Dimensión | ViDoRe(v3) Image, nDCG@10 | ViDoRe(v3) Markdown, nDCG@10 |
|---|---|---|---|---|
| pplx-embed-v2-late-0.6b | 340M | 128 | 62,3% | 61,2% |
| pplx-embed-v2-late-9b | 7,4B | 128 | 65,2% | 64,7% |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto estándar; el modelo es un retriever y no un modelo generativo, por lo que esas métricas no aplican.

## Requisitos de hardware

- VRAM estimada para inferencia: con 594M parámetros, en fp16 requiere aproximadamente 1,2 GB de pesos; en fp32, unos 2,4 GB. El repo ocupa 2,4 GB en total.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM libre es suficiente; A100 y H100 quedan sobredimensionadas para este tamaño y solo se justifican por volumen de peticiones.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: `sentence-transformers` con `MultiVectorEncoder` (ruta oficial documentada). No se documentan en la información disponible integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Nótese que la interacción tardía genera una matriz por token, por lo que el almacenamiento del índice es sustancialmente mayor que con un modelo de vector único.

## Comparativa con modelos similares

| Modelo | Params | Dimensión | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| pplx-embed-v2-late-0.6b | 594M (340M activos) | 128/token | Sí | MIT | Interacción tardía, comparte espacio con la variante de 9B |
| pplx-embed-v2-late-9b | 7,4B (7,4B activos) | 128/token | Sí | MIT | Misma familia, mayor calidad (65,2% / 64,7% en ViDoRe v3) |
| Otros retrievers de interacción tardía (ColBERT, Jina-ColBERT, etc.) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- No admite entradas mixtas de texto e imagen en la misma llamada: deben usarse llamadas de codificación separadas para lotes de solo texto y de solo imagen.
- Requiere versiones concretas del stack: `sentence-transformers >= 6.0.0` y `transformers >= 5.4.0`; versiones anteriores no funcionan.
- Incompatibilidad de marcadores con PyLate: PyLate inserta los marcadores Q/D en la segunda posición, mientras que este modelo los espera en la primera, lo que puede degradar resultados si se usa esa librería sin ajuste.
- El coste de almacenamiento del índice es alto: un vector de 128 dimensiones por token multiplica el espacio frente a un retriever de vector único.
- No se documenta la longitud máxima de contexto, lo que impide planificar con precisión el troceado de documentos largos.
- No se detalla la lista de idiomas cubiertos ni el rendimiento por idioma dentro del soporte multilingüe.
- Riesgo de sesgo y de recuperación de contenido no deseado heredado de los datos de entrenamiento y del profesor de destilación; no se documentan análisis de sesgo.
- Licencia MIT: permite uso comercial sin restricciones adicionales, pero conviene verificar las condiciones de los datos subyacentes de Qwen3.5 y del corpus de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/perplexity-ai/pplx-embed-v2-late-0.6b
- Variante de 9B: https://huggingface.co/perplexity-ai/pplx-embed-v2-late-9b
- Blog de Perplexity sobre embeddings multimodales: https://www.perplexity.ai/hub/blog/multimodal-embeddings-beyond-a-single-vector
- Paper (arXiv 2610.29523): https://arxiv.org/abs/2610.29523
- Referencia del objetivo LEAF: https://aclanthology.org/2026.acl-long.2008/
- Hub de Perplexity: https://www.perplexity.ai/fr/hub
