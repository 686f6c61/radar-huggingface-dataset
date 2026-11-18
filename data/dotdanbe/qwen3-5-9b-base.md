# Dotdanbe/Qwen3.5-9B-Base

## Resumen

Qwen3.5-9B-Base es la variante preentrenada (sin ajuste conversacional) del modelo multimodal de 9B parámetros de la familia Qwen3.5, publicada por el equipo Qwen de Alibaba. Este repositorio concreto (Dotdanbe/Qwen3.5-9B-Base) redistribuye los pesos oficiales en formato Hugging Face Transformers, con licencia Apache 2.0. El modelo combina un encoder de visión con un modelo de lenguaje causal, lo que permite entrada image-text-to-text.

La arquitectura es híbrida: intercala capas de atención lineal (Gated DeltaNet) con capas de atención con compuertas (Gated Attention) en un patrón 3:1, con 32 capas, dimensión oculta de 4096 y un vocabulario de 248.320 tokens. El contexto nativo es de 262.144 tokens, extensible hasta 1.010.000. Está pensado como base para fine-tuning, experimentos de in-context learning y desarrollo de investigación, no para interacción directa.

Su relevancia radica en que unifica visión y lenguaje en un único modelo de 9B con contexto muy largo y soporte declarado de 201 idiomas, lo que lo sitúa como alternativa open source para tareas de agentes multimodales y procesamiento de documentos extensos en hardware de gama media-alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM con encoder de visión; híbrida Gated DeltaNet (atención lineal) + Gated Attention, patrón 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 9.653.104.368 (~9,65B) |
| Parametros activos | no disponible (la model card no confirma configuración MoE para esta variante de 9B) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en precisión original) |
| Idiomas soportados | 201 idiomas y dialectos (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers); compatible con vLLM y SGLang |

## Arquitectura y entrenamiento

El modelo es un transformer causal con encoder de visión integrado mediante fusión temprana (*early fusion*) sobre tokens multimodales. La columna vertebral del LM tiene 32 capas con dimensión oculta 4096 y FFN de dimensión intermedia 12288. El layout híbrido alterna bloques: por cada tres capas de Gated DeltaNet (atención lineal con 32 cabezas para V y 16 para QK, dimensión de cabeza 128) hay una capa de Gated Attention (16 cabezas para Q y 4 para KV, dimensión 256, RoPE de 64 dimensiones). El vocabulario y la salida LM son de 248.320 tokens (con padding).

El entrenamiento incluye fase de preentrenamiento y postentrenamiento, con *multi-token prediction* (MTP) entrenado en varios pasos. La model card menciona RL escalado sobre entornos de millones de agentes con distribuciones de tareas progresivamente complejas, y una infraestructura de entrenamiento multimodal con eficiencia cercana al 100 % respecto a texto solo. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni detalles de RLHF/DPO.

## Capacidades

- Generación de texto y razonamiento en lenguaje natural.
- Comprensión de imágenes y respuesta en texto (image-text-to-text).
- Razonamiento visual: interpretación de gráficos, diagramas y documentos escaneados.
- Generación y razonamiento de código (según los benchmarks declarados frente a Qwen3-VL).
- Razonamiento matemático.
- Capacidades de agente y razonamiento multi-paso, reforzadas por RL a gran escala.
- Soporte multilingüe amplio: 201 idiomas y dialectos.
- Tokens de control (`<|im_start|>`, `<|im_end|>`) entrenados para permitir LoRA/PEFT eficiente con la plantilla de chat oficial.
- Contexto largo de 262K tokens nativos, extensible a ~1M.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible para esta variante base.

## Casos de uso

- Fine-tuning supervisado (SFT) para dominios verticales: al ser un modelo base con licencia Apache 2.0, se puede ajustar con LoRA sobre la plantilla de chat oficial sin reentrenar embeddings, lo que reduce coste dado el vocabulario de 248K tokens.
- Procesamiento de documentos largos con imágenes: contratos, informes financieros o expedientes con tablas y gráficos, aprovechando el contexto de 262K tokens para ingerir el documento completo en una sola pasada.
- Investigación en agentes multimodales: entornos de RL y evaluación de razonamiento multi-paso donde se necesita un modelo base con visión y contexto largo para orquestar herramientas.
- Extracción de información estructurada de capturas de pantalla o interfaces: útil para pipelines de automatización de UI y RPA con comprensión visual.
- Generación de código asistida con contexto de repositorio: el contexto extendido permite incluir varios archivos y documentación en la ventana; requiere fine-tuning previo para uso conversacional.
- Experimentos de in-context learning multilingüe: evaluación de few-shot en los 201 idiomas declarados sin ajuste adicional.
- Base para destilación o investigación arquitectónica: la combinación Gated DeltaNet + Gated Attention sirve como referencia para estudiar eficiencia de atención lineal en modelos multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma paridad con Qwen3 y mejora frente a Qwen3-VL en razonamiento, código, agentes y comprensión visual, pero no incluye cifras numéricas (MMLU, HumanEval, GSM8K u otros) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada en precisión original (BF16): aproximadamente 19-20 GB solo para pesos; con caché KV para contexto largo, se recomienda 24 GB o más.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para contexto completo de 262K; L40S o RTX 6000 Ada para contextos moderados.
- GPU de consumo: cabe en RTX 4090 (24 GB) en BF16 con margen ajustado y contexto corto; en cuantización de 8 bits o 4 bits cabría en GPUs de 16 GB (RTX 4080, 4090 portátil) y potencialmente en 12 GB con cuantización agresiva, aunque no se han publicado cuantizaciones oficiales.
- Despliegue: compatible con Transformers, vLLM y SGLang según la model card; llama.cpp/Ollama no confirmados para esta arquitectura híbrida.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-Base (este) | ~9,65B | 262K (ext. 1M) | Sí (visión) | Apache 2.0 | Hugging Face |
| Qwen3-VL (variantes) | no disponible en la información | no disponible | Sí | Apache 2.0 (según familia Qwen) | Hugging Face |
| Qwen3 (variantes) | no disponible en la información | no disponible | No | Apache 2.0 (según familia Qwen) | Hugging Face |

Los datos de rendimiento comparado no están disponibles en la información proporcionada; la model card solo declara superioridad cualitativa frente a Qwen3 y Qwen3-VL.

## Limitaciones y advertencias

- Es un modelo exclusivamente preentrenado: no está ajustado para diálogo directo; su uso previsto es fine-tuning e investigación.
- Riesgo de alucinación inherente a modelos base sin alineamiento conversacional; no debe desplegarse en producción sin postentrenamiento.
- No se han publicado evaluaciones de sesgo ni de seguridad para esta variante.
- La extensión de contexto hasta 1M tokens es declarada, pero no se especifican degradaciones de rendimiento a longitudes extremas.
- El soporte de 201 idiomas es una afirmación de la model card sin métricas por idioma publicadas.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia enlazada del repositorio oficial de Qwen.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es una redistribución de terceros, no el repositorio oficial, lo que implica riesgo de divergencia con los pesos originales.
- Arquitectura híbrida poco común: puede requerir versiones recientes de Transformers, vLLM o SGLang; soporte en herramientas de cuantización popular no confirmado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Dotdanbe/Qwen3.5-9B-Base
- Blog oficial Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Licencia referenciada: https://huggingface.co/Qwen/Qwen3.5-9B-Base/blob/main/LICENSE
- Qwen Chat: https://chat.qwen.ai
