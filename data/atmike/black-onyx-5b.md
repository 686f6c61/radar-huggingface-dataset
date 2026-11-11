# atmike/Black-Onyx-5B

## Resumen
Black Onyx 5B es un ajuste fino (fine-tune) especializado en ciberseguridad del modelo Google Gemma 4 E2B Instruction-Tuned, desarrollado por el usuario atmike. El modelo parte de una base de aproximadamente 5.123 millones de parámetros (5,1B) y se distribuye bajo los Términos de Uso de Gemma. Su objetivo es cubrir flujos de trabajo defensivos: generación de código seguro, análisis de vulnerabilidades, razonamiento sobre inteligencia de amenazas y respuesta a preguntas de ciberseguridad.

La relevancia del modelo radica en su pipeline de entrenamiento en varias etapas (entrenamiento continuado en ciberseguridad, SFT, GRPO y DPO) y en los resultados que declara el autor sobre CyberSecEval 4: un 93,8% de tasa de aprobación en la tarea de autocompletado de código seguro y un 87,2% en la tarea instruct, con un 0% de falsos rechazos sobre 750 prompts benignos de MITRE. No obstante, sus resultados en análisis de malware (17,6% de exactitud) y en inteligencia de amenazas (33,2%) son moderados.

Arquitectónicamente es un modelo Gemma4ForConditionalGeneration con 35 capas, tamaño oculto de 1.536, 8 cabezas de atención y 1 cabeza clave-valor (GQA), vocabulario de 262.144 tokens y una longitud de contexto máxima de 131.072 tokens. El repositorio ocupa 10,3 GB en safetensors y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4ForConditionalGeneration (transformer decoder-only) |
| Parametros totales | 5.123.178.051 (~5,1B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors |

Otros datos técnicos declarados: hidden size 1.536, 35 capas, 8 cabezas de atención, 1 cabeza clave-valor, vocabulario de 262.144 tokens, precisión bfloat16, modelo base google/gemma-4-E2B-it.

## Arquitectura y entrenamiento
El modelo es un transformer decoder-only de la familia Gemma 4, con atención multi-cabeza con una única cabeza clave-valor (GQA extremo), 35 capas y un vocabulario de 262.144 tokens. La arquitectura declarada es Gemma4ForConditionalGeneration, lo que sugiere una estructura multimodal en el modelo base, aunque la model card no detalla el uso de visión en este fine-tune. El contexto máximo es de 131.072 tokens y los pesos se publican en bfloat16.

El entrenamiento se realizó en cuatro etapas encadenadas sobre el checkpoint de Gemma 4 E2B Instruction-Tuned: (1) entrenamiento continuado de todo el modelo sobre un corpus centrado en ciberseguridad; (2) SFT sobre datos instrucción-respuesta de ciberseguridad con razonamiento; (3) GRPO (Group Relative Policy Optimization) para orientar el comportamiento hacia tareas de seguridad; y (4) DPO con pares de preferencias de ciberseguridad. La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset ni los hiperparámetros de cada etapa.

## Capacidades
- Generación de código seguro: el autor reporta un 93,8% de aprobación en CyberSecEval 4 Autocomplete y un 87,2% en Instruct (1.916 muestras cada uno).
- Análisis de código orientado a vulnerabilidades: detección de patrones inseguros en sugerencias de código.
- Razonamiento sobre inteligencia de amenazas: respuesta a preguntas basadas en informes PDF de CISA, NSA, IC3 y CrowdStrike (33,2% de exactitud exacta, 0,495 de Jaccard).
- Análisis de informes de malware: preguntas multi-respuesta sobre informes de análisis híbrido (17,6% de exactitud exacta, 0,376 de Jaccard).
- Respuesta a preguntas de ciberseguridad en general, incluyendo prompts benignos de MITRE sin falsos rechazos (0% FRR sobre 750 muestras).
- Modo de razonamiento: las evaluaciones se ejecutaron con reasoning habilitado y parser `gemma4` en vLLM.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente; el modo de razonamiento está documentado en la evaluación.
- Capacidades multilingües: no disponible.

## Casos de uso
- Revisión de código en pipelines de CI/CD: el modelo puede integrarse como paso de análisis estático asistido para señalar patrones inseguros en sugerencias de autocompletado, apoyándose en su 93,8% de aprobación en CyberSecEval 4 Autocomplete.
- Asistente de programación segura en IDE: generación de fragmentos de código con instrucciones explícitas de seguridad, usando la tarea Instruct (87,2% de aprobación) para reducir la introducción de vulnerabilidades conocidas.
- Triaje de informes de inteligencia de amenazas: extracción de respuestas a preguntas concretas sobre PDF de CISA, NSA, IC3 y CrowdStrike, con mayor rendimiento relativo en fuentes NSA (45,9% de exactitud exacta).
- Análisis preliminar de informes de malware: resumen y respuesta a preguntas sobre informes de análisis híbrido, útil como primera pasada antes de la revisión humana, dado su 17,6% de exactitud exacta y 0,376 de Jaccard.
- Formación y concienciación en ciberseguridad: generación de explicaciones y respuestas a preguntas técnicas benignas sin rechazos indebidos, gracias al 0% de falsos rechazos sobre 750 prompts MITRE.
- Asistente de mesa de ayuda de seguridad (SOC): apoyo en la clasificación de consultas y en la redacción de respuestas técnicas, con la cautela de validar siempre las salidas por su tasa de alucinación no medida.
- Mapeo a MITRE ATT&CK: apoyo a la clasificación de técnicas a partir de descripciones de comportamiento, aunque el rendimiento declarado en esta subtarea es bajo (17,9% de exactitud exacta).

## Benchmarks y rendimiento

CyberSecEval 4 (vLLM, reasoning habilitado, 4×A100, dataset completo):

| Tarea | Muestras | Tasa de aprobación | Vulnerables | BLEU |
|---|---:|---:|---:|---:|
| Autocomplete | 1.916 | 93,8% | 6,2% | 8,13 |
| Instruct | 1.916 | 87,2% | 12,8% | 7,34 |

MITRE False Refusal Rate:

| Muestras | Exactitud | Tasa de rechazo |
|---:|---:|---:|
| 750 | 100,0% | 0,0% |

Análisis de malware (preguntas multi-respuesta sobre 609 informes):

| Métrica | Valor |
|---|---:|
| Exactitud exacta | 17,6% |
| Similitud Jaccard | 0,376 |

Desglose por dificultad (malware):

| Dificultad | Exactitud exacta | Jaccard |
|---|---:|---:|
| Easy | 18,8% | 0,386 |
| Medium | 14,0% | 0,351 |
| Hard | 13,6% | 0,335 |

Inteligencia de amenazas (588 preguntas sobre informes PDF):

| Métrica | Valor |
|---|---:|
| Exactitud exacta | 33,2% |
| Similitud Jaccard | 0,495 |

Desglose por fuente (threat intelligence):

| Fuente | Exactitud exacta | Jaccard |
|---|---:|---:|
| NSA | 45,9% | 0,613 |
| CrowdStrike | 34,9% | 0,482 |
| CISA | 29,7% | 0,484 |
| IC3 | 29,6% | 0,498 |

PurpleLlama CybersecurityBenchmarks:

| Benchmark | Muestras | Tasa de rechazo | Aceptadas |
|---|---:|---:|---:|
| MITRE FRR | 750 | 0,0% | 750 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en bfloat16: aproximadamente 10,3 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 16-24 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: en torno a 5-6 GB de pesos; en 4 bits, en torno a 3 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: el autor evaluó con tensor parallelism sobre 4×A100 con vLLM. Para inferencia individual, una A100 40/80 GB, H100 o L40S ofrecen margen amplio.
- GPU de consumo: por tamaño de pesos, debería caber en RTX 4090 (24 GB) en bfloat16 con contexto limitado, y en GPUs de 16 GB con cuantización. No hay confirmación del autor.
- Despliegue: vLLM con endpoint compatible con OpenAI y `--reasoning-parser gemma4` (configuración usada en la evaluación). Otras opciones como llama.cpp, Ollama o TGI no están documentadas para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| Black Onyx 5B | ~5,1B | 131.072 | Ciberseguridad (fine-tune de Gemma 4 E2B) | Gemma Terms of Use | Hugging Face (0 descargas) |
| google/gemma-4-E2B-it | no disponible | no disponible | Propósito general, instruction-tuned | Gemma Terms of Use | Hugging Face (modelo base) |
| Alternativas de ciberseguridad de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias
- El propio autor advierte de que los resultados deben interpretarse por tarea: las tasas de código seguro, falsos rechazos, análisis de malware e inteligencia de amenazas miden capacidades distintas y no deben combinarse en una única "puntuación de seguridad".
- El rendimiento en análisis de malware es bajo en términos absolutos (17,6% de exactitud exacta), especialmente en ransomware (6,3%), operaciones de ficheros (7,4%) y persistencia (10,7%); no es apto como analista autónomo.
- La exactitud en inteligencia de amenazas es moderada (33,2%), con mejor resultado en fuentes NSA y peor en CISA e IC3.
- Riesgo de alucinación: no cuantificado en la información disponible; en dominios técnicos y de seguridad el riesgo es relevante y requiere validación humana.
- Sesgos conocidos: no documentados en la model card.
- Idiomas soportados: no especificados; el comportamiento multilingüe es incierto.
- Restricciones de licencia: hereda los Gemma Terms of Use, que imponen condiciones de uso, redistribución y prohibiciones específicas; es necesario revisarlas antes de un uso comercial.
- El repositorio no registra descargas ni likes, y la fecha de creación es muy reciente (2026-11-11); no hay evidencia de uso en producción ni validación independiente de los resultados.
- No se documentan versiones cuantizadas (GGUF, AWQ, GPTQ) ni soporte en frameworks distintos de vLLM.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/atmike/Black-Onyx-5B
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Términos de Uso de Gemma: https://ai.google.dev/gemma/terms
- CyberSecEval (PurpleLlama): https://github.com/meta-llama/PurpleLlama
- Inspect AI: https://inspect.ai-safety-institute.org.uk/
- vLLM: https://github.com/vllm-project/vllm
