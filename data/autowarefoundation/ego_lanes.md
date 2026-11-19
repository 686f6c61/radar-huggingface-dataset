# AutowareFoundation/ego_lanes

## Resumen

EgoLanes es una red neuronal de segmentación semántica diseñada específicamente para la detección de límites de carril desde una cámara monocular frontal en vehículos. Desarrollada por la Autoware Foundation en el marco del proyecto VisionPilot (versión 0.9), la versión publicada en Hugging Face se presenta como un modelo "legacy" orientado a percepción de carriles en tiempo real sobre hardware embebido. Su relevancia radica en que permite construir sistemas de mantenimiento de carril y planificación de trayectorias sin depender de mapas HD, un requisito habitual en sistemas ADAS de nivel 2 y en pilotos de autopista.

Arquitectura encoder-context-decoder con backbone EfficientNet-B0, fusión multi-escala de características, un módulo de contexto basado en MLP con atención residual y un decoder con conexiones skip. La salida es una segmentación de tres canales a un cuarto de la resolución de entrada (160x80 píxeles para una imagen de 640x320), lo que reduce drásticamente el coste computacional y facilita la inferencia en dispositivos como Jetson Orin Nano.

El modelo clasifica los límites de carril en tres canales: límite izquierdo del ego-carril, límite derecho del ego-carril y el resto de límites. Está pensado como componente de percepción dentro de un pipeline mayor de conducción autónoma, no como modelo de propósito general. Su licencia Apache 2.0 y la disponibilidad de pesos en PyTorch y ONNX facilitan su integración en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-Context-Decoder (EfficientNet-B0 + fusión multi-escala + Context MLP con atención residual + decoder con skip connections) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 640x320) |
| Tipos de cuantizacion | FP32 (PyTorch y ONNX); no se documentan otras cuantizaciones |
| Idiomas soportados | no aplica (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pth), ONNX (FP32) |

## Arquitectura y entrenamiento

EgoLanes emplea un backbone EfficientNet-B0 preentrenado (modelo base `google/efficientnet-b0`) sobre el que se construye un pipeline de segmentación específico para carriles. Las características del backbone se combinan mediante fusión multi-escala, se procesan con un módulo de contexto basado en MLP con atención residual y se reconstruyen en un decoder con conexiones skip hasta una cabeza de segmentación de tres canales. La salida tiene un stride de 1/4 respecto a la entrada (160x80 para 640x320), lo que equilibra precisión y coste computacional.

El entrenamiento se realizó sobre múltiples datasets de conducción real: TuSimple, OpenLane, CurveLanes, Jiqing y ONCE3D Lane. La función de pérdida combina una binary cross-entropy con logits (`BCEWithLogitsLoss`) ponderada con mayor peso en los canales de límite izquierdo y derecho del ego-carril, junto con una pérdida multi-escala de preservación de bordes. No se documenta en la información disponible el número exacto de tokens, épocas, composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables en un modelo de visión de este tipo).

## Capacidades

- Segmentación semántica de límites de carril en imágenes monoculares frontales en color (RGB).
- Clasificación de tres tipos de límites: ego-izquierdo, ego-derecho y resto de carriles.
- Inferencia en tiempo real sobre hardware embebido (Jetson Orin Nano: 20,5 FPS con TensorRT FP32 a 640x320).
- Exportación a ONNX para despliegue con ONNX Runtime (CUDA o CPU).
- Integración con el ecosistema Autoware y el proyecto VisionPilot.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No dispone de modo "thinking", visión general, audio ni otras capacidades multimodales más allá de la imagen de entrada.

## Casos de uso

- Mantenimiento de carril (LKA) en vehículos de producción: el modelo proporciona la posición de los límites izquierdo y derecho del ego-carril a 20 FPS en Jetson Orin Nano, suficiente para un lazo de control de dirección en tiempo real.
- Piloto de autopista sin mapas HD: al detectar límites de carril directamente de la cámara, permite planificar trayectorias en vías no cartografiadas o con mapas desactualizados.
- Percepción redundante en sistemas ADAS: puede ejecutarse en paralelo a un sistema basado en mapas para validar o corregir la posición lateral del vehículo.
- Aviso de salida de carril (LDW): la segmentación por canales permite calcular la distancia a cada límite y disparar alertas cuando el vehículo se aproxima al borde.
- Investigación en conducción autónoma: como componente de referencia en pipelines de percepción dentro de Autoware, útil para comparar arquitecturas de segmentación de carriles.
- Prototipado rápido en robótica móvil y vehículos a escala: la exportación ONNX y la baja resolución de salida permiten desplegar el modelo en SBCs y GPUs de gama baja.
- Anotación asistida de datasets de carriles: las predicciones pueden usarse como preetiquetado para acelerar la curación de nuevos datos de conducción.

