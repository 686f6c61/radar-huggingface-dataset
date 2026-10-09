# einarolafsson/toxoplasma-plaque-segmentation-cpsam-r5-geldoc

## Resumen

El modelo `einarolafsson/toxoplasma-plaque-segmentation-cpsam-r5-geldoc` es un ajuste fino de Cellpose-SAM (`cpsam`, Cellpose 4.0.9) orientado a la segmentacion de placas de lisis de *Toxoplasma gondii* en imagenes de microscopia. Lo desarrolla el usuario de HuggingFace einarolafsson y pertenece a la familia de modelos de segmentacion de placas de Toxoplasma mantenida por el mismo autor, de la que ya existe una variante previa (`toxoplasma-plaque-segmentation-cpsam-r5`) construida sobre `cpsam_v2` y con una particion de entrenamiento distinta de 332 campos.

El problema que resuelve es la cuantificacion automatica de ensayos de placa (plaque assays): contar y medir el area de placas a partir de imagenes de microscopia, una tarea que tradicionalmente se hace a mano y que es cuello de botella en cribados de compuestos antiparasitarios. El modelo esta etiquetado explicitamente como candidato y no promovido, con los grupos GRA8__Plate1, HI__Plate6 y Low__Plate3 reservados como conjuntos de validacion.

Se distribuye bajo licencia CC-BY-4.0, con un repositorio de 1,2 GB que contiene los pesos, las curvas de entrenamiento y los artefactos de evaluacion, pero no las imagenes ni las mascaras originales de entrenamiento. No se publican detalles de la arquitectura interna, el numero de parametros ni la longitud de contexto, por lo que varias especificaciones habituales figuran como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cellpose-SAM (`cpsam`), ajuste fino sobre Cellpose 4.0.9; no se detallan el backbone ni la cabeza en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de segmentacion de imagen, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (no es un modelo de lenguaje) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | no disponible (el repositorio incluye el directorio `weights/cpsam_plaque_r5_geldoc` sin especificar el formato en la informacion proporcionada) |
| Autor | einarolafsson |
| Tarea (pipeline) | image-segmentation |
| Tamano del repositorio | 1,2 GB |
| Fecha de creacion | 2026-10-09 |
| Fecha de actualizacion | 2026-10-09 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de Cellpose-SAM en su variante `cpsam` de Cellpose 4.0.9 y se ajusta de forma supervisada sobre imagenes de microscopia con anotaciones de placas. La informacion disponible no describe el backbone, el numero de capas ni el mecanismo de atencion, mas alla de la referencia a Cellpose-SAM y a la generacion de flujos y estilos que devuelve la API `CellposeModel.eval`. La inferencia se realiza con `normalize=True` y, en la configuracion recomendada para el dominio de este candidato, `min_size=0`.

El entrenamiento se realizo durante 100 epocas con learning rate 1e-5, weight decay 0.1, batch 1, `min_train_masks=0` y un rango de escala de 0.5. La particion de datos queda fijada con semilla 42 y el entrenamiento con semilla 0. El conjunto de entrenamiento consta de 496 campos curados, entre ellos 34 negativos vacios aceptados y 71 pocillos adquiridos con Bio-Rad Gel Doc. Las particiones congeladas agrupan placas fisicas y reimagenes, de modo que los grupos GRA8__Plate1, HI__Plate6 y Low__Plate3 quedan fuera del entrenamiento. Las 12 actualizaciones de mascaras del mantenedor se congelaron el 2026-10-07 a las 20:56:03 EDT antes del entrenamiento, y los identificadores completos y marcas de tiempo estan en `training_report.md`. La normalizacion y los flujos se precalcularon en cache sobre fichero y se verificaron numericamente contra la preparacion de entrada estandar de Cellpose.

## Capacidades

- Segmentacion de instancias en imagenes de microscopia, devolviendo mascaras, flujos y estilos mediante la API de Cellpose.
- Deteccion de placas de lisis de *Toxoplasma gondii* en ensayos de placa, incluyendo objetos muy pequenos cuando se usa `min_size=0`.
- Manejo de negativos vacios: el entrenamiento incluye 34 campos negativos aceptados, lo que permite al modelo no generar objetos en imagenes sin placas.
- Generalizacion entre dominios de adquisicion: el entrenamiento mezcla campos curados y 71 pocillos de Bio-Rad Gel Doc, y la evaluacion cubre Gel Doc, NAS y figuras de literatura independiente.
- Segmentacion con area y recuento por instancia, apta para morfometria posterior.
- Integracion con spaCR mediante la seleccion explicita de `toxoplasma_plaque_v3`.
- No dispone de generacion de texto, razonamiento simbolico, capacidades multimodales de lenguaje, tool calling ni soporte de agentes; la informacion disponible no describe ninguna capacidad de este tipo.

