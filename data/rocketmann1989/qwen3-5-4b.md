# Rocketmann1989/Qwen3.5-4B

## Resumen

Qwen3.5-4B es un modelo de lenguaje causal con codificador de visión desarrollado por el equipo Qwen (Alibaba). Se distribuye como un modelo post-entrenado en formato Hugging Face Transformers y pertenece a la familia Qwen3.5, que integra fusión temprana de tokens multimodales, una arquitectura híbrida eficiente y entrenamiento por refuerzo a gran escala. El repositorio analizado (Rocketmann1989/Qwen3.5-4B) es una réplica del modelo base oficial Qwen/Qwen3.5-4B-Base, sin métricas de adopción (0 descargas, 0 likes) en el momento de la consulta.

El modelo resuelve tareas de generación de texto, razonamiento, código, matemáticas y comprensión visual dentro de una única pila unificada, con una ventana de contexto nativa de 262.144 tokens extensible hasta 1.010.000. Su arquitectura combina Gated DeltaNet (atención lineal) con atención con compuerta y una red feed-forward dispersa tipo Mixture-of-Experts, lo que busca alto rendimiento de inferencia con latencia y coste reducidos.

Es relevante porque empaqueta capacidades multimodales y de agentes en un tamaño de 4B parámetros, con licencia Apache 2.0 y compatibilidad declarada con vLLM, SGLang, KTransformers y Transformers. El dato real de safetensors indica 4.659.865.088 parámetros totales, por encima de los "4B" nominales de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrida Gated DeltaNet + Gated Attention + FFN (MoE disperso) |
| Parametros totales | 4.659.865.088 (safetensors); model card indica "4B" |
| Parametros activos | no disponible (la model card no desglosa el número de expertos activos) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantizacion | no disponible (la model card no enumera cuantizaciones publicadas) |
| Idiomas soportados | 201 idiomas y dialectos (según model card); lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 9,3 GB); compatible con Transformers, vLLM, SGLang, KTransformers |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con codificador de visión y fusión temprana de tokens multimodales. La disposición de capas es 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), es decir, 32 capas en total. La dimensión oculta es 2560, el embedding de tokens es de 248.320 (con padding) y la salida LM está atada a dicho embedding. La FFN tiene dimensión intermedia de 9216. Gated DeltaNet emplea 32 cabezas de atención lineal para V y 16 para QK con dimensión de cabeza 128; la Gated Attention usa 16 cabezas para Q y 4 para KV con dimensión de cabeza 256 y dimensión RoPE de 64. El modelo se entrenó con multi-token prediction (MTP) en varios pasos.

El entrenamiento incluye fases de pre-entrenamiento y post-entrenamiento. La model card declara entrenamiento por refuerzo escalado a entornos de millones de agentes con distribuciones de tareas progresivamente complejas, además de una infraestructura de entrenamiento multimodal con eficiencia cercana al 100 % respecto al entrenamiento solo de texto y marcos de RL asíncronos. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicó RLHF o DPO de forma explícita.

## Capacidades

- Generación de texto y razonamiento general, con paridad declarada frente a Qwen3 y superioridad declarada frente a Qwen3-VL en razonamiento, código, agentes y comprensión visual.
- Comprensión y generación multimodal de imagen-texto (pipeline `image-text-to-text`), gracias al codificador de visión y la fusión temprana de tokens.
- Capacidades de código y matemáticas, evaluadas en los benchmarks de la model card.
- Soporte multilingüe amplio: 201 idiomas y dialectos según la model card.
- Capacidades de agente y razonamiento multi-paso, con entrenamiento RL en entornos multi-agente.
- Multi-token prediction (MTP) entrenado en varios pasos, orientado a decodificación especulativa y mayor throughput.
- Compatibilidad con tool calling / function calling: no se detalla explícitamente en la información disponible, aunque el posicionamiento del modelo en tareas de agentes lo sugiere; tratar como no confirmado.
- Modo thinking: no se especifica en la información disponible para esta variante concreta.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 262.144 tokens nativos, lo que permite mantener historiales extensos y documentación de producto en la misma ventana.
- Generación de código en producción: su entrenamiento en código y su compatibilidad con vLLM y SGLang permiten integrarlo en pipelines de CI/CD para revisión, generación de tests y autocompletado en editores.
- Análisis de documentos con imágenes: al ser un modelo image-text-to-text, puede procesar facturas, capturas o diagramas junto con texto para extracción de información estructurada.
- Asistentes de investigación multilingües: con 201 idiomas declarados, es adecuado para resumir y traducir documentación técnica en entornos con usuarios de múltiples regiones.
- Agentes autónomos de múltiples pasos: el entrenamiento RL en entornos multi-agente y el soporte de contexto largo lo hacen apto para orquestación de tareas con planificación y uso de herramientas.
- Razonamiento sobre bases de código extensas: la ventana de 1.010.000 tokens extensible permite cargar repositorios completos o grandes volúmenes de documentación para tareas de comprensión y refactorización.
- Despliegue en hardware de gama media: con 4B parámetros nominales y licencia Apache 2.0, es candidato para inferencia en una sola GPU consumer o en entornos con presupuesto limitado.

