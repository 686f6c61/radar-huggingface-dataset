# Phoonnx/glowtts-en_us-cmu_rxr

## Resumen

glowtts-en_us-cmu_rxr es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura Glow-TTS, originalmente desarrollado por Rhasspy dentro del proyecto Larynx y empaquetado posteriormente por Phoonnx para su uso con la librería ONNX `phoonnx`. El modelo convierte texto en inglés estadounidense en fonemas IPA mediante el fonemizador gruut, genera un espectrograma y lo transforma en audio con el vocoder HiFi-GAN (hifigan-multi-vctk-small).

Se trata de un modelo compacto (el repositorio ocupa 0,1 GB) orientado a síntesis de voz local y de baja latencia, pensado para integrarse en asistentes de voz como OVOS/Mycroft o en pipelines propios mediante Python. No es un modelo de lenguaje generativo: su única función es la conversión de texto a voz, sin capacidades de razonamiento, código ni tool calling.

Su relevancia actual radica en su formato ONNX, que facilita el despliegue en entornos sin GPU dedicada y su integración en sistemas de voz open source. La licencia no está registrada en el repositorio, lo que introduce incertidumbre para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Glow-TTS (flow-based, normalizing flow) + vocoder HiFi-GAN |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en-US (inglés estadounidense) |
| Licencia | other (sin licencia registrada; consultar upstream) |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Vocoder | hifigan-multi-vctk-small |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de síntesis de voz basado en normalizing flows que modela directamente la alineación entre fonemas y frames de espectrograma sin necesidad de un aligner externo, a diferencia de los sistemas TTS clásicos de dos etapas. El modelo genera un espectrograma mel que posteriormente es convertido a audio por el vocoder HiFi-GAN (variante multi-VCTK small).

El modelo original fue entrenado por Rhasspy como parte de Larynx v1.0. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o ajuste fino. La innovación práctica de este empaquetado es la exportación a ONNX y la integración con la librería `phoonnx` y el normalizador de texto `scriptconv`, que permite ejecutar el modelo en Python y en el ecosistema OVOS.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense (en-US).
- Conversión de texto a fonemas IPA mediante el fonemizador gruut.
- Generación de espectrogramas y conversión a audio WAV mediante vocoder HiFi-GAN.
- Integración con OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en formato ONNX, apta para entornos CPU.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües más allá del inglés estadounidense.
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- Asistentes de voz locales: integración en OVOS/Mycroft mediante `ovos-tts-plugin-phoonnx` para dotar de voz a un asistente doméstico sin depender de servicios en la nube, gracias a su formato ONNX y bajo peso (0,1 GB).
- Lectura de notificaciones y alertas: síntesis de mensajes cortos en sistemas embebidos o Raspberry Pi, donde el modelo cabe en memoria y se ejecuta en CPU.
- Accesibilidad: conversión de texto a voz para lectores de pantalla o aplicaciones de asistencia a personas con discapacidad visual, con latencia baja al no requerir GPU.
- Generación de audio para prototipos: creación rápida de locuciones en inglés para demos, vídeos o pruebas de producto sin coste de API.
- Pipelines de datos sintéticos: generación de pares texto-audio para entrenamiento o evaluación de otros sistemas de reconocimiento de voz en inglés.
- Automatización de respuestas habladas: integración en scripts Python que necesiten convertir texto dinámico a WAV, usando `TTSModelManager` y `synthesize_wav`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser un modelo de 0,1 GB en ONNX, es probable que funcione en CPU sin GPU, aunque no se especifican requisitos oficiales.
- GPU recomendadas: no disponible; no se requiere GPU dedicada para su ejecución según el formato ONNX.
- Compatibilidad con GPU de consumo: no confirmada, pero el tamaño reducido sugiere que cabría en cualquier GPU de consumo si se ejecuta con ONNX Runtime.
- Opciones de despliegue: `phoonnx` (Python), ONNX Runtime, plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Tamaño |
|---|---|---|---|---|---|
| glowtts-en_us-cmu_rxr | Glow-TTS + HiFi-GAN | en-US | ONNX | other (sin registrar) | 0,1 GB |
| Piper (rhasspy) | VITS | Multiidioma | ONNX | MIT | Variable |
| Coqui TTS (VITS) | VITS | Multiidioma | PyTorch | MPL 2.0 | Variable |
| Larynx (upstream) | Glow-TTS | Multiidioma | PyTorch | Consultar upstream | Variable |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Licencia no registrada: la model card indica explícitamente que no hay licencia registrada y recomienda consultar la release upstream antes de usarlo; esto supone un riesgo para uso comercial.
- Idioma limitado: solo inglés estadounidense (en-US); no soporta otros idiomas.
- Dependencia de fonemizador: requiere gruut y el alfabeto IPA para la entrada, lo que añade una dependencia externa (`scriptconv[gruut]`).
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero puede producir pronunciaciones incorrectas en palabras fuera de vocabulario o nombres propios.
- Sesgos: no se documentan sesgos específicos, pero al ser un modelo entrenado con un dataset concreto (Larynx v1.0), puede reflejar las características de la voz y el acento de dicho dataset.
- Sin benchmarks publicados: no hay métricas objetivas de calidad (MOS, WER) en la información disponible.
- Uso en producción: la falta de licencia clara y de garantías de soporte lo hacen poco adecuado para producción comercial sin revisión legal previa.

## Enlaces

- [Hugging Face: Phoonnx/glowtts-en_us-cmu_rxr](https://huggingface.co/Phoonnx/glowtts-en_us-cmu_rxr)
- [Upstream Larynx v1.0 (Rhasspy)](https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_cmu_rxr-glow_tts.tar.gz)
- [phoonnx (GitHub)](https://github.com/TigreGotico/phoonnx)
- [scriptconv (GitHub)](https://github.com/TigreGotico/scriptconv)
- [Colección Glow-TTS en Hugging Face](https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3)
- [Vocoder hifigan-multi-vctk-small](https://huggingface.co/Phoonnx/hifigan-multi-vctk-small)
