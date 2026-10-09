# caseyallard/uor-r4-geometric-214m

## Resumen

UOR-R4 Geometric 214M es un conjunto de checkpoints de investigación del UOR-R4 Geometric Language Model, publicado por el usuario caseyallard bajo la organización UOR-Foundation. Se trata de un modelo de lenguaje de 214 millones de parámetros escrito en Rust que sustituye la maquinaria de ejecución de un transformer por construcciones geométricas: estado y transporte cuaterniónico R4/S3/H4, direccionamiento por primos/UOR, aritmética exacta en Z[phi], fases fijas en ceros de la función zeta, memoria direccionada exacta y operadores tipados aprendidos.

El autor declara explícitamente un estado pre-alfa: ninguno de los checkpoints publicados mantiene una conversación útil y se distribuyen como artefactos de investigación para inspeccionar y reproducir los entrenamientos y la arquitectura. La pila geométrica comparte una única configuración de 214M de parámetros, vocabulario de 4096 tokens (BPE aprendido) y una ventana de contexto de solo 384 tokens.

Es relevante ahora porque documenta una vía alternativa al transformer clásico y porque el objetivo de servicio del proyecto (decisión D11) renuncia a punto flotante, a la instrucción de multiplicación y al backbone transformer en los kernels servidos. Los safetensors publicados son checkpoints del lado de entrenamiento, no ese artefacto de servicio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pila geometrica (Rust/candle); patron de capas `rrarrarrarrarrar` con capas de lectura/transporte geometrico (`r`) y capas de atencion contextual direccionada (`a`) |
| Parametros totales | 214M |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 384 tokens |
| Tipos de cuantizacion | no disponible; los checkpoints se publican en safetensors de precision completa y no se anuncian versiones GGUF, AWQ o GPTQ |
| Idiomas soportados | ingles (en) |
| Licencia | MIT (pesos); los datos de entrenamiento tienen sus propias condiciones |
| Formato de pesos | safetensors (`model/model.safetensors`), acompanado de `model/config.json` y `report.json`; el artefacto de servicio del proyecto se exporta a `.lut` |
| Vocabulario | 4096 tokens (BPE aprendido, `tokenizer.json`) |
| Ancho (hidden size) | 1536 |
| Cabezas de atencion | 24 |
| Cabeza puntero (checkpoints de chat) | dimension 32 |
| Estado | pre-alfa (investigacion) |
| Tamano del repo | 3,4 GB |

## Arquitectura y entrenamiento

La arquitectura es una pila geometrica de 214M de parametros con patron de capas `rrarrarrarrarrar`, donde `r` designa una capa de lectura/transporte geometrico y `a` una capa de atencion contextual direccionada. El ancho es 1536, con 24 cabezas; la lectura se realiza con norma l2 y la rotacion esta habilitada. Los checkpoints de chat anaden una pequena cabeza puntero de dimension 32. El entrenamiento es Rust offline con candle sobre CUDA y puede emplear punto flotante y multiplicacion matricial, a diferencia del objetivo de servicio (decision D11), que renuncia a punto flotante, instruccion de multiplicacion y backbone transformer en los kernels servidos.

Los datos de entrenamiento combinan TinyStories (peso 0,7), TinyDialogues (0,1) y chat-v0-p2 (0,2) para el checkpoint base inicial. El checkpoint `base-planA` se inicializa desde `base-tinystories` y se entrena durante 150.000 pasos (batch 32, contexto 384, unos 1.840 millones de tokens, 42.463 s en una unica RTX PRO 6000) sobre shards de SmolLM-Corpus (componentes FineWeb-Edu y Cosmopedia-v2 con pesos 0,35/0,35/0,075x4). Los ajustes de chat usan el corpus mixB de 173 millones de tokens, compuesto por dialogos de memoria generados por el proyecto (`mw-balp`, `mw-orcp`), dialogue-recall-v2 y el conjunto chat-v0-p2 derivado de SmolTalk magpie-ultra y UltraChat. No se documenta RLHF ni DPO en la informacion disponible.

## Capacidades

