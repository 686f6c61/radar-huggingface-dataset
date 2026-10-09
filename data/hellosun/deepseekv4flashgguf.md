# HelloSun/deepseekv4flashgguf

## Resumen

`HelloSun/deepseekv4flashgguf` no es un modelo en el sentido habitual: es un repositorio de investigación que **no contiene pesos**. Lo que publica es una adaptación del motor de inferencia SDQ (pager de expertos SSD→RAM→CPU) para la arquitectura `deepseek4`, aplicada sobre la cuantización UD-IQ4_NL de `unsloth/DeepSeek-V4-Flash-0731-GGUF`, un MoE de 127,27 GiB distribuido en 4 shards. El objetivo es ejecutar ese modelo completo en máquinas sin GPU y con presupuestos de RAM muy ajustados, dejando en SSD los 120 GiB de pesos de expertos enrutados.

La idea central se apoya en la dispersión del MoE: 43 capas con 256 expertos cada una y solo 6 activos por token, de modo que el 94,3 % del peso (120,00 GiB) corresponde a expertos que no se tocan en un token dado. Manteniendo en RAM únicamente un *arena* de expertos y paginando el resto desde disco, el autor reporta haber ejecutado el modelo completo con un **peak RSS de 2.233 MB y 0,69 tok/s** en el nivel de 4 GiB de presupuesto, y 1,71 tok/s con 30.894 MB de RSS en el nivel de 32 GiB.

Es relevante ahora porque demuestra, con datos de ejecución medidos y artefactos reproducibles (parche para `llama.cpp`, binario `sdq-chat` y resultados en JSON), una vía para servir MoE de más de 100 GiB en hardware convencional. El repositorio arrastra 0 descargas y 0 *likes*, y no publica información sobre datos de entrenamiento ni resultados de benchmarks estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `deepseek4` (MoE con expertos enrutados y *shared expert*); 43 capas más 3 capas de *hash-routing* |
| Parámetros totales | no disponible (el repo no publica el recuento; el GGUF upstream UD-IQ4_NL ocupa 136.662.446.656 bytes ≈ 127,27 GiB) |
| Parámetros activos | no disponible en cifra absoluta; activación de 6 de 256 expertos por capa, más 1 *shared expert* (43 × 6 expertos por token) |
| Longitud de contexto | 1.048.576 tokens nativos; los experimentos se ejecutan con ctx=2048 |
| Tipos de cuantización | Pesos publicados en UD-IQ4_NL; expertos enrutados en IQ3_S (gate/up, 42 capas) y MXFP4 (layer 26 para gate/up, y down en las 43 capas) |
| Idiomas soportados | no disponible |
| Licencia | other (términos no especificados en la información disponible) |
| Formato de pesos | GGUF (4 shards); este repositorio no incluye pesos |
| Tamaño del modelo | 127,27 GiB (120,00 GiB de expertos enrutados + 7,27 GiB de pesos no expert) |
| Hidden size | 4096 |
| Tamaño de FFN de experto | 2048 |
| Tamaño de un experto | 11,125 MiB (42 capas) / 12,75 MiB (layer 26) |
| Atención | 64 cabezas, 1 cabeza KV, longitud key·value 512; indexer con top-k 512; `compress_ratios` {0, 4, 128}; hyper-connection de 4 vías |
| Gating del MoE | `expert_gating_func = 4` (sqrt-softplus), `expert_weights_scale = 1.5`, `expert_weights_norm = 1` |
| Clamp swiglu | 10,0 en routed y shared (un valor por capa) |
| Repositorio base | `unsloth/DeepSeek-V4-Flash-0731-GGUF` |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer MoE de la familia `deepseek4`: 43 capas principales más 3 capas de *hash-routing*, 256 expertos por capa con 6 activos por token y 1 *shared expert*, `hidden size` de 4096 y FFN de experto de 2048. La atención usa 64 cabezas y una sola cabeza KV con longitud key·value de 512, incorpora un *indexer* con top-k 512 y `compress_ratios` {0, 4, 128}, y emplea conexiones de tipo *hyper-connection* de 4 vías. El enrutado usa `sqrt-softplus` como función de gating, con `expert_weights_scale = 1.5` y normalización de pesos activada; el clamp swiglu está fijado en 10,0 para expertos enrutados y compartidos.

