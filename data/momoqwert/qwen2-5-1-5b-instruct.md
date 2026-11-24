# momoqwert/Qwen2.5-1.5B-Instruct

## Resumen

Qwen2.5-1.5B-Instruct es la variante instruction-tuned de 1.500 millones de parámetros de la familia Qwen2.5, desarrollada por el equipo Qwen de Alibaba Cloud. El repositorio analizado (`momoqwert/Qwen2.5-1.5B-Instruct`) es una redistribución del modelo original `Qwen/Qwen2.5-1.5B-Instruct`, con el mismo contenido técnico y licencia Apache 2.0. El modelo resuelve tareas de generación de texto conversacional, razonamiento, código y matemáticas en un tamaño que cabe en hardware de consumo.

La arquitectura es un transformer causal con RoPE, SwiGLU, RMSNorm, atención con sesgo QKV y embeddings atados, con 28 capas y GQA (12 cabezas de consulta, 2 de clave/valor). Soporta una ventana de contexto completa de 32.768 tokens y generación de hasta 8.192 tokens, lo que lo sitúa por encima de muchos modelos de su tamaño en capacidad de contexto.

Su relevancia actual radica en la relación capacidad/tamaño: con 1.543.714.304 parámetros totales (1.310 millones sin embeddings) ofrece instrucciones afinadas, salida estructurada en JSON, soporte multilingüe declarado para más de 29 idiomas y una licencia permisiva que permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm, atención QKV con sesgo y embeddings atados |
| Parámetros totales | 1.543.714.304 (1,54 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens; generación de hasta 8.192 tokens |
| Tipos de cuantización | No especificados en la model card; compatibles con GGUF/AWQ/GPTQ vía herramientas externas (no confirmado por el autor) |
| Idiomas soportados | Más de 29 según la model card (chino, inglés, francés, español, portugués, alemán, italiano, ruso, japonés, coreano, vietnamita, tailandés, árabe, etc.); el campo `language` del repo solo declara `en` |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de 3,1 GB) |
| Capas | 28 |
| Cabezas de atención | 12 para Q, 2 para KV (GQA) |
| Parámetros sin embeddings | 1,31 B |
| Librería | Transformers (requiere >= 4.37.0) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only con 28 capas. Incorpora RoPE (rotary positional embeddings) para codificar posiciones, activación SwiGLU en las capas feed-forward, normalización RMSNorm y embeddings de entrada/salida atados, lo que reduce el número de parámetros efectivos. La atención usa Grouped Query Attention con 12 cabezas de consulta y 2 de clave/valor, una elección que reduce el coste de memoria del KV cache durante la inferencia. La atención incluye sesgo en las proyecciones Q, K y V.

El entrenamiento consta de dos fases: preentrenamiento y post-entrenamiento (instrucción). La model card indica que Qwen2.5 mejora sobre Qwen2 en conocimiento, código y matemáticas gracias a modelos expertos especializados en esos dominios, y que el ajuste de instrucciones refuerza el seguimiento de instrucciones, la generación de textos largos (más de 8K tokens), la comprensión de datos estructurados (tablas) y la producción de JSON. También se menciona una mayor robustez frente a la diversidad de system prompts, lo que mejora el role-play y el establecimiento de condiciones en chatbots. No se detalla en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat (`apply_chat_template`) y soporte de mensajes de sistema.
- Razonamiento, matemáticas y generación de código, con mejoras declaradas respecto a Qwen2 en estos dominios.
- Generación de textos largos de más de 8.000 tokens y salidas estructuradas, especialmente JSON.
- Comprensión de datos estructurados como tablas.
- Seguimiento de instrucciones robusto ante distintos system prompts y escenarios de role-play.
- Capacidades multilingües declaradas para más de 29 idiomas, incluido el español.
- Compatibilidad con Text Generation Inference (tag `text-generation-inference`) y endpoints compatibles.
- No se declaran capacidades de visión, audio ni tool calling explícito en la información disponible.

## Casos de uso

