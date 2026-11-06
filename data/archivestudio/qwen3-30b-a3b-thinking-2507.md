# ArchiveStudio/Qwen3-30B-A3B-Thinking-2507

## Resumen

Qwen3-30B-A3B-Thinking-2507 es un modelo de lenguaje causal de tipo Mixture-of-Experts (MoE) desarrollado por el equipo Qwen de Alibaba. Es una actualización del Qwen3-30B-A3B original, centrada en escalar la capacidad de razonamiento del modelo ("thinking") tanto en calidad como en profundidad. El modelo cuenta con 30.500 millones de parámetros totales, de los cuales solo 3.300 millones se activan por token, lo que permite un equilibrio interesante entre capacidad y coste de inferencia.

La arquitectura es un transformer MoE con 48 capas, 128 expertos y 8 expertos activados por token, con atención GQA (32 cabezas para Q y 4 para KV). Su ventana de contexto nativa es de 262.144 tokens, lo que lo sitúa en la gama alta de modelos de contexto largo. El modelo está diseñado exclusivamente para modo "thinking": no admite modo no-thinking y la plantilla de chat incluye por defecto la etiqueta `<think>`, de modo que la salida puede contener únicamente el cierre `</think>` sin apertura explícita.

Es relevante ahora porque combina un tamaño total moderado (30.5B) con activación dispersa (3.3B), lo que lo hace desplegable en hardware relativamente asequible frente a modelos densos de tamaño comparable, y porque sus resultados en benchmarks de razonamiento (AIME25 85.0, HMMT25 71.4) superan a modelos mucho mayores como Qwen3-235B-A22B Thinking en varias tareas. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_moe), 48 capas, GQA (32 Q / 4 KV) |
| Parametros totales | 30.532.122.624 (30.5B) |
| Parametros activos | 3.3B por token (8 de 128 expertos) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no listadas en la informacion) |
| Idiomas soportados | no disponible (la model card no enumera idiomas; los benchmarks incluyen tareas multilingues) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer causal de tipo Mixture-of-Experts con 48 capas, 128 expertos y 8 expertos activados por token, lo que da lugar a 3.3B parámetros activos sobre un total de 30.5B (29.9B sin contar embeddings). Usa Grouped Query Attention con 32 cabezas para queries y 4 para keys/values, lo que reduce el coste de memoria de la caché KV en contextos largos. El contexto nativo es de 262.144 tokens.

El entrenamiento incluye una fase de preentrenamiento y otra de post-entrenamiento (la model card menciona "Pretraining & Post-training" sin detallar el número de tokens ni la composición del dataset). La actualización 2507 se centra en escalar la capacidad de razonamiento: la model card indica mejoras significativas en razonamiento lógico, matemáticas, ciencia, código y benchmarks académicos, así como en capacidades generales (instrucciones, uso de herramientas, generación de texto y alineación con preferencias humanas). No se detallan en la información proporcionada innovaciones como decodificación especulativa o atención lineal, ni el uso concreto de RLHF/DPO.

## Capacidades

- Generación de texto y razonamiento profundo en modo "thinking" exclusivamente (no hay modo no-thinking).
- Razonamiento matemático y científico de alto nivel (AIME25, HMMT25, GPQA, SuperGPQA).
- Generación y razonamiento sobre código (LiveCodeBench v6, CFEval, OJBench).
- Uso de herramientas y function calling (BFCL-v3, TAU1/TAU2 en dominios retail, airline y telecom).
- Capacidades de agente y razonamiento multi-paso (TAU2-Retail 58.8, TAU2-Airline 58.0).
- Comprensión de contexto largo: 262.144 tokens nativos, con mejoras explícitas en la actualización 2507.
- Capacidades multilingües (MultiIF 76.4, MMLU-ProX 76.4, INCLUDE 74.4, PolyMATH 52.6).
- Seguimiento de instrucciones (IFEval 88.9) y alineación con preferencias humanas (Arena-Hard v2 56.0, Creative Writing v3 84.4).
- La plantilla de chat fuerza el modo thinking incluyendo `<think>` por defecto; la salida puede contener solo `</think>`.

## Casos de uso

