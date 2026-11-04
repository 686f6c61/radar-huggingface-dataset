# mhseo2/opd_sfto7amr1_s1000_olmo31_32b_think_amr1math-step40

## Resumen

`opd_sfto7amr1_s1000_olmo31_32b_think_amr1math-step40` es un checkpoint intermedio de destilación on-policy (OPD, *on-policy distillation*) publicado por el usuario mhseo2. El modelo parte de un SFT de 7.298.011.136 parámetros (etiquetado como Olmo 3 base 7B) afinado sobre el conjunto de matemáticas AM-DeepSeek-R1-0528 (204.800 filas) y se destila hacia el profesor `allenai/Olmo-3.1-32B-Think`, un modelo de 32B en modo *thinking*. El checkpoint corresponde al paso 40 del proceso de destilación.

La relevancia del artefacto es metodológica más que de producto: documenta un pipeline de destilación on-policy con pérdida de divergencia KL inversa por token sobre los propios rollouts del estudiante, sin recompensa de tarea, ejecutado en BSC MareNostrum 5 con 8 H100 repartidas en dos nodos (estudiante con FSDP + vLLM, profesor con vLLM en TP2). Es un caso reproducible de transferencia de capacidad de razonamiento matemático desde un modelo grande a uno de 7B.

No se han publicado resultados de evaluación: la model card indica que las pruebas en AIME 2025, AIME 2026 y HMMT Feb 2025 están en cola. El repositorio tiene 0 descargas y 0 likes, y el nombre del modelo mezcla referencias a 32B (el profesor) y a 7B (el estudiante), lo que exige leer la model card con atención antes de reutilizarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Olmo 3); detalles de capas y atención no disponibles |
| Parametros totales | 7.298.011.136 |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible (las respuestas de entrenamiento llegan a 32.768 tokens) |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors en BF16/FP32; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 shards, ~14,6 GB de repo) |

## Arquitectura y entrenamiento

El estudiante es un transformer decoder-only de la familia Olmo 3 con 7.298.011.136 parámetros, inicializado desde `mhseo2/sft_olmo3base7b_amr1_0528_math_n204800-step1000`, un SFT sobre 204.800 filas del conjunto de matemáticas AM-DeepSeek-R1-0528. Sobre esa base se aplica destilación on-policy hacia `allenai/Olmo-3.1-32B-Think` (revisión `97ade57a9cc5`): en cada paso se muestrean 60 prompts del propio conjunto SFT del estudiante con 4 rollouts por prompt, temperatura 1 y hasta 32.768 tokens de respuesta, y se optimiza una KL inversa por token (estimador k1, top-32 del profesor) contra las distribuciones del profesor sobre esos rollouts. No hay recompensa de tarea ni RLHF/DPO en esta fase.

Hiperparámetros declarados: learning rate constante de 5e-6, AdamW con weight decay 0,01, 40 pasos completados en este checkpoint. La infraestructura es BSC MareNostrum 5 con 2 nodos × 4 H100: el estudiante corre con FSDP y vLLM, el profesor con vLLM en tensor parallelism 2. El código corresponde al árbol `mopdRL` en el commit `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4` (paquete `bsc-olmo-base-opd-2026-10-26`). No se especifican la composición exacta del dataset más allá de su origen, ni el número total de tokens vistos, ni detalles de la arquitectura interna (número de capas, cabezas, tipo de atención).

## Capacidades

- Generación de texto y razonamiento matemático: el entrenamiento se centra en problemas de matemáticas con cadenas de razonamiento largas (hasta 32.768 tokens por respuesta).
- Modo *thinking*: el profesor es un modelo Think y el pipeline de destilación transfiere ese estilo de razonamiento; el chat template incluido (`chat_template.jinja`) define el formato de conversación.
- Razonamiento multi-paso: los rollouts de entrenamiento con hasta 32K tokens sugieren capacidad para cadenas de deducción extensas, aunque no hay evaluación publicada que lo confirme.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; la model card no declara idiomas y el dataset de entrenamiento es de matemáticas.
- Capacidades especiales (visión, audio): no disponibles; el modelo es de texto.

## Casos de uso

- Investigación en destilación on-policy: el checkpoint sirve como referencia reproducible de un paso intermedio (paso 40) del pipeline `mopdRL`, útil para estudiar la evolución de la KL inversa y del comportamiento del estudiante durante el entrenamiento.
- Generación de soluciones matemáticas paso a paso: el modelo está afinado sobre AM-DeepSeek-R1-0528 y puede producir razonamientos largos para problemas de competición, siempre que se validen con evaluaciones propias dado que no hay benchmarks publicados.
- Base para experimentos de continuación de destilación: al ser un checkpoint intermedio con licencia Apache 2.0, se puede reanudar el entrenamiento con otro profesor o con variaciones de hiperparámetros para comparar metodologías.
- Evaluación de transferencia de capacidad 32B → 7B: útil en estudios académicos que midan cuánta capacidad de razonamiento matemático de un modelo grande se retiene en uno pequeño tras N pasos de OPD.
- Fine-tuning posterior específico de dominio matemático: el SFT de partida y este checkpoint permiten comparar si la destilación mejora la adaptación a un dominio concreto antes de un ajuste final supervisado.
- Generación de datos sintéticos de razonamiento: el modelo puede producir cadenas de razonamiento matemático que sirvan como datos de entrenamiento para modelos menores, con la cautela de que no hay evaluación de calidad publicada.
- Docencia y divulgación: ilustrar en un blog o curso cómo se construye un pipeline de destilación on-policy con vLLM y FSDP sobre clústeres H100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las evaluaciones (mean@8 en AIME 2025, AIME 2026 y HMMT Feb 2025) están en cola en los *eval workers* y que se añadirán cuando terminen.

