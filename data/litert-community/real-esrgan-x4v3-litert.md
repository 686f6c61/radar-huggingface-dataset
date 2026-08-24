# litert-community/real-esrgan-x4v3-litert

## Resumen

Real-ESRGAN General x4v3 es un modelo de super-resolución de imágenes desarrollado originalmente por el equipo de Real-ESRGAN (Xinntao) y re-autorizado por la comunidad `litert-community` para ejecutarse de forma nativa en GPU mediante LiteRT (el sucesor de TFLite). Este modelo resuelve el problema de ampliar imágenes en tiempo real en dispositivos móviles y embebidos, ofreciendo un factor de escala 4x con calidad perceptiva superior a la interpolación bicúbica tradicional.

La arquitectura es SRVGGNetCompact, con aproximadamente 1,2 millones de parámetros y un tamaño de 3,5 MB en formato FP16. La conversión a LiteRT incluye una re-autoría del grafo para garantizar compatibilidad total con GPU, reemplazando operaciones como PReLU y PixelShuffle que los aceleradores gráficos suelen rechazar. El modelo acepta entradas de 128×128 píxeles y produce salidas de 512×512 píxeles, con una latencia de aproximadamente 1 ms en GPU en un Pixel 8a.

La relevancia actual radica en su capacidad para ejecutar super-resolución de alta calidad directamente en el dispositivo, sin depender de servicios en la nube, lo que lo hace adecuado para aplicaciones de fotografía móvil, mejora de imágenes en tiempo real y procesamiento de vídeo. Su licencia BSD-3-Clause permite uso comercial sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SRVGGNetCompact (CNN) |
| Parametros totales | ~1,2 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | FP16 (sin int8 requerido para NPU) |
| Idiomas soportados | No aplica (modelo de imagen) |
| Licencia | BSD-3-Clause |
| Formato de pesos | .tflite (LiteRT CompiledModel) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura SRVGGNetCompact, una red neuronal convolucional compacta diseñada para super-resolución eficiente. La conversión a LiteRT implica una re-autoría del grafo computacional para garantizar la compatibilidad con GPU: la operación PReLU se sustituye por una combinación de `relu(x) − a·relu(−x)` con parámetros por canal, y el PixelShuffle se reemplaza por una ConvTranspose con one-hot (ZeroStuffConvT), evitando así operaciones de más de 4 dimensiones y garantizando una residencia completa en GPU.

El entrenamiento original fue realizado por los autores de Real-ESRGAN utilizando datasets públicos de super-resolución (DIV2K, Flickr2K, OST) con un pipeline de degradación sintética de alto orden. No se utilizaron datos privados ni adicionales; los pesos son la versión oficial, solo se modificó el grafo de operaciones para la conversión. El modelo no incluye etapas de RLHF ni DPO, ya que es un modelo de visión sin texto.

## Capacidades

- Super-resolución de imágenes con factor 4x, aceptando entradas de 128×128 píxeles y produciendo salidas de 512×512 píxeles.
- Procesamiento de imágenes en color RGB, con entrada en formato NHWC y salida en formato NCHW, ambas con valores normalizados en el rango [0, 1].
- Ejecución nativa en GPU mediante LiteRT CompiledModel, con residencia completa del grafo en el acelerador (211/211 nodos).
- Compatibilidad con Qualcomm Hexagon NPU sin necesidad de conversión adicional ni cuantización int8, gracias al formato FP16.
- Soporte para procesamiento por tiles: las imágenes más grandes pueden dividirse en parches de 128×128 píxeles y procesarse por separado.
- Integración sencilla con Android (Kotlin) y Python mediante la API de LiteRT.

## Casos de uso

