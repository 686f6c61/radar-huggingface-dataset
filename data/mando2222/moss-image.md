# mando2222/moss-image

## Resumen

MOSS-Image (TTNN · Blackhole) es un port del modelo de difusión texto-a-imagen OpenMOSS MOSS-Image, empaquetado por el usuario mando2222 para ejecutarse en una única tarjeta Tenstorrent Blackhole p150 usando exclusivamente `ttnn` (sin árbol de fuentes de tt-metal ni vLLM). No es un modelo nuevo: el checkpoint de pesos es `OpenMOSS-Team/MOSS-Image-Base` (~26 GB en bf16) y lo que se distribuye es un bundle v6 "thin" de `tt-dit-server` que `tt-model pull` materializa en un venv hermético y `tt-model serve` expone como API HTTP de imágenes.

Técnicamente combina un DiT de flow-matching de ~5B parámetros con 42 capas y atención single-stream in-context, un codificador de texto híbrido Qwen3.5-9B con Gated-DeltaNet y un decodificador VAE basado en FLUX.2 small. La relevancia es de infraestructura: demuestra la ejecución de un pipeline de difusión completo (text encoder, transformer y VAE) sobre aceleradores Tenstorrent, incluyendo decodificación VAE en dispositivo y tensor-parallel opcional del DiT sobre mallas `1×N`.

Su estado es explícitamente experimental ("community bring-up", no verificado por Tenstorrent), con 0 descargas y 0 likes en el momento de la consulta, licencia Apache 2.0 y soporte únicamente bf16 (sin build cuantizado).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT de flow-matching (~5B, single-stream in-context, 42 capas) + codificador de texto híbrido Qwen3.5-9B Gated-DeltaNet + VAE decoder FLUX.2 small |
| Parametros totales | No declarado de forma agregada; DiT ~5B y codificador de texto ~9B segun la model card (~26 GB de pesos en bf16) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible: modelo de difusion de imagen, sin ventana de contexto de tokens; la API es orientada a imagen |
| Tipos de cuantizacion | Solo bf16; no existe build cuantizado |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | Pesos originales del checkpoint base (`OpenMOSS-Team/MOSS-Image-Base`, bf16, ~26 GB) descargados en la cache HF del bundle; empaquetado como bundle v6 "thin" de `tt-dit-server` con `ttnn==0.80.0` |
| Hardware objetivo | 1x Tenstorrent Blackhole p150 (por defecto); malla `1x2` / `1x4` opcional |
| Resoluciones validadas | 256x256, 512x512, 1024x1024 y 1344x768 (no cuadrada) |

## Arquitectura y entrenamiento

El componente generativo es un Diffusion Transformer con formulación de flow-matching, 42 capas y atención single-stream in-context, de aproximadamente 5B parámetros. El texto se codifica con un modelo híbrido Qwen3.5-9B que incorpora capas Gated-DeltaNet (atención lineal con estado recurrente) junto a mecanismos de atención habituales; el decoder latente es el VAE "small" de FLUX.2. Sobre esta base, MOSS-Image soporta generación controlada por layout mediante prompts en JSON estructurado, además de generación texto-a-imagen convencional.

El port reimplementa las tres etapas en `ttnn==0.80.0` (el runtime TT-Metalium viaja dentro del wheel de ttnn), sin instalar tt-metal en el host. El VAE se decodifica en dispositivo por defecto y se valida contra el decoder fp32 de diffusers del host; existe un modo host (`MOSS_VAE_DEVICE=0`). El DiT admite tensor-parallel opcional vía `MOSS_MESH=1x2`/`1x4` con malla `FABRIC_1D` (`TtMossImageTransformerTP`), mientras el text encoder se ejecuta como fase single-die separada y el VAE permanece en host en ese modo. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO; esos datos corresponden al modelo base OpenMOSS y no se documentan aquí.

## Capacidades

