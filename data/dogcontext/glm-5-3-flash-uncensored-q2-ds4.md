# DogContext/GLM-5.3-Flash-Uncensored-Q2-ds4

## Resumen

GLM-5.3-Flash-Uncensored-Q2-ds4 es una cuantización GGUF de muy baja precisión (alrededor de 2 bits) del modelo abliterado GLM-5.3-Flash-Uncensored, desarrollada por DogContext para el motor de inferencia ds4 (DwarfStar) de antirez. El modelo original es una versión «uncensored» (abliterada) del GLM-5.3-Flash de zai-org, realizada por orcarouter, que elimina los rechazos de contenido en tareas convencionales. Esta cuantización permite ejecutar el modelo completo de 320B parámetros (MoE con ~18B activos) de forma residente en un único Mac con 128 GB de memoria unificada Apple Silicon, algo que no era posible con los pesos FP8 originales (306 GiB) ni con las versiones NVFP4 (177 GiB, solo GPUs de centro de datos).

El modelo mantiene la arquitectura Glm5Next con atención híbrida KDA-linear y sparse-DSA, 1M de contexto, y el bloque nativo de predicción multi-token (MTP) para decodificación especulativa. La cuantización no es uniforme: los expertos enrutados se comprimen con IQ2_XXS y Q2_K, mientras que las rutas de control (router, KDA gates, indexer) se mantienen en mayor precisión para minimizar errores en la selección de expertos. Está calibrado con una matriz de importancia (imatrix) de 1,5 millones de tokens. Se distribuye bajo licencia MIT y soporta los idiomas inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glm5Next (MoE híbrido, atención KDA-linear + sparse-DSA) |
| Parametros totales | 320.759.404.382 (320B) |
| Parametros activos | ~18B (MoE, top-8 de 288 expertos enrutados + 1 compartido) |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | IQ2_XXS (gate/up de expertos), Q2_K (down de expertos), Q4_K (KDA gates), Q8_0 (embeddings/output), Q8/source (trunk, shared expert, attention), bf16 (router, norm) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF (formato ds4 / DwarfStar, no compatible con llama.cpp principal) |

## Arquitectura y entrenamiento

El modelo base es GLM-5.3-Flash de zai-org, una arquitectura MoE híbrida con 45 capas (3 densas + 42 MoE), 288 expertos enrutados más 1 compartido, y selección top-8. La atención combina mecanismos KDA-linear (lineal con núcleo de atención) y sparse-DSA (atención dispersa), y el modelo incorpora un bloque nativo de predicción multi-token (MTP) para decodificación especulativa. El vocabulario tiene 154.880 tokens.

Los detalles del entrenamiento original (número de tokens, composición del dataset, técnicas de alineación como RLHF/DPO) no se proporcionan en la información disponible. La versión uncensored fue creada mediante abliteración (eliminación de la dirección de rechazo en el espacio de activaciones) sobre el modelo original, sin modificar el router ni los pesos de los expertos. La cuantización se calibró con una importancia matrix de 1,5 millones de tokens recopilada con el runtime ds4 sobre un conjunto de datos de código, llamadas a herramientas, lenguaje, contexto largo y razonamiento. La matriz se aplicó sobre los pesos uncensored, lo que es válido porque la abliteración no altera las activaciones de los expertos enrutados.

## Capacidades

- Generación de texto en inglés y chino con ventana de contexto de 1M tokens.
- Razonamiento multi-step con modo «thinking» opcional (activable mediante alias `glm-5.3-flash-nothink` o `reasoning_effort: none` para respuestas directas).
- Generación de código y soporte de llamadas a herramientas (tool calling), como se refleja en el conjunto de calibración (agentic/tool-call).
- Decodificación especulativa nativa mediante MTP, que acelera la inferencia en el motor ds4.
- Visión opcional mediante un sidecar de encoder oficial (los pesos de texto no se ven afectados por la abliteración).
- Capacidad de ejecución residente en hardware Apple Silicon con 128 GB de memoria unificada.
- Ausencia de rechazos en tareas convencionales (comportamiento abliterado, dependiente de la categoría de prompt).

## Casos de uso

