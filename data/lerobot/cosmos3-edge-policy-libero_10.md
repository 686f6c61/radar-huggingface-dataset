# lerobot/Cosmos3-Edge-Policy-LIBERO_10

## Resumen

Cosmos3-Edge-Policy-LIBERO_10 es una política robótica (vision-language-action, VLA) obtenida por ajuste fino supervisado del checkpoint base lerobot/Cosmos3-Edge, que a su vez es la conversión al formato LeRobot del modelo nvidia/Cosmos3-Edge. La desarrolla el equipo de LeRobot (Hugging Face) y resuelve el problema de control visomotor de un brazo robótico a partir de instrucciones en lenguaje natural y dos vistas de cámara: predice bloques de 16 acciones y, de forma conjunta, el vídeo futuro de la escena. Está publicada como política nativa de LeRobot con el tipo `cosmos3_edge`.

El modelo se apoya en un backbone Nemotron 3 Dense VL MoT (Mixture of Transformers) de 28 capas de decodificador y anchura oculta 2048, con 4.563.688.396 parámetros totales en pesos bfloat16 (más 4 tensores FP32 para el embedding de timesteps). No es un modelo de lenguaje general: es una política especializada en el benchmark LIBERO-10, con entradas de imagen RGB de 256x256 a 20 FPS (cámara en tercera persona y cámara de muñeca) y salidas de 10 dimensiones (3 de posición delta, 6 de rotación en formato rot6d y 1 de pinza), que el entorno convierte a las 7 acciones de LIBERO.

Su relevancia es doble: por un lado demuestra que un modelo de mundo generativo (que predice vídeo futuro) puede convertirse en política de control con rendimiento cercano al estado del arte en LIBERO-10 (95,2 % de éxito en 500 episodios), y por otro ofrece una receta de entrenamiento y evaluación completamente reproducible (32 A100, FSDP2 HSDP, 4000 actualizaciones, semillas y versiones fijadas) sobre un dataset público de 379 episodios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron 3 Dense VL MoT (Mixture of Transformers), 28 capas de decodificador, anchura oculta 2048; política VLA con predicción conjunta de acciones y vídeo futuro |
| Parametros totales | 4.563.688.396 |
| Parametros activos | no disponible (el autor describe el backbone como "Dense", no MoE) |
| Longitud de contexto | no disponible (no se documenta ventana de tokens; la observación es de 2 imágenes 256x256 más instrucción de tarea) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16 con 4 tensores FP32; la evaluación usa bfloat16) |
| Idiomas soportados | no disponible (las instrucciones de tarea son en inglés en LIBERO-10; no se documenta cobertura multilingüe) |
| Licencia | openmdw1.1-license (OpenMDW 1.1) |
| Formato de pesos | safetensors (1188 tensores: 1184 BF16 y 4 FP32) |

Datos adicionales de la política: tipo `cosmos3_edge`, observaciones `observation.images.image` (tercera persona) y `observation.images.image2` (muñeca) a 256x256 RGB y 20 FPS, sin estado proprioceptivo; acciones de 10 dimensiones `[delta position (3), rot6d (6), gripper]`; chunk de 16 acciones ejecutado completo; checkpoint EMA en la actualización de optimizador 2000.

## Arquitectura y entrenamiento

El backbone es un transformer denso multimodal (Nemotron 3 Dense VL MoT) con 28 capas de decodificador y anchura 2048, adaptado como política de imitación. La política recibe la instrucción de tarea y las dos vistas de cámara y genera, de manera conjunta, un chunk de 16 acciones y el vídeo futuro de la escena; la generación usa muestreo UniPC con 30 pasos, escala de guiado 1 (sin classifier-free guidance) y shift de muestreo 5. El ajuste fino parte de lerobot/Cosmos3-Edge con los módulos de acción reinicializados (`--policy.load_action_modules=false`), es decir, se reentrena la cabeza de acciones sobre el backbone preentrenado.

