# brokkai/Muninn

## Resumen

Muninn es un modelo de embeddings multilingüe especializado en recuperación de funciones de código a partir de consultas en lenguaje natural. Desarrollado por Brokk AI (brokkai), cuenta con 346 millones de parámetros y genera representaciones vectoriales de 2.048 dimensiones sobre un contexto de servicio de 8.192 tokens. Está construido a partir de `voyageai/voyage-4-nano` y emplea un codificador bidireccional basado en Qwen3, con una implementación personalizada que requiere `trust_remote_code=True` al cargarlo.

El modelo resuelve el problema de localización semántica de código: dado un repositorio y una consulta descriptiva (por ejemplo, "dónde se calcula el backoff de reintentos"), produce embeddings que permiten recuperar la función o método relevante. Su relevancia actual radica en que alcanza resultados competitivos con modelos mucho mayores (hasta 8B de parámetros) y con APIs comerciales, manteniendo un tamaño reducido que permite su despliegue en hardware modesto. Soporta truncamiento Matryoshka a 512, 1.024, 1.536 y 2.048 dimensiones, lo que facilita ajustar el equilibrio entre calidad y coste de almacenamiento.

La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales. El modelo está pensado para integrarse en pipelines de recuperación aumentada (RAG) sobre bases de código, asistentes de desarrollo y herramientas de búsqueda en repositorios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder bidireccional Qwen3 (implementacion personalizada `Qwen3BidirectionalModel`) |
| Parametros totales | 346.451.968 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | C, C++, C#, Go, Java, JavaScript, PHP, Python, Rust, Scala y TypeScript |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con sentence-transformers) |

## Arquitectura y entrenamiento

Muninn se basa en un codificador bidireccional derivado de la arquitectura Qwen3, adaptado para producir representaciones simétricas de consultas y documentos. El modelo se inicializa desde `voyageai/voyage-4-nano` (346M parámetros, también bajo Apache-2.0) y se entrena sobre el dataset sintético `BrokkAI/Quarry`, que contiene 6.525 consultas conductuales generadas artificialmente sobre revisiones reales de repositorios. El entrenamiento sigue un esquema de contrastive learning típico de los modelos de retrieval, con prompts diferenciados para consultas y documentos:

- Consulta: `Represent the query for retrieving supporting documents:`
- Documento: `Represent the document for retrieval:`

Una innovación destacable es el soporte de truncamiento Matryoshka, que permite reducir la dimensionalidad de los embeddings (512, 1.024, 1.536 o 2.048) sin necesidad de reentrenar. El formato de documento utilizado durante el entrenamiento sigue la convención `{ruta}/{nombre_funcion}` para funciones libres y `{ruta}/{Clase}/{metodo}` para métodos de clase, con el código fuente a continuación. Este formato debe preservarse al comparar resultados con los benchmarks publicados.

## Capacidades

- Recuperación de funciones de código mediante consultas en lenguaje natural, con precisión a nivel de función o método.
- Soporte multilingüe para 11 lenguajes de programación: C, C++, C#, Go, Java, JavaScript, PHP, Python, Rust, Scala y TypeScript.
- Embeddings de 2.048 dimensiones con truncamiento Matryoshka a 512, 1.024 y 1.536 dimensiones, manteniendo calidad razonable (el truncado a 512 cuesta aproximadamente dos puntos de recall@depth en Quarry).
- Generación de representaciones normalizadas (normalize_embeddings=True) para similitud coseno directa.
- Compatible con la librería sentence-transformers y con text-embeddings-inference (TEI), lo que facilita su despliegue en servicios de embeddings.
- Capacidad de procesar contextos largos de hasta 8.192 tokens, adecuado para documentos de código extensos o múltiples funciones concatenadas.
- No incluye capacidades de generación de texto, tool calling ni razonamiento multi-paso; es exclusivamente un modelo de embeddings.

## Casos de uso

