# AdarshSingh7647/Eklav-8B-Reranker-CotGen

## Resumen

Eklav-8B-Reranker-CotGen es un modelo de reranking de pasajes (pointwise) construido a partir de Qwen/Qwen3-8B mediante fine-tuning supervisado. Lo publica el usuario AdarshSingh7647 dentro del proyecto Eklavya, cuyo objetivo es mejorar el razonamiento de los rerankers: en lugar de emitir una puntuación directa de relevancia, el modelo genera una cadena de razonamiento que termina en `</think> true` o `</think> false`, y la puntuación de relevancia se obtiene de la probabilidad del token `true` en ese punto. Es, por tanto, un modelo de 8.190.735.360 parámetros en formato safetensors (16,4 GB de repositorio) con arquitectura transformer derivada de Qwen3.

El interés práctico está en que aplica la técnica Std-SFT (supervisión sobre el razonamiento del profesor y sobre la respuesta final) a una tarea de recuperación, y reporta mejoras de nDCG@10 en BRIGHT frente a la misma receta aplicada a Qwen3-4B, GLM-Z1-9B y Qwen3-14B. Según la model card, la variante Std-SFT sobre Qwen3-8B alcanza 31,5 en BRIGHT nDCG@10, frente a 29,3 de Qwen3-4B, 30,1 de GLM-Z1-9B y 32,5 de Qwen3-14B.

La ficha se basa exclusivamente en la información disponible en Hugging Face y en la model card; no hay datos publicados sobre composición del dataset, licencia ni idiomas soportados, por lo que esos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-8B); no se detalla configuración de capas ni atención en la información disponible |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible en la model card; el ejemplo de uso configura `max_model_len=16000` en vLLM y `max_tokens=8192` para la generación |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; no se listan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-8B, un transformer decoder-only de 8B parámetros, y se ajusta con la receta Std-SFT descrita por el autor: la función de pérdida se aplica tanto sobre el razonamiento generado por el profesor como sobre la respuesta final. El resultado es un reranker pointwise en el estilo de Rank1: el modelo escribe su razonamiento y cierra con `</think> true` o `</think> false`, de modo que la relevancia se calcula como la probabilidad normalizada del token `true` en el último paso de logprobs. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO.

La innovación técnica destacable es el uso de cadena de razonamiento explícita para una tarea de ranking, junto con una comparación directa entre dos recetas (Std-SFT y Eklav) sobre el mismo modelo base. La model card enlaza la versión entrenada con la receta Eklav (Eklav-Passage-8B) y el código en GitHub, pero no detalla hiperparámetros, precisión de entrenamiento ni estrategia de empaquetado de secuencias.

## Capacidades

- Reranking de pasajes pointwise: dada una consulta y un pasaje, genera razonamiento y emite `true` o `false` como decisión de relevancia.
- Puntuación calibrada mediante normalización de probabilidades entre los tokens `true` y `false` en el paso final de logprobs.
- Generación de cadenas de razonamiento (modo thinking) antes de la decisión, con hasta 8192 tokens de generación en el ejemplo del autor.
- Generación de texto conversacional heredada del modelo base Qwen3-8B, según el pipeline declarado (`text-generation`) y la etiqueta `conversational`.
- Compatibilidad con Text Generation Inference y endpoints compatibles, según las etiquetas del repositorio.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; el modelo es solo de texto.
- Capacidades multilingües: no disponibles; no se declaran idiomas.

## Casos de uso

- Reranking en pipelines RAG: tras una recuperación inicial densa o híbrida, el modelo reordena los pasajes candidatos calculando la probabilidad de `true` para cada par consulta-pasaje; su razonamiento explícito ayuda a depurar por qué un pasaje se considera relevante.
- Búsqueda de documentos técnicos y científicos: BRIGHT es un benchmark de recuperación con consultas de razonamiento intensivo, por lo que el modelo encaja en dominios donde la coincidencia léxica falla y hace falta inferencia sobre el pasaje.
- Filtrado de contexto antes de la generación: dado que el ejemplo de uso admite `max_model_len=16000`, se pueden evaluar pasajes largos y descartar los irrelevantes antes de pasarlos a un LLM generador, reduciendo coste de tokens.
- Evaluación de calidad de respuestas: el mismo esquema consulta-respuesta con salida `true`/`false` permite puntuar si una respuesta candidata es relevante para la pregunta, útil en pipelines de anotación o control de calidad.
- Construcción de datasets de entrenamiento para rerankers: las trazas de razonamiento generadas pueden servir como datos de destilación o para revisión humana de decisiones de relevancia.
- Despliegue en servicios de búsqueda con vLLM: el ejemplo del autor usa vLLM con `SamplingParams(temperature=0, max_tokens=8192, logprobs=20)`, un patrón directamente trasladable a un servicio HTTP de reranking.
- Investigación sobre razonamiento en recuperación: permite comparar la receta Std-SFT con la receta Eklav sobre el mismo backbone, lo que facilita experimentos controlados de ablación.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los de BRIGHT nDCG@10 de la model card:

| BRIGHT nDCG@10 | Qwen3-4B | Qwen3-8B (Std-SFT) | GLM-Z1-9B | Qwen3-14B |
|---|---|---|---|---|
| Std-SFT | 29,3 | 31,5 | 30,1 | 32,5 |
| Eklav | 31,5 | 34,2 | 33,2 | 34,7 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks en la información disponible. Tampoco se detallan métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 16,4 GB solo para pesos, más overhead de KV cache y activaciones; en la práctica se recomienda al menos 24 GB para secuencias cortas y bastante más para contextos largos con `max_tokens=8192`.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para producción con contexto largo; en consumer, RTX 4090 (24 GB) o RTX A6000 (48 GB) para BF16 con secuencias moderadas.
- Cuantización: no se publican pesos cuantizados en el repositorio, por lo que el uso en GPUs de 12-16 GB requeriría cuantizar el modelo por cuenta propia (por ejemplo, a 8 o 4 bits) y validar que la calibración de logprobs se mantiene.
- Opciones de despliegue: vLLM es la vía documentada por el autor (con `logprobs=20` y cadenas de parada); también es compatible con Text Generation Inference según las etiquetas del repositorio. No se confirma soporte de llama.cpp u Ollama al no haber GGUF publicado.
- Latencia y throughput: no disponibles. Cabe esperar un coste alto por par consulta-pasaje, ya que cada puntuación implica generar hasta 8192 tokens de razonamiento con decodificación autoregresiva.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BRIGHT nDCG@10 (Eklav) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Eklav-8B-Reranker-CotGen (Std-SFT) | 8,19B | no disponible | 31,5 (Std-SFT) | no disponible | safetensors en HF |
| Eklav-Passage-8B | 8B (derivado de Qwen3-8B) | no disponible | 34,2 | no disponible | safetensors en HF |
| Qwen3-4B (Std-SFT) | 4B | no disponible | 31,5 | no disponible en esta ficha | HF |
| GLM-Z1-9B (Eklav) | 9B | no disponible | 33,2 | no disponible en esta ficha | HF |
| Qwen3-14B (Eklav) | 14B | no disponible | 34,7 | no disponible en esta ficha | HF |

La comparación se limita a la métrica BRIGHT nDCG@10 reportada por el autor; no hay datos de otros benchmarks ni de eficiencia que permitan una comparación más amplia.

## Limitaciones y advertencias

- La licencia no está declarada en la información disponible; antes de cualquier uso comercial debe verificarse la licencia del modelo base Qwen3-8B y la del repositorio derivado.
- No se declaran idiomas soportados; el rendimiento fuera del inglés es incierto, especialmente porque BRIGHT es un benchmark en inglés.
- El modelo es un reranker especializado: su uso como generador de propósito general no está validado y puede degradarse respecto al Qwen3-8B original.
- Riesgo de alucinación en el razonamiento intermedio: la cadena de pensamiento puede contener afirmaciones incorrectas aunque la decisión final sea correcta, lo que complica la auditoría.
- Coste computacional elevado: generar hasta 8192 tokens por par consulta-pasaje hace inviable el reranking de muchos candidatos sin una etapa previa de filtrado.
- La puntuación depende de la extracción de logprobs en el paso final; el propio autor advierte de un posible desfase de un token por la coincidencia de cadenas de parada en vLLM, lo que exige implementar el escaneo desde el final tal como se muestra.
- No se publican datos de sesgos, composición del dataset de entrenamiento ni evaluaciones de robustez.
- El repositorio tiene 0 likes y fue actualizado por última vez en octubre de 2026, con 5121 descargas; no hay evidencia de mantenimiento continuado ni de una comunidad que lo respalde.
- El nombre del repositorio (Eklav-8B-Reranker-CotGen) no coincide con el título de la model card (Std-SFT-Passage-8B) ni con el `model_id` del ejemplo de código (AdarshSingh7647/Std-SFT-Passage-8B), lo que puede provocar errores al cargar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdarshSingh7647/Eklav-8B-Reranker-CotGen
- Versión con receta Eklav: https://huggingface.co/AdarshSingh7647/Eklav-Passage-8B
- Código del proyecto Eklavya: https://github.com/AdarshSingh7647/Eklavya
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Referencia de la técnica de reranking pointwise (Rank1): https://huggingface.co/jhu-clsp/rank1-7b
