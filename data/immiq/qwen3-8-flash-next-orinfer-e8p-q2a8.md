# immiq/Qwen3.8-Flash-Next-Orinfer-E8P-Q2A8

## Resumen

Qwen3.8-Flash-Next-Orinfer-E8P-Q2A8 es una cuantizacion de Qwen/Qwen3.8-Flash-Next, el modelo vision-lenguaje de la familia Qwen, publicada por el usuario immiq y optimizada especificamente para su despliegue en dispositivos NVIDIA Jetson AGX Orin de 64 GB con arquitectura CUDA SM87. No se trata de un modelo nuevo, sino de una distribucion de pesos cuantizados junto con un runtime propietario (Orinfer v0.3.1) que permite ejecutar un modelo de gran tamano en hardware de borde con memoria unificada limitada.

La relevancia de esta ficha radica en su enfoque: consigue comprimir el modelo base hasta aproximadamente 2,414 bits por parametro de peso registrado en GPU (38.865.095.600 bytes de datos de solo lectura en GPU), manteniendo una ventana de contexto de 262.144 tokens y soporte para texto, imagenes y multiples imagenes. El repositorio almacena 52,94 GB en 35 shards de safetensors, mientras que el paquete de ejecucion compilado (cubins y biblioteca Rust) se distribuye por separado a traves de GitHub Releases.

El modelo esta pensado para inferencia local en el borde: agentes conversacionales multimodales, traduccion, procesamiento por lotes offline en formato JSONL y servicios compatibles con la API de OpenAI Chat Completions. Su licencia es la Qwen Community License 1.0, lo que condiciona el uso comercial. Los idiomas declarados son chino e ingles, sin soporte explicito de castellano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje con mezcla de expertos enrutados (MoE), atencion GDN y QSA, y modulo MTP nativo (segun nomenclatura del autor); detalles completos del modelo base no disponibles |
| Parametros totales | no disponible de forma explicita; el autor reporta aproximadamente 2,414 bits por parametro de peso registrado en GPU sobre 38.865.095.600 bytes |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | E8P near-2-bit con computo INT8 en expertos enrutados; Q4A8 con bloques con signo de 128 en GDN QKV/Z, QSA Q/gate y cabeza de salida compartida; W8 en proyecciones de salida, FFN compartida y proyecciones MTP sensibles; BF16 en HC; FP16 en vision; KV cache INT8; estado GDN persistente FP32 |
| Idiomas soportados | zh, en |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors (35 shards, 52,94 GB), mas assets de configuracion y tokenizer de Hugging Face y `cache/model.json` |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un modelo vision-lenguaje de la familia Qwen. La model card del autor de la cuantizacion menciona componentes concretos: expertos enrutados (routed experts) propios de una arquitectura MoE, atencion GDN (con proyecciones QKV/Z), atencion QSA (con proyecciones Q/gate), una FFN compartida, una cabeza de salida compartida, un modulo MTP (multi-token prediction) nativo y una torre de vision en FP16. No se detalla en la informacion disponible el numero total de parametros, el numero de expertos, la composicion del dataset de entrenamiento ni si el modelo base uso RLHF o DPO.

La innovacion principal de esta publicacion no esta en el entrenamiento sino en la compresion y el runtime. Los expertos enrutados se cuantizan a E8P near-2-bit con computo en INT8, lo que reduce drasticamente el peso en memoria a costa de precision; las capas sensibles (proyecciones de salida, FFN compartida, MTP) se mantienen en W8, y la torre de vision en FP16. El estado persistente de GDN se conserva en FP32 y la KV cache en INT8. El paquete de ejecucion fija los layouts fisicos de los tensores y un digest SHA-256 (`0a88897e1fea82d5c42dacc118f06e2bc0494684a91013919c5a8420ea55de50`), de modo que los pesos solo son validos con la version correspondiente del runtime Orinfer.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat nativa.
- Comprension de imagenes y de multiples imagenes en una misma peticion (pipeline image-text-to-text).
- Modo thinking opcional, controlado mediante la plantilla de chat original y expuesto en el campo `reasoning_content`; las peticiones de traduccion usan `enable_thinking: false`.
- Prediccion multi-token (MTP) nativa con decodificacion especulativa adaptativa configurable (`--mtp-drafts`).
- Soporte de tool calling y function calling a traves de la API compatible con OpenAI Chat Completions.
- Soporte de agentes y razonamiento multi-paso mediante peticiones encadenadas con contexto largo.
- Capacidades multilingues limitadas a chino e ingles.
- Inferencia por lotes offline reanudable en formato JSONL (`orinfer batch`).
- Prefix caching y continuous batching para servir multiples peticiones concurrentes.
- API compatible con Ollama ademas de la API OpenAI.

