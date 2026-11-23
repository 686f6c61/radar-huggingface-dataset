# mlx-community/d1a-e2b-it-qat-4bit

## Resumen

D1A-E2B-it QAT en formato MLX 4-bit es un modelo de decisión experimental derivado de Google Gemma 4 E2B-it QAT, publicado por el usuario JohnP1 y espejado byte a byte por la comunidad mlx-community para su uso en Apple Silicon. No es un modelo generativo al uso: recibe un documento y un conjunto de preguntas (sí/no, elección múltiple o puntuación) y devuelve, en un único forward pass, una probabilidad calibrada para cada opción, sin generar texto. Esto garantiza que toda respuesta sea una opción válida del conjunto planteado.

El modelo combina el tronco Gemma 4 E2B-it QAT (con sus 276 capas lineales int4 almacenadas bit a bit en formato MLX 4-bit, más embeddings de tokens y por capa en grupos de 64) con un adaptador LoRA de rango 16 sin fusionar y una cabeza de punteros específica para la tarea de decisión. El adaptador añade 97 MB sobre los 2,7 GB del tronco, y el total de parámetros asciende a 4.628.569.379. La versión v0.7, publicada el 30 de octubre de 2026, se ha ajustado específicamente en actos de diálogo e intenciones en inglés y japonés.

Su relevancia actual reside en la ejecución completamente local sobre Apple Silicon (MLX), con un consumo de 2,7 GB más 1,0 GB de codificadores para visión, audio y vídeo, y en su enfoque de calibración explícita: cada respuesta lleva asociada una temperatura de calibración (1,91) y una temperatura de enrutamiento (1,59) ajustadas sobre conjuntos de desarrollo propios. Está pensado para tareas de clasificación y decisión en producción donde la latencia y la validez de la respuesta importan más que la generación libre de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E2B-it) con adaptador LoRA rango 16 y cabeza de punteros para decisión |
| Parametros totales | 4.628.569.379 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (QAT int4 en capas lineales; embeddings 4-bit en grupos de 64) |
| Idiomas soportados | inglés, japonés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), adaptador LoRA separado en `adapter/`, cabeza en `head.safetensors` |

## Arquitectura y entrenamiento

El tronco es Gemma 4 E2B-it QAT (revisión `971342c0` de Google), cuyos 276 pesos lineales int4 se almacenan bit a bit como MLX 4-bit con error de dequantización 0.0; los embeddings de tokens y por capa se cuantizan a 4 bits en grupos de 64. Sobre este tronco se monta un adaptador LoRA de rango 16 (97 MB) entrenado por el autor y una cabeza de punteros que produce distribuciones de probabilidad sobre las opciones de cada pregunta. Con el adaptador desactivado, el modelo equivale a Gemma 4 E2B-it QAT y puede usarse para chat convencional.

El ajuste de la versión v0.7 se realizó sobre actos de diálogo e intenciones en inglés y japonés, usando el dataset AmazonScience/massive para la parte de clasificación de intenciones (60 intenciones con opción "ninguna de estas") y preguntas propias para los actos de diálogo. La calibración se ajustó con 3.178 filas del split de calibración decision-v7 y del conjunto de desarrollo de etiquetas de PR, con una temperatura resultante de 1,91 (frente a 1,55 en v0.6). Para peticiones de enrutamiento se aplica una temperatura específica de 1,59, ajustada sobre 315 preguntas de enrutamiento. El error de calibración esperado (ECE) fuera de fold pasó de 0,084 a 0,030 en el conjunto de ajuste.

## Capacidades

