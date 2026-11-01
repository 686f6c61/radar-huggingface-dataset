# mhseo2/sft_olmo3base7b_olmo31think_ot3_p3136x4-step490

## Resumen

`sft_olmo3base7b_olmo31think_ot3_p3136x4-step490` es un ajuste fino supervisado (SFT) del modelo base Olmo-3-1025-7B, desarrollado por el usuario mhseo2. El objetivo es transferir capacidades de razonamiento matemático desde un modelo profesor mucho mayor, `allenai/Olmo-3.1-32B-Think`, a un modelo estudiante de 7.298 millones de parámetros mediante destilación de trazas de razonamiento. El entrenamiento se realizó sobre prompts matemáticos del conjunto OpenThoughts3, generando cuatro trayectorias por prompt con el profesor y filtrando únicamente aquellas que cumplían criterios estrictos de formato y longitud.

El checkpoint publicado corresponde al paso 490 de un total de 735 (época 10 de 15), lo que lo sitúa en una fase avanzada pero no final del entrenamiento. La relevancia de este modelo radica en su carácter abierto (licencia Apache 2.0), su enfoque en razonamiento matemático verificado y su entrenamiento sobre infraestructura europea (BSC MareNostrum 5), lo que lo convierte en un caso de interés para investigadores que estudian destilación de razonamiento en modelos de escala media.

Arquitectónicamente hereda la estructura transformer densa de Olmo-3-1025-7B, con aproximadamente 7.300 millones de parámetros y pesos en formato safetensors divididos en tres ficheros. No se dispone de información detallada sobre la longitud de contexto nativa del modelo base en la documentación proporcionada, aunque el proceso de entrenamiento utilizó ventanas de hasta 32.768 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Olmo-3-1025-7B) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (entrenamiento con ventanas de hasta 32.768 tokens) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 shards) + tokenizer.json, vocab.json, merges.txt |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 7.298 millones de parámetros que parte del checkpoint base `mhseo2/Olmo-3-1025-7B-opd`, a su vez derivado de la familia Olmo 3 de AllenAI. El entrenamiento consistió en un SFT sobre trazas de razonamiento generadas por `allenai/Olmo-3.1-32B-Think` para prompts matemáticos de OpenThoughts3. El brazo de datos `p3136x4` comprende 3.136 prompts con 4 trayectorias cada uno, totalizando 12.544 muestras (~225 millones de tokens). Solo se conservaron las trayectorias que terminaban correctamente, cerraban una única etiqueta `</think>` y delimitaban una respuesta en caja tras ella, todo dentro de un límite de 32.768 tokens. Además, se aplicó un filtro de decontaminación de 10-gramas contra AIME 2025/2026 y HMMT Feb 2025.

La configuración de entrenamiento empleó batch de 256, tasa de aprendizaje 8e-5 con decaimiento coseno hasta 4e-5, warmup del 3%, weight decay de 0.01 y 49 pasos por época. El entrenamiento se ejecutó en BSC MareNostrum 5 con 2 nodos de 4 H100 cada uno, usando FSDP y Ulysses sequence parallelism con grado 2. El checkpoint publicado corresponde al paso 490 (época 10 de 15). El código asociado es `mopdRL` (árbol live `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4`, paquete `bsc-olmo-base-opd-2026-10-26`).

## Capacidades

- Generación de texto y razonamiento matemático paso a paso, con modo de pensamiento explícito delimitado por etiquetas `</think>`.
- Resolución de problemas de competición matemática (AIME, HMMT) mediante cadenas de razonamiento largas, de hasta 32.768 tokens de respuesta.
- Destilación efectiva de capacidades de un profesor de 32B a un estudiante de 7B en el dominio matemático.
- Soporte de plantilla de chat propia (`chat_template.jinja` incluida en el repositorio).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente, aunque el formato de razonamiento largo es compatible con pipelines de cadena de pensamiento.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Evaluación de destilación de razonamiento: el modelo sirve como caso de estudio para medir cuánta capacidad matemática de un profesor de 32B se transfiere a un estudiante de 7B con 12.544 muestras filtradas, permitiendo analizar curvas de aprendizaje por paso (el checkpoint del paso 490 es intermedio).
- Investigación en filtrado de datos sintéticos: el pipeline de filtrado (terminación correcta, cierre único de `</think>`, respuesta en caja, límite de 32.768 tokens, decontaminación de 10-gramas) es replicable y el modelo resultante permite validar empíricamente el impacto de estos criterios.
- Generación de soluciones matemáticas paso a paso en entornos educativos: el modelo produce cadenas de razonamiento largas y estructuradas, adecuadas para tutoría automatizada de problemas de nivel AIME/HMMT, con la salvedad de que su precisión es moderada (41,25% en AIME 2025).
- Benchmarking de modelos pequeños en matemáticas: con 7.298 millones de parámetros y licencia Apache 2.0, es un candidato para comparativas reproducibles frente a otros modelos de tamaño similar en tareas de razonamiento matemático.
- Base para ajustes posteriores (RL, DPO): al ser un checkpoint intermedio de SFT con licencia permisiva, puede emplearse como punto de partida para experimentos de refinamiento con preferencias o verificación.
- Despliegue en infraestructura moderada: con ~14,6 GB de pesos en precisión completa, cabe en GPUs de 24 GB en cuantización de 8 bits o en configuraciones multi-GPU consumer, lo que facilita experimentación académica sin clústeres grandes.

