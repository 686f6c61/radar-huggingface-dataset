# HyeonseokE/smolvla_turn_off_lever_ours_3000_10fps

## Resumen

SmolVLA es un modelo de vision-language-action (VLA) compacto y eficiente, diseñado para controlar robots manipuladores a partir de observaciones visuales y de estado. Fue desarrollado por HyeonseokE como un fine-tuning del modelo base `lerobot/smolvla_base`, entrenado para ejecutar una tarea concreta: apagar una palanca en un robot de tipo `so101_follower`. El modelo tiene 450 millones de parámetros (450.046.176 exactamente) y se distribuye en formato safetensors, con un tamaño de repositorio de 0,9 GB.

Este fine-tuning está entrenado sobre el dataset `HyeonseokE/turn_off_lever_ours_10fps`, que contiene 100 episodios capturados a 10 FPS (21.682 frames en total). La política consume imágenes RGB de 256x256, una observación de estado de 6 dimensiones y produce acciones de 6 dimensiones para el brazo robótico. Su relevancia radica en que permite investigar y desplegar políticas VLA de bajo coste computacional en hardware de consumo, dentro del ecosistema LeRobot.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action model) |
| Parametros totales | 450.046.176 |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica, es un modelo de política robótica) |
| Tipos de cuantizacion | No disponible (solo safetensors; no se especifican cuantizaciones) |
| Idiomas soportados | No disponible (procesa imágenes y estado, no lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLA descrita en el paper arXiv:2506.01844, que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones para producir comandos de bajo nivel. Es un modelo VLA compacto que logra un rendimiento competitivo con un coste computacional reducido, lo que permite su ejecución en hardware de consumo.

Este checkpoint es un fine-tuning de `lerobot/smolvla_base` sobre el dataset `HyeonseokE/turn_off_lever_ours_10fps` con 100 episodios a 10 FPS. La configuración de entrenamiento incluye 16.900 pasos, batch size de 64, optimizador AdamW, learning rate de 0,0001, seed 3000 y la versión 0.6.0 de LeRobot. Los datos de entrenamiento proceden de teleoperación sobre un robot `so101_follower`, con cámaras que capturan imágenes de 256x256.

## Capacidades

- Genera acciones robóticas de 6 dimensiones (posiciones articulares) para controlar la tarea de apagar una palanca.
- Procesa observaciones de estado de 6 dimensiones e imágenes RGB de 256x256 de hasta 3 cámaras (según la model card).
- Está integrado con el ecosistema LeRobot, lo que facilita su carga y ejecución mediante comandos como `lerobot-rollout`.
- No soporta tool calling, generación de texto ni razonamiento de lenguaje: es un modelo de acción robótica, no un LLM.
- No tiene capacidades multilingües.
- La tarea específica para la que fue entrenado es "apagar la palanca; el indicador de estado debe ponerse en rojo".

## Casos de uso

- Automatización de tareas repetitivas en líneas de ensamblaje: el modelo puede ejecutar de forma autónoma la acción de apagar una palanca a partir de la visión de la cámara, útil en entornos industriales controlados y con la tarea bien definida.
- Investigación en aprendizaje por imitación: sirve como política de referencia para estudiar cómo un dataset de 100 episodios a 10 FPS afecta al éxito en tareas de manipulación con un brazo robótico.
- Prototipado de robots de bajo coste: SmolVLA está diseñado para ejecutarse en hardware de consumo, por lo que es adecuado para plataformas educativas o de investigación con GPUs modestas.
- Análisis de datos de demostración: al publicarse junto con su dataset, permite investigar la relación entre la cantidad de datos y el rendimiento de la política, o experimentar con aumentaciones de datos.
- Desarrollo de pipelines de control con LeRobot: los desarrolladores pueden partir de este checkpoint para fine-tuning en nuevas tareas usando el mismo formato de observaciones y acciones.
- Estandarización de benchmarks robóticos: el modelo y su dataset pueden usarse como referencia reproducible en trabajos que comparen políticas VLA de bajo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta política en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación. El paper original de SmolVLA reporta métricas del modelo base, pero no de este fine-tuning específico.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB para los pesos en fp16. En la práctica, teniendo en cuenta las imágenes de entrada y las activaciones, se recomienda una GPU con al menos 4 GB de VRAM.
- GPU recomendadas: RTX 3060 o superior, RTX 4070, A10, A100 o H100. Todas son suficientes; las GPUs de gama alta resultan sobredimensionadas para este modelo.
- Sí cabe en GPUs de consumo de gama media.
- Opciones de despliegue: LeRobot (comando `lerobot-rollout`), PyTorch y Hugging Face Hub. No es compatible con vLLM, llama.cpp ni Ollama, al no ser un modelo de texto.
- Latencia y throughput: no disponible. El modelo está entrenado con datos a 10 FPS, lo que sugiere que debe ejecutarse al menos a esa frecuencia para un control en tiempo real.

## Comparativa con modelos similares

| Modelo | Tarea | Episodios de entrenamiento | Parametros | Licencia |
|---|---|---|---|---|
| smolvla_turn_off_lever_ours_3000_10fps | Apagar palanca | 100 | 450M | Apache-2.0 |
| smolvla_close_box_cap_3000_10fps | Cerrar caja | No disponible | No disponible | Apache-2.0 |
| smolvla_push_button_ours_3000_10fps | Pulsar botón | No disponible | No disponible | Apache-2.0 |
| lerobot/smolvla_base (modelo base) | Uso genérico de VLA | No disponible | No disponible | Apache-2.0 |

Los modelos `smolvla_close_box_cap_3000_10fps` y `smolvla_push_button_ours_3000_10fps` son del mismo autor y siguen el mismo esquema de fine-tuning sobre `lerobot/smolvla_base`, aunque no se dispone de sus especificaciones detalladas en la información proporcionada.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados para esta política, por lo que se desconoce su tasa de éxito en entornos reales.
- El modelo está entrenado para una tarea y un robot concretos (`so101_follower`); no es generalizable a otros robots o tareas sin reentrenamiento.
- El dataset de entrenamiento contiene solo 100 episodios, lo que puede limitar la robustez frente a cambios de iluminación, posición de objetos u oclusiones.
- La model card muestra tres cámaras en la tabla de inputs, pero la configuración de rollout menciona dos cámaras. Esta discrepancia puede provocar errores al cargar el modelo fuera del entorno original.
- No es un modelo de lenguaje, por lo que no puede usarse en tareas de NLP ni para generar texto.
- La licencia Apache-2.0 permite uso comercial, pero exige incluir los avisos de licencia y reconocimiento correspondientes, y no ofrece garantías de ningún tipo.

## Enlaces

- HuggingFace: https://huggingface.co/HyeonseokE/smolvla_turn_off_lever_ours_3000_10fps
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/turn_off_lever_ours_10fps
- Biblioteca LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HyeonseokE/turn_off_lever_ours_10fps
