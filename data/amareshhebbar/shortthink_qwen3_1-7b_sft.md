# AmareshHebbar/ShortThink_Qwen3_1.7B_SFT

## Resumen

ShortThink_Qwen3_1.7B_SFT es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3-1.7B, desarrollado por el usuario AmareshHebbar, cuyo objetivo es reducir el numero de tokens de razonamiento generados sin sacrificar precision en tareas matematicas. La idea central es que los modelos de razonamiento dedican una cantidad desproporcionada de tokens a problemas faciles; ShortThink ensena al modelo a comprimir mas los problemas sencillos y menos los dificiles, manteniendo la exactitud.

El modelo forma parte de una coleccion de seis variantes (ShortThink collection) entrenadas sobre los mismos datos autogenerados pero con algoritmos distintos. La tecnica empleada es rejection sampling finetuning: se muestrean multiples trazas de razonamiento del modelo base, se selecciona la traza valida y correcta mas corta por pregunta, y se entrena sobre ella mediante LoRA en todas las capas lineales, fusionada posteriormente en safetensors bf16 completos.

Con 1.720.574.976 parametros y licencia Apache 2.0, es relevante porque demuestra que un ajuste fino ligero puede reducir el coste de inferencia de un modelo de razonamiento pequeno de forma sustancial, un aspecto critico para despliegues a escala donde el coste por consulta y la latencia importan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino LoRA fusionado |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-1.7B; max_len de entrenamiento 3584) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16); incluye adaptador LoRA en `adapter/` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only de la familia Qwen3. El ajuste se realiza mediante LoRA sobre todas las capas lineales (r=64, alpha=128, dropout=0.0), con learning rate 1e-4, una epoca, micro-batch de 4, acumulacion de gradiente de 8, warmup ratio de 0.03 y longitud maxima de 3584 tokens. Los adaptadores se fusionan en pesos bf16 completos.

Los datos de entrenamiento proceden del dataset AmareshHebbar/ShortThink_Traces_Qwen3_1.7B, generado por el propio autor mediante rejection sampling: para cada pregunta se muestrean trazas del modelo base y se conserva la traza correcta mas corta. No se menciona uso de RLHF ni DPO; es SFT puro. La innovacion principal es el enfoque de compresion adaptativa por dificultad: el modelo aprende a pensar menos en problemas faciles y a mantener el razonamiento extendido en los dificiles.

## Capacidades

- Generacion de texto conversacional y razonamiento paso a paso en modo thinking.
- Razonamiento matematico con formato de respuesta final en `\boxed{}`.
- Razonamiento conciso: compresion de trazas de pensamiento manteniendo precision.
- Compresion adaptativa por dificultad del problema.
- Compatible con text-generation-inference y endpoints compatibles.
- Soporte de chat template de Qwen3 con `enable_thinking=True`.
- No se documenta soporte de tool calling, agentes, vision ni audio.
- Capacidades multilingues limitadas al ingles segun la model card.

## Casos de uso

- Evaluacion de razonamiento matematico a bajo coste: el modelo reduce tokens generados frente al base en thinking mode, lo que abarata pipelines de grading automatico sobre MATH500 o GSM8K.
- Servicio de resolucion de problemas matematicos en produccion: con latencia p50 inferior al base en modo thinking (segun la tabla del autor), es adecuado para APIs de tutoria o calculo asistido.
- Investigacion sobre eficiencia de razonamiento: sirve como punto de comparacion dentro de la coleccion ShortThink para estudiar el trade-off precision/tokens entre algoritmos de compresion.
- Despliegue en hardware modesto: con 1.7B parametros y pesos bf16 (repo de 3.7 GB), cabe en GPUs de consumo para prototipado e inferencia por lotes.
- Generacion de cadenas de razonamiento cortas para destilacion: las trazas concisas pueden usarse como datos de entrenamiento para modelos menores.
- Benchmarking de tecnicas de prompting vs finetuning: la model card compara prompting conciso, no-thinking y budget forcing, util para decidir estrategia sin reentrenar.
- Educacion automatizada: explicaciones paso a paso comprimidas para problemas de dificultad baja o media.