- Búsqueda semántica en repositorios grandes: un desarrollador puede preguntar "¿dónde se gestiona la autenticación OAuth?" y obtener la función exacta que implementa esa lógica, incluso si los nombres no coinciden con la consulta. Muninn es adecuado por su precisión a nivel de función y su contexto de 8.192 tokens.
- Asistentes de desarrollo integrados en IDE: al indexar el código del proyecto con Muninn, un plugin puede sugerir archivos o funciones relevantes mientras el programador escribe una descripción en lenguaje natural. Su tamaño reducido permite ejecutarlo localmente en estaciones de trabajo.
- Automatización de triaje de incidencias: dado un informe de bug, se puede recuperar automáticamente el código responsable de la funcionalidad afectada, acelerando la asignación a los mantenedores adecuados. La alta recall@20 (82.6 en Quarry) garantiza que la función correcta aparezca entre los primeros resultados.
- RAG sobre documentación técnica y código: Muninn puede servir como retriever en un pipeline de generación aumentada donde un LLM responde preguntas sobre una base de código. Sus embeddings de 2.048 dimensiones capturan relaciones semánticas entre consultas y código.
- Análisis de impacto de cambios: antes de modificar una función, se pueden buscar todas las funciones relacionadas semánticamente (por ejemplo, "manejo de errores de red") para evaluar dependencias. La capacidad multilingüe cubre repositorios heterogéneos.
- Indexación de código para motores de búsqueda internos: empresas con grandes monorepos pueden desplegar Muninn como backend de búsqueda, reemplazando búsquedas basadas en regex o nombres de símbolos por búsqueda semántica, con licencia Apache-2.0 que no restringe el uso comercial.

## Benchmarks y rendimiento

Los resultados que se muestran a continuación provienen de la model card del autor. Las filas marcadas con † corresponden a números publicados en papers o leaderboards oficiales; el resto son mediciones propias del autor con el mismo protocolo.

**Quarry** (recall estricto all-gold, 6.525 consultas):

| Modelo | Parametros | recall@5 | recall@20 | recall@50 |
|---|---|---|---:|---:|---:|
| **Muninn** | 346M | **61.4** | **82.6** | **90.7** |
| voyage-code-3 | API | 59.1 | 81.8 | 90.4 |
| voyage-4 | API | 59.0 | 80.8 | 90.0 |
| SweRank-Large | 7B | 58.5 | 80.6 | 89.6 |
| Nemotron-3-Embed-1B | 1B | 58.3 | 79.9 | 88.7 |
| bge-code-v1 | 1.5B | 58.2 | 79.8 | 88.7 |
| voyage-4-nano (base) | 346M | 57.5 | 79.7 | 89.0 |
| Qwen3-Embedding-8B | 8B | 56.0 | 78.2 | 88.1 |
| SweRank-Small | 137M | 53.5 | 74.6 | 83.9 |
| Muninn-small | 47M | 52.3 | 74.6 | 84.7 |
| text-embedding-3-large | API | 51.7 | 74.3 | 85.0 |
| Qwen3-Embedding-0.6B | 0.6B | 50.9 | 72.8 | 83.8 |
| granite-embedding-small-english-r2 | 47M | 47.7 | 69.7 | 80.5 |

**SWE-Bench-Lite localization** (274 issues de Python, precisión a nivel de función):

| Modelo | Acc@5 | Acc@10 |
|---|---:|---:|
| **Muninn (346M)** | **73.4** | 79.6 |
| SweRank-Large (7B)† | 71.9 | **82.1** |
| SweRank-Small (137M)† | 63.1 | 74.5 |
| Muninn-small (47M) | 48.5 | 61.0 |

**LocBench** (560 issues de Python, precisión a nivel de función):

| Modelo | Acc@10 | Acc@15 |
|---|---:|---:|
| SweRank-Large (7B)† | **63.2** | **67.3** |
| **Muninn (346M)** | 60.2 | 65.7 |
| SweRank-Small (137M)† | 58.6 | 63.4 |
| Muninn-small (47M) | 46.4 | 51.6 |

**CoIR text-to-code** (NDCG@10):

| Modelo | APPS | CosQA |
|---|---:|---:|
| bge-code-v1 (1.5B)† | **98.1** | **46.7** |
| voyage-code-3 (API)† | 93.6 | 34.5 |
| Qwen3-Embedding-8B† | 91.1 | 38.0 |
| **Muninn (346M)** | 77.4 | 31.3 |
| Qwen3-Embedding-0.6B† | 75.3 | 36.5 |
| Muninn-small (47M) | 12.4 | 35.1 |

**CodeSearchNet** (media NDCG@10 sobre seis lenguajes: Python, JavaScript, Go, Ruby, Java, PHP; 1.000 consultas por lenguaje):

| Modelo | Media NDCG@10 |
|---|---:|
| Qwen3-Embedding-8B† | **92.7** |
| Qwen3-Embedding-0.6B† | 91.0 |
| **Muninn (346M)** | 90.1 |
| SweRank-Small (137M) | 87.9 |
| SweRank-Large (7B) | 85.0 |
| Muninn-small (47M) | 77.8 |

