# ArchiveStudio/Qwen3-30B-A3B-Instruct-2507

## Resumen

Qwen3-30B-A3B-Instruct-2507 es un modelo de lenguaje causal de tipo Mixture-of-Experts (MoE) desarrollado por el equipo Qwen de Alibaba. Se trata de la revisión de julio de 2025 (sufijo 2507) del modelo Qwen3-30B-A3B en su variante "non-thinking", es decir, sin generación de bloques de razonamiento explícito `<think>`. El modelo cuenta con 30.532 millones de parámetros totales, de los cuales solo 3.300 millones se activan por token gracias a una arquitectura con 128 expertos y 8 activados por capa, lo que permite un coste de inferencia muy inferior al de un modelo denso de tamaño equivalente.

La relevancia de esta revisión radica en las mejoras sustanciales frente a la versión original en instrucciones, razonamiento lógico, comprensión de texto, matemáticas, ciencia, código y uso de herramientas, así como en una mejor cobertura de conocimiento de cola larga en múltiples idiomas y un alineamiento más fino con preferencias subjetivas del usuario. Mantiene una longitud de contexto nativa de 262.144 tokens, lo que lo sitúa en la gama alta para tareas de contexto largo.

El repositorio analizado (ArchiveStudio/Qwen3-30B-A3B-Instruct-2507) es una réplica de los pesos oficiales de Qwen publicada bajo licencia Apache 2.0, con 61,1 GB de tamaño en formato safetensors y compatibilidad con la librería `transformers` (requiere versión 4.51.0 o superior para el tipo `qwen3_moe`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con Mixture-of-Experts (MoE), GQA (32 cabezas Q, 4 KV), 48 capas, 128 expertos con 8 activados |
| Parámetros totales | 30.532.122.624 (30,5B); 29,9B sin embeddings |
| Parámetros activos | 3,3B por token |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantización | No disponible en la información proporcionada (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no listadas) |
| Idiomas soportados | No disponible de forma explícita; la model card menciona mejoras en cobertura multilingüe de cola larga |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer causal con mezcla de expertos (MoE) de 48 capas. Cada capa contiene 128 expertos, de los cuales se activan 8 por token, lo que da lugar a 3,3B parámetros activos sobre un total de 30,5B (29,9B excluyendo embeddings). La atención utiliza Grouped-Query Attention con 32 cabezas de consulta y 4 de clave-valor, una configuración que reduce el coste de memoria de la caché KV en contextos largos. El contexto nativo es de 262.144 tokens.

El modelo se distribuye tras una fase de preentrenamiento y una fase de post-entrenamiento (la model card indica "Pretraining & Post-training" sin detallar la composición del dataset, el número de tokens ni si se emplearon RLHF o DPO). Las mejoras de la revisión 2507 se centran en instrucciones, razonamiento lógico, matemáticas, ciencia, código, uso de herramientas, conocimiento multilingüe de cola larga y alineamiento con preferencias subjetivas. Esta variante es exclusivamente "non-thinking": no genera bloques `<think></think>` y no requiere el parámetro `enable_thinking=False`. No se dispone de información sobre innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional y de formato largo con contexto de hasta 262.144 tokens.
- Razonamiento lógico y matemático (AIME25, HMMT25, ZebraLogic evaluados en la model card).
- Conocimiento general y científico (MMLU-Pro, GPQA, SuperGPQA).
- Generación de código en múltiples lenguajes (LiveCodeBench v6, MultiPL-E, Aider-Polyglot).
- Uso de herramientas y function calling (BFCL-v3, benchmarks TAU1/TAU2 de agentes).
- Capacidades multilingües con mejoras en conocimiento de cola larga (MultiIF, MMLU-ProX, INCLUDE, PolyMATH).
- Alineamiento con preferencias subjetivas y escritura creativa (Arena-Hard v2, Creative Writing v3, WritingBench).
- Modo exclusivamente non-thinking: no emite bloques de razonamiento explícito.
- No se mencionan capacidades de visión ni audio en la información disponible.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con historiales extensos gracias a sus 262.144 tokens de contexto, manteniendo coherencia en hilos largos y recuperando información de mensajes previos sin truncar.
- Generación de código en producción: su rendimiento en LiveCodeBench v6 (43,2) y MultiPL-E (83,8) permite integrarlo en pipelines de CI/CD para autocompletado, revisión de parches y generación de tests, con soporte de tool calling para invocar linters o compiladores.
- Agentes con function calling: las puntuaciones en BFCL-v3 (65,1) y TAU1/TAU2 lo hacen adecuado para asistentes que encadenan llamadas a APIs (reservas, consultas de catálogo, gestión de tickets) en flujos multi-paso.
- Análisis de documentos largos: informes financieros, contratos o expedientes de cientos de miles de tokens pueden procesarse en una sola pasada sin técnicas de chunking, gracias al contexto nativo de 256K.
- Razonamiento matemático y científico asistido: con AIME25 (61,3) y GPQA (70,4), es útil para tutores automáticos, verificación de demostraciones y resolución de problemas técnicos en entornos educativos o de I+D.
- Generación de contenido multilingüe: las mejoras en PolyMATH (43,1) y MMLU-ProX (72,0) permiten redactar y traducir contenido técnico en varios idiomas manteniendo calidad en lenguas de recursos medios.
- Escritura creativa y marketing: con Creative Writing v3 (86,0) y WritingBench (85,5), resulta adecuado para generación de copy, guiones y textos de marca con alineamiento subjetivo.
- Despliegue económico en producción: al activar solo 3,3B parámetros por token, el coste de inferencia se reduce frente a modelos densos de 30B, lo que lo hace viable para servicios con alto volumen de peticiones.

## Benchmarks y rendimiento

Datos publicados en la model card (comparativa con modelos de referencia):

| Benchmark | DeepSeek-V3-0324 | GPT-4o-0327 | Gemini-2.5-Flash (non-thinking) | Qwen3-235B-A22B (non-thinking) | Qwen3-30B-A3B (non-thinking) | Qwen3-30B-A3B-Instruct-2507 |
|---|---|---|---|---|---|---|
| MMLU-Pro | 81,2 | 79,8 | 81,1 | 75,2 | 69,1 | 78,4 |
| MMLU-Redux | 90,4 | 91,3 | 90,6 | 89,2 | 84,1 | 89,3 |
| GPQA | 68,4 | 66,9 | 78,3 | 62,9 | 54,8 | 70,4 |
| SuperGPQA | 57,3 | 51,0 | 54,6 | 48,2 | 42,2 | 53,4 |
| AIME25 | 46,6 | 26,7 | 61,6 | 24,7 | 21,6 | 61,3 |
| HMMT25 | 27,5 | 7,9 | 45,8 | 10,0 | 12,0 | 43,0 |
| ZebraLogic | 83,4 | 52,6 | 57,9 | 37,7 | 33,2 | 90,0 |
| LiveBench 20241125 | 66,9 | 63,7 | 69,1 | 62,5 | 59,4 | 69,0 |
| LiveCodeBench v6 (25.02-25.05) | 45,2 | 35,8 | 40,1 | 32,9 | 29,0 | 43,2 |
| MultiPL-E | 82,2 | 82,7 | 77,7 | 79,3 | 74,6 | 83,8 |
| Aider-Polyglot | 55,1 | 45,3 | 44,0 | 59,6 | 24,4 | 35,6 |
| IFEval | 82,3 | 83,9 | 84,3 | 83,2 | 83,7 | 84,7 |
| Arena-Hard v2* | 45,6 | 61,9 | 58,3 | 52,0 | 24,8 | 69,0 |
| Creative Writing v3 | 81,6 | 84,9 | 84,6 | 80,4 | 68,1 | 86,0 |
| WritingBench | 74,5 | 75,5 | 80,5 | 77,0 | 72,2 | 85,5 |
| BFCL-v3 | 64,7 | 66,5 | 66,1 | 68,0 | 58,6 | 65,1 |
| TAU1-Retail | 49,6 | 60,3# | 65,2 | 65,2 | 38,3 | 59,1 |
| TAU1-Airline | 32,0 | 42,8# | 48,0 | 32,0 | 18,0 | 40,0 |
| TAU2-Retail | 71,1 | 66,7# | 64,3 | 64,9 | 31,6 | 57,0 |
| TAU2-Airline | 36,0 | 42,0# | 42,5 | 36,0 | 18,0 | 38,0 |
| TAU2-Telecom | 34,0 | 29,8# | 16,9 | 24,6 | 18,4 | 12,3 |
| MultiIF | 66,5 | 70,4 | 69,4 | 70,2 | 70,8 | 67,9 |
| MMLU-ProX | 75,8 | 76,2 | 78,3 | 73,2 | 65,1 | 72,0 |
| INCLUDE | 80,1 | 82,1 | 83,8 | 75,6 | 67,8 | 71,9 |
| PolyMATH | 32,2 | 25,5 | 41,9 | 27,0 | 23,3 | 43,1 |

*: win rates evaluados por GPT-4.1. #: resultados generados con GPT-4o-20241120.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan aproximadamente 61,1 GB (BF16). En cuantización de 8 bits se reduciría a unos 31 GB, y en 4 bits a unos 16-18 GB, aunque el coste real depende de la caché KV, que con 262.144 tokens de contexto es considerable.
- GPU recomendadas: para BF16 completo se requiere una GPU con 80 GB (A100 80GB, H100 80GB) o varias GPUs; para 8 bits, una A100 40GB o dos RTX 4090; para 4 bits, una RTX 4090 (24 GB) o RTX 3090 puede ser suficiente con contexto moderado.
- Cabe en GPU consumer: sí, en cuantizaciones de 4 bits (RTX 4090, RTX 3090) siempre que se limite la longitud de contexto; el contexto completo de 256K exige mucha más memoria por la caché KV.
- Opciones de despliegue: `transformers` (>= 4.51.0), vLLM (>= 0.8.5), SGLang (>= 0.4.6.post1). La model card no menciona llama.cpp ni Ollama, aunque al ser safetensors podría convertirse a GGUF con herramientas externas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | MMLU-Pro | AIME25 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3-30B-A3B-Instruct-2507 | 30,5B / 3,3B | 262.144 | 78,4 | 61,3 | Apache 2.0 | HuggingFace (réplica ArchiveStudio) |
| Qwen3-30B-A3B (non-thinking) | 30,5B / 3,3B | 262.144 (según familia Qwen3) | 69,1 | 21,6 | Apache 2.0 | HuggingFace (Qwen oficial) |
| Qwen3-235B-A22B (non-thinking) | 235B / 22B | 262.144 (según familia Qwen3) | 75,2 | 24,7 | Apache 2.0 | HuggingFace (Qwen oficial) |
| DeepSeek-V3-0324 | No disponible en la información | No disponible | 81,2 | 46,6 | No disponible en la información | No disponible en la información |

## Limitaciones y advertencias

- El modelo es exclusivamente non-thinking: no genera bloques `<think></think>`, por lo que no es adecuado para tareas que se beneficien de razonamiento explícito paso a paso.
- Riesgo de alucinación inherente a los modelos de lenguaje; la model card no documenta tasas específicas ni mitigaciones.
- Sesgos conocidos: no se detallan en la información proporcionada; como modelo entrenado con datos web a gran escala, es probable que herede sesgos de esos corpus.
- Limitaciones de idioma: la lista explícita de idiomas soportados no está disponible; las mejoras multilingües se describen de forma cualitativa.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y atribución; el enlace de licencia apunta al repositorio oficial de Qwen.
- En producción, el contexto de 262.144 tokens implica un consumo elevado de memoria para la caché KV; conviene limitar `max-model-len` según el hardware.
- El repositorio analizado es una réplica de terceros (ArchiveStudio) con 0 descargas y 0 likes; para producción se recomienda usar los pesos oficiales de Qwen.
- La fecha de creación del repositorio (2026-11-01) es posterior a la publicación oficial del modelo; verificar la integridad de los pesos antes de desplegar.

## Enlaces

- Repositorio analizado: https://huggingface.co/ArchiveStudio/Qwen3-30B-A3B-Instruct-2507
- Repositorio oficial: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Licencia oficial: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507/blob/main/LICENSE
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentación: https://qwen.readthedocs.io/en/latest/
- Chat de demostración: https://chat.qwen.ai/?model=Qwen3-30B-A3B-2507
