# lerobot/Cosmos3-Nano-Policy-LIBERO

## Resumen

Cosmos3-Nano-Policy-LIBERO es una política robótica (vision-language-action, VLA) desarrollada por el equipo de LeRobot en Hugging Face, obtenida mediante fine-tuning del checkpoint base Cosmos3-Nano de NVIDIA sobre los cuatro conjuntos de tareas del benchmark LIBERO (Spatial, Object, Goal y LIBERO-10). El modelo recibe una instrucción de tarea en lenguaje natural junto con dos vistas de cámara (tercera persona y muñeca) a 256x256 y 20 FPS, y produce un chunk de 16 acciones de 10 dimensiones, además de predecir el vídeo futuro de la escena como tarea auxiliar de entrenamiento.

La arquitectura se apoya en un backbone Qwen3-VL MoT con 36 capas de decoder y anchura oculta de 4096, con un total de 16.454.213.580 parámetros en formato BF16 (1356 tensores, de los cuales 4 son FP32 correspondientes al embedding de timesteps). El modelo combina generación de acciones con difusión (sampling UniPC de 30 pasos) y predicción de vídeo, lo que lo sitúa en la estirpe de los modelos de world model aplicados a control robótico.

Es relevante ahora porque demuestra que un modelo de 16B parámetros puede alcanzar tasas de éxito cercanas al 98% en LIBERO, un benchmark estándar de manipulación con instrucciones, y porque LeRobot lo publica con todo el pipeline de evaluación reproducible (comando `lerobot-eval`, versiones fijadas de MuJoCo, robosuite y hf-libero) y con pesos EMA listos para desplegar. La licencia OpenMDW 1.1 permite uso comercial con condiciones específicas que conviene revisar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL MoT (Mixture of Transformers), 36 capas de decoder, hidden width 4096; política VLA con difusión de acciones y predicción de vídeo |
| Parametros totales | 16.454.213.580 (16,45 B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16, con 4 tensores FP32) |
| Idiomas soportados | no disponible (las instrucciones de LIBERO están en inglés) |
| Licencia | OpenMDW 1.1 (openmdw1.1-license) |
| Formato de pesos | safetensors (1356 tensores: 1352 BF16 y 4 FP32) |
| Tipo de política | `cosmos3_nano` (LeRobot) |
| Observaciones | `observation.images.image` (tercera persona) y `observation.images.image2` (muñeca), 256x256 RGB a 20 FPS, sin estado |
| Acciones | 10D `[delta position (3), rot6d (6), gripper]`, convertidas a las 7D de LIBERO por los procesadores del entorno |
| Checkpoint | Pesos EMA en el update de optimizador 4000 (LeRobot step 16000) |
| Tamaño del repo | 33,0 GB |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/Cosmos3-Nano`, la versión en formato LeRobot del checkpoint `nvidia/Cosmos3-Nano`. El backbone es un Qwen3-VL MoT con 36 capas de decoder y anchura oculta de 4096, sobre el que se añaden módulos de acción que se reinicializan durante el fine-tuning (`--policy.load_action_modules=false`). La política genera un chunk de 16 acciones mediante muestreo por difusión (UniPC con 30 pasos, guidance scale 1 sin classifier-free guidance, sampling shift 5) y, de forma conjunta, predice el vídeo futuro de la escena, una formulación propia de los world models aplicados a robótica.

El entrenamiento se realizó sobre `lerobot/LIBERO-Cosmos3`: 1693 episodios y 40 tareas, usando todos los episodios sin split de validación. Se emplearon 16 GPUs NVIDIA A100-SXM4-80GB en dos nodos con InfiniBand, batch global de 2048 muestras por update (32 por GPU x 16 GPUs x 4 de acumulación), paralelismo FSDP2 HSDP (sharding de parámetros entre las 8 GPUs de cada nodo y replicación entre nodos) y optimizador AdamW con learning rate 5e-5 (2,5e-4 para los módulos de acción), betas (0,9, 0,99) y weight decay. La ejecución completa constó de 7000 updates de optimizador con checkpoint cada 500; el publicado corresponde al update 4000, seleccionado por su tasa de éxito en LIBERO entre los checkpoints guardados.

## Capacidades

- Control robótico de manipulación a partir de instrucciones en lenguaje natural, con observaciones visuales de dos cámaras (tercera persona y muñeca).
- Predicción de chunks de 16 acciones de 10 dimensiones (posición delta, rot6d y gripper) en un solo forward pass.
- Predicción de vídeo futuro de la escena como capacidad auxiliar del world model.
- Ejecución de tareas de los cuatro suites de LIBERO: Spatial (razonamiento espacial), Object (manipulación de objetos), Goal (alcanzar un estado objetivo) y LIBERO-10 (tareas de horizonte largo).
- Control de efector final relativo con reseteo duro y estados iniciales fijos, tal como se evalúa en LIBERO.
- Inferencia en bfloat16 con atención SDPA.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo general ni entrada de audio.

## Casos de uso

- Evaluación reproducible de políticas VLA: el repositorio incluye el comando exacto `lerobot-eval` con versiones fijadas de MuJoCo 2.3.7, robosuite 1.4.0 y hf-libero 0.1.4, lo que permite replicar las tasas de éxito publicadas y comparar nuevos métodos contra una línea base sólida.
- Investigación en world models para robótica: la predicción conjunta de acciones y vídeo futuro permite estudiar cómo la modelización del entorno mejora el control, y sirve como punto de partida para experimentos de planificación con rollouts visuales.
- Benchmarking de manipulación con lenguaje: al cubrir las 40 tareas de los cuatro suites LIBERO, el modelo sirve para medir generalización entre categorías de tarea (espacial, objeto, goal, horizonte largo) con un único checkpoint.
- Base para fine-tuning en dominios propios: al ser un fine-tune de `Cosmos3-Nano` con módulos de acción reinicializados, el pipeline de entrenamiento (FSDP2 HSDP, AdamW, batch 2048) es directamente reutilizable para adaptar la política a nuevos datasets en formato LeRobot.
- Estudio de robustez numérica en evaluación: la model card documenta diferencias pequeñas entre ejecutar el preprocesador en CPU o en la GPU de la política y entre habilitar o no cuDNN benchmarking, lo que lo convierte en un caso útil para analizar sensibilidad de políticas de difusión a cambios numéricos.
- Comparación de variantes de tamaño: junto con `Cosmos3-Edge-Policy-LIBERO` (97,95% de media frente al 97,90% de este modelo), permite analizar el compromiso entre tamaño del modelo y rendimiento en las mismas tareas.
- Referencia para integración en LeRobot: el checkpoint está en formato LeRobot con la política `cosmos3_nano`, por lo que se integra directamente en los flujos de entrenamiento y evaluación de la librería.

## Benchmarks y rendimiento

Tasas de éxito en bucle cerrado sobre LIBERO (50 episodios por tarea, 10 tareas por suite, 500 episodios por suite):

| Modelo | Libero-Spatial | Libero-Object | Libero-Goal | Libero-10 | Media |
|---|:---:|:---:|:---:|:---:|:---:|
| Cosmos3-Nano-Policy-LIBERO | 98,0% (490/500) | 99,4% (497/500) | 97,4% (487/500) | 96,8% (484/500) | 97,90% |
| Cosmos3-Edge-Policy-LIBERO | 98,6% (493/500) | 99,4% (497/500) | 97,2% (486/500) | 96,6% (483/500) | 97,95% |

Condiciones de medida: MuJoCo 2.3.7, robosuite 1.4.0, hf-libero 0.1.4, Gymnasium 1.3.0, renderizado EGL en GPU NVIDIA, control relativo del efector final, reseteo duro, estados iniciales fijos, semilla 0, inferencia bfloat16 con SDPA, sin `torch.compile`, TF32 deshabilitado, muestreo UniPC de 30 pasos, guidance scale 1, shift 5, chunk de 16 acciones ejecutado completo. Presupuestos de pasos: 210 (Spatial), 270 (Object), 290 (Goal) y 510 (LIBERO-10), contados tras los 10 pasos de asentamiento. Hardware de evaluación: 1 GPU NVIDIA A800-SXM4-80GB por suite.

Advertencia del autor: MuJoCo 3.x altera el resultado de las tareas LIBERO con mucho contacto, por lo que las medidas con esa versión no son comparables. `lerobot-eval` ejecuta el preprocesador en el dispositivo de la política y habilita cuDNN benchmarking, lo que cambia las entradas y el muestreo en pequeñas cantidades numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 16,45 B parámetros en BF16, los pesos ocupan aproximadamente 33 GB; hay que sumar el estado del sampler de difusión (UniPC, 30 pasos), buffers de vídeo y las dos cámaras de 256x256. Una GPU de 40 GB es el mínimo razonable; 80 GB da margen holgado.
- GPU recomendadas: NVIDIA A100-SXM4-80GB (usada en entrenamiento), A800-SXM4-80GB (usada en evaluación), H100-80GB. En GPUs consumer de 24 GB (RTX 4090) no cabe en BF16 sin cuantización, y no se documentan recetas de cuantización para esta política.
- Despliegue: la vía soportada es LeRobot (`lerobot-eval` con `--policy.path=lerobot/Cosmos3-Nano-Policy-LIBERO`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no encajan con una política VLA con difusión y predicción de vídeo.
- Software: PyTorch 2.11.0+cu128, Transformers 5.5.4, Diffusers 0.39.0, Accelerate 1.15.0, PEFT 0.21.0, safetensors 0.8.0, tokenizers 0.22.2, NumPy 2.2.6, PyAV 15.1.0, torchcodec 0.11.1, OpenCV 4.14.0.94, SciPy 1.18.1, Python 3.12.15, CUDA 12.8, cuDNN 9.19.0.
- Para evaluación hay que instalar explícitamente `mujoco==2.3.7` (`uv pip install mujoco==2.3.7`), porque el lock file de LeRobot instala MuJoCo 3.8.1 y los resultados no serían comparables.
- Latencia y throughput: no disponibles. La model card no publica tiempos por paso ni frecuencia de control efectiva más allá de la captura a 20 FPS.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | LIBERO (media) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-Nano-Policy-LIBERO | 16,45 B | no disponible | 97,90% | OpenMDW 1.1 | Hugging Face (lerobot) |
| Cosmos3-Edge-Policy-LIBERO | no disponible | no disponible | 97,95% | no disponible en la información | Hugging Face (lerobot) |
| Cosmos3-Nano (base) | no disponible | no disponible | no aplica (no es política) | no disponible en la información | Hugging Face (lerobot / nvidia) |

La única comparación cuantitativa publicada es con `Cosmos3-Edge-Policy-LIBERO`, que supera ligeramente a este modelo en media (97,95% frente a 97,90%) y en Spatial (98,6% frente a 98,0%), empata en Object (99,4%) y queda por debajo en Goal (97,2% frente a 97,4%) y LIBERO-10 (96,6% frente a 96,8%). No se dispone de datos de otros modelos VLA comparables en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: no documentados por el autor; al entrenarse exclusivamente con LIBERO (40 tareas de manipulación en simulación), el modelo no ha visto distribución real ni tareas fuera de ese conjunto.
- Alucinación: la predicción de vídeo futuro puede divergir de la realidad física; en control, el riesgo se traduce en acciones mal condicionadas cuando la escena se aleja de la distribución de entrenamiento.
- Generalización limitada: sin split de validación y con estados iniciales fijos en la evaluación, las tasas de éxito del 97,90% no implican robustez ante variaciones de iluminación, objetos nuevos o posiciones iniciales distintas.
- Dependencia de versiones: MuJoCo 3.x cambia el resultado de las tareas con mucho contacto; usar MuJoCo 3.8.1 (el que instala LeRobot por defecto) invalida la comparación con los números publicados.
- Diferencias numéricas: ejecutar el preprocesador en GPU en lugar de CPU y habilitar cuDNN benchmarking altera ligeramente entradas y muestreo; los resultados de `lerobot-eval` pueden no coincidir bit a bit con los de la model card.
- Presupuestos de pasos específicos: los resultados usan 210/270/290/510 pasos, más cortos que los valores por defecto de LeRobot; con presupuestos distintos las tasas cambian.
- Licencia: OpenMDW 1.1 no es una licencia permisiva estándar; hay que revisar sus términos (incluidas posibles restricciones de uso comercial y de redistribución) antes de desplegar en producción.
- Idiomas: solo se ha validado con instrucciones en inglés del benchmark LIBERO; no hay evidencia de soporte multilingüe.
- Hardware: 33 GB de pesos en BF16 excluyen GPUs consumer de 24 GB sin cuantización, y no se ofrecen recetas de cuantización para esta política.
- Uso previsto: es un artefacto de investigación y evaluación en simulación; no se documentan garantías de seguridad para operación en robots reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lerobot/Cosmos3-Nano-Policy-LIBERO
- Modelo base en formato LeRobot: https://huggingface.co/lerobot/Cosmos3-Nano
- Modelo base original de NVIDIA: https://huggingface.co/nvidia/Cosmos3-Nano/tree/e59a53c25979a090fa8706c9acc0c254a6e89b92
- Variante Edge: https://huggingface.co/lerobot/Cosmos3-Edge-Policy-LIBERO
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/LIBERO-Cosmos3
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Commit de LeRobot usado en la evaluación: https://github.com/huggingface/lerobot/commit/d0a20dc38e058a8aa3f7bc48cf32d48bb2f99e5b
- Pull request de LeRobot con la integración: https://github.com/huggingface/lerobot/pull/5134