## Benchmarks y rendimiento

Resultados publicados por el autor (mean@8 accuracy en %, temperatura 0,6, top_p 0,95, prompt 768 / respuesta 32.768 tokens, scorer `math_verify`, plantilla de chat del estudiante, ejecutado en Quadro RTX 6000 en float16):

| Benchmark | Resultado (mean@8, %) |
|---|---|
| AIME 2025 | 41,25 |
| AIME 2026 | 46,25 |
| HMMT Feb 2025 | 28,75 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~14,6 GB en fp16/bf16 (tamaño del repositorio); ~7,3 GB en cuantización de 8 bits; ~3,7 GB en 4 bits (estimaciones teóricas a partir del número de parámetros, no verificadas por el autor).
- GPU recomendadas: H100 (usadas en entrenamiento), A100 40/80 GB para inferencia cómoda con contexto largo; Quadro RTX 6000 fue usada por el autor para evaluación en float16.
- Compatibilidad con GPU consumer: sí, en GPUs de 24 GB (RTX 3090, RTX 4090) en fp16 ajustado o cuantización; en 16 GB (RTX 4080, 4070 Ti Super) requiere cuantización de 8 bits o inferior.
- Opciones de despliegue: vLLM, TGI, llama.cpp (previa conversión a GGUF), Ollama (previa conversión). El repositorio solo incluye safetensors; no se proporcionan pesos GGUF.
- Latencia y throughput: no disponibles. El contexto de respuesta de hasta 32.768 tokens implica latencias altas en generación de razonamiento largo, especialmente en GPU consumer.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| sft_olmo3base7b_olmo31think_ot3_p3136x4-step490 | 7,298 B | No disponible (entrenado a 32.768) | Apache 2.0 | HuggingFace (37 descargas) | Checkpoint intermedio de SFT matemático |
| Olmo-3-1025-7B (base, AllenAI) | ~7 B | No disponible | Apache 2.0 | HuggingFace | Modelo base sin SFT matemático específico |
| Olmo-3.1-32B-Think (AllenAI) | ~32 B | No disponible | No disponible | HuggingFace | Profesor usado para generar las trazas |
| Alternativas de 7B con razonamiento matemático | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos verificados en la información |

No se dispone de resultados de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 490 de 735 (época 10 de 15), por lo que no representa el estado final del entrenamiento y su rendimiento podría mejorar con checkpoints posteriores.
- Rendimiento matemático moderado: 28,75% en HMMT Feb 2025 y 41,25% en AIME 2025, insuficiente para uso en producción donde se requiera alta precisión sin verificación externa.
- Dominio restringido: entrenado exclusivamente sobre prompts matemáticos de OpenThoughts3; su comportamiento fuera de ese dominio no está caracterizado.
- Riesgo de alucinación: como todo modelo generativo, puede producir cadenas de razonamiento plausibles pero incorrectas; el scorer `math_verify` mitiga pero no elimina este riesgo.
- Sesgos: no se han publicado análisis de sesgos en la información disponible.
- Idiomas: no se especifican los idiomas soportados; el entrenamiento se realizó sobre un dataset mayoritariamente en inglés, por lo que el rendimiento en castellano es incierto.
- Contexto: aunque el entrenamiento usó ventanas de 32.768 tokens, la longitud de contexto nativa del modelo base no está documentada en la ficha.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base y el profesor tienen sus propias condiciones que deben verificarse por separado.
- Reproducibilidad: el autor documenta hiperparámetros y hashes SHA-256 de los ficheros, pero el código de entrenamiento (`mopdRL`) se referencia por commit sin enlace directo en la información disponible.
- Bajo número de descargas (37) y ausencia de likes: poca validación comunitaria; usar con cautela en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mhseo2/sft_olmo3base7b_olmo31think_ot3_p3136x4-step490
- Modelo base: https://huggingface.co/mhseo2/Olmo-3-1025-7B-opd
- Modelo profesor: https://huggingface.co/allenai/Olmo-3.1-32B-Think
- Dataset OpenThoughts3: no disponible en la información proporcionada
- Paper de Olmo 3: no disponible en la información proporcionada
- Repositorio de código `mopdRL`: no disponible como enlace directo (referenciado por commit `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4`, paquete `bsc-olmo-base-opd-2026-10-26`)
