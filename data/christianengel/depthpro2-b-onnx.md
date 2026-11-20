# christianengel/DepthPro2-B-ONNX

## Resumen

DepthPro2-B-ONNX es una exportación no oficial a formato ONNX del modelo apple/DepthPro2-B, un estimador de profundidad métrica monocular desarrollado por Apple Machine Learning Research. La exportación la mantiene christianengel y su objetivo es hacer el modelo desplegable en entornos de producción que no dependen de PyTorch, como ONNX Runtime, TensorRT y ROS 2, con especial atención a robótica y dispositivos NVIDIA Jetson. El modelo base es de tipo transformer con unos 23,5 millones de parámetros adicionales en la red de longitud focal que esta exportación elimina.

La diferencia principal respecto al original es que se ha suprimido la red que estima la longitud focal a partir de la imagen. En su lugar, el grafo recibe `f_px` como entrada explícita, lo que lo hace adecuado para cámaras calibradas, donde la focal se conoce por `CameraInfo`. La salida es profundidad métrica en metros (z-depth), con `inf` en las regiones infinitamente lejanas como el cielo. Se ofrecen variantes FP32, FP16 e INT8, además de grafos para vídeo con ventana de cuatro fotogramas (modo stream con caché y modo clip conjunto).

La relevancia actual radica en que permite ejecutar un modelo de profundidad métrica con paridad numérica verificada frente a PyTorch (AbsRel de 0,0002 en FP32) sobre infraestructura estándar de inferencia, con latencias de 7,1 ms por fotograma en TensorRT FP16 sobre una RTX 3090. La licencia es restrictiva: solo investigación y uso académico no comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer para estimación de profundidad monocular (Depth Pro 2), exportado a ONNX con formas estáticas y opset 18 |
| Parámetros totales | no disponible (el modelo base apple/DepthPro2-B; se eliminan los 23,5 M de la red de longitud focal) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana temporal de 4 fotogramas en las variantes stream y clip |
| Tipos de cuantización | FP32, FP16, INT8 (solo pesos, MatMul simétrico en bloques de 32) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | apple-amlr (Apple Machine Learning Research Model License), solo investigación no comercial |
| Formato de pesos | ONNX (opset 18, formas estáticas) |

Resoluciones soportadas: 480x640 y 384x672. Los lados deben ser múltiplos de 32 (no hay padding). Entradas: `pixel_values` float32 RGB en [0, 1], NCHW, sin normalizar; `f_px` float32 de forma (1,), focal horizontal en píxeles. Salida: `depth_meters` float32 de forma (T, H, W).

## Arquitectura y entrenamiento

El modelo base es un transformer para estimación de profundidad métrica monocular de Apple, del que esta exportación conserva el backbone y la cabeza de profundidad, pero elimina la red auxiliar de longitud focal (apple/DepthPro2-focal, 23,5 M de parámetros). La exportación integra en el grafo la normalización ImageNet y la conversión `depth = f_px / (W * inverse_depth)`, de modo que la salida ya está en metros. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esa información corresponde a la model card del modelo base, no incluida aquí.

Las innovaciones técnicas de la exportación son de ingeniería de despliegue más que de modelado. En FP16 se mantienen en FP32 la atención del bloque 0 (cuyos logits alcanzan 2e6), las tablas RoPE, la cabeza de profundidad y la división final, para evitar NaN. En INT8 solo se cuantizan los pesos de las MatMul; la cuantización dinámica de activaciones colapsa el backbone (delta1 < 0,5). Las variantes stream implementan el modo de vídeo sin buffer de Depth Pro 2: cada llamada procesa un fotograma atendiendo a los tres anteriores, con la caché expuesta como entradas `past_*` y salidas `present_*` (ceros en el primer fotograma). Las variantes clip procesan cuatro fotogramas conjuntamente, equivalente a `DepthPro2.infer` sobre un tensor (4, 3, H, W). Cada grafo supera una puerta de paridad numérica frente a PyTorch FP32 sobre un fixture de 17 fotogramas.

## Capacidades

- Estimación de profundidad métrica monocular en metros a partir de una imagen RGB y la focal horizontal en píxeles.
- Funcionamiento con cámaras calibradas: la focal se aporta como entrada, sin red de estimación.
- Procesamiento de vídeo en modo stream con ventana temporal de 4 fotogramas y estado recurrente (`past_*`/`present_*`).
- Procesamiento conjunto de clips de 4 fotogramas con atención mutua.
- Salida con valores `inf` para regiones infinitamente lejanas (cielo), útil para enmascarar fondo.
- Exportación a TensorRT mediante `trtexec --stronglyTyped` para máximo rendimiento.
- Integración con ROS 2: suscripción a `Image` y `CameraInfo`, publicación de profundidad `32FC1` en metros y, opcionalmente, `PointCloud2`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de lenguaje; es exclusivamente un modelo de visión.

## Casos de uso

