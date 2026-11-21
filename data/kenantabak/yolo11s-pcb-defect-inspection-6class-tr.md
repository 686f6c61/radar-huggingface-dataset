# kenantabak/yolo11s-pcb-defect-inspection-6class-tr

## Resumen

El modelo `yolo11s-pcb-defect-inspection-6class-tr` es un detector de objetos basado en la arquitectura YOLO11s de Ultralytics, entrenado de forma específica para la inspección automática óptica (AOI) de placas de circuito impreso (PCB) en líneas de fabricación electrónica. Lo desarrolla Kenan Tabak dentro de la plataforma turca EVREN (SSYZ) y está publicado en Hugging Face con licencia CC BY 4.0. Su cometido es localizar y clasificar seis tipos concretos de defectos de fabricación sobre la superficie de la placa.

El modelo parte de los pesos preentrenados de YOLO11s (variante small, de unos 19,2 MB) y se afina sobre un conjunto de datos propio de PCB con seis clases activas: `missing_hole`, `spur`, `open_circuit`, `mouse_bite`, `spurious_copper` y `short`. Trabaja a una resolución de entrada de 640×640 píxeles y está pensado para integrarse en pipelines de visión industrial, no para tareas de lenguaje natural: es un modelo puramente de visión por computador, aunque la model card declara idiomas `tr` y `en` por la documentación asociada.

Su relevancia actual reside en la combinación de un backbone ligero y ampliamente soportado (Ultralytics YOLO11) con un ajuste fino muy agresivo sobre un dominio estrecho, lo que permite desplegar inspección de defectos en hardware modesto. El autor declara un mAP@50 del 99,15 % en validación, aunque estas métricas no están verificadas de forma independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11s (Ultralytics), detector de objetos de una etapa tipo CNN |
| Parametros totales | no disponible (pesos de 19,2 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 640×640) |
| Tipos de cuantizacion | no disponible (formato nativo `.pt`; exportable a otros formatos vía Ultralytics) |
| Idiomas soportados | tr, en (según metadatos de la model card) |
| Licencia | CC BY 4.0 (el componente de framework Ultralytics queda bajo AGPL-3.0) |
| Formato de pesos | `.pt` (PyTorch, Ultralytics) |

## Arquitectura y entrenamiento

Se trata de un detector de objetos de una sola etapa basado en la familia YOLO11 de Ultralytics, en su variante `s` (small). La arquitectura es una red convolucional con cuello de agregación de características multi-escala, adecuada para detectar defectos de distinto tamaño sobre la placa. El entrenamiento se realizó con el framework Ultralytics sobre el conjunto de datos "Baskılı Devre Kartı (PCB) Üretim Hatası Tespiti (6 Sınıf)" de la plataforma EVREN, calificado por el autor como Grade A.

Los hiperparámetros declarados son: `imgsz=640`, `epochs=50`, `batch=32`, `patience=16`, `cos_lr=True`, con un mejor epoch en 49/50. En aumento de datos se aplicó `mosaic=0.75`, `close_mosaic=12`, `fliplr=0.5`, `flipud=0.5`, `degrees=10.0`, `scale=0.35`, `erasing=0.0`, `hsv_h=0.01`, `hsv_s=0.25`, `hsv_v=0.3`. El autor indica que cada clase está equilibrada con aproximadamente 2.700 cajas y que se desactivó el borrado aleatorio (`erasing=0.0`) para no destruir trazas finas de soldadura y pistas. El coste de entrenamiento declarado es de 0,324 horas-GPU. No se documenta el número de imágenes del dataset ni el volumen total de tokens (no aplica).

## Capacidades

- Detección de objetos en imágenes de PCB con seis clases de defecto: agujero faltante, rebaba, circuito abierto, mordedura de ratón, cobre espurio y cortocircuito.
- Localización con cajas delimitadoras y puntuaciones de confianza por clase.
- Inferencia a resolución fija de 640×640 con umbrales configurables de confianza (`conf`) e IoU (`iou`).
- Ejecución sobre imágenes individuales, lotes o vídeo mediante la API de Ultralytics.
- Exportación a otros formatos de despliegue a través de Ultralytics (ONNX, TensorRT, etc.), aunque el autor no documenta formatos preexportados.
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es un modelo puramente perceptivo.
- No soporta generación de texto ni capacidades multimodales más allá de la detección visual.

## Casos de uso

