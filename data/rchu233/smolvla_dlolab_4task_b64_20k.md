# rchu233/smolvla_dlolab_4task_b64_20k

## Resumen

SmolVLA fine-tuned on DLO-Lab es un modelo de política robótica (vision-language-action, VLA) obtenido mediante fine-tuning de `lerobot/smolvla_base` sobre el conjunto de demostraciones `rchu233/dlolab_4task_demos_v1`. Lo desarrolla el usuario de Hugging Face rchu233 en el marco de un proyecto del curso CMU 16-831. Resuelve una tarea concreta: una única política multi-tarea capaz de manipular objetos lineales deformables (cuerdas) en cuatro tareas distintas de laboratorio (coiling, separation, unknotting y wiring-post) a partir de tres cámaras y del estado del robot.

El modelo parte de la arquitectura SmolVLA de LeRobot, con unos 450 millones de parámetros totales, de los cuales solo se entrena el experto de acción (aproximadamente 100 M); el codificador visual permanece congelado. La política genera trozos de 50 acciones mediante flow matching con 10 pasos de integración, y cada acción es un delta de efector final de 12 dimensiones en el rango [-1, 1].

Su relevancia es doble: por un lado, demuestra que un fine-tuning relativamente corto (20.000 pasos, en torno a 32 épocas, 1,82 h en una H100) sobre un modelo base pequeño puede alcanzar el 100 % de éxito en las cuatro tareas evaluadas con el protocolo del autor; por otro, ilustra las limitaciones metodológicas de esa evaluación (punto de partida de la cuerda fijado, ausencia de evaluación con offsets aleatorios), que conviene tener presentes antes de extrapolar los resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) sobre LeRobot 0.7.0; codificador visual congelado + experto de acción entrenado |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE; el autor indica que se entrenan ~100 M de 450 M) |
| Longitud de contexto | no disponible (política de chunk fijo de 50 acciones, horizonte de evaluación de 100 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica; recibe instrucciones de tarea como cadena de texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 5,3 GB con checkpoints y logs) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `lerobot/smolvla_base`, una política VLA de la familia SmolVLA integrada en LeRobot. La configuración de entrenamiento congela el codificador visual y entrena únicamente el experto de acción, que representa aproximadamente 100 M de los 450 M de parámetros totales. La política opera con chunk de 50 acciones y ejecuta las 50 completas, con 10 pasos de flow matching; las imágenes se rellenan a 512×512, el estado de 16 dimensiones y la acción de 12 dimensiones se rellenan a 32. La entrada consta de tres cámaras (`front`, `wrist_right`, `wrist_left`, mapeadas a camera1/2/3 mediante `--rename_map`), el estado de observación y la cadena de tarea.

El entrenamiento usó el dataset `rchu233/dlolab_4task_demos_v1`: 400 episodios (100 por tarea), 40.000 fotogramas a 50 FPS, con tres cámaras a 240×384. Se entrenó con batch 64 durante 20.000 pasos (unas 32 épocas) con AdamW (lr 1e-4, betas 0.9/0.95, eps 1e-8, weight decay 1e-10, grad clip 10), warmup de 666 pasos y decaimiento coseno hasta 2,5e-6 en el paso 20.000. La pérdida de flow matching (MSE) bajó de 2,07 en el paso 100 a 0,064 en 5k, 0,043 en 10k y 0,036 en 20k. Todo el entrenamiento se ejecutó en una H100 de 80 GB en Modal, con 0,324 s/paso y 1,82 h de tiempo total.

## Capacidades

- Control robótico multi-tarea sobre objetos lineales deformables: coiling, separation, unknotting y wiring-post con una única política.
- Generación de acciones de efector final de 12 dimensiones como deltas en [-1, 1], en chunks de 50 acciones ejecutadas completas.
- Fusión de tres vistas de cámara (frontal y dos muñecas) con estado propioceptivo de 16 dimensiones.
- Condicionamiento por instrucción de tarea en texto (la tarea se pasa como cadena en el batch).
- Política de flow matching con 10 pasos de integración para la generación de acciones.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso genérico, visión general, audio ni modo thinking; es un modelo específico de robótica.

## Casos de uso

- Investigación en manipulación de objetos deformables: reproduce o sirve de base para experimentos de coiling, separation, unknotting y wiring-post en el entorno DLO-Lab, con checkpoints intermedios (5k, 10k, 15k, 20k) y estados de entrenamiento para reanudar.
- Punto de partida para fine-tuning con nuevos datos: al estar construido sobre `smolvla_base` y ser compatible con LeRobot, puede reentrenarse con demostraciones propias cambiando el dataset y el mapeo de cámaras.
- Evaluación comparativa de políticas VLA: útil como referencia cuantitativa (100 % en las cuatro tareas con el protocolo del autor) frente a la fila de SmolVLA del paper de DLO-Lab (60 % de media).
- Docencia y proyectos de curso: el repositorio incluye logs de entrenamiento, checkpoints por paso, vídeos de rollouts y métricas por episodio, lo que facilita reproducir y auditar el pipeline completo.
- Prototipado de pipelines de evaluación robótica: los `results.json` por rollout con vértices finales de la cuerda y las hojas de contacto permiten construir y depurar métricas geométricas de éxito.
- Integración en un stack LeRobot de laboratorio: la API `SmolVLAPolicy.from_pretrained` más los pre/post procesadores permite desplegar la política en un bucle de control a 50 FPS con tres cámaras, siempre que el hardware robótico coincida con el del dataset.

