# Phoonnx/styletts2-pt_pt_x_lisbon-tuga_kokoro

## Resumen

`styletts2-pt_pt_x_lisbon-tuga_kokoro` es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura StyleTTS2, empaquetado por Phoonnx en formato ONNX para su uso con su libreria de inferencia `phoonnx`. El modelo deriva del checkpoint `logus2k/kokoro_tts_eu_pt` y esta especializado en portugues europeo con acento de Lisboa (`pt-PT-x-lisbon`), empleando el fonemizador `tugaphone` para convertir texto a fonemas IPA.

El modelo resuelve la necesidad de sintesis de voz en portugues de Portugal dentro del ecosistema OVOS (Open Voice OS), un entorno de asistentes de voz open source. Su empaquetado como ONNX permite inferencia ligera y portable, sin dependencia de frameworks de deep learning pesados. El repositorio ocupa 0,3 GB, lo que sugiere un modelo compacto orientado a despliegue en dispositivos con recursos limitados.

Es relevante para desarrolladores que construyen asistentes de voz o aplicaciones de TTS en portugues europeo y necesitan una solucion con licencia Apache 2.0, integrable via Python o mediante el plugin `ovos-tts-plugin-phoonnx`. La informacion publica disponible es limitada: no se detallan parametros, contexto ni datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | portugues europeo (`pt-PT-x-lisbon`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas IPA via `tugaphone` |
| Tamano del repositorio | 0,3 GB |
| Libreria | `phoonnx` |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

StyleTTS2 es una arquitectura de sintesis de voz que combina un encoder de estilo y un decoder basado en difusion para generar audio de alta calidad. El modelo original integra un discriminador de estilo y tecnicas de entrenamiento adversarial para mejorar la naturalidad de la voz. En este caso, el checkpoint ha sido empaquetado en ONNX por Phoonnx para su inferencia con su libreria propia.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO (no aplicables tipicamente a TTS). El modelo upstream `logus2k/kokoro_tts_eu_pt` no proporciona detalles de entrenamiento en la informacion disponible. La innovacion principal es el empaquetado ONNX y la integracion con el fonemizador `tugaphone`, que soporta variantes del portugues (pt-PT, pt-BR, pt-AO, pt-MZ, pt-TL).

## Capacidades

- Sintesis de voz (text-to-speech) en portugues europeo con acento de Lisboa.
- Conversion de texto a fonemas IPA mediante `tugaphone`.
- Generacion de audio WAV a partir de texto.
- Integracion con el ecosistema OVOS mediante `ovos-tts-plugin-phoonnx`.
- Inferencia via ONNX, lo que permite despliegue ligero y portable.
- Soporte de multiples voces empaquetadas: `logus2k/tts_eu_pt`, `logus2k/tts_eu_pt-am_adam`, `logus2k/tts_eu_pt-pm_alex`, `logus2k/tts_eu_pt-pm_santa`.
- No se documentan capacidades de tool calling, agentes, vision ni audio de entrada.

## Casos de uso

- Asistentes de voz en portugues europeo: el modelo se integra en OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, permitiendo respuestas habladas en pt-PT con acento de Lisboa en asistentes domoticos o de escritorio.
- Lectura de contenido en aplicaciones de accesibilidad: sintesis de texto a voz para usuarios con discapacidad visual que necesiten escuchar contenido en portugues de Portugal, con inferencia ONNX ligera.
- Generacion de audiolibros o narraciones: el modelo puede sintetizar parrafos completos de texto en pt-PT, adecuado para narracion de contenido editorial.
- Sistemas de anuncios automatizados: integracion en pipelines de generacion de audio para anuncios, avisos o notificaciones en portugues europeo.
- Prototipado de interfaces conversacionales: desarrolladores que necesiten una voz pt-PT rapida de integrar via Python pueden usar `phoonnx` para generar audio en pruebas de concepto.
- Despliegue en dispositivos con recursos limitados: el formato ONNX y el tamano de 0,3 GB permiten ejecucion en entornos sin GPU dedicada, como Raspberry Pi o contenedores ligeros.
- Investigacion en TTS para portugues: el modelo sirve como base para experimentos de sintesis en variantes lusofonas gracias al fonemizador `tugaphone`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el formato ONNX y el tamano de 0,3 GB sugieren que puede ejecutarse en CPU sin GPU dedicada.
- GPU recomendadas: no disponible; al ser un modelo ONNX compacto, no requiere GPU de gama alta.
- Compatibilidad con GPU consumer: probable en cualquier GPU moderna, aunque no se documenta oficialmente.
- Opciones de despliegue: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS), inferencia ONNX Runtime.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Tamano |
|---|---|---|---|---|---|
| styletts2-pt_pt_x_lisbon-tuga_kokoro | StyleTTS2 | pt-PT | Apache 2.0 | ONNX | 0,3 GB |
| logus2k/kokoro_tts_eu_pt (upstream) | Kokoro/StyleTTS2 | pt | Apache 2.0 | no disponible | no disponible |
| Otros modelos StyleTTS2 de Phoonnx | StyleTTS2 | varios | Apache 2.0 | ONNX | variable |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en portugues europeo con acento de Lisboa; no soporta otros idiomas ni variantes regionales de forma nativa.
- No se documentan sesgos conocidos, pero al ser un modelo de voz entrenado con datos no especificados, puede presentar sesgos de prosodia o timbre.
- Riesgo de alucinacion en TTS: puede generar pronunciaciones incorrectas en palabras fuera del vocabulario o nombres propios.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo upstream `logus2k/kokoro_tts_eu_pt`.
- La informacion tecnica publica es muy limitada: no hay datos de parametros, entrenamiento ni benchmarks, lo que dificulta evaluar su calidad objetiva.
- El modelo tiene solo 25 descargas y 0 likes, lo que sugiere poca validacion por parte de la comunidad.
- Depende de la libreria `phoonnx` y del fonemizador `tugaphone`, lo que anade dependencias especificas del ecosistema.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/styletts2-pt_pt_x_lisbon-tuga_kokoro
- Modelo upstream: https://huggingface.co/logus2k/kokoro_tts_eu_pt
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Fonemizador tugaphone: https://github.com/TigreGotico/tugaphone
- Coleccion StyleTTS2 de Phoonnx: https://huggingface.co/collections/Phoonnx/styletts2-6af8ea97037f3d7eaf4b89c7
