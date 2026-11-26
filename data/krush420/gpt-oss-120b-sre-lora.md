# krush420/gpt-oss-120b-sre-lora

## Resumen

`krush420/gpt-oss-120b-sre-lora` es un adaptador LoRA (entrenado con QLoRA en MXFP4) sobre el modelo base `openai/gpt-oss-120b`, un transformer MoE de 116,8B parámetros totales y 5,1B activos. Lo desarrolla el usuario krush420 dentro del ecosistema KruschStack, un stack de 39 herramientas MCP orientado a agentes de coding y operaciones (SRE). El adaptador está pensado como "teacher" de alto VRAM y auditor de referencia profunda dentro de ese stack: afina el modelo base para auditoría de código, remediación de bugs, enrutado de tool calling nativo (Harmony `<|channel|>commentary`) y memoria conversacional de largo plazo.

El problema que aborda es el "drift" de prosa y la deriva de rechazo en tareas de auditoría: según el autor, el adaptador elimina esa deriva y supera ligeramente al `gpt-oss:120b` original en la suite completa DolphinBench (39,50% frente a 39,17% con el harness estándar, bajo juicio oficial `gpt-5.6-sol`), manteniendo un 92,37% de recall en BEAM 100K. La relevancia actual está en su enfoque: un adaptador pequeño (11,9M parámetros entrenables, repo de 0,3 GB) sobre un MoE grande, distribuido también en GGUF, lo que permite ajustar comportamiento agéntico sin reentrenar el modelo completo.

Es importante subrayar que el adaptador no es un modelo autónomo: requiere cargar el base `openai/gpt-oss-120b` y aplicar los pesos PEFT encima. El repo pesa 0,3 GB porque contiene únicamente los deltas LoRA, no los pesos completos del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer MoE `openai/gpt-oss-120b` |
| Parametros totales | 11.943.936 (adaptador); modelo base: 116,8B |
| Parametros activos | 5,1B (modelo base MoE) |
| Longitud de contexto | no disponible (heredada del base; no declarada en la ficha) |
| Tipos de cuantizacion | MXFP4 (entrenamiento QLoRA); pesos publicados en safetensors y GGUF |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT) y GGUF |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `openai/gpt-oss-120b`, un MoE de 116,8B parámetros totales con 5,1B activos por token. El método es QLoRA en MXFP4 sobre una sola GPU, con una fase de SFT sobre el dataset `krush420/sovereign-code-audit-sft` (más de 18.131 registros SFT + DPO declarados, "zero-leak") seguida de una calibración de preferencias con `trl.DPOTrainer` anclada con KL. El adaptador resultante tiene 11,9M parámetros entrenables y se distribuye como delta PEFT más una conversión GGUF.

La innovación declarada es el enrutado nativo de herramientas mediante el formato Harmony (`<|channel|>commentary`) y un `Modelfile` neutro en roles, orientado a integración con MCP (39 herramientas). El autor afirma que esta combinación elimina la deriva de rechazo en prosa del auditor y mantiene la calibración P0/P1 de referee al 100% `CLEAN_PASS`. No se detalla la composición exacta del dataset de entrenamiento ni el número de tokens vistos más allá de las cifras del dataset citado.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Tool calling / function calling nativo con enrutado Harmony.
- Integración con agentes y MCP (39 herramientas del stack KruschStack).
- Memoria conversacional de largo plazo (evaluada en BEAM 100K y DolphinBench).
- Auditoría de código y remediación de bugs (code-audit, bug-remediation).
- Edición de repositorios multi-lenguaje (evaluada en Aider Polyglot, 6 lenguajes).
- Calibración como referee/auditor (P0/P1, `CLEAN_PASS`).
- Capacidades multilingües: no declaradas explícitamente; los benchmarks cubren 6 lenguajes de programación, no idiomas naturales.

## Casos de uso

- Auditoría de código automatizada en CI/CD: el adaptador está afinado para code-audit y remediación, y puede insertarse como paso de revisión que detecta y clasifica hallazgos P0/P1 antes del merge, apoyándose en el enrutado de herramientas para consultar el repositorio.
- Agente SRE autónomo: integrado en el stack MCP (39 herramientas), puede ejecutar diagnósticos, consultar métricas y proponer remediaciones multi-paso en un bucle agéntico con tool calling nativo.
- Edición de repositorios multi-lenguaje: con un pass@2 del 51,56% en Aider Polyglot (6 lenguajes) bajo el harness 2PC, es adecuado para tareas de parcheo guiado con verificación al parar, no para one-shot ciego (19,56% pass@1).
- Memoria de largo plazo en asistentes: su recall del 92,37% en BEAM 100K lo hace utilizable en asistentes que deben recordar contexto de conversaciones extensas (hasta 100K tokens en la evaluación).
- Referee y juez de calidad en pipelines de evaluación: el autor lo posiciona como auditor de referencia profunda con calibración P0/P1, útil para puntuar salidas de otros modelos o agentes.
- Enrutado de herramientas en productos con MCP: como capa que decide qué herramienta invocar y con qué argumentos en un harness agéntico, gracias al formato Harmony y al `Modelfile` neutro en roles.
- Destilación de conocimiento: etiquetado como "teacher" L2.5, puede generar trazas de alta calidad para entrenar modelos estudiantes más pequeños del mismo ecosistema (30B, 8B).

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| DolphinBench (600 tareas, 1,5M tokens, juez oficial gpt-5.6-sol) | Pass rate oficial | 39,50% (237/600) |
| DolphinBench | Comprobaciones mecánicas deterministas de herramientas | 78,85% (1.033/1.310) |
| BEAM 100K (ICLR 2026, n=400) | Recall estricto de turno primario (9 categorías) | 92,37% |
| BEAM 100K | E2E QA (referee Hermes-3) | 69,03% |
| BEAM 100K | E2E QA (referee Qwen2.5-32B) | 60,80% |
| Aider Polyglot (6 lenguajes, n=225) | Pass@2 (2PC verify-on-stop) | 51,56% |
| Aider Polyglot | Pass@1 (blind one-shot) | 19,56% |

