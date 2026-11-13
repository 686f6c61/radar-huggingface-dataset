# dddddsds31341/FastWAM-Wash-Cup-IOReset-Epoch-3

## Resumen

FastWAM-Wash-Cup-IOReset-Epoch-3 es un checkpoint de evaluación de un modelo de política robótica (vision-language-action, VLA) especializado en una tarea bimanual concreta: sostener una taza con un gripper mientras el otro la limpia con un cepillo de botella, devolver el cepillo y colocar la taza boca abajo en un escurridor. Lo publica el usuario dddddsds31341 y deriva por fine-tuning de Wan2.2-TI2V-5B, el modelo generativo de vídeo de Wan-AI, sobre el que se construye la arquitectura FastWAM, que combina un experto de vídeo con un experto de acción.

El checkpoint corresponde a la época 3 de 6 (paso de optimizador 10461) de una inicialización denominada "IO reset", en la que el experto de vídeo y el transformer del experto de acción parten del checkpoint pretrainado FastWAM Optional-IDM Songling (paso 45000, no público), mientras que el codificador de acción, la cabeza de acción y el codificador de propiocepción se reinicializan con semilla 42. La razón es que las estadísticas de normalización del checkpoint original colapsaban 9 de las 14 dimensiones de acción/estado, por lo que esas capas no contenían un mapeo utilizable para los rangos articulares de este robot.

