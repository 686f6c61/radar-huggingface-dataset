# harrywang01/oopsie-debug

## Resumen

oopsie-debug es un conjunto de checkpoints de Diffusion Policy (variante de imagen con backbone UNet) para control robotico, publicado por el usuario harrywang01 en HuggingFace. No es un modelo de lenguaje: se trata de una politica de imitacion entrenada sobre datos de teleoperacion de un brazo Franka, con el objetivo de mapear observaciones visuales y de propiocepcion a comandos de accion de 10 dimensiones. El modelo se entrena con el `train.py` del repositorio https://github.com/KuanchengWang/oopsie (rama `dp-teleop-block`) y se evalua con el script `eval_real_robot_panda_realsense_teleop_block.py` sobre un Franka Panda con camara RealSense.

El repositorio corresponde a una tarea concreta, identificada como `swap-animal`, entrenada con el dataset `teleop_dataset_20260922_211038`: 40 episodios, 15 840 pasos a 10 Hz, usando todas las demos en entrenamiento y sin conjunto de validacion reservado. La ejecucion de 3000 epochs (batch 64, aproximadamente 244 pasos por epoch) comenzo el 23 de septiembre de 2026, pero el pipeline solo conserva `latest.ckpt`, de modo que unicamente se ha preservado la instantanea del epoch 1600, con una perdida de entrenamiento media (in-sample) de 0,0005.

Su relevancia es limitada y muy acotada: es un artefacto de investigacion reproducible para una sola tarea de manipulacion robotica, con licencia MIT, tres descargas y ningun "like" en el momento de redactar esta ficha. La utilidad principal es servir como referencia de configuracion (contrato de observacion/accion, manejo de cuaterniones en orden `wxyz`, normalizacion) para quien replique el pipeline en un Franka o adapte la receta a otro robot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (policy de difusion para robotica) con backbone UNet sobre observaciones de imagen; no es un transformer de lenguaje |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; usa `n_obs_steps = 2` pasos de observacion) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen como checkpoints de entrenamiento en punto flotante) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | `.ckpt` de PyTorch (checkpoint completo con `state_dicts`: model, ema_model, optimizer; `pickles`: epoch, global_step, rng_state; y `cfg`), serializado con `dill` |
| Tamano del repositorio | 263,5 GB |
| Pipeline declarado | robotics |
| Dataset de entrenamiento | `teleop_dataset_20260922_211038` (40 episodios, 15 840 pasos a 10 Hz) |
| Tarea | `swap-animal` |
| Checkpoints disponibles | `swap-animal/epoch_1600.ckpt` (epoch 1600, perdida media de entrenamiento 0,0005) |
| Orden de cuaterniones | `wxyz` (manejo corregido, segun el README del repositorio) |

## Arquitectura y entrenamiento

La arquitectura es una Diffusion Policy con codificacion visual mediante UNet, una familia de politicas que genera trayectorias de accion denoizando muestras de ruido de forma iterativa y condicionada por observaciones. En este caso las observaciones son dos imagenes RGB (`img_third` de camara externa e `img_wrist` de muneca, a 3x120x160, obtenidas con `INTER_AREA` desde 480x640 en BGR), una pose del efector final de 9 dimensiones (xyz mas rotacion 6D derivada del cuaternion almacenado en orden `w,x,y,z`) y el estado de la pinza en metros (anchura). El contrato de observacion usa `n_obs_steps = 2`, es decir, dos pasos temporales de contexto. La accion es un vector de 10 dimensiones `[x, y, z, rot6d(6), gripper width]` correspondiente a la pose y apertura de pinza del frame t+1, con horizonte de prediccion 16 y 8 acciones ejecutadas antes de volver a planificar.

El entrenamiento se realizo con el script `train.py` del repositorio oopsie (rama `dp-teleop-block`) sobre teleoperacion de Franka, con batch 64 y aproximadamente 244 pasos por epoch durante una ejecucion de 3000 epochs iniciada el 23 de septiembre de 2026. No se menciona en la informacion disponible el uso de RLHF, DPO ni fases de ajuste con preferencias humanas, algo por otra parte ajeno a este tipo de politicas. Tampoco se documenta el numero total de tokens, la composicion detallada del dataset ni innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. La normalizacion aplicada es: posicion escalada de minimo/maximo a [-1, 1], rotacion 6D con identidad como referencia y pinza fijada al rango [0, 0,08] m mapeado a [-1, 1].

