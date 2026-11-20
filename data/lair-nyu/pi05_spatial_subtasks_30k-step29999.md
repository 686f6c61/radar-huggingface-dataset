# lair-nyu/pi05_spatial_subtasks_30k-step29999

## Resumen

pi05_spatial_subtasks_30k-step29999 es un checkpoint de política robótica (policy) derivado de la familia pi05 y publicado por el grupo lair-nyu. Se trata del paso final (step 29999) del entrenamiento denominado `spatial_balanced_30k_v1`, orientado a la ejecución de subtareas espaciales en entornos de manipulación robótica. El modelo se distribuye a través de la librería openpi y emplea el formato de pesos nativo de ese ecosistema, con un tamaño de repositorio de 12,4 GB que corresponde únicamente a los pesos del modelo (`params/`), las estadísticas de normalización (`assets/norm_stats.json`) y los metadatos del checkpoint.

El modelo no es un modelo de lenguaje generalista, sino una política visuomotora entrenada para control robótico, por lo que su relevancia es acotada al ámbito de la investigación en robótica y aprendizaje por imitación. Su interés radica en que documenta un experimento reproducible de entrenamiento por subtareas espaciales balanceadas, con configuración de entrenamiento publicada (pi-atlas) y fijada a commits concretos, lo que facilita la replicación del pipeline.

La información pública disponible es muy limitada: no se especifican parámetros, contexto, idiomas ni licencia, y el repositorio no registra descargas ni interacciones. La model card se limita a describir el procedimiento de carga y el origen del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia pi05, política visuomotora; detalles no publicados) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | pesos nativos de openpi (`params/`), más `assets/norm_stats.json` y `_CHECKPOINT_METADATA` |

## Arquitectura y entrenamiento

El modelo pertenece a la familia pi05 y se ha entrenado con el framework pi-atlas, usando la configuración `configs/pi05_spatial_subtasks_30k.py` fijada al commit `cf6349bed0b3c86ee5b000294835e8d770a40ca9`, sobre openpi en el commit `c5efff14d4ea36a09a0b365cd0dc60a527027b73 (dirty)`. El entrenamiento corresponde a la ejecución `spatial_balanced_30k_v1`, con 30 000 pasos y este checkpoint como paso final (29999). No se detalla en la información disponible la arquitectura interna (tipo de transformer, número de parámetros, mecanismo de atención o integración multimodal), ni el volumen o composición exacta del dataset más allá de la referencia a subtareas espaciales balanceadas.

El repositorio incluye `subtask_summary.json`, que lista las subtareas de entrenamiento, el número de chunks, la proporción de muestras y los episodios reservados para validación (held-out). Se ha eliminado el estado del optimizador (`train_state/`), por lo que el checkpoint sirve para inferencia pero no para reanudar el entrenamiento. La carga requiere la configuración de entrenamiento de pi-atlas, que aporta la arquitectura del modelo y las transformaciones de datos; sin ella, los pesos no son utilizables directamente.

## Capacidades

- Control robótico visuomotor: genera acciones a partir de observaciones, orientado a la ejecución de subtareas espaciales.
- Ejecución de subtareas balanceadas: el entrenamiento se organiza en subtareas con proporciones de muestras controladas, según `subtask_summary.json`.
- Inferencia mediante openpi: se carga con `policy_config.create_trained_policy` usando la configuración de pi-atlas.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni multilingüismo.
- No se documentan modos especiales (thinking, audio, etc.).

## Casos de uso

- Investigación en aprendizaje por imitación robótica: servir como checkpoint de referencia para reproducir el experimento `spatial_balanced_30k_v1` y comparar resultados con otras ejecuciones de la misma familia.
- Evaluación de políticas por subtareas: emplear `subtask_summary.json` para analizar el rendimiento por subtarea y la proporción de muestras empleada en cada una.
- Fine-tuning posterior: partir de los pesos como inicialización para nuevos entrenamientos con pi-atlas, dado que el estado del optimizador no se incluye y habría que reiniciarlo.
- Despliegue en pipelines de openpi: integrar la política en un entorno de inferencia openpi para experimentos de manipulación en laboratorio.
- Estudio de transferencia espacial: analizar cómo un entrenamiento con subtareas espaciales balanceadas afecta a la generalización en episodios held-out.
- Docencia y formación: usar el repositorio como ejemplo práctico de entrenamiento y carga de políticas robóticas con pi-atlas y openpi.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del repo es de 12,4 GB, lo que da una cota inferior orientativa para cargar los pesos, pero no se especifica el consumo real).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: inferencia mediante openpi (`policy_config.create_trained_policy`) con la configuración de pi-atlas; no se documentan otros runners (vLLM, llama.cpp, Ollama, TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La comparativa con otras políticas de la familia pi05 o con alternativas de robótica no está disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05_spatial_subtasks_30k-step29999 | no disponible | no disponible | no disponible | no disponible | Hugging Face (openpi) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Información muy escasa: no se publican parámetros, arquitectura, contexto, idiomas ni licencia, lo que impide evaluar el modelo con rigor.
- Licencia no disponible: no puede confirmarse el uso comercial ni la redistribución; conviene contactar con el autor antes de cualquier uso en producción.
- Dependencia de pi-atlas: los pesos no son utilizables sin la configuración de entrenamiento correspondiente, lo que limita la portabilidad.
- Checkpoint sin estado del optimizador: no permite reanudar el entrenamiento tal cual; solo sirve para inferencia o para reiniciar un fine-tuning.
- Riesgo de sobreajuste a las subtareas de entrenamiento: al tratarse de un experimento concreto (`spatial_balanced_30k_v1`), la generalización a otros entornos no está documentada.
- Sin métricas de rendimiento publicadas: no hay evidencia cuantitativa de éxito en tareas ni de robustez frente a variaciones del entorno.
- Repositorio sin descargas ni interacciones: no hay validación comunitaria ni reportes de uso.
- Posibles sesgos derivados de la composición del dataset de subtareas, no documentada en detalle.

## Enlaces

- Hugging Face: https://huggingface.co/lair-nyu/pi05_spatial_subtasks_30k-step29999
- Repositorio pi-atlas: https://github.com/LucaMacesanu/pi-atlas
- Configuración de entrenamiento: `configs/pi05_spatial_subtasks_30k.py` (commit `cf6349bed0b3c86ee5b000294835e8d770a40ca9`) en el repositorio pi-atlas
- openpi (commit de referencia): `c5efff14d4ea36a09a0b365cd0dc60a527027b73`
