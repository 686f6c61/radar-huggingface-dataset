# millaguie/Hy4-flash-radiance-W4NL64-IQ8R-DFly2

## Resumen

Hy4-flash-radiance-W4NL64-IQ8R-DFly2 es una conversión cuantizada y reempaquetada del modelo `tencent/Hy4-flash`, publicada por el usuario millaguie (no por Tencent). No es un checkpoint de Transformers ni un GGUF: es un contenedor `.rad` de 140 GiB para el servidor de inferencia radiance 2.2.0, orientado exclusivamente a GPUs AMD con ROCm. El autor advierte explícitamente de que no es la release oficial de Tencent y de que Tencent no lo respalda.

El modelo es de tipo MoE (mixture of experts) con 512 expertos enrutados por capa a lo largo de 41 capas, y conserva la arquitectura del modelo base: atención MLA, un drafter de decodificación especulativa DFly2 de profundidad 5 y tablas Engram en 4 capas. La conversión aplica GPTQ de 4 bits con codebook `w4nl64` (escala E4M3 por cada 64 pesos y rotación Hadamard de 128) a los expertos enrutados, IQ8R (int8 rotado) al tronco y al drafter, y códigos E4M3 a las tablas Engram, que pasan de 118 GiB en BF16 a 59 GiB.

Es relevante porque demuestra una ruta de despliegue de un MoE grande en hardware AMD de consumo profesional (2x Radeon AI PRO R9700 de 32 GB) mediante tiering de expertos entre VRAM y memoria de host, lectura de las tablas Engram desde NVMe y decodificación especulativa, con métricas publicadas de throughput y calidad (BFCL v4 non_live del 79,56 %). El contexto máximo declarado es de 65.536 tokens.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención MLA, drafter especulativo DFly2 y tablas Engram; contenedor `.rad` para radiance |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (MoE con 512 expertos enrutados por capa, 41 capas) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantización | Expertos enrutados: GPTQ 4 bits `w4nl64` (Hadamard 128, escala E4M3 por 64 pesos); tronco y drafter: IQ8R; tablas Engram: códigos E4M3 (1 byte por valor); indexer, norms, router, hyper-connections, `lm_head` y `kv_a`: BF16 sin cambios |
| Idiomas soportados | no disponible (el corpus de calibración incluye conversaciones de agentes con tool use en español) |
| Licencia | tencent-hy-license (license_name: tencent-hy-license) |
| Formato de pesos | Contenedor radiance `.rad` de 140 GiB, dividido en 4 partes de menos de 50 GB; no es safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base `tencent/Hy4-flash` es un transformer MoE con atención MLA (multi-head latent attention) y 41 capas, cada una con 512 expertos enrutados más un experto compartido y una FFN densa. Sobre esa arquitectura, esta conversión introduce tres cambios de representación: los expertos enrutados se cuantizan con GPTQ a 4 bits usando el codebook `w4nl` con rotación Hadamard de 128 anchos y una escala E4M3 por cada 64 pesos; el tronco (proyecciones de atención, FFN densa, experto compartido y proyecciones latentes de los expertos) y las lineales del drafter DFly2 pasan a IQ8R (int8 rotado con búsqueda de escala, sin calibración); y las tablas Engram de 4 capas se almacenan como códigos E4M3 de un byte por valor, descartando las escalas de fila porque el RMSNorm posterior las cancela, lo que reduce su tamaño de 118 GiB a 59 GiB.

La calibración GPTQ se realizó con un corpus privado no distribuido de conversaciones de agentes con uso de herramientas en español y de BigCodeBench-hard. La conversión se hizo con `rad-convert` desde el checkpoint BF16 de la revisión `d88c9dfd96ba4f2e6b92adba0b8e8f1c8696f959`, y se añadieron las constantes hash de Engram que el checkpoint original no incluye (su código las calcula en carga). La plantilla de chat se reescribió sustituyendo sus 22 llamadas `.format(HYTK)` por concatenación para que el motor Jinja de radiance la renderice, manteniendo el mismo prompt. El contenedor no incluye la torre de visión.

## Capacidades

