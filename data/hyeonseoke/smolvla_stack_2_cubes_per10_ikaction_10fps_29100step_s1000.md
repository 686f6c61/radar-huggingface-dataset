# HyeonseokE/smolvla_stack_2_cubes_per10_ikaction_10fps_29100step_s1000

## Resumen

El modelo `HyeonseokE/smolvla_stack_2_cubes_per10_ikaction_10fps_29100step_s1000` es una política de robótica basada en SmolVLA, un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por HyeonseokE y publicado en Hugging Face. Se trata de un fine-tuning del modelo base `lerobot/smolvla_base`, entrenado para controlar un robot SO101 en la tarea de apilar un cubo verde sobre un cubo rojo. El modelo tiene 450.046.176 parámetros y se distribuye en formato safetensors, con un tamaño de repositorio de 0.9 GB.

SmolVLA está diseñado para ofrecer un rendimiento competitivo con un coste computacional reducido, lo que permite su despliegue en hardware de consumo. La longitud de contexto no está especificada en la información disponible. El modelo se integra con el ecosistema LeRobot, tanto para entrenamiento como para inferencia, y su licencia Apache 2.0 permite uso comercial con atribución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basado en SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un SmolVLA, un modelo de visión-lenguaje-acción compacto y eficiente. No se especifica en la información disponible la arquitectura interna exacta (tipo de transformer, número de capas, etc.). El modelo ha sido fine-tuneado a partir de `lerobot/smolvla_base` utilizando el framework LeRobot.

El dataset de entrenamiento es `HyeonseokE/redundancy_stack_2_cubes_per10_ikaction_10fps`, compuesto por 100 episodios y 37.272 frames a 10 FPS. La tarea se describe como "Stack the green block on the red block". La configuración de entrenamiento incluye 29.100 pasos, batch size de 64, optimizador AdamW, learning rate de 0.0001, seed 1000 y LeRobot versión 0.6.0. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. La innovación destacable es el diseño eficiente de SmolVLA, orientado a reducir el coste computacional y permitir el despliegue en hardware de consumo.

## Capacidades

- Control de robot SO101 a partir de observaciones de estado de 6 dimensiones y tres imágenes de 256x256 píxeles.
- Generación de acciones de 6 dimensiones (posiciones articulares en radianes) para manipulación.
- Seguimiento de instrucciones de lenguaje natural, limitado a la tarea para la que fue entrenado.
- Percepción visual multi-cámara: la model card indica cámaras `top` y `left_wrist`, mientras que las entradas definidas incluyen tres imágenes (`camera1`, `camera2`, `camera3`).
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No se menciona soporte de tool calling, agentes autónomos, razonamiento multi-paso ni capacidades multilingües.

## Casos de uso

- Apilamiento de cubos en entornos de laboratorio: el modelo controla el robot SO101 para ejecutar la tarea de colocar un cubo verde sobre un cubo rojo, utilizando la información visual de las cámaras y el estado articular.
- Automatización de tareas repetitivas de manipulación: gracias a su entrenamiento por imitación, el modelo puede reproducir la secuencia de acciones aprendida en condiciones similares a las del dataset.
- Investigación en aprendizaje por imitación: sirve como política de referencia para comparar el rendimiento de diferentes enfoques VLA sobre la misma tarea.
- Despliegue en hardware de consumo: su tamaño compacto (450M parámetros) permite ejecutarlo en GPUs de gama media, lo que facilita la experimentación en laboratorios con recursos limitados.
- Fine-tuning para tareas de apilamiento similares: el modelo puede utilizarse como punto de partida para adaptarlo a nuevas configuraciones de objetos o entornos mediante transferencia de aprendizaje.
- Evaluación de políticas robóticas en simulación: puede integrarse en pipelines de LeRobot para realizar rollouts y medir el rendimiento antes de probar en el robot real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que "no se han proporcionado resultados de evaluación para esta política". Por tanto, no se dispone de datos de éxito, precisión ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. El repositorio tiene un tamaño de 0.9 GB, lo que sugiere que los pesos ocupan aproximadamente 0.9 GB en FP16 o BF16. Se estima que se necesitaría al menos 1–2 GB de VRAM para cargar el modelo, pero no es un dato confirmado.
- GPU recomendadas: no disponibles. Dado el tamaño del modelo, podría ejecutarse en GPUs de consumo con al menos 2 GB de VRAM, aunque no hay información oficial al respecto.
- Despliegue en consumer GPU: probablemente sí, dado el tamaño compacto, pero no está confirmado por el autor.
- Opciones de despliegue: LeRobot (comandos `lerobot-rollout` y `lerobot-train`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, ya que es un modelo robótico, no un modelo de lenguaje general.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa detallada. El modelo es un fine-tuning de `lerobot/smolvla_base`, que es el modelo base preentrenado de referencia. Existe otro modelo del mismo autor, `HyeonseokE/smolvla_stack_2_cubes_cap_1000_10fps`, pero no se han encontrado especificaciones públicas que permitan una comparación rigurosa. Por tanto, la comparativa se limita a indicar que este modelo está especializado en la tarea de apilamiento de dos cubos, mientras que el modelo base es genérico y requiere fine-tuning para tareas específicas.

## Limitaciones y advertencias

- Sesgos: el modelo se ha entrenado exclusivamente con un dataset de 100 episodios en un entorno controlado. Puede presentar sesgos hacia las condiciones específicas de iluminación, posición de objetos y configuración de cámaras del dataset.
- Riesgo de alucinación: al ser un modelo de acción, la "alucinación" se manifiesta como acciones incorrectas o inconsistentes con la observación. No se han realizado evaluaciones de seguridad ni de robustez.
- Limitaciones de contexto o idioma: la longitud de contexto no está especificada. La tarea se describe en inglés, pero no se indica soporte para otros idiomas.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificación y distribución, siempre que se mantenga el aviso de copyright y se incluya una copia de la licencia.
- Caveats para producción: no se han publicado resultados de evaluación en robot real. El modelo está diseñado para una tarea muy concreta y su generalización a otros escenarios no está validada. Las cámaras y el robot deben coincidir con los utilizados durante el entrenamiento, tal y como se indica en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HyeonseokE/smolvla_stack_2_cubes_per10_ikaction_10fps_29100step_s1000
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/redundancy_stack_2_cubes_per10_ikaction_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
