# Ar4ikov/VibeVoice-ASR-Streaming-7B-AWQ-W4A16-ASYM-DFlash2

## Resumen

VibeVoice-ASR-Streaming-7B-AWQ-W4A16-ASYM-DFlash2 es una distribucion empaquetada de un modelo de reconocimiento automatico del habla (ASR) en streaming, publicada por el usuario Ar4ikov. No introduce pesos nuevos: reune en un unico repositorio la cuantizacion AWQ W4A16 asimetrica del modelo microsoft/VibeVoice-ASR-Streaming-7B (a su vez derivada de la revision `60d858b5` del modelo original) junto con su borrador (*drafter*) DFlash 2, lo que permite decodificacion especulativa con una sola descarga.

El modelo base resuelve la transcripcion atribuida por hablante ("quien dijo que") de forma end-to-end, escribiendo texto a medida que llega el audio en lugar de esperar al final de la locucion. Segun la documentacion de Microsoft, emite texto por cada 2,93 s de audio con 0,53 s de prelacion (*lookahead*) y cubre 10 idiomas, con soporte de palabras clave personalizadas (*hotwords*).

La relevancia de esta ficha concreta esta en el empaquetado de inferencia: el borrador DFlash 2 anade 0,55 GB y acelera la decodificacion de 149 a 364 tokens/s en una RTX 3090 (2,44x) manteniendo la transcripcion identica byte a byte, porque la verificacion especulativa reutiliza exactamente la aritmetica del paso de decodificacion del modelo. Requiere la rama `dflash2` de vibevoice.c (PR #48). Licencia MIT. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo ASR end-to-end basado en LLM autorregresivo (detalle de capas del modelo principal no disponible); el drafter usa 5 capas estilo Qwen3 que leen las capas 1/7/13/19/25 del modelo |
| Parametros totales | 8.330.325.888 (8,33 mil millones) segun safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ W4A16 asimetrica con grupos de 128 (modelo principal); INT4 `pack-quantized` de compressed-tensors (proyecciones del drafter) |
| Idiomas soportados | 10 idiomas (el modelo base no lista los identificadores en la informacion disponible); el campo de idiomas del repositorio figura como no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors), libreria `vibevoice.c` |
| Tamano del repositorio | 7,5 GB (7,01 GB modelo + 0,55 GB drafter) |
| Modelo base | Ar4ikov/VibeVoice-ASR-Streaming-7B-AWQ-W4A16-ASYM (revision `1cc2b627`) |
| Modelo original | microsoft/VibeVoice-ASR-Streaming-7B (revision `60d858b5`) |
| Tarea (pipeline) | automatic-speech-recognition |

## Arquitectura y entrenamiento

El modelo principal es la version cuantizada con AWQ W4A16 asimetrica (grupos de 128) de VibeVoice-ASR-Streaming-7B, una arquitectura basada en LLM que intercala trozos de audio de tamano fijo, una cantidad reducida de audio de prelacion y el texto previamente generado. De este modo produce "quien dijo que" en una sola pasada autorregresiva, sin una etapa separada de diarizacion. Segun el informe tecnico, cada trozo de audio corresponde a 2,93 s de senal y se procesa con 0,53 s de prelacion; en sesiones de streaming el chunk se compone de 22 + 4 tramas. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO en la informacion proporcionada. Los pesos del modelo principal se incorporan sin cambios respecto a la revision `1cc2b627`.

La innovacion de este repositorio es la integracion del drafter DFlash 2, un modulo de 0,55 GB con 5 capas estilo Qwen3 que leen las activaciones de las capas 1/7/13/19/25 del modelo, un selector de candidatos y un vocabulario de borrador de 32.768 identificadores. El drafter propone 8 tokens en una pasada y el modelo los verifica en otra, conservando solo los que acepta. La verificacion es exacta: cada fila comprobada se calcula con la aritmetica del propio paso de decodificacion del modelo, de modo que la transcripcion resultante es identica byte a byte a la de la decodificacion sin borrador. Sus proyecciones se almacenan en INT4 con el esquema `pack-quantized` de compressed-tensors. El detalle de entrenamiento del drafter no esta disponible en esta ficha (se remite a la model card del propio drafter).

## Capacidades

