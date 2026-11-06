# jwcwn/zl-lite-body-3

## Resumen

Decision-1.0-Eos-0.8B es un modelo de decisión (decision foundation model) desarrollado por el usuario jwcwn y publicado bajo el identificador `jwcwn/zl-lite-body-3`. No es un modelo generativo de texto al uso: se trata de un fine-tuning del backbone Qwen3.5-0.8B al que se le ha acoplado una cabeza de decisión (decision head) que devuelve distribuciones de probabilidad sobre opciones, condiciones o niveles ordenados definidos en tiempo de inferencia. El modelo resuelve el problema de convertir contexto no estructurado en decisiones medibles: elección entre categorías, probabilidad de que una condición sea cierta y puntuaciones sobre escalas ordinales.

Arquitectónicamente es un decoder híbrido de 24 capas que combina atención lineal con compuertas (gated linear attention) y atención completa, con 852.985.920 parámetros totales en formato safetensors (1,7 GB de repositorio). La ventana de contexto está limitada a 16.384 tokens por pregunta, incluyendo el estado y los candidatos, y el modelo no trunca: si se excede, devuelve un error `max_length_exceeded`.

Su relevancia actual radica en que propone un paradigma distinto al de los LLM generativos para tareas de enrutamiento, clasificación zero-shot y scoring: en lugar de generar texto y parsearlo, produce directamente una distribución calibrada en un único forward pass por lote de preguntas, lo que simplifica el despliegue en pipelines de decisión y reduce la latencia frente a la decodificación autoregresiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder híbrido (24 capas; gated linear attention + full attention) con decision head compartida |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens por pregunta (estado + candidatos); sin truncado, error si se excede |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; backbone en BF16 en GPU y FP32 en CPU, cabeza de decisión en FP32) |
| Idiomas soportados | no disponible (el tag `multilingual` aparece en la model card, sin lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con código de carga para Transformers y `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B como backbone y añade una cabeza de decisión compartida que lee los endpoints candidatos contra una representación global de la consulta y puntúa todos los candidatos en un único forward pass por lote de preguntas. El decoder es híbrido: 24 capas que alternan atención lineal con compuertas y atención completa, lo que reduce el coste computacional en secuencias largas. La inferencia en GPU ejecuta el backbone en BF16 y la cabeza en FP32; en CPU todo va en FP32. El repositorio incluye código de carga propio y una temperatura calibrada registrada en `config.json`.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card menciona una evaluación sobre un benchmark de regresión observada de 54 tareas con 3.766 preguntas puntuadas, pero no detalla el proceso de entrenamiento ni los datos utilizados. Tampoco se documenta ninguna innovación de decodificación especulativa; la única optimización mencionada es el uso de `flash-linear-attention` para acelerar las capas de atención lineal en GPU.

## Capacidades

- Clasificación zero-shot mediante elección entre categorías definidas en tiempo de ejecución (`type: choice`), devolviendo una distribución sobre las acciones o categorías nombradas.
- Evaluación de condiciones booleanas (`type: noul`), devolviendo la probabilidad de que una condición sea verdadera.
- Puntuación ordinal (`type: score`), devolviendo una distribución sobre niveles ordenados y la puntuación esperada.
- Procesamiento de múltiples preguntas sobre un mismo contexto en una sola petición.
- Aplicación del mismo conjunto de preguntas a un lote de contextos distintos.
- Soporte multilingüe declarado mediante el tag `multilingual` (sin lista explícita de idiomas).
- Integración con Transformers mediante `AutoModel.from_pretrained(..., trust_remote_code=True)` y con `pipeline("decision", ...)`.
- Servicio mediante el runtime vLLM Semantic Router con endpoint `/v1/systemone`.
- No genera texto libre: la salida es siempre estructurada (distribuciones y puntuaciones), lo que elimina la necesidad de parsear respuestas generadas.
- Manejo explícito de errores: `invalid_question` para preguntas mal formadas y `max_length_exceeded` cuando se supera el límite de 16.384 tokens.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket como `state` y un conjunto de criterios (facturación, entregas, técnico) como pregunta de tipo `choice`, devolviendo la distribución de probabilidad por equipo. Es adecuado porque la decisión se obtiene en un único forward pass y la salida es directamente consumible por un sistema de asignación.
- Triaje de urgencia: con una pregunta de tipo `score` sobre niveles ordenados ("no urgente", "pronto", "hoy", "inmediato"), se obtiene la puntuación esperada para priorizar colas de atención. La naturaleza ordinal del scoring encaja con SLAs definidos por niveles.
- Moderación de contenido con criterios configurables: se define una condición (`noul`) como "el mensaje contiene lenguaje de acoso" y se obtiene la probabilidad para aplicar umbrales ajustables sin reentrenar el modelo.
- Clasificación por lotes de documentos: la misma batería de preguntas se aplica a varios contextos en una sola petición, lo que permite etiquetar corpus de forma consistente y con coste predecible.
- Extracción de señales para sistemas de ranking: combinar varias preguntas de tipo `score` sobre un mismo contexto permite construir vectores de características numéricas que alimenten un modelo de ranking posterior.
- Evaluación de políticas de decisión en investigación: al devolver distribuciones calibradas en lugar de texto, el modelo sirve para medir la incertidumbre de un clasificador zero-shot y comparar políticas de enrutamiento con métricas de probabilidad.
- Filtrado previo en pipelines RAG: decidir si una consulta requiere recuperación externa o puede responderse con conocimiento interno, usando una pregunta `noul` sobre el contexto de la conversación.

## Benchmarks y rendimiento

Los datos provienen de la model card del autor y corresponden a un benchmark propio de 54 tareas con 3.766 preguntas puntuadas. La ponderación global es 30% / 25% / 15% / 15% / 15% sobre las cinco dimensiones.

| Modelo | Overall ↑ | Decisions | Composition | Reading | Inference | Transfer |
|---|---:|---:|---:|---:|---:|---:|
| Eos · 0.8B | 61,89 | 65,94 | 46,04 | 70,31 | 81,67 | 52,01 |
| Kev · 0.8B | 58,28 | 60,14 | 42,29 | 67,81 | 68,75 | 61,19 |
| Qwen3.5 · 2B | 57,24 | 57,12 | 39,00 | 73,75 | 72,29 | 56,31 |
| Laya English | 51,03 | 56,54 | 35,33 | 51,41 | 63,75 | 53,06 |
| Laya Multilingual | 47,19 | 47,25 | 38,92 | 50,78 | 57,29 | 47,13 |

El autor advierte que se trata de un benchmark de regresión observada y que el liderazgo global no implica victoria en cada tarea individual. No se han publicado resultados en la información disponible para benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852.985.920 parámetros, en BF16 el backbone requiere aproximadamente 1,7 GB de pesos; la cabeza de decisión en FP32 añade una cantidad no especificada. En FP32 completo en CPU, el modelo ocupa alrededor de 3,4 GB de memoria.
- GPU recomendadas: no se especifican modelos concretos. El autor indica que los pesos no dependen de un acelerador particular y que el hardware capaz de servirlos lo decide el runtime.
- Compatibilidad con GPU de consumo: por tamaño, el modelo cabe holgadamente en cualquier GPU consumer con 8 GB o más de VRAM (RTX 3060, 4060, 4090, etc.), aunque no se documenta un perfil de rendimiento específico.
- Opciones de despliegue: runtime vLLM Semantic Router (endpoint `/v1/systemone`), Transformers con `trust_remote_code=True` y `pipeline("decision", ...)`. No se menciona soporte para llama.cpp, Ollama ni TGI.
- Aceleración: `flash-linear-attention` para las capas de atención lineal en GPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Overall (benchmark del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Decision-1.0-Eos-0.8B | 852.985.920 | 16.384 tokens | 61,89 | Apache 2.0 | Hugging Face |
| Kev · 0.8B | no disponible | no disponible | 58,28 | no disponible | no disponible |
| Qwen3.5 · 2B | no disponible (2B nominal) | no disponible | 57,24 | no disponible | no disponible |
| Laya English | no disponible | no disponible | 51,03 | no disponible | no disponible |
| Laya Multilingual | no disponible | no disponible | 47,19 | no disponible | no disponible |

Los modelos de referencia aparecen únicamente en la tabla de benchmarks de la model card; no se dispone de sus especificaciones técnicas ni de enlaces a sus repositorios en la información proporcionada.

## Limitaciones y advertencias

- El modelo no genera texto: cualquier caso de uso que requiera respuestas en lenguaje natural necesita un modelo generativo adicional.
- Límite estricto de 16.384 tokens por pregunta (estado más candidatos); al superarlo se devuelve `max_length_exceeded` y no se trunca, por lo que la petición falla por completo.
- El benchmark de 54 tareas es propio del autor y de tipo "regresión observada"; no es directamente comparable con evaluaciones estándar de la comunidad.
- No se documentan sesgos conocidos ni composición del dataset de entrenamiento, lo que dificulta evaluar riesgos de sesgo en las decisiones.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí riesgo de calibración deficiente en las distribuciones de probabilidad si el dominio de uso difiere del de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende del runtime vLLM Semantic Router para el endpoint `/v1/systemone`; el repositorio no incluye servicio, solo artefactos y código de carga.
- El identificador de Hugging Face (`jwcwn/zl-lite-body-3`) no coincide con el nombre comercial del modelo en la model card (`vllm-sr/Decision-1.0-Eos-0.8B`), lo que puede generar confusión en la trazabilidad de artefactos.
- Requiere `transformers>=5.17` y `trust_remote_code=True`, lo que implica ejecutar código del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jwcwn/zl-lite-body-3
- Colección Decision 1.0: https://huggingface.co/collections/vllm-sr/decision-10-6ab12177bd0002394d8409f9
- Documentación de arquitectura: https://huggingface.co/jwcwn/zl-lite-body-3/blob/main/ARCHITECTURE.md
- Benchmark completo: https://huggingface.co/jwcwn/zl-lite-body-3/blob/main/evaluation/BENCHMARK.md
- Runtime vLLM Semantic Router: https://github.com/vllm-project/semantic-router
- flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
