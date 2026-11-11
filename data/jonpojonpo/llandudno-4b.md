# jonpojonpo/Llandudno-4B

## Resumen

Llandudno-4B es un modelo de chat orientado al galés (cymraeg) desarrollado por jonpojonpo, un autor individual que lo entrenó en el Reino Unido sobre una única RTX 4090. Se trata de un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-4B, con 4.659.865.088 parámetros totales y una licencia Apache 2.0. El objetivo es mejorar sustancialmente el rendimiento en galés —razonamiento, traducción, registro formal e informal y conciencia de las variantes dialectales del norte (Gog) y del sur (Hwntw)— sin sacrificar las capacidades modernas del modelo original.

El modelo conserva las características de Qwen3.5: modo de razonamiento (thinking), tool calling nativo, contexto largo de 64K o más, visión con OCR y una cabeza de predicción multi-token (MTP) para decodificación especulativa. Además de galés, cubre inglés, irlandés, gaélico escocés y scots, aunque solo el galés y el inglés han sido evaluados de forma separada. Su relevancia radica en que, según los datos del autor, iguala el rendimiento de Qwen3.5-9B en la suite CymraegBench con menos de la mitad de parámetros, y supera a modelos de mayor tamaño especializados en galés.

La ficha se basa exclusivamente en la información disponible en la model card y en los metadatos de Hugging Face. Varios datos técnicos (composición completa del corpus, detalles de RLHF/DPO, benchmarks estándar como MMLU o HumanEval en inglés) no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5 (atención completa y Gated-DeltaNet, con cabeza MTP para decodificación especulativa) |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 64K+ (evaluado con aguja en 8K, 32K y 64K) |
| Tipos de cuantizacion | BF16, Q8_0 (GGUF); otras no disponibles |
| Idiomas soportados | cy (galés), en (inglés), ga (irlandés), gd (gaélico escocés), sco (scots) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 9,3 GB); GGUF Q8_0 mencionado en las evaluaciones |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base y se somete a un preentrenamiento continuado (CPT) mediante un adaptador LoRA en bf16 con rango 64, aplicado a las proyecciones de atención completa, Gated-DeltaNet y a las MLP. La torre de visión y la cabeza MTP no se modifican. El entrenamiento usó secuencias de 2.048 tokens, learning rate 1e-4 con decaimiento coseno, durante 1.043 pasos, lo que equivale a 68,4 millones de tokens procesados en aproximadamente 5,4 horas en una RTX 4090 de 24 GB.

El corpus de entrenamiento, denominado "q1", combina texto web, PDF y habla filtrados por calidad en galés, irlandés, gaélico y scots (104,8 millones de caracteres, mezcla Grasmere v2), texto paralelo cy↔en del Senedd y del Gobierno de Gales (60,0 millones de caracteres) y datos británicos adicionales cuyo detalle completo no está disponible en la información proporcionada. No se especifica si hubo fases de RLHF o DPO. La innovación técnica destacable es la conservación de la cabeza MTP para decodificación especulativa (tasa de aceptación de borradores de 0,50) y del soporte nativo de tool calling y modo thinking del modelo base.

## Capacidades

- Generación de texto y razonamiento en galés e inglés, con modo thinking activable.
- Traducción cy↔en, incluida traducción de textos legislativos (BLEU de 47,71 en la suite de traducción legislativa).
- Tool calling / function calling nativo, con puntuaciones de 0,88 (thinking off) y 0,94 (thinking on) en la evaluación del autor.
- Razonamiento multi-paso y soporte de agentes mediante tool calling.
- Contexto largo: recuperación perfecta (1,00) en pruebas de aguja a 8K, 32K y 64K tokens.
- Visión con OCR (tasa de error de caracteres de 0,01).
- Decodificación especulativa mediante cabeza MTP (aceptación de borradores de 0,50).
- Capacidades multilingües en galés, inglés, irlandés, gaélico escocés y scots (estos tres últimos entrenados pero no evaluados por separado).
- Reconocimiento de las variantes dialectales Gog (norte) y Hwntw (sur) del galés, aunque no replica el dialecto del usuario en sus respuestas.

## Casos de uso

