# Myric/Ripple-65B-Preview-APEX-GGUF

## Resumen

Ripple-65B-Preview-APEX-GGUF es un repositorio de cuantizacion publicado por el usuario Myric que empaqueta el *drafter* DFlash2 (borrador de decodificacion especulativa) del modelo denso Ripple-65B-Preview de ricursiveAI, junto con las notas de ejecucion y los parches necesarios para reproducir una evaluacion agentica completa en llama.cpp. No se trata de un modelo de lenguaje independiente, sino de un artefacto auxiliar (7,6 GB en BF16) cuyo proposito es acelerar la inferencia del modelo objetivo de 65B mediante decodificacion especulativa por bloques.

El modelo base, Ripple-65B-Preview, es un transformer denso de aproximadamente 65.000 millones de parametros (el repositorio declara 4.037.752.064 parametros en safetensors, cifra que corresponde al drafter, no al modelo objetivo). La relevancia de esta ficha radica en que documenta un caso practico de despliegue de un modelo grande en hardware de memoria unificada de gama workstation (DGX Spark / GB10, ~273 GB/s) y cuantifica con detalle el impacto real de la decodificacion especulativa: de 5,4 a 16,9 tokens por segundo en generacion de 512 tokens, un factor de 3,1x.

La licencia declarada es Apache 2.0 y el formato de pesos es GGUF, orientado a llama.cpp. El repositorio esta pensado para desarrolladores que necesiten reproducir el benchmark APEX o servir Ripple-65B con el drafter en produccion; incluye advertencias explicitas sobre cuantizaciones comunitarias defectuosas y sobre dos bugs de llama.cpp que requieren parcheo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter de decodificacion especulativa DFlash2 (block_size=16) sobre modelo objetivo transformer denso Ripple-65B-Preview |
| Parametros totales | 4.037.752.064 (drafter, segun safetensors); Ripple-65B-Preview ~65B (no verificado en la informacion disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens (configuracion de servicio `-c 65536`) |
| Tipos de cuantizacion | Drafter en BF16 (7,6 GB); modelo objetivo en Q4_K_M (38,8 GB); drafters preconvertidos Q4_0, Q4_K_M y Q8_0 en repo de terceros |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El artefacto central es un drafter DFlash2 convertido a GGUF desde `ricursiveAI/Ripple-65B-Preview-DFlash2` con `convert_hf_to_gguf.py` (build `7d7f02875`) usando el tokenizador de Ripple como directorio de modelo objetivo. Sus metadatos declaran `dflash.block_size=16`, `selector_top_k=32`, `selector_rank=256` y `target_layers=[1,20,39,58,77]`, es decir, el borrador engancha representaciones intermedias de cinco capas del modelo objetivo para proponer bloques de hasta 16 tokens que luego se verifican contra los logits del modelo grande.

El modelo objetivo es un transformer denso de 65B del que la informacion disponible no detalla composicion del dataset, numero de tokens de entrenamiento ni si hubo RLHF o DPO. La model card si aclara un rasgo relevante para el despliegue: Ripple no es un modelo con canal de razonamiento, por lo que debe servirse y evaluarse con el razonamiento desactivado. La innovacion tecnica documentada es la propia decodificacion especulativa por bloques con verificacion contra logits del objetivo, que en llama.cpp preserva la salida greedy del modelo grande.

## Capacidades

- Generacion de texto conversacional, segun el tag `conversational` del repositorio.
- Aceleracion de inferencia mediante decodificacion especulativa: el drafter propone hasta 16 tokens por bloque y el objetivo los verifica.
- Ejecucion de tareas agenticas multi-paso: el pack APEX se ejecuto con el harness de agente OpenCode 2, con 42 tareas y 253 tests superados.
- Integracion con llama.cpp mediante `--spec-type draft-dflash` y `--spec-draft-n-max`.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repositorio).
- Capacidades multilingues: no disponible.
- Vision, audio, tool calling nativo o modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de inferencia de Ripple-65B en hardware de memoria unificada: el drafter permite pasar de 5,4 a 16,9 t/s en generacion de 512 tokens, lo que hace viable servir un denso de 65B en una maquina con ~273 GB/s de ancho de banda.
- Reproduccion del benchmark APEX: el repositorio documenta la receta exacta (comando `llama-server`, parches y version de build) para repetir la evaluacion de 42 tareas agenticas con 253 tests.
- Evaluacion de cuantizaciones: las notas identifican que las conversiones comunitarias previas al PR #31692 generan salida basura, lo que sirve como guia para validar cualquier GGUF nuevo antes de publicarlo.
- Despliegue en pipelines de agentes con contexto largo: la configuracion de 65.536 tokens de contexto permite mantener historiales extensos en tareas de varios pasos, con un consumo medido de 203,6k tokens de entrada y 91,9k de salida en la suite completa.
- Prototipado en estaciones de trabajo con GPU consumer o workstation: el objetivo en Q4_K_M ocupa 38,8 GB y el drafter 7,6 GB, unos 46 GB totales, lo que encaja en equipos con 48 GB o mas de VRAM o memoria unificada.
- Investigacion sobre decodificacion especulativa: los datos de aceptacion (17,0% de posiciones aceptadas, runs medios de 2,7 a 4,7 tokens por verificacion) permiten calibrar y comparar drafters en condiciones reales de carga agentica.

