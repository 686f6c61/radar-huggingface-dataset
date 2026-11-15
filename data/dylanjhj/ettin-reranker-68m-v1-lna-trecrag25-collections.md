# DylanJHJ/ettin-reranker-68m-v1.lna-trecrag25-collections

## Resumen

`ettin-reranker-68m-v1.lna-trecrag25-collections` es una colección de clasificadores de nuggets (unidades atómicas de información) construida sobre el cross-encoder `cross-encoder/ettin-reranker-68m-v1`, un transformer de 68 millones de parámetros desarrollado originalmente por el equipo de Ettin. El modelo lo publica el usuario DylanJHJ y está diseñado específicamente para la evaluación de sistemas RAG en el marco de TREC RAG 2024: dado un nugget (una afirmación concreta que una respuesta debería cubrir) y el texto completo de una respuesta generada por un sistema RAG, el modelo devuelve la probabilidad de que esa respuesta soporte dicho nugget.

La aportación principal no es un modelo único, sino una jerarquía de tres niveles: un modelo a nivel de dataset (D), modelos afinados por tema (DT, 56 temas) y cabezas específicas por nugget (DTN, 779 nuggets). Esta estructura permite una evaluación granular de la cobertura informativa de respuestas RAG, una tarea relevante ahora que los benchmarks de RAG maduran desde métricas superficiales (solapamiento léxico) hacia métricas de soporte factual a nivel de afirmación.

El repositorio ocupa 16,1 GB porque contiene todos los checkpoints por tema y por nugget, no un único conjunto de pesos. La licencia es Apache 2.0 y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (cross-encoder) sobre `cross-encoder/ettin-reranker-68m-v1`, con cabeza de clasificación CLS pooling + Dense(no bias) + GELU + LayerNorm + Dense(1) |
| Parametros totales | 68 millones (backbone); las cabezas por tema y por nugget añaden pesos adicionales no cuantificados en la model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens de entrada combinada (nugget + respuesta); solo se trunca la respuesta |
| Tipos de cuantizacion | no disponible (pesos en safetensors y `reranker_head.pt` en fp32 por defecto) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (backbone) + PyTorch `.pt` (cabezas `reranker_head.pt`) |

## Arquitectura y entrenamiento

El backbone es un cross-encoder basado en Ettin de 68M de parámetros, con atención que en la implementación de referencia se configura mediante `rope_parameters` con atención completa y deslizante (`full_attention` y `sliding_attention`), lo que sugiere una arquitectura con capas de atención local/global alternadas. La entrada se construye como `[CLS] {nugget} [SEP] {answer} [SEP]` y la puntuación se obtiene aplicando `sigmoid` a la salida de una cabeza MLP sobre el token `[CLS]`.

El entrenamiento es jerárquico y por etapas. Primero se hace un fine-tune completo sobre el dataset completo (modelo D). Después, para cada uno de los 56 temas, se afina adicionalmente el modelo D sobre las instancias de ese tema (modelo DT). Finalmente, para cada uno de los 779 nuggets, se entrena una cabeza específica sobre el backbone del modelo DT de su tema (modelo DTN). La etiqueta es binaria: `support` frente a `partial_support`/`not_support`. En la variante `ragtime` el lado del nugget se enriquece con respuestas de referencia en el formato `{nugget} (Reference answers: {a1}; {a2})`. No se documentan en la model card el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO.

## Capacidades

- Clasificación binaria de soporte: dado un par (nugget, respuesta), devuelve `P(answer supports nugget)` mediante sigmoide sobre el logit del `[CLS]`.
- Evaluación a nivel de tema (DT): un único modelo por tema puntúa cualquier nugget de ese tema, sin necesidad de cabeza específica.
- Evaluación a nivel de nugget (DTN): cabeza dedicada para cada uno de los 779 nuggets, con mayor especialización.
- Soporte de respuestas de referencia (modo `ragtime`): incorpora respuestas de referencia al texto del nugget para mejorar la señal.
- Procesamiento por lotes: la función `score` acepta listas de nuggets y respuestas y devuelve un tensor de probabilidades.
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking; es un clasificador de pares, no un modelo generativo.
- Multilingüe: no; únicamente inglés.