- Atención al cliente en galés: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 64K tokens, adecuado para historiales largos de clientes y consultas en galés formal o informal.
- Traducción legislativa y administrativa cy↔en: su BLEU de 47,71 en traducción legislativa y su entrenamiento con texto del Senedd y del Gobierno de Gales lo hacen útil para borradores de documentos bilingües.
- Generación de código con tool calling: al conservar el soporte nativo de function calling de Qwen3.5, puede integrarse en pipelines que requieran invocar herramientas externas.
- Procesamiento de documentos con OCR: la torre de visión con tasa de error de 0,01 permite extraer texto de imágenes y PDF escaneados en galés o inglés.
- Asistentes de razonamiento con contexto largo: la recuperación perfecta a 64K tokens lo hace apto para análisis de documentación extensa o expedientes completos.
- Educación y corrección gramatical en galés: el modelo mejora la gramática galesa y el registro formal/informal (de 50 a 71 en la evaluación del autor), útil para herramientas de escritura.
- Moderación de contenido en galés con cautela: el modelo explica slang y palabrotas con franqueza, pero el autor advierte de que la variante 9B no debe usarse como filtro de profanidad; en la 4B el rendimiento en esa suite es de 83 frente a 86 del modelo base.

## Benchmarks y rendimiento

Resultados en CymraegBench (harness del leaderboard AIsteddfod; BF16 en vLLM, ventana de 4.096 tokens, 4 peticiones concurrentes, thinking off, temperatura 0, semilla 1, hasta 100 casos por suite):

| Modelo | Overall | Reasoning | Practical Welsh | Translation BLEU |
|---|---|---|---|---|
| Llandudno-9B | 58,07 | 63,91 | 52,22 | 49,72 |
| Llandudno-4B | 55,36 | 53,72 | 57,00 | 47,71 |
| Qwen3.5-9B stock (rerun del autor) | 55,20 | 58,29 | 52,11 | 37,04 |
| Qwen3.5-9B stock (leaderboard oficial) | 55,10 | 57,98 | 52,22 | 37,06 |
| EryriLabs Gemma 4 12B Cymraeg v6 | 52,70 | no disponible | no disponible | no disponible |
| Qwen3.5-4B stock (Q8_0, media de 3 semillas) | 52,39 | 48,32 | 56,45 | 28,10 |
| EryriLabs Gemma 4 E4B Cymraeg v4 | 49,70 | no disponible | no disponible | no disponible |
| Qwen2.5-7B-Instruct (Q8_0) | 41,26 | 32,19 | 50,33 | 14,54 |

Evaluación de características modernas (features_eval del autor, Q8_0):

| Métrica | Qwen3.5-4B stock | Llandudno-4B | Qwen3.5-9B stock | Llandudno-9B |
|---|---|---|---|---|
| Aguja en contexto largo (8K/32K/64K) | 1,00/1,00/1,00 | 1,00/1,00/1,00 | 1,00/1,00/1,00 | 1,00/1,00/1,00 |
| Tool calls, thinking off/on | 0,88/1,00 | 0,88/0,94 | 0,75/1,00 | 1,00/1,00 |
| Thinking: respuestas/cierra `</think>` | 0,88/1,00 | 0,62/0,62 | 0,50/0,62 | 0,88/0,88 |
| OCR: tasa de error de caracteres | 0,01 | 0,01 | 0,01 | 0,01 |
| Aceptación de borradores MTP | 0,50 | 0,50 | 0,40 | 0,47 |

Espejo de dialecto (dialect_eval del autor, 40 aperturas de chat informales Gog/Hwntw):

| Modelo | Replica el dialecto del usuario | Gog | Hwntw |
|---|---|---|---|
| Claude Opus 5 / Sonnet 5.5 / Gemini 3.8 Flash | 52% | 10-12/20 | 9-11/20 |
| GLM-5.3 | 40% | 7/20 | 9/20 |
| EryriLabs E4B v4 | 22% | 7/20 | 2/20 |
| Qwen3.5-4B / 9B stock | 5-8% | no disponible | no disponible |
| Llandudno-4B | 8% | 1/20 | 2/20 |
| Llandudno-9B | 12% | 1/20 | 4/20 |

