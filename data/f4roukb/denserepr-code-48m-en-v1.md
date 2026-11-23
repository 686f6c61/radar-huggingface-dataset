# f4roukb/denserepr-code-48M-EN-v1

## Resumen

denserepr-code-48M-EN-v1 es un modelo de embeddings densos de 47.662.464 parámetros (48M) diseñado específicamente para recuperación de código (code retrieval). Lo desarrolla el usuario independiente f4roukb y deriva de una cadena de ajuste que parte de ibm-granite/granite-embedding-small-english-r2, pasando por un modelo intermedio de preentrenamiento contrastivo (denserepr-code-48M-pretrain-EN-v1). Genera un único vector de 384 dimensiones por texto, con similitud coseno y sin necesidad de instrucciones o prompts diferenciados para consulta y documento.

El problema que resuelve es la búsqueda semántica sobre código: mapear consultas en lenguaje natural ("read a csv file into a list of dicts") a fragmentos de código relevantes, y viceversa. Su relevancia radica en la relación calidad/tamaño: con 48M de parámetros alcanza un nDCG@10 medio de 68,86 en las 10 tareas de CoIR (MTEB), superando a modelos de hasta 149M de parámetros como gte-modernbert-base y LateOn-Code, y a alternativas densas de 80M como F2LLM-v2-80M (68,38).

La arquitectura es ModernBERT con pooling CLS, contexto de 8.192 tokens y pesos en safetensors fp32. Está entrenado exclusivamente para inglés y publicado bajo licencia Apache-2.0, lo que facilita su integración en pipelines comerciales de búsqueda de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (heredada de granite-embedding-small-english-r2) |
| Parametros totales | 47.662.464 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32; la model card indica ejecución con autocast bf16) |
| Idiomas soportados | inglés (consultas); código en Python, Go, Java, PHP, JavaScript, Ruby, C++ y SQL |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp32) |

Otras especificaciones: dimensión de embedding de 384, pooling CLS, similitud coseno, pipeline sentence-similarity, librería sentence-transformers, tamaño del repositorio 0,2 GB, compatible con text-embeddings-inference y endpoints.

## Arquitectura y entrenamiento

El modelo es un encoder transformer denso tipo ModernBERT, con 48M de parámetros y una cabeza de embedding de 384 dimensiones obtenida mediante pooling CLS. El entrenamiento se estructuró en dos fases. La primera consistió en un preentrenamiento contrastivo continuado de granite-embedding-small-english-r2 sobre aproximadamente 23 millones de pares de código, dando lugar a denserepr-code-48M-pretrain-EN-v1. La segunda fase, que produce este modelo, es un ajuste fino contrastivo sobre unos 4,4 millones de muestras de recuperación de código, deduplicadas y decontaminadas frente a los conjuntos de test de CoIR.

La innovación técnica principal es la combinación de negativos duros minados (mined hard negatives) con destilación listwise desde google/embeddinggemma-2. La composición del dataset de ajuste fino es: 36,6% de codefuse-ai/F2LLM-v2 (OCGI, ProCQA, xCodeEval), 50,0% de los splits de entrenamiento de CoIR-Retrieval (CodeSearchNet, CodeSearchNet-CCR, CodeFeedback-ST/MT, Text2SQL sintético, StackOverflow-QA, CodeTransOcean), 6,9% de SynSQL-2.5M (subconjunto de 300K), 3,6% de microsoft/rStar-Coder, 0,9% de CoSQA_Plus y 2,1% de problemas de competición (deepmind/code_contests, IBM Project CodeNet, BAAI/TACO, open-r1/codeforces). No se menciona uso de RLHF ni DPO, al tratarse de un modelo de embeddings y no generativo.

## Capacidades

- Generación de embeddings densos de 384 dimensiones para textos y fragmentos de código, con similitud coseno.
- Recuperación código-a-texto, texto-a-código y código-a-código (búsqueda semántica sobre repositorios).
- Codificación simétrica: consultas y documentos se codifican del mismo modo, sin instrucciones ni prefijos.
- Manejo de contextos largos de hasta 8.192 tokens, adecuado para funciones y ficheros extensos.
- Cobertura multilingüe de código (Python, Go, Java, PHP, JavaScript, Ruby, C++, SQL) con consultas en inglés.
- Soporte para tareas de CoIR: CodeSearchNet, CodeFeedback, AppsRetrieval, CodeTransOcean, CosQA, StackOverflowQA y Text2SQL.
- Integración directa con sentence-transformers, text-embeddings-inference y endpoints compatibles.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo de representación, no generativo.

## Casos de uso

- Búsqueda semántica en repositorios de código: indexar funciones y ficheros como vectores de 384 dimensiones y recuperar los fragmentos relevantes ante una consulta en lenguaje natural, gracias a su ventana de 8.192 tokens para funciones largas.
- Asistentes de documentación y ejemplos: dado un fragmento de código, recuperar documentación o preguntas de Stack Overflow relacionadas (tarea StackOverflowQA, nDCG@10 de 92,14).
- Generación aumentada por recuperación (RAG) sobre bases de código: servir como recuperador en pipelines donde un LLM generativo consume los fragmentos recuperados, con bajo coste por su tamaño de 48M.
- Traducción de código entre lenguajes asistida: emparejar implementaciones equivalentes entre lenguajes (CodeTransOcean) para sugerir traducciones o detectar duplicados.
- Texto-a-SQL: recuperar consultas SQL existentes a partir de una pregunta en lenguaje natural (SyntheticText2SQL, nDCG@10 de 63,04), útil en asistentes de analítica de datos.
- Detección de código duplicado y clustering: agrupar fragmentos semánticamente equivalentes en un repositorio para refactorización o auditoría.
- Enrutado de issues y soporte técnico: clasificar incidencias y enlazarlas con el código o la respuesta previa más relevante.
- Filtrado y deduplicación de datasets de código: usar los embeddings para eliminar muestras casi duplicadas antes de entrenar otros modelos.

