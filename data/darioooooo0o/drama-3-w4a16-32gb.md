# darioooooo0o/drama-3-w4a16-32gb

## Resumen

Drama-3 W4A16 32 GB edition es una cuantizacion no oficial de fishaudio/drama-3, el modelo de sintesis de voz (text-to-speech) multilingue y multi-hablante de Fish Audio. El propietario del repositorio, el usuario darioooooo0o (identificado en la model card como @imdariotoo), ha reducido el peso del checkpoint para que quepa en GPUs de 32 GB, en concreto la RTX 5090, mediante cuantizacion a 4 bits de los expertos enrutados y a 8 bits de las 250 matrices del backbone. El modelo base se presenta como un MoE de 35B de parametros totales con 3B activos, aunque los metadatos de safetensors del repositorio cuantizado declaran 6.926.013.568 parametros; esta discrepancia no se explica en la informacion disponible.

El problema que resuelve es puramente de despliegue: el checkpoint original requiere mas de 48 GB de VRAM, y la variante intermedia drama-3-w4a16 baja hasta 37,5 GB, mientras que esta edicion de 32 GB reporta un pico medido de 30,7 GiB. Mantiene intactas en bf16 las capas de embeddings, lm_head y el decodificador de audio, y aplica int4 a los expertos enrutados e int8 (W8A16, grupo 128) al backbone, incluidas las capas de atencion, de atencion lineal y de expertos compartidos.

