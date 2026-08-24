# shisa-ai/Qwen3.8-27B-Q4_K_M-DMS-W8192

## Resumen

Este repositorio no contiene un modelo de lenguaje completo, sino un *sidecar* de compresión de caché KV basado en Dynamic Memory Sparsification (DMS), desarrollado por shisa-ai para el modelo Qwen3.8-27B cuantizado a Q4_K_M. El sidecar, de solo 655.640 bytes en BF16, se entrena contra el GGUF exacto de unsloth (`Qwen3.8-27B-Q4_K_M.gguf`, SHA-256 `7e78da5d...`) y se ejecuta mediante el motor hipEngine, que implementa los kernels ROCm necesarios para la inferencia compacta.

La relevancia de esta pieza radica en que reduce el payload de atención completa de 8,000 GiB a 4,250 GiB a 128K de contexto (una compresión de 1,882225x) sin degradación medible de calidad: el KL máximo frente al teacher denso es de 0,002899 y el acuerdo top-1 es del 100% en las categorías evaluadas. La latencia de decodificación incluso mejora ligeramente (136,27 ms/token frente a 137,43 ms/token del control denso). Está pensado para desplegar Qwen3.8-27B en hardware con memoria limitada, especialmente en GPUs ROCm como la Radeon 8060S integrada en el AMD Ryzen AI Max+ PRO 395.

