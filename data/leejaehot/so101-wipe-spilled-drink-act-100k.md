# leejaehot/so101-wipe-spilled-drink-act-100k

## Resumen

El modelo `so101-wipe-spilled-drink-act-100k` es una política de control robótico entrenada con el algoritmo ACT (Action Chunking with Transformers) sobre el robot SO101, orientada a la tarea concreta de limpiar un líquido derramado. Lo publica el usuario de Hugging Face `leejaehot` como checkpoint final de un entrenamiento de 100.000 actualizaciones, dentro del ecosistema LeRobot. No es un modelo de lenguaje: es un modelo de imitación (behavior cloning) que mapea observaciones visuales y de estado articular a comandos motores de 6 dimensiones.

El modelo resuelve un problema acotado de manipulación robótica: aprender una política de imitación a partir de 45 episodios de demostración teleoperada, con dos cámaras RGB (muñeca y cenital) a 640x480 y 30 Hz. Su relevancia es la de un artefacto reproducible de investigación en robótica de imitación: incluye preprocesadores, postprocesadores, estado del optimizador y manifiesto de hashes, lo que permite reanudar el entrenamiento o desplegar la política directamente en un SO101 calibrado.

Arquitectónicamente es un transformer ACT con backbone visual ResNet18 preentrenado en ImageNet, chunking de acciones de 100 pasos y un VAE auxiliar con peso KL de 10. Tiene 51.668.614 parámetros y un tamaño de repositorio de 0,6 GB. La licencia no está declarada en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con backbone visual ResNet18 |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; usa observaciones por paso) |
| Tipos de cuantizacion | no disponible (pesos en FP32, AMP desactivado, TF32 permitido) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Checkpoint | 100.000 actualizaciones (checkpoint final) |
| Dataset | hnuu/wipe-spilled-drink_20261030_212524 (revisión 6297ef308839cc1d7d70bcc1b8f39d7caa1f4262) |
| Episodios train / validación | 0-44 / 45-49 |
| Cámaras | muñeca y cenital, 640x480 RGB cada una |
| Frecuencia de datos | 30 Hz |
| Dimensión estado / acción | 6 / 6 (valores articulares nativos) |
| Batch / semilla | 32 / 1000 |
| Precisión de entrenamiento | FP32, AMP desactivado, TF32 permitido |
| Chunk ACT / peso KL del VAE | 100 / 10 |
| Coeficiente de ensemble temporal | 0,01 |
| n_action_steps | 1 |
| Pérdida L1 normalizada en validación | 0,3456 |

## Arquitectura y entrenamiento

El modelo implementa ACT, un transformer de imitación que predice secuencias de acciones (chunks) de 100 pasos a partir de observaciones compuestas por dos imágenes RGB y el vector de estado articular de 6 dimensiones. El backbone visual es una ResNet18 inicializada con pesos de ImageNet, que extrae características de las cámaras de muñeca y cenital. ACT incorpora un autocodificador variacional (VAE) auxiliar con peso KL de 10 para modelar la multimodalidad de las demostraciones humanas, lo que ayuda a evitar el colapso de modos en tareas con variabilidad de ejecución.

El entrenamiento se realizó durante 100.000 actualizaciones con batch de 32 y semilla 1000, en FP32 con AMP desactivado y TF32 habilitado, sobre 45 episodios de entrenamiento y 5 de validación del dataset `hnuu/wipe-spilled-drink_20261030_212524`. La inferencia usa ensemble temporal con coeficiente 0,01 y `n_action_steps` de 1, es decir, se aplica agregación temporal sobre las predicciones de chunks sucesivos en cada paso de control. No se especifica en la información disponible el número total de tokens ni la composición detallada del dataset más allá de los episodios y las cámaras.

## Capacidades

- Control robótico de imitación para la tarea de limpiar un líquido derramado con el robot SO101.
- Predicción de acciones articulares de 6 dimensiones a partir de observaciones visuales (dos cámaras) y estado propioceptivo.
- Ensemble temporal de predicciones para suavizar la ejecución motora.
- Integración nativa con LeRobot: carga como política `ACTPolicy` y expone `select_action()` y `reset()`.
- Inclusión de preprocesador y postprocesador guardados para normalización coherente entre entrenamiento e inferencia.
- Checkpoint completo con estado del optimizador AdamW y RNG para reanudar entrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es una política motora, no un modelo generativo de texto.

## Casos de uso

