# kornitsovivan/max44

## Resumen

`kornitsovivan/max44` es un modelo de deteccion de objetos publicado en Hugging Face por el usuario kornitsovivan. El modelo detecta cuatro clases especificas del dominio de las estaciones de servicio: surtidor de combustible (petrol pump), manguera de combustible (petrol hose), marquesina (roof canopy) y panel de precios (price board). Se distribuye en formato ONNX y esta etiquetado con el pipeline `object-detection`.

La informacion publicada es muy limitada: la model card se reduce a una lista de clases y a los nombres de tres ficheros del repositorio (`weights.onnx`, `miner.py` y `chute_config.yml`). No se especifican la arquitectura de red, el numero de parametros, el tamano de entrada, el dataset de entrenamiento ni metricas de rendimiento. El repositorio tiene un tamano declarado de 0.0 GB y no registra descargas ni likes en el momento de la consulta.

Se trata, por tanto, de un detector especializado y de nicho, no de un modelo de lenguaje. Su relevancia practica depende de la disponibilidad del codigo de inferencia (`miner.py`) y de la configuracion de servicio (`chute_config.yml`), que son los unicos artefactos documentados junto con los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red de deteccion de objetos exportada a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye un unico `weights.onnx`; no se documentan variantes) |
| Idiomas soportados | no disponible (no aplica a la tarea de deteccion) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (`weights.onnx`) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura de la red: la model card no indica si se trata de una familia YOLO, un detector basado en transformer (DETR y variantes) u otra topologia, ni el tamano de entrada esperado por el grafo ONNX. Tampoco se documentan el numero de parametros, las capas ni el coste computacional.

Respecto al entrenamiento, no hay datos sobre el volumen del dataset, la composicion de las imagenes, el origen de las anotaciones ni si se aplicaron tecnicas de aumento de datos. La unica informacion funcional es la firma de inferencia declarada: `Miner(path).predict_batch(batch_images, offset, n_keypoints)`, que sugiere procesamiento por lotes con parametros de desplazamiento y numero de keypoints, aunque no se explica su semantica.

## Capacidades

- Deteccion de objetos en imagenes para cuatro clases de dominio especifico: surtidor de combustible, manguera de combustible, marquesina y panel de precios.
- Inferencia por lotes mediante el metodo `predict_batch` del modulo `miner.py`.
- Ejecucion via runtime ONNX, lo que permite desplegarlo con ONNX Runtime en CPU o GPU sin depender del framework de entrenamiento original.
- No se documentan capacidades de segmentacion, clasificacion, OCR sobre el panel de precios ni estimacion de pose, pese al parametro `n_keypoints` de la firma de inferencia.
- No dispone de tool calling, razonamiento multi-paso ni capacidades multilingues, al no ser un modelo de lenguaje.

## Casos de uso

- Inventario de estaciones de servicio: detectar surtidores y marquesinas en imagenes aereas o de street view para construir un catalogo geoespacial de instalaciones y comparar su evolucion temporal.
- Monitorizacion de precios: localizar el panel de precios en la imagen para recortarlo y pasar el recorte a un pipeline de OCR externo que extraiga las cifras; el detector acota la region de interes y reduce el coste del OCR.
- Mantenimiento y auditoria de instalaciones: identificar mangueras y surtidores para revisar su estado visual y priorizar inspecciones in situ.
- Analisis de competencia: procesar lotes de imagenes de una zona geografica y contar marquesinas y surtidores por marca o ubicacion para estudios de mercado.
- Control de calidad de datos de mapas: cruzar las detecciones con bases de datos de puntos de interes para detectar estaciones no registradas o cerradas.
- Automatizacion de anotacion: usar el modelo como pre-etiquetador en un flujo de anotacion humana, revisando y corrigiendo las cajas generadas antes de reentrenar un detector propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; depende del tamano real del grafo ONNX, que no se documenta (el repositorio declara 0.0 GB, dato poco fiable).
- GPU recomendadas: no disponible. Al ser un detector de vision, es probable que funcione en GPUs de consumo, pero no hay datos que lo confirmen.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: ONNX Runtime (CPU o GPU) mediante `miner.py`; el fichero `chute_config.yml` sugiere un despliegue tipo servicio, pero no se detalla la plataforma.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables documentados en la informacion proporcionada, y sin datos de arquitectura ni de rendimiento no es posible establecer una comparacion rigurosa con detectores genericos como las familias YOLO o DETR.

## Limitaciones y advertencias

- Documentacion minima: no hay informacion sobre arquitectura, entrenamiento, metricas ni limitaciones declaradas por el autor, lo que impide evaluar su calidad antes de desplegarlo.
- Dominio muy restringido: solo detecta cuatro clases de estaciones de servicio; fuera de ese contexto su comportamiento es desconocido.
- Riesgo de falsos positivos y negativos sin cuantificar: al no publicarse precision, recall ni mAP, no se puede estimar la fiabilidad en produccion.
- Licencia AGPL-3.0: impone obligaciones copyleft fuertes; si el modelo se ofrece como servicio en red, puede exigirse la publicacion del codigo fuente del servicio. Es necesario revisarlo con el equipo legal antes de un uso comercial.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, sin senales de mantenimiento ni de comunidad.
- El parametro `n_keypoints` de la API de inferencia no esta documentado, lo que puede provocar un uso incorrecto del modelo.
- No apto para tareas de lenguaje, razonamiento o generacion de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kornitsovivan/max44
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
