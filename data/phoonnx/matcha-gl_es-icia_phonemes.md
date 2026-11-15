# Phoonnx/matcha-gl_es-icia_phonemes

## Resumen

matcha-gl_es-icia_phonemes es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura Matcha-TTS, desarrollado originalmente por Proxecto Nós y empaquetado por Phoonnx en formato ONNX para su uso con la librería phoonnx. El modelo está especializado en gallego (gl-ES) y toma como entrada fonemas en el alfabeto Cotovia, no texto plano, lo que requiere un paso previo de fonemización mediante la librería scriptconv.

El modelo resuelve el problema de la síntesis de voz en gallego dentro del ecosistema OVOS (Open Voice OS), proporcionando una voz utilizable en asistentes de voz y aplicaciones de TTS en ese idioma. Es relevante para desarrolladores que necesitan TTS de calidad en gallego con una licencia permisiva (Apache 2.0) y un formato de despliegue ligero (ONNX, repo de 0,1 GB).

La información disponible sobre arquitectura interna, número de parámetros y datos de entrenamiento es limitada: la model card solo indica que se trata de Matcha-TTS y remite al modelo upstream de Proxecto Nós. No se publican especificaciones detalladas de tamaño, contexto ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha-TTS (basada en flow matching, segun la coleccion de Phoonnx) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | gallego (gl-ES) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas Cotovia (alfabeto Cotovia) |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo se basa en Matcha-TTS, una arquitectura de síntesis de voz que emplea flow matching para la generación de mel-espectrogramas a partir de fonemas, combinada con un vocoder para producir la forma de onda final. La model card no detalla la configuración interna (número de capas, dimensión de los embeddings, tasa de muestreo) ni el número de tokens o composición del dataset de entrenamiento.

El modelo está empaquetado en formato ONNX por Phoonnx a partir del modelo upstream proxectonos/Nos_TTS-icia-matcha-phonemes de Proxecto Nós. La entrada no es texto plano sino fonemas en el alfabeto Cotovia, que se obtienen mediante el fonemizador `CotoviaPhonemizer` de la librería scriptconv (extra `scriptconv[gl]`). No se dispone de información sobre el proceso de entrenamiento, si hubo ajuste fino, ni sobre innovaciones técnicas adicionales más allá de la propia arquitectura Matcha-TTS.

## Capacidades

- Síntesis de voz en gallego (gl-ES) a partir de fonemas Cotovia.
- Generación de audio WAV mediante la API `voice.synthesize_wav(text, wav_file)` de phoonnx.
- Integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Normalización y conversión de texto a fonemas delegada a scriptconv (fonemizador Cotovia para gallego).
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de modo thinking, visión ni audio de entrada.
- Capacidad multilingüe limitada al gallego; no se declaran otros idiomas.

## Casos de uso

- Asistentes de voz en gallego sobre OVOS: el modelo se integra como plugin TTS (`ovos-tts-plugin-phoonnx`) y permite dotar a un asistente doméstico de síntesis de voz en gallego con una configuración mínima en `mycroft.conf`.
- Lectura de contenido en gallego en aplicaciones web o móviles: mediante la API Python de phoonnx se puede generar audio WAV a partir de texto normalizado y fonemizado con scriptconv, adecuado para convertir artículos o notificaciones en voz.
- Accesibilidad para personas con discapacidad visual: el modelo permite convertir texto en gallego a voz para lectores de pantalla o sistemas de asistencia, con un repositorio de solo 0,1 GB que facilita el despliegue en dispositivos modestos.
- Locución automatizada de contenidos audiovisuales: generación de pistas de voz en gallego para vídeos, pódcast o avisos públicos, usando el pipeline text-to-speech con entrada fonémica controlada.
- Sistemas de megafonía o avisos institucionales en gallego: integración en flujos de anuncios automatizados donde se requiere una voz sintética consistente y con licencia Apache 2.0 para uso comercial.
- Prototipado de interfaces conversacionales en gallego: al ser un modelo ONNX ligero, permite iterar rápidamente en entornos de desarrollo sin necesidad de infraestructura GPU dedicada, siempre que se instale el extra `scriptconv[gl]` para la fonemización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB y el formato ONNX sugiere ejecución en CPU, pero no se publican cifras de memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el tamaño reducido del repositorio sugiere que podría ejecutarse en CPU, pero no hay confirmación en la información proporcionada.
- Opciones de despliegue: phoonnx (Python) y OVOS mediante `ovos-tts-plugin-phoonnx`; el formato ONNX permite inferencia con ONNX Runtime.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto/entrada |
|---|---|---|---|---|---|
| matcha-gl_es-icia_phonemes | Matcha-TTS | Gallego (gl-ES) | Apache 2.0 | ONNX | Fonemas Cotovia |
| proxectonos/Nos_TTS-icia-matcha-phonemes | Matcha-TTS | Gallego | Apache 2.0 (segun upstream) | no disponible | Fonemas |
| Otros modelos de la coleccion Matcha-TTS de Phoonnx | Matcha-TTS | Segun modelo | Segun modelo | ONNX | Segun modelo |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La entrada debe ser fonemas Cotovia, no texto plano; es obligatorio usar scriptconv con el extra `scriptconv[gl]` para la fonemización previa.
- Solo soporta gallego (gl-ES); no se declaran otros idiomas.
- No se publican datos sobre sesgos, calidad de la voz, naturalidad ni robustez ante ruido o dominios específicos.
- Riesgo de alucinación no aplica en el sentido de LLM, pero no hay información sobre errores de pronunciación o artefactos de audio.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo upstream de Proxecto Nós.
- No se dispone de información sobre requisitos de hardware, latencia ni rendimiento en producción.
- El modelo tiene muy pocas descargas (28) y ningún like en el momento de la consulta, lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- [Hugging Face: Phoonnx/matcha-gl_es-icia_phonemes](https://huggingface.co/Phoonnx/matcha-gl_es-icia_phonemes)
- [Modelo upstream: proxectonos/Nos_TTS-icia-matcha-phonemes](https://huggingface.co/proxectonos/Nos_TTS-icia-matcha-phonemes)
- [Coleccion Matcha-TTS de Phoonnx](https://huggingface.co/collections/Phoonnx/matcha-tts-6af8ea8f6a5b1af4d985d2ad)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
