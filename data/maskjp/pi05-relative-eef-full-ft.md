# maskjp/pi05-relative-eef-full-ft

## Resumen

`maskjp/pi05-relative-eef-full-ft` es un fine-tuning completo del modelo de visión-lenguaje-acción (VLA) π0.5, desarrollado por el usuario maskjp sobre la base `lerobot/pi05_base`. El modelo se entrena sobre una mezcla multi-tarea de 949 episodios (8 tareas, 3 cámaras, 50 Hz) con acciones relativas en el espacio del end-effector (pose de 13 dimensiones con rotación 6D). A diferencia de la variante con VLM congelado, aquí se entrenan todos los parámetros: torre de visión, modelo de lenguaje y experto de acción, sumando 4.143.404.816 parámetros.

El autor publica este checkpoint como un experimento de investigación: el paso 5000 (el mejor en loss de validación) muestra un held-out loss de 0.0286, ligeramente peor que el 0.0283 obtenido por la variante con VLM congelado que entrena solo 693M parámetros. Además, el entrenamiento completo sobreajusta rápidamente: el loss de entrenamiento cae a ~0.008 mientras el de validación sube después del paso 5000. La conclusión del autor es que el fine-tuning completo no merece la pena en este escenario, y que la variante congelada es más eficiente y generaliza mejor.

