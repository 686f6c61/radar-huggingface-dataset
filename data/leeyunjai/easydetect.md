# leeyunjai/easydetect

## Resumen

easydetect es un paquete de pesos de detectores de objetos en tiempo real publicado por el desarrollador leeyunjai (usuario de Hugging Face y GitHub con perfil de ingeniería de software embebido y visión por computador). No se trata de un único modelo, sino de un repositorio que empaqueta cinco variantes de detector (de 4M a 62M de parámetros), un segmentador MobileSAM exportado a ONNX y una red de keypoints propia, todo con el objetivo de que el paquete `pip install easydetect` funcione sin que el usuario tenga que descargar ni convertir nada a mano.

El interés técnico está en el formato de distribución: cada variante se sirve en tres artefactos equivalentes —OpenVINO IR (`.xml` + `.bin`) para CPU, GPU o NPU de Intel, ONNX (`.onnx`) para ONNX Runtime en cualquier CPU (incluida una Raspberry Pi) y el checkpoint PyTorch (`.pt`) para reentrenar—, de modo que el mismo detector corre en un portátil con NPU Intel o en un dispositivo embebido sin GPU. Los pesos COCO son los checkpoints oficiales de D-FINE (Peng et al., arXiv:2410.13842) convertidos sin modificar, con backbone HGNetv2 y decodificador DETR de 3, 4 o 6 capas.

La relevancia práctica es doble: por un lado, licencia Apache-2.0 de extremo a extremo (código, pesos COCO y modelos ajustados), lo que evita las restricciones AGPL habituales en la familia YOLO; por otro, la predicción es end-to-end sin NMS que ajustar, con mAP50-95 en COCO entre 42,8 y 55,8 según variante y latencias de decenas de milisegundos en hardware de consumo. El repositorio tiene 2,6 GB y, en el momento de la consulta, cero descargas y cero likes, por lo que carece todavía de validación por parte de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DETR con refinamiento de distribución (D-FINE); backbone HGNetv2 (B0, B2, B4, B5) y decodificador de 3, 4 o 6 capas; predicción de cajas end-to-end sin NMS |
| Parámetros totales | ed-n: 4M · ed-s: 10M · ed-m: 19M · ed-l: 31M · ed-x: 62M · red de pose: 3,7M · MobileSAM: no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen de 640 × 640 píxeles, según el ejemplo de `ed-s`) |
| Tipos de cuantización | no disponible (se distribuyen pesos OpenVINO IR, ONNX y `.pt`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no aplica: 80 clases COCO con etiquetas en inglés en `labels.txt`) |
| Licencia | Apache-2.0 (código, pesos COCO y modelos ajustados); anotaciones COCO bajo CC BY 4.0; MobileSAM Apache-2.0 |
| Formato de pesos | OpenVINO IR (`.xml` + `.bin`), ONNX (`.onnx`), checkpoint PyTorch (`.pt`) |
| Tarea | Detección de objetos (`pipeline_tag: object-detection`), segmentación (MobileSAM, `task="segment"`) y keypoints (`task="pose"`) |
| Clases | 80 clases COCO en los modelos base |
| Dataset de entrenamiento (base) | COCO 2017 (pesos D-FINE originales) |
| Tamaño del repositorio | 2,6 GB |
| Librería | `easydetect` (con extra `easydetect[train]` para entrenamiento) |

## Arquitectura y entrenamiento

Las cinco variantes COCO son checkpoints oficiales de D-FINE, el trabajo de Yansong Peng, Hebei Li, Peixi Wu, Yueyi Zhang, Xiaoyan Sun y Feng Wu (arXiv:2410.13842), liberados bajo Apache-2.0 en el repositorio Peterande/D-FINE y convertidos sin cambios por el autor de este repositorio. D-FINE pertenece a la familia DETR: un backbone convolucional HGNetv2 extrae características y un decodificador transformer refina las consultas de objetos hasta producir el conjunto final de cajas y clases, de forma que no hace falta aplicar supresión de no máximos (NMS). El paquete solo elimina el caso residual de dos cajas sobre un mismo objeto cuando su IoU supera 0,7. La escala del backbone y la profundidad del decodificador varían por variante: B0 con 3 capas en ed-n y ed-s, B2 con 4 capas en ed-m, B4 con 6 capas en ed-l y B5 con 6 capas en ed-x.

