# richardyoung/Qwen3.5-4B-SOM-heretic

## Resumen

Qwen3.5-4B-SOM-heretic es una variante "abliterated" / decensored del modelo Qwen3.5-4B de Alibaba Qwen, publicada por el usuario richardyoung. El modelo conserva la arquitectura y los pesos del original (4.539 millones de parámetros, transformer híbrido con atención lineal Gated DeltaNet y atención con compuertas), pero se ha modificado mediante la técnica de ablación multi-direccional Self-Organizing Map (SOM) implementada en Heretic v2.0.0 para eliminar la mayor parte del comportamiento de rechazo (refusals).

El propósito de esta ficha es doble: documentar las características propias de esta variante (parámetros de ablación, tasas de rechazo, divergencia KL respecto al original) y recoger las especificaciones, capacidades y benchmarks del modelo base Qwen3.5-4B, que es el que determina el rendimiento real. El modelo base es multimodal (image-text-to-text), con encoder de visión y una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.010.000.

Es relevante ahora porque combina tres tendencias recientes: la fusión temprana visión-lenguaje de la familia Qwen3.5, arquitecturas híbridas eficientes para inferencia de alto rendimiento, y el ecosistema creciente de variantes "decensored" orientadas a investigación sobre alineación, seguridad y comportamiento de modelos. La licencia Apache 2.0 facilita su uso comercial, aunque las modificaciones de ablación introducen caveats importantes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con encoder de visión; Gated DeltaNet (atención lineal) + Gated Attention, con FFN |
| Parámetros totales | 4.539.265.536 (4B nominales) |
| Parámetros activos | no disponible (no es MoE según la model card) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantización | no disponible en la información proporcionada (pesos en safetensors; compatible con vLLM, SGLang, KTransformers) |
| Idiomas soportados | 201 idiomas y dialectos según la model card del modelo base |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (Transformers) |

Otros datos técnicos del modelo base: dimensión oculta 2560, 32 capas, layout 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), embedding de tokens 248.320 (con padding, atado a la salida LM), FFN con dimensión intermedia 9216, MTP entrenado con múltiples pasos. Gated DeltaNet: 32 cabezas lineales para V y 16 para QK, dimensión de cabeza 128. Gated Attention: 16 cabezas para Q y 4 para KV, dimensión de cabeza 256, RoPE de 64 dimensiones.

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura híbrida que intercala bloques de Gated DeltaNet (atención lineal con estado recurrente) y bloques de Gated Attention (atención estándar con compuertas), en una proporción de 3 a 1 por cada grupo de 8 capas. Esta combinación busca alto throughput y baja latencia en inferencia manteniendo calidad de razonamiento, y es la que permite sostener contextos de 262.144 tokens con extensión hasta 1.010.000. Incluye además un encoder de visión con fusión temprana de tokens multimodales, entrenado de forma que iguala o supera a los modelos Qwen3-VL en benchmarks de razonamiento, código, agentes y comprensión visual. El entrenamiento del base combina pre-entrenamiento y post-entrenamiento, con RL escalado en entornos multi-agente y MTP (multi-token prediction) entrenado con múltiples pasos.

La variante aquí documentada introduce una modificación post-entrenamiento: ablación multi-direccional SOM con Heretic v2.0.0. Los parámetros publicados son direction_index por capa, direction_decay 0,65, max_weight 1,14 en attn.o_proj (posición 21,30) y 1,35 en mlp.down_proj (posición 30,06), min_weight 0,06 en attn.o_proj (distancia 16,33) y 1,23 en mlp.down_proj (distancia 14,72). El resultado declarado por el autor es una reducción de rechazos de 99/100 en el original a 10/100 en esta variante, con una divergencia KL de 0,0550 respecto al modelo base. No se documentan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, detalles de RLHF/DPO).

## Capacidades

- Generación de texto y razonamiento multi-paso, incluyendo modo de pensamiento (thinking) heredado de la familia Qwen3.5.
- Comprensión de imágenes y texto (pipeline image-text-to-text): descripción, VQA, extracción de información de documentos visuales.
- Generación y razonamiento de código, con soporte para tareas de agentes de programación.
- Matemáticas y razonamiento STEM (ver benchmarks MMLU-Pro en la sección correspondiente).
- Tool calling / function calling, con compatibilidad declarada con endpoints y frameworks de despliegue (vLLM, SGLang, KTransformers).
- Capacidades de agente y razonamiento multi-paso, reforzadas mediante RL en entornos multi-agente según la model card del base.
- Cobertura multilingüe amplia: 201 idiomas y dialectos.
- Comportamiento decensored: reducción drástica de rechazos (10/100 frente a 99/100), lo que habilita respuestas sobre temas que el modelo original declina.
- Predicción multi-token (MTP) entrenada, útil para decodificación especulativa y aceleración de inferencia.

## Casos de uso

