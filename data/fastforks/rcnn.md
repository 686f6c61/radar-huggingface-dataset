# fastforks/rcnn

## Resumen

fastforks/rcnn es un repositorio de tarjeta de modelo (sin pesos alojados) que empaqueta dos detectores de objetos clásicos de detectron2: Faster R-CNN y Mask R-CNN, ambos con backbone ResNet-50 + FPN y entrenados sobre COCO. Lo desarrolla el proyecto fastforks, que actúa como capa de distribución e inferencia sobre los pesos originales de Meta AI Research (detectron2, commit `1e3e13b`), verificándolos mediante SHA-256. El modelo resuelve detección de objetos e instancia-segmentación sobre una única imagen RGB, devolviendo cajas, etiquetas de clase, puntuaciones e máscaras de instancia.

La relevancia actual no está en la arquitectura (de 2015 y 2017, respectivamente), sino en la infraestructura que la envuelve: fastforks ofrece dos backends (`portable` en PyTorch y `kernels` con CUDA propio), paridad numérica verificada frente al código original y mejoras de velocidad de hasta 2,1x respecto al fp32 original. Esto convierte un baseline de investigación en una opción práctica para pipelines de producción con requisitos modestos de VRAM (menos de 1 GiB en fp16 a 800x1344).

El modelo no es un LLM: no genera texto ni tiene contexto en tokens. Es un detector de dos etapas con RPN, ROIAlign y cabezas de clasificación/regresión de cajas, más una cabeza de máscara en la variante Mask R-CNN. Su licencia de pesos es CC-BY-SA-3.0 (share-alike), lo que condiciona el uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Faster R-CNN / Mask R-CNN de dos etapas con backbone ResNet-50 + FPN, RPN, ROIAlign y cabezas de cajas (+ máscara) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de imagen de cualquier H x W >= 32, con padding a múltiplo de 32 |
| Tipos de cuantización | fp32 (original) y fp16 (portable y kernels); no se documentan otras |
| Idiomas soportados | no disponible (tarea de visión; sin etiquetas de idioma) |
| Licencia | CC-BY-SA-3.0 en los pesos; código Apache-2.0 |
| Formato de pesos | `.pkl` (checkpoints de detectron2); no se alojan en el repo, se descargan desde los enlaces del autor |
| Variantes | `faster-rcnn-r50-fpn-3x-coco@1`, `mask-rcnn-r50-fpn-3x-coco@1` |
| Salidas | `boxes` [N,4], `scores` [N], `labels` [N], `masks` (solo Mask R-CNN) |
| Backends | `portable` (PyTorch), `kernels` (CUDA propio, `cudnn_hacc`) |
| Dataset de entrenamiento | COCO 2017 train (anotaciones de instancia), schedule 3x; backbone inicializado desde ImageNet-1k de MSRA |

## Arquitectura y entrenamiento

Faster R-CNN (Ren et al., 2015) y Mask R-CNN (He et al., 2017) son detectores de dos etapas. La primera etapa es una Region Proposal Network sobre el mapa de características del FPN, que genera propuestas de región; la segunda aplica ROIAlign para extraer características por región y pasa por cabezas de clasificación y regresión de cajas. Mask R-CNN añade una cabeza de máscara por instancia que produce una máscara binaria por región. El backbone es ResNet-50 con FPN, y el módulo portable expone backbone + FPN.

El entrenamiento usa COCO 2017 train con anotaciones de instancia y el schedule 3x de detectron2; el backbone ResNet-50 se inicializa desde el modelo ImageNet-1k de MSRA. No se documenta RLHF, DPO ni ajuste por preferencias (no aplica a un detector). La innovación destacable del empaquetado fastforks es doble: (1) verificación de integridad de los pesos originales mediante SHA-256 (prefijos `3c25caca37ba` para Faster R-CNN y `9a737e290372` para Mask R-CNN), y (2) un backend de kernels CUDA propios (`cudnn_hacc`) que acelera la inferencia frente al código original y frente al backend portable, con paridad numérica verificada (CPU fp32: max |diff| <= 0.002; GPU fp16: mean |diff| <= 1.0 px y p99 <= 2.0 px).

## Capacidades

