# dronefreak/bdd100k-weather-repvit_m2_3

## Resumen

RepViT-M2.3 finetuneado sobre BDD100K Weather Classification es un clasificador de imagenes de escenas de conduccion que predice la condicion meteorologica a partir de una sola imagen de camara de coche. Lo desarrolla el usuario dronefreak como parte de BDD100K-Toolkit, una herramienta para preparar el dataset BDD100K, entrenar modelos sobre el y evaluarlos con las mismas metricas y los mismos splits. Parte del checkpoint preentrenado `timm/repvit_m2_3.dist_300e_in1k` (destilacion sobre ImageNet-1k, 300 epocas) y anade una cabeza de 7 clases.

La tarea es no oficial y reproduce la del dataset de Kaggle del mismo nombre: clasificar cada imagen en una de siete categorias derivadas del campo `attributes.weather` de BDD100K (clear, partly cloudy, overcast, rainy, snowy, foggy y unknown). El modelo tiene 22,4 millones de parametros y el repositorio ocupa 0,1 GB, por lo que es un candidato claro para despliegue en el borde o en GPU de consumo. La licencia es Apache-2.0.

Es relevante ahora porque ofrece un punto de comparacion reproducible: el autor publica un model zoo con once arquitecturas evaluadas sobre el mismo split de test (10.000 imagenes) con las mismas metricas, lo que permite elegir un backbone ligero para preprocesado meteorologico en pipelines de conduccion autonoma sin tener que reentrenar. Su adopcion publica es todavia muy baja: 0 descargas y 1 like en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RepViT (CNN movil con bloques que combinan token mixer depthwise y channel mixer, inspirada en ViT) |
| Parametros totales | 22,4 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificador de imagen unica, sin contexto secuencial) |
| Resolucion de entrada | definida en el checkpoint por el campo `imgsz`; valor concreto no disponible en la informacion proporcionada |
| Numero de clases | 7 (clear, partly cloudy, overcast, rainy, snowy, foggy, unknown) |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de vision, no procesa texto) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch `.pt` (dict con `model_name`, `state_dict`, `class_names`, `imgsz`, `mean` y `std`) |
| Libreria | timm |
| Modelo base | timm/repvit_m2_3.dist_300e_in1k |
| Dataset de entrenamiento | dronefreak/BDD100K-Weather-Classification |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

RepViT se presenta en el articulo arXiv:2307.09283 como una revision de las CNN moviles desde la perspectiva de los transformers de vision. La arquitectura mantiene el esquema por etapas de las CNN ligeras, pero reordena el bloque basico para separar un token mixer (convolucion depthwise) de un channel mixer (convolucion punto a punto y red feed-forward), lo que aproxima el patron de computo de un ViT manteniendo el coste de una CNN movil. La variante M2.3 es la mayor de la familia y concentra 22,4 millones de parametros. El checkpoint de partida se entreno con destilacion desde un profesor de mayor capacidad durante 300 epocas sobre ImageNet-1k.

El finetune se realiza sobre BDD100K, un dataset de conduccion heterogeneo presentado en arXiv:1805.04687, usando el campo `attributes.weather` de cada imagen como etiqueta. No se especifican en la model card el numero de imagenes de entrenamiento, el regimen de aumento de datos, la tasa de aprendizaje, el numero de epocas de ajuste fino ni si se aplicaron tecnicas de reequilibrado de clases. Tampoco se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, que no aplican a un clasificador de imagen. La innovacion practica del repositorio esta en el entorno de evaluacion reproducible (BDD100K-Toolkit) mas que en el modelo en si.

## Capacidades

- Clasificacion de imagen unica en 7 categorias meteorologicas de escenas de conduccion: clear, partly cloudy, overcast, rainy, snowy, foggy y unknown.
- Salida de probabilidades por clase mediante softmax, lo que permite umbralizar o combinar con heuristicas posteriores.
- Inferencia de muy bajo coste: 22,4 millones de parametros, viable en CPU y en hardware de borde.
- Extraccion de caracteristicas: al ser un modelo timm, la cabeza de clasificacion puede sustituirse o retirarse para usar el backbone en otras tareas de vision (deteccion, segmentacion, retrieval) previo reentrenamiento.
- Integracion sencilla en PyTorch mediante `timm.create_model` y carga del `state_dict` desde el checkpoint.
- No soporta tool calling, function calling ni uso como agente: es un clasificador visual, no un modelo generativo.
- No tiene capacidades multilingues, de razonamiento, de codigo ni de matematicas.
- No dispone de modo thinking, vision multimodal, audio ni generacion de texto.

