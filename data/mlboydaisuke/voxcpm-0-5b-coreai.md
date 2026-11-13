# mlboydaisuke/VoxCPM-0.5B-CoreAI

## Resumen

VoxCPM-0.5B-CoreAI es la conversión a Apple Core AI del modelo de síntesis de voz VoxCPM-0.5B desarrollado originalmente por OpenBMB. La conversión la firma el usuario mlboydaisuke y su objetivo es ejecutar un sistema completo de text-to-speech íntegramente en dispositivo, sin red ni servidor, sobre iPhone (Neural Engine o GPU) y Macs con Apple Silicon. Core AI es el runtime de ML en dispositivo de Apple introducido en iOS 27 y macOS 27 como sucesor de Core ML, y los modelos se exportan desde PyTorch mediante `coreai-torch` a paquetes `.aimodel`.

El modelo no es un vocoder TTS clásico: combina un backbone de lenguaje MiniCPM4 con una cabeza de difusión por flow-matching LocDiT y un AudioVAE, generando habla mediante un bucle de difusión continuo a tasa de token. El paquete incluye siete bundles `.aimodel` (backbone LM de 24 capas, LM residual de 6 capas, prefill batcheado, decodificador de difusión, encoder de características y vocoder AudioVAE), con las dos partes LM cuantizadas a int8 y el resto en fp16.

La relevancia actual está en que permite TTS neuronal de calidad con licencia Apache-2.0 y despliegue nativo en el ecosistema Apple, algo poco habitual en modelos de esta categoría, y con un peso de descarga de aproximadamente 1,37 GB en Mac y 1,38 GB en iPhone.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: backbone LM MiniCPM4 (24 capas) + LM residual (6 capas) + cabeza de difusión LocDiT con flow-matching (CFM) + AudioVAE estilo DAC (upsample 640x) |
| Parametros totales | 0,5B (según nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de decodificación estática con KV cache, chunk de prefill q=32) |
| Tipos de cuantizacion | int8 weight-only en los dos backbones LM; fp16 en decodificador de difusión, encoder de características y AudioVAE |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | bundles `.aimodel` (Core AI, JIT) para macOS e iOS; modelo base en safetensors |
| Frecuencia de salida | 16 kHz mono |
| Pasos de difusión | 10 pasos Euler con CFG, desenrollados |
| Tamano de descarga | ~1.374 MB (Mac) / ~1.378 MB (iPhone) |
| Tamano del repo | 5,3 GB |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de tres etapas. Un backbone LM basado en MiniCPM4 de 24 capas genera representaciones a tasa de token; un LM residual de 6 capas refina esa señal; y una cabeza de difusión LocDiT con flow-matching condicional (CFM) produce las características acústicas mediante un bucle de 10 pasos Euler con classifier-free guidance desenrollado. Finalmente, un AudioVAE de estilo DAC con factor de upsample 640x reconstruye la forma de onda a 16 kHz. Este esquema de difusión continua a tasa de token es lo que distingue a VoxCPM de los vocoders TTS convencionales.

La conversión a Core AI separa los bundles de decodificación (decode) de los de prefill: el prefill batcheado con q=32 siembra la caché KV en una sola pasada para reducir el tiempo hasta el primer audio, y luego se usa decodificación con KV estática. No se dispone de información sobre el dataset de entrenamiento, número de tokens, composición de datos ni si hubo fases de RLHF o DPO en la información proporcionada.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto de entrada, con salida PCM mono a 16 kHz en rango [-1, 1].
- Generación por streaming: `synthesizeStreaming(_:onChunk:)` entrega fragmentos de audio de aproximadamente 0,5 s a medida que se decodifican, de modo que la reproducción empieza antes de completar el clip.
- Ejecución totalmente en dispositivo en iPhone (Neural Engine o GPU) y Macs con Apple Silicon, sin conexión de red.
- Soporte multilingüe limitado a inglés y chino.
- API de alto nivel para una sola línea (`CoreAI.speak(text)`) y API de sesión (`KitSpeaker(catalog:)`) para control fino.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso; es un modelo especializado en TTS.
- No se documentan capacidades de visión, audio de entrada ni modo de razonamiento.

## Casos de uso

- Lectura de notificaciones y mensajes en apps iOS: el modelo sintetiza texto corto en el propio dispositivo con latencia baja gracias al prefill batcheado q=32, sin enviar contenido del usuario a un servidor.
- Accesibilidad para personas con discapacidad visual: integración de `KitSpeaker` en apps de lectura de pantalla para convertir contenido dinámico en voz, con la ventaja de que la inferencia es local y funciona sin conectividad.
- Asistentes de voz conversacionales en apps nativas: el streaming por fragmentos de ~0,5 s permite solapar la síntesis con la reproducción y reducir la latencia percibida en respuestas multi-turno.
- Audiolibros y podcasts generados en el dispositivo: síntesis por lotes de textos largos en Mac con Apple Silicon, usando el pipeline completo de prefill y decode sin depender de servicios en la nube.
- Aprendizaje de idiomas (inglés y chino): generación de pronunciaciones y frases de ejemplo bajo demanda en la app, con la ventaja de funcionar offline y de mantener la privacidad del texto del estudiante.
- Automatización headless en macOS: uso del CLI `speak-cli` en pipelines de agentes o scripts para generar archivos WAV a partir de texto, integrándolo en flujos de CI o herramientas internas.
- Prototipado de interfaces de voz: el runner Speak (GUI y CLI) y el QuickStart de una sola función permiten validar experiencias de voz antes de invertir en infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card cita, como referencia del runtime Core AI y no de este modelo, que Qwen3-8B en 4 bits decodifica a 94 tok/s en GPU de M4 Max con MLX en 90 tok/s bajo el mismo protocolo, según el repositorio apple-silicon-llm-bench (macOS 27 beta 26A5353q, 2026-06-11). No hay datos de latencia, throughput ni métricas de calidad de voz (MOS, WER) para VoxCPM-0.5B-CoreAI.

