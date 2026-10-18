# aufklarer/Pocket-TTS-100M-CoreML-INT8

## Resumen

Pocket TTS 100M CoreML INT8 es una conversión precompilada para CoreML del modelo de síntesis de voz Kyutai Pocket TTS, publicada por aufklarer. El bundle, de unos 299 MiB, está pensado para inferencia nativa en CPU en plataformas Apple y genera audio mono Float32 a 24 kHz en streaming, con frames de 1.920 muestras (80 ms).

Incluye un preset fijo de voz en inglés (Alba) y usa INT8 en los pesos lineales del backbone autorregresivo, mientras que el condicionamiento, el decoder flow-matching de ocho pasos y el decoder Mimi conservan FP16. La caché tiene seis capas y 512 posiciones, y el texto de entrada está limitado a 4.096 caracteres.

Su relevancia está en ofrecer TTS local de baja latencia sin GPU: en un Apple M5 Pro, solo CPU, el primer PCM aparece en 78,9 ms de mediana y la síntesis completa de 2,8 s de audio tarda 943,4 ms (RTF 0,337). Es una opción acotada a inglés y a una voz concreta, con licencia CC BY 4.0 y atribución obligatoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS con backbone autorregresivo (flowlm), decoder flow-matching fusionado de ocho pasos y decoder de audio Mimi |
| Parametros totales | 100 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 posiciones de caché en seis capas; entrada de texto limitada a 4.096 caracteres |
| Tipos de cuantizacion | INT8 en pesos lineales del backbone; FP16 en condicionamiento, decoder flow-matching y Mimi |
| Idiomas soportados | Inglés (en), voz fija Alba |
| Licencia | CC BY 4.0; requiere atribución a Kyutai, FluidInference y Alba MacKenna |
| Formato de pesos | CoreML `.mlmodelc` precompilado; no se distribuyen safetensors ni GGUF |
| Tamaño del bundle | Aproximadamente 299 MiB; repositorio de unos 0,3 GB |
| Salida de audio | PCM mono Float32, 24 kHz, frames de 1.920 muestras (80 ms) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Kyutai Pocket TTS: un backbone autorregresivo (`flowlm_stepv2`) que opera sobre condicionamiento de texto (`cond_prefill`), un decoder flow-matching fusionado (`flow_decoder_fused`) con ocho pasos fijos en el grafo exportado y un decoder de audio Mimi (`mimi_decoder`) para la síntesis en streaming. La caché cubre seis capas y 512 posiciones; la generación emite frames de 1.920 muestras a 24 kHz y usa temperatura 0,7 con una semilla determinista local a la petición.

La conversión a CoreML la firma FluidInference en la revisión `91748676fe3c8b2eb3007b3125253bcd898202c3`, ruta `v2.1/english/`. Los pesos lineales del backbone usan la conversión INT8 upstream y no se recuantizan; el resto de grafos mantiene FP16. Mimi omite salidas passthrough redundantes para evitar colisiones de nombres BNNS de CoreML, y la instantánea de la voz Alba se expande a tensores de caché F32 con padding para el runtime nativo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base utilizó RLHF o DPO. Esta ficha documenta la conversión y el empaquetado, no el proceso de entrenamiento original.

## Capacidades

- Síntesis de voz en inglés con una voz fija predefinida (Alba).
- Generación de audio en streaming con frames de 1.920 muestras (80 ms) a 24 kHz.
- Salida PCM mono Float32, adecuada para reproducción incremental y pipelines de audio.
- Inferencia nativa en CPU mediante CoreML, sin necesidad de GPU.
- Semilla determinista local a la petición y temperatura fija de 0,7.
- API Swift (`PocketTTSModel.fromPretrained()`) y CLI (`speech speak`) para integración en aplicaciones Apple.
- Validación mediante round trip ASR independiente: 0 errores en 150 palabras y 12 frases en la prueba publicada.
- No es un modelo de lenguaje general: no ofrece tool calling, function calling, agentes ni razonamiento multi-paso.
- No soporta visión, entrada de audio, modo thinking ni clonación de voz.

## Casos de uso

- **Síntesis de voz local en aplicaciones macOS o iOS**: integrar el runtime `speech-swift` y consumir los chunks PCM emitidos en streaming; el bundle de 299 MiB y la inferencia CPU-only permiten funcionar sin conexión y sin GPU dedicada.
- **Lectura de notificaciones y accesibilidad**: generar frases cortas en inglés con una latencia de primer PCM de 78,9 ms en un M5 Pro; la voz fija y el tamaño contenido simplifican el despliegue en entornos Apple.
- **Locuciones para vídeos, demos y prototipos**: usar la CLI `speech speak` para producir WAV en inglés a partir de textos de hasta 4.096 caracteres, con salida en streaming y sin depender de servicios externos.
- **Pruebas automatizadas de pipelines de voz y ASR**: emplear la semilla determinista y el round trip ASR publicado para validar que la síntesis produce audio inteligible en integración continua.
- **Asistentes de voz locales en Apple**: combinar la generación streaming con una interfaz Swift para respuestas habladas de baja latencia; los frames de 80 ms permiten empezar a reproducir antes de completar la síntesis.
- **Prototipos de interfaces conversacionales sin Python en inferencia**: usar la API Swift o el binario nativo para evaluar la experiencia de voz en una app, manteniendo Python solo para tareas externas de benchmark.

