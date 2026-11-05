# irfanbaloch3334/CNN_Segmentation_Model

## Resumen

CNN_Segmentation_Model es un repositorio publicado en Hugging Face por el usuario irfanbaloch3334 que, segun su model card, no contiene un modelo entrenado desde cero sino el empaquetado de una aplicacion de segmentacion de recibos (tickets de compra) construida sobre YOLO11n-seg. El modelo subyacente referenciado es `ciCic/yolo11n-seg-bonnetjes`, un detector-segmentador de una sola clase (`bonnetje`, "recibo" en neerlandes) de aproximadamente 2,8 millones de parametros y unos 6 MB de pesos. La contribucion del repositorio es principalmente de ingenieria de aplicacion: una interfaz Streamlit que carga los pesos, ejecuta la inferencia en CPU, dibuja las mascaras y permite descargar cada recibo recortado y enderezado.

El problema que resuelve es acotado y practico: dado una foto de un ticket tomada con el movil, localizar el ticket a nivel de pixel, corregir la perspectiva y extraerlo como imagen limpia. Es relevante como ejemplo de pipeline completo de vision por computador desplegable sin GPU, pero no como modelo fundacional ni como base general de segmentacion.

La informacion disponible es escasa en lo que respecta al propio repositorio: no hay pipeline declarado, licencia definida, idiomas ni metricas publicadas. La model card describe la aplicacion y advierte explicitamente de que el notebook de entrenamiento incluido no produce un modelo funcional, ya que se entrena sobre COCO128-seg (80 clases) contra un modelo de una sola clase, con mAP de validacion cercano a 0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n-seg (detector-segmentador de instancias, CNN) |
| Parametros totales | ~2,8 M (modelo referenciado `ciCic/yolo11n-seg-bonnetjes`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch `.pt`) |
| Idiomas soportados | no aplica (vision); la clase se denomina `bonnetje` (neerlandes) |
| Licencia | no disponible en el repo; los pesos siguen la licencia de su pagina en Hugging Face y Ultralytics es AGPL-3.0; el codigo de la app es MIT |
| Formato de pesos | `.pt` (PyTorch, checkpoint Ultralytics); tamano ~6 MB |

## Arquitectura y entrenamiento

La arquitectura es YOLO11n-seg, la variante "nano" de la familia YOLO11 de Ultralytics para segmentacion de instancias. Se trata de una red convolucional con backbone y cuello tipo YOLO y una cabeza que produce simultaneamente cajas, clases y coeficientes de mascara por instancia, combinados con prototipos de mascara para generar la segmentacion a nivel de pixel. Con ~2,8 M de parametros y ~6 MB de pesos, esta disenada para inferencia en CPU y dispositivos de baja potencia.

No se dispone de informacion sobre el dataset de entrenamiento del modelo `ciCic/yolo11n-seg-bonnetjes` (numero de imagenes, composicion, aumento de datos, regimen de entrenamiento ni si hubo ajuste fino desde pesos preentrenados en COCO). La model card unicamente advierte de que el notebook incluido en el repositorio entrena sobre COCO128-seg, un dataset de 80 clases, mientras que el modelo final tiene una sola clase, de modo que Ultralytics descarta las etiquetas no mapeables y el resultado de ese entrenamiento no aprende nada util (mAP de validacion ~0). El repositorio, por tanto, no documenta un proceso de entrenamiento reproducible para el modelo publicado.

## Capacidades

- Deteccion y segmentacion de instancias de recibos o tickets en imagenes, con una unica clase (`bonnetje`).
- Generacion de mascaras a nivel de pixel y cajas delimitadoras con puntuacion de confianza.
- Extraccion de cada recibo como recorte enderezado mediante correccion de perspectiva.
- Procesamiento por lotes de varias imagenes (JPG, PNG, WEBP, BMP) y captura desde camara en la app Streamlit.
- Gestion de rotacion EXIF de fotos de movil y redimensionado automatico de imagenes muy grandes.
- Parametros ajustables de confianza, IoU e imgsz desde la interfaz.
- Ejecucion en CPU sin GPU.
- No dispone de generacion de texto, razonamiento, codigo, tool calling, capacidades de agente ni soporte multilingue: es exclusivamente un modelo de vision.

