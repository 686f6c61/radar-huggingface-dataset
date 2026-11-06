# ArchiveStudio/Qwen3.5-35B-A3B

## Resumen

Qwen3.5-35B-A3B es un modelo de lenguaje causal multimodal desarrollado por el equipo Qwen de Alibaba, publicado en el repositorio ArchiveStudio/Qwen3.5-35B-A3B como fine-tune del modelo base Qwen/Qwen3.5-35B-A3B-Base. Combina un codificador de visión con un transformer híbrido que alterna capas de Gated DeltaNet (atención lineal) y Gated Attention (atención completa), todo ello con una capa de mezcla de expertos (MoE) dispersa. El modelo cuenta con 35.951.822.704 parámetros totales según los pesos en safetensors, de los cuales activa aproximadamente 3.000 millones por token, lo que le permite ofrecer una relación calidad/coste muy competitiva en inferencia.

La propuesta de valor principal reside en su arquitectura híbrida eficiente: 40 capas organizadas en 10 bloques de la forma 3 × (Gated DeltaNet → MoE) + 1 × (Gated Attention → MoE), con 256 expertos y 8 expertos enrutados más 1 compartido activados por token. Esta combinación reduce el coste computacional manteniendo una capacidad de representación propia de un modelo denso de mayor tamaño. Además, soporta de forma nativa un contexto de 262.144 tokens, extensible hasta 1.010.000 tokens, y está entrenado con fusión temprana de tokens multimodales, lo que le permite procesar imágenes y texto de forma conjunta.

