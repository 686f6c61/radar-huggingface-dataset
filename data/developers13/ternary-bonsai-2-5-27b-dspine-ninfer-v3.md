# Developers13/Ternary-Bonsai-2.5-27B-DSpine-NInfer-v3

## Resumen

Ternary-Bonsai-2.5-27B-DSpine-NInfer-v3 es un modelo borrador (draft model) para decodificacion especulativa, desarrollado por el usuario Developers13 y publicado en Hugging Face. No es un modelo generativo autonomo, sino un drafter especializado que acelera la inferencia del modelo objetivo PrismML Ternary Bonsai 2.5 27B, un modelo de 27.000 millones de parametros con pesos ternarios (1,75 bits por peso en base de Hadamard por bloques). El drafter se ha destilado desde tencent/Qwen3.8-27B-DSpine-b16 sobre generaciones on-policy y trayectorias de tool calling de SWE, y se distribuye en formato NInfer v3 (`.ninfer`) con cuantizacion mixta Q4/Q8.

El problema que resuelve es concreto: el drafter original de Qwen3.8, cargado zero-shot contra Bonsai 2.5, solo alcanza una tasa de aceptacion de entre el 12,9 % y el 19,0 % en texto general y requiere 2,27 GiB de VRAM en Q8, lo que impide combinar `--adaptive-mtp` con una cache KV de 116K en GPUs de 12 GB. Esta version destilada y cuantizada reduce el peso en VRAM a 1,61 GiB (variante `q4mid`), mantiene 1,21 GiB libres en una RTX 4070 de 12 GB a 116K de contexto y mejora la velocidad de decodificacion un 4,4 % sobre el MTP3 integrado de Bonsai 2.5 en SPEED-Bench, con hasta 212,3 tok/s en sondas de tool calling de SWE.

