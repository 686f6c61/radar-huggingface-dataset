# divinetribe/Nemotron-3-Nano-Omni-30B-Abliterated-MM-bf16

## Resumen

El modelo `divinetribe/Nemotron-3-Nano-Omni-30B-Abliterated-MM-bf16` es una adaptación sin alineación de seguridad (abliterated) del modelo omni-modal de NVIDIA **Nemotron-3-Nano-Omni-30B-A3B-Reasoning**, convertido al formato MLX para ejecutarse en Apple Silicon. El autor, divinetribe (Matt Macosko), eliminó la dirección de rechazo únicamente del stack de lenguaje, dejando intactos los encoders de visión y audio, de modo que texto, imagen y sonido funcionan plenamente. Es, según su autor, la primera versión abliterada de un modelo Omni en MLX, ya que las alternativas existentes (NVFP4 y GGUF) no son ejecutables en Mac.

El modelo base de NVIDIA combina un backbone de lenguaje NemotronH —híbrido de Mamba-2 y Attention, con arquitectura MoE— con un encoder de visión RADIO v2.5-H y un encoder de audio Parakeet (FastConformer). Los tensores suman 33.015.598.918 parámetros totales (33B) con aproximadamente 3B activos (A3B). La versión bf16 completa ocupa unos 66 GB en el repositorio y unos 62 GB en memoria unificada. El repositorio se creó en agosto de 2026 y es relevante para desarrolladores que buscan un modelo omni-modal sin rechazo, ejecutable localmente en hardware de Apple.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H (híbrido Mamba-2 + Attention) MoE con encoder de visión RADIO v2.5-H y encoder de audio Parakeet (FastConformer) |
| Parametros totales | 33.015.598.918 (33B) |
| Parametros activos | ~3B (A3B, MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (repo principal, ~62 GB) y 4-bit (repo separado) |
| Idiomas soportados | no disponible |
| Licencia | other (licencia propietaria de NVIDIA, no especificada) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base de NVIDIA, Nemotron-3-Nano-Omni-30B-A3B-Reasoning: un backbone de lenguaje Nemotron-H que combina capas de Mamba-2 con atención clásica en un diseño MoE con 3B parámetros activos, junto a dos torres modales —un encoder de visión RADIO v2.5-H y un encoder de audio Parakeet (FastConformer)— que permiten entradas intercaladas de texto, imagen y audio. Los detalles del entrenamiento original (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada.

La modificación principal es la **ablación direccional** (método de Arditi et al.): el autor identificó que la dirección de rechazo en este modelo se distribuye en dos bloques (16 y 31), no en uno solo, por lo que una ablación de una única capa no era suficiente. Tras aplicar Gram-Schmidt y ortogonalización, se eliminaron las proyecciones de escritura residuales de Mamba (`out_proj`), atención (`o_proj`), expertos enrutados MoE (`fc2`), experto compartido (`down_proj`) y embeddings de tokens. Los tensores de visión y audio se copiaron intactos, manteniendo el nombre-for-nombre idéntico al modelo base (1.401 tensores: 401 de lenguaje abliterado, 140 de visión, 684 de sonido y 6 de proyección).

## Capacidades

- **Procesamiento tri-modal**: texto, imagen y audio, con soporte de entradas intercaladas (interleaved text, image, audio).
- **Razonamiento multimodal**: capacidad de razonar sobre contenido visual y auditivo combinado con texto, orientado a tareas de agente y sub-agente en casos de uso como computer use agent, document intelligence y video/audio understanding.
- **Conversación**: pipeline `image-text-to-text`, adecuado para diálogos multimodales.
- **Sin dirección de rechazo**: la alineación de seguridad se ha eliminado del stack de lenguaje (verificado 6/6 en un conjunto de pruebas), por lo que el modelo no rechaza peticiones que el base sí rechazaría.
- **Ejecución local en Apple Silicon**: formato MLX nativo, sin necesidad de GPU NVIDIA.

No se menciona en la información disponible soporte de tool calling ni function calling explícito.

## Casos de uso

- **Análisis de imágenes en local**: el modelo describe correctamente imágenes mediante el encoder RADIO, y puede ejecutarse en Apple Silicon con `mlx-vlm`, sin enviar datos a la nube.
- **Transcripción y comprensión de audio**: el encoder Parakeet transcribe voz y el modelo puede razonar sobre el contenido auditivo, útil para procesamiento de reuniones, podcasts o notas de voz.
- **Asistentes documentales multimodales**: al combinar texto, imágenes y audio, puede extraer información de PDFs escaneados, presentaciones con imágenes y grabaciones asociadas.
- **Investigación en alineación de modelos**: al ser abliterado, es un objeto de estudio para entender los mecanismos de rechazo y la distribución de la dirección de seguridad en arquitecturas híbridas MoE.
- **Desarrollo de agentes locales**: junto con proyectos como Claude Code Local, puede usarse como modelo de razonamiento para agentes que necesitan interpretar capturas de pantalla o audio en el dispositivo.
- **Generación de descripciones y subtítulos**: para imágenes y audio, útil en accesibilidad, metadatos o generación de contenido a partir de material multimedia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones MMLU, HumanEval, GSM8K ni otros datos comparativos para esta adaptación abliterada ni para el modelo base en esta fuente.

## Requisitos de hardware

- **Memoria**: la versión bf16 requiere ~62 GB de RAM unificada (66 GB de repo); la versión 4-bit reduce notablemente el consumo (no se especifica el valor exacto).
- **Plataforma**: exclusivamente Apple Silicon (M1/M2/M3/M4), gracias al formato MLX.
- **GPU**: no aplica en el sentido tradicional; requiere Mac con memoria unificada suficiente (Mac Studio, MacBook Pro de gama alta).
- **Librerías**: `mlx-vlm` versión 0.6.12 o superior con soporte Omni; referencia de runtime en `https://github.com/nicedreamzapp/nemotron-omni-mlx`.
- **Despliegue**: la ejecución se realiza mediante `python -m mlx_vlm generate`; no se mencionan opciones vLLM, llama.cpp, Ollama o TGI para este formato MLX.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3-Nano-Omni-30B-A3B-Reasoning (NVIDIA) | 33B totales, 3B activos | no disponible | texto, imagen, audio, video | propietaria | Hugging Face, NIM |
| Nemotron-3-Nano-Omni-30B-Abliterated-MM-bf16 (este) | 33B totales, 3B activos | no disponible | texto, imagen, audio | other (propietaria) | Hugging Face, MLX |
| Nemotron-3-Nano-Omni-30B-Abliterated-MM-4bit | 33B totales, 3B activos | no disponible | texto, imagen, audio | other (propietaria) | Hugging Face, MLX |

La comparativa con otros modelos omni-modales de la misma categoría (como Qwen2.5-Omni o Llama-3.2-Vision) no está disponible en la información proporcionada; no se dispone de datos de rendimiento ni contexto para establecer una comparación objetiva.

## Limitaciones y advertencias

- **Alineación de seguridad eliminada**: el modelo puede generar contenido dañino, ofensivo o no seguro; el autor advierte explícitamente que el usuario es responsable de lo que genera.
- **Licencia**: la licencia es "other" (propietaria de NVIDIA), no se especifican los términos exactos; se debe verificar si el uso comercial está permitido.
- **Idiomas**: no se especifican los idiomas soportados.
- **Contexto**: la longitud de contexto no está documentada en la información proporcionada.
- **Sesgos y alucinación**: al no tener alineación, el riesgo de alucinaciones y de respuestas sesgadas puede ser mayor que en el modelo base; no hay datos específicos.
- **Plataforma limitada**: solo funciona en Apple Silicon con MLX; no es ejecutable en GPU NVIDIA/AMD convencionales ni en entornos cloud estándar.
- **Rendimiento no verificado**: no hay benchmarks publicados para esta adaptación, por lo que el comportamiento en producción es incierto.

## Enlaces

- [HuggingFace: divinetribe/Nemotron-3-Nano-Omni-30B-Abliterated-MM-bf16](https://huggingface.co/divinetribe/Nemotron-3-Nano-Omni-30B-Abliterated-MM-bf16)
- [HuggingFace: versión 4-bit](https://huggingface.co/divinetribe/Nemotron-3-Nano-Omni-30B-Abliterated-MM-4bit)
- [Runtime MLX de referencia (nemotron-omni-mlx)](https://github.com/nicedreamzapp/nemotron-omni-mlx)
- [Model card oficial de NVIDIA en NIM](https://build.nvidia.com/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning/modelcard)
- [Página de modelos Nemotron de NVIDIA](https://developer.nvidia.com/topics/ai/nemotron)
- [Documentación de NeMo AutoModel para Nemotron-3-Nano-Omni](https://docs.nvidia.com/nemo/automodel/model-coverage/omni/nvidia/nemotron-omni)
- [Claude Code Local (proyecto asociado)](https://github.com/nicedreamzapp/claude-code-local)
