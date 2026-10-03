# fridaystreet/Qwen3.8-Flash-Next-FP6-INT8

## Resumen
Qwen3.8-Flash-Next FP6-INT8 es una compilacion cuantizada del modelo Qwen3.8-Flash-Next, publicada por el usuario fridaystreet sobre el checkpoint oficial en FP8 (`Qwen/Qwen3.8-Flash-Next-FP8`). El modelo original es un transformer de tipo mixture-of-experts (MoE) de la familia experimental `qwen4_exp`, con 180.000 millones de parametros declarados por el autor, de los cuales 51.000 millones corresponden a una tabla de embeddings n-gram/PLE almacenada como sidecar. La version cuantizada reparte los expertos enrutados en fp6 e2m3, las proyecciones densas en int8 simetrico y el resto en bf16, con el objetivo de caber en 2 GPU de 64 GB.

Su relevancia es de ingenieria mas que de calidad de modelo: es la segunda generacion de un formato de cuantizacion disenado para hardware sin soporte de formatos tensor-core de 8 bits (concretamente 2× NVIDIA CMP 170HX, GA100, sm80), y anade un nivel int8 sobre la v1 que reduce los shards en disco de 99,97 GiB a 97,63 GiB, amplia el pool de KV de 292.288 a 425.024 tokens y eleva la decodificacion de 54-56 a 61 tok/s en un solo flujo. Mantiene la ventana completa de 262.144 tokens por peticion, sin cuantizar la cache KV, las activaciones ni el estado recurrente.

