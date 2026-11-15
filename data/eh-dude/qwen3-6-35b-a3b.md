# eh-dude/Qwen3.6-35B-A3B

## Resumen

Qwen3.6-35B-A3B es un modelo de lenguaje causal con codificador de visión, desarrollado por el equipo Qwen (Alibaba) y publicado en el repositorio de Hugging Face por el usuario `eh-dude`. Se trata de la primera variante de pesos abiertos de la serie Qwen3.6, sucesora de la familia Qwen3.5 lanzada en febrero. El modelo emplea una arquitectura híbrida de atención lineal (Gated DeltaNet) y atención completa (Gated Attention) combinada con una mezcla de expertos (MoE) de 256 expertos, de los cuales se activan 8 enrutados más 1 compartido por token.

Con 35.951.822.704 parámetros totales y aproximadamente 3.000 millones activos por token, el modelo está diseñado para ofrecer un equilibrio entre capacidad y eficiencia computacional. Su contexto nativo alcanza los 262.144 tokens, extensible hasta 1.010.000 tokens. El foco declarado de esta versión es la mejora en "agentic coding" (razonamiento a nivel de repositorio y flujos de trabajo de frontend) y la introducción de una opción de "Thinking Preservation" para retener contexto de razonamiento entre mensajes.

El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial, y es compatible con Transformers, vLLM, SGLang y KTransformers. Su pipeline declarado es `image-text-to-text`, lo que confirma capacidades multimodales de entrada (texto e imagen).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con codificador de visión; híbrido Gated DeltaNet (atención lineal) + Gated Attention + MoE |
| Parametros totales | 35.951.822.704 |
| Parametros activos | ~3B (8 expertos enrutados + 1 compartido de 256) |
| Longitud de contexto | 262.144 tokens nativo; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en precisión original; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

El modelo sigue un layout oculto de 40 capas organizado como 10 bloques de la forma `3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE)`. La dimensión oculta es 2048 y el embedding de tokens (con padding) es de 248.320. La Gated DeltaNet emplea 32 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. La Gated Attention usa 16 cabezas para Q y 2 para KV, con dimensión de cabeza 256 y dimensión de RoPE de 64. La capa MoE contiene 256 expertos con dimensión intermedia de 512, activando 8 enrutados más 1 compartido. El modelo fue entrenado con Multi-Token Prediction (MTP) multi-paso.

El entrenamiento comprende fases de pre-entrenamiento y post-entrenamiento, aunque la información disponible no detalla el número de tokens, la composición del dataset ni si se aplicaron técnicas concretas de RLHF o DPO. La model card menciona que la versión se construyó a partir de feedback directo de la comunidad, priorizando estabilidad y utilidad en el mundo real. La innovación destacada es la "Thinking Preservation", una opción que permite retener el contexto de razonamiento de mensajes históricos para reducir sobrecarga en desarrollo iterativo.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Razonamiento de código a nivel de repositorio ("agentic coding"), con énfasis en flujos de frontend.
- Capacidades multimodales de entrada: pipeline `image-text-to-text` con codificador de visión.
- Soporte de tool calling / function calling (implícito en el enfoque agéntico declarado; no se detalla explícitamente en la información disponible).
- Razonamiento multi-paso y uso en agentes (declarado como foco principal de la versión).
- "Thinking Preservation": retención opcional del contexto de razonamiento entre mensajes.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo "thinking" explícito: no confirmado en la información disponible.

## Casos de uso

- **Agentes de codificación autónomos**: el modelo está optimizado para SWE-bench Verified (73,4) y SWE-bench Multilingual (67,2), por lo que puede integrarse en pipelines que resuelven issues de repositorios reales, aplican parches y validan tests de forma autónoma.
- **Asistentes de desarrollo en IDE**: con 262.144 tokens de contexto nativo, puede cargar fragmentos extensos de un repositorio y mantener coherencia entre archivos durante sesiones largas de refactorización.
- **Generación de frontend**: la model card destaca fluidez en flujos de frontend, lo que lo hace adecuado para generar componentes UI, maquetación y lógica de cliente a partir de descripciones o capturas de imagen (gracias al codificador de visión).
- **Automatización de terminal y DevOps**: su rendimiento en Terminal-Bench 2.0 lo sitúa como candidato para agentes que ejecutan comandos, interpretan salidas y corrigen errores en entornos shell.
- **Análisis de documentos con imagen**: al aceptar entrada image-text-to-text, puede procesar capturas, diagramas o documentos escaneados y responder preguntas sobre ellos.
- **Desarrollo iterativo con memoria de razonamiento**: la opción "Thinking Preservation" permite mantener el hilo de razonamiento entre turnos, útil en sesiones de depuración prolongadas donde el contexto previo es relevante.
- **Despliegue en infraestructura moderada**: con ~3B parámetros activos, el coste de inferencia por token es bajo comparado con modelos densos de 35B, lo que facilita servir el modelo en GPUs de gama alta consumer o en clústeres pequeños.

