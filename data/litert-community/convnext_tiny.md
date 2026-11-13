# litert-community/convnext_tiny

## Resumen

ConvNeXt Tiny es una implementación en formato LiteRT (antiguo TFLite) del conocido backbone convolucional ConvNeXt, publicada por la organización litert-community en Hugging Face. El modelo original fue introducido por Liu, Mao, Wu, Feichtenhofer, Darrell y Xie en el artículo "A ConvNet for the 2020s" (arXiv:2201.03545) y esta conversión parte del checkpoint oficial de TorchVision (`ConvNeXt_Tiny_Weights.IMAGENET1K_V1`). Su propósito es ofrecer un clasificador de imágenes de 1000 clases de ImageNet con una arquitectura puramente convolucional pero con sesgos inductivos inspirados en Transformers, pensado para despliegue en dispositivos de borde mediante el runtime LiteRT.

El modelo cuenta con aproximadamente 28,6 millones de parámetros y 4,5 GFLOPs, y alcanza una precisión Top-1 del 82,46 % y Top-5 del 96,13 % sobre la validación de ImageNet-1k en su variante de precisión completa, según los datos declarados por el autor. La conversión incluye además una variante cuantizada mixta INT8/FP32 con pesos INT8 por canal, orientada a aceleración en CPU y NPU.

La relevancia actual de esta ficha radica en que empaqueta un backbone de referencia de visión por computador en un formato listo para inferencia en dispositivos (móvil, embedded, NPU de Qualcomm o MediaTek), evitando al desarrollador tener que realizar la conversión desde PyTorch. Es, por tanto, una pieza útil para pipelines de clasificación de imágenes en producción con requisitos de latencia y consumo ajustados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt (CNN pura con sesgos inductivos tipo Transformer: convoluciones depthwise 7x7, bottlenecks invertidos, LayerNorm) |
| Parametros totales | 28.589.128 (aprox. 28,6 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224x224) |
| Tipos de cuantizacion | FP32 (`convnext_tiny.tflite`) e INT8/FP32 mixta con pesos INT8 por canal e input/output INT8 (`convnext_tiny_int8_channelwise.tflite`) |
| Idiomas soportados | no disponible (modelo de clasificación de imágenes, no lingüístico) |
| Licencia | no disponible (sujeta a las condiciones de PyTorch Vision y del dataset ImageNet-1k) |
| Formato de pesos | TFLite / LiteRT (`.tflite`) |

## Arquitectura y entrenamiento

ConvNeXt Tiny es un transformer puramente convolucional: parte de un diseño ResNet al que se le aplican modernizaciones inspiradas en Swin Transformer, como convoluciones depthwise con kernels de 7x7, bottlenecks invertidos, normalización LayerNorm en lugar de BatchNorm y funciones de activación GELU. El resultado es una red convolucional con una relación precisión/coste comparable a la de Swin-T pero con la simplicidad y el throughput de una CNN clásica. El modelo original fue entrenado sobre ImageNet-1k y esta conversión no reentrena los pesos: se limita a transformar el checkpoint de TorchVision al formato LiteRT.

La conversión incluye una receta de cuantización estática (`ai_edge_quantizer.recipe.static_wi8_ai8()`) con salvaguardas locales de escala y sesgo para evitar desbordamientos de sesgos INT32. Las LayerNorm permanecen en FP32, por lo que la variante INT8 no es un modelo totalmente entero. Los rangos de calibración intermedios usan media móvil exponencial y los logits de salida emplean el rango global observado. El preprocesado es el estándar de TorchVision: conversión a RGB, redimensionado del lado corto a 236 con interpolación bilineal y antialiasing, recorte central a 224x224, división por 255 y normalización con media `[0.485, 0.456, 0.406]` y desviación `[0.229, 0.224, 0.225]`. La entrada es NCHW `[1, 3, 224, 224]` y la salida son logits de 1000 clases `[1, 1000]`.

## Capacidades

