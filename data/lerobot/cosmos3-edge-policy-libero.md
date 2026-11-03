# lerobot/Cosmos3-Edge-Policy-LIBERO

## Resumen

Cosmos3-Edge-Policy-LIBERO es una política robótica de tipo vision-language-action (VLA) desarrollada por el equipo de LeRobot (Hugging Face) mediante el ajuste fino del checkpoint base Cosmos3-Edge sobre los cuatro conjuntos de tareas del benchmark LIBERO (Spatial, Object, Goal y LIBERO-10). El modelo recibe una instrucción de tarea en lenguaje natural junto con dos imágenes de cámara (tercera persona y muñeca) y predice un bloque de 16 acciones de control del efector final, además del vídeo futuro de la escena. Está pensado para control de manipulación robótica de corto horizonte en entornos simulados.

El modelo se apoya en un backbone Nemotron 3 Dense VL MoT de 28 capas decodificadoras y anchura oculta 2048, con un total de 4.563.688.396 parámetros (aproximadamente 4,56 mil millones). Se distribuye en formato LeRobot con pesos en BF16 (1184 tensores) y FP32 (4 tensores correspondientes al embedding de timestep), sumando un repositorio de 9,2 GB. La licencia es OpenMDW 1.1, una licencia abierta específica para modelos fundacionales.

Su relevancia radica en que combina predicción de acciones con predicción de vídeo futuro en un único modelo, lo que permite un control más informado del entorno, y alcanza un éxito medio del 97,95 % en LIBERO, ligeramente por encima del modelo hermano Cosmos3-Nano-Policy-LIBERO (97,90 %). Es un checkpoint de referencia para investigación en políticas VLA y para reproducir resultados del benchmark LIBERO con el stack LeRobot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Nemotron 3 Dense VL MoT (backbone transformer, 28 capas decodificadoras, anchura oculta 2048) |
| Parámetros totales | 4.563.688.396 (≈4,56 mil millones) |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16 y FP32) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (openmdw1.1-license) |
| Formato de pesos | safetensors (1188 tensores: 1184 BF16 y 4 FP32) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint lerobot/Cosmos3-Edge, a su vez la versión en formato LeRobot del modelo nvidia/Cosmos3-Edge. El backbone es un Nemotron 3 Dense VL MoT con 28 capas decodificadoras y anchura oculta 2048, que procesa conjuntamente la instrucción de tarea y las observaciones visuales (cámara de tercera persona y cámara de muñeca, 256x256 RGB a 20 FPS). La política predice un bloque de 16 acciones de 10 dimensiones `[delta position (3), rot6d (6), gripper]`, que los procesadores del entorno convierten a las 7 dimensiones nativas de LIBERO, y además genera el vídeo futuro de la escena. No se utiliza estado proprioceptivo como entrada.

El entrenamiento se realizó sobre el dataset lerobot/LIBERO-Cosmos3 (1693 episodios, 40 tareas, sin partición de validación) con los módulos de acción reinicializados (`--policy.load_action_modules=false`). Se usó un batch global de 2048 muestras por actualización (64 por GPU × 32 GPUs × 1 de acumulación) sobre 32 NVIDIA A100-SXM4-80GB en 4 nodos con InfiniBand, con paralelismo FSDP2 HSDP (sharding sobre 8 GPUs por nodo, replicación sobre 4 nodos). El optimizador fue AdamW con learning rate 5e-5 (2.5e-4 para los módulos de acción) y betas (0.9, 0.99). La ejecución completa constó de 8000 actualizaciones del optimizador con checkpoints cada 500; este repositorio contiene los pesos EMA de la actualización 4000, seleccionada por su tasa de éxito en LIBERO. En inferencia se emplea muestreo UniPC con 30 pasos, guidance scale 1 (sin classifier-free guidance) y sampling shift 5, ejecutando cada bloque de 16 acciones en su totalidad.

## Capacidades

- Control robótico de manipulación a partir de instrucciones en lenguaje natural y observaciones visuales multimodales (tercera persona y muñeca).
- Predicción de bloques de 16 acciones de efector final con representación de posición delta, rotación en 6D y apertura/cierre de pinza.
- Predicción de vídeo futuro de la escena como tarea auxiliar, lo que aporta información sobre la dinámica del entorno.
- Política cerrada (closed-loop) evaluada en los cuatro suites de LIBERO: Spatial, Object, Goal y LIBERO-10.
- Entrada visual a 256x256 RGB y 20 FPS, sin estado proprioceptivo.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso genérico ni procesamiento de audio en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en políticas VLA: reproducción de los resultados de LIBERO con el stack LeRobot, usando el comando `lerobot-eval` documentado y MuJoCo 2.3.7, para comparar variantes de políticas sobre el mismo benchmark.
- Manipulación robótica simulada de corto horizonte: control de un brazo robótico en tareas de alcance y agarre (Spatial), manipulación de objetos (Object), consecución de objetivos (Goal) y tareas de horizonte largo (LIBERO-10), aprovechando el bloque de 16 acciones por inferencia.
- Predicción de dinámica visual: el modelo genera el vídeo futuro de la escena, útil para investigación en world models y para verificar la coherencia de la política antes de desplegarla.
- Evaluación comparativa de checkpoints: al ser un checkpoint intermedio (actualización 4000) con métricas publicadas, sirve para estudiar la evolución del entrenamiento frente a otros checkpoints del mismo run.
- Base para fine-tuning en dominios robóticos propios: al derivar de Cosmos3-Edge y usar el formato LeRobot, puede adaptarse a nuevos datasets siguiendo el mismo procedimiento (reinicialización de módulos de acción, FSDP2 HSDP, AdamW).
- Benchmarking de infraestructura: las condiciones de evaluación (A800-80GB, bfloat16, SDPA, sin `torch.compile`) permiten medir throughput y latencia de políticas VLA en hardware conocido.

