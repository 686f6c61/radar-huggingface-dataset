# christianengel/DepthPro2-S-ONNX

## Resumen

DepthPro2-S-ONNX es una exportación no oficial a formato ONNX del modelo apple/DepthPro2-S, un estimador de profundidad métrica desarrollado por Apple Machine Learning Research. La exportación la mantiene christianengel y su objetivo es facilitar el despliegue del modelo en entornos de producción que no disponen de PyTorch, especialmente en robótica, sistemas ROS 2 y dispositivos Jetson. El modelo original resuelve la estimación de profundidad en metros a partir de una única imagen RGB, y esta versión elimina la red de estimación de distancia focal (23,5 millones de parámetros) para recibirla como entrada explícita, lo que la hace adecuada para cámaras ya calibradas.

La arquitectura subyacente es un transformer de visión con atención por bloques y tablas RoPE, del que no se detalla el número total de parámetros en la información disponible. El repositorio incluye variantes FP32, FP16 e INT8, además de modos de vídeo con ventana de cuatro fotogramas (stream y clip), todo con formas estáticas y opset 18. El tamaño del repositorio es de 0,8 GB y la licencia es Apple AML R, restringida a investigación no comercial.

La relevancia actual radica en que ofrece latencias de 3,6 ms por fotograma con TensorRT FP16 en una RTX 3090 (277,8 FPS) y de 8,8 ms con ONNX Runtime CUDA FP16, con una degradación de precisión muy contenida respecto a PyTorch FP32 (AbsRel de 0,0008 frente a 0,0000). Esto lo convierte en una opción práctica para percepción en tiempo real en robótica y vehículos autónomos, siempre que se respete la restricción de uso no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de vision con atencion por bloques y RoPE (Depth Pro 2) |
| Parametros totales | no disponible (se eliminan 23,5 M de la red focal) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; ventana de video de 4 fotogramas) |
| Tipos de cuantizacion | FP32, FP16, INT8 (pesos MatMul simetricos de 8 bits) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Apple AML R (solo investigacion no comercial) |
| Formato de pesos | ONNX (opset 18, formas estaticas) |

## Arquitectura y entrenamiento

El modelo base es un transformer de visión para estimación de profundidad métrica. La exportación conserva la atención por bloques del original, con tablas RoPE y una cabeza de profundidad que produce z-depth en metros. Se han eliminado la red de distancia focal (apple/DepthPro2-focal, 23,5 M de parámetros) y la normalización ImageNet, que ahora se aplica dentro del grafo. La operación final `depth = f_px / (W * inverse_depth)` también está incluida en el grafo, de modo que la salida es directamente profundidad métrica.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; estos datos corresponden al modelo original de Apple y no se detallan en la información proporcionada. La innovación técnica destacable de esta exportación es la separación de la atención del bloque 0, las tablas RoPE, la cabeza de profundidad y la división final en FP32 incluso en las variantes FP16, para evitar desbordamientos (logits de hasta 2e6) y NaN. También se ofrecen modos de vídeo: stream (un fotograma por llamada con caché de tres fotogramas como estado `past_*`/`present_*`) y clip (cuatro fotogramas conjuntos).

## Capacidades

- Estimación de profundidad métrica en metros a partir de una imagen RGB, con salida `inf` para zonas infinitamente lejanas (cielo).
- Entrada de distancia focal explícita (`f_px`) para cámaras calibradas, lo que elimina la necesidad de la red focal.
- Procesamiento de vídeo en modo stream con caché de tres fotogramas, equivalente al modo de vídeo sin buffer de Depth Pro 2.
- Procesamiento conjunto de clips de cuatro fotogramas con atención mutua.
- Ejecución en CPU y GPU mediante ONNX Runtime, y compilación a TensorRT para máxima velocidad.
- Integración con ROS 2 mediante un nodo que consume `Image` y `CameraInfo` y publica `32FC1` en metros, con `PointCloud2` opcional.
- No soporta tool calling, agentes ni capacidades multilingües; es un modelo puramente de visión.

