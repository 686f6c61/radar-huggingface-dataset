# mlx-community/d1a-e4b-it-qat-4bit

## Resumen

D1A-E4B-it QAT 4-bit es una adaptación para Apple Silicon (MLX) del modelo de decisión D1A, construido sobre el tronco cuantizado de Google `google/gemma-4-E4B-it-qat-w4a16-ct`. Lo distribuye el colectivo `mlx-community` como espejo byte a byte del repositorio original de `JohnP1`, con el objetivo de ofrecer un modelo pequeño de decisión y chat multimodal que se ejecute en local en hardware Apple.

A diferencia de un LLM generativo al uso, el modelo está especializado en responder preguntas cerradas sobre un documento: cada cuestión es de sí/no, de elección múltiple o de puntuación, y el modelo devuelve una probabilidad calibrada para cada opción en un único forward pass, sin generar texto. Esto garantiza que toda respuesta sea una opción válida del conjunto planteado, lo que resulta útil para clasificación, etiquetado y enrutamiento.

El build se apoya en los pesos int4 entrenados con quantización consciente (QAT) de Google, almacenados bit a bit como MLX 4-bit (343 capas lineales int4, error de dequantización 0.0), y el adaptador D1A se reentrenó sobre ese tronco exacto. El repositorio ocupa 5,6 GB y el modelo declara 7.463.013.418 parámetros en safetensors, con licencia Apache 2.0 y soporte de inglés y japonés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4) con adaptador de decisión D1A; tronco QAT int4 |
| Parámetros totales | 7.463.013.418 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit (QAT, pesos int4 empaquetados como MLX 4-bit); encoders en 8-bit |
| Idiomas soportados | inglés (en), japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |
| Librería | mlx |
| Pipeline declarado | text-classification |
| Modelo base | google/gemma-4-E4B-it-qat-w4a16-ct (revisión 6cd26aaa) |
| Tamaño del repositorio | 5,6 GB (4,4 GB de modelo + 0,9 GB de encoders) |
| Fecha de publicación | 2026-10-27 |

## Arquitectura y entrenamiento

El modelo parte del tronco Gemma 4 E4B cuantizado con QAT a int4 (w4a16) por Google. Todos los pesos int4 se conservan sin recuantizar: las 343 capas lineales int4 se almacenan con las mismas palabras empaquetadas y escalas, con error de dequantización nulo. Sobre ese tronco se reentrenó el adaptador D1A, de modo que el modelo 4-bit es exactamente el que se entrenó y no una copia redondeada del bf16.

El reentrenamiento responde a dos motivos documentados. Primero, los pesos QAT difieren de los bf16 sobre los que se entrenó el adaptador v0.6; al mover ese adaptador sin cambios al tronco QAT se perdía precisión y cambiaba el 9,6 % de las respuestas claras en la variante E2B. Segundo, el entrenamiento original en PyTorch sobre GPU Apple sufría un bug que leía como ceros los embeddings por capa para todo token id desde 199.729, afectando a puntuación y dígitos (28,5 % de los tokens de entrenamiento); este reentrenamiento los lee correctamente.

La salida del modelo es una distribución de probabilidad calibrada sobre las opciones de cada pregunta, en una sola pasada y sin decodificación de texto. El autor reporta calibración ECE de 0,105 en transfer-v4 (frente a 0,081 en v0.6). No se detallan en la información disponible el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Decisión sobre documentos: responde preguntas de sí/no, elección múltiple y puntuación devolviendo una probabilidad calibrada por opción.
- Chat en formato OpenAI (`/v1/chat/completions`), con soporte de streaming.
- Entrada multimodal: fotos, clips de voz y vídeo a través de `/v1/systemone/media`.
- Endpoint de decisiones dedicado (`/v1/systemone`).
- Clasificación y etiquetado: etiquetas de pull requests, severidad, radio de impacto y enrutamiento.
- Procesamiento multilingüe limitado a inglés y japonés.
- Respuestas siempre válidas por construcción, al no generar texto libre.
- Ejecución en local sobre Apple Silicon mediante MLX.

