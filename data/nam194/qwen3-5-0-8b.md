# nam194/Qwen3.5-0.8B

## Resumen

Qwen3.5-0.8B es un modelo causal multimodal (texto e imagen) de la familia Qwen3.5, desarrollado por Alibaba Qwen y publicado con licencia Apache-2.0. Esta ficha corresponde a la copia alojada por el usuario `nam194` en HuggingFace, cuyo modelo base declarado es `Qwen/Qwen3.5-0.8B-Base`. Con 873.438.784 parámetros reales (etiquetado comercialmente como 0,8B), está pensado para prototipado, ajuste fino específico de tarea y experimentación, según indica la propia model card.

La relevancia del modelo radica en su arquitectura híbrida: combina capas de atención lineal Gated DeltaNet con capas de atención clásica ("Gated Attention") en un patrón repetido, lo que reduce el coste de inferencia en contextos largos frente a un transformer denso convencional. Incorpora además un codificador de visión con fusión temprana, de modo que procesa imágenes y texto de forma nativa, y soporta una ventana de contexto nativa de 262.144 tokens.

Al tratarse de un modelo de escala reducida, sus resultados en benchmarks de conocimiento general son modestos (29,7 en MMLU-Pro en modo no-thinking), por lo que su utilidad práctica está en tareas acotadas, despliegue en hardware limitado y experimentación con la arquitectura híbrida más que en razonamiento de propósito general de alta exigencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Causal Language Model con codificador de visión; híbrida Gated DeltaNet + Gated Attention |
| Parámetros totales | 873.438.784 (0,8B nominales) |
| Parámetros activos | No aplica (modelo denso, FFN con dimensión intermedia 3584) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantización | No disponible en el repositorio (pesos en safetensors); convertible a GGUF/AWQ/GPTQ mediante herramientas externas |
| Idiomas soportados | 201 idiomas y dialectos (según las notas de Qwen3.5) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (Hugging Face Transformers); compatible con vLLM, SGLang y KTransformers |

## Arquitectura y entrenamiento

El modelo es un transformer híbrido con 24 capas organizadas en 6 bloques de la forma `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`. Las capas Gated DeltaNet emplean atención lineal con 16 cabezas para V y 16 para QK, con dimensión de cabeza 128. Las capas de Gated Attention usan 8 cabezas para Q y 2 para KV, con dimensión de cabeza 256 y RoPE de dimensión 64. La dimensión oculta es 1024, la FFN tiene dimensión intermedia 3584 y el embedding de tokens es de 248.320 entradas (con padding), atado a la salida LM. El modelo incluye un codificador de visión y se entrenó con multi-token prediction (MTP).

Según la model card, el entrenamiento combina pre-entrenamiento y post-entrenamiento con fusión temprana sobre tokens multimodales, de modo que el modelo alcanza paridad con la generación Qwen3 en texto y supera a los Qwen3-VL en razonamiento, código, agentes y comprensión visual. El post-entrenamiento incluye RL a gran escala sobre entornos multiagente con distribuciones de tareas progresivamente más complejas. No se detallan en la información disponible el número exacto de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto y razonamiento en modo thinking y non-thinking (la tabla de benchmarks distingue ambos modos).
- Comprensión de imágenes y texto de forma nativa (pipeline `image-text-to-text`), con codificador de visión integrado.
- Codigo, matemáticas y tareas de conocimiento general, con rendimiento limitado por el tamaño (ver benchmarks).
- Soporte de tool calling y function calling, herencia de la familia Qwen3.5.
- Capacidades de agente y razonamiento multi-paso, entrenadas mediante RL sobre entornos multiagente.
- Cobertura multilingüe amplia: 201 idiomas y dialectos según las notas de la familia.
- Ventana de contexto larga de 262.144 tokens, adecuada para documentos extensos o conversaciones prolongadas.
- Multi-token prediction (MTP) entrenado con varios pasos, orientado a decodificación especulativa y mayor throughput.

## Casos de uso

