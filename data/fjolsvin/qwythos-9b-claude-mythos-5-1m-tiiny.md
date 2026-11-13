# fjolsvin/Qwythos-9B-Claude-Mythos-5-1M-tiiny

## Resumen

Qwythos-9B es un modelo de razonamiento de 9.409.813.744 parámetros desarrollado por Empero (empero.org), construido mediante un ajuste fino de parámetros completos (full fine-tune) sobre una base Qwen3.5-9B descensurada. Se ha post-entrenado con más de 500 millones de tokens de trazas de alta calidad de Claude Mythos y Claude Fable, con cadenas de pensamiento generadas internamente por la herramienta propietaria rethink de Empero AI. La versión aquí descrita es un reempaquetado realizado por fjolsvin mediante tiiny-forge para que la importación de Hugging Face de Tiiny acepte el modelo como fine-tune de Qwen/Qwen3.5-9B; los pesos son idénticos al original empero-ai/Qwythos-9B-Claude-Mythos-5-1M.

El modelo destaca por ofrecer una ventana de contexto de 1.048.576 tokens con escalado YaRN activado por defecto, lo que lo sitúa entre los modelos de 9B con contexto más largo disponibles en abierto. Además, incorpora function calling nativo según la especificación de Qwen3.5 y está diseñado explícitamente para no aplicar censura en dominios técnicos sensibles como ciberseguridad, farmacología, biomedicina y medicina clínica.

La relevancia actual reside en su combinación de tamaño compacto (apto para hardware de consumo en cuantización), contexto extremo y capacidades agénticas con autocorrección mediante herramientas, lo que lo hace atractivo para razonamiento sobre bases de código completas, investigación multi-documento y trayectorias agénticas largas, sin necesidad de envoltorios adicionales para tool use.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5), con YaRN rope-scaling |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.048.576 tokens (1M, YaRN activado por defecto) |
| Tipos de cuantización | no disponible (repo en safetensors; se asume compatibilidad con cuantizaciones estándar de transformers) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwythos-9B se basa en la arquitectura Qwen3.5, un transformer denso de 9B parámetros, sobre el que se ha aplicado un full fine-tune (no LoRA ni adaptadores) de todos los parámetros. El entrenamiento de post-entrenamiento (SFT) se realizó sobre más de 500 millones de tokens de trazas de Claude Mythos y Claude Fable, con cadenas de pensamiento generadas in-house por la herramienta rethink de Empero AI. La base de partida es una versión "profundamente descensurada" de Qwen3.5-9B, lo que condiciona el comportamiento del modelo final en dominios sensibles.

La innovación técnica más destacable es la activación por defecto de YaRN rope-scaling para extender el contexto hasta 1.048.576 tokens, algo poco habitual en modelos de esta clase. El reempaquetado de fjolsvin sustituye el config.json por el de la base Qwen/Qwen3.5-9B manteniendo los mismos tensores y el esquema de transformers, copia merges.txt y vocab.json de la base, omite el archivo config.json.pre_yarn y cambia el pipeline_tag de text-generation a image-text-to-text. No se dispone de información sobre la composición exacta del dataset, el uso de RLHF/DPO ni detalles de decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento con cadena de pensamiento (thinking mode implícito en las trazas de entrenamiento).
- Razonamiento matemático reforzado (mejoras notables en gsm8k estricto y flexible).
- Function calling nativo según la especificación de Qwen3.5, sin envoltorio adicional: acepta `tools=[...]` en el chat template y emite bloques `<tool_call>` válidos con parámetros requeridos.
- Autocorrección con herramientas: selecciona y usa herramientas (ejecutor de Python, búsqueda web) de forma sensata y cita fuentes.
- Capacidades agénticas y razonamiento multi-paso en trayectorias largas gracias al contexto de 1M tokens.
- Procesamiento image-text-to-text (pipeline_tag del reempaquetado), aunque no se detallan capacidades de visión en la model card.
- Dominios especializados: ciberseguridad, red-teaming, biología, farmacología y medicina clínica, con menor tendencia a rechazos.
- Multilingüe: limitado a inglés (`en`).
- Modelo descensurado por diseño (tag `uncensored`).

## Casos de uso

- Razonamiento sobre bases de código completas: con 1.048.576 tokens de contexto, el modelo puede ingerir repositorios enteros y responder preguntas de arquitectura, refactorización o localización de bugs sin truncar archivos.
- Investigación multi-documento: permite cargar decenas de papers o informes y sintetizar respuestas con referencias cruzadas, aprovechando el contexto extremo y la capacidad de búsqueda web vía tool calling.
- Agentes autónomos de varias etapas: al soportar function calling nativo y autocorrección con ejecutor de Python, encaja en pipelines agénticos que requieren cálculo, verificación y consulta de fuentes en una sola trayectoria.
- Análisis de ciberseguridad y red-teaming: el modelo responde a preguntas técnicas concretas (por ejemplo, modos de Hashcat para Kerberos TGS-REP o CVEs como PrintNightmare) sin los rechazos típicos de modelos sobre-alineados, útil en auditorías y formación.
- Asistencia en farmacología y medicina clínica: puede razonar sobre indicaciones, contraindicaciones y modificaciones de fármacos (por ejemplo, el sitio de corte DPP-4 en GLP-1 o el uso de fisostigmina en intoxicación por organofosforados) citando fuentes cuando se le proporciona búsqueda web.
- Automatización de soporte técnico especializado: con contexto largo y tool use, puede gestionar conversaciones multi-turno con historial extenso y consultar documentación interna mediante herramientas.
- Evaluación y generación de código en CI/CD: integrable vía transformers para tareas de revisión, generación de tests o explicación de diffs, con la ventaja de contexto largo para analizar cambios que afectan a múltiples archivos.

