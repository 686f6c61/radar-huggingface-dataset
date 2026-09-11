# happyhappy-jun/gr00t-n1.6-aloha-pick-cubes-into-cup

## Resumen

gr00t-n1.6-aloha-pick-cubes-into-cup es un fine-tune de robótica del modelo fundacional NVIDIA Isaac-GR00T N1.6-3B, publicado por el usuario happyhappy-jun. Se trata de un modelo de tipo VLA (vision-language-action) ajustado mediante aprendizaje por imitación sobre 91 episodios teleoperados de un robot ALOHA estacionario (bimanual ViperX con cuatro cámaras a 50 Hz), con una única tarea: "Pick up the two blue cubes and place them in the cup". El repositorio incluye cuatro checkpoints (5k, 10k, 15k y 20k pasos) y solo los ficheros necesarios para inferencia, sin estado de optimizador, scheduler ni RNG.

El interés de esta ficha es acotado: no es un modelo de propósito general, sino un artefacto de investigación que muestra el flujo de trabajo de fine-tuning con la etiqueta `NEW_EMBODIMENT` del stack Isaac-GR00T sobre un embodiment concreto. Su valor práctico está en reproducir la receta de ajuste y en servir como referencia para quien quiera adaptar GR00T N1.6 a su propio robot, más que en desplegarlo en producción tal cual.

