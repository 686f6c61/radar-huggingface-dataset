# Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen013

## Resumen

Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen013 es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3.5-0.8B, desarrollado por el usuario Ch1c4g0 en el marco del curso "LLM講座2 2026" del laboratorio Matsuo-Iwasawa de la Universidad de Tokio. El modelo está especializado en una única tarea: generación de respuestas para un sistema de RAG (retrieval-augmented generation) sobre Wikipedia en japonés. Recibe como entrada una pregunta junto con cinco fragmentos de contexto recuperados y devuelve un objeto JSON con la respuesta y el identificador del fragmento que la sustenta.

Se trata de un modelo pequeño (873.438.784 parámetros, aproximadamente 0,87 mil millones) basado en la arquitectura del Qwen3.5-0.8B original, que el autor describe con componentes de atención lineal (proyecciones `in_proj_qkv`, `in_proj_z`, `in_proj_a`, `in_proj_b`, `out_proj`), lo que sugiere un diseño híbrido con atención lineal además de atención estándar. El ajuste se realizó mediante LoRA (r=16, alpha=32, dropout=0.05) durante 3 épocas sobre 1.109 ejemplos, y posteriormente se fusionó en los pesos originales, por lo que el repositorio contiene un checkpoint estándar sin adaptadores separados.

Su relevancia es acotada pero clara: demuestra cómo un modelo sub-1B puede especializarse mediante SFT de bajo coste (entrenamiento en Google Colab, sin APIs externas) para una tarea de QA con citación de fuentes, un patrón habitual en pipelines de RAG que necesitan respuestas trazables. La licencia Apache 2.0 y el hecho de que el modelo base sea también Apache 2.0 facilitan su reutilización, aunque el idioma de trabajo es exclusivamente japonés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen3.5 (con proyecciones de atención lineal: `in_proj_qkv`, `in_proj_z`, `in_proj_a`, `in_proj_b`, `out_proj`); detalles completos de la arquitectura no disponibles |
| Parámetros totales | 873.438.784 |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repo contiene safetensors en precisión original; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Japonés (`ja`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B (revisión `2fc06364715b967f1860aea9cf38778875588b17`) y conserva íntegramente su estructura, configuración, tokenizador, chat template y nombres, formas y tipos de los tensores. El autor indica que el ajuste se aplicó a las capas lineales del modelo de lenguaje —`down_proj`, `gate_proj`, `in_proj_a`, `in_proj_b`, `in_proj_qkv`, `in_proj_z`, `k_proj`, `o_proj`, `out_proj`, `q_proj`, `up_proj`, `v_proj`— mediante LoRA con r=16, alpha=32 y dropout=0.05 durante 3 épocas. Las proyecciones `in_proj_*` y `out_proj` son propias de mecanismos de atención lineal o de estado recurrente, lo que apunta a un diseño híbrido en el modelo base, aunque la model card no detalla la proporción de capas de atención estándar frente a lineales.

Los datos de entrenamiento son 1.109 ejemplos construidos a partir de JEMHopQA (train, ver1.2) y JSQuAD (train, v1.3, subconjunto de 1.000 preguntas de JGLUE), ambos bajo licencia CC BY-SA 4.0. Cada ejemplo empareja una pregunta con cinco fragmentos recuperados de Wikipedia en japonés (dataset `bumbuboon/llm-course-final-2026`) y la salida objetivo en formato `{"answer": ..., "chunk_id": ...}`. Se filtraron las preguntas sin evidencia en los fragmentos recuperados. Todo el proceso —construcción del dataset y entrenamiento— se ejecutó en Google Colab sin APIs externas ni otros LLM. No se documenta uso de RLHF, DPO ni preferencias humanas; es SFT puro. Tras el entrenamiento, el delta de LoRA se fusionó en los pesos originales, de modo que el repositorio distribuido no contiene adaptadores separados.

## Capacidades

- Generación de respuestas extractivas y abstractivas en japonés a partir de contexto recuperado.
- Salida estructurada en JSON con dos campos: `answer` (texto de la respuesta) y `chunk_id` (índice del fragmento que respalda la respuesta), lo que facilita la trazabilidad de la cita.
- Manejo de entradas con múltiples documentos de contexto (cinco fragmentos por consulta en el formato de entrenamiento).
- Tarea de question answering sobre conocimiento enciclopédico (Wikipedia en japonés).
- No se documenta soporte de tool calling ni function calling.
- No se documenta capacidad de agentes ni razonamiento multi-paso más allá del formato de respuesta con cita.
- No se documenta modo de razonamiento explícito (thinking mode), visión ni audio.
- Capacidad multilingüe limitada al japonés según la model card, aunque el modelo base Qwen3.5 probablemente soporta más idiomas; no se garantiza su comportamiento fuera del japonés tras el ajuste.

## Casos de uso

- Respuesta con cita de fuentes en un pipeline RAG sobre Wikipedia en japonés: el modelo recibe la pregunta y los cinco fragmentos recuperados por el retriever y devuelve el `chunk_id` que sustenta la respuesta, lo que permite mostrar al usuario la referencia exacta. Es el caso de uso para el que fue entrenado.
- Evaluación de retrievers: al devolver el identificador del fragmento utilizado, el modelo sirve como componente de un sistema de medición de la calidad del retrieval (por ejemplo, para calcular la tasa de acierto del fragmento citado frente al fragmento gold).
- Generación de respuestas trazables en asistentes documentales internos: en dominios donde se exige justificar cada afirmación con un pasaje concreto, el formato JSON con `chunk_id` reduce el trabajo de post-procesado para enlazar la respuesta a la fuente.
- Prototipado de bajo coste en entornos con recursos limitados: con menos de 1.000 millones de parámetros, el modelo puede ejecutarse en GPU de consumo y desplegarse en notebooks o entornos de desarrollo sin infraestructura dedicada.
- Filtrado y verificación de respuestas: el campo `chunk_id` permite descartar automáticamente respuestas cuyo fragmento citado no coincide con el esperado, como paso de control de calidad en un sistema mayor.
- Base para experimentos académicos de SFT: el repositorio documenta de forma reproducible (LoRA r=16, alpha=32, 3 épocas, 1.109 ejemplos, Colab) el proceso completo, lo que lo convierte en una referencia para cursos y prácticas de ajuste fino de modelos pequeños.
- Extracción de respuestas en formato JSON para integración en APIs: al producir siempre la misma estructura, el modelo se puede encadenar con validadores de esquema y servicios downstream sin parsers ad hoc.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,7-1,8 GB solo para los pesos (873 millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 2 y 4 GB según longitud de contexto y lote.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9-1,0 GB para los pesos; en 4 bits, alrededor de 0,5 GB. No obstante, el autor no publica variantes cuantizadas, por lo que habría que generarlas a partir de los safetensors.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 en lotes pequeños (RTX 3050, RTX 3060, RTX 4060, T4). Para mayor throughput, A10G, L4 o A100.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 y GPUs integradas con suficiente memoria compartida si se cuantiza.
- Opciones de despliegue: transformers (carga directa de safetensors), vLLM, TGI y llama.cpp/Ollama tras conversión a GGUF. No se publican archivos GGUF en el repositorio.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Especialización |
|---|---|---|---|---|---|
| Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen013 | 873 M | No disponible | Japonés | Apache 2.0 | QA con cita sobre Wikipedia (RAG) |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | No disponible | Multilingüe | Apache 2.0 | Modelo generalista |
| Modelos QA japoneses de tamaño similar (por ejemplo, variantes de Qwen ajustadas a JSQuAD) | ~0,5-1 B | Variable | Japonés | Variable | QA extractiva |

La comparación con alternativas concretas no está disponible en la información proporcionada: no se han publicado métricas del modelo ni de sus competidores directos en esta ficha. Frente a su modelo base, la diferencia principal es la especialización en el formato JSON con `chunk_id` y en el dominio de Wikipedia en japonés, a costa de perder generalidad.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea de QA con contexto recuperado en japonés; su comportamiento fuera de ese formato (por ejemplo, conversación libre o generación sin contexto) no está garantizado y probablemente degrade respecto al modelo base.
- Riesgo de alucinación: aunque el formato fuerza a citar un `chunk_id`, el modelo puede generar una respuesta que no esté respaldada por el fragmento citado o citar un fragmento incorrecto. El campo `chunk_id` no garantiza por sí solo la fidelidad factual.
- Sesgos: no se documentan evaluaciones de sesgo. Al entrenarse sobre JEMHopQA, JSQuAD y Wikipedia en japonés, hereda los sesgos de cobertura y redacción de esas fuentes.
- Limitación de idioma: la model card declara únicamente japonés; el rendimiento en castellano u otros idiomas no está evaluado y no debería asumirse.
- Limitación de contexto: no se especifica la longitud máxima de contexto soportada; el entrenamiento usa cinco fragmentos por consulta, por lo que entradas más largas o con otro número de documentos pueden degradar el rendimiento.
- Restricciones de licencia: el modelo se distribuye bajo Apache 2.0, pero los datos de entrenamiento (JEMHopQA, JSQuAD, Wikipedia en japonés) están bajo CC BY-SA 4.0. El uso comercial del modelo es posible según Apache 2.0, pero la redistribución de datos derivados de las fuentes CC BY-SA requiere cumplir las condiciones de atribución y compartir igual.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria ni informes de uso en producción.
- No se publican variantes cuantizadas ni archivos GGUF, lo que añade trabajo de conversión para despliegues en llama.cpp u Ollama.
- El entrenamiento se realizó en Google Colab con 1.109 ejemplos; el tamaño reducido del conjunto y las 3 épocas sugieren riesgo de sobreajuste al formato y al dominio, no evaluado en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen013
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de la competición: https://huggingface.co/datasets/bumbuboon/llm-course-final-2026
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- JGLUE (incluye JSQuAD): https://github.com/yahoojapan/JGLUE
- Wikipedia en japonés: https://ja.wikipedia.org/
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
