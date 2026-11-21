# Qwen/Qwen3.5-27B

## Resumen

Qwen3.5-27B es un modelo fundacional multimodal desarrollado por Qwen (Alibaba) que combina un codificador de visión con un modelo de lenguaje causal de 27.781 millones de parámetros. Se distribuye bajo licencia Apache 2.0 y está pensado para despliegues tanto en investigación como en producción comercial sin restricciones de uso. Su propuesta central es la fusión temprana de tokens multimodales durante el entrenamiento, lo que le permite alcanzar paridad con la generación Qwen3 en tareas de texto y superar a los modelos Qwen3-VL en razonamiento, código, agentes y comprensión visual.

La arquitectura es híbrida: combina capas de Gated DeltaNet (atención lineal) con capas de Gated Attention (atención clásica con RoPE), organizadas en un patrón de 16 bloques de cuatro capas cada uno, más un bloque de predicción multi-token (MTP) entrenado con múltiples pasos. Esta combinación busca alto rendimiento con latencia y coste de inferencia reducidos, algo relevante para servir el modelo a escala.

El modelo soporta de forma nativa 262.144 tokens de contexto, extensible hasta 1.010.000, y declara cobertura de 201 idiomas y dialectos. Se publicó en febrero de 2026 y se ha actualizado hasta noviembre de 2026; el repositorio acumula más de 1,6 millones de descargas y cerca de 1.100 likes, lo que lo sitúa entre los modelos abiertos multimodales más adoptados del ecosistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con codificador de visión; capas Gated DeltaNet (atención lineal) y Gated Attention, más MTP |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no disponible (no se declara como MoE en la información disponible) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantizacion | no disponible (compatible con vLLM, SGLang, KTransformers y Transformers) |
| Idiomas soportados | 201 idiomas y dialectos (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato Transformers) |

## Arquitectura y entrenamiento

El modelo sigue un diseño de lenguaje causal con codificador de visión. La dimensión oculta es 5120, con 64 capas y un vocabulario de 248.320 tokens (con padding). El layout oculto es 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)). Las capas Gated DeltaNet usan 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. Las capas Gated Attention usan 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y dimensión de RoPE de 64. La FFN tiene dimensión intermedia 17.408 y la salida LM es de 248.320. Incluye entrenamiento con MTP de múltiples pasos.

El entrenamiento combina pre-entrenamiento y post-entrenamiento, con fusión temprana sobre tokens multimodales (lo que la model card describe como "unified vision-language foundation"). El post-entrenamiento incluye RL a gran escala sobre entornos multi-agente con distribuciones de tareas progresivamente complejas. La model card menciona una eficiencia de entrenamiento multimodal cercana al 100 % respecto al entrenamiento solo de texto, y un framework de RL asíncrono para orquestación masiva de agentes y entornos. No se detalla en la información disponible el número exacto de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa entradas de imagen y texto combinadas (pipeline `image-text-to-text`).
- Razonamiento, código y matemáticas: la model card declara paridad con Qwen3 y mejora sobre Qwen3-VL en razonamiento, coding, agentes y comprensión visual.
- Comprensión visual: codificador de visión integrado con fusión temprana de tokens.
- Soporte multilingüe amplio: 201 idiomas y dialectos declarados.
- Capacidades de agente: entrenamiento RL sobre entornos multi-agente y tareas de complejidad creciente.
- Predicción multi-token (MTP): entrenado con múltiples pasos, útil para decodificación especulativa.
- Compatibilidad de despliegue: Transformers, vLLM, SGLang y KTransformers.
- Tool calling / function calling: no se detalla explícitamente en la información disponible.
- Modo thinking explícito: no se detalla en la información disponible.

## Casos de uso

- Asistencia multimodal en atención al cliente: el modelo puede procesar capturas de pantalla, documentos escaneados o fotos junto con texto en conversaciones multi-turno, aprovechando la ventana de 262.144 tokens para mantener historial largo sin truncar.
- Análisis de documentación técnica y extracción de datos: con contexto extensible hasta 1.010.000 tokens, permite ingerir manuales, informes o repositorios completos y responder preguntas sobre ellos en una sola pasada.
- Generación de código en pipelines de CI/CD: su rendimiento declarado en coding y su compatibilidad con vLLM/SGLang lo hacen apto para servir como backend de autocompletado, revisión de parches o generación de tests.
- Agentes autónomos multi-paso: el entrenamiento RL sobre entornos multi-agente y la inclusión de MTP lo orientan a tareas de planificación y ejecución de acciones encadenadas con herramientas externas.
- Procesamiento de imágenes en flujos empresariales: digitalización de facturas, clasificación de imágenes de producto o moderación de contenido visual combinada con reglas textuales.
- Despliegue multilingüe global: con 201 idiomas declarados, sirve para atención al cliente, traducción asistida o generación de contenido en mercados con requisitos lingüísticos diversos.
- Investigación en modelos híbridos: la combinación Gated DeltaNet + Gated Attention y el MTP lo convierten en una base útil para estudiar eficiencia de atención lineal y decodificación especulativa.

