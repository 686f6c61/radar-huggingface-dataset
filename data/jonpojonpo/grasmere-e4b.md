# jonpojonpo/Grasmere-E4B

## Resumen
Grasmere-E4B es un ajuste fino (finetune) del modelo google/gemma-4-E4B-it desarrollado por el usuario jonpojonpo, orientado a dar soporte de alta calidad a cuatro lenguas celtas: galés (cy), irlandés (ga), gaélico escocés (gd) y escocés (sco), manteniendo el inglés. El modelo resuelve el problema de la baja competencia de los modelos pequeños en lenguas de bajos recursos, y lo hace con un presupuesto de cómputo mínimo: un único RTX 4090 y menos de cuatro días de trabajo. Se publica bajo licencia Apache 2.0.

El modelo tiene 7.996.156.490 parámetros totales (aproximadamente 8 mil millones) y se distribuye en formato safetensors, con un repositorio de 16 GB. Se ofrece en dos variantes: Grasmere-E4B, la de mayor puntuación en benchmarks, y Grasmere-E4B-FTPO, que incorpora una corrección específica contra bucles de repetición y que el autor recomienda para uso cotidiano.

Su relevancia actual radica en que demuestra que un ajuste fino bien diseñado, con filtrado de datos cuidadoso y datos sintéticos verificados por script, puede superar a modelos entrenados con mucho más hardware en tareas concretas de lenguas minorizadas. En CymraegBench alcanza 50,33 de media frente a los 40,22 del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Gemma 4 E4B) |
| Parametros totales | 7.996.156.490 (~8B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q5_K_M, Q4_K_M (calibradas con importance matrix de texto celta) |
| Idiomas soportados | cy (galés), ga (irlandés), gd (gaélico escocés), sco (escocés), en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio principal); GGUF para las cuantizaciones |

## Arquitectura y entrenamiento
El modelo parte de google/gemma-4-E4B-it, un transformer decoder-only de aproximadamente 8 mil millones de parámetros. El ajuste se realizó mediante QLoRA de 4 bits con Unsloth sobre una única RTX 4090 de 24 GB. Se aplicó rsLoRA con r=128 y α=32 sobre todas las capas de atención y MLP de las capas de lenguaje, con lr 1e-4, y adicionalmente sobre la matriz de embeddings de entrada/salida compartida con lr 1e-5 (receta heredada de EryriLabs v4). La configuración usó micro-batch de 2 con acumulación de gradiente de 16, longitud de secuencia 2048 y 601 pasos, lo que equivale a 39,3 millones de tokens en 253 minutos, con pérdida final de 2,19.

La mezcla de datos de preentrenamiento continuado fue aproximadamente un 75% galés y un 21% irlandés y gaélico, sin texto en inglés. Las fuentes incluyeron FineWeb-2, PDFs, tweets, datos del Senedd y galés hablado (con triple peso), entre otras. El texto web y PDF se filtró por calidad mediante un profesor Gemma-4-12B-it que puntuó 33.000 documentos en una escala de 0 a 5. Posteriormente se aplicó SFT en dos fases: una primera de instrucciones generales (que elevó CymraegBench de 40,2 a 47,6) y una segunda centrada en precisión de instrucciones y tool calling (6.900 filas verificadas por script y filtradas con Haiku), que llevó la puntuación a 50,3. No se menciona el uso de RLHF ni DPO.

## Capacidades
- Generación de texto conversacional en galés, irlandés, gaélico escocés, escocés e inglés.
- Seguimiento de instrucciones precisas, incluyendo restricciones de formato como "exactamente 3 viñetas" o extracción de entidades en JSON.
- Citas y resumen de fuentes con longitud exacta y citas literales verificadas.
- Tool calling / function calling en las cuatro lenguas celtas, con selección correcta de herramienta y argumentos.
- Comprensión y traducción entre inglés y las lenguas celtas (con debilidades conocidas al traducir hacia irlandés y gaélico escocés).
- Razonamiento y matemáticas básicas, aunque no es el foco principal del ajuste.
- Capacidad multilingüe limitada a los cinco idiomas declarados más el inglés heredado del modelo base.
- No se documenta soporte de visión, audio ni modo de razonamiento extendido (thinking mode) en la información disponible.

## Casos de uso
- Atención al cliente en galés: el modelo puede mantener conversaciones multi-turno y responder con precisión en galés, lo que lo hace adecuado para administraciones públicas y empresas que operan en Gales y necesitan cumplir con requisitos lingüísticos oficiales.
- Asistentes de tool calling para servicios públicos: con una tasa de acierto del 100% en galés y gaélico escocés y del 88% en irlandés y escocés en la evaluación del autor, puede integrarse en asistentes que consulten APIs (horarios de trenes, trámites, meteorología) a partir de peticiones en lengua celta.
- Traducción y postedición en gales: con chrF de 49,9 en en→cy y 64,9 en cy→en sobre FLORES+, es útil como primera pasada en flujos de traducción asistida, siempre con revisión humana.
- Extracción de entidades y estructuración de documentos: su capacidad para generar JSON con entidades extraídas y resúmenes de longitud exacta lo hace apto para procesar actas del Senedd, documentos PDF y corpus administrativos en galés.
- Generación de contenido editorial en galés: redacción de borradores, resúmenes y respuestas con citas literales de fuentes, útil para medios y organismos que publican en galés.
- Investigación en lenguas celtas: sirve como modelo base para experimentos de NLP en irlandés, gaélico escocés y escocés, aunque con las limitaciones conocidas en la generación hacia esas lenguas.
- Educación lingüística: puede generar ejercicios, correcciones y explicaciones en galés e inglés, aprovechando su capacidad de seguir instrucciones de formato estrictas.

