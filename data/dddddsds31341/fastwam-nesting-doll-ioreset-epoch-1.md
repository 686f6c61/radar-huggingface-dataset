# dddddsds31341/FastWAM-Nesting-Doll-IOReset-Epoch-1

## Resumen

FastWAM Nesting Doll — IO reset, Epoch 1 es un checkpoint de evaluación de un fine-tune de robótica bimanual derivado de Wan-AI/Wan2.2-TI2V-5B, un modelo generativo de vídeo de 5 mil millones de parámetros. Lo publica el usuario dddddsds31341 y pertenece a la familia FastWAM, un marco que acopla un experto de vídeo con un experto de acción para aprender políticas robóticas a partir de demostraciones. El modelo resuelve una tarea concreta: anidar muñecas rusas de menor a mayor con un robot bimanual Agilex PiPER, emitiendo trozos de acción de 32 pasos en un espacio articular de 14 dimensiones.

El checkpoint corresponde al epoch 1 de 6 (actualización de optimizador 8229) de un entrenamiento sobre 100 demostraciones y 164.571 fotogramas a 30 Hz, con tres cámaras RGB (top_head, hand_left, hand_right) y una instrucción de tarea en lenguaje natural. Se distinguen dos inicializaciones entrenadas con datos e hiperparámetros idénticos: IO reset (esta) y fresh IDM. La relevancia es acotada: es un artefacto de investigación reproducible para estudiar inicializaciones en políticas vídeo-acción, no un modelo de propósito general.

