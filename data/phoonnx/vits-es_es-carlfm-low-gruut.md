# Phoonnx/vits-es_es-carlfm-low-gruut

## Resumen

vits-es_es-carlfm-low-gruut es un modelo de sintesis de voz (text-to-speech) de arquitectura VITS desarrollado originalmente por Mycroft AI para su suite de voces Mimic 3, y empaquetado por Phoonnx para su libreria de inferencia ONNX. El modelo convierte texto en castellano de Espana (es-ES) en audio, tomando como entrada fonemas generados por el fonemizador gruut en alfabeto IPA. Se distribuye unicamente en formato ONNX, lo que facilita su despliegue en entornos Python y en el asistente de voz OVOS.

La relevancia de este modelo radica en su caracter practico: es una voz ligera (repo de 0,1 GB, variante "low" de Mycroft) pensada para sintesis en tiempo real en dispositivos con recursos limitados, integrable mediante el plugin `ovos-tts-plugin-phoonnx`. No es un modelo de proposito general ni compite en calidad con sistemas neuronales de gran escala; su valor esta en la licencia abierta CC-BY-SA-4.0, el soporte nativo de es-ES y la cadena de herramientas ya resuelta (phoonnx + scriptconv + gruut) para produccion en asistentes de voz.

No se dispone de informacion publica sobre el numero de parametros, la longitud de contexto (no aplica a TTS) ni los datos exactos de entrenamiento en la informacion proporcionada; la model card se limita a la procedencia, la licencia y las instrucciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech end-to-end) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | es-ES (castellano de Espana) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas gruut en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un sistema neuronal end-to-end que combina un encoder de texto condicionado por fonemas, un prior variacional, un decoder generativo y un discriminador adversarial entrenado conjuntamente. VITS es conocida por producir audio de calidad razonable sin necesidad de un vocoder externo, ya que genera la forma de onda directamente. La variante "low" de Mycroft AI esta disenada para reducir el coste computacional y el tamano del modelo, a costa de cierta calidad respecto a variantes "high" o "medium".

La entrada de texto no es texto crudo: phoonnx delega la normalizacion y la conversion a fonemas en la libreria scriptconv, que usa `GruutPhonemizer` (extra `scriptconv[gruut]`) para generar fonemas IPA. El modelo original procede del repositorio MycroftAI/mimic3-voices, en la ruta `voices/es_ES/carlfm_low`. No se dispone de informacion sobre el numero de horas de audio de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o fine-tuning adicional; la model card no detalla el proceso de entrenamiento.

## Capacidades

- Sintesis de voz a partir de texto en castellano de Espana (es-ES), con salida en fichero WAV.
- Conversion texto-a-fonemas mediante gruut (alfabeto IPA) como paso previo a la sintesis.
- Generacion de audio end-to-end sin vocoder externo, gracias a la arquitectura VITS.
- Integracion con el asistente de voz OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion sobre pesos ONNX, lo que permite inferencia en CPU y en entornos sin GPU.
- Variante "low" optimizada para bajo consumo de recursos y latencia reducida.
- No soporta tool calling, function calling, agentes, vision, audio de entrada ni modos de razonamiento; es exclusivamente un modelo TTS.
- Capacidad multilingue limitada al es-ES; no cubre otras variantes del espanol ni otros idiomas.

## Casos de uso

- Asistentes de voz locales: integracion en OVOS mediante `ovos-tts-plugin-phoonnx` configurando la voz `mimic3/es_ES/carlfm_low` en `mycroft.conf`, lo que permite respuestas habladas en castellano sin depender de servicios en la nube.
- Lectura de notificaciones y alertas: sintesis de mensajes cortos en aplicaciones de escritorio o domotica donde se requiere una voz es-ES ligera y de baja latencia en CPU.
- Accesibilidad para personas con discapacidad visual: conversion de texto de interfaces o documentos a audio en castellano, ejecutandose en hardware modesto gracias al formato ONNX y a la variante "low".
- Generacion de audiolibros o podcasts de bajo coste: sintesis por frases de textos largos en pipelines batch, aprovechando que el modelo procesa una frase por invocacion y no requiere GPU.
- Prototipado de productos de voz: validacion rapida de experiencias conversacionales en es-ES antes de invertir en voces comerciales de mayor calidad, con la ventaja de la licencia CC-BY-SA-4.0.
- Sistemas embebidos y edge computing: despliegue en dispositivos con recursos limitados (Raspberry Pi y similares) donde un modelo TTS de gran tamano no cabria, al ser un repositorio de 0,1 GB en ONNX.
- Pruebas automatizadas de pipelines de audio: generacion de locuciones sinteticas en es-ES para tests de integracion de sistemas de reconocimiento de voz o de telefonia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas MOS (Mean Opinion Score), WER, latencia ni comparaciones cuantitativas con otras voces.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo de 0,1 GB en ONNX y variante "low", es previsible que funcione en CPU sin GPU dedicada, aunque no se han publicado cifras oficiales.
- GPU recomendadas: no disponibles; el modelo esta pensado para inferencia en CPU mediante ONNX Runtime.
- Compatibilidad con GPU de consumo: no confirmada en la informacion proporcionada.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ONNX Runtime como backend subyacente. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamano |
|---|---|---|---|---|---|
| vits-es_es-carlfm-low-gruut (este modelo) | VITS | es-ES | CC-BY-SA-4.0 | ONNX | 0,1 GB |
| Otras voces de MycroftAI/mimic3-voices (p. ej. variantes high/medium de es_ES) | VITS | es-ES | CC-BY-SA-4.0 (segun repositorio upstream) | ONNX / otros | no disponible |
| Otras voces de la coleccion VITS de Phoonnx | VITS | varios | segun modelo | ONNX | no disponible |

No se dispone de datos de rendimiento comparativo (MOS, latencia) entre estas alternativas en la informacion proporcionada. La comparacion se limita a arquitectura, idioma, licencia y formato.

## Limitaciones y advertencias

- Calidad de audio limitada: la variante "low" de Mycroft prioriza eficiencia sobre fidelidad, por lo que la naturalidad y prosodia seran inferiores a voces neuronales de mayor tamano.
- Cobertura linguistica restringida al es-ES; no soporta otras variantes del espanol (es-MX, es-AR, etc.) ni otros idiomas.
- Dependencia de la cadena gruut/scriptconv: la calidad de la sintesis depende de la correcta fonemizacion del texto; errores en la normalizacion (numeros, abreviaturas, siglas) pueden degradar el audio.
- Licencia CC-BY-SA-4.0: permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia, lo que puede condicionar productos propietarios.
- Riesgo de alucinacion acustica: como todo modelo TTS, puede generar pronunciaciones incorrectas o artefactos en palabras fuera del dominio de entrenamiento, aunque no produce contenido textual inventado.
- Sin datos publicos sobre sesgos: no se ha documentado el perfil de voces, acentos o genero del hablante del dataset de entrenamiento, ni posibles sesgos asociados.
- Modelo con 0 descargas y 0 likes en Hugging Face en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.
- Fecha de creacion del repositorio (2026-11-16) posterior a la fecha de esta ficha: conviene verificar la vigencia y el estado del repositorio antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-es_es-carlfm-low-gruut
- Repositorio upstream (MycroftAI/mimic3-voices, voz es_ES/carlfm_low): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/es_ES/carlfm_low
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx en Hugging Face: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
