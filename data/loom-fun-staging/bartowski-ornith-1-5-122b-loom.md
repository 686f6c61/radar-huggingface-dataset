# loom-fun-staging/bartowski-Ornith-1.5-122B-loom

## Resumen

Ornith-1.5-122B es un modelo de lenguaje y vision de tipo image-text-to-text disponible originalmente en formato GGUF a traves de `bartowski/Ornith-1.5-122B-GGUF`. El repositorio analizado, `loom-fun-staging/bartowski-Ornith-1.5-122B-loom`, no contiene los pesos originales, sino un paquete de despliegue para el runtime Loom de AMD: un conjunto de programas `.loom` y un fichero `model.json` generado sobre el checkpoint GGUF sin modificar, en cuantizacion Q4_K_M y dividido en dos shards.

La relevancia del paquete reside en que demuestra una ruta de ejecucion optimizada para hardware AMD, concretamente la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151), con decodificacion especulativa DFlash activada por defecto y una API compatible con OpenAI. Segun los datos del autor, Loom alcanza 27,7 tok/s en decodificacion de prompt corto frente a 10,2 tok/s de llama.cpp ROCm, y 762-932 tok/s en prefill de documentos de 8k a 32k tokens.

No se dispone de informacion sobre el desarrollador original del modelo base Ornith-1.5-122B, su composicion de entrenamiento ni su licencia. Todos los datos tecnicos disponibles provienen de la model card del paquete Loom y de las mediciones de rendimiento publicadas por su autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete menciona una cabeza MTP con expertos NextN q4_0 y un modelo mezcla de expertos, MoE) |
| Parametros totales | 122B (segun denominacion del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible como spec del modelo; las pruebas se ejecutaron con `-c 65536` en llama.cpp y hasta 32k tokens de documento en prefill |
| Tipos de cuantizacion | Q4_K_M (unico formato empaquetado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (dos shards: `Ornith-1.5-122B-Q4_K_M-00001-of-00002.gguf` y `-00002-of-00002.gguf`); paquete Loom con `model.json` y programas `.loom` |

## Arquitectura y entrenamiento

El paquete no documenta la arquitectura interna del modelo base. Los indicios disponibles apuntan a un transformer de tipo mezcla de expertos (MoE): la metodologia de roofline del autor senala explicitamente que el techo de rendimiento multistream "de este modelo mezcla de expertos" asume que las cuatro secuencias enrutan a los mismos expertos. Tambien se menciona una cabeza MTP (multi-token prediction) con expertos NextN en q4_0, presente en el checkpoint pero aun no soportada por Loom.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras. La innovacion tecnica destacable no esta en el modelo sino en el runtime: el paquete integra decodificacion especulativa DFlash con profundidad 1 y un drafter separado (`kaivoss/Ornith-1.5-122B-DFlash2-GGUF`, tambien en Q4_K_M), activada por defecto, con una tasa de aceptacion de tokens redactados del 76 % medida en una sesion y del 51-59 % en las sesiones de las pruebas de decodificacion.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto, desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Entrada de imagenes en formato OpenAI `image_url`, con pipeline image-text-to-text.
- Tool calling / function calling con esquema OpenAI (`tools` y `tool_calls`).
- Servidor HTTP con API compatible con `/v1/chat/completions` en `127.0.0.1:8080`.
- Decodificacion especulativa integrada (DFlash, profundidad 1) con drafter dedicado.
- Soporte de peticiones concurrentes: las pruebas incluyen 4 streams en paralelo con decodificacion agregada.
- No se documentan capacidades de audio ni de razonamiento con niveles de esfuerzo configurables (el campo "reasoning effort" figura como no aplicable).

## Casos de uso

- Asistente conversacional multimodal en local: el modelo acepta texto e imagenes en la misma peticion mediante el esquema `image_url`, lo que permite construir interfaces de chat que respondan a capturas de pantalla o documentos escaneados sin salir del equipo.
- Analisis de documentos largos: con prefill medido de 762-932 tok/s en documentos de 8k a 32k tokens, es viable procesar informes, contratos o articulos extensos y generar resumenes o respuestas sobre ellos en una sola sesion.
- Automatizacion de agentes con herramientas: el soporte nativo de `tools` y `tool_calls` en formato OpenAI permite integrar el modelo en frameworks de agentes existentes sin adaptadores personalizados, encadenando llamadas a APIs o funciones locales.
- Generacion y revision de codigo en estaciones de trabajo AMD: al ejecutarse sobre una APU Strix Halo con 106 GB de memoria asignada, puede mantener un asistente de programacion local con contexto amplio y sin dependencia de servicios en la nube.
- Procesamiento por lotes con concurrencia moderada: las pruebas de 4 streams con 54,6 tok/s agregados lo sitúan como opcion para servir a un equipo pequeno desde una unica maquina, por ejemplo para clasificacion o extraccion de datos.
- Evaluacion y desarrollo de runtimes: el paquete sirve como referencia reproducible para comparar Loom frente a llama.cpp ROCm y Vulkan con el mismo GGUF, los mismos prompts y el mismo runner, util para ingenieros que optimizan inferencia en hardware AMD.
- Prototipado de asistentes con razonamiento visible: el modo thinking activado por defecto permite inspeccionar la cadena de razonamiento en tareas de matematicas o logica antes de desplegar la version final con el modo desactivado.

## Benchmarks y rendimiento

Los unicos datos publicados son mediciones de inferencia del paquete Loom sobre AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, 216 GB/s, 59 TFLOP/s), comparadas con llama.cpp ROCm b1374 y llama.cpp Vulkan b12211 usando el mismo GGUF y los mismos prompts. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Metrica | llama.cpp ROCm | Loom | Margen | Techo roofline | Loom % del techo | llama.cpp Vulkan |
|---|---|---|---|---|---|---|
| Decode tok/s, prompt corto | 10,2 | 27,7 | +172 % | 33,1 | 84 % | 6,0 |
| Decode tok/s, contexto 2k | 10,1 | 24,5 | +143 % | 31,3 | 78 % | 5,8 |
| Decode tok/s, contexto 32k | 9,3 | 20,9 | +125 % | 30,1 | 69 % | 5,8 |
| Prefill tok/s, documento 1k | 398,5 | 795,8 | +100 % | 3459,7 | 23 % | 289,8 |
| Prefill tok/s, documento 2k | 420,0 | 901,3 | +115 % | 3420,3 | 26 % | 315,3 |
| Prefill tok/s, documento 8k | 426,3 | 932,2 | +119 % | 3201,4 | 29 % | 329,0 |
| Prefill tok/s, documento 16k | 400,4 | 860,8 | +115 % | 2949,6 | 29 % | 309,1 |
| Prefill tok/s, documento 32k | 355,9 | 762,0 | +114 % | 2548,8 | 30 % | 278,9 |
| 4 streams, decode agregado tok/s | 47,9 | 54,6 | +14 % | 104,6 | 52 % | 45,6 |
| Tokens redactados aceptados (spec decoding) | — | 76 % | — | n/a | n/a | n/a |

Notas de metodo: valores medios de 3 rondas (4 streams: mediana de 3); Loom cronometrado por el cliente y llama.cpp por su servidor; DFlash con profundidad 1 en Loom y `--spec-draft-n-max 15` en llama.cpp; los 4 streams se ejecutaron sin drafting; margen de +-3 % considerado empate; medido el 2026-11-13 con hrx-loom 0.1.0. La tasa de aceptacion del 76 % se midio el 2026-11-12 en un equipo distinto (Ryzen AI Max+ 395 con Radeon 8060S, Ubuntu 24.04).

## Requisitos de hardware

- Memoria necesaria: aproximadamente 82 GB segun la model card; el comando de ejemplo reserva `--memory_bytes=106000000000` (106 GB).
- No cabe en una AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Hardware de referencia: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151), con 216 GB/s de ancho de banda y 59 TFLOP/s.
- GPU recomendadas: no se documentan otras opciones; el paquete esta orientado a APUs Strix Halo con memoria unificada.
- Cabe en GPU de consumo: no en tarjetas de 24-32 GB; requiere un sistema con memoria unificada o agregada de al menos 82 GB.
- Despliegue: `pip install "hrx-loom[hf]==0.1.0"`, `loom-fetch` para materializar el paquete y `loom-serve` con `--device=amdgpu://?completion_spin_ns=4294967295`; servidor OpenAI en `127.0.0.1:8080`.
- Throughput medido: 27,7 tok/s en decodificacion de prompt corto, 20,9 tok/s a 32k de contexto y 54,6 tok/s agregados con 4 streams; prefill de 762-932 tok/s en documentos de 8k a 32k.
- La cabeza MTP no esta soportada por Loom en esta version.

