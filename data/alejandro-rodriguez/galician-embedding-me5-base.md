# alejandro-rodriguez/galician-embedding-me5-base

## Resumen

galician-embedding-me5-base es un modelo de embeddings de frases especializado en gallego para recuperación de información (dense retrieval) sobre texto oficial y administrativo. Lo desarrolla alejandro-rodriguez como un fine-tuning de intfloat/multilingual-e5-base, un transformer XLM-RoBERTa de 278 millones de parámetros, y está pensado para alimentar pipelines RAG sobre el Diario Oficial de Galicia (DOG), boletines provinciales y debates parlamentarios.

El modelo resuelve un problema concreto: los embeddings multilingües genéricos rinden por debajo de lo deseable en gallego administrativo, un dominio con vocabulario jurídico específico y baja representación en los corpus de entrenamiento habituales. Para ello se entrenó con pares pregunta-pasaje en gallego: preguntas sintéticas generadas sobre documentos del DOG y de dos boletines provinciales, más pares legales y administrativos traducidos automáticamente desde el español.

La versión publicada, v0.2-mix, es una interpolación de pesos (WiSE-FT) que combina 0,9 del modelo fine-tuneado con 0,1 del modelo base, sin entrenamiento adicional. Según la model card, alcanza 0,832 de MRR@3 en el benchmark DOG-RAG, por encima de BM25 (0,782) y de BAAI/bge-m3 (0,740), y a la altura de un pipeline de dos modelos (bge-m3 más bge-reranker-v2-m3, 0,807) unas cuatro veces mayor. Su punto débil son los pasajes cortos: queda 4-6 puntos por detrás de bge-m3 en párrafos de noticias y unos 8 puntos en respuestas de WebFAQ.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder XLM-RoBERTa (base de multilingual-e5-base) |
| Parametros totales | 278.043.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | gallego (gl) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension de embedding | no disponible en la informacion proporcionada |
| Prefijos de consulta/pasaje | ninguno (a diferencia del modelo base) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer bidireccional derivado de intfloat/multilingual-e5-base, que a su vez se basa en la arquitectura XLM-RoBERTa. Se usa como modelo de sentence-transformers para extracción de features y similitud de frases, generando embeddings densos tanto de consultas como de pasajes. A diferencia del modelo base, no requiere los prefijos `query: ` ni `passage: `, lo que simplifica su integración en pipelines que llaman directamente a `encode()`.

El entrenamiento se realizó sobre pares pregunta-pasaje en gallego: preguntas sintéticas generadas sobre el DOG, dos boletines provinciales y debates del Parlamento de Galicia, junto con pares legales y administrativos traducidos automáticamente desde el español. Los datasets citados son SINAI/ALIA-es-legal-administrative-triplets y proxectonos/corpus_dominio_legal_administrativo_tmp. La versión publicada aplica interpolación de pesos WiSE-FT (Wortsman et al., 2022): cada tensor es 0,9 veces el modelo fine-tuneado (run 4) más 0,1 veces multilingual-e5-base, sin reentrenamiento. El objetivo es recuperar parte del rendimiento perdido en pasajes administrativos largos sin sacrificar resultados en DOG-RAG. No se detallan en la información disponible el número de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Generación de embeddings densos para similitud de frases y recuperación de información (dense retrieval).
- Búsqueda semántica en gallego sobre corpus legales y administrativos.
- Codificación de consultas y pasajes sin prefijos, compatible con pipelines que usan `encode()` directamente.
- Integración con sentence-transformers (versión 6.2 o superior) y con text-embeddings-inference.
- Compatible con endpoints de Hugging Face (tag `endpoints_compatible`).
- Soporte de búsqueda híbrida combinable con BM25 mediante reciprocal rank fusion (k = 60), aunque según la model card no aporta mejora sobre el modelo solo.
- No soporta tool calling, agentes, visión, audio ni modo thinking: es exclusivamente un modelo de embeddings.

## Casos de uso

