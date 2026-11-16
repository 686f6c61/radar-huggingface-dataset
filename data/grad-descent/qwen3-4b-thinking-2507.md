# grad-descent/Qwen3-4B-Thinking-2507

## Resumen

Qwen3-4B-Thinking-2507 es una versión actualizada del modelo Qwen3-4B en su variante de razonamiento (thinking). Lo desarrolla el equipo Qwen de Alibaba, y este repositorio concreto lo publica el usuario `grad-descent` como espejo del modelo original `Qwen/Qwen3-4B-Thinking-2507`. Se trata de un modelo de lenguaje causal de 4.022 millones de parámetros totales (3.600 millones sin contar embeddings), diseñado específicamente para tareas de razonamiento complejo: matemáticas, lógica, ciencia, código y benchmarks académicos que requieren conocimiento experto.

La actualización 2507 incide en tres ejes: mayor calidad y profundidad del razonamiento, mejora notable en capacidades generales (seguimiento de instrucciones, uso de herramientas, generación de texto y alineación con preferencias humanas) y comprensión de contexto largo de hasta 262.144 tokens de forma nativa. El modelo funciona exclusivamente en modo thinking: la plantilla de chat inyecta automáticamente la etiqueta `<think>`, por lo que la salida puede contener solo el cierre `</think>`.