## Casos de uso

- Etiquetado automatico de clips de conduccion: procesar los fotogramas de un corpus de dashcam y anotar la condicion meteorologica de cada uno, reduciendo el coste de anotacion manual previo al entrenamiento de otros modelos.
- Curado y filtrado de datasets: seleccionar subconjuntos equilibrados por clima (por ejemplo, aislar las imagenes lluviosas o nevadas) para construir splits de evaluacion especificos.
- Modulo de preprocesado en pipelines de conduccion autonoma: activar o desactivar heuristicas de percepcion segun la condicion meteorologica detectada, dado el bajo coste computacional del modelo.
- Monitorizacion de flotas con dashcam: clasificar en tiempo real o en diferido el clima atravesado por cada vehiculo y cruzarlo con incidencias, consumo o eventos de frenada.
- Despliegue en el borde: su tamano permite ejecutarlo en camaras inteligentes o unidades telematicas con CPU o aceleradores de baja potencia, sin depender de conectividad.
- Baseline de investigacion: punto de partida reproducible para comparar nuevas arquitecturas ligeras sobre el mismo split de test y con las mismas metricas que publica el autor.
- Analisis de siniestralidad y seguros de automocion: asociar condiciones meteorologicas a siniestros a partir de grabaciones o imagenes aportadas en expedientes.
- Control de calidad de datos de sensores: descartar o marcar imagenes cuya prediccion meteorologica es poco fiable (clase foggy o baja confianza) antes de entrenar sistemas criticos.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index, no verificados de forma independiente (campo `verified: false`). Evaluacion sobre el split `test` de 10.000 imagenes de BDD100K Weather Classification.

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 83,02 % |
| Top-5 accuracy | 99,85 % |
| Macro F1 | 65,46 % |
| Balanced accuracy (macro recall) | 64,33 % |
| Macro precision | 67,02 % |

Desglose por clase:

| Clase | Precision | Recall | F1 | Imagenes de test |
|---|---|---|---|---|
| clear | 90,47 % | 93,10 % | 91,77 % | 5346 |
| foggy | 0,00 % | 0,00 % | 0,00 % | 13 |
| overcast | 68,30 % | 67,31 % | 67,80 % | 1239 |
| partly cloudy | 68,27 % | 65,58 % | 66,90 % | 738 |
| rainy | 86,79 % | 68,56 % | 76,61 % | 738 |
| snowy | 84,54 % | 77,50 % | 80,87 % | 769 |
| unknown | 70,76 % | 78,22 % | 74,30 % | 1157 |

El autor indica que el checkpoint no clasifica correctamente ninguna de las 13 imagenes de test de la clase foggy, por lo que esa clase debe considerarse no soportada.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 22,4 M de parametros, sin contar el overhead del framework): en torno a 90 MB en FP32, 45 MB en FP16 y 22 MB en INT8.
- GPU recomendadas: cualquiera con al menos 1-2 GB de VRAM. Funciona sin problema en RTX 3060, RTX 4090, T4, L4, A100 o H100; el modelo esta muy por debajo de la capacidad de todas ellas.
- GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo actual e incluso en iGPU y en aceleradores de borde tipo Jetson o Coral.
- CPU: la inferencia en CPU es perfectamente viable dado el tamano del modelo; el cuello de botella sera el preprocesado de imagen, no la red.
- Opciones de despliegue: PyTorch nativo, timm para construccion del modelo, exportacion a ONNX Runtime o TensorRT para produccion, y conversion a formatos moviles si se necesita ejecucion en dispositivo. No aplica llama.cpp, Ollama, vLLM ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dependeran del hardware, de la resolucion de entrada definida en `imgsz` y del tamano de lote.
- Nota de despliegue: el checkpoint incluye los campos `mean` y `std` de normalizacion, por lo que el preprocesado debe tomarlos del propio fichero en lugar de asumir los valores por defecto de ImageNet.

## Comparativa con modelos similares

Comparativa publicada por el propio autor en el model zoo del repositorio, con todos los modelos evaluados sobre el mismo split `test`, ordenada por top-1 accuracy. El listado original aparece truncado en la informacion disponible.

