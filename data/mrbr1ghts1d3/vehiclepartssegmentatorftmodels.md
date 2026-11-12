# MrBr1ghts1d3/VehiclePartsSegmentatorFTModels

## Resumen

VehiclePartsSegmentatorFTModels es una colección de tres modelos de segmentación de piezas de vehículo entrenados sobre el dataset VehicleSeg10K, publicada por el usuario MrBr1ghts1d3 (AlbertRG99 en GitHub). El objetivo es identificar y delimitar 13 clases de partes de un coche (carrocería, matrícula, ruedas, ventanas y puertas delanteras y traseras en ambos lados) a nivel de píxel o de instancia. No es un modelo único, sino un paquete comparativo que permite evaluar tres enfoques distintos con el mismo código de evaluación y el mismo conjunto de test.

Los tres modelos cubren paradigmas diferentes: YOLO26x-seg de Ultralytics (segmentación de instancias, 70,5 M de parámetros), RF-DETR Seg 2XL de Roboflow (segmentación de instancias, 38,4 M de parámetros) y un backbone DINOv3 ViT-L/16 congelado con un decodificador FPN entrenado (segmentación semántica, 5,4 M de parámetros entrenables). El repositorio ocupa 0,3 GB e incluye pesos, scripts de inferencia y un informe técnico en PDF con métricas por pieza, matrices de confusión y análisis de confusión izquierda/derecha.

La relevancia actual reside en la comparación honesta entre familias de modelos (CNN/transformer de detección frente a foundation model con decodificador ligero) sobre una tarea industrial concreta, con métricas reproducibles y un caso de uso claro en inspección de daños, tasación automática y mantenimiento de flotas. El modelo DINOv3 + decoder obtiene el mejor mIoU (91,50) y el mejor mAP50-95 (79,80), mientras que YOLO26x-seg es el más rápido (38 ms/frame) y RF-DETR Seg 2XL queda en un punto intermedio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Tres modelos: YOLO26x-seg (Ultralytics), RF-DETR Seg 2XL (Roboflow), DINOv3 ViT-L/16 congelado + decodificador FPN |
| Parámetros totales | YOLO26x-seg: 70,5 M; RF-DETR Seg 2XL: 38,4 M; DINOv3 + decoder: 0,3 B (backbone congelado) + 5,4 M (decoder) |
| Parámetros activos | No aplica (no son modelos MoE) |
| Longitud de contexto | No aplica (modelos de visión; entrada de imagen a 768 px) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (visión); etiquetas de clase en inglés |
| Licencia | Mixta: YOLO26x-seg AGPL-3.0, RF-DETR Seg 2XL Apache-2.0, DINOv3 + decoder bajo DINOv3 License (solo se distribuye el decoder) |
| Formato de pesos | YOLO26x-seg: `.pt`; RF-DETR Seg 2XL: `.pth`; DINOv3 decoder: `.pt` (21 MB) |

## Arquitectura y entrenamiento

Los tres modelos se entrenaron sobre VehicleSeg10K, con 3.069 imágenes en el split oficial `valid` usado como test. Todos comparten las mismas 13 clases con ids 1–13 (el 0 es fondo solo en el modelo DINOv3) y ninguno se entrenó con volteo horizontal, lo que preserva la semántica izquierda/derecha del vehículo (izquierda desde el punto de vista del conductor, no de la imagen).

YOLO26x-seg se afinó desde los pesos COCO durante 100 épocas a 768 px, batch 12 en 4× RTX 2080 Ti, con `fliplr=0`; se publican los pesos de la última época. RF-DETR Seg 2XL se afinó desde los pesos COCO con `rfdetr` 1.12.0, 50 épocas a 768 px, lr 1e-4 (encoder 1,5e-4), batch efectivo 16 (1 imagen × 4 GPU × 4 pasos de acumulación) en 4× RTX 2080 Ti, sin volteo horizontal; se publican los pesos EMA de la última época. DINOv3 ViT-L/16 + decoder mantiene el backbone DINOv3 congelado y entrena únicamente un decodificador FPN de 5,4 M de parámetros; el backbone está sujeto a acceso restringido en Hugging Face y el repositorio solo distribuye el decoder (21 MB).

No se especifica en la información disponible el número de tokens de entrenamiento (no aplica a visión), la composición detallada del dataset VehicleSeg10K ni si hubo aumento de datos más allá de la desactivación del volteo horizontal. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal, que no aplican a este tipo de modelos.

## Capacidades

