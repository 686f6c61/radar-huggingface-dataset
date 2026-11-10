# rbalazs/smolvla_demotrim_aug

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico mediante aprendizaje por imitación. Esta ficha concreta, `rbalazs/smolvla_demotrim_aug`, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre un dataset propio de demostraciones de manipulación con un robot de tipo `so_follower`, orientado a tareas de "coger y dejar" tres vasos en distintas posiciones.

El modelo resuelve el problema de convertir observaciones multimodales (estado de las articulaciones e imágenes de hasta tres cámaras a 256x256) en comandos de acción de 6 dimensiones, permitiendo desplegar políticas de control en hardware de consumo. Con 450 millones de parámetros y pesos en formato safetensors, es lo bastante pequeño como para ejecutarse en GPUs de gama media, lo que lo hace relevante para prototipado rápido y despliegue en robots de bajo coste.

La relevancia actual radica en la tendencia hacia modelos VLA ligeros que reducen el coste computacional frente a alternativas como OpenVLA o RT-2, manteniendo un pipeline de entrenamiento estandarizado vía LeRobot. Esta versión concreta incorpora un dataset de 239 episodios y 62.967 frames a 30 FPS, con tres tareas específicas de manipulación de vasos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA), transformer multimodal para políticas robóticas |
| Parámetros totales | 450.046.176 (~450 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de control robótico, no de lenguaje general) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |
| Tamaño del repositorio | 0,9 GB |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | so_follower |
| Cámaras de entrada | front, iphone (3 cámaras visuales) |
| Dimensión de estado | 6 |
| Dimensión de acción | 6 |
| Resolución de imagen | 256x256 |
| Dataset de entrenamiento | rbalazs/SmolVLA_DemoDatasetTrim (239 episodios, 62.967 frames, 30 FPS) |
| Pasos de entrenamiento | 20.000 |
| Batch size | 32 |
| Optimizador | AdamW |
| Learning rate | 3e-5 |
| Seed | 1000 |
| Versión de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura de visión-lenguaje-acción que combina un codificador visual con un modelo de lenguaje compacto y un cabezal de acciones, siguiendo el paradigma de los modelos VLA pero con un diseño orientado a la eficiencia computacional. El modelo consume tres flujos de imagen (cámaras `front` e `iphone`, con tres entradas visuales de 3x256x256) junto con el estado de las articulaciones (vector de 6 dimensiones) y produce un vector de acción de 6 dimensiones. El paper asociado (arXiv:2506.01844) describe el método, aunque los detalles internos de capas y atención no se detallan en la model card.

El entrenamiento de esta ficha parte del checkpoint `lerobot/smolvla_base` y se realiza por fine-tuning supervisado sobre el dataset `rbalazs/SmolVLA_DemoDatasetTrim`, compuesto por 239 episodios y 62.967 frames grabados a 30 FPS. Las tareas cubiertas son tres variantes de "coger y dejar" (vaso izquierdo, central y derecho). La configuración usa AdamW con learning rate 3e-5, batch size 32 y 20.000 pasos de entrenamiento con semilla 1000, sobre LeRobot 0.6.2. No se documenta en la información disponible si hubo RLHF, DPO u otras fases de alineamiento, ni la composición detallada del dataset base original.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un robot `so_follower` a partir de observaciones visuales y de estado.
- Percepción visual multimodal: procesa tres cámaras simultáneas a 256x256 píxeles.
- Aprendizaje por imitación: ejecuta políticas entrenadas a partir de demostraciones humanas.
- Ejecución de tareas específicas: "Pick up the left cup and put it down", "Pick up the middle cup and put it down", "Pick up the right cup and put it down".
- Despliegue en hardware de consumo: el tamaño de 450 M parámetros permite inferencia en GPUs modestas.
- Integración con LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni capacidades de lenguaje general.

## Casos de uso

- Manipulación de objetos en laboratorio: el modelo ejecuta la tarea de coger y dejar vasos en posiciones izquierda, central y derecha, útil para experimentos de aprendizaje por imitación con robots SO-100/SO-101.
- Prototipado de políticas VLA en investigación: sirve como punto de partida para fine-tuning sobre nuevos datasets gracias a su base `smolvla_base` y su integración con LeRobot.
- Validación de pipelines de captura de datos: permite comprobar el flujo completo de grabación, entrenamiento y despliegue con tres cámaras y estado articular.
- Demostraciones educativas de robótica: su tamaño compacto y licencia Apache 2.0 lo hacen adecuado para cursos y talleres donde se enseña aprendizaje por imitación.
- Benchmarking de eficiencia VLA: al ser un modelo de 450 M parámetros, permite comparar coste computacional frente a VLA de mayor tamaño en tareas de manipulación simples.
- Despliegue en robots de bajo coste: la inferencia en GPUs de consumo facilita integrar la política en plataformas físicas sin infraestructura de centro de datos.
- Reproducción de experimentos: la configuración de entrenamiento documentada (20.000 pasos, batch 32, lr 3e-5) permite replicar el fine-tuning sobre el mismo dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M parámetros en precisión FP32 los pesos ocupan aproximadamente 1,8 GB, y en FP16/BF16 alrededor de 0,9 GB, a lo que hay que sumar el coste de los tres flujos visuales a 256x256.
- GPU recomendadas: no especificadas por el autor; por tamaño, cabría esperar funcionamiento en GPUs consumer como RTX 3060, RTX 4060, RTX 4090, así como en A100/H100 para entrenamiento.
- Cabe en GPU consumer: sí, por el tamaño del modelo (450 M parámetros) y el repo de 0,9 GB, aunque no se documenta una cifra oficial de VRAM.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=rbalazs/smolvla_demotrim_aug`), y entrenamiento con `lerobot-train`. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI, que no son adecuados para políticas robóticas de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rbalazs/smolvla_demotrim_aug | 450 M | no disponible | Manipulación robótica (3 tareas de vasos) | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible en la información | no disponible | VLA base para fine-tuning | no disponible en la información | Hugging Face |
| OpenVLA | no disponible en la información | no disponible | VLA generalista | no disponible en la información | no disponible en la información |
| RT-2 | no disponible en la información | no disponible | VLA generalista | no disponible en la información | no disponible en la información |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparativa se limita a la relación de fine-tuning con `smolvla_base` y a alternativas de la misma categoría sin cifras verificables.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre un dataset muy específico de tres tareas con vasos, el modelo probablemente no generaliza a otros objetos, posiciones o tareas.
- Riesgo de alucinación: en el contexto de políticas de acción, el riesgo se traduce en acciones incorrectas o inseguras; no hay evaluación de éxito publicada.
- Limitaciones de contexto o idioma: el modelo no es un modelo de lenguaje general; los idiomas no están disponibles y no se debe esperar comprensión lingüística más allá de la instrucción de tarea.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base y el dataset pueden tener condiciones adicionales que conviene verificar.
- Caveat para producción: no hay resultados de evaluación ni tasas de éxito; el autor indica que no se han proporcionado resultados. El despliegue en un robot real requiere validación propia y medidas de seguridad.
- Dependencia de hardware específico: el modelo está entrenado para el robot `so_follower` con cámaras `front` e `iphone`; usar otra configuración puede degradar el rendimiento.
- Fecha de creación del repositorio: 2026-11-10, sin descargas ni likes, lo que sugiere un modelo reciente y sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/rbalazs/smolvla_demotrim_aug
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset: https://huggingface.co/datasets/rbalazs/SmolVLA_DemoDatasetTrim
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Guía LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizar dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=rbalazs/SmolVLA_DemoDatasetTrim
