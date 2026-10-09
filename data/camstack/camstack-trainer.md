# camstack/camstack-trainer

## Resumen

CamStack trainer es el contenedor de entrenamiento que la plataforma CamStack (documentada en camstack-docs.zentik.app) ejecuta sobre una GPU en la nube, inicialmente en Modal, para reentrenar su detector raiz basado en YOLOv9 con los fotogramas anotados por el propio operador. No se trata de un modelo de pesos publicados, sino de un paquete de software de ajuste fino: recibe un job en formato JSON y un archivo de dataset, entrena, evalua el candidato contra la linea base y exporta todos los formatos que consumen los nodos CamStack (ONNX, OpenVINO FP16, OpenVINO INT8 y Core ML FP16). El repositorio se publica en HuggingFace con la libreria `ultralytics` y cero descargas registradas en el momento de la consulta.

El valor del proyecto esta en el contrato de entrada y salida que impone: esquemas versionados (`camstack.training/v1` y `camstack.training-result/v1`), verificacion por SHA-256 del dataset, division por camaras completas o dias completos (nunca por fotograma aleatorio), mezcla de una porcion fija de COCO val2017 para evitar el olvido catastrofico de la cabeza de 80 clases, y eventos de progreso estructurados en stdout con codigos de salida definidos (0 correcto, 64 job invalido, 65 dataset inutilizable, 70 error interno).

