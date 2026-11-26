# briskVLA/shallow_8L_early_ffn_fused

## Resumen

`briskVLA/shallow_8L_early_ffn_fused` es un checkpoint de investigación para robótica de manipulación, derivado por destilación estructural de `lerobot/smolvla_libero` (el SmolVLA ajustado para el benchmark LIBERO). No es un modelo de lenguaje general: es un "action expert" (experto de acción) reducido en profundidad, pensado para generar secuencias de acciones motrices a partir de observaciones visuales y de instrucción en tareas de manipulación robótica.

El modelo pertenece a la familia BriskVLA, cuyo objetivo es comprimir el experto de acción de SmolVLA manteniendo el comportamiento del profesor. En este caso se conservan 8 de las capas del experto original (índices 0 a 7), con un layout canónico "early" y fusión de las capas FFN, lo que deja un experto de 84,51 M de parámetros. El checkpoint completo, incluyendo el resto de componentes del pipeline SmolVLA, suma 436.313.056 parámetros y ocupa 0,9 GB en el repositorio.

Es relevante para quien investigue destilación de políticas visomotoras y despliegue de VLA (vision-language-action) en hardware modesto: el autor publica métricas de validación concretas (mejor `chunk_mse_teacher` de 0,2930 en el paso 4000) y scripts para evaluar en LIBERO, medir latencia y seguir comprimiendo (por ejemplo, de 8L a 4L). No obstante, es un artefacto de investigación sin licencia declarada, sin datos de benchmarks de éxito publicados en la información disponible y con cero descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (VLA basado en transformer) con experto de acción reducido a 8 capas; layout "early", FFN fusionadas |
| Parametros totales | 436.313.056 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a instrucciones de tareas robóticas en LIBERO) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

El modelo es un checkpoint de destilación de un VLA de tipo SmolVLA. El experto de acción se ha reducido a 8 capas (índices `[0, 1, 2, 3, 4, 5, 6, 7]`) con layout canónico `early` y anchura FFN de 4096, resultando en 84,51 M de parámetros en el experto. El profesor es `lerobot/smolvla_libero` en el commit `a24f1f380461`, y el mapa oculto utilizado es `same_depth`. La etiqueta `ffn_fusion` indica que las capas FFN se han fusionado como parte del proceso de compresión.

El entrenamiento se realizó durante 5000 pasos con batch de 8. La función de pérdida se configuró con pesos `velocity=0.0`, `hidden=0.0`, `output=0.0`, `gt=1.0`, es decir, se supervisa únicamente la salida de acción contra el ground truth (no contra el profesor en velocidad ni estados ocultos). La mejor validación registrada es `chunk_mse_teacher=0.2930` en el paso 4000, con `chunk_mse_gt=0.3519` en ese mismo punto. El run de entrenamiento está disponible en W&B con el identificador `50cca719`.

## Capacidades

- Generación de acciones motrices para manipulación robótica a partir de observaciones e instrucciones, en el entorno del benchmark LIBERO.
- Ejecución de políticas de acción por chunks (el autor evalúa con K=10 y K=1), lo que permite distintos compromisos entre frecuencia de replanificación y latencia.
- Destilación adicional: el checkpoint puede usarse como estudiante para seguir comprimiendo (por ejemplo, de 8L a 4L) mediante los scripts `distill_student.py` y `build_student.py`.
- Evaluación reproducible en LIBERO mediante `run_eval.sh` y medición de latencia con `latency.py`.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo "thinking"; su alcance es la política visomotora.

## Casos de uso

