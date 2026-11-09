# DavidAU/Qwen3.5-27B-Gemini3-Pro-High-Reasoning-Compact-Thinking

## Resumen

Qwen3.5-27B-Gemini3-Pro-High-Reasoning-Compact-Thinking es un ajuste fino (fine-tune) del modelo denso Qwen3.5-27B desarrollado por el usuario DavidAU. El modelo se ha entrenado mediante Unsloth sobre hardware local utilizando el conjunto de datos TeichAI/gemini-3-pro-preview-high-reasoning-250x, un dataset de destilación de razonamiento de Gemini 3 Pro. El objetivo es dotar al modelo base de bloques de "pensamiento" (thinking) al estilo de Gemini Pro, manteniendo al mismo tiempo las capacidades originales del modelo Qwen3.5, incluida la visión.

El modelo hereda la arquitectura híbrida del Qwen3.5-27B: una combinación de Gated DeltaNet (atención lineal) y atención con compuertas (Gated Attention) organizada en 64 capas, con una dimensión oculta de 5120 y una ventana de contexto nativa de 262.144 tokens. El ajuste modifica el tamaño y el estilo del bloque de razonamiento, reduciéndolo ("compact thinking") para acortar las cadenas de pensamiento y acelerar la generación, aunque el autor advierte de que se trata de una versión "early alpha" con posibles inestabilidades.

La relevancia de esta ficha radica en que combina un modelo base multimodal de última generación con un estilo de razonamiento destilado de un modelo propietario, algo útil para experimentación en generación creativa, rol y escritura de ficción. No obstante, al ser un fine-tune comunitario en fase alfa, no debe considerarse un sustituto de producción del modelo oficial Qwen3.5-27B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con encoder de visión; Gated DeltaNet (atención lineal) + Gated Attention, 64 capas |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos (256k por defecto en el tune); extensible según el modelo base |
| Tipos de cuantizacion | bfloat16 nativo; el autor recomienda mínimo Q4_K_S (sin imatrix) o IQ3_S (con imatrix); existen versiones MLX y MXFP4 |
| Idiomas soportados | en, zh (etiquetados); el modelo base Qwen3.5 declara 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); el autor menciona versiones GGUF y MLX |
| Dimensión oculta | 5120 |
| Dimensión intermedia (FFN) | 17.408 |
| Vocabulario | 248.320 (con padding) |
| Cabezas de atención | Gated Attention: 24 Q / 4 KV, dim. de cabeza 256; Gated DeltaNet: 48 V / 16 QK, dim. 128 |
| Pipeline | image-text-to-text (multimodal) |
| Tamaño del repositorio | 54,7 GB |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-27B emplea una arquitectura híbrida poco convencional: 16 bloques que combinan tres capas de Gated DeltaNet (un mecanismo de atención lineal con estado recurrente) seguidas de una capa de Gated Attention clásica, cada una emparejada con su FFN. Esta disposición busca alto rendimiento de inferencia con baja latencia, manteniendo la calidad de un transformer denso de 27 B. El modelo incluye además un encoder de visión con fusión temprana de tokens multimodales, entrenado con paridad entre texto e imagen, y un módulo MTP (multi-token prediction) entrenado con varios pasos.

El fine-tune de DavidAU se realizó con Unsloth sobre hardware local, usando el dataset TeichAI/gemini-3-pro-preview-high-reasoning-250x, que contiene trazas de razonamiento de Gemini 3 Pro. El autor indica que el entrenamiento fue "suave" (mild) para no degradar los benchmarks del modelo base, y que modificó tanto el formato como el tamaño del bloque de pensamiento, haciéndolo más compacto. No se aplicó ningún ajuste de alineación de seguridad ni de censura; el autor menciona que tiene preparadas variantes "HERETIC" para ese fin. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset más allá de su origen.

## Capacidades

- Generación de texto y razonamiento con bloques de "thinking" al estilo Gemini Pro, mezclando estilos Gemini y Qwen según la complejidad de la tarea.
- Escritura creativa y de ficción: el modelo está etiquetado explícitamente para escritura creativa, generación de tramas y subtramas, continuación de escenas, narración y rol.
- Comprensión de imágenes (image-text-to-text): el autor confirma que la visión funciona tras el entrenamiento, aunque las porciones de vídeo no fueron probadas.
- Capacidades multilingües heredadas del modelo base (201 idiomas según Qwen; el tune etiqueta en y zh).
- Razonamiento multi-paso y cadenas de pensamiento compactas, pensadas para reducir la latencia frente a bloques de pensamiento largos.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible para este tune; el modelo base Qwen3.5 lo soporta según su documentación.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con transformers, vLLM, SGLang y KTransformers según el modelo base.

## Casos de uso