- Investigación sobre alineación y seguridad: comparar el comportamiento del modelo original y esta variante ablacionada permite estudiar qué direcciones del espacio de activaciones codifican el rechazo, usando la métrica de divergencia KL (0,0550) como referencia de deriva.
- Generación creativa sin restricciones temáticas: escritura de ficción, guiones o narrativa que aborde temas sensibles sin las negativas del modelo alineado, aprovechando el contexto largo para mantener coherencia en obras extensas.
- Análisis de documentos largos multimodales: con 262.144 tokens nativos, procesar informes con tablas e imágenes, contratos o expedientes completos en una sola pasada sin troceado.
- Asistentes de código en pipelines internos: integración vía tool calling en flujos de CI/CD para revisión, generación de tests y refactorización, con despliegue en vLLM o SGLang.
- Atención al cliente automatizada multi-turno: conversaciones largas con historial extenso gracias a la ventana de contexto, con cobertura de 201 idiomas para usuarios internacionales.
- Red teaming y evaluación de salvaguardas: usar la variante como modelo "atacante" o de referencia para probar clasificadores de seguridad y filtros de contenido en sistemas de moderación.
- Extracción de información de imágenes en entornos de investigación: digitalización de formularios, tickets o capturas con salida estructurada vía function calling.
- Prototipado de agentes autónomos: razonamiento multi-paso y tool calling con un modelo de 4B que cabe en hardware modesto, útil para iterar scaffolds de agentes antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor para esta variante frente al modelo base:

| Métrica | Este modelo | Qwen/Qwen3.5-4B |
|---|---|---|
| Rechazos (refusals) | 10/100 | 99/100 |
| Divergencia KL | 0,0550 | 0 (por definición) |

Resultados del modelo base Qwen3.5-4B publicados en su model card (subconjunto disponible en la información proporcionada, categoría Knowledge & STEM):

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80,8 | 74,8 | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto |

El extracto de la model card recibido se interrumpe tras la primera fila de la tabla de benchmarks, por lo que no se dispone del resto de valores (HumanEval, GSM8K, benchmarks de visión, agentes, etc.). No se han inventado cifras.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9 GB solo para pesos (4,54B parámetros), más overhead de activaciones y KV cache; con contexto largo la memoria de caché crece de forma significativa.
- Cuantización a 8 bits: en torno a 4,5-5 GB de pesos; a 4 bits: en torno a 2,5-3 GB, lo que permite ejecución en GPUs de consumo con margen para contexto moderado.
- GPU recomendadas para producción: A100 40/80 GB, H100, L40S; para desarrollo y prototipado, RTX 4090 (24 GB), RTX 4080 (16 GB) o RTX 3090 (24 GB) son suficientes en cuantización de 8 o 4 bits.
- Cabe en GPU de consumo: sí, en cuantizaciones de 4-8 bits; en BF16 completo requiere al menos 16-24 GB según longitud de contexto.
- Opciones de despliegue: Transformers, vLLM, SGLang y KTransformers (compatibilidad declarada en la model card del base); para cuantización GGUF y ejecución en CPU, llama.cpp u Ollama serían opciones habituales, aunque la información proporcionada no confirma artefactos GGUF publicados.
- Latencia y throughput: no disponibles en la información proporcionada. La arquitectura híbrida con Gated DeltaNet está diseñada para alto throughput y baja latencia, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-SOM-heretic (este) | 4,54B | 262.144 (ext. 1.010.000) | Apache 2.0 | Sí (image-text-to-text) | Variante ablacionada, 10/100 rechazos, KL 0,0550 |
| Qwen/Qwen3.5-4B (base) | 4B | 262.144 (ext. 1.010.000) | Apache 2.0 | Sí | Modelo alineado original, 99/100 rechazos |
| Qwen3.5-9B | 9B (nominal) | no disponible en el extracto | Apache 2.0 (presumible, no confirmado) | Sí | Misma familia, mayor tamaño; benchmarks no disponibles en el extracto |
| GPT-OSS-20B | 20B (nominal) | no disponible | no disponible | no disponible | Referencia de la tabla de benchmarks del base (MMLU-Pro 74,8) |
| Qwen3-30BA3B-Thinking-2507 | 30B totales / 3B activos | no disponible | no disponible | no disponible | MoE de generación anterior; benchmarks no disponibles en el extracto |

La comparación con variantes decensored de otros modelos no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La ablación SOM elimina buena parte del comportamiento de rechazo, pero no garantiza la ausencia total de negativas (10/100 según el autor) ni un comportamiento seguro: el modelo puede producir contenido dañino, ilegal o inexacto con mayor facilidad.
- La divergencia KL de 0,0550 respecto al original indica una deriva medible en la distribución de salida; puede traducirse en degradación de calidad, coherencia o precisión en algunas tareas frente al modelo base.
- Riesgo elevado de alucinación, común a modelos de 4B y potencialmente agravado por la modificación de pesos; no debe usarse como fuente de verdad sin verificación.
- No se documentan sesgos específicos en la información disponible; al heredar los datos del base, es esperable que arrastre sesgos culturales, lingüísticos y de género del corpus de Qwen, pero no hay mediciones publicadas.
- La cobertura de 201 idiomas corresponde al modelo base; no se ha verificado el impacto de la ablación en idiomas distintos del inglés.
- Licencia Apache 2.0 permite uso comercial, pero el usuario es responsable del contenido generado y del cumplimiento normativo (por ejemplo, obligaciones de moderación en la UE).
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validación comunitaria independiente de los resultados declarados.
- El repositorio ocupa 9,1 GB, coherente con pesos en BF16/FP16; no se confirma la disponibilidad de cuantizaciones oficiales.
- Uso en producción: requiere evaluación propia de seguridad y calidad, filtros de salida y monitorización; no se recomienda desplegarlo en aplicaciones orientadas al público sin salvaguardas adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/richardyoung/Qwen3.5-4B-SOM-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Heretic (proyecto de ablación): https://heretic-project.org
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
