# mtbui2010/rfdetr-small-etri-ONNX

## Resumen

RF-DETR Small — tabletop-22 (ONNX) es un detector de objetos derivado de Roboflow/rf-detr-small, publicado por el usuario mtbui2010. Partiendo del checkpoint preentrenado en COCO (licencia Apache-2.0), se ha hecho un fine-tuning sobre 22 clases de objetos de sobremesa («tabletop») a partir de datos ETRI, y el resultado se ha exportado a ONNX (opset 17) para ejecutarse dentro de VisionServe, un contenedor de inferencia publicado por el mismo autor.

El modelo no es un modelo de lenguaje ni un sistema multimodal generativo: es un detector end-to-end NMS-free con 31,9 millones de parametros, entrada fija de 512×512 píxeles y salida de hasta 300 detecciones con 23 canales de logits (22 clases más una entrada `N/A`). Su relevancia es practica: ofrece un artefacto ONNX autocontenido de 114 MB, con licencia Apache-2.0 y un contrato de E/S documentado, listo para desplegar en pipelines de visión por computador sin dependencias de entrenamiento.

La informacion publicada por el autor es deliberadamente operativa (contrato de entrada/salida, formato de exportacion y una advertencia explicita sobre el preprocesado). El punto mas delicado es el conjunto de validacion: solo 62 imagenes, lo que limita la confianza estadistica de la metrica reportada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR (transformer de deteccion end-to-end, NMS-free), variante Small |
| Parametros totales | 31,9 M (100 % entrenables en el fine-tuning) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de deteccion de objetos, no de lenguaje) |
| Tipos de cuantizacion | La exportacion incluida es f32 (float32). El tag `base_model:quantized` apunta a una version cuantizada del modelo base; los tipos concretos no estan disponibles |
| Idiomas soportados | no aplica / no disponible (las etiquetas son nombres de clase, no texto generado) |
| Licencia | Apache-2.0, heredada de RF-DETR (Roboflow); sin pesos de terceros con otras licencias |
| Formato de pesos | ONNX, opset 17 (`model.onnx`, 114 MB) |
| Tamano del repositorio | 0,1 GB |
| Entrada | `input`: `[1, 3, 512, 512]` f32, RGB, reescalado «squash» a 512×512 (sin letterbox ni padding), /255, normalizacion con media/std de ImageNet |
| Salidas | `dets`: `[1, 300, 4]` f32 en formato cxcywh normalizado al input de 512×512; `labels`: `[1, 300, 23]` f32, logits con sigmoid (focal loss, no softmax), NMS-free |
| Numero de clases | 22 clases de tabletop; `labels.txt` tiene 23 lineas (22 nombres en orden de la cabeza + `N/A`) |

## Arquitectura y entrenamiento

RF-DETR es una familia de detectores basada en transformer con asignacion end-to-end, de modo que la salida no requiere supresion de no maximos (NMS). El checkpoint aqui publicado corresponde a la variante Small, con 31,9 M de parametros, y se ha afinado mediante la API `rfdetr.RFDETRSmall(...).train(...)` con el 100 % de los parametros entrenables (configuracion «pf-full» dentro de un barrido de desbloqueo parcial). El ajuste se hizo sobre datos tabletop de ETRI: 185 imagenes de entrenamiento y 62 de validacion para 22 clases, una cantidad muy reducida que conviene tener en cuenta al evaluar la generalizacion.

Una innovacion operativa destacable es la documentacion explicita del preprocesado: el fine-tuning uso `square_resize_div_64=True`, y el `predict()` propio de rfdetr redimensiona con `F.resize(img, [res, res])`, es decir, deformando la imagen al cuadrado. Servir el checkpoint con letterbox constituye un desajuste entrenamiento-inferencia que, segun el autor, se midio en −7,35 mAP sobre un checkpoint hermano de la misma receta. Por eso el contrato de E/S insiste en el «squash, not letterbox». No se documentan en la informacion disponible fases de RLHF, DPO ni decodificacion especulativa, que no aplican a este tipo de modelo.

