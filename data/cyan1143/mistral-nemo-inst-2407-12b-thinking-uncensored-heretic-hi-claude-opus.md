# cyan1143/Mistral-Nemo-Inst-2407-12B-Thinking-Uncensored-HERETIC-HI-Claude-Opus

## Resumen

Mistral-Nemo-Inst-2407-12B-Thinking-Uncensored-HERETIC-HI-Claude-Opus es un fine-tune de Mistral Nemo Instruct 12B (modelo base mistralai/Mistral-Nemo-Instruct-2407) publicado en HuggingFace por cyan1143, aunque la model card original pertenece a DavidAU. El modelo combina dos intervenciones: un proceso de abliteración (de-censura) que reduce las negativas de 87/100 a 14/100, y un fine-tune con el dataset TeichAI/claude-4.5-opus-high-reasoning-250x que añade capacidades de razonamiento explícito ("thinking") inspiradas en Claude Opus 4.5.

El resultado es un modelo de 12,2 mil millones de parámetros orientado a escritura creativa, roleplay y generación de ficción sin restricciones, con bloques de razonamiento compactos de 300 a 600 tokens que se autogeneran sin necesidad de system prompt. Soporta una ventana de contexto de 128k a 256k tokens (hasta 1 millón según la model card) y cubre nueve idiomas. Está disponible en formato safetensors (bfloat16) y existen cuantizaciones GGUF de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral Nemo) |
| Parametros totales | 12.247.782.400 (12,2B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128k nativo; 256k reclamado; hasta 1M segun model card |
| Tipos de cuantizacion | bfloat16 (original); Q4KS, IQ3_M y superiores sugeridos; GGUF de terceros |
| Idiomas soportados | en, fr, de, es, it, pt, ru, zh, ja |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers); GGUF disponible via mradermacher |

## Arquitectura y entrenamiento

El modelo parte de Mistral-Nemo-Instruct-2407, un transformer decoder-only de 12,2B parametros con atencion de ventana deslizante y 128k tokens de contexto nativo. Sobre esta base se aplicaron dos etapas: primero, un proceso de abliteracion que elimina gran parte del comportamiento de rechazo del modelo original, reduciendo las negativas de 87/100 a 14/100; segundo, un fine-tune con Unsloth sobre el dataset TeichAI/claude-4.5-opus-high-reasoning-250x, que contiene ejemplos de razonamiento de alto nivel de Claude Opus 4.5.

El fine-tune convierte al modelo en un "modelo pensante": genera bloques de razonamiento de 3 a 6 parrafos (300-600 tokens) de forma automatica, sin necesidad de system prompt. Segun la model card, la activacion del razonamiento no se ve afectada por la temperatura (funciona de 0.1 a 2.5 o mas), y la complejidad del prompt determina la profundidad del bloque de razonamiento. No se han publicado detalles sobre el numero total de tokens de entrenamiento ni la composicion exacta del dataset mas alla de su origen.

## Capacidades

- Generacion de texto creativo: prosa vivida y detallada, con enfasis en descripciones intensas y narrativa inmersiva.
- Razonamiento explicito ("thinking"): genera bloques de razonamiento de 300-600 tokens antes de responder, mejorando la calidad y coherencia de la salida.
- Escritura de ficcion: soporta multiples generos (horror, romance, ciencia ficcion, fantasia) y formatos (narracion en primera persona, escenas, dialogos).
- Roleplay: diseñado para interaccion conversacional de personajes, con soporte para contextos largos.
- Generacion de tramas y subtramas: puede crear estructuras narrativas completas.
- Continuacion de escenas: capaz de continuar una escena existente manteniendo el tono y estilo.
- Sin censura: contenido NSFW, lenguaje explicito y temas tabu sin restricciones.
- Multilingue: nueve idiomas soportados (ingles, frances, aleman, español, italiano, portugues, ruso, chino, japones).
- Tool calling: no documentado explicitamente en la model card.

## Casos de uso

- Escritura creativa de ficcion: el modelo genera prosa vivida y detallada en multiples generos (horror, romance, ciencia ficcion). Su razonamiento previo a la generacion mejora la coherencia narrativa y la profundidad descriptiva, siendo adecuado para autores que buscan un asistente de escritura sin restricciones tematicas.
- Roleplay en plataformas de chat: integrable en Silly Tavern, KoboldCpp o text-generation-webui para sesiones de roleplay con personajes. Su ventana de contexto de 128k+ permite mantener conversaciones largas con historial extenso, y la ausencia de censura permite escenarios adultos o violentos.
- Generacion de tramas y subtramas: puede desglosar una historia en arcos narrativos, subtramas y puntos de giro. El bloque de razonamiento previo ayuda a estructurar la trama antes de generar el texto final.
- Continuacion de escenas: dado un fragmento existente, el modelo continua la escena manteniendo el tono, estilo y perspectiva (por ejemplo, narracion en primera persona). Util para escritores que necesitan superar bloqueos creativos.
- Chat sin restricciones: para aplicaciones de conversacion libre donde se requiere que el modelo no rechace temas controvertidos. Su tasa de rechazo de 14/100 lo hace adecuado para entornos donde la moderacion excesiva es un problema.
- Generacion de contenido narrativo para juegos: creacion de dialogos, descripciones de escenarios y misiones para juegos de rol de mesa o videojuegos, aprovechando la capacidad de mantener coherencia en contextos largos.

## Benchmarks y rendimiento

La model card indica explicitamente que los benchmarks no se han actualizado tras el fine-tune de razonamiento. Los datos publicados corresponden al modelo base Mistral-Nemo-Instruct-2407:

| Benchmark | Score |
|---|---|
| HellaSwag (0-shot) | 83,5% |
| Winogrande (0-shot) | 76,8% |
| OpenBookQA (0-shot) | 60,6% |
| CommonSenseQA (0-shot) | 70,4% |
| TruthfulQA (0-shot) | 50,3% |
| MMLU (5-shot) | 68,0% |
| TriviaQA (5-shot) | 73,8% |
| NaturalQuestions (5-shot) | 31,2% |

Benchmarks multilingues (MMLU):

| Idioma | Score |
|---|---|
| Frances | 62,3% |
| Aleman | 62,7% |
| Español | 64,6% |
| Italiano | 61,3% |
| Portugues | 63,3% |
| Ruso | 59,2% |
| Chino | 59,0% |
| Japones | 59,0% |

No se dispone de benchmarks especificos del fine-tune (razonamiento, escritura creativa, etc.).

## Requisitos de hardware

- VRAM estimada: ~24,5 GB en bfloat16 (tamaño del repo); ~7-8 GB con cuantizacion Q4KS; ~6-7 GB con IQ3_M.
- GPU recomendadas: A100 o H100 para bfloat16 sin cuantizar; RTX 3090, RTX 4090 o superiores para cuantizaciones Q4/Q5/Q6.
- Compatible con GPU de consumo: si, con cuantizacion (Q4KS o IQ3_M) cabe en GPUs de 8-12 GB VR