## Casos de uso

- **Traduccion chino-ingles en el borde**: el modelo puede ejecutarse en un Jetson AGX Orin 64 GB con `enable_thinking: false` para obtener respuestas rapidas; el autor documenta una peticion de traduccion de 21 tokens como prueba de arranque y primera salida SSE.
- **Atencion al cliente multimodal local**: con 262.144 tokens de contexto y soporte de imagenes, puede gestionar conversaciones multi-turno con capturas de pantalla o documentos escaneados sin salir del dispositivo, util en entornos con requisitos de privacidad.
- **Procesamiento por lotes offline**: el comando `orinfer batch` permite lanzar trabajos JSONL reanudables sobre grandes volumenes de pares imagen-texto, por ejemplo para etiquetado o enriquecimiento de catalogos.
- **Agentes con tool calling**: al exponer `/v1/chat/completions` con soporte de function calling, puede integrarse como backend de agentes que consultan APIs externas y razonan en varios pasos con contexto largo.
- **Asistente de vision en robotica o inspeccion**: la torre de vision en FP16 y el pipeline image-text-to-text permiten describir escenas o detectar anomalias en imagenes capturadas por camaras conectadas al Jetson, con latencia medida en decodificacion de 56,35 tok/s en una sola peticion.
- **Servicio concurrente de bajo volumen**: con continuous batching y hasta 32 peticiones concurrentes medidas (282,87 tok/s en decodificacion agregada), puede atender a un equipo pequeno de usuarios desde un unico dispositivo.
- **Prototipado de aplicaciones multimodales sin GPU de datacenter**: el runtime precompilado para SM87 evita tener que montar infraestructura con A100 o H100 para probar flujos de vision-lenguaje.

## Benchmarks y rendimiento

El autor publica mediciones de rendimiento del runtime (v0.2.0, 2026-10-21) en Jetson AGX Orin 64 GB, no benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K, etc.). No se han publicado resultados de benchmarks de calidad en la informacion disponible.

| Metrica | Valor |
|---|---|
| Prefill 512 tokens (tok/s) | 925,57 |
| Prefill 8K tokens (tok/s) | 858,11 |
| Decodificacion single-request con MTP (tok/s) | 56,35 |
| Decodificacion con 8 peticiones (tok/s) | 157,25 |
| Maximo de peticiones concurrentes / decodificacion (tok/s) | 32 / 282,87 |
| Arranque del servicio hasta API lista (s) | 15,79 |
| Arranque hasta primera salida SSE (s) | 15,96 |

Las condiciones declaradas son: greedy, semilla `20261002`, `decode_only`, thinking desactivado, prefix cache desactivado; single-request con MTP adaptativo hasta 3 drafts, 512/8192 tokens de entrada y 257 tokens de salida fijos; multi-request con MTP desactivado, 256 tokens de entrada y 65 de salida por peticion. Cada valor es la mediana de tres ejecuciones en caliente tras un calentamiento. El autor advierte que son diagnosticos historicos de v0.2.0 y no un benchmark de v0.3.1.

## Requisitos de hardware

