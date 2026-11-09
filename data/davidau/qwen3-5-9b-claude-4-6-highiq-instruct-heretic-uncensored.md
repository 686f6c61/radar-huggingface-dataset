# DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT-HERETIC-UNCENSORED

## Resumen

Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT-HERETIC-UNCENSORED es un ajuste fino (fine-tune) del modelo denso Qwen3.5-9B, desarrollado por el usuario DavidAU de Hugging Face. El modelo parte de trohrbaugh/Qwen3.5-9B-heretic-v2, una variante ya "abliterated" (con los mecanismos de rechazo suprimidos), y se entrena mediante Unsloth sobre un conjunto de destilación generado con Claude 4.6. El resultado es un modelo de 9.409.813.744 parámetros orientado a escritura creativa, ficción, roleplaying y generación de tramas, con la censura eliminada de forma explícita.

La relevancia de esta ficha radica en que combina tres tendencias actuales: la arquitectura híbrida de Qwen3.5 (Gated DeltaNet más atención con compuertas), el fenómeno de los modelos "heretic" o "abliterated" que eliminan las negativas a responder, y la destilación de modelos grandes (Claude 4.6) sobre modelos abiertos de 9B. El autor reporta una divergencia KL de 0.0793 respecto al modelo original y una reducción de rechazos de 100/100 a 6/100 en su suite de evaluación.

El contexto nativo es de 262.144 tokens, extensible hasta 1.010.000 según la documentación de Qwen, y el modelo es multimodal (image-text-to-text) gracias al codificador visual heredado de la familia Qwen3.5. La licencia es Apache 2.0 y los pesos se distribuyen en safetensors y bfloat16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido: Gated DeltaNet (atención lineal) + Gated Attention, con codificador visual |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativo; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | bfloat16 en el repo; el autor recomienda mínimo q4ks (sin imatrix) o IQ3S (con imatrix) |
| Idiomas soportados | en, zh (etiquetados en la model card); la familia Qwen3.5 declara 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-9B: 32 capas con un diseño híbrido de 8 bloques de la forma 3 × (Gated DeltaNet → FFN) + 1 × (Gated Attention → FFN). La dimensión oculta es 4096, la dimensión intermedia del FFN es 12288 y el vocabulario tiene 248.320 tokens (con padding). Gated DeltaNet emplea 32 cabezas de atención lineal para V y 16 para QK con dimensión de cabeza 128; Gated Attention usa 16 cabezas para Q y 4 para KV con dimensión de cabeza 256 y RoPE de 64 dimensiones. El modelo incluye entrenamiento con multi-token prediction (MTP) y un codificador visual para entrada de imágenes.

El ajuste fino se realizó con Unsloth sobre hardware local, partiendo de Qwen3.5-9B-heretic-v2 y usando un dataset de destilación de Claude 4.6. Según el autor, el entrenamiento fue "suave" para no degradar los benchmarks originales, y se aplicó una plantilla Jinja modificada que fuerza el modo "instruct only". No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO en esta fase.

## Capacidades

- Generación de texto y escritura creativa: ficción, narrativa, prosa vívida, generación de tramas y subtramas, continuación de escenas y diálogos.
- Roleplaying y conversación multi-turno con contexto largo.
- Razonamiento y respuesta a instrucciones en modo instruct (plantilla Jinja modificada).
- Comprensión de imágenes (image-text-to-text); el autor indica que la visión fue probada y funciona con el nuevo entrenamiento, aunque las porciones de vídeo no se probaron.
- Capacidades multilingües heredadas de Qwen3.5 (la model card etiqueta en y zh; la familia declara 201 idiomas).
- Modo sin censura: el autor reporta 6/100 rechazos frente a 100/100 del modelo original en su suite.
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni razonamiento agéntico multi-paso para este fine-tune concreto.

## Casos de uso

- Escritura de ficción y narrativa larga: el modelo puede generar capítulos completos y mantener coherencia de personajes y tramas gracias a su ventana de 262.144 tokens, adecuada para novelas por entregas o sagas con mucho material previo.
- Roleplaying y juegos de rol por texto: la ausencia de rechazos y el entrenamiento en prosa vívida permiten interpretar personajes con libertad creativa, incluyendo escenas adultas o violentas que otros modelos rechazarían.
- Generación de tramas y subtramas para guiones o videojuegos: útil para equipos de narrativa que necesitan lluvias de ideas rápidas y variadas sobre un mismo universo.
- Continuación de escenas con contexto largo: se puede cargar un manuscrito extenso (hasta cientos de miles de tokens) y pedir continuaciones estilísticamente consistentes sin perder referencias anteriores.
- Análisis de imágenes con descripción narrativa: al ser multimodal, puede recibir una ilustración o fotografía y generar descripciones, diálogos o escenas inspiradas en ella.
- Asistente de escritura sin filtros para autores profesionales: permite explorar temas sensibles (violencia, erotismo, terror) sin las negativas sistemáticas de los modelos alineados, lo que agiliza la iteración creativa.
- Prototipado de chatbots de personaje: su licencia Apache 2.0 y su tamaño de 9B permiten desplegarlo en entornos controlados para experiencias conversacionales de ficción.

