# JohnP1/d1a-e4b-it-qat-mlx-q4

## Resumen

D1A-E4B-it QAT MLX 4-bit es un modelo de decisión derivado de google/gemma-4-E4B-it-qat-w4a16-ct, publicado por JohnP1 el 27 de octubre de 2026. No es un modelo generativo al uso: recibe un documento (estado) y un conjunto de preguntas cerradas —sí/no, elección múltiple o puntuación— y devuelve, en una sola pasada hacia delante y sin generar texto, una probabilidad calibrada para cada opción, de modo que toda respuesta es necesariamente una opción válida. Sobre el mismo tronco, con el adaptador LoRA desactivado, el modelo también conversa y procesa imágenes, audio y vídeo.

El build se apoya en los pesos int4 entrenados con quantisation-aware training por Google (w4a16, grupos de 32): las 343 capas lineales cuantizadas se almacenan bit a bit como MLX 4-bit, con error de desquantización 0,0, y el adaptador D1A se reentrenó sobre ese tronco exacto. El repositorio ocupa 5,6 GB y el conjunto pesa 4,4 GB de tronco más 0,9 GB de encoders, pensado para ejecutarse en Apple Silicon mediante MLX.

Es relevante ahora por dos motivos: demuestra un patrón de modelo de decisión calibrado (ECE 0,016 fuera de pliegue) que sustituye la generación autoregresiva por una cabecera de punteros sobre las opciones, y documenta un reentrenamiento motivado por dos fallos concretos —el desajuste entre pesos QAT y bf16, y un bug de PyTorch que anulaba los embeddings de todos los tokens de puntuación y dígitos—. La model card advierte de que el modelo se publicó antes de completar su scorecard, por lo que no hay cifras de benchmarks disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma 4) con cabecera de decisión (pointer head) y encoders de visión y audio |
| Parámetros totales | 7.463.013.418 |
| Parámetros activos | No disponible (la denominación E4B sugiere ~4B efectivos; no confirmado en la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 4 bits QAT w4a16: 343 capas lineales int4 simétricas en grupos de 32; embeddings de token y por capa en 4 bits en grupos de 64; empaquetado MLX 4-bit |
| Idiomas soportados | Inglés (en) y japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX 4-bit), adaptador LoRA safetensors (rango 16, 133 MB), head.safetensors, encoders en bf16 |

## Arquitectura y entrenamiento

El tronco es Gemma 4 E4B-it en su variante QAT w4a16, con 343 capas lineales int4 simétricas en grupos de 32 conservadas exactamente como las entrenó Google, y embeddings de token y por capa cuantizados en 4 bits con grupos de 64 (el QAT solo fija los grupos de 32 de las lineales). Sobre ese tronco se montan tres piezas: un adaptador LoRA de rango 16 sin fusionar, una cabecera de punteros que produce una distribución de probabilidad sobre las opciones de cada pregunta y una temperatura de calibración de 1,66. Los encoders de visión y audio provienen del checkpoint QAT (bf16, 0,9 GB) y se usan para los endpoints multimodales.

El entrenamiento continúa la receta de D1A-E4B-it v0.6 sobre el tronco QAT: warm start desde JohnP1/d1a-e4b-it v0.6, una época de la mezcla multihabilidad de v0.6 (23.427 registros de 11 fuentes, incluidas etiquetas de PR en inglés y japonés, blast radius, PR recientes, hard, devtools, documentos, JGLUE, routing y decision-v7), tronco congelado en los valores del checkpoint QAT desquantizados exactamente (escala × entero en fp32) y tablas de embeddings en bf16. Se usaron learning rate 2e-5, batch 8, 2.929 pasos y 36,2 horas en una Apple M1 Max vía MPS. El reentrenamiento responde a dos causas documentadas: el adaptador v0.6 perdía precisión al moverlo al tronco QAT (en E2B cambiaba el 9,6% de las respuestas claras) y un bug de PyTorch hacía que v0.6 leyera como cero los embeddings por capa de todos los token id desde 199.729 —puntuación y dígitos, el 28,5% de sus tokens de entrenamiento—.

## Capacidades

