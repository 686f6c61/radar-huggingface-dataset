# LibreYOLO/LibreGTRx

## Resumen

LibreGTRx es un checkpoint de deteccion de objetos publicado por la organizacion LibreYOLO en Hugging Face. Contiene los pesos de GTR-X entrenados sobre COCO y convertidos al esquema de metadatos v1.0 de LibreYOLO, de forma que pueden cargarse con la API `LibreYOLO("LibreGTRx.pt")` de esa libreria. El modelo original procede de Intellindust-AI-Lab y tanto el codigo fuente como el repositorio de pesos del publicador declaran licencia MIT.

Su relevancia es fundamentalmente de integracion: amplia el catalogo de familias de detectores disponibles dentro de una libreria alternativa a Ultralytics con licencia MIT, orientada a entrenamiento, prediccion y exportacion. La entrada por defecto es de 640x640 px y la unica tarea declarada es deteccion.

El soporte de GTR en LibreYOLO esta previsto para la version 1.6.0, por lo que las versiones publicadas en PyPI anteriores podrian no incluir esta familia. No se han publicado cifras de precision ni de latencia reproducidas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia GTR-X; no se detalla la arquitectura interna en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no aplica (detector de objetos; entrada de imagen fija de 640x640 px) |
| Tipos de cuantizacion | no disponible (se distribuye un unico checkpoint PyTorch; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de vision; no se declaran etiquetas de idioma) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`) con metadatos de esquema LibreYOLO v1.0 |
| Tarea | Deteccion de objetos (`pipeline_tag: object-detection`) |
| Resolucion de entrada | 640 x 640 px por defecto |
| Dataset de entrenamiento | `detection-datasets/coco` (COCO) |
| Libreria | `libreyolo` (soporte GTR previsto desde la version 1.6.0) |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-23 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna de GTR-X mas alla de su naturaleza como detector de objetos. Lo que si se documenta es el proceso de conversion: se selecciono el state dict del modelo EMA, se anadieron metadatos de esquema LibreYOLO v1.0 y se elimino el estado de entrenamiento y del optimizador. Los parametros aprendidos y las claves del state dict no se modificaron, por lo que el artefacto es funcionalmente equivalente al checkpoint original en terminos de pesos.

El entrenamiento original se realizo sobre COCO (repositorio de dataset `detection-datasets/coco`). No se especifican el numero de tokens o imagenes, la composicion detallada del dataset, ni tecnicas de alineacion tipo RLHF o DPO; en el caso de un detector de objetos estas ultimas no resultan de aplicacion directa. Tampoco se documentan innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa u otras) en la informacion proporcionada. La conversion se realiza mediante el script `weights/convert_gtr_weights.py` del repositorio de LibreYOLO.

## Capacidades

- Deteccion de objetos en imagenes: devuelve cajas delimitadoras y clases sobre las categorias de COCO.
- Inferencia con entrada de 640x640 px, tamano por defecto del checkpoint.
- Prediccion en CPU verificada durante la validacion del artefacto.
- Integracion con la API unificada de LibreYOLO (`model.predict("image.jpg")`), compartida con el resto de familias de la libreria.
- Compatibilidad con el flujo de entrenamiento y exportacion de LibreYOLO a nivel de libreria, aunque no se confirma soporte especifico de exportacion para esta familia concreta.
- Soporte de tool calling o function calling: no disponible (no es una capacidad declarada).
- Soporte de agentes o razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica (modelo de vision sin procesamiento de lenguaje).
- Capacidades especiales (modo thinking, vision, audio, generacion de texto): no se declara ninguna adicional a la deteccion.

## Casos de uso

- Deteccion de objetos en pipelines ya basados en LibreYOLO: permite incorporar la familia GTR-X sin cambiar la API de inferencia, reutilizando el mismo codigo de carga y prediccion que el resto de detectores de la libreria.
- Preetiquetado automatico para anotacion: usar el modelo para generar cajas candidatas sobre un dataset propio y revisarlas despues manualmente, reduciendo el coste de anotacion en proyectos de vision por computador.
- Comparativa de detectores en investigacion: al compartir interfaz con YOLOv9, RF-DETR y otras familias de LibreYOLO, sirve como linea base adicional en estudios comparativos sobre COCO con una licencia permisiva.
- Analisis de imagenes en retail o inventario: deteccion de productos o elementos sobre estanterias en fotografias capturadas a 640x640 px, integrada en un servicio de vision que consuma el checkpoint desde Python.
- Conteo y localizacion de objetos en imagenes fijas: aplicaciones de conteo en fotografia aerea, industrial o cientifica donde solo se requiere localizacion por cajas, sin segmentacion ni seguimiento temporal.
- Moderacion o filtrado visual por lotes: procesamiento por lotes de imagenes para detectar la presencia de determinadas clases antes de pasarlas a una revision humana o a un segundo modelo.
- Prototipos en CPU: dado que se valido la prediccion en CPU, es utilizable en entornos sin GPU para demos, pruebas de integracion o validacion funcional del pipeline antes de desplegar en hardware acelerado.
- Docencia y aprendizaje: ejemplo de conversion de pesos entre esquemas (state dict EMA a metadatos LibreYOLO) y de uso de una libreria de deteccion con licencia MIT en cursos o practicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente que no se reclama ninguna cifra de precision o latencia reproducida de forma independiente: la validacion realizada cubre el esquema del checkpoint, la preservacion exacta de tensores, la carga estricta y la prediccion en CPU, mientras que la paridad en CUDA, la precision independiente sobre COCO y la validacion de entrenamiento con RF1 quedan diferidas a las comprobaciones de la version 1.6.0 de LibreYOLO.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como dato oficial. El repositorio ocupa 0,2 GB, lo que sugiere un checkpoint relativamente compacto (del orden de decenas de millones de parametros en precision completa). Es una inferencia a partir del tamano del repositorio, no un dato confirmado.
- GPU recomendadas: no disponibles. No se publican requisitos ni perfiles de hardware.
- Cabe en GPU de consumo: probablemente si, dado el tamano del repositorio, aunque no hay confirmacion oficial ni cifras de consumo de memoria. Cualquier GPU consumer con 4-8 GB de VRAM deberia ser suficiente con margen si la estimacion es correcta.
- Opciones de despliegue: la via documentada es la libreria `libreyolo` en Python. La libreria ofrece extras opcionales para backends de exportacion (por ejemplo ONNX), pero no se confirma que GTR este cubierto por ellos en esta version. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a un detector de objetos.
- Latencia y throughput: no disponibles. No se han publicado mediciones.
- Inferencia en CPU: verificada para este artefacto, lo que permite ejecucion sin GPU.

## Comparativa con modelos similares

| Modelo | Tarea | Dataset | Parametros | Resolucion de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LibreGTRx | Deteccion de objetos | COCO | no disponible | 640 x 640 px | MIT | Hugging Face, requiere LibreYOLO con soporte GTR (previsto en v1.6.0) |
| YOLOv9 (en LibreYOLO) | Deteccion de objetos | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible en la informacion proporcionada | Familia core de LibreYOLO |
| RF-DETR (en LibreYOLO) | Deteccion de objetos | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible en la informacion proporcionada | Disponible como extra opcional de LibreYOLO |
| GTR-X original (Intellindust-AI-Lab) | Deteccion de objetos | COCO | no disponible | no disponible | MIT (segun el repositorio de pesos del publicador) | Repositorio `Phoenix8125/GTR` en Hugging Face y GitHub de Intellindust-AI-Lab |

No se dispone de parametros, contexto ni cifras de rendimiento de las alternativas dentro de la informacion proporcionada, por lo que la comparacion queda limitada a tarea, licencia y via de distribucion.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos del modelo. Al estar entrenado sobre COCO, hereda las limitaciones de cobertura, balance de clases y sesgos geograficos y culturales de ese dataset.
- Riesgo de alucinacion: en deteccion se traduce en falsos positivos y falsos negativos. No hay cifras de precision, recall ni mAP que permitan acotar este riesgo.
- Ausencia de validacion independiente: la model card indica explicitamente que no se reclaman numeros de precision ni de latencia reproducidos de forma independiente. La paridad en CUDA y la validacion COCO quedan pendientes para la version 1.6.0 de LibreYOLO.
- Dependencia de version: el soporte de GTR esta previsto para LibreYOLO 1.6.0. Las versiones anteriores publicadas en PyPI pueden no cargar este checkpoint.
- Checkpoint sin estado de optimizador: se elimino el estado de entrenamiento y del optimizador, por lo que el artefacto sirve para inferencia y ajuste fino desde cero, no para reanudar un entrenamiento interrumpido.
- Limitacion de idioma: no aplica, pero tampoco hay soporte de texto; solo procesa imagenes.
- Limitacion de formato: solo se distribuye un checkpoint PyTorch. No hay variantes cuantizadas ni formatos alternativos documentados, lo que limita el despliegue en entornos con restricciones de memoria o en runtimes no Python.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin comunidad ni soporte externo documentado.
- Licencia: MIT, permisiva y apta para uso comercial, pero conviene revisar los ficheros `LICENSE` y `NOTICE` del repositorio y mantener la atribucion correspondiente a Intellindust-AI-Lab.
- Fechas de publicacion: el repositorio figura como creado el 2026-09-23, dato a tener en cuenta al verificar la vigencia del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LibreYOLO/LibreGTRx
- Organizacion LibreYOLO en Hugging Face: https://huggingface.co/LibreYOLO
- Repositorio de LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Script de conversion: `weights/convert_gtr_weights.py` en https://github.com/LibreYOLO/libreyolo
- Implementacion oficial de GTR (Intellindust-AI-Lab): https://github.com/Intellindust-AI-Lab/GTR/tree/782e737efe2e6437ac537fbdcee089673d3376c1
- Checkpoint original publicado: https://huggingface.co/Phoenix8125/GTR/blob/9fc62c8c2b2c976835d0f1c1ffc544dbc0f9e29f/det/gtr_x_coco.pth
- Web del proyecto LibreYOLO: https://www.libreyolo.com/
- Documentacion de modelos soportados: https://www.libreyolo.com/docs/models