## Benchmarks y rendimiento

Resultados de CoIR (MTEB), nDCG@10 ×100 a 8.192 tokens, medidos con `mteb` por el autor:

| Tarea | granite-small-r2 (base) | pretrain-EN-v1 | denserepr-code-48M-EN-v1 |
|---|---|---|---|
| AppsRetrieval | 13,48 | 30,75 | 48,69 |
| CodeFeedbackMT | 52,20 | 81,19 | 87,71 |
| CodeFeedbackST | 76,84 | 81,26 | 83,40 |
| CodeSearchNetCCRetrieval | 48,42 | 75,97 | 84,17 |
| CodeTransOceanContest | 77,63 | 80,00 | 81,30 |
| CodeTransOceanDL | 33,63 | 34,84 | 35,19 |
| CosQA | 35,40 | 33,84 | 31,87 |
| COIRCodeSearchNetRetrieval | 60,42 | 79,90 | 81,06 |
| StackOverflowQA | 90,04 | 90,97 | 92,14 |
| SyntheticText2SQL | 46,44 | 59,69 | 63,04 |
| Media | 53,45 | 64,84 | 68,86 |

El autor indica que el modelo se sitúa en la frontera de Pareto de MTEB CoIR (nDCG@10 medio frente a parámetros) y supera a todos los modelos del leaderboard con menos de 149M de parámetros, incluidos F2LLM-v2-80M (80,1M, 68,38, denso) y LateOn-Code-edge (17M, 64,96, multi-vector). Los resultados son mediciones locales del autor; el modelo no estaba en el leaderboard en el momento de su publicación (2026-11-23).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en fp32 (48M de parámetros); el repositorio ocupa 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna de consumo e incluso en CPU para cargas moderadas.
- Opciones de despliegue: sentence-transformers, text-embeddings-inference (compatible según tags), endpoints de Hugging Face; no se documentan integraciones específicas con vLLM, llama.cpp u Ollama (orientados a modelos generativos).
- Latencia y throughput: no disponibles en la información proporcionada; por su tamaño, se espera un coste de codificación bajo y apto para indexación por lotes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CoIR medio (nDCG@10) | Tipo | Licencia |
|---|---|---|---|---|---|
| denserepr-code-48M-EN-v1 | 47,7M | 8.192 | 68,86 | denso | Apache-2.0 |
| F2LLM-v2-80M | 80,1M | no disponible | 68,38 | denso | no disponible |
| LateOn-Code-edge | 17M | no disponible | 64,96 | multi-vector | no disponible |
| gte-modernbert-base | 149M | no disponible | > 68,86 (según el autor) | denso | no disponible |
| granite-embedding-small-english-r2 | 47M (aprox.) | no disponible | 53,45 | denso | Apache-2.0 |

El modelo ofrece el mejor nDCG@10 medio entre los modelos de menos de 149M de parámetros citados por el autor, con un tamaño 1,7 veces menor que F2LLM-v2-80M y casi 3 veces menor que gte-modernbert-base. La comparación se basa en los resultados reportados en el repositorio de resultados de MTEB a fecha 2026-11-22.

## Limitaciones y advertencias

- Solo admite consultas en inglés; no está entrenado para consultas en castellano ni en otros idiomas naturales.
- La cobertura de lenguajes de código se limita a Python, Go, Java, PHP, JavaScript, Ruby, C++ y SQL; otros lenguajes pueden rendir peor.
- Es un modelo de embeddings, no generativo: no produce texto, código ni razonamiento; debe combinarse con un LLM para tareas de generación.
- Riesgo de falsos positivos en similitud: fragmentos sintácticamente parecidos pueden quedar próximos aunque su semántica difiera; conviene validar con datos propios.
- Los resultados de benchmarks son mediciones locales del autor y no están verificados en el leaderboard oficial de MTEB.
- La licencia Apache-2.0 permite uso comercial, pero al derivar de granite-embedding-small-english-r2 (© IBM, Apache-2.0) deben conservarse los avisos de atribución correspondientes.
- No se documentan sesgos específicos ni tasas de alucinación (no aplica al no ser generativo); no hay información sobre robustez ante consultas ambiguas o adversariales.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta: carece de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/f4roukb/denserepr-code-48M-EN-v1
- Modelo de preentrenamiento: https://huggingface.co/f4roukb/denserepr-code-48M-pretrain-EN-v1
- Modelo base original: https://huggingface.co/ibm-granite/granite-embedding-small-english-r2
- Modelo de destilación: https://huggingface.co/google/embeddinggemma-2
- Dataset F2LLM-v2: https://huggingface.co/datasets/codefuse-ai/F2LLM-v2
- Organización CoIR-Retrieval: https://huggingface.co/CoIR-Retrieval
- Dataset SynSQL-2.5M: https://huggingface.co/datasets/seeklhy/SynSQL-2.5M
- Dataset rStar-Coder: https://huggingface.co/datasets/microsoft/rStar-Coder
- Dataset CoSQA_Plus: https://huggingface.co/datasets/thinkerhui/CoSQA_Plus
- Dataset code_contests: https://huggingface.co/datasets/deepmind/code_contests
- Dataset TACO: https://huggingface.co/datasets/BAAI/TACO
- Dataset codeforces: https://huggingface.co/datasets/open-r1/codeforces
- IBM Project CodeNet: https://github.com/IBM/Project_CodeNet
