# arata-ae/negen-archive

## Resumen

negen-archive es un repositorio de modelos en formato Core ML publicado por el usuario arata-ae en Hugging Face, pensado para que las aplicaciones de Negen (negen.ai) ejecuten sintesis de voz directamente en el dispositivo. No se trata de un modelo unico, sino de un contenedor organizado por carpetas: cada carpeta agrupa un modelo completo con sus propios ficheros, README, licencias y avisos legales. En el momento de redactar esta ficha el repositorio contiene una unica carpeta, Irodori-TTS-v4.1-Small-MF-CoreML-8bit.

El modelo incluido es un sistema de text-to-speech en japones derivado de AILogDev/Irodori-TTS-v4.1-Small-MF-CoreML, del que esta version es una conversion cuantizada a 8 bits en formato Core ML. El objetivo declarado es la inferencia on-device en iOS 18 o macOS 15 y posteriores, con un peso de fichero de 1,80 GB segun la model card y un tamano de repositorio de 1,6 GB reportado por la plataforma.

La relevancia del artefacto es de tipo practico antes que de investigacion: ofrece un formato listo para integrar en aplicaciones Apple, con verificacion de integridad mediante digests SHA-256 fijados a un commit concreto, lo que permite reproducibilidad en produccion. No se han publicado detalles de arquitectura, numero de parametros ni resultados de benchmarks, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de sintesis de voz; la model card no detalla la arquitectura interna) |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica / no disponible (modelo de text-to-speech, no de lenguaje) |
| Tipos de cuantizacion | pesos de 8 bits (Core ML; unica variante publicada en el repositorio) |
| Idiomas soportados | japones (ja) |
| Licencia | per-folder; los componentes se declaran bajo MIT y Apache-2.0 |
| Formato de pesos | Core ML (library_name: coreml), 8 bits |
| Modelo base | AILogDev/Irodori-TTS-v4.1-Small-MF-CoreML (relacion: quantized) |
| Plataforma objetivo | iOS 18 o macOS 15 y posteriores |
| Tamano del artefacto | 1,80 GB (carpeta del modelo); 1,6 GB de repositorio reportado por Hugging Face |
| Tarea declarada (pipeline) | text-to-speech |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (segun plataforma) | 2026-10-04 |
| Ultima actualizacion (segun plataforma) | 2026-10-04 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del modelo. La model card unicamente identifica la tarea (sintesis de voz en japones), el formato (Core ML con pesos de 8 bits) y el modelo de origen (AILogDev/Irodori-TTS-v4.1-Small-MF-CoreML), sobre el que esta version es una conversion, no un entrenamiento nuevo. No se especifican tipo de red (por ejemplo, variantes tipo VITS, diffusion o transformer), numero de parametros, frecuencia de muestreo de audio, vocabulario de entrada ni estrategia de tokenizacion para el japones.

Tampoco hay datos sobre corpus de entrenamiento, numero de horas de audio, composicion del dataset, uso de RLHF/DPO ni tecnicas de control de prosodia o estilo. Lo unico documentado a nivel de proceso es el empaquetado: cada carpeta del repositorio contiene todo lo necesario para su modelo, las aplicaciones fijan un commit y verifican cada fichero descargado contra su digest SHA-256. El propio repositorio declara que los modelos son copias o conversiones de trabajo de terceros y que no implica afiliacion ni respaldo por parte de sus autores.

## Capacidades

- Sintesis de texto a voz en japones, orientada a ejecucion on-device.
- Conversión a formato Core ML con pesos de 8 bits, apta para inferencia en el ecosistema Apple.
- Distribucion verificable: descarga por carpeta y comprobacion de integridad por SHA-256 fijada a un commit.
- No hay evidencia disponible de soporte de tool calling ni function calling (no aplica a un modelo de TTS).
- No hay evidencia disponible de capacidades de agente, razonamiento multi-paso o planificacion.
- No hay evidencia disponible de clonacion de voz, control de emocion, estilo o velocidad.
- No hay evidencia disponible de capacidades multimodales, vision o audio de entrada.
- Multilingue: no; el unico idioma declarado es japones.
- No se documenta soporte de streaming de audio ni latencia de generacion.

## Casos de uso

- Lectura en voz alta dentro de aplicaciones iOS: el modelo puede convertir texto japones en audio sin enviar contenido a un servidor, lo que resulta adecuado para apps de lectura, prensa o manga con texto.
- Accesibilidad para personas con discapacidad visual: integrado en un lector de pantalla o en un asistente de lectura, permite narrar contenido en japones con procesamiento local y sin dependencia de conectividad.
- Asistentes de voz y avisos del sistema: notificaciones, alarmas, recordatorios y confirmaciones habladas en japones dentro de una app, donde el coste cero de inferencia en la nube y la ausencia de red son determinantes.
- Estudio del idioma japones: ejercicios de escucha y pronunciacion generados dinamicamente a partir de vocabulario o frases introducidas por el usuario, ejecutados en el propio dispositivo del estudiante.
- Audiolibros y contenido largo generado bajo demanda: conversion por fragmentos de textos extensos, con la ventaja de que el contenido no abandona el dispositivo, lo que simplifica el cumplimiento de derechos y privacidad.
- Navegacion y conduccion: instrucciones de voz en japones generadas localmente, utiles cuando la cobertura de red es intermitente o se quiere evitar el consumo de datos moviles.
- Kioscos, terminales y aplicaciones industriales en Japón: interfaces habladas en dispositivos Apple que deben funcionar sin conexion y con un artefacto de tamano contenido (1,80 GB por modelo).
- Aplicaciones de privacidad estricta: cualquier escenario en el que el texto del usuario no pueda salir del dispositivo pero se requiera salida de voz en japones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (MOS, WER, RTF, latencia) ni comparaciones con otros sistemas de sintesis de voz.