## Benchmarks y rendimiento

Resultados de validación publicados por el autor (entrada 640x320, stride de salida 1/4):

| Dataset | Métrica | Puntuación |
|---|---|---|
| CurveLanes | mIoU | 46,9 |
| TuSimple | mIoU | 43,6 |

Rendimiento de inferencia en Jetson Orin Nano (8 GB), 119 GOPs, incluyendo H2D + inferencia + D2H a 640x320:

| Backend | Forward (ms) | FPS |
|---|---|---|
| ONNX FP32 | 94,9 | 10,5 |
| TensorRT FP32 | 48,8 | 20,5 |

No se han publicado en la información disponible resultados comparativos con otros modelos de segmentación de carriles (por ejemplo, LaneNet, UFLD o PINet) ni métricas adicionales como precisión, recall o F1 por canal.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por el tamaño del repo (0,4 GB) y el backbone EfficientNet-B0, la huella en FP32 es del orden de cientos de MB, compatible con GPUs de gama baja.
- GPU recomendadas: Jetson Orin Nano (validado por el autor), Jetson Orin NX/AGX, RTX 3060 o superiores; cualquier GPU con soporte CUDA para ONNX Runtime.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con al menos 2 GB de VRAM; también puede ejecutarse en CPU con ONNX Runtime (latencia mayor, no medida en la información disponible).
- Opciones de despliegue: PyTorch nativo (`EgoLanesNetworkInfer`), ONNX Runtime (CUDA o CPU), TensorRT (validado en Jetson Orin Nano). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión de este tipo).
- Latencia y throughput: 48,8 ms / 20,5 FPS con TensorRT FP32 en Jetson Orin Nano; 94,9 ms / 10,5 FPS con ONNX FP32 en el mismo hardware.

## Comparativa con modelos similares

No se han publicado en la información disponible comparativas con otros modelos de segmentación de carriles. Se indica a continuación lo que se conoce de alternativas habituales de la categoría, sin datos de rendimiento verificados en esta ficha:

| Modelo | Tipo | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EgoLanes | Segmentación semántica de carriles | 640x320 | 3x80x160 | Apache 2.0 | Hugging Face + GitHub |
| LaneNet | Segmentación + clustering de instancias | variable | máscaras de instancia | MIT (referencia) | Repos públicos |
| UFLD / UFLDv2 | Detección de carriles basada en filas | variable | puntos por fila | MIT (referencia) | Repos públicos |
| PINet | Segmentación por keypoints | variable | puntos de carril | MIT (referencia) | Repos públicos |

No se dispone de datos de rendimiento comparables publicados por el autor para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Modelo marcado como "legacy" por el propio autor (VisionPilot 0.9); puede quedar obsoleto frente a versiones posteriores del proyecto.
- Solo procesa imágenes frontales monoculares; no utiliza información temporal, estéreo, LiDAR ni mapas, lo que limita la robustez en curvas cerradas, cruces y condiciones adversas.
- El mIoU publicado es moderado (46,9 en CurveLanes, 43,6 en TuSimple); la calidad de la segmentación en escenarios no representados en el entrenamiento puede degradarse.
- No se documentan análisis de sesgos, robustez frente a lluvia, nieve, deslumbramiento o nocturnidad; estos factores deben validarse antes de un uso en producción.
- Riesgo de alucinación de carriles en ausencia de marcas viales o con marcas ambiguas; debe integrarse con lógica de validación y redundancia.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación recae en el integrador.
- No es un modelo de lenguaje ni multimodal: no admite instrucciones en lenguaje natural ni tool calling.
- El tamaño del repo (0,4 GB) incluye pesos PyTorch y ONNX; la versión cuantizada a la que aluden los tags no está documentada con detalle en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AutowareFoundation/ego_lanes
- Repositorio GitHub: https://github.com/autowarefoundation/ego_lanes
- Modelo base: https://huggingface.co/google/efficientnet-b0
- Dataset TuSimple: https://www.kaggle.com/datasets/manideep1108/tusimple
- Dataset OpenLane: https://github.com/OpenDriveLab/OpenLane
- Dataset CurveLanes: https://github.com/SoulmateB/CurveLanes
- Demo 1: https://huggingface.co/AutowareFoundation/ego_lanes/resolve/main/assets/egolanes_demo_1.mp4
- Demo 2: https://huggingface.co/AutowareFoundation/ego_lanes/resolve/main/assets/egolanes_demo_2.mp4
- Pesos PyTorch: https://huggingface.co/AutowareFoundation/ego_lanes/resolve/main/models/egolanes.pth
- Pesos ONNX FP32: https://huggingface.co/AutowareFoundation/ego_lanes/resolve/main/models/egolanes_fp32.onnx
