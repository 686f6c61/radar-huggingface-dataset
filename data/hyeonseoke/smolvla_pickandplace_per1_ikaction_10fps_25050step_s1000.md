# HyeonseokE/smolvla_pickandplace_per1_ikaction_10fps_25050step_s1000

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (Vision-Language-Action, VLA) desarrollado por Hugging Face y presentado en el artículo arXiv:2506.01844. Está diseñado para políticas de robótica que combinan observaciones visuales y de estado del robot para generar comandos de acción, con un coste computacional reducido que permite su despliegue en hardware de consumo. Este repositorio concreto, `HyeonseokE/smolvla_pickandplace_per1_ikaction_10fps_25050step_s1000`, es un ajuste fino (fine-tune) del modelo base `lerobot/smolvla_base` para la tarea de recoger un bloque rojo y colocarlo en un plato azul, usando un brazo robótico tipo `so101_follower`. El modelo tiene aproximadamente 450 millones de parámetros y se distribuye en formato `safetensors` bajo licencia Apache 2.0, entrenado con el framework LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA compacto que integra un codificador visual, un modelo de lenguaje y una cabeza de acción para generar comandos de control en robótica. Su diseño busca un equilibrio entre rendimiento y eficiencia computacional, permitiendo su ejecución en hardware de consumo. En este caso, el modelo ha sido ajustado a partir de `lerobot/smolvla_base` utilizando el dataset `HyeonseokE/redundancy_pickandplace_per1_ikaction_10fps`, compuesto por 10 episodios y 3.350 frames a 10 FPS. La tarea de entrenamiento es "Pick up the red block and place it on the blue dish" (recoger el bloque rojo y colocarlo sobre el plato azul). El entrenamiento se realizó con 25.050 pasos, tamaño de lote 64, optimizador AdamW, tasa de aprendizaje 0,0001, semilla 1000 y la versión 0.6.0 de LeRobot. No se menciona el uso de RLHF, DPO ni otras técnicas de alineamiento.

## Capacidades

- Generación de acciones de control en robótica a partir de observaciones visuales y de estado del robot.
- Entrada multimodal: imagen de cámaras (3 canales, resolución 256x256) y vector de estado de 6 dimensiones.
- Salida de acción de 6 dimensiones (comandos articulares o de espacio de tarea).
- Modelo especializado en una tarea concreta de pick-and-place sobre un robot SO-101.
- Compatibilidad con el ecosistema LeRobot para entrenamiento y despliegue.
- No es un modelo de generación de texto ni soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.

## Casos de uso

- **Investigación en aprendizaje por imitación**: el modelo puede utilizarse como referencia para estudiar políticas VLA compactas y su transferencia a tareas de manipulación con pocos datos.
- **Automatización de pick-and-place en entornos controlados**: dada la tarea específica para la que fue entrenado, es útil en laboratorios o líneas de montaje simples donde se repite la operación de recoger un bloque rojo y depositarlo en un plato azul.
- **Fine-tuning para nuevas tareas**: partiendo de este checkpoint, se puede ajustar el modelo a otras tareas de manipulación con el framework LeRobot, siempre que se disponga de datos de demostración.
- **Benchmark de eficiencia**: al tener ~450 millones de parámetros, sirve como caso de estudio para comparar VLA de pequeño tamaño frente a modelos más grandes en términos de latencia y requisitos de hardware.
- **Integración en pipelines de robótica con LeRobot**: el modelo puede desplegarse directamente con los comandos `lerobot-rollout` y `lerobot-train` para experimentación rápida.
- **Docencia y prototipado**: dado su bajo coste computacional, es apto para cursos o proyectos de robótica donde se necesite una política funcional sin infraestructura de GPU costosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." Por tanto, no se dispone de tasas de éxito ni comparativas numéricas con otros modelos.

## Requisitos de hardware

- Al ser un modelo de ~450 millones de parámetros y estar diseñado para hardware de consumo, se espera que pueda ejecutarse en GPUs de gama media.
- No se proporcionan cifras exactas de VRAM, latencia ni throughput en la documentación disponible.
- El despliegue se realiza preferentemente a través del framework LeRobot, con los comandos `lerobot-rollout` y `lerobot-train` indicados en la model card.
- Para el entrenamiento, se recomienda una GPU NVIDIA compatible con CUDA; no se especifican modelos concretos.
- En cuanto a opciones de despliegue, no se mencionan vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje de propósito general.

## Comparativa con modelos similares

Existen otros repositorios en HuggingFace con ajustes finos de SmolVLA para tareas similares, aunque no se dispone de sus especificaciones técnicas completas en la información proporcionada:

| Modelo | Base | Tarea | Licencia | Parametros |
|---|---|---|---|---|
| HyeonseokE/smolvla_pickandplace_per1_ikaction_10fps_25050step_s1000 | lerobot/smolvla_base | Pick-and-place (bloque rojo a plato azul) | Apache 2.0 | 450.046.176 |
| HyeonseokE/smolvla_phase1_pick_place_A1_1000_10fps | lerobot/smolvla_base | Pick-and-place | Apache 2.0 | no disponible |
| swpark5/smolvla_pickandplace__v3 | lerobot/smolvla_base | Pick-and-place | no disponible | no disponible |

No se han encontrado datos de benchmarks ni de rendimiento comparativo entre estos modelos.

## Limitaciones y advertencias

- El modelo ha sido entrenado con un dataset muy pequeño (10 episodios, 3.350 frames), lo que limita su generalización a nuevas posiciones, iluminación, objetos o variaciones de la tarea.
- No se han proporcionado resultados de evaluación en robot real, por lo que su tasa de éxito real es desconocida.
- La model card indica como cámaras `top` y `left_wrist`, pero la tabla de entradas lista tres cámaras (`camera1`, `camera2`, `camera3`). Esta discrepancia debe verificarse antes de usar el modelo en producción.
- El modelo está especializado en un único tipo de robot (`so101_follower`) y en una tarea concreta; no es reutilizable directamente para otros brazos o tareas sin reentrenamiento.
- Al ser un VLA, no es un modelo de lenguaje y no puede usarse para generación de texto, chatbots ni tareas de NLP.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo no incluye garantías de seguridad ni de rendimiento para entornos industriales.

## Enlaces

- Repositorio del modelo: https://huggingface.co/HyeonseokE/smolvla_pickandplace_per1_ikaction_10fps_25050step_s1000
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/redundancy_pickandplace_per1_ikaction_10fps
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HyeonseokE/redundancy_pickandplace_per1_ikaction_10fps
