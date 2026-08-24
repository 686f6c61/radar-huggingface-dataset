# Shuu12121/NightOwl-CodeEmbedding

## Resumen

NightOwl-CodeEmbedding es un modelo de embeddings densos de 768 dimensiones especializado en recuperación de código, recuperación de ediciones de código y respuesta a preguntas técnicas. Ha sido desarrollado por Shuu12121 como un fine-tuning del modelo base NightOwl, un codificador de código basado en la arquitectura ModernBERT entrenado desde cero. El modelo está diseñado para integrarse directamente en sistemas de búsqueda semántica y bases de datos vectoriales, ya que produce un único vector por documento y utiliza similitud coseno.

Con 150,8 millones de parámetros, el modelo destaca por su eficiencia: ocupa aproximadamente 575 MiB en FP32 y admite una longitud máxima de 1.024 tokens. Según la información publicada, se posiciona en el puesto 18 de 241 modelos en el leaderboard MTEB (Code, v1), siendo el mejor modelo denso de vector único por debajo de 300 millones de parámetros. Su relevancia actual radica en que ofrece un rendimiento competitivo frente a modelos de 2 a 4 veces más grandes, con un coste computacional reducido y una licencia Apache-2.0 que permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (bi-encoder) |
| Parametros totales | 150.779.136 |
| Parametros activos | 150.779.136 (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32) |
| Idiomas soportados | Go, Java, JavaScript, PHP, Python, Ruby, Rust, TypeScript (lenguajes de programación) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en ModernBERT, una arquitectura transformer optimizada para codificación de secuencias largas, con atención bidireccional. Utiliza CLS pooling para generar un único vector de 768 dimensiones por documento y no requiere prefijos de tipo `query:` o `passage:`. La similitud se calcula mediante coseno.

El entrenamiento consistió en un fine-tuning del modelo base NightOwl (también ModernBERT, entrenado desde cero) sobre tres datasets propios: `coir_hard_negative_datasets_v3_kd`, `owl_code_search_hard_negative_datasets_V2_kd` y `codeedit_hard_negative_datasets_kd`. Los ejemplos negativos se extrajeron mediante minería de hard negatives con el modelo Qwen3-Embedding-0.6B, utilizando 15 negativos por ancla. Los nombres de los datasets sugieren el uso de destilación de conocimiento (KD). Además, se aplicó decontaminación contra los splits de test de CodeSearchNet y el benchmark CodeEditSearchRetrieval para evitar fugas de datos en la evaluación.

## Capacidades

- Generación de embeddings densos de 768 dimensiones para fragmentos de código y consultas en lenguaje natural.
- Búsqueda semántica NL-to-code: recupera fragmentos de código a partir de descripciones en lenguaje natural.
- Búsqueda code-to-code: encuentra código similar o relacionado a partir de otro fragmento.
- Recuperación de ediciones de código (code-edit retrieval): identifica cambios o parches relevantes.
- Respuesta a preguntas técnicas (technical QA): recupera pasajes de documentación o foros relevantes a una consulta.
- Soporte multilingüe de programación: cubre 8 lenguajes (los 6 de CodeSearchNet más Rust y TypeScript).
- Integración directa con `sentence-transformers` y compatible con `text-embeddings-inference` (TEI) según los tags del repositorio.
- No requiere prefijos de consulta/documento, simplificando el pipeline de indexación.

## Casos de uso

- Búsqueda semántica de código en IDE: integración en extensiones como OwlSpotLight para VS Code, que permite buscar funciones, clases o fragmentos por descripción en lenguaje natural en lugar de por coincidencia exacta de texto.
- Indexación de repositorios grandes: al generar un vector por documento, se puede indexar un codebase completo en una base de datos vectorial (por ejemplo, FAISS, Qdrant, Weaviate) y realizar consultas de similitud coseno con latencia baja.
- Recuperación de ediciones de código en sistemas de revisión: dado un cambio o parche, el modelo puede encontrar ediciones similares en el historial del repositorio, útil para recomendar patrones de corrección o detectar duplicados.
- Asistente de documentación técnica: dado un problema de programación, recupera respuestas relevantes de Stack Overflow, foros o documentación interna, mejorando la precisión de chatbots de soporte.
- Pipeline de RAG para generación de código: como componente de recuperación en sistemas de generación asistida, alimenta a un LLM con ejemplos de código relevantes al contexto de la consulta.
- Clasificación y deduplicación de código: al comparar embeddings de fragmentos, se pueden agrupar funciones similares o detectar código duplicado en grandes monorepos.

## Benchmarks y rendimiento

El modelo fue evaluado con MTEB (versión 2.15.1) en tareas de recuperación de código y QA técnica, utilizando NDCG@10 como métrica. El hardware de evaluación fue una NVIDIA GeForce RTX 5090 con batch size 64. Los resultados publicados son:

| Tarea | Split | NDCG@10 |
|---|---|---|
| AppsRetrieval | test | 0,39177 |
| COIRCodeSearchNetRetrieval | test | 0,84264 |
| CodeEditSearchRetrieval | train¹ | 0,74808 |
| CodeFeedbackMT | test | 0,76690 |
| CodeFeedbackST | test | 0,85207 |
| CodeSearchNetCCRetrieval | test | 0,91805 |
| CodeSearchNetRetrieval | test | 0,89239 |
| CodeTransOceanContest | test | 0,75953 |
| CodeTransOceanDL | test | 0,36057 |
| CosQA | test | 0,42810 |
| StackOverflowQA | test | 0,86608 |
| SyntheticText2SQL | test | 0,68266 |
| **Macro average (12 tareas)** | | **0,70907** |
| **CoIR macro average (10 tareas)** | | **0,68684** |

¹ CodeEditSearchRetrieval no dispone de split `test` estándar en MTEB, por lo que se usó el split `train` oficial, que no se empleó en el fine-tuning.

En el leaderboard público MTEB (Code, v1), el modelo ocupa el puesto 18 de 241 modelos en puntuación media, el puesto 6 entre 155 modelos densos de vector único por debajo de 1B de parámetros, y el primer puesto entre los modelos densos de vector único por debajo de 300M de parámetros. Los cinco modelos que le superan en la categoría sub-1B tienen entre 0,33B y 0,6B de parámetros, es decir, de 2 a 4 veces más grandes.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP32 ocupan 575 MiB; con activaciones y overhead, se estima un consumo inferior a 1,5 GB para un batch de tamaño moderado. Cabe en cualquier GPU consumer con 2 GB o más.
- GPUs recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4090). Para despliegue en producción con alto throughput, se recomienda una GPU de datacenter como A10, A100 o H100, aunque no es estrictamente necesario.
- Compatibilidad con consumer GPU: sí, es un modelo ligero que puede ejecutarse en GPU de gama baja e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `sentence-transformers` para integración en Python, `text-embeddings-inference` (TEI) para servir el modelo como API REST, y cualquier framework de bases de datos vectoriales que acepte embeddings de 768 dimensiones.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamaño del modelo, se espera una latencia de pocos milisegundos por lote en GPU moderna y un throughput de cientos de documentos por segundo en hardware de gama media.

## Comparativa con modelos similares

| Modelo | Parámetros | Dimensión | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| NightOwl-CodeEmbedding | 150,8M | 768 | 1.024 | Apache-2.0 | Especializado en código, top en su rango de tamaño |
| Qwen3-Embedding-0.6B | ~600M | no disponible | no disponible | Apache-2.0 | Usado para minería de hard negatives; 4 veces más grande |
| F2LLM-v2-0.6B | ~600M | no disponible | no disponible | no disponible | Supera a NightOwl en el leaderboard, pero con 4 veces más parámetros |
| pplx-embed-v1-0.6b | ~600M | no disponible | no disponible | no disponible | Modelo propietario de Perplexity, no open source |

No se dispone de datos detallados de benchmarks de estos modelos comparables en la información proporcionada. La comparativa se basa en el leaderboard MTEB (Code, v1), donde NightOwl-CodeEmbedding es el mejor modelo denso de vector único por debajo de 300M de parámetros.

## Limitaciones y advertencias

- El modelo solo está entrenado para recuperación de código en 8 lenguajes de programación; el rendimiento en otros lenguajes no está probado y puede degradarse significativamente.
- La longitud máxima de contexto es de 1.024 tokens, por lo que fragmentos de código muy largos deben truncarse o dividirse en chunks.
- No es un modelo generativo: no produce texto, solo embeddings. No admite tool calling, agentes ni razonamiento multi-paso.
- El modelo fue entrenado con datasets propios que incluyen destilación de conocimiento; la calidad de los datos de entrenamiento no es auditable externamente.
- Aunque se aplicó decontaminación, no se garantiza la ausencia total de solapamiento con otros benchmarks no mencionados.
- El rendimiento en tareas fuera del dominio de código (por ejemplo, texto general) no ha sido evaluado y probablemente sea inferior al de modelos de propósito general.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shuu12121/NightOwl-CodeEmbedding
- Modelo base NightOwl: https://huggingface.co/Shuu12121/NightOwl
- Leaderboard MTEB (Code, v1): https://leaderboard.mteb.org/models/Shuu12121/NightOwl-CodeEmbedding
- Repositorio OwlSpotLight (búsqueda semántica de código para VS Code): https://github.com/Shun0212/OwlSpotLight
- Perfil de GitHub del autor: https://github.com/Shun0212
