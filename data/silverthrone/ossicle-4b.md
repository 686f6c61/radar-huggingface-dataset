# SILVERTHRONE/Ossicle-4B

## Resumen

Ossicle-4B es un modelo de audio-lenguaje desarrollado por SILVERTHRONE que responde preguntas sobre habla, sonido y música. Combina el codificador de audio Qwen3-Omni AuT (congelado, 0,65B de parámetros) con el modelo de lenguaje Qwen3.5-4B afinado mediante LoRA fusionado en los pesos, sumando 4.855.684.992 parámetros totales. El resultado es un sistema audio+texto a texto que cabe en una GPU de 16 GB de VRAM.

Su relevancia radica en dos aspectos: por un lado, alcanza 57 puntos en MMAU-Pro (56,93 exactos) mediante una cascada de dos pasadas, superando a MOSS-Audio-4B-Instruct (54,9) y a Kimi-Audio-7B (56,6) con solo unos 25 millones de tokens de entrenamiento. Por otro, implementa un modo de audio largo que permite procesar grabaciones de hasta 85 minutos en bf16 y 210 minutos en INT4 sobre una RTX 5060 Ti de 16 GB, mediante streaming en fragmentos de 64 segundos.

El modelo está publicado bajo licencia Apache 2.0, solo soporta inglés y se distribuye en formato safetensors con soporte para transformers, vLLM y cuantización NVFP4/INT4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio-lenguaje: codificador Qwen3-Omni AuT (frozen) + LM Qwen3.5-4B (LoRA fusionado); LM híbrido con 8 bloques de (3 Gated DeltaNet + 1 Gated Attention) |
| Parametros totales | 4.855.684.992 (codificador de audio 0,65B + LM 4,2B); 27M entrenados |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos (LM); audio: cualquier longitud, con modo de audio largo por streaming |
| Tipos de cuantizacion | bf16, INT4 (NVFP4, round-to-nearest, grupos de 128) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers, custom_code, vLLM) |

## Arquitectura y entrenamiento

Ossicle-4B sigue un diseño de dos torres: un codificador de audio Qwen3-Omni AuT congelado (hidden size 1.280, 32 capas, 12,5 tokens de audio por segundo) que proyecta las características log-mel al espacio del modelo de lenguaje, y un LM Qwen3.5-4B (hidden dimension 2.560, 32 capas, intermediate dimension 9.216, salida de 248.320 tokens con padding) afinado mediante LoRA cuyos pesos se han fusionado en el checkpoint final. El LM emplea una arquitectura híbrida con 8 bloques compuestos por 3 capas Gated DeltaNet y 1 capa Gated Attention, lo que reduce el coste de atención en secuencias largas.

El entrenamiento utilizó aproximadamente 25 millones de tokens según la model card. No se detalla la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica principal es el modo de audio largo: las grabaciones de más de 2 minutos se procesan en fragmentos de 64 segundos que se codifican, pasan por el LM y se liberan, de modo que la memoria solo crece con la caché de atención del LM (unos 2,5 GB por hora de audio). Las características log-mel son idénticas a las del procesamiento completo y la salida del codificador coincide hasta el redondeo bf16.

## Capacidades

- Comprensión de audio: responde preguntas sobre habla, sonido ambiental y música (pipeline audio-text-to-text).
- Entrada de audio flexible: mono o estéreo, cualquier frecuencia de muestreo, cualquier duración; varias clips por pregunta etiquetadas como "Audio 1:", "Audio 2:", etc.
- Modo de audio largo: streaming automático en fragmentos de 64 segundos para grabaciones de más de 2 minutos, sin necesidad de activación manual (`model.ask("long.wav", question)`).
- Modo chat: escucha el clip una vez y mantiene una conversación multi-turno sobre él (limitado a los primeros 4 minutos de cada grabación).
- Cascada de dos pasadas: Ossicle transcribe y describe el clip, y el Qwen3.5-4B base responde a partir de ese texto y de la propia respuesta de Ossicle (`ossicle/system.py` en GitHub).
- Capacidades de extracción de características (feature-extraction) además de generación.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso en la información disponible.
- Capacidades multilingües: solo inglés.

