# dronefreak/bdd100k-weather-efficientvit_b2

## Resumen

EfficientViT-B2 ajustado para clasificación meteorológica sobre BDD100K es un modelo de visión por computador desarrollado por el usuario dronefreak (dronefreak/bdd100k-weather-efficientvit_b2) que resuelve una tarea auxiliar concreta: asignar a cada fotograma de conducción una de siete etiquetas meteorológicas (clear, partly cloudy, overcast, rainy, snowy, foggy, unknown). Parte del checkpoint preentrenado timm/efficientvit_b2.r224_in1k y se ha afinado sobre el dataset dronefreak/BDD100K-Weather-Classification, derivado del campo attributes.weather de BDD100K. Tiene 21,8 millones de parámetros según la model card y una entrada de 224x224 píxeles.

Su relevancia es práctica más que arquitectónica: forma parte de BDD100K-Toolkit, un conjunto de herramientas sin dependencias pesadas para preparar BDD100K, entrenar modelos y evaluarlos con las mismas métricas sobre los mismos splits. Esto permite comparar de forma reproducible clasificadores ligeros (EfficientViT, TinyViT, RepViT, EfficientFormerV2, ConvNeXt-Atto) en una tarea de etiquetado automático útil para curar y enrutar datos de conducción.

El modelo declara 83,46 % de top-1 y 99,84 % de top-5 en el split de test de 10 000 imágenes, pero solo 66,07 % de macro F1 y 65,04 % de exactitud balanceada, lo que refleja un fuerte desequilibrio de clases: la clase clear concentra 5 346 imágenes y foggy apenas 13, que el modelo no acierta ninguna. Se publica bajo licencia Apache-2.0 y el repositorio ocupa 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientViT-B2 (vision transformer eficiente de la familia EfficientViT, base timm/efficientvit_b2.r224_in1k) |
| Parametros totales | 21,8 M (segun la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificacion de imagenes; entrada de 224x224 pixeles) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica el checkpoint en punto flotante (PyTorch) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch (best.pt, diccionario con model_name, class_names, state_dict, imgsz, mean y std); no hay safetensors ni GGUF |
| Tarea | image-classification (7 clases meteorologicas) |
| Numero de clases | 7: clear, partly cloudy, overcast, rainy, snowy, foggy, unknown |
| Resolucion de entrada | 224x224 (imgsz almacenado en el checkpoint) |
| Tamano del repositorio | 0,1 GB |
| Libreria / framework | timm + PyTorch |
| Dataset de ajuste | dronefreak/BDD100K-Weather-Classification (derivado de BDD100K) |
| Fecha de publicacion | 5 de octubre de 2026 (segun HuggingFace) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de EfficientViT-B2, un backbone de vision transformer eficiente preentrenado en ImageNet-1k a 224x224 (timm/efficientvit_b2.r224_in1k). La model card etiqueta el trabajo con el arXiv 2205.14756, correspondiente a la familia EfficientViT, que combina bloques convolucionales tipo MBConv con atencion lineal multi-escala para reducir el coste de memoria y computo respecto a la atencion cuadratica estandar. Los detalles exactos de configuracion (dimensiones de los bloques, cabezas de atencion, recetas de aumento de datos) no se detallan en la informacion disponible.

El ajuste se realiza sobre la tarea "weather classification" de BDD100K-Toolkit, una tarea no oficial construida a partir del campo attributes.weather de BDD100K y alineada con el dataset de Kaggle del mismo nombre. Se trata de un ajuste supervisado de clasificacion con 7 clases; no se documenta en la informacion proporcionada si hubo destilacion, RLHF, DPO ni ninguna otra tecnica de alineacion, algo que en cualquier caso no aplica a un clasificador de imagenes. El checkpoint resultante guarda no solo los pesos, sino tambien el nombre del modelo base, la lista de clases, el tamano de imagen y los valores de normalizacion, lo que facilita la reproducibilidad de la inferencia.

## Capacidades

- Clasificacion de imagenes de escenas de conduccion en 7 categorias meteorologicas, con probabilidades por clase (softmax) y top-5.
- Etiquetado automatico por fotograma de clips de video de dashcam, procesando las imagenes de forma independiente.
- Extraccion de caracteristicas: al ser un modelo timm, permite usar el backbone sin la cabeza de clasificacion para tareas posteriores (deteccion, segmentacion, clustering de escenas).
- Ejecucion por lotes en GPU o CPU con muy poca memoria, gracias a sus 21,8 M de parametros.
- Integracion con el ecosistema timm: creacion con timm.create_model y carga de state_dict estandar.
- No soporta tool calling ni function calling: es un clasificador visual, no un modelo generativo.
- No soporta agentes, razonamiento multi-paso ni generacion de texto.
- No tiene capacidades multilingues: no consume ni produce lenguaje natural.
- No incorpora modo "thinking", vision-language, audio ni generacion de imagenes.