## Casos de uso

- Cuantificacion de ensayos de placa en cribados antiparasitarios: el modelo segmenta cada placa de lisis y permite derivar recuento y area por pocillo, sustituyendo el conteo manual en experimentos con cientos de imagenes.
- Evaluacion de compuestos frente a *Toxoplasma gondii*: midiendo el area total de placa por condicion se puede estimar el efecto inhibitorio de un farmaco; el modelo es adecuado porque mantiene recall en objetos pequenos con `min_size=0`, condicion necesaria dado que el 91,58% de los objetos curados de Gel Doc son menores de 150 pixeles nativos.
- Analisis de imagenes de Bio-Rad Gel Doc: 71 pocillos de esta fuente forman parte del entrenamiento, por lo que es el dominio mejor cubierto y el que presenta la evaluacion mas completa (18 pocillos, 506 placas anotadas, 3 grupos).
- Procesamiento por lotes en pipelines de laboratorio: la API de Cellpose permite iterar sobre directorios de imagenes y serializar resultados intermedios (mascaras, metricas) para su analisis agregado en Python o R.
- Morfometria integrada en spaCR: seleccionando explicitamente `toxoplasma_plaque_v3` y ajustando el tamano minimo de objeto a la resolucion de la imagen, se pueden obtener medidas morfologicas consistentes dentro de un flujo ya existente.
- Reanalisis retrospectivo de imagenes historicas: al no depender de un unico microscopio, el modelo puede aplicarse a conjuntos antiguos de figuras y pocillos, aunque requiere validacion humana por el posible cambio de dominio.
- Control de calidad asistido: el modelo puede usarse como primer paso de anotacion para que un tecnico revise y corrija las mascaras, reduciendo el tiempo de etiquetado en nuevas tandas.
- Comparacion de modelos en experimentos controlados: el repositorio incluye `metrics.csv`, `scorecard.csv` y `qc/comparison_vs_incumbent.csv`, lo que facilita reproducir la comparacion frente al modelo incumbente r3 con las mismas mascaras y ajustes.

## Benchmarks y rendimiento

| Conjunto de evaluacion | Metrica | Candidato r5 Gel Doc | Incumbente r3 | Notas |
|---|---|---|---|---|
| Gel Doc (18 pocillos, 506 placas, 3 grupos) | F1 | 0,6419 | 0,3285 | Evaluado con `min_size=0` en todos los modelos comparados |
| Gel Doc | Precision | 0,6943 | no disponible | Misma configuracion |
| Gel Doc | Recall | 0,5968 | no disponible | Misma configuracion |
| Gel Doc | AP50 | 0,4726 | no disponible | Definido como TP/(TP+FP+FN), no como AP ordenada por confianza |
| Gel Doc con `min_size=150` | F1 | 0,1041 | no disponible | El 91,58% de los objetos curados de Gel Doc son menores de 150 pixeles nativos |
| Literatura independiente (23 campos revisados) | F1 | 0,5960 | 0,5571 | Intervalo bootstrap de mejora al 95%: [-0,0524, 0,1079]; la puerta prespecificada de limite inferior positivo no se supero |
| NAS (28 pocillos) | F1 | 0,8737 | 0,8649 | Estos pocillos tambien se monitorizaron por perdida de validacion durante el entrenamiento |
| Literatura historica r4 (51 campos) | F1 | no disponible | no disponible | Los subconjuntos de 32 stems no vistos y 3 figuras limpias se solapan con ese conjunto y no deben sumarse |

En esta ejecucion no se puntuo ningun modelo stock: las columnas correspondientes en `scorecard.csv` estan deliberadamente vacias. Los 120 campos unicos de evaluacion quedan fuera del conjunto de entrenamiento de este candidato. No se han publicado en la informacion disponible resultados de benchmarks genericos tipo MMLU, HumanEval o GSM8K, que no son aplicables a un modelo de segmentacion de imagen.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La informacion proporcionada no publica cifras de memoria ni tamano de parametros.
- GPU recomendadas: no disponibles. Cellpose-SAM es un modelo de segmentacion con componente de atencion, por lo que se beneficia de aceleracion GPU, pero no se especifica ninguna tarjeta concreta (A100, H100, RTX 4090 u otras).
- Compatibilidad con GPU de consumo: no disponible. El entrenamiento se realizo con batch 1, lo que sugiere requisitos de memoria moderados, pero no se confirma en la documentacion.
- Opciones de despliegue: la via documentada es la libreria Python `cellpose` mediante `models.CellposeModel(pretrained_model=weights)`, descargando los pesos con `huggingface_hub.hf_hub_download`. Tambien se contempla su uso dentro de spaCR. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles.
- Espacio en disco: el repositorio ocupa 1,2 GB, incluyendo pesos, curvas de entrenamiento y artefactos de evaluacion.

