# phyloforfun/lm3_leaf_segmenter__yolo26x_seg_1024

## Resumen

`lm3_leaf_segmenter__yolo26x_seg_1024` es un modelo de segmentación de instancias basado en YOLO26x-seg, desarrollado por el autor `phyloforfun` para el proyecto LeafMachine3. Su función es segmentar hojas individuales, peciolos y agujeros (holes) en recortes de hojas procedentes de pliegos de herbario digitalizados. Es el modelo `leaf_segmenter` por defecto en LeafMachine3 a partir de la versión 3.0.0.

El modelo resuelve un problema concreto dentro de un pipeline de digitalización botánica: una vez que el detector de plantas (`plant_detector`) recorta una hoja completa del pliego, este segmentador genera máscaras de instancia para las tres clases mencionadas en coordenadas del recorte, que LeafMachine3 reubica posteriormente al marco del espécimen. Esto permite extraer morfometría foliar de forma automatizada a gran escala.

Técnicamente es un modelo YOLO26x de segmentación end-to-end (libre de NMS), afinado desde los pesos base `yolo26x-seg.pt` de Ultralytics, con entrada de 1024 píxeles en letterbox y salida de máscaras más cajas para tres clases. El repositorio ocupa 2,6 GB e incluye pesos en múltiples formatos (PyTorch, ONNX, TorchScript, OpenVINO, Core ML).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLO26x segment, end-to-end (libre de NMS) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantización | FP32 (Core ML float32); no se documentan otras cuantizaciones explícitas |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`best.pt`), ONNX, TorchScript, OpenVINO, Core ML (mlpackage), Core ML FP32 |

## Arquitectura y entrenamiento

El modelo es un segmentador de instancias YOLO26x con diseño end-to-end, lo que implica que no requiere supresión de no máximos (NMS) en la inferencia. Parte de los pesos base `yolo26x-seg.pt` de Ultralytics (licencia AGPL-3.0) y se afina sobre recortes de hoja individuales a resolución 1024 en letterbox, con entrada RGB y salida de máscaras de instancia y cajas para tres clases: Leaf, Petiole y Hole.

El conjunto de entrenamiento es `LM3_Leaf`, construido el 26 de junio de 2026 a partir de cinco proyectos de segmentación de Labelbox, con 16.895 recortes de hoja individuales y una partición fija 80/10/10 (sal `lm3`, hash de clases `7f2c49ca64d9`). Las imágenes y etiquetas no se distribuyen. La partición de entrenamiento contiene 13.480 imágenes con 14.970 instancias de hoja, 12.246 de peciolo y 10.220 de agujero; validación y test contienen 1.711 y 1.704 imágenes respectivamente. El entrenamiento se planificó a 300 épocas, con parada temprana en la época 237 (paciencia 50) y mejor época en la 197, usando LR coseno, lote de 12, `close_mosaic=15`, `overlap_mask` y `mask_ratio=4`. Las aumentaciones incluyen HSV (0,015/0,7/0,4), rotación de 15 grados, traslación de 0,1, escala de 0,5, cizalladura de 2, perspectiva de 0,0005, volteos vertical y horizontal con probabilidad 0,5, mosaico 1,0, mixup 0,15, copy-paste 0,3, erasing 0,4 y RandAugment.

## Capacidades

- Segmentación de instancias de tres clases (Leaf, Petiole, Hole) sobre recortes de hoja individuales de pliegos de herbario.
- Generación de máscaras y cajas en coordenadas del recorte, que el pipeline reubica al marco del espécimen.
- Inferencia end-to-end sin NMS, lo que simplifica el postprocesado.
- Manejo de múltiples hojas vecinas dentro del recorte: el pipeline conserva la instancia que corresponde a la caja del detector de plantas.
- Exportación a múltiples runtimes: ONNX Runtime (runtime por defecto en LM3), libtorch, OpenVINO (CPU/iGPU Intel), Core ML (dispositivos Apple, incluido FP32 en GPU de Apple).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un modelo puramente visual.

## Casos de uso

