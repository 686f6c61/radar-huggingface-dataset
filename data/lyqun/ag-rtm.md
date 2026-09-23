# lyqun/AG-RTM

## Resumen

AG-RTM (ageing models) es una familia de tres modelos de estimacion de edad biologica a partir de imagen medica, publicada por el usuario lyqun junto con el articulo *Prediction bias in biological ageing models*. Los tres modelos estiman la edad cronologica desde una modalidad distinta: Chest Age sobre radiografia de torax frontal (2D), Abdominal Age sobre volumen de TC abdominal (2,5D, 32 cortes axiales) y Brain Age sobre RM cerebral T1 (2,5D, 32 cortes axiales). La diferencia entre la edad estimada y la cronologica se denomina age gap y es la magnitud que el articulo analiza.

Tecnicamente no es un modelo de lenguaje, sino un regresor de vision: los tres checkpoints parten del backbone DINOv3-Large (`vit_large_patch16_dinov3.lvd1689m`) y anaden una cabeza de regresion lineal de 1024→32→1 con ReLU y dropout 0,5. Los modelos de abdomen y cerebro codifican los 32 cortes axiales uno a uno y promedian sus caracteristicas antes de la cabeza. Los checkpoints se guardan como `.pth` autocontenidos (pesos y ajustes necesarios para reconstruir el modelo) y se cargan con `torch.load(..., weights_only=True)`.

Su relevancia actual es metodologica: el propio articulo demuestra que el age gap de estos modelos sufre regresion a la media diferencial (se contrae hacia la edad media con mas fuerza en pacientes no sanos que en sanos), lo que limita su uso como biomarcador individual de salud. Se distribuyen para uso exclusivo de investigacion y no son dispositivos medicos. El cuarto modelo de la familia, Retinal Age, no esta en este repositorio porque se entreno con datos restringidos del NHS y se comparte bajo peticion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-Large patch 16 (DINOv3) con cabeza de regresion Linear(1024→32) → ReLU → Dropout(0.5) → Linear(32→1) |
| Parametros totales | no disponible en la informacion proporcionada (backbone ViT-Large patch 16) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen 2D o volumen 2,5D de 32 cortes) |
| Tipos de cuantizacion | no disponible (los checkpoints se distribuyen en el formato nativo de PyTorch) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | DINOv3 License (`license: other`, `license_name: dinov3-license`); use ademas sujeto a los terminos de cada dataset de entrenamiento |
| Formato de pesos | `.pth` (checkpoint PyTorch autocontenido, compatible con `torch.load(..., weights_only=True)`) |
| Backbone | `timm/vit_large_patch16_dinov3.lvd1689m` (fine-tuned) |
| Tamano del repositorio | 3,6 GB (tres checkpoints) |
| Entradas | Chest Age: radiografia frontal PA/AP redimensionada a 256 px y recorte central a 224 × 224. Abdominal Age: NIfTI en unidades Hounsfield, remuestreado a 1,5 mm, segmentacion corporal a −950 HU, recorte con margen de 15 mm, 32 cortes axiales. Brain Age: NIfTI T1w o ZIP de sesion OASIS-3, reorientado a RAS, recorte de intensidad a percentiles 0,5 y 99,5, recorte de cabeza con margen de 5 mm, 32 cortes axiales |
| Salida | `predicted_age` y `age_gap` (edad estimada menos edad cronologica) cuando se aporta `biomarker_value` |
| Libreria | pytorch |

## Arquitectura y entrenamiento

Los tres modelos comparten el mismo esquema: se parte de DINOv3-Large preentrenado (`vit_large_patch16_dinov3.lvd1689m`, parches de 16 px) y se ajusta con una cabeza de regresion muy ligera de dos capas lineales con ReLU y dropout 0,5 entre ambas. En Abdominal Age y Brain Age el volumen se procesa en 2,5D: los 32 cortes axiales se codifican individualmente y sus caracteristicas se promedian antes de la cabeza de regresion, lo que evita que la memoria crezca con el numero de cortes. Cada checkpoint almacena los pesos y los ajustes necesarios para reconstruir el modelo completo.

Los datos de entrenamiento son tres cohortes publicas, siempre restringidas a pacientes sanos y con particion a nivel de paciente cuando el dataset lo permite. Chest Age usa ChestX-ray14 (NIH Clinical Center): 8.698 pacientes sanos y 12.622 radiografias para entrenamiento, y 2.175 pacientes sanos y 3.174 radiografias para validacion; "sano" significa que la radiografia no presenta ninguno de los catorce hallazgos (No Finding). Abdominal Age usa el dataset de TC abdominal Merlin (Stanford AIMI): 4.633 estudios sanos para entrenamiento y 1.597 para validacion, manteniendo la particion oficial porque Merlin no publica identificadores de paciente; "sano" significa que el estudio no presenta ninguno de los treinta hallazgos derivados del informe. Brain Age usa OASIS-3: 411 pacientes sanos (889 sesiones) para entrenamiento y 103 pacientes sanos (229 sesiones) para validacion, donde sano implica una visita clinica mas cercana con CDR 0 y cognicion normal. En los tres casos se conservo el checkpoint con menor MAE de validacion (epocas 42, 29 y 11 respectivamente). No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable al no tratarse de un modelo generativo.

