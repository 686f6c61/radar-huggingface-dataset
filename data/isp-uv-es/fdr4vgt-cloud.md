# isp-uv-es/FDR4VGT-CLOUD

## Resumen

FDR4VGT-CLOUD es un modelo de segmentación semántica binaria (nube / no nube) diseñado específicamente para el archivo FDR4VGT de la ESA, el reprocesado de las misiones SPOT-VGT y Proba-V. Lo desarrolla el Image Processing Laboratory (IPL) de la Universitat de València en el marco del proyecto FDR4VGT liderado por VITO, y su objetivo es sustituir la amalgama de modelos específicos por sensor por un único modelo operativo que cubra VGT-1, VGT-2 y Proba-V a 1 km de resolución.

Técnicamente es una DeepLabV3 con encoder MobileNetV2 a la que se añade una rama de MLP pixel-wise 1x1; una convolución 1x1 fusiona ambas ramas. El conjunto suma 12,65 M de parámetros, una cifra muy contenida que permite inferencia en CPU y en GPU de consumo. La entrada son 4 bandas de reflectancia en techo de atmósfera (azul, rojo, NIR y SWIR) en teselas de 512 x 512 píxeles, y la salida es una probabilidad de nube con la sigmoide incluida en el grafo exportado.

Su relevancia práctica es doble: por un lado, unifica el enmascarado de nubes en un archivo de observación de la Tierra de varias décadas y varios sensores; por otro, se publica con licencia CC0-1.0 y con los checkpoints de ablación (19 en total) en el repositorio, lo que facilita la reproducibilidad y la comparación entre modelos globales y específicos por sensor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepLabV3 con encoder MobileNetV2 + rama MLP pixel-wise 1x1, fusionadas mediante convolucion 1x1 |
| Parametros totales | 12,65 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; la entrada es una tesela de imagen de 512 x 512 pixeles con 4 bandas |
| Tipos de cuantizacion | no disponible; no se documentan versiones cuantizadas (GGUF, ONNX int8, etc.) |
| Idiomas soportados | no aplica (modelo de vision; no procesa texto). Idiomas: no disponibles |
| Licencia | CC0-1.0 para los pesos; las imagenes SPOT-VGT y Proba-V se rigen por los terminos del archivo FDR4VGT |
| Formato de pesos | grafo exportado de PyTorch cargado via mlstac (`compiled_model()`); el modelo operativo requiere torch >= 2.7; los checkpoints de ablacion se exportaron con torch 2.5.1 y requieren torch 2.5.x |
| Entrada | 4 bandas de reflectancia TOA (azul, rojo, NIR, SWIR); rango nominal 0 a 2,05; no son DN |
| Salida | probabilidad de nube (float 0-1) con sigmoide incluida en el grafo; umbral recomendado 0,5 |
| Tamano de tesela y batch | 512 x 512 pixeles; batch de 1 a 256 |
| Pipeline | image-segmentation |
| Tamano del repositorio | 2,3 GB (incluye 19 checkpoints de ablacion) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de segmentacion densa de dos ramas. La rama principal es una DeepLabV3 con encoder MobileNetV2, adecuada para extraer contexto multi-escala con un coste computacional bajo. En paralelo, una MLP pixel-wise con convoluciones 1x1 procesa cada pixel de forma independiente, lo que preserva la informacion espectral fina de las cuatro bandas de entrada. Una convolucion 1x1 final fusiona ambas representaciones y produce el mapa de probabilidad de nube. Esta combinacion es coherente con la naturaleza del problema: la nube se detecta tanto por firma espectral puntual (agua y hielo, alto albedo en el visible, SWIR discriminante) como por textura y contexto espacial.

El entrenamiento parte de una etapa de preentrenamiento debil y despues se afina sobre escenas anotadas a mano. El conjunto de ajuste fino son 78 escenas anotadas (66 de entrenamiento y 12 de validacion), complementadas con 31 escenas reservadas que nunca entraron en entrenamiento y un conjunto de test de 81 escenas: 24 escenas Proba-V con anotacion por pixeles, 8 escenas SPOT-VGT con anotacion por pixeles y 49 escenas Proba-V anotadas por puntos. Las mascaras se dibujaron con la herramienta IRIS (ESA PhiLab). La model card no detalla el volumen total de tokens ni la composicion exacta del dataset de preentrenamiento debil, ni si se emplearon tecnicas de RLHF/DPO (no aplicables en un modelo de segmentacion). La innovacion principal es la unificacion multisensor: un solo modelo cubre VGT-1, VGT-2 y Proba-V, con checkpoints de ablacion que permiten comparar el modelo global frente a los especificos de cada sensor.

