# qwegnai/ERNIE-5.5-Flash-Preview-QWP-Mixed

## Resumen

ERNIE-5.5-Flash-Preview-QWP-Mixed es un paquete de pesos cuantizados del modelo base `baidu/ERNIE-5.5-Flash-Preview`, publicado por el usuario qwegnai para su uso exclusivo con el motor de inferencia Qwegn (v0.41.0+), un runtime escrito en Swift 6.2 y Metal 4 orientado a Apple Silicon. No se trata de un modelo nuevo, sino de una reempaquetadura del modelo MoE de Baidu (280B parametros totales, 14B activos por token) en un contenedor propietario `QWP1` que combina cuantizacion mixta HQ8 y SHVQ para reducir el peso en disco a 81,57 GiB (2,52 bits por parametro).

El interes practico del paquete es que permite ejecutar un modelo de 280B de parametros de forma 100% residente en un Mac con 128 GB de memoria unificada, algo imposible con los formatos estandar (GGUF, safetensors, MLX) a esa escala. Incorpora ademas un drafter especulativo (`DSpark`) y un indice de atencion dispersa (`FlashIndexer`) empaquetados junto con los pesos, lo que habilita decodificacion especulativa y cache de prefijos largos sin dependencias externas.

La relevancia es acotada: el paquete solo carga en Qwegn, no es compatible con llama.cpp, vLLM, Ollama ni MLX, y su utilidad queda restringida a desarrolladores con hardware Apple Silicon de gama alta (M5 Max o superior con 128 GB). Para el resto de escenarios conviene usar el modelo base original en formatos estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `ernie5_5_moe`: 43 capas (37 HCA 128:1 + SWA de 128 tokens, 6 MLA-DSA con RoPE desacoplado), 1 capa densa L0 + 42 MoE L1-L42 |
| Parametros totales | 280 B |
| Parametros activos | 14 B por token (512 expertos enrutados, top-10 + 1 experto compartido) |
| Longitud de contexto | 1.048.576 tokens (nativo) |
| Tipos de cuantizacion | Mixta: HQ8_G32 (8,5 bpw), SHVQ15_G64 (1,75 bpw), SHVQ3_G64 (3,25 bpw), BF16, F32; media 2,52 bits/parametro |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Contenedor propietario `QWP1` (`model.qwp`, `dspark.qwp`, `flashindexer.qwp`); no es safetensors, GGUF ni MLX |
| Tamano del paquete | 81,57 GiB (`model.qwp`, 65.605 tensores) + 4,39 GiB (`dspark.qwp`) + 3,00 MiB (`flashindexer.qwp`) |
| Hidden size | 4096 |
| Vocabulario | 201.216 tokens |
| Motor de inferencia | Qwegn v0.41.0+ (Swift 6.2 + Metal 4, Apple Silicon) |
| Repositorio | 92,3 GB |

## Arquitectura y entrenamiento

El modelo base ERNIE-5.5-Flash-Preview es un transformer MoE con una arquitectura hibrida de atencion poco convencional: 37 de sus 43 capas usan Heavily Compressed Attention (HCA) con compresion 128:1 combinada con sliding window attention de 128 tokens, mientras que las 6 capas restantes emplean MLA-DSA con RoPE desacoplado y un `FlashIndexer` de 64 cabezas con transformada de Walsh-Hadamard para enrutamiento disperso. El bloque MoE tiene 512 expertos enrutados con activacion dual-split sigmoid top-10 mas un experto compartido de 2048 de dimension intermedia, con `moe_latent_size=2048`. Ademas incorpora un esquema mHC (multi-head compression) de 4 flujos con normalizacion Sinkhorn-20 y una cabeza de salida `MultiMax`.