No es un modelo autónomo al estilo Transformers `from_pretrained`: requiere el código FastWAM v8 incluido, el VAE de Wan2.2-TI2V-5B, el codificador de texto UMT5 de Wan2.1 y las estadísticas de normalización y el contrato de inferencia de este mismo repositorio. El autor no reporta tasa de éxito en bucle cerrado ni validación retenida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo conjunto vídeo-acción (FastWAM): experto de vídeo derivado de Wan2.2-TI2V-5B + experto de acción transformer, con encoder de acción, cabeza de acción y encoder de propiocepción |
| Parametros totales | no disponible (repo de 12,0 GB en BF16; el backbone base es Wan2.2-TI2V-5B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 128 tokens para la instrucción de tarea (embeddings UMT5 en caché); 9 fotogramas de vídeo y chunk de 32 acciones por muestra |
| Tipos de cuantizacion | no disponible (pesos almacenados en BF16) |
| Idiomas soportados | no disponible (instrucción de tarea en inglés) |
| Licencia | other |
| Formato de pesos | `model.pt` (PyTorch, BF16), más `config.yaml`, `dataset_stats.json`, `inference_contract.json`, `code.zip` y `requirements-fastwam.txt` |

## Arquitectura y entrenamiento

FastWAM combina un experto de vídeo y un experto de acción en un único modelo conjunto (`mot`) que primero predice el vídeo futuro y después el chunk de acciones de 32 pasos, con modo de inferencia `idm` y 20 pasos de difusión. El experto de vídeo y el transformer del experto de acción parten del checkpoint pretrained FastWAM Optional-IDM Songling (paso 45.000, no público). El encoder de acción, la cabeza de acción y el encoder de propiocepción se reinicializan con semilla 42 porque las estadísticas de normalización de ese checkpoint colapsaban 9 de las 14 dimensiones de acción/estado. Las pérdidas de denoising de vídeo y de acción tienen pesos iguales y `action_idm_prob` es 0,5.

El entrenamiento usa el dataset `yuyingyinya/nesting_doll` (revisión `ae8a879c9a635d3c666aba58a4d9ac996225edb8`): 100 demostraciones, 164.571 fotogramas a 30 Hz, todas para entrenamiento. Se ejecutó en cuatro A800 con batch 5 por GPU (batch global 20), tasa de aprendizaje constante 1e-5, AdamW con weight decay 0,01, clipping de norma global 1,0, BF16 y DeepSpeed ZeRO-1. Cada epoch son 8.229 actualizaciones y la ejecución completa son 6 epochs / 49.374 actualizaciones. Las etiquetas son 14 dimensiones absolutas en radianes (6 articulaciones izquierdas + pinza, 6 derechas + pinza), con pinzas como fracción de apertura sobre 0,08 m. Cada muestra concatena horizontalmente tres cámaras redimensionadas a 224×224 (224×672 en total).

## Capacidades

- Generación de acciones robóticas bimanuales: predice chunks de 32 pasos en un espacio articular de 14 dimensiones con pinzas normalizadas.
- Predicción de vídeo futuro como paso intermedio antes de la acción (modo `idm`).
- Condicionamiento por instrucción de tarea en lenguaje natural (contexto de 128 tokens con UMT5).
- Fusión multimodal de tres vistas RGB (cabeza y ambas manos) con propiocepción del robot.
- Ejecución específica de la tarea de anidar muñecas rusas con un Agilex PiPER.
- No soporta tool calling, function calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación sobre inicializaciones en políticas vídeo-acción: comparar IO reset frente a fresh IDM con datos e hiperparámetros idénticos para aislar el efecto de la reinicialización de capas de acción.
- Reproducción de experimentos de manipulación bimanual: cargar `config.yaml`, `model.pt` y las estadísticas del repositorio para replicar la inferencia `idm` con 20 pasos.
- Estudio de normalización de acciones: analizar cómo el colapso de 9 de 14 dimensiones en el checkpoint previo afecta al aprendizaje y por qué se reinicializan encoder, cabeza y propiocepción.
- Base para fine-tuning en tareas de ensamblaje o apilamiento con el mismo robot Agilex PiPER y el mismo contrato de 14 dimensiones.
- Evaluación de arquitecturas vídeo-acción en robótica: usar el checkpoint como referencia de epoch 1 dentro de una curva de 6 epochs.
- Docencia y divulgación técnica: ilustrar un pipeline completo de datos (100 demos, 164.571 fotogramas, tres cámaras) hasta política desplegable.
- Integración en un banco de pruebas de robot real: desplegar con el adaptador de robot correspondiente y las convenciones de pinza de 0,08 m.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no reporta tasa de éxito en bucle cerrado ni resultado de validación retenida, y advierte que la pérdida de entrenamiento no es una métrica de éxito en la tarea robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo pesa 12,0 GB en BF16, por lo que se necesita al menos esa cifra más el VAE de Wan2.2-TI2V-5B y el encoder UMT5 de Wan2.1 cargados aparte.
- GPU de entrenamiento documentadas: 4× A800 con batch 5 por GPU, BF16 y DeepSpeed ZeRO-1.
- GPU recomendadas para inferencia: no disponible; por tamaño, se requiere una GPU de datacenter (A100/H100) o una consumer de gama alta con suficiente VRAM para el conjunto completo.
- ¿Cabe en GPU consumer? No disponible; no se documenta ninguna configuración consumer.
- Opciones de despliegue: no es un modelo estándar de vLLM, llama.cpp, Ollama o TGI; requiere el checkout FastWAM v8 de `code.zip`, `hydra.utils.instantiate(cfg.model, model_dtype=torch.bfloat16, device=...)`, `model.load_checkpoint("model.pt")` y `model.infer_action(..., action_infer_mode="idm", num_inference_steps=20)`.
- Latencia y throughput: no disponibles. La inferencia implica 20 pasos de difusión y una predicción de vídeo previa a la acción.
- Dependencias externas: VAE de Wan2.2-TI2V-5B vía `DIFFSYNTH_MODEL_BASE_PATH` y encoder de texto UMT5 de Wan2.1 con tokenizador.
- Rutas del sistema de ficheros de la máquina de entrenamiento conservadas en `config.yaml`; deben actualizarse para otra máquina.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastWAM Nesting Doll (IO reset, epoch 1) | no disponible (base 5B) | 128 tokens de instrucción; 9 fotogramas; chunk de 32 acciones | Política bimanual Agilex PiPER | other | Público en HF |
| FastWAM Nesting Doll (fresh IDM) | no disponible | Idéntico | Idéntica | other | No disponible en la información proporcionada |
| FastWAM Optional-IDM Songling (paso 45.000) | no disponible | no disponible | Política robótica general | no disponible | No público |
| Wan-AI/Wan2.2-TI2V-5B | 5B | no disponible | Generación de vídeo texto-imagen-vídeo | no disponible | Público en HF |

La comparación con modelos de la misma categoría (políticas vídeo-acción para manipulación bimanual) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de evaluación del epoch 1 de 6: no representa el modelo final y no permite restaurar el estado del optimizador para continuar el entrenamiento exactamente.
- No se reporta tasa de éxito en robot real ni validación retenida; la pérdida de entrenamiento no es una métrica de éxito.
- Las estadísticas de normalización y el contrato de pinza deben proceder de este mismo repositorio; usar estadísticas de otro checkpoint produce acciones incorrectas.
- No es un modelo autónomo de Transformers: depende del código FastWAM v8, del VAE de Wan2.2-TI2V-5B y del encoder UMT5 de Wan2.1.
- `config.yaml` conserva rutas del sistema de ficheros de la máquina de entrenamiento y requiere ajuste.
- Específico de un robot (Agilex PiPER) y de una tarea (anidar muñecas rusas); no generaliza a otras morfologías sin adaptador.
- Idiomas soportados no disponibles; la instrucción de tarea está en inglés y el contexto de texto es de solo 128 tokens.
- Licencia "other": no se detallan condiciones de uso comercial; deben verificarse antes de cualquier despliegue productivo.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la información disponible.
- Sin descargas ni likes en el momento de la consulta; trazas de validación por la comunidad inexistentes.

## Enlaces

- Hugging Face: https://huggingface.co/dddddsds31341/FastWAM-Nesting-Doll-IOReset-Epoch-1
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Dataset: https://huggingface.co/datasets/yuyingyinya/nesting_doll
- Repositorio de código de referencia citado: `yuantianyuan01/FastWAM@7faa711` (no se proporciona URL directa en la información disponible)
- Paper, blog o demo: no disponibles en la información proporcionada.
