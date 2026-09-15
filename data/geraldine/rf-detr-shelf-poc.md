# Geraldine/rf-detr-shelf-poc

## Resumen

RF-DETR shelf PoC es un modelo de deteccion de objetos publicado por el usuario Geraldine en HuggingFace, consistente en un ajuste fino (fine-tuning) del detector en tiempo real Roboflow/rf-detr-small sobre el conjunto de datos ShelfAura, orientado a una unica clase: libro ("book"). Se trata de un proof of concept (PoC) cuyo objetivo es detectar lomos y volúmenes de libros en imagenes de estanterias, un caso de uso tipico en inventariado bibliotecario, retail y robotica de almacen. El repositorio ocupa 0,3 GB y se distribuye bajo licencia Apache 2.0.

La relevancia de esta ficha no esta en el rendimiento del checkpoint (que, como se detalla mas abajo, corresponde a un entrenamiento practicamente nulo), sino en documentar con precision que es lo que hay publicado, que no lo esta y por que no deberia usarse tal cual en produccion. RF-DETR es la familia de detectores transformer de Roboflow, construida sobre un backbone DINOv2 y un decodificador tipo DETR, con el objetivo de igualar o superar a los detectores YOLO en latencia y precision manteniendo licencia permisiva. El ajuste aqui presentado hereda esa arquitectura, pero el estado de entrenamiento reportado (epoch 0, step 5) y la ausencia total de metricas de validacion lo convierten en un artefacto experimental, no en un modelo utilizable.

