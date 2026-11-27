# Advantech-EIOT/AMD_yolox-pose-m_640x640_A8W8

## Resumen

AMD_yolox-pose-m_640x640_A8W8 es una version cuantizada a INT8 (A8W8) del modelo YOLOX-Pose-m, un detector de poses humanas multi-persona de una sola etapa que localiza la caja delimitadora de cada persona y sus 17 keypoints del conjunto COCO. Lo publica Advantech-EIOT dentro de su linea AMD VisionAI, orientada a despliegue en hardware AMD Ryzen AI con aceleracion NPU. El modelo no ha sido entrenado por Advantech: los pesos proceden del checkpoint oficial de MMPose (OpenMMLab) entrenado sobre COCO keypoints.

La relevancia de esta ficha esta en el proceso de cuantizacion: se parte del modelo FP32 del mismo autor y se aplica cuantizacion post-entrenamiento con AMD Quark 0.11.2, sin reentrenamiento, manteniendo entradas y salidas en FP32 y dejando en FP32 las 15 convoluciones finales de la cabeza y la decodificacion. El resultado es un grafo ONNX con pares QuantizeLinear/DequantizeLinear (QDQ, opset 17), batch 1, resolucion 640x640, sin NMS integrado.

Es un modelo de vision puro, no un LLM: no tiene contexto textual ni capacidades generativas. Su interes practico es el coste computacional reducido en INT8 para tareas de estimacion de pose en tiempo real sobre CPU/NPU de AMD, con una interfaz de tensor muy concreta y documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOX-Pose (detector one-stage con cabeza de keypoints), exportado a ONNX QDQ opset 17 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | INT8 pesos (per-channel), UINT8 activaciones (asimétrica con zero point), bias INT32; entrada y salida en FP32 |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`yolox-pose-m_640x640_a8w8.onnx`), acompanado de `SHA256SUMS` y `LICENSE` |

## Arquitectura y entrenamiento

YOLOX-Pose es un detector de una sola etapa que combina la cabeza de deteccion de YOLOX con una rama de regresion de keypoints, de modo que en una unica pasada obtiene cajas de persona y 17 keypoints COCO por instancia. El checkpoint original es el oficial de MMPose entrenado sobre COCO keypoints; Advantech no ha reentrenado ni ajustado el modelo, solo lo ha exportado y cuantizado.

La cuantizacion se realizo con AMD Quark 0.11.2 (ONNX) a partir del modelo FP32 base. Se aplico calibracion MinMax con 200 imagenes de COCO val2017 (las primeras 200 por nombre de fichero), con letterbox a 640x640 y relleno gris 114, igual que en inferencia. Las 15 convoluciones finales de la cabeza (`out_cls`, `out_obj`, `out_bbox`, `out_kpt`, `out_kpt_vis`) y la decodificacion posterior (priors, strides, sigmoides, exp) permanecen en FP32. No se declara reevaluacion de precision tras la cuantizacion.

La interfaz es fija: entrada `images` F32 de forma `[1, 3, 640, 640]` en NCHW, BGR, rango 0-255 y sin normalizar; salida `output0` F32 de forma `[1, 56, 8400]` con `cx, cy, w, h` en pixeles de entrada, score de persona y 17 tripletas (`x, y, visibility`). El score de persona es sigmoid(clase) x sigmoid(objectness) y la visibilidad de keypoint es una sigmoid. NMS no esta incluido en el grafo. Los metadatos del modelo incluyen `names` y `kpt_shape`.

## Capacidades

- Deteccion multi-persona en una sola pasada, con caja delimitadora por persona.
- Estimacion de 17 keypoints COCO por persona, en el orden de keypoints de COCO.
- Salida de visibilidad por keypoint mediante sigmoid.
- Inferencia cuantizada INT8 con entradas y salidas FP32, apta para pipelines que ya trabajan en punto flotante.
- Ejecucion en hardware AMD Ryzen AI con destino a NPU (segun la model card, AMD P100 : NPU).
- No incluye NMS: el post-procesado (supresion de no maximos) debe implementarse fuera del modelo.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues; no es un modelo de lenguaje.
- No soporta vision general (captioning, VQA) ni audio: solo pose estimation.

