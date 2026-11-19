# IsValorum/Qwen3.8-27B-pi-adapted-VAL-APEX-I-MicroPlus-V3-GGUF

## Resumen

Qwen3.8-27B-pi-adapted-VAL-APEX-I-MicroPlus-V3-GGUF es una cuantización GGUF del modelo base `harness-hub/Qwen3.8-27B-pi-adapted`, publicada por el usuario IsValorum dentro de su serie de cuantizaciones "APEX". El modelo base pertenece a la familia Qwen3.8 (arquitectura identificada en la model card como `qwen35`) y cuenta con 27.320.697.856 parámetros totales según los datos de safetensors del repositorio. La variante MicroPlus ocupa 10,08 GiB en disco, lo que la sitúa como la opción más ligera de la familia publicada por este autor (frente a MiniPlus de 13,31 GiB y NanoPlus de 12,37 GiB).

El interés de esta ficha reside en que se trata de una cuantización "quirúrgica" con mapa de tensores auditado: las proyecciones de atención y compuertas se mantienen en Q4_K/Q5_K, mientras que las capas FFN densas se comprimen agresivamente con IQ2_S e IQ2_XXS. Incorpora además protecciones en F32 para 408 tensores recurrentes y tensores auxiliares MTP (multi-token prediction), lo que sugiere que el modelo base emplea mecanismos de decodificación especulativa o predicción multi-token.

Es relevante ahora porque permite ejecutar un modelo de ~27B parámetros en hardware de consumo con una huella de ~10 GiB, manteniendo las partes críticas de atención en mayor precisión. La licencia es Apache 2.0 y los pesos están en formato GGUF para llama.cpp, lo que facilita el despliegue local en entornos de agentes. No obstante, el repositorio no incluye información sobre el entrenamiento del modelo base, idiomas soportados ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen35 (según model card); transformer con atención y tensores MTP auxiliares |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF mixta: Q4_0, Q4_K, Q5_K, IQ2_S, IQ2_XXS, F32 (protecciones) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La model card identifica la arquitectura como `qwen35` y describe una cuantización por capas con criterio explícito: las proyecciones de atención (`attn_q`, `attn_k`, `attn_v`, `attn_output`, `attn_gate`, `attn_qkv`) se mantienen en Q4_K o Q5_K, mientras que las proyecciones densas del FFN (`ffn_down`, `ffn_gate`, `ffn_up`) se comprimen a IQ2_S e IQ2_XXS en la mayoría de bloques. Se observan 408 tensores protegidos en F32, presumiblemente correspondientes a estados recurrentes y a los tensores auxiliares MTP (`nextn.eh_proj`, `nextn.enorm`, `nextn.hnorm`, `nextn.shared_head_norm`), lo que indica que el modelo base incorpora mecanismos de predicción multi-token.

La cuantización utiliza una matriz de importancias (imatrix) derivada de `unsloth/Qwen3.8-27B-GGUF/imatrix_unsloth.gguf` en un commit concreto, según declara el autor. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base pasó por RLHF, DPO u otras etapas de alineamiento. Tampoco se documenta en la información proporcionada si el modelo base es denso o MoE; el recuento de parámetros totales (27,3B) y la presencia de FFN densos en el mapa de tensores apuntan a una arquitectura densa, pero no se confirma explícitamente.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Orientación a agentes y flujos multi-paso (tags `agents`, `pi`, `mtp`).
- Soporte de predicción multi-token (MTP) en el modelo base, conservado en la cuantización mediante tensores auxiliares.
- Compatibilidad con llama.cpp y con endpoints compatibles (tag `endpoints_compatible`).
- Capacidad de razonamiento y código: no confirmada explícitamente en la información disponible; el modelo base es de la familia Qwen, pero no se documenta en esta ficha.
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no confirmado en la información proporcionada.

## Casos de uso

