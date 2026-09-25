# Luminia/so101_pick_place_black_cube_on_red

## Resumen
Este modelo es una política de control robótico desarrollada por el usuario Luminia en Hugging Face. Se trata de un checkpoint en formato safetensors de 51.591.814 parámetros (aproximadamente 51,6 M) diseñado para ejecutar una tarea concreta de manipulación: coger un cubo negro pequeño y colocarlo sobre un bloque rojo. La tarea se realiza con el brazo robótico SO-101 y una cámara USB que proporciona imágenes a 640x480 y 30 fps, tal como se documenta en el comando de ejemplo de la model card mediante la herramienta lerobot-rollout.

El modelo no es un modelo de lenguaje ni multimodal de propósito general: es una política de aprendizaje por imitación para robótica. Su relevancia radica en que forma parte del ecosistema LeRobot, que facilita el entrenamiento, evaluación y despliegue de políticas de manipulación en robots de bajo coste como el SO-101. Al estar publicado en abierto, permite reproducir experimentos y servir como baseline para tareas de pick-and-place.

Sin embargo, la información disponible es muy limitada: no se especifica la arquitectura interna, el dataset de entrenamiento, la licencia ni los resultados de evaluación. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no ha sido validado por la comunidad.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoint de política para LeRobot) |
| Parámetros totales | 51.591.814 |
| Longitud de contexto | no aplica (modelo de robótica) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | pick up the small black cube and place on the red block |
| Robot | SO-101 (configuración seguidor) |
| Entrada | imágenes de cámara (640x480, 30 fps) y estado del robot |
| Salida | acciones de control del brazo |

## Arquitectura y entrenamiento
No se dispone de información detallada sobre la arquitectura en la model card ni en los resultados de búsqueda. El único dato técnico confirmado es que se trata de un checkpoint compatible con lerobot-rollout, la herramienta de evaluación de políticas de LeRobot. Dado el tamaño (51,6 M de parámetros) y el contexto del ecosistema, es plausible que se trate de una política de tipo ACT (Action Chunking Transformer) o una diffusion policy, pero no hay confirmación oficial.

Tampoco se especifican los datos de entrenamiento: número de episodios, número de demostraciones, composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en robótica de imitación). Por el comando de ejemplo, se deduce que el modelo ha sido entrenado para recibir observaciones visuales de una cámara y el estado del robot SO-101, y producir acciones motoras a 30 fps para completar la tarea. No se documentan innovaciones técnicas como decodificación especulativa o atención linear.

## Capacidades
- Ejecución de una tarea de manipulación específica: coger un cubo negro pequeño y colocarlo sobre un bloque rojo.
- Control de un brazo robótico SO-101 en configuración seguidor, con una cámara OpenCV a 640x480 y 30 fps.
- Generación de acciones motoras a partir de observaciones visuales y del estado del robot (aprendizaje por imitación).
- No soporta tool calling ni function calling (no aplica a robótica).
- No soporta agentes conversacionales ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües (no procesa lenguaje natural, aunque la tarea se describe en inglés en el comando).
- No se documentan capacidades especiales como visión adicional, audio o modo "thinking".

