# nberezny/act_franka_pick_place_wp

## Resumen

`nberezny/act_franka_pick_place_wp` es una política de imitación basada en ACT (Action Chunking with Transformers) para control robótico, publicada en Hugging Face Hub mediante la librería LeRobot. El modelo ha sido entrenado para una única tarea de manipulación sobre un robot Franka Panda en simulación (tipo `franka_panda_sim_waypoint`): recoger un cubo rojo y colocarlo sobre una casilla azul. Consume dos flujos de imagen (cámara cenital y cámara en la muñeca) más el estado del robot, y produce un vector de acción de 10 dimensiones.

Se trata de un modelo pequeño (51.582.602 parámetros, ~0,8 GB en el repositorio) y de propósito muy específico: no es un modelo de lenguaje ni un modelo generalista, sino una política visuomotora entrenada con 200 episodios de teleoperación (30.404 frames a 20 FPS) para una tarea concreta. Su relevancia es la de servir como referencia reproducible del flujo de trabajo de LeRobot para entrenamiento y despliegue de políticas ACT en robótica de manipulación.

No se ha publicado información sobre licencia, idiomas ni resultados de evaluación, y el repositorio no registra descargas ni likes en el momento de la consulta. La model card no incluye métricas de éxito en robot real ni en simulación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación visuomotora |
| Parámetros totales | 51.582.602 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; consume observaciones por paso) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `lerobot`) |

Especificaciones adicionales de entrada y salida:

| Elemento | Tipo | Forma |
|---|---|---|
| `observation.images.overhead` | VISUAL | (3, 240, 320) |
| `observation.images.wrist` | VISUAL | (3, 240, 320) |
| `observation.state` | STATE | (17,) |
| `action` | ACTION | (10,) |

| Dato de entrenamiento | Valor |
|---|---|
| Dataset | `nberezny/franka_pick_place_wp` |
| Episodios | 200 |
| Frames | 30.404 |
| Frecuencia | 20 FPS |
| Tarea | "Pick up the red cube and place it on the blue square." |
| Pasos de entrenamiento | 100.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.7.0 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. La política procesa dos imágenes RGB de 240x320 píxeles (cámara cenital y cámara en la muñeca) junto con un vector de estado de 17 dimensiones, y emite un vector de acción de 10 dimensiones. La arquitectura combina un backbone visual con un transformer que modela la secuencia de acciones; el paper de referencia es arXiv:2304.13705.

El entrenamiento se realizó sobre 200 episodios teleoperados (30.404 frames a 20 FPS) durante 100.000 pasos con batch size 8, optimizador AdamW y learning rate 1e-05, usando LeRobot 0.7.0. La model card no detalla la composición del dataset más allá de la tarea, ni indica si hubo aumentos de datos, variaciones de iluminación, posiciones de objetos o distractores. Tampoco se especifica si se aplicó regularización adicional o técnicas de decodificación especulativa (no aplicables en este contexto).

## Capacidades

- Control visuomotor de manipulación: genera comandos de acción de 10 dimensiones a partir de dos vistas de cámara y el estado del robot.
- Predicción de chunks de acción: emite secuencias cortas de acciones en lugar de pasos aislados, lo que mejora la suavidad y reduce el error acumulado.
- Ejecución de una tarea concreta de pick-and-place: recoger un cubo rojo y colocarlo sobre una casilla azul.
- Entrada multimodal: dos flujos visuales (cenital y muñeca) más estado propioceptivo de 17 dimensiones.
- Compatibilidad con el ecosistema LeRobot: entrenamiento, evaluación y despliegue mediante CLI (`lerobot-train`, `lerobot-rollout`).
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, generación de texto, código, matemáticas, visión general, audio ni capacidades multilingües.

## Casos de uso