- Clasificación y decisión calibrada: devuelve una probabilidad por opción en un solo forward pass, sin texto generado, para preguntas de sí/no, elección múltiple o puntuación.
- Actos de diálogo: detección de acuerdo, desacuerdo, aclaraciones, contrapreguntas, agradecimientos, peticiones encubiertas y comandos frente a conversación.
- Clasificación de intenciones sobre 60 categorías (MASSIVE 1.1) con opción de rechazo ("ninguna de estas").
- Chat en formato OpenAI (`/v1/chat/completions`) con soporte de streaming.
- Entrada multimodal: fotos, clips de voz y vídeo mediante `/v1/systemone/media`, con 1,0 GB adicionales de codificadores.
- Enrutamiento de peticiones mediante `"use_case": "routing"` con temperatura específica.
- Capacidades multilingües limitadas a inglés y japonés.
- Soporte de tool calling: no disponible en la información proporcionada.
- Modo de razonamiento multi-paso o thinking mode: no disponible en la información proporcionada.

## Casos de uso

- Moderación y enrutamiento de conversaciones en atención al cliente: el modelo puede decidir si el usuario ha aceptado una propuesta, si plantea una contrapregunta o si su mensaje es solo un agradecimiento, usando la temperatura de enrutamiento de 1,59 para peticiones marcadas como routing.
- Clasificación de intenciones en asistentes de voz: con el ajuste sobre MASSIVE 1.1 (60 intenciones, inglés y japonés), puede etiquetar la intención de un turno de usuario y decidir si ninguna categoría encaja, lo que permite derivar a un humano o a un flujo específico.
- Triaje de tickets de soporte: dado un documento (el ticket) y un conjunto de preguntas de sí/no (¿es urgente?, ¿requiere reembolso?, ¿es una queja?), devuelve probabilidades calibradas que pueden umbralizarse en un pipeline automático.
- Análisis de llamadas o notas de voz: mediante `/v1/systemone/media`, procesa clips de audio para determinar la intención del cliente (por ejemplo, "el cliente no está en casa" frente a "informar de un paquete dañado") y activar la acción correspondiente.
- Etiquetado de pull requests en herramientas de desarrollo: la cabeza de punteros y el conjunto de desarrollo de etiquetas de PR permiten clasificar PRs según criterios predefinidos con probabilidades calibradas.
- Extracción de decisiones en documentación técnica: dado un documento y preguntas de elección múltiple sobre su contenido, el modelo selecciona la opción más probable sin generar texto libre, lo que reduce el riesgo de alucinación en la salida.
- Procesamiento completamente local en portátiles Apple Silicon: con 2,7 GB de tronco más 1,0 GB de codificadores, cabe en equipos con memoria unificada moderada y permite desplegar clasificación sensible sin enviar datos a la nube.

## Benchmarks y rendimiento

Resultados publicados en la model card para la versión v0.7 frente a v0.6, medidos en un Apple M1 Max con intervalos de confianza pareados al 95%:

| Suite | v0.6 | v0.7 | Δ |
|---|---|---|---|
| Actos de diálogo, todos (498 preguntas) | 72,1 | 88,0 | +15,9 [+12,2, +19,7] |
| Actos de diálogo, inglés | 73,9 | 90,8 | +16,9 [+12,0, +22,1] |
| Actos de diálogo, japonés | 70,3 | 85,1 | +14,9 [+9,2, +20,5] |
| MASSIVE 1.1, escenarios entrenados | 70,8 | 69,7 | −1,2 [−3,7, +1,5] |
| MASSIVE 1.1, escenarios no vistos | 78,0 | 80,0 | +2,0 [−0,3, +4,3] |
| Pooled sobre 22 suites | — | — | −0,38 [−0,87, +0,09] |
| devtools-v1 | — | — | +1,7 [+0,3, +3,0] |

Calibración (ECE) por suite, v0.6 → v0.7: typesafe 0,061 → 0,100; JGLUE test 0,027 → 0,048; WANLI 0,175 → 0,205 y 0,187 → 0,215; PRs revisados a mano 0,104 → 0,149; documents-v1 0,045 → 0,026; fechas night2 0,042 → 0,022. La temperatura de calibración pasó de 1,55 a 1,91. En enrutamiento, el error de calibración sobre 640 preguntas de desarrollo pasó de 0,027 a 0,01 con temperatura 1,59.