El sidecar se vincula de forma estricta a un artefacto GGUF concreto mediante hash SHA-256; no contiene pesos del modelo objetivo y no es transferible a otras cuantizaciones sin recalificación. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sidecar DMS lineal (predictor por capa/cabeza) sobre Qwen3.8-27B (arquitectura `qwen35_dense_hybrid`) |
| Parametros totales | 655.640 bytes BF16 (sidecar); el modelo base tiene 27B parametros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 y 131.072 tokens (contextos calificados) |
| Tipos de cuantizacion | No aplica al sidecar (BF16); se acopla al GGUF Q4_K_M del modelo base |
| Idiomas soportados | No disponible (el modelo base Qwen3.8-27B soporta multiples idiomas, pero el sidecar no especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | Sidecar BF16 (tensores `weight` [16,4,5120] y `bias` [16,4]); se integra con GGUF via hipEngine |

## Arquitectura y entrenamiento

El sidecar implementa un predictor lineal por capa de atención completa y por cabeza KV. Para cada capa `l` y cabeza `h`, calcula una puntuación `score[l,h] = dot(weight[l,h], x) + bias[l,h]` sobre la fila oculta normalizada pre-Q (`post_attn_rmsnorm_pre_q_projection`), y decide la expulsión si `score[l,h] * 1.0 - 0.012540675699710846 > 0`. El modelo base Qwen3.8-27B tiene 16 capas de atención completa (físicas 3, 7, 11, ..., 63), 24 cabezas Q, 4 cabezas KV y dimensión de cabeza 256.

El entrenamiento se realizó contra el GGUF Q4_K_M exacto de unsloth, usando un teacher denso BF16-KV residente con la misma cuantización. Se siguió el protocolo de calidad: categorías de código, inglés, japonés y mixto japonés/inglés, con ocho pasos de decodificación por categoría, aceptando solo si el KL máximo <= 0,05 y el acuerdo top-1 >= 90% en todas las categorías. La validación incluyó un corpus sellado de 32K y otro de 128K disjunto de la fuente de entrenamiento. El prefill usa puntuaciones aprendidas como rangos deterministas por capa/cabeza, aplica un presupuesto CR2 histórico exacto y protege los 8.192 tokens más recientes. La decodificación evalúa el sidecar en el dispositivo, aplica expiración de ventana y añade los K/V supervivientes a extentos compactos por cabeza.

El kernel de atención compacta asigna un token compacto por wave, distribuye el producto punto K de 256 dimensiones sobre 32 lanes y comparte las cargas K entre las seis cabezas de consulta mapeadas a una cabeza KV. Con 69.641 filas vivas por cabeza KV, el productor mediano es de 1,422 ms/capa, 9,792x por debajo del productor agrupado anterior. El kernel usa 1.092 workgroups local256, 56 VGPR, 12.800 bytes de LDS y cero scratch, seguido de un reductor dividido de 0,095 ms.

## Capacidades

- Compresion de caché KV: reduce el payload de atención completa de 8,000 GiB a 4,250 GiB a 128K de contexto (1,882225x) y de 1,599688x a 32K.
- Preservacion de calidad: KL maximo de 0,002899 y media de 0,000321 frente al teacher denso; acuerdo top-1 del 100% (32/32) en validacion.
- Latencia de decodificacion mejorada: 136,27 ms/token frente a 137,43 ms/token del control denso BF16-KV (7,34 tok/s frente a 7,28 tok/s).
- Integracion con hipEngine: requiere el motor `shisa-ai/hipEngine` commit `6d291bf16` o descendiente, con backend `hip_gfx1151` (ROCm 7.15.0).
- Compatibilidad con FastDMS: el sidecar sigue el contrato de metadatos y semantica de expiracion de `shisa-ai/FastDMS`, aunque usa un sidecar lineal externo en lugar del canal de consulta prestado.
- Vinculacion estricta de artefactos: `dms_metadata.json` verifica SHA-256 del GGUF, SHA-256 del sidecar, nombres/formas de tensores, mapa de capas fisicas, etapa de entrada del predictor y politica; cualquier discrepancia falla antes de la ejecucion.

## Casos de uso

- Despliegue de Qwen3.8-27B en GPUs con 16-24 GB de VRAM: la compresion de KV cache permite ejecutar el modelo cuantizado Q4_K_M con contexto de 128K en hardware que de otro modo no cabria, reduciendo el pico de memoria de KV de 8 GiB a 4,25 GiB.
- Inferencia de contexto largo en produccion: para aplicaciones de analisis de documentos extensos o agentes con historial prolongado, el sidecar mantiene la fidelidad (KL < 0,003) mientras libera memoria para otros buffers.
- Servicios de chat con ventana de 32K: a 32K, la compresion es de 1,599688x, con 1.311.296 filas vivas y un maximo de 20.489 filas por cabeza, adecuado para asistentes conversacionales con memoria amplia.
- Reduccion de costes de inferencia en servidores ROCm: al disminuir el footprint de KV, se pueden empaquetar mas solicitudes concurrentes en la misma GPU, mejorando el throughput agregado.
- Evaluacion de fidelidad de compresion: el protocolo de validacion (KL y top-1 por categoria) sirve como referencia para equipos que necesiten verificar que la compresion no altera las respuestas del modelo.
- Investigacion en compresion de KV cache: el sidecar y su metadata documentan un caso de uso real de DMS sobre un modelo hibrido denso, util como punto de partida para experimentos con otras cuantizaciones o arquitecturas.

## Benchmarks y rendimiento

La tabla siguiente resume las metricas publicadas en la model card, medidas el 2026-08-24 en AMD Ryzen AI Max+ PRO 395 / Radeon 8060S con ROCm 7.15.0. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para este sidecar, ya que no es un modelo generativo autonomo.

| Metrica | DMS | Denso BF16-KV (control) |
|---|---:|---:|
| Payload KV atencion completa (128K) | 4,250 GiB | 8,000 GiB |
| Reduccion de payload | 3,750 GiB / 1,882225x | 1,000x |
| Latencia mediana de decodificacion | 136,27 ms/token | 137,43 ms/token |
| Tasa de decodificacion reciproca | 7,34 tok/s | 7,28 tok/s |
| KL maximo / medio (teacher estricto) | 0,002899 / 0,000321 | referencia |
| Acuerdo top-1 (teacher estricto) | 32/32 (100%) | referencia |

Validacion de calidad por contexto:

| Contexto | Filas | KL max / medio | p95 / p99 KL | Top-1 | Filas vivas | Max filas/cabeza | CR vivo | KV BF16 compacto |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 32K | 32 | 0,003784 / 0,000333 | 0,000706 / 0,002856 | 100% | 1.311.296 | 20.489 | 1,599688x | 1.342.767.104 B |
| 128K | 32 | 0,002899 / 0,000321 | 0,001067 / 0,002419 | 100% | 4.457.024 | 69.641 | 1,882225x | 4.563.992.576 B |

## Requisitos de hardware

- VRAM estimada: el sidecar en si ocupa 655.640 bytes; la reduccion de KV cache a 128K ahorra 3,75 GiB frente al denso BF16. El modelo base Q4_K_M pesa 17,1 GB, por lo que el conjunto cabe en GPUs de 24 GB con contexto largo.
- GPU recomendada: AMD Radeon 8060S (integrada en Ryzen AI Max+ PRO 395) con ROCm 7.15.0, backend `hip_gfx1151`. Tambien es plausible en GPUs NVIDIA via FastDMS (CUDA), aunque la medicion publicada es exclusivamente ROCm.
- Compatibilidad con GPU consumer: si, en GPUs AMD con soporte ROCm y al menos 24 GB de VRAM para el modelo completo con contexto 128K; con contexto 32K podria caber en 16 GB.
- Opciones de despliegue: hipEngine (obligatorio para este sidecar), con soporte de FastDMS para la linea CUDA. No es compatible con vLLM, llama.cpp u Ollama directamente, ya que requiere el motor especifico.
- Latencia y throughput: 136,27 ms/token (7,34 tok/s) en la configuracion medida, excluyendo servidor HTTP y concurrencia. El productor de atencion compacta tiene una mediana de 1,422 ms/capa.

## Comparativa con modelos similares

| Aspecto | shisa-ai DMS sidecar | FastDMS (CUDA) | Denso BF16-KV (control) |
|---|---|---|---|
| Tipo | Sidecar de compresion KV | Implementacion de compresion KV | Referencia sin compresion |
| Reduccion de payload (128K) | 1,882225x | No disponible | 1,000x |
| Latencia (ms/token) | 136,27 | No disponible | 137,43 |
| KL maximo | 0,002899 | No disponible | Referencia |
| Backend | ROCm (hipEngine) | CUDA | Cualquiera |
| Licencia | Apache 2.0 | No disponible | Apache 2.0 (modelo base) |

No se dispone de comparativas publicas con otros sidecars DMS (p. ej., los de NVIDIA Model-Optimizer) en la informacion disponible.

## Limitaciones y advertencias

- El sidecar esta vinculado de forma estricta a un GGUF concreto (SHA-256 `7e78da5d...`); transferirlo a otra cuantizacion del mismo checkpoint es plausible pero no esta cualificado ni soportado.
- No contiene pesos del modelo objetivo; es un complemento que requiere el GGUF de unsloth y el motor hipEngine.
- La medicion de rendimiento se realizo en una unica plataforma (AMD Ryzen AI Max+ PRO 395 / Radeon 8060S, ROCm 7.15.0); los resultados pueden variar en otro hardware.
- La latencia reportada es de un solo token (c=1), excluyendo servidor HTTP y concurrencia; en produccion con multiples solicitudes el comportamiento puede diferir.
- El prefill escribe K/V densos temporales en BF16, que forman parte del pico de memoria; la reduccion efectiva solo se manifiesta en decodificacion.
- No se han publicado evaluaciones de sesgos, alucinacion o robustez del modelo base con este sidecar; la validacion se limita a KL y top-1 en cuatro categorias.
- Requiere ROCm 7.15.0 o superior y el backend `hip_gfx1151`; no hay soporte oficial para otras plataformas en esta version.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/shisa-ai/Qwen3.8-27B-Q4_K_M-DMS-W8192
- Paper DMS: https://arxiv.org/abs/2506.05345
- hipEngine (motor ROCm): https://github.com/shisa-ai/hipEngine
- FastDMS (implementacion CUDA): https://github.com/shisa-ai/FastDMS
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF de unsloth (artefacto vinculado): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Referencia de entrenamiento DMS de NVIDIA: https://github.com/NVIDIA/Model-Optimizer/tree/main/experimental/dms
