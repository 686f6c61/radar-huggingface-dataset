# gaurav0506/rag-sft-qwen2.5-coder-3b

## Resumen

`gaurav0506/rag-sft-qwen2.5-coder-3b` es un ajuste fino supervisado (SFT) del modelo base Qwen2.5-Coder-3B, desarrollado por el autor independiente Gaurav en el marco de una investigación sobre adaptación de modelos pequeños a ingeniería de sistemas RAG (Retrieval-Augmented Generation). El modelo forma parte de una trilogía experimental que compara el modelo fundacional, una versión con preentrenamiento continuado en dominio (CPT) y esta versión final con instrucciones, con el objetivo de resolver fallos típicos de los modelos de 3B en código de producción: alucinaciones de estructuras de datos, uso de APIs obsoletas y bucles de repetición infinitos.

El modelo se presenta como un especialista en generación de código Python para pipelines RAG, con adherencia a SDKs modernos como Qdrant, Chroma, LlamaIndex, LangChain, Haystack, FastEmbed, GraphRAG, Ragas y AutoRAG. Según la model card, el ajuste SFT logra una validez sintáctica AST del 100% en Python, elimina los bucles de repetición y eleva la precisión de tokens del 50,67% al 74,85% respecto al modelo base. Se distribuye con licencia Apache 2.0 y en formato GGUF Q8_0 (3,1 GB) para inferencia local con Ollama.

La relevancia actual del modelo radica en su enfoque de despliegue privado y de baja latencia: un modelo de 3B parámetros que cabe en GPUs de consumo (el autor lo entrenó y evaluó en una RTX 4070 Laptop con 8 GB de VRAM) y que aspira a sustituir a modelos frontera en tareas acotadas de ingeniería RAG dentro de entornos empresariales con requisitos de privacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (Qwen2.5-Coder-3B) |
| Parametros totales | 3,09B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 32k/128k tokens (RoPE, según model card) |
| Tipos de cuantizacion | GGUF Q8_0 (3,1 GB); entrenamiento en 4-bit QLoRA; inferencia de referencia en bfloat16 |
| Idiomas soportados | inglés (etiqueta `en`); el modelo base Qwen2.5-Coder es multilingüe en código, pero la model card solo declara inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo base), GGUF Q8_0 (binario exportado) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen2.5-Coder-3B: un transformer causal decoder-only de 36 capas, dimensión oculta 2048, 16 cabezas de consulta y 2 cabezas clave-valor (GQA), con embeddings rotatorios (RoPE) que permiten contextos de hasta 32k o 128k tokens según configuración. Sobre esta base se aplicó una estrategia de adaptación en dos fases. La primera fase consistió en un preentrenamiento continuado en dominio (CPT) sobre un corpus deduplicado de 8,19 millones de tokens extraídos de frameworks RAG de código abierto (LlamaIndex, LangChain, Haystack, Qdrant, Chroma, FastEmbed, GraphRAG, Ragas, AutoRAG), usando QLoRA de 4 bits con rango 16, alpha 32, módulos objetivo de atención y MLP, batch size 1 con 16 pasos de acumulación de gradiente y optimizador paged AdamW de 8 bits. Esta fase se ejecutó durante 500 pasos (4 h 11 min) y redujo la pérdida de entropía cruzada de 1,54 a 1,09, con pérdida de validación estabilizada en 1,028.

La segunda fase, que produce este modelo, es un ajuste fino supervisado (SFT) sobre 3.000 pares instrucción-respuesta verificados con procedencia de repositorio, durante 507 pasos (2 h 10 min). El resultado declarado es una disciplina rigurosa de terminación ChatML, validez sintáctica AST del 100% en Python, eliminación de bucles de repetición infinitos y un incremento de 24,18 puntos porcentuales en precisión de tokens (de 50,67% a 74,85%). No se menciona uso de RLHF ni DPO en la información disponible.

## Capacidades

- Generación de código Python especializado en pipelines RAG: ingesta, chunking, embeddings, indexación vectorial, búsqueda híbrida y reranking.
- Adherencia a SDKs modernos de Qdrant, Chroma, LlamaIndex, LangChain, Haystack, FastEmbed, GraphRAG, Ragas y AutoRAG, evitando APIs obsoletas o inventadas.
- Generación de módulos de búsqueda híbrida (BM25 + vectorial) y fórmulas matemáticas de ranking.
- Cumplimiento estricto del formato de conversación ChatML con terminación correcta de turnos.
- Validez sintáctica de Python verificada mediante AST (100% según la model card).
- Capacidad de instrucción multi-turno en formato conversacional (ChatML).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo se declara inglés; el modelo base es multilingüe en código, pero no se documenta para este ajuste.
- Capacidades de visión, audio o modo thinking: no disponibles.

## Casos de uso

- Generación de código para pipelines RAG en producción: el modelo puede escribir módulos completos de ingesta, indexación y recuperación con SDKs actuales (Qdrant, Chroma, LlamaIndex), evitando las APIs obsoletas que el modelo base invoca por error. Es adecuado por su entrenamiento específico en 8,19M de tokens de frameworks RAG reales.
- Asistente de codificación en IDE para equipos de datos: autocompletado y generación de funciones Python de búsqueda híbrida, reranking y evaluación (Ragas, AutoRAG) con validez sintáctica garantizada, lo que reduce la tasa de errores en revisión de código.
- Despliegue privado en empresa: al ser un modelo de 3B con GGUF Q8_0 de 3,1 GB, se puede servir con Ollama en una estación de trabajo con GPU de consumo, manteniendo los datos y el código dentro de la infraestructura corporativa.
- Automatización de mantenimiento de código RAG: el modelo puede migrar llamadas a APIs deprecadas (por ejemplo, `pydantic.v1.BaseModel` o clases inexistentes de Qdrant) a las firmas modernas, gracias al CPT en dominio.
- Generación de tests y validación de pipelines: puede producir código de prueba para módulos de recuperación y verificación de estructuras de datos, aprovechando su disciplina de terminación y su conocimiento de estructuras como arrays de NumPy no hasheables.
- Prototipado rápido de agentes de recuperación: integrado en un flujo con Ollama y una base vectorial local, permite iterar sobre diseños de chunking, embeddings y ranking sin depender de APIs externas ni de modelos frontera.
- Educación y formación en ingeniería RAG: sirve como modelo de referencia para estudiar el efecto del CPT y el SFT en modelos pequeños, ya que el autor publica la comparativa de las tres fases.

