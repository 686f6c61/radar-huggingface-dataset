# electroglyph/Spark-X2.6-4B-uncensored-experimental

## Resumen

Spark-X2.6-4B-uncensored-experimental es una variante "decensored" del modelo Spark-X2.6-4B desarrollado por XHToken, publicada por el usuario electroglyph. El modelo base es un LLM compacto de 4.112 millones de parametros disenado para despliegue en dispositivo (on-device) y orientado a tareas de agente, codigo y contexto largo. Esta version experimental elimina los mecanismos de rechazo del modelo original mediante la tecnica de abliteration implementada con la herramienta Heretic v2.2.0.dev0, aplicando un ajuste denominado LiberShift-informed ARA (LiberARA).

La relevancia de esta ficha radica en dos aspectos. Por un lado, documenta las capacidades del modelo base Spark-X2.6-4B, que segun su model card alcanza un rendimiento equiparable a modelos de aproximadamente 9B parametros en varios benchmarks y compite con alternativas como Qwen3.5-4B y Gemma-E4B en eficiencia de inferencia en el borde. Por otro, expone las caracteristicas y riesgos de una variante sin censura que, segun los datos del autor, reduce los rechazos de 100/100 a 0/100 en una evaluacion de 100 prompts, con una divergencia KL de 0.0493 respecto al modelo original.

El modelo conserva la misma arquitectura que Spark-X2.5-4B y obtiene sus mejoras mediante post-entrenamiento. Soporta ingles y chino, se distribuye bajo licencia Apache 2.0 y requiere `trust_remote_code=True` por el uso de codigo personalizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (misma arquitectura que Spark-X2.5-4B; detalles internos no disponibles) |
| Parametros totales | 4.112.079.360 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explicita; el ejemplo de generacion usa `max_new_tokens=131072` |
| Tipos de cuantizacion | No disponible (repo en safetensors, sin GGUF publicado) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo base Spark-X2.6-4B mantiene exactamente la misma arquitectura que Spark-X2.5-4B y logra sus mejoras de capacidad mediante un post-entrenamiento refinado, no mediante cambios estructurales. La model card no detalla la composicion del dataset de entrenamiento, el numero de tokens utilizados ni si se emplearon tecnicas de RLHF o DPO. Tampoco especifica innovaciones como decodificacion especulativa o atencion lineal. Lo que si se documenta es un mecanismo de "thinking budget" configurable con tres niveles (none, low, high), que permite ajustar el esfuerzo de razonamiento y, con ello, la latencia y el coste de inferencia.

La variante uncensored se genera aplicando Heretic v2.2.0.dev0, una herramienta de abliteration que modifica los pesos en un rango de capas (de la capa 12 a la 36) mediante un ajuste ARA informado por LiberShift. Los hiperparametros publicados incluyen `quantile_q=0.9275`, `gamma=0.4522`, `lambda_preserve=0.6736`, `top_atom_fraction=0.1310`, `steer_weight=0.0002`, `overcorrect_weight=1.0248` y `neighbor_count=12`. El autor reporta que esta intervencion elimina los rechazos (0/100 frente a 100/100 del original) con una divergencia KL de 0.0493, lo que sugiere una alteracion moderada de la distribucion de salida, aunque no se aportan evaluaciones de calidad posteriores a la abliteration.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento con esfuerzo configurable (none, low, high), lo que permite ajustar calidad frente a latencia.
- Codificacion y tareas de ingenieria de software, con mejoras sustanciales respecto a Spark-X2.5-4B segun el autor.
- Flujos agenticos: uso complejo de herramientas, planificacion multi-paso y ejecucion de tareas encadenadas.
- Capacidades de contexto largo (el ejemplo de la model card emplea hasta 131072 tokens nuevos de generacion).
- Capacidades multilingues limitadas a ingles y chino.
- Al estar abliterado, no presenta rechazos ante prompts que el modelo original declinaria, segun la evaluacion del autor.
- No se documentan capacidades de vision, audio ni tool calling con formatos especificos en la informacion disponible.

## Casos de uso

- Agentes en dispositivo: el modelo esta disenado para despliegue on-device y soporta planificacion multi-paso y uso de herramientas, lo que permite construir asistentes locales que ejecutan tareas sin depender de la nube.
- Asistencia de codigo en IDE: sus mejoras en codificacion y su tamano de 4B permiten integrarlo en entornos de desarrollo locales para autocompletado, refactorizacion y explicacion de codigo con baja latencia.
- Procesamiento de documentos largos: la ventana de generacion de hasta 131072 tokens del ejemplo permite resumir, extraer informacion o responder preguntas sobre documentos extensos en ingles o chino.
- Atencion al cliente automatizada: conversaciones multi-turno con contexto amplio y control del esfuerzo de razonamiento para equilibrar calidad y coste en entornos con recursos limitados.
- Investigacion sobre alineacion y seguridad: al ser una variante abliterada con hiperparametros y metricas documentadas (rechazos, KL), sirve como caso de estudio reproducible para analizar el efecto de la abliteration en modelos compactos.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o contenido que el modelo original rechazaria, con la advertencia de los riesgos asociados que se detallan mas abajo.
- Despliegue en hardware de consumo: su tamano de 4B y su eficiencia de inferencia declarada lo hacen apto para ejecucion en GPU consumer y dispositivos con recursos moderados.