- Generación texto-a-imagen con prompts en lenguaje natural, con parámetros de `height`, `width`, `num_inference_steps` y `seed`.
- Generación controlada por layout mediante los prompts JSON estructurados propios de MOSS-Image (según la model card, "layout-controlled generation").
- API HTTP asíncrona con trabajos (`POST /generate` → `job_id`) y progreso en vivo por etapa: encoding → loading_transformer → denoising → decoding → complete, con `current_step`, `progress_percent` y `eta_s`.
- Endpoint compatible con OpenAI: `POST /v1/images/generations` con `prompt` y `size` (modo bloqueante).
- Persistencia de trabajos públicos en PNG en disco, con listado (`GET /jobs`), descarga (`GET /images/{id}.png`) y borrado (`DELETE /jobs/{id}`).
- Trabajos efímeros privados mediante cabecera `X-Moss-Job-Token`: no listados, no persistidos, resultado en memoria con TTL de 900 s.
- Ejecución multi-chip opcional con tensor-parallel del DiT y reporte de `mesh_shape` en `/health`.
- No soporta tool calling, agentes, visión de entrada, audio ni modo "thinking": es un pipeline de difusión, sin tokens ni KV-cache.

## Casos de uso

- Evaluación de hardware Tenstorrent: servir el modelo en una Blackhole p150 para medir latencia real de un pipeline de difusión completo (text encoder + DiT + VAE) sin depender de GPUs NVIDIA; útil para equipos que valoran sustituir CUDA en inferencia de imagen.
- Generación de imágenes en despliegues on-premise o air-gapped: con SFPI pre-colocado en `<ttnn>/runtime/sfpi` y pesos predescargados (`tt-model pull --with-weights`), el servicio funciona sin red externa, algo relevante en entornos con requisitos de soberanía de datos.
- Integración en pipelines existentes de imagen: el endpoint compatible con OpenAI permite sustituir un backend de generación por este servicio sin reescribir el cliente, usando `size` y prompts estándar.
- Composición controlada por layout: uso de prompts JSON estructurados para generar escenas con disposición de elementos especificada, útil en prototipado de maquetas y assets de investigación.
- Generación por lotes con throughput agregado: activando `MOSS_MESH=1x4` sobre una caja de 4 Blackhole se declara 2,86x de aceleración extremo a extremo frente a una sola tarjeta, con PCC ≥0,987 respecto a la línea base single-chip.
- Validación de ports y regresiones numéricas: los informes de PCC por etapa (text encoder 0,9997; DiT 42 capas 0,99986; imagen final 0,99735) sirven como referencia para verificar implementaciones propias en `ttnn`.
- Prototipado de APIs de imagen con cargas privadas: el modo de trabajos efímeros con token y TTL de 900 s encaja en demos internas donde no debe quedar rastro en disco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni métricas tipo FID/CLIP en la model card). Los únicos datos numéricos son métricas de fidelidad numérica frente a referencias y latencias medidas en una Blackhole p150 (node4, `ttnn==0.80.0`, bf16):

| Metrica | Valor |
|---|---|
| PCC imagen extremo a extremo vs referencia CPU (256², 4 pasos) | 0,99735 |
| PCC `last_hidden_state` del text encoder vs referencia HF | 0,9997 |
| PCC forward completo del DiT (42 capas) vs referencia | 0,99986 |
| PCC VAE en dispositivo vs VAE fp32 host (256² y 512²) | 0,99994 (MAD ~1,3e-3) |
| PCC VAE en dispositivo vs host (1024² y 1344x768) | 1,0000 |
| Latencia 256² / 4 pasos | ~25 s |
| Latencia 1024² / 50 pasos | ~235 s |
| Serve en caliente, 256² / 4 pasos | ~12,5 s |
| Decodificacion VAE 1024² | ~1,4 s en dispositivo vs ~6,6 s en host |
| Aceleracion multi-chip (4 chips, DiT tensor-parallel) | 2,86x extremo a extremo, PCC ≥0,987 vs single-chip |

## Requisitos de hardware

- Acelerador: 1x Tenstorrent Blackhole p150 con firmware y driver; ruta single-chip validada por defecto (`MOSS_MESH=1x1`, `ttnn.open_device`).
- Memoria: pesos bf16 de ~26 GB; no hay versión cuantizada, por lo que no es posible reducir huella por cuantización.
- Multi-chip opcional: malla `1x2` o `1x4` con `FABRIC_1D`; el llamante debe reservar el lease de N chips y fijar `TT_VISIBLE_DEVICES` exactamente a esos dies.
- No cabe en GPU de consumo: no se distribuye backend CUDA/MPS; el bundle depende de `ttnn==0.80.0` sobre Blackhole. El VAE puede ejecutarse en host (`MOSS_VAE_DEVICE=0`) como alternativa.
- Despliegue: `pip install git+https://github.com/tenstorrent/tt-model-manager`, luego `tt-model pull mando2222/moss-image` y `tt-model serve mando2222/moss-image`; el servidor es una app ASGI (uvicorn) en `0.0.0.0:$PORT` (por defecto 8000). No se contemplan vLLM, llama.cpp, Ollama ni TGI.
- Primer arranque: aprovisiona SFPI por red y calienta kernels JIT antes de registrar `Application startup complete`; los arranques posteriores son rápidos.
- Throughput y latencia: ~25 s por imagen a 256²/4 pasos y ~235 s a 1024²/50 pasos en una p150; ~12,5 s en caliente a 256²/4 pasos. Con 4 chips, 2,86x de mejora extremo a extremo.

