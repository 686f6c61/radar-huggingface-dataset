# HyeonseokE/smolvla_phase1_sort_by_color_A2_2000_10fps

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, diseñado para tareas de robótica que requieren control basado en instrucciones en lenguaje natural y percepción visual. Este repositorio concreto contiene un ajuste fino (fine-tuning) del modelo base `lerobot/smolvla_base` sobre un dataset de clasificación de bloques por color, registrado con el robot `so101_follower` a 10 FPS. El modelo resuelve el problema de la manipulación robótica guiada por lenguaje, permitiendo que un brazo robótico ejecute tareas como "clasifica los bloques en los platos del color correspondiente".

Con aproximadamente 450 millones de parámetros, SmolVLA es significativamente más ligero que otros VLA como OpenVLA (7B), lo que permite su despliegue en hardware de consumo. La arquitectura combina un modelo de lenguaje y visión (VLM) preentrenado con un experto de acciones entrenado mediante flow matching, produciendo secuencias de acciones a partir de imágenes y una instrucción textual. Este ajuste fino concreto, entrenado con 100 episodios y más de 74.000 frames, está orientado a una tarea específica de clasificación por color en un entorno controlado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (VLM compacto + experto de acciones con flow matching) |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA se basa en un VLM preentrenado de tamaño compacto (del orden de cientos de millones de parámetros) al que se añade un "experto de acciones" entrenado con flow matching. Este experto transforma las representaciones visuales y lingüísticas del VLM en una secuencia de acciones de control (posiciones articulares o comandos de efector). El modelo procesa múltiples imágenes (en este caso tres cámaras: `camera1`, `camera2`, `camera3`, aunque la model card menciona `top` y `left_wrist` como cámaras del robot) junto con una instrucción textual, y genera un chunk de acciones.

El ajuste fino se realizó con la librería LeRobot sobre el dataset `HyeonseokE/phase1_sort_by_color_A2_10fps`, que contiene 100 episodios y 74.921 frames a 10 FPS. La configuración de entrenamiento incluyó 58.500 pasos, batch size de 64, optimizador AdamW con learning rate de 0.0001 y semilla 2000. No se menciona el uso de RLHF o DPO; el entrenamiento es puramente de imitación supervisada con flow matching.

## Capacidades

- Control robótico en bucle cerrado: el modelo recibe imágenes y estado del robot y produce acciones de control directamente.
- Seguimiento de instrucciones en lenguaje natural: interpreta comandos como "Sort the blocks onto the matching colored dishes" y ejecuta la tarea correspondiente.
- Percepción visual multicámara: procesa hasta tres vistas de cámara simultáneamente, lo que permite razonamiento espacial y manipulación precisa.
- Generalización limitada a tareas similares: al ser un ajuste fino específico, está optimizado para la tarea de clasificación por color, aunque puede servir como base para otras tareas de manipulación.
- Inferencia asíncrona: el diseño del modelo permite desacoplar la generación de acciones de la frecuencia de control del robot, mejorando la robustez en entornos dinámicos.

## Casos de uso

- Clasificación automatizada de piezas: el modelo puede controlar un brazo robótico para separar objetos por color en una línea de producción, como demuestra el dataset de entrenamiento. Es adecuado porque su ventana de contexto visual y su experto de acciones permiten ejecutar el movimiento continuo necesario.
- Manipulación guiada por lenguaje en laboratorios: investigadores pueden emplear este modelo como punto de partida para tareas de recogida y colocación (pick-and-place) en entornos controlados, gracias a su bajo coste computacional y su integración con LeRobot.
- Prototipado rápido de políticas robóticas: al ser un modelo pequeño y entrenable con pocos datos (100 episodios), sirve para validar algoritmos de imitación en hardware real sin necesidad de clústeres de GPU.
- Educación en robótica: estudiantes y desarrolladores pueden desplegar el modelo en una GPU de consumo para aprender sobre VLA y control robótico, ya que el repositorio incluye scripts de rollout y entrenamiento listos para usar.
- Evaluación de generalización en entornos domésticos: el modelo puede probarse en tareas sencillas de organización de objetos en hogares, aunque su rendimiento fuera del entorno de entrenamiento puede degradarse.
- Base para fine-tuning en nuevas tareas: los desarrolladores pueden partir de este ajuste y reentrenarlo con datasets propios para adaptarlo a otras tareas de manipulación, aprovechando la arquitectura eficiente de SmolVLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." El paper original de SmolVLA (arxiv:2506.01844) reporta métricas comparativas en tareas de robótica, pero no se dispone de esos datos en el contexto de este repositorio concreto.

