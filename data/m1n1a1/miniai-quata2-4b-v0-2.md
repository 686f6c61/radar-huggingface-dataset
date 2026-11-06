# M1n1A1/MiniAI-Quata2-4b-v0.2

## Resumen

MiniAI Quata2 4B v0.2 es un modelo de lenguaje compacto desarrollado por MiniAI (Belgrado, Serbia) a partir de Qwen3.5-4B. El modelo combina un preentrenamiento continuado en serbio (aproximadamente 50 millones de tokens en alfabeto latino y cirílico, junto con texto en inglés) con un ajuste fino supervisado de unos 31.000 ejemplos que cubren chat, agentes, tool calling, código, matemáticas, seguimiento de instrucciones y trazas de razonamiento verificadas. El resultado se mezcla al 80/20 con los pesos originales de Qwen3.5-4B mediante WiSE-FT para recuperar el rendimiento general del modelo base sin perder las capacidades nuevas.

El modelo declara 5.174.964.736 parámetros en safetensors (aunque se comercializa como "4B") y está orientado a despliegues en hardware modesto: según el autor, funciona en una única GPU de 8 GB y ocupa aproximadamente 2,8 GB en cuantización Q4_K_M. Su propuesta de valor es doble: por un lado, igualar a su base en benchmarks generales y superarlo en tool calling (BFCL 88,7 % frente a 85,2 %); por otro, ofrecer un soporte sólido de serbio, croata y bosnio, idiomas habitualmente infrarrepresentados en modelos de este tamaño.

La relevancia actual del modelo reside en su enfoque de "modelo pequeño con identidad y capacidades de agente": incluye modo thinking con hasta 32k tokens de razonamiento, tool calling verificado y una mezcla de pesos que mitiga la degradación típica del ajuste fino en modelos pequeños. Está publicado bajo licencia Apache 2.0, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-4B) |
| Parametros totales | 5.174.964.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modo thinking admite hasta 32k tokens de razonamiento) |
| Tipos de cuantizacion | GGUF (incluye Q4_K_M); safetensors en precision original |
| Idiomas soportados | en, sr, hr, bs |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only heredado de Qwen3.5-4B. El proceso de construcción se articula en tres fases. Primero, un preentrenamiento continuado en serbio (latín y cirílico) e inglés con aproximadamente 50 millones de tokens, que da lugar al checkpoint intermedio `M1n1A1/MiniAI-Quata2-4b-v0.2-base`. Segundo, un ajuste fino supervisado sobre unos 31.000 ejemplos que cubren conversación, agentes, tool calls, código, seguimiento de instrucciones, matemáticas, serbio, incertidumbre e identidad, complementado con trazas de razonamiento paso a paso verificadas. Tercero, una mezcla de pesos (WiSE-FT) al 80 % de los pesos ajustados y 20 % de Qwen3.5-4B original, motivada porque el ajuste fino puro perdía rendimiento en MMLU-Pro, GSM8K y seguimiento de instrucciones respecto al base.

El autor no detalla la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO; la información disponible solo menciona ajuste fino supervisado y trazas de razonamiento verificadas. Tampoco se especifica la longitud de contexto nativa del modelo ni innovaciones arquitectónicas propias más allá de la mezcla de pesos. El entrenamiento se realizó íntegramente en una única GPU de 8 GB, lo que condiciona el alcance del proyecto.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, serbio, croata y bosnio.
- Razonamiento explícito en modo thinking, con hasta 32k tokens de cadena de pensamiento (mejora MATH-500 de 79,4 a 95,0 y GPQA Diamond de 39,9 a 62,6).
- Tool calling y function calling, con un 88,7 % en BFCL, por encima de su modelo base.
- Ejecución de tareas de agente de varios pasos: 85,4 % de tareas reales con herramientas resueltas y 78,4 % en tareas multi-paso según las comprobaciones propias del autor.
- Generación de código (HumanEval+ 77,4, MBPP+ 66,9) y matemáticas (GSM8K 85,6, MATH-500 79,4 sin thinking).
- Seguimiento de instrucciones estrictas (IFEval 78,8 en modo estricto).
- Identidad propia sin system prompt: el modelo se identifica como Quata2 en el 100 % de 300 pruebas.
- Capacidad de mantener una respuesta correcta bajo presión del usuario (75,0 % frente a 65,0 % del base) y de corregir errores cuando se le confronta (80,0 %).
- Capacidades multimodal imagen-texto declaradas en los tags de Hugging Face (`image-text-to-text`), aunque no se detallan en la model card.
- Conocimiento específico sobre Serbia y los Balcanes (75,0 % en hechos sobre Serbia frente a 62,5 % del base).

## Casos de uso

