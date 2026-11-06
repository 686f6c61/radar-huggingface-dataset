# RobotControlStack/duobench-xvla-sim

## Resumen

DuoBench X-VLA (sim) es una política robótica de manipulación bimanual desarrollada por RobotControlStack, un grupo de investigación vinculado a la Universidad de Friburgo y al KIT. Se trata de un fine-tuning del modelo base `lerobot/xvla-base` sobre el conjunto de datos DuoBench, un benchmark reproducible para manipulación bimanual en simulación y en el mundo real. El modelo se distribuye como un checkpoint de LeRobot con 879,7 millones de parámetros y pesos en formato safetensors.

El modelo resuelve una tarea concreta: controlar un setup bimanual FR3 Duo en las 11 tareas de simulación de DuoBench mediante una única política multi-tarea. Recibe imágenes de tres cámaras (cabeza y dos muñecas) a 224x224 píxeles y un vector de estado de 16 dimensiones (2 x 7 articulaciones más 2 pinzas), y produce acciones conjuntas de 16 dimensiones. Está entrenado exclusivamente con datos de simulación, con 50 demostraciones por tarea.

Su relevancia es doble: por un lado, sirve como referencia reproducible para investigar políticas bimanuales multi-tarea; por otro, sus resultados publicados son deliberadamente modestos (7,0 % de éxito medio en 300 rollouts por tarea), lo que lo convierte en una línea base honesta contra la que comparar futuros avances en manipulación bimanual. La licencia Apache 2.0 facilita su reutilización tanto académica como comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | X-VLA (política visuolingüística-acción sobre transformer, integrada en LeRobot) |
| Parámetros totales | 879.738.545 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint LeRobot) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `lerobot/xvla-base`, una política X-VLA (Visuolingual-Action) implementada en la librería LeRobot. La entrada combina tres flujos visuales (cámara de cabeza y dos cámaras de muñeca, todas a 224x224) con un vector de estado de 16 dimensiones que codifica las 7 articulaciones de cada brazo FR3 más el estado de las dos pinzas. La salida es un vector de acción de 16 dimensiones correspondiente a posiciones articulares y comandos de pinza, emitido en chunks de 30 acciones.

El entrenamiento se realizó sobre el dataset `RobotControlStack/duobench`, concretamente sobre las carpetas `<task>/sim` de las 11 tareas, con 50 demostraciones por tarea fusionadas en un único conjunto multi-tarea. Se ejecutaron 40.000 pasos con batch size 48, learning rate 1e-4, semilla 1000 y un chunk de acción de 30. El checkpoint está vinculado al commit `c8ce413d` de LeRobot, y la configuración completa se conserva en `train_config.json`. No se documentan detalles sobre el corpus de preentrenamiento del modelo base, ni sobre el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Generación de acciones de control bimanual de 16 dimensiones (7 articulaciones por brazo más 2 pinzas) a partir de observaciones visuales y propioceptivas.
- Política multi-tarea: un único checkpoint cubre las 11 tareas de simulación de DuoBench.
- Procesamiento multimodal de tres cámaras simultáneas (cabeza, muñeca izquierda, muñeca derecha) a 224x224.
- Ejecución de chunks de acción de longitud 30, lo que reduce la frecuencia de inferencia necesaria.
- Integración nativa con LeRobot mediante `XVLAPolicy.from_pretrained(...)`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking; el modelo es específicamente una política robótica.

## Casos de uso