- Asistente conversacional ligero en producción: con 1,54 B de parámetros y contexto de 32.768 tokens puede gestionar conversaciones multi-turno con historial amplio en entornos con recursos limitados, usando la plantilla de chat nativa.
- Generación de JSON estructurado para APIs: el modelo está entrenado para producir salidas JSON fiables, lo que permite usarlo como extractor de entidades o generador de payloads en pipelines backend.
- Clasificación y etiquetado de textos: su seguimiento de instrucciones y contexto largo permiten procesar documentos extensos y devolver etiquetas o resúmenes estructurados.
- Procesamiento de tablas y datos estructurados: puede interpretar tablas incluidas en el prompt y responder preguntas sobre ellas, útil en herramientas de análisis de datos.
- Despliegue en edge o en GPU de consumo: al ocupar aproximadamente 3,1 GB en FP16, cabe en GPUs consumer de 8 GB o menos con cuantización, lo que habilita asistentes locales y aplicaciones de privacidad.
- Prototipado rápido y evaluación de pipelines: su licencia Apache 2.0 y tamaño reducido lo hacen adecuado para pruebas de integración con Transformers, TGI o vLLM antes de escalar a modelos mayores.
- Generación de textos largos: con hasta 8.192 tokens de salida puede redactar informes, documentación o resúmenes extensos en una sola pasada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al blog de Qwen2.5 y a la documentación de velocidad para obtener métricas detalladas, pero no incluye cifras concretas (MMLU, HumanEval, GSM8K u otras) en el repositorio analizado.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 3,1 GB solo para pesos; con overhead de activaciones y KV cache para contexto de 32K, el consumo real es mayor (del orden de 6-8 GB según longitud de contexto).
- VRAM estimada en cuantización de 8 bits: alrededor de 1,6 GB para pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 0,8-1 GB para pesos.
- GPU recomendadas: A100, H100 o L40S para despliegues de alta concurrencia; RTX 4090, RTX 3090, RTX 4080 para inferencia local sin cuantizar con contexto moderado.
- Cabe en GPU consumer: sí, en tarjetas de 8 GB o más en FP16 con contexto reducido, y en GPUs de 4-6 GB con cuantización de 4 bits.
- Opciones de despliegue: Transformers (>= 4.37.0), Text Generation Inference (TGI), vLLM, llama.cpp y Ollama (estos dos últimos requieren conversión a GGUF, no incluida en el repo).
- Latencia y throughput: no disponibles en la información proporcionada; la model card enlaza a la tabla de velocidad de Qwen para datos de referencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (este) | 1,54 B | 32.768 tokens | Apache 2.0 | Hugging Face, Transformers, TGI |
| Qwen2.5-0.5B-Instruct | 0,5 B | 32.768 tokens | Apache 2.0 | Hugging Face |
| Qwen2.5-3B-Instruct | 3 B | 32.768 tokens | Apache 2.0 (Qwen Research para algunos) | Hugging Face |
| Llama 3.2-1B-Instruct | 1,24 B | 128.000 tokens | Llama 3.2 Community License | Hugging Face |

La comparación de rendimiento entre estos modelos no está disponible en la información proporcionada. Los datos de parámetros y contexto de los modelos alternativos se incluyen a título orientativo de categoría y deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- El repositorio `momoqwert/Qwen2.5-1.5B-Instruct` es una redistribución no oficial del modelo de Qwen; no hay garantía de que los pesos coincidan exactamente con el original, aunque la model card y la licencia lo sugieren.
- El campo `language` del repo declara únicamente `en`, aunque la model card afirma soporte para más de 29 idiomas; conviene validar el rendimiento en español antes de usarlo en producción.
- Riesgo de alucinación inherente a los modelos de 1,5 B: la capacidad de conocimiento factual es limitada y puede inventar datos con seguridad aparente.
- Ventana de contexto efectiva menor que la nominal de 32K en tareas de recuperación de información en el centro del contexto.
- No se declaran capacidades de tool calling ni de agentes multi-paso; no debe asumirse su disponibilidad sin pruebas.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo redistribuido no incluye garantías del autor original.
- El tamaño reducido limita el razonamiento complejo y las tareas de código de alta dificultad frente a modelos de mayor escala.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/momoqwert/Qwen2.5-1.5B-Instruct
- Modelo original: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Benchmarks de velocidad: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Paper Qwen2: https://arxiv.org/abs/2407.10671
- Licencia: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct/blob/main/LICENSE
