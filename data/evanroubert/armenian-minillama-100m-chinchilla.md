# Evanroubert/Armenian-MiniLlama-100M-Chinchilla

## Resumen

Armenian-MiniLlama-100M-Chinchilla es el primer modelo fundacional de lenguaje dedicado exclusivamente al armenio, desarrollado por Evanroubert y entrenado desde cero (*ab initio*) sobre un corpus multidisciplinar armenio de aproximadamente 2,56 mil millones de tokens. El modelo sigue la arquitectura Llama con Grouped-Query Attention (GQA), SwiGLU y RoPE, y se ha ajustado a la ley de Chinchilla para ser óptimo en cómputo con 100,7 millones de parámetros y 2,1 mil millones de tokens de entrenamiento. Su principal aportación es cubrir un idioma de bajos recursos con una licencia permisiva MIT, lo que lo hace accesible para investigación y aplicaciones comerciales.

El modelo fue entrenado en una AMD Instinct MI300X con precisión bfloat16 y FlashAttention, alcanzando una perplejidad de validación final de 12,57. Su tokenizer personalizado Byte-Level BPE incluye el alfabeto armenio completo, caracteres arcaicos y signos de puntuación propios del armenio, lo que garantiza una representación fiel del idioma. Con una ventana de contexto de solo 512 tokens, está pensado para tareas de generación de texto a corto plazo, no para contextos largos.

