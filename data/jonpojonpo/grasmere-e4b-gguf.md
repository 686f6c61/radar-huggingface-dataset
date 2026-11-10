# jonpojonpo/Grasmere-E4B-GGUF

## Resumen

Grasmere-E4B es un modelo de chat conversacional afinado sobre Gemma 4 E4B-it, especializado en lenguas celtas: galés (cy), irlandés (ga), gaélico escocés (gd) y escocés (sco), manteniendo el inglés como lengua de soporte. Lo desarrolla el autor independiente jonpojonpo y se publica bajo licencia Apache 2.0. La versión aquí descrita es la cuantización GGUF del modelo base `jonpojonpo/Grasmere-E4B`, con un total de 7.518.069.290 parámetros y un repositorio de 19,1 GB que incluye varias cuantizaciones.

El modelo aborda un nicho poco cubierto: asistentes conversacionales competentes en lenguas celtas de bajos recursos, con capacidad de tool calling en las cuatro lenguas. Según la model card, alcanza 50,3 de media en CymraegBench (tres muestras de 100 casos), frente a 40,2 del Gemma 4 E4B-it original y 49,7 del modelo previo EryriLabs gemma-4-e4b-cymraeg-v4. El entrenamiento se realizó en menos de cuatro días sobre una única RTX 4090, con QLoRA de 4 bits y datos filtrados por calidad.

La relevancia actual reside en dos aspectos: demuestra que un ajuste cuidadoso de datos puede superar a modelos entrenados con más cómputo en dominios lingüísticos específicos, y ofrece una alternativa abierta y cuantizada para despliegue local en entornos con recursos limitados. Existe además una variante Grasmere-E4B-FTPO con un parche anti-repetición que el autor recomienda para uso diario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base Gemma 4 E4B-it), ajuste mediante QLoRA 4 bits y rsLoRA r128 α32 |
| Parámetros totales | 7.518.069.290 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el entrenamiento usó secuencias de 2.048 tokens) |
| Tipos de cuantización | GGUF; se mencionan Q8_0, Q5_K_M y Q4_K_M calibradas con importance matrix de texto celta |
| Idiomas soportados | cy (galés), ga (irlandés), gd (gaélico escocés), sco (escocés), en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 E4B-it y se somete a un preentrenamiento continuado (CPT2) con QLoRA de 4 bits mediante Unsloth sobre una RTX 4090. Se aplica rsLoRA con rango 128 y alpha 32 sobre todas las capas de atención y MLP de las capas de lenguaje, a learning rate 1e-4, más la matriz de embeddings de entrada/salida atada a learning rate 1e-5 (receta heredada de EryriLabs v4). La ejecución usó micro-batch 2 con acumulación de gradiente 16, longitud de secuencia 2.048 y 601 pasos, equivalentes a 39,3 millones de tokens en 253 minutos, con pérdida final de 2,19.

La mezcla de datos fue aproximadamente 75% galés, con proporciones menores de irlandés y gaélico escocés y sin texto en inglés (la capacidad en inglés proviene del modelo base y del replay durante el SFT). Las fuentes incluyen FineWeb-2, FinePDFs, tweets, Llywodraeth Cymru, Senedd, texto hablado galés con triple peso y corpus bancarios. El texto web y PDF se filtró por calidad mediante un profesor Gemma-4-12B-it que puntuó 33.000 documentos de 0 a 5. Posteriormente se aplicó SFT en varias iteraciones (6.900 filas verificadas por script y filtradas con Haiku) orientado a precisión de instrucciones y tool calling, lo que elevó la puntuación de CymraegBench de 48,9 a 50,3.

## Capacidades

- Generación de texto y conversación multi-turno en galés, irlandés, gaélico escocés, escocés e inglés.
- Tool calling / function calling en las cuatro lenguas celtas, con selección correcta de herramienta y argumentos (100% en cy y gd, 88% en ga y sco según la evaluación del autor).
- Citas y extracción de citas textuales con resumen de longitud exacta en formato JSON (87-90% en cy, ga y gd).
- Extracción de entidades en JSON y respuestas con formato restringido (exactamente 3 viñetas).
- Traducción bidireccional con el inglés, con mejoras notables en en→cy y cy→en según chrF de FLORES+.
- Razonamiento práctico y resolución de tareas en galés (puntuación de 53,4 en la dimensión de razonamiento de CymraegBench).
- Comprensión de irlandés y gaélico escocés, aunque la generación en esas lenguas queda por debajo del modelo base.
- No se documentan capacidades de visión, audio ni modo thinking explícito.

## Casos de uso

