# ArchiveStudio/Qwen3.6-35B-A3B

## Resumen

Qwen3.6-35B-A3B es un modelo de lenguaje causal con codificador de visión publicado por el equipo Qwen (Alibaba) y redistribuido en el repositorio de HuggingFace `ArchiveStudio/Qwen3.6-35B-A3B`. Se trata de la primera variante de pesos abiertos de la serie Qwen3.6, construida sobre la arquitectura híbrida de Qwen3.5 y orientada explícitamente a flujos de trabajo de codificación agéntica, razonamiento a nivel de repositorio y retención de contexto de razonamiento entre turnos.

El modelo emplea una arquitectura Mixture of Experts (MoE) con 35 951 822 704 parámetros totales y aproximadamente 3 000 millones de parámetros activos por token, distribuidos en 40 capas que alternan bloques Gated DeltaNet (atención lineal) y Gated Attention (atención completa con GQA). Incorpora 256 expertos con 8 expertos enrutados más 1 compartido activados por token, y está entrenado con predicción multi-token (MTP). Su ventana de contexto nativa es de 262 144 tokens, extensible hasta 1 010 000 tokens.

La relevancia actual del modelo radica en su posicionamiento dentro de la categoría de modelos MoE de tamaño medio con capacidad multimodal (image-text-to-text) y contexto extremadamente largo, con licencia Apache 2.0 y compatibilidad declarada con Transformers, vLLM, SGLang y KTransformers. El repositorio, sin embargo, no presenta descargas ni interacciones en el momento de la consulta, y la model card no detalla la composición del dataset de entrenamiento ni los idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con codificador de visión; capas alternas Gated DeltaNet (atención lineal) y Gated Attention (GQA) con MoE |
| Parámetros totales | 35 951 822 704 |
| Parámetros activos | ~3B (8 expertos enrutados + 1 compartido de 256 totales) |
| Longitud de contexto | 262 144 tokens nativos; extensible hasta 1 010 000 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) |
| Dimensión oculta | 2048 |
| Número de capas | 40 |
| Layout de capas | 10 × (3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE)) |
| Cabezas de atención lineal (Gated DeltaNet) | 32 para V, 16 para QK; dimensión de cabeza 128 |
| Cabezas de atención (Gated Attention) | 16 para Q, 2 para KV; dimensión de cabeza 256; RoPE dim 64 |
| Expertos | 256 totales; 8 enrutados + 1 compartido activos; dimensión intermedia 512 |
| Embedding / salida | 248 320 (con padding) |
| MTP | Entrenado con múltiples pasos |
| Tamaño del repositorio | 71,9 GB |

## Arquitectura y entrenamiento

El modelo sigue un diseño de transformer causal híbrido que combina capas de atención lineal Gated DeltaNet con capas de atención completa Gated Attention, intercaladas en un patrón de 3 bloques lineales por cada bloque de atención completa, cada uno seguido de una capa MoE. Esta combinación busca reducir el coste computacional del contexto largo (gracias a la atención lineal) manteniendo la capacidad expresiva de la atención completa. El componente MoE cuenta con 256 expertos de dimensión intermedia 512, de los cuales se activan 8 enrutados más 1 compartido por token, lo que resulta en aproximadamente 3B parámetros activos sobre 35B totales.

El modelo incorpora un codificador de visión, lo que lo convierte en un modelo image-text-to-text, y ha sido entrenado con predicción multi-token (MTP) en varios pasos, una técnica que permite decodificación especulativa nativa y mejora el throughput de generación. Según la model card, el entrenamiento consta de fases de pre-entrenamiento y post-entrenamiento, e incluye una funcionalidad de "Thinking Preservation" que permite retener el contexto de razonamiento de mensajes históricos para iteraciones de desarrollo. No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas concretas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento general en modo conversacional multi-turno.
- Codificación agéntica: resolución de tareas de nivel de repositorio y flujos de trabajo de frontend, según los resultados declarados en SWE-bench Verified, Multilingual y Pro.
- Razonamiento multimodal image-text-to-text mediante codificador de visión integrado.
- Retención de contexto de razonamiento entre turnos ("Thinking Preservation") para desarrollo iterativo.
- Decodificación multi-token (MTP) entrenada, orientada a acelerar la inferencia.
- Soporte de contexto largo nativo de 262 144 tokens, extensible hasta 1 010 000 tokens.
- Compatibilidad declarada con tool calling implícito en flujos agénticos (integraciones con vLLM, SGLang, KTransformers), aunque la model card no detalla el esquema formal de function calling.
- Capacidades multilingües: la model card reporta resultados en SWE-bench Multilingual, lo que implica competencia en múltiples lenguajes de programación; los idiomas naturales soportados no se detallan.

## Casos de uso