## Casos de uso

- Etiquetado automático de pull requests: el modelo asigna etiquetas y severidad a PRs con precisión medida de 81,0 en el conjunto de test, integrándose en flujos de revisión de código.
- Enrutamiento de incidencias: clasifica tickets o solicitudes hacia el equipo o categoría correcta, con ganancias reportadas de +1,7 y +1,5 puntos frente a v0.6.
- Extracción de datos de documentos: responde preguntas cerradas sobre fechas, aserciones y campos concretos (suite night2 con 94,1 en aserciones y 90,0 en fechas).
- Evaluación de riesgo en soporte: estima severidad y radio de impacto de incidencias, útil para priorizar colas de atención.
- Análisis de imágenes y vídeo en local: clasifica escenas o estados (por ejemplo, estado de un paquete) sin enviar datos a la nube.
- Transcripción y clasificación de notas de voz: procesa clips de audio y decide etiquetas como urgencia sobre el contenido hablado.
- Asistencia en dispositivos Apple: despliegue on-device para decisiones sensibles a privacidad con un consumo de 5,3 GB en total.

## Benchmarks y rendimiento

Resultados de la scorecard del autor (precisión en %, delta en puntos con intervalos bootstrap del 95 %; en negrita donde el intervalo excluye 0). Comparación frente a D1A-E4B-it v0.6 (MLX 8-bit) y frente al adaptador de v0.6 movido al mismo tronco QAT.

| Suite | n | Este build | Δ vs v0.6 | Δ vs adaptador v0.6 en este tronco |
|---|---|---|---|---|
| devtools-v1 | 1.074 | 74,6 | +0,2 [-1,1; +1,5] | +0,3 [-1,0; +1,6] |
| documents-v1 | 920 | 88,9 | +0,3 [-1,1; +1,7] | +1,1 [-0,2; +2,4] |
| external semif-v1 | 144 | 88,9 | -2,1 [-5,6; +0,7] | -1,4 [-4,9; +2,1] |
| external typesafe-v1 | 102 | 79,4 | **-7,8 [-11,7; -3,6]** | -1,0 [-5,8; +4,3] |
| external wanli-v1 | 256 | 72,3 | -1,6 [-3,9; +0,8] | +0,4 [-2,3; +3,1] |
| external wanli-v2 | 1.002 | 72,1 | -0,5 [-1,9; +0,9] | **+1,6 [+0,1; +3,1]** |
| hard-v1 | 1.083 | 76,8 | +1,2 [-0,4; +2,9] | **+3,4 [+1,7; +5,4]** |
| ja-jglue development | 1.500 | 80,7 | -0,1 [-1,3; +1,1] | +1,0 [-0,2; +2,3] |
| ja-jglue test | 1.500 | 79,7 | +1,2 [+0,0; +2,4] | **+1,7 [+0,4; +3,0]** |
| night2 assertion | 1.020 | 94,1 | +0,9 [-0,3; +2,0] | **+1,7 [+0,7; +2,7]** |
| night2 dates | 900 | 90,0 | -1,2 [-2,7; +0,2] | +0,9 [-0,2; +2,0] |
| night2 unknowable | 525 | 67,2 | +0,6 [-0,8; +1,9] | +0,6 [-1,0; +2,3] |
| pr-labels development | 2.030 | 80,5 | +0,9 [-0,1; +1,9] | **+1,7 [+0,4; +3,0]** |
| pr-labels development-ja | 198 | 78,8 | +3,5 [-0,5; +7,2] | -0,5 [-5,0; +4,1] |
| pr-labels real17 | 51 | 64,7 | -3,9 [-11,8; +3,9] | +0,0 [-7,8; +7,8] |
| pr-labels test | 2.045 | 81,0 | **+1,6 [+0,5; +2,7]** | **+4,4 [+3,0; +5,9]** |
| pr-labels test-ja | 193 | 76,2 | -0,5 [-2,7; +1,6] | +3,... (truncado) |

