# GrootTeam/Groot-19B-A3B-261023-GGUF

## Resumen

Groot-19B-A3B-261023 es un modelo de lenguaje causal con arquitectura de mezcla de expertos (MoE) y capacidad multimodal nativa (entrada de imagen y texto), desarrollado por GrootTeam. Cuenta con aproximadamente 19 000 millones de parámetros totales y activa unos 3000 millones por token, lo que lo sitúa en la franja de modelos "compactos" desplegables en hardware de gama alta de consumo. Se distribuye bajo licencia Apache 2.0 y el repositorio analizado corresponde a la edición cuantizada en GGUF (Q4_K_M).

El modelo parte de Qwen3.6-35B-A3B y se ha post-entrenado con menos de 0,1 miles de millones de tokens de datos de código abierto, según la model card. Su propuesta de valor es doble: por un lado, una relación capacidad/tamaño superior a la de sus referencias declaradas (Qwen3.6-35B-A3B y Gemma-4-26B-A4B); por otro, una ventana de contexto nativa de 262 144 tokens, extensible a ~1 millón con YaRN, que cabe entera en una única GPU de 24 GB en formato GGUF.

Es relevante ahora porque combina tres elementos poco habituales en esta franja de tamaño: contexto largo real, soporte nativo de tool calling con modo de razonamiento explícito (`<think>`) y un presupuesto de tokens de salida reducido (23,1 % menos que Qwen3.6-35B-A3B en la batería de 16 benchmarks reportada). Todo ello con pesos en BF16, FP8, NVFP4 y GGUF.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE causal, multimodal nativa; 40 capas (10 de atención completa, 30 de atención lineal); hidden size 2048 |
| Parametros totales | 18 985 723 008 (~19B), más una capa MTP de 0,4B |
| Parametros activos | ~3B por token (128 expertos enrutados + 1 compartido, 8 enrutados activados por token) |
| Longitud de contexto | 262 144 tokens nativos; extensible a ~1M con YaRN |
| Tipos de cuantizacion | BF16, FP8 (E4M3 dinámica), NVFP4 (expertos) + FP8 (atención), GGUF Q4_K_M |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16, FP8, NVFP4) y GGUF (Q4_K_M) |

Tamaños en disco declarados: BF16 38,9 GB; FP8 20,9 GB; NVFP4 13,5 GB; GGUF Q4_K_M 11,7 GB (el repositorio GGUF ocupa 12,6 GB en total).

## Arquitectura y entrenamiento

Se trata de un transformer MoE con atención híbrida: solo 10 de las 40 capas emplean atención completa y las 30 restantes usan atención lineal, lo que reduce el coste de la caché KV y explica que el modelo pueda sostener 256K de contexto en GPUs de 24 GB. El hidden size es 2048 y el enrutamiento combina 128 expertos enrutados con 1 experto compartido, activando 8 expertos enrutados por token. Incorpora una capa de Multi-Token Prediction (MTP) de 0,4B parámetros, presumiblemente orientada a decodificación especulativa, aunque la model card no detalla el mecanismo de explotación. El modelo es multimodal de forma nativa (pipeline `image-text-to-text`), no mediante un adaptador añadido a posteriori.

En cuanto al entrenamiento, la información disponible es escasa: se sabe que parte de Qwen3.6-35B-A3B y que el post-entrenamiento consume menos de 0,1B tokens de datos de código abierto. No se especifica la composición del dataset, ni si hubo RLHF, DPO u otro método de alineamiento, ni el desglose por etapas (SFT, preferencias, RL). El modo de razonamiento (`<think> … </think>`) está activado por defecto y la model card recomienda parámetros de muestreo distintos para tareas generales, código preciso y modo instruct.

## Capacidades

