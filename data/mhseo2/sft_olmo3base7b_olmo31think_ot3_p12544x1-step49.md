# mhseo2/sft_olmo3base7b_olmo31think_ot3_p12544x1-step49

## Resumen

`sft_olmo3base7b_olmo31think_ot3_p12544x1-step49` es un ajuste fino supervisado (SFT) del modelo base Olmo-3-1025-7B, desarrollado por el usuario mhseo2 a partir de su propio checkpoint intermedio `mhseo2/Olmo-3-1025-7B-opd`. El objetivo es transferir capacidades de razonamiento matemático desde un modelo profesor mucho mayor, `allenai/Olmo-3.1-32B-Think`, a un estudiante de 7.300 millones de parámetros mediante destilación de trazas de razonamiento sobre el conjunto de prompts matemáticos OpenThoughts3.

El checkpoint publicado corresponde al paso 49, es decir, el final de la primera época de un entrenamiento planificado a 15 épocas, con 12.544 muestras de entrenamiento (una trayectoria por prompt) que suman aproximadamente 225 millones de tokens. La selección de datos es estricta: solo se conservan trayectorias que terminan correctamente, cierran una única etiqueta `</think>` y proporcionan una respuesta encajada en caja dentro de un límite de 32.768 tokens, además de aplicar descontaminación por n-gramas (10-gramas) frente a AIME 2025, AIME 2026 y HMMT Febrero 2025.

Es relevante ahora porque forma parte del ecosistema Olmo 3 de Ai2, una familia totalmente abierta (pesos, datos y recetas), y porque documenta un caso práctico de destilación de razonamiento matemático sobre hardware europeo (BSC MareNostrum 5) con licencia Apache 2.0. Su utilidad principal es como modelo de investigación para estudiar dinámicas de SFT sobre trazas largas de razonamiento y para evaluar la transferencia de capacidad matemática entre escalas (32B a 7B).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Olmo 3; detalles internos de capas y atencion no disponibles en la informacion proporcionada) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible como spec oficial; el entrenamiento y la evaluacion usan 32.768 tokens de respuesta y 768 tokens de prompt |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 shards: model-00001-of-00003, model-00002-of-00003, model-00003-of-00003) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `mhseo2/Olmo-3-1025-7B-opd`, que a su vez deriva de Olmo-3-1025-7B (base) de Ai2. La arquitectura subyacente es la de Olmo 3, un transformer decoder-only con 7.298 millones de parámetros; la model card no detalla número de capas, cabezas de atención ni tipo de atención (full, sliding window o híbrida). El entrenamiento se realizó con FSDP sobre 2 nodos x 4 GPU H100 en BSC MareNostrum 5, con paralelismo de secuencia Ulysses SP 2, lo que indica que se trabajó con secuencias largas distribuidas entre GPUs.

La receta de SFT es la siguiente: 12.544 prompts de OpenThoughts3, una trayectoria por prompt (brazo de datos `p12544x1`), generadas por el profesor `allenai/Olmo-3.1-32B-Think`. Los filtros de calidad exigen finalización correcta, un único cierre de `</think>` y respuesta encajada en caja posterior, todo dentro de 32.768 tokens, con descontaminación de 10-gramas contra AIME 2025, AIME 2026 y HMMT Feb 2025. El entrenamiento usa batch 256, learning rate 8e-5 con decaimiento coseno hasta 4e-5, warmup del 3 %, weight decay 0.01 y 49 pasos por época. El checkpoint publicado es el paso 49 (época 1 de 15). El código de entrenamiento se referencia como `mopdRL` (árbol vivo f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4, paquete `bsc-olmo-base-opd-2026-10-26`), aunque no se proporciona URL al repositorio.

## Capacidades

- Generación de texto y razonamiento matemático de varios pasos, con modo de razonamiento explícito delimitado por `</think>` y respuesta final encajada en caja.
- Resolución de problemas de competición matemática (AIME, HMMT) mediante cadenas de razonamiento largas, hasta 32.768 tokens de respuesta.
- Destilación de trazas de razonamiento: el modelo ha aprendido el estilo y la estructura de las cadenas del profesor Olmo-3.1-32B-Think, no solo la respuesta final.
- Plantilla de chat propia incluida (`chat_template.jinja`), necesaria para reproducir el formato de entrenamiento y evaluación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso orquestado: no disponible en la información proporcionada (el multi-paso se limita al razonamiento interno matemático).
- Capacidades multilingües: no disponibles (no se documentan idiomas).
- Capacidades especiales: modo de razonamiento con etiqueta `</think>` y respuesta en caja; no se documentan visión ni audio.

## Casos de uso

- Investigación en destilación de razonamiento: comparar el paso 49 de este SFT con checkpoints posteriores (épocas 2 a 15) y con el modelo base para medir cuánto de la capacidad matemática del profesor 32B se transfiere a un estudiante 7B, usando AIME 2025, AIME 2026 y HMMT Feb 2025 como referencia.
- Reproducción de experimentos de SFT sobre OpenThoughts3: la model card documenta hiperparámetros completos (batch, lr, warmup, weight decay, filtros de datos), lo que permite replicar el pipeline en otros clústeres y comparar curvas de aprendizaje.
- Evaluación de filtros de calidad de datos: el modelo sirve como control para estudiar el efecto de exigir cierre único de `</think>` y respuesta encajada en caja, frente a entrenamientos sin esos filtros.
- Generación de soluciones matemáticas paso a paso en entornos educativos o de anotación: con 32.768 tokens de respuesta puede producir desarrollos extensos, útil para generar datos sintéticos de razonamiento que luego se filtran y revisan.
- Estudio de descontaminación: al haberse descontaminado por 10-gramas contra benchmarks concretos, es un caso útil para analizar cómo afectan las decisiones de descontaminación a las métricas reportadas en modelos pequeños.
- Base para ajustes posteriores específicos de dominio: al ser un checkpoint intermedio con licencia Apache 2.0 y pesos safetensors estándar, puede servir como inicialización para SFT adicional en matemáticas, física o código, aunque su rendimiento absoluto es limitado.

