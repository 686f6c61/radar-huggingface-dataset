# ericchampagne/Qwen3.5-9B

## Resumen
Qwen3.5-9B es un modelo fundacional multimodal desarrollado por Alibaba Qwen, publicado en formato Hugging Face Transformers y reempaquetado en este repositorio por el usuario ericchampagne. Combina un codificador de visión con un modelo de lenguaje causal de aproximadamente 9.653 millones de parámetros, orientado a tareas de razonamiento, código, agentes y comprensión visual. Su propuesta principal es la fusión temprana de tokens multimodales, que según la model card alcanza paridad con Qwen3 y supera a los modelos Qwen3-VL en los benchmarks evaluados.

La arquitectura es híbrida: intercala capas de Gated DeltaNet (atención lineal) con capas de Gated Attention clásica, lo que reduce el coste computacional en contextos largos. Dispone de una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.010.000, y está entrenado con decodificación especulativa multi-paso (MTP). El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en pipelines de producción.

Este repositorio concreto es un reupload con 0 descargas y 0 likes en el momento de la consulta, construido sobre el modelo base oficial Qwen/Qwen3.5-9B. Es relevante para desarrolladores que necesitan un modelo multimodal de tamaño medio con contexto muy largo, soporte multilingüe amplio (201 idiomas y dialectos según la model card) y compatibilidad con vLLM, SGLang, KTransformers y Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrida Gated DeltaNet + Gated Attention, con FFN y MTP multi-paso |
| Parametros totales | 9.653.104.368 (9B según model card) |
| Parametros activos | no disponible (la model card no indica configuración MoE para esta variante de 9B) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible en la información proporcionada |
| Idiomas soportados | 201 idiomas y dialectos (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 19,3 GB); compatible con Transformers, vLLM, SGLang y KTransformers |

## Arquitectura y entrenamiento
El modelo sigue un diseño de transformer híbrido con 32 capas organizadas en un patrón de 8 bloques, cada uno compuesto por 3 subcapas de Gated DeltaNet seguidas de 1 subcapa de Gated Attention, todas con su correspondiente FFN. La dimensión oculta es 4096, el FFN intermedio es 12288 y el embedding de tokens (con padding) es de 248.320. Gated DeltaNet emplea 32 cabezas de atención lineal para V y 16 para QK con dimensión de cabeza 128; Gated Attention usa 16 cabezas para Q y 4 para KV con dimensión 256 y RoPE de 64 dimensiones. El modelo incorpora un módulo MTP entrenado con múltiples pasos, orientado a decodificación especulativa.

El entrenamiento consta de fases de preentrenamiento y postentrenamiento, con fusión temprana sobre tokens multimodales. La model card menciona entrenamiento con RL escalado a entornos de millones de agentes y una infraestructura asíncrona de RL, así como una eficiencia de entrenamiento multimodal cercana al 100 % respecto al entrenamiento solo texto. No se detalla en la información disponible el número exacto de tokens de entrenamiento ni la composición del dataset, ni si se aplicaron técnicas concretas de RLHF o DPO más allá de la mención genérica a RL.

## Capacidades
- Generación de texto y razonamiento de propósito general, con resultados destacados en MMLU-Pro y MMLU-Redux.
- Comprensión de imágenes y texto combinados (pipeline image-text-to-text), gracias al codificador de visión integrado.
- Razonamiento matemático y de tipo STEM, según los benchmarks de conocimiento y STEM reportados.
- Generación y razonamiento sobre código, con rendimiento competitivo frente a modelos mayores en la comparativa de la model card.
- Capacidades de agente y razonamiento multi-paso, reforzadas por el entrenamiento con RL en entornos de agentes.
- Soporte multilingüe amplio: 201 idiomas y dialectos según la model card.
- Compatibilidad con tool calling y function calling: no confirmado explícitamente en la información proporcionada.
- Modo thinking: no confirmado explícitamente para esta variante en la información proporcionada.
- Decodificación especulativa mediante MTP multi-paso.

