# OurShash/MedIR-RAG-Milestone1

## Resumen

MedIR-RAG-Milestone1 es un sistema de recuperación de información biomédica, no un modelo generativo. Concretamente, implementa una línea base léxica BM25 sobre un índice invertido de Terrier, orquestada mediante PyTerrier, que devuelve títulos y abstracts de PubMed ordenados por relevancia para una pregunta en lenguaje natural. El autor es OurShash y el trabajo se enmarca en la asignatura *Recuperação de Informação em Bases de Texto* de la Universidade de Évora.

El corpus indexado contiene 44.128 documentos provenientes del dataset comunitario DinoStackAI/bioasq-rag-13b-resplit (derivado de BioASQ), con 3.947.805 postings y 6.493.411 tokens tras el pipeline de Terrier en inglés (tokenizador inglés, stop-words y stemmer Porter). El índice completo, de 59,65 MB y construido en 12,05 segundos, se distribuye dentro del repositorio, de modo que la búsqueda funciona tras clonar sin reconstruir nada.

Su relevancia actual es la de un punto de referencia reproducible y barato para pipelines RAG biomédicos: sirve como primera etapa de recuperación frente a la que medir recuperadores densos o híbridos, y como material didáctico de evaluación con `pytrec_eval` sobre 1.145 preguntas de test. No genera respuestas médicas ni resume evidencia; solo ordena documentos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Recuperación léxica dispersa: BM25 sobre índice invertido de Terrier (JVM), invocado desde PyTerrier |
| Parametros totales | No aplicable: no hay parámetros neuronales; la puntuación se deriva de estadísticas del corpus (tf, df, longitud de documento) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable: no existe ventana de contexto; se indexa `title + abstract` y la recuperación se hace con profundidad 1.000 |
| Tipos de cuantizacion | No aplicable: no hay pesos que cuantizar; el índice ocupa 59,65 MB en disco |
| Idiomas soportados | Inglés (tokenizador inglés, lista de stop-words inglesa y stemmer Porter); otros idiomas no están soportados explícitamente |
| Licencia | No disponible para el repositorio del modelo; el dataset subyacente es CC-BY-2.5 |
| Formato de pesos | No aplicable: índice invertido Terrier (10 ficheros en `index/terrier_bm25/`), más JSON/CSV de resultados y Parquet del dataset |
| Documentos indexados | 44.128 de 44.183 registros publicados (55 sin título ni abstract) |
| Terminos distintos tras stemming | 92.366 |
| Postings / tokens indexados | 3.947.805 / 6.493.411 |
| Longitud media de documento | 147 tokens |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 1 |
| Fecha de creacion / actualizacion | 2026-10-29 / 2026-10-29 |

## Arquitectura y entrenamiento

No hay entrenamiento en el sentido habitual: el sistema es un recuperador léxico determinista. El texto indexado es la concatenación de título y abstract, procesado con el pipeline estándar de Terrier para inglés: `EnglishTokeniser` (minúsculas y separación por caracteres no alfanuméricos), eliminación de stop-words inglesas y stemming Porter, de forma que *reducing*, *reduced* y *reduces* colapsan en un mismo término. Sobre ese texto se construye un índice invertido con longitudes de documento, frecuencias de término, léxico, índice directo e índice de metadatos (título con 400 caracteres y abstract con 4.000, además del identificador), lo que permite mostrar títulos y previsualizaciones sin abrir el dataset.

La única fase de ajuste es la selección de hiperparámetros BM25: se evaluaron 20 configuraciones sobre el split de desarrollo (916 preguntas) y se congeló la ganadora en `results/raw/selected_config.json`. Los valores concretos de `k1` y `b` no están disponibles en la información consultada. La evaluación final se realiza con `pytrec_eval` sobre el split de test usando juicios de relevancia humanos, con NDCG@5, NDCG@10, MRR@10, MAP y Recall@100, y se acompaña de auto-verificación de métricas sobre rankings sintéticos y de un análisis de sensibilidad. El corpus es un benchmark de corpus fijo derivado de BioASQ, con preguntas re-mezcladas por el publicador del dataset; por tanto, las cifras son internamente consistentes pero no comparables con los resultados publicados en el leaderboard oficial de BioASQ.

## Capacidades

