# Cyronius/Qwen3.8-Flash-Next-131B-A6B-GGUF

## Resumen

Cyronius/Qwen3.8-Flash-Next-131B-A6B-GGUF es una cuantización GGUF del modelo Qwen3.8-Flash-Next de Qwen, sometida a una poda selectiva de la tabla de hash-embeddings n-grama (n-gram hash-embedding table) sin ningún reentrenamiento. El modelo base, desarrollado por Alibaba Qwen sobre la arquitectura Qwen4, es un MoE multimodal de 125B parámetros con 6B activos por token, contexto nativo de 262K tokens y atención híbrida GDN + QSA. El autor de esta variante, Cyronius, elimina 14 de las 16 cabezas de la tabla de hash (de 51,2B a 6,4B parámetros), reduciendo el tamaño del archivo GGUF de 90 GB a 64,8 GB, un 28% menos, manteniendo el rendimiento en tareas de tool calling, GSM8K y MMLU según sus propias mediciones.

La relevancia de este modelo radica en que demuestra una vía de compresión distinta al pruning clásico de capas transformer: al explotar la redundancia inherente del hashing multi-cabeza (estilo Bloom filter), se consigue una reducción sustancial de peso sin tocar los tensores del transformer ni requerir entrenamiento. El resultado es un GGUF que cabe en tarjetas de 66 GB de VRAM o menos, con una penalización únicamente en perplexity (4,66 frente a 2,40 del base), mientras que las capacidades de razonamiento y uso de herramientas se mantienen en paridad. Está pensado para despliegue local con llama.cpp (versión b10673 o posterior, con soporte `qwen4exp`), y hereda la licencia qwen-community-1.0 del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con atención híbrida GDN + QSA (Qwen4), 48 capas, 512 expertos |
| Parametros totales | 132.143.667.360 (~132B) |
| Parametros activos | 6B por token |
| Longitud de contexto | 262K nativo (modelo base); evaluado solo hasta 8K en este GGUF, comportamiento a contexto largo no probado |
| Tipos de cuantizacion | UD-Q3_K_XL (dynamic quant de unsloth, calibrado con imatrix); el archivo es un GGUF de 64,8 GB |
| Idiomas soportados | No disponible (el modelo base Qwen es multilingüe, pero no se especifican idiomas para esta variante) |
| Licencia | qwen-community-1.0 |
| Formato de pesos | GGUF (safetensors del base disponible en el repo original) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next usa una arquitectura Qwen4 que combina atención GDN (Gated Dynamic Norm?) y QSA (sparse attention), con 48 capas y 512 expertos MoE, de los que se activan 6B parámetros por token. Una particularidad de esta arquitectura es que incorpora una tabla de hash-embeddings de n-gramas de 51,2B parámetros (aproximadamente el 29% del peso total), inyectada en la capa 1, con 16 cabezas hash independientes (8 para bigramas y 8 para trigramas). Esta tabla actúa como un predictor superficial de siguiente token con redundancia tipo Bloom filter.

La contribución de Cyronius es una poda quirúrgica de esa tabla: conserva solo 1 cabeza de cada tipo (2 de 16), reduciendo la tabla a 6,4B parámetros. El procedimiento se basa en que la estructura del GGUF es totalmente dirigida por metadatos (`ple.head_offsets`, `ple.head_vocab_sizes`), y llama.cpp lee el número de filas directamente del tensor. Las cabezas eliminadas se apuntan a una fila compartida de ceros (un bloque IQ4_NL decodificado a ceros exactos), de modo que no contribuyen al cálculo y solo ocupan una fila de almacenamiento. No hay parche de llama.cpp, ni re-cuantización, ni entrenamiento: es una copia de bytes en streaming (~45 minutos en un portátil NVMe). El resto de tensores se copian byte a byte de la cuantización UD-Q3_K_XL de unsloth, preservando su calibración imatrix. El autor descartó otras variantes de poda: eliminar capas transformer colapsó la arquitectura (GSM8K cayó a 0,33-0,67 y perplexity superó 13), mientras que la poda del n-grama resultó ser la única opción viable.

## Capacidades