- Segmentación de instancias de piezas de coche con 13 clases: carrocería, matrícula, rueda, parabrisas, luna trasera, ventanas y puertas delanteras y traseras izquierdas y derechas.
- Segmentación semántica a nivel de píxel en el modelo DINOv3 + decoder (mapa de etiquetas por imagen, con clase 0 de fondo).
- Distinción izquierda/derecha coherente con la orientación del vehículo, no con la de la imagen.
- Salida de máscaras a resolución completa y puntuaciones de confianza por instancia en YOLO26x-seg y RF-DETR Seg 2XL.
- Evaluación estandarizada con métricas de píxel (mIoU, mAcc, mDice), métricas COCO (mAP50, mAP50-95) y F1 por pieza con umbral de IoU ≥ 0,5 y confianza 0,25.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No incluye modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Inspección de daños en taller: el modelo segmenta cada pieza del coche para asociar abolladuras o arañazos a una parte concreta (por ejemplo, puerta trasera derecha) y generar un presupuesto automático. El mIoU de 91,50 del modelo DINOv3 + decoder permite una localización fiable a nivel de píxel.
- Tasación automática de siniestros: a partir de una o varias fotos del vehículo, se extraen las máscaras de las 13 piezas y se comparan con un estado de referencia para estimar la gravedad del daño por zona.
- Mantenimiento de flotas: procesamiento por lotes de imágenes de vehículos en depósito o entrada de taller para detectar piezas faltantes o sustituidas (por ejemplo, una luna lateral ausente) usando el modelo YOLO26x-seg a 38 ms/frame.
- Control de calidad en línea de montaje: verificación de que todas las puertas y ventanas están correctamente montadas y alineadas, aprovechando la velocidad de YOLO26x-seg (38 ms/frame en RTX 2080 Ti) para inspección en tiempo real.
- Anonimización selectiva de imágenes: uso de las máscaras de matrícula (clase 2) para desenfocar o eliminar la placa antes de publicar imágenes de vehículos, con la ventaja de que el modelo distingue la matrícula del resto de la carrocería.
- Generación de datasets sintéticos y aumentación: las máscaras por pieza permiten recortar y recomponer vehículos para entrenar otros modelos de detección o para crear variaciones controladas en pipelines de datos.
- Investigación comparativa de arquitecturas de segmentación: el repositorio incluye el mismo código de evaluación para tres familias (YOLO, RF-DETR, DINOv3 + FPN), lo que facilita reproducir la comparación en otros dominios verticales.

## Benchmarks y rendimiento

Resultados sobre el split oficial `valid` de VehicleSeg10K (3.069 imágenes), evaluando la última época sin selección de checkpoint:

| Modelo | mIoU | mAcc | mDice | mAP50 | mAP50-95 | Part F1 | ms/frame | GPU | Params | VRAM pico |
|---|---|---|---|---|---|---|---|---|---|---|
| DINOv3 ViT-L + decoder | 91,50 | 95,25 | 95,53 | 92,72 | 79,80 | 93,22 | 1228 ¹ | GTX 1080 Ti | 0,3 B congelado + 5,4 M | – |
| RF-DETR Seg 2XL | 90,57 | 94,43 | 95,03 | 88,50 | 73,89 | 91,24 | 77 | RTX 2080 Ti | 38,4 M | 7,4 GB |
| YOLO26x-seg | 87,91 | 95,51 | 93,53 | 88,03 | 76,19 | 92,04 | 38 | RTX 2080 Ti | 70,5 M | 2,6 GB |
| SAM 3 zero-shot (referencia) | 34,55 | – | – | – | – | – | – | – | – | – |

¹ Medido en float16 sobre GTX 1080 Ti, que no tiene tensor cores; el tiempo no es representativo de una GPU moderna. El script `dinov3_parts.py` usa float32 en esas GPUs.

Las métricas de píxel se calculan con mapa de etiquetas por imagen frente a las máscaras PNG oficiales, sobre 13 clases sin fondo, acumuladas en todo el test. Part F1 cuenta una pieza como encontrada si IoU ≥ 0,5 con umbral de confianza 0,25. mAP es estilo COCO con una máscara por clase e imagen. Los tiempos se miden con batch 1, de imagen decodificada a máscaras a resolución completa.

## Requisitos de hardware

