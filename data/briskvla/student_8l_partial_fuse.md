# briskVLA/student_8L_partial_fuse

## Resumen

briskVLA/student_8L_partial_fuse es un checkpoint "student" del modelo de robotica SmolVLA, desarrollado por el autor briskVLA (djonnala, Carnegie Mellon University) y publicado en Hugging Face. Se trata de una version de profundidad reducida del modelo base lerobot/smolvla_libero, obtenida mediante destilacion desde el modelo "teacher" original. El modelo resuelve el problema de reducir el coste computacional de un VLA (Vision-Language-Action) para manipulacion robotica manteniendo el rendimiento en la suite de tareas LIBERO.

El checkpoint conserva solo 8 capas del expert action head (indices [0, 1, 2, 3, 8, 11, 12, 15] del teacher), con un layout canonico denominado "partial_fuse" y anchuras FFN de [2048, 2048, 2048, 2048, 4096, 4096, 4096, 4096]. El resultado es un modelo de 418,6 millones de parametros totales (de los cuales 66,82 M corresponden al expert destilado) que mantiene la interfaz completa de SmolVLA pero con una cabeza de accion mas ligera.

Es relevante ahora porque los VLA estan pasando de laboratorio a despliegue real en robotica, donde la latencia y el coste de inferencia son criticos. Este checkpoint demuestra una via concreta de compresion por destilacion de profundidad sobre un modelo abierto, con metricas de validacion publicadas y un pipeline reproducible para seguir comprimiendo (por ejemplo, de 8L a 4L).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (VLA basado en transformer, expert action head destilado de 8 capas) |
| Parametros totales | 418.618.336 |
| Parametros activos | no disponible (no es MoE) |
| Parametros del expert destilado | 66,82 M |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria lerobot) |
| Modelo base | lerobot/smolvla_libero (commit a24f1f380461) |
| Rol | student (destilado del teacher) |
| Capas del expert | 8L: [0, 1, 2, 3, 8, 11, 12, 15] |
| Layout canonico | partial_fuse |
| Anchuras FFN del expert | [2048, 2048, 2048, 2048, 4096, 4096, 4096, 4096] |
| Tamano del repo | 0,8 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLA de LeRobot: un VLA que combina un backbone vision-lenguaje con un expert action head que genera chunks de acciones. En este checkpoint el expert head ha sido reducido de profundidad, conservando solo 8 capas seleccionadas del teacher (indices 0, 1, 2, 3, 8, 11, 12 y 15) y fusionando las FFN con anchuras escalonadas de 2048 y 4096. El layout "partial_fuse" define como se combinan las capas conservadas y el mapa de estados ocultos es "same_depth".

El entrenamiento consistio en destilacion desde lerobot/smolvla_libero durante 5000 pasos con batch de 8. La funcion de perdida combina pesos de velocity=1.0, hidden=0.1, output=1.0 y gt=0.0, es decir, se prioriza la coincidencia de velocidad y salida con el teacher y no la verdad de referencia directa. El mejor checkpoint se alcanzo en el paso 4000, con un chunk_mse_teacher de 0,1287 en validacion y un chunk_mse_gt de 0,1568 en ese mismo punto. El run de entrenamiento esta registrado en Weights & Biases con el identificador 13caac41.

## Capacidades

- Generacion de acciones roboticas por chunks para manipulacion en el entorno LIBERO.
- Control visuomotor a partir de observaciones de imagen y lenguaje de instruccion (herencia de SmolVLA).
- Ejecucion de politicas de imitacion entrenadas sobre demostraciones de LIBERO.
- Inferencia con horizonte de accion configurable (evaluado con K=10 y K=1).
- Destilacion adicional: el checkpoint puede usarse como fuente para seguir comprimiendo (por ejemplo, de 8L a 4L).
- No se documentan capacidades de tool calling, agentes multi-paso, vision general, audio ni razonamiento textual general; el modelo esta especializado en accion robotica.

## Casos de uso