- Generación de texto y razonamiento: mantiene el rendimiento del modelo base en tareas de razonamiento (GSM8K y MMLU en paridad con la versión sin podar, según las pruebas del autor).
- Tool calling / function calling: soportado y evaluado con 40 casos agénticos, con precisión de 1.000 (paridad con el base).
- Capacidades multilingües: heredadas del modelo base Qwen, aunque no se especifican idiomas concretos para esta variante.
- Modo thinking: el autor menciona parámetros de muestreo distintos para el modo instruct y el modo thinking (temp 1.0, top_p 0.95 para thinking), lo que indica soporte de razonamiento extendido.
- Multimodal: el modelo base es multimodal, pero este GGUF es text-only (los tensores de visión se distribuyen por separado en el repo de unsloth como mmproj; el autor declara que la ruta de visión no se ha probado con esta cirugía).
- Soporte de agentes y multi-step reasoning: no se menciona explícitamente, pero el tool calling evaluado sugiere capacidad para pipelines agénticos.
- Decodificación especulativa MTP: no disponible; llama.cpp upstream no exporta ni ejecuta la cabeza MTP para esta arquitectura (según el autor).

## Casos de uso

- Despliegue local de un MoE de 131B en hardware de gama media: con 66 GB de VRAM se puede descargar completamente el modelo en una GPU como A100 o RTX 6000 Ada; con GPUs más pequeñas, se puede mantener la tabla n-grama (sparse-gather) en RAM del sistema mediante el override de tensores, permitiendo ejecutar el modelo en configuraciones híbridas GPU+CPU.
- Asistentes de código con tool calling: el modelo mantiene la precisión del base en llamadas a herramientas, por lo que puede integrarse en entornos de desarrollo locales o en CI/CD para generación y revisión de código, sin depender de APIs en la nube.
- Razonamiento matemático y lógico en entornos sin conexión: con GSM8K en paridad con el base, es adecuado para aplicaciones educativas o de análisis donde se requiera resolver problemas paso a paso con el modo thinking.
- Chatbots y atención al cliente con contexto largo: aunque el comportamiento a contexto largo no está probado en esta variante, el modelo base soporta 262K tokens; en despliegues con contexto ≤8K (como se evaluó), puede manejar conversaciones multi-turno con historial extenso.
- Prototipado y experimentación en investigación: al ser un GGUF listo para llama.cpp, permite probar técnicas de poda y compresión en arquitecturas MoE modernas sin necesidad de infraestructura de entrenamiento, y el pipeline de cirugía está documentado en GitHub.
- Sistemas de recuperación y generación aumentada (RAG) locales: con tool calling y razonamiento, puede orquestar búsquedas en bases de datos vectoriales o APIs, manteniendo la privacidad de los datos al ejecutarse en local.

## Benchmarks y rendimiento

El autor proporciona una tabla de benchmarks medidos en el mismo build de llama.cpp (b10673, CUDA, A100), con temperatura 0, el mismo día. Los datos de herramientas corresponden a 40 casos agénticos (acierto en la herramienta y argumentos correctos, o rechazo correcto); GSM8K-15 y MMLU-30 son subconjuntos en modo no-think; perplexity se mide en wikitext-2 test con 32 fragmentos de 512 tokens.

| Modelo | Tamaño | Tools | GSM8K | MMLU | PPL |
|---|---:|---:|---:|---:|---:|
| Base UD-Q3_K_XL (sin podar) | 90 GB | .900 | 1.000 | .833 | 2.40 |
| **Este modelo (2/16 cabezas)** | **64.8 GB** | 1.000 | 1.000 | .833 | 4.66 |
| Tabla completamente eliminada (0/16) | 61.2 GB | .975 | 1.000 | .767 | 4.80 |