## Benchmarks y rendimiento

Resultados publicados por el autor con `lm-evaluation-harness` (backend HF, `--apply_chat_template`, sampling Qwen3.5: temperature=0.6, top_p=0.95, top_k=20, `--limit 100`):

| Tarea | Métrica | Base Qwen3.5-9B | Qwythos-9B | Δ |
|---|---|---:|---:|---:|
| gsm8k | exact_match (flexible) | 0.670 | 0.860 | +0.190 |
| gsm8k | exact_match (strict) | 0.510 | 0.810 | +0.300 |
| mmlu | acc | 0.232 | 0.575 | +0.343 |
| arc_challenge | acc | 0.470 | 0.490 | +0.020 |
| arc_challenge | acc_norm | 0.400 | 0.410 | +0.010 |
| gpqa_diamond (CoT, 0-shot) | exact_match (flexible) | 0.630 | 0.580 | −0.050 |

En MMLU, Qwythos alcanza 0.575 de media en 57 materias, con picos de 0.78 en government/politics, 0.77 en college biology y 0.74 en conceptual physics. El autor advierte que los valores absolutos de MMLU en modelos de 9B son sensibles al harness, al número de few-shot y al manejo del chat template; la comparación relevante es que ambos modelos se evaluaron con ajustes idénticos. En la prueba de tool use con 7 prompts (matemáticas, ciberseguridad, farmacología clínica y bioquímica), el modelo acertó 7 de 7 con selección de herramienta sensata y citación de fuentes.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 18,8 GB en safetensors (probablemente fp16/bf16). En fp16 requiere aproximadamente 19-20 GB de VRAM; en cuantización de 8 bits, en torno a 10-11 GB; en 4 bits, alrededor de 6-7 GB (estimaciones derivadas del número de parámetros, no publicadas por el autor).
- GPU recomendadas: A100 (40/80 GB) o H100 para contexto completo de 1M tokens sin cuantizar; RTX 4090 (24 GB) para fp16 con contexto moderado; GPUs de 16 GB o menos solo con cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090 en fp16 con margen ajustado y en GPUs de 12-16 GB con cuantización de 4-8 bits. El contexto de 1M tokens incrementa notablemente el consumo de KV cache, por lo que contextos extremos requieren más VRAM o técnicas de atención eficiente.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI para serving de alto rendimiento, llama.cpp/Ollama si se generan GGUF (no confirmado en el repo). El tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwythos-9B (este) | 9,41B | 1.048.576 | apache-2.0 | Full fine-tune sobre Qwen3.5-9B, descensurado, tool calling nativo |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible | no disponible | Base del fine-tune; MMLU 0.232 y gsm8k strict 0.510 en el mismo harness |
| empero-ai/Qwythos-9B-Claude-Mythos-5-1M | 9,41B | 1M | apache-2.0 | Original del que este repo es copia con pesos idénticos |

No se dispone de datos de otros modelos de 9B comparables (por ejemplo, Llama o Mistral de tamaño similar) en la información proporcionada, por lo que la comparativa se limita a la base y al original.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados explícitamente; al ser un modelo descensurado entrenado sobre trazas de Claude, puede reproducir sesgos de esos datos y carecer de las salvaguardas habituales.
- Riesgo de alucinación: presente como en cualquier LLM; el autor demuestra que la autocorrección con herramientas mejora la factualidad, pero sin herramientas el recall de hechos especializados puede fallar.
- Limitaciones de idioma: solo inglés (`en`); el rendimiento en castellano no está garantizado ni evaluado.
- Contexto: aunque soporta 1M tokens, el rendimiento efectivo en contextos extremos no está evaluado más allá de la configuración YaRN; el consumo de KV cache es elevado.
- Licencia: apache-2.0 permite uso comercial, pero el carácter descensurado implica que el despliegue en producción debe acompañarse de filtros y políticas de uso propios.
- Caveat de producción: el modelo está diseñado para no rechazar consultas en dominios sensibles (ciberseguridad ofensiva, farmacología), lo que exige controles de acceso y auditoría en entornos corporativos.
- El reempaquetado modifica config.json, merges.txt, vocab.json y el pipeline_tag; los pesos son idénticos al original, pero conviene verificar la integridad si se compara con el repo de empero-ai.
- Benchmarks con `--limit 100`: muestras pequeñas que pueden inflar la varianza; los resultados deben interpretarse con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fjolsvin/Qwythos-9B-Claude-Mythos-5-1M-tiiny
- Modelo original: https://huggingface.co/empero-ai/Qwythos-9B-Claude-Mythos-5-1M
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Empero: https://empero.org
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- Resultados detallados (referenciados en la model card): `evals/lm_eval_results.md` dentro del repo del modelo original
