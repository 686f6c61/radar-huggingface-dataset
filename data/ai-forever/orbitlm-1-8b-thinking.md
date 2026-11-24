# ai-forever/OrbitLM-1.8B-Thinking

## Resumen

OrbitLM-1.8B-Thinking es un modelo de lenguaje de tipo *looped* (con bucle recurrente) desarrollado por ai-forever (Sber). Aplica un único bloque de 24 capas transformer cuatro veces a cada token y, tras cada pasada, una compuerta de salida (*exit gate*) puntúa la probabilidad de detener el cómputo de ese token. Con 1,86B de parámetros totales, aplica 5,24B por token generado al contabilizar las cuatro pasadas de las capas compartidas. Está entrenado desde cero sobre 1,5T de tokens en inglés y ruso, con ajuste fino conversacional y una fase de aprendizaje por refuerzo (GRPO) en matemáticas y código.

El modelo sigue el diseño Ouro-1.4B: 24 capas compartidas, tamaño oculto 2048, 16 cabezas de atención de dimensión 128 sin agrupación de KV, MLP SwiGLU de 5632 y tokenizador Qwen3 de 151.936 tokens. Soporta contexto de 32.768 tokens con base RoPE de 4.000.000. Su relevancia radica en demostrar que un modelo *looped* de 1,86B entrenado con 5,2 veces menos tokens que Ouro-1.4B-Thinking puede acercarse a sus resultados en razonamiento matemático, y superarlo en seguimiento de instrucciones y *function calling*.

El modelo está pensado para razonamiento con modo *thinking* activado por defecto (bloque `<think>` en formato ChatML), conversación bilingüe ruso/inglés y llamadas a herramientas. La licencia es Apache 2.0 y los pesos se distribuyen con código personalizado, por lo que requiere `trust_remote_code=True`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder *looped* (Ouro-1.4B layout): 24 capas compartidas ejecutadas 4 veces, con *exit gate* tras cada pasada |
| Parámetros totales | 1.855.655.937 (1,86B): 1,23B en capas compartidas, 0,62B en embeddings y matriz de salida no atadas |
| Parámetros activos | 5,24B por token generado (contabilizando las 4 pasadas de las capas compartidas) |
| Longitud de contexto | 32.768 tokens (RoPE base 4.000.000) |
| Tipos de cuantización | No disponible en la información proporcionada (los pesos se distribuyen en safetensors; el autor menciona caché KV en FP8 como opción) |
| Idiomas soportados | Ruso, inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con código personalizado incluido en el repo) |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer con bucle de profundidad recurrente: un stack de 24 capas se reaplica cuatro veces sobre la misma representación. Tras cada pasada, una compuerta de salida estima la probabilidad de que el token esté listo para detenerse. Cada pasada mantiene sus propias claves y valores, de modo que la caché KV acumula 96 entradas de capa por token: 0,75 MiB por token en bf16, o 24 GiB para una secuencia completa de 32K. Una caché KV en FP8 reduce esta cifra a la mitad. El tokenizador es Qwen3 con 151.936 tokens y el formato de chat es ChatML con bloque `<think>` activado por defecto.

El entrenamiento se organiza en seis fases: dos de preentrenamiento a 4K de contexto (419B y 839B tokens), dos de extensión de contexto a 16K (200B tokens) y 32K (20B tokens), un SFT a 32K (14,7B tokens) y una fase de RL con GRPO sobre matemáticas y código, con pérdida en cada pasada ponderada por la compuerta de salida y coeficiente 1e-6. La mezcla de preentrenamiento es mayoritariamente web en inglés, matemáticas y código, con un 30% de ruso en la primera fase y un 22% en la segunda. La pérdida de cada pasada se pondera por la probabilidad de parada de la compuerta, y un término KL hacia una distribución de salida uniforme (coeficiente 0,15) evita que la compuerta colapse en las primeras pasadas. Tras 1,26T tokens, las probabilidades medias de salida de las cuatro pasadas eran 0,15, 0,25, 0,30 y 0,30, con variación inferior a 0,01 en los siguientes 200B tokens.

## Capacidades

