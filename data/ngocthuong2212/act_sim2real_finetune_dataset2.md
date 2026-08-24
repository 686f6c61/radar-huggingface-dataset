# ngocthuong2212/act_sim2real_finetune_dataset2

## Resumen

El modelo `ngocthuong2212/act_sim2real_finetune_dataset2` es una política de robótica basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de pasos individuales. Desarrollado por ngocthuong2212 y entrenado con el framework LeRobot de Hugging Face, este modelo está diseñado para controlar un robot tipo `so_follower` en la tarea de recoger un objeto (bloque verde) y colocarlo en una caja. El modelo se ha afinado a partir de un preentrenamiento en simulación (sim2real), como sugiere el nombre del repositorio, aunque no se proporcionan detalles adicionales sobre ese proceso.

Con 51,7 millones de parámetros, es un modelo compacto que procesa observaciones de dos cámaras (superior y frontal) junto con el estado del robot (6 dimensiones) para generar comandos de acción de 6 dimensiones. Su relevancia radica en ser un ejemplo práctico de transferencia sim2real en robótica de manipulación, con una licencia Apache 2.0 que permite uso comercial y modificación. El modelo se distribuye en formato safetensors y se integra directamente con el ecosistema LeRobot para entrenamiento e inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de robótica, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de control robótico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT (Action Chunking with Transformers), presentada en el paper arXiv:2304.13705. ACT es un método de aprendizaje por imitación que utiliza un transformer para predecir un "chunk" de acciones futuras (una secuencia de pasos) en lugar de una sola acción, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación. El modelo consume dos imágenes RGB (480x640) de cámaras `top` y `front`, junto con un vector de estado de 6 dimensiones, y produce un vector de acción de 6 dimensiones.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.2) sobre el dataset `vasco281204/so101_green_block`, que contiene 200 episodios teleoperados (170.639 frames a 30 FPS) de la tarea "Pick the object and place it into the box". La configuración de entrenamiento incluye 25.000 pasos, batch size de 8, optimizador AdamW con learning rate de 1e-5 y semilla 1000. No se especifican detalles sobre el preentrenamiento en simulación ni sobre técnicas de alineación como RLHF o DPO, ya que no aplican a este tipo de modelo.

## Capacidades

- Control de robot manipulador: genera comandos de acción de 6 grados de libertad (posición y orientación del efector final) a partir de observaciones visuales y de estado.
- Percepción visual multi-cámara: procesa simultáneamente imágenes de dos cámaras (superior y frontal) para localizar y manipular objetos.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas, sin necesidad de programación explícita de la tarea.
- Transferencia sim2real: el nombre del repositorio sugiere que el modelo ha sido afinado para funcionar en el mundo real tras un preentrenamiento en simulación, aunque no se documentan los detalles de ese proceso.
- Integración con LeRobot: compatible con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robots reales.
- Tarea específica: optimizado para la tarea de recoger un bloque verde y colocarlo en una caja, aunque la arquitectura general podría adaptarse a otras tareas con datos adecuados.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos industriales: el modelo puede controlar un brazo robótico para recoger piezas de una cinta transportadora y depositarlas en contenedores, reduciendo la intervención humana en líneas de montaje.
- Robótica educativa y de investigación: al ser un modelo pequeño y con licencia Apache 2.0, es adecuado para laboratorios que estudian aprendizaje por imitación y transferencia sim2real sin grandes recursos computacionales.
- Prototipado rápido de políticas robóticas: gracias a su integración con LeRobot, los desarrolladores pueden entrenar y desplegar el modelo en pocos pasos, acelerando la validación de nuevas tareas de manipulación.
- Manipulación de objetos en entornos domésticos: el modelo podría adaptarse a robots de asistencia para tareas como recoger objetos del suelo y colocarlos en una mesa, aunque requeriría reentrenamiento con datos específicos.
- Benchmarking de métodos de imitación: sirve como punto de referencia para comparar el rendimiento de ACT frente a otras arquitecturas de políticas robóticas en tareas estandarizadas.
- Investigación en sim2real: el modelo es un caso de estudio para analizar cómo el preentrenamiento en simulación mejora el rendimiento en el mundo real, un área activa de investigación en robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación ("No evaluation results have been provided for this policy yet"). Por tanto, no se dispone de tasas de éxito ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 51,7 millones de parámetros, la inferencia es ligera. Con pesos en precisión FP32, el modelo ocupa aproximadamente 207 MB, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM. En FP16, el uso de memoria se reduce a unos 103 MB.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (por ejemplo, NVIDIA GTX 1050 Ti o superior) es suficiente. Incluso una GPU integrada podría ejecutar el modelo, aunque con menor rendimiento.
- Compatibilidad con GPU de consumo: sí, el modelo es perfectamente ejecutable en GPUs de consumo como la RTX 3060, RTX 4060 o incluso en la Jetson Nano para aplicaciones embebidas.
- Opciones de despliegue: el modelo se integra con LeRobot, que ofrece scripts de rollout (`lerobot-rollout`) para ejecutar la política en robots reales. También puede utilizarse con PyTorch directamente. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos específicos. Dado el tamaño del modelo y la resolución de imagen (480x640), se espera una inferencia en tiempo real (30 FPS) en GPUs modernas, pero no hay mediciones oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas de robótica basadas en ACT con sim2real). El ecosistema LeRobot incluye otros modelos de imitación como Diffusion Policy o VQ-BeT, pero no se han encontrado datos de rendimiento comparativos para este modelo concreto. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sin resultados de evaluación: no hay datos de éxito en el mundo real, por lo que el rendimiento real del modelo es desconocido. Es necesario validarlo en el robot antes de cualquier uso en producción.
- Especialización limitada: el modelo está entrenado para una tarea muy concreta (recoger un bloque verde y colocarlo en una caja) con un robot específico (`so_follower`). No generaliza a otras tareas u objetos sin reentrenamiento.
- Dependencia de las cámaras: el rendimiento depende de la calibración y posición de las cámaras `top` y `front`. Cambios en la iluminación, el fondo o la posición de la cámara pueden degradar la precisión.
- Sesgos del dataset: el dataset de entrenamiento (200 episodios) puede no cubrir todas las variaciones posibles de la tarea (posiciones del objeto, condiciones de iluminación, etc.), lo que puede provocar fallos en situaciones no vistas.
- Riesgo de alucinación: aunque no es un modelo de lenguaje, puede generar acciones incorrectas si las observaciones son ambiguas o fuera de distribución, lo que podría causar movimientos erráticos del robot.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación, pero es necesario atribuir el copyright y mantener los avisos de licencia. No hay restricciones adicionales conocidas.
- Requisitos de hardware para entrenamiento: aunque la inferencia es ligera, el entrenamiento (25.000 pasos con batch 8) requiere una GPU con suficiente memoria para procesar las imágenes, aunque no se especifican requisitos mínimos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ngocthuong2212/act_sim2real_finetune_dataset2
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/vasco281204/so101_green_block
- LeRobot (framework): https://github.com/huggingface/lerobot
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Perfil del autor: https://huggingface.co/ngocthuong2212
