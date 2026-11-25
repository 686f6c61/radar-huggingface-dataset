# minishlab/blink-code-16M-int8

## Resumen

blink-code-16M-int8 es la versión cuantizada a int8 de blink-code-16M, un modelo de embeddings estáticos para recuperación de código (code retrieval) desarrollado por Minish. No es un modelo generativo: se trata de una única tabla de embeddings de tokens de 62.500 × 256 (16,0 M de parámetros) con mean pooling, sin capas transformer ni parámetros activos. Su función es mapear consultas en lenguaje natural y fragmentos de código a un espacio vectorial común para tareas de búsqueda semántica, similitud entre fragmentos y extracción de características.

La relevancia del modelo radica en su coste computacional: al carecer de atención y de pasada por capas, es varios órdenes de magnitud más rápido que un transformer de embedding de tamaño comparable, lo que lo hace viable para indexar repositorios enteros o para servir búsqueda semántica en entornos con CPU. Sustituye a potion-code-16M-v2 con el mismo tamaño y mejoras en todas las métricas reportadas por el autor, incluyendo un incremento de 40,67 a 46,82 en la media de CoIR.

La versión int8 ocupa 16 MB (4× menos que el modelo en float32) y, según el autor, obtiene puntuaciones casi idénticas al modelo original en sus benchmarks. Está publicada con licencia MIT y solo es cargable mediante las librerías model2vec y model2vec-rs; Sentence Transformers no admite pesos int8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estáticos (model2vec): tabla de embeddings de tokens con mean pooling, sin capas transformer ni parámetros activos |
| Parametros totales | 16.000.000 |
| Parametros activos | No aplica (modelo estático, sin parámetros activos) |
| Longitud de contexto | No disponible (el modelo base potion-code-16M-v2 aplicaba un límite de 512 tokens en su tokenizador; no se especifica el de blink-code-16M) |
| Tipos de cuantizacion | int8 (esta versión); el modelo base blink-code-16M está en float32 |
| Idiomas soportados | Código (etiqueta `code`); el autor indica que usa las tareas públicas en inglés de RTEB(Code) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería model2vec); tamaño del repo 0,0 GB |

## Arquitectura y entrenamiento

blink-code-16M es un modelo de embeddings estáticos: toda su parametrización consiste en una única tabla de embeddings de 62.500 × 256 entradas, y el vector de un texto se obtiene promediando (mean pooling) los embeddings de sus tokens. No hay mecanismo de atención ni cómputo secuencial por capas, lo que explica su velocidad. La dimensionalidad del embedding es 256 y el total de parámetros asciende a 16,0 M.

El entrenamiento se apoya en un conjunto de datasets orientados a recuperación de código y a minería de negativos duros: `minishlab/cornstack-queries-docs`, `minishlab/tokenlearn-cornstack-docs-coderankembed-v2`, `minishlab/tokenlearn-cornstack-queries-coderankembed-v2`, `minishlab/coir-train-hard-negatives`, `minishlab/cornstack-hard-negatives` y los corpus por lenguaje de `nomic-ai` (cornstack-python-v1, java-v1, javascript-v1, go-v1, php-v1, ruby-v1). El autor no detalla en la model card el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de alineación como RLHF o DPO. La versión int8 se presenta como una cuantización del modelo base con pérdida de rendimiento mínima según las mediciones del autor, aunque los resultados publicados corresponden al modelo float32.

## Capacidades

- Generación de embeddings de código y de texto para similitud semántica y recuperación (pipeline `feature-extraction` y `sentence-similarity`).
- Recuperación text-to-code: dada una descripción en lenguaje natural, localizar el fragmento de código correspondiente.
- Recuperación code-to-code: encontrar fragmentos de código similares a otro fragmento.
- Recuperación code-to-text y preguntas y respuestas sobre código.
- Recuperación text-to-SQL (evaluado en la tarea Text2SQL de CoIR y en WikiSQL de RTEB(Code)).
- Recuperación de parches: dado un mensaje de commit, localizar el diff asociado (evaluado en CodeEditSearch).
- Soporte multilingüe de lenguajes de programación en el entrenamiento: Python, Java, JavaScript, Go, PHP y Ruby aparecen en los datasets de `nomic-ai`; RTEB(Code) evalúa Python, JavaScript y Go.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni generación de texto: es un modelo puramente de representación.