El modelo resulta relevante en el momento actual porque representa la generación Qwen3.5, que según la model card alcanza paridad con Qwen3 en benchmarks de razonamiento, código y agentes, y supera a los modelos Qwen3-VL en comprensión visual. Su licencia Apache 2.0 y su compatibilidad con Transformers, vLLM, SGLang y KTransformers lo convierten en una opción atractiva para despliegues de producción que requieran multimodalidad, contexto largo y coste de inferencia contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido causal con codificador de visión; Gated DeltaNet + Gated Attention con MoE dispersa |
| Parametros totales | 35.951.822.704 (35B) |
| Parametros activos | ~3B (8 expertos enrutados + 1 compartido por token) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible (no especificado en la model card) |
| Idiomas soportados | 201 idiomas y dialectos (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal híbrido con codificador de visión. El backbone del lenguaje consta de 40 capas con dimensión oculta 2048 y embedding de tokens de 248.320 (con padding). La disposición es 10 bloques de la forma 3 × (Gated DeltaNet → MoE) seguidos de 1 × (Gated Attention → MoE). Las capas Gated DeltaNet emplean 32 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. Las capas Gated Attention usan 16 cabezas para Q y 2 para KV, con dimensión de cabeza 256 y dimensión de RoPE de 64. La capa MoE contiene 256 expertos, de los cuales se activan 8 enrutados más 1 compartido por token, con dimensión intermedia de experto de 512. El modelo incorpora MTP (multi-token prediction) entrenado con múltiples pasos.

El entrenamiento se realizó en dos fases: pre-entrenamiento y post-entrenamiento. La model card indica fusión temprana sobre tokens multimodales, lo que permite que el modelo procese texto e imágenes de forma conjunta desde las primeras capas. Se aplicó aprendizaje por refuerzo (RL) escalado a entornos de millones de agentes con distribuciones de tareas progresivamente complejas, lo que según el autor proporciona una adaptabilidad robusta en escenarios del mundo real. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si se usaron técnicas concretas como RLHF o DPO más allá de la mención genérica a RL.

## Capacidades

- Generación de texto y razonamiento: el modelo está diseñado para tareas de conocimiento, razonamiento lógico y respuesta conversacional multi-turno.
- Comprensión visual: pipeline image-text-to-text, con codificador de visión integrado mediante fusión temprana de tokens multimodales.
- Generación de código: la model card indica paridad con Qwen3 en benchmarks de código y agentes.
- Razonamiento matemático: incluido en los benchmarks de conocimiento y razonamiento reportados.
- Soporte de tool calling / function calling: no se detalla explícitamente en la model card, pero la mención a "agentes" y a herramientas integradas en la versión alojada Qwen3.5-Flash sugiere capacidad de uso de herramientas.
- Soporte de agentes y razonamiento multi-paso: entrenado con RL escalado a entornos de millones de agentes, lo que indica capacidades agénticas.
- Capacidades multilingües: 201 idiomas y dialectos según la model card.
- Modo thinking: no se menciona explícitamente en la información disponible.
- Contexto largo: ventana nativa de 262.144 tokens, extensible a 1.010.000 tokens.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 262.144 tokens de ventana nativa, lo que permite mantener el historial completo de una conversación extensa sin truncamientos y con comprensión del contexto visual si el cliente envía capturas o documentos.
- Análisis de documentos extensos con imágenes: informes financieros, contratos o expedientes que combinan texto e imágenes pueden procesarse en una sola pasada gracias a la ventana de contexto extendida y al codificador de visión, extrayendo información estructurada y respondiendo preguntas sobre el contenido.
- Generación de código en producción: el modelo puede integrarse en pipelines de CI/CD para revisión de código, generación de tests y documentación técnica, aprovechando su capacidad de razonamiento y su soporte para agentes que ejecutan herramientas.
- Asistentes de investigación multimodal: investigadores pueden usar el modelo para resumir artículos científicos con figuras, tablas y gráficos, gracias a la fusión temprana de tokens visuales y textuales.
- Despliegue multilingüe global: con 201 idiomas y dialectos soportados, el modelo es adecuado para plataformas de atención al cliente o generación de contenido en mercados internacionales sin necesidad de modelos específicos por idioma.
- Automatización de tareas agénticas: el entrenamiento con RL en entornos de millones de agentes permite usar el modelo como núcleo de sistemas que planifican y ejecutan tareas multi-paso, como orquestación de herramientas, navegación web o gestión de flujos de trabajo.
- Análisis de imágenes médicas o técnicas (con supervisión): el pipeline image-text-to-text permite describir y clasificar imágenes en dominios especializados, aunque se requiere validación humana por el riesgo de alucinación.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks de lenguaje. A continuación se reproducen los valores disponibles para Qwen3.5-35B-A3B junto con los de los modelos comparados en la misma tabla:

| Benchmark | GPT-5-mini 2025-08-07 | GPT-OSS-120B | Qwen3-235B-A22B | Qwen3.5-122B-A10B | Qwen3.5-27B | Qwen3.5-35B-A3B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 83.7 | 80.8 | 84.4 | 86.7 | 86.1 | no disponible en el fragmento |

El fragmento de la model card proporcionado se interrumpe en la fila de MMLU-Pro para Qwen3.5-35B-A3B, por lo que no se dispone del resto de resultados de benchmarks (HumanEval, GSM8K, etc.) en la información accesible. No se han publicado en la información disponible los resultados completos de benchmarks para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 35.951.822.704 parámetros totales, en precisión BF16 se requieren aproximadamente 72 GB de VRAM solo para los pesos. En cuantización de 8 bits, unos 36 GB; en 4 bits, unos 18 GB. Estas estimaciones son orientativas y no están confirmadas en la model card.
- GPU recomendadas: para BF16, GPU de clase A100 80GB, H100 80GB o H200. Para cuantizaciones de 8 bits, A100 40GB o L40S 48GB. Para 4 bits, RTX 4090 24GB o RTX 6000 Ada 48GB podrían ser suficientes para los pesos, aunque el contexto largo incrementa los requisitos de memoria KV.
- Cabe en consumer GPU: en cuantización de 4 bits, sí es posible en GPUs de 24GB como la RTX 4090, aunque con limitaciones de contexto y throughput. En 8 bits, requiere GPUs profesionales de 40-48GB.
- Opciones de despliegue: la model card indica compatibilidad con Hugging Face Transformers, vLLM, SGLang y KTransformers. No se mencionan llama.cpp u Ollama en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada. La arquitectura MoE con ~3B parámetros activos sugiere un throughput superior al de un modelo denso de 35B, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | MMLU-Pro |
|---|---|---|---|---|---|
| Qwen3.5-35B-A3B | 35B | ~3B | 262.144 (ext. 1.010.000) | Apache 2.0 | no disponible |
| Qwen3.5-27B | 27B (denso, según la tabla) | no aplica | no disponible | no disponible | 86.1 |
| Qwen3.5-122B-A10B | 122B | 10B | no disponible | no disponible | 86.7 |
| Qwen3-235B-A22B | 235B | 22B | no disponible | no disponible | 84.4 |
| GPT-OSS-120B | 120B | no disponible | no disponible | no disponible | 80.8 |

La comparativa se limita a los datos de la tabla de benchmarks de la model card. Qwen3.5-35B-A3B se posiciona como la opción de menor coste computacional de la familia Qwen3.5, con ~3B parámetros activos frente a los 10B del modelo de 122B y los 22B del Qwen3-235B-A22B, manteniendo un MMLU-Pro en el rango de 86 puntos según la tabla (aunque el valor exacto para este modelo no está disponible en el fragmento).

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; como todo modelo entrenado con datos web a gran escala, es probable que herede sesgos sociales y culturales.
- Riesgo de alucinación: no se cuantifica en la model card; es un riesgo inherente a los modelos generativos, especialmente en tareas de conocimiento factual y análisis de imágenes.
- Limitaciones de contexto o idioma: aunque soporta 201 idiomas, el rendimiento puede variar significativamente entre idiomas de altos y bajos recursos. El contexto extensible a 1.010.000 tokens puede degradar la calidad en los extremos de la ventana.
- Restricciones de licencia: la licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales, pero se recomienda revisar el enlace a la licencia original del modelo base.
- Caveats para producción: el modelo es un fine-tune publicado por ArchiveStudio sobre el modelo base de Qwen; la model card no detalla el proceso de fine-tune ni los datos adicionales utilizados, lo que introduce incertidumbre sobre posibles cambios de comportamiento respecto al base. Además, el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad.
- El modelo requiere validación humana en aplicaciones críticas (médicas, legales, financieras) debido al riesgo de errores y alucinaciones.

## Enlaces

- Hugging Face: https://huggingface.co/ArchiveStudio/Qwen3.5-35B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B-Base
- Licencia: https://huggingface.co/Qwen/Qwen3.5-35B-A3B/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Alibaba Cloud Model Studio: https://modelstudio.alibabacloud.com/
- Guía de usuario de Model Studio: https://www.alibabacloud.com/help/en/model-studio/text-generation