Resumen agregado: nivel global frente a v0.6 (pooled -0,16 puntos [-0,88; +0,51] sobre 21 líneas); frente al adaptador v0.6 sin reentrenar en el mismo tronco, +1,19 [+0,50; +1,87] con 6 victorias significativas y ninguna pérdida significativa. La velocidad es prácticamente idéntica a v0.6 en 8-bit (ratio 1,01) con 5,3 GB frente a 7,0 GB. En las 14 peticiones de demo multimodales, 26 de 28 respuestas coinciden con v0.6.

## Requisitos de hardware

- VRAM/unificada estimada: 4,4 GB de modelo más 0,9 GB de encoders, aproximadamente 5,3 GB en total.
- Hardware objetivo: Apple Silicon con MLX; las mediciones del autor se realizaron en un Apple M1 Max.
- GPU dedicadas (A100, H100, RTX 4090): no es el objetivo del build; requiere MLX y no se documenta soporte CUDA.
- Cabe en equipos Apple con memoria unificada de 8 GB o superior, aunque se recomienda margen adicional.
- Despliegue: librería MLX con endpoints compatibles con OpenAI (`/v1/chat/completions`, `/v1/systemone`, `/v1/systemone/media`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor indica un ratio de 1,01 por decisión frente a v0.6 en 8-bit; no se publican cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| D1A-E4B-it QAT 4-bit (este) | 7.463.013.418 | no disponible | 4-bit QAT MLX | Apache 2.0 | MLX, on-device Apple |
| D1A-E4B-it v0.6 (MLX 8-bit) | no disponible | no disponible | 8-bit | Apache 2.0 | MLX, on-device Apple |
| google/gemma-4-E4B-it-qat-w4a16-ct | no disponible | no disponible | 4-bit QAT | no disponible en la información | Pesos base de Google |
| D1A-E2B-it QAT | no disponible | no disponible | 4-bit QAT | Apache 2.0 | MLX, on-device Apple |

Frente a v0.6, este build ocupa 5,3 GB en lugar de 7,0 GB con rendimiento global equivalente y mejoras en etiquetas de PR y enrutamiento, pero con pérdida en la suite externa typesafe. Frente al tronco base de Google, añade el adaptador de decisión y la interfaz multimodal. No se dispone de datos de benchmarks de modelos generativos comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el autor lo publicó antes de completar sus puertas de calidad, aunque ambas se ejecutaron después.
- Pérdida significativa de 7,8 puntos en la suite externa typesafe-v1 respecto a v0.6, atribuida al tronco 4-bit.
- Calibración más laxa en transfer-v4 (ECE 0,105 frente a 0,081), con menos detección de PRs P1 (29 de 47 frente a 39 de 47) aunque con mayor precisión (0,30 frente a 0,22).
- Soporte lingüístico limitado a inglés y japonés; no se declara castellano.
- Longitud de contexto no documentada, lo que dificulta planificar documentos largos.
- Orientado exclusivamente a Apple Silicon con MLX; sin soporte documentado para CUDA ni otros runtimes.
- Riesgo de error en tareas multimodales límite: se documentan dos discrepancias en las demos (lectura de ubicación de un paquete y urgencia de una nota de voz).
- No genera texto libre: su uso está restringido a preguntas cerradas con opciones predefinidas.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base de Google.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlx-community/d1a-e4b-it-qat-4bit
- Repositorio original espejo: https://huggingface.co/JohnP1/d1a-e4b-it-qat-mlx-q4
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it-qat-w4a16-ct
- Variante E2B QAT: https://huggingface.co/JohnP1/d1a-e2b-it-qat-mlx-q4
- Repositorio GitHub del proyecto: https://github.com/jonpol01/d1a
- Issue sobre el bug de embeddings: https://github.com/jonpol01/d1a/issues/353
- Issue de PyTorch relacionado: https://github.com/pytorch/pytorch/issues/188756
- Issue sobre la suite typesafe: https://github.com/jonpol01/d1a/issues/361
- Scorecard completo: https://github.com/jonpol01/d1a/blob/main/docs/reports/2026-10-28-e4b-it-qat-scorecard.md