- VRAM estimada para inferencia: RF-DETR Seg 2XL requiere 7,4 GB en RTX 2080 Ti; YOLO26x-seg requiere 2,6 GB en RTX 2080 Ti; el modelo DINOv3 + decoder no reporta VRAM pico en la información disponible (el backbone ViT-L/16 congelado es el componente dominante).
- GPU recomendadas: RTX 2080 Ti (referencia de las mediciones), GTX 1080 Ti (solo para DINOv3 + decoder, sin tensor cores y con latencia no representativa), RTX 4090, A100 y H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: YOLO26x-seg y RF-DETR Seg 2XL caben en GPUs consumer con al menos 8 GB de VRAM; DINOv3 + decoder requiere además acceso al backbone restringido de Facebook.
- Opciones de despliegue: Ultralytics para YOLO26x-seg (`ultralytics>=8.4`), `rfdetr==1.12.0` para RF-DETR Seg 2XL, y PyTorch con `transformers==5.22.2` y OpenCV para DINOv3 + decoder. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de visión de este tipo.
- Latencia y throughput: 38 ms/frame (YOLO26x-seg), 77 ms/frame (RF-DETR Seg 2XL) y 1228 ms/frame (DINOv3 + decoder en GTX 1080 Ti, no representativo). No se reportan medidas de throughput por lotes ni en A100/H100.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | mIoU (VehicleSeg10K) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO26x-seg (este repo) | Instancia | 70,5 M | 87,91 | AGPL-3.0 | Pesos en Hugging Face |
| RF-DETR Seg 2XL (este repo) | Instancia | 38,4 M | 90,57 | Apache-2.0 | Pesos en Hugging Face |
| DINOv3 ViT-L + decoder (este repo) | Semántica | 0,3 B + 5,4 M | 91,50 | DINOv3 License (solo decoder) | Decoder en HF, backbone restringido |
| SAM 3 zero-shot | Semántica promptable | No disponible | 34,55 | No disponible | No disponible |

La comparación con SAM 3 zero-shot procede del propio informe del autor y usa un prompt de texto por pieza sin entrenamiento. No se dispone de datos de otros modelos comparables (por ejemplo, Mask2Former o SegFormer afinados en el mismo dataset) en la información proporcionada.

## Limitaciones y advertencias

- El modelo DINOv3 + decoder depende de un backbone con acceso restringido en Hugging Face; sin solicitar acceso a `facebook/dinov3-vitl16-pretrain-lvd1689m` no se puede ejecutar.
- La licencia es mixta y hereda restricciones: YOLO26x-seg queda bajo AGPL-3.0 (copyleft fuerte, problemático para uso comercial cerrado), RF-DETR Seg 2XL bajo Apache-2.0 y el decoder DINOv3 bajo la DINOv3 License, que hay que revisar antes de uso comercial.
- El modelo distingue izquierda/derecha según el vehículo, no según la imagen, y no se entrenó con volteo horizontal; imágenes espejadas o con orientación invertida pueden degradar la predicción de lados.
- Riesgo de confusión entre piezas simétricas (izquierda/derecha) y entre partes contiguas (puertas y ventanas), documentado en el informe con matriz de confusión; el propio autor incluye un análisis específico de confusión de lados.
- Solo cubre 13 clases de piezas de coche; no generaliza a motos, camiones, autobuses ni a piezas no incluidas en VehicleSeg10K.
- No hay datos publicados sobre sesgos demográficos, geográficos o de iluminación del dataset; el rendimiento en condiciones de baja luz, oclusión severa o ángulos extremos no está cuantificado en la información disponible.
- El tiempo de 1228 ms/frame del modelo DINOv3 se midió en una GTX 1080 Ti sin tensor cores y no es representativo de GPUs modernas; no se aportan cifras en A100/H100.
- No se documentan tipos de cuantización ni formatos optimizados (ONNX, TensorRT, GGUF), lo que limita el despliegue en entornos de borde sin trabajo adicional.

## Enlaces

- Hugging Face: https://huggingface.co/MrBr1ghts1d3/VehiclePartsSegmentatorFTModels
- Repositorio GitHub con código de entrenamiento, predicción y evaluación: https://github.com/AlbertRG99/VehiclePartsSegmentatorFTModels
- Backbone DINOv3 ViT-L/16 (acceso restringido): https://huggingface.co/facebook/dinov3-vitl16-pretrain-lvd1689m
- Paper de referencia citado en los tags (arXiv:2508.04260): https://arxiv.org/abs/2508.04260
- Informe técnico completo: `report/car_part_segmentation_report.pdf` dentro del repositorio de Hugging Face
