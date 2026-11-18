# L7-Robotics/smolvla_so101_world_traj_ahead_conveyor_dynamic_speedup_v4.1

## Resumen

SmolVLA es un modelo compacto de vision-lenguaje-accion (VLA) disenado para control robótico de bajo coste computacional, capaz de ejecutarse en hardware de consumo. Este checkpoint concreto, `smolvla_so101_world_traj_ahead_conveyor_dynamic_speedup_v4.1`, es un ajuste fino del modelo base `lerobot/smolvla_base` realizado por L7-Robotics sobre un dataset propio de demostraciones reales con un brazo SO-101 (`so_follower`). El modelo resuelve una tarea de manipulacion concreta: "put the red cube in the white bowl" (poner el cubo rojo en el cuenco blanco), en un escenario con cinta transportadora y velocidad dinamica.

El modelo combina percepcion visual (tres camaras: `rear_top`, `right_side` y `wrist`), un estado proprioceptivo de 6 dimensiones y genera comandos de accion de 6 dimensiones a 20 FPS. Con aproximadamente 451 millones de parametros, es lo suficientemente pequeno para desplegarse en GPU de consumo, lo que lo hace relevante para laboratorios y proyectos de robotica que buscan politicas de imitacion sin infraestructura de datacenter.

La relevancia actual del checkpoint radica en su especializacion: no es un modelo generalista, sino una politica de imitacion afinada sobre 513 episodios y casi 194 000 frames para una tarea especifica de picking-and-placing con perturbaciones de velocidad. Esta especializacion es tipica del flujo LeRobot, donde el modelo base se adapta a un entorno concreto mediante ajuste fino supervisado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-lenguaje-accion, transformer compacto) |
| Parametros totales | 450.981.238 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | so_follower (SO-101) |
| Camaras | rear_top, right_side, wrist (3 x 480x640 RGB) |
| Entrada de estado | observation.state (6,) |
| Salida de accion | action (6,) |
| Frecuencia de control | 20 FPS (segun dataset de entrenamiento) |
| Tamano del repo | 1.2 GB |

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-lenguaje-accion que integra un codificador visual, un backbone de lenguaje y un decodificador de acciones en un unico transformer compacto. El modelo consume tres flujos de imagen (480x640 cada uno) junto con el estado proprioceptivo del robot y produce directamente un vector de accion de 6 dimensiones, siguiendo el esquema de imitacion end-to-end de LeRobot. El checkpoint deriva del modelo base `lerobot/smolvla_base` mediante ajuste fino supervisado.

El ajuste fino se realizo sobre el dataset `L7-Robotics/so101_conveyor_dynamic_merge_v4`, compuesto por 513 episodios y 193 672 frames capturados a 20 FPS. La configuracion de entrenamiento reportada incluye 80 000 pasos, batch size de 16, optimizador AdamW, learning rate 1e-4, semilla 1000 y LeRobot 0.5.2. No se especifica en la informacion disponible si se empleo RLHF, DPO ni tecnicas de refuerzo adicionales; el entrenamiento parece ser imitacion supervisada pura. El sufijo "world_traj_ahead" y "dynamic_speedup" sugiere variantes de entrenamiento orientadas a prediccion de trayectoria y robustez ante cambios de velocidad de la cinta, pero no se detalla el mecanismo tecnico en la model card.

## Capacidades

- Control robotico end-to-end por imitacion: mapea observaciones multimodales (tres camaras + estado) a acciones de 6 grados de libertad.
- Percepcion visual multi-camara: procesa simultaneamente vistas `rear_top`, `right_side` y `wrist` a 480x640.
- Ejecucion de tareas de manipulacion especificas: entrenado para "put the red cube in the white bowl".
- Operacion en escenarios con cinta transportadora y velocidad dinamica (segun el nombre del checkpoint y el dataset).
- Despliegue en hardware de consumo: tamano de 451 M parametros compatible con GPU no-datacenter.
- Integracion nativa con LeRobot: comandos `lerobot-rollout` y `lerobot-train`.
- No se reportan capacidades de tool calling, agentes multi-paso, razonamiento general ni procesamiento de audio.
- Cobertura multilingue: no disponible (el modelo no esta orientado a lenguaje natural general).

