# litert-community/swin_tiny_patch4_window7_224.ms_in1k

## Resumen

Swin Tiny Patch4 Window7 224 es la exportación a LiteRT/TFLite del modelo de clasificación de imágenes `swin_tiny_patch4_window7_224.ms_in1k`, publicado originalmente en la librería TIMM (PyTorch Image Models) de Ross Wightman. Lo distribuye la comunidad LiteRT (antes TFLite) de Google en Hugging Face, con el objetivo de ofrecer artefactos listos para ejecución en dispositivos móviles y de borde mediante el runtime LiteRT.

El modelo subyacente es un Swin Transformer de escala "tiny", una arquitectura de visión jerárquica basada en atención con ventanas desplazadas, presentada en el paper "Swin Transformer: Hierarchical Vision Transformer using Shifted Windows" (ICCV 2021). Cuenta con 28,3 millones de parámetros, 4,5 GMACs y una entrada de imagen fija de 224x224 píxeles, y está entrenado para clasificación sobre ImageNet-1k (1000 clases).

Su relevancia actual radica en que permite desplegar un transformer de visión con precisión competitiva en entornos con recursos limitados, ofreciendo tres variantes de cuantización (FP32, INT8 dinámica en pesos y INT8 estática W8A8) con un tamaño de repositorio de solo 0,2 GB, lo que facilita la integración en aplicaciones Android, IoT y sistemas embebidos sin necesidad de infraestructura GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin Transformer (vision transformer jerárquico con shifted windows) |
| Parametros totales | 28,3 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija 224x224) |
| Tipos de cuantizacion | FP32, INT8 dinámica (pesos INT8, activaciones FP32), INT8 estática W8A8 con cuantización channelwise en pesos |
| Idiomas soportados | no disponible (modelo de clasificación de imágenes, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | TFLite / LiteRT (`.tflite`) |

## Arquitectura y entrenamiento

El modelo es un Swin Transformer de configuración tiny: patch size 4, ventanas de atención de 7x7 y resolución de entrada de 224x224. La arquitectura construye representaciones jerárquicas mediante bloques de atención con ventanas desplazadas (shifted windows), lo que reduce el coste computacional cuadrático de la atención global y permite extraer mapas de características multiescala. Según los datos del modelo, requiere 4,5 GMACs por inferencia y genera 17,1 M de activaciones.

Los pesos originales fueron entrenados en ImageNet-1k dentro del ecosistema TIMM y posteriormente convertidos a LiteRT/TFLite por la comunidad LiteRT. La variante INT8 estática se calibró con imágenes reales del conjunto de validación de ImageNet usando el flujo de preprocesado resuelto de TIMM: recorte central con `crop_pct` 0,9, interpolación bicúbica, media `[0.485, 0.456, 0.406]` y desviación `[0.229, 0.224, 0.225]`. No se documenta en la información disponible si hubo fases adicionales de ajuste fino, RLHF/DPO (no aplicable en visión) ni aumentos de datos específicos más allá del pipeline estándar de TIMM.

## Capacidades

- Clasificación de imágenes en 1000 clases de ImageNet-1k.
- Extracción de características (feature backbone) para tareas de visión descendentes, según la model card.
- Ejecución en CPU y GPU mediante el runtime LiteRT.
- Tres variantes de precisión para adaptar el equilibrio entre latencia, memoria y exactitud.
- Entrada tensorial fija NCHW `[1, 3, 224, 224]`; salida de logits `[1, 1000]`.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni capacidades multilingües.
- No dispone de modo "thinking" ni generación autoregresiva.

## Casos de uso

- Clasificación de imágenes en aplicaciones Android: integración del `.tflite` mediante LiteRT para etiquetar fotos capturadas por la cámara del dispositivo, aprovechando la variante INT8 estática para minimizar consumo.
- Moderación de contenido visual en el borde: filtrado previo de imágenes en pasarelas IoT antes de enviarlas a la nube, usando la variante FP32 o INT8 dinámica según el presupuesto de cómputo.
- Etiquetado automático de catálogos de producto: clasificación de fotografías en categorías ImageNet como paso inicial en pipelines de gestión de inventario.
- Extracción de embeddings visuales para búsqueda por similitud: uso del modelo como backbone para generar representaciones y alimentar índices vectoriales.
- Prototipado rápido en investigación: comparación de variantes FP32 frente a INT8 para estudiar el impacto de la cuantización en la exactitud de un transformer de visión pequeño.
- Clasificación en dispositivos con GPU integrada: ejecución mediante el backend GPU de LiteRT en teléfonos de gama media para tareas de reconocimiento visual en tiempo real.
- Filtrado previo en sistemas de videovigilancia: clasificación de fotogramas clave en el propio dispositivo para reducir el ancho de banda enviado al servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo es de 28,3 M de parámetros; en FP32 ocupa aproximadamente 113 MB de pesos, en INT8 alrededor de 28 MB. Las activaciones (17,1 M) añaden un consumo adicional reducido.
- GPU recomendadas: no requiere GPU dedicada; está pensado para CPU y GPU integradas. En servidores puede ejecutarse en cualquier GPU moderna, aunque no se aprovecha su capacidad.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer (RTX 3060, RTX 4090, etc.), aunque el despliegue objetivo es móvil y embebido.
- Opciones de despliegue: runtime LiteRT (CPU y GPU). La model card indica que la habilitación para backends NPU está aún en validación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Formato | Licencia | Contexto de despliegue |
|---|---|---|---|---|---|
| Swin Tiny Patch4 Window7 224 (este) | 28,3 M | 224x224 | TFLite/LiteRT | MIT | Móvil y borde |
| Swin Transformer Tiny (original TIMM, PyTorch) | 28,3 M | 224x224 | PyTorch | MIT | Servidor/estación |
| MobileNetV3 (referencia de clasificación móvil) | ~5,4 M (large) | 224x224 | TFLite, ONNX | Apache 2.0 | Móvil y borde |
| ViT-Base/16 | ~86 M | 224x224 | PyTorch, ONNX | Apache 2.0 | Servidor |

Nota: los datos de MobileNetV3 y ViT-Base/16 se incluyen como referencia de categoría; no se dispone de comparativas de exactitud publicadas en la información proporcionada para este artefacto concreto.

## Limitaciones y advertencias

- Modelo exclusivamente de visión: no procesa texto, audio ni secuencias; no es apto para tareas de lenguaje.
- Entrada fija de 224x224: no admite resoluciones variables sin reexportación o adaptación.
- Riesgo de sesgos heredados de ImageNet-1k: las 1000 clases reflejan la distribución y taxonomía del dataset original, con posibles desequilibrios y sesgos culturales.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de clasificaciones erróneas con alta confianza en dominios alejados de ImageNet.
- La cuantización INT8 puede degradar la exactitud respecto a FP32; se recomienda validar con datos propios antes de producción.
- La licencia MIT del artefacto no exime de verificar las condiciones de TIMM y del dataset ImageNet-1k para usos comerciales concretos; la model card lo indica expresamente.
- Soporte NPU aún en validación: no se garantiza funcionamiento en aceleradores neuronales de terceros.
- El modelo tiene 70 descargas y 0 likes en el momento de la ficha, lo que sugiere adopción limitada y menor madurez del ecosistema de soporte.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/swin_tiny_patch4_window7_224.ms_in1k
- Organización LiteRT Community: https://huggingface.co/litert-community
- Modelo base en TIMM: https://huggingface.co/timm/swin_tiny_patch4_window7_224.ms_in1k
- Paper Swin Transformer: https://arxiv.org/abs/2103.14030
- Repositorio original de Microsoft: https://github.com/microsoft/Swin-Transformer
- Repositorio TIMM: https://github.com/huggingface/pytorch-image-models
