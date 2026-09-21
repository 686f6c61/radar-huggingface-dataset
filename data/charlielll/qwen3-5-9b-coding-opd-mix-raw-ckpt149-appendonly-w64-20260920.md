# CharlieLLL/Qwen3.5-9B-coding-opd-mix-raw-ckpt149-appendonly-w64-20260920

## Resumen

Se trata de un ajuste por aprendizaje por refuerzo (RL) del modelo Qwen/Qwen3.5-9B, publicado por el usuario CharlieLLL bajo el identificador `CharlieLLL/Qwen3.5-9B-coding-opd-mix-raw-ckpt149-appendonly-w64-20260920`. El modelo esta especializado en programacion y en la resolucion de incidencias sobre repositorios reales, como indican sus etiquetas `coding` y `swe-bench`, y esta pensado para actuar como "worker" dentro de una orquestacion multiagente. El checkpoint exportado es el final de la campana, correspondiente a 150 actualizaciones del optimizador (numeracion local basada en cero), y se presenta como los pesos exactos evaluados el 20 de septiembre de 2026 en la campana SWE-bench Verified eval150.

El modelo tiene 8.953.803.264 parametros (unos 8,95 mil millones) en formato safetensors, con un repositorio de 17,9 GB, y se distribuye bajo licencia Apache 2.0 a traves de la libreria transformers. El autor solo publica pesos de inferencia: el estado del optimizador y de RNG para reanudar el entrenamiento no forma parte de la exportacion, aunque se documenta la procedencia en `ORIGINAL_CHECKPOINT.json` y la integridad de ficheros en `MODEL_SHA256.json`.

Su interes principal es metodologico: documenta una evaluacion agente reproducible (plantilla de chat de evaluacion incluida, thinking desactivado, 64 episodios concurrentes, sandboxes de 10 GiB y evaluador de solo anexado con puertas de regresion) sobre un modelo pequeno que actua como trabajador subordinado a un orquestador MiniMax-M2.7. El propio autor advierte de que una unica puntuacion no permite afirmar una mejora estable respecto a otros checkpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; derivada de la familia Qwen3.5 (etiqueta `qwen3_5`), sin descripcion de capas o atencion en la informacion proporcionada |
| Parametros totales | 8.953.803.264 (8,95 B), dato real de safetensors |
| Parametros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se enumeran; el repositorio (17,9 GB para 8,95 B de parametros) es compatible con pesos sin cuantizar en bf16/fp16, pero no se confirma |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, libreria transformers; incluye `chat_template.jinja`, `eval_chat_template.jinja`, `ORIGINAL_CHECKPOINT.json` y `MODEL_SHA256.json` |
| Modalidades declaradas | Etiqueta `image-text-to-text` en el repositorio (no descrita en la model card) |
| Uso declarado | `reinforcement-learning` (pipeline), evaluacion agente en SWE-bench Verified |
| Modelo base | Qwen/Qwen3.5-9B (relacion declarada: fine-tune) |
| Revision donante del export | `c202236235762e1c871ad0ccb60c8ee5ba337b9a` |
| Revision del orquestador | `d494266a4affc0d2995ba1fa35c8481cbd84294b` |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-20 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo (numero de capas, mecanismo de atencion, presencia de componentes MoE o de torre visual). Lo unico verificable es que se trata de un derivado de Qwen/Qwen3.5-9B, identificado con la etiqueta `qwen3_5`, y que el repositorio incluye la etiqueta `image-text-to-text`, lo que sugiere soporte de entrada de imagen en la familia base, aunque la model card no lo describe ni lo confirma para este checkpoint concreto.

El entrenamiento declarado sigue el modo **OPD**, con refinamiento por aprendizaje por refuerzo sobre el modelo base y un total de 150 actualizaciones del optimizador hasta el checkpoint final. La evaluacion se realizo en modo **orch**: un orquestador MiniMax-M2.7 dirige a este modelo de 9B como worker, con el modo thinking del worker desactivado. El harness emplea 64 episodios concurrentes y contenedores de 10 GiB, y el evaluador es de solo anexado con puertas de regresion, aplicado sobre tareas retenidas. El autor etiqueta aparte los resultados previos con 32 concurrencias y harness original como contexto historico, no como baseline comparable. No se documentan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases adicionales de RLHF o DPO mas alla del regimen de RL descrito.

