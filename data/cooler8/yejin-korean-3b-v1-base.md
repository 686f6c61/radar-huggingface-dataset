# cooler8/yejin-korean-3b-v1-base

## Resumen

`yejin-korean-3b-v1-base` es un modelo de lenguaje fundacional (base) para coreano, desarrollado por el usuario `cooler8` y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo causal de 2.910.916.608 parámetros (aproximadamente 2,9 mil millones) entrenado desde cero (from-scratch) sobre un corpus coreano de más de 172 GB complementado con datos de AI Hub, utilizando 8 GPUs NVIDIA H200 (1.128 GB de VRAM en total). El modelo está diseñado específicamente para el idioma coreano y su tokenizador es `EleutherAI/polyglot-ko-1.3b`, con un vocabulario de 30.003 tokens.

La arquitectura sigue las especificaciones de referencia de Llama 3.2 3B, pero incorpora mejoras técnicas modernas como QK-Norm, Multi-Token Prediction (MTP), z-loss y embedding tying. Con una longitud de contexto de 4.096 tokens, el modelo está pensado para tareas de generación de texto en coreano, aunque los resultados de benchmarks publicados (MMLU y Belebele en coreano) son modestos, lo que sugiere que es un modelo base en fase temprana de desarrollo. Su relevancia radica en ser un modelo coreano de código abierto entrenado desde cero, lo que puede interesar a investigadores que necesiten un modelo base específico para el idioma coreano sin depender de modelos multilingües generales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.2 3B (referencia): hidden=3072, layers=28, heads=24, kv_heads=8, intermediate=8192, GQA 3:1, RoPE θ=500,000 |
| Parametros totales | 2.910.916.608 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de referencia de Llama 3.2 3B, con 28 capas, 24 cabezas de atención, 8 cabezas de clave/valor (GQA 3:1) y una dimensión oculta de 3072. Incorpora varias innovaciones técnicas: QK-Norm (normalización de las consultas y claves en atención), Multi-Token Prediction (MTP) con un factor λ=0.3, z-loss con α=1e-4 para estabilizar el entrenamiento, y embedding tying (compartir pesos entre la capa de embedding y la de salida). El tokenizador es `EleutherAI/polyglot-ko-1.3b`, con un vocabulario de 30.003 tokens.

El entrenamiento se realizó desde cero (sin partir de pesos preentrenados) sobre un corpus coreano de alta calidad de más de 172 GB, complementado con datos de AI Hub. Se utilizaron 8 GPUs NVIDIA H200 (1.128 GB de VRAM en total) para el preentrenamiento y posteriormente se aplicó un ajuste fino supervisado (SFT) completo con las mismas 8 GPUs. No se menciona el uso de RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto causal en coreano: el modelo es capaz de producir texto en coreano de forma autoregresiva, como se muestra en el ejemplo de uso de la model card.
- Procesamiento de instrucciones: aunque es un modelo base, el ejemplo de uso incluye un formato de instrucciones (`### 지시사항:` y `### 답변:`), lo que sugiere que puede responder a prompts estructurados tras el SFT.
- Soporte de contexto de 4.096 tokens: permite manejar conversaciones o documentos de longitud media en coreano.
- Capacidades multilingües: no disponible; el modelo está entrenado exclusivamente en coreano y su tokenizador es específico para ese idioma.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Modo de pensamiento (thinking mode), visión o audio: no disponible.

## Casos de uso

- Generación de texto en coreano para blogs o artículos: el modelo puede producir contenido escrito en coreano de forma coherente, útil para redacción asistida o generación de borradores.
- Asistente de conversación en coreano: gracias a su formato de instrucciones y su contexto de 4.096 tokens, puede mantener diálogos multi-turno en coreano, aunque su rendimiento en tareas complejas puede ser limitado.
- Preentrenamiento y fine-tuning para tareas específicas en coreano: al ser un modelo base, es adecuado para ser ajustado con datasets propios en tareas como clasificación de texto, análisis de sentimiento o extracción de información en coreano.
- Investigación académica sobre modelos de lenguaje coreanos: su arquitectura y entrenamiento desde cero lo convierten en un objeto de estudio para comparar técnicas como MTP o QK-Norm en un idioma de bajos recursos relativos.
- Prototipado de aplicaciones de NLP en coreano: desarrolladores pueden usarlo como punto de partida para experimentar con generación de texto, resumen o traducción (aunque la traducción no está confirmada).
- Evaluación de modelos base: su disponibilidad en safetensors y su licencia Apache 2.0 permiten integrarlo en pipelines de evaluación comparativa de modelos coreanos.

