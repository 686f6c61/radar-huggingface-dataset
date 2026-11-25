# hellmans/Qwen3.5-9B-uncensored-zero.i1-Q4_K_M-GGUF

## Resumen

Qwen3.5-9B-uncensored-zero es una variante "abliterated" (decensored) del modelo Qwen3.5-9B de Alibaba Qwen, publicada por el usuario hellmans en Hugging Face como un clon del repositorio de MiguelMendez101. El modelo base es un transformer multimodal (texto e imagen) de 8.953.803.264 parámetros con arquitectura híbrida que combina Gated Delta Networks (atención lineal) con atención con compuertas y una red feed-forward de tipo Mixture-of-Experts dispersa. La modificación principal consiste en la eliminación de los comportamientos de rechazo mediante la técnica de abliteration ARA (Arbitrary-Rank Ablation) implementada en Heretic v1.2.0.

El interés de esta ficha reside en dos planos. Por un lado, documenta un modelo de la familia Qwen3.5 de 9B con contexto nativo de 262.144 tokens, extensible hasta 1.010.000, y capacidades de visión integradas. Por otro, describe un proceso de decensurado que, según la model card, reduce los rechazos de 84/100 a 0/100 en un conjunto de prueba de 100 prompts, a costa de una divergencia KL de 0,3980 respecto al modelo original. Esta versión se distribuye cuantizada en Q4_K_M con formato GGUF, lo que la hace desplegable en hardware de consumo.

La licencia declarada es Apache 2.0, heredada del modelo base. El repositorio tiene 5,6 GB y registra 433 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con vision encoder; capas Gated DeltaNet (atención lineal) intercaladas con capas de atención con compuertas; FFN de tipo MoE disperso |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no disponible (la model card no detalla el reparto activo del MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantizacion | Q4_K_M (esta publicación); el repositorio base admite otras cuantizaciones GGUF, no detalladas |
| Idiomas soportados | 201 idiomas y dialectos según la model card del modelo base; no se detalla la lista |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantización Q4_K_M); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura causal con encoder de visión y un layout híbrido de 32 capas organizado en 8 bloques de la forma 3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN). La dimensión oculta es 4096, con un vocabulario de 248.320 tokens (con padding). Las capas Gated DeltaNet usan 32 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128; las capas de atención con compuertas usan 16 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de dimensión 64. La FFN tiene dimensión intermedia 12.288. El modelo incorpora entrenamiento multi-step MTP (multi-token prediction).

El entrenamiento combina preentrenamiento y postentrenamiento, con fusión temprana de tokens multimodales y escalado de reinforcement learning en entornos multiagente. La model card menciona paridad con Qwen3 y mejora sobre Qwen3-VL en razonamiento, código, agentes y comprensión visual. No se especifica el número de tokens de entrenamiento ni la composición del dataset.

La modificación abliterated aplica ARA con preservación de norma de fila sobre las capas 13 a 24, con los parámetros: `preserve_good_behavior_weight` 0,8846, `steer_bad_behavior_weight` 0,0003, `overcorrect_relative_weight` 1,2549 y `neighbor_count` 1. El resultado declarado es una divergencia KL de 0,3980 frente al original y 0 rechazos en 100 prompts, frente a 84/100 del modelo base.

## Capacidades

- Generación de texto y razonamiento en lenguaje natural, con soporte de modo thinking según la familia Qwen3.5.
- Comprensión de imágenes y texto (pipeline `image-text-to-text`), gracias al encoder de visión integrado.
- Generación de código y resolución de problemas matemáticos y STEM.
- Capacidades de agente y razonamiento multi-paso, con soporte declarado para entornos multiagente durante el entrenamiento.
- Soporte multilingüe amplio: 201 idiomas y dialectos según la model card del base.
- Comportamiento sin rechazos en el conjunto de prueba declarado por el autor (0/100), orientado a usos donde el modelo base rechazaría peticiones.
- Contexto largo efectivo de hasta 262.144 tokens nativos, útil para documentos extensos o conversaciones prolongadas.
- Compatibilidad declarada con Transformers, vLLM, SGLang y KTransformers para los pesos del base; esta publicación GGUF está pensada para llama.cpp y derivados.

## Casos de uso