- Robótica móvil con ROS 2: el nodo suscribe a `Image` y `CameraInfo`, toma `f_px` de `k[0]` de la imagen rectificada y publica profundidad métrica en metros alineada con la cámara, lo que permite planificación de trayectorias y evitación de obstáculos con escala real.
- Percepción en drones y robots a bordo de NVIDIA Jetson: los grafos ONNX FP16 con TensorRT ofrecen latencias del orden de milisegundos y huella de VRAM reducida, adecuadas para cómputo embebido en tiempo real.
- Reconstrucción 3D y nubes de puntos: la salida métrica en metros permite generar `PointCloud2` directamente con la intrinsics de la cámara, sin calibración de escala posterior, para mapeo y digitalización de entornos.
- Vídeo en tiempo real con consistencia temporal: las variantes stream de 4 fotogramas mantienen coherencia entre fotogramas consecutivos con un coste de estado acotado, útiles en seguimiento de objetos y SLAM denso.
- Automoción y ADAS en prototipos de investigación: la profundidad métrica calibrada con `f_px` de la cámara del vehículo permite estimar distancias absolutas a peatones y obstáculos sin sensores adicionales.
- Procesamiento por lotes de clips cortos: las variantes clip de 4 fotogramas procesan secuencias cortas conjuntamente, apropiadas para análisis offline de grabaciones o generación de datasets de profundidad.
- Despliegue sin PyTorch: pipelines de inferencia basados en ONNX Runtime (CPU o CUDA) que necesitan un modelo de profundidad sin dependencias del framework de entrenamiento.

## Benchmarks y rendimiento

Paridad numérica frente a PyTorch FP32 sobre fixture de 17 fotogramas (AbsRel y delta1):

| Fichero | Entrada | Precisión | MB | AbsRel | delta1 |
|---|---|---|---:|---:|---:|
| `onnx/model.onnx` | 480x640, 1 fotograma | FP32 | 387 | 0,0002 | 1,0000 |
| `onnx/model_fp16.onnx` | 480x640, 1 fotograma | FP16 | 199 | 0,0007 | 1,0000 |
| `onnx/model_int8.onnx` | 480x640, 1 fotograma | INT8 | 143 | 0,0032 | 1,0000 |
| `onnx/model_clip4.onnx` | 480x640, 4 fotogramas | FP32 | 389 | 0,0002 | 1,0000 |
| `onnx/model_clip4_fp16.onnx` | 480x640, 4 fotogramas | FP16 | 201 | 0,0006 | 1,0000 |
| `onnx/model_stream4.onnx` | 480x640, 1 + caché 3 | FP32 | 387 | 0,0001 | 1,0000 |
| `onnx/model_stream4_fp16.onnx` | 480x640, 1 + caché 3 | FP16 | 199 | 0,0005 | 1,0000 |
| `onnx/384x672/model.onnx` | 384x672, 1 fotograma | FP32 | 387 | 0,0003 | 1,0000 |
| `onnx/384x672/model_fp16.onnx` | 384x672, 1 fotograma | FP16 | 199 | 0,0007 | 1,0000 |
| `onnx/384x672/model_int8.onnx` | 384x672, 1 fotograma | INT8 | 143 | 0,0026 | 1,0000 |
| `onnx/384x672/model_stream4.onnx` | 384x672, 1 + caché 3 | FP32 | 387 | 0,0002 | 1,0000 |
| `onnx/384x672/model_stream4_fp16.onnx` | 384x672, 1 + caché 3 | FP16 | 199 | 0,0005 | 1,0000 |

Velocidad medida en NVIDIA GeForce RTX 3090 con ONNX Runtime 1.23.2, 480x640, un fotograma a la vez, de array de host a array de host; VRAM pico de todo el proceso vía NVML:

| Configuración | Runtime | Latencia (ms/fotograma) | FPS | VRAM pico (MB) | Disco (MB) | AbsRel vs PyTorch FP32 |
|---|---|---:|---:|---:|---:|---:|
| DepthPro2-B | PyTorch BF16 (por defecto Apple) | 11,5 | 86,6 | 1198 | - | 0,0022 |
| DepthPro2-B | PyTorch FP32 | 24,9 | 40,1 | 1112 | - | 0,0000 |
| DepthPro2-B | ORT CUDA FP32 | 22,4 | 44,6 | 1314 | 387 | 0,0002 |
| DepthPro2-B | ORT CUDA FP16 | 14,9 | 67,1 | 1322 | 199 | 0,0007 |
| DepthPro2-B | ORT CUDA INT8 | 23,1 | 43,2 | 1308 | 143 | 0,0030 |
| DepthPro2-B | TensorRT FP16 | 7,1 | 140,5 | 700 | 204 | 0,0009 |
| DepthPro2-B | TensorRT FP16, stream ventana 4 | 38,9 | 25,7 | 830 | 204 | 0,0009 |
| DepthPro2-B | ORT CUDA FP16 stream, ventana 4 | 21,7 | 46,0 | 2472 | 199 | 0,0005 |
| DepthPro2-B | ORT CUDA FP16 clip de 4 | 19,2 | 52,1 | 5430 | 201 | 0,0006 |

