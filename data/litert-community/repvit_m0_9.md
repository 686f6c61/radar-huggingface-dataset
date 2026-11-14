# litert-community/repvit_m0_9

## Resumen

repvit_m0_9 es un modelo de clasificación de imágenes derivado de la arquitectura RepViT (Revisiting Mobile CNN From ViT Perspective), publicada por investigadores de la Universidad de Tsinghua (THU-MIG) en 2023. Esta versión concreta ha sido convertida al formato LiteRT (anteriormente TensorFlow Lite) por la comunidad litert-community para su despliegue en dispositivos móviles y entornos de borde. El checkpoint de origen es `timm/repvit_m0_9.dist_300e_in1k`, entrenado con destilación sobre ImageNet-1K durante 300 épocas.

El modelo resuelve el problema de clasificación de imágenes en 1.000 categorías de ImageNet con un coste computacional muy bajo: 5,5 millones de parámetros y 0,8 GMACs por inferencia a 224x224 píxeles. RepViT propone una revisión de las CNN móviles adoptando decisiones de diseño propias de los Vision Transformers (como la estructura de bloques y la atención por canales), lo que permite superar a ViTs móviles en eficiencia manteniendo la simplicidad de una CNN pura.

Su relevancia radica en que ofrece un clasificador de imágenes extremadamente ligero, empaquetado como `model.tflite`, listo para ejecutarse en smartphones, microcontroladores de gama alta y sistemas embebidos con aceleración LiteRT. Es un componente útil como backbone o extractor de características en pipelines de visión en el dispositivo, aunque su alcance se limita estrictamente a la clasificación de ImageNet.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RepViT (CNN móvil con diseño inspirado en ViT) |
| Parámetros totales | 5,5 M |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 224x224) |
| Tipos de cuantización | no disponible (el repo distribuye `model.tflite` en float32; no se documentan variantes int8) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | no disponible |
| Formato de pesos | TFLite (`model.tflite`) |

## Arquitectura y entrenamiento

RepViT es una red neuronal convolucional diseñada desde la perspectiva de los Vision Transformers. Combina bloques con estructura de cuello de botella y conexiones residuales, junto con mecanismos de atención por canales (channel-wise attention) que emulan el comportamiento de la self-attention de los ViT, pero manteniendo la eficiencia de una CNN. La variante m0_9 corresponde al escalado más pequeño de la familia, con 5,5 M de parámetros, 0,8 GMACs y 7,4 M de activaciones para una entrada de 224x224.

El checkpoint de origen se entrenó sobre ImageNet-1K durante 300 épocas con destilación de conocimiento (sufijo `dist_300e_in1k` en timm), usando un modelo profesor de mayor capacidad. Esta versión de litert-community no reentrena el modelo: únicamente convierte los pesos del checkpoint de timm al formato LiteRT, preservando la arquitectura y el comportamiento del original. La entrada es un tensor float32 en layout NCHW de forma `[1, 3, 224, 224]` y la salida son logits de 1.000 clases con forma `[1, 1000]`.

## Capacidades

- Clasificación de imágenes en las 1.000 categorías de ImageNet-1K.
- Extracción de características (feature backbone) para tareas posteriores de visión, según la model card original.
- Inferencia en dispositivos de borde mediante el runtime LiteRT.
- Entrada de imagen fija de 224x224 píxeles en float32, layout NCHW.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de procesamiento de lenguaje natural.
- No dispone de modo thinking, visión generativa, audio ni funcionalidades multimodales más allá de la clasificación.

## Casos de uso