## Casos de uso

- Análisis de reuniones y llamadas: el modelo puede responder preguntas sobre el contenido de grabaciones largas (hasta 85 minutos en bf16 en 16 GB) usando el modo de audio largo, identificando cambios de hablante, tono o ambiente sin transcribir horas de audio.
- Moderación de contenido audiovisual: clasificación de clips de hasta 30 segundos (el rango de entrenamiento) para detectar sonidos, música o habla con contenido sensible, aprovechando la ventana de contexto de 262.144 tokens para procesar lotes grandes.
- Indexación y búsqueda de archivos de audio: extracción de características y descripciones semánticas de clips para construir índices de búsqueda sobre bibliotecas de podcasts, música o grabaciones ambientales.
- Asistentes de accesibilidad: descripción de sonidos y música para personas con discapacidad auditiva, con la cascada de dos pasadas para respuestas más precisas (57 frente a 52,0 en MMAU-Pro).
- Análisis musical: preguntas sobre género, instrumentación, tempo o estructura de fragmentos musicales (65,7 en la categoría Music de MMAU-Pro), adecuado para catalogación automática de bibliotecas musicales.
- Investigación en audio-lenguaje: modelo base de 4,9B con licencia Apache 2.0 y solo 27M parámetros entrenados, útil como punto de partida para fine-tuning en dominios específicos con recursos limitados.
- Despliegue en hardware de consumo: inferencia en una RTX 5060 Ti de 16 GB con cuantización INT4 (3,6 GB de pesos), lo que permite prototipado y demos locales sin infraestructura de datacenter.

## Benchmarks y rendimiento

| Benchmark | Ossicle-4B | MOSS-Audio-4B-Instruct | Kimi-Audio-7B | Qwen2.5-Omni-7B |
|---|---|---|---|---|
| MMAU test-mini | 71,8 | 75,8 | 72,4 | 65,6 |
| MMAU-Pro | 57† | 54,9* | 56,6 | 52,2 |

† Cascada de dos pasadas con los mismos pesos; la puntuación exacta es 56,93 y la pasada única obtiene 52,0. El estilo de prompt por categoría y el número de respuestas muestreadas (cinco para habla y chat de voz) se eligieron sobre MMAU-Pro.
* Reproducido localmente con el prompting propio de MOSS-Audio-4B-Instruct y puntuado con el mismo script de MMAU-Pro.

MMAU-Pro por categoría (Ossicle-4B):

| Sound | Music | Speech | Multi-clip | Spatial | Voice chat | Open-ended | Instruction following |
|---|---|---|---|---|---|---|---|
| 46,7 | 65,7 | 53,5 | 60,2 | 46,5 | 61,7 | 65,2 | 52,9 |

Memoria máxima de audio (minutos) hasta responder, con memoria GPU pico en GB entre paréntesis:

| Hardware | Modo audio largo | Clip completo de una vez |
|---|---|---|
| RTX 5060 Ti, 16 GB, bf16 | 85 (13,5) | 30 (14,1) |
| RTX 5060 Ti, 16 GB, INT4 | 210 (12,4) | 80 (13,9) |
| RX 7900 XT, 20 GB, bf16 | 180 (17,5) | 65 (18,8) |
| RX 7900 XT, 20 GB, INT4 | 295 (15,9) | 95* (15,8) |

* En la tarjeta AMD, una pasada única sobre más de unos 87 minutos activa un bug de convolución en ROCm que devuelve valores incorrectos sin error; es solo una cifra de memoria.

Comparativa de audio máximo (20 GB, clip completo, 4 bits, cotas inferiores): Ossicle-4B 95 min, MOSS-Audio-4B 36 min, Qwen2.5-Omni-3B 20 min, MOSS-Audio-8B 20 min, Qwen2.5-Omni-7B 10 min.

