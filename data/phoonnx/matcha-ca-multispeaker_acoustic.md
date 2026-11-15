# Phoonnx/matcha-ca-multispeaker_acoustic

## Resumen

matcha-ca-multispeaker_acoustic es un modelo acústico de síntesis de voz (text-to-speech) basado en la arquitectura Matcha-TTS, desarrollado originalmente por Projecte AINA y empaquetado por Phoonnx en formato ONNX para su uso con la librería phoonnx. El modelo convierte fonemas del catalán (obtenidos mediante espeak-ng) en un espectrograma mel, que posteriormente debe ser transformado en audio por un vocoder externo (vocos-multi-alvocat-22khz o wavenext-ca-bsc_lt-22khz).

Se trata de un modelo multihablante especializado exclusivamente en catalán (`ca`), diseñado para integrarse en pipelines de TTS de dos etapas. Su relevancia radica en que ofrece una alternativa open source para síntesis de voz en catalán con empaquetado ONNX listo para producción, lo que facilita su despliegue en entornos con requisitos de portabilidad y en el ecosistema OpenVoiceOS (OVOS) mediante el plugin `ovos-tts-plugin-phoonnx`.

El repositorio es de pequeño tamaño (0,1 GB) y está publicado bajo licencia GPL-3.0, heredada del modelo upstream de Projecte AINA. No se dispone de información pública sobre el número de parámetros, la longitud de contexto ni los datos exactos de entrenamiento en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha-TTS (modelo acústico, no autoregresivo basado en flow matching) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | Catalán (`ca`) |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

Matcha-TTS es una arquitectura de síntesis de voz no autoregresiva basada en flow matching, que genera espectrogramas mel a partir de secuencias de fonemas. El modelo aquí empaquetado es únicamente el componente acústico: recibe fonemas en alfabeto IPA generados por espeak-ng y produce un espectrograma que debe ser convertido a audio por un vocoder separado (vocos-multi-alvocat-22khz o wavenext-ca-bsc_lt-22khz, ambos a 22 kHz).

El modelo original fue entrenado por Projecte AINA para el catalán con soporte multihablante. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino preferencial. El empaquetado por parte de Phoonnx consiste en la exportación a ONNX y la integración con la librería phoonnx, que gestiona la descarga del vocoder correspondiente junto con la voz.

## Capacidades

- Síntesis de voz (text-to-speech) en catalán a partir de texto de entrada.
- Soporte multihablante: el modelo puede generar voces de distintos hablantes (según el modelo upstream de Projecte AINA).
- Conversión de texto a fonemas mediante espeak-ng (alfabeto IPA) y normalización de texto a través de scriptconv.
- Generación de espectrogramas mel que requieren un vocoder externo para producir audio final.
- Integración con el ecosistema OpenVoiceOS (OVOS) mediante el plugin `ovos-tts-plugin-phoonnx`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step, visión ni audio de entrada.

## Casos de uso

- **Asistentes de voz en catalán**: el modelo permite generar respuestas habladas en catalán dentro de asistentes domésticos o aplicaciones de voz, integrándose vía OVOS con el plugin `ovos-tts-plugin-phoonnx` y seleccionando la voz en `mycroft.conf`.
- **Lectura de contenido accesible**: conversión de artículos, noticias o documentos a audio en catalán para usuarios con discapacidad visual o para consumo en formato podcast, usando el pipeline de dos etapas (modelo acústico + vocoder).
- **Sistemas de atención al cliente automatizada**: generación de respuestas de voz en catalán en IVR o chatbots telefónicos, aprovechando el soporte multihablante para adaptar la voz al contexto.
- **Locución para aplicaciones móviles y de escritorio**: integración del modelo ONNX en aplicaciones que requieran TTS local en catalán sin depender de servicios en la nube, gracias al tamaño reducido del repositorio (0,1 GB).
- **Generación de audiolibros y contenido educativo**: síntesis de texto largo en catalán con distintas voces para materiales didácticos o narrativos, combinando el modelo acústico con el vocoder de 22 kHz.
- **Prototipado e investigación en TTS catalán**: uso del modelo como base para experimentos de síntesis de voz, evaluación de vocoders o comparación de pipelines de dos etapas en el ámbito académico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación; por el tamaño del repositorio (0,1 GB) se trata de un modelo ligero que probablemente quepa en GPUs de gama baja, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no confirmada; el formato ONNX permite ejecución en CPU y en GPUs convencionales, pero no se especifican requisitos.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OpenVoiceOS; ejecución en formato ONNX.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Idiomas | Arquitectura | Formato | Licencia | Multihablante |
|---|---|---|---|---|---|
| Phoonnx/matcha-ca-multispeaker_acoustic | Catalán | Matcha-TTS | ONNX | GPL-3.0 | Sí |
| projecte-aina/matxa-tts-cat-multispeaker (upstream) | Catalán | Matcha-TTS | no disponible | GPL-3.0 | Sí |
| Phoonnx/matcha-ca-multispeaker (otras variantes de la colección) | Catalán | Matcha-TTS | ONNX | GPL-3.0 | Según variante |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- **Licencia GPL-3.0**: el uso comercial implica obligaciones de copyleft; es necesario revisar la compatibilidad con el producto o servicio que integre el modelo.
- **Dependencia de espeak-ng**: la calidad de la fonemización depende de espeak-ng; el uso del port espyak puede producir errores de pronunciación en algunas palabras, según advierte la propia model card.
- **Pipeline de dos etapas**: el modelo solo genera espectrogramas; requiere un vocoder externo (vocos o wavenext) para producir audio, lo que añade complejidad y dependencias al despliegue.
- **Idioma único**: solo soporta catalán; no es adecuado para aplicaciones multilingües sin modelos adicionales.
- **Riesgo de alucinación y artefactos**: como todo modelo generativo de voz, puede producir pronunciaciones incorrectas o artefactos acústicos en textos con nombres propios, siglas o dominios especializados.
- **Sesgos**: no se documentan sesgos específicos, pero al ser un modelo multihablante entrenado con un dataset concreto, puede reflejar sesgos de los hablantes y datos de entrenamiento.
- **Información técnica incompleta**: no se publican detalles sobre parámetros, contexto ni datos de entrenamiento, lo que dificulta la evaluación rigurosa del modelo.

## Enlaces

- [Hugging Face: Phoonnx/matcha-ca-multispeaker_acoustic](https://huggingface.co/Phoonnx/matcha-ca-multispeaker_acoustic)
- [Modelo upstream: projecte-aina/matxa-tts-cat-multispeaker](https://huggingface.co/projecte-aina/matxa-tts-cat-multispeaker)
- [Vocoder vocos-multi-alvocat-22khz](https://huggingface.co/Phoonnx/vocos-multi-alvocat-22khz)
- [Vocoder wavenext-ca-bsc_lt-22khz](https://huggingface.co/Phoonnx/wavenext-ca-bsc_lt-22khz)
- [Colección Matcha-TTS de Phoonnx](https://huggingface.co/collections/Phoonnx/matcha-tts-6af8ea8f6a5b1af4d985d2ad)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
