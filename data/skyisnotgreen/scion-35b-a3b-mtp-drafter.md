# SkyIsNotGreen/Scion-35B-A3B-mtp-drafter

## Resumen

Scion-35B-A3B-mtp-drafter es un modelo auxiliar de decodificacion especulativa (draft model) publicado por SkyIsNotGreen para acelerar la inferencia de Scion-35B-A3B, un modelo MoE de 35B de parametros con 3B activos segun su nomenclatura. El drafter es una cabeza MTP (multi-token prediction) de k=1, con el cuerpo congelado, que ocupa unos 50,3 MB en disco y 25.165.824 parametros (dato real de safetensors). No genera texto de forma autonoma: predice el siguiente token del modelo objetivo a partir del estado oculto post-norm de este mas el embedding del siguiente token, y reutiliza las propias capas `output_norm`, `output` y `token_embd` del objetivo, sin una segunda proyeccion de vocabulario.

Su relevancia es puramente practica: reduce la latencia por token al servir Scion-35B-A3B. En una RX 7900 XT y decodificacion greedy, el autor reporta 9,07 ms/token frente a 12,41 ms/token de linea base (1,37x) en un prompt de benchmark de 400 tokens, y 57,2 frente a 49,0 tokens/s en generacion CLI abierta (1,17x). La aceptacion del borrador medida varia entre 0,44 y 0,74 segun la carga, con aceptacion teacher-forced de 0,483 en fineweb y 0,360 en wikitext.

El principal caveat es de integracion: no funciona en llama.cpp estandar. Requiere el fork `moe-corr-runtime` del repositorio `sky-is-green/prism-ml-llama.cpp`, que autodetecta el sidecar a partir del propio GGUF. El modelo objetivo tambien necesita ese fork (contenedor `PQ2_0`). La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de decodificacion especulativa MTP de k=1 (sidecar) sobre el estado oculto post-norm del modelo objetivo; cuerpo congelado. No disponible detalle adicional de la topologia interna |
| Parametros totales | 25.165.824 (~25,2 M) segun safetensors |
| Parametros activos | No aplica: el drafter es una cabeza densa, no un MoE. El modelo objetivo (Scion-35B-A3B) declara 35B totales y 3B activos en su nombre |
| Longitud de contexto | No disponible en el modelo; la fija el modelo objetivo en tiempo de ejecucion (los ejemplos de uso emplean `-c 4096`) |
| Tipos de cuantizacion | No disponible (se distribuye como un unico GGUF de 50,3 MB; el modelo objetivo usa el contenedor `PQ2_0` del fork) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El drafter es un sidecar de decodificacion especulativa que se ejecuta contra el contexto del modelo objetivo, sin un modelo borrador independiente. Predice el siguiente token del objetivo combinando el estado oculto post-norm de este con el embedding del siguiente token, y reutiliza `output_norm`, `output` y `token_embd` del propio objetivo, de modo que no existe una segunda proyeccion de vocabulario. La cabeza es de tipo k=1: un unico token borrador por paso. El autor indica que una cabeza multi-token con forma DSpark fue construida y medida para el mismo release y no supero a esta, dato registrado en el "registro negativo" del proyecto.

El entrenamiento es de autodestilacion contra los propios tokens greedy del release, con el cuerpo congelado. El conjunto consta de 3088 ventanas: 1024 de fineweb (seed 0), 2048 de fineweb (seed 1) y 16 de wikitext. No se especifica numero de tokens totales, composicion exacta del dataset, ni uso de RLHF o DPO. El drafter se distribuye como `Scion-35B-A3B-mtp-drafter.gguf` (50,3 MB, sha256 `2dabf2cf4e6840f9bc497440f69c82d4f315b988d2eaeebd80b879965214a873`) y requiere el fork `moe-corr-runtime`, donde se carga mediante la implementacion `draft-mtp-sidecar` autodetectada desde el GGUF.

## Capacidades

