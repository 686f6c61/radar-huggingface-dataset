# RolanDorisTech/Qwen3.8-9B-Distill-MLX-4bit

## Resumen

Qwen3.8-9B-Distill-MLX-4bit es una versión cuantizada en formato MLX del modelo empero-ai/Qwen3.8-9B-Distill, un destilado comunitario del modelo Qwen/Qwen3.8-2.4T-A95B (arquitectura Qwen3.5) realizado por el usuario RolanDorisTech. El modelo resuelve el problema de ejecutar un LLM de aproximadamente 9.000 millones de parámetros con capacidades de razonamiento en hardware Apple Silicon, empleando cuantización dinámica mixta de 4 bits (oQ4e) que asigna más precisión a las capas sensibles y menos a las tolerantes al error.

La relevancia actual radica en que combina un contexto nativo de 262.144 tokens con un peso de repositorio de 5,3 GB, lo que permite su despliegue en equipos con memoria unificada de gama alta (medido en un M1 Max de 64 GB con un pico de 5,471 GB y 43,0 tok/s). No es un lanzamiento oficial de Alibaba ni de Qwen: es una destilación comunitaria de trazas de un modelo MoE masivo (2,4T de parámetros totales, 95B activos) hacia una arquitectura densa de 9B.

La licencia Apache-2.0 facilita su uso comercial, aunque la naturaleza experimental de la destilación y la ausencia de benchmarks de precisión publicados exigen validación propia antes de llevarlo a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con arquitectura Qwen3.5 (modelo base: Qwen/Qwen3.5-9B) |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | oQ4e (4 bits mixto con ponderación por importancia de activaciones/imatrix); familia disponible en oQ4e, oQ5e, oQ6e y oQ8e |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors (compatible con mlx-lm, oMLX, LM Studio y mlx-swift) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 8,95B de parámetros que hereda la arquitectura Qwen3.5-9B. No se trata de un modelo entrenado desde cero, sino de un destilado comunitario: se generaron aproximadamente 70.000 trazas del modelo profesor Qwen/Qwen3.8-2.4T-A95B (un MoE de 2,4 billones de parámetros totales y 95B activos) y se destilaron sobre la arquitectura densa de 9B. El resultado se publicó como empero-ai/Qwen3.8-9B-Distill y posteriormente fue cuantizado por RolanDorisTech.

La innovación técnica principal de esta ficha no está en el entrenamiento sino en la cuantización: oQ (oMLX Universal Dynamic Quantization) mide la sensibilidad real de cada capa al error de cuantización mediante datos de calibración y asigna un presupuesto de bits mixto, protegiendo capas críticas como `lm_head`, embeddings y los bloques primero y último. oQe añade una pasada de calibración con estadísticas de activación por canal (imatrix) para ponderar el error según la importancia de cada canal. La model card cita como fundamento SqueezeLLM (arXiv:2306.07629) y el observer `imatrix_mse` de LLM Compressor de vLLM. No se detalla la composición del dataset de destilación, el número de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: el modelo incorpora modo de razonamiento mediante etiquetas `<think>` en la plantilla de chat Qwen3 incluida (`chat_template.jinja`).
- Razonamiento multi-paso: la destilación proviene de un modelo profesor de gran escala, orientada a trazas de razonamiento.
- Capacidades de código y matemáticas: no hay benchmarks publicados que las cuantifiquen; la model card anuncia evaluaciones comunitarias futuras (MMLU, GSM8K, HumanEval).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada; la arquitectura base es de texto.
- Contexto largo: ventana nativa de 262.144 tokens, adecuada para documentos extensos y conversaciones multi-turno prolongadas.

## Casos de uso

- Asistente local de razonamiento en Mac: ejecución con `mlx_lm.generate` o LM Studio en un M1 Max o superior, aprovechando los 43,0 tok/s medidos y un pico de 5,471 GB de memoria para obtener respuestas razonadas con el modo `<think>` sin enviar datos a la nube.
- Análisis de documentos largos: la ventana de 262.144 tokens permite procesar informes, expedientes o bases de código completas en una sola pasada, algo inviable en modelos de contexto corto del mismo tamaño.
- Prototipado de pipelines de razonamiento: integración en scripts de Python mediante mlx-lm para tareas de descomposición de problemas, dado que el formato safetensors MLX es compatible con mlx-swift y permite llevarlo a aplicaciones macOS nativas.
- Generación de código asistida en local: uso en editores o CLI que consuman servidores compatibles con mlx-lm, adecuado para entornos con requisitos de privacidad donde no se permite el envío de código a APIs externas.
- Educación e investigación sobre cuantización: el modelo sirve como caso de estudio reproducible de la metodología oQe, comparando su salida frente a las variantes oQ5e, oQ6e y oQ8e del mismo destilado para medir la degradación por bits.
- Evaluación comparativa de destilaciones: al existir variantes de 2B, 4B y 9B con el mismo pipeline, permite estudiar la relación entre tamaño, trazas de destilación (30.000, 45.000 y 70.000) y calidad resultante en hardware de consumo.
- Despliegue en aplicaciones macOS distribuidas: mediante mlx-swift, el modelo puede empaquetarse dentro de apps nativas que requieran inferencia on-device con licencia Apache-2.0.