## Capacidades

- Estimacion de edad cronologica a partir de radiografia de torax frontal (Chest Age), con un MAE de test de 5,15 anos sobre 21.733 radiografias de 4.623 pacientes.
- Estimacion de edad cronologica a partir de TC abdominal (Abdominal Age), con MAE de test de 4,04 anos sobre 4.984 volumenes.
- Estimacion de edad cronologica a partir de RM cerebral T1 (Brain Age), con MAE de test de 3,81 anos sobre 1.454 sesiones de 808 pacientes; cuando una sesion contiene varios runs T1w se devuelve la media de las predicciones.
- Calculo del age gap (edad estimada menos edad cronologica) cuando se proporciona la edad real en la columna `biomarker_value`.
- Procesamiento por lotes mediante CSV de entrada: `subject_id,image_path,biomarker_value` para Chest y Abdominal Age, y `subject_id,session_id,archive_path,biomarker_value` para Brain Age.
- Preprocesado integrado de las tres modalidades: reescalado y recorte en radiografia, conversion a unidades Hounsfield con segmentacion corporal y remuestreo en TC, y reorientacion a RAS con recorte de intensidad y de cabeza en RM.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo generativo ni conversacional.
- No tiene capacidades multilingues ni de generacion de texto, codigo o matematicas.
- No dispone de modo "thinking", vision general, audio ni otras capacidades multimodales fuera de las tres modalidades de imagen medica indicadas.

## Casos de uso

- Investigacion en envejecimiento biologico: obtener el age gap en cohortes de imagen ya adquiridas para estudiar su asociacion con desenlaces de salud, siempre reportando los resultados por subgrupos de edad, tal y como recomienda el articulo.
- Analisis de sesgo metodologico: cuantificar la regresion a la media diferencial entre pacientes sanos y no sanos usando los tres modelos, ya que el paper demuestra que el age gap se contrae hacia la edad media con mas fuerza en sujetos no sanos.
- Estratificacion de cohortes en estudios longitudinales: aplicar Brain Age a series de RM T1 dentro de OASIS-3 o cohortes compatibles para seleccionar sujetos con mayor o menor age gap antes de un analisis mas costoso.
- Enriquecimiento de biobancos de imagen: procesar grandes volumenes de radiografias de torax con Chest Age en lotes (21.733 radiografias de test en el articulo) para anadir una variable continua de edad estimada a la base de datos.
- Control de calidad y armonizacion de pipelines: el preprocesado documentado (remuestreo a 1,5 mm, segmentacion a −950 HU, recorte de cabeza con margen de 5 mm) puede reutilizarse para verificar que los volumenes de entrada cumplen el formato esperado antes de la inferencia.
- Comparacion multimodal del envejecimiento: al compartir backbone y metodologia, los tres modelos permiten contrastar el age gap derivado de torax, abdomen y cerebro en un mismo sujeto cuando se dispone de las tres modalidades.
- Generacion de hipotesis sobre asociaciones radiologicas: relacionar el age gap con hallazgos descritos en informe, teniendo en cuenta la advertencia del articulo sobre analizar los subgrupos de edad por separado.
- Docencia y reproducibilidad: el repositorio publica los checkpoints con SHA-256, las epocas exactas y los comandos de instalacion, lo que facilita replicar los resultados del preprint en un entorno controlado.

## Benchmarks y rendimiento

Metricas de test con intervalos de confianza del 95 % obtenidos mediante bootstrap con 1.000 remuestreos (a nivel de paciente en Chest y Brain Age, y a nivel de volumen en Abdominal Age porque Merlin no publica identificadores de paciente).

| Modelo | Subconjunto de test | MAE (anos) | RMSE (anos) | Pearson r² |
|---|---|---|---|---|
| Chest Age | 21.733 radiografias, 4.623 pacientes | 5,15 (4,95–5,42) | 6,80 (6,45–7,26) | 0,796 (0,769–0,819) |
| Abdominal Age | 4.984 volumenes | 4,04 (3,94–4,14) | 5,32 (5,17–5,46) | 0,918 (0,912–0,923) |
| Brain Age | 1.454 sesiones, 808 pacientes | 3,81 (3,59–4,03) | 4,92 (4,65–5,20) | 0,643 (0,604–0,680) |

Resumen de MAE por modelo con su cohorte de entrenamiento y checkpoint:

| Modelo | Entrada | Datos de entrenamiento | MAE de test (anos) | Checkpoint |
|---|---|---|---:|---|
| Chest Age | Radiografia de torax frontal (2D) | ChestX-ray14 | 5,15 | `chest_age.pth` |
| Abdominal Age | Volumen de TC abdominal (2,5D, 32 cortes) | Merlin | 4,04 | `abdominal_age.pth` |
| Brain Age | RM cerebral T1 (2,5D, 32 cortes) | OASIS-3 | 3,81 | `brain_age.pth` |