## Benchmarks y rendimiento

Resultados publicados en la model card (categoría de conocimiento; la tabla original está truncada en la información disponible):

| Benchmark | GPT-5-mini 2025-08-07 | GPT-OSS-120B | Qwen3-235B-A22B | Qwen3.5-122B-A10B | Qwen3.5-27B | Qwen3.5-35B-A3B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 83,7 | 80,8 | 84,4 | 86,7 | 86,1 | 85,3 |
| MMLU-Redux | 93,7 | 91,0 | 93,8 | 94,0 | no disponible (truncado) | no disponible (truncado) |

No se han publicado en la información disponible el resto de resultados de benchmarks (HumanEval, GSM8K, MMMU, etc.) más allá de los dos anteriores.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 55,6 GB solo para pesos (tamaño del repo), más overhead de KV cache; se recomienda al menos 80 GB para contexto largo.
- Cuantización a 8 bits: en torno a 28 GB de pesos, viable en una GPU de 40-48 GB con contexto moderado.
- Cuantización a 4 bits: en torno a 14-16 GB de pesos, potencialmente ejecutable en GPUs consumer de 24 GB (RTX 4090, RTX 3090) con contexto reducido.
- GPU recomendadas para producción: A100 80 GB, H100 80 GB, H200; para una sola GPU con BF16 se necesita al menos 80 GB.
- Consumer GPU: cabe en RTX 4090/3090 solo con cuantización agresiva y contexto limitado; no cabe en BF16.
- Opciones de despliegue: Transformers, vLLM, SGLang, KTransformers; también aparece como compatible con endpoints (SageMaker, Azure).
- Latencia y throughput: no disponibles en la información proporcionada; la arquitectura híbrida con Gated DeltaNet está orientada a reducir coste de inferencia, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-27B | 27,78 B | 262.144 (ext. 1.010.000) | 86,1 | Apache 2.0 | Hugging Face, Transformers, vLLM, SGLang |
| Qwen3.5-35B-A3B | no disponible (MoE, 3 B activos) | no disponible | 85,3 | no disponible en la información | Hugging Face |
| Qwen3.5-122B-A10B | no disponible (MoE, 10 B activos) | no disponible | 86,7 | no disponible en la información | Hugging Face |
| Qwen3-235B-A22B | 235 B (22 B activos) | no disponible | 84,4 | no disponible en la información | Hugging Face |
| GPT-OSS-120B | 120 B | no disponible | 80,8 | no disponible en la información | pesos abiertos |
| GPT-5-mini 2025-08-07 | no disponible | no disponible | 83,7 | propietaria | API |

## Limitaciones y advertencias

- Sesgos: no se documentan en la información disponible; al cubrir 201 idiomas y dialectos, es esperable variabilidad de calidad entre ellos.
- Alucinación: no se publican tasas de alucinación ni evaluaciones específicas de factualidad.
- Contexto: aunque se declara extensible a 1.010.000 tokens, el rendimiento efectivo más allá de los 262.144 nativos no está cuantificado en la información disponible.
- Idiomas: la cifra de 201 idiomas es una declaración del autor; no se aportan métricas por idioma.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero conviene revisar el archivo LICENSE del repositorio.
- Producción: el tamaño en BF16 (55,6 GB) obliga a GPUs de 80 GB o a cuantización; la información no incluye cifras de latencia ni throughput para dimensionar despliegues.
- Existe una versión posterior, Qwen3.6-27B, indicada en la model card como `new_version`; evaluar si conviene migrar.
- La tabla de benchmarks de la model card está truncada en la información disponible, por lo que la evaluación comparativa queda incompleta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Qwen/Qwen3.5-27B
- Licencia: https://huggingface.co/Qwen/Qwen3.5-27B/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Portal Qwen: https://qwen.ai/home
- Qwen Chat (página alternativa): https://qwen.ai/qwenchat
- Versión posterior: https://huggingface.co/Qwen/Qwen3.6-27B