- Recuperación de documentos biomédicos: dada una pregunta en lenguaje natural, devuelve títulos y abstracts de PubMed ordenados de mayor a menor relevancia.
- Ranking BM25 parametrizado con profundidad de recuperación de 1.000 documentos por consulta.
- Coincidencia léxica con normalización por stemming y eliminación de stop-words, incluyendo variantes morfológicas simples (*thyroid* / *thyroids*).
- Presentación de metadatos: título y previsualización de abstract directamente desde el índice, sin acceso al dataset original.
- Búsqueda por línea de comandos sobre el índice guardado (`src/search.py`), operativa tras clonar el repositorio.
- Evaluación cuantitativa reproducible: métricas IR estándar, métricas por consulta para las 1.145 preguntas de test, validación de métricas y registro de manifiesto de experimento (versiones, tiempos, estadísticas del índice).
- Auditoría de datos: validación de esquema e integridad de identificadores con recuento de registros descartados.
- No soporta generación de texto, resumen, razonamiento multi-paso, tool calling, agentes, visión ni audio.

## Casos de uso

- Primera etapa de recuperación en un pipeline RAG biomédico: recuperar los 1.000 documentos candidatos con BM25 y pasarlos a un reranker o a un LLM generador, aprovechando que el índice ya está construido y la latencia de la etapa léxica es baja frente a un recuperador denso.
- Búsqueda de literatura para investigadores: interfaz de consulta sobre 44.128 abstracts de PubMed que devuelve títulos relevantes con previsualización, útil para exploración rápida de un tema sin depender de un servicio externo.
- Línea base en investigación en recuperación de información: comparar recuperadores densos, híbridos o con expansión de consultas contra un BM25 reproducible, con configuración congelada y métricas por consulta ya calculadas.
- Docencia de sistemas de recuperación: el repositorio incluye preparación de datos, indexación, ajuste de parámetros, evaluación y análisis de fallos, lo que permite reproducir el ciclo completo en una práctica de laboratorio.
- Triaje de cribado en revisiones sistemáticas: usar el ranking para priorizar qué abstracts revisar primero, midiendo el esfuerzo ahorrado con Recall@100 sobre los juicios positivos disponibles (9.478 en test).
- Filtrado previo de candidatos en un motor de búsqueda interno de documentación científica o regulatoria en inglés, donde el coste por consulta debe ser mínimo y no se requiere GPU.
- Servicio de referencia sin GPU: despliegue en una máquina modesta o en un contenedor con JVM, apto para entornos donde no hay aceleradores disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye `results/raw/test_summary.json` (métricas de test, verificaciones cruzadas y sensibilidad), `results/raw/test_per_query.csv` (métricas por consulta de las 1.145 preguntas) y `results/raw/dev_grid.csv` (las 20 configuraciones de desarrollo), pero los valores numéricos no aparecen en la información consultada.

Protocolo de evaluación declarado:

| Elemento | Valor |
|---|---|
| Split de test | 1.145 preguntas |
| Preguntas con juicios usadas en la evaluación principal | 1.073 |
| Juicios positivos en test | 9.478 |
| Metricas | NDCG@5, NDCG@10, MRR@10, MAP, Recall@100 |
| Herramienta de evaluacion | `pytrec_eval` |
| Configuraciones exploradas en desarrollo | 20 |
| Profundidad de recuperacion | 1.000 |

## Requisitos de hardware

- GPU: no necesaria. El sistema es CPU-only; no hay inferencia neuronal.
- VRAM estimada: 0 GB. No aplica.
- Memoria RAM: el índice en disco ocupa 59,65 MB e incluye índice directo; hay que sumar la sobrecarga de la JVM de Terrier y del proceso Python. Una estimación prudente es de 2 a 4 GB de RAM disponibles (estimación, no dato publicado).
- Disco: 0,1 GB para el repositorio; el dataset en Parquet se descarga aparte (tamaño no disponible) y cada fichero de run TREC generado ronda los 70 MB.
- Dependencia obligatoria: runtime de Java, no incluido en el repositorio; la model card remite a su sección F para provisionarlo. La versión concreta no está disponible en la información consultada.
- GPU recomendadas: ninguna. Cualquier CPU x86-64 moderna es suficiente.
- Opciones de despliegue: PyTerrier sobre Terrier (JVM) y el CLI `src/search.py`. No aplica soporte de vLLM, llama.cpp, Ollama ni TGI, al no existir pesos neuronales.
- Indexación: 12,05 segundos para 44.128 documentos en una ejecución registrada en el manifiesto del experimento.
- Latencia y throughput de consulta: no disponibles en la información consultada.