El autor advierte que la precisión de herramientas tiene una banda de variación de ±3 casos entre backends a temperatura 0 (una ejecución de control en CPU puntuó el base en .975), por lo que "1.000 frente a .900" debe leerse como paridad con el base, no como una mejora. El coste real es la perplexity: eliminar el 87,5% de la tabla duplica la perplexity de wikitext, mientras que el razonamiento y el uso de herramientas se mantienen en la línea base. No se han publicado resultados de benchmarks en otras suites (HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~66 GB o más para descarga completa del GGUF (64,8 GB de archivo + overhead de ejecución). El autor sugiere "~66 GB+ VRAM: fully offloaded".
- GPUs recomendadas: A100 80GB (usada en las pruebas), RTX 6000 Ada, o cualquier GPU con 66 GB+ de VRAM. En GPUs con menos VRAM, se puede usar el override `per_layer_token_embd.weight=CPU` para mantener la tabla n-grama en RAM del sistema, lo que permite ejecutar en tarjetas de 48 GB o inferiores.
- CPU-only: es posible ejecutar el modelo en equipos con ~70 GB de RAM libre, aunque lento pero correcto.
- Opciones de despliegue: llama.cpp (versión b10673 o posterior, con soporte `qwen4exp`); el autor usa `llama-server`. No se mencionan vLLM, Ollama ni TGI en la información disponible.
- Latencia y throughput: no se proporcionan datos concretos de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato | Tamaño archivo |
|---|---:|---:|---:|---|---:|
| Qwen3.8-Flash-Next (base, safetensors) | ~176B | 6B | 262K | qwen-community-1.0 | safetensors | ~90 GB (cuantizado UD-Q3_K_XL) |
| **Este modelo (GGUF podado)** | ~132B | 6B | 262K (nativo, no probado) | qwen-community-1.0 | GGUF | 64.8 GB |
| Qwen3.8-Flash-Next GGUF de unsloth (sin podar) | ~176B | 6B | 262K | qwen-community-1.0 | GGUF | 90 GB |

La comparativa se limita al propio modelo base y a la versión sin podar de unsloth, ya que no se dispone de datos de otros modelos de la misma categoría (MoE de ~130B con 6B activos). La principal diferencia es la reducción del 28% en tamaño de archivo con una penalización de perplexity (4,66 frente a 2,40) y sin pérdida en las tareas evaluadas. El modelo base conserva la multimodalidad y el contexto largo completo, mientras que esta variante es text-only y no ha sido probada a más de 8K de contexto.

## Limitaciones y advertencias

- Perplexity duplicada: en wikitext-2, la perplexity pasa de 2,40 (base) a 4,66 (este modelo). El autor indica que la prosa es "mediblemente menos pulida" en tareas de reproducción verbatim (citas, reproducción de plantillas) y que la tabla n-grama ausente puede notarse en cargas de trabajo con alta exigencia de recuerdo literal.
- Evaluación limitada: los benchmarks se basan en un conjunto interno pequeño (40 casos de herramientas, GSM8K-15, MMLU-30) y a contexto ≤8K. El comportamiento a contexto largo (QSA sparse attention, 256K nativo) no ha sido probado.
- Selección de cabezas no optimizada: las cabezas conservadas se eligieron posicionalmente (la primera de cada grupo de 8), no por ranking de importancia. Una selección calibrada podría dar resultados ligeramente mejores, pero nadie lo ha medido.
- Sin decodificación especulativa MTP: llama.cpp no exporta ni ejecuta la cabeza MTP para esta arquitectura, por lo que no se puede acelerar la generación con este mecanismo.
- Solo texto: los tensores de visión no están incluidos en este GGUF; la ruta multimodal no se ha probado con la cirugía aplicada.
- Restricciones de licencia: licencia qwen-community-1.0, heredada del modelo base. Es necesario revisar los términos de esa licencia para uso comercial, especialmente las cláusulas sobre servicios ofrecidos a terceros y uso en productos de gran escala.
- Riesgo de alucinación: no se han evaluado específicamente las tasas de alucinación en este modelo; como todo LLM, puede generar contenido falso o inconsistente, especialmente en tareas de recuerdo exacto donde la tabla n-grama podada podría afectar la fidelidad.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/Cyronius/Qwen3.8-Flash-Next-131B-A6B-GGUF
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Cuantización base de unsloth (origen de los tensores): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Guía de ejecución local de unsloth: https://unsloth.ai/docs/models/qwen3.8-next
- Pipeline de poda y script de cirugía: https://github.com/Cyronius/qwen-prune-heal-pipeline (`surgery_qwen38.py`)
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
