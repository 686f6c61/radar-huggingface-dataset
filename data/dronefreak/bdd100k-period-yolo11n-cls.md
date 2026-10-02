# dronefreak/bdd100k-period-yolo11n-cls

## Resumen

El modelo `dronefreak/bdd100k-period-yolo11n-cls` es un clasificador de imágenes resultado de un ajuste fino (*fine-tuning*) del backbone `YOLO11n-cls` de Ultralytics sobre la tarea de clasificación del momento del día (*time-of-day*) derivada del conjunto de datos BDD100K. Lo publica el usuario dronefreak como parte de BDD100K-Toolkit, un kit de herramientas orientado a preparar BDD100K, entrenar modelos sobre él y evaluarlos siempre con las mismas métricas y las mismas particiones (*splits*), de modo que los resultados sean comparables entre arquitecturas.

La tarea resuelve un problema de clasificación de 4 clases: `daytime` (día), `night` (noche), `dawn or dusk` (amanecer o anochecer) y `unknown` (desconocido). Las etiquetas no provienen de un benchmark oficial, sino del campo `attributes.timeofday` de cada imagen de BDD100K, siguiendo la convención del conjunto de datos homónimo publicado en Kaggle. Es, por tanto, una tarea no oficial sin tabla de clasificación pública.

El modelo es extremadamente compacto: 1,5 millones de parámetros, aproximadamente 6 MB en FP32, lo que lo sitúa en el rango de modelos diseñados para inferencia en tiempo real incluso en hardware de borde. Su relevancia práctica radica en el dominio: la clasificación automática de condiciones de iluminación es un paso habitual de triaje en *pipelines* de datos de conducción autónoma, donde condiciona desde el muestreo estratificado para anotación hasta la selección de modelos de detección especializados por franja horaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN para clasificacion de imagenes (familia Ultralytics YOLO11, variante `n-cls`); base `Ultralytics/YOLO11` |
| Parametros totales | 1,5 M (segun badge de la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen de 224 x 224 px) |
| Tipos de cuantizacion | no disponible en la model card; el framework Ultralytics permite exportar a ONNX, TensorRT, OpenVINO y TFLite, entre otros |
| Idiomas soportados | no disponible (no aplica: clasificacion de imagenes, sin componente de texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | checkpoint PyTorch de Ultralytics (`best.pt`), cargado mediante `huggingface_hub.hf_hub_download` + `ultralytics.YOLO` |

## Arquitectura y entrenamiento

La arquitectura es la variante de clasificacion de la familia YOLO11 de Ultralytics, una red convolucional disenada originalmente para deteccion en tiempo real y adaptada aqui a clasificacion de imagen completa mediante una cabeza de clasificacion. La variante `n` (*nano*) es la mas pequena de la familia: 1,5 M de parametros. El modelo parte de pesos preentrenados (`pretrained: True`) y se ajusta fino sobre el conjunto de datos `dronefreak/BDD100K-Period-Classification`. El entrenamiento se realizo con la libreria Ultralytics y se evaluo sobre la particion `test` de 10.000 imagenes.

La configuracion de entrenamiento documentada es la siguiente: maximo de 50 epocas con parada temprana de paciencia 10, 30 epocas efectivamente completadas, mejor epoca en la 20. El checkpoint `best.pt` se selecciona por *macro F1* sobre la particion de validacion. Tamano de lote 128, resolucion de entrada 224 x 224, semilla 0 y optimizador resuelto automaticamente a MuSGD con `lr=0.01` y `momentum=0.9`. La model card no documenta ni el numero total de tokens/imagenes de entrenamiento ni la composicion exacta de las particiones de entrenamiento y validacion, ni si hubo etapas de ajuste adicionales.

## Capacidades

- Clasificacion de imagenes de escenas de conduccion en 4 clases de momento del dia: `daytime`, `night`, `dawn or dusk` y `unknown`.
- Salida de probabilidades por clase mediante la interfaz `probs` de Ultralytics, con acceso directo a la clase top-1 y a su confianza (`probs.top1`, `probs.top1conf`).
- Inferencia en un unico paso sobre imagenes individuales o lotes, heredando el pipeline de prediccion de Ultralytics.
- Capacidad de exportacion a otros formatos de inferencia (ONNX, TensorRT, OpenVINO, TFLite) a traves del ecosistema Ultralytics, si bien esto no se documenta explicitamente para este checkpoint concreto.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, generacion de texto, vision general (VQA, OCR, segmentacion, deteccion) ni soporte multilingue. Es exclusivamente un clasificador de imagen de proposito especifico.

## Casos de uso

- Triaje y curado de datasets de conduccion: dado un repositorio de millones de fotogramas sin etiquetar, el modelo permite separar automaticamente las imagenes diurnas de las nocturnas y de las de crepusculo antes de enviarlas a anotacion, reduciendo el coste de etiquetado manual y permitiendo muestreo estratificado por franja horaria.
- Enrutado condicional en pipelines de percepcion: un sistema ADAS puede invocar esta clasificacion como primer paso y, segun la prediccion, activar un modelo de deteccion ajustado especificamente para noche o para condiciones de bajo contraste, con un coste computacional de 1,5 M de parametros.
- Control de exposicion y ganancia en camaras de automocion: la clasificacion de momento del dia puede alimentar heuristicas de ajuste automatico de HDR, exposicion o iluminacion infrarroja en sistemas de captura embarcados.
- Deteccion de deriva de datos (*data drift*) en produccion: monitorizando la distribucion de predicciones de momento del dia sobre los fotogramas entrantes de una flota, es posible detectar cambios en las condiciones de operacion (por ejemplo, expansion de rutas a turnos nocturnos) que degraden otros modelos del sistema.
- Analitica de flotas y suscripcion de seguros: clasificar rapidamente el material grabado por la flota para segmentar siniestros o eventos por momento del dia, alimentando informes agregados sin intervencion manual.
- Automatizacion de pruebas de robustez de modelos de vision: al disponer de una herramienta reproducible de clasificacion por iluminacion con metricas publicadas sobre la misma particion, sirve como linea base para comparar arquitecturas (ResNet-18, ConvNeXt-Atto, EfficientViT-B0, MobileNetV4, entre otras).
- Etiquetado asistido en herramientas de anotacion: preetiquetar el atributo de momento del dia de cada imagen para que los anotadores humanos solo tengan que corregir discrepancias, acelerando el ciclo de anotacion de BDD100K y conjuntos derivados.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre la particion `test` (10.000 imagenes) del conjunto `dronefreak/BDD100K-Period-Classification`. Ninguno de los resultados esta verificado de forma independiente (`verified: false`).

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 93,79 % |
| Macro F1 | 80,13 % |
| Balanced accuracy (macro recall) | 75,19 % |
| Macro precision | 88,20 % |
| Macro recall | 75,19 % |

### Desglose por clase

| Clase | Precision | Recall | F1 | Imagenes de test |
|---|---|---|---|---|
| dawn or dusk | 71,40 % | 51,03 % | 59,52 % | 778 |
| daytime | 93,23 % | 96,60 % | 94,88 % | 5.258 |
| night | 97,71 % | 98,85 % | 98,28 % | 3.929 |
| unknown | 90,48 % | 54,29 % | 67,86 % | 35 |

Los resultados ponen de manifiesto un desequilibrio claro entre clases: la clase `night` alcanza un F1 de 98,28 %, mientras que `dawn or dusk`, la mas dificil, se queda en 59,52 % con un recall del 51,03 %. La clase `unknown` cuenta unicamente con 35 imagenes de test, por lo que sus metricas tienen una varianza muy alta.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6 MB para los pesos en FP32 y unos 3 MB en FP16. El pico real de memoria durante la inferencia esta dominado por las activaciones intermedias de una red a 224 x 224, no por los pesos; en la practica cabe holgadamente en menos de 1 GB de memoria.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada para este modelo. Funciona sin problemas en NVIDIA RTX 3090/4090, A100, H100, T4, L4 o GPUs integradas. Tambien es viable en CPU, en dispositivos de borde tipo NVIDIA Jetson (Nano, Orin), Raspberry Pi o aceleradores tipo Coral, siempre que se exporte al formato adecuado.
- Cabe en GPU de consumo: si, con enorme margen. Tambien en CPU y en hardware embebido.
- Opciones de despliegue: inferencia nativa con la libreria `ultralytics` (PyTorch), exportacion a ONNX Runtime, TensorRT, OpenVINO, TFLite y formatos similares soportados por Ultralytics. La model card solo documenta el uso via `ultralytics.YOLO` sobre `best.pt`.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de latencia ni de imagenes por segundo en la informacion proporcionada.

## Comparativa con modelos similares

La model card incluye una comparativa de arquitecturas evaluadas por el autor sobre la misma particion `test`, ordenada por Top-1 accuracy. Es la unica comparativa disponible y no esta verificada de forma independiente.

| Modelo | Top-1 | Macro F1 | Balanced accuracy | Macro precision |
|---|---|---|---|---|
| convnext_atto | 93,95 % | 80,75 % | 76,82 % | 86,39 % |
| **yolo11n-cls (este modelo)** | **93,79 %** | **80,13 %** | **75,19 %** | **88,20 %** |
| efficientvit_b0 | 93,71 % | 80,98 % | 77,14 % | 86,44 % |
| yolo26n-cls | 93,61 % | 80,41 % | 77,72 % | 83,88 % |
| mobilenetv4_conv_small | 93,57 % | 80,22 % | 76,22 % | 86,06 % |
| yolov8n-cls | 93,56 % | 80,85 % | 76,26 % | 87,87 % |
| resnet18 | 93,32 % | 80,50 % | 76,72 % | 85,87 % |

Lectura de la tabla: `yolo11n-cls` queda segundo en Top-1 (93,79 %) por detras de ConvNeXt-Atto (93,95 %) y primero en macro precision (88,20 %), pero es el penultimo en balanced accuracy (75,19 %) y el ultimo en macro F1 salvo por MobileNetV4-Conv-Small (80,22 %) y YOLO26n-cls (80,41 %). La diferencia entre Top-1 y balanced accuracy indica que el modelo acierta mucho en las clases mayoritarias (`daytime`, `night`) y rinde peor en las minoritarias (`dawn or dusk`, `unknown`).

## Limitaciones y advertencias

- Tarea no oficial: las etiquetas son atributos por imagen de BDD100K, no un benchmark con tabla de clasificacion publica. Las puntuaciones solo son comparables con otros modelos evaluados exactamente sobre esta particion, no con resultados publicados de BDD100K.
- Las metricas declaradas figuran como no verificadas (`verified: false`). No hay validacion independiente de los numeros.
- Desequilibrio de clases acusado: `dawn or dusk` obtiene un recall del 51,03 % y la clase `unknown` solo tiene 35 imagenes de test, lo que hace sus metricas estadisticamente fragiles y poco fiables para produccion.
- La distincion entre `daytime` y `dawn or dusk` es intrinsecamente ambigua y depende del criterio de anotacion original de BDD100K; puede no coincidir con la definicion operativa que necesite un despliegue concreto.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso comercial es posible, pero ofrecer el modelo como servicio en red obliga, segun los terminos de la AGPL, a poner a disposicion de los usuarios el codigo fuente correspondiente. Conviene revisar las implicaciones con asesoria legal antes de integrarlo en un producto propietario o en un SaaS.
- Modelo exclusivamente de clasificacion de imagen. No realiza deteccion, segmentacion, OCR, respuesta a preguntas visuales ni ninguna tarea generativa.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea sistematica en condiciones de iluminacion intermedias, contraluz intenso, tuneles, transiciones o imagenes con poca informacion visual, como evidencian las metricas por clase.
- No se documenta en la informacion proporcionada el numero de imagenes de entrenamiento, la composicion exacta de las particiones ni posibles sesgos geograficos o demograficos heredados de BDD100K.
- La model card aparece truncada en la seccion de limitaciones (el texto se corta en "Not the offici..."), por lo que puede haber advertencias adicionales del autor que no se han podido incorporar.
- En el momento de la consulta el repositorio figura con 0 descargas, 0 likes y un tamano de 0.0 GB. Conviene verificar que el archivo `best.pt` esta efectivamente disponible antes de depender de el.
- Los resultados de busqueda web realizados no devolvieron ninguna fuente tecnica relevante sobre este modelo; el contenido recuperado era ruido ajeno al tema y se ha descartado por completo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/bdd100k-period-yolo11n-cls
- Conjunto de datos de clasificacion por periodo: https://huggingface.co/datasets/dronefreak/BDD100K-Period-Classification
- Repositorio BDD100K-Toolkit (codigo de preparacion, entrenamiento y evaluacion): https://github.com/dronefreak/bdd100k-toolkit
- Modelo base Ultralytics YOLO11: https://huggingface.co/Ultralytics/YOLO11
- Articulo de BDD100K referenciado en las etiquetas del modelo (arXiv:1805.04687): https://arxiv.org/abs/1805.04687
- Articulo referenciado en las etiquetas del modelo sobre la familia YOLO11 (arXiv:2410.17725): https://arxiv.org/abs/2410.17725
- Dataset BDD100K original: https://bdd-data.berkeley.edu/ (referencia habitual del proyecto; no confirmado en la informacion proporcionada)
- No se han encontrado en la busqueda web otros enlaces relevantes (papers, blogs o demos) especificos de este modelo.