## Benchmarks y rendimiento

Resultados reportados por el autor (precisión mxfp8) en su propia suite:

| Modelo | arc | arc/e | boolq | hswag | obkqa | piqa | wino |
|---|---|---|---|---|---|---|---|
| Este modelo (HERETIC) | 0.574 | 0.755 | 0.869 | 0.714 | 0.410 | 0.780 | 0.691 |
| Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT | 0.574 | 0.729 | 0.882 | 0.711 | 0.422 | 0.775 | 0.691 |
| Qwen3.5-9B (base) | 0.417 | 0.458 | 0.623 | 0.634 | 0.338 | 0.737 | 0.639 |

Métricas de descensuración reportadas por el autor:

| Métrica | Este modelo | Qwen/Qwen3.5-9B |
|---|---|---|
| Divergencia KL | 0.0793 | 0 (por definición) |
| Rechazos | 6/100 | 100/100 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks estándar de la familia Qwen3.5 para este fine-tune concreto.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 18,8 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 24 GB para inferencia cómoda.
- VRAM estimada en q4ks: en torno a 5-6 GB de pesos, viable en GPU de 8 GB con contexto moderado.
- VRAM estimada en IQ3S (imatrix): alrededor de 4-5 GB de pesos.
- GPU recomendadas: A100 40/80 GB o H100 para contexto completo de 262k tokens y despliegue en producción; RTX 4090 (24 GB) para bfloat16 con contexto reducido; RTX 3090, 4080 o 4070 Ti para cuantizaciones de 4 bits.
- Cabe en GPU de consumo: sí, en cuantización q4ks o IQ3S en tarjetas de 8 GB o más; en bfloat16 requiere 24 GB o más.
- Opciones de despliegue: transformers, vLLM, SGLang y KTransformers según la documentación de Qwen3.5; llama.cpp u Ollama requerirían conversión a GGUF, no incluida en el repo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (DavidAU) | 9,4B | 262.144 (ext. 1.010.000) | Apache 2.0 | Fine-tune creativo sin censura sobre Qwen3.5-9B heretic | Hugging Face, safetensors |
| Qwen3.5-9B (Qwen) | 9B | 262.144 (ext. 1.010.000) | Apache 2.0 | Modelo base multimodal alineado | Hugging Face, transformers/vLLM/SGLang |
| trohrbaugh/Qwen3.5-9B-heretic-v2 | 9B | No disponible | No disponible | Variante abliterated del Qwen3.5-9B | Hugging Face |
| Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT | 9B | No disponible | No disponible | Fine-tune instruct con destilación de Claude 4.6, sin descensuración | Hugging Face |

## Limitaciones y advertencias

- Modelo explícitamente descensurado: no aplica filtros de seguridad, por lo que puede generar contenido violento, sexual, ilegal o dañino sin restricción. No apto para despliegues públicos sin moderación externa.
- Riesgo de alucinación inherente a los modelos de 9B, agravado por el ajuste fino sobre datos sintéticos de destilación.
- Los benchmarks reportados son de una suite propia del autor (arc, boolq, hswag, obkqa, piqa, wino) y no cubren razonamiento complejo, código ni matemáticas; no deben compararse directamente con MMLU o HumanEval.
- La evaluación de visión fue manual y las capacidades de vídeo no se probaron.
- El autor advierte que otras versiones están en pruebas; la model card puede cambiar.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo sin censura conlleva riesgos legales y reputacionales según la jurisdicción y el contexto de despliegue.
- El modelo solo etiqueta en y zh en su model card, aunque hereda el soporte multilingüe de Qwen3.5; el rendimiento real en otros idiomas no está verificado para este fine-tune.
- La plantilla Jinja modificada fuerza modo instruct; usos que dependan del modo "thinking" original de Qwen3.5 pueden no funcionar igual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT-HERETIC-UNCENSORED
- Perfil del autor: https://huggingface.co/DavidAU
- Modelo base del fine-tune: https://huggingface.co/trohrbaugh/Qwen3.5-9B-heretic-v2
- Modelo original Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
