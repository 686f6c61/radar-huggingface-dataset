# litert-community/xfeat-litert

## Resumen

XFeat (Accelerated Features) es un extractor de características locales ligero basado en una red neuronal convolucional pura, diseñado originalmente para tareas de correspondencia de imágenes como SLAM, realidad aumentada y registro de imágenes. Esta versión, publicada por la comunidad LiteRT (sucesor de TensorFlow Lite), reautoriza el modelo original a un formato `.tflite` optimizado para ejecución nativa en GPU mediante la herramienta `litert_torch`. El resultado es un modelo de apenas 1,4 MB en precisión FP16, capaz de procesar una imagen de 480×640 píxeles en escala de grises en aproximadamente 0,4 ms en un Pixel 8a con aceleración GPU.

La relevancia de este modelo radica en su extremada eficiencia para despliegue en dispositivos móviles y embebidos, donde el coste computacional y la memoria son críticos. Al estar reescrito para ser completamente residente en GPU (72/72 nodos en una sola partición), evita los cuellos de botella de las operaciones no soportadas por los delegados de aceleración. El modelo mantiene la licencia Apache-2.0 y los pesos oficiales del XFeat original, solo se ha modificado el grafo de operaciones para hacerlo compatible con la aceleración por hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN pura (convolucional) |
| Parametros totales | ~1,5 millones (aproximado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | FP16 (tambien disponible version FP32) |
| Idiomas soportados | no aplica (procesa imagenes en escala de grises) |
| Licencia | Apache-2.0 |
| Formato de pesos | TFLite (`.tflite`) |

## Arquitectura y entrenamiento

XFeat es una red puramente convolucional que extrae tres salidas a una resolucion reducida (H/8 × W/8): descriptores densos de 64 dimensiones, logits de keypoints (64 posiciones + un "dustbin" para celdas sin punto) y un heatmap de fiabilidad. La version LiteRT reautoriza el grafo original para eliminar operaciones incompatibles con la aceleracion GPU: la normalizacion InstanceNorm se traslada al lado del host (CPU) para evitar desbordamientos en FP16, y la operacion `_unfold2d` (space-to-depth) se sustituye por una convolucion one-hot equivalente `Conv2d(1,64,k=8,s=8)`, logrando un grafo con cero operaciones GATHER, SELECT, TopK o Cast, y sin tensores de mas de 4 dimensiones.

El entrenamiento original de XFeat se realizo con datos de correspondencias publicas, principalmente el dataset MegaDepth complementado con homografias sinteticas. No se ha realizado ningun reentrenamiento para esta version; solo se ha reescrito el grafo de operaciones manteniendo los pesos oficiales. El modelo no genera informacion personal ni atributos faciales, solo keypoints geometricos y descriptores.

## Capacidades

- Extraccion de keypoints locales con puntuacion de fiabilidad (heatmap).
- Generacion de descriptores densos de 64 dimensiones por celda.
- Matching de imagenes por vecinos mas cercanos mutuos (mutual nearest neighbor) con umbral de coseno (>= 0.82).
- Deteccion de correspondencias entre dos vistas de la misma escena, incluso con transformaciones homograficas (rotacion + traslacion).
- Ejecucion en GPU movil con latencias inferiores a 1 ms en hardware moderno.
- Soporte para integracion en aplicaciones Android via LiteRT CompiledModel API.
- No incluye capacidades de lenguaje, tool calling ni agentes; es exclusivamente un modelo de vision geometrica.

## Casos de uso

- **SLAM en dispositivos moviles**: el modelo puede alimentar sistemas de localizacion y mapeo simultaneo en tiempo real, proporcionando correspondencias estables entre frames consecutivos con una latencia de ~0.4 ms en GPU, lo que permite tasas de fotogramas altas en telefonos de gama media.
- **Realidad aumentada**: para anclar objetos virtuales al mundo real, se necesitan correspondencias precisas entre la imagen de la camara y un mapa de referencia. XFeat LiteRT ofrece la velocidad necesaria para tracking continuo sin agotar la bateria.
- **Registro de imagenes medicas**: en aplicaciones de diagnostico por imagen, el modelo puede alinear imagenes de la misma modalidad (por ejemplo, radiografias) con transformaciones geometricas, gracias a su robustez frente a cambios de perspectiva.
- **Reconstruccion 3D a partir de multiples vistas**: al extraer keypoints y descriptores consistentes, el modelo permite emparejar imagenes de una secuencia para generar nubes de puntos o mallas 3D en pipelines de fotogrametria movil.
- **Seguimiento de objetos en video**: las correspondencias entre frames consecutivos permiten estimar el movimiento de la camara o de objetos estaticos, util para estabilizacion de video o tracking en tiempo real.
- **Verificacion de integridad de documentos**: comparando dos fotografias de un mismo documento (por ejemplo, un pasaporte) con diferentes condiciones de iluminacion o angulo, el modelo puede determinar si corresponden al mismo original, gracias a su capacidad de matching geometrico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) porque se trata de un modelo de vision, no de lenguaje. Los datos de rendimiento disponibles se refieren a latencia de inferencia en hardware especifico, medidos con la herramienta `benchmark_model` de TFLite en un Pixel 8a (Tensor G3, Android 16):

