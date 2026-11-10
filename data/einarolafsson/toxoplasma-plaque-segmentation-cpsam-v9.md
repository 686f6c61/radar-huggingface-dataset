# einarolafsson/toxoplasma-plaque-segmentation-cpsam-v9

## Resumen

Toxoplasma Plaque V9 es un checkpoint de segmentación de imágenes basado en Cellpose-SAM, especializado en la detección y delimitación de placas de *Toxoplasma gondii* en cultivos celulares. Lo desarrolla el usuario einarolafsson y se publica en Hugging Face como un modelo de segmentación de imágenes (pipeline `image-segmentation`) con la etiqueta `cellpose`. Se trata de un ajuste fino de un checkpoint pretrenado de Cellpose-SAM (`cpsam_v2`) sobre un conjunto curado de recortes de imágenes de placas.

El modelo resuelve un problema concreto de microscopía y biología celular: segmentar automáticamente las placas (áreas de lisis) que forman los parásitos en monocapas celulares, una tarea que de otro modo requiere revisión manual. Su relevancia es práctica y acotada al dominio: mejora de forma sustancial el rendimiento del checkpoint base de Cellpose-SAM sobre este tipo de imágenes, con un F1 de 0,6557 frente al 0,1999 del modelo original con sus propios umbrales.

