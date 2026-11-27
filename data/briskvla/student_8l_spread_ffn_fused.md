# briskVLA/student_8L_spread_ffn_fused

## Resumen

`briskVLA/student_8L_spread_ffn_fused` es un checkpoint de un modelo de visión-lenguaje-acción (VLA) para robótica, desarrollado por el usuario briskVLA. Se trata de un modelo "estudiante" destilado a partir del modelo maestro `lerobot/smolvla_libero`, que a su vez es un SmolVLA afinado para el benchmark de manipulación robótica LIBERO. El objetivo del checkpoint es reducir la profundidad del experto de acción del modelo original, conservando solo 8 capas del transformer de acción, para disminuir el coste computacional y la latencia de inferencia en tareas de control robótico.

El modelo se enmarca en la familia SmolVLA de LeRobot (Hugging Face), una arquitectura ligera de VLA pensada para ejecutarse en hardware modesto. Este checkpoint concreto aplica una estrategia de destilación con pérdidas ponderadas (velocity, hidden, output) y una fusión de las capas FFN del experto, dando lugar a un experto de 84,51 M de parámetros dentro de un modelo total de 436,3 M de parámetros.

Es relevante ahora porque la compresión de modelos VLA es una línea activa de trabajo para llevar políticas robóticas a robots reales con GPUs de consumo, y este checkpoint documenta explícitamente el proceso de destilación, la configuración de capas retenidas y las métricas de validación, lo que facilita la reproducibilidad y la comparación con otros estudiantes de la misma familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en SmolVLA (transformer de acción con experto reducido a 8 capas) |
| Parametros totales | 436.313.056 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Rol | student (destilado de `lerobot/smolvla_libero`) |
| Capas del experto | 8L, índices `[0, 1, 4, 5, 8, 9, 12, 13]` |
| Layout canonico | spread |
| Ancho FFN del experto | 4096 |
| Parametros del experto | 84,51 M |
| Modelo base | `lerobot/smolvla_libero` @ `a24f1f380461` |
| Libreria | lerobot |
| Tamano del repo | 0,9 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLA de LeRobot, un VLA ligero que combina un codificador visual, un modelo de lenguaje y un experto de acción que genera trayectorias de acciones condicionadas por observaciones visuales e instrucciones. En este checkpoint, el experto de acción se ha reducido a 8 capas seleccionadas de las 16 originales (índices 0, 1, 4, 5, 8, 9, 12 y 13), con un ancho FFN de 4096 y una fusión de capas FFN aplicada durante la construcción del estudiante. El layout canónico es "spread" y el mapa de estados ocultos es `same_depth`.

El entrenamiento consistió en 5000 pasos con batch de 8, con pesos de pérdida velocity=1.0, hidden=0.1, output=1.0 y gt=0.0, es decir, destilación pura desde el maestro sin supervisión directa sobre ground truth. La mejor validación se alcanzó en el paso 5000 con `chunk_mse_teacher` de 0,1275 y `chunk_mse_gt` de 0,1531. El run de entrenamiento está documentado en Weights & Biases (ID `ec9d3b16`). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de acciones robóticas condicionadas por observaciones visuales e instrucciones en lenguaje natural, dentro del entorno LIBERO.
- Control de manipulación multi-tarea en los suites de LIBERO (no se detalla cuáles en la información disponible).
- Ejecución de políticas de acción con horizonte de chunk configurable (evaluación con K=10 y K=1).
- Destilación adicional: el checkpoint puede usarse como fuente para seguir comprimiendo (por ejemplo, de 8L a 4L) mediante las herramientas `distill_student.py` y `build_student.py`.
- Medición de latencia mediante el script `latency.py` del repositorio del autor.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo thinking.

## Casos de uso

