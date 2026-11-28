# msamon/ERNIE-5.5-Flash-exl3-2.75bpw

## Resumen

ERNIE-5.5-Flash-exl3-2.75bpw es una cuantización EXL3 (exllamav3 v1.6.7) del modelo ERNIE-5.5-Flash-Preview, desarrollado originalmente por Baidu. El repositorio lo publica el usuario msamon y su propósito es ofrecer una versión comprimida a 2,75 bits por peso (bpw) que pueda ejecutarse en hardware con memoria limitada, en concreto una NVIDIA DGX Spark (GB10, SM121), manteniendo una calidad razonable respecto al modelo original sin cuantizar.

El modelo base es un transformer de arquitectura MoE (mixture of experts) orientado a generación de texto, agentes y tool calling, con soporte nativo para inglés y chino. Esta build incluye el cabezal de borrador DSpark (decodificación especulativa) integrado, lo que permite acelerar la inferencia entre 1,57x y 3,61x según el tipo de carga de trabajo.

La relevancia de esta ficha radica en que demuestra un flujo completo de cuantización agresiva con validación cuantitativa (perplejidad, KLD, acuerdo top-1) y despliegue en producción mediante un servidor compatible con la API de OpenAI, con métricas de prefill y decode medidas sobre hardware real. Es un caso práctico de cómo llevar un MoE grande a un dispositivo de 128 GB de memoria unificada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (ERNIE 5.5) con atención HCA y DSA, más cabezal de borrador DSpark (MTP) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens (caché de prefijo del servidor incluido); contexto nativo del modelo base no disponible |
| Tipos de cuantización | EXL3 2,75 bpw (2,77 bpw globales); expertos enrutados a 3,00 bpw (capas 1-10 y 33-42) y 2,50 bpw (capas 11-32); MLP densa capa 0 a 3,5 bpw; módulos promocionados a 4,00 bpw; `lm_head` a 6 bpw; `embed_tokens` en trellis de 8 bits; DSpark a ~2,08 bpw |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | EXL3 (exllamav3), 13 shards, 98 GiB totales |
| Modelo base | baidu/ERNIE-5.5-Flash-Base (finetune) |
| Herramienta de cuantización | exllamav3 v1.6.7 |
| Hardware de conversión | NVIDIA DGX Spark (GB10, SM121) |

## Arquitectura y entrenamiento

El modelo base ERNIE-5.5-Flash es un transformer de mezcla de expertos (MoE) con mecanismos de atención propietarios de Baidu: HCA (atención con compresor) y DSA, según se deduce de los nombres de módulos cuantizados (`wo_a`, `compressor`, `q_a`, `q_b`, `kv_a_proj`, `indexer.wq_b`). Incluye un cabezal de predicción multi-token (MTP) denominado DSpark, que actúa como borrador para decodificación especulativa. Los detalles sobre número de tokens de entrenamiento, composición del dataset y si hubo RLHF o DPO no están disponibles en la información proporcionada.

La cuantización se realizó con exllamav3 aplicando una estrategia por capas: los expertos enrutados de las capas centrales (11-32) se comprimen a 2,50 bpw, mientras que las capas iniciales y finales (1-10 y 33-42) se mantienen a 3,00 bpw. Los módulos críticos (expertos compartidos, proyecciones de atención, compresor HCA, indexer DSA y `lm_head`) se promocionan a 4,00 o 6 bpw para preservar calidad. La calibración usó 256 filas de 2.048 tokens (524.288 tokens) con plantilla de chat nativa y tool calls, con mayoría de datos agénticos y de razonamiento (200 filas) más la mezcla incluida de exllamav3 (56 filas). Se aplicaron Hessianos por experto con `-mae 0.01` y 262.144 filas muestreadas por capa.

## Capacidades

- Generación de texto en inglés y chino.
- Razonamiento multi-paso y modo de razonamiento (las cargas "creative (reasoning)" y "translation (reasoning)" del benchmark lo confirman).
- Tool calling / function calling nativo: la calibración usa la plantilla de tool calls de ERNIE y las cargas agénticas con `curl` lo ejercitan.
- Uso como agente de código: validado con el agente de programación `pi` contra el servidor incluido.
- Generación de código y tareas de programación (cargas "agentic, code" y "coding" medidas).
- Traducción (cargas de traducción con y sin razonamiento).
- Decodificación especulativa integrada mediante el cabezal DSpark, con aceptación de 1,5 a 6,6 borradores por ronda según carga.
- Solo texto: el autor indica explícitamente "Text only"; no hay visión ni audio.
- Servidor compatible con la API de OpenAI incluido en `serving/`, con batching continuo y caché de prefijo de 262.144 tokens.

## Casos de uso