El modelo se distribuye bajo licencia Apache-2.0, en formato safetensors, y está diseñado para cargarse con la librería LeRobot. No incluye el dataset de entrenamiento, pero las estadísticas de normalización están integradas en los pesos, por lo que puede desplegarse sin él.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π0.5 (VLA: vision-language-action) |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (depende de la base pi0.5) |
| Tipos de cuantizacion | no disponible (solo safetensors en bfloat16) |
| Idiomas soportados | no disponible (modelo multimodal, probablemente inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura π0.5, un VLA que combina un modelo de lenguaje multimodal (VLM) con un experto de acción (action expert) para generar comandos de control robótico. En este fine-tuning, todos los parámetros son entrenables: la torre de visión, el proyector multimodal, el modelo de lenguaje y el experto de acción. El entrenamiento se realizó sobre la mezcla `base4` (949 episodios, 900 de entrenamiento y 49 de validación, 8 tareas, 3 cámaras, 50 Hz) con acciones relativas: los objetivos son `action[t+k] - state[anchor]`, con un ancla por chunk, y el gripper se mantiene absoluto (`relative_exclude_joints=['gripper']`).

La configuración de entrenamiento incluye: chunk size 50, n_action_steps 10, n_obs_steps 1, gradient checkpointing activado, compilación del modelo, dtype bfloat16, learning rate 2.5e-5 con warmup de 1000 pasos y decaimiento coseno a 2.5e-6 en 30K pasos. La torre de visión y el proyector usan un multiplicador de 0.1x (2.5e-6). El batch efectivo es de 63 (21 por rank × 3 GPUs) con DDP y semilla 1000. El autor señala que el paso 5000 es el mejor en loss de validación (0.0286) y que el entrenamiento hasta 30K provoca sobreajuste; el loss de entrenamiento cae a ~0.008 mientras el de validación sube progresivamente.

## Capacidades

- Control robótico end-to-end: genera acciones de movimiento del end-effector (pose 13D con rotación 6D) a partir de observaciones de cámara y estado del robot.
- Acciones relativas: predice desplazamientos relativos respecto a un ancla por chunk, lo que mejora la estabilidad en tareas de manipulación.
- Multi-tarea: entrenado en 8 tareas distintas con 3 cámaras, lo que permite cierta generalización entre escenarios.
- Integración con LeRobot: carga directa mediante `PreTrainedConfig` y `get_policy_class`, sin necesidad del dataset de entrenamiento.
- Normalización integrada: las estadísticas de normalización están incluidas en los pesos, por lo que el modelo puede desplegarse sin acceso al dataset original.
- No soporta tool calling, agentes conversacionales ni generación de texto general: es un modelo de política robótica, no un LLM de propósito general.

## Casos de uso

- Manipulación robótica en laboratorio: el modelo puede controlar un brazo robótico para tareas de pick-and-place, apilado o ensamblaje, usando las 3 cámaras para percibir el entorno y generando acciones relativas del end-effector a 50 Hz.
- Evaluación de estrategias de fine-tuning en VLA: este checkpoint sirve como referencia para comparar el rendimiento de fine-tuning completo frente a congelación del VLM, como hace el propio autor con la variante `frozen-vlm`.
- Investigación sobre sobreajuste en datasets pequeños: el análisis del autor muestra cómo un modelo de 4.14B parámetros memoriza 900 episodios en menos de media época, lo que es útil para estudiar regularización y early stopping en robótica.
- Desarrollo de políticas multi-tarea: al estar entrenado en 8 tareas, puede servir como punto de partida para transferencia a nuevas tareas con fine-tuning adicional.
- Benchmarking de hardware de inferencia: al ser un modelo de 4.14B parámetros en bfloat16, permite medir latencia y throughput en GPUs de consumo o profesionales para aplicaciones de control en tiempo real.
- Reproducción de experimentos: el repositorio incluye `train_config.json` con la configuración completa, lo que permite reproducir el entrenamiento (con el commit `fbb811fc` de LeRobot) o cargar el modelo para inferencia sin modificaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este modelo, ya que es un modelo de robótica, no de lenguaje general. El autor proporciona únicamente el held-out loss durante el entrenamiento, que se presenta a continuación:

| Paso | Held-out loss |
|---|---:|
| 5K | 0.0286 (mejor) |
| 10K | 0.0293 |
| 15K | 0.0312 |
| 20K | 0.0346 |
| 25K | 0.0375 |
| 30K | 0.0388 |

Comparación con la variante con VLM congelado:

| Modelo | Held-out loss |
|---|---|
| Este modelo (full FT, step 5000) | 0.0286 |
| Frozen VLM (step 30000) | 0.0283 |

El autor concluye que el fine-tuning completo es 1.1% peor que la variante congelada, a pesar de entrenar 6 veces más parámetros.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 4.143.404.816 parámetros en bfloat16, lo que supone ~8.3 GB solo en pesos. Con overhead de activaciones y buffers, se recomienda al menos 12-16 GB de VRAM para inferencia en tiempo real.
- GPU recomendadas: una RTX 4090 (24 GB) o A100 (40 GB) son suficientes para inferencia. Para entrenamiento, el autor usó 3 GPUs (no especifica el modelo, pero por el batch de 21 por rank, probablemente A100 o similar).
- Compatibilidad con GPUs de consumo: sí, una RTX 3090 o 4090 puede ejecutar el modelo en bfloat16, aunque la latencia dependerá de la frecuencia de control (50 Hz).
- Opciones de despliegue: LeRobot (carga nativa), y potencialmente vLLM o TGI si se adapta, aunque no hay soporte oficial documentado. Para inferencia en tiempo real, se recomienda usar el pipeline de LeRobot con `make_pre_post_processors`.
- Latencia y throughput: no disponible en la información proporcionada. Dado el tamaño y la arquitectura, se espera una latencia de decenas de milisegundos en GPUs modernas, pero no hay datos medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Held-out loss | Licencia | Disponibilidad |
|---|---|---|---|---|
| `maskjp/pi05-relative-eef-full-ft` (este) | 4.14B | 0.0286 (step 5K) | Apache-2.0 | HuggingFace |
| `maskjp/pi05-relative-eef-frozen-vlm` | 693M | 0.0283 (step 30K) | Apache-2.0 | HuggingFace |
| `lerobot/pi05_base` | no disponible | no disponible | Apache-2.0 | HuggingFace |

La variante congelada es más ligera, entrena más rápido y obtiene mejor held-out loss, lo que la hace más adecuada para la mayoría de casos prácticos. El modelo base `pi05_base` es el punto de partida y no está fine-tuneado para tareas específicas.

## Limitaciones y advertencias

- Sobreajuste severo: el modelo memoriza el dataset de entrenamiento (900 episodios) en menos de media época; el held-out loss empeora después del paso 5000, por lo que no es recomendable usar el checkpoint de 30K.
- Rendimiento inferior a la variante congelada: el fine-tuning completo no aporta ventajas y es ligeramente peor en validación, según el propio autor.
- Sensibilidad a cámaras no medida: el autor no ha evaluado la sensibilidad al cambio de cámara para este modelo; en la variante congelada, la sensibilidad es muy baja (0.088-0.091), lo que sugiere que el modelo ignora en gran medida las cámaras. No se sabe si el fine-tuning completo cambia esto.
- Dependencia de la configuración: el `config.json` subido difiere del de entrenamiento (se eliminó `vision_encoder_lr_multiplier`), pero esto no afecta a la inferencia. Para reproducir el entrenamiento se necesita un commit específico de LeRobot.
- Despliegue sin dataset: aunque es posible cargar el modelo sin el dataset de entrenamiento, hay que evitar `make_policy(cfg, ds_meta=...)` porque sobrescribe `action_feature_names`; se debe usar el método directo con `PreTrainedConfig`.
- No es un modelo de propósito general: no genera texto, no tiene tool calling ni capacidades conversacionales; está estrictamente limitado a control robótico.
- Idiomas y contexto: no se especifican idiomas soportados ni longitud de contexto; el modelo es multimodal y probablemente funcione con instrucciones en inglés, pero no está documentado.

## Enlaces

- Repositorio del modelo: https://huggingface.co/maskjp/pi05-relative-eef-full-ft
- Variante con VLM congelado: https://huggingface.co/maskjp/pi05-relative-eef-frozen-vlm
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Paper de π0.5: https://www.pi.website/download/pi05.pdf
- Código de LeRobot con soporte para acciones relativas en π0.5: https://github.com/ZhenghaoFei/lerobot-umi-relative-ee/tree/main/src/lerobot/policies/pi05
- Repositorio alternativo con soporte similar: https://github.com/goshanchk/Cobot-Magic-Finetune/tree/main/lerobot/src/lerobot/policies/pi05