- Decisión con opciones cerradas: preguntas de tipo sí/no, elección múltiple o puntuación, con probabilidad calibrada por opción en una sola pasada y sin texto generado.
- Chat en formato OpenAI (`/v1/chat/completions`) con streaming, disponible al desactivar el adaptador, momento en el que el modelo es Gemma 4 E4B-it QAT.
- Comprensión de imágenes en JPEG, PNG y WebP a través de `/v1/systemone/media`.
- Comprensión de audio en WAV, FLAC u OGG de hasta 30 segundos.
- Comprensión de vídeo en MP4, MOV o WebM de hasta 32 MB, con muestreo de 16 fotogramas distribuidos uniformemente y sin uso de la pista de sonido.
- Clasificación de etiquetas de pull requests y estimación de blast radius en inglés y japonés.
- Routing y clasificación documental dentro de los conjuntos de entrenamiento declarados (JGLUE, decision-v7, documents).
- Calibración explícita de la confianza, apta para umbrales y escalado a revisión humana.
- No se documentan tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Triaje de tickets de soporte: con el estado del ticket y una pregunta de elección entre equipos (por ejemplo, devoluciones, envío o facturación), el modelo devuelve probabilidades calibradas; el ejemplo de la model card asigna 0,40 a facturación frente a 0,37 a envío para una incidencia con retraso, talla incorrecta y doble cargo.
- Enrutado con umbral y escalado: gracias al ECE de 0,016 fuera de pliegue, se puede fijar un umbral de confianza y derivar a un humano los casos por debajo, en lugar de aceptar siempre la clase más probable.
- Etiquetado automático de pull requests: el modelo se entrenó con etiquetas de PR en inglés y japonés y se validó contra 92 estados del etiquetador, por lo que encaja en un bot de revisión que asigne etiquetas y estime el blast radius del cambio.
- Verificación de incidencias con foto: una imagen del paquete dañado o de la etiqueta de envío se envía al endpoint multimodal junto con preguntas cerradas sobre el estado del artículo o la legibilidad de la etiqueta.
- Clasificación de notas de voz de clientes: clips de hasta 30 segundos se procesan con el encoder de audio para decidir el motivo de la llamada o la urgencia antes de abrir un caso.
- Inspección de vídeo corto: con 16 fotogramas muestreados de un MP4 de hasta 32 MB se pueden responder preguntas cerradas sobre presencia de daños, embalaje o estado de una entrega.
- Asistente de chat local en el dispositivo: desactivando el adaptador, el mismo fichero de pesos sirve como Gemma 4 E4B-it QAT para conversación en un Mac, sin salir de la máquina.
- Filtro previo en pipelines de datos: al no generar texto y resolver cada pregunta en una pasada, encaja como etapa de clasificación masiva en flujos donde la latencia de decodificación autoregresiva sería un cuello de botella.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible; la model card indica explícitamente que el scorecard está pendiente y recomienda fijar JohnP1/d1a-e4b-it-mlx-q8 v0.6 cuando se necesiten cifras medidas. Las únicas comprobaciones publicadas son las siguientes:

| Verificación interna | Resultado |
|---|---|
| Exactitud de la cuantización | 343 de 343 capas lineales idénticas al checkpoint QAT (palabras, escalas y sesgos); error de desquantización 0,0 |
| Calibración (ECE) | 0,069 → 0,016 fuera de pliegue; temperatura 1,66, intervalo del 90% entre 1,59 y 1,74, ajustada con 3.178 filas de decision-v7 y del conjunto de desarrollo del etiquetador de PR |
| Serving | 145 peticiones de demo del playground (14 con imagen, voz o vídeo) y 92 estados del etiquetador de PR respondidos correctamente |
| Ejemplo de decisión | Facturación 0,40 frente a envío 0,37 en la consulta de referencia |

## Requisitos de hardware