## Requisitos de hardware

- VRAM estimada: con 346M de parámetros y pesos en FP32, el modelo ocupa aproximadamente 1,4 GB en memoria. Con cuantización a FP16 o BF16 (si se aplica), el uso se reduce a unos 0,7 GB. No se han publicado datos de cuantización específicos para este modelo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en lote pequeño. Una RTX 3060 o superior permite procesar lotes grandes y contextos largos sin problemas. No requiere GPUs de datacenter.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090, etc. También puede ejecutarse en CPU para cargas de trabajo moderadas, aunque la latencia será mayor.
- Opciones de despliegue: sentence-transformers (uso directo), text-embeddings-inference (TEI) para servir endpoints HTTP, y cualquier framework compatible con modelos de embeddings de Hugging Face. No se menciona soporte para llama.cpp u Ollama, ya que no es un modelo generativo.
- Latencia y throughput: no se han publicado cifras oficiales. Dado su tamaño, se espera una latencia de pocos milisegundos por consulta en GPU moderna y throughput de cientos de consultas por segundo con batching en TEI.

## Comparativa con modelos similares

La siguiente comparativa se basa en los datos disponibles en la model card y en las especificaciones de los modelos mencionados.

| Modelo | Parametros | Contexto | Dimensiones | Licencia | Quarry recall@20 |
|---|---:|---:|---:|---|---:|
| **Muninn** | 346M | 8.192 | 2.048 | Apache-2.0 | 82.6 |
| voyage-4-nano (base) | 346M | no disponible | no disponible | Apache-2.0 | 79.7 |
| Qwen3-Embedding-0.6B | 0.6B | no disponible | no disponible | no disponible | 72.8 |
| bge-code-v1 | 1.5B | no disponible | no disponible | no disponible | 79.8 |
| SweRank-Small | 137M | no disponible | no disponible | no disponible | 74.6 |

Muninn supera a su modelo base (voyage-4-nano) en todos los benchmarks de Quarry, y compite favorablemente con modelos de 1B y 8B parámetros en tareas de localización de código, a pesar de su menor tamaño. En CodeSearchNet, su rendimiento (90.1 NDCG@10) está muy cerca del de Qwen3-Embedding-8B (92.7) y supera a SweRank-Large (85.0). Sin embargo, en CoIR text-to-code (APPS) queda por detrás de bge-code-v1 y voyage-code-3, aunque por delante de Qwen3-Embedding-0.6B.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en recuperación de código; no es adecuado para generación de texto, resumen o tareas de lenguaje general.
- Solo cubre 11 lenguajes de programación. No se han reportado resultados para otros lenguajes como Ruby, Kotlin o Swift, aunque el modelo podría generalizar parcialmente.
- El formato de documento es estricto: para obtener resultados comparables con los benchmarks, los documentos deben formatearse con la cabecera `{ruta}/{funcion}` o `{ruta}/{Clase}/{metodo}` seguida del código fuente. Usar otros formatos puede degradar el rendimiento.
- El truncamiento Matryoshka a 512 dimensiones reduce la calidad en aproximadamente dos puntos de recall@depth en Quarry; se recomienda usar 2.048 dimensiones para producción.
- Requiere `trust_remote_code=True` al cargar el modelo, lo que implica ejecutar código personalizado del repositorio. Esto puede suponer un riesgo de seguridad si el repositorio se viera comprometido; se recomienda auditar el código antes de usarlo en entornos sensibles.
- No se han publicado análisis de sesgos ni de robustez ante consultas adversariales. Como modelo entrenado sobre datos sintéticos, puede tener lagunas en consultas muy específicas o con jerga poco común.
- La licencia Apache-2.0 permite uso comercial, pero al derivar de `voyageai/voyage-4-nano`, se debe mantener la atribución correspondiente según los términos de dicha licencia.
- El contexto de 8.192 tokens es amplio pero no ilimitado; documentos de código muy extensos pueden requerir truncamiento o particionado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brokkai/Muninn
- Dataset Quarry: https://huggingface.co/datasets/BrokkAI/Quarry
- Modelo base: https://huggingface.co/voyageai/voyage-4-nano
- Modelo hermano Muninn-small: https://huggingface.co/BrokkAI/Muninn-small
- Perfil de la organizacion Brokk AI: https://huggingface.co/brokkai
