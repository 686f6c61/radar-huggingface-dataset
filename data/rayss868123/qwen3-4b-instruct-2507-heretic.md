# rayss868123/Qwen3-4B-Instruct-2507-heretic

## Resumen

rayss868123/Qwen3-4B-Instruct-2507-heretic es una variante "decensored" (abliterated) del modelo denso Qwen3-4B-Instruct-2507 de Alibaba Qwen, publicada por el usuario rayss868123 en HuggingFace. El modelo conserva la arquitectura y los pesos del original de 4.022.468.096 parámetros (3,6B no de embedding, 36 capas, GQA con 32 cabezas de consulta y 8 de clave/valor) y 262.144 tokens de contexto nativo, pero sus matrices de proyección han sido modificadas para eliminar la dirección de rechazo aprendida durante el post-entrenamiento.

La modificación se ha realizado con Heretic v1.2.0, una herramienta que optimiza automáticamente los parámetros de abliteración (pesos y posiciones por capa en attn.o_proj y mlp.down_proj) minimizando una función objetivo que combina la divergencia KL respecto al modelo original y el número de rechazos. Según la model card, el resultado pasa de 100/100 rechazos en el modelo original a 5/100 en esta variante, con una divergencia KL de 0,0741.

Su relevancia es doble: por un lado, es un caso de estudio reproducible de cómo una intervención de bajo coste (sin reentrenamiento) altera el comportamiento de seguridad de un modelo alineado; por otro, ofrece un modelo de 4B con contexto de 256K, licencia Apache 2.0 y ejecución en GPU de consumo, útil para investigación en alineación, red-teaming y generación de contenido sin filtros. No se han publicado evaluaciones de capacidades sobre esta variante concreta, por lo que el rendimiento declarado corresponde al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal denso (sin MoE), atención con GQA |
| Parametros totales | 4.022.468.096 (4,0B); 3,6B no de embedding |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos (256K) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos safetensors. Admite cuantizacion posterior con llama.cpp (GGUF), AWQ, GPTQ o bitsandbytes |
| Idiomas soportados | no disponible en la ficha; el modelo base Qwen3-4B-Instruct-2507 declara capacidades multilingües (evaluadas en MultiIF, MMLU-ProX, INCLUDE y PolyMATH) |
| Licencia | Apache 2.0 (enlace de licencia al repositorio de Qwen) |
| Formato de pesos | safetensors (compatible con transformers) |
| Numero de capas | 36 |
| Cabezas de atencion | 32 para Q y 8 para KV (GQA) |
| Modo de razonamiento | solo modo no-thinking; no genera bloques `<think></think>` |
| Metodo de modificacion | Abliteration con Heretic v1.2.0 |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Tamano del repositorio | 8,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo base Qwen3-4B-Instruct-2507 es un transformer decoder causal denso de 36 capas, con atención por consultas agrupadas (32 cabezas de consulta y 8 de clave/valor, lo que reduce notablemente el coste de la caché KV en contexto largo) y 262.144 tokens de ventana nativa. La versión 2507 corresponde a un refinamiento del modo no-thinking del Qwen3 original, con mejoras declaradas en seguimiento de instrucciones, razonamiento lógico, comprensión de texto, matemáticas, ciencia, código y uso de herramientas, además de mejor cobertura de conocimiento de cola larga en múltiples idiomas. La ficha del modelo base indica que pasó por pretraining y post-training, pero no detalla la composición del dataset, el número de tokens ni si se emplearon RLHF o DPO; esos datos se remiten al informe técnico de Qwen3 (arXiv:2505.09388).

Sobre esa base, esta variante aplica abliteration: se identifica una dirección en el espacio de activaciones asociada al rechazo y se ortogonalizan las matrices de salida de atención y de bajada del MLP contra ella, con un peso y una posición de aplicación por capa. Heretic v1.2.0 optimiza esos parámetros de forma automática buscando el equilibrio entre eliminar rechazos y mantenerse cerca del modelo original. Los valores concretos publicados en la model card son los siguientes:

| Parametro de abliteration | Valor |
|---|---|
| direction_index | 18,29 |
| attn.o_proj.max_weight | 3,22 |
| attn.o_proj.max_weight_position | 24,83 |
| attn.o_proj.min_weight | 0,51 |
| attn.o_proj.min_weight_distance | 18,68 |
| mlp.down_proj.max_weight | 1,47 |
| mlp.down_proj.max_weight_position | 23,59 |
| mlp.down_proj.min_weight | 0,60 |
| mlp.down_proj.min_weight_distance | 9,63 |

El único resultado medido sobre esta variante es la divergencia KL respecto al modelo original (0,0741) y el recuento de rechazos (5/100 frente a 100/100). No hay ningún dato publicado sobre si la intervención degrada el razonamiento, el código o el soporte multilingüe.

## Capacidades

- Generación de texto conversacional en modo no-thinking, sin bloques de razonamiento explícito.
- Seguimiento de instrucciones y tareas abiertas: el modelo base obtiene 83,4 en IFEval y 43,4 de win rate en Arena-Hard v2.
- Razonamiento lógico y matemáticas: ZebraLogic 80,2, AIME25 47,4 y HMMT25 31,0 en el modelo base.
- Generación de código: LiveCodeBench v6 35,1 y MultiPL-E 76,8 en el modelo base.
- Tool calling y function calling: BFCL-v3 61,9 en el modelo base.
- Agentes y razonamiento multi-paso con uso de herramientas: TAU1-Retail 48,7, TAU1-Airline 32,0, TAU2-Retail 40,4 y TAU2-Airline 24,0 en el modelo base.
- Comprensión de contexto largo: ventana nativa de 256K tokens.
- Capacidades multilingües heredadas del modelo base (MultiIF 69,0, MMLU-ProX 61,6, INCLUDE 60,1, PolyMATH 31,1).
- Ausencia efectiva de rechazos ante peticiones que el modelo original rechazaría (5/100 frentes a 100/100), según la model card.
- No dispone de visión, audio ni modo thinking.

## Casos de uso

- Investigación en seguridad y alineación: sirve como sujeto de comparación frente al modelo alineado para estudiar qué comportamientos cambian al eliminar la dirección de rechazo y cuantificar el coste en calidad mediante divergencia KL.
- Red-teaming y evaluación de salvaguardas: al no rechazar, permite generar de forma controlada prompts y respuestas que un modelo alineado bloquearía, para probar clasificadores de contenido y filtros de moderación en pipelines propios.
- Generación de datos sintéticos sin sesgo de rechazo: se puede usar para producir datasets de entrenamiento o destilación en dominios donde el modelo original se niega sistemáticamente, con revisión humana posterior obligatoria.
- Escritura creativa y ficción sin restricciones temáticas: con 256K tokens de contexto puede mantener coherencia en novelas o guiones largos completos, y el modelo base obtiene 83,5 en Creative Writing v3 y 83,4 en WritingBench.
- Análisis de documentos extensos y RAG: contratos, expedientes o informes de cientos de páginas caben en una sola ventana de 262.144 tokens, evitando la fragmentación en chunks y la pérdida de contexto entre fragmentos.
- Asistentes conversacionales multi-turno autoalojados: su tamaño de 4B permite desplegarlo en una GPU de consumo o en una instancia pequeña, con coste marginal por token muy bajo frente a APIs propietarias.
- Agentes con herramientas en producción: el soporte de function calling del modelo base (BFCL-v3 61,9) permite integrarlo en flujos de automatización con APIs externas, bases de datos o sistemas de ticketing.
- Asistencia a la programación en IDE o CI/CD: generación y revisión de código con 256K de contexto para analizar repositorios completos y proponer parches dentro de un mismo prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidades para esta variante abliterada. La model card solo aporta dos métricas propias. La tabla siguiente recoge esas métricas y, a continuación, los resultados publicados por Qwen para el modelo base, que son la referencia de partida (no los de esta variante).

