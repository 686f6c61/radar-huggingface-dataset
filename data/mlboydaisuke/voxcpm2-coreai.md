# mlboydaisuke/VoxCPM2-CoreAI

## Resumen

VoxCPM2-CoreAI es la conversión a Apple Core AI del modelo de síntesis de voz OpenBMB VoxCPM2 (2B), publicada por el usuario mlboydaisuke. Se distribuye como un conjunto de bundles `.aimodel` listos para ejecutarse íntegramente en dispositivo (iPhone y Mac) sin conexión de red, sobre el runtime Core AI de iOS 27 / macOS 27, sucesor de Core ML. El modelo base es un TTS de difusión sin tokenizador que combina un LM texto-semántico MiniCPM4 de 28 capas, un LM acústico residual de 8 capas y una cabeza de difusión flow-matching LocDiT de 12 capas, decodificada por un AudioVAE a 48 kHz.

La relevancia de esta ficha es doble: por un lado, ofrece TTS neuronal de 2B parámetros con salida a 48 kHz en hardware de consumo Apple; por otro, documenta de forma explícita los problemas de compatibilidad encontrados en iPhone 18 Pro con iOS 27.2 beta, donde los grafos JIT de `ios/` provocaron abortos durante la compilación en dispositivo. El repositorio pesa 18,7 GB e incluye variantes JIT para macOS e iOS, bundles AOT para `h18p` (iPhone 17 Pro) y el glue de host con proyecciones, tabla de embeddings, FSQ-512 y stop-head.

El modelo soporta inglés y chino, se publica bajo licencia Apache 2.0 y se integra mediante el paquete Swift CoreAIKit 0.7.3, que expone una API `KitSpeaker(catalog:)` con síntesis por lotes y en streaming en trozos de aproximadamente 0,5 s.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS de difusion sin tokenizador: LM texto-semantico MiniCPM4 (28 capas) + LM acustico residual (8 capas) + cabeza de difusion flow-matching LocDiT (12 capas) + AudioVAE 48 kHz |
| Parametros totales | 2B (denominacion del modelo base VoxCPM2) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 weight-only en los LM de backbone (base/res decode y prefill); fp16 en feat_decoder, feat_encoder y vocoder |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | bundles `.aimodel` (JIT) y `.aimodelc` (AOT), mas `.bin` de glue de host y tokenizador Llama fast |
| Runtime | Apple Core AI (iOS 27 / macOS 27) |
| Tamano del repositorio | 18,7 GB |
| Frecuencia de muestreo de salida | 48 kHz mono PCM en [-1, 1] |
| Descargas / likes | 23 / 4 |
| Fecha de creacion / actualizacion | 2026-06-28 / 2026-11-13 |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de tres etapas. Un LM texto-semántico basado en MiniCPM4 de 28 capas procesa el texto de entrada; un LM acústico residual de 8 capas refina la representación intermedia; y una cabeza de difusión LocDiT de 12 capas con flow-matching genera las características acústicas continuas, que un AudioVAE decodifica a 48 kHz. El diseño es explícitamente sin tokenizador en el lado acústico, lo que evita la cuantización discreta típica de los codecs neuronales y trabaja directamente sobre representaciones continuas.