## Casos de uso

- Evaluación automática de sistemas RAG en TREC RAG 2024: puntuar la cobertura de nuggets de las respuestas de un sistema y agregar por tema para obtener métricas de soporte informativo.
- Comparación de pipelines de recuperación: dado un conjunto fijo de nuggets por consulta, medir qué configuración de retriever y generador produce respuestas con mayor soporte factual.
- Detección de respuestas incompletas: usar las probabilidades DTN por nugget para identificar qué afirmaciones concretas no cubre una respuesta y guiar la regeneración.
- Filtrado en pipelines de generación aumentada: descartar respuestas con baja puntuación media de soporte antes de servirlas al usuario.
- Análisis de errores por tema: al existir un modelo DT por tema, se puede diagnosticar en qué áreas temáticas falla más un sistema RAG.
- Investigación en métricas de fidelidad: emplear los clasificadores como jueces de soporte en estudios sobre alucinación y atribución de afirmaciones.
- Construcción de datasets de evaluación: usar las puntuaciones como señal débil para anotar pares (nugget, respuesta) a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: el backbone de 68M en fp32 ocupa aproximadamente 270 MB; en fp16 unos 140 MB. Cada cabeza DTN es un MLP pequeño (del orden de cientos de KB). El repositorio completo de 16,1 GB no necesita cargarse entero: se descargan solo el tema y el nugget relevantes.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4090 o incluso CPU son viables para lotes moderados.
- Cabe en GPU consumer: sí, sin problema, incluidas GPUs de gama baja y portátiles.
- Opciones de despliegue: `transformers` + `torch` (implementación de referencia en la model card); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al ser un cross-encoder con cabezas personalizadas no es directamente compatible con esos servidores sin adaptación.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ettin-reranker-68m-v1.lna-trecrag25-collections` | 68M (backbone) | 1024 tokens | Clasificación de soporte nugget-respuesta | Apache 2.0 | Hugging Face |
| `cross-encoder/ettin-reranker-68m-v1` (base) | 68M | no disponible | Reranking de pasajes | Apache 2.0 | Hugging Face |
| `DylanJHJ/ettin-reranker-68m-v1.lna-trecrag25-D` | 68M (backbone) | 1024 tokens | Clasificación de soporte a nivel de dataset | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: los modelos DT y DTN solo son válidos para los 56 temas y 779 nuggets de TREC RAG 2024; no generalizan a otros dominios ni consultas.
- Idioma: solo inglés; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Truncación: la respuesta se trunca a 1024 tokens en total con el nugget, por lo que respuestas largas pueden perder información relevante al final.
- Etiqueta binaria simplificada: `partial_support` se colapsa a 0 junto con `not_support`, lo que reduce la granularidad de la señal.
- Riesgo de sesgo hacia los estilos de respuesta presentes en el dataset de entrenamiento; no se documentan análisis de sesgo.
- Riesgo de alucinación del juez: al ser un clasificador entrenado con datos limitados, puede sobrestimar o subestimar el soporte en respuestas ambiguas o con negaciones.
- Licencia Apache 2.0 permite uso comercial, pero la utilidad práctica fuera del benchmark TREC RAG 2024 es muy limitada.
- Repositorio de 16,1 GB: requiere descarga selectiva por `subfolder` para evitar transferencias innecesarias.
- Dependencia de la versión de `transformers`: la model card advierte sobre diferencias entre `transformers` 4.x y 5.x en los parámetros RoPE (`rope_parameters` frente a `global_rope_theta`/`local_rope_theta`), lo que puede romper la carga si no se adapta la configuración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DylanJHJ/ettin-reranker-68m-v1.lna-trecrag25-collections
- Modelo base a nivel de dataset: https://huggingface.co/DylanJHJ/ettin-reranker-68m-v1.lna-trecrag25-D
- Colección del autor: https://huggingface.co/collections/DylanJHJ/tbd-6af4812bda045ed7cfc6cee8
- Modelo base cross-encoder: https://huggingface.co/cross-encoder/ettin-reranker-68m-v1
- TREC RAG 2024: no disponible en la información proporcionada
