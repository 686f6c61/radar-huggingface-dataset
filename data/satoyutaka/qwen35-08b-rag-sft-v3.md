# satoyutaka/qwen35-08b-rag-sft-v3

## Resumen

Qwen3.5-0.8B es un modelo fundacional multimodal de tipo vision-lenguaje desarrollado por el equipo Qwen (Alibaba). Se trata de la variante más pequeña de la familia Qwen3.5, con aproximadamente 0,8 mil millones de parámetros (873.438.784 según los pesos en safetensors). El modelo combina un encoder de visión con un modelo de lenguaje causal y está diseñado para prototipado, ajuste fino específico de tarea e investigación, dado su reducido tamaño.

La arquitectura introduce una innovación destacable: un diseño híbrido que alterna capas de Gated DeltaNet (atención lineal) con capas de Gated Attention (atención tradicional), organizadas en un patrón de 6 bloques de 3 capas DeltaNet más 1 capa de atención. Esto reduce el coste computacional en inferencia manteniendo una ventana de contexto nativa de 262.144 tokens, algo poco habitual en modelos de este tamaño.

La ficha que nos ocupa, `satoyutaka/qwen35-08b-rag-sft-v3`, es un ajuste fino supervisado (SFT) del modelo base `Qwen/Qwen3.5-0.8B-Base`, presumiblemente orientado a tareas de generación aumentada por recuperación (RAG), aunque la model card no documenta los detalles del dataset de ajuste. Es relevante para desarrolladores que necesiten un modelo multimodal ligero, desplegable en hardware modesto y con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con encoder de visión; híbrido Gated DeltaNet + Gated Attention |
| Parametros totales | 873.438.784 (~0,8B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en precisión completa; compatible con cuantización vía herramientas externas) |
| Idiomas soportados | 201 idiomas y dialectos (según la model card del modelo base) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida de transformer con dos tipos de capas intercaladas: Gated DeltaNet, una forma de atención lineal con 16 cabezas para V y 16 para QK con dimensión de cabeza 128, y Gated Attention tradicional con 8 cabezas de consulta y 2 de clave-valor con dimensión 256 y RoPE de 64 dimensiones. El layout es 6 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), con 24 capas en total, dimensión oculta de 1024, FFN de dimensión intermedia 3584 y embeddings de 248.320 tokens (con salida LM atada a los embeddings). Incluye entrenamiento con multi-token prediction (MTP) en varios pasos.

Según la documentación del modelo base, el entrenamiento combina pre-entrenamiento y post-entrenamiento con fusión temprana de tokens multimodales, alcanzando paridad con Qwen3 en razonamiento, código, agentes y comprensión visual. Se menciona escalado de RL en entornos multi-agente y una infraestructura de entrenamiento multimodal con eficiencia cercana al 100 % respecto a texto puro. Los detalles específicos del ajuste fino SFT de esta ficha (composición del dataset RAG, número de tokens, hiperparámetros) no están documentados en la información disponible.

## Capacidades

- Generación de texto y razonamiento en modo no-thinking (los benchmarks publicados corresponden a este modo).
- Comprensión de imágenes y texto (pipeline `image-text-to-text`), con encoder de visión integrado.
- Capacidades de código y matemáticas heredadas del modelo base Qwen3.5.
- Soporte multilingüe amplio: 201 idiomas y dialectos según la documentación del modelo base.
- Contexto largo de 262.144 tokens, adecuado para documentos extensos y conversaciones multi-turno.
- Compatibilidad con tool calling y flujos de agentes según las capacidades declaradas de Qwen3.5 (no verificado específicamente para esta variante SFT).
- Ajuste específico para RAG (según el nombre del repositorio), aunque la model card no detalla el formato de prompting ni los datos de entrenamiento.

## Casos de uso