- Generación de texto y razonamiento con modo *thinking* por defecto (bloque `<think>` en ChatML).
- Razonamiento matemático: GSM8K, MATH-500, AIME, OlympiadBench y ruMATH-500 (matemáticas en ruso).
- Generación de código: HumanEval+, MBPP+ y LiveCodeBench.
- Llamada a funciones / *tool calling* (evaluado en BFCL, categoría paralela).
- Seguimiento de instrucciones (IFEval).
- Conversación multi-turno con contexto de hasta 32.768 tokens.
- Capacidades bilingües ruso/inglés.
- Razonamiento multi-paso en el propio bucle de cómputo (cuatro pasadas por token con salida adaptativa).

## Casos de uso

- **Tutor de matemáticas bilingüe ruso/inglés**: el modelo obtiene 91,0 en MATH-500 y 82,2 en ruMATH-500, por lo que puede resolver y explicar problemas paso a paso en ambos idiomas dentro de una ventana de 32K tokens.
- **Atención al cliente en ruso**: con contexto de 32.768 tokens puede mantener conversaciones multi-turno largas y consultar historial completo sin truncar, en formato ChatML.
- **Agentes con *tool calling* en producción**: su puntuación de 89,5 en BFCL (categoría paralela) lo hace adecuado para orquestar llamadas a APIs en flujos de agentes, con soporte de múltiples herramientas por turno.
- **Generación de código asistida en pipelines de CI/CD**: HumanEval+ de 78,2 y MBPP+ de 60,8 permiten integrarlo como generador de parches o tests, aunque LiveCodeBench (28,2) limita su uso en problemas de código competitivo.
- **Razonamiento matemático con presupuesto de cómputo adaptativo**: la compuerta de salida permite que tokens "fáciles" terminen antes y los "difíciles" usen las cuatro pasadas, lo que resulta útil en entornos con latencia variable.
- **Procesamiento de documentos largos en ruso**: la ventana de 32K y el soporte nativo de ruso permiten resumir o extraer información de informes extensos sin dividir el texto.
- **Evaluación de instrucciones y formato estructurado**: IFEval de 71,9 lo hace apto para tareas de extracción y formateo con instrucciones estrictas.

## Benchmarks y rendimiento

Evaluación en un mismo arnés: razonamiento con presupuesto de 16K tokens (30K para GPQA y olimpiadas), *function calling* sin forzado. AIME con pass@10, GPQA en subconjunto Diamond, LCB = LiveCodeBench, BFCL en categoría paralela.

| Modelo | Tokens preent. | MMLU-Pro | GSM8K | MATH-500 | ruMATH-500 | AIME 2025 | AIME 2026 | OlympiadBench | HumanEval+ | MBPP+ | LCB | IFEval | BFCL |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **OrbitLM-1.8B-Thinking** | 1,48T | 53,1 | 91,8 | 91,0 | 82,2 | 66,5 | 67,3 | 63,6 | 78,2 | 60,8 | 28,2 | 71,9 | 89,5 |
| Ouro-1.4B-Thinking | 7,7T | 65,1 | 93,4 | 91,6 | 71,6 | 66,2 | 72,9 | 65,7 | 86,3 | 71,2 | 42,1 | 51,4 | 71,5 |
| Qwen3.5-2B | n/a | 65,6 | 84,5 | 74,4 | 80,8 | 39,3 | 43,9 | 43,0 | 62,0 | 50,7 | 9,1 | 79,7 | 83,0 |
| SmolLM3-3B | 11,2T | 57,8 | 91,7 | 92,8 | 86,0 | 71,1 | 75,5 | 66,5 | 81,6 | 58,1 | 31,3 | 68,2 | 66,0 |
| Nemotron-Nano-4B | ~15T | 48,5 | 92,3 | 90,0 | 71,6 | 70,8 | 80,7 | 71,0 | 85,7 | 66,7 | 36,4 | 73,2 | 67,5 |

Según el autor, con 5,2 veces menos tokens de preentrenamiento que Ouro-1.4B-Thinking logra resultados comparables en MATH-500, AIME 2025 y GPQA, y queda a unos dos puntos en GSM8K y OlympiadBench. Supera a Ouro en IFEval y BFCL, pero queda por detrás en MMLU-Pro, AIME 2026 y código. Las comparaciones no están controladas (distintos datos, tokenizadores y post-entrenamiento).