## Benchmarks y rendimiento

Datos extraídos de la model card (comparativa con Qwen3.5-27B, Gemma4-31B, Qwen3.5-35BA3B y Gemma4-26BA4B):

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 52,0 | 70,0 | 17,4 | 73,4 |
| SWE-bench Multilingual | 69,3 | 51,7 | 60,3 | 17,3 | 67,2 |
| SWE-bench Pro | 51,2 | 35,7 | 44,6 | 13,8 | 49,5 |
| Terminal-Bench 2.0 | no disponible en el extracto | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje general; la model card solo muestra la tabla de "Coding Agent" en el extracto proporcionado.

## Requisitos de hardware

- **VRAM estimada en precisión original (BF16/FP16)**: ~72 GB solo para pesos (el repo ocupa 71,9 GB), más overhead de activaciones y KV cache; requiere múltiples GPUs de 80 GB o una configuración con offloading.
- **VRAM estimada en cuantización de 8 bits**: ~36 GB, viable en una A100 80GB o H100.
- **VRAM estimada en cuantización de 4 bits**: ~18-20 GB, viable en RTX 4090 (24 GB) o RTX 3090.
- **GPU recomendadas**: A100 80GB, H100 80GB para precisión completa; RTX 4090/3090 para cuantizaciones de 4-8 bits.
- **Consumer GPU**: sí, en cuantizaciones de 4 bits cabe en RTX 4090; en 8 bits requiere GPUs de 24 GB o más con cuidado en el contexto.
- **Despliegue**: Transformers, vLLM, SGLang, KTransformers (según la model card). No se confirma soporte de llama.cpp u Ollama en la información disponible.
- **Latencia y throughput**: no disponibles. Un comentario en Reddit menciona ~50 tokens/s en un "AI Mini PC", pero no es un dato verificado ni representativo.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | SWE-bench Verified | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B | 35,95B | ~3B | 262.144 (ext. 1,01M) | 73,4 | Apache 2.0 |
| Qwen3.5-35B-A3B | 35B | ~3B | no disponible | 70,0 | Apache 2.0 (presumible) |
| Qwen3.5-27B | 27B | denso | no disponible | 75,0 | Apache 2.0 (presumible) |
| Gemma4-31B | 31B | denso | no disponible | 52,0 | no disponible |
| Gemma4-26B-A4B | 26B | ~4B | no disponible | 17,4 | no disponible |

Qwen3.6-35B-A3B mejora a su predecesor Qwen3.5-35B-A3B en SWE-bench Verified (+3,4), Multilingual (+6,9) y Pro (+4,9), aunque queda por debajo del denso Qwen3.5-27B en Verified (73,4 vs 75,0). Frente a Gemma4-31B la ventaja es amplia en tareas de codificación agéntica.

## Limitaciones y advertencias

- **Sesgos**: no se documentan sesgos específicos en la información disponible; al ser un modelo entrenado con datos web, es esperable que herede sesgos de esos corpus.
- **Alucinación**: no se han publicado evaluaciones de factualidad ni tasas de alucinación.
- **Idiomas**: la lista de idiomas soportados no está disponible; no se puede garantizar calidad fuera del inglés y chino sin verificación empírica.
- **Contexto**: aunque el contexto nativo es de 262.144 tokens, el rendimiento en la ventana extendida (hasta 1.010.000) puede degradarse y no está benchmarkeado en la información disponible.
- **Licencia**: Apache 2.0 permite uso comercial, pero se recomienda revisar el `LICENSE` enlazado en el repositorio original de Qwen para confirmar términos exactos.
- **Repositorio de terceros**: el modelo está publicado por `eh-dude`, no por el equipo oficial de Qwen; conviene verificar la integridad de los pesos frente al repositorio original.
- **Cuantizaciones**: no se listan variantes GGUF/AWQ/GPTQ oficiales; el despliegue en consumer GPU requiere cuantizar manualmente.
- **Producción**: no hay datos publicados de latencia, throughput ni estabilidad en cargas concurrentes; se recomienda validación propia antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/eh-dude/Qwen3.6-35B-A3B
- Repositorio oficial de referencia (LICENSE): https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Blog oficial: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Qwen Chat: https://chat.qwen.ai
- Hilo en Reddit sobre variante no censurada: https://www.reddit.com/r/LocalLLaMA/comments/1tm3toi/qwen3635ba3buncensoredgenesisapexmtp/
- Artículo en HackerNoon sobre el modelo: https://hackernoon.com/this-ai-model-has-native-text-image-and-video-capabilities-heres-what-you-should-know