- Procesamiento de documentos largos: con 262.144 tokens de contexto nativo, el modelo puede ingerir contratos, informes o expedientes completos y responder preguntas sobre ellos sin fragmentación, lo que reduce la pérdida de contexto entre secciones.
- Análisis de imágenes técnicas: al ser `image-text-to-text`, permite extraer texto de capturas, interpretar diagramas o describir figuras en documentación, integrándose en pipelines de digitalización.
- Generación de código en local: la cuantización Q4_K_M (5,6 GB) permite ejecutarlo en una GPU de consumo y usarlo como asistente de código offline, sin enviar el código a servicios externos.
- Investigación sobre alineación y seguridad: la variante abliterated sirve para estudiar el efecto de la eliminación de rechazos sobre el comportamiento del modelo, comparando respuestas con el base y midiendo la degradación vía KL.
- Creación de contenido sin restricciones de filtro: para guionización, ficción o divulgación donde el modelo base rechazaría temas sensibles; conviene revisar la salida por la mayor probabilidad de contenido sesgado o inexacto.
- Despliegue en edge o estación de trabajo: al caber en GGUF Q4_K_M, puede ejecutarse con llama.cpp u Ollama en equipos sin GPU dedicada de gran capacidad, con contexto ajustable según RAM/VRAM.
- Asistencia multilingüe: con 201 idiomas declarados, es adecuado para traducción, atención al cliente o moderación en mercados con varias lenguas, aunque la calidad por idioma no está desglosada.

## Benchmarks y rendimiento

La model card del modelo base incluye una tabla comparativa con GPT-OSS-120B, GPT-OSS-20B, Qwen3-Next-80B-A3B-Thinking y Qwen3-30BA3B-Thinking-2507. El fragmento disponible solo muestra la fila de MMLU-Pro:

| Modelo | MMLU-Pro |
|---|---|
| GPT-OSS-120B | 80,8 |
| GPT-OSS-20B | 74,8 |
| Qwen3.5-9B | no disponible en el fragmento |
| Qwen3.5-4B | no disponible en el fragmento |

No se han publicado en la información disponible resultados de benchmarks del modelo abliterated frente al base más allá de las métricas de abliteration (KL 0,3980 y 0/100 rechazos). No se inventan cifras adicionales.

## Requisitos de hardware

- VRAM estimada para esta cuantización Q4_K_M: aproximadamente 5,6 GB de pesos, más overhead de contexto KV; con 8 GB de VRAM se puede ejecutar con contexto moderado.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para uso en consumo; A100 o H100 si se requiere contexto largo (262K) o mayor throughput.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM para Q4_K_M; para contexto muy largo se necesita más memoria o técnicas de offloading.
- Opciones de despliegue: llama.cpp, Ollama y otros runtimes GGUF; los pesos del base son compatibles con Transformers, vLLM, SGLang y KTransformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-uncensored-zero (esta ficha) | ~9B | 262.144 (ext. 1.010.000) | Apache 2.0 | GGUF Q4_K_M | Abliterated, 0/100 rechazos, KL 0,3980 |
| Qwen3.5-9B (base) | ~9B | 262.144 (ext. 1.010.000) | Apache 2.0 | Safetensors | Modelo original con alineación de seguridad |
| Qwen3.5-4B | ~4B | no disponible | Apache 2.0 | Safetensors | Versión menor de la misma familia |
| GPT-OSS-20B | ~20B | no disponible | no disponible | no disponible | MMLU-Pro 74,8 según la tabla del base |

No se dispone de datos de benchmarks del modelo abliterated frente a alternativas de su misma categoría más allá de los citados.

## Limitaciones y advertencias

- La abliteration elimina los rechazos, pero no garantiza corrección: puede aumentar la probabilidad de respuestas dañinas, sesgadas o factualmente erróneas en temas sensibles.
- La divergencia KL de 0,3980 respecto al base indica una alteración medible en la distribución de salida; puede degradar capacidades en tareas que dependían de la alineación original.
- Riesgo de alucinación inherente a los modelos de lenguaje; la pérdida de filtros puede agravar la confianza en información incorrecta.
- No se detalla la lista de idiomas ni la calidad por idioma; el soporte de 201 idiomas es una declaración del base, no una garantía uniforme.
- El contexto extensible hasta 1.010.000 tokens requiere hardware y configuraciones específicas; el rendimiento en contextos muy largos no está documentado.
- Licencia Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad legal y ética del contenido generado sin filtros.
- Esta publicación es un clon de otro repositorio (MiguelMendez101/Qwen3.5-9B-uncensored-zero); conviene verificar la procedencia y la integridad de los pesos.
- Solo se ofrece la cuantización Q4_K_M en este repositorio; para otras precisiones hay que acudir a otras publicaciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hellmans/Qwen3.5-9B-uncensored-zero.i1-Q4_K_M-GGUF
- Repositorio original clonado: https://huggingface.co/MiguelMendez101/Qwen3.5-9B-uncensored-zero
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo base (variante Base): https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Pull request de ARA: https://github.com/p-e-w/heretic/pull/211
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