## Comparativa con modelos similares

| Sistema | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedIR-RAG-Milestone1 (este) | BM25 sobre índice Terrier, corpus biomédico fijo | No aplicable | No aplica (documento a documento) | No disponible (dataset CC-BY-2.5) | Pesos del índice incluidos en el repo; 0 descargas, 1 like |
| Pyserini / Lucene BM25 | BM25 sobre índice Lucene, pipelines IR reproducibles | No aplicable | No aplica | No verificada en esta ficha | Herramienta ampliamente adoptada; requiere construir el índice |
| Elasticsearch / OpenSearch con BM25 | Motor de búsqueda léxico con BM25 (k1, b) | No aplicable | No aplica | No verificada en esta ficha | Producto desplegable con API HTTP; no incluye corpus biomédico |
| Recuperadores densos tipo DPR o Contriever | Bi-encoder denso con índice vectorial | Millones de parámetros (valor exacto no disponible) | Fragmentos de 100-500 tokens | No verificada en esta ficha | Requieren GPU para indexar y servir; mejor recall semántico, mayor coste |
| IESNunes/MedIR-RAG | Proyecto RAG médico multi-paso con compresión LoRA/QLoRA | No disponible | No disponible | No disponible | Repositorio relacionado, orientado a generación, no a recuperación pura |

La comparación relevante es funcional: frente a un recuperador denso, este sistema no cubre desajuste de vocabulario ni sinónimos no derivados morfológicamente, pero su coste de despliegue es mínimo y su comportamiento es determinista y auditable.

## Limitaciones y advertencias

- No genera respuestas ni resúmenes. Cualquier uso clínico requiere una etapa posterior de generación y verificación; el sistema no valida la corrección médica del contenido recuperado.
- Ausencia de comprensión semántica: solo hay coincidencia léxica con stemming Porter. Sinónimos no relacionados morfológicamente, paráfrasis, siglas y abreviaturas pueden provocar fallos de recuperación.
- Sesgo de vocabulario y frecuencia: BM25 favorece documentos que repiten términos poco frecuentes de la consulta, lo que puede infravalorar documentos relevantes con redacción distinta.
- Cobertura de idioma limitada al inglés: tokenizador, stop-words y stemmer son ingleses; consultas o documentos en castellano no están soportados correctamente.
- Techo de recall inevitable: 55 registros del corpus no tienen título ni abstract y no se indexan; nueve juicios de test apuntan a ellos, por lo que Recall@100 no puede alcanzar el 100 %.
- Los resultados no son comparables con el leaderboard oficial de BioASQ: el corpus es fijo y las preguntas fueron re-mezcladas por el publicador del dataset.
- Solo 1.073 de las 1.145 preguntas de test tienen juicios usados en la evaluación principal; el resto queda fuera del cálculo.
- La licencia del repositorio del modelo no está declarada. El dataset subyacente es CC-BY-2.5 y exige atribución a DinoStackAI, a BioASQ (Tsatsaronis et al., 2015) y a PubMed como fuente de los documentos; antes de un uso comercial hay que aclarar la licencia del índice y del código.
- Los hiperparámetros BM25 están congelados a partir de un único split de desarrollo; no se documenta en la información disponible su estabilidad frente a otros dominios biomédicos.
- Adopción muy baja (0 descargas, 1 like, un único autor): no hay evidencia de uso en producción ni mantenimiento continuado.
- Requiere un runtime de Java externo; la ausencia de JVM es un fallo de despliegue habitual en contenedores mínimos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OurShash/MedIR-RAG-Milestone1
- Dataset DinoStackAI/bioasq-rag-13b-resplit: https://huggingface.co/datasets/DinoStackAI/bioasq-rag-13b-resplit
- Proyecto relacionado IESNunes/MedIR-RAG: https://huggingface.co/IESNunes/MedIR-RAG
- PyTerrier (documentación): https://pyterrier.readthedocs.io/
- Terrier (plataforma de recuperación): http://terrier.org/
- pytrec_eval (evaluación IR): https://github.com/cvangysel/pytrec_eval
- BioASQ (challenge y datos de origen): http://bioasq.org/
- Contexto sobre RAG: https://aws.amazon.com/what-is/retrieval-augmented-generation/
- Contexto sobre RAG con reranking y RAG agéntico: https://www.freecodecamp.org/news/rag-explained-simply-with-a-real-project/
