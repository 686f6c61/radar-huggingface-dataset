# Phoonnx/vits-pl_pl-mls_6892-low-espeak

## Resumen

vits-pl_pl-mls_6892-low-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y reempaquetado por Phoonnx para su libreria de inferencia ONNX homonima. El modelo convierte texto en polaco (pl-PL) a audio inteligible, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. Su origen es el checkpoint `pl_PL/mls_6892/low` del repositorio `rhasspy/piper-voices`, que a su vez se entrena sobre el corpus MLS (Multilingual Libspeech).

La relevancia de este modelo es practica: ofrece una voz polaca ligera (variante "low", es decir, la de menor calidad y tamano de la familia Piper) empaquetada en formato ONNX para ejecucion local sin GPU, integrable en asistentes de voz como OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`. No es un modelo de lenguaje ni un sistema de razonamiento: es un componente de sintesis acustica de proposito especifico, con licencia MIT y un tamano de repositorio de aproximadamente 0,1 GB.

Al tratarse de un reempaquetado de un checkpoint upstream, no aporta innovaciones arquitectonicas propias; su valor esta en la distribucion estandarizada, la integracion con la cadena de herramientas de Phoonnx (scriptconv para normalizacion y fonemizacion) y la posibilidad de desplegarlo en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech, end-to-end) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS; la entrada es una frase de texto) |
| Tipos de cuantizacion | no disponible (pesos ONNX empaquetados; variante "low" de Piper, sin detalle de precision) |
| Idiomas soportados | polaco (pl-PL) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | ~0,1 GB |
| Libreria de inferencia | phoonnx (Python, OVOS) |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de sintesis de voz que combina un codificador de texto, un prior variacional, un decodificador generativo basado en flujos normalizadores y un discriminador adversarial en entrenamiento, con alineamiento monotono aprendido (MAS) para evitar la necesidad de alineamientos fonema-audio explicitos. El resultado es un modelo que genera waveform directamente a partir de fonemas, sin vocoder separado. En esta ficha no se dispone de detalles sobre el numero de parametros, la composicion exacta del dataset ni el numero de pasos de entrenamiento.

El checkpoint upstream corresponde a la voz `pl_PL/mls_6892` de Piper, entrenada sobre el corpus MLS (Multilingual LibriSpeech) para polaco. La variante "low" indica la configuracion de menor calidad y tamano de la familia Piper, pensada para inferencia rapida en CPU. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineamiento adicionales; el pipeline es el estandar de entrenamiento de VITS con perdidas adversariales y de reconstruccion.

## Capacidades

- Sintesis de voz a partir de texto en polaco (pl-PL), con salida en fichero WAV.
- Fonemizacion mediante espeak-ng (o el port espyak incluido en el extra `phoonnx[espeak]`), con entrada en alfabeto IPA.
- Normalizacion y conversion de texto delegadas a la libreria scriptconv (`EspeakPhonemizer` de `scriptconv_copyleft.phonemizers.mul`).
- Ejecucion en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Integracion con el ecosistema OVOS/Mycroft a traves del plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador mediante phoonnx.js (con entrada espeak o unicode).
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio de entrada; es exclusivamente TTS.

## Casos de uso

- Asistente de voz local en polaco: integrado en OVOS/Mycroft mediante `ovos-tts-plugin-phoonnx`, el modelo sintetiza respuestas del asistente en tiempo real en CPU, sin depender de servicios en la nube y con licencia MIT para uso comercial.
- Lectura de notificaciones y alertas en aplicaciones de escritorio: el modelo puede generar avisos hablados breves en polaco con baja latencia al ejecutarse sobre ONNX Runtime en el propio equipo del usuario.
- Accesibilidad para personas con discapacidad visual: conversion de texto de interfaces, documentos o paginas web a audio en polaco, aprovechando que el modelo es ligero (~0,1 GB) y no requiere GPU.
- Sistemas de megafonia y anuncios automatizados: generacion por lotes de locuciones en polaco para transporte publico, comercios o edificios, donde la variante "low" prioriza velocidad de sintesis sobre fidelidad acustica.
- Prototipado de interfaces conversacionales en polaco: desarrolladores que necesiten una voz de referencia rapida para validar un flujo de dialogo antes de invertir en un modelo TTS de mayor calidad.
- Educacion y aprendizaje de idiomas: sintesis de frases en polaco para ejercicios de pronunciacion y dictado, con la salvedad de que la calidad "low" puede introducir imprecisiones en palabras concretas.
- Pruebas de regresion en pipelines de TTS: al estar empaquetado de forma estandarizada para phoonnx, sirve como voz de referencia reproducible en tests automatizados de sintesis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo esta pensado para ejecucion en CPU mediante ONNX Runtime.
- GPU recomendadas: no disponible; no se documenta requisito de GPU.
- Compatibilidad con GPU de consumo: irrelevante para el caso de uso previsto; el modelo (~0,1 GB) cabe holgadamente en cualquier equipo.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft, y phoonnx.js en navegador.
- Dependencias: espeak-ng instalado en el sistema (por ejemplo `apt install espeak-ng`) o el extra `phoonnx[espeak]` con el port espyak.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| vits-pl_pl-mls_6892-low-espeak (este) | VITS | pl-PL | ~0,1 GB | MIT | ONNX | Variante "low" de Piper, empaquetada para phoonnx |
| Otras voces Piper `pl_PL` (p. ej. variantes medium/high) | VITS | pl-PL | no disponible | MIT | ONNX | Mayor calidad a costa de tamano y latencia; misma familia upstream |
| Modelos TTS multilingues de gran tamano (p. ej. familia XTTS) | no disponible en esta ficha | multi | no disponible | no disponible | no disponible | No se dispone de datos verificados para comparar en esta ficha |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos alternativos en la informacion proporcionada, por lo que la comparativa se limita a la familia Piper y queda incompleta.

## Limitaciones y advertencias

- Calidad acustica limitada: la variante "low" de Piper prioriza velocidad y tamano reducido, con menor naturalidad y fidelidad que las variantes medium o high.
- Dependencia de espeak-ng: sin espeak-ng instalado, el modelo usa el port espyak, cuyos fonemas difieren en algunos casos y pueden producir pronunciaciones incorrectas.
- Cobertura linguistica restringida a polaco (pl-PL); no soporta otros idiomas ni cambio de voz o estilo.
- Riesgo de errores de pronunciacion en palabras fuera del vocabulario o con grafia ambigua, derivado de la fonemizacion automatica.
- No apto para clonacion de voz, control de emocion ni sintesis expresiva.
- Sin datos publicados de sesgos acusticos ni de evaluacion perceptual (MOS) en la informacion disponible.
- Licencia MIT declarada por el upstream en la model card de `rhasspy/piper-voices`; conviene verificar los terminos del corpus MLS subyacente si se requiere un analisis legal exhaustivo para uso comercial.
- El modelo es un reempaquetado: las mejoras o correcciones deben provenir del checkpoint upstream de Rhasspy/Piper.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-pl_pl-mls_6892-low-espeak
- Checkpoint upstream (Piper): https://huggingface.co/rhasspy/piper-voices/tree/main/pl/pl_PL/mls_6892/low
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion de modelos VITS para phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