Latencia: el veto de latencia V3 de `decide.py` se activó (v0.7 frente a v0.6: 1,018; línea 1,016), pero una medición posterior con una copia byte-idéntica de v0.6 en la misma ranura dio 1,032, por lo que la diferencia se atribuye al servicio de dos ficheros distintos y no a v0.7. No se publican cifras absolutas de latencia o throughput.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 2,7 GB para el tronco más 1,0 GB de codificadores multimodales; el adaptador añade 97 MB.
- Plataforma objetivo: Apple Silicon con MLX (mediciones realizadas en un Apple M1 Max).
- GPU recomendadas: no disponible para CUDA; el formato es específico de MLX y Apple Silicon.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí; en GPUs NVIDIA no hay soporte indicado en la información disponible.
- Opciones de despliegue: MLX con el servidor propio del autor (`/v1/systemone`, `/v1/chat/completions`, `/v1/systemone/media`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: sin cifras absolutas publicadas; solo se documenta la comparación relativa entre versiones (1,018–1,032 en el veto V3).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| D1A-E2B-it QAT 4-bit (este) | 4.628.569.379 | no disponible | en, ja | Apache 2.0 | safetensors MLX | Modelo de decisión con calibración explícita, multimodal |
| Gemma 4 E2B-it QAT (base) | no disponible | no disponible | no disponible | no disponible | safetensors | Tronco generativo sin adaptador de decisión ni cabeza de punteros |
| Modelos de clasificación de intenciones sobre MASSIVE | no disponible | no disponible | en, ja | no disponible | no disponible | Referencia de la tarea; D1A reporta 69,7–80,0 en MASSIVE 1.1 |

No se dispone de información sobre otros modelos comparables de decisión calibrada en formato MLX en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo experimental: la propia model card lo etiqueta como experimental; no debe asumirse estabilidad de API ni de comportamiento entre versiones.
- Idiomas limitados a inglés y japonés; no se documenta soporte de castellano.
- La calibración empeoró en varias suites en v0.7 (typesafe, JGLUE, WANLI, PRs revisados a mano), con ECE de hasta 0,215 en WANLI.
- En clasificación de intenciones, v0.7 elige "ninguna de estas" con más frecuencia cuando existe una intención válida (37 frente a 30 veces en 600).
- El ajuste de calibración se realizó sobre corpus que el modelo ya había visto en entrenamiento, lo que puede inflar la calidad de la calibración reportada.
- La latencia del veto V3 se activó y solo se liberó por decisión explícita del autor, no por superar el criterio automático.
- Riesgo de alucinación: reducido en las tareas de decisión porque no genera texto libre, pero el chat integrado sobre el tronco Gemma sí puede alucinar.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base Gemma 4 deben verificarse por separado.
- Dependencia de Apple Silicon y MLX: no hay soporte documentado para CUDA ni para otros runtimes de inferencia.
- El repositorio es un espejo byte a byte de `JohnP1/d1a-e2b-it-qat-mlx-q4`; la autoría y el mantenimiento corresponden al autor original.

## Enlaces

- Hugging Face: https://huggingface.co/mlx-community/d1a-e2b-it-qat-4bit
- Repositorio original espejado: https://huggingface.co/JohnP1/d1a-e2b-it-qat-mlx-q4
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-qat-w4a16-ct
- Model card de v0.6: https://huggingface.co/mlx-community/d1a-e2b-it-qat-4bit/blob/v0.6/README.md
- Dataset de intenciones: https://huggingface.co/datasets/AmazonScience/massive
- Referencia de issue de enrutamiento: jonpol01/d1a#385 (tag `routing-t1.59`)
- Avatar del proyecto: https://huggingface.co/JohnP1/d1a-e2b-it-qat-mlx-q4/resolve/main/d1a-avatar.png
