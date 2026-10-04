# crash-sv/scribe-whisper-turbo-ggml

## Resumen

scribe-whisper-turbo-ggml es una republicacion en formato GGML del modelo de reconocimiento automatico del habla Whisper large-v3-turbo de OpenAI, cuantizado a q5_0 para su uso con whisper.cpp. El repositorio lo publica el autor crash-sv como dependencia descargable de Scribe SV, una utilidad de dictado y traduccion para Windows que ejecuta el modelo sobre cualquier GPU con soporte Vulkan (AMD, Intel o NVIDIA). El archivo tiene 574.041.195 bytes (aproximadamente 0,6 GB) y no ha sido reentrenado ni reconvertido: es una copia byte a byte de `ggml-large-v3-turbo-q5_0.bin` procedente de ggerganov/whisper.cpp, con SHA-256 `394221709cd5ad1f40c46e6031ca61bce88931e6e088c188294c6d5a55ffa7e2`.

La relevancia de esta ficha es doble. Por un lado, documenta un artefacto de despliegue listo para produccion en el ecosistema whisper.cpp, con licencia MIT y verificacion de integridad explicita por parte del autor. Por otro, sirve como ejemplo de patron de publicacion de pesos derivados: el repositorio conserva las licencias originales (MIT de OpenAI para el modelo y MIT de whisper.cpp para la conversion y la cuantizacion) y acredita a ambos autores.

El modelo base, Whisper large-v3-turbo, es un transformer encoder-decoder de reconocimiento de voz de OpenAI. Esta variante "turbo" reduce el coste de decodificacion respecto a large-v3 manteniendo el encoder, lo que la hace adecuada para transcripcion en tiempo casi real. Los idiomas declarados en la model card de esta republicacion son ruso (ru) e ingles (en), aunque el modelo base de OpenAI es multilingue; la ficha del autor no detalla el conjunto completo de idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder de reconocimiento automatico del habla (familia Whisper; variante large-v3-turbo del modelo base) |
| Parametros totales | no disponible en la informacion proporcionada; el tamano del archivo (574.041.195 bytes) en cuantizacion q5_0 implica del orden de 800-900 millones de parametros, coherente con whisper-large-v3-turbo |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Whisper procesa audio en ventanas; la ficha no especifica el valor) |
| Tipos de cuantizacion | q5_0 (unico formato publicado en este repositorio) |
| Idiomas soportados | ru, en (segun los tags y la model card); el modelo base es multilingue, pero no se detalla la lista completa |
| Licencia | MIT |
| Formato de pesos | GGML (`ggml-large-v3-turbo-q5_0.bin`), compatible con whisper.cpp |

Datos adicionales del artefacto:

| Dato | Valor |
|---|---|
| Tamano del archivo | 574.041.195 bytes |
| SHA-256 | `394221709cd5ad1f40c46e6031ca61bce88931e6e088c188294c6d5a55ffa7e2` |
| Tamano del repositorio | 0,6 GB |
| Fecha de creacion | 2026-10-04 |
| Ultima actualizacion | 2026-10-04 |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

El autor declara explicitamente que no se ha reentrenado, convertido ni recuantizado nada: el archivo es `ggml-large-v3-turbo-q5_0.bin` de ggerganov/whisper.cpp, byte a byte, con la cuantizacion q5_0 realizada por los autores de whisper.cpp. La unica aportacion del repositorio es la republicacion, la verificacion del checksum frente al repositorio de origen (comparado el 2026-10-04) y el empaquetado legal con las licencias MIT originales. Por tanto, la arquitectura y los datos de entrenamiento corresponden integramente al modelo base openai/whisper-large-v3-turbo, sobre el que la informacion disponible no aporta detalles adicionales de composicion del dataset ni de fases de ajuste (RLHF, DPO u otras).

En el plano practico, la innovacion relevante aqui es el formato de despliegue: GGML cuantizado a q5_0, que reduce el peso del modelo hasta unos 0,6 GB y permite ejecucion en CPU y en GPU a traves del backend Vulkan de whisper.cpp, con soporte de DTW (dynamic time warping) para alineacion temporal mediante la opcion `-dtw large.v3.turbo`. La cuantizacion q5_0 es una aproximacion de 5 bits con escalas por bloque, orientada a minimizar la perdida de calidad de transcripcion manteniendo un consumo de memoria bajo. No se documenta en la ficha ningun dato sobre decodificacion especulativa, atencion lineal ni tecnicas adicionales de optimizacion.

## Capacidades

- Transcripcion de voz a texto (pipeline `automatic-speech-recognition`) mediante whisper.cpp.
- Procesamiento de audio en el idioma detectado automaticamente (`-l auto`) o forzado a un idioma concreto.
- Traduccion y dictado, segun el caso de uso declarado por la aplicacion Scribe SV para Windows.
- Alineacion temporal de la transcripcion con marcas de tiempo mediante DTW (`-dtw large.v3.turbo`).
- Ejecucion acelerada por GPU a traves de Vulkan en hardware AMD, Intel y NVIDIA, ademas de la via CPU.
- Idiomas declarados: ruso e ingles. No se documentan en esta ficha capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio generativo ni modo "thinking"; son capacidades ajenas al proposito de un modelo ASR.

## Casos de uso

