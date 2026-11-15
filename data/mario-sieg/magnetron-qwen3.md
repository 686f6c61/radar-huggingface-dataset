# mario-sieg/magnetron-qwen3

## Resumen

Magnetron-qwen3 es un snapshot de inferencia del modelo Qwen/Qwen3-4B-Instruct-2507, convertido por el usuario mario-sieg al formato propietario del runtime Magnetron. No se trata de un modelo entrenado desde cero ni de un fine-tuning: es una conversión de pesos del modelo original de Qwen a un contenedor `.mag` que empaqueta los tensores en bf16 junto con el tokenizer embebido en los metadatos. El interés del repositorio es, por tanto, la compatibilidad con el runtime Magnetron, no una mejora en capacidades respecto al modelo base.

El modelo subyacente es Qwen3-4B-Instruct-2507, un transformer denso de aproximadamente 4.000 millones de parámetros con 36 capas, hidden size de 2560 y atención con 32 cabezas de consulta y 8 de clave/valor (GQA). Incorpora normalización QK (q_norm y k_norm por cabeza) y una ventana de contexto configurada en 8192 tokens según la configuración incluida en el snapshot. El vocabulario es de 151.936 tokens y las embeddings están atadas (tie_word_embeddings).

La relevancia de esta ficha es limitada pero concreta: sirve a quienes ya utilizan el runtime Magnetron y necesitan un snapshot listo para inferencia sin pasar por el proceso de conversión, y documenta con precisión la estructura de tensores y el tamaño real del payload (7,49 GiB en bf16). El repositorio no incluye información sobre idiomas, benchmarks ni detalles de entrenamiento más allá de los heredados del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), atención GQA con q_norm/k_norm |
| Parametros totales | ~4.000 millones (modelo base Qwen3-4B-Instruct-2507) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens (max_position_embeddings) |
| Tipos de cuantizacion | bf16 (único formato incluido en el snapshot) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.mag` (contenedor Magnetron, tensores bf16) |

## Arquitectura y entrenamiento

El snapshot reproduce la arquitectura del modelo base Qwen3-4B-Instruct-2507: un transformer decoder-only denso con 36 capas, hidden size 2560, intermediate size 9728 en el MLP (SwiGLU con gate_proj, up_proj y down_proj), 32 cabezas de atención con dimensión 128 y 8 cabezas KV (GQA), más q_norm y k_norm de 128 dimensiones por cabeza. La normalización es RMSNorm con epsilon 1e-06, rope_theta de 5.000.000 y sin sliding window. El vocabulario de 151.936 tokens y las embeddings atadas son coherentes con la familia Qwen3.

No se proporciona información sobre el entrenamiento del modelo base en la documentación del snapshot: ni número de tokens, ni composición del dataset, ni si hubo RLHF/DPO o destilación. Tampoco se documenta ninguna innovación técnica adicional del runtime Magnetron más allá del formato de empaquetado: 398 tensores, payload de 7,49 GiB, padding de alineación de 486 KiB (0,006%), metadatos de 12,54 MiB (incluyendo 10,89 MiB de tokenizer) y un tamaño de fichero final de 7,51 GiB. La conversión se realizó en 3,0 segundos a 2,53 GiB/s.

## Capacidades

- Generación de texto conversacional y de instrucciones, heredada del modelo base Qwen3-4B-Instruct-2507.
- Razonamiento y matemáticas de nivel medio, propio de un modelo de 4B parámetros.
- Generación de código, aunque sin datos verificables en este repositorio.
- Soporte de tool calling / function calling: no documentado en el snapshot; depende de la plantilla de chat del modelo base, que no se incluye explícitamente más allá del tokenizer embebido.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no disponibles (el campo de idiomas no está informado).
- Modo thinking, visión o audio: no disponibles en este snapshot.

## Casos de uso

- Inferencia con el runtime Magnetron: cargar directamente `qwen3-4b-instruct-2507-bf16.mag` en Magnetron sin necesidad de convertir los pesos desde safetensors, aprovechando el tokenizer embebido en los metadatos.
- Despliegue de un asistente conversacional ligero en una sola GPU consumer: con 7,49 GiB de payload en bf16, el modelo cabe en GPUs de 16 GB o más y permite servir chat multi-turno con contexto de hasta 8192 tokens.
- Prototipado de pipelines de generación de texto en entornos donde Magnetron ya es el runtime estándar, evitando dependencias de transformers o vLLM.
- Evaluación comparativa del rendimiento del runtime Magnetron frente a otras implementaciones usando un modelo de referencia conocido (Qwen3-4B-Instruct-2507) como carga de trabajo.
- Generación de código asistida en editor o CI, siempre que se valide previamente la calidad del modelo base en la tarea concreta, ya que el snapshot no aporta benchmarks propios.
- Fine-tuning posterior: no es un caso de uso directo de este repositorio, pero el snapshot puede servir como referencia de pesos para verificar conversiones; para entrenamiento conviene partir del modelo base en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~7,5 GiB solo para pesos en bf16; con caché KV para 8192 tokens y overhead del runtime, prever al menos 10-12 GiB.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue multiusuario; RTX 4090 (24 GB) o RTX 4080 (16 GB) para uso individual.
- Cabe en GPU consumer: sí, en tarjetas con 16 GB o más en bf16; en 12 GB requeriría cuantización adicional, que este snapshot no incluye.
- Opciones de despliegue: exclusivamente el runtime Magnetron (librería `magnetron`); no se proporcionan pesos en GGUF, safetensors ni formatos compatibles con llama.cpp, Ollama, vLLM o TGI.
- Latencia y throughput: no disponibles; el único dato de rendimiento es la velocidad de conversión (2,53 GiB/s), no de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| magnetron-qwen3 (este) | ~4B | 8192 | `.mag` (bf16) | Apache 2.0 | Solo runtime Magnetron |
| Qwen/Qwen3-4B-Instruct-2507 | ~4B | 8192 (según config del snapshot) | safetensors | Apache 2.0 | Hugging Face, ecosistema amplio |
| Llama 3.2 3B Instruct | ~3B | 128K | safetensors, GGUF | Llama 3.2 Community License | Hugging Face, vLLM, llama.cpp, Ollama |
| Gemma 2 2B Instruct | ~2B | 8K | safetensors, GGUF | Gemma Terms of Use | Hugging Face, vLLM, llama.cpp |

La comparativa de rendimiento no está disponible: el snapshot no publica benchmarks y no se han incluido resultados del modelo base en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo ni afinado: cualquier limitación del modelo base Qwen3-4B-Instruct-2507 (alucinaciones, sesgos, capacidad de razonamiento limitada por el tamaño) se hereda íntegramente.
- Dependencia total del runtime Magnetron: los pesos en formato `.mag` no son utilizables con transformers, vLLM, llama.cpp, Ollama ni TGI, lo que limita la portabilidad y la integración en pipelines existentes.
- Solo se distribuye en bf16: no hay versiones cuantizadas (GGUF, AWQ, GPTQ) en este repositorio, lo que excluye GPUs con menos de 16 GB.
- Contexto limitado a 8192 tokens según la configuración incluida, a pesar de que variantes posteriores de Qwen3 soportan ventanas mayores.
- Idiomas soportados no documentados: no se puede asumir un rendimiento multilingüe sin validación previa.
- Sin información sobre tool calling, plantilla de chat o modo thinking: la integración en agentes requiere verificar el comportamiento real del tokenizer y del modelo base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar también los términos del modelo base Qwen3-4B-Instruct-2507 y del runtime Magnetron, que pueden imponer condiciones adicionales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mario-sieg/magnetron-qwen3
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Documentación del runtime Magnetron: no disponible
- Paper o blog del snapshot: no disponible
- Repositorio de código del runtime: no disponible
