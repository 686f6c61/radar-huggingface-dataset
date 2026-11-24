# boss099/Qwen3.5-9B-exl3-4bpw-SC

## Resumen

Qwen3.5-9B-exl3-4bpw-SC es una cuantización de 4 bits en formato EXL3 (ExLlamaV3) del modelo multimodal Qwen3.5-9B-Base, publicada por el usuario boss099. El modelo original lo desarrolla el equipo Qwen (Alibaba), y esta versión concreta reduce el peso del repositorio a 7,2 GB para facilitar su despliegue en GPUs con VRAM limitada. La información disponible sobre esta cuantización específica es mínima: no hay descripción del proceso de cuantización, ni métricas de degradación, ni instrucciones de uso más allá de las etiquetas del repositorio.

El modelo base Qwen3.5-9B es un modelo causal con codificador de visión que integra una arquitectura híbrida de Gated DeltaNet (atención lineal) y atención con puertas, junto con una red feed-forward densa. Según la model card del autor, soporta 262.144 tokens de contexto de forma nativa, extensible hasta 1.010.000, y está entrenado con fusión temprana de tokens multimodales. La model card también menciona soporte para 201 idiomas y dialectos, aunque la ficha de Hugging Face de esta cuantización no lista idiomas concretos.

La relevancia de esta publicación radica en el formato EXL3: permite ejecutar un modelo de 9B con capacidades de visión y contexto muy largo en hardware de consumo, a costa de una pérdida de precisión que no está documentada en la información proporcionada. Al tener 0 descargas y 0 likes, se trata de una publicación reciente y sin validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido (Gated DeltaNet + Gated Attention) con codificador de visión |
| Parámetros totales | 9B según model card; 3.607.547.264 según safetensors del repo cuantizado |
| Parámetros activos | no disponible (no se indica que sea MoE en la información proporcionada) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantización | EXL3 a 4 bits por peso (4bpw) |
| Idiomas soportados | 201 idiomas y dialectos según la model card del modelo base; no disponibles en la ficha del repo |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo con librería transformers); formato EXL3 |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura híbrida poco convencional: 32 capas organizadas en 8 bloques de 4 capas cada uno, donde cada bloque contiene 3 capas de Gated DeltaNet (atención lineal con 32 cabezas para V y 16 para QK, dimensión de cabeza 128) seguidas de 1 capa de Gated Attention (16 cabezas para Q y 4 para KV, dimensión de cabeza 256, RoPE de 64 dimensiones). La dimensión oculta es 4096, la dimensión intermedia de la FFN es 12288 y el vocabulario está acolchado a 248.320 tokens. Incluye predicción multi-token (MTP) entrenada con múltiples pasos, lo que puede habilitar decodificación especulativa.

Según la model card, el entrenamiento combina preentrenamiento y postentrenamiento con fusión temprana de tokens multimodales, y un escalado de aprendizaje por refuerzo sobre entornos multiagente. No se detalla el número de tokens de entrenamiento, la composición del dataset ni si se usó RLHF o DPO de forma explícita. La cuantización EXL3 a 4 bits la realiza el publicador boss099; no hay información sobre el método exacto (GPTQ, calibración propia u otro) ni sobre la evaluación de la degradación resultante.

## Capacidades