No se han publicado en la informacion disponible resultados de benchmarks comparativos con otros modelos de estimacion de edad (MMLU, HumanEval u otros no aplican a este tipo de modelo).

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por los autores. Como referencia de orden de magnitud, un ViT-Large a 224 × 224 con lotes pequenos suele requerir del orden de 2 a 4 GB en fp32; el procesamiento de los 32 cortes de TC y RM se hace corte a corte, por lo que la memoria no escala con el numero de cortes. Estas cifras son estimaciones y no datos confirmados por los autores.
- GPU recomendadas: no indicadas en la informacion disponible. El entorno de instalacion del repositorio usa PyTorch con CUDA 12.1 (`--extra-index-url https://download.pytorch.org/whl/cu121`), lo que apunta a GPU NVIDIA; una RTX 3060 de 12 GB o superior deberia ser suficiente para inferencia de una imagen o un volumen, y GPU tipo A100 o H100 resultan razonables para procesar cohortes completas por lotes.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del backbone y que los checkpoints individuales ocupan aproximadamente 1,2 GB (3,6 GB los tres en fp32). No hay confirmacion oficial de este punto en la informacion disponible.
- Opciones de despliegue: el repositorio oficial ofrece inferencia con PyTorch mediante `code/predict.py --checkpoint ... --input ... --output ...`, con entorno conda (Python 3.11) y `requirements.txt`. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI, GGUF ni exportacion a ONNX o TorchScript; estas herramientas estan orientadas a modelos de lenguaje y no aplican directamente a este modelo de vision.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La busqueda web realizada no devolvio modelos comparables de estimacion de edad biologica, por lo que la comparacion se limita a los integrantes de la propia familia AG-RTM publicados en el repositorio.

| Modelo | Modalidad | Datos de entrenamiento | MAE de test (anos) | Estado de publicacion |
|---|---|---|---|---|
| Chest Age | Radiografia de torax frontal | ChestX-ray14 | 5,15 | Checkpoint publico en `lyqun/AG-RTM` |
| Abdominal Age | TC abdominal | Merlin (Stanford AIMI) | 4,04 | Checkpoint publico en `lyqun/AG-RTM` |
| Brain Age | RM cerebral T1 | OASIS-3 | 3,81 | Checkpoint publico en `lyqun/AG-RTM` |
| Retinal Age | Imagen de retina | Datos restringidos del NHS | no disponible | Solo bajo peticion en `lyqun/AG-RTM-RetinalAge` |

No disponible la comparacion con alternativas de terceros (parametros, contexto, licencia y disponibilidad) porque la informacion proporcionada no incluye ningun otro modelo de la misma categoria.

## Limitaciones y advertencias

- Regresion a la media diferencial: el articulo demuestra que el age gap se contrae hacia la edad media con mas fuerza en pacientes no sanos que en sanos. Por ello se recomienda reportar las asociaciones dentro de subgrupos de edad.
- El age gap no refleja de forma fiable el estado de salud de un sujeto concreto; no debe interpretarse como un biomarcador individual validado.
- Cada modelo se entreno en una unica cohorte (ChestX-ray14, Merlin y OASIS-3 respectivamente) y no ha sido validado en datos externos.
- Sesgos poblacionales: los sesgos de las cohortes de origen (composicion demografica y criterios de "sano" especificos de cada dataset) se trasladan al modelo; no se documentan analisis de equidad por sexo, etnia u otros factores.
- Riesgo de mal uso por dominio: los modelos solo estan entrenados para las modalidades y preprocesados descritos; aplicar otro tipo de imagen o saltarse el preprocesado invalida las predicciones.
- Restricciones de licencia: los pesos derivan de DINOv3 y se distribuyen bajo la DINOv3 License. Ademas, cada dataset impone sus propios terminos; en particular, Merlin se distribuye bajo un acuerdo de uso de datos de investigacion no comercial, lo que condiciona cualquier uso comercial del modelo Abdominal Age.
- Los modelos son exclusivamente para investigacion y no son dispositivos medicos; no deben usarse para diagnostico, pronostico ni decision clinica.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado en HuggingFace y con fecha de creacion posterior a la de esta revision, lo que implica ausencia de validacion independiente por la comunidad.
- Requisito de atribucion: OASIS-3 solicita un reconocimiento especifico ("Data were provided in part by OASIS-3: Longitudinal Multimodal Neuroimaging: Principal Investigators: T. Benzinger, D...", texto truncado en la model card) que debe respetarse en cualquier publicacion derivada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lyqun/AG-RTM
- Modelo Retinal Age (bajo peticion): https://huggingface.co/lyqun/AG-RTM-RetinalAge
- Codigo, instalacion y formato de datos: https://github.com/HORIZONHealthcare/AG-RTM
- Preprint *Prediction bias in biological ageing models*: https://www.researchsquare.com/article/rs-10157626/v1
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
- Modelo base en timm: https://huggingface.co/timm/vit_large_patch16_dinov3.lvd1689m
