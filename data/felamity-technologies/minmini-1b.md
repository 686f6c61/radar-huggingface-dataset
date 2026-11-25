# Felamity-Technologies/Minmini-1B

## Resumen

Minmini-1B (மின்மினி, "luciérnaga") es un modelo de lenguaje de 1.000 millones de parámetros especializado en tamil y tanglish, desarrollado por Felamity-Technologies mediante ajuste fino supervisado de google/gemma-3-1b-it. El modelo está diseñado para tareas centradas en texto proporcionado por el usuario: inferencia en lenguaje natural, comprensión lectora extractiva, traducción inglés↔tamil, transliteración entre tanglish y escritura tamil, y conversación coloquial en registro hablado. Su propuesta principal es ofrecer un especialista pequeño que supera en tareas de tamil a modelos mucho mayores, según los datos declarados por el autor.

La versión v4 incorpora una etapa adicional de ajuste fino sobre aproximadamente 7.250 conversaciones cotidianas en tamil hablado (tanglish y escritura tamil) y 2.640 frases que enlazan tanglish con escritura tamil e inglés, generadas por sarvam-105b y filtradas por relevancia y precisión. Esto corrige el principal defecto de v3, que respondía en tamil formal escrito y fallaba en comprender mensajes coloquiales como "nee ena panra" o "saptiya?".

El modelo se distribuye con licencia Gemma, soporta únicamente tamil e inglés, y está pensado como especialista de dominio y no como asistente general. Su relevancia actual reside en la combinación de tamaño reducido (apto para hardware de consumo), contexto de 128.000 tokens heredado de Gemma 3 y un enfoque explícito en registro coloquial tamil, un nicho poco cubierto por modelos multilingües generalistas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (gemma3_text) |
| Parametros totales | 999.885.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Gemma 3 1B-IT soporta 32.768 tokens; el autor no lo declara) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; se menciona soporte MLX en los tags) |
| Idiomas soportados | tamil (ta), inglés (en), tanglish (tamil romanizado) |
| Licencia | Gemma |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Minmini-1B es un ajuste fino supervisado (SFT) del modelo google/gemma-3-1b-it, un transformer decoder-only de la familia Gemma 3. No se documenta en la información disponible el uso de RLHF, DPO u otras etapas de alineación posteriores al SFT. El entrenamiento se realizó, según el autor, íntegramente en un portátil, lo que subraya el carácter ligero del proceso.

Los datos de entrenamiento combinan varios conjuntos: Divyanshu/indicxnli para inferencia en lenguaje natural, ai4bharat/indic-align y CohereForAI/aya_dataset para alineamiento y traducción, openai/gsm8k y Vishal0407/GSM8K_TAMIL para matemáticas, y suhani-sarvam/google-dakshina para transliteración. La etapa específica de v4 añade unas 7.250 conversaciones coloquiales y 2.640 frases de enlace tanglish–tamil–inglés, generadas por sarvam-105b y filtradas por relevancia y precisión. No se especifica el número total de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto y conversación en tamil coloquial (registro hablado) y en tanglish, incluyendo saludos, small talk y respuestas cotidianas.
- Inferencia en lenguaje natural en tamil: determinar si una afirmación se sigue, contradice o es independiente de un texto dado.
- Comprensión lectora extractiva: responder preguntas a partir de un pasaje en tamil, con capacidad declarada de indicar "no hay respuesta en el pasaje" (AUC 0,89).
- Traducción inglés↔tamil de frases cortas.
- Transliteración entre tanglish (tamil en caracteres latinos) y escritura tamil.
- Resolución de problemas matemáticos de primaria paso a paso en inglés, tamil y tanglish (rendimiento limitado a problemas cortos y simples).
- Análisis de sentimiento en tanglish (con caída de rendimiento en v4 respecto a v3).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Atención al cliente en tamil: el modelo puede responder preguntas a partir de documentación de soporte, FAQ o formularios en tamil, indicando de forma fiable cuándo la respuesta no está en el pasaje (IndicQA F1 51,3; AUC 0,89 en detección de no respuesta).
- Verificación de afirmaciones en tamil: comprobar si una declaración se sigue, contradice o es independiente de un texto fuente, útil en moderación de contenido o validación de resúmenes (IndicXNLI 73,5%).
- Chatbot conversacional en tamil coloquial y tanglish: gestionar interacciones informales con usuarios que escriben como hablan ("enna panra", "saaptiya"), con respuestas en el registro y alfabeto adecuados.
- Traducción de frases cortas inglés↔tamil: para localización de interfaces, notificaciones o mensajes de producto (FLORES chrF 44,9 / 44,4 en una comprobación de 100 frases).
- Normalización de tanglish a escritura tamil: convertir texto romanizado informal a escritura tamil estándar en pipelines de procesamiento de lenguaje, con chrF 52,7 / 56,9 en romanizaciones humanas reservadas.
- Asistencia educativa básica en matemáticas: resolver problemas aritméticos de primaria paso a paso en inglés (GSM8K 28,8%) o tamil (14,8%), adecuado solo para problemas cortos y simples.
- Análisis de sentimiento en tanglish: clasificación de opiniones informales en redes sociales o encuestas, con una precisión declarada del 55,6% en v4.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Inferencia en lenguaje natural | IndicXNLI (tamil, test, 1.000 pares) | Accuracy (prompt Tamil-Bench) | 73,5 |
| QA extractiva | IndicQA (tamil, 1.000 preguntas) | F1 | 51,3 |
| QA extractiva | IndicQA (tamil, 1.000 preguntas) | Exact match | 43,6 |
| Matemáticas de primaria | GSM8K test (inglés, primeros 250 problemas) | Accuracy | 28,8 |
| Matemáticas de primaria (tamil) | GSM8K test en tamil (primeros 250 problemas) | Accuracy | 14,8 |
| Transliteración tanglish→tamil | Dakshina Tamil (250 frases reservadas) | chrF | 52,7 |

