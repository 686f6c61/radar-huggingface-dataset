# sonspeed/yolo11-cad-obb-016

## Resumen

yolo11-cad-obb-016 es un detector de objetos con cajas orientadas (oriented bounding boxes, OBB) basado en la arquitectura YOLO11 en su variante m, publicado por el usuario sonspeed en HuggingFace. El modelo está especializado en la detección de símbolos de planos CAD, y constituye una primera etapa (stage-1) de un pipeline de reconocimiento: en lugar de predecir clases finas directamente, agrupa las plantillas de símbolos en 16 super-clases mediante clustering aglomerativo por coseno sobre embeddings de símbolos. La cabeza de clasificación predice por tanto `SuperClass_0` a `SuperClass_15`.

El modelo se distribuye como pesos de Ultralytics (`best.pt`) y está etiquetado también con ONNX, lo que sugiere que puede exportarse a este formato para despliegue. Trabaja con imágenes de 640 píxeles y fue entrenado sin aumentos de datos agresivos (sin mosaic, mixup, rotación, shear, perspectiva, flip ni erasing), lo que apunta a una estrategia de entrenamiento conservadora orientada a preservar la geometría de los símbolos de planos técnicos.

Su relevancia radica en el nicho de digitalización de planos y planos eléctricos/mecánicos, donde la detección de símbolos con orientación importa y donde el enfoque jerárquico (super-clases primero) puede simplificar el etiquetado y mejorar la robustez ante plantillas poco frecuentes. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no declara licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11-m OBB (detector de objetos con cajas orientadas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (etiquetado como ONNX, exportacion no confirmada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `best.pt` (Ultralytics/PyTorch); tag ONNX |
| Tamano de imagen de entrada | 640 |
| Numero de clases | 16 super-clases (`SuperClass_0` a `SuperClass_15`) |
| Tamano del repositorio | 0,1 GB |
| Libreria | ultralytics |
| Pipeline | object-detection |

## Arquitectura y entrenamiento

La arquitectura es YOLO11 en variante m con cabeza OBB, es decir, un detector de una sola etapa que predice cajas delimitadoras orientadas (con angulo) en lugar de cajas alineadas a los ejes. Esta eleccion es coherente con el dominio: los simbolos de planos CAD suelen aparecer rotados y las cajas axis-aligned introducen solapamiento y ruido en la etiqueta. El modelo se entrena sobre imagenes de 640 px y devuelve, para cada deteccion, clase, caja orientada y confianza.

El detalle mas relevante del entrenamiento es la definicion de clases. En lugar de entrenar sobre las plantillas finas de simbolos, el autor aplico un clustering aglomerativo con similitud coseno sobre embeddings de simbolos y fusiono las clases resultantes en 16 super-clases. Esto convierte a este checkpoint en un stage-1: detecta la categoria gruesa del simbolo, presumiblemente para que un stage-2 posterior realice la clasificacion fina. No se especifica el numero de tokens ni el volumen del dataset de entrenamiento, ni si se aplicaron tecnicas de RLHF/DPO (no aplicables a un detector). Tampoco se documentan las clases concretas del dataset original ni el criterio exacto del umbral de clustering.

Se indica explicitamente que no se uso mosaic, mixup, rotacion, shear, perspectiva, flip ni erasing como aumentos. Esto reduce la varianza artificial de las muestras y probablemente busca que el modelo no invente orientaciones que no existen en los planos reales, aunque a costa de una menor generalizacion ante dominios visuales distintos.

## Capacidades

- Deteccion de objetos con cajas orientadas (OBB) sobre imagenes de 640 px.
- Clasificacion en 16 super-clases de simbolos CAD (`SuperClass_0` a `SuperClass_15`).
- Prediccion de angulo de orientacion por objeto, adecuada para simbolos rotados en planos.
- Exportacion potencial a ONNX (segun los tags del repositorio), pensada para inferencia en produccion.
- Integracion directa con la libreria Ultralytics mediante `YOLO('best.pt')` y `model.predict(..., task='obb')`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No tiene capacidades multilingues ni de vision generativa; es exclusivamente un detector discriminativo.
- No dispone de modo thinking ni de salidas multimodales (audio, video generativo, etc.).

## Casos de uso

- Digitalizacion de planos electricos: detectar simbolos (interruptores, tomas, luminarias) con su orientacion real para reconstruir el esquema en formato vectorial. La cabeza OBB encaja con simbolos rotados en planos escaneados.
- Extraccion de informacion de planos mecanicos: localizar componentes representados por plantillas normalizadas antes de un reconocimiento fino posterior (stage-2), reduciendo el espacio de busqueda por categoria.
- Automatizacion de inventario de simbolos en proyectos CAD: procesar lotes de imagenes de planos y generar un recuento por super-clase para tareas de presupuestacion o control de calidad.
- Preprocesado para OCR tecnico: aislar regiones con simbolos y evitar que un motor de OCR interprete glifos de simbolos como texto.
- Control de calidad en la revision de planos: comparar la deteccion de simbolos esperados frente a los presentes y marcar discrepancias.
- Investigacion en vision para documentos tecnicos: usar el checkpoint como baseline reproducible de YOLO11-m OBB sobre super-clases agrupadas por similitud de embeddings, y comparar con alternativas sin clustering.
- Anotacion asistida: pre-etiquetar grandes volumenes de planos con las 16 super-clases para acelerar el etiquetado humano antes del refinamiento fino.
- Despliegue en edge para digitalizacion de campo: al ser un YOLO11-m, puede exportarse a ONNX u otros runtimes ligeros y ejecutarse en dispositivos con recursos limitados, segun la confirmacion de la exportacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye mAP, precision, recall ni comparaciones cuantitativas con otros detectores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia orientativa de la familia YOLO11-m a 640 px, la inferencia suele requerir del orden de 1 a 3 GB de VRAM en FP16, aunque el dato exacto para este checkpoint no esta publicado.
- GPU recomendadas: no especificadas por el autor. La variante m de YOLO11 es compatible con GPUs de consumo (por ejemplo, RTX 3060 en adelante) y con GPUs de datacenter (A100, H100) para lotes grandes.
- Compatibilidad con GPU de consumo: probable por el tamano de la variante m, pero no confirmada en la model card.
- Opciones de despliegue: Ultralytics (nativo), exportacion a ONNX (segun tags), y, en general, cualquier runtime que soporte el grafo ONNX exportado (ONNX Runtime, TensorRT, OpenVINO) si la exportacion es valida.
- Latencia y throughput: no disponibles. Dependen del hardware, del lote y del backend de exportacion elegido.
- CPU: la familia YOLO11 es ejecutable en CPU mediante Ultralytics u ONNX Runtime, con latencias notablemente mayores que en GPU.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Clases | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| sonspeed/yolo11-cad-obb-016 | Deteccion OBB de simbolos CAD | YOLO11-m OBB | 16 super-clases | 640 px | no disponible | HuggingFace |
| YOLO11-OBB oficial (Ultralytics) | Deteccion OBB generica | YOLO11 (n/s/m/l/x) OBB | dataset DOTA (varias) | configurable | AGPL-3.0 / Enterprise | Repos oficiales |
| YOLOv8-OBB (Ultralytics) | Deteccion OBB generica | YOLOv8 OBB | dataset DOTA | configurable | AGPL-3.0 / Enterprise | Repos oficiales |
| RT-DETR | Deteccion de objetos | Transformer (DETR) | dataset COCO | configurable | Apache-2.0 (segun variante) | Repos oficiales |

No se dispone de datos de rendimiento comparativos entre estas opciones en la informacion proporcionada. La diferencia principal de este checkpoint frente a los modelos oficiales de Ultralytics es su especializacion en 16 super-clases de simbolos CAD, su regimen de aumentos reducido y la ausencia de licencia declarada, que lo hace inadecuado para uso comercial sin aclarar la situacion legal.

## Limitaciones y advertencias

- Licencia no declarada: sin una licencia explicita, no se puede asumir permiso para uso comercial, redistribucion ni modificacion. Es un bloqueo relevante para produccion.
- Sesgos conocidos: no documentados. Al entrenarse sin aumentos de flip, rotacion o shear, el modelo puede mostrar un sesgo hacia las orientaciones presentes en el conjunto de entrenamiento original.
- Riesgo de alucinacion: como cualquier detector, puede producir falsos positivos en regiones con textura similar a simbolos. El umbral de confianza debe calibrarse; el ejemplo de la model card usa `conf=0.1`, muy bajo, lo que sugiere un modelo conservador en detecciones.
- Limitaciones de contexto o idioma: no aplican en el sentido de texto, pero si en cuanto a dominio visual: solo esta entrenado para simbolos CAD, no para fotografias naturales ni documentos escaneados genericos.
- Idiomas soportados: no aplica, es un modelo de vision; no se declara nada sobre etiquetas de texto multilingues.
- Sin datos de entrenamiento publicados: no se especifica el tamano del dataset, la fuente de las imagenes ni el criterio de clustering, lo que dificulta reproducir el entrenamiento o estimar la generalizacion.
- Super-clases opacas: no se documenta que representa cada `SuperClass_0`..`SuperClass_15`, lo que complica su uso directo en produccion sin un mapeo adicional.
- Version 016: el sufijo sugiere una iteracion experimental; conviene tratar el checkpoint como un baseline en evolucion y no como un artefacto estable.
- Repositorio sin descargas ni likes: no hay senal de validacion por parte de la comunidad en la fecha de consulta.
- Producion: la ausencia de licencia, benchmarks y documentacion de clases son caveats importantes antes de integrarlo en cualquier pipeline critico.

## Enlaces

- HuggingFace: https://huggingface.co/sonspeed/yolo11-cad-obb-016
- Ultralytics (libreria y modelos YOLO11): https://github.com/ultralytics/ultralytics
- Documentacion de Ultralytics sobre tareas OBB: https://docs.ultralytics.com/tasks/obb/
- No se han encontrado en la busqueda web papers, blogs, repos adicionales ni demos asociados especificamente a este modelo.
