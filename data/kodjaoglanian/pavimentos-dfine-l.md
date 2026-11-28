# Kodjaoglanian/pavimentos-dfine-l

## Resumen

`pavimentos-dfine-l` es un modelo de detección de objetos especializado en la identificación de defectos en pavimentos asfálticos, concretamente baches o agujeros (una única clase: `buraco`). Lo desarrolla el usuario Kodjaoglanian a partir del modelo base `ustc-community/dfine-large-obj2coco-e25`, que pertenece a la familia D-FINE (Fine-grained Distribution Refinement), una evolución de la arquitectura DETR. El modelo se ha ajustado (fine-tuning) sobre dos conjuntos de datos de Roboflow orientados a la localización de baches en carretera.

El problema que resuelve es la inspección automatizada de firmes viarios: detectar baches en imágenes estáticas o en vídeo de dashcam para tareas de mantenimiento, alerta temprana y mapeo de incidencias. Su relevancia radica en dos aspectos prácticos: por un lado, emplea una licencia Apache 2.0 permisiva (a diferencia de los modelos YOLO con AGPL-3.0), lo que facilita el uso comercial propietario; por otro, el autor declara una calibración Platt integrada en los pesos que permite operar con un umbral de confianza estándar de 0,50 y una reducción drástica de falsos positivos en texturas planas (asfalto liso, paredes, aceras).

Arquitectónicamente es un transformer de detección de objetos de tipo DETR con refinamiento de distribución, con 31,2 millones de parámetros, entrada de 640x640 píxeles y salida de una sola clase. El repositorio ocupa 2,0 GB e incluye pesos en safetensors, ONNX dinámico y TorchScript. Está etiquetado para portugués e inglés, aunque al ser un modelo de visión el idioma no condiciona la inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | D-FINE Large (familia DETR, Fine-grained Distribution Refinement) |
| Parametros totales | 31.202.455 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 640x640) |
| Tipos de cuantizacion | no disponible (se ofrecen pesos PyTorch/safetensors, ONNX dinámico y TorchScript) |
| Idiomas soportados | portugués, inglés (etiquetas del modelo; la tarea es de visión) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX, TorchScript (pt) |

## Arquitectura y entrenamiento

El modelo se basa en D-FINE Large, una arquitectura de detección de objetos de la familia DETR que introduce el mecanismo de Fine-grained Distribution Refinement: en lugar de predecir directamente las coordenadas de las cajas, refina iterativamente una distribución sobre las posiciones, lo que mejora la localización fina. El modelo base es `ustc-community/dfine-large-obj2coco-e25`, preentrenado sobre COCO. Sobre él se ha realizado un ajuste fino para una única clase (`buraco`) con entrada de 640x640 píxeles.

El entrenamiento se ha realizado con los conjuntos de datos `roboflow-universe/localizacao-de-buracos-9mb7f` y `roboflow-universe/pothole-detection-mapping-and-alert`. El autor indica que esta versión (v8 Calibrada) incorpora Platt Scaling para que el modelo opere de forma nativa en el umbral de confianza 0,50, y que se ha aplicado Hard-Negative Mining mediante Bounded Hinge Loss para reducir los falsos positivos en texturas planas. No se dispone de información sobre el número total de tokens, la composición exacta del dataset ni el uso de RLHF/DPO (no aplicable en detección de objetos).

## Capacidades

- Detección de objetos de una sola clase: baches o agujeros en pavimento asfáltico (`0: buraco`).
- Inferencia sobre imágenes estáticas en formato RGB, con preprocesado de orientación EXIF.
- Inferencia sobre vídeo (dashcam, GoPro) con soporte para recorte de región de interés (ROI) que excluye capó y cielo.
- Post-procesado integrado mediante filtro geométrico (descarte de cajas de área relativa excesiva o aspecto extremo) y NMS para suprimir consultas duplicadas.
- Calibración Platt integrada en los pesos para operar con umbral 0,50.
- Exportación a ONNX dinámico y TorchScript para despliegue en producción.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües generativas; es un modelo puramente perceptivo.

## Casos de uso

