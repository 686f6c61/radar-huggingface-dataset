# fabono/act_so101_pickup_in_drawer

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de pasos individuales, lo que reduce el error de acumulación y facilita el control de robots manipuladores. Este repositorio concreto, `fabono/act_so101_pickup_in_drawer`, contiene una política entrenada con LeRobot para una tarea específica de manipulación: sacar un cubo negro de un cajón azul con asa amarilla y depositarlo sobre la mesa.

La política opera sobre un robot de tipo `so_follower` (SO-101) con dos cámaras (muñeca y vista superior) y produce comandos de acción de 6 dimensiones. El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo hace ligero y desplegable en hardware modesto. Se entrenó durante 50.000 pasos con un batch de 16 sobre un dataset de 50 episodios y 33.631 fotogramas a 30 FPS.

Es relevante como ejemplo práctico de flujo completo de robótica con IA open source: grabación de datos de teleoperación, entrenamiento de una política ACT y despliegue en robot real mediante la CLI de LeRobot. La licencia Apache 2.0 permite uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que, en lugar de predecir una acción por paso de tiempo, predice un *chunk* de acciones futuras. Esto mitiga el problema de la acumulación de errores y mejora la estabilidad en tareas de manipulación fina. La política consume el estado del robot (6 dimensiones) y dos flujos de imagen RGB de 480x640 (cámaras `wrist` y `top`), y produce un vector de acción de 6 dimensiones. El modelo combina un codificador visual (típicamente ResNet) con un transformer que fusiona observaciones y genera las secuencias de acción.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `fabono/get_black_cube_quad_20261101_163224`, compuesto por 50 episodios de teleoperación (33.631 fotogramas a 30 FPS) para la tarea "Take the black cube out of the blue drawer with the yellow handle and put it on the table". Se usaron 50.000 pasos, batch de 16, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta uso de RLHF, DPO ni aumentos de datos adicionales.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un robot SO-101 (`so_follower`).
- Percepción visual multimodal: procesa simultáneamente imágenes de cámara de muñeca y cámara superior.
- Aprendizaje por imitación: reproduce la tarea de sacar un cubo negro de un cajón y colocarlo en la mesa.
- Predicción de chunks de acción: genera secuencias cortas de acciones para mayor estabilidad.
- Integración con LeRobot: compatible con las herramientas `lerobot-rollout` y `lerobot-train`.
- No soporta tool calling, agentes multi-paso, razonamiento textual ni capacidades multilingües.

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política ejecuta la secuencia completa de abrir el cajón, extraer el cubo y depositarlo en la mesa, adecuada para demostraciones de manipulación con el SO-101.
- Base para fine-tuning en tareas similares: al estar entrenada con LeRobot, se puede reentrenar con un dataset propio cambiando `--dataset.repo_id` y `--policy.type=act`.
- Evaluación de pipelines de imitación: sirve como referencia para medir el rendimiento de ACT en tareas de manipulación con dos cámaras y estado proprioceptivo.
- Docencia e investigación en robótica: ejemplo reproducible de flujo completo (grabación, entrenamiento, despliegue) con licencia permisiva.
- Prototipado de control visual: útil para validar arquitecturas de codificación visual + transformer en robots de bajo coste.
- Benchmark interno de hardware: al ser ligero (0,2 GB, ~51,7 M de parámetros), permite probar latencia y throughput en GPUs de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (51,7 M de parámetros y 0,2 GB de pesos), es probable que quepa en GPUs con 4-8 GB de VRAM, aunque no se confirma en la documentación.
- GPU recomendadas: no especificadas por el autor; LeRobot permite `--policy.device=cuda`. Una RTX 3060 o superior sería suficiente en la práctica, pero es una estimación, no un dato oficial.
- Cabe en GPU de consumo: muy probablemente sí, dado el reducido tamaño del modelo, aunque no se documenta oficialmente.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte para CUDA; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de política).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fabono/act_so101_pickup_in_drawer | 51,7 M | no aplica | Manipulación SO-101 (pick-up en cajón) | Apache 2.0 | HuggingFace |
| Políticas ACT genéricas de LeRobot | variable | no aplica | Manipulación genérica | Apache 2.0 (segun LeRobot) | HuggingFace / LeRobot |
| Políticas Diffusion Policy | no disponible | no aplica | Manipulación por difusión | no disponible | HuggingFace |
| Políticas VLA (p. ej. OpenVLA) | no disponible | no aplica | Manipulación guiada por lenguaje | no disponible | HuggingFace |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con 50 episodios de un entorno concreto, la política puede sobreajustarse a posiciones, iluminación y objetos específicos del dataset.
- Riesgo de alucinación: en robótica, se traduce en acciones erróneas o inseguras fuera de la distribución de entrenamiento; no hay evaluación de robustez publicada.
- Limitaciones de contexto o idioma: no aplica idioma; la tarea está fijada a un único objetivo ("Take the black cube out of the blue drawer...").
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Caveats para producción: no hay resultados de evaluación ni tasas de éxito; requiere calibración de robot y cámaras; sensible a cambios de hardware, iluminación y posiciones de objetos; el modelo es específico para `so_follower` y cámaras `wrist` y `top`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fabono/act_so101_pickup_in_drawer
- Dataset de entrenamiento: https://huggingface.co/datasets/fabono/get_black_cube_quad_20261101_163224
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=fabono/get_black_cube_quad_20261101_163224
