# dronefreak/uavdt-yolov10n

## Resumen

El modelo `dronefreak/uavdt-yolov10n` es un detector de objetos YOLOv10n afinado sobre el conjunto de datos UAVDT (Unmanned Aerial Vehicle Benchmark: Object Detection and Tracking), un corpus de imágenes aéreas captadas desde dron para la detección de vehículos en entornos de tráfico. Lo publica el usuario `dronefreak` como parte de **DetectionBench**, un framework cuyo objetivo es reproducir de forma estandarizada el entrenamiento y la evaluación de detectores modernos sobre múltiples conjuntos de datos reales, aplicando recetas idénticas para que las comparaciones entre arquitecturas sean justas.

Se trata de un modelo de visión por computador de tipo convolucional, no de un modelo de lenguaje: su tarea es la detección de cajas delimitadoras sobre tres clases (`car`, `truck`, `bus`) con una resolución de entrada de 640 píxeles. Con solo 2,8 millones de parámetros y 8,7 GFLOPs por imagen, está pensado para inferencia en el borde (edge), incluido hardware embarcado en el propio dron, donde el consumo energético y la latencia son restricciones críticas.

Su relevancia es doble. Por un lado, sirve como punto de referencia (*baseline*) reproducible dentro del zoo de modelos de DetectionBench sobre UAVDT, donde se compara con RF-DETR Nano, YOLOv9s/t, YOLOv11n y YOLOv8n/s bajo el mismo protocolo de evaluación. Por otro, la licencia AGPL-3.0 de Ultralytics condiciona fuertemente su uso comercial, un aspecto que cualquier equipo de producción debe evaluar antes de integrarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv10n (red neuronal convolucional de deteccion en una etapa, con cabezas one-to-many y one-to-one y prediccion sin NMS) |
| Parametros totales | 2,8 M (segun la model card) |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica (modelo de vision); resolucion de entrada de 640 px, FLOPs declarados de 8,7 GFLOPs por imagen a 640 px |
| Tipos de cuantizacion | no disponible en la model card; el framework Ultralytics permite exportacion a otros formatos, pero el autor no declara cuantizaciones especificas |
| Idiomas soportados | no aplica (modelo de deteccion de objetos en imagenes; no procesa texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`.pt`, archivo `best.pt`); no se declaran pesos en safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de `Ultralytics/YOLOv10`, en su variante nano. YOLOv10 es una familia de detectores de una sola etapa que introduce dos mejoras relevantes respecto a sus predecesores: por un lado, una cabeza de prediccion dual (una rama *one-to-many* durante el entrenamiento y una rama *one-to-one* en inferencia) que elimina la necesidad de aplicar supresion de no maximos (NMS) como paso posterior, reduciendo la latencia; por otro, un diseno de bloques y escalado de canales orientado a recortar el coste computacional manteniendo la precision. Los FLOPs declarados de 8,7 GFLOPs a 640 px y los 2,8 M de parametros confirman que se trata de la variante mas ligera de la familia.

El entrenamiento consiste en un ajuste fino (*fine-tuning*) del checkpoint YOLOv10n sobre el conjunto UAVDT, con tres clases de vehiculos: coche, camion y autobus. La model card no detalla el numero de tokens o imagenes, la composicion exacta del split de entrenamiento, el numero de epocas, el optimizador ni si se aplicaron tecnicas de aumento de datos especificas; tampoco indica fases de alineacion por refuerzo (RLHF/DPO), logicamente fuera de lugar en un modelo discriminativo de vision. La evaluacion se realiza sobre el split de **test** de UAVDT con el pipeline estandar de DetectionBench (`detectionbench-evaluate`), lo que constituye la innovacion metodologica principal del proyecto: una receta de evaluacion comun que permite comparar arquitecturas heterogeneas con criterios identicos.

## Capacidades

- Deteccion de objetos en imagenes aereas o captadas desde dron, con salida de cajas delimitadoras, etiqueta de clase y puntuacion de confianza.
- Deteccion de vehiculos en tres categorias: `car`, `truck` y `bus`.
- Deteccion de objetos pequenos, escenario tipico de la imagery aerea donde los vehiculos ocupan pocos pixeles.
- Inferencia sin NMS, lo que simplifica el post-procesado y reduce la latencia de la cadena de deteccion.
- Funcionamiento en modo *streaming* sobre video, ya que el framework Ultralytics acepta secuencias de fotogramas y devuelve detecciones por fotograma.
- Soporte de *tool calling* / *function calling*: no aplica (modelo de vision, sin interfaz de texto ni de agentes).
- Soporte de agentes y razonamiento multipaso: no aplica.
- Capacidades multilingues: no aplica.
- Capacidades especiales: no se declaran modos de razonamiento, vision-language, audio ni ninguna otra modalidad; el modelo es exclusivamente de deteccion visual.

## Casos de uso