- Agentes locales en Windows: el autor distribuye V-Agent, un agente de escritorio open source que carga GGUF y permite ejecutar herramientas (shell, navegador, MCP) con aprobación de acciones; esta cuantización de ~10 GiB encaja en GPUs de consumo de 12-16 GB.
- Asistente conversacional con contexto largo: aunque la longitud de contexto no está documentada, la preservación de atención en Q4_K/Q5_K busca mantener calidad en conversaciones multi-turno.
- Automatización de tareas de escritorio con MCP: el modelo puede conectarse a servidores MCP a través de V-Agent para interactuar con servicios externos.
- Prototipado de pipelines de agentes en local: al ser GGUF compatible con llama.cpp, se puede integrar en scripts y orquestadores sin depender de APIs en la nube.
- Evaluación de cuantizaciones agresivas: útil para investigadores que quieran medir la degradación de un modelo de ~27B al comprimir FFN a 2 bits manteniendo atención en 4-5 bits.
- Despliegue en estaciones de trabajo con una sola GPU consumer: la huella de 10,08 GiB permite cargar el modelo completo en VRAM en tarjetas de 12 GB o superiores, con margen para contexto.
- Inferencia con decodificación especulativa: los tensores MTP conservados en F32 podrían habilitar decodificación multi-token si el runtime lo soporta, aunque no se documenta el soporte en llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~10,08 GiB para los pesos en disco; en VRAM se requiere un margen adicional para el contexto KV cache (dependiente de la longitud de contexto, no documentada). Estimación práctica: 11-12 GB para contexto corto y 14-16 GB para contexto medio.
- GPU recomendadas: RTX 4080/4090 (16-24 GB), RTX 3090 (24 GB), A100/H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas de 12 GB o más (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090). En 8 GB no cabe sin offloading a CPU.
- Opciones de despliegue: llama.cpp (builds oficiales CUDA, Vulkan, CPU), V-Agent (agente de escritorio del autor), y cualquier runtime compatible con GGUF. No se menciona soporte de vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponibles. Dependerán del hardware y del soporte efectivo de MTP en el runtime.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B-pi-adapted VAL-APEX-I MicroPlus (este) | 27,3B | no disponible | GGUF mixta ~10,08 GiB | Apache 2.0 | Hugging Face |
| Qwen3.8-27B-pi-adapted VAL-APEX-I MiniPlus | 27,3B | no disponible | GGUF ~13,31 GiB | Apache 2.0 | Hugging Face |
| Qwen3.8-27B-pi-adapted VAL-APEX-I NanoPlus | 27,3B | no disponible | GGUF ~12,37 GiB | Apache 2.0 | Hugging Face |

No se dispone de información sobre modelos comparables de otros autores con la misma tarea o tamaño en la información proporcionada.

## Limitaciones y advertencias

- La cuantización agresiva del FFN a IQ2_S e IQ2_XXS puede degradar la calidad en tareas de razonamiento y matemáticas frente al modelo base en mayor precisión.
- No se documentan sesgos conocidos del modelo base ni del proceso de cuantización.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no cuantificado en esta ficha.
- Longitud de contexto e idiomas soportados no documentados, lo que impide garantizar comportamiento multilingüe o ventanas largas.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base `harness-hub/Qwen3.8-27B-pi-adapted` y de la familia Qwen subyacente antes de desplegar en producción.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-18), por lo que no hay validación comunitaria ni reportes de calidad.
- La model card incluye enlaces de donación y promoción de V-Agent; el contenido promocional no debe interpretarse como aval técnico.
- El soporte efectivo de los tensores MTP en llama.cpp no está confirmado; si el runtime los ignora, se pierde la ventaja de decodificación multi-token.

## Enlaces

- Hugging Face: https://huggingface.co/IsValorum/Qwen3.8-27B-pi-adapted-VAL-APEX-I-MicroPlus-V3-GGUF
- Modelo base: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Variante MiniPlus: https://huggingface.co/IsValorum/Qwen3.8-27B-pi-adapted-VAL-APEX-I-MiniPlus-V3-GGUF
- Variante NanoPlus: https://huggingface.co/IsValorum/Qwen3.8-27B-pi-adapted-VAL-APEX-I-NanoPlus-V3-GGUF
- Imatrix utilizada: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- V-Agent (agente de escritorio): https://github.com/IsValorum/V-Agent
- Releases de V-Agent: https://github.com/IsValorum/V-Agent/releases/latest
- Ko-fi del autor: https://ko-fi.com/isvalorum
