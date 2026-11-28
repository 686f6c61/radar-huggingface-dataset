# qwegnai/ERNIE-5.5-Flash-Preview-QWP-Mixed-Fast

## Resumen

ERNIE-5.5-Flash-Preview-QWP-Mixed-Fast es un pack de pesos cuantizados del modelo baidu/ERNIE-5.5-Flash-Preview, preparado por el usuario qwegnai para su motor de inferencia propietario Qwegn (v0.41.0+), un runtime escrito en Swift 6.2 con Metal 4 orientado exclusivamente a Apple Silicon. No se trata de un modelo nuevo, sino de una redistribucion comprimida del modelo base de Baidu (280B parametros totales, 14B activos por token) empaquetada en el contenedor QWP1, que no es compatible con safetensors, GGUF ni MLX.

El modelo base es un transformer MoE con arquitectura ernie5_5_moe, 43 capas y una ventana de contexto nativa de 1.048.576 tokens. Este pack aplica una mezcla agresiva de cuantizacion (HQ4_G32_M5, HQ8_G32, SHVQ15_G64, SHVQ3_G64, BF16 y F32) que reduce el peso a 77,91 GiB en disco y 2,36 bits por parametro de media, permitiendo que el modelo completo resida en la memoria unificada de un Mac de 128 GB.

Su relevancia es practica: demuestra que un MoE de 280B puede ejecutarse de forma 100% residente en hardware consumer de Apple con velocidades de prefill de 1.544,9 tok/s a 4K y decodificacion especulativa de hasta 110,6 tok/s, algo impensable en GPUs de consumo con cuantizaciones convencionales a este nivel de compresion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ernie5_5_moe (transformer MoE con HCA, SWA, MLA-DSA y FlashIndexer) |
| Parametros totales | 280B |
| Parametros activos | 14B por token |
| Longitud de contexto | 1.048.576 tokens (nativo) |
| Tipos de cuantizacion | HQ4_G32_M5 (5,0 bpw), HQ8_G32 (8,5 bpw), SHVQ15_G64 (1,75 bpw), SHVQ3_G64 (3,25 bpw), SHVQ4_G32, BF16, F32; media 2,36 bits/parametro |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | QWP1 (contenedor propio de Qwegn; no compatible con safetensors, GGUF ni MLX) |

## Arquitectura y entrenamiento

El modelo base ERNIE-5.5-Flash-Preview emplea una arquitectura MoE de 43 capas: 37 capas con Heavily Compressed Attention (HCA 128:1) combinadas con sliding window attention de 128 tokens, y 6 capas con MLA-DSA desacopladas con RoPE y FlashIndexer basado en Walsh-Hadamard de 64 vias. La capa L0 es densa y las capas L1-L42 son MoE con 512 expertos enrutados, top-10 con sigmoid de doble particion y un experto compartido de 2048 de dimension intermedia (moe_latent_size=2048). Incluye Sinkhorn-20 mHC de 4 flujos, lm_head MultiMax, 4096 de dimension oculta y un vocabulario de 201.216 tokens. Soporta de forma nativa el formato de chat chatv2p3 y tool calling paralelo mediante `<ernie:tool_call>`.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. La innovacion tecnica de este pack concreto reside en su esquema de cuantizacion mixta: los expertos enrutados gate_proj y up_proj usan SHVQ15_G64 (43.008 tensores a 1,75 bpw), down_proj usa SHVQ3_G64 (21.504 tensores a 3,25 bpw), las proyecciones densas y de atencion usan HQ4_G32_M5 (397 tensores a 5,0 bpw), el lm_head usa HQ8_G32 y las embeddings, routers y normas se mantienen en BF16 o F32. Ademas incluye un drafter especulativo DSpark (4,39 GiB) y un indice FlashIndexer (3,00 MiB) empaquetados junto al modelo.

## Capacidades

- Generacion de texto y razonamiento multi-turno con contexto de hasta 1.048.576 tokens.
- Generacion de codigo: obtiene 78/100 en Code-100 con `--reasoning low` (45/50 HumanEval, 33/50 MBPP) y 75/100 con razonamiento desactivado.
- Tool calling nativo y paralelo mediante el formato `<ernie:tool_call>`.
- Capacidades de agente y razonamiento multi-paso gracias al decodificador especulativo DSpark (hasta 7,11 tokens por paso).
- Recuperacion verbatim en contexto largo: 3/3 needles a 16K tokens.
- Multilinguee limitado a ingles y chino.
- Modo de razonamiento configurable (`--reasoning low` / `--reasoning off`).
- Indexado semantico interno mediante FlashIndexer y QLSA v1 para atencion dispersa.

## Casos de uso

- Inferencia local en Mac de 128 GB: el pack esta disenado para ejecutarse 100% residente en un Apple M5 Max con 128 GB de memoria unificada, sin offloading a disco ni a CPU, lo que permite desplegar un MoE de 280B en un equipo de sobremesa.
- Procesamiento de documentos largos: con 1.048.576 tokens de contexto y recuperacion verbatim verificada a 16K, es adecuado para analisis de contratos, expedientes o bases de codigo completas en una sola pasada.
- Asistentes de codigo en local: los 63,92 tok/s en tareas de codigo con DSpark y su soporte de tool calling permiten integrarlo en entornos de desarrollo sin conexion a la nube.
- Automatizacion de agentes multi-paso: el drafter DSpark con 3,47x de aceleracion y la conformidad 291/291 en API lo hacen viable para pipelines de agentes que encadenan llamadas a herramientas.
- Generacion de prosa y resumenes: 62,65 tok/s en prosa con el schedule de confianza DSpark, adecuado para redaccion asistida y sintesis de documentos extensos.
- Servidor de inferencia personal: con 1.544,9 tok/s de prefill a 4K y 38x de aceleracion con cache de prefijo caliente (1.140 ms a 30 ms), puede actuar como backend local para aplicaciones que requieran baja latencia en prompts repetidos.
- Evaluacion y experimentacion con cuantizacion extrema: util para investigadores que quieran estudiar el impacto de SHVQ y HQ4 en la calidad de un MoE grande, con variante HQ8 disponible para comparar.

