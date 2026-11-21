# bbkdevops/Qwen-AgentWorld-ULTRA

## Resumen

Auto-N.E.X.U.S. Ultra v3.0 es un modelo de lenguaje publicado en Hugging Face por el usuario bbkdevops bajo el identificador `bbkdevops/Qwen-AgentWorld-ULTRA`. Segun los metadatos del repositorio, se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 27.320.697.856 parametros totales, derivado de la familia Qwen (etiqueta `qwen3_5_moe`), orientado a generacion de codigo, razonamiento matematico y uso como agente autonomo. El autor lo presenta como un sistema cognitivo con simulacion de trayectorias especulativas, generacion dinamica de sub-agentes expertos y una supuesta cuantizacion ternaria de 1,25 bits.

El modelo se distribuye principalmente en formato GGUF con metadatos de cuantizacion FP8 e `imatrix`, y esta etiquetado con licencia Apache 2.0. La model card incluye una tabla de resultados de evaluacion en benchmarks exigentes (SWE-bench Verified, SWE-bench Multilingual, Terminal-Bench 2.1, GSM8K, APEX-Agents), con cifras que el autor situa en el primer puesto mundial en varias categorias.

Es relevante ahora porque combina dos tendencias activas en el ecosistema open source: los modelos MoE eficientes en inferencia y el entrenamiento orientado a agentes de terminal y resolucion de issues reales. No obstante, buena parte de las afirmaciones tecnicas de la model card (compresion 13,96x, cuantizacion base-3 bipolar, auditoria de entropia) no vienen acompanadas de documentacion verificable en la informacion disponible, por lo que deben tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) derivada de Qwen (tag `qwen3_5_moe`), con modulo MTP (multi-token prediction) segun el autor |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (repo), FP8, 1,25-bit ternario declarado por el autor, INT4 2:4 structured sparsity declarada |
| Idiomas soportados | en, th |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (tamano del repo 17,8 GB); safetensors referenciado en los metadatos de parametros |

## Arquitectura y entrenamiento

La informacion disponible indica una arquitectura transformer con capas Mixture-of-Experts, etiquetada como `qwen3_5_moe`, lo que sugiere una base derivada de la familia Qwen 3.5. El autor anade un componente denominado MTP (multi-token prediction) para generacion especulativa de hasta 4 tokens en una sola pasada, y describe un mecanismo de "spawning" dinamico de sub-agentes expertos especializados (ingenieria de software, arquitectura Linux, razonamiento simbolico, derecho contractual y auditoria adversarial).

No se dispone de informacion verificable sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o RL con verificadores. Los datasets listados en la model card (MMMU/MMMU_Pro, AIME 2026, SWE-bench Verified y Multilingual, SWE-bench Pro, HLE, Terminal-Bench 2.1, APEX-Agents, GSM8K) aparecen como conjuntos de evaluacion, no necesariamente como datos de entrenamiento. Las afirmaciones sobre cuantizacion ternaria bipolar `{-1, +1}`, compresion de VRAM de 13,96x y "auditoria de entropia de doble capa" carecen de detalle tecnico en la informacion proporcionada.

## Capacidades

- Generacion de texto y conversacion multi-turno.
- Razonamiento matematico y resolucion de problemas simbolicos (el autor reporta GSM8K al 97,4%).
- Generacion y reparacion de codigo, incluyendo resolucion de issues en repositorios reales (SWE-bench).
- Operacion como agente de terminal y CLI (Terminal-Bench 2.1).
- Simulacion de trayectorias multi-paso con horizonte de 4 pasos antes de ejecutar acciones.
- Soporte declarado de sub-agentes especializados por dominio.
- Generacion especulativa multi-token (MTP) de hasta 4 tokens por pasada.
- Idiomas: ingles y tailandes segun los metadatos; no se documenta soporte de castellano.
- Tool calling / function calling: no documentado explicitamente en la informacion disponible.
- Vision y audio: no disponibles.

## Casos de uso

- Resolucion automatica de issues en repositorios: el modelo esta evaluado en SWE-bench Verified y Multilingual, por lo que encaja en pipelines que reciben un issue, localizan los ficheros afectados y proponen un parche verificable con tests.
- Agente de terminal y automatizacion de sistemas: su evaluacion en Terminal-Bench 2.1 lo situa como candidato para tareas de administracion Linux, diagnostico de entornos y ejecucion de comandos encadenados con verificacion.
- Asistencia a refactorizaciones multi-lenguaje: la puntuacion declarada en SWE-bench Multilingual sugiere utilidad en bases de codigo heterogeneas (Python, Java, TypeScript, Go), integrable en revisiones de PR automatizadas.
- Razonamiento matematico asistido: con GSM8K al 97,4% declarado, es adecuado para tutoria de problemas aritmeticos y verificacion de cadenas de calculo en entornos educativos o financieros.
- Analisis de contratos y documentacion legal-comercial: el autor lo posiciona en APEX-Agents para tareas de derecho corporativo; uso realista en extraccion de clausulas y deteccion de riesgos en contratos, siempre con revision humana.
- Simulacion de planes de ejecucion antes de actuar: el mecanismo de horizonte 4 permite generar y descartar trayectorias antes de tocar produccion, util en pipelines de CI/CD con acciones destructivas.
- Despliegue en hardware de consumo: al distribuirse en GGUF y con 27,3B parametros totales, puede ejecutarse en una RTX 3090 de 24 GB segun el propio autor, lo que facilita prototipado local de agentes.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente en la informacion disponible):