Comparación declarada por el autor: 39,50% (237/600) frente a 39,17% (235/600) del `gpt-oss:120b` original en DolphinBench, con +7 tareas en la persona `Morgan`. No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0,3 GB, pero requiere cargar el modelo base `openai/gpt-oss-120b` (116,8B totales, 5,1B activos) para inferencia.
- VRAM estimada: no disponible de forma explícita; por el tamaño del base en MXFP4, se necesita hardware de gama alta (el autor menciona entrenamiento en una sola GPU con QLoRA MXFP4, lo que sugiere GPUs de 80 GB o superiores para el base cuantizado).
- GPU recomendadas: no disponibles en la ficha; por tamaño del base, A100/H100 de 80 GB son el objetivo razonable, aunque el autor no lo declara.
- Consumer GPU: no cabe en GPUs de consumo convencionales (RTX 4090 de 24 GB) con el base completo; el adaptador por separado no es ejecutable sin el base.
- Despliegue: pesos en safetensors (PEFT, vía transformers) y GGUF (vía llama.cpp/Ollama, presumiblemente con el `Modelfile` incluido); integración con el harness KruschStack vía MCP.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpt-oss-120b-sre-lora (este) | 11,9M adaptador / 116,8B base | no disponible | DolphinBench 39,50%; BEAM 100K recall 92,37%; Aider pass@2 51,56% | apache-2.0 | Hugging Face (PEFT + GGUF) |
| gpt-oss:120b (stock) | 116,8B (5,1B activos) | no disponible | DolphinBench 39,17% (según autor) | apache-2.0 (base) | Ollama / HF |
| krush420/gemma4-31b-sre-lora | 31B dense | no disponible | DolphinBench 57,33% (según autor) | no disponible | Hugging Face |
| krush420/qwen3-coder-30b-sre-lora | 30B MoE (A3B) | no disponible | DolphinBench 43,00% con Grounded v0.3 (según autor) | no disponible | Hugging Face |

La comparativa se limita a los modelos del mismo ecosistema citados por el autor; no se dispone de datos de benchmarks de alternativas externas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el base `openai/gpt-oss-120b` los pesos PEFT no son ejecutables.
- Los benchmarks son declarados por el autor y marcados como `verified: false`; no hay verificación independiente.
- El pass@1 ciego en Aider Polyglot es bajo (19,56%): no es fiable para edición de código one-shot sin verificación.
- El pass rate oficial en DolphinBench es moderado (39,50%): más de la mitad de las tareas fallan bajo el juez oficial.
- Idiomas naturales soportados: no declarados; no se puede asumir cobertura multilingüe.
- Longitud de contexto: no declarada en la ficha; depende del base.
- Riesgo de alucinación: no cuantificado; el autor no publica tasas de alucinación.
- Sesgos: no documentados.
- Licencia apache-2.0 en el adaptador, pero conviene verificar la licencia y condiciones del modelo base `openai/gpt-oss-120b` para uso comercial en producción.
- Ecosistema muy específico (KruschStack, MCP, Jean SRE): parte del rendimiento declarado depende del harness propietario (2PC verify-on-stop), no del modelo en aislamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/krush420/gpt-oss-120b-sre-lora
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Dataset de entrenamiento: https://huggingface.co/datasets/krush420/sovereign-code-audit-sft
- Logs de benchmarks: https://huggingface.co/datasets/krush420/sovereign-g4-benchmarks
- Space de arena de routers: https://huggingface.co/spaces/krush420/sovereign-router-arena
- Repositorio KruschStack: https://github.com/kruschdev/krusch-stack
- Repositorio Jean SRE: https://github.com/kruschdev/Jean-SRE-by-kruschdev
- Adaptador companion 31B: https://huggingface.co/krush420/gemma4-31b-sre-lora
- Adaptador companion 30B: https://huggingface.co/krush420/qwen3-coder-30b-sre-lora
- DolphinBench: https://dolphinbench.ai/
- Dataset BEAM: https://huggingface.co/datasets/Mohammadta/BEAM
- Aider Polyglot Benchmark: https://huggingface.co/datasets/Aider-AI/polyglot-benchmark
