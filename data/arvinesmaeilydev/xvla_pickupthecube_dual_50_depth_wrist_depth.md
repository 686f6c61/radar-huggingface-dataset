# arvinesmaeilydev/xvla_PickUpTheCube_Dual_50_Depth_wrist_depth

## Resumen

`xvla_PickUpTheCube_Dual_50_Depth_wrist_depth` es una política robótica de tipo Vision-Language-Action (VLA) publicada por el usuario arvinesmaeilydev y afinada a partir de `lerobot/xvla-base`. Implementa el marco X-VLA, un framework de flow matching con soft prompts aprendibles en el que cada configuración de robot, sensores y espacio de acciones se codifica como una "tarea" mediante un conjunto reducido de embeddings, lo que permite que un único modelo se adapte a morfologías y sensores distintos. En este caso concreto, la política está especializada en una única tarea: coger un cubo con un robot `so_follower` (SO-100/SO-101 de LeRobot).

El modelo tiene 879.687.256 parámetros (unos 880 millones, según los pesos en safetensors) y consume tres entradas visuales más el estado de las articulaciones: dos cámaras RGB de 256x256, una imagen de profundidad de 224x224 y un vector de estado de 8 dimensiones. Produce un vector de acción continuo de 6 dimensiones, típico de un brazo manipulador de 6 grados de libertad. El repositorio ocupa 67,0 GB, un tamaño muy superior al de los pesos en precisión de inferencia, lo que sugiere que incluye checkpoints intermedios y estados del optimizador.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo real y reproducible de fine-tuning de X-VLA con LeRobot 0.6.2 sobre un dataset pequeño (50 episodios, 23.278 fotogramas a 30 FPS); por otro, sirve como caso de estudio de los límites de las políticas de imitación publicadas sin evaluación: la model card no reporta ninguna tasa de éxito en robot real, por lo que su rendimiento efectivo es desconocido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con flow matching y soft prompts aprendibles (X-VLA) |
| Parametros totales | 879.687.256 (aproximadamente 880 M) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors (sin variantes GGUF ni cuantizadas) |
| Idiomas soportados | No disponible (no es un modelo conversacional; las instrucciones de tarea son cadenas de texto del dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

X-VLA es un framework VLA basado en flow matching y condicionado por soft prompts: cada configuración física (tipo de robot, conjunto de cámaras, dimensionalidad del estado y del espacio de acciones) se representa mediante un pequeño conjunto de embeddings aprendibles que actúan como "tarea", de modo que un mismo modelo puede reconciliar morfologías y sensores heterogéneos. La política consume tres flujos visuales (`observation.images.image` y `observation.images.image2` a 3x256x256, y `observation.images.image3` a 3x224x224, correspondiente a la profundidad de muñeca) junto con `observation.state` de shape (8,), y genera una acción continua de shape (6,). El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `arvinesmaeilydev/PickUpTheCube_Dual_50_Depth`, compuesto por 50 episodios y 23.278 fotogramas grabados a 30 FPS para la tarea "pick up the cube", con cámaras `top`, `wrist`, `top_depth` y `wrist_depth` sobre un robot `so_follower`.

La configuración de fine-tuning fue de 10.000 pasos con batch de 32, optimizador `xvla-adamw`, learning rate 1e-4 y semilla 1000. No se documenta en la información disponible el número total de tokens de entrenamiento del modelo base, la composición del dataset de preentrenamiento ni si hubo etapas de RLHF o DPO (poco habituales en políticas de imitación). Tampoco se detalla ninguna innovación adicional de decodificación o atención más allá del esquema de soft prompts y flow matching descrito en el paper.

## Capacidades

- Manipulación robótica de una sola tarea: ejecutar la habilidad "pick up the cube" sobre un robot `so_follower` a partir de observaciones visuales y propioceptivas.
- Fusión multimodal de dos cámaras RGB (vista superior y de muñeca) más una entrada de profundidad, lo que aporta información geométrica para el agarre.
- Generación de acciones continuas de 6 dimensiones (típicamente 6 grados de libertad) a partir de un estado de 8 dimensiones.
- Control reactivo a la frecuencia de captura del dataset (30 FPS), adecuado para bucles de control de imitación.
- Acondicionamiento por instrucción textual de tarea: la política acepta el string de tarea (`--task="pick up the cube"`) en el comando de rollout.
- Reutilización del backbone preentrenado `lerobot/xvla-base` para fine-tuning en nuevas tareas o robots mediante el esquema de soft prompts.
- No soporta tool calling, function calling, razonamiento multi-paso, visión general, audio ni generación de texto libre: es una política motora, no un modelo de lenguaje de propósito general.

## Casos de uso

- Recogida de objetos en un banco de laboratorio: la política se ejecuta con `lerobot-rollout` sobre un SO-100/SO-101 y ejecuta la secuencia de aproximación, agarre y elevación del cubo usando las vistas superior y de muñeca.
- Base para fine-tuning en nuevas tareas de pick-and-place: al partir de `lerobot/xvla-base` y usar soft prompts por configuración, sirve como referencia de pipeline para entrenar variantes con datasets propios de 50 a varios cientos de episodios.
- Evaluación de sensores de profundidad en políticas de imitación: al incluir `top_depth` y `wrist_depth`, permite comparar el efecto de añadir profundidad frente a RGB puro en la tasa de éxito del agarre.
- Docencia y formación en robótica de imitación: ejemplo reproducible y de licencia permisiva (Apache 2.0) para cursos que usan LeRobot, con comandos de entrenamiento e inferencia documentados.
- Pruebas de integración de hardware de bajo coste: validar cámaras, calibración y puertos serie en un montaje `so_follower` antes de escalar a tareas más complejas.
- Referencia para investigación en adaptación multi-robot: permite estudiar cómo se comportan los soft prompts al reutilizar el mismo backbone en brazos con distinto número de articulaciones o distinta disposición de cámaras.
- Generación de datos sintéticos de evaluación: usar los rollouts para comparar distribuciones de acciones frente a las demostraciones humanas del dataset original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explícitamente la nota "_No evaluation results have been provided for this policy yet_", y la plantilla de evaluación en robot real (trials, éxitos, tasa de éxito) está sin rellenar. No existen, por tanto, datos de MMLU, HumanEval, GSM8K ni tasas de éxito de la tarea "pick up the cube" que puedan citarse sin inventarlos.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1,8 GB en bf16/fp16 y unos 3,5 GB en fp32 solo para los pesos; hay que sumar el coste de los tres codificadores visuales y de los buffers de activaciones, por lo que un presupuesto realista es de 6 a 8 GB.
- GPU recomendadas: RTX 4090, RTX 3090, A100 o H100 para entrenamiento o fine-tuning; cualquier GPU con 8 GB o más para inferencia.
- Cabe en GPU de consumo: sí, en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). El repositorio de 67 GB no cabe en GPU; solo los pesos se cargan en memoria.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) con PyTorch/CUDA como backend; también es posible cargar la política con el paquete `lerobot` desde Python. No aplican vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo de lenguaje autoregresivo.
- Latencia y throughput: no disponibles. El dataset se grabó a 30 FPS y `lerobot-rollout` está pensado para bucles de control en tiempo real, pero no se publica latencia por paso ni frecuencia de inferencia alcanzada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `arvinesmaeilydev/xvla_PickUpTheCube_Dual_50_Depth_wrist_depth` | 879,7 M | No disponible | Sin evaluar (0 resultados reportados) | Apache 2.0 | HuggingFace Hub, vía LeRobot |
| `lerobot/xvla-base` (modelo base) | No disponible en esta informacion | No disponible | No disponible | No disponible en esta informacion | HuggingFace Hub |
| Otras políticas LeRobot del mismo ecosistema (SmolVLA, ACT, pi0) | No disponible en esta informacion | No disponible | No disponible | No disponible en esta informacion | HuggingFace Hub, vía LeRobot |

