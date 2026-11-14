# dddddsds31341/FastWAM-Sweep-Trash-IOReset-Epoch-2

## Resumen

FastWAM Sweep Trash — IO reset, Epoch 2 es un checkpoint de evaluación de un modelo de política robótica (vision-language-action, VLA) desarrollado por el usuario dddddsds31341. Se trata de un fine-tune del modelo generativo de vídeo Wan-AI/Wan2.2-TI2V-5B adaptado a la manipulación bimanual mediante la arquitectura FastWAM, que combina un experto de vídeo con un transformer de acciones para predecir directamente trozos de acciones de 32 pasos a partir de observaciones visuales e instrucciones en lenguaje natural.

El modelo está especializado en una única tarea: una instrucción concreta de barrido con recogedor y cepillo, ejecutada por un robot bimanual Agilex PiPER. El entrenamiento se realizó sobre 100 demostraciones (48.495 fotogramas a 30 Hz) del dataset `yuyingyinya/sweep_trash`, con tres cámaras RGB y acciones de 14 dimensiones (6 articulaciones + pinza por brazo). Este checkpoint corresponde al epoch 2 de 6, paso de optimizador 4850.

Es relevante como ejemplo de reutilización de un modelo de generación de vídeo como base para políticas robóticas, así como por su documentación explícita sobre contratos de inferencia, normalización y limitaciones. No obstante, se trata de un artefacto de investigación sin validación en bucle cerrado publicada ni métricas de éxito en tarea real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastWAM: experto de vídeo (basado en Wan2.2-TI2V-5B) + transformer experto de acciones, con encoder de acciones, action head y encoder de propriocepción |
| Parametros totales | no disponible (el modelo base Wan2.2-TI2V-5B tiene ~5B, pero el total del conjunto FastWAM no se especifica) |
| Parametros activos | no disponible |
| Longitud de contexto | 128 tokens para la instrucción de tarea (embeddings UMT5 cacheados); 9 fotogramas de vídeo por muestra |
| Tipos de cuantizacion | no disponible (pesos almacenados en BF16) |
| Idiomas soportados | no disponible (instrucción de tarea en inglés en el ejemplo) |
| Licencia | other |
| Formato de pesos | `model.pt` (PyTorch, BF16) |

## Arquitectura y entrenamiento

FastWAM es una arquitectura híbrida que acopla un experto de vídeo generativo con un transformer de acciones. El experto de vídeo y el transformer de acciones parten del checkpoint preentrenado FastWAM Optional-IDM Songling (paso 45.000, no público). El encoder de acciones, la action head y el encoder de propriocepción se reinicializan con semilla 42, porque las estadísticas de normalización del checkpoint original colapsaban 9 de las 14 dimensiones de acción/estado y no ofrecían un mapeo utilizable para los rangos articulares de este robot.

El entrenamiento usó 100 demostraciones y 48.495 fotogramas a 30 Hz, con cuatro GPU A800, batch global de 20, learning rate constante de 1e-5, AdamW con weight decay 0.01, clipping de norma global 1.0, BF16 y DeepSpeed ZeRO-1. Se realizaron 2.425 actualizaciones por epoch (6 epochs, 14.550 actualizaciones en total). Cada muestra combina tres cámaras RGB (`top_head`, `hand_left`, `hand_right`) redimensionadas a 224×224 y concatenadas horizontalmente a 224×672, 9 fotogramas de vídeo y un trozo de 32 pasos de acción. Las pérdidas de denoising de vídeo y de acción tienen el mismo peso, con `action_idm_prob` de 0.5. Las acciones son objetivos articulares absolutos de 14 dimensiones en radianes (6 articulaciones + pinza por brazo, pinzas como fracción de apertura sobre 0.08 m).

## Capacidades

