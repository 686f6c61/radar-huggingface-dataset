# jenyao/so101_act_policy

## Resumen

`jenyao/so101_act_policy` es una política de robótica basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de pasos individuales. El modelo ha sido entrenado con la librería LeRobot de Hugging Face para controlar un brazo robótico SO-101 en una tarea de pick-and-place: agarrar un destornillador. La política consume imágenes de dos cámaras (handeye y frontal) junto con el estado del robot (6 dimensiones) y genera comandos de acción de 6 dimensiones.

El modelo cuenta con 51,7 millones de parámetros y se ha entrenado sobre un dataset teleoperado de 30 episodios (10.877 fotogramas a 30 FPS). Su relevancia radica en que demuestra un flujo completo de entrenamiento de políticas robóticas con pocos datos y hardware asequible, siguiendo la metodología ACT publicada en el paper arXiv:2304.13705. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con CVAE (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de control robótico, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que combina un transformer con un autoencoder variacional condicional (CVAE). La arquitectura codifica las observaciones (imágenes de las cámaras y estado del robot) y genera un "chunk" de acciones futuras, lo que reduce el error de compounding que sufren los métodos que predicen una sola acción por paso. El modelo fue entrenado con LeRobot versión 0.6.1 sobre un dataset de teleoperación de 30 episodios, con 800 pasos de entrenamiento, batch size de 8, optimizador AdamW y learning rate de 1e-5. No se menciona el uso de RLHF ni DPO, ya que es un método de imitación puro.

## Capacidades

- Control de manipulador robótico SO-101 para tareas de pick-and-place.
- Procesamiento de entrada multimodal: dos cámaras RGB (480x640) y vector de estado del robot (6 valores).
- Generación de acciones continuas de 6 dimensiones (posición/velocidad de las articulaciones o del efector final).
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de recompensas explícitas.
- No soporta tool calling, agentes, generación de texto, visión general ni capacidades multilingües; es un modelo especializado en control motor.

## Casos de uso

- Automatización de tareas repetitivas de pick-and-place en entornos de laboratorio o producción ligera: el modelo puede ejecutar la tarea "agarrar el destornillador" de forma autónoma tras recibir las observaciones de las cámaras.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas entre robots o la robustez frente a cambios de iluminación y posición de objetos.
- Prototipado rápido de aplicaciones robóticas con hardware de bajo coste (SO-101 es un brazo asequible): permite validar el flujo LeRobot de recogida de datos, entrenamiento y despliegue en menos de un día.
- Benchmarking de algoritmos de control: al ser un modelo pequeño y con un dataset público, se puede comparar contra otras políticas ACT o métodos alternativos en la misma tarea.
- Educación en robótica: el modelo y su dataset asociado son ideales para cursos de robótica o aprendizaje automático que quieran mostrar un pipeline completo de entrenamiento de políticas.
- Desarrollo de sistemas de manipulación con visión: la combinación de dos cámaras y estado permite experimentar con fusión sensorial en control robótico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente "No evaluation results have been provided for this policy yet". No hay datos de tasa de éxito en el robot real ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 51,7 millones de parámetros, la inferencia requiere menos de 1 GB de VRAM en FP32, y menos aún en cuantización (aunque no se proporcionan archivos cuantizados).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente (por ejemplo, NVIDIA GTX 1650, RTX 3050 o superior). El entrenamiento se realizó con batch size 8, lo que sugiere que una GPU de gama media (8-12 GB) es suficiente para reentrenar.
- Cabe en GPU de consumo: sí, incluso en tarjetas integradas con suficiente memoria compartida, aunque se recomienda una GPU dedicada para latencia estable.
- Opciones de despliegue: el flujo oficial usa LeRobot con `lerobot-rollout`, que requiere el robot SO-101 conectado y las cámaras configuradas. No es compatible con vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible. Depende del hardware del robot y de la velocidad de captura de cámaras (30 FPS nominales).

## Comparativa con modelos similares

Existen otros repositorios en Hugging Face con políticas ACT para el mismo robot SO-101, como `aiden-li/so101-act` o `18houston2/so101_act_policy`, pero no se dispone de sus especificaciones técnicas ni de resultados comparativos. No hay modelos de la misma categoría con datos públicos de rendimiento para comparar directamente.

| Modelo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| jenyao/so101_act_policy | 51,7 M | no aplica | sin evaluacion | Apache 2.0 |
| aiden-li/so101-act | no disponible | no aplica | no disponible | no disponible |
| 18houston2/so101_act_policy | no disponible | no aplica | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para una única tarea ("Grab the screwdriver") y no generaliza a otras tareas sin reentrenamiento.
- El dataset es pequeño (30 episodios), lo que aumenta el riesgo de sobreajuste a las condiciones específicas de recogida (posición de la cámara, iluminación, colocación del objeto).
- No se han reportado evaluaciones en robot real, por lo que la tasa de éxito real es desconocida.
- La política depende de las cámaras y del estado del robot; cualquier cambio en la configuración del hardware (posición de cámara, calibración) puede degradar el rendimiento.
- No es un modelo de lenguaje ni multimodal general; no puede procesar texto, audio ni imágenes fuera del contexto robótico.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no incluye garantías de seguridad para operación autónoma en entornos no controlados.

## Enlaces

- Repositorio del modelo: https://huggingface.co/jenyao/so101_act_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/jenyao/so101-pick-place-dataset
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=jenyao/so101-pick-place-dataset
