# CaiYuanhao/RSN-RTMPose-X

## Resumen

RSN + RTMPose-X es un modelo de estimación de pose 2D multi-persona con enfoque top-down, desarrollado por CaiYuanhao. Combina la arquitectura RTMPose-X con los refinadores de paso residual (residual-step refiners) del RSN original, atención espacial y confianza condicionada por propuesta. El modelo predice las 17 articulaciones del conjunto COCO a partir de cada recorte de persona detectada previamente.

El RSN original se presentó en ECCV 2020 y ganó el COCO Keypoint Challenge de 2019. Esta variante lo integra en el pipeline de RTMPose-X con el objetivo de mejorar la precisión de localización de keypoints manteniendo una latencia baja. El checkpoint publicado es una calibración de confianza de la época seis, con un AP de 79,124422 en COCO val2017.

Es relevante para pipelines de análisis de vídeo e imagen que requieran estimación de pose precisa en escenarios con múltiples personas, especialmente cuando se dispone de un detector de personas separado (el pipeline de demostración usa YOLOX-S). El repositorio pesa 0,2 GB y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Top-down multi-persona: RTMPose-X con refinadores residuales RSN, atención espacial y confianza condicionada por propuesta |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada por persona de 384 × 288 píxeles) |
| Tipos de cuantizacion | no disponible (checkpoint en FP32/FP16 para inferencia CUDA) |
| Idiomas soportados | en (etiqueta del repositorio; el modelo no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | .pth (PyTorch, cargable con `torch.load(..., weights_only=True)`) |

## Arquitectura y entrenamiento

El modelo sigue un esquema top-down: un detector de personas (YOLOX-S en el pipeline de demostración) localiza a cada individuo y el modelo estima los 17 keypoints COCO sobre cada recorte de 384 × 288 píxeles. Sobre la base de RTMPose-X se añaden refinadores de paso residual inspirados en RSN, atención espacial y un mecanismo de confianza condicionada por propuesta que ajusta la predicción según la calidad de la propuesta de persona.

El entrenamiento se realiza en tres etapas secuenciales (refinamiento espacial, atención y confianza) según la receta publicada en `projects/rsn_rtmpose/train.py`, usando las anotaciones originales de COCO train2017 y MPII. El checkpoint liberado corresponde a la época seis, orientada a la calibración de confianza. La model card no detalla el número total de tokens ni la composición exacta del dataset más allá de COCO y MPII, ni menciona uso de RLHF/DPO (no aplica a este tipo de modelo).

## Capacidades

- Estimación de pose 2D multi-persona con 17 keypoints del esquema COCO.
- Detección de keypoints sobre recortes individuales de persona en imágenes y vídeo.
- Integración con detector de personas externo (YOLOX-S por defecto) para pipelines end-to-end.
- Procesamiento de vídeo (MP4) e imagen (JPG/PNG) con salida anotada.
- Inferencia con flip test y OKS NMS en la evaluación publicada.
- Soporte de FP16 y CUDA Graph en inferencia (usado en la medición de latencia).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües de texto: es un modelo puramente visual.

## Casos de uso

- Análisis deportivo: estimación de posturas de jugadores en vídeo para calcular ángulos articulares y trayectorias, aprovechando la precisión de keypoints (AP 79,12 en COCO val2017) y la capacidad multi-persona.
- Biomecánica y rehabilitación: seguimiento de movimientos de pacientes en grabaciones clínicas, con detección por persona para separar sujetos en escenas con varios individuos.
- Vigilancia y seguridad: detección de caídas o posturas anómalas en flujos de vídeo, usando el pipeline con YOLOX-S para localizar personas y el modelo para estimar la pose.
- Animación y motion capture: extracción de esqueletos 2D desde vídeo para retargeting en herramientas de animación, con latencia de 5,401 ms por persona en RTX A5000.
- Análisis de interacción social: estudio de proximidad y orientación corporal entre personas en entornos controlados, apoyándose en la detección multi-persona.
- Robótica e interacción humano-máquina: percepción de postura de operarios en entornos industriales para seguridad, con despliegue en GPU de gama media-alta.
- Deporte de competición y arbitraje asistido: verificación de posiciones reglamentarias mediante keypoints, con evaluación reproducible sobre COCO.

## Benchmarks y rendimiento

| Modelo | COCO val2017 AP | Latencia de pose por persona |
|---|---:|---:|
| RTMPose-X oficial | 78,818237 | 3,338 ms |
| RSN + RTMPose-X | 79,124422 | 5,401 ms |

Condiciones de evaluación: 5.000 imágenes de COCO val2017, 56 propuestas de persona (H56), flip inference y OKS NMS. Latencia medida en RTX A5000 con FP16, CUDA Graph, batch 1, Conv/BN fusionados y un forward de 384 × 288 por persona. El pipeline interactivo añade YOLOX-S, por lo que el tiempo end-to-end depende del fotograma y del número de personas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por el tamaño del checkpoint (0,2 GB) y la entrada de 384 × 288 por persona, la huella es reducida y cabe en GPUs consumer.
- GPU recomendadas: RTX A5000 (usada en las mediciones), A100, H100 para alto throughput; RTX 4090 y RTX 3090 para uso en producción; GPUs consumer de gama media con FP16.
- Cabe en GPU consumer: sí, por el tamaño del modelo y la resolución de entrada.
- Opciones de despliegue: PyTorch nativo (script `pipeline.py` del repositorio), con soporte de FP16 y CUDA Graph; no se documentan exportaciones a ONNX, TensorRT ni integraciones con vLLM/Ollama/TGI (no aplica a este tipo de modelo).
- Latencia: 5,401 ms por persona en RTX A5000 (FP16, CUDA Graph, batch 1); el tiempo end-to-end depende del detector de personas y del número de individuos por fotograma.

## Comparativa con modelos similares

| Modelo | Tipo | AP COCO val2017 | Latencia por persona | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| RSN + RTMPose-X | Top-down | 79,124422 | 5,401 ms | Apache 2.0 | Hugging Face + GitHub |
| RTMPose-X oficial | Top-down | 78,818237 | 3,338 ms | no disponible en la información | Repositorio RTMPose |
| Otros modelos de pose (ViTPose, HRNet) | Top-down | no disponible | no disponible | no disponible | no disponible |

La comparación directa disponible se limita a RTMPose-X oficial: RSN + RTMPose-X gana 0,306 puntos de AP a costa de 2,063 ms adicionales de latencia por persona en las mismas condiciones de hardware.

## Limitaciones y advertencias

- Depende de un detector de personas externo (YOLOX-S en el pipeline por defecto): errores del detector degradan la estimación de pose.
- Solo predice 17 keypoints del esquema COCO; no cubre otros esquemas (p. ej. manos o rostro detallados).
- Modelo puramente visual: no procesa texto ni soporta instrucciones en lenguaje natural.
- La model card no documenta sesgos demográficos, de género ni de complexión; el rendimiento puede degradarse en posturas atípicas, oclusiones severas o personas de pequeño tamaño en la imagen.
- El checkpoint liberado es una calibración de confianza de la época seis, no necesariamente el mejor checkpoint de entrenamiento.
- La receta de entrenamiento se describe como reproducible solo parcialmente (se indican límites en la guía de entrenamiento).
- Licencia Apache 2.0: permite uso comercial con atribución, pero conviene verificar las licencias de dependencias (YOLOX-S, RTMPose) antes de producción.
- No se han publicado datos de rendimiento fuera de COCO val2017 (MPII u otros dominios) en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/CaiYuanhao/RSN-RTMPose-X
- Demo interactiva: https://huggingface.co/spaces/CaiYuanhao/RSN-RTMPose-X
- Repositorio GitHub: https://github.com/caiyuanhao1998/RSN
- Página del proyecto: https://caiyuanhao1998.github.io/RSN-Project/
- Paper (arXiv): https://arxiv.org/abs/2003.04030
- Guía de entrenamiento: https://github.com/caiyuanhao1998/RSN/tree/master/projects/rsn_rtmpose
- Checkpoint: https://huggingface.co/CaiYuanhao/RSN-RTMPose-X/resolve/main/rsn-rtmpose-x.pth