- **Vigilancia de trafico con drones:** el modelo puede procesar el flujo de video de un dron en vuelo estacionario sobre una via y contar vehiculos por carril, aprovechando su tamano reducido (2,8 M de parametros) para ejecutarse a bordo sin transmitir el video a tierra.
- **Aforo y analisis de densidad de trafico:** integrado en un pipeline de conteo por regiones de interes, permite estimar el numero de coches que cruzan una seccion viaria en una ventana temporal, util para estudios de movilidad urbana con datos de UAVDT u otras campanas aereas.
- **Inspeccion de infraestructuras viarias:** combinado con vuelos programados sobre autopistas o aparcamientos, sirve para detectar la ocupacion de plazas, vehiculos mal estacionados o acumulaciones anomalas.
- **Seguridad perimetral en recintos industriales:** desplegado sobre un dron de patrulla, detecta la presencia de vehiculos no autorizados en zonas restringidas, con la ventaja de no requerir GPU dedicada en el punto de captura.
- **Post-procesado de archivos de video aereo:** en tareas offline de anotacion asistida, el modelo genera preanotaciones de cajas sobre el material grabado, que despues se revisan manualmente, reduciendo el coste de construir nuevos conjuntos de datos etiquetados.
- **Sistema embarcado de bajo consumo:** gracias a sus 8,7 GFLOPs por imagen, es candidato para ejecutarse en plataformas tipo NVIDIA Jetson o incluso en CPU, en escenarios donde no hay conectividad ni presupuesto energetico para modelos mayores.
- **Baseline para *fine-tuning* en dominios propios:** al formar parte de DetectionBench, sirve como punto de partida reproducible para comparar el efecto de nuevas recetas de entrenamiento, aumentos de datos o cambios de arquitectura sobre un mismo conjunto de datos aereo.
- **Prototipado rapido de aplicaciones de vision aerea:** su integracion en dos lineas de codigo mediante la API de Ultralytics lo hace adecuado para validar hipotesis de producto antes de invertir en modelos mas grandes.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de **test** de UAVDT. Todos los valores estan marcados como `verified: false` en el model-index, es decir, no han sido verificados de forma independiente.

| Metrica | Valor |
|---|---|
| mAP@50 | 27,17 % |
| mAP@50-95 | 15,16 % |
| Precision | 33,30 % |
| Recall | 31,21 % |
| F1 | 32,22 % |
| Parametros | 2,8 M |
| FLOPs | 8,7 GFLOPs a 640 px |

Rendimiento por clase (mAP@50 / mAP@50-95):

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| car | 69,89 % | 37,69 % |
| truck | 3,86 % | 2,40 % |
| bus | 7,76 % | 5,38 % |

La comparativa del zoo de modelos de UAVDT publicado por el autor es la siguiente:

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| RF-DETR Nano | 32,78 % | 20,31 % | 73,60 % | 66,98 % |
| YOLOv9s | 31,82 % | 18,71 % | 39,83 % | 38,12 % |
| YOLOv9t | 29,42 % | 17,03 % | 35,75 % | 36,47 % |
| YOLOv26n | 28,88 % | 16,79 % | 33,14 % | 35,66 % |
| YOLOv11n | 28,56 % | 16,30 % | 38,04 % | 32,26 % |
| YOLOv8n | 27,80 % | 15,34 % | 35,42 % | 33,61 % |
| YOLOv10n (este modelo) | 27,17 % | 15,16 % | 33,30 % | 31,21 % |
| YOLOv8s | 27,12 % | 15,33 % | 34,65 % | 31,87 % |

## Requisitos de hardware

- **VRAM estimada:** a partir de los 2,8 M de parametros declarados, los pesos ocupan aproximadamente 11 MB en FP32 y unos 6 MB en FP16. La memoria total necesaria para inferencia a 640 px es del orden de unos cientos de megabytes, muy por debajo de cualquier GPU moderna. Estas cifras son una estimacion aritmetica a partir del numero de parametros; la model card no publica mediciones de VRAM.
- **GPU recomendadas:** cualquier GPU con soporte CUDA sirve, incluidas NVIDIA T4, RTX 3060, RTX 4090, A100 o H100. En este rango de tamano el modelo esta limitado por el preprocesado de imagen y la transferencia de memoria, no por la capacidad de computo.
- **GPU de consumo:** si, cabe holgadamente en cualquier GPU de consumo, e incluso en aceleradores integrados. Tambien es viable en CPU y en plataformas embarcadas tipo NVIDIA Jetson o Raspberry Pi con acelerador.
- **Opciones de despliegue:** el modelo se carga con la libreria `ultralytics` (`pip install ultralytics huggingface_hub`) y el archivo `best.pt` descargado desde Hugging Face. Al ser un modelo Ultralytics, el ecosistema permite exportar a formatos como ONNX, TensorRT, OpenVINO, CoreML o TFLite; la model card no documenta exportaciones concretas ni sus precisiones. vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo generativo de lenguaje.
- **Latencia y throughput:** no disponible. La model card no publica mediciones de latencia ni de imagenes por segundo en ningun hardware; los 8,7 GFLOPs a 640 px son el unico indicador de coste computacional disponible.
- **Aviso sobre los enlaces de la busqueda web:** los resultados de busqueda devueltos no guardan ninguna relacion con este modelo ni aportan informacion tecnica adicional, por lo que no se han utilizado.

