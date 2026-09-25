# Ar4ikov/VibeVoice-ASR-Streaming-7B-DFlash2-Drafter-AWQ-W4A16-ASYM

## Resumen

Este repositorio contiene un **drafter de decodificacion especulativa** para el modelo de reconocimiento de voz `VibeVoice-ASR-Streaming-7B`, desarrollado por el usuario Ar4ikov sobre la arquitectura **DFlash 2**. No es un modelo de ASR autonomo: es un modelo auxiliar de 831.577.344 parametros (~831 M) que propone bloques de 8 tokens de una sola pasada, que el modelo principal verifica despues en una unica pasada adicional. Su funcion es reducir el numero de pasos de decodificacion necesarios para producir una transcripcion, sin alterar el resultado.

La innovacion principal es que la comprobacion es **exacta**: cada fila verificada se calcula con la misma aritmetica que el paso de decodificacion de un solo token del modelo principal, de modo que la transcripcion obtenida con el drafter es identica byte a byte a la que se obtendria sin el (incluidos texto, marcas de tiempo e identificadores de hablante). Segun la model card, el drafter solo cambia cuantos pasos hacen falta, no el contenido.

Este checkpoint concreto es la variante cuantizada a **INT4 (AWQ, W4A16 asimetrica, grupos de 128)** del drafter en BF16 del mismo autor, y ocupa 0,55 GB. En la medicion publicada, sobre 20 clips reservados y una RTX 3090, pasa de 149 a 364 tokens por segundo en decodificacion, un **speedup de 2,44x**, con transcripcion identica en 20 de 20 casos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash 2: drafter de bloques de decodificacion especulativa, 5 capas de estilo Qwen3 (hidden 3584, 28/4 cabezas, intermedio 9472), bloque 8 |
| Parametros totales | 831.577.344 (~831 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | AWQ INT4 W4A16 asimetrica, grupos de 128, almacenada como `compressed-tensors` (`pack-quantized`); el runtime puede mantener el drafter en `int4` o `f16` |
| Idiomas soportados | No declarados en los metadatos de HuggingFace; el corpus de entrenamiento incluye FLEURS (8 idiomas). El modelo base declara 10 idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors y `compressed-tensors` (codigos INT4) |

## Arquitectura y entrenamiento

El drafter sigue la arquitectura **DFlash 2** y consta de 5 capas de estilo Qwen3 con hidden 3584, 28 cabezas de consulta y 4 de clave/valor, e intermedio 9472, con un bloque de 8 tokens. La pieza distintiva es la **inyeccion de KV**: para cada posicion que el modelo principal ya ha procesado, se concatenan las salidas de sus capas 1, 7, 13, 19 y 25, se proyectan mediante una capa `fc` y se normalizan; cada capa del drafter las convierte en claves y valores. De este modo el drafter lee la representacion interna que el propio modelo tiene del audio y de la transcripcion generada hasta ese momento. Ademas incorpora una **convolucion dinamica de dos tomas** alrededor de la atencion y el MLP (kernels por fila predichos a partir de la fila) y un **selector de candidatos** que reordena el top 16 por fila de la cabeza del modelo con un termino de predecesor/sucesor por pares (rango 256). El embedding y la LM head son los del modelo principal, congelados, y el drafter puntua un **vocabulario de borrador** de 32768 ids (`draft_vocab`): los presentes en sus transcripciones de entrenamiento mas todos los ids de parada.

El entrenamiento es **auto-destilacion**: el drafter aprende a imitar lo que escribe este modelo concreto, marcas de tiempo e ids de hablante incluidos, mediante el pipeline `tools/dflash` de vibevoice.c. Se usaron aproximadamente 140 horas de audio, con 2872 clips de entrenamiento y 43 reservados, procedentes de LibriSpeech, FLEURS (8 idiomas), SOVA, AMI, llamadas de resultados financieros y VoxConverse; solo el audio, nunca el texto de esos conjuntos de datos. Los pasos son: generar las transcripciones greedy del propio modelo, extraer trazas (token, rol y salidas de las cinco capas muestreadas por posicion) y entrenar con `train.py` en PyTorch con flex attention, anclando en las posiciones generadas y puntuando las filas 1..7 contra los siguientes 7 tokens con pesos e^(-k/4), con entropia cruzada de la cabeza y del selector, AdamW, schedule coseno y BF16. Finalmente, `awq_drafter.py` calcula escalas activation-aware donde se pliegan sin modificar el drafter (entrada del MLP, up → down, v → o por canal de KV) y aplica una busqueda de recorte en cada proyeccion; los codigos INT4 se guardan como `compressed-tensors`.

## Capacidades

- **Generacion de borradores de tokens para decodificacion especulativa**: propone 8 tokens en una sola pasada, que el modelo principal verifica en una pasada adicional.
- **Preservacion exacta de la transcripcion**: con el modo de comprobacion `exact` (por defecto), el resultado es identico byte a byte al de la decodificacion sin drafter, incluyendo palabras, marcas de tiempo e identificadores de hablante.
- **Aceleracion de la decodificacion**: 2,44x de speedup medido en RTX 3090 (149 → 364 tokens/s) y 3,511 tokens aceptados por bloque de 8 sobre las trazas de 43 clips reservados (3,518 en BF16).
- **Reutilizacion sobre cualquier checkpoint del mismo modelo**: funciona con cualquier `VibeVoice-ASR-Streaming-7B` de la misma familia, ya que solo lee estados ocultos, embedding y LM head del modelo principal.
- **Streaming**: compatible con sesiones en tiempo real (WebSocket, SSE) a traves de `vv_cli serve --slots`.
- **No incluye capacidades propias de ASR**: no transcribe por si mismo, no hace tool calling, no soporta agentes ni vision. La atribucion de hablante y el multilingueismo son capacidades del modelo principal que el drafter acelera.

## Casos de uso

- **Subtitulado en directo de baja latencia**: el modelo base emite texto por cada 2,93 s de audio con 0,53 s de lookahead; el drafter multiplica por 2,44 la velocidad de decodificacion, lo que reduce el tiempo entre el habla y la aparicion del subtitulo en retransmisiones o eventos en vivo.
- **Transcripcion en tiempo real de atencion al cliente**: con `vv_cli serve --slots 4` se pueden mantener varias sesiones de streaming (WebSocket o SSE) en una misma GPU, con texto atribuido a cada hablante segun se produce la conversacion.
- **Actas de reuniones con diarizacion integrada**: el modelo base produce "quien dijo que" en una sola pasada sin etapa separada de diarizacion; el drafter acelera esa generacion sobre grabaciones de AMI o reuniones corporativas, que forman parte del corpus de entrenamiento.
- **Transcripcion de llamadas de resultados financieros**: el corpus de entrenamiento incluye earnings calls, por lo que el drafter mantiene una tasa de aceptacion alta en este dominio y reduce el tiempo de proceso de audios largos por lotes con multiples hablantes.
- **Despliegue local en GPU de consumo**: el conjunto (modelo base AWQ INT4 mas drafter de 0,55 GB) se ejecuta en una RTX 3090, lo que permite transcripcion con diarizacion en una estacion de trabajo sin clúster.
- **Procesamiento por lotes de archivos de audio archivados**: al no alterar la transcripcion, es adecuado para regenerar o indexar grandes volumenes de audio manteniendo la coherencia con transcripciones previas generadas sin drafter.
- **Investigacion en decodificacion especulativa**: sirve como referencia reproducible para medir aceptacion de borradores, impacto de la cuantizacion INT4 del drafter y comportamiento de la inyeccion de KV sobre un modelo de ASR con cabezas multiples.

## Benchmarks y rendimiento

Los unicos datos publicados son de velocidad de decodificacion, medidos con vibevoice.c `b72be15` (rama `dflash2`), en una RTX 3090, con `VibeVoice-ASR-Streaming-7B-AWQ-W4A16-ASYM` y decodificacion greedy, sobre 20 clips reservados y 8 filas:

| Configuracion | Tokens/s | Speedup | Tokens por bloque | Transcripcion identica |
|---|---|---|---|---|
| Sin drafter (plain) | 149 | 1,00x | No aplica | No aplica |
| Con este drafter (INT4) | 364 | 2,44x | 3,57 | 20/20 |

Adicionalmente, sobre las trazas de 43 clips reservados, el drafter INT4 acepta 3,511 tokens por bloque de 8, frente a 3,518 del checkpoint BF16. No se han publicado resultados de benchmarks de calidad de transcripcion (WER, DER, MMLU u otros) en la informacion disponible.

## Requisitos de hardware

- **Drafter**: 0,55 GB en INT4 (dato de la model card). El checkpoint BF16 equivalente no se cuantifica; a partir del recuento de parametros publicado (831.577.344), su peso en BF16 seria de aproximadamente 1,66 GB, aunque este dato no aparece explicito en la informacion disponible.
- **Modelo principal**: es obligatorio; el drafter no funciona de forma autonoma. El modelo base cuantizado AWQ W4A16 es un modelo de 7B, por lo que hay que sumar su peso y la cache KV a la VRAM total (el consumo exacto no se indica en la informacion disponible).
- **GPU de referencia**: RTX 3090 (24 GB), donde se midieron los 364 tokens/s.
- **Compatibilidad**: solo CUDA. La ruta de CPU y la decodificacion en Metal funcionan sin el drafter.
- **Opciones de despliegue**: exclusivamente vibevoice.c, rama `dflash2` (PR #48), con `vv_cli --model ... --draft ...` para uso puntual o `vv_cli serve --model ... --draft ... --slots N` para sesiones en streaming. No hay soporte de vLLM, llama.cpp, Ollama ni TGI documentado.
- **Throughput**: 364 tokens/s con drafter frente a 149 tokens/s sin el, sobre 20 clips, en la configuracion indicada. Los audios con pocos borradores aceptados vuelven a velocidad cercana a la plana.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano | Tokens aceptados por bloque | Licencia | Uso |
|---|---|---|---|---|---|
| Este checkpoint (drafter INT4) | 831.577.344 | 0,55 GB | 3,511 (43 clips) | MIT | vibevoice.c, rama `dflash2` |
| Ar4ikov/VibeVoice-ASR-Streaming-7B-DFlash2-Drafter (BF16) | 831.577.344 | No indicado (BF16 sin cuantizar) | 3,518 (43 clips) | MIT | vibevoice.c, rama `dflash2` |
| Sin drafter (decodificacion plana) | No aplica | No aplica | No aplica | MIT (modelo base) | vibevoice.c |

No se dispone de datos en la informacion proporcionada para comparar con otras familias de drafters de decodificacion especulativa (EAGLE, Medusa u otros).

## Limitaciones y advertencias

- **Dependencia exclusiva de vibevoice.c**: el checkpoint conserva los nombres publicados de DFlash 2, pero la inyeccion de KV, el selector y el vocabulario de borrador funcionan tal como los implementa vibevoice.c. Requiere la rama `dflash2` (PR #48) o una version posterior.
- **Solo CUDA y solo decodificacion greedy**: la ruta de CPU y la decodificacion en Metal no usan el drafter, y no hay soporte para muestreo no greedy.
- **Cobertura linguistica desigual**: el audio poco representado en el corpus (mandarin, ruso) produce menos borradores aceptados; el runtime cae entonces a pasos planos y la velocidad se aproxima a la de decodificacion normal.
- **No es un modelo autonomo**: no genera transcripciones por si mismo y no puede evaluarse de forma aislada del modelo principal.
- **Vocabulario de borrador restringido**: los borradores se limitan a 32768 ids mas los ids de parada, definidos por las transcripciones de entrenamiento.
- **Cuantizacion**: la variante INT4 conserva la transcripcion exacta pero reduce ligeramente la tasa de aceptacion (3,511 frente a 3,518 tokens por bloque) respecto al drafter BF16.
- **Sesgos**: no se documentan sesgos especificos del drafter en la informacion disponible. Al heredar el comportamiento del modelo base y entrenarse solo con su salida greedy, reproduce los sesgos de aquel.
- **Alucinacion**: al ser una comprobacion exacta contra el modelo principal, el drafter no introduce contenido nuevo en la transcripcion; el riesgo de alucinacion es el del modelo base.
- **Madurez**: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion independiente de la comunidad.
- **Licencia**: MIT, sin restricciones de uso comercial declaradas, igual que VibeVoice.

## Enlaces

- HuggingFace del drafter INT4: https://huggingface.co/Ar4ikov/VibeVoice-ASR-Streaming-7B-DFlash2-Drafter-AWQ-W4A16-ASYM
- Drafter en BF16 del mismo autor: https://huggingface.co/Ar4ikov/VibeVoice-ASR-Streaming-7B-DFlash2-Drafter
- Modelo base cuantizado: https://huggingface.co/Ar4ikov/VibeVoice-ASR-Streaming-7B-AWQ-W4A16-ASYM
- Paquete conjunto modelo mas drafter: https://huggingface.co/Ar4ikov/VibeVoice-ASR-Streaming-7B-AWQ-W4A16-ASYM-DFlash2
- Modelo original de Microsoft: https://huggingface.co/microsoft/VibeVoice-ASR-Streaming-7B
- Modelo VibeVoice-ASR-Streaming-7B (organizacion vibevoice): https://huggingface.co/vibevoice/VibeVoice-ASR-Streaming-7B
- Repositorio vibevoice.c: https://github.com/Ar4ikov/vibevoice.c
- Pull request con el soporte de DFlash 2: https://github.com/Ar4ikov/vibevoice.c/pull/48
- Documentacion de DFlash en vibevoice.c: `docs/DFLASH.md` (dentro del repositorio)
- Blog de DFlash 2: https://inco.ai/blog/dflash2/
- Informe tecnico de VibeVoice-ASR-Streaming (arXiv): https://arxiv.org/html/2609.02812v1
- PDF del informe tecnico: https://arxiv.org/pdf/2609.02812
- Documentacion de VibeVoice-ASR-Streaming en GitHub: https://github.com/microsoft/VibeVoice/blob/main/docs/vibevoice-asr-streaming.md
