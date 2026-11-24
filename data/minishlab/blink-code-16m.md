# minishlab/blink-code-16M

## Resumen

blink-code-16M es un modelo de embeddings estáticos para recuperación de código desarrollado por Minish (minish.ai). No es un modelo generativo: se trata de una única tabla de embeddings de tokens de 62.500 × 256 (16,0 millones de parámetros, 64 MB en float32) con mean pooling, construida sobre la librería model2vec. Su función es convertir consultas en lenguaje natural y fragmentos de código en vectores densos comparables, para tareas de búsqueda y recuperación (retrieval) sobre bases de código.

El modelo sustituye a potion-code-16M-v2 del mismo autor, con idéntico tamaño pero mejores resultados en todas las métricas que el autor reporta: la media de CoIR sube de 40,67 a 46,82 (nDCG@10). Al carecer de parámetros activos y de pase forward de transformer, la inferencia es varios órdenes de magnitud más rápida que la de un modelo Transformer de embeddings, lo que lo hace atractivo para indexación masiva de repositorios y búsqueda en tiempo real.

Es relevante ahora porque cubre un nicho concreto: recuperación de código multilingüe (Python, Java, JavaScript, Go, PHP, Ruby y otros) con un coste computacional mínimo y licencia MIT, lo que permite integrarlo en herramientas de desarrollo, asistentes de código y sistemas RAG sin dependencia de infraestructura GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estáticos (model2vec): tabla de embeddings de tokens 62.500 × 256 con mean pooling; sin capas transformer ni parámetros activos |
| Parametros totales | 16.000.000 |
| Parametros activos | no aplica (modelo estático, sin parámetros activos) |
| Longitud de contexto | no disponible (el autor menciona que potion-code limita el tokenizador a 512 tokens; no se especifica el límite de blink-code-16M) |
| Tipos de cuantizacion | no disponible (los pesos son una tabla de embeddings; el autor indica 64 MB en float32) |
| Idiomas soportados | código (el tag de idioma es `code`); entrenado con datos de Python, Java, JavaScript, Go, PHP y Ruby, entre otros |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,1 GB |
| Libreria | model2vec |
| Dimension de embedding | 256 |

## Arquitectura y entrenamiento

blink-code-16M es un modelo de embeddings estáticos: toda su capacidad reside en una tabla de embeddings de tokens de 62.500 entradas por 256 dimensiones, y el vector de un texto se obtiene promediando (mean pooling) los embeddings de sus tokens. No hay atención, ni capas ocultas, ni parámetros activos por token. Esta arquitectura elimina el coste del pase forward de un transformer, a cambio de una capacidad de representación menor que la de un modelo contextual.

El autor no detalla en la información disponible el número total de tokens de entrenamiento ni el procedimiento exacto de destilación. Los datasets declarados en la model card incluyen pares consulta-documento y negativos duros: minishlab/cornstack-queries-docs, minishlab/tokenlearn-cornstack-docs-coderankembed-v2, minishlab/tokenlearn-cornstack-queries-coderankembed-v2, minishlab/coir-train-hard-negatives, minishlab/cornstack-hard-negatives y los conjuntos nomic-ai/cornstack-{python,java,javascript,go,php,ruby}-v1. El uso de negativos duros y de datos derivados de CoIR sugiere un entrenamiento orientado a retrieval con pares positivos y negativos, aunque el autor no especifica si hubo RLHF, DPO ni la función de pérdida concreta.

La innovación principal es la propia familia model2vec: destilar modelos de embeddings contextuales en tablas estáticas manteniendo una fracción competitiva del rendimiento. Según el autor, blink-code-16M supera a potion-code-16M-v2 en todas las métricas medidas, con el mismo tamaño y una mejora de 6,15 puntos en la media de CoIR.

## Capacidades

