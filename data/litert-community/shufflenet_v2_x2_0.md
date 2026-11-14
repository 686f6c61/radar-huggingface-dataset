# litert-community/shufflenet_v2_x2_0

## Resumen

ShuffleNet V2 x2.0 es un clasificador de imágenes convolucional diseñado por Ningning Ma, Xiangyu Zhang, Hai-Tao Zheng y Jian Sun (publicado originalmente en 2018 en el paper "ShuffleNet V2: Practical Guidelines for Efficient CNN Architecture Design"). Esta versión concreta, publicada por la comunidad `litert-community`, es una conversión del checkpoint original de PyTorch Vision al formato LiteRT (`.tflite`) para su despliegue en dispositivos edge mediante `ai-edge-litert`.

El modelo aplica un multiplicador de complejidad de 2.0x sobre la arquitectura base, duplicando los canales de características para aumentar la capacidad representacional. Cuenta con aproximadamente 7,4 millones de parámetros y 0,58 GFLOPs, y alcanza un 76,22 % de Top-1 y un 92,97 % de Top-5 en ImageNet-1K en precisión completa. Su relevancia actual radica en que ofrece un equilibrio entre precisión y eficiencia computacional adecuado para inferencia en móviles, microcontroladores de gama alta y sistemas embebidos.

La arquitectura se apoya en los bloques "channel split" y "channel shuffle", que reducen el coste de memoria y mejoran la eficiencia hardware frente a arquitecturas CNN convencionales. El repositorio ocupa 0,1 GB y está pensado para pipelines de clasificación de imágenes en producción con restricciones de latencia y consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (ShuffleNet V2, bloques channel split y channel shuffle) |
| Parametros totales | 7.393.996 (aproximadamente 7,4 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no aplica) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el artefacto publicado es un `.tflite` de precisión completa |
| Idiomas soportados | no disponible (clasificación de imágenes ImageNet-1K, sin procesamiento de lenguaje) |
| Licencia | no disponible (heredada potencialmente de PyTorch Vision; el autor indica que es responsabilidad del usuario verificar) |
| Formato de pesos | TFLite (`.tflite`), convertido desde PyTorch Vision |
| Entrada | imagen RGB 224x224, normalizada con media [0.485, 0.456, 0.406] y desviación [0.229, 0.224, 0.225] |
| Salida | 1000 clases ImageNet-1K |
| Complejidad | aproximadamente 0,58 GFLOPs |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

ShuffleNet V2 es una red neuronal convolucional diseñada bajo directrices prácticas de eficiencia para hardware real. Sus bloques principales son "channel split" (dividir los canales de entrada en dos ramas) y "channel shuffle" (mezclar canales entre grupos para permitir comunicación entre grupos convolucionales), que reducen el coste de acceso a memoria, uno de los cuellos de botella principales en inferencia sobre dispositivos móviles. La variante x2.0 escala el número de canales por un factor de 2 respecto a la versión base, incrementando la precisión a costa de mayor coste computacional.

El modelo fue entrenado originalmente sobre ImageNet-1K (1,28 millones de imágenes de entrenamiento, 1000 clases) y posteriormente convertido desde PyTorch Vision al formato LiteRT por `litert-community`. No se dispone en la información proporcionada de detalles sobre el proceso de entrenamiento (número de épocas, aumentos de datos, uso de RLHF/DPO, etc.), ya que se trata de una conversión de pesos preentrenados, no de un reentrenamiento. El pipeline de preprocesado documentado incluye redimensionado con lado corto 232, recorte central a 224x224 y normalización con media y desviación estándar de ImageNet.

## Capacidades

- Clasificación de imágenes en 1000 categorías de ImageNet-1K.
- Inferencia en dispositivos edge mediante `ai-edge-litert` (antes TensorFlow Lite).
- Ejecución en CPU y aceleradores compatibles con LiteRT (GPU delegados, NNAPI, etc., según soporte del runtime).
- Modelo puramente visual: no procesa texto, audio ni vídeo de forma nativa.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües ni de generación de texto.
- No incluye modo "thinking", visión generativa ni otras capacidades de modelos fundacionales.

## Casos de uso

