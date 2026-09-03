# maskjp/pi05-relative-joints-full-ft-30k

## Resumen

Este modelo es un checkpoint de investigación derivado de `lerobot/pi05_base`, un modelo de visión-lenguaje-acción (VLA) de la familia π₀.₅ desarrollado por LeRobot (Hugging Face). El autor, `maskjp`, realizó un fine-tuning completo (todos los 4.143.404.816 parámetros entrenables) sobre un conjunto de 949 episodios multi-tarea de robótica, con acciones relativas en el espacio articular. El checkpoint publicado corresponde al paso 30.000 del entrenamiento, que es el punto final del programa de aprendizaje por tasa de coseno.

Es importante señalar que este no es el mejor checkpoint del entrenamiento: el autor lo publica explícitamente como un artefacto de investigación para documentar el comportamiento de sobreajuste. La pérdida en el conjunto de validación en el paso 30.000 es de 0,0392, un 41 % peor que el mínimo de 0,0278 alcanzado en el paso 10.000. El modelo recomendado para despliegue es `maskjp/pi05-relative-joints-full-ft`, que corresponde al mejor paso. Este repositorio sirve para estudiar los efectos del sobreajuste en el fine-tuning completo de un VLA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en π₀.₅, con torre de visión, modelo de lenguaje y experto de acción |
| Parametros totales | 4.143.404.816 (4,14 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16, safetensors) |
| Idiomas soportados | no disponible (el VLM subyacente podría ser multilingüe, pero no se especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con normalizadores y configuración de LeRobot) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `lerobot/pi05_base`, que a su vez es un VLA de la familia π₀.₅. La arquitectura combina una torre de visión, un modelo de lenguaje y un experto de acción, entrenados conjuntamente para control robótico end-to-end. En este checkpoint, todos los parámetros son entrenables (sin congelar la torre de visión ni el experto de acción), a diferencia de otras variantes que congelan el VLM.

El entrenamiento se realizó sobre un conjunto de 949 episodios (900 de entrenamiento, 49 de validación) que cubren 8 tareas, con 3 cámaras y una frecuencia de 50 Hz. Se usó una estrategia de acciones relativas: el modelo predice `action[t+k] - state[anchor]` con un ancla por chunk, y el gripper se mantiene en coordenadas absolutas (`relative_exclude_joints=['gripper']`). La configuración incluye `chunk_size=50`, `n_action_steps=10`, `n_obs_steps=1`, `gradient_checkpointing=true`, `compile_model=true` y dtype bfloat16. El optimizador usó una tasa de aprendizaje de 2,5e-5 con warmup de 1000 pasos y decaimiento coseno hasta 2,5e-6 en 30.000 pasos; la torre de visión y el proyector multimodal usaron un multiplicador de 0,1 (2,5e-6). La normalización emplea identidad visual, cuantiles para el estado y cuantiles para las acciones. El entrenamiento se realizó con DDP en 3 GPUs, batch efectivo de 63 y semilla 1000.

El autor documenta que el modelo memoriza los 900 episodios en menos de media época: la pérdida de entrenamiento cae a ~0,008 mientras que la pérdida de validación sube a partir del paso 10.000, evidenciando sobreajuste. La lección extraída es que 30.000 pasos son excesivos para un fine-tuning completo en este conjunto de datos.

## Capacidades

- Control robótico end-to-end: genera comandos de articulación (10 dimensiones de motores) a partir de observaciones visuales y de estado.
- Acciones relativas: predice desplazamientos respecto a un ancla por chunk, lo que mejora la generalización frente a posiciones absolutas.
- Multi-tarea: entrenado en 8 tareas distintas, con capacidad de adaptarse a cada una mediante la instrucción en lenguaje natural (heredada del VLM).
- Observación multi-cámara: utiliza 3 cámaras para la entrada visual.
- Predicción por chunks: genera secuencias de 50 pasos de acción, con 10 pasos de ejecución por iteración.
- Normalización integrada: las estadísticas de normalización están incluidas en el repositorio, por lo que no requiere el dataset de entrenamiento para inferencia.
- Sin soporte de tool calling ni generación de texto general: es un modelo puramente orientado a control robótico.

## Casos de uso

- Investigación sobre sobreajuste en VLA: este checkpoint es útil para estudiar cómo el fine-tuning completo memoriza datos de entrenamiento y degrada la generalización. Los investigadores pueden comparar la pérdida de validación a lo largo de los pasos para analizar la dinámica del sobreajuste.
- Evaluación de políticas de control: permite probar el comportamiento de un modelo sobreajustado en tareas robóticas reales o simuladas, contrastándolo con el checkpoint óptimo (paso 10.000) para medir el impacto de la memorización.
- Comparación de estrategias de fine-tuning: al comparar con el modelo de VLM congelado (`maskjp/pi05-relative-joints-frozen-vlm`), se puede analizar cómo la congelación de la torre de visión y el lenguaje previene el sobreajuste.
- Desarrollo de pipelines de despliegue con LeRobot: el repositorio incluye normalizadores y configuración lista para usar, permitiendo integrar el modelo en un sistema robótico sin necesidad de reentrenar ni acceder al dataset original.
- Validación de técnicas de regularización: sirve como punto de partida para probar métodos como early stopping, dropout o regularización de pesos en fine-tuning de VLA.
- Benchmark de sensibilidad a cambios de cámara: aunque no se midió para este brazo, el modelo puede usarse para evaluar la robustez visual en entornos con cámaras diferentes, siguiendo el protocolo descrito por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque se trata de un modelo de robótica, no de lenguaje general. La model card proporciona la pérdida en el conjunto de validación (held-out) a lo largo del entrenamiento:

| Paso | Pérdida held-out |
|---:|---:|
| 5.000 | 0,0291 |
| 10.000 | 0,0278 (mejor) |
| 15.000 | 0,0309 |
| 20.000 | 0,0350 |
| 25.000 | 0,0382 |
| 30.000 | 0,0392 |

La pérdida de entrenamiento cae a ~0,008, lo que indica memorización casi perfecta del conjunto de entrenamiento. El autor no reporta métricas de éxito en tareas reales para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,14 B parámetros en bfloat16, los pesos ocupan aproximadamente 8,3 GB. Con overhead de activaciones y normalizadores, se recomienda al menos 12-16 GB de VRAM.
- GPU recomendadas: una RTX 3090/4090 (24 GB) o una A100 (40/80 GB) son suficientes para inferencia. Para entrenamiento, el autor usó 3 GPUs (no especificadas) con batch efectivo de 63.
- Compatibilidad con GPU de consumo: sí, una RTX 3090 o superior puede ejecutar el modelo en inferencia, aunque la latencia dependerá de la resolución de las cámaras y del tamaño de los chunks.
- Opciones de despliegue: el modelo se integra con LeRobot (librería oficial). Se puede cargar con `PreTrainedConfig.from_pretrained` y `get_policy_class(...).from_pretrained`. No es compatible con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo estándar.
- Latencia y throughput: no disponibles. Dependen del hardware y de la configuración de inferencia (por ejemplo, `n_action_steps=10`).

## Comparativa con modelos similares

| Modelo | Parámetros entrenables | Pérdida held-out (paso 30K) | Sobreajuste | Licencia |
|---|---|---|---|---|
| `maskjp/pi05-relative-joints-full-ft-30k` (este) | 4,14 B (todos) | 0,0392 | Sí, desde paso 10K | Apache-2.0 |
| `maskjp/pi05-relative-joints-full-ft` (checkpoint óptimo) | 4,14 B (todos) | 0,0278 (paso 10K) | No (early stopping) | Apache-2.0 |
| `maskjp/pi05-relative-joints-frozen-vlm` | 693 M (VLM congelado) | 0,0296 (monótona) | No | Apache-2.0 |
| `lerobot/pi05_base` | 4,14 B (preentrenado) | no disponible | no aplica | Apache-2.0 |

La comparativa muestra que el modelo congelado (frozen-VLM) no sobreajusta y alcanza una pérdida similar al mejor checkpoint del fine-tuning completo, pero con muchos menos parámetros entrenables. El checkpoint de 30K es claramente inferior a sus alternativas para uso práctico.

## Limitaciones y advertencias

- Checkpoint de sobreajuste: este modelo no es adecuado para despliegue en producción. El propio autor advierte que es un artefacto de investigación y que el checkpoint óptimo está en otro repositorio.
- Pérdida de generalización: la pérdida held-out es un 41 % peor que el mínimo alcanzado, lo que indica que ha memorizado los datos de entrenamiento en lugar de aprender patrones generalizables.
- Sensibilidad a la cámara no medida: a diferencia de los modelos con VLM congelado (que puntúan 0,088-0,091 en el ratio de sensibilidad al cambio de cámara, muy por debajo del umbral de 0,5), este brazo no ha sido evaluado. Podría ser más frágil ante cambios en la configuración de las cámaras.
- Configuración modificada: el `config.json` subido difiere del usado en entrenamiento (se eliminó `vision_encoder_lr_multiplier` porque draccus rechaza claves desconocidas). Esto no afecta a la inferencia, pero debe tenerse en cuenta al reproducir el entrenamiento.
- Dependencia de LeRobot: el modelo solo puede ejecutarse dentro del ecosistema LeRobot; no es un modelo autónomo ni exportable a otros frameworks.
- Riesgo de alucinación en acciones: al ser un modelo sobreajustado, puede generar comandos de articulación poco realistas o inconsistentes con el estado actual del robot, especialmente en situaciones no vistas durante el entrenamiento.
- Idiomas y sesgos: no se dispone de información sobre los idiomas soportados ni sobre posibles sesgos del VLM subyacente. La licencia Apache-2.0 permite uso comercial, pero se recomienda validar el comportamiento en el dominio específico.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/maskjp/pi05-relative-joints-full-ft-30k
- Checkpoint óptimo (recomendado para despliegue): https://huggingface.co/maskjp/pi05-relative-joints-full-ft
- Modelo con VLM congelado (comparativa): https://huggingface.co/maskjp/pi05-relative-joints-frozen-vlm
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Paper de π₀.₅: https://arxiv.org/html/2504.16054v1
- Código de LeRobot para π₀.₅: https://github.com/huggingface/lerobot/tree/main/src/lerobot/policies/pi05
