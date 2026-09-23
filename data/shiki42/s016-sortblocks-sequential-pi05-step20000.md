# Shiki42/s016-sortblocks-sequential-pi05-step20000

## Resumen

Este repositorio contiene un checkpoint de inferencia de robótica publicado por el usuario Shiki42 bajo el identificador `s016-sortblocks-sequential-pi05-step20000`. Se trata de la iteración correspondiente al paso 20.000 del experimento E761 (run E761-R002), etiquetado por el autor como «E761 Blocks Ranking PI0.5 checkpoint — step 20000». El nombre del modelo apunta a la familia PI0.5, un tipo de política visión-lenguaje-acción (VLA) del ecosistema OpenPI, aunque la model card no describe la arquitectura interna ni el recuento de parámetros.

El artefacto no es un modelo de lenguaje conversacional, sino una política entrenada para una tarea de manipulación concreta (clasificado/secuenciación de bloques, según el nombre del dataset), sobre el conjunto de datos `Shiki42/ctr-sortblocks-100ep-sequential` en una revisión fijada. El entrenamiento se realizó con 20.000 actualizaciones del optimizador, batch de 16 y semilla 87431. El repositorio incluye únicamente los parámetros de inferencia de OpenPI (`params/`) y los estadísticos de normalización (`assets/`); el estado del optimizador y del cargador de datos se ha excluido deliberadamente.

