# mariklolik228/dl-course-hw7-compression

## Resumen

`mariklolik228/dl-course-hw7-compression` es un repositorio de artefactos de compresión y destilación construido sobre Qwen3-8B, publicado como entrega de un trabajo académico (hw7) de un curso de deep learning. No es un modelo nuevo entrenado desde cero, sino una colección de nueve checkpoints: ocho variantes cuantizadas de Qwen3-8B (AWQ, GPTQ y SmoothQuant en configuraciones W4 y W8A8) y un estudiante obtenido por SFT completo con etiquetas duras generadas por Qwen3-32B. El objetivo es evaluar hasta qué punto técnicas de compresión y destilación preservan el rendimiento de un modelo base en una tarea concreta de comprensión del lenguaje natural en ruso.

La tarea evaluada es el dataset MASSIVE (AmazonScience) en configuración ru-RU, orientada a clasificación de intenciones y extracción de slots (NLU tipo asistente conversacional). La métrica agregada es `Quality = 0.5 × Intent Accuracy + 0.5 × Slot Micro F1`, evaluada con parser JSON estricto, decodificación greedy, seed 42, thinking desactivado y un máximo de 128 tokens nuevos sobre un slice de desarrollo de 256 ejemplos.

Su relevancia es fundamentalmente metodológica y reproducible: incluye código, predicciones, respuestas del profesor y un manifiesto inmutable con SHA256, lo que permite auditar cada checkpoint. La licencia es Apache 2.0 y el tokenizador se conserva del modelo original. El repositorio pesa 51,7 GB en total y está pensado para Transformers 4.55.2 junto con compressed-tensors 0.12.2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-8B); checkpoints cuantizados y un estudiante SFT |
| Parametros totales | 8B (modelo base Qwen3-8B); no se especifica recuento por checkpoint |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | AWQ (W4), GPTQ (grupo 64 y 128, y variante lastbf16), SmoothQuant (W8A8, alpha 0.5 y 0.8); estudiante en BF16 |
| Idiomas soportados | Ruso (ru); tokenizador de Qwen3-8B |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con compressed-tensors para las variantes cuantizadas) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-8B (revision `b968826d9c46dd6066d109eabc6255188de91218`), un transformer decoder-only. Sobre él se aplican dos familias de técnicas. Por un lado, cuantización post-entrenamiento: AWQ calibrado sobre MASSIVE y sobre WikiText, GPTQ con grupos de 64 y 128 y una variante `lastbf16`, y SmoothQuant en modo W8A8 con alpha 0.5 y 0.8. Los checkpoints cuantizados conservan pesos BF16 con cuantización simulada registrada; en W8A8 las activaciones se cuantizan dinámicamente. Por otro lado, destilación por etiquetas duras: se generan respuestas del profesor Qwen3-32B (revision `9216db5781bf21249d130ec9da846c4624c16137`) sobre el split de entrenamiento y se hace SFT completo del estudiante (configuración s1024_e3), dando lugar al checkpoint `student_sft` de 16,382 GB.

La calibración y las respuestas del profesor se obtienen exclusivamente sobre train; el split de test no se utiliza. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de MASSIVE ru-RU, ni si hubo RLHF o DPO. Tampoco se midieron la velocidad de los kernels INT4/INT8 ni el ahorro real de memoria en runtime, lo que limita las conclusiones sobre eficiencia.

## Capacidades

- Generación de texto y clasificación de intenciones en ruso, evaluadas sobre MASSIVE ru-RU.
- Extracción de slots (slot filling) con salida en JSON estricto.
- Razonamiento de un solo paso orientado a NLU conversacional; el modo thinking se desactiva en la evaluación.
- Soporte de instrucciones de formato (JSON) bajo decodificación greedy.
- Capacidades multilingües heredadas de Qwen3-8B, aunque el ajuste y la evaluación se centran en ruso.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Clasificación de intenciones en asistentes conversacionales en ruso: el modelo puede asignar una intención a cada turno de usuario, aprovechando el ajuste sobre MASSIVE ru-RU y la métrica de Intent Accuracy.
- Extracción de slots para formularios y comandos: útil para poblar entidades estructuradas (fechas, lugares, nombres) a partir de lenguaje natural, con salida JSON validada por parser estricto.
- Despliegue con restricciones de memoria: las variantes AWQ y GPTQ reducen el peso a ~6,07 GB, lo que permite servir el modelo en GPUs de gama consumer con menor VRAM que el BF16 original.
- Evaluación comparativa de técnicas de compresión: sirve como banco de pruebas reproducible para medir la degradación de AWQ, GPTQ y SmoothQuant frente al baseline en una tarea NLU concreta.
- Destilación de profesor grande a estudiante 8B: el checkpoint `student_sft` (0,6114 de Quality) supera al profesor (0,5823), por lo que puede usarse como referencia para pipelines de destilación con etiquetas duras.
- Investigación en reproducibilidad: el manifiesto SHA256 y el script `restore_artifacts.py` permiten reconstruir y auditar cada checkpoint en entornos de investigación.
- Prototipado de NLU en ruso sin infraestructura de gran escala: al caber en GPUs de 24 GB en cuantización W4, es viable para pruebas locales y validación de pipelines antes de escalar.

