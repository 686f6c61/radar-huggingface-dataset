# MykolaL/DelineateAnything

## Resumen

Delineate Anything v2 es un modelo fundacional de segmentación de imágenes especializado en la delimitación automática de linderos de parcelas agrícolas sobre imágenes de satélite. Lo desarrolla un equipo encabezado por Mykola Lavreniuk (con Nataliia Kussul, Andrii Shelestov, Yevhenii Salii, Volodymyr Kuzin, Charlotte Julia Li-Xing Wang y Zoltan Szantoi) y se distribuye a través de HuggingFace con la librería Ultralytics bajo pipeline de image-segmentation. La versión v2 amplía el modelo original hacia un modelo fundacional global y agnóstico a la resolución, capaz de operar con imágenes de cualquier fuente entre 0,25 m y 10 m de resolución espacial.

El problema que resuelve es el cuello de botella histórico del mapeo de parcelas: los catastro agrícolas están incompletos o desactualizados en buena parte del mundo y la digitalización manual de límites no escala a nivel planetario. El modelo se ha entrenado sobre FBIS-73M, un conjunto de 73 millones de instancias procedentes de 61 países, construido con un pipeline de curación específico por resolución que resuelve el desajuste entre parcela catastral y campo físicamente detectable. Según la model card, la versión v2 mejora en un +103,3 % relativo la mAP@0.5 de Delineate Anything v1 en escenarios zero-shot, y mapea la totalidad de Ucrania (603.000 km²) en 5,4 horas sobre un PC convencional con una única GPU NVIDIA RTX 5070 Ti de 16 GB.

Se publica bajo licencia AGPL-3.0, con papers asociados en ECAI 2025 y ECCV 2026, un explorador de mapas alojado en infraestructura de la ESA, un dataset en HuggingFace y una demo en Colab. Es relevante ahora porque demuestra que la delimitación de campos a escala nacional es viable en hardware de consumo, lo que acerca la monitorización agrícola global a equipos pequeños y a agencias sin clústeres de cómputo dedicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la informacion disponible; implementacion sobre la libreria Ultralytics (segmentacion de imagenes, familia YOLO) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision); rango de trabajo de 0,25 m a 10 m de resolucion espacial por pixel |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no aplica; la entrada son imagenes) |
| Licencia | AGPL-3.0 |
| Formato de pesos | No disponible en detalle; repositorio de 0,3 GB cargable con la libreria Ultralytics |

Datos adicionales de distribucion: 88.183 descargas y 8 likes en HuggingFace, creado el 2025-04-23 y actualizado el 2026-09-21.

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de su integracion con la libreria Ultralytics para segmentacion de imagenes, lo que situa al modelo en la familia de detectores-segmentadores tipo YOLO con mascaras de instancia. El rasgo arquitectonico declarado es la agnosticidad a la resolucion: el modelo acepta como entrada imagenes de fuentes muy distintas, desde imagenes comerciales de 0,25 m hasta productos de 10 m, sin reentrenamiento especifico por sensor. Los resultados de la version v2 se apoyan ademas en Delineate Anything Flow, un trabajo previo orientado a deteccion rapida de linderos a escala de pais.

El entrenamiento se realizo sobre FBIS-73M, un dataset de 73 millones de instancias de 61 paises con fuentes de imagen heterogeneas entre 0,25 m y 10 m. El elemento diferencial del pipeline de datos es la curación especifica por resolucion, que corrige el desajuste entre la parcela administrativa y el campo observable en la imagen, un problema recurrente cuando se mezclan fuentes con granularidades distintas. No se especifican en la informacion proporcionada el numero de tokens o muestras de entrenamiento procesadas, la composicion exacta del dataset, ni si se aplicaron etapas de RLHF, DPO o refinamiento por preferencias humanas.

## Capacidades

