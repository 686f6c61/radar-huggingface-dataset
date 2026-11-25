# NamaRL/siren-models

## Resumen

Project Siren es un paquete de ejecución (bundle) para un asistente de voz bilingüe inglés-swahili que funciona íntegramente en local sobre teléfonos Android de 4 GB de RAM con arquitectura `arm64-v8a`. No se trata de un único modelo de lenguaje, sino de un conjunto de siete artefactos verificados que cubren la cadena completa de voz: detección de actividad de voz (VAD), reconocimiento de habla (STT), razonamiento con salida estructurada y síntesis de voz (TTS) con cuatro voces. Lo desarrolla NamaRL y se publica bajo licencia Apache 2.0.

El componente de razonamiento es `sema-gemma3-270m-expd-q8_0.gguf`, una variante de Gemma 3 de 270 millones de parámetros cuantizada en GGUF Q8_0, mientras que el reconocimiento de voz se apoya en una versión bilingüe de Whisper Base convertida a `sherpa-onnx` en INT8 y la síntesis en un modelo Piper VITS de cuatro voces. El interés actual reside en que demuestra una cadena de voz completamente offline con un techo de memoria de aproximadamente 900 MB de RSS pico, algo poco habitual en despliegues móviles de bajo coste.

El repositorio ocupa 0,5 GB y los pesos en formato safetensors suman 268.098.176 parámetros. La propuesta encaja en escenarios de conectividad intermitente o nula, donde enviar audio a la nube no es viable por coste, latencia o privacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bundle multi-componente: Silero VAD (ONNX), Whisper Base bilingüe (encoder-decoder Transformer, sherpa-onnx INT8), Gemma 3 270M (Transformer decoder-only, GGUF Q8_0), Piper VITS (TTS) |
| Parametros totales | 268.098.176 (pesos safetensors del repositorio) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 (razonamiento), ONNX INT8 (STT), ONNX FP32 (TTS), ONNX (VAD) |
| Idiomas soportados | inglés (en), swahili (sw) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, ONNX (con ficheros auxiliares `.onnx.json`, `base-tokens.txt`, `manifest.json`) |

## Arquitectura y entrenamiento

El bundle combina cuatro etapas especializadas. La detección de voz usa `silero_vad.onnx` (0,61 MB) con endpointing y cancelación de interrupción a mitad de frase en un máximo de 4,91 ms. El reconocimiento de voz emplea un Whisper Base bilingüe inglés-swahili exportado a `sherpa-onnx` en INT8 (`base-encoder.int8.onnx` y `base-decoder.int8.onnx`, 152,47 MB en total) con un vocabulario propio en `base-tokens.txt`. El razonamiento recae en `sema-gemma3-270m-expd-q8_0.gguf` (285,86 MB), una variante de Gemma 3 de 270M en Q8_0. La síntesis usa un Piper VITS FP32 de cuatro voces (`siren-4voice-bilingual-medium.onnx`, 73,49 MB) con su configuración asociada.

No se detallan en la información disponible los volúmenes de datos de entrenamiento, la composición del corpus, ni si hubo ajuste por RLHF o DPO. Tampoco se especifican innovaciones de decodificación más allá de la propia integración de la cadena y de la restricción de memoria. El dato diferencial es de ingeniería: el conjunto completo ocupa 513,26 MB repartidos en siete ficheros y está diseñado para no superar los 900 MB de RSS pico.

## Capacidades

- Reconocimiento de voz bilingüe inglés-swahili con Whisper Base en INT8, con una tasa de error de palabra del 34,13 % en swahili según la model card.
- Detección de actividad de voz con endpointing y barge-in a mitad de frase (cancelación en un máximo de 4,91 ms).
- Razonamiento y generación de texto con Gemma 3 270M en Q8_0, con salida JSON estructurada válida al 100 % y anclaje a herramientas (tool grounding).
- Síntesis de voz con cuatro voces (`af_heart`, `af_sky`, `am_puck`, `am_onyx`), todas con cobertura de inglés y swahili.
- Ejecución completamente offline en Android `arm64-v8a` con 4 GB de RAM.
- Integración mediante manifiesto remoto (`manifest.json`) que la app Siren descarga e instala.
- Soporte de conversación multiturno dentro del arnés de voz del proyecto.

## Casos de uso