## Benchmarks y rendimiento

La model card publica dos resultados de benchmarks en coreano:

| Benchmark | Resultado |
|---|---|
| Global MMLU (coreano) | 23,02% |
| Belebele (coreano) | 22,44% |

Estos valores son bajos en comparación con modelos multilingües grandes, pero hay que tener en cuenta que se trata de un modelo base de 3B entrenado desde cero, sin ajuste fino específico para estas tareas. No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2.910.916.608 parámetros, en bfloat16 (formato típico para inferencia) el modelo ocupa aproximadamente 5,8 GB de memoria. En FP32 ocuparía unos 11,6 GB, que coincide con el tamaño del repositorio (11,6 GB), lo que sugiere que los pesos están almacenados en FP32 o BF16.
- GPU recomendadas: una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3070, RTX 4060 Ti, A10) puede ejecutar el modelo en bfloat16 con cuantización o sin ella. Para mayor comodidad, una RTX 3090 o RTX 4090 (24 GB) permitiría inferencia con contexto completo y batch mayor.
- Compatibilidad con GPUs de consumo: sí, cabe en GPUs de consumo con 8-12 GB de VRAM si se usa cuantización (aunque no se proporcionan versiones cuantizadas oficiales, se podría convertir a GGUF o usar bitsandbytes).
- Opciones de despliegue: se puede usar con Transformers (como se muestra en el ejemplo), vLLM, llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta) o TGI. No hay información sobre latencia o throughput.
- Entrenamiento: el preentrenamiento requirió 8x H200 (1.128 GB VRAM), pero para fine-tuning se podría usar una sola GPU con suficiente memoria (por ejemplo, 24 GB) con técnicas como LoRA.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos coreanos en la documentación proporcionada. Modelos como `polyglot-ko` (de EleutherAI) o `KoAlpaca` podrían ser comparables, pero no hay datos de rendimiento ni especificaciones detalladas en la información disponible. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado desde cero con un corpus específico, puede reflejar sesgos presentes en los datos de entrenamiento coreanos. No se han documentado sesgos específicos.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar contenido falso o inventado, especialmente en tareas de razonamiento o conocimiento factual. Los bajos resultados en MMLU (23,02%) indican una capacidad limitada para responder preguntas de conocimiento general.
- Limitaciones de contexto: la ventana de 4.096 tokens es relativamente corta para tareas que requieren contexto largo, como resumir documentos extensos o mantener conversaciones muy largas.
- Limitaciones de idioma: el modelo solo soporta coreano; no es adecuado para tareas multilingües.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación, pero se debe mantener el aviso de copyright y la atribución. No hay restricciones adicionales conocidas.
- Advertencia para producción: al ser un modelo base sin ajuste fino para tareas específicas, su rendimiento en aplicaciones reales puede ser insuficiente. Se recomienda fine-tuning con datos de la tarea objetivo antes de desplegarlo.
- Estado del modelo: el repositorio tiene 0 descargas y 0 likes, y la fecha de creación es futura (2026-09-01), lo que sugiere que es un modelo muy reciente o experimental. No hay garantías de mantenimiento o soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cooler8/yejin-korean-3b-v1-base
- Tokenizador: https://huggingface.co/EleutherAI/polyglot-ko-1.3b
- Repositorio de archivos del modelo: https://huggingface.co/cooler8/yejin-korean-3b-v1-base/tree/main (no se encontró en la búsqueda web, pero se infiere de la URL)
