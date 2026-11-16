# AmareshHebbar/ShortThink_Qwen3_1.7B_DPO

## Resumen

ShortThink_Qwen3_1.7B_DPO es un ajuste fino por preferencias (DPO) del modelo Qwen3-1.7B de Alibaba, desarrollado por AmareshHebbar dentro de la colección ShortThink. El objetivo del modelo es reducir el número de tokens de razonamiento (thinking tokens) que generan los modelos de razonamiento en problemas fáciles, manteniendo la precisión y comprimiendo más los problemas sencillos que los difíciles. Parte del modelo SFT `AmareshHebbar/ShortThink_Qwen3_1.7B_SFT` como referencia congelada.

El modelo tiene 1.720.574.976 parámetros (aproximadamente 1,7 mil millones) y se distribuye en formato safetensors bf16 fusionado, con licencia Apache 2.0. Está pensado para escenarios donde el coste por token de razonamiento importa: inferencia en producción con vLLM, evaluación comparativa de estrategias de compresión de pensamiento y experimentación con DPO sobre modelos pequeños de razonamiento.

Es relevante ahora porque cuantifica de forma explícita el compromiso entre precisión y tokens generados frente a alternativas de prompting (prompt conciso, desactivar thinking, budget forcing), lo que permite decidir con datos si el ajuste fino supera a las soluciones puramente basadas en prompt.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-1.7B), ajuste DPO con LoRA fusionado |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usa max_len 4608; el contexto del base Qwen3-1.7B no se especifica en la informacion) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16 fusionado); incluye adaptador LoRA en `adapter/` |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-1.7B, un transformer decoder-only, sobre el que se aplica DPO (Direct Preference Optimization) partiendo del modelo SFT `ShortThink_Qwen3_1.7B_SFT` como referencia congelada. La señal de preferencia se construye por pares: la traza correcta más corta como *chosen* y la traza correcta más larga para la misma pregunta como *rejected*. El entrenamiento usa LoRA sobre todas las capas lineales (r=64, alpha=128, dropout 0.0) que posteriormente se fusiona en safetensors bf16 completos.

Hiperparámetros de entrenamiento: learning rate 5e-6, 1 época, micro-batch 1 con acumulación de gradiente 16, warmup ratio 0.05, longitud máxima 4608, `logits_chunk` 1024, beta 0.1 y 1500 ejemplos como máximo. Los datos provienen del dataset `AmareshHebbar/ShortThink_Traces_Qwen3_1.7B`, generado automáticamente por el autor. El repositorio incluye curvas de pérdida y logs en `training/` y resultados crudos de evaluación con generaciones de muestra en `eval/`.

## Capacidades

- Generación de texto conversacional con plantilla de chat de Qwen3 y modo thinking activable (`enable_thinking=True`).
- Razonamiento matemático paso a paso con salida final en formato `\boxed{}`.
- Razonamiento conciso: aprende a comprimir trazas correctas, más agresivamente en problemas fáciles.
- Generación de código y tareas generales de texto (heredadas del modelo base Qwen3-1.7B).
- Soporte de tool calling y function calling: no disponible en la información proporcionada (no se documenta explícitamente).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card (idioma declarado: en).
- Capacidades especiales: modo thinking con presupuesto de tokens variable; no se documenta visión ni audio.

## Casos de uso

- Razonamiento matemático con coste controlado: el modelo resuelve problemas tipo MATH500 o GSM8K generando menos tokens que el base en modo thinking (hasta un 28,1 % menos con prompt conciso, según la tabla del autor), lo que reduce el coste por consulta en producción.
- Evaluación de estrategias de compresión de pensamiento: sirve como punto de comparación frente a prompting conciso, desactivar thinking o budget forcing, ya que el autor publica métricas de precisión, tokens y latencia para todas ellas.
- Despliegue en inferencia de bajo coste: con 1,7 B parámetros en bf16 y latencia p50 de 36,8 s a batch 1 en vLLM (según la tabla del autor), es viable en GPUs de gama media para cargas moderadas.
- Tutoría o asistencia matemática interactiva: la plantilla de chat y el formato `\boxed{}` permiten integrarlo en interfaces conversacionales que muestran el razonamiento y la respuesta final por separado.
- Generación de trazas de razonamiento para destilación o datasets: las salidas thinking comprimidas pueden usarse como datos de entrenamiento para modelos más pequeños.
- Investigación en DPO sobre modelos pequeños: el repositorio incluye adaptador LoRA, logs y resultados de evaluación, lo que facilita reproducir o extender el experimento.
- Clasificación y extracción de texto en inglés: como modelo de texto general de 1,7 B, puede emplearse en tareas de NLP ligeras donde el contexto requerido no exceda la ventana del base.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (mismas prompts, ajustes de muestreo y grading con `math_verify`; MATH500 y GSM8K con 1 muestra por problema, AIME 2024 con 4; latencia a batch 1 con vLLM):

