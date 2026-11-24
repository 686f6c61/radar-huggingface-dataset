# aufklarer/Inworld-Voice-Isolator-v1-Realtime-CoreML

## Resumen

Inworld Voice Isolator v1 Realtime CoreML es una conversión compilada a Core ML del modelo Inworld Voice Isolator v1, orientada a aislamiento de voz y eliminación de ruido en tiempo real sobre hardware Apple Silicon. El modelo original fue entrenado y publicado por Inworld AI bajo licencia Apache 2.0; esta versión es un empaquetado realizado por el usuario aufklarer que traduce los pesos a ocho etapas Core ML compiladas con soporte de escaneo Metal, más un decodificador de bandas implementado en Metal.

El modelo resuelve un problema concreto de procesamiento de audio: separar la voz humana del ruido de fondo en una señal mono a 48 kHz, con latencia de tiempo real y look-ahead configurable (0, 20 o 40 ms; por defecto 20 ms). No es un modelo de lenguaje ni un sistema de reconocimiento de voz: es un modelo audio-to-audio de mejora de habla (speech enhancement) con 58.178.056 parámetros y un payload de 139,92 MB.

Su relevancia actual radica en que permite ejecutar aislamiento de voz de calidad en dispositivos Apple (portátiles y estaciones de trabajo con chip M-series) sin depender de la nube, mediante un runtime Swift específico (speech-swift) y una API de streaming por bloques PCM. La licencia Apache 2.0 del modelo base facilita su integración en productos comerciales, siempre respetando las atribuciones del autor original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: etapas Core ML compiladas con escaneo Metal (scan tipo Mamba) y decodificador de bandas en Metal |
| Parametros totales | 58.178.056 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio en streaming; bloques de 4.384 muestras el primero y 3.840 los siguientes) |
| Tipos de cuantizacion | Float16 en capas lineales seleccionadas; claves a 10 bits y valores a 12 bits |
| Idiomas soportados | Multilingüe (validado en seis idiomas con FLEURS) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML compilado (`.mlmodelc`), coeficientes binarios Float32 (`.bin`) y decodificador Metal (`.bin`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo original de Inworld más allá de que la conversión Core ML emplea un mecanismo de escaneo (scan) compatible con Metal, con coeficientes Float32 almacenados en `scan_coefficients.bin`, lo que sugiere un componente de tipo Mamba o state-space model en el pipeline. El bundle se organiza en ocho etapas Core ML compiladas (`stage_*.mlmodelc`, 106,31 MB) más un decodificador de bandas en Metal (`decoder.bin`, 32,77 MB). La predicción opera en ventanas de ocho frames, con un primer bloque PCM de 4.384 muestras y bloques posteriores de 3.840 muestras.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo original empleó RLHF, DPO u otras técnicas de alineación; estos datos no aparecen en la model card. La conversión preserva los checkpoints originales de Inworld (referenciados con SHA-256 en el bundle) y añade un parche de código fuente Swift contra la revisión pública `8effd8f8cbcb6aa1b9355cc6120c2290f05eafd7` de speech-swift. La validación numérica reporta un error máximo de `6,73e-05` frente a una tolerancia de `1e-4` en las comprobaciones golden, y muestras idénticas entre las rutas de chunking preparado y fijo en clips limpios y ruidosos de FLEURS en seis idiomas.

## Capacidades

- Aislamiento de voz (voice isolation) en señal de audio mono a 48 kHz.
- Eliminación de ruido de fondo (denoising) y mejora de habla (speech enhancement).
- Procesamiento en tiempo real con streaming por bloques PCM y latencia controlada.
- Look-ahead configurable: 0, 20 o 40 ms (por defecto 20 ms).
- Soporte multilingüe validado en seis idiomas mediante FLEURS.
- Integración nativa en Swift mediante el módulo `SpeechEnhancement` y la clase `InworldVoiceIsolatorStream`.
- Aceleración por GPU Apple Silicon vía Metal en las etapas de escaneo y decodificación.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente audio-to-audio.

## Casos de uso

- Videollamadas y reuniones en tiempo real: el modelo puede limpiar la señal de micrófono antes de enviarla al codificador de videoconferencia, con look-ahead de 20 ms que mantiene la latencia por debajo del umbral perceptible en conversación.
- Grabación de podcasts y contenido: permite capturar voz en entornos domésticos ruidosos y obtener una pista limpia sin necesidad de un estudio insonorizado, procesando la señal a 48 kHz mono.
- Transcripción previa a ASR: como etapa de preprocesado antes de un sistema de reconocimiento de voz, reduce el ruido de fondo y mejora la precisión del transcriptor en entornos adversos.
- Asistentes de voz en dispositivos Apple: al ejecutarse localmente sobre Apple Silicon con Core ML y Metal, permite integrar aislamiento de voz en apps macOS/iOS sin enviar audio a la nube, con implicaciones de privacidad.
- Herramientas de accesibilidad: mejora de la inteligibilidad de la voz para usuarios con dificultades auditivas o en entornos con ruido ambiental, procesando en streaming con latencia controlada.
- Producción audiovisual y doblaje: limpieza de tomas de voz capturadas en localizaciones ruidosas antes de la mezcla final, con la ventaja de que el bundle es pequeño (139,92 MB) y desplegable en estaciones de trabajo Apple.
- Comunicaciones de emergencia y campo: aislamiento de voz en dispositivos portátiles Apple para operadores que transmiten desde entornos con ruido intenso.

## Benchmarks y rendimiento

| Prueba (Apple M5 Pro) | Tiempo | Resultado adicional |
|---|---:|---|
| Reproducción pautada de 99 s | 485,5 ms p99 en caliente | 57 pushes completos tardíos tras el primero |
| Reproducción pautada de 66 s, worker iniciado por el usuario | 108,7 ms p99 en caliente | 45 pushes completos tardíos tras el primero |

La latencia pautada mide el intervalo desde la llegada programada del buffer hasta el retorno de la llamada Swift. La estación de trabajo estaba activa durante las pruebas, por lo que la carga del escritorio puede provocar incumplimientos de plazo. Las comprobaciones de forma de onda pasaron y las rutas de chunking preparado y fijo produjeron muestras idénticas en los clips limpios y ruidosos de la verificación FLEURS en seis idiomas. El mayor error golden upstream fue `6,73e-05` frente a una tolerancia de `1e-4`.

No se han publicado resultados de benchmarks estándar (tipo MMLU, HumanEval o GSM8K, no aplicables a este modelo) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica en el sentido tradicional; el modelo está diseñado para Apple Silicon y consume memoria unificada. El payload del bundle es de 139,92 MB (106,31 MB de etapas Core ML + 32,77 MB de decodificador + 0,84 MB de coeficientes).
- GPU recomendadas: Apple Silicon con soporte Metal; las pruebas publicadas se realizaron en un Apple M5 Pro. No se dispone de datos para otras GPU Apple (M1, M2, M3, M4) ni para GPU NVIDIA/AMD, ya que el formato es Core ML.
- Cabida en hardware de consumo: sí, en equipos Apple Silicon; el tamaño del bundle es reducido. No es compatible con GPU de consumo x86 convencionales sin una conversión adicional a otro formato.
- Opciones de despliegue: runtime Swift `speech-swift` (módulo `SpeechEnhancement`), con compilación mediante `make build` y aplicación del parche `speech-swift-inworld.patch` sobre la revisión `8effd8f8cbcb6aa1b9355cc6120c2290f05eafd7`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este modelo.
- Latencia y throughput: p99 en caliente de 485,5 ms en reproducción de 99 s y 108,7 ms en reproducción de 66 s con worker iniciado por el usuario, en Apple M5 Pro con carga de escritorio activa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Inworld Voice Isolator v1 Realtime CoreML (este) | 58.178.056 | Streaming por bloques (4.384 / 3.840 muestras) | Apache 2.0 | Hugging Face (Core ML) | Conversión Core ML para Apple Silicon con runtime Swift |
| Inworld Voice Isolator v1 (original) | 58.178.056 | no disponible | Apache 2.0 | Hugging Face (checkpoints originales) | Pesos upstream sin conversión Core ML |
| Otros modelos de aislamiento de voz | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información sobre modelos alternativos de aislamiento de voz con la que construir una comparativa cuantitativa fiable; los datos de rendimiento publicados solo cubren este bundle en Apple M5 Pro.

## Limitaciones y advertencias

- El modelo está limitado a hardware Apple Silicon con soporte Core ML y Metal; no es desplegable directamente en GPU NVIDIA, AMD o entornos x86 sin conversión adicional.
- La latencia publicada se midió en un Apple M5 Pro con carga de escritorio activa; los incumplimientos de plazo (late pushes) observados indican que la carga del sistema puede degradar el rendimiento en tiempo real.
- El look-ahead por defecto es de 20 ms; valores de 0 ms o 40 ms alteran el equilibrio entre latencia y calidad, y no se documentan métricas de calidad para cada configuración.
- La validación multilingüe se limita a seis idiomas mediante FLEURS; no se especifica la lista completa de idiomas soportados ni su cobertura.
- No se dispone de información sobre sesgos, tasas de alucinación (no aplica a audio-to-audio en el sentido habitual) ni comportamiento en dominios acústicos no representados en el dataset de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el bundle incluye `LICENSE`, `NOTICE` y atribuciones al modelo upstream de Inworld que deben preservarse.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado el 24 de noviembre de 2026; se trata de una conversión reciente sin validación comunitaria independiente.
- El modelo depende de una revisión concreta de speech-swift y de un parche de código fuente; cambios en el runtime pueden romper la compatibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/aufklarer/Inworld-Voice-Isolator-v1-Realtime-CoreML
- Pesos fuente (Inworld): https://huggingface.co/inworld/voice-isolator/tree/9b0285b3fe8403aa8e2f1dbb2165a80a4294c970
- Model card upstream: https://github.com/inworld-ai/voice-isolator/blob/c73f3fab81a870410cbac50d2f05f25edc4d10aa/MODEL_CARD.md
- Runtime Swift (speech-swift): https://github.com/soniqo/speech-swift
- Getting started: https://soniqo.audio/getting-started
- Soniqo: https://soniqo.audio
- Blog: https://soniqo.audio/blog
- Resultados de validación: https://huggingface.co/aufklarer/Inworld-Voice-Isolator-v1-Realtime-CoreML/blob/main/validation.json