- Razonamiento matemático y científico asistido: el modelo puede resolver problemas de competición (AIME25 85.0, HMMT25 71.4) y servir como tutor o verificador de soluciones en plataformas educativas, con la salvedad de que su longitud de pensamiento es elevada y conviene reservarlo para tareas complejas.
- Generación de código en producción: con LiveCodeBench v6 de 66.0 y soporte de tool calling, puede integrarse en pipelines de CI/CD para revisión de parches, generación de tests o corrección automática de errores, usando la API compatible con OpenAI vía vLLM o SGLang.
- Agentes autónomos de atención al cliente: sus resultados en TAU1-Retail (67.8) y TAU2-Retail (58.8) lo hacen adecuado para flujos multi-turno con llamadas a herramientas (consultas de pedidos, devoluciones, cambios de reserva).
- Análisis de documentos largos: con 262.144 tokens de contexto puede procesar contratos, informes técnicos o expedientes completos en una sola pasada, extrayendo conclusiones razonadas sin trocear el documento.
- Asistencia a investigación y revisión de literatura: razonamiento sobre artículos científicos, verificación de argumentos y generación de resúmenes críticos aprovechando sus resultados en GPQA (73.4) y SuperGPQA (56.8).
- Automatización de tareas de oficina con herramientas: integración mediante function calling en asistentes que consultan bases de datos, APIs internas o calendarios, apoyándose en BFCL-v3 (72.4).
- Generación de contenido técnico y creativo: WritingBench 85.0 y Creative Writing v3 84.4 permiten redactar documentación, artículos o narrativa con calidad alta, aunque con latencia mayor por el modo thinking.
- Evaluación y benchmarking interno: útil como modelo de referencia para comparar pipelines de razonamiento en equipos de I+D, dado su equilibrio entre tamaño total y activación.

## Benchmarks y rendimiento

Datos publicados en la model card (comparativa con Gemini2.5-Flash-Thinking, Qwen3-235B-A22B Thinking y Qwen3-30B-A3B Thinking):

| Benchmark | Gemini2.5-Flash-Thinking | Qwen3-235B-A22B Thinking | Qwen3-30B-A3B Thinking | Qwen3-30B-A3B-Thinking-2507 |
|---|---|---|---|---|
| MMLU-Pro | 81.9 | 82.8 | 78.5 | 80.9 |
| MMLU-Redux | 92.1 | 92.7 | 89.5 | 91.4 |
| GPQA | 82.8 | 71.1 | 65.8 | 73.4 |
| SuperGPQA | 57.8 | 60.7 | 51.8 | 56.8 |
| AIME25 | 72.0 | 81.5 | 70.9 | 85.0 |
| HMMT25 | 64.2 | 62.5 | 49.8 | 71.4 |
| LiveBench 20241125 | 74.3 | 77.1 | 74.3 | 76.8 |
| LiveCodeBench v6 (25.02-25.05) | 61.2 | 55.7 | 57.4 | 66.0 |
| CFEval | 1995 | 2056 | 1940 | 2044 |
| OJBench | 23.5 | 25.6 | 20.7 | 25.1 |
| IFEval | 89.8 | 83.4 | 86.5 | 88.9 |
| Arena-Hard v2 | 56.7 | 61.5 | 36.3 | 56.0 |
| Creative Writing v3 | 85.0 | 84.6 | 79.1 | 84.4 |
| WritingBench | 83.9 | 80.3 | 77.0 | 85.0 |
| BFCL-v3 | 68.6 | 70.8 | 69.1 | 72.4 |
| TAU1-Retail | 65.2 | 54.8 | 61.7 | 67.8 |
| TAU1-Airline | 54.0 | 26.0 | 32.0 | 48.0 |
| TAU2-Retail | 66.7 | 40.4 | 34.2 | 58.8 |
| TAU2-Airline | 52.0 | 30.0 | 36.0 | 58.0 |
| TAU2-Telecom | 31.6 | 21.9 | 22.8 | 26.3 |
| MultiIF | 74.4 | 71.9 | 72.2 | 76.4 |
| MMLU-ProX | 80.2 | 80.0 | 73.1 | 76.4 |
| INCLUDE | 83.9 | 78.7 | 71.9 | 74.4 |
| PolyMATH | 49.8 | 54.7 | 46.1 | 52.6 |

