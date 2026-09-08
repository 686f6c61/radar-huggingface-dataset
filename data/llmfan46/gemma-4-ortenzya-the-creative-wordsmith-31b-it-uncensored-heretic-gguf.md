# llmfan46/gemma-4-Ortenzya-The-Creative-Wordsmith-31B-it-uncensored-heretic-GGUF

## Resumen

El modelo `gemma-4-Ortenzya-The-Creative-Wordsmith-31B-it-uncensored-heretic-GGUF` es una cuantización GGUF de un finetune realizado por el desarrollador independiente llmfan46. Parte del modelo base `google/gemma-4-31B-it`, que primero fue sometido a un proceso de "abliteración" (eliminación de comportamientos de rechazo) mediante la herramienta Heretic v1.2.0 con el método Arbitrary-Rank Ablation (ARA), y posteriormente fue afinado con Unsloth Studio v0.1.39-beta para mejorar sus capacidades de escritura creativa, traducción y roleplay.

Con 30.697.345.596 parámetros (30.7B) y licencia Apache 2.0, este modelo destaca por reducir drásticamente los rechazos: pasa de 99/100 rechazos en el modelo original a 9/100. El objetivo declarado por el autor es ofrecer un modelo con un estilo de prosa más humano y menos "robótico", eliminando la neutralidad mecánica del modelo base. Está disponible en formato GGUF con múltiples cuantizaciones, lo que facilita su despliegue en entornos locales mediante llama.cpp u Ollama.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de visión-lenguaje basado en la familia Gemma 4) |
| Parametros totales | 30.697.345.596 (30.7B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L |
| Idiomas soportados | en, ja |
| Licencia | Apache 2.0 (con términos adicionales de la licencia de Gemma 4) |
| Formato de pesos | GGUF (el modelo base usa safetensors) |

## Arquitectura y entrenamiento

No se especifica la arquitectura exacta en la información disponible, pero al ser un finetune de Gemma 4, se trata de un modelo de visión-lenguaje (image-text-to-text) basado en la arquitectura Transformer. Es un modelo denso, sin mezcla de expertos (MoE). El proceso de entrenamiento consta de dos etapas: primero, la abliteración del modelo original `gemma-4-31B-it` mediante Heretic v1.2.0 con el método ARA, aplicando los siguientes parámetros: `start_layer_index` 30, `end_layer_index` 48, `preserve_good_behavior_weight` 0.5437, `steer_bad_behavior_weight` 0.0005, `overcorrect_relative_weight` 0.9949 y `neighbor_count` 15, sobre el componente `attn.o_proj`. Después, un finetune con Unsloth Studio v0.1.39-beta orientado a escritura creativa, traducción y roleplay. No se proporcionan datos sobre el dataset de entrenamiento, el número de tokens ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto creativo con un estilo más natural y humano, reduciendo el tono corporativo y la prosa rígida del modelo base.
- Traducción entre inglés y japonés, los dos idiomas soportados.
- Roleplay y narrativa interactiva, con una tasa de rechazos mucho menor (9/100 frente a 99/100).
- Procesamiento de entradas de imagen y texto (pipeline `image-text-to-text`), heredado de la familia Gemma 4.
- Conversación multimodal y generación de texto a partir de imágenes, aunque no se documentan capacidades específicas de visión.
- Sin datos disponibles sobre tool calling, function calling o soporte de agentes.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo está finetuneado específicamente para roleplay, con un estilo más humano y menos rechazos, lo que permite mantener conversaciones largas sin que el modelo se niegue a responder.
- Traducción literaria entre inglés y japonés: al soportar ambos idiomas y haber sido afinado para traducción, puede utilizarse para traducir textos narrativos, diálogos y novelas ligeras.
- Escritura de ficción: la mejora en la naturalidad de la prosa lo hace adecuado para generar borradores de novelas, cuentos y guiones con un tono menos artificial.
- Desarrollo de novelas visuales: el tag "visual novels" indica que el modelo puede integrarse en herramientas de escritura para este género, generando diálogos y descripciones de escenas.
- Asistente de escritura para creadores de contenido: puede ayudar a redactar entradas de blog, guiones de vídeo o contenido creativo con un estilo más orgánico.
- Chat conversacional sin restricciones: gracias a la abliteración, el modelo responde sin los rechazos típicos de los modelos alineados, útil para aplicaciones que requieren libertad creativa o exploración de temas controvertidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento documentado es la tasa de rechazos:

| Métrica | Este modelo | Modelo original (gemma-4-31B-it) |
|---|---|---|
| Rechazos | 9/100 | 99/100 |

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada.
- El repositorio ocupa 232.3 GB en total, lo que incluye todas las cuantizaciones, pero no se especifican los tamaños individuales de cada archivo.
- GPU recomendadas: no disponible.
- El formato GGUF permite su ejecución en CPU y GPU mediante llama.cpp, Ollama o text-generation-inference (TGI), según los tags del modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos de benchmarks que permitan comparar con otros modelos de la misma categoría. La única comparación documentada es con el modelo base `google/gemma-4-31B-it`, en la métrica de rechazos. Ambos comparten el mismo número de parámetros y licencia, pero este finetune presenta una reducción del 91% en rechazos. No se dispone de información sobre el contexto ni sobre otros modelos comparables.

| Modelo | Parametros | Contexto | Rechazos | Licencia |
|---|---|---|---|---|
| gemma-4-Ortenzya (este modelo) | 30.7B | No disponible | 9/100 | Apache 2.0 |
| google/gemma-4-31B-it | 30.7B | No disponible | 99/100 | Apache 2.0 |

## Limitaciones y advertencias

- Al ser un modelo "uncensored" y "abliterado", puede generar contenido inapropiado, ofensivo o peligroso. El autor no documenta medidas de seguridad adicionales.
- Riesgo de alucinación inherente a los modelos de lenguaje, no mitigado específicamente en este finetune.
- Limitación de idiomas: solo inglés y japonés, por lo que no es adecuado para tareas multilingües más amplias.
- La licencia Apache 2.0 se aplica al finetune, pero el modelo base Gemma 4 tiene su propia licencia con términos específicos (enlace incluido). Es necesario revisar ambos términos antes de un uso comercial.
- El autor solicita soporte económico en Patreon y Ko-fi, y advierte que ha alcanzado el límite de almacenamiento gratuito de HuggingFace, lo que podría afectar la disponibilidad futura del modelo.
- No hay información sobre el dataset de entrenamiento ni sobre el proceso de evaluación, lo que dificulta valorar la calidad del finetune más allá de la métrica de rechazos.

## Enlaces

- https://huggingface.co/llmfan46/gemma-4-Ortenzya-The-Creative-Wordsmith-31B-it-uncensored-heretic-GGUF
- https://huggingface.co/llmfan46/gemma-4-Ortenzya-The-Creative-Wordsmith-31B-it-uncensored-heretic
- https://huggingface.co/google/gemma-4-31B-it
- https://github.com/p-e-w/heretic/pull/211
- https://unsloth.ai/docs/new/studio
- https://ai.google.dev/gemma/docs/gemma_4_license
- https://patreon.com/LLMfan46
- https://ko-fi.com/llmfan46
