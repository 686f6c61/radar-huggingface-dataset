# DavidAU/Qwen3.5-4B-Claude-4.6-HighIQ-THINKING

## Resumen

Qwen3.5-4B-Claude-4.6-HighIQ-THINKING es un ajuste fino (fine-tune) del modelo denso Qwen3.5-4B de Alibaba Qwen, publicado por el creador independiente DavidAU. El ajuste se realizó con Unsloth sobre hardware local, empleando el denominado dataset Claude-4.6-OS (una composición de cuatro datasets de Claude), con el objetivo declarado de mejorar el razonamiento y la generación de texto sin degradar los benchmarks del modelo base. El resultado es un modelo orientado a escritura creativa, ficción, generación de tramas y roleplaying, aunque conserva la arquitectura multimodal del original.

El modelo base Qwen3.5-4B es un transformer causal con codificador de visión, que combina capas de atención lineal (Gated DeltaNet) con capas de atención con compuertas (Gated Attention) en un esquema híbrido. Cuenta con 4.539.265.536 parámetros totales, dimensión oculta de 2560, 32 capas y una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.010.000. El ajuste mantiene el pipeline image-text-to-text, por lo que conserva capacidad de procesar imágenes junto a texto.

Su relevancia actual radica en dos factores: por un lado, ofrece un contexto extremadamente largo en un modelo de solo 4B parámetros, lo que lo hace desplegable en hardware modesto; por otro, el ajuste busca reforzar el razonamiento y la calidad de escritura creativa, ámbitos donde los modelos pequeños suelen quedarse cortos. La licencia Apache 2.0 facilita su uso comercial. No obstante, el autor no ha publicado todavía los resultados de benchmarks del modelo ajustado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con visión: Gated DeltaNet (atención lineal) + Gated Attention, con FFN; codificador de visión |
| Parametros totales | 4.539.265.536 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantizacion | El autor sugiere mínimo q4ks (no imatrix) o IQ3S (imatrix); se distribuye en bfloat16 |
| Idiomas soportados | en, zh (etiquetados en el repo); el modelo base declara cobertura de 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers, vLLM, SGLang, KTransformers) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura híbrida poco convencional: 32 capas organizadas en 8 bloques de la forma 3 × (Gated DeltaNet → FFN) seguido de 1 × (Gated Attention → FFN). Las capas Gated DeltaNet usan 32 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128; las capas Gated Attention usan 16 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de 64 dimensiones. La dimensión intermedia del FFN es 9216, la dimensión oculta 2560 y el vocabulario 248.320 tokens (con embeddings atados a la salida). Incluye entrenamiento con multi-token prediction (MTP) en varios pasos. Según Qwen, la combinación de Gated Delta Networks con MoE (en los modelos mayores de la familia) busca alto throughput y baja latencia; en el caso de este 4B, el modelo es denso.

El ajuste de DavidAU se realizó con Unsloth sobre el modelo denso, usando el dataset Claude-4.6-OS (cuatro datasets de Claude) y buscando un entrenamiento "suave" para no degradar los benchmarks del original. El autor afirma que el entrenamiento en cuatro datasets mejora el razonamiento y la generación, y que supera al modelo raíz en todos los benchmarks, aunque la tabla de resultados del modelo ajustado figura como "pending". No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO en el ajuste. El modelo base, según Qwen, fue entrenado con preentrenamiento y postentrenamiento, con RL escalado en entornos de millones de agentes y fusión temprana multimodal.

## Capacidades

- Generación de texto y razonamiento, con modo "thinking" implícito en el nombre del modelo.
- Escritura creativa: ficción, narrativa, generación de tramas y subtramas, continuación de escenas, storytelling y roleplaying en todos los géneros (ciencia ficción, romance, etc.).
- Procesamiento de imagen y texto (pipeline image-text-to-text): el autor indica que la visión funciona tras el ajuste, aunque las porciones de vídeo no fueron probadas.
- Capacidades multilingües: etiquetado en inglés y chino; el modelo base declara 201 idiomas y dialectos.
- Soporte de contexto largo: hasta 262.144 tokens nativos, con extensión hasta 1.010.000.
- Compatibilidad con tool calling y function calling: no confirmado explícitamente en la información disponible para este ajuste; el modelo base Qwen3.5 se presenta con capacidades de agentes y razonamiento multi-paso.
- Compatible con endpoints de Hugging Face y con vLLM, SGLang y KTransformers.

## Casos de uso

