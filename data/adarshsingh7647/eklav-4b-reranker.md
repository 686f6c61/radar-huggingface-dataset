# AdarshSingh7647/Eklav-4B-Reranker

## Resumen

Eklav-4B-Reranker (publicado en la model card como Eklav-Passage-4B) es un modelo de reranking de pasajes en modo pointwise, obtenido por fine-tuning del modelo base Qwen/Qwen3-4B. Lo desarrolla AdarshSingh7647 y se distribuye con la librería transformers en formato safetensors. Su función es, dada una consulta y un pasaje, emitir un razonamiento y terminar con la etiqueta `true` o `false`; la puntuación de relevancia se calcula como la probabilidad normalizada del token `true` en el último paso de logprobs.

El interés técnico del modelo no está tanto en la tarea (reranking) como en el método de entrenamiento, denominado Eklav: el razonamiento del profesor se inyecta como pista en el prompt y la pérdida se calcula únicamente sobre la respuesta final. Según la model card, esta variante supera a la versión entrenada con SFT estándar (Std-SFT) en el benchmark BRIGHT con nDCG@10, con 31,5 frente a 29,3 puntos sobre el mismo backbone Qwen3-4B.

Se trata de un modelo de 4.022.468.096 parámetros (4B, denso), con un repositorio de 8,1 GB, orientado a pipelines de recuperación aumentada (RAG) y búsqueda semántica donde se requiere una segunda fase de reordenación con razonamiento explícito. La información pública disponible es limitada: la model card no detalla licencia, idiomas ni composición del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-4B) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de uso configura `max_model_len=20000` en vLLM |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors; no se publican GGUF ni AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer decoder-only denso de aproximadamente 4B parámetros. Sobre esa base se aplica un fine-tuning supervisado para la tarea de reranking pointwise, con un formato de salida que fuerza al modelo a producir primero un bloque de razonamiento y después una etiqueta binaria (` true` o ` false`). El chat template se invoca con `enable_thinking=True`, de modo que el modo de razonamiento de Qwen3 permanece activo durante la inferencia.

La innovación declarada es el método Eklav: durante el entrenamiento, el razonamiento producido por un modelo profesor se proporciona como pista dentro del prompt del alumno, y la función de pérdida se aplica solo a la respuesta final (la etiqueta true/false), no al razonamiento intermedio. La model card compara esta estrategia con un SFT estándar sobre el mismo backbone, reportando mejoras consistentes en BRIGHT nDCG@10. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO.

## Capacidades

- Reranking de pasajes pointwise: evalúa pares consulta-pasaje y devuelve una probabilidad de relevancia calibrada mediante normalización de logprobs sobre los tokens `true` y `false`.
- Razonamiento explícito antes de la decisión: genera una cadena de pensamiento que puede auditarse para depurar decisiones de recuperación.
- Generación de texto conversacional: al conservar el pipeline `text-generation` y el chat template de Qwen3, mantiene capacidades generales de conversación multi-turno.
- Integración con vLLM: el ejemplo oficial usa `vllm.LLM` con `SamplingParams` y `logprobs=20`, lo que permite despliegue de alto throughput.
- Compatibilidad con text-generation-inference y endpoints compatibles, según los tags del repositorio.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Capacidades multimodales (visión, audio): no disponibles; el modelo es exclusivamente de texto.
- Capacidades multilingües: no documentadas.

## Casos de uso

- Segunda fase de RAG: tras una recuperación inicial con un retriever bi-encoder (por ejemplo, embeddings densos), el modelo reordena los 20-50 candidatos mejor puntuados. Su razonamiento permite filtrar pasajes superficialmente similares pero no relevantes, un escenario habitual en dominios técnicos.
- Búsqueda en dominios especializados (BRIGHT): el benchmark con el que se evalúa está orientado a consultas complejas en áreas como código, finanzas o medicina, donde los retrievers léxicos fallan; el modelo aporta señal semántica adicional.
- Filtrado de contexto para asistentes documentales: dado un corpus de manuales internos, puntuar cada fragmento antes de inyectarlo en el prompt de un LLM generador reduce coste de tokens y alucinaciones.
- Evaluación de calidad de datasets de recuperación: usar las puntuaciones true/false como etiquetas débiles para auditar pares consulta-documento en un corpus de entrenamiento.
- Moderación y verificación de respuestas: comprobar si un pasaje citado respalda realmente una afirmación, aprovechando la salida binaria y la traza de razonamiento.
- Enrutado de consultas a bases de conocimiento: puntuar un mismo pasaje contra varias consultas candidatas para decidir qué índice consultar primero.
- Investigación sobre destilación con pistas de razonamiento: replicar el método Eklav con otros backbones o tareas de clasificación binaria.