## Benchmarks y rendimiento

Resultados del pack APEX con el harness OpenCode 2 sobre GB10 (tomados de la model card):

| Suite | Superados | Tests |
|---|---:|---:|
| general (25) | 25/25 | 25/25 |
| hard (5) | 5/5 | 59/59 |
| frontier (9) | 9/9 | 142/142 |
| tier4a (3) | 3/3 | 27/27 |
| **total** | **42/42** | **253/253** |

Rendimiento de decodificacion (generacion de 512 tokens):

| Configuracion | Tokens/s | Aceleracion |
|---|---:|---:|
| Sin drafter | 5,4 | 1,0x |
| n_max 4 | 13,7 | 2,5x |
| n_max 8 | 16,3 | 3,0x |
| n_max 16 | 16,9 | 3,1x |

En regimen sostenido durante el benchmark completo el modelo mantuvo ~8,5 t/s, con una tasa de aceptacion del 17,0% de posiciones y runs aceptados de 2,7 a 4,7 tokens por verificacion. No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: ~46 GB en total para la combinacion Q4_K_M (38,8 GB) mas drafter BF16 (7,6 GB).
- Hardware de referencia del autor: DGX Spark clase GB10 con ~273 GB/s de memoria unificada y 115 GiB disponibles.
- GPU recomendadas: no disponible de forma explicita; por capacidad de memoria encajan A100 80 GB, H100 80 GB y RTX 6000 Ada 48 GB. En consumer, solo GPUs con 48 GB o mas (RTX 4090 de 24 GB no es suficiente para la combinacion completa).
- Despliegue: llama.cpp build `7d7f02875` con `llama-server`, flags `-ngl 99 -ngld 99 --jinja -c 65536 --fit off --spec-type draft-dflash --spec-draft-n-max 16`.
- Parches necesarios: anadir `res->t_layer_inp[il] = inpL;` en `src/models/ricursive.cpp` y elevar el presupuesto DFLASH de `12×n_tensors` a `48×n_tensors` (minimo 4096) en `src/llama-context.cpp::graph_max_nodes`; ambos corregidos en el PR abierto #31904.
- Latencia y throughput: 5,4 t/s sin drafter y hasta 16,9 t/s con `n_max 16`; ~8,5 t/s sostenidos en carga agentica. El decode denso esta limitado por ancho de banda (~38,8 GB de pesos por pasada).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ripple-65B-Preview + DFlash2 (este) | ~65B denso + drafter 4,04B | 65.536 | 42/42 APEX; 16,9 t/s con drafter en GB10 | Apache 2.0 | GGUF en HF |
| Ripple-65B-Preview sin drafter | ~65B denso | 65.536 | 5,4 t/s en GB10 | Apache 2.0 | GGUF en HF |
| Cuantizaciones comunitarias previas al PR #31692 | ~65B denso | no disponible | Salida defectuosa (dot/newline streams) en llama.cpp mainline | Apache 2.0 | GGUF en HF (mrfakename, AtomicChat, DevQuasar) |
| Drafters preconvertidos de terceros (ashbash) | no disponible | no disponible | No evaluados en la informacion disponible | no disponible | GGUF Q4_0 / Q4_K_M / Q8_0 |

No se dispone de comparaciones con modelos de la misma categoria (otros densos de 65B con decodificacion especulativa) en la informacion proporcionada.

## Limitaciones y advertencias

- El drafter no es un modelo de lenguaje autonomo: no admite comprobaciones de perplejidad, KLD ni top-token, y solo funciona emparejado con Ripple-65B-Preview.
- Ripple no es un modelo con canal de razonamiento; servirlo con razonamiento activado degrada el comportamiento esperado.
- Las cuantizaciones comunitarias publicadas antes del PR #31692 (mrfakename, AtomicChat, DevQuasar) decodifican basura en llama.cpp mainline en CUDA y CPU pese a tener metadatos completos; deben evitarse.
- Requiere parchear dos bugs de llama.cpp (taps DFlash no registrados y presupuesto de nodos del grafo) o usar el PR #31904; sin ellos el primer decode aborta o falla la reserva del contexto de borrador.
- `--fit off` es necesario para evitar los bugs de medida #31610 y #31643.
- La tasa de aceptacion del drafter es baja (17,0% de posiciones), por lo que la aceleracion sostenida en carga agentica (~8,5 t/s) queda lejos del pico de 16,9 t/s.
- No hay datos de sesgos, idiomas soportados ni evaluaciones de calidad del modelo objetivo en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ha iniciado la puerta de calidad estandar para las cuantizaciones APEX del objetivo derivadas del BF16.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Myric/Ripple-65B-Preview-APEX-GGUF
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Drafter original: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-DFlash2
- Pack de benchmarks APEX: https://huggingface.co/Myric/apex-quant-benchmarks
- Cuantizacion Q4_K_M de referencia: https://huggingface.co/prithivMLmods/Ripple-65B-Preview-GGUF
- Drafters preconvertidos de terceros: https://huggingface.co/ashbash/Ripple-65B-Preview-DFlash2-GGUF
- PR de llama.cpp con los parches: https://github.com/ggml-org/llama.cpp/pull/31904
- PR de llama.cpp de conversion correcta: https://github.com/ggml-org/llama.cpp/pull/31692