- Generación aumentada por recuperación (RAG): el ajuste SFT sugiere especialización en responder preguntas a partir de contexto recuperado; su ventana de 262.144 tokens permite inyectar múltiples documentos sin truncamiento.
- Prototipado rápido de asistentes multimodales: al ser un modelo de 0,8B, se puede desplegar en una sola GPU de consumo para validar flujos de imagen-texto antes de escalar a modelos mayores.
- Procesamiento de documentos con imágenes: extracción de información de facturas, capturas o formularios combinando el encoder de visión con generación de texto estructurado.
- Atención al cliente con contexto largo: gestión de conversaciones multi-turno con historial extenso gracias a la ventana de 262K tokens y al soporte de 201 idiomas.
- Ajuste fino específico de dominio: el tamaño reducido permite reentrenar o aplicar LoRA sobre el modelo en hardware asequible para tareas verticales (legal, sanitario, técnico).
- Investigación en arquitecturas híbridas: útil para estudiar el comportamiento de Gated DeltaNet frente a atención tradicional en tareas de razonamiento y recuperación.
- Despliegue en el borde o entornos con recursos limitados: inferencia en CPU o GPU de gama baja mediante cuantización con llama.cpp u Ollama (compatibilidad no verificada para esta arquitectura híbrida).

## Benchmarks y rendimiento

Resultados publicados para el modelo base Qwen3.5-0.8B en modo no-thinking, comparado con modelos de tamaño similar:

| Benchmark | Qwen3-4B-2507 | Qwen3-1.7B | Qwen3.5-2B | Qwen3.5-0.8B |
|---|---|---|---|---|
| MMLU-Pro | 69,6 | 40,2 | 55,3 | 29,7 |
| MMLU-Redux | 84,2 | 64,4 | 69,2 | 48,5 |
| C-Eval | 80,2 | 61,0 | 65,2 | 46,4 |

No se han publicado resultados de benchmarks específicos para el ajuste fino `satoyutaka/qwen35-08b-rag-sft-v3` en la información disponible. Los datos anteriores corresponden al modelo base y no reflejan necesariamente el rendimiento tras el SFT.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1,8 GB en FP16/BF16 (tamaño del repo), ~0,9 GB en cuantización de 8 bits y ~0,5 GB en 4 bits (estimaciones teóricas según el número de parámetros).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para mayor throughput.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna de consumo e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: Transformers, vLLM, SGLang y KTransformers según la model card del modelo base; llama.cpp y Ollama no están confirmados para esta arquitectura híbrida.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | Licencia | Multimodal |
|---|---|---|---|---|---|
| Qwen3.5-0.8B (base de esta ficha) | 0,8B | 262.144 | 29,7 | Apache 2.0 | Sí |
| Qwen3.5-2B | ~2B | no disponible | 55,3 | Apache 2.0 (presumible) | Sí |
| Qwen3-1.7B | ~1,7B | no disponible | 40,2 | Apache 2.0 | No |
| Qwen3-4B-2507 | ~4B | no disponible | 69,6 | Apache 2.0 | No |

El modelo de 0,8B sacrifica rendimiento en benchmarks frente a variantes mayores a cambio de un coste de inferencia mínimo y una ventana de contexto excepcionalmente grande para su tamaño.

## Limitaciones y advertencias

- Rendimiento en benchmarks notablemente inferior a modelos de 1,7B–4B: MMLU-Pro de 29,7 frente a 40,2 del Qwen3-1.7B, lo que limita su uso en tareas de razonamiento complejo.
- Riesgo elevado de alucinación inherente a modelos de muy pequeño tamaño; requiere verificación en producción.
- La model card del ajuste fino no documenta el dataset, el formato de prompting ni las métricas de evaluación, lo que dificulta reproducir o validar el comportamiento SFT.
- El ajuste SFT puede haber degradado capacidades generales del modelo base (olvido catastrófico) al especializarse en RAG.
- Compatibilidad con herramientas de cuantización (llama.cpp, GGUF) no confirmada para la arquitectura Gated DeltaNet híbrida.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar los términos del modelo base Qwen3.5-0.8B-Base y las condiciones de uso de Qwen.
- El modelo está pensado por el autor original para prototipado e investigación, no para despliegues de producción críticos.
- Idiomas: aunque el modelo base declara 201 idiomas, no hay evaluación específica del SFT en castellano ni en otros idiomas distintos del inglés/chino.

## Enlaces

- Hugging Face (esta ficha): https://huggingface.co/satoyutaka/qwen35-08b-rag-sft-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