## Benchmarks y rendimiento

Resultados de tasa de éxito en LIBERO (evaluación cerrada, 50 episodios por tarea, 500 episodios por suite):

| Modelo | Libero-Spatial | Libero-Object | Libero-Goal | Libero-10 | Media |
|---|:---:|:---:|:---:|:---:|:---:|
| Cosmos3-Nano-Policy-LIBERO | 98,0 % (490/500) | 99,4 % (497/500) | 97,4 % (487/500) | 96,8 % (484/500) | 97,90 % |
| Cosmos3-Edge-Policy-LIBERO | 98,6 % (493/500) | 99,4 % (497/500) | 97,2 % (486/500) | 96,6 % (483/500) | 97,95 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo de robótica y no de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4,56 mil millones de parámetros en BF16 el peso ronda los 9 GB, por lo que se requiere una GPU con al menos ~10-12 GB libres para pesos y activaciones, aunque la información proporcionada no confirma cifras exactas.
- GPU recomendadas: la evaluación oficial se realizó en 1 NVIDIA A800-SXM4-80GB por suite; el entrenamiento usó 32 A100-SXM4-80GB.
- GPU de consumo: no se confirma compatibilidad con GPUs de consumo; por tamaño de pesos podría caber en RTX 4090 (24 GB) en BF16, pero no hay datos publicados al respecto.
- Opciones de despliegue: el stack oficial es LeRobot (`lerobot-eval`) con PyTorch 2.11.0+cu128, Transformers 5.5.4, Diffusers 0.39.0 y MuJoCo 2.3.7 para el entorno LIBERO. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y throughput: no disponibles. La evaluación usa bfloat16, atención SDPA, sin `torch.compile`, TF32 desactivado y cuDNN benchmarking desactivado; el preprocesador de vídeo se ejecutó en CPU, lo que afecta a los tiempos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | LIBERO (media) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-Edge-Policy-LIBERO | 4,56 mil millones | no disponible | 97,95 % | OpenMDW 1.1 | Hugging Face (lerobot) |
| Cosmos3-Nano-Policy-LIBERO | no disponible | no disponible | 97,90 % | no disponible | Hugging Face (lerobot) |
| Cosmos3-Edge (base) | no disponible | no disponible | no aplica (modelo base) | no disponible | Hugging Face (lerobot / nvidia) |

No se dispone de información sobre otras políticas VLA comparables (por ejemplo, de otras familias) en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo especializado en manipulación robótica simulada; no es un modelo de lenguaje general y no debe usarse para tareas de texto, código o razonamiento fuera de su dominio.
- Evaluado exclusivamente en LIBERO con MuJoCo 2.3.7; los resultados no son comparables con evaluaciones en MuJoCo 3.x, que cambia el resultado de tareas con mucho contacto.
- Requiere el entorno y las versiones exactas documentadas (MuJoCo 2.3.7, robosuite 1.4.0, hf-libero 0.1.4, Gymnasium 1.3.0) para reproducir las métricas; desviaciones numéricas pequeñas en el preprocesador o en cuDNN pueden alterar los resultados.
- No se documentan sesgos conocidos ni tasas de alucinación; al ser un modelo de acción, el riesgo principal es la ejecución de acciones incorrectas en entornos no vistos.
- Idiomas soportados: no disponible; las instrucciones de tarea en LIBERO están en inglés y no se confirma soporte multilingüe.
- Licencia OpenMDW 1.1: es necesario revisar sus términos para uso comercial; la información proporcionada no detalla restricciones específicas.
- Checkpoint intermedio (actualización 4000 de 8000) seleccionado por tasa de éxito; no es necesariamente el óptimo para otros dominios.
- No se dispone de datos sobre cuantización, por lo que el despliegue en hardware limitado no está validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lerobot/Cosmos3-Edge-Policy-LIBERO
- Modelo base en formato LeRobot: https://huggingface.co/lerobot/Cosmos3-Edge
- Modelo base original NVIDIA: https://huggingface.co/nvidia/Cosmos3-Edge/tree/344d602b128d1bbdacb43b08d0a3626f46343e29
- Modelo hermano Nano: https://huggingface.co/lerobot/Cosmos3-Nano-Policy-LIBERO
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/LIBERO-Cosmos3
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Commit de LeRobot usado en la evaluación: https://github.com/huggingface/lerobot/commit/d0a20dc38e058a8aa3f7bc48cf32d48bb2f99e5b
- Pull request de LeRobot: https://github.com/huggingface/lerobot/pull/5134
