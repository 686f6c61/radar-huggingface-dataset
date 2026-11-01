# FastFlowLM/D3-Flash-NPU2

## Resumen

D3-Flash-NPU2 es un paquete de pesos cuantizados del modelo de decisión D3-Flash (Decision 3.0), el "decision model" del enrutador semántico vLLM Semantic Router, adaptado por FastFlowLM para su ejecución en las NPU de AMD Ryzen AI. Se construye sobre la torre de texto de Qwen3.5-9B (revisión `13dc1cc8`) y responde a peticiones de tipo *System One*: preguntas de elección, sí/no y puntuación sobre un estado, opcionalmente acompañadas de imágenes, devolviendo una probabilidad para cada opción.

La relevancia del modelo radica en su función, no en su tamaño: no es un modelo conversacional generalista, sino un clasificador de decisiones de baja latencia pensado para enrutar peticiones dentro de un sistema mayor. El paquete mantiene el mismo contrato de API (`POST /v1/systemone`) que el modelo original, con soporte de hasta 32.768 tokens de entrada por pregunta y capacidad de procesar imágenes.

Técnicamente, el texto se ha cuantizado al formato propietario Q4NX de FastFlowLM (proyecciones en Q4_K con redondeo calibrado por GPTQ, embeddings en Q8_0, normas y parámetros de Gated DeltaNet sin cuantizar), mientras que la torre de visión se distribuye en un fichero aparte (`vision_weight.q4nx`) idéntica a la de Qwen3.5-9B. El objetivo declarado es preservar la precisión del BF16 original (pérdida media de 0,36 puntos en el Decision Index) con latencias de menos de un segundo en peticiones cortas sobre una NPU XDNA 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (incluye capas Gated DeltaNet) y torre de visión, derivada de Qwen3.5-9B |
| Parametros totales | 9B (torre de texto Qwen3.5-9B; parámetros de la torre de visión no especificados) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 32.768 tokens de entrada por pregunta; peticiones superiores se rechazan con `max_length_exceeded` sin truncar |
| Tipos de cuantizacion | Q4NX propietario de FastFlowLM: proyecciones Q4_K con redondeo calibrado GPTQ, token embedding Q8_0, normas y Gated DeltaNet sin cuantizar; torre de visión en `vision_weight.q4nx` |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Q4NX (propietario de FastFlowLM) más `readout.safetensors` y ficheros de configuración/tokenizador en formato estándar |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-9B: un transformer con mecanismos de atención híbridos que incluyen capas Gated DeltaNet, tal como se deduce de la mención explícita a que sus parámetros se mantienen sin cuantizar. Sobre esa base, D3-Flash añade un módulo de lectura (`readout.safetensors`) y una configuración de decisión (`decision_config.json`) que transforman las representaciones del modelo en distribuciones de probabilidad sobre opciones discretas. La torre de visión es la de Qwen3.5-9B, incluyendo el merger, y se activa únicamente en peticiones con imágenes.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. Lo que sí se documenta es el proceso de cuantización: calibración GPTQ con 192 prompts sintéticos de System One de entre 100 y 2.048 tokens, ninguno procedente del Decision Index, para ajustar el redondeo de las proyecciones a Q4_K. Los ficheros `readout.safetensors`, `decision_config.json`, `tokenizer.json`, `tokenizer_config.json`, `chat_template.jinja` y `LICENSE` son idénticos byte a byte a los del modelo original, verificables mediante `MANIFEST.sha256`.

## Capacidades

