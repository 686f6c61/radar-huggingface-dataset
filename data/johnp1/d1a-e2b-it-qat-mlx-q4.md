# JohnP1/d1a-e2b-it-qat-mlx-q4

## Resumen

D1A-E2B-it QAT MLX 4-bit es una adaptación experimental del modelo Gemma 4 E2B-it (variante QAT w4a16-ct de Google) publicada por el usuario JohnP1. No es un modelo generativo al uso: se trata de un modelo de decisión ("system-one") que, dado un documento y una batería de preguntas, devuelve una probabilidad calibrada para cada opción de respuesta (sí/no, elección múltiple o puntuación) en un único forward pass, sin generar texto. De este modo, toda respuesta devuelta es siempre una opción válida del conjunto planteado.

El modelo combina tres piezas: el tronco Gemma 4 E2B-it con cuantización QAT int4 (2,7 GB), un adaptador LoRA de rango 16 sin fusionar (97 MB) y una cabeza de puntero ("pointer head") que produce las distribuciones sobre las opciones. Adicionalmente incluye los codificadores de visión y audio de Gemma 4 en bf16 (1,0 GB), lo que permite procesar fotos, clips de voz y vídeo a través del endpoint `/v1/systemone/media`. La versión v0.7, publicada el 30 de octubre de 2026, afina el adaptador sobre actos de diálogo e intenciones en inglés y japonés.

Su relevancia radica en el despliegue local sobre Apple Silicon mediante MLX: ofrece decisiones calibradas y chat en formato OpenAI con un consumo de memoria moderado, orientado a aplicaciones on-device donde la latencia y la validez estructural de la respuesta importan más que la generación libre de texto. El modelo está marcado explícitamente como experimental.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E2B-it) con adaptador LoRA y cabeza de puntero para clasificación; cuantización QAT int4 |
| Parametros totales | 4.628.569.379 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX 4-bit, grupos de 64; tronco QAT int4 w4a16-ct); codificadores de visión y audio en bf16 |
| Idiomas soportados | en, ja |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX); repo de 6,8 GB |

## Arquitectura y entrenamiento

El modelo se construye sobre el checkpoint `google/gemma-4-E2B-it-qat-w4a16-ct` (revisión `971342c0`), cuyas 276 capas lineales int4 se almacenan bit a bit como MLX 4-bit (mismas palabras empaquetadas y escalas, con error de desquantización 0.0); los embeddings de token y por capa van en 4-bit con grupos de 64. Sobre ese tronco se añade un adaptador LoRA de rango 16 (sin fusionar) y una cabeza de puntero que emite las probabilidades por opción. La temperatura de calibración es 1.91, ajustada sobre 3.178 filas del split de calibración de decision-v7 y del conjunto de desarrollo de etiquetas de PR, con un error de calibración esperado (ECE) de 0,084 a 0,030 fuera de fold.

El entrenamiento de v0.7 parte del adaptador de v0.6 (warm start) sobre el mismo tronco QAT, con una época sobre 7.008 registros: 2.100 de MASSIVE 1.1 (inglés y japonés, 20 enunciados por intención e idioma, más todos los enunciados de las cuatro intenciones más raras), 1.248 preguntas de actos de diálogo escritas para D1A (privadas), 60 preguntas de confirmación de cantidades y 3.600 de replay de fuentes anteriores (etiquetas de PR, blast radius, hard, devtools, documents, JGLUE, routi...). No se documentan fases de RLHF o DPO. La innovación principal es el enfoque de decisión calibrada en un solo paso, sin decodificación generativa, que garantiza respuestas siempre válidas.

## Capacidades

- Decisiones calibradas: dada una pregunta con opciones (sí/no, elección múltiple o puntuación), devuelve una probabilidad por opción en un único forward pass, sin texto generado.
- Clasificación de actos de diálogo en inglés y japonés: acuerdo/desacuerdo/ambigüedad ante una pregunta del asistente, distinción entre agradecimiento y petición, identificación de comandos frente a conversación.
- Clasificación de intenciones sobre MASSIVE 1.1 (60 intenciones, inglés y japonés, con opción "none of these").
- Chat en formato OpenAI (`/v1/chat/completions`) con streaming, usando el tronco Gemma 4 cuando el adaptador está desactivado.
- Procesamiento multimodal de fotos, clips de voz y vídeo mediante `/v1/systemone/media`, gracias a los codificadores de visión y audio incluidos.
- Endpoint de decisiones `/v1/systemone`.
- Capacidades multilingües limitadas a inglés y japonés.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento multi-paso con agentes.

## Casos de uso

