# dronefreak/bdd100k-weather-efficientformerv2_s2

## Resumen

EfficientFormerV2-S2 finetuneado sobre BDD100K Weather Classification es un clasificador de imágenes desarrollado por el usuario dronefreak que predice la condición meteorológica de una escena de conducción a partir de una única imagen RGB. Parte del checkpoint preentrenado `timm/efficientformerv2_s2.snap_dist_in1k` (12,1 millones de parámetros) y lo ajusta sobre un subconjunto de BDD100K derivado del campo `attributes.weather`, con siete clases: clear, partly cloudy, overcast, rainy, snowy, foggy y unknown. Se publica junto a BDD100K-Toolkit, una herramienta sin dependencias pesadas para preparar, entrenar y evaluar sobre BDD100K con las mismas métricas y los mismos splits.

El modelo resuelve un problema acotado pero recurrente en percepción para conducción autónoma: el etiquetado y enrutado automático por condiciones meteorológicas. Con 12,1 M de parámetros y un repositorio de 0,1 GB, es un modelo pensado para inferencia barata en GPU de consumo o incluso CPU, no para razonamiento multimodal. Su relevancia actual está en que permite etiquetar a gran escala datasets de conducción, filtrar escenas adversas y activar pipelines específicos para lluvia, nieve o niebla sin coste computacional apreciable.

Los resultados declarados por el autor sobre el split `test` (10 000 imágenes) son 82,90 % de Top-1, 99,74 % de Top-5 y 65,50 % de Macro F1. La horquilla entre Top-1 y Macro F1 refleja un desequilibrio de clases fuerte (5 346 imágenes `clear` frente a 13 `foggy`) y un rendimiento nulo en la clase `foggy`, que el propio autor desaconseja tratar como soportada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientFormerV2-S2 (hibrida: etapas convolucionales + bloques de atencion) |
| Parametros totales | 12,1 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de clasificacion de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (entrada visual) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint PyTorch `.pt` (`best.pt`) con `state_dict`, `model_name`, `class_names`, `imgsz`, `mean` y `std` |

Datos adicionales: tarea `image-classification`, libreria `timm`, tamano del repositorio 0,1 GB, resolucion de entrada definida en el propio checkpoint (`imgsz`) pero no declarada en la documentacion publica. Clases de salida: clear, partly cloudy, overcast, rainy, snowy, foggy, unknown.

## Arquitectura y entrenamiento

La base es EfficientFormerV2, una familia de redes de vision disenada para mantener latencia baja sin recurrir a operaciones costosas. EfficientFormerV2 emplea un diseno de dimension consistente: un stem y etapas iniciales puramente convolucionales, seguidas de etapas con bloques de atencion multi-cabeza, de modo que las primeras capas extraen caracteristicas locales a alta resolucion y las ultimas modelan dependencias globales sobre mapas ya reducidos. La variante S2, con 12,1 M de parametros, es el escalon intermedio de la familia. El checkpoint base de `timm` incorpora destilacion sobre ImageNet-1k (`snap_dist_in1k`), es decir, el modelo estudiante se entreno imitando a un profesor de mayor capacidad, lo que mejora la precision del backbone sin aumentar su tamano.

El ajuste se realiza sobre el dataset BDD100K Weather Classification, derivado del campo `attributes.weather` de BDD100K. El autor no documenta el numero de imagenes de entrenamiento, el numero de epocas, el optimizador, el regimen de congelacion de capas ni si hubo aumento de datos; esa informacion no esta disponible. Si se documenta que la evaluacion se hizo sobre el split `test` oficial de 10 000 imagenes y que la particion empleada es la misma para todos los modelos del zoo publicado. La clase `foggy` cuenta con solo 13 imagenes en test, lo que hace que sus metricas por clase no sean estadisticamente significativas.

## Capacidades

