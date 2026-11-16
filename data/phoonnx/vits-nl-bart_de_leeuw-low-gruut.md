# Phoonnx/vits-nl-bart_de_leeuw-low-gruut

## Resumen

`vits-nl-bart_de_leeuw-low-gruut` es un modelo de sintesis de voz (text-to-speech) en neerlandes basado en la arquitectura VITS, desarrollado originalmente por Mycroft AI como parte del conjunto de voces de Mimic3 y empaquetado por Phoonnx para su biblioteca de inferencia ONNX. El modelo convierte texto en neerlandes a audio hablado, tomando como entrada fonemas IPA generados mediante el fonemizador gruut que proporciona la libreria `scriptconv`.

La relevancia de este modelo es practica: se trata de una voz ligera (el repositorio ocupa aproximadamente 0,1 GB) pensada para despliegue en entornos de asistencia por voz como OVOS/Mycroft, donde el consumo de recursos y la latencia importan mas que la expresividad. Se distribuye como modelo ONNX, lo que permite ejecucion en CPU sin necesidad de GPU y facilita su integracion en pipelines de sintesis en tiempo real.

El modelo esta limitado al idioma neerlandes y su licencia CC-BY-SA-4.0 impone condiciones de atribucion y comparticion bajo la misma licencia, aspecto relevante para uso comercial. No se dispone de informacion publica sobre el numero de parametros, el conjunto de datos de entrenamiento ni resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no procesa contexto conversacional) |
| Tipos de cuantizacion | no disponible (distribucion en ONNX; variante "low" del nombre sugiere un modelo de menor calidad/tamano que la version estandar) |
| Idiomas soportados | neerlandes (`nl`) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas gruut en alfabeto IPA |
| Tamano del repositorio | ~0,1 GB |
| Libreria de inferencia | phoonnx (con `scriptconv[gruut]`) |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de sintesis de voz que combina un codificador de texto, un prior variacional condicionado por texto, un decodificador basado en flujos normalizadores y un discriminador adversarial entrenado conjuntamente. El modelo aprende directamente la correspondencia entre fonemas y forma de onda, evitando etapas intermedias explicitas de alineamiento, y emplea decodificacion estocastica con duracion variable para generar habla natural. La variante `low` del nombre indica que se trata de una version reducida del modelo original de Mycroft AI, orientada a menor coste computacional.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas mas alla de la propia arquitectura VITS. El modelo procede del repositorio `MycroftAI/mimic3-voices` (ruta `voices/nl/bart-de-leeuw_low`), que recopila voces preentrenadas para el motor Mimic3. Phoonnx se limita a empaquetar los pesos en formato ONNX y a definir el front-end de texto mediante gruut.

## Capacidades

- Sintesis de voz en neerlandes a partir de texto plano, con salida en formato WAV.
- Conversion de texto a fonemas IPA mediante el fonemizador gruut de `scriptconv`.
- Inferencia sobre ONNX, ejecutable en CPU sin GPU.
- Integracion directa con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Generacion de audio en streaming por frase mediante `voice.synthesize_wav`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No soporta vision, audio de entrada ni modo thinking.
- Capacidad multilingue limitada exclusivamente al neerlandes.

## Casos de uso

- Asistentes de voz para el hogar en neerlandes: integracion en OVOS/Mycroft mediante `ovos-tts-plugin-phoonnx` para responder a comandos de voz con latencia baja gracias a la inferencia ONNX en CPU.
- Lectura de notificaciones y alertas en aplicaciones neerlandesas: sintesis de mensajes cortos en dispositivos de bajo consumo (Raspberry Pi, mini-PC) sin necesidad de GPU.
- Accesibilidad para personas con discapacidad visual: conversion de texto en pantalla a voz en neerlandes dentro de lectores de pantalla o herramientas de escritorio.
- Sistemas de informacion publica: anuncios automatizados en estaciones, aeropuertos o comercios donde se requiere una voz neerlandesa consistente y ligera.
- Prototipado de interfaces conversacionales: generacion rapida de respuestas habladas en entornos de desarrollo y pruebas sin depender de servicios en la nube.
- Automatizacion de contenidos de audio: conversion por lotes de articulos o documentos en neerlandes a audio para podcasts internos o resumenes escuchables.
- Integracion en pipelines de domotica: respuestas habladas a eventos del hogar (sensores, rutinas) ejecutandose localmente en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido habitual; el modelo se ejecuta en CPU mediante ONNX. El repositorio ocupa aproximadamente 0,1 GB, por lo que la huella en memoria es reducida (del orden de cientos de MB incluyendo el runtime).
- GPU recomendadas: no son necesarias. Cualquier GPU compatible con ONNX Runtime puede acelerar la inferencia, pero el modelo esta disenado para CPU.
- Cabe en cualquier equipo de consumo: Raspberry Pi, mini-PC, portatiles y estaciones de trabajo sin GPU dedicada.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft, y ONNX Runtime de forma directa.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto/uso |
|---|---|---|---|---|---|
| vits-nl-bart_de_leeuw-low-gruut | VITS | nl | ONNX | CC-BY-SA-4.0 | TTS ligero en CPU |
| Otras voces Mimic3 nl (mismo repositorio upstream) | VITS | nl | ONNX/otros | CC-BY-SA-4.0 (segun upstream) | TTS para Mimic3/OVOS |
| Piper (voces neerlandesas) | VITS | nl | ONNX | MIT (mayoria de voces) | TTS ligero en CPU |
| Coqui TTS (voces nl) | VITS/Tacotron | nl | varios | MPL-2.0 / otras | TTS con mayor variedad de modelos |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) en la informacion proporcionada para establecer una comparacion cuantitativa con estos modelos.

## Limitaciones y advertencias

- Modelo mono-idioma: solo sintetiza neerlandes; el texto en otros idiomas producira una pronunciacion incorrecta o fallos.
- Dependencia del front-end gruut: la calidad de la sintesis depende de la correcta fonemizacion del texto de entrada; errores en la normalizacion afectan al audio.
- Variante `low`: al tratarse de una version reducida, la calidad de voz y naturalidad sera inferior a la de la version estandar del mismo autor.
- Licencia CC-BY-SA-4.0: permite uso comercial con atribucion, pero obliga a compartir las obras derivadas bajo la misma licencia, lo que puede ser restrictivo para productos propietarios.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero el modelo puede producir artefactos acusticos o pronunciaciones erroneas en palabras fuera del vocabulario de entrenamiento.
- Sin informacion publica sobre sesgos: no se dispone de datos sobre sesgos de genero, acento o dialecto en la voz entrenada.
- No apto para tareas de comprension, razonamiento o generacion de texto: es exclusivamente un sintetizador.
- Sin datos publicados de benchmarks ni de evaluacion subjetiva (MOS) en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-nl-bart_de_leeuw-low-gruut
- Repositorio upstream (Mycroft AI): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/nl/bart-de-leeuw_low
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