- Mejora de imágenes en tiempo real en aplicaciones móviles: el modelo puede integrarse en apps de fotografía para ampliar imágenes a 4x con calidad perceptible, gracias a su latencia de ~1 ms en GPU de gama alta.
- Restauración de imágenes antiguas o de baja resolución: su pipeline de degradado sintético lo hace robusto a ruido, desenfoque y compresión, adecuado para aplicaciones de digitalización de archivos históricos.
- Aumento de resolución en vídeo en streaming: con tiling y procesamiento por parches, puede aplicarse a vídeo en tiempo real en dispositivos móviles para mejorar la calidad visual en reproductores.
- Análisis de imágenes médicas en dispositivos de campo: la super-resolución puede mejorar la nitidez de radiografías o ecografías capturadas con dispositivos portátiles, facilitando el diagnóstico remoto.
- Aplicaciones de visión por computador en el borde (edge computing): el modelo cabe en memoria de dispositivos embebidos (3,5 MB) y puede ejecutarse en GPU o NPU, ideal para cámaras inteligentes y drones.
- Generación de miniaturas de alta calidad para galerías y redes sociales: permite ampliar imágenes pequeñas sin pérdida de calidad, mejorando la experiencia de visualización en pantallas de alta resolución.

## Benchmarks y rendimiento

El modelo no presenta resultados de benchmarks de razonamiento o lenguaje (MMLU, HumanEval, GSM8K) porque es un modelo de visión por computador. En su lugar, se han publicado datos de latencia medidos con la herramienta `benchmark_model` de TFLite en dispositivos reales:

| Runtime | Backend | Grafo en GPU | Latencia |
|---|---|---|---|
| LiteRT `CompiledModel` (`LITERT_CL`) | GPU | 211 / 211 | ~1 ms |
| TFLite `benchmark_model` (`TfLiteGpuDelegateV2`) | GPU (OpenCL) | 210 / 210 | 40,4 ms |
| TFLite `benchmark_model` | CPU (XNNPACK, 4 hilos) | — | 532,1 ms |

En un Samsung Galaxy S26 (Snapdragon 8 Elite Gen 5, Hexagon v81), los resultados fueron:

| Compute unit | Inferencia (mediana / mínima) | Carga | Headroom de inicio |
|---|---|---|---|
| NPU (Hexagon) — primera ejecución | 10,12 ms / 10,04 ms | 2906 ms | 0,58 |
| NPU (Hexagon) — caché | 10,26 ms / 10,07 ms | 102 ms | 0,59 |
| GPU (Adreno) | 14,07 ms / 13,59 ms | 407 ms | 0,59 |

El NPU es 1,4 veces más rápido en inferencia que la GPU en este dispositivo, y la carga inicial es 4,0 veces menor gracias a la compilación on-device.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo ocupa 3,5 MB en disco y requiere aproximadamente 3,5 MB de VRAM en FP16, más el espacio para tensores intermedios (no especificado).
- GPU recomendadas: cualquier GPU compatible con OpenCL o Vulkan en dispositivos móviles (Adreno, Mali, Apple Silicon). En el test, el Pixel 6 (Tensor G3) y el Galaxy S26 (Adreno) obtuvieron buenos resultados.
- Cabe en consumer GPU: sí, cualquier GPU de smartphone o PC con al menos 4 GB de VRAM puede ejecutar el modelo sin problemas.
- Opciones de despliegue: LiteRT CompiledModel (GPU/NPU), TFLite Interpreter (CPU/GPU), llama.cpp (no aplica, es un modelo de imagen), Ollama (no aplica).
- Latencia y throughput estimados: ~1 ms en GPU premium (Pixel 8a), 10-14 ms en NPU/GPU del Galaxy S26, 532 ms en CPU del Pixel 8a.

## Comparativa con modelos similares

| Modelo | Parámetros | Factor de escala | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Real-ESRGAN General x4v3 (LiteRT) | ~1,2 M | 4x | .tflite | BSD-3-Clause | HuggingFace |
| Real-ESRGAN x4plus | ~16,7 M | 4x | .pth (PyTorch) | BSD-3-Clause | GitHub |
| Real-ESRGAN x2 | ~1,2 M | 2x | .pth (PyTorch) | BSD-3-Clause | GitHub |

