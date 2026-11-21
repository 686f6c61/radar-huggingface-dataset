# AdarshSingh7647/HETU-Qwen3-8B-PassageReranking-CotCond

## Resumen

HETU-Qwen3-8B-PassageReranking-CotCond es un modelo de reranking de pasajes (pointwise) obtenido mediante fine-tuning de Qwen/Qwen3-8B. Lo publica el usuario AdarshSingh7647 bajo el nombre interno "Eklav-Passage-8B" y forma parte de una familia de experimentos de ajuste fino denominada Eklav, cuyo código está disponible en el repositorio Eklavya del mismo autor. El modelo no genera rankings directamente: produce un razonamiento y termina con un token `true` o `false`, y la puntuación de relevancia se obtiene como la probabilidad normalizada del token `true` en el último paso de logprobs.

La particularidad del entrenamiento es la condicionalización por cadena de pensamiento (CoT condicionada): durante el ajuste fino se proporciona el razonamiento del modelo profesor como pista dentro del prompt, y la pérdida se calcula únicamente sobre la respuesta final. Según la model card, esta receta mejora el nDCG@10 en BRIGHT frente al ajuste fino supervisado estándar (Std-SFT) en todos los tamaños probados, con 34,2 para la variante de 8B frente a 31,5 del Std-SFT equivalente.

Es relevante para quienes construyen pipelines de recuperación aumentada (RAG) de dos etapas y necesitan un reranker de razonamiento con ventana de contexto amplia (hasta 20.000 tokens en el ejemplo de despliegue con vLLM). El modelo tiene 8.190.735.360 parámetros en formato safetensors, un repositorio de 16,4 GB y, en el momento de la consulta, 769 descargas y ningún "like".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-8B); no se detalla en la model card |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | 20.000 tokens en el ejemplo de despliegue (`max_model_len=20000`); contexto nativo de Qwen3-8B no confirmado en la información disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors; no se listan GGUF ni AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-8B, un transformer decoder-only de 8.190 millones de parámetros, y se especializa mediante ajuste fino supervisado para una tarea concreta: reranking pointwise de pasajes. No se documenta en la información disponible ningún cambio estructural (atención, capas, tokenizador) respecto al modelo base, ni se detallan el número de tokens de entrenamiento, la composición del dataset o si hubo fases de RLHF o DPO.

La innovación metodológica es la receta Eklav: el razonamiento del profesor se inyecta como pista en el prompt y la función de pérdida se aplica solo a la respuesta final (`true`/`false`), de modo que el alumno aprende a producir cadenas de razonamiento que desembocan en la decisión correcta sin supervisión directa token a token sobre el razonamiento. El modo "thinking" de Qwen3 se activa explícitamente en la plantilla de chat (`enable_thinking=True`), y el prompt de sistema y la instrucción de tarea están fijados en la model card. La inferencia se plantea con decodificación greedy (`temperature=0`) y hasta 4.096 tokens de generación por par consulta-pasaje.

## Capacidades

