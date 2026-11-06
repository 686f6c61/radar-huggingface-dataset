# rubenroy/Gilgamesh-72B

## Resumen

Gilgamesh 72B es un ajuste fino (finetune) del modelo Qwen2.5-72B-Instruct de Alibaba, desarrollado por Ruben Roy con financiación de Ovantage Labs. El modelo parte de la arquitectura transformer densa de Qwen2.5 (80 capas, 72.700 millones de parámetros totales, 70.000 millones sin embeddings, GQA con 64 cabezas de consulta y 8 de clave-valor) y se ha reentrenado sobre tres corpus propios orientados a precisión factual, razonamiento matemático paso a paso y conocimiento general conversacional.

El objetivo declarado es reforzar tres áreas concretas: la exactitud factual mediante pares pregunta-respuesta, la capacidad de razonamiento matemático con cadenas de pensamiento (CoT) y la amplitud temática conversacional con un corpus de cinco millones de líneas. No se trata de un modelo nuevo desde cero, sino de una especialización sobre una base ya muy capaz, por lo que hereda las capacidades lingüísticas, de código y de tool calling del modelo original de Qwen.

Es relevante ahora porque demuestra el patrón de especialización de modelos abiertos de gran tamaño mediante datasets curados por el propio autor, y porque está disponible para despliegue en Microsoft Foundry (Azure AI) a través de Text Generation Inference, además de en Hugging Face. Su licencia es la de Qwen (Qwen License Agreement), no una licencia permisiva propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Qwen2), RoPE, SwiGLU, RMSNorm, atención QKV con bias, GQA |
| Parámetros totales | 72.706.203.648 (72,7B); 70,0B sin embeddings |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Qwen2.5-72B-Instruct soporta hasta 131.072 tokens, pero el autor no lo confirma para este finetune) |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; no se documentan GGUF/AWQ/GPTQ oficiales) |
| Idiomas soportados | Inglés (declarado: `en`) |
| Licencia | Other (Qwen License Agreement, Copyright Alibaba Cloud) |
| Formato de pesos | Safetensors (librería transformers) |
| Capas | 80 |
| Cabezas de atención | 64 (Q) / 8 (KV), GQA |
| Tamaño del repositorio | 145,4 GB |
| Descargas / likes | 34 / 1 |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-72B-Instruct sin modificaciones estructurales: transformer causal denso con 80 capas, normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con query-key-value bias y grouped-query attention (64 cabezas de consulta frente a 8 de clave-valor). El ajuste fino se realizó sobre tres datasets construidos y curados por el autor y su equipo en Ovantage Labs: GammaCorpus-v2-5m (5 millones de líneas de propósito general para conocimiento amplio y conversación), GammaCorpus-CoT-Math-170k (170.000 ejemplos de razonamiento matemático con cadena de pensamiento) y GammaCorpus-Fact-QA-450k (450.000 pares pregunta-respuesta factuales).

No se documentan en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset, la existencia de fases de RLHF o DPO posteriores al ajuste supervisado, ni hiperparámetros del entrenamiento. El autor indica que el entrenamiento se llevó a cabo con GPUs H100 proporcionadas por Ovantage Labs, pero no detalla el número de GPUs ni la duración. Tampoco se describen innovaciones técnicas propias más allá de la curaduría de los datasets; el modelo hereda las características del base (soporte de contexto largo, tool calling y plantilla de chat de Qwen2.5).

## Capacidades

- Generación de texto conversacional multi-turno en inglés, con plantilla de chat compatible con `apply_chat_template` de transformers.
- Razonamiento matemático paso a paso, reforzado mediante el corpus CoT-Math de 170.000 ejemplos.
- Respuesta a preguntas factuales, reforzada mediante el corpus Fact-QA de 450.000 pares.
- Conocimiento general amplio gracias al corpus de 5 millones de líneas.
- Herencia de las capacidades del modelo base Qwen2.5-72B-Instruct: generación de código, matemáticas, razonamiento estructurado y soporte de tool calling / function calling (no verificado de forma independiente en este finetune).
- Capacidades multilingües del base potencialmente presentes, aunque el autor solo declara inglés como idioma soportado.
- Compatible con Text Generation Inference (TGI) y con despliegue en Microsoft Foundry (Azure).
- No se documentan capacidades de visión, audio ni modo "thinking" explícito en la información disponible.

## Casos de uso