- Huella de memoria: 4,4 GB de tronco más 0,9 GB de encoders, aproximadamente 5,3 GB de pesos; el repositorio completo ocupa 5,6 GB, a los que hay que sumar el overhead del runtime.
- Plataforma: exclusivamente Apple Silicon mediante MLX; la referencia de desarrollo y de las pruebas de serving es una Apple M1 Max. No se documenta soporte CUDA, ROCm ni CPU x86.
- GPU consumer: cabe en cualquier Mac con memoria unificada suficiente; con 5,3 GB de pesos, un equipo de 8 GB queda muy justo y se recomienda 16 GB o más (estimación a partir del tamaño de los pesos, no verificada en la model card).
- Despliegue: `pip install "d1a[serve,mlx,media] @ git+https://github.com/jonpol01/d1a"` y `python -m d1a.serving.serve --run JohnP1/d1a-e4b-it-qat-mlx-q4 --port 8009`, que expone endpoints compatibles con el formato OpenAI.
- Dependencia de código: requiere la versión de d1a con la PR jonpol01/d1a#261.
- Alternativas de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Como referencia de coste de entrenamiento, 2.929 pasos con batch 8 tardaron 36,2 horas en una M1 Max vía MPS.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización y tamaño | Licencia | Enfoque |
|---|---|---|---|---|
| JohnP1/d1a-e4b-it-qat-mlx-q4 (este) | 7,46B | 4-bit QAT MLX, 4,4 GB + 0,9 GB de encoders | Apache 2.0 | Decisiones calibradas, chat y multimodal en Apple Silicon; scorecard pendiente |
| JohnP1/d1a-e4b-it-mlx-q8 (v0.6) | No disponible | 8-bit MLX, 6,1 GB + 0,9 GB de encoders | No disponible | Misma familia con cifras medidas; recomendado por el autor cuando se necesitan números |
| JohnP1/d1a-e2b-it-qat-mlx-q4 | No disponible | 4-bit QAT MLX | No disponible | Variante E2B sobre tronco QAT; evidencia de que mover un adaptador v0.6 al tronco QAT sin reentrenar cambiaba el 9,6% de las respuestas claras |
| google/gemma-4-E4B-it-qat-w4a16-ct | No disponible | w4a16 (checkpoint original de Google) | No disponible | Tronco base sin adaptador D1A; conversa, pero no incorpora cabecera de decisión ni calibración |

## Limitaciones y advertencias

- Modelo publicado antes de completar su scorecard: no hay benchmarks públicos y el autor califica el build como experimental.
- La temperatura de calibración se ajustó con 3.178 filas procedentes de corpus que el modelo vio durante el entrenamiento; el ECE de 0,016 es una medida fuera de pliegue pero dentro de la distribución, y puede degradarse con datos de otro dominio.
- Idiomas declarados limitados a inglés y japonés; el rendimiento fuera de ese par no está documentado.
- Dependencia de Apple Silicon y MLX: no hay soporte documentado para CUDA ni para servidores x86, lo que excluye la mayoría de despliegues en la nube.
- El adaptador no está fusionado; para obtener el modelo de decisión hay que cargar `adapter/` y `head.safetensors`, y para conversar hay que desactivarlo.
- Requiere código no liberado en la rama principal (PR jonpol01/d1a#261), lo que introduce riesgo de reproducibilidad.
- La modalidad de vídeo descarta la pista de audio y solo muestrea 16 fotogramas; el audio se limita a 30 segundos y el vídeo a 32 MB.
- El modelo de decisión no genera texto: solo elige entre las opciones proporcionadas, de modo que un planteamiento deficiente de las preguntas no puede corregirse en la respuesta.
- Riesgo de alucinación en el modo chat (Gemma 4 E4B-it QAT sin adaptador) no cuantificado en la información disponible; sesgos del tronco Gemma 4 no documentados aquí.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones heredadas del checkpoint base de Google antes de desplegar en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JohnP1/d1a-e4b-it-qat-mlx-q4
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it-qat-w4a16-ct
- Versión 8-bit con cifras medidas: https://huggingface.co/JohnP1/d1a-e4b-it-mlx-q8
- Variante E2B QAT MLX 4-bit: https://huggingface.co/JohnP1/d1a-e2b-it-qat-mlx-q4
- Modelo v0.6 de origen: https://huggingface.co/JohnP1/d1a-e4b-it
- Repositorio d1a: https://github.com/jonpol01/d1a
- Issue del reentrenamiento sobre tronco QAT: https://github.com/jonpol01/d1a/issues/341
- Issue del bug de embeddings en PyTorch: https://github.com/jonpol01/d1a/issues/353
- Corrección de lectura de embeddings: https://github.com/jonpol01/d1a/issues/354
- Uso de embeddings en bf16: https://github.com/jonpol01/d1a/issues/355
- PR de serving requerida: https://github.com/jonpol01/d1a/pull/261
- Bug upstream de PyTorch: https://github.com/pytorch/pytorch/issues/188756
