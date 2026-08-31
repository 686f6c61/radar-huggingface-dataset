# 0bserverx/Qwen3.8-Flash-Next-RVN-Uncensored-GGUF

## Resumen

El modelo `0bserverx/Qwen3.8-Flash-Next-RVN-Uncensored-GGUF` es una conversión a formato GGUF del fine-tune `0bserverx/Qwen3.8-Flash-Next-RVN-Uncensored`, que a su vez parte del modelo base `Qwen/Qwen3.8-Flash-Next` de Alibaba. Se trata de un modelo de texto puro, ya que en la conversión se han excluido los tensores de visión y los de decodificación especulativa (NextN/MTP). El autor lo presenta como una versión "uncensored" (sin censura) con un enfoque de alineación reducido, orientado a usos donde se requiere una generación menos restringida.

El modelo base Qwen3.8-Flash-Next es un MoE ultra-sparse de 125B parámetros totales (con 6B activos por token) que combina atención Gated DeltaNet (GDN) y Qwen Sparse Attention (QSA), con una ventana de contexto de 262K tokens. Esta versión GGUF permite ejecutarlo con llama.cpp en hardware variado, aunque por su tamaño requiere recursos considerables. La licencia es la Qwen Community License 1.0, que permite uso comercial con restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE ultra-sparse con GDN + QSA (Qwen4-exp) |
| Parametros totales | 125B (incluye tabla de embeddings N-gram de 51B) |
| Parametros activos | 6B por token |
| Longitud de contexto | 262K tokens (en el modelo base; en GGUF se recomienda 8192 en el ejemplo) |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K/IQ (algunos en estado "queued" o "building") |
| Idiomas soportados | no disponible (el modelo base soporta multilingue, pero no se especifica en la ficha) |
| Licencia | Qwen Community License 1.0 |
| Formato de pesos | GGUF (splits) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura híbrida de atención: tres de cada cuatro capas usan Gated DeltaNet (GDN) para comprimir el historial, y la cuarta capa usa Qwen Sparse Attention (QSA) para recuperación de largo alcance. Es un MoE ultra-sparse con 125B parámetros totales y 6B activos por token, más una tabla adicional de embeddings N-gram de 51B. El modelo base fue entrenado con datos multimodales y soporta razonamiento avanzado, superando según Qwen a Claude-4.6-Opus (Max) en ciertas tareas.

El fine-tune `RVN Uncensored` (realizado por 0bserverx) modifica el comportamiento de alineación del modelo, reduciendo los rechazos ante solicitudes potencialmente sensibles. No se proporcionan detalles sobre el dataset de fine-tune ni el método (RLHF, DPO, etc.). La conversión a GGUF excluye los tensores de visión y los de decodificación especulativa (NextN/MTP), por lo que la versión GGUF es exclusivamente de texto y no incluye el módulo de visión del modelo base.

## Capacidades

- Generación de texto y razonamiento de varios pasos, heredadas del modelo base Qwen3.8-Flash-Next.
- Soporte de tool calling y function calling (presente en el modelo base, aunque no se confirma explícitamente en la versión GGUF).
- Capacidad para tareas de agente con razonamiento multi-step y preservación del "thinking" a lo largo de la conversación (según la documentación del modelo base).
- Multilingüe (el modelo base soporta múltiples idiomas, aunque la ficha no detalla cuáles).
- Sin censura: el fine-tune reduce los rechazos ante contenido sensible, lo que permite generar respuestas que el modelo base podría bloquear.
- No incluye capacidades de visión en esta versión GGUF (el proyector de visión fue excluido).

## Casos de uso

- Generación de contenido creativo sin restricciones: el modelo puede producir narrativas, guiones o diálogos con temáticas adultas o controvertidas que otros modelos censurarían. Es adecuado para proyectos de escritura experimental o investigación sobre generación de texto sin filtros.
- Asistentes de rol (roleplay) avanzado: gracias a su gran contexto (262K) y su capacidad de razonamiento, puede mantener personajes y tramas complejas a lo largo de conversaciones muy largas, sin perder coherencia.
- Análisis de documentos extensos: con 262K tokens de contexto, puede procesar libros completos o informes largos y responder preguntas sobre ellos, aunque la versión GGUF requiere suficiente RAM/VRAM.
- Desarrollo de agentes autónomos: el modelo base está optimizado para escenarios de agente con preservación del razonamiento, por lo que puede integrarse en pipelines de automatización que requieran decisiones consistentes a lo largo de múltiples turnos.
- Investigación sobre alineación y seguridad: al ser una versión "uncensored", permite estudiar los efectos de la reducción de rechazos y comparar comportamientos con el modelo base.
- Despliegue en entornos con llama.cpp: al estar en formato GGUF, puede ejecutarse en CPU o GPU con llama.cpp, Ollama u otros runners compatibles, facilitando su integración en aplicaciones locales.

