# Felamity-Technologies/Minmini-1B

## Resumen

Minmini-1B es un modelo de lenguaje de aproximadamente 1.000 millones de parámetros (999.885.952 según los pesos en safetensors) especializado en tamil y tanglish, desarrollado por Felamity-Technologies. Se construye como un fine-tuning de `google/gemma-3-1b-it` sobre la arquitectura de texto de Gemma 3, y su objetivo es cubrir un hueco que los modelos generalistas no resuelven bien: conversación en tamil coloquial (el registro hablado real, no el tamil formal de los corpus), transliteración entre tanglish y escritura tamil, traducción inglés-tamil y comprensión lectora sobre pasajes. El autor lo presenta como un especialista pequeño, no como un asistente general.

La relevancia del modelo está en su relación tamaño-rendimiento: con 1B de parámetros declara superar en tareas de inferencia y comprensión lectora en tamil a modelos mucho mayores, como Sarvam de 105B (IndicXNLI 72,5 % frente a 58,2 %; IndicQA F1 48,2 frente a 44,5). Es importante señalar que estos resultados son supervisados y en formato: Minmini fue ajustado precisamente sobre esos formatos de tarea, mientras que los modelos de comparación no, por lo que la comparación no es homogénea.

La versión actual (v5) añade una etapa de ajuste centrada en corregir fallos de la v4 en conversación: bucles de repetición, respuestas desviadas y tratamiento erróneo de mensajes muy cortos. El modelo se distribuye con licencia Gemma, soporta solo tamil e inglés y su repo ocupa 10,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3, `gemma3_text`) |
| Parametros totales | 999.885.952 (≈1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; se menciona soporte MLX en los tags) |
| Idiomas soportados | tamil (ta) e ingles (en); incluye tanglish (tamil escrito en caracteres latinos) |
| Licencia | Gemma (licencia de Google para la familia Gemma) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Minmini-1B hereda la arquitectura de `google/gemma-3-1b-it`, un transformer decoder-only de la familia Gemma 3 orientado a texto (la variante `gemma3_text`). El modelo parte de los pesos del modelo base y se ajusta de forma supervisada (SFT) sobre un conjunto de datos orientado a tareas específicas en tamil, tanglish e inglés. No se documenta en la información disponible el uso de RLHF o DPO, ni el número total de tokens de entrenamiento.

Los datos de ajuste combinan varios corpus: IndicXNLI (inferencia en lenguaje natural), ai4bharat/indic-align, CohereForAI/aya_dataset, GSM8K y su versión en tamil (Vishal0407/GSM8K_TAMIL) y google-dakshina para transliteración. La etapa v5 incorpora además un bucle de corrección: la v4 respondió a unas 3.400 indicaciones cotidianas, sarvam-105b evaluó cada respuesta y reescribió las defectuosas (unas 1.650 correcciones); se añadieron unas 650 conversaciones de mensajes muy cortos con respuestas breves y completas, y unas 1.400 pares de conocimiento cotidiano sobre comida, festividades, lugares y refranes tamiles, conservados solo si sarvam-105b los validaba como correctos. También se eliminaron del mix de repetición los datos de chat romanizados automáticamente que habían enseñado el hábito de responder con la fórmula "X enbathu…".

## Capacidades

- Generación de texto conversacional en tamil coloquial (registro hablado: "enna panra", "saaptiya") y en tanglish.
- Conversión entre tanglish (tamil en caracteres latinos) y escritura tamil.
- Traducción inglés-tamil y tamil-inglés.
- Comprensión lectora y question answering extractivo sobre un pasaje proporcionado.
- Inferencia en lenguaje natural (NLI): comprobar si una afirmación se sigue de un enunciado.
- Razonamiento matemático de primaria paso a paso en inglés, tamil y tanglish, limitado a problemas cortos y simples.
- Conocimiento cotidiano tamil: comida, festividades, lugares, refranes y significados de palabras.
- Respuestas breves y completas a mensajes muy cortos ("ok", "hmm", "good night", "saptiya?").
- No se documenta soporte de tool calling, function calling, capacidades de agente, visión ni audio en la información disponible.

## Casos de uso