- Reproducción de referencia del flujo ACT en LeRobot: sirve como ejemplo completo (dataset, configuración de entrenamiento y política publicada) para que un equipo replique el pipeline `lerobot-train` y `lerobot-rollout` con sus propios datos.
- Benchmark interno de pick-and-place en simulación: permite medir tasas de éxito de una política ACT sobre el robot `franka_panda_sim_waypoint` antes de trasladar el método a un robot real.
- Base para fine-tuning con datos propios: al estar entrenada sobre 200 episodios y 30.404 frames, puede servir como inicialización para tareas de manipulación similares con el mismo tipo de robot y cámaras.
- Validación de infraestructura de inferencia robótica: útil para comprobar que el stack de cámaras, puertos y frecuencias (20 FPS de entrenamiento) está correctamente configurado antes de desplegar políticas más costosas.
- Docencia y formación en aprendizaje por imitación: ejemplo mínimo y acotado (51,6 M de parámetros, 0,8 GB) para explicar ACT, chunking de acciones y el ciclo teleoperación-entrenamiento-despliegue.
- Pruebas de robustez ante cambios de cámara o iluminación: al estar entrenada con dos vistas fijas, permite estudiar cómo degrada el rendimiento al modificar la posición de las cámaras o las condiciones visuales.
- Integración en pipelines de evaluación automatizada: la política puede ejecutarse con `--duration` acotado para recoger métricas de éxito de forma repetible en simulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en simulación ni en robot real, ni de comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 M de parámetros en precisión FP32 el peso ocupa aproximadamente 0,2 GB, y en FP16 unos 0,1 GB, a lo que hay que sumar activaciones y buffers de las dos cámaras de 240x320.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente en la práctica para una política de este tamaño; no se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: sí, previsiblemente en GTX 1660, RTX 3060, RTX 4060 y superiores; no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=nberezny/act_franka_pick_place_wp`); no se documentan otros runners (vLLM, llama.cpp, Ollama o TGI no son aplicables a este tipo de política).
- Latencia y throughput estimados: no disponibles. El entrenamiento se realizó a 20 FPS sobre datos de teleoperación, pero no se publica la latencia de inferencia ni el throughput alcanzable.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo ni de políticas comparables en la información proporcionada, por lo que la comparación numérica no está disponible. A modo cualitativo, las alternativas habituales en el ecosistema LeRobot para manipulación son:

| Modelo | Tipo | Parámetros | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nberezny/act_franka_pick_place_wp` | ACT | 51.582.602 | 2 imágenes 240x320 + estado (17,) | no disponible | Hugging Face Hub |
| Otras políticas ACT en LeRobot | ACT | variable | variable | variable | Hugging Face Hub |
| Políticas Diffusion Policy en LeRobot | difusión | variable | variable | variable | Hugging Face Hub |
| Políticas VLA (p. ej. familias tipo RT/OpenVLA) | VLM + acción | variable | imágenes + texto | variable | Hugging Face Hub |

No se han encontrado datos públicos que permitan comparar tasas de éxito, latencia o robustez frente a estas alternativas.

## Limitaciones y advertencias

- Modelo de propósito único: entrenado exclusivamente para la tarea "Pick up the red cube and place it on the blue square" sobre `franka_panda_sim_waypoint`; no generaliza a otras tareas, objetos o robots sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni métricas de robustez, por lo que no puede recomendarse para producción sin una validación propia.
- Dependencia de la configuración de cámaras: las entradas `overhead` y `wrist` deben coincidir en nombre, resolución (240x320) y disposición con las del entrenamiento; cambios de posición o calibración degradan el rendimiento.
- Sesgos de dataset: 200 episodios y 30.404 frames son un volumen reducido; no se documenta diversidad de posiciones de objetos, iluminación o distractores, lo que puede provocar sobreajuste a las condiciones de recogida.
- Riesgo de fallo silencioso: al no haber métricas, no se puede estimar la frecuencia de fallos ni el modo de fallo típico.
- Licencia no disponible: no se puede confirmar el uso comercial; debe consultarse con el autor antes de cualquier despliegue productivo.
- Idiomas: no aplica, pero conviene señalar que no es un modelo lingüístico y no procesa instrucciones en lenguaje natural; la tarea está fijada en el prompt de ejecución.
- Sin soporte documentado de cuantización: no se indican formatos GGUF, AWQ, GPTQ ni INT8, por lo que el despliegue en hardware limitado debe validarse empíricamente.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nberezny/act_franka_pick_place_wp
- Dataset de entrenamiento: https://huggingface.co/datasets/nberezny/franka_pick_place_wp
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=nberezny/franka_pick_place_wp
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