- Investigación en seguridad ofensiva (red team): el modelo puede generar payloads, exploits y técnicas de ataque sin rechazos, lo que permite a investigadores autorizados evaluar vulnerabilidades y desarrollar contramedidas. Su ejecución local y la licencia MIT facilitan su uso en entornos aislados.
- Evaluación de agentes de código: con soporte de tool calling y 1M de contexto, puede integrarse en pipelines de pruebas de agentes autónomos que necesitan razonar sobre repositorios completos y ejecutar múltiples pasos.
- Asistente de programación local en Mac: desarrolladores con un Mac de 128 GB pueden ejecutar un modelo de 320B (18B activos) de forma residente para generación y revisión de código, sin depender de servicios en la nube ni de GPUs de centro de datos.
- Análisis de documentos extensos: la ventana de 1M tokens permite procesar libros técnicos, bases de código completas o largos informes en una sola pasada, manteniendo el contexto completo.
- Chatbots de investigación sin censura: para estudios de comportamiento de modelos de lenguaje sin restricciones de seguridad, este modelo permite explorar cómo responde un LLM de gran escala cuando se eliminan los rechazos, en entornos controlados.
- Prototipado de aplicaciones multilingües: al soportar inglés y chino, puede servir como base para sistemas de traducción o generación de contenido en ambos idiomas, con capacidad de razonamiento avanzado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta métricas de rendimiento de inferencia medidas en un Apple M5 Max con MTP habilitado: decodificación de ~22–23 tokens por segundo y prefill de ~360 tokens por segundo. No hay datos comparativos con otros modelos.

## Requisitos de hardware

- VRAM estimada: ~93 GiB de memoria residente (el archivo GGUF ocupa 96,5 GB, ~89,9 GiB). Requiere un Mac con 128 GB de memoria unificada para dejar ~35 GiB libres para el sistema operativo y la caché de KV.
- GPU recomendadas: exclusivo para Apple Silicon con Metal. Probado en M5 Max; se espera compatibilidad con otros chips de la misma familia con al menos 128 GB.
- No es compatible con GPUs NVIDIA ni AMD; el motor ds4 solo soporta Metal en macOS.
- Opciones de despliegue: motor ds4 (DwarfStar) de antirez, compilable desde fuente con `make`. No funciona con llama.cpp principal (el soporte para glm5next está en un PR en borrador, #27754).
- Latencia y throughput medidos (M5 Max, MTP activado): ~22–23 tok/s en decodificación, ~360 tok/s en prefill. El primer arranque tarda ~2 minutos mientras se mapea ~90 GiB desde SSD.
- Requiere ajuste del límite de memoria wired de Metal: `sudo sysctl iogpu.wired_limit_mb=118000` (una vez por arranque).

## Comparativa con modelos similares

La siguiente tabla compara esta cuantización con las otras versiones publicadas del mismo modelo uncensored:

| Version | Tamano | Plataforma | MTP | Cuantizacion calibrada |
|---|---|---|---|---|
| `orcarouter/GLM-5.3-Flash-Uncensored-FP8` | ~306 GiB | NVIDIA GPUs · vLLM | No | No |
| `orcarouter/GLM-5.3-Flash-Uncensored-NVFP4` | ~177 GiB | 8×H100 / Blackwell · vLLM | No | No |
| `Uncensored-GGUF` (Q2_K, llama.cpp) | ~90 GiB | llama.cpp (PR en borrador) | No | No |
| **Esta version (ds4)** | **96,5 GB** | **Apple Silicon 128 GB · ds4/Metal** | **Si** | **Si (imatrix 1,5M)** |

No se dispone de comparativas con otros modelos MoE de tamaño similar (por ejemplo, DeepSeek-V3 o Qwen MoE) en la información proporcionada.

## Limitaciones y advertencias

- Cuantización de ~2 bits: la agresiva compresión puede provocar bucles de repetición con configuraciones de temperatura baja o greedy. Se recomienda usar `--temp 1.0 --top-p 0.95 --min-p 0.05`.
- El modo «thinking» es muy verboso a 2 bits y puede agotar el presupuesto de tokens antes de responder; se recomienda usar el alias `glm-5.3-flash-nothink` para respuestas directas.
- Comportamiento abliterado: los rechazos se eliminan en gran parte, lo que implica que el modelo puede generar contenido dañino si se le pide explícitamente. La model card advierte que su uso es responsabilidad del usuario y está destinado a investigación local autorizada, no a producir contenido perjudicial.
- Solo compatible con el motor ds4 en macOS con Metal; no funciona con llama.cpp principal ni con otras plataformas.
- Requiere hardware específico (Mac con 128 GB de memoria unificada); no puede ejecutarse en GPUs convencionales.
- Idiomas limitados a inglés y chino; el rendimiento en otros idiomas no está verificado.
- El primer arranque tarda ~2 minutos (mapeo de memoria desde SSD), lo que puede confundirse con un cuelgue.
- No se han publicado benchmarks de calidad, por lo que el impacto real de la cuantización en tareas de razonamiento, código o matemáticas es desconocido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DogContext/GLM-5.3-Flash-Uncensored-Q2-ds4
- Modelo base abliterado (FP8): https://huggingface.co/orcarouter/GLM-5.3-Flash-Uncensored-FP8
- Modelo original: https://huggingface.co/zai-org/GLM-5.3-Flash
- Repositorio ds4 / DwarfStar: https://github.com/antirez/ds4
- PR de llama.cpp para soporte de glm5next (borrador): https://github.com/ggml-org/llama.cpp/pull/27754
