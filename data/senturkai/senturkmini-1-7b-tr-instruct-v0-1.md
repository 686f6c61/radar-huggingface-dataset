# SenturkAI/SenturkMini-1.7B-TR-Instruct-v0.1

## Resumen

SenturkMini-1.7B-TR-Instruct-v0.1 es un modelo de lenguaje compacto de 1.740.366.848 parámetros (aproximadamente 1,7B), desarrollado por SenturkAI a partir del modelo base Qwen/Qwen3-1.7B-Base. Está especializado en tareas corporativas en turco: generación de JSON estructurado, Text-to-SQL, extracción de entidades (NER), clasificación, resumen de documentos, RAG y análisis de sentimiento. Su propuesta es cubrir el hueco de modelos abiertos realmente funcionales en turco para flujos de trabajo empresariales en el rango de los 1,7B parámetros, donde la oferta es escasa.

Técnicamente es un transformer causal de la familia Qwen3 (`Qwen3ForCausalLM`) con 28 capas y un tamaño oculto de 2048. El autor amplió el vocabulario original en 10.000 tokens turcos hasta alcanzar los 161.600 tokens, con el objetivo de reducir la fragmentación de raíces y sufijos del turco. El modelo se ha entrenado con continuación de preentrenamiento (CPT) multietapa sobre corpus turco y ajuste supervisado (SFT) multietapa con datos destilados de modelos de mayor tamaño; no se aplicó ninguna fase de alineación por preferencias (DPO, RPO ni RLHF).

La longitud de contexto recomendada y validada es de 16.384 tokens (16K), aunque `max_position_embeddings` hereda el límite técnico de 32.768 de la arquitectura base. El modelo se distribuye con licencia Apache-2.0 en safetensors (BF16) y en tres cuantizaciones GGUF (BF16, Q8_0 y Q4_K_M), además de un `Modelfile` para Ollama. Está entrenado con el modo "thinking" desactivado: no genera bloques `<think>` y responde directamente, lo que simplifica su integración en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso, `Qwen3ForCausalLM` (28 capas, hidden size 2048) |
| Parametros totales | 1.740.366.848 (~1,7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 16.384 tokens recomendados y validados; `max_position_embeddings` técnico de 32.768 heredado de la arquitectura base |
| Tipos de cuantizacion | BF16 (safetensors y GGUF), Q8_0, Q4_K_M |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16, ~3,48 GB), GGUF BF16 (~3,49 GB), GGUF Q8_0 (~1,86 GB), GGUF Q4_K_M (~1,12 GB), `Modelfile` para Ollama |

Otros datos técnicos: vocabulario de 161.600 tokens (10.000 tokens turcos añadidos sobre el original), formato de chat ChatML, tokens especiales `<|im_start|>` (151644) y `<|im_end|>` (151645, `eos_token`), `<|endoftext|>` (151643, `pad_token`/`bos_token`), y tokens de tool calling `<tool_call>` (151657), `</tool_call>` (151658), `<tool_response>` (151665) y `</tool_response>` (151666). Stop words recomendadas: `<|im_end|>` y `<|endoftext|>`.

## Arquitectura y entrenamiento

La arquitectura es un transformer causal denso estándar de la familia Qwen3, con 28 capas y dimensión oculta de 2048, sin mecanismos MoE ni atención lineal. La innovación principal respecto al modelo base es la expansión del tokenizador en 10.000 tokens turcos, que eleva el vocabulario a 161.600 entradas para segmentar mejor las raíces y los sufijos aglutinantes del turco, reduciendo el número de tokens necesarios por palabra. El modelo conserva los tokens especiales heredados de Qwen3 (FIM para código, marcadores de visión y de razonamiento), aunque no se ha entrenado para usarlos en el caso de visión ni de thinking.

El entrenamiento consta de dos fases. Primero, una continuación de preentrenamiento (CPT) multietapa sobre un corpus extenso de texto turco. Después, un ajuste supervisado (SFT) también multietapa, con datos de entrenamiento obtenidos por destilación de modelos de mayor calidad en cada tarea objetivo. El autor declara explícitamente que no se aplicó ninguna fase de alineación por preferencias (DPO, RPO o RLHF), y que durante el desarrollo se probaron enfoques experimentales, a veces alejados de la literatura, por lo que el modelo no se presenta como libre de errores. El modo thinking se mantuvo desactivado en todas las etapas: la plantilla `chat_template.jinja` no incluye el flujo `<think>` y el modelo produce la respuesta final directamente.

## Capacidades

- Generación de texto en turco con respuestas directas, sin bloque de razonamiento `<think>`.
- Extracción de JSON estructurado y salida con formato fijo (structured output), orientada a integraciones de software.
- Text-to-SQL: traducción de preguntas en lenguaje natural a consultas SQL.
- Extracción de entidades nombradas (NER) y extracción de entidades en general.
- Clasificación de texto, filtrado lógico y análisis de sentimiento.
- Extracción de palabras clave y resumen de documentos.
- Soporte de RAG sobre contextos largos gracias a la ventana de 16K tokens.
- Soporte de tool calling / function calling mediante los tokens especiales `<tool_call>` y `<tool_response>`.
- Capacidad de seguir instrucciones de negocio multietapa (multi-step), aunque sin modo de razonamiento explícito.
- Capacidades multilingües: únicamente turco declarado; no se documenta soporte de otros idiomas.
- No dispone de capacidades de visión ni de audio operativas, pese a heredar los tokens reservados de la arquitectura base.

## Casos de uso