## Benchmarks y rendimiento

Evaluación sobre un slice de desarrollo de 256 ejemplos de MASSIVE ru-RU. Quality = 0.5 × Intent Accuracy + 0.5 × Slot Micro F1. Greedy, seed 42, thinking off, batch 4, máximo 128 tokens nuevos.

| Checkpoint | Quality | Peso (GB, 10^9 bytes) |
|---|---:|---:|
| Baseline (Qwen3-8B) | 0.2912 | no disponible |
| Profesor Qwen3-32B | 0.5823 | no disponible |
| quantized/awq_massive | 0.3141 | 6.071 |
| quantized/awq_wikitext | 0.4088 | 6.071 |
| quantized/gptq_g128 | 0.4037 | 6.071 |
| quantized/gptq_n64 | 0.3248 | 6.071 |
| quantized/gptq_g64 | 0.3553 | 6.180 |
| quantized/sq_a05 | 0.3918 | 9.439 |
| quantized/sq_a08 | 0.2564 | 9.439 |
| quantized/gptq_lastbf16 | 0.4097 | 6.358 |
| student_sft (s1024_e3) | 0.6114 | 16.382 |

El estudiante alcanza el 104,99 % del quality del profesor. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no medida en la información disponible; los pesos van de ~6,07 GB (W4/W8A8) a 16,382 GB (estudiante BF16), sin contar overhead de activaciones ni KV cache.
- GPU recomendadas: no especificadas por el autor; por tamaño de pesos, las variantes de ~6 GB encajan en GPUs consumer de 8-12 GB, y el estudiante BF16 requiere al menos 24 GB (RTX 3090/4090, A100, H100).
- Cabe en GPU consumer: sí, las variantes cuantizadas de ~6 GB; el estudiante BF16 requiere gama alta.
- Opciones de despliegue: Transformers 4.55.2 con compressed-tensors 0.12.2; el autor proporciona `load_model` en `evaluate.py`. Para W8A8 se usa la carga comprimida estándar seguida de `ModelCompressor.decompress_model`; para W4, `run_compressed=False`. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no medidos; el autor indica explícitamente que la velocidad de los kernels INT4/INT8 y el ahorro de memoria en runtime no se evaluaron.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Quality (MASSIVE ru-RU) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repo: student_sft | 8B (heredado) | no disponible | 0.6114 | Apache 2.0 | Hugging Face |
| Este repo: gptq_lastbf16 | 8B (heredado) | no disponible | 0.4097 | Apache 2.0 | Hugging Face |
| Qwen3-8B (baseline) | 8B | no disponible en esta ficha | 0.2912 | Apache 2.0 | Hugging Face |
| Qwen3-32B (profesor) | 32B | no disponible en esta ficha | 0.5823 | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks estándar para comparar con otras alternativas de la misma categoría; la comparación se limita a los checkpoints del propio repositorio y al modelo base.

## Limitaciones y advertencias

- El repositorio es una entrega académica, no un modelo listo para producción; los checkpoints son artefactos de experimentación.
- La evaluación se realiza sobre un único slice de 256 ejemplos, lo que limita la significación estadística de las diferencias entre checkpoints.
- El idioma de ajuste y evaluación es únicamente ruso; el rendimiento en castellano u otros idiomas no está medido.
- No se midieron latencia, throughput ni ahorro real de memoria de los kernels cuantizados, por lo que las ventajas de eficiencia son teóricas.
- Las variantes W8A8 requieren un flujo de carga específico (`ModelCompressor.decompress_model`) y conservan la cuantización simulada de activaciones FROZEN; un uso incorrecto puede degradar resultados.
- Riesgo de alucinación y sesgos heredados de Qwen3-8B, no evaluados en esta ficha.
- La licencia Apache 2.0 permite uso comercial, pero el dataset MASSIVE está bajo CC BY 4.0 y debe respetarse su atribución.
- El repositorio ocupa 51,7 GB; la descarga completa puede ser costosa si solo se necesita un checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mariklolik228/dl-course-hw7-compression
- Código y artefactos en GitHub: https://github.com/mariklolik/dl-course-ai/tree/main/hw7
- Dataset MASSIVE: https://huggingface.co/datasets/AmazonScience/massive
- Dataset WikiText (calibración AWQ): https://huggingface.co/datasets/Salesforce/wikitext
- Licencia CC BY 4.0 del dataset: https://creativecommons.org/licenses/by/4.0/
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
