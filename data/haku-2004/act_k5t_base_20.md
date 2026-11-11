# Haku-2004/act_k5t_base_20

## Resumen

`Haku-2004/act_k5t_base_20` es una política de imitación (imitation learning) para control robótico entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705 (Zhao et al., 2023). El modelo lo desarrolla el usuario Haku-2004 y se distribuye a través del ecosistema LeRobot de Hugging Face, la librería de referencia para aprendizaje por imitación en robótica real. No es un modelo de lenguaje: es una política visomotora que consume el estado articular del robot y dos cámaras y produce comandos de acción de 6 dimensiones.

El modelo resuelve una tarea concreta de manipulación: `taskbox`, ejecutada sobre un robot de tipo `so_follower` (la variante follower del brazo SO-100/SO-101 de bajo coste). Se entrenó con 20 episodios de teleoperación (25.815 fotogramas a 30 FPS) recogidos en el dataset `Haku-2004/k5_20261110_143202`. Su relevancia es la de un artefacto reproducible de un pipeline completo de LeRobot: datos, configuración de entrenamiento y pesos publicados, lo que permite replicar el flujo o adaptarlo a otra tarea.

La arquitectura es un transformer ACT con ~51,7 millones de parámetros, sin ventana de contexto en el sentido de los LLM: su "contexto" es la observación actual (estado de 6 dimensiones más dos imágenes de 3×480×640) y predice un chunk de acciones futuras. El repo ocupa 0,2 GB y los pesos están en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observacion por paso: estado `(6,)` + 2 imagenes `(3, 480, 640)` |
| Tipos de cuantizacion | no disponible (pesos safetensors en precision de entrenamiento) |
| Idiomas soportados | no disponible (modelo de robotica, sin entrada/salida de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Camaras | `front`, `side` (480x640, 30 FPS) |
| Entradas | `observation.state` (6), `observation.images.front`, `observation.images.side` |
| Salidas | `action` (6) |
| Tamano del repo | 0,2 GB |
| Libreria | lerobot |
| Version de LeRobot | 0.5.2 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que, en lugar de predecir una única acción por paso, predice un *chunk* de acciones futuras a partir de la observación actual. La arquitectura combina un encoder de imágenes (ResNet) para cada cámara con un transformer que fusiona las representaciones visuales con el estado propioceptivo del robot y genera la secuencia de acciones. Esta predicción por chunks reduce el error de compounding y suaviza el control, lo que en la práctica se traduce en tasas de éxito más altas que el behavioral cloning paso a paso.

El entrenamiento se realizó sobre 20 episodios de teleoperación (25.815 fotogramas a 30 FPS) de la tarea `taskbox`, con 50.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta en la model card el uso de RLHF, DPO ni ningún otro ajuste posterior; es imitation learning puro supervisado sobre demostraciones. No se especifican aumentos de datos, composición exacta del dataset más allá del número de episodios y fotogramas, ni innovaciones adicionales como decodificación especulativa.

## Capacidades

- Control visomotor de un brazo robótico `so_follower` a partir de dos cámaras (frontal y lateral) y el estado articular.
- Predicción de chunks de acciones de 6 dimensiones (posiciones/velocidades articulares según la convención de LeRobot para `so_follower`).
- Ejecución de la tarea de manipulación `taskbox` (manipulación de una caja de tareas) en el entorno para el que fue entrenado.
- Integración nativa con el CLI de LeRobot (`lerobot-rollout`, `lerobot-train`) y con el formato de datasets de LeRobot.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo "thinking", visión general, audio ni generación de texto.

## Casos de uso

- Replicación de experimentos de imitation learning: sirve como referencia reproducible de un pipeline ACT completo (dataset, configuración y pesos) para validar la instalación de LeRobot y el hardware `so_follower`.
- Automatización de la tarea `taskbox` en un banco de pruebas: desplegar la política con `lerobot-rollout` sobre el robot y las cámaras `front`/`side` para ejecutar la tarea de forma autónoma durante sesiones de 60 s o indefinidas.
- Base para fine-tuning en tareas similares: al estar en formato LeRobot y con licencia Apache-2.0, se puede reentrenar con `lerobot-train` sobre un dataset propio de manipulación de cajas u objetos pequeños.
- Evaluación de infraestructura de robótica de bajo coste: medir latencia de inferencia, estabilidad del control por chunks y comportamiento ante variaciones de iluminación o posición en un brazo SO-100/SO-101.
- Docencia y demos de aprendizaje por imitación: ejemplo mínimo (20 episodios, 51,7 M de parámetros) para explicar ACT, chunking de acciones y el flujo datos→entrenamiento→despliegue.
- Comparación de métodos de IL: usar esta política como baseline ACT frente a otros métodos disponibles en LeRobot (p. ej. Diffusion Policy) sobre el mismo dataset `k5_20261110_143202`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: *"No evaluation results have been provided for this policy yet."* No hay tabla de éxito por tarea, ni comparación con otras políticas, ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros y pesos en safetensors, la huella es del orden de cientos de MB, por lo que cabe holgadamente en cualquier GPU consumer (p. ej. RTX 3060/4060/4090) e incluso en CPU para inferencia a baja frecuencia.
- GPU recomendadas: no especificadas por el autor. Para entrenamiento con `--policy.device=cuda` se recomienda una GPU NVIDIA con al menos 8 GB de VRAM para batch size 8 y dos cámaras a 480×640; para inferencia en tiempo real a 30 FPS, una GPU consumer moderna es suficiente.
- Cabe en GPU consumer: sí, por el tamaño del modelo (0,2 GB de repo).
- Opciones de despliegue: LeRobot (`lerobot-rollout`) como vía principal; no se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El control opera a 30 FPS según el dataset, pero no se publican medidas de latencia extremo a extremo.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto/observacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Haku-2004/act_k5t_base_20` | 51,7 M | ACT (imitation learning) | estado (6) + 2 imagenes 480x640 | apache-2.0 | Hugging Face (LeRobot) |
| ACT oficial (paper arXiv:2304.13705) | no disponible | ACT | no disponible | no disponible | paper y código de referencia |
| Diffusion Policy (LeRobot) | no disponible | diffusion policy | no disponible | no disponible | disponible en LeRobot |
| Otras politicas LeRobot para `so_follower` | variable | ACT / diffusion / etc. | variable | variable | Hugging Face (LeRobot) |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada; la comparación se limita a tipo de método, licencia y disponibilidad.

## Limitaciones y advertencias

- Entrenada con solo 20 episodios y una única tarea (`taskbox`); se espera una generalización muy limitada fuera de las condiciones de recogida (posiciones, iluminación, objetos).
- Sin resultados de evaluación publicados: no hay evidencia cuantitativa de tasa de éxito en robot real.
- Depende de la configuración exacta de hardware: robot `so_follower` y cámaras `front`/`side` a 480×640 y 30 FPS; cambios en la resolución, el montaje o la calibración degradan el comportamiento.
- Riesgo de sobreajuste a la distribución de demostraciones y de fallo silencioso ante objetos o disposiciones no vistas; no hay mecanismo de detección de incertidumbre documentado.
- No es un modelo de lenguaje: no procesa texto ni instrucciones en lenguaje natural más allá de la etiqueta de tarea `taskbox` que se pasa al rollout.
- Sesgos conocidos: no documentados por el autor; en robótica de imitación, los sesgos provienen de la política del teleoperador y de las condiciones del dataset.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el despliegue en producción exige validación propia y medidas de seguridad física en el robot.
- Repositorio sin descargas ni likes en el momento de la consulta: ecosistema de validación mínimo, sin issues ni discusión pública.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k5t_base_20
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k5_20261110_143202
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Haku-2004/k5_20261110_143202
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
