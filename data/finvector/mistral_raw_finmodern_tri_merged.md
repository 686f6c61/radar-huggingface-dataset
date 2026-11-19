# finvector/mistral_raw_finmodern_tri_merged

## Resumen

`finvector/mistral_raw_finmodern_tri_merged` es un modelo de embeddings de texto (sentence-transformers) derivado por fine-tuning de `intfloat/e5-mistral-7b-instruct`, publicado por el usuario finvector bajo licencia Apache 2.0. Su propósito es la similitud semántica y la extracción de características vectoriales de fragmentos de texto, con un dominio de especialización aparentemente financiero, a juzgar por los ejemplos de la model card (fragmentos de informes anuales, notas contables y memorias de resultados). No es un modelo generativo de uso general: se emplea como encoder para producir representaciones densas de 7.110 millones de parámetros.

El modelo se ha entrenado con `CachedMultipleNegativesRankingLoss` sobre un conjunto de 11.687 ejemplos en formato de tripletas, lo que lo orienta a tareas de recuperación y ranking semántico. Hereda la arquitectura transformer decoder-only de Mistral-7B, reutilizada como encoder mediante pooling, y declara únicamente el idioma inglés en sus metadatos. Su relevancia práctica está en pipelines de búsqueda semántica y RAG sobre documentación financiera en inglés.

El repositorio tiene 14,2 GB, se distribuye en formato safetensors y es compatible con Text Embeddings Inference (TEI) y con los endpoints de Hugging Face. La model card no documenta la longitud de contexto efectiva, los métodos de pooling ni los detalles del proceso de entrenamiento más allá de la función de pérdida y el tamaño del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral) adaptado como encoder de embeddings |
| Parametros totales | 7.110.660.096 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Dimension de embedding | No disponible |
| Funcion de perdida | CachedMultipleNegativesRankingLoss |
| Tamano del dataset de entrenamiento | 11.687 ejemplos (tripletas) |
| Modelo base | intfloat/e5-mistral-7b-instruct |
| Libreria | sentence-transformers |

## Arquitectura y entrenamiento

El modelo parte de `intfloat/e5-mistral-7b-instruct`, un transformer decoder-only de la familia Mistral con 7.110 millones de parámetros, reutilizado como encoder de frases. Sobre esa base se aplica un fine-tuning con `CachedMultipleNegativesRankingLoss`, una variante de la pérdida de ranking con negativos múltiples que cachea las representaciones para reducir el coste de memoria en lotes grandes. El conjunto de entrenamiento consta de 11.687 ejemplos en formato de tripletas (ancla, positivo, negativo), lo que sitúa el ajuste en un régimen de datos relativamente pequeño y orientado a un dominio concreto.

El nombre del repositorio (`raw_finmodern_tri_merged`) sugiere un entrenamiento sobre tripletas de textos financieros modernos, seguido de una fusión de pesos o de adaptadores (el sufijo `merged`). La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset, la presencia de RLHF/DPO ni la estrategia de pooling empleada para obtener el vector de frase. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de embeddings de frase y de pasaje para similitud semántica y recuperación densa.
- Extracción de características (`feature-extraction`) mediante `sentence-transformers`.
- Ranking de candidatos por similitud coseno, adecuado para reordenación (reranking) en pipelines de búsqueda.
- Procesamiento de texto financiero en inglés: informes anuales, notas contables y memorias de resultados.
- Integración con Text Embeddings Inference (TEI) y con los endpoints de inferencia de Hugging Face.
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de modo de razonamiento explícito (thinking mode), visión ni audio.
- Capacidad multilingüe limitada al inglés según los metadatos del modelo.

## Casos de uso

