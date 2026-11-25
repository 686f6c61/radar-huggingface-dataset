# kapitoshkina-ai/Hy4-flash-WHT128-HLUT4

## Resumen

Hy4-flash-WHT128-HLUT4 es una cuantización comunitaria del modelo multimodal tencent/Hy4-flash, publicada por el usuario kapitoshkina-ai. El modelo base es un transformer de tipo Mixture of Experts (MoE) con 224.000 millones de parámetros totales y 12.000 millones activos por token, orientado a tareas image-text-to-text y conversacionales. Esta versión concreta reduce el peso de los expertos enrutados a 4,125 bits por peso (bpw) mediante una técnica propia denominada WHT128-HLUT4 con retroalimentación de error RAREBAL-LDLQ en FP64.

La relevancia de esta ficha radica en que no se trata de una cuantización convencional en GGUF, sino de un conjunto de shards nativos sin dividir (unsplit) pensados para un motor de inferencia propio en C++17/20, con kernels HIP para gfx906 (AMD MI50) y Tensix para Tenstorrent Blackhole P150A. El autor declara que el spine no experto (routers, normas, ViT SigLIP2 de 27 capas y un drafter especulativo DFly2 de 5 tokens) se conserva sin pérdida, y que los 41 layers LatentMoE con 512 expertos cada uno (20.992 expertos) se empaquetan en 205 shards safetensors que suman 71,35 GiB.

El interés práctico es acotado pero muy específico: permite ejecutar un MoE de 224B con 12B activos en un nodo heterogéneo de 192 GiB de VRAM compuesto por cinco MI50 y dos P150A, algo inviable con los pesos en BF16 o FP8. La licencia es la Tencent Hy License v1.0, con aviso de modificación bajo la sección 4(b).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (LatentMoE) multimodal con ViT SigLIP2 de 27 capas y drafter especulativo DFly2 |
| Parametros totales | 224.000 millones (modelo base) |
| Parametros activos | 12.000 millones (modelo base) |
| Longitud de contexto | 2,2 millones de tokens (declarado en la model card para el conjunto del sistema) |
| Tipos de cuantizacion | WHT128-HLUT4 a 4,125 bpw en expertos enrutados; spine no experto sin pérdida |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License v1.0 (license_name: tencent-hy-license) |
| Formato de pesos | safetensors nativos sin dividir (205 shards de expertos + 45 ficheros de spine) |

## Arquitectura y entrenamiento

El modelo base Hy4-flash es un MoE multimodal: 41 capas LatentMoE con 512 expertos enrutados por capa (20.992 expertos en total) y 224B parámetros totales de los que 12B se activan por token. Incorpora un codificador visual SigLIP2 de 27 capas y un drafter especulativo DFly2 de 5 tokens para decodificación especulativa. La model card de esta cuantización no aporta datos sobre el corpus de entrenamiento del modelo original (número de tokens, composición del dataset, si hubo RLHF o DPO); esa información correspondería a la model card de tencent/Hy4-flash, no incluida en la información disponible.

La innovación de esta release es puramente de compresión e inferencia. Los expertos enrutados se cuantizan a 4,125 bpw con transformada WHT de tamaño 128 y tablas de búsqueda (HLUT4), aplicando retroalimentación de error causal reverse-Cholesky en FP64 (RAREBAL-LDLQ). El spine (routers, indexadores, normas, ViT y drafter) se reempaqueta en shards alineados al hardware sin cuantización con pérdida. El autor reporta una SQNR media de pesos de 17,934 dB sobre 3.936 matrices (desviación típica 0,193; sin capas fuera de control) y una divergencia KL top-10 en held-out de 6,47e-6 nats frente a 0,08-0,44 nats de los GGUF públicos de referencia. También declara coincidencia bit-exacta en 96/96 tokens greedy entre M=1 y M=6 en siete aceleradores.

## Capacidades

