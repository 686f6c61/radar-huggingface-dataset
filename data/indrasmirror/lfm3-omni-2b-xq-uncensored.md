# IndrasMirror/LFM3-Omni-2B-XQ-Uncensored

## Resumen

LFM3-Omni-2B-XQ-Uncensored es una versión modificada y cuantizada del modelo multimodal LiquidAI/LFM3-Omni-2B, desarrollada por IndrasMirror. El modelo original, creado por Liquid AI, es un modelo "any-to-any" que acepta texto, imágenes, vídeo y audio como entrada, y produce texto y voz como salida. Esta variante concreta aplica una edición de dirección de rechazo (abliteration) sobre los pesos en precisión completa y posteriormente los cuantiza mediante el pipeline propietario XQ de precisión mixta, ofreciendo cinco tamaños de cuantización.

El modelo base cuenta con 1.728.801.600 parámetros totales (aproximadamente 1,7 mil millones), lo que lo sitúa en la categoría de modelos pequeños optimizados para despliegue en hardware de consumo. La versión publicada aquí está pensada para ejecutarse con llama.cpp y ofrece un equilibrio entre calidad y tamaño: el archivo recomendado XQ-6.0 ocupa 1,29 GiB y alcanza 432 tok/s en una RTX 4090.

La relevancia de esta ficha radica en dos aspectos: por un lado, demuestra el estado del arte en cuantización mixta aplicada a modelos multimodales pequeños; por otro, ilustra las implicaciones técnicas y éticas de las modificaciones de tipo abliteration, que reducen drásticamente las tasas de rechazo del modelo original (del 92% al 10% en prompts dañinos según las mediciones del autor).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base LFM3-Omni-2B de Liquid AI; arquitectura exacta no especificada en la información proporcionada) |
| Parámetros totales | 1.728.801.600 |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (según configuración de llama-server en la model card) |
| Tipos de cuantización | XQ-6.0, XQ-5.0, XQ-4.5, XQ-4.0, XQ-3.5 (precisión mixta: IQ3_S, IQ4_XS, IQ4_NL, Q3_K a Q6_K, Q8_0, BF16) y Q8_0 estándar |
| Idiomas soportados | Inglés (en) |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base LFM3-Omni-2B es un modelo multimodal de Liquid AI que procesa texto, imágenes, vídeo y audio como entrada, y genera texto y voz como salida. La información proporcionada no detalla la arquitectura interna del transformer subyacente (número de capas, dimensión oculta, mecanismo de atención), por lo que estos datos deben consultarse en la model card original de LiquidAI/LFM3-Omni-2B.

Sobre el proceso de modificación: el autor aplicó primero una edición de dirección de rechazo de rango 2 (abliteration) sobre los pesos en BF16 del checkpoint original, ajustada sobre el modelo de Liquid AI. Esta edición se validó sobre 100 prompts dañinos y 100 prompts inocuos no vistos durante el ajuste, reduciendo la tasa de rechazo en prompts dañinos del 92% al 10%, y en prompts inocuos del 5% al 2%. Posteriormente, cada tensor se cuantizó individualmente con el pipeline XQ, que asigna un formato distinto (IQ3_S, IQ4_XS, IQ4_NL, Q3_K a Q6_K, Q8_0, BF16) según la sensibilidad medida sobre un conjunto de calibración de código, agentes, OCR y contexto largo, para un presupuesto dado de bits por peso. El proyector multimodal (mmproj) es el archivo oficial de Liquid AI, sin modificar.

Cabe destacar que LFM3 es un modelo sin razonamiento explícito (non-reasoning): su plantilla de chat abre cada respuesta con un bloque `<think></think>` vacío.

## Capacidades