## Comparativa con modelos similares

| Modelo | Tipo | Conjunto de evaluacion | F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| toxoplasma-plaque-segmentation-cpsam-r5-geldoc (este) | Ajuste fino de Cellpose-SAM `cpsam`, linaje r5 Gel Doc | Gel Doc (18 pocillos) | 0,6419 | CC-BY-4.0 | HuggingFace, 0 descargas |
| Incumbente r3 (referenciado como `toxoplasma_plaque_v3` en spaCR) | Modelo anterior de la misma familia | Gel Doc (mismas mascaras refrescadas) | 0,3285 | no disponible | no disponible |
| toxoplasma-plaque-segmentation-cpsam-r5 | Ajuste fino de Cellpose-SAM `cpsam_v2`, particion de 332 campos | no disponible en esta informacion | no disponible | no disponible | HuggingFace |
| Modelo stock Cellpose-SAM (`cpsam`) | Modelo base sin ajustar | No puntuado en esta ejecucion | no disponible | no disponible | No disponible en esta informacion |

No se dispone de datos comparativos frente a otros segmentadores de microscopia (por ejemplo, variantes de U-Net o StarDist) en la informacion proporcionada.

## Limitaciones y advertencias

- Estado de candidato: el propio autor indica explicitamente que el modelo no esta promovido, por lo que no deberia adoptarse como sustituto de los valores por defecto sin una validacion previa.
- Sensibilidad al parametro `min_size`: con `min_size=150` el F1 en Gel Doc cae a 0,1041 frente a 0,6419 con `min_size=0`. Dado que el 91,58% de los objetos curados de Gel Doc son menores de 150 pixeles nativos, usar los valores por defecto historicos degrada gravemente el rendimiento.
- Evidencia estadistica incompleta en literatura independiente: la mejora de 0,5960 frente a 0,5571 en los 23 campos revisados tiene un intervalo bootstrap al 95% de [-0,0524, 0,1079], que incluye el cero; la puerta prespecificada de limite inferior positivo no se supero.
- Posible cambio de dominio: el rendimiento varia mucho entre fuentes (F1 0,8737 en NAS frente a 0,6419 en Gel Doc), lo que indica dependencia del dominio de adquisicion.
- Validacion humana obligatoria: el autor recomienda validar manualmente los recuentos y las areas, especialmente en placas pequenas y en dominios de adquisicion nuevos.
- AP50 no equivalente a AP estandar: se define como TP/(TP+FP+FN), sin ordenacion por confianza, por lo que no es comparable con metricas de deteccion convencionales.
- Sin datos publicados de sesgo: no se han publicado analisis de sesgos en la informacion disponible.
- Riesgo de alucinacion no aplicable en el sentido de lenguaje, pero si existe riesgo de falsos positivos en imagenes sin placas, mitigado parcialmente por los 34 negativos vacios incluidos en el entrenamiento.
- Reproducibilidad limitada en parte: el repositorio publica artefactos de evaluacion y entrenamiento, pero no las imagenes ni las mascaras originales de entrenamiento, por lo que la replicacion completa del ajuste no es posible con lo distribuido.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribucion al autor y la indicacion de los cambios realizados. No se han proporcionado restricciones adicionales.
- Madurez de la comunidad: el repositorio registra 0 descargas y 0 likes, sin validacion externa independiente del autor.
- Numeros que no deben sumarse: los subconjuntos de literatura historica r4 (51 campos, 32 stems no vistos y 3 figuras limpias) se solapan entre si, y los 120 campos unicos de evaluacion no deben agregarse repetidamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/einarolafsson/toxoplasma-plaque-segmentation-cpsam-r5-geldoc
- Repositorio previo de la misma familia: https://huggingface.co/einarolafsson/toxoplasma-plaque-segmentation-cpsam-r5
- Ficheros de evidencia dentro del repositorio: `metrics.csv`, `scorecard.csv`, `qc/comparison_vs_incumbent.csv`, `training_report.md`, `training/training_curves.png`, `scorecard.png`
- No se han proporcionado en la informacion disponible enlaces a papers, blogs tecnicos, repositorios de codigo ni demos adicionales.
