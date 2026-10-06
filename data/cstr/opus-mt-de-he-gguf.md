# cstr/opus-mt-de-he-GGUF

## Resumen

`cstr/opus-mt-de-he-GGUF` es una conversion al formato GGUF del modelo de traduccion automatica `Helsinki-NLP/opus-mt-de-he`, desarrollado dentro del proyecto OPUS-MT de la Universidad de Helsinki (Jörg Tiedemann y Santhosh Thottingal). Se trata de un modelo MarianMT de tipo transformer encoder-decoder, con 6 capas de encoder y 6 de decoder, dimension oculta de 512 y 77.015.642 parametros totales, especializado exclusivamente en el par de idiomas aleman (de) a hebreo (he).

El problema que resuelve es acotado pero relevante: traduccion unidireccional de alta velocidad y bajo coste computacional, pensada para integrarse en flujos de transcripcion en vivo. La conversion la firma el usuario `cstr` y esta orientada a su uso con el backend `marian` de CrispASR, donde estos modelos se emplean como traductores rapidos dentro de la funcion `--live-translate` (entrada de microfono, transcripcion y traduccion frase a frase).

Su relevancia actual es practica: los pesos originales solo se distribuian en formato de `transformers` (PyTorch/safetensors), y esta conversion permite ejecutar el modelo con la libreria ggml en C++, sin dependencia de Python ni de `torch`, en ficheros de 159 MB (f16) o 87 MB (q8_0). El repositorio no tiene descargas ni likes registrados en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT, transformer encoder-decoder (6 capas de encoder + 6 de decoder, d=512) |
| Parametros totales | 77.015.642 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, q8_0 |
| Idiomas soportados | aleman (de), hebreo (he) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (libreria ggml) |
| Tamano del repositorio | 0,2 GB |
| Modelo base | Helsinki-NLP/opus-mt-de-he (release opus-2020-01-29) |
| Direccion de traduccion | de -> he (unidireccional) |
| Backend de referencia | CrispASR, `--backend marian` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo MarianMT original: un transformer encoder-decoder clasico, sin mecanismos de atencion lineal ni mezclas de expertos, con 6 capas en cada torre y una dimension de modelo de 512. El modelo base fue entrenado con datos del corpus OPUS (opus.nlpl.eu) y se distribuye como parte de la release `opus-2020-01-29` del proyecto OPUS-MT. El autor de la conversion no aporta informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO; estos datos no estan disponibles en la informacion proporcionada.

La innovacion de este repositorio es exclusivamente de formato y herramienta, no de entrenamiento. Los pesos se mantienen sin cambios en f16 y se ofrece una version cuantizada a q8_0. El autor documenta una verificacion de paridad frente a la implementacion de referencia (`MarianMTModel.generate` de Hugging Face `transformers`) sobre 8 frases de prueba: la version f16 produce 8/8 frases identicas en decodificacion greedy y 8/8 con beam 4, mientras que la q8_0 produce 8/8 identicas en greedy, con diferencias de redaccion en el resto de configuraciones. Ademas, los identificadores de tokens de entrada coinciden en 8/8 casos. El pipeline de conversion se apoya en `models/convert-marian-to-gguf.py`, en la herramienta `crispasr-quantize` para la cuantizacion y en `tools/marian_parity.py` para la verificacion.

## Capacidades

- Traduccion de texto aleman a hebreo, unica tarea soportada por el modelo (pipeline declarado: `translation`).
- Ejecucion en modo texto a texto mediante linea de comandos, con decodificacion greedy (`-bs 1`) o con el tamano de beam propio del checkpoint.
- Integracion en modo traduccion en vivo (`--live-translate`): entrada de microfono, transcripcion y traduccion frase a frase, siempre con decodificacion greedy.
- Funcionamiento sin Python ni `torch`, al estar en formato GGUF y ejecutarse con la libreria ggml en C++.
- No dispone de soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades de vision, audio propio ni modo de razonamiento explicito; el reconocimiento de voz en el ejemplo en vivo lo aporta otro backend (`parakeet`), no este modelo.
- Cobertura multilingue limitada al par de/he; no traduce a otros idiomas.

## Casos de uso

- Subtitulado en vivo de eventos y reuniones: el modelo se integra en CrispASR con `--live-translate`, de modo que una charla en aleman puede mostrarse traducida al hebreo frase a frase, con latencia baja gracias a sus 77 millones de parametros.
- Transcripcion y traduccion de grabaciones periodisticas o entrevistas: se transcribe el audio aleman y se traduce el texto resultante al hebreo para su publicacion o archivado.
- Atencion al cliente en hebreo sobre contenido aleman: traduccion de tickets, correos o mensajes de soporte escritos en aleman para agentes que trabajan en hebreo, sin coste de API externa.
- Traduccion de documentacion tecnica y manuales: al ejecutarse localmente en CPU o GPU modesta, permite procesar grandes volumenes de texto sin enviar contenido confidencial a servicios en la nube.
- Preprocesado de corpus para investigacion en PLN: generacion de traducciones automaticas de partida (de -> he) para experimentos de evaluacion, aumentacion de datos o comparacion de sistemas.
- Despliegue en dispositivos con recursos limitados: los 87 MB de la version q8_0 permiten incluirlo en aplicaciones de escritorio o en entornos embebidos con requisitos de memoria reducidos, donde un modelo multilingue grande no cabria.
- Traduccion dentro de herramientas de accesibilidad: conversion de texto aleman a hebreo en lectores de pantalla o asistentes de lectura que requieran un motor de traduccion local y determinista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (BLEU, chrF, MMLU, etc.) en la informacion disponible. El unico dato de rendimiento aportado por el autor es la comparacion de paridad frente a la implementacion de referencia de Hugging Face:

| Version | Formato | Tamano | Frases identicas a la referencia (greedy) | Frases identicas (beam 4) |
|---|---|---|---|---|
| opus-mt-de-he | f16 | 159 MB | 8/8 | 8/8 |
| opus-mt-de-he | q8_0 | 87 MB | 8/8 | Diferencias de redaccion en el resto |
| Tokens de entrada | f16 | - | 8/8 identicos | 8/8 identicos |

No se dispone de metricas de calidad de traduccion sobre conjuntos de test estandar, ni de medidas de latencia o throughput publicadas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir del tamano de los ficheros): en torno a 200-300 MB para la version f16 (~159 MB de pesos mas activaciones y buffers) y 100-200 MB para la q8_0 (~87 MB de pesos).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; el modelo es viable en GTX 1650, RTX 3060, RTX 4090, A100 o H100, aunque estas dos ultimas estan sobredimensionadas para este tamano.
- Cabe holgadamente en GPU de consumo e incluso en CPU: es un modelo de 77 millones de parametros y puede ejecutarse en procesadores sin GPU dedicada.
- Opciones de despliegue: CrispASR con `--backend marian` es el backend indicado por el autor. No se documenta soporte oficial en vLLM, TGI, Ollama o llama.cpp en la informacion disponible; al ser GGUF existe compatibilidad potencial con otras herramientas ggml, pero no esta verificada.
- Latencia y throughput: no disponibles. El autor solo indica que son los traductores mas rapidos de CrispASR para transcripcion y traduccion en vivo, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| cstr/opus-mt-de-he-GGUF | 77.015.642 | no disponible | de -> he | CC-BY-4.0 | GGUF (f16, q8_0) | Hugging Face, 0 descargas |
| Helsinki-NLP/opus-mt-de-he | 77.015.642 (mismos pesos) | no disponible | de -> he | CC-BY-4.0 | safetensors / PyTorch | Hugging Face |
| cstr/opus-mt-he-de-GGUF | no disponible | no disponible | he -> de | CC-BY-4.0 (segun el modelo del que deriva) | GGUF | Hugging Face, citado en la model card |
| Modelos multilingues tipo NLLB-200 | no disponible en la informacion proporcionada | no disponible | cientos de idiomas | no disponible | no disponible | no disponible |

La diferencia principal frente al checkpoint original es el formato: la conversion GGUF permite inferencia en C++ con ggml sin `torch`, y anade una version cuantizada a q8_0 que reduce el fichero de 159 MB a 87 MB con paridad greedy sobre las 8 frases de prueba. El modelo inverso he -> de se distribuye como repositorio separado. No hay datos de benchmarks que permitan comparar calidad de traduccion con alternativas multilingues.

## Limitaciones y advertencias

- Modelo unidireccional: solo traduce de aleman a hebreo. Para la direccion contraria hay que usar otro checkpoint (`cstr/opus-mt-he-de-GGUF`, si existe para ese par).
- El autor advierte de una diferencia de comportamiento: las cadenas literales `</s>`, `<unk>` y `<pad>` se tratan como texto normal en esta implementacion, mientras que la referencia de Hugging Face las interpreta como tokens especiales. Esto puede alterar la salida en entradas que contengan esas cadenas.
- En modo en vivo la decodificacion es siempre greedy, lo que suele implicar menor calidad que beam search.
- La cuantizacion q8_0 reproduce la salida de la referencia en 8/8 frases con decodificacion greedy, pero difiere en la redaccion en otras configuraciones; en produccion conviene validar con un conjunto de frases propio.
- Modelo de 77 millones de parametros: la calidad de traduccion esperable es inferior a la de sistemas neuronales grandes o multilingues, especialmente en terminologia especializada, frases largas y textos con mucho contexto.
- No se han publicado datos de sesgo, robustez ni tasas de alucinacion para esta conversion ni para el checkpoint base en la informacion disponible.
- Alucinaciones de traduccion: como cualquier sistema de traduccion automatica, puede generar contenido no presente en el original, sobre todo en segmentos ambiguos o con ruido de transcripcion.
- Longitud de contexto no documentada: no hay informacion sobre el maximo de tokens de entrada soportado, lo que dificulta planificar el troceado de documentos largos.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribucion al proyecto OPUS-MT (Universidad de Helsinki) y a los autores del corpus OPUS. La model card insiste en que la atribucion se basa en la declaracion del proyecto OPUS-MT, no en la etiqueta de una model card individual.
- Sin garantias de mantenimiento: el repositorio registra 0 descargas y 0 likes, y no se documenta soporte en otros backends distintos de CrispASR.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los enlaces recuperados corresponden a siglas homonimas (reactores CSTR, centros de rehabilitacion, funciones de Visual Basic) y no guardan relacion con el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cstr/opus-mt-de-he-GGUF
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-de-he
- Modelo inverso (he -> de) citado en la model card: https://huggingface.co/cstr/opus-mt-he-de-GGUF
- Backend CrispASR: https://github.com/CrispStrobe/CrispASR
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Repositorio de entrenamiento OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT-train
- Corpus OPUS: https://opus.nlpl.eu/
- Paper de referencia: Tiedemann y Thottingal, *OPUS-MT — Building open translation services for the World*, EAMT 2020 (sin URL directa en la informacion proporcionada).
- Busqueda web: sin resultados relevantes para este modelo.