## Benchmarks y rendimiento

Resultados del autor: 15 rollouts por tarea, inicio de cuerda fijado, semilla 0, horizonte de 100 pasos (2 s a 50 FPS), todas las acciones del chunk ejecutadas y éxito medido con la métrica geométrica del proyecto sobre el estado final.

| Checkpoint | Coiling | Separation | Unknotting | Wiring-post | Media |
|---|---|---|---|---|---|
| 10k pasos | 15/15 | 15/15 | 15/15 | 12/15 | 95 % |
| 20k pasos | 15/15 | 15/15 | 15/15 | 15/15 | 100 % |
| SmolVLA del paper DLO-Lab (Tabla 10, referencia) | 60 % | 100 % | 73 % | 7 % | 60 % |

Advertencias del propio autor: con inicio de cuerda fijado, los rollouts solo difieren por el ruido del flow matching y las formas finales quedan a 2-3 mm entre sí en coiling, separation y unknotting, y a unos 11 mm en wiring-post (20k), por lo que los 15 rollouts de cada tarea se aproximan a un único test. La fila del paper no es directamente comparable porque las demostraciones y la métrica de éxito difieren. En el checkpoint de 10k, los 3 fallos de wiring-post dejaron la cuerda en el mismo lado de ambos postes (sin trenzado en S). Ningún rollout terminó antes de tiempo y ninguna acción salió de [-1, 1].

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M parámetros en safetensors, la inferencia en fp32 rondaría 1,8 GB de pesos y en fp16/bf16 unos 0,9 GB, a lo que hay que sumar las activaciones de tres cámaras a 512×512 y el estado interno; son estimaciones, no cifras publicadas.
- GPU recomendadas: el autor entrenó en una H100 de 80 GB, pero el tamaño del modelo sugiere que la inferencia cabe holgadamente en GPUs de consumo; no se han publicado mediciones.
- ¿Cabe en GPU de consumo? Muy probablemente sí por tamaño de pesos (por debajo de 2 GB en precisión reducida), aunque no hay datos publicados de latencia ni de memoria real en tarjetas como RTX 4090 o RTX 3090.
- Opciones de despliegue: LeRobot 0.7.0 con PyTorch 2.15 mediante `SmolVLAPolicy.from_pretrained` y `make_pre_post_processors`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput: no disponibles; el único dato temporal publicado es el coste de entrenamiento (0,324 s/paso en H100).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rchu233/smolvla_dlolab_4task_b64_20k | 450 M (≈100 M entrenados) | chunk 50, 10 pasos de flow | 100 % medio en 4 tareas (protocolo del autor) | no disponible | Hugging Face (repo 5,3 GB) |
| lerobot/smolvla_base | no disponible en la informacion | no disponible | no disponible | no disponible | Hugging Face (modelo base) |
| SmolVLA del paper DLO-Lab (Tabla 10) | no disponible en la informacion | no disponible | 60 % medio en las mismas 4 tareas | no disponible | referencia bibliográfica |

No se dispone de datos suficientes para comparar con otras políticas VLA de tamaño similar (por ejemplo, variantes de OpenVLA u otras políticas de LeRobot) más allá de las cifras citadas.

## Limitaciones y advertencias

- Evaluación débil: el inicio de la cuerda está fijado y los 15 rollouts por tarea son casi el mismo test; no se ha ejecutado una evaluación con offsets aleatorios pese a que las demostraciones sí los usaban.
- Los resultados del 100 % no son directamente comparables con la tabla del paper DLO-Lab: cambian las demostraciones (planificadores scripted para coiling y wiring-post, políticas FlashSAC para separation y unknotting) y la métrica de éxito.
- Especialización estrecha: solo se ha validado en cuatro tareas de cuerdas en el entorno DLO-Lab; no hay evidencia de generalización a otras tareas, objetos, cámaras o robots.
- Dependencia del hardware y del montaje: requiere tres cámaras con los nombres y la resolución del dataset (240×384) y un robot con acción de efector final de 12 dimensiones; desviaciones del montaje pueden degradar el rendimiento.
- Inconsistencia de configuración: el `config.json` guardado declara `observation.state` con forma [6] heredada de `smolvla_base`, aunque el modelo rellena internamente el estado real de 16 dimensiones a 32; conviene verificar el preprocesado en producción.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución, ni del modelo ni del dataset de entrenamiento.
- Riesgo de alucinación y sesgos: no documentados por el autor; al ser una política de control, el riesgo relevante es la ejecución de acciones incorrectas o inseguras en el robot, no la generación de texto.
- Idiomas no disponibles: la instrucción de tarea se pasa como texto, pero no se especifica qué idiomas o formatos de instrucción se han validado.
- Proyecto de curso: sin mantenimiento ni soporte garantizado, con 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rchu233/smolvla_dlolab_4task_b64_20k
- Dataset de entrenamiento: https://huggingface.co/datasets/rchu233/dlolab_4task_demos_v1
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- LeRobot (librería): https://github.com/huggingface/lerobot
- Paper de DLO-Lab (referencia citada por el autor, Tabla 10): no disponible en la informacion proporcionada
- Demo o espacio asociado: no disponible en la informacion proporcionada
