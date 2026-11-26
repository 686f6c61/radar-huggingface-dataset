# Bigwaverobotics/lerobot_ship_small_box

## Resumen

`lerobot_ship_small_box` es una política de control robótico entrenada mediante aprendizaje por imitación con el framework LeRobot de Hugging Face. Implementa la arquitectura ACT (Action Chunking with Transformers), un transformer que predice secuencias de acciones (chunks) a partir de observaciones visuales, con un backbone de visión ResNet-18. El modelo resuelve una tarea concreta de manipulación industrial: la manipulación y el envío de cajas pequeñas en un escenario de tipo "pick → place → pack → lift → ship".

El checkpoint tiene 51.637.904 parámetros (unos 51,6 M) y un tamaño de repositorio de 0,2 GB, con pesos en formato safetensors. No es un modelo de lenguaje: es una política de robótica que consume observaciones (imágenes y estado del robot) y emite acciones de control. Su relevancia es práctica: demuestra el flujo completo de entrenamiento y publicación de políticas ACT con LeRobot, con preprocesadores y postprocesadores de normalización incluidos en el repositorio.

La licencia es Apache-2.0, alineada con la del framework de entrenamiento LeRobot. El modelo se publicó el 26 de noviembre de 2026 y no registra descargas ni likes en el momento de redactar esta ficha. La model card no aporta datos sobre idiomas, benchmarks ni requisitos de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), backbone de visión ResNet-18 |
| Parametros totales | 51.637.904 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; `n_obs_steps` = 1, `chunk_size` = 50) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin interfaz de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 197,0 MiB) |

Parámetros adicionales de configuración:

| Parametro | Valor |
|---|---|
| Tipo de política | `act` |
| `chunk_size` | 50 |
| `n_obs_steps` | 1 |
| `policy_n_action_steps` | 50 |
| Backbone de visión | `resnet18` |
| Dataset de entrenamiento | `itdevhumanoid/lerobot_ship_small_box_dataset` (referencia en config: `bwr/dataset_21346`) |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

La política sigue la arquitectura ACT, introducida en el trabajo *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware* (Zhao et al., 2023). Un encoder de visión ResNet-18 procesa la observación (con `n_obs_steps` = 1, es decir, un único paso de observación por inferencia) y un transformer decodifica un chunk de 50 acciones de forma conjunta. Predecir secuencias de acciones en lugar de acciones individuales reduce el error de compounding y mejora la estabilidad del control, a costa de una menor reactividad ante cambios bruscos del entorno.

El entrenamiento es de imitación supervisada (behavior cloning) sobre el dataset `itdevhumanoid/lerobot_ship_small_box_dataset`, con normalización de observaciones y acciones implementada mediante los procesadores incluidos en el repositorio (`policy_preprocessor_step_3_normalizer_processor.safetensors` y `policy_postprocessor_step_0_unnormalizer_processor.safetensors`). No se documenta en la información disponible el número de episodios, la composición del dataset, ni si hubo etapas de refinamiento posteriores (RLHF/DPO no aplica en este dominio). Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control robótico por imitación para la tarea de manipulación y envío de cajas pequeñas.
- Predicción de chunks de 50 acciones a partir de una observación visual única.
- Procesamiento de observaciones visuales mediante backbone ResNet-18.
- Pipeline de preprocesado y postprocesado integrado (normalización y desnormalización de observaciones y acciones).
- Integración nativa con el ecosistema LeRobot (`ACTPolicy.from_pretrained`).
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No dispone de capacidades multilingües, de visión general, de audio ni de modo "thinking".
- No se documentan capacidades de generalización a otras tareas distintas de la entrenada.

## Casos de uso

- Automatización de línea de empaquetado: la política puede ejecutar la secuencia de recogida y envío de cajas pequeñas en una celda industrial, sustituyendo la programación explícita de trayectorias por una política aprendida a partir de demostraciones.
- Prototipado rápido de tareas de manipulación: servir como punto de partida para equipos que quieran replicar el flujo de entrenamiento ACT con LeRobot y adaptarlo a su propio hardware y dataset.
- Investigación en aprendizaje por imitación: el checkpoint y sus procesadores permiten estudiar el comportamiento de ACT con `chunk_size` = 50 y `n_obs_steps` = 1 en una tarea industrial concreta.
- Benchmark de referencia interna: comparar el rendimiento de nuevas políticas (por ejemplo, variantes de ACT o Diffusion Policy) contra esta línea base en la misma tarea de envío de cajas.
- Evaluación de robustez visual: al usar ResNet-18 como encoder, es útil para medir cómo afectan cambios de iluminación, oclusiones o fondos distintos al rendimiento de la política en un entorno de laboratorio.
- Formación y demostraciones: útil en entornos docentes para ilustrar el ciclo completo de captura de datos, entrenamiento con LeRobot y despliegue de una política ACT en un robot real o simulado.
- Integración en pipelines de datos sintéticos: el modelo puede emplearse para generar etiquetas de acción en episodios simulados y ampliar el dataset de entrenamiento de políticas posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 51,6 M de parámetros y pesos en FP32 (197 MiB), la huella en memoria es reducida, pero no se documenta el consumo real en el robot ni en GPU.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por el tamaño del checkpoint es plausible que quepa en GPUs de consumo, pero el autor no lo confirma.
- Opciones de despliegue: LeRobot (`lerobot.policies.act.modeling_act.ACTPolicy.from_pretrained`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto / chunk | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Bigwaverobotics/lerobot_ship_small_box` | ACT + ResNet-18 | 51,6 M | `chunk_size` = 50, `n_obs_steps` = 1 | Apache-2.0 | Hugging Face |
| Otras políticas ACT de LeRobot | ACT | no disponible | no disponible | Apache-2.0 (framework) | Hugging Face |
| Diffusion Policy (referencia) | Difusión para acciones | no disponible | no disponible | no disponible | Repositorios de investigación |
| OpenVLA (referencia) | VLA basado en LLM | no disponible | no disponible | no disponible | Repositorios de investigación |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo específico de una única tarea: no está pensado para generalizar a otras tareas de manipulación sin reentrenamiento.
- Riesgo de sobreajuste al entorno de entrenamiento: cambios en la iluminación, la cámara, la posición de la caja o el robot pueden degradar el rendimiento.
- Sin datos de evaluación publicados: no hay métricas de éxito, robustez ni generalización en la información disponible.
- `n_obs_steps` = 1 implica que la política no mantiene memoria explícita de observaciones pasadas; la estabilidad depende del chunk de 50 acciones.
- El dataset de entrenamiento no está descrito en detalle (número de episodios, diversidad de escenarios, hardware utilizado), lo que dificulta evaluar su cobertura.
- La model card menciona rutas locales del autor (`/Users/mypark/...`) y referencias a repositorios hermanos no publicados; conviene verificar la reproducibilidad del entrenamiento.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en producción.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque el modelo no procesa lenguaje natural.

## Enlaces

- Hugging Face: https://huggingface.co/Bigwaverobotics/lerobot_ship_small_box
- Dataset de entrenamiento: https://huggingface.co/datasets/itdevhumanoid/lerobot_ship_small_box_dataset
- Framework LeRobot: https://github.com/huggingface/lerobot
- Paper de ACT (referencia de la arquitectura): https://arxiv.org/abs/2304.13705
- Repositorio de Diffusion Policy (alternativa): https://github.com/real-stanford/diffusion_policy
- OpenVLA (alternativa VLA): https://github.com/openvla/openvla