La comparación cuantitativa no es posible con los datos disponibles: no se han publicado métricas de éxito para esta política ni cifras verificables de los modelos alternativos en la información proporcionada. La única comparación fiable es cualitativa: frente a políticas específicas por robot, X-VLA comparte un backbone con soft prompts por configuración, lo que reduce el coste de adaptación a nuevos montajes a cambio de una mayor complejidad de integración.

## Limitaciones y advertencias

- Sesgos conocidos: la política está entrenada con 50 episodios de un único montaje, iluminación y posición de objeto, por lo que hereda cualquier sesgo de esas demostraciones (posiciones iniciales, fondo, tipo de cubo).
- Riesgo de sobreajuste: 10.000 pasos con batch 32 sobre 23.278 fotogramas es un régimen propenso a memorizar la distribución del dataset; no hay validación en robot real publicada.
- Alucinación en el sentido de acciones incorrectas: al no haber evaluación, no puede descartarse que la política genere trayectorias plausibles pero fallidas fuera de la distribución de entrenamiento.
- Limitación de tarea e idioma: solo ejecuta "pick up the cube"; no es un modelo multilingüe ni conversacional y no admite instrucciones arbitrarias en lenguaje natural.
- Dependencia estricta del hardware: requiere un robot `so_follower` y exactamente las cámaras `top`, `wrist`, `top_depth` y `wrist_depth` con los shapes (3,256,256), (3,256,256) y (3,224,224), y un estado de 8 dimensiones; un montaje distinto invalida la política.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero no se ofrece ninguna garantía; para uso en robótica física real es imprescindible añadir paradas de emergencia y límites de par.
- Caveat de producción: el repositorio de 67 GB incluye previsiblemente checkpoints y estados del optimizador; conviene descargar solo los ficheros de inferencia para evitar consumo de almacenamiento innecesario.
- Ausencia de model card completa: no se documentan sesgos, datos de preentrenamiento ni evaluación, lo que dificulta una auditoría técnica en entornos regulados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arvinesmaeilydev/xvla_PickUpTheCube_Dual_50_Depth_wrist_depth
- Dataset de entrenamiento: https://huggingface.co/datasets/arvinesmaeilydev/PickUpTheCube_Dual_50_Depth
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Paper de X-VLA (arXiv 2510.10274): https://huggingface.co/papers/2510.10274
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de X-VLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=arvinesmaeilydev/PickUpTheCube_Dual_50_Depth