- Evaluación de políticas VLA en LIBERO: el checkpoint está pensado para ejecutarse con `run_eval.sh` sobre el benchmark LIBERO con K=10 y K=1, lo que permite medir la tasa de éxito y comparar contra el maestro `lerobot/smolvla_libero`.
- Despliegue en robots con recursos limitados: al reducir el experto a 8 capas y 84,51 M de parámetros, el modelo es candidato para inferencia en GPUs de consumo, aunque no se publican requisitos de VRAM en la información disponible.
- Destilación iterativa: sirve como punto de partida para generar estudiantes aún más pequeños (por ejemplo, 4L) mediante `build_student.py --group 2 --keep alternate --ffn fuse`, útil en pipelines de compresión progresiva.
- Investigación en compresión de VLAs: el checkpoint documenta la configuración exacta de capas retenidas, pesos de pérdida y métricas de validación, lo que facilita estudios de ablación sobre profundidad y fusión FFN.
- Medición de latencia y throughput: el script `latency.py` permite caracterizar el coste de inferencia del estudiante frente al maestro en el mismo hardware.
- Reproducibilidad de experimentos: el run de W&B y los comandos de evaluación permiten reproducir el proceso de destilación y validación en entornos de investigación.
- Base para fine-tuning específico de tarea: al ser un estudiante ya destilado, puede afinarse con datos de un robot concreto para adaptar la política a un entorno distinto de LIBERO (no documentado en la información disponible).

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Best val `chunk_mse_teacher` | 0,1275 (paso 5000) |
| Val `chunk_mse_gt` en el mejor paso | 0,1531 |
| Tasa de éxito en LIBERO (K=10, K=1) | no disponible en la información proporcionada |
| Latencia medida | no disponible en la información proporcionada |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, dado que el modelo es una política robótica y no un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El tamaño del repo es de 0,9 GB en safetensors, lo que sugiere que los pesos en precisión nativa caben en GPUs de consumo, pero no se confirma.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? No confirmado; el tamaño de pesos (0,9 GB) es compatible con GPUs de consumo típicas, pero no se documenta.
- Opciones de despliegue: la librería indicada es `lerobot`; los scripts del autor (`run_eval.sh`, `latency.py`, `distill_student.py`, `build_student.py`) se ejecutan con `uv run python`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor proporciona un script para medirlos, pero no publica resultados en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `briskVLA/student_8L_spread_ffn_fused` | 436,3 M (experto 84,51 M) | no disponible | no disponible | Hugging Face | Estudiante 8L destilado de SmolVLA-LIBERO |
| `lerobot/smolvla_libero` | no disponible | no disponible | no disponible | Hugging Face | Maestro del que se destila este checkpoint |
| Otros estudiantes de la familia briskVLA | no disponible | no disponible | no disponible | Hugging Face (presumiblemente) | No se detallan en la información disponible |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en el benchmark LIBERO; su generalización a otros entornos robóticos no está documentada.
- La licencia no está indicada, lo que impide confirmar si el uso comercial está permitido.
- No se documentan los idiomas soportados ni la composición del dataset de entrenamiento, lo que limita el análisis de sesgos.
- Al ser un estudiante destilado con pérdida `gt=0.0`, depende enteramente de la calidad del maestro `lerobot/smolvla_libero`; los errores del maestro pueden propagarse.
- El `chunk_mse_gt` de 0,1531 es superior al `chunk_mse_teacher` de 0,1275, lo que indica una brecha respecto al ground truth que debe tenerse en cuenta en producción.
- No se publican tasas de éxito en LIBERO ni latencias medidas, por lo que no se puede evaluar el rendimiento real de despliegue a partir de la información disponible.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad.
- No se documentan cuantizaciones soportadas ni formatos alternativos a safetensors.

## Enlaces

- Hugging Face: https://huggingface.co/briskVLA/student_8L_spread_ffn_fused
- Modelo maestro: https://huggingface.co/lerobot/smolvla_libero
- Run de entrenamiento en W&B: https://wandb.ai/djonnala-carnegie-mellon-university/briskVLA/runs/ec9d3b16
- Repositorio LeRobot (librería): https://github.com/huggingface/lerobot
- No se han encontrado en la información disponible otros enlaces a papers, blogs, repos del autor o demos.
