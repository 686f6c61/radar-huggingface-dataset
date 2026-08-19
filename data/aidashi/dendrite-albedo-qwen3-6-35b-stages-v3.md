# AIdashi/dendrite-albedo-qwen3.6-35b-stages-v3

## Resumen

El modelo `AIdashi/dendrite-albedo-qwen3.6-35b-stages-v3` es una variante publicada por el usuario AIdashi de Qwen3.6-35B-A3B, el primer modelo de pesos abiertos de la serie Qwen3.6 desarrollada por Alibaba Qwen. Se trata de un modelo causal de lenguaje con encoder de visión (image-text-to-text), de arquitectura MoE con 35 mil millones de parámetros totales y 3 mil millones activos por token. Su principal objetivo es mejorar la estabilidad y utilidad real en tareas de programación agéntica, razonamiento a nivel de repositorio y flujos de trabajo de frontend, incorporando además una opción de preservación del contexto de razonamiento en mensajes históricos.

El modelo destaca por su ventana de contexto nativa de 262 144 tokens, extensible hasta aproximadamente 1 010 000, y por integrar una arquitectura híbrida con capas de atención lineal (Gated DeltaNet) y atención clásica (Gated Attention), junto con un mecanismo de predicción multi-token (MTP). Está disponible bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. Aunque el repositorio no ha recibido descargas ni likes en HuggingFace, la familia Qwen3.6 está respaldada por benchmarks de agentes de código que la sitúan en línea con modelos de tamaño similar como Qwen3.5-35BA3B y por encima de alternativas como Gemma4-26BA4B.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida con Gated DeltaNet (atención lineal) y Gated Attention, más encoder de visión |
| Parametros totales | 35 951 822 704 (35,95 mil millones) |
| Parametros activos | 3 mil millones (3B) por token |
| Longitud de contexto | 262 144 tokens nativos, extensible hasta ~1 010 000 |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (la model card no especifica lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, KTransformers) |

## Arquitectura y entrenamiento

La arquitectura combina un modelo de lenguaje causal con un encoder de visión, siguiendo el diseño de la serie Qwen3.6. El bloque de lenguaje tiene 40 capas con una disposición interna de 10 unidades repetidas, cada una compuesta por 3 sub-bloques de atención lineal (Gated DeltaNet) seguidos de una capa MoE, y 1 sub-bloque de atención clásica (Gated Attention) también seguido de MoE. La dimensión oculta es 2048, con 248 320 tokens de embedding (rellenados). La parte MoE cuenta con 256 expertos, de los cuales se activan 8 enrutados más 1 compartido, con una dimensión intermedia de 512 por experto. La atención lineal utiliza 32 cabezas para V y 16 para QK, con dimensión de cabeza 128; la atención clásica usa 16 cabezas para Q y 2 para KV, con dimensión 256 y RoPE de 64 dimensiones.

El entrenamiento se realizó en dos fases: pre-training y post-training, con un mecanismo de predicción multi-token (MTP) entrenado con múltiples pasos. No se especifican detalles sobre el volumen de datos de entrenamiento ni sobre técnicas de alineación como RLHF o DPO. La innovación principal es la combinación de atención lineal y atención clásica en un diseño MoE, junto con la preservación del contexto de razonamiento en mensajes históricos, una característica introducida en Qwen3.6 para facilitar el desarrollo iterativo.

## Capacidades

- Generación de texto y razonamiento complejo, con soporte para tareas de programación agéntica y razonamiento a nivel de repositorio.
- Comprensión de imágenes gracias al encoder de visión integrado (pipeline image-text-to-text).
- Soporte para flujos de trabajo de frontend, incluyendo generación y modificación de interfaces web.
- Preservación del contexto de razonamiento en mensajes históricos, lo que permite mantener cadenas de pensamiento en conversaciones multi-turno.
- Manejo de contextos muy largos (hasta ~1 millón de tokens con extensión), adecuado para repositorios de código extensos.
- Capacidad de agente en terminal, evaluada con Terminal-Bench 2.0.
- No se menciona explícitamente soporte de tool calling o function calling, pero su perfil agéntico sugiere que es compatible con estas funcionalidades en el ecosistema Qwen.

## Casos de uso

- Desarrollo y mantenimiento de aplicaciones frontend: el modelo puede generar o modificar componentes de interfaz de usuario a partir de descripciones textuales o capturas de pantalla, gracias a su encoder de visión y su especialización en flujos de frontend.
- Refactorización de repositorios a gran escala: con su contexto de hasta 1 millón de tokens, puede analizar un repositorio completo, identificar dependencias y proponer cambios coherentes en múltiples archivos.
- Asistente de programación integrado en IDE: puede mantener el contexto de razonamiento a lo largo de una sesión de desarrollo, recordando decisiones previas y aplicándolas en iteraciones sucesivas.
- Automatización de tareas de terminal: evaluado con Terminal-Bench 2.0, puede ejecutar comandos, interpretar salidas y tomar decisiones para completar tareas de administración de sistemas o despliegue.
- Revisión de código con entrada visual: al aceptar imágenes, puede analizar capturas de pantalla de errores de interfaz o diagramas de arquitectura y proporcionar sugerencias de corrección.
- Agente de resolución de incidencias (issues) en proyectos open source: con su rendimiento en SWE-bench Verified (73,4), puede abordar problemas reales de GitHub, generar parches y validar soluciones.