- Enrutado de intenciones en asistentes de voz on-device: el modelo clasifica el enunciado del usuario entre 60 intenciones (MASSIVE 1.1) en inglés o japonés y devuelve la probabilidad de cada una, lo que permite umbralizar y derivar a un flujo humano cuando la confianza es baja.
- Detección de acuerdo en conversaciones multi-turno: dado el historial y la última pregunta del asistente, decide si el usuario aceptó, rechazó o fue ambiguo (contrapregunta, matiz, corrección), útil en sistemas de confirmación de reservas o pedidos.
- Triaje de soporte con etiquetas de PR: clasifica pull requests y tickets con etiquetas predefinidas, aprovechando la calibración para priorizar revisiones con probabilidad alta.
- Análisis de clips de voz para atención al cliente: con los codificadores de audio, procesa grabaciones y decide la intención (por ejemplo, "el cliente no está en casa" frente a "paquete dañado") sin transcripción intermedia.
- Moderación y control de calidad en pipelines de datos: clasificación por lotes de documentos con preguntas binarias o de puntuación, donde la garantía de que la salida sea una opción válida simplifica la validación posterior.
- Prototipado local en Apple Silicon: chat y decisiones en un portátil con MLX, con 2,7 GB de tronco más 1,0 GB de codificadores, adecuado para demos y pruebas de concepto sin infraestructura GPU.

## Benchmarks y rendimiento

Resultados publicados en la model card para v0.7 frente a v0.6, medidos en un Apple M1 Max con intervalos de confianza pareados del 95%:

| Suite | v0.6 | v0.7 | Delta |
|---|---|---|---|
| Actos de diálogo, todos (498 preguntas held-out) | 72,1 | 88,0 | +15,9 [+12,2, +19,7] |
| Actos de diálogo, inglés | 73,9 | 90,8 | +16,9 [+12,0, +22,1] |
| Actos de diálogo, japonés | 70,3 | 85,1 | +14,9 [+9,2, +20,5] |
| MASSIVE 1.1, escenarios vistos en entrenamiento | 70,8 | 69,7 | −1,2 [−3,7, +1,5] |
| MASSIVE 1.1, escenarios held-out | 78,0 | 80,0 | +2,0 [−0,3, +4,3] |
| Pooled sobre 22 suites D1A | — | — | −0,38 [−0,87, +0,09] |
| devtools-v1 | — | — | +1,7 [+0,3, +3,0] |

Calibración (ECE): typesafe 0,061 → 0,100; JGLUE test 0,027 → 0,048; WANLI 0,175 → 0,205 y 0,187 → 0,215; PRs revisados a mano 0,104 → 0,149; documents-v1 0,045 → 0,026; night2 dates 0,042 → 0,022. La latencia no cambió entre versiones (veto V3 con ratio 1,018 frente a 1,016 de línea base; una réplica idéntica de v0.6 dio 1,032, atribuido al servicio de ficheros distintos). No se publican resultados de MMLU, HumanEval, GSM8K ni benchmarks generativos equivalentes.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 2,7 GB para el tronco cuantizado más 1,0 GB de codificadores de visión y audio (bf16), más el adaptador de 97 MB y la cabeza de puntero.
- Diseñado para Apple Silicon con MLX; validado en un Apple M1 Max.
- No se documenta compatibilidad con GPU NVIDIA ni con CUDA.
- Opciones de despliegue: librería MLX y los endpoints propios del proyecto (`/v1/systemone`, `/v1/chat/completions`, `/v1/systemone/media`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras absolutas; solo se indica que v0.7 mantiene la velocidad de v0.6.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| D1A-E2B-it QAT MLX 4-bit (este) | 4.628.569.379 | no disponible | Decisiones calibradas + chat, multimodal, MLX | apache-2.0 | Hugging Face, 95 descargas |
| google/gemma-4-E2B-it-qat-w4a16-ct | no disponible | no disponible | Modelo base generativo multimodal, QAT int4 | no disponible en la informacion | Hugging Face (checkpoint de Google) |
| Gemma 4 E2B-it (sin adaptador) | no disponible | no disponible | Chat generativo multimodal | no disponible en la informacion | Incluido en este repo al desactivar el adaptador |

No se dispone de datos de benchmarks ni de especificaciones de contexto de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Modelo marcado como experimental por el autor; no hay garantías de estabilidad para producción.
- Solo soporta inglés y japonés; otros idiomas no están cubiertos.
- El ajuste de calibración se realizó sobre conjuntos que provienen de corpus usados en entrenamiento, lo que puede sobreestimar la calibración en dominios nuevos.
- La calibración empeoró en varias suites en v0.7 (typesafe, JGLUE, WANLI, PRs manuales), con temperatura refitada de 1,91 frente a 1,55.
- En MASSIVE 1.1, v0.7 elige "none of these" con más frecuencia cuando una intención real encaja (37 frente a 30 veces en 600).
- El veto de latencia V3 se activó en la auditoría; la versión se publicó por decisión del propietario, no por superar el criterio automático.
- Riesgo de sesgo y alucinación no documentado en la información disponible; al no generar texto libre, el riesgo de alucinación se limita a la asignación de probabilidad sobre opciones.
- Licencia apache-2.0, lo que permite uso comercial, pero las condiciones del modelo base de Google deben verificarse por separado.
- No se documentan garantías de soporte, mantenimiento ni compatibilidad fuera de MLX/Apple Silicon.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JohnP1/d1a-e2b-it-qat-mlx-q4
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-qat-w4a16-ct
- Model card de v0.6: https://huggingface.co/JohnP1/d1a-e2b-it-qat-mlx-q4/blob/v0.6/README.md
- Dataset MASSIVE: https://huggingface.co/datasets/AmazonScience/massive
- Avatar del proyecto: https://huggingface.co/JohnP1/d1a-e2b-it-qat-mlx-q4/resolve/main/d1a-avatar.png