## Comparativa con modelos similares

No hay datos comparativos de otros modelos en la información proporcionada (ni parámetros, ni contexto, ni benchmarks de terceros). La única comparación documentada es frente al checkpoint original del que deriva:

| Aspecto | mando2222/moss-image (este port) | OpenMOSS-Team/MOSS-Image-Base |
|---|---|---|
| Naturaleza | Repackaging ejecutable en Tenstorrent Blackhole p150 | Checkpoint de pesos del modelo original |
| Pesos | Referencia al base (~26 GB bf16) en cache HF del bundle | ~26 GB bf16 |
| Backend | `ttnn==0.80.0`, sin tt-metal en host ni vLLM | No especificado en la informacion disponible |
| API | HTTP de imagenes: `/generate`, `/jobs`, `/images`, `/v1/images/generations` | No disponible |
| Multi-chip | Tensor-parallel opcional `1x2` / `1x4` (2,86x a 4 chips) | No disponible |
| Licencia | Apache 2.0 | Apache 2.0 |
| Estado | Experimental, no verificado por Tenstorrent; 0 descargas y 0 likes | No disponible |

Frente a alternativas de difusión como FLUX.1, FLUX.2 o Stable Diffusion 3: no disponible (la model card solo menciona FLUX.2 small como origen del VAE, sin datos comparativos de calidad, parámetros o contexto).

## Limitaciones y advertencias

- Estado experimental: "community bring-up", no verificado por Tenstorrent; `tt-model package-thin` (v6 thin) está marcado como BETA upstream.
- Solo bf16: no existe build cuantizado, lo que fija el requisito de memoria en ~26 GB de pesos y descarta despliegues de baja huella.
- Dependencia de red en el primer arranque: SFPI se descarga una vez; un host air-gapped debe pre-colocar `<ttnn>/runtime/sfpi` manualmente.
- La ruta multi-chip exige gestión externa de leases y un `TT_VISIBLE_DEVICES` correctamente delimitado; un mal aislamiento puede provocar conflictos entre despliegues.
- El VAE en dispositivo fue validado a 256², 512², 1024² y 1344x768; la model card referencia un bug previo de corrupción a alta resolución (preprocesado de pesos de convolución dependiente de la forma de entrada y una malla fija de group-norm) que se declara corregido, pero no se documentan validaciones en otras resoluciones o relaciones de aspecto.
- Trabajos privados con TTL de 900 s: resultados en memoria que se pierden al expirar, no aptos para procesos de larga duración.
- Sin datos de sesgos, composición del dataset ni evaluación de calidad de imagen (FID, CLIP, alineación con el prompt): no es posible valorar riesgo de sesgo demográfico, estilos infrarepresentados ni fidelidad semántica. Toda afirmación al respecto sería especulativa.
- Riesgo de alucinación en sentido amplio: al no haber métricas de adherencia al prompt, no se puede garantizar que la imagen generada respete instrucciones complejas o layouts JSON detallados.
- Idiomas soportados no declarados: se desconoce el comportamiento con prompts en castellano; conviene validar antes de producción.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y sus pesos conservan su propia licencia (Apache 2.0 según la model card) y este port no añade garantías; las marcas Tenstorrent y OpenMOSS no están verificadas por el autor del port.
- Sin benchmarks publicados: la única evidencia de calidad es la fidelidad numérica (PCC) frente a la referencia, no la calidad perceptual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mando2222/moss-image
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Repositorio de `tt-model` (tt-model-manager): https://github.com/tenstorrent/tt-model-manager
- Documentación de la API HTTP: `API_SPEC.md` en el repositorio companion / pestaña Discussions del modelo (no se proporciona URL directa).
- No se han encontrado enlaces adicionales relevantes (papers, blogs, demos) en la búsqueda web realizada.
