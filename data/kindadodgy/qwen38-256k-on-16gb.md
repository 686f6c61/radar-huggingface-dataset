# Kindadodgy/qwen38-256k-on-16gb

## Resumen

Este repositorio contiene un artefacto de investigación firmado por Kindadodgy: una cuantización GGUF del modelo Qwen3.8-27B (27.32B parámetros, contexto nativo de 262.144 tokens) configurada para ejecutar una ventana completa de 256k en una GPU de 16 GB. El autor la denomina la cuantización "pareto": 2.72 BPW, single-quantized desde la base BF16 verificada de Unsloth, con q2_K aplicado únicamente a los 99 tensores FFN gate/up y iq2_xxs en el resto. El resultado es un archivo de 8.66 GiB que cabe en una AMD RX 9070 XT de 16 GB usando llama.cpp con backend Vulkan.

La relevancia de esta pieza no es el modelo en sí (Qwen3.8-27B ya es conocido por su rendimiento en la clase 27B), sino la demostración práctica de que es posible mantener calidad aceptable a 200k de contexto residente en hardware de gama media mediante dos técnicas combinadas: decodificación especulativa (MTP, n=2) y un tile-skip de atención selectiva controlado por variable de entorno (`GGML_VK_FA_SELECT_KEEP=30`). El autor publica todos los resultados medidos, la receta de reconstrucción y los scripts de reproducción en GitHub, con la advertencia explícita de que se trata de un experimento n=1 en un único equipo, no de un resultado comparable a leaderboards.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Gated DeltaNet / attention (modelo base Qwen3.8-27B) |
| Parametros totales | 27.32B |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativo (extendible a 1M con YaRN) |
| Tipos de cuantizacion | 2.72 BPW: q2_K en tensores FFN gate/up, iq2_xxs en el resto |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (pesos), MIT (receta de cuantización), CC-BY-4.0 (paper) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27.32B parámetros con arquitectura híbrida Gated DeltaNet / attention, lanzado por Alibaba el 14 de agosto de 2026 bajo licencia Apache-2.0. Es nativamente multimodal (texto, imagen y video) y su contexto nativo es de 262.144 tokens, extendible a 1M mediante YaRN. El autor de este repositorio no reentrena el modelo, sino que parte de la base BF16 de Unsloth (verificada por LFS oids) y aplica una cuantización selectiva: q2_K solo en los tensores FFN gate/up (que usan la ruta rápida de producto punto entero MMVQ) e iq2_xxs en el resto. Esta elección localiza el daño de la cuantización de 2 bits en las capas menos críticas, manteniendo la calidad en las capas de atención.

La configuración de ejecución incluye dos innovaciones técnicas: decodificación especulativa con cabezas MTP (n=2, p-min 0.60) que amplifica el throughput entre 2.4x y 2.6x, y un tile-skip de atención selectiva activado por la variable de entorno `GGML_VK_FA_SELECT_KEEP=30`, que omite tiles de atención por debajo de un umbral de relevancia (MINKV=32768). El skip es neutral en la ruta de decodificación cruda (llama-bench), pero en la ruta de servidor con MTP activo produce una mejora medible a 200k de contexto residente.

## Capacidades

- Generación de texto y razonamiento: el modelo base es capaz de tareas complejas de razonamiento, y la cuantización mantiene un 96.7% (29/30) en una prueba de profundidad GSM8K a 200k de contexto con la selección activa.
- Razonamiento multi-hop: el autor reporta un PASS en retrieval multi-hop 3/3 a 200k (prueba a escala de humo, no certificación).
- Codificación y matemáticas: el modelo base tiene capacidades agenticas de codificación aproximadamente 3x superiores a su predecesor, aunque no se han medido en esta cuantización.
- Multimodal (imagen y video): el modelo base es nativamente multimodal, pero esta cuantización GGUF no incluye el procesador de visión; no se ha verificado su funcionamiento en este formato.
- Decodificación especulativa: soporta MTP (multi-token prediction) con n=2, lo que acelera la generación en la ruta de servidor.
- Atención selectiva: el tile-skip permite mantener velocidad a contextos largos, aunque es neutral en decodificación cruda.

## Casos de uso

- Ejecución local de LLM con contexto largo en hardware de gama media: permite desplegar un modelo de 27B con ventana de 256k en una GPU de 16 GB (probado en AMD RX 9070 XT), algo que normalmente requeriría 48 GB o más. Es útil para desarrolladores que necesitan procesar documentos extensos sin depender de la nube.
- Investigación en cuantización extrema: la receta de cuantización selectiva (q2_K solo en FFN gate/up) es un caso de estudio reproducible para quienes exploran límites de compresión sin colapso total de calidad. El autor publica todos los resultados y scripts.
- Prototipado de agentes con memoria larga: la combinación de 200k de contexto residente y razonamiento multi-hop (aunque sea a escala de humo) permite experimentar con agentes que mantienen historiales conversacionales o documentos de referencia muy extensos.
- Benchmarking de atención selectiva en Vulkan: el tile-skip controlado por variable de entorno es un banco de pruebas para evaluar el impacto de la omisión de tiles en tareas de retrieval y razonamiento.
- Educación y replicación: el repositorio incluye la receta completa (tensor map, flags de lanzamiento, scripts de reproducción) para que otros investigadores puedan replicar o mejorar el resultado en sus propias GPUs.
- Despliegue en entornos con restricción de VRAM: cualquier GPU con 16 GB y soporte Vulkan (AMD, NVIDIA, Intel) puede ejecutar este GGUF mediante llama.cpp, lo que lo hace adecuado para estaciones de trabajo modestas o portátiles gaming.

## Benchmarks y rendimiento

