# Grawnch/Inkling-2-Mini-WV-SM120

## Resumen

Inkling-2-Mini-WV-SM120 es un checkpoint cuantizado y multimodal del modelo base `thinkingmachines/Inkling-2-Mini`, publicado por el usuario Grawnch bajo licencia Apache-2.0. No se trata de un modelo entrenado desde cero, sino de una redistribucion optimizada para GPUs NVIDIA Blackwell (arquitectura `sm_120` / `sm_120a`) que incluye un runtime de inferencia propio (`qfn_inkling2_sm120`, version 1.3.0) con soporte para vision (image-text-to-text), decodificacion especulativa y un servidor local compatible con las APIs de OpenAI y Anthropic.

El modelo emplea una arquitectura Mixture-of-Experts (MoE) segun las etiquetas del repositorio, con un modulo de prediccion multi-token (MTP) que habilita la decodificacion especulativa, y una torre de vision en BF16 (`vision_bf16.safetensors`, 636,5 MB). El checkpoint ocupa 10,12 GB en disco e incluye shards de pesos, configuracion, tokenizer y wheels precompilados para Windows y Linux sobre Python 3.13.

Su relevancia practica radica en que demuestra inferencia multimodal de contexto muy largo (hasta 1.048.576 tokens declarados en `config.json`) en hardware de consumo: 16 GB de VRAM en modo `all_vram`, o tan solo 8 GB mediante tiering CPU-GPU con un presupuesto forzado de 6,80 GiB. El repositorio acumula 209 descargas desde su creacion el 21 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con modulo MTP (multi-token prediction) y torre de vision BF16 |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (`model_max_length`); verificado con needle-in-a-haystack a 1M |
| Tipos de cuantizacion | Pesos cuantizados (formato NVFP4/ModelOpt segun tags); KV cache en `bf16` y `q8_global` |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (shards: `embed_head_global`, `layers_00_05` a `layers_18_23`, `mtp_wv63`, `vision_bf16`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla el proceso de entrenamiento del modelo base, solo su adaptacion. El checkpoint deriva de `thinkingmachines/Inkling-2-Mini` y ha sido cuantizado con ModelOpt (tag `modelopt`) para ejecucion nativa en Blackwell. La arquitectura es MoE con 24 capas organizadas en cuatro shards de seis capas cada uno, mas un cabezal de embedding compartido y un modulo MTP (`mtp_wv63.safetensors`) que actua como modelo draft para decodificacion especulativa. La torre de vision se mantiene en BF16 sin cuantizar para preservar paridad exacta (0,0 ULP) entre ejecucion residente en GPU y streaming por capas.

Una innovacion destacable es el escalado logaritmico de la atencion (`n_floor=8192, alpha=0.1`) que permite extender el contexto hasta 1.048.576 tokens. El runtime admite dos modos de KV cache: `bf16` (48,41 GiB a 1M de contexto) y `q8_global` (30,97 GiB), ambos con recall identico 3/3 en la prueba de aguja en pajar y salidas greedy identicas de 233 tokens. El sistema de tiering CPU-GPU permite ejecutar el modelo con un presupuesto estricto de 6,80 GiB de VRAM, streameando capas desde CPU con un impacto de latencia medido.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 1M tokens.
- Razonamiento y generacion de codigo, matematicas y JSON (verificado en benchmarks de decodificacion especulativa).
- Vision multimodal: entrada image + text -> text, con soporte de `image_url` (OpenAI), `image` (Anthropic) e `input_image` (Responses API).
- Decodificacion especulativa integrada mediante MTP, con aceleraciones medidas de hasta 646,90 tok/s en continuacion de codigo.
- Servidor local compatible con APIs de OpenAI y Anthropic (`qfn-inkling2-serve`), incluyendo SSE concurrente.
- Batching continuo (hasta B=32 verificado) para despliegues multiusuario.
- Capacidad de needle-in-a-haystack a 1M tokens con recall perfecto (3/3).
- No se documenta soporte explicito de tool calling ni de agentes multi-paso en la informacion disponible.

## Casos de uso

- Analisis de documentos extensos: con 1M tokens de contexto verificado, el modelo puede procesar libros completos, expedientes o bases de codigo y responder preguntas sobre ellos sin chunking, usando el modo KV `q8_global` para caber en GPUs de 32 GB.
- Asistente local multimodal en estacion de trabajo: un desarrollador con una RTX 5060 Ti de 16 GB puede servir el modelo a 101,85 tok/s con vision activa y contexto de 128K, integrandolo en su IDE o cliente de chat mediante la API compatible con OpenAI.
- Generacion y continuacion de codigo en pipelines: la decodificacion especulativa alcanza 646,90 tok/s en continuacion de codigo, lo que lo hace apto para autocompletado o generacion de tests en flujos de CI/CD con servidor local.
- Despliegue en hardware modesto: el modo `8gb_tiered` con 6,55 GiB de pico permite ejecutar el modelo multimodal en GPUs de 8 GB, habilitando prototipado en portatiles o equipos de gama media.
- Servicio de chat multiusuario: con batching continuo a B=32 y 1.603,3 tok/s en RTX PRO 6000, puede alimentar un endpoint interno de atencion a usuarios con varias sesiones SSE concurrentes.
- Procesamiento de imagenes y texto combinados: extraccion de informacion de capturas, formularios o diagramas junto a instrucciones textuales, gracias a la torre de vision BF16 con paridad exacta entre modos de ejecucion.
- Evaluacion e investigacion de cuantizacion: el repositorio publica metricas de KLD (0,068819) y perplejidad comparadas con el profesor FP, util para estudiar el impacto de la cuantizacion en modelos MoE multimodales.

## Benchmarks y rendimiento

Calidad (validacion ciega sobre 16.376 tokens no vistos):

| Metrica | Profesor FP | Cuantizado |
|---|---|---|
| KLD | referencia | 0,068819 (92,422% acuerdo Top-1) |
| Perplejidad All_Val | 5,30031 | 5,39794 |
| Perplejidad C4 | 10,98 | 11,52 |
| Perplejidad Math | 4,69 | 4,89 |
| Perplejidad Code | 2,116 | 2,123 |
| Perplejidad Chat | 7,24 | 7,10 |

Throughput en RTX PRO 6000 Blackwell (`sm_120a`, runtime v1.5.1):

| Metrica | Contexto / batch | Medido |
|---|---|---|
| Decode simple M=1 | B=1 | 205,17 tok/s |
| Decode especulativo | B=1 | 275,18 (code), 340,03 (math), 287,52 (json), 294,81 (prose) tok/s |
| Decode especulativo (continuacion) | code_cont_512 / 2048 | 646,90 / 550,11 tok/s |
| Decode batched | B=4 / B=8 / B=16 (2K) | 682,9 / 1150,4 / 1143,3 tok/s |
| Prefill | S=512 / 2048 / 8192 / 32768 | 8268,2 / 11868,3 / 12411,1 / 11304,3 tok/s |

Otras mediciones: RTX 5060 Ti 16 GB a 128K de contexto alcanza 101,85 tok/s (13,65 GiB de pico); modo 8 GB logra 123,05 tok/s especulativo con 6,55 GiB de pico; el servidor HTTP registra 273,8+ tok/s en Chat JSON especulativo. En A100-80GB, el prefill de 1M tokens tarda 994,20 s (bf16) o 1.008,15 s (q8_global), con decode MTP-8 de 14,89 / 13,20 tok/s respectivamente.

## Requisitos de hardware

- VRAM para inferencia: 13,65 GiB de pico en modo `all_vram` con 128K de contexto; 6,55 GiB en modo `8gb_tiered`; 48,41 GiB (KV bf16) o 30,97 GiB (KV q8_global) para 1M de contexto.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (maximo rendimiento), RTX 5060 Ti 16 GB (consumo), A100-SXM4-80GB (contexto 1M), GPUs de 8 GB mediante tiering.
- Cabe en GPU de consumo: si, en RTX 5060 Ti 16 GB y en GPUs de 8 GB con streaming.
- Opciones de despliegue: runtime propietario `wv_runtime` (wheel universal `sm_80`-`sm_120a`), servidor `qfn-inkling2-serve` compatible con OpenAI/Anthropic; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de benchmarks; prefill de 8K en 660 ms y decode especulativo de hasta 646,90 tok/s en continuacion de codigo.
- Requiere Python 3.13 (`cp313`) y arquitectura Blackwell para el modo nativo `sm_120a`; el runtime universal cubre tambien `sm_80`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-WV-SM120 | no disponible (MoE) | 1.048.576 | Apache-2.0 | Runtime propio, OpenAI/Anthropic API | Cuantizado para Blackwell, vision, spec decoding |
| thinkingmachines/Inkling-2-Mini | no disponible | no disponible | Apache-2.0 | Ecosistema estandar | Modelo base sin cuantizar del que deriva |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Solo se ha verificado ejecucion en GPUs NVIDIA Blackwell (`sm_120a`) y A100 (`sm_80`); otras arquitecturas dependen del wheel universal pero no estan validadas en la model card.
- El runtime es propietario y especifico (`wv_runtime`, `qfn_inkling2_sm120`); no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, lo que limita la portabilidad.
- La cuantizacion introduce degradacion medible: KLD de 0,068819 y caida de perplejidad en C4 (10,98 a 11,52) y Math (4,69 a 4,89); en produccion conviene validar en el dominio propio.
- El contexto de 1M tokens requiere 31-48 GiB solo para KV cache y prefill de ~16 minutos en A100, lo que puede no ser viable en entornos interactivos.
- No se documentan idiomas soportados ni sesgos conocidos; el uso multilingue no esta verificado.
- Riesgo de alucinacion inherente a modelos generativos; no se publican evaluaciones de factualidad ni de seguridad.
- El repositorio tiene 0 likes y 209 descargas, con mantenimiento a cargo de un unico autor; conviene evaluar la continuidad del proyecto antes de depender de el en produccion.
- Aunque la licencia es Apache-2.0, el runtime y los wheels precompilados podrian tener terminos propios no detallados en la informacion disponible.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/Grawnch/Inkling-2-Mini-WV-SM120
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Runtime universal (wheels): https://huggingface.co/Grawnch/wv-runtime-binaries
- Wheel del instalador: https://huggingface.co/Grawnch/wv-runtime-binaries/resolve/main/wheels/wv_runtime_installer-1.5.2-py3-none-any.whl