- Detección de objetos: devuelve cajas delimitadoras, etiquetas de clase y puntuaciones de confianza para las clases de COCO.
- Segmentación de instancias: la variante Mask R-CNN devuelve máscaras binarias por instancia, además de cajas y etiquetas.
- Entrada de imagen flexible: cualquier tamaño H x W >= 32, con padding a múltiplo de 32; probado hasta 3000x4000 en fp16 sobre una RTX 5060 Ti de 16 GB con 0,6 GiB de pico asignado.
- Dos backends intercambiables: `portable` (PyTorch, GPU o CPU) y `kernels` (CUDA propio, requiere driver NVIDIA reciente y kernel precompilado para la arquitectura de GPU; si no existe, lanza `BackendUnavailableError` sin fallback silencioso).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente visual de detección/segmentación.
- No se documentan capacidades multilingües ni modo de razonamiento (thinking mode), visión multimodal ni audio.

## Casos de uso

- Moderación de contenido visual: el modelo puede detectar y localizar objetos y personas en imágenes subidas por usuarios, usando las cajas y puntuaciones para aplicar políticas de filtrado; la variante Mask R-CNN añade máscaras para difuminar regiones concretas.
- Análisis de imágenes industriales o de inventario: detección de productos, piezas o defectos sobre imágenes de cámara, con latencias de 16-27 ms por imagen en 640x480 a 12 MP según el backend, lo que permite procesar lotes en tiempo casi real.
- Preprocesado para pipelines de visión: generar propuestas de región y máscaras que alimenten etapas posteriores (OCR, clasificación fina, seguimiento), aprovechando la salida estructurada `boxes`/`scores`/`labels`/`masks`.
- Automatización de anotación de datasets: usar las detecciones como preanotaciones para revisión humana, reduciendo el coste de etiquetado en proyectos de visión con clases de COCO.
- Robótica y navegación asistida: detección de obstáculos y objetos en flujos de cámara, con requisitos de VRAM bajos (menos de 1 GiB en fp16) que permiten ejecutarlo junto a otros módulos en una GPU consumer.
- Análisis de imágenes médicas o científicas como baseline: al ser un detector genérico entrenado en COCO, sirve como referencia inicial antes de un ajuste fino específico del dominio.
- Procesamiento por lotes en CPU: el backend portable funciona en CPU cuando no hay GPU, útil para tareas offline de bajo volumen donde la latencia no es crítica.

## Benchmarks y rendimiento

Detección sintética a 800x1344 (RTX 5060 Ti 16 GB, sm_120):

| Modelo | Tiempo fp32 original (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | vs portable |
|---|---|---|---|---|---|---|
| `faster-rcnn-r50-fpn-3x-coco` | 83,6 | 41,4 | 22,77 | 19,47 | 2,1x | 1,2x |
| `mask-rcnn-r50-fpn-3x-coco` | 85,4 | 43,5 | 24,59 | 20,98 | 2,1x | 1,2x |

Memoria pico a 800x1344 (MiB, asignada / reservada):

| Modelo | Original | Portable | Kernels |
|---|---|---|---|
| `faster-rcnn-r50-fpn-3x-coco` | 626 / 708 | 390 / 490 | 391 / 450 |
| `mask-rcnn-r50-fpn-3x-coco` | 604 / 650 | 352 / 440 | 353 / 400 |

Tiempo y memoria pico a tamaños fijos (tiempo ms / asignada / reservada MiB):

| Modelo | Modo | 640x480 | 1280x720 | 1920x1080 | 12 MP (4000x3000) |
|---|---|---|---|---|---|
| `faster-rcnn-r50-fpn-3x-coco` | portable | 18,5 / 309 / 420 | 21,5 / 338 / 426 | 22,2 / 352 / 454 | 27,2 / 602 / 734 |
| `faster-rcnn-r50-fpn-3x-coco` | kernels | 16,1 / 310 / 422 | 18,7 / 339 / 460 | 18,4 / 353 / 488 | 24,6 / 602 / 736 |
| `mask-rcnn-r50-fpn-3x-coco` | portable | 18,1 / 314 / 422 | 23,1 / 348 / 440 | 25,1 / 413 / 536 | 27,1 / 607 / 736 |
| `mask-rcnn-r50-fpn-3x-coco` | kernels | 15,6 / 315 / 422 | 19,6 / 349 / 472 | 22,3 / 414 / 568 | 24,6 / 607 / 736 |

Arranque y primera llamada:

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| `faster-rcnn-r50-fpn-3x-coco` | 0,73 | 0,53 | 0,14 | 0,04 | 0,25 | 0,04 |
| `mask-rcnn-r50-fpn-3x-coco` | 0,97 | 1,50 | 0,22 | 0,84 | 0,42 | 0,04 |

No se han publicado resultados de benchmarks de precisión (mAP, AP50, etc.) en la información disponible. La única métrica de precisión documentada es la paridad con el código original: CPU fp32 max |diff| <= 0,002; GPU fp16 mean |diff| <= 1,0 px y p99 <= 2,0 px.

## Requisitos de hardware

- VRAM estimada: menos de 1 GiB de pico asignado en fp16 a 800x1344 (390 MiB Faster R-CNN, 352 MiB Mask R-CNN en portable); 602-607 MiB a 12 MP. La memoria reservada es de 400-736 MiB según configuración.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; los benchmarks se ejecutaron en una RTX 5060 Ti de 16 GB (sm_120). Para el backend `kernels` se requiere un kernel precompilado para la arquitectura de la GPU y un driver NVIDIA reciente.
- Cabe en GPU consumer: sí, con amplio margen; incluso GPUs de gama baja con 4-6 GB de VRAM pueden ejecutar el modelo en fp16.
- Opciones de despliegue: `pip install fastforks` con `detection.load(...)`; backends `portable` (PyTorch, GPU o CPU) y `kernels` (CUDA propio). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector).
- Latencia y throughput: 16-27 ms por imagen entre 640x480 y 12 MP en RTX 5060 Ti; 19-25 ms a 800x1344. No se documenta throughput agregado en imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Backbone | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fastforks/rcnn (Faster R-CNN R50-FPN) | Detector de dos etapas | ResNet-50 + FPN | Imagen H x W >= 32 | CC-BY-SA-3.0 (pesos), Apache-2.0 (código) | HuggingFace (tarjeta) + descarga desde fbaipublicfiles |
| fastforks/rcnn (Mask R-CNN R50-FPN) | Detector de dos etapas + máscara | ResNet-50 + FPN | Imagen H x W >= 32 | CC-BY-SA-3.0 (pesos), Apache-2.0 (código) | HuggingFace (tarjeta) + descarga desde fbaipublicfiles |
| detectron2 model zoo (original) | Faster R-CNN / Mask R-CNN | ResNet-50 + FPN | Imagen | CC-BY-SA-3.0 | GitHub de Meta AI |
| No disponible | — | — | — | — | — |