- Generación de texto y conversación multi-turno, con plantilla de chat incluida (chat_template.jinja).
- Procesamiento image-text-to-text: el pipeline declarado es image-text-to-text y el spine conserva el ViT SigLIP2 de 27 capas.
- Razonamiento y matemáticas: capacidades heredadas del modelo base Hy4-flash; no se detallan en la información disponible.
- Generación de código: el autor cita una prueba con el conjunto T1_CPP_CODE a 91,6 tok/s, lo que indica uso sobre código, aunque no se documentan métricas de calidad.
- Decodificación especulativa nativa mediante el drafter DFly2 de 5 tokens, con tasas de aceptación declaradas del 98,0 % (5,88 tokens por paso).
- Soporte de contexto largo: el sistema declara encaje de 2,2M de tokens en 192 GiB de VRAM más 61,47 GiB de DDR4 usada como memoria externa (Engram).
- Tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Inferencia de un MoE de 224B en hardware AMD de gama antigua: el formato está validado sobre kernels HIP para gfx906 con 403 kernels sin spills, lo que permite reutilizar clústeres de MI50 en lugar de migrar a GPUs más recientes. Adecuado cuando el coste de hardware es la restricción principal.
- Despliegue en nodos heterogéneos CPU-GPU-acelerador: el paquete incluye un mapa de expertos calientes (hotmap Zipfian) que concentra el 95,43 % de la masa enrutada en los 74 expertos superiores, lo que permite planificar la colocación de expertos entre cinco MI50 y dos P150A.
- Procesamiento de documentos largos y multimodal: con contexto declarado de hasta 2,2M de tokens y codificador visual, encaja en tareas de análisis de expedientes, informes o repositorios completos que combinan texto e imágenes.
- Servicio de chat con latencia interactiva: la decodificación especulativa DFly2 alcanza 82,74 tok/s a 394K de contexto y 91,6 tok/s en código, suficiente para asistentes conversacionales en producción sobre el hardware objetivo.
- Restauración rápida de caché KV entre sesiones: la restauración en frío desde NVMe de bloques .kvblk llega a 1.070.446 tok/s a 262K de contexto, útil para reanudar sesiones largas sin recalcular el prefill.
- Investigación en cuantización extrema: la release incluye pack_stats.csv, outliers_hlut4.csv, manifiesto y sumas SHA-256, lo que la convierte en un banco de pruebas reproducible para estudiar el efecto de 4,125 bpw sobre un MoE de gran tamaño.
- Prefill por lotes en pipelines offline: 1.600 tok/s en prefill de 4K con M=4096 permite procesar lotes de documentos en modo batch en un solo nodo.

## Benchmarks y rendimiento

Los datos disponibles son métricas de fidelidad y throughput del autor, no benchmarks de calidad de tareas (MMLU, HumanEval, GSM8K). No se han publicado resultados de benchmarks de calidad en la información disponible.

| Metrica | WHT128-HLUT4 (4,125 bpw) | Referencia publica (GGUF Hy4-flash) |
|---|---|---|
| KL top-10 en held-out | 6,47e-6 nats | 0,08 - 0,44 nats |
| KLD sobre vocabulario completo (120.832) | 7,76e-6 nats | no disponible |
| EAR@10 (acoplamiento top-10) | 100,0 % | no disponible |
| Coincidencia greedy 96 tokens (M=1 vs M=6) | 96/96, diff max 0,0 | verificación DFly2 bit-exacta |
| SQNR medio de pesos (3.936 matrices) | 17,934 dB (sd 0,193) | ganancia de +1,98 dB en activaciones |
| Compresión de VRAM total | 1,74x (157,4 / 90,37 GiB) | 1,97x frente a BF16 + FP8 |
| Prefill en frío 4K (M=4096) | 1.600,0 tok/s (2.496,9 ms) | 923,4 tok/s |
| Decodificación DFly2 en vivo | 82,74 tok/s a 394K (98,0 % aceptación) | 1,56x el pico de referencia |
| Restauración .kvblk desde NVMe | 1.070.446 tok/s a 262K | 467,8K tok/s |

## Requisitos de hardware

