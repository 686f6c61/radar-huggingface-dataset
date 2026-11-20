# chunbae27/dp_pick_cube

## Resumen

`chunbae27/dp_pick_cube` es una política de control visuomotor entrenada con el método Diffusion Policy y empaquetada en el formato de LeRobot. La desarrolla el usuario chunbae27 y resuelve una tarea de manipulación robótica concreta: coger un cubo y colocarlo a la derecha. El modelo consume el estado articular del robot (6 dimensiones) y dos cámaras RGB de 480x640 (overhead y wrist), y produce una acción de 6 dimensiones. Es relevante como ejemplo reproducible de imitation learning end-to-end con LeRobot 0.6.0 sobre un robot SO follower (SO-100/SO-101 de bajo coste).

La arquitectura es una red de difusión condicionada por observaciones que genera trayectorias de acción multimodales y suaves, lo que la hace adecuada para tareas con contacto físico. El checkpoint contiene 277.840.246 parámetros en safetensors (1,1 GB de repositorio). No es un modelo de lenguaje: no procesa ni genera texto, y su pipeline declarado es `robotics`.

Se trata de un artefacto de investigación con fine-tuning muy específico (50 episodios, 18.472 frames, una única tarea) y sin resultados de evaluación publicados. Su interés es práctico para quien quiera replicar el flujo de LeRobot o adaptar Diffusion Policy a un robot SO follower propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (policy de difusión para control visuomotor), implementada en LeRobot |
| Parametros totales | 277.840.246 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación de estado 6D + 2 imágenes 3x480x640) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; LeRobot no documenta cuantizaciones para esta policy) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | so_follower |
| Cámaras de entrada | overhead, wrist (3x480x640 cada una) |
| Dimensión de estado | 6 |
| Dimensión de acción | 6 |
| Frecuencia de datos | 30 FPS |
| Librería | lerobot 0.6.0 |

## Arquitectura y entrenamiento

Diffusion Policy formula el control visuomotor como un proceso generativo de difusión: en lugar de predecir una acción determinista, el modelo aprende a denoizar una secuencia de acciones condicionada por las observaciones (estado articular e imágenes de las cámaras overhead y wrist). Esto permite representar distribuciones multimodales de acciones y producir trayectorias suaves, lo que resulta ventajoso en manipulación con contacto rico. La implementación concreta corresponde al pipeline de LeRobot para `policy.type=diffusion`, con 277.840.246 parámetros en el checkpoint publicado.

El entrenamiento se realizó sobre el dataset `chunbae27/pick-cube`: 50 episodios, 18.472 frames a 30 FPS, con la única tarea "Pick up the cube and place it on the right". La configuración reportada es de 200.000 pasos, batch size 32, optimizador Adam, learning rate 1e-4 y semilla 1000, usando LeRobot 0.6.0. No se documenta composición adicional del dataset, aumentos de datos, ni etapas de RLHF/DPO (no aplicables a este tipo de policy). Tampoco se detalla la arquitectura interna exacta (backbone visual, número de pasos de difusión, horizonte de predicción), por lo que esos datos figuran como no disponibles.

## Capacidades

- Generación de trayectorias de acción de 6 dimensiones para un robot SO follower a partir de estado articular e imágenes.
- Control visuomotor con dos cámaras RGB (overhead y wrist) a 480x640.
- Manipulación con contacto: la formulación de difusión favorece movimientos suaves y multimodales.
- Ejecución de la tarea específica "Pick up the cube and place it on the right".
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües: no es un modelo de lenguaje.
- No se documentan modos especiales (thinking, visión general, audio) más allá del uso de imágenes como observación.

## Casos de uso

- Replicación de un pipeline de imitation learning: usar el modelo y el dataset `pick-cube` como referencia para entrenar y desplegar una policy de difusión con LeRobot 0.6.0 en un robot SO follower.
- Pick-and-place de laboratorio: ejecutar la tarea de coger un cubo y colocarlo a la derecha en un entorno controlado, con las cámaras overhead y wrist montadas según la configuración de entrenamiento.
- Base para fine-tuning en tareas similares: partir de estos pesos y reentrenar con un dataset propio de manipulación de objetos pequeños, aprovechando la infraestructura `lerobot-train`.
- Docencia y demostraciones de robótica de bajo coste: ilustrar control visuomotor con difusión sobre hardware SO follower accesible.
- Evaluación de robustez de políticas de difusión: comparar el comportamiento ante cambios de iluminación, posiciones de objetos o distracciones, midiendo tasas de éxito en banco de pruebas.
- Integración en flujos de investigación: servir como baseline de Diffusion Policy frente a otras políticas de LeRobot (ACT, etc.) en la misma tarea y robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta policy.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 277,8 M de parámetros en safetensors, el peso ronda 1,1 GB en el repositorio, por lo que la inferencia en fp32 requeriría del orden de 1,1 GB solo para pesos, más memoria para activaciones de las dos imágenes 3x480x640.
- GPU recomendadas: no disponibles en la información proporcionada; LeRobot permite `--policy.device=cuda`, por lo que se espera una GPU NVIDIA con CUDA.
- ¿Cabe en GPU consumer? No confirmado en la documentación; por tamaño de parámetros es plausible en GPUs consumer modernas, pero no hay dato oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento). No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a una policy robótica).
- Latencia y throughput: no disponibles. El control opera a 30 FPS según la frecuencia del dataset, pero no se reporta latencia medida.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / observación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chunbae27/dp_pick_cube | Diffusion Policy (LeRobot) | 277.840.246 | estado 6D + 2 imágenes 3x480x640 | apache-2.0 | Hugging Face |
| Otras policies Diffusion de LeRobot | Diffusion Policy | no disponible | variable según dataset | variable | Hugging Face / LeRobot |
| ACT (Action Chunking Transformer) en LeRobot | Transformer de imitación | no disponible | variable | variable | LeRobot |
| Otras policies robóticas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenada para una única tarea ("Pick up the cube and place it on the right") y un único tipo de robot (`so_follower`); no generaliza a otras tareas sin reentrenamiento.
- Dataset muy pequeño (50 episodios, 18.472 frames): alta probabilidad de sobreajuste al entorno, posiciones e iluminación de grabación.
- Sin resultados de evaluación publicados: no hay tasa de éxito medida ni condiciones de robustez documentadas.
- Requiere que los nombres y la resolución de las cámaras coincidan exactamente con las observaciones de entrenamiento (`overhead`, `wrist`, 480x640, 30 FPS); discrepancias degradan el comportamiento.
- Riesgo de fallo ante objetos, posiciones o distracciones distintas de las del dataset; no hay evidencia de generalización.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el usuario asume el riesgo de despliegue.
- No es un modelo de lenguaje: no debe evaluarse con benchmarks de texto ni usarse para tareas de NLP.
- No se documentan sesgos, pero al ser una policy entrenada con datos limitados puede heredar sesgos del entorno de captura (posiciones, colores, condiciones de luz).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chunbae27/dp_pick_cube
- Dataset de entrenamiento: https://huggingface.co/datasets/chunbae27/pick-cube
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=chunbae27/pick-cube
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
