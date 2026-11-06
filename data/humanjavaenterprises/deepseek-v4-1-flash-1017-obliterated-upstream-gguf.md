# HumanjavaEnterprises/DeepSeek-V4.1-Flash-1017-obliterated-upstream-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-obliterated-upstream-GGUF es una cuantizacion GGUF del modelo OBLITERATUS/DeepSeek-V4.1-Flash-1017-obliterated, una variante del checkpoint DeepSeek-V4.1-Flash de 748.494.643.824 parametros (arquitectura MoE) a la que se le ha ablacionado la direccion de rechazo (refusal direction) en los pesos. El trabajo lo publica HumanjavaEnterprises, que no ha realizado la ablacion ni el fine-tuning, sino unicamente la cuantizacion a ~2,6 bits por peso con su propia imatrix y un mapa de tipos por tensor basado en el esquema GSQ-RCO de ISTA-DASLab.

El objetivo del build es hacer ejecutable un modelo de 748B en una sola tarjeta de 96 GB de VRAM mas aproximadamente 130 GB de RAM del sistema, usando llama.cpp upstream sin parches propios. Emplea un esquema de offload selectivo: todos los expertos enrutados residen en RAM del host y una cache LRU (`--moe-cache-mib`) mantiene en VRAM los expertos mas usados, con la tabla Engram de 105 GB leida de forma perezosa desde disco.

Es relevante porque demuestra que un MoE de 748B puede servirse en hardware de una sola GPU de datacenter con velocidades de 63-74 tok/s en decodificacion y 500-580 tok/s en prefill, y porque documenta de forma transparente las limitaciones de la ablacion: el modelo sigue rechazando 7 de 20 prompts de prueba, frente a 19 de 20 del modelo base. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) con tabla Engram; detalles de capas y atencion no disponibles |
| Parametros totales | 748.494.643.824 (748B) |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens en la configuracion de referencia (`-c 32768`); contexto maximo nativo no disponible |
| Tipos de cuantizacion | GGUF IQ2_XXS (mix con mapa de tipos por tensor GSQ-RCO, ~2,6 bits por peso); 26 shards |
| Idiomas soportados | no disponible (la evaluacion de rechazos se hizo solo en ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repo | 252,1 GB |
| Imatrix | Propia, calculada por el autor sobre este modelo, cubriendo los 15.360 expertos |
| Modelo base | OBLITERATUS/DeepSeek-V4.1-Flash-1017-obliterated (rev `29a9f99`) |
| Runtime requerido | llama.cpp desde 2026-11-03 (`ca8daad1` o superior) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer con mezcla de expertos (MoE) de 748B parametros. La model card confirma la existencia de 15.360 expertos enrutados (cubiertos por la imatrix) y de una tabla Engram de 105 GB que se lee de forma perezosa desde disco. No se detalla en la informacion disponible el numero de capas, la dimension oculta, el numero de expertos activos por token ni la composicion del dataset de entrenamiento original de DeepSeek-V4.1-Flash.

Sobre el checkpoint base, OBLITERATUS aplico una ablacion de la direccion de rechazo en los pesos (refusal direction ablated), sin fine-tuning ni merging posterior por parte de HumanjavaEnterprises. La cuantizacion se realizo con herramientas propias del autor, reutilizando el mapa de tipos por tensor del esquema GSQ-RCO de ISTA-DASLab y una imatrix calculada especificamente sobre este modelo. El resultado son 26 shards GGUF en formato IQ2_XXS. No se dispone de informacion sobre RLHF, DPO ni tecnicas de decodificacion especulativa nativas; la decodificacion especulativa se anade externamente mediante el drafter DSpark de unsloth.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat compatible con llama.cpp y opcion de desactivar el modo thinking (`enable_thinking: false`).
- Razonamiento y matematicas: GSM8K del 97,2% en la evaluacion del autor, equivalente al modelo base cuantizado por ISTA.
- Conocimiento general: MMLU del 83,6%, ligeramente por debajo del 84,4% del cuantizado de ISTA.
- Generacion de codigo: la model card reporta mejoras de throughput con decodificacion especulativa en tareas de codigo (80-102 tok/s), lo que sugiere uso intensivo en generacion de codigo, aunque no se publican benchmarks de HumanEval ni similares.
- Modo thinking configurable mediante `--chat-template-kwargs`; la evaluacion de rechazos se hizo con thinking desactivado.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags de Hugging Face).
- Capacidad multilingue: no disponible; no se ha evaluado fuera del ingles.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponibles en la informacion proporcionada.
- Vision y audio: no disponibles.

