# nace-ai/drex-max-v1

## Resumen

Drex Max v1 es un modelo de decisión desarrollado por Nace.AI, no un modelo generativo al uso. Dado un contexto (texto, JSON e imágenes) y una o varias preguntas con opciones nombradas, devuelve en un único forward pass una distribución de probabilidad sobre hasta 255 alternativas. No genera texto: clasifica y puntúa opciones, lo que lo sitúa en la categoría de "modelos de decisión" o "system one" que el propio autor reivindica en el paper *Towards Foundation Decision Models: Drex* (arXiv:2611.07854).

Arquitectura híbrida de 27B parámetros densos (26.085.330.160 exactos según safetensors) con 64 capas: 48 capas de atención lineal Gated DeltaNet y 16 capas de atención completa no causal intercaladas cada cuatro. Incorpora una torre de visión nativa y una cabeza de lectura de 255 vías (`readout.safetensors`) que transforma el último estado oculto en probabilidades. La ventana de contexto alcanza 262.144 tokens, aunque el límite por defecto es de 16.384.

Es relevante ahora porque propone un paradigma distinto al de los LLM generativos para tareas de clasificación zero-shot y toma de decisiones: una sola pasada, sin decodificación autoregresiva, con resultados publicados en el Decision Index 0.4 (67,52) y en el índice de Artificial Analysis (64, cuarto de 18). Se distribuye bajo licencia Nace.AI Open RAIL-M y cuenta con cuantizaciones GGUF Q8_0 y affine Q4, además de forks de llama.cpp y Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 48 capas Gated DeltaNet (atención lineal) + 16 capas de atención completa no causal, con torre de visión nativa y cabeza de lectura de 255 vías |
| Parametros totales | 26.085.330.160 (27B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (límite por defecto 16.384, configurable vía `DREX_MAX_CONTEXT` o `--max-length`) |
| Tipos de cuantizacion | bf16, Q8_0 GGUF, affine Q4 |
| Idiomas soportados | no disponible |
| Licencia | Nace.AI Open RAIL-M |
| Formato de pesos | safetensors (pytorch), GGUF (Q8_0), affine Q4 |

## Arquitectura y entrenamiento

El backbone consta de 64 capas. 48 de ellas son capas de atención lineal Gated DeltaNet que mantienen procesamiento causal izquierda-a-derecha, mientras que las 16 restantes (una de cada cuatro) son capas de atención completa no causal: cada token puede atender a la secuencia completa. Esta combinación híbrida busca reducir el coste cuadrático de la atención completa sin renunciar a la capacidad de modelar dependencias globales. Las imágenes pasan por una torre de visión nativa y quedan visibles para todas las preguntas de la misma petición, lo que permite formular varias preguntas sobre una misma imagen o contexto en un solo forward pass.

La salida se produce mediante una cabeza de lectura de 255 vías almacenada en `readout.safetensors`, que convierte el último estado oculto en probabilidades sobre hasta 255 opciones. El cargador incluido aplica la atención no causal; una ejecución causal convencional tipo chat no reproduce los resultados publicados. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Clasificación zero-shot y decisión sobre opciones nombradas: devuelve una probabilidad por opción en una sola pasada, sin generación autoregresiva.
- Procesamiento de contexto multimodal: acepta texto, JSON e imágenes como `state` de la petición.
- Soporte de múltiples preguntas por petición, cada una con su propio conjunto de opciones, compartiendo el mismo contexto.
- Capacidad de visión evaluada en benchmarks como CV-Bench, BLINK, RealWorldQA, CharXiv, InfographicVQA, Mind2Web, Winoground, KIE, Hateful Memes, R-Bench-M y MMMU-Pro.
- Capacidad de razonamiento y conocimiento evaluada en el área "Knowledge & Reasoning" del Decision Index 0.4.
- Capacidad de uso de herramientas evaluada en el área "Tools" del Decision Index 0.4 (81,9 de skill corregido por azar).
- Capacidad de recuperación evaluada en el área "Retrieval" (68,8).
- Capacidad lingüística evaluada en el área "Language" (72,2).
- No se especifica soporte de tool calling en el sentido de function calling generativo, ni modo "thinking" explícito, ni audio.

## Casos de uso

- Moderación de contenido multimodal: el modelo puede clasificar imágenes y texto combinados (evaluado en Hateful Memes) devolviendo probabilidades por categoría en una sola pasada, lo que simplifica el pipeline frente a un LLM generativo que deba redactar la decisión.
- Enrutamiento de tickets de soporte: dada la descripción textual de una incidencia y un conjunto de categorías o colas, Drex Max devuelve la probabilidad de cada una; el contexto de hasta 262.144 tokens permite incluir historiales largos o documentación de referencia.
- Extracción de información de documentos (KIE): sobre formularios e infografías (CORD, FUNSD, InfographicVQA), el modelo responde preguntas de extracción con opciones predefinidas y probabilidades asociadas, útil en pipelines de digitalización.
- Evaluación de agentes y selección de acciones: con la cabeza de 255 vías y la atención no causal, puede puntuar acciones candidatas dado un estado del entorno, encajando en bucles de decisión de agentes donde se requiere una elección rápida y calibrada.
- Análisis de interfaces y flujos web: evaluado en Mind2Web, puede clasificar elementos de interfaz o decidir la siguiente acción sobre una página a partir de una captura, integrándose en automatización de navegación.
- Verificación de correspondencia imagen-texto: con resultados en Winoground y BLINK, sirve para tareas de alineación semántica entre pares imagen-texto, como validación de anuncios o control de calidad de catálogos.
- Clasificación de documentos y contratos a gran escala: al no generar texto y resolver en un forward pass, el coste por petición es menor que el de un LLM generativo equivalente, lo que lo hace adecuado para volúmenes altos de clasificación batch.
- Preguntas de opción múltiple sobre conocimiento: útil para evaluación automática de conocimiento o para sistemas de ayuda a la decisión donde las respuestas posibles están acotadas.

## Benchmarks y rendimiento

Decision Index 0.4 (texto público), índice corregido por azar sobre 37 benchmarks en cinco áreas:

| Modelo | Índice público | Raw | Knowledge & Reasoning | Language | Retrieval | Tools | Arts |
|---|---|---|---|---|---|---|---|
| Drex Max (27B) | 67,52 | 75,4 | 57,1 | 72,2 | 68,8 | 81,9 | 53,4 |
| Drex v2.0 (35B) | 61,25 | 70,55 | 47,9 | 65,3 | 63,0 | 76,5 | 53,9 |
| Jev 1.13.0 | 57,96 | 68,55 | 53,9 | 59,2 | 55,4 | 75,1 | 39,1 |

Artificial Analysis Decision Index (media ponderada de AA-Omniscience-Decision, HLE-MultiChoice, When2Call y WildGuardTest):

| Modelo | Tipo | Índice |
|---|---|---|
| dl-ultra | Decision | 65 |
| SubQ Snap 1.1 | Decision | 65 |
| Elephant 9B | Decision | 65 |
| Drex Max | Decision | 64 |
| Claude Haiku 5.5 (Low) | Language | 61 |
| Drex 2.0 | Decision | 58 |
| Jev 1.14 | Decision | 57 |
| Decider v1.2 | Decision | 56 |
| GPT-6 Luna (Low) | Language | 55 |
| GLIDE | Decision | 54 |
| Microsoft-Decision-1 | Decision | 54 |
| Mercury Decide | Decision | 53 |
| Celeris-1 Decision | Decision | 52 |
| d1 | Decision | 50 |
| Decider Flash v1.2 | Decision | 50 |
| Clef | Decision | 49 |
| GPT-6 Luna (Decisions) | Decision | 48 |
| Clef-Omni | Decision | 44 |

Otras evaluaciones:

| Benchmark | Resultado |
|---|---|
| JevBench | 92,2% (213/231) |
| Decision Bench v4 | 94,30% (1010/1071) |
| Índice de visión público (Decision Index 0.4) | 73,92 |

Desglose del índice de visión (skill corregido por azar × 100):

| Benchmark | Filas | Skill |
|---|---|---|
| CV-Bench | 2.038 | 77,4 |
| BLINK | 961 | 59,9 |
| RealWorldQA | 589 | 72,3 |
| CharXiv | 532 | 80,5 |
| InfographicVQA | 244 | 97,3 |
| Mind2Web | 973 | 84,2 |
| Winoground | 800 | 85,0 |
| KIE (CORD+FUNSD) | 2.465 | 92,4 |
| Moderation (Hateful Memes) | 1.213 | 40,6 |
| R-Bench-M | 665 | 38,6 |
| MMMU-Pro vision | 1.730 | 4 (dato truncado en la información disponible) |

## Requisitos de hardware

- Pesos en bf16: aproximadamente 49 GB, lo que requiere una GPU con al menos 48 GB de VRAM (A100 80GB, H100, L40S 48GB) o reparto en varias GPU.
- Backbone en 8 bits: aproximadamente 26 GB de VRAM, viable en una RTX 4090 (24 GB) con ajustes o en A6000 (48 GB) con holgura.
- Q8_0 GGUF: requiere 48 GB de memoria; ejecutable en Apple silicon con 48 GB o más vía llama.cpp y Ollama.
- Affine Q4: ejecutable en Macs Apple silicon con 24 GB de memoria o más mediante Kapitsa y MLX.
- En CPU: soportado mediante llama.cpp y Ollama.
- En Apple silicon: el backbone de texto funciona con llama.cpp, Ollama, Kapitsa y MLX.
- Despliegue en GPU NVIDIA: ejecución con Python; no se menciona soporte explícito de vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Índice público (DI 0.4) | AA Decision Index | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Drex Max | 27B | 262.144 | 67,52 | 64 | Nace.AI Open RAIL-M | Hugging Face, GGUF, forks de llama.cpp y Ollama |
| Drex v2.0 | 35B | no disponible | 61,25 | 58 | no disponible | Hugging Face |
| Jev 1.13.0 / 1.14 | no disponible | no disponible | 57,96 | 57 | no disponible | Leaderboard público |
| Claude Haiku 5.5 (Low) | no disponible | no disponible | no disponible | 61 | propietaria | API |
| GPT-6 Luna (Low) | no disponible | no disponible | no disponible | 55 | propietaria | API |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni respuestas abiertas; solo devuelve probabilidades sobre opciones predefinidas (hasta 255). No sirve para chat, redacción ni generación de código.
- La atención no causal es imprescindible: ejecutar el modelo como un chat causal estándar no reproduce los resultados publicados, lo que puede inducir a errores si se integra con herramientas que asumen un transformer causal convencional.
- El límite por defecto es de 16.384 tokens; para aprovechar la ventana de 262.144 hay que configurarla explícitamente y asumir el coste de memoria y cómputo asociado.
- Rendimiento débil en moderación de memes (40,6 en Hateful Memes) y en R-Bench-M (38,6), muy por debajo de otras áreas del índice de visión.
- El resultado en MMMU-Pro vision aparece truncado en la información disponible (valor "4"), por lo que no puede interpretarse.
- Licencia Nace.AI Open RAIL-M: incluye restricciones de uso (RAIL) que deben revisarse antes de un despliegue comercial; no es una licencia permisiva tipo Apache 2.0 o MIT.
- No se dispone de información sobre idiomas soportados, sesgos conocidos ni tasas de alucinación; al tratarse de un modelo de clasificación, el riesgo se traslada a calibración incorrecta de probabilidades y falsos positivos en categorías ambiguas.
- El repo ocupa 61,8 GB, lo que implica requisitos de almacenamiento considerables si se descargan todas las variantes.
- No se han publicado datos de latencia ni throughput, lo que dificulta dimensionar despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nace-ai/drex-max-v1
- Paper: https://huggingface.co/papers/2611.07854
- Web del autor: https://www.nace.ai/
- Código y documentación: https://github.com/nace-ai/drex-decision-models/blob/main/models/drex-max-v1
- Formato de petición: https://github.com/nace-ai/drex-decision-models/blob/main/docs/request-format.md
- Longitud de contexto: https://github.com/nace-ai/drex-decision-models/blob/main/docs/context-length.md
- GGUF Q8_0: https://huggingface.co/nace-ai/drex-max-v1-Q8_0
- Affine Q4: https://huggingface.co/nace-ai/drex-max-v1-affine-q4
- Fork de llama.cpp (rama `drex-max-v1`): https://github.com/nace-ai/llama.cpp
- Fork de Ollama (rama `drex-max-v1`): https://github.com/nace-ai/ollama
- Drex v2.0: https://huggingface.co/nace-ai/drex-v2.0
- Drex v1.5: https://huggingface.co/nace-ai/drex-v1.5
- Resultados del Decision Index de Drex Max: https://hf.co/datasets/nace-ai/drex-max-v1-decision-index-results
- Resultados del Decision Index de Drex v2.0: https://hf.co/datasets/nace-ai/drex-v2.0-decision-index-results
- Leaderboard Jev Decision Index: https://huggingface.co/spaces/multimodalart/jev-decision-index
- Artificial Analysis: https://artificialanalysis.ai/
