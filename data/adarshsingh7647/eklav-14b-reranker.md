# AdarshSingh7647/Eklav-14B-Reranker

## Resumen

Eklav-14B-Reranker (publicado también como Eklav-Passage-14B) es un modelo de reranking de pasajes construido mediante fine-tuning de Qwen/Qwen3-14B. Lo desarrolla AdarshSingh7647 y su rasgo distintivo no es la arquitectura, sino el método de entrenamiento: la técnica Eklav, en la que el razonamiento del modelo profesor se inyecta como pista en el prompt y la pérdida se calcula únicamente sobre la respuesta final. El resultado es un reranker de tipo pointwise que emite razonamiento explícito y termina con `</think> true` o `</think> false`, de forma análoga a Rank1.

El modelo resuelve una tarea concreta y muy demandada en pipelines RAG: reordenar pasajes recuperados por un retriever de primera fase según su relevancia real para la consulta. Con 14.768.307.200 parámetros (14,77 mil millones) y pesos en safetensors, se apoya en la ventana de contexto de Qwen3-14B y en su modo thinking para producir juicios de relevancia razonados en lugar de una simple puntuación de similitud.

Es relevante porque demuestra que el destilado de razonamiento con pistas del profesor mejora de forma medible el reranking sobre el fine-tuning supervisado estándar: en BRIGHT nDCG@10, la variante Eklav sobre Qwen3-14B alcanza 34,7 frente a 32,5 del Std-SFT sobre el mismo modelo base. La ficha se basa únicamente en la información disponible en Hugging Face y en la model card; los datos no publicados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-14B) con modo de razonamiento; fine-tuning para reranking pointwise |
| Parametros totales | 14.768.307.200 (14,77 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de uso configura `max_model_len=20000` en vLLM |
| Tipos de cuantizacion | no disponible (repo con pesos safetensors; no se listan GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-14B |
| Tamano del repositorio | 29,5 GB |
| Libreria | transformers (compatible con text-generation-inference y endpoints) |
| Descargas | 3207 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-14B, un transformer decoder-only de 14,77 mil millones de parámetros con capacidad de razonamiento en modo thinking. Sobre esa base se aplica un fine-tuning para una tarea de clasificación binaria de relevancia formulada como generación: el modelo recibe un system prompt de asistente de recuperación y una instrucción de tarea, y debe razonar y concluir con `true` o `false`. La puntuación de relevancia no se obtiene del texto generado, sino de la probabilidad del token `true` en el último paso de logprobs, normalizada frente a `false`.

La innovación está en el procedimiento de entrenamiento, denominado Eklav: durante el entrenamiento, el razonamiento del modelo profesor se proporciona como pista dentro del prompt, pero la pérdida se calcula exclusivamente sobre la respuesta final. Esto separa la señal de supervisión del proceso de razonamiento y evita que el modelo aprenda a imitar literalmente las cadenas de pensamiento del profesor. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Reranking de pasajes pointwise: emite un juicio de relevancia binario (`true`/`false`) con razonamiento previo.
- Puntuación calibrada: la probabilidad de `true` en el token final, normalizada contra `false`, sirve como score continuo para ordenar pasajes.
- Razonamiento explícito en modo thinking, activado con `enable_thinking=True` en la plantilla de chat.
- Generación de texto conversacional heredada de Qwen3-14B, aunque el fine-tuning está orientado a la tarea de reranking.
- Integración con vLLM para extracción de logprobs y decodificación con temperatura 0.
- Soporte de plantilla de chat de Qwen3 con roles system/user.
- No se documentan capacidades de tool calling, agentes, visión ni audio específicas para este fine-tuning.

## Casos de uso

- Reranking en pipelines RAG: tras una recuperación densa o híbrida de primer nivel, el modelo reordena los pasajes candidatos calculando la probabilidad de `true`, mejorando la precisión del contexto entregado al generador. Su entrenamiento específico en BRIGHT lo hace adecuado para consultas técnicas y de dominio.
- Búsqueda en documentación técnica y científica: el modo thinking permite al modelo razonar sobre matices semánticos entre consulta y pasaje, útil cuando la relevancia no es léxica sino conceptual.
- Filtrado de contextos antes de la generación: dado su formato binario, puede descartar pasajes irrelevantes con un umbral sobre el score normalizado, reduciendo tokens de contexto y coste de inferencia del modelo generador.
- Evaluación de calidad de recuperación: el score continuo permite construir conjuntos de validación y comparar retrievers sin depender de juicios humanos en cada iteración.
- Atención al cliente con base de conocimiento: reordenar artículos de ayuda recuperados para una consulta de usuario antes de que un LLM componga la respuesta, con contexto de hasta 20.000 tokens según el ejemplo de despliegue.
- Sistemas de búsqueda legal o normativa: el razonamiento previo a la decisión facilita la auditoría de por qué un pasaje se consideró relevante, algo útil en dominios con requisitos de trazabilidad.
- Investigación en destilación de razonamiento: sirve como referencia reproducible del método Eklav frente a Std-SFT, con código disponible en el repositorio Eklavya.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre BRIGHT con métrica nDCG@10:

| Metodo | Qwen3-4B | Qwen3-8B | GLM-Z1-9B | Qwen3-14B |
|---|---|---|---|---|
| Std-SFT | 29,3 | 31,5 | 30,1 | 32,5 |
| Eklav | 31,5 | 34,2 | 33,2 | 34,7 |

El modelo Eklav-14B-Reranker corresponde a la columna Qwen3-14B con método Eklav (34,7). No se han publicado en la información disponible resultados de otros benchmarks como MMLU, HumanEval o GSM8K, ni comparaciones con rerankers de referencia como Rank1.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 29,5 GB solo para pesos, más overhead de KV cache; se recomienda un mínimo de 40 GB y 48-80 GB para contextos largos.
- GPU recomendadas: A100 80 GB, H100 80 GB, L40S 48 GB; en configuraciones con tensor parallelism, 2x A100 40 GB o 2x RTX 4090 24 GB.
- GPU de consumo: no cabe en una RTX 4090 de 24 GB en precisión completa; requeriría cuantización (no publicada en el repo) o sharding multi-GPU.
- Opciones de despliegue: vLLM es la vía documentada por el autor (necesaria para acceder a logprobs con `logprobs=20`); transformers también es viable. No se documentan GGUF, llama.cpp, Ollama ni TGI para este fine-tuning.
- Latencia y throughput: no disponibles. El ejemplo usa `temperature=0` y `max_tokens=4096`, lo que implica generaciones de razonamiento potencialmente largas y coste por consulta elevado en comparación con rerankers cross-encoder clásicos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BRIGHT nDCG@10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Eklav-14B-Reranker | 14,77B | no disponible (ejemplo con 20k) | 34,7 | no disponible | Hugging Face, safetensors |
| Std-SFT-Passage-14B | 14,77B | no disponible | 32,5 | no disponible | Hugging Face |
| Eklav sobre Qwen3-8B | ~8B | no disponible | 34,2 | no disponible | Referencia en model card |
| Eklav sobre GLM-Z1-9B | ~9B | no disponible | 33,2 | no disponible | Referencia en model card |
| Rank1-7B | ~7B | no disponible | no disponible | no disponible | Hugging Face (jhu-clsp) |

La comparación directa más informativa es con su propia variante Std-SFT sobre el mismo base: Eklav aporta +2,2 puntos de nDCG@10. Frente a alternativas de menor tamaño como Qwen3-8B con Eklav (34,2), la ventaja del 14B es de solo 0,5 puntos, lo que sugiere un retorno decreciente por parámetro en esta tarea.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; hereda presumiblemente las condiciones de Qwen3-14B, pero debe verificarse antes de producción.
- Idiomas no documentados: el comportamiento multilingüe no está evaluado y el entrenamiento parece orientado a inglés según los prompts de ejemplo.
- Riesgo de alucinación en el razonamiento: el modelo genera cadenas de pensamiento que pueden contener afirmaciones incorrectas aunque la decisión final sea correcta; no deben interpretarse como justificación factual verificada.
- Coste de inferencia alto: requiere generar hasta 4096 tokens de razonamiento por par consulta-pasaje, lo que limita su uso en reranking de cientos de candidatos por consulta.
- Dependencia de logprobs y de cadenas de parada específicas: el pipeline de puntuación es sensible a la tokenización de `true`/`false` y al comportamiento de las stop strings en vLLM, con riesgo de off-by-one documentado por el propio autor.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad ni robustez adversarial.
- Sin cuantizaciones publicadas: el despliegue en hardware limitado exige cuantizar por cuenta propia, con posible degradación de la calibración del score.
- Metadatos incompletos: la model card no detalla dataset de entrenamiento, hiperparámetros ni número de tokens, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdarshSingh7647/Eklav-14B-Reranker
- Variante Std-SFT: https://huggingface.co/AdarshSingh7647/Std-SFT-Passage-14B
- Código del método Eklav: https://github.com/AdarshSingh7647/Eklavya
- Modelo base Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- Reranker de referencia Rank1: https://huggingface.co/jhu-clsp/rank1-7b
