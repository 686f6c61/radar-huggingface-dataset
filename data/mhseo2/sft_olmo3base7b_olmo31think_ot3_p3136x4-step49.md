# mhseo2/sft_olmo3base7b_olmo31think_ot3_p3136x4-step49

## Resumen

`sft_olmo3base7b_olmo31think_ot3_p3136x4-step49` es un ajuste fino supervisado (SFT) del modelo base Olmo-3-1025-7B, desarrollado por el usuario mhseo2. El objetivo es destilar trazas de razonamiento matemático del modelo mayor `allenai/Olmo-3.1-32B-Think` sobre el conjunto de prompts de matemáticas OpenThoughts3, transfiriendo capacidad de razonamiento paso a paso a un modelo de 7.300 millones de parámetros. El checkpoint publicado corresponde al paso 49, es decir, al final de la primera época de un plan de 15.

El modelo se enmarca en la familia Olmo 3 de AI2, una línea de modelos totalmente abiertos (pesos, datos y recetas). Aquí se emplea la variante base de 7B como estudiante, sobre la que se aplica SFT con un formato de "thinking" explícito (bloques `</think>`) y respuesta final en caja. El resultado es un modelo especializado en razonamiento matemático competitivo, no un modelo de propósito general.

La relevancia actual reside en dos factores: por un lado, demuestra una receta reproducible de destilación de razonamiento a escala 7B con datos filtrados rigurosamente (decontaminación por 10-gramas contra AIME y HMMT); por otro, publica métricas de evaluación sobre benchmarks de matemáticas de competición (AIME 2025, AIME 2026, HMMT Feb 2025), lo que permite evaluar de forma directa la calidad del ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Olmo 3, según modelo base) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 32.768 tokens (límite usado en entrenamiento y evaluación) |
| Tipos de cuantizacion | no disponible (repo solo con safetensors en float16/bf16; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 shards, ~14,6 GB en total) |

## Arquitectura y entrenamiento

El modelo parte de `mhseo2/Olmo-3-1025-7B-opd`, un checkpoint derivado de Olmo-3-1025-7B (base) de AI2. Sobre él se aplica un ajuste fino supervisado con formato de razonamiento: el estudiante debe generar una traza de pensamiento, cerrar el bloque con `</think>` exactamente una vez y emitir una respuesta final en caja. Solo se conservan las trayectorias que cumplen estas condiciones y que caben en 32.768 tokens.

Los datos provienen del brazo `p3136x4`: 3.136 prompts de OpenThoughts3 (matemáticas) con 4 trayectorias cada uno, lo que suma 12.544 muestras y aproximadamente 225 millones de tokens. Las trayectorias se generan con `allenai/Olmo-3.1-32B-Think` como profesor y se filtran por decontaminación de 10-gramas contra AIME 2025, AIME 2026 y HMMT Feb 2025, evitando fugas de los benchmarks de evaluación. El entrenamiento usa batch de 256, learning rate 8e-5 con decaimiento coseno hasta 4e-5, warmup del 3 %, weight decay 0,01 y 49 pasos por época. Se ejecutó en BSC MareNostrum 5 con 2 nodos de 4 H100 cada uno, usando FSDP y Ulysses sequence parallelism con grado 2.

## Capacidades

- Generación de trazas de razonamiento matemático paso a paso en formato `thinking` con cierre `</think>` y respuesta final en caja.
- Resolución de problemas de matemáticas de competición (AIME, HMMT) con decodificación de múltiples muestras y selección por mayoría (mean@8).
- Generación de texto general heredada del modelo base Olmo 3 7B, aunque no es el foco del ajuste.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: parcial, limitado al razonamiento interno de la traza; no se documentan capacidades de agente con herramientas.
- Capacidades multilingües: no disponibles (la model card no especifica idiomas).
- Modo thinking: sí, es la capacidad central del ajuste.
- Visión y audio: no disponibles.

## Casos de uso

- Evaluación de recetas de destilación de razonamiento: sirve como referencia reproducible para comparar cómo un modelo 7B absorbe trazas de un profesor 32B en dominios matemáticos, dado que se publican datos, hiperparámetros y métricas por checkpoint.
- Generación de soluciones matemáticas con traza auditable: el formato obliga a cerrar `</think>` y a emitir respuesta en caja, lo que facilita el parseo automático y la verificación con herramientas como `math_verify` en pipelines de corrección.
- Benchmarking interno de modelos 7B en matemáticas de competición: sus resultados en AIME 2025, AIME 2026 y HMMT permiten situarlo como línea base al evaluar nuevos ajustes sobre Olmo 3.
- Investigación en decodificación por mayoría (mean@8): el modelo está evaluado con temperature 0,6 y top_p 0,95, un régimen útil para estudiar el impacto del muestreo múltiple en tareas de razonamiento.
- Estudio de contaminación de datos: la decontaminación por 10-gramas contra benchmarks concretos lo convierte en un caso práctico para analizar cómo evitar fugas en datasets sintéticos de razonamiento.
- Prototipado de tutores matemáticos paso a paso: la estructura de traza explícita permite mostrar el razonamiento intermedio al usuario, aunque con las cautelas de fiabilidad descritas más abajo.
- Fine-tuning posterior en dominios específicos: al ser un checkpoint intermedio (época 1 de 15) con licencia Apache 2.0, puede servir como punto de partida para ajustes adicionales en matemáticas o dominios afines.

