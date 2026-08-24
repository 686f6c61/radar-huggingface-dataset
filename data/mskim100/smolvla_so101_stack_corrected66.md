# msKim100/smolvla_so101_stack_corrected66

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, pensado para el control de robots mediante aprendizaje por imitación. Este repositorio concreto, `msKim100/smolvla_so101_stack_corrected66`, es un ajuste fino (fine-tuning) del modelo base `lerobot/smolvla_base` sobre un conjunto de datos de 66 episodios de una tarea de manipulación (recoger un bloque y colocarlo en un objetivo). El modelo está entrenado para operar con tres cámaras (wrist, body, top) y un estado de 6 dimensiones, generando acciones de control de 6 dimensiones.

El modelo tiene 450 millones de parámetros, un tamaño relativamente reducido para un VLA, lo que permite su despliegue en hardware de consumo. La licencia Apache 2.0 facilita su uso comercial y académico. Se ha entrenado con 80.000 pasos, un batch de 8 y una tasa de aprendizaje de 0.0001, utilizando la librería LeRobot en su versión 0.6.1.

La relevancia de este modelo radica en su capacidad para ejecutar tareas de manipulación robótica de forma eficiente, sirviendo como punto de partida para investigaciones y aplicaciones prácticas en robótica de bajo coste, sin necesidad de infraestructura de alto rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), basada en transformer con un backbone de visión-lenguaje y un experto de acción (SmolVLA) |
| Parametros totales | 450.046.176 (safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica a texto; procesa imágenes de 256x256 y estado de 6 dimensiones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones en inglés, tarea en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador de visión con un modelo de lenguaje para procesar instrucciones en lenguaje natural y observaciones visuales, y un "experto de acción" que genera las acciones de control del robot. La arquitectura está diseñada para ser eficiente y ejecutarse en hardware de consumo. El modelo base `lerobot/smolvla_base` se ha ajustado con un dataset de demostraciones de robótica (66 episodios, 55.138 frames a 30 FPS) para la tarea específica de pick-and-place. El entrenamiento se realizó mediante aprendizaje por imitación con el framework LeRobot, usando el optimizador AdamW y una tasa de aprendizaje de 1e-4. No se menciona el uso de técnicas de RLHF o DPO en la información disponible.

## Capacidades

- Control de robot para tareas de manipulación de precisión (pick and place) a partir de imágenes de tres cámaras (muñeca, cuerpo, superior) y el estado del robot (posición de las articulaciones).
- Generación de acciones de control de 6 grados de libertad (posición y orientación del efector final) en cada paso.
- Capacidad de seguir instrucciones en lenguaje natural, aunque solo se ha entrenado para una tarea específica ("Pick up the block and place it on the target").
- Integración con el ecosistema LeRobot, lo que facilita el despliegue en robots compatibles (SO-101 follower) y la reproducción de experimentos.
- No soporta tool calling, agentes, ni capacidades de razonamiento general; su función es exclusivamente el control robótico.

## Casos de uso

- Manipulación industrial de piezas: el modelo puede controlar un brazo robótico para recoger y colocar componentes en líneas de montaje, reduciendo costes de integración gracias a su pequeño tamaño y compatibilidad con hardware de consumo.
- Investigación en aprendizaje por imitación: sirve como base para probar técnicas de fine-tuning, transferencia de tareas y evaluación de políticas en entornos de laboratorio.
- Prototipado de robots de bajo coste: al poder ejecutarse en GPUs de consumo, permite desarrollar y probar políticas de control en robots como el SO-101 sin necesidad de infraestructura de alto rendimiento.
- Educación en robótica: se puede utilizar en cursos de robótica para enseñar conceptos de aprendizaje por imitación y control de robots, gracias a su integración con LeRobot y su documentación.
- Automatización de tareas repetitivas en entornos controlados: el modelo puede operar en líneas de ensamblaje o almacenes para mover bloques o piezas de un punto a otro, siempre que la tarea sea la misma que la entrenada.
- Evaluación de políticas robóticas: sirve como referencia para comparar el rendimiento de otros VLA o métodos de control en la misma tarea, aunque no se han publicado resultados de evaluación en este repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo card indica que no se proporcionan resultados de evaluación en robot real. Por lo tanto, no se puede comparar su rendimiento numérico con otros modelos.

## Requisitos de hardware

- El modelo tiene ~450 millones de parámetros, lo que en FP32 ocupa aproximadamente 1,8 GB. Con cuantización (p. ej., FP16 o int8) la memoria necesaria se reduce a 0,9-1 GB.
- Se espera que pueda ejecutarse en GPUs de consumo con 8 GB de VRAM o menos, aunque no se especifican requisitos oficiales en la documentación.
- GPU recomendadas: RTX 3060, RTX 4060, RTX 4070, o superiores. No se requiere una GPU de centro de datos.
- Para despliegue, se utiliza la librería LeRobot, que se integra con el framework de inferencia de Hugging Face. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que es un modelo de robótica, no de texto.
- La latencia y throughput no se han publicado; dependen del hardware y de la carga de inferencia (procesamiento de 3 imágenes y un estado por paso).

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos VLA (como OpenVLA, RT-2 o modelos de la familia SmolVLA) en términos de rendimiento o características específicas. Se puede indicar que SmolVLA es más ligero que OpenVLA (que tiene ~7B parámetros), pero no hay datos concretos de este ajusto.

## Limitaciones y advertencias

- El modelo está entrenado para una única tarea específica ("Pick up the block and place it on the target") y no es generalizable a otras tareas sin un nuevo fine-tuning.
- La capacidad de generalización está limitada a las condiciones de captura del dataset (posición de cámaras, iluminación, tipo de robot). Cambios en el entorno pueden degradar el rendimiento.
- No se han publicado resultados de evaluación en robot real, por lo que el rendimiento en entornos no controlados es desconocido.
- No se ha documentado la presencia de sesgos, pero como modelo de visión-lenguaje, puede heredar sesgos de los datos de entrenamiento del modelo base.
- Riesgo de alucinación en acciones: puede generar acciones incorrectas si la entrada es ambigua o fuera de distribución.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base `lerobot/smolvla_base` y el dataset utilizado para posibles restricciones adicionales.
- Para producción, se requiere una validación exhaustiva del rendimiento en el robot objetivo y en condiciones reales de trabajo.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/msKim100/smolvla_so101_stack_corrected66
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/msKim100/so101_smolvla_corrected_66
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Documentación de LeRobot sobre SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Guía de fine-tuning de SmolVLA en SO-101: https://openelab.io/fi/blogs/learn/how-to-fine-tune-smolvla-on-so-101-with-lerobot
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
