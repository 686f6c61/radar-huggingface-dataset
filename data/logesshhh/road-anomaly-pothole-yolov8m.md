# Logesshhh/road-anomaly-pothole-yolov8m

## Resumen

El modelo `Logesshhh/road-anomaly-pothole-yolov8m` es un detector de objetos basado en YOLOv8 Medium (`yolov8m`, 25,8 millones de parametros) entrenado especificamente para identificar anomalias en la calzada: baches, grietas estructurales, grietas severas y badenes (speed bumps), junto con tres clases de contexto vial (vehiculos pesados, vehiculos ligeros y peatones). Lo publica el usuario Logesshhh en HuggingFace bajo licencia Apache 2.0, con pesos en formato Ultralytics (`.pt`) y una exportacion ONNX para despliegue multiplataforma. El problema que aborda es la inspeccion automatizada de carreteras: sustituir o complementar la revision manual de firmes por un modelo que corre en tiempo real sobre video de dashcam o grabaciones aereas.

El modelo se entreno durante 120 epocas en una unica GPU RTX 3060 sobre un conjunto de aproximadamente 30.685 imagenes de carretera etiquetadas, con mezcla de vias indias, carreteras internacionales y autopistas. La model card reporta precision 0,736, recall 0,740, mAP@0,5 de 0,745 y una latencia de inferencia de unos 12,0 ms por fotograma. Son cifras de un modelo de tamano medio y proposito especifico, no de un detector de uso general: la relevancia esta en la vertical concreta (seguridad vial y mantenimiento de infraestructura) y en que se distribuye con licencia permisiva y exportacion ONNX, lo que facilita integrarlo en sistemas embarcados o en vehiculos.

El repositorio incluye ademas un segundo modelo auxiliar, `collabdoor_yolov8s_crddc.pt`, basado en YOLOv8 Small y entrenado sobre el dataset CRDDC2022, con cuatro clases de firme: grieta longitudinal, grieta transversal, grieta de cocodrilo y baches. El conjunto de pesos ocupa 0,2 GB. El modelo no tiene contexto de texto ni capacidad generativa: es exclusivamente vision por computador para deteccion en una sola pasada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8 Medium (`yolov8m`), detector de objetos anchor-free en una sola pasada (CNN, no transformer) |
| Parametros totales | 25,8 millones (modelo principal); modelo auxiliar YOLOv8 Small (`yolov8s`), parametros no disponibles |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no generativo; entrada de imagen, no secuencia de texto) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; se distribuyen pesos `.pt` y exportacion ONNX sin detallar precision (FP32/FP16/INT8) |
| Idiomas soportados | no aplica (deteccion de objetos); la model card declara `en` como idioma de documentacion |
| Licencia | Apache 2.0 |
| Formato de pesos | Ultralytics PyTorch (`.pt`) y ONNX (`.onnx`) |
| Clases detectadas (modelo principal) | 0: Heavy-Vehicle, 1: Light-Vehicle, 2: Pedestrian, 3: Crack, 4: Crack-Severe, 5: Pothole, 6: Speed-Bump |
| Clases detectadas (modelo auxiliar) | Longitudinal Crack, Transverse Crack, Alligator Crack, Potholes |
| Tamano del repositorio | 0,2 GB |
| Libreria | ultralytics |
| Pipeline | object-detection |

## Arquitectura y entrenamiento

YOLOv8 Medium es una red convolucional de deteccion en una sola pasada, con cabeza de prediccion desacoplada y asignacion de etiquetas anchor-free, disenada por Ultralytics para equilibrar precision y latencia. El modelo principal se entreno durante 120 epocas sobre una GPU RTX 3060 con un dataset de aproximadamente 30.685 imagenes equilibradas de anomalias viales, que combina carreteras indias, benchmarks internacionales y autopistas. El resultado son siete clases que mezclan el objeto de interes (bache, grieta, grieta severa, baden) con actores viales (vehiculos pesados, vehiculos ligeros, peatones), lo que sugiere un uso orientado a escenas de conduccion completas y no solo a inventario de firme.

La model card no detalla la composicion exacta del dataset, el equilibrio entre clases, ni si hubo aumento de datos, destilado, ajuste fino por etapas o tecnicas de regularizacion especificas. Tampoco se documenta el esquema de entrenamiento (resolucion de entrada, optimizador, funcion de perdida, hiperparametros) ni el proceso de exportacion ONNX (opset, batch dinamico, precision). El modelo auxiliar `collabdoor_yolov8s_crddc.pt` es una variante mas ligera entrenada sobre CRDDC2022 con cuatro clases de firme, pensada probablemente como complemento para clasificacion de grietas. No se menciona ningun uso de RLHF, DPO ni tecnicas de alineacion, que no aplican a un detector de objetos.