- Asistente conversacional de propósito general en inglés: el modelo puede mantener diálogos multi-turno sobre temas diversos gracias al corpus general de 5 millones de líneas, adecuado para chatbots de atención al usuario en productos de nicho angloparlantes.
- Tutor de matemáticas: el entrenamiento con cadenas de pensamiento permite descomponer problemas en pasos intermedios, útil para plataformas educativas que necesitan explicaciones razonadas y no solo la respuesta final.
- Sistema de preguntas y respuestas factuales: el corpus Fact-QA de 450.000 pares lo orienta a responder consultas de conocimiento concreto en dominios cubiertos por el dataset, apropiado para bases de conocimiento internas o asistentes de documentación.
- Generación y revisión de código en pipelines de desarrollo: al heredar el base Qwen2.5-72B-Instruct, puede integrarse en flujos de autocompletado, revisión de parches o generación de tests, siempre que se valide el comportamiento tras el finetune.
- Despliegue empresarial en Azure: disponible en Microsoft Foundry con TGI, lo que facilita su uso en entornos corporativos con requisitos de gobernanza y regiones gestionadas.
- Prototipado de agentes con tool calling: la compatibilidad con la plantilla de chat de Qwen2.5 permite conectarlo a frameworks de agentes que esperan el formato estándar de mensajes con roles.
- Investigación sobre especialización de modelos abiertos: sirve como caso de estudio de cómo la curaduría de datasets propios (factual, matemático y general) modifica el comportamiento de un modelo base de 72B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con el modelo base u otros modelos en la model card ni en los resultados de búsqueda.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 145 GB solo para pesos, más overhead de KV cache; se recomienda un nodo con 8×H100 80GB o 8×A100 80GB para servir el modelo completo.
- VRAM estimada en cuantización de 8 bits: en torno a 75-80 GB de pesos, viable en un nodo de 2×A100 80GB o 2×H100 80GB con margen para caché.
- VRAM estimada en cuantización de 4 bits: en torno a 40-45 GB de pesos, podría caber en una única A100/H100 80GB o en configuraciones multi-GPU consumer (por ejemplo, 2×RTX 4090 24GB), aunque no se publican pesos cuantizados oficiales.
- No cabe en una única GPU consumer de 24 GB en precisión completa ni en 8 bits.
- Opciones de despliegue: transformers (documentado por el autor), Text Generation Inference (TGI, referenciado en el catálogo de Microsoft Foundry) y despliegue gestionado en Azure AI Foundry. No se documenta soporte oficial de llama.cpp, Ollama ni vLLM en la información disponible.
- Latencia y throughput: no disponibles. El autor no publica mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Gilgamesh 72B | 72,7B (denso) | No disponible | Qwen License (other) | Hugging Face, Azure Foundry | Finetune de Qwen2.5-72B-Instruct con corpus propios |
| Qwen2.5-72B-Instruct | 72,7B (denso) | Hasta 131.072 tokens (según el base) | Qwen License | Hugging Face, múltiples proveedores | Modelo base; benchmarks públicos amplios |
| Llama 3.3 70B Instruct | 70B (denso) | 128.000 tokens | Llama 3.3 Community License | Hugging Face, múltiples proveedores | Alternativa de tamaño similar con ecosistema amplio |
| Mistral Large / modelos 70B+ | Variable | Variable | Propietaria o Apache 2.0 según variante | API y Hugging Face | No comparable directamente por licencia |

La comparación cuantitativa de rendimiento no está disponible porque Gilgamesh 72B no publica benchmarks propios. La referencia más directa es el modelo base Qwen2.5-72B-Instruct, del que hereda arquitectura y pesos iniciales; cualquier diferencia de calidad dependerá de los datasets de ajuste fino, cuyo impacto no se ha medido públicamente.

## Limitaciones y advertencias

- No se han publicado evaluaciones independientes de sesgo, toxicidad o alucinación para este finetune; se desconoce si el ajuste con Fact-QA reduce o amplifica la tendencia a alucinar del base.
- El autor solo declara inglés como idioma soportado; el rendimiento en castellano u otros idiomas no está verificado y podría degradarse respecto al base.
- La longitud de contexto efectiva no está documentada para este finetune; no se debe asumir el contexto máximo del base sin validación.
- La licencia es la Qwen License Agreement, no una licencia permisiva: el uso comercial está sujeto a los términos de Alibaba Cloud, que deben revisarse antes de desplegar en producción.
- El modelo tiene muy poca tracción (34 descargas, 1 like) y no hay evidencia de validación por terceros; tratarlo como un experimento de investigación más que como un modelo listo para producción.
- No se publican pesos cuantizados oficiales (GGUF, AWQ, GPTQ), lo que complica el despliegue en hardware limitado.
- Al ser un finetune sobre datasets curados por un autor individual, existe riesgo de sobreajuste a los dominios cubiertos por GammaCorpus y de degradación en tareas fuera de ellos.
- No se documentan salvaguardas adicionales de seguridad más allá de las heredadas del base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rubenroy/Gilgamesh-72B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-72B-Instruct
- Licencia Qwen: https://huggingface.co/Qwen/Qwen2.5-72B-Instruct/blob/main/LICENSE
- Dataset GammaCorpus-v2-5m: https://huggingface.co/datasets/rubenroy/GammaCorpus-v2-5m
- Dataset GammaCorpus-CoT-Math-170k: https://huggingface.co/datasets/rubenroy/GammaCorpus-CoT-Math-170k
- Dataset GammaCorpus-Fact-QA-450k: https://huggingface.co/datasets/rubenroy/GammaCorpus-Fact-QA-450k
- Catálogo en Microsoft Foundry: https://ai.azure.com/catalog/models/rubenroy-gilgamesh-72b
- Perfil del autor: https://huggingface.co/rubenroy
