# dronefreak/bdd100k-weather-repvit_m1_5

## Resumen

RepViT-M1.5 fine-tuned on BDD100K Weather Classification es un clasificador de imágenes de escenas de conducción que predice la condición meteorológica de la escena en siete categorías: clear, partly cloudy, overcast, rainy, snowy, foggy y unknown. Lo publica el usuario dronefreak dentro del proyecto BDD100K-Toolkit, un conjunto de herramientas para preparar BDD100K, entrenar modelos sobre él y evaluarlos con las mismas métricas y particiones. La tarea es no oficial y se deriva del campo por imagen attributes.weather de BDD100K, siguiendo el dataset de Kaggle del mismo nombre.

El modelo es un fine-tuning del backbone RepViT-M1.5 (timm/repvit_m1_5.dist_300e_in1k), una red convolucional ligera de 13,6 millones de parámetros diseñada con criterios de arquitectura tipo ViT, destilada sobre ImageNet-1k durante 300 épocas. Sobre esa base se ha entrenado un cabezal de clasificación de 7 clases, obteniendo un 83,19 % de top-1 y un 99,71 % de top-5 en la partición de test de 10.000 imágenes, con un macro F1 de 67,78 %.

Su relevancia práctica está en el coste: con 13,6 millones de parámetros y un repositorio de solo 0,1 GB, es un candidato directo a inferencia en tiempo real en plataformas embebidas o GPU de gama de consumo dentro de una pila de percepción para conducción autónoma, donde la condición meteorológica condiciona la fiabilidad de otros módulos (detección, segmentación, profundidad). Se distribuye bajo licencia Apache-2.0 y se carga con timm y PyTorch.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RepViT (red convolucional ligera con elementos de diseño tipo ViT), usada como backbone de clasificación de imágenes |
| Parametros totales | 13,6 M (según la model card); cabezal final de 7 clases |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: entrada de imagen única, no secuencial) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones publicadas; el checkpoint se distribuye en punto flotante) |
| Idiomas soportados | no disponible (no aplica: modelo de visión, no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch: best.pt con claves model_name, state_dict, class_names, imgsz, mean y std |

Datos adicionales: pipeline image-classification, librería timm, tamaño del repositorio 0,1 GB, modelo base timm/repvit_m1_5.dist_300e_in1k, dataset de entrenamiento y evaluación dronefreak/BDD100K-Weather-Classification.

## Arquitectura y entrenamiento

La base es RepViT, presentada en el artículo arXiv:2307.09283 (RepViT: Revisiting Mobile CNN From ViT Perspective). Se trata de una familia de backbones móviles que parte de bloques convolucionales y adopta decisiones de diseño propias de los transformers de visión (uso intensivo de convoluciones depthwise, estructura de etapas, reparameterización estructural y entrenamiento con destilación). La variante M1.5 empleada aquí fue preentrenada con destilación durante 300 épocas sobre ImageNet-1k (el sufijo dist_300e_in1k del identificador de timm). El modelo publicado añade un cabezal lineal de 7 salidas y se ajusta de extremo a extremo sobre el dataset de clasificación meteorológica.

Los datos de entrenamiento provienen de BDD100K (arXiv:1805.04687), concretamente del campo de atributos por imagen attributes.weather, del que se derivan las 7 clases del problema. No se especifican en la información disponible el número de imágenes de entrenamiento, el tamaño de entrada (imgsz), la composición exacta del split de entrenamiento, ni si se aplicaron técnicas de aumento de datos, balanceo de clases, RLHF/DPO (no aplicables a clasificación) u otras estrategias de regularización. La evaluación se realiza sobre la partición de test de 10.000 imágenes, con métricas macro para compensar el desbalanceo entre clases.

## Capacidades

- Clasificación de imágenes de escenas de conducción en 7 clases meteorológicas: clear, partly cloudy, overcast, rainy, snowy, foggy y unknown.
- Salida de probabilidades por clase mediante softmax, lo que permite aplicar umbrales de confianza o abstención en producción.
- Top-5 accuracy del 99,71 %, útil para descartar clases improbables en pipelines con lógica posterior.
- Ejecución sobre imagen RGB individual, con preprocesado de redimensionado, conversión a tensor y normalización con media y desviación típica almacenadas en el propio checkpoint.
- Integración directa con timm y PyTorch: creación del modelo por nombre y carga de state_dict.
- No dispone de tool calling, function calling, capacidad de agente, razonamiento multi-paso, generación de texto ni capacidades multilingües: es un clasificador visual puro.
- No tiene modo "thinking", ni visión-lenguaje, ni entrada de audio.

## Casos de uso

- Pila de percepción para conducción autónoma: la condición meteorológica se usa como variable de contexto para ajustar umbrales de detección y seguimiento; con 13,6 M de parámetros el clasificador puede ejecutarse en cada fotograma sin comprometer el presupuesto de cómputo del resto del sistema.
- Etiquetado automático y curación de datasets de conducción: clasificar grandes volúmenes de imágenes de dashcam o de flotas para estratificar por meteorología antes de entrenar detectores o segmentadores, reduciendo trabajo manual de anotación.
- Análisis de flotas y telemática: procesar grabaciones de vehículos comerciales para medir exposición a lluvia, nieve o niebla por ruta y franja horaria, alimentando informes de riesgo y mantenimiento.
- Enrutado y planificación de rutas sensibles al clima: introducir la predicción meteorológica por tramo como señal auxiliar en sistemas de planificación que deban penalizar condiciones adversas.
- Monitorización de infraestructuras viarias: cámaras fijas en carretera que reporten de forma continua el estado meteorológico de la vía para activar protocolos de vialidad invernal o avisos a conductores.
- Robótica de exterior y drones: adaptar el comportamiento de un vehículo autónomo terrestre o aéreo (velocidad, altura, sensores activos) según la clase meteorológica detectada en la escena.
- Control de calidad y validación de modelos: usar la clase unknown y la confianza de la predicción como filtro para descartar imágenes ambiguas o fuera de dominio antes de que entren en un pipeline de anotación automática.
- Segmentación previa de datos para investigación: separar subconjuntos por clima en estudios de robustez de modelos de conducción autónoma, ya que el mismo modelo se ha evaluado con las mismas particiones que otros backbones del model zoo del autor.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (métricas no verificadas por Hugging Face), evaluados sobre la partición test de 10.000 imágenes:

| Métrica | Valor |
|---|---|
| Top-1 accuracy | 83,19 % |
| Top-5 accuracy | 99,71 % |
| Macro F1 | 67,78 % |
| Balanced accuracy | 65,71 % |
| Macro precision | 81,56 % |
| Macro recall | 65,71 % |

Desglose por clase (partición de test):

| Clase | Precision | Recall | F1 | Imágenes de test |
|---|---|---|---|---|
| clear | 90,59 % | 93,08 % | 91,82 % | 5346 |
| foggy | 100,00 % | 7,69 % | 14,29 % | 13 (pocas) |
| overcast | 68,26 % | 66,67 % | 67,46 % | 1239 |
| partly cloudy | 68,90 % | 65,45 % | 67,13 % | 738 |
| rainy | 85,91 % | 69,38 % | 76,76 % | 738 |
| snowy | 86,87 % | 78,28 % | 82,35 % | 769 |
| unknown | 70,37 % | 79,43 % | 74,62 % | 1157 |

## Requisitos de hardware

- Peso del modelo: 13,6 M de parámetros, aproximadamente 54 MB en fp32 y 27 MB en fp16 (sin contar el optimizador, que no se incluye en el checkpoint).
- VRAM de inferencia: del orden de decenas o pocos cientos de MB por lote, dependiendo de la resolución de entrada efectiva, que no se documenta (imgsz se almacena en el propio checkpoint). Cabe holgadamente en cualquier GPU de consumo, incluida una GTX 1650 o una RTX 3060, y en GPUs integradas de portátil.
- Ejecución en CPU viable: el tamaño reducido del backbone hace razonable la inferencia en CPU para procesamiento por lotes offline.
- Plataformas embebidas: es un modelo candidato para NVIDIA Jetson (Nano, Orin), Raspberry Pi con acelerador o NPUs móviles, si bien no hay cifras de latencia publicadas.
- Opciones de despliegue: PyTorch + timm de forma nativa; exportación a TorchScript, ONNX, TensorRT, OpenVINO o CoreML no está documentada en la información disponible, pero es factible al ser un backbone estándar de timm. vLLM, llama.cpp, Ollama y TGI no son aplicables: no es un modelo de lenguaje.
- Latencia y throughput: no disponible (no se publican mediciones).
- Repositorio de 0,1 GB, lo que facilita su distribución y almacenamiento en caché local.

## Comparativa con modelos similares

Comparación con otros backbones del model zoo del mismo autor, evaluados sobre la misma partición test y con las mismas métricas:

| Modelo | Top-1 | Macro F1 | Balanced accuracy | Macro precision |
|---|---|---|---|---|
| TinyViT-21M | 83,90 % | 68,65 % | 67,15 % | 74,81 % |
| EfficientViT-B3 | 83,51 % | 68,17 % | 66,34 % | 81,75 % |
| EfficientViT-B2 | 83,46 % | 66,07 % | 65,04 % | 67,54 % |
| EfficientFormerV2-L | 83,27 % | 65,93 % | 65,03 % | 67,12 % |
| RepViT-M1.5 (este modelo) | 83,19 % | 67,78 % | 65,71 % | 81,56 % |
| EfficientViT-L1 | 83,13 % | 65,70 % | 65,11 % | 66,46 % |
| RepViT-M2.3 | 83,02 % | 65,46 % | 64,33 % | 67,02 % |
| ConvNeXt-Atto | 83,00 % | 67,44 % | 65,25 % | 81,38 % |
| EfficientFormerV2-S2 | 82,90 % | 65,50 % | 64,68 % | 66,98 % |
| EfficientViT-B0 | 82,79 % | 65,10 % | 63,62 % | 67,11 % |
| EfficientViT-B1 | 82,67 % | 64,95 % | 63,59 % | 66,83 % |
| MobileNetV4-Conv-Large | 82,20 % | 66,62 % | 64,68 % | 80,26 % |

Datos de parámetros de los modelos comparables, licencias individuales y disponibilidad de checkpoints: no disponibles en la información proporcionada, salvo el dato de que RepViT-M1.5 tiene 13,6 M de parámetros. El listado del model zoo aparece truncado en la información recibida, por lo que pueden existir más entradas no recogidas aquí.

## Limitaciones y advertencias

- La clase foggy tiene un rendimiento inservible en la práctica: 100 % de precision pero 7,69 % de recall sobre solo 13 imágenes de test. Cualquier despliegue que dependa de detectar niebla debe considerarse no fiable.
- La brecha entre top-1 accuracy (83,19 %) y macro F1 (67,78 %) indica un fuerte desbalanceo de clases: clear concentra 5346 de las 10.000 imágenes de test y arrastra la métrica global. Las clases mayoritarias funcionan mucho mejor que las minoritarias.
- overcast y partly cloudy se confunden con frecuencia (F1 de 67,46 % y 67,13 % respectivamente), con precision y recall en torno al 65-69 %. La frontera entre ambas categorías es intrínsecamente ambigua.
- La tarea es no oficial y se ha construido derivando el campo attributes.weather de BDD100K; no existe una definición canónica publicada de las etiquetas, lo que dificulta comparar con terceros.
- Las métricas están marcadas como no verificadas en el model-index de Hugging Face: proceden del propio autor y no de una evaluación independiente.
- No se documentan sesgos geográficos ni demográficos, pero BDD100K se recogió en entornos de conducción muy concretos (principalmente Estados Unidos), por lo que la generalización a otras regiones, tipos de vía o iluminaciones es incierta.
- Riesgo de degradación fuera de dominio: no hay datos sobre robustez ante cámaras distintas, resoluciones extremas, imágenes nocturnas o escenas no viales. La clase unknown actúa como válvula de escape, pero su F1 es de 74,62 %.
- No se especifican hiperparámetros de entrenamiento, estrategia de aumento de datos ni si hubo balanceo, lo que limita la reproducibilidad del fine-tuning.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación por parte de la comunidad.
- La licencia Apache-2.0 permite uso comercial del artefacto publicado, pero el dataset BDD100K y el dataset derivado de clasificación meteorológica tienen sus propias condiciones de uso, que deben revisarse por separado antes de un despliegue comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-weather-repvit_m1_5
- Modelo base en timm/Hugging Face: https://huggingface.co/timm/repvit_m1_5.dist_300e_in1k
- Dataset de clasificación meteorológica: https://huggingface.co/datasets/dronefreak/BDD100K-Weather-Classification
- Repositorio BDD100K-Toolkit: https://github.com/dronefreak/bdd100k-toolkit
- Paper de RepViT: https://arxiv.org/abs/2307.09283
- Paper de BDD100K: https://arxiv.org/abs/1805.04687
- Dataset original de BDD100K: https://bdd-data.berkeley.edu/ (referencia citada en la model card a través del paper; no se incluye enlace directo en la información proporcionada)
- Recursos multimedia del repositorio (banner de demostración): https://huggingface.co/dronefreak/bdd100k-weather-repvit_m1_5/resolve/main/assets/demo_banner.mp4
