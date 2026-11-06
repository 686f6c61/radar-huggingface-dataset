# einarolafsson/toxoplasma-plaque-segmentation-cpsam-v8-e50

## Resumen

El modelo `toxoplasma-plaque-segmentation-cpsam-v8-e50` es un checkpoint de segmentación de imágenes desarrollado por el usuario de Hugging Face einarolafsson. Se trata de una exportación interina del modelo de placas de *Toxoplasma* V8 en la época 50 de entrenamiento, mientras el entrenamiento continúa hasta al menos 100 épocas. El modelo se publica como un checkpoint nativo de Cellpose-SAM, inicializado a partir del modelo preentrenado vanilla `cpsam_v2`, y está especializado en la segmentación de placas de *Toxoplasma* en imágenes de laboratorio.

El modelo resuelve un problema muy concreto: la detección y segmentación automática de placas de *Toxoplasma* (zonas de lisis celular) en cultivos, una tarea de microscopía que normalmente requiere análisis manual o herramientas genéricas con bajo rendimiento. Según la model card, el modelo alcanza un F1 de 0,6677 en el conjunto de test (101 recortes), frente al 0,1999 del modelo vanilla `cpsam_v2` con sus propios umbrales, lo que supone una mejora sustancial en esta tarea específica.

Es relevante ahora porque demuestra cómo un modelo fundacional de segmentación celular (Cellpose-SAM) puede adaptarse mediante fine-tuning a un dominio microscópico muy específico con un conjunto de datos curado relativamente pequeño (810 recortes de entrenamiento). No obstante, se trata de una versión interina y no de la versión final, y su licencia no está especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cellpose-SAM (checkpoint nativo de Cellpose, inicializado desde `cpsam_v2`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (pesos nativos de Cellpose; se recomienda `use_bfloat16=False`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | pesos nativos de Cellpose (`weights/cpsam_plaque_v8_e50`) |

## Arquitectura y entrenamiento

El modelo es un checkpoint de Cellpose-SAM, una arquitectura de segmentación de imágenes basada en SAM (Segment Anything Model) adaptada por Cellpose para segmentación celular. El checkpoint se inicializa desde el modelo preentrenado vanilla `cpsam_v2` y se fine-tunea para la tarea específica de segmentación de placas de *Toxoplasma*. No se dispone de información sobre el número de parámetros totales ni sobre la arquitectura interna detallada (número de capas, dimensión de embeddings, etc.).

El entrenamiento utilizó 810 recortes de entrenamiento curados, de los cuales se extrajeron 51.192 ventanas solapadas de 256x256 píxeles con stride 192. Cada época utilizó todas las ventanas con aumento de datos D4 sobre la imagen completa. La receta, versiones de software e historial de entrenamiento están documentados en el directorio `training/` del repositorio. No se menciona el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de segmentación. La innovación técnica principal es la adaptación de un modelo fundacional de segmentación celular a un dominio microscópico específico mediante fine-tuning supervisado con un conjunto de datos curado, logrando una mejora de F1 de 0,1999 a 0,6677.

## Capacidades

- Segmentación de imágenes de microscopía para detectar placas de *Toxoplasma* (zonas de lisis en cultivos celulares).
- Segmentación de instancias (cada placa se detecta como un objeto independiente), no solo segmentación semántica.
- Funciona como checkpoint nativo de Cellpose, por lo que se integra con la API `cellpose.models.CellposeModel`.
- Inferencia sobre imágenes redimensionadas a 1500 px de lado mayor, con normalización a percentiles 1/99.
- Parámetros de inferencia configurables: `diameter=None`, `batch_size=8`, `bsize=256`, `tile_overlap=0.1`, `min_size=0`, `max_size_fraction=0.4`, `cellprob_threshold=0.0`, `flow_threshold=0.4`, `niter=max(200, ceil(200*resize_ratio))`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de visión.
- No dispone de modo "thinking", visión general, audio ni otras capacidades multimodales más allá de la segmentación de imágenes.

## Casos de uso

- Cuantificación de placas de *Toxoplasma* en ensayos de laboratorio: el modelo segmenta automáticamente las placas en imágenes de cultivo, permitiendo contar y medir su área sin revisión manual, lo que acelera experimentos de viabilidad o virulencia.
- Análisis de ensayos de fármacos antiparasitarios: al detectar y medir placas, se puede evaluar el efecto de compuestos sobre la formación de placas comparando métricas de área y número entre condiciones control y tratadas.
- Automatización de pipelines de microscopía: integrado en flujos de procesamiento por lotes, el modelo procesa imágenes de placas de 1500 px con parámetros de tileado (`bsize=256`, `tile_overlap=0.1`) adecuados para imágenes grandes.
- Control de calidad en cultivos celulares: la segmentación permite monitorizar la confluencia y la formación de placas a lo largo del tiempo en experimentos de cinética de infección.
- Investigación en biología de *Toxoplasma*: la segmentación precisa facilita estudios de formación de placas como fenotipo de virulencia y comparación entre cepas.
- Docencia y formación en microscopía: como ejemplo de fine-tuning de Cellpose-SAM para un dominio específico, sirve de base para que otros grupos adapten el modelo a sus propias tareas de segmentación.
- Prototipado rápido en laboratorios con recursos limitados: al ser un checkpoint de Cellpose, puede ejecutarse en GPUs de consumo con los parámetros de inferencia recomendados, aunque no se especifican requisitos exactos de VRAM.

## Benchmarks y rendimiento

| Metrica | V8 e50 (test, 101 recortes) | cpsam_v2 vanilla (umbrales propios) |
|---|---|---|
| F1 (IoU >= 0.5, píxeles originales) | 0,6677 | 0,1999 |
| Precision | 0,7537 | no disponible |
| Recall | 0,5994 | no disponible |

Los umbrales se seleccionaron sobre 102 recortes de validación; el conjunto de test se usó solo para reportar. Los 101 recortes de test ya se habían reportado para un intento V8 anterior, por lo que no constituyen un test externo ni prospectivo fresco. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) por tratarse de un modelo de segmentación de imágenes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el tamaño del repositorio es de 1,2 GB, lo que sugiere que los pesos caben en GPUs de consumo, pero no se confirma.
- GPU recomendadas: no disponible; Cellpose-SAM suele ejecutarse en GPUs NVIDIA con soporte CUDA, pero no se especifican modelos concretos.
- ¿Cabe en GPU de consumo? No confirmado; el tamaño de 1,2 GB del repositorio es compatible con GPUs de consumo, pero no hay datos oficiales.
- Opciones de despliegue: la API nativa de Cellpose (`cellpose.models.CellposeModel`) con `use_bfloat16=False`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | F1 en placas de Toxoplasma | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| toxoplasma-plaque-segmentation-cpsam-v8-e50 | Cellpose-SAM fine-tuneado | no disponible | no aplica | 0,6677 | no disponible | Hugging Face |
| cpsam_v2 (vanilla) | Cellpose-SAM preentrenado | no disponible | no aplica | 0,1999 | no disponible | Hugging Face / Cellpose |
| Otros modelos Cellpose específicos | Cellpose | no disponible | no aplica | no disponible | no disponible | no disponible |

La comparativa se limita al modelo vanilla del que parte, ya que no se dispone de información sobre otros modelos especializados en segmentación de placas de *Toxoplasma*.

## Limitaciones y advertencias

- Es una exportación interina (época 50) mientras el entrenamiento continúa hasta al menos 100 épocas; la versión final V8 se publicará por separado y puede diferir en rendimiento.
- Los 101 recortes de test ya se habían reportado para un intento V8 anterior; no constituyen un test externo ni prospectivo, por lo que el F1 de 0,6677 puede no generalizar a imágenes nuevas o de otros laboratorios.
- El recall es moderado (0,5994), lo que implica que el modelo pierde aproximadamente el 40 % de las placas en el conjunto de test; para aplicaciones de cuantificación esto puede sesgar los recuentos.
- La licencia no está especificada, por lo que no se puede confirmar el uso comercial; es imprescindible contactar con el autor antes de usarlo en producción.
- No se distribuyen imágenes privadas, máscaras ni el estado del optimizador, lo que limita la reproducibilidad completa del entrenamiento.
- El modelo está especializado en un dominio muy concreto (placas de *Toxoplasma* en un tipo de imágenes de microscopía); no es un modelo general de segmentación y probablemente tendrá un rendimiento pobre fuera de ese dominio.
- Requiere seguir estrictamente los parámetros de inferencia recomendados (redimensionado a 1500 px, normalización 1/99, `use_bfloat16=False`); desviarse de ellos puede degradar el rendimiento.
- No se dispone de información sobre sesgos, riesgo de alucinación (no aplica en el sentido de texto, pero sí puede producir segmentaciones falsas) ni limitaciones de idioma (no es un modelo de lenguaje).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/einarolafsson/toxoplasma-plaque-segmentation-cpsam-v8-e50
- Cellpose (repositorio oficial): https://github.com/MouseLand/cellpose
- Cellpose-SAM (modelo base `cpsam_v2`): no disponible en la información proporcionada
- Documentación de entrenamiento (`training/`): incluida en el repositorio del modelo
- Imágenes de métricas y tarjetas: `cards/page1.png`, `cards/page2.png`, `cards/page3.png`, `cards/page4.png` en el repositorio
