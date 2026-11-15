# Phoonnx/styletts2-en-kokoro-v0.19

## Resumen

styletts2-en-kokoro-v0.19 es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura StyleTTS2, desarrollado originalmente por hexgrad a partir del linaje Kokoro (kLegacy v0.19) y empaquetado en formato ONNX por Phoonnx para su uso con la libreria phoonnx. El modelo resuelve la conversion de texto a audio en ingles britanico y estadounidense, con un enfoque en despliegue ligero y multiplataforma.

El repositorio pesa aproximadamente 0,1 GB, lo que lo situa en la categoria de modelos TTS compactos y aptos para entornos con recursos limitados. La entrada de texto se realiza mediante fonemas misaki_en en alfabeto IPA, procesados por la libreria scriptconv, lo que separa la normalizacion textual del motor acustico.

Su relevancia actual radica en la integracion con el ecosistema OVOS (Open Voice OS) a traves del plugin ovos-tts-plugin-phoonnx, y en su licencia Apache 2.0, que permite uso comercial sin restricciones adicionales. Incluye once voces predefinidas con identificadores propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato ONNX) |
| Idiomas soportados | en-GB, en-US |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura StyleTTS2, un sistema de sintesis neuronal de voz que combina un generador acustico con un discriminador de estilo, orientado a producir habla natural con control de prosodia. La conversion a ONNX la realizo la comunidad onnx-community a partir del modelo Kokoro-82M-ONNX, y Phoonnx la empaqueto para su libreria homonima.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre procesos de RLHF o DPO en la informacion proporcionada. El modelo upstream es hexgrad/kLegacy/v0.19, y la front-end textual delega en scriptconv con el fonemizador MisakiEnPhonemizer (extra scriptconv[misaki]).

## Capacidades

- Sintesis de voz a partir de texto en ingles (en-GB y en-US).
- Entrada basada en fonemas misaki_en en alfabeto IPA, con normalizacion previa del texto mediante scriptconv.
- Once voces predefinidas: af, af_bella, af_nicole, af_sarah, af_sky, am_adam, am_michael, bf_emma, bf_isabella, bm_george, bm_lewis.
- Generacion de audio en formato WAV mediante la API synthesize_wav de phoonnx.
- Integracion como plugin TTS en OVOS (ovos-tts-plugin-phoonnx) configurable via mycroft.conf.
- No se documentan capacidades de tool calling, agentes, vision ni audio de entrada.

## Casos de uso

- Asistentes de voz en OVOS: el modelo se integra como modulo TTS del asistente mediante ovos-tts-plugin-phoonnx, seleccionando la voz en mycroft.conf, lo que permite respuestas habladas en ingles sin infraestructura adicional.
- Lectura de contenido en aplicaciones de accesibilidad: sintesis de texto a WAV con voces en-GB y en-US para lectores de pantalla o narracion de documentos.
- Generacion de locuciones para prototipos y demos: el tamano de 0,1 GB facilita incluirlo en entornos de desarrollo y CI para producir audio de prueba de forma reproducible.
- Sistemas embebidos y de bajo consumo: el formato ONNX permite ejecucion en CPU y en dispositivos con recursos limitados, sin requerir GPU dedicada.
- Localizacion de contenido en dos variantes de ingles: la disponibilidad de voces britanicas (bf_emma, bf_isabella, bm_george, bm_lewis) y estadounidenses (af, am_adam, etc.) permite adaptar la locucion al publico objetivo.
- Pipelines de sintesis por lotes: la API de phoonnx permite cargar una voz y sintetizar multiples frases a ficheros WAV, adecuada para generar narraciones a partir de guiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo se distribuye en ONNX y esta pensado para ejecucion en CPU.
- GPU recomendadas: no disponible; no se documentan requisitos de GPU.
- Compatibilidad con GPU de consumo: no confirmada en la informacion proporcionada.
- Opciones de despliegue: phoonnx (Python) y el plugin ovos-tts-plugin-phoonnx para OVOS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| styletts2-en-kokoro-v0.19 | no disponible | no disponible | en-GB, en-US | Apache 2.0 | ONNX |
| hexgrad/kLegacy/v0.19 (upstream) | no disponible | no disponible | en-GB, en-US | Apache 2.0 | no disponible |
| onnx-community/Kokoro-82M-ONNX | 82M (segun nombre del repo) | no disponible | no disponible | no disponible | ONNX |

Los datos de rendimiento comparado no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles (en-GB y en-US); no hay soporte multilingue documentado.
- La entrada debe pasar por el fonemizador misaki_en; un texto mal normalizado o fuera de dominio puede degradar la calidad de la sintesis.
- No se documentan sesgos conocidos ni evaluaciones de robustez del modelo.
- Riesgo de alucinacion acustica o pronunciacion incorrecta en palabras fuera del vocabulario o nombres propios no cubiertos por el fonemizador.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo upstream hexgrad/kLegacy; conviene verificar las condiciones de dicho repositorio.
- El modelo se distribuye exclusivamente en ONNX y depende de la libreria phoonnx y de scriptconv con el extra misaki, lo que limita su uso fuera de ese ecosistema.
- Numero de descargas y likes muy bajos (24 y 0 respectivamente), lo que indica escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/styletts2-en-kokoro-v0.19
- Modelo upstream: https://huggingface.co/hexgrad/kLegacy/tree/main/v0.19
- Conversion ONNX: https://huggingface.co/onnx-community/Kokoro-82M-ONNX
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion StyleTTS2 de Phoonnx: https://huggingface.co/collections/Phoonnx/styletts2-6af8ea97037f3d7eaf4b89c7
