# ArgoSA/D-FINE-seg

## Resumen

D-FINE-seg es una familia de modelos de visión por computador en tiempo real desarrollada por ArgoSA (Argo AI) que unifica en una sola base de código cuatro tareas: detección de objetos, segmentación de instancias, segmentación semántica y estimación de keypoints/pose. Se distribuye en cinco tamaños (N, S, M, L y X) y se apoya en la arquitectura D-FINE, un detection transformer (DETR-style) con decodificación end-to-end que evita la necesidad de NMS posterior. El repositorio de Hugging Face aloja los pesos liberados; el código, las tablas completas de benchmarks y la documentación viven en el repositorio de GitHub del proyecto.

El modelo resuelve el problema de disponer de un único pipeline para múltiples tareas densas de percepción, algo especialmente relevante en conducción autónoma y robótica, donde detección, segmentación y pose suelen requerir modelos separados. Incluye grafos de despliegue fusionados y listos para producción en ONNX, TensorRT, OpenVINO, CoreML y LiteRT, con latencias end-to-end medidas en una RTX 5070 Ti con TensorRT fp16 y batch 1.

La relevancia actual radica en su relación precisión/latencia: el modelo X alcanza 84,84 mIoU en Cityscapes a 1024x2048 nativos con 14,6 ms end-to-end, superando a Mask2Former-Swin-L con 6,4 veces menos latencia y una cuarta parte de los parámetros. La licencia es mixta: el código es Apache 2.0, pero los pesos entrenados con Cityscapes heredan términos no comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detection transformer (DETR-style, familia D-FINE) con cabezas de máscara, segmentación semántica y keypoints |
| Parametros totales | N: 3,36 M; S: 7,99 M; M: 15,95 M; L: 24,97 M; X: 56,3 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión; entrada de imagen 1024x2048 en segmentación semántica y 640 en keypoints COCO) |
| Tipos de cuantizacion | fp16 (TensorRT); no se detallan otras cuantizaciones en la información disponible |
| Idiomas soportados | en (etiquetas y documentación en inglés) |
| Licencia | Código Apache 2.0; pesos Cityscapes no comerciales (`apache-2.0-code--cityscapes-non-commercial-weights`) |
| Formato de pesos | PyTorch (.pt); grafos exportados a ONNX, TensorRT, OpenVINO, CoreML y LiteRT |

## Arquitectura y entrenamiento

D-FINE-seg sigue el paradigma de detection transformer de D-FINE: un conjunto de queries produce directamente cajas sin necesidad de supresión no máxima, lo que simplifica el despliegue end-to-end. Sobre esa base se añaden tres cabezas especializadas: una cabeza de máscara ligera de estilo Mask-DINO para segmentación de instancias, una cabeza sin queries para segmentación semántica y una cabeza de keypoints que predice K puntos por detección (con puntuaciones de presencia y visibilidad) refinada por un decoder de keypoints con un token por punto.

Los pesos liberados cubren dos dominios principales. Por un lado, cinco checkpoints de segmentación semántica entrenados en Cityscapes a resolución nativa 1024x2048, con inicializaciones que provienen de COCO (modelo N) o de obj2coco (S/M/L/X). Por otro, un checkpoint S entrenado 40 épocas sobre keypoints de persona de COCO (17 puntos). La información disponible no detalla el volumen de tokens de entrenamiento ni si se emplearon técnicas de RLHF/DPO, algo esperable al no tratarse de un modelo generativo de lenguaje. El proyecto también publica pesos de detección en COCO, tanto planos como preentrenados con Objects365, y de segmentación de instancias en COCO.

## Capacidades