## Capacidades

- Deteccion de objetos en una sola pasada sobre imagenes RGB de 512×512, con hasta 300 detecciones por imagen.
- Clasificacion en 22 clases de objetos de sobremesa (dominio tabletop de ETRI); la lista exacta de nombres esta en `labels.txt`.
- Deteccion end-to-end sin NMS: la salida `labels` usa sigmoid (focal loss), por lo que el umbralizado y el filtrado de cajas quedan del lado del cliente.
- Coordenadas de caja en formato cxcywh normalizadas al espacio de entrada de 512×512, lo que simplifica la reescalada a las dimensiones originales de la imagen.
- Exportacion ONNX autocontenida (opset 17) apta para runtimes ONNX.
- Integracion con VisionServe mediante los comandos `visionserve pull rfdetr-small-etri` y la variante ampliada `visionserve pull rfdetr-gdino-siglip-etri`, que anade GroundingDINO y re-scoring con SigLIP para vocabulario abierto.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision-lenguaje, audio ni modo «thinking»: no aplican a este modelo.

## Casos de uso

- Robotica de manipulacion sobre mesa: el detector localiza y clasifica los 22 tipos de objetos de sobremesa del dataset ETRI, lo que permite a un brazo robotico seleccionar el objeto correcto a partir de las cajas cxcywh normalizadas y del indice de clase.
- Verificacion de pick-and-place en lineas de montaje: tras cada recogida, una camara fija ejecuta el modelo a 512×512 para confirmar que el objeto retirado coincide con la clase esperada; la ausencia de NMS simplifica el postprocesado en el PLC o en el edge.
- Control de inventario en bandejas y contenedores: con 38 ms por peticion en una RTX A6000, el modelo puede recorrer secuencialmente varias bandejas y contabilizar clases, siempre que los objetos pertenezcan al conjunto de 22 clases entrenado.
- Automatizacion de caja de supermercado o mostrador: deteccion de productos sobre una superficie plana para precargar el ticket; es el escenario mas afin al dominio de entrenamiento (objetos sobre mesa, vista cenital o frontal).
- Preetiquetado de datasets de vision: dado que el modelo es pequeno (114 MB) y rapido, sirve para generar anotaciones iniciales sobre imagenes de tabletop que despues se revisan y corrigen manualmente, acelerando el ciclo de anotacion.
- Despliegue en el edge con VisionServe: el contenedor Docker permite levantar el detector junto a otros componentes (por ejemplo, la variante con GroundingDINO + SigLIP) sin gestionar manualmente el grafo ONNX ni el preprocesado.
- Prototipado rapido en investigacion: al ser un artefacto ONNX de licencia Apache-2.0, se puede integrar en un cuaderno o script para comparar recetas de preprocesado (squash frente a letterbox) y medir su impacto en mAP.

## Benchmarks y rendimiento

Unicos datos publicados por el autor, medidos a traves de VisionServe sobre las 62 imagenes de validacion y en modo letterbox (es decir, antes de la correccion a «squash»):

| Metrica | Valor | Condiciones |
|---|---|---|
| mAP | 85,33 | 62 imagenes de validacion, medicion letterbox, via VisionServe |
| Latencia por peticion | 38 ms | RTX A6000, medicion letterbox |
| Impacto del preprocesado | −7,35 mAP | Desajuste train/serve con letterbox, medido en un checkpoint hermano de la misma receta |

