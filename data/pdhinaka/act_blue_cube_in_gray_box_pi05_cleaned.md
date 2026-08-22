# pdhinaka/act_blue_cube_in_gray_box_pi05_cleaned

## Resumen

El modelo `pdhinaka/act_blue_cube_in_gray_box_pi05_cleaned` es una política de control robótico entrenada mediante aprendizaje por imitación con el método ACT (Action Chunking with Transformers). Desarrollado por el usuario pdhinaka, está diseñado para ejecutar la tarea de coger un cubo azul y colocarlo en una caja gris, operando sobre el robot `so_follower` con dos cámaras (muñeca y superior). El modelo se ha entrenado y publicado con la librería LeRobot de Hugging Face, que facilita el entrenamiento y despliegue de políticas robóticas.

Con 51,6 millones de parámetros, esta política procesa observaciones visuales y de estado del robot para generar acciones de control de 6 dimensiones. Su relevancia radica en que demuestra el uso práctico de ACT sobre un dataset real de 50 episodios teleoperados, ofreciendo un ejemplo reproducible para la comunidad de robótica de código abierto. El modelo está disponible bajo licencia Apache-2.0 y los pesos se almacenan en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.617.414 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de pasos individuales, lo que mejora la estabilidad y precisión en tareas de manipulación. La política procesa dos imágenes de alta resolución (480x640) y un vector de estado del robot de 6 dimensiones, y genera un chunk de acciones de 6 dimensiones. El entrenamiento se realizó sobre un dataset de 50 episodios teleoperados, con un total de 18.736 frames a 30 FPS, recopilados con el robot `so_follower` y dos cámaras (`wrist_cam` y `top_cam`).

La configuración de entrenamiento incluye 25.000 pasos, batch de 8, optimizador AdamW con una tasa de aprendizaje de 1e-5 y semilla 1000. Se usó la versión 0.6.2 de LeRobot. No se reporta el uso de técnicas adicionales como RLHF o DPO, ya que es un método de imitación supervisada.

## Capacidades

- Genera acciones de control de 6 dimensiones para el robot `so_follower` basadas en imágenes y estado del robot.
- Procesa imágenes de dos cámaras (muñeca y superior) a resolución 480x640.
- Maneja la tarea específica de coger un cubo azul y colocarlo en una caja gris, aprendida a partir de demostraciones teleoperadas.
- Utiliza el mecanismo de action chunking para predecir secuencias de acciones, lo que mejora la suavidad del movimiento.
- Es compatible con el ecosistema LeRobot, permitiendo su ejecución mediante el comando `lerobot-rollout`.
- No incluye capacidades de visión más allá de las imágenes de entrada, ni soporte de tool calling o agentes.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos industriales: el modelo puede controlar un robot para recoger objetos de posiciones conocidas y depositarlos en contenedores, gracias a su entrenamiento específico.
- Prototipado de políticas de imitación con LeRobot: sirve como punto de partida para entrenar nuevas tareas mediante fine-tuning, ya que la arquitectura ACT es fácilmente reentrenable.
- Investigación en aprendizaje por imitación: permite estudiar el comportamiento de ACT en una tarea de manipulación con dos cámaras, comparando configuraciones de datos y hiperparámetros.
- Demostraciones educativas en robótica: su uso en entornos académicos para enseñar el flujo completo de entrenamiento y despliegue de políticas robóticas.
- Base para transferencia de tareas: aunque está entrenado para una tarea concreta, puede servir como inicialización para otras tareas de pick-and-place con pocas demostraciones adicionales.
- Evaluación de robustez en entornos controlados: permite probar el comportamiento del modelo ante variaciones de iluminación, posición del objeto o del robot, siempre que se mantenga la misma configuración de cámaras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no se proporcionan resultados de evaluación en robot real, por lo que no hay datos de tasa de éxito ni comparaciones con otros métodos.

## Requisitos de hardware

- VRAM estimada: no se especifica, pero al ser un modelo de 51,6 M de parámetros, la inferencia puede ejecutarse en GPUs con al menos 2 GB de VRAM, aunque se recomienda al menos 4 GB para una operación cómoda.
- GPU recomendada: cualquier GPU NVIDIA con soporte CUDA (por ejemplo, GTX 1060 o superior), aunque también es posible ejecutar en CPU para pruebas lentas.
- En consumer GPU: sí, cabe en la mayoría de las tarjetas actuales, incluso integradas, pero la inferencia en tiempo real requiere una GPU dedicada.
- Opciones de despliegue: LeRobot ofrece comandos CLI (`lerobot-rollout`) y soporte para ejecución en Python con PyTorch. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles; la latencia dependerá del hardware y de la resolución de entrada, pero se espera que sea baja dado el tamaño del modelo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables dentro del ecosistema LeRobot para la misma tarea. El autor tiene otro modelo (`pdhinaka/act_pick_blue_cube_gray_box_policy`) que parece similar, pero no se han proporcionado detalles comparativos. Por tanto, no se puede realizar una comparativa objetiva.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para una tarea concreta: «coger el cubo azul y colocarlo en la caja gris». No generaliza a otras tareas ni a variaciones en la posición de los objetos o el entorno.
- Requiere el mismo robot y configuración de cámaras (`so_follower`, `wrist_cam` y `top_cam`) para funcionar correctamente. Cambiar la disposición o el tipo de cámara invalidará la política.
- No hay resultados de evaluación reportados, por lo que se desconoce su tasa de éxito en el mundo real y su robustez ante perturbaciones.
- El modelo se basa en demostraciones teleoperadas; si las demostraciones contienen errores o sesgos, la política los heredará.
- No se han documentado sesgos ni riesgos de alucinación, pero al ser un modelo de control, cualquier error en la predicción de acciones puede causar movimientos inesperados del robot.
- Para uso comercial, la licencia Apache-2.0 permite su uso, pero el robot y el entorno físico deben cumplir con las especificaciones del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pdhinaka/act_blue_cube_in_gray_box_pi05_cleaned
- Dataset de entrenamiento: https://huggingface.co/datasets/pdhinaka/so101_blue_cube_in_gray_box_pi05_cleaned
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
