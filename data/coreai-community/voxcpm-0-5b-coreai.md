# coreai-community/VoxCPM-0.5B-CoreAI

## Resumen

VoxCPM-0.5B-CoreAI es la conversión a Apple Core AI del modelo de síntesis de voz VoxCPM-0.5B de OpenBMB, publicada por la comunidad coreai-community (espejo del repositorio canónico de mlboydaisuke). Core AI es el runtime de ML en dispositivo de Apple que sustituye a Core ML en iOS 27 y macOS 27, y esta conversión permite ejecutar el modelo de forma totalmente local en iPhone (Neural Engine o GPU) y en Macs con Apple Silicon, sin red ni servidor.

A diferencia de un TTS con vocoder clásico, VoxCPM combina un backbone de lenguaje MiniCPM4 (24 capas en el modelo base, más un LM residual de 6 capas) con una cabeza de difusión por flow matching (LocDiT) y un AudioVAE. La generación de habla se produce mediante un bucle de difusión continuo a tasa de token, con salida de audio mono a 16 kHz. El paquete incluye los bundles `.aimodel` para prefill y decode, el decodificador de difusión y el encoder de características.

La relevancia actual es doble: por un lado demuestra que un TTS basado en difusión y backbone LLM puede empaquetarse para inferencia on-device en el ecosistema Apple; por otro, mantiene la licencia Apache-2.0 del modelo base, lo que facilita el uso comercial. El tamaño del repositorio es de 5,3 GB y la descarga en primer uso ronda 1,37 GB según la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone LM MiniCPM4 (24 capas) + LM residual (6 capas) + cabeza de difusion LocDiT (flow matching, CFM) + AudioVAE |
| Parametros totales | 0,5B (según nombre del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (sufijo `cl512` en los bundles de decode); prefill con q=32 |
| Tipos de cuantizacion | int8 weight-only en los dos backbones LM; fp16 en decodificador de difusion, encoder de caracteristicas y AudioVAE |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | Bundles `.aimodel` (Core AI); modelo base en formato original de openbmb/VoxCPM-0.5B |
| Frecuencia de salida | 16 kHz mono PCM |
| Pasos de difusion | 10 pasos Euler + CFG (desenrollados) |
| Runtime | Core AI (iOS 27 / macOS 27), libreria `coreai` |
| Tamano del repo | 5,3 GB |
| Descarga en primer uso | ~1.374 MB (Mac) / ~1.378 MB (iPhone) |

## Arquitectura y entrenamiento

La arquitectura es híbrida y poco convencional para TTS. El núcleo generativo es un backbone de lenguaje MiniCPM4 de 24 capas, acompañado de un LM residual de 6 capas, ambos cuantizados a int8 en peso. Sobre esa representación continua actúa una cabeza de difusión LocDiT con flow matching (CFM) que genera las características acústicas mediante 10 pasos Euler con classifier-free guidance desenrollados, y un AudioVAE que convierte esas características en audio a 16 kHz. El modelo base es openbmb/VoxCPM-0.5B; esta publicación es una conversión cuantizada, no un reentrenamiento.

La conversión separa los bundles en prefill (q=32, batched, para sembrar la caché KV en una pasada y reducir el time-to-first-audio) y decode (KV estático). El decodificador de difusión, el encoder de características y el AudioVAE se mantienen en fp16 porque la ruta de realimentación continua es sensible a la cuantización; este mismo reparto lo emplea la colección mlx-community/VoxCPM2. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en inglés y chino, con salida PCM mono a 16 kHz.
- Generación de audio por difusión continua a tasa de token, con 10 pasos Euler y CFG.
- Síntesis en streaming: `synthesizeStreaming(_:onChunk:)` entrega fragmentos de aproximadamente 0,5 s a medida que se decodifican, de modo que el audio empieza antes de completar el clip.
- Ejecución totalmente on-device en iPhone (Neural Engine o GPU) y Mac con Apple Silicon, sin conexión de red.
- Integración mediante la API `CoreAI.speak(text)` o `KitSpeaker(catalog:)` del kit CoreAIKit 0.7.3.
- Prefill batched (q=32) para reducir la latencia hasta el primer audio.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- Lectura por voz de contenido en apps iOS: el modelo se ejecuta en el Neural Engine o GPU del iPhone sin red, adecuado para apps de noticias, libros o accesibilidad que necesitan síntesis offline con latencia baja gracias al prefill batched.
- Asistentes de voz locales en macOS: integración mediante `CoreAI.speak(text)` en herramientas de línea de comandos o apps de escritorio que requieren privacidad total, ya que el audio no sale del dispositivo.
- Síntesis en streaming para interfaces conversacionales: el modo `synthesizeStreaming` con fragmentos de ~0,5 s permite empezar a reproducir audio mientras se decodifica el resto, útil en asistentes con respuesta percibida inmediata.
- Generación de avisos y notificaciones habladas: el tamaño de 0,5B y la cuantización int8 permiten incluirlo en apps que necesitan TTS embebido sin depender de servicios en la nube, con descarga inicial de ~1,37 GB.
- Prototipado de TTS bilingüe inglés-chino: el soporte de ambos idiomas cubre aplicaciones de aprendizaje de idiomas o atención al cliente en esos mercados, siempre que la ventana de 512 tokens sea suficiente para el texto a sintetizar.
- Automatización headless en macOS: el CLI `speak-cli` permite generar WAV en pipelines de CI o scripts de producción de contenido de audio sin interfaz gráfica.
- Evaluación de la pila Core AI para audio: sirve como referencia para equipos que quieran portar otros modelos de difusión a `.aimodel` y comparar el reparto int8/fp16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de síntesis (MOS, WER, similitud de hablante) en la información disponible. El único dato de rendimiento numérico en la model card es contextual y corresponde a otro modelo: Qwen3-8B 4-bit decodifica a 94 tok/s en GPU de M4 Max con Core AI, frente a 90 con MLX bajo el mismo protocolo. No hay cifras de latencia ni throughput específicas de VoxCPM-0.5B-CoreAI.

## Requisitos de hardware

- Hardware objetivo: iPhone con Neural Engine o GPU (probado en iPhone 17 Pro según la captura de demo) y Macs con Apple Silicon.
- Almacenamiento: descarga inicial de ~1.374 MB en Mac y ~1.378 MB en iPhone, con caché local en Application Support.
- VRAM/RAM estimada: no disponible de forma explícita; el reparto int8 en los backbones y fp16 en el resto implica una huella en torno a 1,3-1,4 GB para los pesos descargados.
- No está pensado para GPU NVIDIA (A100, H100, RTX 4090): los bundles `.aimodel` son específicos del runtime Core AI de Apple.
- Despliegue: Core AI (iOS 27 / macOS 27) mediante CoreAIKit 0.7.3 (SPM, producto CoreAIKit), con ejemplos Speak (GUI y CLI) y ChatDemo.
- Toolchain: Xcode 27 (build 27A266a fijado en `.xcode-pin`); medir en Release, ya que Debug es aproximadamente 3 veces más lento en el trabajo de host por token.
- Latencia y throughput: no disponibles; el diseño de prefill q=32 y decode con KV estático busca minimizar el time-to-first-audio, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Runtime | Licencia | Notas |
|---|---|---|---|---|---|
| VoxCPM-0.5B-CoreAI | 0,5B | 512 tokens | Core AI (Apple on-device) | Apache-2.0 | int8 en LM, fp16 en difusion y VAE; en y zh |
| openbmb/VoxCPM-0.5B | 0,5B | no disponible | PyTorch (modelo base) | Apache-2.0 | Referencia original sin conversión |
| mlx-community/VoxCPM2 | no disponible | no disponible | MLX (Apple Silicon) | no disponible | Mismo reparto int8/fp16 citado en la model card |
| Qwen3-8B 4-bit (Core AI) | 8B | no disponible | Core AI | no disponible | Referencia de throughput (94 tok/s en M4 Max), no es TTS |

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; no se documenta soporte de castellano.
- Ventana de contexto de 512 tokens: los textos largos deben fragmentarse, lo que puede afectar a la prosodia entre fragmentos.
- Es una conversión cuantizada del modelo base; la cuantización int8 en los backbones puede degradar la calidad respecto al original en fp16 o fp32.
- La ruta de realimentación continua es sensible a la cuantización, de ahí que difusión y VAE se mantengan en fp16; modificar ese reparto puede romper la calidad.
- Dependencia estricta del ecosistema Apple: requiere iOS 27 o macOS 27 y Xcode 27; no es desplegable en Linux ni en GPU NVIDIA.
- Repositorio espejo: las actualizaciones llegan primero al repositorio canónico mlboydaisuke/VoxCPM-0.5B-CoreAI, por lo que esta copia puede quedar desactualizada.
- La captura de demo en iPhone 17 Pro corresponde a una versión anterior de VoxCPM 0.5B y no valida el paquete de esta release en iPhone, según la propia model card.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones de sesgo, robustez o fidelidad de pronunciación en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base openbmb/VoxCPM-0.5B y de los componentes incluidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coreai-community/VoxCPM-0.5B-CoreAI
- Repositorio canónico (espejo origen): https://huggingface.co/mlboydaisuke/VoxCPM-0.5B-CoreAI
- Modelo base: https://huggingface.co/openbmb/VoxCPM-0.5B
- CoreAI Model Zoo: https://github.com/john-rocky/coreai-model-zoo
- CoreAIKit 0.7.3: https://github.com/john-rocky/coreai-kit
- Ejemplo Speak (GUI y CLI): https://github.com/john-rocky/coreai-kit/tree/0.7.3/Examples/Speak
- QuickStart.swift: https://github.com/john-rocky/coreai-kit/blob/0.7.3/Examples/Speak/Sources/QuickStart.swift
- Cookbook: https://github.com/john-rocky/coreai-kit/blob/0.7.3/docs/COOKBOOK.md
- ChatDemo: https://github.com/john-rocky/coreai-kit/tree/0.7.3/Examples/ChatDemo
- Benchmark Apple Silicon LLM: https://github.com/john-rocky/apple-silicon-llm-bench
- Colección MLX VoxCPM: https://huggingface.co/collections/mlx-community/voxcpm
- DeviceMark: https://devicemark.github.io/