## Requisitos de hardware

- VRAM estimada para inferencia: ~14,6 GB en BF16 (7,3B parámetros × 2 bytes), más overhead de KV cache; en FP8 ~7,3 GB y en cuantización de 4 bits ~4 GB (estas cuantizaciones no están publicadas, habría que generarlas).
- GPU recomendadas: H100 o A100 80 GB para entrenamiento y para inferencia con contexto largo (hasta 32K tokens); una sola A100 40 GB o RTX 4090 24 GB es suficiente para inferencia en BF16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) o RTX 3090 (24 GB) en BF16 con contexto limitado; en GPUs de 16 GB haría falta cuantización a 8 o 4 bits.
- Opciones de despliegue: el autor usó vLLM (estudiante y profesor); al ser pesos safetensors estándar de la familia Olmo, es compatible con Hugging Face Transformers, TGI y, previsiblemente, llama.cpp/Ollama tras conversión a GGUF (no se proporciona GGUF oficial).
- Latencia y throughput: no disponibles. El entrenamiento usó 60 prompts × 4 rollouts por paso con respuestas de hasta 32.768 tokens, lo que da una idea del coste computacional del pipeline, pero no se publican métricas de serving.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Benchmark publicado |
|---|---|---|---|---|---|
| Este checkpoint (OPD paso 40) | 7,3B | No disponible | Destilacion on-policy desde Olmo-3.1-32B-Think sobre matematicas | Apache 2.0 | No |
| `mhseo2/sft_olmo3base7b_amr1_0528_math_n204800-step1000` (base del estudiante) | 7,3B | No disponible | SFT supervisado sobre AM-DeepSeek-R1-0528 | Apache 2.0 (presumible) | No disponible |
| `allenai/Olmo-3.1-32B-Think` (profesor) | 32B | No disponible en esta ficha | Modelo de razonamiento con modo thinking | No disponible en esta ficha | No disponible en esta ficha |
| DeepSeek-R1-Distill-Qwen-7B (referencia de la categoria) | 7,6B | 128K (segun su model card) | Destilacion de R1 a un modelo pequeño | MIT | Datos publicos en su model card |

La comparativa es limitada: no hay resultados de evaluación de este checkpoint ni del SFT base, por lo que la única comparación posible es estructural (tamaño, licencia y metodología). Cualquier afirmación sobre rendimiento relativo sería especulativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no se puede afirmar que el modelo sea mejor o peor que su base SFT; el checkpoint es un paso intermedio (40 pasos) y puede estar en una fase temprana de la destilación.
- Riesgo de alucinación: como todo modelo de razonamiento matemático sin evaluación publicada, puede generar cadenas de deducción plausibles pero incorrectas; requiere verificación automática (por ejemplo, con un comprobador simbólico) en producción.
- Sesgos: no hay información sobre la composición del dataset AM-DeepSeek-R1-0528 más allá de su origen matemático; se desconocen sesgos lingüísticos y de dominio.
- Limitaciones de idioma: no se declaran idiomas soportados; el entrenamiento es en matemáticas y probablemente en inglés, por lo que el rendimiento en castellano es incierto.
- Contexto: la longitud de contexto del modelo no está documentada; aunque el entrenamiento usa respuestas de hasta 32.768 tokens, eso no garantiza que la ventana de contexto sea de ese tamaño.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y del dataset de SFT, que no se detallan en la información disponible.
- Madurez: 0 descargas, 0 likes y creado en noviembre de 2026; es un artefacto de investigación sin validación comunitaria.
- Nomenclatura confusa: el nombre incluye "32b" (el profesor) y "olmo31" (la familia del profesor), pero los pesos son de 7,3B; hay que leer la model card para no confundir el tamaño.
- Reproducibilidad: el pipeline depende del paquete `bsc-olmo-base-opd-2026-10-26` y del commit `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4`; sin acceso a ese código, reproducir el entrenamiento es difícil.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mhseo2/opd_sfto7amr1_s1000_olmo31_32b_think_amr1math-step40
- Modelo base (SFT): https://huggingface.co/mhseo2/sft_olmo3base7b_amr1_0528_math_n204800-step1000
- Profesor: https://huggingface.co/allenai/Olmo-3.1-32B-Think
- Repositorio de código `mopdRL`: no disponible como enlace directo en la información proporcionada (commit `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4`, paquete `bsc-olmo-base-opd-2026-10-26`)
- Paper o blog del método OPD: no disponible en la información proporcionada
