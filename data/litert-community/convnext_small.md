# litert-community/convnext_small

## Resumen

ConvNeXt Small es un modelo de clasificación de imágenes de tipo red neuronal puramente convolucional (CNN) desarrollado originalmente por Zhuang Liu, Hanzi Mao, Chao-Yuan Wu, Christoph Feichtenhofer, Trevor Darrell y Saining Xie, y publicado en el artículo "A ConvNet for the 2020s" (arXiv:2201.03545). Esta ficha concreta corresponde a la conversión a formato TensorFlow Lite publicada por la comunidad `litert-community`, que adapta los pesos originales de PyTorch Vision para su ejecución en el runtime LiteRT (anteriormente TensorFlow Lite).

El modelo resuelve el problema de clasificación de imágenes en 1.000 categorías de ImageNet-1K y se posiciona como una alternativa "modernizada" a ResNet: adopta decisiones de diseño propias de los Vision Transformers (convoluciones depthwise de 7x7, cuellos de botella invertidos y un número reducido de capas de activación y normalización) manteniendo la eficiencia de una CNN pura. Con aproximadamente 50 millones de parámetros y 8,7 GFLOPs, compite en precisión y throughput con Swin-T en tareas generales de visión.

Su relevancia actual radica en el formato de despliegue: al estar empaquetado como `.tflite` para LiteRT, permite ejecutar un backbone de visión de alto rendimiento en dispositivos con recursos limitados (móvil, edge, navegador) sin necesidad de un stack de PyTorch, lo que facilita su integración en aplicaciones de inferencia en local.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ConvNeXt (CNN pura con diseño inspirado en Transformers) |
| Parámetros totales | 50.223.688 (~50M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 224x224 píxeles) |
| Tipos de cuantización | no disponible (el repo publica pesos en formato TFLite; no se detallan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; las etiquetas de salida son las 1.000 clases de ImageNet-1K) |
| Licencia | no disponible (la model card remite a las licencias de PyTorch Vision y del dataset de entrenamiento) |
| Formato de pesos | TFLite (`.tflite`), ejecutable con `ai-edge-litert` |
| Cómputo | 8,7 GFLOPs |
| Tamaño del repo | 0,4 GB |
| Entrada | imagen RGB 224x224, normalizada con media [0.485, 0.456, 0.406] y desviación [0.229, 0.224, 0.225] |

## Arquitectura y entrenamiento

ConvNeXt Small es una red convolucional pura que moderniza el diseño de ResNet incorporando elementos habituales en los Vision Transformers: kernels depthwise de 7x7, proporción de expansión invertida en los bloques (ratio 4), uso de GELU en lugar de ReLU, LayerNorm en lugar de BatchNorm, y una etapa de downsample con capas separadas. El resultado es una arquitectura con una escalabilidad y un rendimiento por FLOP superiores a los de las CNN clásicas, sin depender de mecanismos de atención.

Los pesos publicados en este repositorio se han convertido desde un checkpoint de PyTorch Vision; el modelo original fue entrenado sobre ImageNet-1K. La model card no detalla el número de tokens/imágenes de entrenamiento, la composición exacta del dataset más allá de ImageNet-1K, ni si se aplicaron técnicas de ajuste fino adicionales (RLHF/DPO no aplican a un modelo de visión). Tampoco se documenta el proceso de conversión a TFLite ni posibles pérdidas de precisión asociadas a la misma.

## Capacidades

- Clasificación de imágenes en 1.000 categorías de ImageNet-1K (single-label, top-1 y top-5).
- Extracción de características visuales de propósito general (backbone convolucional reutilizable para tareas downstream).
- Inferencia en dispositivos edge y móviles mediante el runtime LiteRT (`ai-edge-litert`).
- Ejecución sin dependencias de PyTorch: solo requiere NumPy, Pillow, `huggingface_hub` y `ai-edge-litert`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües ni de modalidades distintas de la imagen.
- No incluye modo "thinking", visión generativa, audio ni otras capacidades especiales.

## Casos de uso