Junto a los detectores, el repositorio incluye dos componentes auxiliares. `mobile_sam/` contiene MobileSAM (Apache-2.0, ChaoningZhang/MobileSAM) exportado a ONNX mediante `tools/convert_sam.py` en dos grafos (encoder y decoder): recibe las cajas detectadas y delinea el objeto contenido en cada una. `pose/` contiene una red de keypoints propia de 3,7M de parámetros, entrenada con `tools/train_pose.py` sobre los keypoints de persona de COCO 2017 (CC BY 4.0) partiendo del backbone de ed-s; sitúa los 17 keypoints corporales de COCO a partir de una caja de persona. No se documentan en la información disponible ni el número exacto de tokens/imágenes vistas, ni la composición detallada del dataset, ni si hubo etapas de RLHF/DPO (no aplicables en detección), ni detalles del proceso de destilación o refinamiento de D-FINE más allá de su artículo.

## Capacidades

- Detección de objetos en tiempo real sobre 80 clases COCO (persona, vehículo, animales, utensilios, mobiliario, etc.).
- Predicción end-to-end sin NMS: la red emite directamente su conjunto de cajas, lo que simplifica el postprocesado y el despliegue.
- Cinco puntos de la curva precisión/latencia (4M a 62M de parámetros) para elegir según el presupuesto de cómputo.
- Ejecución en CPU, GPU y NPU Intel vía OpenVINO, y en CPU genérica vía ONNX Runtime (caso de uso declarado: Raspberry Pi).
- Lectura de vídeo en streaming: el paquete expone `model.predict(0, stream=True, show=True)` para webcam o fuente de vídeo, con salida por consola/ventana y guardado de resultados.
- Segmentación de instancias: MobileSAM recibe las cajas del detector y devuelve la máscara del objeto (`task="segment"`).
- Estimación de pose: red de 17 keypoints sobre cajas de persona (`task="pose"`), con OKS AP 0,637 usando cajas etiquetadas y 0,588 usando cajas de ed-s, leyendo además cada persona en espejo.
- Ajuste fino con dataset propio: `model.train(data="data.yaml", epochs=50, imgsz=640)` sobre cualquier variante y exportación posterior a OpenVINO.
- Compatibilidad con el formato `data.yaml` de tipo imágenes/etiquetas (exportaciones de Roboflow funcionan tal cual) y herramienta web (`easydetect-lab`) para recolectar, etiquetar y entrenar.
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües ni comprensión semántica de lenguaje natural: es exclusivamente un modelo visual.

## Casos de uso

- **Analítica de vídeo en tienda física:** contar personas y medir flujos por zona con ed-s o ed-m a 640 × 640; la ausencia de NMS simplifica el pipeline y las decenas de milisegundos por fotograma permiten procesar varias cámaras en una sola CPU.
- **Control de calidad en línea de producción:** reentrenar ed-m o ed-l con imágenes de la propia fábrica (`model.train` + `data.yaml`) para detectar piezas defectuosas o mal posicionadas, y exportar a OpenVINO IR para ejecutar en el PC industrial con NPU y liberar la CPU para el PLC.
- **Detección en dispositivos embebidos sin GPU:** desplegar el `.onnx` con ONNX Runtime en una Raspberry Pi, donde el modelo más pequeño (4M de parámetros) es la opción natural y no requiere instalar PyTorch.
- **Pre-etiquetado de datasets:** usar ed-x como generador de cajas iniciales sobre imágenes nuevas y corregirlas manualmente; reduce el trabajo de anotación antes de un ajuste fino supervisado.
- **Edición de imagen asistida por objeto:** combinar la caja del detector con MobileSAM para obtener la máscara de la persona o el producto seleccionado y aplicarla a un pipeline de retoque, sustitución de fondo o recorte automático.
- **Análisis ergonómico o deportivo con pose:** aplicar `task="pose"` sobre las cajas de persona detectadas por ed-s para extraer los 17 keypoints y calcular ángulos articulares, posturas o repeticiones en vídeo.
- **Automatización de aforos y seguridad en transporte:** contar viajeros que suben o bajan de un autobús con las variantes pequeñas en NPU, manteniendo los fotogramas en el dispositivo (sin envío a la nube).
- **Inspección con dron o cámara remota:** detección de vehículos, ganado o cultivos sobre fotogramas capturados, con ajuste fino sobre imágenes aéreas y exportación a ONNX para el equipo de vuelo.