- Clasificación de imágenes en aplicaciones móviles: el modelo en formato TFLite se puede empaquetar dentro de apps Android/iOS para etiquetar fotos en el dispositivo sin enviar datos a la nube, gracias a sus 7,4 M de parámetros y 0,58 GFLOPs.
- Moderación de contenido visual en el edge: filtrado rápido de imágenes en cámaras o dispositivos IoT para descartar contenido no deseado antes de un análisis más profundo en servidor.
- Etiquetado automático de fotos en bibliotecas personales: clasificación de imágenes en categorías genéricas (animales, vehículos, objetos cotidianos) para organizar colecciones locales.
- Preprocesado en pipelines de visión por computador: uso como extractor de etiquetas gruesas antes de un modelo más pesado o específico, reduciendo el cómputo total del sistema.
- Robótica y sistemas embebidos: clasificación rápida de escenas u objetos en robots de bajo consumo o en placas como Raspberry Pi, siempre que el runtime LiteRT esté disponible.
- Prototipado rápido de aplicaciones de visión: validación de conceptos de clasificación de imágenes con un modelo preentrenado y ligero antes de invertir en entrenamiento propio.
- Control de calidad en líneas de producción: detección de categorías de producto o defectos gruesos en imágenes capturadas por cámaras industriales conectadas a dispositivos con recursos limitados.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (ImageNet-1K, split validation, precisión completa). No verificados de forma independiente.

| Metrica | Valor |
|---|---|
| Top-1 Accuracy (Full Precision) | 0,7622 (76,22 %) |
| Top-5 Accuracy (Full Precision) | 0,9297 (92,97 %) |

Nota: la model card indica adicionalmente un acc@5 de 93,006 % para el checkpoint original de PyTorch Vision, ligeramente distinto del 0,9297 declarado en el model-index.

## Requisitos de hardware

- VRAM estimada: el modelo es de 7,4 M de parámetros; en FP32 ocupa aproximadamente 30 MB de pesos, por lo que cabe holgadamente en cualquier GPU consumer y en la mayoría de dispositivos móviles.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Para aceleración se puede usar GPU integrada en móviles vía delegados LiteRT, o GPUs de escritorio (RTX 3060, RTX 4090, A100, H100) si se ejecuta en servidor, aunque el modelo está sobredimensionado para estas últimas.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 2060, RTX 3060, RTX 4090) y en la mayoría de SoCs móviles modernos.
- Opciones de despliegue: `ai-edge-litert` (runtime oficial documentado en la model card), TensorFlow Lite, y potencialmente otros runtimes compatibles con TFLite. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada. Dado el reducido número de GFLOPs (0,58), se espera latencia de pocos milisegundos en hardware móvil moderno, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Top-1 ImageNet-1K | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ShuffleNet V2 x2.0 (este) | 7,4 M | 76,22 % | TFLite | no disponible | Optimizado para edge, 0,58 GFLOPs |
| MobileNetV2 | no disponible en la informacion | no disponible en la informacion | no disponible | no disponible | Alternativa CNN ligera para edge; datos no proporcionados |
| EfficientNet-B0 | no disponible en la informacion | no disponible en la informacion | no disponible | no disponible | Alternativa CNN eficiente; datos no proporcionados |

No se dispone en la información proporcionada de resultados comparativos con otros modelos de la misma categoría. Se recomienda consultar los benchmarks publicados en el paper original de ShuffleNet V2 (arXiv:1807.11164) para comparaciones con MobileNetV2, NASNet-A y otros modelos eficientes.

## Limitaciones y advertencias

- Modelo puramente de clasificación de imágenes: no genera texto, no razona, no soporta agentes ni tool calling.
- Entrenado exclusivamente sobre ImageNet-1K (1000 clases genéricas); puede fallar en dominios especializados (medicina, industria, satélite) sin fine-tuning.
- Riesgo de sesgos heredados del dataset ImageNet-1K (representación desigual de categorías, sesgos culturales y geográficos).
- Riesgo de clasificación errónea en imágenes fuera de distribución o con condiciones de iluminación, ángulo o resolución distintas a las del conjunto de entrenamiento.
- Licencia no disponible explícitamente: el autor advierte que los pesos derivan de PyTorch Vision y del dataset ImageNet-1K, por lo que es responsabilidad del usuario verificar los términos de uso comercial antes de desplegarlo en producción.
- El artefacto publicado es de precisión completa; no se documentan versiones cuantizadas (INT8, FP16) en la información proporcionada, lo que puede limitar el rendimiento en algunos aceleradores.
- No se documentan métricas de latencia ni consumo energético en dispositivos concretos, por lo que la evaluación en el hardware objetivo es imprescindible.
- El repositorio tiene pocas descargas (78) y likes (2), lo que sugiere validación comunitaria limitada.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/shufflenet_v2_x2_0
- Paper original (arXiv): https://arxiv.org/abs/1807.11164
- Repositorio PyTorch Vision (origen de los pesos): https://github.com/pytorch/vision
- Runtime LiteRT (ai-edge-litert): https://ai.google.dev/edge/litert
- Etiquetas ImageNet-1K: https://huggingface.co/datasets/huggingface/label-files
