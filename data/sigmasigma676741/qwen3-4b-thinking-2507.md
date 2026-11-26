# Sigmasigma676741/Qwen3-4B-Thinking-2507

## Resumen

Qwen3-4B-Thinking-2507 es un modelo de lenguaje causal de 4.022 millones de parámetros (3.600 millones no pertenecientes a embeddings) desarrollado por el equipo Qwen de Alibaba y distribuido a través del repositorio de Hugging Face del usuario Sigmasigma676741. Se trata de una actualización de julio de 2025 sobre la base Qwen3-4B, orientada específicamente a razonamiento profundo: el modelo opera exclusivamente en modo "thinking", sin modo instruct rápido, y está diseñado para tareas que requieren cadenas de razonamiento largas.

La arquitectura es un transformer decoder-only con 36 capas y atención GQA (32 cabezas para consultas y 8 para claves/valores), con una ventana de contexto nativa de 262.144 tokens. Frente a la versión Qwen3-4B Thinking original, esta revisión incrementa de forma notable el rendimiento en matemáticas, código, agentes y alineación, a costa de una mayor longitud de razonamiento generado.

Su relevancia actual radica en que ofrece capacidades de razonamiento cercanas a modelos mucho mayores (comparable en algunos benchmarks al Qwen3-30B-A3B Thinking) manteniendo un tamaño de 4B que permite despliegue en hardware de consumo. La licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal con GQA |
| Parametros totales | 4.022.468.096 (4.0B); 3.6B no-embedding |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos safetensors en bf16/fp16 presumiblemente) |
| Idiomas soportados | No disponible en la informacion proporcionada (la model card incluye benchmarks multilingues como MultiIF, MMLU-ProX, INCLUDE y PolyMATH) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso de 36 capas con Grouped Query Attention (32 cabezas de consulta, 8 de clave/valor), lo que reduce el coste de memoria del KV cache frente a atención multi-cabeza completa. El tamaño del repositorio (8,1 GB) es consistente con pesos en bf16 para 4.022 millones de parámetros. La ventana de contexto nativa es de 262.144 tokens, lo que supone una de las mayores longitudes de contexto para un modelo de 4B.

El entrenamiento combina una fase de preentrenamiento y otra de post-entrenamiento (pretraining & post-training), según la model card. No se detalla en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas concretas de RLHF o DPO, más allá de mencionarse mejoras en "alignment with human preferences". La innovación principal de esta revisión 2507 es el aumento de la longitud de razonamiento (thinking length), que el autor recomienda para tareas de alta complejidad, junto con mejoras en contexto largo y en capacidades de agente. El modelo solo soporta modo thinking: la plantilla de chat incluye automáticamente ``.

## Capacidades

- Razonamiento lógico, matemáticas y ciencia de nivel avanzado, con cadenas de pensamiento largas.
- Generación de código y resolución de problemas de programación competitiva.
- Razonamiento multi-paso y soporte de agentes (tool calling / function calling), medido en BFCL-v3 y TAU.
- Comprensión de contexto largo de hasta 262.144 tokens.
- Capacidades multilingües (evaluadas en MultiIF, MMLU-ProX, INCLUDE y PolyMATH).
- Instrucciones y alineación con preferencias humanas (IFEval, Arena-Hard v2, Creative Writing).
- Modo thinking obligatorio; no dispone de modo instruct rápido.
- Generación de texto conversacional y creativo.

## Casos de uso

- Razonamiento matemático y científico asistido: el modelo puede resolver problemas de competición (AIME25, HMMT25) generando cadenas de razonamiento largas, adecuado para tutores o herramientas de verificación de demostraciones.
- Generación y revisión de código en producción: con soporte de tool calling y buen rendimiento en LiveCodeBench v6, puede integrarse en pipelines de CI/CD para revisión automática, generación de tests o resolución de incidencias.
- Agentes autónomos multi-paso: su rendimiento en TAU2 (Retail, Airline, Telecom) y BFCL-v3 lo hace apto para orquestar flujos con llamadas a herramientas en atención al cliente o back-office.
- Análisis de documentos largos: con 262.144 tokens de contexto puede procesar contratos, informes o bases de código extensas en una sola pasada.
- Atención al cliente automatizada compleja: gestiona conversaciones multi-turno con razonamiento intermedio para resolver consultas que requieren cálculo o consulta de datos.
- Investigación y síntesis académica: útil para resumir literatura extensa y razonar sobre ella, gracias al contexto largo y a las capacidades multilingües.
- Evaluación y generación de contenido creativo: redacción de textos largos y estructurados (WritingBench, Creative Writing v3).

## Benchmarks y rendimiento

Datos publicados en la model card (comparativa con Qwen3-30B-A3B Thinking y Qwen3-4B Thinking):

