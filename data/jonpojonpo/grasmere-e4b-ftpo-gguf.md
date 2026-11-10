# jonpojonpo/Grasmere-E4B-FTPO-GGUF

## Resumen

Grasmere-E4B-FTPO-GGUF es la versión cuantizada en formato GGUF de Grasmere-E4B-FTPO, un modelo de chat conversacional derivado de Gemma 4 E4B-it y ajustado por jonpojonpo para cubrir galés (cy), irlandés (ga), gaélico escocés (gd) y escocés (sco), manteniendo el inglés. El modelo base cuenta con 7.518.069.290 parámetros (aproximadamente 7,5 mil millones) y se distribuye bajo licencia Apache 2.0. La variante FTPO incorpora una corrección específica contra los bucles de repetición que afectaban al modelo original en respuestas largas.

El modelo resuelve un problema concreto: la escasez de modelos pequeños con calidad aceptable en lenguas celtas. Según la model card, Grasmere alcanza una media de 50,33 en CymraegBench (tres muestras de 100 casos), frente a 40,22 del Gemma 4 E4B-it original y 49,70 del anterior mejor modelo pequeño conocido (EryriLabs gemma-4-e4b-cymraeg-v4). Destaca especialmente en tool calling en las cuatro lenguas celtas, con tasas de acierto de herramienta y argumentos del 100 % en galés y gaélico escocés y del 88 % en irlandés y escocés.

La relevancia actual del modelo reside en su método de producción: fue entrenado en menos de cuatro días por una sola persona con una RTX 4090 de 24 GB, sin clúster ni GPUs en la nube, con un gasto de API de unos 30 dólares. Esto demuestra que la calidad de los datos (filtrado, deduplicación, puertas de contaminación y datos sintéticos verificados por script) puede compensar la falta de cómputo. Esta ficha describe la variante GGUF, pensada para despliegue local con llama.cpp y compatible con endpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Gemma 4 E4B-it), ajuste mediante QLoRA 4-bit |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible (no es MoE según la informacion disponible) |
| Longitud de contexto | no disponible (entrenamiento con secuencias de 2.048 tokens) |
| Tipos de cuantizacion | GGUF; se mencionan Q8_0, Q5_K_M y Q4_K_M, calibrados con importance matrix de texto celta |
| Idiomas soportados | cy (galés), ga (irlandés), gd (gaélico escocés), sco (escocés), en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 19,1 GB); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 E4B-it, un transformer decoder-only de aproximadamente 7,5 mil millones de parámetros. El ajuste se realizó en dos fases sobre una única RTX 4090 mediante QLoRA de 4 bits con Unsloth. La primera fase fue un continued pretraining (CPT2) con rsLoRA de rango 128 y alpha 32 sobre todas las capas de atención y MLP de lenguaje, a learning rate 1e-4, más la matriz de embeddings de entrada/salida compartida a learning rate 1e-5 (receta heredada de EryriLabs v4). Se ejecutaron 601 pasos con micro-batch 2 y acumulación de gradiente 16, longitud de secuencia 2.048, totalizando 39,3 millones de tokens en 253 minutos, con pérdida final de 2,19.

La mezcla de datos fue aproximadamente 75 % galés (FineWeb-2 cy 10,8M, PDFs cy 7,5M, tweets cy 3,6M, Llyw 3,0M, Senedd 1,8M, web escocesa 1,5M, galés hablado 1,3M con peso triple), con irlandés (FineWeb-2 3,1M, PDFs 1,7M), gaélico escocés (FineWeb-2 2,6M, PDFs 1,4M) y escocés (FineWeb-2 0,6M, PDFs 0,3M). No se incluyó texto en inglés; la capacidad en inglés proviene del modelo base y del replay durante el SFT. El texto web y PDF se filtró por calidad mediante un profesor Gemma-4-12B-it que puntuó 33.000 documentos de 0 a 5 según fluidez y valor. La segunda fase fue un SFT de precisión de instrucciones y tool calling con 6.900 filas verificadas por script y filtradas por Haiku. La variante FTPO añade una corrección dirigida contra los bucles de repetición en respuestas largas.