- Prediccion del siguiente token (k=1) para decodificacion especulativa sobre Scion-35B-A3B.
- Reutilizacion del vocabulario y de la proyeccion de salida del modelo objetivo, sin cabecera de vocabulario propia.
- Aceleracion medida de 1,37x en el prompt de benchmark (400 tokens) y ~1,17x en generacion CLI abierta; el autor recomienda tratar ~1,2x como cifra tipica.
- Tasa de aceptacion del borrador entre 0,44 y 0,74 segun la carga; aceptacion teacher-forced de 0,483 en fineweb y 0,360 en wikitext.
- Integracion como sidecar autodetectado en llama.cpp del fork `moe-corr-runtime` (flag `-md`).
- No genera texto de forma autonoma, no soporta tool calling ni razonamiento multi-paso por si mismo: estas capacidades dependen integramente del modelo objetivo.
- Cobertura multilingue limitada al ingles declarado (hereda la del objetivo en la practica).
- No incorpora modo thinking, vision ni audio.

## Casos de uso

- Servicio de inferencia de Scion-35B-A3B en produccion: al acoplarlo en el servidor llama.cpp del fork, reduce la latencia por token de 12,41 a 9,07 ms/token en el prompt de benchmark, lo que baja el coste por peticion en cargas sostenidas.
- Chat interactivo por CLI: mejora el throughput de 49,0 a 57,2 tokens/s en generacion abierta, con aceptacion entre 0,46 y 0,74, adecuado para sesiones de terminal donde el usuario percibe la velocidad de emision.
- Despliegue en `llama-server`: el sidecar se autodetecta con `-md` y ofrece 1,14-1,21x de aceleracion en confirmacion de servidor, sin cambios en el codigo de la aplicacion cliente.
- Reduccion de coste en GPU AMD: las mediciones del autor estan hechas en una RX 7900 XT, de modo que es un caso directamente aplicable a entornos ROCm con ese tipo de hardware.
- Evaluacion comparativa de tecnicas de decodificacion especulativa: sirve como punto de referencia medido (aceptacion, speedup, near-tie flips) frente a cabezas multi-token tipo DSpark o enfoques EAGLE/Medusa.
- Integracion en pipelines existentes construidos sobre `prism-ml-llama.cpp`: permite anadir el drafter sin sustituir el modelo objetivo ni reentrenar, solo descargando el GGUF adicional de 50,3 MB.

## Benchmarks y rendimiento

Datos publicados por el autor (RX 7900 XT, decodificacion greedy, emparejado con el release de Scion-35B-A3B):

| Carga | Baseline | Con drafter | Speedup | Aceptacion del borrador |
|---|---:|---:|---:|---:|
| Prompt de benchmark, 400 tokens | 12,41 ms/tok | 9,07 ms/tok | 1,37x | 0,738 |
| Generacion CLI abierta | 49,0 tok/s | 57,2 tok/s | 1,17x | 0,46-0,74 |
| Confirmacion en servidor | - | - | 1,14-1,21x | 0,44-0,70 |

Aceptacion teacher-forced adicional: fineweb 0,483; wikitext 0,360.

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor senala que el speedup depende del prompt y que la decodificacion especulativa no altera las salidas del modelo salvo por raros empates cercanos ("near-tie flips") en la verificacion por lotes.

## Requisitos de hardware

