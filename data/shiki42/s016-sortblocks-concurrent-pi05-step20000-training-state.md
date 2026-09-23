# Shiki42/s016-sortblocks-concurrent-pi05-step20000-training-state

## Resumen

Este repositorio publica un checkpoint de entrenamiento completo del modelo π₀.₅ (Pi05) de Physical Intelligence, generado por el usuario Shiki42 dentro del ecosistema OpenPI para robótica. No se trata de un modelo de lenguaje al uso, sino de un modelo visión-lenguaje-acción (VLA, Vision-Language-Action) orientado a control robótico, concretamente a la tarea de clasificación de bloques (*sortblocks*) del experimento E763. El checkpoint corresponde al paso 20.000 de optimización.

A diferencia de un repositorio de inferencia, esta publicación incluye de forma intencionada el estado completo del entrenamiento: `params/`, `assets/`, `train_state/`, `data_loader/` y `_CHECKPOINT_METADATA`. El checkpoint original contiene 375 archivos y 9.551.614.345 bytes, y viene acompañado de ficheros de proveniencia (`resolved_config.json`, `training-provenance.json`, `resume-provenance.json`) y de un `SHA256SUMS` que fija cada archivo publicado.

Su relevancia es acotada pero específica: permite reproducir o continuar un entrenamiento concreto (por ejemplo, una continuación a 30k pasos) y auditar la cadena de proveniencia de un run de robótica. El propio autor advierte de que la auditoría está pendiente y de que esta publicación por sí sola no establece una tasa de éxito de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo visión-lenguaje-acción (VLA) basado en π₀.₅ (Pi05) de Physical Intelligence; detalles internos de capas no disponibles en la información proporcionada |
| Parametros totales | no disponible (el checkpoint ocupa 9.551.614.345 bytes en 375 archivos, pero no se desglosa el reparto entre parámetros, estado del optimizador y data loader) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés, según los tags del repositorio) |
| Licencia | no disponible (el repositorio no declara licencia) |
| Formato de pesos | Directorio de parámetros `params/` junto con `train_state/`, `assets/`, `data_loader/` y `_CHECKPOINT_METADATA`; el formato exacto de serialización no se especifica en la model card |
| Tamano del repositorio | 9,6 GB |
| Framework / libreria | openpi |
| Pipeline declarado | robotics |
| Paso de entrenamiento | 20.000 updates del optimizador |
| Batch size | 16 |
| Semilla | 87431 |
| Dataset de entrenamiento | Shiki42/ctr-sortblocks-100ep-concurrent (revisión `b93f1c7b54f2b17110349049ad8f0a091493acd0`) |
| Experimento / run | E763 / E763-R001 |
| Commit CTR | `abd0960751825a92db3394703722204fa4e8f510` |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-23 |

## Arquitectura y entrenamiento

La información disponible identifica el modelo como un checkpoint de π₀.₅ (Pi05), descrito en la documentación de LeRobot como un modelo visión-lenguaje-acción con generalización en mundo abierto, procedente del repositorio OpenPI de Physical Intelligence. No se detallan en la model card aspectos como el número de capas, el backbone de visión, el mecanismo de atención, la dimensión de las representaciones de acción ni el tipo exacto de cabezal de acción, por lo que no es posible describir la arquitectura interna con rigor.

En cuanto al entrenamiento, los datos publicados indican 20.000 actualizaciones del optimizador con batch 16 y semilla 87431 sobre el dataset `ctr-sortblocks-100ep-concurrent`, un conjunto de 100 episodios de una tarea de clasificación de bloques. Se especifica que el consumo de pérdida con IdleMask es `false`. El repositorio incluye el estado del optimizador y del data loader, lo que permite reanudar el entrenamiento, y fija la configuración, el dataset, el runtime y el run mediante ficheros de proveniencia con hashes SHA-256. No se indica en la información disponible si hubo RLHF, DPO u otras fases de ajuste, ni el número total de tokens o frames procesados.

## Capacidades

- Control robótico de manipulación: el pipeline declarado es `robotics` y el checkpoint está entrenado para la tarea de ordenación de bloques (*sortblocks*) del dataset `ctr-sortblocks-100ep-concurrent`.
- Acondicionamiento visión-lenguaje-acción: al derivar de π₀.₅, el modelo pertenece a la familia VLA, que combina entrada visual y de lenguaje con salida de acciones; la model card no detalla las modalidades exactas soportadas.
- Reanudación de entrenamiento: al incluir `train_state/`, `data_loader/` y metadatos, el checkpoint está pensado para continuar el entrenamiento desde el paso 20.000.
- Reproducibilidad y auditoría: los ficheros `resolved_config.json`, `training-provenance.json`, `resume-provenance.json` y `SHA256SUMS` permiten verificar la configuración y la integridad de los archivos.
- Tool calling / function calling: no disponible; no se menciona en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se menciona en la información proporcionada.
- Capacidades multilingües: el tag de idioma declarado es únicamente `en`; no se documentan otras lenguas.
- Capacidades especiales (modo thinking, audio, etc.): no disponible.

## Casos de uso

