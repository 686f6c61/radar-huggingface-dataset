# IntelligentDecisionLab/xlerobot-coffee-model-real-smolvla-baseline

## Resumen

El modelo `xlerobot-coffee-model-real-smolvla-baseline` es una política de control robótico basada en SmolVLA, un modelo de visión-lenguaje-acción (VLA) de 450 millones de parámetros desarrollado por Hugging Face. Este repositorio concreto, publicado por el IntelligentDecisionLab (AS-CITI), forma parte del estudio *X-Lerobot Coffee Automata*, cuyo objetivo es comparar distintas familias de políticas para manipulación robótica con realimentación de fuerza. El modelo se entrena exclusivamente con visión (dos cámaras) y sin ningún canal de fuerza, sirviendo como referencia para aislar la contribución del método (ACT frente a SmolVLA) de la del backbone.

Se trata de un fine-tuning del checkpoint base `lerobot/smolvla_base` sobre un dataset real de un brazo XLeRobot de 17 grados de libertad (DoF) en tareas de preparación de café. El modelo se entrena con hiperparámetros por defecto, sin ajuste fino adicional, para que actúe como una línea base honesta. El repositorio contiene cinco carpetas, cada una correspondiente a un "rung" (escalón) de dificultad creciente en la tarea, con checkpoints intermedios cada 25.000 pasos y el checkpoint final de 100.000 pasos.