La conversión a Core AI separa la cuantización por sensibilidad: los LM de backbone se exportan en int8 weight-only (principal responsable del tamaño), mientras que la ruta de difusión y VAE permanece en fp16 porque la realimentación continua es sensible a la cuantización. El autor indica que este reparto coincide con el que emplea mlx-community. El repositorio contiene cinco bundles Core AI más proyecciones de host: tabla de embeddings, FSQ-512, stop-head y fusión. No se proporcionan en la información disponible datos sobre volumen de entrenamiento, composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Síntesis de voz texto-a-habla en inglés y chino con salida a 48 kHz.
- Síntesis por lotes: devuelve la forma de onda completa como PCM mono en [-1, 1].
- Síntesis en streaming mediante `synthesizeStreaming(_:onChunk:)`, con fragmentos de aproximadamente 0,5 s que permiten iniciar la reproducción antes de completar el clip.
- Ejecución íntegra en dispositivo, sin llamadas de red una vez descargado el modelo.
- Integración en apps iOS y macOS mediante el paquete Swift CoreAIKit 0.7.3 (producto `CoreAIKit`).
- API de una línea vía `CoreAI.speak(text, options: .model("voxcpm2-2b"))` usando el módulo `CoreAIOps`.
- CLI headless (`speak-cli`) para automatización y uso en agentes en macOS.
- Aceleración por GPU o Neural Engine a través del runtime Core AI.
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- Lectura por voz de contenido en apps iOS: el modelo sintetiza texto a 48 kHz en el propio dispositivo, sin enviar datos del usuario a servidores, lo que simplifica el cumplimiento de privacidad en aplicaciones de lectura, noticias o accesibilidad.
- Asistentes conversacionales offline: con RTF 1,19 en iPhone 17 Pro y primer audio a 0,65 s, es viable para respuestas habladas en asistentes que deben funcionar sin conectividad.
- Accesibilidad y lectores de pantalla: la salida a 48 kHz y el streaming por fragmentos permiten reproducir frases largas con baja latencia inicial en apps de lectura para personas con discapacidad visual.
- Generación de audiolibros y pódcasts en macOS: el CLI `speak-cli` permite procesar lotes de texto y volcar WAV en pipelines de producción sin depender de servicios en la nube.
- Prototipado de interfaces de voz: CoreAIKit expone `KitSpeaker(catalog:)` con código copiable, lo que reduce el tiempo de integración de un TTS en una app Swift a unas pocas líneas.
- Localización de contenido en inglés y chino: el soporte bilingüe cubre aplicaciones dirigidas a ambos mercados sin cambiar de modelo.
- Demos y pruebas de concepto en Mac con Apple Silicon: los bundles JIT de `macos/` permiten validar el comportamiento del TTS antes de trasladarlo a dispositivo móvil.

## Benchmarks y rendimiento

| Metrica | Valor | Entorno |
|---|---|---|
| RTF (real-time factor) | 1,19 | iPhone 17 Pro, bundles AOT h18p, int8 + prefill + streaming |
| Primer audio | 0,65 s | iPhone 17 Pro, mismas condiciones |
| Memoria residente | ~4,9 GB | iPhone 17 Pro, con entitlement de memoria incrementada |
| Frecuencia de salida | 48 kHz | Todas las variantes |
| Descarga inicial | ~4.721 MB (Mac) / ~4.727 MB (iPhone) | CoreAIKit 0.7.3 |

No se han publicado resultados de benchmarks de calidad (MOS, WER, similitud de hablante) en la información disponible. El autor señala que el modelo de 2B es aproximadamente 4 veces el 0.5B, por lo que el RTF queda justo por encima del tiempo real.

## Requisitos de hardware

- VRAM/residencia estimada: ~4,9 GB en iPhone 17 Pro con los bundles AOT `h18p`; el paquete descargado ocupa ~4,7 GB.
- GPU recomendadas: Apple Silicon (M-series) en Mac mediante los bundles JIT de `macos/`; iPhone 17 Pro con bundles AOT `h18p` para el mejor rendimiento medido.
- Compatibilidad móvil: requiere iOS 27 y el entitlement de memoria incrementada en iPhone 17 Pro. En iPhone 18 Pro con iOS 27.2 beta (24B5099f) los grafos JIT de `ios/` provocaron dos abortos durante la carga, por lo que el modelo no ha producido audio en ese dispositivo según la información disponible.
- No cabe en GPUs de consumo tipo RTX 4090: el runtime es Core AI y los bundles están compilados para GPU/Neural Engine de Apple, no para CUDA.
- Opciones de despliegue: CoreAIKit 0.7.3 vía Swift Package Manager (producto `CoreAIKit`), app de ejemplo Speak (GUI y CLI) y `CoreAIOps` para uso en una línea. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF 1,19 y primer audio de 0,65 s en iPhone 17 Pro; el autor advierte que medir en Debug es aproximadamente 3 veces más lento en el trabajo de host por token.
- Xcode: build 27A266a según el `.xcode-pin` de la release.

