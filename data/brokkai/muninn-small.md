# brokkai/Muninn-small

## Resumen

Muninn-small es un modelo de recuperación de código (code retrieval) desarrollado por Brokk AI, diseñado para buscar funciones de código a partir de consultas en lenguaje natural. Con solo 47 millones de parámetros, emplea un encoder ModernBERT y produce embeddings de 384 dimensiones con una ventana de contexto de 8192 tokens. Está entrenado a partir de `ibm-granite/granite-embedding-small-english-r2` y afinado con el dataset sintético BrokkAI/Quarry, que contiene 6525 consultas conductuales sobre revisiones reales de repositorios.

Su relevancia radica en ofrecer un rendimiento competitivo en recuperación de código a nivel de repositorio con un tamaño muy reducido: supera a su modelo base en 4,6 puntos de recall@5 en el benchmark Quarry y alcanza los mismos resultados que SweRank-Small (137M) en recall@20, ocupando aproximadamente un tercio de sus parámetros. Es una opción eficiente para integraciones en entornos con recursos limitados, manteniendo una licencia Apache 2.0 que permite uso comercial.

El modelo está especializado en la tarea de localización de funciones y métodos dentro de un repositorio, no como un generador de código general. Su formato de entrada requiere un encabezado específico con la ruta y el nombre de la función, tal como se describe en su documentación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 47.662.464 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | C, C++, C#, Go, Java, JavaScript, PHP, Python, Rust, Scala, TypeScript |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con sentence-transformers y text-embeddings-inference) |

## Arquitectura y entrenamiento

Muninn-small utiliza un encoder ModernBERT, una arquitectura transformer optimizada para eficiencia y contextos largos. Parte de los pesos del modelo base `ibm-granite/granite-embedding-small-english-r2` (también de 47M de parámetros) y se afina con el dataset BrokkAI/Quarry, compuesto por 6525 consultas sintéticas que describen comportamientos esperados de funciones, emparejadas con fragmentos de código reales extraídos de repositorios. El entrenamiento emplea prompts específicos: para consultas usa el prefijo "Given a GitHub issue, retrieve code that must be changed to fix it. Query:" y para documentos "Passage: Code chunk from repository." Esta elección de prompts hace que el modelo esté optimizado para recuperación de código a nivel de repositorio, no para búsqueda genérica de texto.

El modelo genera embeddings normalizados de 384 dimensiones y soporta una longitud de contexto de 8192 tokens, lo que permite procesar funciones y métodos completos junto con su contexto. No se mencionan técnicas como RLHF o DPO en la información disponible; el entrenamiento parece ser exclusivamente de tipo contrastivo supervisado.

## Capacidades

- Recuperación de funciones y métodos de código a partir de consultas en lenguaje natural, con precisión a nivel de función.
- Soporte multilingüe para 11 lenguajes de programación: C, C++, C#, Go, Java, JavaScript, PHP, Python, Rust, Scala y TypeScript.
- Manejo de contextos largos (hasta 8192 tokens), adecuado para fragmentos de código extensos o archivos completos.
- Integración con el ecosistema sentence-transformers, lo que facilita su uso en pipelines de búsqueda semántica.
- Compatible con text-embeddings-inference para despliegue en producción.
- No incluye capacidades de generación de código, tool calling ni razonamiento multi-paso; es exclusivamente un modelo de embeddings.

## Casos de uso

- Búsqueda semántica en repositorios grandes: los equipos de desarrollo pueden localizar rápidamente la función que implementa una lógica concreta describiéndola en lenguaje natural, sin necesidad de conocer nombres exactos de archivos o métodos.
- Asistente para resolución de issues: dado un issue de GitHub, el modelo puede sugerir qué funciones deben modificarse, acelerando el triaje y la asignación de tareas.
- Integración en IDEs y editores de código: como plugin que permite buscar implementaciones por descripción, mejorando la navegación en codebases desconocidas.
- Automatización de revisiones de código: en pipelines de CI/CD, puede verificar si un cambio afecta a funciones relacionadas, ayudando a identificar dependencias.
- Indexación de documentación técnica: convertir descripciones de APIs en enlaces a las implementaciones correspondientes.
- Entrenamiento de agentes de código: como componente de recuperación en sistemas RAG para asistentes de programación, proporcionando contexto relevante a modelos generativos.
- Análisis de código legacy: localizar funciones obsoletas o duplicadas describiendo su comportamiento, facilitando tareas de refactorización.

## Benchmarks y rendimiento

Los resultados publicados en la model card incluyen mediciones propias del autor sobre el dataset Quarry y benchmarks externos. A continuación se presentan los datos más relevantes.

**Quarry** (recall@k, métrica estricta sobre 6525 consultas):

| Modelo | Params | recall@5 | recall@20 | recall@50 |
|---|---:|---:|---:|---:|
| Muninn (346M) | 346M | 61.4 | 82.6 | 90.7 |
| voyage-code-3 | API | 59.1 | 81.8 | 90.4 |
| SweRank-Large | 7B | 58.5 | 80.6 | 89.6 |
| Nemotron-3-Embed-1B | 1B | 58.3 | 79.9 | 88.7 |
| bge-code-v1 | 1.5B | 58.2 | 79.8 | 88.7 |
| **Muninn-small** | 47M | 52.3 | 74.6 | 84.7 |
| granite-embedding-small-english-r2 (base) | 47M | 47.7 | 69.7 | 80.5 |

