# IhorShevchuk/piper1-voices-fp16-quantized

## Resumen

Este repositorio contiene un conjunto de voces cuantizadas en FP16 para el sistema de sintesis de voz (text-to-speech) Piper, desarrollado en el marco del proyecto OHF-Voice (Open Home Foundation). Lo publica el usuario IhorShevchuk en HuggingFace y deriva de las voces originales de rhasspy/piper-voices, que se redistribuyen aqui en formato ONNX con pesos en precision media (float16) para reducir el espacio en disco y el ancho de banda de memoria durante la inferencia. El repositorio ocupa 13,6 GB y cubre 36 idiomas bajo licencia MIT.

No se trata de un modelo de lenguaje: es una coleccion de modelos acusticos/vocoders de TTS de tipo ligero, pensados para ejecucion local y en dispositivos con recursos limitados (Raspberry Pi, mini-PC, movil, navegador via ONNX Runtime Web). Su relevancia actual radica en que permite sintesis de voz multilingue completamente offline, sin dependencia de APIs en la nube, y con un coste computacional muy inferior al de los modelos TTS neuronales de gran tamano.

La model card es minima: no documenta arquitectura, numero de parametros, datos de entrenamiento ni resultados de evaluacion. Toda la informacion tecnica adicional que aparece en esta ficha esta marcada explicitamente como no disponible o como estimacion derivada del contexto del proyecto Piper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card (el proyecto Piper utiliza habitualmente modelos de la familia VITS exportados a ONNX; no confirmado para este repositorio) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de sintesis de voz, no procesa contexto de texto) |
| Tipos de cuantizacion | FP16 (float16) sobre pesos ONNX; el autor indica "FP16 Quantized Voices" |
| Idiomas soportados | 36: arabe, catalan, checo, gales, danes, aleman, griego, ingles, espanol, persa, finlandes, frances, hungaro, islandes, italiano, georgiano, kazajo, luxemburgues,leton, nepalí, neerlandes, noruego, polaco, portugues, rumano, ruso, eslovaco, esloveno, serbio, sueco, suajili, turco, ucraniano, urdu, vietnamita y chino |
| Licencia | MIT |
| Formato de pesos | ONNX (voz + fichero de configuracion asociado, segun el formato de Piper) |
| Tamano del repositorio | 13,6 GB en total (todas las voces agregadas) |
| Autor | IhorShevchuk |
| Tarea | Text-to-speech (sintesis de voz) |

## Arquitectura y entrenamiento

La model card no aporta informacion sobre la arquitectura interna, el numero de parametros, la composicion del dataset de entrenamiento, el numero de tokens de audio procesados ni si se aplicaron tecnicas de ajuste como RLHF o DPO. El unico detalle tecnico declarado es que se trata de voces cuantizadas en FP16 para Piper, derivadas de las voces originales de rhasspy/piper-voices. Cualquier afirmacion sobre la arquitectura concreta (VITS, HiFi-GAN u otra) requeriria inspeccionar los ficheros ONNX incluidos o la documentacion del proyecto Piper, y no se deduce de la informacion proporcionada.

En cuanto al entrenamiento, el autor remite a checkpoints externos para quien quiera entrenar sus propias voces: el dataset rhasspy/piper-checkpoints, junto con la guia de entrenamiento del repositorio piper1-gpl. Por tanto, este repositorio debe entenderse como un artefacto de distribucion e inferencia, no como un trabajo de entrenamiento original. La innovacion practica es la cuantizacion a FP16, que reduce el peso de cada voz y acelera la carga del modelo en runtime, a costa de una posible perdida minima de calidad respecto a los pesos originales en FP32.

## Capacidades

- Sintesis de voz (text-to-speech) offline a partir de texto de entrada, en 36 idiomas.
- Cobertura multilingue amplia, incluyendo idiomas de recursos medios y bajos (gales, islandes, luxemburgues, nepalí, suajili, urdu, georgiano, kazajo).
- Ejecucion mediante ONNX Runtime, lo que habilita despliegue en CPU, GPU, movil y navegador sin dependencias de Python en el camino de inferencia.
- Formato FP16 que reduce el uso de memoria y el espacio en disco frente a pesos de mayor precision.
- No dispone de generacion de texto, razonamiento, codigo ni matematicas: es exclusivamente un modulo de salida de audio.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso.
- No se documenta soporte de clonacion de voz, control de emocion, etiquetas SSML avanzadas ni transferencia de estilo en la informacion disponible.
- No se documenta si cada idioma incluye varias voces o hablantes por modelo; el numero exacto de voces por idioma no esta disponible.

## Casos de uso

- Asistentes de voz locales: integracion en sistemas domoticos (por ejemplo Home Assistant, que ya usa Piper de forma nativa) para que el asistente responda en castellano u otro de los 36 idiomas sin enviar texto a servicios en la nube, preservando la privacidad del hogar.
- Lectura de contenido en aplicaciones de accesibilidad: conversion de articulos, noticias o documentos a audio para personas con discapacidad visual, ejecutando el modelo en el propio dispositivo y evitando costes recurrentes de API.
- Audiolibros y podcasts generados de forma automatica: sintesis de texto largo en pipelines por lotes, aprovechando la ligereza del formato FP16 para procesar volumenes elevados en una sola maquina.
- Sistemas de navegacion y avisos embebidos: generacion de indicaciones habladas en dispositivos con poca memoria (Raspberry Pi, sistemas de automocion), donde un modelo TTS de gran tamano no cabria.
- Videojuegos y experiencias interactivas: doblaje dinamico de dialogos en varios idiomas dentro del propio motor, con tiempos de carga reducidos gracias a los pesos FP16.
- Interfaces de voz para telefonia y centros de contacto internos: IVR que responda en el idioma del usuario sin depender de un proveedor externo, util en entornos con requisitos de residencia de datos.
- Investigacion en TTS multilingue: uso de las voces como linea base o como referencia de calidad para comparar tecnicas de cuantizacion, destilacion o adaptacion a nuevos idiomas.
- Traduccion con salida de audio: combinado con un modelo de traduccion de texto, permitiria locutar contenido traducido en cualquiera de los 36 idiomas soportados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (MOS, WER, RTF, latencia) ni comparaciones con otras voces o sistemas. La afirmacion "FP16 quantized" implica una reduccion de precision respecto a las voces originales, pero no se cuantifica en el repositorio la perdida de calidad resultante.

