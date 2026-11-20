# mvdelibas/mars-arazi-yolo11s-v1

## Resumen

Mars terrain-region detector es un modelo de deteccion de objetos basado en YOLO11s, desarrollado por el usuario mvdelibas y publicado en Hugging Face. Su proposito es localizar regiones de terreno en imagenes de la camara NavCam del rover Curiosity de la NASA, clasificandolas en tres categorias derivadas del dataset AI4Mars: roca grande (`buyuk_kaya`), superficie rocosa (`ana_kaya_yuzeyi`) y arena (`kum`).

El modelo se presenta explicitamente como experimental. El propio autor advierte que el recall es bajo y que la mayor parte de las regiones de terreno no se detectan, por lo que no debe emplearse para conduccion de rovers. Su interes es fundamentalmente de investigacion y comparacion de enfoques: sirve como linea base para estudiar la idoneidad del formato de cajas delimitadoras frente a la segmentacion semantica en tareas de terreno marciano.

Se trata de un modelo pequeno (variante "s" de YOLO11), entrenado durante 100 epocas a 640 px con un batch de 16 sobre un dataset de 2.304 imagenes. La licencia declarada es CC BY 4.0, heredada del dataset de entrenamiento, aunque la arquitectura y el codigo de Ultralytics estan sujetos a AGPL-3.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11s (Ultralytics), detector de objetos de una etapa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiquetas en ingles/turco en el dataset) |
| Licencia | cc-by-4.0 (pesos); arquitectura y codigo Ultralytics bajo AGPL-3.0 |
| Formato de pesos | `.pt` (PyTorch, Ultralytics) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO11s de Ultralytics, un detector de objetos de una sola etapa con backbone convolucional y cabecera de deteccion. Se entreno durante 100 epocas con imagenes de 640 px y batch de 16, segun indica la model card.

Los datos de entrenamiento provienen del dataset `mvdelibas/mars-arazi-ai4mars-v1`, con 2.304 imagenes en total repartidas entre los distintos splits. La fuente original es AI4Mars v0.6 (Swan, Atha, Ono; NASA JPL), publicado en Zenodo con DOI 10.5281/zenodo.15995036 y licencia CC BY 4.0. Las etiquetas originales son mascaras de segmentacion obtenidas mediante crowdsourcing en Zooniverse, con la particion de test anotada por expertos de JPL. Para adaptarlas al formato de deteccion, las mascaras se convirtieron en cajas delimitadoras mediante componentes conexos. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un detector visual.

## Capacidades

- Deteccion de objetos en imagenes: localiza regiones de terreno y devuelve cajas delimitadoras con coordenadas y puntuacion de confianza.
- Clasificacion en tres clases: roca grande, superficie rocosa y arena.
- Inferencia sobre imagenes NavCam del rover Curiosity.
- Integracion con la libreria Ultralytics (`YOLO.predict`).
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso ni procesamiento de lenguaje.
- No soporta vision mas alla de la deteccion de objetos; no genera descripciones ni responde a preguntas sobre la imagen.
- Capacidad multilingue: no aplica; las etiquetas del dataset estan en ingles/turco.

## Casos de uso

- Linea base de investigacion en deteccion de terreno marciano: permite comparar el rendimiento del formato de cajas frente a enfoques de segmentacion semantica sobre el mismo dataset AI4Mars, cuantificando la perdida de recall asociada al paradigma de deteccion.
- Analisis retrospective de imagenes de archivo de Curiosity: util para explorar de forma automatica un subconjunto de imagenes NavCam y localizar candidatos a roca grande o arena, siempre con revision humana posterior dada la baja exhaustividad.
- Generacion de propuestas de anotacion (weak labeling): las detecciones de alta precision (0,723) pueden servir como semillas para que anotadores humanos completen mascaras, reduciendo el coste de etiquetado en nuevos datasets de terreno.
- Docencia y demostracion de pipelines de vision por computador: ejemplo reproducible de conversion de mascaras a cajas, entrenamiento con Ultralytics y evaluacion con metricas COCO (mAP50, mAP50-95).
- Prototipado de sistemas de clasificacion de terreno en entornos simulados: util para validar la infraestructura de inferencia antes de sustituir el detector por un modelo de segmentacion mas adecuado.
- Comparacion de estrategias de aumento de datos y configuracion de entrenamiento: al estar el codigo y los hiperparametros documentados, sirve como referencia para experimentos controlados sobre AI4Mars.

## Benchmarks y rendimiento

Resultados publicados por el autor en la particion de validacion (una sola ejecucion):

| Metrica | Valor |
|---|---|
| mAP50 | 0,308 |
| mAP50-95 | 0,162 |
| Precision | 0,723 |
| Recall | 0,301 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano de la variante "s" de YOLO11 y la resolucion de 640 px, es un modelo ligero apto para GPUs de consumo, aunque no se aportan cifras concretas.
- GPU recomendadas: no disponible. Cualquier GPU con soporte CUDA compatible con PyTorch y Ultralytics deberia poder ejecutarlo.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano reducido del modelo, aunque el autor no lo confirma.
- Opciones de despliegue: Ultralytics (PyTorch, formato `.pt`); exportacion a otros formatos (ONNX, TensorRT, etc.) no documentada en la model card.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Como referencia contextual, la propia model card senala que un modelo de segmentacion semantica seria mas adecuado que un detector de cajas para esta tarea, pero no se aportan nombres ni metricas de alternativas.

| Modelo | Parametros | Contexto | mAP50 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mars-arazi-yolo11s-v1 | no disponible | no aplica | 0,308 | cc-by-4.0 / AGPL-3.0 (Ultralytics) | Hugging Face |
| Alternativas de segmentacion | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Recall bajo (0,301): la mayoria de las regiones de terreno no se detectan. El autor lo advierte de forma explicita.
- El terreno es una region, no un objeto: el formato de caja delimitadora es una representacion pobre y limita el rendimiento. Un modelo de segmentacion seria mas apropiado.
- No apto para conduccion de rovers ni para uso en navegacion real; el autor lo desaconseja expresamente.
- Entrenado sobre un unico dataset (AI4Mars v0.6) con etiquetas parcialmente crowdsourced; posible sesgo hacia las condiciones de iluminacion, camara y terreno presentes en esas imagenes.
- Riesgo de falsos negativos elevado, lo que puede dar una falsa sensacion de ausencia de obstaculos si se interpreta la salida de forma literal.
- Licencia: los pesos se declaran CC BY 4.0, pero la arquitectura y el codigo de Ultralytics estan bajo AGPL-3.0; es necesario revisar esa licencia para uso comercial o distribuido.
- Modelo marcado como experimental y con cero descargas y cero "likes" en el momento de la consulta; no hay evidencia de validacion independiente.
- NASA y los autores de AI4Mars no respaldan este modelo.
- Idiomas: las etiquetas estan en ingles/turco; no hay soporte linguistico mas alla de la nomenclatura de clases.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mvdelibas/mars-arazi-yolo11s-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/mvdelibas/mars-arazi-ai4mars-v1
- AI4Mars v0.6 (Zenodo): https://doi.org/10.5281/zenodo.15995036
- Paper AI4Mars (Swan et al., CVPR Workshops 2021): no disponible como enlace directo en la informacion proporcionada
- Ultralytics (YOLO11): no disponible como enlace directo en la informacion proporcionada