| Benchmark | Tarea | Puntuacion declarada | Nota del autor |
|---|---|---|---|
| openai/gsm8k | `gsm8k` | 97,4% | Top tier mundial |
| SWE-bench Multilingual | `swe_bench_multilingual_%_resolved` | 84,8% | Afirma superar a Tencent Hy4 (82,9%) |
| SWE-bench Verified | `swe_bench_%_resolved` | 74,2% | Ejecutado en RTX 3090 con 1,25-bit 2:4 sparse |
| Terminal-Bench 2.1 (Harbor) | `terminal_bench_accuracy` | 62,9% | State-of-the-art CLI agent |
| SWE-bench Pro (ScaleAI) | `SWE_Bench_Pro` | 48,6% | Precision en horizonte largo |
| mercor/apex-agents | `apex-agents` | 43,5% | Afirma superar a Moonshot Kimi-K3 (41,0%) |

No se han publicado en la informacion disponible resultados independientes que confirmen estas cifras, ni comparaciones en MMLU, HumanEval, AIME o HLE pese a que esos datasets aparecen listados en las etiquetas.

## Requisitos de hardware

- VRAM estimada: con 27,3B parametros totales, en FP16 requeriria aproximadamente 55 GB; en cuantizacion de 8 bits, unos 28 GB; en 4 bits, unos 14-16 GB. El autor afirma ejecucion en una RTX 3090 de 24 GB gracias a su esquema de compresion declarado.
- GPU recomendadas: RTX 3090 (24 GB) segun el autor para el harness de SWE-bench Verified; A100 40/80 GB, H100 80 GB y L40S para despliegues con contexto largo y concurrencia.
- GPU de consumo: cabe en RTX 3090 y RTX 4090 (24 GB) con cuantizacion; en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) requeriria cuantizaciones agresivas y offloading parcial a CPU.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; vLLM y TGI si se dispone de pesos safetensors compatibles; el autor menciona endpoints compatibles (`endpoints_compatible`) y un motor propio (`subsea_moe_mtp_engine.py`).
- Latencia y throughput: no disponibles. La generacion especulativa de 4 tokens por pasada (MTP) deberia reducir la latencia por token, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen-AgentWorld-ULTRA (este) | 27,3B totales (MoE) | no disponible | Apache 2.0 | GGUF en HF | Cifras de benchmark declaradas por el autor, sin verificacion independiente |
| Qwen3 MoE de referencia (familia base) | ~30B totales tipico | 32K-128K segun variante | Apache 2.0 | HF, vLLM, Ollama | Base de la que deriva el tag `qwen3_5_moe`; sin capacidades de agente declaradas |
| DeepSeek-Coder-V2-Lite | 16B totales / 2,4B activos | 128K | DeepSeek License | HF, vLLM | Referencia en codigo open source; contexto mayor y licencia mas restrictiva |
| Codestral / Devstral (Mistral) | 22-24B | 128K-256K | Apache 2.0 / MRL | HF, API | Alternativa europea con soporte de tool calling documentado |

La comparativa con modelos concretos se limita a familias conocidas: no hay en la informacion disponible una comparacion oficial publicada por el autor mas alla de las menciones a Tencent Hy4 y Moonshot Kimi-K3 en la tabla de benchmarks.

## Limitaciones y advertencias

- Las cifras de benchmark y las innovaciones tecnicas (cuantizacion ternaria, compresion 13,96x, auditoria de entropia) proceden unicamente de la model card del autor y no se han verificado de forma independiente.
- El nombre del modelo y la descripcion ("omni-intelligence cognitive monolith") emplean terminologia de marketing que no se corresponde con artefactos tecnicos documentados en el repositorio.
- Solo se declaran los idiomas ingles y tailandes; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- No se especifica la longitud de contexto soportada, lo que impide garantizar casos de uso con documentos largos.
- Riesgo de alucinacion: la afirmacion de "zero-hallucination" es incompatible con el comportamiento conocido de los LLM; debe asumirse alucinacion y aplicar verificacion externa.
- Los sesgos no estan documentados; al derivar de una base Qwen, heredara los sesgos de su dataset original.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo derivado conviene revisar las obligaciones de atribucion de la familia base.
- El repositorio tiene 944 descargas y 2 likes, con una unica creacion en septiembre de 2026 y actualizacion en octubre: senales de un proyecto joven sin validacion de la comunidad.
- El tamano del repo (17,8 GB) sugiere pesos cuantizados, no FP16 completos; la calidad respecto al modelo original puede degradarse.
- No hay informacion sobre tool calling nativo, por lo que la integracion en frameworks de agentes requerira prompts y parsers propios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bbkdevops/Qwen-AgentWorld-ULTRA
- Estandar de evaluacion de Hugging Face citado por el autor: https://huggingface.co/docs/hub/en/eval-results#benchmark-datasets
- SWE-bench (leaderboard oficial): https://www.swebench.com/
- Terminal-Bench: https://github.com/laude-institute/terminal-bench
- GSM8K (dataset): https://huggingface.co/datasets/openai/gsm8k
- MMMU-Pro (dataset): https://huggingface.co/datasets/MMMU/MMMU_Pro
- HLE (Humanity's Last Exam): https://huggingface.co/datasets/cais/hle
- SWE-bench Pro (ScaleAI): https://huggingface.co/datasets/ScaleAI/SWE-bench_Pro
- APEX-Agents (Mercor): https://huggingface.co/datasets/mercor/apex-agents
