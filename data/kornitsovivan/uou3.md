# kornitsovivan/uou3

## Resumen

uou3 es un modelo de deteccion de objetos publicado por el usuario kornitsovivan en Hugging Face bajo licencia AGPL-3.0. Se distribuye en formato ONNX y esta especializado en la deteccion de cuatro clases concretas vinculadas a estaciones de servicio: surtidor de combustible (petrol pump), manguera de combustible (petrol hose), marquesina (roof canopy) y cartel de precios (price board). No se trata de un modelo de lenguaje ni de un modelo fundacional, sino de un detector de objetos de proposito especifico.

El repositorio es extremadamente minimo: incluye el archivo de pesos `weights.onnx`, un script de inferencia `miner.py` con una API `Miner(path).predict_batch(batch_images, offset, n_keypoints)` y un archivo de configuracion de despliegue `chute_config.yml`. No se publica informacion sobre arquitectura interna, tamano de parametros, dataset de entrenamiento ni resultados de benchmarks.

La relevancia de este modelo es acotada: resulta util unicamente para pipelines de vision por computador orientados a la monitorizacion o analisis automatizado de estaciones de servicio (por ejemplo, verificacion de precios, inventario de infraestructura o analisis de imagenes de satelite y street-level). Fuera de ese nicho, su aplicabilidad es practicamente nula. El repo tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0.0 GB reportado, lo que sugiere que los pesos podrian no estar efectivamente alojados o que el reporte de tamano no es fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (detector de objetos en formato ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo se distribuye ONNX) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (`weights.onnx`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. El unico dato tecnico es que se distribuye como grafo ONNX, lo que permite inferencia portable en CPU y GPU mediante ONNX Runtime. El nombre del repositorio ("uou3") no aporta pistas sobre la familia arquitectonica; podria tratarse de una variante de YOLO, RT-DETR, Faster R-CNN u otra familia de detectores, pero no hay evidencia en la informacion proporcionada para confirmarlo.

Tampoco se documenta el dataset de entrenamiento, el numero de imagenes, el esquema de anotacion ni si se aplicaron tecnicas de aumento de datos o destilacion. La API de inferencia `predict_batch(batch_images, offset, n_keypoints)` sugiere que el modelo puede devolver, ademas de cajas delimitadoras, puntos clave (keypoints) asociados a cada deteccion, lo que seria coherente con un detector de instancias con estimacion de pose o de puntos de referencia geometricos (por ejemplo, esquinas de la marquesina o del cartel de precios). Sin embargo, esta es una inferencia a partir de la firma de la funcion y no un dato confirmado por el autor.

## Capacidades

- Deteccion de objetos en imagenes para cuatro clases especificas: surtidor de combustible, manguera de combustible, marquesina y cartel de precios.
- Inferencia por lotes mediante `Miner.predict_batch(batch_images, offset, n_keypoints)`, lo que permite procesar multiples imagenes en una sola llamada.
- Posible salida de puntos clave por deteccion (el parametro `n_keypoints` asi lo sugiere), aunque no se documenta el formato exacto de la salida.
- Ejecucion portable via ONNX Runtime en CPU y GPU.
- No soporta generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni capacidades multilingues, al no ser un modelo de lenguaje.
- No se documentan capacidades de segmentacion, vision-lenguaje ni modo "thinking".

## Casos de uso

- Monitorizacion de precios en estaciones de servicio: el modelo puede detectar el cartel de precios (price board) en imagenes capturadas por camaras o vehiculos, permitiendo a un pipeline posterior de OCR extraer y comparar precios entre estaciones.
- Inventario de infraestructura en imagenes de satelite o street-level: deteccion de marquesinas (roof canopy) y surtidores (petrol pump) para construir mapas o bases de datos geoespaciales de estaciones de servicio.
- Verificacion de cumplimiento normativo: deteccion de mangueras (petrol hose) y surtidores para auditar el estado o la presencia de equipos en instalaciones registradas.
- Analisis de imagenes de inspeccion tecnica: procesamiento por lotes de fotografias tomadas por operarios para localizar automaticamente los elementos clave de la estacion y priorizar revisiones.
- Automatizacion de anotacion de datasets: uso del detector como pre-etiquetador en un flujo de anotacion humana, reduciendo el coste de etiquetar nuevas imagenes de estaciones de servicio.
- Integracion en sistemas de vision embebidos: al distribuirse en ONNX, puede desplegarse en dispositivos con recursos limitados (por ejemplo, camaras IP con inferencia en el borde) para alertas en tiempo real sobre presencia o ausencia de elementos.
- Analisis de imagenes aereas para planificacion urbana o energetica: deteccion de marquesinas y surtidores en ortofotos para estudios de densidad de infraestructura de combustible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas de mAP, precision, recall, latencia ni throughput, ni comparaciones con otros detectores.

## Requisitos de hardware

- VRAM estimada: no disponible. Al desconocerse el numero de parametros y la resolucion de entrada, no es posible estimar el consumo de memoria.
- GPU recomendadas: no disponible. Cualquier GPU compatible con ONNX Runtime (por ejemplo, NVIDIA con CUDA o cualquier GPU via DirectML) podria ejecutar el modelo, pero se desconoce si el rendimiento es adecuado.
- Compatibilidad con GPU de consumo: no confirmada. Al no conocerse el tamano del modelo, no se puede asegurar que quepa en una RTX 4090, RTX 3060 u otras.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), posiblemente TensorRT u OpenVINO mediante conversion desde ONNX. El repositorio incluye `chute_config.yml`, presumiblemente para un servicio de inferencia propietario o interno, pero no se documenta su contenido ni el runtime asociado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de informacion sobre modelos comparables de deteccion de objetos especializados en estaciones de servicio, ni de metricas de este modelo que permitan una comparacion rigurosa con detectores genericos como YOLOv8, RT-DETR o Faster R-CNN.

## Limitaciones y advertencias

- Informacion practicamente inexistente: no se documenta arquitectura, dataset, metricas ni proceso de entrenamiento, lo que impide evaluar su calidad de forma objetiva.
- El repositorio reporta 0.0 GB de tamano y 0 descargas, lo que podria indicar que los pesos no estan realmente disponibles o que el modelo no ha sido validado por terceros.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso comercial es posible, pero cualquier distribucion o servicio en red que utilice el modelo puede obligar a liberar el codigo fuente derivado bajo la misma licencia. Es un caveat importante para produccion.
- Dominio muy restringido: solo detecta cuatro clases. No es util para tareas generales de vision.
- Riesgo de alucinacion en sentido figurado: como cualquier detector, puede producir falsos positivos y falsos negativos, especialmente en condiciones de iluminacion adversa, oclusion o dominios visuales distintos al de entrenamiento. No se documenta el rendimiento en dominios fuera de distribucion.
- Sin soporte multilingue ni de texto: no aplica, pero conviene subrayar que no es un modelo de lenguaje y no debe evaluarse como tal.
- Ausencia de documentacion sobre la API: el formato exacto de salida de `predict_batch` y el significado de `offset` y `n_keypoints` no estan especificados, lo que dificulta la integracion sin ingenieria inversa.
- Fecha de creacion futura (2026-11-19) en los metadatos: inconsistencia que sugiere posibles errores en la publicacion o en los metadatos del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kornitsovivan/uou3
