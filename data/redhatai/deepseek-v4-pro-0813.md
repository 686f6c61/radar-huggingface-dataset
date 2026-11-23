# RedHatAI/DeepSeek-V4-Pro-0813

## Resumen

DeepSeek-V4-Pro-0813 es la versión oficial del modelo insignia de la familia DeepSeek V4, publicada por DeepSeek y redistribuida en cuantización FP8 de 8 bits por Red Hat AI (RedHatAI) bajo el identificador `RedHatAI/DeepSeek-V4-Pro-0813`. Sustituye a la versión Preview y se centra en mejorar de forma notable las capacidades agénticas y el rendimiento en entornos de producción. El modelo cuenta con 1,65 billones de parámetros totales (1.650.497.936.906 según los pesos en safetensors) y una arquitectura de tipo `deepseek_v4` con mezcla de expertos (MoE), lo que permite activar solo una fracción de los parámetros por token.

La relevancia de esta versión radica en su salto cualitativo en tareas de agente: frente a la Preview, mejora de forma drástica en benchmarks como DeepSWE (62,7 frente a 12,8), NL2Repo (61,5 frente a 38,5) o Cybergym (83,3 frente a 52,7), y se sitúa en rango competitivo con modelos propietarios de primer nivel como Opus-4.8 o Fable-5 en varias pruebas. Incorpora además un módulo de decodificación especulativa propio, DSpark, que acelera la inferencia y se activa con un único flag en vLLM.

La licencia es MIT, lo que facilita su uso comercial, y el repositorio ocupa 892,8 GB en formato safetensors cuantizado a FP8. Está pensado para despliegues de gran escala en clústeres con GPUs de última generación (por ejemplo, nodos de 4×GB300), no para hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), familia `deepseek_v4` |
| Parametros totales | 1.650.497.936.906 (1,65 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (8 bits); pesos publicados en safetensors cuantizados |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la estructura de DeepSeek-V4-Pro (Preview), una arquitectura transformer con mezcla de expertos (MoE) y atención optimizada, e incorpora un módulo de decodificación especulativa denominado DSpark adjunto al modelo base. Este módulo permite generar varios tokens candidatos por paso con un modelo borrador y validarlos con el modelo principal, reduciendo la latencia de generación; en vLLM se activa mediante `--speculative-config` con `method: dspark`, `num_speculative_tokens: 7` y `draft_sample_method: greedy`.

No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO). La model card menciona un informe técnico en arXiv (2606.19348) que presumiblemente contiene estos datos, pero su contenido no se incluye aquí. Sí se documenta un sistema de razonamiento configurable mediante el parámetro `reasoning_effort` con tres niveles (`low`, `high`, `max`), que controla cuánto delibera el modelo antes de responder, y un modo de pensamiento (`thinking_mode`) integrado en la plantilla de codificación propia.

## Capacidades

- Generación de texto y razonamiento avanzado con modo de pensamiento configurable en tres niveles de esfuerzo (`low`, `high`, `max`).
- Capacidades agénticas reforzadas: ejecución de tareas multi-paso, uso de herramientas y automatización de flujos complejos, con mejoras notables frente a la Preview en benchmarks como Toolathlon-Verified, AutomationBench y Agents' Last Exam.
- Ingeniería de software y código: resolución de problemas de desarrollo full-stack (DSBench-FullStack, DSBench-Hard), generación de repositorios a partir de lenguaje natural (NL2Repo) y tareas de terminal (Terminal Bench 2.1).
- Ciberseguridad ofensiva y defensiva evaluada en Cybergym.
- Razonamiento científico y de conocimiento experto con y sin herramientas (HLE con y sin tools).
- Soporte de function calling y tool calling, con compatibilidad con endpoints de estilo OpenAI (`endpoints_compatible`).
- Codificación y decodificación de mensajes mediante scripts Python propios (`encoding_dsv4`), sin plantilla Jinja estándar.
- Capacidades multilingües: no documentadas en la información disponible.

## Casos de uso

- Agentes autónomos de desarrollo de software: el modelo puede resolver tareas de ingeniería de extremo a extremo (lectura de repositorio, edición de código, ejecución en terminal) gracias a sus resultados en Terminal Bench 2.1 (87,9) y DeepSWE (62,7), integrándose en pipelines de CI/CD como agente de corrección o generación de parches.
- Generación de repositorios completos a partir de especificaciones en lenguaje natural: con 61,5 en NL2Repo, es adecuado para prototipado rápido de aplicaciones full-stack donde se parte de un brief y se espera un esqueleto de código funcional.
- Automatización de operaciones de seguridad: su puntuación de 83,3 en Cybergym lo hace apto para tareas de análisis de vulnerabilidades, simulación de ataques controlados y respuesta a incidentes en entornos autorizados.
- Asistentes de investigación con acceso a herramientas: el rendimiento de 60,0 en HLE con herramientas permite usarlo en flujos de búsqueda, verificación y síntesis de información científica con recuperación aumentada.
- Automatización de procesos empresariales multi-paso: con 74,1 en Toolathlon-Verified y 31,8 en AutomationBench, puede orquestar llamadas a APIs, hojas de cálculo y sistemas internos en flujos de back-office.
- Razonamiento de alta exigencia con control de coste: el parámetro `reasoning_effort` permite ajustar la profundidad de deliberación según la tarea, usando `low` para consultas simples y `max` para problemas complejos, optimizando latencia y consumo.
- Despliegue en producción a gran escala: la integración con vLLM, la decodificación especulativa DSpark y el soporte de FP8 permiten servir el modelo en clústeres multi-GPU con throughput elevado.

