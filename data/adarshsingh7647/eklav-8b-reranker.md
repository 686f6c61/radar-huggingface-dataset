# AdarshSingh7647/Eklav-8B-Reranker

## Resumen

Eklav-8B-Reranker es un modelo de reranking pointwise de pasajes construido mediante fine-tuning supervisado sobre Qwen/Qwen3-8B, un transformer decoder-only denso de 8.190.735.360 parámetros. Lo publica el usuario AdarshSingh7647 bajo el nombre interno "Eklav-Passage-8B" y forma parte de la familia Eklav, una metodología de entrenamiento en la que el razonamiento del modelo profesor se inyecta como pista en el prompt mientras la función de pérdida se calcula únicamente sobre la respuesta final. El modelo está pensado para reordenar pasajes recuperados por un sistema de búsqueda, evaluando la relevancia de cada pasaje respecto a una consulta.

La innovación principal no reside en la arquitectura, heredada íntegramente de Qwen3-8B, sino en el procedimiento de destilación: en lugar de pedir al estudiante que reproduzca la cadena de razonamiento del profesor, se le proporciona esa cadena como contexto y se le exige solo el veredicto binario de relevancia. El modelo genera un razonamiento propio que termina en `</think> true` o `</think> false`, y la puntuación de relevancia se obtiene como la probabilidad normalizada del token `true` en esa posición final.

Es relevante porque aplica el patrón de "reasoning reranker" popularizado por Rank1 a la familia Qwen3, con resultados reportados en BRIGHT que superan a los modelos base equivalentes y a alternativas como GLM-Z1-9B. El repositorio tiene 769 descargas y un tamaño de 16,4 GB en safetensors, lo que corresponde a pesos en bf16/fp16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3), con modo de razonamiento habilitado |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la model card; el ejemplo de uso configura `max_model_len=20000` en vLLM |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se listan GGUF ni AWQ/GPTQ) |
| Idiomas soportados | no disponible (heredados de Qwen3-8B, sin confirmación explícita del autor) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-8B sin modificaciones estructurales: un transformer decoder-only denso con atención causal estándar, sin mezcla de expertos ni componentes híbridos SSM. El pipeline declarado es `text-generation`, aunque la tarea efectiva es reranking pointwise de pasajes. El modelo opera con la plantilla de chat de Qwen3 y con `enable_thinking=True`, de modo que produce una cadena de razonamiento antes del veredicto.

El entrenamiento sigue el esquema Eklav: se construye un prompt que incluye el razonamiento del profesor como pista y se calcula la pérdida exclusivamente sobre la respuesta final (`true`/`false`). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se detalla el profesor utilizado ni el conjunto de datos de reranking. La innovación destacable es el método de destilación con hint de razonamiento y supervisión solo en la respuesta, que según la tabla de resultados mejora de forma consistente sobre el fine-tuning supervisado estándar (Std-SFT) en la misma base.

## Capacidades

- Reranking pointwise de pasajes: asigna una puntuación de relevancia continua a cada par (consulta, pasaje) mediante la probabilidad normalizada del token `true` frente a `false`.
- Razonamiento explícito antes del veredicto: genera una cadena de pensamiento que termina en `</think> true` o `</think> false`, lo que permite auditar la decisión.
- Clasificación binaria de relevancia con salida calibrable vía logprobs, tal como muestra el código de ejemplo con vLLM.
- Generación de texto conversacional, heredada de Qwen3-8B y de su plantilla de chat.
- Soporte de tool calling y function calling: no confirmado en la model card; se heredaría del modelo base, pero el fine-tuning está orientado a reranking y no se documenta esta capacidad.
- Capacidades de agente y razonamiento multi-paso: no documentadas para esta variante.
- Capacidades multilingües: no documentadas explícitamente; dependen del modelo base.
- Modo thinking: sí, el ejemplo de uso activa `enable_thinking=True`.

## Casos de uso

- Reranking en pipelines RAG: tras una recuperación inicial con un retriever bi-encoder, el modelo reordena los candidatos evaluando cada par consulta-pasaje con razonamiento, lo que mejora la precisión del contexto entregado al generador. Es adecuado por su entrenamiento específico en passage reranking y por la puntuación calibrada vía logprobs.
- Búsqueda documental en dominios técnicos: el benchmark BRIGHT está orientado a consultas de razonamiento intensivo, por lo que el modelo encaja en búsqueda sobre corpus científicos, jurídicos o de ingeniería donde los retrievers densos fallan.
- Filtrado de contexto para sistemas de atención al cliente: dado un conjunto de fragmentos de base de conocimiento, el modelo descarta los irrelevantes antes de pasarlos al LLM generador, reduciendo alucinaciones por contexto contaminado.
- Evaluación de calidad de recuperación: la salida de razonamiento permite inspeccionar por qué un pasaje se considera relevante, útil para depurar índices y datasets de evaluación.
- Reordenación en motores de búsqueda internos: integrable vía vLLM con `max_model_len=20000` para consultas y pasajes de longitud moderada, con temperatura 0 para determinismo.
- Construcción de datasets de preferencias para retrieval: las puntuaciones continuas permiten generar etiquetas de relevancia graduadas a partir de pasajes candidatos.
- Investigación en destilación con razonamiento: sirve como referencia reproducible del método Eklav frente a la variante Std-SFT publicada por el mismo autor.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre BRIGHT (nDCG@10):