No se han publicado resultados de benchmarks en la informacion disponible para COCO, LVIS, ni comparativas estandarizadas con otros detectores. La metrica de 85,33 mAP procede de un conjunto de validacion de 62 imagenes del mismo dominio de entrenamiento, por lo que no debe interpretarse como una estimacion de rendimiento en datos externos.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero de pesos ocupa 114 MB en f32; con activaciones y buffers de runtime, el consumo se mantiene por debajo de 1 GB en la mayoria de configuraciones (estimacion, no medida por el autor).
- GPU recomendadas: cualquier GPU moderna con soporte ONNX. El autor reporta 38 ms por peticion en una RTX A6000; por el tamano del modelo, tarjetas como RTX 3060, RTX 4090, A100 o H100 lo ejecutan con holgura.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo con mas de 2 GB de VRAM (por ejemplo, GTX 1050 Ti en adelante). Tambien es viable en CPU para cargas de baja frecuencia.
- Opciones de despliegue: VisionServe (contenedor Docker del autor, `visionserve pull rfdetr-small-etri`), y en general runtimes compatibles con ONNX. La informacion proporcionada solo documenta VisionServe.
- Latencia y throughput: 38 ms por peticion en RTX A6000 (dato del autor, medicion letterbox). Esto equivale a unos 26 fotogramas por segundo en flujo unico sobre ese hardware (calculo derivado, no medido).
- Advertencia de despliegue: el preprocesado debe ser «squash» a 512×512 con `/255` y normalizacion ImageNet; usar letterbox degrada la precision de forma medible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| mtbui2010/rfdetr-small-etri-ONNX (este) | 31,9 M | 512×512, 22 clases tabletop | Apache-2.0 | 85,33 mAP en 62 imagenes de validacion ETRI (letterbox) | ONNX, VisionServe, 0 descargas |
| Roboflow/rf-detr-small (modelo base) | 31,9 M (heredado) | 512×512, clases COCO | Apache-2.0 | no disponible en la informacion proporcionada | HuggingFace, es el punto de partida del fine-tuning |
| mtbui2010/rfdetr-gdino-siglip-etri (variante hermana) | no disponible | no disponible | no disponible | no disponible | VisionServe; anade GroundingDINO y re-scoring con SigLIP para vocabulario abierto |
| Otros detectores de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Conjunto de entrenamiento muy reducido: 185 imagenes de entrenamiento y 62 de validacion para 22 clases. El riesgo de sobreajuste es alto y la metrica de 85,33 mAP tiene un intervalo de confianza amplio.
- Dominio cerrado: solo detecta las 22 clases de tabletop de ETRI. Cualquier objeto fuera de esa lista no sera reconocido correctamente; para vocabulario abierto el autor remite a la variante con GroundingDINO + SigLIP.
- Riesgo de desajuste de preprocesado: servir el modelo con letterbox en lugar de «squash» degrada la precision (−7,35 mAP medido en un checkpoint hermano). Es un error facil de cometer con frameworks que aplican letterbox por defecto.
- Salida sin NMS y con sigmoid: las 300 cajas se devuelven sin filtrar. Es responsabilidad del integrador aplicar umbrales de confianza y, en su caso, NMS, asi como descartar la clase `N/A` (indice 22).
- Repositorio sin validacion comunitaria: 0 descargas y 0 «likes» en el momento de la consulta. No hay evidencia de terceros que reproduzcan las metricas.
- Sesgos: no documentados. Al entrenarse sobre un dataset de tabletop de un unico origen (ETRI), es probable que el rendimiento caiga con iluminacion, camaras, fondos o disposiciones distintas de las del conjunto de entrenamiento.
- Alucinacion: no aplica en el sentido generativo, pero si existen falsos positivos y falsos negativos propios de un detector con umbral ajustable.
- Licencia: Apache-2.0, permisiva e incluye uso comercial. No se identifican pesos de terceros con licencias incompatibles. Aun asi, conviene verificar la procedencia y los terminos de los datos ETRI utilizados para el fine-tuning.
- Idioma y texto: el modelo no procesa ni genera lenguaje natural; no hay soporte multilingue que evaluar.
- Produccion: sin versionado de modelo, sin model card extendida sobre datos de entrenamiento y sin informe de evaluacion fuera de dominio. Se recomienda validar en un conjunto propio antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mtbui2010/rfdetr-small-etri-ONNX
- Modelo base: https://huggingface.co/Roboflow/rf-detr-small
- Contenedor VisionServe: https://hub.docker.com/r/mtbui2010/visionserve
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (papers, blogs, repositorios o demos). No hay enlaces adicionales verificables en la informacion disponible.
