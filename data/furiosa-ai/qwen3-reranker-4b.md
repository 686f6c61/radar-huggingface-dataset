# furiosa-ai/Qwen3-Reranker-4B

## Resumen

El modelo `furiosa-ai/Qwen3-Reranker-4B` es una distribución del reranker Qwen3-Reranker-4B de Qwen, empaquetada por FuriosaAI con un Furiosa Executable Bundle (FXB) para su ejecución en el hardware acelerador RNGD mediante el framework Furiosa-LLM. Se trata de un modelo de clasificación de texto (pipeline `text-classification`) que, dado un par consulta-documento, produce una puntuación de relevancia utilizada para reordenar resultados de búsqueda, típicamente como segunda etapa en pipelines de retrieval-augmented generation (RAG) o sistemas de búsqueda.

El modelo se basa en la arquitectura Qwen3 densa (transformer) con aproximadamente 4.000 millones de parámetros (4.021.784.576 exactamente) y se distribuye bajo licencia Apache 2.0. Su relevancia actual radica en que ofrece una alternativa de reranking de alto rendimiento con un tamaño contenido, y su integración con Furiosa-LLM permite desplegarlo en hardware especializado de FuriosaAI con una API compatible con los estándares de la industria (Cohere/Jina/vLLM). El mismo modelo base también puede ejecutarse con otros frameworks como Sentence Transformers, vLLM o Transformers, según indica la documentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer denso) |
| Parametros totales | 4.021.784.576 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | sin cuantizacion (BF16 nativo) |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y FXB (Furiosa Executable Bundle) |

## Arquitectura y entrenamiento

El modelo es un reranker basado en la arquitectura Qwen3 densa, un transformer de solo decodificador adaptado para la tarea de clasificación de relevancia. No se proporcionan detalles sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) en la información disponible; se trata de un fine-tuning del modelo base `Qwen/Qwen3-Reranker-4B`. La innovación principal de esta distribución es el empaquetado en un FXB que permite su ejecución optimizada en el hardware FuriosaAI RNGD, con una estrategia de paralelismo tensorial de 8 PEs (una tarjeta RNGD). El modelo corre en precisión BF16 sin cuantización adicional.

## Capacidades

- Reranking de documentos: dado un query y un conjunto de documentos candidatos, devuelve puntuaciones de relevancia y reordena los resultados.
- Scoring de pares consulta-documento: permite obtener la puntuación de relevancia directamente para cada par, sin necesidad de reranking.
- Integración con pipelines RAG: actúa como segunda etapa de recuperación, refinando los resultados obtenidos por un primer recuperador (por ejemplo, búsqueda vectorial o BM25).
- API compatible con estándares: expone endpoints `/v1/rerank` y `/v1/score` compatibles con la API de Cohere/Jina y con vLLM, lo que facilita su adopción en sistemas existentes.
- Ejecución offline mediante API Python de Furiosa-LLM.
- Soporte multilingüe: no disponible, el modelo está entrenado únicamente para inglés.

## Casos de uso

- Mejora de pipelines RAG: tras una primera recuperación con embeddings o BM25, el modelo reordena los documentos candidatos para seleccionar los más relevantes antes de pasarlos al generador, reduciendo ruido y mejorando la calidad de las respuestas.
- Búsqueda semántica en bases de conocimiento: en un sistema de búsqueda empresarial, se utiliza para refinar los resultados de una búsqueda vectorial, priorizando los documentos que realmente responden a la consulta del usuario.
- Filtrado de documentos en sistemas de atención al cliente: dado un historial de conversaciones o artículos de ayuda, el modelo puntúa la relevancia de cada documento respecto a la consulta del cliente, permitiendo ofrecer respuestas precisas y rápidas.
- Clasificación de pares en motores de recomendación: se puede emplear para puntuar la relevancia entre una consulta de usuario y ítems candidatos (productos, artículos, vídeos) y así ordenar las recomendaciones.
- Evaluación de calidad de recuperación: en tareas de desarrollo y evaluación de sistemas de búsqueda, el modelo puede usarse para generar juicios de relevancia automáticos sobre pares consulta-documento, acelerando la creación de datasets de evaluación.
- Reranking en búsqueda jurídica o científica: en dominios con grandes volúmenes de documentos técnicos, el modelo ayuda a priorizar los documentos más pertinentes para una consulta específica, reduciendo el tiempo de revisión manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparativas con otros rerankers. Tampoco se proporcionan datos de latencia o throughput en el hardware RNGD.

## Requisitos de hardware

- Hardware específico: el FXB incluido está diseñado para ejecutarse en FuriosaAI RNGD, con un paralelismo tensorial de 8 PEs que mapea a una sola tarjeta RNGD (8 PEs por tarjeta).
- VRAM estimada: no se especifica oficialmente; dado que el modelo pesa aproximadamente 8,4 GB en BF16 (tamaño del repositorio), se estima que requiere al menos 8-10 GB de memoria para inferencia, aunque el valor exacto depende del framework y la gestión de memoria.
- GPU compatibles: el FXB solo es compatible con hardware FuriosaAI RNGD. Sin embargo, los pesos originales (safetensors) pueden ejecutarse en GPUs estándar mediante frameworks como vLLM, Transformers o Sentence Transformers, aunque no se proporcionan requisitos específicos para esos entornos.
- Opciones de despliegue: Furiosa-LLM (servidor OpenAI-compatible con endpoints `/v1/rerank` y `/v1/score`), API Python offline de Furiosa-LLM, y frameworks alternativos (vLLM, Transformers, Sentence Transformers) para el modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información comparativa en la documentación proporcionada. El modelo pertenece a la familia de rerankers de 4B de parámetros, similar en tamaño a otros como BGE-Reranker-v2-M3 o Cohere Rerank, pero no se han publicado datos de rendimiento relativos en las fuentes consultadas. Se recomienda consultar la model card del modelo base `Qwen/Qwen3-Reranker-4B` para posibles comparativas.

## Limitaciones y advertencias

- Idioma: el modelo está entrenado únicamente para inglés; su rendimiento en otros idiomas no está garantizado.
- No es un modelo generativo: no puede generar texto, solo produce puntuaciones de relevancia. No debe usarse para tareas de generación o conversación.
- Dependencia de hardware específico: el FXB solo funciona en hardware FuriosaAI RNGD; para otros entornos es necesario usar los pesos safetensors con frameworks alternativos, lo que puede requerir configuración adicional.
- Sin cuantización: el modelo se ejecuta en BF16 nativo, lo que puede limitar su despliegue en hardware con memoria reducida.
- Riesgo de sesgos: al ser un modelo entrenado sobre datos de texto, puede heredar sesgos presentes en los datos de entrenamiento, aunque no se documentan sesgos específicos.
- Alucinación: al ser un modelo de clasificación, no genera contenido, por lo que el riesgo de alucinación es bajo; sin embargo, las puntuaciones de relevancia pueden ser incorrectas en dominios muy especializados o con consultas ambiguas.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de las condiciones de la licencia del modelo base y de los términos de uso de FuriosaAI.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/furiosa-ai/Qwen3-Reranker-4B
- Model card del modelo base: https://huggingface.co/Qwen/Qwen3-Reranker-4B
- Documentación de Furiosa-LLM para Qwen3-Reranker: https://developer.furiosa.ai/v2026.4.0/en/furiosa_llm/models/qwen3-reranker.html
- Documentación de Furiosa-LLM (general): https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Página de ModelVault con especificaciones: https://www.modelvault.space/models/furiosa-ai-qwen3-reranker-4b
