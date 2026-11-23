# CMSManhattan/JiRackDeltaNet_70b

## Resumen

JiRackDeltaNet 70B es un modelo de lenguaje híbrido de 69.930 millones de parámetros publicado por CMSManhattan (Konstantin Grabko) bajo una licencia propietaria denominada `jirack-proprietary`. Se trata de una adaptación de la arquitectura híbrida Gated DeltaNet / atención completa de Qwen, reconstruida en código propio (JiRack) y afinada sobre datos propios no publicados que cubren chat, razonamiento, código, matemáticas y tool calling. La versión disponible es una *beta release*.

La arquitectura combina 128 capas de decodificador: 96 capas de Gated DeltaNet (atención lineal) y 32 capas de atención completa con compuerta, intercalando una capa de atención completa cada cuatro. Emplea el tokenizador y la plantilla de chat de Qwen con un vocabulario de 248.320 entradas, e incluye una cabeza MTP (multi-token prediction) de una capa. El modelo se distribuye en bf16, en una copia FP8 con cuantización por bloques de 128 × 128 y en tres cuantizaciones GGUF (Q3_K_M, Q4_K_M, Q6_K).

Su relevancia actual reside en la propuesta de eficiencia: pesos ternarios (1.58-bit) entre sus etiquetas, despliegue en CPU mediante llama.cpp y una copia FP8 de 73 GB que cabe en una única GPU de 96 GB. El soporte declarado de tool calling (109/117 en la prueba interna del autor) y el tokenizador orientado a robótica lo posicionan para flujos agénticos, aunque la falta de benchmarks estándar (GSM8K, HumanEval, MMLU) limita la evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador híbrido: 128 capas (96 Gated DeltaNet de atención lineal + 32 de atención completa con compuerta, una cada 4 capas) |
| Parametros totales | 69.934.845.440 (69,93B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (los ejemplos de despliegue usan `-c 8192` en llama.cpp) |
| Tipos de cuantizacion | bf16, FP8 e4m3 con escalas por bloque 128 × 128, GGUF Q3_K_M, Q4_K_M, Q6_K; etiquetado como ternario / 1.58-bit |
| Idiomas soportados | en, zh, ja, ko, fr, es, pt, de, it, ru, ar, vi, th |
| Licencia | `jirack-proprietary` (license: other) |
| Formato de pesos | safetensors (bf16 en la raíz, FP8 en `sft_final_fp8/`), GGUF en `gguf/` |

Otros datos técnicos: dimensión oculta 5120, FFN 26624 con SwiGLU; atención completa con 24 cabezas y 4 cabezas KV, dimensión de cabeza 256, compuerta de salida, RoPE parcial al 25 %, secciones mRoPE intercaladas [11, 11, 10] y RoPE theta 1e7; Gated DeltaNet con 16 cabezas de clave, 48 de valor, dimensión de cabeza 128 y convolución causal de kernel 4; vocabulario de 248.320 entradas con embeddings de entrada y salida no atados; cabeza MTP de 1 capa. Tamaño del repositorio: 347 GB.

## Arquitectura y entrenamiento

El modelo es un transformer de decodificador híbrido que sustituye la mayoría de las capas de atención cuadrática por capas Gated DeltaNet de atención lineal, manteniendo atención completa con compuerta cada cuatro capas. Esta combinación busca reducir el coste de atención en secuencias largas conservando capacidad de recuperación exacta en las capas de atención completa. La atención completa usa 24 cabezas con solo 4 cabezas KV (GQA), dimensión de cabeza 256, compuerta de salida y RoPE parcial con secciones mRoPE intercaladas, lo que sugiere soporte de posiciones multidimensionales. La cabeza MTP de una capa añade predicción multi-token, habitual en entrenamiento especulativo o de eficiencia.

Según la model card, el modelo parte de un modelo Qwen (Apache 2.0) cuya arquitectura y pesos fueron modificados en el código JiRack del autor y posteriormente afinados sobre datos propios de chat, razonamiento, código, matemáticas y tool calling. La receta de entrenamiento y el conjunto de datos no se publican, por lo que no hay información verificable sobre número de tokens, composición del corpus ni uso de RLHF o DPO. Tampoco se detalla el proceso que produce los pesos ternarios mencionados en las etiquetas. El código de inferencia es un único archivo PyTorch (`JiRackDeltaNet_70b.py`) con nombres de parámetros compatibles con el state dict de la arquitectura híbrida de Qwen, y no requiere una clase de modelo de `transformers`.

## Capacidades

- Generación de texto conversacional multi-turno en 13 idiomas declarados (inglés, chino, japonés, coreano, francés, español, portugués, alemán, italiano, ruso, árabe, vietnamita y tailandés).
- Razonamiento aritmético básico verificable: el ejemplo de la model card resuelve correctamente un problema de cambio (7 × 3 = 21; 50 − 21 = 29) en modo greedy y con razonamiento desactivado.
- Tool calling / function calling compatible con la interfaz OpenAI: herramientas en bloque `<tools>` y llamadas con `<tool_call><function=…><parameter=…>`.
- Llamadas paralelas a herramientas (19/19 en la prueba interna) y respuestas de seguimiento a partir del resultado de una herramienta (20/20).
- Decisión de no invocar herramienta cuando no es necesaria (25/25 en la prueba interna).
- Modo de razonamiento conmutable mediante `/think` en los scripts de chat y `--reasoning off` en llama.cpp.
- Capacidades agénticas y de enrutamiento (etiquetas `routing`, `tool-call`, `web-ui`).
- Tokenizador orientado a robótica para la próxima actualización del modelo, según el autor.
- No se declaran capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Automatización de atención al cliente con herramientas: el modelo puede gestionar conversaciones multi-turno y encadenar llamadas a funciones (consultar pedidos, calcular importes) gracias a su soporte de tool calling compatible con OpenAI; conviene validar el comportamiento ante argumentos ausentes, donde falla 8 de 15 casos.
- Enrutamiento de peticiones en una web o backend: las etiquetas `routing` y `web-ui` y la prueba de "no tool needed" (25/25) lo hacen adecuado para clasificar intenciones y decidir si se invoca una herramienta o se responde directamente.
- Despliegue en CPU sin GPU: las cuantizaciones GGUF Q3_K_M (33,89 GB) y Q4_K_M (42,65 GB) permiten servir el modelo con `llama-server` en servidores con suficiente RAM; en un GH200 Grace con 64 hilos se midieron 5,17 y 5,04 tokens/s de generación respectivamente.
- Servicio en una única GPU de 96 GB: la copia FP8 (73 GB) cabe en una GPU de 96 GB con un error relativo medio de pesos del 2,65 %, útil para prototipos de agentes con tool calling en un solo nodo.
- Asistencia de código y matemáticas en pipelines internos: el autor lo describe como buen modelo de código y agentes, aunque sin resultados publicados de HumanEval ni GSM8K; se recomienda evaluarlo con un conjunto propio antes de integrarlo en CI/CD.
- Investigación sobre arquitecturas híbridas de atención lineal: al incluir código PyTorch de un solo archivo con nombres compatibles con Qwen, sirve para estudiar el comportamiento de Gated DeltaNet a escala 70B y comparar con atención completa.
- Prototipado multilingüe: cubre 13 idiomas declarados, lo que permite probar asistentes en mercados europeos y asiáticos, con la salvedad de que no se han publicado evaluaciones por idioma.

## Benchmarks y rendimiento

Los únicos resultados publicados son la prueba interna de tool calling del autor (117 casos, GGUF Q3_K_M, temperatura 0, razonamiento desactivado):

| Categoria | Q3_K_M |
|---|---|
| Llamada única (una herramienta, todos los argumentos dados) | 38/38 |
| Llamadas paralelas | 19/19 |
| Seguimiento (respuesta a partir del resultado de una herramienta) | 20/20 |
| Sin herramienta necesaria | 25/25 |
| Aclarar un argumento ausente | 7/15 |
| Total | 109/117 (93,2 %) |

Rendimiento de inferencia en CPU (GH200 Grace, 64 hilos, `llama-bench`):

| Cuantizacion | Tamano | Prompt (tokens/s) | Generacion (tokens/s) |
|---|---|---|---|
| Q3_K_M | 33,89 GB | 20,1 | 5,17 |
| Q4_K_M | 42,65 GB | 50,2 | 5,04 |
| Q6_K | 57,40 GB (2 partes) | 45,3 | 4,11 |

No se han publicado resultados de MMLU, GSM8K ni HumanEval en la información disponible; el autor indica que se añadirán en una versión futura.

## Requisitos de hardware

- bf16: 140 GB de pesos; requiere al menos 2 × 80 GB según las instrucciones del autor (`chat_jirack.py` reparte los 128 bloques entre todas las GPU visibles).
- FP8: 73 GB; cabe en una única GPU de 96 GB (por ejemplo, H100 96 GB o H200) y se ejecuta con `sft_final_fp8/chat_fp8.py`, que descomprime por capa.
- GGUF Q6_K: 57,40 GB; viable en GPU de 80 GB o en CPU con RAM suficiente.
- GGUF Q4_K_M: 42,65 GB; cabe en una RTX 4090 de 24 GB solo parcialmente (offload parcial), por lo que en la práctica requiere CPU o varias GPU.
- GGUF Q3_K_M: 33,89 GB; no cabe en GPU de consumo de 24 GB; sí en CPU con 64 GB de RAM o más.
- Despliegue: `llama-server` de llama.cpp con `--jinja --reasoning off` para GGUF; scripts PyTorch propios para bf16 y FP8; etiqueta `ollama` en el repositorio; compatible con clientes OpenAI (`endpoints_compatible`).
- Los scripts de chat de referencia no usan KV cache y recalculan la secuencia completa en cada token, con una velocidad de aproximadamente 1 token/s según la model card; no son adecuados para producción sin optimización.
- Throughput medido solo en CPU (ver tabla de benchmarks); no hay datos publicados de latencia o throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| JiRackDeltaNet 70B | 69,93B | No disponible | `jirack-proprietary` | HF, GGUF, FP8 | Híbrido DeltaNet; 93,2 % en test interno de tool calling |
| Qwen (modelo base citado) | No disponible | No disponible | Apache 2.0 | HF | Origen arquitectónico declarado por el autor; sin datos concretos de la variante usada |
| Alternativas de ~70B con tool calling | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la información proporcionada |

La model card no incluye comparaciones con modelos de la misma categoría ni cifras de benchmarks estándar que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Versión beta: el propio autor advierte de que el modelo tiende a invocar la herramienta en lugar de pedir aclaración cuando falta un argumento (8 de 15 fallos en esa categoría).
- Ausencia de benchmarks estándar (MMLU, GSM8K, HumanEval) impide verificar las afirmaciones sobre código, matemáticas y razonamiento.
- Licencia propietaria `jirack-proprietary`: es necesario revisar el archivo `LICENSE` antes de cualquier uso comercial; no es una licencia open source.
- Receta de entrenamiento y datos no publicados: no es posible auditar la composición del corpus, el filtrado ni posibles sesgos.
- Riesgo de alucinación no cuantificado; no hay evaluaciones de veracidad ni de robustez.
- Longitud de contexto no especificada; los ejemplos de despliegue usan 8192 tokens, lo que limita el uso con documentos largos.
- Rendimiento multilingüe declarado pero no evaluado por idioma.
- Los scripts de referencia no implementan KV cache y son lentos (~1 token/s); para producción hay que usar llama.cpp u otra pila optimizada.
- El etiquetado como ternario / 1.58-bit no se detalla en la model card: no se especifica qué pesos son ternarios ni cómo se generan.
- Despliegue en bf16 requiere al menos 2 × 80 GB de VRAM; la copia FP8 exige una GPU de 96 GB, lo que restringe el hardware disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CMSManhattan/JiRackDeltaNet_70b
- Demo de chat: https://huggingface.co/spaces/CMSManhattan/JiRackDeltaNet-70B-demo
- Instrucciones de GGUF: https://huggingface.co/CMSManhattan/JiRackDeltaNet_70b/blob/main/gguf/README.md
- Licencia: https://huggingface.co/CMSManhattan/JiRackDeltaNet_70b/blob/main/LICENSE
