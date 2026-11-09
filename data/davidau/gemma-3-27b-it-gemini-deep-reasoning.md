# DavidAU/Gemma-3-27b-it-Gemini-Deep-Reasoning

## Resumen

Gemma-3-27b-it-Gemini-Deep-Reasoning es un ajuste fino (fine-tune) del modelo google/gemma-3-27b-it publicado por DavidAU en Hugging Face. El objetivo del ajuste es incorporar un modo de razonamiento compacto inspirado en Gemini, de forma que el modelo active automáticamente bloques de pensamiento (thinking) cuando la petición lo requiera y responda en modo instruct directo cuando la respuesta sea inmediata. El ajuste se realizó con Unsloth sobre el dataset TeichAI/gemini-3-pro-preview-high-reasoning-250x y conserva intactas las capacidades multimodales (image-text-to-text) del modelo base.

El modelo mantiene la arquitectura transformer del Gemma 3 de 27B, con 27.432.406.640 parámetros y una ventana de contexto de 128k tokens. El autor indica que el fine-tune no actualiza el conocimiento del modelo, sino que modifica el estilo y la profundidad de la generación, mejorando la calidad de salida tanto en modo instruct como en modo razonamiento. Los bloques de pensamiento generados son compactos (4-6 párrafos de media) en lugar de cadenas de miles de tokens.

Es relevante para quienes buscan un modelo de 27B con capacidades multimodales y razonamiento activable sin necesidad de system prompt, con soporte para nueve idiomas y orientado a escritura creativa, rol y generación de ficción. El autor publica métricas propias de benchmarks de conocimiento general que muestran mejoras frente a una base "Heretic" no censurada, aunque no se han publicado resultados en benchmarks estándar de razonamiento o código.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3), multimodal image-text-to-text |
| Parámetros totales | 27.432.406.640 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 128k tokens |
| Tipos de cuantización | No disponible (el repo contiene safetensors en bfloat16; el autor referencia GGUF, EXL2, AWQ, GPTQ y HQQ en su colección de fuentes) |
| Idiomas soportados | en, fr, de, es, it, pt, ru, zh, ja |
| Licencia | No disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-3-27b-it, un transformer multimodal de la familia Gemma 3 que procesa texto e imágenes. El fine-tune se realizó con Unsloth sobre el dataset TeichAI/gemini-3-pro-preview-high-reasoning-250x, orientado a añadir un comportamiento de razonamiento compacto similar al de Gemini. Según el autor, el ajuste no amplía el conocimiento del modelo ni sus habilidades de base, sino que modifica la forma de generar: activa bloques de pensamiento cuando la petición lo requiere y responde directamente cuando la respuesta es inmediata.

El autor describe el razonamiento como "compacto" (bloques de 4-6 párrafos de media) y estable frente a la temperatura, con un rango de temperatura recomendado de 0.1 a 2.5. El modelo incluye dos plantillas Jinja: una "regular" y una "thinking" (chat-template-thinking.jinja), que permite forzar el modo de razonamiento siempre activo. También se puede activar el pensamiento mediante la instrucción "Think deeply:" o mediante un system prompt específico. No se detallan en la información disponible el número de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento con activación automática de bloques de pensamiento (thinking) cuando la petición lo requiere.
- Modo instruct directo cuando el modelo "sabe" la respuesta, sin generar cadena de pensamiento.
- Procesamiento de imágenes (image-text-to-text) con la inteligencia visual del modelo base intacta; el razonamiento afecta también a la interpretación de imágenes.
- Escritura creativa y de ficción: generación de tramas, subtramas, escenas, continuación de historias y prosa vívida en todos los géneros (ciencia ficción, romance, etc.).
- Roleplaying y conversación multi-turno, con soporte para contenido explícito (swearing, RP).
- Capacidades multilingües en nueve idiomas: inglés, francés, alemán, español, italiano, portugués, ruso, chino y japonés.
- Soporte de plantillas de chat Jinja para forzar el modo de razonamiento.
- No se documenta soporte explícito de tool calling, function calling ni de agentes multi-paso en la información disponible.

## Casos de uso

- Escritura de ficción y narrativa: el modelo está ajustado específicamente para generar tramas, subtramas y escenas con prosa vívida; se usaría como generador de borradores o continuador de escenas en herramientas de escritura asistida.
- Roleplay conversacional: con contexto de 128k tokens puede mantener sesiones largas de rol con memoria de la conversación, y el ajuste admite contenido explícito y tono libre.
- Asistente multimodal con razonamiento: al conservar la capacidad image-text-to-text, puede analizar imágenes y razonar sobre ellas (por ejemplo, descripción detallada de una escena o extracción de información visual) con un bloque de pensamiento previo.
- Generación de guiones y diálogos: el modo de razonamiento compacto permite producir diálogos coherentes con la trama sin cadenas de pensamiento excesivamente largas, útil en pipelines de preproducción audiovisual.
- Chat de atención al cliente con contexto largo: los 128k tokens permiten arrastrar historiales extensos; el modo instruct directo reduce la latencia en consultas simples y el modo thinking se reserva para casos complejos.
- Traducción y adaptación multilingüe: con soporte para nueve idiomas, puede emplearse en localización de textos creativos manteniendo el tono y el estilo.
- Prototipado de aplicaciones de razonamiento: sirve como banco de pruebas para evaluar la activación automática de thinking en un modelo de 27B desplegado en local.

