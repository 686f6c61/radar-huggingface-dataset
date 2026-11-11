# phyloforfun/lm3_archival_detector__yolo26x_det_1280

## Resumen

lm3_archival_detector__yolo26x_det_1280 es un detector de objetos YOLO26x entrenado específicamente para localizar elementos de archivo (no vegetales) sobre pliegos de herbario digitalizados. Lo desarrolla William N. Weaver en el marco de LeafMachine3, una herramienta de visión por computador orientada a la digitalización masiva de colecciones botánicas. El modelo resuelve un problema concreto de la cadena de procesamiento: separar de forma fiable etiquetas, códigos de barras, reglas, tarjetas de color y otros objetos depositados sobre el pliego antes de aplicar etapas posteriores de segmentación, clasificación o lectura de texto.

Se trata de un detector de una sola etapa basado en la arquitectura YOLO26x con detección end-to-end sin NMS, exportado a múltiples formatos (ONNX, Core ML, TorchScript, OpenVINO) para su uso como primera etapa del pipeline de LeafMachine3. Trabaja a una resolución de entrada de 1280 píxeles con letterbox y distingue nueve clases de objetos de archivo. Es el modelo por defecto de la acción `archival_detector` en LeafMachine3 desde la versión 3.0.0.

Su relevancia actual radica en que automatiza un paso que tradicionalmente requería revisión manual en proyectos de digitalización de herbarios, y lo hace con métricas de detección altas (mAP50 de 0,953 en test) sobre un conjunto de datos construido a partir de 67 proyectos de etiquetado y 8.470 imágenes. No es un modelo de lenguaje ni un modelo generativo: es un componente de visión especializado dentro de una cadena de herramientas científicas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLO26x detect, end-to-end (sin NMS) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantización | no disponible (exportaciones en float32: Core ML fp32; ONNX, TorchScript y OpenVINO según formato estándar) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`best.pt`), ONNX (`model.onnx`), Core ML (`model.mlpackage`), TorchScript, OpenVINO |
| Resolución de entrada | 1280 píxeles, letterbox, RGB |
| Clases | 9: Ruler, Barcode, Colorcard, Label, Map, Envelope, Photo, Attached Item, Weights |
| Pesos base | `yolo26x.pt` (Ultralytics, AGPL-3.0) |
| Fecha de entrenamiento | 2026-11-11 (iteración 2) |
| Tamaño del repositorio | 2,4 GB |
| Descargas | 40 |

## Arquitectura y entrenamiento

La arquitectura es YOLO26x en modalidad de detección end-to-end, es decir, sin supresión no máxima (NMS) en la salida, partiendo de los pesos base `yolo26x.pt` de Ultralytics. El modelo opera sobre imágenes redimensionadas a 1280 píxeles con letterbox en RGB y produce detecciones para nueve clases de elementos de archivo presentes en pliegos de herbario. No se dispone de información sobre el número de parámetros ni la composición interna de la red más allá de la designación YOLO26x.

El entrenamiento se realizó durante 300 épocas sin parada temprana, con programación de tasa de aprendizaje coseno, batch automático, `close_mosaic=30` y un peso de clase `cls_pw=0.5` para mitigar el desequilibrio entre clases. Las aumentaciones incluyen variaciones HSV (0,015/0,7/0,4), rotaciones de 15 grados, traslación 0,1, escala 0,5, cizalladura 2, perspectiva 0,0005, volteos vertical y horizontal con probabilidad 0,5, mosaic 1,0, mixup 0,15, erasing 0,4 y randaugment. El conjunto de datos, denominado LM3_Archival, se construyó el 2026-06-26 a partir de 67 proyectos de Labelbox y 8.470 imágenes, con una partición congelada 80/10/10 (salt `lm3`, hash de clases `53ab3cec0180`). Las imágenes y etiquetas no se distribuyen.

## Capacidades

- Detección de objetos de archivo en pliegos de herbario en nueve clases: regla, código de barras, tarjeta de color, etiqueta, mapa, sobre, fotografía, ítem adjunto y pesas.
- Detección end-to-end sin NMS, lo que simplifica el postprocesado en el pipeline.
- Exportación multiplataforma: ONNX para el runtime por defecto de LeafMachine3, Core ML fp32 para GPU de Apple en macOS, TorchScript para libtorch y OpenVINO para CPU e iGPU de Intel.
- Salida con cajas delimitadoras y confianza por clase, con supresión de cajas duplicadas de la misma clase en la integración de LeafMachine3.
- Generación de un recorte por detección para el consumo por etapas posteriores (`ruler_classifier`, `ruler_cf` y las superposiciones del Reporter).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; es exclusivamente un detector visual.

## Casos de uso

