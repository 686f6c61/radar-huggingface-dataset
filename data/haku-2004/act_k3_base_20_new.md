# Haku-2004/act_k3_base_20_new

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad del control. Este repositorio concreto, `Haku-2004/act_k3_base_20_new`, es una política entrenada con LeRobot sobre un robot `so_follower` (SO-100/SO-101 de bajo coste) para la tarea "taskbox", con dos cámaras (frontal y lateral) y un espacio de acciones de 6 dimensiones.

El modelo tiene 51.668.614 parámetros (unos 51,7 M), un tamaño de repositorio de 0,2 GB y se distribuye en formato safetensors bajo licencia Apache 2.0. No es un modelo de lenguaje: es una política visomotora que consume el estado de las articulaciones y dos imágenes RGB de 480x640 y emite comandos de acción de 6 dimensiones a 30 FPS.

Su relevancia es práctica: demuestra el flujo completo de LeRobot para entrenar y desplegar políticas de imitación en hardware asequible, con un conjunto de datos pequeño (20 episodios, 22.272 frames) y una configuración de entrenamiento reproducible (50.000 pasos, batch 8, AdamW, lr 1e-5). Es útil como referencia para quienes quieran replicar o adaptar un pipeline de imitation learning en robots SO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; ventana de observación fija por paso) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; LeRobot no documenta cuantizaciones para esta política) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer que combina un backbone visual (codificador de imágenes) con un transformer encoder-decoder que fusiona las observaciones (estado de 6 dimensiones y dos imágenes de 3x480x640) y genera un chunk de acciones de 6 dimensiones. La predicción por chunks, en lugar de paso a paso, es la innovación central del método: reduce el horizonte efectivo de error y suaviza el control, a costa de cierta reactividad.

El entrenamiento se realizó con LeRobot 0.5.2 sobre el dataset `Haku-2004/LeRobot_dataset_k_3_20261027_143829`: 20 episodios, 22.272 frames a 30 FPS, tarea "taskbox". Configuración: 50.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5, semilla 1000. No se documenta composición del dataset más allá de la tarea, ni uso de RLHF/DPO (no aplica en imitation learning). No se especifica el backbone visual concreto ni el número de capas del transformer en la información disponible.

## Capacidades

- Control visomotor para manipulación robótica: predice chunks de acciones de 6 dimensiones a partir de estado articular e imágenes.
- Fusión multimodal de dos cámaras (frontal y lateral) con el estado del robot.
- Ejecución de la tarea "taskbox" en un robot `so_follower`.
- Aprendizaje por imitación a partir de datos de teleoperación.
- Despliegue en tiempo real a 30 FPS mediante `lerobot-rollout`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Replicación de pipelines de imitation learning: sirve como ejemplo completo de entrenamiento y despliegue con LeRobot sobre hardware SO, útil para laboratorios que quieran montar su primer flujo de política visomotora.
- Manipulación de objetos tipo "taskbox": la política está entrenada para esa tarea concreta y puede ejecutarse en un `so_follower` con dos cámaras configuradas como en el repositorio.
- Base para fine-tuning: al ser una política pequeña (51,7 M parámetros) y con licencia Apache 2.0, puede adaptarse a tareas similares con datasets propios de pocos episodios.
- Prototipado en robótica de bajo coste: el tamaño reducido (0,2 GB) permite iterar rápido en estaciones con GPU consumer.
- Docencia y formación: ejemplo didáctico de ACT con configuración de entrenamiento explícita y comandos reproducibles.
- Evaluación comparativa de métodos: punto de partida para comparar ACT frente a otras políticas de LeRobot (diffusion policy, etc.) en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M parámetros en fp32 serían aproximadamente 0,2 GB de pesos, más overhead de activaciones y del codificador visual. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090, A100, H100). Para inferencia en tiempo real basta una GPU modesta.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs NVIDIA modernas e incluso en CPU para pruebas no críticas.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) con `--policy.path=Haku-2004/act_k3_base_20_new`; el ecosistema LeRobot es la vía documentada.
- Latencia y throughput: no disponibles en la información proporcionada; el dataset y la ejecución se plantean a 30 FPS.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_k3_base_20_new (este) | 51,7 M | no aplica | taskbox en so_follower | apache-2.0 | Hugging Face (LeRobot) |
| Otras políticas ACT de LeRobot | variable | no aplica | manipulación SO | habitualmente apache-2.0 | Hugging Face |
| Diffusion Policy (LeRobot) | variable | no aplica | manipulación | según repositorio | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sin resultados de evaluación: no hay tasas de éxito publicadas, por lo que el rendimiento real en robot es desconocido.
- Dataset muy pequeño (20 episodios, 22.272 frames): alta probabilidad de sobreajuste y baja generalización a posiciones, iluminación o distractores distintos.
- Específica de hardware y tarea: entrenada para `so_follower` con cámaras `front` y `side` a 480x640; cambiar la configuración invalida la política.
- Sin evaluación de sesgos ni robustez: no se documentan análisis de fallos, sesgos visuales ni comportamiento ante condiciones fuera de distribución.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí de acciones erróneas o inseguras en entornos reales; requiere supervisión y parada de emergencia.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- No es un modelo de lenguaje ni multilingüe; no debe usarse para tareas de texto, código o razonamiento.

## Enlaces

- Hugging Face: https://huggingface.co/Haku-2004/act_k3_base_20_new
- Dataset: https://huggingface.co/datasets/Haku-2004/LeRobot_dataset_k_3_20261027_143829
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Haku-2004/LeRobot_dataset_k_3_20261027_143829
