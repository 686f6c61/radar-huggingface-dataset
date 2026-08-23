# divinetribe/Nemotron-3-Nano-Omni-30B-Abliterated-MM-4bit

## Resumen

El modelo `divinetribe/Nemotron-3-Nano-Omni-30B-Abliterated-MM-4bit` es una versión modificada del Nemotron-3-Nano-Omni-30B de NVIDIA, adaptada para ejecutarse en Apple Silicon mediante el framework MLX con cuantización de 4 bits. La modificación principal es la eliminación de la dirección de rechazo (refusal direction) mediante una técnica de ablación direccional, lo que elimina la alineación de seguridad en la pila de lenguaje mientras se mantienen intactos los encoders de visión y audio. El modelo resultante conserva las capacidades multimodales originales (texto, imagen y audio) y está pensado para uso local en entornos de desarrollo y agentes.

La arquitectura base es un modelo híbrido NemotronH que combina Mamba-2 y atención, con una mezcla de expertos (MoE) de 3 mil millones de parámetros activos y un total de 30 mil millones según la nomenclatura original, aunque los tensores cuantizados de este repositorio muestran 5,78 mil millones de parámetros. Incluye un encoder de visión RADIO v2.5-H y un encoder de audio Parakeet (FastConformer), lo que permite procesar entradas intercaladas de texto, imagen y audio. La licencia se indica como "other", por lo que es necesario revisar los términos de uso del modelo base de NVIDIA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NemotronH (híbrido Mamba-2 + atención) con MoE, encoder de visión RADIO v2.5-H y encoder de audio Parakeet (FastConformer) |
| Parametros totales | 5.781.994.054 (según safetensors del repositorio); el modelo base declara 30B totales |
| Parametros activos | 3B (según la nomenclatura A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | no disponible |
| Licencia | other (no especificada en el repositorio) |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base, Nemotron-3-Nano-Omni-30B-A3B-Reasoning, combina un backbone de lenguaje NemotronH que utiliza una arquitectura híbrida de Mamba-2 y atención con una mezcla de expertos (MoE) de 3B activos y 30B totales. Para el procesamiento multimodal incorpora un encoder de visión RADIO v2.5-H y un encoder de audio Parakeet basado en FastConformer, lo que permite manejar entradas interleaved de texto, imagen y audio. El entrenamiento del modelo original incluye fases de preentrenamiento y ajuste fino con razonamiento, aunque no se disponen de datos concretos sobre el corpus ni el número de tokens.

La versión abliterated se obtiene mediante una técnica de ablación direccional (Arditi et al.) que identifica y elimina la dirección de rechazo en dos bloques del modelo (bloques 16 y 31). Se aplica una ortogonalización de Gram-Schmidt para eliminar esa dirección de todas las proyecciones residuales, incluyendo las de Mamba, atención, expertos enrutados y embeddings de token. Los encoders de visión y audio se copian sin modificar. Este proceso no implica entrenamiento adicional, sino una modificación de los pesos ya entrenados.

## Capacidades

- Procesamiento multimodal interleaved: puede recibir y combinar texto, imágenes y audio en una misma entrada.
- Generación de texto y razonamiento: el modelo base está optimizado para tareas de razonamiento y respuesta a preguntas.
- Visión: describe y analiza imágenes correctamente según la validación del autor.
- Audio: transcribe habla y puede procesar señales de audio.
- Sin alineación de seguridad: la dirección de rechazo ha sido eliminada, por lo que no muestra los comportamientos de rechazo típicos de modelos alineados.
- Compatibilidad con MLX y mlx-vlm para inferencia en Apple Silicon.
- Soporte de tool calling y agentes: no se menciona explícitamente en la documentación proporcionada, pero al tratarse de un modelo de razonamiento multimodal, podría integrarse en flujos de agente, aunque no hay evidencia concreta.

## Casos de uso

- **Asistente multimodal local**: en un Mac con suficiente memoria, el modelo puede actuar como un asistente que analiza imágenes, transcribe audio y responde preguntas sobre el contenido, todo sin conexión.
- **Transcripción de audio**: gracias a su encoder Parakeet, puede transcribir grabaciones de voz, reuniones o entrevistas en tiempo real o por lotes.
- **Análisis de imágenes para documentación**: por ejemplo, extraer texto de fotografías de documentos, describir diagramas o identificar objetos en imágenes para su catalogación.
- **Generación de contenido creativo**: al no tener alineación de seguridad, puede usarse para crear narraciones o descripciones sin las restricciones habituales, aunque con responsabilidad del usuario.
- **Agente de automatización local**: combinado con el proyecto Claude Code Local (que lo integra), puede actuar como agente de código que ejecuta tareas de programación y análisis en el propio Mac.
- **Investigación en interpretabilidad**: la versión abliterated permite estudiar el efecto de la alineación en el comportamiento del modelo, comparando las respuestas con el modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de rendimiento como MMLU, HumanEval, GSM8K u otras métricas para esta versión abliterated ni para el modelo base en la documentación del repositorio.

## Requisitos de hardware

- **VRAM estimada**: el modelo en 4-bit ocupa aproximadamente 18 GB (según el autor), por lo que se recomienda un Mac con al menos 32 GB de memoria unificada para una operación cómoda.
- **GPU recomendadas**: cualquier Mac con chip Apple Silicon (M1, M2, M3 o M4) con suficiente memoria unificada. No requiere GPU dedicada NVIDIA.
- **Compatibilidad**: no es compatible con GPUs NVIDIA o AMD sin conversión de formato; está pensado para MLX.
- **Opciones de despliegue**: mediante `mlx-vlm` (versión 0.6.12 o superior) con el comando `python -m mlx_vlm generate`. También se puede integrar en entornos que usen MLX, como Claude Code Local.
- **Latencia y throughput**: no se han publicado datos concretos. Depende del hardware; en un Mac con M2 Pro o superior puede esperarse una velocidad moderada para generación de texto y procesamiento de imágenes, pero no hay cifras oficiales.

## Comparativa con modelos similares

No hay datos de rendimiento comparativos disponibles. Sin embargo, se puede comparar a nivel de arquitectura y propósito con otros modelos multimodales locales:

| Modelo | Parámetros activos | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3-Nano-Omni-30B (base) | 3B (30B total) | no disponible | texto, imagen, audio | NVIDIA (consulta términos) | Hugging Face, NIM |
| divinetribe/Nemotron-3-Nano-Omni-30B-Abliterated-MM-4bit | 3B (según base) | no disponible | texto, imagen, audio | other (no especificada) | MLX (Apple Silicon) |
| Qwen2-VL-7B (ejemplo) | 7B | 128K | texto, imagen | Apache 2.0 | Hugging Face |
| Llama-3.2-11B-Vision (ejemplo) | 11B | 128K | texto, imagen | Llama 3.2 | Hugging Face |

La comparativa es orientativa; no se dispone de benchmarks para el modelo abliterated. El modelo se diferencia por su capacidad de audio (que los otros no tienen) y por su naturaleza abliterada, que lo hace inadecuado para usos que requieran alineación de seguridad.

## Limitaciones y advertencias

- **Alineación de seguridad eliminada**: el modelo puede generar contenido inapropiado, ofensivo o peligroso sin los filtros habituales. El autor declina responsabilidad sobre su uso.
- **Licencia incierta**: la licencia se indica como "other" y no se especifica en el repositorio. Puede heredar restricciones del modelo base de NVIDIA (que suele tener una licencia de uso no comercial o de investigación). Es necesario revisar los términos de la licencia de Nemotron-3-Nano-Omni antes de un uso comercial.
- **Idiomas**: no se han publicado datos sobre los idiomas soportados; es probable que el modelo esté entrenado principalmente en inglés, aunque puede funcionar con otros idiomas con menor calidad.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de razonamiento o descripción de imágenes.
- **Contexto limitado**: no se ha confirmado la longitud de contexto, lo que puede afectar a tareas que requieran entradas largas.
- **Formato exclusivo MLX**: el modelo está en formato MLX (safetensors) y solo puede ejecutarse en Apple Silicon con MLX, no en GPUs NVIDIA o entornos estándar.
- **Validación limitada**: el autor ha verificado 5 de 6 casos en un conjunto de pruebas de contenido dañino, pero no hay evidencia exhaustiva de la eliminación completa del rechazo en todos los escenarios.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/divinetribe/Nemotron-3-Nano-Omni-30B-Abliterated-MM-4bit)
- [Modelo base en HuggingFace](https://huggingface.co/mlx-community/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-bf16)
- [Página de NVIDIA NIM para Nemotron-3-Nano-Omni](https://build.nvidia.com/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning/modelcard)
- [Documentación de NVIDIA sobre Nemotron-3-Nano-Omni](https://docs.nvidia.com/nemo/automodel/model-coverage/omni/nvidia/nemotron-omni)
- [Repositorio de runtime de referencia (nemotron-omni-mlx)](https://github.com/nicedreamzapp/nemotron-omni-mlx)
- [Proyecto Claude Code Local](https://github.com/nicedreamzapp/claude-code-local)