- Dictado por voz en escritorio: Scribe SV lo integra como motor de transcripcion en Windows, de modo que el usuario puede convertir habla en texto en cualquier aplicacion mediante una utilidad local.
- Transcripcion de reuniones y notas de voz en ruso e ingles: al ejecutarse localmente y sin llamadas a API, es adecuado para contenido interno o sensible que no debe salir del equipo.
- Subtitulado y generacion de transcripciones con marcas de tiempo: la opcion DTW permite obtener alineaciones temporales utiles para generar subtitulos o indices de audio.
- Procesamiento por lotes de archivos de audio: whisper-server en modo servidor permite encolar transcripciones sin recargar el modelo en cada peticion.
- Despliegue en equipos sin GPU dedicada NVIDIA: al ser GGML cuantizado a q5_0 y usar backend Vulkan o CPU, funciona en maquinas con graficas integradas Intel o AMD, un escenario habitual en parques de oficina.
- Aplicaciones de accesibilidad: conversion de voz a texto en tiempo casi real para personas con dificultades de escritura, con un coste de memoria de aproximadamente 0,6 GB de pesos.
- Traduccion asistida de audio: la propia descripcion del proyecto Scribe SV menciona funciones de dictado y traduccion, por lo que encaja en flujos de transcripcion y traduccion de contenido hablado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de WER, latencia ni comparativas numericas con otros modelos o cuantizaciones.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: los pesos ocupan aproximadamente 0,6 GB en q5_0; contando buffers de activaciones y estado de decodificacion, es razonable reservar del orden de 1 a 2 GB de memoria. No hay mediciones oficiales en la informacion disponible.
- GPU compatibles: cualquier GPU con soporte Vulkan, segun la model card (AMD, Intel y NVIDIA). Tambien es posible la ejecucion en CPU.
- GPU de consumo: si, cabe con holgura en cualquier GPU de consumo moderna e incluso en graficas integradas recientes, dado el tamano reducido del archivo. No se especifican modelos concretos recomendados.
- Opciones de despliegue: whisper.cpp, incluyendo el binario `whisper-server` y, por extension del ecosistema GGML, herramientas compatibles con este formato. No se mencionan vLLM, TGI ni Ollama en la informacion proporcionada.
- Latencia y throughput: no disponibles. Dependeran del hardware, del backend (Vulkan frente a CPU) y de la duracion del audio de entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| crash-sv/scribe-whisper-turbo-ggml | no disponible (archivo de 574 MB en q5_0) | no disponible | ru, en (declarados) | MIT | GGML (q5_0) | HuggingFace, 0 descargas |
| ggerganov/whisper.cpp `ggml-large-v3-turbo-q5_0.bin` | identico al anterior (mismo archivo, byte a byte) | no disponible | no disponible | MIT | GGML (q5_0) | HuggingFace, repositorio de origen |
| openai/whisper-large-v3-turbo | no disponible | no disponible | multilingue (no detallado aqui) | MIT | safetensors / PyTorch | HuggingFace, modelo base |
| Otras cuantizaciones Whisper en GGML (por ejemplo q8_0 o q5_1) | no disponible | no disponible | segun el modelo base | MIT | GGML | disponibles en el repositorio de whisper.cpp; no se aportan datos comparativos de calidad |

La comparativa estrictamente verificable es que este repositorio es una copia exacta del artefacto de whisper.cpp; cualquier diferencia de rendimiento frente a otros formatos o cuantizaciones no esta documentada en la informacion disponible.

## Limitaciones y advertencias

- No hay datos de evaluacion propios: al no haberse publicado benchmarks, no se puede afirmar ninguna cifra de precision (WER) para esta cuantizacion concreta.
- La cuantizacion q5_0 introduce una perdida de precision frente a los pesos originales en safetensors; no se documenta su magnitud.
- Idiomas declarados limitados a ruso e ingles en la ficha, pese a que el modelo base es multilingue; el comportamiento en otros idiomas no esta verificado en esta publicacion.
- Riesgo de alucinacion inherente a los modelos Whisper en audio con ruido, silencios largos o solapamiento de voces; no hay advertencias especificas del autor al respecto.
- Sesgos: no se documenta ningun analisis de sesgos por acento, genero, edad o variedad dialectal.
- Licencia MIT: permite uso comercial y modificacion, pero exige conservar el aviso de copyright y la atribucion. El repositorio incluye los textos `LICENSE-MIT-whisper-cpp.txt` y `LICENSE-MIT-openai-whisper.txt` en la raiz.
- Trazabilidad: el autor indica que no modifico el archivo, pero la verificacion se limita a la comparacion del checksum declarada el 2026-10-04; conviene recalcular el SHA-256 antes de desplegarlo.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en produccion por terceros ni de mantenimiento continuado.
- La deteccion automatica de idioma (`-l auto`) puede fallar en audios cortos o con cambio de idioma a mitad de fragmento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/crash-sv/scribe-whisper-turbo-ggml
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Repositorio de origen del archivo GGML: https://huggingface.co/ggerganov/whisper.cpp
- Proyecto whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Licencia de whisper.cpp (MIT): https://raw.githubusercontent.com/ggml-org/whisper.cpp/master/LICENSE
- Aplicacion Scribe SV: https://github.com/Crash-SV
- Busqueda web realizada: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a noticias de accidentes aereos y a la pelicula "Crash" (2004), sin relacion con este repositorio.
