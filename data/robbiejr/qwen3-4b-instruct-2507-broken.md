# Robbiejr/Qwen3-4B-Instruct-2507-broken

## Resumen

Robbiejr/Qwen3-4B-Instruct-2507-broken es una variante "abliterated" (decensurada) del modelo Qwen3-4B-Instruct-2507 de Alibaba Qwen, generada con la herramienta Heretic v1.4.0. El proceso de abliteration elimina selectivamente la dirección de rechazo en los pesos del modelo, de modo que este deja de negarse a responder peticiones que el modelo original rechazaría. El autor documenta los parámetros exactos del proceso, lo que permite reproducir el resultado.

El modelo base es un transformer causal de 4.022 millones de parámetros (3.6B no-embedding), 36 capas, atención GQA con 32 cabezas de consulta y 8 de clave/valor, y una ventana de contexto nativa de 262.144 tokens. Qwen3-4B-Instruct-2507 es la versión de julio de 2025 en modo no-thinking, con mejoras sustanciales en instrucciones, razonamiento, matemáticas, código y uso de herramientas respecto a la versión anterior.

La relevancia de esta ficha radica en dos aspectos: por un lado, documenta una técnica de modificación de pesos (abliteration) cada vez más extendida en la comunidad open source; por otro, advierte de que el nombre del repositorio incluye el sufijo "broken", lo que sugiere que el autor considera el resultado defectuoso o inestable. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only) con GQA |
| Parámetros totales | 4.022.468.096 (4.0B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantización | No disponible en la información proporcionada (pesos en safetensors; el modelo base admite cuantizaciones estándar GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible en la model card de esta variante; el modelo base declara cobertura multilingüe amplia (multi-idioma, sin listado cerrado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Capas | 36 |
| Cabezas de atención | 32 Q / 8 KV (GQA) |
| Pipeline | text-generation |
| Librería | transformers (>= 4.51.0) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Instruct-2507: un transformer decoder-only denso de 36 capas con atención de consultas agrupadas (GQA), 32 cabezas de consulta y 8 de clave/valor, y 4.0B parámetros totales (3.6B sin embeddings). El modelo base fue entrenado en dos fases (pretraining y post-training) por el equipo Qwen de Alibaba, e incorpora mejoras en cobertura de conocimiento long-tail multilingüe y alineación con preferencias subjetivas. No se especifica en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

La modificación de esta variante es una abliteration aplicada con Heretic v1.4.0. El proceso identifica una dirección de rechazo (direction_index 18.98) y ajusta los pesos de las proyecciones `attn.o_proj` y `mlp.down_proj` con ventanas de peso y distancia documentadas en la model card (por ejemplo, `attn.o_proj.max_weight` 1.49 en posición 29.63, `mlp.down_proj.min_weight` 0.15 a distancia 11.96). El resultado reportado es una divergencia KL de 0.0428 respecto al original y una reducción de rechazos de 100/100 a 5/100 en el conjunto de evaluación del autor. El repositorio incluye un directorio `reproduce` con instrucciones para repetir el proceso.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento lógico y matemático (el modelo base reporta mejoras notables en AIME25, HMMT25 y ZebraLogic).
- Generación y comprensión de código en múltiples lenguajes.
- Comprensión de contexto largo: ventana nativa de 262.144 tokens.
- Uso de herramientas y function calling (el base reporta BFCL-v3 y TAU).
- Capacidades de agente y razonamiento multi-paso (el base reporta TAU1/TAU2).
- Capacidades multilingües heredadas del modelo base.
- Modo no-thinking exclusivamente: no genera bloques `<think></think>`.
- Respuestas a peticiones que el modelo original rechazaría (comportamiento decensurado), con 5/100 rechazos reportados frente a 100/100 del original.

## Casos de uso

- Investigación sobre alineación y seguridad: permite estudiar empíricamente el efecto de la abliteration comparando las respuestas de esta variante con las del Qwen3-4B-Instruct-2507 original en el mismo conjunto de prompts, gracias a los parámetros de reproducción documentados.
- Generación de contenido creativo sin restricciones de rechazo: escritura de ficción, guiones o narrativa con temáticas sensibles donde el modelo original se negaría, usando la ventana de 262K tokens para mantener coherencia en textos largos.
- Análisis de sesgos y robustez: evaluar cómo cambia la distribución de respuestas (KL 0.0428) tras eliminar la dirección de rechazo, útil para equipos que auditan técnicas de modificación de pesos.
- Experimentación académica con contextos largos: procesar documentos extensos (hasta 262K tokens) en tareas de resumen o extracción donde se requiere evitar rechazos por contenido sensible.
- Prototipado de asistentes conversacionales en entornos controlados: desplegar un chatbot de 4B parámetros en hardware de consumo para pruebas internas, aceptando el riesgo de respuestas no filtradas.
- Reproducción de pipelines de abliteration: usar el directorio `reproduce` como referencia para aplicar Heretic v1.4.0 a otros modelos Qwen3 y validar la metodología.

## Benchmarks y rendimiento

Los datos de benchmarks publicados corresponden al modelo base Qwen3-4B-Instruct-2507, no a esta variante abliterated. La model card de la variante solo reporta métricas del proceso de abliteration.

| Métrica | Esta variante | Qwen3-4B-Instruct-2507 (original) |
|---|---|---|
| Divergencia KL | 0.0428 | 0 (por definición) |
| Rechazos | 5/100 | 100/100 |

Rendimiento del modelo base (referencia, no de esta variante):

| Benchmark | GPT-4.1-nano | Qwen3-4B Non-Thinking | Qwen3-4B-Instruct-2507 |
|---|---|---|---|
| MMLU-Pro | 62.8 | 58.0 | 69.6 |
| MMLU-Redux | 80.2 | 77.3 | 84.2 |
| GPQA | 50.3 | 41.7 | 62.0 |
| SuperGPQA | 32.2 | 32.0 | 42.8 |
| AIME25 | 22.7 | 19.1 | 47.4 |
| HMMT25 | 9.7 | 12.1 | 31.0 |
| ZebraLogic | 14.8 | 35.2 | 80.2 |
| LiveBench 20241125 | 41.5 | 48.4 | 63.0 |
| LiveCodeBench v6 | 31.5 | 26.4 | 35.1 |
| MultiPL-E | 76.3 | 66.6 | 76.8 |
| Aider-Polyglot | 9.8 | 13.8 | 12.9 |
| IFEval | 74.5 | 81.2 | 83.4 |
| Arena-Hard v2 | 15.9 | 9.5 | 43.4 |
| Creative Writing v3 | 72.7 | 53.6 | 83.5 |
| WritingBench | 66.9 | 68.5 | 83.4 |
| BFCL-v3 | 53.0 | 57.6 | 61.9 |
| TAU1-Retail | 23.5 | 24.3 | 48.7 |
| TAU1-Airline | 14.0 | 16.0 | 32.0 |
| TAU2-Retail | - | 28.1 | 40.4 |
| TAU2-Airline | - | 12.0 | 24.0 |
| TAU2-Telecom | - | 17.5 | 13.2 |
| MultiIF | 60.7 | 61.3 | 69.0 |
| MMLU-ProX | 56.2 | 49.6 | 61.6 |
| INCLUDE | 58.6 | 53.8 | 60.1 |
| PolyMATH | 15.6 | 16.6 | 31.1 |

No se han publicado resultados de benchmarks de esta variante abliterated en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda 12-16 GB.
- Cuantización a 8 bits: aproximadamente 4-5 GB de pesos; a 4 bits: aproximadamente 2,5-3 GB, lo que permite ejecución en GPUs de consumo.
- GPUs recomendadas: A100, H100 o L40S para despliegue en producción con contexto largo; RTX 4090 (24 GB) para fp16 con contexto moderado; RTX 3090/4080 (16 GB) con cuantización.
- Cabe en GPUs de consumo: sí, con cuantización GGUF/AWQ en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) para contextos reducidos.
- Opciones de despliegue: transformers (>= 4.51.0), vLLM, SGLang (>= 0.4.6, recomendado por el modelo base), llama.cpp/Ollama con conversión a GGUF, TGI.
- Latencia y throughput: no disponibles en la información proporcionada. El tamaño de 4B y la GQA (8 cabezas KV) favorecen un throughput razonable en una sola GPU, pero no se aportan cifras medidas para esta variante.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Robbiejr/Qwen3-4B-Instruct-2507-broken | 4.0B | 262.144 | Apache 2.0 | Variante abliterated; sufijo "broken" en el nombre; 106 descargas, 0 likes |
| Qwen/Qwen3-4B-Instruct-2507 | 4.0B | 262.144 | Apache 2.0 | Modelo base oficial, alineado, con benchmarks publicados |
| Qwen3-4B Non-Thinking (versión previa) | 4.0B | 32.768 (versión previa) | Apache 2.0 | Peor rendimiento en MMLU-Pro (58.0 vs 69.6) y AIME25 (19.1 vs 47.4) |
| GPT-4.1-nano | No disponible | No disponible | Propietaria | Referencia de comparación usada por Qwen; peor en MMLU-Pro (62.8 vs 69.6) y GPQA (50.3 vs 62.0) |

No se dispone de datos de benchmarks de esta variante que permitan una comparación de rendimiento directa con alternativas abliterated de la comunidad.

## Limitaciones y advertencias

- El repositorio se llama "broken": el propio autor sugiere que el resultado puede estar defectuoso o inestable; no hay documentación adicional sobre el alcance del problema.
- La abliteration elimina la dirección de rechazo pero no garantiza la eliminación de contenido dañino; el modelo puede generar respuestas inapropiadas, ilegales o peligrosas.
- La divergencia KL de 0.0428 indica una desviación medible respecto al original, con posible degradación en tareas que dependían del comportamiento alineado.
- Riesgo de alucinación inherente a un modelo de 4B parámetros; la abliteration puede agravar la confianza en respuestas incorrectas.
- Solo modo no-thinking: no genera bloques de razonamiento explícito, lo que limita tareas que se benefician de cadena de pensamiento.
- Idiomas soportados no documentados en esta variante; se heredan del base pero sin verificación específica.
- Licencia Apache 2.0 permite uso comercial, pero el despliegue de un modelo decensurado en producción conlleva responsabilidad legal y reputacional; se recomienda filtrado externo.
- Sin datos de benchmarks propios: no se puede afirmar que conserve las capacidades del base más allá de la métrica de rechazos del autor.
- Repositorio con 0 likes y 106 descargas: baja validación comunitaria; no hay evidencia de pruebas independientes.
- Requiere transformers >= 4.51.0; versiones anteriores fallan con `KeyError: 'qwen3'`.

## Enlaces

- HuggingFace: https://huggingface.co/Robbiejr/Qwen3-4B-Instruct-2507-broken
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Licencia del base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507/blob/main/LICENSE
- Heretic: https://heretic-project.org
- Blog Qwen3: https://qwenlm.github.io/blog/qwen3/
- GitHub Qwen3: https://github.com/QwenLM/Qwen3
- Documentación Qwen: https://qwen.readthedocs.io/en/latest/
- Chat Qwen: https://chat.qwen.ai
- Paper referenciado (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
