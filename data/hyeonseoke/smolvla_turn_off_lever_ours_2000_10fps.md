# HyeonseokE/smolvla_turn_off_lever_ours_2000_10fps

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face que combina percepción visual, razonamiento lingüístico y control de acciones robóticas. Este repositorio concreto, `HyeonseokE/smolvla_turn_off_lever_ours_2000_10fps`, es un fine-tuning del modelo base `lerobot/smolvla_base` realizado por HyeonseokE para la tarea de apagar una palanca ("Turn the lever off; the status indicator should turn red"). Está entrenado con la librería LeRobot y tiene un total de 450.046.176 parámetros, con un peso del repositorio de 0,9 GB.

El modelo está diseñado para ejecutarse en hardware de consumo, lo que lo hace relevante para la investigación en robótica de bajo coste y el aprendizaje por imitación. Su entrada principal son observaciones de estado (6 dimensiones) e imágenes de hasta tres cámaras a resolución 256×256, y produce acciones de 6 dimensiones para controlar un robot manipulador. Al tratarse de un fine-tuning específico para una tarea concreta, su aplicación principal es la manipulación robótica de precisión en entornos controlados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (visión-lenguaje-acción) basada en SmolVLA, fine-tuning de `lerobot/smolvla_base` |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos están en formato `safetensors`) |
| Idiomas soportados | no disponible (es un modelo de acción robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA compacto que hereda su arquitectura del modelo base `lerobot/smolvla_base`. Combina un codificador visual que procesa imágenes de 256×256, un modelo de lenguaje para interpretar instrucciones y una cabeza de acción que genera los valores de control del robot. Este fine-tuning se ha entrenado mediante aprendizaje por imitación supervisada, sin etapas de RLHF ni DPO.

El dataset de entrenamiento es `HyeonseokE/turn_off_lever_ours_10fps`, que contiene 100 episodios y 21.682 frames capturados a 10 FPS. La configuración de entrenamiento incluye 16.900 pasos, un tamaño de lote de 64, el optimizador AdamW con una tasa de aprendizaje de 0,0001 y una semilla de 2000. El modelo fue fine-tuneado con la versión 0.6.0 de LeRobot sobre un robot tipo `so101_follower` con cámaras `top` y `left_wrist`.

## Capacidades

- Genera acciones de 6 dimensiones para controlar un robot manipulador, incluyendo posiciones articulares en radianes.
- Procesa observaciones visuales de hasta tres cámaras a resolución 256×256, junto con el estado del robot de 6 dimensiones.
- Está especializado en la tarea de apagar una palanca mediante un movimiento de rotación del efector.
- No genera texto: es un policy de bajo nivel orientado a control robótico.
- No soporta tool calling ni function calling.
- No es un modelo de agentes ni de razonamiento multi-paso; su salida es directamente una acción de control.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Apagado de palancas en entornos industriales: el modelo puede controlar un brazo robótico SO-101 para girar una palanca de seguridad en tareas de mantenimiento. Gracias a las observaciones de estado y a las imágenes de las cámaras superior y de muñeca, el robot puede orientar el efector y ejecutar el movimiento necesario.
- Investigación en aprendizaje por imitación: permite estudiar cómo un modelo VLA compacto aprende una tarea manipulativa a partir de demostraciones teleoperadas. Los 100 episodios del dataset ofrecen una referencia para comparar con otras políticas y analizar la transferencia de habilidades.
- Automatización de laboratorios: en protocolos que requieren accionar interruptores, válvulas o palancas de forma repetitiva, el modelo puede ejecutar la secuencia de manera autónoma, reduciendo la intervención humana.
- Despliegue en robots de bajo coste: al contar con 450M parámetros y un peso de 0,9 GB, puede ejecutarse en GPUs de consumo, facilitando la adopción de la robótica en entornos académicos y de pequeñas empresas.
- Entrenamiento de políticas con LeRobot: sirve como ejemplo práctico de fine-tuning desde el modelo base `smolvla_base`. La configuración de entrenamiento está documentada en la guía de LeRobot, lo que permite reproducir el proceso y adaptarlo a otras tareas.
- Evaluación de robustez visual: al estar entrenado con cámaras a 256×256, permite probar la respuesta del modelo ante cambios de iluminación, oclusiones o variaciones en la posición de la palanca, lo que resulta útil para validar la generalización del policy.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo card del autor indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada: con 450M parámetros en FP16 (~0,9 GB), la inferencia puede requerir entre 2 y 4 GB de VRAM, incluyendo activaciones y buffers de imágenes. Se recomienda disponer de al menos 4 GB para un funcionamiento estable.
- GPU recomendadas: cualquier GPU de consumo con soporte CUDA, como una RTX 3060 de 12 GB, RTX 4060 o superiores. También es apta para GPUs profesionales como A10 o A100.
- El modelo cabe en GPUs de consumo de gama media, lo que facilita su despliegue en estaciones de trabajo locales.
- Opciones de despliegue: exclusivamente a través de LeRobot, mediante los comandos `lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento. No se han documentado despliegues con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HyeonseokE/smolvla_turn_off_lever_ours_2000_10fps | 450.046.176 | Apagar palanca | HyeonseokE/turn_off_lever_ours_10fps | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible | Preentrenamiento general VLA | no disponible | Apache 2.0 | Hugging Face |
| HyeonseokE/smolvla_turn_off_lever_cap_1000_10fps | no disponible | Apagar palanca (configuración alternativa) | no disponible | Apache 2.0 | Hugging Face |

No se dispone de información suficiente sobre el rendimiento de estos modelos para realizar una comparativa de benchmarks. El modelo base `lerobot/smolvla_base` es la referencia preentrenada de la que parte este fine-tuning, mientras que el otro repositorio del mismo autor es una variante con distinta configuración de entrenamiento.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación en el modelo card, por lo que el rendimiento real en el robot no está validado.
- El fine-tuning está especializado en una tarea concreta (apagar una palanca) y en un robot específico (`so101_follower`). La generalización a otros robots, objetos o entornos no está demostrada.
- El dataset de entrenamiento es pequeño (100 episodios, 21.682 frames), lo que puede limitar la robustez ante variaciones de iluminación, posiciones o distracciones.
- Al ser un modelo de acción, los errores se manifiestan como acciones incorrectas ante entradas visuales ambiguas o fuera de distribución, lo que podría causar movimientos no deseados.
- El modelo depende de la calibración de las cámaras y del estado del robot. Cambios en la disposición o en el tipo de cámaras requieren un reentrenamiento o adaptación.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda citar el método original (SmolVLA) y LeRobot al publicar resultados.

## Enlaces

- Repositorio del modelo: https://huggingface.co/HyeonseokE/smolvla_turn_off_lever_ours_2000_10fps
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/turn_off_lever_ours_10fps
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
- Variante alternativa del mismo autor: https://huggingface.co/HyeonseokE/smolvla_turn_off_lever_cap_1000_10fps