## Casos de uso

- Analisis de movimiento deportivo: el modelo entrega 17 keypoints por persona a 640x640 en una sola pasada, suficiente para calcular angulos articulares y trayectorias en sesiones de entrenamiento grabadas o en directo.
- Control de acceso y presencia en entornos industriales: la deteccion de persona con score y caja permite contar personas y verificar posturas en zonas restringidas, con la ventaja del bajo coste INT8 en NPU Ryzen AI.
- Ergonomia y prevencion de riesgos laborales: estimacion de postura de trabajadores en puestos fijos para detectar posturas forzadas, usando la visibilidad por keypoint para descartar articulaciones ocluidas.
- Videovigilancia con post-procesado propio: al no incluir NMS, se integra en un pipeline donde el equipo controla el umbral de score, el NMS y el tracking entre fotogramas.
- Rehabilitacion y fisioterapia asistida: seguimiento de ejercicios con camara RGB estandar, comparando keypoints contra una plantilla de movimiento de referencia.
- Analitica de retail y espacios publicos: conteo y analisis de orientacion corporal de peatones, con la salida `[1, 56, 8400]` procesada en lote de un fotograma por inferencia (batch 1).
- Prototipado en dispositivos AMD: validacion de pipelines de vision cuantizados sobre Ryzen AI antes de pasar a produccion, dado que el modelo esta empaquetado especificamente para ese destino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reclama reevaluacion de precision para esta cuantizacion.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: no disponible en la informacion proporcionada; el repositorio figura con 0.0 GB de tamano, por lo que el peso real del fichero ONNX no consta.
- GPU/NPU recomendadas: el destino declarado es AMD Ryzen AI con NPU (etiqueta "AMD P100 : NPU" en la model card).
- Cabe en GPU de consumo: no disponible; no se documentan requisitos de VRAM ni pruebas en RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: ONNX Runtime (formato ONNX QDQ opset 17, batch 1); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni comparaciones con otros modelos de pose estimation (por ejemplo, variantes FP32 del mismo checkpoint u otros modelos de MMPose), por lo que no es posible establecer una comparativa con cifras verificables.

## Limitaciones y advertencias

- No se ha reevaluado la precision tras la cuantizacion INT8; la model card no aporta metricas de degradacion (AP, PCK) respecto al modelo FP32.
- El modelo no incluye NMS; omitirlo en produccion provoca detecciones duplicadas.
- Interfaz rigida: batch 1, resolucion fija 640x640, entrada BGR sin normalizar y letterbox con relleno 114; cualquier desviacion requiere preprocesado equivalente.
- Solo detecta las 17 keypoints de COCO; no cubre keypoints de manos, cara ni cuerpos completos fuera de ese esquema.
- Los pesos originales se entrenaron sobre COCO keypoints, cuyas imagenes provienen de Flickr bajo licencias diversas; pueden existir sesgos de representacion del dataset en cuanto a genero, edad, etnia y contexto.
- Riesgo de fallo en oclusiones severas, personas muy pequenas o recortadas y escenas con multitud densa, propio de un detector one-stage sin etapa de refinamiento.
- Licencia Apache-2.0 en el codigo y pesos de MMPose, pero la procedencia de las imagenes de entrenamiento (Flickr) debe revisarse para usos comerciales sensibles.
- El modelo esta empaquetado para el stack AMD VisionAI/Ryzen AI; su rendimiento fuera de ese hardware no esta documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Advantech-EIOT/AMD_yolox-pose-m_640x640_A8W8
- Modelo base FP32: https://huggingface.co/Advantech-EIOT/AMD_yolox-pose-m_640x640_FP32
- Pagina del modelo YOLOX-Pose en MMPose: https://github.com/open-mmlab/mmpose/blob/main/configs/body_2d_keypoint/yoloxpose/coco/yoloxpose_coco.md
- Paper YOLO-Pose: https://arxiv.org/abs/2204.06806
- Documentacion de AMD Quark: https://quark.docs.amd.com/
- Licencia de MMPose: https://github.com/open-mmlab/mmpose/blob/main/LICENSE