| Runtime | Backend | Grafo en GPU | Latencia media |
|---|---|---|---|
| TFLite `benchmark_model` (TfLiteGpuDelegateV2) — `xfeat.tflite` | GPU (OpenCL) | 72/72 | 22.8 ms |
| TFLite `benchmark_model` (TfLiteGpuDelegateV2) — `xfeat_fp16.tflite` | GPU (OpenCL) | 73/73 | 24.1 ms |
| LiteRT CompiledModel (LITERT_CL) — `xfeat_fp16.tflite` | GPU (Adreno) | 72/72 | ~0.4 ms |
| LiteRT CompiledModel — `xfeat.tflite` | NPU (Hexagon v81) | — | 607.5 ms (mediana) |
| LiteRT CompiledModel — `xfeat_fp16.tflite` | NPU (Hexagon v81) | — | 384.5 ms (mediana) |

Nota: la latencia de ~0.4 ms corresponde al runtime LiteRT CompiledModel, que es el camino recomendado para produccion. Las filas con TFLite OpenCL delegate representan un piso reproducible con la herramienta estandar, pero no son comparables directamente con el runtime LiteRT. XNNPACK (CPU) rechazo el grafo por operaciones no soportadas, por lo que no hay cifra de CPU util.

## Requisitos de hardware

- **VRAM estimada**: no aplica; el modelo ocupa 1.4 MB en disco y su huella en memoria de GPU es minima (inferior a 10 MB).
- **GPU recomendadas**: cualquier GPU movil compatible con OpenCL o Vulkan (Adreno, Mali, PowerVR). Verificado en Pixel 8a (Adreno 730). No requiere GPU de servidor.
- **Compatibilidad con GPU de consumo**: no aplica, es un modelo para edge; puede ejecutarse en CPU de escritorio pero sin aceleracion seria ~20x mas lento.
- **Opciones de despliegue**: LiteRT (CompiledModel API), TFLite con delegado GPU, o mediante el interprete estandar de TFLite. Tambien disponible para Android via Kotlin.
- **Latencia y throughput**: ~0.4 ms por imagen en GPU movil (Pixel 8a), lo que permite procesar mas de 2000 imagenes por segundo en ese hardware.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros extractores de caracteristicas locales (como SuperPoint, ALIKED o DISK) en la informacion proporcionada. La comparativa se limita a las diferencias arquitectonicas y de despliegue:

| Modelo | Parametros | Formato | Aceleracion GPU | Licencia |
|---|---|---|---|---|
| XFeat LiteRT | ~1.5M | TFLite | Si (nativa) | Apache-2.0 |
| SuperPoint | ~1.3M | PyTorch/ONNX | Requiere conversion | Apache-2.0 (no oficial) |
| ALIKED | ~0.7M | PyTorch | Requiere conversion | Apache-2.0 |

No se han encontrado benchmarks publicos que comparen estos modelos en las mismas condiciones de hardware movil.

## Limitaciones y advertencias

- **Entrada fija**: el modelo acepta exclusivamente imagenes de 480×640 píxeles en escala de grises. Cualquier otro tamano requiere redimensionamiento previo, lo que puede afectar a la precision.
- **Normalizacion host-side**: la normalizacion InstanceNorm debe realizarse en la CPU antes de pasar la imagen al modelo; si se omite, los resultados seran incorrectos.
- **Sin soporte de color**: el modelo ignora la informacion cromatica, lo que limita su uso en escenas donde el color es discriminativo.
- **Riesgo de alucinacion**: al ser un modelo geometrico, no genera contenido semantico, pero puede producir keypoints espurios en texturas repetitivas o areas sin estructura.
- **Dependencia de la GPU**: en dispositivos sin aceleracion GPU compatible, el modelo no se ejecuta (XNNPACK lo rechaza) o es extremadamente lento con kernels de referencia.
- **Licencia**: Apache-2.0 permite uso comercial, pero se debe mantener el aviso de copyright y la atribucion correspondiente.
- **Sin garantias de precision en condiciones extremas**: el entrenamiento se baso en MegaDepth y homografias sinteticas; escenarios con cambios de iluminacion drasticos o oclusiones severas pueden degradar el matching.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/litert-community/xfeat-litert)
- [README del modelo](https://huggingface.co/litert-community/xfeat-litert/blob/main/README.md)
- [Repositorio de ejemplos LiteRT (incluye app de matching)](https://github.com/google-ai-edge/litert-samples)
- [Documentacion de LiteRT](https://ai.google.dev/edge/litert)
- [Herramienta benchmark_model de LiteRT](https://ai.google.dev/edge/litert/models/measurement)
