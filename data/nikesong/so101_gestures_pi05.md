# NikeSong/so101_gestures_pi05

## Resumen

NikeSong/so101_gestures_pi05 es un ajuste fino (fine-tuning) del modelo vision-language-action π₀.₅ (Pi0.5) de Physical Intelligence, implementado sobre la librería LeRobot de Hugging Face. Concretamente, parte de `lerobot/pi05_base` y se especializa en una tarea de teleoperación multi-gesto sobre el brazo robótico SO-101: saludar con la mano, bailar y levantarse. El modelo no es un LLM de propósito general, sino una política robótica que mapea observaciones (estado articular de 6 dimensiones e imágenes de dos cámaras) a acciones motoras de 6 dimensiones.

La arquitectura subyacente combina un backbone vision-language PaliGemma de aproximadamente 2B de parámetros con un "action expert" de unos 300M de parámetros, sumando un total de 3.616.757.520 parámetros según los pesos safetensors publicados. El ajuste es de tipo *expert-only*: se congelan el codificador visual y el VLM, y solo se actualizan el experto de acción y las proyecciones asociadas, lo que reduce drásticamente el coste de entrenamiento y el riesgo de olvido catastrófico en las capacidades perceptivas.

Su relevancia es doble. Por un lado, demuestra un flujo de trabajo reproducible de ajuste de π₀.₅ sobre un robot de bajo coste (SO-101) con un dataset pequeño (~150 episodios, ~72k frames), útil para laboratorios que quieran adaptar políticas VLA a hardware asequible. Por otro, sirve como referencia de configuración de entrenamiento (bfloat16, gradient checkpointing, AdamW con cosine decay) para quien quiera replicar el pipeline con LeRobot 0.4.1. La licencia Apache-2.0 facilita su reutilización, aunque el autor advierte que no se han publicado tasas de éxito en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA): backbone PaliGemma 2B + action expert ~300M, política `pi05` de LeRobot |
| Parametros totales | 3.616.757.520 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política robótica; ventana de observación definida por el dataset, no por tokens de texto) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | no disponible (el modelo no está orientado a generación de texto libre) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json`, `train_config.json`, preprocessor/postprocessor |

## Arquitectura y entrenamiento

El modelo es una política π₀.₅ (Pi0.5) implementada en LeRobot. La arquitectura combina un backbone vision-language PaliGemma de aproximadamente 2B de parámetros con un módulo "action expert" de unos 300M que genera bloques de acciones (action chunks) mediante un proceso de difusión/flow matching con 10 pasos de inferencia. Las observaciones de entrada son el estado articular (`observation.state`, vector de 6 dimensiones) y dos imágenes (`observation.images.front` y `observation.images.wrist`, 3×480×640 que se reescalan a 224×224 dentro de la política). La salida es un vector de acción de 6 dimensiones, con `chunk_size=50` y `n_action_steps=50`.

El entrenamiento se realizó sobre el dataset `NikeSong/so101_gestures` (LeRobot Dataset v3, tres tareas combinadas: saludar, bailar y levantarse), con aproximadamente 150 episodios y ~72k frames, lo que supone unas 3,3 épocas. Se usó `train_expert_only=true` y `freeze_vision_encoder=true`, es decir, solo se actualizan el experto de acción y las proyecciones relacionadas. La optimización empleó AdamW con learning rate 2.5e-5, cosine decay con warmup de 1000 pasos y decaimiento hasta 2.5e-6, batch size de 8 y 30.000 pasos, en precisión bfloat16 con gradient checkpointing sobre una NVIDIA L40 de 48 GB. La normalización es IDENTITY para las imágenes y QUANTILES para estado y acción. El loss offline pasó de ~0.17 al inicio a ~0.04 al final, sin NaN, lo que indica un proceso de optimización saludable pero no constituye una medida de éxito en robot real.

## Capacidades

- Control robótico de imitación: genera secuencias de acciones de 6 dimensiones para el brazo SO-101 a partir de observaciones visuales y de estado articular.
- Ejecución de gestos aprendidos: saludo con la mano, baile y acción de levantarse, entrenados conjuntamente en un único checkpoint.
- Percepción visual multi-cámara: procesa simultáneamente una vista frontal y una vista de muñeca (wrist).
- Generación de bloques de acción (action chunking) de 50 pasos con 10 pasos de denoising por inferencia.
- Integración con el ecosistema LeRobot: carga mediante `PreTrainedConfig.from_pretrained` y `make_policy`, y ejecución con `lerobot-eval`.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento textual: es una política motora, no un modelo conversacional.
- Capacidades multilingües: no aplicables; el modelo no genera lenguaje natural de forma expuesta.

## Casos de uso

- Teleoperación asistida en laboratorio: replicar los gestos de saludo, baile y levantamiento sobre un SO-101 para validar pipelines de imitación antes de escalar a tareas más complejas, aprovechando que el checkpoint ya está entrenado sobre esas tres tareas.
- Base para ajuste fino adicional: al estar construido sobre `lerobot/pi05_base` y usar solo el experto de acción, sirve como punto de partida para añadir nuevos gestos con datasets pequeños, manteniendo congelado el VLM.
- Docencia y divulgación en robótica de imitación: ejemplo reproducible de extremo a extremo (dataset v3, LeRobot 0.4.1, comando `lerobot-train`) para cursos sobre VLA y hardware de bajo coste.
- Evaluación comparativa de estrategias de congelación: permite contrastar *expert-only* frente a ajuste completo en términos de generalización a escenas nuevas, con una configuración documentada y un `train_config.json` disponible.
- Pruebas de integración de LeRobot en producción: validar el ciclo `lerobot-eval` + preprocessor/postprocessor (incluidas estadísticas de normalización por cuantiles) en un robot real antes de desplegar políticas más críticas.
- Investigación en chunking de acciones: estudiar el efecto de `chunk_size=50` y `num_inference_steps=10` sobre la suavidad y latencia del control en un brazo de 6 grados de libertad.
- Replicación de experimentos: regenerar el entrenamiento con la semilla 1000 y 30.000 pasos para verificar la reproducibilidad del loss reportado (~0.17 → ~0.04).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que solo se registra el loss offline de entrenamiento (de ~0.17 a ~0.04) y que no se incluye una tabla estandarizada de tasas de éxito en robot real. Cualquier cifra de éxito deberá obtenerse mediante evaluación propia con `lerobot-eval`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento se realizó en una NVIDIA L40 de 48 GB con bfloat16 y gradient checkpointing, por lo que la inferencia requiere bastante menos, pero no se documenta una cifra concreta.
- GPU recomendadas: NVIDIA L40 (usada en entrenamiento); por tamaño de pesos (~3,6B parámetros) se espera que quepa en GPUs de 24 GB en bfloat16 y en GPUs consumer de 16 GB con cuantización, aunque esto no está verificado en la información disponible.
- ¿Cabe en GPU consumer? Probable en RTX 4090 (24 GB) en bfloat16; en GPUs de 8-12 GB requeriría cuantización no documentada por el autor.
- Opciones de despliegue: LeRobot (`lerobot-eval`, `make_policy`, `make_pre_post_processors`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este tipo de política.
- Latencia y throughput: no disponibles. La inferencia usa 10 pasos de denoising por bloque de 50 acciones, lo que condiciona la latencia de control, pero no se publican medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NikeSong/so101_gestures_pi05 | 3,62B (VLM 2B + experto ~300M) | no aplica (política) | VLA para SO-101, 3 gestos | Apache-2.0 | Hugging Face (6 descargas) |
| lerobot/pi05_base | ~3,6B (misma base) | no aplica (política) | VLA base π₀.₅, propósito general | según base (no verificada aquí) | Hugging Face |
| π₀.₅ de Physical Intelligence (OpenPI) | ~3,6B | no aplica (política) | VLA generalista | según OpenPI (no verificada aquí) | OpenPI / blog |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, tarea y licencia.

## Limitaciones y advertencias

- El ajuste *expert-only* generaliza peor a escenas y comandos nuevos que un ajuste completo; el propio autor lo advierte.
- No hay evaluación en robot real publicada: el loss de entrenamiento no equivale a tasa de éxito.
- Requiere coincidencia estricta de configuración: nombres de cámara (`front`/`wrist`), resolución 480×640, orden de articulaciones y vector de estado/acción de 6 dimensiones.
- Posible incompatibilidad de preprocessor si la versión local de LeRobot difiere de la 0.4.1 usada en entrenamiento (pasos de registry ausentes).
- Riesgo de sobreajuste al dataset pequeño (~150 episodios, ~72k frames, 3,3 épocas).
- Licencia Apache-2.0 en los pesos, pero el autor indica que, si entra en conflicto con los términos del modelo base (`lerobot/pi05_base` / π₀.₅ de Physical Intelligence), prevalecen los del base; conviene verificar antes de uso comercial.
- No apto para generación de texto, razonamiento ni tareas conversacionales; no debe evaluarse con benchmarks tipo MMLU o HumanEval.
- Sesgos conocidos: no documentados; al ser una política entrenada con teleoperación de un operador concreto, puede heredar sesgos de estilo y velocidad de movimiento del demostrador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NikeSong/so101_gestures_pi05
- Dataset de entrenamiento: https://huggingface.co/datasets/NikeSong/so101_gestures
- Colección del proyecto SO-101 Gestures: https://huggingface.co/collections/NikeSong/so-101-gestures-6ae5b75468c02fe9f5560be7
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
