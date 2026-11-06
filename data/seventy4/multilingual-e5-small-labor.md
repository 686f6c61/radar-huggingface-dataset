# seventy4/multilingual-e5-small-labor

## Resumen

multilingual-e5-small-labor es un modelo de embeddings de frases (sentence-transformers) especializado en la recuperación de artículos legales laborales coreanos. Lo desarrolla el usuario seventy4 como un fine-tuning completo de intfloat/multilingual-e5-small, un transformer BERT de tipo encoder con 117,6 millones de parámetros. El problema que aborda es concreto: dado un enunciado coloquial de un trabajador (por ejemplo, una duda sobre permiso menstrual o prescripción de salarios), devolver el artículo del estatuto laboral que responde a esa consulta.

El modelo mantiene la arquitectura y el tokenizador del E5 original, pero ajusta los pesos con un corpus de 663 pares pregunta-respuesta construidos a partir de articulado legal. Emite vectores densos de 384 dimensiones con una ventana de entrada de 512 tokens, incluyendo los prefijos obligatorios `query:` y `passage:`. Es relevante para quien construya sistemas RAG o buscadores semánticos sobre normativa laboral coreana, porque el E5 multilingüe genérico no está alineado con la jerga jurídica ni con la formulación informal de las consultas reales.

La licencia MIT y el reducido tamaño del repositorio (0,5 GB) facilitan su despliegue en entornos con recursos limitados. No obstante, se trata de un modelo de recuperación, no generativo: no responde preguntas, solo ordena pasajes por similitud semántica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base de intfloat/multilingual-e5-small) |
| Parámetros totales | 117.653.760 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (incluyendo tokens especiales y prefijos) |
| Tipos de cuantización | no disponible (pesos en safetensors; admite cuantización estándar de sentence-transformers, no documentada por el autor) |
| Idiomas soportados | coreano (ko); el modelo base es multilingüe, pero el fine-tuning se declara solo para coreano |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo (no un adaptador) de intfloat/multilingual-e5-small, un encoder BERT de 12 capas y 384 dimensiones de embedding. La tarea de entrenamiento es similitud de frases mediante `MultipleNegativesRankingLoss`, una función de contraste que usa los pasajes positivos de cada par como negativos en el resto del lote. El conjunto de datos, `seventy4/labor-embedding-data`, contiene 663 pares de consulta y artículo legal, con formulaciones coloquiales emparejadas con el texto del articulado.

El autor indica que el corpus de evaluación general del mismo repositorio de datos (`general-evaluation/general-corpus`) se usó únicamente como control de regresión en otros dominios y no participó en el entrenamiento de los pesos. No se documentan detalles sobre número de épocas, tasa de aprendizaje, tamaño de lote, composición exacta del corpus ni si hubo etapas adicionales de ajuste. Tampoco se menciona el uso de RLHF, DPO ni técnicas de decodificación especulativa, algo esperable en un modelo de embeddings.

## Capacidades

