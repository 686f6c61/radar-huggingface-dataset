# mistaplanet/Qwen3.5-4B-GGUF

## Resumen

Qwen3.5-4B es un modelo de lenguaje causal con codificador de visión desarrollado por el equipo Qwen de Alibaba, perteneciente a la familia Qwen3.5. Este repositorio concreto, publicado por el usuario mistaplanet, contiene una cuantización en formato GGUF del modelo base Qwen/Qwen3.5-4B, preparada con la metodología Unsloth Dynamic 2.0, que según el autor de las cuantizaciones ofrece mayor precisión que otras cuantizaciones estándar.

La relevancia de Qwen3.5 radica en su arquitectura híbrida que combina Gated Delta Networks (atención lineal) con capas dispersas de Mixture-of-Experts, lo que permite inferencia de alto rendimiento con baja latencia. Además, es un modelo multimodal unificado entrenado con early fusion sobre tokens multimodales, con soporte para 201 idiomas y dialectos, y una ventana de contexto nativa de 262.144 tokens extensible hasta 1.010.000 tokens. Con 4.206 millones de parámetros, es una opción atractiva para despliegue local en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo causal con codificador de visión; híbrido Gated DeltaNet + Gated Attention con sparse MoE |
| Parametros totales | 4.205.751.296 (4,2B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.010.000 |
| Tipos de cuantizacion | GGUF (Unsloth Dynamic 2.0); variantes concretas no disponibles |
| Idiomas soportados | 201 idiomas y dialectos (familia Qwen3.5) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base también está disponible en formato Transformers/safetensors |

## Arquitectura y entrenamiento

Qwen3.5-4B emplea una arquitectura híbrida con una disposición de capas de 8 bloques, cada uno compuesto por 3 bloques de Gated DeltaNet seguidos de FFN y 1 bloque de Gated Attention seguido de FFN. El Gated DeltaNet utiliza 32 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza de 128; el Gated Attention usa 16 cabezas para Q y 4 para KV (GQA), con dimensión de cabeza de 256 y RoPE de 64 dimensiones. La dimensión oculta es de 2.560, con 32 capas, vocabulario de 248.320 tokens (con embedding atado a la salida) y FFN de dimensión intermedia 9.216. El modelo fue entrenado con MTP (multi-token prediction) en múltiples pasos.

El entrenamiento incluye preentrenamiento y postentrenamiento, con una fase de aprendizaje por refuerzo escalado a entornos de millones de agentes con distribuciones de tareas progresivamente más complejas. La familia Qwen3.5 se entrena con early fusion de tokens multimodales, logrando una eficiencia de entrenamiento multimodal cercana al 100% respecto al entrenamiento solo de texto. Los detalles concretos del número de tokens de preentrenamiento y la composición del dataset no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto conversacional con pipeline image-text-to-text (comprensión de imágenes y texto)
- Razonamiento y código: la familia Qwen3.5 iguala a Qwen3 y supera a Qwen3-VL en benchmarks de razonamiento, código, agentes y comprensión visual
- Comprensión visual nativa gracias al entrenamiento unificado multimodal con early fusion
- Soporte para 201 idiomas y dialectos con comprensión cultural y regional matizada
- Contexto muy largo: 262.144 tokens nativos, extensible a más de 1 millón
- Entrenado con MTP multi-step, lo que facilita la decodificación especulativa y mayor throughput
- Compatibilidad con Hugging Face Transformers, vLLM, SGLang y KTransformers (modelo base); este GGUF es compatible con llama.cpp, Ollama y runtimes derivados
- Fine-tuning local posible con Unsloth

## Casos de uso

- Asistentes locales multimodales: al ser un modelo de 4B con soporte de imagen y texto, puede ejecutarse en portátiles y PCs de consumo para chat privado con análisis de documentos e imágenes sin enviar datos a la nube.
- Procesamiento de documentos largos: la ventana nativa de 262.144 tokens permite resumir o analizar contratos, informes o bases de código extensos en una sola pasada.
- Atención al cliente automatizada: el soporte multilingüe de 201 idiomas y el contexto largo permiten gestionar conversaciones multi-turno en múltiples idiomas con historial extenso.
- Generación y revisión de código en local: adecuado para integrarse en editores o pipelines de CI/CD como asistente ligero de revisión y generación de código.
- Agentes con razonamiento multi-step: la familia Qwen3.5 destaca en benchmarks de agentes y fue entrenada con RL a gran escala en entornos multi-agente, lo que la hace adecuada para scaffolds de agentes.
- Indexación y búsqueda multimodal (RAG): la comprensión de imágenes combinada con embeddings de texto permite construir pipelines RAG sobre colecciones mixtas de documentos escaneados y texto.
- Aplicaciones edge e integradas: el tamaño de 4B en GGUF cuantizado permite despliegue en dispositivos con VRAM limitada.

## Benchmarks y rendimiento

La model card original incluye tablas de benchmarks (MMLU-Pro y otras categorías de Knowledge & STEM, comparando con GPT-OSS-120B, GPT-OSS-20B, Qwen3-Next-80B-A3B-Thinking y Qwen3-30BA3B-Thinking-2507), pero los valores numéricos no están disponibles en la información proporcionada, por lo que no pueden reproducirse aquí.

No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 4,2B en GGUF, aproximadamente 2,5-3 GB con cuantización Q4_K_M y unos 4,5-5 GB con Q8_0, más overhead del KV cache (estimación basada en el tamaño del modelo; las variantes exactas del repo no están detalladas)
- GPUs recomendadas: cualquier GPU de consumo con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090 con holgura); en la nube, instancias T4 o superiores son suficientes
- Cabe en GPU de consumo: sí, cómodamente en GPUs de 6 GB o más incluso con contextos largos gracias a la arquitectura de atención lineal híbrida
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base admite además vLLM, SGLang, KTransformers y Hugging Face Transformers
- Latencia y throughput: no disponible; la arquitectura Gated DeltaNet está diseñada para alto throughput y baja latencia, pero no hay cifras publicadas en la información proporcionada

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia |
|---|---|---|---|---|
| Qwen3.5-4B (este modelo) | 4,2B | 262K (hasta 1M) | Sí (visión) | Apache 2.0 |
| Qwen3.5-9B | 9B | no disponible | Sí | Apache 2.0 |
| GPT-OSS-20B | 20B | no disponible | No | no disponible |
| Qwen3-30BA3B-Thinking-2507 | 30B (3B activos, MoE) | no disponible | No | Apache 2.0 |