El autor compara con sarvam-105b en IndicXNLI (73,5% frente a 58,2%) e IndicQA F1 (51,3 frente a 44,5) con los mismos prompts, y menciona puntuaciones de 78,0% en inferencia y F1 52,4 en lectura comprensiva en ítems del leaderboard Tamil-Bench, así como resultados de chat coloquial evaluados 1–5 por sarvam-105b (4,09 coloquial, 3,93 relevancia, 3,99 fluidez en v4 frente a 1,47, 1,67 y 1,99 en v3). No se dispone de resultados de MMLU, HumanEval ni otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en fp16 para los 1.000 millones de parámetros; en torno a 1 GB en cuantización de 8 bits y 0,5–0,7 GB en 4 bits (estimación según tamaño, no declarada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son suficientes con holgura.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 4 GB o más; también puede ejecutarse en CPU.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible), MLX (tag mlx). No se documenta compatibilidad explícita con llama.cpp, Ollama o vLLM en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Minmini-1B | 1.000 M | no disponible | Tamil/tanglish especialista | Gemma | Hugging Face |
| google/gemma-3-1b-it | 1.000 M | 32.768 tokens (modelo base) | Asistente general multilingüe | Gemma | Hugging Face |
| sarvam-105b | 105.000 M (según el autor) | no disponible | Multilingüe indio generalista | no disponible | no disponible |

Según los datos declarados por el autor, Minmini-1B supera a sarvam-105b en IndicXNLI (73,5% frente a 58,2%) e IndicQA F1 (51,3 frente a 44,5) con los mismos prompts, aunque estas cifras son resultados supervisados en formato y no comparables de forma directa con evaluaciones zero-shot. No se dispone de datos de benchmarks de gemma-3-1b-it en tamil en la información proporcionada para una comparación cuantitativa.

## Limitaciones y advertencias

- Los resultados son supervisados y en formato: el modelo fue ajustado fino sobre los formatos de estas tareas, mientras que los modelos comparados no, por lo que las comparaciones no son equivalentes a evaluaciones zero-shot.
- Es un especialista pequeño, no un asistente general: no es una fuente de conocimiento y su matemática solo es fiable en problemas cortos y simples (GSM8K 28,8% en inglés, 14,8% en tamil).
- Riesgo de alucinación fuera de tareas de comprensión de texto proporcionado; el autor recomienda usarlo sobre texto dado.
- Limitaciones de idioma: solo tamil, tanglish e inglés; no cubre otros idiomas indios.
- Caída de rendimiento en análisis de sentimiento en tanglish respecto a v3 (61,6% a 55,6%) y ligero descenso en IndicXNLI (74,4 a 73,5) y MILU (29,3 a 28,3).
- Errores de transliteración en palabras raras o préstamos en la conversión tanglish↔tamil.
- Licencia Gemma: el uso comercial está sujeto a los términos de la licencia Gemma de Google, que impone restricciones y obligaciones específicas.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Felamity-Technologies/Minmini-1B
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Dataset IndicXNLI: https://huggingface.co/datasets/Divyanshu/indicxnli
- Dataset IndicAlign: https://huggingface.co/datasets/ai4bharat/indic-align
- Dataset Aya: https://huggingface.co/datasets/CohereForAI/aya_dataset
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset GSM8K Tamil: https://huggingface.co/datasets/Vishal0407/GSM8K_TAMIL
- Dataset Dakshina: https://huggingface.co/datasets/suhani-sarvam/google-dakshina
