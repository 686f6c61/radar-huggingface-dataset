# guruansh/siglip2-so400m-naflex-onnx

## Resumen

SigLIP2 so400m NaFlex en formato ONNX es un export optimizado del encoder visual (vision encoder tail) del modelo `google/siglip2-so400m-patch16-naflex`, creado por guruansh para permitir su compilación con TensorRT sin romper el manejo de aspect-ratio nativo de NaFlex. El modelo original, desarrollado por Google, es un encoder visión-lenguaje multilingüe de 400 millones de parámetros basado en el paper "SigLIP 2" (arXiv:2502.14786). Este export se centra exclusivamente en la parte estática del transformer de visión (27 capas + post-layernorm + attention-pooling head), dejando el front-end de embeddings NaFlex en PyTorch por su naturaleza dependiente de datos. El resultado es una mejora de rendimiento de 1,34× en una NVIDIA L4 respecto a PyTorch fp16 eager (67,0 → 89,7 crops/s) sin pérdida medible de precisión, con un tamaño de repositorio de 0,9 GB y licencia Apache-2.0.

No es un modelo autónomo: su entrada no es una imagen, sino el tensor intermedio producido por `vision_model.embeddings(pixel_values, spatial_shapes)`. Esta división es deliberada para evitar que el tracing de TensorRT fije un aspect-ratio concreto y produzca embeddings incorrectos en otros tamaños de imagen. La verificación publicada muestra un coseno mínimo de 0,999983 frente al modelo PyTorch en aspect ratios no incluidos en el lote de exportación, lo que confirma la validez del enfoque.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de visión (27 capas + post-layernorm + attention-pooling head) |
| Parametros totales | no disponible (el modelo base tiene 400M, pero este export solo contiene la parte de visión) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto de texto) |
| Tipos de cuantizacion | fp16 (ONNX) |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero este export es solo visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17, 2743 nodos, 854 MB) |

## Arquitectura y entrenamiento

El modelo es un export ONNX de la cola (tail) del vision encoder de SigLIP2 so400m NaFlex. La arquitectura completa incluye un front-end de embeddings NaFlex que preserva el aspect-ratio nativo de cada imagen (por ejemplo, una imagen alta y estrecha obtiene una rejilla de parches [36, 16], mientras que una cuadrada obtiene [24, 24]), pero la forma del tensor `pixel_values` es siempre `(B, 576, 768)`. Lo que cambia es el valor de `spatial_shapes`, que controla una interpolación per-imagen de la rejilla de embeddings de posición. Esta interpolación es data-dependent control flow, por lo que tracerla en ONNX fijaría los aspect ratios del lote de exportación y produciría resultados incorrectos para cualquier otro. Por eso, el front-end NaFlex se mantiene en PyTorch y solo se exporta la parte estática (las 27 capas transformer, post-layernorm y attention-pooling), que supone el 97,3% del tiempo de ejecución total.

No hay datos de entrenamiento disponibles para este export, ya que no es un modelo entrenado sino una conversión de pesos. El modelo base fue entrenado por Google con técnicas descritas en el paper de SigLIP 2, incluyendo pretraining multilingüe y mejoras en localización fina y recuperación densa.

## Capacidades

- Extracción de características visuales: produce un vector de 1152 dimensiones por imagen (embeddings de alta calidad para tareas de similitud, recuperación y clasificación).
- Compatibilidad con TensorRT: el formato ONNX está diseñado para compilarse con TensorRT, logrando mejoras de rendimiento significativas en GPUs modernas (1,34× en L4).
- Lote dinámico: el batch size es dinámico, lo que permite adaptar la inferencia a diferentes cargas.
- Integración con Hugging Face Transformers: se usa junto con el modelo base para el front-end NaFlex y el procesador de imágenes.
- Normalización L2 integrada: el uso recomendado incluye normalizar los embeddings antes de comparar (cosine similarity).
- Manejo de aspect-ratio nativo: aunque el front-end está en PyTorch, el flujo completo preserva la proporción de aspecto de cada imagen, lo que mejora la calidad en imágenes de formas variadas.

## Casos de uso

- Búsqueda visual por contenido: el modelo produce embeddings de imágenes que pueden indexarse y compararse con embeddings de consulta para encontrar imágenes similares en grandes bases de datos. El rendimiento en TensorRT permite procesar miles de imágenes por segundo en GPU.
- Clasificación de imágenes con cero-shot: aunque no incluye el text tower, el embedding de imagen se puede usar con un clasificador lineal entrenado sobre las características, o emparejar con el text encoder de SigLIP2 para clasificación multimodal.
- Sistemas de recomendación basados en contenido: generar embeddings de imágenes de productos (moda, e-commerce) para recomendar artículos visualmente similares. La baja latencia en TensorRT permite servir recomendaciones en tiempo real.
- Análisis de contenido multimedia: extraer características de fotogramas de vídeo para clasificación, detección de eventos o moderación de contenido. El throughput de 89,7 crops/s en L100 permite procesar vídeo a alta velocidad.
- Modelos de visión-lenguaje (VLM) personalizados: se puede usar como encoder de visión en pipelines de VLM donde el texto se maneja por separado. La división del front-end en PyTorch facilita la integración con el procesador de Hugging Face.
- Prototipado y despliegue en entornos con TensorRT: para aplicaciones que ya usan TensorRT como runtime, este ONNX permite integrar el encoder de visión de SigLIP2 en pipelines optimizados, manteniendo la flexibilidad de NaFlex para aspect ratios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) para este modelo, porque no es un modelo de lenguaje. En cambio, la model card incluye mediciones de rendimiento de inferencia para la torre de visión sola:

| GPU | PyTorch fp16 eager | PyTorch fp16 + torch.compile | TensorRT FP16 (este ONNX) |
|---|---|---|---|
| NVIDIA L4 (sm_89) | 67,0 crops/s | 70,3 crops/s | 89,7 end-to-end / 91,1 engine-only |
| Tesla T4 (sm_75) | 33,7 crops/s | 36,9 crops/s | 36,8 end-to-end / 37,3 engine-only |

La ganancia es arquitectura-dependiente: en L100 TensorRT supera a PyTorch en 34%, mientras que en T4 solo empata con `torch.compile`. El autor recomienda benchmarkear en el hardware objetivo. En cuanto a precisión, se evaluó en 1016 recortes de personas (derivados de COCO) contra 21.450 puntuaciones de similitud imagen-prompt, con un coseno mínimo de 0,99757 y medio de 0,99946 frente al modelo PyTorch fp16 de referencia.

## Requisitos de hardware

- VRAM estimada: el modelo ONNX pesa 854 MB en fp16, por lo que necesita al menos 1 GB de VRAM para la inferencia con el lote completo (batch de 8). Con batch dinámico, el consumo varía.
- GPU recomendadas: NVIDIA L4 (sm_90) o Tesla T4 (sm_75) según las pruebas; cualquier GPU compatible con TensorRT 11 o superior debería funcionar. Se recomienda al menos 8 GB de VRAM para trabajar con el lote completo y el front-end PyTorch.
- Consumer GPU: el modelo cabe en GPUs consumer como RTX 3090, RTX 4090 o RTX 4080, siempre que tengan soporte fp16 y TensorRT. No se han medido en esas GPUs, pero es viable.
- Opciones de despliegue: ONNX Runtime con `CUDAExecutionProvider` (como muestra el código de uso), o compilar un engine TensorRT con `trtexec` (build de ~56 s en L4) para máxima velocidad. No se recomienda llama.cpp ni Ollama porque no soportan la división front-end PyTorch.
- Latencia y throughput: en L4, el engine TensorRT logra 91,1 crops/s engine-only y 89,7 crops/s end-to-end (incluyendo el front-end PyTorch). En T4, 37,3 y 36,8 respectivamente. La latencia por imagen es de aproximadamente 11 ms en L4 y 27 ms en T4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (L4) | Licencia | Formato |
|---|---|---|---|---|---|
| `guruansh/siglip2-so400m-naflex-onnx` (este) | no disponible (tail de 4000 M base) | no aplica | 89,7 crops/s TensorRT | Apache-2.0 | ONNX |
| `google/siglip2-so400m-patch16-naflex` (base) | 4000 M | 576 parches | 67,0 crops/s (PyTorch eager) | Apache-2.0 | Safetensors |
| `google/siglip2-so400m-patch16-384` (SigLIP2 estándar) | 4000 M | 384 parches | no disponible | Apache-2.0 | Safetensors |

La diferencia clave es el formato y el rendimiento: este export ONNX permite una mejora de hasta 1.34× en TensorRT frente al modelo base en PyTorch, a costa de requerir el front-end en PyTorch y no ser standalone. Los modelos SigLIP2 estándar (sin NaFlex) tienen una arquitectura más simple pero pierden la capacidad de manejar aspect-ratio nativos.

## Limitaciones y advertencias

- No es un modelo standalone: el ONNX solo contiene la cola del vision encoder; el front-end de embeddings NaFlex debe ejecutarse en PyTorch. Alimentar imágenes directamente al ONNX fallará o producirá resultados incorrectos sin error visible.
- No incluye el text tower: el modelo es solo visión; para tareas de texto-imagen se necesita el text encoder del modelo base.
- Dependencia de la versión: el front-end debe ser exactamente el mismo que el usado en el export (revisión `cc24074f717b612951c2dead130904ab9b65a81e` de Hugging Face) para que los embeddings coincidan.
- Riesgo de errores silenciosos con TensorRT: `set_tensor_address` no hace comprobación de tipos; si se pasan buffers fp32 al engine fp16, se obtienen resultados no finitos sin ningún error.
- Aspect ratios no exportados: aunque se verificó que el modelo funciona con aspect ratios fuera del lote de exportación (coseno mínimo 0,999983), siempre es recomendable validar en el caso de uso concreto.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base puede tener condiciones adicionales; se recomienda revisar la licencia del modelo original.
- No se incluyen resultados de benchmarks de tareas (clasificación, retrieval, etc.) para este export; solo se mide la similitud con el modelo PyTorch de referencia.

## Enlaces

- [Modelo en Hugging Face (este export)](https://huggingface.co/guruansh/siglip2-so400m-naflex-onnx)
- [Modelo base en Hugging Face](https://huggingface.co/google/siglip2-so400m-patch16-naflex)
- [Paper SigLIP 2 en arXiv](https://arxiv.org/abs/2502.14786)
- [Repositorio GitHub de NaFlex](https://github.com/Findit-AI/siglip2-naflex)
