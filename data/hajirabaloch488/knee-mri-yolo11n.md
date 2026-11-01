# hajirabaloch488/knee-mri-yolo11n

## Resumen

`knee-mri-yolo11n` es un modelo de deteccion de objetos basado en YOLO11n (la variante nano de Ultralytics) afinado para localizar cuatro estructuras o hallazgos anatomicos en cortes 2D de resonancia magnetica de rodilla: ligamento cruzado anterior (ACL), ligamento cruzado posterior (PCL), menisco y cartilago. Lo desarrolla el usuario `hajirabaloch488` como prototipo academico y se distribuye via HuggingFace con la libreria `ultralytics` y licencia AGPL-3.0.

El modelo parte de los pesos preentrenados `yolo11n.pt` y se ha reentrenado con imagenes del dataset oficial fastMRI de rodilla (single-coil, `reconstruction_rss`) convertidas a PNG de 320x320 en escala de grises, junto con las anotaciones de bounding boxes de fastMRI+ (`microsoft/fastmri-plus`, `knee.csv`). El conjunto de datos es muy reducido: 59 estudios de RM, 534 cortes anotados y 953 cajas, divididos por estudio en 41 train / 9 val / 9 test.

Es relevante como ejemplo de aplicacion de detectores ligeros a imagen medica con recursos limitados, pero sus propios resultados (mAP50 global de 0,212 y mAP50-95 de 0,064) lo sitúan lejos de cualquier uso clinico. El autor lo declara explicitamente como prototipo no validado clinicamente y no apto para diagnostico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n (detector de objetos CNN de una etapa, Ultralytics) |
| Parametros totales | no disponible (variante nano de YOLO11; el autor no publica el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (formato nativo PyTorch `.pt`; compatible con exportaciones de Ultralytics a ONNX, TensorRT, etc., no documentadas por el autor) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pt` (PyTorch, `knee_mri_yolo11n.pt`) |
| Entrada | Imagenes 2D en escala de grises, 320x320 |
| Clases | 4 (`ACL`, `PCL`, `Meniscus`, `Cartilage`) |
| Pipeline | object-detection |

## Arquitectura y entrenamiento

La arquitectura es YOLO11n, la variante mas pequena de la familia YOLO11 de Ultralytics: un detector de objetos de una sola etapa con backbone y neck convolucionales y cabecera de prediccion densa. El autor no detalla modificaciones estructurales respecto al modelo base; se trata de un fine-tuning directo de `yolo11n.pt`. La entrada se fija a 320x320 pixeles en escala de grises, lo que reduce coste computacional a cambio de perder resolucion en estructuras pequenas como menisco y cartilago.

El entrenamiento usa `imgsz=320`, batch 16, hasta 100 epocas con early stopping (mejor epoca en la 30), optimizador AdamW con hiperparametros automaticos y semilla 0. Los datos provienen de 59 estudios fastMRI de rodilla single-coil, con 534 cortes anotados y 953 cajas derivadas de fastMRI+ (`knee.csv`), mapeadas a las cuatro clases. La particion se hace por estudio de RM (41/9/9) para evitar fuga de informacion entre train, validacion y test. No se documenta uso de RLHF, data augmentation especifico ni tecnicas de regularizacion mas alla de las del framework.

## Capacidades

- Deteccion de objetos en cortes 2D de RM de rodilla para cuatro clases: ACL, PCL, menisco y cartilago.
- Salida de bounding boxes con puntuaciones de confianza por clase (formato estandar Ultralytics).
- Inferencia sobre imagenes individuales o lotes mediante `model.predict()`.
- Exportacion potencial a otros formatos via Ultralytics (ONNX, TensorRT, CoreML, etc.), aunque no verificada ni documentada por el autor.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto.
- No tiene capacidades multilingues ni procesamiento de lenguaje.
- No dispone de modo "thinking", vision general, audio ni otras modalidades.

## Casos de uso

- Preetiquetado asistido en anotacion de datasets de RM de rodilla: usar el modelo como generador inicial de cajas para que un radiologo revise y corrija, reduciendo el tiempo de anotacion en proyectos de investigacion.
- Prototipos academicos de deteccion anatomica: servir como linea base reproducible en trabajos que comparen detectores ligeros (YOLO, Faster R-CNN, DETR) sobre fastMRI.
- Filtrado y triaje de cortes en pipelines de investigacion: descartar cortes sin estructuras de interes antes de pasos posteriores de segmentacion o clasificacion.
- Docencia y demostracion de fine-tuning en imagen medica: ejemplo completo de adaptacion de YOLO11n a un dominio especifico con dataset pequeno y particion por paciente/estudio.
- Experimentos de aumento de datos y tecnicas de desbalance: base para estudiar como mejorar clases con pocas instancias (ACL, cartilago) en datasets medicos pequenos.
- Pruebas de integracion en herramientas de anotacion (CVAT, Label Studio) mediante exportacion de predicciones en formato COCO/YOLO.

## Benchmarks y rendimiento

Resultados de test publicados por el autor (83 imagenes, 138 cajas, 9 estudios de RM no vistos):

| Clase | Precision | Recall | mAP50 | mAP50-95 |
|---|---|---|---|---|
| all | 0,288 | 0,312 | 0,212 | 0,064 |
| ACL | 0,286 | 0,357 | 0,203 | 0,043 |
| PCL | 0,461 | 0,435 | 0,393 | 0,144 |
| Meniscus | 0,240 | 0,224 | 0,166 | 0,047 |
| Cartilage | 0,165 | 0,231 | 0,085 | 0,024 |

No se han publicado comparaciones con otros detectores ni resultados en benchmarks estandar (COCO, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; YOLO11n en FP32 a 320x320 requiere tipicamente menos de 1 GB, aunque el autor no publica mediciones.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); tambien funciona en CPU para inferencia puntual.
- Cabe holgadamente en GPU consumer e incluso en dispositivos edge (Jetson Nano/Orin Nano) tras exportacion.
- Opciones de despliegue: Ultralytics Python API (documentada por el autor), y potencialmente ONNX Runtime, TensorRT o TorchServe tras exportacion (no documentado).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | mAP50 (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| knee-mri-yolo11n (este) | no disponible (YOLO11n) | 320x320 gris | 0,212 | AGPL-3.0 | HuggingFace |
| YOLO11n base (Ultralytics) | no disponible | 640x640 RGB | no evaluado en este dominio | AGPL-3.0 | Ultralytics |
| Otros detectores medicos en fastMRI | no disponible | no disponible | no disponible | variable | no disponible |

No se dispone de comparaciones publicadas con alternativas especificas para deteccion de estructuras de rodilla en fastMRI en la informacion proporcionada.

## Limitaciones y advertencias

- Prototipo academico no validado clinicamente; el autor prohibe explicitamente su uso para diagnostico o decisiones medicas.
- Dataset muy pequeno (59 estudios, 534 cortes, 953 cajas): resultados ruidosos y con baja significacion estadistica.
- Rendimiento bajo en terminos absolutos (mAP50 global 0,212; mAP50-95 0,064).
- Solo unos pocos estudios contienen ACL en validacion/test, lo que hace poco fiable la metrica de esa clase.
- Menisco y cartilago son estructuras pequenas y proximas; el modelo las confunde con frecuencia (mAP50 de 0,166 y 0,085).
- Entrenado y evaluado exclusivamente en cortes fastMRI de rodilla a 320x320; probable degradacion con otros escaneadores, protocolos o resoluciones.
- Licencia AGPL-3.0: impone obligaciones de copyleft para uso en red y puede ser incompatible con productos comerciales cerrados.
- Riesgo de sesgo por la composicion del dataset fastMRI (poblacion y protocolos especificos del consorcio).
- No hay informacion sobre calibracion de confianza ni evaluacion de falsos positivos en entornos clinicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hajirabaloch488/knee-mri-yolo11n
- Modelo base Ultralytics YOLO11: https://huggingface.co/Ultralytics/YOLO11
- Repositorio Ultralytics: https://github.com/ultralytics/ultralytics
- Dataset fastMRI: https://fastmri.org/
- Anotaciones fastMRI+: https://github.com/microsoft/fastmri-plus
- Paper fastMRI+: https://arxiv.org/abs/2107.10847