- RAG sobre el Diario Oficial de Galicia: indexar los documentos del DOG en fragmentos de 250 palabras con solapamiento de 50 y recuperar los pasajes relevantes para preguntas ciudadanas sobre plazos, subvenciones o normativa, aprovechando su MRR@3 de 0,832 en el benchmark DOG-RAG.
- Asistencia administrativa a ciudadanos: responder consultas sobre trámites autonómicos y provinciales recuperando primero los fragmentos normativos pertinentes y pasándolos a un LLM generador, con un modelo que cabe en menos de 3 GB de memoria.
- Búsqueda semántica en boletines provinciales: desplegar un buscador interno sobre corpus de diputaciones con vocabulario jurídico gallego, donde los embeddings multilingües genéricos rinden peor.
- Análisis de debates parlamentarios: recuperar intervenciones y pasajes de los debates del Parlamento de Galicia por similitud semántica para tareas de documentación o investigación periodística.
- Pipelines de recuperación en producción con latencia baja: 13 ms por consulta en CPU (Apple M5, 4 hilos, fp32) y 8 ms en GPU MPS, con un throughput de 18 pasajes por segundo en CPU y 40 en GPU, adecuado para servicios interactivos.
- Evaluación y comparación de sistemas RAG en gallego: usar el modelo junto con el repositorio nos-rag-eval para medir recuperación a nivel de documento con métricas P@3, R@3, MRR y nDCG@10.
- Fine-tuning posterior o destilación: al ser MIT y de 278M parámetros, sirve como base para adaptar embeddings a otros dominios en gallego con coste de cómputo moderado.

## Benchmarks y rendimiento

Resultados en DOG-RAG (502 preguntas, 917 paráfrasis, 122 documentos del DOG; índice de 36.318 fragmentos de 250 palabras procedentes de 2.661 documentos; top 10 recuperado, top 3 conservado, métricas a nivel de documento):

| Retriever | Reranker | P@3 | R@3 | MRR | nDCG@10 |
|---|---|---|---|---|---|
| este modelo, v0.2-mix | ninguno | 0,586 | 0,923 | 0,832 | 0,889 |
| run 4 | ninguno | 0,587 | 0,925 | 0,830 | 0,887 |
| híbrido BM25 + run 4 | ninguno | 0,581 | 0,917 | 0,834 | 0,890 |
| v0.1-run3 | ninguno | 0,566 | 0,901 | 0,808 | 0,874 |
| BAAI/bge-m3 | BAAI/bge-reranker-v2-m3 | 0,534 | 0,899 | 0,807 | no disponible |
| BM25 | BAAI/bge-reranker-v2-m3 | 0,546 | 0,886 | 0,800 | no disponible |
| BM25 | ninguno | 0,519 | 0,880 | 0,782 | 0,851 |
| Alibaba-NLP/gte-multilingual-base | ninguno | 0,540 | 0,886 | 0,778 | no disponible |
| multilingual-e5-base sin entrenar (con prefijos) | ninguno | no disponible | no disponible | 0,724 | no disponible |
| multilingual-e5-base sin entrenar (sin prefijos) | ninguno | no disponible | no disponible | 0,701 | no disponible |

En el conjunto de desarrollo (454 preguntas sintéticas sobre el DOG 2024, solo para selección de modelo) la versión v0.2-mix obtiene MRR@10 de 0,450, frente a 0,467 de run 5, 0,460 de run 4 y 0,430 de v0.1-run3.

En un segundo conjunto de test más pequeño (DOG 2025) supera de nuevo a BM25, pero no se distingue de bge-m3 ni del pipeline de dos modelos. En pasajes cortos queda 4-6 puntos por detrás de bge-m3 en párrafos de noticias y unos 8 puntos en respuestas de WebFAQ.

## Requisitos de hardware

