# Phoonnx/matcha-ca-multispeaker_wavenext

## Resumen

matcha-ca-multispeaker_wavenext es un modelo de síntesis de voz (text-to-speech) para catalán, empaquetado en formato ONNX por Phoonnx a partir del modelo original `projecte-aina/matxa-tts-cat-multispeaker` desarrollado por Projecte AINA. El modelo emplea la arquitectura Matcha-TTS, un modelo de difusión condicionada por texto basado en flow matching, y está diseñado para generar voz de forma eficiente a partir de fonemas IPA obtenidos mediante espeak-ng.

Este empaquetado resuelve el problema de desplegar un TTS catalán de calidad en entornos Python y en el asistente de voz OpenVoiceOS (OVOS) sin necesidad de infraestructura de entrenamiento: el modelo se distribuye como pesos ONNX listos para inferencia con la librería `phoonnx`, con un tamaño de repositorio de 0,1 GB. Es relevante porque el catalán cuenta con pocos modelos TTS open source de calidad y este ofrece una vía práctica de integración en asistentes y aplicaciones de voz.

El modelo es multihablante (multispeaker), acepta texto en catalán y produce audio mediante un vocoder Wavenext fusionado en el pipeline. Su licencia es GPL-3.0, lo que condiciona su uso en productos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha-TTS (flow matching / difusión condicionada por texto) con vocoder Wavenext fusionado |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | catalán (`ca`) |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo se basa en Matcha-TTS, una arquitectura de síntesis de voz que combina un encoder de texto (que recibe fonemas IPA) con un decoder generativo basado en flow matching (una variante de modelos de difusión continua) para producir espectrogramas mel, que posteriormente son convertidos a audio por un vocoder. En este empaquetado concreto, el vocoder Wavenext aparece fusionado en el pipeline, de modo que la salida final es audio WAV directamente.

El modelo original es multihablante y fue desarrollado por Projecte AINA para el catalán. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino preferencial; estos datos no están disponibles. La innovación destacable de este empaquetado es la conversión a ONNX y la integración con la cadena de herramientas `phoonnx` + `scriptconv`, que gestiona la normalización de texto y la fonemización con espeak-ng.

## Capacidades

- Síntesis de voz (text-to-speech) en catalán a partir de texto plano.
- Soporte multihablante: el modelo original es multispeaker, por lo que puede generar distintas voces.
- Entrada fonémica en alfabeto IPA generada mediante espeak-ng.
- Normalización de texto y conversión de script a través de `scriptconv`.
- Integración como plugin de TTS en OpenVoiceOS (`ovos-tts-plugin-phoonnx`).
- Generación de audio en formato WAV mediante la API `synthesize_wav`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni visión; es un modelo exclusivamente de voz.

## Casos de uso

- Asistentes de voz en catalán: integración en OpenVoiceOS mediante el plugin `ovos-tts-plugin-phoonnx`, seleccionando la voz `OpenVoiceOS/matxa-cat-multispeaker-wavenext` en `mycroft.conf` para respuestas habladas del asistente.
- Lectura de contenido web o documentos: convertir artículos, noticias o textos de interfaces en audio catalán para accesibilidad o consumo pasivo, usando la API de síntesis sobre frases individuales.
- Sistemas de accesibilidad: generar locuciones para personas con discapacidad visual en aplicaciones catalanas, aprovechando que el modelo funciona en CPU mediante ONNX.
- Audiolibros y narración automatizada: producir narraciones en catalán con la voz multihablante, encadenando la síntesis por frases.
- Avisos y notificaciones por voz en aplicaciones: generar mensajes cortos dinámicos (alertas, recordatorios, confirmaciones) en tiempo de ejecución sin depender de servicios en la nube.
- Prototipado de interfaces conversacionales: validar flujos de voz en catalán en entornos de desarrollo con `pip install --pre phoonnx` y espeak-ng instalado, sin infraestructura GPU.
- Sistemas de megafonía o anuncios automatizados en catalán: síntesis de anuncios pregrabados o dinámicos para transporte, comercios o espacios públicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 0,1 GB y los pesos se distribuyen en ONNX, lo que permite inferencia en CPU sin GPU dedicada.
- VRAM estimada: no disponible; al ejecutarse en ONNX, puede correr en CPU con memoria RAM convencional.
- GPU recomendadas: no se documentan; no es necesario GPU para el uso previsto.
- Cabe en cualquier equipo consumer: el tamaño de 0,1 GB es compatible con portátiles y dispositivos de bajo consumo.
- Opciones de despliegue: librería `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OpenVoiceOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|---|
| Phoonnx/matcha-ca-multispeaker_wavenext | Matcha-TTS + Wavenext | ca | no disponible | no disponible | GPL-3.0 | ONNX |
| projecte-aina/matxa-tts-cat-multispeaker | Matcha-TTS | ca | no disponible | no disponible | GPL-3.0 | no disponible |
| Otros modelos Matcha-TTS de la colección Phoonnx | Matcha-TTS | varios | no disponible | no disponible | variable | ONNX |

La comparativa con alternativas de otros autores no está disponible en la información proporcionada. El modelo upstream de Projecte AINA es la referencia directa; este empaquetado añade el formato ONNX y la integración con `phoonnx`.

## Limitaciones y advertencias

- Licencia GPL-3.0: el uso comercial en productos propietarios puede quedar condicionado por las obligaciones de copyleft de esta licencia; revisar antes de integrar en software cerrado.
- Dependencia de espeak-ng: los fonemas se generan con espeak-ng; si se usa el port `espyak`, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- Solo catalán: no soporta otros idiomas.
- Riesgo de alucinación o errores de pronunciación en textos con números, siglas, nombres propios o formatos no normalizados; la calidad depende de la normalización de `scriptconv`.
- Modelo TTS, no de lenguaje: no genera texto, razonamiento ni código.
- No se documentan sesgos específicos del modelo; al ser multihablante, la calidad puede variar entre voces.
- No se dispone de información sobre latencia, throughput ni calidad perceptual (MOS) en la documentación proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/matcha-ca-multispeaker_wavenext
- Modelo upstream: https://huggingface.co/projecte-aina/matxa-tts-cat-multispeaker
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Colección Matcha-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/matcha-tts-6af8ea8f6a5b1af4d985d2ad
