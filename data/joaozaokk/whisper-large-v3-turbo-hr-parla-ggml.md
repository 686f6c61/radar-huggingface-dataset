# JoaoZaokk/whisper-large-v3-turbo-hr-parla-ggml

## Resumen

`JoaoZaokk/whisper-large-v3-turbo-hr-parla-ggml` es una conversion al formato GGML del checkpoint `GoranS/whisper-large-v3-turbo-hr-parla`, un ajuste de la variante Whisper large-v3-turbo orientado al croata (hr). El repositorio no entrena ningun modelo nuevo: reempaqueta los pesos del checkpoint original en cuantizaciones q4_0, q5_0 y q8_0 para poder ejecutarlos con whisper.cpp en dispositivos locales, sin conexion a internet y sin necesidad de GPU dedicada.

El problema que resuelve es de distribucion y despliegue: el autor mantiene el alojamiento de estas cuantizaciones para que las aplicaciones nativas Odysseus y Open WebUI dispongan de enlaces de descarga estables. Al estar en formato GGML/GGUF, el modelo se carga con el binario `whisper-cli` o con cualquier aplicacion que integre whisper.cpp.

Su relevancia actual reside en la combinacion de tamano reducido (474-874 MB por variante) y ejecucion on-device para reconocimiento automatico de voz en croata, un idioma con menos recursos que el ingles. En el momento de la consulta el repositorio tiene 0 descargas y 0 likes, por lo que todavia no cuenta con validacion de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper, variante large-v3-turbo); la model card no detalla numero de capas ni dimensiones |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (modelo de ASR; no se especifica la duracion maxima de audio por inferencia) |
| Tipos de cuantizacion | q4_0, q5_0 y q8_0; la model card menciona ademas f16 como conversion sin perdida, aunque no se incluye como archivo en el repositorio |
| Idiomas soportados | croata (hr) declarado; las pruebas de la conversion se hicieron con muestras cortas en portugues e ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGML/GGUF (`.bin`) para whisper.cpp |
| Tamano del repositorio | 1,9 GB (coincide con la suma de las tres variantes cuantizadas: 474 + 574 + 874 MB) |
| Pipeline | automatic-speech-recognition |
| Modelo base | GoranS/whisper-large-v3-turbo-hr-parla (relacion: quantized) |

## Arquitectura y entrenamiento

El modelo subyacente es un checkpoint de la familia Whisper large-v3-turbo, con arquitectura transformer encoder-decoder. Este repositorio concreto no realiza entrenamiento ni ajuste fino: unicamente convierte el checkpoint original con el conversor propio del motor whisper.cpp y aplica despues su cuantizador para generar las variantes q4_0, q5_0 y q8_0. Cada variante fue verificada transcribiendo muestras cortas en portugues e ingles antes de la subida.

La model card no aporta informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens de audio utilizados ni el uso de tecnicas de alineacion como RLHF o DPO. La unica informacion tecnica adicional es la recomendacion de uso de cada cuantizacion: q8_0 mantiene una precision casi identica al f16 con aproximadamente el 55 % del tamano, q5_0 (o q5_k) es la opcion orientada a telefonos moviles y q4_* es la mas pequena con un coste de precision pequeno.

## Capacidades

- Reconocimiento automatico de voz (ASR) en croata, con salida de transcripcion a texto.
- Ejecucion completamente local y offline, sin dependencia de servicios en la nube.
- Tres niveles de cuantizacion para ajustar el equilibrio entre tamano, consumo de memoria y precision.
- Integracion con whisper.cpp mediante `whisper-cli -m <archivo>` o cualquier aplicacion que embeba el motor.
- Empaquetado GGML/GGUF pensado para despliegue on-device.
- No se documenta soporte de tool calling, function calling, uso como agente, vision ni procesamiento de audio mas alla de la transcripcion.
- No se documenta thinking mode, salida estructurada ni capacidades multimodales adicionales.
- El unico idioma declarado en los metadatos del repositorio es el croata (hr).

## Casos de uso