## Benchmarks y rendimiento

| Benchmark | V4-Pro-0813 | V4-Flash-0731 | V4-Pro (Preview) | V4-Flash (Preview) | GLM-5.2 | Kimi K3 | Opus-4.8 | Fable-5 (w/ fallback) |
|---|---|---|---|---|---|---|---|---|
| HLE (sin / con herramientas) | 42,7 / 60,0 | 37,8 / 51,5 | 37,7 / 48,2 | 34,8 / 45,1 | 40,5 / 54,7 | 43,5 / 56,0 | 49,8 / 57,9 | 53,3 / 63,0 |
| Terminal Bench 2.1 | 87,9 | 82,7 | 72,1 | 61,8 | 81,0 | 88,3 | 85,0 | 88,0 |
| NL2Repo | 61,5 | 54,2 | 38,5 | 39,4 | 48,9 | - | 69,7 | - |
| Cybergym | 83,3 | 76,7 | 52,7 | 38,7 | - | 80,0 | 78,3 | 83,1 |
| DeepSWE | 62,7 | 54,4 | 12,8 | 7,3 | 46,2 | 67,5 | 58,0 | 70,0 |
| Toolathlon-Verified | 74,1 | 70,3 | 55,9 | 49,7 | 59,9 | 76,5 | 76,2 | 77,9 |
| Agents' Last Exam | 25,7 | 25,2 | 16,5 | 15,8 | 23,8 | 27,6 | 25,7 | - |
| AutomationBench (público) | 31,8 | 25,1 | 12,8 | 10,8 | 12,9 | 30,8 | 27,2 | 29,1 |
| DSBench-FullStack † | 71,1 | 68,7 | 41,8 | 37,0 | 61,8 | 73,7 | 71,6 | 77,2 |
| DSBench-Hard † | 67,2 | 59,6 | 31,1 | 25,8 | 54,5 | 63,0 | 71,7 | 68,3 |

† DSBench-FullStack y DSBench-Hard son conjuntos de prueba internos de DeepSeek. Las tareas de agente de código se evaluaron con el modo minimal de DeepSeek Harness, `reasoning_effort = max`, `temperature = 1.0` y `top_p = 0.95`.

## Requisitos de hardware

- VRAM estimada: con 1,65 billones de parámetros en FP8, los pesos ocupan aproximadamente 1,65 TB; se requiere un clúster multi-GPU con memoria agregada muy superior a esa cifra para acomodar pesos, caché KV y activaciones.
- GPU recomendadas: el ejemplo oficial de despliegue usa un nodo de 4×GB300 con vLLM. Se recomienda hardware de centro de datos de última generación (GB300, H100/H200, B200) con interconexión de alta velocidad.
- No cabe en GPUs de consumo (RTX 4090, 5090 ni similares); el modelo no está pensado para inferencia local en una sola tarjeta.
- Opciones de despliegue: vLLM es la vía documentada, con soporte de `--kv-cache-dtype fp8`, `--enable-expert-parallel`, `--moe-backend deep_gemm_mega_moe`, caché de índice FP4 (`use_fp4_indexer_cache`) y decodificación especulativa DSpark. No se documentan recetas para llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no se publican cifras concretas; la decodificación especulativa DSpark (7 tokens especulativos, muestreo greedy) está orientada a reducir la latencia de generación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-0813 | 1,65 B (MoE, FP8) | no disponible | MIT | Hugging Face (RedHatAI) | Mejor equilibrio agéntico de la familia V4; DSpark integrado |
| DeepSeek-V4-Flash-0731 | no disponible | no disponible | no disponible | Hugging Face (DeepSeek) | Variante más ligera; inferior en todos los benchmarks publicados |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | Competitivo en Terminal Bench (88,3), DeepSWE (67,5) y Toolathlon (76,5) |
| Opus-4.8 | no disponible | no disponible | propietaria | API | Superior en HLE (49,8 sin herramientas) y NL2Repo (69,7) |

## Limitaciones y advertencias

- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información proporcionada; conviene auditar el modelo antes de usos sensibles.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala; los resultados en HLE (42,7 sin herramientas) indican que aún comete errores en razonamiento experto.
- El repositorio no incluye plantilla de chat Jinja; es obligatorio usar los scripts de la carpeta `encoding` para formatear mensajes correctamente, lo que añade complejidad de integración.
- No se especifican los idiomas soportados ni la longitud de contexto, lo que dificulta planificar despliegues con requisitos multilingües o de contexto largo.
- El tamaño (892,8 GB en el repositorio, ~1,65 TB de pesos FP8) exige infraestructura de centro de datos; no es viable en hardware de consumo.
- Aunque la licencia es MIT, el uso comercial de un modelo de este tamaño implica costes operativos elevados y requisitos de cumplimiento propios de cada organización.
- Las puntuaciones en DSBench-FullStack y DSBench-Hard provienen de conjuntos internos de DeepSeek y no son verificables de forma independiente.
- La información de benchmarks corresponde al autor del modelo; no se han incluido evaluaciones de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RedHatAI/DeepSeek-V4-Pro-0813
- Informe técnico (arXiv): https://arxiv.org/abs/2606.19348
- Organización DeepSeek en Hugging Face: https://huggingface.co/deepseek-ai
- Página principal de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Receta de vLLM para DeepSeek-V4-Pro: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Pro
- Repositorio DeepSeek-V2 (recursos gráficos y referencia): https://github.com/deepseek-ai/DeepSeek-V2
- Twitter/X de DeepSeek: https://twitter.com/deepseek_ai