No se han publicado resultados de benchmarks estándar de profundidad (por ejemplo, métricas sobre datasets públicos como NYU o KITTI) en la información disponible; los datos anteriores miden paridad frente a PyTorch y latencia, no calidad absoluta frente a otros modelos.

## Requisitos de hardware

- VRAM estimada: el pico medido en RTX 3090 es de 700 MB con TensorRT FP16 y de 1112-1322 MB con PyTorch u ONNX Runtime en un solo fotograma; el modo clip de 4 fotogramas con ORT FP16 sube a 5430 MB y el stream con ORT FP16 a 2472 MB.
- GPU recomendadas: NVIDIA RTX 3090 (mediciones publicadas); cualquier GPU NVIDIA con soporte CUDA es apta para ONNX Runtime. Para TensorRT se requiere GPU NVIDIA y `trtexec`. Para Jetson se documenta el uso de TensorRT con `--stronglyTyped`.
- Cabe en GPU de consumo: sí; el modo de un solo fotograma cabe en GPUs con al menos unos 1,5 GB de VRAM libre, y el motor TensorRT FP16 reduce el pico a 700 MB.
- Opciones de despliegue: ONNX Runtime (CPU y CUDA), TensorRT (`build_tensorrt.sh`, `trtexec --stronglyTyped`) y ROS 2 mediante el nodo del repositorio. No se documentan vLLM, llama.cpp ni Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: 7,1 ms/fotograma y 140,5 FPS con TensorRT FP16; 14,9 ms y 67,1 FPS con ORT CUDA FP16; 22,4 ms y 44,6 FPS con ORT CUDA FP32; 38,9 ms y 25,7 FPS con TensorRT FP16 en modo stream de ventana 4 (RTX 3090).
- Advertencia de despliegue: no usar `--fp16` de TensorRT ni el proveedor TensorRT de ONNX Runtime, ya que pueden ejecutar la atención del bloque 0 o los LayerNorm del bloque B en FP16 y devolver NaN.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/ventana | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DepthPro2-B-ONNX (esta ficha) | no disponible (base apple/DepthPro2-B) | 1 fotograma; ventana de 4 en stream/clip | ONNX (FP32/FP16/INT8) | apple-amlr, solo investigación no comercial | Hugging Face, 0 descargas |
| apple/DepthPro2-B | no disponible | no disponible | PyTorch | apple-amlr | Hugging Face (modelo base) |
| apple/DepthPro2-focal | 23,5 M | no aplica | PyTorch | apple-amlr | Hugging Face (red de focal eliminada en esta exportación) |

No se dispone de información sobre otros modelos de estimación de profundidad métrica comparables (por ejemplo, alternativas de otros autores) en la documentación proporcionada, por lo que no se incluyen datos de rendimiento cruzado.

## Limitaciones y advertencias

- Licencia apple-amlr: uso exclusivamente de investigación y académico no comercial. Los pesos son una obra derivada (Model Derivative) bajo la Apple Machine Learning Research Model License; el uso comercial requiere licencia aparte de Apple.
- Exportación no oficial: no está afiliada ni respaldada por Apple; la responsabilidad de validación recae en el usuario.
- Requiere cámara calibrada: sin una `f_px` correcta la profundidad métrica será incorrecta; no hay red de estimación de focal.
- Formas estáticas: solo 480x640 y 384x672, y los lados deben ser múltiplos de 32; no hay padding, por lo que otras resoluciones requieren reexportación.
- INT8 solo con cuantización de pesos: la cuantización dinámica de activaciones degrada el modelo (delta1 < 0,5); el AbsRel de INT8 (0,0032) es mayor que el de FP32 (0,0002).
- Riesgo de NaN en TensorRT si se usa `--fp16` o el proveedor TensorRT de ONNX Runtime en lugar de `--stronglyTyped`.
- El modo stream con TensorRT copia el estado por memoria de host en cada fotograma, lo que penaliza la latencia (38,9 ms frente a 7,1 ms en un solo fotograma).
- No se dispone de información sobre sesgos del modelo base, tasas de alucinación en regiones ambiguas ni comportamiento en condiciones de iluminación adversas; deben evaluarse con datos propios antes de producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación externa muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/christianengel/DepthPro2-B-ONNX
- Modelo base: https://huggingface.co/apple/DepthPro2-B
- Red de longitud focal eliminada: https://huggingface.co/apple/DepthPro2-focal
- Demo en el navegador: https://huggingface.co/spaces/christianengel/DepthPro2-ONNX
- Repositorio con nodo ROS 2 y scripts: https://github.com/protortyp/depthpro2-onnx
- Nodo ROS 2: https://github.com/protortyp/depthpro2-onnx/tree/main/ros2
- Paper de referencia (arXiv): arxiv:2611.26603 (identificador citado en los tags del repositorio)