**SWE-Bench-Lite localization** (274 issues de Python, precisión a nivel de función):

| Modelo | Acc@5 | Acc@10 |
|---|---:|---:|
| Muninn (346M) | 73.4 | 79.6 |
| SweRank-Large (7B)† | 71.9 | 82.1 |
| SweRank-Small (137M)† | 63.1 | 74.5 |
| **Muninn-small (47M)** | 48.5 | 61.0 |

**LocBench** (560 issues de Python, precisión a nivel de función):

| Modelo | Acc@10 | Acc@15 |
|---|---:|---:|
| SweRank-Large (7B)† | 63.2 | 67.3 |
| Muninn (346M) | 60.2 | 65.7 |
| SweRank-Small (137M)† | 58.6 | 63.4 |
| **Muninn-small (47M)** | 46.4 | 51.6 |

**CodeSearchNet** (media NDCG@10 sobre 6 lenguajes):

| Modelo | Mean NDCG@10 |
|---|---:|
| Qwen3-Embedding-8B† | 92.7 |
| Qwen3-Embedding-0.6B† | 91.0 |
| Muninn (346M) | 90.1 |
| SweRank-Small (137M) | 87.9 |
| SweRank-Large (7B) | 85.0 |
| **Muninn-small (47M)** | 77.8 |

† Indica números publicados en papers o leaderboards oficiales. El resto son mediciones propias del autor siguiendo el mismo protocolo.

En CoIR text-to-code, Muninn-small obtiene un NDCG@10 de 12.4 en APPS y 35.1 en CosQA, muy por debajo de modelos más grandes, lo que confirma su especialización en recuperación a nivel de repositorio y no en tareas de generación de código tipo competición.

## Requisitos de hardware

- Con 47 millones de parámetros, el modelo ocupa aproximadamente 190 MB en precisión fp32 (o ~95 MB en fp16), por lo que cabe holgadamente en cualquier GPU consumer moderna (incluso en CPU).
- VRAM estimada para inferencia: menos de 1 GB en fp32, menos de 0.5 GB en fp16. Suficiente para ejecutarse en GPUs como RTX 3060, RTX 4060, o incluso en entornos sin GPU usando CPU.
- Opciones de despliegue: sentence-transformers para prototipado, text-embeddings-inference para servicios de embeddings, y cualquier framework compatible con safetensors (por ejemplo, ONNX Runtime).
- Al ser un modelo pequeño, la latencia es muy baja: en una GPU moderna se pueden procesar miles de consultas por segundo, aunque no se proporcionan cifras oficiales de throughput.

## Comparativa con modelos similares

La siguiente tabla compara Muninn-small con otros modelos de recuperación de código de tamaño similar o superior, basándose en los datos de Quarry (recall@20) y CodeSearchNet (NDCG@10):

| Modelo | Params | Contexto | Quarry recall@20 | CodeSearchNet NDCG@10 | Licencia |
|---|---:|---:|---:|---:|---|
| Muninn-small | 47M | 8192 | 74.6 | 77.8 | Apache-2.0 |
| Muninn | 346M | no disponible | 82.6 | 90.1 | Apache-2.0 |
| SweRank-Small | 137M | no disponible | 74.6 | 87.9 | no disponible |
| granite-embedding-small-english-r2 (base) | 47M | no disponible | 69.7 | no disponible | Apache-2.0 |

Muninn-small iguala a SweRank-Small en Quarry recall@20 con un 65% menos de parámetros, aunque pierde en CodeSearchNet. Frente a su base, mejora en 4.9 puntos en recall@20, lo que demuestra el valor del afinamiento específico. La alternativa más cercana en tamaño es el propio base, que es claramente inferior en esta tarea.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está optimizado para recuperación de funciones en repositorios; su rendimiento en tareas de texto-a-código general (como APPS) es muy bajo (NDCG@10 de 12.4), por lo que no debe usarse como buscador de código genérico.
- Dependencia del formato de entrada: requiere que los documentos se presenten con el encabezado específico (`{path}/{function_name}` o `{path}/{ClassName}/{function_name}`) para obtener resultados óptimos. Usar otro formato degrada el rendimiento.
- Prompts fijos: el prefijo de consulta está entrenado con la frase "Given a GitHub issue, retrieve code that must be changed to fix it. Query:" y debe mantenerse sin cambios, incluso si la consulta real no proviene de un issue.
- Idiomas limitados: solo cubre 11 lenguajes de programación; lenguajes populares como Ruby, Kotlin o Swift no están soportados.
- Sin capacidad generativa: no puede generar código ni responder preguntas; solo produce embeddings.
- Sesgos potenciales: al entrenarse sobre repositorios reales, puede reflejar sesgos en los estilos de código o en la distribución de lenguajes de los datos de Quarry.
- Alucinación no aplica directamente al ser un modelo de embeddings, pero la recuperación puede fallar si la consulta describe un comportamiento no presente en el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/brokkai/Muninn-small
- Modelo Muninn (versión grande): https://huggingface.co/brokkai/Muninn
- Dataset Quarry: https://huggingface.co/datasets/BrokkAI/Quarry
- Modelo base: https://huggingface.co/ibm-granite/granite-embedding-small-english-r2