- Segmentacion de imagenes por instancia: genera poligonos de linderos de parcelas agricolas directamente desde imagenes de satelite o aereas.
- Generalizacion zero-shot: la model card declara rendimiento state-of-the-art en delineacion zero-shot global, sin ajuste fino por region.
- Agnosticidad a la resolucion: procesa imagenes de 0,25 m a 10 m de resolucion espacial dentro del mismo modelo.
- Escalado a nivel de pais: capacidad demostrada de mapear territorios completos; el ejemplo citado es Ucrania (603.000 km²) en 5,4 horas.
- Cobertura geografica amplia: entrenado con datos de 61 paises, lo que favorece la transferencia a regiones no vistas.
- Integracion con el ecosistema Ultralytics: inferencia mediante la libreria Ultralytics, con las utilidades habituales de carga de pesos, prediccion por lotes y exportacion.
- Tool calling, function calling y agentes: no disponible; no es una capacidad de este tipo de modelo.
- Modo thinking, vision o audio: no disponible; la modalidad es exclusivamente vision por computador sobre imagenes.

## Casos de uso

- Inventario agricola nacional: generar un mapa vectorial de parcelas de un pais completo a partir de imagenes satelitales, como demuestra el caso de Ucrania en 5,4 horas con una sola GPU de 16 GB. Es adecuado porque cubre territorio extenso sin intervencion manual.
- Verificacion de superficies declaradas en subvenciones agrarias: contrastar la superficie declarada por el agricultor con el limite de parcela detectado por el modelo, para detectar discrepancias en expedientes de ayudas tipo PAC.
- Estadistica agricola oficial: alimentar sistemas de estadistica agraria en paises sin catastro digital completo, generando capas de limites de campo actualizadas por campana.
- Agricultura de precision: delimitar parcelas y subparcelas para definir unidades de gestion de insumos, ajustando dosis de fertilizante o riego a la geometria real del campo.
- Seguimiento de cambios y expansion agricola: comparar delineaciones entre fechas para detectar roturaciones, abandono de tierras o cambios en la estructura parcelaria.
- Seguros agrarios y evaluacion de danos: generar la geometria exacta de las parcelas afectadas por un siniestro (incendio, inundacion, granizo) antes de peritar, reduciendo el trabajo de campo.
- Mezcla de fuentes de imagen en pipelines operativos: al ser agnostico a la resolucion, un mismo despliegue puede consumir Sentinel-2 a 10 m y encargos comerciales a 0,25-3 m sin cambiar de modelo.
- Mapeo de seguridad alimentaria: organismos internacionales y ONG pueden generar capas de campo para estimar superficies cultivadas en regiones con datos catastrales inexistentes.
- Auditoria de uso del suelo y deforestacion asociada a la agricultura: la capa de linderos sirve como base geometrica para analisis de cambio de uso del suelo.

## Benchmarks y rendimiento

La informacion proporcionada solo incluye una comparacion relativa entre versiones. No se han publicado en la informacion disponible valores absolutos de mAP, IoU u otras metricas sobre conjuntos de evaluacion con nombre.

| Metrica | Delineate Anything v2 | Delineate Anything (v1) | Notas |
|---|---|---|---|
| mAP@0.5 (zero-shot) | +103,3 % relativo frente a v1 | Referencia | Ganancia relativa declarada en la model card; no se aportan valores absolutos |
| Tiempo de mapeo a escala nacional | Ucrania (603.000 km²) en 5,4 h | No disponible | 1 GPU NVIDIA RTX 5070 Ti de 16 GB, PC convencional |

No se han publicado en la informacion disponible resultados sobre MMLU, HumanEval, GSM8K ni equivalentes, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- Inferencia: el modelo cabe y funciona en una GPU de consumo. El dato explicito de la model card es una NVIDIA RTX 5070 Ti con 16 GB de VRAM mapeando Ucrania completa en 5,4 horas.
- VRAM estimada: no disponible como cifra exacta; el repositorio de pesos ocupa 0,3 GB, por lo que el consumo de memoria en inferencia es bajo y compatible con GPU de gama media y消费 (16 GB declarados como suficientes en el caso citado).
- GPU recomendadas: cualquier GPU NVIDIA moderna con al menos 16 GB para el flujo a escala nacional descrito; GPU de menor VRAM no estan cuantificadas en la informacion disponible.
- Cabida en GPU de consumo: si, segun el caso documentado con RTX 5070 Ti 16 GB.
- Opciones de despliegue: libreria Ultralytics (via principal, indicada en library_name) y demo en Google Colab facilitada por los autores. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de segmentacion de imagenes.
- Latencia y throughput: no disponibles por imagen; el unico dato de rendimiento es el tiempo agregado de 5,4 horas para 603.000 km².