Sobre el entrenamiento del modelo base no se proporciona informacion en la documentacion disponible: no se especifican tokens de entrenamiento, composicion del dataset, ni si hubo fases de RLHF, DPO o similar. El paquete QWP-Mixed es unicamente una reempaquetadura de pesos: aplica cuantizacion vectorial esferica (SHVQ) sobre los expertos enrutados y cuantizacion HQ8 de 32 grupos sobre el tronco denso, proyecciones de atencion y cabeza de salida, preservando en BF16/F32 las embeddings, gates del router, normas y parametros mHC. La innovacion tecnica del paquete es el drafter especulativo `DSpark` (Markov cuantizado), que permite decodificacion especulativa con hasta 5,77 tokens por ronda y una politica de confianza programada.

## Capacidades

- Generacion de texto en ingles y chino con contexto nativo de 1.048.576 tokens.
- Razonamiento multi-paso con modo `--reasoning low/off` configurable.
- Generacion de codigo: 47/50 en HumanEval y 34-36/50 en MBPP segun configuracion.
- Tool calling nativo mediante el formato paralelo `<ernie:tool_call>` y el chat template `chatv2p3`.
- Capacidades agenticas: 72/88 (81,8%) en la suite agentic de `llmprobe`.
- Decodificacion especulativa con `DSpark` (drafter neuronal con schedule de confianza y presupuesto MoE de 36).
- Cache de prefijos largos (warm prefix cache) con aceleracion de hasta 77,2x.
- Recuperacion de agujas verbatim en contexto de 16K (3/3 needles).
- Conformidad de API: 292/292 (100%) en la suite de `llmprobe`.
- No soporta vision, audio ni modalidades adicionales segun la informacion disponible.

## Casos de uso

- Procesamiento de documentos extensos en local: con 1.048.576 tokens de contexto nativo, el modelo puede ingerir libros completos, expedientes o bases de codigo en un solo prompt sin fragmentacion, algo util para analisis juridico o auditoria documental en maquinas Apple Silicon.
- Asistencia de codigo en IDE sobre Mac: los 47/50 en HumanEval y el soporte de tool calling permiten integrarlo en flujos de autocompletado y refactorizacion con latencia de decodificacion de 30-63 tok/s en M5 Max.
- Agentes autonomos con multiples pasos: la puntuacion de 81,8% en la suite agentic y el tool calling paralelo lo hacen adecuado para orquestacion de tareas con llamadas a APIs externas.
- Analisis de repositorios completos: el warm prefix cache (18 ms tras 77,2x de aceleracion) permite reutilizar contexto de codebase entre consultas sucesivas sin reprefill.
- Chat multilingue ingles-chino: util para equipos con documentacion bilingue o atencion al cliente en ambos idiomas, aunque sin cobertura de castellano.
- Investigacion sobre cuantizacion extrema: el paquete sirve como referencia reproducible de SHVQ y decodificacion especulativa sobre un MoE de 280B en hardware de consumo profesional.
- Prototipado offline en entornos sin conectividad: al ser 100% residente en memoria unificada, no requiere GPU dedicada ni servicios cloud.

## Benchmarks y rendimiento

Resultados medidos por el autor en un Apple M5 Max (Mac17,6, 128 GB, GPU de 40 nucleos, macOS 26.2+) con `--kv-mode q4 --temperature 0`:

| Metrica | Resultado |
|---|---|
| Prefill CLI 4K (4.087 tok) | 1.051,3 tok/s GPU (1.049,1 wall) |
| Prefill CLI 16K (15.918 tok) | 1.000,0 tok/s (3/3 needles verbatim) |
| Decodificacion serial (`mtp=0`) | 30,86-32,15 tok/s (100% repetibilidad SHA-256) |
| Decodificacion con DSpark d=7 | 62,78 tok/s JSON (5,77 tok/ronda) |
| Prefill scaling (513 → 65,6K) | 723 / 1.005 / 1.012 / 976 / 944 / 915 tok/s |
| Decode scaling (513 → 65,6K) | 33,5 / 33,4 / 33,1 / 32,4 / 32,6 / 32,3 tok/s |
| Warm prefix cache | 77,2x (1.389 → 18 ms) |
| Conformidad API | 292/292 (100%) |
| Capacidad general | 100% (`strong`) |
| Suite agentic | 72/88 (81,8%) |
| Fidelidad | 36/36 (100%, top-1 medio 0,999) |
| Code-100 con DSpark | 81/100 (47/50 HumanEval, 34/50 MBPP) |
| Code-100 sin DSpark (d=0) | 83/100 (47/50 HumanEval, 36/50 MBPP) |