- Búsqueda semántica sobre corpus financieros: indexar memorias anuales y notas contables en inglés y recuperar pasajes relevantes por similitud vectorial, aprovechando el ajuste sobre tripletas del dominio.
- RAG sobre documentación regulatoria: usar el modelo como retriever en un pipeline de generación aumentada, alimentando un LLM generativo con los pasajes recuperados de informes 10-K y similares.
- Deduplicación y agrupación de fragmentos: calcular embeddings de secciones de informes para detectar contenido repetido o agrupar cláusulas equivalentes entre ejercicios.
- Reordenación de resultados de búsqueda: aplicar similitud coseno sobre los candidatos devueltos por un motor léxico (BM25) para mejorar la precisión del ranking final.
- Detección de similitud entre declaraciones financieras: comparar fragmentos de distintos periodos para identificar lenguaje recurrente en la sección de riesgos o en la discusión de la dirección.
- Clasificación y clustering de documentos: usar los vectores como entrada a modelos ligeros para categorizar notas al pie, contingencias o desgloses fiscales.
- Construcción de bases vectoriales para asistentes de análisis: servir embeddings a un índice (FAISS, Qdrant, pgvector) para consultas en lenguaje natural sobre el corpus financiero.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Triplet | triplet eval | Cosine Accuracy | 0,9912 |

No se han publicado en la información disponible resultados en benchmarks estándar de embeddings (MTEB, BEIR) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 14,2 GB solo para pesos, más overhead de activaciones y del tokenizador; en la práctica, entre 16 y 20 GB según el tamaño de lote y la longitud de secuencia.
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB de pesos, con overhead adicional.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para despliegues de alto throughput; A10G 24 GB o RTX 4090 24 GB para inferencia en fp16 con lotes moderados.
- Cabe en GPU de consumo con 24 GB (RTX 3090, RTX 4090) en fp16; en tarjetas de 12-16 GB requiere cuantización o descarga parcial.
- Opciones de despliegue: Text Embeddings Inference (TEI), sentence-transformers con PyTorch, y servidores compatibles con los endpoints de Hugging Face. La compatibilidad con llama.cpp u Ollama no está documentada para este modelo de embeddings.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| finvector/mistral_raw_finmodern_tri_merged | 7,11 B | No disponible | Apache 2.0 | Embeddings de dominio financiero (inglés) |
| intfloat/e5-mistral-7b-instruct | 7,11 B | No disponible | MIT (según su model card) | Embeddings de propósito general multilingüe |
| BAAI/bge-large-en-v1.5 | 0,335 B | 512 tokens | MIT | Embeddings de propósito general en inglés |
| sentence-transformers/all-MiniLM-L6-v2 | 0,022 B | 256 tokens | Apache 2.0 | Embeddings ligeros para inglés |

El modelo hereda el tamaño y la arquitectura de e5-mistral-7b-instruct, por lo que comparte sus requisitos de hardware, pero se ha especializado en un corpus financiero y en inglés, con un dataset de ajuste pequeño. Frente a alternativas ligeras como bge-large o MiniLM, ofrece mayor capacidad representacional a costa de un orden de magnitud más de VRAM y latencia. No se dispone de datos de rendimiento comparativo en MTEB o BEIR para cuantificar la mejora en el dominio.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; su rendimiento en castellano u otros idiomas no está documentado y previsiblemente será inferior.
- El ajuste se ha realizado sobre 11.687 tripletas, un volumen reducido que puede provocar sobreajuste al estilo concreto del corpus financiero y escasa generalización fuera de él.
- Riesgo de sesgo de dominio: al estar especializado en lenguaje financiero, puede degradar su rendimiento en textos coloquiales, técnicos de otros campos o conversacionales.
- La métrica declarada (cosine accuracy de 0,9912) procede de una evaluación interna del autor, no verificada de forma independiente, y no es comparable con resultados de MTEB.
- No se documenta la longitud de contexto efectiva; secuencias largas pueden truncarse sin aviso y degradar la calidad del embedding.
- No es un modelo generativo: no debe emplearse para responder preguntas ni para generar texto.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base e5-mistral-7b-instruct tiene su propia licencia que conviene verificar antes de un despliegue en producción.
- El repositorio no registra descargas ni interacciones, por lo que no existe validación comunitaria del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/finvector/mistral_raw_finmodern_tri_merged
- Modelo base: https://huggingface.co/intfloat/e5-mistral-7b-instruct
- Paper de Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de Multiple Negatives Ranking (arXiv:2101.06983): https://arxiv.org/abs/2101.06983
- Documentación de Text Embeddings Inference: https://huggingface.co/docs/text-embeddings-inference
