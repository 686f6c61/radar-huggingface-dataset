# alphaedge-ai/gemma-3-4b-it-kir-16384

## Resumen

`alphaedge-ai/gemma-3-4b-it-kir-16384` es una variante "trimmed" (podada) del modelo multimodal `google/gemma-3-4b-it` de Google, especializada en el idioma kirguís (ky). El autor, alphaedge-ai, ha aplicado la técnica de reducción de vocabulario descrita por Loïck Bourdois y colaboradores en Hugging Face para recortar el vocabulario original de 262.144 tokens hasta 16.384, eliminando los tokens poco frecuentes en kirguís. El resultado es un modelo un 14,63% más pequeño en parámetros (de 4.300.079.472 a 3.670.770.032) y con una huella de memoria notablemente inferior, manteniendo la arquitectura y los pesos del modelo base.

El modelo conserva la naturaleza instruction-tuned y multimodal (image-text-to-text) del Gemma 3 original, aunque la poda del vocabulario lo hace inadecuado para otros idiomas distintos del kirguís. Es relevante para despliegues en entornos con recursos limitados que necesiten inferencia en kirguís, ya que reduce el tamaño del embedding y de la cabeza de salida sin reentrenar el resto de la red.

La ficha se basa exclusivamente en la información publicada en Hugging Face y en la model card del autor; los datos no disponibles se indican explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (imagen-texto), derivada de Gemma 3 |
| Parametros totales | 3.670.770.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Gemma 3 soporta contexto largo, pero el autor no lo especifica para esta variante) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | kirguís (ky) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors |
| Vocabulario | 16.384 tokens (frente a 262.144 del original, -93,75%) |
| Tamano del repo | 7,3 GB |
| Modelo base | google/gemma-3-4b-it |
| Dataset de minado | lbourdois/fineweb-2-trimming (200.000 textos) |

## Arquitectura y entrenamiento

El modelo es una poda de vocabulario del Gemma 3 4B instruction-tuned. No se ha reentrenado la red: se han eliminado del vocabulario los tokens que no aparecen (o aparecen con muy baja frecuencia) en un corpus de 200.000 textos en kirguís extraídos del dataset `lbourdois/fineweb-2-trimming`. Esto reduce el tamaño de la matriz de embeddings y de la capa de salida (lm_head), que en modelos con vocabularios grandes suponen una fracción significativa de los parámetros totales. La reducción resultante es de 629.309.440 parámetros (14,63%).

La arquitectura subyacente es la de Gemma 3: un transformer decoder-only con atención multi-cabeza, capacidades multimodales (entrada de imagen y texto) y modo conversacional con plantilla de chat. El autor no documenta detalles adicionales sobre el proceso de poda (criterio exacto de selección de tokens, posible fine-tuning posterior, ni evaluación de la degradación). Tampoco se indica si se preservaron los tokens especiales del chat template ni cómo se remapearon los índices del vocabulario original al nuevo.

## Capacidades