## Capacidades

- Generación de texto conversacional en galés, irlandés, gaélico escocés, escocés e inglés.
- Seguimiento de instrucciones precisas, incluyendo restricciones de formato como exactamente tres viñetas o extracción de entidades en JSON.
- Citas y resúmenes con longitud exacta: en la evaluación del autor alcanza 87-90 % de acierto en galés, irlandés y gaélico escocés, frente a 20-50 % del modelo base.
- Tool calling / function calling en las cuatro lenguas celtas: 100 % de acierto en galés y gaélico escocés, 88 % en irlandés y escocés.
- Traducción bidireccional con el inglés: FLORES+ chrF de 49,9 en en→cy y 64,9 en cy→en; 52,2 en ga→en y 44,2 en gd→en.
- Razonamiento y matemáticas básicas, con rendimiento medido en CymraegBench (razonamiento 53,4 en la media de tres muestras).
- Capacidades multilingües limitadas a los cinco idiomas declarados; no se documentan visión ni audio.
- Modo thinking desactivado en la configuración de evaluación del leaderboard; no se detalla soporte explícito de modo pensamiento.

## Casos de uso

- Atención al cliente en galés: el modelo mantiene conversaciones multi-turno con instrucciones precisas y puede citar fuentes o resumir en longitud exacta, lo que lo hace adecuado para servicios públicos galeses que exigen respuestas verificables.
- Asistentes de tool calling en lenguas celtas: con tasas de acierto del 88-100 % en las cuatro lenguas, puede integrarse en agentes que consulten APIs (horarios de trenes, meteorología, trámites) a partir de peticiones en galés, irlandés, gaélico escocés o escocés.
- Traducción asistida en→cy y cy→en: con chrF de 49,9 y 64,9 respectivamente, sirve para preTraducir documentación administrativa o contenido web antes de revisión humana.
- Extracción de entidades y estructuración de datos: la evaluación muestra 100 % en extracción de entidades JSON, útil para procesar corpus de texto celta y convertirlos en bases de datos estructuradas.
- Generación de contenido editorial en galés: resúmenes con número exacto de viñetas y citas textuales verificadas, adecuado para boletines o notas de prensa con requisitos de formato estrictos.
- Despliegue local en hardware de consumo: al distribuirse en GGUF Q4_K_M y Q5_K_M con pérdida de solo unos 2 puntos frente a Q8_0, puede ejecutarse en una RTX 4090 o en equipos con 8-12 GB de VRAM para prototipos y demos offline.
- Investigación en lenguas de bajos recursos: reproducible en una sola GPU y con receta documentada, sirve como base para experimentos de continued pretraining en otras lenguas minorizadas.

## Benchmarks y rendimiento

CymraegBench (configuración del leaderboard: temperatura 0, mínimo de 512 tokens, thinking off, Q8_0, llama.cpp):

| Modelo | Overall | Razonamiento | Galés práctico | BLEU traducción |
|---|---|---|---|---|
| Grasmere, media de 3 muestras | 50,33 | 53,4 | 47,3 | 45,1 |
| EryriLabs gemma-4-e4b-cymraeg-v4 (leaderboard) | 49,70 | no disponible | no disponible | no disponible |
| EryriLabs v4, ejecución local del autor | 49,88 | 51,55 | 48,22 | 40,67 |
| Grasmere-E4B-FTPO (semilla 1) | 50,14 | 52,83 | 47,44 | 41,81 |
| Gemma 4 E4B-it original (semilla 1) | 40,22 | 39,43 | 41,00 | 26,67 |

Evaluación de habilidades del autor (script-scored, sin modelo juez):

