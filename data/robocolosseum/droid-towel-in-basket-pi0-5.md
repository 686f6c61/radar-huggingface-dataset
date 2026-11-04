# RoboColosseum/droid-towel-in-basket-pi0.5

## Resumen

droid-towel-in-basket-pi0.5 es un fine-tuning de política robótica del modelo visión-lenguaje-acción π₀.₅ (Pi05) de Physical Intelligence, publicado por RoboColosseum a través de la librería LeRobot de Hugging Face. El modelo parte del checkpoint base `lerobot/pi05_base` y se ha especializado en una única tarea de manipulación sobre un brazo Franka: colocar una toalla en una cesta ("towel in basket"). No es un modelo de lenguaje general, sino una política de imitación que consume observaciones multimodales (estado articular, posición cartesiana y tres flujos de cámara) y emite comandos de acción de 8 dimensiones.

El modelo resuelve el problema de transferir un modelo fundacional de robótica a un entorno y una tarea concretos mediante aprendizaje por imitación supervisado. Con 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y pesos en formato safetensors, el repositorio ocupa 9,4 GB. La relevancia actual radica en que demuestra el flujo típico de adaptación de políticas VLA preentrenadas a tareas específicas con pocos datos (100 episodios, 27.395 fotogramas a 30 FPS) usando la infraestructura abierta de LeRobot.

La licencia Apache 2.0 y la disponibilidad de los scripts de entrenamiento e inferencia hacen que el modelo sea reproducible y reutilizable, aunque su aplicabilidad fuera de la tarea y el robot para los que fue entrenado es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π₀.₅ (Pi05), implementación LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | Franka |
| Entradas | observation.state (8,), observation.cartesian_position (6,), observation.images.left_image (3, 360, 640), observation.images.wrist (3, 360, 640), observation.images.empty_camera_0 (3, 224, 224) |
| Salidas | action (8,) |
| Tamano del repositorio | 9,4 GB |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de π₀.₅, la evolución del modelo VLA π₀ de Physical Intelligence orientada a la generalización en entornos abiertos. La arquitectura combina un codificador visual y de lenguaje con un cabezal de acciones que genera comandos motores continuos; la implementación concreta disponible en este repositorio es la de LeRobot, adaptada del repositorio OpenPI del autor original. El modelo consume tres flujos de imagen (cámara izquierda, cámara de muñeca y una tercera cámara etiquetada como `empty_camera_0` a resolución 224x224), además del estado articular de 8 dimensiones y la posición cartesiana de 6 dimensiones, y produce un vector de acción de 8 dimensiones.

El entrenamiento se realizó por imitación supervisada sobre el dataset `local/droid-towel-in-basket-left-wrist`, compuesto por 100 episodios y 27.395 fotogramas capturados a 30 FPS para la tarea "towel in basket". La configuración reportada incluye 8.570 pasos de entrenamiento, tamaño de lote 32, optimizador AdamW, tasa de aprendizaje 2,5e-05, semilla 1000 y LeRobot versión 0.6.1. No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación posteriores al preentrenamiento, ni la composición exacta del corpus original de π₀.₅.

## Capacidades

- Control robótico de manipulación: genera comandos de acción continua de 8 dimensiones para un brazo Franka a partir de observaciones visuales y proprioceptivas.
- Percepción multimodal: procesa simultáneamente tres cámaras (vista izquierda, vista de muñeca y una tercera vista) junto con el estado articular y la posición cartesiana.
- Ejecución de una tarea específica de pick-and-place: colocar una toalla en una cesta.
- Aprendizaje por imitación: reproducible y reentrenable con el comando `lerobot-train` sobre el modelo base.
- Despliegue en robot real: soporta ejecución mediante `lerobot-rollout` con estrategia `base`.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, generación de texto libre ni procesamiento de audio.
- Capacidades multilingües: no disponibles (el modelo no es un modelo de lenguaje de propósito general).

## Casos de uso