## Benchmarks y rendimiento

| Metrica | Apple M5 Pro (solo CPU) |
|---|---:|
| Primer PCM, mediana de cinco peticiones en caliente | 78,9 ms |
| Síntesis completa, mediana | 943,4 ms para 2,8 s de audio |
| RTF (menor es más rápido) | 0,337 |
| RSS pico del proceso, incluida la carga | 866,8 MiB |
| Huella física máxima tras la ejecución | 343,7 MiB |
| Round trip ASR independiente | 0 errores en 150 palabras, 12 frases |

No se han publicado resultados de MMLU, HumanEval o GSM8K porque no es un modelo de lenguaje general. Tampoco se han proporcionado comparativas de rendimiento frente a otros modelos TTS en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no aplica; la inferencia es CPU-only mediante CoreML. El bundle ocupa unos 299 MiB y el RSS pico del proceso, incluida la carga, es de 866,8 MiB.
- **GPU recomendadas**: ninguna. La única plataforma con datos publicados es Apple M5 Pro en modo CPU; no hay datos de otras Apple Silicon ni de GPU discretas.
- **Consumer GPU**: no aplica; el modelo no se distribuye para CUDA ni para pipelines tipo PyTorch GPU.
- **Opciones de despliegue**: runtime `speech-swift` (rama `feat/pocket-tts` en la revisión indicada), CLI `speech speak` y CoreML. No se proporcionan instrucciones para vLLM, llama.cpp, Ollama o TGI.
- **Latencia y throughput**: primer PCM en 78,9 ms y síntesis completa de 2,8 s de audio en 943,4 ms, con RTF 0,337 en Apple M5 Pro CPU-only. No hay mediciones publicadas en iPhone.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / cache | Idioma / voz | Cuantizacion | Formato | Licencia | Despliegue |
|---|---:|---|---|---|---|---|---|
| aufklarer/Pocket-TTS-100M-CoreML-INT8 | 100 M | 512 posiciones, 6 capas | Inglés / Alba | INT8 + FP16 | CoreML `.mlmodelc` | CC BY 4.0 | CPU Apple, speech-swift |
| kyutai/pocket-tts (modelo base) | 100 M | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| FluidInference/pocket-tts-coreml (conversión de referencia) | 100 M | no disponible | Inglés (`v2.1/english/`) | no disponible | CoreML | no disponible | CoreML |

La comparativa se limita a la cadena modelo base y conversión de referencia porque no se han proporcionado datos de otros modelos TTS comparables. No hay cifras de benchmarks cruzados entre estas variantes.

## Limitaciones y advertencias

- Solo admite inglés y la voz fija Alba; no hay clonación de voz, control de velocidad ni carga de paquetes multilingües.
- El texto de entrada está limitado a 4.096 caracteres y se divide en torno a un objetivo de 50 tokens.
- Si se alcanza el límite de generación o de caché, el runtime lanza una excepción en lugar de devolver éxito con la última palabra recortada.
- Cada stream exitoso termina con un marcador vacío final; una cancelación o un fallo termina el stream con error y el audio ya entregado queda como parcial.
- El modelo está atado a CoreML y a plataformas Apple; no hay soporte CUDA ni datos de rendimiento en iPhone.
- No se han publicado evaluaciones de sesgos, prosodia o preferencia de oyentes; el round trip ASR se limita a 12 frases y no garantiza inteligibilidad general.
- Puede producir pronunciaciones incorrectas en nombres propios, siglas o vocabulario especializado; no hay evaluación específica de estos casos.
- La licencia CC BY 4.0 permite uso comercial con atribución; al redistribuir deben conservarse los créditos a Kyutai, FluidInference y Alba MacKenna, y revisarse `NOTICE` y `LICENSE`.
- No es un modelo de lenguaje general: no sirve para tool calling, agentes, razonamiento multi-paso ni generación de texto libre.

## Enlaces

- https://huggingface.co/aufklarer/Pocket-TTS-100M-CoreML-INT8
- https://huggingface.co/kyutai/pocket-tts
- https://huggingface.co/FluidInference/pocket-tts-coreml
- https://huggingface.co/kyutai/tts-voices#alba-mackenna
- https://github.com/soniqo/speech-swift
- https://github.com/soniqo/speech-swift/tree/8d017715d8143cd3149254f9e3c6c25a88869fde
- https://github.com/soniqo/speech-swift/blob/8d017715d8143cd3149254f9e3c6c25a88869fde/docs/benchmarks/pocket-tts.md
- https://soniqo.audio/getting-started
- https://soniqo.audio/guides/pocket-tts
- https://soniqo.audio/speech-studio
- https://soniqo.audio
- https://soniqo.audio/blog