Aunque no se han publicado benchmarks estándar (MMLU, HumanEval, etc.), el autor reporta una diversidad Distinct-3 de 0,991, indicando baja repetición y buena coherencia morfosintáctica en armenio. Es un modelo pequeño, ligero y fácil de desplegar, orientado a la comunidad armenia y a investigadores interesados en modelos de bajos recursos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (Transformer decoder) con GQA, SwiGLU, RoPE |
| Parametros totales | 100.682.496 (~100,7 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Armenio (hy) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 0,4 GB, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Llama con 12 cabezas de consulta y 4 cabezas de clave/valor en atención agrupada (GQA), lo que reduce el coste de memoria en inferencia. La capa feed-forward usa SwiGLU con dimensión oculta de 2048, y la codificación posicional se realiza mediante embeddings rotatorios (RoPE) con theta de 10000. El tokenizer es un Byte-Level BPE con vocabulario de 16.384 tokens, que cubre el alfabeto armenio completo (Ա-Ֆ), caracteres arcaicos, puntuación armenia (։, ՝, ՜, ՞) y acrónimos latinos.

El entrenamiento se realizó con 2.097.152.000 tokens (aproximadamente 2,10 mil millones), un tamaño de lote de 256 (131.072 tokens por paso) y 16.000 pasos. La tasa de aprendizaje siguió un decaimiento coseno desde 5×10⁻⁴ hasta 5×10⁻⁵. Se utilizó una AMD Instinct MI300X con 192 GB de HBM3 y precisión bfloat16 con SDPA FlashAttention. La pérdida de entropía cruzada final fue de 2,5312 y la perplejidad de validación de 12,57. El autor indica que el entrenamiento es óptimo según la ley de Chinchilla, aunque el corpus total mencionado en el título es de 2,56 mil millones de tokens, de los cuales se usaron 2,1 para el entrenamiento.

## Capacidades

- Generación de texto en armenio: produce texto coherente y gramaticalmente correcto en armenio moderno, con declinaciones y concordancia verbal adecuadas.
- Baja repetición: el valor Distinct-3 de 0,991 indica que el modelo evita el "stutter" o repetición de n-gramas, generando texto diverso.
- Manejo de puntuación armenia: incluye los signos propios del armenio (։, ՝, ՜, ՞) en su tokenizer, lo que permite una generación fiel a la ortografía.
- Soporte de caracteres arcaicos: el tokenizer incluye letras armenias arcaicas, lo que permite procesar textos históricos o litúrgicos.
- Modelo causal de lenguaje: adecuado para completado de texto, generación autoregresiva y tareas de modelado de lenguaje.
- No se reportan capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Generación de contenido en armenio para blogs, redes sociales o noticias: el modelo puede redactar párrafos cortos coherentes en armenio, útil para automatizar la creación de contenido en este idioma de bajos recursos.
- Asistente de escritura para hablantes de armenio: dado su contexto de 512 tokens, puede sugerir continuaciones de frases o corregir la estructura gramatical en tiempo real.
- Procesamiento de textos históricos o litúrgicos: gracias a la inclusión de caracteres arcaicos, puede ayudar a transcribir o completar manuscritos armenios antiguos.
- Aumento de datos para otros modelos NLP en armenio: al ser un modelo generativo, puede usarse para sintetizar datos de entrenamiento adicionales para tareas downstream como clasificación o NER.
- Educación y aprendizaje del idioma: puede generar ejercicios de rellenar huecos o completar textos para estudiantes de armenio.
- Investigación en modelos de bajos recursos: sirve como punto de partida para estudiar el comportamiento de modelos pequeños en idiomas infrarrepresentados, comparando con arquitecturas similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El único dato reportado es la perplejidad de validación final de 12,57 y la diversidad Distinct-3 de 0,991, que no son comparables con los benchmarks habituales de la industria.

## Requisitos de hardware

- VRAM estimada para inferencia: con 100,7 M de parámetros en bfloat16, el peso ocupa aproximadamente 200 MB. Con overhead de activaciones y KV cache, se estima un consumo inferior a 1 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente (por ejemplo, NVIDIA GTX 1650, RTX 2060, etc.). También puede ejecutarse en CPU con razonable velocidad.
- Cabe en GPU consumer: sí, incluso en las más modestas.
- Opciones de despliegue: al ser un modelo PyTorch estándar, puede servirse con vLLM, TGI, o mediante llama.cpp si se convierte a GGUF. También es compatible con Hugging Face Transformers.
- Latencia y throughput: no se han publicado datos oficiales. Dado su tamaño, se espera una latencia de decodificación de pocos milisegundos por token en GPU moderna.

## Comparativa con modelos similares

No se dispone de modelos comparables específicos para armenio de tamaño similar. Como referencia general, se puede comparar con otros modelos pequeños multilingües:

| Modelo | Parametros | Contexto | Idiomas | Licencia |
|---|---|---|---|---|
| Armenian-MiniLlama-100M | 100,7 M | 512 | Armenio | MIT |
| GPT-Neo 125M (EleutherAI) | 125 M | 2048 | Multilingue (principalmente inglés) | MIT |
| TinyLlama 1.1B | 1,1 B | 2048 | Multilingue (inglés, chino, etc.) | Apache 2.0 |

La comparación directa no es posible porque los otros modelos no están especializados en armenio y tienen contextos más largos. Armenian-MiniLlama es único en su enfoque monolingüe armenio.

## Limitaciones y advertencias

- Contexto muy limitado: 512 tokens, insuficiente para tareas que requieran razonamiento de largo alcance o documentos extensos.
- Tamaño reducido: 100 M de parámetros limita la capacidad de razonamiento complejo y el conocimiento enciclopédico en comparación con modelos más grandes.
- Solo armenio: no soporta otros idiomas, lo que restringe su uso a aplicaciones monolingües.
- Sin benchmarks estándar: no hay evidencia de rendimiento en tareas como MMLU o HumanEval, por lo que su calidad en tareas específicas es desconocida.
- Posibles sesgos del corpus: al ser entrenado con un corpus específico, puede reflejar sesgos culturales o temáticos de las fuentes utilizadas.
- Riesgo de alucinación: como todo modelo generativo, puede producir contenido falso o inventado, especialmente en temas de los que no tiene suficiente información.
- Sin soporte de tool calling ni agentes: no es adecuado para integraciones complejas que requieran llamadas a funciones externas.
- Fecha de creación futura: el modelo fue subido en agosto de 2026, lo que puede indicar que es un proyecto experimental o de demostración.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Evanroubert/Armenian-MiniLlama-100M-Chinchilla)
- [Repositorio miniLLAMA (referencia de arquitectura)](https://github.com/akanyaani/miniLLAMA)
- [Otro miniLLAMA en Hugging Face](https://huggingface.co/Havmand/minillama)
- [Implementación miniLlama en GitHub](https://github.com/Gamgrant/miniLlama)
