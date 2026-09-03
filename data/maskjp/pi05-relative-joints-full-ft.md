# maskjp/pi05-relative-joints-full-ft

## Resumen

El modelo `maskjp/pi05-relative-joints-full-ft` es un fine-tuning completo del modelo base `lerobot/pi05_base`, un VLA (vision-language-action) de la familia π0.5 desarrollado por LeRobot. Este checkpoint concreto, publicado por el usuario maskjp, entrena los 4.143.404.816 parámetros del modelo (torre de visión, modelo de lenguaje y experto de acciones) sobre una mezcla multi-tarea de 949 episodios robóticos (8 tareas, 3 cámaras, 50 Hz). El objetivo es evaluar si descongelar toda la arquitectura mejora la generalización frente a la variante que congela el VLM, que solo entrena 693 millones de parámetros.

La relevancia de este modelo radica en que documenta de forma explícita un problema práctico del fine-tuning completo en robótica: con 4.14B parámetros y solo 900 episodios de entrenamiento, el modelo memoriza el conjunto de entrenamiento en menos de media época, y la pérdida en datos held-out alcanza su mínimo en el paso 10000 (0.0278) para luego degradarse hasta 0.0392 en el paso 30000. El autor sube el checkpoint del paso 10000, que supera en un 6.1% a la variante con VLM congelado (0.0296), pero advierte que el horario completo de 30000 pasos es incorrecto para este tipo de fine-tuning. El modelo se distribuye bajo licencia Apache-2.0 y está pensado para ser cargado con la librería LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA π0.5 (vision-language-action) con torre de visión, proyector multimodal, modelo de lenguaje y experto de acciones |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (procesa observaciones de imagen y lenguaje, sin especificación de tokens de texto) |
| Tipos de cuantizacion | no disponible (entrenado en bfloat16; no se publican cuantizaciones alternativas) |
| Idiomas soportados | no disponible (presumiblemente inglés, no confirmado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (incluye config.json, train_config.json, normalizador y meta/) |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base`, un VLA basado en la arquitectura π0.5 descrita en el paper "π: a Vision-Language-Action Model with Open-World Generalization". La arquitectura combina una torre de visión, un proyector multimodal, un modelo de lenguaje y un experto de acciones. En este fine-tuning, todos los parámetros son entrenables, a diferencia de la variante `frozen-vlm` del mismo autor que congela el VLM.

El entrenamiento se realizó sobre la mezcla `base4` de 949 episodios (900 de entrenamiento, 49 held-out) con 8 tareas, 3 cámaras y una frecuencia de 50 Hz. Se usó un chunk size de 50 pasos, 10 pasos de acción y 1 paso de observación. Las acciones son relativas: `action[t+k] - state[anchor]`, con un ancla por chunk, y el gripper se mantiene en coordenadas absolutas (`relative_exclude_joints=['gripper']`). El optimizador usó learning rate 2.5e-5 con warmup de 1000 pasos y decaimiento coseno a 2.5e-6, mientras que la torre de visión y el proyector usaron un multiplicador de 0.1x (2.5e-6). Se empleó gradient checkpointing, compilación del modelo, dtype bfloat16, batch efectivo de 63 (21 por rango × 3 GPUs) con DDP y seed 1000. La normalización usa identidad visual, cuantiles para estado y cuantiles para acciones.

Un detalle técnico relevante: el `config.json` subido elimina el campo `vision_encoder_lr_multiplier` porque la versión stock de LeRobot 0.6.2 no lo reconoce y draccus rechaza claves desconocidas. Ese campo solo afecta al entrenamiento, no a la inferencia, y queda registrado en `train_config.json`.

## Capacidades

- Control robótico end-to-end: genera comandos de articulaciones (10 dimensiones de motor) a partir de observaciones de cámara e instrucciones de lenguaje.
- Acciones relativas en espacio articular: aprende offsets respecto al estado actual del robot, lo que puede mejorar la generalización frente a posiciones absolutas.
- Multi-tarea: entrenado en 8 tareas distintas con 3 cámaras, lo que permite evaluar transferencia entre tareas.
- Seguimiento de instrucciones en lenguaje natural: al ser un VLA, interpreta comandos textuales para guiar la manipulación.
- Integración con LeRobot: carga directa mediante `PreTrainedConfig` y `get_policy_class`, con normalización incluida en el repositorio.
- No soporta tool calling, agentes conversacionales ni generación de texto general: es un modelo de política robótica, no un chatbot.

## Casos de uso

- Manipulación robótica en laboratorio: el modelo puede controlar un brazo robótico para tareas de recogida y colocación, apilado o ensamblaje, usando las 3 cámaras para percibir la escena y las instrucciones en lenguaje para seleccionar la tarea.
- Evaluación de fine-tuning en robótica: sirve como punto de referencia para estudiar el efecto de descongelar todos los parámetros frente a congelar el VLM, especialmente con datasets pequeños (900 episodios).
- Investigación sobre sobreajuste en VLA: el análisis de pérdida held-out por paso (mínimo en 10K) lo convierte en un caso de estudio para determinar horarios de entrenamiento óptimos en fine-tuning completo.
- Despliegue en robots con LeRobot: el repositorio incluye normalizadores y configuración para cargar el modelo sin necesidad del dataset original, usando `make_pre_post_processors` y evitando `make_policy` con `ds_meta` no nulo.
- Comparación de representaciones de acción: al usar acciones relativas con gripper absoluto, permite evaluar si esta formulación mejora la precisión frente a acciones absolutas en tareas de manipulación fina.
- Transferencia a nuevos entornos: aunque la sensibilidad a cambios de cámara no está medida para este checkpoint, el modelo puede probarse en configuraciones de cámara similares para estudiar robustez perceptual.

## Benchmarks y rendimiento

La model card no reporta benchmarks estándar de robótica (como éxito en tareas), pero sí proporciona la pérdida held-out durante el entrenamiento, que es una métrica de validación. Se presentan los datos disponibles:

| Paso | Pérdida held-out |
|---|---:|
| 5K | 0.0291 |
| 10K | 0.0278 (mejor) |
| 15K | 0.0309 |
| 20K | 0.0350 |
| 25K | 0.0382 |
| 30K | 0.0392 |

Comparación con la variante con VLM congelado:

| Modelo | Pérdida held-out |
|---|---|
| Este modelo (paso 10000) | 0.0278 |
| Frozen VLM (paso 30000) | 0.0296 |

La pérdida de entrenamiento desciende hasta ~0.008, lo que indica una fuerte memorización. No se publican métricas de éxito en tareas físicas ni resultados en benchmarks como RLBench o simulación.

## Requisitos de hardware

- Pesos en bfloat16: 4.143.404.816 parámetros × 2 bytes ≈ 8.29 GB solo para los pesos. Con overhead de activaciones, optimizador y buffers, se estima un mínimo de 12-16 GB de VRAM para inferencia en bfloat16.
- GPU recomendadas: para inferencia, una GPU con al menos 16 GB (RTX 4080/4090, A100 40GB, etc.) es suficiente. Para reproducir el entrenamiento se usaron 3 GPUs (no especificadas) con batch 21 por rango.
- En consumer GPU: sí, cabe en una RTX 4090 (24 GB) o similar con bfloat16, aunque no se han publicado cuantizaciones GGUF o de menor precisión.
- Opciones de despliegue: LeRobot es la vía principal, mediante `PreTrainedConfig.from_pretrained` y `get_policy_class`. No se menciona soporte para vLLM, TGI u Ollama, que son herramientas para modelos de lenguaje, no para políticas robóticas.
- Latencia y throughput: no disponibles. Depende del hardware y del tamaño de las observaciones de imagen.

## Comparativa con modelos similares

| Modelo | Parámetros entrenables | Contexto | Pérdida held-out | Licencia |
|---|---|---|---|---|
| `maskjp/pi05-relative-joints-full-ft` (este) | 4.14B (todos) | no disponible | 0.0278 (paso 10K) | Apache-2.0 |
| `maskjp/pi05-relative-joints-frozen-vlm` | 693M (solo experto) | no disponible | 0.0296 (paso 30K) | Apache-2.0 |
| `lerobot/pi05_base` | modelo base, sin fine-tuning | no disponible | no aplica | Apache-2.0 |

La comparativa se limita a las variantes del mismo autor porque no se dispone de datos de otros VLA de tamaño similar (como OpenVLA o π0) en la información proporcionada. La diferencia clave es el número de parámetros entrenables y el rendimiento en pérdida held-out, donde el fine-tuning completo gana solo si se detiene en el paso 10000.

## Limitaciones y advertencias

- Sobreajuste severo: con 4.14B parámetros y solo 900 episodios, el modelo memoriza el conjunto de entrenamiento (pérdida de train ~0.008) y la pérdida held-out empeora después del paso 10000. No es recomendable usar el checkpoint del paso 30000.
- Sensibilidad a cámaras no medida: el autor no ha evaluado este checkpoint en el test de cambio de cámara. En la variante frozen-VLM, la ratio de sensibilidad es 0.088-0.091, muy por debajo del umbral de 0.5, lo que sugiere que el modelo podría predecir acciones sin leer realmente las cámaras. No se sabe si descongelar la torre de visión corrige esto.
- Dependencia de la normalización: las estadísticas de normalización están incrustadas en el repositorio, pero si se usa `make_policy` con `ds_meta` no nulo, LeRobot sobrescribe `action_feature_names` y requiere el dataset original, que no está publicado. Hay que seguir el flujo recomendado en la model card.
- Riesgo de alucinación en acciones: como cualquier VLA, puede generar comandos de articulación incoherentes ante observaciones fuera de distribución, especialmente con cambios de iluminación, fondo o posición de cámara.
- Licencia Apache-2.0: permite uso comercial, pero el modelo se distribuye sin garantías y sin datos de seguridad para despliegue en robots reales.
- Sin benchmarks de tareas físicas: no hay evidencia de éxito en tareas reales más allá de la pérdida held-out, que es una métrica indirecta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maskjp/pi05-relative-joints-full-ft
- Variante con VLM congelado: https://huggingface.co/maskjp/pi05-relative-joints-frozen-vlm
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Paper de π0.5: https://www.pi.website/download/pi05.pdf
- Repo de LeRobot con soporte π0.5 (acciones relativas): https://github.com/WentingLi000/lerobot_f/tree/main/src/lerobot/policies/pi05
- Repo alternativo con soporte π0.5: https://github.com/ZhenghaoFei/lerobot-umi-relative-ee/tree/main/src/lerobot/policies/pi05
- Otro modelo del autor: https://huggingface.co/maskjp/pi05_piper