El repositorio es reciente (creado el 2026-10-02) y no registra descargas ni likes en los datos consultados, por lo que no existe validacion independiente de la comunidad. El despliegue depende de un fork propio de SGLang (`fp6-stable`) y de parches incluidos en `patches/`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con expertos enrutados, atencion dispersa (QSA), capas GDN, hiper-conexiones y cabecera MTP (multi-token prediction); etiquetado internamente como `qwen4_exp` |
| Parametros totales | 97.971.601.299 segun cabeceras safetensors del repositorio; el autor declara 180.000 millones incluyendo la tabla n-gram/PLE de 51.000 millones, almacenada como sidecar fp8 (la diferencia entre ambas cifras no se detalla en la informacion disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por peticion; pool de KV de 425.024 tokens repartidos en 3 slots con `mem-fraction-static 0.93` |
| Tipos de cuantizacion | Expertos enrutados y MTP: fp6 e2m3, grupo 64, escalas fp16, planos hi4/lo2. Embeddings, `lm_head`, `GDN out_proj`, `QSA q/k/v/o` y expertos compartidos: int8 simetrico, grupo 32, escalas fp16. Resto: bf16. Tabla n-gram: fp8 e4m3 como sidecar en RAM del host. Cache KV, activaciones y estado recurrente sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (etiquetada como `other` en HuggingFace) |
| Formato de pesos | safetensors (shards de 97,63 GiB en disco) mas sidecar fp8 para la tabla n-gram; tamano total del repositorio 156,1 GB |

## Arquitectura y entrenamiento
La arquitectura de partida es un MoE con 48 × 512 en las proyecciones gate/up/down de los expertos enrutados (120,80 mil millones de parametros en esa componente), embeddings n-gram/PLE de 51.000 millones, proyecciones densas int8 y una cadena de atencion que combina atencion dispersa por token (QSA), capas GDN, normalizacion e hiper-conexiones. El modelo incorpora ademas una cabecera MTP (aceptacion medida de 1,78 en el checkpoint cuantizado) empleada para decodificacion especulativa.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo original. Lo que documenta esta ficha es el proceso de cuantizacion, no el entrenamiento: se parte del checkpoint oficial FP8 de grano fino con bloque 128, nunca de pesos bf16, y los tensores marcados como bf16 heredan los valores de ese checkpoint. La v2 se genera desde la v1 mediante `tools/int8_encode.py` (ejecucion en CPU, aproximadamente 15 minutos) y publica `w8_manifest.json`, que lista cada tensor int8 con su forma y el error medido. La tabla n-gram se recompone en un sidecar fp8 sin alterar sus valores.

## Capacidades
- Generacion de texto y conversacion multturno con contexto de hasta 262.144 tokens por peticion, con coste de decodificacion que el autor describe como no medible a 209.000 tokens frente a 500 tokens.
- Razonamiento de multiples pasos y uso como backend de agentes: el propio autor justifica la publicacion por fallos intermitentes bajo trafico de agentes en la generacion anterior (8-2026), corregidos en esta build.
- Decodificacion especulativa mediante la cabecera MTP integrada, con aceptacion de 1,78.
- Procesamiento por lotes en servidor SGLang con batching continuo (medidas agregadas a 1, 2 y 3 flujos).
- Indicios de entrada multimodal: entre los fallos corregidos se cita un contexto CUDA envenenado en el proceso del tokenizador tras imagenes grandes y el preprocesado de imagenes en GPU. La model card no documenta vision como capacidad soportada, por lo que debe tratarse como no confirmado.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso
- Autohospedaje de un asistente de contexto largo: con 262.144 tokens por peticion y un pool de 425.024 tokens, permite mantener sesiones con documentacion extensa (expedientes, normativa, manuales tecnicos) y hasta tres conversaciones largas concurrentes en 2 GPU de 64 GB.
- Backend de agentes con trafico sostenido: la build esta endurecida especificamente contra los fallos observados bajo trafico de agentes (fallos de MMU al final de la VRAM en prefills largos, OOM en peticiones con input-logprob), lo que la hace apta para servicios internos con llamadas encadenadas.
- Analisis de repositorios o corpus completos: la ausencia de degradacion medible de la decodificacion a 209.000 tokens permite procesar ficheros o lotes documentales enteros sin troceado agresivo.
- Servicio interno de generacion de codigo asistida: con 61 tok/s en un flujo y ~101 tok/s agregados a tres flujos, es viable como autocompletado y explicacion de codigo para un equipo pequeno, siempre sobre SGLang.
- Consolidacion de infraestructura en hardware de segunda mano: el perfil de referencia son 2× CMP 170HX (aproximadamente 5.000 EUR) mas un host DDR5 de 96 GB, alternativa de coste bajo frente a GPUs con NVLink y soporte de formatos de 8 bits.
- Investigacion en cuantizacion: la receta v1→v2 es reproducible (`tools/int8_encode.py`, `w8_manifest.json` con error por tensor) y los arneses de medida de `tools/` estan pensados para comparar resultados entre builds.
- Procesamiento por lotes offline de prompts largos: con 1.126 tok/s de prefill de extremo a extremo en un prompt de 53.000 tokens (47,5 s) y ~1.270 tok/s por chunk, es adecuado para tareas batch no interactivas donde el TTFT no es critico.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible. Las unicas cifras publicadas son medidas de despliegue de la propia build, tomadas el 2026-09-02 sobre el perfil de hardware de referencia (2× CMP 170HX, TP=2, PCIe gen2 x4, `mem-fraction-static 0.93`):

| Metrica | Valor medido |
|---|---|
| Decodificacion, un flujo, estado estacionario | 60,9 tok/s de mediana; 63,3 tok/s maximo (longitud de aceptacion MTP 1,78) |
| Decodificacion, un flujo, incluyendo TTFT, respuestas de 400 tokens | 56-58 tok/s |
| Decodificacion agregada (estado estacionario), 1 / 2 / 3 flujos | ~61 / 85 / 101 tok/s (un cuarto flujo entra en cola) |
| Prefill | 1.126 tok/s de extremo a extremo con prompt de 53.000 tokens (47,5 s); ~1.270 tok/s por chunk |
| TTFT, prompt corto | ~0,3 s |
| Coste de contexto largo | sin degradacion medible: misma tasa de decodificacion a 209.000 tokens que a 500 |
| VRAM | 61 de 64 GB por tarjeta; 4,8 GB libres tras la captura de grafos |
| Tiempo de carga hasta listo | ~9 minutos |

Presupuesto del paso de decodificacion (batch 1, ~30,6 ms por tarjeta): lecturas de pesos 5,2 ms (limitado por hardware, ~7,2 GiB por tarjeta y paso a 1,49 TB/s); 101 all-reduces de TP con latencia de 42-55 µs cada uno, 4,3-5,4 ms (limitado por hardware al no haber P2P); GEMV de expertos fp6 ~6 ms; cadena de atencion/GDN/norm/hiper-conexion ~10 ms (sin fusionar); GEMM densas int8 2,0 ms.

Comparativa entre generaciones del mismo formato:

| Metrica | v1 (FP6) | v2 (esta build) |
|---|---|---|
| Expertos enrutados + MTP | fp6 e2m3, grupo 64 | igual |
| Embeddings, lm_head, GDN out_proj, QSA q/k/v/o, expertos compartidos | bf16 | int8 simetrico, grupo 32, escalas fp16 |
| Shards en disco | 99,97 GiB | 97,63 GiB |
| Pool de KV (2×64 GB, ajustes de referencia) | 292.288 tokens | 425.024 tokens |
| Decodificacion en un flujo | 54-56 tok/s | 61 tok/s de mediana, 63 maximo |

El autor situa el techo de prefill en ~2.000 tok/s a TP=2 sobre PCIe gen2 x4 y estima ~3.000 tok/s con un enlace PCIe 4.0 x16 (el tiempo de bus por chunk baja de ~2 s a ~0,1 s), quedando entonces limitado por la GEMM de expertos. Afirma que un paso de 20-24 ms (85-110 tok/s en un flujo) es alcanzable con fusion de la cadena de atencion/GDN, mejor planificacion de all-reduce y batching del camino de verificacion de atencion dispersa.

## Requisitos de hardware
- VRAM: disenado para 2 GPU de 64 GB (128 GB en total). En la configuracion de referencia se ocupan 61 de 64 GB por tarjeta, con 4,8 GB libres tras la captura de grafos. Los shards suman 97,63 GiB, mas cache KV, activaciones y estado recurrente.
- RAM del host: el sidecar fp8 de la tabla n-gram se sirve desde RAM fijada, aproximadamente 48 GiB sobre un host de 96 GB DDR5 (92 GiB utilizables).
- GPU de referencia: 2× NVIDIA CMP 170HX (GA100, sm80, 70 SM, 64 GB HBM2e a ~1,49 TB/s, 1.410 MHz), sin NVLink ni P2P, con CUPTI desactivado y sin formatos tensor-core fp8/fp6/int8. El codebase esta ajustado a sm80/CMP.
- GPU no recomendadas: el autor indica que un enlace PCIe 4.0 x16 (por ejemplo A100 PCIe) reduce el tiempo de bus por chunk de ~2 s a ~0,1 s y elevara el prefill a ~3.000 tok/s, pero los formatos fp6/int8 y los kernels del fork estan pensados para hardware sin aceleracion de 8 bits, por lo que el comportamiento en GPUs con tensor cores de 8 bits no esta documentado.
- GPU de consumo: no cabe. El modelo completo, incluso en esta cuantizacion, exige ~128 GB de VRAM agregada; no hay version GGUF ni recetas para 24-48 GB publicadas en la informacion disponible.
- Despliegue: SGLang mediante el fork `fp6-stable` incluido en `patches/`; el stack carga indistintamente v1 y v2 segun `quantization_config.dense_int8`. No hay soporte documentado en vLLM, llama.cpp, Ollama ni TGI. Software de referencia: driver NVIDIA 610.43, CUDA 13.3, torch 2.13, Triton 3.7.1, NCCL 2.29.7.
- Latencia y throughput: TTFT ~0,3 s con prompt corto; 60,9 tok/s medianos en decodificacion a un flujo; ~1.126 tok/s de prefill de extremo a extremo; ~9 minutos de carga hasta estar listo. El prefill esta limitado por el bus (101 all-reduces de 21 MB por chunk de 4.096 tokens sobre ~1,2 GB/s). Cada flujo adicional de decodificacion anade ~15 ms al paso (~6 ms de GEMV de expertos, ~9 ms sin atribuir).

## Comparativa con modelos similares

| Modelo | Cuantizacion | Shards en disco | Pool de KV (2×64 GB) | Decodificacion, 1 flujo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| fridaystreet/Qwen3.8-Flash-Next-FP6-INT8 (esta ficha) | fp6 expertos + int8 denso + bf16 resto | 97,63 GiB | 425.024 tokens | 61 tok/s (63 maximo) | qwen-community-license-1.0 | HuggingFace, 0 descargas al publicarse |
| fridaystreet FP6 (v1, mismo autor) | fp6 expertos + bf16 resto | 99,97 GiB | 292.288 tokens | 54-56 tok/s | qwen-community-license-1.0 (segun la build base) | HuggingFace, disponible segun el autor |
| Qwen/Qwen3.8-Flash-Next-FP8 (modelo base oficial) | fp8 de grano fino, bloque 128 | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace |

No se dispone de datos sobre modelos comparables de otros fabricantes con el mismo tamano, contexto o perfil de hardware, por lo que la comparativa se limita a las tres variantes anteriores. No hay cifras de calidad (razonamiento, codigo, matematicas) para ninguna de ellas en la informacion consultada.

## Limitaciones y advertencias
- Ausencia total de evaluaciones de calidad: no hay MMLU, HumanEval, GSM8K ni ninguna otra prueba publicada. Las unicas metricas son de throughput y latencia, que no informan sobre la precision del modelo.
- La cuantizacion introduce error frente al FP8 de origen. Solo se publica el error RMS relativo por tensor en `w8_manifest.json` (por ejemplo, ~6,25 en las cabeceras truncadas de la tabla de precision); no hay evaluacion del impacto en tareas finales.
- Sesgos conocidos: no disponibles. No se documenta la composicion del dataset de entrenamiento ni las etapas de alineacion.
- Riesgo de alucinacion: no medido en la informacion disponible.
- Idiomas soportados: no disponibles. No se puede asumir cobertura multilingue ni un rendimiento concreto en castellano.
- Hardware muy especifico: la build esta optimizada para sm80/CMP 170HX sin formatos tensor-core de 8 bits y con PCIe gen2 x4. El prefill esta limitado por el bus en ese perfil (~2.000 tok/s de techo declarado). No hay datos de comportamiento en otras plataformas.
- Dependencia de un fork propio de SGLang (`fp6-stable`) y de parches en `patches/`. Sin soporte documentado en vLLM, llama.cpp, Ollama ni TGI, y sin pesos GGUF: la portabilidad es muy reducida.
- Consumo de RAM del host: aproximadamente 48 GiB fijados por el sidecar n-gram, lo que condiciona el resto del sistema.
- Concurrencia limitada: el pool de 425.024 tokens se reparte en 3 slots. Con peticiones cercanas a los 262.144 tokens, la concurrencia efectiva baja a una o dos sesiones.
- Ajuste deliberado a la baja de `mem-fraction-static` (0,93 frente a 0,945-0,955) por seguridad de memoria, lo que recorta el pool de KV a cambio de estabilidad.
- Estabilidad: aunque el autor afirma que la build lleva sin caidas desde la aplicacion de los parches, los fallos documentados previamente (faltas de MMU, contexto CUDA envenenado, OOM en input-logprob) deben verificarse en el hardware propio antes de llevar el modelo a produccion.
- Indicios de entrada multimodal (preprocesado de imagenes, fallo del tokenizador tras imagenes grandes) no documentados como capacidad soportada.
- Licencia `qwen-community-license-1.0` marcada como `other`: no se dispone del texto ni de las condiciones de uso comercial en la informacion proporcionada. Es imprescindible revisar `LICENSE` antes de cualquier uso comercial.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la publicacion (2026-10-02), un solo autor, sin revisores independientes.
- El repositorio no incluye una receta de entrenamiento ni pesos base en bf16: derivar otras cuantizaciones desde este checkpoint no permitiria recuperar la precision del FP8 oficial.

## Enlaces
- Repositorio en HuggingFace: https://huggingface.co/fridaystreet/Qwen3.8-Flash-Next-FP6-INT8
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8
- Ficheros adicionales citados en la model card, dentro del propio repositorio: `LICENSE`, `STABILITY.md`, `w8_manifest.json`, `tools/int8_encode.py`, directorio `patches/` y directorio `tools/` con los arneses de medida
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo, su autor, el paper de la arquitectura `qwen4_exp` ni la licencia `qwen-community-license-1.0`; todos los resultados obtenidos fueron ajenos al modelo.
