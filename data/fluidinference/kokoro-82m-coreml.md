# FluidInference/kokoro-82m-coreml

## Resumen

Kokoro-82M-CoreML es una conversión a Apple Core ML del modelo de síntesis de voz Kokoro-82M, desarrollado originalmente por hexgrad y convertido por FluidInference para su ejecución optimizada en el ecosistema Apple (macOS, iOS, silicio de Apple). El modelo original es un TTS ligero de 82 millones de parámetros que destaca por su relación calidad-tamaño, y esta versión empaqueta los grafos en formato Core ML (.mlmodelc/.mlpackage) con enrutamiento híbrido entre CPU, GPU y Neural Engine (ANE).

El repositorio incluye tres variantes lingüísticas: inglés y japonés (a partir de hexgrad/Kokoro-82M) y mandarín (a partir de hexgrad/Kokoro-82M-v1.1-zh). La versión ANE v3, opt-in, incorpora buckets fijos para Albert/decoder, DSP nativo en origen y un generador adaptado a GPU. El SDK FluidAudio v0.17.6 expone estas variantes mediante `KokoroAneManager`.

Su relevancia actual radica en que permite inferencia TTS de baja latencia en dispositivos Apple sin depender de la nube: mediciones locales en un M5 Pro reportan 49,45 ms (inglés), 35,85 ms (japonés) y 53,97 ms (mandarín) por llamada en modo híbrido, frente a los 511,40/474,45/584,19 ms del enrutamiento CPU+ANE completo. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal TTS (Kokoro-82M) convertida a Core ML; pipeline con módulos Albert, PostAlbert, Alignment, Prosody, decoder enmascarado, generador y vocoder |
| Parametros totales | 82 M (modelo base Kokoro-82M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; procesa texto de entrada por utterance) |
| Tipos de cuantizacion | Pesos fp32 en módulos críticos (Prosody_v2, Tail_v2, Vocoder_v2); fp16 en rutas previas; conversión Core ML (mlmodelc/mlpackage) |
| Idiomas soportados | Inglés, japonés, mandarín (chino); cachés de léxico adicionales para español y francés |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (.mlmodelc, .mlpackage) |

## Arquitectura y entrenamiento

El modelo subyacente Kokoro-82M es una arquitectura de síntesis de voz de 82 millones de parámetros, diseñada para generar audio de alta calidad con un coste computacional reducido. La conversión a Core ML descompone el pipeline en módulos diferenciados: Albert y PostAlbert (procesamiento textual/contextual), Alignment (alineamiento texto-audio), Prosody (prosodia y F0), un decoder enmascarado, un generador rápido y un vocoder de respaldo, además de etapas de ruido y cola (Noise/Tail). El SDK enruta cada módulo a un destino de cómputo específico: Albert, PostAlbert, Alignment, Prosody y el decoder enmascarado solicitan `.cpuAndNeuralEngine`; el generador rápido solicita `.cpuAndGPU`; el DSP nativo y la STFT se ejecutan en CPU/Accelerate.

No se dispone de información sobre el dataset de entrenamiento original, el número de tokens o el uso de RLHF/DPO en la información proporcionada. La innovación técnica destacable de esta conversión es el enrutamiento híbrido de cómputo entre ANE y GPU, junto con correcciones de precisión: los módulos Prosody_v2 y Vocoder_v2 se migraron a fp32 porque la ruta fp16 en CPU Core ML corrompía el inicio de utterances largas (F0/N corruptos con T_a ≥ ~400 y arranque robótico en el primer segundo). El repositorio mantiene versiones fijas (`_v2`) junto a las originales para preservar compatibilidad con releases antiguos de FluidAudio.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés, japonés y mandarín.
- Generación de audio de alta calidad con prosodia controlada mediante estilos/voces predefinidas.
- Soporte de voces nativas por variante lingüística (incluye voces británicas con caché de léxico `gb_lexicon_cache.json`).
- Procesamiento de texto nativo con DSP en origen y STFT en CPU/Accelerate.
- Ejecución en dispositivo (on-device) en macOS 15 / iOS 18 mediante el SDK FluidAudio.
- Enrutamiento configurable de cómputo (híbrido ANE+GPU, CPU+ANE, etc.) a través de la API del SDK.
- No se documenta soporte de tool calling, agentes, visión, audio de entrada ni modo thinking; es un modelo exclusivamente TTS.

## Casos de uso

- Lectura por voz en aplicaciones iOS/macOS: el modelo se integra mediante `KokoroAneManager` y genera audio en menos de 60 ms por utterance en modo híbrido, adecuado para interfaces de accesibilidad y lectores de pantalla.
- Asistentes conversacionales on-device: al ejecutarse localmente en el Neural Engine, permite respuestas habladas sin enviar texto a la nube, útil en escenarios de privacidad.
- Doblaje y locución automatizada en inglés, japonés y mandarín: las tres variantes cubren mercados principales con la misma API y licencia Apache 2.0.
- Generación de audiolibros y contenido largo: el pipeline procesa utterances de varios segundos (3,05–3,68 s en las mediciones) con correcciones específicas para el onset de utterances largas.
- Prototipado rápido de productos de voz: el formato Core ML y el SDK Swift reducen la fricción de integración en apps nativas Apple.
- Investigación en TTS eficiente: el repositorio documenta protocolos de medición, issues y commits, lo que facilita reproducir y comparar enrutamientos de cómputo.
- Aplicaciones de aprendizaje de idiomas: pronunciación sintética en inglés, japonés y mandarín con voces y léxicos específicos por variante.