No se dispone de datos de otros detectores comparables (YOLO, DETR, etc.) en la información proporcionada, por lo que no se incluyen cifras de rendimiento comparativo.

## Limitaciones y advertencias

- Licencia share-alike: los pesos son CC-BY-SA-3.0, lo que obliga a compartir bajo la misma licencia las obras derivadas; las imágenes de COCO tienen sus propias licencias. Verificar antes de uso comercial.
- El repositorio no aloja pesos: solo contiene la tarjeta y los enlaces de descarga; la disponibilidad depende de los servidores de Meta AI (fbaipublicfiles.com).
- Riesgo de alucinación en el sentido de falsos positivos y detecciones espurias: como todo detector, puede producir cajas y máscaras con alta confianza sobre regiones sin objeto; no se documentan umbrales de confianza por defecto.
- Limitación de clases: entrenado exclusivamente en las 80 clases de COCO; no detecta categorías fuera de ese vocabulario sin ajuste fino.
- Sin capacidades de texto, tool calling ni agentes: no es adecuado para tareas de lenguaje o razonamiento multi-paso.
- El backend `kernels` requiere un kernel precompilado para la arquitectura de GPU; si no existe, lanza `BackendUnavailableError` y no hace fallback silencioso, lo que puede romper despliegues en hardware no soportado.
- No se documentan sesgos específicos del modelo más allá de los inherentes al dataset COCO (posible sesgo demográfico y geográfico en las anotaciones).
- No se documentan resultados de mAP ni métricas de precisión estándar en la información disponible; la única validación es la paridad numérica con el código original.
- La licencia del código es Apache-2.0, pero la tarjeta advierte que es un paquete de uso de investigación y que deben revisarse las cadenas de licencia antes de cualquier otro uso.

## Enlaces

- HuggingFace: https://huggingface.co/fastforks/rcnn
- Código fastforks: https://github.com/kleinicke/fastforks
- Kernels CUDA: https://huggingface.co/fastforks/kernels
- Benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Tarjeta de variantes (card.toml): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/detection/models/rcnn/card.toml
- Código original detectron2: https://github.com/facebookresearch/detectron2
- Model zoo de detectron2 (licencia): https://github.com/facebookresearch/detectron2/blob/1e3e13bbf607b54f62205c4c33922521822fb298/MODEL_ZOO.md
- Pesos Faster R-CNN: https://dl.fbaipublicfiles.com/detectron2/COCO-Detection/faster_rcnn_R_50_FPN_3x/137849458/model_final_280758.pkl
- Pesos Mask R-CNN: https://dl.fbaipublicfiles.com/detectron2/COCO-InstanceSegmentation/mask_rcnn_R_50_FPN_3x/137849600/model_final_f10217.pkl
