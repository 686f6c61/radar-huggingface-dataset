# mistralai/Devstral-2-123B-Instruct-2512

## Resumen

Devstral 2 123B Instruct 2512 es un modelo de lenguaje especializado en ingeniería de software y codificación agéntica, desarrollado por Mistral AI. Se trata de un modelo Instruct afinado para seguir instrucciones, distribuido en formato FP8, y pensado específicamente para tareas de software engineering que requieren exploración de repositorios, edición de múltiples ficheros y uso intensivo de herramientas. Es la versión grande de la familia Devstral 2, que también incluye una variante Small de 24B.

El modelo emplea la arquitectura Ministral 3 (según los tags del repositorio) con 125.025.988.608 parámetros reales según los pesos en safetensors (etiquetado comercialmente como 123B). Su rasgo más destacado es una ventana de contexto de 256k tokens, pensada para que un agente pueda mantener en memoria grandes porciones de un codebase durante sesiones prolongadas de trabajo.

Su relevancia actual radica en el rendimiento declarado en SWE-bench Verified (72,2%) y SWE-bench Multilingual (61,3%), que lo sitúan competitivo frente a modelos mucho mayores como Kimi K2 Thinking (1000B) o DeepSeek v3.2 (671B) en tareas de resolución de incidencias sobre repositorios reales. Mistral lo acompaña de Mistral Vibe, una CLI propia para usar el modelo directamente en terminal, y ofrece compatibilidad con scaffoldings como Cline, OpenHands o SWE-agent.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Ministral 3) |
| Parametros totales | 125.025.988.608 (etiquetado como 123B) |
| Parametros activos | no disponible |
| Longitud de contexto | 256k tokens |
| Tipos de cuantizacion | Pesos nativos en FP8; versiones GGUF comunitarias (Unsloth, Bartowski) |
| Idiomas soportados | no disponible |
| Licencia | other (licencia propia de Mistral AI, con gated access) |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

La model card indica que Devstral 2 se basa en la familia Ministral 3 (tag `ministral3`), un transformer denso de 125 mil millones de parámetros según los pesos publicados. No se detalla en la información disponible si emplea mezcla de expertos, atención lineal u otras innovaciones de eficiencia; tampoco se especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO más allá de la mención a un fine-tuning instructivo.

El modelo se distribuye ya cuantizado en FP8, lo que reduce el peso en disco (repositorio de 256,6 GB) y facilita el despliegue en GPUs con soporte para ese formato. El entrenamiento está orientado explícitamente a tareas agénticas de software: uso de herramientas para explorar codebases, edición multi-fichero y resolución de incidencias, con mejoras declaradas en generalización frente a prompts y entornos de codificación diversos respecto a la generación anterior.

## Capacidades

- Generación de código y edición multi-fichero en repositorios reales.
- Codificación agéntica: planificación y ejecución de tareas de ingeniería de software con uso de herramientas.
- Tool calling / function calling para interactuar con terminal, sistema de ficheros y otros servicios.
- Exploración de codebases extensos gracias a la ventana de 256k tokens.
- Resolución de incidencias (issue resolution) verificable mediante tests, evaluada en SWE-bench.
- Soporte multilingüe a nivel de código, evaluado en SWE-bench Multilingual.
- Modo instruct para conversación y seguimiento de instrucciones complejas.
- Integración con scaffoldings agénticos (Mistral Vibe, Cline, Kilo Code, Claude Code, OpenHands, SWE-agent).

## Casos de uso

- Asistente de código en terminal: mediante Mistral Vibe, el modelo puede leer el repositorio del usuario, proponer parches y aplicarlos directamente desde la línea de comandos, aprovechando los 256k tokens de contexto para mantener visibles múltiples ficheros relevantes.
- Resolución automática de incidencias en CI: integrado en pipelines que reciben un issue y un repositorio, el modelo explora el código, genera un parche y lo valida contra la suite de tests, un flujo para el que está explícitamente entrenado y evaluado (SWE-bench Verified 72,2%).
- Refactorizaciones multi-fichero: cuando un cambio afecta a decenas de ficheros, la ventana de contexto permite al agente razonar sobre las dependencias sin perder trazabilidad, reduciendo ediciones inconsistentes.
- Migraciones de código entre lenguajes o frameworks: el modelo puede analizar el codebase origen, planificar la migración por módulos y aplicar cambios con verificación mediante tool calling.
- Agentes de revisión de pull requests: conectado a la API de GitHub, el modelo puede inspeccionar diffs, ejecutar linters o tests y publicar comentarios técnicos sobre los cambios.
- Automatización de tareas de mantenimiento: actualización de dependencias, corrección de avisos de seguridad o generación de tests faltantes, tareas repetitivas donde el agente puede operar de forma autónoma con supervisión humana.
- Soporte a equipos de desarrollo vía API: Mistral ofrece el modelo a través de su API para empresas que prefieren no desplegar localmente, con opción de contacto para capacidades especializadas (mayor contexto, conocimiento de dominio).

## Benchmarks y rendimiento

