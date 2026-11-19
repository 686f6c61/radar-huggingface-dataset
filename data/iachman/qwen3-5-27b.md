# IACHMAN/Qwen3.5-27B

## Resumen

Qwen3.5-27B es un modelo fundacional multimodal de tipo *image-text-to-text* desarrollado por el equipo Qwen (Alibaba). Este repositorio concreto, alojado por el usuario IACHMAN, redistribuye los pesos del modelo post-entrenado en formato Hugging Face Transformers bajo licencia Apache 2.0. El modelo integra un codificador de visión junto a un modelo de lenguaje causal, lo que le permite procesar entradas mixtas de imagen y texto y generar respuestas conversacionales.

La arquitectura combina atención lineal mediante Gated Delta Networks con capas de atención completa (Gated Attention) en un esquema híbrido, junto con una red feed-forward de tipo Mixture-of-Experts dispersa. Con 27.781.427.952 parámetros totales (unos 27,8 mil millones), 64 capas y una dimensión oculta de 5120, el modelo está diseñado para ofrecer inferencia de alto rendimiento con latencia contenida. Su ventana de contexto nativa es de 262.144 tokens, extensible hasta 1.010.000 tokens.

El modelo resulta relevante por su enfoque de fusión temprana multimodal, su cobertura lingüística de 201 idiomas y dialectos, y un entrenamiento con RL escalado en entornos multiagente. Está pensado para desarrolladores que necesitan un modelo abierto, con licencia permisiva, capaz de abordar razonamiento, código, agentes y comprensión visual en una sola pieza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrido Gated DeltaNet + Gated Attention, FFN con Mixture-of-Experts |
| Parametros totales | 27.781.427.952 (~27,8 mil millones) |
| Parametros activos | no disponible (la model card no desglosa parámetros activos del MoE para esta variante) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible (no especificados en la información; compatibilidad declarada con vLLM, SGLang, KTransformers) |
| Idiomas soportados | 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 55,6 GB); compatible con Transformers, vLLM, SGLang, KTransformers |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida de 64 capas con un patrón repetido de 16 bloques, cada uno compuesto por tres subcapas de Gated DeltaNet seguidas de una subcapa de Gated Attention, todas con su correspondiente FFN. Las capas de Gated DeltaNet usan 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. Las capas de Gated Attention usan 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de dimensión 64. La FFN tiene dimensión intermedia de 17408 y el vocabulario (embeddings y salida LM) es de 248.320 tokens con padding.

El entrenamiento se realizó en dos fases (pre-entrenamiento y post-entrenamiento) con fusión temprana sobre tokens multimodales, lo que según la model card logra paridad con Qwen3 y supera a los modelos Qwen3-VL en razonamiento, código, agentes y comprensión visual. Se aplicó RL escalado en entornos de millones de agentes con distribuciones de tareas progresivamente complejas, y el modelo incorpora MTP (multi-token prediction) entrenado con múltiples pasos, lo que habilita decodificación especulativa. La infraestructura de entrenamiento declara una eficiencia multimodal cercana al 100 % respecto al entrenamiento solo de texto.

## Capacidades

- Generación de texto conversacional multi-turno con contexto muy largo (hasta 262.144 tokens nativos).
- Razonamiento, conocimiento general y matemáticas (evaluado en MMLU-Pro, MMLU-Redux).
- Comprensión visual: procesamiento conjunto de imagen y texto (pipeline image-text-to-text).
- Generación y razonamiento sobre código, con soporte declarado para tareas de agentes.
- Capacidades de agente y razonamiento multi-paso, reforzadas mediante RL en entornos multiagente.
- Soporte multilingüe amplio: 201 idiomas y dialectos con matices culturales y regionales.
- Compatibilidad con tool calling / function calling: no confirmada explícitamente en la información disponible.
- Modo *thinking* explícito: no confirmado en la información disponible.
- Decodificación especulativa vía MTP (multi-token prediction).

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con historiales extensos gracias a sus 262.144 tokens de contexto nativo, manteniendo coherencia en interacciones largas y con soporte para 201 idiomas.
- Asistentes documentales con imágenes: al ser un modelo image-text-to-text, puede responder preguntas sobre capturas, diagramas o documentos escaneados combinando el codificador de visión con el razonamiento del LM.
- Generación de código en pipelines: su rendimiento en benchmarks de código y su compatibilidad con vLLM y SGLang permiten integrarlo en flujos de revisión y autocompletado; la confirmación de tool calling debe validarse empíricamente antes de producción.
- Agentes autónomos multi-paso: el entrenamiento con RL en entornos multiagente lo hace adecuado para orquestación de tareas con planificación y uso de herramientas, siempre que se implemente el protocolo de tools a nivel de aplicación.
- Análisis de documentación técnica multilingüe: con cobertura de 201 idiomas puede resumir, traducir y extraer información de manuales y contratos en distintos idiomas y dialectos.
- Procesamiento de imágenes en entornos de accesibilidad: descripción de imágenes, extracción de texto de capturas y generación de alt-text en aplicaciones que requieren comprensión visual combinada con lenguaje natural.
- Despliegue on-premise con licencia permisiva: al ser Apache 2.0, encaja en organizaciones que necesitan modificar y redistribuir el modelo sin restricciones de uso comercial, sirviéndolo con vLLM o SGLang.