- Reconocimiento automatico del habla en streaming: emite texto mientras el audio sigue llegando, en lugar de esperar al final del turno.
- Transcripcion con atribucion de hablante ("who said what") en una sola pasada, sin etapa separada de diarizacion.
- Soporte de palabras clave personalizadas (*hotwords*) para sesgar el reconocimiento hacia terminos concretos (por ejemplo `--context_info "Microsoft,VibeVoice"`).
- Cobertura multilingue de 10 idiomas, segun la documentacion del modelo base.
- Decodificacion especulativa con DFlash 2: propuesta de 8 tokens por pasada y verificacion exacta, con salida identica a la decodificacion plana.
- Servicio en modo servidor con sesiones de streaming y transporte WebSocket y SSE (`vv_cli serve --slots 4`).
- Modo de decodificacion plana conmutable (`--draft none`) para comparar o prescindir del drafter.
- No se documentan en la informacion disponible capacidades de vision, audio-visual, tool calling ni razonamiento multi-paso.

## Casos de uso

- Transcripcion de reuniones en directo: el modelo genera texto cada 2,93 s de audio con 0,53 s de prelacion, por lo que el acta se construye mientras se habla y cada intervencion queda etiquetada con su hablante sin post-procesado de diarizacion.
- Subtitulado en vivo para emisiones o webinars: la salida incremental por chunks encaja con un pipeline que reenvia texto a un sistema de subtitulos, y el modo servidor con WebSocket o SSE permite empujar los segmentos a los clientes.
- Atencion al cliente con grabaciones largas: la atribucion de hablante integrada permite separar agente y cliente en la misma pasada, util para auditoria de calidad y analitica de conversacion.
- Dictado y documentacion clinica o legal: las palabras clave personalizadas sesgan el reconocimiento hacia terminologia especializada, nombres propios o codigos internos que un ASR generico suele errar.
- Despliegue en produccion con latencia ajustada: en una RTX 3090 la decodificacion con drafter alcanza 364 tokens/s frente a 149 tokens/s en modo plano (2,44x), lo que reduce el coste por hora de audio procesada en un servidor con GPU de gama alta de generacion anterior.
- Transcripcion por lotes de archivos ya grabados: se puede usar `--draft none` para simplificar el stack o mantener el drafter empaquetado, aprovechando que el resultado es identico byte a byte y por tanto intercambiable entre ambos modos.
- Investigacion en ASR en streaming: al ser MIT y estar disponible en un runtime C propio (`vibevoice.c`), sirve como base para experimentos de decodificacion especulativa, politicas de chunk y evaluacion de WER con o sin borrador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (WER, MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible. La model card del modelo base menciona que contiene el WER, pero su valor no se incluye en los datos proporcionados. El unico dato cuantitativo publicado es de velocidad de decodificacion:

| Medicion | Modo plano | Con drafter | Aceleracion | Tokens por bloque | Transcripcion identica |
|---|---|---|---|---|---|
| 20 clips reservados, 8 filas (RTX 3090, greedy, vibevoice.c `b72be15`, rama `dflash2`) | 149 tok/s | 364 tok/s | 2,44x | 3,57 | 20/20 |

Las condiciones declaradas son: sesiones de streaming con 22 + 4 tramas por chunk, modo plano ejecutado como el mismo modelo con `--draft none`, y verificacion con `--draft-check exact`.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 7,5 GB solo de pesos (7,01 GB del modelo AWQ W4A16 mas 0,55 GB del drafter). Sumando cache KV y activaciones del runtime, un presupuesto practico de 10-12 GB de VRAM es razonable; la cifra exacta no esta publicada y debe considerarse una estimacion.
- GPU validadas: el autor reporta mediciones en RTX 3090 (24 GB).
- GPU recomendadas: cualquier GPU con 12 GB o mas deberia ser suficiente para el modelo y el drafter; una RTX 4090, L4, L40S, A100 o H100 ofrecen margen holgado. En GPUs de 8 GB el encaje es ajustado y no esta verificado.
- Cabe en GPU de consumo: si, segun las mediciones en RTX 3090; es previsible en RTX 4080/4090 y en tarjetas de 12 GB o mas, aunque no hay pruebas publicadas para estas.
- Opciones de despliegue: el repositorio esta pensado para `vibevoice.c` (CLI y servidor). Requiere la rama `dflash2` o la release que incluya el PR #48. El modelo usa compressed-tensors, por lo que tambien seria compatible con runtimes que soporten ese formato, aunque no se documenta soporte en vLLM, TGI, llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: 364 tok/s con drafter y 149 tok/s en plano, decodificacion greedy en RTX 3090; equivalen a una aceleracion de 2,44x con una media de 3,57 tokens aceptados por bloque de verificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Streaming con atribucion de hablante | Decodificacion especulativa | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| VibeVoice-ASR-Streaming-7B-AWQ-W4A16-ASYM-DFlash2 (este) | 8,33 mil millones | no disponible | si, integrada en una pasada; 2,93 s de audio por emision, 0,53 s de prelacion | si, drafter DFlash 2 incluido (2,44x en RTX 3090) | MIT | safetensors + `vibevoice.c` |
| Ar4ikov/VibeVoice-ASR-Streaming-7B-AWQ-W4A16-ASYM (padre) | 8,33 mil millones | no disponible | si, mismas caracteristicas | no (sin drafter) | MIT | safetensors |
| microsoft/VibeVoice-ASR-Streaming-7B (original) | 8,33 mil millones (aprox.) | no disponible | si | no documentada | MIT | pesos completos |
| Whisper large-v3 | 1.550 millones | 30 s por ventana | no (procesa por ventanas, sin diarizacion integrada) | no | MIT | amplia (transformers, whisper.cpp, vLLM) |

Los datos de rendimiento comparado (WER por idioma, latencia relativa) no estan disponibles en la informacion proporcionada; la comparativa se limita a parametros, licencia y caracteristicas funcionales. Alternativas habituales en ASR con diarizacion, como NVIDIA Canary o Parakeet, no se incluyen por carecer de datos verificados en esta consulta.

## Limitaciones y advertencias

- Rendimiento en calidad sin publicar: no hay cifras de WER para esta cuantizacion AWQ W4A16 en la informacion disponible, por lo que no se puede garantizar que la cuantizacion de 4 bits mantenga la precision del modelo original.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia. No hay validacion independiente de la comunidad.
- Dependencia de una rama no publicada: el uso del drafter exige la rama `dflash2` de vibevoice.c o la release que integre el PR #48; con versiones anteriores el directorio `drafter/` no se aprovecha.
- Ambito limitado a ASR: no se documentan capacidades de generacion de texto general, codigo, matematicas, vision ni tool calling. No debe tratarse como un LLM de proposito general.
- Idiomas sin listar: el modelo base declara 10 idiomas, pero en la informacion disponible no se identifican cuales; conviene verificar la cobertura antes de desplegar en un idioma concreto.
- Riesgo de alucinacion en ASR: como todo modelo autorregresivo con decodificacion guiada por texto previo, puede generar contenido plausible no presente en el audio, especialmente con ruido de fondo, solapamiento de voces o audio de baja calidad. No se documentan tasas de este fenomeno.
- Limites de contexto: la longitud de contexto no esta publicada, lo que dificulta planificar sesiones muy largas; el modelo esta disenado para emitir por chunks de 2,93 s, no para transcripciones de horas en una sola pasada.
- Atribucion de hablante sin garantias: la diarizacion integrada puede confundir hablantes con voces similares o en solapamientos, y no se publican metricas de error de diarizacion.
- Licencia permisiva, pero con capas: la licencia MIT corresponde al modelo VibeVoice subyacente; conviene revisar los terminos del modelo original de Microsoft y del drafter antes de un uso comercial.
- Hardware: la unica validacion publica es RTX 3090 y decodificacion greedy; el rendimiento con otras GPUs, precisiones o parametros de muestreo no esta medido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ar4ikov/VibeVoice-ASR-Streaming-7B-AWQ-W4A16-ASYM-DFlash2
- Modelo base cuantizado: https://huggingface.co/Ar4ikov/VibeVoice-ASR-Streaming-7B-AWQ-W4A16-ASYM
- Drafter DFlash 2: https://huggingface.co/Ar4ikov/VibeVoice-ASR-Streaming-7B-DFlash2-Drafter-AWQ-W4A16-ASYM
- Modelo original de Microsoft: https://huggingface.co/vibevoice/VibeVoice-ASR-Streaming-7B
- Repositorio vibevoice.c: https://github.com/Ar4ikov/vibevoice.c
- Pull request DFlash 2 (PR #48): https://github.com/Ar4ikov/vibevoice.c/pull/48
- Blog de DFlash 2: https://inco.ai/blog/dflash2/
- Documentacion de VibeVoice-ASR-Streaming: https://github.com/microsoft/VibeVoice/blob/main/docs/vibevoice-asr-streaming.md
- Informe tecnico en arXiv: https://arxiv.org/html/2609.02812v1
- Resumen del informe tecnico: https://papers.fzhiy.net/papers/2609-02812.html