| Modelo | Std-SFT | Eklav |
|---|---|---|
| Qwen3-4B | 29.3 | 31.5 |
| Qwen3-8B (base del modelo) | 31.5 | 34.2 |
| GLM-Z1-9B | 30.1 | 33.2 |
| Qwen3-14B | 32.5 | 34.7 |

El modelo Eklav-8B-Reranker alcanza 34.2 nDCG@10, 2.7 puntos por encima de su propia variante Std-SFT y 0.5 puntos por debajo de Qwen3-14B con Eklav. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16,4 GB solo para pesos, más overhead de KV cache; en la práctica se recomienda un mínimo de 24 GB para contextos cortos y bastante más para `max_model_len=20000`.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para producción con contexto largo. Una RTX 4090 de 24 GB puede alojar los pesos en bf16, pero el margen para KV cache con contextos de 20k tokens es muy ajustado.
- Cabe en GPU de consumo: sí en RTX 4090 (24 GB) con contexto limitado; en GPUs de 16 GB solo mediante cuantización, que no está publicada en el repositorio.
- Opciones de despliegue: el ejemplo oficial usa vLLM con `SamplingParams(logprobs=20)` y cadenas de parada; también es compatible con TGI por el tag `text-generation-inference`. Para llama.cpp/Ollama sería necesario convertir los pesos a GGUF, algo que el autor no proporciona.
- Latencia y throughput: no disponibles. Cabe esperar un coste elevado por par consulta-pasaje, ya que cada evaluación genera hasta 4096 tokens de razonamiento con `max_tokens=4096`, lo que limita el throughput en reranking de muchos candidatos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BRIGHT nDCG@10 (Eklav) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Eklav-8B-Reranker | 8,19 B | no disponible (ejemplo a 20k) | 34.2 | no disponible | safetensors en HF |
| Qwen3-8B + Eklav | 8,19 B | no disponible | 34.2 | Apache 2.0 (modelo base) | HF |
| Qwen3-14B + Eklav | ~14 B | no disponible | 34.7 | Apache 2.0 (modelo base) | HF |
| GLM-Z1-9B + Eklav | ~9 B | no disponible | 33.2 | no disponible | HF |
| Rank1-7B | ~7 B | no disponible | no disponible | no disponible | HF |

La comparación se limita a los datos publicados por el autor. Rank1 se cita en la model card como referencia metodológica del reranker pointwise con razonamiento, pero no se aportan cifras comparativas directas.

## Limitaciones y advertencias

- Licencia no especificada: no se indica la licencia del fine-tuning, lo que impide confirmar si el uso comercial está permitido. El modelo base Qwen3-8B es Apache 2.0, pero la variante derivada no declara términos propios.
- Idiomas no documentados: no hay confirmación de qué idiomas mantiene tras el fine-tuning; el entrenamiento en reranking en inglés puede degradar el comportamiento en otras lenguas.
- Riesgo de alucinación en el razonamiento: la cadena de pensamiento puede contener afirmaciones incorrectas sobre el pasaje; la decisión final depende del token `true`/`false`, pero el razonamiento no debe tratarse como explicación fiable.
- Coste computacional alto: generar hasta 4096 tokens por par consulta-pasaje hace inviable el reranking de cientos de candidatos sin recortar `max_tokens` o sin un paso previo de filtrado.
- Dependencia de la plantilla de chat y de `enable_thinking=True`: usar el modelo sin la plantilla correcta o con thinking desactivado puede degradar la calidad de las puntuaciones.
- Fragilidad en la extracción de logprobs: el propio ejemplo advierte de un posible desfase de un token por la coincidencia de cadenas de parada en vLLM, lo que obliga a escanear los logprobs en orden inverso.
- Sin cuantizaciones publicadas: no hay GGUF ni AWQ/GPTQ oficiales, lo que limita el despliegue en hardware modesto.
- Sin datos de sesgos: no se han publicado evaluaciones de sesgo ni de robustez.
- Contexto no confirmado: la longitud de contexto real soportada no se declara; el valor de 20000 del ejemplo es una configuración de despliegue, no una especificación del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdarshSingh7647/Eklav-8B-Reranker
- Variante Std-SFT: https://huggingface.co/AdarshSingh7647/Std-SFT-Passage-8B
- Código del método Eklav: https://github.com/AdarshSingh7647/Eklavya
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Rank1 (referencia metodológica): https://huggingface.co/jhu-clsp/rank1-7b
