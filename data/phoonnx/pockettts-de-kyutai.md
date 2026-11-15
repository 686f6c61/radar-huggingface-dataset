# Phoonnx/pockettts-de-kyutai

## Resumen

pockettts-de-kyutai es un paquete de sintesis de voz (text-to-speech) en aleman basado en la arquitectura Pocket TTS desarrollada por Kyutai. Lo publica Phoonnx, que lo redistribuye como modelo ONNX listo para su libreria `phoonnx`, un motor TTS en Python integrable en el asistente de voz OVOS. El modelo original procede del repositorio `kyutai/pocket-tts/languages/german` y la conversion a ONNX la firma KevinAHM.

El modelo resuelve la necesidad de disponer de un TTS ligero, ejecutable en local y sin dependencias de servicios en la nube, para aplicaciones de asistencia por voz en aleman. Al estar empaquetado en ONNX, se puede ejecutar con el runtime de ONNX sin necesidad de GPU dedicada, lo que lo hace apto para dispositivos de bajos recursos y despliegues embebidos.

Es relevante ahora porque el ecosistema OVOS/Mycroft busca alternativas abiertas y autoalojadas a los TTS comerciales, y este paquete ofrece 26 voces en aleman bajo licencia CC-BY-4.0 con un tamano de repositorio de solo 0,8 GB. La informacion publica no detalla el numero de parametros ni la longitud de contexto, por lo que varios datos tecnicos quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pocket TTS (red neuronal TTS, detalles internos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | aleman (`de`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,8 GB |
| Entrada de texto | puntos de codigo Unicode del texto |
| Voces incluidas | 26 (alba, anna, azelma, bill_boerst, caro_davy, charles, cosette, eponine, estelle, eve, fantine, george, giovanni, jane, javert, jean, juergen, lola, marius, mary, michael, paul, peter_yearsley, rafael, stuart_bell, vera) |
| Libreria | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

La model card identifica la arquitectura como Pocket TTS, un sistema de sintesis de voz desarrollado por Kyutai, pero no publica detalles sobre el tipo de red (si es un transformer, un modelo difusivo, un modelo autoregresivo de tokens acusticos u otra variante), el numero de parametros ni la composicion del corpus de entrenamiento. Tampoco se documenta si hubo etapas de ajuste fino con preferencias humanas o entrenamiento con datos paralelos texto-audio especificos.

El unico detalle tecnico de preprocesado disponible es el front-end de texto: phoonnx delega la normalizacion en la libreria `scriptconv`, que aplica el `UnicodeCodepointPhonemizer` de `scriptconv.phonemizers.base`. Es decir, el modelo recibe directamente puntos de codigo Unicode del texto en lugar de una representacion fonetica intermedia, lo que simplifica el pipeline pero traslada al modelo la responsabilidad de interpretar la ortografia alemana.

La distribucion se realiza como grafo ONNX, lo que permite ejecucion con ONNX Runtime en CPU y potencialmente en GPU, aunque no se especifican las optimizaciones aplicadas durante la conversion (fusion de operadores, cuantizacion, etc.).

## Capacidades

- Sintesis de voz a partir de texto en aleman, con salida en formato WAV.
- 26 voces preentrenadas distintas, seleccionables por identificador (`pockettts/de/<voz>`).
- Ejecucion local mediante ONNX Runtime, sin dependencia de API externa.
- Integracion con OVOS a traves del plugin `ovos-tts-plugin-phoonnx`.
- Entrada de texto basada en puntos de codigo Unicode, sin necesidad de un fonemizador especifico del aleman en el paquete.
- No se documenta soporte de clonacion de voz, control de emocion, prosodia ajustable, tool calling ni capacidades multimodales.

## Casos de uso

- Asistentes de voz autoalojados en aleman: el modelo se integra como modulo TTS en OVOS/Mycroft mediante `ovos-tts-plugin-phoonnx`, permitiendo respuestas habladas sin enviar texto a servicios en la nube.
- Lectura de notificaciones y alertas en dispositivos IoT: al ejecutarse sobre ONNX Runtime y con un repositorio de 0,8 GB, puede desplegarse en dispositivos de bajos recursos para anunciar eventos del hogar o del sistema.
- Accesibilidad para personas con discapacidad visual: conversion de texto en pantalla a voz en aleman con multiples voces para adaptar el tono y la identidad sonora al usuario.
- Generacion de audiolibros o contenido narrado en aleman: las 26 voces permiten asignar timbres distintos a personajes o secciones sin depender de un servicio comercial.
- Sistemas de megafonia o anuncios automatizados: sintesis de mensajes dinamicos en tiempo de ejecucion para estaciones, aeropuertos o comercios, con ejecucion local que evita latencia de red.
- Pruebas y desarrollo de pipelines TTS en investigacion: al ser un paquete ONNX reproducible y con licencia permisiva, sirve como baseline para comparar calidad de sintesis en aleman frente a otros motores.
- Prototipado de interfaces conversacionales en aleman: integracion rapida en aplicaciones Python mediante la API de `TTSModelManager` para validar flujos de voz antes de invertir en infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad de sintesis (MOS, WER, MCD), latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al distribuirse como ONNX y con un repositorio de 0,8 GB, es plausible su ejecucion en CPU, pero no se confirma el consumo de memoria en la documentacion.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el diseno ONNX sugiere viabilidad en CPU y posible aceleracion en GPU, pero sin datos oficiales.
- Opciones de despliegue: ONNX Runtime a traves de la libreria `phoonnx`; integracion con OVOS mediante `ovos-tts-plugin-phoonnx`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Voces | Formato | Licencia | Parametros |
|---|---|---|---|---|---|
| pockettts-de-kyutai | aleman | 26 | ONNX | CC-BY-4.0 | no disponible |
| Piper (voces `de_DE`) | aleman | multiples | ONNX | MIT / otras segun voz | no disponible en esta ficha |
| Coqui TTS (modelos `de`) | aleman | multiples | varios (checkpoint, ONNX parcial) | MPL-2.0 / otras | no disponible en esta ficha |

La comparacion cuantitativa de calidad, latencia y consumo no esta disponible porque la model card no publica metricas. La ventaja principal de pockettts-de-kyutai frente a alternativas es su empaquetado especifico para phoonnx/OVOS y la licencia CC-BY-4.0, que permite uso comercial con atribucion.

## Limitaciones y advertencias

- Solo soporta aleman (`de`); no se documenta multilingue.
- No se publican datos sobre sesgos, calidad de sintesis ni comportamiento en dominios especializados (terminos medicos, juridicos, nombres propios).
- Al ser un modelo TTS, el riesgo de alucinacion se manifiesta como pronunciacion incorrecta, omision de palabras o entonacion inadecuada, no como generacion de contenido falso.
- La licencia CC-BY-4.0 exige atribucion al autor original (Kyutai) y a los intermediarios del paquete; es compatible con uso comercial siempre que se cumplan las condiciones.
- No se especifican requisitos minimos de hardware ni latencias, lo que dificulta planificar despliegues en produccion con garantias de servicio.
- El modelo depende de la libreria `phoonnx` en version preliminar (`pip install --pre phoonnx`), lo que implica posibles cambios de API.
- No hay informacion sobre el tratamiento de texto con caracteres especiales, numeros, abreviaturas o puntuacion mas alla del fonemizador Unicode.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/pockettts-de-kyutai
- Modelo original de Kyutai: https://huggingface.co/kyutai/pocket-tts/tree/main/languages/german
- Conversion ONNX de KevinAHM: https://huggingface.co/KevinAHM/pocket-tts-onnx/tree/main/onnx/german
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion Pocket TTS para phoonnx: https://huggingface.co/collections/Phoonnx/pocket-tts-6af8ea95fad812f585a5cb91
