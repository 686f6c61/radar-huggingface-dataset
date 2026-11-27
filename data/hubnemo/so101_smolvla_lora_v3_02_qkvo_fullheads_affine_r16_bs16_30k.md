# hubnemo/so101_smolvla_lora_v3_02_qkvo_fullheads_affine_r16_bs16_30k

## Resumen

El modelo `hubnemo/so101_smolvla_lora_v3_02_qkvo_fullheads_affine_r16_bs16_30k` es un adaptador LoRA sobre `lerobot/smolvla_base`, un modelo visión-lenguaje-acción (VLA) compacto desarrollado en el ecosistema LeRobot de Hugging Face. Está especializado en una única tarea de manipulación robótica: coger un cubo morado e introducirlo en una caja de cartón, ignorando el resto de objetos de la escena. Se ha entrenado con el dataset `Orellius/so101_sort_cubes_no_top` sobre un robot `so101_follower` con una única cámara frontal.

La relevancia de este modelo es acotada pero representativa del flujo de trabajo actual en robótica de imitación: un adaptador de bajo rango (r=16) que ajusta un VLA base preentrenado para una tarea concreta con pocos datos (77 episodios, 54.777 fotogramas a 30 FPS) y 30.000 pasos de entrenamiento. El resultado es un artefacto reproducible y desplegable en hardware de consumo mediante la librería `lerobot`, con licencia Apache 2.0.

No hay información disponible sobre el número de parámetros del modelo base ni sobre la longitud de contexto, ya que SmolVLA no se documenta en esta ficha con esos parámetros en el sentido de un LLM de texto. El repositorio tiene un tamaño de 0,0 GB según Hugging Face, lo que sugiere que los pesos del adaptador son muy ligeros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA; adaptador LoRA sobre `lerobot/smolvla_base` |
| Parametros totales | no disponible (adaptador LoRA con rango r=16 sobre el modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a acciones robóticas, no a texto multilingüe) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo visión-lenguaje-acción compacto que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones para producir comandos motores a partir de observaciones visuales y del estado del robot. Este repositorio concreto es un adaptador LoRA de rango 16 (`qkvo_fullheads_affine_r16`) entrenado sobre el modelo base `lerobot/smolvla_base`, lo que indica que se ajustan las proyecciones de query, key, value y output de la atención, además de las cabezas completas, con parámetros de normalización afín.

El entrenamiento se realizó con el dataset `Orellius/so101_sort_cubes_no_top`, compuesto por 77 episodios y 54.777 fotogramas a 30 FPS, con la tarea "Grab the purple cube and put it into the cardboard box, ignore the other objects". La configuración reportada incluye 30.000 pasos, batch size de 16, optimizador AdamW, learning rate de 0,0005, semilla 1000 y LeRobot 0.7.1. No se especifica el número de tokens de entrenamiento ni si hubo RLHF o DPO, algo que no aplica de forma directa a un modelo de imitación robótica.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 dimensiones (`action`, shape `(6,)`) para un robot `so101_follower`.
- Percepción visual monocámara: consume imágenes de una cámara frontal a resolución `(3, 480, 640)`.
- Condicionamiento por estado del robot: recibe `observation.state` de shape `(6,)` junto con la imagen.
- Ejecución de una tarea específica de pick-and-place: coger el cubo morado e introducirlo en una caja de cartón, ignorando otros objetos.
- Integración con LeRobot: se ejecuta mediante `lerobot-rollout` y se entrena con `lerobot-train`.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de un agente conversacional.
- No se documentan capacidades multilingües ni modos de pensamiento (thinking mode), visión general o audio.

## Casos de uso

- Clasificación de cubos en línea de montaje: el modelo puede ejecutar la tarea de recoger el cubo morado y depositarlo en una caja, adecuado para demostrar un pipeline completo de imitación con un robot SO-101 de bajo coste.
- Prototipado de políticas VLA en laboratorio: sirve como punto de partida para investigadores que quieran validar el flujo `lerobot-train` → `lerobot-rollout` con un adaptador LoRA ligero antes de escalar a tareas propias.
- Evaluación de fine-tuning con LoRA en robótica: permite estudiar el efecto de un adaptador de rango 16 sobre un VLA base con un dataset pequeño (77 episodios), como referencia para experimentos de eficiencia de parámetros.
- Docencia y formación en robótica de imitación: el modelo y su dataset asociado permiten reproducir un caso completo de entrenamiento y despliegue en hardware de consumo.
- Benchmark interno de manipulación: puede usarse como línea base de éxito en la tarea "sort cubes" para comparar con otras configuraciones de fine-tuning sobre el mismo dataset.
- Demostración de despliegue en robot de bajo coste: al estar pensado para hardware de consumo, encaja en demostraciones de laboratorio o ferias con un SO-101 y una cámara USB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; al tratarse de un adaptador LoRA sobre un VLA compacto, se espera que quepa en GPU de consumo, pero no se confirma con datos.
- GPU recomendadas: no disponible; SmolVLA se describe como desplegable en hardware de consumo, sin especificar modelos concretos.
- Compatibilidad con GPU de consumo: el modelo base se presenta como apto para hardware de consumo, pero no se detallan modelos ni VRAM.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` y `--policy.path=hubnemo/so101_smolvla_lora_v3_02_qkvo_fullheads_affine_r16_bs16_30k`; entrenamiento con `lerobot-train` y `--policy.path=lerobot/smolvla_base`.
- Latencia y throughput: no disponibles; el dataset se grabó a 30 FPS, pero no se reporta la latencia de inferencia del modelo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hubnemo/so101_smolvla_lora_v3_02_qkvo_fullheads_affine_r16_bs16_30k` | Adaptador LoRA sobre SmolVLA para tarea pick-and-place | no disponible | no disponible | apache-2.0 | Hugging Face |
| `lerobot/smolvla_base` | VLA base preentrenado | no disponible | no disponible | no disponible en la información | Hugging Face |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | Políticas de imitación robótica | no disponible | no disponible | no disponible | LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado para una única tarea y un único robot (`so101_follower`); no generaliza a otras tareas ni a otros brazos sin reentrenamiento.
- Depende de una cámara frontal concreta y de claves de observación específicas (`observation.images.front`); un cambio de cámara o de nombre de clave rompe la inferencia.
- No hay resultados de evaluación publicados, por lo que se desconoce la tasa de éxito real en la tarea.
- El dataset de entrenamiento es pequeño (77 episodios), lo que aumenta el riesgo de sobreajuste a posiciones, iluminación y objetos concretos.
- No se documentan sesgos, pero al ser un modelo visual puede verse afectado por condiciones de iluminación y por la presencia de objetos distractores no vistos en entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset asociado deben verificarse por separado.
- No es un modelo de lenguaje: no debe usarse para generación de texto, razonamiento o atención al cliente.
- El repositorio reporta 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hubnemo/so101_smolvla_lora_v3_02_qkvo_fullheads_affine_r16_bs16_30k
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Orellius/so101_sort_cubes_no_top
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Orellius/so101_sort_cubes_no_top
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
