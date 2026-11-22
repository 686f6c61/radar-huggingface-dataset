# Phoonnx/vits-en_us-mike-medium-espeak

## Resumen

vits-en_us-mike-medium-espeak es una voz de síntesis de voz (text-to-speech) en inglés estadounidense basada en la arquitectura VITS del ecosistema Piper. La publica Phoonnx (TigreGotico Lda) como conversión a ONNX del modelo original de Rhasspy, `rhasspy/piper-voices/en/en_US/mike/medium`, una voz masculina de calidad media con fonemización mediante espeak-ng en el alfabeto IPA. El repositorio incluye tanto los grafos en fp32 como copias cuantizadas a int8, y el conjunto apenas ocupa 0,1 GB.

El modelo resuelve un problema muy concreto: ofrecer una voz TTS ligera, determinista y sin dependencias de GPU para entornos de asistencia por voz, domótica y agentes conversacionales que necesitan sintetizar frases cortas con baja latencia en CPU. Su integración principal es el motor phoonnx, que a su vez expone un plugin para OVOS (OpenVoiceOS), de modo que encaja en despliegues de asistentes locales sin conexión a servicios en la nube.

La relevancia actual es la de un componente de infraestructura más que la de un modelo de propósito general: no es un LLM ni procesa lenguaje, sino un sintetizador acústico de un solo hablante, 22.050 Hz, entrenado para leer fonemas espeak. Su licencia CC0 1.0 y su tamaño reducido (18,7 MB en int8) lo hacen utilizable en dispositivos de bajos recursos, aunque su calidad es la de una voz "medium" de Piper y su cobertura lingüística se limita al inglés de Estados Unidos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (Piper), exportada a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (TTS; entrada de fonemas, sin ventana de contexto) |
| Tipos de cuantización | fp32 y int8 (cuantización dinámica con onnxruntime.quantization.quantize_dynamic, pesos QInt8) |
| Idiomas soportados | en (en-US) |
| Licencia | CC0 1.0 |
| Formato de pesos | ONNX (`.onnx` y `_int8.onnx`) |
| Frecuencia de muestreo | 22.050 Hz |
| Hablantes | 1 (voz masculina "mike") |
| Fonemizador | espeak-ng, voz en-us, alfabeto IPA |
| Puntuación de cláusula | , . ! ? : ; (preservada desde phoonnx 1.96.1a1) |
| Tamaño del grafo | 63,2 MB (fp32) / 18,7 MB (int8) |
| Pico de RSS | 228,8 MB (fp32) / 180,6 MB (int8) |
| RTF (mediana de 3, 4 hilos) | 0,042 (fp32) / 0,091 (int8) |

## Arquitectura y entrenamiento

VITS es un modelo generativo condicional de extremo a extremo que combina un codificador de texto, un predictor de duración y alineamiento monotónico, un prior normalizante con flujo y un decodificador vocacional basado en HiFi-GAN, entrenado con pérdidas adversarias y de verosimilitud. La variante Piper simplifica y estandariza el pipeline para inferencia en CPU, tomando fonemas IPA como entrada en lugar de texto crudo, lo que exige un fonemizador externo (espeak-ng). En este repositorio los pesos se exportan a ONNX, lo que permite ejecución con onnxruntime sin framework de deep learning.

Según la model card, el modelo upstream fue ajustado (fine-tuning) a partir del modelo base `rdh` (calidad media, neerlandés de Bélgica, un hablante flamenco, CC0) con MRD y SDP, y requiere Piper 1.5 o superior. Los ajustes de inferencia por defecto son `noise_scale` 0,5 y `noise_w` 0,333. Los datos de entrenamiento concretos no están registrados en el upstream ("Training data: Not recorded upstream"), aunque la fuente citada es el conjunto de voces de OHF-Voice/voice-datasets bajo CC0. La conversión a ONNX no modifica los pesos; las copias int8 sí los cuantizan dinámicamente.

## Capacidades

