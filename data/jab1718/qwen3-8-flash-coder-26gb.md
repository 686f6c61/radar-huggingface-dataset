# Jab1718/qwen3.8-flash-coder-26gb

## Resumen

Qwen3.8-Flash-Coder-26GB es un modelo de lenguaje de tipo Mixture of Experts (MoE) derivado del modelo Qwen/Qwen3.8-Flash-Next de Alibaba, mediante un proceso de poda de subred y destilación con LoRA. El autor, Jab1718, ha reducido el número de expertos enrutados por capa de 512 a 128 (una reducción del 75%), manteniendo las 48 capas del modelo original y los 8 expertos activos por token. El resultado es un checkpoint de aproximadamente 26 GB (aunque el repositorio en HuggingFace ocupa 70.2 GB, probablemente por incluir pesos en precisión completa o archivos adicionales) que cabe en una GPU de 32 GB sin descarga a CPU.

El modelo está diseñado específicamente para tareas de generación de código y razonamiento lógico, con un rendimiento declarado del 100% en una suite de pruebas de algoritmos estándar. Se distribuye bajo licencia Apache 2.0 y soporta los idiomas inglés, vietnamita y chino. Su relevancia radica en ofrecer una alternativa de bajo coste de VRAM a modelos MoE de gran tamaño, manteniendo una calidad competitiva en tareas de programación, lo que lo hace atractivo para despliegues en hardware de gama media.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con 128 expertos por capa, 8 activos por token, 48 capas |
| Parametros totales | 35.066.661.760 (35,07 B) |
| Parametros activos | No especificado (8 expertos activos por token, pero no se indica el total de parámetros activos) |
| Longitud de contexto | No especificada en la model card; el modelo base Qwen3.8-Flash-Next soporta hasta 1M de tokens, pero el despliegue recomendado usa 8192 |
| Tipos de cuantizacion | bfloat16, float16 (no se documentan cuantizaciones adicionales) |
| Idiomas soportados | en, vi, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un subconjunto podado de Qwen3.8-Flash-Next, que a su vez emplea una arquitectura híbrida de atención GDN (Gated Delta Network) y QSA (Query-Selective Attention), según el repositorio oficial de Qwen. El proceso de poda, denominado "Streaming Sharded Slicing", elimina el 75% de los expertos enrutados por capa, pasando de 512 a 128. Posteriormente se aplica una destilación mediante LoRA en las capas finales ("Tail-Layer LoRA Distillation") para recuperar la precisión perdida. No se especifican los datos de entrenamiento ni el número de tokens utilizados en la destilación, ni si se emplearon técnicas como RLHF o DPO. El autor declara una recuperación de precisión del 100% en la suite de pruebas de código y lógica.

## Capacidades

- Generación de texto y código en los idiomas en, vi y zh.
- Razonamiento lógico y resolución de problemas algorítmicos (búsqueda binaria, programación dinámica, parsing con pilas).
- Generación de código asíncrono en Rust (ejemplo con tokio mpsc channels).
- Conversación multi-turno mediante plantilla de chat estándar de Qwen.
- Compatible con transformers, vLLM y text-generation-inference.
- No se documenta soporte explícito para tool calling, function calling o agentes, aunque el modelo base podría tenerlo; no se confirma en esta variante.
- No se mencionan capacidades multimodales (visión, audio) en esta versión.

## Casos de uso

