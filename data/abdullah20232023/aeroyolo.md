# abdullah20232023/AeroYOLO

## Resumen

AeroYOLO es un modelo de deteccion de objetos basado en YOLO11n (variante nano de Ultralytics) afinado para localizar aeronaves en imagenes: aviones, drones y helicopteros. Lo publica el usuario abdullah20232023 en Hugging Face y esta orientado a vigilancia aerea, monitorizacion de espacio aereo y analitica de imagenes captadas por UAV. El modelo resuelve la tarea de deteccion en tiempo real en un dominio concreto (aviacion y drones) donde los detectores genericos rinden peor por el tamano pequeno de los objetos y las condiciones de captura.

Con 2,59 millones de parametros y una entrada de 640x640, es un modelo deliberadamente ligero, pensado para despliegue en el borde (edge AI) o en GPUs de gama baja. Reconoce tres clases: `aircraft`, `drone` y `helicopter`. El autor reporta un mAP50 de 0,966 y un mAP50-95 de 0,703 sobre un conjunto de validacion de 603 imagenes.

Es relevante ahora porque la deteccion de drones y aeronaves es una necesidad creciente en seguridad, defensa civil y control de trafico aereo, y porque la familia YOLO11 permite exportar a multiples formatos de inferencia acelerada. No obstante, la ficha debe leerse con cautela: el modelo tiene cero descargas, no declara licencia y el repositorio aparece practicamente vacio (0,0 GB), lo que cuestiona la disponibilidad real de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n (detector convolucional de una sola etapa, familia Ultralytics) |
| Parametros totales | 2,59 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de 640x640 px) |
| Tipos de cuantizacion | no disponible en el repositorio; el framework Ultralytics permite exportar a FP16, INT8, ONNX, TensorRT, OpenVINO, TFLite y CoreML |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`best.pt`); no se confirma su presencia en el repositorio (tamano declarado 0,0 GB) |
| Clases | 3 (`aircraft`, `drone`, `helicopter`) |
| Tamano de entrada | 640x640 |
| Framework | Ultralytics (libreria `ultralytics`) |
| Pipeline declarado | object-detection |

## Arquitectura y entrenamiento

El modelo parte de YOLO11n, la variante mas pequena de la familia YOLO11 de Ultralytics, publicada en 2024 por Glenn Jocher y Jing Qiu. Se trata de un detector de una sola etapa (single-stage) basado en una red troncal convolucional con modulos C3k2 y mecanismos de atencion, seguida de un cuello de agregacion multiescala y una cabeza de deteccion anclada que predice cajas, objectness y clases. Al ser la variante nano, el modelo esta optimizado para baja latencia y consumo reducido, lo que lo hace apto para inferencia en CPU y dispositivos embebidos.

Segun la model card, el ajuste fino se realizo sobre 10.799 imagenes de entrenamiento y 603 de validacion, durante 100 epocas, con tamano de imagen 640x640 y batch automatico de 58. Se aplicaron tecnicas de aumento de datos con auto-augment, mosaic y mixup, habituales en el pipeline de Ultralytics. No se especifica el origen, la composicion ni la licencia del dataset, ni si se emplearon tecnicas de refinamiento posteriores (RLHF, DPO u otras), que en cualquier caso no aplican a un detector de objetos. Tampoco se detalla el esquema exacto de la funcion de perdida ni el uso de decodificacion especulativa.

## Capacidades

- Deteccion de objetos en imagenes con tres clases: `aircraft`, `drone` y `helicopter`.
- Inferencia en tiempo real sobre imagenes individuales o lotes de imagenes (`model.predict` con `save=True`).
- Salida con cajas delimitadoras, puntuaciones de confianza y etiquetas de clase, filtrable mediante el umbral `conf`.
- Capacidad de despliegue en el borde gracias a su tamano reducido (2,59 M de parametros).
- Exportacion potencial a formatos acelerados (ONNX, TensorRT, OpenVINO, TFLite, CoreML) mediante el framework Ultralytics, aunque no se confirma que dichos artefactos esten incluidos en el repositorio.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision-lenguaje, tool calling ni agentes: no es un modelo de lenguaje.

## Casos de uso

- Vigilancia de espacio aereo en tiempo real: integrado en un pipeline de camaras o radares opticos, el modelo marca la posicion de aeronaves y drones fotograma a fotograma; su tamano nano permite ejecutarlo en hardware de borde junto a la camara.
- Deteccion de drones no autorizados: en entornos urbanos o aeropuertos, el modelo puede discriminar entre `drone`, `aircraft` y `helicopter` para disparar alertas cuando aparece un UAV en zona restringida.
- Analitica post-vuelo de imagenes de UAV: procesamiento por lotes de miles de imagenes captadas por un dron para inventariar aeronaves presentes o apoyar tareas de inspeccion.
- Monitorizacion de trafico aereo de baja altitud: seguimiento de helicopteros y aviones ligeros en aproximaciones, complementando sensores tradicionales.
- Seguridad en instalaciones industriales y aerodromos: deteccion de intrusiones aereas sobre zonas criticas, con despliegue en mini-PC con GPU integrada.
- Etiquetado asistido y preanotacion: uso del modelo para generar cajas candidatas que un anotador humano revisa, acelerando la construccion de nuevos datasets de aviacion.
- Investigacion en vision por computador aplicada a UAV: como punto de partida ligero para experimentos de deteccion de objetos pequenos en imagenes aereas.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card, sobre el conjunto de validacion del propio entrenamiento (603 imagenes). No se aportan comparaciones con otros modelos ni resultados sobre benchmarks publicos independientes.

