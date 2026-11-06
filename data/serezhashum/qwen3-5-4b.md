# SerezhaShum/Qwen3.5-4B

## Resumen

Qwen3.5-4B es un modelo fundacional multimodal de tipo image-text-to-text desarrollado por el equipo Qwen (Alibaba). Esta ficha concreta corresponde a la publicación de SerezhaShum en Hugging Face, que redistribuye los pesos post-entrenados de Qwen/Qwen3.5-4B-Base en formato Transformers. El modelo integra un codificador de visión y un modelo de lenguaje causal con una arquitectura híbrida que combina capas de atención lineal (Gated DeltaNet) con capas de atención completa, además de un esquema de mezcla de expertos dispersa.

La relevancia del modelo radica en su apuesta por la fusión temprana de tokens multimodales, lo que le permite alcanzar paridad con la generación Qwen3 en tareas de razonamiento, código, agentes y comprensión visual. Con 4.659.865.088 parámetros totales y una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.010.000, se posiciona como una opción compacta para despliegues que requieren ventanas de contexto muy largas sin el coste computacional de modelos de mayor tamaño.

El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en pipelines de producción. Está pensado para desarrolladores que necesitan un modelo multimodal de tamaño medio con soporte para tool calling, razonamiento multi-paso y cobertura lingüística amplia (hasta 201 idiomas y dialectos según la model card).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Causal Language Model con codificador de visión; híbrido Gated DeltaNet + Gated Attention, FFN con MoE dispersa |
| Parámetros totales | 4.659.865.088 |
| Parámetros activos | no disponible (la model card no desglosa el número de expertos activos por token) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantización | no disponible (no se especifican en la información proporcionada) |
| Idiomas soportados | 201 idiomas y dialectos (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, KTransformers) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida de 32 capas con un layout de 8 bloques, cada uno compuesto por 3 sub-bloques de Gated DeltaNet seguidos de FFN y 1 sub-bloque de Gated Attention seguido de FFN. La dimensión oculta es de 2560, con un token embedding de 248.320 entradas (padded) y una dimensión intermedia de FFN de 9216. Las capas de Gated DeltaNet usan 32 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128; las capas de Gated Attention usan 16 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de 64 dimensiones. La salida LM está atada al embedding de tokens. El modelo incluye entrenamiento con multi-token prediction (MTP) en varios pasos.

El entrenamiento combina pre-entrenamiento y post-entrenamiento, con fusión temprana sobre tokens multimodales. La model card menciona entrenamiento con RL a escala de millones de entornos de agentes y una infraestructura de entrenamiento multimodal con eficiencia cercana al 100 % respecto al entrenamiento solo de texto. No se especifica en la información disponible el número exacto de tokens de entrenamiento ni la composición del dataset, ni si se aplicaron técnicas concretas de RLHF o DPO más allá de la mención genérica a RL escalable.

## Capacidades

- Generación de texto y razonamiento multimodal (image-text-to-text): el modelo acepta imágenes y texto como entrada y genera texto.
- Razonamiento, código y matemáticas: la model card reporta paridad con Qwen3 y superioridad sobre Qwen3-VL en benchmarks de razonamiento, coding, agentes y comprensión visual.
- Comprensión visual: codificador de visión integrado con fusión temprana de tokens.
- Soporte de tool calling / function calling: implícito en el pipeline de agentes y en la mención a entornos de agentes en el entrenamiento RL.
- Razonamiento multi-paso y agentes: entrenado con RL en entornos de agentes a gran escala.
- Capacidades multilingües: 201 idiomas y dialectos según la model card.
- Modo thinking: la comparativa de benchmarks incluye variantes Thinking de otros modelos Qwen, pero no se confirma explícitamente un modo thinking para esta variante de 4B en la información disponible.
- Compatibilidad con vLLM, SGLang, KTransformers y Transformers.

## Casos de uso