- Generación de texto conversacional en kirguís, con plantilla de chat (`apply_chat_template`).
- Razonamiento y generación de código y matemáticas heredados del Gemma 3 base, aunque degradados para idiomas distintos del kirguís por la poda del vocabulario.
- Entrada multimodal imagen-texto (el pipeline declarado es `image-text-to-text`), aunque el autor no detalla el estado de las capacidades de visión tras la poda.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (el modelo base lo soporta, pero el autor no lo confirma para esta variante).
- Capacidades de agente y razonamiento multi-paso: no documentadas por el autor.
- Capacidades multilingües: limitadas al kirguís; el autor advierte explícitamente que puede no funcionar bien en otros idiomas.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional en kirguís para atención al cliente: el modelo puede gestionar diálogos multi-turno mediante la plantilla de chat, con una huella de memoria menor que el Gemma 3 4B original, lo que abarata el despliegue en infraestructura modesta.
- Traducción y generación de contenido en kirguís: útil para redactar textos, resumir documentos o adaptar contenido al kirguís en pipelines editoriales, siempre que no se requiera fidelidad multilingüe.
- Procesamiento de documentos en kirguís en entornos con GPU de gama media: la reducción del 14,63% en parámetros y del vocabulario facilita el despliegue en GPUs consumer con cuantización adicional (aunque el autor no publica versiones cuantizadas).
- Investigación en poda de vocabulario (trimming): sirve como caso de estudio reproducible de la técnica aplicada a un modelo multimodal instruction-tuned, comparando el rendimiento frente al Gemma 3 4B original.
- Aplicaciones de visión-lenguaje en kirguís: al conservar el pipeline image-text-to-text, puede emplearse para descripción de imágenes o VQA en kirguís, aunque la calidad tras la poda no está documentada.
- Despliegue en regiones con requisitos de residencia de datos (tag `region:eu`): el autor etiqueta el modelo como compatible con endpoints y región europea, lo que puede interesar a proyectos con restricciones de localización.
- Prototipado rápido de chatbots en kirguís con `transformers` y `text-generation-inference`, dado que el modelo declara compatibilidad con endpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas en kirguís, ni comparaciones cuantitativas con el Gemma 3 4B original más allá de las estadísticas de tamaño y vocabulario.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 7,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, se recomienda al menos 10-12 GB de VRAM para contexto moderado.
- VRAM estimada en cuantización de 8 bits: en torno a 4 GB de pesos; en 4 bits, en torno a 2 GB, aunque el autor no publica versiones cuantizadas oficiales.
- GPU recomendadas: A100, H100 o L40S para producción; RTX 4090, RTX 3090 o RTX 4080 para inferencia en fp16 con margen.
- Cabe en GPUs consumer: sí, en RTX 4090/3090 en bf16 y en GPUs con 8-12 GB si se aplica cuantización de 8 o 4 bits.
- Opciones de despliegue: `transformers` (documentado por el autor), `text-generation-inference` (declarado compatible con endpoints), y potencialmente llama.cpp/Ollama si se generan conversiones GGUF (no publicadas).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alphaedge-ai/gemma-3-4b-it-kir-16384 | 3.670.770.032 | no disponible | kirguís | Gemma Terms of Use | Hugging Face (9 descargas) |
| google/gemma-3-4b-it | 4.300.079.472 | no disponible en esta ficha | multilingüe | Gemma Terms of Use | Hugging Face (oficial) |
| Otras variantes trimmed de Gemma 3 (p. ej. para otros idiomas del dataset fineweb-2-trimming) | variable | no disponible | idioma específico | Gemma Terms of Use | Hugging Face (comunidad) |

La comparación principal es con el modelo base: esta variante reduce parámetros y vocabulario a cambio de perder cobertura multilingüe. No se dispone de datos de rendimiento comparativo entre ambas versiones.

## Limitaciones y advertencias

- La poda del vocabulario elimina tokens no usados en kirguís; el modelo puede fallar o degradarse gravemente en otros idiomas, incluido el inglés.
- No hay evaluación publicada del impacto de la poda en la calidad de generación, razonamiento, código o visión; el autor asume que "debería rendir de forma similar" al original, pero no lo demuestra.
- Riesgo de alucinación inherente a los modelos de 4B, no cuantificado en esta variante.
- Sesgos: no documentados por el autor; se heredan los del Gemma 3 base y los del corpus de minado (fineweb-2).
- La licencia Gemma Terms of Use impone restricciones de uso comercial y obligaciones de atribución; el modelo no está afiliado ni respaldado por Google.
- El número de descargas (9) y likes (0) indica una adopción muy baja; no hay evidencia de uso en producción ni de mantenimiento continuado.
- No se documenta el tratamiento de tokens especiales del chat template tras la poda, lo que puede afectar a la estabilidad del formato conversacional.
- El modelo declara compatibilidad con `text-generation-inference` y endpoints, pero no se aportan pruebas de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/gemma-3-4b-it-kir-16384
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog de introducción a trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper Gemma 3 Technical Report: https://arxiv.org/abs/2503.19786
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