El repositorio ocupa 1,2 GB y contiene un único checkpoint nativo de Cellpose-SAM. No es un modelo de lenguaje: no procesa texto ni tiene contexto conversacional, sino que opera sobre imágenes de 256x256 (ventanas de rejilla) y devuelve máscaras de segmentación. La información disponible es la de la model card y los metadatos de Hugging Face, sin datos adicionales sobre licencia o idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cellpose-SAM (checkpoint nativo de Cellpose) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; ventanas de 256x256 px) |
| Tipos de cuantizacion | no disponible (se recomienda `use_bfloat16=False`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | checkpoint nativo de Cellpose (`weights/cpsam_plaque_v9`) |

## Arquitectura y entrenamiento

El modelo es un checkpoint ordinario de Cellpose-SAM, inicializado desde el modelo pretrenado vanilla `cpsam_v2` y ajustado para la tarea de segmentación de placas de *Toxoplasma*. Cellpose-SAM combina un encoder de tipo SAM con el paradigma de flujos y mapas de probabilidad celular propios de Cellpose, lo que permite segmentar objetos sin necesidad de especificar el diámetro de antemano (`diameter=None`).

El entrenamiento se realizó sobre 810 recortes curados de imágenes, de los que se extrajeron 51.192 ventanas solapadas de 256x256 con stride 192. Cada época utilizó todas las ventanas, con aumento de datos D4 sobre la imagen completa. El run corresponde a la "V8 complete-coverage run", que terminó en la época 100 por su regla de meseta; la época 50 intermedia se publicó como `toxoplasma_plaque_v7`. Los umbrales de inferencia se seleccionaron sobre 102 recortes de validación. La receta, las versiones de software y el historial están en el directorio `training/` del repositorio. No se distribuyen imágenes privadas, máscaras ni el estado del optimizador.

## Capacidades

- Segmentación de imágenes de microscopía: detecta y delimita placas de *Toxoplasma* en cultivos celulares.
- Segmentación sin diámetro predefinido (`diameter=None`), gracias al enfoque de Cellpose-SAM.
- Procesamiento por ventanas de 256x256 con solapamiento (`tile_overlap=0.1`) para cubrir imágenes mayores.
- Inferencia con parámetros de flujo y probabilidad celular ajustados (`flow_threshold=0.4`, `cellprob_threshold=0.0`).
- Control de tamaño de objeto mediante `min_size` y `max_size_fraction` (0,4).
- Integración con la librería Cellpose vía `cellpose.models.CellposeModel`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es exclusivamente un modelo de visión para segmentación.

## Casos de uso

- Cuantificación automatizada de placas en ensayos de viabilidad: el modelo segmenta las áreas de lisis en cada pocillo, permitiendo contar y medir placas de forma reproducible sin revisión manual.
- Análisis de alto rendimiento de placas en placas multi-pocillo: con el redimensionado a 1500 px de lado mayor y el procesamiento por ventanas, se pueden procesar lotes de imágenes de forma sistemática.
- Detección de fármacos anti-*Toxoplasma*: la comparación de áreas de placa segmentadas entre condiciones tratadas y control sirve para evaluar la inhibición del crecimiento parasitario.
- Control de calidad en cultivos celulares: la segmentación permite detectar contaminaciones o formación anómala de placas en monocapas.
- Investigación en biología del parásito: la medición de tamaños de placa (la model card incluye gráficas de tamaños nativos y relativos) facilita estudios de virulencia y de factores del huésped.
- Integración en pipelines de análisis de imágenes con Cellpose: el checkpoint se puede invocar desde scripts de Python que ya usan `CellposeModel`, sustituyendo el modelo base por este ajuste fino.
- Reproducibilidad de experimentos: al publicarse la receta de entrenamiento y los umbrales de inferencia, otros laboratorios pueden replicar el análisis sobre sus propias imágenes.

## Benchmarks y rendimiento

Evaluación sobre 101 recortes de test con IoU de objeto >= 0,5 en píxeles originales:

| Metrica | Toxoplasma Plaque V9 | cpsam_v2 vanilla |
|---|---|---|
| F1 | 0,6557 | 0,1999 |
| Precision | 0,7059 | no disponible |
| Recall | 0,6122 | no disponible |

Los umbrales se seleccionaron sobre 102 recortes de validación y el test se usó solo para reportar. El autor advierte que estos 101 recortes de test ya se habían reportado para un intento anterior de V8 y para el intermedio de época 50 (`toxoplasma_plaque_v7`), por lo que no constituyen un test externo ni prospectivo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio pesa 1,2 GB, lo que da una orientación del orden de magnitud del checkpoint.
- GPU recomendadas: no disponibles de forma explícita; el modelo se ejecuta con `batch_size=8` y `bsize=256`, parámetros compatibles con GPU de consumo y de datacenter.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del checkpoint, aunque no se confirma en la información disponible.
- Opciones de despliegue: librería Cellpose (`cellpose.models.CellposeModel`), con `use_bfloat16=False`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | F1 en el test del autor | Licencia |
|---|---|---|---|---|---|
| Toxoplasma Plaque V9 | Cellpose-SAM ajustado | no disponible | ventanas 256x256 | 0,6557 | no disponible |
| cpsam_v2 (vanilla) | Cellpose-SAM base | no disponible | ventanas 256x256 | 0,1999 | no disponible |
| toxoplasma_plaque_v7 | Cellpose-SAM ajustado (época 50) | no disponible | ventanas 256x256 | no disponible en esta ficha | no disponible |

No se dispone de información sobre otros modelos comparables de segmentación de placas de *Toxoplasma*.

## Limitaciones y advertencias

- El test de 101 recortes no es externo ni prospectivo: ya se había usado para reportar versiones anteriores del mismo run, por lo que el F1 puede estar optimista.
- El rendimiento es específico del dominio (placas de *Toxoplasma* en cultivos celulares); no se garantiza su generalización a otras tareas de segmentación.
- La licencia no está disponible, lo que impide confirmar si se permite el uso comercial; conviene contactar con el autor antes de usarlo en producción.
- No se distribuyen imágenes privadas, máscaras ni estado del optimizador, lo que limita la reproducibilidad completa del entrenamiento.
- El modelo requiere seguir estrictamente el preprocesado indicado (redimensionado a 1500 px, normalización por percentiles 1/99, parámetros de inferencia concretos); desviarse de ellos puede degradar los resultados.
- No es un modelo de lenguaje: no tiene capacidades de texto, razonamiento, código ni multilingües, y no debe evaluarse con benchmarks de NLP.
- Riesgo de falsos positivos y negativos en imágenes con artefactos, baja calidad o morfologías de placa atípicas; se recomienda validación sobre el propio conjunto de imágenes antes de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/einarolafsson/toxoplasma-plaque-segmentation-cpsam-v9
- Repositorio de Cellpose (librería de inferencia): no disponible en la información proporcionada
- Paper de Cellpose-SAM: no disponible en la información proporcionada
- Demo o blog del autor: no disponible en la información proporcionada