- Detección de objetos end-to-end sin NMS, con salida directa de cajas a partir de queries.
- Segmentación de instancias mediante cabeza de máscara ligera de estilo Mask-DINO.
- Segmentación semántica con cabeza sin queries, hasta 19 clases en Cityscapes.
- Estimación de keypoints y pose: 17 puntos por persona en COCO, con presencia y visibilidad por punto; la cabeza es genérica y aprende los puntos definidos por las etiquetas.
- Soporte de cuatro tareas con un único flag de configuración (`task: detect | segment | sem_seg | kpts`).
- Cinco tamaños de modelo (N/S/M/L/X) con pesos preentrenados para cada tarea.
- Exportación y despliegue en ONNX, TensorRT, OpenVINO, CoreML y LiteRT con grafos fusionados.
- Capacidades multilingües: no aplica; el modelo procesa imágenes y las etiquetas están en inglés.
- No dispone de tool calling, agentes ni modos de razonamiento: es un modelo puramente perceptivo.

## Casos de uso

- Percepción en conducción autónoma: segmentación semántica de escenas urbanas a 1024x2048 nativos con 14,6 ms end-to-end en el modelo X, adecuada para pipelines de tiempo real sobre vídeo de cámara frontal.
- Detección y seguimiento de peatones y vehículos: la cabeza de detección sin NMS simplifica el postprocesado y reduce la latencia en sistemas embebidos de a bordo.
- Análisis de pose en vídeo: el checkpoint S de keypoints COCO ofrece 65,4 AP con 2,10 ms end-to-end, útil para monitorización de personas, ergonomía o análisis deportivo.
- Segmentación de instancias en inspección industrial: la cabeza de máscara permite delimitar objetos individuales en cadenas de producción para control de calidad automatizado.
- Robótica móvil y navegación: la segmentación semántica permite clasificar suelo, obstáculos y estructuras con un modelo de 3,36 M de parámetros (variante N) desplegable en dispositivos de borde.
- Despliegue en dispositivos de borde: los grafos exportados a CoreML y LiteRT permiten ejecutar la familia en hardware Apple y Android respectivamente, con variantes N y S por debajo de 7 ms.
- Preentrenamiento para dominios propios: los pesos de Cityscapes y COCO sirven como inicialización para datos de conducción u outdoor propios, reinicializando las cabezas de clase al cambiar `label_to_name`.

## Benchmarks y rendimiento

Segmentación semántica en Cityscapes (val, 1024x2048 nativos, TensorRT fp16, batch 1, RTX 5070 Ti):

| Modelo | Params (M) | mIoU | Pixel acc | Engine ms | e2e ms |
|---|---:|---:|---:|---:|---:|
| D-FINE-seg-N | 3,36 | 77,99 | 96,03 | 3,02 | 4,21 |
| D-FINE-seg-S | 7,99 | 81,12 | 96,47 | 5,38 | 6,37 |
| D-FINE-seg-M | 15,95 | 81,41 | 96,55 | 7,42 | 8,26 |
| D-FINE-seg-L | 24,97 | 83,80 | 96,93 | 8,98 | 9,77 |
| D-FINE-seg-X | 56,3 | 84,84 | 97,10 | 14,18 | 14,64 |
| YOLO26x-sem | 40,13 | 83,58 | 96,79 | 10,37 | 13,58 |
| EfficientViT-L2 | 52,61 | 83,20 | 96,87 | 9,56 | 19,87 |
| Mask2Former-Swin-L | 215,46 | 83,33 | 96,91 | 64,51 | 94,07 |
| SegFormer-B5 | 84,61 | 81,41 | 96,62 | 38,81 | 42,12 |

Keypoints de persona en COCO val2017 (640, TensorRT fp16, batch 1, RTX 5070 Ti):

| Modelo | Keypoint AP | AP50 / AP75 | Person box AP | e2e ms |
|---|---:|---:|---:|---:|
| D-FINE-seg S (40 épocas) | 65,4 | 88,0 / 71,1 | 64,2 | 2,10 |
| YOLO26s-pose (300 épocas, init Objects365) | 62,7 | 85,8 / 68,8 | 54,3 | 2,16 |