- Clasificacion de imagen en 7 clases meteorologicas: clear, partly cloudy, overcast, rainy, snowy, foggy y unknown.
- Inferencia de un solo paso sobre una imagen RGB; no es un modelo generativo ni multimodal.
- Extraccion de caracteristicas de backbone: al ser un modelo `timm`, la `state_dict` puede cargarse con `num_classes=0` para usar el modelo como extractor de embeddings visuales.
- Etiquetado masivo por lotes: permite procesar datasets completos de conduccion con coste bajo.
- Salida con probabilidades por clase via `softmax`, util para umbralizar o descartar predicciones de baja confianza.
- Deteccion de condiciones adversas con recall alto en `snowy` (75,29 %) y `rainy` (67,89 %), relevante para enrutado de pipelines.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni entrada de texto.
- No soporta vision mas alla de la imagen de entrada individual: no hay video nativo ni modelado temporal, aunque se puede aplicar fotograma a fotograma.

## Casos de uso

- Preetiquetado de datasets de conduccion: dado un conjunto de imagenes de dashcam sin etiquetar, el modelo asigna la clase meteorologica de forma automatica con 82,90 % de Top-1, reduciendo el trabajo manual de anotacion a una fase de revision de las muestras de baja confianza.
- Filtrado y curado de corpus para entrenamiento de percepcion: seleccionar subconjuntos equilibrados de escenas de lluvia, nieve o niebla para entrenar o evaluar modelos de deteccion y segmentacion en condiciones adversas, usando el modelo como clasificador de criba.
- Enrutado condicional de pipelines en conduccion autonoma: activar ramas de postprocesado o pesos especificos cuando la prediccion es `rainy`, `snowy` o `foggy`, en lugar de ejecutar siempre el mismo camino. El coste de 12,1 M de parametros lo hace viable como etapa previa en tiempo real.
- Monitorizacion de flotas y telematica: clasificar las imagenes subidas por vehiculos para construir estadisticas de exposicion a condiciones meteorologicas, correlacionables con siniestralidad o desgaste de sensores.
- Sistemas de aviso al conductor: activar avisos de visibilidad reducida o de calzada deslizante cuando la clase predicha es `snowy`, `rainy` o `foggy`, siempre como senal auxiliar, nunca como sustituto de sensores fisicos.
- Investigacion en robustez visual: servir de baseline barato para medir como degradan los modelos de vision al cambiar de condicion meteorologica, comparando rendimiento entre subconjuntos `clear` y `rainy`/`snowy` del mismo dataset.
- Prototipado en hardware embarcado: por su tamano, el modelo cabe en dispositivos tipo Jetson o en CPU de un vehiculo, lo que permite desplegar la clasificacion meteorologica sin GPU dedicada.
- Indexado y busqueda de video en dashcams: etiquetar fotogramas o clips por condicion meteorologica para permitir busquedas del tipo "todos los clips con nieve" en archivos de gran tamano.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split `test` de BDD100K Weather Classification (10 000 imagenes). Ningun resultado esta verificado de forma independiente (`verified: false`).

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 82,90 % |
| Top-5 accuracy | 99,74 % |
| Macro F1 | 65,50 % |
| Balanced accuracy | 64,68 % |
| Macro precision | 66,98 % |
| Macro recall | 64,68 % |

Desglose por clase en el mismo split:

| Clase | Precision | Recall | F1 | Imagenes de test |
|---|---|---|---|---|
| clear | 91,12 % | 91,96 % | 91,54 % | 5346 |
| foggy | 0,00 % | 0,00 % | 0,00 % | 13 |
| overcast | 69,53 % | 68,68 % | 69,10 % | 1239 |
| partly cloudy | 66,26 % | 66,80 % | 66,53 % | 738 |
| rainy | 88,20 % | 67,89 % | 76,72 % | 738 |
| snowy | 85,52 % | 75,29 % | 80,08 % | 769 |
| unknown | 68,25 % | 82,11 % | 74,54 % | 1157 |

Comparativa publicada por el autor en el model zoo de BDD100K-Toolkit, todos evaluados sobre el mismo split `test`:

| Modelo | Top-1 | Macro F1 | Balanced acc | Macro precision |
|---|---|---|---|---|
| TinyViT-21M | 83,90 % | 68,65 % | 67,15 % | 74,81 % |
| EfficientViT-B3 | 83,51 % | 68,17 % | 66,34 % | 81,75 % |
| EfficientViT-B2 | 83,46 % | 66,07 % | 65,04 % | 67,54 % |
| EfficientFormerV2-L | 83,27 % | 65,93 % | 65,03 % | 67,12 % |
| RepViT-M1.5 | 83,19 % | 67,78 % | 65,71 % | 81,56 % |
| EfficientViT-L1 | 83,13 % | 65,70 % | 65,11 % | 66,46 % |
| RepViT-M2.3 | 83,02 % | 65,46 % | 64,33 % | 67,02 % |
| ConvNeXt-Atto | 83,00 % | 67,44 % | 65,25 % | 81,38 % |
| EfficientFormerV2-S2 (este modelo) | 82,90 % | 65,50 % | 64,68 % | 66,98 % |

No se han publicado resultados de benchmarks en la informacion disponible sobre el backbone preentrenado en ImageNet-1k para este checkpoint concreto, ni mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB para inferencia en precision completa a lotes pequenos. Los pesos en fp32 ocupan aproximadamente 48 MB (12,1 M de parametros x 4 bytes); el resto del consumo corresponde a activaciones y al lote de imagenes.
- GPU recomendadas: cualquier GPU moderna es suficiente. El modelo no necesita A100 ni H100; una RTX 3060, RTX 4060, RTX 4090 o una T4 son mas que suficientes, y en la practica el cuello de botella sera la carga de imagenes, no la GPU.
- Cabe con holgura en GPU de consumo, en iGPU y en CPU. Tambien es viable en dispositivos embarcados tipo NVIDIA Jetson (Nano, Orin) para inferencia en el vehiculo.
- Opciones de despliegue: PyTorch con `timm` es la via nativa y la que documenta el autor. Se puede exportar a ONNX, TorchScript y posteriormente a TensorRT u OpenVINO para reducir latencia. No se documenta integracion con vLLM, llama.cpp, Ollama ni TGI, que son herramientas orientadas a modelos de lenguaje y no aplican a este caso.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas en la informacion proporcionada.
- Nota practica: el checkpoint `best.pt` incluye los metadatos necesarios (`model_name`, `class_names`, `imgsz`, `mean`, `std`), por lo que el preprocesado correcto se obtiene del propio fichero y no de valores asumidos.

## Comparativa con modelos similares

Todos los modelos de la tabla pertenecen a la misma categoria (clasificacion de imagen eficiente) y fueron evaluados por el mismo autor sobre el mismo split `test` de BDD100K Weather Classification. La comparativa de parametros y contexto solo esta disponible para este modelo (12,1 M); para el resto, el autor no publica el recuento de parametros en la informacion proporcionada.

| Modelo | Top-1 | Macro F1 | Licencia | Parametros |
|---|---|---|---|---|
| TinyViT-21M | 83,90 % | 68,65 % | no disponible en la informacion | no disponible |
| EfficientViT-B3 | 83,51 % | 68,17 % | no disponible en la informacion | no disponible |
| EfficientViT-B2 | 83,46 % | 66,07 % | no disponible en la informacion | no disponible |
| EfficientFormerV2-S2 (este modelo) | 82,90 % | 65,50 % | Apache 2.0 | 12,1 M |
| ConvNeXt-Atto | 83,00 % | 67,44 % | no disponible en la informacion | no disponible |