Es relevante ahora porque permite ejecutar un modelo TTS de gran tamano en hardware de consumo de gama alta (RTX 5090, 31,8 GiB utiles) con clonacion de voz, etiquetas expresivas y soporte multi-hablante, algo que hasta la fecha exigia tarjetas A100, A6000 o H100. Se distribuye bajo la licencia fish-audio-community-license, no esta afiliado ni respaldado por Fish Audio, y se sirve exclusivamente con SGLang-Omni.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer MoE con atencion y atencion lineal (segun la model card del cuantizado; el detalle completo no esta disponible) |
| Parametros totales | 6.926.013.568 segun metadatos de safetensors; la model card del repositorio declara 35B totales (dato no coincidente, no disponible la explicacion) |
| Parametros activos | 3B (segun la model card del cuantizado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (expertos enrutados), int8 W8A16 grupo 128 (atencion, atencion lineal y expertos compartidos, 250 matrices), bf16 (embeddings, lm_head, decodificador de audio) |
| Idiomas soportados | en, zh, ja, ko, multilingual |
| Licencia | fish-audio-community-license (license: other) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 24,5 GB (descarga); ~26 GB de disco segun requisitos |
| Pipeline | text-to-speech |
| Kernel de cuantizacion | GPTQ-Marlin W8A16 (int8) y moe_wna16 (int4), requieren compute capability >= 8.0 |
| Motor de inferencia | SGLang-Omni |

## Arquitectura y entrenamiento

La informacion disponible describe el modelo base como un MoE multi-hablante de 35B de parametros con 3B activos, con un backbone que combina capas de atencion, capas de atencion lineal y capas de expertos compartidos, mas un decodificador de audio separado y una pila de embeddings y lm_head. No se detallan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. El modelo original distribuye los expertos enrutados en FP8 con escalas de bloque de 128x128.

El proceso de cuantizacion documentado en este repositorio consta de dos pasos. Primero, quantize.py desquantiza los expertos FP8 aplicando sus escalas de bloque 128x128 y los recuantiza a int4 con redondeo al vecino mas cercano, esquema simetrico, grupo 128 y una busqueda de recorte (clipping) de 20 puntos por grupo; el error relativo medio por matriz de experto resultante es del 10,3%. Segundo, quantize_l8.py convierte 250 matrices bf16 del backbone (atencion, atencion lineal y expertos compartidos) a int8 con cuantizacion W8A16 por grupo de 128. Los embeddings, el lm_head y el decodificador de audio permanecen en bf16 para preservar la calidad de reconstruccion de audio. El repositorio incluye un script apply_patch.py idempotente que anade las configuraciones de cuantizacion int4 e int8 al checkpoint descargado.

## Capacidades

- Generacion de voz a partir de texto (text-to-speech) en ingles, chino, japones, coreano y otros idiomas incluidos bajo la etiqueta multilingual.
- Clonacion de voz a partir de audio de referencia, con un limite documentado de 20 segundos por referencia (flag max_reference_audio_seconds).
- Sintesis multi-hablante, con soporte de conversaciones con varias voces.
- Control expresivo mediante etiquetas en el texto de entrada, por ejemplo [sighs] o [laughs], segun los ejemplos publicados.
- Streaming de audio, cubierto en el cookbook de Drama 3 de SGLang-Omni.
- Troceado automatico de textos largos: con max_new_tokens 1024 cada fragmento generado puede alcanzar aproximadamente 47 segundos de audio, y el texto mas largo se divide de forma automatica.
- Servicio mediante API HTTP compatible con el endpoint /v1/audio/speech.
- No dispone de capacidades de vision, razonamiento textual, generacion de codigo ni tool calling: es un modelo especializado en sintesis de voz.

## Casos de uso

- Audiolibros y narracion de textos largos: el modelo trocea el texto automaticamente y puede generar fragmentos de hasta unos 47 segundos por iteracion, con lo que se pueden producir capitulos completos encadenando peticiones sobre una unica GPU de 32 GB.
- Doblaje y localizacion multilingue: con soporte de ingles, chino, japones y coreano y clonacion de voz a partir de referencias de hasta 20 segundos, se puede mantener la identidad vocal del hablante original entre idiomas.
- Asistentes de voz con privacidad de datos: al caber en una RTX 5090, la sintesis puede ejecutarse on-premise sin enviar texto ni audio a servicios externos, lo que simplifica el cumplimiento normativo.
- Produccion de contenido expresivo: las etiquetas de estilo ([sighs], [laughs]) permiten generar dialogos con modulacion emocional sin necesidad de grabar locuciones adicionales.
- Atencion al cliente con voz sintetica: el endpoint HTTP compatible permite integrar la sintesis en un backend de telefonia o chat de voz, siempre que la licencia fish-audio-community-license lo permita para el uso previsto.
- Accesibilidad y lectura asistida: conversion de documentos y paginas web a audio en varios idiomas para lectores de pantalla y usuarios con discapacidad visual.
- Prototipado de videojuegos y animacion: generacion rapida de voces para personajes con multiples hablantes antes de contratar locucion definitiva.
- Investigacion en cuantizacion de MoE: el repositorio documenta el pipeline completo (desquantizacion FP8, recuantizacion int4 con grupo 128, error relativo medio del 10,3%, cuantizacion int8 del backbone) y sirve como caso de estudio reproducible de W4A16 sobre arquitecturas de mezcla de expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica evaluacion reportada consiste en cinco clips de audio generados con este checkpoint y transcritos con Whisper large-v3, con coincidencia exacta en los cinco casos (uno de ellos en chino, transcrito por Whisper en caracteres tradicionales). El autor indica explicitamente que se trata de comprobaciones puntuales y no de un benchmark.

| Metrica | Resultado | Contexto |
|---|---|---|
| Prueba de inteligibilidad | 5 de 5 clips con transcripcion exacta (Whisper large-v3) | Muestras puntuales, no benchmark |
| Memoria pico de GPU | 30,7 GiB | Medida en RTX A6000 (48 GB), muestreo cada 0,5 s durante la generacion de los cinco clips |
| Error de cuantizacion | 10,3% de error relativo medio por matriz de experto | Tras recuantizar los expertos FP8 a int4 |

## Requisitos de hardware

- VRAM minima: 32 GB en la GPU. El pico medido es de 30,7 GiB sobre los 31,8 GiB utiles de una RTX 5090, por lo que el margen es minimo.
- GPU compatibles: cualquier NVIDIA con compute capability >= 8.0 y 32 GB o mas, como la RTX 5090, o tarjetas de 40, 48 u 80 GB. Los kernels GPTQ-Marlin W8A16 y moe_wna16 exigen compute capability 8.0 o superior.
- Advertencia sobre la RTX 5090: el autor no pudo validar el modelo en una 5090 real porque los dos hosts alquilados fallaron al arrancar; las mediciones se hicieron en una RTX A6000. En una 5090 hay que ejecutar en modo headless o sin ningun otro proceso en la GPU, ya que una sesion de escritorio puede no dejar espacio suficiente.
- Opciones de despliegue: unicamente SGLang-Omni (sgl-omni serve). No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Configuracion de referencia: tts_engine.gpu_memory_fraction 0.50, vocoder.gpu_memory_fraction 0.12, max_new_tokens 1024, total_reserve_bytes 3GiB, max_reference_audio_seconds 20. Las fracciones son sobre la tarjeta completa y deben reescalarse en GPUs de 48 GB o mas.
- Entorno: Linux, CUDA 12.8 o superior, Python 3.12, aproximadamente 26 GB de disco.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tamano de descarga | Expertos enrutados | Backbone | VRAM probada | Licencia |
|---|---|---|---|---|---|
| fishaudio/drama-3 | 41,5 GB | FP8 | bf16 | mas de 48 GB | fish-audio-community-license |
| darioooooo0o/drama-3-w4a16 | 25,9 GB | int4 | bf16 (250 matrices) | 37,5 GB | fish-audio-community-license |
| darioooooo0o/drama-3-w4a16-32gb (este) | 24,5 GB | int4 | int8 W8A16 grupo 128 | 30,7 GiB de pico | fish-audio-community-license |

No se dispone en la informacion proporcionada de modelos comparables de terceros de la misma categoria (TTS multi-hablante con clonacion de voz y cuantizacion agresiva para GPU de 32 GB): no disponible.

## Limitaciones y advertencias

- Es una cuantizacion no oficial: no esta afiliada ni respaldada por Fish Audio, y la calidad resultante no se ha validado con benchmarks, solo con cinco clips de prueba.
- La cuantizacion int4 de los expertos introduce un error relativo medio declarado del 10,3% por matriz, con impacto en calidad no cuantificado; el backbone pasa a int8, lo que anade una perdida adicional no medida.
- Discrepancia en el recuento de parametros: los metadatos de safetensors indican 6.926.013.568 parametros, mientras que la model card habla de 35B totales y 3B activos. No esta disponible la explicacion de esta diferencia.
- Requisito de memoria muy ajustado: 30,7 GiB de pico sobre 31,8 GiB utiles en una RTX 5090, sin margen para el escritorio ni para otros procesos.
- El modelo no se ha ejecutado realmente en una RTX 5090 segun el propio autor; las dos instancias alquiladas fallaron al arrancar.
- Despliegue limitado a SGLang-Omni y a GPUs con compute capability >= 8.0; no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Riesgo de artefactos, derivas de prosodia o errores de pronunciacion en textos largos, y de alucinacion de contenido vocal en pasajes ambiguos; no se han publicado tasas de error.
- La clonacion de voz esta limitada a referencias de 20 segundos; referencias mas largas no estan soportadas con la configuracion documentada.
- Uso indebido de clonacion de voz: se debe verificar el consentimiento de la persona cuya voz se clona y cumplir la normativa aplicable, ya que el modelo reproduce identidades vocales.
- Restricciones de licencia: fish-audio-community-license (license: other). No se detallan en la informacion disponible los terminos para uso comercial, por lo que hay que revisar el fichero LICENSE antes de cualquier despliegue en produccion.
- Cobertura idiomatica: solo se declaran en, zh, ja, ko y multilingual; el rendimiento fuera de esos idiomas es desconocido.
- Sin contexto conversacional: es un modelo TTS, no un modelo de lenguaje; no procesa instrucciones, no razona y no soporta tool calling.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion por parte de la comunidad es practicamente nula.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/darioooooo0o/drama-3-w4a16-32gb
- Modelo base: https://huggingface.co/fishaudio/drama-3
- Variante con backbone en bf16 (40 GB o mas): https://huggingface.co/darioooooo0o/drama-3-w4a16
- SGLang-Omni (repositorio): https://github.com/sgl-project/sglang-omni
- Cookbook de Drama 3 en SGLang-Omni: https://sgl-project.github.io/sglang-omni/cookbook/fishaudio_drama3.html
- Perfil del autor de la cuantizacion: https://x.com/imdariotoo
- Clip de referencia para clonacion citado en la model card: https://huggingface.co/datasets/zhaochenyang20/seed-tts-eval-mini/resolve/main/en/prompt-wavs/common_voice_en_10119832.wav
- Fichero de licencia: LICENSE (incluido en el repositorio de HuggingFace)
- La busqueda web realizada no ha devuelto resultados relevantes sobre este modelo: los unicos enlaces obtenidos corresponden al videojuego de navegador Ikariam y no guardan relacion con la ficha.
