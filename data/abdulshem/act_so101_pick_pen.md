# AbdulShem/act_so101_pick_pen

## Resumen

AbdulShem/act_so101_pick_pen es una política de imitación (imitation learning) entrenada con LeRobot para el robot SO-101 (variante `so_follower`). Implementa el método Action Chunking with Transformers (ACT), descrito en el artículo arXiv:2304.13705, que en lugar de predecir una única acción por paso genera "chunks" o secuencias cortas de acciones, lo que reduce el error de composición y mejora la estabilidad en tareas de manipulación de precisión.

El modelo consume dos señales de entrada: el estado propioceptivo del brazo (`observation.state`, vector de 6 dimensiones) y dos cámaras (muñeca y cenital, ambas a 3x480x640), y produce un vector de acción de 6 dimensiones. Está especializado en una única tarea: "Pick up the pen" (coger un bolígrafo). El repositorio ocupa 0,2 GB y contiene 51.668.614 parámetros en formato safetensors, lo que lo convierte en un modelo muy ligero que puede ejecutarse en hardware modesto.

Su relevancia es doble: por un lado, es un ejemplo reproducible de entrenamiento de una política ACT con LeRobot 0.6.2 sobre un conjunto de datos teleoperado propio; por otro, sirve como referencia práctica de cómo empaquetar y publicar políticas robóticas en HuggingFace Hub. No es un modelo de lenguaje ni un modelo multimodal generalista: su ámbito es exclusivamente el control robótico de bajo nivel en un entorno y robot concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer para imitación (ACT, Action Chunking with Transformers); predice chunks de acciones |
| Parametros totales | 51.668.614 (≈51,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; consume una ventana de observaciones de estado e imagen) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin cuantizaciones documentadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la tarea está definida en inglés: "Pick up the pen") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio LeRobot) |
| Tipo de robot | `so_follower` (SO-101) |
| Entradas | `observation.state` (6,); `observation.images.wrist` (3, 480, 640); `observation.images.top` (3, 480, 640) |
| Salidas | `action` (6,) |
| Libreria | lerobot |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

La política sigue el método ACT, una técnica de aprendizaje por imitación que aprende de datos teleoperados y modela secuencias de acciones en lugar de pasos individuales. ACT emplea un esquema transformer con componentes generativos (el artículo original plantea un transformer encoder-decoder con un componente latente tipo CVAE) y produce como salida un chunk de acciones, lo que permite trayectorias más suaves y consistentes. La ventana de entrada combina el estado de las articulaciones del brazo con dos vistas de cámara (muñeca y cenital).

