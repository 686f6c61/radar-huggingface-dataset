# maskjp/pi05-relative-eef-full-ft-15k

## Resumen

Este repositorio contiene un checkpoint intermedio de un fine-tuning completo del modelo de robótica π₀.₅ (pi0.5), desarrollado por el usuario maskjp. Se trata de un artefacto de investigación publicado explícitamente para comparar la evolución de la pérdida en función del paso de entrenamiento, no como un modelo listo para producción. El autor advierte que este checkpoint (paso 15 000) no es el mejor de su ejecución: la pérdida en el conjunto de validación es un 9 % peor que la del paso 5000, que es el óptimo.

El modelo parte de `lerobot/pi05_base` y se ha ajustado con todos sus parámetros entrenables (4 143 404 816), incluyendo la torre de visión, el modelo de lenguaje y el experto de acciones. El entrenamiento se realizó sobre un conjunto multi-tarea de 949 episodios (900 de entrenamiento y 49 de validación) que abarca 8 tareas, 3 cámaras y una frecuencia de 50 Hz. La representación de acciones es relativa al estado del efector final, con una pose de 13 dimensiones que incluye rotación 6D, y el gripper se mantiene en coordenadas absolutas.

La relevancia de este checkpoint radica en que documenta empíricamente el fenómeno de sobreajuste en el fine-tuning completo de un VLA: la pérdida de entrenamiento cae hasta ~0.008 mientras que la pérdida de validación comienza a subir a partir del paso 5000. El autor concluye que el esquema de 30 000 pasos es inadecuado para este tipo de ajuste en este conjunto de datos, y recomienda el checkpoint de paso 5000 para cualquier despliegue real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en flujo, fine-tune completo de `lerobot/pi05_base` |
| Parametros totales | 4 143 404 816 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un VLA (vision-language-action) de tipo flujo, basado en la arquitectura π₀.₅ de Physical Intelligence, implementada en la librería LeRobot. En este checkpoint se ha realizado un fine-tuning completo: todos los parámetros (torre de visión, proyector multimodal, modelo de lenguaje y experto de acciones) son entrenables, sin congelar ninguna parte. El entrenamiento se llevó a cabo sobre un conjunto de 949 episodios (8 tareas, 3 cámaras, 50 Hz) con una configuración que incluye `chunk_size=50`, `n_action_steps=10`, `n_obs_steps=1`, `gradient_checkpointing=true`, `compile_model=true` y `dtype=bfloat16`. El optimizador usó una tasa de aprendizaje de 2.5e-5 con calentamiento de 1000 pasos y decaimiento coseno hasta 2.5e-6 en 30 000 pasos; la torre de visión y el proyector usaron un multiplicador de 0.1 (2.5e-6). La normalización emplea identidad visual, cuantiles de estado y cuantiles de acción. El entrenamiento se realizó con DDP en 3 GPUs, batch efectivo de 63.

Una particularidad importante es que el `config.json` subido difiere del usado en entrenamiento: se eliminó el campo `vision_encoder_lr_multiplier` porque no existe en la versión 0.6.2 de LeRobot y el cargador de configuraciones (draccus) rechaza claves desconocidas. Este campo solo afecta al cálculo de los parámetros del optimizador y no tiene efecto en inferencia. El archivo `train_config.json` conserva el valor original.

## Capacidades

- Control robótico de efector final con pose de 13 dimensiones (posición 3D + rotación 6D) y acciones relativas al estado del robot.
- Soporte de múltiples tareas (8 tareas en el conjunto de entrenamiento) con observaciones de 3 cámaras.
- Inferencia a 50 Hz, adecuada para control en tiempo real.
- Representación de acciones relativas por chunk: `action[t+k] - state[anchor]`, con un ancla por chunk y adición posterior a la inferencia. El gripper se mantiene en coordenadas absolutas (`relative_exclude_joints=['gripper']`).
- Despliegue sin necesidad del dataset de entrenamiento: las estadísticas de normalización están incluidas en `policy_preprocessor_step_3_normalizer_processor.safetensors` y los nombres de características de acción en `config.json`.
- No se reportan capacidades de tool calling, agentes ni razonamiento multi-paso fuera del ámbito robótico.

## Casos de uso

- Investigación sobre sobreajuste en fine-tuning de VLA: este checkpoint permite estudiar cómo la pérdida de validación empeora a medida que avanza el entrenamiento, y comparar con el checkpoint de paso 5000 (óptimo) y el de paso 30 000 (final).
- Comparación de estrategias de ajuste: sirve como referencia para contrastar el fine-tuning completo (todos los parámetros entrenables) con el enfoque de VLM congelado (693M parámetros entrenables) que no presenta sobreajuste.
- Análisis de la curva de pérdida: los datos de pérdida por paso (5K a 30K) permiten evaluar la dinámica de generalización y el punto de inflexión del sobreajuste.
- Reproducción de experimentos de robótica: al ser un checkpoint intermedio, puede usarse para reproducir los resultados reportados en la model card y verificar la metodología.
- Estudio de la representación de acciones relativas: el modelo emplea acciones relativas al estado del efector, lo que puede ser de interés para investigar el impacto de esta representación en el rendimiento.
- Desarrollo de pipelines de despliegue: aunque no es el checkpoint recomendado, el código de inferencia proporcionado (sin necesidad de dataset) puede servir como plantilla para integrar modelos π₀.₅ en sistemas robóticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este modelo, al tratarse de un VLA de robótica. La model card reporta la pérdida en el conjunto de validación (held-out loss) para cada paso de entrenamiento:

| Paso | Pérdida held-out |
|---:|---:|
| 5K | 0.0286 |
| 10K | 0.0293 |
| 15K | 0.0312 |
| 20K | 0.0346 |
| 25K | 0.0375 |
| 30K | 0.0388 |

La pérdida de entrenamiento cae a ~0.008 a lo largo de todo el entrenamiento, mientras que la de validación sube a partir del paso 5000. El checkpoint de paso 15K es un 24 % mejor que el de 30K, pero un 9 % peor que el de 5K. No se proporcionan métricas de éxito en tareas robóticas.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware para inferencia.
- Dado que el modelo tiene 4 143 404 816 parámetros y se usa en bfloat16, los pesos ocupan aproximadamente 8.3 GB. Con overhead de activaciones y memoria de trabajo, se estima que se necesita una GPU con al menos 16 GB de VRAM para una inferencia cómoda (estimación razonable, no un dato oficial).
- El entrenamiento se realizó con 3 GPUs (no se especifica el modelo) con batch 21 por GPU y DDP.
- Para despliegue, se puede usar la API de LeRobot (código de ejemplo en la model card) o cualquier framework compatible con safetensors y la arquitectura π₀.₅ (por ejemplo, vLLM no es aplicable directamente; se recomienda el stack de LeRobot).
- No se reportan datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros entrenables | Pérdida held-out (mejor) | Observaciones |
|---|---|---|---|
| `maskjp/pi05-relative-eef-full-ft-15k` (este) | 4 143 404 816 (todos) | 0.0312 (paso 15K) | Checkpoint intermedio, sobreajustado |
| `maskjp/pi05-relative-eef-full-ft` (paso 5K) | 4 143 404 816 (todos) | 0.0286 (paso 5K) | Mejor checkpoint del mismo run, recomendado para despliegue |
| `maskjp/pi05-relative-eef-frozen-vlm` | 693 000 000 (VLM congelado) | 0.0283 (paso 30K) | Sin sobreajuste, pérdida decreciente hasta el final |

La comparativa se basa en los datos de la model card. No se dispone de comparaciones con otros VLA como OpenVLA o RT-2 en este contexto.

## Limitaciones y advertencias

- Este checkpoint es un artefacto de investigación, no el mejor de su ejecución. El autor recomienda explícitamente usar el checkpoint de paso 5000 para cualquier despliegue real.
- El modelo presenta sobreajuste: la pérdida de validación empeora a partir del paso 5000, lo que indica que ha memorizado los 900 episodios de entrenamiento en menos de media época.
- La sensibilidad al cambio de cámara no se ha medido para este brazo. Los modelos con VLM congelado puntúan 0.088-0.091 en el ratio de sensibilidad, muy por debajo del umbral de 0.5, pero este dato no aplica a este checkpoint.
- El `config.json` difiere del usado en entrenamiento (se eliminó `vision_encoder_lr_multiplier`), aunque esto no afecta a la inferencia.
- No se reportan métricas de éxito en tareas robóticas reales, solo pérdida de validación.
- La licencia Apache-2.0 permite uso comercial, pero al ser un modelo de investigación con sobreajuste, no se recomienda para producción sin una evaluación adicional.
- No se dispone de información sobre idiomas soportados ni longitudes de contexto, ya que el modelo está orientado a robótica y no a procesamiento de lenguaje general.

## Enlaces

- [HuggingFace: maskjp/pi05-relative-eef-full-ft-15k](https://huggingface.co/maskjp/pi05-relative-eef-full-ft-15k)
- [HuggingFace: maskjp/pi05-relative-eef-full-ft (checkpoint recomendado)](https://huggingface.co/maskjp/pi05-relative-eef-full-ft)
- [HuggingFace: maskjp/pi05-relative-eef-frozen-vlm](https://huggingface.co/maskjp/pi05-relative-eef-frozen-vlm)
- [HuggingFace: lerobot/pi05_base](https://huggingface.co/lerobot/pi05_base)
- [GitHub: Physical-Intelligence/openpi](https://github.com/Physical-Intelligence/openpi)
- [GitHub: LeRobot - implementación de π₀.₅](https://github.com/huggingface/lerobot/tree/main/src/lerobot/policies/pi05)
