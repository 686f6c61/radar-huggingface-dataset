# mhseo2/opd_sfto7nemo_s1400_olmo31_32b_think_ot3math-step20

## Resumen

`opd_sfto7nemo_s1400_olmo31_32b_think_ot3math-step20` es un checkpoint de investigación publicado por el usuario `mhseo2` en Hugging Face. Se trata de un modelo de lenguaje de 7.298.011.136 parámetros (aproximadamente 7,3 mil millones) obtenido mediante destilación on-policy (on-policy distillation, OPD) del modelo base `mhseo2/sft_olmo3base7b_nemotronmathv2_high_notool_n204800-step1400` hacia el profesor `allenai/Olmo-3.1-32B-Think`.

El objetivo del experimento es transferir capacidades de razonamiento matemático (modo thinking) desde un modelo profesor de 32 mil millones de parámetros a un estudiante de 7 mil millones, usando únicamente preguntas de matemáticas de OpenThoughts3 (53.105 prompts sin respuestas) y una pérdida de divergencia KL reversa por token sobre los rollouts del propio estudiante. No se emplea recompensa de tarea, por lo que el aprendizaje es puramente imitativo respecto al profesor.

El checkpoint corresponde al paso 20 de entrenamiento, por lo que es un artefacto intermedio y experimental, no un modelo final afinado. Su relevancia radica en documentar una receta reproducible de destilación on-policy sobre la familia OLMo 3 y en publicar métricas de evaluación en benchmarks matemáticos exigentes (AIME 2025, AIME 2026, HMMT Feb 2025) con un modelo de 7B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo 3, según tags del repo) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible en la información proporcionada (el entrenamiento usa respuestas de hasta 32.768 tokens y prompt de 768 tokens en evaluación) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 shards: model-00001-of-00003, model-00002-of-00003, model-00003-of-00003) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia OLMo 3 (etiquetas `olmo3` y `olmo` en el repo), con 7.298.011.136 parámetros. El checkpoint parte del SFT `sft_olmo3base7b_nemotronmathv2_high_notool_n204800-step1400`, que ya había sido afinado sobre Nemotron-Math-v2. Sobre esa base se aplica destilación on-policy hacia el profesor `allenai/Olmo-3.1-32B-Think` (revisión `97ade57a9cc5`), un modelo de 32B en modo thinking.

El procedimiento de entrenamiento usa 53.105 preguntas de matemáticas de OpenThoughts3 sin respuestas. En cada paso se muestrean 60 prompts con 4 rollouts cada uno, a temperatura 1 y con respuestas de hasta 32.768 tokens. La pérdida es la KL reversa por token entre estudiante y profesor sobre los rollouts del estudiante (estimador k1, top-32 del profesor), sin recompensa de tarea. Se usa AdamW con learning rate constante de 5e-6 y weight decay 0.01. El entrenamiento se ejecutó en BSC MareNostrum 5 con 2 nodos de 4 H100 cada uno: estudiante con FSDP + vLLM y profesor con vLLM en TP2. El checkpoint publicado corresponde al paso 20. El código asociado es el árbol `mopdRL` (commit `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4`, paquete `bsc-olmo-base-opd-2026-10-26`).

## Capacidades

- Generación de texto y razonamiento matemático en modo thinking, heredado del profesor Olmo-3.1-32B-Think mediante destilación.
- Resolución de problemas de competición matemática (AIME, HMMT) con cadenas de razonamiento largas, de hasta 32.768 tokens de respuesta en el entrenamiento y la evaluación.
- Plantilla de chat propia (`chat_template.jinja`) para formatear conversaciones de una o varias interacciones.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el modo thinking permite cadenas de razonamiento largas, pero no se describe integración con agentes.
- Capacidades multilingües: no disponible.
- Capacidades especiales: modo thinking orientado a matemáticas; no se documentan visión ni audio.

## Casos de uso