- VRAM estimada: 90,37 GiB para los pesos cuantizados (71,4 GiB de expertos + 19,0 GiB de spine desempaquetado), más 61,47 GiB de DDR4 usados como memoria externa de expertos (Engram) para alcanzar el contexto de 2,2M.
- Configuración de referencia del autor: 5x AMD MI50 (gfx906) + 2x Tenstorrent Blackhole P150A, total 192 GiB de VRAM, sobre la arquitectura denominada SB-M5-P2-192G.
- GPU consumer: no cabe en ninguna GPU consumer actual; los 90,37 GiB de pesos exceden la VRAM de una RTX 4090 (24 GB) o de varias en paralelo sin offload masivo a RAM.
- Opciones de despliegue: el formato no es GGUF ni sigue la API de vLLM, llama.cpp, Ollama o TGI. Requiere el motor propio en C++17/20 del repositorio bespokeontology/hy4-flash-wht128-hlut4, con kernels HIP para gfx906 y kernels Tensix C++20 para Blackhole P150A.
- Throughput declarado: prefill de 1.600 tok/s a 4K con M=4096; decodificación de 53,30 tok/s en M=1 crudo y hasta 82,74 tok/s con DFly2 a 394K de contexto; 91,6 tok/s en el conjunto T1_CPP_CODE.
- Latencia de restauración de caché: 244,9 ms para 262K tokens y 688,4 ms para 780K tokens desde NVMe en frío.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Hy4-flash-WHT128-HLUT4 (esta ficha) | 224B | 12B | 2,2M (sistema) | safetensors nativos, 4,125 bpw | Tencent Hy License v1.0 | Hugging Face, 93,3 GB, 22 descargas |
| tencent/Hy4-flash (base) | 224B | 12B | no disponible en esta ficha | safetensors originales | Tencent Hy License v1.0 | Hugging Face (oficial) |
| GGUFs públicos de Hy4-flash | 224B | 12B | no disponible | GGUF | Tencent Hy License v1.0 | Hugging Face (comunidad) |
| Motores genéricos (vLLM, llama.cpp, TGI) | no aplica | no aplica | no aplica | no soportan este formato | no aplica | no disponible para estos pesos |

La comparación de rendimiento solo puede hacerse contra los GGUFs públicos citados por el autor: esta release declara una divergencia KL top-10 entre 12.000 y 68.000 veces menor y un throughput de decodificación 1,56 veces superior, aunque no se especifica qué cuantización GGUF concreta se usa como referencia.

## Limitaciones y advertencias

- El formato no es estándar: no funciona con vLLM, llama.cpp, Ollama ni TGI. Sin el motor propio del repositorio del autor, los pesos son inutilizables.
- El hardware objetivo es muy específico (AMD gfx906 y Tenstorrent Blackhole P150A). En GPUs NVIDIA no hay soporte documentado en la información disponible.
- El contexto de 2,2M depende de usar 61,47 GiB de DDR4 como memoria de expertos; sin ese offload, el contexto útil será mucho menor.
- Las métricas de fidelidad y throughput las publica el propio autor; no hay verificación independiente en la información disponible.
- No se han publicado benchmarks de calidad de tareas (MMLU, HumanEval, GSM8K) para esta cuantización; se desconoce la degradación real en razonamiento, código y matemáticas a 4,125 bpw.
- Idiomas soportados no documentados: no se puede garantizar un comportamiento correcto fuera de los idiomas del modelo base.
- Riesgo de alucinación: inherente al modelo base; no se documenta ninguna mitigación específica en esta release.
- Sesgos conocidos: no disponible.
- Licencia Tencent Hy License v1.0: es una licencia con condiciones ("other"), no una licencia de código abierto estándar. Debe revisarse el fichero LICENSE antes de cualquier uso comercial; la sección 4(b) obliga a declarar las modificaciones de cuantización.
- El repositorio tiene 22 descargas y 0 likes, lo que indica una validación comunitaria prácticamente nula.
- La fecha de creación del repositorio (2026-11-22) y el contenido de la model card deben tratarse con cautela; verifique siempre las sumas SHA-256 incluidas antes de usar los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kapitoshkina-ai/Hy4-flash-WHT128-HLUT4
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Repositorio del motor y release v1.0.0-hlut4-192g: https://github.com/bespokeontology/hy4-flash-wht128-hlut4/releases/tag/v1.0.0-hlut4-192g
- Repositorio GitHub principal: https://github.com/bespokeontology/hy4-flash-wht128-hlut4
- Licencia: fichero LICENSE incluido en el repositorio de Hugging Face (Tencent Hy License v1.0)