| Modelo | Parametros (B) | SWE-bench Verified | SWE-bench Multilingual | Terminal Bench 2 |
|---|---|---|---|---|
| Devstral 2 | 123 | 72,2% | 61,3% | 32,6% |
| Devstral Small 2 | 24 | 68,0% | 55,7% | 22,5% |
| GLM 4.6 | 355 | 68,0% | no disponible | 24,6% |
| Qwen 3 Coder Plus | 480 | 69,6% | 54,7% | 25,4% |
| MiniMax M2 | 230 | 69,4% | 56,5% | 30,0% |
| Kimi K2 Thinking | 1000 | 71,3% | 61,1% | 35,7% |
| DeepSeek v3.2 | 671 | 73,1% | 70,2% | 46,4% |
| GPT 5.1 Codex High | no disponible | 73,7% | no disponible | 52,8% |
| GPT 5.1 Codex Max | no disponible | 77,9% | no disponible | 60,4% |
| Gemini 3 Pro | no disponible | 76,2% | no disponible | 54,2% |
| Claude Sonnet 4.5 | no disponible | 77,2% | 68,0% | 42,8% |

Los valores de los competidores son los reportados públicamente según la model card de Mistral. No se han publicado en la información disponible resultados de otros benchmarks como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: con pesos en FP8, el modelo ocupa aproximadamente 125 GB solo en pesos, por lo que la inferencia requiere al menos 1 GPU de 140 GB o varias GPUs en tensor parallel.
- GPU recomendadas: H200 (141 GB) en solitario para FP8; configuraciones multi-GPU con H100 80 GB (2 unidades) o A100 80 GB (2 unidades) en tensor parallel.
- No cabe en GPUs de consumo (RTX 4090, 24 GB) en su formato nativo; las versiones GGUF comunitarias cuantizadas a 4 bits podrían acercarse a los 70 GB y requerirían configuraciones multi-GPU o memoria unificada fuera de lo habitual en consumer.
- Opciones de despliegue: vLLM (recomendado por Mistral), SGLang, Transformers, llama.cpp, LM Studio y Ollama (estos últimos vía cuantizaciones GGUF comunitarias de Unsloth y Bartowski).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Devstral 2 123B | 123B | 256k | 72,2% | other (Mistral) | Pesos abiertos en HF + API |
| Devstral Small 2 | 24B | no disponible | 68,0% | other (Mistral) | Pesos abiertos en HF + API |
| DeepSeek v3.2 | 671B | no disponible | 73,1% | no disponible | Pesos abiertos |
| Kimi K2 Thinking | 1000B | no disponible | 71,3% | no disponible | Pesos abiertos |
| Qwen 3 Coder Plus | 480B | no disponible | 69,6% | no disponible | no disponible |

Devstral 2 destaca por ofrecer un rendimiento cercano a modelos de 4-8 veces su tamaño con un coste de despliegue mucho menor, aunque por debajo de DeepSeek v3.2 en SWE-bench Multilingual y Terminal Bench 2.

## Limitaciones y advertencias

- Licencia "other" propia de Mistral AI: es necesario revisar los términos concretos antes de un uso comercial, y el acceso al repositorio está sujeto a un gate con aceptación de condiciones y tratamiento de datos personales.
- El modelo está especializado en ingeniería de software; su rendimiento en tareas generales de conocimiento, matemáticas o generación creativa no se documenta en la información disponible.
- No se especifican los idiomas soportados, lo que impide garantizar calidad fuera del inglés técnico habitual en código.
- Riesgo de alucinación inherente a los LLM: en tareas agénticas puede generar parches plausibles pero incorrectos, por lo que se recomienda validación mediante tests automatizados antes de aplicar cambios en producción.
- El tamaño (125B parámetros, repositorio de 256,6 GB) hace inviable el despliegue en hardware de consumo sin cuantización agresiva y configuraciones multi-GPU.
- No se detallan sesgos conocidos ni evaluaciones de seguridad en la información proporcionada.
- El uso de scaffoldings agénticos con acceso a terminal y sistema de ficheros implica riesgos operativos que deben mitigarse con sandboxing y permisos mínimos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mistralai/Devstral-2-123B-Instruct-2512
- Mistral Vibe (CLI): https://github.com/mistralai/mistral-vibe
- Cline: https://github.com/cline/cline
- Kilo Code: https://github.com/Kilo-Org/kilocode
- Claude Code: https://github.com/anthropics/claude-code
- OpenHands: https://github.com/All-Hands-AI/OpenHands/tree/main
- SWE-agent: https://github.com/SWE-agent/SWE-agent
- vLLM: https://github.com/vllm-project/vllm
- SGLang: https://github.com/sgl-project/sglang
- Transformers: https://github.com/huggingface/transformers
- llama.cpp: https://github.com/ggml-org/llama.cpp
- GGUF de Unsloth: https://huggingface.co/unsloth/Devstral-2-123B-Instruct-2512-GGUF
- GGUF de Bartowski: https://huggingface.co/bartowski/mistralai_Devstral-2-123B-Instruct-2512-GGUF
- SDK de Python de Mistral: https://pypi.org/project/mistralai/
- Politica de privacidad de Mistral: https://mistral.ai/terms/
- Contacto empresarial: https://mistral.ai/contact