## Capacidades

- Generacion de codigo y resolucion de tareas de ingenieria de software sobre repositorios reales, orientada a SWE-bench Verified.
- Operacion como agente dentro de una orquestacion: recibe instrucciones de un orquestador externo (MiniMax-M2.7 en la campana descrita) y ejecuta pasos en un sandbox.
- Ejecucion de tareas en entornos aislados tipo Docker con 10 GiB de espacio, segun la configuracion de evaluacion publicada.
- Funcionamiento con el modo thinking desactivado, lo que reduce la generacion de cadenas de razonamiento explicitas y da respuestas mas directas en el bucle agente.
- Posible soporte de entrada de imagen segun la etiqueta `image-text-to-text` del repositorio (no confirmado en la model card).
- Compatibilidad declarada con endpoints (`endpoints_compatible`) en el hub de Hugging Face.
- Uso de plantilla de chat propia para evaluacion (`eval_chat_template.jinja`), separada de la plantilla nativa.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, audio, vision detallada ni cobertura multilingue.

## Casos de uso

- **Resolucion automatica de issues en repositorios**: el modelo puede recibir una incidencia, inspeccionar el codigo dentro de un sandbox y proponer un parche verificable, que es exactamente el escenario de SWE-bench Verified para el que fue evaluado.
- **Worker en pipelines de agentes con orquestador**: encaja como subagente especializado en codigo dentro de una arquitectura donde un modelo mayor planifica y este ejecuta los pasos concretos de edicion y prueba.
- **Generacion de parches con verificacion por tests**: al ejecutarse en un contenedor con 10 GiB, se puede integrar en un bucle que aplique el parche candidato, ejecute la suite de pruebas y devuelva el resultado al orquestador.
- **Automatizacion de tareas de mantenimiento en CI**: uso como motor de propuestas de cambio para dependencias, refactorizaciones menores o correcciones de estilo, con revision humana obligatoria antes del merge.
- **Reproduccion de investigacion en RL para codigo**: la publicacion de la plantilla de evaluacion y de los ficheros de procedencia permite replicar la campana exacta y comparar checkpoints bajo el mismo evaluador.
- **Evaluacion comparativa de checkpoints intermedios**: util para equipos que entrenan variantes de Qwen3.5-9B y necesitan un punto de referencia con harness documentado y tareas retenidas.
- **Asistente de codigo con contexto de repositorio en local**: con cuantizacion agresiva podria desplegarse en una GPU de consumo para tareas de autocompletado y explicacion de codigo, aunque no hay datos publicados de calidad en ese regimen.
- **Extraccion de trazas y analisis de latencia**: el material asociado incluye latencias por tarea y percentiles de finalizacion (T25 a T100), lo que sirve para estudios de rendimiento de agentes en problemas largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card indica que los resultados completos, latencias por tarea, percentiles de finalizacion (T25/T50/T75/T90/T100), desglose de Docker y contabilidad de tokens por rol y de cache de prefijos se publican en un dataset aparte, pero no reproduce cifras concretas en el texto. Los resultados previos con 32 concurrencias y harness original se etiquetan explicitamente como contexto historico y no como baseline comparable. El autor senala ademas que una unica puntuacion no permite afirmar una mejora estable.

| Benchmark | Resultado | Notas |
|---|---|---|
| SWE-bench Verified (eval150 retenido) | No disponible en la informacion proporcionada | Cifras publicadas en el dataset enlazado, no en la model card |
| Resto de benchmarks (MMLU, HumanEval, GSM8K, etc.) | No disponible | No se mencionan |

## Requisitos de hardware

Estimaciones calculadas a partir del numero de parametros (8,95 B); el autor no publica requisitos oficiales.

| Precision | VRAM estimada para pesos | Comentario |
|---|---|---|
| fp16 / bf16 | ~18 GB | Requiere GPU de 24 GB o superior para inferencia comoda |
| int8 | ~9 GB | Cabe en GPUs de 12-16 GB |
| 4 bits (GGUF/AWQ/GPTQ) | ~5-6 GB | Cabe en GPUs de 8 GB con contexto moderado |