## Casos de uso
- Análisis de documentos extensos con imágenes: el contexto nativo de 262.144 tokens permite procesar informes, contratos o expedientes completos junto con sus figuras y tablas en una sola pasada, sin fragmentación.
- Asistencia en código en producción: el modelo puede integrarse en pipelines de revisión y generación de código, y su compatibilidad con vLLM y SGLang facilita el despliegue en servicios de inferencia con requisitos de latencia bajos.
- Atención al cliente multimodal: gestiona conversaciones multi-turno con contexto largo y puede recibir capturas de pantalla o imágenes de producto, lo que resulta adecuado para soporte técnico y postventa.
- Extracción de información de documentos escaneados: combinando visión y contexto largo, puede resumir y estructurar datos de facturas, formularios o historiales clínicos en un único flujo.
- Agentes autónomos multi-paso: el entrenamiento con RL en entornos de agentes y la ventana de contexto extensible hasta 1.010.000 tokens permiten mantener el estado de tareas largas con múltiples herramientas.
- Despliegue multilingüe global: con 201 idiomas y dialectos, es apto para plataformas de contenido, localización y moderación que operan en mercados diversos.
- Investigación en eficiencia de atención: la combinación de Gated DeltaNet y Gated Attention lo convierte en una base útil para estudiar atención lineal y decodificación especulativa en cargas de contexto largo.

## Benchmarks y rendimiento

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80,8 | 74,8 | 82,7 | 80,9 | 82,5 | 79,1 |
| MMLU-Redux | 91,0 | 87,8 | 92,5 | 91,4 | no disponible en el extracto | no disponible en el extracto |

Los datos de la tabla proceden del extracto de la model card incluido en la información proporcionada; el resto de filas de benchmarks quedó truncado y no se dispone de sus valores. No se han inventado cifras adicionales.

## Requisitos de hardware
- VRAM estimada para inferencia en BF16/FP16: aproximadamente 19,3 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 24 GB para despliegues ajustados y 40-80 GB para contextos largos.
- Cuantización: no se especifican tipos soportados en la información disponible; a título orientativo, formatos de 8 y 4 bits reducirían el peso a rangos de 10-12 GB y 5-7 GB respectivamente, pero no hay confirmación oficial en la model card.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para producción con contexto largo; RTX 4090 (24 GB) puede alojar los pesos en precisión reducida, con limitaciones para contextos de cientos de miles de tokens.
- Cabe en GPU de consumo: sí en RTX 4090 y GPUs con 24 GB o más, siempre que se use cuantización o contextos moderados.
- Opciones de despliegue: Transformers, vLLM, SGLang y KTransformers según la model card; llama.cpp y Ollama no se mencionan explícitamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B | 9B | 262.144 nativos (hasta 1.010.000) | 82,5 | Apache 2.0 | Hugging Face (este repo y Qwen/Qwen3.5-9B) |
| Qwen3.5-4B | 4B | no disponible | 79,1 | Apache 2.0 (según repo base) | Hugging Face |
| Qwen3-30BA3B-Thinking-2507 | 30B (A3B) | no disponible | 80,9 | no disponible | Hugging Face |
| GPT-OSS-20B | 20B | no disponible | 74,8 | no disponible | no disponible |
| GPT-OSS-120B | 120B | no disponible | 80,8 | no disponible | no disponible |

## Limitaciones y advertencias
- Este repositorio concreto tiene 0 descargas y 0 likes y fue creado el 2026-11-21; se trata de un reupload de terceros, no del repositorio oficial de Qwen, por lo que conviene verificar la integridad de los pesos frente a Qwen/Qwen3.5-9B.
- La model card no detalla sesgos conocidos ni evaluaciones de seguridad; se desconoce el comportamiento en dominios sensibles.
- Riesgo de alucinación inherente a los modelos generativos; no se aportan métricas de fidelidad ni de calibración.
- Aunque se declaran 201 idiomas, no se especifica el rendimiento por idioma; el castellano no está evaluado de forma explícita en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y atribución correspondiente.
- El contexto extensible hasta 1.010.000 tokens puede degradar la calidad y disparar el consumo de memoria; no hay datos publicados sobre rendimiento en esa longitud.
- No se confirma soporte explícito de tool calling ni de modo thinking para esta variante en la información proporcionada.
- El repositorio ocupa 19,3 GB, lo que exige planificación de almacenamiento y ancho de banda en despliegues.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/ericchampagne/Qwen3.5-9B
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
