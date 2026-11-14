# chenproject35/act_pick-and-place-b601-hil-72ep-yaw0_hil_60ep

## Resumen

`act_pick-and-place-b601-hil-72ep-yaw0_hil_60ep` es una política de imitación para robótica real entrenada con el método Action Chunking with Transformers (ACT) y publicada mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robots físicos. El autor es el usuario `chenproject35` y el modelo está diseñado para controlar un brazo robótico de tipo `rebot_b601_follower` equipado con dos cámaras (frontal y de muñeca), resolviendo una tarea concreta de pick-and-place: coger un objeto denominado "inreach2" y colocarlo en un útil o plantilla ("jig").

ACT es un método de aprendizaje por imitación que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error acumulado y mejora la estabilidad del control. El modelo consume el estado articular de 7 dimensiones del robot y dos imágenes RGB de 480x640, y produce un vector de acción de 7 dimensiones por paso. Con 51,67 millones de parámetros, es un modelo compacto pensado para inferencia en tiempo real sobre hardware modesto.

Su relevancia es práctica: es un ejemplo reproducible de cómo entrenar y desplegar una política visuomotora con LeRobot sobre un robot de bajo coste, con dataset, configuración de entrenamiento y comando de ejecución publicados. No es un modelo de lenguaje ni un modelo fundacional generalista, sino una política especializada en una única tarea, entrenada con 72 episodios teleoperados y 74.932 frames a 30 FPS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.670.663 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; ventana de observación limitada a la historia de acciones del chunk) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural; recibe una instrucción de tarea como texto fijo en tiempo de ejecución) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT combina un backbone visual (codificador de imágenes por cámara) con un transformer que fusiona las observaciones visuales y el estado propioceptivo del robot, y un decodificador que genera un chunk de acciones futuras. Esta predicción por bloques, propuesta en el paper de Zhao et al. (2023), mitiga el problema de compounding error típico de las políticas que predicen un único paso. El modelo recibe dos cámaras (`cam_front` y `cam_wrist`) a resolución 480x640 y un vector de estado de 7 dimensiones, y emite acciones de 7 dimensiones (típicamente 6 articulaciones más pinza).

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `chenproject35/pick-and-place-b601-hil-72ep-yaw0`, compuesto por 72 episodios teleoperados (human-in-the-loop, HIL) con 74.932 frames a 30 FPS. La configuración reportada incluye 39.064 pasos de entrenamiento, batch size 32, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta el número exacto de tokens ni composición del dataset más allá de la tarea única "Pick up inreach2 and place it in the jig."; tampoco se especifica si hubo aumento de datos, regularización temporal o variantes del método.

## Capacidades

- Control visuomotor de un brazo robótico `rebot_b601_follower` con 7 grados de libertad.
- Percepción multimodal: dos cámaras RGB (frontal y de muñeca) más estado articular de 7 dimensiones.
- Predicción de chunks de acciones para ejecución suave y estable en tiempo real.
- Ejecución de una tarea concreta de pick-and-place: coger "inreach2" y depositarlo en el jig.
- Aprendizaje por imitación a partir de demostraciones teleoperadas (no requiere RL ni recompensas).
- Inferencia en bucle cerrado con la política desplegada mediante `lerobot-rollout`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües.
- No dispone de modo "thinking", visión general, audio ni generación de texto libre.

## Casos de uso

- Automatización de pick-and-place en línea de montaje: la política ejecuta de forma autónoma la secuencia de coger el objeto y colocarlo en el jig, sustituyendo la teleoperación manual en una celda de producción concreta.
- Prototipado rápido de tareas robóticas con LeRobot: sirve como plantilla reproducible para validar el pipeline completo (grabación de datos, entrenamiento, rollout) antes de escalar a otras tareas.
- Investigación en aprendizaje por imitación: permite comparar variantes de ACT, tamaños de dataset o configuraciones de entrenamiento sobre una tarea y un robot concretos.
- Benchmark interno de hardware robótico: al ser una política ligera (51,67 M parámetros), se puede usar para medir latencia y throughput de inferencia en distintas GPUs y configuraciones de cámara.
- Educación y formación: ejemplo didáctico de entrenamiento de una política visuomotora con dataset público, configuración y comando de ejecución documentados.
- Reentrenamiento para tareas análogas: el mismo pipeline (`lerobot-train` con `--policy.type=act`) permite adaptar la política a otras piezas, posiciones o útiles con nuevos datos teleoperados.
- Despliegue en robots de bajo coste: al ser un modelo pequeño y con licencia Apache 2.0, es viable en estaciones con GPUs de gama media o incluso en el borde, según la latencia requerida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se reportan tasas de éxito en robot real, número de ensayos ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 51,67 M parámetros y pesos en safetensors, el modelo es muy pequeño y cabría holgadamente en GPUs de consumo, pero no se aporta una cifra oficial.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con al menos unos pocos GB de VRAM sería suficiente, pero no hay confirmación del autor.
- ¿Cabe en GPU de consumo? Sí, por el reducido número de parámetros (51,67 M), aunque no se especifica una GPU concreta validada.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución en robot, `lerobot-train` para reentrenamiento). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La política está pensada para ejecución a 30 FPS (frecuencia del dataset), pero no se reportan medidas de latencia real.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otras políticas ACT, Diffusion Policy, VQ-BeT u otros métodos de imitación, ni con políticas entrenadas para el mismo robot `rebot_b601_follower`. Tampoco se aportan métricas que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea ("Pick up inreach2 and place it in the jig.") y un único robot (`rebot_b601_follower`); no generaliza a otras tareas, objetos o morfologías sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni ensayos en robot real, por lo que se desconoce su fiabilidad en producción.
- Dependencia de las cámaras: los nombres y la configuración de cámara (`cam_front`, `cam_wrist`, 480x640, 30 FPS) deben coincidir exactamente con los del entrenamiento; cambios de iluminación, posición o calibración pueden degradar el rendimiento.
- Dataset pequeño y de una sola tarea: 72 episodios y 74.932 frames son limitados; la política puede sobreajustar a posiciones, objetos y condiciones concretas del entorno de recogida.
- Sin soporte de lenguaje natural real: la instrucción de tarea se pasa como texto fijo en la CLI, no como entrada procesada por el modelo.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene revisar las dependencias de LeRobot y del robot físico.
- Riesgo de alucinación en el sentido robótico: como toda política de imitación, puede ejecutar acciones plausibles pero incorrectas ante distribuciones fuera de las vistas en entrenamiento (objetos nuevos, distracciones, fallos de percepción).
- Sin datos de sesgos: no se reportan análisis de sesgo, robustez ni comportamiento ante fallos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chenproject35/act_pick-and-place-b601-hil-72ep-yaw0_hil_60ep
- Dataset de entrenamiento: https://huggingface.co/datasets/chenproject35/pick-and-place-b601-hil-72ep-yaw0
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=chenproject35/pick-and-place-b601-hil-72ep-yaw0
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