- Resolución de problemas matemáticos de competición: el modelo está entrenado específicamente sobre preguntas de OpenThoughts3 y evaluado en AIME y HMMT, por lo que es adecuado para generar soluciones paso a paso en entornos de investigación o docencia.
- Generación de cadenas de razonamiento largas: con respuestas de hasta 32.768 tokens, puede abordar demostraciones y problemas que requieren derivaciones extensas.
- Destilación y experimentación académica: sirve como referencia reproducible de un pipeline OPD (KL reversa, rollouts on-policy, profesor top-32) sobre la familia OLMo.
- Evaluación comparativa de recetas de destilación: al ser un checkpoint intermedio (paso 20), permite estudiar la evolución del rendimiento frente al modelo SFT de partida.
- Generación de datos sintéticos matemáticos: puede producir soluciones razonadas que luego se filtren con verificadores como `math_verify` para construir datasets de entrenamiento.
- Investigación sobre modo thinking en modelos pequeños: útil para analizar hasta qué punto un modelo de 7B puede imitar el razonamiento de un profesor de 32B con solo 20 pasos de OPD.

## Benchmarks y rendimiento

Resultados publicados en la model card: precisión mean@8 (%), temperatura 0.6, top_p 0.95, prompt de 768 tokens y respuesta de 32.768 tokens, scorer `math_verify`, plantilla de chat del estudiante, ejecutado en una Quadro RTX 6000 en float16.

| Benchmark | Resultado (mean@8, %) |
|---|---|
| AIME 2025 | 32,92 |
| AIME 2026 | 27,92 |
| HMMT Feb 2025 | 17,50 |

No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K) ni comparaciones directas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: con 7,3B parámetros, en float16 se requieren aproximadamente 14,6 GB solo para pesos (el repo ocupa 14,6 GB); en cuantización de 8 bits, unos 7,3 GB; en 4 bits, unos 3,7 GB. Estas cifras no están publicadas por el autor y son estimaciones a partir del número de parámetros.
- GPU recomendadas: el autor evaluó en una Quadro RTX 6000 en float16. Para entrenamiento se usaron H100 (2 nodos de 4 H100). Para inferencia en float16 cabe en GPUs con 24 GB o más (RTX 3090, RTX 4090, A10, L4 con cuantización).
- ¿Cabe en GPU de consumo? Sí, en float16 en RTX 3090/4090 (24 GB) y en cuantizaciones de 8 o 4 bits en GPUs de 8-16 GB, siempre que se genere la cuantización, ya que el repo solo publica safetensors.
- Opciones de despliegue: vLLM (usado por el autor en entrenamiento y evaluación), transformers con safetensors; no se documentan GGUF, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La generación de hasta 32.768 tokens por respuesta implica latencias altas en GPUs de consumo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmarks matemáticos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (OPD paso 20) | 7,3B | no disponible | AIME 2025: 32,92; AIME 2026: 27,92; HMMT Feb 2025: 17,50 (mean@8) | Apache 2.0 | Hugging Face (35 descargas) |
| `mhseo2/sft_olmo3base7b_nemotronmathv2_high_notool_n204800-step1400` (modelo base) | 7,3B (según base) | no disponible | no disponible | no disponible | Hugging Face |
| `allenai/Olmo-3.1-32B-Think` (profesor) | 32B (según nombre) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no es posible.

## Limitaciones y advertencias

- Checkpoint intermedio (paso 20): no es un modelo final; el rendimiento puede estar por debajo de un entrenamiento completo.
- Entrenado exclusivamente con preguntas de matemáticas de OpenThoughts3: el dominio está muy acotado y el comportamiento fuera de matemáticas no está evaluado.
- Sin recompensa de tarea: la pérdida es solo KL reversa al profesor, por lo que puede imitar errores del profesor y no se ha verificado corrección de las soluciones.
- Riesgo de alucinación en razonamientos largos: con respuestas de hasta 32.768 tokens, pueden aparecer derivaciones plausibles pero incorrectas.
- Idiomas soportados no documentados; se desconoce el rendimiento fuera del inglés.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de OLMo 3 conviene revisar las condiciones de los modelos base y del profesor.
- Solo se publican pesos en safetensors; no hay cuantizaciones oficiales ni garantías de despliegue en llama.cpp u Ollama.
- El nombre del repo menciona `olmo31_32b_think` (profesor), pero el modelo es de 7,3B; conviene no confundir el tamaño del estudiante con el del profesor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mhseo2/opd_sfto7nemo_s1400_olmo31_32b_think_ot3math-step20
- Modelo base (SFT): https://huggingface.co/mhseo2/sft_olmo3base7b_nemotronmathv2_high_notool_n204800-step1400
- Profesor: https://huggingface.co/allenai/Olmo-3.1-32B-Think
- Código: árbol `mopdRL`, commit `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4` (paquete `bsc-olmo-base-opd-2026-10-26`); no se proporciona URL en la información disponible.
