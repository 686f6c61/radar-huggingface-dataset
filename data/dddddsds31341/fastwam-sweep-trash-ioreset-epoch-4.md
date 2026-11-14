# dddddsds31341/FastWAM-Sweep-Trash-IOReset-Epoch-4

## Resumen

FastWAM-Sweep-Trash-IOReset-Epoch-4 es un checkpoint de evaluación de un modelo de política robótica (vision-language-action) desarrollado por el usuario dddddsds31341, derivado por fine-tuning del modelo base Wan-AI/Wan2.2-TI2V-5B. El modelo resuelve una tarea concreta de manipulación bimanual: usar un brazo robótico para sujetar un recogedor mientras el otro sujeta un cepillo y barre dos trozos de papel arrugado hacia el recogedor. Se trata de un ajuste fino sobre la arquitectura FastWAM, un modelo conjunto de vídeo y acción que primero predice el vídeo futuro y después genera un chunk de 32 acciones.

El checkpoint corresponde a la época 4 de 6 (paso de optimizador 9700) de un entrenamiento con inicialización "IO reset", en el que las capas de acción y propiocepción se reinicializan mientras el experto de vídeo y el transformer de acción parten del checkpoint pretrenado FastWAM Optional-IDM Songling. El modelo se entrenó con 100 demostraciones (48.495 fotogramas a 30 Hz) del dataset `yuyingyinya/sweep_trash`, usando cuatro GPUs A800.

