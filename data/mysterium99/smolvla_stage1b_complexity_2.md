# mysterium99/smolvla_stage1b_complexity_2

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face, diseñado para control robótico mediante imitación y desplegable en hardware de consumo. Esta ficha concreta, `mysterium99/smolvla_stage1b_complexity_2`, es un ajuste fino de `lerobot/smolvla_base` sobre el conjunto de datos `manufacturing_level_2`, orientado a tareas de manipulación de tornillos, tuercas y muelles en un entorno de fabricación. El modelo consume tres cámaras (gripper, top y side) más el estado articular y produce acciones de 6 dimensiones.

La arquitectura subyacente combina un codificador de visión-lenguaje con un experto de acción, según el paper SmolVLA (arXiv:2506.01844), con un total de 450 millones de parámetros. El ajuste se realizó durante 60.000 pasos con batch de 32, optimizador AdamW y tasa de aprendizaje 1e-4 sobre 900 episodios (893.362 frames a 30 FPS). Es relevante porque demuestra que políticas VLA de tamaño reducido pueden especializarse en tareas industriales concretas con licencia Apache 2.0 y sin necesidad de infraestructura de GPU de datacenter.

El modelo no está pensado para generación de texto ni razonamiento general: es una política robótica end-to-end que mapea observaciones multimodales a comandos motores. Su interés reside en la reproducibilidad del pipeline LeRobot y en la posibilidad de reentrenar sobre datos propios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, según SmolVLA (arXiv:2506.01844) |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (política de imitación, no modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea se proporcionan en inglés en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es una política de imitación que combina un backbone de visión-lenguaje con un módulo de acción que predice comandos motores a partir de observaciones. El modelo base `lerobot/smolvla_base` fue preentrenado por Hugging Face; esta versión se ajustó sobre el dataset `manufacturing_level_2`, que contiene 900 episodios y 893.362 frames a 30 FPS, con 18 tareas descritas en lenguaje natural (por ejemplo, "Put all exterior coated screws in bucket" o "Remove all springs from the taped area"). La configuración de entrenamiento fue de 60.000 pasos, batch 32, AdamW, learning rate 1e-4, semilla 0 y LeRobot 0.6.1.

Las entradas son `observation.state` de forma (6,), tres imágenes de (3, 256, 256) correspondientes a las cámaras `gripper`, `newtop` y `newside`, y la salida es un vector de acción de forma (6,). No se documentan innovaciones adicionales como decodificación especulativa o atención lineal en la información disponible; el interés técnico del ajuste está en la especialización multi-tarea sobre un mismo robot `follow`.

## Capacidades

- Control robótico de manipulación: agarre y clasificación de tornillos, tuercas, pernos y muelles en contenedores o zonas delimitadas.
- Ejecución de instrucciones de tarea en lenguaje natural, con 18 tareas distintas definidas en el dataset de entrenamiento.
- Percepción multimodal con tres cámaras simultáneas (gripper, top, side) a resolución 256×256.
- Política de imitación multi-tarea: un único modelo cubre variantes como "put in bucket", "put in taped area", "give it to human" o "remove from taped area".
- Interacción humano-robot limitada: tareas como "take bolt from human and put it in bucket" y "pick up a galvanized bolt and give it to human".
- Integración con el ecosistema LeRobot para rollout y reentrenamiento mediante CLI.
- No soporta tool calling, function calling, agentes multi-paso, generación de texto, código, matemáticas ni visión general.

## Casos de uso

- Clasificación de tornillos en línea de fabricación: el modelo recibe las tres cámaras y el estado articular y emite acciones de 6 dimensiones para depositar tornillos en el cubo correcto, aprovechando que fue entrenado específicamente con las tareas "Put all exterior coated screws in bucket" y similares.
- Selección de tuercas galvanizadas: dado que el dataset incluye "Pick up a galvanized nut and put in bucket" y "Put all galvanized nuts in bucket", el modelo puede desplegarse en una celda que separe tuercas por acabado superficial.
- Retirada de muelles de una zona delimitada: la tarea "Remove all springs from the taped area" permite usar la política en operaciones de despeje de áreas de trabajo.
- Entrega de piezas a un operario: las tareas "pick up a galvanized bolt and give it to human" y "take bolt from human and put it in bucket" habilitan un caso de asistencia colaborativa donde el robot intercambia piezas con una persona.
- Clasificación de pernos por tipo (hex, lag, carriage, zinc): el modelo cubre tareas separadas para cada familia, lo que permite usarlo como clasificador físico en un flujo de kitting.
- Base para ajuste fino en nuevas referencias de fabricación: al estar construido sobre `lerobot/smolvla_base` y con licencia Apache 2.0, sirve como punto de partida para reentrenar con `lerobot-train` sobre datasets propios de 900 episodios o más.
- Validación de pipelines de imitación en laboratorio: su tamaño de 450 M parámetros y su despliegue vía `lerobot-rollout` lo hacen adecuado para prototipado rápido en robots `follow` de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación sin completar y no reporta tasas de éxito por tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M parámetros en safetensors (repo de 0,9 GB) la huella en FP32 ronda 1,8 GB y en FP16 alrededor de 0,9 GB, sin contar buffers de visión.
- GPU recomendadas: no especificadas por el autor; el paper de SmolVLA indica despliegue en hardware de consumo, y el entrenamiento se realizó con `--policy.device=cuda`.
- GPU de consumo: por tamaño, debería caber en tarjetas con 4-8 GB de VRAM (por ejemplo, RTX 3050, RTX 4060), aunque no hay confirmación oficial en la información disponible.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base`; entrenamiento con `lerobot-train`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a una política de acción.
- Latencia y throughput: no disponibles; el dataset opera a 30 FPS y el rollout se ejecuta con `--duration` en segundos sobre el robot real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mysterium99/smolvla_stage1b_complexity_2` | 450 M | no aplica | Manipulación multi-tarea en fabricación | Apache 2.0 | Hugging Face, 0 descargas |
| `lerobot/smolvla_base` | no disponible | no aplica | Política VLA base preentrenada | no disponible en la información | Hugging Face |
| Políticas de imitación tipo ACT/DP (LeRobot) | no disponible | no aplica | Manipulación de una sola tarea por política | no disponible | Hugging Face / LeRobot |

La comparación con alternativas de la misma categoría (RT-2, OpenVLA u otras VLA) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: solo cubre las 18 tareas del dataset `manufacturing_level_2` y el robot `follow` con las cámaras `gripper`, `newtop` y `newside`; fuera de esa configuración el rendimiento no está garantizado.
- Sin métricas de éxito publicadas: no hay tabla de evaluación completada, por lo que no se puede afirmar fiabilidad en producción.
- Sin datos de sesgo ni de alucinación: al no ser un modelo generativo de texto, los riesgos típicos de alucinación no aplican, pero sí el fallo silencioso de la política ante objetos o iluminación distintos a los del entrenamiento.
- Dependencia de calibración: requiere que los nombres e índices de cámara coincidan con las claves de observación del entrenamiento; un desajuste invalida las predicciones.
- Idiomas: las instrucciones de tarea están en inglés; no se documenta soporte multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso externo.
- Fecha de creación futura (2026-11-05) en los metadatos: conviene verificar la integridad del repositorio antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mysterium99/smolvla_stage1b_complexity_2
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/manufacturing_level_2
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