Lectura de la comparativa: este checkpoint queda en la parte baja del zoo en Top-1 (82,90 %, ultimo de la tabla publicada) y tambien por debajo de la media en Macro F1. EfficientViT-B3 y TinyViT-21M ofrecen entre 0,5 y 1,0 puntos mas de Top-1 y entre 2,7 y 3,2 puntos mas de Macro F1, con precision macro muy superior (81,75 % y 74,81 % frente a 66,98 %), lo que indica mejor comportamiento en clases minoritarias. EfficientFormerV2-L, del mismo linaje, obtiene 83,27 % de Top-1 siendo un modelo mas grande. La ventaja de esta variante S2 es el tamano reducido, no la precision.

## Limitaciones y advertencias

- Clase `foggy` no soportada: el modelo clasifica correctamente 0 de las 13 imagenes de niebla del split de test. El autor recomienda explicitamente tratarla como no soportada. Cualquier uso en el que la niebla sea critica requiere otro enfoque.
- Desequilibrio de clases severo: `clear` concentra 5 346 de las 10 000 imagenes de test. El 82,90 % de Top-1 esta fuertemente influido por esa clase mayoritaria; el Macro F1 de 65,50 % es la metrica mas representativa del rendimiento real entre clases.
- Falsos positivos y negativos en clases minoritarias: precision macro del 66,98 % implica que aproximadamente uno de cada tres positivos predichos en las clases pequenas es incorrecto. En `rainy`, el recall del 67,89 % frente a una precision del 88,20 % indica sesgo hacia la prediccion conservadora.
- Riesgo de confusion entre clases visualmente proximas: `overcast` y `partly cloudy` obtienen F1 de 69,10 % y 66,53 % respectivamente, con precisiones en torno al 66-70 %, lo que sugiere solapamiento entre ambas categorias.
- Etiquetas de origen debil: la clase `unknown` procede del propio campo `attributes.weather` de BDD100K. Parte del error del modelo puede provenir de ruido o ambiguedad en las anotaciones originales, no del modelo.
- Tarea no oficial: el propio autor indica que la tarea de clasificacion meteorologica de 7 clases es no oficial y sigue una convencion de un dataset de Kaggle. No existe un benchmark estandarizado de referencia para comparar resultados con la literatura.
- Resultados no verificados: todas las metricas del `model-index` estan marcadas como `verified: false`. Proceden del propio autor y no han sido replicadas de forma independiente.
- Sin datos de entrenamiento publicados: no se documentan numero de imagenes de entrenamiento, epocas, hiperparametros ni estrategia de aumento de datos, lo que dificulta reproducir o auditar el ajuste.
- Dominio restringido: el modelo se entreno sobre escenas de conduccion de BDD100K (principalmente Estados Unidos). Su generalizacion a otras geografias, condiciones de iluminacion nocturna o camaras distintas no esta documentada.
- Sin modelado temporal: la clasificacion es por fotograma individual. Aplicado a video, la prediccion puede oscilar entre fotogramas consecutivos de la misma escena; conviene agregar con suavizado o votacion.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, con obligacion de incluir el aviso de licencia y el fichero de cambios si se modifica. Es responsabilidad del usuario verificar las condiciones de uso del dataset BDD100K subyacente, que tiene sus propios terminos y no se rige por Apache 2.0.
- Uso en produccion: para una decision critica (aviso de seguridad, frenado, enrutado de un sistema autonomo) no debe usarse como unica fuente. Es un clasificador auxiliar con precision macro del 66,98 %, insuficiente para decisiones de seguridad sin redundancia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/bdd100k-weather-efficientformerv2_s2
- Repositorio BDD100K-Toolkit: https://github.com/dronefreak/bdd100k-toolkit
- Dataset BDD100K Weather Classification: https://huggingface.co/datasets/dronefreak/BDD100K-Weather-Classification
- Modelo base en timm/HuggingFace: https://huggingface.co/timm/efficientformerv2_s2.snap_dist_in1k
- Paper de EfficientFormerV2: https://arxiv.org/abs/2212.08059
- Paper de BDD100K: https://arxiv.org/abs/1805.04687
- Web oficial de BDD100K: https://bdd-data.berkeley.edu/