El entrenamiento se realizó con LeRobot 0.6.2 sobre el conjunto de datos AbdulShem/so101_pick_pen_clean: 60 episodios, 47.602 fotogramas a 30 FPS, una sola tarea ("Pick up the pen"). La configuración de entrenamiento fue de 30.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta en la model card el uso de RLHF, DPO ni ninguna fase de ajuste por preferencias, lo cual es coherente con el paradigma de imitación supervisada. No se detallan innovaciones técnicas adicionales más allá de las propias del método ACT.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para el brazo SO-101 a partir de estado y visión.
- Aprendizaje por imitación a partir de demostraciones teleoperadas: reproduce la tarea "Pick up the pen" en las condiciones observadas durante la recogida de datos.
- Predicción de chunks de acciones: emite secuencias cortas de acciones en lugar de un único paso, lo que mejora la suavidad y reduce la acumulación de error.
- Percepción visual bimodal: utiliza dos cámaras (muñeca y cenital) a resolución 480x640 y 30 FPS.
- Fusión de estado propioceptivo y visión: integra `observation.state` (6,) con las dos imágenes.
- Tool calling / function calling: no disponible (no aplica, no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingües: no disponible (no aplica).
- Capacidades especiales: no dispone de modo de razonamiento, visión generalista, audio ni otras capacidades fuera del control motor especializado.

## Casos de uso

- Automatización de una celda de pick-and-place: la política puede ejecutar la recogida de un bolígrafo (o un objeto de geometría similar en la misma posición) en un brazo SO-101, integrándose en una línea de montaje o laboratorio docente donde la tarea se repita de forma controlada.
- Banco de pruebas para docencia de robótica: dado su tamaño reducido (51,7 M de parámetros) y su licencia Apache 2.0, es adecuado como ejemplo reproducible para enseñar el flujo completo de LeRobot (grabación de datos, entrenamiento y despliegue) en cursos o talleres.
- Punto de partida para fine-tuning con datos propios: sirve como política base que se puede reentrenar con nuevos conjuntos de episodios sobre otro objeto o posición, cambiando el dataset y manteniendo la arquitectura ACT.
- Evaluación de pipeline de inferencia en hardware de bajo coste: al ser un modelo pequeño, permite validar latencias y comportamiento de bucle cerrado en GPUs de gama de entrada o incluso en CPU/SoC embebido antes de escalar a modelos mayores.
- Investigación en imitation learning: útil como baseline ACT entrenado con un dataset pequeño (60 episodios) para comparar contra otros métodos de política (por ejemplo, diffusion policy) en igualdad de condiciones.
- Demostración de publicación de políticas en el Hub: el repositorio ilustra el flujo `lerobot-train` / `lerobot-rollout` y el versionado de políticas en HuggingFace, útil para equipos que quieran estandarizar su gestión de artefactos de robótica.
- Pruebas de robustez ante variaciones de iluminación y posición: al estar limitado a una tarea y a dos vistas fijas, permite medir empíricamente la sensibilidad de una política ACT a cambios de entorno controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con la indicación explícita de que no se han proporcionado resultados para esta política, por lo que se desconoce la tasa de éxito en la tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros en precisión completa el modelo ocupa del orden de 0,2 GB, por lo que la inferencia cabe holgadamente en menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna es suficiente; se puede ejecutar en RTX 3060/4060, RTX 4090, A100 o H100 sin que el modelo represente un cuello de botella.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo e incluso en plataformas integradas tipo Jetson Orin Nano; también es viable ejecutarlo en CPU, aunque con mayor latencia.
- Opciones de despliegue: LeRobot mediante el comando `lerobot-rollout` con `--policy.path=AbdulShem/act_so101_pick_pen`. No se documenta compatibilidad explícita con vLLM, TGI, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Hardware robótico necesario: brazo SO-101 (`so_follower`) y dos cámaras configuradas a 640x480 y 30 FPS, con nombres que deben coincidir con las claves de observación del entrenamiento (`observation.images.wrist` y `observation.images.top`).
- Latencia y throughput estimados: no disponible. La única referencia práctica es que el `lerobot-rollout` del ejemplo se lanza con `--duration=60`, lo que implica una ejecución de 60 segundos en la demostración, sin cifras de latencia por inferencia publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AbdulShem/act_so101_pick_pen | ACT (LeRobot) | 51,7 M | Estado (6,) + 2 camaras 480x640 | apache-2.0 | HuggingFace Hub |
| Otras politicas ACT de LeRobot (por ejemplo, las publicadas por el propio proyecto lerobot) | ACT (LeRobot) | no disponible | Variable segun robot y camaras | habitualmente apache-2.0 | HuggingFace Hub |
| Diffusion Policy (implementada tambien en LeRobot) | Politica generativa basada en difusion | no disponible | Variable segun configuracion | no disponible | GitHub / HuggingFace |
| SmolVLA (HuggingFace) | Vision-Language-Action | no disponible en la informacion proporcionada | Imagenes + instruccion en lenguaje natural | no disponible en la informacion proporcionada | HuggingFace Hub |

Nota: no se dispone de datos verificados de parametros, contexto o rendimiento de las alternativas en la informacion proporcionada, por lo que la comparacion debe tratarse como orientativa en cuanto a categoria y no en cuanto a cifras.

## Limitaciones y advertencias

- Especializacion extrema: la política está entrenada exclusivamente para la tarea "Pick up the pen" en un objeto y entorno concretos; no generaliza a otras tareas ni a otros objetos sin reentrenamiento o fine-tuning.
- Sin resultados de evaluacion: la model card no reporta tasa de éxito ni pruebas en robot real, por lo que no hay evidencia publicada de su fiabilidad.
- Dependencia del montaje fisico: los nombres y la configuracion de las camaras deben coincidir exactamente con las claves de observacion del entrenamiento (`wrist` y `top`); un montaje distinto puede degradar o invalidar el comportamiento.
- Sensibilidad al dominio visual: cambios de iluminacion, fondo, posicion del objeto o disposicion de las camaras respecto al dataset original pueden reducir el rendimiento, ya que el conjunto de entrenamiento es reducido (60 episodios, 47.602 fotogramas).
- Riesgo de sobreajuste al dataset: con solo 60 episodios y una unica tarea, la diversidad de situaciones cubierta es limitada.
- Sesgos conocidos: no disponibles; no se documenta ningun analisis de sesgos, que en robótica se traduciria en limitaciones de generalizacion a distintas condiciones fisicas.
- Riesgo de alucinacion: no aplica en el sentido de generacion de lenguaje, pero existe el riesgo de que la politica genere acciones incorrectas o inseguras si la observacion se sale de la distribucion de entrenamiento.
- Seguridad fisica: al controlar un brazo robotico real, es imprescindible supervisar la ejecucion y disponer de parada de emergencia; el modelo no incorpora garantias de seguridad ni deteccion de colisiones.
- Licencia: apache-2.0, que permite uso comercial y modificacion, siempre que se conserven los avisos de licencia y se cumplan las condiciones de atribucion. Conviene citar tambien el articulo ACT y LeRobot segun indica la model card.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AbdulShem/act_so101_pick_pen
- Dataset de entrenamiento: https://huggingface.co/datasets/AbdulShem/so101_pick_pen_clean
- Articulo ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos (cheat-sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=AbdulShem/so101_pick_pen_clean
