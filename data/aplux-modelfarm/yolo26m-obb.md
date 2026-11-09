# APLUX-ModelFarm/YOLO26m-OBB

## Resumen

YOLO26m-OBB es un modelo de detección de objetos orientados (oriented bounding boxes, OBB) publicado en Hugging Face por el usuario APLUX-ModelFarm bajo licencia Apache 2.0. Por su nomenclatura, se corresponde con la variante de tamano medio ("m") de la familia YOLO26 aplicada a la tarea de detección con cajas delimitadoras rotadas, una modalidad habitual en teledetección, inspección industrial y análisis de imagenes aereas donde los objetos aparecen con orientaciones arbitrarias.

La model card publicada no contiene informacion tecnica sustantiva: se reduce a la declaracion de licencia Apache 2.0. No se documentan arquitectura, numero de parametros, resolucion de entrada, dataset de entrenamiento, clases soportadas ni resultados de evaluacion. El repositorio ocupa 0,1 GB, lo que es coherente con un checkpoint de pesos de un detector de tamano medio, pero no permite inferir especificaciones con rigor.

La relevancia de esta ficha es, por tanto, limitada y descriptiva: sirve para identificar el artefacto, su licencia permisiva y las comprobaciones que un equipo tecnico deberia realizar antes de considerarlo en produccion. Cualquier dato no explicitado a continuacion debe tratarse como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (por nomenclatura, familia YOLO26 con cabeza OBB; sin confirmacion del autor) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no aplica (modelo de vision, no generativo de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 0,1 GB; formato no declarado en la model card) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna, el esquema de entrenamiento, el volumen de datos, la composicion del dataset ni el uso de tecnicas de aumento de datos o destilacion. La unica inferencia razonable, derivada del nombre del repositorio, es que se trata de un detector de la familia YOLO en su version 26, variante de tamano medio, con cabeza de prediccion de cajas orientadas. Esta inferencia no esta confirmada por documentacion del autor.

Tampoco consta informacion sobre el dataset de entrenamiento (por ejemplo, DOTA, HRSC2016 u otro corpus de imagenes aereas con anotaciones rotadas), el numero de clases, la resolucion de entrada durante el entrenamiento ni si se aplicaron tecnicas de reentrenamiento o fine-tuning sobre un checkpoint previo. Todos estos extremos quedan como no disponibles.

## Capacidades

- Deteccion de objetos con cajas delimitadoras orientadas (OBB), segun la nomenclatura del repositorio; sin confirmacion documental de clases, resolucion ni umbrales.
- Procesamiento de imagen como entrada; no es un modelo de lenguaje ni multimodal generativo.
- No consta soporte de tool calling, function calling ni comportamiento agentico.
- No consta soporte multilingue ni capacidades de texto.
- No consta modo de razonamiento, vision-lenguaje, audio ni ninguna capacidad especial adicional.
- Cualquier capacidad concreta (numero de clases, rangos de tamano de objeto, tolerancia a rotaciones) debe validarse empiricamente por el usuario.

## Casos de uso

- Teledeteccion y analisis de imagenes aereas: deteccion de vehiculos, barcos o aeronaves en ortomosaicos donde las cajas axis-aligned generan solapamientos; las cajas orientadas permiten separar objetos alineados en hileras o aparcamientos. Requiere validar previamente el dominio de entrenamiento del checkpoint.
- Inspeccion industrial: localizacion de componentes en cadenas de montaje o en imagenes de control de calidad con piezas rotadas; la orientacion de la caja facilita el calculo de angulos y el recorte preciso de la region de interes.
- Analisis de documentacion escaneada: deteccion de bloques de texto o sellos con inclinacion variable, donde una caja rotada ajusta mejor el objeto que una caja rectangular estandar. La idoneidad depende de si el modelo fue entrenado en ese dominio, dato no disponible.
- Automatizacion de inventario logistico: conteo y localizacion de palets o contenedores en imagenes de almacen capturadas con camaras fijas o drones; la licencia Apache 2.0 permite integrarlo en productos comerciales sin obligacion de liberar el codigo.
- Prototipado rapido en investigacion: punto de partida para fine-tuning sobre un dataset propio de objetos rotados, dado el caracter permisivo de la licencia y el reducido tamano del repositorio (0,1 GB), que simplifica el despliegue en entornos de experimentacion.
- Preprocesado en pipelines de vision con requisitos de despliegue en el borde: si el checkpoint corresponde efectivamente a una variante media de YOLO, su coste computacional seria moderado y podria ejecutarse en GPU de gama media o en dispositivos con acelerador; esta hipotesis debe confirmarse midiendo latencia real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de mAP, precision, recall, latencia ni comparaciones con otros detectores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del numero de parametros y de la resolucion de entrada, datos no publicados.
- GPU recomendadas: no disponible. Si se confirma la hipotesis de un detector YOLO de tamano medio, cabria esperar ejecucion en GPU consumer (RTX 3060 en adelante) con margen, pero es una estimacion no verificada.
- Compatibilidad con GPU consumer: no confirmada.
- Opciones de despliegue: no disponible. En funcion del formato de pesos (no declarado) podrian aplicarse runtimes habituales para modelos YOLO (Ultralytics, ONNX Runtime, TensorRT, OpenVINO), pero ninguno esta documentado por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables con especificaciones verificables, ni el autor ofrece referencias a variantes previas de la familia YOLO26 u otros detectores OBB. Cualquier comparacion con alternativas como variantes OBB de YOLOv8, YOLO11 u otros detectores rotados requeriria datos de parametros, contexto de entrenamiento y metricas que no constan.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: la model card solo declara la licencia, por lo que no hay garantia sobre arquitectura, datos de entrenamiento ni rendimiento real.
- Riesgo de sesgo desconocido: al no publicarse la composicion del dataset, no puede evaluarse el sesgo geografico, de iluminacion, de sensor ni de clase.
- Riesgo de falsos positivos y negativos no cuantificado: sin metricas publicadas no es posible estimar la tasa de error en produccion.
- Dominio de aplicacion incierto: un detector OBB entrenado en un dominio concreto (por ejemplo, imagenes aereas) puede degradarse gravemente en otro (por ejemplo, fotografia industrial o documentos escaneados).
- Licencia Apache 2.0: permisiva para uso comercial, con obligacion de conservar el aviso de licencia y la atribucion; no impone copyleft sobre el codigo derivado.
- Repositorio con cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.
- Fecha de creacion y actualizacion muy proximas (pocos minutos de diferencia), lo que sugiere una publicacion sin ciclo de revision posterior.
- Para produccion se recomienda validar el checkpoint sobre un conjunto de test propio antes de cualquier integracion, y verificar el formato de pesos real descargando el repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/APLUX-ModelFarm/YOLO26m-OBB
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios de codigo ni demos adicionales asociados al modelo.