- Atención al cliente en serbio, croata o bosnio: el modelo mantiene el rol de persona de cliente en el 100 % de las pruebas y gestiona conversaciones multi-turno, lo que lo hace adecuado para asistentes virtuales en mercados balcánicos donde los modelos grandes suelen tener un soporte superficial.
- Agentes con herramientas en producción: con un 88,7 % en BFCL y un 85,4 % de tareas de agente resueltas, puede integrarse en pipelines que requieran llamadas a APIs, consultas a bases de datos o automatización de flujos con múltiples pasos.
- Generación y revisión de código en entornos con recursos limitados: sus resultados en HumanEval+ y MBPP+ permiten usarlo como asistente de programación local en una GPU de 8 GB, por ejemplo en estaciones de trabajo de desarrollo o en CI/CD para tareas de autocompletado y generación de tests.
- Razonamiento matemático con verificación: el modo thinking eleva MATH-500 al 95,0 % y AIME 2024+2025 al 51,7 %, útil para tutoría matemática, resolución de problemas paso a paso o generación de explicaciones didácticas.
- Procesamiento de documentación en idiomas eslavos del sur: traducción, resumen y extracción de información de textos en serbio (latín y cirílico), croata y bosnio, aprovechando el preentrenamiento continuado específico.
- Despliegue en el borde o en hardware de consumo: con aproximadamente 2,8 GB en Q4_K_M, puede ejecutarse en portátiles, mini-PC o dispositivos con GPU integrada para asistentes offline y privados.
- Moderación y clasificación con incertidumbre: el ajuste incluye ejemplos de incertidumbre y el modelo muestra capacidad de mantener respuestas correctas bajo presión, lo que resulta útil en tareas de verificación de hechos o clasificación con abstención.

## Benchmarks y rendimiento

Resultados publicados por el autor con el mismo harness, prompts y muestras para todos los modelos, GGUF Q4_K_M en llama.cpp y sin system prompt (thinking off salvo indicación).

| Benchmark | Quata2 4B v0.2 | Qwen3.5 4B (base) | Qwen3 4B 2507 | Gemma 4 E4B |
|---|---:|---:|---:|---:|
| MMLU | 73,0 | 70,6 | 64,6 | 65,0 |
| MMLU-Redux 2.0 | 75,4 | 75,4 | 72,4 | 68,8 |
| MMLU-Pro | 68,7 | 71,3 | 66,3 | 66,0 |
| GPQA Diamond | 39,9 | 37,4 | 29,3 | 40,4 |
| SuperGPQA | 35,7 | 33,0 | 29,7 | 32,3 |
| ARC-Challenge | 91,6 | 92,4 | 92,0 | 89,2 |
| HellaSwag | 86,0 | 86,0 | 84,6 | 80,6 |
| Winogrande | 66,2 | 63,6 | 60,4 | 64,6 |
| TruthfulQA (MC1) | 71,0 | 73,0 | 67,0 | 66,2 |
| BIG-Bench Hard | 76,0 | 75,3 | 67,2 | 78,3 |
| MuSR | 52,1 | 49,6 | 37,1 | 61,7 |
| DROP (F1) | 60,5 | 63,8 | 34,5 | 37,6 |
| GSM8K | 85,6 | 86,6 | 88,8 | 86,4 |
| MATH-500 | 79,4 | 80,2 | 77,2 | 77,2 |
| IFEval (strict) | 78,8 | 82,3 | 83,6 | 84,7 |
| BFCL tool calling | 88,7 | 85,2 | 91,7 | 89,9 |
| HumanEval+ | 77,4 | 75,6 | 84,8 | 85,4 |
| MBPP+ | 66,9 | 64,8 | 63,0 | 67,5 |
| Belebele Serbian | 86,6 | 84,6 | 84,2 | 86,8 |
| Belebele Croatian | 85,0 | 84,0 | 83,2 | 87,0 |
| Global-MMLU Serbian | 60,0 | 58,4 | 50,0 | 51,8 |
| MMLU-ProX Serbian | 55,0 | 58,3 | 52,0 | 56,3 |

Modo thinking (hasta 32k tokens, sampling 0,6 / 0,95 / 20):

| Benchmark | Thinking off | Thinking on | Completado en 32k |
|---|---:|---:|---:|
| GSM8K | 85,6 | 85,0 | 100 % |
| MATH-500 | 79,4 | 95,0 | 97 % |
| MMLU-Pro | 68,7 | 81,0 | 98 % |
| GPQA Diamond | 39,9 | 62,6 | 88 % |
| SuperGPQA | 35,7 | 47,0 | 92 % |
| BIG-Bench Hard | 76,0 | 86,7 | 100 % |
| AIME 2024 + 2025 | — | 51,7 | 72 % |

