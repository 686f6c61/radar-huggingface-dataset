# Phoonnx/fastpitch-en_us-ljspeech

## Resumen

fastpitch-en_us-ljspeech es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura FastPitch, desarrollado originalmente por Coqui y empaquetado en formato ONNX por Phoonnx para su uso con la librería phoonnx. El modelo convierte texto en inglés estadounidense, representado como fonemas gruut en alfabeto IPA, en un espectrograma mel que posteriormente es transformado en audio por el vocoder hifigan-en_us-ljspeech-v2, empaquetado junto con la voz.

El modelo está entrenado sobre el corpus LJSpeech, un conjunto de datos de dominio público compuesto por grabaciones de una única hablante femenina en inglés. FastPitch es una arquitectura de síntesis no autorregresiva basada en transformer que permite control explícito de la duración fonémica, lo que se traduce en una síntesis rápida y determinista, adecuada para despliegue en entornos con requisitos de latencia ajustados.

Su relevancia actual radica en que ofrece una alternativa ligera y con licencia Apache 2.0 para TTS en inglés, distribuida como ONNX (0,2 GB de repositorio), lo que facilita su integración en aplicaciones Python y en el asistente de voz OVOS mediante el plugin ovos-tts-plugin-phoonnx, sin depender de frameworks de deep learning pesados en tiempo de ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastPitch (síntesis TTS no autorregresiva basada en transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | en-US (inglés estadounidense) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut, alfabeto IPA |
| Vocoder | hifigan-en_us-ljspeech-v2 |
| Tamano del repositorio | 0,2 GB |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

FastPitch es una arquitectura de síntesis de voz no autorregresiva que combina un encoder transformer con un predictor de duración y un decoder que genera el espectrograma mel. A diferencia de los modelos autorregresivos tipo Tacotron, FastPitch predice la duración de cada fonema de forma explícita, lo que permite paralelizar la generación y controlar el ritmo del habla. El modelo original fue entrenado por Coqui sobre el corpus LJSpeech y publicado en la release v0.6.1 de Coqui TTS.

La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset más allá de LJSpeech, ni si se aplicaron técnicas de RLHF o DPO (habitualmente ausentes en modelos TTS de esta generación). La innovación destacable es el empaquetado en ONNX para la librería phoonnx, que separa la generación del espectrograma (este modelo) de la conversión a audio (el vocoder HiFi-GAN), y utiliza scriptconv con el fonemizador GruutPhonemizer para normalizar el texto y convertirlo a fonemas IPA antes de la inferencia.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense (en-US).
- Generación de espectrogramas mel a partir de secuencias de fonemas IPA.
- Control implícito de duración fonémica gracias al predictor de duración de FastPitch.
- Integración con el vocoder HiFi-GAN para producir audio WAV final.
- Normalización de texto y fonemización mediante scriptconv con GruutPhonemizer.
- Uso como plugin de TTS en OVOS mediante ovos-tts-plugin-phoonnx.
- No soporta tool calling, function calling, agentes, visión, audio de entrada ni modo de razonamiento; es un modelo exclusivamente TTS.
- Capacidad multilingüe limitada al inglés estadounidense.

## Casos de uso

- Asistente de voz en OVOS: el modelo se integra como plugin ovos-tts-plugin-phoonnx y se selecciona en mycroft.conf, permitiendo respuestas habladas en inglés con una voz femenina consistente del corpus LJSpeech.
- Síntesis por lotes de audiolibros o artículos: al ser un modelo no autorregresivo, puede procesar frases de forma paralela y generar WAV mediante voice.synthesize_wav, adecuado para pipelines de conversión de texto a audio a gran escala.
- Lectura de notificaciones y alertas en aplicaciones de escritorio: la distribución ONNX de 0,2 GB permite empaquetar el modelo junto con la aplicación sin depender de PyTorch en tiempo de ejecución.
- Generación de avisos para sistemas de megafonía o IVR en inglés: la salida determinista y la baja latencia de FastPitch facilitan la producción de mensajes pregrabados bajo demanda.
- Pruebas de accesibilidad y lectores de pantalla: el modelo puede servir como motor TTS local para narrar contenido en inglés en herramientas de accesibilidad.
- Investigación y evaluación de TTS: al estar empaquetado en ONNX y con el vocoder separado, es útil como referencia para comparar calidad de espectrogramas y vocoders en experimentos académicos.
- Prototipado de interfaces conversacionales: la API de phoonnx (TTSModelManager, merge_default_voices) permite integrar la voz coqui/en-ljspeech-fast_pitch en demos de asistentes sin infraestructura GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,2 GB en ONNX, por lo que la huella de memoria es reducida y compatible con CPU.
- GPU recomendadas: no se especifican en la información disponible; por el tamaño del modelo, es viable en GPUs de consumo como RTX 3060 o superiores, aunque no hay datos oficiales.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del repositorio, aunque no se confirma en la documentación.
- Opciones de despliegue: phoonnx (Python), plugin ovos-tts-plugin-phoonnx para OVOS; el formato ONNX permite usar ONNX Runtime.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto / notas |
|---|---|---|---|---|---|
| fastpitch-en_us-ljspeech (este) | FastPitch + HiFi-GAN | en-US | ONNX | Apache 2.0 | Empaquetado para phoonnx, 0,2 GB |
| tts_models--en--ljspeech--fast_pitch (Coqui original) | FastPitch | en-US | PyTorch (checkpoint) | Apache 2.0 | Modelo upstream de Coqui TTS v0.6.1 |
| hifigan-en_us-ljspeech-v2 (Phoonnx) | HiFi-GAN (vocoder) | en-US | ONNX | no disponible | Vocoder complementario, no es un TTS completo |

No se dispone de datos de benchmarks ni de otros modelos TTS comparables en la información proporcionada para establecer una comparación cuantitativa de calidad o rendimiento.

## Limitaciones y advertencias

- El modelo solo sintetiza voz en inglés estadounidense; no admite otros idiomas.
- Está entrenado sobre LJSpeech, con una única hablante femenina, por lo que la diversidad de voces es nula.
- No se han publicado métricas de calidad (MOS, intelligibility) ni benchmarks en la información disponible.
- Riesgo de errores de pronunciación en palabras fuera del dominio del corpus o en tecnicismos no cubiertos por el fonemizador gruut.
- La calidad final depende del vocoder hifigan-en_us-ljspeech-v2, que se descarga junto con la voz.
- Aunque la licencia declarada es Apache 2.0, la model card indica que la licencia proviene de la lista de modelos de Coqui TTS; conviene verificar los términos upstream antes de uso comercial.
- El modelo requiere la instalación de phoonnx en versión pre-release (pip install --pre phoonnx) y el extra scriptconv[gruut], lo que puede implicar dependencias en evolución.
- No es adecuado para tareas de razonamiento, generación de texto, código o visión; su alcance es exclusivamente TTS.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/fastpitch-en_us-ljspeech
- Modelo upstream (Coqui TTS v0.6.1): https://github.com/coqui-ai/TTS/releases/download/v0.6.1_models/tts_models--en--ljspeech--fast_pitch.zip
- Vocoder: https://huggingface.co/Phoonnx/hifigan-en_us-ljspeech-v2
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección FastPitch de Phoonnx: https://huggingface.co/collections/Phoonnx/fastpitch-6af8ea827005c1385348ed60