## Benchmarks y rendimiento

El autor de la model card proporciona una evaluación propia, pero no se publican benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). La tabla siguiente resume los resultados de su evaluación interna:

| Metrica | Resultado |
|---|---|
| RR100 substantive compliance | 65/100 |
| RR100 effective rejection | 34/100 |
| Protected child-safety gate | 5/5 pass |
| Benign coherence | 20/20 |

Estos valores indican que el modelo cumple parcialmente con las instrucciones de seguridad (65/100) pero tiene una baja tasa de rechazo efectivo (34/100), lo que confirma su naturaleza "uncensored". No hay datos comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- El modelo tiene 125B parámetros totales, por lo que incluso con cuantización Q4_K_M el archivo GGUF ocupará aproximadamente 70-80 GB (estimación basada en el tamaño típico de un MoE de ese tamaño; no se proporciona el tamaño exacto).
- Para inferencia en GPU, se recomienda al menos 80 GB de VRAM (por ejemplo, A100 80GB o H100) para cargar el modelo en Q4_K_M con contexto moderado. Con cuantizaciones más bajas (Q3_K_M) podría caber en 48 GB, pero con pérdida de calidad.
- En CPU, llama.cpp puede ejecutar el modelo con suficiente RAM (se ha reportado que el modelo base puede correr en 75 GB de RAM/unified memory sin GPU, según unsloth). Para la versión GGUF, se necesitaría al menos 80-100 GB de RAM.
- No se proporcionan datos de latencia o throughput. Se recomienda usar una GPU reciente (RTX 4090, A100, H100) para obtener velocidades aceptables.
- Opciones de despliegue: llama.cpp (recomendado, con soporte para `qwen4exp`), Ollama, y cualquier runtime compatible con GGUF.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | 125B (6B activos) | 262K | Qwen Community 1.0 | safetensors | Incluye visión y NextN/MTP |
| 0bserverx/Qwen3.8-Flash-Next-RVN-Uncensored-GGUF | 125B (6B activos) | 262K (recomendado 8K en ejemplo) | Qwen Community 1.0 | GGUF | Sin visión, sin NextN/MTP, uncensored |
| mradermacher/Qwen3.8-Flash-Next-Uncensored-GGUF | 125B (6B activos) | 262K | Qwen Community 1.0 | GGUF | Otra conversión GGUF del mismo fine-tune (sin detalles adicionales) |

No se dispone de comparativas con otros modelos de la misma categoría (por ejemplo, Llama 3.1 405B o Mixtral 8x22B) en la información proporcionada.

## Limitaciones y advertencias

- El modelo es "uncensored" y tiene una baja tasa de rechazo efectivo (34/100), lo que implica que puede generar contenido inapropiado, ofensivo o peligroso si se le solicita. No es adecuado para aplicaciones donde se requiera moderación de contenido.
- La evaluación del autor muestra una cumplimiento sustantivo de seguridad de solo 65/100, lo que sugiere que el modelo puede ignorar instrucciones de seguridad en algunos casos.
- La versión GGUF excluye el módulo de visión, por lo que no puede procesar imágenes, a diferencia del modelo base.
- La licencia Qwen Community License 1.0 permite uso comercial, pero impone restricciones (por ejemplo, no usar el modelo para servicios que compitan con Qwen, y mantener atribución). Es necesario revisar los términos completos.
- El contexto de 262K es teórico; en la práctica, con llama.cpp y cuantización, el contexto efectivo puede ser menor y dependerá de la memoria disponible.
- No se han publicado benchmarks estándar, por lo que el rendimiento en tareas como matemáticas, código o razonamiento general no está verificado de forma independiente.
- El modelo puede alucinar, especialmente en tareas de hechos o datos precisos, como cualquier LLM de gran tamaño.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/0bserverx/Qwen3.8-Flash-Next-RVN-Uncensored-GGUF
- Modelo base (fine-tune) en HuggingFace: https://huggingface.co/0bserverx/Qwen3.8-Flash-Next-RVN-Uncensored
- Modelo base original de Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Documentación de unsloth sobre ejecución local: https://unsloth.ai/docs/models/qwen3.8-next
- Receta de vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Conversión GGUF alternativa de mradermacher: https://huggingface.co/mradermacher/Qwen3.8-Flash-Next-Uncensored-GGUF