| Metrica | Valor |
|---|---|
| mAP50 | 0,966 |
| mAP50-95 | 0,703 |
| Precision | 0,924 |
| Recall | 0,941 |

No se han publicado resultados sobre benchmarks estandar (COCO, VisDrone, UAVDT, DOTA u otros) en la informacion disponible, por lo que los valores anteriores deben considerarse validacion interna y no comparables directamente con terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: del orden de 1 a 2 GB en FP32 a 640x640 para un modelo de 2,59 M de parametros; menos de 1 GB en FP16/INT8. Cifra orientativa, no publicada por el autor.
- GPU recomendadas: cualquier GPU moderna sirve; una NVIDIA RTX 3060/4060 o superior ofrece margen sobrado. Para despliegues de alto volumen, T4, L4, A10 o A100 permiten procesar muchos flujos en paralelo.
- Compatibilidad con GPU de consumo: si, es uno de los puntos fuertes de la variante nano; cabe sin problemas en GPUs de gama media y baja, e incluso puede ejecutarse en CPU a velocidades utilizables.
- Opciones de despliegue: Ultralytics (Python), exportacion a ONNX Runtime, TensorRT, OpenVINO, TFLite, CoreML y NCNN. Tambien es posible servirlo con TorchServe o FastAPI envolviendo la libreria Ultralytics.
- Latencia y throughput estimados: no disponibles. La model card no publica FPS, latencia ni GFLOPs para este ajuste concreto.

## Comparativa con modelos similares

No se dispone de resultados medidos de este ajuste frente a alternativas en el mismo dominio, por lo que la comparacion se limita a caracteristicas arquitectonicas y de disponibilidad.

| Modelo | Parametros | Clases | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AeroYOLO (este modelo) | 2,59 M | 3 (aircraft, drone, helicopter) | 640x640 | no disponible | repo de 0,0 GB, 0 descargas, 0 likes |
| YOLO11n base (Ultralytics) | 2,6 M aprox. | 80 (COCO) | 640x640 | AGPL-3.0 / Enterprise | ampliamente disponible |
| YOLOv8n (Ultralytics) | 3,2 M aprox. | 80 (COCO) | 640x640 | AGPL-3.0 / Enterprise | ampliamente disponible |
| AeroYOLO (trabajos academicos IEEE/Springer) | no disponible | deteccion aerea y de objetos pequenos | no disponible | no disponible | publicaciones, no pesos abiertos |

Nota importante: existe una linea de investigacion con nombre practicamente identico (AeroYOLO basado en YOLOv8s, y Aero-YOLO para objetos pequenos en UAV) publicada por IEEE y Springer. Son trabajos independientes y no deben confundirse con este repositorio de Hugging Face.

## Limitaciones y advertencias

- Repositorio aparentemente vacio: el tamano declarado es 0,0 GB, con 0 descargas y 0 likes; no se confirma que los pesos `best.pt` esten realmente accesibles.
- Discrepancia de identificadores: el repositorio figura como `abdullah20232023/AeroYOLO`, mientras que el codigo de ejemplo de la model card descarga desde `QuincySorrentino/AeroYOLO`. Hay que verificar cual es la fuente valida antes de integrarlo.
- Licencia no declarada: sin licencia explicita, el uso comercial queda en un limbo legal; ademas, la libreria Ultralytics se distribuye bajo AGPL-3.0, lo que impone obligaciones de copyleft si se usa en productos en red.
- Sesgos desconocidos: no se documenta la procedencia, la distribucion geografica ni la composicion del dataset, por lo que se desconoce el comportamiento ante tipos de aeronave, condiciones de iluminacion o fondos no representados.
- Riesgo de falsos positivos y negativos: sin test independiente, las metricas de validacion interna pueden no trasladarse a produccion; objetos pequenos en imagen aerea son especialmente propensos a fallos.
- Solo tres clases: no distingue subtipos de aeronave ni otras entidades presentes en escenas aereas (pajaros, globos, edificios).
- Ausencia de benchmarks publicos: no hay resultados sobre VisDrone, UAVDT, DOTA u otros conjuntos estandar que permitan una comparacion justa.
- Sin soporte de lenguaje: cualquier requisito de descripcion, dialogo o razonamiento queda fuera del alcance del modelo.
- Fecha de creacion inusual (2026-09-30), lo que sugiere metadatos poco fiables o un repositorio de prueba.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abdullah20232023/AeroYOLO
- Repositorio citado en el codigo de ejemplo: https://huggingface.co/QuincySorrentino/AeroYOLO
- Arbol de ficheros del repositorio citado: https://huggingface.co/QuincySorrentino/AeroYOLO/tree/main
- Repositorio oficial de Ultralytics YOLO11: https://github.com/ultralytics/ultralytics
- Paper academico AeroYOLO (IEEE, YOLOv8s multiescala): https://xplorestaging.ieee.org/ielx8/6287639/10820123/11165321.pdf?arnumber=11165321&isnumber=10820123
- Paper academico Aero-YOLO (Springer, objetos pequenos en UAV): https://link.springer.com/content/pdf/10.1007/978-981-92-3507-0_17.pdf
- Version en ACM DL del paper Aero-YOLO: https://dl.acm.org/doi/10.1007/978-981-92-3507-0_17