## Benchmarks y rendimiento

Datos de la model card (categoría de conocimiento):

| Benchmark | GPT-5-mini 2025-08-07 | GPT-OSS-120B | Qwen3-235B-A22B | Qwen3.5-122B-A10B | Qwen3.5-27B | Qwen3.5-35B-A3B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 83,7 | 80,8 | 84,4 | 86,7 | 86,1 | 85,3 |
| MMLU-Redux | 93,7 | 91,0 | 93,8 | 94,0 | 93,2 | no disponible |

No se han publicado en la información disponible resultados completos de benchmarks de código (HumanEval), matemáticas (GSM8K) ni visión para esta variante concreta; la model card solo incluye la tabla parcial de conocimiento mostrada arriba.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (27,8 mil millones de parámetros), en FP16/BF16 los pesos ocupan aproximadamente 55,6 GB (coincide con el tamaño del repo); en cuantización de 8 bits rondaría 28 GB y en 4 bits unos 14-16 GB, aunque estos valores no están confirmados en la información proporcionada.
- GPU recomendadas: no especificadas en la información. Por tamaño, un despliegue en precisión completa requiere GPUs de 80 GB (A100/H100) o múltiples GPUs; las consumer de 24 GB (RTX 4090) solo serían viables con cuantización agresiva.
- ¿Cabe en consumer GPU?: no confirmado; previsiblemente solo con cuantización de 4-8 bits en GPUs de 24 GB o superiores.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y KTransformers (declarados compatibles). llama.cpp, Ollama y TGI no se mencionan en la información.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-27B | ~27,8 B | 262.144 (ext. 1.010.000) | 86,1 | Apache 2.0 | Hugging Face (este repo) |
| Qwen3.5-35B-A3B | no disponible (MoE) | no disponible | 85,3 | no disponible | Hugging Face |
| Qwen3.5-122B-A10B | no disponible (MoE) | no disponible | 86,7 | no disponible | Hugging Face |
| Qwen3-235B-A22B | 235 B (22 B activos) | no disponible | 84,4 | no disponible | Hugging Face |
| GPT-OSS-120B | 120 B | no disponible | 80,8 | no disponible | no disponible |

La comparativa se limita a los datos de la tabla de la model card; no se dispone de información sobre contexto, licencia ni disponibilidad de las alternativas más allá de lo indicado.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; un modelo entrenado con datos web multilingües es susceptible de sesgos culturales y regionales pese a la cobertura de 201 idiomas.
- Riesgo de alucinación: no cuantificado en la información; como todo LM generativo, puede producir contenido plausible pero incorrecto, especialmente en tareas de conocimiento factual.
- Limitaciones de contexto o idioma: aunque el contexto nativo es de 262.144 tokens, el rendimiento en ventanas extremas (hasta 1.010.000) no está validado en los benchmarks proporcionados.
- Restricciones de licencia: Apache 2.0 permite uso comercial y redistribución; el enlace de licencia apunta al repositorio oficial de Qwen, por lo que conviene verificar la versión exacta del texto legal.
- Caveats para producción: la compatibilidad con tool calling no está confirmada explícitamente; el repo tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-19), por lo que su procedencia y verificación de integridad de pesos deben comprobarse frente al repositorio oficial de Qwen antes de usarlo en entornos críticos.
- El tamaño del repo (55,6 GB) implica requisitos de almacenamiento y transferencia considerables.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/IACHMAN/Qwen3.5-27B
- Licencia referenciada: https://huggingface.co/Qwen/Qwen3.5-27B/blob/main/LICENSE
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Repositorio oficial de referencia (según enlace de licencia): https://huggingface.co/Qwen/Qwen3.5-27B
