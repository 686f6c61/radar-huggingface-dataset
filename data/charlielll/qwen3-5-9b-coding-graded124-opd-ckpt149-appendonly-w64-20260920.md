# CharlieLLL/Qwen3.5-9B-coding-graded124-opd-ckpt149-appendonly-w64-20260920

## Resumen

Qwen3.5-9B-coding-graded124-opd-ckpt149 es un ajuste fino de tipo reinforcement learning sobre el modelo Shangy/Qwen3.5-9B-OPD-Coding, publicado por el usuario CharlieLLL en Hugging Face. Se trata de un "worker" de 9B especializado en tareas de codigo y resolucion de issues de repositorio, entrenado con un esquema que el autor denomina Graded RL y evaluado sobre SWE-bench Verified en una campana de 2026-09-20 con 150 tareas reservadas (held-out) y 64 episodios concurrentes en sandboxes de 10 GiB.

El checkpoint publicado es el final de la campana, correspondiente a 150 actualizaciones del optimizador (el identificador ckpt149 es un numero de iteracion local guardado con base cero). El modelo fue evaluado en modo "orch", es decir, como subagente de codigo dirigido por un orquestador MiniMax-M2.7, con el modo de razonamiento (thinking) del worker desactivado. Esta circunstancia es importante: las capacidades declaradas corresponden a ese rol concreto dentro de un sistema multiagente, no a un uso autonomo sin orquestador.

El modelo tiene 8.953.803.264 parametros reales en safetensors, ocupa 17,9 GB en el repositorio y se distribuye bajo licencia Apache 2.0. La model card no documenta longitud de contexto, idiomas soportados, recetas de cuantizacion ni resultados numericos de benchmarks; unicamente remite a un dataset externo con los resultados completos de la evaluacion. El tag image-text-to-text sugiere capacidad multimodal de entrada, aunque la model card no la describe explicitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tags: qwen3_5, transformers; sin detalle de arquitectura en la model card) |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible como publicacion oficial; el repositorio contiene safetensors (17,9 GB, compatible con pesos de 16 bits) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | Shangy/Qwen3.5-9B-OPD-Coding (fine-tune) |
| Pipeline declarado | reinforcement-learning |
| Modalidad declarada | image-text-to-text (segun tags; no confirmado en la model card) |
| Tamano del repositorio | 17,9 GB |
| Revision donante del export | 679d1265badc03391b17126b79096ae3b6ffb20c |
| Revision del coordinador | d494266a4affc0d2995ba1fa35c8481cbd84294b |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-20 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla del tag qwen3_5 y de la libreria transformers, por lo que se desconoce si se trata de un transformer denso convencional o de una variante hibrida. El recuento de parametros (8,95B) y el tamano del repositorio (17,9 GB) son consistentes con un export en 16 bits, sin indicios de mezcla de expertos. El modelo deriva del checkpoint Shangy/Qwen3.5-9B-OPD-Coding mediante un proceso de ajuste con aprendizaje por refuerzo identificado como Graded RL, del que no se especifican hiperparametros, funcion de recompensa ni composicion del dataset.

El proceso de entrenamiento descrito en la model card se limita a indicar que el checkpoint publicado es el resultado final de 150 actualizaciones del optimizador, que los pesos exportados son exclusivamente de inferencia (el estado del optimizador y del generador de numeros aleatorios no forma parte del export) y que la inicializacion del entrenamiento se registra aparte en ORIGINAL_CHECKPOINT.json. La evaluacion se realizo con un evaluador "append-only regression-gated" sobre tareas reservadas de SWE-bench Verified, con 64 episodios concurrentes y sandboxes de 10 GiB. El autor advierte explicitamente que los resultados previos obtenidos con 32 episodios concurrentes y el arnés original se etiquetan como contexto historico y no como baseline emparejado, y que una unica puntuacion no permite afirmar una mejora estable.

## Capacidades

