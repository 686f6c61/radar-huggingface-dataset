# Qwen/Qwen3.5-35B-A3B

## Resumen

Qwen3.5-35B-A3B es un modelo multimodal de tipo causal language model con codificador de visión, desarrollado por el equipo Qwen de Alibaba. Se trata de un modelo de mezcla de expertos (MoE) con 35.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token, lo que lo sitúa en una categoría de eficiencia computacional muy atractiva para despliegue en producción. Forma parte de la familia Qwen3.5, que según el autor integra fusión temprana de tokens multimodales y una arquitectura híbrida basada en Gated Delta Networks combinadas con MoE disperso.

El modelo resuelve tareas de generación de texto, razonamiento, código, matemáticas y comprensión visual dentro de un único checkpoint, con una longitud de contexto nativa de 262.144 tokens extensible hasta 1.010.000. Su licencia Apache 2.0 y su compatibilidad con Transformers, vLLM, SGLang y KTransformers lo convierten en una opción relevante para equipos que necesitan un modelo multimodal de gran contexto sin costes de licencia restrictivos. La model card indica soporte para 201 idiomas y dialectos, aunque la ficha de Hugging Face no detalla la lista concreta.

La relevancia actual del modelo radica en su relación entre parámetros activos y capacidades: al activar solo 3B de los 35B totales, ofrece un throughput potencialmente alto con requisitos de memoria moderados en comparación con modelos densos de tamaño similar. Además, el autor ha publicado una versión posterior (Qwen3.6-35B-A3B) y una variante alojada en Alibaba Cloud Model Studio bajo el nombre Qwen3.5-Flash, lo que indica una línea de producto activa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con codificador de visión; híbrida Gated DeltaNet + Gated Attention con MoE disperso |
| Parametros totales | 35.951.822.704 (≈35B) |
| Parametros activos | ≈3B (8 expertos enrutados + 1 compartido de 256 totales) |
| Longitud de contexto | 262.144 tokens nativa; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible (la model card no detalla cuantizaciones oficiales; el repo contiene safetensors en precisión original) |
| Idiomas soportados | 201 idiomas y dialectos según la model card; lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers); compatible con vLLM, SGLang y KTransformers |

## Arquitectura y entrenamiento

La arquitectura combina dos mecanismos de atención en un layout de 40 capas organizado como 10 bloques de la forma `3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE)`. Las Gated DeltaNet emplean atención lineal con 32 cabezas para V y 16 para QK, dimensión de cabeza 128; las capas de Gated Attention usan 16 cabezas para Q y 2 para KV con dimensión 256 y RoPE de 64 dimensiones. La dimensión oculta es 2048 y el embedding de tokens es 248.320 (con padding). El componente MoE consta de 256 expertos con dimensión intermedia 512, de los cuales se activan 8 enrutados más 1 compartido por token. El modelo incorpora MTP (multi-token prediction) entrenado con múltiples pasos.

El entrenamiento se realizó en dos fases, pre-entrenamiento y post-entrenamiento, con fusión temprana sobre tokens multimodales según el autor. La model card menciona escalado de reinforcement learning en entornos de millones de agentes con distribuciones de tareas progresivamente complejas, así como una infraestructura de entrenamiento asíncrona para RL. No se especifica en la información disponible el número exacto de tokens de entrenamiento ni la composición detallada del dataset. El modelo base es Qwen/Qwen3.5-35B-A3B-Base, y este checkpoint corresponde al modelo post-entrenado.

## Capacidades

- Generación de texto y razonamiento multi-turno con contexto largo (hasta 262K tokens nativos, 1M extensible).
- Comprensión de imágenes y texto (pipeline `image-text-to-text`) mediante codificador de visión con fusión temprana.
- Razonamiento matemático y generación de código, según los benchmarks publicados por el autor.
- Capacidades de agente y razonamiento multi-paso, con entrenamiento RL orientado a entornos de agentes.
- Soporte multilingüe amplio: 201 idiomas y dialectos según la model card.
- Compatibilidad con tool calling y function calling a través de los stacks de despliegue soportados (vLLM, SGLang, Transformers), aunque la model card no detalla el formato exacto de las herramientas.
- Modo de predicción multi-token (MTP) que puede habilitar decodificación especulativa en los motores de inferencia compatibles.

## Casos de uso