- Asistente conversacional en tamil coloquial: el modelo está ajustado para responder en el registro hablado real y en tanglish, lo que lo hace adecuado para chatbots dirigidos a usuarios tamiles que escriben como hablan, no en tamil formal.
- Transliteración tanglish-tamil en producción: con un chrF de 52,0 sobre 250 frases retenidas de Dakshina, puede integrarse en flujos de normalización de texto para usuarios que escriben tamil con caracteres latinos antes de pasarlo a otros sistemas.
- Comprensión lectora sobre documentos: con F1 48,2 y exact match 40,2 en IndicQA, sirve para extraer respuestas de pasajes en tamil en aplicaciones de consulta documental, siempre que se le proporcione el texto fuente.
- Verificación de afirmaciones: con 72,5 % de accuracy en IndicXNLI, puede usarse como componente de NLI para comprobar si una frase se sigue de un enunciado dado en tamil.
- Traducción inglés-tamil en pipelines de contenido: el modelo declara chrF de 44,0 / 43,2 en FLORES (según la model card), útil para localización de textos hacia tamil con revisión humana.
- Educación y matemáticas básicas: resuelve problemas de primaria paso a paso en inglés (26,4 % en GSM8K) y tamil (12,0 %), adecuado para tutores de problemas cortos y sencillos, no para matemáticas complejas.
- Atención al cliente de bajo coste: al ser un modelo de 1B, puede desplegarse en hardware modesto para respuestas frecuentes en tamil e inglés, con escalado a un modelo mayor cuando la consulta lo requiera.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Inferencia en lenguaje natural | IndicXNLI (tamil, test, 1.000 pares) | Accuracy (prompt Tamil-Bench) | 72,5 |
| Question answering extractivo | IndicQA (tamil, 1.000 preguntas) | F1 | 48,2 |
| Question answering extractivo | IndicQA (tamil, 1.000 preguntas) | Exact match | 40,2 |
| Matematicas de primaria | GSM8K test (inglés, primeras 250) | Accuracy | 26,4 |
| Matematicas de primaria | GSM8K test en tamil (primeras 250) | Accuracy | 12,0 |
| Transliteración tanglish-tamil | Dakshina tamil (250 frases retenidas) | chrF | 52,0 |

Datos adicionales de la model card: en los ítems del leaderboard de Tamil-Bench, XNLI alcanza 78,0 % y IndicQA F1 47,4. En la prueba de chat coloquial de 140 indicaciones puntuada de 1 a 5 por sarvam-105b, la v5 obtiene 4,31 en registro coloquial, 4,24 en relevancia y 4,36 en fluidez, con un 7,9 % de respuestas atascadas en repeticiones (frente al 19 % de la v4). En tareas de traducción, FLORES chrF es 44,0 / 43,2; en sentimiento en tanglish, 58,0; en MILU, 27,6. El autor advierte que la comparación con Sarvam-105B (IndicXNLI 72,5 frente a 58,2; IndicQA F1 48,2 frente a 44,5) es en formato supervisado, ya que Minmini fue ajustado sobre esos formatos y los modelos comparados no.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo de 1B, en fp16 se sitúa en torno a 2 GB solo de pesos, y en cuantizaciones de 8 o 4 bits sustancialmente menos, aunque el fabricante no publica cifras.
- GPU recomendadas: no disponible en la información proporcionada.
- Cabe en GPU de consumo: por tamaño (1B) es plausible en tarjetas de consumo, pero no se documentan modelos concretos ni requisitos oficiales.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`) y MLX (tag `mlx`, orientado a Apple Silicon). No se mencionan vLLM, llama.cpp ni Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en tamil | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Minmini-1B | ≈1B | no disponible | IndicXNLI 72,5 %; IndicQA F1 48,2 | Gemma | Hugging Face |
| Sarvam (105B) | 105B | no disponible | IndicXNLI 58,2 %; IndicQA F1 44,5 (según el autor, sin ajuste en formato) | no disponible | no disponible en la información |
| google/gemma-3-1b-it | ≈1B | no disponible | no disponible | Gemma | Hugging Face |

La comparación con Sarvam-105B procede de la model card del autor y no es homogénea: Minmini fue ajustado sobre los formatos de evaluación y Sarvam no. No se dispone de datos de otros modelos especializados en tamil en la información proporcionada.

## Limitaciones y advertencias

- Es un especialista pequeño, no un asistente general: rinde mejor en tareas que parten de texto proporcionado (QA sobre pasaje, NLI, traducción, transliteración) que como fuente de conocimiento.
- Las matemáticas solo son fiables en problemas cortos y simples; el 12,0 % en GSM8K tamil y el 26,4 % en inglés reflejan una capacidad limitada.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente; además, son resultados en formato supervisado, lo que infla la comparación con modelos no ajustados a esas tareas.
- Riesgo de alucinación: la model card reconoce que no es una fuente de conocimiento y que puede responder de forma incorrecta o desviada; la v5 reduce los bucles de repetición al 7,9 %, pero no los elimina.
- Sesgos conocidos: no se documentan en la información disponible.
- Limitaciones de idioma: solo tamil e inglés (con tanglish); no cubre otros idiomas indios.
- Longitud de contexto: no disponible, lo que impide planificar despliegues con documentos largos.
- Licencia Gemma: el uso comercial está sujeto a los términos de la licencia de Google para la familia Gemma; conviene revisarlos antes de producción.
- El modelo se entrenó con datos generados y evaluados por sarvam-105b, lo que puede introducir sesgos o errores heredados de ese evaluador.

## Enlaces

- Hugging Face: https://huggingface.co/Felamity-Technologies/Minmini-1B
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Dataset IndicXNLI: https://huggingface.co/datasets/Divyanshu/indicxnli
- Dataset IndicAlign: https://huggingface.co/datasets/ai4bharat/indic-align
- Dataset Aya: https://huggingface.co/datasets/CohereForAI/aya_dataset
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset GSM8K en tamil: https://huggingface.co/datasets/Vishal0407/GSM8K_TAMIL
- Dataset Google Dakshina: https://huggingface.co/datasets/suhani-sarvam/google-dakshina
