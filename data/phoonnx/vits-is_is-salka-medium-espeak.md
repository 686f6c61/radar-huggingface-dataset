# Phoonnx/vits-is_is-salka-medium-espeak

## Resumen

vits-is_is-salka-medium-espeak es un modelo de sintesis de voz (text-to-speech) de arquitectura VITS, empaquetado por Phoonnx a partir del modelo original de Rhasspy publicado en el repositorio piper-voices (ruta `is/is_IS/salka/medium`). El modelo genera audio a partir de texto en islandes (is-IS) y esta distribuido en formato ONNX para su uso con la libreria phoonnx, que actua como motor de inferencia tanto en Python como en el ecosistema OVOS.

El modelo resuelve el problema de la sintesis de voz offline para islandes, un idioma con pocos recursos en el ambito TTS. La arquitectura VITS combina un encoder de texto, un prior variacional y un decodificador generativo adversarial, lo que permite obtener audio de calidad razonable sin depender de servicios en la nube. El front-end de texto utiliza fonemas espeak-ng en alfabeto IPA, por lo que requiere la instalacion de espeak-ng (o del port espyak) para la conversion de texto a fonemas.

El empaquetado de Phoonnx anade una capa de integracion (gestor de voces, plugin para OVOS, soporte en navegador via phoonnx.js) sobre el modelo original de Rhasspy. El repositorio es pequeno (0,1 GB) y la licencia declarada es MIT, lo que facilita su uso comercial. No se han publicado resultados de benchmarks ni metricas de calidad subjetiva (MOS) en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica contexto de LLM) |
| Tipos de cuantizacion | no disponible (pesos ONNX; el modelo se distribuye empaquetado, sin variantes de cuantizacion documentadas) |
| Idiomas soportados | islandes (is-IS) |
| Licencia | MIT |
| Formato de pesos | ONNX (empaquetado para la libreria phoonnx) |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de sintesis de voz que integra en un unico modelo un encoder de texto condicionado por fonemas, un prior variacional con normalizing flows, un decoder basado en HiFi-GAN y un discriminador adversarial multi-periodo entrenado conjuntamente. Esta diseno permite generar waveforms directamente desde fonemas sin un vocoder externo separado, con inferencia en una sola pasada.

El modelo original fue entrenado por Rhasspy dentro del proyecto piper-voices, orientado a TTS offline de baja latencia para asistentes de voz. La informacion disponible no detalla el numero de tokens de audio, la composicion del dataset de entrenamiento, ni si se aplicaron tecnicas de RLHF o fine-tuning especifico. El front-end de texto no forma parte del modelo: phoonnx delega la normalizacion y la fonemizacion en la libreria scriptconv, que usa `EspeakPhonemizer` para producir fonemas IPA a partir de texto islandes. Esta separacion implica que la calidad de la sintesis depende de la correcta instalacion de espeak-ng; el autor advierte que el port espyak puede producir fonemas distintos y provocar errores de pronunciacion en algunas palabras.

## Capacidades

- Sintesis de voz a partir de texto en islandes (is-IS), con salida en formato WAV.
- Generacion de audio offline, sin dependencia de APIs externas ni conexion a internet.
- Entrada basada en fonemas espeak-ng en alfabeto IPA, lo que permite control fino de la pronunciacion si se proporcionan fonemas directamente.
- Integracion con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Ejecucion en navegador mediante phoonnx.js (demo disponible en tigregotico.pt/demo).
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades propias de modelos de lenguaje; es exclusivamente un modelo TTS.
- No dispone de modo thinking, vision ni audio de entrada.

## Casos de uso

- Asistentes de voz offline para islandes: el modelo puede integrarse en OVOS como motor TTS local, permitiendo respuestas habladas sin conexion y con baja latencia en dispositivos de borde.
- Lectura de contenido en islandes: conversion de articulos, noticias o documentacion a audio para consumo en movilidad o accesibilidad, usando el modelo empaquetado en ONNX con phoonnx.
- Sistemas de navegacion y avisos por voz: generacion de instrucciones habladas en islandes en entornos con conectividad limitada, donde un TTS en la nube no es viable.
- Accesibilidad para personas con discapacidad visual: sintesis de texto a voz en islandes para lectores de pantalla o aplicaciones de asistencia, aprovechando el tamano reducido del repositorio (0,1 GB).
- Prototipado de interfaces conversacionales: desarrollo de demos y pruebas de concepto de asistentes en islandes usando el plugin de OVOS o la API de Python de phoonnx, sin coste de API.
- Aplicaciones web de sintesis de voz: ejecucion en el navegador mediante phoonnx.js para generar audio en islandes del lado del cliente, reduciendo la carga del servidor.
- Generacion de audiolibros o podcasts en islandes: sintesis por lotes de textos largos con control de pronunciacion mediante fonemas IPA, aunque la calidad depende de la fonemizacion de espeak-ng.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de metricas MOS, WER de sintesis, ni comparativas numericas con otros modelos TTS para islandes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (0,1 GB) y la arquitectura VITS "medium", es previsible que quepa en GPUs de gama baja e incluso en CPU, aunque no se confirman cifras concretas.
- GPU recomendadas: no disponibles. Un modelo VITS de este tamano suele ejecutarse en CPU sin problemas; para mayor throughput se podria usar cualquier GPU compatible con ONNX Runtime, pero no hay datos publicados.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del modelo, aunque no se dispone de confirmacion oficial.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, phoonnx.js en navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-is_is-salka-medium-espeak (este modelo) | VITS | islandes (is-IS) | repo 0,1 GB | MIT | ONNX (phoonnx) | Hugging Face, phoonnx, OVOS, navegador |
| rhasspy/piper-voices is_IS/salka/medium (upstream) | VITS | islandes (is-IS) | no disponible | MIT | Piper (ONNX) | Hugging Face (repo piper-voices) |
| Otros modelos TTS para islandes | no disponible | islandes | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos TTS comparables para islandes en la informacion proporcionada. El modelo upstream de Rhasspy es la referencia directa; este empaquetado anade la integracion con phoonnx y OVOS.

## Limitaciones y advertencias

- El modelo solo soporta islandes (is-IS); no es multilingue y no debe usarse para otros idiomas.
- La calidad de la sintesis depende de la fonemizacion con espeak-ng; el uso del port espyak puede provocar pronunciaciones incorrectas en algunas palabras, segun advierte el autor.
- No se han publicado metricas de calidad (MOS) ni benchmarks, por lo que el rendimiento real en produccion no esta cuantificado.
- Riesgo de alucinacion no aplica en el sentido de LLM, pero si existe riesgo de pronunciacion erronea o entonacion inadecuada en textos con abreviaturas, numeros o nombres propios no cubiertos por la normalizacion de scriptconv.
- No se documentan sesgos especificos del dataset de entrenamiento; al ser un modelo de voz, podria reflejar sesgos de los hablantes y del corpus original de Piper.
- La licencia MIT permite uso comercial, pero se recomienda verificar la licencia del modelo upstream en rhasspy/piper-voices, ya que el empaquetado declara MIT basandose en la model card original.
- Requiere instalar espeak-ng (o el extra `phoonnx[espeak]`) para el front-end de texto; sin esta dependencia el modelo no puede procesar texto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica baja adopcion y ausencia de validacion comunitaria.
- No hay soporte documentado para cuantizacion ni para aceleracion por hardware especifica (GPU, NPU); el despliegue se limita a las opciones que ofrece phoonnx.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-is_is-salka-medium-espeak
- Modelo upstream (Rhasspy Piper): https://huggingface.co/rhasspy/piper-voices/tree/main/is/is_IS/salka/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
