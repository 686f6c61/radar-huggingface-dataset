# lerobot/Cosmos3-Edge-Policy-LIBERO_10

## Resumen

Cosmos3-Edge-Policy-LIBERO_10 es una política robótica de tipo vision-language-action (VLA) publicada por el equipo de LeRobot (Hugging Face) como fine-tuning del checkpoint base Cosmos3-Edge de NVIDIA sobre el conjunto de tareas LIBERO-10. El modelo recibe la instrucción de la tarea junto con dos vistas de cámara (tercera persona y muñeca) a 256x256 y 20 FPS, y predice un bloque de 16 acciones junto con el vídeo futuro de la escena, siguiendo el paradigma de world model acoplado a la política de acción.

La relevancia del modelo es doble: por un lado, demuestra que un backbone denso de 4.560 millones de parámetros (Nemotron 3 Dense VL MoT, 28 capas de decoder, anchura oculta 2048) puede ejecutar control continuo de manipulador con alta tasa de éxito, y por otro, lo hace con un presupuesto de inferencia contenido (bfloat16, SDPA, muestreo UniPC de 30 pasos) que cabe en una única GPU de 80 GB durante la evaluación. El checkpoint publicado corresponde a las medias EMA en la actualización de optimizador 2000, seleccionado por tasa de éxito en LIBERO.

Este repositorio concreto es un artefacto de evaluación reproducible: incluye el comando `lerobot-eval`, las versiones exactas de MuJoCo, robosuite y hf-libero, y las condiciones de muestreo (guidance scale 1, sampling shift 5, ejecución completa de cada bloque de 16 acciones). Es, por tanto, una referencia útil para quien quiera comparar políticas VLA sobre LIBERO-10 sin ambigüedades de setup.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Nemotron 3 Dense VL MoT (transformer denso con mezcla de tokens), 28 capas de decoder, anchura oculta 2048 |
| Parámetros totales | 4.563.688.396 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16 y FP32) |
| Idiomas soportados | no disponible (las instrucciones de tarea de LIBERO están en inglés) |
| Licencia | openmdw1.1-license (Open Model Development Workgroup 1.1) |
| Formato de pesos | safetensors (1188 tensores: 1184 BF16 y 4 FP32 para el timestep embedding) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `lerobot/Cosmos3-Edge`, que es la conversión al formato LeRobot de `nvidia/Cosmos3-Edge`. El backbone es un transformer denso Nemotron 3 Dense VL MoT con 28 capas de decoder y anchura oculta 2048. La política combina un codificador visual para las dos cámaras (tercera persona y muñeca), un codificador de la instrucción de tarea y un cabezal de difusión que genera simultáneamente el bloque de 16 acciones y el vídeo futuro de la escena. Las acciones se representan en 10 dimensiones (3 de posición delta, 6 de rot6d y 1 de pinza) y los procesadores del entorno las convierten a las 7 dimensiones nativas de LIBERO.

El fine-tuning se realizó sobre `lerobot/LIBERO_10-Cosmos3` (379 episodios, 10 tareas, sin split de validación), con los módulos de acción reinicializados (`--policy.load_action_modules=false`). El entrenamiento usó 32 GPU A100-SXM4-80GB repartidas en 4 nodos de 8 con InfiniBand, batch global de 2048 muestras por actualización (64 por GPU x 32 GPU x 1 de acumulación), FSDP2 HSDP con sharding intra-nodo y réplica inter-nodo, AdamW con learning rate 5e-5 (2.5e-4 para los módulos de acción), betas (0.9, 0.99), weight decay 0.05, gradient clipping 1.0, warmup lineal de 500 actualizaciones y decaimiento lineal hasta la actualización 16000. Se emplearon pesos maestros en float32, cómputo y reducción de gradientes en bfloat16, TF32 desactivado y gradient checkpointing activo. La inferencia usa atención SDPA y muestreo UniPC con 30 pasos, guidance scale 1 (sin classifier-free guidance) y sampling shift 5.