Serbian LLM Eval (YugoGPT, log-likelihood, 7 tareas × 500 preguntas, 4 bits):

| Modelo | Media |
|---|---:|
| Quata2 4B v0.2 | 59,0 |
| YugoGPT 7B | 60,5 |
| Qwen3.5 4B (base) | 57,9 |
| Qwen3 4B 2507 | 51,0 |

El propio autor advierte que en benchmarks de 500 preguntas la diferencia debe superar 2-4 puntos para ser significativa, y 15-25 puntos en las pruebas pequeñas de 20-40 ítems.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,8 GB en cuantización Q4_K_M según el autor; el modelo completo en safetensors ocupa 26,5 GB de repositorio, por lo que la inferencia en precisión completa requiere al menos 12-16 GB de VRAM.
- GPU recomendadas: el autor indica que funciona en una única GPU de 8 GB (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 3070). Para mayor throughput, A100 o H100 no son necesarias pero permiten mayor paralelismo.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más usando GGUF Q4_K_M; también en hardware con menos VRAM si se emplean cuantizaciones más agresivas (no detalladas en la información disponible).
- Opciones de despliegue: llama.cpp (formato GGUF publicado), transformers (safetensors), y por los tags de Hugging Face, endpoints compatibles con text-generation-inference. No se mencionan vLLM ni Ollama de forma explícita, aunque la disponibilidad de GGUF permite su uso con llama.cpp y derivados.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | BFCL | HumanEval+ | Licencia |
|---|---:|---|---:|---:|---:|---|
| Quata2 4B v0.2 | 5,17B | no disponible | 73,0 | 88,7 | 77,4 | Apache 2.0 |
| Qwen3.5 4B (base) | ~4B | no disponible | 70,6 | 85,2 | 75,6 | no disponible en la información |
| Qwen3 4B 2507 | ~4B | no disponible | 64,6 | 91,7 | 84,8 | no disponible en la información |
| Gemma 4 E4B | ~4B | no disponible | 65,0 | 89,9 | 85,4 | no disponible en la información |

Quata2 destaca frente a su base en tool calling, Winogrande y pruebas de agente, pero pierde en MMLU-Pro, DROP e IFEval. Frente a Qwen3 4B 2507 y Gemma 4 E4B, gana en MMLU, SuperGPQA y pruebas en serbio, pero queda por detrás en código (HumanEval+, MBPP+) y en tool calling frente a Qwen3 4B 2507. Su ventaja diferencial es el soporte de serbio, croata y bosnio a un tamaño reducido.

## Limitaciones y advertencias

- El número de parámetros reales (5,17B) supera la denominación comercial "4B"; conviene tenerlo en cuenta para estimaciones de memoria y latencia.
- El ajuste fino puro perdía rendimiento frente al base en MMLU-Pro, GSM8K e IFEval; la mezcla 80/20 recupera parte de esa brecha, pero Quata2 sigue por debajo del base en MMLU-Pro (68,7 frente a 71,3), DROP (60,5 frente a 63,8) e IFEval (78,8 frente a 82,3).
- El modo thinking consume hasta 32k tokens y no siempre termina dentro de ese límite (AIME solo completa el 72 % de las respuestas, GPQA el 88 %), lo que puede producir respuestas truncadas o incompletas en tareas de razonamiento largo.
- Los benchmarks propios del autor usan conjuntos pequeños (12-300 ítems) y él mismo advierte que deben leerse como direccionales, no como conclusiones firmes.
- El soporte multilingüe se limita a inglés, serbio, croata y bosnio; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- El modelo tiene una identidad fuertemente ajustada ("Quata2"), lo que puede generar respuestas no deseadas si se espera un comportamiento neutro o si se intenta reutilizar como base para otro asistente.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni evaluaciones de seguridad; la model card no incluye sección de limitaciones.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B puede tener condiciones adicionales que el autor no detalla; conviene verificar la licencia del base antes de un despliegue comercial.
- El modelo se entrenó en una única GPU de 8 GB, lo que sugiere un dataset y un proceso de ajuste limitados en escala; la generalización fuera de los dominios cubiertos puede ser inferior a la de modelos entrenados con más recursos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/M1n1A1/MiniAI-Quata2-4b-v0.2
- Versión anterior (v0.1): https://huggingface.co/M1n1A1/MiniAI-Quata2-4b
- Checkpoint base del preentrenamiento continuado: https://huggingface.co/M1n1A1/MiniAI-Quata2-4b-v0.2-base
- GGUF del checkpoint base: https://huggingface.co/M1n1A1/MiniAI-Quata2-4b-v0.2-base-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper referenciado en los tags (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