- Generación de embeddings densos de 384 dimensiones para similitud semántica y recuperación de información.
- Búsqueda semántica de artículos legales laborales a partir de consultas en lenguaje natural informal.
- Extracción de características (`feature-extraction`) para pipelines de sentence-transformers.
- Aplicación de prefijos asimétricos: `query:` para consultas y `passage:` para documentos, según la convención E5.
- Normalización de embeddings (`normalize_embeddings=True`) para usar similitud coseno de forma directa.
- Compatibilidad con Text Embeddings Inference (TEI) y con endpoints de Hugging Face (etiquetas `text-embeddings-inference` y `endpoints_compatible`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un encoder de recuperación.
- Capacidad multilingüe heredada del modelo base, aunque no evaluada ni declarada por el autor para idiomas distintos del coreano.

## Casos de uso

- Buscador semántico de normativa laboral: indexar los artículos del estatuto y recuperar los más afines a una consulta del trabajador mediante similitud coseno; el fine-tuning alinea la formulación coloquial con el texto legal.
- Componente de recuperación en un sistema RAG: usar el modelo como retriever que alimenta a un LLM generador, de modo que las respuestas se fundamenten en artículos concretos y se reduzca la alucinación normativa.
- Asistente de atención al empleado: clasificar y enrutar consultas internas de recursos humanos hacia el artículo o departamento correspondiente, con un top-k de candidatos para revisión humana.
- Preprocesado de expedientes y reclamaciones: agrupar reclamaciones laborales por temática (permisos, salarios, jornada) comparando sus embeddings con los de los artículos aplicables.
- Deduplicación y clustering de consultas: agrupar preguntas equivalentes formuladas de distinta manera para construir FAQ o detectar temas recurrentes en un servicio de soporte.
- Control de regresión en dominios ajenos: el autor incluye un corpus general de evaluación para comprobar que el ajuste no degrada la recuperación fuera del ámbito laboral, útil como prueba de calidad en pipelines de integración continua.
- Despliegue ligero en infraestructura modesta: con 117,6 millones de parámetros y 384 dimensiones, el índice vectorial y el servicio de embeddings caben en una CPU o en una GPU de gama baja.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index, sobre el dataset `labor` (tarea de recuperación de información). No están verificados de forma independiente (`verified: false`).

| Métrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0,6449 |
| Cosine Accuracy@3 | 0,8318 |
| Cosine Accuracy@5 | 0,8972 |
| Cosine Accuracy@10 | 0,9346 |
| Cosine Precision@1 | 0,6449 |
| Cosine Precision@5 | 0,1794 |
| Cosine Recall@1 | 0,6449 |
| Cosine Recall@5 | 0,8972 |
| Cosine NDCG@10 | 0,7946 |
| Cosine MRR@10 | 0,7490 |
| Cosine MAP@100 | 0,7520 |

No se han publicado en la información disponible resultados comparativos frente al modelo base ni frente a otros modelos de embeddings sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB para los pesos (117,6 M de parámetros); en fp16, unos 0,25 GB. El consumo real depende del tamaño de lote y de la longitud de secuencia.
- Cabe en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, así como en GPUs de datacenter (A100, H100) sobredimensionadas para este modelo.
- Funciona en CPU con latencias aceptables para volúmenes moderados, dado el reducido número de parámetros.
- Opciones de despliegue: sentence-transformers (Python), Text Embeddings Inference (TEI), Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`) y exportación a ONNX para servir en CPU.
- No se han publicado datos de latencia ni de throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Especialización |
|---|---|---|---|---|---|
| seventy4/multilingual-e5-small-labor | 117,6 M | 512 tokens | coreano (base multilingüe) | MIT | Recuperación de normativa laboral coreana |
| intfloat/multilingual-e5-small (base) | 117,6 M | 512 tokens | multilingüe | MIT | Embeddings generales multilingües |
| Otros fine-tunes de E5-small para dominio legal | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con el modelo base en el dataset `labor` no está publicada; el autor solo aporta las métricas del modelo ajustado. Frente a alternativas de mayor tamaño (por ejemplo, familia e5-base o e5-large), este modelo prioriza velocidad y huella de memoria a costa de capacidad representacional.

## Limitaciones y advertencias

- El propio autor advierte que las puntuaciones de recuperación dependen del conjunto de evaluación y que otros dominios y artículos nuevos deben evaluarse por separado.
- Una similitud alta no garantiza que el pasaje recuperado sea la respuesta legal correcta; el modelo no es una herramienta de asesoramiento jurídico.
- El fine-tuning se declara únicamente para coreano; el rendimiento en castellano u otros idiomas no está evaluado y puede degradarse respecto al modelo base.
- Corpus de entrenamiento muy reducido (663 pares), lo que limita la cobertura de casuísticas y aumenta el riesgo de sobreajuste a las formulaciones presentes en los datos.
- Ventana de 512 tokens: los artículos o documentos largos deben trocearse, con el riesgo de perder contexto normativo relevante.
- Riesgo de sesgo derivado de la selección del articulado y de las formulaciones de consulta incluidas en el corpus; no se documenta ningún análisis de sesgos.
- Aunque la licencia es MIT, conviene revisar las condiciones de los textos legales indexados si se redistribuyen como parte de un índice.
- Al ser un modelo de embeddings, no genera respuestas: cualquier uso conversacional requiere un componente generativo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seventy4/multilingual-e5-small-labor
- Dataset de entrenamiento: https://huggingface.co/datasets/seventy4/labor-embedding-data
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
