# briskVLA/shallow_8L_alternating_ffn_fused

## Resumen

briskVLA/shallow_8L_alternating_ffn_fused es un checkpoint de investigación para robótica de manipulación, desarrollado por el usuario briskVLA, que consiste en un "action expert" de profundidad reducida derivado por destilación del modelo SmolVLA de LeRobot (concretamente de `lerobot/smolvla_libero`). El modelo conserva únicamente 8 de las 16 capas del experto original del profesor, seleccionadas en las posiciones `[0, 3, 4, 7, 8, 11, 12, 15]`, con un layout canónico "alternating" y fusión de las capas FFN a una anchura de 4096. El resultado es un experto de 84,51 M de parámetros dentro de un artefacto total de 436,3 M de parámetros (que incluye el resto de componentes del pipeline VLA).

El objetivo del proyecto es la compresión y el despliegue eficiente de políticas visión-lenguaje-acción (VLA) para el benchmark LIBERO, reduciendo el coste computacional del experto de acción sin reentrenar desde cero, mediante destilación desde el modelo profesor. Es relevante para quienes investigan en VLA de bajo coste, destilación de políticas y despliegue en robótica con recursos limitados, ya que demuestra una ruta de compresión progresiva (por ejemplo, de 8L a 4L) documentada en los scripts del autor.

El modelo se publica bajo la librería LeRobot, con pesos en safetensors, y está orientado exclusivamente a evaluación en LIBERO mediante los scripts proporcionados. No se han publicado datos de benchmarks en la información disponible más allá de las métricas de validación del entrenamiento de destilación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Action expert de SmolVLA (VLA basado en transformer) con profundidad reducida; layout "alternating", FFN fusionadas |
| Parámetros totales | 436.313.056 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Rol del experto | shallow |
| Capas del experto | 8L, índices `[0, 3, 4, 7, 8, 11, 12, 15]` |
| Anchura FFN del experto | 4096 |
| Parámetros del experto | 84,51 M |
| Modelo profesor | `lerobot/smolvla_libero` @ `a24f1f380461` |
| Pasos de entrenamiento / batch | 5000 pasos, batch 8 |
| Pesos de pérdida | velocity=0.0, hidden=0.0, output=0.0, gt=1.0 |
| Hidden map | same_depth |
| Mejor val `chunk_mse_teacher` | 0,1593 (paso 4500) |
| Val `chunk_mse_gt` en el mejor punto | 0,2086 |
| Tamaño del repo | 0,9 GB |

## Arquitectura y entrenamiento

El modelo es un action expert derivado de SmolVLA, la política visión-lenguaje-acción de LeRobot. En lugar de entrenar una política completa desde cero, el autor parte del profesor `lerobot/smolvla_libero` y construye un estudiante de menor profundidad conservando 8 de las 16 capas del experto (índices `[0, 3, 4, 7, 8, 11, 12, 15]`), con un layout canónico "alternating" y fusión de las FFN a anchura 4096. El experto resultante tiene 84,51 M de parámetros, mientras que el artefacto completo suma 436,3 M.

El entrenamiento de destilación se realizó durante 5000 pasos con batch de 8, usando una pérdida basada exclusivamente en ground truth (`gt=1.0`, con `velocity`, `hidden` y `output` a 0.0) y un mapeo de estados ocultos `same_depth`. El mejor checkpoint se alcanzó en el paso 4500, con un `chunk_mse_teacher` de validación de 0,1593 y un `chunk_mse_gt` de 0,2086. El autor documenta además un pipeline para continuar la compresión (por ejemplo, de 8L a 4L) mediante los scripts `distill_student.py` y `build_student.py`. No se dispone de información sobre la composición del dataset de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- Generación de acciones de manipulación robótica en el entorno LIBERO a partir de observaciones visuales e instrucciones en lenguaje natural.
- Política visión-lenguaje-acción (VLA): integra percepción visual, comprensión del lenguaje y predicción de acciones en un único modelo.
- Control de robot por chunks de acción, evaluable con K=10 y K=1 según los scripts del autor.
- Destilación y compresión adicional: el checkpoint puede usarse como estudiante o como fuente para generar estudiantes de menor profundidad.
- Evaluación de latencia mediante el script `latency.py` del repositorio del autor.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo ni modos de razonamiento explícito.