## Benchmarks y rendimiento

La model card no publica benchmarks de precisión (MMLU, GSM8K, HumanEval); indica explícitamente que se anunciarán en una futura actualización. Los únicos datos medidos son de rendimiento en inferencia local:

| Metrica | Valor | Entorno |
|---|---|---|
| Throughput | 43,0 tok/s | M1 Max 64 GB |
| Memoria pico | 5,471 GB | M1 Max 64 GB |
| Tamano del modelo | 4,9 GB | Repositorio de 5,3 GB |

El benchmark de metodología oQ citado en la model card (MMLU, 300 muestras, sobre Qwen3.5-35B-A3B) no evalúa este modelo y el propio autor advierte que no debe interpretarse como medida de calidad de los destilados Qwen3.8. Sus cifras son: 2 bits, 14,0 % uniforme frente a 64,0 % oQ; 3 bits, 76,3 % frente a 85,0 %; 4 bits, 79,7 % frente a 83,3 %.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 5,5 GB en pico para la variante oQ4e, según la medición del autor en M1 Max.
- GPU recomendadas: Apple Silicon con memoria unificada; el autor valida M1 Max de 64 GB. No hay datos publicados para otras GPU.
- Compatibilidad con GPU de consumo: el formato MLX está orientado a Apple Silicon; no es ejecutable directamente en GPU NVIDIA o AMD sin conversión a otro formato (no documentada en la información disponible).
- Opciones de despliegue: mlx-lm (CLI y API de Python), oMLX, LM Studio y mlx-swift.
- Latencia y throughput: 43,0 tok/s medidos en M1 Max 64 GB; no hay cifras para otros equipos.
- Alternativas de menor huella en la misma familia: oQ5e (6,0 GB), oQ6e (7,0 GB) y oQ8e (8,9 GB), útiles si la memoria lo permite y se busca menor degradación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-9B-Distill-MLX-4bit (este) | 8,95B | 262.144 | oQ4e (4 bits mixto) | Apache-2.0 | MLX safetensors |
| Qwen3.8-9B-Distill-MLX-8bit (oQ8e, misma familia) | 8,95B | 262.144 | oQ8e (8 bits) | Apache-2.0 | MLX safetensors |
| empero-ai/Qwen3.8-9B-Distill (base sin cuantizar) | 8,95B | 262.144 | FP16/BF16 (presumible) | No disponible | No disponible |

No se dispone de datos de benchmarks que permitan comparar la calidad frente a alternativas de otros autores; la model card no los publica y no se han encontrado en la información proporcionada.

## Limitaciones y advertencias

- No es un lanzamiento oficial de Alibaba ni de Qwen: es una destilación comunitaria de trazas de un modelo profesor, con posibles desviaciones de comportamiento respecto al original.
- Ausencia total de benchmarks de precisión publicados: no hay datos de MMLU, GSM8K ni HumanEval para este modelo, por lo que su calidad real frente al base o frente a otras cuantizaciones no está verificada.
- La metodología oQe está documentada con un benchmark sobre un modelo distinto (Qwen3.5-35B-A3B); el autor advierte que no constituye una medida de calidad de estos destilados.
- Riesgo de alucinación inherente a los modelos destilados de razonamiento, agravado por la cuantización a 4 bits en capas no protegidas.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento multilingüe sin evaluación propia.
- El formato MLX limita el despliegue a Apple Silicon; no hay ruta de conversión documentada a GGUF, vLLM o TGI.
- La licencia Apache-2.0 permite uso comercial, pero la procedencia de las trazas de destilación y las condiciones del modelo profesor no se detallan en la model card.
- Solo 362 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy reducido y riesgo de errores no detectados por la comunidad.
- El contexto de 262.144 tokens es el nativo declarado; no se documenta el rendimiento efectivo en ventanas extremas ni el consumo de memoria asociado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RolanDorisTech/Qwen3.8-9B-Distill-MLX-4bit
- Modelo base de la destilación: https://huggingface.co/empero-ai/Qwen3.8-9B-Distill
- Documentación de la metodología oQ: https://github.com/jundot/omlx/blob/main/docs/oQ_Quantization.md
- Paper SqueezeLLM: https://arxiv.org/abs/2306.07629
- Documentación de imatrix en LLM Compressor (vLLM): https://docs.vllm.ai/projects/llm-compressor/en/latest/examples/imatrix/
- Canal del autor en YouTube: https://www.youtube.com/@RolanDorisTech
