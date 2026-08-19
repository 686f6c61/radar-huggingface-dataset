# prism-ml/Bonsai-27B-gguf

## Resumen

Bonsai 27B es un modelo de lenguaje multimodal desarrollado por Prism ML, derivado del modelo Qwen3.6-27B. Su principal innovación consiste en una cuantización extrema de 1 bit (binaria) aplicada de extremo a extremo a todos los pesos del transformador, incluyendo embeddings, proyecciones de atención, MLP y la cabeza de salida. Esto reduce el tamaño desplegado a aproximadamente 3,9 GB, unas 14,2 veces menos que el equivalente en FP16, manteniendo según sus autores alrededor del 89,5 % de la inteligencia del modelo original. Está disponible en formato GGUF para llama.cpp, con soporte para CUDA, Metal y CPU, y también existe una versión MLX para Apple Silicon.

El modelo está pensado para llevar capacidades de razonamiento, codificación y uso de agentes a dispositivos con recursos limitados, como portátiles convencionales, GPUs de gama media e incluso teléfonos de gama alta. Su arquitectura híbrida de atención (aproximadamente 75 % lineal y 25 % completa) permite una ventana de contexto de 262 000 tokens sin un crecimiento excesivo de la caché KV, que además se cuantiza a 4 bits. Incluye una torre de visión en 4 bits HQQ, lo que lo convierte en un modelo multimodal capaz de procesar imágenes junto con texto. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Hybrid attention (~75 % lineal / ~25 % completa), SwiGLU MLP, RoPE, RMSNorm |
| Parámetros totales | ~27,3B (lenguaje) + ~0,46B (torre de visión) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens |
| Tipos de cuantización | Q1_0_g128 (1 bit binario), versión ternaria (~7,2 GB) y MLX 1-bit |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q1_0_g128), MLX |

## Arquitectura y entrenamiento

Bonsai 27B parte del modelo Qwen3.6-27B, un transformador causal de atención híbrida con aproximadamente 75 % de atención lineal y 25 % de atención completa, junto con MLP SwiGLU, RoPE y RMSNorm. La cuantización binaria Q1_0_g128 representa cada peso con un único bit de signo (0 → −escala, 1 → +escala) y un factor de escala FP16 compartido por cada grupo de 128 pesos, lo que resulta en 1,125 bits efectivos por peso. Esta representación se aplica a todas las capas del modelo de lenguaje, sin excepciones de alta precisión, y la torre de visión se cuantiza por separado con HQQ de 4 bits.

No se han publicado detalles sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO). La model card indica que el modelo se acompaña de una capa de decodificación especulativa DSpark, entrenada contra el propio Bonsai 27B, que proporciona una aceleración de 1,37x en la decodificación en el servidor CUDA. La caché KV se cuantiza a 4 bits, y gracias a la atención mayoritariamente lineal, solo 16 de las 64 capas mantienen una caché de atención completa, lo que limita el consumo de memoria incluso con la ventana completa de 262K tokens.

## Capacidades

- Generación de texto y razonamiento multimodal: acepta entradas de imagen y texto, y produce respuestas textuales.
- Razonamiento avanzado: según la model card, conserva capacidades de pensamiento (thinking mode) y razonamiento en tareas de matemáticas y codificación, con una puntuación media de 76,11 en 15 benchmarks de thinking-mode (89,5 % del rendimiento FP16).
- Codificación: obtiene 81,88 en benchmarks de codificación, lo que lo hace adecuado para generación y asistencia de código.
- Matemáticas: alcanza 91,66 en benchmarks matemáticos, manteniéndose cerca del modelo original.
- Comportamiento agéntico: la model card menciona que retiene comportamiento de agente, lo que sugiere soporte para tareas multi-paso y posible integración con herramientas, aunque no se detalla explícitamente el soporte de function calling.
- Multilingüismo: no se especifican los idiomas soportados; se asume que hereda las capacidades del modelo base Qwen3.6-27B, pero no está confirmado.
- Inferencia en dispositivos con recursos limitados: gracias a su tamaño reducido, puede ejecutarse en portátiles, GPUs de gama media y teléfonos de gama alta.

## Casos de uso

- Asistente de codificación local: un desarrollador puede ejecutar Bonsai 27B en un portátil con GPU modesta para obtener sugerencias de código, explicaciones y refactorización sin depender de servicios en la nube. Su rendimiento en codificación (81,88) y su tamaño de ~3,9 GB lo hacen viable para entornos de desarrollo sin conexión.
- Chatbot de atención al cliente en el borde: empresas que necesitan desplegar un asistente conversacional en dispositivos locales (por privacidad o latencia) pueden usar Bonsai 27B con su ventana de 262K tokens para gestionar conversaciones largas y contextualizadas sin enviar datos a servidores externos.
- Análisis de documentos extensos: la ventana de contexto de 262K tokens permite procesar libros, informes o transcripciones completas en una sola pasada, útil para resúmenes, extracción de información o búsqueda semántica en entornos con recursos limitados.
- Aplicaciones móviles de IA generativa: la versión MLX Swift permite ejecutar el modelo en iPhone (aproximadamente 11 tok/s en iPhone 17 Pro Max), posibilitando asistentes personales, traductores o generadores de texto que funcionan completamente en el dispositivo.
- Prototipado rápido de agentes: investigadores y desarrolladores pueden integrar Bonsai 27B en pipelines de agentes que requieren razonamiento multi-paso y toma de decisiones, aprovechando su comportamiento agéntico y su bajo coste de despliegue para experimentar sin infraestructura costosa.
- Inferencia multimodal en entornos edge: la torre de visión permite procesar imágenes junto con texto, por ejemplo para describir fotografías, extraer texto de imágenes (OCR) o responder preguntas visuales en dispositivos con poca memoria, como cámaras inteligentes o sistemas de asistencia en campo.

