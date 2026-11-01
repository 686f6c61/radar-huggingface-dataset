# fuad404/Over-aii

## Resumen

DeepSeek-V4-Pro-0813 es la versión oficial (no preview) de DeepSeek-V4-Pro, un modelo de lenguaje de gran escala desarrollado por DeepSeek AI. Se distribuye en HuggingFace bajo el identificador `fuad404/Over-aii`, aunque la model card corresponde a la release oficial de DeepSeek. El modelo está orientado a cargas de trabajo agénticas y de generación de código en producción, y según el autor supera a la versión preview en todos los benchmarks publicados y compite con modelos propietarios de primer nivel como Opus-4.8 o Fable-5.

La arquitectura es un transformer con mezcla de expertos (MoE), con un total de 1.650.497.936.906 parámetros (aproximadamente 1,65 billones) según los pesos en safetensors. Incorpora un módulo de decodificación especulativa propio denominado DSpark, que acelera la inferencia. El repositorio ocupa 892,8 GB y los pesos se distribuyen en formato safetensors con cuantización fp8/8-bit.

La relevancia actual del modelo radica en su enfoque explícito hacia tareas de agente (Terminal Bench, Toolathlon, Agents' Last Exam, Cybergym) y desarrollo full-stack, con un modo de razonamiento configurable en tres niveles (`low`, `high`, `max`) y sin plantilla de chat Jinja, sustituida por scripts de codificación propios en la carpeta `encoding`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) |
| Parámetros totales | 1.650.497.936.906 (~1,65 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | fp8, 8-bit |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer con mezcla de expertos (MoE), según se deduce de los parámetros de despliegue (`--enable-expert-parallel`, `--moe-backend deep_gemm_mega_moe`) y del tamaño total de 1,65 billones de parámetros. La model card no detalla el número de expertos, la proporción de parámetros activos por token ni la composición del dataset de entrenamiento. Tampoco se especifica el número de tokens de preentrenamiento ni si se aplicaron fases de RLHF o DPO.

La innovación técnica destacable es DSpark, un módulo de decodificación especulativa integrado en el propio modelo que se activa mediante un flag en vLLM (`--speculative-config '{"method":"dspark","num_speculative_tokens":7,"draft_sample_method":"greedy"}'`) o en SGLang (`--speculative-algorithm DSPARK`). El despliegue recomendado usa caché KV en fp8, block size 256, data parallelism 4, expert parallelism y un backend MoE específico (`deep_gemm_mega_moe`), además de una caché de índice en fp4 (`use_fp4_indexer_cache`). La model card menciona un informe técnico en arXiv (2606.19348) que no se ha podido consultar en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento con modo de deliberación configurable en tres niveles (`low`, `high`, `max`) que controla el esfuerzo de razonamiento antes de responder.
- Capacidades agénticas avanzadas: Terminal Bench 2.1, Toolathlon-Verified, Agents' Last Exam y AutomationBench, orientadas a uso de herramientas y razonamiento multi-paso.
- Generación de código y desarrollo full-stack: NL2Repo, DeepSWE, DSBench-FullStack y DSBench-Hard.
- Ciberseguridad ofensiva/defensiva evaluada en Cybergym.
- Soporte de tool calling y function calling, implícito en los benchmarks de agentes y en el formato de mensajes compatible con OpenAI.
- Codificación de mensajes mediante scripts Python propios (`encode_messages`, `parse_message_from_completion_text`) en lugar de plantilla Jinja.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agentes autónomos de terminal y línea de comandos: el modelo obtiene 87,9 en Terminal Bench 2.1, por lo que es adecuado para tareas de shell, gestión de ficheros y automatización de sistemas operativos dentro de un harness agéntico.
- Desarrollo full-stack asistido: con 71,1 en DSBench-FullStack y 61,5 en NL2Repo, puede generar repositorios completos a partir de descripciones en lenguaje natural, integrándose en pipelines de CI/CD para scaffolding y refactorización.
- Automatización de flujos de trabajo con herramientas: Toolathlon-Verified (74,1) y AutomationBench (31,8) indican buen rendimiento en orquestación de APIs y tareas multi-paso, útil para RPA y agentes de back-office.
- Auditoría y pruebas de seguridad: Cybergym (83,3) sugiere uso en análisis de vulnerabilidades, fuzzing guiado y generación de exploits controlados en entornos de seguridad.
- Atención al cliente compleja: el modo de razonamiento `max` y el soporte de tool calling permiten gestionar conversaciones multi-turno con consulta a sistemas externos, aunque la longitud de contexto no está documentada.
- Investigación y resolución de problemas científicos: HLE con herramientas alcanza 60,0, lo que lo hace apto para asistencia en investigación con acceso a buscadores y calculadoras.
- Migración y modernización de código legacy: DeepSWE (62,7) y DSBench-Hard (67,2) respaldan su uso en tareas de ingeniería de software difíciles con contexto de repositorio.

## Benchmarks y rendimiento

| Benchmark | V4-Pro-0813 | V4-Flash-0731 | V4-Pro (Preview) | V4-Flash (Preview) | GLM-5.2 | Kimi K3 | Opus-4.8 | Fable-5 (w/ fallback) |
|---|---|---|---|---|---|---|---|---|
| HLE (sin/con herramientas) | 42,7 / 60,0 | 37,8 / 51,5 | 37,7 / 48,2 | 34,8 / 45,1 | 40,5 / 54,7 | 43,5 / 56,0 | 49,8 / 57,9 | 53,3 / 63,0 |
| Terminal Bench 2.1 | 87,9 | 82,7 | 72,1 | 61,8 | 81,0 | 88,3 | 85,0 | 88,0 |
| NL2Repo | 61,5 | 54,2 | 38,5 | 39,4 | 48,9 | - | 69,7 | - |
| Cybergym | 83,3 | 76,7 | 52,7 | 38,7 | - | 80,0 | 78,3 | 83,1 |
| DeepSWE | 62,7 | 54,4 | 12,8 | 7,3 | 46,2 | 67,5 | 58,0 | 70,0 |
| Toolathlon-Verified | 74,1 | 70,3 | 55,9 | 49,7 | 59,9 | 76,5 | 76,2 | 77,9 |
| Agents' Last Exam | 25,7 | 25,2 | 16,5 | 15,8 | 23,8 | 27,6 | 25,7 | - |
| AutomationBench (Public) | 31,8 | 25,1 | 12,8 | 10,8 | 12,9 | 30,8 | 27,2 | 29,1 |
| DSBench-FullStack † | 71,1 | 68,7 | 41,8 | 37,0 | 61,8 | 73,7 | 71,6 | 77,2 |
| DSBench-Hard † | 67,2 | 59,6 | 31,1 | 25,8 | 54,5 | 63,0 | 71,7 | 68,3 |

Las evaluaciones de tareas de agente de código se realizaron con el modo minimal de DeepSeek Harness, `max` reasoning effort y `temperature = 1.0, top_p = 0.95`. Los conjuntos marcados con † son internos de DeepSeek.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita, pero con 1,65 billones de parámetros en fp8 el peso de los pesos ronda los 1,6 TB, por lo que requiere agregación de memoria en múltiples nodos.
- GPU recomendadas: la model card documenta despliegue en un nodo con 4×GB300 mediante vLLM; también se mencionan recetas alternativas en la documentación de vLLM.
- No cabe en GPU de consumo (RTX 4090, 5090, etc.) por el tamaño del modelo.
- Opciones de despliegue: vLLM (con `--speculative-config` para DSpark, `--enable-expert-parallel`, `--moe-backend deep_gemm_mega_moe`, `--kv-cache-dtype fp8`, `--block-size 256`, `--data-parallel-size 4`) y SGLang (`--speculative-algorithm DSPARK`). No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento destacado |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-0813 | ~1,65 B (MoE) | no disponible | MIT | HuggingFace | Terminal Bench 87,9; DeepSWE 62,7 |
| DeepSeek-V4-Flash-0731 | no disponible | no disponible | no disponible | HuggingFace (DeepSeek) | Terminal Bench 82,7; DeepSWE 54,4 |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | Terminal Bench 88,3; DeepSWE 67,5 |
| GLM-5.2 | no disponible | no disponible | no disponible | no disponible | Terminal Bench 81,0; DeepSWE 46,2 |
| Opus-4.8 | no disponible | no disponible | propietaria | API | HLE 49,8; NL2Repo 69,7 |

DeepSeek-V4-Pro-0813 destaca por ser el único de la comparativa con licencia MIT y pesos abiertos, lo que lo diferencia de Opus-4.8 (propietario) y de los modelos GLM-5.2 y Kimi K3, cuyos términos de licencia y disponibilidad de pesos no se detallan en la información proporcionada.

## Limitaciones y advertencias

- No se documentan sesgos conocidos, pero al ser un modelo de gran escala entrenado con datos web es probable que herede sesgos de esos corpus; no hay información oficial al respecto.
- Riesgo de alucinación inherente a los modelos de lenguaje; los benchmarks de HLE y agentes no eliminan este riesgo en producción.
- Longitud de contexto no documentada, lo que impide planificar despliegues con ventanas largas sin validación empírica.
- Idiomas soportados no documentados; no se puede garantizar calidad en castellano u otras lenguas distintas del inglés sin evaluación propia.
- Licencia MIT: permite uso comercial, modificación y redistribución, pero conviene revisar las dependencias (vLLM, SGLang, `deep_gemm_mega_moe`) y sus propias licencias.
- El repositorio en HuggingFace (`fuad404/Over-aii`) tiene 0 descargas y 0 likes, y su autor no coincide con DeepSeek AI; la model card parece una copia de la release oficial, por lo que la procedencia de los pesos debe verificarse antes de usarlos en producción.
- No incluye plantilla de chat Jinja; requiere usar los scripts de la carpeta `encoding`, lo que añade complejidad de integración.
- El despliegue exige hardware de centro de datos (4×GB300 documentado) y backend MoE específico; no es viable en infraestructura de consumo.

## Enlaces

- HuggingFace: https://huggingface.co/fuad404/Over-aii
- Informe técnico (arXiv): https://arxiv.org/abs/2606.19348
- Página de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Organización DeepSeek en HuggingFace: https://huggingface.co/deepseek-ai
- Twitter de DeepSeek: https://twitter.com/deepseek_ai
- Receta de vLLM para DeepSeek-V4-Pro: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Pro
