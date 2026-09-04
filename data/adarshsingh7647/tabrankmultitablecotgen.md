# AdarshSingh7647/TabRankMultiTableCoTGen

## Resumen

TabRankMultiTableCoTGen es un modelo de reranking generativo de tablas, desarrollado por AdarshSingh7647 como parte de la familia TabRank. Se trata de un fine-tuning del modelo Qwen3-8B que aborda el problema de la recuperación de tablas relevantes para una consulta en lenguaje natural, especialmente en sistemas de respuesta a preguntas sobre datos tabulares (table question answering). A diferencia de los enfoques basados en scoring por pares o cross-encoders, este modelo es capaz de leer una pregunta y una lista completa de tablas candidatas en un único prompt y devolver el ranking completo en una sola generación, lo que reduce costes computacionales y latencia.

Este checkpoint concreto es la variante denominada «Standard SFT»: se ha entrenado mediante destilación de cadenas de pensamiento (chain-of-thought distillation), optimizando la pérdida sobre todo el razonamiento del profesor más el ranking final. El modelo genera su propio bloque `` antes de la respuesta final.
- Manejo de escenarios multi-tabla, gracias al entrenamiento con MultiTabQA.
- Salida estructurada en JSON con el formato `{"ranked_tables": [1, 3, 2]}`, donde las posiciones son índices one-indexed de las tablas de entrada.
- Capacidad de procesar hasta 25 tablas candidatas en una pasada, según la configuración de evaluación descrita.
- No soporta tool calling, function calling ni interacción con agentes; es un modelo especializado en reranking de tablas.

## Casos de uso

- Recuperación de tablas para sistemas de pregunta-respuesta sobre datos tabulares (Table QA): el modelo se integra como segunda etapa en un pipeline RAG, reordenando las tablas devueltas por un recuperador de primera etapa (por ejemplo, BM25 o DPR) antes de pasarlas a un LLM generativo.

- Reranking de resultados en buscadores de documentos con contenido tabular: en plataformas que indexan informes financieros o artículos científicos, este modelo puede filtrar y ordenar las tablas más relevantes para una consulta, mejorando la precisión de la búsqueda.

- Selección de tablas en analítica de negocio (business intelligence): ante una pregunta en lenguaje natural dirigida a un data warehouse, el modelo ayuda a elegir qué tablas consultar, reduciendo el número de llamadas a la base de datos y acelerando el análisis.

- Asistentes de análisis de datos: en herramientas que generan respuestas a partir de datos tabulares, el modelo puede preconizar qué tablas son más útiles antes de ejecutar consultas SQL o generar visualizaciones.

- Documentos científicos y financieros con múltiples tablas: en procesos de extracción de información, se utiliza para seleccionar las tablas candidatas más relevantes de documentos largos, mejorando la calidad de los datos extraídos posteriormente.

- Evaluación de pipelines de recuperación de tablas: como baseline específico para investigación, este checkpoint permite comparar métodos de listwise reranking frente a otras aproximaciones como el scoring por pares, dado que se han publicado sus resultados en 12 benchmarks.

## Benchmarks y rendimiento

El modelo fue evaluado como reranker listwise sobre una lista candidata de top-25, con una primera etapa de recuperación. Se reportan valores de nDCG@10 en 5 benchmarks in-distribution (SQA, TAT-QA, HybridQA, TabFact y NQ-Tables) y 7 out-of-distribution (OpenWikiTables, OTT-QA, MultiHiertt, AIT-QA, FeTaQA, StatCanDialogue y WatsonxDocsQA).

Resultados del checkpoint TabRankMultiTableCoTGen (Standard SFT):

| Benchmark | SQA | TAT-QA | HybridQA | TabFact | NQ-Tables | OpenWikiTables | OTT-QA | MultiHiertt | AIT-QA | FeTaQA | StatCanDialogue | WatsonxDocsQA | Media |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| nDCG@10 | **0.736** | **0.540** | **0.791** | **0.670** | **0.735** | **0.903** | **0.832** | **0.537** | **0.506** | **0.881** | **0.585** | **0.679** | **0.700** |

Comparativa con el modelo base Qwen3-8B y el método TabRank (checkpoint TabRankMultiTableCoTCond) sobre el mismo mix de datos:

| Modelo | SQA | TAT-QA | HybridQA | TabFact | NQ-Tables | OpenWikiTables | OTT-QA | MultiHiertt | AIT-QA | FeTaQA | StatCanDialogue | WatsonxDocsQA | Media |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Base Qwen3-8B | — | — | 0.735 | 0.656 | 0.723 | 0.887 | 0.813 | 0.521 | 0.495 | 0.896 | 0.615 | 0.756 | 0.710 |
| Standard SFT (este modelo) | 0.736 | 0.540 | 0.791 | 0.670 | 0.735 | 0.903 | 0.832 | 0.537 | 0.506 | 0.881 | 0.585 | 0.679 | 0.700 |
| TabRank (método del autor) | 0.741 | 0.519 | 0.783 | 0.688 | 0.747 | 0.938 | 0.903 | 0.599 | 0.536 | 0.919 | 0.580 | 0.690 | 0.720 |

Los cinco primeros benchmarks son in-distribution; los siete restantes son out-of-distribution. El modelo muestra ganancias modestas frente al base en algunos conjuntos in-distribution, pero una media global inferior, lo que indica una generalización limitada comparada con el enfoque condicionado por razonamiento TabRank.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16–20 GB para pesos y caché KV con una longitud de contexto de 32.768 tokens. Con cuantización de 4 bits, la VRAM podría reducirse a unos 6–8 GB, aunque no se han publicado pesos cuantizados para este checkpoint.
- GPU recomendadas: A100 (40 GB o 80 GB) o H100 para desplegar con contexto completo en bfloat16; RTX 4090 (24 GB) válida para bfloat16 con contextos más cortos o con cuantización de 4 bits.
- En GPU de consumo: cabe en RTX 3090 o RTX 4090 con cuantización, siempre que la caché KV no exceda la memoria disponible.
- Opciones de despliegue: vLLM (soporte nativo según el ejemplo de la model card), Transformers genéricos, y llama.cpp o Ollama si se convierten los pesos a formato GGUF.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

La siguiente tabla compara el checkpoint con las dos alternativas más cercanas publicadas dentro de la familia TabRank y con el modelo base Qwen3-8B:

| Modelo | Variante | Datos de entrenamiento | nDCG@10 medio (12 benchmarks) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B (base) | Modelo general | — | 0.710 | Apache-2.0 | Sí |
| TabRankMultiTableCoTGen (este modelo) | Standard SFT, multi-tabla | NQ Tables + MultiTabQA | 0.700 | Apache-2.0 | Repositorio con 0.0 GB, verificar |
| TabRankMultiTableCoTCond | TabRank (razonamiento condicionado), multi-tabla | NQ Tables + MultiTabQA | 0.720 | Apache-2.0 | Sí |

El modelo TabRankMultiTableCoTCond es la variante con mejor rendimiento de la colección. Este checkpoint queda por debajo tanto en media global como en generalización out-of-distribution, aunque en algunos benchmarks concretos (como HybridQA) supera al base y al método TabRank.

## Limitaciones y advertencias

- Solo soporta lenguaje inglés; no se ha evaluado su rendimiento en otros idiomas.
- El repositorio de Hugging Face muestra un tamaño de 0.0 GB, lo que sugiere que los pesos podrían no estar publicados en el momento de la consulta. Antes de utilizar el modelo en producción, es necesario verificar la disponibilidad real de los artefactos.
- La generalización fuera de distribución es limitada: el modelo obtiene una media de nDCG@10 de 0.700 frente a 0.720 del método TabRank, lo que indica que la destilación de CoT estándar no mejora la robustez en conjuntos no vistos.
- Existe riesgo de alucinación en el orden de los resultados, especialmente si el modelo no encuentra ninguna tabla realmente relevante en la lista de candidatas.
- No se han evaluado sesgos de género, raza u otros; no hay información sobre medidas de mitigación.
- Es un modelo especializado en reranking de tablas y no debe usarse como LLM generalista para generación de texto abierta.
- Requiere un formato de entrada muy específico, con tablas etiquetadas y salida JSON; cualquier desviación puede degradar el rendimiento.
- El uso comercial está permitido bajo la licencia Apache-2.0, siempre que los pesos estén disponibles y se cumplan las condiciones de la licencia.

## Enlaces

- Hugging Face: https://huggingface.co/AdarshSingh7647/TabRankMultiTableCoTGen
- Paper TabRank: https://arxiv.org/abs/2607.25182
- Repositorio de código y datos: https://github.com/AdarshSingh7647/TabRanker
- Colección de la familia TabRank: https://huggingface.co/collections/AdarshSingh7647/tabrank-qwen3-8b-table-rerankers
- Checkpoint relacionado (TabRankMultiTableCoTCond): https://huggingface.co/AdarshSingh7647/TabRankMultiTableCoTCond
