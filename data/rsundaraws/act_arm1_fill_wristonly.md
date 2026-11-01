# rsundaraws/act_arm1_fill_wristonly

## Resumen

`act_arm1_fill_wristonly` es una política de imitación para robótica basada en Action Chunking with Transformers (ACT), publicada por el usuario rsundaraws en Hugging Face y entrenada con la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visomotor que recibe el estado articular de un brazo robótico SO-101 (6 dimensiones) y una imagen de una cámara montada en la muñeca (3x480x640) y emite comandos de acción de 6 dimensiones a 30 FPS. Con 51.668.614 parámetros y un peso de repositorio de 0,2 GB, está diseñado para ejecutar una única tarea concreta: coger un cubo y depositarlo en una caja naranja.

El modelo se ha entrenado sobre el dataset `rsundaraws/so101_arm1_fill_wrist`, compuesto por 97 episodios teleoperados y 32.943 fotogramas grabados a 30 FPS. La arquitectura ACT predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error acumulado y mejora la estabilidad en tareas de manipulación de contacto. Es relevante para desarrolladores que trabajan con robots de bajo coste tipo SO-101 y quieren un punto de partida reproducible de aprendizaje por imitación con LeRobot 0.6.1.

La licencia Apache 2.0 permite uso comercial y modificación. El modelo está pensado exclusivamente para el robot `so_follower` con una cámara de muñeca; no incluye evaluación en robot real publicada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación por fotograma, sin contexto textual) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo robótico, no lingüístico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | so_follower (SO-101) |
| Cámaras de entrada | wrist (3, 480, 640) |
| Dimensión de estado | (6,) |
| Dimensión de acción | (6,) |
| Frecuencia de control | 30 FPS |
| Tarea entrenada | "Pick up the cube and place it in the orange box" |
| Pasos de entrenamiento | 30.000 |
| Batch size | 32 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.1 |
| Episodios de entrenamiento | 97 |
| Fotogramas de entrenamiento | 32.943 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador visual (procesa la imagen de la cámara de muñeca a 480x640) con un transformer que fusiona la observación del estado articular y predice un chunk de acciones futuras. En lugar de regresar una única acción por paso, el modelo emite una secuencia corta de comandos, lo que mitiga el problema de acumulación de error típico de las políticas paso a paso y permite un control más suave a 30 FPS. La dimensionalidad es baja (6 articulaciones de estado y 6 de acción), coherente con un brazo SO-101 de 6 grados de libertad.

El entrenamiento se realizó con LeRobot 0.6.1 durante 30.000 pasos, batch de 32, AdamW con learning rate 1e-05 y semilla 1000, sobre 97 episodios teleoperados (32.943 fotogramas) de la tarea de recoger un cubo y colocarlo en una caja naranja. No se documenta en la model card el uso de RLHF, DPO ni aumentos de datos; el pipeline es el estándar de imitación supervisada de LeRobot. Tampoco se especifica el número total de tokens ni composición de dataset más allá de la tarea y el recuento de episodios.

## Capacidades

- Control visomotor de un brazo SO-101 (`so_follower`) con 6 grados de libertad a partir de una única cámara de muñeca.
- Predicción de chunks de acción para manipulación de contacto (agarrar y soltar objetos).
- Ejecución de la tarea concreta "Pick up the cube and place it in the orange box".
- Inferencia en tiempo real a 30 FPS mediante `lerobot-rollout`.
- Entrenamiento reproducible con `lerobot-train` y política `act`.
- Integración con el ecosistema LeRobot (visualización de dataset, CLI, checkpoints).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual ni capacidades multilingües: es una política robótica, no un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del pipeline visomotor descrito.

## Casos de uso