| Benchmark | Qwen3-30B-A3B Thinking | Qwen3-4B Thinking | Qwen3-4B-Thinking-2507 |
|---|---|---|---|
| MMLU-Pro | 78.5 | 70.4 | 74.0 |
| MMLU-Redux | 89.5 | 83.7 | 86.1 |
| GPQA | 65.8 | 55.9 | 65.8 |
| SuperGPQA | 51.8 | 42.7 | 47.8 |
| AIME25 | 70.9 | 65.6 | 81.3 |
| HMMT25 | 49.8 | 42.1 | 55.5 |
| LiveBench 20241125 | 74.3 | 63.6 | 71.8 |
| LiveCodeBench v6 | 57.4 | 48.4 | 55.2 |
| CFEval | 1940 | 1671 | 1852 |
| OJBench | 20.7 | 16.1 | 17.9 |
| IFEval | 86.5 | 81.9 | 87.4 |
| Arena-Hard v2 | 36.3 | 13.7 | 34.9 |
| Creative Writing v3 | 79.1 | 61.1 | 75.6 |
| WritingBench | 77.0 | 73.5 | 83.3 |
| BFCL-v3 | 69.1 | 65.9 | 71.2 |
| TAU1-Retail | 61.7 | 33.9 | 66.1 |
| TAU1-Airline | 32.0 | 32.0 | 48.0 |
| TAU2-Retail | 34.2 | 38.6 | 53.5 |
| TAU2-Airline | 36.0 | 28.0 | 58.0 |
| TAU2-Telecom | 22.8 | 17.5 | 27.2 |
| MultiIF | 72.2 | 66.3 | 77.3 |
| MMLU-ProX | 73.1 | 61.0 | 64.2 |
| INCLUDE | 71.9 | 61.8 | 64.4 |
| PolyMATH | 46.1 | 40.0 | 46.2 |

Nota: para tareas de alta dificultad (PolyMATH y tareas de razonamiento y código) se usó una longitud de salida de 81.920 tokens; para el resto, 32.768 tokens. Arena-Hard v2 se evaluó con GPT-4.1 como juez.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16 los pesos ocupan aproximadamente 8 GB; con cuantización de 8 bits ~4 GB y de 4 bits ~2-3 GB (estimación a partir del tamaño de parámetros, no confirmada en la información disponible).
- El contexto de 262.144 tokens incrementa notablemente el consumo de KV cache; en la práctica puede requerir GPUs con 24-80 GB para aprovechar todo el contexto.
- GPU recomendadas: A100 (40/80 GB) o H100 para contexto completo; RTX 4090 (24 GB) para contexto moderado; cabe en GPUs de consumo (RTX 3090/4090, 24 GB) con contexto reducido o cuantización.
- Opciones de despliegue: transformers (>=4.51.0), vLLM (>=0.8.5) con `--enable-reasoning --reasoning-parser deepseek_r1`, SGLang (>=0.4.6.post1) con `--reasoning-parser deepseek-r1`, y endpoints compatibles OpenAI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro | AIME25 | GPQA | Licencia |
|---|---|---|---|---|---|---|
| Qwen3-4B-Thinking-2507 | 4.0B | 262.144 | 74.0 | 81.3 | 65.8 | Apache 2.0 |
| Qwen3-4B Thinking | 4.0B | 262.144 | 70.4 | 65.6 | 55.9 | Apache 2.0 |
| Qwen3-30B-A3B Thinking | 30B (3B activos) | 262.144 | 78.5 | 70.9 | 65.8 | Apache 2.0 |

El modelo 2507 supera claramente a su predecesor Qwen3-4B Thinking en casi todos los benchmarks y se acerca al Qwen3-30B-A3B Thinking en conocimiento y supera a este último en matemáticas (AIME25: 81.3 frente a 70.9) e instrucciones (IFEval: 87.4 frente a 86.5), aunque queda por debajo en conocimiento general y en algunos benchmarks multilingües.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; como modelo entrenado con datos web, es probable que herede sesgos sociales y culturales.
- Riesgo de alucinación: presente como en cualquier LLM; el modo thinking puede mitigarlo parcialmente pero no lo elimina.
- Solo modo thinking: no dispone de modo instruct rápido, lo que incrementa la latencia y el coste de tokens en tareas simples.
- La longitud de razonamiento aumentada puede provocar respuestas muy largas y mayor consumo de tokens; se recomienda usar en tareas de alta complejidad.
- El contexto completo de 262.144 tokens exige hardware con gran memoria; reducir la longitud si hay OOM.
- Requiere transformers >=4.51.0 (con versiones anteriores aparece `KeyError: 'qwen3'`).
- Idiomas soportados no especificados explícitamente; el rendimiento multilingüe es inferior al de modelos mayores.
- Licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero conviene revisar la licencia enlazada del modelo original Qwen.

## Enlaces

- Hugging Face: https://huggingface.co/Sigmasigma676741/Qwen3-4B-Thinking-2507
- Modelo original: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507
- Licencia: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507/blob/main/LICENSE
- Blog Qwen3: https://qwenlm.github.io/blog/qwen3/
- GitHub Qwen3: https://github.com/QwenLM/Qwen3
- Documentación: https://qwen.readthedocs.io/en/latest/
- Chat Qwen: https://chat.qwen.ai/
- Paper de referencia (arxiv): https://arxiv.org/abs/2505.09388
