# kokitabayashi/bge-m3_FinModernBERT_query

## Resumen

`kokitabayashi/bge-m3_FinModernBERT_query` es un modelo de embeddings de frases (sentence-transformers) obtenido mediante fine-tuning del modelo base `BAAI/bge-m3` sobre el dataset `BatuhanECB/FinModernBERT-pairs-sec-synthetic-v1`, compuesto por 44.709 pares de frases sintéticas derivadas de documentos SEC. El autor es kokitabayashi y el modelo está publicado bajo licencia Apache 2.0. Su propósito es la recuperación de información (information retrieval) y la similitud semántica en el dominio financiero en inglés.

Arquitectónicamente hereda la estructura de `BAAI/bge-m3`, un transformer de tipo XLM-RoBERTa con 567.754.752 parámetros totales (aproximadamente 568 millones), orientado a la generación de embeddings densos. El fine-tuning se realizó con la función de pérdida `MultipleNegativesRankingLoss`, una elección habitual en tareas de recuperación densa que aprovecha los negativos en el propio batch. El repositorio ocupa 2,3 GB e incluye pesos en formato safetensors.

El modelo es relevante porque adapta un embedder multilingüe de propósito general al vocabulario y las estructuras de los informes financieros (SEC filings), un dominio donde los embeddings genéricos suelen rendir por debajo de lo deseable debido a la terminología técnica, las tablas numéricas y las formulaciones jurídicas. Está pensado para pipelines de búsqueda semántica y RAG sobre documentación financiera en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer XLM-RoBERTa (heredada de BAAI/bge-m3), embeddings densos |
| Parámetros totales | 567.754.752 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización no documentada por el autor) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Dimensión de embedding | no disponible |
| Función de pérdida | MultipleNegativesRankingLoss |
| Tamaño del dataset de entrenamiento | 44.709 pares |
| Modelo base | BAAI/bge-m3 |
| Pipeline | sentence-similarity / feature-extraction |

## Arquitectura y entrenamiento

El modelo parte de `BAAI/bge-m3`, un encoder transformer basado en la familia XLM-RoBERTa que produce embeddings densos de frases. Sobre esa base, el autor aplicó un fine-tuning supervisado con `MultipleNegativesRankingLoss`, una pérdida contrastiva que trata las demás frases positivas del batch como negativos para cada consulta, lo que resulta eficaz para tareas de recuperación densa sin necesidad de muestreo explícito de negativos duros.

El conjunto de entrenamiento es `BatuhanECB/FinModernBERT-pairs-sec-synthetic-v1`, con 44.709 pares de frases sintéticas generadas a partir de documentos SEC (informes anuales, estados financieros y notas). No se documenta en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset, ni si se aplicaron etapas adicionales de RLHF o DPO (poco habituales en modelos de embeddings). Tampoco se especifican innovaciones técnicas adicionales más allá del propio fine-tuning contrastivo. La model card incluye un widget de ejemplo con pares consulta-frase extraídos de informes financieros reales (segmentos de negocio, covenants de deuda, márgenes brutos, etc.), lo que confirma la orientación al dominio financiero.

## Capacidades

- Generación de embeddings densos de frases para similitud semántica y recuperación de información.
- Búsqueda semántica sobre documentación financiera en inglés (informes SEC, estados financieros, notas contables).
- Recuperación densa (dense retrieval) para pipelines de RAG (Retrieval-Augmented Generation).
- Ranking de pasajes por similitud coseno, con métricas Accuracy@k, Recall@k, Precision@k, nDCG@10, MRR@10 y MAP@100.
- Extracción de características (feature-extraction) para clasificación, clustering o deduplicación de textos financieros.
- Soporte de tool calling / function calling: no disponible (no es un modelo generativo).
- Soporte de agentes y razonamiento multi-step: no disponible (no es un modelo generativo).
- Capacidades multilingües: limitadas al inglés según la model card, aunque el modelo base bge-m3 es multilingüe; el fine-tuning se ha realizado solo sobre datos en inglés.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Búsqueda semántica en informes SEC: indexar los embeddings de los pasajes de los filings y recuperar los fragmentos relevantes para una consulta en lenguaje natural, aprovechando el fine-tuning sobre pares SEC sintéticos para mejorar la precisión en terminología contable y jurídica.
- RAG sobre documentación financiera: usar el modelo como retriever en un pipeline de generación aumentada, de modo que un LLM generativo reciba los pasajes financieros más relevantes antes de responder preguntas sobre resultados, deuda o covenants.
- Asistencia a analistas financieros: construir un buscador interno que permita localizar rápidamente cifras y afirmaciones concretas (por ejemplo, "ratio de deuda sobre capital") dentro de grandes volúmenes de informes anuales.
- Deduplicación y clustering de pasajes financieros: agrupar fragmentos con contenido semánticamente equivalente (descripciones repetidas de riesgos, notas al pie similares) para limpiar corpus o construir bases de conocimiento.
- Cumplimiento normativo y auditoría: recuperar cláusulas contractuales o covenants específicos a partir de descripciones en lenguaje natural, facilitando la revisión de obligaciones financieras.
- Enriquecimiento de datasets para entrenamiento: usar las similitudes para emparejar preguntas y respuestas financieras, o para seleccionar ejemplos representativos en la construcción de datasets de instrucciones.
- Moderación y filtrado temático: clasificar si un fragmento de texto pertenece al dominio financiero (frente a otros dominios) mediante umbrales de similitud con un conjunto de referencia.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre el dataset "finance eval" en la tarea de Information Retrieval:

| Métrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0,8257 |
| Cosine Accuracy@3 | 0,9508 |
| Cosine Accuracy@5 | 0,9714 |
| Cosine Accuracy@10 | 0,9870 |
| Cosine Precision@1 | 0,8257 |
| Cosine Precision@3 | 0,3169 |
| Cosine Precision@5 | 0,1943 |
| Cosine Precision@10 | 0,0987 |
| Cosine Recall@1 | 0,8257 |
| Cosine Recall@3 | 0,9508 |
| Cosine Recall@5 | 0,9714 |
| Cosine Recall@10 | 0,9870 |
| Cosine nDCG@10 | no disponible en la información proporcionada |
| Cosine MRR@10 | no disponible en la información proporcionada |
| Cosine MAP@100 | no disponible en la información proporcionada |

No se han publicado en la información disponible resultados comparativos con otros modelos sobre el mismo conjunto de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: con 568 millones de parámetros, en fp32 se requieren aproximadamente 2,3 GB de pesos; en fp16 alrededor de 1,1 GB; en int8 alrededor de 0,6 GB. A ello hay que sumar el overhead de activaciones y del tokenizador, por lo que en la práctica conviene reservar entre 2 y 4 GB según el lote y la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en fp16 con lotes pequeños; para indexación a gran escala se recomiendan A100, H100, L40S o RTX 4090 por su mayor ancho de banda y throughput.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4080 y RTX 4090, así como en GPUs de gama media con 6-8 GB.
- Opciones de despliegue: `sentence-transformers` (librería nativa), `text-embeddings-inference` (el tag `text-embeddings-inference` está presente en el repositorio), vLLM con soporte de embeddings, Hugging Face Inference Endpoints (tag `endpoints_compatible`) y, con conversión previa, llama.cpp u Ollama para despliegue en CPU.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Como referencia orientativa, un encoder de 568 M de parámetros en una RTX 4090 procesa típicamente cientos de frases por segundo con lotes moderados, pero no se dispone de mediciones oficiales del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| kokitabayashi/bge-m3_FinModernBERT_query | 567.754.752 | no disponible | en (fine-tuning) | apache-2.0 | Fine-tuning de bge-m3 sobre pares SEC sintéticos; sin descargas ni likes en el momento de la consulta |
| BAAI/bge-m3 | no disponible en la información proporcionada | no disponible | multilingüe | MIT (según el modelo original, no confirmado en esta ficha) | Modelo base; propósito general, sin especialización financiera |
| BAAI/bge-large-en-v1.5 | no disponible en la información proporcionada | no disponible | en | MIT (según el modelo original, no confirmado en esta ficha) | Embedder inglés de propósito general ampliamente usado en RAG |
| FinModernBERT (familia) | no disponible en la información proporcionada | no disponible | en | no disponible | Modelos especializados en finanzas; el dataset de pares deriva de esta línea |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada, por lo que la comparativa se limita a parámetros, licencia y orientación de dominio.

## Limitaciones y advertencias

- El modelo está fine-tuneado únicamente sobre datos en inglés; su rendimiento en otros idiomas, aunque el modelo base sea multilingüe, no está garantizado y probablemente sea inferior.
- El dataset de entrenamiento es sintético (pares generados a partir de documentos SEC), lo que puede introducir sesgos de estilo y distribución respecto a texto financiero real de otros mercados o formatos.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-step; su uso se limita a embeddings y similitud.
- Riesgo de alucinación: no aplica en el sentido generativo, pero los embeddings pueden producir similitudes espurias en textos con cifras o tablas, donde la semántica numérica no se captura bien.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y los benchmarks declarados no están verificados de forma independiente; conviene validarlo sobre el corpus propio antes de usarlo en producción.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las obligaciones de atribución y las licencias del modelo base y del dataset de entrenamiento.
- No se documenta la longitud máxima de contexto soportada ni la dimensión de embedding, datos relevantes para dimensionar índices vectoriales.
- El nombre del repositorio incluye "FinModernBERT" y "query", lo que sugiere una posible especialización en el lado de la consulta; no se especifica si el modelo está optimizado para codificar consultas, documentos o ambos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kokitabayashi/bge-m3_FinModernBERT_query
- Modelo base: https://huggingface.co/BAAI/bge-m3
- Dataset de entrenamiento: https://huggingface.co/datasets/BatuhanECB/FinModernBERT-pairs-sec-synthetic-v1
- Paper de Sentence-BERT (referencia en tags): https://arxiv.org/abs/1908.10084
- Paper de SimCSE (referencia en tags): https://arxiv.org/abs/1807.03748
- Documentación de sentence-transformers: https://www.sbert.net/
- Documentación de text-embeddings-inference: https://github.com/huggingface/text-embeddings-inference