## Benchmarks y rendimiento

Resultados publicados en la model card (BRIGHT nDCG@10). Las columnas Qwen3-8B, GLM-Z1-9B y Qwen3-14B corresponden a los mismos métodos aplicados sobre otros backbones, según la tabla del autor:

| Metodo | Qwen3-4B | Qwen3-8B | GLM-Z1-9B | Qwen3-14B |
|---|---|---|---|---|
| Std-SFT | 29,3 | 31,5 | 30,1 | 32,5 |
| Eklav | 31,5 | 34,2 | 33,2 | 34,7 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de propósito general para este checkpoint.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 8 GB solo para pesos, más overhead de KV cache; con `max_model_len=20000` y lotes moderados, un presupuesto realista de 16-24 GB es razonable.
- VRAM estimada en cuantización de 8 bits: alrededor de 4-5 GB de pesos; en 4 bits, alrededor de 2,5-3 GB (no se publican checkpoints cuantizados oficiales, habría que generarlos).
- GPU recomendadas: A100 40/80 GB o H100 para servir con vLLM a alto throughput y lotes grandes; L40S o RTX 6000 Ada para despliegues de producción con latencia moderada.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bf16 con contexto moderado, y en RTX 3090/4080 con cuantización o contextos más cortos.
- Opciones de despliegue: vLLM es la ruta documentada por el autor (necesaria para acceder a logprobs y al stop string del razonamiento); también es viable transformers con `generate` y `output_scores`, y TGI por los tags del repo. llama.cpp/Ollama requerirían convertir los pesos a GGUF, no publicado.
- Latencia y throughput: no disponibles. Cabe esperar latencias altas por pasaje, ya que el modelo genera hasta 4096 tokens de razonamiento antes de emitir la etiqueta; para reranking a gran escala conviene limitar `max_tokens` o usar decodificación con presupuesto reducido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Eklav-4B-Reranker | 4,02B | no disponible (ejemplo con 20k) | Reranking pointwise con razonamiento | no disponible | Hugging Face, safetensors |
| Std-SFT-Passage-4B | 4,02B (Qwen3-4B) | no disponible | Reranking pointwise con razonamiento | no disponible | Hugging Face, mismo autor |
| Rank1-7B (jhu-clsp) | 7B | no disponible | Reranking pointwise con razonamiento | no disponible en esta ficha | Hugging Face, citado como referencia de formato |
| Qwen3-4B (base) | 4,02B | 32k en la familia Qwen3 (no confirmado aquí) | Generación de texto general | Apache 2.0 en el modelo base (no confirmado para este fine-tune) | Hugging Face |

El modelo se posiciona como alternativa de 4B a rerankers con razonamiento de mayor tamaño (Rank1-7B) y a variantes del mismo backbone entrenadas con SFT estándar, con la ventaja de coste de inferencia del backbone pequeño y la desventaja de una latencia por consulta elevada debido al razonamiento.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar el uso comercial; hay que contactar con el autor o asumir la licencia del modelo base (Qwen3-4B), lo que introduce incertidumbre legal.
- Idiomas no documentados: no hay garantía de calidad fuera del inglés, idioma implícito en los ejemplos y en BRIGHT.
- Riesgo de alucinación en el razonamiento: la traza de pensamiento puede contener afirmaciones incorrectas aunque la etiqueta final sea correcta; no debe usarse como explicación fiable sin verificación.
- Coste de inferencia: generar hasta 4096 tokens por par consulta-pasaje hace inviable el reranking de cientos de candidatos sin recortar el presupuesto de razonamiento.
- Dependencia de logprobs: la puntuación se obtiene del logprob del token `true`; cambios en el tokenizador o en el stop string pueden desalinear el cálculo (el propio autor advierte de un posible off-by-one con vLLM).
- Sesgos: no documentados; al heredar el corpus de Qwen3-4B, es previsible que arrastre sesgos del modelo base.
- Contexto máximo no confirmado: el ejemplo usa 20.000 tokens, pero no se especifica el límite real del checkpoint; pasajes largos pueden truncarse.
- Madurez: 331 descargas y 0 likes en el momento de la consulta, sin validación externa independiente de los resultados reportados.
- Uso en producción: al ser un fine-tune para una tarea concreta, no debe emplearse como modelo generativo general sin evaluar la degradación respecto al base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdarshSingh7647/Eklav-4B-Reranker
- Versión Std-SFT: https://huggingface.co/AdarshSingh7647/Std-SFT-Passage-4B
- Código del método Eklav: https://github.com/AdarshSingh7647/Eklavya
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Referencia de formato Rank1: https://huggingface.co/jhu-clsp/rank1-7b
