# Phoonnx/glowtts-en_us-cmu_clb-gruut

## Resumen

GlowTTS-en_us-cmu_clb-gruut es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura Glow-TTS, originalmente desarrollado por Rhasspy dentro del proyecto Larynx y reempaquetado por Phoonnx en formato ONNX para su uso con la librería `phoonnx`. El modelo genera espectrogramas a partir de fonemas IPA en inglés estadounidense (`en-US`) y delega la síntesis final de audio en el vocoder HiFi-GAN `hifigan-multi-vctk-small`, que se descarga automáticamente junto con la voz.

Se trata de un modelo ligero (el repositorio ocupa aproximadamente 0,1 GB) orientado a entornos de asistencia por voz de baja latencia, como OVOS/Mycroft, donde se integra mediante el plugin `ovos-tts-plugin-phoonnx`. No es un modelo de lenguaje generativo ni un sistema multimodal: es un componente especializado de un pipeline TTS con front-end fonémico basado en `gruut` y una voz concreta (`cmu_clb`) del conjunto original de Larynx.

Su relevancia actual radica en que permite desplegar síntesis de voz en inglés en hardware modesto y en entornos embebidos, con una integración directa en asistentes de voz open source. La licencia no está registrada en el repositorio, por lo que la evaluación legal para uso comercial queda pendiente de verificación en la release original de Rhasspy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (modelo acústico generativo basado en flujos) + vocoder HiFi-GAN (`hifigan-multi-vctk-small`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; entrada por frase, no por contexto largo) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | en-US |
| Licencia | other (sin licencia registrada en el repositorio; verificar upstream) |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Vocoder asociado | hifigan-multi-vctk-small |
| Tamano del repositorio | ~0,1 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

Glow-TTS es un modelo acústico de síntesis de voz que combina flujos normalizadores invertibles con una alineación monotónica aprendida (monotonic alignment search) para convertir secuencias de fonemas en espectrogramas mel. A diferencia de los modelos autorregresivos tipo Tacotron, Glow-TTS permite síntesis paralela, lo que reduce la latencia de generación del espectrograma. En este caso, el modelo se distribuye como grafo ONNX y se acompaña del vocoder HiFi-GAN `hifigan-multi-vctk-small`, que transforma el espectrograma en forma de onda de audio.

El modelo procede de la release v1.0 de Larynx de Rhasspy (`en-us_cmu_clb-glow_tts.tar.gz`), un proyecto de TTS orientado a asistentes de voz. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de ajuste como RLHF o DPO (no aplicables habitualmente en TTS). Tampoco se especifican innovaciones adicionales más allá de las propias de Glow-TTS y del front-end fonémico `gruut`.

## Capacidades

- Síntesis de voz en inglés estadounidense (`en-US`) a partir de texto plano, con normalización y conversión a fonemas IPA mediante `scriptconv` y `GruutPhonemizer`.
- Generación de espectrogramas mel y conversión a audio WAV mediante el vocoder HiFi-GAN empaquetado.
- Integración con la librería `phoonnx` para Python (`TTSModelManager`, `voice.synthesize_wav`).
- Integración con asistentes de voz OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en formato ONNX, apta para despliegue en CPU y entornos con recursos limitados.
- No soporta tool calling, function calling, razonamiento multi-paso, visión ni audio de entrada.
- No es un modelo multilingüe: únicamente cubre `en-US`.

## Casos de uso

- Asistentes de voz locales (OVOS/Mycroft): el modelo se selecciona como voz en `mycroft.conf` mediante `ovos-tts-plugin-phoonnx` y proporciona respuestas habladas en inglés sin depender de servicios en la nube.
- Lectura de notificaciones y alertas en sistemas domóticos: al ser un modelo ligero en ONNX, puede sintetizar mensajes cortos en tiempo real en dispositivos de bajos recursos.
- Síntesis de voz en aplicaciones de accesibilidad: conversión de texto a audio para lectores de pantalla en inglés, con latencia baja gracias a la generación paralela de Glow-TTS.
- Generación de audiolibros o contenido narrado por lotes: el pipeline permite sintetizar frases de forma secuencial y guardar WAVs, adecuado para volúmenes moderados en CPU.
- Pruebas y desarrollo de pipelines TTS: sirve como voz de referencia para validar integraciones con `phoonnx` y `scriptconv` antes de desplegar otras voces de la colección Glow-TTS.
- Prototipado de interfaces conversacionales en inglés: permite construir demos de agentes de voz sin coste de API, usando el front-end `gruut` para normalizar texto y fonemas.
- Investigación en TTS: al estar empaquetado en ONNX con una arquitectura conocida, facilita experimentos de comparación de vocoders o de front-ends fonémicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio completo ocupa ~0,1 GB, por lo que la huella de memoria es reducida y compatible con ejecución en CPU.
- GPU recomendadas: no se especifican; al ser un modelo ONNX pequeño, puede ejecutarse en CPU y en GPUs de consumo sin requisitos especiales.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del repositorio, aunque no se proporcionan cifras oficiales.
- Opciones de despliegue: `phoonnx` (Python) y `ovos-tts-plugin-phoonnx` en OVOS/Mycroft; el formato ONNX permite otros runtimes compatibles, aunque no se documentan en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto / entrada |
|---|---|---|---|---|---|
| glowtts-en_us-cmu_clb-gruut | Glow-TTS + HiFi-GAN | en-US | ONNX | other (sin registrar) | Fonemas IPA por frase |
| Otras voces de la colección Glow-TTS de Phoonnx | Glow-TTS + HiFi-GAN | variable | ONNX | variable | Fonemas IPA por frase |
| Modelos TTS de referencia (p. ej. Piper, Coqui TTS) | variable (VITS, FastSpeech, etc.) | variable | ONNX / otros | variable | Texto o fonemas |

No se dispone de datos de benchmarks ni de parámetros comparables para establecer una comparación cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- La licencia figura como `other` y no está registrada en el repositorio; es imprescindible verificar la licencia de la release original de Rhasspy antes de cualquier uso comercial.
- El modelo solo soporta `en-US`; no cubre otros idiomas ni variantes regionales.
- La entrada debe ser texto en inglés que el front-end `gruut` pueda normalizar y fonemizar; textos con símbolos no soportados o idiomas distintos pueden producir una síntesis incorrecta.
- Al ser un modelo TTS y no un modelo de lenguaje, no razona ni genera contenido; su calidad depende del front-end fonémico y del vocoder asociado.
- No se documentan sesgos específicos, pero al derivar de un corpus de voz concreto (`cmu_clb`) puede heredar características de ese hablante y del dataset original.
- No se proporcionan métricas objetivas (MOS, latencia, throughput) que permitan garantizar calidad en producción.
- El repositorio tiene un uso muy reducido (19 descargas), por lo que la validación comunitaria es escasa.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/glowtts-en_us-cmu_clb-gruut)
- [Release original de Larynx (Rhasspy)](https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_cmu_clb-glow_tts.tar.gz)
- [Colección Glow-TTS de Phoonnx](https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3)
- [Vocoder hifigan-multi-vctk-small](https://huggingface.co/Phoonnx/hifigan-multi-vctk-small)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
