# briskVLA/shallow_8L_alternating

## Resumen

BriskVLA/shallow_8L_alternating es un checkpoint de investigación del proyecto BriskVLA, una variante de profundidad reducida del modelo de visión-lenguaje-acción (VLA) SmolVLA de LeRobot. Se distribuye como un "action expert" destilado del modelo docente `lerobot/smolvla_libero`, orientado a la ejecución de tareas robóticas de manipulación en el benchmark LIBERO. El modelo conserva únicamente 8 capas del experto original (índices `[0, 3, 4, 7, 8, 11, 12, 15]`) con un layout canónico "alternating" y un ancho de FFN de 2048, lo que reduce el experto a 49,12 M de parámetros y el total del checkpoint a 400.923.616 parámetros.

La propuesta del proyecto es la compresión y destilación de políticas VLA para reducir coste de inferencia manteniendo el comportamiento del profesor. El checkpoint se ha entrenado durante 5000 pasos con batch de 8, usando una pérdida basada exclusivamente en ground truth (`gt=1.0`, resto a 0.0), y reporta un mejor `chunk_mse_teacher` de 0.1701 en el paso 4000 (con `chunk_mse_gt` de 0.2206 en ese mismo punto). Es relevante para quienes investigan el despliegue eficiente de políticas robóticas en hardware limitado y para reproducir experimentos de destilación sobre SmolVLA.

El modelo es de nicho y muy reciente: cuenta con 0 descargas y 0 likes en el momento de la consulta, no declara licencia ni idiomas, y su uso previsto es la evaluación sobre LIBERO y la experimentación con destilación adicional (por ejemplo, de 8L a 4L). No es un modelo de propósito general ni un asistente conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) derivada de SmolVLA; action expert transformer reducido a 8 capas con layout "alternating" |
| Parametros totales | 400.923.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `lerobot`) |

Datos adicionales del checkpoint: rol `shallow`, profesor `lerobot/smolvla_libero` @ `a24f1f380461`, capas del experto `[0, 3, 4, 7, 8, 11, 12, 15]`, ancho de FFN del experto 2048, parámetros del experto 49,12 M, mapa oculto `same_depth`, tamaño del repo 0,8 GB.

## Arquitectura y entrenamiento

El modelo parte de SmolVLA, una política VLA de LeRobot que combina un codificador visual-lenguaje con un experto de acciones. BriskVLA aplica una reducción de profundidad sobre ese experto: en lugar de mantener todas las capas, selecciona un subconjunto de 8 capas (`[0, 3, 4, 7, 8, 11, 12, 15]`) y las reorganiza con un layout canónico "alternating", manteniendo un ancho de FFN de 2048. El resultado es un experto de 49,12 M de parámetros integrado en un checkpoint total de ~401 M.

El entrenamiento se realizó durante 5000 pasos con batch de 8, con pesos de pérdida `velocity=0.0, hidden=0.0, output=0.0, gt=1.0`, es decir, optimizando únicamente contra ground truth y no contra las salidas intermedias del profesor. El mapa oculto es `same_depth`. El mejor valor de validación reportado es `chunk_mse_teacher=0.1701` en el paso 4000, con `chunk_mse_gt=0.2206` en ese mismo punto. La model card documenta además el flujo para continuar la destilación o comprimir más el modelo (por ejemplo, de 8L a 4L mediante `build_student.py` con `--group 2 --keep alternate --ffn fuse`).

## Capacidades

- Generación de acciones robóticas para tareas de manipulación en el entorno LIBERO.
- Política de imitación entrenada sobre el modelo docente `lerobot/smolvla_libero`.
- Integración con el ecosistema LeRobot (`lerobot` como librería declarada).
- Evaluación configurable con distintos horizontes de acción (la model card menciona K=10 y K=1).
- Medición de latencia mediante el script `latency.py` del proyecto.
- Base para destilación adicional y compresión de profundidad (por ejemplo, 8L a 4L).
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo "thinking".

## Casos de uso

