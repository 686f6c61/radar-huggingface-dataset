# moonbox-dev/gemma-4-12B-it-GGUF

## Resumen

Gemma 4 12B es un modelo multimodal desarrollado por Google que acepta texto, imágenes y audio en un único decodificador, sin torre de codificador separada. Esta ficha describe la versión cuantizada en GGUF publicada por moonbox-dev, pensada para ejecución local con llama.cpp en Metal, CUDA, Vulkan y CPU. El modelo base es `google/gemma-4-12B-it`, una variante instruida (chat) de la familia Gemma 4, publicada bajo licencia Apache 2.0.

El repositorio contiene una única representación por precisión (F16, BF16, Q8_0, Q6_K, Q5_K_M y Q4_K_M) más un archivo `mmproj` que aloja las capas de entrada de imagen y audio necesarias para prompts multimodales. El modelo cuenta con 11.907.350.576 parámetros totales según los pesos en safetensors del checkpoint original, lo que lo sitúa en la gama de 12B densos. La longitud de contexto no se especifica en la información disponible.

La relevancia de esta publicación radica en que ofrece cuantizaciones verificadas byte a byte contra el checkpoint original, con métricas de divergencia KL y coincidencia de token superior medibles, lo que permite a desarrolladores elegir precisión en función de la memoria disponible con un criterio cuantitativo en lugar de heurístico. El modelo incorpora modo de razonamiento (thinking) que llama-server expone como `reasoning_content`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con decodificador único (texto, imagen y audio sin torre de codificador separada) |
| Parámetros totales | 11.907.350.576 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | no disponible (los prompts de evaluación incluyen inglés y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el checkpoint original) |

## Arquitectura y entrenamiento

Gemma 4 12B emplea un decodificador único que procesa texto, imágenes y audio de forma nativa, sin una torre de codificador independiente. El archivo principal GGUF contiene el decodificador completo; el archivo `mmproj-gemma-4-12b-F16.gguf` (122 MB) aloja las capas de entrada de imagen y audio que llama.cpp necesita para prompts multimodales y es compartido por todas las precisiones. El modelo base es una variante instruida, por lo que se espera un ajuste posterior al preentrenamiento orientado a conversación, aunque la información disponible no detalla la composición del dataset, el número de tokens de entrenamiento ni si se emplearon RLHF o DPO.

Las cuantizaciones se generaron con llama.cpp `b12621`: `convert_hf_to_gguf.py` produjo el archivo BF16 y el `mmproj`, y `llama-quantize` generó el resto de precisiones con sus mezclas estándar, sin matriz de importancia. Antes de la subida se verificó que cada tensor del checkpoint original aparece con los mismos valores en el archivo BF16 y en el `mmproj`; cuatro tensores de entrada de imagen se reordenaron al orden de píxeles de llama.cpp y el resto son idénticos byte a byte. El modelo incorpora razonamiento previo a la respuesta, que llama-server devuelve como `reasoning_content`.

## Capacidades