## Benchmarks y rendimiento

La model card proporciona los siguientes resultados, medidos en 15 benchmarks de thinking-mode y comparados con el modelo FP16 de referencia:

| Métrica | Valor |
|---|---|
| Promedio en 15 benchmarks thinking-mode | 76,11 (89,5 % del FP16) |
| Matemáticas | 91,66 |
| Codificación | 81,88 |
| Rendimiento relativo vs FP16 | 89,5 % |
| Versión ternaria (calidad) | 94,6 % del FP16 |

No se han publicado comparaciones con otros modelos de la misma categoría en la información disponible. Los datos provienen exclusivamente de la model card del autor.

## Requisitos de hardware

- Tamaño desplegado: ~3,9 GB para el modelo de lenguaje, lo que permite ejecutarlo en GPUs con al menos 4 GB de VRAM (por ejemplo, RTX 3050, RTX 4060, GTX 1660 Super) y en CPUs modernas con suficiente RAM.
- GPU recomendadas: cualquier GPU compatible con CUDA (NVIDIA) o Metal (Apple) con al menos 4 GB de memoria. Se ha demostrado su funcionamiento en Apple M5 Pro a ~44 tok/s y en iPhone 17 Pro Max a ~11 tok/s vía MLX Swift.
- Opciones de despliegue: llama.cpp (con kernels personalizados para CUDA y Metal), MLX para Apple Silicon, y servidores compatibles con GGUF como vLLM (si se adapta) o TGI. También se puede usar con Ollama si se importa el GGUF.
- Latencia y throughput: en Apple M5 Pro se reportan ~44 tok/s; en iPhone 17 Pro Max ~11 tok/s. En GPUs CUDA, la decodificación especulativa DSpark proporciona una aceleración de 1,37x, aunque no se especifican valores absolutos de tokens por segundo.
- La versión ternaria (~7,2 GB) requiere al menos 8 GB de VRAM para una ejecución cómoda.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría (por ejemplo, otros modelos de 27B cuantizados) en la información proporcionada. La comparación más relevante es con las variantes del propio Bonsai 27B:

| Modelo | Tamaño | Rendimiento relativo vs FP16 | Formato |
|---|---|---|---|
| Bonsai 27B (binario) | ~3,9 GB | 89,5 % | GGUF Q1_0_g128 |
| Bonsai 27B (ternario) | ~7,2 GB | 94,6 % | GGUF |
| Qwen3.6-27B (FP16) | ~54 GB | 100 % | FP16 |

## Limitaciones y advertencias

- La cuantización binaria extrema implica una pérdida de calidad del 10,5 % en promedio respecto al modelo FP16, que puede ser más acusada en tareas muy complejas o que requieren matices sutiles.
- No se han documentado sesgos específicos del modelo, pero al derivar de Qwen3.6-27B, puede heredar sesgos presentes en los datos de entrenamiento del modelo base.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas abiertas. La cuantización extrema podría aumentar este riesgo en comparación con el modelo original.
- La información sobre idiomas soportados no está disponible; se recomienda verificar el comportamiento en el idioma objetivo antes de usarlo en producción.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo incluye una torre de visión cuantizada con HQQ que se carga solo cuando se procesan imágenes; su rendimiento en tareas visuales no está documentado en detalle.
- Para producción, es recomendable validar el rendimiento en el caso de uso específico, ya que los benchmarks publicados se centran en razonamiento y codificación, no en todas las tareas posibles.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/prism-ml/Bonsai-27B-gguf)
- [Colección Bonsai 27B](https://huggingface.co/collections/prism-ml/bonsai-27b)
- [Whitepaper y demo](https://github.com/PrismML-Eng/Bonsai-demo)
- [Documentación oficial](https://docs.prismml.com/models/bonsai-27b)
- [Anuncio de PrismML](https://prismml.com/news/prismml-releases-bonsai-27b)
- [Página en LM Studio](https://lmstudio.ai/models/prism-ml/bonsai-27b)
- [Versión MLX 1-bit](https://huggingface.co/prism-ml/Bonsai-27B-mlx-1bit)
- [Versión ternaria GGUF](https://huggingface.co/prism-ml/Ternary-Bonsai-27B-gguf)
- [Fork de llama.cpp con kernels de bajo bit](https://github.com/PrismML-Eng/llama.cpp)
- [Fork de MLX](https://github.com/PrismML-Eng/mlx)
- [Fork de mlx-swift](https://github.com/PrismML-Eng/mlx-swift)
