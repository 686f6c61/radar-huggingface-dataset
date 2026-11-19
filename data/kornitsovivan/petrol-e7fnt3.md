# kornitsovivan/petrol-e7fnt3

## Resumen

Petrol-e7fnt3 es un modelo de deteccion de objetos publicado por el usuario kornitsovivan en Hugging Face. Segun su model card, detecta cuatro clases especificas del dominio de las estaciones de servicio: surtidores de combustible (petrol pump), mangueras (petrol hose), marquesinas (roof canopy) y paneles de precios (price board). Se distribuye como un unico fichero `weights.onnx` junto con un script de inferencia (`miner.py`) y un fichero de configuracion de servicio (`chute_config.yml`).

No se dispone de informacion sobre la arquitectura interna de la red, el numero de parametros, el conjunto de datos de entrenamiento ni el proceso de entrenamiento. El repositorio tiene un tamano de 0.0 GB segun los metadatos de Hugging Face y no registra descargas ni likes en el momento de la consulta, lo que sugiere un modelo de publicacion reciente o de uso interno.

Su relevancia es acotada: se trata de un detector especializado de dominio muy concreto (infraestructura de gasolineras) con formato ONNX, lo que facilita su despliegue en entornos de inferencia estandar, pero sin documentacion tecnica que permita evaluar su calidad, generalizacion o rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red de deteccion de objetos exportada a ONNX; no se especifica la familia) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; se desconoce si admite cuantizacion INT8/FP16) |
| Idiomas soportados | no disponible (no aplica; tarea de vision) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (`weights.onnx`) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura de la red: la model card solo indica que el modelo es un detector de objetos y que los pesos se distribuyen en formato ONNX. No se especifica si se trata de una familia YOLO, Faster R-CNN, DETR, RT-DETR u otra, ni el tamaño de entrada, el backbone o la cabeza de deteccion.

Tampoco hay datos sobre el conjunto de entrenamiento (numero de imagenes, procedencia, anotaciones), sobre el uso de aumento de datos, ni sobre el proceso de optimizacion. La unica informacion operativa es la existencia de un script `miner.py` con una API `Miner(path).predict_batch(batch_images, offset, n_keypoints)` y un fichero `chute_config.yml` que describe la imagen de servicio, lo que apunta a un pipeline de inferencia por lotes con un parametro de keypoints cuyo significado no se documenta.

## Capacidades

- Deteccion de objetos en imagenes para cuatro clases: surtidor de combustible, manguera de combustible, marquesina y panel de precios.
- Inferencia por lotes mediante `predict_batch`, segun la API expuesta en `miner.py`.
- Despliegue portable gracias al formato ONNX, compatible con ONNX Runtime y otros runtimes que soportan el estandar.
- No se documentan capacidades de segmentacion, clasificacion, OCR sobre el panel de precios, tool calling, agentes ni procesamiento de lenguaje.

## Casos de uso

- Inventario automatico de estaciones de servicio: procesar imagenes aereas o terrestres para contar surtidores y marquesinas y mantener un censo actualizado de infraestructura.
- Verificacion de cumplimiento de imagen de marca: detectar la presencia y ubicacion de marquesinas y paneles de precios para auditar la senalizacion de franquicias.
- Analisis de competencia a partir de imagenes de calle: localizar paneles de precios y surtidores para estudiar la presencia de operadores en una zona geografica.
- Mantenimiento predictivo asistido por vision: detectar mangueras y surtidores en imagenes de inspeccion para priorizar revisiones de equipos.
- Automatizacion de anotacion de datasets: usar el detector como preetiquetador en un pipeline de etiquetado humano para acelerar la creacion de nuevos conjuntos de datos del dominio.
- Monitorizacion en edge: al estar en ONNX, puede ejecutarse en dispositivos con ONNX Runtime para tareas de conteo en tiempo casi real, siempre que se valide su latencia y precision en el hardware objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB, por lo que el modelo es presumiblemente pequeno, pero no se confirma el tamano real de `weights.onnx`.
- GPU recomendadas: no disponible; al ser ONNX, puede ejecutarse en CPU y en GPU con ONNX Runtime, pero no hay datos de rendimiento.
- Compatibilidad con GPU de consumo: probable por el tamano reducido del repositorio, pero no verificable con la informacion disponible.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), y cualquier runtime compatible con ONNX; el autor menciona un fichero `chute_config.yml` para la imagen de servicio, sin detallar la plataforma.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de informacion sobre la arquitectura ni el rendimiento del modelo, por lo que no es posible establecer una comparacion rigurosa con detectores de objetos genericos o especializados.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se conocen arquitectura, datos de entrenamiento, metricas ni limitaciones declaradas por el autor.
- Dominio muy restringido: solo cuatro clases del entorno de gasolineras; no se espera generalizacion fuera de ese dominio.
- Sin datos de evaluacion: no hay mAP, precision/recall ni curvas PR publicadas, por lo que no se puede validar su calidad antes de desplegarlo.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte; el uso en servicios en red puede requerir la publicacion del codigo fuente del servicio que lo integra. Revisar con asesoria legal antes de uso comercial.
- Riesgo de sesgo y alucinacion: no evaluado; al ser un detector, el riesgo se traduce en falsos positivos y falsos negativos, especialmente con oclusiones, condiciones de iluminacion adversas o variaciones de diseno de las estaciones.
- Parametro `n_keypoints` en la API de inferencia sin documentar: su efecto sobre la salida no esta descrito.
- Repositorio sin descargas ni likes: no hay evidencia de uso comunitario ni de validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kornitsovivan/petrol-e7fnt3