## Casos de uso

- Robótica móvil con ROS 2: el nodo suscrito a `Image` y `CameraInfo` toma `f_px` de `k[0]` y publica profundidad métrica alineada con la cámara, lo que permite navegación y evitación de obstáculos en tiempo real gracias a los 3,6 ms por fotograma con TensorRT FP16.
- Percepción en vehículos autónomos: el modo stream con ventana de cuatro fotogramas mantiene coherencia temporal con una latencia de 11,5 ms por fotograma en ONNX Runtime CUDA FP16, adecuado para planificación de trayectorias a corta distancia.
- Despliegue en dispositivos Jetson: la compilación con `build_tensorrt.sh` y `trtexec --stronglyTyped` permite ejecutar el modelo en hardware embebido con FP16, evitando los NaN que producen `--fp16` y el proveedor TensorRT de ONNX Runtime.
- Reconstrucción 3D y nubes de puntos: la salida métrica en metros y el `PointCloud2` opcional del nodo ROS 2 facilitan la generación de mapas de profundidad para modelado de entornos y realidad aumentada.
- Inspección industrial y medición: al proporcionar profundidad calibrada en metros con AbsRel de 0,0008 en FP16, sirve para medir distancias en líneas de producción con cámaras previamente calibradas.
- Procesamiento por lotes en servidor sin GPU: la variante ORT CPU FP32 ofrece 259,4 ms por fotograma (3,9 FPS), suficiente para análisis offline de imágenes o vídeos en pipelines de datos.
- Investigación académica en estimación de profundidad: al ser una exportación con paridad verificada frente a PyTorch (AbsRel 0,0004 en FP32), permite reproducir resultados sin depender de PyTorch y comparar variantes de cuantización.

## Benchmarks y rendimiento

Rendimiento medido en una NVIDIA GeForce RTX 3090 con ONNX Runtime 1.23.2, resolución 480x640, un fotograma a la vez, de host a host. La VRAM pico corresponde al proceso completo (NVML).

| Modelo | Runtime | Latencia (ms/fotograma) | FPS | VRAM pico (MB) | Disco (MB) | AbsRel vs PyTorch FP32 |
|---|---|---:|---:|---:|---:|---:|
| DepthPro2-S | PyTorch BF16 (por defecto en Apple) | 10,3 | 96,9 | 622 | - | 0,0030 |
| DepthPro2-S | PyTorch FP32 | 10,5 | 95,1 | 588 | - | 0,0000 |
| DepthPro2-S | ORT CUDA FP32 | 11,6 | 86,2 | 798 | 99 | 0,0004 |
| DepthPro2-S | ORT CUDA FP16 | 8,8 | 114,1 | 548 | 51 | 0,0008 |
| DepthPro2-S | ORT CUDA INT8 | 11,8 | 84,8 | 796 | 38 | 0,0049 |
| DepthPro2-S | TensorRT FP16 | 3,6 | 277,8 | 480 | 56 | 0,0014 |
| DepthPro2-S | TensorRT FP16, stream ventana 4 | 15,1 | 66,2 | 546 | 57 | 0,0011 |
| DepthPro2-S | ORT CUDA FP16 stream, ventana 4 | 11,5 | 87,0 | 1378 | 51 | 0,0005 |
| DepthPro2-S | ORT CUDA FP16 clip de 4 | 8,8 | 113,2 | 2352 | 53 | 0,0005 |
| DepthPro2-S | ORT CPU FP32 | 259,4 | 3,9 | - | 99 | 0,0000 |
| DepthPro2-S | ORT CPU INT8 | 303,1 | 3,3 | - | 38 | 0,0049 |

Paridad de cada grafo frente a PyTorch FP32 en un fixture de 17 fotogramas: AbsRel entre 0,0002 y 0,0005 en FP32 y FP16, y entre 0,0042 y 0,0049 en INT8; delta1 de 1,0000 en todos los casos.

