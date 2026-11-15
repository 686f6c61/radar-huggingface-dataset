# Phoonnx/vits-et_ee-cv

## Resumen

vits-et_ee-cv es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Coqui y empaquetado por Phoonnx para su libreria de inferencia ONNX. El modelo convierte texto en estonio (et-EE) en audio, y su origen es el checkpoint `tts_models--et--cv--vits` publicado en la version 0.8.0 de los modelos de Coqui TTS, entrenado presumiblemente con el corpus Common Voice en estonio. El empaquetado lo distribuye Phoonnx como artefacto ONNX listo para ejecutarse sin depender del framework original de Coqui.

La relevancia de este modelo es practica: cubre una lengua de bajos recursos (estonio) dentro de un ecosistema de codigo abierto con licencia permisiva BSD-3-Clause, y lo hace en un formato ONNX de apenas 0,1 GB, lo que facilita su despliegue en entornos con recursos limitados, incluidos dispositivos de borde y asistentes de voz integrados como OVOS. No es un modelo de proposito general ni compite en calidad con los grandes sistemas TTS comerciales, sino que ofrece una solucion ligera, reproducible y autoalojable para una locale concreta.

El modelo es unicamente de sintesis de voz: no realiza reconocimiento, traduccion ni otras tareas. Su valor esta en la integracion con la cadena de herramientas de Phoonnx (gestion de voces, normalizacion de texto mediante scriptconv y plugin para OVOS), que abstrae los detalles de inferencia y permite usarlo tanto desde Python como desde asistentes de voz configurables por JSON.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por caracteres, sin ventana de contexto declarada) |
| Tipos de cuantizacion | no disponible (distribucion en ONNX; el repo ocupa 0,1 GB) |
| Idiomas soportados | estonio (et-EE) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (empaquetado para la libreria phoonnx) |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador generativo basado en flujos normales y un discriminador adversarial multiperiodo durante el entrenamiento. El modelo produce audio directamente a partir de la secuencia de texto sin necesidad de un vocoder separado, lo que simplifica el despliegue. En este caso, la entrada de texto se procesa a nivel de caracteres (graphemes) mediante el `GraphemePhonemizer` de la libreria scriptconv, que normaliza el texto antes de la sintesis.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o ajuste fino adicional. La model card indica que el modelo proviene del checkpoint `et-cv-vits` de Coqui, asociado al corpus Common Voice en estonio (et-EE), pero no se especifican horas de audio, numero de hablantes ni metadatos del conjunto de entrenamiento. Tampoco se documentan innovaciones tecnicas adicionales mas alla de las propias de VITS.

## Capacidades