- Generación de texto y razonamiento en modo "thinking" por defecto, con bloque de cadena de pensamiento separado del resultado final.
- Razonamiento multi-paso y uso de agentes: la model card reporta evaluaciones con scaffolds tipo Claude Code, SWE-agent y mini-swe-agent.
- Tool calling / function calling nativo: los bloques `<tool_call>` se exponen como `tool_calls` estilo OpenAI mediante el parser correspondiente en vLLM o SGLang.
- Comprensión de imagen y texto (pipeline `image-text-to-text`), con arquitectura multimodal nativa.
- Capacidades de código: generación, edición y resolución de tareas de repositorio (NL2Repo-Bench, SWE-bench Pro, DeepSWE 1.1).
- Contexto largo: 262 144 tokens nativos, con resultados reportados en LongBench v2.
- Presupuesto de tokens contenido: la salida media más corta entre los 12 modelos medidos en la comparativa del autor.
- Capacidades multilingües: no disponible (no se declara lista de idiomas).
- Modo instruct/no-thinking disponible, con parámetros de muestreo propios.

## Casos de uso

- Atención al cliente automatizada con historial largo: la ventana de 262K tokens permite mantener conversaciones multi-turno con documentación de producto adjunta sin truncar, y el modo no-thinking reduce latencia en respuestas simples.
- Agente de resolución de incidencias sobre repositorios: con tool calling nativo y contexto de 256K puede indexar un repositorio mediano, ejecutar comandos y aplicar parches dentro de un pipeline de CI/CD, apoyándose en los resultados reportados en SWE-bench Pro y NL2Repo-Bench.
- Automatización de flujos ofimáticos y RPA: la model card incluye AutomationBench y JobBench, lo que sugiere uso como planificador de acciones sobre herramientas corporativas con un número acotado de turnos.
- Análisis de documentos extensos y contratos: lectura de expedientes completos en una sola pasada, con salida corta y estructurada gracias al presupuesto reducido de tokens.
- Asistente de desarrollo en IDE o CLI: integrable vía vLLM o SGLang con parser de razonamiento y de tool calls, ofreciendo trazas de pensamiento auditables separadas de la respuesta.
- Procesamiento de documentos escaneados con extracción de datos: al ser multimodal nativo, puede recibir imágenes de páginas y devolver campos estructurados sin OCR intermedio.
- Despliegue en el borde o en estaciones de trabajo: la edición GGUF Q4_K_M (11,7 GB) permite servir 128K de contexto en una RTX 4060 Ti de 16 GB, útil para prototipos locales con datos sensibles que no pueden salir de la máquina.
- Investigación en razonamiento eficiente: base para estudiar decodificación especulativa con MTP y atención lineal en modelos de ~3B activos.

## Benchmarks y rendimiento

Datos reportados por el autor del modelo (modo thinking, esfuerzo de razonamiento por defecto; temp=1.0, top_p=0.95, top_k=20, ventana de 256K salvo indicación):

| Benchmark | Groot-19B-A3B | Qwen3.6-35B-A3B | Gemma-4-26B-A4B |
|---|---|---|---|
| Terminal Bench 2.1 | 52,10 | 43,82 | 26,52 |
| NL2Repo-Bench | 35,65 | 28,77 | 16,55 |
| LongBench v2 | 62,03 | 48,12 | 47,99 |
| Media no ponderada de 16 benchmarks | 41,44 | 38,08 | 30,05 |

Presupuesto de tokens: en las 16 evaluaciones, Groot-19B-A3B genera de media un 23,1 % menos de tokens de salida que Qwen3.6-35B-A3B y un 65,6 % menos que Gemma-4-26B-A4B, siendo la salida media más corta de los 12 modelos medidos.

