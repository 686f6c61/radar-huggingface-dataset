# dnhkng/RYS-Qwen3.5-27B-FP8-S

## Resumen

RYS-Qwen3.5-27B-FP8-S es una cuantización en FP8 del modelo Qwen3.5-27B, publicada por el usuario dnhkng bajo licencia Apache 2.0. Se trata de un modelo causal con codificador de visión (image-text-to-text) que hereda las capacidades del Qwen3.5 original de Alibaba, incluyendo comprensión multimodal, razonamiento, generación de código y soporte de agentes. La cuantización emplea FP8 de grano fino con bloques de 128, un esquema que, según la model card, mantiene métricas de rendimiento prácticamente idénticas a las del modelo original.

El modelo base Qwen3.5-27B emplea una arquitectura híbrida que combina Gated Delta Networks (atención lineal) con atención con compuertas, organizada en 64 capas con un patrón de 16 bloques de la forma 3×(Gated DeltaNet → FFN) → 1×(Gated Attention → FFN). Cuenta con 27.000 millones de parámetros, dimensión oculta de 5120, vocabulario de 248.320 tokens y una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.010.000 tokens.

Su relevancia actual radica en que ofrece un modelo multimodal de tamaño medio con contexto muy largo en un formato cuantizado a 8 bits, lo que reduce los requisitos de memoria frente a los pesos en BF16 y facilita el despliegue en infraestructura de inferencia estándar (Transformers, vLLM, SGLang o KTransformers). El repositorio tiene un tamaño de 31,3 GB y registra 21 descargas y 7 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con codificador de visión; híbrida Gated DeltaNet + Gated Attention, con FFN por capa |
| Parametros totales | 28.164.701.136 (según safetensors); 27B según model card |
| Parametros activos | no disponible (la model card no indica configuración MoE para esta variante) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | FP8 de grano fino con tamaño de bloque 128 |
| Idiomas soportados | 201 idiomas y dialectos (según model card del modelo base); no se detalla lista |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers); compatible con vLLM, SGLang y KTransformers |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-27B es un transformer causal con codificador de visión, entrenado en dos etapas (preentrenamiento y postentrenamiento). La columna vertebral del lenguaje combina dos tipos de capas en un patrón repetido 16 veces: por un lado, Gated DeltaNet con 48 cabezas de atención lineal para V y 16 para QK, dimensión de cabeza 128; por otro, Gated Attention con 24 cabezas para Q y 4 para KV, dimensión de cabeza 256 y dimensión de Rotary Position Embedding de 64. La FFN tiene dimensión intermedia de 17408 y el modelo incluye entrenamiento con multi-token prediction (MTP) en varios pasos.

Según la model card, el entrenamiento emplea fusión temprana sobre tokens multimodales, lo que logra paridad con Qwen3 en razonamiento, código, agentes y comprensión visual, superando a los modelos Qwen3-VL. También se menciona escalado de reinforcement learning sobre entornos de millones de agentes con distribuciones de tareas progresivamente complejas, así como una infraestructura de entrenamiento asíncrona para RL a gran escala. No se especifica el número exacto de tokens de entrenamiento ni la composición del dataset.

La cuantización de esta variante concreta aplica FP8 de grano fino con bloques de 128 sobre los pesos del modelo postentrenado, en formato Transformers.

## Capacidades

- Generación de texto y razonamiento de propósito general, con paridad declarada frente a Qwen3 en benchmarks de conocimiento.
- Comprensión de imágenes y texto (pipeline image-text-to-text) mediante codificador de visión integrado.
- Generación y comprensión de código, con soporte declarado para tareas de coding y agentes.
- Razonamiento matemático y resolución de problemas multi-paso.
- Capacidades de agente y razonamiento multi-step, con entrenamiento RL orientado a entornos de agentes.
- Cobertura multilingüe ampliada a 201 idiomas y dialectos según la model card del modelo base.
- Entrenamiento con multi-token prediction (MTP), que puede aprovecharse para decodificación especulativa en motores compatibles.
- Compatibilidad con tool calling / function calling: no se detalla explícitamente en la información disponible, aunque el modelo base está orientado a casos de uso de agentes.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con documentos e imágenes adjuntas gracias a sus 262.144 tokens de contexto nativo, manteniendo el hilo de la conversación sin truncar historiales largos.
- Análisis de documentos extensos con imágenes: informes financieros, contratos o manuales técnicos con figuras y tablas pueden procesarse en una sola pasada al combinar contexto largo y entrada multimodal.
- Generación de código en producción: su soporte declarado de coding y agentes permite integrarlo en pipelines de revisión de código, generación de tests o asistentes de IDE, desplegado con vLLM o SGLang para servir peticiones concurrentes.
- Automatización de flujos con agentes: el entrenamiento RL sobre entornos de agentes lo hace adecuado para orquestar tareas multi-paso con llamadas a herramientas, siempre que el framework de serving soporte el formato de tool calling del modelo base.
- Procesamiento de imágenes en aplicaciones de accesibilidad: descripción de imágenes, extracción de texto de capturas o lectura de documentos escaneados mediante el codificador de visión.
- Despliegue multilingüe: aplicaciones de traducción, resumen o asistencia en cualquiera de los 201 idiomas declarados, con especial utilidad en mercados con diversidad lingüística.
- Investigación en eficiencia de inferencia: al ser una cuantización FP8 con bloques de 128, sirve como referencia para estudiar la degradación de calidad frente al modelo en BF16 en tareas de razonamiento y visión.

