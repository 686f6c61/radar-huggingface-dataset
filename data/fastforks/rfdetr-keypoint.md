# fastforks/rfdetr-keypoint

## Resumen

RF-DETR Keypoint (fastforks) es un modelo de estimación de pose humana basado en la arquitectura RF-DETR de Roboflow, publicado como preview con licencia Apache-2.0. Combina un backbone DINOv2-small con atención ventaneada y un decoder transformer deformable que predice directamente personas y sus 17 articulaciones COCO a partir de la imagen completa, sin necesidad de un detector de personas separado, cajas previas ni NMS. El modelo tiene 40,7 millones de parámetros y trabaja con entradas cuadradas de 576 x 576 píxeles.

El repositorio de Hugging Face es únicamente una model card gestionada por el proyecto fastforks: no aloja pesos. fastforks descarga los pesos originales del autor desde los enlaces de Roboflow y los verifica contra el SHA-256 registrado en la model card. El código de integración está en el repositorio de GitHub de fastforks, con kernels específicos para el backend `kernels`, y el código original corresponde a Roboflow RF-DETR en el commit `5b22dfc09406`.

La relevancia de este modelo radica en su enfoque bottom-up: al predecir personas y keypoints en una sola pasada sobre la imagen completa, elimina la dependencia de un detector de personas en cascada, lo que simplifica el pipeline y reduce la latencia. La model card reporta 71,8 AP OKS en COCO val2017 con personas predichas y tiempos de inferencia de 4,28 ms con TensorRT fp16 en una RTX 5060 Ti.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2-small con atención ventaneada y decoder transformer deformable (RF-DETR) |
| Parametros totales | 40,7 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen de cualquier H x W >= 32, múltiplo de 32; entrenado a 576 x 576) |
| Tipos de cuantizacion | fp32, fp16; exportación a ONNX y TensorRT fp16 |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pth` (PyTorch); exportación a ONNX y TensorRT |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura RF-DETR: un backbone DINOv2-small con atención ventaneada extrae características de la imagen completa, y un decoder transformer deformable predice directamente las personas y sus 17 keypoints COCO mediante consultas condicionales de keypoints. No requiere un detector de personas previo, cajas ni supresión de no máximos (NMS). La confianza de persona incorpora la fusión de incertidumbre de localización del modelo upstream, mientras que la confianza de cada articulación corresponde a su "findability".

El backbone DINOv2-small procede del preentrenamiento de DINOv2 sobre LVD-142M, un conjunto curado de imágenes web no publicado. El ajuste para keypoints se realizó sobre COCO 2017 (split de entrenamiento, anotaciones de instancia). La model card indica que la procedencia completa del entrenamiento intermedio no está declarada. No se especifican en la información disponible detalles sobre uso de RLHF, DPO ni el número exacto de tokens o imágenes de entrenamiento.

## Capacidades

- Estimación de pose humana: predice 17 keypoints COCO con puntuaciones de confianza para cada persona.
- Detección de personas integrada: el modelo predice directamente las personas sin detector externo, cajas previas ni NMS.
- Salidas estructuradas: `keypoints`, `keypoint_scores`, `boxes` y `scores`.
- Entrada flexible: acepta imágenes de cualquier tamaño H x W >= 32, con padding a múltiplo de 32; probado hasta 3000 x 4000 en fp16.
- Backends de ejecución: `portable` y `kernels`, con paridad verificada frente al código original.
- Exportación: soporte de `torch.export` de forma fija y ONNX; TensorRT fp16 disponible para las redes sobre recortes de persona.
- Compilación: `torch.compile` soportado (con graph breaks por la interpolación posicional upstream; `fullgraph=True` no soportado).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al ser un modelo puramente visual.

## Casos de uso

- Análisis deportivo y biomecánico: el modelo estima las 17 articulaciones COCO en una sola pasada sobre el fotograma completo, lo que permite extraer ángulos articulares y trayectorias en vídeo sin un detector de personas separado, reduciendo la latencia del pipeline.
- Monitorización de ergonomía en puestos de trabajo: con entradas de alta resolución (probado hasta 3000 x 4000), se pueden analizar posturas de operarios en imágenes de cámara fija y detectar posiciones de riesgo de forma automática.
- Control de aforo y análisis de multitudes: al predecir personas y keypoints conjuntamente sobre la imagen completa, el modelo sirve para contar y localizar peatones en escenas con varias personas, con las cajas de persona como salida adicional.
- Animación y captura de movimiento: las salidas `keypoints` y `keypoint_scores` permiten alimentar pipelines de rigging o retargeting en tiempo real; los 4,28 ms por fotograma con TensorRT fp16 en una RTX 5060 Ti hacen viable el procesamiento a alta frecuencia.
- Rehabilitación y seguimiento clínico: la estimación de articulaciones con puntuaciones de confianza por keypoint permite monitorizar ejercicios de fisioterapia y marcar articulaciones con baja confianza para revisión manual.
- Sistemas de seguridad y detección de caídas: la pose estimada sobre la imagen completa, sin necesidad de cajas previas, facilita la detección de posturas anómalas en entornos industriales o residencias; la licencia Apache-2.0 permite uso comercial.
- Integración en pipelines de visión en producción: la exportación a ONNX y TensorRT, junto con los backends `portable` y `kernels` de fastforks, permite desplegar el modelo en infraestructura CUDA existente con verificación de pesos por SHA-256.

## Benchmarks y rendimiento

Precisión en COCO val2017 (OKS AP, bottom-up sobre las 5.000 imágenes de validación, sin cajas ground-truth, personas ordenadas por score predicho):

| Variante | Dataset | Original fp32 | Original fp16 | Portable | Kernels |
|---|---|---|---|---|---|
| `rf-detr-keypoint-preview` | COCO val2017, personas predichas, keypoint AP | 71,8 | 71,8 | 71,8 | 71,8 |
| `rf-detr-keypoint-preview` | COCO val2017, cada 10ª imagen, personas predichas, keypoint AP | 72,7 | 72,9 | 72,9 | 72,8 |

Velocidad y memoria (pose sintética, 1080x1920, RTX 5060 Ti 16 GB, sm_120):

| Modelo | Original fp32 (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Memoria pico portable (MiB alloc/reserved) |
|---|---|---|---|---|---|---|
| `rf-detr-keypoint-preview` | 29,4 | 19,3 | 18,3 | 9,48 | 2,0x | 179 / 204 |

Otras métricas reportadas:

| Métrica | Valor |
|---|---|
| Carga del modelo (s): original / portable / kernels | 1,49 / 2,66 / 2,70 |
| Primera llamada (s): original / portable / kernels | 0,08 / 0,39 / 0,38 |
| `torch.compile` (1080x1920) | 8,00 ms (compilación en frío: 47,9 s) |
| TensorRT fp16 (red sobre recortes de persona) | 4,28 ms (construcción ONNX + engine: 67,2 s) |
| Memoria pico TensorRT (engine + torch) | 264 / 294 MiB |
| Paridad CPU float32 vs original | max abs diff <= 0,0001 |
| Paridad GPU float16 (portable y kernels) | mean abs diff <= 0,12; p99 <= 0,32 |
| Entrada máxima probada (portable, fp16) | 3000 x 4000 (0,5 GiB pico asignado, 0,6 reservado) |

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Contexto de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RF-DETR Keypoint preview (este) | 40,7 M | Bottom-up, DINOv2-small + decoder deformable, sin detector de personas | Imagen completa, 576 x 576 de entrenamiento, hasta 3000 x 4000 probado | Apache-2.0 | Pesos en repo.roboflow.com, card en Hugging Face |
| RF-DETR Plus (detección) | no disponible | Detección de objetos RF-DETR | no disponible | Restringida (no incluida en este repo) | Variantes Plus de Roboflow |
| Otros estimadores de pose COCO | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos comparativos de rendimiento frente a otros estimadores de pose como ViTPose, RTMPose o YOLO-Pose; no se han publicado tablas comparativas en la model card.

## Limitaciones y advertencias

- Requiere las librerías opcionales `transformers` y `torchvision`.
- Es el checkpoint Apache-2.0 Keypoint Preview; las variantes restringidas RF-DETR Plus de detección no están incluidas.
- `module()` exporta cajas crudas, logits de clase y predicciones de keypoints; la fusión de confianza y el umbralizado quedan fuera del grafo exportado.
- Float16 y float32 pueden retener personas distintas cerca del umbral de score; el orden crudo de las consultas puede diferir entre motores de exportación.
- `torch.compile` presenta graph breaks por la interpolación posicional upstream; `fullgraph=True` no está soportado. Se mantienen `torch.export` de forma fija y ONNX.
- La procedencia completa del entrenamiento intermedio no está declarada; el backbone DINOv2-small se preentrenó sobre LVD-142M, un conjunto no publicado.
- No se han publicado datos sobre sesgos demográficos, de género o de tono de piel; al entrenarse sobre COCO 2017, puede heredar los sesgos de representación de ese dataset.
- Riesgo de alucinación de keypoints en personas ocluidas o parcialmente visibles; las puntuaciones de confianza por articulación deben usarse para filtrar.
- La licencia Apache-2.0 permite uso comercial, pero la model card advierte de que el paquete de código original se registra como "research-use package" y debe revisarse antes de cualquier otro uso.
- El repositorio de Hugging Face no aloja pesos; la disponibilidad depende de los enlaces externos de Roboflow y de la verificación SHA-256 de fastforks.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/rfdetr-keypoint
- Código de fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original de Roboflow RF-DETR: https://github.com/roboflow/rf-detr
- README original (sección de keypoints): https://github.com/roboflow/rf-detr/blob/5b22dfc0940697ce1abdfa681a5f7392b3eddbfb/README.md#keypoints
- Pesos del checkpoint preview: https://repo.roboflow.com/rfdetr/rf-detr-keypoint-preview-xlarge.pth
- Documentación de benchmarks de fastforks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- `card.toml` con hashes completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/pose/models/rfdetr_keypoint/card.toml
