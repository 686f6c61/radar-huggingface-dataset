# enochlev/KnowLine-31B-Gen1-NVFP4

## Resumen

KnowLine-31B-Gen1-NVFP4 es un adaptador LoRA de rango 32 publicado por el usuario enochlev que materializa el modelo KnowLine-31B-Gen1 (desarrollado por PelaAI) sobre la base cuantizada en NVFP4 de Gemma 4 31B Instruct de Google, distribuida por Red Hat AI. No se trata de un modelo independiente, sino de un delta de pesos: el repositorio contiene únicamente la diferencia entre KnowLine-31B-Gen1 y google/gemma-4-31B-it, empaquetada como adaptador PEFT para servirse junto al modelo base cuantizado en vLLM.

La relevancia práctica es doble. Por un lado, permite ejecutar un modelo de 31B parámetros derivado de la familia Gemma 4 en formato NVFP4 (4 bits de coma flotante con escalado por bloque) sobre una única GPU Blackwell de 32 GB, algo impensable en precisión completa. Por otro lado, demuestra un patrón de distribución eficiente: publicar solo el delta LoRA en lugar de los pesos completos reduce el repositorio a unos 0,5 GB frente a las decenas de gigabytes del modelo base.

La ficha se basa exclusivamente en la información disponible en HuggingFace; los detalles sobre arquitectura interna, datos de entrenamiento y benchmarks del modelo original no están publicados en la información proporcionada y se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4, según modelo base); adaptador LoRA de rango 32 sobre pesos NVFP4 |
| Parametros totales | 31B (modelo base); el adaptador LoRA añade un delta de rango 32 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 8192 tokens en la configuración de servido documentada (límite del despliegue, no necesariamente del modelo) |
| Tipos de cuantizacion | NVFP4 (4 bits FP con escalado por bloque) en el base; LoRA en precisión nativa PEFT |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) + base NVFP4 en safetensors |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA de rango 32 (max-lora-rank 32) que codifica la diferencia entre PelaAI/KnowLine-31B-Gen1 y google/gemma-4-31B-it. El modelo base sobre el que se aplica es RedHatAI/gemma-4-31B-it-NVFP4, una cuantización NVFP4 de Gemma 4 31B Instruct preparada para vLLM. La arquitectura subyacente es, por tanto, la de Gemma 4, un transformer decoder-only, aunque la información proporcionada no detalla capas, dimensiones ocultas ni mecanismos de atención concretos.

No se dispone de información sobre el dataset de entrenamiento de KnowLine-31B-Gen1, el número de tokens utilizados, la composición de los datos ni si hubo fases de RLHF, DPO u otras técnicas de alineación. La model card del adaptador solo documenta el proceso de empaquetado y servido, no el entrenamiento del modelo original. Una innovación técnica destacable del despliegue es el uso de KV cache en fp8_e4m3 y backend de atención TRITON_ATTN, que reducen el consumo de memoria durante la inferencia. Además, KnowLine escala sus logits por un factor de 1/1.44; el adaptador no incluye ese paso, por lo que para replicar el muestreo original hay que multiplicar la temperatura por 1.44 o dividir los logprobs por 1.44 antes del softmax al puntuar etiquetas.

## Capacidades

- Generación de texto en inglés y otros idiomas (no se especifica la lista completa).
- Razonamiento y respuesta a preguntas de opción múltiple: la model card reporta coincidencia con la build FP8 en 30 de 30 preguntas sintéticas.
- Puntuación de etiquetas mediante logprobs, con corrección de temperatura documentada.
- Servido como módulo LoRA adicional en vLLM junto al modelo base NVFP4.
- Compatibilidad con el pipeline text-generation de HuggingFace.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Evaluación de modelos en formato de bajo coste: al ocupar solo 0,5 GB, el adaptador permite reproducir el comportamiento de KnowLine-31B-Gen1 sobre una base NVFP4 sin descargar los pesos completos, útil para comparar variantes en pipelines de evaluación.
- Despliegue en una única GPU de 32 GB: la configuración documentada (vLLM 0.33.0, RTX PRO 4500 Blackwell, AWS g7.4xlarge) permite servir un modelo de 31B en producción con memoria ajustada mediante KV cache fp8 y gpu-memory-utilization 0.93.
- Clasificación y scoring de respuestas: la función `label_probs` documentada permite convertir logprobs en probabilidades calibradas, adecuada para tareas de evaluación automática o reranking.
- Investigación sobre cuantización NVFP4: sirve como caso de estudio de cómo un delta LoRA preserva la fidelidad respecto a FP8 (KL media de 0.009 en 30 preguntas).
- Prototipado de asistentes conversacionales con contexto de 8192 tokens: suficiente para diálogos multi-turno moderados en entornos con restricciones de VRAM.
- Distribución eficiente de modelos afinados: el patrón de publicar solo el delta LoRA facilita compartir adaptaciones de modelos grandes sin replicar decenas de gigabytes.

