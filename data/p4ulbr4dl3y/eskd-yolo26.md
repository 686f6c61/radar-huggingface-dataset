# p4ulbr4dl3y/eskd-yolo26

## Resumen

ESKD vision es un conjunto de detectores de objetos basados en YOLO26s, desarrollado por el usuario p4ulbr4dl3y, orientado a la detección de elementos estructurales en planos técnicos que siguen las normas rusas ESKD y GOST. El modelo no realiza reconocimiento de texto (OCR), sino que localiza regiones y geometría: marco del plano, cajetín, celdas del cajetín, zonas de vistas, bloques de texto como áreas, flechas y símbolos. Está pensado como herramienta de preetiquetado para acelerar la anotación de planos, no como solución de extracción de contenido.

El repositorio público incluye pesos por tarea (layout, text, arrows, symbols), con distintos estados de entrenamiento. La tarea `layout` está completada (13 clases, 60 épocas) con métricas de mAP50 de 0.995 y mAP50-95 de 0.993 sobre un test sintético de 400 hojas; la tarea `text` está en curso y las tareas `arrows` y `symbols` no se han iniciado. El tamaño del repositorio es de 9.5 GB, lo que refleja la acumulación de checkpoints por época.

La relevancia actual reside en el nicho: la digitalización de planos técnicos industriales con normativa postsoviética carece de modelos públicos especializados, y este proyecto ofrece una base YOLO entrenable y verificable, con licencia AGPL-3.0 derivada de Ultralytics. No obstante, las métricas publicadas corresponden a datos sintéticos y el propio autor advierte que no constituyen una evaluación sobre escaneos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26s (Ultralytics), detector de objetos |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (pesos en `.pt`; exportación a otros formatos no documentada) |
| Idiomas soportados | no disponible (no procesa lenguaje; sin OCR) |
| Licencia | AGPL-3.0 (Ultralytics) |
| Formato de pesos | PyTorch `.pt` (checkpoints por época y `best.pt`/`last.pt`) |

## Arquitectura y entrenamiento

La arquitectura es un detector YOLO26s de Ultralytics, variante pequeña de la familia YOLO26. El entrenamiento se realizó con resolución de 1280 píxeles para la tarea `layout` y 1536 para `text`, batch de 8 (4 para `text`), precisión mixta AMP fp16, optimizador MuSGD con scheduler cosine, aumento `mosaic=0.3`, sin volteos horizontales ni verticales y `close_mosaic=10`. Los checkpoints se sincronizaron a Hugging Face tras cada época, con posibilidad de reanudar desde `last.pt`.

Los datos de entrenamiento proceden del dataset `p4ulbr4dl3y/eskd-drawings-yolo`, de dominio sintético, complementado con verificación sobre 58 imágenes reales seleccionadas. No se documenta el número total de tokens ni la composición exacta del dataset en la información disponible; la model card remite a `DATASET_CARD.md` para el detalle. No se menciona RLHF, DPO ni técnicas de alineación, algo esperable en un detector de objetos.

## Capacidades

- Detección de layout de plano: marco (`frame`), cajetín (`title_block`), celdas del cajetín (`title_cell`), zonas de vistas (`view_detail`) y otras clases estructurales (13 en total).
- Detección de bloques de texto como regiones rectangulares (20 clases en la tarea `text`, actualmente en entrenamiento). No hay OCR ni lectura del contenido.
- Detección de flechas (1 clase, tarea no iniciada).
- Detección de símbolos (5 clases, tarea no iniciada).
- Preetiquetado asistido con umbrales de aceptación y revisión configurables (`accept-conf`, `review-conf`).
- Inferencia por lotes sobre directorios de imágenes con salida en formato COCO (`--coco`).
- Soporte de hasta 3000 detecciones por imagen (`--max-det 3000`), necesario por la densidad de regiones de texto en un plano.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá de la visión.

## Casos de uso

- Preetiquetado de planos para anotación: el modelo genera cajas candidatas con umbrales de aceptación (0.65) y revisión (0.25), y exige la presencia de `frame` y `title_block` para aceptar la imagen, reduciendo el trabajo manual en pipelines de etiquetado.
- Extracción de la región del cajetín: con confianza media de 0.975 en `title_block` sobre imágenes reales, permite recortar el cajetín para posterior OCR o revisión humana, sin que el modelo lea el contenido.
- Segmentación de zonas de vistas: la clase `view_detail` permite delimitar áreas de dibujo para su procesamiento posterior, aunque con confianza media de 0.659 y recomendación de revisión manual y umbral 0.9.
- Indexación y catalogación de archivos de planos: el layout detectado (marco, cajetín, celdas) sirve para clasificar y organizar lotes de planos escaneados por tipo y estructura.
- Control de calidad de digitalización: la ausencia de `frame` o `title_block` en 5 y 3 hojas de las 58 revisadas permite detectar recortes defectuosos o digitalizaciones incompletas.
- Aumento de datos sintéticos: al estar entrenado sobre un dataset sintético, el modelo puede emplearse para validar la calidad de generadores de planos ESKD antes de pasarlos a producción.
- Automatización de flujos CAD/documentales: integración en scripts de preprocesamiento que recortan regiones (cajetín, vistas, texto) para alimentar etapas posteriores de OCR o extracción de metadatos.

