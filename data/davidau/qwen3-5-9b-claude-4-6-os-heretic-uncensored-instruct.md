# DavidAU/Qwen3.5-9B-Claude-4.6-OS-HERETIC-UNCENSORED-INSTRUCT

## Resumen

Qwen3.5-9B-Claude-4.6-OS-HERETIC-UNCENSORED-INSTRUCT es un ajuste fino (fine-tune) del modelo denso Qwen3.5-9B, desarrollado por DavidAU mediante Unsloth sobre hardware local. El modelo parte de la variante trohrbaugh/Qwen3.5-9B-heretic-v2, a la que se aplica un entrenamiento adicional con un dataset compuesto por cuatro conjuntos de datos derivados de Claude (Claude-4.6-OS). El objetivo declarado es reforzar el comportamiento conversacional y la escritura creativa manteniendo los benchmarks del modelo base, y eliminar los rechazos mediante un proceso de "abliteration" (de-censoring) que el autor denomina HERETIC.

La arquitectura subyacente es la de Qwen3.5, un modelo causal con codificador de visión que combina Gated DeltaNet (atención lineal) con atención con compuertas en un esquema híbrido por capas, y que cuenta con 9.409.813.744 parámetros totales según los pesos en safetensors. El contexto nativo es de 262.144 tokens, extensible hasta 1.010.000, lo que lo sitúa en la gama alta de ventanas de contexto para un modelo de ~9B.

Su relevancia actual reside en dos factores: por un lado, es un modelo multimodal (image-text-to-text) de tamano medio con contexto muy largo; por otro, su orientación explícita a la escritura de ficción, el roleplaying y el uso sin restricciones de contenido. La licencia Apache 2.0 facilita su adopción comercial, aunque el proceso de abliteration y la naturaleza del ajuste introducen caveats importantes que se detallan más abajo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con codificador de visión; Gated DeltaNet (atención lineal) + Gated Attention por bloques |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (modelo denso, no MoE en esta variante) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantizacion | bfloat16 en el repo; el autor recomienda q4ks (sin imatrix) o IQ3S (con imatrix) como mínimo |
| Idiomas soportados | en, zh (etiquetados en el repo); el modelo base Qwen3.5 declara cobertura de 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

Otros datos de arquitectura del modelo base: dimensión oculta 4096, 32 capas, layout 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), embedding de tokens de 248.320 (con padding), FFN de dimensión intermedia 12.288, 32 cabezas de atención lineal (V) y 16 (QK) con dimensión 128, 16 cabezas de atención con compuertas para Q y 4 para KV con dimensión 256, RoPE de dimensión 64 y entrenamiento con MTP (multi-token prediction) multi-step.

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5, que sustituye parcialmente la atención cuadrática por Gated DeltaNet, un mecanismo de atención lineal con estado recurrente compuerta. El bloque se repite en un patrón de tres capas de DeltaNet seguidas de una capa de atención con compuertas, lo que reduce el coste computacional en contextos largos manteniendo la capacidad de recuperación exacta en las capas de atención completa. El codificador de visión se entrena con fusión temprana de tokens multimodales, de modo que el modelo procesa imagen y texto en un único flujo. El modelo base se entrenó con pre-entrenamiento y post-entrenamiento, incluyendo RL a gran escala sobre entornos multiagente.

El ajuste fino de DavidAU se realizó con Unsloth sobre el checkpoint heretic-v2, usando un dataset agregado de cuatro conjuntos derivados de Claude (Claude-4.6-OS). Según el autor, el entrenamiento se mantuvo "suave" para no degradar los benchmarks del modelo base. El proceso HERETIC consiste en una abliteration aplicada antes del ajuste, orientada a eliminar las respuestas de rechazo. La model card reporta una divergencia KL de 0,0793 respecto al modelo original y una tasa de rechazos de 6/100 frente a 100/100 del Qwen3.5-9B original. La plantilla Jinja se ha modificado para forzar un modo "instruct only". No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicó DPO o RLHF en esta fase.

## Capacidades

- Generación de texto y conversación multi-turno en modo instruct.
- Escritura creativa y de ficción: el modelo está etiquetado y entrenado específicamente para relatos, tramas, subtramas, continuación de escenas, ciencia ficción, romance y todos los géneros.
- Roleplaying y diálogo de personajes.
- Procesamiento de imagen y texto (pipeline image-text-to-text); el autor indica que la visión funciona tras el nuevo entrenamiento, aunque las porciones de vídeo no se probaron.
- Razonamiento y matemáticas heredados del modelo base Qwen3.5.
- Generación de código y uso en agentes, según las capacidades declaradas del modelo base.
- Soporte multilingüe: etiquetado en inglés y chino en este repo; el modelo base declara 201 idiomas y dialectos.
- Comportamiento sin rechazos (uncensored/abliterated): responde a peticiones que el modelo original rechazaría.
- No se documenta en la información disponible soporte explícito de tool calling o function calling para esta variante concreta.

## Casos de uso

