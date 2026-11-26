# f4roukb/denserepr-code-48M-pretrain-EN-v1

## Resumen

denserepr-code-48M-pretrain-EN-v1 es un modelo de embeddings densos de 47.662.464 parámetros (aproximadamente 48M) especializado en recuperación de código (code retrieval). Lo desarrolla Farouk B. (usuario f4roukb) y se construye mediante preentrenamiento contrastivo continuado sobre ibm-granite/granite-embedding-small-english-r2, un modelo ModernBERT de IBM. Genera un único vector de 384 dimensiones por texto, con similitud coseno y una longitud máxima de secuencia de 8.192 tokens.

El modelo resuelve el problema de la búsqueda semántica de código: dada una consulta en lenguaje natural (por ejemplo, "leer un CSV en una lista de diccionarios"), devuelve fragmentos de código relevantes. Su relevancia actual radica en que, con solo 48M de parámetros, alcanza 64,84 de nDCG@10 medio en el benchmark CoIR (10 tareas), una mejora de +11,4 puntos sobre el modelo base, y se sitúa en la frontera de Pareto de modelos densos de embeddings en MTEB CoIR para modelos por debajo de 80M de parámetros.

Esta es la etapa de preentrenamiento: no se emplearon negativos duros, destilación ni fine-tuning posterior. Su sucesor afinado es denserepr-code-48M-EN-v1, que alcanza 68,86 en CoIR. La licencia es Apache-2.0 y los pesos se distribuyen en safetensors fp32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (heredada de ibm-granite/granite-embedding-small-english-r2) |
| Parametros totales | 47.662.464 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32 safetensors; entrenamiento con autocast bf16) |
| Idiomas soportados | en (consultas en inglés; código en Python, Go, Java, PHP, JavaScript, Ruby y SQL) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp32) |
| Dimension del embedding | 384-d, pooling CLS, similitud coseno |
| Libreria | sentence-transformers |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura ModernBERT del modelo base de IBM y se entrena mediante preentrenamiento contrastivo continuado con negativos en lote (in-batch negatives) únicamente, sin negativos duros. El objetivo es producir un vector denso por texto, con pooling CLS y similitud coseno, sin prompts ni instrucciones: consultas y documentos se codifican de la misma forma.

Los datos de entrenamiento suman unos 23,1M de pares tras el proceso de limpieza (24,8M antes). Las fuentes son: lightonai/cornstack (docstring → código en Python, Go, Java, PHP, JavaScript y Ruby, 21,5M de pares), codefuse-ai/F2LLM-v2 (OCGI, instrucción → Python, y xCodeEval, problema → solución, 1,1M de pares) y los splits de entrenamiento de las 10 tareas de CoIR-Retrieval (2,2M de pares). La limpieza incluye deduplicación exacta de pares normalizados, eliminación de código stub (cuerpos vacíos, `pass`, `return true`) mediante tree-sitter en 14 lenguajes y descontaminación frente a los conjuntos de test de CoIR y NanoCoIR. El entrenamiento usa pesos en fp32 con autocast bf16; las puntuaciones de CoIR se midieron en bf16.

## Capacidades

- Generación de embeddings densos de 384 dimensiones para textos y fragmentos de código, con similitud coseno.
- Recuperación de código a partir de consultas en lenguaje natural en inglés (text-to-code retrieval).
- Recuperación de código a partir de código (code-to-code), útil en tareas de traducción y detección de duplicados.
- Recuperación texto-a-SQL (evaluada en SyntheticText2SQL).
- Respuesta a preguntas técnicas sobre Stack Overflow (evaluada en StackOverflowQA).
- Manejo de secuencias largas de hasta 8.192 tokens, adecuado para funciones y ficheros de código extensos.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de embeddings, no un modelo generativo.
- Capacidad monolingüe: consultas en inglés; el código cubre seis lenguajes de cornstack más SQL.

## Casos de uso

