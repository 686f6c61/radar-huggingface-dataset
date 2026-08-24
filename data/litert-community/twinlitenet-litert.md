# litert-community/TwinLiteNet-LiteRT

## Resumen

TwinLiteNet-LiteRT es una conversión del modelo TwinLiteNet (2023) al formato LiteRT (antes TFLite) realizada por la comunidad LiteRT, optimizada para ejecución completamente en GPU mediante el delegado `CompiledModel` con acelerador GPU. El modelo original, desarrollado por chequanghuy, es una red neuronal puramente convolucional basada en el encoder ESPNet-C con dos cabezas de segmentación: una para área transitable (drivable area) y otra para líneas de carril (lane lines), ambas tareas propias de sistemas ADAS y conducción autónoma.

El modelo pesa solo 3.1 MB y procesa imágenes de 360×640 píxeles, generando dos mapas de logits de salida. Su relevancia actual radica en que demuestra cómo ejecutar segmentación semántica en tiempo real en dispositivos móviles, con una latencia de aproximadamente 44 ms por frame en un Pixel 8a y de unos 13.6 ms en hardware Snapdragon 8 Elite Gen 5, sin necesidad de cuantización a int8 para alcanzar el NPU. La conversión incluye un parche sobre las capas `ConvTranspose2d` (sustituidas por `ZeroStuffConvT2d`) para que el delegado GPU de Mali acepte todas las operaciones del grafo.