- Prototipado de asistentes multimodales: al aceptar imagen y texto, permite construir demos de chat que responden preguntas sobre capturas, diagramas o fotos sin necesidad de GPUs de gama alta.
- Ajuste fino específico de tarea: con 0,8B parámetros es viable reentrenar o hacer LoRA sobre dominios concretos (soporte, clasificación documental) en una única GPU consumer.
- Comprensión de documentos largos: la ventana de 262.144 tokens permite ingerir contratos, informes o transcripciones completas junto con imágenes escaneadas en una sola pasada.
- Extracción de información de imágenes: procesamiento de tickets, formularios o pantallazos para extraer campos estructurados en pipelines de digitalización.
- Base para agentes ligeros: su soporte de tool calling y contexto largo lo hace utilizable como planificador en flujos multi-paso de bajo coste.
- Despliegue en edge o entornos con recursos limitados: al ocupar menos de 2 GB en BF16, cabe en dispositivos con GPU integrada o en CPU para inferencia por lotes.
- Investigación en arquitecturas híbridas: sirve como banco de pruebas para estudiar el comportamiento de Gated DeltaNet frente a atención clásica a pequeña escala.

## Benchmarks y rendimiento

Resultados publicados en la model card (modo non-thinking). La información proporcionada está truncada tras C-Eval, por lo que no se dispone del resto de métricas.

| Benchmark | Qwen3-4B-2507 | Qwen3-1.7B | Qwen3.5-2B | Qwen3.5-0.8B |
|---|---|---|---|---|
| MMLU-Pro | 69,6 | 40,2 | 55,3 | 29,7 |
| MMLU-Redux | 84,2 | 64,4 | 69,2 | 48,5 |
| C-Eval | 80,2 | 61,0 | 65,2 | 46,4 |

No se han publicado en la información disponible resultados de benchmarks de visión, código (HumanEval), matemáticas (GSM8K) ni agentes para este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: en torno a 2-3 GB para pesos y codificador de visión en contextos cortos (estimación a partir de 873M parámetros y repo de 1,8 GB).
- VRAM estimada en INT8: aproximadamente 1 GB; en INT4: en torno a 0,5 GB (estimaciones, no confirmadas por el autor).
- Caché KV para contexto completo: con 262.144 tokens y solo 6 capas de atención completa, el coste adicional de caché se estima en unos 3 GB en FP16, además del estado constante de las capas lineales (cálculo estimado, no publicado).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060/4060 en adelante) es suficiente en BF16 para contexto corto; A100/H100 no son necesarias salvo para lotes grandes o contextos muy largos.
- Cabe en GPU consumer: sí, holgadamente, incluso en iGPU y CPU para inferencia de baja concurrencia.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y KTransformers (confirmadas en la model card); llama.cpp/Ollama requerirían conversión a GGUF no incluida en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | MMLU-Redux | C-Eval | Licencia |
|---|---|---|---|---|---|---|
| Qwen3.5-0.8B | 0,87B | 262.144 | 29,7 | 48,5 | 46,4 | Apache-2.0 |
| Qwen3.5-2B | ~2B (nominal) | No disponible | 55,3 | 69,2 | 65,2 | No disponible |
| Qwen3-1.7B | ~1,7B (nominal) | No disponible | 40,2 | 64,4 | 61,0 | No disponible |
| Qwen3-4B-2507 | ~4B (nominal) | No disponible | 69,6 | 84,2 | 80,2 | No disponible |

El modelo se sitúa por debajo de sus hermanos mayores de la familia en conocimiento general, lo que es coherente con su escala. No se dispone de datos de contexto ni licencia de los modelos comparados en la información proporcionada, por lo que se marcan como no disponibles.

## Limitaciones y advertencias

- Modelo de 0,87B parámetros: rendimiento limitado en razonamiento y conocimiento general (MMLU-Pro 29,7), no apto para tareas de alta exigencia sin ajuste fino.
- Riesgo de alucinación elevado en modelos pequeños, especialmente en preguntas abiertas o generación de código complejo.
- La copia analizada pertenece al usuario `nam194` con 0 descargas y 0 likes; se trata probablemente de un espejo o re-subida no oficial. Conviene verificar la procedencia frente al repositorio oficial de Qwen antes de usarla en producción.
- No hay datos de rendimiento por idioma dentro de los 201 declarados; el rendimiento en lenguas distintas del inglés y el chino puede degradarse.
- No se han publicado en la información disponible métricas de visión, tool calling ni agentes que permitan validar esas capacidades en este tamaño concreto.
- Aunque la licencia es Apache-2.0 (permite uso comercial), se recomienda revisar el archivo LICENSE enlazado por posibles condiciones adicionales del autor original.
- El contexto de 262.144 tokens es nativo, pero el coste de caché KV en contextos muy largos puede superar la VRAM de GPUs pequeñas pese al reducido tamaño de los pesos.

## Enlaces

- Modelo en HuggingFace (copia nam194): https://huggingface.co/nam194/Qwen3.5-0.8B
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Licencia: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