## Comparativa con modelos similares

La tabla compara este checkpoint con las alternativas de su misma categoria evaluadas por el propio autor sobre UAVDT. Todos los datos proceden del zoo de modelos de DetectionBench publicado en la model card.

| Modelo | Parametros | mAP@50 | mAP@50-95 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (YOLOv10n sobre UAVDT) | 2,8 M | 27,17 % | 15,16 % | AGPL-3.0 | Hugging Face (`dronefreak/uavdt-yolov10n`) |
| RF-DETR Nano | no disponible en la informacion | 32,78 % | 20,31 % | no disponible en la informacion | evaluado en DetectionBench |
| YOLOv9t | no disponible en la informacion | 29,42 % | 17,03 % | no disponible en la informacion | evaluado en DetectionBench |
| YOLOv8n | no disponible en la informacion | 27,80 % | 15,34 % | no disponible en la informacion | evaluado en DetectionBench |
| YOLOv11n | no disponible en la informacion | 28,56 % | 16,30 % | no disponible en la informacion | evaluado en DetectionBench |

Observaciones: RF-DETR Nano obtiene el mejor mAP@50 y el mejor mAP@50-95 del conjunto, con una precision notablemente superior (73,60 % frente a 33,30 %). Dentro de la familia YOLO nano, YOLOv11n y YOLOv8n superan ligeramente a YOLOv10n en mAP, mientras que YOLOv8s queda practicamente empatado con este modelo pese a ser una variante mayor. La ventaja especifica de YOLOv10n no esta, por tanto, en la precision, sino en la inferencia sin NMS.

## Limitaciones y advertencias

- **Precision y recall bajos en terminos absolutos:** con un 33,30 % de precision y un 31,21 % de recall, el modelo genera un numero elevado de falsos positivos y omite una fraccion considerable de vehiculos reales. No es adecuado para aplicaciones donde un error de deteccion tenga consecuencias criticas sin una capa de verificacion posterior.
- **Rendimiento muy desigual por clase:** la clase `car` alcanza 69,89 % de mAP@50, mientras que `truck` (3,86 %) y `bus` (7,76 %) quedan practicamente sin detectar. Esto refleja un fuerte desequilibrio de clases en UAVDT y limita el uso del modelo a escenarios dominados por turismos.
- **Metricas no verificadas:** el model-index marca explicitamente todos los resultados como `verified: false`. No hay evaluacion independiente que los confirme.
- **Ausencia de validacion en otros dominios:** el modelo esta ajustado exclusivamente sobre UAVDT. No hay datos sobre su comportamiento con otras alturas de vuelo, condiciones meteorologicas, sensores, ciudades o resoluciones distintas de las del conjunto de entrenamiento.
- **Riesgo de alucinacion:** en el contexto de la vision por computador, el equivalente es la deteccion espuria de objetos inexistentes, coherente con el 33,30 % de precision medido.
- **Limitacion de idioma y contexto:** no aplica en el sentido linguistico, pero si conviene recordar que el vocabulario de salida esta limitado a tres clases; no detecta personas, senales, motocicletas ni ninguna otra categoria.
- **Restricciones de licencia AGPL-3.0:** se trata de una licencia copyleft fuerte. El uso comercial del modelo o de obras derivadas exige cumplir las obligaciones de la AGPL, lo que en la practica implica liberar el codigo fuente de la aplicacion que lo integre si se ofrece como servicio en red. Muchas empresas optan por una licencia comercial de Ultralytics para evitarlo. Este punto debe revisarse antes de cualquier despliegue en produccion.
- **Sin informacion de sesgos:** la model card no incluye analisis de sesgo geografico, demografico o de condiciones de captura.
- **Tamano del repositorio de 0,0 GB:** el repositorio figura con un tamano de 0,0 GB en los metadatos de Hugging Face y cero descargas, lo que sugiere que los pesos podrian no estar efectivamente alojados o que el modelo es muy reciente. Conviene verificar la disponibilidad de `best.pt` antes de planificar una integracion.
- **Caveat de produccion:** al no publicarse latencias ni pruebas de exportacion, el coste real de integracion en un pipeline embarcado debe medirse sobre el hardware objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/uavdt-yolov10n
- Conjunto de datos UAVDT (card del autor): https://huggingface.co/datasets/dronefreak/UAVDT
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base: https://huggingface.co/Ultralytics/YOLOv10
- Paper del benchmark UAVDT: https://arxiv.org/abs/1804.00518
- Paper de YOLOv10: https://arxiv.org/abs/2405.14458
- Otros identificadores arXiv listados en los tags del repositorio (titulos no disponibles en la informacion proporcionada): https://arxiv.org/abs/2304.07193, https://arxiv.org/abs/2402.13616, https://arxiv.org/abs/2410.17725, https://arxiv.org/abs/2511.09554, https://arxiv.org/abs/2606.03748
- Demos visuales del propio repositorio (curvas PR, curvas F1, matrices de confusion y video comparativo): disponibles en la pagina de Hugging Face del modelo, no se han encontrado enlaces externos adicionales relevantes en la busqueda web.
