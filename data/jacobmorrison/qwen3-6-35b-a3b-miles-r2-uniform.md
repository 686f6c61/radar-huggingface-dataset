# jacobmorrison/qwen3.6-35b-a3b-miles-r2-uniform

## Resumen

Qwen3.6-35B-A3B es un modelo de lenguaje causal con codificador de visión desarrollado por el equipo Qwen (Alibaba). Se trata de la primera variante open-weight de la serie Qwen3.6, publicada como evolución de la serie Qwen3.5. El modelo emplea una arquitectura híbrida de mezcla de expertos (MoE) con 35.107 millones de parámetros totales y aproximadamente 3.000 millones activados por token, combinando capas de atención lineal Gated DeltaNet con capas de atención con compuertas (Gated Attention). Su ventana de contexto nativa alcanza los 262.144 tokens y es extensible hasta 1.010.000 tokens.

El repositorio concreto analizado, `jacobmorrison/qwen3.6-35b-a3b-miles-r2-uniform`, es una publicación derivada de los pesos oficiales de Qwen3.6-35B-A3B bajo licencia Apache 2.0. La model card reproduce la documentación del modelo base e incluye benchmarks de la familia Qwen3.6 orientados a tareas de agente de código, con mejoras destacadas en razonamiento a nivel de repositorio y flujos de trabajo frontend.

La relevancia del modelo radica en su relación entre parámetros totales y activos: al activar solo ~3B de los 35B, ofrece un coste de inferencia propio de un modelo pequeño con capacidad de un modelo de mayor escala. Además, la inclusión de un codificador de visión y su pipeline `image-text-to-text` lo sitúan en la categoría de modelos multimodales de propósito general orientados a agentes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido (Gated DeltaNet + Gated Attention) con MoE y codificador de visión |
| Parámetros totales | 35.107.181.936 |
| Parámetros activos | ~3B (8 expertos enrutados + 1 compartido) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantización | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo sigue un diseño híbrido de 40 capas organizadas en un patrón repetido de 10 bloques, cada uno compuesto por tres subcapas de Gated DeltaNet seguidas de una subcapa de Gated Attention, todas ellas intercaladas con capas MoE. La dimensión oculta es de 2048 y el embedding de tokens alcanza 248.320 entradas (con padding). Las capas de atención lineal Gated DeltaNet emplean 32 cabezas para V y 16 para QK con dimensión de cabeza 128; las capas de Gated Attention usan 16 cabezas para Q y 2 para KV con dimensión 256 y RoPE de 64 dimensiones. La MoE cuenta con 256 expertos, de los que se activan 8 enrutados más 1 compartido, con dimensión intermedia de experto de 512. El modelo incluye además entrenamiento con Multi-Token Prediction (MTP) en varios pasos.

El entrenamiento combina fases de preentrenamiento y postentrenamiento. La model card menciona mejoras específicas en codificación agéntica (razonamiento a nivel de repositorio y flujos frontend) y una nueva opción de "Thinking Preservation" que permite retener el contexto de razonamiento de mensajes históricos para reducir sobrecarga en desarrollo iterativo. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Comprensión de imágenes y texto combinados (pipeline `image-text-to-text` con codificador de visión).
- Codificación agéntica: razonamiento a nivel de repositorio, flujos de trabajo frontend y resolución de issues.
- Soporte de razonamiento multi-paso con preservación del contexto de pensamiento ("Thinking Preservation").
- Capacidades multilingües (los idiomas concretos no están detallados en la información disponible).
- Compatibilidad con tool calling y function calling a través de los formatos estándar de Transformers, vLLM y SGLang.
- Entrenamiento con Multi-Token Prediction, que puede habilitar decodificación especulativa.

## Casos de uso

- Agente de código para resolución de issues: el modelo está optimizado para SWE-bench Verified (73,4) y SWE-bench Multilingual (67,2), por lo que puede integrarse en pipelines que reciben un repositorio, localizan el fallo y generan un parche verificable.
- Automatización de tareas de terminal y shell: con Terminal-Bench 2.0 como referencia, puede operar en entornos de línea de comandos para ejecutar comandos, interpretar salidas y corregir errores de forma iterativa.
- Desarrollo frontend asistido: la model card destaca mejoras en flujos frontend, lo que permite generar y modificar componentes de interfaz a partir de descripciones o capturas de pantalla gracias al codificador de visión.
- Asistente de revisión de código en CI/CD: con 262.144 tokens de contexto nativo puede analizar diffs grandes y múltiples ficheros de un mismo repositorio en una sola pasada.
- Procesamiento de documentos largos con imágenes: al combinar visión y contexto extensible hasta 1.010.000 tokens, puede extraer información de informes escaneados, diagramas y tablas en un mismo flujo.
- Chat de soporte técnico especializado: la preservación del contexto de razonamiento entre turnos reduce la repetición de explicaciones en conversaciones largas de depuración.
- Análisis de repositorios completos: la ventana extensible permite cargar árboles de código amplios para tareas de documentación automática o auditoría de dependencias.