- Inspección de firmes con vehículo instrumentado: montaje de una cámara en un vehículo de mantenimiento que capture imágenes de la calzada y ejecute el modelo en tiempo real para registrar la ubicación de baches y priorizar reparaciones.
- Análisis de vídeo de dashcam: procesado de grabaciones con recorte de ROI (excluyendo capó y cielo) para generar mapas de incidencias por tramo de carretera, aprovechando el filtro geométrico incluido en la model card.
- Alertas tempranas para conductores: integración en una aplicación móvil o de navegación que detecte baches en la ruta y avise al conductor o al gestor de flotas.
- Mantenimiento predictivo municipal: procesado por lotes de imágenes de inspección para inventariar el estado del pavimento y planificar el asfaltado según la densidad de detecciones.
- Mapeo y geolocalización de defectos: combinación de las detecciones con coordenadas GPS para construir un mapa de baches actualizable, usando los formatos ONNX o TorchScript para despliegue en el borde.
- Control de calidad en obras: verificación automática de que un tramo recién asfaltado no presenta baches, con la ventaja de que el modelo declara un ~0 % de falsos positivos en asfalto liso.
- Despliegue en entornos con licencia permisiva: uso comercial propietario en productos de inspección viaria sin las obligaciones de copyleft de AGPL-3.0 que imponen los modelos YOLO.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de test "Unified Pavement Defects" (tipo COCO). No están verificados de forma independiente (`verified: false`).

| Metrica | Valor |
|---|---|
| mAP@0.50 | 0,539 |
| mAP@0.50:0.95 | 0,2749 |
| Precision | 0,7483 |
| Recall | 0,3804 |
| F1-Score | 0,5043 |

El autor declara además una tasa de falsos positivos de aproximadamente el 0 % en texturas planas (paredes, aceras y asfalto liso), si bien no se aporta una métrica cuantitativa independiente para esa afirmación.

## Requisitos de hardware

- VRAM estimada para inferencia: con 31,2 millones de parámetros, los pesos en FP32 ocupan aproximadamente 125 MB; en FP16, unos 62 MB. La VRAM total dependerá del tamaño de lote y de la resolución de entrada (640x640), pero el modelo es muy ligero y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; una RTX 3060, RTX 4090, A100 o H100 son más que suficientes. También puede ejecutarse en CPU para imágenes estáticas, aunque con mayor latencia.
- Cabe en GPU consumer: sí, en cualquier GPU moderna con 4 GB o más de VRAM, e incluso en iGPU o CPU para uso no intensivo.
- Opciones de despliegue: Hugging Face `transformers` (AutoModelForObjectDetection), ONNX Runtime (pesos ONNX dinámicos), TorchScript, y despliegue en el borde con OpenCV para vídeo. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a modelos de visión de este tipo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mAP@0.50 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pavimentos-dfine-l | 31,2 M | 640x640 | 0,539 | Apache 2.0 | Hugging Face |
| Modelos YOLO (p. ej. YOLOv8/v11) | no disponible | variable | no disponible | AGPL-3.0 | Ultralytics |
| D-FINE Large base (ustc-community/dfine-large-obj2coco-e25) | no disponible | 640x640 | no disponible | no disponible | Hugging Face |

La comparativa con modelos YOLO es relevante por la licencia: YOLO emplea AGPL-3.0, lo que obliga a liberar el código de las aplicaciones que lo integren, mientras que este modelo usa Apache 2.0. No se dispone de resultados de benchmarks de los modelos alternativos en el mismo conjunto de datos, por lo que no es posible comparar rendimiento de forma directa.

## Limitaciones y advertencias

- Modelo de una sola clase: solo detecta baches (`buraco`); no identifica grietas, baches de otro tipo ni otras patologías del pavimento.
- Recall relativamente bajo (0,3804): puede dejar sin detectar una parte importante de los baches reales, lo que exige revisar el umbral o complementar con otros métodos en producción.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente.
- La afirmación de ~0 % de falsos positivos en texturas planas no está respaldada por una métrica cuantitativa publicada; conviene validarla en el dominio de despliegue.
- Requiere post-procesado geométrico y NMS para evitar detecciones espurias en paredes, aceras y capó del vehículo, tal como indica la model card.
- En vídeo en movimiento es necesario recortar la ROI (capó y cielo) antes de la inferencia para mantener la precisión.
- El modelo está etiquetado para portugués e inglés, pero al ser de visión el idioma no afecta a la inferencia; no hay capacidades generativas ni multilingües.
- Licencia Apache 2.0: permite uso comercial propietario, pero conviene revisar las obligaciones de atribución y las licencias de los datasets de origen (Roboflow Universe) antes de su explotación comercial.
- Riesgo de alucinación en el sentido de detecciones falsas en texturas que se parezcan a baches; el filtro geométrico mitiga pero no elimina este riesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kodjaoglanian/pavimentos-dfine-l
- Modelo base: https://huggingface.co/ustc-community/dfine-large-obj2coco-e25
- Dataset 1: https://universe.roboflow.com/roboflow-universe/localizacao-de-buracos-9mb7f
- Dataset 2: https://universe.roboflow.com/roboflow-universe/pothole-detection-mapping-and-alert
