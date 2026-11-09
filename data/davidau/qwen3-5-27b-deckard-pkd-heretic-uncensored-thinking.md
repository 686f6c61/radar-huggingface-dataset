# DavidAU/Qwen3.5-27B-Deckard-PKD-Heretic-Uncensored-Thinking

## Resumen

Qwen3.5-27B-Deckard-PKD-Heretic-Uncensored-Thinking es un fine-tune del modelo multimodal Qwen3.5-27B, desarrollado por DavidAU sobre el checkpoint intermedio `coder3101/Qwen3.5-27B-heretic`. El objetivo del autor es doble: por un lado, eliminar los mecanismos de rechazo del modelo original (proceso de "abliteration" o hereticado); por otro, inyectar un estilo narrativo inspirado en la obra de Philip K. Dick mediante cinco conjuntos de datos propios editados manualmente. El resultado es un modelo orientado a escritura creativa, ficción y roleplay sin restricciones de contenido.

Técnicamente hereda la arquitectura híbrida de Qwen3.5: 27.356 millones de parámetros, 64 capas con un patrón que combina Gated DeltaNet (atención lineal) y Gated Attention clásica, más un codificador visual para entrada image-text-to-text. El contexto nativo es de 262.144 tokens, extensible hasta 1.010.000. Los pesos se distribuyen en safetensors en bfloat16 (54,7 GB de repositorio) y la licencia declarada es Apache 2.0.

Su relevancia es acotada pero clara: cubre un nicho de escritura de ficción sin filtros sobre una base de 27B con ventana de contexto muy amplia y capacidad de visión, algo poco frecuente entre los modelos "uncensored" publicados. El autor reporta una tasa de rechazo de 14/100 frente a 94/100 del Qwen3.5-27B original, con una divergencia KL de 0,0653 respecto a la base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con Gated DeltaNet (atención lineal) y Gated Attention, más codificador visual; MTP entrenado con múltiples pasos |
| Parámetros totales | 27.356.728.560 (27B) |
| Parámetros activos | no disponible (el autor no declara configuración MoE para este checkpoint; la model card base menciona MoE en la familia Qwen3.5, pero no se confirma para este modelo) |
| Longitud de contexto | 262.144 tokens nativo; extensible hasta 1.010.000 |
| Tipos de cuantización | El autor recomienda mínimo q4_k_s (sin imatrix) o IQ3_S (con imatrix); no se listan otros formatos oficiales |
| Idiomas soportados | en, zh (según etiquetas del repo); la base Qwen3.5 declara 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16), compatible con transformers, vLLM, SGLang, KTransformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-27B, un transformer causal con codificador visual y una disposición de capas de 16 bloques compuestos por 3 subcapas (Gated DeltaNet seguida de FFN) y 1 subcapa de Gated Attention seguida de FFN. La dimensión oculta es 5120, el FFN intermedio 17408, y el vocabulario 248.320 tokens (con padding). La atención lineal usa 48 cabezas para V y 16 para QK con dimensión 128; la atención clásica usa 24 cabezas Q y 4 KV con dimensión 256 y RoPE de 64 dimensiones. Se entrena con Multi-Token Prediction (MTP).

El fine-tune se realizó con Unsloth sobre hardware local, con un script de entrenamiento propio y cinco datasets creados o editados manualmente por el autor para emular el estilo de Philip K. Dick. Según la model card, el entrenamiento es "más fuerte" que una iteración previa para arraigar el estilo, pero deliberadamente no hasta el punto de "secuestrar" por completo el comportamiento del modelo. El hereticado (eliminación de rechazos) se aplicó antes del fine-tune, de modo que el modelo final combina ambas modificaciones. No se detalla el número de tokens de entrenamiento ni la composición exacta de los datasets.

## Capacidades

- Generación de texto y escritura creativa de ficción: relatos, tramas, subtramas, continuación de escenas y prosodia vívida en todos los géneros (ciencia ficción, romance, etc.).
- Roleplay conversacional sin filtros de contenido.
- Entrada multimodal image-text-to-text: el autor indica que la visión funciona tras el nuevo entrenamiento; las porciones de vídeo no fueron probadas.
- Razonamiento y modo "thinking" (el nombre del checkpoint lo incluye); no se detalla el formato exacto del modo pensamiento en la información disponible.
- Capacidades multilingües heredadas de Qwen3.5 (201 idiomas en la base), aunque las etiquetas del repo solo declaran en y zh.
- Soporte de tool calling y function calling: no confirmado explícitamente para este fine-tune; la base Qwen3.5 lo soporta.
- Capacidades de agente y razonamiento multi-paso: heredadas de la base, no verificadas en este checkpoint.
- Contexto largo de 262.144 tokens para documentos extensos o narrativas prolongadas.

## Casos de uso

