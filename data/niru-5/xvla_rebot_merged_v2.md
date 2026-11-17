# niru-5/xvla_rebot_merged_V2

## Resumen

xvla_rebot_merged_V2 es un modelo de visión-lenguaje-acción (VLA) para robótica, publicado por el usuario niru-5 en Hugging Face y afinado a partir de `lerobot/xvla-base`. Se trata de un fine-tune de la arquitectura X-VLA, un framework de flow matching con soft prompts que trata cada configuración de robot o hardware como una "tarea" codificada mediante un conjunto reducido de embeddings de soft prompt aprendibles. Esto permite que un único modelo reconcilie morfologías, sensores y espacios de acción diversos.

El modelo está especializado en una única tarea de manipulación robótica sobre el robot `rebot_b601_follower`: recoger una botella o una toalla y depositarla en el contenedor designado. Consume el estado del robot (7 dimensiones) y tres cámaras (`front_wide`, `gripper`, `high_oblique`, cada una a 360x640) y produce un vector de acción de 7 dimensiones. Cuenta con 879,7 millones de parámetros y un tamaño de repositorio de 1,8 GB.

Es relevante como ejemplo práctico de fine-tuning de políticas VLA con LeRobot 0.7.0 sobre un dataset pequeño (137 episodios, 86.218 frames a 30 FPS). No obstante, su alcance es muy limitado: no es un modelo de propósito general y no dispone de resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (X-VLA) con soft prompts y flow matching |
| Parametros totales | 879.687.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

X-VLA es un framework de visión-lenguaje-acción basado en flow matching y soft prompting. Cada robot o configuración de hardware se representa como una "tarea" mediante un conjunto pequeño de embeddings de soft prompt aprendibles, lo que permite que un mismo modelo se adapte a morfologías, sensores y espacios de acción distintos. El modelo consume observaciones multimodales (estado propioceptivo de 7 dimensiones y tres cámaras RGB de 360x640) y genera acciones de 7 dimensiones.

El fine-tune se realizó sobre el dataset `RoboCrafty/rebot_sort_merged_V2` (137 episodios, 86.218 frames a 30 FPS), con dos tareas: "pick up the bottle and put it in the designated bin" y "pick up the towel and put it in the designated bin". La configuración de entrenamiento fue de 20.000 pasos, batch size 8, optimizador `xvla-adamw`, learning rate 0.0001, semilla 1000 y LeRobot 0.7.0. No se dispone de información sobre el número de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de acciones robóticas de manipulación (7 dimensiones) a partir de observaciones visuales y propioceptivas.
- Percepción visual multimodal mediante tres cámaras simultáneas (vista frontal amplia, pinza y vista oblicua elevada).
- Ejecución de tareas de pick-and-place: recogida de botella y de toalla para depositarlas en un contenedor designado.
- Control de un robot específico: `rebot_b601_follower`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible más allá de la percepción visual propia del modelo VLA.

## Casos de uso

- Automatización de pick-and-place en línea de clasificación: el modelo puede recoger botellas y toallas y depositarlas en contenedores designados, adecuado por su entrenamiento específico en estas dos tareas sobre el robot `rebot_b601_follower`.
- Prototipado de políticas de imitación con LeRobot: sirve como punto de partida para equipos que quieran validar el flujo `lerobot-rollout` y `lerobot-train` sobre hardware real antes de escalar a datasets mayores.
- Investigación en adaptación multi-robot con soft prompts: permite estudiar cómo un mismo modelo base (`lerobot/xvla-base`) se adapta a una morfología concreta mediante fine-tuning ligero.
- Generación de datos sintéticos de manipulación: las trayectorias generadas pueden usarse para aumentar datasets de imitación en tareas de clasificación de objetos.
- Benchmarking de infraestructura de inferencia robótica: con 879,7 M de parámetros y 1,8 GB de pesos, es útil para medir latencia y throughput en GPUs de consumo en pipelines de control en tiempo real.
- Educación y demos de VLA: su tamaño moderado y licencia Apache 2.0 facilitan su uso en cursos y demostraciones de visión-lenguaje-acción sin restricciones comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 879,7 M de parámetros en FP16 se estiman aproximadamente 1,8 GB de pesos, más overhead de activaciones y las tres cámaras de 360x640.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabría esperar GPUs de consumo tipo RTX 3060/4060 en adelante, pero no está confirmado.
- ¿Cabe en GPU de consumo? Probable por el tamaño del modelo (1,8 GB de pesos), aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con `--policy.path=niru-5/xvla_rebot_merged_V2` y `--strategy.type=base`. No se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI) para este modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| niru-5/xvla_rebot_merged_V2 | 879,7 M | no disponible | Pick-and-place sobre `rebot_b601_follower` | apache-2.0 | Hugging Face |
| lerobot/xvla-base | no disponible | no disponible | Modelo base VLA multi-robot | no disponible | Hugging Face |
| Otros fine-tunes de X-VLA en LeRobot | no disponible | no disponible | Manipulación específica por robot | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: solo se ha entrenado para dos tareas concretas (botella y toalla) sobre un único robot (`rebot_b601_follower`); no generaliza a otras tareas sin reentrenamiento.
- Sin resultados de evaluación publicados: no hay tasas de éxito verificadas en robot real, lo que impide estimar su fiabilidad en producción.
- Dataset pequeño: 137 episodios y 86.218 frames, lo que limita la robustez frente a variaciones de iluminación, posiciones de objetos o distractores.
- Dependencia de hardware específico: requiere las tres cámaras con los nombres exactos (`front_wide`, `gripper`, `high_oblique`) y el robot `rebot_b601_follower`; el desajuste de nombres o índices de cámara impide la ejecución.
- Riesgo de alucinación y fallos de control: como política de imitación, puede generar acciones inválidas o inseguras fuera de la distribución de entrenamiento.
- Sesgos: no documentados, pero el dataset puede reflejar sesgos de posición, iluminación o disposición de objetos del entorno de recogida.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Idiomas: no aplica; el modelo no procesa lenguaje natural como tarea principal.
- Sin información sobre cuantización ni sobre despliegue fuera de LeRobot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/niru-5/xvla_rebot_merged_V2
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Dataset de entrenamiento: https://huggingface.co/datasets/RoboCrafty/rebot_sort_merged_V2
- Paper X-VLA: https://huggingface.co/papers/2510.10274
- Guía LeRobot X-VLA: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizar dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=RoboCrafty/rebot_sort_merged_V2