- Investigación en destilación de políticas VLA: usar este checkpoint como estudiante de referencia para comparar estrategias de reducción de profundidad (8L frente al profesor completo) midiendo `chunk_mse_teacher` y `chunk_mse_gt`.
- Compresión iterativa de modelos robóticos: partir de este 8L para generar variantes de 4L con `build_student.py --group 2 --keep alternate --ffn fuse`, evaluando la degradación en LIBERO.
- Evaluación comparativa de latencia en LIBERO: ejecutar `latency.py` para cuantificar el coste de inferencia con K=10 y K=1 y decidir la frecuencia de replanificación en un bucle de control real.
- Reproducción de experimentos: el run de W&B y los scripts permiten reproducir el entrenamiento y validar los valores de MSE reportados (0,2930 frente al profesor en el paso 4000).
- Prototipado de políticas ligeras en robótica de manipulación: al ser un checkpoint de 0,9 GB y 436 M de parámetros totales, sirve para experimentar en entornos de simulación LIBERO con requisitos de cómputo moderados.
- Estudio de layouts y fusión FFN: comparar el layout `early` con otras variantes de la familia BriskVLA para analizar el impacto del recorte de capas en la calidad de la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de éxito (success rate) en LIBERO en la información disponible. Los únicos datos de rendimiento son métricas de validación de destilación:

| Metrica | Valor |
|---|---|
| Mejor `chunk_mse_teacher` | 0,2930 (paso 4000) |
| `chunk_mse_gt` en el mejor paso | 0,3519 |
| Pasos de entrenamiento | 5000 |
| Batch | 8 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 436 M de parámetros totales, en FP16 rondaría los 0,9 GB de pesos, más overhead de activaciones y del resto del pipeline SmolVLA (no cuantificado en la información disponible).
- GPU recomendadas: no disponible; por tamaño, el checkpoint es compatible con GPUs consumer, aunque el pipeline completo de SmolVLA incluye componentes adicionales cuyo coste no se detalla.
- Cabe en GPU consumer: previsiblemente sí por tamaño de pesos, sin datos oficiales de VRAM total del pipeline.
- Opciones de despliegue: librería `lerobot`; los scripts del autor (`run_eval.sh`, `latency.py`, `distill_student.py`, `build_student.py`) se ejecutan con `uv run python`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor proporciona un script para medirla (`latency.py`) pero no publica resultados en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `briskVLA/shallow_8L_early_ffn_fused` | 436.313.056 | no disponible | no disponible | Hugging Face (0 descargas) | Experto de acción 8L destilado, layout early, FFN fusionadas |
| `lerobot/smolvla_libero` (profesor) | no disponible | no disponible | no disponible | Hugging Face | SmolVLA ajustado para LIBERO; profesor de esta destilación |
| Otras variantes BriskVLA | no disponible | no disponible | no disponible | Hugging Face | Familia con distintos recortes de profundidad y layouts |

No se dispone de datos suficientes para comparar rendimiento (success rate, latencia) con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre LIBERO, el comportamiento está acotado a las tareas y distribuciones de ese benchmark.
- Riesgo de alucinación: no aplica en el sentido de texto libre, pero sí existe riesgo de acciones erróneas fuera de la distribución de entrenamiento.
- Limitaciones de contexto e idioma: no se especifican longitud de contexto ni idiomas; las instrucciones están orientadas a las tareas de LIBERO.
- Licencia: no declarada en la información disponible, lo que impide confirmar condiciones de uso comercial. Verificar antes de cualquier uso en producción.
- Es un artefacto de investigación con 0 descargas y 0 likes, sin validación externa conocida.
- El rendimiento se reporta solo como MSE de destilación; no hay tasas de éxito en LIBERO publicadas en la información disponible.
- La supervisión se hizo únicamente contra ground truth (`gt=1.0`), sin pérdidas de velocidad ni de estados ocultos, lo que puede limitar la fidelidad al profesor más allá de la salida final.
- No se documentan cuantizaciones soportadas ni despliegue en motores de inferencia estándar (vLLM, TGI, llama.cpp).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/briskVLA/shallow_8L_early_ffn_fused
- Modelo base (profesor): https://huggingface.co/lerobot/smolvla_libero
- Run de entrenamiento en W&B: https://wandb.ai/djonnala-carnegie-mellon-university/briskVLA/runs/50cca719
