# MSA545/inkling-2-mini-uncen-fast-gguf

## Resumen

Inkling-2-Mini Uncensored — Fast 24GB VRAM Preset es un repositorio de cuantizacion GGUF publicado por el usuario MSA545 que empaqueta el modelo `Inkling-2-Mini-Uncensored-AD-Q4_K.gguf`, derivado a su vez de `thinkingmachines/Inkling-2-Mini` y cuantizado por AtomicChat. El modelo base es un Mixture of Experts (MoE) de 26.400 millones de parametros totales con 3.400 millones activos, arquitectura propietaria `inkling2_loop` (nucleo con bucles recurrentes) y una ventana de contexto nativa de 1.048.576 tokens (1M).

El problema que resuelve este repositorio concreto no es el del modelo en si, sino el del despliegue: en `llama.cpp` la memoria del buffer de computo CUDA escala linealmente con `n_ctx × ubatch`, de modo que una carga sin limites intenta reservar unos 99 GiB y provoca OOM inmediato. Este paquete incluye un preset de router (`inkling-2-mini-fast.ini`) que fija el contexto en 131.072 tokens, `ubatch-size = 128`, cache KV cuantizada en `q4_0`, Flash Attention y `cache-ram = 0`, manteniendo el consumo total de VRAM por debajo de ~21 GB en una RTX 4090.