## Benchmarks y rendimiento

Resultados COCO publicados en la model card (mAP50-95 sobre las 80 clases):

| Variante | Backbone | Capas del decodificador | Parámetros | COCO mAP50-95 |
|---|---|---|---|---|
| ed-n | HGNetv2-B0 | 3 | 4M | 42,8 |
| ed-s | HGNetv2-B0 | 3 | 10M | 48,5 |
| ed-m | HGNetv2-B2 | 4 | 19M | 52,3 |
| ed-l | HGNetv2-B4 | 6 | 31M | 54,0 |
| ed-x | HGNetv2-B5 | 6 | 62M | 55,8 |

Latencia de extremo a extremo de `ed-s` a 640 × 640 en un Intel Core Ultra 5 250K Plus:

| Dispositivo | Latencia | Throughput |
|---|---|---|
| CPU | 36 ms | 28 FPS |
| NPU | 38 ms | 26 FPS (CPU libre) |

Red de pose propia, OKS AP sobre COCO val2017:

| Configuración | OKS AP |
|---|---|
| Cajas etiquetadas (ground truth) | 0,637 |
| Cajas predichas por ed-s | 0,588 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de lenguaje, por tratarse de un modelo de visión.

## Requisitos de hardware

- **VRAM estimada (estimación a partir del número de parámetros, no medida):** ed-n ~16 MB de pesos en FP32; ed-s ~40 MB; ed-m ~76 MB; ed-l ~124 MB; ed-x ~248 MB. Con activaciones a 640 × 640 y lote 1, todas las variantes quedan por debajo de 1 GB de memoria, por lo que no se requiere GPU dedicada.
- **Cabe en GPU de consumo:** sí, cualquier GPU consumer con 4 GB o más (RTX 3050, RTX 4060, RTX 4090) resulta sobrada; también en iGPU y NPU integradas.
- **GPU de centro de datos:** A100, H100 o L40S no son necesarias para inferencia; tendrían sentido para entrenamiento o ajuste fino con lotes grandes.
- **Casos sin GPU:** CPU x86 con OpenVINO (36 ms por imagen con ed-s en el equipo de referencia) y CPU genérica con ONNX Runtime, incluida Raspberry Pi con el `.onnx`.
- **Aceleradores Intel:** NPU de los Core Ultra vía OpenVINO IR (38 ms con ed-s), con la ventaja de dejar la CPU libre para el resto de la aplicación; `Detector(..., device="AUTO")` selecciona CPU, GPU o NPU automáticamente.
- **Opciones de despliegue:** paquete `easydetect` con OpenVINO y ONNX Runtime (sin PyTorch en la instalación ligera), exportación a OpenVINO IR, ONNX Runtime, y `huggingface_hub.snapshot_download` para traer solo la carpeta necesaria. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo.
- **Latencia y throughput:** 28 FPS en CPU y 26 FPS en NPU con ed-s en el hardware citado; no se publican cifras de las demás variantes ni de GPU en la información disponible.

## Comparativa con modelos similares

| Modelo | Familia | Parámetros | mAP50-95 COCO | Licencia | Formatos disponibles |
|---|---|---|---|---|---|
| easydetect ed-s | D-FINE (DETR) | 10M | 48,5 | Apache-2.0 | OpenVINO IR, ONNX, `.pt` |
| easydetect ed-x | D-FINE (DETR) | 62M | 55,8 | Apache-2.0 | OpenVINO IR, ONNX, `.pt` |
| D-FINE original (Peterande/D-FINE) | DETR con refinamiento de distribución | mismos pesos | mismos valores | Apache-2.0 | checkpoints PyTorch; requiere su propio entorno |
| RT-DETR | DETR en tiempo real | no disponible en la información proporcionada | no disponible en la información proporcionada | Apache-2.0 | no disponible en la información proporcionada |
| YOLO (Ultralytics, familia YOLOv8/YOLO11) | CNN de una etapa con NMS | no disponible en la información proporcionada | no disponible en la información proporcionada | AGPL-3.0 (requiere licencia comercial para uso cerrado) | PyTorch, ONNX, TensorRT, OpenVINO |