## Benchmarks y rendimiento

La model card proporciona resultados parciales de benchmarks de programación agéntica, comparados con modelos de tamaño similar. Los datos disponibles son:

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 52,0 | 70,0 | 17,4 | 73,4 |
| SWE-bench Multilingual | 69,3 | 51,7 | 60,3 | 17,3 | 67,2 |
| SWE-bench Pro | 51,2 | 35,7 | 44,6 | 13,8 | 49,5 |
| Terminal-Bench 2.0 | (dato incompleto en la fuente) | (dato incompleto) | (dato incompleto) | (dato incompleto) | (dato incompleto) |

No se han publicado resultados para benchmarks generales de lenguaje como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

No se dispone de requisitos oficiales publicados por el autor. A partir del tamaño del modelo (35B totales, 3B activos) y su formato safetensors, se pueden estimar los siguientes requisitos orientativos:

- VRAM estimada para inferencia en FP16: aproximadamente 70-75 GB, lo que requiere una GPU profesional como A100 80GB, H100 80GB o varias GPU en paralelo.
- Con cuantización de 4 bits (no publicada en el repositorio, pero posible mediante herramientas externas), la VRAM necesaria podría reducirse a unos 20-25 GB, permitiendo su ejecución en una RTX 4090 o similar.
- Al ser un modelo MoE con solo 3B parámetros activos, la inferencia es relativamente rápida en comparación con un modelo denso del mismo tamaño total.
- Opciones de despliegue compatibles: Hugging Face Transformers, vLLM, SGLang y KTransformers, según indica la model card. También podría ejecutarse con llama.cpp si se generan pesos GGUF, aunque no se proporcionan oficialmente.
- Para contextos extendidos de hasta 1 millón de tokens, se requiere memoria adicional para las claves y valores de atención, lo que puede incrementar sustancialmente la VRAM necesaria.

## Comparativa con modelos similares

Los benchmarks disponibles permiten comparar Qwen3.6-35BA3B con otros modelos de la misma categoría (MoE de ~30B totales con ~3B activos):

| Modelo | Parámetros totales | Parámetros activos | Contexto | SWE-bench Verified | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35BA3B (este modelo) | 35B | 3B | 262K (ext. 1M) | 73,4 | Apache 2.0 |
| Qwen3.5-35BA3B | 35B | 3B | no disponible | 70,0 | Apache 2.0 |
| Qwen3.5-27B | 27B (denso) | 27B | no disponible | 75,0 | Apache 2.0 |
| Gemma4-31B | 31B (denso) | 31B | no disponible | 52,0 | Gemma license |
| Gemma4-26BA4B | 26B | 4B | no disponible | 17,4 | Gemma license |

Qwen3.6-35BA3B supera a su predecesor Qwen3.5-35BA3B en SWE-bench Verified y Multilingual, aunque queda ligeramente por detrás del modelo denso Qwen3.5-27B en Verified. Frente a las alternativas de Gemma, la ventaja es notable. No se dispone de datos de contexto para los modelos comparados.

## Limitaciones y advertencias

- No se han publicado evaluaciones sobre sesgos, toxicidad o alucinación para este modelo concreto.
- El rendimiento en tareas generales de lenguaje (MMLU, GSM8K, etc.) no está documentado en la información disponible.
- El repositorio tiene cero descargas y cero likes, lo que indica que no hay validación comunitaria ni informes de uso en producción.
- La extensión del contexto hasta ~1 millón de tokens puede degradar la calidad de la atención si no se gestiona adecuadamente, y requiere recursos de memoria considerables.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo deriva de Qwen3.6, cuyo acuerdo de uso puede tener condiciones adicionales; se recomienda revisar la licencia original de Qwen.
- No se especifican los idiomas soportados; la documentación se centra en inglés y código, por lo que el rendimiento en otros idiomas es incierto.
- El modelo está pensado principalmente para tareas de programación agéntica; su uso en otros dominios puede no estar optimizado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AIdashi/dendrite-albedo-qwen3.6-35b-stages-v3
- Blog oficial de Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Ficha en FriendliAI: https://friendli.ai/models/AIdashi/dendrite-albedo-qwen3.6-35b-stages-v3
- Documentación técnica en DeepWiki: https://deepwiki.com/QwenLM/Qwen3.6/1.1-qwen3.6-models
- Guía de Qwen 3.6 en InsiderLLM: https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