## Benchmarks y rendimiento

El autor publica resultados propios en benchmarks de conocimiento general, comparando el modelo con una base "Heretic" no censurada:

| Benchmark | Gemma-3-27b-it-Gemini-Deep-Reasoning | Base Heretic (uncensored) |
|---|---|---|
| arc_challenge | 0.590 | 0.557 |
| arc_easy | 0.742 | 0.711 |
| boolq | 0.883 | 0.868 |
| hellaswag | 0.781 | 0.533 |
| openbookqa | 0.458 | 0.452 |
| piqa | 0.822 | 0.706 |
| winogrande | 0.751 | 0.695 |

No se han publicado resultados de benchmarks de razonamiento, código o matemáticas (MMLU, HumanEval, GSM8K) en la información disponible. El autor afirma que "los benchmarks están fuera de escala" sin aportar datos adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 55 GB solo para los pesos (el repo ocupa 54,9 GB), por lo que se necesita al menos una GPU de 80 GB (A100, H100) o varias GPU con paralelismo de tensor.
- En cuantización de 8 bits: alrededor de 28-30 GB de VRAM, viable en una RTX 4090 (24 GB) solo con cuantizaciones de 4 bits o mediante offloading parcial.
- En cuantización de 4 bits (GGUF Q4): aproximadamente 15-17 GB, cabe en una RTX 4090, RTX 3090 o RTX 4080 de 16 GB con margen ajustado.
- GPU recomendadas: A100 80 GB o H100 para bfloat16 completo; RTX 4090/3090 para cuantizaciones de 4-8 bits.
- Opciones de despliegue: transformers, text-generation-webui (con llama_HF para GGUF), KoboldCpp, Silly Tavern; el autor referencia cuantizaciones GGUF, EXL2, AWQ, GPTQ y HQQ en su colección de fuentes. No se confirma soporte de vLLM o TGI en la información disponible, aunque el tag text-generation-inference aparece en los metadatos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-3-27b-it-Gemini-Deep-Reasoning | 27,4B | 128k | Sí | No disponible | Hugging Face (49 descargas) |
| google/gemma-3-27b-it (base) | 27B | 128k | Sí | Gemma Terms of Use | Hugging Face |
| Base "Heretic" no censurada (referida por el autor) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría (por ejemplo, Qwen 2.5 32B o Mistral Small) en la información proporcionada. La comparación con la base Heretic se limita a los benchmarks de conocimiento general de la sección anterior.

## Limitaciones y advertencias

- El autor indica explícitamente que el fine-tune no actualiza el conocimiento ni las habilidades del modelo base; solo modifica el estilo y la profundidad de generación.
- Riesgo de alucinación inherente al modelo base, no mitigado por este ajuste.
- El ajuste está orientado a escritura creativa y roleplay, con soporte de contenido explícito (swearing, RP); puede no ser adecuado para entornos corporativos sin filtrado adicional.
- La licencia no está disponible en la información proporcionada, lo que impide confirmar las condiciones de uso comercial; se debe consultar la licencia del modelo base (Gemma Terms of Use) y la del autor.
- El modelo tiene solo 49 descargas y 9 likes, con un ecosistema de validación limitado; los benchmarks publicados son del autor y no han sido verificados de forma independiente.
- El razonamiento no siempre se activa de forma automática; puede requerir el system prompt, la plantilla Jinja de thinking o la instrucción "Think deeply:".
- El autor recomienda ajustes específicos de muestreo (smoothing_factor 1.5, repetition penalty 1.1-1.15) para un funcionamiento suave en KoboldCpp, text-generation-webui y Silly Tavern; sin ellos el comportamiento puede degradarse.
- No se documentan capacidades de tool calling ni de agentes, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Gemma-3-27b-it-Gemini-Deep-Reasoning
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- FAQs y soporte: https://huggingface.co/DavidAU/support
- Colección de fuentes para GGUF, EXL2, AWQ, GPTQ, HQQ: https://huggingface.co/collections/DavidAU/d-au-source-files-for-gguf-exl2-awq-gptq-hqq-etc-etc-66b55cb8ba25f914cbf210be
- Modelo base: https://huggingface.co/google/gemma-3-27b-it
- Dataset de entrenamiento: https://huggingface.co/datasets/TeichAI/gemini-3-pro-preview-high-reasoning-250x
