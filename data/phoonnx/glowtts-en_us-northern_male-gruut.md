# Phoonnx/glowtts-en_us-northern_male-gruut

## Resumen

Glow-TTS en_us-northern_male-gruut es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura Glow-TTS, originalmente desarrollado por Rhasspy dentro del proyecto Larynx v1.0 y reempaquetado por Phoonnx en formato ONNX para su uso con la libreria `phoonnx`. El modelo genera espectrogramas a partir de fonemas IPA procesados por el fonemizador gruut, que posteriormente son convertidos a audio mediante el vocoder HiFi-GAN multi-VCTK small. Esta pensado para sintetizar voz masculina de ingles estadounidense con acento del norte.

El modelo resuelve la necesidad de disponer de un TTS ligero, ejecutable en local y compatible con el ecosistema OVOS (Open Voice OS), sin depender de servicios en la nube. Su tamano de repositorio (0,1 GB) y su formato ONNX lo hacen adecuado para despliegues en dispositivos con recursos limitados, como asistentes de voz embebidos o sistemas domoticos.

Es relevante ahora por su integracion directa con el plugin `ovos-tts-plugin-phoonnx` y por formar parte de la coleccion de modelos Glow-TTS empaquetados para phoonnx, lo que facilita su uso en pipelines de sintesis de voz dentro del ecosistema de asistentes open source. No obstante, la ausencia de una licencia registrada y su limitado numero de descargas (20) indican que es un artefacto de nicho orientado a usuarios del stack OVOS/Rhasspy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (modelo acustico generativo basado en normalizing flows) con vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no acepta contexto variable; procesa una frase por invocacion) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | ingles estadounidense (`en-US`), variante de acento del norte |
| Licencia | `other` (no se registra licencia concreta; consultar el release upstream de Rhasspy) |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Vocoder | hifigan-multi-vctk-small |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

Glow-TTS es un modelo acustico generativo que emplea normalizing flows para modelar la distribucion de espectrogramas mel condicionada por fonemas. A diferencia de los modelos autorregresivos como Tacotron 2, Glow-TTS permite sintesis paralela, lo que reduce la latencia de inferencia. El modelo original fue entrenado por Rhasspy dentro de Larynx v1.0 sobre un corpus de voz masculina de ingles estadounidense con acento del norte; no se dispone de informacion detallada sobre el numero de horas de audio, la composicion del dataset ni si se aplicaron tecnicas de RLHF o fine-tuning adicionales.

La innovacion principal de este empaquetado es la conversion a ONNX y su integracion con la libreria phoonnx, que gestiona la descarga del vocoder HiFi-GAN multi-VCTK small de forma conjunta con la voz. El front-end de texto se delega a la libreria `scriptconv`, que normaliza el texto y lo convierte a fonemas IPA mediante `GruutPhonemizer`. El modelo produce un espectrograma que el vocoder transforma en audio WAV. No se documentan tecnicas adicionales como decodificacion especulativa o atencion lineal, propias de modelos de lenguaje y no aplicables a este tipo de arquitectura TTS.

## Capacidades

