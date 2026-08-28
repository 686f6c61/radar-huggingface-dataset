# mrzenin/Decka-4B

## Resumen

Decka-4B es un fine-tune del modelo Qwen3.5-4B-heretic, desarrollado por mrzenin mediante la librería Unsloth sobre hardware local. El modelo base, Qwen3.5-4B, es un modelo causal de lenguaje con encoder de visión de 4.000 millones de parámetros, con arquitectura híbrida que combina Gated Delta Networks y atención clásica, y una ventana de contexto nativa de 262.144 tokens. Decka-4B se ha entrenado con cinco datasets propios (denominados "Deckard") con un enfoque deliberadamente "suave" para no degradar los benchmarks del modelo original, y de hecho el autor afirma que supera al modelo raíz en todas las métricas evaluadas.

La característica más destacada es que se trata de un modelo "heretic" y "abliterated", es decir, se ha eliminado la alineación de seguridad mediante técnicas de de-censura (abliteration), lo que reduce drásticamente los rechazos: pasa de 94 rechazos por cada 100 peticiones en el modelo original a solo 4. Esto lo hace especialmente adecuado para escritura creativa sin restricciones, roleplay y generación de ficción, aunque implica riesgos importantes para uso en producción. El modelo también conserva las capacidades multimodales del base, habiendo sido probada la entrada de imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida densa: Gated DeltaNet (atención lineal) + Gated Attention, con FFN; 32 capas, hidden size 2560 |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativo, extensible hasta 1.010.000 |
| Tipos de cuantizacion | bfloat16 (nativo), sugeridas: q4_K_S (no imatrix), IQ3_S (imatrix), mxfp8 |
| Idiomas soportados | en, zh (declarados en la model card; el base Qwen3.5 soporta 201 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

Decka-4B hereda la arquitectura de Qwen3.5-4B, un modelo denso de 4.000 millones de parámetros con un layout de capas organizado como 8 bloques de `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`. La Gated DeltaNet emplea 32 cabezas de atención lineal para V y 16 para QK con dimensión de cabeza 128, mientras que la Gated Attention usa 16 cabezas Q y 4 KV con dimensión 256 y RoPE de 64 dimensiones. El FFN tiene dimensión intermedia de 9216 y el embedding de salida está atado al de entrada (248.320 tokens). El modelo incluye un predictor multi-token (MTP) entrenado con multi-steps.

El fine-tune se realizó con Unsloth sobre el modelo coder3101/Qwen3.5-4B-heretic, que ya había sido sometido a un proceso de "heretic'ing" (abliteration). Se utilizaron cinco datasets propios de la familia Deckard, con un entrenamiento calificado como "mild" para preservar las capacidades del base. El autor reporta que el entrenamiento mejora el razonamiento y la generación de salida, superando al modelo raíz en todos los benchmarks evaluados. No se especifican el número de tokens de entrenamiento ni la composición exacta de los datasets.

## Capacidades

- Generación de texto y razonamiento: mantiene las capacidades del Qwen3.5-4B base, con mejoras reportadas en razonamiento y calidad de salida.
- Escritura creativa y ficción: entrenado específicamente para generación de tramas, subtramas, escenas, narración vívida y storytelling en todos los géneros (ciencia ficción, romance, etc.).
- Roleplay: soporta conversaciones de rol multi-turno con contexto largo (256k tokens).
- Visión (imágenes): el modelo base incluye encoder de visión y el autor confirma que la entrada de imágenes funciona tras el fine-tune.
- Sin censura: modelo abliterated con tasa de rechazo de solo 4/100, frente a 94/100 del original.
- Conversación general: etiquetado como "all use cases" y "conversational".
- No se especifica soporte explícito de tool calling o function calling en la model card.

## Casos de uso

- Escritura creativa profesional: generación de novelas, relatos y guiones con tramas complejas y subtramas, aprovechando la ventana de 256k tokens para mantener coherencia en obras largas.
- Roleplay inmersivo: creación de personajes y mundos de ficción con respuestas vívidas y sin restricciones temáticas, ideal para juegos de rol por texto.
- Generación de escenas y continuación de historias: el modelo puede continuar una escena existente manteniendo el tono y estilo, útil para escritores que necesitan superar bloqueos creativos.
- Asistente de lluvia de ideas para ficción: generación de premisas, giros argumentales y desarrollo de personajes en múltiples géneros.
- Análisis de imágenes con descripción creativa: al conservar la capacidad de visión, puede describir imágenes de forma narrativa, útil para ilustradores o creadores de contenido.
- Prototipado de diálogos para videojuegos: generación de diálogos de personajes no jugadores (NPC) con personalidad y sin filtros, acelerando el desarrollo narrativo.

## Benchmarks y rendimiento

El autor proporciona resultados en modo instruct con cuantización mxfp8, comparados con el modelo base y su variante Thinking:

| Benchmark | Decka-4B (mxfp8) | Qwen3.5-4B-Instruct (mxfp8) | Qwen3.5-4B-Instruct Thinking (mxfp8) |
|---|---|---|---|
| ARC (arc) | 0,525 | 0,505 | 0,392 |
| ARC-easy (arc/e) | 0,726 | 0,688 | 0,441 |
| BoolQ | 0,877 | 0,892 | 0,627 |
| HellaSwag (hswag) | 0,679 | 0,652 | 0,601 |
| OpenBookQA (obkqa) | 0,416 | 0,420 | 0,360 |
| PIQA | 0,761 | 0,760 | 0,739 |
| Winogrande (wino) | 0,660 | 0,658 | 0,590 |

Decka-4B supera al modelo Instruct en la mayoría de métricas (ARC, ARC-e, HellaSwag, PIQA, Winogrande) y queda ligeramente por debajo en BoolQ y OpenBookQA. Frente a la variante Thinking, lo supera en todas las métricas. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: en bfloat16, los pesos ocupan aproximadamente 9,1 GB (tamaño del repo), por lo que se necesita al menos 12 GB de VRAM para inferencia sin cuantizar. Con cuantización q4_K_S (~2,5-3 GB) cabe en GPUs de 6-8 GB.
- GPU recomendadas: para bfloat16, una RTX 3090/4090 (24 GB) o A100 (40/80 GB) es adecuada. Para cuantización 4-bit, una RTX 3060 (12 GB) o superior es suficiente.
- Sí cabe en GPUs de consumo: con cuantización GGUF (q4_K_S o IQ3_S) puede ejecutarse en GPUs de 8 GB o menos.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang, KTransformers, llama.cpp y Ollama (mediante conversión GGUF).
- Latencia y throughput: no se han publicado datos específicos. Al ser un modelo denso de 4B, se espera un throughput moderado en hardware consumer; en A100 puede alcanzar cientos de tokens por segundo con vLLM.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Sin censura | Visión | Notas |
|---|---|---|---|---|---|---|
| Decka-4B | 4,54 B | 262k | Apache-2.0 | Sí (abliterated) | Sí | Fine-tune creativo sobre Qwen3.5-4B |
| Qwen3.5-4B-Instruct | 4 B | 262k | Apache-2.0 | No | Sí | Modelo base oficial con alineación |
| Qwen3.5-4B-Instruct Thinking | 4 B | 262k | Apache-2.0 | No | Sí | Variante con razonamiento explícito |
| coder3101/Qwen3.5-4B-heretic | 4 B | 262k | Apache-2.0 | Sí | Sí | Modelo intermedio abliterated, base de Decka |

Decka-4B se posiciona como una alternativa sin censura y orientada a creatividad frente a los modelos oficiales de Qwen, manteniendo el mismo tamaño y contexto. No se dispone de comparación con otros modelos de 4B como Llama-3.2-3B o Phi-3.5-mini en la información proporcionada.

## Limitaciones y advertencias

- Modelo sin censura: al ser abliterated, puede generar contenido explícito, ofensivo o inapropiado. No es adecuado para aplicaciones que requieran moderación de contenido.
- Riesgo de alucinación: como todo modelo de lenguaje, puede inventar hechos o detalles, especialmente en contextos largos.
- Idiomas limitados: la model card declara solo inglés y chino, aunque el base soporta 201 idiomas; el fine-tune puede haber degradado el rendimiento en otros idiomas.
- Video no probado: el autor indica que las capacidades de video del modelo base no fueron testeadas en este fine-tune.
- Sesgos potenciales: al entrenarse con datasets propios no documentados, pueden existir sesgos no conocidos en los datos de entrenamiento.
- Restricciones de uso comercial: la licencia Apache-2.0 permite uso comercial, pero la naturaleza sin censura puede generar responsabilidades legales si se despliega en entornos públicos.
- Rendimiento en benchmarks limitado: solo se han evaluado 7 métricas de razonamiento de sentido común; no hay datos sobre tareas de código, matemáticas o conocimiento general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrzenin/Decka-4B
- Modelo base (heretic): https://huggingface.co/coder3101/Qwen3.5-4B-heretic
- Modelo original Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Perfil del autor: https://huggingface.co/mrzenin
