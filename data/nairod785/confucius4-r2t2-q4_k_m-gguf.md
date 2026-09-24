# Nairod785/Confucius4-R2T2-Q4_K_M-GGUF

## Resumen

Confucius4-R2T2-Q4_K_M-GGUF es una cuantizacion GGUF en Q4_K_M del modelo de reconocimiento automatico del habla (ASR) netease-youdao/Confucius4-R2T2, publicada por el usuario Nairod785. El modelo original lo desarrolla NetEase Youdao y esta afinado a partir de Qwen3-ASR-1.7B, incorporando decodificacion de "prefijo estable mas largo" (Longest Stable Prefix) para transcripcion en streaming de tipo append-only, es decir, que va anadiendo texto sin reescribir lo ya emitido. El repositorio contiene un unico fichero de pesos de 1,187 GB (1.186.939.968 bytes), un 52 % mas pequeno que la referencia Q8_0 de 2,478 GB.

La relevancia de esta version concreta esta en la receta de cuantizacion: segun el autor, las cuantizaciones uniformes de 4 y 5 bits provocaban salidas vacias catastroficas o deriva silenciosa de idioma (por ejemplo, transcribir en ingles audio en aleman o ruso), lo que habia confinado las publicaciones GGUF previas a Q8_0 o superior. Esta entrega aplica una receta asimetrica por tensor que mantiene las proyecciones "down" del MLP en Q6_K como suelo duro, los embeddings en Q2_K y el resto en Q4_K, preservando estabilidad multilingue verificada en ingles, chino, aleman y frances.

