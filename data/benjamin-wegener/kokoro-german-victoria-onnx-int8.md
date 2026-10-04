# Benjamin-Wegener/kokoro-german-victoria-onnx-int8

## Resumen

Kokoro German Victoria (ONNX, int8) es una exportacion a ONNX del modelo de sintesis de voz kikiri-tts/kikiri-german-victoria, un TTS aleman de un solo hablante (voz "Victoria") compatible con la arquitectura Kokoro (StyleTTS2). Lo publica el usuario Benjamin-Wegener y su proposito es la inferencia en dispositivo (on-device), sin conexion a red, mediante el runtime sherpa-onnx. Se distribuye con cuantizacion dinamica int8 de los pesos, lo que reduce el fichero del modelo a unos 114 MB frente a los aproximadamente 325 MB de la exportacion fp32.

El modelo resuelve un caso muy concreto: sintesis de voz en aleman de calidad razonable en hardware modesto, incluido un telefono Android de gama media. El autor lo construyo para la aplicacion Android offline SISA-Collector, de ahi que el foco este en tamano reducido, ausencia de dependencias de red y compatibilidad con sherpa-onnx 1.13.8 (escritorio y Android). La entrada es fonetica (vocabulario Kokoro de simbolos) y la salida es audio float32 a 24 kHz.

