# Runforever/Qwen3.6-35B-A3B

## Resumen

Qwen3.6-35B-A3B es la primera variante de pesos abiertos de la serie Qwen3.6, publicada por el equipo Qwen (Alibaba) como evolución de la familia Qwen3.5. Se trata de un modelo de lenguaje causal con codificador de visión, arquitectura Mixture of Experts (MoE) de 35.951.822.704 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, lo que lo sitúa en la categoría de modelos grandes pero con coste de inferencia contenido. El repositorio analizado (Runforever/Qwen3.6-35B-A3B) es una réplica de los pesos oficiales, sin descargas ni interacciones registradas en el momento de la consulta.

El modelo está orientado explícitamente a "agentic coding": razonamiento a nivel de repositorio, flujos de trabajo de frontend y tareas de ingeniería de software multi-paso. Incorpora una innovación denominada "Thinking Preservation", que permite retener el contexto de razonamiento de mensajes históricos para reducir la sobrecarga en desarrollos iterativos. Su ventana de contexto nativa de 262.144 tokens, extensible hasta 1.010.000, lo hace adecuado para análisis de bases de código completas y conversaciones de largo recorrido.

La relevancia actual radica en que combina un tamaño total de 35B con solo 3B activos, lo que reduce drásticamente los requisitos de cómputo en inferencia frente a modelos densos equivalentes, manteniendo un rendimiento competitivo en benchmarks de coding agent (SWE-bench Verified 73,4). La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; MoE híbrido con Gated DeltaNet (atención lineal) y Gated Attention |
| Parametros totales | 35.951.822.704 |
| Parametros activos | ~3B (8 expertos enrutados + 1 compartido de 256 totales) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; se espera compatibilidad con GGUF/AWQ vía ecosistema, no confirmado en la información) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida de 40 capas con un layout de 10 bloques compuestos por 3 repeticiones de (Gated DeltaNet → MoE) seguidas de 1 (Gated Attention → MoE). La Gated DeltaNet utiliza 32 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128; la Gated Attention usa 16 cabezas para Q y 2 para KV, con dimensión de cabeza 256 y dimensión de RoPE de 64. La dimensión oculta es 2048 y el embedding de tokens (padded) es 248320. La capa MoE cuenta con 256 expertos, de los cuales se activan 8 enrutados más 1 compartido, con dimensión intermedia de experto de 512. Incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos.

El entrenamiento comprende fases de pre-training y post-training, aunque la información disponible no detalla el número de tokens, la composición del dataset ni si se emplearon RLHF o DPO. La model card menciona que la serie Qwen3.6 se construyó a partir de feedback directo de la comunidad, priorizando estabilidad y utilidad real. La innovación destacable es "Thinking Preservation", que permite conservar el razonamiento de mensajes históricos entre turnos.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de pensamiento preservado entre turnos.
- Codificación agéntica: razonamiento a nivel de repositorio, flujos de frontend y resolución de issues.
- Comprensión de imágenes (pipeline image-text-to-text con codificador de visión).
- Soporte de tool calling / function calling (implícito en el enfoque agéntico y la compatibilidad con endpoints).
- Razonamiento multi-step y uso de agentes para tareas de ingeniería de software.
- Capacidades multilingües: la model card reporta resultados en SWE-bench Multilingual, lo que evidencia soporte de código en varios lenguajes; los idiomas naturales concretos no están disponibles.
- Contexto largo de hasta 262.144 tokens nativos, extensible a ~1M.
- Compatibilidad con Hugging Face Transformers, vLLM, SGLang y KTransformers.

## Casos de uso

