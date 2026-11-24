# litert-community/clef-flash-LiteRT

## Resumen

Clef-Flash para LiteRT es una conversión comunitaria del modelo de decisión `Cloudflare/clef-flash` al formato LiteRT/TFLite, orientada a su ejecución en runtimes de escritorio. El modelo original, desarrollado por Cloudflare, es un modelo de decisión post-entrenado a partir de `Qwen/Qwen3.5-9B`: no genera texto libre, sino que lee un estado (texto, un valor JSON, imágenes o vídeo) junto con preguntas tipadas y devuelve, para cada pregunta, la probabilidad de cada opción. La conversión la firma el usuario `litert-community` mediante litert-torch 0.9.4 y la API CompiledModel de ai-edge-litert 2.2.0.

La relevancia de esta ficha reside en que muestra un patrón de despliegue distinto del habitual en LLM generativos: el modelo no decodifica tokens, sino que cada petición es un único prefill que alimenta una cabeza conjunta ("joint head") que puntúa todas las opciones de todas las preguntas a la vez. Esto lo aleja del uso como chatbot y lo acerca a tareas de clasificación y decisión estructurada con contexto largo (hasta 4.096 tokens) y soporte de visión mediante dos torres visuales (tiles de 256 px y 448 px).

El repositorio ocupa 75,5 GB e incluye cinco grafos de fila (row graphs) para peticiones de hasta 256, 512, 1.024, 2.048 y 4.096 tokens, dos torres de visión, el tokenizador, las tablas de embeddings y de la cabeza de salida, fixtures de prueba y los scripts de conversión. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (derivado de Qwen3.5-9B) con cabeza conjunta de decisión y torres de visión; conversión a LiteRT/TFLite |
| Parametros totales | no disponible (el modelo base es Qwen3.5-9B; el repo incluye grafos de ~13,8 GB en float16) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | hasta 4.096 tokens (grafos para 256, 512, 1.024, 2.048 y 4.096 tokens) |
| Tipos de cuantizacion | float16 en pesos (sufijo `fp16fc`); ejecución a float32 en Metal; tablas de embeddings en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (LiteRT) y safetensors (tablas de embeddings y cabeza) |

## Arquitectura y entrenamiento

El modelo base `Cloudflare/clef-flash` es un modelo de decisión post-entrenado sobre `Qwen/Qwen3.5-9B`. En lugar de generar texto, procesa una petición compuesta por un estado (texto, JSON, imagen o vídeo) y un conjunto de preguntas tipadas: `noul` (sí/no), `choice` (elección entre opciones nombradas) y `score` (valoración ordenada). Para cada pregunta devuelve la probabilidad de cada opción. Una cabeza conjunta lee los estados ocultos finales de toda la petición y puntúa simultáneamente todas las opciones de todas las preguntas. La forma de petición y respuesta sigue `systemone()`, un esquema compatible con SystemOne.

La conversión a LiteRT separa el cómputo en varias piezas: cinco grafos de fila que reciben los embeddings de los tokens de la petición y las tablas rotatorias, y devuelven los estados ocultos tras la normalización final en cada posición; dos torres de visión que convierten una imagen leída en un tile cuadrado de 256 px o 448 px en 64 o 196 filas de embeddings visuales; y un host en Python que construye los tokens, escribe los embeddings, calcula las posiciones, selecciona el grafo adecuado y ejecuta la cabeza conjunta. No hay decodificación: cada petición es un único prefill. Los pesos de las torres de visión están en float16, lo que introduce una diferencia máxima de 1,65e-3 respecto a la referencia en CPU float32 cuando hay imagen.

## Capacidades