## Requisitos de hardware

- **VRAM para pesos**: 1,86B parámetros en bf16 ≈ 3,7 GB; en FP8 ≈ 1,9 GB; en cuantizaciones de 4 bits ≈ 1 GB (estimación según tamaño; el autor no publica cuantizaciones oficiales).
- **Caché KV**: 0,75 MiB por token en bf16 (24 GiB para una secuencia de 32K); en FP8 se reduce a la mitad (12 GiB).
- **GPU recomendadas**: para contexto completo de 32K en bf16 se necesita una GPU con al menos 24-32 GB (A100 40GB, H100, RTX 4090 24GB al límite). Para contextos cortos cabe en GPUs de consumo con 8-16 GB.
- **Cabe en GPU de consumo**: sí, en RTX 3060 12GB, RTX 4070, RTX 4090, con contexto reducido y cuantización.
- **Despliegue**: transformers 4.56 o superior (probado hasta 5.23) con `trust_remote_code=True`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- **Latencia y throughput**: no disponibles. El bucle de cuatro pasadas y la compuerta de salida adaptativa implican coste variable por token.

## Comparativa con modelos similares

| Modelo | Parámetros | Parám. por token | Contexto | MATH-500 | IFEval | BFCL | Licencia |
|---|---|---|---|---|---|---|---|
| OrbitLM-1.8B-Thinking | 1,86B | 5,24B | 32K | 91,0 | 71,9 | 89,5 | Apache 2.0 |
| Ouro-1.4B-Thinking | 1,4B | 5,03B | no disponible | 91,6 | 51,4 | 71,5 | no disponible |
| Qwen3.5-2B | 2B | 1,88B | no disponible | 74,4 | 79,7 | 83,0 | no disponible |
| SmolLM3-3B | 3B | 3,08B | no disponible | 92,8 | 68,2 | 66,0 | no disponible |

OrbitLM destaca en *function calling* (89,5) y matemáticas en ruso (82,2 frente a 71,6 de Ouro y Nemotron), pero queda por detrás en código y MMLU-Pro. Aplica más parámetros por token que los modelos densos comparables, lo que encarece la inferencia.

## Limitaciones y advertencias

- **Sesgos**: no documentados por el autor; al entrenarse mayoritariamente con web en inglés puede heredar sesgos de ese corpus.
- **Alucinación**: no se reportan evaluaciones específicas de factualidad; el modo *thinking* por defecto no elimina el riesgo.
- **Idioma**: solo ruso e inglés; no hay soporte declarado para castellano ni otros idiomas.
- **Código**: rendimiento bajo en LiveCodeBench (28,2) frente a Ouro (42,1) y SmolLM3 (31,3); no recomendable para problemas de código competitivo.
- **MMLU-Pro**: 53,1, por debajo de Ouro (65,1) y Qwen3.5-2B (65,6); conocimiento general limitado.
- **Coste de inferencia**: 5,24B parámetros aplicados por token y caché KV de 24 GiB a 32K en bf16; el bucle de cuatro pasadas encarece el despliegue frente a modelos densos del mismo tamaño.
- **Código personalizado**: requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; auditar antes de usar en producción.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene revisar las dependencias del código incluido.
- **Fase de RL incompleta**: el entrenamiento con GRPO se detuvo en el paso 90 de 150 según la model card, lo que puede dejar margen de mejora sin explotar.

## Enlaces

- [Hugging Face: ai-forever/OrbitLM-1.8B-Thinking](https://huggingface.co/ai-forever/OrbitLM-1.8B-Thinking)
- [Paper: Closing the Loop: Practical Training Recipes for Looped Language Models (arXiv:2610.00673)](https://arxiv.org/abs/2610.00673)
- [GitHub: ai-forever/OrbitLM](https://github.com/ai-forever/OrbitLM)
- [Artículo en Habr (RU): Cómo hacer un LLM looped: de la arquitectura al aprendizaje por refuerzo](https://habr.com/ru/companies/sberbank/articles/1111372/)