Los resultados están declarados por el autor y no verificados de forma independiente (`verified: false` en el model-index).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de parámetros (3,36 M a 56,3 M) y el uso de fp16, la huella es reducida y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: RTX 5070 Ti es la referencia de las mediciones publicadas; para producción en servidor se puede escalar a A100 o H100, aunque no hay cifras publicadas para esas GPUs.
- Cabe en GPU de consumo: sí; las variantes N y S están pensadas para tiempo real incluso en hardware de borde.
- Opciones de despliegue: ONNX Runtime, TensorRT, OpenVINO, CoreML y LiteRT, con grafos fusionados end-to-end.
- Latencia y throughput: 4,21 ms (N) a 14,64 ms (X) end-to-end en segmentación semántica; 2,10 ms en keypoints S, todo con TensorRT fp16 y batch 1.

## Comparativa con modelos similares

| Modelo | Params (M) | Tarea principal | mIoU Cityscapes | e2e ms | Licencia |
|---|---:|---|---:|---:|---|
| D-FINE-seg-X | 56,3 | Seg. semántica multi-tarea | 84,84 | 14,64 | Pesos Cityscapes no comerciales |
| YOLO26x-sem | 40,13 | Seg. semántica | 83,58 | 13,58 | No disponible en la información |
| Mask2Former-Swin-L | 215,46 | Seg. semántica/instancias | 83,33 | 94,07 | No disponible en la información |
| SegFormer-B5 | 84,61 | Seg. semántica | 81,41 | 42,12 | No disponible en la información |

En keypoints, D-FINE-seg S supera a YOLO26s-pose en AP (65,4 frente a 62,7) y en caja de persona (64,2 frente a 54,3) con latencia ligeramente inferior (2,10 frente a 2,16 ms), aunque el modelo de YOLO se entrenó 300 épocas con inicialización en Objects365 frente a las 40 épocas de D-FINE-seg S.

## Limitaciones y advertencias

- Los pesos entrenados con Cityscapes heredan términos no comerciales; para uso comercial hay que partir de los pesos COCO u obj2coco, no de los de Cityscapes.
- Un modelo afinado a partir de los pesos Cityscapes sigue derivando de Cityscapes y conserva la restricción no comercial.
- Los resultados de benchmarks están declarados por el autor y marcados como no verificados; las cifras de latencia dependen de la GPU (RTX 5070 Ti), del backend (TensorRT fp16) y del batch 1.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y detecciones espurias en escenas fuera de distribución.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; los datasets de entrenamiento (Cityscapes, COCO) tienen sesgos geográficos y demográficos propios.
- Limitaciones de dominio: los pesos liberados están entrenados para escenas urbanas (Cityscapes) y personas (COCO); el rendimiento en otros dominios requiere afinamiento.
- Idiomas: el modelo no procesa texto; las etiquetas y la documentación están en inglés.
- El checkpoint de keypoints solo está disponible en tamaño S; los tamaños mayores están anunciados pero no liberados.
- La cabeza de keypoints requiere etiquetas de puntos compatibles con YOLO-pose o COCO para reentrenar.

## Enlaces

- Hugging Face: https://huggingface.co/ArgoSA/D-FINE-seg
- Repositorio GitHub: https://github.com/ArgoHA/D-FINE-seg
- Demo interactiva: https://dfine-seg.argoai.space
- Paper (arXiv:2602.23043): https://arxiv.org/abs/2602.23043
- Paper D-FINE (arXiv:2410.13842): https://arxiv.org/abs/2410.13842
- Paper COCO (arXiv:2206.02777): https://arxiv.org/abs/2206.02777
- Benchmark Cityscapes: https://github.com/ArgoHA/cityscapes-benchmark
- Vídeo tutorial: https://youtu.be/_uEyRRw4miY
- Colab: https://colab.research.google.com/drive/1ZV12qnUQMpC0g3j-0G-tYhmmdM98a41X?usp=sharing
- Licencia: https://github.com/ArgoHA/D-FINE-seg#license
