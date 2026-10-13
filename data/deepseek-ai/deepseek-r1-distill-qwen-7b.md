# deepseek-ai/DeepSeek-R1-Distill-Qwen-7B

". Also mention the risk of forcing thinking.

Let me write.

Intended output — Spanish from Spain. Only first word of titles capitalized. No emojis. Tables.

Let me write the ficha.

For "Parametros activos" - it's a dense model, not MoE. I can omit the row or mark "no aplica (modelo denso)". The instructions say only include if MoE. So I'll omit it.

Comparativas: compare with DeepSeek-R1-Distill-Qwen-14B, DeepSeek-R1-Distill-Llama-8B, Qwen2.5-7B-Instruct, and maybe Mistral-7B or QwQ-32B. Let me use the distill family siblings.

Let me construct the benchmarks table carefully.

From the paper (Table 5 - distilled models):

| Model | AIME 2024 pass@1 | MATH-500 pass@1 | GPQA Diamond pass@1 | LiveCodeBench pass@1 | Codeforces rating |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-1.5B | 28.9 | 83.9 | 33.8 | 16.9 | 954 |
| DeepSeek-R1-Distill-Qwen-7B | 55.5 | 92.8 | 49.1 | 37.6 | 1189 |
| DeepSeek-R1-Distill-Qwen-14B | 69.7 | 93.9 | 59.1 | 53.1 | 1481 |
| DeepSeek-R1-Distill-Qwen-32B | 72.6 | 94.3 | 62.1 | 57.2 | 1691 |
| DeepSeek-R1-Distill-Llama-8B | 50.4 | 89.1 | 49.0 | 39.6 | 1205 |
| DeepSeek-R1-Distill-Llama-70B | 70.0 | 94.5 | 65.2 | 57.5 | 1633 |

And the comparison with Claude/GPT:
| GPT-4o-0513 | 9.3 | 74.6 | 49.9 | 32.9 | 759 |
| Claude-3.5-Sonnet-1022 | 16.0 | 78.3 | 65.0 | 38.9 | 717 |
| OpenAI o1-mini | 63.6 | 90.0 | 60.0 | 53.8 | 1820 |

I'll present these.

Now writing final.## Resumen

DeepSeek-R1-Distill-Qwen-7B es un modelo de razonamiento denso de 7.615.616.512 parámetros (aproximadamente 7.6B) desarrollado por DeepSeek AI y publicado el 20 de enero de 2025. Se obtiene mediante destilación por ajuste fino supervisado (SFT) sobre la base Qwen2.5-7B, utilizando datos de razonamiento generados por el modelo mayor DeepSeek-R1. No es un modelo entrenado con RL desde cero, sino un alumno que hereda los patrones de cadena de pensamiento (chain-of-thought) del profesor.

El objetivo es ofrecer capacidades de razonamiento de nivel cercano a OpenAI-o1 en un tamaño que quepa en hardware de consumo. Según el paper asociado (arXiv:2501.12948), la familia destilada incluye versiones de 1.5B, 7B, 8B, 14B, 32B y 70B basadas en Qwen2.5 y Llama3, y la variante de 7B compite por encima de la mayoría de modelos densos de su tamaño en matemáticas y código.