- Manipulación pick-and-place en laboratorio: el modelo ejecuta la secuencia de coger un cubo y depositarlo en una caja naranja sobre un SO-101, adecuado para validar pipelines de imitación antes de escalar a tareas propias.
- Prototipado de aprendizaje por imitación con LeRobot: sirve como referencia reproducible (30.000 pasos, batch 32, lr 1e-05) para comparar hiperparámetros y curvas de entrenamiento en tareas de contacto.
- Docencia y formación en robótica de bajo coste: el tamaño de 51,7 M de parámetros y 0,2 GB permite desplegarlo en estaciones de trabajo modestas con una GPU consumer para demostraciones en clase.
- Benchmark interno de políticas ACT: al estar entrenado sobre un dataset público concreto (97 episodios, 32.943 fotogramas), permite comparar variantes de ACT o de otras políticas de imitación sobre la misma distribución de datos.
- Reentrenamiento para tareas adyacentes: el checkpoint puede usarse como inicialización o referencia para fine-tuning con `lerobot-train` sobre nuevos datasets de manipulación del mismo robot.
- Integración en pipelines de evaluación automatizada: permite lanzar rollouts de 60 segundos con `--strategy.type=base` para medir tasas de éxito de forma repetible antes de desplegar en un robot físico.
- Base para investigación en chunking de acciones: útil para estudiar el efecto del tamaño de chunk y de la frecuencia de control (30 FPS) en la estabilidad de tareas de agarre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, número de ensayos ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros y pesos safetensors de 0,2 GB, la inferencia cabe holgadamente en GPUs consumer de 8 GB o menos, aunque el autor no publica cifras.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente para ejecutar la política.
- Cabe en GPU consumer: sí, por el tamaño del checkpoint (0,2 GB) y el número de parámetros.
- Opciones de despliegue: LeRobot 0.6.1 con `lerobot-rollout` (estrategia base) y `lerobot-train` para reentrenamiento; requiere robot `so_follower` y cámara `wrist` configurada a 640x480 y 30 FPS.
- Latencia y throughput: no disponibles; el control opera a 30 FPS según la configuración del dataset, pero no se publican medidas de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_arm1_fill_wristonly (este) | ACT, imitación | 51.668.614 | Estado (6,) + imagen wrist 3x480x640 | apache-2.0 | Hugging Face, LeRobot |
| Políticas ACT genéricas de LeRobot | ACT, imitación | no disponible | Depende del dataset | apache-2.0 (LeRobot) | Hugging Face, LeRobot |
| Políticas Diffusion Policy | Difusión, imitación | no disponible | Depende del dataset | varía | Hugging Face, LeRobot |
| Políticas VQ-BeT | Discrete tokens, imitación | no disponible | Depende del dataset | varía | Hugging Face, LeRobot |

No se dispone de datos cuantitativos de rendimiento de estas alternativas en la información proporcionada; la comparación se limita a tipo de método, licencia y disponibilidad.

## Limitaciones y advertencias

- Entrenado para una única tarea ("Pick up the cube and place it in the orange box") y un único robot (`so_follower`); no generaliza a otras tareas, objetos o morfologías sin reentrenamiento.
- Requiere una cámara de muñeca (`wrist`) a 640x480 y 30 FPS; cambiar la cámara, su posición o la resolución puede degradar el rendimiento.
- No se han publicado evaluaciones en robot real; se desconoce la tasa de éxito y la robustez ante cambios de iluminación, posición de objetos o distractores.
- Riesgo de sobreajuste a la distribución de los 97 episodios (32.943 fotogramas) del dataset de entrenamiento.
- No es un modelo de lenguaje: no tiene capacidades de razonamiento textual, tool calling, agentes ni multilingüismo; cualquier uso fuera del control visomotor es inadecuado.
- Sesgos conocidos: no documentados por el autor; cabe esperar sesgos derivados de las condiciones de recogida de datos (posición del cubo, caja naranja, iluminación del laboratorio).
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación en producción recae en el integrador.
- El repositorio tiene 24 descargas y 0 likes, lo que sugiere escasa validación comunitaria; conviene tratar el checkpoint como experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rsundaraws/act_arm1_fill_wristonly
- Dataset de entrenamiento: https://huggingface.co/datasets/rsundaraws/so101_arm1_fill_wrist
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=rsundaraws/so101_arm1_fill_wrist
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
