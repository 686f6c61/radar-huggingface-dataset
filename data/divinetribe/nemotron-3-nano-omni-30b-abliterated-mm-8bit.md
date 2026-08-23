# divinetribe/Nemotron-3-Nano-Omni-30B-Abliterated-MM-8bit

## Resumen

Este modelo es una conversión a formato MLX de 8 bits del Nemotron-3-Nano-Omni-30B-A3B-Reasoning de NVIDIA, modificada mediante una técnica de ablación direccional (abliteration) para eliminar la dirección de rechazo del modelo de lenguaje. El resultado es una versión "sin censura" que conserva intactas las torres de visión y audio del modelo original, permitiendo ejecutar un modelo multimodal completo en Apple Silicon. Es, según su autor, la primera build abliterated de un modelo Omni en MLX.

El modelo base de NVIDIA es un sistema omni-modal que unifica visión, audio y texto en una única red, diseñado para agentes de IA que necesitan razonar sobre múltiples modalidades sin perder contexto entre modelos separados. Combina un backbone de lenguaje NemotronH (híbrido de Mamba-2 y atención) de tipo MoE con un codificador de visión RADIO v2.5-H y un codificador de audio Parakeet (FastConformer). La versión abliterated aquí descrita conserva estas capacidades pero elimina el alineamiento de seguridad del componente de texto, lo que la hace inadecuada para aplicaciones que requieran moderación de contenido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | NemotronH (Mamba-2 híbrido + Attention) con MoE, codificador de visión RADIO v2.5-H y codificador de audio Parakeet (FastConformer) |
| Parámetros totales | 9.816.032.182 (según safetensors); el modelo base se anuncia como 30B-A3B (MoE con 3B activos) |
| Parámetros activos | ~3B (MoE, según denominación del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8-bit (MLX) |
| Idiomas soportados | no disponibles |
| Licencia | other (licencia no especificada en la model card; el modelo base de NVIDIA tiene su propia licencia) |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base es el **Nemotron-3-Nano-Omni-30B-A3B-Reasoning** de NVIDIA, un modelo de razonamiento omni-modal que acepta entradas intercaladas de texto, imagen y audio. La arquitectura combina un backbone de lenguaje **NemotronH** (híbrido de Mamba-2 y atención) con un MoE de 30B parámetros totales y 3B activos, un codificador de visión **RADIO v2.5-H** y un codificador de sonido **Parakeet (FastConformer)**.

La modificación realizada por el autor de esta build consiste en una **ablación direccional** siguiendo la metodología de Arditi et al. La dirección de rechazo del modelo se encontró distribuida en dos bloques (16 y 31), por lo que una ablación de una sola capa no era suficiente. El autor aplicó el procedimiento de Gram-Schmidt para ortogonalizar y eliminar ambas direcciones de todas las proyecciones que escriben residuales: la `out_proj` de Mamba, la `o_proj` de atención, la `fc2` de los expertos enrutados del MoE, la `down_proj` del experto compartido y los embeddings de tokens. Los tensores de visión y audio se copian sin modificar.

El resultado es un modelo con 1.481 tensores: 401 de lenguaje (abliterados), 390 de visión, 684 de sonido y 6 de proyección, con nombres idénticos al base.

## Capacidades

- **Generación de texto y razonamiento**: el modelo base es un modelo de razonamiento con capacidad de pensamiento encadenado (Reasoning), aunque esta versión abliterada elimina la capa de rechazo que filtraba contenido dañino.
- **Visión**: describe imágenes con precisión, según verificación del autor.
- **Audio**: transcribe habla, según verificación del autor.
- **Entrada multimodal intercalada**: soporta combinar texto, imagen y audio en una misma conversación.
- **Sin dirección de rechazo**: el modelo no muestra rechazo ante peticiones dañinas (verificado 6/6 en un conjunto de pruebas retenido).
- **Ejecución en Apple Silicon**: al ser una conversión MLX, se puede ejecutar nativamente en Macs con Apple Silicon mediante la librería `mlx-vlm`.
- **Capacidad de agente**: el modelo base está diseñado para ser usado como agente de IA en aplicaciones de razonamiento multi-paso, aunque esta build no documenta explícitamente el soporte de tool calling.

## Casos de uso

- **Asistentes de voz locales**: al integrar audio, texto y visión en un solo modelo, puede servir de base para asistentes de voz en el dispositivo que transcriban el habla, entiendan imágenes y generen respuestas de texto sin depender de servicios externos. Su formato MLX permite ejecutarlo en un Mac con suficiente memoria unificada.
- **Análisis de imágenes médicas o técnicas**: la torre de visión intacta permite describir radiografías, diagramas o capturas de pantalla de manera detallada, aunque la ausencia de alineamiento de seguridad hace que no deba usarse en contextos clínicos sin supervisión humana.
- **Transcripción de audio y subtitulación**: el codificador Parakeet transcribe audio, lo que permite generar subtítulos o actas de reuniones a partir de grabaciones.
- **Razonamiento multi-hop sobre documentos**: el modelo de razonamiento puede combinar texto e imágenes de un documento para responder preguntas complejas que requieran integrar información de varias fuentes.
- **Generación de contenido creativo**: la eliminación del rechazo permite explorar temas que los modelos alineados evitan, como ficción oscura o humor políticamente incorrecto, siempre que el usuario asuma la responsabilidad del contenido generado.
- **Desarrollo de agentes locales**: integrado con proyectos como Claude Code Local, puede servir de backend de inferencia para agentes de programación en el dispositivo, aunque su tamaño de 8-bit (~33GB) requiere un Mac con memoria abundante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta la verificación de que el modelo describe imágenes correctamente, transcribe habla y no muestra rechazo ante contenido dañino (6/6), pero no proporciona métricas cuantitativas de calidad de generación, razonamiento o visión.

## Requisitos de hardware

- **VRAM estimada**: ~33 GB en 8-bit, por lo que requiere un Mac con al menos 48 GB de memoria unificada (o 64 GB para mayor holgura).
- **GPU recomendadas**: Apple Silicon con memoria unificada (M1 Max, M2 Ultra, M3 Max, M4 Max o superiores con 48 GB o más).
- **No cabe en GPU de consumo**: la carga de 33 GB excede la VRAM de tarjetas como la RTX 4090 (24 GB), por lo que no es viable en GPUs de consumo sin cuantizaciones adicionales.
- **Opciones de despliegue**: `mlx-vlm` (versión 0.6.12+ con soporte Omni), que permite inferencia local en Apple Silicon.
- **Latencia y throughput**: no disponibles en la información proporcionada; dependerán de la memoria unificada y el ancho de banda de la máquina.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Nemotron-3-Nano-Omni-30B-A3B-Reasoning** (base) | 30B totales, 3B activos | no disponible | texto, imagen, audio | NVIDIA (propietaria) | Hugging Face, NIM |
| **Nemotron-3-Nano-Omni-30B-Abliterated-MM-8bit** (este modelo) | 9.8B (safetensors) | no disponible | texto, imagen, audio | other (no especificada) | Hugging Face, MLX |
| **Qwen2.5-VL-7B** | 7B | 128K | texto, imagen | Apache 2.0 | Hugging Face |

La comparativa con Qwen2.5-VL es orientativa: este modelo es de mayor tamaño y añade audio, pero la falta de datos de contexto y benchmarks impide una comparación cuantitativa. La principal diferencia con el base de NVIDIA es la eliminación del rechazo de seguridad y el formato MLX para Apple Silicon.

## Limitaciones y advertencias

- **Alineamiento de seguridad eliminado**: el modelo no rechaza contenido dañino. Es responsabilidad del usuario el uso que se le dé; no es apto para aplicaciones de producción que requieran moderación.
- **Sesgos y alucinaciones**: al ser un modelo de razonamiento multimodal, puede generar información falsa o sesgada, especialmente en dominios especializados donde no tiene datos de entrenamiento.
- **Idiomas no documentados**: no se especifica qué idiomas soporta; aunque el modelo base es multilingüe, no hay datos verificables para esta build.
- **Contexto no documentado**: no se conoce la longitud máxima de contexto, lo que dificulta su uso en aplicaciones que requieran ventanas largas.
- **Licencia ambigua**: la etiqueta "other" no especifica los términos de uso comercial. El modelo base de NVIDIA tiene una licencia propia que debe revisarse antes de usar esta build en producción.
- **Requisitos de hardware elevados**: necesita 33 GB de memoria, lo que limita su despliegue a máquinas con mucha RAM y excluye la mayoría de GPU de consumo.
- **Dependencia de `mlx-vlm`**: requiere una versión reciente de la librería con soporte Omni, lo que puede limitar la integración con otros frameworks.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/divinetribe/Nemotron-3-Nano-Omni-30B-Abliterated-MM-8bit)
- [Modelo base MLX](https://huggingface.co/mlx-community/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-bf16)
- [Página del modelo en NVIDIA NIM](https://build.nvidia.com/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning)
- [Anuncio de NVIDIA sobre Nemotron 3 Nano Omni](https://blogs.nvidia.com/blog/nemotron-3-nano-omni-multimodal-ai-agents/)
- [Documentación de NeMo AutoModel para Nemotron-3-Nano-Omni](https://docs.nvidia.com/nemo/automodel/model-coverage/omni/nvidia/nemotron-omni)
- [Repositorio de referencia de inferencia MLX para Omni](https://github.com/nicedreamzapp/nemotron-omni-mlx)
- [Proyecto Claude Code Local](https://github.com/nicedreamzapp/claude-code-local)
- [Leaderboard Agent-12](https://nicedreamzapp.github.io/agent12/)