- Asistente de programación en entornos de desarrollo integrado: el modelo puede generar fragmentos de código, explicar algoritmos y depurar errores, con una latencia de primer token de ~532 ms y un throughput de 40-80 tokens/s, adecuado para interacción en tiempo real.
- Generación de código en pipelines de CI/CD: gracias a su compatibilidad con vLLM y su bajo footprint de VRAM, puede desplegarse como servicio de autocompletado o revisión de código en servidores con una única GPU de 32 GB.
- Chat multilingüe para soporte técnico: al soportar inglés, vietnamita y chino, puede atender consultas de usuarios en estos idiomas, aunque con una ventana de contexto limitada a 8192 tokens en el despliegue recomendado.
- Prototipado rápido de aplicaciones de razonamiento lógico: su alta precisión en tareas de algoritmos (100% en la suite declarada) lo hace útil para generar soluciones a problemas de programación competitiva o ejercicios de entrevista.
- Educación y tutoría de programación: puede explicar conceptos de estructuras de datos y algoritmos, generando ejemplos en Python o Rust, con un coste de hardware reducido para instituciones con presupuesto limitado.
- Investigación en eficiencia de modelos MoE: al ser un subconjunto podado y destilado, sirve como caso de estudio para técnicas de compresión de modelos, permitiendo reproducir y analizar el impacto de la poda de expertos en el rendimiento.

## Benchmarks y rendimiento

La model card proporciona los siguientes datos, sin comparación con otros modelos:

| Metrica | Valor |
|---|---|
| Time-to-First-Token (TTFT) | ~532 ms |
| Decode throughput | >40-80 tokens/s (con motor MoE fusionado) |
| Precisión en suite de código | 100% pass rate (búsqueda binaria, DP memoization, parsing con pilas en Python, canales asíncronos tokio en Rust) |

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~22,16 GB en bfloat16/float16, lo que permite inferencia sin offloading en una GPU de 32 GB.
- GPUs compatibles: NVIDIA RTX 5000 Ada (32 GB), A100 40 GB/80 GB, o RTX 4090 24 GB con cuantización adicional (aunque no se documentan los formatos de cuantización).
- No cabe en GPUs de consumo de 16 GB o menos sin cuantización agresiva o descarga a CPU.
- Opciones de despliegue: transformers (con trust_remote_code), vLLM (con PagedAttention y kernels Triton fusionados), text-generation-inference.
- Latencia y throughput: TTFT ~532 ms, decode >40-80 tokens/s en hardware adecuado.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría. La siguiente tabla compara cualitativamente con el modelo base y con un modelo MoE de referencia, basándose únicamente en la información proporcionada:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-Flash-Coder-26GB | 35,07 B (MoE, 128 expertos/capa) | No especificado (recomendado 8192) | Apache 2.0 | Subconjunto podado, enfocado a código |
| Qwen3.8-Flash-Next (base) | No especificado (335 GB checkpoint) | Hasta 1M | Apache 2.0 | Modelo original, requiere 8x H100 |
| Otros MoE de código (p.ej. DeepSeek-Coder-V2) | No disponible | No disponible | No disponible | Sin datos en la información proporcionada |

No se dispone de información suficiente para una comparativa cuantitativa rigurosa.

## Limitaciones y advertencias

- El modelo es un subconjunto podado por un tercero, no una versión oficial de Qwen; la calidad puede degradarse en tareas fuera de la suite de código declarada.
- La ventana de contexto efectiva no está documentada; el despliegue recomendado usa 8192 tokens, muy por debajo del millón de tokens del modelo base, lo que limita el procesamiento de documentos largos o codebases extensos.
- Solo soporta tres idiomas (en, vi, zh); no cubre otros idiomas como español, francés o alemán.
- No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K), por lo que su rendimiento general fuera de código es desconocido.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de razonamiento complejo o código poco común.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en producción.
- El repositorio en HuggingFace ocupa 70.2 GB, aunque la model card afirma un checkpoint de ~26 GB; esta discrepancia puede deberse a archivos adicionales o a pesos en precisión completa, lo que debe verificarse antes de la descarga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jab1718/qwen3.8-flash-coder-26gb
- Repositorio del modelo base Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Documentación de Qwen3.8-Flash en QwenCloud: https://www.qwencloud.com/models/qwen3.8-flash
- Documentación de Qwen3.8-Flash en B.AI: https://docs.b.ai/llmservice/models/qwen3-8-flash/
- Repositorio oficial de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Artículo de Reuters sobre el lanzamiento de Qwen3.8-Flash: https://www.reuters.com/business/retail-consumer/alibabas-qwen-launches-qwen38-flash-ai-model-with-lower-training-costs-2026-08-26/