## Casos de uso

- Despliegue de un MoE de 748B en una sola GPU de 96 GB: el modelo esta disenado para ejecutarse en una tarjeta de 96 GB mas RAM del host, con todos los expertos enrutados en RAM y cache LRU en VRAM. Es adecuado para equipos que quieren servir un modelo de gran escala sin un cluster multi-GPU.
- Generacion de codigo de alto throughput: con el drafter DSpark anadido se miden 80-102 tok/s en codigo (+30-45%) con una tasa de aceptacion de borradores del 78-84%, lo que lo hace util para asistentes de codigo interactivos o pipelines de generacion masiva.
- Investigacion sobre abliteration y cuantizacion extrema: el autor documenta el efecto de la cuantizacion a ~2,6 bits sobre el comportamiento de rechazo (de 19 a 7 rechazos en 20 prompts), lo que lo convierte en un caso de estudio para medir cuanto del efecto de la ablacion se pierde al cuantizar.
- Procesamiento por lotes con contexto largo: la ventana de 32.768 tokens y el prefill de 500-580 tok/s permiten procesar documentos largos en tareas de resumen o extraccion, aunque el throughput de decodificacion (63-74 tok/s) limita la generacion extensa.
- Experimentacion con contenido sin moderacion: al no tener safety tuning, sirve para estudiar el comportamiento de modelos sin alineacion de seguridad en entornos controlados de investigacion, asumiendo la responsabilidad de uso que indica el autor.
- Evaluacion comparativa de esquemas de cuantizacion: al existir un hermano GSQ-RCO del mismo modelo base, permite comparar dos pipelines de cuantizacion (propio con imatrix propia frente al repack de ISTA) sobre las mismas metricas (perplejidad, GSM8K, MMLU).
- Servicio de chat conversacional autoalojado: con `llama-server` y `-np 1` se puede exponer un endpoint compatible con clientes de chat, aceptando la latencia de decodificacion de 63-74 tok/s.

## Benchmarks y rendimiento

| Metrica | Este build (IQ2_XXS, imatrix propia) | ISTA GSQ-RCO (modelo base) |
|---|---|---|
| Perplejidad wikitext-2 | 3,638 ± 0,040 | 3,507 ± 0,040 |
| GSM8K (250) | 97,2% | 97,2% |
| MMLU (500) | 83,6% | 84,4% |
| Rechazos en 20 prompts (spot check) | 7 | 19 |

Rendimiento medido el 2026-11-03 en una tarjeta de 96 GB, sin especulacion, `cache_prompt: false`:

| Escenario | Decodificacion | Prefill |
|---|---|---|
| Configuracion de referencia (`--moe-cache-mib 80000`) | 63-74 tok/s | 500-580 tok/s (en caliente) |
| Con DSpark especulativo, codigo | 80-102 tok/s | no disponible |
| Con DSpark especulativo, prosa | 68-74 tok/s | no disponible |
| Split de capas antiguo (referencia) | 21-27 tok/s | no disponible |

