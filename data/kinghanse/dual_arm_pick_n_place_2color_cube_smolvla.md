# kinghanse/Dual_Arm_Pick_n_Place_2color_Cube_smolvla

## Resumen

Este repositorio contiene una política de imitación basada en SmolVLA, un modelo visión-lenguaje-acción (VLA) compacto desarrollado por Hugging Face y presentado en el paper arXiv 2506.01844. El autor, `kinghanse`, ha hecho fine-tuning del checkpoint base `lerobot/smolvla_base` sobre un dataset propio de manipulación bimanual para ejecutar una tarea concreta: colocar un cubo rojo a la izquierda de una mesa negra con el brazo derecho. No es un modelo de lenguaje generalista, sino un controlador robótico entrenado para un robot específico (`bi_so102_client`) con tres cámaras y un estado de 6 dimensiones.

El modelo resuelve el problema de llevar una tarea de pick-and-place bimanual a hardware de consumo mediante un VLA de 450 millones de parámetros, muy por debajo de los VLA de referencia como OpenVLA (7B) o RT-2. La arquitectura SmolVLA combina un codificador visual, un modelo de lenguaje pequeño y un cabezal de acciones, lo que permite inferencia en GPU consumer. Es relevante ahora porque demuestra el flujo completo de LeRobot 0.6.0 para entrenar políticas VLA sobre datasets pequeños (30 episodios, 21.115 frames a 30 FPS) sin infraestructura de gran escala.

La ficha describe exclusivamente lo publicado en la model card y en los metadatos del repositorio; no hay resultados de evaluación ni benchmarks reportados por el autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action), fine-tuning de `lerobot/smolvla_base` |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje general) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot 0.6.0 |
| Tipo de robot | `bi_so102_client` (bimanual SO-102) |
| Cámaras de entrada | `cam_wrist_left`, `cam_wrist_right`, `cam_top` (3 × 256×256×3) |
| Estado de entrada | `observation.state` de forma `(6,)` |
| Salida | `action` de forma `(14,)` |
| Tamaño del repo | 0.9 GB |
| Pipeline | robotics |

## Arquitectura y entrenamiento

SmolVLA es un modelo visión-lenguaje-acción que procesa observaciones multimodales (tres cámaras RGB a 256×256 y un vector de estado articular de 6 dimensiones) y emite un vector de acción de 14 dimensiones, correspondiente a un robot bimanual. La arquitectura sigue el diseño del paper 2506.01844, orientado a reducir el coste computacional frente a VLA de mayor tamaño manteniendo un rendimiento competitivo en tareas de manipulación. El repositorio no detalla la composición interna del codificador visual ni del backbone de lenguaje; esa información debe consultarse en el paper.

El fine-tuning se realizó con LeRobot 0.6.0 sobre el dataset `kinghanse/Dual_Arm_Pick_n_Place_2color_Cube`: 30 episodios, 21.115 frames a 30 FPS, una única tarea en lenguaje natural ("Put the red cube on the left of the black table with the right arm"). La configuración de entrenamiento fue de 50.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-4 y semilla 1000. No se reporta uso de RLHF, DPO ni decodificación especulativa; se trata de aprendizaje por imitación supervisado sobre demostraciones.

## Capacidades

- Control robótico de pick-and-place bimanual: ejecuta la tarea "colocar el cubo rojo a la izquierda de la mesa negra con el brazo derecho" a partir de observaciones visuales y de estado.
- Fusión de tres vistas de cámara (muñeca izquierda, muñeca derecha y vista superior) en una única política.
- Condicionamiento por instrucción en lenguaje natural: la tarea se pasa como texto al ejecutar la política.
- Salida de acciones continuas de 14 dimensiones apta para un robot bimanual tipo SO-102.
- Inferencia en hardware de consumo según la model card del modelo base.
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes: es una política de control, no un LLM conversacional.
- Capacidades multilingües: no disponibles; la instrucción de tarea está en inglés.

