# samyhaff/qwen3-4b-distill-ed

## Resumen

qwen3-4b-distill-ed es un modelo de desambiguación de entidades (entity disambiguation, ED) derivado de Qwen/Qwen3-4B mediante ajuste fino con LoRA fusionado y destilación off-policy (GKD, λ=0, β=0) a partir de Qwen3-30B-A3B sobre el conjunto de datos ZELDA. Lo desarrolla Samy Haffoudhi (usuario samyhaff) y se presenta en el artículo "When Does Reasoning Help Entity Disambiguation? Small LLMs In-Domain and Under Shift", aceptado en Findings de EACL 2027.

El modelo resuelve una tarea concreta: dado un texto con una mención marcada entre corchetes y una lista corta de candidatos numerados con descripciones, el modelo razona y devuelve el índice del candidato correcto en el campo `"answer"`. No es un modelo de propósito general, sino un componente especializado dentro de un pipeline de entity linking (en el artículo, los candidatos provienen del top 10 de qwen3-4b-reranker-ed).

Es relevante porque demuestra que un modelo pequeño de 4.000 millones de parámetros, entrenado por destilación desde un MoE de 30B, puede alcanzar resultados competitivos en ED: 79,0 de precisión en ZELDA y 80,9 de precisión normalizada en ZESHEL en régimen de zero-shot verdadero. La licencia Apache 2.0 y su tamaño lo hacen desplegable en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino con LoRA fusionado sobre Qwen/Qwen3-4B |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B, un transformer decoder-only denso de 4.000 millones de parámetros, y se entrena mediante LoRA que posteriormente se fusiona en los pesos base. El método de entrenamiento es destilación off-policy con GKD (Generalized Knowledge Distillation) configurada con λ=0 y β=0, tomando como profesor a Qwen3-30B-A3B (un modelo MoE de 30B con 3B activos). El conjunto de datos de entrenamiento es ZELDA.

La innovación principal no está en la arquitectura, sino en el enfoque: se induce un modo de razonamiento (thinking mode) en un modelo pequeño mediante destilación desde un modelo mayor, y se evalúa si ese razonamiento aporta ventajas reales en ED tanto en dominio como bajo distribución desplazada (shift). El prompt esperado marca la mención con `[` y `]` y numera los candidatos; el modelo razona y termina con `"answer": <índice>`. La inferencia recomendada es muestrear 10 completaciones y aplicar voto por mayoría.

## Capacidades

- Desambiguación de entidades: selecciona el candidato correcto de una lista corta numerada dado un texto con la mención marcada.
- Razonamiento explícito (thinking mode) antes de emitir la respuesta final, activable con `enable_thinking=True` en el chat template.
- Generación de texto conversacional en formato chat (roles system/user).
- Salida estructurada en el campo `"answer": <índice>`, parseable con expresiones regulares.
- Capacidades multilingües: no documentadas para este ajuste específico.
- Tool calling / function calling: no documentado.
- Soporte de agentes y multi-step reasoning: no documentado más allá del razonamiento interno de la tarea ED.
- Visión y audio: no soportados.

## Casos de uso

- Entity linking en pipelines de extracción de conocimiento: el modelo actúa como etapa de desambiguación tras un recuperador de candidatos (por ejemplo, el top 10 de qwen3-4b-reranker-ed), resolviendo menciones ambiguas contra una base de entidades.
- Enriquecimiento de noticias y artículos: dado un texto periodístico con menciones a personas, lugares u organizaciones, el modelo identifica la entidad correcta usando el contexto completo de la narración.
- Construcción de grafos de conocimiento: integración en procesos de resolución de entidades para consolidar menciones dispersas en un corpus en nodos únicos del grafo.
- Búsqueda semántica y motores de respuesta: desambiguar consultas de usuario ("Jordan" como país, persona o río) antes de recuperar documentos o generar respuestas.
- Procesamiento de documentación empresarial: normalización de nombres de clientes, proveedores o productos en registros internos con candidatos procedentes de un catálogo maestro.
- Investigación en NLP: reproducción y extensión de los experimentos del artículo sobre cuándo el razonamiento ayuda en ED, con un modelo pequeño desplegable en una sola GPU.
- Moderación y análisis de contenido: resolución de entidades en textos generados por usuarios para análisis temático o de sentimiento a nivel de entidad.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| ZELDA | Precisión (acc.) | 79,0 |
| ZESHEL (zero-shot verdadero) | Precisión normalizada (norm. acc.) | 80,9 |

No se han publicado en la información disponible resultados adicionales (MMLU, HumanEval, GSM8K u otros) ni comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 8 GB solo para pesos, más overhead de KV cache y activaciones (el repositorio ocupa 8,1 GB).
- VRAM estimada en cuantización de 8 bits: en torno a 4-5 GB; en 4 bits, en torno a 2,5-3 GB (estimaciones a partir del número de parámetros; no se publican variantes GGUF oficiales).
- GPU recomendadas: A100, H100 o L40S para producción con vLLM; RTX 4090, RTX 3090 o superiores para desarrollo.
- Cabe en GPU de consumo: sí, en tarjetas con 12-16 GB o más en fp16, y en tarjetas de 8 GB con cuantización.
- Opciones de despliegue: vLLM (el ejemplo de la model card lo usa), transformers con text-generation-inference; llama.cpp u Ollama requerirían conversión a GGUF no publicada por el autor.
- Latencia y throughput: no disponibles. El patrón recomendado de 10 muestras con voto por mayoría multiplica el coste de inferencia por diez respecto a una única generación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| qwen3-4b-distill-ed | 4,02B | No disponible | Entity disambiguation con razonamiento | Apache 2.0 |
| Qwen/Qwen3-4B (base) | 4,02B | No disponible | Propósito general | Apache 2.0 |
| qwen3-4b-reranker-ed | No disponible | No disponible | Reranking de candidatos para ED | No disponible |
| Qwen3-30B-A3B (profesor) | 30B (3B activos) | No disponible | Propósito general | No disponible |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado: fuera de la tarea de desambiguación de entidades con el formato de prompt esperado, su comportamiento no está validado.
- Depende del formato exacto del prompt (mención entre `[` `]`, candidatos numerados, instrucción de sistema); desviarse de él puede degradar la precisión.
- El parsing de la respuesta asume el patrón `"answer": <índice>`; respuestas mal formadas deben descartarse, lo que puede reducir el número de votos válidos.
- El voto por mayoría sobre 10 muestras multiplica el coste computacional y añade latencia.
- Riesgo de alucinación: el modelo podría emitir un índice fuera del rango de candidatos o razonar sobre descripciones incorrectas; el código de ejemplo filtra índices inválidos.
- Sesgos: no documentados por el autor; al derivar de Qwen3-4B, puede heredar sesgos del modelo base y de ZELDA.
- Idiomas: no se documenta el soporte multilingüe de este ajuste; la evaluación se limita a ZELDA y ZESHEL.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-4B y de los datos ZELDA.
- Solo 368 descargas y 1 like en el momento de la consulta: ecosistema pequeño, poca validación externa.
- No se publican variantes cuantizadas oficiales, lo que limita el despliegue en entornos con poca VRAM sin trabajo adicional de conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/samyhaff/qwen3-4b-distill-ed
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Reranker asociado: https://huggingface.co/samyhaff/qwen3-4b-reranker-ed
- Artículo: https://arxiv.org/abs/2611.30334
- Repositorio con pipeline y evaluación: https://github.com/samyhaff/ed-study