- El drafter en si ocupa 50,3 MB, por lo que el requisito de VRAM lo determina casi por completo el modelo objetivo (Scion-35B-A3B en contenedor `PQ2_0`). No disponible la cifra exacta de VRAM del objetivo en la informacion proporcionada.
- GPU medida por el autor: una RX 7900 XT (AMD, ROCm). No se documentan otras GPU.
- Al ser un sidecar de ~50 MB, cabe sin problema en cualquier GPU consumer que ya pueda ejecutar el modelo objetivo; no anade un requisito relevante por si mismo.
- Opciones de despliegue: exclusivamente el fork `sky-is-green/prism-ml-llama.cpp`, rama `moe-corr-runtime`, con `llama-server` o `llama-cli` y el flag `-md`. No compatible con llama.cpp upstream, vLLM, TGI, Ollama ni llama.cpp estandar.
- Ejemplo de invocacion: `-m Scion-35B-A3B-PQ2_0-corr.gguf -md Scion-35B-A3B-mtp-drafter.gguf -ngl 99 -c 4096 -t 8`.
- Latencia y throughput: los de la tabla anterior, dependientes del prompt. Cifra tipica recomendada por el autor: ~1,2x de speedup.

## Comparativa con modelos similares

No se dispone de datos numericos comparables en la informacion proporcionada, salvo la mencion del autor a una cabeza multi-token con forma DSpark que no supero a esta. Comparativa cualitativa:

| Modelo/tecnica | Tipo | Parametros | Contexto | Licencia | Runtime | Rendimiento |
|---|---|---|---|---|---|---|
| Scion-35B-A3B-mtp-drafter | Sidecar MTP k=1, cuerpo congelado | 25,2 M | Lo fija el objetivo | apache-2.0 | Fork `moe-corr-runtime` (llama.cpp) | 1,37x mejor caso, ~1,2x tipico |
| Cabeza DSpark multi-token (mismo release) | Cabeza multi-token | no disponible | no disponible | no disponible | no disponible | No supero a este drafter (segun el autor) |
| EAGLE-3 | Cabezas de decodificacion especulativa | no disponible | no disponible | no disponible | Implementacion propia | no disponible |
| Medusa | Multiples cabezas de decodificacion | no disponible | no disponible | no disponible | Implementacion propia | no disponible |
| Draft model clasico (p. ej. Llama-3.2-1B) | Modelo borrador independiente | ~1,2 B | 128k (segun familia) | licencia Llama | llama.cpp, vLLM, TGI | no disponible en este emparejamiento |

## Limitaciones y advertencias

- No es un modelo autonomo: sin Scion-35B-A3B no produce salidas utiles.
- Requiere un fork no estandar de llama.cpp (`moe-corr-runtime`); no funciona con llama.cpp upstream ni con otros servidores (vLLM, TGI, Ollama).
- El modelo objetivo tambien exige ese fork y el contenedor `PQ2_0`, lo que encadena la dependencia a un unico repositorio de terceros.
- El speedup es fuertemente dependiente del prompt: 1,37x solo en el prompt de benchmark; la cifra tipica reconocida por el autor es ~1,2x.
- Puede introducir "near-tie flips" raros en la verificacion por lotes, es decir, cambios en la salida en empates muy cercanos.
- Solo declara ingles; no hay soporte multilingue propio.
- Entrenado con 3088 ventanas (1024 fineweb seed 0, 2048 fineweb seed 1, 16 wikitext) contra tokens greedy del release: dataset reducido y sesgo potencial hacia los dominios de fineweb y wikitext.
- No hay benchmarks estandar de calidad publicados por el autor para este drafter.
- Adopcion nula en el momento de la ficha (0 descargas, 0 likes), sin validacion externa independiente.
- Licencia Apache-2.0 para el drafter, heredada del modelo base; la licencia del fork no se detalla en la informacion disponible.
- Riesgo de alucinacion: no aplica al drafter por separado, pero hereda el del modelo objetivo al que acompana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SkyIsNotGreen/Scion-35B-A3B-mtp-drafter
- Modelo base Scion-35B-A3B: https://huggingface.co/SkyIsNotGreen/Scion-35B-A3B
- Model card del modelo base (instrucciones de build): https://huggingface.co/SkyIsNotGreen/Scion-35B-A3B
- Fork de llama.cpp requerido (rama `moe-corr-runtime`): https://github.com/sky-is-green/prism-ml-llama.cpp/tree/moe-corr-runtime
- Paper: no disponible
- Demo: no disponible