No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes. Su relevancia actual esta en el ecosistema de TTS embebible: junto con el voicepack y el vocabulario de tokens, forma un paquete completo y ligero para anadir voz alemana a aplicaciones moviles o de escritorio con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro / StyleTTS2 (TTS neuronal), exportada a ONNX con metadatos sherpa-onnx (`model_type=kokoro`, `version=2`) |
| Parametros totales | no disponible (la version de referencia Kokoro-82M citada en los creditos tiene del orden de 82 M de parametros; no se especifica el recuento de esta variante) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo TTS). La seleccion de estilo usa un vector `[510, 256]` indexado por el numero de tokens de entrada |
| Tipos de cuantizacion | int8 dinamico de pesos (fichero publicado); exportacion fp32 de referencia (~325 MB) |
| Idiomas soportados | aleman (de) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.int8.onnx`, ~114 MB), voicepack `voices.bin` (float32 `[510, 256]`, 522 KB) y `tokens.txt` (vocabulario de fonemas Kokoro) |
| Frecuencia de muestreo | 24 kHz, salida float32 |
| Entradas / salidas | `tokens` int64 `[1, N]`, `style` float32 `[1, 256]`, `speed` float32 `[1]` -> `audio` float32 |
| Tamano del repositorio | 0,2 GB |
| Modelo base | kikiri-tts/kikiri-german-victoria |

## Arquitectura y entrenamiento

La ficha del autor indica que se trata de una exportacion ONNX de kikiri-tts/kikiri-german-victoria, descrito como un modelo TTS aleman de un solo hablante compatible con Kokoro (StyleTTS2). Kokoro es una familia de modelos TTS que combina un backbone estilo StyleTTS2 con un decodificador de audio, y en esta variante el estilo se controla mediante un vector de 256 dimensiones elegido a partir del recuento de tokens: el voicepack `voices.bin` contiene una matriz `[510, 256]` de la que se selecciona una fila segun el numero de tokens de entrada. El script `export_onnx.py` incluido en el repositorio permite reproducir la exportacion desde el fichero `.pth` original.

No se proporciona informacion sobre el dataset de entrenamiento, el numero de tokens vistos, la composicion de los datos ni si hubo etapas de ajuste tipo RLHF o DPO. Tampoco se documenta el procedimiento de cuantizacion mas alla de indicar que es una cuantizacion dinamica int8 de pesos y que los pesos resultantes difieren ligeramente de la exportacion fp32. La innovacion tecnica relevante aqui no es el entrenamiento, sino el empaquetado para inferencia: el fichero ONNX ya incorpora los metadatos que sherpa-onnx necesita, de modo que la integracion se reduce a configurar `model`, `voices`, `tokens`, `dataDir` y `lang=de`.

## Capacidades

- Sintesis de voz (text-to-speech) en aleman con una unica voz de hablante, "Victoria".
- Salida de audio mono a 24 kHz en formato float32.
- Control de velocidad de habla mediante el parametro de entrada `speed`.
- Entrada fonetica basada en el vocabulario de simbolos de Kokoro (`tokens.txt`), no entrada de texto libre directa: el texto debe fonemizarse antes (por ejemplo con espeak-ng) y tokenizarse.
- Inferencia en dispositivo, sin conexion a red, mediante sherpa-onnx (probado en escritorio y Android con la version 1.13.8).
- Seleccion de estilo segun la longitud de la secuencia de tokens.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multimodales de entrada: no procesa vision ni audio; solo texto fonemizado.
- No es multilingue: unicamente aleman.
- No dispone de modo "thinking" ni de capacidades de generacion de texto, codigo o matematicas.

## Casos de uso

- Lectura por voz en aplicaciones Android offline: el modelo ocupa unos 114 MB y funciona en CPU de telefono, por lo que se puede empaquetar dentro de la APK o descargar en la primera ejecucion para leer textos sin conexion, como hace el propio SISA-Collector.
- Accesibilidad para personas con discapacidad visual: conversion de articulos, notificaciones o documentos alemanes a audio en el propio dispositivo, con control de velocidad para ajustar la comprension.
- Asistentes de voz embebidos en aleman: generacion de respuestas habladas en un asistente local donde no se quiere enviar texto a la nube por privacidad o coste.
- Audiolibros y contenido largo: sintesis por lotes de parrafos de texto aleman a WAV/MP3 a 24 kHz para generar narraciones, aprovechando que el modelo no requiere GPU.
- Sistemas de navegacion o avisos en vehiculo o industria: mensajes hablados predecibles y de baja latencia en entornos sin conectividad, con una unica voz consistente.
- Prototipado de interfaces de voz: sustitucion rapida de un TTS en la nube por uno local en fase de desarrollo, manteniendo el mismo pipeline si ya se usa sherpa-onnx.
- Traduccion o doblaje de apoyo: combinado con un sistema de traduccion de texto a aleman externo, generar la pista de audio alemana; el modelo se encarga solo de la sintesis.
- Generacion de datasets de audio sintetico: creacion de muestras de habla alemana etiquetadas como generadas por IA para pruebas de pipelines de ASR o de deteccion de voz sintetica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos de rendimiento aportados por el autor son operativos: el modelo se ejecuta a una velocidad cercana al tiempo real en la CPU de un telefono de gama Pixel, con aproximadamente 1 segundo de computo por cada segundo de audio y 4 hilos. El autor indica explicitamente que no se realizo una prueba de escucha formal comparando la version int8 con la fp32.

## Requisitos de hardware

- VRAM estimada: el fichero int8 ocupa unos 114 MB; la exportacion fp32, unos 325 MB. Cabe holgadamente en cualquier GPU con 1-2 GB de memoria, e incluso se puede ejecutar solo en CPU.
- GPU recomendadas: no se especifica ninguna; el caso de uso objetivo es CPU (telefono Android o escritorio). Cualquier GPU moderna es suficiente y en la mayoria de despliegues es innecesaria.
- Compatibilidad con GPU de consumo: si, cualquier GPU de consumo reciente es sobradamente suficiente; el modelo tambien funciona sin GPU.
- CPU objetivo: telefonos de gama Pixel, donde alcanza aproximadamente tiempo real con 4 hilos.
- Opciones de despliegue: sherpa-onnx (version probada 1.13.8, en escritorio y Android) y ONNX Runtime a traves de las herramientas de sherpa-onnx. Requiere los datos de espeak-ng (`dataDir`) y `lang=de`.
- Frameworks no aplicables: vLLM, llama.cpp, Ollama y TGI estan orientados a modelos de lenguaje y no aplican a este modelo TTS.
- Latencia y throughput: aproximadamente 1 segundo de computo por 1 segundo de audio en CPU de gama Pixel con 4 hilos (factor de tiempo real cercano a 1,0). No se aportan cifras para GPU ni para escritorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Idiomas | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| kokoro-german-victoria-onnx-int8 (este modelo) | no disponible | Entrada fonetica de longitud variable; estilo `[510, 256]` | Aleman | ~1 s de computo por 1 s de audio en CPU de telefono (4 hilos); sin prueba de escucha formal int8 vs fp32 | Apache-2.0 | ONNX int8 (~114 MB) en HuggingFace |
| kikiri-tts/kikiri-german-victoria (base) | no disponible | Igual, en fp32 | Aleman | no disponible | Apache-2.0 | Pesos originales (`.pth` / exportacion fp32 ~325 MB) |
| hexgrad/Kokoro-82M (referencia citada en los creditos) | 82 M (segun la denominacion del modelo) | Kokoro / StyleTTS2 | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | Publico, usado como base del ecosistema Kokoro |
| Otras alternativas TTS ligeras en ONNX (Piper, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La busqueda web realizada no devolvio informacion tecnica relevante sobre este modelo ni sobre alternativas comparables; los resultados obtenidos correspondian al nombre propio "Benjamin" y no guardan relacion con el modelo.

## Limitaciones y advertencias

- Voz sintetica: el autor recomienda etiquetar la salida como generada por IA donde la normativa lo exija (por ejemplo, articulo 50 del Reglamento europeo de IA).
- El fonema `ʏ` (u corta alemana, u con dieresis breve) no existe en el vocabulario de Kokoro; hay que mapearlo a `y` antes de tokenizar. Si no se hace, la pronunciacion de esas palabras sera incorrecta.
- Los pesos int8 difieren ligeramente de los de la exportacion fp32 debido al proceso de cuantizacion, y no se ha realizado una prueba de escucha formal que cuantifique esa diferencia.
- Modelo de un solo hablante: no permite cambiar de voz ni clonar voces.
- Solo aleman: no hay soporte para otros idiomas ni para mezcla de idiomas dentro de una misma frase.
- Se necesita un fonemizador externo compatible (espeak-ng con sus datos) y el vocabulario `tokens.txt`; el texto no se puede pasar en crudo.
- Licencia Apache-2.0, que permite uso comercial, pero obliga a conservar los ficheros `LICENSE` y `NOTICE` y a mantener las atribuciones a kikiri-tts y a hexgrad (Kokoro-82M).
- No se aportan datos sobre sesgos, alucinacion (en TTS, errores de pronunciacion o prosodia) ni sobre el comportamiento con textos largos.
- El repositorio no tiene descargas ni "likes" registrados en el momento de la consulta, y no se documenta un proceso de validacion independiente mas alla de las pruebas del propio autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Benjamin-Wegener/kokoro-german-victoria-onnx-int8
- Modelo base: https://huggingface.co/kikiri-tts/kikiri-german-victoria
- Proyecto kikiri-tts: https://huggingface.co/kikiri-tts
- sherpa-onnx (repositorio): https://github.com/k2-fsa/sherpa-onnx
- Kokoro-82M, de hexgrad (citado en los creditos): no se proporciono URL en la informacion disponible
- Resultados de busqueda web: no se encontro informacion tecnica relevante sobre este modelo; los resultados devueltos trataban sobre el nombre propio "Benjamin" y no son pertinentes.
