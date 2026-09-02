# HyeonseokE/smolvla_phase1_sort_by_color_A1_via4cm_3000_10fps

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, desarrollado por Hugging Face y presentado en el artículo "SmolVLA: A Vision-Language-Action Model for Affordable and Efficient Robot Learning" (arXiv:2506.01844). Este fine-tune concreto, `smolvla_phase1_sort_by_color_A1_via4cm_3000_10fps`, ha sido entrenado por HyeonseokE a partir del modelo base `lerobot/smolvla_base` para ejecutar una tarea de manipulación robótica: clasificar bloques de colores en platos del color correspondiente. El modelo tiene 450 millones de parámetros y un tamaño de repositorio de 0,9 GB, lo que lo hace desplegable en hardware de consumo.

La relevancia de este modelo radica en que demuestra cómo un VLA compacto puede especializarse en una tarea robótica concreta mediante fine-tuning con el framework LeRobot, utilizando un dataset de 100 episodios grabados a 10 FPS. Al estar licenciado bajo Apache 2.0, puede utilizarse comercialmente sin restricciones. El modelo consume observaciones de estado del robot y tres imágenes de cámara, y produce acciones de 6 dimensiones para el robot SO-101.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA (VLM compacto + action expert con flow matching) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (la instruccion de tarea esta en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA combina un modelo de vision-lenguaje (VLM) preentrenado y compacto con un "action expert" entrenado mediante flow matching. Dado un conjunto de imágenes y una instrucción en lenguaje natural, el modelo genera un chunk de acciones para el robot. Este fine-tune parte de `lerobot/smolvla_base` y se entrena con el framework LeRobot sobre el dataset `HyeonseokE/phase1_sort_by_color_A1_10fps_via4cm`, que contiene 100 episodios y 74.505 frames a 10 FPS. La configuración de entrenamiento incluye 58.200 pasos, batch size de 64, optimizador AdamW, learning rate de 0,0001 y semilla 3000. No se menciona el uso de RLHF ni DPO; el entrenamiento es de imitación supervisada.

El modelo recibe como entrada el estado del robot (6 valores), tres imágenes de 256x256 píxeles (cámaras `top`, `left_wrist` y una tercera no especificada en la model card) y produce una acción de 6 dimensiones. La arquitectura interna (número de capas, atención, etc.) no se detalla en la información disponible, pero se sabe que es un VLA compacto diseñado para eficiencia computacional.

## Capacidades

- Generación de acciones de control para un robot manipulador SO-101 (6 grados de libertad).
- Percepción visual multi-cámara: procesa tres imágenes simultáneas de 256x256 píxeles.
- Comprensión de instrucciones en lenguaje natural para guiar la tarea (por ejemplo, "Sort the blocks onto the matching colored dishes").
- Ejecución de tareas de manipulación de precisión: clasificación de objetos por color.
- Inferencia a 10 FPS, alineada con la frecuencia de muestreo del dataset de entrenamiento.
- No es un modelo de lenguaje general: no genera texto, código ni responde preguntas.

## Casos de uso

- Clasificación automatizada de piezas en entornos industriales: el modelo puede ordenar componentes por color o atributo visual en una cinta transportadora, usando las cámaras para detectar la posición y el color de cada objeto.
- Robótica educativa y de investigación: sirve como punto de partida para estudiar fine-tuning de VLA en tareas de manipulación, gracias a su tamaño reducido y licencia permisiva.
- Prototipado rápido de políticas robóticas: con LeRobot, se puede desplegar el modelo en un robot SO-101 en minutos, permitiendo iterar sobre nuevas tareas con datasets pequeños.
- Automatización de tareas de pick-and-place en almacenes: aunque entrenado para clasificar por color, el enfoque puede adaptarse a otras tareas de manipulación con fine-tuning adicional.
- Benchmarking de VLA en hardware de consumo: al tener solo 450M parámetros, permite comparar rendimiento y latencia en GPUs domésticas frente a modelos más grandes.
- Demostración de aprendizaje por imitación: el modelo ejemplifica cómo un dataset de 100 episodios puede transferir una habilidad concreta a un robot, útil para validar pipelines de recolección de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en tareas reales ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 450M parámetros y pesos en fp32, el modelo ocupa aproximadamente 1,8 GB; en fp16, alrededor de 0,9 GB. Cabe en cualquier GPU con al menos 4 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA, desde una RTX 3060 (12 GB) hasta una RTX 4090. También puede ejecutarse en GPUs de datacenter como A100 o H100, aunque no son necesarias.
- Compatibilidad con hardware de consumo: sí, es uno de los objetivos de SmolVLA. Una GPU de gama media es suficiente para inferencia en tiempo real.
- Opciones de despliegue: el modelo se integra con LeRobot, que proporciona scripts de rollout (`lerobot-rollout`) y entrenamiento (`lerobot-train`). No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un LLM generativo.
- Latencia y throughput: no disponibles. Dado el tamaño y la naturaleza del modelo, se espera una latencia baja en GPU moderna, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. Sin embargo, se puede comparar estructuralmente con el modelo base y otros fine-tunes del mismo autor:

| Modelo | Parametros | Contexto | Licencia | Tarea |
|---|---|---|---|---|
| `lerobot/smolvla_base` | 450M (aprox.) | no disponible | Apache 2.0 | VLA generalista |
| `HyeonseokE/smolvla_phase1_sort_by_color_A1_1000_10fps` | 450M (aprox.) | no disponible | Apache 2.0 | Clasificacion por color (seed 1000) |
| `HyeonseokE/smolvla_phase1_pick_place_A1_1000_10fps` | 450M (aprox.) | no disponible | Apache 2.0 | Pick-and-place (seed 1000) |
| `HyeonseokE/smolvla_phase1_sort_by_color_A1_via4cm_3000_10fps` | 450.046.176 | no disponible | Apache 2.0 | Clasificacion por color (seed 3000) |

No se dispone de información sobre otros VLA de tamaño similar (por ejemplo, OpenVLA o RT-2) en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado para una única tarea (clasificar bloques por color) y no generaliza a otras tareas sin fine-tuning adicional.
- Sin evaluación publicada: no hay tasas de éxito ni pruebas en robot real reportadas, por lo que su rendimiento efectivo es desconocido.
- Dependencia del dataset: el rendimiento depende de la calidad y variedad de los 100 episodios de entrenamiento; puede fallar ante variaciones de iluminación, posición de objetos o distracciones no vistas.
- Discrepancia en cámaras: la model card menciona dos cámaras (`top`, `left_wrist`), pero la tabla de entradas indica tres imágenes (`camera1`, `camera2`, `camera3`). Esto puede causar errores de configuración al desplegar.
- Idioma de la instrucción: la tarea está definida en inglés; no se ha probado con instrucciones en otros idiomas.
- Riesgo de sobreajuste: con solo 100 episodios, el modelo puede memorizar trayectorias específicas en lugar de aprender una política robusta.
- Sin soporte para generación de texto: no es adecuado para tareas de NLP o chatbots.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HyeonseokE/smolvla_phase1_sort_by_color_A1_via4cm_3000_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/phase1_sort_by_color_A1_10fps_via4cm
- Paper SmolVLA: https://arxiv.org/abs/2506.01844
- Version HTML del paper: https://arxiv.org/html/2506.01844v1
- Guia de LeRobot para SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
