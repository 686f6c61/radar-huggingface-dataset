# furiosa-ai/EXAONE-4.5-33B-FP8

## Resumen

EXAONE 4.5 es el primer modelo de lenguaje multimodal (visión y texto) de código abierto desarrollado por LG AI Research. Esta versión concreta, publicada por Furiosa AI, es una cuantización en FP8 del modelo original de 33B parámetros, lo que reduce el peso a aproximadamente 41 GB y permite su despliegue en hardware con menor capacidad de memoria. El modelo integra un encoder visual de 1.29B parámetros sobre la arquitectura del EXAONE 4.0, ampliando sus capacidades hacia la comprensión de imágenes y documentos.

Con una ventana de contexto de 262.144 tokens, una arquitectura de atención híbrida (sliding window y global) y soporte para seis idiomas (inglés, coreano, español, alemán, japonés y vietnamita), EXAONE 4.5 se posiciona como una opción competitiva frente a modelos como Qwen3-VL 32B o Qwen3.5 27B, especialmente en tareas de comprensión de documentos y razonamiento contextual en coreano. La cuantización FP8 mantiene la compatibilidad con el ecosistema Transformers y está disponible en formato safetensors, con versiones GGUF adicionales generadas por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model + Vision Encoder (atención híbrida: 3 sliding window + 1 global por bloque, MTP, reordered norm, NoPE en atención global) |
| Parametros totales | 34.350.097.664 (31.7B del modelo de lenguaje + 1.29B del encoder visual) |
| Parametros activos | 34.350.097.664 (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | FP8 (esta versión); el modelo original está disponible en BF16 y la comunidad ha generado versiones GGUF |
| Idiomas soportados | en, ko, es, de, ja, vi |
| Licencia | exaone (licencia propia de LG AI Research) |
| Formato de pesos | safetensors (FP8); también disponible en GGUF |

## Arquitectura y entrenamiento

EXAONE 4.5 emplea una arquitectura de transformer causal con un encoder visual dedicado. El modelo de lenguaje tiene 64 capas principales más una capa MTP (Multi-Token Prediction), con un patrón de atención híbrida: cada bloque de 4 capas contiene 3 capas con sliding window attention (ventana de 4.096 tokens) y 1 capa con atención global sin positional embeddings (NoPE). Esta combinación reduce el coste computacional en contextos largos manteniendo la capacidad de atender a información lejana. El encoder visual utiliza Grouped Query Attention (GQA) y 2D RoPE para las embeddings de imagen.

El modelo fue entrenado por LG AI Research sobre datos multilingües y multimodales, con un corte de conocimiento en diciembre de 2024. No se han publicado detalles específicos sobre el tamaño del dataset, la composición exacta de los datos de entrenamiento ni el uso de técnicas de alineación como RLHF o DPO en la información disponible. La cuantización FP8 de Furiosa AI se realizó sobre el modelo base sin reentrenamiento, preservando las capacidades originales con una degradación mínima esperada.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa imágenes y texto de forma conjunta, respondiendo a preguntas sobre contenido visual.
- Comprensión de documentos: extrae información de documentos escaneados, tablas y gráficos, con un rendimiento destacado en benchmarks de comprensión documental.
- Razonamiento contextual en coreano: hereda las capacidades lingüísticas de los modelos EXAONE anteriores, con especial fortaleza en tareas que requieren comprensión del contexto cultural y lingüístico coreano.
- Razonamiento matemático y STEM: resuelve problemas de matemáticas visuales (MathVision, MathVista) y preguntas de nivel experto en dominios como medicina (MedXpertQA-MM).
- Multilingüismo: soporta seis idiomas, aunque el coreano y el inglés son los mejor optimizados.
- Contexto largo: ventana de 262.144 tokens, adecuada para procesar documentos extensos o conversaciones multi-turno con historial amplio.
- No se ha confirmado soporte explícito para tool calling, function calling o modos de agente en la información disponible.

## Casos de uso

- Análisis de documentos técnicos y científicos: el modelo puede procesar imágenes de páginas, tablas y figuras, extrayendo datos y respondiendo preguntas sobre su contenido. Su contexto de 262k tokens permite analizar documentos completos de varias páginas en una sola pasada.
- Asistencia en atención al cliente multilingüe: con soporte para seis idiomas y capacidad de entender capturas de pantalla o imágenes de productos, puede gestionar consultas de usuarios que incluyan material visual, manteniendo conversaciones largas gracias a su amplia ventana de contexto.
- Generación de descripciones y subtitulado de imágenes: útil para plataformas de contenido, accesibilidad o catalogación automática de imágenes en entornos empresariales.
- Razonamiento matemático asistido por visión: puede resolver problemas que requieren interpretar gráficos, diagramas o expresiones escritas a mano, aplicable en educación o ingeniería.
- Procesamiento de facturas y formularios: su capacidad de comprensión documental permite extraer campos clave de imágenes de facturas, recibos o formularios escaneados, integrándose en flujos de automatización de procesos.
- Investigación en visión por computador: como modelo de referencia de código abierto, sirve para evaluar técnicas de cuantización, fine-tuning multimodal o generación de datos sintéticos en entornos de investigación.

## Benchmarks y rendimiento

Los siguientes resultados corresponden al modelo original EXAONE 4.5 en BF16, publicados por LG AI Research. No se dispone de benchmarks específicos para la versión cuantizada en FP8, aunque se espera una degradación mínima. Los datos se comparan con modelos de tamaño similar.

| Benchmark | EXAONE 4.5 33B (Reasoning) | Qwen3-VL 32B Thinking | Qwen3.5 27B (Reasoning) | GPT-5 mini (Reasoning: high) |
|---|---|---|---|---|
| MMMU | 78.7 | 78.1 | 82.3 | 79.0 |
| MMMU-Pro | 68.6 | 68.1 | 75.0 | 67.3 |
| MedXpertQA-MM | 42.1 | 41.6 | 62.4 | 34.4 |
| MathVision | 75.2 | 70.2 | 86.0 | 71.9 |
| MathVista (mini) | 85.0 | 85.9 | 87.8 | 79.1 |
| WeMath | 79.1 | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks de texto puro (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo en FP8 ocupa aproximadamente 34.35 GB de pesos, más overhead de activaciones y KV cache. Con contexto moderado (8k tokens), se necesitan al menos 40-45 GB de VRAM. Para contexto máximo (262k tokens), la KV cache puede superar los 60 GB adicionales, requiriendo más de 100 GB en total.
- GPU recomendadas: A100 80GB, H100 80GB, o GPUs con 80 GB o más de memoria. No cabe en GPUs de consumo como RTX 4090 (24 GB) ni RTX 3090 (24 GB).
- Opciones de despliegue: compatible con vLLM, TGI y Transformers. Para versiones GGUF, se puede usar llama.cpp u Ollama, aunque con limitaciones de contexto.
- Latencia y throughput: no se dispone de datos medidos para esta cuantización. En una A100 80GB, se espera una generación de aproximadamente 20-40 tokens por segundo para modelos de 33B en FP8, dependiendo de la implementación y el contexto.

## Comparativa con modelos similares

| Modelo | Params totales | Contexto | Licencia | Formato | Idiomas |
|---|---|---|---|---|---|
| EXAONE 4.5 33B (FP8) | 34.35B | 262.144 | exaone | safetensors, GGUF | en, ko, es, de, ja, vi |
| Qwen3-VL 32B | 33B | 262.144 | Apache 2.0 | safetensors, GGUF | multilingüe (amplio) |
| Qwen3.5 27B | 27B | 262.144 | Apache 2.0 | safetensors, GGUF | multilingüe (amplio) |

EXAONE 4.5 compite directamente con Qwen3-VL 32B en tareas de visión-lenguaje. En los benchmarks disponibles, EXAONE supera a Qwen3-VL en MMMU y MathVision, pero queda por detrás en MathVista y MMMU-Pro. Qwen3.5 27B muestra un rendimiento superior en la mayoría de las tareas, aunque es un modelo más reciente. La licencia exaone de LG es más restrictiva que Apache 2.0, lo que puede limitar su uso comercial en algunos escenarios.

## Limitaciones y advertencias

- Sesgos culturales: al ser desarrollado por LG AI Research, el modelo puede tener un sesgo hacia el contexto coreano, especialmente en tareas de razonamiento contextual. No se han publicado evaluaciones de sesgo para otros idiomas.
- Riesgo de alucinación: como todo modelo generativo, puede producir respuestas incorrectas o inventadas, especialmente en tareas visuales complejas o con imágenes ambiguas.
- Limitaciones de idioma: solo soporta seis idiomas; el rendimiento en español, alemán, japonés y vietnamita puede ser inferior al de inglés y coreano.
- Restricciones de licencia: la licencia exaone no es de código abierto estándar; es necesario revisar sus términos para uso comercial, especialmente en aplicaciones de alto riesgo o despliegues a gran escala.
- Cuantización FP8: aunque la degradación suele ser mínima, no se han publicado evaluaciones específicas de esta versión cuantizada. En tareas de precisión numérica o razonamiento matemático, podría haber diferencias frente al modelo BF16.
- Contexto largo: aunque la ventana es de 262k tokens, el uso de atención sliding window puede degradar la capacidad de atender a información distante en comparación con atención global completa. Además, el coste de memoria de la KV cache limita el contexto práctico en hardware disponible.

## Enlaces

- Modelo en HuggingFace (Furiosa AI): https://huggingface.co/furiosa-ai/EXAONE-4.5-33B-FP8
- Modelo original en HuggingFace (LG AI): https://huggingface.co/LGAI-EXAONE/EXAONE-4.5-33B
- Repositorio GitHub: https://github.com/LG-AI-EXAONE/EXAONE-4.5
- Blog de LG AI Research: https://www.lgresearch.ai/blog/view?seq=641
- Paper técnico (arXiv): http://arxiv.org/abs/2604.08644
- Página de GGUF (comunidad): https://local-ai-zone.github.io/models/exaone-4-5-33b.html
