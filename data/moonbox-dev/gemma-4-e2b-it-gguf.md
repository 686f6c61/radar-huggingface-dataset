# moonbox-dev/gemma-4-E2B-it-GGUF

## Resumen

Gemma 4 E2B es un modelo multimodal de la familia Gemma desarrollada por Google DeepMind, publicado en pesos abiertos bajo licencia Apache 2.0. Este repositorio concreto, `moonbox-dev/gemma-4-E2B-it-GGUF`, no contiene el modelo original sino conversiones a formato GGUF realizadas por Moonbox para su uso con llama.cpp en hardware de consumo (Metal, CUDA, Vulkan y CPU). El modelo base es la variante instruction-tuned `google/gemma-4-E2B-it`, con 4.647.450.147 parámetros totales según los safetensors del checkpoint original.

La característica diferencial de la variante E2B dentro de Gemma 4 es su naturaleza any-to-any: acepta texto, imagen y audio como entrada y genera texto como salida. El repositorio separa el decodificador (un fichero GGUF por precisión) de los codificadores de visión y audio (un único `mmproj-*.gguf` compartido entre todas las precisiones), lo que permite desplegar solo el decodificador cuando no se necesita entrada multimodal. Esto reduce el consumo de memoria en escenarios de solo texto.

El interés práctico de esta ficha reside en que ofrece una ruta de despliegue local verificada: el autor documenta hashes SHA-256 por fichero, una comparación tensor a tensor contra el checkpoint original (1998 de 2011 tensores idénticos byte a byte) y una evaluación de degradación por cuantización basada en divergencia KL frente al fichero BF16. Es, por tanto, una opción relevante para quien necesite inferencia multimodal en una GPU de consumo sin renunciar a garantías de fidelidad numérica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (decodificador de texto + codificadores de visión y audio); detalles internos no disponibles en la información proporcionada |
| Parametros totales | 4.647.450.147 (4,6B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la model card original se trunca en "up to") |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M (experimental), Q4_K_M (experimental); mmproj en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); checkpoint original en safetensors |

## Arquitectura y entrenamiento

La información disponible confirma que Gemma 4 E2B es un modelo multimodal con entrada de texto, imagen y audio y salida de texto. El repositorio GGUF separa explícitamente dos componentes: el decodificador, que incluye una tabla de embeddings por capa (*per-layer embedding table*, 2,3B valores, aproximadamente la mitad de los parámetros totales), y el fichero `mmproj`, que contiene los codificadores de visión y audio junto con sus proyecciones. El decodificador incorpora además un modo de razonamiento previo a la respuesta, expuesto por `llama-server` en el campo `reasoning_content`.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; la model card incluida se interrumpe antes de detallar estos aspectos. Tampoco se documentan innovaciones de atención o decodificación más allá del modo de razonamiento mencionado.

Respecto al proceso de cuantización, sí hay información técnica detallada: las conversiones se generaron con llama.cpp `b12621` a partir de la revisión `4adf15748d` del modelo original. Q6_K, Q5_K_M y Q4_K_M se cuantizaron con importance matrix calculada sobre 200 × 512 tokens de WikiText-2 train usando el fichero Q8_0. Una particularidad relevante: en Q5_K_M y Q4_K_M, llama.cpp mantiene ambas tablas de embeddings a 6 bits, de modo que 3,0B de los 4,6B de parámetros permanecen a 6 bits y solo 1,6B se reducen a 5 o 4 bits, lo que explica que esos ficheros no sean mucho más pequeños que Q6_K.

## Capacidades

- Generación de texto conversacional con plantilla de chat propia y soporte de turnos multi-turno.
- Entrada de imagen: descripción de escenas, reconocimiento de objetos (validado en el smoke test con una foto de escritorio).
- Entrada de audio: transcripción de voz (validado con un clip de LibriSpeech, WER del 7,1 % en Q4_K_M).
- Modo de razonamiento: el modelo puede "pensar" antes de responder; llama-server devuelve ese contenido como `reasoning_content`.
- Procesamiento any-to-any: combinación de texto, imagen y audio en la misma petición mediante las partes `image_url` e `input_audio` de la API compatible con OpenAI.
- Despliegue vía API compatible con `/v1/chat/completions`.
- Capacidades de tool calling, function calling, agentes y multilingüismo: no disponibles en la información proporcionada.

## Casos de uso

- Asistente local de escritorio con entrada de voz: el modelo transcribe audio y responde en texto dentro de la misma sesión, usando `input_audio` en la API de llama-server. Adecuado para dictado y consultas habladas sin enviar audio a la nube.
- Descripción y análisis de imágenes en local: con el fichero `mmproj` cargado, se puede enviar una imagen vía `image_url` para generar descripciones o responder preguntas sobre su contenido, útil en herramientas de accesibilidad o catalogación de fotos.
- Prototipado de asistentes multimodales en GPU de consumo: al caber en una RTX 3080 Laptop según la propia metodología de evaluación del autor, sirve para iterar sobre prompts y plantillas de chat sin infraestructura dedicada.
- Evaluación de cuantizaciones en pipelines propios: el repositorio incluye métricas de divergencia KL y coincidencia de token frente a BF16, lo que permite elegir precisión con criterio medido en lugar de estimado.
- Procesamiento de documentos con imagen y texto combinados: extracción de información de capturas o fotos acompañadas de instrucciones textuales en una sola llamada.
- Despliegue en entornos sin GPU: al ofrecer builds para CPU, Vulkan y Metal, es viable en portátiles y estaciones de trabajo sin CUDA, aceptando mayor latencia.
- Transcripción asistida con contexto: combinación de audio y texto de referencia para corregir transcripciones en dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica una evaluación propia de fidelidad de cuantización:

| Fichero | Tamaño | KL vs BF16 (nats) | Coincidencia top-1 | Veredicto |
|---|---|---|---|---|
| BF16 | 9,31 GB | referencia | referencia | referencia |
| F16 | no disponible | dentro del umbral | >= 90 % | pasa |
| Q8_0 | no disponible | dentro del umbral | >= 90 % | pasa |
| Q6_K | no disponible | dentro del umbral | >= 90 % | pasa |
| Q5_K_M | no disponible | 0,011 | no disponible | experimental (umbral KL <= 0,01) |
| Q4_K_M | no disponible | 0,051 | no disponible | experimental |
| mmproj F16 | 985,7 MB | — | — | codificador compartido |

Metodología: 12 prompts cortos (8 en inglés, 4 en chino) en la plantilla de chat del modelo; referencia generada con BF16 de forma greedy hasta 64 tokens (768 en total); el resto de ficheros evaluados con teacher forcing sobre esos tokens en `llama-server` con CUDA sobre una RTX 3080 Laptop. La divergencia KL se calcula sobre el top-64 de la distribución del siguiente token.

Smoke test con Q4_K_M más mmproj: una pregunta factual respondida correctamente, un clip de LibriSpeech transcrito con WER del 7,1 % y una foto de escritorio descrita correctamente (auriculares, ratón Dell, teclado y cables sobre mesa de madera).

## Requisitos de hardware

- VRAM estimada: aproximadamente 9,3 GB para BF16; el fichero Q6_K es la opción recomendada para calidad casi idéntica, y el repositorio completo ocupa 10,3 GB. Los ficheros Q5_K_M y Q4_K_M no reducen mucho el tamaño por la retención de las tablas de embeddings a 6 bits.
- Para entrada multimodal hay que sumar los 985,7 MB del fichero `mmproj` F16.
- GPU validadas por el autor: RTX 3080 Laptop (evaluación de cuantización con CUDA). No se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo con al menos 10-12 GB de VRAM para el decodificador en Q6_K más el proyector; en configuraciones de 8 GB habría que recurrir a Q4_K_M y aceptar la degradación documentada (KL 0,051).
- Opciones de despliegue: llama.cpp (`llama-server`) con backend Metal, CUDA, Vulkan o CPU; requiere build `b12621` o posterior. El modelo se sirve por API compatible con OpenAI en `/v1/chat/completions`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma 4 E2B (este repo, GGUF) | 4,6B | no disponible | texto, imagen, audio | Apache 2.0 | GGUF |
| Gemma 4 E2B (original, safetensors) | 4,6B | no disponible | texto, imagen, audio | Apache 2.0 | safetensors |
| Gemma 4 E4B | no disponible | no disponible | texto, imagen, audio | Apache 2.0 | no disponible |
| Gemma 4 12B | no disponible | no disponible | texto, imagen, audio | Apache 2.0 | no disponible |

La información proporcionada solo permite confirmar la existencia de las variantes E2B, E4B y 12B dentro de la familia Gemma 4, con soporte de audio en las tres. No hay datos de parámetros, contexto ni rendimiento de las variantes mayores, ni de modelos de otras familias comparables.

## Limitaciones y advertencias

- Las cuantizaciones Q5_K_M y Q4_K_M están marcadas como experimentales por el propio autor: KL de 0,011 y 0,051 respectivamente, por encima del umbral de 0,01 nats. No se recomiendan para producción sin validación propia.
- La evaluación de cuantización se hizo con solo 12 prompts cortos en inglés y chino; es una muestra reducida y no cubre tareas de razonamiento largo, código ni visión/audio.
- El smoke test multimodal es anecdótico (una transcripción con WER del 7,1 % y una única imagen descrita); no constituye una evaluación sistemática.
- La model card original está truncada en la información disponible, por lo que se desconocen la longitud de contexto, los idiomas soportados, la composición del entrenamiento y los sesgos documentados por Google.
- No hay información sobre riesgo de alucinación específica, sesgos conocidos ni evaluaciones de seguridad del modelo base.
- La licencia Apache 2.0 se aplica a estos ficheros derivados; el autor remite al texto de licencia de Gemma 4 enlazado, que gobierna el uso. Conviene revisar ese documento antes de un despliegue comercial, ya que puede contener términos adicionales a la Apache 2.0 estándar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 26 de noviembre de 2026: no hay evidencia de uso en producción por terceros.
- La conversión requirió un script propio para la tabla de embeddings por capa (`convert_gemma4_lowmem.py`) por límites de memoria; es un detalle a tener en cuenta si se intenta reproducir la cuantización con el conversor estándar.

## Enlaces

- Repositorio GGUF: https://huggingface.co/moonbox-dev/gemma-4-E2B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Colección Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentación: https://ai.google.dev/gemma/docs/core
- Informe técnico: https://arxiv.org/abs/2607.02770
- Licencia: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de Gemma en Google DeepMind: https://deepmind.google/models/gemma/
- llama.cpp: https://github.com/ggml-org/llama.cpp