## Capacidades

- Generacion de acciones de manipulacion robotica: produce vectores de 10 dimensiones (pose del efector final en xyz, rotacion 6D y anchura de pinza) para el frame siguiente.
- Control visomotor: consume dos vistas RGB simultaneas (camara externa y de muneca) y las combina con propiocepcion del robot.
- Planificacion en horizonte corto: predice secuencias de 16 acciones y ejecuta las 8 primeras antes de replanificar, con 2 pasos de observacion como contexto.
- Politica de imitacion de una unica tarea: especializada en la tarea `swap-animal` aprendida de demos de teleoperacion.
- Inferencia en robot real: integrable con el script `eval_real_robot_panda_realsense_teleop_block.py` sobre Franka Panda con RealSense.
- No soporta tool calling, function calling, agentes, razonamiento multietapa, generacion de texto, codigo, matematicas, vision general ni audio.
- No dispone de capacidades multilingues ni de modo de razonamiento extendido, ya que no procesa lenguaje.

## Casos de uso

- Replicacion de experimentos en robotica: cargar `swap-animal/epoch_1600.ckpt` con `torch.load(path, pickle_module=dill, map_location='cpu', weights_only=False)` y usar `state_dicts['ema_model']` para reproducir la politica publicada y comparar con los resultados del autor.
- Evaluacion de politicas de difusion en hardware real: desplegar sobre un Franka Panda con RealSense mediante el script de evaluacion del repositorio oopsie, ejecutando la tarea `swap-animal` de forma repetida para medir tasa de exito.
- Punto de partida para fine-tuning en una tarea nueva: reutilizar el pipeline `dp-teleop-block` y sustituir el dataset de teleoperacion por uno propio, aprovechando que el checkpoint es un estado completo de entrenamiento (incluye optimizador y `ema_model`).
- Referencia de contrato observacion/accion: usar el formato documentado (dos imagenes 3x120x160, pose EEF de 9 dimensiones, `gripper_state` en metros, accion de 10 dimensiones, horizonte 16/8) como plantilla para construir interfaces de teleoperacion propias.
- Validacion de manejo de cuaterniones: el checkpoint usa `quat_order = wxyz`, lo que sirve como caso de prueba para verificar conversiones cuaternion a rotacion 6D en un pipeline de robotica.
- Docencia y divulgacion en aprendizaje por imitacion: ilustrar de forma practica como se pasa de demos de teleoperacion a una politica que controla un manipulador, incluyendo la normalizacion de posicion, rotacion y pinza.
- Analisis de sobreajuste en politicas de imitacion: al no existir conjunto de validacion y reportarse unicamente perdida in-sample (0,0005 en el epoch 1600), el checkpoint puede emplearse como caso de estudio metodologico sobre la necesidad de separar validacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar en la informacion disponible. El unico dato numerico reportado por el autor es la perdida media de entrenamiento in-sample del checkpoint preservado:

| Checkpoint | Epoch | Perdida media de entrenamiento (in-sample) |
|---|---|---|
| `swap-animal/epoch_1600.ckpt` | 1600 | 0,0005 |

Los epochs 500, 1000 y 1500 se sobrescribieron antes de poder copiarlos, y los epochs 2000, 2500 y 3000 se anadiran, segun el autor, a medida que la ejecucion avance. No hay tasas de exito, metricas de tarea ni comparaciones con otras politicas en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publica el numero de parametros ni el consumo de memoria del modelo.
- GPU recomendadas: no disponible. El repositorio esta pensado para entrenamiento e inferencia con PyTorch, y la evaluacion se realiza sobre un Franka Panda con camara RealSense; no se especifica la GPU empleada.
- Compatibilidad con GPU de consumo: no se puede confirmar sin datos de tamano del modelo. El tamano del repositorio (263,5 GB) corresponde al conjunto de checkpoints completos de entrenamiento (que incluyen `optimizer` y `ema_model`), no al peso necesario para inferencia, que sera una fraccion no especificada.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. El despliegue se realiza con PyTorch, cargando el checkpoint con `dill` y ejecutando el script de evaluacion del repositorio oopsie sobre el robot real.
- Latencia y throughput: no disponibles. La politica opera a 10 Hz en la recogida de datos, pero no se publican mediciones de frecuencia de inferencia ni de latencia de control en el robot.