## Benchmarks y rendimiento

Resultados publicados en la model card (MATH500 y GSM8K con 1 muestra, AIME 2024 con 4 muestras, grading con `math_verify`, latencia a batch size 1 con vLLM):

| Modelo | MATH500 acc | MATH500 tokens | GSM8K acc | GSM8K tokens | Tokens por acierto | Cambio tokens vs base thinking | Latencia p50 (s) | Coste por 1k consultas (USD) |
|---|---|---|---|---|---|---|---|---|
| Qwen3 1.7B (thinking) | 70.0 | 3958 | 87.5 | 2205 | 4087 | mismo | 36.8 | 0.419 |
| Qwen3 1.7B (thinking + prompt conciso) | 78.6 | 3061 | 88.6 | 1370 | 2721 | 28.1% menos | 23.4 | 0.277 |
| Qwen3 1.7B (no thinking) | 72.8 | 901 | 80.4 | 313 | 813 | 80.3% menos | 6.3 | 0.056 |
| Qwen3 1.7B (budget forcing 1024) | 45.4 | 1473 | 70.0 | 1219 | 2494 | 56.3% menos | 10.6 | 0.101 |

La model card indica que la tabla de resultados del modelo ShortThink SFT se encuentra en la coleccion, pero los valores numericos concretos de esta variante no aparecen en la informacion proporcionada. Las columnas AIME24 y MMLU figuran vacias en la tabla citada. No se han publicado en la informacion disponible los resultados especificos de este checkpoint.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 3.5-4 GB solo para pesos; con cache KV y overhead, en torno a 5-6 GB para contexto moderado.
- VRAM estimada en cuantizacion 8 bits: aproximadamente 2 GB de pesos; en 4 bits, alrededor de 1 GB (cuantizaciones no publicadas por el autor, requieren conversion).
- GPU recomendadas: A100, H100 o L40S para throughput alto; RTX 4090, RTX 3090 o RTX 4080 para inferencia individual.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en bf16; en 4-6 GB con cuantizacion.
- Opciones de despliegue: vLLM (usado por el autor en la evaluacion), transformers, text-generation-inference; llama.cpp u Ollama requeririan conversion a GGUF no publicada.
- Latencia: p50 de 36.8 s para el base en thinking mode segun la tabla; la latencia de esta variante no se detalla en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH500 acc | Tokens MATH500 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ShortThink_Qwen3_1.7B_SFT | 1.72B | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face |
| Qwen3 1.7B (thinking) | 1.72B | no disponible | 70.0 | 3958 | Apache 2.0 | Hugging Face |
| Qwen3 1.7B (no thinking) | 1.72B | no disponible | 72.8 | 901 | Apache 2.0 | Hugging Face |
| Qwen3 1.7B (budget forcing 1024) | 1.72B | no disponible | 45.4 | 1473 | Apache 2.0 | Hugging Face |

La comparacion directa con otras variantes de la coleccion ShortThink (seis modelos) no puede completarse porque sus resultados no figuran en la informacion proporcionada.

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta evaluado.
- Riesgo de alucinacion inherente a modelos de razonamiento pequenos, especialmente en problemas fuera del dominio matematico.
- La evaluacion se limita a MATH500, GSM8K y AIME 2024; no hay datos de MMLU ni de tareas de codigo en la informacion disponible.
- El entrenamiento usa una sola epoca y LoRA r=64; puede no capturar toda la distribucion de problemas dificiles.
- La compresion agresiva de trazas puede degradar la precision en problemas de alta dificultad no representados en el dataset.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3-1.7B para uso comercial.
- No se documentan cuantizaciones oficiales; el despliegue en hardware limitado requiere conversion manual.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AmareshHebbar/ShortThink_Qwen3_1.7B_SFT
- Dataset de entrenamiento: https://huggingface.co/datasets/AmareshHebbar/ShortThink_Traces_Qwen3_1.7B
- Coleccion ShortThink: https://huggingface.co/collections/AmareshHebbar/shortthink-6afb0d2f2ea9eaf3f24b9363
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