- Despliegue en un SO101 físico para la tarea de limpieza: cargar la política con `ACTPolicy.from_pretrained()` y llamar a `select_action()` en cada observación procesada, aplicando `reset()` al inicio de cada episodio. Es adecuado porque el checkpoint está validado para recarga e inferencia con ensemble temporal sobre un frame de episodio reservado.
- Reproducción de experimentos de imitación: el repositorio incluye `train_config.json`, `checkpoint_manifest.json` con hashes SHA-256 y el estado del optimizador, lo que permite auditar y reproducir el entrenamiento en otro entorno.
- Reanudación de entrenamiento: el directorio `checkpoints/100000/training_state` conserva AdamW, RNG y el paso guardado, útil para continuar el ajuste con más datos o desde otro hardware.
- Comparación de checkpoints: junto con el checkpoint de 10k (`so101-wipe-spilled-drink-act-10k`), permite estudiar el efecto del sobreentrenamiento y la selección de checkpoint (el 10k tiene la menor pérdida de validación registrada; el 100k es el final).
- Base para fine-tuning en tareas de limpieza relacionadas: al ser una política ACT con backbone ResNet18 y normalización guardada, se puede partir de estos pesos para nuevas tareas de manipulación con el mismo robot y configuración de cámaras.
- Evaluación de pipelines de robótica en LeRobot: sirve como caso de prueba para validar carga de políticas, pre/postprocesadores y ensemble temporal en entornos de simulación o laboratorio antes de medir éxito físico.
- Docencia e investigación en behavior cloning: el modelo es pequeño (51,7 M de parámetros) y cabe en GPUs de consumo, lo que facilita experimentos de imitación con estudiantes o prototipos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados en la información disponible. El único dato de rendimiento reportado es la pérdida L1 normalizada en validación de 0,3456 sobre cinco episodios reservados (45-49). El autor indica explícitamente que el éxito físico de la tarea en robot real no se ha medido todavía.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros en FP32, los pesos ocupan aproximadamente 0,2 GB, por lo que la VRAM necesaria es modesta y dominada por las activaciones de las dos cámaras a 640x480.
- GPU recomendadas: cualquier GPU con soporte CUDA capaz de ejecutar ResNet18 y el transformer ACT; no se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060 o superiores, aunque no se confirma en la documentación.
- Opciones de despliegue: LeRobot (`ACTPolicy`, `make_pre_post_processors`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El control opera a 30 Hz según la frecuencia de los datos, pero no se reportan tiempos de inferencia medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto / observación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| so101-wipe-spilled-drink-act-100k | 51,7 M | Limpiar líquido derramado con SO101 | 2 cámaras 640x480 + estado 6D a 30 Hz | no disponible | Hugging Face |
| so101-wipe-spilled-drink-act-10k | no disponible | Misma tarea, checkpoint 10k | Igual configuración | no disponible | Hugging Face |
| Otros modelos ACT para SO101 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de otros autores en la documentación proporcionada.

## Limitaciones y advertencias

- Es una política específica para una tarea y un robot concretos (SO101, limpiar líquido derramado); no generaliza a otras tareas sin fine-tuning.
- El éxito físico en robot real no se ha medido; la validación se limita a pérdida L1 normalizada y recarga correcta de pesos.
- Requiere calibración del robot y correspondencia exacta de los nombres de las cámaras (muñeca y cenital) para que el preprocesador funcione.
- El checkpoint de 100k no es el de menor pérdida de validación (ese es el de 10k), por lo que puede presentar sobreajuste respecto a los episodios de entrenamiento.
- La licencia no está declarada, lo que impide confirmar si el uso comercial está permitido; conviene contactar con el autor antes de usarlo en producción.
- No hay información sobre sesgos, alucinación o limitaciones idiomáticas porque no es un modelo de lenguaje; el riesgo equivalente es la generalización limitada a condiciones visuales no vistas.
- El conjunto de validación es muy pequeño (5 episodios), lo que reduce la fiabilidad estadística de la métrica reportada.
- No se incluyen vídeos del dataset en el repositorio, lo que limita la inspección cualitativa de las demostraciones.

## Enlaces

- Hugging Face: https://huggingface.co/leejaehot/so101-wipe-spilled-drink-act-100k
- Checkpoint de 10k: https://huggingface.co/leejaehot/so101-wipe-spilled-drink-act-10k
- Dataset: hnuu/wipe-spilled-drink_20261030_212524 (referenciado en la model card; no se proporciona URL directa)
- LeRobot (librería): no se proporciona enlace en la información disponible
- Paper de ACT: no se proporciona enlace en la información disponible