La innovación técnica de este repositorio no está en el entrenamiento, del que **no se dispone de información** (ni número de tokens, ni composición del dataset, ni si hubo RLHF o DPO), sino en el motor de inferencia. SDQ implementa un *pager* de expertos que mantiene en RAM un *arena* de tamaño calculado a partir de `--ram-budget-mb`, menos el RSS actual y una reserva por defecto de 900 MB (`SDQ_RESERVE_MB`), y sirve el resto mediante `pread` desde SSD, sin usar swap. La adaptación a `deepseek4` exigió cinco correcciones sobre la versión previa para `qwen4exp`, entre ellas el soporte de los *dot products* de `GGML_TYPE_IQ3_S` (con activación `Q8_K`) y `GGML_TYPE_MXFP4` (con activación `Q8_0`), que en la implementación original provocaban el error «tipo de cuantización de experto no soportado» en todas las capas.

## Capacidades

- Generación de texto autorregresiva en CPU mediante el binario `sdq-chat`, con decodificación verificada: ante el *prompt* `The capital of France is` devuelve `capital of France is **Paris**.` con presupuesto de RAM de 4 GiB.
- Inferencia de un MoE de 127,27 GiB con *paging* de expertos desde SSD, incluyendo capas con *hash-routing* y *shared expert*.
- Contexto nativo declarado de 1.048.576 tokens; en los experimentos publicados solo se valida a ctx=2048.
- Razonamiento, código, matemáticas, visión, *tool calling* / *function calling*, capacidades de agente y modo *thinking*: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card está redactada en chino tradicional y el único ejemplo de generación es en inglés.
- Ejecución reproducible con telemetría por petición (`--stats-file`), incluyendo tasa de aciertos de expertos por capa.
- Ajuste fino del comportamiento memoria/velocidad mediante `--ram-budget-mb`, con niveles medidos de 4, 8, 16 y 32 GiB.

## Casos de uso

- Servicio de un MoE de gran tamaño en servidores sin GPU: con un presupuesto de 8 GiB se obtienen 1,40 tok/s y 6.325 MB de RSS, lo que permite ofrecer el modelo completo en máquinas de CPU donde no cabría en memoria ni en VRAM.
- Procesamiento por lotes de baja prioridad: a 0,69 tok/s con 2.233 MB de RSS, es viable para tareas nocturnas o *backfills* donde el coste por token importa más que la latencia.
- Investigación sobre *paging* de expertos MoE: el repositorio incluye los JSON por ronda (`results/memory_levels_dsv4-4-8-16-32g.json`) y la tasa de aciertos por capa, útil para estudiar políticas de caché y tamaño de *arena*.
- Validación de kernels de cuantización: al añadir `ggml_vec_dot_iq3_s_q8_K` y `ggml_vec_dot_mxfp4_q8_0`, sirve como banco de pruebas para verificar rutas IQ3_S/MXFP4 en `ggml` con activaciones Q8_K y Q8_0.
- Evaluación de calidad de cuantizaciones UD-IQ4_NL: permite comprobar si una cuantización agresiva de 127,27 GiB mantiene respuestas correctas en tareas factuales simples antes de invertir en *hardware* con VRAM.
- Despliegue en *edge* con NVMe local: con SSD de 2,0 GB/s en lectura directa, el nivel de 32 GiB reduce el tráfico a disco a 690,7 MiB/token y 58,4 GB por ejecución completa, lo que hace predecible el desgaste y el ancho de banda necesario.
- Docencia y demostraciones: reproducir en un equipo de 16 vCPU la ejecución de un MoE de más de 100 GiB sin clúster ni GPU, con un *prompt* de control y salida verificable.
- Análisis de límites del *working set*: el nivel de 4 GiB (arena de 1,79 GiB, 164 *slots*) documenta el caso en que el conjunto de trabajo mínimo (43 × 6 = 258 expertos ≈ 2,8 GiB) no cabe y la tasa de aciertos cae a 0 %, útil para dimensionar mínimos de RAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento son las medidas de ejecución del pager SDQ, obtenidas en un Intel Xeon Platinum 8559C (16 vCPU, `avx512_vnni`, AMX desactivado), sistema de ficheros overlay con 2,0 GB/s de lectura directa, ctx=2048, ubatch=128, 16 hilos, temperatura 0 y 2 rondas por nivel:

| Presupuesto RAM | Arena (GiB) | Slots | Decode (tok/s) | Prefill (tok/s) | Hot % | Cold % | SSD (MiB/token) | Lectura SSD total | Peak RSS (MB) | Swap | Aciertos por capa (min..max) |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 4 GiB | 1,79 | 164 | 0,69 | 1,65 | 0,0 | 100,0 | 2944,4 | 161,8 GB | 2233 | 0 MB | 0,0..0,0 |
| 8 GiB | 5,79 | 531 | 1,40 | 1,65 | 42,3 | 57,7 | 1451,6 | 93,3 GB | 6325 | 0 MB | 3,5..58,0 |
| 16 GiB | 13,79 | 1264 | 1,63 | 1,75 | 54,5 | 45,5 | 1021,8 | 73,6 GB | 14508 | 0 MB | 15,1..65,9 |
| 32 GiB | 29,79 | 2732 | 1,71 | 1,80 | 63,9 | 36,1 | 690,7 | 58,4 GB | 30894 | 0 MB | 32,4..73,2 |

Notas del propio autor: pasar de 4 GiB a 32 GiB multiplica por 2,48 la velocidad de decodificación y reduce la lectura de SSD al 23,5 %; la tasa de aciertos de 0 % en el nivel de 4 GiB se explica porque el conjunto de trabajo (43 capas × 6 expertos ≈ 2,8 GiB) excede la arena de 1,79 GiB; el swap se mantiene en 0 MB en todos los niveles; y las cifras de tok/s están ligadas a esa máquina concreta y no son portables. La tabla de desglose de pesos indica 120,00 GiB de expertos enrutados (94,3 %), 7,27 GiB de pesos no expert (atención 5,0 GiB, *shared expert* 1,07 GiB, `token_embd` 0,52 GiB, router 0,09 GiB y el resto norm/hyper-connection).

## Requisitos de hardware

- Inferencia en CPU: no se reporta uso de GPU. El *hardware* de referencia es un Intel Xeon Platinum 8559C con 16 vCPU y soporte `avx512_vnni`; AMX debe desactivarse obligatoriamente en la compilación (`-mno-amx-int8 -mno-amx-tile -mno-amx-bf16`).
- VRAM estimada: no aplica / no disponible; la solución propuesta paging desde SSD a RAM, sin GPU.
- RAM: mínimo medido de 2.233 MB de *peak RSS* con 4 GiB de presupuesto (arena de 1,79 GiB, 164 *slots*) y 30.894 MB con 32 GiB (arena de 29,79 GiB, 2.732 *slots*). El presupuesto es una cifra entregada al pager, no un límite duro del sistema operativo; los 900 MB de `SDQ_RESERVE_MB` se restan antes de calcular el *arena*.
- Almacenamiento: 127,27 GiB de pesos en 4 shards GGUF, servidos por `pread` desde SSD; en el nivel de 32 GiB se leen 58,4 GB por ejecución de 48 tokens y 690,7 MiB por token.
- GPU de consumo: no disponible; no se documenta ninguna ruta con GPU, y las herramientas citadas (vLLM, Ollama, TGI) no aparecen soportadas en la información proporcionada.
- Despliegue: `llama.cpp` parcheado en el commit `836d57176dc699a726c55418e4f96b8ca628e1bf` con `0001-sdq-llama-glue.patch` y los ficheros `sdq_pager.h`, `sdq_pager.cpp`, `sdq_moe.cpp`, `sdq_buft.cpp`, `sdq_cli.cpp`; compilación con CMake y objetivo `sdq-chat`.
- Latencia y rendimiento: 0,69 tok/s de decodificación y 1,65 tok/s de prefill en el nivel de 4 GiB; 1,71 tok/s y 1,80 tok/s respectivamente en el nivel de 32 GiB. No hay datos de concurrencia, *batch* multipetición ni latencia por petición.
- No se publican requisitos para A100, H100 o RTX 4090; no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento en benchmarks estándar para este repositorio, por lo que la comparación se limita a aspectos de despliegue y licencia:

| Alternativa | Relación | Tamaño | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `HelloSun/deepseekv4flashgguf` (este repo) | Motor SDQ para `deepseek4` | 127,27 GiB (pesos referenciados, no incluidos) | 1.048.576 tokens | 0,69–1,71 tok/s en CPU (16 vCPU, 4–32 GiB) | other | Público en HuggingFace; 0 descargas, 0 likes |
| `unsloth/DeepSeek-V4-Flash-0731-GGUF` | Pesos upstream en UD-IQ4_NL | 127,27 GiB en 4 shards | 1.048.576 tokens (según metadata) | no disponible | no disponible | Público; sin datos de rendimiento en la información |
| `HelloSun/Qwen3.8-Flash-Next-GGUF` (`sdq-qwen38/`) | Variante SDQ previa, modelo objetivo `qwen4exp` | no disponible | no disponible | no disponible | no disponible | Público; base de la que se partió |
| `llama.cpp` sin SDQ | Motor estándar sobre los mismos GGUF | no aplica | no aplica | no disponible | MIT (no confirmado en la información) | Público |

Comparativas con modelos de la misma categoría y tamaño (por ejemplo, otros MoE de más de 100 GiB con contexto de un millón de tokens): no disponible.

## Limitaciones y advertencias

- El repositorio **no contiene pesos**: solo `sdq-dsv4/` (código del pager) y `results/` (resultados y evidencias). Sin descargar aparte los 127,27 GiB de `unsloth/DeepSeek-V4-Flash-0731-GGUF`, no hay nada que ejecutar.
- Requiere un `llama.cpp` parcheado en un commit concreto; no es compatible con binarios estándar, Ollama, vLLM ni TGI según la información disponible.
- AMX debe desactivarse al compilar. El autor indica explícitamente que es una condición necesaria de la adaptación, sin detallar en el extracto disponible la causa completa.
- Rendimiento muy bajo para uso interactivo: 0,69 tok/s en el nivel mínimo y 1,71 tok/s en el máximo. No hay datos de concurrencia ni de *throughput* agregado.
- Contexto validado de solo 2048 tokens, muy lejos de los 1.048.576 nativos declarados en la metadata; el comportamiento con contexto largo no está medido.
- Las cifras de tok/s, RSS y lectura de SSD están ligadas a la máquina y al SSD empleados y no son portables entre sistemas.
- El presupuesto de RAM se entrega al pager; no se aplicó un límite de cgroup por nivel (el `/sys/fs/cgroup` era de solo lectura), por lo que los niveles 4/8/16/32 GiB no equivalen a contenedores con ese límite impuesto.
- Volumen alto de lectura en disco: de 58,4 GB a 161,8 GB por ejecución de 48 tokens, lo que implica desgaste de SSD y sensibilidad al ancho de banda del almacenamiento.
- Licencia `other` sin términos especificados: no se puede confirmar el uso comercial ni las obligaciones de atribución, ni para este repositorio ni para los pesos upstream.
- Riesgo de alucinación, sesgos conocidos y comportamiento multilingüe: no disponibles. La única verificación funcional documentada es una pregunta factual simple en inglés.
- Idiomas soportados no disponibles; la model card está en chino tradicional y no declara cobertura lingüística.
- No hay resultados de MMLU, HumanEval, GSM8K ni ninguna otra evaluación estándar que permita juzgar la calidad del modelo o la degradación introducida por UD-IQ4_NL con expertos en IQ3_S y MXFP4.
- Repositorio con 0 descargas y 0 likes, publicado el 2026-10-08 y actualizado el mismo día: sin comunidad, sin mantenimiento demostrado y sin issues públicos en la información disponible.
- La calidad de la cuantización de expertos (IQ3_S en gate/up para 42 capas, MXFP4 en down para las 43) puede afectar a la precisión de forma no cuantificada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/HelloSun/deepseekv4flashgguf
- Pesos upstream en UD-IQ4_NL: https://huggingface.co/unsloth/DeepSeek-V4-Flash-0731-GGUF
- Repositorio SDQ previo para `qwen4exp`: https://huggingface.co/HelloSun/Qwen3.8-Flash-Next-GGUF
- Motor base: https://github.com/ggml-org/llama.cpp
- Commit de `llama.cpp` requerido: `836d57176dc699a726c55418e4f96b8ca628e1bf`
- Resultados por ronda (relativo al repo): `results/memory_levels_dsv4-4-8-16-32g.json`
- Notas de resultados (relativo al repo): `results/memory_levels_dsv4-4-8-16-32g.md`
- Script de experimentos (relativo al repo): `sdq-dsv4/memory_levels_dsv4.py`
- Parche de integración con `llama.cpp` (relativo al repo): `sdq-dsv4/0001-sdq-llama-glue.patch`
- Papers, blogs y demos adicionales: no disponible; la búsqueda web realizada no devolvió enlaces relevantes sobre este modelo.