## Casos de uso

- Etiquetado automatico de datasets de conduccion: dado un conjunto de fotogramas BDD100K o de dashcam propia, el modelo asigna la clase meteorologica a cada imagen, sustituyendo el etiquetado manual usado para los atributos de BDD100K.
- Curación y balanceo de datasets de percepcion: permite medir la distribucion de condiciones meteorologicas de un corpus y seleccionar muestras de clases minoritarias (rainy, snowy, foggy) antes de entrenar un detector o un segmentador.
- Enrutado condicional en pipelines de conduccion autonoma: si la imagen se clasifica como rainy o snowy, el sistema puede activar modelos de percepcion entrenados especificamente para esas condiciones o degradar la velocidad maxima del sistema.
- Monitorizacion de flotas de camaras: deteccion de fotogramas degradados por lluvia, nieve o calima en un flujo continuo, para descartar imagenes no validas o disparar el limpiado del objetivo.
- Analisis retrospectivo de incidentes: etiquetado de clips de dashcam para buscar rapidamente secuencias grabadas bajo lluvia o nieve, util en investigacion de siniestros o en auditoria de sistemas ADAS.
- Preprocesado en el borde (edge): con 21,8 M de parametros y entrada de 224x224, el modelo puede ejecutarse en un modulo a bordo con GPU integrada o incluso en CPU, clasificando fotogramas antes de enviarlos a la nube.
- Investigacion en robustez de percepcion: uso como linea base reproducible para medir la caida de rendimiento de otros modelos bajo condiciones meteorologicas adversas sobre los mismos splits.
- Soporte a la anotacion en herramientas internas: integracion del checkpoint en BDD100K-Toolkit para generar preetiquetas que un anotador humano solo tiene que revisar.

## Benchmarks y rendimiento

Resultados declarados por el autor en el split de test (10 000 imagenes) del dataset BDD100K Weather Classification. Ninguna de las metricas esta marcada como verificada por un tercero.

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 83,46 % |
| Top-5 accuracy | 99,84 % |
| Macro F1 | 66,07 % |
| Exactitud balanceada | 65,04 % |
| Macro precision | 67,54 % |
| Macro recall | 65,04 % |

Desglose por clase declarado en la model card:

| Clase | Precision | Recall | F1 | Imagenes de test |
|---|---|---|---|---|
| clear | 90,98 % | 92,82 % | 91,89 % | 5346 |
| foggy | 0,00 % | 0,00 % | 0,00 % | 13 |
| overcast | 68,12 % | 69,49 % | 68,80 % | 1239 |
| partly cloudy | 68,74 % | 64,36 % | 66,48 % | 738 |
| rainy | 88,47 % | 69,65 % | 77,94 % | 738 |
| snowy | 84,85 % | 78,67 % | 81,65 % | 769 |
| unknown | 71,63 % | 80,29 % | 75,71 % | 1157 |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 21,8 M de parametros, el checkpoint en punto flotante ronda las decenas de megabytes; en FP32 la inferencia cabe holgadamente en 1-2 GB de VRAM, y menos aun si se exporta a FP16 o se cuantiza a INT8 con ONNX Runtime o TensorRT (estimacion a partir del numero de parametros; no hay medidas publicadas).
- GPU recomendadas: cualquier GPU moderna sirve. Para entrenamiento o ajuste fino, una RTX 3060/4060 o superior; para lotes grandes en produccion, A100 o H100 no aportan ventaja significativa dado el tamano del modelo.
- Compatibilidad con GPU de consumo: si, en practicamente todas las GPU de consumo de los ultimos diez anos, y tambien en CPU (inferencia por imagen en decenas de milisegundos de orden de magnitud, sin cifras publicadas).
- Opciones de despliegue: PyTorch + timm de forma nativa (es el camino documentado en la model card), exportacion a ONNX y ejecucion con ONNX Runtime, TensorRT o OpenVINO; TorchServe, Triton Inference Server o BentoML para servicio HTTP. No aplican vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no se han publicado medidas de latencia ni de throughput en la informacion disponible.

## Comparativa con modelos similares

La propia model card publica un "Model Zoo" con todos los modelos evaluados por BDD100K-Toolkit sobre el mismo split de test, por lo que la comparacion es directa. Se muestran las entradas completas disponibles:

| Modelo | Top-1 | Macro F1 | Exactitud balanceada | Macro precision |
|---|---|---|---|---|
| TinyViT-21M | 83,90 % | 68,65 % | 67,15 % | 74,81 % |
| EfficientViT-B3 | 83,51 % | 68,17 % | 66,34 % | 81,75 % |
| EfficientViT-B2 (este modelo) | 83,46 % | 66,07 % | 65,04 % | 67,54 % |
| EfficientFormerV2-L | 83,27 % | 65,93 % | 65,03 % | 67,12 % |
| RepViT-M1.5 | 83,19 % | 67,78 % | 65,71 % | 81,56 % |
| EfficientViT-L1 | 83,13 % | 65,70 % | 65,11 % | 66,46 % |
| RepViT-M2.3 | 83,02 % | 65,46 % | 64,33 % | 67,02 % |
| ConvNeXt-Atto | 83,00 % | 67,44 % | 65,25 % | 81,38 % |
| EfficientFormerV2-S2 | 82,90 % | 65,50 % | 64,68 % | 66,98 % |
| EfficientViT-B0 | 82,79 % | 65,1 ... (tabla truncada en la model card) | no disponible | no disponible |

Lectura de la comparativa: en top-1, EfficientViT-B2 queda practicamente empatado con EfficientViT-B3 y por detras de TinyViT-21M, pero en macro F1 y exactitud balanceada es superado por TinyViT-21M, EfficientViT-B3 y RepViT-M1.5. Los modelos con macro precision alta (EfficientViT-B3, RepViT-M1.5, ConvNeXt-Atto, en torno al 81 %) probablemente reparten mejor las predicciones entre clases minoritarias, aunque la model card no desglosa sus resultados por clase. Todos ellos comparten licencia y formato de publicacion del toolkit, por lo que la eleccion entre ellos depende de la metrica prioritaria: top-1 global o F1 macro.

## Limitaciones y advertencias

- Clase foggy no soportada: el modelo no acierta ninguna de las 13 imagenes de test de niebla (precision, recall y F1 de 0,00 %). La propia model card indica que debe tratarse como clase no soportada, no como una prediccion poco fiable.
- Riesgo alto de alucinacion de clase en regimenes poco representados: con solo 13 ejemplos de foggy frente a 5 346 de clear, el modelo asigna probablemente overcast o unknown a escenas de niebla.
- Fuerte desequilibrio de clases: la diferencia entre el 83,46 % de top-1 y el 66,07 % de macro F1 y el 65,04 % de exactitud balanceada indica que el rendimiento en las clases mayoritarias enmascara un desempeño mediocre en varias minoritarias.
- Metricas no verificadas: el model-index marca todas las metricas con verified: false, es decir, son cifras declaradas por el autor y no replicadas de forma independiente.
- Tarea no oficial: la clasificacion meteorologica se deriva del campo attributes.weather de BDD100K, que a su vez procede de anotacion humana; existe riesgo de ruido de etiquetas y de ambiguedad entre clear, partly cloudy y overcast.
- Cambio de dominio: el modelo se ha entrenado con imagenes de BDD100K (camaras y geografias de ese dataset). Su aplicacion a otra flota, otro pais o condiciones de iluminacion distintas puede degradar el rendimiento de forma no medida.
- Sin datos de idioma ni de texto: no aplica ninguna evaluacion multilingue; cualquier requisito de idioma debe resolverse en otro componente del sistema.
- Restricciones de licencia: los pesos se publican bajo Apache-2.0, lo que permite uso comercial, pero el dataset BDD100K tiene sus propias condiciones de uso impuestas por sus autores y conviene revisarlas si se va a redistribuir el modelo o sus derivados. El uso de un clasificador meteorologico como parte de un sistema de conduccion autonoma no exime de cumplir la normativa aplicable de seguridad.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la model card aparece truncada en la seccion de Model Zoo, por lo que no hay comunidad que haya validado el checkpoint.
- Sin cuantizaciones publicadas: no hay versiones GGUF, ONNX, INT8 ni safetensors listas para usar; cualquier despliegue optimizado exige convertir el best.pt por cuenta propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/bdd100k-weather-efficientvit_b2
- Repositorio BDD100K-Toolkit: https://github.com/dronefreak/bdd100k-toolkit
- Dataset de ajuste: https://huggingface.co/datasets/dronefreak/BDD100K-Weather-Classification
- Modelo base: https://huggingface.co/timm/efficientvit_b2.r224_in1k
- Paper de la familia EfficientViT: https://arxiv.org/abs/2205.14756
- Paper del dataset BDD100K: https://arxiv.org/abs/1805.04687
- Nota sobre la busqueda web: las consultas realizadas no devolvieron resultados relevantes sobre este modelo; los unicos enlaces utiles son los citados en la model card y en las etiquetas del repositorio.