El entrenamiento se hizo sobre lerobot/LIBERO_10-Cosmos3 (379 episodios, 10 tareas, sin split de validación) con batch global de 2048 muestras por actualización (64 por GPU x 32 GPUs x 1 de acumulación), en 32 NVIDIA A100-SXM4-80GB repartidas en 4 nodos de 8 con InfiniBand, usando FSDP2 HSDP (sharding intra-nodo, réplica inter-nodo). Optimizador AdamW con learning rate 5e-5 (2.5e-4 para los módulos de acción), betas (0.9, 0.99), weight decay 0.05, clipping de gradiente 1.0, warmup lineal de 500 actualizaciones y decaimiento lineal hasta 0 en la actualización 16000; precisión float32 para pesos maestros, estado del optimizador y EMA, bfloat16 para cómputo y reducción de gradientes, TF32 desactivado, gradient checkpointing activado y atención SDPA. La ejecución completa fue de 4000 actualizaciones con checkpoint cada 200; este repositorio contiene el checkpoint de la actualización 2000, seleccionado por tasa de éxito en LIBERO entre los checkpoints guardados.

## Capacidades

- Control visomotor de brazo robótico a partir de instrucciones en lenguaje natural y dos cámaras (tercera persona y muñeca).
- Predicción de chunks de 16 acciones de 10 dimensiones (posición delta, rotación rot6d y pinza) ejecutadas en bloque.
- Predicción conjunta de vídeo futuro de la escena como parte de la generación (modelo de mundo generativo).
- Ejecución de tareas de manipulación de horizonte largo en LIBERO-10 (10 tareas de una suite, con éxito del 95,2 %).
- Integración nativa con el ecosistema LeRobot: tipo de política `cosmos3_edge`, compatible con `lerobot-eval` y con los procesadores de entorno de LIBERO.
- Muestreo configurable (UniPC, 30 pasos, guidance scale 1, shift 5) y precisión bfloat16 en inferencia.
- No se documentan capacidades de tool calling, agentes multi-paso, diálogo general, matemáticas, código, audio ni visión más allá de las dos cámaras de entrada.

## Casos de uso

- Evaluación reproducible de políticas VLA en LIBERO-10: sirve como referencia con semillas, versiones de MuJoCo/robosuite y comandos fijados, útil para comparar nuevas políticas bajo un protocolo idéntico.
- Investigación en modelos de mundo para robótica: al predecir vídeo futuro junto con las acciones, permite estudiar la relación entre calidad de predicción visual y éxito de control en tareas de contacto.
- Ajuste fino sobre datos propios de manipulación: el checkpoint base lerobot/Cosmos3-Edge y la receta (reinicializar módulos de acción, AdamW con LR diferenciado) sirven de punto de partida para dominios con pocos episodios, como los 379 de LIBERO-10.
- Prototipado de políticas de imitación en simulación: con MuJoCo 2.3.7 y robosuite 1.4.0 se puede ejecutar el bucle cerrado completo en una sola GPU A800/A100 de 80 GB para validar pipelines de datos y preprocesado.
- Benchmarking de infraestructura de entrenamiento distribuido: la configuración FSDP2 HSDP con 32 A100 y batch 2048 es una referencia concreta para medir throughput y escalado en 4 nodos.
- Docencia y divulgación técnica: el par dataset (LIBERO_10-Cosmos3) más política publicada permite reproducir de extremo a extremo un caso de VLA sin depender de datos privados.
- Comparación de arquitecturas de política (chunking de 16 acciones frente a control paso a paso) bajo el mismo entorno y presupuesto de 510 pasos en LIBERO-10.

## Benchmarks y rendimiento

Resultados de éxito en bucle cerrado sobre LIBERO-10 (50 episodios por tarea, 10 tareas, 500 episodios por suite, MuJoCo 2.3.7, semilla 0):

| Modelo | LIBERO-10 |
|---|---|
| Cosmos3-Nano-Policy-LIBERO_10 | 97,6 % (488/500) |
| Cosmos3-Edge-Policy-LIBERO_10 | 95,2 % (476/500) |
| Cosmos3-Nano-Policy-LIBERO_10 (TechReport, arXiv 2606.02800) | 97,40 % |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje, lo cual es coherente con que se trate de una política robótica y no de un modelo de propósito general.

## Requisitos de hardware

