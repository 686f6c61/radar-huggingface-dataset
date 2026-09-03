# heyunzhenwhat/act_so101-single-transfer-100ep-mixedpos-2x

## Resumen

El modelo `heyunzhenwhat/act_so101-single-transfer-100ep-mixedpos-2x` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollada por el usuario heyunzhenwhat y publicada a través de la librería LeRobot de Hugging Face. ACT es una técnica de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que permite ejecutar tareas de manipulación con alta precisión a partir de datos teleoperados. Este modelo concreto está entrenado para la tarea de mover una cinta adhesiva a un área marcada en un robot manipulador SO101, utilizando dos cámaras (una cenital y otra en la muñeca) y el estado del robot como entradas.

El modelo tiene 51.668.614 parámetros, un tamaño relativamente pequeño que lo hace adecuado para ejecutarse en hardware modesto. Fue entrenado durante 40.000 pasos con un dataset de 100 episodios y 29.363 fotogramas a 30 FPS, con una configuración que incluye batch size de 16, optimizador AdamW y learning rate de 1e-5. Su relevancia radica en ser un ejemplo práctico de aplicación de ACT en robótica de bajo coste, accesible para investigadores y desarrolladores que trabajan con el ecosistema LeRobot. Aunque no se han publicado resultados de evaluación, su arquitectura y método lo convierten en una referencia útil para estudiar el aprendizaje por imitación en tareas de manipulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ACT, un método de aprendizaje por imitación basado en transformers que predice bloques de acciones (chunks) de varios pasos temporales. Esta arquitectura fue propuesta en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705) y se ha popularizado en el ecosistema LeRobot por su eficacia en tareas de manipulación con robots de bajo coste. El modelo procesa observaciones visuales de dos cámaras (overhead y wrist) junto con el estado del robot (6 dimensiones) y genera una acción de 6 dimensiones correspondiente a los movimientos del efector final.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.1) sobre el dataset `heyunzhenwhat/so101-single-transfer-100ep-mixedpos`, que contiene 100 episodios teleoperados de la tarea "Move the tape into the taped area on the right". Se utilizaron 40.000 pasos de entrenamiento con batch size 16, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se mencionan técnicas adicionales como RLHF o DPO, ya que es un modelo de imitación pura. La innovación principal reside en la predicción de chunks de acciones, que reduce la acumulación de errores y mejora la suavidad del movimiento.

## Capacidades

- Control de robot manipulador SO101 mediante aprendizaje por imitación, capaz de ejecutar la tarea específica de transferencia de una cinta a un área marcada.
- Percepción visual multimodal con dos cámaras: una cenital (resolución 720x1280) y otra en la muñeca (360x640), procesadas como entradas de imagen.
- Predicción de secuencias de acciones (chunks) en lugar de pasos individuales, lo que permite movimientos más fluidos y coherentes.
- Integración nativa con el ecosistema LeRobot, incluyendo scripts de entrenamiento, evaluación y despliegue en robots reales.
- No dispone de capacidades de lenguaje natural, tool calling, razonamiento simbólico ni procesamiento de texto, al ser un modelo puramente robótico.

## Casos de uso

- Automatización de tareas repetitivas en entornos controlados: el modelo puede ejecutar la tarea de mover una cinta a un área específica de forma autónoma, útil en líneas de montaje o laboratorios de robótica.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el comportamiento de ACT en tareas de manipulación con variaciones de posición (el dataset incluye posiciones mixtas).
- Desarrollo de políticas de control para robots de bajo coste: al ser un modelo pequeño (51M parámetros), puede ejecutarse en hardware asequible, facilitando la experimentación en entornos académicos o de pequeña empresa.
- Integración en pipelines de robótica con LeRobot: permite combinar el modelo con otros componentes del ecosistema, como captura de datos, evaluación y despliegue, mediante comandos CLI como `lerobot-rollout`.
- Pruebas de generalización a variaciones de posición: el dataset "mixedpos" sugiere que el modelo fue entrenado con diferentes posiciones de la cinta, lo que permite evaluar su robustez ante cambios en el entorno.
- Educación y prototipado rápido: estudiantes y desarrolladores pueden utilizar este modelo como ejemplo funcional de entrenamiento de políticas robóticas con ACT, sin necesidad de grandes recursos computacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política.

## Requisitos de hardware

- No se dispone de requisitos oficiales de hardware en la documentación del modelo.
- Dado el tamaño de 51.668.614 parámetros, se estima que el modelo es ligero y podría ejecutarse en GPUs de consumo con al menos 4 GB de VRAM, aunque no hay datos confirmados.
- El framework LeRobot suele requerir una GPU NVIDIA con CUDA para entrenamiento, pero la inferencia podría realizarse en CPU para pruebas básicas.
- Opciones de despliegue: el modelo se integra con LeRobot, que soporta ejecución en robots reales mediante `lerobot-rollout` y entrenamiento con `lerobot-train`. No se mencionan compatibilidades con vLLM, llama.cpp u otras herramientas de inferencia de modelos de lenguaje, ya que no es un modelo de texto.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa detallada. Existen otros modelos ACT similares en Hugging Face, como `heyunzhenwhat/act_so101-single-transfer` (sin el sufijo `-2x`) y `dleon23/act-so101`, pero no se han publicado especificaciones completas ni resultados de rendimiento que permitan una comparación objetiva. Todos comparten la misma arquitectura ACT y el uso de LeRobot, pero las diferencias en datasets, configuraciones de entrenamiento y tareas específicas no están documentadas.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para una tarea concreta (mover una cinta a un área marcada) y no generaliza a otras tareas de manipulación sin reentrenamiento.
- Depende de la configuración específica de cámaras y robot (SO101 con cámaras overhead y wrist); cambios en la disposición de las cámaras o en el robot pueden degradar el rendimiento.
- No se han publicado resultados de evaluación en robot real, por lo que su fiabilidad en producción no está verificada.
- Al ser un modelo de imitación, puede heredar sesgos de los datos de teleoperación, como variaciones en la velocidad o trayectorias subóptimas.
- No procesa lenguaje natural ni tiene capacidades de razonamiento simbólico; su uso se limita a control robótico.
- La licencia Apache-2.0 permite uso comercial, pero es recomendable revisar los términos de la licencia y las condiciones del dataset asociado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/heyunzhenwhat/act_so101-single-transfer-100ep-mixedpos-2x)
- [Paper de ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [Dataset de entrenamiento](https://huggingface.co/datasets/heyunzhenwhat/so101-single-transfer-100ep-mixedpos)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Visualización del dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=heyunzhenwhat/so101-single-transfer-100ep-mixedpos)