## Casos de uso

- Búsqueda semántica en repositorios de código: indexar todos los ficheros y funciones de un monorepositorio con embeddings de 256 dimensiones y servir consultas en lenguaje natural. El coste de indexación es bajo porque el modelo no ejecuta atención y puede correr en CPU.
- Asistentes de documentación y ejemplos: dado un fragmento de código del usuario, recuperar la entrada de documentación o el ejemplo de API más relevante, usando la capacidad code-to-text evaluada en CoIR.
- Detección de duplicados y refactorización: comparar funciones o módulos mediante similitud coseno de sus embeddings para localizar código duplicado o candidatos a unificar, gracias a la recuperación code-to-code.
- Búsqueda de parches y contexto para revisión de código: dado el mensaje de un commit, recuperar el diff correspondiente (tarea CodeEditSearch), útil para enlazar historial de cambios con descripciones.
- Generación asistida de SQL: mapear una pregunta sobre una tabla a la consulta SQL candidata, apoyándose en los resultados de Text2SQL y WikiSQL reportados.
- Filtrado previo en pipelines RAG sobre código: usar el modelo como recuperador de primera etapa de bajo coste y reservar un cross-encoder o un LLM para la reordenación, reduciendo la latencia total del sistema.
- Servicio de búsqueda en el borde o en entornos sin GPU: al ocupar 16 MB en int8 y no requerir acelerador, puede desplegarse en funciones serverless o en dispositivos con recursos limitados.

## Benchmarks y rendimiento

Todos los resultados son nDCG@10 medidos con mteb 2.27.1 y corresponden al modelo float32 blink-code-16M, según indica el autor. La versión int8 no tiene tabla propia publicada.

CoIR (10 tareas de recuperación de código):

| Modelo | Media | Apps | CodeSearchNet | CodeFeedbackMT | CodeFeedbackST | CodeSearchNetCC | CodeTransContest | CodeTransDL | CosQA | StackOverflow | Text2SQL |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **blink-code-16M** | **46,82** | **6,08** | **53,59** | 51,72 | 65,87 | 51,42 | **57,31** | **38,34** | 24,34 | 64,03 | **55,45** |
| BM25 | 42,31 | 4,76 | 40,86 | **59,19** | **68,15** | **53,97** | 47,78 | 34,42 | 18,75 | **70,26** | 24,94 |
| potion-code-16M-v2 | 40,67 | 5,05 | 46,34 | 46,50 | 54,40 | 43,70 | 48,55 | 33,48 | **24,39** | 60,13 | 44,12 |
| potion-code-16M | 38,78 | 4,11 | 43,10 | 45,09 | 52,24 | 43,09 | 45,40 | 32,81 | 22,19 | 58,10 | 41,66 |

RTEB(Code) (tareas públicas en inglés; el autor indica que no están en los datos de entrenamiento):

| Modelo | Media | DS1000 | HumanEval | MBPP | WikiSQL | FreshStack | SWE-bench |
|---|---:|---:|---:|---:|---:|---:|---:|
| **blink-code-16M** | **34,67** | 29,17 | **64,84** | **56,75** | 30,94 | 22,92 | 3,39 |
| BM25 | 29,90 | **41,45** | 38,47 | 11,64 | **52,16** | **27,89** | **7,76** |
| potion-code-16M-v2 | 29,21 | 20,83 | 55,31 | 51,53 | 22,96 | 21,14 | 3,50 |
| potion-code-16M | 27,34 | 20,14 | 49,95 | 47,03 | 22,54 | 21,55 | 2,83 |

Según el autor, blink-code-16M es el mejor en 5 de las 10 tareas de CoIR y en 5 de las 6 tareas de RTEB(Code), con ventajas especialmente amplias en HumanEval y MBPP (MBPP: 56,75 frente a 11,64 de BM25). BM25 supera al modelo en DS1000, WikiSQL, FreshStack y SWE-bench, y en CodeFeedbackMT, CodeFeedbackST, CodeSearchNetCC y StackOverflow de CoIR. En SWE-bench todos los modelos quedan por debajo de 8 puntos.