Su relevancia actual es la de un artefacto reproducible para investigación en robótica: fija identidades de entrenamiento e inferencia mediante ficheros de procedencia y hashes SHA-256, y declara explícitamente que la evaluación está pendiente y que no se reclama ninguna tasa de éxito. El repositorio ocupa 6,3 GB y, en el momento de redactar esta ficha, no registra descargas ni «likes».
## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la model card; el identificador indica PI0.5 dentro del ecosistema OpenPI (política visión-lenguaje-acción) |
| Parámetros totales | No disponible (estimación orientativa a partir del tamaño del repositorio, 6,3 GB: entre ~1.600 y ~3.100 millones según precisión fp32/bf16; cifra sin confirmar) |
| Parámetros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (no se publican variantes GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | `en` (inglés), según las etiquetas del repositorio |
| Licencia | No disponible |
| Formato de pesos | Árbol de parámetros OpenPI (`params/`) más `assets/` con estadísticas de normalización; ficheros `resolved_config.json`, `training-provenance.json` y `SHA256SUMS` |
| Librería | openpi |
| Pipeline | robotics |
| Tamaño del repositorio | 6,3 GB |
| Paso del checkpoint | 20000 |
| Actualizaciones del optimizador | 20000 |
| Batch | 16 |
| Semilla | 87431 |
| Dataset de entrenamiento | Shiki42/ctr-sortblocks-100ep-sequential, revisión `3d8db515f856c4e6c2612569b43fb15eeaef3064` |
| Consumo de pérdida IdleMask | false |
| Commit CTR | `0341c7bdac2046a2e8c7a2efca3d8f8707da2eb6` |
| Fecha de creación | 2026-09-23 |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura más allá del nombre del experimento («PI0.5») y de la librería declarada (`openpi`). No se especifican número de capas, tipo de atención, tamaño del codificador visual, mecanismo de generación de acciones (por ejemplo, flow matching) ni composición exacta del dataset. Tampoco se indica si hubo fases de ajuste con RLHF, DPO o preferencias, ni datos de preentrenamiento del backbone subyacente. Todo lo referente a la arquitectura interna debe considerarse, por tanto, no disponible en la información publicada.

Lo que sí está documentado es el procedimiento de entrenamiento y su procedencia: 20.000 actualizaciones del optimizador con batch 16 y semilla 87431, sobre la revisión fijada `3d8db515f856c4e6c2612569b43fb15eeaef3064` del dataset `Shiki42/ctr-sortblocks-100ep-sequential`. Se registra un artefacto de normalización por cuantiles globales con SHA-256 `b93b6626af2ccfbbe63e31c86e6340a18b27b1dc842e67faa2a95f89ccfe0b46`, un manifiesto de runtime con SHA-256 `06e035fbc62dd7f32f01a2f5ad536f01bd5af6caae3239698dbb8c07ed503332`, y el commit CTR `0341c7bdac2046a2e8c7a2efca3d8f8707da2eb6`. La verificación del checkpoint declara que se superaron pruebas de recarga en proceso nuevo y de finitud de parámetros tanto en el paso 10.000 como en el 20.000.

## Capacidades

- Ejecución de una política robótica de manipulación orientada a la tarea del dataset de entrenamiento (clasificado/secuenciación de bloques, según su nombre), en formato de inferencia OpenPI.
- Entrada de observaciones y salida de acciones robóticas: no disponible el detalle de modalidades exactas (número de cámaras, frecuencia de control, dimensionalidad de acción).
- Soporte de tool calling o function calling: no disponible; no es una capacidad propia de este tipo de artefacto.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el repositorio declara únicamente inglés (`en`).
- Capacidades especiales (modo «thinking», visión, audio): no disponible; el nombre PI0.5 sugiere componentes de visión y lenguaje, pero la model card no lo confirma ni lo detalla.
- Reproducibilidad: capacidad verificable de reconstruir la identidad de inferencia mediante `resolved_config.json`, `training-provenance.json` y `SHA256SUMS`.

## Casos de uso

- Reproducción de experimentos en robótica: cargar el checkpoint con la librería `openpi` y el manifiesto de runtime para replicar exactamente el punto de entrenamiento del paso 20.000, usando los hashes SHA-256 publicados como garantía de integridad.
- Investigación en políticas VLA: servir como punto de partida congelado para estudiar el comportamiento de la familia PI0.5 en tareas de manipulación, comparando el paso 20.000 con el paso 10.000 mencionado en la verificación del autor.
- Ajuste fino posterior (fine-tuning): al publicarse solo los parámetros de inferencia y las estadísticas de normalización, el checkpoint puede emplearse como inicialización para continuar el entrenamiento sobre nuevos datasets de manipulación dentro del mismo pipeline OpenPI.
- Evaluación comparativa interna: usar el checkpoint como referencia base en un banco de pruebas propio para medir tasas de éxito en la tarea de clasificado de bloques, dado que la model card no publica ninguna métrica de éxito.
- Auditoría de procedencia de modelos: los ficheros `training-provenance.json` y `SHA256SUMS` permiten verificar la cadena de custodia de los pesos en entornos de investigación con requisitos de trazabilidad.
- Despliegue experimental en banco de robot: si el hardware y la configuración de inferencia coinciden con el manifiesto de runtime, el checkpoint puede ejecutarse sobre la tarea para la que fue entrenado, siempre asumiendo que la evaluación está pendiente.
- Docencia y formación: como ejemplo práctico de artefacto de robótica con procedencia documentada, útil para ilustrar buenas prácticas de publicación de checkpoints (normalización, hashes, configuraciones congeladas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card declara explícitamente que la evaluación está pendiente («Evaluation: pending; this card makes no success-rate claim»), por lo que no existe ninguna tasa de éxito, métrica de tarea ni comparación numérica que pueda reproducirse aquí.

| Aspecto | Estado declarado |
|---|---|
| Tasa de éxito en tarea | No publicada; evaluación pendiente |
| Métricas de manipulación (por ejemplo, éxito por episodio) | No disponibles |
| Recarga en proceso nuevo y finitud de parámetros | Superadas para los pasos 10.000 y 20.000, según el autor |
| Benchmarks de lenguaje o razonamiento | No aplicables a este tipo de artefacto |

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma oficial. Estimación orientativa a partir del tamaño del repositorio (6,3 GB): en bf16 el conjunto de pesos rondaría los 6-7 GB, y en fp32 podría acercarse a 12-13 GB, sin contar activaciones ni el codificador visual; una horquilla prudente de trabajo sería 8-16 GB según precisión y batch.
- GPU recomendadas: no disponible. Para entrenamiento o ajuste fino, el autor no especifica hardware; para inferencia, cualquier GPU con memoria suficiente para el checkpoint y las activaciones del pipeline OpenPI.
- ¿Cabe en GPU de consumo? No confirmado. Con la estimación anterior, tarjetas con 16 GB o más (por ejemplo, RTX 4080/4090 o A5000) serían candidatas razonables en bf16, pero no hay confirmación del autor.
- Opciones de despliegue: la librería declarada es `openpi`. No se documentan variantes para vLLM, llama.cpp, Ollama o TGI, que además no son formatos naturales para este tipo de política. El despliegue debe seguir el manifiesto de runtime y los ficheros de configuración incluidos.
- Latencia y throughput: no disponibles. No se publican mediciones de frecuencia de control, tiempo por paso de inferencia ni episodios por segundo.
- Almacenamiento: el repositorio completo ocupa 6,3 GB, a los que hay que sumar el espacio del entorno OpenPI y del dataset si se desea reproducir el entrenamiento.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la información proporcionada (ni especificaciones, ni licencias, ni métricas). La única comparación documentada es interna al propio experimento:

| Modelo | Paso | Dataset | Evaluación | Licencia | Parámetros |
|---|---|---|---|---|---|
| s016-sortblocks-sequential-pi05-step20000 (este) | 20000 | ctr-sortblocks-100ep-sequential | Pendiente | No disponible | No disponible |
| Checkpoint del mismo run en el paso 10000 (citado en la verificación) | 10000 | ctr-sortblocks-100ep-sequential | Pendiente | No disponible | No disponible |
| Otros checkpoints OpenPI / PI0.5 de la comunidad | No disponible | No disponible | No disponible | No disponible | No disponible |
| Políticas VLA alternativas (por ejemplo, OpenVLA, RDT, GR00T) | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia ausente: la model card no especifica licencia, por lo que no puede asumirse ningún permiso de uso comercial, redistribución o modificación. Cualquier uso en producción requiere aclarar este punto con el autor.
- Evaluación pendiente: el propio autor declara que no se reclama ninguna tasa de éxito. No hay evidencia publicada de que la política funcione correctamente en la tarea objetivo.
- Verificación limitada: las comprobaciones realizadas (recarga en proceso nuevo y finitud de parámetros) validan integridad técnica, no comportamiento funcional ni seguridad.
- Alcance muy restringido: es una política de manipulación entrenada sobre un único dataset y una única tarea, no un modelo de propósito general. No debe extrapolarse su comportamiento a otros entornos, objetos o morfologías de robot.
- Idioma: el repositorio declara únicamente `en`. No hay indicación de soporte de instrucciones en castellano u otros idiomas.
- Riesgo de sobreajuste al dominio: con 100 episodios y 20.000 actualizaciones, es plausible un ajuste fuerte a las condiciones del dataset (iluminación, disposición de cámara, posiciones iniciales), aunque no se publican datos al respecto. Esta observación es una advertencia metodológica, no un resultado medido.
- Sin validación comunitaria: cero descargas y cero «likes» en el momento de redactar la ficha, lo que implica ausencia de verificación independiente por terceros.
- Datos de sesgo: no disponibles. No se documentan sesgos demográficos, de entorno ni de distribución de tareas.
- Riesgo de alucinación: no aplicable en el sentido de generación de texto; en su lugar, existe el riesgo de acciones erróneas o fuera de distribución ante observaciones no vistas durante el entrenamiento.
- Dependencia de la revisión del dataset: el entrenamiento está anclado a la revisión `3d8db515f856c4e6c2612569b43fb15eeaef3064`; usar otra revisión rompería la reproducibilidad.
- Exclusión del estado del optimizador: al no incluirse estado del optimizador ni del cargador de datos, continuar el entrenamiento exactamente desde este punto requeriría reconstruir dicho estado por otros medios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shiki42/s016-sortblocks-sequential-pi05-step20000
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/ctr-sortblocks-100ep-sequential (revisión `3d8db515f856c4e6c2612569b43fb15eeaef3064`)
- Resultados de búsqueda web: ninguna de las entradas devueltas (repositorios sobre prompts tipo DAN, temas de `chatgpt-api`, artículos sobre recuperación de chats de ChatGPT, listados de chatbots en vietnamita y documentación de modelos soportados en GitHub Copilot) guarda relación con este checkpoint de robótica, por lo que no se incluyen como enlaces relevantes.
- Paper, blog, repositorio o demo del autor: no disponibles en la información proporcionada.