- Automatización de una celda de pick-and-place textil: el modelo puede ejecutar de forma autónoma la tarea de depositar una toalla en una cesta sobre un Franka, usando las tres cámaras para localizar el objeto y la cesta y el estado articular para el control.
- Base para fine-tuning en tareas de manipulación similares: al estar construido sobre `lerobot/pi05_base` y seguir el flujo estándar de LeRobot, sirve como punto de partida para reentrenar con nuevos datasets de 100 episodios o más.
- Investigación en aprendizaje por imitación: permite reproducir un experimento completo de extremo a extremo (grabación de datos, entrenamiento, rollout) con hiperparámetros documentados y semilla fija.
- Evaluación de políticas VLA en entornos controlados: útil para comparar el rendimiento de π₀.₅ frente a otras políticas sobre una tarea acotada y medir tasas de éxito.
- Docencia y formación en robótica: el repositorio incluye comandos de instalación, calibración de hardware y ejecución que facilitan el uso en cursos prácticos.
- Pruebas de integración de LeRobot 0.6.1: sirve como referencia para validar pipelines de entrenamiento e inferencia con la versión concreta de la librería.
- Prototipado de tareas de manipulación con múltiples cámaras: el modelo demuestra cómo configurar tres flujos visuales y mapear sus claves de observación a las cámaras reales del robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4,14 mil millones de parámetros, una estimación en precisión de 16 bits rondaría los 8-9 GB solo para pesos, a los que habría que sumar el coste de los tres flujos de imagen y del codificador visual.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cabría esperar GPUs de gama alta (A100, H100) o consumer de gama alta (RTX 4090), pero no se confirma.
- Compatibilidad con GPU consumer: no confirmada; el tamaño de pesos en fp16 sugiere que una GPU con 16 GB o más podría ser suficiente, pero no hay datos oficiales.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento), con soporte de CUDA (`--policy.device=cuda`).
- Latencia y throughput: no disponibles.
- Requisitos adicionales: robot Franka real, tres cámaras configuradas con OpenCV a 30 FPS y nombres de cámara que coincidan con las claves de observación del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoboColosseum/droid-towel-in-basket-pi0.5 | 4,14 mil millones | VLA (π₀.₅ fine-tuned) | Towel in basket (Franka) | Apache 2.0 | Hugging Face |
| lerobot/pi05_base | no disponible | VLA (π₀.₅ base) | Modelo fundacional, fine-tuning | no disponible en la informacion | Hugging Face |
| tsangb34/pi05-droid-towel-in-basket-10ep | no disponible | VLA (π₀.₅ fine-tuned) | Towel in basket (Franka) | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada. La comparativa se limita a parámetros, tipo y licencia cuando están documentados.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo ha sido entrenado para la tarea "towel in basket" sobre un robot Franka con una configuración de cámaras concreta; no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni resultados de robot real, por lo que se desconoce su fiabilidad en producción.
- Dependencia del hardware: requiere un Franka, tres cámaras con nombres e índices específicos y una configuración de calibración concreta; cualquier cambio en la disposición de cámaras puede degradar el rendimiento.
- Riesgo de sobreajuste: con solo 100 episodios y 8.570 pasos de entrenamiento, es probable que el modelo se ajuste a las posiciones, iluminación y objetos vistos en el dataset.
- Sesgos: no documentados, pero al derivar de un dataset limitado y de un modelo base preentrenado, puede heredar sesgos visuales y de manipulación del corpus original.
- Alucinación: en el contexto robótico, se traduce en acciones incorrectas o inseguras; no hay mecanismos de seguridad documentados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base `lerobot/pi05_base` y el modelo original π₀.₅ de Physical Intelligence pueden tener condiciones adicionales que no se detallan en este repositorio.
- Idiomas: no aplica como modelo de lenguaje; las instrucciones de tarea se pasan como texto fijo ("towel in basket").
- Advertencia de producción: no se recomienda su uso en entornos reales sin una validación exhaustiva y medidas de seguridad físicas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/RoboColosseum/droid-towel-in-basket-pi0.5)
- [Modelo base lerobot/pi05_base](https://huggingface.co/lerobot/pi05_base)
- [Blog de π₀.₅ de Physical Intelligence](https://www.physicalintelligence.company/blog/pi05)
- [Repositorio OpenPI](https://github.com/Physical-Intelligence/openpi)
- [LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Guía de LeRobot para pi05](https://huggingface.co/docs/lerobot/main/en/pi05)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Instalación de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
- [Guía de hardware](https://huggingface.co/docs/lerobot/main/en/hardware_guide)
- [Grabación de datos y entrenamiento de políticas](https://huggingface.co/docs/lerobot/en/il_robots)
- [Referencia rápida de comandos](https://huggingface.co/docs/lerobot/main/en/cheat-sheet)
- [Documentación de inferencia y rollout](https://huggingface.co/docs/lerobot/main/en/inference)
- [Dataset local/droid-towel-in-basket-left-wrist](https://huggingface.co/datasets/local/droid-towel-in-basket-left-wrist)
- [Visualizador de datasets de LeRobot](https://huggingface.co/spaces/lerobot/visualize_dataset?path=local/droid-towel-in-basket-left-wrist)