## Benchmarks y rendimiento

| Tarea | Clases | Epocas | test mAP50 | test mAP50-95 | Estado |
|---|---:|---:|---:|---:|---|
| layout | 13 | 60/60 | 0.995 | 0.993 | completado |
| text | 20 | 31/80 | no disponible | no disponible | en entrenamiento |
| arrows | 1 | 0/60 | no disponible | no disponible | no iniciado |
| symbols | 5 | 0/80 | no disponible | no disponible | no iniciado |

Las métricas de `layout` corresponden a un test sintético de 400 hojas y, según el autor, no constituyen una evaluación sobre escaneos reales. En la verificación sobre 58 imágenes reales se obtuvieron 2040 objetos detectados en 58/58 imágenes, con confianza media de 0.975 para `title_block`, 0.926 para `title_cell` y 0.659 para `view_detail`; el mAP real no se midió. No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la información disponible, al tratarse de un detector de objetos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Para un YOLO26s a resolución 1280 en fp16, la demanda es moderada y compatible con GPUs de consumo, pero no se aportan cifras concretas.
- GPU recomendadas: no disponible. Por el tamaño del modelo (variante `s`) y la resolución de entrada, cabe en GPUs consumer tipo RTX 3060/4060/4090, aunque el autor no especifica requisitos.
- Resolución de inferencia: 1280 píxeles para `layout`, 1536 para `text`; el aumento de resolución incrementa el consumo de memoria.
- Opciones de despliegue: librería `ultralytics`, script propio `tools/infer.py` y `tools/prelabel.py`; exportación a otros formatos (ONNX, TensorRT, GGUF) no documentada.
- Latencia y throughput estimados: no disponibles.
- Almacenamiento: el repositorio ocupa 9.5 GB por la acumulación de checkpoints por época; para producción basta descargar `best.pt` de la tarea requerida.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ESKD vision (este) | YOLO26s | Detección de layout de planos ESKD/GOST | 1280/1536 px | AGPL-3.0 | Hugging Face público |
| YOLOv8/YOLO11 (Ultralytics) | YOLO | Detección de objetos general | Configurable | AGPL-3.0 | Público, ampliamente usado |
| Detectores de documentos genéricos (LayoutLMv3, Donut) | Transformer multimodal | Comprensión de documentos | 512-1024 px | Varía | Público |
| no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de comparaciones cuantitativas con alternativas en la información proporcionada. La comparativa cualitativa sitúa este modelo como especializado en normativa ESKD/GOST, frente a detectores generalistas que no cubren las clases específicas (`title_block`, `title_cell`, `view_detail`).

## Limitaciones y advertencias

- Dominio sintético: el entrenamiento se basa en planos generados, y los escaneos reales producen un desplazamiento de distribución; las métricas de test sintético no son extrapolables a producción.
- Sin OCR ni reconocimiento del contenido del cajetín: el modelo solo localiza regiones, no lee texto, cotas ni metadatos.
- Confianza no calibrada: los umbrales (0.6-0.7 general, 0.85 para `title_cell`, 0.9 para `view_detail`) son heurísticas hasta calibrar sobre 50-100 planos reales.
- Clase `view_detail` poco fiable: confianza media de 0.659 sobre imágenes reales, con recomendación explícita de revisión manual.
- Máscaras de segmentación aproximadas: para zonas sin polígono se usan rectángulos, lo que limita la precisión de la segmentación.
- Tareas incompletas: `text` en entrenamiento (31/80 épocas), `arrows` y `symbols` sin iniciar; no deben usarse en producción.
- Licencia AGPL-3.0 heredada de Ultralytics: el uso comercial y la distribución de servicios derivados requieren revisar las condiciones; la model card remite a `docs/third-party.md`.
- Riesgo de falsos negativos en hojas mal escaneadas: se detectaron 5 hojas reales sin `frame` y 3 sin `title_block` en la muestra de 58.
- Idiomas: no aplica procesamiento de lenguaje; la documentación y las clases están en ruso e inglés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/p4ulbr4dl3y/eskd-yolo26
- Dataset: https://huggingface.co/datasets/p4ulbr4dl3y/eskd-drawings-yolo
- Repositorio del proyecto: https://github.com/p4ulbr4dl3y/eskd-vision
- Galería de ejemplos: https://github.com/p4ulbr4dl3y/eskd-vision/blob/main/docs/gallery.md
- Documentación de terceros (licencia): https://github.com/p4ulbr4dl3y/eskd-vision/blob/main/docs/third-party.md
- Ultralytics: https://github.com/ultralytics/ultralytics