- Generación de vídeo futuro condicionada a observación e instrucción, seguida de predicción de acciones (modo `idm`).
- Predicción de trozos de acción de 32 pasos en un espacio de 14 dimensiones para robot bimanual Agilex PiPER.
- Comprensión de instrucciones de tarea en lenguaje natural (codificadas con UMT5, contexto de 128 tokens).
- Fusión de tres vistas RGB (cabeza y ambas manos) en una única entrada visual.
- Control bimanual coordinado (dos brazos de 6 articulaciones más pinza cada uno).
- No se documenta soporte de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en políticas VLA basadas en modelos de vídeo: sirve como referencia reproducible para estudiar cómo un generador de vídeo preentrenado se adapta a control robótico, con configuración y contrato de inferencia documentados.
- Automatización de tareas de barrido bimanual: el modelo ejecuta la instrucción específica de sujetar el recogedor con una pinza y barrer con la otra, adecuado para entornos de laboratorio con el robot Agilex PiPER.
- Evaluación de estrategias de inicialización: al existir un gemelo con inicialización "fresh IDM", permite comparar el efecto de reinicializar capas de acción frente a partir de cero en las mismas condiciones de datos.
- Reproducción de experimentos de fine-tuning: los archivos `config.yaml`, `dataset_stats.json` e `inference_contract.json` permiten replicar la normalización y el pipeline de inferencia en otra máquina.
- Prototipado de pipelines de inferencia en dos etapas (vídeo y luego acción): útil para medir latencia y viabilidad de despliegue con 20 pasos de inferencia.
- Docencia y divulgación sobre contratos de despliegue robótico: el repositorio ejemplifica los requisitos de normalización, orden articular y estadísticas que deben acompañar a un checkpoint para que sea utilizable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reporta tasa de éxito en bucle cerrado ni resultado de validación en conjunto reservado, y que la pérdida de entrenamiento no es una métrica de éxito en la tarea robótica.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 12,0 GB, lo que da una cota inferior orientativa para cargar los pesos en BF16.
- GPU de entrenamiento: 4× NVIDIA A800 (según la model card).
- GPU recomendadas para inferencia: no especificadas; por tamaño del modelo base (~5B) se requerirían GPU de datacenter o consumer de gama alta, pero no hay dato confirmado.
- ¿Cabe en GPU consumer?: no disponible.
- Opciones de despliegue: el propio código FastWAM (release v8, basado en `yuantianyuan01/FastWAM@7faa711` con cambios para PiPER); no es un modelo estándar de Transformers `from_pretrained`. Requiere además los pesos del VAE de Wan2.2-TI2V-5B (`DIFFSYNTH_MODEL_BASE_PATH`) y el encoder de texto y tokenizador UMT5 de Wan2.1.
- Latencia y throughput: no disponibles; la inferencia usa `action_infer_mode="idm"` con 20 pasos, primero vídeo y luego acción.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastWAM Sweep Trash — IO reset, Epoch 2 | no disponible (~5B base) | 128 tokens instrucción, 9 frames | Política VLA bimanual (barrido) | other | Checkpoint público en HF |
| FastWAM Sweep Trash — fresh IDM (gemelo) | no disponible | 128 tokens instrucción, 9 frames | Política VLA bimanual (barrido) | other | Mencionado en la model card, no enlazado en la información |
| Wan-AI/Wan2.2-TI2V-5B (base) | ~5B | no disponible | Generación de vídeo texto/imagen a vídeo | no disponible en esta ficha | Público en HF |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No se reporta tasa de éxito en robot real ni validación en conjunto reservado; la pérdida de entrenamiento no mide éxito en la tarea.
- El checkpoint es de evaluación (epoch 2 de 6) y no permite reanudar el entrenamiento exacto, ya que no incluye estado del optimizador ni del scheduler.
- Dependencia estricta de las estadísticas de normalización y del contrato de pinza de este mismo repositorio: usar estadísticas de otro checkpoint produce acciones incorrectas.
- La configuración conserva rutas del sistema de archivos de la máquina de entrenamiento y debe adaptarse.
- No es un modelo autónomo de Transformers; requiere el código FastWAM, el VAE de Wan2.2-TI2V-5B y el encoder UMT5 de Wan2.1.
- Especializado en una única tarea e instrucción; no se documenta generalización a otras tareas, objetos o entornos.
- Licencia "other": no se detallan los términos de uso comercial; debe consultarse antes de cualquier despliegue productivo.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Idiomas soportados: no disponibles; la instrucción de ejemplo está en inglés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/FastWAM-Sweep-Trash-IOReset-Epoch-2
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Dataset: https://huggingface.co/datasets/yuyingyinya/sweep_trash
- Repositorio de código base FastWAM: https://github.com/yuantianyuan01/FastWAM (referencia de commit `7faa711` citada en la model card)