- Síntesis de voz a partir de fonemas espeak-ng (IPA) para inglés estadounidense, con salida WAV a 22.050 Hz.
- Voz única masculina ("mike") de calidad media, adecuada para lectura de frases y párrafos cortos.
- Preservación de puntuación de cláusula (, . ! ? : ;) en la síntesis con phoonnx 1.96.1a1 y posteriores, lo que mejora el fraseo.
- Ejecución en CPU con onnxruntime; no requiere GPU.
- Dos variantes de precisión intercambiables (fp32 e int8) con validación de calidad mediante ASR.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx` y configuración por `mycroft.conf`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni otras modalidades: es exclusivamente un sintetizador TTS.
- No es multilingüe: solo en-US.

## Casos de uso

- Asistentes de voz locales en OVOS: la voz se selecciona como `piper/en_US-mike-medium` en `mycroft.conf` y sintetiza las respuestas del asistente en el propio dispositivo, sin enviar texto a la nube y con un RTF de 0,042 en fp32 sobre CPU de portátil.
- Domótica y anuncios por altavoz: con 18,7 MB en int8 y un pico de RSS de 180,6 MB, cabe en una Raspberry Pi o en un dispositivo embebido para leer estados, alarmas y notificaciones del hogar.
- Lectura de textos cortos en aplicaciones de accesibilidad: artículos, mensajes o avisos pueden convertirse a WAV en tiempo real en CPU, útil para lectores de pantalla en equipos sin GPU.
- Generación de avisos pregrabados en pipelines de CI: el modelo permite sintetizar de forma determinista locuciones para pruebas de integración de sistemas de voz, verificando que el audio generado no es silencioso y su duración es coherente.
- Prototipado de interfaces conversacionales: al integrarse con phoonnx y OVOS, sirve para validar flujos de diálogo multi-turno con una voz conocida antes de invertir en una voz de mayor calidad o en un proveedor comercial.
- Síntesis por lotes de contenido educativo o corporativo en inglés: frases y párrafos cortos pueden procesarse en serie con 4 hilos, con la ventaja de que la licencia CC0 no impone restricciones de atribución para el uso comercial del audio generado.

## Benchmarks y rendimiento

La model card no publica benchmarks de calidad tipo MMLU, HumanEval o GSM8K (no aplican a un TTS). Sí incluye una validación de calidad mediante ASR (nemo-parakeet-tdt-0.6b-v3 int8) sobre tres frases de FLORES-200 devtest:

| Métrica | fp32 | int8 |
|---|---|---|
| Resultado de la comprobación | pass | pass |
| WER | 0,000 | 0,000 |
| Caracteres por segundo | 19,1 a 21,0 | no disponible |
| Longitud int8 / fp32 | no aplica | 0,98 a 1,02 |
| Tamaño del grafo | 63,2 MB | 18,7 MB |
| Pico de RSS | 228,8 MB | 180,6 MB |
| RTF (mediana de 3, 4 hilos) | 0,042 | 0,091 |

Medido en un Intel Core i9-11900H a 2,50 GHz. El RTF es el tiempo de síntesis dividido por la duración del audio. La puerta de calidad de int8 exige audio finito y no silencioso, longitud entre 0,8 y 1,25 de la fp32 y un WER como máximo el de fp32 más 0,05.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es en CPU con onnxruntime.
- Memoria RAM: pico de RSS de 228,8 MB en fp32 y 180,6 MB en int8.
- GPU recomendadas: no aplica; no se documenta ejecución en GPU.
- Cabe en cualquier equipo de consumo: se ha medido en un Intel Core i9-11900H y su huella permite ejecutarlo en portátiles y placas de bajo consumo.
- Opciones de despliegue: phoonnx (con onnxruntime) como motor principal; integración con OVOS mediante `ovos-tts-plugin-phoonnx`; requiere espeak-ng instalado (o el port espyak incluido en `phoonnx[espeak]`, con posibles diferencias fonéticas).
- Latencia y throughput: RTF de 0,042 en fp32 y 0,091 en int8 con 4 hilos, es decir, la síntesis tarda entre el 4 % y el 9 % de la duración del audio generado.
- Almacenamiento: repositorio de 0,1 GB; grafo int8 de 18,7 MB.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamaño | Licencia | Notas |
|---|---|---|---|---|---|
| Phoonnx/vits-en_us-mike-medium-espeak | VITS (Piper) ONNX | en-US | 18,7 MB int8 / 63,2 MB fp32 | CC0 1.0 | Conversión ONNX con validación ASR y RTF medido |
| rhasspy/piper-voices (en_US/mike/medium) | VITS (Piper) | en-US | no disponible | CC0 1.0 | Modelo upstream original; requiere Piper 1.5+ |
| Otras voces Piper en_US de calidad media (p. ej. lessac-medium) | VITS (Piper) | en-US | no disponible | CC0 1.0 (según voz) | Mismo ecosistema; calidad y timbre distintos |
| Coqui TTS / VITS multihablante | VITS / otros | multilingüe | variable | variable (a menudo MPL o CC BY) | Mayor tamaño y requisitos; no comparable en huella |

No se dispone de datos de benchmarks comparativos entre estas voces en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés estadounidense; no sintetiza otros idiomas ni variantes regionales.
- Un único hablante masculino; no hay control de emoción, estilo ni prosodia más allá de la puntuación.
- Calidad "medium": inferior a voces de mayor tamaño o a TTS neuronales comerciales en naturalidad.
- Dependencia de espeak-ng: si se usa el port espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- No es un modelo de lenguaje: no razona, no responde preguntas ni soporta tool calling; cualquier uso conversacional requiere un LLM externo.
- Los datos de entrenamiento no están registrados en el upstream, lo que limita la auditoría de sesgos y cobertura lingüística.
- Riesgo de artefactos acústicos y de errores de pronunciación en nombres propios, siglas y palabras fuera del vocabulario fonético cubierto.
- Licencia CC0 1.0: permite uso comercial sin atribución obligatoria, aunque se recomienda acreditar a Rhasspy como autor original.
- La validación de calidad se basa en solo tres frases de FLORES-200 devtest; no constituye una evaluación exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-mike-medium-espeak
- Modelo upstream: https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/en/en_US/mike/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Datos de entrenamiento upstream: https://github.com/OHF-Voice/voice-datasets