- Clasificación y decisión estructurada: responde preguntas de tipo sí/no (`noul`), elección entre opciones (`choice`) y valoración ordenada (`score`) devolviendo probabilidades por opción.
- Procesamiento de estados multimodales: acepta texto, valores JSON, imágenes y vídeo como estado de entrada.
- Visión: dos torres visuales con tiles de 256 px (64 tokens de imagen) y 448 px (196 tokens de imagen).
- Contexto largo: grafos dedicados para peticiones de hasta 4.096 tokens.
- Salida con probabilidades calibradas por opción y recuento de tokens de entrada (`usage`).
- No genera texto libre: la salida es siempre una respuesta tipada estructurada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Moderación y clasificación de contenido: el modelo puede recibir un texto como estado y una batería de preguntas `noul` y `choice` para determinar categorías de riesgo, con probabilidades por categoría en lugar de una etiqueta única, lo que facilita umbrales ajustables.
- Validación de respuestas estructuradas: dado un JSON de estado y preguntas sobre campos concretos, el modelo devuelve la probabilidad de cada opción, útil para verificar consistencia de datos extraídos en pipelines.
- Inspección visual automatizada: con la torre de 448 px puede responder preguntas sobre una imagen (por ejemplo, leer la hora de un reloj o identificar un objeto) devolviendo opciones con confianza, adecuado para control de calidad visual.
- Enrutamiento de decisiones en backend: al no generar texto y devolver solo probabilidades, encaja en servicios que necesitan una decisión tipada de baja ambigüedad con contexto de hasta 4.096 tokens.
- Evaluación de claridad y confianza: la pregunta de tipo `score` permite obtener una valoración ordenada (por ejemplo, "poco claro / bastante claro / muy claro") junto con la distribución de probabilidad, útil para sistemas que necesitan saber cuándo derivar a revisión humana.
- Análisis de documentos con contexto largo: usando el grafo de 4.096 tokens, se puede introducir un documento extenso como estado y formular varias preguntas de clasificación en una sola petición, reduciendo el número de llamadas.
- Prototipado en escritorio con Metal: el host de Python y la app de ejemplo para Mac permiten probar el modelo localmente sobre texto, JSON, fotos y preguntas sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí aporta mediciones de latencia y fidelidad en un Apple M4 Max con Metal a float32:

| Medicion | Valor |
|---|---|
| Petición de decisión de 236 tokens | mediana 360,7 ms |
| Petición de decisión de 1.007 tokens | mediana 1.346,9 ms |
| Prefill del grafo de 1.024 tokens | mediana 1.308,5 ms |
| Coincidencia con la opción más probable de la referencia | 545 de 545 preguntas no cercanas a empate y 5 de 5 cercanas, en 243 ejecuciones |
| Diferencia máxima de probabilidad (texto) | 1,08e-5 |
| Diferencia máxima de probabilidad (con imagen) | 1,65e-3 |

## Requisitos de hardware

- VRAM estimada: cada grafo de fila contiene unos 13,8 GB de pesos en float16; se necesita memoria suficiente para el grafo seleccionado más las tablas (embedding de tokens de ~2,03 GB y cabeza de salida de ~2,03 GB) y las torres de visión (~0,9 GB cada una).
- GPU recomendadas: no se han medido GPUs en Linux o Windows según la model card; las mediciones disponibles son en Apple M4 Max con Metal.
- ¿Cabe en GPU de consumo? El modelo no está pensado para móviles: un grafo de fila supera la memoria de un teléfono de 12 GB. En escritorio requiere al menos ~14 GB solo para el grafo, por lo que no cabe en GPUs de consumo de gama media con 8-12 GB.
- Opciones de despliegue: LiteRT con la API CompiledModel de ai-edge-litert 2.2.0, host de Python incluido en el repositorio y app de ejemplo para Mac. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 360,7 ms para 236 tokens y 1.346,9 ms para 1.007 tokens en M4 Max con Metal a float32; el modelo no decodifica, cada petición es un prefill.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| clef-flash-LiteRT (esta ficha) | no disponible (base Qwen3.5-9B; grafos de ~13,8 GB fp16) | 4.096 tokens | Modelo de decisión multimodal, formato LiteRT | Apache 2.0 | Hugging Face |
| Cloudflare/clef-flash | no disponible (base Qwen3.5-9B) | no disponible | Modelo de decisión multimodal (original) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-9B | 9B (aproximado por el nombre) | no disponible | LLM generativo | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo no genera texto: cualquier caso de uso que requiera generación libre queda fuera de su alcance.
- Solo se ha medido en un escritorio Apple M4 Max con Metal; no hay mediciones en GPUs Linux o Windows ni en teléfonos.
- No está pensado para móviles: un grafo de fila ocupa unos 13,8 GB en float16, por encima de la memoria de un teléfono de 12 GB.
- La torre de visión usa pesos float16, lo que introduce diferencias de hasta 1,65e-3 en las probabilidades respecto a la referencia en float32.
- Idiomas soportados no disponibles: no se puede garantizar cobertura multilingüe.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las probabilidades pueden ser poco informativas en preguntas ambiguas o cercanas a empate.
- Sesgos conocidos: no disponible en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-9B y del modelo original de Cloudflare.
- El repositorio ocupa 75,5 GB, lo que exige espacio de almacenamiento considerable para su descarga y despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/clef-flash-LiteRT
- Modelo base original: https://huggingface.co/Cloudflare/clef-flash
- Modelo Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Blog de Cloudflare sobre modelos de decisión: https://blog.cloudflare.com/clef-decision-models
- App de ejemplo para Mac: https://github.com/john-rocky/LiteRT-Models/tree/main/clef-flash
