# qwegnai/ERNIE-5.5-Flash-Preview-hq8g32-shvq15g64-shvq3g64

## Resumen

ERNIE-5.5-Flash-Preview es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Baidu, con 280.000 millones de parámetros totales y 14.000 millones activos por token. Esta ficha concreta no es el modelo original, sino un pack de pesos cuantizados publicado por el usuario `qwegnai` para el motor de inferencia Qwegn, un runtime nativo en Swift 6.2 y Metal 4 diseñado específicamente para Apple Silicon. El pack comprime el modelo original hasta 81,57 GiB mediante una combinación de cuantización HQ8 en el tronco denso y cuantización vectorial esférica Hadamard (SHVQ) en los expertos enrutados del MoE.

La relevancia de este artefacto es práctica: permite ejecutar un modelo de 280B con contexto nativo de 1.048.576 tokens de forma 100% residente en un Mac con 128 GB de memoria unificada, algo imposible con los formatos convencionales (safetensors, GGUF o MLX). Incluye además un borrador especulativo (`DSpark`) y un índice disperso (`FlashIndexer`) empaquetados junto a los pesos, así como un índice QLSA para caché de prefijos.

No obstante, conviene subrayar que este pack no es un archivo safetensors ni GGUF: usa el contenedor propietario `QWP1` y solo carga en Qwegn v0.41.0 o superior. Para cualquier otro runtime, el punto de partida debe ser el modelo base `baidu/ERNIE-5.5-Flash-Preview`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `ernie5_5_moe`: transformer MoE con 43 capas (37 HCA 128:1 + SWA 128 tok + 6 MLA-DSA con RoPE desacoplado), atención multi-cabeza latente y compresión agresiva |
| Parametros totales | 280 B |
| Parametros activos | 14 B por token (512 expertos enrutados, top-10 + 1 experto compartido) |
| Longitud de contexto | 1.048.576 tokens (contexto nativo) |
| Tipos de cuantizacion | HQ8_G32 (tronco denso, 8,5 bpw), SHVQ15_G64 (expertos `gate_proj`/`up_proj`, 1,75 bpw), SHVQ3_G64 (expertos `down_proj`, 3,25 bpw), BF16/F32 (embeddings, routers, normas); media de 2,52 bits/parámetro |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Contenedor propietario `QWP1` (`model.qwp`, `dspark.qwp`, `flashindexer.qwp`, `assets/model.qlsa`); no es safetensors, GGUF ni MLX |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura MoE denominada `ernie5_5_moe` con 43 capas. La mayoría de capas (37) usan atención fuertemente comprimida (HCA) con una ratio de compresión 128:1 combinada con una ventana deslizante de 128 tokens; las 6 capas restantes emplean atención multi-cabeza latente (MLA-DSA) con RoPE desacoplado y un `FlashIndexer` basado en transformada de Walsh-Hadamard de 64 cabezas. El bloque MoE consta de 512 expertos enrutados con activación dual-split sigmoid top-10 más un experto compartido con 2048 dimensiones intermedias y `moe_latent_size=2048`. La dimensión oculta es 4096 y el vocabulario 201.216 tokens. Incorpora además un mecanismo de compresión multi-cabeza Sinkhorn-20 de 4 flujos (mHC) y una cabeza de salida `MultiMax`.

