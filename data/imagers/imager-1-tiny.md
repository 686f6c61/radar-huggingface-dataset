# Imagers/Imager-1-tiny

## Resumen

Imager-1-tiny es un clasificador de imágenes desarrollado por Imagers que distingue entre fotografías reales e imágenes generadas por IA. Forma parte de la familia IMAGER de modelos de detección de contenido sintético de código abierto. Se trata de una ResNet-50 convolucional afinada a partir de pesos preentrenados en ImageNet, con aproximadamente 25 millones de parámetros y una entrada fija de 224 x 224 píxeles.

El modelo está pensado para entornos con recursos limitados: su tamano reducido permite ejecutarlo en CPU, dispositivos de borde o servidores con poca memoria, manteniendo una exactitud de validación declarada del 97,03% y un AUC-ROC de 0,982 sobre su conjunto de validación. Devuelve un único logit que, tras aplicar sigmoide y un umbral óptimo de 0,385, se traduce en la etiqueta Real (0) o IA (1).

Es relevante en el contexto actual de proliferación de generadores de imágenes (DALL-E 3, Midjourney v6, SDXL, SD3) porque ofrece un detector ligero y de licencia permisiva (Apache 2.0 sobre los pesos) que puede integrarse en pipelines de moderación y verificación sin requerir hardware especializado. La información pública sobre el modelo procede casi exclusivamente de su model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-50 (red neuronal convolucional, CNN) |
| Parametros totales | ~25 millones |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificacion de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (segun metadatos de HuggingFace; la tarea es de vision, no de lenguaje) |
| Licencia | Apache 2.0 (pesos); ver nota sobre licencias de los datasets de entrenamiento |
| Formato de pesos | PyTorch state dict (archivo .pth, p. ej. imager-1-tiny_best.pth) |
| Tamano de entrada | 224 x 224 px (redimensionado a 256 y recorte central a 224) |
| Salida | un unico logit; probabilidad de IA tras sigmoide |
| Umbral de decision optimo | 0,385 (critico para una inferencia correcta) |
| Normalizacion | estandar ImageNet (media [0.485, 0.456, 0.406]; desv. [0.229, 0.224, 0.225]) |
| Pipeline | image-classification |

## Arquitectura y entrenamiento

La arquitectura es una ResNet-50 clasica de torchvision con la capa final sustituida por una capa lineal de una sola salida (model.fc = nn.Linear(model.fc.in_features, 1)). El modelo parte de pesos preentrenados en ImageNet y se afina para una tarea binaria de clasificacion. La funcion de perdida es BCEWithLogitsLoss y la optimizacion se realizo con AdamW a una tasa de aprendizaje de 1e-4 o 2e-4 (la model card no especifica cual) con tamano de lote de 32 o 64. El entrenamiento se ejecuto en precision FP32 completa sobre un entorno GPU de Kaggle (NVIDIA T4 o P100), con parada temprana en la epoca 35 al no observarse mejora durante 8 epocas consecutivas, y una duracion total de aproximadamente 6,03 horas.

Los datos de entrenamiento combinan dos conjuntos: Hemg/AI-Generated-vs-Real-Images-Datasets (152.710 imagenes) y Rajarshi-Roy-research/Defactify_Image_Dataset (aproximadamente 96.000 imagenes generadas por DALL-E 3, Midjourney v6, SDXL y SD3). El mapeo de etiquetas es 0 = imagen real y 1 = imagen generada por IA. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un clasificador de vision. Tampoco se documentan innovaciones arquitectonicas adicionales mas alla del reemplazo de la capa de clasificacion.

## Capacidades

- Clasificacion binaria de imagenes: distingue fotografias reales de imagenes generadas por IA.
- Inferencia ligera: ejecutable en CPU, dispositivos de borde y servidores con memoria muy reducida.
- Salida probabilistica: devuelve una probabilidad de IA que permite ajustar el umbral segun la politica de cada aplicacion.
- Deteccion sobre multiples generadores: entrenado con imagenes de DALL-E 3, Midjourney v6, SDXL y SD3, ademas de fotografias reales.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de agente ni razonamiento multi-paso.
- Sin capacidades de generacion de texto, codigo, matematicas ni vision general (no es un modelo multimodal ni un VLM).
- Sin capacidades multilingues relevantes: la tarea es de vision y los metadatos solo indican "en".
- No dispone de modo de razonamiento (thinking mode), audio ni video.

## Casos de uso

- Moderacion de contenido en plataformas: filtrado automatico de imagenes sinteticas subidas por usuarios antes de la revision humana, aprovechando su bajo coste de computo para procesar volumenes altos.
- Verificacion periodistica y fact-checking: herramienta de apoyo para redacciones que necesitan una primera senal de alerta sobre imagenes sospechosas, siempre acompanada de revision humana dado el caracter estadistico del modelo.
- Pre-filtrado en pipelines de datos de investigacion: limpieza de conjuntos de imagenes para eliminar muestras generadas por IA antes de reutilizarlas en entrenamiento o analisis.
- Marketplaces de productos: deteccion de imagenes de catalogo generadas sinteticamente cuando las politicas de la plataforma exigen fotografia real del articulo.
- Aplicaciones moviles y de borde: ejecucion embebida en dispositivos con poca memoria (la model card menciona entornos de 512 MB de RAM) para comprobar la autenticidad de una imagen en el propio dispositivo.
- Triaje en flujos forenses digitales: capa inicial que prioriza que imagenes revisar manualmente en una investigacion, sin sustituir nunca el analisis pericial.
- Redes sociales y foros: etiquetado automatico de publicaciones con imagenes potencialmente generadas por IA para anadir avisos de contexto al usuario.

