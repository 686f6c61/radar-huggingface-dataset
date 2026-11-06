# jacobmorrison/qwen3.6-35b-a3b-miles-r2-wsd

## Resumen

Qwen3.6-35B-A3B es un modelo de lenguaje causal multimodal con codificador de visión, desarrollado por el equipo Qwen (Alibaba). Esta ficha concreta corresponde al repositorio `jacobmorrison/qwen3.6-35b-a3b-miles-r2-wsd`, una publicación de pesos derivada del modelo original Qwen3.6-35B-A3B bajo licencia Apache 2.0. El modelo emplea una arquitectura Mixture of Experts (MoE) con 35.107 millones de parámetros totales y aproximadamente 3.000 millones activos por token, lo que permite un equilibrio entre capacidad y coste de inferencia.

La arquitectura combina capas de atención lineal Gated DeltaNet con capas de atención con compuertas (Gated Attention), intercaladas con bloques MoE de 256 expertos (8 enrutados más 1 compartido por token). El modelo está orientado a tareas de codificación agéntica, razonamiento a nivel de repositorio y flujos de trabajo de frontend, e incorpora una ventana de contexto nativa de 262.144 tokens extensible hasta 1.010.000 tokens.

Su relevancia actual radica en que representa la primera variante de pesos abiertos de la serie Qwen3.6, con mejoras específicas en codificación agéntica y una nueva opción de "preservación del pensamiento" que retiene el contexto de razonamiento de mensajes anteriores. La licencia Apache 2.0 facilita su adopción comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador de visión, MoE híbrido con Gated DeltaNet y Gated Attention |
| Parámetros totales | 35.107.181.936 |
| Parámetros activos | ~3B (8 expertos enrutados + 1 compartido por token) |
| Longitud de contexto | 262.144 tokens nativo, extensible hasta 1.010.000 tokens |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente BF16/FP16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo sigue una disposición de capas híbrida: 10 bloques compuestos por 3 capas de Gated DeltaNet (atención lineal) seguidas de 1 capa de Gated Attention, cada una seguida de un bloque MoE. La dimensión oculta es de 2048, con 40 capas en total. Las capas de Gated DeltaNet emplean 32 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. Las capas de Gated Attention usan 16 cabezas para Q y 2 para KV, con dimensión de cabeza 256 y dimensión de RoPE de 64. El bloque MoE contiene 256 expertos con dimensión intermedia de 512, activando 8 expertos enrutados más 1 compartido por token. El embedding de tokens es de 248.320 (con padding), y el modelo fue entrenado con Multi-Token Prediction (MTP) multi-paso.

El entrenamiento comprende fases de pre-entrenamiento y post-entrenamiento, aunque la model card no detalla el número de tokens, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Las innovaciones destacadas incluyen la preservación del contexto de razonamiento entre turnos (thinking preservation) y mejoras en razonamiento a nivel de repositorio y flujos de frontend. El modelo es compatible con Hugging Face Transformers, vLLM, SGLang y KTransformers.

## Capacidades

- Generación de texto y razonamiento general con modo de pensamiento (thinking mode) preservable entre turnos.
- Codificación agéntica: resolución de issues a nivel de repositorio, razonamiento multi-archivo y flujos de frontend.
- Comprensión de imágenes mediante codificador de visión (pipeline image-text-to-text).
- Soporte de tool calling / function calling (implícito en su orientación agéntica y compatibilidad con endpoints).
- Razonamiento multi-paso y ejecución de tareas en terminal (evaluado en Terminal-Bench 2.0).
- Capacidades multilingües en codificación (evaluado en SWE-bench Multilingual).
- Compatibilidad con despliegue en vLLM, SGLang y KTransformers para inferencia de alto rendimiento.

## Casos de uso