## Requisitos de hardware

- Almacenamiento: aproximadamente 1.374 MB en Mac y 1.378 MB en iPhone para la descarga inicial del modelo.
- Ejecución en iPhone: usa el Apple Neural Engine o la GPU del dispositivo; la model card menciona una captura previa en iPhone 17 Pro, aunque aclara que no valida este paquete en iPhone.
- Ejecución en Mac: Apple Silicon (GPU o Neural Engine); la referencia de rendimiento del runtime se da sobre M4 Max.
- No se especifican cifras de VRAM o memoria unificada necesarias; al ser un modelo de 0,5B con int8 en los backbones LM y fp16 en el resto, el peso es reducido, pero no se aporta el dato exacto de memoria en ejecución.
- Despliegue: Core AI mediante `coreai-torch` (exportación) y CoreAIKit 0.7.3 (SPM, producto CoreAIKit); requiere Xcode 27 (build 27A266a según el pin de la release) y macOS 27 / iOS 27.
- Opciones de despliegue alternativas: el modelo base openbmb/VoxCPM-0.5B puede ejecutarse con otros runtimes, y existe una colección de conversiones de la comunidad MLX (mlx-community/VoxCPM2) con el mismo reparto de cuantización.
- Latencia y throughput: no disponibles para este paquete; se documenta streaming en fragmentos de ~0,5 s y que las compilaciones Debug son aproximadamente 3x más lentas que Release en el trabajo de host por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|---|
| VoxCPM-0.5B-CoreAI | 0,5B | no disponible | en, zh | Apache-2.0 | Core AI (iOS/macOS) | Conversión on-device con int8 en LM y fp16 en difusión y vocoder |
| openbmb/VoxCPM-0.5B | 0,5B | no disponible | en, zh | Apache-2.0 | PyTorch / otros runtimes | Modelo base original del que deriva esta conversión |
| mlx-community/VoxCPM2 | no disponible | no disponible | no disponible | no disponible | MLX (Apple Silicon) | Usa el mismo reparto de cuantización (int8 en LM, fp16 en el resto) |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; no hay soporte documentado de castellano.
- Salida fijada a 16 kHz mono, lo que limita la fidelidad frente a sistemas de 24 kHz o 48 kHz en aplicaciones de música o doblaje.
- El camino de realimentación continua (difusión) es sensible a la cuantización, por lo que se mantiene en fp16; cuantizarlo más podría degradar la calidad de forma no documentada.
- No se aportan datos sobre sesgos, tasas de alucinación ni evaluación de calidad de voz (MOS, WER, similitud de hablante).
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base openbmb/VoxCPM-0.5B y de los datasets de entrenamiento originales.
- Dependencia de versiones concretas: Core AI requiere iOS 27 / macOS 27 y Xcode 27 (build 27A266a según el pin); el ecosistema es muy reciente y puede cambiar.
- La captura de demo en iPhone 17 Pro corresponde a una versión anterior de VoxCPM y no valida este paquete en iPhone, según la propia model card.
- El modelo no tiene fila en el leaderboard on-device DeviceMark, por lo que no hay validación independiente de rendimiento en dispositivo.
- El modelo no ofrece tool calling ni razonamiento; no debe emplearse fuera de tareas de síntesis de voz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/VoxCPM-0.5B-CoreAI
- Modelo base: https://huggingface.co/openbmb/VoxCPM-0.5B
- Colección MLX de VoxCPM: https://huggingface.co/collections/mlx-community/voxcpm
- CoreAIKit (repositorio): https://github.com/john-rocky/coreai-kit
- CoreAIKit, README de la versión 0.7.3: https://github.com/john-rocky/coreai-kit#readme
- Ejemplo ChatDemo: https://github.com/john-rocky/coreai-kit/tree/0.7.3/Examples/ChatDemo
- Ejemplo Speak: https://github.com/john-rocky/coreai-kit/tree/0.7.3/Examples/Speak
- Cookbook: https://github.com/john-rocky/coreai-kit/blob/0.7.3/docs/COOKBOOK.md
- QuickStart.swift: https://github.com/john-rocky/coreai-kit/blob/0.7.3/Examples/Speak/Sources/QuickStart.swift
- Benchmark apple-silicon-llm-bench: https://github.com/john-rocky/apple-silicon-llm-bench
- Leaderboard DeviceMark: https://devicemark.github.io/