## Benchmarks y rendimiento

Resultados publicados en la model card (categoría Knowledge & STEM):

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80,8 | 74,8 | 82,7 | 80,9 | 82,5 | 79,1 |
| MMLU-Redux | 91,0 | 87,8 | 92,5 | 91,4 | no disponible en el extracto | no disponible en el extracto |

La información proporcionada solo incluye de forma completa las filas MMLU-Pro y MMLU-Redux; el resto de categorías de la figura de benchmarks no está disponible en el texto extraído. No se han publicado en la información disponible resultados de HumanEval, GSM8K ni otros benchmarks fuera de los citados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de ~4,66B parámetros en fp16 requiere aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y caché KV; en cuantización de 8 bits rondaría 4,7 GB y en 4 bits unos 2,4 GB, aunque estas cifras no están confirmadas por el autor.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 4090 (24 GB) o A100/H100 son suficientes en fp16; una GPU consumer de 8-12 GB podría ejecutarlo en cuantización de 4-8 bits.
- Cabe en GPU consumer: probable en fp16 en GPUs de 12-16 GB o superiores; en cuantización baja, en GPUs de 8 GB, sujeto a verificación empírica.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y KTransformers según la model card. No se mencionan llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. La arquitectura híbrida con Gated DeltaNet y MTP está orientada a alto throughput y baja latencia, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B | 4,66B (safetensors) | 262.144 nativo / 1.010.000 extensible | 79,1 | Apache 2.0 | Hugging Face |
| Qwen3.5-9B | no disponible | no disponible | 82,5 | no disponible en el extracto | Hugging Face |
| GPT-OSS-20B | 20B (nominal) | no disponible | 74,8 | no disponible en el extracto | no disponible |
| Qwen3-30BA3B-Thinking-2507 | 30B (nominal, MoE) | no disponible | 80,9 | no disponible en el extracto | Hugging Face |

El modelo ofrece un MMLU-Pro de 79,1 con un tamaño muy inferior al de GPT-OSS-20B (74,8) y cercano al de Qwen3-30BA3B-Thinking-2507 (80,9), lo que refleja la eficiencia de la arquitectura híbrida. La comparación completa con alternativas de la misma categoría (modelos multimodales de 4B) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; la cobertura de 201 idiomas no garantiza calidad homogénea en todos ellos.
- Riesgo de alucinación: inherente a los modelos generativos; no se aportan evaluaciones específicas de factualidad.
- Limitaciones de contexto o idioma: aunque el contexto nativo es de 262.144 tokens, el rendimiento en ventanas extremas (hasta 1.010.000) no está verificado empíricamente en la información disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar el enlace de licencia oficial del modelo base.
- Caveat de producción: el repositorio analizado tiene 0 descargas y 0 likes, por lo que no hay evidencia de validación comunitaria; conviene contrastar los pesos con el repositorio oficial Qwen/Qwen3.5-4B-Base.
- No se detallan en la información disponible los tipos de cuantización publicados ni los parámetros activos del MoE, lo que dificulta planificar el despliegue con precisión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Rocketmann1989/Qwen3.5-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia oficial: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