## Comparativa con modelos similares

No se dispone de datos verificados de parametros, contexto, rendimiento ni licencia de las alternativas en la informacion proporcionada, por lo que la comparacion cuantitativa se marca como no disponible. Cualitativamente, este checkpoint se situa en la categoria de las politicas de difusion para manipulacion robotica, junto a implementaciones como la Diffusion Policy original de Chi et al., las politicas de difusion integradas en LeRobot y enfoques tipo ACT, pero no se aportan cifras comparables.

| Modelo | Parametros | Contexto / observaciones | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oopsie-debug (`swap-animal/epoch_1600.ckpt`) | no disponible | `n_obs_steps = 2`; 2 imagenes RGB 3x120x160 + pose EEF 9D + pinza | Solo perdida in-sample 0,0005 en epoch 1600 | MIT | HuggingFace, 3 descargas, 1 checkpoint |
| Diffusion Policy original (Chi et al.) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Politicas de difusion de LeRobot | no disponible | no disponible | no disponible | no disponible | no disponible |
| ACT / familia ALOHA | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser una politica de robotica entrenada con 40 episodios de un unico operador y una unica tarea, es esperable que herede las particularidades de esas demos, pero el autor no reporta analisis al respecto.
- Riesgo de sobreajuste: el entrenamiento usa todas las demos sin conjunto de validacion reservado y el unico dato de perdida es in-sample (0,0005), por lo que no hay evidencia publicada de capacidad de generalizacion.
- Cobertura de datos muy reducida: 40 episodios y 15 840 pasos a 10 Hz para una sola tarea (`swap-animal`), lo que limita drasticamente la variedad de escenarios, posiciones iniciales y objetos.
- Disponibilidad de checkpoints: solo se conserva `epoch_1600.ckpt`. Los epochs 500, 1000 y 1500 se perdieron y los 2000, 2500 y 3000 estan pendientes, de modo que no es posible analizar la evolucion del entrenamiento.
- Dependencia del contrato de observacion: cualquier uso exige respetar exactamente el formato documentado (imagenes 3x120x160 obtenidas con `INTER_AREA` desde 480x640 BGR, pose EEF de 9 dimensiones, pinza en metros, `n_obs_steps = 2`, accion de 10 dimensiones con horizonte 16 y 8 ejecutadas) y el orden de cuaterniones `wxyz`.
- Carga insegura de pesos: los checkpoints requieren `torch.load(..., pickle_module=dill, weights_only=False)`, lo que implica ejecucion de pickles y, por tanto, un riesgo de seguridad si el fichero no procede de una fuente fiable.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificacion y redistribucion manteniendo el aviso de copyright y la licencia. No se documentan restricciones adicionales.
- Tamano del repositorio: 263,5 GB, lo que complica el almacenamiento, la descarga y la gestion de versiones, especialmente porque los checkpoints incluyen estado del optimizador.
- Aviso de alcance: los checkpoints de `teleop-block` que estaban en la raiz del repositorio se eliminaron el 23 de septiembre de 2026, por lo que enlaces o referencias antiguas pueden estar rotos.
- Ausencia de datos de despliegue: no se publican requisitos de VRAM, GPU, latencia ni tasa de exito en robot, lo que impide evaluar su viabilidad en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/harrywang01/oopsie-debug
- Repositorio de entrenamiento (rama `dp-teleop-block`): https://github.com/KuanchengWang/oopsie
- Script de evaluacion en robot real: `eval_real_robot_panda_realsense_teleop_block.py` (incluido en el repositorio anterior)
- Script de entrenamiento: `train.py` (incluido en el repositorio anterior)
- La busqueda web realizada no devolvio enlaces relevantes al modelo: los resultados obtenidos correspondian a paginas genericas de YouTube y no guardan relacion con este checkpoint.
