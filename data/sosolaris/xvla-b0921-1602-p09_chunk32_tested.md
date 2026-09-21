# SoSolaris/xvla-b0921-1602-p09_chunk32_TESTED

## Resumen

`SoSolaris/xvla-b0921-1602-p09_chunk32_TESTED` es un checkpoint de política robótica (Vision-Language-Action) entrenado con la librería LeRobot sobre el modelo base `lerobot/xvla-base`. X-VLA es un marco de flow-matching con soft prompts que trata cada conjunto robot-hardware como una "tarea" codificada mediante un conjunto reducido de embeddings aprendibles (Soft Prompt), lo que permite que un único modelo abarque morfologías, sensores y espacios de acción diversos. El checkpoint concreto está ajustado para el robot `so101_follower` y la tarea "Grab the tape" (coger la cinta).

El modelo tiene 879.687.256 parámetros (~880 M, arquitectura densa, no MoE), un repositorio de 1,8 GB en formato safetensors y licencia Apache-2.0. Consume tres flujos visuales (`observation.images.image` a 256x256, `observation.images.image2` a 256x256 y `observation.images.image3` a 224x224) más un vector de estado de 8 dimensiones, y produce un vector de acción de 6 dimensiones, típico de un brazo robótico de 6 grados de libertad.

Su relevancia es acotada y muy específica: no es un modelo de propósito general, sino una política de imitación entrenada con solo 20 episodios y 7.071 fotogramas a 15 FPS sobre el dataset `SoSolaris/FlourishGrabTape`. Resulta útil como ejemplo reproducible de ajuste fino de X-VLA con LeRobot y como base para experimentos de manipulación con el SO-101, pero no hay resultados de evaluación publicados ni métricas de éxito en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (X-VLA) con soft prompts y flow matching; transformer denso con codificadores visuales |
| Parametros totales | 879.687.256 (~880 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (el nombre del checkpoint sugiere action chunking de 32, sin confirmar en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en safetensors, presumiblemente en precision de entrenamiento (el repo de 1,8 GB es coherente con bf16/fp16) |
| Idiomas soportados | no disponible; el condicionamiento linguistico se realiza mediante la instruccion de tarea (`--task="Grab the tape"`), sin cobertura multilingue declarada |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

X-VLA es un marco VLA de flow matching con condicionamiento por soft prompts. En lugar de especializar el modelo por robot, codifica cada configuración de hardware como una tarea mediante un conjunto pequeño de embeddings de Soft Prompt aprendibles, de modo que un mismo conjunto de pesos puede reconciliar morfologías, sensores y espacios de acción distintos. Sobre esa base, este checkpoint es un ajuste fino supervisado (imitation learning) para el robot `so101_follower` con dos cámaras declaradas (`right`, `up`) y un espacio de acción de 6 dimensiones.

Los datos de entrenamiento proceden del dataset `SoSolaris/FlourishGrabTape`: 20 episodios, 7.071 fotogramas a 15 FPS y una única tarea, "Grab the tape". La configuración de entrenamiento reportada es de 5.000 pasos, batch size 32, optimizador `xvla-adamw`, learning rate 0,0001, semilla 1000 y LeRobot 0.6.2. No se documenta el número total de tokens de entrenamiento, la composición del dataset más allá de lo indicado, ni fases de RLHF o DPO (poco habituales en políticas de imitación de este tipo). Tampoco se describe ninguna innovación adicional de decodificación o atención específica para este checkpoint.

## Capacidades

- Generacion de acciones de robot: produce un vector de accion de 6 dimensiones a partir de observaciones visuales y de estado, adecuado para control de un brazo SO-101.
- Percepcion visual multi-camara: procesa tres entradas visuales simultaneas (dos a 256x256 y una a 224x224).
- Fusion vision-lenguaje-accion: condiciona el comportamiento mediante una instruccion de tarea en lenguaje natural.
- Ejecucion de una tarea especifica de manipulacion: "Grab the tape" (coger la cinta).
- Integracion con LeRobot: compatible con `lerobot-rollout` para ejecucion en robot y `lerobot-train` para reentrenamiento.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de modo "thinking", vision generativa, audio ni generacion de texto libre.
- Capacidades multilingues: no disponibles; el prompt de tarea es una cadena corta y no se declara soporte de idiomas.

## Casos de uso

- Manipulacion de objetos con SO-101: la politica ejecuta la tarea "Grab the tape" sobre el robot `so101_follower` mediante `lerobot-rollout`, con `--strategy.type=base` y una duracion acotada (por ejemplo 60 s) para pruebas controladas.
- Replicacion de experimentos de imitacion: sirve como referencia reproducible de un ajuste fino de X-VLA sobre un dataset pequeño (20 episodios), util para validar pipelines de LeRobot 0.6.2 en un laboratorio.
- Punto de partida para nuevos ajustes: al derivar de `lerobot/xvla-base` y ser Apache-2.0, puede reentrenarse con `lerobot-train` sobre datasets propios de otras tareas o posiciones de objeto.
- Docencia y formacion en robotica: permite ilustrar el ciclo completo grabacion de datos, calibracion, entrenamiento y despliegue en hardware de bajo coste.
- Investigacion en adaptacion de morfologias: el mecanismo de soft prompts de X-VLA hace de este checkpoint un caso de estudio para evaluar como se comparte un mismo modelo base entre configuraciones de robot.
- Pruebas de robustez visual: al depender de tres camaras, es util para medir la sensibilidad a cambios de iluminacion, oclusiones o recolocacion de objetos en tareas de agarre.
- Validacion de latencia en bucle de control: con camaras configuradas a 30 FPS y datos de entrenamiento a 15 FPS, sirve para medir si la politica mantiene el ritmo de control requerido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion vacia con la indicacion explicita de que no se han proporcionado resultados para esta politica, por lo que no existen tasas de exito en robot real, numero de ensayos ni condiciones de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: el conteo de parametros (879,7 M) implica aproximadamente 1,76 GB solo en pesos a bf16/fp16 y unos 3,5 GB a fp32; sumando activaciones de los tres codificadores visuales, un presupuesto practico de 4-8 GB de VRAM es razonable (estimacion derivada del tamano, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080/4090, A100 o H100 deberian ser suficientes con holgura; el modelo no requiere aceleradores de gama alta.
- Cabe en GPU de consumo: si, con toda probabilidad en cualquier GPU con 8 GB o mas de VRAM en bf16/fp16, y en GPUs de 12-16 GB sin margen ajustado.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecucion, `lerobot-train` para entrenamiento) sobre CUDA; el comando documentado usa `--policy.device=cuda`. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje generativo sino una politica de accion.
- Latencia y throughput: no disponibles. Como referencia de diseno, el dataset se grabo a 15 FPS y el ejemplo de rollout configura las camaras a 30 FPS, de modo que la politica debe inferir dentro del periodo de control para no perder pasos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SoSolaris/xvla-b0921-1602-p09_chunk32_TESTED | 879.687.256 | no disponible | sin resultados de evaluacion publicados | apache-2.0 | HuggingFace (0 descargas, 0 likes) |
| lerobot/xvla-base | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace, referenciado como modelo base |
| Otras politicas VLA (OpenVLA, SmolVLA, pi0, GR00T N1) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas de la misma categoria. Cualquier cifra sobre OpenVLA, SmolVLA, pi0 o GR00T N1 requeriria consultar sus model cards originales, que no forman parte de este material.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay tasas de exito, numero de ensayos ni condiciones de prueba, por lo que se desconoce la fiabilidad real de la politica.
- Dataset muy reducido: 20 episodios y 7.071 fotogramas para una unica tarea, lo que limita la generalizacion a nuevas posiciones de objeto, iluminaciones o distractores.
- Especializacion estrecha: el modelo esta ajustado para "Grab the tape" en un `so101_follower`; fuera de esa tarea o de ese robot su comportamiento no esta garantizado.
- Dependencia de la configuracion de camaras: la politica espera claves de observacion concretas (`observation.images.image`, `image2`, `image3`) y nombres de camara coherentes; un mapeo incorrecto invalida la inferencia.
- Inconsistencia documentada: la seccion "Model Details" declara las camaras `right` y `up` (dos), mientras que la tabla de entradas lista tres flujos visuales; conviene verificar la correspondencia antes de desplegar.
- Riesgo de sobreajuste a la morfologia: aunque X-VLA se disena para reconciliar distintos hardware mediante soft prompts, este checkpoint concreto solo ha visto una configuracion.
- Riesgo de alucinacion en el sentido generativo: no aplica al no generar texto, pero si existe riesgo de acciones erroneas o inseguras cuando la observacion se aleja de la distribucion de entrenamiento.
- Limitaciones de idioma: no se declara cobertura multilingue; el prompt de tarea es una cadena fija en la practica.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero al derivar de `lerobot/xvla-base` conviene revisar tambien la licencia y condiciones de ese modelo base.
- Repositorio sin traccion: 0 descargas y 0 likes, sin señales de validacion por parte de la comunidad.
- Discrepancia de identificador: el comando de rollout del README apunta a `SoSolaris/xvla-b0921-1602-p09_chunk32`, mientras que el repositorio publicado es `SoSolaris/xvla-b0921-1602-p09_chunk32_TESTED`; hay que ajustar la ruta `--policy.path`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SoSolaris/xvla-b0921-1602-p09_chunk32_TESTED
- Paper de X-VLA (arXiv 2510.10274): https://huggingface.co/papers/2510.10274
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Dataset de entrenamiento: https://huggingface.co/datasets/SoSolaris/FlourishGrabTape
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SoSolaris/FlourishGrabTape
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de xvla en LeRobot: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Nota: los resultados de busqueda web disponibles no contienen informacion relevante sobre este modelo (eran resultados no relacionados sobre Facebook), por lo que no se han podido anadir enlaces adicionales verificados.
