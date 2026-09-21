# CharlieLLL/Qwen3.5-9B-coding-graded350-opd-ckpt149-appendonly-w64-20260920

## Resumen

Qwen3.5-9B-coding-graded350-opd-ckpt149 es un ajuste por aprendizaje por refuerzo (RL) del modelo base Shangy/Qwen3.5-9B-OPD-Coding, publicado por el usuario CharlieLLL. Con 8.953.803.264 parametros (unos 8,95 mil millones) y pesos en safetensors, se presenta explicitamente como un "worker" de codificacion: un modelo de 9B pensado para ejecutar tareas de ingenieria de software dentro de un sistema con orquestador (MiniMax-M2.7) y sandboxes Docker.

El checkpoint corresponde al final del entrenamiento, tras 150 actualizaciones del optimizador, y forma parte de una campana de evaluacion sobre SWE-bench Verified con 150 tareas reservadas (held-out), 64 episodios concurrentes y sandboxes de 10 GiB. La model card insiste en que se trata de un export de inferencia: no incluye estado del optimizador ni del RNG para reanudar el entrenamiento.

Su relevancia es acotada y muy especifica: no es un modelo generalista con documentacion amplia, sino un artefacto de investigacion reproducible asociado a un dataset de resultados. La propia model card advierte que una unica puntuacion no permite afirmar una mejora estable, y que los resultados previos con 32 tareas concurrentes y el harness original se etiquetan como contexto historico, no como baseline comparable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de la familia Qwen3.5 (etiqueta `qwen3_5`); no se detallan capas, atencion ni si es MoE |
| Parametros totales | 8.953.803.264 (~8,95 mil millones) segun safetensors |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors (17,9 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, cargables con la libreria `transformers` |
| Modelo base | Shangy/Qwen3.5-9B-OPD-Coding (ajuste posterior por RL) |
| Pipeline declarado | reinforcement-learning |
| Estado del checkpoint | final, 150 actualizaciones del optimizador (numeracion local basada en cero) |
| Plantilla de chat | `eval_chat_template.jinja` para evaluacion; `chat_template.jinja` nativa conservada aparte |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla de la etiqueta de familia `qwen3_5` y del pipeline declarado `reinforcement-learning`. Se sabe que el modelo parte de Shangy/Qwen3.5-9B-OPD-Coding y que sobre ese punto de partida se aplico un esquema que el autor denomina "Graded RL" (RL con recompensa graduada). No se publican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas adicionales de SFT, DPO o RLHF.

El proceso de evaluacion si esta documentado con mas detalle: modo "orch" con un orquestador MiniMax-M2.7 y este modelo como worker de 9B, con el modo de razonamiento (thinking) desactivado. Cada campana de cribado usa 64 episodios concurrentes y sandboxes de 10 GiB, con un evaluador de tipo append-only con control de regresiones. El export incluye `ORIGINAL_CHECKPOINT.json` (procedencia) y `MODEL_SHA256.json` (listado de ficheros publicados), y la revision del donante de exportacion es `679d1265badc03391b17126b79096ae3b6ffb20c`; la del coordinador, `d494266a4affc0d2995ba1fa35c8481cbd84294b`. El autor advierte que los numeros de checkpoint son iteraciones locales guardadas y no deben confundirse con la etiqueta de inicializacion OPD109.

## Capacidades

- Generacion de codigo orientada a tareas de reparacion reales: el modelo se evalua en SWE-bench Verified, lo que implica edicion de repositorios, no solo autocompletado.
- Ejecucion de tareas agente de varios pasos dentro de un harness con orquestador externo y sandbox aislado.
- Uso como worker subordinado: recibe instrucciones de un orquestador (MiniMax-M2.7) y opera con el modo de razonamiento desactivado en la configuracion evaluada.
- Capacidad multimodal potencial: la etiqueta `image-text-to-text` aparece en el repositorio, pero la model card no documenta ninguna capacidad de vision. Considerar no confirmada.
- Tool calling / function calling: no documentado en la informacion disponible, aunque la evaluacion en sandboxes Docker sugiere interaccion con herramientas.
- Capacidades multilingues: no disponibles.
- Modos especiales (thinking, vision, audio): el unico modo documentado es thinking desactivado; no se declaran otros.

## Casos de uso

- Reparacion automatica de fallos en repositorios: el modelo esta entrenado y evaluado para resolver issues sobre codigo existente en SWE-bench Verified, por lo que encaja en pipelines que reciben un fallo, localizan los ficheros afectados y proponen un parche verificable con la suite de tests.
- Worker dentro de una arquitectura orquestador-trabajador: dado que la campana de evaluacion usa MiniMax-M2.7 como orquestador y este modelo como ejecutor, es el rol para el que existe evidencia de uso; el orquestador descompone y el modelo de 9B resuelve subtareas concretas.
- Agentes de codigo aislados en contenedor: el formato de evaluacion (episodios con sandbox de 10 GiB) lo hace adecuado para entornos donde el modelo ejecuta comandos y tests en un contenedor desechable, con el coste de 9B por episodio en lugar de un modelo mayor.
- Automatizacion de pruebas de regresion: el evaluador asociado es append-only y con control de regresiones, de modo que el modelo puede integrarse en un bucle que solo acepta parches que no rompen tests existentes.
- Reproduccion de experimentos de RL: al publicarse pesos de inferencia, hashes, plantilla de evaluacion y dataset de resultados, sirve como referencia para comparar tecnicas de RL con recompensa graduada sobre un modelo de 9B.
- Procesamiento por lotes de tareas de codigo a coste contenido: frente a modelos de mayor tamano, 8,95B parametros permiten ejecutar 64 episodios concurrentes en hardware moderado, lo que abarata el cribado masivo de candidatos antes de escalar a un modelo mayor.
- Generacion de parches asistida en IDE o CI/CD: con 17,9 GB de pesos en precision original, puede servirse en una GPU de 24-40 GB para sugerir diffs que luego valida la integracion continua; no hay datos publicados de latencia que permitan prometer interactividad en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una campana de evaluacion completa sobre SWE-bench Verified (eval150, 150 tareas held-out) y enlaza un dataset con resultados, latencias por tarea, percentiles de finalizacion T25/T50/T75/T90/T100, desglose de Docker y contabilidad de tokens y cache de prefijos, pero no incluye ninguna cifra en el texto proporcionado. No se deben asumir valores concretos de MMLU, HumanEval, GSM8K ni de la propia metrica de SWE-bench a partir de este material.

## Requisitos de hardware

- VRAM para inferencia en precision original: los pesos suman 17,9 GB, por lo que se necesitan aproximadamente 18-20 GB solo para pesos, mas la cache KV, cuyo tamano depende de una longitud de contexto que no se ha publicado.
- GPU profesionales: A100 (40 GB u 80 GB), H100 y equivalentes son opciones seguras; tambien L40S (48 GB) o A6000 (48 GB) si se dispone de ellas.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede alojar los pesos, pero el margen para cache KV y contexto es estrecho; una RTX 4080 o 4070 Ti (16 GB) no es suficiente sin cuantizacion.
- Cuantizacion: no hay variantes cuantizadas publicadas. Una conversion a 8 bits dejaria los pesos en torno a 9-10 GB y a 4 bits en torno a 5-6 GB, lo que permitiria ejecucion en GPU de 12-16 GB, pero esas conversiones tendrian que generarlas terceros.
- Opciones de despliegue: el repositorio esta etiquetado como compatible con endpoints y usa `transformers`, por lo que vLLM y TGI son las rutas naturales para servicio con concurrencia; llama.cpp u Ollama requeririan una conversion a GGUF que no se distribuye.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo por episodio en el material proporcionado, aunque el dataset enlazado si registra latencias por tarea.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| Qwen3.5-9B-coding-graded350-opd-ckpt149 | ~8,95 B | no disponible | Apache 2.0 | safetensors en HuggingFace, 0 descargas y 0 likes en el momento de la consulta | sin cifras en la informacion disponible |
| Shangy/Qwen3.5-9B-OPD-Coding (modelo base) | ~8,95 B (heredado) | no disponible | no disponible | HuggingFace | no disponible |
| Qwen2.5-Coder-7B | 7,61 B | 128K tokens | Apache 2.0 | safetensors y GGUF en HuggingFace | publicados por el autor del modelo |

La comparacion con alternativas de la misma categoria (modelos de codigo densos de 7-9B) queda limitada por la ausencia de contexto declarado, de idiomas y de resultados numericos en la informacion disponible. Los datos de la fila de Qwen2.5-Coder-7B proceden de documentacion publica general y no del material analizado en esta ficha; se incluyen solo como referencia de categoria, no como comparacion medida contra este checkpoint.

## Limitaciones y advertencias

- Evidencia estadistica insuficiente: la propia model card indica que "no se sigue ninguna afirmacion de mejora estable a partir de una unica puntuacion". Cualquier uso en produccion deberia validarse con evaluaciones propias y multiples ejecuciones.
- Baseline no equivalente: los resultados previos con 32 episodios concurrentes y el harness original se etiquetan como contexto historico, no como baseline comparable con los de 64 episodios concurrentes.
- Configuracion de evaluacion especifica: los resultados se obtienen con un orquestador MiniMax-M2.7, thinking desactivado y la plantilla `eval_chat_template.jinja`. Reproducir las cifras exige replicar exactamente esa configuracion.
- Riesgo de alucinacion: no se documenta ningun mecanismo de mitigacion, ni evaluaciones de fidelidad, ni tasas de error fuera de SWE-bench.
- Idiomas y contexto: se desconoce el soporte multilingue y la longitud de contexto, lo que impide planificar aplicaciones de contexto largo o en castellano con garantias.
- Capacidad multimodal no documentada: la etiqueta `image-text-to-text` sugiere entrada de imagen y texto, pero no hay confirmacion en la model card; no conviene asumir vision sin verificarla.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y las dependencias intermedias pueden arrastrar condiciones adicionales que no se detallan en el material disponible.
- Ausencia de estado de entrenamiento: no se incluye estado del optimizador ni del RNG, por lo que el ajuste fino adicional partiendo de este checkpoint no reproduce exactamente el proceso original.
- Madurez y comunidad: 0 descargas y 0 likes en el momento de la consulta, sin issues ni documentacion de terceros. Es un artefacto de investigacion, no un modelo con soporte.
- Fechas de publicacion adelantadas (2026) en los identificadores y en los ficheros de evaluacion; conviene no asumir convenciones de versionado estandar al integrarlo en un catalogo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CharlieLLL/Qwen3.5-9B-coding-graded350-opd-ckpt149-appendonly-w64-20260920
- Dataset de resultados de la campana eval150: https://huggingface.co/datasets/CharlieLLL/SWEbench-Verified-eval150-M2.7-new-checkpoints-appendonly-w64-20260920
- Modelo base: https://huggingface.co/Shangy/Qwen3.5-9B-OPD-Coding
- Revision del donante de exportacion: 679d1265badc03391b17126b79096ae3b6ffb20c (sin URL publica en la informacion disponible)
- Revision del coordinador: d494266a4affc0d2995ba1fa35c8481cbd84294b (sin URL publica en la informacion disponible)
- Ficheros auxiliares citados: `ORIGINAL_CHECKPOINT.json`, `MODEL_SHA256.json`, `eval_chat_template.jinja`, `chat_template.jinja` (dentro del repositorio del modelo)
- Busqueda web: no se han encontrado enlaces relevantes. Los resultados devueltos corresponden a hilos de foros sobre Home Assistant y proxys, sin relacion con este modelo.