Notas de la model card: las win rates de Arena-Hard v2 se evalúan con GPT-4.1; para tareas muy exigentes (PolyMATH y todas las de razonamiento y código) se usa una longitud de salida de 81.920 tokens, y para el resto 32.768 tokens.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. Como referencia orientativa, 30.5B parámetros en bf16 requieren aproximadamente 61 GB de pesos (tamaño del repo: 61.1 GB), más caché KV y overhead. Las cuantizaciones no están listadas en la información.
- GPU recomendadas: no disponible en la información. Por tamaño de pesos en bf16, un despliegue completo requiere GPUs con 80 GB (A100, H100) o múltiples GPUs menores.
- ¿Cabe en GPU consumer? No hay datos oficiales. Con 61 GB de pesos en bf16 no cabe en una RTX 4090 (24 GB) sin cuantización; no se dispone de información sobre variantes cuantizadas.
- Opciones de despliegue: transformers (>=4.51.0, para evitar `KeyError: 'qwen3_moe'`), SGLang (>=0.4.6.post1) y vLLM (>=0.8.5), ambos con creación de endpoint compatible con OpenAI. La model card menciona `--reasoning-parser` en SGLang para el modo thinking. No se confirma soporte de llama.cpp u Ollama en la información.
- Latencia y throughput: no disponibles en la información. La model card advierte de una mayor longitud de pensamiento, lo que incrementa el coste por consulta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas de rendimiento |
|---|---|---|---|---|---|
| Qwen3-30B-A3B-Thinking-2507 | 30.5B totales / 3.3B activos | 262.144 | Apache 2.0 | Hugging Face (este repo) | AIME25 85.0, HMMT25 71.4, LiveCodeBench v6 66.0 |
| Qwen3-30B-A3B Thinking (original) | 30.5B totales / 3.3B activos | no disponible en la información (el original de Qwen3 soporta 128K extensible; dato no confirmado aquí) | Apache 2.0 | Hugging Face | AIME25 70.9, HMMT25 49.8, LiveCodeBench v6 57.4 |
| Qwen3-235B-A22B Thinking | 235B totales / 22B activos | no disponible en la información | Apache 2.0 | Hugging Face | MMLU-Pro 82.8, AIME25 81.5, Arena-Hard v2 61.5 |
| Gemini2.5-Flash-Thinking | no disponible | no disponible | propietaria | API de Google | GPQA 82.8, IFEval 89.8, TAU2-Retail 66.7 |

El modelo 2507 mejora de forma clara a su predecesor en razonamiento y código, y supera a Qwen3-235B-A22B Thinking en AIME25, HMMT25, LiveCodeBench v6, BFCL-v3 y varias tareas TAU, pese a tener una fracción de los parámetros activos.

## Limitaciones y advertencias

- Modo thinking exclusivo: no existe modo no-thinking, lo que implica mayor latencia y coste por consulta y lo hace poco adecuado para tareas triviales o de baja latencia.
- Mayor longitud de pensamiento que la versión anterior; la model card recomienda reservarlo para tareas de razonamiento muy complejas.
- Riesgo de alucinación: no se documentan tasas específicas en la información; como todo LLM, puede generar contenido plausible pero incorrecto, especialmente en dominios especializados.
- Sesgos conocidos: no documentados en la información proporcionada.
- Idiomas: la model card no enumera los idiomas soportados; los benchmarks multilingües muestran rendimiento sólido pero inferior a Gemini2.5-Flash-Thinking en MMLU-ProX (76.4 frente a 80.2), INCLUDE (74.4 frente a 83.9) y PolyMATH (52.6 frente a 49.8, aquí superior).
- Contexto: aunque el contexto nativo es de 262.144 tokens, el rendimiento en ventanas extremas no está cuantificado en la información.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar el archivo LICENSE enlazado en la model card antes de producción.
- Repositorio de terceros: este ID (ArchiveStudio/Qwen3-30B-A3B-Thinking-2507) es una réplica subida por un tercero, no el repositorio oficial de Qwen; conviene verificar la integridad de los pesos y usar el repositorio oficial para producción.
- Fecha de creación del repositorio (2026-11-02) posterior a la publicación original del modelo; sin descargas ni likes registrados en el momento de la consulta.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/ArchiveStudio/Qwen3-30B-A3B-Thinking-2507
- Repositorio oficial del modelo: https://huggingface.co/Qwen/Qwen3-30B-A3B-Thinking-2507
- Licencia: https://huggingface.co/Qwen/Qwen3-30B-A3B-Thinking-2507/blob/main/LICENSE
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentación: https://qwen.readthedocs.io/en/latest/
- Qwen Chat: https://chat.qwen.ai/
- Papers referenciados en los tags: arxiv:2402.17463, arxiv:2407.02490, arxiv:2501.15383, arxiv:2404.06654, arxiv:2505.09388