- Clasificación de imágenes en el dispositivo: el modelo se ejecuta como `model.tflite` en smartphones o sistemas embebidos con LiteRT, permitiendo etiquetar fotos sin enviar datos a la nube y con 0,8 GMACs por inferencia.
- Filtrado y moderación de contenido visual: integrado en apps móviles para detectar categorías de ImageNet (por ejemplo, armas, animales o vehículos) antes de subir contenido, aprovechando su bajo coste computacional.
- Etiquetado automático de fotos en galerías locales: clasificación rápida de imágenes en aplicaciones de gestión de fotos en Android o iOS mediante el runtime LiteRT.
- Backbone para tareas de visión descendentes: extracción de características con 7,4 M de activaciones para alimentar cabezales personalizados de detección o segmentación en pipelines de borde.
- Prototipado de aplicaciones de visión en IoT: despliegue en dispositivos con recursos limitados (Raspberry Pi, placas con NPU) para clasificación en tiempo real de imágenes de cámaras.
- Control de calidad industrial ligero: clasificación de piezas o productos en líneas de producción con cámaras de bajo coste, usando el modelo como primer filtro antes de modelos más pesados.
- Educación y experimentación: modelo de referencia para estudiar arquitecturas CNN móviles y comparar el rendimiento de RepViT frente a MobileNet o EfficientNet en entornos de borde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta métricas de coste computacional: 5,5 M de parámetros, 0,8 GMACs y 7,4 M de activaciones para una entrada de 224x224. No se incluyen cifras de precisión top-1 o top-5 sobre ImageNet-1K.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el modelo está pensado para ejecución en CPU, GPU móvil o NPU. El tamaño de los pesos en float32 es de aproximadamente 22 MB (5,5 M de parámetros x 4 bytes), más las activaciones de 7,4 M.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU de dispositivos móviles, GPU integradas (Adreno, Mali) y NPUs compatibles con LiteRT.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, etc.) y en la práctica en cualquier dispositivo con al menos unas decenas de MB de memoria libre.
- Opciones de despliegue: LiteRT (runtime oficial para `model.tflite`); también puede exportarse a otros runtimes de TFLite. No se distribuyen pesos en safetensors ni GGUF en este repositorio.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y del delegado LiteRT empleado (CPU, GPU o NPU).

## Comparativa con modelos similares

| Modelo | Parámetros | GMACs | Contexto/entrada | Licencia | Formato |
|---|---|---|---|---|---|
| repvit_m0_9 (este) | 5,5 M | 0,8 | 224x224 | no disponible | TFLite |
| MobileNetV3-Small | ~2,5 M | ~0,06 | 224x224 | Apache 2.0 (timm) | safetensors/PyTorch |
| EfficientNet-B0 | ~5,3 M | ~0,39 | 224x224 | Apache 2.0 (timm) | safetensors/PyTorch |
| MobileViT-XXS | ~1,3 M | ~0,4 | 224x224 | Apple ML research (verificar) | safetensors/PyTorch |

La comparación se limita a parámetros, coste computacional y formato, ya que no se dispone de cifras de precisión para este checkpoint. RepViT m0_9 se sitúa en un rango de parámetros similar a EfficientNet-B0, pero con un coste en GMACs mayor que MobileNetV3-Small; su ventaja declarada en el paper es un mejor equilibrio precisión-latencia en dispositivos móviles. Los datos de licencia de los modelos comparados deben verificarse en sus repositorios originales.

## Limitaciones y advertencias

- El modelo solo clasifica imágenes en las 1.000 clases de ImageNet-1K; no detecta objetos, no segmenta y no genera descripciones.
- No se han publicado métricas de precisión para este checkpoint convertido, por lo que su rendimiento real no está verificado en la información disponible.
- La licencia no está indicada, lo que impide confirmar si el uso comercial está permitido; es imprescindible contactar con el autor o revisar el repositorio original antes de usarlo en producción.
- La entrada está fijada a 224x224 en float32 y layout NCHW; no se documentan variantes cuantizadas a int8, lo que limita optimizaciones adicionales en algunos aceleradores.
- Al ser una conversión de un checkpoint de timm, pueden existir diferencias numéricas menores respecto al modelo original en PyTorch.
- Riesgo de sesgos heredados del dataset ImageNet-1K, incluyendo desequilibrios de clase y sesgos geográficos o culturales en las etiquetas.
- No apto para tareas de lenguaje, razonamiento, agentes ni tool calling; su ámbito es exclusivamente la visión por computador.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/repvit_m0_9
- Paper RepViT: https://arxiv.org/abs/2307.09283
- Repositorio original: https://github.com/THU-MIG/RepViT
- Checkpoint base en timm: https://huggingface.co/timm/repvit_m0_9.dist_300e_in1k
- Documentación de LiteRT: https://ai.google.dev/edge/litert