- Evaluación en LIBERO: ejecutar `run_eval.sh` con `STEPS="10 1"` para medir la tasa de éxito de la política en las tareas del benchmark y comparar con el profesor `lerobot/smolvla_libero`.
- Medición de latencia en despliegue: usar `latency.py` para caracterizar el coste de inferencia del checkpoint reducido frente a alternativas de mayor profundidad antes de elegir una política para un robot real.
- Destilación iterativa: emplear `distill_student.py` partiendo de este checkpoint para obtener variantes aún más pequeñas y estudiar la curva de compromiso entre tamaño y `chunk_mse`.
- Compresión estructural: aplicar `build_student.py` con `--group 2 --keep alternate --ffn fuse` para generar un estudiante de 4 capas y comparar su rendimiento con el de 8 capas.
- Investigación en eficiencia de políticas VLA: usar el checkpoint como punto de partida reproducible (run de W&B `e2174348`) para experimentos sobre reducción de profundidad y layouts alternativos.
- Prototipado en robótica de manipulación con recursos limitados: al tener ~401 M de parámetros y un repo de 0,8 GB, es viable para pruebas en estaciones de trabajo con una sola GPU, siempre que se valide su tasa de éxito en el entorno objetivo.
- Reproducibilidad de experimentos: replicar el entrenamiento con los hiperparámetros documentados (5000 pasos, batch 8, pérdida solo `gt`) para verificar los valores de validación reportados.

## Benchmarks y rendimiento

| Metrica | Valor | Paso |
|---|---|---|
| Best val `chunk_mse_teacher` | 0.1701 | 4000 |
| Val `chunk_mse_gt` en el mejor punto | 0.2206 | 4000 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, tasas de éxito en LIBERO) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con ~401 M de parámetros en safetensors, los pesos ocupan aproximadamente 0,8 GB en FP32/FP16 según el repo, por lo que cabría en GPUs de consumo con holgura para el resto del pipeline (codificador visual y procesamiento).
- GPU recomendadas: no disponible en la documentación; por tamaño, una RTX 4090 o superior debería ser suficiente para inferencia, pero no hay cifras publicadas.
- Cabe en GPU de consumo: previsiblemente sí por tamaño de pesos, aunque no se confirma en la model card.
- Opciones de despliegue: ecosistema LeRobot (`lerobot`), con scripts del proyecto BriskVLA (`run_eval.sh`, `latency.py`, `distill_student.py`, `build_student.py`). No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card remite a `latency.py` para medirlos.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| briskVLA/shallow_8L_alternating | 400.923.616 | no disponible | `chunk_mse_teacher` 0.1701 (val) | no disponible | Hugging Face (0 descargas) |
| lerobot/smolvla_libero (profesor) | no disponible en la informacion | no disponible | referencia docente del checkpoint | no disponible | Hugging Face (LeRobot) |
| Otras variantes BriskVLA (p. ej. 4L) | no disponible en la informacion | no disponible | no disponible | no disponible | generables con `build_student.py` |

No se dispone de datos suficientes para comparar con alternativas externas de la misma categoría (otras políticas VLA para LIBERO) en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Modelo de investigación con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación externa.
- Sin licencia declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor antes de cualquier despliegue.
- Idiomas no declarados: no está pensado como modelo de lenguaje general y no se documentan capacidades multilingües.
- Ámbito restringido a robótica de manipulación en LIBERO; no es un modelo conversacional ni de propósito general.
- El entrenamiento usa solo pérdida contra ground truth (`gt=1.0`), lo que puede limitar la fidelidad al profesor en comparación con estrategias de destilación que incluyan pérdidas intermedias.
- Riesgo de sobreajuste al benchmark LIBERO y de escasa generalización a entornos reales no vistos.
- No se documentan sesgos, tasas de alucinación ni límites de contexto; al ser una política de acciones, el riesgo relevante es el fallo de ejecución física, no la generación de texto.
- Los valores de validación reportados (`chunk_mse`) no equivalen a tasas de éxito; la model card remite a `run_eval.sh` para medirlas y no se han publicado resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/briskVLA/shallow_8L_alternating
- Modelo base (profesor): https://huggingface.co/lerobot/smolvla_libero
- Run de entrenamiento en W&B: https://wandb.ai/djonnala-carnegie-mellon-university/briskVLA/runs/e2174348
