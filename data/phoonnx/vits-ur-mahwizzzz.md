# Phoonnx/vits-ur-mahwizzzz

## Resumen

vits-ur-mahwizzzz es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por el usuario mahwizzzz (repositorio upstream `mahwizzzz/vits-ur`) y empaquetado por Phoonnx en formato ONNX para su uso con la libreria `phoonnx`. El modelo esta especializado exclusivamente en el idioma urdu (`ur`) y convierte texto en caracteres de dicho idioma en audio sintetizado.

La relevancia de este modelo reside en su formato de distribucion: al estar empaquetado como ONNX dentro del ecosistema phoonnx, puede ejecutarse en Python y en el asistente de voz OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, lo que facilita su integracion en sistemas de asistencia vocal de codigo abierto sin depender de frameworks de entrenamiento pesados. El repositorio ocupa aproximadamente 0,1 GB, lo que sugiere un modelo compacto orientado a inferencia ligera.

No se dispone de informacion publica sobre el numero de parametros, la longitud de contexto (no aplica de forma directa en TTS) ni los datos de entrenamiento utilizados. La model card se limita a describir la procedencia, el uso mediante phoonnx y el front-end de texto basado en grapheme phonemizer de scriptconv.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS); entrada basada en caracteres del texto |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | urdu (`ur`) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema end-to-end de sintesis de voz que combina un encoder de texto, un prior variacional, un decoder generativo basado en flujos normalizadores y un discriminador adversarial multiperiodo durante el entrenamiento. VITS genera waveforms directamente a partir del texto sin necesidad de un vocoder separado, lo que simplifica el pipeline de inferencia. En este caso, el modelo se distribuye como grafo ONNX optimizado para ejecucion mediante la libreria phoonnx.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO (no aplicable tipicamente a TTS) ni innovaciones tecnicas adicionales mas alla de las propias de VITS. El front-end de texto utiliza `GraphemePhonemizer` de la libreria scriptconv, que normaliza el texto y lo convierte en la entrada del modelo basandose en grafemas (caracteres) en lugar de fonemas explicitos.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto en urdu.
- Generacion de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Entrada basada en caracteres (graphemes) del texto en urdu, sin requerir transcripcion fonetica manual.
- Integracion con el asistente de voz OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en Python a traves de `TTSModelManager` y carga de voces desde el repositorio de Hugging Face.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso (es un modelo puramente TTS).
- Capacidad multilingue limitada exclusivamente al urdu.

## Casos de uso

- Asistencia vocal en urdu para OVOS: el modelo se integra como plugin TTS (`ovos-tts-plugin-phoonnx`) y permite que un asistente de voz de codigo abierto responda en urdu, seleccionando la voz `hf_community/mahwizzzz/vits-ur` en `mycroft.conf`.
- Lectura de contenido en urdu: conversion de articulos, noticias o documentacion a audio para aplicaciones de accesibilidad o consumo pasivo, gracias a la sintesis directa desde texto en caracteres.
- Generacion de avisos y notificaciones habladas: sistemas de megafonia o alertas automatizadas que necesiten emitir mensajes pregrabados o dinamicos en urdu sin intervencion humana.
- Prototipado de interfaces conversacionales en urdu: desarrolladores que construyan chatbots de voz pueden usar el modelo para la capa de salida de audio con una dependencia ligera (0,1 GB) y licencia MIT.
- Audiolibros y contenido educativo: sintesis de material didactico o narrativo en urdu para plataformas de aprendizaje, con la ventaja de un modelo compacto que puede ejecutarse en entornos con recursos limitados.
- Pruebas de integracion en pipelines Python: el modelo sirve como voz de referencia en tests automatizados de sistemas TTS dentro del ecosistema phoonnx, verificando la generacion de WAV y la normalizacion de texto con scriptconv.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el tamano del repositorio (0,1 GB) sugiere que el modelo puede cargarse en memoria de forma muy ligera, probablemente por debajo de 1 GB en formato ONNX.
- GPU recomendadas: no disponible; por el tamano, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) deberia ser suficiente, e incluso la inferencia en CPU es plausible.
- Compatibilidad con GPU consumer: altamente probable dado el reducido tamano del modelo, aunque no se confirma en la documentacion.
- Opciones de despliegue: libreria `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ejecucion ONNX Runtime subyacente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Tamano repo |
|---|---|---|---|---|---|
| vits-ur-mahwizzzz | VITS | urdu | MIT | ONNX | 0,1 GB |
| Otros modelos VITS de la coleccion Phoonnx | VITS | variable | variable (segun upstream) | ONNX | variable |
| Modelos TTS multilingues genericos | variable | multiples | variable | variable | no disponible |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) entre este modelo y alternativas, por lo que la comparativa se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- El modelo solo soporta urdu (`ur`); no es util para otros idiomas sin reentrenamiento.
- No se han publicado evaluaciones de calidad de sintesis (MOS, inteligibilidad) ni sesgos conocidos.
- Riesgo de pronunciacion incorrecta en palabras extranjeras, nombres propios o terminologia tecnica, dado el front-end basado en grafemas.
- La licencia MIT permite uso comercial, pero se hereda de la declaracion del repositorio upstream `mahwizzzz/vits-ur`; conviene verificar dicha declaracion en el repositorio original.
- El modelo depende de la libreria phoonnx (version preliminar `--pre`) y de scriptconv, lo que puede implicar inestabilidad en la API.
- No apto para tareas de razonamiento, generacion de texto, codigo ni vision.
- El reducido numero de descargas (26) y la ausencia de likes sugieren poca validacion por parte de la comunidad; conviene realizar pruebas propias antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-ur-mahwizzzz
- Repositorio upstream: https://huggingface.co/mahwizzzz/vits-ur
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