- Atención al cliente multimodal: el modelo puede procesar capturas de pantalla, facturas o imágenes enviadas por el usuario junto con texto en conversaciones multi-turno, gracias a su ventana de 262.144 tokens que permite mantener historiales largos sin truncamiento.
- Análisis de documentos extensos con imágenes: informes anuales, contratos o manuales técnicos con gráficos y tablas pueden procesarse en una sola pasada al aprovechar el contexto nativo de 262K tokens y la extensión hasta 1M.
- Generación de código asistida por capturas: el modelo puede recibir una imagen de una interfaz o de un error de consola y generar código de corrección o reproducción, integrándose en pipelines de CI/CD mediante tool calling.
- Agentes autónomos de navegación web: su entrenamiento con RL en entornos de agentes y su soporte multimodal permiten interpretar capturas de pantalla de páginas web y ejecutar acciones multi-paso.
- Moderación de contenido multimodal: clasificación y descripción de imágenes con texto asociado en flujos de revisión, aprovechando la cobertura de 201 idiomas para despliegues internacionales.
- Extracción de información estructurada: conversión de imágenes de recibos, formularios o tablas en JSON mediante function calling, con contexto suficiente para procesar lotes grandes en una sola llamada.
- Asistentes de accesibilidad: descripción detallada de imágenes y generación de texto alternativo en múltiples idiomas para plataformas de contenido.
- Búsqueda y recuperación aumentada multimodal: indexación de documentos que combinan texto e imágenes con ventanas de contexto largas para resumir o responder preguntas sobre corpus extensos.

## Benchmarks y rendimiento

Datos extraídos de la model card para Qwen3.5-4B frente a modelos comparables (valores según la tabla publicada por el autor):

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80,8 | 74,8 | 82,7 | 80,9 | 82,5 | 79,1 |
| MMLU-Redux | 91,0 | 87,8 | 92,5 | 91,4 | 91,4 | no disponible en el extracto |

La model card incluye una figura adicional de benchmarks (`qwen3.5_small_size_score.png`) y una tabla de lenguaje que se trunca en el extracto disponible; no se han podido verificar el resto de filas (HumanEval, GSM8K, benchmarks de visión) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16): aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 16-24 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: aproximadamente 5 GB para pesos; en 4 bits, aproximadamente 2,5-3 GB para pesos (estimación teórica basada en el número de parámetros; no confirmada por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegues de producción con contexto largo; RTX 4090 (24 GB) para inferencia en BF16 con contexto moderado; RTX 3090/4080 para cuantización 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en BF16 con contexto limitado, y en GPUs de 12-16 GB con cuantización.
- Opciones de despliegue: Transformers, vLLM, SGLang, KTransformers (según la model card).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B | 4,66B | 262K (ext. 1M) | Apache 2.0 | Sí (image-text-to-text) | Hugging Face |
| Qwen3.5-9B | no disponible en el extracto | no disponible en el extracto | Apache 2.0 (según repo Qwen) | Sí | Hugging Face |
| GPT-OSS-20B | 20B (aprox.) | no disponible | no disponible | no disponible | no disponible |
| Qwen3-30BA3B-Thinking-2507 | 30B totales (A3B activos) | no disponible | no disponible | no disponible | Hugging Face |

La comparativa se limita a los modelos presentes en la tabla de benchmarks de la model card; no se dispone de datos de contexto, licencia o modalidad para todos ellos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información proporcionada; cabe esperar sesgos heredados de los datos de pre-entrenamiento de Qwen, no auditados en esta ficha.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en tareas de razonamiento visual o contextos muy largos.
- Limitaciones de contexto: aunque el contexto nativo es de 262.144 tokens y se extiende hasta 1.010.000, el rendimiento en ventanas extremas no está validado en la información disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar el LICENSE del repositorio base Qwen/Qwen3.5-4B para condiciones adicionales.
- Caveat de producción: este repositorio es una redistribución por parte de un tercero (SerezhaShum) con 0 descargas y 1 like en el momento de la consulta; no es el repositorio oficial de Qwen, por lo que conviene verificar la integridad de los pesos frente al repositorio base antes de desplegar.
- Idiomas: se declaran 201 idiomas, pero no se especifica el rendimiento por idioma ni la cobertura real en la información disponible.
- Parámetros activos: al ser un modelo con MoE dispersa, no se detalla el número de expertos ni los parámetros activos por token, lo que impide estimar con precisión el coste de inferencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SerezhaShum/Qwen3.5-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Figura de benchmarks: https://qianwen-res.oss-accelerate-overseas.aliyuncs.com/Qwen3.5/Figures/qwen3.5_small_size_score.png
- Logo Qwen3.5: https://qianwen-res.oss-accelerate.aliyuncs.com/logo_qwen3.5.png