## Benchmarks y rendimiento

La model card del modelo base menciona comparaciones con Qwen3.5-4B, Gemma-E4B y modelos de aproximadamente 9B, pero los resultados numericos se presentan unicamente en imagenes (`benchmark.svg`, `all_benchmark.svg`, `inference.svg`, `reasoning_effort.svg`) que no estan disponibles en el texto proporcionado. Los unicos datos numericos textuales son los siguientes:

| Metrica | Este modelo (uncensored) | Modelo original (Spark-X2.6-4B) |
|---|---|---|
| Rechazos (100 prompts) | 0/100 | 100/100 |
| Divergencia KL | 0.0493 | 0 (por definicion) |

Sobre el esfuerzo de razonamiento, el autor indica que al pasar de high a low, Spark-X2.6-4B pierde 1.7 puntos de media mientras reduce la longitud de salida un 22.0 por ciento (frente a 4.0 puntos y 37.3 por ciento en la variante de 1.7B). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en forma textual en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en safetensors en precision nativa (probablemente bf16/fp16), el modelo de 4.112 millones de parametros requiere aproximadamente 8.2 GB solo para los pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits rondaria los 4-5 GB y en 4 bits los 2.5-3 GB (estimaciones, no confirmadas por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 4090 o RTX 3090 lo ejecutarian con holgura en bf16; GPUs con 8-12 GB podrian requerir cuantizacion.
- Cabe en GPU consumer: si, previsiblemente en tarjetas de 8 GB o mas con cuantizacion, aunque no hay confirmacion oficial.
- Opciones de despliegue: la model card solo documenta Transformers (version 4.57.1) con `trust_remote_code=True`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y no hay pesos GGUF publicados en el repo.
- Latencia y throughput: la model card afirma eficiencia de inferencia equiparable o superior a Qwen3.5-4B y Gemma-E4B, pero los datos numericos estan solo en imagenes no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-4B-uncensored-experimental | 4.1B | No disponible (ejemplo con 131072 tokens de generacion) | Apache 2.0 | Hugging Face (38 descargas) | Variante abliterada de Spark-X2.6-4B |
| Spark-X2.6-4B (original) | 4.1B | No disponible | Apache 2.0 | Hugging Face | Modelo base con rechazos (100/100) |
| Qwen3.5-4B | No disponible | No disponible | No disponible | No disponible | Citado por el autor como referencia de eficiencia |
| Gemma-E4B | No disponible | No disponible | No disponible | No disponible | Citado por el autor como referencia de eficiencia |

Los datos de rendimiento comparativo entre estos modelos solo aparecen en imagenes de la model card que no estan disponibles en el texto proporcionado.

## Limitaciones y advertencias

- El modelo esta abliterado: elimina deliberadamente los rechazos de seguridad, por lo que puede generar contenido danino, ilegal o eticamente problematico sin filtros. No es apto para aplicaciones de produccion orientadas al publico sin una capa de moderacion externa.
- La abliteration introduce una divergencia KL de 0.0493 respecto al original; no se han publicado evaluaciones de calidad, coherencia o rendimiento posteriores a la intervencion, por lo que el impacto en tareas especificas es desconocido.
- Riesgo de alucinacion inherente a los LLM de 4B, no cuantificado en la informacion disponible.
- Soporte limitado a ingles y chino; el rendimiento en castellano no esta documentado.
- La model card no detalla sesgos conocidos ni la composicion del dataset de entrenamiento, lo que dificulta evaluar riesgos de sesgo.
- Licencia Apache 2.0 permite uso comercial, pero el caracter experimental y la ausencia de evaluaciones de calidad desaconsejan su uso en produccion sin validacion propia.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del repositorio; conviene auditar dicho codigo antes de desplegarlo.
- El repositorio tiene muy poca traccion (38 descargas, 0 likes) y fue publicado en noviembre de 2026, por lo que carece de validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/electroglyph/Spark-X2.6-4B-uncensored-experimental
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Heretic (herramienta de abliteration): https://heretic-project.org
- Slack de SparkLLM: https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw
- Discord de SparkLLM: https://discord.gg/kTDE2Hg8aw
- YouTube de SparkLLM: https://www.youtube.com/@SparkLLM
- dev.to de SparkLLM: https://dev.to/sparkllm
- Bluesky de SparkLLM: https://bsky.app/profile/sparkllm.bsky.social
- X de SparkLLM: https://x.com/sparkllm
- Zhihu de SparkLLM: https://www.zhihu.com/people/zhiikz7qh7m
