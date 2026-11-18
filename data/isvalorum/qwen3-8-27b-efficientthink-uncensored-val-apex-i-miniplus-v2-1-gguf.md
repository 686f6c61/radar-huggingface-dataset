# IsValorum/Qwen3.8-27B-EfficientThink-Uncensored-VAL-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

Qwen3.8-27B-EfficientThink-Uncensored-VAL-APEX-I-MiniPlus-V2.1-GGUF es una cuantización GGUF del modelo de razonamiento Qwen3.8-27B-EfficientThink, publicada por el usuario IsValorum. El modelo base, alojado por nerkyor, es un ajuste fino (SFT) sobre una variante de la familia Qwen3.8 de 27.320 millones de parámetros, orientado a razonamiento con cadena de pensamiento (chain-of-thought) y generación de código, con un pipeline de entrenamiento que combina SFT sintético, SimPO y decodificación especulativa DFlash2.

La aportación de esta ficha es la cuantización: el autor aplica su método propietario VAL-APEX-I (Vector-calibrated Asymmetric Layer-wise Outlier-preserving Recurrent-aware Unified Matrix-quantization), una técnica de cuantización asimétrica por capas con preservación de valores atípicos y calibración por vectores, orientada a mantener la fidelidad del razonamiento en modelos con estado recurrente. El resultado es un archivo GGUF de 13,91 GB con 4,14 bits por peso (BPW) y una perplejidad WikiText-2 de 5,5923 ± 0,4773 según el autor.

Es relevante ahora porque permite ejecutar un modelo de 27B con razonamiento extendido y contexto nativo de 256K en hardware de consumo, algo que las versiones en precisión completa no permiten. La licencia Apache 2.0 facilita su uso comercial, aunque el contenido "uncensored" del ajuste fino exige controles adicionales en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.8), con soporte de decodificación especulativa DFlash2 y MTP |
| Parámetros totales | 27.320.697.856 (27,32B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256K tokens (contexto nativo, según model card) |
| Tipos de cuantización | GGUF, 4,14 BPW (MiniPlus V3); existen variantes NanoPlus (~11,93 GB) y MiniPlus (~14,16 GB) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 27,32B parámetros de la familia Qwen3.8. El nombre del modelo base revela el pipeline de entrenamiento: SFT sobre datos sintéticos generados por modelos frontera (referencias a Opus 5.5, Grok 4.7, GPT 6 Astra y DSV4Pro), seguido de optimización con SimPO (Simple Preference Optimization) y RLOO (REINFORCE Leave-One-Out). Incorpora MTP (Multi-Token Prediction) y DFlash2 para decodificación especulativa, lo que acelera la generación al predecir varios tokens por paso.

La cuantización VAL-APEX-I es la innovación técnica de esta ficha: una cuantización asimétrica capa por capa que preserva valores atípicos, calibrada con matrices de millones de tokens y consciente del estado recurrente del modelo. El autor documenta 866 tensores auditados y un mapa tensor por tensor (`tensor-map.tsv`). La model card indica que la versión V3 corrige problemas de inestabilidad de estado recurrente, degradación de contexto y mezcla de idiomas presentes en builds anteriores.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con cadena de pensamiento (chain-of-thought) y modo de esfuerzo de razonamiento configurable.
- Generación y razonamiento sobre código (el modelo base incluye "Coder390" en su linaje).
- Decodificación especulativa DFlash2 y MTP para acelerar la inferencia.
- Contexto largo nativo de 256K tokens para recuperación asociativa y conversaciones extensas.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y despliegue en llama.cpp.
- Capacidades de agente y multi-step reasoning inferidas del linaje (RLOO, plantilla de chat endurecida para agentes), aunque no se detallan explícitamente en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Razonamiento técnico asistido: el modelo puede resolver problemas de ingeniería o matemáticas paso a paso gracias a su modo chain-of-thought y a la fidelidad de razonamiento preservada por la cuantización VAL-APEX-I.
- Generación de código en local: con 13,91 GB en GGUF y soporte de llama.cpp, se puede integrar en entornos de desarrollo sin GPU de datacenter, usando el linaje Coder390 del modelo base para autocompletado y refactorización.
- Análisis de documentos largos: la ventana de 256K tokens permite procesar informes, bases de código o transcripciones extensas en una sola pasada, con recuperación asociativa de largo contexto restaurada en la build V3.
- Agentes autónomos multi-paso: la plantilla de chat endurecida para agentes y el entrenamiento con RLOO lo hacen adecuado para pipelines de agentes que requieren planificación y ejecución de herramientas, aunque el soporte de tool calling debe validarse empíricamente.
- Despliegue en hardware de consumo: al caber en 13,91 GB, puede ejecutarse en GPUs consumer de 16 GB o superiores (por ejemplo, RTX 4080/4090) o en configuraciones con RAM del sistema mediante llama.cpp.
- Experimentación en investigación: útil para estudiar el efecto de la cuantización asimétrica con preservación de outliers sobre la fidelidad del razonamiento en modelos de 27B, comparando con las variantes NanoPlus y MiniPlus.
- Prototipado de asistentes conversacionales sin filtros: el ajuste "uncensored" permite explorar respuestas sin rechazos en entornos controlados de investigación, siempre con las salvaguardas adecuadas.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| WikiText-2 PPL (MiniPlus V3) | 5,5923 ± 0,4773 |
| NanoBench v0.4.0 | La model card menciona "Independent Community Benchmarks (NanoBench v0.4.0)" pero los resultados no están incluidos en la información proporcionada |
| MMLU, HumanEval, GSM8K | No disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El único dato cuantitativo es la perplejidad WikiText-2 del archivo cuantizado.

## Requisitos de hardware

- VRAM estimada: ~14 GB para el archivo MiniPlus V3 (13,91 GB) más overhead de contexto; con 256K tokens de contexto la KV cache requiere VRAM adicional significativa (no cuantificada en la información disponible).
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), A100 (40/80 GB) o H100 para contexto completo de 256K.
- Cabe en GPU consumer: sí, en GPUs de 16 GB o más con cuantización MiniPlus; la variante NanoPlus (~11,93 GB) amplía la compatibilidad a GPUs de 12 GB.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), y por el linaje del modelo base se mencionan SGLang y vLLM; Ollama y TGI no se confirman en la información disponible.
- Latencia y throughput: no disponibles; la decodificación especulativa DFlash2 y MTP deberían mejorar el throughput respecto a decodificación estándar, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B EfficientThink VAL-APEX-I MiniPlus V3 (esta ficha) | 27,32B | 256K | GGUF 4,14 BPW, 13,91 GB | Apache 2.0 | PPL WikiText-2 5,5923 |
| Qwen3.8-27B EfficientThink VAL-APEX-I NanoPlus V3 | 27,32B | 256K | GGUF, ~11,93 GB | Apache 2.0 | Variante de menor tamaño del mismo autor |
| Qwen3.8-27B VAL-APEX-I MiniPlus V3 | 27,32B | 256K | GGUF, 14,16 GB | Apache 2.0 | Variante estándar (no EfficientThink) |
| Huihui-Qwen3.8-27B-Abliterated VAL-APEX-I MiniPlus V3 | 27,32B | 256K | GGUF, 14,16 GB | Apache 2.0 | Variante abliterated del mismo autor |

