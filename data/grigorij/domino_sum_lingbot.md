# Grigorij/Domino_sum_lingbot

## Resumen

Grigorij/Domino_sum_lingbot es una política robótica de imitación basada en LingBot-VA, un modelo de mundo autoregresivo de video-acción desarrollado sobre el stack de difusión de video Wan2.2. El modelo intercala la predicción de latentes de video futuros y acciones del robot en una única secuencia autoregresiva, realimentando los keyframes observados en su caché KV para lograr un modelado de mundo en bucle cerrado. Está entrenado con LeRobot (versión 0.6.1) y publicado bajo licencia Apache-2.0.

La política está diseñada para el robot seguidor de mano `so_follower` y utiliza dos cámaras (frontal y de brazo) que capturan imágenes de 256x256 píxeles. Produce acciones de 6 dimensiones, probablemente correspondientes a la posición y orientación del efector final. El modelo fue entrenado con un dataset de 49 episodios (64 960 frames a 30 FPS) para la tarea de agarrar una ficha de dominó y colocarla con precisión junto a otra. El repositorio ocupa 0,4 GB y contiene pesos en formato safetensors.

Este modelo es relevante porque representa una aproximación reciente en robótica: políticas que modelan el mundo a través de video generativo y acciones simultáneamente, lo que puede mejorar la predicción de consecuencias y el control fino en manipulación. Sin embargo, al ser un entrenamiento pequeño y específico, su aplicabilidad fuera de la tarea demostrada es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LingBot-VA (world-model autoregresivo de video-accion sobre Wan2.2 video-diffusion) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (secuencia autoregresiva de video y acciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica, modelo de robotica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LingBot-VA es una política de tipo world-model que combina la generación de video con el control por acciones. Se basa en el stack de difusión de video Wan2.2, pero en lugar de generar video de forma independiente, intercala la predicción de latentes de video futuro y acciones de robot en una única secuencia autoregresiva. Los keyframes observados se realimentan en la caché KV del modelo, permitiendo un modelado de mundo en bucle cerrado que tiene en cuenta el estado actual del entorno.

El entrenamiento se realizó con LeRobot sobre un dataset propio (`Grigorij/Domino_sum`) que contiene 49 episodios y 64 960 frames a 30 FPS. Se usaron dos cámaras (frontal y brazo) con resolución de entrada de 256x256. La configuración de entrenamiento incluye 5000 pasos, batch size de 1, optimizador AdamW, learning rate de 1e-5 y semilla 1000. No se reporta el uso de técnicas como RLHF o DPO; es un entrenamiento de imitación supervisada estándar.

## Capacidades

- Control robótico de manipulación: produce acciones de 6 dimensiones (posición y orientación) a partir de observaciones visuales de dos cámaras.
- Modelado de mundo en bucle cerrado: realimenta keyframes observados en su caché KV para predecir estados futuros y acciones de forma coherente.
- Generación de video latente intercalada con acciones: permite anticipar consecuencias visuales de las acciones, lo que puede mejorar la precisión en tareas de colocación.
- Entrenamiento específico para tareas de agarre y colocación precisa de objetos pequeños (fichas de dominó).
- Compatible con el ecosistema LeRobot: se puede ejecutar y entrenar mediante los comandos `lerobot-rollout` y `lerobot-train`.
- No soporta tool calling, agentes ni procesamiento de lenguaje natural; es una política puramente visual-motora.

## Casos de uso

- Ensamblaje de precisión en líneas de producción: el modelo puede controlar un robot para colocar piezas pequeñas con tolerancias milimétricas, gracias a su modelado de mundo que anticipa el resultado de cada movimiento.
- Manipulación de objetos en entornos estructurados: tareas como apilar, alinear o insertar componentes donde la posición relativa es crítica y las cámaras fijas proporcionan una vista estable.
- Investigación en aprendizaje por imitación: sirve como banco de pruebas para comparar políticas de world-model con otras arquitecturas (ACT, Diffusion Policy) en tareas de manipulación.
- Automatización de laboratorios: colocación de muestras, portaobjetos o microplacas en posiciones exactas, donde el robot puede operar con dos cámaras de alta resolución.
- Robótica educativa y prototipado: al estar integrado en LeRobot, permite a desarrolladores e investigadores reproducir el entrenamiento y adaptarlo a tareas similares con datasets pequeños.
- Control fino de efector final en robots de bajo coste: el robot `so_follower` es un seguidor de mano asequible, lo que facilita la experimentación en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real. Por tanto, no se dispone de métricas de éxito, tasas de acierto ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de VRAM ni GPU recomendada en la model card.
- El tamaño del repositorio (0,4 GB) sugiere un modelo relativamente pequeño, pero al estar basado en un stack de difusión de video, la inferencia puede requerir más memoria que un modelo puramente transformer.
- Se recomienda una GPU con soporte CUDA y al menos 8 GB de VRAM para ejecutar la política con LeRobot, aunque esto es una estimación no verificada.
- El despliegue se realiza mediante el ecosistema LeRobot, que usa PyTorch; no es compatible con vLLM, llama.cpp u Ollama, orientados a modelos de lenguaje.
- La latencia y el throughput no están documentados; dependerán del hardware y de la longitud de la secuencia autoregresiva.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas de world-model video-acción) dentro de la documentación proporcionada. Otras políticas de LeRobot como ACT o Diffusion Policy existen, pero no se han incluido datos de comparación. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Entrenamiento con dataset muy pequeño (49 episodios), lo que aumenta el riesgo de sobreajuste y limita la generalización a variaciones de la tarea o del entorno.
- Específico para el robot `so_follower` y la configuración de cámaras `front` y `arm`; no es transferible directamente a otros robots o disposiciones de sensores.
- No se han reportado evaluaciones en robot real; el rendimiento real es desconocido.
- La tarea está muy acotada (agarrar y colocar fichas de dominó); no es adecuado para tareas de manipulación general o entornos no estructurados.
- Al ser un modelo de difusión de video, puede presentar latencia elevada en inferencia si la secuencia autoregresiva es larga.
- No se han documentado sesgos específicos, pero al entrenarse con un único operador y entorno, puede heredar sesgos de la demostración.
- La licencia Apache-2.0 permite uso comercial, pero el modelo depende de Wan2.2 y LingBot-VA, cuyas licencias deben verificarse por separado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Grigorij/Domino_sum_lingbot
- Código de LingBot-VA: https://github.com/Robbyant/lingbot-va
- Documentación de LeRobot para LingBot-VA: https://huggingface.co/docs/lerobot/main/en/lingbot_va
- Documentación general de LeRobot: https://huggingface.co/docs/lerobot/index
- Dataset de entrenamiento: https://huggingface.co/datasets/Grigorij/Domino_sum