- Memoria pico inferior a 3 GB en fp32 según la model card.
- Inferencia en CPU viable: 13 ms por consulta y 18 pasajes por segundo (Apple M5, 4 hilos, fp32, fragmentos de 250 palabras, batch 32).
- Inferencia en GPU de consumo: 8 ms por consulta y 40 pasajes por segundo en MPS (misma máquina); por tamaño, cabe holgadamente en GPUs con 8 GB o más, como RTX 3060, RTX 4060 o RTX 4090.
- GPU de datacenter (A100, H100) no necesarias para este tamaño; solo justificables para indexación masiva o lotes muy grandes.
- Despliegue mediante sentence-transformers (>= 6.2), text-embeddings-inference y endpoints de Hugging Face; el uso con llama.cpp, Ollama o vLLM no está documentado en la información disponible.
- No se han publicado cifras de throughput en GPU de datacenter en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | DOG-RAG MRR@3 | Idiomas | Licencia |
|---|---|---|---|---|---|
| galician-embedding-me5-base (v0.2-mix) | 278M | no disponible | 0,832 | gallego | MIT |
| BAAI/bge-m3 | no disponible (aprox. 4 veces mayor según la model card) | no disponible | 0,740 (0,807 con reranker) | multilingüe | MIT |
| Alibaba-NLP/gte-multilingual-base | no disponible | no disponible | 0,778 | multilingüe | no disponible |
| intfloat/multilingual-e5-base (sin entrenar) | 278M | no disponible | 0,724 (con prefijos) / 0,701 (sin prefijos) | multilingüe | MIT |
| BM25 (línea base léxica) | no aplica | no aplica | 0,782 | gallego (corpus) | no aplica |

El modelo ofrece el mejor MRR@3 de la comparativa con un tamaño cuatro veces menor que bge-m3 y sin necesidad de reranker, aunque pierde frente a bge-m3 en pasajes cortos y no se distingue de él en el segundo conjunto de test.

## Limitaciones y advertencias

- Rendimiento inferior a bge-m3 en pasajes cortos: 4-6 puntos por detrás en párrafos de noticias y unos 8 puntos en respuestas de WebFAQ.
- En el segundo conjunto de test (DOG 2025) no se distingue estadísticamente de bge-m3 ni del pipeline de dos modelos; la ventaja principal se limita al benchmark DOG-RAG.
- Entrenado exclusivamente para gallego; su uso en otros idiomas no está validado, aunque herede capacidades multilingües del modelo base.
- La búsqueda híbrida con BM25 no aporta mejora sobre el modelo solo según la model card.
- Los números absolutos del benchmark son superiores a los del paper de referencia porque el índice público es menor (2.661 documentos frente a más de 12.000 en el paper, parte no públicos), lo que limita la comparabilidad directa.
- El conjunto de desarrollo son preguntas sintéticas generadas por DeepSeek-V3 y revisadas por nativos; puede no reflejar la distribución real de consultas de usuarios.
- Riesgo de alucinación no aplicable al modelo en sí (es un encoder de embeddings), pero los LLM que consuman sus recuperaciones sí pueden alucinar si los pasajes recuperados son irrelevantes.
- Sesgos: no documentados en la información disponible; al entrenarse con texto administrativo oficial, puede heredar el sesgo institucional y la terminología de ese corpus.
- Licencia MIT: permite uso comercial sin restricciones, pero conviene verificar las licencias de los datasets de entrenamiento citados.
- Solo 5 descargas y 0 likes en el momento de la consulta: ecosistema de validación externa muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alejandro-rodriguez/galician-embedding-me5-base
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-base
- Reranker complementario: https://huggingface.co/alejandro-rodriguez/galician-reranker-me5-base
- Repositorio de código de entrenamiento y evaluación: https://github.com/alejandrorodriguezalvarez884-dot/galician-retrieval
- Herramienta de evaluación RAG: https://github.com/proxectonos/nos-rag-eval
- Dataset DOG-RAG: https://huggingface.co/datasets/proxectonos/dog-rag
- Dataset de corpus legal y administrativo: https://huggingface.co/datasets/proxectonos/corpus_dominio_legal_administrativo_tmp
- Dataset de tripletas legales: https://huggingface.co/datasets/SINAI/ALIA-es-legal-administrative-triplets
- Paper WiSE-FT (Wortsman et al., 2022): arXiv 2109.01903
- Paper de referencia citado: arXiv 2402.05672