- Inspección automática óptica (AOI) en línea de fabricación: el modelo se integra tras la cámara de la línea para detectar en tiempo real agujeros faltantes, cortocircuitos y circuitos abiertos, descartando placas defectuosas antes del ensamblaje.
- Control de calidad en lotes de prototipos: se ejecuta sobre imágenes capturadas en mesa de inspección para clasificar y localizar defectos en series cortas, donde entrenar un modelo propio no es rentable.
- Preetiquetado para anotación humana: las detecciones del modelo se usan como propuesta inicial en herramientas de etiquetado, reduciendo el coste de anotar nuevas imágenes de PCB.
- Monitorización de deriva de proceso: al registrar la distribución de clases detectadas por turno, se detectan cambios en la tasa de defectos (por ejemplo, aumento de `spurious_copper`) que apuntan a problemas en el proceso de grabado.
- Integración en sistemas MES/ERP de planta: los resultados de detección se envían a la base de datos de producción para trazabilidad por número de serie de placa.
- Despliegue en equipos de borde: por el tamaño reducido de los pesos (19,2 MB), puede ejecutarse en dispositivos con GPU integrada o CPU junto a la cámara, sin depender de la nube.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| mAP@50 (%) | 99,15 |
| mAP@50-95 (%) | 60,63 |
| Precision (%) | 98,03 |
| Recall (%) | 99,14 |
| F1 (%) | 98,55 |
| Mejor epoch / total | 49/50 |

Rendimiento por clase (declarado por el autor):

| Clase | mAP@50 | Precision | Recall | F1 |
|---|---:|---:|---:|---:|
| `missing_hole` | 99,50 | 99,41 | 99,56 | 99,49 |
| `spur` | 99,43 | 98,49 | 99,59 | 99,04 |
| `open_circuit` | 99,31 | 98,28 | 99,61 | 98,94 |
| `mouse_bite` | 99,22 | 98,37 | 99,29 | 98,83 |
| `spurious_copper` | 99,13 | 96,31 | 98,73 | 97,51 |
| `short` | 97,82 | 97,18 | 97,84 | 97,51 |

No se han publicado resultados de benchmarks frente a otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de los pesos (19,2 MB) y la resolución 640×640, el modelo cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para inferencia en FP32/FP16; tarjetas como RTX 3060, RTX 4060 o superiores son suficientes. Para entrenamiento se emplearon 0,324 horas-GPU, lo que sugiere hardware de gama media.
- Cabe en GPU de consumo: sí, en la práctica totalidad de tarjetas NVIDIA recientes y en muchas integradas.
- Opciones de despliegue: Ultralytics (Python), exportación a ONNX/TensorRT/OpenVINO mediante Ultralytics; no se documenta soporte nativo en vLLM, llama.cpp ni Ollama (no aplica a modelos de visión de este tipo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | mAP@50 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yolo11s-pcb-defect-inspection-6class-tr | no disponible (19,2 MB) | 640×640 | 99,15 % (declarado) | CC BY 4.0 (framework AGPL-3.0) | Hugging Face |
| YOLO11s (base Ultralytics) | no disponible | 640×640 | no disponible | AGPL-3.0 | Ultralytics |
| YOLOv8s (base Ultralytics) | no disponible | 640×640 | no disponible | AGPL-3.0 | Ultralytics |

No se dispone de datos de benchmarks de alternativas específicas para detección de defectos en PCB en la información proporcionada, por lo que la comparación cuantitativa con otros modelos del mismo dominio no está disponible.

## Limitaciones y advertencias

- Las métricas declaradas (mAP@50 99,15 %, F1 98,55 %) no están verificadas de forma independiente; proceden únicamente de la model card del autor.
- El modelo está entrenado sobre un único conjunto de datos de PCB; su generalización a otras fábricas, iluminaciones, cámaras o tipos de placa no está documentada.
- Riesgo de falsos positivos y negativos en defectos visualmente similares (por ejemplo, `spurious_copper` frente a `short`), que pueden requerir ajuste de umbrales en producción.
- No se documentan sesgos específicos, pero al ser un modelo de visión industrial el riesgo principal es la falta de representatividad del dataset de entrenamiento.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero el framework Ultralytics subyacente está bajo AGPL-3.0, lo que impone obligaciones adicionales si se distribuye el software que lo incorpora.
- No se documentan limitaciones de idioma relevantes porque el modelo no procesa texto; los metadatos `tr`/`en` se refieren a la documentación.
- No se especifican requisitos mínimos de calidad de imagen ni condiciones de iluminación para un rendimiento fiable.
- El modelo fue creado y actualizado en noviembre de 2026 según los metadatos; conviene verificar la vigencia de los enlaces y de la plataforma EVREN.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kenantabak/yolo11s-pcb-defect-inspection-6class-tr
- Página del modelo en EVREN: https://evren.ssyz.org.tr/models/u19979974710e/baskili-devre-karti-pcb-6-uretim-kusuru-tespiti-modeli
- Dataset de entrenamiento en EVREN: https://evren.ssyz.org.tr/datasets/u19979974710e/baskili-devre-karti-pcb-uretim-hatasi-tespiti-6-sinif
- Perfil del autor en EVREN: https://evren.ssyz.org.tr/profile/u19979974710e
- Catálogo de datasets de visión por computador en turco: https://huggingface.co/datasets/kenantabak/evren-turkish-computer-vision-316-datasets
- Framework Ultralytics (YOLO11): https://github.com/ultralytics/ultralytics