## Benchmarks y rendimiento

Resultados de validacion declarados en la model card:

| Metrica | Valor |
|---|---|
| Exactitud de validacion | 97,03% |
| Macro F1 | 0,9737 |
| F1 de la clase IA | 0,9608 |
| AUC-ROC | 0,982 |
| Recall clase Real | 98,0% |
| Recall clase IA | 95,9% |

Matriz de confusion (conjunto de validacion):

| | Predicho Real | Predicho IA |
|---|---|---|
| Real real | 11.937 | 239 |
| IA real | 442 | 10.288 |

No se han publicado resultados frente a otros detectores de imagenes generadas por IA (como comparativas con clasificadores de la misma categoria) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (los pesos de ~25 millones de parametros ocupan aproximadamente 100 MB, mas activaciones y lote).
- Cabe en cualquier GPU de consumo, incluidas GTX 1050, GTX serie 16, RTX 3050, RTX 4090 o superiores, con margen amplio.
- Inferencia viable en CPU, dado el reducido numero de parametros y el tamano de entrada fijo (224 x 224).
- Hardware de entrenamiento documentado: NVIDIA T4 o P100 en un entorno GPU de Kaggle.
- Opciones de despliegue: carga manual en PyTorch con torchvision (procedimiento documentado en la model card). No se documentan integraciones oficiales con vLLM, llama.cpp, Ollama ni TGI, que ademas estan orientados a modelos de lenguaje y no a clasificadores CNN de vision.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Imager-1-tiny | ~25 M | no aplica | Deteccion de imagen IA vs. real | Apache 2.0 (pesos) | HuggingFace |
| Otros modelos de la familia IMAGER | no disponible | no disponible | Deteccion de imagen IA vs. real | no disponible | no disponible |
| Detectores alternativos comparables | no disponible | no disponible | Deteccion de imagen IA vs. real | no disponible | no disponible |

No se dispone de datos de comparacion con modelos equivalentes de la misma categoria en la informacion proporcionada. Los resultados de busqueda web obtenidos corresponden a generadores de imagenes (MAI-Image-1, Nano Banana 2, Bonsai Image 4B) y a rankings de generacion, no a detectores comparables de imagen real frente a IA.

## Limitaciones y advertencias

- No debe usarse como evidencia unica en contextos medicos o legales: es una herramienta estadistica, no una autoridad forense, y siempre debe combinarse con revision humana.
- Riesgo de fallo con imagenes muy comprimidas o editadas (por ejemplo, JPEG de baja calidad), con filtros intensos o con artefactos de posprocesado no vistos durante el entrenamiento.
- Vulnerabilidad a ataques adversarios: como cualquier detector actual, puede ser enganado con ruido disenado especificamente para ello.
- Sesgo de rendimiento: el modelo detecta mejor las imagenes reales (98,0% de recall) que las generadas por IA (95,9%), lo que implica una mayor tasa de falsos negativos en la clase IA.
- Cobertura de generadores limitada a los incluidos en el entrenamiento (DALL-E 3, Midjourney v6, SDXL, SD3 y las fuentes de los datasets); el rendimiento frente a generadores mas recientes o distintos no esta documentado.
- Restricciones de licencia: aunque los pesos son Apache 2.0, el dataset Defactify esta bajo licencia MIT y el dataset Hemg esta destinado a fines de investigacion. El uso comercial debe revisarse frente a los terminos originales de ambos datasets para garantizar el cumplimiento.
- Dependencia de un umbral especifico: la model card insiste en que el umbral de decision de 0,385 es critico para una inferencia correcta; usar 0,5 u otro valor altera las tasas de error.
- Carga no estandar: al ser un checkpoint PyTorch personalizado, no se puede cargar directamente con AutoModel; requiere definir la arquitectura ResNet-50 y sustituir la capa final manualmente.
- El modelo esta marcado con 0 descargas y 0 likes en HuggingFace y sus metadatos indican una fecha de creacion reciente, por lo que su validacion por parte de la comunidad es practicamente inexistente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Imagers/Imager-1-tiny
- Dataset Hemg/AI-Generated-vs-Real-Images-Datasets: https://huggingface.co/datasets/Hemg/AI-Generated-vs-Real-Images-Datasets
- Dataset Rajarshi-Roy-research/Defactify_Image_Dataset: https://huggingface.co/datasets/Rajarshi-Roy-research/Defactify_Image_Dataset
- Paper, blog, repositorio o demo oficial: no disponibles en la informacion proporcionada.
- La busqueda web no devolvio enlaces relevantes especificos sobre Imager-1-tiny ni sobre la familia IMAGER; los resultados obtenidos corresponden a modelos generadores de imagenes no relacionados.
