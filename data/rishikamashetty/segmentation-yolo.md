# RISHIKAMASHETTY/segmentation-yolo

## Resumen

`RISHIKAMASHETTY/segmentation-yolo` es un repositorio de artefactos de investigación publicado en Hugging Face que acompaña a un manuscrito sobre segmentación de daños sintéticos en pinturas indias. No se trata de un modelo de lenguaje ni de un modelo fundacional, sino de un paquete que contiene checkpoints entrenados de dos detectores-segmentadores de la familia YOLO (YOLOv8s-seg y YOLO11s-seg), junto con logs de entrenamiento, métricas de validación, tablas del artículo y figuras. El autor es el usuario `RISHIKAMASHETTY` y el repositorio ocupa aproximadamente 0,1 GB.

El problema que aborda es la detección y segmentación de daños (posiblemente grietas, manchas o pérdidas de capa pictórica) en pinturas indias, generados de forma sintética sobre imágenes originales. Para ello se entrenaron dos variantes "small" de segmentación de instancias de Ultralytics sobre un dataset propio (`RISHIKAMASHETTY/indian-paintings-synthetic-damage`) con particiones a nivel de par imagen/máscara. La relevancia actual es acotada: sirve como referencia reproducible para quien quiera replicar el experimento o reutilizar los pesos en tareas de conservación patrimonial, no como un modelo generalista.