## Benchmarks y rendimiento

La model card del modelo base incluye resultados de benchmarks de lenguaje. Se reproducen a continuación los datos disponibles para Qwen3.5-27B junto a los modelos de comparación citados en la propia model card. No se han publicado resultados específicos de esta cuantización FP8 en la información disponible; el autor afirma que las métricas son "prácticamente idénticas" a las del original, sin cuantificar la diferencia.

| Benchmark | Qwen3.5-27B | Qwen3.5-35B-A3B | Qwen3.5-122B-A10B | Qwen3-235B-A22B | GPT-OSS-120B | GPT-5-mini 2025-08-07 |
|---|---|---|---|---|---|---|
| MMLU-Pro | 86,1 | 85,3 | 86,7 | 84,4 | 80,8 | 83,7 |
| MMLU-Redux | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto | 91,0 | 93,7 |

El extracto de la model card se interrumpe tras MMLU-Redux, por lo que no se dispone del resto de filas (razonamiento, código, matemáticas, visión) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP8 ocupan aproximadamente 28 GB (28.164 millones de parámetros a 1 byte por parámetro), más overhead de activaciones y caché KV. El repositorio completo ocupa 31,3 GB.
- Para contexto largo (262.144 tokens) la caché KV crece de forma significativa; con 64 capas y atención con 4 cabezas KV de dimensión 256, se recomienda planificar memoria adicional o usar motores con gestión eficiente de KV (vLLM con PagedAttention, SGLang).
- GPU recomendadas: H100 80 GB o A100 80 GB para servir con contexto completo; configuraciones multi-GPU para contextos cercanos a 1M de tokens. Una RTX 4090 de 24 GB no puede alojar los pesos FP8 completos en una sola GPU.
- Cabe en GPU de consumo solo mediante cuantizaciones adicionales (por ejemplo, GGUF de 4-6 bits) no incluidas en este repositorio; el formato FP8 requiere GPUs con soporte nativo de FP8 (Hopper, Ada Lovelace o posteriores) para aprovechar el rendimiento.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y KTransformers, según la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | Licencia | Formato |
|---|---|---|---|---|---|
| RYS-Qwen3.5-27B-FP8-S | 28,2B (FP8) | 262.144 (ext. 1.010.000) | 86,1 (heredado del base) | Apache 2.0 | safetensors FP8 |
| Qwen3.5-27B (base) | 27B | 262.144 (ext. 1.010.000) | 86,1 | Apache 2.0 | safetensors BF16 |
| Qwen3.5-35B-A3B | 35B totales (3B activos, MoE) | no disponible | 85,3 | no disponible | no disponible |
| Qwen3.5-122B-A10B | 122B totales (10B activos, MoE) | no disponible | 86,7 | no disponible | no disponible |
| Qwen3-235B-A22B | 235B totales (22B activos, MoE) | no disponible | 84,4 | no disponible | no disponible |

La comparativa se limita a los datos que aparecen en la model card del modelo base. La variante FP8 se distingue del base por el formato de pesos y el menor requisito de memoria, no por capacidades declaradas.

## Limitaciones y advertencias

- La cuantización FP8 puede introducir degradaciones sutiles de calidad frente al modelo en BF16; el autor no publica una evaluación cuantitativa de la diferencia, solo la afirma como "prácticamente idéntica".
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan medidas específicas de mitigación en la información disponible.
- Sesgos: no se detalla ninguna evaluación de sesgos ni de seguridad en la información proporcionada.
- Idiomas: se declaran 201 idiomas y dialectos, pero no se especifica el nivel de calidad por idioma ni se incluye una lista; el rendimiento en idiomas minoritarios puede ser desigual.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar el enlace de licencia indicado en la model card (apunta al repositorio FP8 de Qwen) y las condiciones del modelo base.
- El repositorio tiene un volumen de descargas muy bajo (21 descargas, 7 likes) y fue creado en marzo de 2026; no hay evidencia de validación independiente de esta cuantización concreta.
- El uso de FP8 requiere hardware con soporte nativo para aprovechar el rendimiento; en GPUs sin soporte FP8 puede degradarse a conversiones en tiempo de ejecución.
- Contextos muy largos (hasta 1M de tokens) exigen memoria de caché KV considerable y pueden degradar la latencia; la extensión más allá de 262.144 tokens no está cuantificada en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dnhkng/RYS-Qwen3.5-27B-FP8-S
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Repositorio FP8 de referencia de Qwen: https://huggingface.co/Qwen/Qwen3.5-27B-FP8
- Blog del autor sobre RYS-II: https://dnhkng.github.io/posts/rys-ii/
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Licencia: https://huggingface.co/Qwen/Qwen3.5-27B-FP8/blob/main/LICENSE