Diferencias cualitativas verificables: frente a los checkpoints D-FINE originales, easydetect no cambia los pesos, pero añade la conversión a OpenVINO IR y ONNX y una API de inferencia con resize, decodificación y dibujo resueltos. Frente a la familia YOLO, la ventaja declarada es la licencia Apache-2.0 de extremo a extremo y la ausencia de NMS; los números concretos de YOLO no se han verificado en la información disponible. El nombre easydetect coincide con OpenKG-ORG/EasyDetect, un proyecto distinto de detección de alucinaciones en modelos multimodales; no deben confundirse.

## Limitaciones y advertencias

- **Sin benchmarks propios más allá de COCO:** los valores de mAP proceden de los pesos D-FINE originales; no hay evaluación independiente del empaquetado ni de los modelos ajustados.
- **Vocabulario cerrado de 80 clases:** no es un detector open-vocabulary; detectar clases nuevas exige reentrenar con imágenes etiquetadas propias.
- **Sin capacidades de lenguaje:** no procesa texto, no responde preguntas y no soporta tool calling ni agentes; cualquier flujo conversacional debe construirse por encima.
- **Riesgo de falsos negativos y de localización imprecisa** en objetos pequeños, muy ocluidos o con poca luz, habitual en detectores DETR de este tamaño; la documentación no publica curvas por tamaño de objeto ni por clase.
- **Sesgos heredados de COCO:** la distribución de imágenes y anotaciones de COCO 2017 condiciona el rendimiento por región, contexto cultural y tipo de escena; no se documenta ningún análisis de sesgo.
- **Licencia:** el código y los pesos son Apache-2.0 y permiten uso comercial, pero las anotaciones COCO son CC BY 4.0 y las imágenes de los modelos ajustados conservan su propia licencia, lo que puede limitar la redistribución de un modelo derivado.
- **Dependencia de los nombres de carpeta:** el paquete construye las URL de descarga como `<repo>/resolve/main/<name>/<name>.xml`; renombrar o mover archivos rompe la descarga automática (hay que replicar el mismo layout y apuntar `$EASYDETECT_ASSETS_URL`).
- **Poca validación externa:** 0 descargas y 0 likes en el momento de la consulta; el proyecto es de un único autor y no se documentan tests de regresión ni versionado de los pesos.
- **Latencia medida en un solo equipo:** las cifras de 36 ms y 38 ms corresponden a un Core Ultra 5 250K Plus concreto; no se publican mediciones en Raspberry Pi, GPU ni otros procesadores.
- **Tamaño del repositorio:** 2,6 GB en total; conviene usar `allow_patterns` para descargar solo la variante necesaria.
- **Repositorio de terceros:** MobileSAM se incluye exportado por el autor; su licencia Apache-2.0 debe respetarse por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leeyunjai/easydetect
- Perfil del autor en Hugging Face: https://huggingface.co/leeyunjai
- Repositorio del paquete: https://github.com/themakerrobot/easydetect
- Documentación de rendimiento: https://github.com/themakerrobot/easydetect/blob/main/docs/performance.md
- Herramienta web de etiquetado y entrenamiento: https://github.com/themakerrobot/easydetect-lab
- Pesos D-FINE originales: https://github.com/Peterande/D-FINE
- Artículo de D-FINE: https://arxiv.org/abs/2410.13842
- MobileSAM: https://github.com/ChaoningZhang/MobileSAM
- Perfil del autor en GitHub: https://github.com/leeyunjai
- Proyecto homónimo no relacionado (detección de alucinaciones en MLLM): https://github.com/OpenKG-ORG/EasyDetect