No se han publicado resultados de HumanEval, MMLU-Pro, BBH ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: una GPU de 96 GB (por ejemplo, RTX 6000 Ada, A100 80 GB no es suficiente segun la model card, que especifica 96 GB). La cache de expertos se controla con `--moe-cache-mib` (80.000 MiB en la configuracion de referencia, 72.000 MiB con especulacion).
- RAM del sistema: aproximadamente 130 GB libres; el autor reporta 126 GiB residentes con `-lm none`.
- Disco: 252,1 GB para el repo completo; la tabla Engram de 105 GB se lee de forma perezosa desde disco, por lo que se recomienda almacenamiento rapido (NVMe).
- GPU consumer: no cabe. El modelo requiere una tarjeta de 96 GB mas RAM del host; con tarjetas menores hay que reducir `--moe-cache-mib` y se espera menor rendimiento.
- Opciones de despliegue: llama.cpp upstream (`llama-server`, `llama-cli`) desde 2026-11-03 (`ca8daad1` o superior), con offload selectivo de expertos a CPU (`-ot '_exps=CPU'`). No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Decodificacion especulativa: drafter DSpark de unsloth (`dspark-DeepSeek-V4.1-Flash-1017-Q8_0.gguf`, MIT, 8 GB) en la misma tarjeta, con `--spec-type draft-dspark`, `-ngld 99` y `--spec-draft-n-max 2`. Drafting de 3 tokens resulto mas lento que 2; `ngram-mod` no aporto nada con la cache activada.
- Latencia: la velocidad sube durante los primeros cientos de tokens mientras se llena la cache de expertos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este build (IQ2_XXS, imatrix propia) | 748B | 32.768 (config. de referencia) | GGUF | MIT | PPL 3,638; GSM8K 97,2%; MMLU 83,6%; 7 rechazos/20 |
| ISTA GSQ-RCO upstream GGUF (mismo modelo base) | 748B | no disponible | GGUF | MIT | PPL 3,507; GSM8K 97,2%; MMLU 84,4%; 19 rechazos/20 |
| OBLITERATUS/DeepSeek-V4.1-Flash-1017-obliterated (BF16) | 748B | no disponible | safetensors | no disponible | Pesos completos; no cabe en el hardware del autor, sin evaluar por este |
| DeepSeek-V4.1-Flash original | 748B | no disponible | no disponible | no disponible | Modelo base sin ablacion; referencia de comportamiento |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo abliterado sin safety tuning: producira contenido que un modelo estandar rechaza. La responsabilidad de uso recae en el operador.
- La ablacion reduce los rechazos pero no los elimina: 7 de 20 prompts de prueba siguen obteniendo un rechazo suave.
- No se ha verificado si el modelo cuantizado es tan "uncensored" como el original en BF16; la cuantizacion a ~2,6 bits por peso puede restaurar parcialmente comportamiento que la ablacion elimino, y el autor no puede medirlo porque el BF16 no cabe en su hardware.
- La evaluacion de rechazos es de 20 prompts en ingles, temperatura 0, thinking desactivado y heuristica de palabras clave leida a mano; no es un benchmark. Otros temas, idiomas, conversaciones largas o el modo thinking pueden comportarse de forma distinta.
- Solo se midieron matematicas (GSM8K), conocimiento (MMLU) y perplejidad; no se ha comprobado que la abliteracion preserve el resto de capacidades.
- Perdida de calidad por cuantizacion: perplejidad de 3,638 frente a 3,507 del cuantizado de ISTA y MMLU 83,6% frente a 84,4%.
- Idiomas: no hay evaluacion fuera del ingles; el soporte multilingue no esta verificado.
- La decodificacion especulativa a temperatura 0 no es bit-identica a la decodificacion normal (issue #31472 de llama.cpp); deben ejecutarse las evaluaciones con especulacion desactivada.
- Requiere una version concreta de llama.cpp (2026-11-03 o superior) que incluye el arreglo de cache de prompts del issue #30944; versiones anteriores pueden producir bucles en respuestas largas.
- La licencia MIT se aplica al artefacto publicado, pero el autor no reproduce ni garantiza las afirmaciones de seguridad o rechazo de OBLITERATUS sobre el modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HumanjavaEnterprises/DeepSeek-V4.1-Flash-1017-obliterated-upstream-GGUF
- Modelo base (OBLITERATUS): https://huggingface.co/OBLITERATUS/DeepSeek-V4.1-Flash-1017-obliterated
- Hermano GSQ-RCO (repack de ISTA): https://huggingface.co/HumanjavaEnterprises/DeepSeek-V4.1-Flash-1017-GSQ-RCO-upstream-GGUF
- Repositorio de receta, herramientas y evaluaciones: https://github.com/HumanjavaEnterprises/deepseek-v41-upstream
- Instrucciones de build: https://github.com/HumanjavaEnterprises/deepseek-v41-upstream/blob/main/build/README.md
- Evaluaciones: https://github.com/HumanjavaEnterprises/deepseek-v41-upstream/blob/main/EVALS.md
- Drafter DSpark (unsloth): https://huggingface.co/unsloth/DeepSeek-V4.1-Flash-1017-GGUF
- Issue llama.cpp #30944 (arreglo de cache de prompts): https://github.com/ggml-org/llama.cpp/issues/30944
- Issue llama.cpp #31472 (no equivalencia bit a bit con especulacion): https://github.com/ggml-org/llama.cpp/issues/31472
- Paper referenciado en los tags (arXiv:2406.11717): https://arxiv.org/abs/2406.11717