- Extracción de JSON estructurado en pipelines de datos: el modelo convierte texto libre en turco (correos, formularios, tickets) en objetos JSON con un esquema predefinido, lo que permite alimentar bases de datos y APIs sin postprocesado manual. Es adecuado por su entrenamiento específico en structured output y su bajo coste de inferencia.
- Text-to-SQL para analítica interna: un usuario formula una pregunta en turco sobre un esquema de base de datos y el modelo genera la consulta SQL correspondiente. La ventana de 16K permite incluir el DDL completo de tablas medianas en el prompt.
- RAG sobre documentación corporativa: con 16.384 tokens de contexto se pueden insertar varios fragmentos recuperados junto con la pregunta, y el modelo responde de forma extractiva o genera resúmenes citando el contexto, con temperatura recomendada de 0,30 para minimizar desviaciones.
- Atención al cliente y triaje de tickets: clasificación automática de solicitudes entrantes por categoría, sentimiento y urgencia, y extracción de entidades (producto, número de pedido, fecha) para enrutarlas al equipo adecuado.
- Resumen de documentos largos: informes, contratos o actas en turco que caben en la ventana de 16K se pueden resumir en una sola pasada, sin necesidad de chunking ni de modelos de mayor tamaño.
- Enriquecimiento de catálogos y bases de conocimiento: extracción de palabras clave, entidades y relaciones a partir de descripciones de producto o artículos, para construir índices de búsqueda y grafos de conocimiento.
- Asistentes de flujo de trabajo con tool calling: el modelo puede emitir llamadas a funciones en el formato `<tool_call>` para consultar APIs internas, rellenar formularios o ejecutar acciones dentro de un agente, con la ventaja de que no genera razonamiento intermedio que consuma tokens.
- Despliegue en entornos con recursos limitados: al caber en cuantización Q4_K_M en torno a 1,12 GB, es viable en CPU, en GPUs de consumo y en dispositivos de borde para tareas de clasificación y extracción en tiempo real.

## Benchmarks y rendimiento

El autor menciona una evaluación mediante un benchmark corporativo en turco para modelos pequeños, preparado de forma independiente y puntuado por un juez (Claude Sonnet 5 High) en modalidad de test ciego. Sin embargo, en la información disponible no se incluyen las puntuaciones numéricas ni la tabla de resultados de dicho benchmark.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB en BF16, unos 2 GB en Q8_0 y en torno a 1,2 GB en Q4_K_M (más el overhead de la ventana KV cache, que crece con el contexto).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para BF16; una RTX 3060, RTX 4060 o superior es suficiente. Para servir varias peticiones concurrentes con contexto de 16K son preferibles GPUs de 16-24 GB (RTX 4090, L4, A10G). En A100/H100 el modelo queda muy sobredimensionado en memoria y el cuello de botella pasa a ser el throughput, no la VRAM.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones GGUF; en Q4_K_M puede ejecutarse incluso en CPU con llama.cpp u Ollama.
- Opciones de despliegue: transformers (safetensors), llama.cpp y Ollama (archivos GGUF y `Modelfile` incluidos), Text Generation Inference (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`), y vLLM como opción habitual para modelos Qwen3, aunque no se documenta explícitamente en la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| SenturkMini-1.7B-TR-Instruct-v0.1 | ~1,7B | 16K | Turco | Apache-2.0 | Especializado en tareas corporativas en turco, vocabulario ampliado, sin alineación por preferencias |
| Qwen/Qwen3-1.7B-Base | ~1,7B | 32.768 (técnico) | Multilingüe | Apache-2.0 | Modelo base del que deriva; no especializado en turco ni en structured output |
| Qwen3-1.7B (versión instruct oficial) | ~1,7B | 32.768 | Multilingüe | Apache-2.0 | Alternativa generalista con modo thinking; rendimiento en turco no verificado en esta ficha |
| Modelos turcos de ~1-3B de otros autores | no disponible | no disponible | Turco | variable | No se dispone de datos comparativos en la información proporcionada |

La comparación cuantitativa de rendimiento entre estos modelos no está disponible: el autor no publica las puntuaciones numéricas de su benchmark ciego, por lo que no es posible establecer una jerarquía objetiva.

## Limitaciones y advertencias

- El propio autor advierte de que el modelo se desarrolló con enfoques experimentales y no está libre de errores; pueden aparecer salidas inesperadas.
- No se aplicó alineación por preferencias (DPO/RLHF), por lo que el modelo puede no rechazar peticiones problemáticas con la robustez de un modelo alineado y puede presentar sesgos presentes en los datos de destilación.
- Riesgo de alucinación inherente a un modelo de 1,7B: en tareas de razonamiento complejo o conocimiento factual puede inventar datos; conviene validar las salidas en producción.
- Soporte exclusivo de turco: no se garantiza un comportamiento correcto en castellano ni en otros idiomas, pese a heredar un tokenizador multilingüe.
- El contexto recomendado es de 16K, inferior al límite técnico de 32.768; usar ventanas mayores no está validado y puede degradar la calidad.
- El modo thinking está desactivado y no debe activarse: forzar el bloque `<think>` no producirá razonamiento válido.
- Aunque la licencia Apache-2.0 permite uso comercial, el modelo se distribuye "tal cual", sin garantías; el autor no ofrece soporte ni compromiso de mantenimiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no existe validación independiente de la comunidad.
- Los tokens de visión y audio heredados no implican capacidades multimodales reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SenturkAI/SenturkMini-1.7B-TR-Instruct-v0.1
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Perfil del autor: https://huggingface.co/SenturkAI
- No se han encontrado en la información disponible papers, blogs, repositorios adicionales ni demos asociados al modelo.
