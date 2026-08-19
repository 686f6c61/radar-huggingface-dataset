# jjnn722/act_grab_green_cube_v2

## Resumen

El modelo `jjnn722/act_grab_green_cube_v2` es una política de imitación basada en Action Chunking with Transformers (ACT), entrenada con el framework LeRobot de Hugging Face. Está diseñada para controlar un robot manipulador tipo `so_follower` en la tarea concreta de recoger un cubo verde impreso en 3D y depositarlo en una caja. El modelo fue desarrollado por el usuario jjnn722 y publicado en Hugging Face bajo licencia Apache 2.0.

ACT es un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas robóticas reales. Este modelo en particular tiene 51,67 millones de parámetros y consume observaciones de estado (6 dimensiones) e imágenes de una cámara frontal (480x640 píxeles) para generar acciones de 6 dimensiones. Fue entrenado con 40 episodios teleoperados (23.974 fotogramas a 30 FPS) durante 20.000 pasos.

La relevancia de este modelo radica en que demuestra un flujo completo de entrenamiento y despliegue de políticas robóticas con herramientas open source, y sirve como punto de partida para quienes quieran reproducir o adaptar tareas de manipulación con LeRobot. No se han publicado resultados de evaluación en el robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica, es un modelo de control robótico) |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible (el modelo no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que combina un codificador de visión (para procesar las imágenes de la cámara) con un transformador que predice un chunk de acciones futuras. En lugar de emitir una única acción por paso de tiempo, el modelo genera una secuencia de acciones (típicamente de 50 a 100 pasos) que el robot ejecuta de forma abierta, lo que reduce la acumulación de errores y mejora la suavidad del movimiento. La arquitectura exacta (número de capas, cabezas de atención, etc.) no se detalla en la información disponible.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.2) sobre el dataset `jjnn722/grab_green_cube`, que contiene 40 episodios teleoperados con un robot `so_follower` y una cámara frontal. Se usaron 20.000 pasos de entrenamiento con batch size 16, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento; es un entrenamiento puramente supervisado de imitación.

## Capacidades

- Control robótico de manipulación: el modelo genera comandos de acción de 6 dimensiones (probablemente posición y orientación del efector final) a partir de observaciones de estado y visión.
- Percepción visual: procesa imágenes RGB de 480x640 píxeles de una cámara frontal para localizar el objeto objetivo (cubo verde).
- Ejecución de tareas de pick-and-place: específicamente entrenado para recoger un cubo verde impreso en 3D y colocarlo en una caja.
- Generación de chunks de acción: predice secuencias de acciones (chunking) en lugar de acciones paso a paso, lo que permite movimientos más fluidos y robustos.
- Integración con LeRobot: compatible con el ecosistema de LeRobot para entrenamiento, evaluación y despliegue en robots reales.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural; es una política puramente motora.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos de laboratorio: el modelo puede integrarse en un robot `so_follower` para realizar la tarea específica de recoger un cubo verde y depositarlo en una caja, útil para validar flujos de trabajo de imitación.
- Prototipado rápido de políticas robóticas con LeRobot: sirve como ejemplo de referencia para quienes quieran entrenar sus propios modelos ACT con datasets teleoperados, ya que el repositorio incluye instrucciones completas de entrenamiento y despliegue.
- Investigación en aprendizaje por imitación: los 51,67 millones de parámetros y la configuración de entrenamiento documentada permiten estudiar el efecto del chunking en la tasa de éxito de tareas de manipulación.
- Benchmarking de frameworks de robótica: al ser un modelo pequeño y de código abierto, puede usarse para comparar el rendimiento de LeRobot frente a otros frameworks en tareas similares.
- Educación en robótica con IA: estudiantes y desarrolladores pueden desplegar este modelo en un robot simulado o real para comprender el ciclo completo de recopilación de datos, entrenamiento y evaluación.
- Base para fine-tuning en tareas similares: dado que el modelo ya ha aprendido a interactuar con un cubo, puede adaptarse con pocos datos a variantes de la tarea (diferentes colores, posiciones o contenedores) mediante fine-tuning con LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No se dispone de métricas como tasa de éxito, precisión de agarre ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no se proporcionan datos oficiales, pero con 51,67 millones de parámetros y entradas de imagen de 480x640, el modelo es ligero. En FP32, los pesos ocupan aproximadamente 207 MB (51,67M × 4 bytes), por lo que cabría en cualquier GPU con al menos 2 GB de VRAM, incluyendo GPUs integradas modernas.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (por ejemplo, RTX 3060, RTX 4090, A100) es suficiente. También podría ejecutarse en CPU para pruebas lentas, aunque no es lo recomendado.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo como la serie RTX 30/40 sin problemas.
- Opciones de despliegue: el modelo está integrado en LeRobot, por lo que se puede ejecutar con el comando `lerobot-rollout` usando el robot `so_follower`. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependerá del hardware y de la frecuencia de control del robot (típicamente 30 Hz en este tipo de sistemas).

## Comparativa con modelos similares

Existen otros modelos ACT entrenados para la misma tarea de recoger un cubo verde, como `nyamamoto/grab_green_cube` y `wowastingray/act_grab-green-cube-25epsclean`, ambos publicados en Hugging Face. Sin embargo, no se dispone de información detallada sobre sus parámetros, configuración de entrenamiento ni resultados, por lo que no es posible realizar una comparación cuantitativa rigurosa. Se puede afirmar que todos comparten la misma arquitectura ACT y el mismo framework LeRobot, pero las diferencias en dataset, número de episodios y configuración de entrenamiento pueden afectar al rendimiento real.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| jjnn722/act_grab_green_cube_v2 | 51,67M | no disponible | Apache 2.0 | Hugging Face |
| nyamamoto/grab_green_cube | no disponible | no disponible | no disponible | Hugging Face |
| wowastingray/act_grab-green-cube-25epsclean | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para una tarea muy específica (recoger un cubo verde y ponerlo en una caja) y no generaliza a otros objetos, colores o disposiciones sin fine-tuning.
- No se han reportado resultados de evaluación en robot real, por lo que su tasa de éxito real es desconocida.
- Depende de la configuración exacta del robot `so_follower` y de la cámara frontal; cambios en la iluminación, posición de la cámara o calibración pueden degradar el rendimiento.
- El dataset de entrenamiento es pequeño (40 episodios), lo que puede limitar la robustez frente a variaciones no vistas.
- No es un modelo de lenguaje ni de razonamiento; no puede interpretar instrucciones verbales ni adaptarse a tareas fuera de su espacio de acción.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar que el hardware y el entorno de despliegue cumplen con los requisitos del robot.
- No se proporcionan cuantizaciones ni formatos alternativos (GGUF, ONNX), lo que limita su despliegue en plataformas que no sean LeRobot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jjnn722/act_grab_green_cube_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/jjnn722/grab_green_cube
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