- Generación de embeddings densos de 256 dimensiones para textos y fragmentos de código, aptos para búsqueda por similitud (coseno o producto escalar).
- Recuperación text-to-code: dada una consulta en lenguaje natural, encontrar el fragmento de código relevante.
- Recuperación code-to-code: dada una función o fragmento, encontrar código similar.
- Recuperación code-to-text y preguntas y respuestas sobre código (tareas incluidas en CoIR).
- Recuperación de cambios de código (diffs) a partir del mensaje de commit, evaluada en CodeEditSearch sobre 13 lenguajes.
- Cobertura multilingüe de código: Python, Java, JavaScript, TypeScript, Go, PHP, Ruby, C, C++, Rust, Swift, Scala y Shell aparecen en los benchmarks reportados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de representación.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Búsqueda semántica en repositorios de código: indexar todos los ficheros y funciones de un monorepositorio con el modelo y servir búsquedas en lenguaje natural ("leer un JSON en Python") con latencia de milisegundos, sin GPU, gracias a que la codificación es una simple media de embeddings de tokens.
- Asistentes de código en el IDE: recuperar los fragmentos relevantes del proyecto para inyectarlos como contexto en un LLM generativo, reduciendo el coste del prompt y mejorando la precisión de las sugerencias.
- RAG sobre documentación técnica y código: construir el índice de recuperación de un sistema RAG que responda preguntas sobre una base de código; el modelo actúa como retriever y un LLM como generador.
- Búsqueda de commits y cambios: localizar el diff que resolvió un problema a partir de la descripción del commit, útil en herramientas de auditoría y en la reconstrucción de historial de cambios.
- Deduplicación y clustering de código: agrupar funciones o ficheros similares en procesos de refactorización o de análisis de calidad, usando la similitud entre embeddings.
- Detección de código duplicado o plagiado: comparar embeddings de fragmentos para identificar copias entre repositorios o entre proyectos de una organización.
- Enrutamiento de issues a ficheros: dado un issue de GitHub, recuperar los ficheros candidatos a modificar; el autor evalúa esta tarea en SWE-bench, aunque con resultados bajos (3,39 de nDCG@10), por lo que conviene combinarlo con otras señales.
- Filtrado previo en pipelines de CI/CD: recuperar tests o módulos relacionados con un cambio antes de ejecutar la suite completa, reduciendo el tiempo de integración.

## Benchmarks y rendimiento

Resultados reportados por el autor, nDCG@10 con mteb 2.27.1.

CoIR (10 tareas de recuperación de código):

| Modelo | Media | Apps | CodeSearchNet | CodeFeedbackMT | CodeFeedbackST | CodeSearchNetCC | CodeTransContest | CodeTransDL | CosQA | StackOverflow | Text2SQL |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| blink-code-16M | 46,82 | 6,08 | 53,59 | 51,72 | 65,87 | 51,42 | 57,31 | 38,34 | 24,34 | 64,03 | 55,45 |
| BM25 | 42,31 | 4,76 | 40,86 | 59,19 | 68,15 | 53,97 | 47,78 | 34,42 | 18,75 | 70,26 | 24,94 |
| potion-code-16M-v2 | 40,67 | 5,05 | 46,34 | 46,50 | 54,40 | 43,70 | 48,55 | 33,48 | 24,39 | 60,13 | 44,12 |
| potion-code-16M | 38,78 | 4,11 | 43,10 | 45,09 | 52,24 | 43,09 | 45,40 | 32,81 | 22,19 | 58,10 | 41,66 |

RTEB(Code) (datos no vistos en entrenamiento):

| Modelo | Media | DS1000 | HumanEval | MBPP | WikiSQL | FreshStack | SWE-bench |
|---|---:|---:|---:|---:|---:|---:|---:|
| blink-code-16M | 34,67 | 29,17 | 64,84 | 56,75 | 30,94 | 22,92 | 3,39 |
| BM25 | 29,90 | 41,45 | 38,47 | 11,64 | 52,16 | 27,89 | 7,76 |
| potion-code-16M-v2 | 29,21 | 20,83 | 55,31 | 51,53 | 22,96 | 21,14 | 3,50 |
| potion-code-16M | 27,34 | 20,14 | 49,95 | 47,03 | 22,54 | 21,55 | 2,83 |

El autor destaca que blink-code-16M es mejor en 5 de 10 tareas de CoIR y en 5 de 6 de RTEB(Code), con ventajas claras en HumanEval (64,84 frente a 55,31 de potion-code-16M-v2) y MBPP (56,75 frente a 51,53), pero por detrás de BM25 en DS1000, WikiSQL, FreshStack y SWE-bench. En CodeEditSearch, el autor reporta resultados por lenguaje, pero los datos disponibles se cortan en la tabla de la model card.

