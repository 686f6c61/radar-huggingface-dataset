# Rlayd36/act_redblock_chunk100

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. Este repositorio concreto, `Rlayd36/act_redblock_chunk100`, es una política entrenada con LeRobot sobre un robot de tipo `so_follower` (SO-100/SO-101 de bajo coste) para la tarea "Red block pickup and place" (recoger y colocar un bloque rojo).

El modelo consume el estado articular de 6 dimensiones y dos flujos de imagen RGB de 480x640 (cámara cenital y cámara de muñeca), y produce un vector de acción de 6 dimensiones. Con 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, es una política compacta orientada a inferencia en tiempo real sobre hardware asequible, no un modelo de lenguaje.

Es relevante como ejemplo práctico del ecosistema LeRobot: ilustra el flujo completo de grabación de datos con teleoperación, entrenamiento supervisado y despliegue de una política visuomotora en un robot real, con licencia Apache 2.0 y pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política visuomotora; ventana de observación por chunk de acciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Entradas | `observation.state` (6,), `observation.images.overhead` (3, 480, 640), `observation.images.wrist` (3, 480, 640) |
| Salidas | `action` (6,) |
| Libreria | LeRobot 0.6.0 |
| Dataset de entrenamiento | `Rlayd36/pick-cube_20261116_142939` (50 episodios, 29.176 frames, 30 FPS) |
| Pasos de entrenamiento | 100.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-5 |
| Semilla | 1000 |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que, en lugar de predecir una única acción por paso de tiempo, predice un chunk de acciones futuras. Esto mitiga el problema de la acumulación de errores en políticas autoregresivas y permite un control más suave. La arquitectura combina un backbone visual (procesa las dos cámaras de 480x640), la concatenación del estado propioceptivo de 6 dimensiones y un decodificador transformer que emite el vector de acción de 6 dimensiones. El paper original (arXiv:2304.13705) introduce además una técnica de regularización tipo CVAE para modelar la variabilidad humana en los datos de teleoperación.

El entrenamiento se realizó con LeRobot 0.6.0 sobre 50 episodios teleoperados (29.176 frames a 30 FPS) de la tarea "Red block pickup and place", con 100.000 pasos, batch de 8, AdamW y learning rate 1e-5. No se documenta el uso de RLHF/DPO (no aplica en este paradigma), ni el número total de tokens de entrenamiento en el sentido de modelos de lenguaje. La model card no detalla la composición exacta del dataset más allá del número de episodios y frames.

## Capacidades

- Control visuomotor de un robot `so_follower` para la tarea específica de recoger y colocar un bloque rojo.
- Fusión de dos vistas de cámara (cenital y de muñeca) junto con el estado articular de 6 dimensiones.
- Predicción de chunks de acciones de 6 dimensiones para control suave y estable.
- Aprendizaje por imitación a partir de datos teleoperados; no requiere ingeniería de recompensas.
- Despliegue en tiempo real mediante `lerobot-rollout` con el robot y cámaras configurados.
- No soporta tool calling, function calling, agentes multi-paso ni capacidades multilingües (no es un modelo de lenguaje).
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del dominio robótico.

## Casos de uso

- Recogida y colocación de un bloque rojo en un entorno controlado: la política ejecuta la tarea para la que fue entrenada sobre un `so_follower` con cámara cenital y de muñeca, adecuada para demostraciones de laboratorio y validación de pipelines de imitación.
- Prototipado rápido de políticas visuomotoras: sirve como referencia para comparar configuraciones de ACT (número de chunks, cámaras, tasa de frames) en un robot de bajo coste.
- Docencia y formación en robótica de imitación: ejemplo reproducible del flujo LeRobot (grabación, entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout`).
- Benchmark interno de hardware: al ser una política compacta (51,7 M parámetros, 0,2 GB), permite medir latencia y throughput en GPUs de consumo y en sistemas embebidos.
- Base para fine-tuning en tareas similares de manipulación (por ejemplo, otros objetos o posiciones) reutilizando el mismo robot y configuración de cámaras.
- Validación de infraestructura de datos: el dataset asociado (50 episodios, 29.176 frames) sirve para probar herramientas de visualización y análisis de LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, latencia ni throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M parámetros y pesos en safetensors (0,2 GB de repo), la huella en memoria es reducida y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 3060/4060 o superior es suficiente para inferencia en tiempo real, y una A100/H100 no es necesaria.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos unos pocos GB de VRAM; no se documenta el mínimo exacto.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución y `lerobot-train` para reentrenamiento), con soporte de CUDA mediante `--policy.device=cuda`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo ni de alternativas comparables en la información proporcionada. A modo de contexto cualitativo, dentro del ecosistema LeRobot existen otras políticas de imitación (por ejemplo, Diffusion Policy o VQ-BeT) que abordan el mismo problema de control visuomotor, pero no se han proporcionado sus especificaciones ni resultados para una comparación rigurosa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `Rlayd36/act_redblock_chunk100` | 51.668.614 | no aplica | Apache 2.0 | Hugging Face |
| Alternativas LeRobot (Diffusion Policy, VQ-BeT, etc.) | no disponible | no aplica | no disponible | no disponible |

## Limitaciones y advertencias

- Política específica de una única tarea ("Red block pickup and place"); no generaliza a otros objetos, posiciones o entornos sin reentrenamiento o fine-tuning.
- Entrenada para el robot `so_follower` con dos cámaras concretas (`overhead` y `wrist`); cambiar la configuración de hardware o los nombres de cámara invalida el despliegue.
- Sin resultados de evaluación publicados: se desconoce la tasa de éxito real y la robustez ante variaciones de iluminación, posiciones iniciales o distracciones.
- Dataset pequeño (50 episodios, 29.176 frames), lo que limita la diversidad de demostraciones y puede favorecer el sobreajuste a condiciones concretas.
- Riesgo de fallo silencioso en producción: al no haber métricas de evaluación, no se puede garantizar un comportamiento seguro en entornos no controlados.
- No es un modelo de lenguaje: no tiene capacidades de texto, razonamiento simbólico, tool calling ni multilingüismo.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; verificar el cumplimiento de las licencias de LeRobot y del paper original.
- Sin información sobre sesgos (no aplica en el sentido habitual) ni sobre cuantizaciones soportadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rlayd36/act_redblock_chunk100
- Dataset de entrenamiento: https://huggingface.co/datasets/Rlayd36/pick-cube_20261116_142939
- Paper ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Rlayd36/pick-cube_20261116_142939