- Clasificación de imágenes en aplicaciones móviles: el formato TFLite y los ~50M de parámetros permiten ejecutar la inferencia en el propio dispositivo sin enviar imágenes a un servidor, reduciendo latencia y preservando la privacidad.
- Moderación de contenido visual en el edge: el modelo puede etiquetar imágenes entrantes en tiempo real en pasarelas o dispositivos intermedios para filtrar categorías sensibles antes de su procesado posterior.
- Etiquetado automático de catálogos de producto: usar las 1.000 clases de ImageNet como taxonomía aproximada para preclasificar imágenes de inventario y reducir la carga de anotación manual.
- Backbone para transfer learning: congelar o afinar las capas convolucionales para tareas de visión específicas (detección, segmentación, clasificación fine-grained) cuando se busca una CNN eficiente y bien documentada.
- Sistemas de visión embebidos en robótica o IoT: los 8,7 GFLOPs y el formato TFLite permiten integrar el modelo en dispositivos con presupuesto energético y de cómputo limitado.
- Preprocesado en pipelines de datos: clasificación rápida de grandes volúmenes de imágenes para enrutarlas a modelos más costosos solo cuando corresponda a una categoría relevante.
- Aplicaciones web en el navegador: mediante runtimes compatibles con TFLite/WASM se puede desplegar la clasificación del lado del cliente sin backend.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente):

| Benchmark | Métrica | Valor |
|---|---|---|
| ImageNet-1k (validation) | Top-1 Accuracy (Full Precision) | 0,8356 (83,56 %) |
| ImageNet-1k (validation) | Top-5 Accuracy (Full Precision) | 0,9666 (96,66 %) |

La model card original de PyTorch Vision reporta para el mismo modelo acc@1 = 83,616 % y acc@5 = 96,65 %, coherentes con los valores anteriores. No se han publicado en la información disponible resultados de throughput, latencia ni precisión tras la conversión a TFLite.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~50M de parámetros en fp32 el peso ronda los 200 MB, y el repo completo ocupa 0,4 GB.
- GPU recomendadas: no se especifican; al ser un modelo TFLite orientado a edge, el objetivo principal son CPU, GPU integradas, NPU móviles y aceleradores LiteRT.
- ¿Cabe en GPU de consumo? Sí, con amplio margen en cualquier GPU consumer moderna (RTX 3060 o superior); el cuello de botella no es la memoria sino el runtime LiteRT.
- Opciones de despliegue: `ai-edge-litert` (Python, Android, iOS), TensorFlow Lite, y runtimes compatibles con TFLite. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Cómputo | Top-1 ImageNet-1K | Licencia | Formato |
|---|---|---|---|---|---|
| ConvNeXt Small (esta ficha) | ~50M | 8,7 GFLOPs | 83,56 % | no disponible | TFLite |
| ConvNeXt Tiny | no disponible en la información | no disponible | no disponible | no disponible | no disponible |
| Swin-T | no disponible en la información | no disponible | no disponible | no disponible | no disponible |
| ResNet-50 | no disponible en la información | no disponible | no disponible | no disponible | no disponible |

La model card indica que ConvNeXt Small compite favorablemente con Swin-T en precisión y throughput, pero no se aportan cifras comparativas concretas en la información disponible.

## Limitaciones y advertencias

- Modelo de clasificación cerrada: solo predice entre las 1.000 clases de ImageNet-1K; no generaliza a categorías fuera de esa taxonomía.
- Licencia no especificada: la model card remite a las condiciones de PyTorch Vision y del dataset de entrenamiento, por lo que el uso comercial requiere verificación legal independiente.
- Sesgos heredados de ImageNet-1K: la distribución del dataset condiciona el rendimiento en dominios alejados (imágenes médicas, satelitales, industriales) y puede reflejar sesgos de representación.
- Riesgo de alucinación en sentido figurado: el modelo siempre devolverá una de las 1.000 clases, incluso ante imágenes sin relación, sin señal de confianza calibrada más allá del softmax.
- No se documenta el impacto de la conversión a TFLite sobre la precisión; los valores reportados corresponden a "Full Precision" y podrían no coincidir con variantes cuantizadas.
- Sin soporte de texto, audio ni multimodalidad; no es adecuado para tareas generativas.
- Repositorio de comunidad: 48 descargas y 1 like en el momento de la consulta, lo que implica poca validación externa.
- No se especifican requisitos de preprocesado más allá del resize a 230 px con recorte central a 224 px ni tolerancias a otras resoluciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/convnext_small
- Paper original "A ConvNet for the 2020s": https://arxiv.org/abs/2201.03545
- Repositorio oficial de ConvNeXt (Facebook Research): no disponible en la información proporcionada
- Pesos originales en PyTorch Vision: no disponible como enlace directo en la información proporcionada
- Runtime LiteRT (`ai-edge-litert`): no disponible como enlace directo en la información proporcionada
- Etiquetas ImageNet-1K (`huggingface/label-files`): https://huggingface.co/datasets/huggingface/label-files