- Automatización de resolución de issues en repositorios: el modelo puede recibir un issue, navegar por el código y proponer un parche, apoyándose en su contexto de 262 144 tokens para mantener múltiples ficheros y trazas de error en memoria.
- Asistente de codificación en IDE con memoria de razonamiento: la función de Thinking Preservation permite conservar cadenas de razonamiento previas entre iteraciones, reduciendo el coste de reexplicar el problema en cada turno.
- Revisión de código en pipelines de CI/CD: dado su rendimiento declarado en SWE-bench Pro (49,5), puede integrarse como paso de verificación semántica de parches antes de merge.
- Análisis de documentación técnica multimodal: al aceptar entradas image-text-to-text, puede procesar diagramas de arquitectura, capturas de pantalla de errores o esquemas junto con texto para generar explicaciones o código.
- Migración y refactorización de bases de código grandes: la ventana extensible hasta 1 010 000 tokens permite cargar módulos completos o varios paquetes y razonar sobre dependencias cruzadas.
- Generación de interfaces de frontend a partir de descripciones y mockups: la model card destaca específicamente la mejora en flujos de frontend, lo que habilita prototipado rápido de componentes a partir de imágenes de diseño.
- Agentes autónomos de terminal: con resultados declarados en Terminal-Bench 2.0, puede emplearse en entornos de shell para ejecutar tareas de administración o scripting de forma iterativa.

## Benchmarks y rendimiento

Resultados declarados en la model card (porcentajes de resolución de tareas):

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 52,0 | 70,0 | 17,4 | 73,4 |
| SWE-bench Multilingual | 69,3 | 51,7 | 60,3 | 17,3 | 67,2 |
| SWE-bench Pro | 51,2 | 35,7 | 44,6 | 13,8 | 49,5 |
| Terminal-Bench 2.0 | no disponible (tabla truncada) | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks de razonamiento general o multimodal.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16): aproximadamente 72 GB solo para pesos, más overhead de activaciones y caché KV; requiere GPUs de 80 GB (A100, H100) o múltiples GPUs.
- Con cuantización a 8 bits: ~36 GB de pesos, viable en una A100 40GB ajustada o en dos RTX 4090 de 24 GB.
- Con cuantización a 4 bits: ~18-20 GB de pesos, potencialmente ejecutable en una única RTX 4090 de 24 GB, aunque el contexto largo eleva considerablemente el consumo de memoria.
- Dado que solo se activan ~3B parámetros por token, el throughput en decodificación es comparativamente alto respecto a modelos densos de 35B, especialmente con MTP habilitado.
- Opciones de despliegue declaradas: Hugging Face Transformers, vLLM, SGLang y KTransformers. No se menciona soporte explícito de llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput numéricos: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B | 35B | ~3B | 262K (ext. 1,01M) | 73,4 | Apache 2.0 | Pesos abiertos (HF) |
| Qwen3.5-35B-A3B | 35B | ~3B | no disponible | 70,0 | no disponible | Pesos abiertos |
| Qwen3.5-27B | 27B | denso | no disponible | 75,0 | no disponible | Pesos abiertos |
| Gemma4-31B | 31B | denso | no disponible | 52,0 | no disponible | Pesos abiertos |
| Gemma4-26B-A4B | 26B | ~4B | no disponible | 17,4 | no disponible | Pesos abiertos |

La comparativa se limita a los modelos incluidos en la tabla de benchmarks de la model card; no se dispone de datos de otras alternativas de la misma categoría.

## Limitaciones y advertencias

- El repositorio `ArchiveStudio/Qwen3.6-35B-A3B` no registra descargas ni interacciones, y no se confirma que sea el repositorio oficial del equipo Qwen; conviene verificar la procedencia de los pesos antes de usarlos en producción.
- La model card no especifica la composición del dataset de entrenamiento, por lo que no es posible evaluar sesgos conocidos ni la cobertura lingüística real.
- No se detallan los idiomas naturales soportados; los resultados multilingües se refieren a lenguajes de programación en SWE-bench Multilingual.
- No se documentan tasas de alucinación ni evaluaciones de robustez fuera de los benchmarks de codificación agéntica.
- Aunque la licencia es Apache 2.0, el enlace de licencia apunta al repositorio oficial de Qwen; debe revisarse el texto exacto para uso comercial.
- El rendimiento en contexto extremo (hasta 1 010 000 tokens) es una capacidad declarada de extensibilidad, no verificada de forma independiente en la información disponible.
- El tamaño del repositorio (71,9 GB) implica requisitos de almacenamiento y ancho de banda considerables para su descarga y despliegue.
- La tabla de benchmarks está truncada en la información proporcionada, por lo que faltan resultados de Terminal-Bench 2.0 y de otras categorías.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ArchiveStudio/Qwen3.6-35B-A3B
- Blog oficial del modelo: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Licencia (referencia oficial Qwen): https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Qwen Chat: https://chat.qwen.ai
