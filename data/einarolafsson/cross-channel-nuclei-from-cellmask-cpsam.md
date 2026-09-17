# einarolafsson/cross-channel-nuclei-from-cellmask-cpsam

## Resumen

Cross-channel nuclei-from-cellmask (Cellpose-SAM) es un modelo de segmentación de imágenes desarrollado por el usuario einarolafsson, publicado en HuggingFace bajo licencia CC-BY-4.0. Se trata de un ajuste fino (fine-tune) del modelo base `cpsam_v2` de Cellpose-SAM, entrenado durante 100 épocas en modo fichero. Su tarea es predecir máscaras de **núcleos** a partir de un canal de entrada que contiene una **máscara de células**, un problema de traducción entre canales (cross-channel) propio de la microscopía de alto contenido.

El modelo está diseñado para integrarse en [spaCR](https://github.com/EinarOlafsson/spacr), una herramienta de análisis espacial de fenotipos en cribados de microscopía. El caso de uso declarado gira en torno a experimentos con *Toxoplasma*, donde se necesita derivar la segmentación nuclear a partir de la segmentación celular ya disponible. El repositorio ocupa 12,2 GB e incluye pesos, checkpoints por época, métricas de control de calidad y registros de entrenamiento.

La relevancia del modelo radica en la mejora cuantitativa reportada sobre el modelo base: el F1 pasa de 0,2009 en `cpsam_v2` stock a 0,8881 en la mejor versión del ajuste, una mejora absoluta de 0,6872 (4,42 veces). No se dispone de información sobre arquitectura interna, número de parámetros ni ventana de contexto, ya que la model card no los detalla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de Cellpose-SAM, `cpsam_v2`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de segmentacion de imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | no disponible (ficheros de pesos de Cellpose: `weights/nuclei_from_cellmask` y `weights/nuclei_from_cellmask_best`) |
| Pipeline | image-segmentation |
| Tarea | Prediccion de nucleos a partir de un canal de mascara celular |
| Modelo base | `cpsam_v2` (Cellpose-SAM) |
| Entrenamiento | Fine-tune, 100 epocas, file-mode training |
| Tamano del repositorio | 12,2 GB |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-09-17 |
| Fecha de actualizacion | 2026-09-17 |

## Arquitectura y entrenamiento

La model card indica que el modelo es un ajuste fino de `cpsam_v2` (Cellpose-SAM), entrenado durante 100 épocas en modo fichero. No se especifican detalles sobre la arquitectura interna (tipo de backbone, capas, mecanismos de atención) más allá de su pertenencia a la familia Cellpose-SAM. Tampoco se documenta el número de tokens o imágenes de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de alineación como RLHF o DPO, que en cualquier caso no aplican a un modelo de segmentación.

El dato más relevante del proceso de entrenamiento es la metodología de evaluación: las métricas se calculan a IoU entre 0,50 y 0,95 en pasos de 0,05, y cada modelo se puntúa contra `cpsam_v2` stock sobre el mismo conjunto de validación (453 campos retenidos, divididos por pocillo para evitar fuga de información entre entrenamiento y validación). El conjunto de datos de entrenamiento está publicado como [einarolafsson/cross-channel-nuclei-from-cellmask](https://huggingface.co/datasets/einarolafsson/cross-channel-nuclei-from-cellmask).

Un caveat técnico documentado por el autor: el fichero `report.json` está marcado con `"reconstructed": true`. El entrenamiento finalizó y guardó los pesos, pero el proceso falló en una llamada de graficación antes de escribir el informe, por lo que los pesos guardados fueron **re-puntuados, no reentrenados**. Los campos exclusivos del entrenador (recuento de hosts, RSS pico, tiempo de pared) aparecen como `null` en lugar de estimarse.

## Capacidades

- Segmentación de núcleos a partir de un canal de máscara celular (traducción cross-channel).
- Generación de máscaras de instancias compatible con el ecosistema Cellpose (`models.CellposeModel`).
- Integración directa con spaCR mediante la opción `custom_model`.
- Evaluación cuantitativa contra el modelo stock `cpsam_v2` sobre el mismo holdout.
- Salida de métricas por imagen e IoU (F1, precisión, recall, mAP, AJI, Dice) en el directorio `qc/`.
- Checkpoints intermedios por época (0010 a 0090) para reproducibilidad y análisis.
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso, multimodalidad de texto, visión general, audio ni modo de pensamiento, dado que es un modelo especializado de segmentación.

## Casos de uso

- Análisis espacial de fenotipos en cribados de microscopía de alto contenido: el modelo permite derivar máscaras nucleares a partir de máscaras celulares ya generadas, habilitando el análisis de relaciones núcleo-citoplasma en pipelines de spaCR.
- Estudios de infección por *Toxoplasma*: la etiqueta `toxoplasma` del repositorio y las clases `toxo_pv_lumen` y `toxo_cyto` de spaCR sugieren su uso en la caracterización de vacuolas parasitóforas y su localización respecto al núcleo hospedador.
- Cribados farmacológicos de alto rendimiento: al mejorar el F1 de 0,2009 a 0,8881 sobre el modelo base, reduce la necesidad de corrección manual de máscaras nucleares en placas multipocillo.
- Segmentación de núcleos en imágenes de fluorescencia donde solo se dispone de un canal citoplasmático o de membrana fiable, y el canal nuclear es ruidoso o inexistente.
- Preprocesado de pipelines de fenotipado celular: las máscaras nucleares resultantes alimentan métricas morfológicas por célula en spaCR (`preprocess_generate_masks`).
- Control de calidad de segmentaciones previas: comparación automática contra `cpsam_v2` stock para decidir si conviene reentrenar o ajustar el modelo en un nuevo lote de datos.
- Análisis retrospectivo de conjuntos de datos con máscaras celulares ya anotadas, generando la capa nuclear sin repetir la adquisición de imágenes.
- Integración en entornos de investigación reproducibles: los checkpoints por época y los CSV de métricas permiten auditar el rendimiento y seleccionar la versión final o la mejor.

## Benchmarks y rendimiento

Resultados sobre 453 campos retenidos, divididos por pocillo (ningún pocillo aparece en ambos lados):

| Modelo | F1 | Precision | Recall | mAP | AJI | Dice |
|---|---|---|---|---|---|---|
| stock `cpsam_v2` | 0,2009 | 0,1988 | 0,2030 | 0,0227 | 0,2856 | 0,4493 |
| best | 0,8881 | 0,9323 | 0,8480 | 0,5362 | 0,7916 | 0,8774 |
| final | 0,8869 | 0,9316 | 0,8464 | 0,5380 | 0,7913 | 0,8770 |

La mejora de F1 sobre el modelo stock es de 0,6872 (4,42 veces). El autor advierte que la ratio de mAP está inflada por un denominador stock cercano a cero (0,0227), por lo que recomienda citar el delta y no la ratio. Las versiones «best» y «final» están prácticamente empatadas, lo que indica que el entrenamiento había alcanzado una meseta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible. El código de uso en Cellpose acepta `gpu=True`, lo que implica soporte de aceleración por GPU, pero la model card no especifica modelos concretos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: Cellpose (`models.CellposeModel(gpu=True, pretrained_model=w)`) y spaCR (`custom_model` con la ruta al fichero de pesos). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.
- Almacenamiento: el repositorio completo ocupa 12,2 GB, aunque el uso en producción solo requiere el fichero de pesos seleccionado (`nuclei_from_cellmask` o `nuclei_from_cellmask_best`).

## Comparativa con modelos similares

| Modelo | Tipo | F1 | Precision | Recall | mAP | AJI | Dice | Licencia |
|---|---|---|---|---|---|---|---|---|
| stock `cpsam_v2` (Cellpose-SAM) | Segmentacion general | 0,2009 | 0,1988 | 0,2030 | 0,0227 | 0,2856 | 0,4493 | no disponible |
| cross-channel-nuclei-from-cellmask (best) | Fine-tune cross-channel | 0,8881 | 0,9323 | 0,8480 | 0,5362 | 0,7916 | 0,8774 | CC-BY-4.0 |
| cross-channel-nuclei-from-cellmask (final) | Fine-tune cross-channel | 0,8869 | 0,9316 | 0,8464 | 0,5380 | 0,7913 | 0,8770 | CC-BY-4.0 |

No se dispone de información sobre otros modelos comparables de segmentación de núcleos cross-channel en la información proporcionada. La única referencia cuantitativa disponible es el modelo base `cpsam_v2`, sobre el que este ajuste mejora de forma sustancial en todas las métricas reportadas.

## Limitaciones y advertencias

- El informe de entrenamiento (`report.json`) está marcado como reconstruido: los pesos se re-puntuaron después de un fallo en la fase de graficación, por lo que los campos de entrenador (hosts, RSS pico, tiempo de pared) son nulos.
- El modelo está especializado en una tarea muy concreta (núcleos a partir de máscara celular) y en un dominio concreto (microscopía, con etiqueta *Toxoplasma*). Su generalización a otros tejidos, canales o modalidades no está documentada.
- No se especifican sesgos conocidos ni tasas de alucinación; en segmentación, el equivalente sería la generación de máscaras espurias o la omisión de núcleos, no cuantificado fuera del holdout descrito.
- La licencia CC-BY-4.0 permite uso comercial siempre que se atribuya la autoría; no se imponen restricciones adicionales, pero la atribución es obligatoria.
- En spaCR, `pathogen_model` no acepta una ruta libre: se valida contra una lista fija (`['toxo_pv_lumen', 'toxo_cyto']`). Un modelo personalizado debe pasar por `custom_model`, no por `pathogen_model`.
- En Cellpose, pasar un nombre de modelo no reconocido hace que la librería sustituya silenciosamente el modelo por su predeterminado; es obligatorio pasar una ruta real para evitar usar pesos incorrectos.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación independiente por terceros.
- Las fechas del repositorio (creación y actualización en 2026) deben verificarse en la fuente original antes de citarlas.
- No se documentan limitaciones de contexto ni de idioma porque no aplican a este tipo de modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/einarolafsson/cross-channel-nuclei-from-cellmask-cpsam
- Dataset de entrenamiento: https://huggingface.co/datasets/einarolafsson/cross-channel-nuclei-from-cellmask
- Repositorio spaCR: https://github.com/EinarOlafsson/spacr
- spaCR en PyPI: https://pypi.org/project/spacr/
- spaCR en conda-forge: https://anaconda.org/conda-forge/spacr
- Cellpose: no disponible en la informacion proporcionada (referenciado como dependencia de uso).
- Paper de Cellpose-SAM: no disponible en la informacion proporcionada.
- Los resultados de la busqueda web no contienen enlaces relevantes para este modelo; los resultados devueltos corresponden a entidades bancarias sin relacion con el contenido.
