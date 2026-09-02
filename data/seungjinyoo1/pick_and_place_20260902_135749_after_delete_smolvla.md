# seungjinyoo1/pick_and_place_20260902_135749_after_delete_smolvla

## Resumen

Este modelo es una política de robótica de tipo vision-language-action (VLA) entrenada mediante aprendizaje por imitación sobre el modelo base `lerobot/smolvla_base`. El autor, seungjinyoo1, ha fine-tuneado el modelo para ejecutar la tarea de "pick_and_place" (recoger y colocar) con un robot tipo `so_follower`, utilizando dos cámaras (superior y muñeca) y un vector de estado de 6 dimensiones. El modelo fue entrenado con el framework LeRobot en su versión 0.5.2.

SmolVLA es una arquitectura compacta y eficiente de visión-lenguaje-acción que ofrece un rendimiento competitivo con un coste computacional reducido, lo que permite su despliegue en hardware de consumo. Este checkpoint concreto cuenta con 450 millones de parámetros y ha sido ajustado con un dataset propio de 29 episodios y 12.745 fotogramas a 30 FPS. La licencia Apache 2.0 permite su uso comercial sin restricciones.

El modelo se publica con el pipeline de robótica de HuggingFace y está diseñado para integrarse directamente con el ecosistema LeRobot, tanto para ejecutar políticas preentrenadas como para entrenar nuevas variantes a partir del modelo base. Es relevante porque demuestra el flujo completo de fine-tuning de un VLA compacto para una tarea robótica específica con datos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, no de lenguaje general) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-language-action que combina un codificador visual, un modelo de lenguaje y un cabezal de accion para convertir observaciones multimodales (imagenes y estado del robot) en comandos de actuacion. La arquitectura esta disenada para ser compacta y eficiente, permitiendo inferencia en hardware de consumo, a diferencia de modelos VLA mas grandes como OpenVLA o RT-2. El modelo base `lerobot/smolvla_base` fue preentrenado y posteriormente fine-tuneado para esta tarea especifica.

El entrenamiento se realizo con el framework LeRobot (version 0.5.2) sobre el dataset `seungjinyoo1/pick_and_place_20260902_135749_after_delete`, que contiene 29 episodios y 12.745 fotogramas a 30 FPS. La configuracion de entrenamiento incluye 20.000 pasos, batch size de 8, optimizador AdamW, learning rate de 0,0001 y semilla 1000. El modelo fue entrenado con dos camaras (`top` y `wrist`) que generan tres entradas visuales (camera1, camera2 y camera3), todas a resolucion 256x256, junto con un vector de estado de 6 dimensiones. La salida es un vector de accion de 6 dimensiones.

## Capacidades

- Ejecucion de la tarea de pick_and_place con robot tipo `so_follower`.
- Procesamiento de entradas visuales de dos camaras (superior y muñeca) a 256x256.
- Fusion de informacion visual y de estado (6 dimensiones) para generar acciones.
- Control de actuacion en 6 grados de libertad.
- Integracion nativa con el ecosistema LeRobot para rollout y entrenamiento.
- Inferencia en hardware de consumo gracias a la arquitectura compacta de SmolVLA.

## Casos de uso

- Automatizacion de tareas de recoger y colocar en lineas de montaje: el modelo puede controlar un brazo robotico tipo `so_follower` para trasladar objetos de una posicion a otra, con supervision visual de dos camaras.
- Prototipado rapido de politicas roboticas: dado que se entrena con solo 29 episodios, sirve como punto de partida para validar el flujo de trabajo de LeRobot antes de escalar a datasets mayores.
- Investigacion en aprendizaje por imitacion: permite estudiar el comportamiento de un VLA compacto fine-tuneado con datos limitados, comparando su rendimiento con el modelo base.
- Desarrollo de aplicaciones educativas de robotica: al ser Apache 2.0 y ejecutable en hardware de consumo, es adecuado para laboratorios docentes que necesiten una politica funcional de pick_and_place.
- Base para fine-tuning adicional: el checkpoint puede servir como inicializacion para tareas similares con nuevas demostraciones, reduciendo el tiempo de entrenamiento.
- Evaluacion de pipelines de robotica en el Hub de HuggingFace: demuestra el flujo completo de publicacion de politicas con LeRobot, desde el dataset hasta el despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion: "No evaluation results have been provided for this policy yet". No se dispone de datos de tasa de exito en robot real, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero por el tamano del modelo (450M parametros) se estima que cabe en GPUs consumer con al menos 8 GB de VRAM en precision FP16.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090).
- Si cabe en consumer GPU: si, es uno de los objetivos de SmolVLA.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte para GPU via `--policy.device=cuda`.
- Latencia y throughput estimados: no disponibles. Dependen de la GPU y de la resolucion de las camaras de entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (smolvla fine-tuned) | 450M | VLA compacto | no disponible | Apache 2.0 | HuggingFace |
| lerobot/smolvla_base | 450M | VLA compacto | no disponible | Apache 2.0 | HuggingFace |
| OpenVLA (7B) | 7B | VLA grande | no disponible | MIT | HuggingFace |
| RT-2 (55B) | 55B | VLA grande | no disponible | no disponible | no publico |

La comparativa se limita a modelos VLA de robotica. Este checkpoint es un fine-tuning del modelo base SmolVLA, por lo que su rendimiento depende del dataset de entrenamiento. OpenVLA y RT-2 son modelos mucho mas grandes, con mayores requisitos de hardware, mientras que SmolVLA se distingue por su eficiencia y despliegue en hardware de consumo.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido: solo 29 episodios y 12.745 fotogramas, lo que limita la generalizacion a variaciones en la posicion de objetos, iluminacion o distracciones.
- Sin resultados de evaluacion publicados: no se ha verificado la tasa de exito en robot real, por lo que el rendimiento real es desconocido.
- Tarea unica: el modelo solo ha sido entrenado para la tarea "pick_and_place"; no es generalista ni soporta otras tareas sin reentrenamiento.
- Dependencia del hardware especifico: el modelo fue entrenado con un robot `so_follower` y dos camaras concretas; usarlo con otros robots o configuraciones de camaras requiere reentrenamiento o adaptacion.
- Sin soporte de lenguaje natural: al ser un modelo de robotica puro, no acepta instrucciones en lenguaje natural ni genera texto.
- Riesgo de sobreajuste: con tan pocos episodios, el modelo puede memorizar las demostraciones y fallar ante variaciones minimas del entorno.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/seungjinyoo1/pick_and_place_20260902_135749_after_delete_smolvla
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/seungjinyoo1/pick_and_place_20260902_135749_after_delete
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Documentacion de LeRobot sobre SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