## Benchmarks y rendimiento

Medidos en un Apple M5 Max (128 GB, GPU Apple10 NAX de 40 nucleos, macOS 26.2+) con `--kv-mode q4 --temperature 0 --no-profile`:

| Metrica | Resultado |
|---|---|
| Prefill CLI 4K (4.087 tok) | 1.544,9 tok/s GPU (1.540,9 wall) |
| Prefill CLI 16K | 1.259,9 tok/s |
| Prefill CLI 16K con DSpark | 1.165,5 tok/s |
| Decodificacion serial (mtp=0) | 43,28-44,78 tok/s |
| DSpark d=7 JSON (128 tok) | 89,48 tok/s (5,77 tok/ronda) |
| DSpark d=7 Code | 63,92 tok/s |
| DSpark d=7 Prose | 62,65 tok/s |
| Prefill llmprobe (513 a 65,6K) | 962 a 1.111 tok/s (mediana 1.252,5 tok/s a 8.775 tok, TTFT 203 ms) |
| Decodificacion llmprobe (513 a 65,6K) | 53,4 a 60,9 tok/s |
| Pico especulativo | 110,6 tok/s (7,11 tok/paso, 3,47x) |
| Cache de prefijo caliente | 38x (1.140 ms a 30 ms) |
| Conformidad API | 291/291 (100%) |
| Fidelidad | 36/36 (100%), top-1 medio 0,998 |
| Code-100 (`--reasoning low`) | 78/100 (45/50 HE, 33/50 MBPP) |
| Code-100 (`--reasoning off`) | 75/100 |
| Needles verbatim 16K | 3/3 (100%) |

No se han publicado resultados de benchmarks estandar (MMLU, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- Memoria unificada: 128 GB en Mac (100% residente, 77,11-77,24 GiB en CLI corto y 82,06-82,30 GiB en CLI 4K-16K).
- GPU: Apple M5 Max (Mac17,6) con GPU Apple10 NAX de 40 nucleos; no se documenta soporte para otras GPUs.
- No es compatible con GPUs NVIDIA (A100, H100, RTX 4090) ni con hardware consumer x86, al depender del runtime Metal 4 de Qwegn.
- Despliegue: exclusivamente mediante Qwegn v0.41.0+; no funciona con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: TTFT de 203 ms a 8.775 tokens; decodificacion sostenida de 53-61 tok/s en contextos largos y picos de 110,6 tok/s con DSpark.
- Almacenamiento: 77,91 GiB para model.qwp mas 4,39 GiB de dspark.qwp y 3,00 MiB de flashindexer.qwp.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| ERNIE-5.5-Flash-Preview-QWP-Mixed-Fast | 280B totales / 14B activos | 1.048.576 | Apache 2.0 | QWP1 | Solo Qwegn en Apple Silicon |
| ERNIE-5.5-Flash-Preview-QWP-Mixed | 280B totales / 14B activos | 1.048.576 | Apache 2.0 | QWP1 | Solo Qwegn; tronco HQ8 (81,57 GiB, 81-83/100 en Code-100) |
| baidu/ERNIE-5.5-Flash-Preview | 280B totales / 14B activos | 1.048.576 | Apache 2.0 | No disponible en la informacion | Modelo base original |
| Modelos MoE de tamano similar (p. ej. familia DeepSeek o Qwen) | No disponible | No disponible | No disponible | No disponible | No disponible |

La unica comparacion directa documentada es con la variante HQ8 del mismo autor, que prioriza precision (81-83/100 en Code-100, 100% de capacidad, 81,57 GiB) frente a la velocidad de esta variante Track C.

## Limitaciones y advertencias

- Solo funciona con el motor Qwegn v0.41.0+ en Apple Silicon; no es portable a otros runtimes ni plataformas.
- Idiomas limitados a ingles y chino; no se documenta soporte de castellano ni de otras lenguas.
- La cuantizacion a 2,36 bits por parametro media implica perdida de precision: 78/100 en Code-100 frente a 81-83/100 de la variante HQ8.
- Riesgo de alucinacion inherente al modelo base; no se documentan evaluaciones especificas de factualidad mas alla de los needles verbatim.
- No se dispone de informacion sobre sesgos conocidos del modelo base.
- El modelo base y el pack tienen licencia Apache 2.0, lo que permite uso comercial, pero la dependencia del runtime Qwegn puede condicionar el despliegue en produccion.
- El repositorio registra 0 descargas en el momento de la consulta, por lo que la validacion por parte de la comunidad es practicamente inexistente.
- La informacion sobre el entrenamiento del modelo base (tokens, dataset, RLHF) no esta disponible.

## Enlaces

- Pack cuantizado: https://huggingface.co/qwegnai/ERNIE-5.5-Flash-Preview-QWP-Mixed-Fast
- Modelo base: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview
- Variante HQ8 (Track C alternativa): https://huggingface.co/qwegnai/ERNIE-5.5-Flash-Preview-QWP-Mixed
- Motor de inferencia Qwegn: https://github.com/qwegnai/qwegn
