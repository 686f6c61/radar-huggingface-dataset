# kaitemoreau/GLM-5.3

## Resumen

GLM-5.3 es un modelo de lenguaje de gran escala publicado en Hugging Face bajo el identificador `kaitemoreau/GLM-5.3`, con arquitectura `glm_moe_dsa` (mezcla de expertos con atención dispersa) y 753.329.940.480 parámetros totales según los pesos en safetensors. El repositorio ocupa 755,7 GB y se distribuye en formato safetensors para la librería `transformers`. La model card indica que reutiliza la misma base que GLM-5.2 y que todas las mejoras provienen de la fase de post-entrenamiento.

El modelo está orientado a generación de texto conversacional y a tareas de agente de horizonte largo: la model card destaca mejoras sustanciales en programación compleja, uso de terminal, descubrimiento de vulnerabilidades y automatización de flujos multi-paso. Declara resultados estado del arte en pesos abiertos en Terminal Bench 3.0 y Agents' Last Exam, además de un rendimiento notable en CyberGym y ExploitBench.

Es relevante porque combina un tamaño de parámetros muy elevado con licencia propia (`glm-5.3`, etiquetada como `other`) y soporte explícito para los principales motores de inferencia (SGLang, vLLM, TokenSpeed, Transformers, KTransformers, Unsloth), además de plataformas Ascend NPU. Su ventana de contexto operativa es amplia: la evaluación de HLE con herramientas se realizó con hasta 300.000 tokens de contexto y NL2Repo con 1M de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `glm_moe_dsa` (mezcla de expertos con atención dispersa) |
| Parametros totales | 753.329.940.480 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible como especificación oficial; en evaluación se usan hasta 300.000 tokens (HLE con herramientas) y 1M de contexto (NL2Repo) |
| Tipos de cuantizacion | fp8 (etiqueta del repositorio); no se detallan otras variantes |
| Idiomas soportados | en, zh |
| Licencia | `glm-5.3` (license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura declarada es `glm_moe_dsa`, una variante de mezcla de expertos con atención dispersa (sparse attention) integrada en un transformer. El repositorio incluye la etiqueta `fp8`, lo que sugiere pesos publicados en precisión de 8 bits. No se dispone de información sobre el número de parámetros activos por token, la composición del dataset de preentrenamiento ni el volumen de tokens utilizados.

Según la model card, GLM-5.3 comparte el modelo base con GLM-5.2 y todas las ganancias provienen del post-entrenamiento. El autor señala que al escalar el post-entrenamiento surgió una capacidad "ciber" emergente más rápida de lo esperado, con mejoras especialmente grandes en la parte alta de la cadena de explotación. No se detallan en la información disponible las técnicas concretas de alineación (RLHF, DPO u otras), aunque el énfasis en tareas de agente y razonamiento multi-paso apunta a un entrenamiento intensivo en entornos ejecutables. El modelo expone un parámetro `reasoning_effort` con tres niveles (`low`, `high`, `max`) y una opción `clear_thinking` en la plantilla de chat.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento de horizonte largo y tareas multi-paso orientadas a agentes.
- Programación compleja: la model card reporta una mejora del 50 % sobre GLM-5.2 en su benchmark interno Z.ai Code Bench.
- Uso de terminal y entornos CLI (Terminal Bench 2.1 y 3.0, Agents' Last Exam en variante CLI).
- Ingeniería de software automatizada (DeepSWE, SWE-Marathon, FrontierSWE, NL2Repo).
- Descubrimiento de vulnerabilidades y explotación (CyberGym, ExploitGym, ExploitBench).
- Uso de herramientas y function calling (Toolathlon Verified, HLE con herramientas).
- Control del presupuesto de razonamiento mediante `reasoning_effort` (`low`, `high`, `max`).
- Capacidad multimodal: no disponible.

## Casos de uso

- Automatización de ingeniería de software: el modelo puede resolver tareas de reparación de repositorios y generación de código a partir de lenguaje natural, con resultados destacados en DeepSWE (66,9) y NL2Repo (58,0), lo que lo hace adecuado para pipelines de CI/CD con agentes que abren parches y ejecutan pruebas.
- Operación de agentes en terminal: con 88,2 en Terminal Bench 2.1 y 28,3 en Terminal Bench 3.0, puede emplearse en asistentes que ejecutan comandos, inspeccionan sistemas y completan flujos de administración de forma autónoma.
- Auditoría de seguridad y bug bounty: su rendimiento en CyberGym (84,5) y ExploitBench (54,4) lo sitúa como candidato para triaje de vulnerabilidades y generación de pruebas de concepto en entornos controlados.
- Automatización de flujos de trabajo empresariales: con 48,2 en AutomationBench v1.0.6 y 73,0 en Toolathlon Verified, encaja en orquestadores que encadenan APIs y herramientas con razonamiento multi-paso.
- Asistencia a investigación técnica: 62,5 en HLE con herramientas y contexto de hasta 300.000 tokens permiten usarlo en análisis de documentación extensa y síntesis con recuperación aumentada.
- Migración y modernización de código legacy: la combinación de contexto largo y capacidades de agente facilita reescribir módulos, generar pruebas y validar cambios sobre bases de código grandes.
- Evaluación de decisiones con datos estructurados: 1769 en GDPval-AA v2 sugiere utilidad en tareas de análisis y respuesta a preguntas sobre dominios económicos y administrativos.

## Benchmarks y rendimiento

| Benchmark | GLM-5.3 | GLM-5.2 | Kimi K3 | DeepSeek-V4 Pro-0813 | Qwen3.8-Max | Opus 4.8 | Fable 5 (w/ fallback) | GPT-5.6 Sol |
|---|---|---|---|---|---|---|---|---|
| Terminal Bench 2.1 | 88,2 | 81,0 | 88,3 | 87,9 | 86,6 | 85,0 | 88,0 | **88,8** |
| Terminal Bench 3.0 | 28,3 | 4,6 | 17,4 | – | – | 21,1 | 33,7 | **34,6** |
| DeepSWE (v1.1) | 66,9 | 46,2 | 67,5 | 62,7 | 56,6 | 58,0 | 69,7 | **72,7** |
| NL2Repo | 58,0 | 48,9 | 58,0 | 61,1 | 55,9 | **69,7** | – | – |
| ProgramBench (Almost Solved) | 19,0 | 9,5 | 17,5 | – | 10,5 | 15,5 | **33,0** | 23,0 |
| FrontierSWE | 78,1 | 67,5 | – | – | – | 66,5 | **88,2** | – |
| SWE-Marathon (v1.1) | 42,5 | 19,4 | 48,1 | – | – | **48,8** | 33,1 | 42,5 |
| PostTrainBench | 39,8 | 31,7 | 32,0 | – | – | 32,9 | **41,8** | 36,2 |
| CyberGym | **84,5** | 77,2 | 80,0 | 83,3 | 78,5 | 78,1 | 83,8 | 83,6 |
| ExploitGym (2h / 6h) | 105 / 130 | 29 / 39 | 36 / 70 | – | 14 / 26 | 80 / 120 | 181 / 247 | **216 / 293** |
| ExploitBench | 54,4 | 24,4 | 32,2 | – | 28,8 | 40,0 | **78,0** | 76,5 |
| Toolathlon Verified | 73,0 | 59,9 | **76,5** | 74,1 | 72,5 | 76,2 | 74,7 | 74,9 |
| AutomationBench (v1.0.6) | **48,2** | 26,2 | 46,7 | 43,2 | 39,8 | 41,0 | 46,2 | 45,8 |
| Agents' Last Exam (ALE-CLI) | 28,5 | 23,8 | 27,6 | 25,7 | 27,0 | 25,7 | 23,8 | **28,6** |
| HLE w/ Tools | 62,5 | 54,7 | 59,8 | 60,0 | 56,2 | 57,9 | 63,9 | **64,5** |
| GDPval-AA v2 | **1769** | 1508 | 1682 | 1590 | 1739 | 1588 | 1743 | 1730 |

Notas de evaluación recogidas en la model card: HLE con herramientas se evalúa con `temperature=1.0`, `top_p=0.95`, longitud máxima de generación de 163.840 tokens, contexto máximo de 300.000 tokens y GPT-5.6-luna (medium) como juez. NL2Repo se evalúa con `temperature=1.0`, `top_p=1.0`, `max_new_tokens=64k` y contexto de 1M. Los resultados son los declarados por el autor y no se han verificado de forma independiente en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 753.329.940.480 parámetros en fp8 se requiere aproximadamente 1,5 TB de memoria de acelerador solo para pesos; el despliegue exige agregación multi-GPU o multi-nodo.
- GPU recomendadas: nodos con GPU de centro de datos (A100/H100/H200 o equivalentes) en configuración multi-GPU; no se dispone de cifras oficiales de configuración mínima.
- GPU de consumo: no cabe en tarjetas consumer (RTX 4090, 24 GB) ni en configuraciones multi-GPU de consumo habituales, dado el tamaño del repositorio (755,7 GB).
- Opciones de despliegue: SGLang, vLLM, TokenSpeed, Transformers, KTransformers y Unsloth; en Ascend NPU se soportan vLLM-Ascend, xLLM y SGLang.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3 | 753,3 B (totales) | hasta 300k–1M en evaluación | CyberGym 84,5; AutomationBench 48,2; GDPval-AA v2 1769 | `glm-5.3` (other) | Pesos safetensors en HF |
| GLM-5.2 | no disponible | no disponible | CyberGym 77,2; Terminal Bench 3.0 4,6 | no disponible | Referenciado en la model card |
| Kimi K3 | no disponible | no disponible | Terminal Bench 2.1 88,3; Toolathlon Verified 76,5 | no disponible | Referenciado en la model card |
| DeepSeek-V4 Pro-0813 | no disponible | no disponible | Terminal Bench 2.1 87,9; Toolathlon Verified 74,1 | no disponible | Referenciado en la model card |
| Qwen3.8-Max | no disponible | no disponible | GDPval-AA v2 1739 | no disponible | Referenciado en la model card |

Los datos de parámetros, contexto y licencia de los modelos comparados no están disponibles en la información proporcionada; la comparación se limita a los resultados de benchmark publicados por el autor de GLM-5.3.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés y chino; el rendimiento en castellano no está documentado.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado tasas específicas de calibración o fidelidad factual.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Capacidad "ciber" emergente: el propio autor advierte de un aumento inesperado en capacidades de explotación, lo que exige controles de uso y políticas de acceso en producción.
- Licencia `glm-5.3` con etiqueta `other`: es necesario revisar el texto completo de la licencia antes de cualquier uso comercial; las condiciones no están detalladas en la información disponible.
- El despliegue requiere infraestructura multi-GPU de centro de datos; no es viable en hardware de consumo.
- Los benchmarks son los declarados por el autor y no se han verificado de forma independiente.
- En la plantilla de chat, `clear_thinking` es `false` por defecto; para escenarios conversacionales debe pasarse explícitamente `clear_thinking=true`.
- `reasoning_effort` toma por defecto `max` si no se especifica o si se pasa un valor distinto de `low`/`high`, lo que incrementa coste y latencia.

## Enlaces

- Hugging Face: https://huggingface.co/kaitemoreau/GLM-5.3
- Paper (referencia arXiv en etiquetas): arxiv:2602.15763
- Repositorio del proyecto: https://github.com/zai-org/GLM-5
- SGLang: https://github.com/sgl-project/sglang
- Cookbook de SGLang para GLM-5.3: https://cookbook.sglang.io/autoregressive/GLM/GLM-5.3
- vLLM: https://github.com/vllm-project/vllm
- Recetas de vLLM para GLM-5.3: https://recipes.vllm.ai/zai-org/GLM-5.3
- TokenSpeed: https://github.com/lightseekorg/tokenspeed
- Recetas de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#glm-5-3
- Transformers: https://github.com/huggingface/transformers
- Documentación de `glm_moe_dsa` en Transformers: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/glm_moe_dsa.md
- KTransformers: https://github.com/kvcache-ai/ktransformers
- Tutorial de KTransformers para GLM-5.2: https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/GLM-5.2-Tutorial.md
- Unsloth: https://github.com/unslothai/unsloth
- Guía de Unsloth para GLM-5.3: https://unsloth.ai/docs/models/GLM-5.3
- Despliegue en Ascend NPU: https://github.com/zai-org/GLM-5/blob/main/example/ascend.md