- Línea base para investigación en manipulación bimanual: sirve como referencia reproducible para comparar nuevas políticas sobre las 11 tareas de DuoBench, con intervalos de confianza Wilson al 95 % ya publicados.
- Evaluación de técnicas de fine-tuning multi-tarea: al entrenarse con 50 demostraciones por tarea fusionadas, permite estudiar el equilibrio entre especialización y generalización en políticas bimanuales.
- Reproducción de experimentos: el checkpoint, la configuración de entrenamiento y el commit de LeRobot están fijados, lo que facilita la replicación exacta de los resultados.
- Desarrollo de pipelines de simulación a real: aunque el modelo no está pensado para el robot real, puede usarse como punto de partida para estudiar transferencia sim-to-real con datos adicionales.
- Benchmarking de infraestructura de inferencia robótica: con 879,7 M de parámetros y tres cámaras, es un caso de prueba realista para medir latencia y throughput de políticas VLA en GPUs de consumo.
- Docencia y formación: por su licencia Apache 2.0 y su tamaño contenido, es adecuado para cursos y talleres sobre aprendizaje por imitación y políticas visuomotoras.
- Estudio de fallos en tareas de precisión: las tareas con 0 % de éxito (block_balance, join_blocks, pour_marbles, transfer_reorient) ofrecen un conjunto de casos duros para analizar modos de fallo.

## Benchmarks y rendimiento

Resultados publicados por el autor: tasa de éxito (%) en simulación DuoBench sobre 300 rollouts por tarea (semillas 0-299), con intervalo de confianza Wilson al 95 %.

| Tarea | Éxito (%) | IC 95 % |
|---|---|---|
| ball_maze | 2,0 | [0,9; 4,3] |
| bin_sort | 1,0 | [0,3; 2,9] |
| block_balance | 0,0 | [0,0; 1,3] |
| carry_pot | 12,3 | [9,1; 16,5] |
| hinge_chest | 12,0 | [8,8; 16,2] |
| join_blocks | 0,0 | [0,0; 1,3] |
| pour_marbles | 0,0 | [0,0; 1,3] |
| spring_door | 13,7 | [10,2; 18,0] |
| transfer_cube | 9,3 | [6,5; 13,2] |
| transfer_gate | 26,3 | [21,7; 31,6] |
| transfer_reorient | 0,0 | [0,0; 1,3] |
| **Media** | **7,0** | — |

No se han publicado comparaciones directas con otras políticas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 879,7 M de parámetros en fp32 se requieren aproximadamente 3,5 GB solo para pesos, más el coste de las tres cámaras a 224x224 y del codificador visual.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090 (24 GB) o una A100/H100 son opciones holgadas para inferencia en fp32 o fp16.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más en fp16, aunque no hay cifras oficiales.
- Opciones de despliegue: LeRobot en el commit `c8ce413d` mediante `XVLAPolicy`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al tratarse de una política robótica y no de un LLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables en la información proporcionada. El modelo base `lerobot/xvla-base` es el referente inmediato, pero no se han publicado sus resultados en DuoBench ni una comparación directa con esta política fine-tuneada.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DuoBench X-VLA (sim) | 879,7 M | no disponible | Apache 2.0 | Hugging Face |
| lerobot/xvla-base | no disponible | no disponible | no disponible | Hugging Face |
| Otras políticas DuoBench | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado exclusivamente con datos de simulación; el autor indica explícitamente que no está pensado para el robot real.
- Rendimiento bajo: media del 7,0 % de éxito y cuatro tareas con 0 % de éxito, lo que limita su uso práctico fuera de investigación y benchmarking.
- Requiere una versión de LeRobot compatible con el commit `c8ce413d`; otras versiones pueden no cargar el checkpoint correctamente.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas, al no ser un modelo de lenguaje general.
- La licencia Apache 2.0 permite uso comercial, pero el modelo está diseñado para simulación y su valor comercial directo es limitado.
- El modelo depende de un setup hardware concreto (FR3 Duo, tres cámaras, estado de 16 dimensiones); no es portable a otras configuraciones sin reentrenamiento.
- Solo 12 descargas y 0 likes en el momento de la consulta: ecosistema de usuarios muy reducido y poca validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RobotControlStack/duobench-xvla-sim
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Dataset DuoBench: https://huggingface.co/datasets/RobotControlStack/duobench
- Paper DuoBench (arXiv): https://arxiv.org/abs/2606.11901
- Página del proyecto: https://duobench.github.io/
- Código DuoBench: https://github.com/RobotControlStack/duobench
- LeRobot (commit de referencia): https://github.com/huggingface/lerobot/tree/c8ce413d738da15a2eed2d0832315779ea28cbf9