La información disponible es muy limitada: no hay model card técnica con hiperparámetros completos, no se declara licencia, no hay idiomas ni pipeline definidos, y el repositorio tiene cero descargas y cero likes en el momento de la consulta. Esta ficha refleja exclusivamente lo que el autor documenta en el README y en la estructura del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8s-seg y YOLO11s-seg (CNN detector-segmentador de Ultralytics) |
| Parametros totales | no disponible (variantes "s" de YOLOv8-seg y YOLO11-seg; el autor no publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen a 640 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | checkpoints Ultralytics `best.pt` y `last.pt` (PyTorch) |

## Arquitectura y entrenamiento

Se emplean dos arquitecturas de la familia YOLO en su variante de segmentación de instancias: YOLOv8s-seg y YOLO11s-seg, ambas implementadas en Ultralytics. Son redes convolucionales de una sola etapa que predicen simultáneamente cajas y máscaras poligonales por instancia. El entrenamiento se realizó con los valores por defecto de Ultralytics, 10 épocas, resolución de entrada `imgsz=640` y una partición 80/20 a nivel de par (imagen original y su máscara de daño sintético), con semilla 42. El autor advierte explícitamente que la partición **no** está agrupada por pintura de origen, lo que puede provocar fuga de información entre train y validación si una misma pintura aparece en ambos conjuntos.

Las etiquetas poligonales se generaron a partir de las máscaras binarizadas con umbral 127, extrayendo contornos externos. Todos los daños son sintéticos, es decir, fueron inyectados artificialmente sobre las pinturas originales; no se entrenó con daños reales documentados. El repositorio incluye `environment/` con versiones de Python, torch y ultralytics, y `checksums.txt` con SHA-256 de cada fichero, lo que facilita la reproducibilidad. No se documentan técnicas de aumento de datos más allá de los valores por defecto, ni fases de ajuste fino adicionales, ni destilación.

## Capacidades

- Segmentación de instancias de daños sintéticos en imágenes de pinturas indias, devolviendo máscaras poligonales y cajas por región dañada.
- Detección de daños a resolución 640 px, adecuada para inspección visual asistida.
- Dos variantes entrenadas en paralelo (YOLOv8s-seg y YOLO11s-seg) para comparación controlada.
- Artefactos de evaluación completos: curvas PR/F1, matrices de confusión, métricas por imagen (`per_image_pixel_metrics_val200.csv`), curvas de máscara (`mask_curves.csv`).
- Conjunto de validación fijo de 200 imágenes (`val200_ids.csv`) para comparaciones reproducibles.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un modelo puramente visual y de dominio específico.
- No dispone de modo "thinking", visión general, audio ni generación de texto.

## Casos de uso

- **Conservación patrimonial asistida**: uso de los checkpoints para pre-segmentar daños en fotografías de pinturas indias y priorizar la revisión manual por restauradores; el modelo devuelve máscaras que el especialista puede corregir.
- **Reproducción de experimentos académicos**: los ficheros `paper_tables/`, `paper_figures/` y `checksums.txt` permiten replicar exactamente las tablas 6, 7, 8, A2, B1 y B2 del manuscrito y verificar la integridad de los artefactos.
- **Comparativa de arquitecturas de segmentación**: al incluir YOLOv8s-seg y YOLO11s-seg entrenados con los mismos datos y semilla, sirve para evaluar la evolución entre ambas generaciones en una tarea de nicho.
- **Generación de datasets sintéticos de daño**: el pipeline documentado (binarización a 127, contornos externos, etiquetas poligonales) puede reutilizarse para construir datasets análogos en otros dominios patrimoniales.
- **Prototipado de control de calidad en digitalización**: integración del `best.pt` en un pipeline de escaneo de obras para marcar automáticamente regiones con posible deterioro antes del archivado.
- **Docencia en visión por computador**: el repositorio, con logs, `args.yaml`, curvas y entorno congelado, es un ejemplo completo y verificable de un flujo Ultralytics de segmentación de instancias.
- **Investigación sobre fuga de información en particiones**: la advertencia del autor sobre la partición no agrupada por pintura convierte el repositorio en un caso de estudio sobre cómo afecta el solapamiento de origen a las métricas de validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio contiene tablas del manuscrito (`paper_tables/Tables 6, 7, 8, A2, B1, B2`) y métricas de validación (`metrics.json`, `per_image_pixel_metrics_val200.csv`), pero sus valores numéricos no se incluyen en la información proporcionada, por lo que no se reproducen aquí.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible en la información proporcionada; por el tamaño de las variantes "s" de YOLO-seg, es esperable que quepa en GPUs de consumo, pero el autor no publica mediciones.
- **GPU recomendadas**: no disponibles; el repositorio incluye `environment/` con versiones de torch y ultralytics, pero no especifica el hardware usado en el entrenamiento.
- **Compatibilidad con GPU de consumo**: no confirmada por el autor; las variantes "s" de YOLO suelen ser ligeras, pero no hay dato verificado.
- **Opciones de despliegue**: los pesos están en formato Ultralytics `best.pt`, por lo que el despliegue natural es mediante la propia librería `ultralytics`. No se documenta exportación a ONNX, TensorRT, OpenVINO ni otros formatos.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `RISHIKAMASHETTY/segmentation-yolo` (YOLOv8s-seg / YOLO11s-seg) | CNN segmentación de instancias | no disponible | imagen 640 px | no disponible | Hugging Face, 0 descargas |
| YOLOv8s-seg oficial (Ultralytics) | CNN segmentación de instancias | variante "s" | imagen configurable | AGPL-3.0 (según Ultralytics) | público y ampliamente distribuido |
| YOLO11s-seg oficial (Ultralytics) | CNN segmentación de instancias | variante "s" | imagen configurable | AGPL-3.0 (según Ultralytics) | público y ampliamente distribuido |
| SAM (Segment Anything) | Transformer promptable | variable | imagen + prompts | Apache 2.0 (versión base) | público |

La comparativa con los modelos oficiales de Ultralytics es la más directa: este repositorio aporta pesos ajustados a un dominio muy concreto (daños sintéticos en pinturas indias), mientras que los oficiales son modelos generalistas preentrenados en COCO. No se dispone de datos de rendimiento comparativo verificables en la información proporcionada.

## Limitaciones y advertencias

- **Licencia no declarada**: el repositorio no especifica licencia, lo que impide determinar si el uso comercial está permitido. Además, los modelos derivan de Ultralytics, cuya licencia AGPL-3.0 puede imponer obligaciones adicionales según el uso.
- **Daño sintético, no real**: el modelo se entrenó exclusivamente con daños inyectados artificialmente; su generalización a deterioro real documentado no está validada.
- **Fuga potencial en la partición**: el autor advierte que el split 80/20 no está agrupado por pintura de origen, por lo que las métricas de validación pueden estar infladas por solapamiento entre train y val.
- **Entrenamiento corto**: solo 10 épocas con valores por defecto de Ultralytics, sin búsqueda de hiperparámetros documentada.
- **Dominio muy estrecho**: pinturas indias con daño sintético; no se recomienda su uso fuera de ese dominio sin reentrenamiento.
- **Sin información sobre sesgos**: no se documenta la composición del dataset por tradición pictórica más allá de `dataset_summary_by_tradition.csv`, ni se analizan sesgos por estilo, época o soporte.
- **Riesgo de alucinación de máscaras**: como todo segmentador, puede producir máscaras espurias en regiones sin daño; no se reportan métricas de falsos positivos en la información disponible.
- **Cero tracción**: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación externa por parte de la comunidad.
- **Sin pipeline declarado**: no se especifica `pipeline_tag`, lo que dificulta el descubrimiento y la integración automática en herramientas de Hugging Face.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RISHIKAMASHETTY/segmentation-yolo
- Dataset referenciado por el autor: `RISHIKAMASHETTY/indian-paintings-synthetic-damage` (no se proporciona URL directa en la información disponible)
- Ultralytics (framework de entrenamiento e inferencia): https://github.com/ultralytics/ultralytics
- Documentación de YOLOv8-seg: https://docs.ultralytics.com/tasks/segment/
- Documentación de YOLO11: https://docs.ultralytics.com/models/yolo11/