- Asistente de voz offline en Android de gama baja: la cadena completa (VAD, STT, razonamiento, TTS) cabe en 4 GB de RAM y no requiere red, lo que permite desplegarlo en dispositivos sin conectividad fiable.
- Atención al ciudadano en zonas con conectividad intermitente: el reconocimiento y la síntesis bilingües inglés-swahili permiten atender consultas básicas sin enviar audio a servidores externos.
- Automatización de tareas por voz con salida estructurada: el modelo de razonamiento genera JSON válido con anclaje a herramientas, lo que facilita encadenar acciones (consultas, recordatorios, comandos) desde la voz.
- Privacidad y cumplimiento: al procesar el audio íntegramente en el dispositivo, se evita la transmisión de datos personales y se simplifica el cumplimiento de normativas de protección de datos.
- Pruebas de concepto de asistentes conversacionales: el manifiesto descargable permite integrar el bundle en una app Android y validar la cadena de voz sin entrenar modelos propios.
- Investigación en reconocimiento de voz de bajos recursos: la variante bilingüe de Whisper Base con métricas publicadas de WER en swahili sirve como referencia para experimentos de adaptación lingüística.
- Kioscos o terminales de voz en entornos sin cobertura: el diseño offline y el bajo consumo de memoria permiten desplegar el asistente en hardware embebido o terminales fijos.

## Benchmarks y rendimiento

| Metrica | Componente | Valor |
|---|---|---|
| WER en swahili | Whisper Base bilingüe (sherpa-onnx INT8) | 34,13 % |
| JSON estructurado válido | Gemma 3 270M Q8_0 | 100 % |
| Cancelación de barge-in | Silero VAD | máximo 4,91 ms |
| RTF de TTS (CPU) | Piper VITS 4 voces | 0,184x–0,272x (3,7x–5,4x más rápido que tiempo real) |
| RSS pico de STT | Whisper Base INT8 | ~390,66 MB |
| RSS pico de razonamiento | Gemma 3 270M Q8_0 | ~420,83 MB |
| RSS pico total del bundle | Cadena completa | ≤ 900 MB |

No se han publicado resultados de benchmarks de razonamiento (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el bundle completo está diseñado para un techo de 900 MB de RSS pico; el STT consume ~390,66 MB y el razonamiento ~420,83 MB.
- Dispositivos objetivo: teléfonos Android `arm64-v8a` con 4 GB de RAM.
- GPU recomendadas: no aplica; el diseño está orientado a CPU móvil. No se especifican requisitos de GPU de escritorio.
- Cabe en GPU de consumo: no disponible (el bundle está pensado para CPU móvil).
- Opciones de despliegue: app Siren para Android mediante manifiesto remoto; componentes en ONNX (sherpa-onnx, Piper) y GGUF (llama.cpp u otro runtime compatible con GGUF).
- Latencia y throughput: TTS con RTF de 0,184x–0,272x en CPU; cancelación de barge-in en un máximo de 4,91 ms; el resto de latencias no está disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Project Siren (NamaRL) | 268.098.176 (bundle) | no disponible | en, sw | Apache 2.0 | Cadena de voz offline para Android |
| Whisper Base (OpenAI) | ~74 M (solo STT) | no disponible | multilingüe | MIT | STT genérico, sin razonamiento ni TTS |
| Gemma 3 270M (Google) | 270 M | no disponible | multilingüe | Gemma Terms | LLM pequeño de propósito general |
| Piper VITS (Rhasspy) | no disponible | no aplica | multilingüe | MIT | TTS ligero para dispositivos |

La comparación es aproximada: Project Siren no compite como modelo único, sino como integración de componentes ya existentes bajo una restricción de memoria concreta.

## Limitaciones y advertencias

- La tasa de error de palabra en swahili (34,13 %) es alta y puede degradar la experiencia en conversaciones reales.
- El modelo de razonamiento es de 270 M de parámetros; su capacidad de razonamiento complejo y conocimiento factual es limitada frente a modelos mayores.
- Riesgo de alucinación en las respuestas del componente de razonamiento, especialmente con salida estructurada cuando la consulta queda fuera del dominio previsto.
- Solo se declaran dos idiomas (inglés y swahili); no hay soporte de castellano.
- No se especifican la longitud de contexto ni los datos de entrenamiento, lo que dificulta evaluar su robustez en dominios específicos.
- El despliegue está orientado a Android `arm64-v8a`; no se documentan rutas de despliegue para servidor o escritorio.
- Aunque la licencia es Apache 2.0, conviene verificar las licencias de los componentes subyacentes (Gemma 3, Whisper, Piper) antes de un uso comercial.
- El repositorio registra 0 descargas en el momento de la consulta, por lo que la validación comunitaria es inexistente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/NamaRL/siren-models
- Manifiesto del bundle: https://huggingface.co/NamaRL/siren-models/resolve/main/manifest.json
