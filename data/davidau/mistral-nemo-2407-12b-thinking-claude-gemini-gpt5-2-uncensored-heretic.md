# DavidAU/Mistral-Nemo-2407-12B-Thinking-Claude-Gemini-GPT5.2-Uncensored-HERETIC

## Resumen

Mistral-Nemo-2407-12B-Thinking-Claude-Gemini-GPT5.2-Uncensored-HERETIC es un ajuste fino (finetune) del modelo Mistral-Nemo-Instruct-2407 de Mistral AI, publicado por el usuario DavidAU en Hugging Face. El modelo parte de la arquitectura transformer de Mistral Nemo de 12.247.782.400 parámetros y se ha transformado en dos fases: primero mediante una técnica de "abliteration" o "heretic" que elimina los mecanismos de rechazo del modelo original (el autor reporta una reducción de 87/100 a 14/100 en tasa de rechazos), y después mediante un ajuste fino supervisado con tres conjuntos de datos de razonamiento de alta calidad (Claude 4.5 Opus, Gemini 3 Pro Preview y GPT-5.2, cada uno de 250 ejemplos).

El objetivo del ajuste es doble: por un lado, convertir un modelo instruct convencional en un modelo con modo "thinking" o razonamiento explícito, con bloques de razonamiento compactos de 300 a 600 tokens (3-6 párrafos); por otro, eliminar los filtros de contenido para permitir generación de ficción sin restricciones, roleplay y escritura creativa de tono adulto. El autor declara soporte de contexto de 128k a 256k tokens (hasta 1 millón según la model card), aunque el modelo base Mistral Nemo soporta oficialmente 128k.

El modelo está orientado a escritura creativa, generación de tramas, ficción de todos los géneros, roleplay conversacional y tareas donde el filtrado de seguridad del modelo base resulta un obstáculo. No dispone de benchmarks propios publicados tras el ajuste; los únicos datos numéricos disponibles son los del modelo base original de Mistral, que el autor reproduce sin actualizar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral Nemo), ajuste fino con Unsloth |
| Parametros totales | 12.247.782.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128k oficial del modelo base; el autor declara 128k-256k (max 1 millón) |
| Tipos de cuantizacion | bfloat16 en safetensors; el autor sugiere Q4_K_S (no imatrix) o IQ3_M (imatrix) o superiores |
| Idiomas soportados | en, fr, de, es, it, pt, ru, zh, ja |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 24.5 GB); el autor publica GGUF, EXL2, AWQ, GPTQ, HQQ en colecciones separadas |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Mistral-Nemo-Instruct-2407, con 12.247 millones de parámetros, atención con ventana deslizante y soporte de contexto largo. Sobre esta base, el autor aplica primero una "abliteration" (denominada "heretic") que modifica los pesos para reducir la tasa de rechazos de 87/100 a 14/100 según su propia medición, y después un ajuste fino supervisado con Unsloth sobre tres datasets de razonamiento: `TeichAI/claude-4.5-opus-high-reasoning-250x`, `TeichAI/gemini-3-pro-preview-high-reasoning-250x` y `TeichAI/gpt-5.2-high-reasoning-250x`, cada uno con 250 ejemplos de alta calidad.

La innovación principal es la incorporación de un modo de razonamiento compacto: los bloques de "thinking" generados miden entre 300 y 600 tokens (3-6 párrafos), lo que el autor describe como un motor de razonamiento "compacto y directo" en lugar de extenso. Según la model card, la activación del razonamiento no depende de la temperatura (funciona desde 0.1 hasta 2.5 o más) y la complejidad del prompt determina la profundidad del bloque de razonamiento. No se especifica el número total de tokens de entrenamiento ni la composición completa del dataset más allá de los tres conjuntos citados. No se menciona uso de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento explícito con bloques de "thinking" autogenerados (sin necesidad de system prompt).
- Escritura creativa y de ficción: prosa vívida, generación de tramas y subtramas, continuación de escenas, storytelling en todos los géneros (ciencia ficción, romance, terror, etc.).
- Roleplay conversacional sin filtros de contenido, con soporte de lenguaje soez y contenido NSFW/R-18 según el autor.
- Capacidades multilingües en en, fr, de, es, it, pt, ru, zh y ja.
- Conversación multi-turno con contexto largo (128k-256k según el autor).
- No se documenta soporte explícito de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes multi-paso ni de visión o audio.

## Casos de uso

- Escritura de ficción y narrativa: el modelo genera prosa vívida y continuaciones de escena con contexto largo, adecuado para novelas por entregas o generación de capítulos donde la coherencia a lo largo de decenas de miles de tokens es crítica.
- Generación de tramas y subtramas: útil en herramientas de ideación para guionistas y autores que necesitan múltiples variantes argumentales de forma rápida, con modo de razonamiento que estructura la lógica narrativa antes de escribir.
- Roleplay y juegos de rol conversacionales: el ajuste "heretic" elimina los rechazos del modelo base, lo que permite personajes con lenguaje soez, temas adultos o conflictos intensos sin interrupciones de filtros de seguridad.
- Ficción de terror y contenido adulto: el autor declara soporte explícito de terror R-18 y detalles viscerales, un nicho donde los modelos alineados convencionalmente rechazan la petición.
- Asistencia a la escritura multilingüe: con soporte de nueve idiomas y contexto largo, puede usarse para traducir y adaptar ficción manteniendo el tono y el registro entre idiomas.
- Chat conversacional sin restricciones para investigación sobre alineación y seguridad: permite estudiar el comportamiento de un modelo abliterado frente al original en condiciones controladas, comparando tasas de rechazo y calidad de respuesta.
- Generación de diálogos para videojuegos o narrativa interactiva: el modo de razonamiento compacto (300-600 tokens) permite generar respuestas de personaje con lógica interna sin latencias excesivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks propios tras el ajuste en la información disponible. El autor reproduce los benchmarks del modelo base original de Mistral sin actualizar, advirtiendo explícitamente que "no se han actualizado con el ajuste de razonamiento":

