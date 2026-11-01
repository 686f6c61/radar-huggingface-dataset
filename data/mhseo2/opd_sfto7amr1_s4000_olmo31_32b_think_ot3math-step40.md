# mhseo2/opd_sfto7amr1_s4000_olmo31_32b_think_ot3math-step40

## Resumen

`opd_sfto7amr1_s4000_olmo31_32b_think_ot3math-step40` es un checkpoint intermedio de destilación on-policy (on-policy distillation, OPD) publicado por el usuario `mhseo2` en HuggingFace. El modelo parte de un SFT de OLMo 3 base de 7B ajustado con datos matemáticos de AM-DeepSeek-R1-0528 y se destila hacia `allenai/Olmo-3.1-32B-Think` como profesor, tras 40 pasos de entrenamiento. El resultado es un modelo de 7.298.011.136 parámetros (aproximadamente 7,3B) en formato safetensors, bajo licencia Apache 2.0.

El interés de esta ficha es doble: por un lado, documenta una técnica de destilación on-policy aplicada a la familia OLMo, con detalles poco habituales sobre el pipeline (prompts de OpenThoughts3 math, rollouts de hasta 32.768 tokens, pérdida KL reversa por token contra el top-32 del profesor). Por otro, ofrece un punto de comparación para quienes trabajan en modelos matemáticos pequeños destilados de profesores grandes.

Se trata de un checkpoint de investigación (paso 40 de un proceso más largo), con solo 20 descargas y sin model card extendida más allá de la información de entrenamiento y evaluación. No debe confundirse con un modelo listo para producción: es una instantánea de un experimento de destilación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo 3 de AllenAI, según el nombre del modelo y el profesor) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible (las evaluaciones usan prompt de 768 tokens y respuesta de hasta 32.768 tokens) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en float; no se listan GGUF ni AWQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 shards: model-00001-of-00003, model-00002-of-00003, model-00003-of-00003) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de OLMo 3 (transformer decoder-only) en su variante de 7B, heredada del modelo base `mhseo2/sft_olmo3base7b_amr1_0528_math_n204800-step4000`, que a su vez es un SFT de OLMo 3 base sobre datos matemáticos derivados de AM-DeepSeek-R1-0528. El checkpoint publicado corresponde al paso 40 de un proceso de destilación on-policy hacia el profesor `allenai/Olmo-3.1-32B-Think` (revisión `97ade57a9cc5`).

El entrenamiento usa prompts de preguntas matemáticas de OpenThoughts3 (53.105 prompts sin respuestas), con 60 prompts por paso y 4 rollouts por prompt, temperatura 1 y respuestas de hasta 32.768 tokens. La pérdida es una KL reversa por token contra el profesor sobre los rollouts del estudiante (estimador k1, top-32 del profesor), sin recompensa de tarea. Se usa AdamW con learning rate constante de 5e-6 y weight decay 0.01. El cómputo se realizó en BSC MareNostrum 5 con 2 nodos de 4 H100 cada uno: estudiante con FSDP + vLLM y profesor con vLLM en TP2. El código corresponde al árbol `mopdRL` (commit `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4`, paquete `bsc-olmo-base-opd-2026-10-26`).

## Capacidades

- Generación de texto y razonamiento matemático: el modelo está especializado en problemas de matemáticas de competición (AIME, HMMT) mediante destilación de un profesor con modo "think".
- Modo de razonamiento extendido: el nombre incluye `think` y las evaluaciones permiten respuestas de hasta 32.768 tokens, lo que sugiere cadenas de razonamiento largas.
- Resolución de problemas matemáticos con verificación: las evaluaciones usan `math_verify` como scorer, lo que indica que el modelo produce respuestas finales verificables.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible explícitamente; el modo "think" implica razonamiento multi-paso interno, pero no se documenta uso agéntico.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio): no disponible; el modelo es de texto.

## Casos de uso

- Evaluación de técnicas de destilación on-policy: este checkpoint sirve como referencia reproducible para investigar cómo evoluciona un estudiante de 7B destilado de un profesor de 32B en tareas matemáticas, comparando pasos intermedios (paso 40) frente a checkpoints posteriores.
- Generación de soluciones matemáticas de competición: el modelo puede resolver problemas tipo AIME/HMMT con cadenas de razonamiento largas, útil para construir datasets sintéticos de soluciones verificables con `math_verify`.
- Aumento de datos matemáticos: dado un conjunto de problemas, el modelo genera múltiples rollouts (temperatura 1) que pueden filtrarse por corrección para producir datos de entrenamiento.
- Investigación en alineación y KL reversa: permite estudiar el efecto de la pérdida KL por token contra el top-32 del profesor sin recompensa de tarea en el comportamiento del estudiante.
- Base para fine-tuning posterior: al ser un checkpoint intermedio con licencia Apache 2.0, puede servir como punto de partida para SFT o RL adicional en dominios matemáticos o STEM.
- Reproducción de pipelines en clústeres HPC: el setup documentado (FSDP + vLLM, profesor en TP2, MareNostrum 5) es una referencia para quien quiera replicar OPD en infraestructura similar.
- Docencia y divulgación: ejemplo didáctico de destilación con rollouts on-policy y estimador k1 de la KL.

