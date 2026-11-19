# protos-photos/siglip2-base-patch16-256-coreml

## Resumen

SigLIP 2 base (256 px) para Core ML es una conversión a formato Core ML del modelo multimodal de Google `google/siglip2-base-patch16-256`, publicada originalmente por Fluid Inference y replicada por protos-photos para garantizar la disponibilidad de la descarga. Incluye las dos torres del modelo original (codificador de imagen y codificador de texto), cada una devolviendo un embedding L2-normalizado de 768 dimensiones, lo que permite clasificación de imágenes zero-shot eligiendo las etiquetas como texto en tiempo de ejecución.

El interés práctico de esta conversión es que el codificador de imagen se ejecuta íntegramente en la Apple Neural Engine (ANE), con pesos en fp16 y un rendimiento medido de 5,2 ms por imagen en un M5 Pro, frente a 19,1 ms del modelo PyTorch fp32 sobre MPS. La precisión se mantiene prácticamente idéntica al original: 76,76 % top-1 en ImageNet-1k zero-shot frente a 76,79 % de PyTorch fp32, con un 99,32 % de predicciones idénticas.

El modelo resuelve el problema de desplegar clasificación de imágenes zero-shot en hardware Apple (macOS 14 / iOS 17 o superior) sin depender de PyTorch ni de GPUs dedicadas, con un consumo de memoria muy contenido (262 MB de pico en proceso frente a 4,24 GB de PyTorch MPS en el benchmark end-to-end sobre Oxford-IIIT Pets).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de dos torres (codificador de imagen tipo ViT patch16 y codificador de texto), conversión a Core ML |
| Parametros totales | no disponible (pesos empaquetados: 176 MB imagen + 539 MB texto en fp16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64 tokens para el codificador de texto (padding fijo con `<pad>`) |
| Tipos de cuantizacion | fp16 (pesos); entradas fp32 para imagen, int32 para tokens |
| Idiomas soportados | no disponible (el tokenizador es Gemma; el modelo base es multilingüe pero no se detalla) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.mlpackage` (Core ML); dos paquetes: imagen y texto |

## Arquitectura y entrenamiento

La arquitectura subyacente es SigLIP 2, un modelo de visión-lenguaje de dos torres entrenado con una función de pérdida sigmoide en lugar de softmax contrastivo (paper arXiv:2502.14786). El codificador de imagen procesa parches de 16×16 sobre entradas de 256×256 píxeles y produce un embedding de 768 dimensiones; el codificador de texto usa un tokenizador Gemma, añade `<eos>` y rellena con `<pad>` hasta 64 tokens, ya que SigLIP se entrenó sin máscara de atención y el padding debe coincidir exactamente.

La conversión a Core ML mantiene los pesos en fp16 y expone dos `mlpackage` independientes. El preprocesado de imagen es resize bilineal antialias a 256×256, escala a [0,1] y normalización `(x − 0,5) / 0,5`. La puntuación se calcula como `sigmoid(logit_scale · cos + logit_bias)` con constantes 112,90 y −16,77, lo que da una probabilidad independiente por etiqueta; alternativamente, softmax o argmax sobre el coseno selecciona una única etiqueta. Los embeddings de texto pueden calcularse una vez y reutilizarse para todas las imágenes.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo original en la información proporcionada.

## Capacidades

- Clasificación de imágenes zero-shot: las etiquetas se definen como texto en tiempo de ejecución, sin reentrenamiento.
- Generación de embeddings de imagen (768 d, L2-normalizados) para búsqueda, clustering y similitud visual.
- Generación de embeddings de texto (768 d) alineados con los de imagen en el mismo espacio.
- Puntuación multi-etiqueta independiente mediante sigmoide, además de selección única por softmax/argmax.
- Ejecución del codificador de imagen al 100 % en la Apple Neural Engine.
- Tokenizador Gemma en Swift con IDs idénticos al tokenizador de Python (vía FluidUse).
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto libre: es un modelo de embedding y clasificación, no un LLM generativo.
- No dispone de modo thinking, visión generativa, audio ni otras capacidades multimodales más allá del emparejamiento imagen-texto.

## Casos de uso

- Clasificación zero-shot en aplicaciones iOS/macOS: definir categorías como texto en tiempo de ejecución y clasificar fotos del carrete sin entrenar un clasificador específico, aprovechando los 5,2 ms por imagen en ANE.
- Organización y etiquetado automático de fototecas: el demo `ImageSortDemo` de FluidUse muestra cómo ordenar fotos por categorías predefinidas con un pico de memoria de 262 MB, adecuado para dispositivos con RAM limitada.
- Búsqueda visual por texto: indexar imágenes con embeddings de 768 d y recuperar por similitud coseno contra embeddings de consultas textuales calculados una sola vez.
- Filtrado y moderación de contenido en el dispositivo: puntuar imágenes contra etiquetas de política (por ejemplo, categorías de contenido sensible) sin enviar datos a la nube, con probabilidades independientes por etiqueta vía sigmoide.
- Deduplicación y clustering de imágenes: agrupar fotos similares por distancia entre embeddings, con un throughput medido de 202 fotos/s frente a 72 fotos/s de PyTorch MPS.
- Preetiquetado para pipelines de anotación: generar etiquetas candidatas zero-shot sobre grandes lotes (7.349 fotos procesadas en 36,3 s) y revisarlas manualmente después.
- Clasificación de especies, productos o escenas en apps de campo: el rendimiento en Oxford-IIIT Pets (94,77 % en 37 razas) indica viabilidad para dominios visuales acotados con prompts bien diseñados.

## Benchmarks y rendimiento

ImageNet-1k zero-shot sobre las 50.000 imágenes de test (`clip-benchmark/wds_imagenet1k`, prompt `this is a photo of {class}.`):

| Metrica | PyTorch fp32 | Core ML fp16 |
|---|---:|---:|
| Top-1 | 76,79 % | 76,76 % |
| Predicciones idénticas a PyTorch | — | 99,32 % |
| Coseno de embedding de imagen, media / mínimo | — | 0,99990 / 0,975 |

Oxford-IIIT Pets test (3.669 fotos, 37 razas): Core ML 94,77 %, PyTorch 94,74 %, 99,89 % idénticas. Google reporta 79,1 % en ImageNet-1k con sus propios nombres de clase y prompts; el protocolo de prompt único usado aquí es inferior en ambos backends.

Rendimiento end-to-end sobre 7.349 fotos de Oxford-IIIT Pets (decodificación JPEG, resize, encoder y scoring contra 37 prompts cacheados), en Apple M5 Pro (24 GB), macOS 27:

| Metrica | Core ML (Swift, 4 fotos en vuelo) | PyTorch fp32, MPS, batch 32 |
|---|---:|---:|
| Tiempo | 36,3 s | 102,2 s |
| Fotos por segundo | 202 | 72 |
| Memoria pico (proceso) | 262 MB | 4,24 GB |
| Modelo en disco | 715 MB | 1,50 GB |
| Precisión | 94,26 % | 94,11 % |

Codificador de imagen aislado, una llamada a la vez: 5,2 ms en CPU + Neural Engine (100 % de operaciones en ANE) y 3,5 ms en CPU + GPU, frente a 19,1 ms de PyTorch fp32 en MPS. PyTorch en batch 1: 153,5 s, 48 fotos/s, 3,64 GB.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon con Neural Engine; requiere macOS 14 / iOS 17 o superior.
- VRAM/RAM: pico de 262 MB de proceso medido en el pipeline end-to-end con 4 fotos en vuelo; el modelo en disco ocupa 715 MB (176 MB imagen + 539 MB texto).
- GPU recomendadas: no aplica GPU dedicada; el codificador de imagen corre en ANE (5,2 ms) o en GPU integrada (3,5 ms). El benchmark se realizó en un Apple M5 Pro de 24 GB.
- No cabe ni está pensado para GPUs consumer NVIDIA (RTX 4090, etc.); para esos entornos habría que usar el modelo PyTorch original.
- Opciones de despliegue: Core ML vía `coremltools` y Swift (`SigLIP2Manager` de FluidUse); scripts de conversión en `FluidInference/mobius`.
- Latencia y throughput: 5,2 ms por imagen en ANE; 202 fotos/s end-to-end con 4 fotos en vuelo; 3,5 ms por imagen en CPU + GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto texto | Entorno | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (SigLIP 2 base Core ML) | no disponible (715 MB en disco) | 64 tokens | Apple Silicon (ANE/GPU) | Apache-2.0 | Core ML en HF |
| `google/siglip2-base-patch16-256` (original) | no disponible | 64 tokens | PyTorch, GPU/CPU | Apache-2.0 | PyTorch en HF |
| `FluidInference/siglip2-base-patch16-256-coreml` | idéntico | 64 tokens | Apple Silicon | Apache-2.0 | Core ML en HF (origen del mirror) |

Frente al original en PyTorch, la conversión Core ML ofrece menor latencia (5,2 ms vs 19,1 ms en M5 Pro), menor memoria (262 MB vs 4,24 GB) y precisión equivalente (76,76 % vs 76,79 % top-1 en ImageNet-1k). No se dispone de datos de otros modelos comparables (por ejemplo, CLIP ViT-B/16) en la información proporcionada.

## Limitaciones y advertencias

- Solo clasificación y embeddings: no genera texto ni razona; no sustituye a un LLM.
- Ventana de texto fija de 64 tokens con padding obligatorio; prompts más largos no están soportados tal cual.
- La precisión zero-shot depende fuertemente de los prompts y nombres de clase; el protocolo de prompt único baja el top-1 a 76,76 % frente al 79,1 % reportado por Google con sus propios prompts.
- Riesgo de alucinación de etiquetas: al ser zero-shot, categorías ambiguas o poco representadas pueden recibir puntuaciones altas incorrectas; conviene calibrar con sigmoide y umbrales por etiqueta.
- Sesgos del modelo base de Google no documentados en la información disponible; hereda los del dataset de entrenamiento original.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base y del tokenizador Gemma, que puede tener términos propios.
- Dependencia de hardware Apple: no ejecutable en CUDA ni en CPU x86 sin reconversión.
- El repositorio es un mirror sin mantenimiento propio (0 descargas, 0 likes); la revisión fijada es `524a5a7d666f23002853831915cf1cc13734f73f`.
- Sin datos publicados sobre idiomas soportados por el codificador de texto más allá del tokenizador Gemma.

## Enlaces

- Hugging Face (este mirror): https://huggingface.co/protos-photos/siglip2-base-patch16-256-coreml
- Repositorio original: https://huggingface.co/FluidInference/siglip2-base-patch16-256-coreml
- Modelo base de Google: https://huggingface.co/google/siglip2-base-patch16-256
- Paper SigLIP 2: https://arxiv.org/abs/2502.14786
- FluidUse (wrapper Swift y demo): https://github.com/FluidInference/FluidUse
- Scripts de conversión (mobius): https://github.com/FluidInference/mobius