- Resolución automática de issues en repositorios: el modelo puede recibir un repositorio completo y un issue, razonar sobre el código y proponer parches, gracias a su contexto de 262K tokens y su entrenamiento específico en SWE-bench.
- Agente de codificación en CI/CD: integrado vía vLLM o SGLang, puede ejecutarse como paso de revisión y corrección automática de pull requests con tool calling para consultar tests y logs.
- Asistente de desarrollo en IDE: con "Thinking Preservation" mantiene el hilo de razonamiento entre iteraciones, reduciendo la latencia percibida en sesiones largas de depuración.
- Análisis de documentación técnica con imágenes: al aceptar entrada image-text-to-text, puede interpretar diagramas de arquitectura, capturas de errores o mockups de frontend junto con el código.
- Generación de interfaces frontend: la model card destaca fluidez en flujos de frontend, útil para prototipado rápido a partir de descripciones y capturas.
- Migración y refactorización de bases de código multilingües: su rendimiento en SWE-bench Multilingual (67,2) lo hace apto para proyectos con múltiples lenguajes.
- Automatización de tareas en terminal: con resultados en Terminal-Bench, puede operar como agente de shell para tareas de administración y scripting.

## Benchmarks y rendimiento

Datos reportados en la model card (categoría Coding Agent):

| Benchmark | Qwen3.6-35BA3B | Qwen3.5-35BA3B | Qwen3.5-27B | Gemma4-31B | Gemma4-26BA4B |
|---|---|---|---|---|---|
| SWE-bench Verified | 73,4 | 70,0 | 75,0 | 52,0 | 17,4 |
| SWE-bench Multilingual | 67,2 | 60,3 | 69,3 | 51,7 | 17,3 |
| SWE-bench Pro | 49,5 | 44,6 | 51,2 | 35,7 | 13,8 |
| Terminal-Bench 2.0 | no disponible (truncado en la información) | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16/fp16 (~72 GB) se requieren al menos 80 GB; con cuantización a 8 bits, ~36-40 GB; a 4 bits, ~18-22 GB (estimaciones a partir del tamaño del repo de 71,9 GB; no confirmadas oficialmente).
- GPU recomendadas: H100 80GB o A100 80GB para bf16; A100 40GB o RTX 6000 Ada para 8 bits; RTX 4090 24GB para cuantización 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantización de 4 bits, siempre que el ecosistema proporcione pesos GGUF/AWQ (no confirmado en la información).
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang, KTransformers (confirmados en la model card); llama.cpp/Ollama no confirmados.
- Latencia y throughput: no disponibles. Al activar solo ~3B parámetros por token, se espera un throughput notablemente superior al de un denso de 35B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | SWE-bench Verified | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B | 35B | ~3B | 262K (ext. 1M) | 73,4 | Apache 2.0 |
| Qwen3.5-35B-A3B | 35B | ~3B | no disponible | 70,0 | Apache 2.0 (serie Qwen) |
| Qwen3.5-27B | 27B | denso | no disponible | 75,0 | Apache 2.0 (serie Qwen) |
| Gemma4-31B | 31B | denso | no disponible | 52,0 | no disponible |
| Gemma4-26B-A4B | 26B | ~4B | no disponible | 17,4 | no disponible |

El modelo supera a su predecesor Qwen3.5-35B-A3B en todos los benchmarks de coding reportados, aunque queda por debajo del denso Qwen3.5-27B en SWE-bench Verified y Multilingual, y por encima en Pro.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; como modelo entrenado con datos web, es previsible que herede sesgos de esos corpus.
- Riesgo de alucinación: no cuantificado; en tareas de código puede generar parches plausibles pero incorrectos, por lo que requiere validación con tests.
- Limitaciones de contexto o idioma: aunque el contexto nativo es de 262K, el rendimiento en ventanas extremas (~1M) puede degradarse; los idiomas naturales soportados no están especificados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar el LICENSE enlazado en el repositorio oficial de Qwen.
- El repositorio analizado (Runforever/Qwen3.6-35B-A3B) es una réplica no oficial con 0 descargas; para producción debe usarse el repositorio oficial de Qwen.
- Los resultados de Terminal-Bench 2.0 están truncados en la información disponible.
- No hay datos publicados sobre cuantizaciones oficiales ni sobre latencia/throughput.

## Enlaces

- Repositorio analizado: https://huggingface.co/Runforever/Qwen3.6-35B-A3B
- Repositorio oficial de referencia (LICENSE): https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Blog oficial: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Qwen Chat: https://chat.qwen.ai
- Logo/imagen de la serie: https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3.6/logo.png
- Figura de benchmarks: https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen3.6/Figures/qwen3.6_35b_a3b_score.png