| Metrica propia de la variante | Este modelo | Qwen/Qwen3-4B-Instruct-2507 |
|---|---|---|
| Divergencia KL | 0,0741 | 0 (por definición) |
| Rechazos | 5/100 | 100/100 |

| Benchmark (modelo base) | GPT-4.1-nano | Qwen3-30B-A3B (no-thinking) | Qwen3-4B (no-thinking) | Qwen3-4B-Instruct-2507 |
|---|---|---|---|---|
| MMLU-Pro | 62,8 | 69,1 | 58,0 | 69,6 |
| MMLU-Redux | 80,2 | 84,1 | 77,3 | 84,2 |
| GPQA | 50,3 | 54,8 | 41,7 | 62,0 |
| SuperGPQA | 32,2 | 42,2 | 32,0 | 42,8 |
| AIME25 | 22,7 | 21,6 | 19,1 | 47,4 |
| HMMT25 | 9,7 | 12,0 | 12,1 | 31,0 |
| ZebraLogic | 14,8 | 33,2 | 35,2 | 80,2 |
| LiveBench 20241125 | 41,5 | 59,4 | 48,4 | 63,0 |
| LiveCodeBench v6 | 31,5 | 29,0 | 26,4 | 35,1 |
| MultiPL-E | 76,3 | 74,6 | 66,6 | 76,8 |
| Aider-Polyglot | 9,8 | 24,4 | 13,8 | 12,9 |
| IFEval | 74,5 | 83,7 | 81,2 | 83,4 |
| Arena-Hard v2 | 15,9 | 24,8 | 9,5 | 43,4 |
| Creative Writing v3 | 72,7 | 68,1 | 53,6 | 83,5 |
| WritingBench | 66,9 | 72,2 | 68,5 | 83,4 |
| BFCL-v3 | 53,0 | 58,6 | 57,6 | 61,9 |
| TAU1-Retail | 23,5 | 38,3 | 24,3 | 48,7 |
| TAU1-Airline | 14,0 | 18,0 | 16,0 | 32,0 |
| TAU2-Retail | no disponible | 31,6 | 28,1 | 40,4 |
| TAU2-Airline | no disponible | 18,0 | 12,0 | 24,0 |
| TAU2-Telecom | no disponible | 18,4 | 17,5 | 13,2 |
| MultiIF | 60,7 | 70,8 | 61,3 | 69,0 |
| MMLU-ProX | 56,2 | 65,1 | 49,6 | 61,6 |
| INCLUDE | 58,6 | 67,8 | 53,8 | 60,1 |
| PolyMATH | 15,6 | 23,3 | 16,6 | 31,1 |

## Requisitos de hardware