## Capacidades

- Deteccion de objetos en tiempo real sobre imagen suelta, video o flujo de dashcam, con 7 clases anotadas en el modelo principal.
- Identificacion de baches (`Pothole`), grietas leves (`Crack`) y grietas severas (`Crack-Severe`), lo que permite priorizar por gravedad.
- Deteccion de badenes (`Speed-Bump`), util para alertas de confort y seguridad en conduccion.
- Deteccion de contexto vial: vehiculos pesados, vehiculos ligeros y peatones en la misma pasada de inferencia.
- Clasificacion complementaria de tipologia de firme con el modelo auxiliar YOLOv8s: grieta longitudinal, transversal, de cocodrilo y bache.
- Inferencia en CPU y GPU mediante ONNX Runtime, lo que habilita despliegue en dispositivos embarcados y plataformas sin CUDA.
- Integracion directa con el ecosistema Ultralytics (`YOLO(...).predict(...)`, `conf`, `show`, tracking opcional de la libreria).
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades de agente, vision-lenguaje, audio ni generacion de texto: no es un modelo de lenguaje.

## Casos de uso

- Mantenimiento predictivo de firmes: procesar video de vehiculos de inspeccion y generar un inventario georreferenciado de baches y grietas severas por tramo, usando la clase `Crack-Severe` para priorizar reparaciones urgentes sobre el resto.
- Alertas en tiempo real para conductores: integrar el modelo en una dashcam o unidad de a bordo para avisar de baches y badenes con antelacion, aprovechando la latencia de 12,0 ms por fotograma reportada en RTX 3060.
- Flotas de reparto y transporte: analizar grabaciones de rutas completas en post-proceso y extraer mapas de deterioro por zona, combinando la deteccion de firme con la de peatones y vehiculos para evaluar tambien el riesgo de la via.
- Priorizacion de presupuesto publico de obra publica: clasificar tramos por densidad y gravedad de anomalias mediante el modelo principal y el auxiliar, y derivar indices objetivos de estado del pavimento para licitaciones.
- Despliegue embarcado de bajo coste: exportar el ONNX y ejecutarlo con ONNX Runtime en dispositivos sin GPU dedicada, usando el modelo auxiliar YOLOv8s cuando el presupuesto computacional sea mas ajustado.
- Auditoria de seguridad vial en imagenes aereas o satelitales: aplicar el modelo sobre ortomosaicos o capturas de dron para revisar rapidamente kilometros de via sin recorrerlos fisicamente.
- Sistemas ADAS de nivel bajo y prototipos de investigacion: usar las siete clases como modulo de percepcion de partida en proyectos academicos de conduccion autonoma, sustituyendo o comparando con detectores genericos preentrenados en COCO.
- Analitica de calidad de infraestructura para aseguradoras y concesionarias: generar informes periodicos del estado de una red viaria a partir de video ya existente, sin campanas de inspeccion adicionales.

## Benchmarks y rendimiento

| Metrica | Valor reportado (modelo principal, `pothole_yolov8m`) |
|---|---|
| Precision | 0,736 |
| Recall | 0,740 |
| mAP@0,5 | 0,745 |
| Velocidad de inferencia | ~12,0 ms por fotograma (RTX 3060) |
| Epocas de entrenamiento | 120 |
| Imagenes de entrenamiento | ~30.685 |

No se han publicado resultados de benchmarks en la informacion disponible para el modelo auxiliar `collabdoor_yolov8s_crddc.pt` ni comparativas frente a otros detectores (mAP@0,5:0,95, F1, curvas precision-recall, matrices de confusion o desglose por clase). Tampoco se aportan resultados en conjuntos publicos como RDD2022 o CRDDC2022 mas alla de indicar el dataset de entrenamiento del modelo auxiliar.

## Requisitos de hardware

