# litert-community/UniSal-Saliency-LiteRT

## Resumen

UniSal-Saliency-LiteRT es una conversión del modelo UniSal (desarrollado por rdroste) al formato LiteRT, el sucesor de TensorFlow Lite de Google, diseñado para ejecutar predicción de saliencia visual directamente en dispositivos móviles. El modelo genera un mapa de calor que indica dónde miran los humanos en una imagen, una tarea fundamental para aplicaciones de atención visual, diseño de interfaces y análisis de contenido. La conversión ha sido realizada por la comunidad LiteRT (anteriormente TFLite) y está optimizada para ejecutarse completamente en la GPU del dispositivo mediante el acelerador `CompiledModel` de LiteRT.

El modelo utiliza un encoder MobileNetV2 con un decodificador bilineal, con 3,71 millones de parámetros y un tamaño de 6,5 MB en precisión fp16. Acepta imágenes de 256×256 píxeles normalizadas con la media y desviación estándar de ImageNet y produce un mapa de saliencia de 256×256. La conversión ha sido verificada numéricamente: la correlación entre el modelo LiteRT y el original en PyTorch es de 1,0, y la correlación entre el dispositivo y PyTorch alcanza 0,9998. En un Pixel 8a (Tensor G3) la inferencia tarda aproximadamente 3 ms, lo que lo hace adecuado para aplicaciones en tiempo real.

La relevancia de este modelo radica en que democratiza la predicción de saliencia en dispositivos de gama media, sin necesidad de conexión a la nube, y demuestra que los modelos de visión pueden ejecutarse eficientemente en hardware móvil con aceleración GPU. Su licencia Apache-2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (encoder) + decodificador bilineal |
| Parametros totales | 3,71 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 256×256) |
| Tipos de cuantizacion | fp16 (6,5 MB) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Apache-2.0 |
| Formato de pesos | LiteRT (.tflite), compatible con TFLite |

## Arquitectura y entrenamiento

El modelo original UniSal, desarrollado por rdroste, emplea un encoder MobileNetV2 preentrenado en ImageNet seguido de un decodificador que realiza un muestreo bilineal para producir el mapa de saliencia. El modelo fue entrenado en el dataset SALICON, un conjunto de datos de saliencia visual a gran escala basado en imágenes de MS COCO. La conversión a LiteRT se realizó con la herramienta `litert-torch` e incluyó tres correcciones numéricamente exactas: sustituir el submuestreo con zancada `x[..., ::2, ::2]` por `F.avg_pool2d(x, 1, 2)`, integrar los 16 mapas previos gaussianos como constantes de tamaño fijo, y reemplazar el padding replicado por padding con ceros en el suavizado gaussiano de 41×41. Estas correcciones evitan operaciones no soportadas (como `GATHER_ND` o `BROADCAST_TO`) y garantizan que el grafo completo se ejecute en GPU. El modelo se fijó al camino de imagen estática (Bypass-RNN) y al dominio SALICON; la normalización log-softmax espacial se realiza en la aplicación.

## Capacidades

- Predicción de saliencia visual: genera un mapa de calor de 256×256 que indica las regiones de una imagen que atraen la atención humana.
- Ejecución completamente en GPU: los 158 nodos del grafo se ejecutan en GPU mediante LiteRT `CompiledModel` (LITERT_CL), sin caídas a CPU.
- Inferencia en tiempo real: latencia de ~3 ms en Pixel 8a (Tensor G3) y ~3,66 ms en Galaxy S26 (Adreno), suficiente para aplicaciones interactivas.
- Compatibilidad con NPU: puede ejecutarse en Hexagon NPU (Snapdragon) aunque con mayor latencia (21,12 ms) y menor tiempo de carga (103 ms frente a 2136 ms en GPU).
- Precisión numérica: correlación de 1,0 con el modelo PyTorch original y 0,9998 en dispositivo, lo que garantiza fidelidad en la conversión.
- Interfaz sencilla: API Kotlin para Android (CompiledModel) y Python (ai_edge_litert) para verificación en escritorio.
- Preprocesamiento estándar: center-crop, resize a 256×256, normalización ImageNet (media [0.485, 0.456, 0.406], desviación [0.229, 0.224, 0.225]) y formato NCHW.

## Casos de uso

- Optimización de interfaces de usuario: el modelo puede predecir qué elementos de una pantalla captarán la atención del usuario, permitiendo a los diseñadores ajustar la jerarquía visual de forma automática. Su baja latencia (~3 ms) permite evaluar múltiples variantes de diseño en tiempo real.
- Publicidad y marketing visual: las marcas pueden analizar qué zonas de un banner o anuncio atraen más la mirada, optimizando la colocación de logotipos y llamadas a la acción. Al ejecutarse on-device, no se envían imágenes a servidores externos, preservando la privacidad.
- Fotografía y edición: aplicaciones de cámara pueden usar el mapa de saliencia para sugerir recortes automáticos o ajustes de composición que dirijan la atención al sujeto principal. La integración con LiteRT permite incorporarlo en apps Android sin dependencias pesadas.
- Accesibilidad: para personas con discapacidad visual, el modelo puede identificar las regiones más relevantes de una imagen y combinarlo con sistemas de descripción automática, priorizando qué partes describir primero.
- Análisis de contenido en redes sociales: las plataformas pueden predecir qué partes de una imagen generarán más engagement, ayudando a los creadores a optimizar sus publicaciones. El despliegue on-device reduce costes de servidor y mejora la privacidad de los usuarios.
- Robótica y visión embebida: en sistemas de navegación autónoma o asistencia, el mapa de saliencia puede priorizar qué objetos del entorno procesar, reduciendo la carga computacional de otros módulos de visión. Su tamaño reducido (6,5 MB) lo hace viable en dispositivos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque se trata de un modelo de visión, no de lenguaje. Los datos de rendimiento disponibles se centran en latencia y precisión de conversión, medidos en dispositivos reales:

| Metrica | Valor |
|---|---|
| Correlacion tflite-vs-torch | 1,0 |
| Correlacion dispositivo-vs-torch | 0,9998 |
| Latencia en Pixel 8a (Tensor G3, GPU LITERT_CL) | ~3 ms |
| Latencia en Pixel 8a (TFLite GPU OpenCL) | 20,2 ms |
| Latencia en Galaxy S26 (GPU Adreno) | 3,66 ms (mediana) |
| Latencia en Galaxy S26 (NPU Hexagon v81) | 21,12 ms (mediana) |
| Tiempo de carga en GPU (Galaxy S26) | 2136 ms |
| Tiempo de carga en NPU (Galaxy S26) | 103 ms |
| Nodos en GPU | 158 / 158 |

La ejecución en CPU con XNNPACK no es posible: el backend declina el grafo por operaciones fp16 no soportadas (`DEPTHWISE_CONV_2D`), y los kernels de referencia son ~20 veces más lentos que la GPU.

## Requisitos de hardware

- VRAM: no aplica (modelo on-device, no requiere VRAM dedicada; usa memoria compartida del dispositivo).
- GPU recomendadas: cualquier GPU móvil compatible con OpenCL o Vulkan, incluyendo Adreno (Qualcomm), Mali (ARM) y Tensor G3 (Google). Verificado en Pixel 8a y Galaxy S26.
- NPU: compatible con Hexagon v81 (Snapdragon 8 Elite Gen 5) mediante compilación JIT on-device, aunque con mayor latencia que la GPU.
- CPU: no recomendado; XNNPACK rechaza el grafo fp16 y los kernels de referencia son ~20× más lentos que la GPU.
- Opciones de despliegue: LiteRT `CompiledModel` con acelerador GPU (recomendado), TFLite `benchmark_model` con `TfLiteGpuDelegateV2` (más lento), o Python con `ai_edge_litert` para verificación en escritorio.
- Latencia y throughput: ~3 ms por imagen en GPU (Pixel 8a), lo que permite procesar más de 300 imágenes por segundo en un dispositivo móvil de gama media.

## Comparativa con modelos similares

No se dispone de datos publicados que comparen UniSal-Saliency-LiteRT con otros modelos de saliencia en términos de precisión o latencia en el mismo hardware. La comparación más relevante es con el modelo original en PyTorch:

| Modelo | Formato | Parametros | Tamano | Correlacion con PyTorch | Latencia (Pixel 8a) |
|---|---|---|---|---|---|
| UniSal (PyTorch) | PyTorch | 3,71 M | ~14 MB (fp32) | 1,0 (referencia) | no aplica (escritorio) |
| UniSal-Saliency-LiteRT | LiteRT fp16 | 3,71 M | 6,5 MB | 0,9998 | ~3 ms |

Otros modelos de saliencia como DeepGaze o SAM (segmentación, no saliencia) no tienen conversiones LiteRT publicadas con métricas comparables, por lo que no se incluyen en esta tabla.

## Limitaciones y advertencias

- El modelo está entrenado en el dataset SALICON, basado en imágenes de MS COCO, por lo que su rendimiento puede degradarse en dominios muy diferentes (imágenes médicas, dibujos técnicos, escenas sintéticas).
- Solo procesa imágenes estáticas; no soporta video ni secuencias temporales (el camino RNN está desactivado en esta conversión).
- La resolución de entrada está fijada a 256×256; imágenes de mayor resolución requieren redimensionado previo, lo que puede perder detalles finos.
- La normalización log-softmax espacial se realiza en la aplicación, no dentro del modelo; si se omite, los valores de salida no están normalizados.
- La ejecución en CPU no es viable con XNNPACK; si el dispositivo no tiene GPU compatible, el modelo no funcionará correctamente.
- El tiempo de carga en GPU es elevado (2136 ms en Galaxy S26), lo que puede afectar al arranque de la aplicación; se recomienda precargar el modelo en segundo plano.
- La licencia Apache-2.0 permite uso comercial, pero el modelo original tiene su propia licencia (también Apache-2.0) que debe respetarse en redistribuciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/UniSal-Saliency-LiteRT
- Repositorio original UniSal: https://github.com/rdroste/unisal
- Guia de despliegue en NPU: https://github.com/john-rocky/hf-to-litertlm/blob/main/docs/android-npu.md
- Guia de despliegue en GPU: https://github.com/john-rocky/hf-to-litertlm/blob/main/docs/android-gpu.md
- Repositorio LiteRT (sucesor de TFLite): https://github.com/google-ai-edge/litert
- Coleccion de modelos LiteRT (incluye saliency): https://github.com/john-rocky/LiteRT-Models/tree/main/saliency