## Capacidades

- Segmentacion binaria de nubes a nivel de pixel sobre imagenes de satelite de 1 km de resolucion (SPOT-VGT y Proba-V) a partir de 4 bandas de reflectancia TOA.
- Generalizacion multisensor: el mismo checkpoint opera sobre VGT-1, VGT-2 y Proba-V.
- Prediccion por teselas grandes mediante `predict_large`, con parametros de `batch_size`, `num_workers` y `nodata` para procesar escenas completas.
- Salida calibrada como probabilidad (sigmoide incluida en el grafo), lo que permite ajustar el umbral segun el compromiso sensibilidad/especificidad en lugar de quedarse en el 0,5 por defecto.
- Soporte de mascara de nodata (`nodata=0.0`) para excluir pixeles invalidos del procesado.
- Flujo de carga e inferencia reproducible mediante la libreria `mlstac` (version 0.4.9) y `rasterio` para lectura de GeoTIFF.
- No soporta tool calling, agentes, razonamiento multi-paso, vision general ni audio: es un modelo especializado de segmentacion, no un modelo generativo.

## Casos de uso

- Generacion de mascaras de nube para el archivo FDR4VGT: un unico modelo permite enmascarar systematicamente el reprocesado completo de SPOT-VGT y Proba-V sin mantener tres modelos separados por sensor, lo que simplifica el mantenimiento del pipeline operativo.
- Preprocesado de series temporales para indices de vegetacion: enmascarar nubes y sombras antes de calcular NDVI u otros indices evita contaminar las composiciones temporales y los analisis de tendencia a largo plazo.
- Control de calidad en catalogos de datos: pasar cada escena entrante por el modelo y rechazar o marcar aquellas con una fraccion de nubosidad superior a un umbral definido, usando la probabilidad de salida como variable de decision.
- Procesado a gran escala en infraestructura propia: `predict_large` con teselas de 512 x 512 y batch configurable (hasta 256) permite trocear escenas completas y ajustar el rendimiento a la memoria disponible.
- Campanas de anotacion eficientes: dado que el modelo se afina a partir de preentrenamiento debil y acepta anotaciones por puntos (49 de las escenas de test usan este tipo de etiquetado), sirve como preetiquetador para reducir el esfuerzo humano en nuevas regiones o sensores.
- Investigacion en transferencia entre sensores: los 19 checkpoints de ablacion (7 globales, 6 Proba-V, 6 SPOT-VGT) permiten estudiar el coste de rendimiento de usar un modelo unico frente a modelos especializados.
- Integracion en pipelines GeoML: al cargarse con `mlstac` y aceptar arrays de `rasterio`, se puede insertar en flujos existentes de lectura de GeoTIFF, inferencia y escritura de mascaras sin dependencias propietarias.

## Benchmarks y rendimiento

Resultados a umbral 0,5 sobre escenas de test no utilizadas en entrenamiento (F2, IoU y kappa):

| Conjunto de test | Escenas | Anotacion | F2 | IoU | Kappa |
|---|---|---|---|---|---|
| Proba-V | 49 | puntos | 0,889 | 0,840 | 0,806 |
| SPOT-VGT | 8 | pixeles | 0,929 | 0,849 | 0,819 |

La model card indica explicitamente que estas cifras sustituyen a numeros anteriores que contabilizaban escenas presentes en entrenamiento. No se publican resultados desagregados para las 24 escenas Proba-V con anotacion por pixeles ni para las 31 escenas reservadas. No hay datos de latencia ni de throughput en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan aproximadamente 50 MB (unos 25 MB en fp16), por lo que el grueso del consumo viene de las activaciones de las teselas de 512 x 512. Con batch 1 es razonable esperar menos de 1-2 GB de VRAM; con batch 8, en el entorno de 2-4 GB. Son estimaciones derivadas del tamano del modelo, no medidas publicadas.
- GPU recomendadas: cualquier GPU con 4 GB o mas es suficiente (RTX 3050, RTX 4060, RTX 4090, A100, H100). El modelo no aprovecha de forma significativa la capacidad de GPU de gama alta, por lo que el cuello de botella sera la E/S de imagenes.
- GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo reciente; tambien es viable en CPU para lotes pequenos, dado el reducido numero de parametros.
- Opciones de despliegue: la ruta documentada es `mlstac` 0.4.9 con `torch>=2.7` y `rasterio`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo); tampoco se menciona una exportacion a ONNX o TensorRT.
- Latencia y throughput: no disponibles. La model card solo indica que `predict_large` admite `batch_size` y `num_workers` para paralelizar la inferencia por teselas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de otros modelos de segmentacion de nubes en la informacion proporcionada, por lo que la comparacion cuantitativa con alternativas externas no esta disponible. La unica comparacion documentada es interna, entre el modelo operativo unico y los checkpoints de ablacion del propio repositorio:

| Modelo | Parametros | Contexto / entrada | Licencia | Estado |
|---|---|---|---|---|
| FDR4VGT-CLOUD (operativo, multisensor) | 12,65 M | teselas 512 x 512, 4 bandas | CC0-1.0 | publicado, torch >= 2.7 |
| `f_global_*` (7 checkpoints de ablacion) | no disponible | teselas 512 x 512, 4 bandas | CC0-1.0 | publicado, requiere torch 2.5.x |
| `proba_*` (6 checkpoints especificos Proba-V) | no disponible | teselas 512 x 512, 4 bandas | CC0-1.0 | publicado, requiere torch 2.5.x |
| `spot_*` (6 checkpoints especificos SPOT-VGT) | no disponible | teselas 512 x 512, 4 bandas | CC0-1.0 | publicado, requiere torch 2.5.x |
| Otros modelos de cloud masking (genericos) | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo especializado: solo detecta nubes en imagenes de 1 km de SPOT-VGT y Proba-V con las 4 bandas especificadas. No es un modelo de proposito general ni acepta otras combinaciones de bandas, resoluciones o sensores sin reentrenamiento.
- Requiere reflectancia TOA en el rango 0-2,05, no DN. Pasar cuentas digitales sin convertir produce predicciones invalidas.
- El umbral recomendado es 0,5, pero no se documenta un analisis de sensibilidad por region, estacion o tipo de superficie; en escenarios operativos conviene calibrarlo con datos propios.
- No se publica evaluacion desagregada por bioma, latitud, epoca del ano ni por presencia de nieve, hielo, desierto o nubes finas, de modo que el comportamiento en esos casos no esta cuantificado en la informacion disponible.
- El conjunto de anotaciones es reducido (78 escenas para ajuste fino) y el test especifico de SPOT-VGT consta solo de 8 escenas, lo que limita la robustez estadistica de esa cifra (F2 0,929, kappa 0,819).
- Dependencia estricta de version de PyTorch: el modelo operativo no se puede leer con torch anterior a 2.7, y los checkpoints de ablacion exigen torch 2.5.x. Esto complica tener ambos conjuntos en un mismo entorno.
- Riesgo de alucinacion en el sentido habitual (generacion de texto) no aplica; el riesgo equivalente es la clasificacion erronea de pixeles, con falsos positivos sobre superficies brillantes y falsos negativos en nubes finas, no cuantificado en la model card.
- Licencia CC0-1.0 en los pesos, sin restricciones de uso comercial. Las imagenes SPOT-VGT y Proba-V empleadas para entrenar y evaluar se rigen por los terminos del archivo FDR4VGT, que deben revisarse por separado si se redistribuyen datos derivados.
- El paper asociado esta enviado (submitted) a IEEE Geoscience and Remote Sensing Letters en 2026, por lo que las cifras de la model card pueden no haber pasado revisión por pares en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/isp-uv-es/FDR4VGT-CLOUD
- Dataset de ejemplo (escena Proba-V): https://huggingface.co/datasets/isp-uv-es/ProbaV-SPOT
- Repositorio de codigo: https://github.com/IPL-UV/fdr4vgt-cloud
- Notebook de inicio rapido (GitHub): https://github.com/IPL-UV/fdr4vgt-cloud/blob/main/notebooks/01_quickstart.ipynb
- Notebook en Colab: https://colab.research.google.com/github/IPL-UV/fdr4vgt-cloud/blob/main/notebooks/01_quickstart.ipynb
- Herramienta de anotacion IRIS (ESA PhiLab): https://github.com/ESA-PhiLab/iris
- Paper: Contreras, Aybar, Gomez-Chova, "A multisensor deep learning framework for robust cloud segmentation in SPOT-VGT and Proba-V", IEEE Geoscience and Remote Sensing Letters, enviado en 2026 (sin URL disponible en la informacion proporcionada)
- Licencia CC0-1.0: https://creativecommons.org/publicdomain/zero/1.0/