- Atención al cliente en galés: el modelo puede gestionar conversaciones multi-turno y responder con citas textuales de documentación oficial, útil para administraciones públicas galesas que necesitan asistencia en lengua propia.
- Asistente administrativo bilingüe cy/en: con tool calling en galés, puede consultar bases de datos, agendas o sistemas de tickets y devolver respuestas estructuradas en JSON.
- Traducción asistida de documentación institucional: la mejora en chrF en→cy (49,9 frente a 40,2 del base) lo hace adecuado para pre-traducir textos del Senedd o de organismos públicos antes de revisión humana.
- Extracción de entidades en corpus celtas: la capacidad de generar JSON con entidades extraídas permite procesar artículos, actas o transcripciones en galés e irlandés para pipelines de datos.
- Generación de resúmenes con formato controlado: la precisión en respuestas de exactamente 3 viñetas o resúmenes de longitud exacta facilita su integración en informes automatizados.
- Chatbot educativo para aprendizaje de lenguas celtas: puede mantener conversación en irlandés o gaélico escocés y citar fuentes, aunque la generación en esas lenguas es inferior al modelo base y requiere supervisión.
- Prototipado local en una sola GPU: al estar cuantizado en GGUF y caber en GPUs de consumo, sirve para experimentar con asistentes en lenguas minoritarias sin infraestructura cloud.

## Benchmarks y rendimiento

CymraegBench (generativo en galés; temperatura 0, mínimo de 512 tokens, thinking off, Q8_0, llama.cpp):

| Modelo | Overall | Reasoning | Practical Welsh | Translation BLEU |
|---|---|---|---|---|
| Grasmere, media de 3 muestras | 50,33 | 53,4 | 47,3 | 45,1 |
| Grasmere seed 1 / 2 / 3 | 50,56 / 50,36 / 50,06 | no disponible | no disponible | no disponible |
| EryriLabs gemma-4-e4b-cymraeg-v4 (leaderboard) | 49,70 | no disponible | no disponible | no disponible |
| EryriLabs v4, ejecución local (seed 1) | 49,88 | 51,55 | 48,22 | 40,67 |
| Grasmere-E4B-FTPO (seed 1) | 50,14 | 52,83 | 47,44 | 41,81 |
| Gemma 4 E4B-it stock (seed 1) | 40,22 | 39,43 | 41,00 | 26,67 |

Evaluación de habilidades (script propio, sin modelo juez):

| Métrica | Gemma 4 E4B-it | Grasmere |
|---|---|---|
| Tool calls correctos (cy / ga / gd / sco, 8 cada uno) | 75 / 75 / 38 / 50 % | 100 / 88 / 100 / 88 % |
| Cita textual + resumen de longitud exacta, JSON (cy / ga / gd) | 50 / 20 / 27 % | 87 / 87 / 90 % |
| Exactamente 3 viñetas; extracción de entidades JSON | 0–100 % | 100 % |
| FLORES+ chrF en→cy / cy→en | 40,2 / 51,1 | 49,9 / 64,9 |
| FLORES+ chrF ga→en / gd→en | 46,0 / 39,1 | 52,2 / 44,2 |
| FLORES+ chrF en→ga / en→gd | 34,6 / 31,5 | 31,9 / 28,6 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; para un modelo de ~7,5B parámetros, Q8_0 requiere del orden de 8-9 GB y Q4_K_M del orden de 4-5 GB, aunque el autor no publica cifras exactas.
- GPU recomendadas: el autor entrenó en una RTX 4090 (24 GB); para inferencia GGUF basta con GPUs de consumo con 8 GB o más según cuantización.
- Cabe en GPU de consumo: sí, en tarjetas tipo RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 con cuantizaciones Q4_K_M o Q5_K_M.
- Opciones de despliegue: llama.cpp (usado en la evaluación), y por extensión cualquier runtime compatible con GGUF; no se documentan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CymraegBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Grasmere-E4B | 7,52B | no disponible | 50,33 (media de 3) | Apache 2.0 | GGUF en HF |
| EryriLabs gemma-4-e4b-cymraeg-v4 | no disponible | no disponible | 49,70 (leaderboard) | no disponible | no disponible |
| Gemma 4 E4B-it (stock) | no disponible | no disponible | 40,22 | no disponible | no disponible |

## Limitaciones y advertencias

- La escritura en irlandés y gaélico escocés queda 2-3 puntos chrF por debajo del Gemma base al traducir hacia esas lenguas, aunque la comprensión mejora. El preentrenamiento continuado fue 76% galés y sin inglés, lo que puede afectar a la traducción hacia esas lenguas.
- Bucles de repetición en respuestas largas: en Grasmere-E4B, al 39% de respuestas largas a temperatura 0 y al 9% con muestreo normal (T 0,3, top-p 0,9, repeat penalty 1,05). La variante FTPO los reduce al 8% en greedy y 0% con muestreo, a costa de perder algo en citación, traducción legislativa y matemáticas.
- Resolución de fechas relativas: expresiones como "the morn" o "20 Samhain" pueden resolverse ocasionalmente al día actual.
- Los datos de escocés son escasos, por lo que la salida en sco puede derivar hacia el inglés.
- Riesgo de alucinación no cuantificado en la información disponible; la model card no publica tasas de TruthfulQA salvo la mejora relativa de +4 en la variante FTPO.
- Sesgos conocidos: no disponibles.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base Gemma 4 E4B-it, cuyos términos no se detallan en la información proporcionada.
- Las cuantizaciones Q5_K_M y Q4_K_M pierden unos 2 puntos frente a Q8_0; sin la importance matrix celta, el 4-bit perdía más de 3 puntos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jonpojonpo/Grasmere-E4B-GGUF
- Modelo base: https://huggingface.co/jonpojonpo/Grasmere-E4B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
