# litert-community/ormbg-LiteRT

## Resumen

ormbg-LiteRT es la conversión oficial a LiteRT (antes TensorFlow Lite) del modelo de eliminación de fondo ormbg, desarrollado originalmente por schirrmacher bajo licencia Apache-2.0. Lo publica litert-community, el grupo de Google AI Edge responsable del runtime de inferencia en dispositivo. El modelo resuelve el problema de extracción de primer plano (matting) en tiempo real, directamente en el móvil, sin depender de servidores ni conexión. Su relevancia actual se debe a que ofrece una alternativa totalmente permisiva al popular RMBG-1.4, cuya licencia restringe el uso comercial.

La arquitectura es un ISNet, una CNN pura con bloques residuales anidados estilo U²-Net, con un tamaño de 176 MB y una entrada de 1024x1024 píxeles. La versión LiteRT está optimizada para ejecutarse por completo en la GPU del dispositivo mediante el delegado `CompiledModel` de LiteRT, con una latencia de aproximadamente 10 ms por imagen en un Pixel 8a, y también es compatible con el NPU Hexagon de Qualcomm en dispositivos Snapdragon, donde alcanza 23.95 ms.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ISNet (CNN pura con bloques residuales RSU estilo U²-Net) |
| Parametros totales | no disponible (modelo de 176 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de 1024x1024 píxeles) |
| Tipos de cuantizacion | fp16 (según la model card, el archivo es fp16 y no requiere int8 para NPU) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | LiteRT (.tflite) |

## Arquitectura y entrenamiento

El modelo base es un ISNet (Iterative Self-training Network), una CNN pura que emplea bloques residuales anidados (RSU) de estilo U²-Net para capturar información multiescala en la imagen. La conversión a LiteRT se realizó con `litert-torch` mediante un script (`build_ormbg.py`) que carga los pesos de ISNet y los exporta al formato `.tflite`. Durante la conversión se aplicó un parche defensivo: `align_corners=True` se cambió a `False` en las capas de upsampling bilineal, ya que el delegado GPU rechaza `align_corners=True`; el modelo resultante mantiene una correlación de 0.9999999999 con el PyTorch original.

El modelo completo se ejecuta en GPU sin fallback a CPU: los 246 nodos del grafo se asignan al delegado GPU en una sola partición, con una correlación de dispositivo de 0.999881. La entrada es un tensor `[1, 3, 1024, 1024]` en formato NCHW, RGB, normalizado dividiendo entre 255 (sin media ni desviación). La salida es un alpha matte `[1, 1, 1024, 1024]` en el rango `[0,1]`, que requiere un post-procesado de normalización min-max y reescalado al tamaño original.

No se han publicado detalles sobre el conjunto de datos de entrenamiento ni el proceso de optimización (RLHF, DPO, etc.), ya que se trata de un modelo de visión supervisado, no de un modelo generativo de texto.

## Capacidades

- Segmentación de imágenes: genera un alpha matte del sujeto en primer plano, separándolo del fondo.
- Eliminación de fondo en tiempo real en dispositivo: ~10 ms por fotograma en GPU (Pixel 8a) y 23.95 ms en NPU (Galaxy S26).
- Compatibilidad con aceleradores: se ejecuta íntegramente en GPU (LiteRT `CompiledModel`) y en NPU Qualcomm Hexagon sin necesidad de cuantización adicional.
- Ejecución on-device: no requiere conexión de red ni servidor, lo que garantiza privacidad y baja latencia.
- Post-procesamiento simple: el alpha matte se normaliza con min-max y se reescala al tamaño original para componer sobre un fondo nuevo.
- No es un modelo generativo ni de texto: no admite tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Edición de fotos en el móvil: la app carga la imagen, el modelo devuelve el alpha matte en ~10 ms y el usuario puede sustituir el fondo o recortar el sujeto para composiciones. La baja latencia permite edición interactiva en tiempo real.
- Aplicaciones de videollamada con fondos personalizados: el modelo procesa cada fotograma de la cámara en tiempo real (a 60 fps teóricos), permitiendo desenfocar o sustituir el fondo durante la llamada.
- Comercio electrónico y catálogos de producto: se elimina el fondo de las fotos de productos para generar imágenes con fondo transparente o blanco, listas para publicar en tiendas online, sin depender de servicios externos.
- Fotografía de retrato y redes sociales: se aplica un desenfoque de fondo (bokeh) o se cambia el fondo en fotos de personas, con resultados de calidad fotográfica gracias al entrenamiento del ISNet.
- Realidad aumentada en tiempo real: el modelo puede separar el sujeto del fondo para superponer objetos virtuales detrás o delante de la persona, en aplicaciones de AR en móvil.
- Procesamiento de imágenes en pipelines móviles: se integra en apps de escaneo de documentos o de recorte de imágenes para preparar assets gráficos, con la ventaja de que la licencia Apache-2.0 permite su uso comercial sin royalties.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de segmentación (IoU, FID, etc.) en la información disponible. Los datos de rendimiento se limitan a latencia de inferencia medida con las herramientas estándar:

| Runtime | Backend | Latencia | Dispositivo |
|---|---|---|---|
| LiteRT `CompiledModel` (GPU) | GPU (OpenCL) | ~10 ms | Pixel 8a (Tensor G3) |
| LiteRT `CompiledModel` (NPU) | NPU Hexagon v81 | 23.95 ms (mediana) | Samsung Galaxy S26 (Snapdragon 8 Elite Gen 5) |
| LiteRT `CompiledModel` (GPU) | GPU Adreno | 74.42 ms (mediana) | Samsung Galaxy S26 (Snapdragon 8 Elite Gen 5) |
| TFLite `benchmark_model` | GPU (TfLiteGpuDelegateV2) | 244.4 ms | Pixel 8a |
| TFLite `benchmark_model` | CPU (XNNPACK, 4 hilos) | 5263.2 ms | Pixel 8a |

El modelo no tiene benchmarks de texto (MMLU, HumanEval, etc.) porque es un modelo de visión, no de lenguaje.

## Requisitos de hardware

- VRAM estimada: no especificada, pero el modelo pesa 176 MB en disco; la memoria necesaria en GPU depende del runtime, pero es adecuada para cualquier smartphone con GPU moderna.
- GPU recomendadas: Adreno (Qualcomm), Tensor G3 (Google), Mali (ARM) o cualquier GPU compatible con OpenCL en dispositivos Android.
- Cabe en cualquier dispositivo móvil actual: se ejecuta en un Pixel 8a (Tensor G3) y en un Galaxy S26 (Snapdragon 8 Elite Gen 5).
- Opciones de despliegue: LiteRT `CompiledModel` con `Accelerator.GPU` o `Accelerator.NPU`; también se puede usar el intérprete de Python (`ai_edge_litert`).
- Latencia y throughput: 10 ms por imagen en GPU (Pixel 8a) y 23.95 ms en NPU (Galaxy S26), lo que permite procesamiento en tiempo real (más de 60 fps en GPU en el Pixel 8a).
- Para NPU (Hexagon) se requieren librerías específicas de Qualcomm y de Google (ver enlaces), no incluidas en el repositorio.

## Comparativa con modelos similares

| Modelo | Licencia | Arquitectura | Tamaño | Ejecución | Disponibilidad |
|---|---|---|---|---|---|
| ormbg-LiteRT (este) | Apache-2.0 | ISNet (CNN) | 176 MB | LiteRT (GPU/NPU) | HuggingFace |
| ormbg (original) | Apache-2.0 | ISNet (CNN) | 176 MB | PyTorch | HuggingFace |
| RMBG-1.4 | No comercial | U²-Net | ~176 MB | PyTorch / ONNX | HuggingFace |

RMBG-1.4 es la alternativa más conocida, pero su licencia no permite uso comercial. ormbg-LiteRT ofrece la misma categoría de tarea (matting de fondo) con licencia Apache-2.0, y añade la ventaja de estar ya optimizado para ejecución on-device con LiteRT. No hay datos públicos de comparación de calidad entre ambos.

## Limitaciones y advertencias

- No se han publicado métricas de calidad de segmentación (IoU, precisión de bordes) en la información disponible, por lo que el rendimiento de calidad real debe evaluarse de forma independiente.
- El modelo está diseñado específicamente para recorte de sujetos fotográficos; no está validado para casos de segmentación semántica general (múltiples objetos, escenas complejas, etc.).
- El post-procesado es obligatorio: la salida bruta del modelo debe normalizarse con min-max y reescalarse al tamaño original para obtener el alpha matte final.
- El parche `align_corners=True` a `False` puede introducir diferencias mínimas en los bordes de los objetos, aunque la correlación con PyTorch es de 0.9999999999.
- La ejecución en NPU Hexagon requiere la instalación de librerías externas (de Google y Qualcomm) que no se distribuyen desde el repositorio; sin ellas, el modelo se ejecuta en CPU silenciosamente, con una latencia de 5 segundos.
- No hay datos de sesgos ni de comportamiento en casos límite (pelo fino, transparencias, objetos con fondo similar al sujeto), y no se han publicado evaluaciones de robustez.
- La licencia Apache-2.0 permite uso comercial, pero debe respetarse la atribución y las condiciones de la licencia original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/litert-community/ormbg-LiteRT
- Repositorio de archivos: https://huggingface.co/litert-community/ormbg-LiteRT/tree/main
- Modelo original (schirrmacher/ormbg): https://huggingface.co/schirrmacher/ormbg
- Ejemplos de LiteRT (Google AI Edge): https://github.com/google-ai-edge/litert-samples
- Repositorio con recetas de modelos LiteRT (john-rocky/LiteRT-Models): https://github.com/john-rocky/LiteRT-Models/tree/main/ormbg
- Medición de rendimiento de LiteRT (benchmark_model): https://ai.google.dev/edge/litert/models/measurement
- Lanzamientos de LiteRT (librerías NPU): https://github.com/google-ai-edge/LiteRT/releases
