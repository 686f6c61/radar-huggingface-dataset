# RoboCrafty/smolvla_rebot_merged

## Resumen

SmolVLA ReBot es un modelo visión-lenguaje-acción (VLA) compacto desarrollado por RoboCrafty mediante ajuste fino del modelo base `lerobot/smolvla_base` de Hugging Face. Está especializado en tareas de manipulación robótica de tipo "pick and place" sobre un robot concreto, el `rebot_b601_follower`, equipado con tres cámaras. El modelo consume el estado de las articulaciones y tres flujos de imagen de 256×256 píxeles, y produce un vector de acción de 7 dimensiones que controla al robot en tiempo real.

La relevancia de este modelo radica en su tamaño reducido: 450 millones de parámetros, lo que lo sitúa en la categoría de modelos desplegables en hardware de consumo. Se trata de un ajuste fino de imitación supervisada sobre un dataset propio de 127 episodios y 77.631 fotogramas grabados a 30 FPS, orientado a tres tareas de clasificación y depósito de objetos (botella, toalla y llave). El modelo hereda la arquitectura y filosofía de SmolVLA, presentada en el paper arXiv:2506.01844, que propone políticas VLA eficientes para robótica de bajo coste.

Este checkpoint concreto tiene un alcance muy delimitado: no es un modelo de propósito general, sino una política entrenada para un robot y un conjunto de tareas específicos. Su valor práctico depende de que el usuario disponga del mismo tipo de robot y de un entorno similar al del dataset de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA), transformer multimodal con codificador visual y cabeza de acciones |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; entrada compuesta por estado y 3 imágenes) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot (versión 0.6.1 en entrenamiento) |
| Tamaño del repositorio | 0,9 GB |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | rebot_b601_follower |
| Cámaras | front_wide, gripper, high_oblique |
| Entrada de estado | observation.state, shape (6,) |
| Entrada visual | 3 × (3, 256, 256) |
| Salida de acción | action, shape (7,) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLA descrita en el paper arXiv:2506.01844: una política visión-lenguaje-acción compacta que combina un codificador visual para procesar las imágenes de cámara con un componente de lenguaje y una cabeza de predicción de acciones. El modelo consume tres cámaras simultáneas (vista frontal amplia, vista de la pinza y vista oblicua elevada) junto con el estado de 6 dimensiones de las articulaciones, y emite un vector de acción de 7 dimensiones. Con 450 millones de parámetros, está diseñado explícitamente para ejecutarse en hardware de consumo, en contraste con políticas VLA de mayor tamaño.

El ajuste fino se realizó sobre el dataset `RoboCrafty/rebot_sort_merged`, compuesto por 127 episodios y 77.631 fotogramas a 30 FPS, con tres tareas de manipulación: recoger una botella, una toalla o una llave y depositarlos en el contenedor designado. La configuración de entrenamiento incluye 20.000 pasos, batch size de 128, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000, todo ello mediante LeRobot 0.6.1. Se trata de aprendizaje por imitación supervisada a partir de demostraciones, no de un entrenamiento con RLHF o DPO.

## Capacidades

- Generación de acciones de control robótico de 7 dimensiones a partir de observaciones multimodales (estado articular y tres cámaras).
- Percepción visual multi-cámara: procesa simultáneamente vistas frontal, de pinza y oblicua para localizar objetos y planificar la manipulación.
- Ejecución de tareas de pick and place sobre tres categorías de objeto: botella, toalla y llave.
- Control en bucle cerrado a 30 FPS, sincronizado con la frecuencia de grabación del dataset.
- Especialización en un robot concreto (`rebot_b601_follower`) con una configuración de cámaras y cinemática determinadas.
- No dispone de tool calling, function calling ni capacidades de agente multi-paso en el sentido de los LLM.
- No dispone de capacidades multilingües ni de generación de texto libre.

## Casos de uso