- Digitalización masiva de herbarios: integrado en LeafMachine3, segmenta hojas y peciolos de cada recorte generado por el detector de plantas para extraer morfometría foliar de colecciones enteras de forma automatizada.
- Extracción de rasgos morfológicos: las máscaras de Leaf y Petiole permiten medir área, perímetro, longitud del peciolo y proporciones hoja/peciolo, útiles en estudios de variación intraespecífica.
- Detección de daño foliar: la clase Hole segmenta perforaciones en la lámina, lo que sirve para cuantificar herbivoría o daño mecánico en especímenes históricos.
- Pipelines de investigación en biodiversidad: al exportar a ONNX, puede integrarse en flujos de procesamiento por lotes con onnxruntime en servidores sin GPU dedicada.
- Despliegue en estaciones de trabajo con CPU Intel: la exportación a OpenVINO permite ejecutar el segmentador en CPU o iGPU sin GPU NVIDIA.
- Aplicaciones de campo en macOS: la exportación Core ML FP32 permite ejecutar el modelo en la GPU de Apple en portátiles, útil para procesar imágenes in situ.
- Reentrenamiento y adaptación: los pesos PyTorch (`best.pt`) permiten afinar el modelo con nuevas especies o condiciones de imagen usando Ultralytics.

## Benchmarks y rendimiento

Resultados de evaluación con `val` de Ultralytics sobre `best.pt` a 1024 píxeles:

| Split | Box mAP50 | Box mAP50-95 | Mask mAP50 | Mask mAP50-95 | Mask P | Mask R |
|---|---|---|---|---|---|---|
| val | 0,764 | 0,582 | 0,733 | 0,503 | 0,838 | 0,698 |
| test | 0,751 | 0,577 | 0,730 | 0,503 | 0,836 | 0,692 |

AP50 de máscara por clase en test: Leaf 0,932; Petiole 0,827; Hole 0,432. No se han publicado resultados comparativos con otros modelos de segmentación foliar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del tamaño del modelo YOLO26x-seg y del backend (PyTorch, ONNX, OpenVINO, Core ML).
- GPU recomendadas: no se especifican en la información disponible. El modelo se distribuye con exportaciones para CPU/iGPU Intel (OpenVINO), GPU de Apple (Core ML) y ONNX Runtime.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: ONNX Runtime (runtime por defecto en LeafMachine3), libtorch (TorchScript), OpenVINO, Core ML y Ultralytics (PyTorch).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de segmentación foliar o de instancias.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre recortes de hoja individuales de pliegos de herbario; su rendimiento fuera de ese dominio (fotografías de campo, otras resoluciones, otras especies) no está documentado.
- La clase Hole obtiene un rendimiento notablemente inferior (AP50 de máscara 0,432 en test) frente a Leaf (0,932) y Petiole (0,827), por lo que la detección de perforaciones es menos fiable.
- El modelo espera recortes generados por `plant_detector` y puede contener hojas vecinas dentro del recorte; la selección de la instancia correcta recae en el pipeline de LeafMachine3, no en el modelo.
- Licencia AGPL-3.0: impone obligaciones de copyleft para uso en red y puede condicionar el uso comercial propietario; debe revisarse antes de integrarlo en productos cerrados.
- Las imágenes y etiquetas de entrenamiento no se distribuyen, lo que limita la reproducibilidad exacta del entrenamiento.
- No se documentan sesgos demográficos ni de otro tipo, pero la composición del dataset (predominio de un proyecto con 11.531 imágenes y escasa representación de algunas familias, como Icacinaceae con 6 imágenes) puede introducir sesgo hacia las especies y condiciones de imagen sobrerrepresentadas.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos o máscaras incompletas en condiciones de imagen distintas a las de entrenamiento.
- El repositorio pesa 2,6 GB por incluir múltiples formatos de exportación; conviene descargar solo el formato necesario.

## Enlaces

- Hugging Face: https://huggingface.co/phyloforfun/lm3_leaf_segmenter__yolo26x_seg_1024
- Ultralytics YOLO26: no disponible en la información proporcionada
- Repositorio LeafMachine3: no disponible en la información proporcionada
- Paper o blog del modelo: no disponible en la información proporcionada