Otros benchmarks citados sin cifras publicadas en la información disponible: ALE Agent, Toolathlon Verified (pass@1 sobre 3 ejecuciones), AutomationBench v1.0.6, JobBench, DeepSWE 1.1, SWE-bench Pro y HLE con herramientas (juez gpt-5.5). No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- BF16 (38,9 GB de pesos): una sola GPU de 48 GB u 80 GB. La model card cita RTX 6000 Ada, A100 y H100.
- FP8 (20,9 GB): contexto completo de 256K en una única RTX 5090.
- NVFP4 (13,5 GB): contexto completo de 256K en una única RTX 5090.
- GGUF Q4_K_M (11,7 GB): 128K de contexto en una RTX 4060 Ti de 16 GB; 256K en una RTX 4090 o RTX 3090 de 24 GB.
- Memoria unificada de 128 GB: 256K en NVIDIA DGX Spark y otros sistemas GB10, portátiles RTX Spark, mini PC con AMD Strix Halo y Mac M5 Max.
- Comparación declarada: en una tarjeta de 16 GB Groot carga con 128K mientras Qwen3.6-35B-A3B no entra; en una RTX 5090 Groot alcanza 256K frente a los 64K de Qwen3.6.
- Despliegue: Transformers ≥ 5.8.1, vLLM ≥ 0.19.1, SGLang ≥ 0.5.10. Para los pesos GGUF la model card no especifica runtime concreto (llama.cpp u Ollama no se mencionan explícitamente).
- Throughput y latencia: no disponibles. Como referencia estructural, al activar ~3B parámetros por token el coste por token generado es aproximadamente una sexta parte del de un modelo denso de 19B, pero no se aportan medidas.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Media 16 benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Groot-19B-A3B-261023 | ~19B (+0,4B MTP) | ~3B | 262 144 (ampliable a ~1M con YaRN) | 41,44 | Apache 2.0 | BF16, FP8, NVFP4, GGUF |
| Qwen3.6-35B-A3B | ~35B | No disponible en la información | No disponible (64K observados en RTX 5090 según la card) | 38,08 | No disponible | No disponible |
| Gemma-4-26B-A4B | ~26B | ~4B (según denominación) | No disponible | 30,05 | No disponible | No disponible |

Frente a Qwen3.6-35B-A3B, Groot usa un 45,7 % menos de parámetros totales y obtiene 3,36 puntos más de media; frente a Gemma-4-26B-A4B, un 26,9 % menos de parámetros y 11,39 puntos más. La ventaja en contexto desplegable en hardware consumer es el diferenciador más claro: 256K en 24 GB y 128K en 16 GB.

## Limitaciones y advertencias

- Todos los benchmarks son autodeclarados por el autor y se han obtenido con scaffolds de agente concretos (Claude Code, SWE-agent, mini-swe-agent) y, en el caso de HLE, con un juez externo (gpt-5.5); no se ha verificado de forma independiente.
- El post-entrenamiento se apoya en menos de 0,1B tokens: es un presupuesto muy bajo, lo que puede implicar un alineamiento y una cobertura de instrucciones más frágiles que modelos con SFT y RL extensivos.
- El modelo deriva de Qwen3.6-35B-A3B; conviene verificar las obligaciones de la licencia del modelo base y si el cambio de arquitectura o el post-entrenamiento alteran sus términos, más allá de la declaración Apache 2.0 del repositorio.
- La model card no declara idiomas soportados, por lo que el rendimiento en castellano es desconocido y debe evaluarse empíricamente antes de usarlo en producción.
- No se documentan sesgos, composición del dataset ni filtros de seguridad; el riesgo de alucinación en dominios especializados no está cuantificado.
- La sección final de la model card está truncada ("Please note that"), por lo que pueden faltar advertencias del autor.
- Tracción comunitaria baja (1312 descargas, 14 likes) y ventana temporal de publicación muy reciente: escasa validación por terceros, pocos informes de fallos y ausencia de ecosistema de recetas probadas.
- El modo thinking por defecto incrementa el consumo de tokens frente al modo instruct; la recomendación del autor de `presence_penalty=1.5` en tareas generales sugiere sensibilidad al bucle repetitivo.
- La extensión a ~1M tokens con YaRN no viene con benchmarks propios: el rendimiento más allá de 262K no está medido en la información disponible.

## Enlaces

- Repositorio HuggingFace (edición GGUF): https://huggingface.co/GrootTeam/Groot-19B-A3B-261023-GGUF
- Repositorio del autor en HuggingFace: https://huggingface.co/GrootTeam
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
- La búsqueda web no devolvió resultados relevantes sobre el modelo (solo vídeos sin relación).