## Benchmarks y rendimiento

Evaluación mean@8 (%), temperature 0,6, top_p 0,95, prompt de 768 tokens y respuesta de 32.768 tokens, scorer `math_verify`, plantilla de chat del estudiante y ejecución en Quadro RTX 6000 en float16.

| Benchmark | Resultado |
|---|---|
| AIME 2025 | 34,17 |
| AIME 2026 | 36,67 |
| HMMT Feb 2025 | 21,67 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia en float16: en torno a 14,6 GB solo para pesos, más overhead de activaciones y caché KV; con contexto de 32.768 tokens la demanda de memoria crece de forma notable.
- VRAM estimada en cuantización de 8 bits: aproximadamente 7,3 GB para pesos; en 4 bits, en torno a 3,7 GB, aunque no se publican versiones cuantizadas oficiales.
- GPU recomendadas: H100 (usada en entrenamiento), A100 80 GB para contextos largos, y GPUs con 24 GB o más (RTX 4090, RTX A6000, Quadro RTX 6000) para inferencia en float16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con float16 y contexto reducido, o en GPUs de 16 GB si se aplica cuantización.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama tras conversión a GGUF (no se publican artefactos GGUF en el repo); el formato nativo es safetensors compatible con `transformers`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Matemáticas de competición | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sft_olmo3base7b_olmo31think_ot3_p3136x4-step49 | 7,30 B | 32.768 | AIME 2025: 34,17; AIME 2026: 36,67; HMMT Feb 2025: 21,67 (mean@8) | Apache 2.0 | Hugging Face, 36 descargas |
| Olmo-3-1025-7B (base, AI2) | ~7 B | no disponible | no disponible | Apache 2.0 (familia Olmo) | Hugging Face |
| Olmo-3.1-32B-Think (profesor) | ~32 B | no disponible | no disponible en esta ficha | no disponible | Hugging Face |
| mhseo2/Olmo-3-1025-7B-opd (modelo base directo) | ~7 B | no disponible | no disponible | Apache 2.0 | Hugging Face |

No se dispone de resultados numéricos de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento queda limitada a los benchmarks del propio modelo.

## Limitaciones y advertencias

- Es un checkpoint intermedio: solo 1 época de 15 y 49 pasos, por lo que el ajuste está lejos de completarse y el rendimiento puede mejorar con checkpoints posteriores.
- Especialización estrecha: entrenado únicamente con prompts de matemáticas de OpenThoughts3; su comportamiento fuera de ese dominio no está evaluado.
- Riesgo de alucinación en razonamientos: al ser destilación de trazas de un profesor, puede reproducir pasos plausibles pero incorrectos, especialmente en problemas fuera de la distribución de entrenamiento.
- Idiomas no documentados: la model card no especifica cobertura lingüística; el uso en castellano no está validado.
- Sin cuantizaciones oficiales: no se publican GGUF ni versiones en 4/8 bits, lo que obliga a convertirlas manualmente para despliegue en hardware limitado.
- Sin soporte documentado de tool calling ni de agentes con herramientas; no debe asumirse en producción.
- Evaluación limitada: solo tres benchmarks de matemáticas y una única configuración de decodificación (mean@8); no hay datos de latencia, throughput ni robustez.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el profesor deben verificarse por separado para cumplir sus respectivas condiciones.
- Procedencia: autor individual con 36 descargas y sin likes; no hay revisión comunitaria ni garantías de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mhseo2/sft_olmo3base7b_olmo31think_ot3_p3136x4-step49
- Modelo base directo: https://huggingface.co/mhseo2/Olmo-3-1025-7B-opd
- Modelo profesor (Olmo-3.1-32B-Think): https://huggingface.co/allenai/Olmo-3.1-32B-Think
- Dataset OpenThoughts3: https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M
- Familia Olmo de AI2: https://allenai.org/olmo
- Repositorio de código citado (mopdRL, commit f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4): no disponible como URL pública en la información proporcionada.