La licencia es MIT, y los pesos provienen del entrenamiento sobre el dataset BDD100K, disponible públicamente en el repositorio original de TwinLiteNet.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ESP-Net-C encoder + dos decoders de segmentación (CNN puro) |
| Parámetros totales | no disponible (peso del archivo: 3,1 MB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantización | fp16 (sin int8; no requiere cuantización para NPU) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | MIT |
| Formato de pesos | LiteRT (TFLite) con delegado GPU `CompiledModel`; archivo `twinlite.tflite` |

## Arquitectura y entrenamiento

TwinLiteNet es una red totalmente convolucional basada en el encoder ESP-Net, que utiliza convoluciones eficientes por bloques para reducir el coste computacional. El encoder extrae características de la imagen de entrada, y dos decoders separados producen sendos mapas de logits de segmentación: uno para el área transitable y otro para las líneas de carril. Cada salida tiene forma `[1, 2, 360, 640]` donde la dimensión de clases (2) se reduce con `argmax` para obtener una máscara binaria.

El entrenamiento original se realizó sobre el dataset BDDD100K (Berkeley DeepDrive), que incluye imágenes de conducción en diversas condiciones. Los pesos MIT son los publicados por chequanghuy en el repositorio oficial. La conversión a LiteRT se realizó con la herramienta `litert-torch` (`build_twinlite.py`), que carga los pesos, sustituye las capas `ConvTranspose2d` de upsampling por `ZeroStuffConvT2d` (una operación que combina nearest-upsample, máscara de stride y convolución volteada) para que el delegado GPU acepte el grafo completo. El resultado es un modelo con 270 nodos, todos ejecutados en GPU sin fallback, y con correlación exacta (1.0) frente a la salida de PyTorch.

## Capacidades

- Segmentación de área transitable: genera una máscara binaria que indica las regiones de la imagen donde el vehículo puede circular.
- Detección de líneas de carril: genera una máscara binaria que marca los píxeles correspondientes a las líneas de carretera.
- Ejecución en tiempo real en dispositivo: latencia de ~44 ms por frame en Pixel 8a con GPU, y ~13.6 ms en Snapdragon 8 Elite Gen 5 (GPU o NPU).
- Compatible con GPU móviles (Mali, Adreno) vía delegado LiteRT `CompiledModel` y con NPU Hexagon (Snapdragon) mediante compilación AOT, sin fallback a CPU.
- Entrada RGB de 320×640 píxeles, normalizada con división por 255, en formato NCHW.
- Soporte de inferencia en Android (Kotlin) y Python (LiteRT / `ai-edge-litert`).

## Casos de uso

- **Sistemas de asistencia al conductor (ADAS) en vehículos**: el modelo se integra en una cámara frontal para proporcionar en tiempo real la zona transitable y la posición de los carriles, ayudando a sistemas de alerta de salida de carril o de mantenimiento de trayectoria.
- **Conducción autónoma de bajo coste**: en plataformas de bajo consumo (Raspberry Pi con acelerador, teléfonos móviles), puede servir como bloque de percepción para vehículos autónomos de investigación, gracias a su tamaño de 3,1 MB y su latencia de decenas de milisegundos.
- **Robótica móvil en entornos estructurados**: robots de reparto o plataformas móviles en almacenes pueden usar la segmentación de área transitable para navegar en pasillos y evitar obstáculos en el suelo.
- **Aplicaciones móviles de realidad aumentada**: sobre un teléfono Android, el modelo puede superponer la máscara de área transitable sobre la cámara para aplicaciones de asistencia a peatones o de navegación asistida.
- **Investigación en visión por computador**: como referencia de segmentación ligera y eficiente, se puede comparar contra otros modelos en estudios de latencia y precisión en hardware móvil.
- **Sistemas de conducción autónoma en simuladores**: integración en entornos como CARLA o AirSim para generar etiquetas de área transitable y carriles a partir de imágenes sintéticas, aprovechando su ejecución en GPU en tiempo real.

## Benchmarks y rendimiento

La model card reporta las siguientes mediciones de latencia (media de 50 ejecuciones tras 10 de calentamiento) en un Pixel 8 (Tensor G3, Android 16):

| Runtime | Backend | Latencia |
|---|---|---|
| LiteRT `CompiledModel` (`LITERT_CL`) | GPU (OpenCL) | ~44 ms |
| TFLite `benchmark_model` (`TfLiteGpuDelegateV2`) | GPU (OpenCL) | 127.4 ms |
| TFLite `benchmark_model` (XNNPACK, 4 hilos) | CPU | 697.5 ms |

Mediciones adicionales en un Samsung Galaxy S26 (Snapdragon 8 Elite Gen 5, Hexagon v81), con 5 calentamientos y 50 ejecuciones:

| Unidad de cómputo | Inferencia (mediana / mínima) | Primera carga | Margen térmico |
|---|---|---|---|
| NPU (Hexagon, contexto AOT) | 13.86 ms / 13.57 ms | 121 ms | 0.66 |
| GPU (Adreno) | 13.56 ms / 10.57 ms | 1387 ms | 0.66 |

No se han publicado resultados de precisión (mIoU, F1, etc.) en la información disponible; la model card no incluye métricas de exactitud sobre BDDD100K.

## Requisitos de hardware

- **VRAM estimada**: el modelo pesa 3,1 MB en fp16, por lo que cabe en cualquier GPU móvil; no se requieren requisitos especiales de memoria.
- **GPU recomendadas**: cualquier GPU compatible con OpenCL (Mali, Adreno, PowerVR, Intel iGPU, NVIDIA). En hardware móvil se recomienda usar el delegado GPU de LiteRT; en Snapdragon con NPU, la compilación AOT reduce la primera carga de 1387 ms a 121 ms.
- **Cabe en consumer GPU**: sí, incluso en las GPU integradas de los móviles; también en cualquier PC con GPU NVIDIA o AMD, aunque el modelo está pensado para despliegue en Android.
- **Opciones de despliegue**: LiteRT `CompiledModel` con acelerador GPU o NPU (Android, Kotlin); Python con `ai_edge_litert`; también se puede ejecutar con TFLite estándar (GPU delegate o CPU XNNPACK), aunque con mayor latencia.
- **Latencia y throughput**: ~44 ms/frame en Pixel 8 (GPU LiteRT), ~13.6 ms/frame en Snapdragon 8 Elite Gen 5 (GPU o NPU). La carga inicial es de 121 ms con NPU AOT, 1387 ms con GPU en el mismo dispositivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño | Arquitectura | Tareas | Licencia | Contexto |
|---|---|---|---|---|---|---|
| TwinLiteNet-LiteRT | no disponible | 3,1 MB | ESP-Net + 2 decoders | Segmentación de área transitable y carriles | MIT | LiteRT, GPU/NPU móvil |
| TwinLiteNet original | no disponible | no disponible | ESP-Net + 2 decoders | Ídem | MIT | PyTorch, CPU/GPU |
| ENet (segmentación ligera) | ~0,37 M | ~1,5 MB | CNN encoder-decoder | Segmentación semántica general | MIT | PyTorch, TensorFlow |
| UNet (segmentación) | ~13,4 M | ~50 MB | CNN encoder-decoder | Segmentación semántica general | MIT | PyTorch |

No se dispone de comparativa directa de precisión (mIoU, F1) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- **Sin métricas de precisión publicadas**: no se reportan valores de mIoU o F1 en el dataset BDDD100K en la model card, por lo que no es posible evaluar la calidad de segmentación de forma objetiva.
- **Modelo de visión, no textual**: no tiene capacidades de lenguaje; no soporta instrucciones en texto ni tool calling.
- **Resolución de entrada fija**: la entrada debe ser `[1, 3, 360, 640]` NCHW; cualquier cambio de resolución requiere reentrenamiento o redimensionamiento previo de la imagen.
- **Condiciones de entrenamiento**: entrenado sobre BDDD100K, por lo que su rendimiento puede degradarse en escenarios fuera de conducción en carretera (interiores, clima extremo, condiciones nocturnas severas).
- **Dependencia de la GPU**: el rendimiento óptimo depende de que el delegado GPU acepte todos los nodos; en dispositivos sin compatibilidad con la operación `ZeroStuffConvT2d` el modelo podría no ejecutarse en GPU y caer a CPU con latencia ~697 ms.
- **Licencia MIT**: permite uso comercial sin restricciones, pero el modelo no incluye garantías de seguridad; no debe usarse en sistemas de conducción autónoma sin validación adicional.
- **Sin cuantización int8**: el modelo se distribuye en fp16; para usar NPU Hexagon en Snapdragon se requiere compilación AOT, no se ha reportado soporte de cuantización int8 en la información disponible.

## Enlaces

- [Modelo en Hugging Face: litert-community/TwinLiteNet-LiteRT](https://huggingface.co/litert-community/TwinLiteNet-LiteRT)
- [Repositorio del modelo original: chequanghuy/TwinLiteNet (GitHub)](https://github.com/chequanghuy/TwinLiteNet)
- [Página de archivos del modelo en Hugging Face](https://huggingface.co/litert-community/TwinLiteNet-LiteRT/tree/main)
- [Benchmark comunitario en IoT AI Hub (MediaTek)](https://genio.mediatek.com/doc/iot-aihub/ai_hub/model_zoo/litert_analytical/community_contributed_model.html)
- [Herramienta de medición de LiteRT `benchmark_model`](https://ai.google.dev/edge/litert/models/measurement)