## Benchmarks y rendimiento

Datos publicados en la model card: precisión mean@8 (%), temperatura 0.6, top_p 0.95, prompt de 768 tokens, respuesta de 32.768 tokens, scorer `math_verify`, plantilla de chat del estudiante, ejecutado en NVIDIA H100 80GB HBM3 en float16.

| Benchmark | mean@8 (%) |
|---|---|
| AIME 2025 | 33,75 |
| AIME 2026 | 34,58 |
| HMMT Feb 2025 | 22,08 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones directas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en float16: aproximadamente 14,6 GB solo para pesos (7.298 millones de parámetros x 2 bytes), más overhead de activaciones y caché KV para secuencias de hasta 32.768 tokens, que puede elevar el consumo muy por encima de los 20-30 GB según batch y longitud.
- GPU recomendadas: H100 80GB (la usada en la evaluación oficial) para reproducir exactamente las condiciones reportadas; A100 80GB como alternativa equivalente en memoria.
- Cabe en GPU de consumo: en cuantización de 4 bits los pesos ocuparían unos 3,7 GB, pero la información proporcionada no incluye variantes GGUF ni cuantizadas oficiales; con secuencias de 32.768 tokens la caché KV puede hacer inviable su uso cómodo en GPUs de 24 GB o menos.
- Opciones de despliegue: al publicarse solo en safetensors, el despliegue natural es con vLLM, TGI o transformers; llama.cpp y Ollama requerirían conversión a GGUF no proporcionada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada; la evaluación usó 8 muestras por problema con respuestas de hasta 32.768 tokens, lo que implica un coste de inferencia elevado por consulta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento matematico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sft_olmo3base7b_olmo31think_ot3_p12544x1-step49 | 7,30B | Entrenamiento/eval a 32.768 tokens de respuesta; contexto oficial no disponible | AIME 2025: 33,75; AIME 2026: 34,58; HMMT Feb 2025: 22,08 (mean@8) | Apache 2.0 | HuggingFace, safetensors |
| Olmo-3-1025-7B (base, Ai2) | 7,30B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Apache 2.0 (familia Olmo 3) | HuggingFace |
| Olmo-3.1-32B-Think (profesor, Ai2) | 32B (aproximado, segun nombre) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | HuggingFace |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible cuantificar la brecha entre estudiante y profesor ni frente al base.

## Limitaciones y advertencias

- Checkpoint intermedio: solo se ha completado 1 de 15 épocas planificadas, por lo que el rendimiento reportado no representa el techo de la receta; es esperable que checkpoints posteriores mejoren las métricas.
- Rendimiento matemático moderado: 33,75 en AIME 2025 y 22,08 en HMMT Feb 2025 (mean@8) están lejos de lo que cabría esperar de modelos de razonamiento maduros; no debe usarse como referencia de estado del arte.
- Riesgo de alucinación: al ser un modelo de 7B destilado de trazas largas, puede producir cadenas de razonamiento plausibles pero incorrectas, especialmente fuera de la distribución de OpenThoughts3.
- Sesgos: no se documentan análisis de sesgo, toxicidad ni evaluación de seguridad en la información proporcionada.
- Idiomas: no se especifican idiomas soportados; el entrenamiento se centra en prompts matemáticos, presumiblemente en inglés, sin garantías multilingües.
- Contexto: no se documenta la longitud máxima de contexto del modelo base; el uso de 32.768 tokens de respuesta en entrenamiento y evaluación no implica que el modelo generalice a contextos de entrada de esa longitud.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base y el profesor tienen sus propias condiciones; conviene verificar la licencia de `mhseo2/Olmo-3-1025-7B-opd` y de `allenai/Olmo-3.1-32B-Think` antes de un despliegue comercial.
- Trazabilidad limitada: no se enlaza el repositorio de código `mopdRL` ni se publican los datos de entrenamiento exactos, lo que dificulta la reproducción completa.
- Uso en producción: sin benchmarks de latencia, throughput ni robustez fuera de matemáticas, no se recomienda como modelo generalista en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mhseo2/sft_olmo3base7b_olmo31think_ot3_p12544x1-step49
- Modelo base del ajuste: https://huggingface.co/mhseo2/Olmo-3-1025-7B-opd
- Modelo profesor citado: https://huggingface.co/allenai/Olmo-3.1-32B-Think
- Familia Olmo 3 de Ai2: no disponible en la informacion proporcionada (no se incluyen URLs)
- Repositorio de código `mopdRL`: no disponible en la informacion proporcionada (solo se cita el hash f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4 y el paquete `bsc-olmo-base-opd-2026-10-26`)
- Conjunto OpenThoughts3: no disponible en la informacion proporcionada (no se incluye URL)
- Paper o blog del modelo: no disponible en la informacion proporcionada