- Evaluacion de politicas en LIBERO: el modelo se ejecuta directamente sobre la suite de tareas de LIBERO mediante el script run_eval.sh del proyecto, permitiendo medir tasas de exito con K=10 y K=1 sobre las tareas estandar del benchmark.
- Investigacion en destilacion de VLA: sirve como punto de partida para experimentos de compresion adicional (por ejemplo, student_8L_partial_fuse_4L) usando build_student.py y distill_student.py, lo que permite estudiar el compromiso entre profundidad del expert y rendimiento.
- Despliegue en robotica de bajo coste: al reducir el expert a 66,82 M de parametros y 0,8 GB de repo, es adecuado para entornos con presupuesto de computo limitado donde el SmolVLA completo no cabria.
- Medicion de latencia de inferencia: el script latency.py del proyecto permite cuantificar el coste por paso de politica, util para decidir si el modelo cumple requisitos de control en tiempo real.
- Baseline para comparativas de VLA comprimidos: al tener metricas de validacion publicadas (chunk_mse_teacher 0,1287), sirve como referencia reproducible en estudios de compresion de modelos de robotica.
- Prototipado rapido de tareas de manipulacion: con instrucciones en lenguaje natural y observaciones visuales, permite iterar sobre politicas en simulacion antes de transferir a hardware real.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Best val chunk_mse_teacher | 0,1287 (paso 4000) |
| Val chunk_mse_gt en el mejor punto | 0,1568 |
| Pasos de entrenamiento | 5000 |
| Batch | 8 |

No se han publicado resultados de benchmarks estandar (tasas de exito en LIBERO, MMLU, HumanEval, GSM8K) en la informacion disponible. Solo se documentan metricas de validacion de destilacion (MSE frente al teacher y frente a ground truth).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 418,6 M de parametros totales y pesos en safetensors, una estimacion en FP32 ronda 1,7 GB y en FP16/bf16 unos 0,85 GB, mas el coste del backbone vision-lenguaje y buffers de inferencia.
- GPU recomendadas: no especificadas por el autor. Por tamano, cualquier GPU consumer moderna (RTX 3060 12 GB en adelante) deberia poder alojar el modelo; GPU de datacenter (A100, H100) solo necesarias para entrenamiento o evaluacion a gran escala.
- Cabe en GPU consumer: si, por el tamano de parametros; la VRAM real dependera del framework y del tamano de batch.
- Opciones de despliegue: libreria lerobot (pipeline robotics); los scripts del proyecto usan uv run y run_eval.sh. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor proporciona un script latency.py para medirlo, pero no se publican cifras en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| briskVLA/student_8L_partial_fuse | 418,6 M (expert 66,82 M) | no disponible | VLA para LIBERO | no disponible | Hugging Face |
| lerobot/smolvla_libero (teacher) | no disponible en la informacion | no disponible | VLA para LIBERO | no disponible | Hugging Face |
| Otros checkpoints briskVLA (p. ej. variantes 4L) | no disponible | no disponible | VLA para LIBERO | no disponible | Hugging Face |

La comparativa cuantitativa con el teacher no esta disponible en la informacion proporcionada; solo se conoce que el student reduce el expert a 8 capas y 66,82 M de parametros y que su MSE frente al teacher en validacion es 0,1287.

## Limitaciones y advertencias

- Especializado exclusivamente en LIBERO: no es un modelo de proposito general y no debe usarse fuera de tareas de manipulacion robotica similares.
- Sin licencia declarada: la ausencia de licencia explicita impide asumir permisos de uso comercial; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Sin idiomas declarados: aunque hereda el componente de lenguaje de SmolVLA, no se documentan idiomas soportados ni calidad multilingue.
- Metricas limitadas: solo hay MSE de destilacion; no hay tasas de exito publicadas en LIBERO, lo que impide evaluar el rendimiento real de la politica sin ejecutar la evaluacion.
- Riesgo de degradacion por compresion: al conservar solo 8 de las capas del teacher, puede perder capacidades en tareas o escenarios no cubiertos por la distribucion de entrenamiento.
- Sin datos de cuantizacion: no se documentan formatos GGUF ni cuantizaciones de baja precision, por lo que el despliegue en hardware muy limitado requiere conversion propia.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validacion externa por parte de la comunidad.
- Posible riesgo de alucinacion en el componente de lenguaje heredado, aunque el uso previsto es generar acciones y no texto libre.

## Enlaces

- Hugging Face: https://huggingface.co/briskVLA/student_8L_partial_fuse
- Modelo base (teacher): https://huggingface.co/lerobot/smolvla_libero
- Run de entrenamiento en W&B: https://wandb.ai/djonnala-carnegie-mellon-university/briskVLA/runs/13caac41
- LeRobot (libreria): https://github.com/huggingface/lerobot
