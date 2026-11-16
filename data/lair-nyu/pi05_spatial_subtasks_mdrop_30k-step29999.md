# lair-nyu/pi05_spatial_subtasks_mdrop_30k-step29999

## Resumen

Este repositorio contiene un checkpoint (paso 29999) del modelo `pi05_spatial_subtasks_30k`, un modelo de política robótica basado en la familia pi05 (Physical Intelligence) y entrenado con el framework openpi. Lo publica el grupo lair-nyu y su interés principal reside en la variante de entrenamiento: aplica *modality dropout* por muestra para que el modelo aprenda a operar cuando faltan entradas sensoriales (cámara de cabeza, cámaras de muñeca o el objetivo espacial). El modelo está pensado para control robótico de manipulación a partir de instrucciones en lenguaje natural e imágenes.

El checkpoint se distribuye únicamente con los pesos (`params/`), las estadísticas de normalización (`assets/norm_stats.json`) y metadatos (`_CHECKPOINT_METADATA`); se excluye el estado del optimizador. El tamaño del repositorio es de 12,4 GB, coherente con un modelo de política de varios miles de millones de parámetros en precisión completa o media. No se publican datos de licencia, idiomas ni benchmarks en la información disponible.

Su relevancia es doble: por un lado, documenta una receta de aumento de datos orientada a robustez ante fallos de sensores (un escenario habitual en robots reales); por otro, al requerir la configuración de entrenamiento de pi-atlas para cargarse, sirve como referencia reproducible para quien quiera replicar o extender el entrenamiento con *modality dropout*.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia pi05, política robótica; detalles arquitectónicos no publicados en la información disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | pesos en `params/` (formato nativo de openpi; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia pi05 y se entrena con openpi (commit `c5efff14d4ea36a09a0b365cd0dc60a527027b73`), usando la configuración `configs/pi05_spatial_subtasks_mdrop_30k.py` del repositorio pi-atlas (commit `90b5b61f8129892fef59f421be78679226cae798`, marcado como *dirty*). La innovación destacable no está en la arquitectura, sino en el esquema de *modality dropout* aplicado por muestra durante el entrenamiento: un 40 % de las muestras pierden todas las entradas, un 10 % pierde el objetivo espacial, un 15 % pierde la cámara de cabeza, un 15 % pierde las cámaras de muñeca y un 20 % pierde todas las cámaras. Las cámaras enmascaradas se rellenan en negro y se marcan como inválidas, mientras que la inferencia no se modifica.

El checkpoint corresponde al paso 29999 de un entrenamiento de 30 000 pasos. El repositorio incluye `subtask_summary.json`, que documenta las subtareas de entrenamiento, el número de *chunks*, la proporción de muestras y los episodios reservados (*held-out*). No se especifican el número de tokens, la composición del dataset ni si se aplicaron RLHF o DPO; tampoco se detalla el mecanismo de atención ni si hay decodificación especulativa.

## Capacidades

- Control robótico de manipulación a partir de observaciones visuales e instrucciones en lenguaje natural, en el marco de openpi.
- Ejecución de subtareas espaciales: el nombre del checkpoint sugiere entrenamiento sobre subtareas con objetivo espacial explícito.
- Robustez ante entradas faltantes: al haber sido entrenado con *modality dropout*, el modelo está expuesto a escenarios sin cámara de cabeza, sin cámaras de muñeca, sin objetivo espacial o sin ninguna entrada visual.
- Procesamiento multimodal de imágenes de cámara (cabeza y muñecas) y de un objetivo espacial.
- No se documentan en la información disponible capacidades de *tool calling*, razonamiento multi-paso, generación de código, matemáticas ni multilingüismo.

## Casos de uso

- Manipulación robótica en entornos con sensores degradados: el *modality dropout* permite desplegar el modelo cuando una cámara falla o se obstruye, manteniendo una política utilizable en lugar de producir salidas inválidas.
- Evaluación de robustez ante ablaciones de sensores: sirve como referencia para medir cuánto degrada cada modalidad (cámara de cabeza, muñecas, objetivo espacial) el rendimiento de la política.
- Investigación en aprendizaje por imitación con subtareas: el `subtask_summary.json` facilita analizar la distribución de subtareas y episodios reservados para reproducir experimentos.
- Entrenamiento de políticas con aumento de datos: la receta de *modality dropout* puede transferirse a otros conjuntos de datos robóticos para mejorar la tolerancia a fallos.
- Despliegue en robots de bajo coste con menos cámaras: al tolerar la ausencia de cámaras de muñeca, el modelo puede evaluarse en plataformas con un único sensor visual.
- Reproducción de experimentos en openpi: el checkpoint y la configuración de pi-atlas permiten reanudar la evaluación o comparar contra el modelo base sin *dropout*.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 12,4 GB, lo que da una cota inferior del espacio en disco necesario para los pesos.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño de los pesos sugiere que no cabrá en GPUs de consumo de gama media sin cuantización, pero no se especifican formatos de cuantización.
- Opciones de despliegue: carga mediante `policy_config.create_trained_policy` de openpi junto con la configuración de pi-atlas; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de política robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05_spatial_subtasks_mdrop_30k (este) | no disponible | no disponible | sin benchmarks publicados | no disponible | Hugging Face (lair-nyu) |
| pi05 base (familia pi05) | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| Alternativas de política robótica openpi | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con modelos alternativos.

## Limitaciones y advertencias

- La licencia no está especificada, por lo que no puede confirmarse el uso comercial ni la redistribución.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado con datos robóticos propios, puede heredar sesgos de las tareas y entornos de recogida.
- Riesgo de alucinación: no evaluado; en políticas robóticas el fallo se manifiesta como acciones incorrectas o inseguras, no como texto inventado.
- La carga requiere la configuración de entrenamiento de pi-atlas, que no estaba *commiteada* en el momento de la subida; el commit indicado está marcado como *dirty*, lo que compromete la reproducibilidad exacta.
- Solo se incluyen pesos, estadísticas de normalización y metadatos; no hay estado del optimizador para reanudar el entrenamiento.
- No se especifican idiomas soportados ni limitaciones de contexto.
- El checkpoint corresponde al paso 29999 de 30 000; no se documenta su rendimiento frente a otros pasos.
- Cualquier despliegue en un robot real requiere validación de seguridad independiente.

## Enlaces

- [Hugging Face: lair-nyu/pi05_spatial_subtasks_mdrop_30k-step29999](https://huggingface.co/lair-nyu/pi05_spatial_subtasks_mdrop_30k-step29999)
- [Repositorio pi-atlas](https://github.com/LucaMacesanu/pi-atlas)
- [openpi (commit de entrenamiento)](https://github.com/Physical-Intelligence/openpi)