## Casos de uso
- Reproducción de experimentos académicos: el modelo sirve como baseline reproducible para comparar algoritmos de aprendizaje por imitación en la tarea de pick-and-place con SO-101. Se puede ejecutar con lerobot-rollout y medir la tasa de éxito.
- Evaluación de técnicas de robótica: investigadores pueden usar este checkpoint para probar variaciones en la percepción (por ejemplo, cambiar la cámara) o en el control, y comparar resultados.
- Docencia y formación: en cursos de robótica, se puede utilizar para demostrar un sistema completo de manipulación, desde la captura de imágenes hasta la generación de acciones, sin necesidad de entrenar desde cero.
- Prototipado de celdas de montaje: adaptar el modelo mediante fine-tuning a tareas similares (por ejemplo, colocar el cubo en otra posición) para validar rápidamente un flujo de trabajo robótico.
- Pruebas de robustez: evaluar cómo se comporta la política ante cambios de iluminación, posición del cubo o del bloque rojo, para identificar límites de generalización.
- Generación de trayectorias sintéticas: usar el modelo para producir rollouts adicionales que amplíen un dataset de demostraciones, aunque la calidad debe validarse.
- Benchmarking de hardware: medir la latencia de inferencia y el consumo en diferentes GPUs (consumer y profesionales) para dimensionar despliegues.
- Integración en pipelines de automatización: combinar el modelo con herramientas de orquestación para ejecutar ciclos de pick-and-place en entornos controlados de laboratorio.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada: con 51,6 M de parámetros, el peso en fp32 ocupa aproximadamente 206 MB; en fp16, unos 103 MB. Si la política incluye un codificador visual (no confirmado), el uso de VRAM podría aumentar, pero en cualquier caso sería inferior a 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1050 Ti, GTX 1650, RTX 3050, RTX 3060, RTX 4090, A100 o H100. También puede ejecutarse en CPU, aunque con mayor latencia.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna.
- Opciones de despliegue: el método documentado es lerobot-rollout con el robot SO-101 y una cámara OpenCV. No se documentan otros formatos como ONNX, TensorRT o vLLM (no aplica a robótica).
- Latencia y throughput: no disponible. Dependerá de la GPU, de la resolución de imagen y de la frecuencia de control (30 fps en el ejemplo).

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Luminia/so101_pick_place_black_cube_on_red | 51,6 M | no aplica | no disponible | safetensors en Hugging Face |
| SmolVLA (fine-tuning para SO-101) | >500 M (se fine-tunean ~50 M) | no aplica | no disponible | Hugging Face (según blog) |
| ACT (Action Chunking Transformer) | no disponible | no aplica | no disponible | implementado en LeRobot |
| Diffusion Policy | no disponible | no aplica | no disponible | implementado en LeRobot |
| nara9951/so101-cube-pick-and-place | no disponible | no aplica | no disponible | Hugging Face |

## Limitaciones y advertencias
- Modelo específico para una tarea y un robot concreto (SO-101). No generaliza a otras tareas, objetos o robots sin fine-tuning.
- Depende de la calibración del robot y de la cámara; cambios en la configuración pueden degradar el rendimiento.
- No hay información sobre sesgos, pero al entrenarse con demostraciones humanas, puede heredar sesgos de posición, iluminación o color.
- Riesgo de alucinación no aplica en el sentido de los LLM, pero sí puede fallar en la ejecución de la tarea si las condiciones difieren de las de entrenamiento.
- Licencia no disponible: no se puede confirmar si se permite uso comercial. Se recomienda contactar con el autor.
- El modelo tiene 0 descargas y 0 likes, sin validación de la comunidad.
- No se documentan limitaciones de contexto ni de idioma porque no es un modelo de lenguaje.
- Para producción, es imprescindible validar la tasa de éxito en el entorno real y prever mecanismos de recuperación ante fallos.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Luminia/so101_pick_place_black_cube_on_red
- Modelo similar nara9951/so101-cube-pick-and-place: https://huggingface.co/nara9951/so101-cube-pick-and-place
- Dataset relacionado kevinqyh0827/so101_pick_black_cube_and_place_green_box_v3: https://huggingface.co/datasets/kevinqyh0827/so101_pick_black_cube_and_place_green_box_v3
- Blog sobre fine-tuning de SmolVLA para SO-101: https://ggando.com/blog/smolvla-so101/
- PDF sobre pick and place con SO-101: https://yuxng.github.io/Courses/CS6341Fall2025/project_group_10.pdf
- Vídeo tutorial sobre entrenamiento de pick and place en SO100/SO101: https://www.youtube.com/watch?v=vC7E6ZmXBT8