- Inferencia evaluada en 1 NVIDIA A800-SXM4-80GB por suite, con bfloat16, atención SDPA, sin `torch.compile`, TF32 desactivado y cuDNN benchmarking desactivado.
- El repositorio pesa 9,2 GB (1188 tensores, 1184 en BF16 y 4 en FP32), por lo que los pesos en bfloat16 ocupan aproximadamente 9,1 GB; no se documentan cuantizaciones alternativas ni requisitos de VRAM para otras precisiones.
- No se confirma que quepa en GPU de consumo; con ~4,56 mil millones de parámetros, una estimación en BF16 rondaría los 9-10 GB de pesos más activaciones y el búfer de vídeo, pero el autor no publica cifras de VRAM ni pruebas en RTX 4090 u otras GPU consumer.
- Despliegue mediante el stack de LeRobot: `lerobot-eval` con `--policy.path=lerobot/Cosmos3-Edge-Policy-LIBERO_10`, `--policy.dtype=bfloat16`, y dependencias fijadas (MuJoCo 2.3.7, robosuite 1.4.0, hf-libero 0.1.4, Gymnasium 1.3.0, PyTorch 2.11.0+cu128, Transformers 5.5.4, Diffusers 0.39.0).
- Entrenamiento de referencia: 32 A100-SXM4-80GB en 4 nodos con InfiniBand, FSDP2 HSDP y gradient checkpointing.
- No se publican cifras de latencia ni throughput de inferencia; el muestreo usa 30 pasos UniPC por chunk de 16 acciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | LIBERO-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-Edge-Policy-LIBERO_10 | 4.563.688.396 | no disponible | 95,2 % (476/500) | OpenMDW 1.1 | Hugging Face (lerobot) |
| Cosmos3-Nano-Policy-LIBERO_10 | no disponible | no disponible | 97,6 % (488/500) | no disponible | Hugging Face (lerobot) |
| Cosmos3-Edge (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face (lerobot / nvidia) |

La comparación se limita a la familia Cosmos3 porque la información disponible no incluye otros modelos VLA de referencia (por ejemplo, políticas tipo diffusion policy o VLA de otros autores) con los que contrastar parámetros, contexto y licencia.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está ajustado exclusivamente a las 10 tareas de LIBERO-10; no se ha validado en otros entornos, robots ni tareas fuera de esa suite.
- Dependencia fuerte del simulador: los resultados solo son comparables con MuJoCo 2.3.7; con MuJoCo 3.x cambia el resultado de tareas con mucho contacto y las cifras dejan de ser equiparables.
- Diferencias numéricas entre el protocolo del autor y `lerobot-eval`: el preprocesado del vídeo se ejecutó en CPU y con cuDNN benchmarking desactivado, mientras que `lerobot-eval` lo ejecuta en el dispositivo de la política y activa cuDNN benchmarking, lo que altera ligeramente entradas y muestreo.
- Presupuesto de evaluación distinto del predeterminado: 510 pasos en LIBERO-10 tras los 10 pasos de asentamiento, más corto que los valores por defecto de LeRobot; comparaciones con presupuestos distintos no son directas.
- Entrenamiento con 379 episodios y sin split de validación: el checkpoint se eligió por tasa de éxito en el propio benchmark, por lo que existe riesgo de sobreajuste al conjunto de evaluación.
- Sin datos sobre sesgos, alucinación en lenguaje, cobertura idiomática ni robustez ante instrucciones fuera de distribución; la instrucción de tarea solo se ha probado en el formato de LIBERO-10.
- Licencia OpenMDW 1.1: es una licencia de pesos abiertos con condiciones propias; conviene revisar sus términos antes de uso comercial, y el modelo base remite a la licencia de nvidia/Cosmos3-Edge.
- Coste de inferencia no trivial: 30 pasos de muestreo UniPC por cada chunk de 16 acciones y generación de vídeo futuro, sin cifras publicadas de latencia; en producción hay que medir el coste real por paso de control.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lerobot/Cosmos3-Edge-Policy-LIBERO_10
- Modelo base en formato LeRobot: https://huggingface.co/lerobot/Cosmos3-Edge
- Modelo base original de NVIDIA: https://huggingface.co/nvidia/Cosmos3-Edge/tree/344d602b128d1bbdacb43b08d0a3626f46343e29
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/LIBERO_10-Cosmos3
- Política comparable Cosmos3-Nano-Policy-LIBERO_10: https://huggingface.co/lerobot/Cosmos3-Nano-Policy-LIBERO_10
- Informe técnico (arXiv 2606.02800): https://arxiv.org/abs/2606.02800
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Commit de evaluación de LeRobot: https://github.com/huggingface/lerobot/commit/d0a20dc38e058a8aa3f7bc48cf32d48bb2f99e5b
- Pull request de LeRobot #5134: https://github.com/huggingface/lerobot/pull/5134
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