El modelo base es un encoder de audio Qwen3-ASR de 24 capas y anchura 1024 (2048 proyectada) acoplado a un decodificador LM causal de 28 capas con 16 cabezas de consulta y 8 cabezas KV. Soporta 30 idiomas, con optimizacion declarada para chino e ingles, y se ejecuta de forma nativa en transcribe.cpp y audio.cpp. La licencia de los pesos es la NetEase Youdao Model Use License, no Apache-2.0 (aunque el codigo fuente del modelo original si lo es), con umbrales de licencia comercial separada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de audio Qwen3-ASR (24 capas, anchura 1024, anchura proyectada 2048) + decodificador LM causal (28 capas, 16 cabezas de consulta, 8 cabezas KV, anchura de cabeza 128) |
| Parametros totales | No disponible de forma exacta; el modelo base deriva de Qwen3-ASR-1.7B (aproximadamente 1,7 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible como contexto de texto; en audio, fragmentos en streaming de 80 a 2000 ms (320 ms recomendado por defecto) |
| Tipos de cuantizacion | Q4_K_M con receta asimetrica por tensor: torre de audio en BF16/Q4_K (proyecciones sensibles en BF16), proyecciones de atencion en Q4_K, gate/up del MLP en Q4_K, down del MLP en Q6_K (suelo duro) y embeddings en Q2_K. Referencia Q8_0 de 2,478 GB |
| Idiomas soportados | 30: chino (zh), ingles (en), cantones (yue), arabe (ar), aleman (de), frances (fr), espanol (es), portugues (pt), indonesio (id), italiano (it), coreano (ko), ruso (ru), thai (th), vietnamita (vi), japones (ja), turco (tr), hindi (hi), malayo (ms), neerlandes (nl), sueco (sv), danes (da), finlandes (fi), polaco (pl), checo (cs), filipino (fil), persa (fa), griego (el), hungaro (hu), macedonio (mk) y rumano (ro) |
| Licencia | netease-model-use-license (NetEase Youdao Model Use License Agreement); el codigo fuente original es Apache-2.0, los pesos no |
| Formato de pesos | GGUF (tambien safetensors en el modelo original, no confirmado en la informacion disponible) |
| Tamano del fichero | 1,187 GB (1.186.939.968 bytes); tamano del repositorio 1,2 GB |
| Libreria de ejecucion | transcribe.cpp (tambien audio.cpp) |
| Pipeline declarado | automatic-speech-recognition |
| Fecha de publicacion | 24 de septiembre de 2026 (segun metadatos del repositorio) |
| Descargas / likes | 15 descargas, 1 like |

## Arquitectura y entrenamiento

La arquitectura es un sistema hibrido de dos torres para ASR: un encoder de audio basado en Qwen3-ASR, con 24 capas y anchura de 1024 que se proyecta a 2048 dimensiones, y un decodificador de lenguaje causal de 28 capas con atencion de consultas agrupadas (16 cabezas de consulta frente a 8 cabezas KV, con anchura de cabeza de 128). El modelo original Confucius4-R2T2 se obtiene por ajuste fino de Qwen3-ASR-1.7B e incorpora decodificacion de prefijo estable mas largo, una estrategia pensada para entornos de streaming en los que la salida se construye de forma incremental y append-only, minimizando la reescritura de tokens ya emitidos.

Sobre los datos de entrenamiento (numero de tokens, composicion del corpus, uso de RLHF o DPO) no se proporciona informacion en la documentacion disponible: la model card del autor de la cuantizacion se centra en el proceso de cuantizacion, no en el entrenamiento del modelo base. La innovacion tecnica documentada en este repositorio es precisamente la receta de cuantizacion asimetrica por tensor, que combina Q4_K en la mayor parte de los bloques con un suelo de Q6_K en las proyecciones down del MLP (que escriben en el flujo residual y son las mas sensibles a la perdida de precision) y Q2_K en la tabla de embeddings (311 millones de parametros, cuyo error de busqueda no se propaga de forma acumulativa). Las proyecciones sensibles de la torre de audio se conservan en BF16.

## Capacidades

- Transcripcion de voz a texto multilingue en 30 idiomas, con rendimiento declarado como optimizado para chino e ingles.
- Streaming en tiempo real con chunking configurable de 80 a 2000 ms (320 ms por defecto), con decodificacion append-only de prefijo estable mas largo.
- Transcripcion offline de ficheros de audio (entrada de referencia de 16 kHz, por ejemplo `speech_16k.wav`).
- Ejecucion nativa en CPU y en backend Metal (Apple Silicon) a traves de transcribe.cpp y audio.cpp.
- Servidor con API compatible con OpenAI para transcripcion (`POST /v1/audio/transcriptions`), incluyendo modo streaming con `stream=true` y respuesta incremental sin buffering.
- Estabilidad multilingue declarada tras la cuantizacion, verificada segun el autor en ingles, chino, aleman y frances, evitando la deriva de idioma observada en cuantizaciones uniformes de 4 bits.
- Tool calling / function calling: no soportado; es un modelo ASR, no un modelo de lenguaje conversacional.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades de vision o de traduccion directa de voz: no disponibles en la informacion proporcionada; la salida es texto transcrito en el idioma de origen.

## Casos de uso

- Subtitulado en directo para retransmisiones y eventos: el modo streaming con fragmentos de 320 ms y la salida append-only permiten emitir subtitulos incrementales sin reescribir lineas ya mostradas, algo critico para televison en directo o webinars.
- Actas y transcripcion de reuniones: el modelo puede procesar audio de 16 kHz de forma offline y generar el texto completo; su tamano de 1,187 GB permite ejecutarlo en la propia maquina del usuario sin enviar audio a servicios externos, lo que simplifica el cumplimiento de RGPD.
- Analitica de centros de contacto: transcripcion de llamadas multilingues (espanol, portugues, italiano, aleman, frances) para alimentar pipelines de analisis de sentimiento, deteccion de temas o control de calidad, partiendo del texto generado por el modelo.
- Asistentes de voz y dictado en aplicaciones de escritorio: al ejecutarse en CPU y en Metal, puede integrarse como componente local de una aplicacion sin GPU dedicada, con latencia controlada por el tamano de chunk elegido.
- Accesibilidad: generacion de subtitulos en vivo para personas con discapacidad auditiva en videoconferencias o aulas, con la ventaja de funcionar sin conexion y sin coste por minuto de API.
- Documentacion clinica o legal dictada: transcripcion de notas de voz a texto como paso previo a su revision humana, evitando el envio de datos sensibles a terceros al ser un modelo ejecutable localmente.
- Preprocesado para pipelines de traduccion automatica: la transcripcion en el idioma original (30 idiomas soportados) puede encadenarse con un modelo de traduccion o un LLM para generar subtitulos multilingues o resumenes.
- Indexacion y busqueda de archivos de audio: transcripcion por lotes de un repositorio de grabaciones y volcado a un indice de texto para busqueda semantica o recuperacion documental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de WER (word error rate), CER ni comparaciones numericas frente a otros modelos; unicamente afirmaciones cualitativas:

| Afirmacion documentada | Detalle |
|---|---|
| Reduccion de tamano | 1,187 GB frente a 2,478 GB de la referencia Q8_0 (52 % menos) |
| Estabilidad multilingue | Preservada segun el autor, verificada en ingles, chino, aleman y frances |
| Velocidad | Mas rapido que Q8_0 en CPU, evitando las rutas no vectorizadas de Q5_K |
| Suelo de precision | Q5_K y cuantizaciones uniformes de 4 bits descartadas por salidas vacias o deriva de idioma |
| Informe completo | El autor remite a QUANTIZATION.md, con estudio de ablacion sobre mas de 20 configuraciones de cuantizacion, tablas empiricas, analisis de modos de fallo y benchmarks de velocidad |

## Requisitos de hardware

- VRAM/RAM estimada: los pesos ocupan 1,187 GB en disco; en ejecucion hay que sumar buffer de audio, cache KV y overhead del runtime, por lo que una estimacion razonable se situa en 2-3 GB de memoria (estimacion propia, no confirmada en la informacion proporcionada).
- GPU de consumo: cabe sobradamente en cualquier GPU con 4 GB o mas de VRAM (por ejemplo RTX 3050, RTX 4060, RTX 4090); no se documentan requisitos minimos oficiales.
- Ejecucion en CPU: confirmada y declarada como mas rapida que la variante Q8_0, al evitar las rutas no vectorizadas de Q5_K.
- Apple Silicon: backend Metal confirmado en los ejemplos de uso de audiocpp_cli.
- Backends de aceleracion adicionales (CUDA, ROCm, Vulkan): no disponibles en la informacion proporcionada.
- Opciones de despliegue: transcribe-cli (`transcribe-cli -m r2t2-q4_k_m.gguf samples/audio.wav`), audiocpp_cli (modo offline y modo streaming con `--session-option confucius4_r2t2.chunk_size_ms=320`) y servidor con endpoint compatible con OpenAI en `/v1/audio/transcriptions`.
- Latencia y throughput: no se publican cifras. La latencia queda determinada por el tamano de fragmento configurable entre 80 y 2000 ms, con 320 ms como valor recomendado.
- Tareas compatibles: `--task asr --family confucius4_r2t2`, entrada de audio a 16 kHz.

## Comparativa con modelos similares

| Modelo | Parametros | Formato y tamano | Idiomas | Licencia | Naturaleza |
|---|---|---|---|---|---|
| Nairod785/Confucius4-R2T2-Q4_K_M-GGUF (este) | Base derivado de Qwen3-ASR-1.7B | GGUF Q4_K_M, 1,187 GB | 30 | NetEase Youdao Model Use License | Cuantizacion comunitaria del modelo ASR |
| netease-youdao/Confucius4-R2T2 (original) | Base derivado de Qwen3-ASR-1.7B | No disponible | 30 | Pesos: NetEase Youdao Model Use License; codigo: Apache-2.0 | Modelo ASR original de NetEase Youdao |
| davidxifeng/Confucius4-R2T2-gguf | Base derivado de Qwen3-ASR-1.7B | GGUF Q8_0 o superior (referencia de 2,478 GB) | 30 | No disponible | Repositorio GGUF de referencia e inspiracion |
| OpenAI Whisper (familia whisper.cpp) | No disponible en la informacion proporcionada | GGUF | Mas de 90 idiomas segun documentacion publica del proyecto | MIT (proyecto whisper.cpp) | Familia ASR alternativa ampliamente desplegada, sin modo streaming append-only nativo equivalente declarado |

Nota: los datos de la fila de Whisper no provienen de la informacion proporcionada en esta busqueda; se incluyen unicamente como referencia de categoria y deben verificarse en la documentacion oficial del proyecto antes de usarse en una decision tecnica. No se dispone de comparaciones de WER entre estas opciones en la informacion disponible.

## Limitaciones y advertencias

- Riesgo de salidas vacias o deriva de idioma: el propio autor documenta que cuantizaciones uniformes de 4 y 5 bits producian "cliffs" de salida vacia y cambios silenciosos de idioma; esta receta Q4_K_M los evita segun sus pruebas, pero es una validacion limitada a cuatro idiomas (ingles, chino, aleman y frances) y no cubre los 30 declarados.
- Repositorio con muy poca validacion externa: 15 descargas y 1 like en el momento de la consulta, con publicacion el 24 de septiembre de 2026, lo que implica escasa evidencia de la comunidad sobre su comportamiento en produccion.
- Licencia restrictiva: los pesos se distribuyen bajo la NetEase Youdao Model Use License, no Apache-2.0 (el codigo fuente del modelo original si es Apache-2.0). Se exige una licencia comercial separada por encima de 100 millones de usuarios activos mensuales o 1.000 millones de RMB de ingresos anuales (seccion 2.2), y el modelo no puede utilizarse para mejorar otros modelos (texto truncado en la documentacion citada).
- Clausula de exencion de responsabilidad del titular original: la licencia (seccion 4.1(a)) establece que las modificaciones introducidas en esta obra derivada no estan respaldadas ni garantizadas por el titular de los derechos del modelo original, que declina toda responsabilidad sobre ella.
- Obra derivada comunitaria: el README de la cuantizacion no esta respaldado por NetEase Youdao; cualquier incidencia debe atribuirse al autor de la cuantizacion, no al modelo original.
- Alucinacion y errores de transcripcion: no se publican cifras de WER, por lo que no es posible cuantificar la tasa de error ni en audio limpio ni en condiciones adversas (ruido, acentos, solapamiento de hablantes).
- Sin diarizacion ni marcas de hablante: no se documenta identificacion de interlocutores, puntuacion automatica ni marcas de tiempo, imprescindibles en algunos flujos de subtitulado o de actas.
- Ambito funcional limitado: es un modelo ASR; no soporta tool calling, agentes ni razonamiento multi-paso.
- Dependencia de herramientas: la ejecucion requiere transcribe.cpp o audio.cpp; la disponibilidad fuera de estos runtimes (por ejemplo, soporte equivalente en llama.cpp u Ollama) no esta documentada.
- Idiomas declarados sin evaluacion publica: la lista de 30 idiomas proviene de los metadatos del modelo base, sin resultados de calidad por idioma para esta cuantizacion concreta.
- Sin resultados de benchmarks: cualquier afirmacion de rendimiento relativo frente a otros modelos ASR carece de respaldo numerico en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nairod785/Confucius4-R2T2-Q4_K_M-GGUF
- Modelo base original: https://huggingface.co/netease-youdao/Confucius4-R2T2
- Codigo fuente del modelo original: https://github.com/netease-youdao/Confucius4-R2T2
- Licencia del modelo original: https://github.com/netease-youdao/Confucius4-R2T2/blob/master/MODEL_LICENSE
- Demo del modelo original: https://r2t2.youdao.com/demo
- Repositorio GGUF de referencia e inspiracion: https://huggingface.co/davidxifeng/Confucius4-R2T2-gguf
- Repositorio de transcribe.cpp: https://github.com/NairoDorian/transcribe.cpp
- Repositorio de audio.cpp: https://github.com/0xShug0/audio.cpp
- Informe de cuantizacion del autor: fichero QUANTIZATION.md dentro del repositorio de HuggingFace
- Aviso de atribucion y obras derivadas: fichero NOTICE dentro del repositorio de HuggingFace
- Nota sobre la busqueda web: los resultados obtenidos no guardan relacion con este modelo (perfiles profesionales de redaccion web) y no se han incluido por no ser fuentes relevantes ni verificables para esta ficha.