## Requisitos de hardware

- VRAM estimada para inferencia a 480x640: 548 MB en ORT CUDA FP16, 798 MB en ORT CUDA FP32, 480 MB en TensorRT FP16 y 796 MB en ORT CUDA INT8.
- Modos de vídeo: 1378 MB en ORT CUDA FP16 stream (ventana 4) y 2352 MB en ORT CUDA FP16 clip de 4.
- GPU recomendadas: RTX 3090 (mediciones oficiales), A100 y H100 por capacidad, y Jetson para despliegue embebido mediante TensorRT.
- Cabe en GPU de consumo: sí, con menos de 1 GB de VRAM en las variantes de un fotograma, por lo que es apto para tarjetas de gama media y para Jetson.
- Opciones de despliegue: ONNX Runtime (CPU y CUDA), TensorRT mediante `build_tensorrt.sh` con `trtexec --stronglyTyped`, y nodo ROS 2 del repositorio protortyp/depthpro2-onnx.
- Latencia y throughput: 3,6 ms por fotograma (277,8 FPS) con TensorRT FP16 en RTX 3090; 8,8 ms (114,1 FPS) con ORT CUDA FP16; 259,4 ms (3,9 FPS) en CPU FP32.
- No usar `--fp16` de trtexec ni el proveedor TensorRT de ONNX Runtime: pueden ejecutar la atención del bloque 0 o los LayerNorm en FP16 y devolver NaN.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Latencia (RTX 3090) | Licencia | Formato |
|---|---|---|---|---|---|
| DepthPro2-S-ONNX (esta ficha) | no disponible (sin red focal) | 480x640 o 384x672; ventana de 4 fotogramas | 3,6 ms TensorRT FP16 | Apple AML R (no comercial) | ONNX |
| apple/DepthPro2-S | no disponible (incluye red focal de 23,5 M) | misma base | 10,3 ms PyTorch BF16 | Apple AML R | PyTorch |
| apple/DepthPro2-focal | 23,5 M | red auxiliar de distancia focal | no disponible | Apple AML R | PyTorch |

No se dispone de datos de benchmarks de otros estimadores de profundidad métrica en la información proporcionada, por lo que la comparación se limita a las variantes del propio modelo base y su red focal.

## Limitaciones y advertencias

- Licencia Apple AML R: uso exclusivo para investigación y académico, sin uso comercial. Los pesos son una obra derivada del modelo de Apple.
- Exportación no oficial: no está afiliada ni respaldada por Apple.
- Sin red de distancia focal: requiere conocer `f_px`; en imágenes sin calibración hay que estimarla externamente.
- Sin padding: las dimensiones laterales deben ser múltiplos de 32.
- Formas estáticas: solo se admiten las resoluciones 480x640 y 384x672 incluidas en el repositorio.
- Riesgo de NaN en FP16 si no se sigue la receta de TensorRT indicada (atención del bloque 0, RoPE, cabeza de profundidad y división final en FP32).
- Precisión reducida en INT8: AbsRel de 0,0049 frente a 0,0000 en FP32, aceptable para algunas tareas pero no para medición de alta precisión.
- No se han documentado sesgos del modelo en la información disponible; al ser un estimador de profundidad, puede fallar en escenas fuera de distribución (superficies reflectantes, texturas repetitivas, iluminación extrema).
- No apto para texto, código, agentes ni tareas multilingües.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/christianengel/DepthPro2-S-ONNX
- Modelo base: https://huggingface.co/apple/DepthPro2-S
- Red focal original: https://huggingface.co/apple/DepthPro2-focal
- Demo en navegador: https://huggingface.co/spaces/christianengel/DepthPro2-ONNX
- Nodo ROS 2 y scripts: https://github.com/protortyp/depthpro2-onnx/tree/main/ros2
- Paper de referencia: arXiv:2611.26603