Muchos clips de 30 segundos en una pregunta: RTX 5060 Ti 16 GB alcanza 190 clips (95 min) en bf16 y 370 clips (185 min) en INT4; RX 7900 XT 20 GB alcanza 365 clips (182 min) en bf16 y 575 clips (288 min) en INT4.

## Requisitos de hardware

- VRAM para inferencia: 9,9 GB en bf16, 3,6 GB con pesos de 4 bits; el audio largo añade unos 2,5 GB por hora de audio.
- GPU recomendadas: RTX 5060 Ti 16 GB (verificada), RX 7900 XT 20 GB (verificada); cualquier GPU con al menos 16 GB para bf16 y al menos 8 GB para INT4.
- Cabe en GPU de consumo: sí, en RTX 5060 Ti 16 GB y superiores; con INT4 en tarjetas de 8 GB o más.
- Opciones de despliegue: transformers (probado con la versión 5.17), vLLM, custom_code; el repositorio incluye `scripts/bench_long.py` para medir memoria y `ossicle/system.py` para la cascada de dos pasadas.
- Latencia y throughput: no se publican cifras de latencia ni throughput en la información disponible; las mediciones de memoria se hicieron con decodificación greedy y 60 tokens nuevos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMAU-Pro | MMAU test-mini | Licencia | Audio máximo (20 GB, 4 bits) |
|---|---|---|---|---|---|---|
| Ossicle-4B | 4,9B (27M entrenados) | 262.144 tokens LM | 57† | 71,8 | Apache 2.0 | 95 min |
| MOSS-Audio-4B-Instruct | 4B | no disponible | 54,9* | 75,8 | no disponible | 36 min |
| Kimi-Audio-7B | 7B | no disponible | 56,6 | 72,4 | no disponible | no disponible |
| Qwen2.5-Omni-7B | 7B | no disponible | 52,2 | 65,6 | no disponible | 10 min |

Ossicle-4B destaca por su relación entre tamaño, licencia permisiva y capacidad de audio largo; MOSS-Audio-4B-Instruct le supera en MMAU test-mini pero queda por debajo en MMAU-Pro y en longitud de audio soportada.

## Limitaciones y advertencias

- Solo soporta inglés; no se documentan otros idiomas.
- El checkpoint se entrenó con clips de como máximo 30 segundos; en pruebas previas perdió detalle hablado en grabaciones de más de unos 10 minutos, por lo que el modo de audio largo sirve para eventos (sonidos, música, cambio de hablante o estado de ánimo), no para transcribir horas de habla.
- Las señales estéreo no se utilizan en clips largos.
- El modo chat solo escucha los primeros 4 minutos de cada grabación.
- La puntuación de MMAU-Pro de 57 se obtuvo con una cascada de dos pasadas y con el estilo de prompt por categoría y el número de muestras elegidos sobre el propio benchmark, lo que introduce riesgo de sobreajuste a la evaluación.
- El bug de convolución en ROCm para pasadas únicas de más de 87 minutos devuelve valores incorrectos sin error en la RX 7900 XT.
- Riesgo de alucinación no cuantificado en la información disponible; no se documentan sesgos conocidos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B y el codificador Qwen3-Omni AuT pueden tener condiciones adicionales que conviene verificar.
- Capacidades de tool calling, agentes y function calling no documentadas; no asumir su disponibilidad en producción.

## Enlaces

- Hugging Face: https://huggingface.co/SILVERTHRONE/Ossicle-4B
- Repositorio GitHub: https://github.com/SILVERTHRONE32/ossicle-4b
- Modelo base LM: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo base codificador: https://huggingface.co/Atotti/Qwen3-Omni-AudioTransformer
- Script de benchmark de audio largo: `scripts/bench_long.py` en el repositorio GitHub
- Sistema de cascada de dos pasadas: `ossicle/system.py` en el repositorio GitHub