La versión x4plus es más pesada y requiere más cómputo, pero ofrece una calidad ligeramente superior en algunos casos. La versión LiteRT x4v3 está optimizada para despliegue en dispositivos móviles, con una latencia mucho menor y un tamaño de archivo reducido.

## Limitaciones y advertencias

- El modelo solo procesa imágenes de entrada de 128×128 píxeles; imágenes más grandes deben dividirse en tiles de 128×128, lo que puede causar artefactos en los bordes si no se gestiona correctamente la superposición.
- La salida es en formato NCHW mientras que la entrada es NHWC, lo que requiere conversión de formato en el código de aplicación.
- No se han publicado datos sobre sesgos o alucinaciones, pero al ser un modelo de imagen, los riesgos de alucinación son bajos; sin embargo, puede introducir artefactos visuales en imágenes con texturas complejas o compresión extrema.
- La licencia BSD-3-Clause permite uso comercial, pero se recomienda revisar los términos de la licencia original de Real-ESRGAN para cumplir con los requisitos de atribución.
- Para ejecutar en NPU, se requieren bibliotecas específicas de Qualcomm (libQnnHtp.so) y Google (libLiteRtDispatch_Qualcomm.so, libLiteRtCompilerPlugin_Qualcomm.so) que no se distribuyen desde este repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/litert-community/real-esrgan-x4v3-litert
- Repositorio original de Real-ESRGAN: https://github.com/xinntao/Real-ESRGAN
- Ejemplo de demo de LiteRT JS con Real-ESRGAN: https://github.com/google-ai-edge/LiteRT/tree/main/litert/js/demos/real_esrgan
- Documentación de LiteRT para medición de rendimiento: https://ai.google.dev/edge/litert/models/measurement
- Repositorio de LiteRT: https://github.com/google-ai-edge/LiteRT/releases
- Documentación de Real-ESRGAN en LibreYOLO: https://www.libreyolo.com/docs/models/real-esrgan</think>## Resumen

Real-ESRGAN General x4v3 es un modelo de super-resolución de imágenes desarrollado por el grupo de investigación de Real-ESRGAN y reautorizado por la comunidad `litert-community` para ejecutarse de forma nativa en GPU y NPU mediante LiteRT, el sucesor de TensorFlow Lite. Este modelo resuelve el problema de ampliar imágenes en tiempo real con un factor 4x, manteniendo una calidad perceptiva superior a la interpolación bicúbica tradicional, y está diseñado para despliegue on-device en móviles y dispositivos embebidos.

La arquitectura es una SRVGGNetCompact con aproximadamente 1,2 millones de parámetros, un peso de 3,5 MB en formato FP16, y una ventana de entrada de 128×128 píxeles que produce salidas de 512×512 píxeles. La conversión a LiteRT ha sido re-autorizada para garantizar residencia completa del grafo en GPU, eliminando operaciones como PReLU y PixelShuffle que los aceleradores gráficos rechazan. En un Pixel 8a, el modelo se ejecuta en aproximadamente 1 ms en GPU, lo que lo hace viable para aplicaciones de procesamiento de imagen en tiempo real.

La relevancia actual de esta conversión radica en su compatibilidad con el hardware móvil moderno, incluyendo el NPU Hexagon de Qualcomm, sin necesidad de cuantización adicional. Su licencia BSD-3-Clause permite uso comercial sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SRVGGNetCompact (CNN) |
| Parametros totales | ~1,2 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de imagen) |
| Tipos de cuantizacion | FP16 |
| Idiomas soportados | No aplica (modelo de imagen) |
| Licencia | BSD-3-Clause |
| Formato de pesos | .tflite (LiteRT CompiledModel) |

