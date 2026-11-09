# DavidAU/LFM2.5-1.2B-Thinking-Gemini-Pro-1000-Heretic-Uncensored-DISTILL

## Resumen

LFM2.5-1.2B-Thinking-Gemini-Pro-1000-Heretic-Uncensored-DISTILL es un fine-tune completo del modelo LFM2.5-1.2B-Thinking, desarrollado por DavidAU sobre el checkpoint intermedio MuXodious/LFM2.5-1.2B-Thinking-absolute-heresy. El modelo parte de la familia LFM2 de Liquid AI, una arquitectura compacta de 1.170 millones de parámetros orientada a generación de texto, y ha sido sometido a un proceso de destilación de razonamiento a partir del dataset TeichAI/gemini-3-pro-preview-high-reasoning-1000x, además de una eliminación de rechazos (abliteration) previa al ajuste fino.

El objetivo declarado es sustituir por completo el mecanismo de "thinking" del modelo base por un razonamiento compacto pero detallado, manteniendo estabilidad frente a la temperatura, y eliminar los rechazos para uso creativo sin restricciones (ficción, roleplay, contenido explícito). Está pensado para escritura creativa y generación de historias en inglés, con una ventana de contexto de 128k tokens declarada por el autor y licencia Apache 2.0.

Es relevante para desarrolladores que buscan un modelo pequeño (~1,2B) desplegable en hardware de consumo, con contexto largo y comportamiento de razonamiento destilado, aunque su naturaleza "uncensored" y sus limitaciones de idioma (solo inglés) lo alejan de usos corporativos convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (transformer compacto de Liquid AI; detalles internos no disponibles) |
| Parametros totales | 1.170.340.608 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 128k tokens (según model card del autor) |
| Tipos de cuantizacion | GGUF (incluido Imatrix IQ3_M como mínimo recomendado), además de bfloat16; EXL2/AWQ/GPTQ/HQQ mencionados de forma genérica en la colección de fuentes del autor |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura LFM2 del checkpoint base (familia de Liquid AI), sin que la información disponible detalle capas, atención o mecanismos internos concretos. El fine-tune se realizó a precisión de 16 bits con Unsloth sobre hardware local, partiendo de un checkpoint ya "Heretic'ed" (abliterated, es decir, con rechazos eliminados mediante la herramienta Heretic del equipo P-E-W). El autor indica que primero se eliminaron los rechazos y después se ajustó el modelo, de modo que el ajuste corrige artefactos introducidos por la ablación.

El entrenamiento sustituye completamente el razonamiento original mediante destilación desde el dataset TeichAI/gemini-3-pro-preview-high-reasoning-1000x (1.000 ejemplos de razonamiento de alta calidad). No se especifican número de tokens de entrenamiento, composición detallada del dataset ni si hubo RLHF/DPO adicional. El autor declara que el razonamiento resultante es compacto pero muy detallado y estable frente a temperaturas entre 0,1 y 2,5.

## Capacidades

- Generación de texto y razonamiento paso a paso en modo "thinking" destilado.
- Escritura creativa: ficción, relatos, tramas y subtramas, continuación de escenas, ciencia ficción, romance y otros géneros.
- Escritura "vivid prosing" (prosa descriptiva y vívida).
- Conversación multi-turno y roleplay.
- Generación de contenido sin rechazos (uncensored/abliterated), incluido contenido explícito o con lenguaje soez, aunque el autor advierte que requiere direccionamiento adicional para alcanzar el nivel esperado.
- Contexto largo de hasta 128k tokens (según el autor).
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta capacidad multilingüe más allá del inglés.
- No se documenta visión, audio ni otras modalidades.

## Casos de uso

- Escritura de ficción por capítulos: el modelo puede mantener coherencia argumental y de personajes a lo largo de textos extensos gracias a la ventana de 128k tokens declarada, útil para novelas seriadas o fan fiction.
- Generación de subtramas y arcos narrativos: a partir de una sinopsis, produce tramas secundarias y giros argumentales consistentes con el género solicitado.
- Continuación de escenas en roleplay: en herramientas como Silly Tavern, KoboldCpp o text-generation-webui, con smoothing_factor 1.5, mantiene personajes y tono en conversaciones multi-turno.
- Asistencia a guionistas y escritores de género: borradores rápidos de diálogos, descripciones y escenas con prosa vívida, sin rechazos por temática adulta o violenta.
- Generación de contenido para comunidades de ficción interactiva: historias personalizadas por usuario con contexto largo y control fino de temperatura (0,1-2,5).
- Prototipado de aplicaciones de escritura creativa en hardware de consumo: al ser un modelo de ~1,2B, puede ejecutarse en GPU domésticas con cuantizaciones Q5-Q8, sirviendo como backend local para apps de narrativa.
- Investigación sobre ablación y destilación de razonamiento: sirve como caso de estudio de fine-tune con Unsloth y de sustitución de cadena de pensamiento en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica "coming soon" para ARC-Challenge, ARC-Easy, BoolQ, HellaSwag, OpenBookQA, PIQA y Winogrande.

