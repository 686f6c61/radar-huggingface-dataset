# HyeonseokE/smolvla_phase1_sort_by_color_A1_via4cm_1000_10fps

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, diseñado para tareas de robótica y capaz de ejecutarse en hardware de consumo. Este repositorio contiene un fine-tuning del modelo base `lerobot/smolvla_base` (publicado en el paper arXiv:2506.01844) para una tarea concreta: clasificar bloques de colores en platos del mismo color, ejecutada por un robot tipo `so101_follower`. El modelo ha sido entrenado con el framework LeRobot y el dataset `HyeonseokE/phase1_sort_by_color_A1_10fps_via4cm`, que consta de 100 episodios y 74.505 fotogramas a 10 FPS, recogidos en simulación (Isaac Sim) con etiquetas de lenguaje natural por fotograma.

Con 450 millones de parámetros, este modelo demuestra que es posible adaptar un VLA pequeño a una tarea específica con un coste computacional reducido, lo que lo hace relevante para entornos con recursos limitados o para prototipado rápido en robótica. Su arquitectura combina percepción visual multi-cámara, comprensión de instrucciones en lenguaje natural y generación de acciones de 6 grados de libertad. No se dispone de información sobre la longitud de contexto ni sobre los idiomas soportados, ya que el modelo está orientado a comandos de tarea en inglés (la única instrucción documentada es "Sort the blocks onto the matching colored dishes.").

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que parte de un VLM (vision-language model) preentrenado y lo adapta para generar acciones de control robótico. En este caso, el modelo base `lerobot/smolvla_base` se ha fine-tuneado mediante aprendizaje por imitación (behavior cloning) sobre un dataset de demostraciones. El dataset de entrenamiento contiene 100 episodios con 74.505 fotogramas a 10 FPS, capturados con tres cámaras (top, left_wrist y una tercera no especificada) a resolución 256x256, junto con el estado del robot (6 dimensiones) y las acciones correspondientes (6 dimensiones). La configuración de entrenamiento incluye 58.200 pasos, batch size de 64, optimizador AdamW y learning rate de 0,0001. No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento adicionales. La innovación principal reside en la eficiencia del modelo base, que permite este fine-tuning en hardware asequible.

## Capacidades

- Percepción visual multi-cámara: procesa tres imágenes de 256x256 píxeles simultáneamente.
- Comprensión de instrucciones en lenguaje natural: interpreta la tarea "Sort the blocks onto the matching colored dishes.".
- Generación de acciones de 6 grados de libertad (posición y orientación del efector final).
- Control de robot tipo `so101_follower` (brazo robótico).
- No dispone de tool calling, generación de texto libre, razonamiento general ni capacidades multilingües.
- No incluye modo de pensamiento (thinking mode) ni procesamiento de audio.

## Casos de uso

- Clasificación de objetos en líneas de producción: el modelo puede separar piezas por color o forma en entornos industriales controlados, gracias a su percepción visual y a la generación de acciones precisas.
- Automatización de tareas de picking and placing: su capacidad para interpretar una instrucción y ejecutar movimientos de 6 DOF lo hace adecuado para tareas repetitivas de recogida y colocación en almacenes o celdas de trabajo.
- Prototipado rápido de políticas robóticas: al ser un modelo compacto, permite iterar rápidamente en entornos de simulación antes de desplegar en el robot real.
- Base para fine-tuning en otras tareas de manipulación: dado que parte de un modelo preentrenado, se puede adaptar a nuevas tareas con pocos datos, como apilar objetos, insertar piezas o seguir trayectorias.
- Investigación en aprendizaje por imitación: sirve como referencia para estudiar el efecto del tamaño del modelo, la cantidad de datos y la transferencia sim-to-real en VLA.
- Demostración de despliegue en hardware de bajo coste: su tamaño reducido permite ejecutarlo en GPUs de consumo, lo que facilita su uso en laboratorios académicos o pequeñas empresas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet.").

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware.
- Dado el tamaño de parámetros (450M), se estima que el modelo requiere aproximadamente 1,8 GB de VRAM en FP32 y 0,9 GB en FP16, por lo que podría ejecutarse en GPUs de consumo con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, etc.), aunque no hay confirmación oficial.
- El despliegue se realiza mediante el framework LeRobot, que utiliza PyTorch. No se mencionan opciones como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo.
- La latencia y el throughput dependen del hardware y de la resolución de las cámaras; no se dispone de datos medidos.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos. El autor ha publicado dos variantes adicionales del mismo fine-tuning (`smolvla_phase1_sort_by_color_A1_1000_10fps` y `smolvla_phase1_sort_by_color_A2_1000_10fps`), pero no se han proporcionado detalles sobre sus diferencias. No hay información sobre alternativas como OpenVLA u otros VLA en este contexto.

## Limitaciones y advertencias

- El modelo está especializado en una única tarea (clasificar bloques por color) y no es generalizable a otras tareas sin un nuevo fine-tuning.
- El dataset de entrenamiento fue generado en simulación (Isaac Sim), por lo que existe un riesgo de brecha sim-to-real: el comportamiento en el robot físico puede diferir del simulado.
- No se han realizado evaluaciones en robot real, por lo que se desconoce su tasa de éxito en condiciones reales.
- No soporta instrucciones en otros idiomas ni tareas de lenguaje natural fuera del ámbito de la robótica.
- La longitud de contexto no está documentada, lo que limita el uso de historiales largos de observaciones.
- Aunque la licencia Apache-2.0 permite uso comercial, el modelo es específico para un hardware y una configuración de cámaras concretos, lo que puede requerir adaptaciones.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/HyeonseokE/smolvla_phase1_sort_by_color_A1_via4cm_1000_10fps)
- [Paper de SmolVLA (arXiv:2506.01844)](https://arxiv.org/abs/2506.01844)
- [Dataset de entrenamiento](https://huggingface.co/datasets/HyeonseokE/phase1_sort_by_color_A1_10fps_via4cm)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de SmolVLA en LeRobot](https://huggingface.co/docs/lerobot/main/en/smolvla)