- Clasificación automatizada de objetos en líneas de montaje: el modelo puede recoger botellas, toallas o llaves y depositarlas en el contenedor correcto, aprovechando las tres vistas de cámara para discriminar el objeto y planificar la trayectoria de agarre.
- Automatización de tareas de recogida en almacenes ligeros: con 450 M de parámetros y un repositorio de 0,9 GB, puede desplegarse en una estación de trabajo con GPU de consumo junto al robot, reduciendo el coste de infraestructura frente a políticas VLA de mayor tamaño.
- Prototipado rápido de políticas de imitación: sirve como punto de partida para ajustar el modelo a nuevas tareas del mismo robot, ya que el flujo de entrenamiento con `lerobot-train` y el modelo base `lerobot/smolvla_base` está documentado.
- Investigación en aprendizaje por imitación con datasets pequeños: los 127 episodios y 77.631 fotogramas del dataset permiten estudiar la relación entre volumen de demostraciones y éxito en tareas de manipulación con modelos compactos.
- Demostraciones educativas de robótica VLA: el tamaño reducido y la licencia Apache 2.0 facilitan su uso en cursos y laboratorios donde se enseña a entrenar y desplegar políticas visión-lenguaje-acción.
- Evaluación comparativa de políticas VLA en hardware de consumo: permite medir latencia y throughput de un modelo de 450 M de parámetros en GPUs consumer frente a alternativas mayores, en un entorno robótico controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 450 M de parámetros en safetensors (aproximadamente 1,8 GB en FP32 o 0,9 GB en FP16), la inferencia cabe holgadamente en GPUs de consumo, aunque el consumo exacto depende del runtime de LeRobot.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente; el modelo base SmolVLA se describe como desplegable en hardware de consumo.
- Compatibilidad con GPU de consumo: sí, por el tamaño del modelo (450 M de parámetros) y el repositorio de 0,9 GB.
- Opciones de despliegue: LeRobot mediante el comando `lerobot-rollout` con `--policy.path=RoboCrafty/smolvla_rebot_merged`; el entrenamiento se realiza con `lerobot-train`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El modelo está pensado para operar a 30 FPS, la frecuencia del dataset de entrenamiento, pero no se publican mediciones de latencia real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoboCrafty/smolvla_rebot_merged | 450 M | Estado (6,) + 3 imágenes 256×256 | Pick and place en rebot_b601_follower | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible en la información | Entrada VLA multimodal | Política VLA base, ajustable por imitación | no disponible en la información | Hugging Face |
| Otras políticas VLA de gran tamaño (p. ej. familias tipo OpenVLA) | no disponible en la información | no disponible | Manipulación robótica general | no disponible | no disponible |

La comparación se limita al modelo base del que deriva, ya que la información proporcionada no incluye datos de benchmarks ni especificaciones de alternativas directas. No se dispone de cifras de rendimiento comparables.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para el robot `rebot_b601_follower` y una configuración de tres cámaras concreta; no es transferible sin ajuste fino a otros robots o disposiciones de sensores.
- Las tareas cubiertas se limitan a tres objetos (botella, toalla, llave) y a la instrucción de depositarlos en el contenedor designado; fuera de ese dominio se espera un rendimiento degradado.
- No se han publicado resultados de evaluación en robot real, por lo que no existe evidencia cuantificada de tasa de éxito.
- El dataset de entrenamiento es pequeño (127 episodios, 77.631 fotogramas), lo que aumenta el riesgo de sobreajuste a posiciones, iluminación y fondos concretos.
- No se documentan sesgos específicos, pero al ser un modelo visual hereda los sesgos de los datos de demostración y del modelo base.
- Riesgo de alucinación en el sentido de predicción de acciones no válidas o inseguras ante observaciones fuera de distribución; se recomienda supervisión y límites de seguridad en el robot.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las licencias del modelo base y de los datos subyacentes.
- No se especifican requisitos de seguridad física ni protocolos de parada de emergencia; en producción deben implementarse de forma independiente al modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RoboCrafty/smolvla_rebot_merged
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/RoboCrafty/rebot_sort_merged
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=RoboCrafty/rebot_sort_merged