- Transcripcion de reuniones en croata: el modelo convierte audio de voz a texto en local, lo que permite procesar reuniones internas sin enviar el audio a servicios externos.
- Subtitulado de video: se puede integrar en una cadena de postproduccion para generar subtitulos en croata a partir de la pista de audio.
- Aplicaciones moviles de dictado: las variantes q4_0 (474 MB) y q5_0 (574 MB) estan pensadas para telefonos, de modo que permiten dictado offline dentro de una app.
- Asistentes de voz embebidos: al ejecutarse sobre whisper.cpp, se puede incrustar en aplicaciones de escritorio, como las apps nativas Odysseus y Open WebUI que el autor cita.
- Indexacion y busqueda de archivos de audio: transcripcion por lotes de grabaciones para construir indices de texto buscables.
- Accesibilidad: conversion de voz a texto para personas con dificultades auditivas en contenidos en croata, ejecutable en equipos de consumo.
- Despliegue en macOS: la variante q8_0 (874 MB) es la recomendada por el autor para Macs, con precision cercana a la conversion f16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye valores de WER, MMLU ni ninguna otra metrica de evaluacion, y el buscador web no ha devuelto resultados relacionados con el modelo.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia, tomando como referencia el tamano de cada archivo mas el sobrecoste del motor (estimacion orientativa, no confirmada por el autor):
  - q4_0: 474 MB de pesos, aproximadamente 0,5-0,8 GB de memoria en ejecucion.
  - q5_0: 574 MB de pesos, aproximadamente 0,6-0,9 GB de memoria en ejecucion.
  - q8_0: 874 MB de pesos, aproximadamente 1,0-1,3 GB de memoria en ejecucion.
- Caben en GPU de consumo y en CPU: la model card indica que las variantes q4/q5 son aptas para telefonos y la q8_0 para Macs, por lo que el modelo esta pensado para hardware consumer y no requiere una GPU dedicada de datacenter.
- GPU recomendadas: no disponible (la informacion proporcionada no especifica modelos de GPU).
- Opciones de despliegue: whisper.cpp mediante el binario `whisper-cli -m <archivo>` o cualquier aplicacion que lo embeba; tambien se cita su uso desde las apps nativas Odysseus y Open WebUI. No se menciona soporte para vLLM, TGI, Ollama ni llama.cpp, que no aplican a este tipo de modelo ASR.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (q8_0) | no disponible | no disponible | sin benchmarks publicados | Apache 2.0 | 874 MB, whisper.cpp |
| Este repositorio (q5_0) | no disponible | no disponible | sin benchmarks publicados | Apache 2.0 | 574 MB, whisper.cpp |
| Este repositorio (q4_0) | no disponible | no disponible | sin benchmarks publicados | Apache 2.0 | 474 MB, whisper.cpp |
| GoranS/whisper-large-v3-turbo-hr-parla (checkpoint base) | no disponible | no disponible | no disponible | Apache 2.0 | peso completo sin cuantizar, tamano no disponible |
| Otras conversiones GGML de Whisper large-v3-turbo | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

No se dispone de datos comparativos de rendimiento (WER u otras metricas) frente a alternativas de la misma categoria.

## Limitaciones y advertencias

- No hay resultados de benchmarks ni evaluaciones publicadas que respalden la calidad de transcripcion de esta conversion.
- El repositorio registra 0 descargas y 0 likes, por lo que carece de validacion por parte de la comunidad.
- El unico idioma declarado en los metadatos es el croata; no se garantiza un comportamiento correcto en otros idiomas, pese a que las pruebas de conversion usaran muestras en portugues e ingles.
- Las cuantizaciones introducen perdida de precision: el autor indica que q4_* es la mas pequena "con un pequeno coste de precision" y que q5_0/q5_k es la opcion propia de telefonos.
- La model card no documenta evaluaciones de sesgo, de alucinacion ni de robustez frente a audio con ruido, musica o silencios; conviene validar el modelo en el dominio objetivo antes de usarlo en produccion.
- La licencia es Apache 2.0 y permite uso comercial, pero los pesos son obra derivada del modelo original y deben mantener esa licencia, ademas de citar a GoranS como autor original.
- El autor declara explicitamente que no ofrece ninguna garantia ("No warranty").
- La variante f16 sin perdida se menciona en el texto pero no figura como archivo descargable en el repositorio; solo se alojan las tres cuantizaciones.
- No soporta tool calling, agentes ni salidas multimodales; su unico proposito es la transcripcion de voz a texto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/JoaoZaokk/whisper-large-v3-turbo-hr-parla-ggml
- Modelo base: https://huggingface.co/GoranS/whisper-large-v3-turbo-hr-parla
- Motor whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Perfil del autor de la conversion: https://huggingface.co/JoaoZaokk
- Aplicaciones nativas Odysseus y Open WebUI: mencionadas en la model card sin enlace disponible.