## Capacidades

- Control robótico de manipulador a partir de instrucciones en lenguaje natural, con observaciones visuales de tercera persona y muñeca.
- Predicción conjunta de acciones y vídeo futuro de la escena (world model acoplado), lo que permite supervisión visual y depuración cualitativa de la política.
- Generación de bloques de 16 acciones ejecutadas de forma abierta (open-loop chunk) antes de la siguiente inferencia.
- Representación de acción continua de 10 dimensiones (posición delta, rot6d, pinza) convertible a espacios de acción de 7 dimensiones.
- Ejecución de tareas de manipulación de largo horizonte en el benchmark LIBERO-10 (10 tareas, hasta 510 pasos por episodio).
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni capacidades de audio.

## Casos de uso

- Evaluación reproducible de políticas VLA: sirve como referencia fija sobre LIBERO-10 con un setup documentado (MuJoCo 2.3.7, robosuite 1.4.0, hf-libero 0.1.4) para comparar nuevos métodos sin ambigüedades de configuración.
- Investigación en world models para robótica: la predicción de vídeo futuro permite estudiar la coherencia entre la acción propuesta y la evolución visual esperada de la escena.
- Benchmarking de infraestructura de inferencia: al requerir una GPU de 80 GB en bfloat16 y ejecutar bloques de 16 acciones con 30 pasos de UniPC, es un caso de prueba realista para medir latencia y throughput de pipelines de difusión en robótica.
- Fine-tuning sobre nuevos conjuntos de demostraciones: el repositorio documenta el comando de entrenamiento con reinicialización de módulos de acción, lo que facilita adaptar la política a otras tareas manteniendo el backbone preentrenado.
- Estudio de representaciones de acción: la conversión de 10D (posición delta + rot6d + pinza) a 7D de LIBERO mediante procesadores de entorno es un ejemplo práctico de integración entre espacios de acción heterogéneos.
- Docencia y divulgación: la model card incluye versiones exactas de software, hardware y semillas, lo que lo convierte en un material didáctico sólido sobre evaluación rigurosa en robótica de manipulación.

## Benchmarks y rendimiento

| Modelo | LIBERO-10 (éxito) |
|---|---|
| Cosmos3-Nano-Policy-LIBERO_10 | 97,6 % (488/500) |
| Cosmos3-Edge-Policy-LIBERO_10 | 95,2 % (476/500) |
| Cosmos3-Nano-Policy-LIBERO_10 (TechReport, arXiv 2606.02800) | 97,40 % |

Las tasas corresponden a evaluación en bucle cerrado con 50 episodios por tarea en las 10 tareas de LIBERO-10 (500 episodios por suite), semilla 0, 4 entornos por batch, presupuesto de 510 pasos tras los 10 pasos de asentamiento del entorno, inferencia en bfloat16 con SDPA, sin `torch.compile`, TF32 desactivado y cuDNN benchmarking desactivado. El checkpoint evaluado es el de la actualización 2000. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 9,1 GB (4.563.688.396 parámetros x 2 bytes), pero la evaluación oficial se ejecutó en una NVIDIA A800-SXM4-80GB por suite, lo que sugiere que el pipeline completo (codificadores visuales, difusión UniPC de 30 pasos, renderizado MuJoCo EGL y procesadores de entorno) requiere bastante más memoria que los pesos.
- GPU recomendadas: A800-SXM4-80GB (configuración validada), A100-SXM4-80GB, H100-80GB. No se documenta funcionamiento en GPU de consumo.
- Cabe en GPU de consumo: no disponible; no se ha validado ni documentado en tarjetas tipo RTX 4090.
- Opciones de despliegue: `lerobot-eval` con `--policy.path=lerobot/Cosmos3-Edge-Policy-LIBERO_10`, `--policy.dtype=bfloat16`, `--tf32=false`; requiere MuJoCo 2.3.7 (instalado explícitamente sobre el lock de LeRobot, que trae 3.8.1), robosuite 1.4.0, hf-libero 0.1.4, Gymnasium 1.3.0, PyTorch 2.11.0+cu128, Transformers 5.5.4, Diffusers 0.39.0 y Accelerate 1.15.0. No se documentan opciones vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponible. La model card no publica tiempos por paso ni frecuencia de control efectiva más allá de la tasa de captura de las cámaras (20 Hz) y el muestreo UniPC de 30 pasos por bloque de 16 acciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | LIBERO-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-Edge-Policy-LIBERO_10 | 4.563.688.396 | no disponible | 95,2 % (476/500) | openmdw1.1-license | Hugging Face (lerobot) |
| Cosmos3-Nano-Policy-LIBERO_10 | no disponible | no disponible | 97,6 % (488/500) | no disponible | Hugging Face (lerobot) |
| Cosmos3-Nano-Policy-LIBERO_10 (TechReport) | no disponible | no disponible | 97,40 % | no disponible | arXiv 2606.02800 |