## Casos de uso

- Automatizacion de picking-and-placing en linea de produccion: el modelo ejecuta la tarea de colocar un cubo en un cuenco sobre una cinta transportadora, integrable en celdas robotizadas con SO-101.
- Manipulacion con velocidad variable: el sufijo "dynamic_speedup" indica entrenamiento para tolerar cambios de velocidad de la cinta, util en procesos de clasificacion o empaquetado con cadencia variable.
- Prototipado rapido en laboratorios de robotica: al partir de `smolvla_base` y requerir GPU de consumo, permite iterar politicas de imitacion sin infraestructura dedicada.
- Investigacion en aprendizaje por imitacion: sirve como baseline reproducible para estudiar robustez ante perturbaciones visuales y dinamicas.
- Despliegue en robot de bajo coste SO-101: el modelo esta calibrado para la morfologia y cinematica del `so_follower`, reduciendo el trabajo de integracion.
- Reentrenamiento con nuevos datasets: la model card documenta el comando `lerobot-train` para adaptar la politica a otras tareas manteniendo el backbone preentrenado.
- Evaluacion comparativa de politicas VLA compactas: util como referencia de 451 M parametros frente a modelos VLA de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de exito en robot real, latencia medida ni throughput documentado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 451 M parametros en FP32 el peso ocupa aproximadamente 1,8 GB, y en FP16/BF16 unos 0,9 GB, mas el coste de activaciones de tres imagenes 480x640.
- GPU recomendadas: no especificadas por el autor; por tamano, cualquier GPU con al menos 4-8 GB de VRAM deberia ser suficiente, incluyendo RTX 3060, RTX 4060, RTX 4090.
- Cabe en GPU de consumo: si, segun la descripcion del modelo base SmolVLA ("deployed on consumer-grade hardware").
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con backend CUDA (`--policy.device=cuda`). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de accion robotica.
- Latencia y throughput estimados: no disponible. El control opera a 20 FPS segun el dataset, pero no se reporta latencia de inferencia medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_so101_world_traj_ahead_conveyor_dynamic_speedup_v4.1 | 451 M | no disponible | Manipulacion SO-101 (cubo rojo en cuenco) | apache-2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible en la informacion | no disponible | VLA generalista base | no disponible en la informacion | Hugging Face |
| Otros checkpoints LeRobot SO-101 | no disponible | no disponible | Manipulacion especifica | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion extrema: entrenado unicamente para la tarea "put the red cube in the white bowl"; no generaliza a otras tareas sin reentrenamiento.
- Sin evaluacion publicada: no hay tasas de exito en robot real, por lo que el rendimiento en produccion es incierto.
- Dependencia de configuracion de camaras: requiere exactamente las camaras `rear_top`, `right_side` y `wrist` con las mismas resoluciones; un montaje distinto invalida la politica.
- Dependencia del robot: calibrado para `so_follower` (SO-101); cambios de morfologia, calibracion o efector final pueden degradar el comportamiento.
- Riesgo de sobreajuste al dataset: 513 episodios en un unico entorno pueden no cubrir variaciones de iluminacion, posiciones de objetos o distracciones.
- Sesgos: no documentados; al ser un modelo de control, los sesgos relevantes serian de distribucion de datos (posiciones, velocidades, objetos) mas que sociales.
- Alucinacion: en el contexto de politicas VLA, se traduce en acciones fuera de distribucion; no hay evaluacion de seguridad ni de recuperacion ante fallos.
- Licencia apache-2.0: permite uso comercial, pero conviene revisar la licencia del modelo base y del dataset asociado.
- Idiomas: no disponible; el modelo no procesa lenguaje natural general, solo la instruccion de tarea fijada.
- Sin datos de cuantizacion: no se documentan variantes GGUF ni INT8, lo que limita opciones de despliegue en CPU o edge.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/L7-Robotics/smolvla_so101_world_traj_ahead_conveyor_dynamic_speedup_v4.1
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/L7-Robotics/so101_conveyor_dynamic_merge_v4
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=L7-Robotics/so101_conveyor_dynamic_merge_v4
- Paper SmolVLA (arXiv 2506.01844): https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