## Requisitos de hardware

- VRAM estimada: en bfloat16, aproximadamente 2,3-2,5 GB de pesos (el repo ocupa 2,3 GB); con overhead de inferencia, alrededor de 3-4 GB. En GGUF Q5/Q6/Q8, entre ~0,9 y ~1,3 GB de pesos, más KV cache para contexto largo.
- GPU recomendadas: cualquier GPU con 4-6 GB de VRAM para bfloat16 en contextos moderados; RTX 3060 12 GB, RTX 4070, RTX 4090 para contextos largos y mayor throughput. Para 128k tokens completos se necesita bastante memoria de KV cache, no cuantificada en la información disponible.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060 Ti, RTX 4070 y superiores con cuantizaciones Q4-Q8; el autor recomienda mínimo Imatrix IQ3_M y preferiblemente Q5, Q6, Q8 o 16 bits.
- Opciones de despliegue: transformers (safetensors), llama.cpp y GGUF, KoboldCpp, text-generation-webui (con llama_HF para GGUF), Silly Tavern como frontend. No se confirma soporte de vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles. El autor advierte que cuantizaciones por debajo de Q4 sin imatrix pueden entrar en bucles incluso con rep pen 1.1 y temperaturas bajas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LFM2.5-1.2B-Thinking-Gemini-Pro-1000-Heretic-Uncensored-DISTILL | 1,17B | 128k (declarado) | Apache 2.0 | Fine-tune uncensored con razonamiento destilado; solo inglés |
| MuXodious/LFM2.5-1.2B-Thinking-absolute-heresy (base) | 1,17B | no disponible | no disponible | Checkpoint abliterated previo, sin destilación de razonamiento Gemini |
| LFM2.5-1.2B-Thinking (original de Liquid AI) | ~1,2B | no disponible | no disponible | Modelo original con rechazos intactos y thinking nativo |

No se dispone de datos de benchmarks que permitan comparar rendimiento numérico entre estas variantes.

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües documentadas.
- Modelo uncensored/abliterated: puede generar contenido explícito, violento u ofensivo sin filtros; no apto para entornos corporativos o públicos sin moderación externa.
- Riesgo de bucles durante el razonamiento, especialmente con cuantizaciones bajas (por debajo de Q4 sin imatrix); el autor recomienda rep pen 1.05-1.1 y bajar temperatura a 0.3-0.7 si aparece looping.
- El contenido puede resultar "blando" por defecto incluso sin rechazos; requiere direccionamiento explícito (términos soez, slang) para alcanzar el nivel gráfico esperado.
- Riesgo de alucinación inherente a modelos pequeños de 1,2B; no se han publicado benchmarks que cuantifiquen su fiabilidad.
- Uso comercial permitido por Apache 2.0, pero la licencia del checkpoint base intermedio (MuXodious) figura como "no disponible" en la información proporcionada; conviene verificarla antes de producción.
- No se documenta soporte de tool calling ni uso como agente; no recomendado para pipelines que dependan de function calling.
- La ventana de 128k es una declaración del autor; no se confirma con evaluación independiente ni se detalla el coste de KV cache a esa longitud.
- El modelo está pensado para escritura creativa; su uso en tareas de precisión (matemáticas, código, datos factuales) no está validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/LFM2.5-1.2B-Thinking-Gemini-Pro-1000-Heretic-Uncensored-DISTILL
- Modelo base intermedio: https://huggingface.co/MuXodious/LFM2.5-1.2B-Thinking-absolute-heresy
- Dataset de destilación: https://huggingface.co/datasets/TeichAI/gemini-3-pro-preview-high-reasoning-1000x
- Guía de parámetros y samplers del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Colección de ficheros fuente para GGUF/EXL2/AWQ/GPTQ/HQQ: https://huggingface.co/collections/DavidAU/d-au-source-files-for-gguf-exl2-awq-gptq-hqq-etc-etc-66b55cb8ba25f914cbf210be
- Perfil del autor: https://huggingface.co/DavidAU
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