## Benchmarks y rendimiento

Los datos disponibles en la model card corresponden a la familia Qwen3.6 y comparan Qwen3.6-35B-A3B con Qwen3.5-27B, Gemma4-31B, Qwen3.5-35BA3B y Gemma4-26BA4B. La tabla publicada queda truncada en el apartado de Terminal-Bench 2.0, por lo que solo se recogen las filas completas.

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 52,0 | 70,0 | 17,4 | 73,4 |
| SWE-bench Multilingual | 69,3 | 51,7 | 60,3 | 17,3 | 67,2 |
| SWE-bench Pro | 51,2 | 35,7 | 44,6 | 13,8 | 49,5 |
| Terminal-Bench 2.0 | datos truncados | datos truncados | datos truncados | datos truncados | datos truncados |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks de visión.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 70 GB solo para pesos, lo que exige GPUs con 80 GB (A100 80GB, H100 80GB) o múltiples GPUs.
- En cuantización de 8 bits: en torno a 35-40 GB, viable en una A100 40GB o en dos RTX 4090 de 24 GB.
- En cuantización de 4 bits: aproximadamente 18-22 GB, cabe en una RTX 4090 o RTX 5090 de 24 GB, aunque el codificador de visión y el contexto largo incrementan el consumo de KV cache.
- Contexto largo: con 262.144 tokens la KV cache crece de forma significativa; para contextos muy extensos se recomienda H100 o A100 con 80 GB y atención optimizada (FlashAttention, paged attention).
- Opciones de despliegue: Transformers, vLLM, SGLang y KTransformers según la model card; llama.cpp y Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | SWE-bench Verified |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B | 35,1B | ~3B | 262.144 (ext. 1.010.000) | Apache 2.0 | 73,4 |
| Qwen3.5-35BA3B | no disponible | ~3B | no disponible | no disponible | 70,0 |
| Qwen3.5-27B | 27B | 27B (denso) | no disponible | no disponible | 75,0 |
| Gemma4-31B | 31B | no disponible | no disponible | no disponible | 52,0 |
| Gemma4-26BA4B | 26B | ~4B | no disponible | no disponible | 17,4 |

Qwen3.6-35B-A3B mejora a su predecesor Qwen3.5-35BA3B en SWE-bench Verified (+3,4), SWE-bench Multilingual (+6,9) y SWE-bench Pro (+4,9), y supera ampliamente a los modelos Gemma4 en tareas de agente de código, aunque queda por debajo del modelo denso Qwen3.5-27B en SWE-bench Verified y Multilingual.

## Limitaciones y advertencias

- La model card no especifica los idiomas soportados; el rendimiento en castellano o en lenguas minoritarias no está documentado.
- No se han publicado datos sobre sesgos, evaluación de toxicidad ni tasas de alucinación.
- El repositorio analizado es una publicación derivada de terceros (`jacobmorrison`), con solo 30 descargas y 0 likes; no es el repositorio oficial de Qwen, por lo que conviene verificar la integridad de los pesos antes de usarlos en producción.
- La licencia Apache 2.0 permite uso comercial, pero los pesos derivados podrían no reflejar exactamente el comportamiento del modelo oficial.
- El contexto extensible hasta 1.010.000 tokens requiere técnicas de escalado que pueden degradar la calidad en posiciones lejanas; no hay benchmarks publicados para ese régimen.
- Los benchmarks de la model card provienen del modelo base Qwen3.6-35B-A3B, no necesariamente de esta variante concreta; no se aportan evaluaciones propias del repositorio derivado.
- El tamaño del repositorio (70,2 GB) implica que el despliegue en GPUs de consumo requiere cuantización, con la consiguiente pérdida potencial de precisión.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/jacobmorrison/qwen3.6-35b-a3b-miles-r2-uniform
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Blog de Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Licencia Apache 2.0 del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Qwen Chat: https://chat.qwen.ai