Es relevante porque documenta un experimento controlado de inicialización (IO reset frente a IDM fresco) sobre datos idénticos, e ilustra el estado actual del fine-tuning de modelos generativos de vídeo hacia políticas de control robótico con chunks de acción de 32 pasos. No obstante, no se reporta ninguna tasa de éxito en bucle cerrado ni validación con datos retenidos, por lo que debe tratarse como material de reproducción e investigación, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastWAM: experto de vídeo + experto de acción sobre Wan2.2-TI2V-5B (transformer de difusión), con codificador de propiocepción y cabeza de acción |
| Parametros totales | no disponible (repo de 12,0 GB; pesos en BF16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens para la instrucción de tarea (embeddings UMT5 cacheados); 9 fotogramas de vídeo y chunk de acción de 32 pasos por muestra |
| Tipos de cuantizacion | no disponible (pesos almacenados en BF16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (la instrucción se codifica con el text encoder UMT5 de Wan2.1) |
| Licencia | other (licencia personalizada, ver limitaciones) |
| Formato de pesos | `model.pt` (PyTorch, BF16); no es un modelo `from_pretrained` de Transformers |

## Arquitectura y entrenamiento

FastWAM es una arquitectura de política robótica que acopla un experto de vídeo (heredero del transformer de difusión de Wan2.2-TI2V-5B) con un experto de acción, más un codificador de propiocepción y una cabeza de acción que emite chunks de 32 pasos. La inferencia se realiza en modo `idm` con 20 pasos de difusión: el modelo primero predice el vídeo futuro y después el chunk de acción. La entrada visual son tres cámaras RGB (`top_head`, `hand_left`, `hand_right`), cada una redimensionada a 224×224 y concatenadas horizontalmente hasta 224×672.

El entrenamiento usa el dataset `yuyingyinya/wash_cup` (revisión `dcf90aa38d98e9b6c9f71afe0cfeeb3f50ed74cb`): 100 demostraciones, 69728 fotogramas a 30 Hz, todas empleadas para entrenamiento. Se ejecutó en cuatro A800 con batch de 5 por GPU y batch global 20, AdamW con learning rate constante de 1e-5, weight decay 0.01, clipping de norma global 1.0, BF16 y DeepSpeed ZeRO-1, semilla 42. Cada época son 3487 actualizaciones y la ejecución completa son 6 épocas (20922 actualizaciones); este checkpoint es la época 3. Las acciones son objetivos articulares absolutos de 14 dimensiones en radianes (izquierdo: 6 articulaciones + gripper; derecho: 6 articulaciones + gripper), con grippers expresados como fracción de apertura sobre 0.08 m. Se aplica normalización min/max específica de la tarea y las pérdidas de denoising de vídeo y de acción tienen el mismo peso, con `action_idm_prob` 0.5.

La innovación destacable es metodológica: el "IO reset" reinicializa codificador de acción, cabeza de acción y codificador de propiocepción para evitar heredar estadísticas de normalización colapsadas del checkpoint Songling, manteniendo el resto del modelo pretrainado.

## Capacidades

- Generación de vídeo futuro condicionada a observaciones e instrucción de tarea, usada como paso intermedio de la predicción de acción.
- Predicción de acciones robóticas bimanuales en chunks de 32 pasos, en 14 dimensiones articulares absolutas.
- Control de robot bimanual Agilex PiPER (6 articulaciones + gripper por brazo).
- Ejecución de una instrucción de tarea en lenguaje natural codificada con UMT5 (contexto de 128 tokens).
- Fusión de tres vistas RGB (cabeza y ambas manos) en una única entrada visual.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no documentadas; dependen del text encoder UMT5 de Wan2.1.

## Casos de uso

- Reproducción de experimentos de inicialización: comparar este checkpoint "IO reset" con el de IDM fresco, entrenados con datos e hiperparámetros idénticos, para aislar el efecto de reinicializar las capas de acción y propiocepción.
- Investigación en VLA basados en modelos de vídeo: usar el par vídeo-acción para estudiar si la predicción de vídeo futuro mejora la calidad del chunk de acción en tareas de contacto.
- Manipulación bimanual de precisión: la tarea de limpiar el interior de una taza con un cepillo exige coordinación entre dos brazos; el modelo sirve como referencia para políticas bimanuales con PiPER.
- Base para fine-tuning en tareas de limpieza o manipulación de recipientes: el pipeline de entrenamiento (config, estadísticas, contrato de inferencia y código) es reutilizable con nuevos datasets.
- Evaluación de contratos de inferencia y normalización: `inference_contract.json` y `dataset_stats.json` permiten verificar el orden de articulaciones, la referencia de gripper y las estadísticas antes de desplegar en hardware.
- Docencia y divulgación técnica: ejemplo completo de fine-tuning de un modelo generativo de vídeo de 5B hacia control robótico con ZeRO-1 y BF16 en 4×A800.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reporta tasa de éxito en bucle cerrado ni resultado de validación con datos retenidos, y advierte que la pérdida de entrenamiento no es una métrica de éxito de la tarea robótica.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repo pesa 12,0 GB con pesos en BF16, lo que da una cota inferior aproximada para cargar `model.pt`; a ello hay que sumar el VAE de Wan2.2-TI2V-5B, que se carga por separado, y las activaciones de inferencia.
- GPU recomendadas: el entrenamiento usó 4×A800; para inferencia se necesita al menos una GPU con suficiente memoria para pesos BF16 más VAE y activaciones. No se documentan requisitos mínimos.
- ¿Cabe en GPU de consumo? No confirmado. Con 12 GB de pesos en BF16 más VAE, es improbable en GPUs de 8-12 GB sin cuantización, y no se publican variantes cuantizadas.
- Opciones de despliegue: el propio checkout FastWAM (código en `code.zip`, basado en `yuantianyuan01/FastWAM@7faa711` con cambios de fine-tuning PiPER), cargando con `hydra.utils.instantiate` y `model.load_checkpoint("model.pt")`, e infiriendo con `action_infer_mode="idm"` y 20 pasos. No es compatible con `from_pretrained` de Transformers; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La inferencia requiere 20 pasos de difusión más la predicción de vídeo previa, lo que implica un coste computacional notable por chunk de 32 acciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastWAM-Wash-Cup-IOReset-Epoch-3 | no disponible (base 5B de Wan2.2-TI2V) | 128 tokens de instrucción; 9 fotogramas; chunk de 32 acciones | Política VLA bimanual para limpiar una taza | other | Público en HF, 0 descargas |
| FastWAM Optional-IDM Songling (checkpoint base) | no disponible | no disponible | Política VLA generalista FastWAM | no disponible | No público (paso 45000) |
| Wan2.2-TI2V-5B | 5B (aprox., según nombre) | no disponible | Generación de vídeo texto-imagen a vídeo | no disponible en la información | Público (Wan-AI) |
| Fine-tunes Long-WAM sobre el mismo dataset | no disponible | no disponible | Política VLA sobre `wash_cup` | no disponible | No detallado |

La comparación relevante es interna al propio experimento: este checkpoint (IO reset) frente al de IDM fresco, entrenados con los mismos datos e hiperparámetros, y frente a los fine-tunes Long-WAM que usan la misma copia local del dataset. No se dispone de métricas para comparar rendimiento entre ellos.

## Limitaciones y advertencias

- No se reporta tasa de éxito en bucle cerrado ni validación con datos retenidos; la pérdida de entrenamiento no mide el éxito de la tarea.
- Es un checkpoint de evaluación de la época 3 de 6: no es el modelo final de la ejecución y no puede restaurar el estado del optimizador para continuar el entrenamiento exactamente.
- Las estadísticas de normalización y el contrato de gripper deben provenir de este mismo repositorio; usar estadísticas de otro checkpoint produce acciones incorrectas.
- La configuración conserva rutas del sistema de archivos de la máquina de entrenamiento y hay que actualizarlas.
- Requiere por separado los pesos del VAE de Wan2.2-TI2V-5B (`DIFFSYNTH_MODEL_BASE_PATH`) y el text encoder y tokenizer UMT5 de Wan2.1 para codificar la instrucción en despliegue.
- Está especializado en una única tarea y un único robot (Agilex PiPER, 14 dimensiones); no generaliza a otras morfologías sin un adaptador de robot compatible.
- Licencia "other": no se detallan los términos, por lo que el uso comercial no está confirmado; hay que revisar la licencia del modelo base Wan2.2-TI2V-5B y del código FastWAM.
- Riesgo de alucinación y sesgos: no documentados; en políticas robóticas el fallo se manifiesta como acciones incorrectas o inseguras, no como texto inventado.
- Idiomas soportados no documentados; la instrucción de tarea está en inglés.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/FastWAM-Wash-Cup-IOReset-Epoch-3
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Dataset: https://huggingface.co/datasets/yuyingyinya/wash_cup
- Código FastWAM (referencia citada en la model card): https://github.com/yuantianyuan01/FastWAM (commit `7faa711`)