- Generación de texto conversacional en inglés.
- Procesamiento de imágenes como entrada (descripción de formas, colores, contenido).
- Procesamiento de vídeo como entrada, incluyendo su pista de audio.
- Procesamiento de audio y voz como entrada (transcripción de voz a texto).
- Generación de voz como salida (text-to-speech) a través de los endpoints `/tts` y `/v1/realtime` de llama.cpp.
- Soporte de tool calling / function calling (verificado en la prueba de humo del autor).
- Capacidades multimodales "any-to-any" (texto, imagen, vídeo, audio de entrada; texto y voz de salida).
- No dispone de modo de razonamiento explícito (non-reasoning).
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- **Atención al cliente multimodal**: el modelo puede recibir capturas de pantalla, imágenes de productos o clips de audio de clientes y responder en texto o voz, aprovechando su ventana de 32K tokens para mantener conversaciones multi-turno con contexto extenso.
- **Transcripción y respuesta por voz en asistentes locales**: gracias a la entrada de audio y la salida TTS vía `/tts` y `/v1/realtime`, puede integrarse en asistentes de voz que funcionan íntegramente en local con llama.cpp, sin depender de servicios en la nube.
- **Descripción automática de imágenes y vídeo para accesibilidad**: el modelo puede generar descripciones de contenido visual (formas, colores, texto en imagen) para sistemas de accesibilidad o indexación de archivos multimedia.
- **Pipelines de OCR y procesamiento de documentos**: con el proyector oficial y la cuantización XQ-6.0, puede extraer y describir contenido de imágenes de documentos, integrándose en flujos de digitalización y extracción de datos.
- **Agentes con tool calling en local**: su soporte de function calling verificado permite construir agentes que invoquen herramientas externas (APIs, bases de datos) en entornos con recursos limitados, ejecutándose en una sola GPU de consumo.
- **Prototipado rápido de aplicaciones multimodales**: con solo 1,29 GiB para XQ-6.0, es adecuado para desarrolladores que necesitan iterar sobre aplicaciones any-to-any en portátiles o GPUs pequeñas sin infraestructura dedicada.
- **Investigación sobre alineación y abliteration**: al ser una versión abliterated con métricas de rechazo publicadas, sirve como caso de estudio para investigar los efectos de la edición de dirección de rechazo en modelos multimodales pequeños.

## Benchmarks y rendimiento

El autor publica métricas de calidad de cuantización (perplejidad y divergencia KL) medidas con `llama-perplexity --kl-divergence` de llama.cpp (f3586e6), comparando cada archivo XQ contra el Q8_0 abliterated (perplejidad 6,379) sobre un conjunto de texto reservado de ~256 KB.

| Archivo | Tamaño | Perplejidad | KL (menor es mejor) | KL percentil 99 | Mismo top-1 |
|---|---|---|---|---|---|
| XQ-6.0 | 1,29 GiB | 6,466 | 0,0207 | 0,225 | 95,29% |
| XQ-5.0 | 1,11 GiB | 6,442 | 0,0428 | No disponible | 93,18% |
| XQ-4.5 | 1,03 GiB | 6,447 | 0,0543 | No disponible | 92,32% |
| XQ-4.0 | 967 MiB | 6,549 | 0,0773 | No disponible | 90,97% |
| XQ-3.5 | 879 MiB | 6,828 | 0,1311 | No disponible | 88,31% |
| Q4_K_M oficial (no abliterated) | 1,02 GiB | 6,346 | 0,0822 | No disponible | 91,17% |
| Q8_0 oficial (no abliterated) | 1,71 GiB | 6,464 | 0,0059 | 0,068 | 97,44% |

Métricas de velocidad (`llama-bench` tg128, RTX 4090 24 GB, Ryzen 7 5700X, Linux, todas las capas en GPU):

| Archivo | tg128 (tok/s) |
|---|---|
| XQ-3.5 | 514 |
| XQ-4.0 | 501 |
| XQ-4.5 | 481 |
| XQ-5.0 | 466 |
| XQ-6.0 | 432 |
| Q4_K_M oficial | 497 |
| Q8_0 oficial | 355 |

En servicio (llama-server, XQ-6.0 + proyector, contexto 32K): 3,5 GB de VRAM, 389 tok/s de decodificación en GPU, 23 tok/s en CPU con 8 hilos.