## Benchmarks y rendimiento

La model card reporta una evaluación comparativa de tres modelos (base, CPT y SFT) sobre un benchmark autónomo de 10 tareas de ingeniería y 3 módulos arquitectónicos de producción. Los datos disponibles para este modelo (SFT) son:

| Metrica | Modelo base (Qwen2.5-Coder-3B) | RAG-CPT-3B | RAG-SFT-3B (este modelo) |
|---|---|---|---|
| Precisión de tokens | 50,67% | no disponible en el extracto | 74,85% |
| Validez sintáctica AST (Python) | no disponible en el extracto | no disponible en el extracto | 100% |
| Bucles de repetición infinitos | presentes | presentes (truncamiento y fuga de completado) | eliminados |
| Uso de SDKs modernos (Qdrant, BM25) | fallos/crashes | corregido | corregido |
| Disciplina de terminación ChatML | no disponible | no disponible | rigurosa |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos anteriores provienen exclusivamente del benchmark propio del autor y no son directamente comparables con evaluaciones públicas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5-4 GB en Q8_0 (binario de 3,1 GB más overhead de contexto); en bfloat16, unos 6-7 GB.
- GPU recomendadas: RTX 4070 Laptop (8 GB) validada por el autor; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 y H100 son suficientes y sobradas para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más de VRAM en Q8_0; en cuantizaciones menores (Q4) cabría en 6 GB.
- Opciones de despliegue: Ollama (soporte declarado en los tags), llama.cpp con GGUF, Transformers en bfloat16 (pipeline usado por el autor), y presumiblemente vLLM o TGI al ser un modelo Qwen2.5 estándar, aunque no se documenta explícitamente.
- Latencia y throughput: no disponibles en la información proporcionada; el autor solo indica que la inferencia se ejecutó localmente en Ollama y en un pipeline standalone de Transformers en bfloat16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rag-sft-qwen2.5-coder-3b (este) | 3,09B | 32k/128k | RAG en Python, SDKs modernos | Apache 2.0 | Hugging Face, GGUF Q8_0 |
| Qwen2.5-Coder-3B (base) | 3,09B | 32k/128k | Código general | Apache 2.0 | Hugging Face, ampliamente disponible |
| Qwen2.5-Coder-7B | 7,6B | 32k/128k | Código general | Apache 2.0 | Hugging Face |
| Modelos frontera (GPT-4o, Claude 3.5 Sonnet) | no disponibles | no disponibles | Código general | propietaria | API |

La comparativa se limita a parámetros, contexto y licencia, ya que no hay datos de benchmarks públicos para este ajuste. Frente al base, la ventaja declarada es la eliminación de fallos en código RAG y la mejora de precisión de tokens; frente a modelos de 7B o frontera, la ventaja es el despliegue local en 8 GB de VRAM y la privacidad, a costa de menor capacidad general.

## Limitaciones y advertencias

- Modelo experimental de un autor individual, con 0 descargas y 0 likes en el momento de la ficha; no ha pasado por una validación comunitaria independiente.
- Los benchmarks reportados son un benchmark propio del autor (10 tareas y 3 módulos), no evaluaciones estándar; los resultados no son directamente comparables con MMLU, HumanEval o GSM8K.
- El modelo está especializado en RAG y Python; su rendimiento en otras tareas de código o en lenguajes distintos de Python no está documentado y probablemente sea inferior al del modelo base.
- Solo se declara idioma inglés; el uso en castellano no está soportado ni evaluado.
- Riesgo de alucinación en APIs y estructuras de datos fuera del corpus RAG entrenado, aunque el ajuste reduce los fallos conocidos en Qdrant, BM25 y NumPy.
- El contexto de 32k/128k se hereda del modelo base, pero no se ha verificado el rendimiento en contextos largos tras el ajuste.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene auditar el código generado antes de llevarlo a producción.
- El binario GGUF Q8_0 de 3,1 GB está exportado para Ollama; no se documentan otras cuantizaciones (Q4, Q5) ni su calidad.
- La fecha de creación indicada (2026-11-19) y las rutas locales del PDF y del gráfico en la model card no son accesibles públicamente, lo que limita la reproducibilidad de los resultados.

## Enlaces

- Hugging Face: https://huggingface.co/gaurav0506/rag-sft-qwen2.5-coder-3b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B
- Dataset de instrucciones: https://huggingface.co/datasets/gaurav0506/rag-instruction-dataset-3k
- Corpus de preentrenamiento: https://huggingface.co/datasets/gaurav0506/rag-pretraining-corpus-8m
- PDF del artículo: ruta local no accesible (`/home/gaurav/Desktop/rag-dataset-repos/dataset_project/reports/finetune/RAG_Triad_Benchmark_Research_Paper.pdf`)
- Gráfico comparativo: ruta local no accesible (`/home/gaurav/Desktop/rag-dataset-repos/dataset_project/reports/finetune/triad_benchmark_comparison_chart.png`)