Es relevante para equipos que despliegan vision por computador en produccion y necesitan un ciclo de reentrenamiento reproducible, auditable y con puertas de calidad automaticas, en lugar de scripts de entrenamiento ad hoc. La licencia AGPL-3.0 condiciona por completo su uso comercial, ya que el propio autor declara que cualquier modelo ajustado con esta herramienta es un derivado de Ultralytics.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv9 (implementacion de Ultralytics); red convolucional de deteccion de objetos |
| Parametros totales | no disponible (depende de la variante base `YOLO(.pt)` indicada en `job.json`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | OpenVINO FP16, OpenVINO INT8 (calibrado con los fotogramas de entrenamiento del usuario, con letterbox identico al runtime), Core ML FP16; ONNX estatico en precision original |
| Idiomas soportados | no disponible (no aplica a deteccion de objetos) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pt` (PyTorch), `.onnx` (opset 13, estatico), OpenVINO `.xml`/`.bin`, Core ML `.mlpackage` |
| Libreria declarada | `ultralytics` |
| Pipeline en el Hub | `object-detection` |
| Entradas del contenedor | `/data/job.json` (esquema `camstack.training/v1`), `/data/dataset.tar` (`camstack.retrain-export/v2|v3`), volumen `/cache` |
| Salidas del contenedor | `/data/out/bundle.tar` (todos los artefactos), `/data/out/result.json` (esquema `camstack.training-result/v1`) |
| Codigos de salida | 0 correcto · 64 job invalido · 65 dataset inutilizable · 70 error interno |

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLOv9 en su implementacion de Ultralytics, invocada como `YOLO(.pt).train(...)`. El contenedor no define la red: la hereda de los pesos base que el job especifica, junto con los hiperparametros de entrenamiento (epocas, batch, `lr0`, `freeze`, `patience` y semilla). El entrenamiento se organiza en seis etapas: preparacion y conversion del archivo a formato YOLO con identificadores COCO-80, replay de una porcion fijada de COCO val2017, entrenamiento supervisado, exportacion multiformato, evaluacion contra la linea base y empaquetado final.

El preprocesamiento impone reglas estrictas que afectan a la calidad del resultado. Las cajas de las categorias vehiculo y animal necesitan una etiqueta COCO asignada o el fotograma completo queda excluido del entrenamiento; las cajas marcadas como `model_error` se aprenden como fondo. La division del dataset se hace por camaras enteras o por dias enteros, nunca por fotograma aleatorio, lo que evita la fuga de informacion entre entrenamiento y validacion cuando los fotogramas de una misma camara son altamente correlacionados. La mezcla de COCO val2017 actua como mitigacion del olvido catastrofico sobre la cabeza de 80 clases preentrenada.

La evaluacion usa el arnes propio de CamStack (codigo vendorizado desde `scripts/eval/`), ejecutando la linea base y el candidato con el mismo preprocesado y decodificacion que el pool de inferencia, sobre los fotogramas completos de holdout. La regla D739 propone umbrales de confianza por clase. La puerta de calidad INT8 descarta ese formato cuando su mAP50 cae mas de `int8Gate.maxMap50Drop` por debajo de FP16. Un formato opcional que falla se descarta registrando el motivo; si falla ONNX, el job completo se considera fallido. Los registros solo contienen recuentos, nunca rutas de fotogramas ni nombres de camara.

## Capacidades

- Ajuste fino de un detector YOLOv9 sobre datasets anotados propios exportados por CamStack (`camstack.retrain-export/v2` y `v3`).
- Conversion automatica del export propietario a disposicion YOLO con identificadores COCO-80 y verificacion de integridad por SHA-256.
- Division del dataset por camaras completas o dias completos, con soporte de fotogramas identificados por camara.
- Replay de una porcion fijada de COCO val2017 para preservar el rendimiento en las 80 clases originales.
- Entrenamiento configurable: epocas, batch, `lr0`, `freeze`, `patience` y semilla.
- Exportacion a cuatro formatos de despliegue: ONNX estatico (opset 13), OpenVINO FP16, OpenVINO INT8 calibrado con los datos del usuario y Core ML FP16.
- Evaluacion comparativa linea base frente a candidato con el mismo preprocesado y decodificacion del runtime de inferencia.
- Propuesta automatica de umbrales de confianza por clase mediante la regla D739.
- Puerta de calidad para INT8 basada en la caida de mAP50 respecto a FP16.
- Empaquetado con catalogo por variante: un `ModelCatalogEntry` por formato, con URLs relativas y revisiones.
- Publicacion de eventos de progreso estructurados (`CAMSTACK_EVENT {json}`) con `v: 1` y marca temporal en milisegundos.
- Ejecucion en contenedor Docker amd64 con soporte CUDA o directamente con `pip install ".[train,export]"`.

## Casos de uso

- Reentrenamiento del detector raiz de una instalacion de camaras: el operador anota fotogramas de sus propias camaras, la plataforma lanza el contenedor en una GPU cloud y obtiene pesos adaptados a esa escena concreta sin salir del flujo de CamStack.
- Adaptacion a condiciones de iluminacion o clima especificos: al dividir por dias completos, el modelo se puede especializar en turnos nocturnos o condiciones de lluvia sin contaminar la validacion con fotogramas del mismo dia.
- Despliegue en hardware de borde: la exportacion a OpenVINO INT8 y Core ML FP16 permite llevar el detector a nodos con CPU Intel o Apple Silicon, y la puerta de calidad descarta automaticamente la cuantizacion INT8 si degrada el mAP50 mas de lo permitido.
- Control de regresion de modelos en produccion: la evaluacion compara el candidato con el modelo que las camaras ejecutan actualmente, de modo que una actualizacion solo se promueve si supera a la linea base en el holdout.
- Ajuste de umbrales de confianza por clase: la regla D739 propone limites por categoria, util cuando una instalacion necesita reducir falsos positivos en clases criticas sin reentrenar.
- Deteccion de clases personalizadas manteniendo el catalogo COCO: escenarios que necesitan distinguir vehiculos o animales concretos etiquetados sobre la cabeza de 80 clases, con el replay de COCO evitando perder el resto de categorias.
- Auditar el motivo de fallo de un reentrenamiento: la salida incluye el resumen de entrenamiento, el reparto del dataset, la comparacion con la linea base y una fila por artefacto con su SHA-256, incluso cuando el job termina en error.
- Integracion en un pipeline de MLOps propio: al ser un contenedor con contrato de ficheros y eventos JSON en stdout, se puede orquestar desde cualquier planificador que monte volumenes y exponga una GPU, sin acoplarse a la plataforma CamStack.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye tablas de mAP, latencia ni comparaciones numericas en la model card, y el repositorio registra cero descargas y cero valoraciones en el momento de la consulta. La unica referencia de rendimiento es funcional: la puerta de calidad INT8 compara el mAP50 del candidato cuantizado con el del FP16 usando el parametro `int8Gate.maxMap50Drop`, pero no se publica el valor de ese umbral ni resultados concretos.

## Requisitos de hardware

- Entrenamiento: contenedor Docker `linux/amd64` con soporte CUDA y ejecucion mediante `--gpus all`; el autor indica que la plataforma lo lanza en GPU cloud, con Modal como primer proveedor.
- VRAM estimada: no disponible. El autor no publica cifras. Como referencia orientativa de la familia YOLOv9 en Ultralytics, las variantes pequenas con `imgsz` 640 y batch moderado suelen entrenar en GPUs de 8 a 16 GB, mientras que las variantes mayores y los lotes grandes requieren 24 GB o mas; el dato exacto depende de la variante base, el batch y el tamano de imagen fijados en `job.json`.
- GPU recomendadas: no disponibles en la informacion proporcionada. Una GPU de centro de datos como A100 o H100 es la opcion coherente con un entrenamiento en la nube; en el extremo de consumo, una RTX 4090 de 24 GB es la candidata mas probable para lotes moderados, pero el autor no lo confirma.
- Inferencia: los artefactos exportados (ONNX, OpenVINO, Core ML) pueden ejecutarse en CPU o GPU sin necesidad de CUDA, orientados a los nodos CamStack.
- Opciones de despliegue: Docker con `docker build --platform linux/amd64 --build-arg TRAINER_REVISION=main` y `docker run --gpus all`; alternativamente, ejecucion directa con `pip install ".[train,export]"` en un entorno con PyTorch. Para solo convertir un export: `python -m camstack_train dataset --export camstack-retrain.tar --out ./yolo-dataset`. Motores orientados a modelos de lenguaje como vLLM, llama.cpp, Ollama o TGI no aplican a este componente.
- Pruebas: `pip install ".[test]" && pytest` no requiere torch, Ultralytics ni OpenVINO.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

El objeto publicado no es un modelo de pesos, sino una herramienta de ajuste fino, por lo que la comparacion se establece con los marcos y detectores que cubren la misma funcion. No hay datos de rendimiento publicados para CamStack trainer, de modo que las columnas de precision quedan como no disponibles.

| Alternativa | Desarrollador | Tipo | Licencia | Exportaciones | Observaciones |
|---|---|---|---|---|---|
| CamStack trainer | camstack | Contenedor de ajuste fino sobre YOLOv9 | AGPL-3.0 | ONNX, OpenVINO FP16/INT8, Core ML FP16 | Contrato JSON, evaluacion contra linea base y puerta de calidad INT8 integradas; 0 descargas |
| Ultralytics (YOLOv8/YOLO11) | Ultralytics | Marco de entrenamiento y deteccion | AGPL-3.0 | ONNX, OpenVINO, Core ML, TensorRT, TFLite y otros | CamStack trainer se apoya en este marco; ofrece CLI y API mas generales, sin el contrato de job ni la evaluacion especifica de CamStack |
| YOLOv10 | Universidad de Tsinghua | Detector sin NMS | AGPL-3.0 | ONNX y otros | Propuesta de deteccion sin supresion no maxima; no integrado en el flujo CamStack |
| RT-DETR | Baidu (PaddleDetection) | Detector transformer en tiempo real | Apache-2.0 | ONNX, TensorRT y otros | Licencia permisiva, alternativa a la familia YOLO cuando el copyleft de AGPL es un impedimento |

## Limitaciones y advertencias

- Licencia AGPL-3.0 con efecto derivado declarado: el propio autor afirma que el contenedor importa Ultralytics (AGPL-3.0) y que cualquier modelo ajustado con el es un derivado de Ultralytics, por lo que el uso comercial queda sujeto a las obligaciones de copyleft del proyecto.
- El repositorio se presenta como la Corresponding Source de toda imagen construida a partir de el, incluido el Dockerfile, lo que refuerza las obligaciones de publicacion de fuentes.
- Sin benchmarks publicados: no hay datos de mAP, latencia ni comparaciones numericas que permitan estimar la calidad del ajuste antes de ejecutarlo.
- Sin comunidad registrada: cero descargas y cero valoraciones, sin issues ni discusion publica que sirvan de contraste.
- Idiomas no declarados, aunque el campo no aplica a un detector de objetos.
- Sesgos conocidos: no disponibles. El sesgo dependera por completo del dataset anotado por el operador y de la porcion fija de COCO val2017 usada en el replay.
- Riesgo de olvido catastrofico mitigado solo parcialmente: el replay de COCO reduce la perdida de las 80 clases originales, pero no la elimina si el dataset propio es muy distinto o muy grande.
- Descarte silencioso de datos: las cajas de vehiculo o animal sin etiqueta COCO hacen que el fotograma completo quede fuera del entrenamiento, lo que puede reducir el conjunto de forma no evidente para el usuario.
- Las cajas marcadas como `model_error` se aprenden como fondo, lo que puede introducir un sesgo sistematico si esa anotacion se usa de forma inconsistente.
- Riesgo de alucinacion: no aplica en el sentido de los modelos de lenguaje, pero si existe riesgo de falsos positivos y falsos negativos propios de la deteccion, acotado por los umbrales de confianza propuestos.
- Un fallo en la exportacion a ONNX invalida el job completo; los demas formatos opcionales se descartan registrando el motivo.
- Los registros solo contienen recuentos, nunca rutas de fotogramas ni nombres de camara, lo que limita la depuracion detallada a partir de la salida estandar.
- La model card indica fechas de creacion y actualizacion del 8 de octubre de 2026, posteriores a la fecha de consulta; conviene verificar la vigencia del repositorio antes de integrarlo.
- Requiere acceso a una GPU CUDA para el entrenamiento; no se documenta un modo de entrenamiento solo en CPU.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/camstack/camstack-trainer
- Documentacion de CamStack: https://camstack-docs.zentik.app
- Ultralytics (dependencia declarada, AGPL-3.0): https://github.com/ultralytics/ultralytics
- Esquemas citados en la model card: `schemas/job.schema.json` y `schemas/result.schema.json` dentro del propio repositorio
- La busqueda web realizada no devolvio resultados relevantes para este modelo; los enlaces recuperados correspondian a software de presentaciones religiosas y plantillas de contratos de prestamo, sin relacion con el proyecto.