## Casos de uso

- Automatización de pick-and-place en laboratorio: ejecutar la tarea entrenada sobre un robot bimanual SO-102 con tres cámaras, usando `lerobot-rollout` con `--policy.path=kinghanse/Dual_Arm_Pick_n_Place_2color_Cube_smolvla` y la instrucción exacta de entrenamiento.
- Base para fine-tuning de nuevas tareas: partir de este checkpoint o del base `lerobot/smolvla_base` y entrenar con `lerobot-train` sobre un dataset propio, reutilizando la configuración de hiperparámetros publicada (50k pasos, batch 8, lr 1e-4).
- Validación de pipelines de imitación con datasets pequeños: sirve como referencia de hasta dónde llega un VLA de 450M parámetros con solo 30 episodios y 21k frames, útil para calibrar expectativas antes de grabar más datos.
- Prototipado de manipulación bimanual en hardware asequible: al caber en GPU consumer, permite iterar en estaciones de trabajo sin clúster.
- Docencia y reproducción de experimentos: el flujo completo (dataset público, configuración de entrenamiento, comando de rollout) es reproducible de extremo a extremo con LeRobot 0.6.0.
- Benchmark interno de referencia: comparar el comportamiento de políticas SmolVLA fine-tuneadas frente a otros enfoques de imitación sobre el mismo robot y cámaras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito, número de ensayos ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 450M parámetros en safetensors el peso ronda los 0,9 GB en fp32/bf16, por lo que debería caber holgadamente en GPUs consumer, pero no hay cifra oficial.
- GPU recomendadas: no disponible; la model card del base afirma que SmolVLA puede desplegarse en hardware de consumo.
- Compatibilidad con GPU consumer: probable por tamaño, sin confirmación oficial en este repositorio.
- Despliegue: LeRobot 0.6.0 mediante `lerobot-rollout` (inferencia) y `lerobot-train` (entrenamiento); el comando de entrenamiento usa `--policy.device=cuda`.
- Latencia y throughput: no disponibles. La captura de datos se realizó a 30 FPS, pero no se reporta la frecuencia de inferencia alcanzada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kinghanse/Dual_Arm_Pick_n_Place_2color_Cube_smolvla | 450M | VLA fine-tuneado (tarea única) | no disponible | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible en esta ficha | VLA base preentrenado | no disponible | no disponible | Hugging Face |
| OpenVLA | no disponible en esta ficha | VLA generalista | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a parámetros y licencia del modelo descrito.

## Limitaciones y advertencias

- Entrenado para una única tarea y un único robot (`bi_so102_client`); no generaliza a otras instrucciones ni a otras configuraciones de cámara sin reentrenamiento.
- Sin evaluación publicada: no hay evidencia cuantitativa de tasa de éxito, robustez a cambios de iluminación, posiciones de objeto o distracciones.
- Dataset muy pequeño (30 episodios); riesgo alto de sobreajuste a las condiciones exactas de grabación.
- Las claves de observación deben coincidir exactamente con las usadas en entrenamiento (`cam_wrist_left`, `cam_wrist_right`, `cam_top`); un desajuste de nombres o índices de cámara rompe la inferencia.
- La instrucción de tarea está en inglés y debe pasarse literalmente para reproducir el comportamiento entrenado.
- Riesgo de alucinación en el sentido de acciones no válidas o inseguras fuera de la distribución de demostraciones; requiere supervisión física y paradas de emergencia en el robot.
- Sesgos conocidos: no documentados por el autor.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación hace desaconsejable su despliegue en producción sin validación propia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay comunidad ni soporte asociado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kinghanse/Dual_Arm_Pick_n_Place_2color_Cube_smolvla
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/kinghanse/Dual_Arm_Pick_n_Place_2color_Cube
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kinghanse/Dual_Arm_Pick_n_Place_2color_Cube
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Guía SmolVLA de LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