- Escritura de ficción larga: el modelo puede mantener coherencia narrativa a lo largo de decenas de miles de tokens gracias a su ventana de 262.144, útil para novelas por entregas o sagas con continuidad de personajes y tramas.
- Generación de tramas y subtramas: adecuado para autores que necesitan lluvias de ideas estructuradas con estilo literario concreto (influencia PKD), sin rechazos por temática oscura o especulativa.
- Roleplay y narrativa interactiva: su entrenamiento orientado a conversación y su ausencia de filtros lo hacen apto para motores de juegos de rol textuales o simulaciones narrativas.
- Continuación de escenas: para guionistas o escritores que pegan un fragmento y piden continuaciones coherentes con el tono y los personajes.
- Análisis y descripción de imágenes con sesgo creativo: al conservar la torre visual, puede generar descripciones literarias de imágenes o inspirar escenas a partir de una ilustración.
- Prototipado de asistentes creativos sin censura: para investigación sobre alineación, stylometry o generación creativa, donde interesa comparar comportamiento con y sin rechazos.
- Traducción creativa en y zh: para localización literaria entre inglés y chino con registro estilizado.

## Benchmarks y rendimiento

Datos publicados por el autor (formato de la model card, sin normalizar):

| Benchmark | Este modelo | Qwen3.5-27B-Text-VL qx86-hi |
|---|---|---|
| ARC | 0,460 | 0,443 |
| ARC/e | 0,498 | 0,498 |
| BoolQ | 0,885 | 0,857 |
| HellaSwag | 0,739 | 0,701 |
| OpenBookQA | 0,384 | 0,372 |
| PIQA | 0,781 | 0,770 |
| Winogrande | 0,740 | 0,752 |

Alineación de seguridad (de-censoring):

| Métrica | Este modelo | Qwen/Qwen3.5-27B |
|---|---|---|
| Divergencia KL | 0,0653 | 0 (por definición) |
| Rechazos | 14/100 | 94/100 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 55 GB solo para pesos, más overhead de activaciones y caché KV; requiere GPU de 80 GB (A100, H100) para inferencia cómoda a contexto completo.
- Cuantización q4_k_s o IQ3_S (recomendadas por el autor): permite ejecución en GPUs de 24 GB (RTX 3090/4090) con contexto reducido; a 262k de contexto la caché KV crece de forma significativa y puede exceder la VRAM.
- GPUs recomendadas: H100 80 GB o A100 80 GB para bf16 y contexto largo; RTX 4090/3090 para cuantizaciones q4/IQ3 con contexto moderado.
- Cabe en GPU consumer: sí, en cuantización q4 o inferior y con contexto recortado.
- Opciones de despliegue: transformers, vLLM, SGLang, KTransformers; llama.cpp/Ollama para GGUF (aunque el autor no publica GGUF oficial, la recomendación de q4_k_s/IQ3_S sugiere conversión propia).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Deckard PKD Heretic) | 27B | 262.144 (ext. 1.010.000) | Apache 2.0 | Ficción sin censura, multimodal | Hugging Face |
| coder3101/Qwen3.5-27B-heretic | 27B | 262.144 | no disponible | Base hereticada sin fine-tune estilístico | Hugging Face |
| Qwen/Qwen3.5-27B | 27B | 262.144 (ext. 1.010.000) | Apache 2.0 | Modelo general alineado, multimodal | Hugging Face, Qwen Chat |
| Qwen3.5-27B-Text-VL qx86-hi | 27B | no disponible | no disponible | Variante cuantizada de referencia del autor | no disponible |

El modelo se diferencia de la base por el estilo PKD y la eliminación de rechazos (14/100 frente a 94/100), con una degradación KL moderada (0,0653). Frente al checkpoint hereticado intermedio, añade el fine-tune creativo y el modo thinking declarado en el nombre. No se dispone de comparación con otros fine-tunes "uncensored" de la misma familia en la información proporcionada.

## Limitaciones y advertencias

- Contenido sin filtros: el modelo ha sido deliberadamente abliterado; puede generar contenido sensible, ofensivo o inapropiado. No es apto para aplicaciones orientadas al público general sin capas de moderación externas.
- Riesgo de alucinación: inherente a los modelos de 27B y agravado por el sesgo estilístico hacia la ficción; no debe usarse como fuente factual sin verificación.
- Sesgos: no se documentan evaluaciones de sesgo; el fine-tune sobre datasets propios puede introducir sesgos de estilo y temáticos no cuantificados.
- Idiomas: las etiquetas del repo solo declaran en y zh, aunque la base soporte 201 idiomas; el rendimiento real en otros idiomas no está verificado.
- Visión: el autor confirma que funciona tras el entrenamiento, pero las porciones de vídeo no fueron probadas.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado sin filtros puede acarrear responsabilidad legal según la jurisdicción; conviene revisar políticas de uso aceptable.
- Reproducibilidad: el entrenamiento se hizo con script propio y hardware local; no se detallan hiperparámetros ni composición exacta de datasets.
- Contexto: aunque nativo de 262.144 tokens, el coste de caché KV a esa longitud es elevado y puede requerir hardware de 80 GB o cuantización agresiva.
- Advertencia de producción: no se han publicado evaluaciones de robustez, seguridad ni latencia; validar antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Qwen3.5-27B-Deckard-PKD-Heretic-Uncensored-Thinking
- Modelo base intermedio: https://huggingface.co/coder3101/Qwen3.5-27B-heretic
- Modelo original Qwen3.5-27B: https://huggingface.co/Qwen/Qwen3.5-27B
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- FAQs del autor: https://huggingface.co/DavidAU/support