Es relevante ahora porque combina razonamiento explícito, licencia MIT (uso comercial sin fricción) y un tamaño desplegable en una sola GPU de consumo. Acumula más de 346.000 descargas y 925 likes en Hugging Face, lo que lo convierte en una de las referencias abiertas más usadas para tareas de razonamiento y matemáticas en el rango de 7B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso basado en Qwen2.5 |
| Parametros totales | 7.615.616.512 (aproximadamente 7.6B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (128K) segun la arquitectura base Qwen2.5 |
| Tipos de cuantizacion | no especificados por el autor; se soportan cuantizaciones GGUF/AWQ/GPTQ de la comunidad |
| Idiomas soportados | no disponible; entrenamiento principal en ingles y chino |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de la familia Qwen2.5, con la misma topología que el modelo base Qwen2.5-7B (atención con RoPE, normalización RMSNorm, etc.). No incorpora mezcla de expertos ni mecanismos híbridos tipo SSM. El contexto nativo es de 128K tokens.

El entrenamiento de esta variante es un ajuste fino supervisado (SFT) sobre el checkpoint Qwen2.5-7B usando datos de razonamiento generados por DeepSeek-R1. No hubo RLHF ni DPO en esta fase de destilación; la innovación reside en trasladar los patrones de razonamiento (autoverificación, reflexión y cadenas de pensamiento largas) del modelo profesor a un alumno pequeño, en lugar de redescubrirlos mediante RL sobre el modelo pequeño. La familia completa DeepSeek-R1 se documenta en el paper arXiv:2501.12948.

## Capacidades

- Generacion de texto y razonamiento explicito paso a paso, con cadenas de pensamiento largas.
- Razonamiento matematico competitivo para su tamano (AIME, MATH-500).
- Generacion de codigo y resolucion de problemas de programacion (LiveCodeBench, Codeforces).
- Modo de pensamiento (thinking mode) que emite un bloque `thinking` antes de la respuesta final.
- Conversacion multi-turno (tag `conversational`).
- Tool calling / function calling: no confirmado de forma nativa en la model card; depende del soporte del framework de despliegue.
- Capacidades de agente y razonamiento multi-paso: no documentadas explicitamente por el autor.
- Capacidades multilingues: no especificadas; el foco de entrenamiento es ingles y chino.
- Vision o audio: no soportados.

## Casos de uso

- Resolucion de problemas matematicos: el modelo puede abordar problemas de olimpiada y calculo paso a paso gracias a sus cadenas de razonamiento largas y a su rendimiento en MATH-500 y AIME 2024.
- Generacion y revision de codigo: util para completar funciones, explicar algoritmos y resolver ejercicios tipo Codeforces, con capacidad de mantener contexto de repositorio extenso gracias a los 128K tokens.
- Tutoria educativa: puede desglosar razonamientos complejos para explicar pasos intermedios en fisica, matematicas o logica.
- Analisis de documentos largos: la ventana de 128K tokens permite procesar informes, articulos o contratos completos en una sola pasada.
- Prototipado de asistentes conversacionales: al ser denso y de 7.6B, es facil de servir en una sola GPU para demos y entornos de desarrollo.
- Pipelines de razonamiento por lotes: se puede integrar en vLLM o SGLang para procesar grandes volumenes de consultas con requisitos de razonamiento en entornos de investigacion.
- Extraccion de conclusiones a partir de datos estructurados: util para tareas de analisis donde se requiere un razonamiento encadenado sobre tablas o series.
- Evaluacion y destilacion: sirve como modelo de referencia abierto con licencia MIT para comparar tecnicas de destilacion o generar nuevos datos sinteticos.

## Benchmarks y rendimiento

Datos publicados en el paper de DeepSeek-R1 (arXiv:2501.12948). Se comparan con modelos similares de la misma epoca.

| Modelo | AIME 2024 pass@1 | MATH-500 pass@1 | GPQA Diamond pass@1 | LiveCodeBench pass@1 | Codeforces (rating) |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-7B | 55.5 | 92.8 | 49.1 | 37.6 | 1189 |
| DeepSeek-R1-Distill-Qwen-1.5B | 28.9 | 83.9 | 33.8 | 16.9 | 954 |
| DeepSeek-R1-Distill-Qwen-14B | 69.7 | 93.9 | 59.1 | 53.1 | 1481 |
| DeepSeek-R1-Distill-Llama-8B | 50.4 | 89.1 | 49.0 | 39.6 | 1205 |
| GPT-4o-0513 | 9.3 | 74.6 | 49.9 | 32.9 | 759 |
| Claude-3.5-Sonnet-1022 | 16.0 | 78.3 | 65.0 | 38.9 | 717 |
| OpenAI o1-mini | 63.6 | 90.0 | 60.0 | 53.8 | 1820 |

## Requisitos de hardware

- VRAM en BF16/FP16: aproximadamente 15.2 GB (coincide con el tamano del repo, 15.2 GB).
- VRAM en INT8: aproximadamente 7.6-8 GB.
- VRAM en INT4 (GGUF Q4_K_M): aproximadamente 4.5-5 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S, RTX 4090 (24 GB), RTX 3090 (24 GB), A6000.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB) con cuantizacion, y en RTX 4060 Ti 16 GB en INT8 o INT4.
- Opciones de despliegue: vLLM, SGLang, llama.cpp, Ollama, Text Generation Inference (TGI), transformers. El autor recomienda usar temperature entre 0.5 y 0.7 (0.6 como valor optimo) y evitar el system prompt.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento (AIME 2024) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-7B | 7.6B | 128K | 55.5 | MIT | Hugging Face |
| DeepSeek-R1-Distill-Qwen-14B | 14B | 128K | 69.7 | MIT | Hugging Face |
| DeepSeek-R1-Distill-Llama-8B | 8B | 128K | 50.4 | MIT | Hugging Face |
| Qwen2.5-7B-Instruct | 7.6B | 128K | no disponible | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; el entrenamiento se centra en ingles y chino, por lo que el comportamiento en otros idiomas puede ser irregular.
- Riesgo de alucinacion: presente como en cualquier LLM; las cadenas de pensamiento largas pueden incluir pasos plausibles pero incorrectos.
- Limitaciones de idioma: no hay idiomas oficialmente soportados mas alla del ingles y el chino; el rendimiento en castellano no esta garantizado.
- El autor recomienda no anadir un system prompt y forzar el inicio de la respuesta con ` thinking` para preservar el modo de razonamiento.
- Temperatura: se recomienda entre 0.5 y 0.7; valores fuera de ese rango degradan la calidad.
- Restricciones de licencia: licencia MIT, permite uso comercial, modificacion y redistribucion con atribucion.
- En produccion, la generacion de cadenas de pensamiento largas aumenta la latencia y el consumo de tokens; conviene limitar la longitud de salida o usar decodificacion controlada.
- Herramientas como tool calling no estan confirmadas de forma nativa, por lo que la integracion con agentes depende del framework de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Paper DeepSeek-R1: https://arxiv.org/abs/2501.12948
- Repositorio GitHub DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- PDF del paper: https://github.com/deepseek-ai/DeepSeek-R1/blob/main/DeepSeek_R1.pdf
- Web oficial: https://www.deepseek.com/
- Chat: https://chat.deepseek.com/
- Organizacion en Hugging Face: https://huggingface.co/deepseek-ai