El modelo se entreno con pseudo-etiquetas generadas por OWLv2 en modo zero-shot (umbral 0,2, NMS 0,35) sobre ShelfAura (Zenodo, CC-BY-4.0). Esto implica que las etiquetas de entrenamiento son generadas por un modelo, no anotaciones humanas verificadas, lo que introduce ruido estructural en la supervision. No se declaran idiomas, pipeline ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de deteccion (RF-DETR: backbone ViT preentrenado tipo DINOv2 + decodificador tipo DETR); detalle exacto de capas no disponible |
| Parametros totales | no disponible (modelo base: Roboflow/rf-detr-small) |
| Longitud de contexto | no aplica (modelo de deteccion de objetos; no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible; el checkpoint publicado esta en formato PyTorch (.pth), sin versiones cuantizadas |
| Idiomas soportados | no aplica / no disponible (la tarea es deteccion visual, sin componente linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pth); el autor indica `checkpoints/checkpoint_best_total.pth` |
| Tarea | Deteccion de objetos, una unica clase: `book` |
| Modelo base | Roboflow/rf-detr-small |
| Dataset de entrenamiento | ShelfAura (Zenodo, DOI 10.5281/zenodo.19135523, licencia CC-BY-4.0) |
| Generacion de etiquetas | Pseudo-etiquetas zero-shot con OWLv2 (umbral 0,2; NMS 0,35) |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de rf-detr-small, de la familia RF-DETR de Roboflow, un detector de objetos basado en transformer que combina un backbone de vision (ViT preentrenado con atencion ventaneada, en la linea de DINOv2) con un decodificador de prediccion de conjuntos al estilo DETR. Las funciones de perdida reportadas en el registro de entrenamiento son coherentes con este diseno: `loss_bbox`, `loss_giou` (regresion de cajas), `loss_ce` (clasificacion por entropia cruzada) y sus correspondientes variantes auxiliares (`loss_bbox_aux`, `loss_giou_aux`, `loss_ce_aux`), ademas de las metricas de diagnostico `cardinality_error` y `class_error`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset mas alla de ShelfAura, ni si se aplico RLHF/DPO (no aplicable en deteccion) u otra fase de alineamiento.

El entrenamiento documentado es minimo: la ultima fila de registro corresponde a `epoch 0`, `step 5`, con `train/loss` de 7,319, `train/class_error` de 93,22 y `train/cardinality_error` de 24,45. Es decir, el proceso se interrumpio tras cinco pasos de optimizacion. La supervision proviene de pseudo-etiquetas generadas por OWLv2 con umbral de confianza 0,2 y NMS 0,35 sobre ShelfAura, lo que significa que no hay anotacion humana verificada y que los errores del detector zero-shot se incorporan al conjunto de entrenamiento. El autor reconoce explicitamente esta limitacion en la model card.

## Capacidades

- Deteccion de objetos de una unica clase (`book`) en imagenes, presumiblemente fotografias de estanterias.
- Prediccion de cajas delimitadoras con regresion bbox + GIoU, caracteristica de los detectores DETR.
- Inferencia en tiempo real heredada del diseno RF-DETR (orientado a latencias bajas en GPU consumer).
- Exportacion potencial a ONNX/TensorRT a traves del ecosistema rfdetr (no confirmada en la informacion disponible).
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes, razonamiento multi-paso ni modo "thinking".
- No tiene capacidades multilingues, de vision-lenguaje, audio ni generacion de texto.
- No dispone de clase para huecos vacios en la estanteria (limitacion declarada por el autor: "no empty-gap class yet").

## Casos de uso

- Inventario de fondos bibliotecarios: fotografiar estanterias y contar volumenes o verificar la presencia de ejemplares concretos mediante deteccion de lomos. Requeriria, no obstante, reentrenar el modelo con etiquetas humanas antes de cualquier uso real.
- Robotica de picking en almacenes de librerias: el detector localizaria cajas de libros sobre estanterias para que un brazo robotico planifique la recogida, aprovechando la orientacion a tiempo real de la familia RF-DETR.
- Digitalizacion y catalogacion asistida: deteccion de regiones de libro como paso previo a un OCR que extraiga titulos y autores; el detector solo delimita, el texto lo lee otro sistema.
- Auditoria de planogramas en retail: comprobar la colocacion de productos tipo libro en una estanteria comercial comparando las detecciones con el planograma esperado.
- Deteccion de mermas o huecos: aunque el modelo no tiene clase de hueco vacio, las posiciones sin deteccion pueden usarse heuristicamente para senalar espacios libres, con alta tasa de falsos positivos.
- Aplicacion movil de escaneo domestico: inventario de bibliotecas personales a partir de fotos tomadas con el telefono, ejecutando el modelo en el dispositivo.
- Preprocesado en pipelines de vision para bibliotecas digitales: segmentar automaticamente la zona de libros antes de aplicar recorte, rectificacion de perspectiva o estimacion de lomo.
- Generacion de datasets: el propio modelo podria usarse como etiquetador preliminar dentro de un bucle de anotacion asistida, siempre con revision humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la estructura de las metricas de validacion (`val/F1`, `val/mAP_50`, `val/mAP_50_95`, `val/mAP_75`, `val/mAR`, `val/precision`, `val/recall`) pero todas ellas aparecen vacias, lo que indica que no se ejecuto ninguna evaluacion sobre un conjunto de validacion.

Unicos datos numericos disponibles, correspondientes a la fase de entrenamiento:

| Metrica (train) | Valor |
|---|---|
| Epoch / step | 0 / 5 |
| loss | 7,319447994232178 |
| loss_bbox | 0,044424932450056076 |
| loss_bbox_aux | 0,1668185591697693 |
| loss_ce | 1,128089427947998 |
| loss_ce_aux | 3,2713356018066406 |
| loss_giou | 0,20848530530929565 |
| loss_giou_aux | 0,723417341709137 |
| cardinality_error | 24,44791603088379 |
| cardinality_error_0 / _1 / _enc | 24,33333396911621 / 24,46875 / 24,33333396911621 |
| class_error | 93,21952056884766 |
| val/* (F1, mAP, mAR, precision, recall) | vacios |

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 2 GB en FP16 y en torno a 1-2 GB en FP32 para lotes pequenos (estimacion a partir del tamano del repositorio, 0,3 GB, coherente con un checkpoint de decenas de millones de parametros; no confirmado por el autor).
- GPU recomendadas: cualquier GPU moderna con soporte CUDA. Para entrenamiento o fine-tuning, una RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB) permiten lotes grandes; para inferencia basta una GPU de gama media.
- Compatibilidad con GPU consumer: si, el modelo cabe holgadamente en tarjetas como RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4070 o RTX 4090. Incluso tarjetas de 4-6 GB deberian ser suficientes para inferencia en precision reducida.
- Opciones de despliegue: paquete Python `rfdetr` (carga mediante `RFDETRSmall.from_checkpoint('checkpoints/checkpoint_best_total.pth')`), exportacion a ONNX y TensorRT segun el soporte del ecosistema RF-DETR. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponible.
- CPU: la inferencia en CPU es tecnicamente posible via ONNX, pero sin datos de rendimiento publicados.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| rf-detr-shelf-poc (este modelo) | Deteccion, 1 clase (`book`) | no disponible | Apache 2.0 | HuggingFace, 0 descargas | Entrenamiento de 5 pasos, sin metricas de validacion |
| Roboflow/rf-detr-small | Deteccion generica (COCO) | no disponible | Apache 2.0 | HuggingFace / repositorio Roboflow | Modelo base del que se parte |
| Ultralytics YOLOv8 / YOLO11 | Deteccion generica | no disponible | AGPL-3.0 (requiere licencia comercial para uso propietario) | Repositorio Ultralytics | Alternativa comun en tiempo real; licencia mas restrictiva |
| OWLv2 | Deteccion open-vocabulary zero-shot | no disponible | Apache 2.0 | HuggingFace (Google) | Usado aqui para generar las pseudo-etiquetas; no requiere entrenamiento por clase |
| Grounding DINO | Deteccion open-set guiada por texto | no disponible | Apache 2.0 | Repositorio IDEA-Research | Alternativa zero-shot cuando no hay datos etiquetados |

No hay datos de rendimiento comparativos publicados para el modelo objeto de esta ficha, por lo que la comparacion se limita a aspectos de licencia, tarea y disponibilidad.

## Limitaciones y advertencias

- Entrenamiento practicamente inexistente: el registro termina en epoch 0, step 5. El modelo no ha convergido y no deberia considerarse funcional.
- Sin evaluacion: todas las metricas de validacion estan vacias. No existe evidencia publicada de mAP, precision ni recall.
- Etiquetas generadas por modelo: las anotaciones proceden de OWLv2 en zero-shot (umbral 0,2; NMS 0,35), no de anotadores humanos. El ruido y los sesgos de OWLv2 se trasladan al detector entrenado.
- Umbral bajo (0,2): favorece el recall a costa de la precision, lo que probablemente introdujo falsos positivos en las etiquetas de entrenamiento.
- Clase unica: solo detecta `book`. No distingue generos, idiomas, tamanos ni orientaciones, y no tiene clase para huecos vacios, lo que invalida su uso directo en auditoria de disponibilidad.
- Sesgos potenciales: el dataset ShelfAura determina la distribucion de estanterias, iluminacion y tipos de lomo. El modelo puede degradarse ante estanterias, idiomas de cubierta o formatos no representados. No hay informacion sobre la composicion demografica o geografica del dataset.
- Riesgo de alucinacion de detecciones: propia de los detectores DETR con pocos pasos de entrenamiento; se esperan cajas espurias y errores de cardinalidad elevados, como refleja `cardinality_error` en torno a 24.
- Restricciones de licencia: el modelo se publica bajo Apache 2.0, lo que permite uso comercial. Sin embargo, el dataset ShelfAura es CC-BY-4.0 y exige atribucion; conviene verificar los terminos exactos de Zenodo antes de redistribuir o comercializar derivados.
- Madurez del repositorio: cero descargas y cero likes, sin pipeline declarado y sin idiomas declarados. Es un artefacto experimental de un unico autor.
- Caveat de produccion: cualquier uso real exige reentrenar con anotaciones humanas, dividir train/validacion, medir mAP_50-95 y fijar umbrales de confianza y NMS con datos propios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Geraldine/rf-detr-shelf-poc
- Modelo base: https://huggingface.co/Roboflow/rf-detr-small
- Repositorio de RF-DETR (Roboflow): https://github.com/roboflow/rf-detr
- Dataset ShelfAura (Zenodo): https://doi.org/10.5281/zenodo.19135523
- Paper de RF-DETR: referenciado desde el repositorio de Roboflow; identificador no disponible en la informacion proporcionada
- OWLv2 (generador de pseudo-etiquetas): https://huggingface.co/google/owlv2-base-patch16-ensemble
- Documentacion del paquete `rfdetr`: disponible a traves del repositorio de Roboflow (enlace directo no proporcionado)