## Benchmarks y rendimiento

| Metrica | Resultado | Referencia |
|---|---|---|
| Coincidencia de respuesta top-1 | 30/30 preguntas sintéticas | Build FP8 de KnowLine |
| Divergencia KL media | 0.009 | Build FP8 de KnowLine |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base NVFP4 de 31B ocupa aproximadamente 16-18 GB en pesos; con KV cache fp8_e4m3, contexto de 8192 y 16 secuencias concurrentes, el consumo total se acerca a los 30 GB (gpu-memory-utilization 0.93 sobre 32 GB).
- GPU recomendadas: NVIDIA RTX PRO 4500 Blackwell (32 GB), validada por el autor; cualquier GPU Blackwell con 32 GB o más; A100/H100 de 40/80 GB como alternativa con mayor margen.
- GPU de consumo: no cabe en RTX 4090 (24 GB) con la configuración documentada; requeriría reducir contexto, secuencias concurrentes o usar una cuantización más agresiva.
- Despliegue: vLLM 0.33.0 con `--enable-lora --max-lora-rank 32 --max-loras 1`; no se documentan opciones para llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KnowLine-31B-Gen1-NVFP4 (este) | 31B + LoRA r32 | 8192 (config. servido) | NVFP4 + LoRA | Apache 2.0 | HuggingFace |
| PelaAI/KnowLine-31B-Gen1 | 31B | no disponible | completa (FP) | no disponible | HuggingFace |
| RedHatAI/gemma-4-31B-it-NVFP4 | 31B | no disponible | NVFP4 | no disponible | HuggingFace |
| google/gemma-4-31B-it | 31B | no disponible | completa (FP) | no disponible | HuggingFace |

## Limitaciones y advertencias

- El repositorio contiene solo el delta LoRA; no es utilizable de forma autónoma sin el modelo base RedHatAI/gemma-4-31B-it-NVFP4 y la revisión concreta indicada (`5df75ccad9b74546f5be758a2a68acc2e16bbc9b`).
- El escalado de logits por 1/1.44 del modelo original no está incluido; ignorarlo altera el muestreo y el scoring de etiquetas.
- La validación reportada se limita a 30 preguntas sintéticas de opción múltiple; no hay evidencia sobre otros dominios ni sobre robustez general.
- El contexto de 8192 tokens es una restricción de la configuración de servido documentada, no necesariamente del modelo; ampliarlo exige más VRAM.
- No se documentan sesgos, riesgos de alucinación ni evaluación multilingüe del modelo original.
- La licencia Apache 2.0 se declara sobre el adaptador, pero el uso comercial debe verificar también las condiciones del modelo base Gemma 4 y de la cuantización de Red Hat AI.
- El autor del adaptador (enochlev) no es el desarrollador original del modelo (PelaAI); se desconoce el proceso de conversión más allá de lo documentado.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/enochlev/KnowLine-31B-Gen1-NVFP4
- Modelo base original: https://huggingface.co/PelaAI/KnowLine-31B-Gen1
- Base cuantizada NVFP4: https://huggingface.co/RedHatAI/gemma-4-31B-it-NVFP4
- Modelo Gemma 4 31B Instruct: https://huggingface.co/google/gemma-4-31B-it