No se dispone de información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) en la documentación proporcionada. El pack de `qwegnai` no reentrena el modelo: únicamente aplica un esquema de cuantización mixta y añade artefactos de inferencia (borrador especulativo `DSpark` de 4,39 GiB, índice `FlashIndexer` de 3 MiB y caché de prefijos QLSA). La innovación técnica destacable es la cuantización vectorial esférica Hadamard sobre los expertos enrutados, que reduce el peso de los mismos a 1,75 y 3,25 bits por peso manteniendo el tronco denso en 8,5 bpw para preservar calidad en código y tool calling.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de razonamiento configurable (`--reasoning low/off`).
- Generación de código: 47/50 en HumanEval y 34–36/50 en MBPP según la configuración de decodificación.
- Soporte nativo de tool calling mediante la sintaxis paralela `<ernie:tool_call>` y el formato de chat `chatv2p3`.
- Capacidad agéntica: 72/88 (81,8%) en la suite de evaluación agéntica de `llmprobe`.
- Capacidades multilingües limitadas a inglés y chino.
- Contexto largo verificado: 3/3 needles verbatim a 16K y escalado de prefill hasta 65,6K tokens.
- Decodificación especulativa integrada mediante `DSpark` con programación de confianza (`--dspark-confidence-schedule`).
- Caché de prefijos cálido con aceleración de 77,2× (de 1.389 ms a 18 ms).
- Fidelidad determinista: 36/36 (100%) con probabilidad top-1 media de 0,999 y 3/3 en repetibilidad.

## Casos de uso

- **Asistencia de código en local sobre Mac**: el pack permite ejecutar un modelo de 280B con 47/50 en HumanEval directamente en un Mac de 128 GB, sin depender de la nube, usando el motor Qwegn y la decodificación especulativa `DSpark` para alcanzar 62,78 tok/s en salida JSON.
- **Análisis de repositorios completos**: con 1.048.576 tokens de contexto nativo y prefill de 1.000 tok/s a 16K, el modelo puede ingerir bases de código extensas o documentación técnica completa en una sola pasada.
- **Agentes autónomos con tool calling**: la conformidad del 100% en la API de `llmprobe` (292/292) y el soporte de `<ernie:tool_call>` paralelo lo hacen adecuado para pipelines agénticos que encadenan llamadas a herramientas.
- **Atención al cliente multilingüe (en/zh)**: conversaciones multi-turno con contexto largo y caché de prefijos cálido (18 ms) para reutilizar el system prompt y el historial entre peticiones.
- **Generación de JSON estructurado**: la configuración `DSpark` con programación de confianza alcanza 5,77 tokens por ronda en salida JSON, útil para extracción de datos y APIs.
- **Prototipado de investigación en Apple Silicon**: desarrolladores que necesitan evaluar un MoE de 280B en hardware de consumo profesional (M5 Max) sin infraestructura de GPU dedicada.
- **Procesamiento de documentos legales o técnicos largos**: la ventana de 1M tokens y la fidelidad verbatim en needles a 16K permiten tareas de recuperación y resumen sobre corpus extensos.

## Benchmarks y rendimiento

Resultados medidos por el autor del pack en un Apple M5 Max (128 GB, GPU de 40 núcleos, macOS 26.2+) con Qwegn v0.41.0+ y `--kv-mode q4 --temperature 0`:

| Metrica | Resultado |
|---|---|
| Prefill CLI a 4K | 1.051,3 tok/s (1.049,1 wall) |
| Prefill CLI a 16K | 1.000,0 tok/s (3/3 needles verbatim) |
| Decodificación serial CLI (`mtp=0`) | 30,86–32,15 tok/s |
| Decodificación `DSpark` (JSON) | 62,78 tok/s (5,77 tok/ronda) |
| Prefill `llmprobe` (513 → 65,6K) | 723 / 1.005 / 1.012 / 976 / 944 / 915 tok/s |
| Decodificación `llmprobe` (513 → 65,6K) | 33,5 → 32,3 tok/s |
| Caché de prefijos cálido | 77,2× (1.389 → 18 ms) |
| Conformidad API | 292/292 (100%) |
| Capacidad | 100% (`strong`) |
| Agéntico | 72/88 (81,8%) |
| Fidelidad | 36/36 (100%), top-1 medio 0,999 |
| Code-100 con `DSpark` | 81/100 (47/50 HumanEval, 34/50 MBPP) |
| Code-100 a `d=0` | 83/100 (47/50 HumanEval, 36/50 MBPP) |

No se han publicado resultados de benchmarks del modelo base frente a otros modelos en la información disponible; los datos anteriores miden el pack cuantizado en el motor Qwegn, no el modelo original en otros runtimes.

## Requisitos de hardware