## Comparativa con modelos similares

| Modelo | Desarrollador | Tarea | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Delineate Anything v2 | Mykola Lavreniuk et al. | Segmentacion de linderos de campo, zero-shot global | Imagenes de 0,25 m a 10 m | AGPL-3.0 | HuggingFace, repo de 0,3 GB |
| Delineate Anything (v1) | Mykola Lavreniuk et al. | Delineacion de linderos agnostica a la resolucion | Imagenes de satelite | No disponible en la informacion | Paper ECAI 2025 |
| Delineate Anything Flow | Mykola Lavreniuk et al. | Deteccion rapida de linderos a escala de pais | Cualquier fuente | No disponible en la informacion | Paper arXiv 2511.13417 |
| Segmentadores genericos tipo SAM o YOLO-seg | Varios | Segmentacion general de imagenes | Imagen natural o satelital | Variable | Amplia |

La comparacion cuantitativa con alternativas de proposito general no puede establecerse con la informacion disponible: no se aportan parametros, contexto ni metricas de terceros. La unica comparacion numerica documentada es la mejora del +103,3 % relativo en mAP@0.5 de v2 sobre v1.

## Limitaciones y advertencias

- Ausencia de benchmarks absolutos: la model card solo publica una mejora relativa frente a la version anterior; no hay valores absolutos de mAP o IoU verificables en la informacion disponible.
- Rendimiento dependiente de la imagen de entrada: aunque el modelo se declara agnostico a la resolucion, la calidad de la delineacion dependera de la nubosidad, la fecha de captura y la geometria de adquisicion, factores no cuantificados en la informacion.
- Cobertura geografica: los 61 paises del dataset de entrenamiento no garantizan un rendimiento homogeneo en regiones con estructuras parcelarias o practicas agricolas no representadas.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso comercial es posible, pero si el modelo se ofrece como servicio en red o se distribuye integrado en una aplicacion, la AGPL obliga a liberar el codigo fuente correspondiente bajo la misma licencia, salvo acuerdo de licencia comercial con los titulares. Es un punto critico para productos propietarios.
- Sesgos: no se documentan en la informacion disponible analisis de sesgo por region, tamano de parcela, tipo de cultivo o fuente de imagen.
- Alucinacion: el concepto no aplica a un segmentador, pero si existe riesgo de falsos positivos y falsos negativos geometricos (linderos inventados o fusion de parcelas contiguas) que no estan cuantificados.
- Restricciones de atribucion: el uso de los modelos derivados y de los papers asociados requiere citar adecuadamente los trabajos de ECAI 2025 y ECCV 2026.
- Datos de despliegue limitados: no se publican cifras de latencia por imagen, throughput ni huella de VRAM medida, solo el tiempo agregado del caso de Ucrania.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/MykolaL/DelineateAnything
- Dataset FBIS-73M: https://huggingface.co/datasets/MykolaL/FBIS-73M
- Pagina del proyecto: https://lavreniuk.github.io/Delineate-Anything/
- Codigo en GitHub: https://github.com/Lavreniuk/Delineate-Anything
- Paper Delineate Anything v2 (ECCV 2026): https://arxiv.org/abs/2607.19069
- Paper Delineate Anything Flow: https://arxiv.org/abs/2511.13417
- Paper Delineate Anything (ECAI 2025): https://arxiv.org/abs/2504.02534
- Explorador de mapas (ESA): https://explorer.delineate-anything.apex.esa.int/
- Demo en Google Colab: https://colab.research.google.com/drive/10KSLwYDTgU-WhpqqG39yyvB6K8MdB0X9?usp=sharing

Nota: la busqueda web asociada devolvio unicamente articulos en aleman sobre entrenamiento de fuerza sin material, sin relacion con el modelo. No se han incorporado por no ser fuentes relevantes.
