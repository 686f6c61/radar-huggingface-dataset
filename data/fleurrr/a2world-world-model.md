# Fleurrr/A2World-World-Model

## Resumen

A2World es un modelo de mundo (world model) de difusión, condicionado por acciones y multi-vista, desarrollado por el grupo LogosRoboticsGroup y publicado por el usuario Fleurrr en HuggingFace. El modelo predice observaciones futuras de un robot a partir de observaciones iniciales de cámara y un chunk de 20 pasos de acción, capturando dinámicas de interacción transferibles más allá de la generación de vídeo a nivel de apariencia. Se presenta en el artículo "Learning Transferable Dynamics Priors from Action to World Modeling" (ECCV 2026).

El modelo es un derivado de `nvidia/Cosmos-Predict2-2B-Video2World`, sobre el que se añade el condicionamiento por acciones y la capacidad multi-vista. Se distribuyen dos variantes: `a2world-pretrained.pt`, preentrenado sobre datos heterogéneos de manipulación robótica con anotaciones de acciones reales, y `a2world-libero.pt`, una adaptación con historial visual guiado por pose (A2World-sim) sobre el benchmark LIBERO. Los pesos se publican en BF16 con prefijo de inferencia `net.*`, sin estado de entrenamiento.

Su relevancia actual reside en el creciente interés por simuladores aprendidos (learned simulators) que sustituyan o complementen los motores de física tradicionales en robótica, permitiendo rollouts autoregresivos y evaluación de políticas sin necesidad de un entorno físico. El repositorio pesa 10,1 GB e incluye ambos checkpoints, exportados desde pesos EMA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión condicionado por acciones, multi-vista, derivado de nvidia/Cosmos-Predict2-2B-Video2World |
| Parametros totales | Basado en Cosmos-Predict2-2B (2B); el recuento exacto de A2World no se indica |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (predicción de vídeo; chunks de 20 pasos de acción) |
| Tipos de cuantizacion | BF16 (pesos publicados); otras cuantizaciones no indicadas |
| Idiomas soportados | No aplica (generación de vídeo); no disponible |
| Licencia | nvidia-open-model-license (NVIDIA Open Model License) |
| Formato de pesos | PyTorch `.pt` (safetensors no indicado), BF16 |

## Arquitectura y entrenamiento

A2World es un modelo de difusión para generación de vídeo condicionado por acciones, construido sobre el modelo base `nvidia/Cosmos-Predict2-2B-Video2World` de NVIDIA. A diferencia del modelo base, que genera vídeo desde una imagen sin condicionamiento de acción, A2World incorpora dos extensiones principales: el condicionamiento multi-vista, que permite predecir observaciones desde múltiples cámaras simultáneamente, y el condicionamiento por acciones, que guía la evolución visual de la escena mediante un chunk de 20 pasos de acción del robot.

El preentrenamiento se realiza sobre datos heterogéneos de manipulación robótica a gran escala con anotaciones de acciones reales, lo que permite al modelo aprender prioridades de dinámica transferibles entre distintos robots y entornos. La variante A2World-sim añade un historial visual guiado por pose (pose-guided visual history) y soporte para rollout autoregresivo por chunks, lo que permite generar secuencias largas de forma iterativa. Los checkpoints publicados se exportan desde pesos EMA, se remapean al prefijo de inferencia `net.*` y se almacenan en BF16, eliminando pesos duplicados y entradas exclusivas de entrenamiento.

## Capacidades

- Predicción de vídeo multi-vista condicionada por acciones: genera observaciones futuras del robot desde múltiples cámaras a partir de una observación inicial y un chunk de 20 pasos de acción.
- Rollout autoregresivo por chunks: la variante A2World-sim permite generar secuencias largas de forma iterativa, alimentando la salida como entrada para el siguiente chunk.
- Historial visual guiado por pose: A2World-sim incorpora un buffer de historial con información de pose para mantener coherencia temporal en rollouts largos.
- Generación image-to-video: pipeline de HuggingFace `image-to-video`, compatible con la librería `cosmos`.
- Prioridades de dinámica transferibles: el preentrenamiento sobre datos heterogéneos captura dinámicas de interacción reutilizables entre distintos robots y escenarios.
- Adaptación a benchmarks de robótica: la variante `a2world-libero.pt` está adaptada específicamente al benchmark LIBERO para investigación en simuladores aprendidos.

## Casos de uso