## Requisitos de hardware

- Peso del artefacto: 1,80 GB en la carpeta del modelo (pesos de 8 bits). El consumo de memoria en ejecucion sera superior al tamano del fichero, pero no se ha publicado una cifra oficial.
- Requisito de sistema declarado: iOS 18 o macOS 15 y posteriores. No se especifica el chip minimo ni si macOS requiere Apple Silicon.
- Aceleracion: al tratarse de Core ML, la ejecucion se realiza sobre el stack de Apple (CPU, GPU y Neural Engine segun lo permita el modelo). No aplica a GPU NVIDIA ni AMD mediante CUDA o ROCm sin una conversion previa.
- GPU de datacenter (A100, H100, RTX 4090): no son una via de despliegue directa para un artefacto Core ML; no hay datos publicados de rendimiento en estas plataformas.
- Consumer GPU: no aplica en el sentido habitual; el equivalente es ejecucion en iPhone, iPad o Mac compatibles con las versiones de sistema indicadas.
- Opciones de despliegue: Core ML dentro de una app Apple, descarga mediante el cliente de Hugging Face (`hf download arata-ae/negen-archive --include "Irodori-TTS-v4.1-Small-MF-CoreML-8bit/*" --revision <commit>`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay datos publicados sobre este modelo (parametros, latencia, calidad) que permitan una comparacion cuantitativa. La tabla siguiente resume la situacion con caracter cualitativo; los datos de los sistemas alternativos proceden de su documentacion publica habitual y no se han verificado en la busqueda realizada para esta ficha.

| Sistema | Enfoque | Idioma | Formato / despliegue | Licencia |
|---|---|---|---|---|
| arata-ae/negen-archive (Irodori-TTS-v4.1-Small-MF-CoreML-8bit) | TTS on-device para apps Apple | japones | Core ML, 8 bits | per-folder, componentes MIT y Apache-2.0 |
| Piper | TTS on-device y en servidor | varios idiomas | ONNX, orientado a CPU | MIT (segun su proyecto) |
| Kokoro-82M | TTS compacto | varios idiomas | safetensors / ONNX | Apache-2.0 (segun su proyecto) |
| XTTS-v2 | TTS multilingue con clonacion | varios idiomas | PyTorch | no comercial (segun su proyecto) |

En parametros, contexto y rendimiento medido, la comparacion no esta disponible para el modelo de esta ficha.

## Limitaciones y advertencias

- Cobertura linguistica limitada: el unico idioma declarado es el japones. No hay evidencia de soporte de castellano ni de otros idiomas.
- Ausencia total de documentacion tecnica: no se publican arquitectura, numero de parametros, corpus de entrenamiento ni metricas de calidad, lo que dificulta evaluar su idoneidad en produccion.
- Procedencia: el repositorio declara explicitamente que los modelos son copias o conversiones de trabajo de terceros y que no existe afiliacion ni respaldo por parte de los autores originales.
- Licencia no unificada: la licencia es "per-folder" y la etiqueta general es "other". Antes de un uso comercial hay que revisar el README de cada carpeta y los ficheros de licencia incluidos (MIT y Apache-2.0 para los componentes declarados).
- Riesgo de pronunciacion incorrecta en kanji poco frecuentes, nombres propios, siglas, numeros y unidades, un problema tipico de los sistemas de TTS en japones. No hay evaluacion publicada sobre este punto.
- Sesgos de voz: no se documenta la variedad de voces, acentos o registros incluidos, ni las caracteristicas demograficas de los datos de entrenamiento.
- Alucinacion en el sentido de modelos de lenguaje: no aplica, pero si puede producirse audio malformado, silencios anomalos o cortes en entradas largas o mal normalizadas.
- Dependencia de plataforma: requiere iOS 18 o macOS 15 y posteriores, lo que excluye dispositivos antiguos y cualquier entorno Linux o Windows.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso publico ni issues que permitan estimar su estabilidad.
- Discrepancia de tamanos: la model card indica 1,80 GB para la carpeta del modelo mientras que la plataforma reporta 1,6 GB de repositorio. Conviene verificar el contenido antes de integrarlo.
- La busqueda web realizada para esta ficha no devolvio resultados relevantes sobre el modelo, su autor ni su modelo base.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/arata-ae/negen-archive
- Modelo base: https://huggingface.co/AILogDev/Irodori-TTS-v4.1-Small-MF-CoreML
- Carpeta del modelo dentro del repositorio: https://huggingface.co/arata-ae/negen-archive/tree/main/Irodori-TTS-v4.1-Small-MF-CoreML-8bit
- Seccion de licencias del repositorio: https://huggingface.co/arata-ae/negen-archive/blob/main/README.md#licences
- Sitio del desarrollador de las aplicaciones: https://negen.ai
- Paper, blog tecnico, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
