# litert-community/shufflenet_v2_x1_0

## Resumen

ShuffleNet V2 x1.0 es una red neuronal convolucional (CNN) para clasificación de imágenes, publicada en el repositorio `litert-community` de Hugging Face como un modelo convertido al formato LiteRT (antes TensorFlow Lite). El modelo original fue propuesto por Ningning Ma, Xiangyu Zhang, Hai-Tao Zheng y Jian Sun en el artículo "ShuffleNet V2: Practical Guidelines for Efficient CNN Architecture Design" (2018), y esta versión es una conversión directa de los pesos preentrenados de PyTorch Vision.

La arquitectura está optimizada para maximizar la eficiencia en CPUs de propósito general, tanto móviles como de servidor, mediante un mecanismo equilibrado de "channel split" y "channel shuffle" que reduce el coste de acceso a memoria (MAC). Con un multiplicador de complejidad de 1.0x y aproximadamente 0,15 GFLOPs, ofrece una relación precisión-velocidad muy favorable para inferencia en dispositivos con recursos limitados.

El modelo cuenta con 2.278.604 parámetros, clasifica imágenes en las 1.000 clases de ImageNet-1k y se distribuye en formato `.tflite` para su uso con la librería `ai-edge-litert`. Es relevante para desarrolladores que necesitan un clasificador de imágenes ligero, rápido y desplegable en entornos móviles o de borde sin infraestructura de GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN (ShuffleNet V2, channel split + channel shuffle) |
| Parámetros totales | 2.278.604 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantización | no disponible (el repo distribuye pesos en formato TFLite; no se detallan variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | TFLite (`shufflenet_v2_x1_0.tflite`) |
| Entrada | Imagen RGB 224x224, normalizada con media [0.485, 0.456, 0.406] y desviación [0.229, 0.224, 0.225] |
| Complejidad | ~0,15 GFLOPs (multiplicador 1.0x) |
| Tarea | Clasificación de imágenes (ImageNet-1k, 1.000 clases) |

## Arquitectura y entrenamiento

ShuffleNet V2 es una CNN diseñada bajo directrices prácticas de eficiencia: sus bloques emplean un "channel split" que divide los canales de entrada en dos ramas (una que pasa sin transformación y otra que aplica convoluciones), seguidas de una operación de "channel shuffle" que mezcla la información entre ramas. Este diseño minimiza el coste de acceso a memoria (MAC), que los autores identifican como el cuello de botella real en hardware móvil, frente al simple conteo de FLOPs.

El modelo fue entrenado originalmente sobre ImageNet-1k (split de validación para evaluación) y esta versión se obtiene convirtiendo el checkpoint de PyTorch Vision al formato LiteRT. No se dispone de información en la documentación proporcionada sobre el número exacto de tokens/imágenes de entrenamiento, la composición del dataset más allá de ImageNet-1k, ni sobre el uso de técnicas de ajuste fino adicionales (RLHF/DPO no aplican a un clasificador de visión). Tampoco se detalla si la conversión incluye optimizaciones de cuantización.

## Capacidades

- Clasificación de imágenes en 1.000 categorías de ImageNet-1k.
- Inferencia en CPU de propósito general (móvil y servidor) con bajo coste computacional (~0,15 GFLOPs).
- Despliegue mediante la librería `ai-edge-litert` (LiteRT/TFLite) con API de modelo compilado.
- Preprocesado estándar documentado: redimensionado bilineal a 256 px en el lado corto, recorte central a 224x224 y normalización por media/desviación de ImageNet.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües, de visión generativa, audio ni modo "thinking".

## Casos de uso

- Clasificación de imágenes en aplicaciones móviles: el modelo puede integrarse en apps Android/iOS mediante LiteRT para etiquetar fotos en el dispositivo, aprovechando su reducido tamaño (2,3 M de parámetros) y su bajo coste de inferencia en CPU.
- Filtrado y organización automática de fotos: etiquetar lotes de imágenes por categoría (animales, vehículos, objetos) en un servidor sin GPU, usando el script de ejemplo con `CompiledModel` y el mapa `imagenet-1k-id2label.json`.
- Preprocesado en pipelines de visión por computador: actuar como extractor de etiquetas preliminar o componente de un sistema mayor (por ejemplo, triaje de imágenes antes de un modelo más pesado) gracias a su rapidez en CPU.
- Prototipado rápido y educación: servir como referencia para aprender a desplegar modelos TFLite con `ai-edge-litert`, dado que la model card incluye un script completo de inferencia.
- Sistemas embebidos y de borde: clasificación en dispositivos con recursos limitados (Raspberry Pi, cámaras inteligentes) donde no hay GPU disponible y se requiere un modelo de menos de 10 MB.
- Moderación o etiquetado de contenido a gran escala: clasificación masiva de imágenes en servidores CPU para enrutar o etiquetar contenido antes de revisiones más costosas.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (model-index), sobre ImageNet-1k, split de validación:

| Métrica | Valor |
|---|---|
| Top-1 Accuracy (Full Precision) | 0,6931 (69,31 %) |
| Top-5 Accuracy (Full Precision) | 0,8830 (88,30 %) |

La model card indica además acc@1 de 69,362 % y acc@5 de 88,316 % para el modelo original de PyTorch Vision. No se han publicado en la información disponible resultados comparativos adicionales (latencia, throughput) ni benchmarks frente a otros modelos.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está pensado para inferencia en CPU. El tamaño del repositorio es de 0,0 GB (pesos TFLite muy ligeros, coherente con 2,3 M de parámetros).
- GPU recomendadas: no disponibles; el modelo no requiere GPU y está optimizado para CPU móvil y de servidor.
- Cabe en cualquier GPU consumer (RTX 4090, etc.) e incluso en dispositivos sin GPU, dado su reducido tamaño.
- Opciones de despliegue: LiteRT mediante `ai-edge-litert` (API `CompiledModel`), tal como se documenta en la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador TFLite).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks ni especificaciones de modelos alternativos comparables (por ejemplo, MobileNetV2/V3, EfficientNet-Lite u otras variantes de ShuffleNet). Por tanto, la comparativa cuantitativa se indica como no disponible.