## Benchmarks y rendimiento

CymraegBench (galés generativo; temperatura 0, mínimo de 512 tokens, thinking desactivado, Q8_0, llama.cpp):

| Modelo | Overall | Reasoning | Practical Welsh | Translation BLEU |
|---|---|---|---|---|
| Grasmere, media de 3 muestras | 50,33 | 53,4 | 47,3 | 45,1 |
| Grasmere semilla 1 / 2 / 3 | 50,56 / 50,36 / 50,06 | no disponible | no disponible | no disponible |
| EryriLabs gemma-4-e4b-cymraeg-v4 (leaderboard) | 49,70 | no disponible | no disponible | no disponible |
| EryriLabs v4, ejecución local del autor (semilla 1) | 49,88 | 51,55 | 48,22 | 40,67 |
| Grasmere-E4B-FTPO (semilla 1) | 50,14 | 52,83 | 47,44 | 41,81 |
| Gemma 4 E4B-it (stock, semilla 1) | 40,22 | 39,43 | 41,00 | 26,67 |

Evaluación de habilidades (script-scored, sin modelo juez):

| Tarea | Gemma 4 E4B-it | Grasmere |
|---|---|---|
| Tool calls correctos (cy / ga / gd / sco, 8 cada uno) | 75 / 75 / 38 / 50 % | 100 / 88 / 100 / 88 % |
| Cita literal + resumen de longitud exacta, JSON (cy / ga / gd) | 50 / 20 / 27 % | 87 / 87 / 90 % |
| Exactamente 3 viñetas; extracción de entidades JSON | 0–100 % | 100 % |
| FLORES+ chrF en→cy / cy→en | 40,2 / 51,1 | 49,9 / 64,9 |
| FLORES+ chrF ga→en / gd→en | 46,0 / 39,1 | 52,2 / 44,2 |
| FLORES+ chrF en→ga / en→gd | 34,6 / 31,5 | 31,9 / 28,6 |

Las cuantizaciones Q5_K_M y Q4_K_M publicadas quedan a unos 2 puntos de Q8_0, gracias a la calibración con importance matrix de texto celta; sin ella, el 4-bit perdía más de 3 puntos.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 16 GB en bf16 (8B parámetros × 2 bytes), unos 8,5 GB en Q8_0, unos 5,5 GB en Q5_K_M y unos 4,5 GB en Q4_K_M, más overhead de contexto.
- GPU recomendadas: RTX 4090 (24 GB) para bf16 o Q8_0 con contexto amplio; A100 o H100 para despliegues de producción en bf16; RTX 3090, RTX 4080 o RTX 4070 Ti para cuantizaciones de 4 y 5 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 sin cuantizar y en GPUs de 8-12 GB con Q4_K_M o Q5_K_M.
- Opciones de despliegue: llama.cpp (formato GGUF, el usado en los benchmarks), Ollama, vLLM y TGI para servir el modelo en safetensors.
- Latencia y throughput: no disponible en la información proporcionada; el autor solo documenta el tiempo de entrenamiento (253 minutos para 39,3 millones de tokens en una RTX 4090).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CymraegBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Grasmere-E4B | ~8B | no disponible | 50,33 | Apache 2.0 | Hugging Face |
| EryriLabs gemma-4-e4b-cymraeg-v4 | ~8B (derivado de Gemma 4 E4B) | no disponible | 49,70 (leaderboard) | no disponible | Hugging Face |
| Gemma 4 E4B-it (stock) | ~8B | no disponible | 40,22 | no disponible | Hugging Face |

La comparativa se limita a los modelos reportados por el autor en la model card; no se dispone de datos de otros modelos pequeños especializados en lenguas celtas en la información proporcionada.

## Limitaciones y advertencias
- La escritura en irlandés y gaélico escocés está 2-3 chrF por debajo del Gemma base al traducir hacia esas lenguas, aunque la comprensión mejora. El preentrenamiento continuado fue 76% galés y solo ~21% irlandés y gaélico, sin inglés, lo que puede debilitar la traducción hacia ellas.
- Bucles de repetición en respuestas largas de Grasmere-E4B: al 39% con temperatura 0 en respuestas libres de 512 tokens, y ~9% con muestreo normal (T 0,3, top-p 0,9, repeat penalty 1,05). La variante FTPO los reduce a 8% en greedy y 0% con muestreo, a costa de perder algo en citas (−8), traducción legislativa (−5 BLEU) y matemáticas (−4), y ganar en TruthfulQA (+4), ARC (+4) y PIQA (+3).
- Resolución de fechas relativas: expresiones como "the morn" (mañana en escocés) o "20 Samhain" ocasionalmente se resuelven al día actual.
- Los datos en escocés son escasos, por lo que la salida en escocés puede derivar hacia el inglés.
- Riesgo de alucinación inherente a los modelos de ~8B, no cuantificado en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base google/gemma-4-E4B-it, cuyos términos específicos no se detallan en la información proporcionada.
- El modelo no está ajustado para ningún benchmark concreto; las puntuaciones provienen de muestras de 100 casos que varían varios puntos entre semillas, por lo que deben interpretarse con cautela.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/jonpojonpo/Grasmere-E4B
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