## Requisitos de hardware

- VRAM: 64 MB en float32 para los pesos del modelo; la indexación de grandes corpus requiere memoria para almacenar los vectores (256 dimensiones por documento, aproximadamente 1 KB por fragmento en float32).
- GPU: no es necesaria. La codificación es una operación de lookup y media, ejecutable en CPU con throughput muy alto.
- Cabe en cualquier GPU consumer, e incluso en entornos sin GPU (servidores, contenedores, dispositivos edge).
- Despliegue: librería model2vec (Python), model2vec-rs (Rust) y Sentence Transformers. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, y en general no aplican a modelos estáticos de embeddings.
- Latencia y throughput: el autor afirma que los modelos estáticos son varios órdenes de magnitud más rápidos que los transformers, pero no publica cifras concretas de latencia o throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | CoIR (media) | RTEB(Code) (media) | Licencia |
|---|---:|---|---:|---:|---|
| blink-code-16M | 16 M | Embeddings estáticos (model2vec) | 46,82 | 34,67 | MIT |
| potion-code-16M-v2 | 16 M | Embeddings estáticos (model2vec) | 40,67 | 29,21 | no disponible en la información |
| potion-code-16M | 16 M | Embeddings estáticos (model2vec) | 38,78 | 27,34 | no disponible en la información |
| BM25 | no aplica | Recuperación léxica | 42,31 | 29,90 | no aplica |

Frente a BM25, blink-code-16M gana en la media de ambos benchmarks y en tareas de recuperación semántica (HumanEval, MBPP, Text2SQL), pero pierde en tareas donde la coincidencia léxica exacta es decisiva (StackOverflow, WikiSQL, SWE-bench). Frente a los potion-code del mismo autor, la mejora es consistente en todas las medias reportadas. No se dispone de comparación con modelos de embeddings de código basados en transformers en la información proporcionada.

## Limitaciones y advertencias

- Modelo estático: no captura contexto ni orden de tokens más allá de la media de embeddings; el rendimiento en tareas que requieren comprensión semántica fina es inferior al de un transformer.
- Resultados bajos en SWE-bench (3,39 de nDCG@10) y por detrás de BM25 en DS1000, WikiSQL, FreshStack y SWE-bench; no es adecuado como único retriever en esos escenarios.
- Sesgos: no se documentan sesgos específicos, pero al entrenarse con corpus de código de GitHub puede heredar sesgos de estilo y de distribución de lenguajes (predominio de Python y JavaScript).
- Riesgo de alucinación: no aplica a generación de texto, pero la recuperación puede devolver fragmentos irrelevantes con alta similitud; conviene validar umbrales de similitud en producción.
- Limitaciones de idioma: el tag de idioma es `code`; no se garantiza rendimiento en consultas en lenguaje natural fuera del inglés, ya que los benchmarks reportados son en inglés.
- Restricciones de licencia: licencia MIT, permite uso comercial y modificación con atribución; no se documentan restricciones adicionales.
- Caveat de producción: el autor no especifica la longitud máxima de entrada ni el comportamiento del tokenizador; potion-code limitaba a 512 tokens, y se desconoce si blink-code-16M mantiene ese límite.
- El modelo tiene un número muy bajo de descargas (11) y likes (1) en el momento de la consulta, lo que indica poca validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/minishlab/blink-code-16M
- Minish: https://minish.ai
- Librería model2vec: https://github.com/MinishLab/model2vec
- Implementación en Rust model2vec-rs: https://github.com/MinishLab/model2vec-rs
- Sentence Transformers: https://www.sbert.net
- Benchmark CoIR: https://github.com/CoIR-team/coir
- Blog de RTEB: https://huggingface.co/blog/rteb
- Dataset CodeEditSearch: https://huggingface.co/datasets/cassanof/CodeEditSearch
- Modelo predecesor potion-code-16M-v2: https://huggingface.co/minishlab/potion-code-16M-v2
