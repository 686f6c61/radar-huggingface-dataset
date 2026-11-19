# AutowareFoundation/scene_3d

## Resumen

Scene3D es un modelo de estimación de profundidad monocular relativa desarrollado por la Autoware Foundation, pensado específicamente para conducción autónoma y sistemas ADAS. Procesa imágenes de una única cámara frontal y genera mapas de profundidad por píxel de alta resolución con bordes nítidos en objetos finos (postes, follaje) y obstáculos en primer plano, lo que permite comprender la geometría de la escena en tiempo real sobre hardware de borde.

El modelo se destila a partir de pseudo-etiquetas generadas por DepthAnythingV2 ViT-Large sobre arquitecturas convolucionales ligeras. El repositorio incluye dos variantes: Scene3D, una CNN encoder-context-decoder con backbone EfficientNet-B0 congelado y un módulo de atención residual, y Scene3DLite, una variante compacta con encoder EfficientNet-B1 y decoder DeepLabV3+ que reduce el coste computacional unas 29 veces (7,78 frente a 224 GOPs) manteniendo la nitidez de bordes y el ordenamiento relativo de profundidad.

Su relevancia actual radica en que ofrece inferencia en tiempo real en dispositivos empotrados de bajo consumo (hasta 91,4 FPS en INT8 TensorRT sobre Jetson Orin Nano) con licencia Apache 2.0, lo que lo hace apto para integración comercial en pipelines de percepción de vehículos. Se distribuye en PyTorch, PyTorch trazado y ONNX FP32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (EfficientNet-B0 + módulo de atención residual + decoder de upsampling progresivo) en Scene3D; EfficientNet-B1 + DeepLabV3+ en Scene3DLite |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 640×320, 2:1) |
| Tipos de cuantizacion | FP32, FP16, INT8 (TensorRT) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pth), PyTorch trazado (.pt), ONNX FP32 (.onnx) |

## Arquitectura y entrenamiento

Scene3D combina un backbone EfficientNet-B0 preentrenado en escenas de carretera y congelado (SceneSegNetwork), un módulo de atención residual denominado DepthContext, un cuello decodificador de upsampling progresivo (Scene3DNeck) y una cabeza de regresión de profundidad densa (Scene3DHead). Scene3DLite sustituye esta combinación por un encoder EfficientNet-B1, un decoder DeepLabV3+ y una cabeza de regresión ligera, y su implementación en PyTorch admite resoluciones de entrada dinámicas (por ejemplo, 640×320 o 1024×512), aunque el ONNX preexportado fija [1, 3, 320, 640].

El entrenamiento se realizó mediante destilación de pseudo-etiquetas de DepthAnythingV2 ViT-Large sobre 488.535 imágenes de escenas de calle (con 24.426 reservadas para validación), procedentes de BDD100K, Mapillary Vistas, ROADWork, Comma10K, KITTI, DDAD, Driving Stereo, Indian Driving Dataset, Zenesact Open Dataset y Mapillary Planet Scale Dataset. La función de pérdida es una suma ponderada de una Scale Invariant robust MAE Loss y una Multi-Scale Edge Preservation Loss. No se especifica en la información disponible si hubo RLHF, DPO ni otras fases de alineación (no aplicables a este tipo de modelo).

## Capacidades

- Estimación de profundidad monocular relativa por píxel a partir de una sola imagen RGB.
- Generación de mapas de profundidad de alta resolución (640×320) con bordes nítidos en estructuras finas como postes y follaje.
- Detección de obstáculos independiente de la clase, forma, tamaño o apariencia del objeto.
- Comprensión de geometría de escena en tiempo real sobre hardware de borde.
- Inferencia en FP32, FP16 e INT8 con TensorRT y ONNX Runtime.
- Soporte de resoluciones de entrada dinámicas en la variante PyTorch de Scene3DLite.
- No dispone de tool calling, function calling, capacidades de agente, multilingües, visión general, audio ni modo de razonamiento: es un modelo puramente de regresión de profundidad.

## Casos de uso

- Percepción de obstáculos en conducción autónoma: el modelo genera un mapa de profundidad denso por píxel que permite detectar cualquier obstáculo en la escena con independencia de su clase, lo que resulta adecuado para escenarios de cola larga (long-tail) donde los detectores por clase fallan.
- Sistemas ADAS de gama baja: Scene3DLite, con 7,78 GOPs y hasta 91,4 FPS en INT8 TensorRT sobre Jetson Orin Nano, permite integrar percepción de profundidad en unidades de cómputo embebidas de bajo coste y consumo.
- Frenada de emergencia y evitación de colisiones: la nitidez de bordes en objetos finos (postes, señales) y en primer plano mejora la detección temprana de elementos que un mapa de profundidad suavizado perdería.
- Compatibilidad con VisionPilot 0.9: la variante Scene3D original se mantiene para pipelines heredados que requieren la red completa con 224 GOPs.
- Análisis de escenas de tráfico offline: procesamiento por lotes de datasets de imágenes de calle (BDD100K, KITTI, Mapillary) para generar mapas de profundidad como etiquetas auxiliares o para validación de percepción.
- Investigación en destilación de modelos de profundidad: el par Scene3D/Scene3DLite sirve como referencia para estudiar la transferencia de conocimiento de ViT-Large a CNNs ligeras con pérdidas de preservación de bordes.
- Despliegue en robótica móvil y vehículos de reparto autónomos: la inferencia a 42,7 FPS en TensorRT FP32 sobre Jetson Orin Nano permite operar en tiempo real con una sola cámara monocular, reduciendo el coste del sensor frente a soluciones estéreo o LiDAR.

