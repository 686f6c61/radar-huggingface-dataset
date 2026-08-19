# AETHORIA-AI/TR-HASH-Vision-v6-3M-Objects365

## Resumen

TR-HASH-Vision-v6-3M-Objects365 es un checkpoint de detección de objetos desarrollado por AETHORIA-AI, basado en la arquitectura YOLO26n de Ultralytics. Se trata de un modelo de investigación privado que incorpora una variante de mezcla de expertos (MoE) con enrutamiento por hash, activando dos de cuatro expertos por inferencia. Con solo 3,07 millones de parámetros, está diseñado para operar a una resolución de entrada de 640 píxeles y clasificar 365 categorías de objetos del conjunto de datos Objects365.

El modelo se distribuye como un checkpoint completo en formato PyTorch (`.pt`) y pesos en `safetensors`. Al derivar de los pesos oficiales de YOLO26n Objects365, hereda la licencia AGPL-3.0. Actualmente se encuentra en fase de evaluación interna, por lo que no se han publicado métricas de rendimiento ni resultados de validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n modificada con MoE hash-routed (4 expertos, top-2) |
| Parametros totales | 3,07 M |
| Parametros activos | 2 de 4 expertos por inferencia (no se especifica el numero exacto de parametros activos) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de vision) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pt` (checkpoint completo) y `.safetensors` (pesos) |

## Arquitectura y entrenamiento

La arquitectura parte de YOLO26n, la variante nano de la serie YOLO26 de Ultralytics, e introduce una capa de mezcla de expertos con enrutamiento por hash. El modelo contiene cuatro expertos, de los cuales se activan dos por cada token o region procesada (top-2 activation). Este diseño busca reducir el coste computacional manteniendo la capacidad de representacion, aunque no se detallan los mecanismos internos de enrutamiento ni la distribucion exacta de los parametros entre expertos y capas base.

El entrenamiento se deriva de los pesos oficiales de YOLO26n preentrenados en Objects365, un conjunto de datos con 365 clases de objetos comunes. No se proporciona informacion sobre el numero de epocas, el dataset adicional ni el proceso de optimizacion (p. ej., si se uso aumento de datos, tecnicas de regularizacion o destilacion). El autor indica que la evaluacion interna esta en curso y que las metricas se anadiran tras la validacion.

## Capacidades

- Deteccion de objetos en 365 clases definidas por el conjunto de datos Objects365.
- Inferencia a resolucion fija de 640 píxeles, compatible con el pipeline de Ultralytics.
- Arquitectura ligera (3,07 M parametros) adecuada para despliegue en entornos con recursos limitados.
- Soporte para exportacion a formato `safetensors`, ademas del checkpoint nativo de PyTorch.
- No se documentan capacidades adicionales como seguimiento de objetos, segmentacion, clasificacion de imagenes o procesamiento de video.

## Casos de uso

- Vigilancia y seguridad perimetral: deteccion de personas, vehiculos u objetos relevantes en tiempo real sobre flujos de video, gracias al tamano reducido del modelo que permite ejecucion en hardware de bajo consumo.
- Conteo de inventario en almacenes: identificacion y recuento de productos o contenedores a partir de imagenes estaticas o camaras fijas, aprovechando las 365 clases de Objects365.
- Robotica movil: integracion en sistemas embebidos (p. ej., Raspberry Pi con acelerador) para evitar obstaculos o localizar objetos de interes durante la navegacion.
- Moderacion de contenido visual: filtrado automatico de imagenes que contengan objetos no permitidos (armas, animales, etc.) en plataformas de contenido generado por usuarios.
- Agricultura de precision: deteccion de frutas, plagas o maquinaria en imagenes aereas capturadas por drones, con una ventana de 640 píxeles suficiente para escenas de campo.
- Automatizacion industrial: control de calidad en lineas de produccion, detectando piezas defectuosas o ausentes en imagenes de alta frecuencia, siempre que las clases de Objects365 cubran los elementos relevantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que la evaluacion interna esta en progreso y que las metricas (presumiblemente mAP, precision, recall) se anadiran tras la validacion. No se puede comparar objetivamente con otros modelos sin datos cuantitativos.

## Requisitos de hardware

- Al tratarse de un modelo nano con 3,07 M parametros, la inferencia es viable en CPU para uso puntual, aunque la velocidad dependera de la optimizacion del runtime.
- En GPU, cualquier tarjeta con al menos 2 GB de VRAM deberia ser suficiente para inferencia a 640 píxeles con precision FP32. Para batch grande o entrenamiento se necesitaria mas memoria.
- Compatible con el ecosistema Ultralytics: se puede ejecutar con la libreria `ultralytics` en Python, y exportar a ONNX, TensorRT o CoreML para despliegue en edge.
- No se proporcionan datos de latencia ni throughput medidos por el autor.
- Opciones de despliegue recomendadas: uso directo con el paquete `ultralytics` o exportacion a formatos optimizados (TensorRT, OpenVINO) para produccion.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa rigurosa. El modelo deriva de YOLO26n, por lo que se puede considerar una variante experimental de este. Sin embargo, al no existir benchmarks publicados, no es posible comparar rendimiento, velocidad o precision con YOLO26n original ni con otros detectores como YOLOv8n o RT-DETR. Se recomienda esperar a la publicacion de metricas validadas.

## Limitaciones y advertencias

- Modelo en fase de investigacion: no se han publicado metricas de validacion, por lo que su rendimiento real es desconocido.
- La licencia AGPL-3.0 implica que cualquier uso del modelo en un servicio de red debe divulgar el codigo fuente de la aplicacion que lo integra, lo que puede ser restrictivo para uso comercial propietario.
- Al estar entrenado en Objects365, puede presentar sesgos hacia las categorias y distribuciones de ese dataset, con posible degradacion en dominios no representados.
- No se especifica si el modelo soporta deteccion en tiempo real con video de alta frecuencia; la resolucion fija de 640 píxeles puede limitar la precision en objetos muy pequenos o escenas densas.
- No hay informacion sobre la robustez frente a oclusiones, condiciones de iluminacion adversas o imagenes de baja calidad.
- El tamano del repositorio es 0.0 GB, lo que sugiere que los archivos de pesos pueden no estar subidos o que el modelo es extremadamente comprimido; se debe verificar la integridad de los archivos antes de su uso.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/AETHORIA-AI/TR-HASH-Vision-v6-3M-Objects365
- Ultralytics YOLO26 (modelo base): https://github.com/ultralytics/ultralytics (documentacion oficial)
- Conjunto de datos Objects365: https://www.objects365.org/ (sitio oficial)