- Escritura de ficción y narrativa larga: el modelo puede mantener coherencia en relatos extensos gracias a su ventana de 262.144 tokens, útil para novelas por entregas, sagas o guiones con múltiples tramas y personajes.
- Roleplaying y personajes conversacionales: el ajuste está orientado explícitamente a roleplaying y escritura vívida, por lo que encaja en aplicaciones de chat con personajes, juegos de rol por texto o asistentes narrativos.
- Generación de tramas y subtramas: adecuado para herramientas de ideación que proponen arcos argumentales, giros y escenas a partir de un brief, con capacidad de continuar escenas existentes.
- Asistencia a guionistas y autores: revisión y continuación de escenas, generación de variantes de diálogo y descripciones, con soporte de contexto largo para mantener el estilo y la continuidad.
- Análisis de documentos e imágenes combinados: al conservar el codificador de visión, puede describir imágenes, extraer información de capturas o combinar texto e imagen en tareas de documentación.
- Despliegue en hardware de consumo: con 4B parámetros y cuantización q4ks o IQ3S, puede ejecutarse en GPU de gama media para prototipos de escritura creativa o asistentes locales.
- Procesamiento de documentos extensos: la ventana de contexto permite resumir o analizar contratos, informes o transcripciones largas sin truncar.

## Benchmarks y rendimiento

El autor indica que los resultados del modelo ajustado están pendientes ("-pending-"). La model card incluye, como referencia, los resultados del modelo base Qwen3.5-4B-Instruct en dos variantes de cuantización:

| Benchmark | Qwen3.5-4B-Instruct Thinking mxfp8 | Qwen3.5-4B-Instruct mxfp8 |
|---|---|---|
| ARC | 0,392 | 0,505 |
| ARC/e | 0,441 | 0,688 |
| BoolQ | 0,627 | 0,892 |
| HellaSwag | 0,601 | 0,652 |
| OpenBookQA | 0,360 | 0,420 |
| PIQA | 0,739 | 0,760 |
| Winogrande | 0,590 | 0,658 |

No se han publicado resultados de benchmarks del modelo ajustado en la información disponible. Los datos de la tabla corresponden al modelo base y no deben atribuirse al fine-tune.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, los 4.539 millones de parámetros ocupan aproximadamente 9,1 GB solo en pesos, más overhead de activaciones y caché KV; se recomienda al menos 12-16 GB para contexto moderado. En cuantización q4ks, el peso ronda los 2,5-3 GB, y en IQ3S algo menos.
- GPU recomendadas: A100 o H100 para contexto completo de 262k tokens y despliegue en producción; RTX 4090 (24 GB) para bfloat16 con contexto amplio; RTX 3090, 4080 o similares para cuantizaciones de 4 bits.
- Cabe en GPU de consumo: sí, en cuantización q4ks o IQ3S en GPU con 8-12 GB o más; en bfloat16 requiere al menos 12 GB.
- Opciones de despliegue: transformers, vLLM, SGLang, KTransformers, y formatos GGUF para llama.cpp u Ollama (aunque el repo distribuye safetensors).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-4B-Claude-4.6-HighIQ-THINKING | 4,54B (denso) | 262.144 (ext. 1.010.000) | Apache 2.0 | Fine-tune orientado a escritura creativa y roleplaying; benchmarks del ajuste pendientes |
| Qwen3.5-4B (base) | 4B (denso) | 262.144 (ext. 1.010.000) | Apache 2.0 | Modelo original de Alibaba Qwen, multimodal, con benchmarks publicados |
| Qwen3.5-4B-Instruct | 4B (denso) | 262.144 (ext. 1.010.000) | Apache 2.0 | Variante postentrenada para instrucciones; referencia de benchmarks en la model card |

No se dispone de datos de benchmarks del modelo ajustado que permitan una comparación cuantitativa con alternativas de la misma categoría. La comparación con otros fine-tunes de la comunidad no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Los benchmarks del modelo ajustado están pendientes; la afirmación del autor de que supera al modelo raíz en todos los benchmarks no está respaldada por datos publicados.
- El ajuste se realizó con un dataset derivado de Claude (Claude-4.6-OS), lo que puede introducir sesgos de estilo y contenido del modelo de origen; no se detalla la composición ni el filtrado del dataset.
- Riesgo de alucinación inherente a los modelos de 4B parámetros, especialmente en tareas factuales y de razonamiento complejo.
- Idiomas etiquetados oficialmente: inglés y chino; aunque el base declara 201 idiomas, el rendimiento en castellano no está verificado para este ajuste.
- La visión fue probada por el autor, pero las porciones de vídeo no se probaron.
- El contexto de 262.144 tokens es nativo, pero la extensión hasta 1.010.000 tokens puede degradar la calidad y exige hardware con VRAM abundante.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar el cumplimiento de las licencias del modelo base y de los datos de entrenamiento derivados de Claude.
- El autor recomienda rep pen de 1 (desactivada) y cuantizaciones mínimas q4ks o IQ3S; cuantizaciones más agresivas pueden degradar la calidad.
- Modelo con pocas descargas (100) y likes (7) en el momento de la consulta; madurez y soporte comunitario limitados.

## Enlaces

- Hugging Face: https://huggingface.co/DavidAU/Qwen3.5-4B-Claude-4.6-HighIQ-THINKING
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Página de soporte del autor: https://huggingface.co/DavidAU/support