- **GPU recomendadas**: A100 40/80 GB, H100 80 GB o L40S para servicio en bf16 con lotes grandes; RTX 4090 24 GB y RTX 3090 24 GB son suficientes para bf16 en una sola GPU con contexto reducido; RTX 4080/4070 Ti Super (16 GB) o inferiores requieren cuantizacion int8 o 4 bits.
- **Cabe en GPU de consumo**: si, en tarjetas de 24 GB sin cuantizar y en tarjetas de 8-16 GB con cuantizacion, siempre que el framework de destino soporte la arquitectura Qwen3.5.
- **Nota sobre multimodalidad**: si finalmente se confirma la entrada de imagen, la VRAM adicional del codificador visual no esta cuantificada en la informacion disponible.
- **Opciones de despliegue**: transformers (libreria declarada), vLLM o TGI para servicio con batching continuo, llama.cpp u Ollama si se generan pesos GGUF. La etiqueta `endpoints_compatible` indica compatibilidad con los endpoints gestionados de Hugging Face.
- **Requisito del harness de evaluacion**: los contenedores de la campana descrita usan sandboxes de 10 GiB, un dato relevante para dimensionar el entorno de ejecucion de agentes, no la GPU.
- **Latencia y throughput**: no disponibles. La model card remite al dataset de resultados para las latencias por tarea y los percentiles de finalizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CharlieLLL/Qwen3.5-9B-coding-opd-mix-raw-ckpt149... | 8,95 B | No disponible | Codigo y agentes SWE-bench, ajustado por RL | apache-2.0 | Publicado en Hugging Face, 0 descargas y 0 likes en el momento de la consulta |
| Qwen/Qwen3.5-9B (modelo base) | ~9 B (no confirmado en la informacion proporcionada) | No disponible | Proposito general | No disponible en la informacion proporcionada | Publico en Hugging Face |
| Otras alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la informacion proporcionada de datos de rendimiento del propio modelo ni de la linea base, por lo que no es posible establecer una comparacion cuantitativa con alternativas del mismo tamano. Tampoco se identifican en la busqueda web modelos comparables publicados bajo el mismo harness.

## Limitaciones y advertencias

- **Evidencia empirica limitada**: el modelo tiene 0 descargas y 0 likes, y el autor advierte explicitamente que una sola puntuacion no permite afirmar una mejora estable frente a otros checkpoints.
- **Resultados no incluidos en la model card**: las cifras de SWE-bench Verified se publican en un dataset aparte, por lo que no pueden verificarse desde la propia ficha.
- **Dependencia del andamiaje**: la evaluacion se realizo con un orquestador MiniMax-M2.7, thinking desactivado y un harness concreto. Los resultados no son extrapolables a un uso directo sin ese andamiaje ni con el modo thinking activado.
- **Confusion potencial de identificadores**: los numeros de checkpoint son indices locales de iteracion basados en cero y no deben confundirse con la etiqueta de inicializacion OPD109; el propio autor lo advierte.
- **Idiomas no declarados**: no se especifica cobertura multilingue. Las tareas de SWE-bench son mayoritariamente en ingles, por lo que el comportamiento en castellano u otros idiomas no esta caracterizado.
- **Riesgo de alucinacion**: como modelo de lenguaje, puede generar parches o referencias a APIs inexistentes; en tareas de codigo esto debe mitigarse con ejecucion de pruebas y revision humana.
- **Solo pesos de inferencia**: no se incluye estado del optimizador ni de RNG, de modo que no es posible reanudar el entrenamiento desde este export.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-9B puede tener sus propias condiciones; conviene verificar la licencia del modelo base antes de un despliegue en produccion.
- **Cuantizacion no verificada**: no hay pesos GGUF, AWQ o GPTQ publicados ni resultados de calidad en esos regimenes.
- **Caveat de produccion**: el uso como agente requiere aislamiento en sandbox (10 GiB en la configuracion de referencia) y control de acceso a red y sistema de ficheros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CharlieLLL/Qwen3.5-9B-coding-opd-mix-raw-ckpt149-appendonly-w64-20260920
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de resultados de la campana SWE-bench Verified eval150: https://huggingface.co/datasets/CharlieLLL/SWEbench-Verified-eval150-M2.7-new-checkpoints-appendonly-w64-20260920
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los enlaces obtenidos corresponden a paginas de soporte de Microsoft (passkeys, inicio de sesion en Hotmail, caducidad de EWS y tasa de refresco en Windows) y no guardan relacion con el modelo.