| Modelo | MATH500 acc | MATH500 tokens | GSM8K acc | GSM8K tokens | Tokens por acierto | Cambio vs thinking base | AIME24 acc | Latencia p50 (s) | Coste por 1k consultas (USD) |
|---|---|---|---|---|---|---|---|---|---|
| Qwen3 1.7B (thinking) | 70,0 | 3958 | 87,5 | 2205 | 4087 | mismo | no disponible | 36,8 | 0,419 |
| Qwen3 1.7B (thinking + prompt conciso) | 78,6 | 3061 | 88,6 | 1370 | 2721 | 28,1 % menos | no disponible | 23,4 | 0,277 |
| Qwen3 1.7B (sin thinking) | 72,8 | 901 | 80,4 | 313 | 813 | 80,3 % menos | no disponible | 6,3 | 0,056 |
| Qwen3 1.7B (budget forcing 1024) | 45,4 | 1473 | 70,0 | 1219 | 2494 | 56,3 % menos | no disponible | 10,6 | 0,101 |
| ShortThink SFT | 73,4 | 3767 | 89,0 | 2041 | 3713 | 5,8 % menos | no disponible | 44,2 | 0,386 |

Nota: la model card no incluye una fila con los resultados del modelo DPO en esta tabla, por lo que sus cifras concretas no están disponibles en la información proporcionada. La sección "Compression by difficulty (MATH500)" aparece vacía en el material recibido.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,4 GB solo para pesos (1,72 B × 2 bytes), más overhead de KV cache y activaciones; en la práctica, 6-8 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,7 GB de pesos; en 4 bits, alrededor de 0,9 GB (estimaciones a partir del número de parámetros; el autor no publica cuantizaciones).
- GPU recomendadas: A100/H100 para throughput alto con vLLM; RTX 4090, RTX 3090 o L40S para cargas medias; GPUs consumer de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) para inferencia en bf16 o cuantizada.
- Cabe en GPU consumer: sí, gracias a los 1,7 B parámetros.
- Opciones de despliegue: vLLM (usado por el autor en la evaluación), transformers, text-generation-inference (tag `text-generation-inference`), endpoints compatibles; llama.cpp/Ollama no se documentan en la información disponible.
- Latencia y throughput: p50 de 36,8 s a batch 1 con vLLM en modo thinking para el base (según la tabla del autor); el coste estimado es de 0,419 USD por 1k consultas asumiendo 1,0 USD/hora de GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MATH500 acc | GSM8K acc | Tokens por acierto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| ShortThink_Qwen3_1.7B_DPO | 1,72 B | no disponible | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face |
| Qwen3 1.7B (thinking) | 1,7 B | no disponible | 70,0 | 87,5 | 4087 | Apache 2.0 | Hugging Face |
| Qwen3 1.7B (sin thinking) | 1,7 B | no disponible | 72,8 | 80,4 | 813 | Apache 2.0 | Hugging Face |
| ShortThink SFT | 1,72 B | no disponible | 73,4 | 89,0 | 3713 | Apache 2.0 | Hugging Face |

La comparación se limita a variantes del mismo base y al modelo SFT previo, porque la información proporcionada no incluye otros modelos de razonamiento pequeños comparables.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está evaluado.
- Riesgo de alucinación inherente a modelos de 1,7 B, especialmente en razonamiento matemático de varios pasos y problemas tipo AIME.
- El ajuste DPO se realizó sobre 1500 ejemplos como máximo y 1 época; el riesgo de sobreajuste al estilo de traza del dataset es relevante.
- El modelo está optimizado para comprimir trazas correctas; no hay garantía de que la compresión preserve la corrección en dominios fuera de matemáticas.
- La model card no publica la fila de resultados del propio DPO en la tabla comparativa, lo que impide verificar su ganancia frente al SFT y al base con los datos disponibles.
- El contexto máximo de entrenamiento es 4608 tokens; secuencias más largas pueden degradar el rendimiento.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen3-1.7B.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AmareshHebbar/ShortThink_Qwen3_1.7B_DPO
- Modelo SFT base: https://huggingface.co/AmareshHebbar/ShortThink_Qwen3_1.7B_SFT
- Dataset de entrenamiento: https://huggingface.co/datasets/AmareshHebbar/ShortThink_Traces_Qwen3_1.7B
- Colección ShortThink: https://huggingface.co/collections/AmareshHebbar/shortthink-6afb0d2f2ea9eaf3f24b9363
- Modelo base original: https://huggingface.co/Qwen/Qwen3-1.7B