- Generacion de codigo y resolucion de issues de repositorio, orientada especificamente a tareas de tipo SWE-bench Verified.
- Ejecucion de tareas de ingenieria de software dentro de un bucle agente-orquestador: el modelo actua como worker de 9B dirigido por un orquestador externo (MiniMax-M2.7 en la campana publicada).
- Trabajo sobre sandboxes aislados de 10 GiB con ejecucion concurrente de hasta 64 episodios, segun la configuracion de evaluacion documentada.
- Uso de plantilla de chat de evaluacion especifica (eval_chat_template.jinja), separada de la plantilla nativa (chat_template.jinja).
- Modo thinking desactivado en la configuracion evaluada; no se documenta su comportamiento con el razonamiento extendido activado.
- Capacidad multimodal de entrada segun el tag image-text-to-text; no descrita ni validada en la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Reparacion automatizada de issues en repositorios: el modelo esta entrenado y evaluado sobre SWE-bench Verified, por lo que su uso natural es recibir una descripcion de fallo y un arbol de codigo dentro de un sandbox para producir un parche verificable.
- Subagente de codigo en pipelines multiagente: dado que fue evaluado como worker bajo un orquestador MiniMax-M2.7, encaja como componente especializado de bajo coste al que un modelo mayor delega la edicion de ficheros y la ejecucion de pruebas.
- Integracion en CI/CD con verificacion por regresion: el evaluador "append-only regression-gated" descrito sugiere un flujo en el que cada parche candidato se valida contra una suite de pruebas antes de aceptarse, replicable en pipelines de integracion continua.
- Generacion masiva de parches en paralelo: la configuracion de 64 episodios concurrentes con sandboxes de 10 GiB documentada indica que el modelo puede desplegarse en flotas para explorar multiples soluciones a un mismo problema.
- Migracion y refactorizacion de codigo a escala de repositorio: con una ventana de contexto no documentada, su idoneidad depende de la herramienta de indexado y recuperacion que acompanie al modelo.
- Asistencia a revision de codigo: el modelo puede emplearse para proponer cambios y justificarlos, dejando la validacion final a un revisor humano o a un gate de regresion automatizado.
- Evaluacion comparativa de tecnicas de RL para codigo: al publicarse junto a un dataset de resultados por checkpoint, sirve como referencia para investigar el efecto del entrenamiento con refuerzo graduado en modelos de 9B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras numericas (ni MMLU, ni HumanEval, ni GSM8K, ni el resultado agregado de SWE-bench Verified) y se limita a remitir al dataset CharlieLLL/SWEbench-Verified-eval150-M2.7-new-checkpoints-appendonly-w64-20260920 para consultar resultados completos, latencias por tarea, percentiles de finalizacion T25/T50/T75/T90/T100, desglose de Docker y trazabilidad de tokens. Por tanto, no es posible presentar una tabla comparativa fiable sin consultar esa fuente externa.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 18-20 GB solo para pesos, mas la cache KV, que crece con la longitud de contexto (no documentada). Se recomienda un minimo de 24 GB.
- VRAM estimada con cuantizacion de 8 bits: en torno a 9-11 GB.
- VRAM estimada con cuantizacion de 4 bits: en torno a 5,5-7 GB, si se generan pesos GGUF o AWQ/GPTQ a partir del export safetensors (no publicados por el autor).
- GPU profesionales: A100 40/80 GB, H100 80 GB, L40S 48 GB y A6000 48 GB pueden ejecutar el modelo en 16 bits con contexto amplio.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) en 16 bits con contexto moderado; en RTX 4080/4070 Ti Super (16 GB) requiere cuantizacion de 8 o 4 bits.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI son las vias habituales para servir el export safetensors; llama.cpp y Ollama requieren convertir los pesos a GGUF, conversion no publicada en el repositorio. El tag endpoints_compatible indica compatibilidad con endpoints gestionados.
- Infraestructura de evaluacion documentada por el autor: sandboxes de 10 GiB por episodio y hasta 64 episodios concurrentes, lo que implica aproximadamente 640 GiB de almacenamiento temporal en el escenario maximo descrito.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| CharlieLLL/Qwen3.5-9B-coding-graded124-opd-ckpt149 | 8,95B | no disponible | apache-2.0 | Hugging Face, safetensors, 0 descargas | No publicados en la model card; remite a dataset externo |
| Shangy/Qwen3.5-9B-OPD-Coding (modelo base) | no disponible | no disponible | no disponible | Hugging Face (referenciado como base_model) | no disponible |
| Alternativas de codigo de ~9B de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion verificable sobre otros modelos comparables dentro del material proporcionado, ni de cifras que permitan establecer una comparacion cuantitativa honesta. Cualquier tabla con valores de terceros exigiria consultar las fichas originales de cada modelo.

## Limitaciones y advertencias

- El modelo se evaluo exclusivamente como worker dentro de un sistema orquestado (MiniMax-M2.7) y con el modo thinking desactivado; su comportamiento autonomo o con razonamiento activado no esta caracterizado.
- La model card advierte que una unica puntuacion no permite afirmar una mejora estable frente a otros checkpoints, y que los resultados previos con 32 episodios concurrentes no son baselines emparejados.
- No se documentan sesgos conocidos, composicion del dataset de entrenamiento ni proceso de alineacion adicional (RLHF/DPO) mas alla del Graded RL descrito de forma generica.
- Riesgo de alucinacion: no cuantificado; como modelo de codigo, existe riesgo de generar APIs inexistentes o parches que compilan pero no resuelven el fallo, por lo que se requiere verificacion con pruebas.
- Longitud de contexto e idiomas soportados no documentados, lo que impide garantizar un comportamiento fiable en repositorios grandes o en idiomas distintos del ingles.
- El autor indica explicitamente que el modelo debe usarse con la plantilla de evaluacion (eval_chat_template.jinja) y con thinking desactivado para reproducir la campana publicada; ignorar esta configuracion puede degradar los resultados.
- Los pesos publicados son solo de inferencia: no se incluye estado de reanudacion de entrenamiento (optimizador, RNG).
- Licencia Apache 2.0, que permite uso comercial, pero el usuario debe verificar las condiciones del modelo base y de cualquier dato de entrenamiento subyacente, no detalladas en la informacion disponible.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no existe validacion independiente por parte de la comunidad.
- La fecha del repositorio y de la campana de evaluacion (2026-09-20) es posterior al conocimiento de referencia habitual; conviene verificar la vigencia de los artefactos antes de integrarlos en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CharlieLLL/Qwen3.5-9B-coding-graded124-opd-ckpt149-appendonly-w64-20260920
- Dataset de resultados de la campana eval150: https://huggingface.co/datasets/CharlieLLL/SWEbench-Verified-eval150-M2.7-new-checkpoints-appendonly-w64-20260920
- Modelo base: https://huggingface.co/Shangy/Qwen3.5-9B-OPD-Coding
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo, su autor o su base: los enlaces recuperados corresponden a foros de soporte de Facebook y no guardan relacion con el contenido de esta ficha.