## Casos de uso

- Evaluación de políticas VLA comprimidas en LIBERO: ejecutar `run_eval.sh` con K=10 y K=1 para medir la tasa de éxito del experto de 8 capas frente al profesor, lo que permite cuantificar la pérdida de rendimiento por la reducción de profundidad.
- Investigación en destilación de políticas robóticas: usar el checkpoint como estudiante de referencia para comparar estrategias de selección de capas, layouts y fusión de FFN en la compresión de SmolVLA.
- Compresión progresiva: emplear `build_student.py` con `--group 2 --keep alternate --ffn fuse` para generar un estudiante de 4 capas a partir de este de 8, estudiando la curva de degradación de rendimiento.
- Análisis de latencia en despliegue robótico: medir con `latency.py` el coste de inferencia del experto reducido y compararlo con el del profesor para decidir si es viable en hardware de borde.
- Reproducibilidad de experimentos: el enlace al run de W&B (`a3c01929`) y las métricas de validación permiten replicar el entrenamiento de destilación con los mismos hiperparámetros (5000 pasos, batch 8, pérdida gt=1.0).
- Estudio de arquitecturas "role-shallow": analizar cómo afecta la eliminación de capas del experto de acción a la calidad de las trayectorias generadas en tareas de manipulación del benchmark LIBERO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento son las métricas de validación del entrenamiento de destilación:

| Métrica | Valor |
|---|---|
| Mejor val `chunk_mse_teacher` | 0,1593 (paso 4500) |
| Val `chunk_mse_gt` en el mejor punto | 0,2086 |

No se dispone de tasas de éxito en LIBERO ni de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el tamaño del repo (0,9 GB) sugiere que los pesos en safetensors caben en GPUs de consumo, pero no se confirma el pico de memoria en ejecución.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño del artefacto (0,9 GB) es plausible en GPUs con suficiente VRAM, pero no hay datos oficiales.
- Opciones de despliegue: LeRobot (librería declarada), con scripts de evaluación (`run_eval.sh`) y medición de latencia (`latency.py`) del repositorio del autor. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; el autor proporciona un script para medirlos, pero no publica resultados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| briskVLA/shallow_8L_alternating_ffn_fused | 436,3 M totales (84,51 M experto) | no disponible | val `chunk_mse_teacher` 0,1593 | no disponible | Hugging Face (LeRobot) |
| lerobot/smolvla_libero (profesor) | no disponible | no disponible | no disponible | no disponible | Hugging Face (LeRobot) |
| Otros estudiantes del proyecto briskVLA (p. ej. 4L) | no disponible | no disponible | no disponible | no disponible | Hugging Face (LeRobot) |

La comparación cuantitativa con alternativas de la misma categoría (políticas VLA para LIBERO) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación externa.
- Sin licencia declarada: no se puede confirmar si el uso comercial está permitido; es imprescindible contactar con el autor antes de cualquier despliegue comercial.
- Sin información sobre idiomas soportados ni sobre el dataset de entrenamiento, lo que impide evaluar sesgos y cobertura lingüística.
- Riesgo de alucinación y de generalización limitada: al ser un experto destilado y evaluado únicamente en LIBERO, su comportamiento fuera de ese benchmark no está caracterizado.
- El experto tiene solo 8 capas y 84,51 M de parámetros, con una pérdida de destilación (`chunk_mse_teacher` 0,1593) que indica una brecha respecto al profesor; no se documenta la tasa de éxito resultante.
- Dependencia del ecosistema LeRobot y de los scripts del autor para evaluación y compresión; no se documentan formatos alternativos de despliegue.
- Fecha de creación y actualización (2026-11-26) y estado del repositorio deben verificarse, ya que la información puede no reflejar cambios posteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/briskVLA/shallow_8L_alternating_ffn_fused
- Modelo profesor: https://huggingface.co/lerobot/smolvla_libero
- Run de entrenamiento en W&B: https://wandb.ai/djonnala-carnegie-mellon-university/briskVLA/runs/a3c01929