- Atención al cliente multimodal: el modelo puede procesar capturas de pantalla, documentos escaneados o imágenes enviadas por el usuario junto con texto en conversaciones multi-turno, aprovechando la ventana de 262K tokens para mantener historial extenso sin truncamiento.
- Análisis de documentación técnica extensa: con contexto de hasta 1M tokens (extensible), es adecuado para ingerir repositorios completos, manuales o expedientes y responder preguntas con referencias cruzadas.
- Generación de código en pipelines de CI/CD: al ser compatible con vLLM y SGLang, puede integrarse como servicio de generación o revisión de código, con la ventaja de activar solo 3B de parámetros por token para reducir coste por petición.
- Agentes autónomos multi-paso: el entrenamiento RL en entornos de agentes y el soporte de tool calling lo hacen apto para orquestación de tareas con llamadas a APIs, navegación web o ejecución de comandos en sandbox.
- Procesamiento de imágenes en flujos de trabajo empresariales: extracción de información de facturas, formularios o gráficos combinada con razonamiento textual, sin necesidad de un modelo de visión separado.
- Despliegue multilingüe global: con 201 idiomas declarados, puede usarse como modelo único para atención al cliente o moderación de contenido en mercados con múltiples lenguas y dialectos.
- Investigación en eficiencia de MoE: su relación 35B/3B y la arquitectura híbrida Gated DeltaNet lo convierten en un objeto de estudio para experimentos de decodificación especulativa y optimización de throughput.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados comparativos. A continuación se reproducen los valores disponibles en la información proporcionada (categoría Knowledge, MMLU-Pro):

| Modelo | MMLU-Pro |
|---|---|
| GPT-5-mini 2025-08-07 | 83.7 |
| GPT-OSS-120B | 80.8 |
| Qwen3-235B-A22B | 84.4 |
| Qwen3.5-122B-A10B | 86.7 |
| Qwen3.5-27B | 86.1 |
| Qwen3.5-35B-A3B | no disponible en el fragmento proporcionado |

El resto de la tabla de benchmarks (razonamiento, código, matemáticas, visión) no está incluido en la información disponible; solo se ha podido extraer la fila MMLU-Pro. No se han publicado en la información proporcionada resultados de HumanEval, GSM8K ni otros benchmarks más allá de los citados.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión original (BF16): aproximadamente 72 GB solo para pesos, más overhead de KV cache y activaciones; requiere GPUs de 80 GB (A100, H100) o múltiples GPUs menores.
- Cuantización a 8 bits: entorno a 36-40 GB, viable en una A100 40GB o en dos RTX 4090 (24 GB cada una) con tensor parallelism.
- Cuantización a 4 bits: entorno a 18-22 GB, potencialmente desplegable en una única RTX 4090 o RTX 5090, aunque la model card no publica cuantizaciones oficiales.
- Dado que solo se activan ~3B parámetros por token, el coste computacional por token es bajo en comparación con modelos densos de 35B, lo que favorece el throughput en GPUs con ancho de banda moderado.
- Opciones de despliegue soportadas según la model card: Hugging Face Transformers, vLLM, SGLang y KTransformers. No se menciona soporte explícito de llama.cpp u Ollama en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | MMLU-Pro | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-35B-A3B | 35B / ~3B | 262K nativo, 1M extensible | Apache 2.0 | no disponible | Hugging Face, API Alibaba Cloud |
| Qwen3.5-27B | 27B (denso, según denominación) | no disponible | no disponible | 86.1 | familia Qwen3.5 |
| Qwen3.5-122B-A10B | 122B / ~10B | no disponible | no disponible | 86.7 | familia Qwen3.5 |
| Qwen3-235B-A22B | 235B / ~22B | no disponible | no disponible | 84.4 | generación anterior |
| GPT-OSS-120B | 120B | no disponible | no disponible | 80.8 | no disponible |

La comparativa se limita a los datos de la tabla de la model card. No se dispone de información sobre contextos, licencias o disponibilidad de los modelos alternativos más allá de lo indicado.

## Limitaciones y advertencias

- Sesgos conocidos: la model card no documenta sesgos específicos; al ser un modelo entrenado con datos web a gran escala, es probable que herede sesgos presentes en esos datos, pero no se aporta evidencia concreta.
- Riesgo de alucinación: no se publican evaluaciones de factualidad ni tasas de alucinación en la información disponible.
- Limitaciones de contexto: aunque el contexto nativo es de 262K tokens y extensible a 1M, el rendimiento en ventanas extremas puede degradarse; no se aportan métricas de recall en contexto largo.
- Idiomas: se declaran 201 idiomas, pero no se detalla la calidad por idioma ni la lista completa; el rendimiento en lenguas minoritarias es desconocido.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero se recomienda revisar el archivo LICENSE del repositorio por si incluye términos adicionales.
- Producción: el autor ha publicado una versión posterior (Qwen3.6-35B-A3B), lo que sugiere que este checkpoint puede quedar obsoleto; además, la variante alojada Qwen3.5-Flash ofrece 1M de contexto por defecto y herramientas integradas, lo que puede ser preferible para despliegues gestionados.
- No se detallan cuantizaciones oficiales ni recetas de despliegue en la información proporcionada, lo que obliga a validar el comportamiento en cuantizaciones de terceros antes de usarlas en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B-Base
- Versión posterior: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia: https://huggingface.co/Qwen/Qwen3.5-35B-A3B/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Qwen home: https://qwen.ai/home
- Alibaba Cloud Model Studio: https://modelstudio.alibabacloud.com/
- Guía de usuario de Model Studio: https://www.alibabacloud.com/help/en/model-studio/text-generation
