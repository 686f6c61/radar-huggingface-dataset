# lerobot/Cosmos3-Edge-Policy-LIBERO

## Resumen

Cosmos3-Edge-Policy-LIBERO es una política robótica de tipo vision-language-action (VLA) desarrollada por el equipo de LeRobot (Hugging Face) mediante fine-tuning del checkpoint base Cosmos3-Edge de NVIDIA sobre las cuatro suites del benchmark LIBERO. El modelo recibe una instrucción de tarea en lenguaje natural junto con dos imágenes de cámara (tercera persona y muñeca) a 256x256 y 20 FPS, y predice un chunk de 16 acciones junto con el vídeo futuro de la escena. Está pensado para control de manipuladores en entornos simulados y como referencia reproducible para investigación en políticas robóticas.

La arquitectura subyacente es un backbone Nemotron 3 Dense VL MoT con 28 capas de decodificador y anchura oculta de 2048, con un total de 4.563.688.396 parámetros en formato safetensors. El modelo combina generación de acciones con predicción de vídeo futuro, una formulación que obliga a la política a modelar la dinámica del entorno y no solo el mapeo observación-acción. El checkpoint publicado corresponde a los pesos EMA en la actualización de optimizador 4000, seleccionado por tasa de éxito en LIBERO entre los checkpoints guardados.

Su relevancia actual radica en que ofrece un rendimiento de estado del arte en LIBERO (97,95% de media) con un coste de inferencia contenido en una sola GPU A800 de 80 GB, y en que se distribuye con todo el pipeline de evaluación reproducible a través de LeRobot. La licencia OpenMDW 1.1 permite uso comercial con condiciones, lo que lo hace atractivo para prototipado de manipulación robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron 3 Dense VL MoT (vision-language-action con predicción de vídeo), 28 capas de decodificador, anchura oculta 2048 |
| Parametros totales | 4.563.688.396 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16 y 4 tensores FP32) |
| Idiomas soportados | no disponible (las instrucciones de tarea de LIBERO están en inglés) |
| Licencia | OpenMDW 1.1 (openmdw1.1-license) |
| Formato de pesos | safetensors (1188 tensores: 1184 BF16 y 4 FP32 para el timestep embedding) |

## Arquitectura y entrenamiento

El modelo se construye sobre el backbone Nemotron 3 Dense VL MoT, un transformer denso con 28 capas de decodificador y anchura oculta de 2048 que procesa conjuntamente instrucciones de texto e imágenes de cámara. La política predice de forma conjunta un chunk de 16 acciones (10D: delta de posición de 3 dimensiones, rot6d de 6 dimensiones y gripper) y el vídeo futuro de la escena, lo que actúa como señal auxiliar de modelado de dinámica. Las acciones se convierten a las 7D nativas de LIBERO mediante los procesadores del entorno. La inferencia usa muestreo UniPC con 30 pasos, guidance scale 1 (sin classifier-free guidance) y sampling shift 5, ejecutando cada chunk de 16 acciones de forma completa.

El fine-tuning parte de lerobot/Cosmos3-Edge (formato LeRobot del checkpoint nvidia/Cosmos3-Edge) con los módulos de acción reinicializados (`--policy.load_action_modules=false`). Se entrenó sobre lerobot/LIBERO-Cosmos3: 1693 episodios y 40 tareas, usando todos los episodios sin split de validación. El entrenamiento empleó batch global de 2048 muestras por actualización (64 por GPU x 32 GPUs x 1 de acumulación) en 32 NVIDIA A100-SXM4-80GB repartidas en 4 nodos con InfiniBand, con paralelismo FSDP2 HSDP (sharding sobre 8 GPUs por nodo y replicación sobre 4 nodos). Se realizaron 8000 actualizaciones de optimizador con AdamW (lr 5e-5, 2.5e-4 para los módulos de acción, betas 0.9/0.99) y checkpoint cada 500 pasos; el publicado es el paso 4000, elegido por tasa de éxito en LIBERO.

## Capacidades

- Predicción de acciones robóticas de manipulación a partir de instrucción en lenguaje natural e imágenes de cámara (tercera persona y muñeca).
- Generación de chunks de 16 acciones con control de efector final relativo (delta de posición, rot6d y gripper).
- Predicción de vídeo futuro de la escena como tarea auxiliar, útil para modelado de dinámica y depuración visual.
- Control en bucle cerrado en las cuatro suites de LIBERO: Spatial, Object, Goal y LIBERO-10.
- Procesamiento multimodal de texto e imagen a 256x256 RGB y 20 FPS.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general ni otros idiomas distintos del de las instrucciones de LIBERO.

## Casos de uso

- Evaluación reproducible de políticas VLA: sirve como referencia con pipeline de evaluación completo vía `lerobot-eval`, permitiendo comparar nuevas políticas contra un baseline publicado con tasas de éxito por suite y configuración exacta de MuJoCo y robosuite.
- Investigación en manipulación con predicción de vídeo: el modelo predice el vídeo futuro de la escena, lo que permite estudiar si el modelado de dinámica mejora la generalización en tareas de contacto rico como las de LIBERO-Object.
- Prototipado de control de brazo robótico en simulación: con observaciones de cámara de tercera persona y muñeca, se puede integrar en entornos robosuite/MuJoCo para validar estrategias de agarre y colocación antes de transferir a hardware.
- Benchmarking de infraestructura de inferencia: al requerir una sola GPU de 80 GB en BF16 con SDPA y sin `torch.compile`, es útil para medir latencia y throughput de pipelines VLA en A100/A800/H100.
- Fine-tuning sobre nuevos datasets LeRobot: al estar publicado en formato LeRobot con módulos de acción reinicializables, sirve como punto de partida para adaptar la política a otras tareas o dominios de manipulación.
- Docencia y divulgación en robótica con IA: la reproducibilidad del comando de evaluación y la disponibilidad del dataset LIBERO-Cosmos3 facilitan cursos prácticos sobre políticas VLA y evaluación en bucle cerrado.