- Escritura de ficción y narrativa larga: el modelo puede generar tramas, subtramas y continuaciones de escenas con un estilo vívido, aprovechando su contexto de 256k para mantener coherencia en novelas o sagas de varios capítulos.
- Roleplay y personajes conversacionales: adecuado para chatbots de rol con memoria extensa, ya que el contexto largo permite conservar el historial de una sesión prolongada sin truncamientos agresivos.
- Generación de guiones y diálogos: útil para guionistas que necesitan borradores rápidos de escenas con diálogo natural, gracias a su entrenamiento específico en escritura creativa.
- Asistencia a escritores con reescritura y estilo: el modelo puede reescribir pasajes con "prosa vívida", una de las etiquetas del autor, manteniendo el tono solicitado.
- Prototipado de razonamiento compacto: investigadores pueden comparar el estilo de pensamiento destilado de Gemini 3 Pro con el original de Qwen3.5, usando el bloque de pensamiento reducido para experimentos de eficiencia.
- Análisis de imágenes con descripción narrativa: al ser multimodal, puede describir imágenes o generar texto creativo a partir de ellas, útil en herramientas de inspiración visual.
- Experimentación educativa sobre destilación: sirve como caso de estudio de cómo un dataset de razonamiento de un modelo propietario se transfiere a un modelo abierto denso de 27 B.

## Benchmarks y rendimiento

El autor indica que los benchmarks finales están "pendientes" (awaiting finals) y solo publica una tabla parcial e incompleta. Los datos disponibles son:

| Modelo | ARC | ARC/e | BoolQ | HSWAG | OBKQA | PIQA | Wino |
|---|---|---|---|---|---|---|---|
| Este modelo | 0,470 | 0,550 | 0,709 | ... | ... | ... | ... |
| Qwen3.5-27B-Text-VL qx86-hi | 0,443 | 0,498 | 0,857 | 0,701 | 0,372 | 0,770 | 0,752 |

La fila de este modelo está truncada en la información proporcionada, por lo que no es posible extraer conclusiones fiables. No se han publicado resultados completos de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 55 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 80 GB para inferencia cómoda.
- VRAM en cuantización Q4_K_S: en torno a 16-18 GB, viable en GPUs consumer de gama alta.
- VRAM en cuantización IQ3_S: en torno a 12-14 GB, apta para RTX 4090 (24 GB) y RTX 3090 (24 GB) con margen.
- GPUs recomendadas: A100 80 GB o H100 para bfloat16; RTX 4090, RTX 3090 o RTX 5090 para cuantizaciones Q4/IQ3.
- Despliegue: transformers, vLLM, SGLang y KTransformers según el modelo base; el autor menciona versiones GGUF (compatibles con llama.cpp/Ollama) y MLX para Apple Silicon.
- Latencia y throughput: no disponibles en la información proporcionada. El autor advierte de posibles bucles en el bloque de pensamiento, especialmente en versiones MLX y MXFP4, lo que puede afectar a la latencia real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (fine-tune) | 27,36 B denso | 262.144 | Sí (visión) | Apache 2.0 | Alpha, razonamiento estilo Gemini, benchmarks incompletos |
| Qwen/Qwen3.5-27B (base) | 27 B denso | 262.144 | Sí (visión) | Apache 2.0 | Modelo oficial, benchmarks completos, alineación estándar |
| Qwen3.5-27B-Text-VL qx86-hi | 27 B | no disponible | Sí | no disponible | Referencia usada por el autor en su tabla parcial |
| Alternativas de 27-32 B densos | ~27-32 B | variable | variable | variable | No se dispone de datos comparativos verificados en la información proporcionada |

La comparación más directa es con el modelo base Qwen3.5-27B, que ofrece los mismos parámetros y contexto, pero con benchmarks publicados y sin los riesgos de un fine-tune alfa. Para alternativas de otros fabricantes no hay datos en la información disponible.

## Limitaciones y advertencias

- Versión "early alpha": el propio autor advierte de posibles problemas derivados de la arquitectura nueva y de la integración con transformers.
- Riesgo de bucles en el bloque de pensamiento, especialmente en las variantes MLX y MXFP4 y en tareas que usan solo el estilo Gemini.
- Benchmarks incompletos: no hay datos finales que confirmen que el fine-tune no degrada el rendimiento del modelo base.
- Sin ajuste de alineación de seguridad: el autor no modificó la censura ni la seguridad, y planea variantes "HERETIC"; esto implica que el modelo puede generar contenido no filtrado.
- Idiomas etiquetados limitados a en y zh, aunque el modelo base declara 201 idiomas; el rendimiento real en otros idiomas no está verificado.
- Vídeo no probado: solo se validó la visión con imágenes.
- Riesgo de alucinación inherente a los modelos de 27 B y acentuado por el estilo de razonamiento destilado, que puede producir cadenas de pensamiento plausibles pero incorrectas.
- Licencia Apache 2.0 permite uso comercial, pero al ser un fine-tune comunitario conviene validar el comportamiento en el dominio de producción antes de desplegarlo.
- El dataset de destilación proviene de Gemini 3 Pro; deben revisarse las condiciones de uso de datos derivados de modelos propietarios según la jurisdicción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Qwen3.5-27B-Gemini3-Pro-High-Reasoning-Compact-Thinking
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Página de soporte/FAQ del autor: https://huggingface.co/DavidAU/support
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Dataset de destilación: https://huggingface.co/datasets/TeichAI/gemini-3-pro-preview-high-reasoning-250x
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