| Modelo | Top-1 | Macro F1 | Balanced accuracy | Macro precision |
|---|---|---|---|---|
| TinyViT-21M | 83,90 % | 68,65 % | 67,15 % | 74,81 % |
| EfficientViT-B3 | 83,51 % | 68,17 % | 66,34 % | 81,75 % |
| EfficientViT-B2 | 83,46 % | 66,07 % | 65,04 % | 67,54 % |
| EfficientFormerV2-L | 83,27 % | 65,93 % | 65,03 % | 67,12 % |
| RepViT-M1.5 | 83,19 % | 67,78 % | 65,71 % | 81,56 % |
| EfficientViT-L1 | 83,13 % | 65,70 % | 65,11 % | 66,46 % |
| RepViT-M2.3 (este modelo) | 83,02 % | 65,46 % | 64,33 % | 67,02 % |
| ConvNeXt-Atto | 83,00 % | 67,44 % | 65,25 % | 81,38 % |
| EfficientFormerV2-S2 | 82,90 % | 65,50 % | 64,68 % | 66,98 % |
| EfficientViT-B0 | 82,79 % | 65,10 % | 63,62 % | 67,11 % |

Lectura de la tabla: RepViT-M2.3 se situa en la zona media-baja del grupo, con 0,88 puntos menos de top-1 que el mejor modelo y peor macro F1 que TinyViT-21M, EfficientViT-B3, RepViT-M1.5 y ConvNeXt-Atto. Destaca que varias alternativas con menos parametros, como EfficientViT-B3 o RepViT-M1.5, obtienen mejor precision macro (81,75 % y 81,56 % frente a 67,02 %), lo que sugiere que este checkpoint concreto esta menos equilibrado entre clases. Comparativa con modelos de lenguaje: no aplica, la tarea es de vision.

## Limitaciones y advertencias

- La clase foggy no se detecta en absoluto: 0 % de precision y recall sobre las 13 imagenes de test. Debe tratarse como clase no soportada en produccion.
- Fuerte desequilibrio de clases en los datos: la clase clear concentra 5346 de las 10.000 imagenes de test. La top-1 accuracy de 83,02 % esta inflada por ese predominio, mientras que el macro F1 cae a 65,46 % y la balanced accuracy a 64,33 %.
- Precision macro baja (67,02 %) en comparacion con alternativas del propio model zoo que superan el 80 %. Confusiones frecuentes entre overcast, partly cloudy y unknown.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de prediccion erronea con alta confianza, especialmente en condiciones visualmente ambiguas o con poca iluminacion.
- Dominio muy restringido: entrenado exclusivamente sobre escenas de conduccion de BDD100K. No se espera un rendimiento fiable en imagenes aereas, interiores, satelitales ni de otros dominios.
- Sesgos geograficos y demograficos heredados de BDD100K, centrado en localizaciones concretas (mayoritariamente Estados Unidos) y con condiciones meteorologicas propias de esas regiones.
- Metricas autodeclaradas y marcadas como no verificadas (`verified: false`) en el model-index. No hay evaluacion independiente.
- La model card no documenta epocas de finetune, hiperparametros, composicion exacta del split de entrenamiento ni estrategia de aumento de datos, lo que dificulta la reproducibilidad.
- No hay variantes cuantizadas publicadas ni datos de latencia o throughput medidos.
- Licencia del modelo Apache-2.0, que permite uso comercial. Sin embargo, BDD100K es un dataset con sus propias condiciones de uso, y la model card no aclara como afectan esas condiciones a los pesos derivados; conviene revisarlas antes de un despliegue comercial.
- Adopcion practicamente nula (0 descargas, 1 like), por lo que no existe una comunidad que haya validado el checkpoint en produccion.
- El listado del model zoo aparece truncado en la informacion disponible, de modo que la comparativa puede estar incompleta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/bdd100k-weather-repvit_m2_3
- Repositorio BDD100K-Toolkit: https://github.com/dronefreak/bdd100k-toolkit
- Dataset de entrenamiento: https://huggingface.co/datasets/dronefreak/BDD100K-Weather-Classification
- Modelo base en timm: https://huggingface.co/timm/repvit_m2_3.dist_300e_in1k
- Paper de RepViT: https://arxiv.org/abs/2307.09283
- Paper de BDD100K: https://arxiv.org/abs/1805.04687
- Dataset original BDD100K: https://bdd-data.berkeley.edu/