Es relevante como ejemplo de adaptación de modelos generativos de vídeo a control robótico de precisión, con un contrato de inferencia estricto (14 dimensiones de articulaciones absolutas, tres cámaras RGB, normalización específica de la tarea). No obstante, es un artefacto de investigación sin validación en bucle cerrado publicada ni resultados de éxito en tarea real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastWAM: modelo conjunto de vídeo y acción (video expert + action-expert transformer) sobre Wan2.2-TI2V-5B |
| Parámetros totales | no disponible (modelo base Wan2.2-TI2V-5B; el checkpoint `model.pt` ocupa 12 GB en BF16) |
| Parámetros activos | no disponible |
| Longitud de contexto | 128 tokens para el embedding de instrucción (UMT5); 9 fotogramas de vídeo por muestra |
| Tipos de cuantización | no disponible (pesos almacenados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | `model.pt` (PyTorch, BF16), más `config.yaml`, `dataset_stats.json`, `inference_contract.json` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura FastWAM, que combina un experto de vídeo (derivado de Wan2.2-TI2V-5B, un modelo de generación texto-imagen-vídeo) con un transformer de acción y un codificador de propiocepción. En inferencia, el modelo primero predice el vídeo futuro y después genera un chunk de 32 acciones con `action_infer_mode="idm"` y 20 pasos de difusión. Las pérdidas de denoising de vídeo y acción tienen el mismo peso, y `action_idm_prob` es 0,5.

El entrenamiento partió del checkpoint pretrenado FastWAM Optional-IDM Songling (paso 45.000, no público) para el experto de vídeo y el transformer de acción; el codificador de acción, la cabeza de acción y el codificador de propiocepción se reinicializaron con semilla 42 porque las estadísticas de normalización del checkpoint original colapsaban 9 de las 14 dimensiones de acción/estado. Se usaron 100 demostraciones (48.495 fotogramas a 30 Hz) del dataset `yuyingyinya/sweep_trash`, cuatro GPUs A800, batch global 20, tasa de aprendizaje constante 1e-5, AdamW con weight decay 0,01, clipping de norma global 1,0, BF16 y DeepSpeed ZeRO-1. El entrenamiento completo consta de 6 épocas (14.550 actualizaciones); este checkpoint es la época 4 (9.700 actualizaciones). Las acciones son objetivos articulares absolutos de 14 dimensiones en radianes (izquierda: 6 articulaciones + pinza; derecha: 6 articulaciones + pinza), con pinzas como fracción de apertura sobre 0,08 m. Se emplean tres cámaras RGB (`top_head`, `hand_left`, `hand_right`) redimensionadas a 224×224 y concatenadas horizontalmente a 224×672.

## Capacidades

- Generación de vídeo futuro condicionada a la instrucción de tarea y a las observaciones de cámara.
- Predicción de chunks de acción de 32 pasos para control bimanual de un robot Agilex PiPER.
- Manipulación bimanual coordinada: sujeción de recogedor con una pinza y cepillo con la otra.
- Control de 14 dimensiones articulares absolutas (6+pinza por brazo) en radianes.
- Procesamiento de tres vistas RGB simultáneas (cabeza y ambas manos).
- Condicionamiento por instrucción en lenguaje natural mediante embeddings UMT5 (contexto de 128 tokens).
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni capacidades multilingües generales.

## Casos de uso

- Investigación en manipulación bimanual: el modelo sirve como referencia para estudiar la coordinación de dos brazos en tareas de barrido y recogida, con un contrato de acción y cámaras bien definido.
- Replicación de experimentos de fine-tuning VLA: permite reproducir el ajuste sobre el dataset `sweep_trash` y comparar la inicialización "IO reset" frente a "fresh IDM" con los mismos datos e hiperparámetros.
- Evaluación de políticas basadas en predicción de vídeo: útil para analizar si la predicción del vídeo futuro mejora la calidad del chunk de acciones en tareas de contacto.
- Desarrollo de adaptadores robóticos: el contrato de inferencia (orden de articulaciones, referencia de pinza, disposición de cámaras) sirve de plantilla para integrar FastWAM con robots Agilex PiPER.
- Estudio de normalización específica de tarea: el uso de `dataset_stats.json` y la reinicialización por colapso de dimensiones ofrece un caso documentado de por qué las estadísticas de normalización deben provenir del mismo checkpoint.
- Docencia y divulgación técnica: ejemplo didáctico de pipeline completo de entrenamiento distribuido (DeepSpeed ZeRO-1, BF16, cuatro A800) para modelos de acción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se reporta tasa de éxito en bucle cerrado ni resultado de validación en conjunto reservado, y que la pérdida de entrenamiento no es una métrica de éxito en la tarea robótica.

## Requisitos de hardware

- El checkpoint `model.pt` ocupa 12 GB en BF16; se requiere memoria suficiente para cargarlo junto con el VAE de Wan2.2-TI2V-5B, que se descarga por separado mediante `DIFFSYNTH_MODEL_BASE_PATH`.
- Se necesita además el codificador de texto UMT5 de Wan2.1 y su tokenizador para codificar la instrucción en despliegue.
- GPU recomendadas: no disponible de forma explícita; el entrenamiento usó cuatro A800. Para inferencia se precisa al menos una GPU con memoria suficiente para el modelo conjunto más el VAE (estimación no publicada).
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no es un modelo estándar de Transformers `from_pretrained`; requiere extraer `code.zip`, instalar el checkout de FastWAM incluido y construir el modelo con `hydra.utils.instantiate(cfg.model, ...)`, seguido de `model.load_checkpoint("model.pt")` y `model.infer_action(..., action_infer_mode="idm", num_inference_steps=20)`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastWAM-Sweep-Trash-IOReset-Epoch-4 | no disponible (base 5B) | 128 tokens de instrucción; 9 fotogramas | Política VLA bimanual para barrido | other | Público en HF (checkpoint de evaluación) |
| Wan-AI/Wan2.2-TI2V-5B | 5B (aproximado por nombre) | no disponible | Generación texto-imagen-vídeo | no disponible | Público en HF (modelo base) |
| FastWAM Optional-IDM Songling | no disponible | no disponible | Política VLA pretrenada | no disponible | No público (paso 45.000) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No se reporta tasa de éxito en robot real ni validación en conjunto reservado; la pérdida de entrenamiento no mide el éxito de la tarea.
- El checkpoint es de evaluación: no incluye estado de optimizador ni scheduler, por lo que no permite continuar el entrenamiento de forma exacta.
- Las estadísticas de normalización deben provenir obligatoriamente de este mismo repositorio; usar estadísticas de otro checkpoint produce acciones incorrectas.
- El modelo está especializado en una única tarea (barrido de papel hacia un recogedor) y un único robot (Agilex PiPER); no es un modelo generalista.
- La configuración conserva rutas del sistema de archivos de la máquina de entrenamiento y debe actualizarse para otro entorno.
- Requiere dependencias externas no incluidas: VAE de Wan2.2-TI2V-5B, codificador de texto UMT5 de Wan2.1 y tokenizador.
- Licencia "other": no se detallan los términos de uso comercial; debe consultarse la licencia del modelo base Wan2.2-TI2V-5B y del código FastWAM.
- Riesgo de alucinación y sesgos: no documentados; al ser un modelo de acción, el riesgo se manifiesta como acciones incorrectas o inseguras en el robot.
- Sin datos sobre idiomas soportados ni comportamiento multilingüe.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/dddddsds31341/FastWAM-Sweep-Trash-IOReset-Epoch-4
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Dataset: https://huggingface.co/datasets/yuyingyinya/sweep_trash
- Código FastWAM (referencia citada en la model card): https://github.com/yuantianyuan01/FastWAM (commit `7faa711`)
