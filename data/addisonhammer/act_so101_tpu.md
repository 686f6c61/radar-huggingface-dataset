# addisonhammer/act_so101_tpu

## Resumen

El modelo `addisonhammer/act_so101_tpu` es una política de robótica entrenada con el framework LeRobot de Hugging Face, basada en el método Action Chunking with Transformers (ACT). ACT es una técnica de aprendizaje por imitación que predice secuencias completas de acciones (chunks) en lugar de pasos individuales, lo que permite un control más fluido y robusto en tareas de manipulación. El modelo ha sido entrenado específicamente para la tarea de recoger cuatro piezas de TPU negro y colocarlas en una taza metálica, utilizando un robot SO-101 (SO-ARM100) con tres cámaras: overhead, wrist y scene.

El modelo cuenta con 51.668.614 parámetros y está publicado bajo licencia Apache 2.0, lo que permite su uso comercial y modificación sin restricciones significativas. Está diseñado para ejecutarse en tiempo real sobre el robot SO-101, consumiendo observaciones de estado (6 dimensiones) e imágenes de tres cámaras, y produciendo acciones de 6 dimensiones. Este modelo es relevante porque demuestra el uso de ACT en un caso práctico de pick-and-place con componentes industriales, y está disponible públicamente para ser reproducido o adaptado mediante LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica, es una politica visual-motora) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación basado en transformers. La arquitectura consta de un codificador de visión (ResNet) que procesa las imágenes de las cámaras, un codificador de estado que procesa las observaciones del robot, y un decodificador autoregresivo que genera secuencias de acciones. La principal innovación de ACT es la predicción de chunks de acciones (varios pasos a la vez) en lugar de acciones individuales, lo que reduce la acumulación de errores y mejora la suavidad del movimiento. El modelo fue entrenado con el framework LeRobot (versión 0.6.2) sobre un dataset de 31 episodios teleoperados, con un total de 12.298 frames a 15 FPS. La configuración de entrenamiento incluye 80.000 pasos, batch size de 16, optimizador AdamW con learning rate de 1e-5 y seed 1000. No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento posterior.

## Capacidades

- Control robótico de pick-and-place: el modelo ejecuta la tarea de recoger piezas TPU y colocarlas en una taza metálica.
- Percepción visual multimodal: procesa simultáneamente tres flujos de cámara (overhead, wrist y scene) con resoluciones de 480x640 y 360x640.
- Predicción de acciones en chunk: genera secuencias de 6 dimensiones de acción (posiciones articulares o comandos de efector final) de forma autoregresiva.
- Aprendizaje por imitación: el modelo reproduce comportamientos teleoperados sin necesidad de recompensas explícitas.
- Integración con LeRobot: compatible con el ecosistema de LeRobot para entrenamiento, evaluación y despliegue en robots SO-101.
- No tiene capacidades de lenguaje, generación de texto, razonamiento simbólico ni tool calling.

## Casos de uso

- Automatización de ensamblaje en entornos industriales: el modelo puede integrarse en líneas de producción para tareas repetitivas de colocación de piezas pequeñas, reduciendo el tiempo de ciclo y liberando a operarios humanos.
- Manipulación de componentes delicados: gracias a la predicción de chunks, el modelo genera movimientos suaves y precisos, adecuados para piezas de TPU que requieren un agarre cuidadoso sin deformación.
- Investigación en robótica de imitación: sirve como punto de partida para estudiar la transferencia de políticas entre entornos simulados y reales, o para comparar ACT con otros métodos como Diffusion Policy.
- Prototipado rápido de tareas de manipulación: con LeRobot, un investigador puede teleoperar un robot durante unos minutos, entrenar una política con este modelo como referencia y desplegarla en el mismo día.
- Educación en robótica y aprendizaje por imitación: el modelo y su dataset están disponibles públicamente, permitiendo a estudiantes y desarrolladores experimentar con el flujo completo de entrenamiento y evaluación.
- Base para fine-tuning en tareas similares: dado su pequeño tamaño (51M parámetros), puede adaptarse a nuevas tareas de pick-and-place con relativamente pocos datos, siempre que se mantenga la misma configuración de robot y cámaras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). Por tanto, no se dispone de métricas de éxito, tasa de éxito por episodio ni comparaciones con otros métodos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente, pero dado que el modelo tiene solo 51M parámetros y procesa imágenes de 480x640, se estima que puede ejecutarse en GPU con menos de 2 GB de VRAM (por ejemplo, una NVIDIA GTX 1050 Ti o superior).
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (RTX 2060, RTX 3060, A100, etc.) es suficiente. También puede ejecutarse en CPU, aunque con mayor latencia.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer actual.
- Opciones de despliegue: el modelo se ejecuta mediante el paquete `lerobot` (comando `lerobot-rollout`). También puede integrarse en scripts personalizados de PyTorch. No hay soporte nativo para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. La inferencia depende del hardware y de la resolución de las cámaras; en una GPU media se esperan tiempos de inferencia del orden de decenas de milisegundos por paso.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. Otros métodos de aprendizaje por imitación para robótica (como Diffusion Policy, VLA o ACT con diferentes configuraciones) no tienen datos públicos comparables en este repositorio. La comparativa queda pendiente de futuras publicaciones de benchmarks.

## Limitaciones y advertencias

- El modelo está entrenado para una tarea muy específica (recoger 4 piezas TPU y colocarlas en una taza) y no generaliza a otras tareas sin fine-tuning.
- El dataset de entrenamiento es pequeño (31 episodios, 12.298 frames), lo que puede provocar sobreajuste y falta de robustez ante variaciones en la posición de los objetos, iluminación o distracciones.
- Requiere la misma configuración de robot (SO-101) y las mismas cámaras (overhead, wrist, scene) con las mismas resoluciones y posiciones para funcionar correctamente.
- No se han realizado evaluaciones formales en robot real; el rendimiento en entornos no vistos es incierto.
- No tiene capacidades de razonamiento simbólico ni de lenguaje; es exclusivamente una política visual-motora.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo depende del robot SO-101 y de la configuración de cámaras, lo que limita su portabilidad a otros sistemas.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí puede generar acciones incorrectas si las observaciones difieren del dominio de entrenamiento.

## Enlaces

- Repositorio del modelo: https://huggingface.co/addisonhammer/act_so101_tpu
- Dataset de entrenamiento: https://huggingface.co/datasets/addisonhammer/so101_4_tpu_parts_in_cup_20260816_222751
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
- Documentación del robot SO-101: https://huggingface.co/docs/lerobot/so101
- Repositorio del SO-ARM100: https://github.com/TheRobotStudio/SO-ARM100