| Tarea | Gemma 4 E4B-it | Grasmere |
|---|---|---|
| Tool calls correctos (cy / ga / gd / sco) | 75 / 75 / 38 / 50 % | 100 / 88 / 100 / 88 % |
| Cita textual + resumen de longitud exacta, JSON (cy / ga / gd) | 50 / 20 / 27 % | 87 / 87 / 90 % |
| Exactamente 3 viñetas; extracción de entidades JSON | 0-100 % | 100 % |
| FLORES+ chrF en→cy / cy→en | 40,2 / 51,1 | 49,9 / 64,9 |
| FLORES+ chrF ga→en / gd→en | 46,0 / 39,1 | 52,2 / 44,2 |
| FLORES+ chrF en→ga / en→gd | 34,6 / 31,5 | 31,9 / 28,6 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para 7,5 mil millones de parámetros en GGUF, Q8_0 requiere aproximadamente 8 GB, Q5_K_M unos 5,5 GB y Q4_K_M unos 4,5 GB (estimación orientativa, no confirmada en la model card).
- GPU recomendadas: el autor entrenó con una RTX 4090 de 24 GB; para inferencia son suficientes GPUs consumer con 8-12 GB de VRAM.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, así como en Apple Silicon con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, y endpoints compatibles (tag endpoints_compatible); no se mencionan vLLM ni TGI para esta variante GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CymraegBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Grasmere-E4B-FTPO | 7,5B | no disponible | 50,33 (media de 3) | Apache 2.0 | GGUF y safetensors en HF |
| EryriLabs gemma-4-e4b-cymraeg-v4 | ~7,5B (base Gemma 4 E4B) | no disponible | 49,70 (leaderboard) | no disponible en la información | HF |
| Gemma 4 E4B-it | ~7,5B | no disponible | 40,22 | licencia Gemma (no confirmada) | HF |

No se dispone de datos de benchmarks de otros modelos pequeños para lenguas celtas en la información proporcionada.

## Limitaciones y advertencias

- Escritura en irlandés y gaélico escocés: 2-3 chrF por debajo del Gemma original al traducir hacia esas lenguas, aunque la comprensión mejora. El continued pretraining fue 76 % galés y sin texto en inglés, lo que puede debilitar la traducción hacia irlandés y gaélico.
- Bucles de repetición: Grasmere-E4B sin FTPO presentaba bucles en el 39 % de respuestas largas a temperatura 0 y 9 % con muestreo normal; la variante FTPO los reduce al 8 % en greedy y 0 % con muestreo, a costa de cierta pérdida en algunas tareas (cita −8, BLEU legislativo −5, matemáticas −4).
- Fechas relativas: expresiones como "the morn" en escocés o "20 Samhain" se resuelven ocasionalmente al día actual.
- Escocés: los datos son escasos, por lo que la salida puede derivar hacia el inglés.
- Riesgo de alucinación: no cuantificado en la información disponible; el modelo cita fuentes, pero no se documenta una tasa de fidelidad factual.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma 4 E4B-it puede estar sujeto a la licencia Gemma; conviene verificar la compatibilidad antes de producción.
- Contexto: no se documenta la longitud máxima de contexto del modelo base ni de la variante GGUF; el entrenamiento usó secuencias de 2.048 tokens.
- Idiomas: fuera de los cinco declarados, el rendimiento no está evaluado.

## Enlaces

- Hugging Face: https://huggingface.co/jonpojonpo/Grasmere-E4B-FTPO-GGUF
- Modelo base: https://huggingface.co/jonpojonpo/Grasmere-E4B-FTPO
- Gemma 4 E4B-it (modelo de partida): no disponible en la información proporcionada
- EryriLabs gemma-4-e4b-cymraeg-v4: no disponible en la información proporcionada
- CymraegBench / AIsteddfod: no disponible en la información proporcionada
- Repositorio de llama.cpp: no disponible en la información proporcionada