- Clasificación de decisiones zero-shot: responde preguntas de tipo elección (varias opciones con descripción), sí/no y puntuación sobre un estado textual.
- Salida probabilística: devuelve una probabilidad para cada opción, no solo la etiqueta ganadora.
- Procesamiento de imágenes: acepta una lista de imágenes en base64 (PNG, JPEG, WebP), hasta 8 MB y 16 MP por imagen, redimensionadas a un máximo de 1,6 MP, compartidas por todas las preguntas de la petición.
- Múltiples preguntas por petición: permite formular varias preguntas sobre el mismo estado, compartiendo la codificación de imágenes cuando las hay.
- Contexto largo: hasta 32.768 tokens de entrada por pregunta, con rechazo explícito (sin truncado) si se supera.
- API compatible con el runtime original: mismo endpoint `POST /v1/systemone`, mismos ids de token y mismos objetos de respuesta que el paquete upstream.
- Ejecución en NPU: diseñado para las NPU XDNA 2 de AMD Ryzen AI mediante FastFlowLM 1.0.12 o superior.
- No soporta vídeo: las peticiones con campo `videos` se rechazan con HTTP 422.
- No se documentan capacidades de generación de texto libre, tool calling ni razonamiento multi-paso; el modelo está especializado en decisiones.

## Casos de uso

- Enrutamiento de peticiones en un sistema RAG o de agentes: dado el texto de una consulta, decidir a qué herramienta, índice o subagente derivarla usando preguntas de elección con probabilidades, integrándolo como primer paso de un pipeline mayor.
- Moderación y triaje de tickets de soporte: clasificar un mensaje entrante en categorías como devoluciones, facturación o general, con la probabilidad asociada para aplicar umbrales de derivación a humanos.
- Clasificación de documentos con imágenes: procesar capturas, formularios escaneados o fotos de producto y decidir su categoría en una sola petición, aprovechando la torre de visión y el límite de 1,6 MP por imagen.
- Filtrado previo en pipelines de datos: etiquetar grandes lotes de textos cortos con preguntas sí/no (por ejemplo, "¿es spam?", "¿es una queja?") agrupando varias preguntas por petición para amortizar la codificación.
- Enrutamiento semántico de bajo consumo en equipos locales: desplegar el modelo en un portátil o mini-PC con Ryzen AI MAX+ PRO 395 para clasificar consultas sin GPU dedicada, con latencias de 0,85 s en peticiones de 128 tokens.
- Control de calidad y evaluación automática: usar preguntas de puntuación para asignar una nota probabilística a respuestas generadas por otro modelo dentro de un sistema de evaluación.
- Decisión sobre estados largos: analizar conversaciones o documentos de hasta 32.768 tokens (por ejemplo, decidir si un caso requiere escalado) aceptando latencias de decenas de segundos en ese régimen.

## Benchmarks y rendimiento

Precisión frente al modelo BF16 original:

| Metrica | Este paquete en NPU | Upstream BF16 |
|---|---|---|
| Decision Index, muestra del suite público (1.600 peticiones, 37 benchmarks), puntuación media | 67,4% | 67,8% |
| Acuerdo Top-1 con BF16 en las mismas peticiones (4.452 respuestas de elección) | 97,0% | -- |
| Prompts largos, 835 a 31.545 tokens (8 peticiones), misma respuesta principal que BF16 | 8 de 8 | -- |
| Decision Index, subconjunto del suite de visión (300 preguntas, 10 benchmarks), exactitud | 72,7% | 75,0% |
| Acuerdo Top-1 con BF16 en las mismas preguntas con imagen | 90,0% | -- |

La diferencia media de puntuación frente a BF16 es de -0,36 puntos (error estándar 0,66 puntos; unas 41 peticiones por benchmark). En visión, la diferencia de exactitud emparejada es de +2,3 puntos a favor de BF16 (IC 95% de -0,9 a +5,6 puntos).

Latencia medida en AMD Ryzen AI MAX+ PRO 395 (Strix Halo, XDNA 2, 128 GB, Ubuntu 24.04, XRT, FastFlowLM 1.0.12):

