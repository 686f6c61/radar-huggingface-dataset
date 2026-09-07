# HyeonseokE/smolvla_open_box_ours_3000_10fps

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, desarrollado por HyeonseokE como fine-tuning del modelo base `lerobot/smolvla_base`. Está entrenado para una tarea robótica concreta: abrir una caja moviendo la tapa hasta un marcador objetivo. El modelo se distribuye a través de Hugging Face y se gestiona con la librería LeRobot, lo que facilita su integración en pipelines de aprendizaje por imitación.

Con 450 millones de parámetros y un tamaño de repositorio de 0,9 GB, el modelo está diseñado para ejecutarse en hardware de consumo, según la documentación de SmolVLA. Su relevancia radica en que ofrece una alternativa ligera a los VLA de gran tamaño, permitiendo investigar y desplegar políticas de control robótico en entornos con recursos limitados. La tarea específica para la que fue fine-tuned es "Open the box by moving the lid to the target marker", usando un dataset de 100 episodios y 29.116 frames a 10 FPS.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tarea | Abrir una caja moviendo la tapa a un marcador objetivo |
| Dataset de entrenamiento | HyeonseokE/open_box_ours_10fps (100 episodios, 29.116 frames, 10 FPS) |
| Robot objetivo | so101_follower |
| Camaras | top, left_wrist (segun la model card; la tabla de entradas lista tres camaras) |
| Framework | LeRobot 0.6.0 |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción compacto, cuyo diseño se describe en el paper [SmolVLA](https://huggingface.co/papers/2506.01844). La información proporcionada no detalla la arquitectura interna (por ejemplo, si usa transformer, MoE o SSM), pero el modelo es un fine-tuning del checkpoint `lerobot/smolvla_base`. El entrenamiento se realizó con el framework LeRobot, utilizando el dataset `HyeonseokE/open_box_ours_10fps`, compuesto por 100 episodios y 29.116 frames a 10 FPS. La configuración de entrenamiento incluye 22.700 pasos, batch size de 64, optimizador AdamW, learning rate de 0,0001 y semilla 3000. No se mencionan técnicas de RLHF ni DPO en la información disponible.

El modelo consume observaciones de estado del robot (6 dimensiones) e imágenes de cámaras de 256x256. Según la tabla de entradas, espera tres imágenes (`camera1`, `camera2`, `camera3`), aunque la sección de cámaras del robot indica solo `top` y `left_wrist`. La salida es una acción de 6 dimensiones para el control del robot. SmolVLA destaca por su eficiencia computacional, lo que permite su despliegue en hardware de consumo, una innovación clave frente a modelos VLA más pesados.

## Capacidades

- Ejecuta la tarea específica de abrir una caja moviendo la tapa hasta un marcador objetivo.
- Procesa observaciones visuales de hasta tres cámaras (256x256 píxeles) y estado del robot de 6 dimensiones.
- Genera acciones de 6 dimensiones para el control del robot, adecuadas para el tipo de robot `so101_follower`.
- Está fine-tuned desde el modelo base `lerobot/smolvla_base`, lo que permite adaptación a tareas de manipulación similares con pocos datos.
- No se documentan capacidades de generación de texto, tool calling, agentes, razonamiento simbólico ni soporte multilingüe en la información disponible.

## Casos de uso

- Investigación en aprendizaje por imitación: el modelo sirve como referencia para estudiar políticas de acción a partir de demostraciones humanas. Se puede ejecutar con `lerobot-rollout` y comparar su comportamiento con otros policies en la misma tarea.
- Automatización de tareas de apertura de cajas en almacenes: el modelo puede integrarse en un brazo robótico `so101_follower` para abrir cajas de forma autónoma en entornos controlados, reduciendo la intervención humana.
- Desarrollo de robots de bajo coste: al ser compacto, puede ejecutarse en hardware de consumo, lo que facilita la creación de robots asequibles para tareas específicas de manipulación.
- Benchmark de políticas VLA: se puede usar como baseline para evaluar el rendimiento de nuevos modelos en la tarea de abrir cajas, dado que comparte la misma arquitectura base que otros fine-tunings de SmolVLA.
- Fine-tuning para tareas de manipulación similares: el modelo base SmolVLA permite adaptar el policy a otras tareas (por ejemplo, empujar botones o cerrar cajas) con pocos datos, como demuestran los modelos `smolvla_push_button_ours_3000_10fps` y `smolvla_close_box_cap_3000_10fps` del mismo autor.
- Educación y demostraciones robóticas: el modelo puede utilizarse en entornos educativos para enseñar conceptos de control robótico, aprendizaje por imitación y despliegue de modelos VLA en robots reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para este policy.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. Dado el tamaño de 450M parámetros y el formato safetensors, se espera que sea ligero, pero no hay cifras oficiales.
- GPU recomendadas: no disponible. La model card señala que SmolVLA puede desplegarse en hardware de consumo, pero no especifica modelos concretos.
- Opciones de despliegue: LeRobot, mediante los comandos `lerobot-rollout` y `lerobot-train`. También se puede cargar desde Hugging Face Hub.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|
| HyeonseokE/smolvla_open_box_ours_3000_10fps | Abrir caja | 450.046.176 | Apache 2.0 | Hugging Face |
| HyeonseokE/smolvla_push_button_ours_3000_10fps | Pulsar boton | No disponible | Apache 2.0 | Hugging Face |
| HyeonseokE/smolvla_close_box_cap_3000_10fps | Cerrar caja | No disponible | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | Modelo base VLA | No disponible | Apache 2.0 | Hugging Face |

Los tres modelos de HyeonseokE son fine-tunings del mismo base `lerobot/smolvla_base`, por lo que comparten arquitectura y licencia. Las diferencias principales son la tarea y el dataset de entrenamiento. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible.
- Riesgo de alucinación: al ser un modelo de acción, no genera texto; sin embargo, puede producir acciones incorrectas ante observaciones fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: no disponible. El modelo no está diseñado para tareas de lenguaje natural.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de licencia y se indiquen los cambios realizados.
- Caveat importante: el modelo está entrenado para una tarea muy específica y un tipo de robot concreto (`so101_follower`). No se han publicado resultados de evaluación. Además, la model card presenta una discrepancia entre la tabla de entradas (tres cámaras) y la sección de cámaras del robot (dos cámaras: `top` y `left_wrist`), lo que debe tenerse en cuenta antes de desplegar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HyeonseokE/smolvla_open_box_ours_3000_10fps
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/open_box_ours_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Modelo similar (pulsar boton): https://huggingface.co/HyeonseokE/smolvla_push_button_ours_3000_10fps
- Modelo similar (cerrar caja): https://huggingface.co/HyeonseokE/smolvla_close_box_cap_3000_10fps