- Resolución automática de issues en repositorios: el modelo puede analizar un repositorio completo y proponer parches gracias a su contexto de 262.144 tokens y su entrenamiento específico en SWE-bench, integrándose en pipelines de CI/CD para revisión automatizada de pull requests.
- Asistente de codificación en IDE: con tool calling y preservación del contexto de razonamiento, puede mantener hilos de depuración iterativos sin perder el hilo lógico entre turnos.
- Automatización de tareas en terminal: su rendimiento en Terminal-Bench 2.0 lo hace adecuado para agentes que ejecutan comandos, interpretan salidas y corrigen errores en entornos shell.
- Análisis de documentación técnica con imágenes: gracias al codificador de visión, puede procesar capturas de pantalla, diagramas de arquitectura o interfaces de usuario junto con texto para generar explicaciones o código.
- Migración y refactorización de código multi-archivo: el contexto extensible hasta 1M tokens permite cargar grandes bases de código y razonar sobre dependencias entre módulos.
- Generación de interfaces frontend: orientado a flujos de frontend, puede generar componentes y maquetación a partir de descripciones o capturas de diseño.
- Atención al cliente técnica: conversaciones multi-turno con contexto largo para soporte de producto, con capacidad de invocar herramientas internas mediante function calling.

## Benchmarks y rendimiento

Datos extraídos de la model card del modelo original (Qwen3.6-35B-A3B):

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 52,0 | 70,0 | 17,4 | 73,4 |
| SWE-bench Multilingual | 69,3 | 51,7 | 60,3 | 17,3 | 67,2 |
| SWE-bench Pro | 51,2 | 35,7 | 44,6 | 13,8 | 49,5 |
| Terminal-Bench 2.0 | no disponible (tabla truncada) | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje general. Los datos de Terminal-Bench 2.0 aparecen truncados en la model card proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 70 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 80 GB.
- En cuantización de 8 bits: ~35 GB de pesos, viable en una A100 40GB con margen ajustado o en H100 80GB con holgura.
- En cuantización de 4 bits: ~18-20 GB de pesos, cabe en RTX 4090 (24 GB) y en GPUs consumer de gama alta.
- GPU recomendadas: H100 80GB, A100 80GB para BF16; A100 40GB o L40S para 8 bits; RTX 4090/5090 para 4 bits.
- Opciones de despliegue: vLLM, SGLang, KTransformers y Hugging Face Transformers (según la model card). No se confirma soporte de llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada. El carácter MoE con ~3B activos sugiere inferencia más rápida que un modelo denso de 35B, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | SWE-bench Verified | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B | 35B | ~3B | 262K (ext. 1M) | 73,4 | Apache 2.0 |
| Qwen3.5-35B-A3B | 35B | ~3B | no disponible | 70,0 | Apache 2.0 (presumible) |
| Qwen3.5-27B | 27B | denso | no disponible | 75,0 | Apache 2.0 (presumible) |
| Gemma4-31B | 31B | denso | no disponible | 52,0 | no disponible |
| Gemma4-26B-A4B | 26B | ~4B | no disponible | 17,4 | no disponible |

## Limitaciones y advertencias

- Este repositorio es una publicación derivada de un tercero (`jacobmorrison`), no el repositorio oficial de Qwen; la integridad y reproducibilidad exacta de los pesos no están garantizadas por el autor original.
- No se detallan los idiomas soportados; el rendimiento fuera del inglés no está verificado en la información disponible.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de razonamiento abierto o generación de código sin verificación.
- La licencia Apache 2.0 permite uso comercial, pero el `license_link` apunta a la licencia del modelo original de Qwen; conviene verificar términos adicionales del modelo base.
- El contexto extensible hasta 1M tokens puede degradar la calidad o aumentar costes de memoria de forma significativa; no hay datos publicados sobre rendimiento en esa longitud.
- Los benchmarks presentados corresponden al modelo original Qwen3.6-35B-A3B, no necesariamente a esta republicación concreta.
- No se dispone de información sobre sesgos, datos de entrenamiento ni procesos de alineación (RLHF/DPO) en la documentación proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jacobmorrison/qwen3.6-35b-a3b-miles-r2-wsd
- Modelo original Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Blog oficial: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Licencia: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Qwen Chat: https://chat.qwen.ai