## Requisitos de hardware

- VRAM: no disponible. Al ser modelos ONNX de sintesis de voz, es habitual ejecutarlos en CPU mediante ONNX Runtime; el consumo tipico se mide en RAM, no en VRAM, y depende del tamano de cada voz concreta.
- Tamano por voz: no disponible de forma exacta. Como estimacion derivada del tamano total del repositorio (13,6 GB repartido entre las voces de 36 idiomas y sus variantes de calidad), cada fichero de voz en FP16 se situaria en el orden de decenas de MB. Esta cifra es una estimacion, no un dato publicado.
- GPU recomendadas: no disponible. No se documentan requisitos de GPU. El formato ONNX permite aceleracion por GPU, pero el proyecto Piper esta disenado para funcionar sin ella.
- GPU de consumo: no disponible como dato oficial; por el perfil del proyecto Piper, cabe esperar ejecucion fluida en CPU moderna e incluso en hardware de placa unica, aunque no se confirma en la informacion proporcionada.
- Opciones de despliegue: ONNX Runtime (C++, Python, C#, Java, WebAssembly) y el propio runtime de Piper (repositorio piper1-gpl). Herramientas de servidor para modelos de lenguaje como vLLM, TGI o llama.cpp no son aplicables a este repositorio.
- Latencia y throughput: no disponibles. No se publican medidas de factor de tiempo real (RTF) ni de audio generado por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| IhorShevchuk/piper1-voices-fp16-quantized | TTS (voces Piper) | 36 | MIT | ONNX FP16 | Objeto de esta ficha; 13,6 GB agregados |
| rhasspy/piper-voices | TTS (voces Piper) | Amplia cobertura multilingue | no disponible en la informacion proporcionada | ONNX | Es el origen declarado de estas voces; pesos sin la cuantizacion FP16 aplicada por este repositorio |
| Otras familias TTS (por ejemplo Coqui XTTS, Kokoro, MMS-TTS) | TTS | Variable | Variable | Variable | No se dispone de datos verificados en la informacion proporcionada; cualquier comparacion de parametros, contexto o rendimiento quedaria sin respaldo |

La comparacion directa con alternativas no puede realizarse con rigor: no hay datos de parametros, contexto ni rendimiento publicados para este repositorio, y la busqueda web asociada no devolvio informacion tecnica relevante.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no ejecuta codigo y no soporta tool calling ni flujos de agente.
- Ausencia total de documentacion tecnica: se desconocen arquitectura exacta, numero de parametros, datos de entrenamiento, proceso de cuantizacion y evaluacion de calidad.
- La cuantizacion a FP16 puede introducir una degradacion de calidad audible respecto a los pesos originales de rhasspy/piper-voices; el grado de degradacion no esta medido en el repositorio.
- Riesgo de errores de pronunciacion, prosodia y normalizacion de texto en idiomas con ortografia o numeracion compleja; no se documentan mecanismos de normalizacion incluidos.
- Idiomas con menor representacion en el corpus original (gales, islandes, luxemburgues, nepalí, suajili, urdu) pueden presentar una calidad inferior a la de ingles, espanol o aleman; no se publican metricas por idioma.
- Sesgos de voz: no se documenta la composicion de hablantes (genero, acento, variedad dialectal) de cada voz, por lo que no puede evaluarse el sesgo de representacion.
- Licencia MIT: permite uso comercial y modificacion, pero conviene verificar las condiciones de las voces originales de rhasspy/piper-voices y de los datasets de entrenamiento subyacentes antes de un despliegue en produccion.
- Repositorio de 13,6 GB: descargar el conjunto completo es costoso en ancho de banda; en la practica conviene descargar unicamente los ficheros de voz de los idiomas necesarios.
- Sin garantias de mantenimiento: el repositorio no tiene descargas ni "me gusta" registrados en la informacion consultada, lo que dificulta estimar su adopcion y soporte real.
- Los resultados de la busqueda web proporcionada no contienen informacion tecnica sobre el modelo; no deben usarse como fuente para evaluar su calidad o comportamiento.

## Enlaces

- [IhorShevchuk/piper1-voices-fp16-quantized en HuggingFace](https://huggingface.co/IhorShevchuk/piper1-voices-fp16-quantized)
- [Repositorio piper1-gpl (OHF-Voice)](https://github.com/OHF-Voice/piper1-gpl)
- [Guia de entrenamiento de voces propias](https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/TRAINING.md)
- [Voces originales rhasspy/piper-voices](https://huggingface.co/rhasspy/piper-voices)
- [Checkpoints para entrenamiento rhasspy/piper-checkpoints](https://huggingface.co/datasets/rhasspy/piper-checkpoints/tree/main)

Los resultados de busqueda web facilitados corresponden a guias de senderismo en la zona de Sarlat-la-Caneda y no guardan ninguna relacion con el modelo; no se han incluido como enlaces relevantes.
