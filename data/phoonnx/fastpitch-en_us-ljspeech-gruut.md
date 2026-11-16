# Phoonnx/fastpitch-en_us-ljspeech-gruut

## Resumen

FastPitch-en_us-ljspeech-gruut es un modelo de síntesis de voz (text-to-speech) de tipo acústico, es decir, un modelo que transforma texto en un espectrograma mel que posteriormente debe ser convertido a audio por un vocoder. El modelo original fue entrenado por Coqui a partir de la arquitectura FastPitch y el corpus LJSpeech en inglés estadounidense, y esta versión concreta ha sido empaquetada en formato ONNX por Phoonnx para su uso con su librería de inferencia `phoonnx`.

La relevancia de esta ficha radica en que se trata de un artefacto de despliegue, no de un modelo entrenado desde cero: el valor está en la conversión a ONNX y en la integración con el front-end fonémico `gruut` (alfabeto IPA) y con el vocoder HiFi-GAN v2 del mismo autor. Esto permite ejecutar TTS en entornos sin PyTorch, incluidos dispositivos de bajos recursos y asistentes de voz basados en OVOS/Mycroft.

El modelo es monolingüe (inglés `en-US`), de una sola voz (LJSpeech, voz femenina de un único hablante), con licencia Apache 2.0 y un tamaño de repositorio de 0,2 GB. No se dispone de datos publicados sobre número de parámetros, longitud de contexto ni benchmarks en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastPitch (modelo acústico text-to-spectrogram) + vocoder HiFi-GAN v2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de contexto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | inglés (`en`, `en-US`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut (alfabeto IPA) |
| Vocoder asociado | `hifigan-en_us-ljspeech-v2` |
| Voz | única (LJSpeech, un solo hablante) |
| Tamaño del repositorio | 0,2 GB |
| Librería de inferencia | `phoonnx` (Python y OVOS) |

## Arquitectura y entrenamiento

FastPitch es una arquitectura de síntesis acústica no autoregresiva basada en Transformer que predice un espectrograma mel a partir de una secuencia de fonemas, con un módulo de predicción de duración que permite controlar el ritmo. El modelo original fue entrenado por Coqui sobre el corpus LJSpeech (audiolibros en inglés de un único hablante femenino) y se distribuye en el release v0.6.1 de Coqui TTS. Esta versión de Phoonnx reproduce esos pesos en ONNX y los acompaña del vocoder HiFi-GAN v2, que convierte el espectrograma en forma de onda.

No se dispone en la información proporcionada de detalles sobre número de tokens de entrenamiento, composición exacta del dataset, ni sobre si hubo ajuste por RLHF/DPO (no aplicable habitualmente en TTS). La innovación técnica relevante aquí es el empaquetado ONNX y la integración del front-end `scriptconv` con el fonemizador `GruutPhonemizer`, que normaliza el texto y lo convierte a fonemas IPA antes de la inferencia.

## Capacidades

- Síntesis de voz en inglés estadounidense a partir de texto plano.
- Generación de espectrogramas mel que requieren un vocoder externo (HiFi-GAN v2) para producir audio.
- Control de duración y prosodia implícito en la arquitectura FastPitch (predicción de duraciones por fonema).
- Fonemización mediante `gruut` en alfabeto IPA, con normalización de texto previa vía `scriptconv`.
- Salida en fichero WAV mediante `voice.synthesize_wav()`.
- Integración como plugin de TTS en OVOS/Mycroft (`ovos-tts-plugin-phoonnx`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- No es multilingüe: únicamente inglés `en-US`.

## Casos de uso

- Asistentes de voz embebidos: el modelo se integra como plugin de OVOS/Mycroft y permite sintetizar respuestas en inglés en dispositivos domésticos sin depender de servicios en la nube, gracias al formato ONNX y a su reducido tamaño (0,2 GB).
- Lectura de textos largos en inglés: la arquitectura FastPitch con predicción de duraciones permite generar narraciones con prosodia razonable a partir de texto plano, útil para audiolibros o accesibilidad.
- Síntesis en entornos sin PyTorch: al estar empaquetado en ONNX, puede ejecutarse con runtimes ligeros (ONNX Runtime) en contenedores o dispositivos con recursos limitados.
- Generación de avisos y notificaciones por voz: para sistemas de alertas o domótica que necesiten locuciones cortas en inglés con baja latencia.
- Pruebas de pipelines TTS: sirve como referencia para validar cadenas texto → fonemas (gruut) → espectrograma → vocoder (HiFi-GAN) antes de sustituir por modelos más grandes.
- Prototipado de interfaces conversacionales: permite montar un prototipo de asistente en inglés con una única voz y sin coste de licencia, al ser Apache 2.0.
- Evaluación de vocoders: al separar modelo acústico y vocoder, es útil para comparar el impacto del vocoder HiFi-GAN v2 frente a alternativas sobre el mismo espectrograma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño del repositorio (0,2 GB) se trata de un modelo ligero que probablemente cabe en CPU.
- GPU recomendadas: no disponible; al ser ONNX y de pequeño tamaño, es viable en CPU y en GPUs consumer, aunque no se especifican modelos concretos.
- ¿Cabe en GPU consumer? No se dispone de datos oficiales, pero el tamaño del artefacto sugiere que sí en la mayoría de GPUs consumer.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft, y ONNX Runtime de forma directa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Vocoder | Licencia | Formato | Tamaño repo |
|---|---|---|---|---|---|---|
| Phoonnx/fastpitch-en_us-ljspeech-gruut | FastPitch + HiFi-GAN v2 | en-US | HiFi-GAN v2 | Apache 2.0 | ONNX | 0,2 GB |
| Coqui TTS `tts_models--en--ljspeech--fast_pitch` (upstream) | FastPitch | en-US | HiFi-GAN (incluido en el paquete) | Apache 2.0 | PyTorch | no disponible |
| Otros modelos FastPitch empaquetados por Phoonnx (colección) | FastPitch | variable | HiFi-GAN v2 | Apache 2.0 | ONNX | variable |
| VITS / modelos TTS end-to-end | VITS | variable | integrado | variable | variable | no disponible |

La comparación se limita a lo documentado; no se dispone de datos de benchmarks ni de parámetros para establecer diferencias cuantitativas con alternativas.

## Limitaciones y advertencias

- Modelo monolingüe: solo inglés `en-US`; no admite otros idiomas.
- Una única voz (LJSpeech, hablante femenina); no hay control de hablante ni clonación.
- Requiere un vocoder externo (HiFi-GAN v2) para producir audio; el modelo por sí solo genera espectrogramas.
- Depende del front-end `gruut` y de `scriptconv` para la fonemización; errores en la normalización de texto afectan a la calidad.
- Riesgo de prosodia artificial o pronunciación incorrecta en nombres propios, siglas y dominios especializados.
- No es un modelo generativo de texto: no aplican riesgos de alucinación textual, pero sí posibles artefactos acústicos.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia de los pesos originales de Coqui y del corpus LJSpeech (dominio público en su mayoría).
- No se dispone de información sobre sesgos demográficos o acústicos del corpus LJSpeech más allá de su carácter de un solo hablante.
- El modelo es de 2021 (release v0.6.1 de Coqui) y puede estar por detrás de arquitecturas TTS más recientes en naturalidad.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/fastpitch-en_us-ljspeech-gruut
- Modelo original Coqui: https://github.com/coqui-ai/TTS/releases/download/v0.6.1_models/tts_models--en--ljspeech--fast_pitch.zip
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección FastPitch de Phoonnx: https://huggingface.co/collections/Phoonnx/fastpitch-6af8ea827005c1385348ed60
- Vocoder HiFi-GAN v2: https://huggingface.co/Phoonnx/hifigan-en_us-ljspeech-v2