## Arquitectura y entrenamiento

El modelo es una red convolucional compacta de tipo SRVGGNetCompact, diseñada originalmente por el autor de Real-ESRGAN para super-resolución de imágenes. La conversión a LiteRT ha requerido una re-autoria del grafo para garantizar compatibilidad con GPU: la operación PReLU se sustituye por la expresión `relu(x) − a·relu(−x)` (exacta, solo con RELU/MUL/SUB), y el PixelShuffle se sustituye por una ConvTranspose one-hot con stride 4, evitando así operaciones de más de 4 dimensiones y operaciones no soportadas como GATHER, SELECT o TopK.

El entrenamiento original se realizó sobre datasets públicos de super-resolución (DIV2K, Flickr2K, OST) con un pipeline de degradación sintética de alta orden, generando imágenes de baja calidad para entrenar el modelo. No se han utilizado datos personales ni privados; los pesos son la versión oficial de Real-ESRGAN, solo se ha modificado el grafo de operaciones para el despliegue en GPU.

## Capacidades

- Super-resolución de imágenes con factor 4x, aceptando entradas de 128×128 píxeles y produciendo salidas de 512×512 píxeles.
- Procesamiento de imágenes en RGB, con entrada en formato NHWC y salida en formato NCHW, ambos con valores en el rango [0,1].
- Compatibilidad total con GPU mediante LiteRT CompiledModel, con residencia completa del grafo en el acelerador (211/211 nodos).
- Ejecución en NPU Qualcomm Hexagon sin necesidad de conversión ni cuantización adicional.
- Soporte de tiling: imágenes de mayor tamaño pueden dividirse en parches de 128×128 píxeles para su procesamiento.
- No soporta tool calling, agentes ni razonamiento multi-step, ya que es un modelo de visión puro.

## Casos de uso

- Aplicaciones de fotografía móvil: ampliar imágenes capturadas con baja resolución a 4x en tiempo real, mejorando la calidad percibida en pantallas de alta densidad de píxeles.
- Restauración de imágenes antiguas: procesar fotografías escaneadas de baja calidad para recuperar detalles y reducir artefactos de compresión, con un factor de escala 4x.
- Preprocesamiento de imágenes para visión artificial: ampliar regiones de interés (por ejemplo, matrículas o caras) en sistemas de vigilancia o análisis de imágenes, mejorando la precisión de los modelos posteriores.
- Mejora de imágenes médicas: ampliar imágenes de radiografías o ecografías para facilitar la inspección visual por parte de profesionales, con latencia de ~1 ms en GPU.
- Aplicaciones de realidad aumentada: ampliar texturas o imágenes de baja resolución en tiempo real para mejorar la experiencia visual en dispositivos móviles.
- Procesamiento de vídeo en tiempo real: aplicar super-resolución a frames de vídeo de baja resolución en streaming, manteniendo un throughput suficiente para 30 FPS en hardware compatible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de imagen (como PSNR o SSIM) en la información disponible. Sin embargo, se han proporcionado datos de latencia medidos en dispositivos reales:

| Runtime | Backend | Grafo en GPU | Latencia |
|---|---|---|---|
| LiteRT `CompiledModel` (`LITERT_CL`) | GPU | 211 / 211 | ~1 ms |
| TFLite `benchmark_model` (`TfLiteGpuDelegateV2`) | GPU (OpenCL) | 210 / 210 | 40,4 ms |
| TFLite `benchmark_model` | CPU (XNNPACK, 4 hilos) | — | 532,1 ms |

En un Samsung Galaxy S26 (Snapdragon 8 Elite Gen 5, Hexagon v81), la latencia medida fue:

| Compute unit | Inferencia (mediana / mínima) | Carga | Headroom de inicio |
|---|---|---|---|
| NPU (Hexagon) — primera ejecución | 10,12 ms / 10,04 ms | 2906 ms | 0,58 |
| NPU (Hexagon) — caché | 10,26 ms / 10,07 ms | 102 ms | 0,59 |
| GPU (Adreno) | 14,07 ms / 13,59 ms | 407 ms | 0,59 |