## Casos de uso

- Digitalizacion de gastos: procesar lotes de fotos de tickets para recortarlos y enderezarlos antes de pasarlos a un motor de OCR o a un sistema de contabilidad, aprovechando la segmentacion para aislar el documento del fondo.
- Aplicacion de escaneo movil: integrar el modelo en una app que capture tickets con la camara, detecte el documento y devuelva la imagen corregida en perspectiva para su archivo.
- Preprocesado para pipelines de OCR: usar la mascara y el recorte enderezado como paso previo a Tesseract o a un modelo de vision-lenguaje, reduciendo errores de lectura por inclinacion o fondo.
- Automatizacion de notas de gastos: desplegar la app Streamlit en un entorno interno para que el personal suba fotos de tickets y obtenga recortes descargables en PNG.
- Prototipado rapido de segmentacion de documentos: servir como plantilla de referencia para adaptar el pipeline a otros tipos de documento de una sola clase (facturas, albaranes) reentrenando con un dataset propio.
- Demostracion educativa de segmentacion de instancias: usar el repositorio como ejemplo de extremo a extremo (carga de pesos, inferencia, postproceso geometrico y UI) en cursos o talleres de vision por computador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona que el entrenamiento sobre COCO128-seg produce un mAP de validacion cercano a 0, lo que refleja un fallo de configuracion del notebook y no el rendimiento del modelo `ciCic/yolo11n-seg-bonnetjes` utilizado por la app.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia esta pensada para CPU.
- GPU recomendadas: no aplica; cualquier GPU compatible con PyTorch podria acelerar la inferencia, pero no es necesario.
- Cabe en cualquier equipo consumer: los pesos (~6 MB) y el modelo nano (~2,8 M de parametros) se ejecutan en CPU de forma holgada.
- Despliegue: Streamlit Community Cloud (Python 3.12, con `packages.txt` para las librerias de OpenCV), Hugging Face Spaces, Render o Docker. Conviene usar las builds CPU de PyTorch (`torch==2.6.0+cpu`, `torchvision==0.21.0+cpu`) para evitar descargar las librerias CUDA de varios GB.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| CNN_Segmentation_Model (YOLO11n-seg `bonnetje`) | ~2,8 M | Segmentacion de recibos, 1 clase | no disponible (pesos segun su pagina; Ultralytics AGPL-3.0) | Hugging Face, app Streamlit |
| YOLO11n-seg (Ultralytics, base) | ~2,8 M | Segmentacion de instancias, 80 clases COCO | AGPL-3.0 | Ultralytics / Hugging Face |
| Segment Anything (SAM) | cientos de millones | Segmentacion promptable general | Apache-2.0 (segun version) | Meta / Hugging Face |

No se dispone de datos de rendimiento comparativo (mAP, latencia) en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El repositorio no declara licencia propia; los pesos dependen de la licencia de `ciCic/yolo11n-seg-bonnetjes` y Ultralytics es AGPL-3.0, lo que condiciona el uso comercial. Hay que verificar ambas antes de desplegar.
- El notebook de entrenamiento incluido no produce un modelo funcional (entrena COCO128-seg contra una clase unica, mAP ~0); no sirve como receta de reentrenamiento.
- Modelo de una sola clase y dominio acotado (recibos): no generaliza a otros tipos de documento ni a segmentacion generica sin reentrenamiento.
- Riesgo de falsos negativos con tickets poco visibles, muy inclinados o con fondos complejos; la model card sugiere bajar el umbral de confianza en esos casos.
- No hay informacion sobre sesgos, composicion del dataset ni evaluacion de robustez.
- Sin datos publicados de benchmarks, latencia ni throughput; el rendimiento real en produccion no esta caracterizado.
- Dependencia de la primera descarga de pesos desde Hugging Face (requiere red) salvo que se incluya `models/best.pt` localmente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/irfanbaloch3334/CNN_Segmentation_Model
- Modelo referenciado (pesos): https://huggingface.co/ciCic/yolo11n-seg-bonnetjes
- Ultralytics (framework YOLO11): https://github.com/ultralytics/ultralytics
- Streamlit: https://streamlit.io
- Streamlit Community Cloud: https://share.streamlit.io