El autor proporciona mediciones propias en un único rig (AMD RX 9070 XT, Windows, llama.cpp Vulkan, build b10537-era con selector r6). No son comparables a leaderboards estándar, pero son los únicos datos disponibles:

| Metrica | Valor | Condiciones |
|---|---|---|
| Velocidad de generación (gate) | 56.6 t/s | 256k asignado, 40k residente, MTP on |
| Velocidad sostenida (20 min) | 58.5 t/s | 256k asignado, 40k residente, MTP on |
| Velocidad a 200k residente (selective-skip, MTP on) | ~42-46 t/s (46.16 medido, 44.6 boot fresco, ~42 sostenido) | MTP on, skip activo |
| Velocidad a 200k residente (stock, sin skip) | ~33 t/s | MTP on, sin skip |
| Calidad a 200k (depth-GSM8K, selección activa) | 29/30 (96.7%) | Selección activa |
| Retrieval multi-hop a 200k | PASS 3/3 (smoke-scale) | Selección activa |
| Curva llama-bench (MTP off) | 45.3@4k -> 28.3@200k | Sin skip, idéntico con y sin skip |
| Footprint del modelo | 8.66 GiB (2.72 BPW) | Archivo GGUF |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) para esta cuantización específica. El autor menciona que RULER está pendiente por falta de tooling Python.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF ocupa 8.66 GiB, pero con la caché KV en q4_0 (tanto K como V) y el overhead de llama.cpp, el conjunto cabe en 16 GB. El autor lo probó en una AMD RX 9070 XT de 16 GB.
- GPU recomendadas: cualquier GPU con 16 GB de VRAM y soporte Vulkan. Probado en AMD RX 9070 XT; debería funcionar en NVIDIA RTX 4060 Ti 16GB, RTX 5060 Ti 16GB, o similares. No se ha probado en Apple Silicon.
- Opciones de despliegue: llama.cpp con backend Vulkan (build específico b10537-era con selector r6), usando `llama-server`. No se menciona compatibilidad con vLLM, Ollama o TGI.
- Latencia y throughput: 56.6 t/s a 40k residente, ~42-46 t/s a 200k residente con skip y MTP activo. Sin MTP, la curva cruda va de 45.3 t/s a 4k hasta 28.3 t/s a 200k.
- Nota: el autor advierte de un estado bistable del driver (~1.36x de dispersión) y ~20% de deriva sostenida; todas las comparaciones son same-day, interleaved y con caché caliente.

## Comparativa con modelos similares

La comparativa se limita al modelo base y a otras cuantizaciones del mismo Qwen3.8-27B, ya que no hay datos de rendimiento de modelos alternativos en la información disponible.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (BF16, Unsloth) | 27.32B | 262k | BF16 | Apache-2.0 | Modelo base, requiere ~54 GB en BF16 |
| Qwen3.8-27B (IQ2_XXS estándar) | 27.32B | 262k | IQ2_XXS (~9.0 GB) | Apache-2.0 | Cuantización publicada por Unsloth, sin receta selectiva |
| Este repositorio (pareto) | 27.32B | 262k | 2.72 BPW (q2_K + iq2_xxs) | Apache-2.0 (pesos) | 8.66 GiB, con skip de atención selectiva y MTP |

No se dispone de benchmarks comparativos entre estas variantes en la información proporcionada. El autor indica que su configuración no es comparable a leaderboards y que la calidad a 2 bits es un cliff real, mitigado por la localización del daño.

## Limitaciones y advertencias

- Resultado n=1: todas las mediciones provienen de un único rig (AMD RX 9070 XT) y sesiones individuales; no son estadísticamente robustas ni comparables a leaderboards.
- Calidad de 2 bits: la cuantización de 2.72 BPW es un cliff de calidad real. El autor no lo oculta: la calidad se mantiene localizando el daño (q2_K solo en FFN gate/up), no pretendiendo que sea lossless.
- Dependencia de un build específico: requiere una versión concreta de llama.cpp (commit bf0040e15, era b10537) con el selector r6 para el skip. Sin ese build, el skip no está disponible.
- Retrieval multi-hop limitado: el PASS 3/3 a 200k es una prueba a escala de humo, no una certificación. RULER está pendiente.
- Sin soporte multimodal verificado: aunque el modelo base es multimodal, esta cuantización GGUF no incluye el procesador de visión y no se ha probado su funcionamiento.
- Sesgos y alucinación: no se han evaluado en esta configuración; el modelo base puede presentar sesgos típicos de LLMs y riesgo de alucinación, especialmente a contextos muy largos.
- Restricciones de licencia: los pesos son Apache-2.0 (uso comercial permitido), pero la receta de cuantización es MIT y el paper CC-BY-4.0. El autor advierte que no es un archivo oficial de Unsloth.
- Estado del driver: el autor reporta un estado bistable del driver AMD (~1.36x de dispersión) y ~20% de deriva sostenida, lo que afecta la reproducibilidad de las mediciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Kindadodgy/qwen38-256k-on-16gb
- Repositorio GitHub (recetas, scripts, paper): https://github.com/7269827-rgb/qwen38-256k-on-16gb
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de despliegue local en 16 GB (RTX 5060 Ti): https://blog.margrop.net/en/post/qwen38-27b-local-deploy-5060ti-16g/
- Guía de hardware para Qwen3.8-27B: https://www.contextstudios.ai/blog/qwen-3-8-27b-hardware-guide
- Benchmark independiente de cuantizaciones de Qwen3.8-27B: https://github.com/PascalAI2024/qwen38-27b-quant-bench
- Análisis de specs y benchmarks: https://kingy.ai/blog/qwen3-8-27b-specs-benchmarks-local-hardware/
