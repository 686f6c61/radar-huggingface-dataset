# heyunzhenwhat/act_so101-single-transfer-100ep

## Resumen

El modelo `heyunzhenwhat/act_so101-single-transfer-100ep` es una política de robótica basada en Action Chunking with Transformers (ACT), entrenada con el framework LeRobot de Hugging Face. ACT es un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que permite un control suave y robusto en tareas de manipulación. Este modelo concreto está especializado en la tarea de mover una cinta adhesiva hacia una zona marcada en el lado derecho, operando sobre un brazo robótico SO-101 (tipo `so_follower`).

El modelo fue desarrollado por el usuario `heyunzhenwhat` y se distribuye bajo licencia Apache 2.0. Con aproximadamente 51,7 millones de parámetros, es un modelo compacto diseñado para ejecutarse en tiempo real en hardware robótico. Su relevancia radica en que demuestra el flujo completo de entrenamiento y despliegue de políticas de imitación con LeRobot, incluyendo la integración con cámaras, el registro de datos teleoperados y la inferencia en el robot. El repositorio incluye el modelo en formato safetensors, junto con la configuración de entrenamiento y las instrucciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica directamente; procesa observaciones por pasos) |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que utiliza un transformer para predecir un chunk de acciones futuras a partir de observaciones actuales (imágenes y estado del robot). El modelo combina un codificador visual (para procesar las cámaras overhead y wrist), un codificador de estado y un decodificador transformer que genera secuencias de acciones. En este caso, la entrada incluye imágenes de 720x1280 (overhead) y 360x640 (wrist), junto con un vector de estado de 6 dimensiones; la salida es un vector de acción de 6 dimensiones.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.1) sobre un dataset de 100 episodios teleoperados (29127 fotogramas a 30 FPS) para la tarea específica de transferencia de cinta. Se usaron 20.000 pasos de entrenamiento con batch size 16, optimizador AdamW y learning rate de 1e-5. No se aplicaron técnicas de RLHF ni DPO; es un entrenamiento supervisado de imitación puro. No se reportan innovaciones técnicas adicionales más allá de la arquitectura ACT estándar.

## Capacidades

- Control de un brazo robótico SO-101 (tipo `so_follower`) para tareas de manipulación.
- Procesamiento de entrada visual multicámara (cámara overhead y cámara wrist) junto con estado del robot.
- Generación de acciones de 6 grados de libertad (posición y orientación) en forma de chunks.
- Ejecución en tiempo real mediante el pipeline de inferencia de LeRobot (`lerobot-rollout`).
- Entrenamiento específico para la tarea de transferencia de objetos (mover una cinta a una zona objetivo).
- No es un modelo de lenguaje: no tiene capacidades de texto, tool calling, agentes conversacionales ni razonamiento simbólico.

## Casos de uso

- Manipulación robótica de objetos pequeños: el modelo puede transferir cintas u otros objetos planos de una posición a otra, útil en líneas de montaje o clasificación.
- Automatización de tareas repetitivas en laboratorios: por ejemplo, mover muestras o elementos entre zonas marcadas, como se demuestra en la tarea de entrenamiento.
- Desarrollo de habilidades de pick-and-place con aprendizaje por imitación: sirve como base para probar nuevas tareas con datasets teleoperados.
- Investigación en aprendizaje por imitación: permite estudiar el efecto del número de episodios, la configuración de cámaras o la longitud del chunk en el rendimiento.
- Despliegue en entornos educativos: al ser un modelo pequeño y con licencia Apache 2.0, es adecuado para cursos de robótica y prácticas con el robot SO-101.
- Transferencia sim-to-real: el modelo puede servir como punto de partida para comparar políticas entrenadas en simulación frente a las entrenadas con datos reales, como sugiere el taller de NVIDIA Isaac SO-101.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real todavía. No se dispone de métricas como tasa de éxito o comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~52M parámetros, la inferencia requiere aproximadamente 1-2 GB de VRAM en precisión FP32, aunque LeRobot suele usar FP16 o BF16, reduciendo el consumo a menos de 1 GB.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM es suficiente (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4090, A100). También puede ejecutarse en CPU, aunque con mayor latencia.
- Compatibilidad con GPU consumer: sí, cabe en la mayoría de GPUs de consumo actuales.
- Opciones de despliegue: LeRobot (mediante `lerobot-rollout`), también puede exportarse a ONNX o TensorRT para despliegue en edge, aunque no se documenta en la model card.
- Latencia: no disponible en la información proporcionada; depende del hardware y del tamaño del chunk de acción.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos. Existen otros repositorios de políticas ACT para el robot SO-101 (por ejemplo, `suhyoun/act_so101_model`), pero no se han publicado métricas comparativas. En términos generales, ACT es una arquitectura estándar en el ecosistema LeRobot y su rendimiento depende fuertemente de la calidad y cantidad de datos de entrenamiento, así como de la configuración de cámaras y del robot.

## Limitaciones y advertencias

- Especialización estricta: el modelo está entrenado para una única tarea (mover la cinta a la zona derecha) y no generaliza a otras tareas u objetos sin reentrenamiento.
- Dependencia del dataset: el rendimiento está limitado por la calidad de los 100 episodios teleoperados; variaciones en iluminación, posición de objetos o texturas pueden degradar el comportamiento.
- Riesgo de sobreajuste: con 20.000 pasos y un dataset relativamente pequeño, existe riesgo de que el modelo memorice las trayectorias de entrenamiento en lugar de aprender una política robusta.
- Sesgos del operador: las demostraciones teleoperadas reflejan el estilo y posibles errores del operador humano.
- Sin evaluación en robot real: la model card indica que no hay resultados de evaluación, por lo que el comportamiento en el mundo real no está verificado.
- Limitaciones de hardware: aunque es ligero, requiere un robot SO-101 con cámaras específicas (overhead y wrist) y calibración adecuada.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo no incluye garantías ni soporte; el usuario es responsable de validar su seguridad en aplicaciones de producción.

## Enlaces

- Repositorio del modelo: https://huggingface.co/heyunzhenwhat/act_so101-single-transfer-100ep
- Dataset de entrenamiento: https://huggingface.co/datasets/heyunzhenwhat/so101-single-transfer-100ep
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Framework LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=heyunzhenwhat/so101-single-transfer-100ep
- Taller sim-to-real SO-101 (NVIDIA Isaac): https://github.com/isaac-sim/Sim-to-Real-SO-101-Workshop