## Benchmarks y rendimiento

Mediciones locales del SDK (Apple M5 Pro, 24 GiB, macOS 27.0; mediana de cinco llamadas tras dos warmups, una entrada de demo por idioma):

| Política de cómputo | Inglés | Japonés | Mandarín |
|---|---:|---:|---:|
| Híbrido actual | 49,45 ms | 35,85 ms | 53,97 ms |
| CPU+ANE en todo | 511,40 ms | 474,45 ms | 584,19 ms |
| `.all` en todo | SIGABRT | SIGABRT | SIGABRT |
| CPU+GPU en todo | SIGABRT | SIGABRT | SIGABRT |

El temporizador cubre desde tokens/estilo preparados hasta PCM completo, excluyendo procesamiento de texto, carga y E/S de WAV. Las salidas medidas fueron de 3,350 / 3,050 / 3,675 segundos. Son comprobaciones exploratorias locales, no resultados de corpus ni entre dispositivos. Las capturas de la demo en vivo reportaron 57,8–79,8 ms en texto crudo a audio completo, con aceleraciones de 1,88× / 5,29× / 2,25× frente a legacy, que son observaciones individuales y no promedios. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no aplican a un modelo TTS.

## Requisitos de hardware

- Ejecución en dispositivos Apple con Neural Engine y GPU integrada; requiere macOS 15 / iOS 18 para la API v3.
- La inferencia física en iOS no está validada según la model card.
- Memoria: el repositorio ocupa 6,8 GB; el modelo base es de 82 M de parámetros, por lo que la huella en ejecución es reducida (no se detalla cifra exacta de VRAM/RAM).
- Hardware de referencia medido: Apple M5 Pro con 24 GiB.
- Despliegue mediante el SDK FluidAudio (Swift) y Core ML; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a Core ML).
- Latencia: 35,85–53,97 ms por utterance en modo híbrido en el hardware de referencia; el throughput no se especifica en la información disponible.
- Advertencia: `.all` y CPU+GPU en todo abortan con `GPURNNOps: JIT not supported` durante Prosody; CPU+ANE permite fallback a CPU y no es ANE-only.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Kokoro-82M-CoreML (este) | 82 M | en, ja, zh | Core ML | Apache 2.0 | Conversión optimizada para Apple; latencias de decenas de ms en M5 Pro |
| hexgrad/Kokoro-82M (original) | 82 M | en, ja | safetensors/PyTorch | Apache 2.0 | Modelo base sin conversión Core ML; requiere runtime distinto |
| hexgrad/Kokoro-82M-v1.1-zh | 82 M | zh | safetensors/PyTorch | Apache 2.0 | Base de la variante mandarín de este repositorio |

No se dispone de datos de benchmarks comparativos con otros modelos TTS en la información proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente TTS: no realiza razonamiento, código, matemáticas ni tool calling.
- La inferencia física en iOS permanece sin validar según la model card.
- El enrutamiento híbrido es fijo en la API pública v3; los overrides globales solo se aplicaron en un arnés local.
- Las mediciones son exploratorias, de un solo dispositivo y una sola entrada por idioma; no constituyen un benchmark representativo.
- Riesgo de artefactos de audio en rutas fp16: documentados y corregidos en Prosody_v2 y Vocoder_v2 con fp32; versiones antiguas pueden presentar onset robótico o F0/N corruptos.
- `.all` y CPU+GPU en todo no son viables (SIGABRT por limitación de JIT en Apple).
- Cobertura lingüística limitada a en/ja/zh en el modelo; los léxicos es/fr son cachés auxiliares y no implican soporte completo de síntesis en esos idiomas.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar la atribución a hexgrad y FluidInference.
- No se documentan sesgos específicos del modelo en la información disponible; al ser TTS, los sesgos se manifestarían en voces y pronunciación.

## Enlaces

- Hugging Face: https://huggingface.co/FluidInference/kokoro-82m-coreml
- Modelo base inglés/japonés: https://huggingface.co/hexgrad/Kokoro-82M
- Modelo base mandarín: https://huggingface.co/hexgrad/Kokoro-82M-v1.1-zh
- Repositorio FluidAudio: https://github.com/FluidInference/FluidAudio
- Documentación TTS KokoroAne: https://github.com/FluidInference/FluidAudio/blob/d7931323eebea4e39874b0d2e75d1b0e90e13084/Documentation/TTS/KokoroAne.md
- Benchmarks: https://github.com/FluidInference/FluidAudio/blob/d7931323eebea4e39874b0d2e75d1b0e90e13084/Documentation/TTS/Benchmarks.md
- Perfilado ANE: https://github.com/FluidInference/FluidAudio/blob/d7931323eebea4e39874b0d2e75d1b0e90e13084/Documentation/ANE_Profiler.md
- Repositorio mobius (conversión): https://github.com/FluidInference/mobius