## Benchmarks y rendimiento

Resultados de validación publicados por el autor (Scene3D, 640×320):

| Total Loss | Scale Invariant Loss | Edge Preservation Loss |
|---|---|---|
| 0,08408 | 0,07004 | 0,01404 |

Rendimiento de inferencia en Jetson Orin Nano (8 GB), incluyendo H2D + inferencia + D2H a 640×320:

| Modelo | GOPs | Backend | Forward [ms] | FPS |
|---|---|---|---|---|
| Scene3D | 224 | FP32 ONNX | 168,4 | 5,9 |
| Scene3D | 224 | FP32 TensorRT | 99,7 | 10,0 |
| Scene3DLite | 7,78 | FP32 ONNX | 41,0 | 24,4 |
| Scene3DLite | 7,78 | FP32 TensorRT | 23,4 | 42,7 |
| Scene3DLite | 7,78 | INT8 TensorRT | 10,9 | 91,4 |

Rendimiento en GPU de portátil (RTX 3060 Mobile, AMD Ryzen 7 5800H, 238,41 GFLOPs): Scene3D alcanza 15,1 FPS en FP32 y 23,9 FPS en FP16. No se han publicado resultados de benchmarks comparativos con otros modelos de profundidad (AbsRel, RMSE, delta) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el tamaño del repositorio es de 0,7 GB, lo que sugiere que ambas variantes caben holgadamente en GPUs de consumo.
- GPU recomendadas: Jetson Orin Nano (8 GB) validada para despliegue embebido; RTX 3060 Mobile validada para portátil; GPUs de datacenter (A100, H100) no mencionadas en la información disponible.
- Cabe en GPU de consumo: sí, tanto Scene3D como Scene3DLite por su reducido tamaño (224 y 7,78 GOPs respectivamente).
- Opciones de despliegue: PyTorch (CUDA), ONNX Runtime (CUDAExecutionProvider y CPUExecutionProvider), TensorRT (FP32, FP16 e INT8).
- Latencia y throughput: Scene3DLite INT8 TensorRT a 10,9 ms y 91,4 FPS en Jetson Orin Nano; Scene3D FP32 TensorRT a 99,7 ms y 10,0 FPS en el mismo dispositivo; Scene3D a 15,1 FPS en FP32 y 23,9 FPS en FP16 sobre RTX 3060 Mobile.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Scene3D | CNN (EfficientNet-B0 + atención residual) | no disponible | 640×320 | 10,0 FPS TensorRT FP32 en Jetson Orin Nano | Apache 2.0 | Hugging Face |
| Scene3DLite | CNN (EfficientNet-B1 + DeepLabV3+) | no disponible | 640×320 (dinámico en PyTorch) | 91,4 FPS TensorRT INT8 en Jetson Orin Nano | Apache 2.0 | Hugging Face |
| DepthAnythingV2 ViT-Large | Transformer (ViT) | no disponible | no disponible | no disponible | no disponible | no disponible (usado como profesor para pseudo-etiquetas) |

No se dispone de datos de benchmarks comparativos con otras alternativas de estimación de profundidad monocular en la información proporcionada.

## Limitaciones y advertencias

- El modelo estima profundidad relativa, no profundidad métrica absoluta; no proporciona distancias en metros sin calibración adicional.
- Entrenado exclusivamente con escenas de calle; su comportamiento en interiores, entornos industriales u otras distribuciones de imagen no está caracterizado.
- No se han publicado análisis de sesgos demográficos, geográficos ni de condiciones meteorológicas extremas; el dataset incluye fuentes diversas (BDD100K, Mapillary, KITTI, Indian Driving Dataset) pero no se documenta su cobertura.
- Riesgo de degradación en condiciones de iluminación adversas, lluvia, nieve o deslumbramiento, no cuantificado en la información disponible.
- La versión ONNX preexportada de Scene3DLite fija la entrada a [1, 3, 320, 640]; para otras resoluciones hay que reexportar desde PyTorch.
- Scene3D original consume 224 GOPs, lo que limita su uso en hardware embebido de gama baja; el autor recomienda Scene3DLite para despliegue en tiempo real y reserva Scene3D para compatibilidad con VisionPilot 0.9.
- Licencia Apache 2.0: permite uso comercial con atribución y sin garantías; no se documentan restricciones adicionales.
- No es un modelo de lenguaje ni de propósito general: no admite instrucciones en texto, tool calling ni razonamiento multi-paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AutowareFoundation/scene_3d
- Repositorio GitHub: https://github.com/autowarefoundation/scene_3d
- Demo 1: https://huggingface.co/AutowareFoundation/scene_3d/resolve/main/assets/scene3d_demo_1.mp4
- Demo 2: https://huggingface.co/AutowareFoundation/scene_3d/resolve/main/assets/scene3d_demo_2.mp4
- Página de la Autoware Foundation: https://www.autoware.org/