- Pesos en bf16/fp16: aproximadamente 8,0 GB (4,02B parámetros × 2 bytes; el repositorio ocupa 8,1 GB).
- Pesos en int8: aproximadamente 4,0 GB. En 4 bits: aproximadamente 2,2-2,5 GB.
- Caché KV: 144 KiB por token en fp16 (2 × 36 capas × 8 cabezas KV × 128 dimensiones × 2 bytes). Equivale a unos 4,7 GB a 32K tokens y a unos 36 GiB si se agota la ventana de 262.144 tokens, por lo que el contexto completo exige mucha memoria adicional o cuantización de la caché.
- GPU recomendadas para bf16 con contexto moderado: RTX 4090 (24 GB), RTX 3090 (24 GB), L4 (24 GB), A100 40 GB, H100 80 GB.
- Cabe en GPU de consumo: sí. En 4 bits entra en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070); en bf16 requiere al menos 12-16 GB, siendo cómodo a partir de 24 GB.
- Opciones de despliegue: transformers (se requiere transformers >= 4.51.0), vLLM >= 0.8.5, SGLang >= 0.4.6.post1, TGI (la ficha incluye la etiqueta text-generation-inference y endpoints_compatible) y llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles. No hay cifras publicadas de tokens por segundo para esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento de referencia | Modificacion |
|---|---|---|---|---|---|
| rayss868123/Qwen3-4B-Instruct-2507-heretic | 4,02B (denso) | 262.144 tokens | Apache 2.0 | Solo KL 0,0741 y 5/100 rechazos; sin evaluaciones de capacidades | Abliteration con Heretic v1.2.0 |
| Qwen/Qwen3-4B-Instruct-2507 | 4,02B (denso, 3,6B no embedding) | 262.144 tokens | Apache 2.0 | MMLU-Pro 69,6; AIME25 47,4; BFCL-v3 61,9; IFEval 83,4 | Ninguna (modelo alineado original) |
| Qwen3-30B-A3B (no-thinking) | 30B totales, MoE con aproximadamente 3B activos según nomenclatura | no disponible en la informacion proporcionada | Apache 2.0 | MMLU-Pro 69,1; AIME25 21,6; BFCL-v3 58,6 | Ninguna |
| GPT-4.1-nano-2025-04-14 | no disponible | no disponible | Propietaria | MMLU-Pro 62,8; AIME25 22,7; BFCL-v3 53,0 | Ninguna |

No se dispone de datos de otras variantes abliterated comparables en la información proporcionada, por lo que la comparación directa entre alternativas sin censura queda como no disponible.

## Limitaciones y advertencias

- La abliteration elimina deliberadamente el comportamiento de rechazo: el modelo puede generar contenido dañino, ilegal o sexual explícito sin negarse. La responsabilidad del uso recae por completo en el despliegue.
- No hay evaluaciones de capacidades de esta variante: se desconoce cuánto han degradado las 36 capas intervenidas el razonamiento, el código o la adherencia a instrucciones. La divergencia KL de 0,0741 indica una desviación medible, no necesariamente inocua.
- El modelo base no usa modo thinking y no genera bloques `<think></think>`; no se debe esperar cadena de razonamiento explícita ni forzarla con prompts.
- Riesgo de alucinación propio de un modelo de 4B: en tareas de conocimiento factual, en cálculo numérico y en citas de fuentes la fiabilidad es limitada, especialmente fuera de los dominios mejor representados en el entrenamiento.
- El contexto nativo es de 262.144 tokens, pero el rendimiento efectivo se degrada en ventanas muy largas y no hay ninguna medición publicada de esta variante con contexto extendido.
- La ficha no declara los idiomas soportados de forma explícita; el multilingüismo es heredado del modelo base y no está verificado tras la abliteration.
- Licencia Apache 2.0, que permite uso comercial y modificaciones, pero el enlace de licencia apunta al repositorio de Qwen: conviene verificar los términos del titular original antes de redistribuir.
- Repositorio sin validación comunitaria: 0 descargas y 0 likes, autor individual y sin garantías de integridad o reproducibilidad de los pesos.
- En despliegues regulados (sanidad, finanzas, educación) el modelo no debe usarse sin filtros externos de entrada y salida, dado que su alineación de seguridad ha sido eliminada por diseño.
- Una cuantización agresiva a 4 bits puede alterar aún más las direcciones de activación y agravar la pérdida de coherencia observada respecto al modelo original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rayss868123/Qwen3-4B-Instruct-2507-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio de Qwen3: https://github.com/QwenLM/Qwen3
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Informe técnico citado en las etiquetas: https://arxiv.org/abs/2505.09388
- Chat de demostración: https://chat.qwen.ai

Nota: la búsqueda web no ha devuelto ningún enlace técnico relacionado con el modelo; los resultados obtenidos eran contenido para adultos sin relación con Qwen3 ni con abliteration, por lo que se han descartado.