- Simulador aprendido para LIBERO: la variante `a2world-libero.pt` puede utilizarse como sustituto del simulador físico en experimentos de investigación, generando observaciones sintéticas para evaluar políticas de manipulación sin necesidad del entorno real.
- Evaluación de políticas en open-loop: dado un chunk de acciones, el modelo predice las observaciones resultantes, permitiendo verificar rápidamente si una política produce comportamientos plausibles antes de desplegarla en el robot.
- Data augmentation para entrenamiento de políticas: las predicciones multi-vista pueden usarse para aumentar el conjunto de datos de entrenamiento, generando variaciones sintéticas de escenas de manipulación.
- Planificación basada en modelo (model-based planning): el rollout autoregresivo permite simular múltiples trayectorias candidatas y seleccionar la que mejor predice el resultado deseado, sin ejecutar acciones en el robot real.
- Investigación en prioridades de dinámica transferibles: el checkpoint preentrenado sirve como punto de partida para fine-tuning en nuevos entornos o robots, aprovechando las dinámicas de interacción aprendidas en el preentrenamiento.
- Validación de seguridad previa al despliegue: aunque no es un simulador certificado, puede usarse como filtro preliminar para descartar políticas que generen predicciones físicamente inconsistentes antes de la validación en el robot real.
- Generación de datos sintéticos multi-cámara: la capacidad multi-vista permite generar observaciones sincronizadas desde varias perspectivas de cámara, útiles para entrenar modelos de percepción o políticas que requieren visión multi-sensor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artículo asociado (ECCV 2026, arXiv:2606.29501) presenta la metodología y resultados experimentales, pero los números concretos no se incluyen en la model card ni en los metadatos del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 de un modelo de ~2B parámetros ocupan aproximadamente 4-5 GB; la generación de vídeo con difusión requiere memoria adicional para el ruido latente y las activaciones, por lo que se estima un mínimo de 8-12 GB de VRAM para inferencia básica (estimación basada en el tamaño del modelo base, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM debería ser suficiente para inferencia en BF16; tarjetas como RTX 3090, RTX 4090 o superiores ofrecen margen para batch y secuencias largas. Para entrenamiento o fine-tuning se recomiendan A100 o H100.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo con 8-12 GB de VRAM para inferencia en BF16, aunque los tiempos de generación de vídeo dependerán de la GPU.
- Opciones de despliegue: el modelo usa la librería `cosmos` de HuggingFace; no se indica soporte para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje, no a difusión de vídeo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Condicionamiento | Vistas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| A2World-World-Model | ~2B (base Cosmos-Predict2-2B) | Acciones (20 pasos) + imagen | Multi-vista | nvidia-open-model-license | HuggingFace (10,1 GB) |
| nvidia/Cosmos-Predict2-2B-Video2World | 2B | Imagen (sin acciones) | Vista única | nvidia-open-model-license | HuggingFace |
| Fleurrr/Prophet-World-Model | No disponible | Acciones + historial + secuencia de frames proyectados | Vista única | No disponible | HuggingFace |

La comparativa se limita a los modelos disponibles en la información proporcionada. A2World se diferencia del modelo base de NVIDIA por el condicionamiento por acciones y la capacidad multi-vista; Prophet-World-Model, del mismo autor, es la variante de vista única con historial, mientras que A2World añade la dimensión multi-cámara.

## Limitaciones y advertencias

- Los rollouts generados pueden alucinar geometría, contactos, estado de objetos o éxito de la tarea; las predicciones no son físicamente fiables sin validación.
- Los errores autoregresivos se acumulan en horizontes largos, degradando la calidad de las predicciones en secuencias extensas.
- La identidad de la cámara y la semántica de las acciones deben coincidir con los embeddings y el preprocesamiento seleccionados; un desajuste produce predicciones incorrectas.
- El modelo no es un simulador certificado y no debe reemplazar la validación de seguridad en robots reales.
- La licencia NVIDIA Open Model License puede imponer restricciones de uso comercial; es necesario revisar sus términos antes de desplegar el modelo en producción.
- No se dispone de información sobre sesgos del modelo ni sobre su comportamiento con datos fuera de la distribución de entrenamiento.
- Los checkpoints publicados no incluyen estado de entrenamiento, optimizador ni metadatos de ejecución, lo que limita la reproducibilidad del entrenamiento original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Fleurrr/A2World-World-Model
- Repositorio GitHub: https://github.com/LogosRoboticsGroup/A2World
- Página del proyecto: https://logosroboticsgroup.github.io/A2World/
- Artículo arXiv: https://arxiv.org/abs/2606.29501
- Versión HTML del artículo: https://arxiv.org/html/2606.29501v1
- Modelo base: https://huggingface.co/nvidia/Cosmos-Predict2-2B-Video2World
- Modelo relacionado (Prophet-World-Model): https://huggingface.co/Fleurrr/Prophet-World-Model
