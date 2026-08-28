# elastix-ai/Qwen2.5-0.5B-maskllm-2to4-calib2048-blade

## Resumen

El modelo `elastix-ai/Qwen2.5-0.5B-maskllm-2to4-calib2048-blade` es una versión comprimida del modelo base `Qwen/Qwen2.5-0.5B`, desarrollada por el equipo de elastix-ai. El objetivo es reducir el tamaño y acelerar la inferencia mediante poda semi-estructurada 2:4 (dos de cada cuatro pesos se eliminan) aplicada a todas las capas lineales del transformer, manteniendo los pesos en precisión FP16 sin cuantización adicional. La compresión se realizó con el método "blade" y se calibró con 2048 muestras del dataset SlimPajama-6B con una longitud de secuencia de 2048 tokens.

Este modelo es relevante para entornos con recursos limitados, ya que conserva la arquitectura original de Qwen2.5-0.5B (un transformer decoder-only de 0.5 mil millones de parámetros) pero con una huella de memoria reducida y un mayor throughput teórico gracias a la poda 2:4, que es compatible con aceleradores que soportan sparse kernels (por ejemplo, GPUs Ampere o posteriores). No se ha publicado información sobre la licencia ni los idiomas soportados, y el repositorio no incluye resultados de benchmarks de tareas, solo métricas de divergencia KL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con poda semi-estructurada 2:4 |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, sin especificar) |
| Tipos de cuantizacion | FP16 (sin cuantización, solo poda 2:4) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura estándar de Qwen2.5-0.5B, un transformer decoder-only con atención por capas, normalización RMSNorm y activación SwiGLU en el MLP. La compresión se aplica mediante poda 2:4, que elimina el 50% de los pesos en las matrices lineales de atención y MLP, manteniendo intactas las capas de embedding, lm_head y el conv1d de atención lineal (si existe). El proceso de poda se realizó con el método "blade" y se calibró con 2048 muestras del dataset SlimPajama-6B (split de validación) con una longitud de secuencia de 2048 tokens. No se aplicó fine-tuning posterior (BEAM fine-tuning: False) ni se convirtieron expertos a lineales. La configuración de cuantización GFP de 16 bits está definida pero no activada (`quantize: false`), por lo que los pesos se almacenan en FP16 estándar.

## Capacidades

- Generación de texto autoregresiva: al ser un modelo base (no instruct), puede completar texto, continuar secuencias y realizar tareas de modelado de lenguaje.
- Razonamiento básico y comprensión del lenguaje: conserva las capacidades del modelo original, aunque la poda puede degradar ligeramente el rendimiento en tareas complejas.
- No soporta tool calling ni function calling: al ser un modelo base sin fine-tuning instructivo, no está entrenado para usar herramientas.
- No soporta agentes ni multi-step reasoning: no hay indicios de capacidades de razonamiento avanzado más allá de lo que ofrece el modelo base.
- Multilingüismo: no se ha especificado, pero el modelo base Qwen2.5-0.5B fue entrenado con datos multilingües; sin embargo, no hay confirmación para esta versión comprimida.
- Sin capacidades especiales (visión, audio, thinking mode): es un modelo de texto puro.

## Casos de uso

- Inferencia en dispositivos edge: gracias a su tamaño reducido (0.5B) y la poda 2:4, puede ejecutarse en hardware con poca memoria, como Raspberry Pi o teléfonos móviles, para tareas de autocompletado o generación de texto simple.
- Prototipado rápido de aplicaciones NLP: los desarrolladores pueden usar este modelo para validar ideas de generación de texto o clasificación sin necesidad de GPUs potentes, antes de escalar a modelos mayores.
- Filtrado y preprocesamiento de texto: puede emplearse para tareas de normalización, resumen corto o extracción de entidades en pipelines de datos, donde la velocidad es más crítica que la precisión máxima.
- Educación e investigación en compresión de modelos: sirve como ejemplo práctico de poda 2:4 y calibración, permitiendo estudiar el impacto de la compresión en la calidad del modelo.
- Generación de código en entornos con restricciones de memoria: aunque no está especializado en código, puede completar fragmentos simples si se le proporciona contexto adecuado, útil en IDEs ligeros.
- Asistentes de escritura en tiempo real: para sugerencias de palabras o frases en aplicaciones de teclado o procesadores de texto, donde la latencia debe ser mínima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (como MMLU, HumanEval o GSM8K) en la información disponible. La model card solo incluye métricas de divergencia KL entre el modelo comprimido y el original:

| Dataset | Avg KL | Total KL | Tokens |
|---|---|---|---|
| wikitext2 | 0.421998 | 2318.4573 | 5,494 |
| c4 | 0.393731 | 14509.7747 | 36,852 |

Estos valores indican una divergencia moderada, pero no permiten comparar directamente con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en FP16 (494M parámetros × 2 bytes), aunque la poda 2:4 puede reducir el uso efectivo de memoria si se aprovechan kernels sparse.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 2060 o superiores. También puede ejecutarse en CPU con suficiente RAM (≈2 GB).
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama baja y media.
- Opciones de despliegue: compatible con frameworks que soporten safetensors y poda 2:4, como vLLM (con soporte sparse), llama.cpp (aunque la poda 2:4 no se aprovecha en CPU), o Hugging Face Transformers con kernels personalizados.
- Latencia y throughput: no se han publicado datos específicos; se espera una mejora teórica de hasta 2× en throughput frente al modelo sin podar en hardware con soporte sparse.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-0.5B (original) | 494M | 32K (según technical report) | Apache 2.0 | safetensors | Modelo base sin comprimir |
| Qwen2.5-0.5B-maskllm-2to4-calib2048-blade | 494M (poda 2:4) | no disponible | no disponible | safetensors | Versión comprimida con poda |
| TinyLlama-1.1B | 1.1B | 2K | Apache 2.0 | safetensors | Modelo pequeño sin poda |

La comparación directa no es posible por falta de benchmarks. La principal diferencia con el original es la poda, que reduce el número de operaciones efectivas pero mantiene el mismo número de parámetros almacenados.

## Limitaciones y advertencias

- La poda 2:4 puede degradar la calidad de las respuestas, especialmente en tareas que requieren razonamiento complejo o conocimiento factual detallado.
- No se ha especificado la licencia, por lo que su uso comercial es incierto; se recomienda contactar con el autor antes de utilizarlo en producción.
- No hay información sobre sesgos o alucinaciones; al ser un modelo base, puede generar contenido no deseado si no se filtra adecuadamente.
- La longitud de contexto no está documentada; se asume la del modelo base (32K), pero no hay garantía.
- El modelo no está fine-tuning para instrucciones, por lo que no responde a prompts conversacionales de forma natural.
- La divergencia KL en wikitext2 y c4 sugiere que la distribución de salida difiere del original, lo que puede afectar a aplicaciones que dependen de la perplejidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/elastix-ai/Qwen2.5-0.5B-maskllm-2to4-calib2048-blade
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Technical report de Qwen2.5: https://arxiv.org/abs/2412.15115