- Digitalización masiva de herbarios: el modelo actúa como primera etapa del pipeline de LeafMachine3 para localizar etiquetas, códigos de barras y reglas sobre cada pliego, permitiendo procesar lotes de miles de imágenes sin intervención manual y alimentar las etapas de segmentación y OCR.
- Extracción de la escala física: la detección de la clase Ruler (AP50 de 0,992 en test) permite a la etapa `ruler_cf` calcular el factor de conversión de píxeles a unidades reales, imprescindible para medir estructuras vegetales.
- Catalogación de códigos de barras: la detección de Barcode (AP50 de 0,994) habilita la lectura posterior del identificador del espécimen y su vinculación con bases de datos de colecciones.
- Control de calidad de la digitalización: la detección de Colorcard y Weights permite verificar que las tarjetas de calibración de color y las pesas de referencia estaban presentes en la captura, requisito habitual en proyectos de imagen científica.
- Separación de material adjunto: la detección de Envelope, Photo, Map y Attached Item permite recortar y archivar por separado los elementos añadidos al pliego, facilitando su revisión curatorial individualizada.
- Integración en aplicaciones de escritorio y servidores heterogéneos: gracias a las exportaciones Core ML, OpenVINO y ONNX, el mismo modelo puede desplegarse en macOS con GPU de Apple, en servidores Intel sin GPU o en infraestructura con onnxruntime, manteniendo resultados equivalentes dentro del redondeo float32.
- Preprocesado para modelos de lenguaje multimodal: los recortes de etiquetas generados por el detector pueden enviarse a modelos de visión-lenguaje para transcribir la información taxonómica del pliego.

## Benchmarks y rendimiento

| Split | mAP50 | mAP50-95 | Precisión | Recall |
|---|---|---|---|---|
| val | 0,973 | 0,797 | 0,955 | 0,947 |
| test | 0,953 | 0,767 | 0,945 | 0,920 |

AP50 por clase en test: Ruler 0,992; Barcode 0,994; Colorcard 0,985; Label 0,959; Map 0,995; Envelope 0,985; Photo 0,982; Attached Item 0,900; Weights 0,788.

No se han publicado resultados comparativos con otros detectores en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del tamaño de YOLO26x y del backend. El repositorio ocupa 2,4 GB e incluye varias exportaciones.
- GPU recomendadas: no especificadas por el autor. Por el tamaño típico de un YOLO26x y la resolución de 1280, se espera que quepa en GPU de consumo, pero no hay datos publicados que lo confirmen.
- Compatibilidad con GPU de consumo: no confirmada en la documentación; la exportación Core ML fp32 está pensada para GPU de Apple en macOS.
- Opciones de despliegue: onnxruntime (runtime por defecto de LeafMachine3), Core ML en macOS, TorchScript con libtorch, OpenVINO en CPU e iGPU de Intel, y Ultralytics para reentrenamiento.
- Latencia y throughput: no disponibles.
- Parámetros de inferencia en LeafMachine3: `conf=0.25`, `iou=0.6`, `max_det=100`, supresión de cajas duplicadas de la misma clase.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Resolución | mAP50 (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| lm3_archival_detector__yolo26x_det_1280 | YOLO26x detección | 9 (archivo) | 1280 | 0,953 | AGPL-3.0 | Hugging Face |
| YOLO genérico de Ultralytics (p. ej. yolo26x) | Detección general | 80 (COCO) | variable | no disponible | AGPL-3.0 | Ultralytics |
| Detectores especializados en herbarios | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos directamente comparables en la misma tarea (detección de elementos de archivo en pliegos de herbario) ni de sus métricas, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para elementos de archivo sobre pliegos de herbario; no es un detector de propósito general y su rendimiento fuera de ese dominio no está caracterizado.
- La clase Weights presenta un rendimiento notablemente inferior (AP50 de 0,788 en test) y Attached Item también baja respecto al resto (0,900), lo que refleja menor volumen de ejemplos (522 y 767 instancias en entrenamiento respectivamente).
- La clase Photo cuenta con muy pocas instancias en entrenamiento (46), lo que limita la robustez de su detección pese al AP50 de 0,982 en test.
- El conjunto de datos de entrenamiento y validación no se distribuye, lo que dificulta la reproducibilidad y la auditoría independiente.
- La licencia AGPL-3.0 impone obligaciones copyleft: el uso en servicios en red puede requerir la publicación del código fuente derivado; es necesario revisar la compatibilidad con el producto antes de un uso comercial.
- No se han publicado análisis de sesgos, robustez frente a dominios de imagen distintos (iluminación, resoluciones, instituciones) ni estudios de fallos en producción.
- El modelo no procesa texto ni lenguaje; cualquier expectativa de transcripción o razonamiento debe cubrirse con etapas posteriores del pipeline.
- Los pesos base de Ultralytics también están bajo AGPL-3.0, lo que condiciona cualquier redistribución o reentrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phyloforfun/lm3_archival_detector__yolo26x_det_1280
- LeafMachine3: https://leafmachine.org
- Ultralytics (framework y pesos base): https://github.com/ultralytics/ultralytics
- Citación: Weaver, W. N. (2026) LeafMachine3.