No se dispone de datos de benchmarks comparativos con modelos de otros autores en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés (`en`); el rendimiento en castellano no está garantizado y la model card advierte de mezcla de idiomas en builds anteriores (corregida en V3).
- El ajuste "uncensored" implica ausencia de filtros de seguridad, lo que supone riesgo de generar contenido dañino, sesgado o inexacto; requiere moderación externa en producción.
- Riesgo de alucinación inherente a los modelos de razonamiento; la cadena de pensamiento puede producir justificaciones plausibles pero incorrectas.
- La model card advierte de inestabilidad de estado recurrente y degradación de contexto en versiones anteriores; es imprescindible usar la build V3 certificada y eliminar archivos GGUF antiguos.
- La cuantización a 4,14 BPW puede degradar tareas sensibles a precisión (matemáticas finas, código con sintaxis estricta); se recomienda validar con la variante MiniPlus de mayor tamaño si la calidad es crítica.
- La licencia Apache 2.0 permite uso comercial, pero el origen sintético del SFT y las referencias a modelos frontera en el linaje pueden plantear dudas sobre los términos de los datos de entrenamiento; conviene revisar la licencia del modelo base.
- El contexto de 256K exige VRAM adicional considerable para la KV cache, no cuantificada en la información disponible.
- El autor recomienda ajustes específicos de repeat penalty para evitar intercambio de caracteres en código; no seguir la configuración recomendada puede degradar la salida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IsValorum/Qwen3.8-27B-EfficientThink-Uncensored-VAL-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2
- Variante Swift-1.5 MiniPlus V3: https://huggingface.co/IsValorum/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-VAL-APEX-I-MiniPlus-V3-GGUF
- Variante Swift-1.5 NanoPlus V3: https://huggingface.co/IsValorum/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-VAL-APEX-I-NanoPlus-V3-GGUF
- Variante Qwen3.8 27B MiniPlus V3: https://huggingface.co/IsValorum/Qwen3.8-27B-VAL-APEX-I-MiniPlus-V3-GGUF
- Variante Qwen3.8 27B NanoPlus V3: https://huggingface.co/IsValorum/Qwen3.8-27B-VAL-APEX-I-NanoPlus-V3-GGUF
- Variante EfficientThink NanoPlus V3: https://huggingface.co/IsValorum/Qwen3.8-27B-EfficientThink-VAL-APEX-I-NanoPlus-V3-GGUF
- Variante Huihui Abliterated MiniPlus V3: https://huggingface.co/IsValorum/Huihui-Qwen3.8-27B-Abliterated-VAL-APEX-I-MiniPlus-V3-GGUF
- Variante Huihui Abliterated NanoPlus V3: https://huggingface.co/IsValorum/Huihui-Qwen3.8-27B-Abliterated-VAL-APEX-I-NanoPlus-V3-GGUF
- Colección MiniPlus Abliterated 27B: https://huggingface.co/collections/IsValorum/val-apex-miniplus-abliterated-27b-6acfec541ee5628d2632c663
- Colección MiniPlus Standard 27B: https://huggingface.co/collections/IsValorum/val-apex-miniplus-standard-27b-6acfec54ca4ce4cf5cd5bdb6
- Colección NanoPlus Abliterated 27B: https://huggingface.co/collections/IsValorum/val-apex-nanoplus-abliterated-27b-6acfec5503f6e74218f71f64
- Colección NanoPlus Standard 27B: https://huggingface.co/collections/IsValorum/val-apex-nanoplus-standard-27b-6acfec55c1c99e2a23ebbd9b
- Apoyo al autor (Ko-fi): https://ko-fi.com/isvalorum