- Pesos del modelo principal: 25,8 M de parametros, aproximadamente 103 MB en FP32 y unos 52 MB en FP16 (calculado a partir del numero de parametros, no confirmado en la model card).
- VRAM estimada para inferencia a 640x640 y lote 1: del orden de 1 a 2 GB (estimacion derivada del tamano de red, no un dato publicado).
- GPU de entrenamiento declarada: una RTX 3060 (12 GB), suficiente para 120 epocas sobre ~30.685 imagenes.
- Cabe con holgura en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y cualquier GPU con 4 GB o mas de VRAM. Tambien es viable en CPU con ONNX Runtime, a costa de mayor latencia.
- GPU de centro de datos (A100, H100, L40S) no son necesarias para inferencia; solo tendrian sentido para reentrenamiento a gran escala o procesamiento de video masivo en paralelo.
- Opciones de despliegue: Ultralytics (PyTorch, `.pt`), ONNX Runtime (`.onnx`, multiplataforma y embarcado), y cualquier runtime compatible con ONNX. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, que no aplican a un modelo de vision.
- Latencia reportada: ~12,0 ms por fotograma en RTX 3060, equivalente a unos 83 FPS en flujo unico (valor derivado de la latencia publicada). Throughput con batching y en otras GPUs: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto / entrada | Clases | Licencia |
|---|---|---|---|---|---|
| `Logesshhh/road-anomaly-pothole-yolov8m` (principal) | YOLOv8m | 25,8 M | Imagen/video (no aplica contexto) | 7 (firme + actores viales) | Apache 2.0 |
| `collabdoor_yolov8s_crddc.pt` (auxiliar del mismo repo) | YOLOv8s | no disponible | Imagen/video | 4 (tipos de firme) | Apache 2.0 (mismo repo) |
| Otros detectores de dano vial (RDD2022, CRDDC2022) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos publicados para este modelo frente a alternativas de la misma categoria (por ejemplo, YOLOv8n/s/l/x entrenados sobre RDD2022, RT-DETR o Faster R-CNN aplicados a dano vial). La comparativa queda limitada a los dos modelos incluidos en el propio repositorio, y para el auxiliar la model card no aporta parametros ni metricas.

## Limitaciones y advertencias

- Rendimiento modesto: mAP@0,5 de 0,745 con precision 0,736 y recall 0,740 implica falsos positivos y, sobre todo, falsos negativos relevantes. Un recall de 0,74 significa que aproximadamente uno de cada cuatro objetos etiquetados no se detecta, algo critico si se usa para alertas de seguridad en tiempo real.
- No se reporta mAP@0,5:0,95, F1 ni metricas por clase, por lo que se desconoce si el rendimiento es homogeneo entre `Pothole`, `Crack-Severe` y clases menos frecuentes como `Speed-Bump` o `Pedestrian`.
- Sesgo geografico y de dominio probable: el dataset mezcla carreteras indias con benchmarks internacionales. El comportamiento en otras regiones, condiciones meteorologicas, nocturnidad, lluvia o firmes de distinto material no esta documentado.
- Herramienta de vision exclusivamente: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier flujo de decision posterior debe implementarse fuera del modelo.
- Riesgo de alucinacion en sentido estricto no aplica, pero si de detecciones espurias: texturas de asfalto, sombras o marcas viales pueden clasificarse como grietas o baches. Se recomienda umbral de confianza ajustado (el ejemplo de la model card usa `conf=0.35`) y validacion humana en decisiones de obra.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion con atribucion y sin garantia. No hay restricciones de uso comercial declaradas.
- Sin validacion de la comunidad: el repositorio registra 0 descargas y 0 likes, y fue creado en septiembre de 2026. No hay evidencia externa de reproduccion de las metricas ni de uso en produccion.
- Falta de trazabilidad: no se documentan la procedencia exacta de las imagenes, el equilibrio de clases, el proceso de etiquetado, los hiperparametros de entrenamiento ni los detalles de la exportacion ONNX (opset, resolucion de entrada, soporte de batch dinamico). Esto dificulta auditar el modelo o reproducir el entrenamiento.
- El modelo auxiliar `collabdoor_yolov8s_crddc.pt` carece de ficha tecnica propia: no se indican parametros, metricas ni condiciones de entrenamiento, y el nombre sugiere una colaboracion externa cuyo alcance no se aclara.
- Los pesos ocupan 0,2 GB en total; conviene verificar que los ficheros descargados corresponden al modelo esperado antes de desplegarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Logesshhh/road-anomaly-pothole-yolov8m
- Repositorio del autor en HuggingFace: https://huggingface.co/Logesshhh
- Paper, blog, repositorio de codigo o demo: no disponible en la informacion proporcionada.
- La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo: los enlaces obtenidos corresponden a paginas bancarias de TARGOBANK (https://www.targobank.de/) sin relacion con deteccion de anomalias viales.
