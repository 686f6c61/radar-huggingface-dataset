# HaoranLiu/SFT-4B-ScaleCUA-MixedOpen

## Resumen

SFT-4B-ScaleCUA-MixedOpen es un ajuste supervisado (SFT) del modelo multimodal Qwen/Qwen3-VL-4B-Instruct, publicado por el usuario HaoranLiu, orientado a tareas de computer use: un agente que observa capturas de pantalla y emite acciones sobre una interfaz grafica de escritorio. El modelo conserva la arquitectura del base (Qwen3-VL, vision-lenguaje) y sus 4.437.815.808 parametros totales (~4,4B), con pesos en safetensors y un repositorio de 8,9 GB.

El entrenamiento se realizo sobre 1430 trayectorias del split `rl_tasks` del dataset cua-lite/ScaleCUA, mezclando a partes iguales tres profesores de codigo abierto: Qwen/Qwen3.8-27B (478 trayectorias), Qwen/Qwen3.5-27B (477) y meituan/EvoCUA-8B-20260105 (475). El checkpoint publicado es la epoca 3 (`iter_1070`). La premisa del autor es que distintos agentes profesores cubren distintos dominios de la interfaz, de modo que la mezcla amplia la cobertura de tareas del estudiante.

Su relevancia es acotada pero concreta: es un punto de referencia reproducible para investigacion en agentes GUI de 4B, con protocolo de evaluacion declarado (Lite.OSWorld `eval`, 332 tareas, decodificacion greedy) y con el codigo de entrenamiento y de rollout publicados. El autor advierte que las diferencias frente a su variante mono-profesor estan dentro del ruido de medida del entorno, por lo que debe leerse como una comparacion entre pares, no como una ablacion limpia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer multimodal vision-lenguaje (Qwen3-VL); tag de libreria `qwen3_vl` |
| Parametros totales | 4.437.815.808 (~4,4B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible; el protocolo de entrenamiento usa `full_history_size=4` (historial de 4 elementos) |
| Tipos de cuantizacion | no disponible; el repositorio contiene pesos safetensors (8,9 GB, compatible con ~16 bits por parametro) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-VL-4B-Instruct |
| Modalidad de entrada/salida | image-text-to-text (capturas de pantalla como contexto, acciones como salida) |
| Dataset de entrenamiento | cua-lite/ScaleCUA (split `rl_tasks`), 1430 trayectorias |
| Fecha de publicacion | 2026-09-15 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-VL-4B-Instruct, un transformer multimodal que acepta imagenes e texto y genera texto; no se describe en la model card ninguna modificacion estructural, solo el ajuste del checkpoint. Los pesos se distribuyen en safetensors y se cargan con la libreria `transformers`, con el tag `qwen3_vl` que identifica el adaptador necesario.

El entrenamiento es SFT a nivel de token sobre los tokens de accion del asistente, con las capturas de pantalla tratadas como contexto y enmascaradas fuera de la perdida. Se ejecuto con `cua-lite-preference` (commit 6fbb2c9b) y slime v0.3.0, sobre 2 GPU H100 de 80 GB con TP=2 y DP=1, con un total de 15 horas y 47 minutos (2026-09-10, 05:04 a 20:52 UTC). Hiperparametros: learning rate 5e-6 con decaimiento coseno hasta `min_lr` 1e-6, `warmup_fraction` 0,1, `global_batch_size` de 4 trayectorias por paso, `micro_batch_size` 1, 3 epocas y 1070 pasos con `save_interval` 358. La configuracion de exportacion es `scripts/configs/qwen3_vl/default/lite.osworld.yaml` con `full_history_size=4`. Se conservan checkpoints hermanos de las epocas 1 (`iter_356`/`iter_357`) y 2 (`iter_713`/`iter_715`).

Del dataset: 1430 tareas unicas, una trayectoria por tarea, sin repeticiones. 1390 de 1430 son exitos completos (`episode_return == 1.0`); el resto obtiene credito parcial de 0,6 a 0,67. Todas las filas proceden del split `rl_tasks`. No se menciona RLHF ni DPO en el proceso descrito.

## Capacidades

- Control de interfaces graficas de escritorio: dado un objetivo en lenguaje natural y capturas de pantalla, el modelo emite acciones sobre la GUI (es el objeto del ajuste).
- Comprension de capturas de pantalla como contexto multimodal (pipeline `image-text-to-text`).
- Razonamiento multi-paso: el protocolo de evaluacion usa `max_steps: 30`, es decir, cadenas de hasta 30 acciones por episodio.
- Ejecucion de tareas de tipo computer use sobre el entorno Lite.OSWorld y, por construccion del dataset, sobre tareas de `lite.scalecua`.
- Historial multi-turno acotado: fue entrenado con un protocolo de renderizado de historial de tamano 4 (`full_history_size=4`).
- Capacidades del modelo base Qwen3-VL-4B-Instruct (generacion de texto y procesamiento de imagenes): heredadas, pero no documentadas de forma especifica para este checkpoint.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible en la informacion proporcionada.

## Casos de uso

- Automatizacion de tareas repetitivas de escritorio: el modelo puede actuar como agente que observa la pantalla y ejecuta clics y entradas sobre aplicaciones nativas, con cadenas de hasta 30 pasos por episodio, lo que cubre flujos de trabajo administrativos de longitud media.
- Investigacion en aprendizaje por imitacion para agentes GUI: sirve como estudiante de referencia para estudiar el efecto de mezclar profesores distintos (Qwen3.8-27B, Qwen3.5-27B, EvoCUA-8B) sobre un mismo base de 4B, con el codigo de entrenamiento publicado.
- Banco de pruebas reproducible de agentes de computer use: el protocolo declarado (Lite.OSWorld `eval`, 332 tareas, greedy, concurrencia 12) permite comparar checkpoints bajo condiciones identicas en un mismo host.
- Pruebas de regresion de interfaces de escritorio: un agente que sigue un guion de acciones sobre una aplicacion puede detectar cambios de comportamiento tras un despliegue, revisando si los pasos siguen siendo ejecutables.
- Extraccion de datos desde aplicaciones sin API: el modelo puede recorrer formularios y paneles de una aplicacion de escritorio para leer valores y devolverlos en texto estructurado, evitando integraciones a medida.
- Asistencia remota guiada: dado el estado actual de una pantalla, puede proponer la siguiente accion concreta al usuario, util en herramientas de soporte tecnico.
- Generacion de trayectorias adicionales para aumentar datos: sus rollouts sobre tareas no vistas pueden emplearse como material de partida para posteriores ciclos de filtrado y SFT.
- Evaluacion de accesibilidad y navegabilidad: al intentar completar tareas sobre una interfaz, expone puntos donde la interaccion resulta ambigua o no resoluble.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre Lite.OSWorld, split `eval`, 332 tareas, decodificacion greedy (`temperature=0`), `max_steps: 30`, concurrencia 12, `group_size=1`, medidos por el autor en el mismo host y protocolo:

| Modelo | Profesores | Trayectorias | mean episode_return | Exitos |
|---|---|---|---|---|
| SFT-4B-ScaleCUA-MixedOpen (ep3, este) | 3 de codigo abierto | 1430 | 0.3750 | 118/332 |
| SFT-4B-ScaleCUA-Qwen38 (ep3) | solo Qwen3.8-27B | 1224 | 0.3644 | 114/332 |
| SFT-4B-ScaleCUA-MixedOpen (ep1) | 3 de codigo abierto | — | 0.2367 | 74/332 |

El propio autor senala que la diferencia entre la variante mixta y la mono-profesor (+0,0106 / +4 tareas) esta dentro del ruido de medida del entorno (reevaluar un checkpoint desplazo el resultado en ±2 tareas), y que ambas variantes difieren simultaneamente en identidad de profesores, numero de trayectorias y cobertura de tareas, por lo que no constituyen una ablacion de variable unica. No hay datos de benchmarks de proposito general (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Entrenamiento (dato declarado): 2 GPU H100 de 80 GB con TP=2 y DP=1, 15 h 47 min para 1070 pasos y 3 epocas sobre 1430 trayectorias.
- VRAM de inferencia en precision de los pesos (safetensors, repositorio de 8,9 GB para ~4,4B parametros): aproximadamente 9 GB solo para pesos; a ello hay que sumar la cache KV y las activaciones de los tokens visuales de las capturas.
- Estimacion aritmetica de pesos por cuantizacion: ~9 GB en bf16/fp16, ~4,5 GB en 8 bits y ~2,2-2,5 GB en 4 bits (estimacion propia a partir del numero de parametros; no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor. Dado el tamano, una GPU de 24 GB (RTX 3090, RTX 4090, L4 24 GB) es suficiente en bf16 con margen para cache KV y vision; una GPU de 16 GB requiere cuantizacion de 8 bits.
- Cabe en GPU de consumo: si, en tarjetas de 16-24 GB, con la salvedad de que el consumo real depende del numero de capturas por episodio y de la longitud del historial.
- Opciones de despliegue: la model card solo documenta `transformers` junto con el script `scripts/rollout.py` de cua-lite y la configuracion `scripts/configs/qwen3_vl/default/lite.osworld.yaml` (obligatoria, con `full_history_size=4`). Soporte en vLLM, llama.cpp, Ollama o TGI: no disponible en la informacion proporcionada. El tag `endpoints_compatible` sugiere compatibilidad con endpoints gestionados, aunque no se detalla.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Base | Contexto | Rendimiento en Lite.OSWorld `eval` | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SFT-4B-ScaleCUA-MixedOpen | ~4,4B | Qwen3-VL-4B-Instruct | no disponible | 0.3750 (118/332) | no disponible | HuggingFace, safetensors |
| SFT-4B-ScaleCUA-Qwen38 | ~4,4B | Qwen3-VL-4B-Instruct | no disponible | 0.3644 (114/332) | no disponible | HuggingFace |
| Qwen3-VL-4B-Instruct | ~4,4B | — (modelo base) | no disponible | no disponible | no disponible | HuggingFace |

La unica comparacion con datos numericos es entre las dos variantes SFT del mismo autor, entrenadas con los mismos hiperparametros, configuracion de exportacion y protocolo de evaluacion. El modelo base no tiene resultados publicados en la informacion disponible, y la busqueda web realizada no devolvio ninguna fuente relevante sobre este modelo (los resultados obtenidos fueron paginas corporativas de Microsoft, sin relacion con la ficha).

## Limitaciones y advertencias

- Ambito restringido a computer use: el ajuste se realizo exclusivamente sobre trayectorias de agentes GUI de Lite.ScaleCUA; no hay evidencia de que conserve intactas las capacidades generales de texto del modelo base.
- Protocolo de servicio obligatorio: si se sirve con una ventana de historial distinta de `full_history_size=4`, se altera silenciosamente el prompt para el que fue entrenado y el rendimiento deja de ser comparable.
- Los numeros no son comparables entre hosts: el autor midio un desplazamiento de 0,0104 / 4 tareas al reevaluar el mismo checkpoint en otra maquina virtual. Solo deben compararse resultados obtenidos en un mismo host y protocolo.
- Diferencia dentro del ruido: la ventaja frente a la variante mono-profesor (+0,0106 / +4 tareas) es del orden del ruido de medida del entorno. No debe interpretarse como evidencia de que la mezcla de profesores mejore el resultado, ya que las variantes difieren tambien en numero de trayectorias (1430 frente a 1224) y cobertura de tareas.
- Desajuste entre entrenamiento y evaluacion: entrenado sobre tareas `rl` de `lite.scalecua` y evaluado sobre `lite.osworld` `eval`, que son pools de tareas distintos aunque compartan el sustrato de escritorio.
- Tasa de exito absoluta baja: 118 de 332 tareas resueltas (35,5%). No es adecuado como agente autonomo sin supervision en produccion.
- Datos de entrenamiento mayoritariamente exitosos: 1390 de 1430 trayectorias son exitos completos, con solo unas pocas de credito parcial (0,6-0,67); el modelo apenas ha visto ejemplos de recuperacion tras fallo.
- Licencia no disponible: no puede confirmarse la legalidad de un uso comercial ni las obligaciones de atribucion. Debe verificarse antes de cualquier despliegue en produccion.
- Idiomas soportados y sesgos: no disponibles en la informacion proporcionada; no hay evaluacion de sesgo ni de comportamiento multilingue.
- Riesgo de alucinacion de acciones: al ser un modelo generativo que emite acciones sobre una interfaz, puede producir secuencias plausibles pero incorrectas; se requiere confirmacion y limites de pasos (el protocolo de evaluacion usa 30).
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HaoranLiu/SFT-4B-ScaleCUA-MixedOpen
- Checkpoint hermano mono-profesor: https://huggingface.co/HaoranLiu/SFT-4B-ScaleCUA-Qwen38
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/cua-lite/ScaleCUA
- Codigo de entrenamiento y rollout (cua-lite): https://github.com/cua-lite/cua-lite
- Profesor Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Profesor Qwen3.5-27B: https://huggingface.co/Qwen/Qwen3.5-27B
- Profesor EvoCUA-8B: https://huggingface.co/meituan/EvoCUA-8B-20260105
- Registro de entrenamiento (wandb): liu-hr22-tsinghua-university/cua-lite-dev/runs/8mpvuigx
- Job de entrenamiento (ray): raysubmit_TxuEdEMpVAAwC22Y
- Resultados de la busqueda web: ninguna fuente relevante sobre el modelo; los resultados devueltos correspondian a paginas corporativas de Microsoft (microsoft.com, account.microsoft.com, myaccount.microsoft.com, en.wikipedia.org/wiki/Microsoft), sin relacion con esta ficha.