- Sintesis de voz a partir de texto en estonio (et-EE), con salida en formato WAV.
- Entrada basada en caracteres (graphemes), sin necesidad de transcripcion fonetica manual por parte del usuario.
- Normalizacion de texto previa mediante scriptconv, que gestiona la conversion de script y la limpieza de la entrada.
- Integracion con la libreria phoonnx para carga de voces, fusion de voces por defecto y sintesis directa a fichero WAV.
- Soporte como plugin de TTS para OVOS (`ovos-tts-plugin-phoonnx`), configurable mediante `mycroft.conf`.
- Ejecucion en formato ONNX, lo que permite inferencia sin el framework original de Coqui.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio de entrada ni modo de pensamiento; es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz autoalojados en estonio: integrado mediante el plugin `ovos-tts-plugin-phoonnx` en OVOS, el modelo permite dotar de voz a un asistente domestico sin depender de servicios en la nube, con una configuracion JSON minima y un artefacto de 0,1 GB.
- Lectura de contenido para accesibilidad: conversion de articulos, avisos o documentos en estonio a audio para personas con discapacidad visual o para consumo en formato podcast, aprovechando la normalizacion de texto de scriptconv para manejar abreviaturas y caracteres especiales.
- Generacion de avisos y locuciones automatizadas: sintesis de mensajes dinamicos en sistemas de megafonia, transporte publico o telemetria, donde el texto se genera programaticamente y se convierte a voz en tiempo de ejecucion con un modelo ligero que cabe en dispositivos modestos.
- Prototipado de interfaces conversacionales: desarrollo y prueba de flujos de dialogo en estonio antes de invertir en modelos TTS comerciales, gracias a la licencia BSD-3-Clause y a la ausencia de costes por llamada.
- Investigacion en lenguas de bajos recursos: uso como linea base reproducible para experimentos de sintesis en estonio, con la ventaja de que el checkpoint original de Coqui y el empaquetado ONNX estan ambos disponibles para comparacion.
- Integracion en pipelines de generacion de contenido multimedia: produccion de narraciones para videos, cursos o audiolibros en estonio dentro de un pipeline automatizado que llame a la API de phoonnx y escriba ficheros WAV directamente.
- Despliegue en dispositivos de borde: al tratarse de un ONNX de 0,1 GB, puede ejecutarse en hardware con recursos limitados (Raspberry Pi, mini-PC) para aplicaciones de voz offline, siempre que se valide la latencia en el hardware concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el tamano del repositorio (0,1 GB) sugiere un modelo muy ligero que probablemente puede ejecutarse en CPU sin GPU dedicada, aunque no se confirma en la documentacion.
- GPU recomendadas: no disponible. Por el tamano del artefacto, no se requiere una GPU de gama alta; cualquier GPU consumer moderna seria suficiente en caso de querer aceleracion.
- Compatibilidad con GPU consumer: probablemente si (dado el tamano), pero no confirmado por el autor.
- Opciones de despliegue: libreria phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ejecucion ONNX subyacente. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamano repo | Notas |
|---|---|---|---|---|---|---|
| Phoonnx/vits-et_ee-cv | VITS | et-EE | BSD-3-Clause | ONNX | 0,1 GB | Objeto de esta ficha |
| Coqui TTS `tts_models--et--cv--vits` | VITS | et-EE | BSD-3-Clause | Checkpoint Coqui | no disponible | Modelo upstream del que deriva este empaquetado |
| Otros modelos VITS de la coleccion Phoonnx | VITS | varias | variable | ONNX | variable | Misma cadena de empaquetado, distintas lenguas |

No se dispone de informacion sobre otros modelos TTS en estonio comparables en parametros, contexto o rendimiento dentro de la documentacion proporcionada.

## Limitaciones y advertencias

- Modelo monoidioma: solo soporta estonio (et-EE); no es util para otras lenguas.
- Entrada basada en caracteres: la calidad depende de la normalizacion previa de scriptconv; textos con abreviaturas, numeros o simbolos no normalizados pueden producir una sintesis deficiente.
- Sin datos de evaluacion: no hay benchmarks publicados de naturalidad (MOS), inteligibilidad ni latencia, por lo que la calidad debe validarse en el caso de uso concreto antes de produccion.
- Riesgo de alucinacion acustica: como todo modelo generativo de audio, puede producir artefactos, prosodia incorrecta o pronunciaciones erroneas en palabras poco frecuentes.
- Sesgos del corpus: al derivar de Common Voice, las caracteristicas de los hablantes del corpus (acento, edad, genero) condicionan la voz resultante; no se documenta la diversidad de hablantes ni la cobertura dialectal.
- Licencia BSD-3-Clause: permisiva y apta para uso comercial, pero requiere conservar el aviso de copyright y la clausula de exencion de responsabilidad; conviene verificar la procedencia exacta de los datos de Common Voice para cumplir sus terminos.
- Mantenimiento: el modelo se apoya en el proyecto Coqui TTS, cuyo desarrollo original ha cesado; el empaquetado corre a cargo de Phoonnx, con solo 27 descargas y 0 likes en el momento de la consulta, lo que indica una comunidad pequena y poca validacion externa.
- Dependencia de la libreria phoonnx en version preliminar (`pip install --pre phoonnx`), lo que implica posible inestabilidad de API.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-et_ee-cv
- Checkpoint upstream de Coqui TTS: https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--et--cv--vits.zip
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion de modelos VITS empaquetados para phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
