# Phoonnx/matcha-tw-ghananlpcommunity-nano-espeak

## Resumen

matcha-tw-ghananlpcommunity-nano-espeak es un modelo de síntesis de voz (text-to-speech) de arquitectura Matcha-TTS, desarrollado originalmente por GhanaNLP a partir del modelo `ghananlpcommunity/nano-twi` y empaquetado por Phoonnx para su librería ONNX de TTS. El modelo convierte texto en twi (código ISO `tw`, una de las lenguas akan de Ghana) en audio, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA.

La relevancia de este modelo radica en su carácter de recurso de baja disponibilidad: el twi es una lengua con pocos sistemas TTS abiertos, y esta es una de las pocas alternativas empaquetadas en formato ONNX con licencia MIT. El repositorio pesa aproximadamente 0,1 GB, lo que indica un modelo compacto orientado a despliegue ligero, presumiblemente en entornos de asistente de voz como OVOS.

No se dispone de información sobre el número de parámetros, la longitud de contexto ni los datos de entrenamiento en la información proporcionada. La model card se centra en el uso práctico mediante la librería phoonnx y no detalla la arquitectura interna más allá de la referencia a Matcha-TTS.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Matcha-TTS (modelo acústico de difusión condicionada por fonemas) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS por fonemas, sin contexto de texto extenso) |
| Tipos de cuantización | no disponible (pesos ONNX; no se documentan variantes) |
| Idiomas soportados | tw (twi) |
| Licencia | MIT |
| Formato de pesos | ONNX (librería phoonnx) |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamaño del repositorio | ~0,1 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Matcha-TTS, un modelo acústico de difusión condicionada por fonemas que genera mel-espectrogramas a partir de una secuencia de fonemas y luego los convierte en forma de onda mediante un vocoder (no especificado en la información disponible). La entrada no es texto crudo sino fonemas espeak-ng en IPA, lo que implica que el front-end de texto (normalización y fonemización) se delega a la librería scriptconv de Phoonnx.

El modelo original proviene de `ghananlpcommunity/nano-twi`, desarrollado por GhanaNLP. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá del propio paradigma de difusión de Matcha-TTS.

## Capacidades

- Síntesis de voz a partir de texto en twi, con salida en formato WAV.
- Fonemización mediante espeak-ng (o el port espyak incluido en el extra `phoonnx[espeak]`).
- Integración con la librería phoonnx para Python y con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Normalización y conversión de texto delegadas a scriptconv.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo de pensamiento (thinking mode); es un modelo exclusivamente TTS.
- Capacidad multilingüe limitada al twi.

## Casos de uso

- Asistentes de voz en twi: integración en OVOS mediante `ovos-tts-plugin-phoonnx` para dotar de voz a asistentes de código abierto en comunidades akan.
- Lectura de contenido en twi: conversión de artículos, noticias o textos educativos a audio para accesibilidad.
- Aplicaciones de aprendizaje de idiomas: generación de pronunciaciones en twi para materiales didácticos, aprovechando la fonemización IPA.
- Sistemas de anuncios y avisos localizados: despliegue en dispositivos de bajo consumo gracias al tamaño compacto del modelo (~0,1 GB) y al formato ONNX.
- Investigación en TTS de bajos recursos: uso como línea base o componente en estudios sobre síntesis de voz para lenguas africanas con pocos datos.
- Prototipado rápido en Python: gracias a la API de phoonnx, se puede integrar en scripts de generación de audio sin infraestructura pesada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio (~0,1 GB) sugiere un modelo muy ligero que probablemente cabe en CPU y en GPUs de gama baja, pero no se confirma en la documentación.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probable por el tamaño, pero no confirmado.
- Opciones de despliegue: librería phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS; formato ONNX compatible con runtimes ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia contextual, la colección Matcha-TTS de Phoonnx incluye otros modelos empaquetados, pero no se detallan sus especificaciones en la información disponible.

| Modelo | Parámetros | Contexto | Licencia | Formato | Idiomas |
|---|---|---|---|---|---|
| matcha-tw-ghananlpcommunity-nano-espeak | no disponible | no aplica | MIT | ONNX | tw |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Cobertura lingüística restringida exclusivamente al twi; no apto para otros idiomas sin reentrenamiento.
- Dependencia de espeak-ng para la fonemización; el port espyak puede producir fonemas distintos y provocar errores de pronunciación en algunas palabras, según advierte la model card.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado con datos de GhanaNLP, puede reflejar sesgos dialectales o de dominio del corpus original.
- Riesgo de alucinación acústica: como todo modelo generativo de audio, puede producir pronunciaciones incorrectas o artefactos ante texto fuera de distribución.
- Licencia MIT declarada por el upstream; se recomienda verificar la model card original de `ghananlpcommunity/nano-twi` antes de uso comercial.
- No se documentan métricas de calidad (MOS, WER) ni evaluaciones objetivas, lo que dificulta valorar su idoneidad en producción.
- El número de descargas (22) y la ausencia de likes indican un modelo con poca validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/matcha-tw-ghananlpcommunity-nano-espeak
- Modelo upstream: https://huggingface.co/ghananlpcommunity/nano-twi
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección Matcha-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/matcha-tts-6af8ea8f6a5b1af4d985d2ad