Qwen3.5-4B se posiciona como la opción más ligera de su familia, con la ventaja de ser multimodal nativo y de ofrecer un contexto mucho mayor que la mayoría de modelos de su rango de tamaño. Frente a GPT-OSS-20B, sacrifica capacidad bruta a cambio de poder ejecutarse en hardware de consumo.

## Limitaciones y advertencias

- Al tratarse de una cuantización GGUF de terceros (mistaplanet), puede haber una ligera degradación de precisión respecto al modelo original; la metodología Unsloth Dynamic 2.0 busca minimizarla, pero conviene validar en el caso de uso concreto
- Los benchmarks de la model card no incluyen valores numéricos verificables en la información disponible, por lo que el rendimiento real debe medirse de forma independiente
- El riesgo de alucinación es inherente a modelos de 4B: en tareas de razonamiento complejo o conocimiento factual de nicho, puede cometer errores con apariencia de confianza
- El repo pesa 71,3 GB, considerablemente más de lo esperable para un modelo de 4B, lo que sugiere que incluye múltiples variantes de cuantización; conviene descargar solo las necesarias
- La licencia Apache 2.0 permite uso comercial sin restricciones relevantes
- El rendimiento en los 201 idiomas soportados no está desglosado; la calidad puede variar significativamente entre idiomas de alta y baja presencia en el preentrenamiento
- Este repositorio tiene muy poca tracción (1.402 descargas, 0 likes); para producción puede preferirse el modelo base oficial Qwen/Qwen3.5-4B o cuantizaciones de Unsloth oficiales

## Enlaces

- Repositorio GGUF: https://huggingface.co/mistaplanet/Qwen3.5-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Guía de Unsloth para Qwen3.5: https://unsloth.ai/docs/models/qwen3.5
- Guía de fine-tuning de Qwen3.5 con Unsloth: https://unsloth.ai/docs/models/qwen3.5/fine-tune
- Documentación de Unsloth Dynamic 2.0 GGUF: https://unsloth.ai/docs/basics/unsloth-dynamic-v2.0-gguf
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Qwen Chat (demo): https://chat.qwen.ai