- Generación de texto conversacional con plantilla de chat propia.
- Comprensión de imágenes (pipeline `image-text-to-text`), con entrada vía `image_url` en `/v1/chat/completions`.
- Comprensión de audio, con entrada vía `input_audio`.
- Razonamiento explícito antes de responder (modo thinking expuesto como `reasoning_content`).
- Procesamiento multimodal en un único decodificador, sin codificadores separados por modalidad.
- Compatibilidad con endpoints de chat de llama-server (`/v1/chat/completions`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los prompts de evaluación incluyen 8 en inglés y 4 en chino.

## Casos de uso

- Asistente conversacional local con razonamiento: el modelo genera un bloque de pensamiento antes de la respuesta, recuperable como `reasoning_content`, lo que permite auditar el razonamiento en aplicaciones de asistencia técnica sin depender de servicios en la nube.
- Análisis de documentos con imágenes: gracias a la entrada `image_url` y al archivo `mmproj`, se pueden enviar capturas, diagramas o páginas escaneadas junto con preguntas en texto en un mismo turno de chat.
- Transcripción y análisis de audio: la entrada `input_audio` permite procesar notas de voz o grabaciones cortas directamente en llama-server, útil para resúmenes de reuniones en local.
- Despliegue en portátiles y estaciones de trabajo sin GPU dedicada: las cuantizaciones Q4_K_M (7,38 GB) y Q5_K_M (8,55 GB) caben en equipos con 16 GB de RAM, y la compilación de llama.cpp soporta CPU y Vulkan.
- Prototipado e investigación de cuantización: las métricas publicadas (error RMS de pesos, KL de chat y coincidencia de token superior frente a Q8_0) permiten reproducir y comparar metodologías de cuantización con un criterio medible.
- Evaluación de modelos multimodales en local: al estar todo el pipeline en GGUF y llama.cpp, se puede integrar en bancos de pruebas offline sin dependencias de API, útil para entornos con requisitos de privacidad.
- Integración en aplicaciones de escritorio y edge: el formato GGUF y la compatibilidad con Metal, CUDA, Vulkan y CPU facilitan empaquetar el modelo en herramientas de escritorio que necesiten visión y audio sin conexión.

## Benchmarks y rendimiento

La model card no publica resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Sí incluye métricas de fidelidad de cuantización frente al archivo BF16 y frente a Q8_0 en una evaluación propia de Moonbox (12 prompts cortos, 8 en inglés y 4 en chino, generación greedy de 64 tokens):

| Precisión | Tamaño | Error RMS de pesos vs BF16 | KL de chat vs Q8_0 | Mismo token superior | Estado |
|---|---|---|---|---|---|
| F16 | 23,83 GB | 0,000 % | no disponible | no disponible | pesos iguales a BF16 |
| BF16 | 23,83 GB | referencia (677 tensores verificados) | no disponible | no disponible | original |
| Q8_0 | 12,67 GB | 0,56 % | referencia | referencia | válido |
| Q6_K | 9,79 GB | 1,84 % | 0,0046 | 98,0 % | válido |
| Q5_K_M | 8,55 GB | 3,32 % | 0,0116 | 97,4 % | experimental |
| Q4_K_M | 7,38 GB | 6,15 % | 0,0445 | 93,6 % | experimental |

El criterio de aprobación del laboratorio es KL ≤ 0,01 nats y coincidencia de token superior ≥ 90 %; los archivos que no lo cumplen se marcan como experimentales. La model card señala que la prueba habitual de llama.cpp (KL sobre WikiText-2 sin formato de chat) no es adecuada para un modelo conversacional: Gemma 4 obtiene perplejidad 565 en ese conjunto y entra en su formato de chat, lo que infla las diferencias (Q5_K_M frente a Q8_0 daría 0,74 nats).

## Requisitos de hardware

- VRAM/RAM estimada para inferencia según el tamaño de archivo: F16/BF16 ≈ 23,83 GB; Q8_0 ≈ 12,67 GB; Q6_K ≈ 9,79 GB; Q5_K_M ≈ 8,55 GB; Q4_K_M ≈ 7,38 GB. Añadir el `mmproj` (122 MB) y el espacio de contexto.
- El archivo BF16 (24 GB) no se pudo ejecutar en el portátil de 32 GB usado para las pruebas, según la model card.
- GPU recomendadas: no disponible de forma explícita; la model card cita soporte de Metal, CUDA y Vulkan, por lo que se pueden usar GPUs de Apple Silicon, NVIDIA y AMD compatibles con llama.cpp.
- Cabe en GPU de consumo: Q4_K_M (7,38 GB) y Q5_K_M (8,55 GB) caben en GPUs de 8-12 GB de VRAM; Q6_K (9,79 GB) y Q8_0 (12,67 GB) requieren 12-16 GB o descarga parcial a RAM.
- Opciones de despliegue: llama.cpp (`llama-server`) con `-ngl 99` y `--mmproj`; el formato GGUF es también compatible con otros runners basados en llama.cpp, aunque la model card solo documenta llama-server.
- Versión mínima de llama.cpp: `b12621` o superior.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo base ni de alternativas en la información proporcionada, por lo que la comparación se limita a características estructurales.

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma 4 12B IT (este GGUF) | 11.907.350.576 | no disponible | texto, imagen, audio | Apache 2.0 | GGUF |
| Gemma 4 12B IT (original) | 11.907.350.576 | no disponible | texto, imagen, audio | Apache 2.0 | safetensors |
| Alternativas de ~12B densos | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las cuantizaciones Q5_K_M y Q4_K_M están marcadas como experimentales: superan el umbral de KL ≤ 0,01 nats (0,0116 y 0,0445 respectivamente) y Q4_K_M baja al 93,6 % de coincidencia de token superior.
- No se usó matriz de importancia en la cuantización, lo que puede penalizar la calidad de las precisiones bajas frente a métodos con imatrix.
- La evaluación de cuantización se basa en solo 12 prompts cortos (8 en inglés, 4 en chino) y 64 tokens generados; no es representativa de todas las tareas.
- La model card no documenta sesgos conocidos ni tasas de alucinación; al ser un modelo instruido de 12B, es esperable el riesgo habitual de alucinación en dominios especializados.
- Idiomas soportados no disponibles: no se puede confirmar el rendimiento en castellano ni en otras lenguas distintas del inglés y el chino evaluados.
- Longitud de contexto no disponible: planificar el despliegue sin asumir una ventana concreta.
- El archivo BF16 no se pudo ejecutar en el hardware de prueba (32 GB), por lo que no hay validación de calidad en precisión completa más allá de la igualdad de pesos.
- Licencia Apache 2.0: permite uso comercial, pero los archivos son derivados del modelo original y heredan su licencia, que gobierna su uso.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria adicional.

## Enlaces

- Repositorio GGUF: https://huggingface.co/moonbox-dev/gemma-4-12B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Colección Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Documentación: https://ai.google.dev/gemma/docs/core
- Informe técnico: https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Archivos individuales: `gemma-4-12b-F16.gguf`, `gemma-4-12b-BF16.gguf`, `gemma-4-12b-Q8_0.gguf`, `gemma-4-12b-Q6_K.gguf`, `gemma-4-12b-Q5_K_M.gguf`, `gemma-4-12b-Q4_K_M.gguf` y `mmproj-gemma-4-12b-F16.gguf`, todos bajo https://huggingface.co/moonbox-dev/gemma-4-12B-it-GGUF/blob/main/