La relevancia actual esta en la eficiencia de despliegue: permite ejecutar un modelo ternario de 27B con contexto de 116K y decodificacion especulativa en hardware de consumo, algo que hasta ahora requeria GPUs de 16 GB o mas. La licencia es Apache 2.0 y el repositorio ocupa 5,8 GB, aunque los artefactos individuales pesan entre 1,5 y 2,3 GiB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSpine (drafter de decodificacion especulativa sobre transformer; detalles internos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 116.000 tokens (configuracion de referencia en RTX 4070 12 GB) |
| Tipos de cuantizacion | `q4mid` (MLP en `q4_g64_fp16`, atencion y feature_projection en `q8_g32_fp16`, bridges en `bf16`); `q4` (variante mas agresiva); `q8` (stock `dspine_q8`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (NInfer-all v3) |

## Arquitectura y entrenamiento

El modelo es un drafter DSpine, un cabezal de decodificacion especulativa que predice tokens candidatos para que el modelo objetivo los verifique en paralelo. DSpine consume los hidden states de cinco capas objetivo del modelo base (mapeados mediante una `feature_projection`) y genera borradores de hasta 7 tokens (`--draft-tokens 7`) con un modo `--adaptive-mtp` que ajusta dinamicamente la longitud del borrador. La innovacion clave respecto al drafter original de Qwen3.8 es la adaptacion al cambio de distribucion de activaciones que introducen los pesos ternarios de Bonsai 2.5 en base de Hadamard por bloques.

El entrenamiento consistio en destilar desde tencent/Qwen3.8-27B-DSpine-b16 hacia el modelo Bonsai 2.5 27B desempaquetado, usando generaciones on-policy y trayectorias de tool calling de SWE. Posteriormente se aplico una cuantizacion selectiva mixta Q4/Q8: las capas MLP (`gate`, `up`, `down`) se cuantizan a Q4 con grupo 64 y escala fp16, mientras que `feature_projection`, las proyecciones de query y output de atencion se mantienen en Q8 con grupo 32, y los bridges en bf16. Esta decision de diseno preserva la precision en las rutas criticas para la aceptacion especulativa y solo anade 0,12 GiB respecto a la variante `q4` pura.

## Capacidades

- Generacion de borradores especulativos para decodificacion acelerada del modelo objetivo Ternary Bonsai 2.5 27B.
- Soporte de tool calling nativo mediante `<tool_call>` con `enable_thinking=true`, entrenado sobre trayectorias de SWE.
- Compatibilidad con flujos agenticos de multiples pasos (probes con `claudecode`, `openhands`, `ms_scale_res0`).
- Ajuste dinamico de la longitud del borrador mediante `--adaptive-mtp`.
- Funcionamiento con cache KV cuantizada (`rk4v4-e8`) para maximizar contexto en VRAM limitada.
- No genera texto de forma autonoma: requiere el modelo objetivo y el runtime NInfer-all.

## Casos de uso

- Despliegue de un modelo de 27B con contexto de 116K en GPUs de 12 GB: el drafter `q4mid` ocupa 1,61 GiB y deja 1,21 GiB libres en una RTX 4070, permitiendo combinar contexto largo con decodificacion especulativa donde antes no cabia.
- Aceleracion de asistentes de codigo en produccion: las sondas de tool calling de SWE alcanzan 212,3 tok/s con `r2-q4mid`, un 47 % mas que el MTP3 integrado, lo que reduce la latencia percibida en autocompletado y edicion agentica.
- Pipelines de CI/CD con agentes de codigo: la tasa de aceptacion del 77,2-79,6 % en trayectorias de tool calling unseen permite ejecutar agentes tipo Claude Code u OpenHands en hardware de consumo.
- Razonamiento matematico interactivo: la categoria `math` mejora de 145,8 a 166,3 tok/s (+14,1 %) en decodificacion activa, adecuada para tutores o resolutores paso a paso.
- Procesamiento de documentos largos y RAG: con 116K de contexto y 158,6 tok/s en la categoria `rag`, sirve para resumir o consultar corpus extensos en una sola pasada.
- Atencion al cliente multi-turno: la mejora del 10,6 % en `humanities` y del 5,7 % en `multilingual` favorece conversaciones largas con cambios de idioma.
- Investigacion en decodificacion especulativa: los tres artefactos (`q4`, `q4mid`, `q8`) permiten estudiar el compromiso entre VRAM, tasa de aceptacion y throughput en distintos presupuestos de memoria.

## Benchmarks y rendimiento

Mediciones en RTX 4070 12 GB con modelo objetivo `Ternary-Bonsai-2.5-27B-PTQ1_0`, `CTX=116000`, `--draft-tokens 7 --adaptive-mtp`.

SPEED-Bench qualitative_s60 (60 conversaciones, 78-80 peticiones, `max_tokens=1024`):

| Metrica | MTP3 / R1 Q4 | r2-q4 | r2-q4mid | r2-q4mid vs R1 Q4 |
|---|---:|---:|---:|---:|
| Throughput cliente (tok/s) | 100,04 | 101,40 | 104,11 | +4,1 % |
| Decode activo medio (tok/s/usuario) | 118,21 | 120,23 | 123,37 | +4,4 % |
| Decode respuesta completa (tok/s/usuario) | 117,75 | 119,93 | 123,03 | +4,5 % |
| Latencia inter-token media / p50 (ms) | 9,00 / 8,84 | 8,85 / 8,93 | 8,64 / 8,69 | -4,0 % |
| VRAM libre a CTX=116000 | 1,33 GiB | 1,33 GiB | 1,21 GiB | -0,12 GiB |

Decode activo por categoria (tok/s/usuario, `r2-q4mid` frente a MTP3): math 166,3 (+14,1 %), humanities 95,4 (+10,6 %), multilingual 135,7 (+5,7 %), qa 111,3 (+5,3 %), stem 102,2 (+4,5 %), roleplay 93,1 (+2,7 %), writing 111,1 (+1,1 %), rag 158,6 (+0,9 %), reasoning 116,1 (-1,9 %), coding 112,3 (-3,6 %).

Sondas agenticas de tool calling de SWE:

| Conjunto | Configuracion | Throughput | Aceptacion |
|---|---|---:|---:|
| 3 probes | MTP3 (`d3`) | 144,1 tok/s | 82,2 % |
| 3 probes | r2-q4mid (`d7 --adaptive-mtp`) | 212,3 tok/s | 79,6 % |
| 6 probes unseen | r2-q4 (`d7 --adaptive-mtp`) | 222,4 tok/s | 79,6 % |
| 6 probes unseen | r2-q4mid (`d7 --adaptive-mtp`) | 213,2 tok/s | 77,2 % |

Demo en RTX 4070 12 GB: 5.481 tokens generados en 35 s (154,63 tok/s), pico de 157,7 tok/s durante razonamiento y codigo Python.

## Requisitos de hardware

- VRAM del drafter: 1,49 GiB (`q4`), 1,61 GiB (`q4mid`, recomendado) o 2,27 GiB (`q8`).
- VRAM total de referencia: 12 GB (RTX 4070) con modelo objetivo ternario y cache KV `rk4v4-e8` a 116K de contexto, dejando 1,21 GiB libres con `q4mid`.
- GPUs recomendadas: RTX 4070 12 GB o superior para `q4`/`q4mid`; 16 GB o mas para la variante `q8`.
- Cabe en GPU de consumo: si, en RTX 4070 12 GB y modelos con al menos 12 GB de VRAM.
- Despliegue: runtime NInfer-all (imagen `ghcr.io/iamwavecut/ninfer-all:cuda13.4`), comando `ninfer-serve` con `--spec dspine` y `--draft-model`.
- Rendimiento: 104,11 tok/s de cliente en SPEED-Bench, 123,37 tok/s de decode activo y hasta 212-222 tok/s en sondas de tool calling.

## Comparativa con modelos similares

| Modelo | Tipo | VRAM drafter | Throughput SWE | Aceptacion | Licencia |
|---|---|---:|---:|---:|---|
| Ternary-Bonsai-2.5-27B-DSpine r2-q4mid (este) | DSpine destilado, Q4/Q8 mixto | 1,61 GiB | 212,3 tok/s | 79,6 % | Apache 2.0 |
| tencent/Qwen3.8-27B-DSpine-b16 (zero-shot) | DSpine stock | 2,27 GiB (Q8) | no disponible | 12,9-19,0 % (texto general) | no disponible |
| MTP3 integrado en Bonsai 2.5 | MTP nativo del modelo objetivo | integrado | 144,1 tok/s | 82,2 % | Apache 2.0 (Bonsai) |
| Bonsai-2.5-27B-DSpine r2-q4 | DSpine destilado, Q4 | 1,49 GiB | 222,4 tok/s | 79,6 % (unseen) | Apache 2.0 |

## Limitaciones y advertencias

- No es un modelo autonomo: solo funciona como drafter junto al modelo objetivo Ternary Bonsai 2.5 27B y el runtime NInfer-all; no puede usarse con otras arquitecturas sin reentrenamiento.
- La tasa de aceptacion es sensible al dominio: en `coding` y `reasoning` el decode activo cae un 3,6 % y un 1,9 % respectivamente frente a MTP3.
- La variante `q4` es mas rapida en sondas unseen (222,4 frente a 213,2 tok/s) pero con menor margen de VRAM; la eleccion depende del presupuesto de memoria.
- El contexto de 116K se ha validado con cache KV cuantizada `rk4v4-e8`; usar precision mayor reduce el contexto maximo en GPUs de 12 GB.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay validacion independiente de la comunidad.
- No se han publicado datos sobre sesgos, alucinacion o cobertura idiomatica del drafter; los idiomas soportados figuran como no disponibles.
- El rendimiento se ha medido exclusivamente en RTX 4070 12 GB; el comportamiento en otras GPUs no esta documentado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el runtime tienen sus propias condiciones que deben verificarse por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Developers13/Ternary-Bonsai-2.5-27B-DSpine-NInfer-v3
- Modelo base ternario (GGUF): https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-GGUF
- Modelo base DSpine: https://huggingface.co/tencent/Qwen3.8-27B-DSpine-b16
- Modelo objetivo NInfer v3: https://huggingface.co/WaveCut/Ternary-Bonsai-2.5-27B-PTQ1_0-NInfer-v3
- Runtime NInfer-all: https://github.com/iamwavecut/ninfer-all
- Demo en video: https://huggingface.co/Developers13/Ternary-Bonsai-2.5-27B-DSpine-NInfer-v3/resolve/main/assets/demo_4070.mp4
- Paper de referencia: arXiv:2609.36173 (segun los tags del repositorio)
