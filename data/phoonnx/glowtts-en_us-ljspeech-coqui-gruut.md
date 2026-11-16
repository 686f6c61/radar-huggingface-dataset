# Phoonnx/glowtts-en_us-ljspeech-coqui-gruut

## Resumen

Glow-TTS es un modelo de síntesis de voz (text-to-speech) desarrollado originalmente por Coqui a partir de la arquitectura Glow-TTS, un modelo de flujo normalizador (normalizing flow) que genera espectrogramas mel a partir de fonemas de entrada. Esta ficha concreta corresponde al empaquetado para la librería ONNX `phoonnx`, mantenido por Phoonnx, del modelo original `tts_models--en--ljspeech--glow-tts` publicado en la release v0.6.1 de Coqui TTS. El modelo está entrenado sobre el corpus LJSpeech y sintetiza voz en inglés estadounidense (`en-US`).

La relevancia de esta ficha es práctica: se trata de una conversión a ONNX de un modelo clásico de TTS, lo que permite ejecutarlo sin depender del framework original de Coqui y con un tamaño de repositorio muy reducido (0,1 GB). El modelo no genera audio directamente, sino que produce un espectrograma que después debe convertirse a forma de onda mediante un vocoder externo, en este caso `multiband_melgan-en_us-ljspeech`, que phoonnx descarga automáticamente junto con la voz.

Cabe señalar que la model card es escasa en detalles técnicos: no se especifican número de parámetros, longitud de contexto ni datos de entrenamiento más allá del corpus LJSpeech. La información disponible se limita a la arquitectura, el front-end fonémico (gruut) y las instrucciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (modelo de flujo normalizador para TTS) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | other (el upstream declara MPL en la lista de modelos de Coqui TTS) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

Glow-TTS es un modelo generativo basado en flujos normalizadores (normalizing flows) que aprende una correspondencia monotónica entre fonemas y frames de espectrograma mel, evitando el uso de un aligner externo como los modelos seq2seq con atención. El modelo recibe fonemas IPA generados por el fonemizador gruut y produce un espectrograma mel, que posteriormente se convierte en audio mediante el vocoder Multiband-MelGAN. Esta separación en dos etapas (modelo acústico + vocoder) es habitual en los pipelines de TTS de Coqui.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset más allá de LJSpeech, ni sobre si se aplicaron técnicas de RLHF o DPO (poco habituales en modelos TTS de esta generación). El entrenamiento original corresponde a Coqui sobre LJSpeech, un corpus de audio de una única hablante femenina en inglés. La innovación técnica destacable es la conversión a ONNX para su ejecución ligera mediante phoonnx, que integra la normalización de texto y la fonemización mediante `scriptconv`.

## Capacidades

- Síntesis de voz en inglés estadounidense (`en-US`) a partir de texto.
- Generación de espectrogramas mel que requieren un vocoder (Multiband-MelGAN) para producir audio.
- Fonemización de entrada mediante gruut (alfabeto IPA), lo que permite un control fonético preciso.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en formato ONNX, sin dependencia del framework original de Coqui.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada; es exclusivamente un modelo TTS.
- No dispone de modo "thinking" ni capacidades multilingües más allá del inglés.

## Casos de uso

- **Lectura de artículos y documentos en voz alta**: el modelo convierte texto plano en inglés en audio inteligible, adecuado para aplicaciones de accesibilidad o lectores de pantalla, gracias a la fonemización gruut que mejora la pronunciación.
- **Asistentes de voz integrados en OVOS**: mediante el plugin `ovos-tts-plugin-phoonnx`, se puede configurar como motor TTS en `mycroft.conf` para asistentes domésticos que respondan en inglés.
- **Generación de audio para prototipos y demos**: al ser un modelo ligero (0,1 GB) en ONNX, es útil para pruebas rápidas de pipelines TTS sin necesidad de infraestructura pesada.
- **Síntesis por lotes de contenido en inglés**: para generar narraciones o avisos pregrabados en aplicaciones, dado que el modelo produce espectrogramas de forma determinista y reproducible.
- **Investigación y experimentación con TTS**: sirve como línea base para comparar modelos acústicos y vocoders, ya que la arquitectura Glow-TTS es bien conocida y el pipeline está separado en etapas.
- **Integración en pipelines de conversión de texto a audio en entornos con recursos limitados**: el formato ONNX y el tamaño reducido permiten desplegarlo en dispositivos modestos, siempre que se disponga del vocoder correspondiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,1 GB, lo que sugiere un modelo pequeño que probablemente cabe en GPU consumer, pero no se confirma.
- GPU recomendadas: no disponible.
- ¿Cabe en consumer GPU?: probablemente sí por el tamaño del repositorio, pero no se dispone de confirmación en la información proporcionada.
- Opciones de despliegue: phoonnx (Python y OVOS) con runtime ONNX; el vocoder Multiband-MelGAN se descarga automáticamente.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| glowtts-en_us-ljspeech-coqui-gruut (esta ficha) | Glow-TTS + Multiband-MelGAN | en-US | no disponible | other (MPL upstream) | Hugging Face, ONNX |
| tts_models--en--ljspeech--glow-tts (Coqui original) | Glow-TTS + vocoder | en-US | no disponible | MPL | GitHub releases de Coqui |
| Otros modelos TTS de la colección Phoonnx Glow-TTS | Glow-TTS | varios | no disponible | other | Hugging Face |

La comparación detallada con alternativas de la misma categoría no está disponible en la información proporcionada; los datos de rendimiento y parámetros de los modelos comparables no se especifican.

## Limitaciones y advertencias

- **Idioma único**: solo sintetiza inglés estadounidense (`en-US`); no soporta otros idiomas.
- **Dependencia de vocoder**: el modelo no genera audio por sí solo; requiere el vocoder `multiband_melgan-en_us_ljspeech`, que debe estar disponible para producir forma de onda.
- **Licencia ambigua**: la model card indica `other` y el upstream declara MPL, pero no se detallan restricciones de uso comercial; conviene verificar la licencia MPL del proyecto Coqui antes de uso en producción.
- **Riesgo de alucinación**: como todo modelo TTS, puede producir pronunciaciones incorrectas o artefactos acústicos en palabras fuera del dominio de LJSpeech (nombres propios, siglas, términos técnicos).
- **Sesgos**: el modelo está entrenado sobre una única hablante de LJSpeech, por lo que la voz resultante es monocorde y no representa diversidad de acentos o géneros.
- **Contexto**: no se especifica longitud máxima de texto de entrada; textos muy largos pueden requerir segmentación manual.
- **Madurez**: el repositorio tiene muy pocas descargas (19) y ningún "like", lo que sugiere un uso limitado y escasa validación comunitaria.
- **Caveat de producción**: la librería `phoonnx` se instala con `pip install --pre`, lo que indica una versión preliminar; no se recomienda para entornos de producción sin pruebas adicionales.

## Enlaces

- [Hugging Face: Phoonnx/glowtts-en_us-ljspeech-coqui-gruut](https://huggingface.co/Phoonnx/glowtts-en_us-ljspeech-coqui-gruut)
- [Modelo original Coqui TTS v0.6.1 (glow-tts)](https://github.com/coqui-ai/TTS/releases/download/v0.6.1_models/tts_models--en--ljspeech--glow-tts.zip)
- [Vocoder Multiband-MelGAN](https://huggingface.co/Phoonnx/multiband_melgan-en_us-ljspeech)
- [Colección Glow-TTS de Phoonnx](https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
