# shangarot/act_moveT_TaskC_2

## Resumen

`act_moveT_TaskC_2` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705, y empaquetada con la librería LeRobot de Hugging Face. El modelo lo publica el usuario `shangarot` y resuelve una tarea muy concreta de manipulación: descargar una pieza en forma de T de una caja negra ("Unload T shape from black box") con un robot tipo `so_follower` (SO-100/SO-101 de LeRobot) equipado con dos cámaras, una cenital (`top`) y otra en la muñeca (`wrist`).

No es un modelo de lenguaje: es un transformer pequeño (51.668.614 parámetros, unos 0,2 GB en safetensors) que mapea observaciones (estado articular de 6 dimensiones más dos imágenes RGB de 480x640) a acciones de 6 dimensiones. ACT predice "chunks" de acciones de corto horizonte en lugar de pasos individuales, lo que reduce el error de compounding y suele lograr tasas de éxito altas en tareas de manipulación aprendidas por teleoperación.

Su relevancia es la de un artefacto reproducible de investigación: sirve como referencia de un pipeline completo de imitación (grabación de datos, entrenamiento con LeRobot 0.7.1 y despliegue con `lerobot-rollout`) para quien quiera replicar o adaptar un flujo de aprendizaje por imitación en robótica de bajo coste. No hay resultados de evaluación publicados ni licencia declarada, así que debe tratarse como un checkpoint experimental, no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (no procesa texto libre; la instrucción de tarea es una cadena fija) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (repo de 0,2 GB, librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder con un backbone visual (ResNet) que procesa las dos cámaras (`top` y `wrist`, 3x480x640 cada una) y un codificador que fusiona las características visuales con el estado articular (`observation.state`, 6 dimensiones). El decodificador genera un chunk de acciones de 6 dimensiones por paso; la predicción por chunks es la innovación central del método frente a políticas paso a paso, y el paper reporta que mejora la estabilidad y la tasa de éxito en tareas de manipulación fina. El modelo se entrenó con 40.000 pasos, batch size 8, optimizador AdamW y learning rate 1e-05, semilla 1000, usando LeRobot 0.7.1.

Los datos de entrenamiento son el dataset `shangarot/moveT_TaskC_2`: 63 episodios teleoperados, 26.175 frames a 30 FPS, con la única tarea "Unload T shape from black box". No se documenta composición adicional del dataset, aumento de datos, ni fases de RLHF/DPO (no aplicables a imitación supervisada). Tampoco se especifica la configuración exacta del backbone visual ni el horizonte del chunk de acciones en la información disponible.

## Capacidades

- Manipulación robótica de una tarea única: descargar una pieza en T de una caja negra con un robot `so_follower`.
- Entrada multimodal: estado articular de 6 dimensiones y dos flujos de imagen RGB de 480x640 (cámaras `top` y `wrist`).
- Salida de acciones continuas de 6 dimensiones por paso, predichas en chunks de corto horizonte.
- Aprendizaje por imitación a partir de datos teleoperados (no requiere recompensa ni entorno simulado).
- Despliegue mediante `lerobot-rollout` con la estrategia `base` y ejecución en tiempo real a 30 FPS.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingües: no es un modelo generativo de texto.
- No se documentan capacidades de generalización a objetos, posiciones o iluminaciones distintas de las del dataset.

## Casos de uso

- Replicación de un pipeline de imitación end-to-end: usar el repo como referencia para grabar datos con LeRobot, entrenar con `lerobot-train --policy.type=act` y desplegar con `lerobot-rollout`, sirviendo de plantilla para tareas propias.
- Automatización de una celda de pick-and-place con pieza en T: el modelo ejecuta la secuencia de descarga de la caja negra en un SO-100/SO-101 con dos cámaras, adecuado para demostraciones de laboratorio con condiciones controladas.
- Benchmark interno de políticas de imitación: comparar ACT frente a otras políticas de LeRobot (p. ej. Diffusion Policy) sobre el mismo dataset de 63 episodios y 26.175 frames.
- Docencia y formación en robótica: ejemplo completo y de bajo coste (0,2 GB de pesos) para explicar chunking de acciones, codificación visual y teleoperación.
- Base para fine-tuning en una tarea variante: partir de estos pesos y reentrenar con un dataset propio que modifique la posición de la caja o el tipo de pieza, aprovechando la infraestructura de LeRobot.
- Pruebas de integración hardware-software: validar la calibración de cámaras y del robot `so_follower` ejecutando la política durante 60 segundos con `--duration=60` antes de desplegar políticas más complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No hay tabla de tareas, número de ensayos ni tasas de éxito.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 51,7 M de parámetros y pesos en safetensors (0,2 GB), la huella es muy reducida y cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 3060/4060 o superior es suficiente; el cuello de botella real es el procesamiento de dos cámaras a 30 FPS.
- Cabe en GPU consumer: sí, por el tamaño del modelo; el requisito práctico es la captura simultánea de dos streams de vídeo.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) con el paquete `lerobot` 0.7.1; el entrenamiento se hace con `lerobot-train --policy.type=act --policy.device=cuda`. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas robóticas).
- Latencia y throughput: no disponibles; la ejecución se plantea a 30 FPS, la misma frecuencia del dataset de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `shangarot/act_moveT_TaskC_2` | 51.668.614 | no aplica | Descargar pieza T de caja negra (SO-100) | no disponible | Hugging Face, 0 descargas, 0 likes |
| ACT (paper arXiv:2304.13705) | no disponible | no aplica | Manipulación general por imitación | no disponible | Paper y código de referencia |
| Otras políticas LeRobot (p. ej. Diffusion Policy) | no disponible | no aplica | Manipulación por imitación | varía según checkpoint | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con 63 episodios de una única tarea, el modelo está fuertemente sesgado hacia la configuración exacta de cámara, robot y objeto del dataset.
- Riesgo de alucinación: no aplica en el sentido de texto, pero sí existe riesgo de acciones incorrectas o inseguras fuera de la distribución de entrenamiento (nuevas posiciones, iluminación o piezas).
- Limitaciones de contexto e idioma: no procesa lenguaje; la tarea es una cadena fija ("Unload T shape from black box") y no hay soporte multilingüe.
- Restricciones de licencia: la licencia no está declarada ("[More Information Needed]"), por lo que no se puede asumir uso comercial permitido; hay que contactar con el autor antes de cualquier despliegue productivo.
- Sin evaluación publicada: no hay tasas de éxito en robot real, lo que impide estimar su fiabilidad.
- Dependencia de hardware concreto: requiere un robot `so_follower` y dos cámaras con los nombres `top` y `wrist`; cualquier cambio de montaje o calibración invalida la política.
- Repo con 0 descargas y 0 likes: sin validación por parte de la comunidad; tratarlo como checkpoint experimental.
- Fecha de creación futura en los metadatos (2026-11-16): conviene verificar la integridad y procedencia del repo antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shangarot/act_moveT_TaskC_2
- Dataset de entrenamiento: https://huggingface.co/datasets/shangarot/moveT_TaskC_2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=shangarot/moveT_TaskC_2
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