- Generación de texto y razonamiento en dominios de conocimiento general y STEM, según los benchmarks del modelo base.
- Comprensión de imágenes y texto combinados (pipeline image-text-to-text), gracias al codificador de visión del modelo base.
- Razonamiento multi-step y soporte de agentes, según la model card del modelo base.
- Capacidades multilingües amplias: 201 idiomas y dialectos declarados para el modelo base.
- Contexto largo de hasta 262.144 tokens nativos, adecuado para documentos extensos o conversaciones prolongadas.
- Soporte de tool calling: no confirmado explícitamente en la información proporcionada para esta cuantización.
- Modo thinking: no confirmado en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Análisis de documentos largos con imágenes: el contexto nativo de 262.144 tokens permite procesar informes, contratos o expedientes completos junto con sus figuras y tablas, usando el codificador de visión para interpretar diagramas.
- Asistencia técnica sobre manuales: un chatbot que responde preguntas citando secciones concretas de manuales extensos, aprovechando la ventana de contexto y la capacidad multilingüe para atender a usuarios en varios idiomas.
- Procesamiento de documentación técnica multilingüe: traducción y resumen de documentación en los 201 idiomas declarados, con contexto suficiente para mantener coherencia terminológica a lo largo de un documento.
- Despliegue en estaciones de trabajo con una sola GPU: al ocupar 7,2 GB en formato EXL3, puede ejecutarse en GPUs de consumo con 8-12 GB de VRAM, lo que facilita prototipos locales de asistentes multimodales.
- Extracción de información de capturas y formularios: el pipeline image-text-to-text permite digitalizar y estructurar datos de imágenes de documentos, útil en flujos de back office.
- Investigación sobre cuantización: sirve como punto de comparación para estudiar la degradación de un modelo híbrido con atención lineal al cuantizarse a 4 bits, aunque el publicador no aporta métricas al respecto.

## Benchmarks y rendimiento

Resultados del modelo base Qwen3.5-9B publicados en su model card (no son resultados de esta cuantización EXL3):

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80,8 | 74,8 | 82,7 | 80,9 | 82,5 | 79,1 |
| MMLU-Redux | 91,0 | 87,8 | 92,5 | 91,4 | no disponible en el fragmento | no disponible en el fragmento |

No se han publicado resultados de benchmarks específicos de la cuantización EXL3 4bpw en la información disponible. Tampoco hay datos de latencia o throughput para esta versión cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7,2 GB solo para pesos; con caché KV para contexto largo, se recomienda al menos 10-12 GB para contextos moderados y bastante más para aprovechar los 262.144 tokens.
- GPU recomendadas: RTX 3090, RTX 4090, RTX 4080, A10, L4 o superiores para contextos largos; GPUs con 8 GB pueden cargar los pesos pero quedarán limitadas en contexto.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más, con limitaciones de contexto según la VRAM disponible.
- Opciones de despliegue: el formato EXL3 está pensado para ExLlamaV3; la model card del modelo base menciona compatibilidad con Transformers, vLLM, SGLang y KTransformers, pero no se confirma que esta cuantización EXL3 funcione en todos ellos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-exl3-4bpw-SC (esta ficha) | 9B (3,6B en safetensors cuantizados) | 262.144 nativos | Apache 2.0 | EXL3 4 bits | Cuantización comunitaria sin validación |
| Qwen3.5-9B (base) | 9B | 262.144 nativos | Apache 2.0 | safetensors BF16 | Modelo oficial con benchmarks publicados |
| Qwen3.5-4B | 4B | no disponible | Apache 2.0 | safetensors | Alternativa más ligera de la misma familia |
| Qwen3-30BA3B-Thinking-2507 | 30B (3B activos) | no disponible | Apache 2.0 | safetensors | MoE de la generación anterior, comparable en MMLU-Pro |

## Limitaciones y advertencias

- No hay evaluación publicada de la degradación de calidad causada por la cuantización EXL3 a 4 bits; el rendimiento real puede diferir del modelo base.
- La discrepancia entre los 9B declarados en la model card y los 3,6B de parámetros en safetensors del repo cuantizado no está explicada; conviene verificar la integridad de los pesos antes de usarlos en producción.
- Riesgo de alucinación inherente a los modelos de lenguaje, no cuantificado para esta versión.
- Sesgos conocidos del modelo base: no documentados en la información proporcionada.
- Idiomas: aunque el modelo base declara 201 idiomas, la ficha de esta cuantización no especifica idiomas y no hay garantía de que la cuantización preserve el rendimiento multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero el publicador no ofrece garantías ni soporte; es una publicación de un tercero, no oficial de Qwen.
- Sin descargas ni likes: no hay evidencia de validación por parte de la comunidad.
- El formato EXL3 puede limitar las opciones de despliegue frente a GGUF o safetensors estándar.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/boss099/Qwen3.5-9B-exl3-4bpw-SC
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Modelo postentrenado de referencia: https://huggingface.co/Qwen/Qwen3.5-9B
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Licencia: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