## Benchmarks y rendimiento

Tasas de éxito en bucle cerrado sobre LIBERO (50 episodios por tarea, 500 por suite):

| Modelo | Libero-Spatial | Libero-Object | Libero-Goal | Libero-10 | Media |
|---|---|---|---|---|---|
| Cosmos3-Nano-Policy-LIBERO | 98,0% (490/500) | 99,4% (497/500) | 97,4% (487/500) | 96,8% (484/500) | 97,90% |
| Cosmos3-Edge-Policy-LIBERO | 98,6% (493/500) | 99,4% (497/500) | 97,2% (486/500) | 96,6% (483/500) | 97,95% |

Condiciones de medida: MuJoCo 2.3.7, robosuite 1.4.0, hf-libero 0.1.4, Gymnasium 1.3.0, renderizado EGL en GPU, control relativo del efector final, reset duro y estados iniciales fijos por tarea, semillas 0 a 49, batch de 4 entornos, BF16 con atención SDPA, sin `torch.compile`, TF32 desactivado, cuDNN benchmarking desactivado, muestreo UniPC de 30 pasos con guidance scale 1 y shift 5, ejecución completa de cada chunk de 16 acciones. Presupuesto de pasos: 210 (Spatial), 270 (Object), 290 (Goal) y 510 (LIBERO-10), contados tras los 10 pasos de asentamiento del entorno. Hardware: 1 NVIDIA A800-SXM4-80GB por suite.

Advertencia del autor: MuJoCo 3.x altera el resultado de tareas LIBERO con contacto rico, por lo que las medidas con esa versión no son comparables. Además, `lerobot-eval` ejecuta el preprocesador en el dispositivo de la política y activa cuDNN benchmarking, lo que cambia ligeramente las entradas y el muestreo respecto a la evaluación publicada.

## Requisitos de hardware

- Inferencia en BF16: una GPU con 80 GB de VRAM es suficiente; la evaluación oficial se ejecutó en una NVIDIA A800-SXM4-80GB por suite.
- GPU recomendadas: A100-SXM4-80GB, A800-SXM4-80GB, H100-80GB. No se documenta funcionamiento en GPUs de consumo.
- No se dispone de datos de cuantización publicados; el repositorio solo incluye pesos BF16 (más 4 tensores FP32), por lo que no se puede confirmar que quepa en GPUs de consumo tipo RTX 4090 (24 GB) sin cuantizar.
- Despliegue: `lerobot-eval` con `--policy.path=lerobot/Cosmos3-Edge-Policy-LIBERO` y `--policy.dtype=bfloat16`; se requiere MuJoCo 2.3.7 (el lock de LeRobot instala 3.8.1), robosuite 1.4.0, hf-libero 0.1.4, Gymnasium 1.3.0, PyTorch 2.11.0+cu128, Transformers 5.5.4, Diffusers 0.39.0 y Accelerate 1.15.0.
- Commit de LeRobot de referencia: `d0a20dc38e058a8aa3f7bc48cf32d48bb2f99e5b` (PR huggingface/lerobot#5134).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media LIBERO | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-Edge-Policy-LIBERO | 4.563.688.396 | no disponible | 97,95% | OpenMDW 1.1 | Hugging Face (LeRobot) |
| Cosmos3-Nano-Policy-LIBERO | no disponible | no disponible | 97,90% | no disponible | Hugging Face (LeRobot) |
| Cosmos3-Edge (base) | no disponible | no disponible | no aplica (no es política) | no disponible | Hugging Face (LeRobot) / nvidia |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre las 40 tareas de LIBERO; no se ha validado su generalización a otras tareas, entornos o robots fuera de ese benchmark.
- Las instrucciones de tarea están en inglés (las de LIBERO); no se documenta soporte multilingüe.
- Requiere observaciones de cámara de tercera persona y muñeca a 256x256 y 20 FPS; desviaciones en el formato o la frecuencia pueden degradar el rendimiento.
- La evaluación publicada depende de MuJoCo 2.3.7; con MuJoCo 3.x los resultados no son comparables en tareas de contacto rico.
- Diferencias numéricas pequeñas entre la evaluación oficial y `lerobot-eval` por el dispositivo del preprocesador y cuDNN benchmarking.
- No se documentan sesgos específicos ni tasas de alucinación; al ser una política de control, el riesgo principal es la ejecución de acciones incorrectas en el entorno, no la generación de texto.
- Licencia OpenMDW 1.1: es necesario revisar sus términos antes de uso comercial; el modelo se distribuye con `license: other` y `license_name: openmdw1.1-license`.
- Los pesos publicados son EMA del paso 4000; no se garantiza que sea el óptimo para dominios distintos de LIBERO.
- No se dispone de información sobre cuantización, por lo que el despliegue en hardware de consumo no está soportado de forma documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lerobot/Cosmos3-Edge-Policy-LIBERO
- Modelo base en formato LeRobot: https://huggingface.co/lerobot/Cosmos3-Edge
- Checkpoint original de NVIDIA: https://huggingface.co/nvidia/Cosmos3-Edge/tree/344d602b128d1bbdacb43b08d0a3626f46343e29
- Modelo comparable Nano: https://huggingface.co/lerobot/Cosmos3-Nano-Policy-LIBERO
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/LIBERO-Cosmos3
- Commit de LeRobot para evaluación: https://github.com/huggingface/lerobot/commit/d0a20dc38e058a8aa3f7bc48cf32d48bb2f99e5b
- Pull request de LeRobot: https://github.com/huggingface/lerobot/pull/5134
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
