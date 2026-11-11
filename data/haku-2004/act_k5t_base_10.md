# Haku-2004/act_k5t_base_10

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales, tal como se describe en el artículo arXiv:2304.13705. Este checkpoint concreto, `Haku-2004/act_k5t_base_10`, es una política entrenada con LeRobot sobre un robot de tipo `so_follower` para la tarea "taskbox", con dos cámaras (frontal y lateral) a resolución 480x640 y 30 FPS.

El modelo tiene 51.668.614 parámetros totales y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras para control robótico en tiempo real. No es un modelo de lenguaje: consume un vector de estado de 6 dimensiones y dos imágenes, y produce un vector de acción de 6 dimensiones. Se entrenó durante 50.000 pasos con batch size 8, optimizador AdamW y learning rate 1e-05, sobre un dataset de 20 episodios y 25.815 frames.

Su relevancia es la de un artefacto de investigación reproducible: ilustra el flujo completo de LeRobot para entrenar y desplegar políticas de imitación en robots de bajo coste (SO-100/SO-101), con licencia Apache 2.0 y sin restricciones de uso comercial. No se han publicado resultados de evaluación en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación; no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robótico, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

Especificaciones adicionales del checkpoint:

| Parametro | Valor |
|---|---|
| Tipo de robot | `so_follower` |
| Cámaras | `front`, `side` (3, 480, 640 cada una) |
| Entrada de estado | `observation.state` (6,) |
| Salida de acción | `action` (6,) |
| Dataset de entrenamiento | Haku-2004/k5_20261110_143202 |
| Episodios / frames | 20 / 25.815 |
| Frame rate | 30 FPS |
| Tarea | "taskbox" |
| Pasos de entrenamiento | 50.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.5.2 |

## Arquitectura y entrenamiento

ACT es un transformer que combina un encoder visual (procesa las dos cámaras a 480x640) con un decoder autorregresivo que genera un chunk de acciones futuras en lugar de una sola acción por paso. Esta predicción por chunks reduce el error de compounding y mejora la estabilidad del control, a costa de una latencia de decisión mayor. El modelo incorpora el estado propioceptivo de 6 dimensiones como token adicional junto con las representaciones visuales.

El entrenamiento se realizó mediante imitación supervisada sobre 20 episodios teleoperados (25.815 frames a 30 FPS) del dataset `Haku-2004/k5_20261110_143202`, con 50.000 pasos, batch size 8 y AdamW a learning rate 1e-05. No se documenta uso de RLHF, DPO ni técnicas de refinamiento posteriores; es aprendizaje por imitación puro. El dataset es reducido (20 episodios), lo que condiciona la generalización de la política.

## Capacidades

- Control robótico por imitación: genera acciones de 6 dimensiones para un robot `so_follower` a partir de estado y dos vistas de cámara.
- Predicción de chunks de acción: emite secuencias cortas de acciones, lo que suaviza la ejecución y reduce la acumulación de errores.
- Percepción visual multi-cámara: procesa simultáneamente las vistas `front` y `side` a 480x640.
- Ejecución de una tarea concreta: "taskbox", definida en el dataset de entrenamiento.
- Integración con LeRobot: compatible con `lerobot-rollout` y `lerobot-train`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual ni capacidades multilingües.

## Casos de uso

- Automatización de una celda de pick-and-place: la política ejecuta la tarea "taskbox" sobre un SO-100/SO-101, adecuada para prototipos de manipulación repetitiva con objetos de posición estable.
- Investigación en aprendizaje por imitación: sirve como baseline reproducible para comparar variantes de ACT, tamaños de dataset o configuraciones de entrenamiento con LeRobot 0.5.2.
- Docencia y formación en robótica: ejemplo completo de pipeline teleoperación → dataset → entrenamiento → despliegue, con comandos documentados en la model card.
- Pruebas de integración de hardware: validar la calibración de cámaras y del robot `so_follower` antes de entrenar políticas propias.
- Generación de datos sintéticos de evaluación: usar la política como referencia para medir éxito en la tarea "taskbox" bajo distintas condiciones de iluminación o posición.
- Benchmark de latencia en inferencia robótica: al ser un modelo de 51,7 M de parámetros, permite medir throughput en GPUs de consumo y en CPU para despliegues embebidos.
- Base para fine-tuning: punto de partida para reentrenar con un dataset mayor o con nuevas tareas, dado que la licencia Apache 2.0 lo permite.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 51,7 M de parámetros en fp32 el peso ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU con 2 GB o más, incluyendo GPUs integradas.
- GPU recomendadas: no se especifican; para entrenamiento con batch size 8 y dos cámaras a 480x640 se recomienda una GPU con al menos 8 GB (RTX 3060/4060 o superior). Para inferencia basta una GPU de gama baja o incluso CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3050, RTX 4090, etc.) e incluso en placas embebidas tipo Jetson.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de `--policy.device=cuda`; no se documentan exportaciones a ONNX, TensorRT ni llama.cpp (no aplica).
- Latencia y throughput: no disponibles. La política opera a 30 FPS según el dataset, pero no se reportan tiempos de inferencia medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_k5t_base_10 (este) | 51,7 M | taskbox, so_follower | estado (6,) + 2 imágenes 480x640 | Apache 2.0 | Hugging Face |
| ACT original (paper 2304.13705) | no disponible | manipulación diversa | estado + imágenes | según implementación | paper + código |
| Otras políticas LeRobot (p. ej. Diffusion Policy, TDMPC) | no disponible | manipulación | variable | variable | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada.

## Limitaciones y advertencias

- Dataset muy reducido: solo 20 episodios y 25.815 frames, lo que limita la generalización a posiciones, iluminación y objetos distintos de los vistos en entrenamiento.
- Tarea única: la política está entrenada exclusivamente para "taskbox"; no es un modelo generalista.
- Sin evaluación publicada: no hay tasas de éxito medidas, por lo que el rendimiento real en el robot es desconocido.
- Dependencia de hardware: requiere un robot `so_follower` y dos cámaras con nombres `front` y `side` coincidentes con las claves de observación; cualquier cambio de calibración o montaje puede degradar el comportamiento.
- Sin capacidades lingüísticas, de razonamiento ni de tool calling.
- Riesgo de sobreajuste a las condiciones de recogida de datos (posiciones de cámara, iluminación, fondo).
- Licencia Apache 2.0: permite uso comercial y modificación, pero no se ofrece garantía alguna sobre el comportamiento del modelo.
- No se documentan sesgos específicos; al ser un modelo robótico, los riesgos son de seguridad física en la ejecución, no de sesgo lingüístico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k5t_base_10
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k5_20261110_143202
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Haku-2004/k5_20261110_143202
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