- Sintesis de voz (text-to-speech) en ingles estadounidense con voz masculina y acento del norte.
- Conversion de texto a fonemas IPA mediante gruut, con normalizacion previa del texto por scriptconv.
- Generacion de audio WAV a partir de espectrogramas mel mediante el vocoder HiFi-GAN multi-VCTK small.
- Integracion con el ecosistema OVOS a traves del plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion local en formato ONNX, sin dependencia de servicios en la nube.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni vision: es exclusivamente un modelo TTS.
- Capacidad multilingue limitada a `en-US`; no se documentan otras lenguas.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx` y sintetiza las respuestas del asistente en ingles estadounidense sin enviar texto a servidores externos, lo que preserva la privacidad del usuario.
- Domotica y dispositivos embebidos: gracias a su tamano reducido (0,1 GB) y formato ONNX, puede ejecutarse en Raspberry Pi u otros dispositivos de recursos limitados para anuncios por voz de eventos del hogar.
- Lectura de notificaciones y alertas: integrado en scripts Python mediante `TTSModelManager`, permite convertir mensajes de sistema, correos o alertas en audio para aplicaciones de accesibilidad.
- Prototipado de interfaces conversacionales: investigadores pueden generar rapidamente audio de referencia para pruebas de usabilidad o evaluacion de sistemas de dialogo sin contratar servicios comerciales de TTS.
- Generacion de audiolibros o contenido narrado de dominio publico: la voz masculina del norte de EE. UU. es adecuada para narracion en ingles; la sintesis paralela de Glow-TTS reduce el tiempo de generacion frente a modelos autorregresivos.
- Educacion y aprendizaje de idiomas: permite generar ejemplos de pronunciacion en ingles estadounidense a partir de texto, util para materiales didacticos o aplicaciones de practica de escucha.
- Testing de pipelines de audio: sirve como fuente controlada de audio sintetico para validar sistemas de reconocimiento automatico del habla (ASR) o de diarizacion en entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por el tamano del repositorio (0,1 GB) y la naturaleza ONNX del modelo, la inferencia cabe holgadamente en GPUs consumer con 4 GB o menos, e incluso puede ejecutarse en CPU.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1050 en adelante, RTX 3060, RTX 4090) es suficiente; tambien es viable la ejecucion en CPU para sintesis de frases cortas.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer con al menos 2-4 GB de VRAM; tambien en dispositivos embebidos tipo Raspberry Pi mediante ONNX Runtime en CPU.
- Opciones de despliegue: ONNX Runtime a traves de la libreria `phoonnx`; integracion con OVOS mediante `ovos-tts-plugin-phoonnx`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a modelos TTS de este tipo.
- Latencia y throughput: no disponibles en la informacion proporcionada. La arquitectura Glow-TTS permite sintesis paralela, lo que en teoria reduce la latencia frente a modelos autorregresivos, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto / uso |
|---|---|---|---|---|---|
| Phoonnx glowtts-en_us-northern_male-gruut | Glow-TTS + HiFi-GAN | en-US (northern male) | ONNX | other (sin licencia registrada) | TTS por frase |
| Piper (rhasspy/piper-voices) | VITS | Multiples idiomas | ONNX | MIT (segun proyecto Piper) | TTS por frase, sucesor de Larynx |
| Coqui TTS (modelos VITS) | VITS / Tacotron 2 | Multiples idiomas | PyTorch / ONNX | MPL 2.0 (Coqui) | TTS por frase, framework completo |
| Rhasspy Larynx v1.0 (upstream) | Glow-TTS | en-US y otros | Tar.gz / PyTorch | Ver release upstream | TTS por frase, predecesor del empaquetado |

La comparativa se basa en caracteristicas generales de los proyectos mencionados; no se dispone de datos de rendimiento comparativo (MOS, latencia) en la informacion proporcionada. Piper es el sucesor natural de Larynx dentro del ecosistema Rhasspy y suele preferirse por su licencia MIT y su mayor catalogo de voces, mientras que este modelo se limita a una unica voz masculina de ingles estadounidense.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una voz unica masculina de ingles estadounidense del norte, no representa la diversidad de acentos, generos ni edades; su uso en produccion puede introducir sesgo de representacion.
- Riesgo de alucinacion: en TTS, el equivalente son artefactos acusticos, prosodia incorrecta o pronunciaciones erroneas en palabras fuera del dominio de entrenamiento; no se documenta una evaluacion formal de calidad (MOS).
- Limitaciones de contexto o idioma: unicamente soporta `en-US`; el texto debe pasar por el fonemizador gruut, por lo que entradas en otros idiomas o con caracteres no soportados pueden fallar o producir audio incorrecto.
- Restricciones de licencia: la licencia figura como `other` y la model card indica explicitamente que no se registra licencia para este modelo, recomendando consultar el release upstream de Rhasspy antes de usarlo. Esto supone un riesgo legal para uso comercial sin verificacion previa.
- Caveats para produccion: el modelo tiene solo 20 descargas y 0 likes, lo que sugiere poca validacion comunitaria; el repositorio se actualizo por ultima vez en noviembre de 2026 y no se garantiza mantenimiento. La dependencia de la version pre-release de `phoonnx` (`pip install --pre phoonnx`) implica que la API puede cambiar.
- Dependencia del vocoder: la calidad final depende del vocoder HiFi-GAN multi-VCTK small, que phoonnx descarga automaticamente; cualquier fallo en esa descarga impide la sintesis.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-northern_male-gruut
- Release upstream de Rhasspy Larynx v1.0: https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_northern_english_male-glow_tts.tar.gz
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Vocoder HiFi-GAN multi-VCTK small: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
