# daoooot/202413050-detr-resnet-50-furniture-full

## Resumen

daoooot/202413050-detr-resnet-50-furniture-full es un detector de objetos basado en DETR (DEtection TRansformer) con backbone ResNet-50, afinado sobre el dataset Francesco/furniture-ngpea para la deteccion de muebles (categorias como Chair, Sofa, Table y una clase generica "furniture"). Lo publica el usuario daoooot y esta firmado como trabajo academico por el estudiante 김한별 (identificador 202413050), tomando como punto de partida el modelo facebook/detr-resnet-50. El repositorio ocupa 0,2 GB y contiene pesos en safetensors compatibles con la libreria transformers.

El modelo resuelve una tarea concreta de deteccion de objetos en imagenes de interiores, con una sola clase de dominio acotada a mobiliario, y resulta relevante como pieza lista para usar en prototipos de vision por computador que necesiten localizar sofas y mesas sin reentrenar desde cero. Su tamano es reducido: 41.608.649 parametros segun los pesos de safetensors (la model card declara 41.502.409, una diferencia de aproximadamente 106.000 parametros probablemente atribuible a los componentes no entrenables contabilizados de forma distinta).

La licencia es Apache-2.0, lo que permite uso comercial, y el autor lo describe explicitamente como un detector educativo cuyo rendimiento puede degradarse en habitaciones reales desordenadas. No hay informacion publicada sobre idiomas, cuantizaciones ni metricas comparables con otros modelos sobre el mismo conjunto de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DETR (transformer encoder-decoder con backbone convolucional ResNet-50) |
| Parametros totales | 41.608.649 (pesos safetensors); 41.502.409 segun la model card |
| Longitud de contexto | no aplica (modelo de deteccion de objetos) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente fp32) |
| Idiomas soportados | no aplica (modelo de vision, sin procesamiento de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Tarea (pipeline) | object-detection |
| Dataset de entrenamiento | Francesco/furniture-ngpea (revision 5c0e1d3d0f5a95bb916995c8ad34778cd2ca6c7c) |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 10 de octubre de 2026 (segun HuggingFace) |

## Arquitectura y entrenamiento

Se trata de un ajuste fino completo de DETR con backbone ResNet-50, la arquitectura presentada por Facebook AI Research en el paper "End-to-End Object Detection with Transformers". DETR formula la deteccion como un problema de prediccion de conjuntos: un encoder transformer procesa los mapas de caracteristicas de la CNN, un decoder transformer con un conjunto fijo de consultas (queries) emite las cajas y las clases, y el emparejamiento con las anotaciones se resuelve mediante asignacion bipartita húngara. Esto elimina la necesidad de anchors y de supresion de no maximos (NMS) en la inferencia.

El entrenamiento se realizo durante 100 epocas con imagenes de 480 px, batch efectivo de 8, semilla 42 y precision mixta sobre una unica GPU Tesla T4 (torch 2.11.0+cu130), con un consumo maximo de 2,24 GB de VRAM. La sesion completa duro 4.950 segundos (1 h 22 min aproximadamente) a 9,17 muestras por segundo, con una perdida de entrenamiento de 0,185 y una perdida de validacion de 0,173 en el mejor checkpoint (checkpoint-3249, epoca 100). El autor indica que los conjuntos de entrenamiento, validacion y test se mantuvieron separados y que la seleccion de la mejor epoca se hizo por perdida de validacion. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, ya que no son aplicables a este tipo de modelo.

## Capacidades

- Deteccion de objetos en imagenes de interiores, con clases orientadas a mobiliario (Chair, Sofa, Table y "furniture").
- Prediccion end-to-end de cajas delimitadoras y etiquetas de clase sin NMS ni post-procesado de anchors.
- Rendimiento elevado en objetos grandes segun la metrica reportada (AP_large = 0,928), coherente con un dataset de muebles que ocupan buena parte de la imagen.
- Entrada de imagenes redimensionadas a 480 px durante el entrenamiento.
- Integracion directa con el pipeline `object-detection` de transformers y con la API `AutoModelForObjectDetection`.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni generacion de texto.
- No dispone de soporte multilingue ni de capacidades de audio, vision-lenguaje o modo de razonamiento.
- Capacidad especial: ninguna documentada; el autor lo define como detector educativo.

## Casos de uso

- Catalogacion automatica de mobiliario en fotografias de producto: el modelo localiza sofas y mesas en imagenes de catalogo y devuelve cajas y etiquetas que pueden alimentar un pipeline de generacion de fichas o de recorte automatico de imagenes.
- Analisis de fotografias inmobiliarias: deteccion de los muebles presentes en cada estancia para etiquetar anuncios, estimar el amueblado de una vivienda o filtrar imagenes por tipo de mobiliario.
- Robotica domestica y navegacion asistida: un robot de interior puede usar las cajas detectadas de mesas y sofas como obstaculos o puntos de referencia, dado el bajo coste computacional del modelo (41,6 M de parametros).
- Realidad aumentada para redecoracion: superponer sustituciones virtuales sobre los muebles detectados en tiempo real desde la camara de un dispositivo movil, aprovechando que el modelo cabe holgadamente en GPU de consumo.
- Gestion de inventario y almacenes de muebles: conteo y localizacion de unidades en fotografias de stock, con especial fiabilidad en sofas (AP 0,951) y mesas (AP 0,906) segun las metricas publicadas.
- Preetiquetado para anotacion de datasets: usar el modelo para generar cajas candidatas y reducir el esfuerzo manual de etiquetado en nuevos conjuntos de imagenes de interiores, revisando despues las predicciones.
- Vision por computador embebida: despliegue en dispositivos con recursos limitados (Jetson, mini-PC con GPU integrada) para tareas de monitorizacion o domotica, dado su tamano reducido.
- Investigacion y docencia: punto de partida para comparar estrategias de ajuste fino de DETR, puesto que la model card publica hiperparametros, semilla, tiempos y curva de perdida.

## Benchmarks y rendimiento

Metricas de test declaradas por el autor en la model card (conjunto de test separado del de entrenamiento):

| Metrica | Valor |
|---|---|
| AP | 0,9282 |
| AP50 | 1,0 |
| AP75 | 1,0 |
| AP_large | 0,9282 |
| AP_small | -1,0 (no evaluado / sin objetos de ese tamano) |
| AP_medium | -1,0 (no evaluado / sin objetos de ese tamano) |
| AR@1 | 0,9471 |
| AR@10 | 0,9471 |
| AR@100 | 0,9475 |

AP por clase:

| Clase | AP |
|---|---|
| Sofa | 0,9507 |
| Table | 0,9057 |
| Chair | null (no publicado) |
| furniture | null (no publicado) |

Datos de entrenamiento y ejecucion:

| Parametro | Valor |
|---|---|
| Epocas | 100 |
| Tamano de imagen | 480 px |
| Batch efectivo | 8 |
| GPU | Tesla T4 |
| VRAM maxima | 2,2436 GB |
| Tiempo total de entrenamiento | 4.949,96 s |
| Muestras por segundo | 9,172 |
| Paso por segundo | 1,152 |
| Perdida de entrenamiento | 0,1851 |
| Mejor perdida de validacion | 0,1726 |
| Checkpoint mejor | checkpoint-3249 |
| Semilla | 42 |

No se han publicado resultados de benchmarks comparables con otros modelos sobre el mismo conjunto de datos. Las cifras anteriores corresponden a un dataset propio de mobiliario y no son comparables con resultados de COCO.

## Requisitos de hardware

- Peso de los parametros: aproximadamente 166 MB en fp32 (41,6 M de parametros) y unos 83 MB en fp16.
- VRAM para inferencia: estimacion de menos de 1 GB con batch 1 a 480 px en fp32, y en torno a 2-3 GB con lotes de 8 imagenes, coherente con los 2,24 GB de pico medidos durante el entrenamiento en una Tesla T4.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Funciona sin problema en RTX 3060, RTX 4060, RTX 4090, A100, H100, L4, T4 y Jetson con suficiente memoria.
- Cabe sobradamente en GPU de consumo: si, incluidas gamas de entrada recientes y GPUs integradas con soporte CUDA o ROCm.
- Opciones de despliegue: pipeline de transformers, PyTorch nativo, exportacion a ONNX u OpenVINO mediante Optimum, TensorRT y TorchScript. vLLM, llama.cpp, Ollama y TGI no son aplicables a un modelo de deteccion de objetos de este tipo.
- Latencia y throughput de inferencia: no disponibles. El unico dato de velocidad publicado es el de entrenamiento (9,172 muestras/s con batch efectivo 8 en Tesla T4), que no sirve como estimacion fiable de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Dataset de evaluacion | Licencia | Formato de pesos |
|---|---|---|---|---|---|
| daoooot/202413050-detr-resnet-50-furniture-full | 41,6 M | DETR + ResNet-50 | Francesco/furniture-ngpea | Apache-2.0 | safetensors |
| facebook/detr-resnet-50 (modelo base) | 41,5 M (dato de la model card oficial; no verificado en esta busqueda) | DETR + ResNet-50 | COCO | Apache-2.0 | safetensors / PyTorch |
| RT-DETR (familia de detectores transformer en tiempo real) | no disponible | Transformer de deteccion en tiempo real | COCO | no disponible | no disponible |
| YOLOv8 (Ultralytics) | no disponible | CNN de una etapa | COCO | AGPL-3.0 (requiere licencia comercial para uso propietario; confirmar en la documentacion oficial) | PyTorch / ONNX |

No se dispone de cifras de rendimiento de modelos alternativos sobre el dataset furniture-ngpea, por lo que la comparacion cuantitativa no es posible. La ventaja principal de este ajuste frente al modelo base es su especializacion en mobiliario; su desventaja es la ausencia de validacion fuera del dominio y de comparaciones publicadas.

## Limitaciones y advertencias

- El propio autor advierte de que es un detector educativo y que su rendimiento puede diferir en habitaciones reales desordenadas (oclusiones, iluminacion variable, fondos ruidosos).
- Las metricas publicadas (AP50 = 1,0, AP75 = 1,0) son sospechosamente altas y provienen de un dataset propio de dificultad limitada; no deben extrapolarse a produccion sin una evaluacion independiente.
- AP_small y AP_medium aparecen con valor -1,0, lo que indica que no hay objetos de esos tamanos en la evaluacion; no hay evidencia de rendimiento con objetos pequenos o a distancia.
- Las clases Chair y furniture figuran como null en el desglose por clase, por lo que se desconoce su AP individual; solo Sofa y Table tienen metrica publicada.
- Dominio muy restringido: unicamente mobiliario, con un numero reducido de clases; no detecta otras categorias de objetos.
- Riesgo de falsos positivos y confusion entre clases similares (por ejemplo, asientos de distinto tipo) en imagenes fuera de la distribucion del dataset.
- Resolucion de entrada de 480 px durante el entrenamiento: objetos muy pequenos o imagenes de alta resolucion reducidas pueden perder detalle.
- Licencia del modelo Apache-2.0, apta para uso comercial; la model card advierte de que la licencia del dataset debe consultarse en su pagina original de Roboflow, cuyo dataset card indica "cc", sin especificar la variante.
- Sin mantenimiento ni comunidad: cero descargas y cero likes en el momento de la consulta, sin issues ni documentacion adicional.
- No hay informacion sobre sesgos, idiomas ni cuantizaciones; no se han publicado datos de calibracion, robustez ni evaluacion de equidad.
- Los enlaces devueltos por la busqueda web no guardan ninguna relacion con el modelo y no se han utilizado como fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/daoooot/202413050-detr-resnet-50-furniture-full
- Modelo base: https://huggingface.co/facebook/detr-resnet-50
- Dataset de entrenamiento: https://huggingface.co/datasets/Francesco/furniture-ngpea
- Paper de DETR (End-to-End Object Detection with Transformers): https://arxiv.org/abs/2005.12872
- Repositorio oficial de DETR: https://github.com/facebookresearch/detr
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo; los resultados devueltos no guardan relacion con la ficha.
