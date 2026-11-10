# pragmaticcs/MiMo-HERO-UIUX-Designer-9B

## Resumen

MiMo-HERO-UIUX-Designer-9B es un modelo multimodal de tipo image-text-to-text desarrollado por el usuario pragmaticcs y publicado en Hugging Face. Se trata de un modelo resultante de la fusión (merge) de tres modelos base: Qwen/Qwen3.5-9B, XLearning-SCU/HERO-9B y XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B. El resultado es un modelo de aproximadamente 9.000 millones de parámetros orientado a tareas de diseño UI/UX, razonamiento agéntico, uso de herramientas (tool calling) y automatización de navegador (browser-use).

La relevancia del modelo radica en su combinación de capacidades: por un lado hereda la base multimodal y de razonamiento de la familia Qwen3.5; por otro, incorpora las técnicas de fusión DARE y arquitecturas con atención lineal (DeltaNet) presentes en los modelos HERO y MiMo. Esto lo posiciona como una opción para flujos de trabajo que requieren interpretar capturas de pantalla o interfaces y actuar sobre ellas mediante agentes.

El modelo se distribuye bajo licencia Apache 2.0, aunque el acceso está restringido (gated) y requiere aceptar las condiciones en Hugging Face. Soporta idiomas inglés y chino, y está pensado para despliegue con vLLM y SGLang, además de ser compatible con transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con atención lineal (DeltaNet) y fusión por merge (DARE); basada en Qwen3.5 |
| Parametros totales | ~9B (según nombre del modelo y modelos base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors, 18.8 GB) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión de pesos (model merge) entre tres modelos base: Qwen/Qwen3.5-9B, XLearning-SCU/HERO-9B y XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B. La técnica de fusión empleada es DARE (Drop And REscale), que combina los parámetros de los modelos padres eliminando y reescalando deltas para preservar capacidades. Los tags indican la presencia de arquitecturas con atención lineal (DeltaNet) y atención estándar, así como capacidades multimodales (image-text-to-text).

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en la información proporcionada. Los tags sugieren herencia de capacidades agénticas, tool-calling, browser-use, código y razonamiento de los modelos base, pero no se especifican los detalles del proceso de entrenamiento ni de la fusión más allá de la técnica DARE.

## Capacidades

- Generación de texto y razonamiento multimodal (image-text-to-text).
- Comprensión de imágenes e interfaces, orientada a tareas de diseño UI/UX.
- Tool calling / function calling.
- Razonamiento agéntico y multi-step reasoning.
- Automatización de navegador (browser-use).
- Generación y razonamiento sobre código.
- Capacidades multilingües limitadas a inglés y chino.
- Soporte de despliegue con vLLM y SGLang.
- Compatible con endpoints (endpoints_compatible).

## Casos de uso

- Diseño y revisión de interfaces UI/UX: el modelo puede analizar capturas de pantalla o mockups y generar recomendaciones de diseño, detectar problemas de usabilidad o proponer mejoras de layout, aprovechando su naturaleza image-text-to-text.
- Automatización de pruebas de interfaz: integrado en pipelines de QA, puede interpretar capturas de pantalla de una aplicación y verificar que los elementos visuales se renderizan correctamente, combinando visión y razonamiento.
- Agentes de navegador web: gracias a sus capacidades de browser-use y tool calling, puede actuar como agente que navega, interpreta la página y ejecuta acciones sobre formularios o flujos de trabajo.
- Asistente de desarrollo frontend: puede generar y revisar código de componentes de interfaz a partir de descripciones o imágenes de referencia, apoyándose en sus capacidades de código y razonamiento.
- Generación de documentación técnica visual: a partir de capturas de una aplicación, puede redactar guías de uso o documentación describiendo la interfaz y sus flujos.
- Prototipado conversacional de productos: en un chat multi-turno, puede ayudar a equipos de producto a iterar sobre ideas de UI/UX, interpretando bocetos o imágenes adjuntas y respondiendo con propuestas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~9B parámetros en safetensors (fp16/bf16), se estiman en torno a 18-20 GB de VRAM; en cuantización de 8 bits, aproximadamente 10-12 GB; en 4 bits, aproximadamente 6-7 GB (estimaciones orientativas, no confirmadas por el autor).
- GPU recomendadas: A100, H100 o GPUs con al menos 24 GB de VRAM para fp16; RTX 4090 (24 GB) podría alojar el modelo en fp16 ajustadamente.
- Cabe en GPU de consumo: sí, en GPUs con 24 GB o más en fp16, o en GPUs con 8-12 GB mediante cuantización (no se proporcionan archivos GGUF en el repo, por lo que requeriría conversión manual).
- Opciones de despliegue: vLLM, SGLang, transformers.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiMo-HERO-UIUX-Designer-9B | ~9B | no disponible | Apache 2.0 | Gated en Hugging Face |
| Qwen/Qwen3.5-9B | ~9B | no disponible | no disponible | no disponible |
| XLearning-SCU/HERO-9B | ~9B | no disponible | no disponible | no disponible |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B | ~9B | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El acceso al modelo está restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargarlo.
- Idiomas soportados limitados a inglés y chino; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Al ser un modelo fusionado mediante DARE, puede presentar comportamientos impredecibles o degradación de capacidades respecto a los modelos base en determinadas tareas.
- No se dispone de información sobre sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad.
- La longitud de contexto no está especificada, lo que dificulta planificar su uso en tareas de contexto largo.
- No se ofrecen archivos cuantizados (GGUF, AWQ, GPTQ) en el repositorio, lo que limita el despliegue directo en hardware de consumo sin conversión previa.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones de los modelos base y de la fusión para uso comercial en producción.

## Enlaces

- Hugging Face: https://huggingface.co/pragmaticcs/MiMo-HERO-UIUX-Designer-9B
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo base HERO-9B: https://huggingface.co/XLearning-SCU/HERO-9B
- Modelo base MiMo-V2.6-Distill-Qwen-9B: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Paper DARE (arxiv:2311.03099): https://arxiv.org/abs/2311.03099
- Paper DeltaNet (arxiv:2412.06464): https://arxiv.org/abs/2412.06464