Ejecuciones GGUF Q8_0 en llama.cpp (semilla 1) quedan a aproximadamente un punto: Llandudno-9B 57,84 y Llandudno-4B 56,36. Las ejecuciones individuales de 100 casos varían en torno a ±1 punto.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, los 4,66 mil millones de parámetros requieren aproximadamente 9,3 GB de pesos, más overhead de contexto y caché KV; en Q8_0, en torno a 5 GB. No se proporcionan cifras oficiales de VRAM en la información disponible.
- GPU recomendadas: el autor entrenó en una RTX 4090 de 24 GB; para inferencia en BF16 una GPU de 24 GB es suficiente, y en Q8_0 cabe en GPUs consumer de 8-12 GB.
- Cabe en GPU consumer: sí, en RTX 4090, RTX 3090 y previsiblemente en modelos de 12 GB o más con cuantización Q8_0 o inferior.
- Opciones de despliegue: vLLM (usado en las evaluaciones del autor), llama.cpp (usado con GGUF Q8_0), y previsiblemente otras herramientas compatibles con safetensors y GGUF; Ollama y TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles. La cabeza MTP permite decodificación especulativa con una tasa de aceptación de 0,50, lo que puede mejorar el throughput, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Overall CymraegBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llandudno-4B | 4,66B | 64K+ | 55,36 | Apache 2.0 | Hugging Face |
| Qwen3.5-4B stock | 4B (aproximado) | 64K+ | 52,39 | no disponible en la información | Hugging Face |
| Qwen3.5-9B stock | 9B (aproximado) | 64K+ | 55,10-55,20 | no disponible en la información | Hugging Face |
| EryriLabs Gemma 4 12B Cymraeg v6 | 12B (aproximado) | no disponible | 52,70 | no disponible en la información | Hugging Face |
| EryriLabs Gemma 4 E4B Cymraeg v4 | 4B (aproximado) | no disponible | 49,70 | no disponible en la información | Hugging Face |

Llandudno-4B iguala a Qwen3.5-9B stock en la métrica global con menos de la mitad de parámetros y supera a los modelos especializados en galés de EryriLabs de 12B y 4B. La licencia Apache 2.0 facilita el uso comercial frente a alternativas cuya licencia no está confirmada en la información disponible.

## Limitaciones y advertencias

- Detección de palabrotas en galés: en la suite de obscenidades de CymraegBench, Llandudno-9B obtiene 15 frente a 33 del stock 9B; el 4B obtiene 83 frente a 86 del stock 4B. El autor advierte de que la variante 9B no debe usarse como filtro de profanidad; la 4B es más fiable en esta tarea pero no perfecta.
- Modo thinking en la variante 4B: cierra su razonamiento limpiamente solo el 62% de las veces, frente al 100% del stock 4B. Para producción se recomienda mantener el thinking desactivado o limitar el presupuesto de razonamiento.
- Irlandés, gaélico escocés y scots: entrenados pero no evaluados por separado en esta ronda, por lo que su rendimiento real es desconocido.
- Dialecto: las respuestas son mayoritariamente en galés estándar incluso cuando el usuario escribe en Gog o Hwntw, y ocasionalmente se mezclan formas del norte y del sur. El espejo de dialecto es solo del 8% en la variante 4B.
- MGSM (matemáticas en galés): la puntuación es baja porque el modelo obedece la instrucción de la suite de responder solo con el número final, sin explicación; el autor decidió no entrenarlo para desobedecer instrucciones de formato.
- Riesgo de alucinación: no se documenta explícitamente en la información proporcionada, pero es inherente a los modelos de lenguaje.
- Sesgos conocidos: no documentados en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de la licencia del modelo base Qwen3.5-4B, no detallada en la información disponible.
- El modelo fue entrenado por una sola persona en aproximadamente dos días, con sesiones de Claude Code para ingeniería de datos, evaluación y entrenamiento; la escala limitada del ajuste condiciona la profundidad de las mejoras.

## Enlaces

- Hugging Face: https://huggingface.co/jonpojonpo/Llandudno-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Leaderboard AIsteddfod / CymraegBench: no disponible en la información proporcionada
- Paper o blog técnico: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
