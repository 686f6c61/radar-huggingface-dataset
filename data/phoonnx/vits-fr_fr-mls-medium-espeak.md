# Phoonnx/vits-fr_fr-mls-medium-espeak

## Resumen

vits-fr_fr-mls-medium-espeak es un modelo de sintesis de voz (text-to-speech) en frances de Francia, empaquetado por Phoonnx para su libreria de inferencia ONNX homonima. El modelo original procede de Rhasspy, concretamente de la voz `fr_FR/mls/medium` del repositorio piper-voices, y emplea la arquitectura VITS, un modelo generativo condicional de extremo a extremo que combina un encoder de texto, un predictor de duracion y un decoder basado en flujos normales junto con un discriminador adversarial durante el entrenamiento. El paquete distribuido ocupa aproximadamente 0,1 GB y se publica bajo licencia MIT.

La relevancia de este artefacto es fundamentalmente practica: no introduce innovaciones de modelado, sino que reempaqueta un checkpoint ya existente en formato ONNX para que pueda ejecutarse con la libreria phoonnx, tanto en Python como en el ecosistema OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx`. El front-end de texto delega en la libreria scriptconv, que normaliza la entrada y la convierte a fonemas mediante espeak-ng en el alfabeto IPA. El modelo esta especializado exclusivamente en frances y no soporta otras lenguas ni tareas distintas de la sintesis de voz.

Al tratarse de una voz de tamano "medium" del catalogo de Piper, esta pensada para entornos con recursos limitados, como asistentes de voz embebidos, dispositivos de domotica o aplicaciones de escritorio, donde el coste computacional y la latencia importan mas que la naturalidad absoluta de la sintesis. El repositorio no incluye informacion sobre el numero de parametros, el volumen de datos de entrenamiento ni resultados de evaluacion subjetiva o automatica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (distribucion en ONNX; el repo no detalla variantes cuantizadas) |
| Idiomas soportados | frances de Francia (`fr-FR`) |
| Licencia | MIT |
| Formato de pesos | ONNX (empaquetado para la libreria phoonnx) |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | aproximadamente 0,1 GB |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz de extremo a extremo que integra en un unico modelo un encoder de texto condicionado por alineamientos monotonos, un predictor de duracion, un modulo de expansion basado en flujos normales y un decoder generativo que produce la forma de onda, todo ello entrenado de forma adversarial conjuntamente con discriminadores de multiples resoluciones. Esta formulacion permite generar audio de forma directa sin necesidad de un vocoder neuronal separado, lo que reduce la complejidad del pipeline de inferencia. El modelo se distribuye en formato ONNX, lo que facilita su ejecucion en CPU y en entornos sin dependencias de frameworks de deep learning pesados.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del corpus ni si se aplicaron etapas de ajuste fino con RLHF o DPO, algo por otra parte poco habitual en modelos TTS. La voz procede del conjunto "mls" del catalogo de Piper, y el autor del modelo original es Rhasspy. El front-end de texto, gestionado por scriptconv, realiza normalizacion textual y fonemizacion mediante espeak-ng; el autor advierte que el uso del port espyak en lugar de espeak-ng nativo puede provocar diferencias foneticas y errores de pronunciacion en algunas palabras.

## Capacidades

- Sintesis de voz en frances de Francia a partir de texto plano, con salida en fichero WAV mediante `voice.synthesize_wav`.
- Fonemizacion de entrada mediante espeak-ng en alfabeto IPA, con normalizacion previa del texto a cargo de scriptconv.
- Integracion con el ecosistema OVOS como plugin de TTS (`ovos-tts-plugin-phoonnx`), configurable mediante `mycroft.conf`.
- Ejecucion en Python a traves de `phoonnx.model_manager.TTSModelManager` y en navegador mediante phoonnx.js.
- No soporta tool calling, function calling, razonamiento multi-paso, vision, audio de entrada ni modo de pensamiento; es exclusivamente un modelo de sintesis.
- Cobertura multilingue limitada al frances; no se documentan capacidades en otras lenguas.

## Casos de uso

- Asistentes de voz embebidos en OVOS: el modelo se integra como plugin de TTS y permite dotar de voz francesa a un asistente domestico local, con un peso de repositorio de 0,1 GB que cabe holgadamente en dispositivos de gama baja.
- Domotica y altavoces inteligentes: la inferencia ONNX en CPU permite generar respuestas habladas en un Raspberry Pi o dispositivo similar sin GPU dedicada, manteniendo la privacidad al no requerir servicios en la nube.
- Lectura de notificaciones y alertas: sintesis de mensajes cortos generados por sistemas de monitorizacion o aplicaciones de escritorio, donde la latencia de un modelo VITS medio es adecuada para frases de una o dos lineas.
- Accesibilidad para personas con discapacidad visual: conversion de contenido textual en frances a audio para lectores de pantalla o aplicaciones de apoyo, con la ventaja de funcionar de forma completamente local.
- Prototipado de interfaces conversacionales en frances: permite validar flujos de voz en fases tempranas de desarrollo sin coste de API y con control total sobre el modelo desplegado.
- Generacion de audio para contenidos educativos o demostraciones: produccion de locuciones en frances para materiales de e-learning o pruebas de concepto, siempre que no se requiera una calidad de estudio.
- Pruebas de regresion en pipelines de TTS: al ser un artefacto ONNX empaquetado, sirve como referencia estable para comparar cambios en el front-end de normalizacion o en la fonemizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo VITS de tamano medio distribuido en ONNX, es habitual que opere en CPU sin GPU dedicada, aunque el repositorio no confirma cifras de memoria.
- GPU recomendadas: no disponible. No se documentan requisitos de GPU especificos.
- Compatibilidad con GPU de consumo: no confirmada en la informacion proporcionada; el diseno ONNX y el tamano de 0,1 GB sugieren viabilidad en hardware modesto, pero no hay datos oficiales.
- Opciones de despliegue: libreria phoonnx en Python (`TTSModelManager`), plugin `ovos-tts-plugin-phoonnx` para OVOS y phoonnx.js para navegador. Requiere espeak-ng instalado en el sistema o el extra `phoonnx[espeak]` con el port espyak.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Tamano | Licencia | Formato |
|---|---|---|---|---|---|
| vits-fr_fr-mls-medium-espeak (este modelo) | VITS | fr-FR | aprox. 0,1 GB | MIT | ONNX (phoonnx) |
| Otras voces Piper `fr_FR` (p. ej. variantes de piper-voices) | VITS | fr-FR | no disponible | MIT (segun upstream) | ONNX |
| Modelos TTS multilingues de gran tamano (p. ej. familia XTTS) | no disponible en esta ficha | multilingue | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada; la comparacion se limita a aspectos de formato, licencia e idioma.

## Limitaciones y advertencias

- Cobertura linguistica restringida exclusivamente al frances de Francia; no se debe esperar un comportamiento correcto en otras lenguas o variantes regionales.
- La calidad de pronunciacion depende de espeak-ng: el uso del port espyak puede introducir errores foneticos en determinadas palabras, segun advierte el propio autor.
- No se han publicado evaluaciones subjetivas (MOS) ni metricas objetivas de inteligibilidad o naturalidad, por lo que la calidad real de la voz no esta cuantificada.
- Riesgo de alucinacion en el sentido de prosodia o pronunciacion incorrecta ante texto no normalizado, siglas, numeros o nombres propios; la normalizacion de scriptconv mitiga parte del problema pero no lo elimina.
- El modelo no dispone de control explicito de emocion, estilo ni velocidad mas alla de lo que permita la propia arquitectura VITS.
- Licencia MIT: permite uso comercial y modificacion, pero conviene verificar la cadena de atribucion hasta el repositorio original de Rhasspy y conservar el aviso de copyright correspondiente.
- Repositorio con cero descargas y cero likes en el momento de la consulta; se trata de un empaquetado reciente sin validacion comunitaria documentada.
- No se documentan sesgos especificos del corpus de entrenamiento (voces, acentos o demografia), lo que impide evaluar su representatividad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-fr_fr-mls-medium-espeak
- Repositorio upstream (Piper voices, fr_FR/mls/medium): https://huggingface.co/rhasspy/piper-voices/tree/main/fr/fr_FR/mls/medium
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion de modelos VITS empaquetados para phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