- **Memoria**: 81,57 GiB de pesos (`80,02 GiB` de arena GPU) más 4,39 GiB del borrador `DSpark`; residencia total de 80,77–80,90 GiB en CLI corto y 85,73–85,82 GiB en CLI de 4K–16K.
- **Hardware objetivo**: Apple Silicon con 128 GB de memoria unificada; el autor reporta ejecución 100% residente en un M5 Max (`Mac17,6`).
- **GPU dedicadas**: no aplica; el pack solo carga en Qwegn, que es un runtime Metal para Apple Silicon. No hay soporte para A100, H100 ni RTX 4090.
- **GPU de consumo**: cabe en Macs de 128 GB; no cabe en Macs de 64 GB ni en GPUs de consumo convencionales por el tamaño del pack.
- **Despliegue**: exclusivamente Qwegn v0.41.0+ (instalación desde GitHub y `qwg pull`). No es compatible con vLLM, llama.cpp, Ollama, TGI ni MLX.
- **Rendimiento**: prefill de 1.051,3 tok/s a 4K y 1.000 tok/s a 16K; decodificación de 30,86–32,15 tok/s en serial y 62,78 tok/s con `DSpark`; cero asignaciones en estado estacionario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ERNIE-5.5-Flash-Preview (este pack, HQ8_G32) | 280B / 14B activos | 1.048.576 | Apache 2.0 | QWP1 (Qwegn) | Máxima calidad en código y tool calling; 81,57 GiB |
| ERNIE-5.5-Flash-Preview (variante HQ4_G32_M5) | 280B / 14B activos | 1.048.576 | Apache 2.0 | QWP1 (Qwegn) | Prefill 1.544,9 tok/s y decode 110,6 tok/s con `DSpark`; 77,91 GiB; menor precisión en el tronco |
| `baidu/ERNIE-5.5-Flash-Preview` (original) | 280B / 14B activos | 1.048.576 | Apache 2.0 | safetensors (presumiblemente) | Modelo base sin cuantizar; no ejecutable en Mac de 128 GB |
| Alternativas de otros fabricantes | no disponible | no disponible | no disponible | no disponible | No se dispone de comparativas publicadas en la información proporcionada |

## Limitaciones y advertencias

- **Compatibilidad restringida**: el pack solo carga en Qwegn v0.41.0+; no es safetensors, GGUF ni MLX. Cualquier otro runtime requiere el modelo base.
- **Idiomas**: solo inglés y chino; no hay soporte declarado de castellano ni de otros idiomas.
- **Hardware**: requiere un Mac con 128 GB de memoria unificada; no es viable en equipos de 64 GB ni en GPUs NVIDIA/AMD.
- **Sesgos y alucinaciones**: no se documentan evaluaciones de sesgo ni tasas de alucinación en la información disponible; como todo LLM, presenta riesgo de generar contenido incorrecto, especialmente en dominios especializados.
- **Licencia**: Apache 2.0 permite uso comercial, pero el pack depende del modelo base de Baidu y de su licencia; conviene verificar los términos del modelo original antes de producción.
- **Cuantización agresiva**: los expertos enrutados se comprimen a 1,75 y 3,25 bits por peso; aunque el autor reporta fidelidad top-1 de 0,999, puede haber degradación en tareas fuera de las evaluadas (código, agentes, needles).
- **Madurez**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 25 de noviembre de 2026; es un artefacto reciente y de un único autor, sin validación independiente.
- **Caché y determinismo**: los resultados de rendimiento se midieron con `--temperature 0` y `--kv-mode q4`; otros ajustes pueden alterar latencia y calidad.

## Enlaces

- Pack en Hugging Face: https://huggingface.co/qwegnai/ERNIE-5.5-Flash-Preview-hq8g32-shvq15g64-shvq3g64
- Modelo base: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview
- Variante HQ4_G32_M5: https://huggingface.co/qwegnai/ERNIE-5.5-Flash-Preview-hq4g32m5-hq8head-shvq15g64-shvq3g64
- Motor Qwegn: https://github.com/qwegnai/qwegn
