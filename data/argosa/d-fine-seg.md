# ArgoSA/D-FINE-seg

## Resumen

D-FINE-seg es una familia de modelos de visión por computador centrada en detección de objetos, segmentación de instancias y segmentación semántica en tiempo real. La desarrolla ArgoSA y se distribuye a través de Hugging Face con pesos PyTorch en formato `.pt`. El núcleo de detección sigue la arquitectura D-FINE (detection transformer con refinamiento iterativo de cajas), mientras que las cabezas de segmentación se han reimplementado desde cero siguiendo el paradigma Mask DINO.

El modelo resuelve el problema de unificar tres tareas de percepción visual en una sola base de código, con un único flag de configuración (`task: detect | segment | sem_seg`), cinco tamaños (N, S, M, L, X) y gráficos de despliegue fusionados para ONNX, TensorRT, OpenVINO, CoreML y LiteRT. Está pensado especialmente para conducción autónoma y escenas de exterior, con entrenamiento sobre Cityscapes a resolución nativa de 1024x2048.

Su relevancia actual radica en la combinación de precisión y latencia: el checkpoint X alcanza 84,84 mIoU en Cityscapes con 14,6 ms end-to-end en TensorRT fp16 sobre una RTX 5070 Ti, superando a Mask2Former-Swin-L con 6,4 veces menos latencia y un cuarto de los parámetros. La versión X declara 56,3 M de parámetros para segmentación semántica y el repositorio ocupa 2,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detection transformer estilo DETR (D-FINE) con refinamiento iterativo de cajas; cabezas de segmentación tipo Mask DINO (instancias) y head sin queries (semántica) |
| Parametros totales | 3,36 M (N) / 7,99 M (S) / 15,95 M (M) / 24,97 M (L) / 56,3 M (X) en segmentación semántica Cityscapes; detección COCO: 3,8 / 10,4 / 19,7 / 31,4 / 62,9 M; instancias COCO: 4,2 / 12,0 / 21,3 / 33,0 / 64,6 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, entrada de imagen 1024x2048 en Cityscapes) |
| Tipos de cuantizacion | FP16 (TensorRT); INT8 en OpenVINO, CoreML y LiteRT |
| Idiomas soportados | en |
| Licencia | other: apache-2.0-code--cityscapes-non-commercial-weights (código Apache 2.0, pesos derivados de Cityscapes no comerciales) |
| Formato de pesos | PyTorch `.pt`; exportación a ONNX, TensorRT, OpenVINO, CoreML y LiteRT |

## Arquitectura y entrenamiento

La familia se construye sobre el núcleo de detección D-FINE, un detection transformer con queries que refina iterativamente las cajas predichas. Sobre esa base se añaden dos cabezas: una cabeza de máscaras ligera inspirada en Mask DINO para segmentación de instancias y una cabeza sin queries para segmentación semántica. Todas las adiciones son solo de entrenamiento, de modo que no introducen sobrecoste en inferencia.

Los pesos publicados cubren detección en COCO (tanto preentrenados directamente como preentrenados en Objects365 y afinados en COCO), segmentación de instancias en COCO y segmentación semántica en Cityscapes a resolución nativa 1024x2048. Los checkpoints semánticos N se inicializan desde COCO y los S/M/L/X desde los pesos obj2coco. El pipeline de exportación fusiona el postprocesador en los gráficos de ONNX, TensorRT, OpenVINO, CoreML y LiteRT. No se detalla en la información disponible el número exacto de tokens o imágenes de entrenamiento, ni si se aplicó RLHF/DPO (no aplicable en un modelo de visión).

## Capacidades

- Detección de objetos con cajas delimitadoras en estilo DETR (queries a cajas).
- Segmentación de instancias con cabeza de máscaras ligera tipo Mask DINO.
- Segmentación semántica por píxel con cabeza sin queries, a resolución nativa 1024x2048 en Cityscapes.
- Cambio de tarea mediante un único flag de configuración (`task: detect | segment | sem_seg`).
- Cinco escalas de modelo (N, S, M, L, X) con pesos preentrenados para cada tarea.
- Exportación multi-backend: ONNX, TensorRT, OpenVINO, CoreML y LiteRT, con postprocesador fusionado.
- Cuantización INT8 en OpenVINO, CoreML y LiteRT; FP16 en TensorRT.
- Seguimiento multiobjeto con ByteTrack.
- Autoetiquetado con SAM3.
- Demo Gradio incluida.
- Capacidades multilingües: no disponible (modelo de visión, sin procesamiento de lenguaje).

## Casos de uso

- Conducción autónoma y asistencia a la conducción: segmentación semántica de escenas urbanas a 1024x2048 con 84,84 mIoU y 14,6 ms end-to-end, adecuada para percepción en tiempo real sobre cámaras de vehículo.
- Detección de peatones, vehículos y señalización: los checkpoints de detección COCO y obj2coco permiten integrar cajas delimitadoras en pipelines de percepción con latencias de milisegundos.
- Segmentación de instancias para conteo y seguimiento: combinada con ByteTrack, permite seguir objetos individuales en vídeo con máscaras por instancia.
- Autoetiquetado de datasets propios: el uso de SAM3 junto con los pesos preentrenados acelera la anotación de imágenes de exterior y escenas de conducción.
- Fine-tuning sobre datos propios de conducción o exterior: apuntando `train.pretrained_model_path` a un checkpoint con distinto `label_to_name`, las cabezas de clase se reinicializan y el resto conserva el entrenamiento previo.
- Despliegue en dispositivos edge: los gráficos LiteRT, CoreML y OpenVINO con cuantización INT8 permiten ejecutar los tamaños N y S en hardware de bajo consumo.
- Control de calidad en líneas de producción o inspección visual: los checkpoints de detección e instancias COCO sirven como base para detectar y segmentar objetos en imágenes industriales.
- Robótica móvil y drones: los modelos S/M ofrecen un equilibrio entre precisión y latencia para percepción embarcada; los pesos afinados en VisDrone superan a YOLO26 en todas las escalas según la model card.

