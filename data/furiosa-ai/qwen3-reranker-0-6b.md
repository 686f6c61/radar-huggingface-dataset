# furiosa-ai/Qwen3-Reranker-0.6B

## Resumen

Qwen3-Reranker-0.6B es un modelo de reranking de la serie Qwen3-Reranker, desarrollado por FuriosaAI y distribuido en Hugging Face con un Furiosa Executable Bundle (FXB) para su ejecución en hardware FuriosaAI RNGD mediante Furiosa-LLM. Está construido sobre el backbone transformer denso de Qwen3 y cuenta con 595,7 millones de parámetros. Su función es puntuar la relevancia entre una consulta y documentos candidatos, utilizándose como segunda etapa en pipelines de recuperación aumentada por generación (RAG) y búsqueda.

El modelo se publica bajo licencia Apache 2.0 y soporta únicamente el idioma inglés. Aunque el repositorio incluye el FXB para Furiosa-LLM, los pesos originales también pueden ejecutarse con otros frameworks como Sentence Transformers, vLLM o Transformers, según la model card upstream. Su relevancia radica en ofrecer una opción ligera (0.6B) para tareas de reranking en entornos de producción, con una API compatible con Cohere/Jina y vLLM.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer denso) |
| Parametros totales | 595.776.512 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 nativo (sin cuantizacion) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, FXB (Furiosa Executable Bundle) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3 densa, sin mezcla de expertos. Esta diseñado especificamente para la tarea de reranking: recibe un par consulta-documento y devuelve una puntuacion de relevancia. No se dispone de informacion sobre el proceso de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) en la documentacion proporcionada. La model card solo indica que es un modelo de la serie Qwen3-Reranker y que su uso previsto coincide con el del modelo upstream Qwen/Qwen3-Reranker-0.6B.

## Capacidades

- Puntuacion de relevancia para pares consulta-documento.
- Reranking de listas de documentos candidatos, devolviendo resultados ordenados por puntuacion.
- Exposicion de endpoints `/v1/rerank` y `/v1/score` compatibles con la API de Cohere/Jina y vLLM.
- Integracion con Furiosa-LLM para inferencia en hardware FuriosaAI RNGD.
- Posibilidad de ejecucion con otros frameworks (Sentence Transformers, vLLM, Transformers) usando los pesos upstream.
- No es un modelo generativo: no produce texto, solo puntuaciones.

## Casos de uso

- Recuperacion aumentada por generacion (RAG): como segunda etapa tras un recuperador inicial, el modelo reordena los documentos candidatos segun su relevancia a la consulta, mejorando la calidad de las respuestas generadas.
- Busqueda empresarial: integracion en motores de busqueda internos para refinar resultados y mostrar los documentos mas pertinentes.
- Filtrado de documentos en grandes corpus: dado un conjunto de candidatos, el modelo puede descartar los irrelevantes mediante el endpoint `/v1/score`.
- Sistemas de preguntas y respuestas: reordenar pasajes recuperados antes de pasarlos a un modelo generativo.
- Moderacion de contenido o clasificacion de pares: aunque su uso principal es reranking, puede emplearse para puntuar similitud entre textos.
- Despliegue en entornos con hardware FuriosaAI RNGD: gracias al FXB incluido, se puede servir con Furiosa-LLM en una tarjeta RNGD con tensor-parallel de 8 PEs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El FXB incluido esta optimizado para FuriosaAI RNGD, con tensor-parallel de 8 PEs (una tarjeta RNGD).
- No se especifica VRAM para el FXB, pero al ser un modelo de 0.6B en BF16, los pesos ocupan aproximadamente 1,2 GB, por lo que es probable que quepa en GPUs de consumo estandar si se usan los pesos safetensors con otros frameworks.
- Para ejecucion con Furiosa-LLM se requiere hardware FuriosaAI RNGD y el SDK correspondiente.
- Alternativas de despliegue: Furiosa-LLM (servidor OpenAI-compatible), vLLM, Sentence Transformers, Transformers (usando los pesos upstream).
- No se dispone de datos de latencia o throughput en la documentacion.

## Comparativa con modelos similares

No se dispone de informacion comparativa con otros modelos de reranking en la documentacion proporcionada. Se puede mencionar que existen alternativas como BGE-reranker o Cohere Rerank, pero no hay datos concretos para comparar.

## Limitaciones y advertencias

- El modelo solo soporta ingles (idioma "en").
- No se proporciona informacion sobre la longitud de contexto maxima, lo que puede limitar su uso con documentos muy largos.
- Al ser un modelo de reranking, no genera texto; no es adecuado para tareas de generacion.
- El FXB esta vinculado a hardware FuriosaAI RNGD; para otros entornos hay que usar los pesos safetensors con frameworks compatibles.
- No se han publicado detalles sobre sesgos o riesgos de alucinacion, pero al ser un clasificador, el riesgo de alucinacion es bajo; sin embargo, puede haber sesgos en las puntuaciones segun los datos de entrenamiento (no documentados).
- Licencia Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de la licencia del modelo base Qwen3.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/furiosa-ai/Qwen3-Reranker-0.6B
- Model card upstream: https://huggingface.co/Qwen/Qwen3-Reranker-0.6B
- Documentacion de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Documentacion de Qwen3-Reranker en FuriosaAI: https://developer.furiosa.ai/v2026.4.0/en/furiosa_llm/models/qwen3-reranker.html
- Release notes 2026.4.0: https://developer.furiosa.ai/v2026.4.0/en/whatsnew/release-2026.4.0.html
- Pagina de FriendliAI: https://friendli.ai/models/furiosa-ai/Qwen3-Reranker-0.6B