- Generación de texto y razonamiento en modalidad solo texto: el contenedor no incluye torre de visión.
- Tool calling y function calling: el modelo base está orientado a agentes con uso de herramientas; la calibración GPTQ se hizo con conversaciones de agentes con tool use.
- Razonamiento multi-paso y uso como agente: se evalúa con BFCL v4 `non_live`, con un 79,56 % de acierto.
- Decodificación especulativa con drafter DFly2 de profundidad 5 y ventana adaptativa, que acelera la decodificación sin alterar la salida con muestreo greedy.
- Control de esfuerzo de razonamiento mediante `reasoning-effort-map`: los niveles low, medium, xhigh y max se mapean a `high`, y minimal y none a `no_think`.
- Capacidades multilingües: no disponibles como lista cerrada; el corpus de calibración incluye español.
- Generación de código: el corpus de calibración incluye BigCodeBench-hard, pero no se publican resultados de HumanEval ni similares.

## Casos de uso

- Despliegue de agentes con tool calling en infraestructura AMD: el contenedor se sirve con radiance 2.2.0 sobre ROCm y expone una API HTTP; el 79,56 % en BFCL v4 `non_live` lo hace utilizable para orquestación de funciones en producción, siempre que se acepte la licencia de Tencent.
- Evaluación de cuantización agresiva en MoE: con una divergencia KL media de 0,186 frente a una pasada FP32 de los pesos originales y un 88,19 % de acuerdo en top-1, sirve para estudiar el impacto de GPTQ 4 bits más IQ8R en modelos de este tamaño.
- Servicio de chat multi-turno con contexto largo: la ventana de 65.536 tokens permite mantener conversaciones extensas o incluir documentación completa en el prompt, con un prefill medido de 3.036 tok/s a 5,7K tokens y 2.706 tok/s a 18K tokens.
- Procesamiento por lotes con concurrencia moderada: con 8 clientes simultáneos alcanza 425 tok/s agregados en decodificación (hasta 603 en algunas ejecuciones), adecuado para backends de asistentes con varias sesiones activas.
- Investigación sobre decodificación especulativa: el par con y sin DFly2 (57,7 frente a 109,8 tok/s con un cliente) permite medir el rendimiento del drafter en un MoE con expertos en tiering.
- Pruebas de despliegue con pesos fuera de VRAM: el modo `expert_tiered` con 39.000 MiB de pool de host y tablas Engram en disco sirve como banco de pruebas para servir modelos que no caben en la VRAM disponible.
- Generación de código asistida en pipelines internos: el ajuste de calibración con BigCodeBench-hard sugiere uso en tareas de código, aunque no hay benchmarks publicados que lo confirmen.

## Benchmarks y rendimiento

Medido en 2x AMD Radeon AI PRO R9700 (gfx1201, 32 GB cada una), tensor parallel 2, 64 GB de RAM de host, radiance 2.2.0, límite de 330 W por tarjeta, 256 tokens generados por petición.

| Métrica | Sin especulación | DFly2, ventana adaptativa |
|---|---|---|
| Decodificación, 1 cliente | 57,7 tok/s | 109,8 tok/s |
| Decodificación, 4 clientes (suma) | 196,2 tok/s | 341,3 tok/s |
| Decodificación, 8 clientes (suma) | 360,6 tok/s | 425 tok/s (425-603 entre ejecuciones) |
| Prefill, 5,7K tokens | 3.036 tok/s | 2.976 tok/s |
| Prefill, 18K tokens | 2.706 tok/s | no disponible |

| Calidad | Valor |
|---|---|
| BFCL v4 `non_live` | 79,56 % (8 clientes, DFly2 activo) |
| Divergencia KL media frente a FP32 de los pesos originales | 0,186 (10.851 posiciones, acuerdo top-1 del 88,19 %) |

Comparativa en la misma máquina:

| Implementación | Prefill | Decodificación, 1 cliente | 4 clientes | 8 clientes | BFCL v4 `non_live` |
|---|---|---|---|---|---|
| llama.cpp (PR #32517), GGUF Q4_K_M de AngelSlim, ajustado | 360 tok/s | 13,75 tok/s | no disponible | no disponible | no disponible |
| Este contenedor, DFly2 | 2.976 tok/s | 109,8 tok/s | 341,3 tok/s | 425 tok/s | 79,56 % |
| Qwen3.8-Flash-Next en radiance (todos los pesos en VRAM) | ~6.400 tok/s | 201 tok/s | 581 tok/s | 972 tok/s | 84,17 % |

## Requisitos de hardware

- VRAM: el modelo no cabe en 64 GB de VRAM; los expertos se reparten entre las tarjetas y memoria de host fijada, y las tablas Engram se leen desde una unidad NVMe.
- GPU: el autor lo ha validado con 2x AMD Radeon AI PRO R9700 (gfx1201, 32 GB cada una) con tensor parallel 2. Requiere ROCm y dispositivos `/dev/kfd` y `/dev/dri`.
- Memoria de host: 64 GB de RAM, con un pool de host configurado en 39.000 MiB para el tiering de expertos.
- Almacenamiento: el contenedor `.rad` ocupa 140 GiB y debe descargarse en cuatro partes, unirse y verificarse con SHA256SUMS; las tablas Engram se leen de disco, por lo que se recomienda NVMe.
- No cabe en GPUs de consumo convencionales: no hay datos de ejecución en RTX 4090 ni en GPUs NVIDIA, y el software (radiance) es específico para AMD.
- Despliegue: exclusivamente radiance 2.2.0 (imagen `stilldeadcode/radiance:2.2.0`) con los plugins de `millaguie/radiance-hy4flash` compilados contra esa versión; sin los plugins, radiance rechaza el archivo. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Configuración clave: `tp: 2`, `placement: expert_tiered`, `host-pool-mib: 39000`, `ngram-placement: disk`, `max-model-len: 65536`, `max-num-seqs: 8`, `num-speculative-tokens: 5`, `draft-window: adaptive`, `RADIANCE_AQL_CHAIN_FENCE=1`.
- Throughput y latencia: ver la tabla de benchmarks; la decodificación con un cliente pasa de 57,7 a 109,8 tok/s al activar DFly2.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este contenedor (Hy4-flash cuantizado) | MoE, 512 expertos/capa, 41 capas; total no disponible | 65.536 | 109,8 tok/s a 1 cliente; BFCL v4 non_live 79,56 % | tencent-hy-license | Contenedor `.rad` de 140 GiB, requiere radiance y plugins |
| tencent/Hy4-flash (original BF16) | mismo modelo base | no disponible | no disponible en la información | tencent-hy-license | Hugging Face, pesos BF16 |
| Qwen3.8-Flash-Next en radiance | no disponible | no disponible | 201 tok/s a 1 cliente; BFCL v4 non_live 84,17 % | no disponible | radiance, todos los pesos en VRAM |
| Hy4-flash en llama.cpp (GGUF Q4_K_M de AngelSlim, PR #32517) | mismo modelo base | no disponible | 13,75 tok/s a 1 cliente; prefill 360 tok/s | tencent-hy-license | GGUF, llama.cpp |

## Limitaciones y advertencias

- No es la release oficial de Tencent: es una conversión de terceros y Tencent no la respalda; la licencia tencent-hy-license condiciona el uso comercial y debe revisarse antes de producción.
- Solo texto: el contenedor no incluye la torre de visión del modelo base.
- Requiere software muy específico: radiance 2.2.0 más los plugins de Hy4-flash compilados a mano; sin ellos el archivo no se carga. No hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Solo AMD/ROCm: no hay ruta documentada para NVIDIA ni para GPUs de consumo; el modelo no cabe en 64 GB de VRAM y depende de tiering a host y de lectura de Engram desde NVMe.
- Calidad degradada respecto al BF16 original: divergencia KL media de 0,186 y acuerdo top-1 del 88,19 % frente a una pasada FP32; el impacto es mayor en tareas sensibles a la precisión.
- Riesgo de alucinación inherente al modelo base; no se publican evaluaciones de sesgo, toxicidad ni robustez en la información disponible.
- Idiomas soportados no documentados; la calibración GPTQ usó un corpus privado en español y BigCodeBench-hard, no distribuido, lo que limita la reproducibilidad.
- La plantilla de chat fue reescrita (22 llamadas `.format(HYTK)` convertidas en concatenación); aunque el prompt es el mismo, conviene validar la salida en producción.
- El rendimiento con 8 clientes varía entre ejecuciones (425 a 603 tok/s), lo que indica variabilidad en el tiering y en la lectura desde disco.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/millaguie/Hy4-flash-radiance-W4NL64-IQ8R-DFly2
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Repositorio de plugins Hy4-flash para radiance: https://github.com/millaguie/radiance-hy4flash
- Instrucciones de ejecución: https://github.com/millaguie/radiance-hy4flash#how-to-run-it
- Servidor radiance: https://codeberg.org/StillDeadcode/radiance
- Imagen Docker: `stilldeadcode/radiance:2.2.0`