El modelo no tiene descargas ni likes en HuggingFace en el momento de redactar esta ficha, la evaluación publicada es en lazo abierto sobre trayectorias de entrenamiento (no held-out) y la licencia es la NVIDIA Open Model License, heredada del modelo base. La búsqueda web asociada no devolvió resultados relevantes sobre el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en Isaac-GR00T N1.6: backbone VLM congelado (salvo las 4 capas superiores del LLM) + projector + cabeza de accion DiT |
| Parametros totales | 3B (heredados del modelo base nvidia/GR00T-N1.6-3B) |
| Parametros activos | No aplica (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo distribuye pesos en safetensors |
| Idiomas soportados | no disponible; la unica instruccion de tarea del dataset esta en ingles |
| Licencia | nvidia-open-model-license (campo `license: other` en HuggingFace) |
| Formato de pesos | safetensors (2 shards por checkpoint: `model-00001-of-00002.safetensors` y `model-00002-of-00002.safetensors`, con `model.safetensors.index.json`) |
| Tarea (pipeline) | robotics |
| Modelo base | nvidia/GR00T-N1.6-3B (fine-tune) |
| Embodiment | `aloha_stationary`, etiqueta `NEW_EMBODIMENT` |
| Dimension de estado/accion | 14 (right_arm[0:6], right_gripper[6:7], left_arm[7:13], left_gripper[13:14]) |
| Horizonte de accion | 32 pasos a 50 Hz = 0,64 s por chunk |
| Entradas visuales | 4 camaras RGB 480x640 (`camera_high`, `camera_low`, `camera_wrist_left`, `camera_wrist_right`) |
| Tamano del repositorio | 26,3 GB (4 checkpoints, solo inferencia) |
| Fecha de creacion / actualizacion | 2026-09-11 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseno de Isaac-GR00T N1.6: un backbone vision-language model de 3B parametros que procesa las cuatro vistas de camara junto con la instruccion en lenguaje natural, un projector que alinea las representaciones multimodales con el espacio de accion y una cabeza DiT (diffusion/flow-matching transformer) que genera el chunk de acciones. En este fine-tune concreto se congelo el backbone VLM excepto las 4 capas superiores del LLM, y se entrenaron unicamente el projector y la cabeza DiT. Las acciones se predicen como un chunk de 32 pasos: las articulaciones de brazo se representan de forma relativa (`a[t+k] − s[t]`, normalizadas con las estadisticas relativas del dataset), mientras que los grippers se representan de forma absoluta. Esto implica que el estado articular actual de 14 dimensiones debe pasarse en cada llamada de inferencia, ya que la politica vuelve a sumar ese estado a los deltas predichos.

Los datos de entrenamiento son 91 episodios teleoperados de ALOHA estacionario en formato LeRobot v2.1, con 65.325 frames a 50 fps (episodios de 9 a 24 s) y una unica cadena de tarea. El ajuste se lanzo con `gr00t/experiment/launch_finetune.py` y los valores por defecto de `examples/finetune.sh`: learning rate 1e-4, warmup 0.05, weight decay 1e-5, scheduler coseno y color jitter con factores 0.3/0.4/0.5/0.08. Se entrenaron 20.000 pasos (aproximadamente 20 pasadas sobre los 91 episodios) en 2x A100-40GB con batch efectivo de 64 (16 por dispositivo, 2 dispositivos, grad-accum 2) y DeepSpeed ZeRO-2, con un tiempo total de 6,6 horas. El repositorio incluye `modality.json` y `aloha_config.py`, que mapean las columnas de LeRobot a las claves de modalidad de GR00T (`high`, `low`, `wrist_left`, `wrist_right`) y documentan la configuracion del embodiment.

## Capacidades

- Generacion de acciones de control bimanual de 14 dimensiones para ALOHA estacionario, en chunks de 32 pasos a 50 Hz (0,64 s), ejecutables total o parcialmente (por ejemplo, 16 de 32 pasos antes de volver a consultar la politica).
- Ejecucion de una unica tarea de manipulacion: recoger dos cubos azules y depositarlos en una taza.
- Percepcion multimodal a partir de cuatro camaras simultaneas (vista alta, vista baja y dos munecas) a 480x640 RGB.
- Condicionamiento por instruccion en lenguaje natural mediante el campo `annotation.human.task_description`; en este fine-tune la unica instruccion entrenada esta en ingles.
- Aprendizaje por imitacion a partir de demostraciones teleoperadas, sin necesidad de recompensas ni de simulador.
- Hereda del modelo base la formulacion VLA general, pero el fine-tune no aporta capacidades nuevas fuera del dominio entrenado.
- No se documenta soporte de tool calling, function calling, agentes, multi-step reasoning, vision general de proposito abierto, audio ni modo de razonamiento explicito.

## Casos de uso

- Reproduccion de la receta de fine-tuning de GR00T N1.6 sobre un embodiment propio: el repositorio incluye los cuatro checkpoints y la configuracion (`aloha_config.py`, `modality.json`), lo que permite comparar curvas de ajuste a 5k, 10k, 15k y 20k pasos antes de invertir en un entrenamiento completo.
- Banco de pruebas de la interfaz `Gr00tPolicy`: sirve para validar el contrato de observaciones de GR00T (cuatro streams de video, estado de 14 dimensiones, cadena de tarea) y el formato de retorno de acciones absolutas antes de portar el codigo a otro robot.
- Demostracion docente de aprendizaje por imitacion bimanual: con 91 episodios y 6,6 horas de entrenamiento en 2x A100 es un caso asequible para explicar normalizacion relativa frente a absoluta en acciones de robot.
- Evaluacion del efecto del tamano del dataset en una tarea simple de pick-and-place, analizando la diferencia de MSE/MAE entre checkpoints para discutir cuando conviene parar el ajuste.
- Punto de partida para data augmentation o cambio de dominio sobre la misma tarea (iluminacion, posicion de cubos, fondo), ya que el color jitter ya forma parte de la receta y el ajuste es corto.
- Analisis de sensibilidad a la frecuencia de control: al ejecutar un prefijo del chunk (por ejemplo 16 de 32 pasos) se puede medir el compromiso entre latencia de re-planificacion y suavidad del movimiento.
- Trabajo de investigacion sobre transferencia de politicas VLA entre embodiments usando la etiqueta `NEW_EMBODIMENT` como caso de estudio de un solo embodiment.
- No se recomienda como componente de un sistema en produccion ni para tareas distintas a la entrenada.

## Benchmarks y rendimiento

El unico dato publicado es una evaluacion en lazo abierto sobre 10 trayectorias de entrenamiento (no held-out), con chunks de 32 pasos y un maximo de 600 frames por trayectoria. El propio autor advierte que son numeros de ajuste, no de generalizacion.

| Checkpoint | MSE medio (rad² / unit²) | MAE medio |
|---|---|---|
| checkpoint-5000 | 0,00142 | 0,0229 |
| checkpoint-10000 | 0,00066 | 0,0132 |
| checkpoint-15000 | 0,00087 | 0,0092 |
| checkpoint-20000 | 0,00023 | 0,0065 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes de robotica como tasas de exito en lazo cerrado) en la informacion disponible.

## Requisitos de hardware