- **Hardware objetivo**: NVIDIA Jetson AGX Orin 64 GB con CUDA SM87. El runtime precompilado solo se distribuye para `linux-aarch64` y SM87; no se mencionan otras plataformas en la informacion disponible.
- **Memoria**: los datos de GPU de solo lectura ocupan 38.865.095.600 bytes (unos 36,2 GiB); los pesos en safetensors suman 52,94 GB en disco. El modelo esta disenado para la memoria unificada de 64 GB del Jetson, no para GPUs de consumo con VRAM discreta.
- **GPU de consumo**: no hay indicacion de que quepa en RTX 4090 u otras GPUs consumer; el runtime no se distribuye para esas arquitecturas.
- **Opciones de despliegue**: exclusivamente Orinfer v0.3.1 (CLI Rust `orinfer serve`), con APIs compatibles con OpenAI Chat Completions y Ollama. No se mencionan vLLM, llama.cpp, TGI ni Ollama nativo.
- **Latencia y throughput**: segun la tabla anterior, 56,35 tok/s en decodificacion single-request con MTP y 282,87 tok/s con 32 peticiones concurrentes; arranque del servicio en torno a 16 segundos.
- **Ajuste de rendimiento**: para una sola peticion se recomienda `--mtp-drafts 3`; para concurrencia, evaluar `--mtp-drafts 0`, ya que la especulacion adaptativa puede reducir el throughput agregado en algunas cargas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de calidad ni de especificaciones completas del modelo base en la informacion proporcionada, por lo que no es posible establecer una comparativa rigurosa con alternativas. A modo orientativo:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-Flash-Next-Orinfer-E8P-Q2A8 | no disponible (aprox. 2,414 bits/peso en GPU) | 262.144 | qwen-community-1.0 | safetensors + runtime Orinfer para Jetson SM87 |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | no disponible | qwen-community-1.0 | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Compatibilidad de hardware extremadamente restringida**: solo Jetson AGX Orin 64 GB con CUDA SM87 y el runtime Orinfer v0.3.1 con el digest de ejecucion exacto. Los pesos no son utilizables con vLLM, llama.cpp, TGI ni otras herramientas estandar.
- **Cuantizacion agresiva**: los expertos enrutados en E8P near-2-bit con computo INT8 implican una perdida de calidad respecto al modelo base. El autor solo valida con diagnosticos de probabilidad de historia fija, aislamiento de estado entre peticiones, recuperacion de MTP/prefix y peticiones de texto e imagen, con muestras pequenas y contextos de hasta 8K tokens.
- **Validacion limitada**: la cobertura declarada incluye texto, entradas de hasta 8K y imagenes simples controladas; no hay validacion publicada para contextos cercanos a los 262.144 tokens ni para tareas complejas.
- **Idiomas**: solo chino e ingles declarados; no hay soporte explicito de castellano ni de otros idiomas.
- **Licencia**: Qwen Community License 1.0, que impone condiciones al uso comercial; es necesario revisar el texto completo antes de desplegar en produccion.
- **Riesgo de alucinacion y sesgos**: no se documentan evaluaciones de sesgo ni de tasas de alucinacion en la informacion disponible; al ser una cuantizacion de bajo bit, estos riesgos pueden amplificarse.
- **Rendimiento dependiente de la carga**: el propio autor advierte que la velocidad de MTP depende de la tarea y de la tasa de aceptacion, y que la especulacion adaptativa puede reducir el throughput agregado en concurrencia.
- **Mantenimiento**: el repositorio depende de actualizaciones coordinadas entre los pesos, `cache/model.json` y el paquete de ejecucion; una version desalineada invalida el modelo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/immiq/Qwen3.8-Flash-Next-Orinfer-E8P-Q2A8)
- [Modelo base Qwen/Qwen3.8-Flash-Next](https://huggingface.co/Qwen/Qwen3.8-Flash-Next/tree/de4b8e4d43b917e7706784d8bb445c9af86a3540)
- [Licencia Qwen Community 1.0](https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/de4b8e4d43b917e7706784d8bb445c9af86a3540/LICENSE)
- [ModelScope (espejo)](https://modelscope.cn/models/iammiq/Qwen3.8-Flash-Next-Orinfer-E8P-Q2A8)
- [Orinfer v0.3.1 (GitHub Release)](https://github.com/iMMIQ/orinfer/releases/tag/v0.3.1)
- [Guia de serving de Orinfer](https://github.com/iMMIQ/orinfer/blob/v0.3.1/docs/serving.md)
- [Referencia de rendimiento de Orinfer](https://github.com/iMMIQ/orinfer/blob/v0.2.0/docs/performance.md)
- [Revision v0.3.1 del repositorio](https://huggingface.co/immiq/Qwen3.8-Flash-Next-Orinfer-E8P-Q2A8/tree/v0.3.1)