Es relevante ahora porque demuestra que un modelo de tan solo 4.000 millones de parámetros puede acercarse a modelos MoE mucho mayores (Qwen3-30B-A3B) en varios benchmarks de razonamiento, lo que lo convierte en una opción atractiva para despliegue en hardware modesto sin renunciar a capacidades de razonamiento profundo. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only) con GQA |
| Parámetros totales | 4.022.468.096 (4,0 B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantización | no disponible en la información proporcionada (formato safetensors en el repo; cuantizaciones GGUF/AWQ no confirmadas) |
| Idiomas soportados | no disponible (la model card no enumera idiomas; incluye benchmarks multilingües como MultiIF, MMLU-ProX, INCLUDE y PolyMATH) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 8,1 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only de 36 capas con atención de consultas agrupadas (GQA): 32 cabezas para consultas y 8 para claves/valores, lo que reduce el coste de memoria de la caché KV frente a atención multi-cabeza completa. Cuenta con 4.000 millones de parámetros totales, de los cuales 3.600 millones son no-embedding. La longitud de contexto nativa es de 262.144 tokens, lo que exige técnicas de atención de contexto largo (la model card no detalla el mecanismo concreto, pero el modelo base Qwen3 emplea RoPE con escalado y optimizaciones de atención).

El entrenamiento consta de dos fases: preentrenamiento y post-entrenamiento. La model card no especifica el número de tokens de entrenamiento ni la composición exacta del dataset. La variante 2507 se describe como una continuación del escalado de la capacidad de razonamiento de Qwen3-4B durante tres meses adicionales, con mejoras en calidad y profundidad del pensamiento. No se detalla si se empleó RLHF, DPO u otras técnicas de alineación, aunque los resultados en benchmarks de alineación (IFEval, Arena-Hard v2, Creative Writing v3) sugieren un post-entrenamiento orientado a preferencias. Una innovación destacable es el modo thinking obligatorio: la plantilla de chat inyecta `<think>` por defecto, de modo que el modelo siempre razona antes de responder.

## Capacidades

- Generación de texto y razonamiento profundo: lógica, matemáticas, ciencia y preguntas de nivel experto (MMLU-Pro, GPQA, AIME25, HMMT25).
- Generación y razonamiento sobre código: resolución de problemas de programación competitiva (LiveCodeBench v6, CFEval, OJBench).
- Modo thinking obligatorio: el modelo siempre produce una cadena de razonamiento interna antes de la respuesta final; no admite modo instruct puro.
- Uso de herramientas (tool calling / function calling): evaluado en BFCL-v3 y en los entornos TAU1 y TAU2 (retail, airline, telecom).
- Capacidades de agente y razonamiento multi-paso: soporta interacción con entornos y ejecución de tareas multi-turno.
- Comprensión de contexto largo: hasta 262.144 tokens nativos, con mejora explícita en esta versión.
- Capacidades multilingües: evaluado en MultiIF, MMLU-ProX, INCLUDE y PolyMATH, aunque la lista concreta de idiomas no se detalla.
- Seguimiento de instrucciones y alineación: IFEval, Arena-Hard v2 y benchmarks de escritura creativa (Creative Writing v3, WritingBench).
- No se mencionan capacidades de visión ni audio en la información disponible.

## Casos de uso

- Razonamiento matemático y científico asistido: el modelo resuelve problemas de competición (AIME25, HMMT25) y de nivel experto (GPQA) generando cadenas de pensamiento largas; adecuado para tutores automáticos, verificación de demostraciones o generación de problemas resueltos con justificación paso a paso.
- Generación de código en producción: con soporte de tool calling y buen rendimiento en LiveCodeBench v6 y CFEval, puede integrarse en pipelines de CI/CD para revisión de parches, generación de tests o resolución de incidencias, siempre con validación humana por el riesgo de alucinación.
- Agentes autónomos sobre APIs y entornos: los resultados en BFCL-v3 y TAU1/TAU2 (retail, airline, telecom) lo hacen apto para agentes que consultan servicios, gestionan reservas o resuelven flujos de atención al cliente multi-paso.
- Análisis de documentos largos: con 262.144 tokens de contexto nativo puede procesar informes extensos, expedientes o bases de código completas en una sola pasada, resumiendo y extrayendo conclusiones con razonamiento explícito.
- Asistencia a la investigación: para tareas de revisión de literatura, generación de hipótesis o explicación de conceptos científicos donde se requiere razonamiento profundo y trazable (la cadena de pensamiento queda visible).
- Atención al cliente automatizada: la mejora en seguimiento de instrucciones (IFEval 87,4) y en alineación (Arena-Hard v2 34,9) permite conversaciones multi-turno más coherentes, con contexto largo para historiales extensos.
- Despliegue en hardware modesto: al ser un modelo denso de 4 B, cabe en GPUs de consumo con cuantización, lo que permite prototipado local de agentes y asistentes de razonamiento sin infraestructura de datacenter.

## Benchmarks y rendimiento

Resultados publicados en la model card (comparación con Qwen3-4B Thinking y Qwen3-30B-A3B Thinking):

| Benchmark | Qwen3-30B-A3B Thinking | Qwen3-4B Thinking | Qwen3-4B-Thinking-2507 |
|---|---|---|---|
| MMLU-Pro | 78,5 | 70,4 | 74,0 |
| MMLU-Redux | 89,5 | 83,7 | 86,1 |
| GPQA | 65,8 | 55,9 | 65,8 |
| SuperGPQA | 51,8 | 42,7 | 47,8 |
| AIME25 | 70,9 | 65,6 | 81,3 |
| HMMT25 | 49,8 | 42,1 | 55,5 |
| LiveBench 20241125 | 74,3 | 63,6 | 71,8 |
| LiveCodeBench v6 (25.02-25.05) | 57,4 | 48,4 | 55,2 |
| CFEval | 1940 | 1671 | 1852 |
| OJBench | 20,7 | 16,1 | 17,9 |
| IFEval | 86,5 | 81,9 | 87,4 |
| Arena-Hard v2 | 36,3 | 13,7 | 34,9 |
| Creative Writing v3 | 79,1 | 61,1 | 75,6 |
| WritingBench | 77,0 | 73,5 | 83,3 |
| BFCL-v3 | 69,1 | 65,9 | 71,2 |
| TAU1-Retail | 61,7 | 33,9 | 66,1 |
| TAU1-Airline | 32,0 | 32,0 | 48,0 |
| TAU2-Retail | 34,2 | 38,6 | 53,5 |
| TAU2-Airline | 36,0 | 28,0 | 58,0 |
| TAU2-Telecom | 22,8 | 17,5 | 27,2 |
| MultiIF | 72,2 | 66,3 | 77,3 |
| MMLU-ProX | 73,1 | 61,0 | 64,2 |
| INCLUDE | 71,9 | 61,8 | 64,4 |
| PolyMATH | 46,1 | 40,0 | 46,2 |

Notas de la model card: para tareas muy exigentes (PolyMATH y todas las de razonamiento y código) se usó una longitud de salida de 81.920 tokens; para el resto, 32.768 tokens. En Arena-Hard v2 se reportan tasas de victoria evaluadas por GPT-4.1.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16 los pesos ocupan aproximadamente 8 GB, más la caché KV; con contexto de 262.144 tokens la caché KV crece de forma significativa y puede dominar el consumo de memoria. Con cuantización de 8 bits se reduce a unos 4-5 GB y con 4 bits a unos 2,5-3 GB (estimaciones a partir del tamaño de parámetros; la model card no publica cifras exactas).
- GPU recomendadas: para contexto completo de 262 K se recomienda A100 80 GB o H100; para contextos moderados (8 K-32 K) basta una RTX 4090 (24 GB) o incluso una RTX 3090.
- Cabe en GPU de consumo: sí, en RTX 4090, 4080, 3090 y similares con cuantización o contextos reducidos; en GPUs de 8-12 GB requiere cuantización de 4 bits y contextos cortos.
- Opciones de despliegue: transformers (>= 4.51.0), vLLM (>= 0.8.5, con `--enable-reasoning --reasoning-parser deepseek_r1`), SGLang (>= 0.4.6.post1, con `--reasoning-parser deepseek-r1`), y TGI (etiqueta `text-generation-inference` en el repo). No se confirma soporte de llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada. La model card advierte que el modelo puede requerir secuencias largas de tokens para razonar, por lo que la latencia por respuesta es mayor que en modelos instruct convencionales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-4B-Thinking-2507 | 4,0 B (denso) | 262.144 | Apache 2.0 | Modo thinking obligatorio; mejoras en razonamiento y agentes frente a Qwen3-4B Thinking |
| Qwen3-4B Thinking (versión previa) | 4,0 B (denso) | 32.768 (según versión original) | Apache 2.0 | Inferior en AIME25 (65,6 vs 81,3), IFEval (81,9 vs 87,4) y TAU2-Airline (28,0 vs 58,0) |
| Qwen3-30B-A3B Thinking | 30 B totales / 3 B activos (MoE) | 262.144 | Apache 2.0 | Superior en conocimiento (MMLU-Pro 78,5 vs 74,0) pero inferior en AIME25 (70,9 vs 81,3) e IFEval (86,5 vs 87,4) |
| Alternativas de otros fabricantes (p. ej. Llama, Gemma, Mistral) | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Modo thinking obligatorio: no existe modo instruct puro; todas las respuestas incluyen razonamiento interno, lo que incrementa latencia y consumo de tokens. No es adecuado para aplicaciones que requieran respuestas inmediatas y breves.
- Riesgo de alucinación: como todo LLM, puede generar contenido plausible pero incorrecto, especialmente en tareas de conocimiento factual y en cadenas de razonamiento largas. Requiere verificación en producción.
- Sesgos: la model card no documenta sesgos específicos; se debe asumir el riesgo habitual de sesgos presentes en los datos de preentrenamiento.
- Limitaciones de contexto: aunque soporta 262.144 tokens nativos, la model card advierte que contextos muy largos pueden provocar OOM y recomienda reducirlos si es necesario; además, el rendimiento en contextos extremos no está cuantificado.
- Idiomas: la lista concreta de idiomas soportados no está disponible; los benchmarks multilingües muestran un rendimiento inferior al de modelos mayores (MMLU-ProX 64,2 e INCLUDE 64,4 frente a 73,1 y 71,9 del MoE de 30 B).
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar el enlace de licencia original de Qwen para condiciones adicionales.
- Repositorio espejo: este repo lo publica `grad-descent` (0 descargas, 0 likes); para producción conviene usar el repositorio oficial `Qwen/Qwen3-4B-Thinking-2507` y verificar la integridad de los pesos.
- Compatibilidad: requiere `transformers>=4.51.0`; versiones anteriores fallan con `KeyError: 'qwen3'`.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/grad-descent/Qwen3-4B-Thinking-2507
- Repositorio oficial del modelo: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507
- Licencia original: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507/blob/main/LICENSE
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Chat de Qwen: https://chat.qwen.ai/
- Paper de referencia (arXiv): https://arxiv.org/abs/2505.09388