| Modelo | Parámetros | Contexto | Top-1 ImageNet-1k | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ShuffleNet V2 x1.0 (este) | 2.278.604 | no aplica | 69,31 % | no disponible | Hugging Face (litert-community) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre ImageNet-1k, puede heredar los sesgos de dicho dataset (representación desigual de clases y contextos).
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí puede producir clasificaciones erróneas o de baja confianza en imágenes fuera de la distribución de ImageNet-1k.
- Limitaciones de contexto o idioma: no aplica contexto textual; el modelo solo procesa imágenes RGB de 224x224 y no soporta otros idiomas ni modalidades.
- Restricciones de licencia: la licencia no está disponible en la información proporcionada. La model card advierte que los pesos pueden tener licencias o términos derivados de PyTorch Vision y del dataset de entrenamiento, y que es responsabilidad del usuario determinar si puede usar el modelo para su caso de uso.
- Caveats para producción: la precisión reportada (69,31 % Top-1) es moderada; para tareas críticas se recomienda validar con datos propios. No se detallan variantes cuantizadas ni métricas de latencia, por lo que el rendimiento real en hardware concreto debe medirse. El modelo está limitado a las 1.000 clases de ImageNet-1k y no admite clases personalizadas sin reentrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/shufflenet_v2_x1_0
- Organización LiteRT Community: https://huggingface.co/litert-community
- Artículo original (arXiv): https://arxiv.org/abs/1807.11164
- Repositorio de etiquetas ImageNet-1k usado en el ejemplo: https://huggingface.co/datasets/huggingface/label-files
