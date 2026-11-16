# atifahmed2789/Qwen3-235B-A22B-Instruct-2507

## Resumen

Qwen3-235B-A22B-Instruct-2507 es la version actualizada del modo no-thinking del modelo Qwen3-235B-A22B, desarrollado por el equipo Qwen de Alibaba. Se trata de un modelo de lenguaje causal de tipo Mixture-of-Experts (MoE) con 235.093.634.560 parametros totales y aproximadamente 22.000 millones de parametros activos por token, disenado para generacion de texto, razonamiento, codigo, matematicas y uso de herramientas.

Esta version "Instruct-2507" se centra exclusivamente en el modo no-thinking: no genera bloques `<think></think>`, por lo que no es necesario especificar `enable_thinking=False`. Frente a la version anterior no-thinking, la model card reporta mejoras sustanciales en seguimiento de instrucciones, razonamiento logico, comprension de texto, matematicas, ciencia, codigo y uso de herramientas, ademas de una mayor cobertura de conocimiento de cola larga en multiples idiomas y mejor alineacion con preferencias subjetivas.

El modelo soporta de forma nativa una longitud de contexto de 262.144 tokens, extensible hasta 1.010.000 tokens, y se distribuye bajo licencia Apache 2.0. La arquitectura tiene 94 capas, 128 expertos con 8 activados por token, y atencion GQA con 64 cabezas de consulta y 4 de clave-valor. Esta publicado en el repositorio de Hugging Face `atifahmed2789/Qwen3-235B-A22B-Instruct-2507`, un espejo del modelo oficial de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con Mixture-of-Experts (MoE), atencion GQA |
| Parametros totales | 235.093.634.560 (235B) |
| Parametros activos | 22B (8 de 128 expertos activados por token) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible (la model card menciona mejoras en cobertura multilingue de cola larga, sin listado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer causal con arquitectura Mixture-of-Experts: 94 capas, 128 expertos en total y 8 expertos activados por token, lo que resulta en 235B parametros totales (234B no-embedding) y aproximadamente 22B parametros activos. La atencion usa Grouped Query Attention con 64 cabezas de consulta y 4 de clave-valor. El pipeline declarado es `text-generation` y la arquitectura en transformers es `qwen3_moe`, que requiere `transformers>=4.51.0` (con versiones anteriores se produce un `KeyError: 'qwen3_moe'`).

El modelo ha pasado por fases de preentrenamiento y post-entrenamiento. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas especificas de RLHF o DPO; unicamente indica que esta version esta optimizada para el modo no-thinking y que mejora en alineacion con preferencias subjetivas y en conocimiento multilingue de cola larga. No se dispone de informacion sobre innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional y de alta calidad, incluyendo tareas subjetivas y abiertas.
- Razonamiento logico y comprension de texto.
- Matematicas y ciencia: la model card reporta mejoras sustanciales en AIME25, HMMT25, GPQA y SuperGPQA.
- Generacion de codigo en multiples lenguajes (MultiPL-E, LiveCodeBench v6, Aider-Polyglot).
- Uso de herramientas y function calling (BFCL-v3, TAU1 y TAU2).
- Comprension de contexto largo de hasta 256K tokens, con extension hasta 1.010.000 tokens.
- Capacidades multilingues mejoradas en conocimiento de cola larga (MultiIF, MMLU-ProX, INCLUDE, PolyMATH).
- Modo no-thinking exclusivo: no genera bloques `<think></think>` y no requiere `enable_thinking=False`.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 262.144 tokens nativos, manteniendo coherencia en historiales extensos y usando tool calling para consultar sistemas internos (pedidos, reservas, facturacion).
- Generacion de codigo en produccion: soporta tool calling y puede integrarse en pipelines de CI/CD para revision de codigo, generacion de tests y refactorizacion, con buen rendimiento en LiveCodeBench v6 (51,8) y MultiPL-E (87,9).
- Agentes autonomos multi-paso: con BFCL-v3 de 70,9 y resultados en TAU1/TAU2, es adecuado para orquestar flujos con llamadas a APIs, navegacion y toma de decisiones encadenadas.
- Analisis de documentos largos: resumen, extraccion de entidades y respuesta a preguntas sobre contratos, informes o expedientes de cientos de miles de tokens gracias a la ventana de contexto extendida.
- Asistencia en matematicas y ciencia: resolucion de problemas de competicion y explicaciones tecnicas, respaldado por AIME25 (70,3) y GPQA (77,5).
- Generacion de contenido creativo y marketing: redaccion de textos abiertos con mejor alineacion subjetiva (Creative Writing v3: 87,5; WritingBench: 85,2).
- Traduccion y procesamiento multilingue: tareas de traduccion, resumen y clasificacion en multiples idiomas, con mejoras reportadas en MMLU-ProX (79,4) y MultiIF (77,5).

## Benchmarks y rendimiento

Resultados reportados en la model card (porcentajes):

| Benchmark | Deepseek-V3-0324 | GPT-4o-0327 | Claude Opus 4 Non-thinking | Kimi K2 | Qwen3-235B-A22B Non-thinking | Qwen3-235B-A22B-Instruct-2507 |
|---|---|---|---|---|---|---|
| MMLU-Pro | 81,2 | 79,8 | 86,6 | 81,1 | 75,2 | 83,0 |
| MMLU-Redux | 90,4 | 91,3 | 94,2 | 92,7 | 89,2 | 93,1 |
| GPQA | 68,4 | 66,9 | 74,9 | 75,1 | 62,9 | 77,5 |
| SuperGPQA | 57,3 | 51,0 | 56,5 | 57,2 | 48,2 | 62,6 |
| SimpleQA | 27,2 | 40,3 | 22,8 | 31,0 | 12,2 | 54,3 |
| CSimpleQA | 71,1 | 60,2 | 68,0 | 74,5 | 60,8 | 84,3 |
| AIME25 | 46,6 | 26,7 | 33,9 | 49,5 | 24,7 | 70,3 |
| HMMT25 | 27,5 | 7,9 | 15,9 | 38,8 | 10,0 | 55,4 |
| ARC-AGI | 9,0 | 8,8 | 30,3 | 13,3 | 4,3 | 41,8 |
| ZebraLogic | 83,4 | 52,6 | - | 89,0 | 37,7 | 95,0 |
| LiveBench 20241125 | 66,9 | 63,7 | 74,6 | 76,4 | 62,5 | 75,4 |
| LiveCodeBench v6 (25.02-25.05) | 45,2 | 35,8 | 44,6 | 48,9 | 32,9 | 51,8 |
| MultiPL-E | 82,2 | 82,7 | 88,5 | 85,7 | 79,3 | 87,9 |
| Aider-Polyglot | 55,1 | 45,3 | 70,7 | 59,0 | 59,6 | 57,3 |
| IFEval | 82,3 | 83,9 | 87,4 | 89,8 | 83,2 | 88,7 |
| Arena-Hard v2* | 45,6 | 61,9 | 51,5 | 66,1 | 52,0 | 79,2 |
| Creative Writing v3 | 81,6 | 84,9 | 83,8 | 88,1 | 80,4 | 87,5 |
| WritingBench | 74,5 | 75,5 | 79,2 | 86,2 | 77,0 | 85,2 |
| BFCL-v3 | 64,7 | 66,5 | 60,1 | 65,2 | 68,0 | 70,9 |
| TAU1-Retail | 49,6 | 60,3# | 81,4 | 70,7 | 65,2 | 71,3 |
| TAU1-Airline | 32,0 | 42,8# | 59,6 | 53,5 | 32,0 | 44,0 |
| TAU2-Retail | 71,1 | 66,7# | 75,5 | 70,6 | 64,9 | 74,6 |
| TAU2-Airline | 36,0 | 42,0# | 55,5 | 56,5 | 36,0 | 50,0 |
| TAU2-Telecom | 34,0 | 29,8# | 45,2 | 65,8 | 24,6 | 32,5 |
| MultiIF | 66,5 | 70,4 | - | 76,2 | 70,2 | 77,5 |
| MMLU-ProX | 75,8 | 76,2 | - | 74,5 | 73,2 | 79,4 |
| INCLUDE | 80,1 | 82,1 | - | 76,9 | 75,6 | 79,5 |
| PolyMATH | 32,2 | 25,5 | 30,0 | 44,8 | 27,0 | 50,2 |

*: win rates evaluados por GPT-4.1. #: resultados generados con GPT-4o-20241120.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion proporcionada. Con 235B parametros totales, en precision BF16 los pesos ocupan aproximadamente 470 GB (coincide con el tamano del repo de 470,2 GB); en cuantizaciones de 8 bits o 4 bits el requisito se reduce proporcionalmente, aunque no se detallan valores concretos.
- GPU recomendadas: la model card sugiere despliegue con tensor parallelism (`--tp 8`) en SGLang o vLLM, lo que implica multiples GPU de clase datacenter (A100, H100, H200 o similares). No se especifican modelos concretos.
- Cabe en GPU consumer: no de forma directa con los pesos completos; requeriria cuantizacion agresiva y offloading, no documentado en la informacion disponible.
- Opciones de despliegue: `transformers>=4.51.0`, `sglang>=0.4.6.post1`, `vllm>=0.8.5`, con creacion de endpoint compatible con OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-235B-A22B-Instruct-2507 | 235B totales / 22B activos | 262.144 nativos, hasta 1.010.000 | Apache 2.0 | Hugging Face (espejo y oficial) |
| DeepSeek-V3-0324 | no disponible en la informacion | no disponible | no disponible | no disponible |
| Kimi K2 | no disponible en la informacion | no disponible | no disponible | no disponible |
| GPT-4o-0327 | propietario | no disponible | propietario | API |
| Claude Opus 4 (non-thinking) | propietario | no disponible | propietario | API |

Los benchmarks comparativos de la model card muestran que Qwen3-235B-A22B-Instruct-2507 supera a DeepSeek-V3-0324, GPT-4o-0327 y Kimi K2 en varios benchmarks de conocimiento, razonamiento y matematicas (por ejemplo, AIME25: 70,3 frente a 46,6, 26,7 y 49,5), mientras que Kimi K2 y Claude Opus 4 mantienen ventaja en algunos benchmarks de agente (TAU2-Telecom, TAU1-Retail). No se dispone de datos de parametros ni licencia de los modelos comparados en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; como modelo entrenado con datos web a gran escala, es previsible que herede sesgos de esos datos.
- Riesgo de alucinacion: la model card no lo cuantifica; los resultados en SimpleQA (54,3) y CSimpleQA (84,3) indican margen de error en conocimiento factual.
- Limitaciones de contexto o idioma: la lista de idiomas soportados no esta disponible; las mejoras multilingues se describen de forma cualitativa.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribucion; el enlace de licencia apunta al repositorio oficial de Qwen.
- Caveat de produccion: el modelo es exclusivamente no-thinking; no genera bloques `<think></think>` y no debe configurarse `enable_thinking=False`. Requiere `transformers>=4.51.0` para evitar el error `KeyError: 'qwen3_moe'`.
- El repositorio consultado (`atifahmed2789/Qwen3-235B-A22B-Instruct-2507`) es un espejo con 0 descargas y 0 likes; para produccion conviene usar el repositorio oficial de Qwen y verificar integridad de pesos.
- El despliegue requiere infraestructura multi-GPU de clase datacenter; no se documentan requisitos exactos de VRAM ni latencias.

## Enlaces

- Repositorio Hugging Face (espejo): https://huggingface.co/atifahmed2789/Qwen3-235B-A22B-Instruct-2507
- Repositorio oficial: https://huggingface.co/Qwen/Qwen3-235B-A22B-Instruct-2507
- Licencia: https://huggingface.co/Qwen/Qwen3-235B-A22B-Instruct-2507/blob/main/LICENSE
- Blog: https://qwenlm.github.io/blog/qwen3/
- GitHub: https://github.com/QwenLM/Qwen3
- Documentacion: https://qwen.readthedocs.io/en/latest/
- Chat: https://chat.qwen.ai/
- Papers referenciados en los tags: arxiv:2402.17463, arxiv:2407.02490, arxiv:2501.15383, arxiv:2404.06654, arxiv:2505.09388