## Comparativa con modelos similares

| Modelo | Parametros | Salida | Contexto | Licencia | Runtime / disponibilidad |
|---|---|---|---|---|---|
| VoxCPM2-CoreAI (este) | 2B | 48 kHz | no disponible | Apache 2.0 | Core AI, on-device Apple |
| VoxCPM-0.5B-CoreAI | 0,5B | no disponible | no disponible | no disponible en la informacion | Core AI, on-device Apple |
| VoxCPM2 (openbmb) | 2B | 48 kHz | no disponible | no disponible en la informacion | Modelo base original |
| VibeVoice | no disponible | no disponible | no disponible | no disponible | Mencionado como cargado en las pruebas del iPhone 18 Pro |

La información disponible no incluye métricas comparativas de calidad entre estos modelos, por lo que la comparación se limita a parámetros, formato de salida y runtime.

## Limitaciones y advertencias

- Solo soporta inglés y chino; no se documentan otros idiomas.
- El modelo de 2B es aproximadamente 4 veces el 0.5B y su RTF de 1,19 queda por encima del tiempo real en iPhone 17 Pro, lo que puede provocar acumulación de latencia en reproducciones largas.
- Inestabilidad documentada: en iPhone 18 Pro con iOS 27.2 beta, dos ejecuciones terminaron en aborto durante la compilación en dispositivo de los grafos JIT, con `MTLReportFailure` en `serializeToMPSGraphPackageAtURL:descriptor:` y sin mensaje de aserción. El modelo no ha generado audio en ese dispositivo según el autor.
- Requiere iOS 27 / macOS 27 y Xcode 27A266a; versiones anteriores del sistema no son compatibles con Core AI.
- La primera ejecución descarga ~4,7 GB, lo que exige espacio en disco y una conexión inicial.
- El rendimiento medido en Debug es aproximadamente 3 veces más lento; es obligatorio medir en Release.
- No se publican evaluaciones de sesgos, robustez ante texto adversario ni tasas de alucinación acústica (pronunciación incorrecta, omisión de palabras).
- El modelo base VoxCPM2 no incluye en la información disponible detalles sobre datos de entrenamiento, lo que impide evaluar sesgos de dominio o de hablante.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base openbmb/VoxCPM2 y de los componentes derivados.
- El contenedor WAV no lo proporciona el modelo: la app debe escribir el fichero (el ejemplo incluye un escritor de 20 líneas).

## Enlaces

- Hugging Face: https://huggingface.co/mlboydaisuke/VoxCPM2-CoreAI
- Modelo base: https://huggingface.co/openbmb/VoxCPM2
- Modelo predecesor: https://huggingface.co/mlboydaisuke/VoxCPM-0.5B-CoreAI
- CoreAIKit 0.7.3: https://github.com/john-rocky/coreai-kit
- Cookbook: https://github.com/john-rocky/coreai-kit/blob/0.7.3/docs/COOKBOOK.md
- Ejemplo Speak: https://github.com/john-rocky/coreai-kit/tree/0.7.3/Examples/Speak
- QuickStart.swift: https://github.com/john-rocky/coreai-kit/blob/0.7.3/Examples/Speak/Sources/QuickStart.swift
- Ejemplo ChatDemo: https://github.com/john-rocky/coreai-kit/tree/0.7.3/Examples/ChatDemo
- Benchmark Apple Silicon LLM: https://github.com/john-rocky/apple-silicon-llm-bench
- DeviceMark: https://devicemark.github.io/
