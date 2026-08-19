# ltchang/pi05_so101_vials_canonical75_cont_15k

## Resumen

El modelo `ltchang/pi05_so101_vials_canonical75_cont_15k` es un fine-tune del modelo base `lerobot/pi05_base`, que corresponde a π₀.₅ (Pi05), un Vision-Language-Action (VLA) desarrollado por Physical Intelligence para generalización en robótica. Este checkpoint concreto ha sido entrenado con LeRobot sobre un dataset de teleoperación de un brazo robótico SO-101 para la tarea de recoger un vial y colocarlo en un rack. El modelo se distribuye bajo licencia Apache-2.0 y está pensado para ser ejecutado en el robot SO-101 con dos cámaras (ego y externa D455).

La relevancia de este modelo radica en que demuestra el flujo de fine-tuning de un VLA de última generación sobre una tarea manipulativa específica, usando herramientas open source como LeRobot. Al estar basado en π₀.₅, hereda capacidades de generalización a entornos nuevos, aunque su especialización en esta tarea concreta limita su uso a escenarios similares. El entrenamiento se realizó con 75 episodios (18 250 frames a 30 FPS) durante 15 000 pasos, lo que lo convierte en un ejemplo de adaptación rápida con pocos datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05) de Physical Intelligence |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en π₀.₅, un VLA que combina un modelo de lenguaje y visión con una cabeza de acción para control robótico. La implementación en LeRobot está adaptada del repositorio OpenPI de Physical Intelligence. El fine-tune se realizó sobre el checkpoint base `lerobot/pi05_base` usando el dataset `sreetz-nv/so101_teleop_vials_rack_left`, que contiene 75 episodios de teleoperación (18 250 frames a 30 FPS) de la tarea "Pick up the vial and place it in the rack". El entrenamiento se ejecutó con 15 000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, usando LeRobot versión 0.6.1. No se especifica si se aplicaron técnicas como RLHF o DPO; se trata de un fine-tuning supervisado por imitación.

## Capacidades

- Control robótico de un brazo SO-101 para la tarea específica de recoger un vial y colocarlo en un rack.
- Procesamiento de dos entradas visuales simultáneas: cámara ego (montada en el robot) y cámara externa D455, ambas con resolución 480x640.
- Entrada de estado del robot de 6 dimensiones (posición/velocidad de las articulaciones) y salida de acción de 6 dimensiones.
- Generalización limitada a entornos similares al de entrenamiento, gracias a la base π₀.₅.
- No soporta generación de texto, tool calling ni razonamiento simbólico; es un modelo puramente de actuación robótica.

## Casos de uso

- Automatización de laboratorio: el modelo puede integrarse en un sistema robótico para manipular viales en racks, reduciendo la intervención humana en tareas repetitivas de preparación de muestras.
- Investigación en imitación learning: sirve como ejemplo de fine-tuning de un VLA con pocos datos (75 episodios) para una tarea concreta, útil para estudiar la transferencia de habilidades.
- Desarrollo de robots de bajo coste: al usar el robot SO-101 (de bajo coste) y software open source (LeRobot), es accesible para laboratorios con presupuesto limitado.
- Benchmarking de VLA: permite comparar el rendimiento de π₀.₅ fine-tuneado frente a otros modelos en tareas de manipulación con objetos pequeños.
- Teleoperación asistida: el modelo puede ejecutarse en tiempo real para asistir a un operador humano en tareas de precisión, como colocar viales en posiciones exactas.
- Educación en robótica: sirve como caso práctico para enseñar el flujo completo de entrenamiento y despliegue de políticas robóticas con LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). Por tanto, no hay datos de tasa de éxito ni comparaciones cuantitativas.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la información disponible. Al ser un VLA basado en π₀.₅, se espera que requiera una GPU con al menos 24 GB de VRAM para inferencia en tiempo real, aunque no hay confirmación oficial.
- El entrenamiento se realizó con `--policy.device=cuda`, lo que indica que se usó una GPU NVIDIA.
- Para despliegue, LeRobot ofrece el comando `lerobot-rollout` que ejecuta el modelo en el robot SO-101; se requiere una GPU compatible con PyTorch y CUDA.
- No se dispone de datos de latencia o throughput. Dado el tamaño típico de los VLA, se recomienda una GPU de gama alta (por ejemplo, RTX 4090, A100 o superior) para mantener una frecuencia de control adecuada (30 FPS).
- Opciones de despliegue: LeRobot (rollout), posiblemente exportable a otros frameworks, pero no se documentan alternativas como vLLM u Ollama, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa con otros modelos. Sin embargo, se pueden mencionar alternativas en el mismo dominio:

| Modelo | Base | Tarea | Dataset | Licencia |
|---|---|---|---|---|
| `ltchang/pi05_so101_vials_canonical75_cont_15k` (este) | π₀.₅ | Recoger vial y colocarlo en rack | 75 episodios SO-101 | Apache-2.0 |
| `ltchang/pi05_so101_vials_completion_v6_cont_5k` | π₀.₅ | Tarea similar de viales (completion) | no disponible | Apache-2.0 |
| `ltchang/pi05_so101_vials_rlft_smoke_step5` | π₀.₅ | Tarea de viales con RLFT | no disponible | Apache-2.0 |
| `jinnymo/so101-pi05-base` | π₀.₅ | Base adaptada a SO-101 | no disponible | no disponible |

Estos modelos comparten la misma arquitectura base y dominio, pero no se dispone de métricas de rendimiento para compararlos.

## Limitaciones y advertencias

- El modelo está especializado en una única tarea (recoger vial y colocarlo en rack) y no generaliza a otras manipulaciones sin reentrenamiento.
- No se han reportado resultados de evaluación en robot real, por lo que su rendimiento efectivo es desconocido.
- Depende de la configuración exacta de cámaras y robot utilizada durante el entrenamiento; cambios en la iluminación, posición de la cámara o tipo de vial pueden degradar el rendimiento.
- Al ser un modelo de imitación, puede heredar sesgos del demostrador humano (por ejemplo, trayectorias subóptimas).
- Riesgo de alucinación en acciones: puede generar movimientos erráticos si las observaciones difieren del dominio de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base π₀.₅ puede tener restricciones adicionales; se recomienda revisar la licencia de Physical Intelligence.
- No se proporcionan pesos cuantizados ni formatos alternativos (GGUF, ONNX), lo que limita su despliegue en hardware de bajas prestaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ltchang/pi05_so101_vials_canonical75_cont_15k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sreetz-nv/so101_teleop_vials_rack_left
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Documentación de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sreetz-nv/so101_teleop_vials_rack_left