Prueba de humo multimodal y de herramientas (XQ-6.0 + proyector Q8_0, llama-server, contexto 32K): tool call correcto, imagen descrita correctamente (formas, colores y número) y clip de voz transcrito exactamente. La salida de voz no se ha medido en estos archivos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: 3,5 GB en servicio con XQ-6.0 + proyector y contexto de 32K (medido por el autor).
- **GPU recomendadas**: RTX 4090 24 GB (mediciones publicadas); cualquier GPU con al menos ~4 GB de VRAM debería poder ejecutar XQ-6.0 con el proyector.
- **Cabe en GPU de consumo**: sí; XQ-3.5 (879 MiB) está pensado para teléfonos y GPUs pequeñas, y el resto de variantes caben en GPUs de consumo de gama media.
- **Opciones de despliegue**: llama.cpp (llama-server) con soporte LFM3 (upstream desde 31 de octubre de 2026, f3586e6 o posterior); soporte nativo en Xolotl en desarrollo. No se mencionan vLLM, TGI ni Ollama.
- **Latencia y throughput**: 432 tok/s (XQ-6.0, tg128, RTX 4090); 389 tok/s en servicio con GPU; 23 tok/s en CPU con 8 hilos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-Omni-2B-XQ-Uncensored (XQ-6.0) | 1,73 B | 32K | Texto, imagen, vídeo, audio → texto y voz | LFM Open License v1.0 | GGUF |
| LiquidAI/LFM3-Omni-2B (original, Q8_0) | 1,73 B | No disponible | Texto, imagen, vídeo, audio → texto y voz | LFM Open License v1.0 | GGUF / safetensors |
| LiquidAI/LFM3-Omni-2B (original, Q4_K_M) | 1,73 B | No disponible | Texto, imagen, vídeo, audio → texto y voz | LFM Open License v1.0 | GGUF |

La información proporcionada no incluye datos de benchmarks comparativos frente a otros modelos de la misma categoría (por ejemplo, otros modelos multimodales pequeños como Qwen2-VL-2B o Gemma 3n), por lo que no es posible establecer una comparación de rendimiento más allá de las variantes del propio modelo base.

## Limitaciones y advertencias

- **Modelo abliterated**: la edición de dirección de rechazo elimina gran parte de las salvaguardas del modelo original; la tasa de rechazo en prompts dañinos cae del 92% al 10%. Esto implica un riesgo elevado de generar contenido dañino, sesgado o inapropiado, y no es adecuado para despliegues en producción sin filtros adicionales.
- **Riesgo de alucinación**: como todo modelo de lenguaje, puede generar información incorrecta, especialmente en tareas de OCR, descripción de imágenes o transcripción de audio con contenido ambiguo.
- **Idioma**: soporte limitado al inglés según la model card; el rendimiento en castellano no está documentado.
- **Salida de voz no verificada**: el autor indica que la salida de voz (speech output) no se ha medido en estos archivos; solo se ha verificado la transcripción de voz a texto.
- **Licencia restrictiva**: LFM Open License v1.0 permite uso comercial solo por debajo del umbral de ingresos de Liquid AI; es necesario leer la licencia completa antes de cualquier uso comercial. Los archivos son versiones modificadas del modelo original y deben conservar la atribución correspondiente.
- **Contexto**: la ventana de 32K tokens es la configuración usada en las pruebas; no se especifica si el modelo soporta contextos mayores.
- **Cuantización propietaria**: el pipeline XQ es privado; aunque los archivos son GGUF estándar y no requieren un cargador especial, no es posible reproducir la cuantización con las herramientas públicas.
- **Dependencia de llama.cpp reciente**: requiere una versión de llama.cpp con soporte LFM3 (f3586e6 o posterior); versiones anteriores no cargarán el modelo correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IndrasMirror/LFM3-Omni-2B-XQ-Uncensored
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Repositorio Xolotl: https://github.com/Indras-Mirror/Xolotl
- Licencia LFM Open License v1.0: https://huggingface.co/IndrasMirror/LFM3-Omni-2B-XQ-Uncensored/blob/main/LICENSE
- Apoyo al autor: https://ko-fi.com/indrasmirror
- llama.cpp: no se proporciona enlace directo en la información disponible; el autor referencia el README del servidor de llama.cpp para los endpoints `/tts` y `/v1/realtime`.