- Clasificación de imágenes en 1000 clases de ImageNet-1k (Top-1 y Top-5).
- Extracción de características visuales mediante el backbone convolucional (uso como feature extractor si se recorta la cabeza de clasificación).
- Inferencia en CPU y GPU con la variante FP32 (`convnext_tiny.tflite`).
- Inferencia en CPU y NPU (Qualcomm, MediaTek, etc.) con la variante INT8 por canal.
- Ejecución en dispositivos de borde mediante el runtime LiteRT (`ai-edge-litert`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No soporta visión generativa ni descripción de imágenes: solo etiquetado de clase.

## Casos de uso

- Clasificación de imágenes en aplicaciones móviles: el modelo en formato TFLite se integra en apps Android/iOS mediante LiteRT y clasifica una foto en las 1000 clases de ImageNet con latencia apta para interacción en tiempo real.
- Moderación de contenido visual en el dispositivo: filtrado previo de imágenes en el propio terminal para detectar categorías sensibles antes de enviarlas a un servidor, reduciendo ancho de banda y preservando privacidad.
- Etiquetado automático de fototecas: generación de etiquetas de clase para organizar y buscar imágenes en galerías locales sin conexión.
- Preprocesado en pipelines de visión industrial: clasificación rápida de piezas u objetos en cámaras embebidas donde el coste energético y la latencia importan más que la precisión absoluta.
- Backbone para tareas downstream: uso del extractor de características como base para fine-tuning de clasificación custom, detección o segmentación en proyectos con recursos limitados.
- Inferencia en NPU de Qualcomm o MediaTek: la variante INT8 por canal está pensada para aceleradores neuronales integrados en SoC móviles, con throughput superior al de la variante FP32 en CPU.
- Prototipado rápido de clasificadores: al estar disponible como `.tflite` con script de ejemplo en la model card, permite validar un pipeline de visión en minutos con `huggingface_hub` y `ai-edge-litert`.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre la validación de ImageNet-1k (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| Top-1 Accuracy (FP32) | 82,46 % |
| Top-5 Accuracy (FP32) | 96,13 % |
| Top-1 Accuracy (referencia PyTorch original) | 82,52 % |
| Top-5 Accuracy (referencia PyTorch original) | 96,146 % |

No se han publicado en la información disponible resultados de la variante INT8 ni comparativas con otros modelos en formato LiteRT.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 0,7 GB e incluye ambas variantes. La variante FP32 ronda los 114 MB de pesos (28,6 M de parámetros a 4 bytes) y la INT8 aproximadamente 28-30 MB.
- GPU recomendadas: no se especifican; la variante FP32 es compatible con GPU según la tabla de compatibilidad del autor, la INT8 no es compatible con GPU.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el modelo está orientado a CPU y NPU.
- Cabe en GPU de consumo: previsiblemente sí por tamaño, pero no hay confirmación oficial.
- Opciones de despliegue: runtime LiteRT (`ai-edge-litert`), con soporte de CPU y NPU (Qualcomm, MediaTek). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Top-1 ImageNet | Licencia | Formato |
|---|---|---|---|---|---|
| ConvNeXt Tiny (esta ficha) | 28,6 M | 224x224 | 82,46 % | no disponible | TFLite/LiteRT |
| Swin-T (referencia citada por el autor) | no disponible | no disponible | comparable según el autor, sin cifra exacta | no disponible | PyTorch |
| ConvNeXt Tiny original (TorchVision) | 28,6 M | 224x224 | 82,52 % | no disponible | PyTorch (.pth) |

No se dispone de datos de otros modelos LiteRT comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo de clasificación cerrada: solo predice entre las 1000 clases de ImageNet-1k; no reconoce categorías fuera de ese vocabulario.
- Riesgo de error en clases visualmente similares o en dominios alejados de ImageNet (imágenes médicas, industriales, artísticas).
- La variante INT8 no es totalmente entera: las LayerNorm permanecen en FP32, lo que puede afectar al rendimiento en algunos aceleradores.
- La variante INT8 no es compatible con GPU según el autor; solo CPU y NPU.
- La licencia no está declarada explícitamente; el autor remite a las condiciones de PyTorch Vision y del dataset ImageNet-1k, por lo que el uso comercial requiere verificación legal propia.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false`).
- El preprocesado es específico y sensible: cualquier desviación en el redimensionado, recorte o normalización degrada la precisión.
- Para la variante INT8 es imprescindible leer escalas y puntos cero del archivo concreto, ya que el autor advierte que pueden cambiar entre revisiones.
- No soporta generación de texto, razonamiento, agentes ni tool calling; no debe confundirse con un modelo de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/convnext_tiny
- Organización LiteRT Community: https://huggingface.co/litert-community
- Paper original "A ConvNet for the 2020s": https://arxiv.org/abs/2201.03545
- Checkpoint original de TorchVision: https://download.pytorch.org/models/convnext_tiny-983f1562.pth
- Etiquetas ImageNet-1k (dataset de Hugging Face): https://huggingface.co/datasets/huggingface/label-files
- Runtime LiteRT (`ai-edge-litert`): https://pypi.org/project/ai-edge-litert/