## Comparativa con modelos similares

No se dispone de datos de otros modelos de 122B con vision para comparar parametros, contexto o calidad. La comparacion disponible es de motores de inferencia sobre el mismo checkpoint:

| Motor | Decode tok/s (corto) | Decode tok/s (32k) | Prefill tok/s (8k) | 4 streams tok/s | Notas |
|---|---|---|---|---|---|
| Loom 0.1.0 (ROCm, Strix Halo) | 27,7 | 20,9 | 932,2 | 54,6 | DFlash profundidad 1; 84 % del techo roofline en decode corto |
| llama.cpp ROCm b1374 | 10,2 | 9,3 | 426,3 | 47,9 | DFlash con `--spec-draft-n-max 15` |
| llama.cpp Vulkan b12211 | 6,0 | 5,8 | 329,0 | 45,6 | Contexto limitado a 36k en 1 stream y 144k en 4 streams |

## Limitaciones y advertencias

- La licencia no esta disponible, lo que impide confirmar si se permite uso comercial del modelo o del paquete.
- No hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad; no se puede valorar el riesgo de alucinacion mas alla de lo habitual en modelos de este tamano.
- El paquete esta atado al runtime Loom (hrx-loom 0.1.0, hrx-system d01d1c1) y a hardware AMD; no es portable a otros motores sin usar el GGUF original.
- Requiere unos 82 GB de memoria, lo que lo excluye de GPU de consumo y de la Radeon AI PRO R9700 de 32 GB.
- La cabeza MTP presente en el checkpoint no esta soportada por Loom, por lo que se pierde esa via de aceleracion.
- El rendimiento medido depende del runner de DevLab y varia entre sesiones; la aceptacion del drafter cae del 76 % al 51-59 % en las sesiones de decodificacion.
- El repositorio no tiene descargas ni likes y fue creado y actualizado el mismo dia (2026-11-14), por lo que carece de validacion de la comunidad.
- El contexto maximo del modelo no esta documentado; las pruebas usan 64k en llama.cpp, pero no se confirma que sea el limite nativo.
- Los resultados de busqueda web sobre "Loom" corresponden a productos no relacionados (grabador de pantalla y marca de ropa) y no aportan informacion sobre este modelo.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-fun-staging/bartowski-Ornith-1.5-122B-loom
- Modelo base GGUF: https://huggingface.co/bartowski/Ornith-1.5-122B-GGUF
- Drafter DFlash: https://huggingface.co/kaivoss/Ornith-1.5-122B-DFlash2-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Ejecucion de referencia (rendimiento): https://github.com/loom-fun/loom-skills/actions/runs/43392400146/job/131775276661
- Ejecucion de referencia (aceptacion del drafter): https://github.com/loom-fun/loom-skills/actions/runs/43320824063