## Benchmarks y rendimiento

Resultados publicados en la model card (mean@8 accuracy en %, temperatura 0.6, top_p 0.95, prompt 768 / respuesta 32.768 tokens, scorer `math_verify`, plantilla de chat del estudiante, ejecutado en NVIDIA H200 en float16):

| Benchmark | Resultado (mean@8, %) |
|---|---|
| AIME 2025 | 41,25 |
| AIME 2026 | 40,42 |
| HMMT Feb 2025 | 26,67 |

No se han publicado en la información disponible resultados en MMLU, HumanEval, GSM8K ni comparaciones directas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en float16: aproximadamente 14,6 GB solo para pesos (14.596.022.272 bytes), más overhead de activaciones y KV cache; en la práctica se recomienda al menos 20-24 GB para contextos moderados.
- En float32: alrededor de 29,2 GB solo para pesos.
- Cuantización: no se publican pesos cuantizados; habría que generarlos (por ejemplo, con llama.cpp o GPTQ/AWQ) a partir de los safetensors.
- GPU recomendadas: H100, H200 (usada en la evaluación), A100 40/80 GB para entrenamiento o inferencia de referencia; RTX 4090 (24 GB) podría alojar el modelo en float16 con contextos limitados, aunque sin datos oficiales de latencia.
- Despliegue: vLLM es la opción documentada en el pipeline de entrenamiento (estudiante y profesor); también sería compatible con TGI o llama.cpp tras conversión a GGUF, aunque no se ha validado en la información disponible.
- Latencia y throughput: no disponibles. La evaluación usa respuestas de hasta 32.768 tokens, lo que implica generaciones largas y costosas en tiempo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmarks matemáticos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| opd_sfto7amr1_s4000_olmo31_32b_think_ot3math-step40 | 7,3B | no disponible | AIME 2025: 41,25; AIME 2026: 40,42; HMMT Feb 2025: 26,67 (mean@8) | Apache 2.0 | HuggingFace (20 descargas) |
| allenai/Olmo-3.1-32B-Think (profesor) | 32B (según nombre) | no disponible | no disponible en esta ficha | no disponible en esta ficha | HuggingFace (AllenAI) |
| mhseo2/sft_olmo3base7b_amr1_0528_math_n204800-step4000 (base del estudiante) | ~7B | no disponible | no disponible en esta ficha | no disponible en esta ficha | HuggingFace |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no es posible.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 40) de un proceso de destilación; no representa el resultado final del entrenamiento y su rendimiento puede ser inferior al de checkpoints posteriores.
- Especialización muy estrecha: entrenado solo con prompts matemáticos de OpenThoughts3; el rendimiento fuera de matemáticas no está evaluado y probablemente sea limitado.
- Riesgo de alucinación: como todo modelo generativo, puede producir razonamientos plausibles pero incorrectos; las evaluaciones usan `math_verify` precisamente para filtrar respuestas.
- Sesgos: no se documentan análisis de sesgos; los datos de entrenamiento (OpenThoughts3 math y AM-DeepSeek-R1-0528) pueden introducir sesgos de dominio y de idioma.
- Idiomas: no se especifican idiomas soportados; el entrenamiento parece centrado en inglés (prompts de OpenThoughts3).
- Contexto: no se documenta la longitud máxima de contexto del modelo; las evaluaciones usan 768 tokens de prompt y hasta 32.768 de respuesta, pero no se confirma la ventana total.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de OLMo 3 y de datos de DeepSeek-R1 conviene revisar las condiciones de los modelos y datasets upstream.
- Solo 20 descargas y 0 likes: poca validación comunitaria; no hay informes independientes de calidad.
- No se publican pesos cuantizados ni plantillas de despliegue validadas más allá de la plantilla de chat incluida (`chat_template.jinja`).

## Enlaces

- HuggingFace: https://huggingface.co/mhseo2/opd_sfto7amr1_s4000_olmo31_32b_think_ot3math-step40
- Modelo base (SFT): https://huggingface.co/mhseo2/sft_olmo3base7b_amr1_0528_math_n204800-step4000
- Profesor: https://huggingface.co/allenai/Olmo-3.1-32B-Think
- Dataset de prompts: OpenThoughts3 (referenciado en la model card; sin enlace directo en la información disponible)
- Código: árbol `mopdRL` commit `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4`, paquete `bsc-olmo-base-opd-2026-10-26` (sin URL en la información disponible)