- Reranking pointwise de pasajes: emite un razonamiento y concluye con `</think> true` o `</think> false`; la puntuación se calcula como `P(true) / (P(true) + P(false))` a partir de los logprobs.
- Razonamiento explícito en modo thinking, heredado de Qwen3-8B y reforzado por la receta de entrenamiento.
- Generación de texto conversacional con plantilla de chat (roles system/user).
- Evaluación de relevancia consulta-pasaje en inglés, a juzgar por los ejemplos de la model card; no se confirman otros idiomas.
- Integración con vLLM y con Text Generation Inference (etiqueta `text-generation-inference` y `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Reranking en pipelines RAG de dos etapas: tras una recuperación densa o híbrida inicial, el modelo reordena los candidatos calculando la probabilidad de `true` para cada par consulta-pasaje; la ventana de 20.000 tokens permite pasar pasajes largos sin truncar agresivamente.
- Búsqueda documental especializada (estilo BRIGHT): la model card reporta mejoras específicas en BRIGHT, un benchmark de recuperación en dominios intensivos en razonamiento (código, matemáticas, ciencia), por lo que encaja en buscadores verticales donde la coincidencia léxica falla.
- Filtrado de contexto para asistentes sobre documentación técnica: se puede usar como clasificador de relevancia que descarta pasajes irrelevantes antes de inyectarlos en el prompt de un LLM generador, reduciendo coste y alucinaciones.
- Evaluación de calidad de recuperación en investigación: al devolver una probabilidad calibrada entre `true` y `false`, sirve para construir etiquetas débiles o para comparar retrievers sin anotación humana.
- Moderación de relevancia en atención al cliente: decidir si un artículo de la base de conocimiento responde a la consulta del usuario antes de mostrarlo, con trazabilidad del razonamiento generado.
- Selección de evidencia en sistemas de preguntas y respuestas sobre corpus legales o científicos: el modo thinking permite inspeccionar por qué un pasaje se considera relevante, útil para auditoría.
- Reordenación de resultados en motores de búsqueda internos: el coste por par es alto (hasta 4.096 tokens generados), así que se recomienda aplicar solo sobre el top-k de la primera etapa.

## Benchmarks y rendimiento

La model card publica resultados de nDCG@10 en BRIGHT comparando la receta Eklav con Std-SFT en cuatro tamaños:

| BRIGHT nDCG@10 | Qwen3-4B | Qwen3-8B | GLM-Z1-9B | Qwen3-14B |
|---|---|---|---|---|
| Std-SFT | 29,3 | 31,5 | 30,1 | 32,5 |
| Eklav | 31,5 | 34,2 | 33,2 | 34,7 |

La variante de 8B con Eklav alcanza 34,2, superando a su equivalente Std-SFT (31,5) y a GLM-Z1-9B con Eklav (33,2), y quedando por debajo de Qwen3-14B con Eklav (34,7). No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de propósito general para este checkpoint.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 16,4 GB solo para pesos, más caché KV; con 20.000 tokens de contexto y generación de hasta 4.096 tokens, el consumo real por petición es elevado.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para producción con vLLM y concurrencia; una RTX 4090 (24 GB) puede alojar los pesos en BF16 pero deja poco margen para lotes y contexto largo.
- Cabe en GPU de consumo con cuantización a 8 bits (aprox. 8-9 GB de pesos) o 4 bits (aprox. 4-5 GB); no se distribuyen pesos cuantizados en el repositorio, habría que generarlos.
- Despliegue: el ejemplo oficial usa vLLM (`LLM(model=..., max_model_len=20000)`) con `SamplingParams(temperature=0, max_tokens=4096, logprobs=20)`. También es compatible con Text Generation Inference según las etiquetas; llama.cpp/Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia cualitativa, cada par consulta-pasaje implica una generación de razonamiento completa, lo que hace el coste por documento sensiblemente mayor que el de un cross-encoder clásico.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | BRIGHT nDCG@10 (Eklav) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HETU-Qwen3-8B-PassageReranking-CotCond | 8,19 B | Reranker pointwise con CoT condicionada | 34,2 | no disponible | Hugging Face (769 descargas) |
| Std-SFT-Passage-8B (mismo autor) | 8,19 B | Reranker pointwise con SFT estándar | 31,5 | no disponible | Hugging Face |
| Rank1-7B (jhu-clsp) | 7 B (aprox.) | Reranker pointwise con razonamiento, referencia metodológica | no disponible | no disponible | Hugging Face |
| Qwen3-14B con Eklav (citado en la model card) | 14 B (aprox.) | Reranker pointwise con CoT condicionada | 34,7 | no disponible | no disponible como checkpoint publicado en la información consultada |

## Limitaciones y advertencias

- La licencia no está declarada en la información disponible; antes de cualquier uso comercial hay que verificar la licencia del modelo base Qwen3-8B y contactar con el autor.
- El modelo está entrenado para una única tarea (reranking binario de pasajes); no debe usarse como LLM de propósito general ni como generador de respuestas.
- El prompt de sistema y la instrucción de tarea están fijados en la model card; desviarse de esa plantilla puede degradar la calibración de la probabilidad de `true`.
- El cálculo de la puntuación depende de detalles de implementación de vLLM (coincidencia de cadenas de parada que puede consumir un token extra); el código de ejemplo recorre los logprobs en orden inverso para mitigarlo, pero es un punto frágil en producción.
- El coste computacional es alto: hasta 4.096 tokens generados por par consulta-pasaje, lo que limita su uso a un top-k reducido.
- Riesgo de alucinación en el razonamiento intermedio: el texto generado puede contener justificaciones incorrectas aunque la decisión final sea correcta; conviene tratarlo como explicación no auditable sin revisión.
- No se documentan sesgos conocidos, cobertura idiomática ni evaluación fuera de BRIGHT; la generalización a otros dominios y a castellano no está verificada.
- El repositorio tiene 0 "like" y 769 descargas, y no se han publicado resultados de benchmarks generales; se trata de un checkpoint de investigación, no de un artefacto con garantías de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdarshSingh7647/HETU-Qwen3-8B-PassageReranking-CotCond
- Variante Std-SFT del mismo autor: https://huggingface.co/AdarshSingh7647/Std-SFT-Passage-8B
- Código de Eklav (repositorio Eklavya): https://github.com/AdarshSingh7647/Eklavya
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Referencia metodológica Rank1: https://huggingface.co/jhu-clsp/rank1-7b
