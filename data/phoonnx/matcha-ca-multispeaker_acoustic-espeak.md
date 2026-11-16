# Phoonnx/matcha-ca-multispeaker_acoustic-espeak

## Resumen

`matcha-ca-multispeaker_acoustic-espeak` es un modelo acústico de síntesis de voz (text-to-speech) basado en la arquitectura Matcha-TTS, desarrollado originalmente por Projecte AINA y empaquetado por Phoonnx en formato ONNX para su uso con la librería `phoonnx`. El modelo genera espectrogramas mel a partir de fonemas IPA del catalán, que posteriormente se convierten en audio mediante un vocoder externo (Vocos o WaveNeXt). Se trata de un modelo multihablante, lo que permite sintetizar distintas voces dentro del mismo checkpoint.

El modelo resuelve el problema de la síntesis de voz en catalán dentro de entornos de código abierto, ofreciendo una alternativa ligera (repo de 0,1 GB) y desplegable localmente. Su integración con el ecosistema OVOS (OpenVoiceOS) y con la librería `phoonnx` lo hace relevante para asistentes de voz autoalojados que necesitan TTS en catalán sin depender de servicios en la nube.

La relevancia actual radica en su carácter modular: el modelo acústico se combina con distintos vocoders (vocos-multi-alvocat-22khz o wavenext-ca-bsc_lt-22khz) para producir audio final, lo que permite intercambiar componentes según los requisitos de calidad o latencia. El front-end textual se basa en fonemas generados por espeak-ng, lo que introduce dependencias externas que conviene considerar en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha-TTS (modelo acústico, genera espectrograma mel) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | catalán (`ca`) |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Vocoder asociado | vocos-multi-alvocat-22khz, wavenext-ca-bsc_lt-22khz |
| Tamano del repo | 0,1 GB |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Matcha-TTS, un modelo acústico de difusión condicionada por texto que genera espectrogramas mel. Matcha-TTS emplea un enfoque de flow matching (una variante de modelos de difusión continua) que permite una síntesis de alta calidad con un número reducido de pasos de muestreo, lo que se traduce en inferencia más rápida que los modelos de difusión tradicionales. El modelo es multihablante, es decir, comparte parámetros entre múltiples voces.

El entrenamiento original corresponde a Projecte AINA, que publicó el modelo upstream `projecte-aina/matxa-tts-cat-multispeaker`. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino preferencial. El empaquetado por parte de Phoonnx consiste en la conversión a ONNX y la integración con el pipeline de `phoonnx` y `scriptconv`, que gestiona la normalización textual y la fonemización mediante espeak-ng.

La innovación técnica destacable es la separación en dos etapas: el modelo acústico produce el espectrograma y un vocoder independiente lo convierte en forma de onda. Esta modularidad permite intercambiar vocoders (Vocos a 22 kHz o WaveNeXt) sin reentrenar el modelo acústico.

## Capacidades

- Síntesis de voz en catalán a partir de texto escrito, con conversión previa a fonemas IPA mediante espeak-ng.
- Soporte multihablante: un único checkpoint permite generar distintas voces.
- Generación de espectrogramas mel compatibles con vocoders de 22 kHz (Vocos y WaveNeXt).
- Integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Funcionamiento local y offline una vez descargados los pesos y el vocoder.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales (es exclusivamente TTS).
- No dispone de modo "thinking" ni de otras capacidades generativas más allá de la síntesis de voz.

## Casos de uso

- Asistentes de voz autoalojados en catalán: el modelo se integra en OVOS mediante `ovos-tts-plugin-phoonnx`, permitiendo respuestas habladas en catalán sin depender de APIs externas. Su tamaño reducido (0,1 GB) facilita el despliegue en dispositivos locales.
- Lectura de contenido en catalán: conversión de artículos, notificaciones o mensajes a audio para aplicaciones de accesibilidad o lectura por voz, usando la voz multihablante para adaptar el tono al contexto.
- Sistemas de anuncios automatizados: generación de avisos hablados en catalán para transporte público, comercios o edificios, donde la latencia baja del modelo acústico y la modularidad del vocoder permiten ajustar la calidad según el hardware.
- Prototipado de interfaces conversacionales: desarrollo de asistentes por voz en catalán con múltiples personajes o hablantes, aprovechando que el modelo comparte parámetros entre voces.
- Integración en pipelines de CI/CD para pruebas de TTS: el formato ONNX y la librería `phoonnx` permiten automatizar la generación de muestras de audio en pruebas de regresión de sistemas de voz.
- Investigación en síntesis de voz: el modelo sirve como base para experimentar con distintos vocoders y comparar calidad (Vocos frente a WaveNeXt) sin necesidad de reentrenar el modelo acústico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el tamaño del repo (0,1 GB) sugiere que el modelo acústico es ligero y puede ejecutarse en CPU o en GPUs de gama baja.
- GPU recomendadas: no disponible. Dado el tamaño reducido, es probable que funcione en GPUs consumer (RTX 3060, RTX 4090) e incluso en CPU, aunque no se confirma en la información proporcionada.
- Cabe en GPU consumer: probablemente sí, por el tamaño del repo, pero no confirmado.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto |
|---|---|---|---|---|---|
| matcha-ca-multispeaker_acoustic-espeak | Matcha-TTS | ca | GPL-3.0 | ONNX | no disponible |
| projecte-aina/matxa-tts-cat-multispeaker | Matcha-TTS | ca | GPL-3.0 | no disponible | no disponible |
| Otros TTS catalanes (p. ej. modelos de Projecte AINA) | no disponible | ca | no disponible | no disponible | no disponible |

El modelo es un empaquetado ONNX del modelo upstream de Projecte AINA, por lo que su comparación más directa es con el original. No se dispone en la información proporcionada de datos de rendimiento comparativo con otras alternativas de TTS en catalán.

## Limitaciones y advertencias

- Licencia GPL-3.0: el uso comercial está permitido, pero obliga a distribuir el código derivado bajo la misma licencia, lo que puede ser restrictivo para productos propietarios.
- Dependencia de espeak-ng: la fonemización requiere espeak-ng instalado. La alternativa `espyak` (port de espeak-ng) puede producir fonemas distintos y provocar errores de pronunciación en algunas palabras.
- Solo catalán: no soporta otros idiomas, lo que limita su uso en entornos multilingües.
- Modelo acústico únicamente: requiere un vocoder externo para generar audio, lo que añade complejidad y dependencias al despliegue.
- Riesgo de alucinación y errores de pronunciación: al depender de la fonemización automática, palabras con grafías ambiguas o extranjerismos pueden sintetizarse incorrectamente.
- Sin datos de benchmarks: no hay métricas publicadas de calidad (MOS, WER) en la información disponible, lo que dificulta evaluar su rendimiento frente a alternativas.
- Sesgos: no se documentan sesgos conocidos, pero al ser multihablante, la calidad puede variar entre voces.
- Fecha de creación futura (2026): el modelo aparece con fechas de creación y actualización en 2026, lo que puede indicar un error en los metadatos o una publicación programada; conviene verificar la disponibilidad real.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/matcha-ca-multispeaker_acoustic-espeak
- Modelo upstream: https://huggingface.co/projecte-aina/matxa-tts-cat-multispeaker
- Vocoder Vocos: https://huggingface.co/Phoonnx/vocos-multi-alvocat-22khz
- Vocoder WaveNeXt: https://huggingface.co/Phoonnx/wavenext-ca-bsc_lt-22khz
- Colección Matcha-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/matcha-tts-6af8ea8f6a5b1af4d985d2ad
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