- Generacion de texto autorregresiva sobre corpus pequenos; los modelos base estan entrenados principalmente con TinyStories, TinyDialogues y shards de SmolLM-Corpus.
- Los ajustes de chat pueden reescribir y resumir textos cortos, segun la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; la model card indica que la seguridad ante instrucciones y el razonamiento general no estan establecidos.
- Capacidades multilingues: solo ingles (en).
- Codigo y aritmetica: los ajustes de chat producen respuestas incorrectas en codigo y calculo, segun el propio autor.
- Memoria direccionada exacta y operadores tipados aprendidos como parte del diseno geometrico del modelo.
- Panel de memoria v4: 31/40 en el checkpoint `base-tinystories` (metrica interna del proyecto, no una capacidad general).
- Modo thinking, vision o audio: no disponible.
- Artefacto de servicio separado: los `.lut` exportados se sirven mediante `uor-chat --stack <ARTIFACT.lut>` (crate `uor-r4-integer`), distinto de estos checkpoints safetensors.

## Casos de uso

- Reproduccion de entrenamiento: el proyecto publica los cuatro checkpoints con sus `report.json` para que un investigador pueda repetir los runs y verificar las cifras de NLL, datos, operadores y presupuesto empleados.
- Investigacion en arquitecturas no transformer: permite estudiar el patron `rrarrarrarrarrar`, el transporte cuaternionico R4/S3/H4 y el direccionamiento por primos/UOR frente a la atencion clasica.
- Estudio de aritmetica exacta y fases zeta: el modelo incorpora aritmetica exacta en Z[phi] y fases fijas en ceros de la funcion zeta, lo que sirve como banco de pruebas para tecnicas de representacion numerica.
- Experimentos de memoria direccionada: los dialogos de memoria generados por el proyecto (`mw-balp`, `mw-orcp`) permiten evaluar mecanismos de recall de corto alcance en una ventana de 384 tokens.
- Pruebas de servicio sin punto flotante: la via de despliegue `.lut` con `uor-chat --stack` y el crate `uor-r4-integer` sirven para experimentar con kernels sin instruccion de multiplicacion.
- Generacion de texto estilo TinyStories: el checkpoint `base-tinystories` alcanza NLL 1,032 en la validacion de TinyStories, por lo que puede emplearse en experimentos de generacion de micro-relatos muy acotados.
- Docencia y divulgacion: al ser un modelo pequeno (214M) y con licencia MIT, es util para ilustrar internals de entrenamiento en Rust y comparar con transformers convencionales.
- Inspeccion de ajuste fino: los checkpoints `chat-planA-b8` y `chat-smoltalk-b16` permiten comparar el efecto de 8.000 frente a 16.000 pasos sobre el mismo corpus mixB de 173 millones de tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las unicas cifras de calidad declaradas son las siguientes:

| Checkpoint | Metrica | Valor |
|---|---|---|
| base-tinystories | NLL en validacion de TinyStories | 1,032 |
| base-tinystories | Panel de memoria v4 | 31/40 |
| base-planA | Dev NLL en shard de validacion FineWeb | 2,903 -> 2,073 |
| base-planA | Pasos / tokens / tiempo | 150.000 pasos, ~1,84B tokens, 42.463 s en 1x RTX PRO 6000 |
| base-planA | Throughput de entrenamiento | 46,8k tokens/s inicial; 43,4k tokens/s de media (batch 32, contexto 384) |
| chat-planA-b8 | Ajuste fino sobre mixB | 8.000 pasos, 1.308 s |
| chat-smoltalk-b16 | Ajuste fino sobre mixB | 16.000 pasos, 3.152 s |

El autor advierte que un panel interno superado no constituye una afirmacion de capacidad general.

## Requisitos de hardware