## Benchmarks y rendimiento

Resultados declarados por el autor (Cityscapes validation, TensorRT FP16, batch 1, RTX 5070 Ti, protocolo end-to-end):

| Modelo | Parametros (M) | mIoU | Pixel acc | Engine ms | E2E ms |
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

El autor declara además que, en fine-tuning sobre 640 Cityscapes, el modelo supera a Ultralytics YOLO26 y RF-DETR en F1 de detección y segmentación de instancias, y que en TACO y VisDrone supera a YOLO26 en todas las escalas. Estos resultados adicionales no se acompañan de cifras en la información disponible. Las métricas del model-index figuran como no verificadas (`verified: false`).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Por tamaño de parámetros, los checkpoints N (3,36 M) y S (7,99 M) caben holgadamente en GPUs de consumo; X (56,3 M) requiere bastante menos memoria que modelos de 215 M como Mask2Former-Swin-L.
- GPU recomendadas: RTX 5070 Ti es la GPU usada en los benchmarks oficiales; para producción en servidor se puede emplear A100 o H100, aunque no se publican cifras de latencia en esas GPU.
- Cabe en GPU de consumo: sí, los cinco tamaños semánticos (3,36 a 56,3 M de parámetros) son compatibles con GPUs de consumo; los benchmarks se ejecutaron en una RTX 5070 Ti.
- Opciones de despliegue: PyTorch nativo, ONNX, TensorRT, OpenVINO, CoreML, LiteRT, ByteTrack para tracking y demo Gradio. Instalación mediante `pip install dfine-seg` o `pip install 'dfine-seg[all]'` para todos los backends de exportación.
- Latencia y throughput: en TensorRT FP16, batch 1, RTX 5070 Ti, el rango va de 4,21 ms end-to-end (N) a 14,64 ms end-to-end (X) sobre Cityscapes a 1024x2048. No se publica throughput en lote.

## Comparativa con modelos similares

| Modelo | Parametros (M) | mIoU Cityscapes | E2E ms | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| D-FINE-seg-X | 56,3 | 84,84 | 14,64 | Pesos Cityscapes no comerciales; código Apache 2.0 | Hugging Face + GitHub |
| YOLO26x-sem | 40,13 | 83,58 | 13,58 | no disponible | no disponible |
| EfficientViT-L2 | 52,61 | 83,20 | 19,87 | no disponible | no disponible |
| Mask2Former-Swin-L | 215,46 | 83,33 | 94,07 | no disponible | no disponible |
| SegFormer-B5 | 84,61 | 81,41 | 42,12 | no disponible | no disponible |

D-FINE-seg-X lidera la tabla de los 28 modelos comparados por el autor en mIoU, con +1,26 sobre YOLO26-x y +1,5 sobre Mask2Former-Swin-L, a la vez que reduce la latencia end-to-end en 6,4 veces frente a este último y usa un cuarto de sus parámetros. D-FINE-seg-L iguala o supera a YOLO26-x en todos los ejes según la model card.

## Limitaciones y advertencias

- Licencia mixta: el código es Apache 2.0, pero los pesos derivados de Cityscapes tienen términos no comerciales. Cualquier modelo afinado a partir de esos checkpoints hereda la restricción; para uso comercial hay que partir de los pesos COCO u obj2coco.
- Sesgos: al entrenarse sobre Cityscapes (escenas urbanas europeas) y COCO, el rendimiento puede degradarse en dominios visuales distintos (interiores, imágenes médicas, entornos no viales).
- Riesgo de alucinación: en detección y segmentación se traduce en falsos positivos, cajas mal ajustadas o máscaras incorrectas, especialmente en objetos pequeños, ocluidos o con clases poco representadas.
- Limitaciones de idioma: el modelo no procesa lenguaje; la etiqueta `en` se refiere únicamente a metadatos y documentación.
- Métricas no verificadas: los resultados del model-index figuran con `verified: false`; conviene reproducirlos con el protocolo del autor antes de tomarlos como referencia en producción.
- Resolución de entrada: los checkpoints semánticos están entrenados a 1024x2048 nativa; usarlos a otras resoluciones puede alterar la precisión.
- Datos no disponibles: no se detalla el volumen exacto del dataset de entrenamiento, el esquema de aumento de datos ni los hiperparámetros de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/ArgoSA/D-FINE-seg
- GitHub (código, benchmarks y documentación): https://github.com/ArgoHA/D-FINE-seg
- Benchmark Cityscapes (tabla completa de 28 modelos): https://github.com/ArgoHA/cityscapes-benchmark
- Paper D-FINE-seg (arXiv:2602.23043): https://arxiv.org/abs/2602.23043
- Paper D-FINE (arXiv:2410.13842): https://arxiv.org/abs/2410.13842
- Paper Mask DINO (arXiv:2206.02777): https://arxiv.org/abs/2206.02777
- Tutorial en vídeo: https://youtu.be/_uEyRRw4miY
- Colab: https://colab.research.google.com/drive/1ZV12qnUQMpC0g3j-0G-tYhmmdM98a41X?usp=sharing
- Licencia: https://github.com/ArgoHA/D-FINE-seg#license