- Escritura de ficción por capítulos: el modelo puede mantener coherencia de personajes y trama a lo largo de decenas de miles de tokens gracias al contexto de 262.144 tokens, lo que permite introducir la biblia del libro completa y continuar la narración sin perder referencias.
- Generación de tramas y subtramas: útil en fases de ideación, donde se le puede pedir un esquema de novela con arcos argumentales, giros y resolución, y luego desarrollar cada escena de forma iterativa.
- Roleplaying y narrativa interactiva: adecuado para motores de aventuras conversacionales o videojuegos narrativos donde se requiere un personaje con voz consistente y sin rechazos por contenido adulto o violento, siempre que el despliegue cumpla la legalidad aplicable.
- Continuación de escenas y reescritura de estilo: con contexto largo se puede pasar un manuscrito parcial y pedir una continuación con un registro concreto (por ejemplo, prosa vívida o diálogo rápido), o reescribir pasajes manteniendo la voz del autor.
- Asistencia a guionistas y equipos editoriales: borradores de diálogos, sinopsis y tratamientos para series, con la ventaja de que el modelo no bloquea temáticas oscuras o controvertidas que sí rechazaría un modelo alineado por defecto.
- Análisis de imágenes con descripción narrativa: al ser multimodal, puede recibir una ilustración o fotograma y generar una descripción atmosférica o un pasaje que la integre en una escena, útil para documentación de arte conceptual o novelas ilustradas.
- Prototipado de personajes para chatbots de entretenimiento: combinación de contexto largo (memoria de conversación extensa) y ausencia de rechazos para personajes con personalidades difíciles.

## Benchmarks y rendimiento

Datos publicados en la model card, en cuantización mxfp8:

| Modelo | arc | arc/e | boolq | hswag | obkqa | piqa | wino |
|---|---|---|---|---|---|---|---|
| HERETIC (este modelo) | 0,624 | 0,820 | 0,886 | 0,663 | 0,442 | 0,763 | 0,681 |
| Qwen3.5-9B | 0,417 | 0,458 | 0,623 | 0,634 | 0,338 | 0,737 | 0,639 |
| Qwen3.5-9B-Instruct | 0,571 | 0,719 | 0,895 | 0,683 | 0,426 | 0,770 | 0,671 |

Métricas de de-censoring:

| Métrica | Este modelo | Qwen/Qwen3.5-9B |
|---|---|---|
| Divergencia KL | 0,0793 | 0 (por definición) |
| Rechazos | 6/100 | 100/100 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks multimodales para esta variante concreta. Los datos de la model card corresponden a evaluaciones del autor y deben interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 18,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda 24 GB o más para contexto moderado.
- VRAM en cuantización q4ks: en torno a 5-6 GB para pesos, lo que permite ejecución en GPUs de consumo con 8-12 GB para contextos cortos.
- VRAM en IQ3S: ligeramente por debajo de q4ks, adecuada para GPUs de 8 GB con contexto reducido.
- GPUs recomendadas: A100 40/80 GB, H100 para contexto completo de 256k y despliegue multiusuario; RTX 4090 (24 GB) para bf16 con contexto moderado o cuantizado con contexto largo; RTX 3090, 4080 y 4070 Ti para cuantizaciones de 4 bits.
- Cabe en GPU de consumo: sí, en cuantización q4ks o IQ3S en GPUs de 8 GB o más; en bf16 requiere al menos 24 GB.
- Opciones de despliegue: transformers, vLLM, SGLang y KTransformers según la model card del modelo base; llama.cpp y Ollama para formatos GGUF derivados de la cuantización, aunque el repo solo distribuye safetensors.
- Latencia y throughput: no disponibles en la información proporcionada. La arquitectura híbrida con DeltaNet está diseñada para reducir latencia en contextos largos, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Orientación | Multimodal |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-9B HERETIC) | 9,4B denso | 262k (hasta 1M) | Apache 2.0 | Ficción, roleplay, sin censura | Sí (imagen) |
| Qwen3.5-9B-Instruct | 9B denso | 262k (hasta 1M) | Apache 2.0 | Uso general alineado | Sí (imagen) |
| Qwen3.5-9B (base) | 9B denso | 262k (hasta 1M) | Apache 2.0 | Base sin post-entrenamiento | Sí (imagen) |
| trohrbaugh/Qwen3.5-9B-heretic-v2 | 9B denso | 262k (hasta 1M) | Apache 2.0 | Sin censura, sin ajuste a ficción | Sí (imagen) |

En benchmarks de conocimiento general, este modelo supera al Qwen3.5-9B base en todas las tareas reportadas y se sitúa cerca del Instruct, con ventaja en arc, arc/e y obkqa y ligera desventaja en boolq, hswag, piqa y wino. La diferencia principal frente a los alternativas no es de rendimiento bruto sino de comportamiento: ausencia de rechazos y especialización en escritura creativa. No se dispone de comparaciones con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- El proceso de abliteration elimina los rechazos de forma deliberada; el modelo puede generar contenido violento, sexual, ilegal o dañino sin filtros. El despliegue exige moderación externa y cumplimiento normativo (por ejemplo, DSA en la UE o normativa de protección de menores).
- La divergencia KL de 0,0793 indica una desviación medible respecto al modelo original; puede haber degradación en tareas fuera del dominio de ficción y conversación.
- Riesgo de alucinación inherente a los modelos de ~9B, agravado por el ajuste hacia prosa creativa, donde la verosimilitud prima sobre la exactitud factual. No recomendado para tareas de recuperación de hechos sin verificación.
- El etiquetado de idiomas del repo solo declara inglés y chino; el rendimiento en castellano no está verificado, aunque el modelo base declara cobertura amplia.
- La visión funciona según el autor, pero las porciones de vídeo no se probaron; el soporte multimodal no está validado de forma independiente.
- El contexto de 256k es el valor por defecto; la extensión hasta 1M requiere técnicas de escalado de RoPE y no se garantiza su calidad.
- El autor recomienda repetición de penalización 1 (desactivada), lo que sugiere que valores altos pueden degradar la salida.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo abliterated puede chocar con las políticas de las plataformas de despliegue y con las obligaciones de moderación de contenido.
- Los benchmarks publicados son del autor, en mxfp8 y sin protocolo detallado; no han sido replicados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Qwen3.5-9B-Claude-4.6-OS-HERETIC-UNCENSORED-INSTRUCT
- Modelo base del ajuste: https://huggingface.co/trohrbaugh/Qwen3.5-9B-heretic-v2
- Modelo original Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