Es relevante ahora porque demuestra como un MoE de 26B con contexto de 1M puede ejecutarse en una GPU de consumo de 24 GB sin degradar en exceso el throughput: segun el autor, sostiene 53-66 t/s de decodificacion incluso a 84K tokens de profundidad de contexto. La licencia es Apache 2.0, aunque la etiqueta `uncensored` implica que se ha eliminado el alineamiento de seguridad del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `inkling2_loop` (MoE con nucleo recurrente/bucleado) |
| Parametros totales | 26.070.385.152 (26,07B) |
| Parametros activos | 3,4B (segun model card) |
| Longitud de contexto | 1.048.576 tokens nativos; preset limitado a 131.072 tokens |
| Tipos de cuantizacion | GGUF `AD-Q4_K` (pesos ~15,4 GiB); cache KV `q4_0` o `q8_0` |
| Idiomas soportados | Ingles (segun model card; el campo de idiomas del repo no esta disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture of Experts con 26,07B parametros totales y 3,4B activos por token, sobre una arquitectura denominada `inkling2_loop` que incorpora un nucleo con bucles (looped core), es decir, capas que se aplican de forma iterativa sobre el estado oculto. Esta variante se integro en `llama.cpp` mediante el PR #32694, que anade soporte para el layout fusionado (`merged`) de dicha arquitectura.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de post-entrenamiento. El repositorio unicamente redistribuye pesos ya cuantizados y no documenta el proceso de entrenamiento. La etiqueta `uncensored` indica que la version de AtomicChat elimina o atenua las capas de rechazo del modelo original, pero no se detalla la metodologia aplicada (abliteration, fine-tuning con datos sin filtrar u otra). El paquete incluye `imatrix`, lo que sugiere que la cuantizacion se calibro con una matriz de importancia.

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte de plantilla Jinja (`--jinja`) para chat templates.
- Razonamiento y generacion de codigo, heredados del modelo base (no se detallan capacidades especificas en la informacion disponible).
- Contexto largo: hasta 1M tokens nativos, con 128K habilitados en el preset incluido.
- Capacidad de vision opcional: requiere descargar el proyector multimodal `mmproj-Inkling-2-Mini-Uncensored-F16.gguf` desde el repositorio de AtomicChat; este repo solo incluye pesos de texto.
- Modo sin censura: no aplica rechazos de contenido al estilo de los modelos alineados.
- Compatibilidad con endpoints (`endpoints_compatible`) y con el modo router de `llama.cpp` (`llama serve --models-preset`).
- No se documenta soporte explicito de tool calling, function calling ni razonamiento agentico multi-paso en la informacion disponible.

## Casos de uso

- Procesamiento de documentos extensos en local: con 128K tokens de contexto y ~21 GB de VRAM, permite analizar contratos, informes o bases de codigo completas en una unica pasada sobre una RTX 4090, sin enviar datos a la nube.
- Asistente conversacional sin filtros de contenido: util para investigacion sobre comportamiento de modelos, red teaming y evaluacion de sesgos, donde los rechazos del modelo alineado interferirian con el analisis.
- Generacion de codigo en entornos aislados: el formato GGUF y `llama.cpp` permiten desplegar el modelo en estaciones de trabajo sin conectividad, con el preset ya ajustado para evitar OOM.
- Resumen y extraccion de informacion en corpus largos: la ventana de 128K con decodificacion sostenida de ~54 t/s a 84K de profundidad hace viable resumir decenas de articulos o hilos de documentacion en una sola sesion.
- Prototipado rapido de aplicaciones LLM: el modo router de `llama.cpp` descarga el GGUF automaticamente al primer arranque y expone una API compatible con OpenAI en `127.0.0.1:9931`, lo que acelera la integracion en pipelines existentes.
- Analisis multimodal puntual: descargando el `mmproj` F16 aparte, se pueden procesar imagenes junto a texto para tareas de descripcion o extraccion de datos de capturas y diagramas.
- Evaluacion comparativa de cuantizaciones: el par de presets documentados (64K/`ubatch 256` frente a 128K/`ubatch 128`) sirve como referencia reproducible para medir el compromiso entre contexto, precision de KV y velocidad en GPUs de 24 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente reporta metricas de inferencia medidas en una RTX 4090 de 24 GB con `llama.cpp b12613` (CUDA 13.5), `ctx-size 131072`, `ubatch-size 128` y KV en `q4_0`:

| Profundidad de contexto | Decodificacion (t/s) | Prefill (t/s) | Notas |
|---|---|---|---|
| 0 – 1K | 62,3 – 66,3 | 484 | Slot recien creado |
| 71 – 72K | 56,1 – 56,3 | 549 (frio 70K) / 251 (delta caliente) | Pico `tg_3s` de 57,5 t/s |
| 76 – 78K | 53,5 – 53,8 | 339 – 342 (delta 1K–1,6K) | `graph reallocs = 0` |
| 83 – 84K | 54,2 – 54,7 | 201 – 260 (delta 290 tokens) | Generacion sostenida de 3,7K tokens |

El uso de RAM del host se mantiene estable en 1,5–2,5 GB con `--cache-ram 0` y `--ctx-checkpoints 8`.

## Requisitos de hardware

- VRAM estimada: ~15,4 GiB para los pesos en `AD-Q4_K`; el preset completo deja el total por debajo de ~21 GB con contexto de 128K, `ubatch 128` y KV `q4_0`.
- GPU recomendadas: RTX 4090 (24 GB, plataforma de referencia probada); cualquier GPU con 24 GB o mas (RTX 3090/4090, A10G 24 GB, L4 24 GB, A100 40/80 GB, H100).
- Configuracion alternativa: con contexto de 64K y `ubatch-size 256` el consumo baja a ~19,7 GiB incluso con KV en `q8_0`; con 128K y KV `q8_0` se queda en ~20,8 GiB.
- En GPUs de menos de 24 GB no cabe el preset completo; seria necesario reducir contexto, cuantizar mas los pesos o descargar capas a CPU (no documentado).
- Opciones de despliegue: `llama.cpp` build b12600 o superior (probado en b12613) con soporte de `inkling2_loop` fusionado (PR #32694), en modo router (`llama serve --models-preset`) o servidor clasico; tambien es compatible con frontends que consuman la API de llama.cpp (por ejemplo, Ollama mediante importacion del GGUF, aunque no esta verificado en la informacion disponible).
- Throughput medido: 62-66 t/s de decodificacion en contexto corto y 53-56 t/s a 70-84K de profundidad; prefill de 484 t/s en frio y 200-550 t/s en deltas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini Uncensored (este repo) | 26,07B | 3,4B | 1M nativo / 128K en preset | Apache 2.0 | GGUF en HF, llama.cpp |
| thinkingmachines/Inkling-2-Mini | 26,07B | 3,4B | 1M | no disponible | Modelo original alineado |
| AtomicChat/Inkling-2-Mini-Uncensored-GGUF | 26,07B | 3,4B | 1M | Apache 2.0 | GGUF, incluye proyector de vision |

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoria en la informacion proporcionada; la comparativa se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- Modelo sin censura: se ha eliminado el alineamiento de seguridad, por lo que puede generar contenido danino, ilegal o sesgado sin rechazo. No apto para aplicaciones de cara al publico sin filtros externos.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad; al ser un derivado cuantizado a 4 bits, la precision puede degradarse respecto al modelo original en FP16/BF16.
- Idiomas: la model card solo declara ingles; el rendimiento en castellano no esta verificado y podria ser deficiente.
- Contexto efectivo limitado: aunque el modelo soporta 1M tokens, el preset lo recorta a 128K por restricciones de VRAM; ademas, la calidad mas alla de 128K no esta evaluada.
- Dependencia de version: requiere `llama.cpp` b12600 o superior con el PR #32694; versiones anteriores no cargaran la arquitectura `inkling2_loop`.
- Repositorio de terceros: publicado por un usuario individual (MSA545) que redistribuye pesos de AtomicChat; no hay garantia de mantenimiento, actualizacion ni verificacion independiente de la cuantizacion.
- Vision no incluida: el paquete solo contiene pesos de texto; el uso multimodal exige descargar el `mmproj` desde otro repositorio.
- Sin datos de entrenamiento ni de sesgos: no se puede evaluar la composicion del dataset ni los sesgos heredados.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el caracter `uncensored` puede incumplir las politicas de plataformas de despliegue y conlleva responsabilidad legal sobre el contenido generado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MSA545/inkling-2-mini-uncen-fast-gguf
- Modelo base cuantizado (AtomicChat): https://huggingface.co/AtomicChat/Inkling-2-Mini-Uncensored-GGUF
- Modelo original (thinkingmachines): https://huggingface.co/thinkingmachines/Inkling-2-Mini
- PR de llama.cpp con soporte `inkling2_loop`: PR #32694 (referenciado en la model card; no se dispone de URL directa en la informacion proporcionada)