La comparativa se limita a las variantes Cosmos3 documentadas en la model card; no se dispone de datos de otros modelos VLA comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en LIBERO-10; no se ha validado en otros entornos, robots ni conjuntos de tareas.
- Las instrucciones de tarea están en inglés (las de LIBERO); no se documenta soporte multilingüe.
- Requiere observaciones visuales concretas: dos cámaras (tercera persona y muñeca) a 256x256 RGB y 20 FPS, sin estado proprioceptivo. Cambiar la configuración de sensores invalida la política.
- La evaluación es sensible a la versión de MuJoCo: MuJoCo 3.x altera el resultado de tareas de LIBERO con contactos ricos, por lo que los resultados medidos con esa versión no son comparables. Hay que fijar MuJoCo 2.3.7.
- El preprocesado de vídeo se ejecutó en CPU y con cuDNN benchmarking desactivado durante la evaluación oficial; `lerobot-eval` lo ejecuta en el dispositivo de la política y activa cuDNN benchmarking, lo que introduce pequeñas diferencias numéricas en las entradas y el muestreo.
- Los presupuestos de pasos son los de la evaluación nativa de Cosmos3; los valores por defecto de LeRobot son más largos y pueden alterar la comparación.
- Riesgo de alucinación visual: al predecir vídeo futuro, la política puede generar escenas plausibles pero inconsistentes con la dinámica real, especialmente fuera de la distribución de LIBERO.
- Licencia openmdw1.1-license: conviene revisar los términos de OpenMDW 1.1 antes de un uso comercial; la model card la etiqueta como `license: other`.
- No se documentan sesgos demográficos, lingüísticos ni de otro tipo; la ausencia de datos al respecto no implica ausencia de sesgo.
- El checkpoint es una media EMA de la actualización 2000, no el modelo final del run (4000 actualizaciones); su selección se basó en la tasa de éxito en LIBERO, no en otros criterios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lerobot/Cosmos3-Edge-Policy-LIBERO_10
- Checkpoint base en formato LeRobot: https://huggingface.co/lerobot/Cosmos3-Edge
- Checkpoint original de NVIDIA: https://huggingface.co/nvidia/Cosmos3-Edge/tree/344d602b128d1bbdacb43b08d0a3626f46343e29
- Variante Nano: https://huggingface.co/lerobot/Cosmos3-Nano-Policy-LIBERO_10
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/LIBERO_10-Cosmos3
- Tech report: https://arxiv.org/abs/2606.02800
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Commit de LeRobot usado en la evaluación: https://github.com/huggingface/lerobot/commit/d0a20dc38e058a8aa3f7bc48cf32d48bb2f99e5b
- Pull request de LeRobot asociado: https://github.com/huggingface/lerobot/pull/5134