- Reanudación del entrenamiento hasta 30k pasos: el repositorio incluye `train_state/` y `data_loader/`, por lo que un equipo puede restaurar el estado y continuar el run E763 desde el update 20.000, tal y como sugiere el propio autor al mencionar una continuación a 30k que requeriría su propio flujo de restauración registrado y cualificado.
- Auditoría de proveniencia de un run de robótica: los hashes SHA-256 del manifiesto de runtime, del recibo de cualificación del checkpoint y del `SHA256SUMS` permiten verificar que los archivos evaluados son exactamente los producidos por el entrenamiento, algo crítico cuando se publican resultados de manipulación.
- Reproducción de experimentos en robótica: al fijar el dataset a una revisión concreta (`b93f1c7b...`) y el commit de CTR (`abd0960...`), otro laboratorio puede repetir el pipeline y comparar si obtiene el mismo estado tras 20.000 updates con batch 16 y semilla 87431.
- Investigación sobre tareas de clasificación de bloques: el modelo está especializado en la tarea *sortblocks*, útil como punto de partida para estudiar generalización dentro de esa familia de tareas de manipulación.
- Base para comparativas de pipelines VLA: sirve como referencia de un entrenamiento OpenPI concreto frente a otros checkpoints de la misma familia (por ejemplo, `lerobot/pi05_base`) para medir el efecto del ajuste sobre un dataset de 100 episodios.
- Integración en entornos de investigación con LeRobot: LeRobot documenta una implementación de π₀.₅ adaptada de OpenPI, por lo que este checkpoint puede emplearse en flujos de trabajo de esa librería para experimentación, siempre que se resuelva la licencia.
- Punto de partida para ajuste fino en tareas de manipulación relacionadas: los pesos de `params/` pueden servir como inicialización para otras tareas de pick-and-place, aunque no hay evaluación publicada que respalde su transferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la publicación por sí sola no establece una tasa de éxito de evaluación y que la auditoría está pendiente.

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 9,6 GB y el checkpoint fuente 9.551.614.345 bytes distribuidos en 375 archivos; se necesita al menos ese espacio en disco para descargarlo completo.
- Memoria en host: cargar la totalidad del checkpoint (parámetros más estado del optimizador y del data loader) requiere como mínimo un volumen de memoria comparable al tamaño publicado; no se especifica el desglose por componente.
- VRAM para inferencia: no disponible. Al tratarse de un modelo VLA con estado de entrenamiento incluido, la VRAM necesaria depende del framework, de la precisión y de si se cargan solo los parámetros o también el estado del optimizador, datos que no se publican.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; no puede confirmarse que quepa en tarjetas tipo RTX 4090 sin datos de tamaño de parámetros y precisión.
- Opciones de despliegue: OpenPI (framework original del checkpoint) y LeRobot, que documenta una implementación de π₀.₅ adaptada de OpenPI. No se indica soporte para vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para un modelo de acción robótica.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shiki42/s016-sortblocks-concurrent-pi05-step20000-training-state | Checkpoint VLA (π₀.₅) con estado de entrenamiento | no disponible | no disponible | no disponible | Público en HuggingFace, 0 descargas, 0 likes |
| lerobot/pi05_base | Modelo VLA base π₀.₅ | no disponible | no disponible | no disponible | Público en HuggingFace |
| Repositorio de inferencia del mismo autor (mencionado en la model card) | Modelo VLA π₀.₅ solo para inferencia | no disponible | no disponible | no disponible | Referenciado, sin URL en la información disponible |

No se dispone de datos de parámetros, contexto, rendimiento ni licencia de las alternativas en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Auditoría pendiente: el autor indica explícitamente que la auditoría del checkpoint está pendiente.
- Sin evaluación publicada: no hay tasa de éxito, benchmarks ni métricas de la tarea *sortblocks* en la información disponible; no debe asumirse que el modelo funcione bien en manipulación real.
- Licencia no declarada: al no especificarse licencia, el uso comercial es jurídicamente incierto y no está autorizado de forma explícita. Hay que verificar además la licencia del modelo base π₀.₅ y del framework OpenPI antes de cualquier uso.
- Especialización estrecha: el entrenamiento se realizó sobre un único dataset de 100 episodios de clasificación de bloques, lo que limita la generalización fuera de esa tarea.
- Idioma: el único idioma declarado es inglés; se desconoce el comportamiento con instrucciones en castellano.
- Contiene estado de entrenamiento, no solo pesos: `train_state/` y `data_loader/` aumentan el tamaño y no son necesarios para inferencia, pero pueden exponer detalles del pipeline de entrenamiento.
- Reproducibilidad condicionada: la continuación a 30k requiere un flujo de restauración registrado y cualificado que este repositorio no proporciona.
- Riesgo de alucinación y sesgos: no evaluables con la información disponible; en un modelo VLA el fallo se manifiesta como acciones incorrectas o inseguras, no como texto inventado.
- Metadatos llamativos: las fechas de creación y actualización (2026-09-23) y el contador de descargas a cero deben tenerse en cuenta al valorar la madurez y el uso real del artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shiki42/s016-sortblocks-concurrent-pi05-step20000-training-state
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/ctr-sortblocks-100ep-concurrent
- Documentación de π₀.₅ en LeRobot: https://github.com/huggingface/lerobot/blob/main/docs/source/pi05.mdx
- Modelo base π₀.₅ en LeRobot: https://huggingface.co/lerobot/pi05_base
- Repositorio OpenPI de Physical Intelligence (referenciado en la documentación de LeRobot): https://github.com/Physical-Intelligence/openpi