## Requisitos de hardware

- VRAM: no requiere GPU. El peso int8 ocupa 16 MB, por lo que cabe en memoria de sistema o incluso en caché de CPU.
- GPU recomendadas: no aplica; cualquier GPU sirve, pero el modelo no aprovecha la aceleración matricial de forma significativa al no tener capas de atención.
- GPU de consumo: cabe en cualquier GPU de consumo e integrada, así como en CPU y en dispositivos de borde.
- Opciones de despliegue: librería `model2vec` (Python) y `model2vec-rs` (Rust). Sentence Transformers no admite pesos int8, por lo que para ese ecosistema debe usarse el modelo base blink-code-16M en float32.
- Latencia y throughput: el autor afirma que los modelos estáticos son varios órdenes de magnitud más rápidos que los transformers, pero no publica cifras concretas de latencia ni de throughput en la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | CoIR (media) | RTEB(Code) (media) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| blink-code-16M-int8 | 16,0 M | Embeddings estáticos int8 | No publicado para int8 (float32: 46,82) | No publicado para int8 (float32: 34,67) | MIT | Hugging Face (model2vec) |
| potion-code-16M-v2 | 16,0 M | Embeddings estáticos float32 | 40,67 | 29,21 | No indicada en la información disponible | Hugging Face (model2vec) |
| potion-code-16M | 16,0 M | Embeddings estáticos float32 | 38,78 | 27,34 | No indicada en la información disponible | Hugging Face (model2vec) |
| BM25 | No aplica | Recuperación léxica | 42,31 | 29,90 | No aplica | Implementaciones múltiples |

Frente a los modelos potion-code, blink-code-16M mejora la media de CoIR en 6,15 puntos y la de RTEB(Code) en 5,46 puntos respecto a potion-code-16M-v2, con el mismo número de parámetros. Frente a BM25, gana en la media de ambos benchmarks pero pierde en tareas concretas como StackOverflow, WikiSQL y SWE-bench, donde la coincidencia léxica resulta más informativa.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, código ni respuestas; solo vectores de embedding. No debe emplearse para chat, razonamiento ni tool calling.
- Solo carga con model2vec y model2vec-rs. Sentence Transformers no soporta pesos int8; para ese ecosistema hay que usar blink-code-16M en float32.
- Los benchmarks publicados corresponden al modelo float32. El autor afirma que la versión int8 obtiene puntuaciones casi idénticas, pero no publica la tabla de resultados de int8, por lo que la pérdida exacta por cuantización no es verificable con los datos disponibles.
- Rendimiento inferior a BM25 en tareas de recuperación léxica como StackOverflow (64,03 frente a 70,26), WikiSQL (30,94 frente a 52,16) y SWE-bench (3,39 frente a 7,76). En SWE-bench el resultado es prácticamente nulo para todos los modelos comparados.
- La evaluación de RTEB(Code) se limita a las tareas públicas en inglés; el comportamiento en otros idiomas naturales no está documentado.
- El autor no detalla la composición exacta del dataset de entrenamiento ni el número de tokens, lo que dificulta evaluar sesgos o cobertura de lenguajes más allá de los presentes en los corpus de nomic-ai (Python, Java, JavaScript, Go, PHP, Ruby).
- Al ser un modelo de embeddings, hereda los sesgos presentes en los corpus de código de entrenamiento; no se han publicado análisis de sesgo.
- Licencia MIT: permite uso comercial y modificación sin restricciones adicionales conocidas, pero conviene verificar las licencias de los datasets de entrenamiento si se redistribuye el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/minishlab/blink-code-16M-int8
- Modelo base float32: https://huggingface.co/minishlab/blink-code-16M
- Modelo predecesor: https://huggingface.co/minishlab/potion-code-16M-v2
- Organización Minish: https://minish.ai
- Librería model2vec (Python): https://github.com/MinishLab/model2vec
- Librería model2vec-rs (Rust): https://github.com/MinishLab/model2vec-rs
- Benchmark CoIR: https://github.com/CoIR-team/coir
- Blog de RTEB: https://huggingface.co/blog/rteb
- Dataset CodeEditSearch: https://huggingface.co/datasets/cassanof/CodeEditSearch
