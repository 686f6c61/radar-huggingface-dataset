# mradermacher/KangalKhan-ShatteredRuby-7B-GGUF

## Resumen

KangalKhan-ShatteredRuby-7B-GGUF es la versión cuantizada en formato GGUF del modelo KangalKhan-ShatteredRuby-7B, un merge de modelos de 7.000 millones de parámetros creado por el usuario Yuma42 y cuantizado por mradermacher. El modelo original resulta de la fusión de KangalKhan-Ruby-7B-Fixed y KangalKhan-RawEmerald-7B mediante la herramienta mergekit (concretamente lazymergekit), una técnica que combina los pesos de dos modelos afinados para obtener un modelo híbrido sin necesidad de reentrenamiento. Está orientado a conversación en inglés y se distribuye bajo licencia Apache 2.0.

La relevancia de esta ficha radica en que se trata de un modelo comunitario de nicho: apenas acumula 60 descargas y ninguna interacción social, y no dispone de model card técnica detallada más allá de los metadatos de la fusión. El repositorio GGUF ofrece un abanico completo de cuantizaciones estáticas (desde Q2_K hasta f16), lo que permite desplegarlo en hardware de consumo, pero no incluye cuantizaciones ponderadas ni imatrix, según advierte el propio autor de la cuantización.

Con 7.241.748.480 parámetros reales (confirmados por los safetensors del modelo base), este modelo se sitúa en la categoría de LLM pequeños, apto para inferencia local. No obstante, la ausencia de benchmarks publicados, de especificaciones de contexto y de documentación sobre el entrenamiento limita seriamente su evaluación rigurosa para entornos de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo fusionado mediante mergekit/lazymergekit); detalles internos no disponibles |
| Parámetros totales | 7.241.748.480 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión de pesos (merge) entre KangalKhan-Ruby-7B-Fixed y KangalKhan-RawEmerald-7B, ambos modelos de 7B afinados. La fusión se realizó con mergekit en su variante lazymergekit, que combina tensores de los modelos de origen según una configuración de mezcla. No se dispone de información sobre la configuración exacta del merge (método de interpolación, pesos por capa ni tasas de mezcla), ni sobre los datos de entrenamiento de los modelos originales, el número de tokens utilizados o si hubo fases de RLHF o DPO.

Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa, atención lineal o modos de razonamiento extendido. La única información técnica verificable procede de los metadatos de la cuantización: el proceso se realizó con quantize_version 2 y output_tensor_quantised 1, y las cuantizaciones son estáticas (sin imatrix ni ponderación por importancia), lo que según el propio autor puede implicar una calidad algo inferior en los niveles bajos frente a alternativas ponderadas.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo multi-turno.
- Razonamiento general y respuesta a preguntas, heredado de los modelos base fusionados.
- Generación de código y tareas de matemáticas básicas (capacidad esperable en un modelo de 7B, aunque no documentada ni verificada con benchmarks).
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según los metadatos del modelo.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Prototipado de chatbots locales: al ser un modelo de 7B en GGUF, puede ejecutarse en un portátil con GPU de consumo para validar flujos conversacionales en inglés antes de migrar a un modelo mayor.
- Experimentación con técnicas de merge: útil para investigadores que quieran estudiar el comportamiento de fusiones de modelos 7B y comparar la calidad de las distintas cuantizaciones (Q4_K_M frente a Q8_0, por ejemplo).
- Generación de texto creativo en inglés: redacción de borradores, relatos o descripciones donde no se requiera precisión factual estricta.
- Asistente de documentación técnica en inglés: resumen y reescritura de textos, aprovechando la ventana de contexto (no documentada) para documentos de longitud moderada.
- Inferencia en entornos con recursos limitados: con la cuantización Q2_K (2,8 GB) puede desplegarse en GPUs con 4 GB de VRAM o incluso en CPU, para tareas de baja latencia y baja exigencia.
- Educación y demos: ejemplo práctico de despliegue con llama.cpp u Ollama para talleres sobre modelos open source y cuantización GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ≈ 3 GB; Q4_K_M ≈ 5 GB; Q5_K_M ≈ 5,5 GB; Q6_K ≈ 6,5 GB; Q8_0 ≈ 8 GB; f16 ≈ 15 GB (los tamaños de archivo son 2,8 / 4,5 / 5,2 / 6,0 / 7,8 / 14,6 GB respectivamente, más overhead de contexto y KV cache).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 para cuantizaciones altas; A100/H100 no son necesarias para un modelo de este tamaño.
- Cabe en GPU de consumo: sí, desde una GTX 1650 4 GB con Q2_K hasta una RTX 4090 con Q8_0 o f16.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este modelo.
- Latencia y throughput estimados: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| KangalKhan-ShatteredRuby-7B-GGUF | 7,24 B | No disponible | Apache 2.0 | GGUF | Hugging Face (60 descargas) |
| Mistral-7B-Instruct (referencia de la categoría) | 7,24 B | 32 K (v0.2) | Apache 2.0 | safetensors, GGUF | Amplia, muy documentado |
| Llama 3.1 8B Instruct | 8,03 B | 128 K | Llama 3.1 Community License | safetensors, GGUF | Amplia, con benchmarks públicos |
| Qwen2.5-7B-Instruct | 7,62 B | 32 K (128 K en Turbo) | Apache 2.0 | safetensors, GGUF | Amplia, con benchmarks públicos |

Los tres modelos de referencia cuentan con documentación técnica completa, benchmarks publicados y ecosistema de herramientas consolidado; KangalKhan-ShatteredRuby-7B carece de todos ellos, por lo que la comparación solo puede establecerse a nivel de tamaño y licencia, no de rendimiento medido.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de su calidad en MMLU, HumanEval, GSM8K ni otras tareas estándar.
- Modelo de nicho con solo 60 descargas y 0 likes: sin validación comunitaria ni informes de uso en producción.
- Idiomas: únicamente inglés; no se recomienda su uso en castellano ni en otros idiomas.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas que requieran ventanas largas.
- Riesgo de alucinación: inherente a los modelos de 7B y agravado por la falta de evaluación; no apto para tareas de alta precisión factual sin verificación.
- Cuantizaciones estáticas sin imatrix: el autor advierte que las versiones ponderadas no están disponibles, lo que puede degradar la calidad en Q2_K y Q3_K.
- Licencia Apache 2.0: permite uso comercial, pero al ser un merge de modelos cuyos orígenes y datos de entrenamiento no están documentados, conviene revisar las licencias de los modelos base antes de un despliegue comercial.
- Sin soporte documentado de tool calling ni agentes: no debe asumirse su integración en pipelines que dependan de function calling.
- Modelo fusionado sin model card técnica: no hay información sobre sesgos, composición del dataset ni procesos de alineación.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/KangalKhan-ShatteredRuby-7B-GGUF
- Modelo base (safetensors): https://huggingface.co/Yuma42/KangalKhan-ShatteredRuby-7B
- Modelo de origen 1: https://huggingface.co/Yuma42/KangalKhan-Ruby-7B-Fixed
- Modelo de origen 2: https://huggingface.co/Yuma42/KangalKhan-RawEmerald-7B
- Página de descargas del cuantizador: https://hf.tst.eu/model#KangalKhan-ShatteredRuby-7B-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