El NPU es 1,4 veces más rápido que la GPU en inferencia, y la carga tras la primera ejecución es 4 veces menor en el NPU (102 ms contra 407 ms).

## Requisitos de hardware

- VRAM estimada para inferencia: no se ha publicado un valor exacto, pero el modelo pesa 3,5 MB en FP16; la VRAM total dependerá del tamaño de los buffers intermedios.
- GPU recomendadas: cualquier GPU móvil con soporte OpenCL o Vulkan (Adreno, Mali, PowerVR). En el Pixel 8a (Tensor G3) se alcanza ~1 ms con LiteRT.
- Compatible con NPU Qualcomm Hexagon v81 (Snapdragon 8 Elite Gen 5) sin cuantización adicional.
- Cabe en GPUs de consumo: sí, cualquier GPU de smartphone o PC con soporte OpenCL es suficiente; no requiere GPU de gama alta.
- Opciones de despliegue: LiteRT `CompiledModel` con acelerador GPU o NPU, o TFLite `Interpreter` con delegado GPU o CPU (XNNPACK).
- Latencia estimada: ~1 ms en GPU (Pixel 8a, LiteRT), 10-14 ms en NPU/GPU (Galaxy S26), 532 ms en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Contexto | Uso principal |
|---|---|---|---|---|---|
| Real-ESRGAN x4v3 (LiteRT) | ~1,2 M | .tflite | BSD-3-Clause | No aplica | Super-resolución on-device |
| Real-ESRGAN x4plus | ~16,7 M | PyTorch | BSD-3-Clause | No aplica | Super-resolución de alta calidad en servidor |
| Real-ESRGAN ncnn-vulkan | ~1,2 M | ncnn | MIT | No aplica | Super-resolución en CPU/GPU via Vulkan |

La versión LiteRT destaca por su baja latencia en GPU y NPU móviles, mientras que x4plus ofrece mayor calidad a costa de más parámetros y cómputo. La versión ncnn-vulkan es una alternativa similar para despliegue en dispositivos, pero no está optimizada para LiteRT.

## Limitaciones y advertencias

- El modelo está limitado a entradas de 128×128 píxeles; imágenes más grandes deben dividirse en tiles, lo que puede causar artefactos en los bordes.
- La salida es en formato NCHW, mientras que la entrada es NHWC, lo que requiere conversión en el código de la aplicación.
- No se han publicado métricas de calidad de imagen (PSNR/SSIM) en la información disponible.
- El modelo no detecta ni reconoce caras, identidades ni atributos personales; solo amplía píxeles, pero puede amplificar artefactos de compresión o ruido en imágenes de baja calidad.
- La licencia BSD-3-Clause permite uso comercial, pero se recomienda revisar los términos de la licencia original de Real-ESRGAN para cumplir con las atribuciones.
- Para ejecutar en NPU Qualcomm, se requieren bibliotecas externas (`libLiteRtDispatch_Qualcomm.so`, `libLiteRtCompilerPlugin_Qualcomm.so`, `libQnnHtp.so`) que no se distribuyen desde este repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/litert-community/real-esrgan-x4v3-litert
- Repositorio original de Real-ESRGAN: https://github.com/xinntao/Real-ESRGAN
- Ejemplo de demo en JS de LiteRT: https://github.com/google-ai-edge/LiteRT/tree/main/litert/js/demos/real_esrgan
- Documentación de medición de rendimiento: https://ai.google.dev/edge/litert/models/measurement
- Repositorio de LiteRT: https://github.com/google-ai-edge/LiteRT/releases
- Documentación de Real-ESRGAN en LibreYOLO: https://www.libreyolo.com/docs/models/real-esrgan
