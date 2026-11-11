# rilixai/Qwen3.5-0.8B-Beaker-math-0adc73a9

## Resumen

Qwen3.5-0.8B-Beaker-math-0adc73a9 es una edición de pesos (weight editing) del modelo base Qwen/Qwen3.5-0.8B, publicada por el usuario rilixai en Hugging Face. No se trata de un fine-tuning convencional ni de un reentrenamiento: el autor aplica una modificación quirúrgica de tres columnas de pesos en las capas 18 y 22, generada automáticamente por la herramienta Beaker (withbeaker.ai) con el objetivo declarado de detener los bucles matemáticos del modelo base.

El modelo conserva la arquitectura y el pipeline del original (image-text-to-text, librería transformers, familia qwen3_5) y solo altera 3.072 números en total. Según la model card, esta edición eleva el rendimiento en MATH-500 del 7,6% al 39,5%, un salto notable para una intervención de tan solo tres columnas de la matriz `mlp.down_proj`.

Es relevante ahora como ejemplo práctico de programación en espacio de pesos (weight-space programming): demuestra que modificaciones mínimas y dirigidas pueden corregir comportamientos patológicos (bucles de razonamiento) sin reentrenar. El modelo tiene 873.438.784 parámetros reales, un repositorio de 1,8 GB y licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia qwen3_5, multimodal image-text-to-text) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, dtype bfloat16 en el ejemplo de uso) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B (revision `2fc06364715b967f1860aea9cf38778875588b17`) y mantiene intacta su arquitectura. La intervención consiste en la edición de tres columnas de salida de la matriz `mlp.down_proj`: en la capa 18, la columna del neurón 1261 se multiplica por 0,5; en la capa 22, las columnas de los neurones 387 y 573 se multiplican por 2. En total, 3.072 números modificados. Los valores exactos se publican en el directorio `edits/` del repositorio.

La edición fue escrita por Beaker, una herramienta de edición de pesos, usando GPT-6.1 Sol como modelo y 25 lecturas del modelo en una ejecución de aproximadamente 8 horas (run 0adc73a9). No hay datos sobre el dataset de entrenamiento original de Qwen3.5-0.8B, ni sobre RLHF/DPO, ni sobre innovaciones de decodificación. La evaluación reportada se realizó con thinking activado, temperatura 0,6, top-p 0,95, top-k 20, presence penalty 1,5, hasta 32.768 tokens nuevos, semilla 0 y 4 respuestas por problema, servido con vLLM 0.32.0 y corregido con math-verify 0.9.0.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del modelo base Qwen3.5-0.8B.
- Procesamiento image-text-to-text (pipeline declarado en la model card y en los tags).
- Razonamiento matemático con modo thinking activable mediante `enable_thinking=True` en la plantilla de chat.
- Resolución de problemas de matemáticas tipo MATH-500, con mejora sustancial frente al base según el autor.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible explícitamente; el modo thinking sugiere razonamiento encadenado, pero no se detalla.
- Capacidades multilingües: no disponible.
- Capacidades especiales: corrección de bucles matemáticos mediante edición de pesos; no se documentan visión, audio ni otras modalidades más allá del pipeline image-text-to-text.

## Casos de uso

- Evaluación de técnicas de weight editing: el modelo sirve como caso de estudio reproducible para investigar cómo tres columnas de pesos afectan al razonamiento matemático, comparando contra el base con los scripts de `edits/`.
- Investigación en corrección de bucles de razonamiento: útil para estudiar por qué los modelos pequeños entran en bucles en tareas matemáticas y si la edición de la MLP los mitiga, con métricas antes/después en MATH-500.
- Prototipado de tutores matemáticos ligeros: con 873 millones de parámetros y licencia Apache-2.0, puede desplegarse en entornos con recursos limitados para resolver problemas aritméticos y algebraicos con modo thinking.
- Despliegue en producción con vLLM: la model card documenta `vllm serve rilixai/Qwen3.5-0.8B-Beaker-math-0adc73a9`, lo que permite servirlo como endpoint compatible con OpenAI para pipelines internos.
- Benchmarking de herramientas automáticas de edición: Beaker generó la edición en unas 8 horas con 25 lecturas del modelo; este repositorio permite replicar y auditar el resultado frente a ediciones manuales.
- Experimentos de alineación ligera: como alternativa de bajo coste a un fine-tuning completo, sirve para probar si una intervención mínima basta para mejorar una capacidad concreta sin degradar el resto.

## Benchmarks y rendimiento

| Benchmark | Modelo base Qwen3.5-0.8B | Este modelo (Beaker math edit) |
|---|---|---|
| MATH-500 (500 problemas, 4 respuestas cada uno) | 7,6% | 39,5% |

Ajustes de evaluación: thinking activado, temperatura 0,6, top-p 0,95, top-k 20, presence penalty 1,5, hasta 32.768 tokens nuevos, semilla 0, math-verify 0.9.0, vLLM 0.32.0. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 873 millones de parámetros en bfloat16, los pesos ocupan aproximadamente 1,75 GB; en fp16, similar. Con cuantización de 8 bits, en torno a 0,9 GB; en 4 bits, aproximadamente 0,5 GB (estimaciones a partir del recuento de parámetros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para bfloat16 con overhead de contexto; RTX 4090, A100 y H100 son sobredimensionadas para este tamaño, pero válidas para servir varias instancias.
- Cabe en GPU de consumo: sí, en tarjetas con 6-8 GB o más (RTX 3060, RTX 4060, RTX 4070, etc.), asumiendo cuantización o contexto moderado.
- Opciones de despliegue: vLLM 0.32.0 (documentado en la model card, comando `vllm serve`), transformers con `AutoModelForImageTextToText` y `torch_dtype="bfloat16"`. No se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH-500 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Beaker-math-0adc73a9 | 873.438.784 | no disponible | 39,5% | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 873.438.784 (presumiblemente) | no disponible | 7,6% | Apache-2.0 | Hugging Face |
| Otras alternativas de ~1B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo ha sido validado en MATH-500; no hay evidencia de que la mejora se generalice a otros benchmarks matemáticos o a tareas generales.
- La edición se generó automáticamente con Beaker y GPT-6.1 Sol en una ejecución de unas 8 horas; no se documenta un análisis de regresiones en otras capacidades (código, visión, conversación).
- Sesgos conocidos: no disponibles; se heredan los del modelo base Qwen3.5-0.8B, no documentados en esta ficha.
- Riesgo de alucinación: no evaluado; el modo thinking con hasta 32.768 tokens nuevos puede aumentar la verbosidad y el coste.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia Apache-2.0 permite uso comercial, pero al ser una modificación de pesos del base, conviene revisar también las condiciones del modelo original.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación independiente de la comunidad.
- El pipeline declarado es image-text-to-text, pero no se documentan capacidades de visión específicas ni su calidad tras la edición.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rilixai/Qwen3.5-0.8B-Beaker-math-0adc73a9
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Run de Beaker: https://app.withbeaker.ai/public/runs/0adc73a9-b8d7-4cb2-85a7-0581f7b5dea3
- Blog de Beaker: https://www.withbeaker.ai/blog/weight-space-programming
- Web de Beaker: https://www.withbeaker.ai