- Búsqueda semántica en repositorios de código: indexar funciones y ficheros como vectores de 384 dimensiones y recuperar los fragmentos relevantes para una consulta en lenguaje natural, gracias a su ventana de 8.192 tokens que permite indexar funciones completas sin truncar.
- Asistentes de programación con recuperación aumentada (RAG): alimentar un LLM generativo con los fragmentos de código recuperados por este modelo para responder preguntas sobre una base de código, manteniendo bajo el coste de indexación por su reducido tamaño.
- Detección de código duplicado o clonado: comparar embeddings de fragmentos para identificar implementaciones equivalentes entre módulos o repositorios, aprovechando la tarea code-to-code.
- Traducción de código entre lenguajes: localizar la implementación equivalente en otro lenguaje mediante recuperación cross-lingüe de código (evaluado en CodeTransOcean).
- Generación de SQL asistida: recuperar consultas SQL de ejemplo a partir de una descripción en lenguaje natural, como se evalúa en SyntheticText2SQL.
- Atención a desarrolladores en foros y documentación: responder consultas técnicas recuperando respuestas previas de Stack Overflow o documentación interna.
- Filtrado y curación de datasets de código: agrupar y deduplicar semánticamente grandes corpus de código antes de usarlos en entrenamiento.

## Benchmarks y rendimiento

Resultados en CoIR (MTEB), nDCG@10 ×100, medidos a 8.192 tokens con mteb 2.27.8:

| Tarea | Modelo base | Este modelo |
|---|---|---|
| AppsRetrieval | 13,48 | 30,75 |
| CodeFeedbackMT | 52,20 | 81,19 |
| CodeFeedbackST | 76,84 | 81,26 |
| CodeSearchNetCCRetrieval | 48,42 | 75,97 |
| CodeTransOceanContest | 77,63 | 80,00 |
| CodeTransOceanDL | 33,63 | 34,84 |
| CosQA | 35,40 | 33,84 |
| COIRCodeSearchNetRetrieval | 60,42 | 79,90 |
| StackOverflowQA | 90,04 | 90,97 |
| SyntheticText2SQL | 46,44 | 59,69 |
| Media | 53,45 | 64,84 |

El modelo mejora al base en 9 de las 10 tareas; solo retrocede en CosQA (35,40 → 33,84). En el momento de la publicación (2026-11-14) figura como el mejor modelo denso por debajo de 80M de parámetros con las 10 tareas de CoIR en el repositorio de resultados de MTEB (datos al 2026-11-12).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (48M de parámetros), lo que permite ejecutarlo en CPU con latencia baja para lotes moderados.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es más que suficiente; en entornos de servidor, A100 o H100 no son necesarias pero permiten alto throughput por lotes.
- Cabe holgadamente en cualquier GPU consumer, e incluso en CPU y en dispositivos de gama baja.
- Opciones de despliegue: sentence-transformers, Text Embeddings Inference (TEI), endpoints compatibles de Hugging Face; exportación a ONNX no indicada en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CoIR (nDCG@10 medio) | Licencia |
|---|---|---|---|---|
| denserepr-code-48M-pretrain-EN-v1 | 47,7M | 8.192 | 64,84 | Apache-2.0 |
| denserepr-code-48M-EN-v1 (sucesor afinado) | 47,7M | no disponible | 68,86 | no disponible |
| ibm-granite/granite-embedding-small-english-r2 (base) | 47,7M | no disponible | 53,45 | Apache-2.0 |

No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo admite consultas en inglés; el código cubierto se limita principalmente a los seis lenguajes de cornstack (Python, Go, Java, PHP, JavaScript, Ruby) más SQL.
- Es un modelo de embeddings, no generativo: no produce texto, código ni respuestas, solo vectores.
- No se emplearon negativos duros ni destilación; el sucesor afinado obtiene 5,02 puntos más de media en CoIR, por lo que para producción conviene evaluar esa variante.
- Retrocede ligeramente frente al modelo base en CosQA (35,40 → 33,84).
- Riesgo de falsos positivos en recuperación por similitud coseno en dominios de código no representados en el entrenamiento.
- Al ser una versión modificada de un modelo de IBM, no debe presentarse como modelo de IBM.
- Licencia Apache-2.0, que permite uso comercial; deben respetarse las atribuciones de los datasets de entrenamiento (algunos con CC-BY-4.0 y CC-BY-SA).
- No se han publicado datos sobre sesgos, latencia ni comportamiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/f4roukb/denserepr-code-48M-pretrain-EN-v1
- Sucesor afinado: https://huggingface.co/f4roukb/denserepr-code-48M-EN-v1
- Modelo base: https://huggingface.co/ibm-granite/granite-embedding-small-english-r2
- Dataset cornstack: https://huggingface.co/datasets/lightonai/cornstack
- Dataset F2LLM-v2: https://huggingface.co/datasets/codefuse-ai/F2LLM-v2
- Organización CoIR-Retrieval: https://huggingface.co/CoIR-Retrieval
- Dataset StackOverflowQA: https://huggingface.co/datasets/mteb/StackOverflowQA