## Requisitos de hardware

- VRAM estimada: con 450 millones de parámetros, el modelo en FP32 ocupa aproximadamente 1,8 GB. Con cuantización a 8 bits (no disponible en este repo, pero posible en general) cabría en 1 GB. No se proporcionan cifras exactas en la documentación.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia; el paper de SmolVLA menciona despliegue en hardware de consumo, como tarjetas RTX 3060 o superiores. Para entrenamiento, se recomienda al menos 8 GB de VRAM.
- Compatibilidad con consumer GPU: sí, es uno de los objetivos del diseño de SmolVLA.
- Opciones de despliegue: el modelo se integra con LeRobot, que ofrece scripts de rollout (`lerobot-rollout`) y entrenamiento (`lerobot-train`). No se mencionan compatibilidades con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo estándar.
- Latencia y throughput: no disponibles en la documentación. Dado el tamaño, se espera una inferencia en tiempo real en GPU modernas, pero no hay datos medidos.

## Comparativa con modelos similares

SmolVLA se posiciona frente a otros VLA como OpenVLA (7B parámetros) y RT-2 (55B). La comparativa cualitativa se basa en el paper original:

| Modelo | Parametros | Contexto | Licencia | Despliegue en consumer GPU |
|---|---|---|---|---|
| SmolVLA (este repo) | 450M | no disponible | Apache 2.0 | Sí |
| OpenVLA | 7B | no disponible | MIT (pesos) | Limitado (requiere cuantización agresiva) |
| RT-2 | 55B | no disponible | Propietaria | No |

SmolVLA es entre 15 y 120 veces más pequeño que estos modelos, lo que reduce drásticamente los requisitos de hardware y el coste de inferencia, a costa de un rendimiento potencialmente inferior en tareas complejas. No se dispone de benchmarks comparativos en la información proporcionada.

## Limitaciones y advertencias

- Overfitting al entorno de entrenamiento: el modelo fue entrenado con un dataset reducido (100 episodios) en un entorno específico; es probable que no generalice bien a cambios de iluminación, posición de cámara, objetos distintos o variaciones en la mesa de trabajo.
- Sin resultados de evaluación: no hay métricas de éxito en robot real, por lo que el rendimiento esperado es incierto.
- Dependencia de la configuración de cámaras: el modelo espera exactamente tres imágenes de entrada con resolución 256x256; cambios en el número o disposición de cámaras requieren reentrenamiento.
- Tarea única: el ajuste fino está especializado en clasificación por color; no es un modelo generalista para cualquier tarea de manipulación.
- Riesgo de alucinación en instrucciones ambiguas: como cualquier modelo basado en VLM, puede malinterpretar instrucciones no vistas en el entrenamiento, produciendo acciones incorrectas.
- Sin soporte para tool calling ni agentes: al ser un modelo de control robótico, no ofrece capacidades de razonamiento conversacional ni integración con APIs externas.
- Licencia Apache 2.0: permite uso comercial sin restricciones, pero el dataset de entrenamiento puede tener sus propias condiciones (no se detallan).

## Enlaces

- Repositorio del modelo: https://huggingface.co/HyeonseokE/smolvla_phase1_sort_by_color_A2_2000_10fps
- Paper original de SmolVLA: https://arxiv.org/abs/2506.01844
- Blog de Hugging Face sobre SmolVLA: https://github.com/huggingface/blog/blob/main/smolvla.md
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/phase1_sort_by_color_A2_10fps
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