- Entrenamiento (referencia del autor): 2x A100-40GB, batch efectivo 64, DeepSpeed ZeRO-2, 20.000 pasos en 6,6 horas.
- Repositorio completo: 26,3 GB en disco, correspondientes a cuatro checkpoints (aproximadamente 6,6 GB por checkpoint, coherente con 3B parametros en precision de 16 bits mas encoder visual y cabeza de accion).
- VRAM estimada para inferencia: del orden de 8-12 GB para un checkpoint en bf16 con los buffers de las cuatro camaras; se recomienda reservar 16 GB o mas para holgura. Esta cifra es una estimacion derivada del tamano del checkpoint, no un dato publicado.
- GPU de consumo: si, cabe en una RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 4080 (16 GB) para inferencia de un unico checkpoint. Las A100-40GB y H100 se indican para el entrenamiento.
- Despliegue: la ruta documentada es el paquete `gr00t.policy.gr00t_policy.Gr00tPolicy` del repositorio Isaac-GR00T N1.6, cargando el checkpoint con `embodiment_tag=EmbodimentTag.NEW_EMBODIMENT`.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; la cabeza de acciones DiT y el bucle de control a 50 Hz no encajan en esos servidores de texto, y no hay pesos GGUF publicados.
- Latencia y throughput de inferencia: no disponibles. Como restriccion de diseno, cada llamada genera 0,64 s de trayectoria, y el prefijo ejecutado marca el tiempo disponible para re-planificar.
- Almacenamiento en inferencia: se puede descargar un unico checkpoint con `allow_patterns=["checkpoint-20000/*"]` para evitar los 26,3 GB completos.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea / dominio | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| happyhappy-jun/gr00t-n1.6-aloha-pick-cubes-into-cup | 3B | VLA, una tarea ALOHA (91 episodios) | no disponible | nvidia-open-model-license | HuggingFace, 0 descargas, 0 likes |
| nvidia/GR00T-N1.6-3B (base) | 3B | VLA fundacional multi-embodiment | no disponible | nvidia-open-model-license | HuggingFace (modelo base) |
| Otros fine-tunes de GR00T N1.6 sobre ALOHA | no disponible | VLA, tareas pick-and-place | no disponible | no disponible | no disponible |
| Politicas de imitacion especificas de ALOHA (por ejemplo ACT o Diffusion Policy) | no disponible | manipulacion bimanual supervisada | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento (tasas de exito en lazo cerrado, latencia o robustez) entre este fine-tune y las alternativas, por lo que la comparacion se limita a parametros, licencia y disponibilidad. La busqueda web realizada no aporto informacion adicional utilizable.

## Limitaciones y advertencias

- Sobreajuste al dominio: el ajuste usa 91 episodios de un unico robot, una unica mesa y una unica tarea. No hay evidencia de generalizacion a otros objetos, posiciones, iluminacion o robots.
- Evaluacion no concluyente: los numeros de MSE y MAE se calculan sobre 10 trayectorias de entrenamiento, no sobre un conjunto held-out, y son metricas en lazo abierto. No se publica tasa de exito en ejecucion real.
- Unidades mezcladas en la metrica: el MSE combina rad² (articulaciones) y unit² (grippers), lo que dificulta interpretar su magnitud de forma aislada.
- Dependencia del estado actual: las articulaciones de brazo se predicen como deltas relativos, por lo que omitir el estado de 14 dimensiones en la llamada de inferencia produce acciones incorrectas. Los grippers, en cambio, son absolutos.
- Riesgo de alucinacion de acciones: al ser una politica generativa, ante observaciones fuera de distribucion puede producir trayectorias plausibles pero fisicamente invalidas; es imprescindible un limitador de velocidad/par y parada de emergencia en hardware real.
- Idiomas: la unica instruccion de tarea esta en ingles y no se documenta soporte multilingue. Cambiar la cadena de tarea no garantiza un comportamiento distinto.
- Licencia: NVIDIA Open Model License, heredada del modelo base. Es necesario revisar sus condiciones antes de cualquier uso comercial, redistribucion o despliegue en producto.
- Ausencia de estado de entrenamiento: el repositorio solo incluye ficheros de inferencia, sin optimizador, scheduler, RNG ni estado del trainer, por lo que no se puede reanudar el entrenamiento desde estos checkpoints sin reiniciarlo.
- Adopcion nula: 0 descargas y 0 likes, sin validacion de terceros ni issues publicos; el artefacto no ha sido contrastado por la comunidad.
- Reproducibilidad parcial: se documentan hiperparametros y horas de entrenamiento, pero no la semilla ni el commit exacto del repositorio Isaac-GR00T empleado.
- Metadatos de fecha inusuales en HuggingFace (creacion y actualizacion el 2026-09-11), a tener en cuenta al citar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/happyhappy-jun/gr00t-n1.6-aloha-pick-cubes-into-cup
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.6-3B
- Repositorio Isaac-GR00T (NVIDIA): https://github.com/NVIDIA/Isaac-GR00T
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Paper, blog o demo adicionales: no disponible (la busqueda web no devolvio resultados relevantes sobre este modelo)