No se han publicado comparaciones directas con otros modelos en la informacion disponible.

## Requisitos de hardware

- Memoria unificada: 128 GB minimo para residencia 100% (80,77-80,90 GiB en CLI corto, 85,73-85,82 GiB en CLI 4K-16K).
- GPU recomendada: Apple M5 Max (40 nucleos Apple10 NAX); no hay soporte para NVIDIA ni AMD.
- No cabe en GPU de consumo tipo RTX 4090 (24 GB) ni en Macs de 64 GB.
- Despliegue exclusivo mediante Qwegn v0.41.0+ (`qwg pull`, `qwg run`); no compatible con vLLM, llama.cpp, Ollama, TGI ni MLX.
- Throughput medido: prefill ~1.000-1.050 tok/s a 4K-16K, decodificacion 30-32 tok/s serial y 62,78 tok/s con DSpark.
- Latencia de cache caliente: 18 ms para reutilizacion de prefijo.
- Sin asignaciones en estado estacionario (0 allocs steady-state) segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware |
|---|---|---|---|---|---|
| ERNIE-5.5-Flash-Preview-QWP-Mixed (este paquete) | 280B totales / 14B activos | 1.048.576 | QWP1 (Qwegn) | Apache 2.0 | Apple M5 Max 128 GB |
| baidu/ERNIE-5.5-Flash-Preview (base) | 280B totales / 14B activos | no disponible en la informacion | safetensors (presumible, no confirmado) | Apache 2.0 | Multi-GPU |
| qwegnai/ERNIE-5.5-Flash-Preview-QWP-Mixed-Fast | 280B totales / 14B activos | 1.048.576 | QWP1 (Qwegn) | Apache 2.0 | Apple M5 Max 128 GB |

La variante Fast del mismo autor usa cuantizacion `HQ4_G32_M5` con 77,91 GiB, prefill de 1.544,9 tok/s y decodificacion de 110,6 tok/s, a costa de menor calidad en codigo y tool use. No se dispone de datos de benchmarks de terceros para comparar con alternativas de otros fabricantes.

## Limitaciones y advertencias

- El paquete solo carga en Qwegn v0.41.0+; no es interoperable con safetensors, GGUF, MLX, vLLM, llama.cpp ni Ollama.
- Requiere Apple Silicon con 128 GB de memoria unificada; inutilizable en cualquier otro hardware.
- Idiomas limitados a ingles y chino; sin soporte declarado de castellano.
- La cuantizacion a 2,52 bits/parametro implica perdida de precision respecto al modelo base, aunque el autor reporta fidelidad top-1 de 0,999 en su suite.
- No se documentan sesgos conocidos, riesgos de alucinacion especificos ni evaluaciones de seguridad del modelo base.
- No hay informacion sobre el dataset de entrenamiento ni sobre alineamiento (RLHF/DPO) del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el formato propietario limita la portabilidad y la inspeccion de pesos.
- El rendimiento reportado procede de un unico banco de pruebas (M5 Max) y no ha sido replicado por terceros.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria.

## Enlaces

- Hugging Face (este paquete): https://huggingface.co/qwegnai/ERNIE-5.5-Flash-Preview-QWP-Mixed
- Modelo base: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview
- Variante Fast: https://huggingface.co/qwegnai/ERNIE-5.5-Flash-Preview-QWP-Mixed-Fast
- Motor Qwegn: https://github.com/qwegnai/qwegn