| Peticion | Latencia mediana |
|---|---|
| 1 pregunta, 128 tokens | 0,85 s |
| 1 pregunta, 330 tokens | 1,0 s |
| 1 pregunta, 1.024 tokens | 2,3 s |
| 1 pregunta, 4.096 tokens | 9,0 s |
| 1 pregunta, 16.383 tokens | 41 s |
| 1 pregunta, 31.545 tokens | 92 s |
| 1 pregunta, 32.768 tokens | 96 s |
| 4 preguntas, 330 tokens cada una | 3,1 s |
| 16 preguntas, 330 tokens cada una | 11,7 s |
| 1 pregunta + imagen 1024x768 (880 tokens, HTTP) | 3,3 s |
| 1 pregunta + dos imágenes (HTTP) | 5,2 s |
| 1 pregunta + imagen 2000x1500 (reducida a 1,6 MP, HTTP) | 7,0 s |
| 8 preguntas + una imagen (una sola codificación, HTTP) | 18,3 s |

A partir de 1.536 tokens la atención se ejecuta en el kernel de atención de la NPU. La memoria residente del servidor es de 6,8 GB tras la carga y hasta 14,1 GB con 32.768 tokens e imágenes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precisión Decision Index | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| D3-Flash-NPU2 (este) | 9B (Q4NX) | 32.768 tokens | 67,4% (NPU) | Apache-2.0 | HuggingFace, requiere FastFlowLM 1.0.12+ y NPU AMD Ryzen AI |
| vllm-sr/d3-flash (BF16 upstream) | 9B | no disponible en la información | 67,8% | Apache-2.0 | HuggingFace, runtime vLLM Semantic Router |
| d3:mini | 4B | no disponible | no disponible | no disponible | Paquete hermano de FastFlowLM |
| d3:nano | 2B | no disponible | no disponible | no disponible | Paquete hermano de FastFlowLM |
| d3:lite | 0,8B | no disponible | no disponible | no disponible | Paquete hermano de FastFlowLM |

No se dispone de datos de benchmarks de los modelos hermanos ni de otras alternativas de clasificación de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado: no es un modelo generativo general; solo responde preguntas de decisión a través de la API `systemone`. No debe usarse como chat.
- Dependencia de hardware y software: requiere una NPU AMD Ryzen AI y FastFlowLM 1.0.12 o superior; no es desplegable en GPU convencionales ni en CPU con los formatos estándar (llama.cpp, vLLM, TGI no aplican al formato Q4NX).
- Sin soporte de vídeo: las peticiones con `videos` se rechazan con HTTP 422.
- Límite estricto de contexto: por encima de 32.768 tokens se devuelve `max_length_exceeded` sin truncar, lo que exige gestionar el error en el cliente.
- Pérdida de precisión por cuantización: -0,36 puntos de media en el Decision Index y hasta 2,3 puntos en exactitud de visión frente a BF16; el acuerdo Top-1 es del 97,0% en texto y del 90,0% en imagen, por lo que un pequeño porcentaje de decisiones diferirá del modelo original.
- Latencia elevada en contextos largos: 92 s para 31.545 tokens y 96 s para 32.768 tokens en el hardware de referencia, lo que limita su uso interactivo en esos regímenes.
- Memoria: hasta 14,1 GB de memoria residente con contextos máximos e imágenes, relevante en equipos con menos RAM.
- Sesgos y alucinaciones: no se documentan análisis de sesgo ni tasas de alucinación en la información disponible; al tratarse de un clasificador, el riesgo se manifiesta como asignación errónea de probabilidad a opciones, no como texto inventado.
- Idiomas: no se especifican los idiomas soportados; no se puede asumir cobertura multilingüe más allá de la del modelo base.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar `LICENSE` y `NOTICE` del repositorio, así como las condiciones de Qwen/Qwen3.5-9B como modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/FastFlowLM/D3-Flash-NPU2
- Modelo base: https://huggingface.co/vllm-sr/d3-flash
- Modelo base de la torre de texto: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de FastFlowLM: https://github.com/ROCm/FastFlowLM
