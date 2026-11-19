# gaurav0506/rag-cpt-qwen2.5-coder-3b

## Resumen

RAG-CPT-Qwen2.5-Coder-3B es un checkpoint de preentrenamiento continuado (CPT) derivado de Qwen/Qwen2.5-Coder-3B, publicado por el usuario gaurav0506 en Hugging Face. El modelo adapta el transformer decoder-only original de Qwen (3.090 millones de parámetros) a un corpus de 8,19 millones de tokens procedentes de documentación y código de frameworks de RAG de código abierto como LlamaIndex, LangChain, Haystack, Qdrant, Chroma, FastEmbed, GraphRAG, Ragas y AutoRAG. El objetivo declarado es especializar el modelo en arquitecturas de generación aumentada por recuperación en entornos de producción.

El ajuste se realizó mediante QLoRA de 4 bits con AdamW paginado de 8 bits durante 500 pasos, partiendo de una pérdida de entropía cruzada de 1,54 y convergiendo a 1,09. El resultado se distribuye como pesos fusionados en bfloat16 y como binario GGUF de alta precisión para servir en el borde. Es relevante para equipos que construyen asistentes de código o pipelines RAG y quieren un modelo pequeño (3B) con conocimiento específico del ecosistema de recuperación, aunque conviene señalar que se trata de un checkpoint de CPT, no de un modelo instruido: no incorpora alineación por instrucciones, y el autor publica por separado un modelo SFT derivado.

La licencia Apache 2.0 y el tamaño contenido lo hacen desplegable en hardware de consumo, pero la información publicada es escasa: no hay benchmarks, no se detalla la composición exacta del corpus más allá de la lista de frameworks, y el modelo solo declara soporte de inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-3B); detalles de atención y capas no disponibles |
| Parametros totales | 3.090 millones (3,09B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Pesos fusionados en bfloat16 y binario GGUF de alta precisión; niveles GGUF concretos no disponibles |
| Idiomas soportados | Ingles (declarado: `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16 fusionado) y GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-Coder-3B, un transformer decoder-only denso de 3.090 millones de parámetros. Sobre esa base se aplicó preentrenamiento continuado con QLoRA de 4 bits y optimizador AdamW paginado de 8 bits durante 500 pasos, sobre un corpus de 8,19 millones de tokens deduplicados extraídos de la documentación y el código de frameworks RAG de código abierto: LlamaIndex, LangChain, Haystack, Qdrant, Chroma, FastEmbed, GraphRAG, Ragas y AutoRAG. La pérdida de entropía cruzada pasó de 1,54 a 1,09 al final del entrenamiento.

Los adaptadores se fusionaron en pesos bfloat16 independientes, y se generó además un binario GGUF de alta precisión para inferencia local. No se documentan innovaciones arquitectónicas adicionales (atención lineal, decodificación especulativa, modos de razonamiento) ni etapas de RLHF o DPO; el autor publica un modelo SFT separado (rag-sft-qwen2.5-coder-3b) para el uso con instrucciones.

## Capacidades

- Generación de texto autoregresiva en inglés, con especialización en terminología y patrones de código del ecosistema RAG (LlamaIndex, LangChain, Haystack, Qdrant, Chroma, FastEmbed, GraphRAG, Ragas, AutoRAG).
- Generación y compleción de código Python orientado a pipelines de recuperación, indexación y evaluación.
- Capacidad heredada de Qwen2.5-Coder para tareas generales de código y texto, aunque el CPT puede haber desplazado parcialmente esa distribución.
- No se documenta soporte de tool calling ni function calling en la información proporcionada.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- Capacidades multilingües: solo inglés declarado.
- No se documentan capacidades de visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Asistente de código para frameworks RAG: el modelo puede autocompletar y generar fragmentos de configuración de LlamaIndex, LangChain o Haystack con la terminología correcta, al haber sido preentrenado sobre su documentación.
- Generación de código de integración con bases vectoriales: útil para producir clientes de Qdrant o Chroma, esquemas de colecciones y consultas, reduciendo errores de API por conocimiento específico del dominio.
- Construcción de pipelines de evaluación RAG: el modelo conoce Ragas y AutoRAG, por lo que puede generar plantillas de métricas y scripts de evaluación de recuperación.
- Servicio local en el borde con GGUF: el binario GGUF de alta precisión permite desplegar el modelo en portátiles o estaciones sin GPU dedicada mediante llama.cpp u Ollama, con un tamaño de pesos manejable para 3B.
- Base para fine-tuning posterior: al ser un checkpoint de CPT con licencia Apache 2.0, sirve como punto de partida para SFT específico de un dominio (por ejemplo, un framework interno) sin partir del modelo original.
- Prototipado rápido de asistentes de documentación técnica: con 3B parámetros y pesos bfloat16, se puede servir en una única GPU de consumo para pruebas de concepto de recuperación aumentada antes de escalar a modelos mayores.
- Generación de documentación de grafos de conocimiento: el conocimiento de GraphRAG permite generar esquemas y consultas para pipelines de recuperación basados en grafos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de entrenamiento reportado es la evolución de la pérdida de entropía cruzada (1,54 a 1,09 en 500 pasos), que no es comparable con métricas de evaluación estándar.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 6,2 GB solo para pesos (3,09B × 2 bytes), más overhead de activaciones y caché KV; en la práctica, en torno a 8 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 1,6-2 GB para pesos, con overhead adicional; los niveles GGUF concretos no están documentados.
- GPU recomendadas: RTX 4090, RTX 3090, A100 o H100 para servicio en bfloat16; GPUs de 8 GB o menos para cuantizaciones GGUF.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en bfloat16 y en GPUs de 4-6 GB con cuantización.
- Opciones de despliegue: llama.cpp y Ollama para el binario GGUF; vLLM o TGI para los pesos bfloat16 (compatibilidad no verificada en la información disponible).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RAG-CPT-Qwen2.5-Coder-3B | 3,09B | No disponible | CPT sobre corpus RAG (8,19M tokens) | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-Coder-3B | 3,09B | No disponible en la informacion proporcionada | Código general | Apache 2.0 | Hugging Face |
| gaurav0506/rag-sft-qwen2.5-coder-3b | 3,09B (derivado) | No disponible | SFT sobre instrucciones RAG | Apache 2.0 (segun model card del autor) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de preentrenamiento continuado, no un modelo instruido: no está alineado para seguir instrucciones y puede responder con continuaciones de texto en lugar de respuestas directas.
- Riesgo de olvido catastrófico: el CPT sobre un corpus estrecho de 8,19M tokens puede degradar capacidades generales de código y lenguaje del modelo base.
- Riesgo de alucinación en APIs y funciones de los frameworks: el modelo puede generar llamadas plausibles pero inexistentes o desactualizadas.
- Solo declara soporte de inglés; el rendimiento en castellano no está evaluado y probablemente sea deficiente.
- Longitud de contexto no documentada; no se debe asumir la ventana del modelo base sin verificación.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora frente al modelo base en tareas RAG.
- Corpus de entrenamiento pequeño (8,19M tokens) y 500 pasos: la especialización puede ser superficial.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5-Coder conviene verificar los términos del modelo base.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gaurav0506/rag-cpt-qwen2.5-coder-3b
- Modelo SFT relacionado: https://huggingface.co/gaurav0506/rag-sft-qwen2.5-coder-3b
- Dataset de preentrenamiento: https://huggingface.co/datasets/gaurav0506/rag-pretraining-corpus-8m
- Dataset de instrucciones SFT: https://huggingface.co/datasets/gaurav0506/rag-instruction-dataset-3k
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B