| Benchmark | Puntuacion (modelo base Mistral Nemo) |
|---|---|
| HellaSwag (0-shot) | 83.5% |
| Winogrande (0-shot) | 76.8% |
| OpenBookQA (0-shot) | 60.6% |
| CommonSenseQA (0-shot) | 70.4% |
| TruthfulQA (0-shot) | 50.3% |
| MMLU (5-shot) | 68.0% |
| TriviaQA (5-shot) | 73.8% |
| NaturalQuestions (5-shot) | 31.2% |

MMLU multilingüe (modelo base): francés 62.3%, alemán 62.7%, español 64.6%, italiano 61.3%, portugués 63.3%, ruso 59.2%, chino 59.0%, japonés 59.0%.

## Requisitos de hardware

- VRAM estimada: en bfloat16 (24.5 GB de pesos) se necesitan aproximadamente 26-30 GB de VRAM para inferencia; en Q4_K_S o IQ3_M el modelo cabe en torno a 8-10 GB, y en Q8 en torno a 14-16 GB.
- GPU recomendadas: A100 40GB o H100 para bfloat16 completo; RTX 4090 (24 GB) para cuantizaciones de 8 bits o bfloat16 con offloading parcial; RTX 3090/4080 (16-24 GB) para cuantizaciones Q4-Q6.
- Cabe en GPU de consumo: sí, en RTX 3060 12GB o superiores con cuantización Q4_K_S o IQ3_M (el autor advierte que cuantizaciones inferiores pueden degradar la activación del razonamiento).
- Opciones de despliegue: transformers, text-generation-inference (TGI), llama.cpp, KoboldCpp, oobabooga/text-generation-webui, SillyTavern; el autor publica GGUF, EXL2, AWQ, GPTQ y HQQ en colecciones separadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Mistral-Nemo-2407-12B-Thinking-Claude-Gemini-GPT5.2-Uncensored-HERETIC | 12.2B | 128k-256k (declarado) | no disponible | Ajuste sin filtros con modo thinking; sin benchmarks propios |
| mistralai/Mistral-Nemo-Instruct-2407 | 12.2B | 128k | Apache 2.0 (modelo base) | Modelo original alineado; benchmarks en la tabla anterior |
| mistralai/Mistral-Nemo-Base-2407 | 12.2B | 128k | Apache 2.0 | Base sin instrucciones, para ajuste propio |

No se dispone de datos de rendimiento comparativo del modelo ajustado frente a alternativas, por lo que la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Modelo sin filtros de seguridad: el ajuste "heretic" elimina deliberadamente los mecanismos de rechazo, por lo que puede generar contenido NSFW, violento o socialmente inapropiado sin advertencia.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad tras el ajuste; los datos de TruthfulQA del modelo base (50.3%) indican una fiabilidad limitada en hechos.
- Sesgos: el ajuste con datasets de razonamiento sintéticos de terceros (TeichAI) puede heredar sesgos de esos conjuntos; no se documenta ninguna mitigación.
- Licencia no disponible: no se especifica la licencia del modelo ajustado, lo que impide confirmar si el uso comercial está permitido; el modelo base Mistral Nemo es Apache 2.0, pero el ajuste no declara términos propios.
- Contexto declarado inconsistente: el autor afirma 128k-256k (hasta 1 millón) pero el modelo base soporta oficialmente 128k; no hay verificación independiente del contexto extendido.
- Cuantizaciones bajas (por debajo de Q4_K_S o IQ3_M) pueden degradar o impedir la activación del razonamiento según el autor.
- Sin benchmarks propios: cualquier afirmación de mejora de rendimiento por el ajuste de razonamiento carece de validación numérica publicada.
- El autor recomienda ajustes de muestreo específicos (temp 0.7, rep pen 1.05, top_p 0.95, min_p 0.05, top_k 40) y "smoothing_factor" 1.5 en algunas interfaces; el rendimiento fuera de esos parámetros no está documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Mistral-Nemo-2407-12B-Thinking-Claude-Gemini-GPT5.2-Uncensored-HERETIC
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- FAQs y soporte: https://huggingface.co/DavidAU/support
- Modelo base: https://huggingface.co/mistralai/Mistral-Nemo-Instruct-2407
- Dataset Claude 4.5 Opus high reasoning: https://huggingface.co/datasets/TeichAI/claude-4.5-opus-high-reasoning-250x
- Dataset Gemini 3 Pro Preview high reasoning: https://huggingface.co/datasets/TeichAI/gemini-3-pro-preview-high-reasoning-250x
- Dataset GPT-5.2 high reasoning: https://huggingface.co/datasets/TeichAI/gpt-5.2-high-reasoning-250x
- Unsloth (framework de ajuste): https://github.com/unslothai/unsloth
- Colección de ficheros fuente para GGUF/EXL2/AWQ/GPTQ/HQQ: https://huggingface.co/collections/DavidAU/d-au-source-files-for-gguf-exl2-awq-gptq-hqq-etc-etc-66b55cb8ba25f914cbf210be
