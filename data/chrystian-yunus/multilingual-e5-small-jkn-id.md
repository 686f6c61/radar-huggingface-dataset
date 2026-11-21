# chrystian-yunus/multilingual-e5-small-jkn-id

## Resumen

`chrystian-yunus/multilingual-e5-small-jkn-id` es un modelo de embeddings de frases (sentence transformer) obtenido mediante fine-tuning de `intfloat/multilingual-e5-small` sobre un conjunto de datos de 2.397 pares, orientado aparentemente a la recuperación de información en el dominio normativo indonesio (regulaciones sobre BPJS Kesehatan y Jaminan Kesehatan). El autor es `chrystian-yunus`, un usuario individual de Hugging Face, y el modelo se publicó el 21 de noviembre de 2026. No es un modelo generativo: produce vectores densos de embedding para tareas de similitud semántica y recuperación.

Se trata de un BERT multilingüe de 117.653.760 parámetros (aproximadamente 118M), con arquitectura transformer encoder y licencia no declarada. El modelo base, `multilingual-e5-small`, es conocido por su buen rendimiento en recuperación multilingüe, pero este fine-tuning concreto está especializado en un corpus jurídico indonesio muy específico, lo que limita su generalización fuera de ese dominio.

Su relevancia es limitada: no tiene descargas ni likes, no declara licencia ni idiomas, y los benchmarks publicados en la model-index no especifican el dataset de evaluación ("Unknown"). Es útil como ejemplo de adaptación de dominio de un E5-small a un corpus legal concreto, pero no debe considerarse un modelo de propósito general listo para producción sin validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT), sentence-transformers |
| Parametros totales | 117.653.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo base E5-small: 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; admite cuantizacion posterior con herramientas estándar) |
| Idiomas soportados | no disponible (modelo base multilingüe; fine-tuning aparentemente en indonesio) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 0,5 GB |
| Librería | sentence-transformers |
| Modelo base | intfloat/multilingual-e5-small |
| Loss de entrenamiento | MultipleNegativesRankingLoss |
| Tamaño del dataset | 2.397 pares |
| Pipeline | sentence-similarity / feature-extraction |

## Arquitectura y entrenamiento

El modelo es un sentence transformer construido sobre `intfloat/multilingual-e5-small`, un encoder BERT multilingüe de 118M parámetros. La arquitectura es un transformer encoder estándar con pooling para producir embeddings de frase densos; no emplea atención lineal, SSM ni arquitecturas híbridas. El fine-tuning se realizó con la librería `sentence-transformers` y la función de pérdida `MultipleNegativesRankingLoss`, típica para entrenamiento contrastivo de recuperación con pares consulta-pasaje.

El conjunto de entrenamiento consta de 2.397 pares, un volumen muy reducido para fine-tuning de recuperación. Por los ejemplos de la model card, los pares siguen el formato `query: ...` / `passage: ...` propio de la familia E5, y el corpus parece compuesto por fragmentos de regulaciones indonesias (Perpres, PP, PMK) sobre BPJS Kesehatan y Jaminan Kesehatan. No se documentan detalles sobre composición del dataset, número de tokens de entrenamiento, ni si se aplicaron técnicas de RLHF o DPO (no aplicables a un modelo de embeddings). No se declara ninguna innovación técnica adicional.

## Capacidades

- Generación de embeddings densos de frases para similitud semántica y recuperación de información.
- Búsqueda semántica consulta-pasaje en corpus textuales, con formato `query:` / `passage:`.
- Recuperación de fragmentos normativos en indonesio (dominio aparente del fine-tuning).
- Extracción de features (`feature-extraction`) para pipelines de NLP downstream.
- Compatible con `text-embeddings-inference` y endpoints de Hugging Face.
- Capacidades multilingües heredadas del modelo base E5-small (no verificadas en este fine-tuning).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo generativo).
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Búsqueda semántica en bases de regulaciones sanitarias indonesias: indexar fragmentos de Perpres, PP y PMK y recuperar los pasajes relevantes para una consulta en lenguaje natural, aprovechando el entrenamiento específico sobre ese corpus.
- Asistente de consulta normativa para ciudadanos o funcionarios: dado un embedding de la pregunta, recuperar los artículos aplicables (por ejemplo, sobre límites de iuran o inversión de BPJS Kesehatan) y presentarlos al usuario.
- RAG (retrieval-augmented generation) sobre documentación legal: usar el modelo como recuperador en un pipeline que alimente un LLM generativo con los pasajes normativos correctos.
- Deduplicación y agrupación de cláusulas legales: calcular similitud entre fragmentos para detectar disposiciones equivalentes o repetidas en distintos reglamentos.
- Enrutamiento de consultas: clasificar preguntas de usuarios hacia el reglamento o artículo correspondiente mediante similitud con embeddings de referencia.
- Evaluación comparativa de recuperadores: servir como baseline de dominio específico frente a E5-small genérico en tareas de retrieval legal indonesio.
- Indexación de metadatos documentales: generar embeddings de títulos y secciones para navegación semántica de un repositorio normativo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index (dataset de evaluación no especificado, "Unknown"; no verificados):

| Metrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0,7488 |
| Cosine Accuracy@3 | 0,9052 |
| Cosine Accuracy@5 | 0,9289 |
| Cosine Accuracy@10 | 0,9479 |
| Cosine Precision@1 | 0,7488 |
| Cosine Precision@3 | 0,3760 |
| Cosine Precision@5 | 0,2408 |
| Cosine Precision@10 | 0,1299 |
| Cosine Recall@1 | 0,5944 |
| Cosine Recall@3 | 0,8276 |
| Cosine Recall@5 | 0,8738 |
| Cosine Recall@10 | 0,9233 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, MTEB) en la información disponible. Al no especificarse el dataset de evaluación, estos valores deben interpretarse con cautela y no son directamente comparables con resultados de MTEB.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB para los pesos, más overhead de activaciones (típicamente <1 GB en total para lotes pequeños).
- VRAM estimada en fp16: aproximadamente 0,25 GB de pesos.
- Cabe holgadamente en cualquier GPU consumer (GTX 1060 6GB, RTX 3060, RTX 4090) e incluso en CPU para lotes pequeños.
- GPU recomendadas para indexación a gran escala: A100, H100 o RTX 4090 para maximizar throughput de embeddings.
- Opciones de despliegue: `sentence-transformers`, `text-embeddings-inference` (TGI), `vLLM` (soporte de embeddings), `Ollama` (con conversión a GGUF), ONNX Runtime.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño (118M parámetros) se espera un throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| chrystian-yunus/multilingual-e5-small-jkn-id | 117,65M | no disponible (base: 512) | no disponible | Fine-tuning de dominio legal indonesio, dataset de 2.397 pares |
| intfloat/multilingual-e5-small | ~118M | 512 | MIT | Modelo base multilingüe de propósito general, evaluado en MTEB |
| intfloat/multilingual-e5-base | ~278M | 512 | MIT | Versión mayor del mismo family, mayor calidad a mayor coste |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | ~118M | 128 | Apache 2.0 | Alternativa multilingüe ligera para similitud de frases |

La comparación directa de rendimiento con estos modelos no es posible con rigor porque el benchmark del modelo evaluado no especifica dataset. El modelo base E5-small cuenta con resultados públicos en MTEB, mientras que este fine-tuning no.

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeño (2.397 pares), con riesgo alto de sobreajuste al corpus normativo indonesio concreto y pobre generalización fuera de él.
- El benchmark declarado no especifica el dataset de evaluación, por lo que los valores de accuracy y recall no son verificables ni comparables de forma fiable.
- Licencia no declarada: no se puede asumir uso comercial permitido; es necesario contactar al autor antes de cualquier despliegue en producción.
- Idiomas soportados no declarados: aunque el modelo base es multilingüe, el fine-tuning parece centrado en indonesio y podría degradar el rendimiento en otros idiomas.
- Riesgo de sesgo hacia el vocabulario y estilo de los reglamentos usados en el entrenamiento (BPJS Kesehatan, Jaminan Kesehatan).
- No es un modelo generativo: no produce texto, no razona, no ejecuta tool calling ni agentes; solo genera embeddings.
- Sin descargas ni validación comunitaria: no hay evidencia de uso en producción ni reportes de terceros.
- La fecha de creación (2026-11-21) y la ausencia de metadatos de licencia e idiomas sugieren un experimento personal más que un artefacto listo para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chrystian-yunus/multilingual-e5-small-jkn-id
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Paper E5 (Text Embeddings by Weakly-Supervised Contrastive Pre-training): https://arxiv.org/abs/2212.03533
- Paper Sentence-BERT (referenciado en tags, arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper SimCLR / InfoNCE (referenciado en tags, arXiv:1807.03748): https://arxiv.org/abs/1807.03748
- Librería sentence-transformers: https://www.sbert.net/
- Documentación de text-embeddings-inference: https://huggingface.co/docs/text-embeddings-inference