La relevancia actual reside en que SmolVLA es una arquitectura ligera (450M) frente a otros VLA masivos, y este estudio evalúa su comportamiento en datos reales de robótica con un presupuesto de entrenamiento fijo, comparándolo con métodos ACT que incorporan información de fuerza. El modelo está disponible bajo licencia Apache 2.0 y su formato de pesos es safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLM2-500M-Video-Instruct backbone + action expert (SmolVLA) |
| Parametros totales | 450 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repositorio con safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (el backbone SmolVLM2 es multilingüe, pero no se especifica para este modelo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual congelado (SmolVLM2-500M-Video-Instruct) y un *action expert* entrenado para predecir acciones robóticas. En este caso, el modelo se fine-tunea desde `lerobot/smolvla_base` con los hiperparámetros por defecto: `chunk_size` de 50, `n_action_steps` de 50, batch de 8, 100.000 pasos de entrenamiento, seed 1000, optimizador AdamW con learning rate 1e-4, y el codificador visual congelado (solo se entrena el *action expert*). Las imágenes de las dos cámaras (cabeza y muñeca derecha) se redimensionan a 512×512 con padding y se asignan a las ranuras `camera1` y `camera2` que espera el checkpoint base; la tercera ranura se rellena con ceros (`empty_cameras=1`). El estado y las acciones del robot (17-DoF) se proyectan en los espacios de 32 dimensiones que usa SmolVLA.

El entrenamiento se realiza sobre el dataset real `IntelligentDecisionLab/xlerobot-coffee-real-2cam`, que contiene demostraciones de tareas de manipulación de tazas en una máquina de café automática. No se aplica ningún canal de fuerza, ni en la entrada ni en la pérdida. Los cinco rungs (`t1`, `t3`, `t5`, `g35`, `g135`) representan sub-tareas de dificultad creciente, y cada carpeta del repositorio contiene un `pretrained_model` completo con el checkpoint final y un barrido de checkpoints intermedios cada 25.000 pasos para comparar la evolución del entrenamiento con los métodos ACT.

## Capacidades

- Control robótico de un brazo XLeRobot de 17 grados de libertad mediante visión (dos cámaras).
- Ejecución de tareas de manipulación de objetos (tazas) en un entorno real de máquina de café automática.
- Generación de secuencias de acciones de 50 pasos (chunk size 50) a partir de observaciones visuales y del estado del robot.
- Predicción de acciones en espacio de 32 dimensiones, proyectadas desde el estado de 17-DoF.
- Capacidad de operar con dos cámaras simultáneas (cabeza y muñeca), con una tercera ranura de cámara vacía.
- No incluye soporte de *tool calling*, agentes conversacionales ni razonamiento de lenguaje general; es exclusivamente una política de control.

## Casos de uso

- **Manipulación de tazas en máquinas de café automáticas**: el modelo puede ejecutar la sub-tarea `t1_place_cup` (colocar la taza en la posición designada) a partir de imágenes de las cámaras y del estado articular del brazo.
- **Transferencia de objetos entre superficies**: las sub-tareas `t3_cup_to_tray` y `t5_tray_to_table` implican mover una taza desde una bandeja a la mesa, lo que permite evaluar la destreza del modelo en cambios de referencia espacial.
- **Estudio comparativo de arquitecturas de control**: al ser una línea base sin canal de fuerza, sirve para aislar la influencia del backbone (SmolVLA) frente a los métodos ACT con realimentación de fuerza en el mismo conjunto de datos y presupuesto de entrenamiento.
- **Evaluación de generalización entre tareas**: los rungs compartidos `g35` y `g135` agrupan varias sub-tareas, permitiendo probar si el modelo puede manejar variaciones dentro de una misma familia de manipulaciones.
- **Investigación en aprendizaje por imitación con VLA ligeros**: con solo 450M de parámetros, el modelo es adecuado para estudiar el rendimiento de VLA de bajo coste en robots reales de 17 DoF, sin necesidad de infraestructura masiva.
- **Validación de checkpoints intermedios**: los checkpoints cada 25.000 pasos permiten analizar la dinámica de entrenamiento y comparar la convergencia con otros métodos, útil para estudios de ablación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay evaluación sobre el robot todavía: "Training loss is not task success, and SmolVLA's loss is not comparable to ACT's — different objectives, different action parameterisation. Only rollout success rates will settle the comparison." Por tanto, no hay métricas numéricas de éxito en tareas reales.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible oficialmente. Dado el tamaño de 450M de parámetros, una estimación razonable en FP16 sería de 1 a 2 GB de VRAM para el modelo, pero el procesamiento de imágenes de 512×512 y el *action expert* pueden aumentar el consumo. No se proporcionan cifras concretas.
- **GPU recomendadas**: no se especifican. Para entrenamiento se usó presumiblemente una GPU con al menos 16 GB de VRAM (por el batch de 8 y las imágenes), pero no hay confirmación.
- **Compatibilidad con GPU de consumo**: probablemente sí, dado el tamaño reducido del modelo; una RTX 3060 o superior podría ejecutar la inferencia, aunque no hay datos verificados.
- **Opciones de despliegue**: el modelo está en formato LeRobot (librería `lerobot`), por lo que se puede cargar con la API de LeRobot para inferencia en PyTorch. No se mencionan integraciones con vLLM, Ollama o TGI, ya que es un modelo de robótica, no de lenguaje.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Canal de fuerza | Licencia |
|---|---|---|---|---|---|
| Este modelo (SmolVLA baseline) | SmolVLA (VLM + action expert) | 450M | no disponible | No | Apache 2.0 |
| `…-model-real-a-vision-pos` (método A) | ACT (transformer) | no disponible | no disponible | No (solo visión + posición) | Apache 2.0 (presumible) |
| `…-model-real-b-force` (método B) | ACT | no disponible | no disponible | Sí, como entrada sin pérdida | Apache 2.0 (presumible) |
| `…-model-real-d-force-closed-loop` (método D) | ACT | no disponible | no disponible | Sí, entrada + pérdida de fuerza futura | Apache 2.0 (presumible) |

No se dispone de datos de rendimiento comparativo entre estos modelos, ya que el estudio está en curso y no ha publicado resultados de rollout. La comparación se limita a la arquitectura y al diseño experimental.

## Limitaciones y advertencias

- **Sin evaluación en robot**: el modelo no ha sido probado en el robot real; la pérdida de entrenamiento no es equivalente al éxito de la tarea, y los objetivos de SmolVLA no son comparables con los de ACT.
- **Hiperparámetros por defecto**: al ser una línea base deliberadamente no ajustada, un rendimiento pobre no refleja el techo de la arquitectura SmolVLA, sino el comportamiento con configuración estándar.
- **Ausencia de canal de fuerza**: el modelo ignora por completo la información de fuerza, lo que puede limitar su capacidad en tareas que requieran sensibilidad al contacto, como las que se estudian en el proyecto.
- **Datos limitados a dos cámaras**: la tercera ranura de cámara se rellena con ceros, lo que podría afectar a la generalización si se usara una configuración distinta.
- **Sub-tarea `t2_push_button` ausente**: no existe rung para esta tarea en el dataset de dos cámaras, por lo que el modelo no cubre esa operación.
- **Licencia Apache 2.0**: permite uso comercial, pero el modelo está pensado para investigación y puede requerir integración con el ecosistema LeRobot.

## Enlaces

- Repositorio HuggingFace: [IntelligentDecisionLab/xlerobot-coffee-model-real-smolvla-baseline](https://huggingface.co/IntelligentDecisionLab/xlerobot-coffee-model-real-smolvla-baseline)
- Dataset de entrenamiento: [IntelligentDecisionLab/xlerobot-coffee-real-2cam](https://huggingface.co/datasets/IntelligentDecisionLab/xlerobot-coffee-real-2cam)
- Modelo base: [lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base)
- Paper de SmolVLA: [SmolVLA: A Vision-Language-Action Model for Affordable and Efficient Robotic Control](https://arxiv.org/abs/2506.01844)
- Repositorio LeRobot: [huggingface/lerobot](https://github.com/huggingface/lerobot)
- Ejemplo de uso de SmolVLA en LeRobot: [using_smolvla_example.py](https://github.com/huggingface/lerobot/blob/main/examples/tutorial/smolvla/using_smolvla_example.py)
- Otros modelos del estudio (método A, B, D): [model-real-a-vision-pos](https://huggingface.co/IntelligentDecisionLab/xlerobot-coffee-model-real-a-vision-pos), [model-real-b-force](https://huggingface.co/IntelligentDecisionLab/xlerobot-coffee-model-real-b-force), [model-real-d-force-closed-loop](https://huggingface.co/IntelligentDecisionLab/xlerobot-coffee-model-real-d-force-closed-loop)