- VRAM estimada para inferencia: con 214M de parametros, unos 856 MB en fp32 y unos 428 MB en fp16, mas el coste de activaciones y tokenizer; en la practica cabe en menos de 2 GB en fp32.
- GPU recomendadas: cualquier GPU consumer moderna sirve; se ha documentado entrenamiento en una RTX PRO 6000, y el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 y similares, asi como en iGPU con memoria suficiente.
- Cabe en GPU consumer: si, con margen amplio, dado el tamano de 214M de parametros y el contexto de solo 384 tokens.
- Opciones de despliegue: no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI. La ejecucion oficial se hace desde el repositorio GitHub con los ejemplos `geometric-stack` del crate `uor-r4-training` (`sample` y `evaluate`) y, para el artefacto de servicio, con `uor-chat --stack <ARTIFACT.lut>` del crate `uor-r4-integer`.
- Latencia y throughput de inferencia: no disponible (solo se publican cifras de entrenamiento).

## Comparativa con modelos similares

La informacion disponible no incluye comparaciones oficiales con otros modelos. A modo de referencia de categoria (modelos pequenos de 100M-500M parametros), las especificaciones siguientes proceden de las model cards publicas de cada proyecto y deberian verificarse antes de usarse:

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| UOR-R4 Geometric 214M | 214M | 384 | MIT (pesos) | Investigacion geometrica, pre-alfa |
| SmolLM2-135M | 135M | 8192 | Apache-2.0 | Modelo de lenguaje general pequeno |
| Qwen2.5-0.5B | 0,49B | 32768 | Apache-2.0 | Modelo de lenguaje general pequeno |

La diferencia principal no es de rendimiento sino de proposito: UOR-R4 no es un modelo de produccion, mientras que los otros dos son modelos generales desplegables.

## Limitaciones y advertencias

- Estado pre-alfa declarado por el autor: ningun checkpoint mantiene una conversacion util y se publican solo como artefactos de investigacion.
- No es instruction-safe; no debe usarse para nada distinto de inspeccionar la investigacion.
- Codigo y aritmetica: las respuestas son incorrectas segun la propia model card.
- Prosa general, razonamiento general, capacidades frontier y ahorro energetico de camino completo no estan establecidos por el proyecto.
- Riesgo de alucinacion: no se documenta mitigacion; al ser un modelo entrenado sobre corpus pequenos, la generacion fuera de ese dominio es poco fiable.
- Ventana de contexto muy corta (384 tokens), lo que limita conversaciones multi-turno y documentos largos.
- Idioma: unicamente ingles; no se declara soporte de castellano ni de otros idiomas.
- Sesgos: proceden de los corpus de entrenamiento (TinyStories, FineWeb-Edu, Cosmopedia-v2, SmolTalk, UltraChat); no se publica analisis de sesgos.
- Licencia: los pesos son MIT, pero los datos de entrenamiento llevan sus propios terminos (SmolLM-Corpus odc-by, SmolTalk Apache-2.0 y condiciones de sus fuentes, TinyStories cdla-sharing-1.0, TinyDialogues MIT, UltraChat 200k MIT); los usuarios deben revisarlos antes de un uso downstream.
- Numeros de entrenamiento y evaluacion ligados al artefacto, datos, operador y presupuesto concretos registrados en cada `report.json`.
- Los safetensors son checkpoints del lado del entrenamiento, no el artefacto de servicio sin punto flotante (`.lut`) descrito en la decision D11.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; comunidad y soporte inexistentes.

## Enlaces

- HuggingFace: https://huggingface.co/caseyallard/uor-r4-geometric-214m
- Dataset del proyecto: https://huggingface.co/datasets/caseyallard/uor-r4-data
- Codigo (MIT): https://github.com/UOR-Foundation/uor-r4
- Tracker del proyecto: https://github.com/UOR-Foundation/uor-r4/issues/2028
- Citacion: `CITATION.cff` en https://github.com/UOR-Foundation/uor-r4
- SmolLM-Corpus (odc-by): https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- SmolTalk (Apache-2.0 y condiciones de sus fuentes): https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- TinyStories (cdla-sharing-1.0): https://huggingface.co/datasets/roneneldan/TinyStories
- TinyDialogues (MIT): https://huggingface.co/datasets/styfeng/TinyDialogues
- UltraChat 200k (MIT): https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