- Agente de programación en local: el modelo se ha probado con el agente `pi` sobre prompts de 20.000 a 55.000 tokens, con decodificación de 33-59 t/s y caché de prefijo que reduce los seguimientos a 0,68-1,99 s de prefill. Adecuado para asistentes de código que operan sobre repositorios grandes en una sola máquina.
- Automatización de tareas con tool calling: la calibración con `toolace`, `hermes_fc` y `apigen_mt` y las cargas agénticas con `curl` indican buen soporte de llamadas a herramientas encadenadas, útil para orquestadores de agentes que consultan APIs HTTP.
- Servicio de chat multi-turno con contexto largo: la caché de prefijo de 262.144 tokens permite conversaciones con documentos extensos adjuntos, con prefills de 810 t/s en primera petición y tiempos de seguimiento por debajo de 2 s.
- Traducción EN-ZH asistida: con 43,8 t/s en modo directo y 42,2 t/s en modo razonamiento, es viable para pipelines de traducción por lotes o interactivos entre inglés y chino.
- Generación de código en CI/CD: el servidor OpenAI-compatible permite integrarlo como backend de herramientas tipo Copilot o revisores automáticos de PR, con batching continuo (`--max-batch-size 4`) para varios desarrolladores concurrentes.
- Despliegue en estación de trabajo con memoria unificada: al ocupar 98 GiB de pesos y dejar 5-9 GiB libres en una GB10, encaja en equipos de 128 GB de memoria unificada sin GPU discreta de gran VRAM, lo que facilita prototipado de agentes en escritorio.
- Investigación sobre cuantización: el repositorio incluye métricas de KLD, perplejidad y acuerdo top-1 que sirven como referencia reproducible para estudiar el impacto de EXL3 a 2,75 bpw en modelos MoE.

## Benchmarks y rendimiento

Calidad de la cuantización frente al modelo sin cuantizar (40 filas de wikitext × 2.048 tokens, `eval/model_diff.py`):

| Medida | EXL3 2,75 bpw | Fuente (sin cuantizar) |
|---|---|---|
| Perplejidad | 2,966 | 2,379 |
| Acuerdo top-1 | 83,5% | -- |
| KLD (A‖B), media | 0,338 | -- |
| KLD (A‖B), mediana | 0,040 | -- |
| KLD (A‖B), p90 | 1,04 | -- |
| KLD en tokens con confianza ≥95% (58% del total), media | 0,110 | -- |
| KLD en tokens con confianza ≥95%, mediana | 0,003 | -- |

Con `-kb 60` (estado de la fuente alimentado a cada módulo, aísla el error por módulo): KLD 0,00049 en ambas direcciones, mediana 2,6e-5, acuerdo top-1 del 99,3% y top-5 del 82,2%. El error relativo por capa es de 0,014-0,12, peor en las capas a 2,5 bpw (11, 15, 24, 28, 31, 32). El `lm_head` de 6 bits por sí solo da KLD 0,0005 y 99,3% top-1. El autor atribuye el KLD acumulado al ruido de 2,5-3,0 bpw en 43 capas, no a un componente roto.

Velocidad de decodificación (greedy, 512 tokens nuevos, batch 1, decodificación especulativa DSpark con caché de 49K tokens):

| Carga | Baseline | DSpark | Aceptados / borradores por ronda |
|---|---|---|---|
| Agéntica, código | 20,4 t/s | 44,9 t/s (2,20x) | 3,66 / 5,07 |
| Agéntica, curl | 20,4 t/s | 38,1 t/s (1,87x) | 2,54 / 4,16 |
| Programación | 20,8 t/s | 47,3 t/s (2,27x) | 3,24 / 4,70 |
| Creativa | 21,3 t/s | 33,4 t/s (1,57x) | 1,51 / 2,56 |
| Creativa (razonamiento) | 21,2 t/s | 34,5 t/s (1,63x) | 1,64 / 2,66 |
| Traducción | 21,0 t/s | 43,8 t/s (2,09x) | 2,70 / 4,74 |
| Traducción (razonamiento) | 20,9 t/s | 42,2 t/s (2,01x) | 2,51 / 4,34 |
| Repetición trivial | 18,9 t/s | 68,1 t/s (3,61x) | 6,64 / 6,85 |

Servidor OpenAI-compatible (batching continuo, `--max-batch-size 4`, caché de prefijo de 262.144 tokens, DSpark activo), sobre GB10:

| Forma de petición | Prefill | Decode | Aceptados / ronda |
|---|---|---|---|
| Prompt de 20.751 tokens, sin caché | 25,61 s (~810 t/s) | 53,2 t/s | 4,26 |
| Seguimiento de 21.783 tokens (21.504 en caché) | 1,76 s | 46,0 t/s | 3,15 |
| Seguimiento de 22.027 tokens (21.760 en caché) | 1,55 s | 35,1 t/s | 2,00 |
| Seguimiento de 48.121 tokens (47.872 en caché) | 0,68 s | 59,1 t/s | 5,25 |
| Prompt de 55.247 tokens (54.272 en caché), 1.572 nuevos | 1,99 s | 33,8 t/s | 1,79 |
| Prompts cortos (35-150 tokens) | 0,17-0,51 s | 30,7-66,4 t/s | 0,5-5,3 |

En 196 peticiones registradas, el decode osciló entre 5,6 y 74,3 t/s (mediana 38,3), con la variación asociada a la longitud de borrador aceptada y a la ocupación del batch, no al tamaño del prompt.

## Requisitos de hardware

- Pesos: 98 GiB en 13 shards EXL3; requiere al menos ~100 GiB de almacenamiento y ~103-107 GiB de memoria para cargar modelo y drafter juntos.
- Hardware validado: NVIDIA DGX Spark (GB10, SM121) con memoria unificada; tras cargar el servidor quedan 5-9 GiB libres.
- Un tronco uniforme a 3,0 bpw (~+8,8 GB) no cabe junto al drafter en una GB10, según el autor.
- GPU discretas: no se han publicado pruebas en A100, H100 o RTX 4090; el tamaño de 98 GiB excede la VRAM de cualquier GPU consumer actual, por lo que no cabe en RTX 4090 ni similares.
- Despliegue: exllamav3 v1.6.7 con el port de ERNIE 5.5, servidor OpenAI-compatible incluido en `serving/`, imagen Docker con CUDA 13 (build inicial de 30-60 min, carga del modelo de 3-5 min).
- No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones para este formato EXL3.
- Latencia y throughput: ver tablas de benchmarks; prefill de ~810 t/s en primera petición y decode mediano de 38,3 t/s con DSpark.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| ERNIE-5.5-Flash-exl3-2.75bpw (esta ficha) | no disponible (MoE) | 262.144 (caché de prefijo) | Apache 2.0 | EXL3, exllamav3 | Cuantización 2,75 bpw con DSpark; validada en GB10 |
| baidu/ERNIE-5.5-Flash-Base | no disponible (MoE) | no disponible | Apache 2.0 (según repo) | safetensors / transformers | Modelo original sin cuantizar; referencia de calidad (PPL 2,379 en wikitext) |
| baidu/ERNIE-5.5-Flash-Preview | no disponible (MoE) | no disponible | Apache 2.0 | transformers | Variante preview del mismo modelo; origen de la cuantización |

No se dispone de datos de benchmarks comparativos frente a modelos de otros proveedores en la información proporcionada.

## Limitaciones y advertencias

- Solo texto: no hay capacidades de visión ni audio.
- Solo inglés y chino: no se declara soporte de castellano ni de otros idiomas, por lo que el rendimiento en español es incierto.
- Calidad degradada respecto al original: perplejidad 2,966 frente a 2,379 y acuerdo top-1 del 83,5%; el KLD medio de 0,338 indica divergencia notable en la distribución de salida.
- La evaluación de calidad se hizo únicamente sobre wikitext; el KLD en dominio conversacional y agéntico no se ha medido, según el propio autor.
- Riesgo de alucinación: no cuantificado en la información disponible; la degradación por cuantización puede amplificarlo en tareas de razonamiento largo.
- Restricción de memoria: en GB10 no cabe una variante uniforme a 3,0 bpw junto al drafter, lo que limita ajustes de calidad al alza.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base `baidu/ERNIE-5.5-Flash-Base` y de la variante Preview, ya que la model card enlaza a un fichero LICENSE separado.
- Dependencia fuerte de exllamav3 v1.6.7 y del port específico de ERNIE 5.5; no es portable a otros runners sin reconversión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.
- El servidor incluido requiere compilación de extensión CUDA (30-60 min) y una imagen con CUDA 13.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/msamon/ERNIE-5.5-Flash-exl3-2.75bpw
- Modelo base: https://huggingface.co/baidu/ERNIE-5.5-Flash-Base
- Modelo de origen de la cuantización: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview
- Blog de ERNIE 5.5 Flash Preview: https://ernie.baidu.com/release/ernie-5-5-flash-preview/
- Chat de ERNIE: https://ernie.baidu.com/web
- API Qianfan: https://cloud.baidu.com/product/qianfan.html
- Cuenta de X de Baidu ERNIE: https://x.com/Baidu_ERNIE
- Licencia del modelo base: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview/blob/main/LICENSE
- Papers referenciados en los tags: arXiv:2610.24766, arXiv:2610.17959, arXiv:2610.40577
