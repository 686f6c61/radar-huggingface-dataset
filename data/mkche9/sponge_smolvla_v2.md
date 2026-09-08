# mkche9/sponge_smolvla_v2

## Resumen

El modelo `mkche9/sponge_smolvla_v2` es una política de visión-lenguaje-acción (VLA) desarrollada por mkche9 mediante ajuste fino del modelo base `lerobot/smolvla_base` de Hugging Face. Se trata de un modelo compacto y eficiente, diseñado para tareas de robótica de manipulación, que puede entrenarse en una sola GPU y desplegarse en hardware de consumo. Este ajuste fino está especializado en la tarea de recoger una esponja y colocarla en una caja, utilizando un robot tipo `so_follower` con varias cámaras. El modelo tiene 450.046.176 parámetros y un tamaño de 0,9 GB, y se distribuye bajo licencia Apache 2.0. Su relevancia radica en ofrecer una alternativa ligera a los modelos VLA de gran tamaño, permitiendo el desarrollo de políticas robóticas en entornos con recursos limitados. La longitud de contexto no está especificada en la información disponible, al tratarse de un modelo de acción robótica más que de un modelo de lenguaje.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) |
| Parámetros totales | 450.046.176 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `lerobot/smolvla_base`, un modelo VLA compacto y eficiente que, según la documentación de Hugging Face, es entrenable en una sola GPU y desplegable en hardware de consumo. La arquitectura interna no se detalla en la información disponible, pero se trata de una política de visión-lenguaje-acción que consume observaciones multimodales (estado del robot e imágenes de cámaras) y produce acciones de control.

El entrenamiento se realizó sobre el dataset `mkche9/sponge_pick_merged_v2`, compuesto por 300 episodios y 155.042 frames a 30 FPS, con la tarea "pick sponge and place in box". La configuración de entrenamiento incluye 50.000 pasos, batch size de 16, optimizador AdamW, learning rate de 0,0001, seed 1000 y la versión 0.6.1 de LeRobot. No se menciona el uso de RLHF ni DPO; se trata de aprendizaje por imitación supervisada.

## Capacidades

- Generación de acciones robóticas de 6 dimensiones a partir de observaciones de estado y de imágenes de cámaras.
- Entrada multimodal: estado del robot (6 valores) e imágenes de varias cámaras (`camera1`, `camera2`, `camera3` y `empty_camera_0`), con resoluciones de 256x256 y 480x640.
- Salida: acción continua de 6 dimensiones, adecuada para el control de un robot seguidor (`so_follower`).
- Especialización en la tarea de recoger una esponja y colocarla en una caja.
- Al estar basado en SmolVLA, es eficiente y apto para hardware de consumo.
- No soporta tool calling, agentes ni capacidades de lenguaje natural; es exclusivamente una política de acción robótica.

## Casos de uso

- Automatización de pick-and-place en entornos industriales: el modelo ejecuta la tarea de recoger una esponja y colocarla en una caja, y puede adaptarse a otros objetos similares con reentrenamiento sobre datasets específicos.
- Investigación en aprendizaje por imitación: sirve como ejemplo de ajuste fino de un modelo VLA base sobre un dataset pequeño (300 episodios) para una tarea concreta, útil para estudiar la transferencia de políticas.
- Prototipado rápido en laboratorios de robótica: gracias a su tamaño reducido y a la compatibilidad con LeRobot, permite iterar rápidamente en el diseño de políticas para robots de bajo coste.
- Robótica educativa y formación: se puede utilizar en cursos de robótica para enseñar el flujo completo de LeRobot, desde la grabación de datos hasta el despliegue de una política.
- Integración en sistemas de automatización logística: el modelo puede desplegarse en brazos robóticos o robots móviles que realicen tareas de manipulación repetitivas.
- Evaluación de políticas VLA en hardware de consumo: permite comparar el rendimiento de un modelo compacto frente a alternativas de mayor tamaño en un robot real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del modelo (0,9 GB) sugiere que puede ejecutarse en GPUs de consumo, pero no se proporcionan cifras oficiales.
- GPU recomendadas: no disponible.
- Compatibilidad con hardware de consumo: el modelo base SmolVLA está diseñado para desplegarse en hardware de consumo, según la documentación.
- Opciones de despliegue: mediante el framework LeRobot, usando el comando `lerobot-rollout`. No es compatible con vLLM, llama.cpp ni Ollama, al ser un modelo de robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. El modelo base `lerobot/smolvla_base` es el punto de partida, pero no se han encontrado datos de rendimiento de otros modelos VLA comparables en la información proporcionada.

## Limitaciones y advertencias

- No se han proporcionado resultados de evaluación, por lo que se desconoce la tasa de éxito real en la tarea.
- El modelo está especializado en una tarea concreta (recoger esponja y colocarla en caja) y puede no generalizar a otros objetos, posiciones o entornos.
- Depende de la configuración específica del robot (`so_follower`) y de las cámaras, por lo que puede requerir ajustes para otros robots.
- No se han descrito sesgos conocidos, pero al estar entrenado con un dataset limitado (300 episodios) puede heredar sesgos del entorno de grabación.
- La licencia Apache 2.0 permite uso comercial, pero requiere mantener el aviso de licencia y la atribución.
- Al ser un modelo de acción, no es adecuado para tareas de lenguaje natural o generación de texto.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/mkche9/sponge_smolvla_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/mkche9/sponge_pick_merged_v2
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
