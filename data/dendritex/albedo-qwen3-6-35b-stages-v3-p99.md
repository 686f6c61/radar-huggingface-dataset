# Dendritex/albedo-qwen3.6-35b-stages-v3-p99

## Resumen

El modelo `Dendritex/albedo-qwen3.6-35b-stages-v3-p99` es una variante del modelo Qwen3.6-35B-A3B, publicada por el usuario Dendritex en Hugging Face. Se trata de un modelo de lenguaje causal con encoder de visión (pipeline `image-text-to-text`), diseñado para tareas de razonamiento, generación de código y agentes de IA. La arquitectura es un MoE híbrido que combina atención lineal (Gated DeltaNet) con atención clásica (Gated Attention), con 35 mil millones de parámetros totales y solo 3 mil millones activos por token, lo que permite una inferencia eficiente. Su contexto nativo es de 262 144 tokens, extensible hasta aproximadamente 1 010 000.

El modelo está orientado a usos de "coding agéntico" y preservación del razonamiento, según la model card del autor, que replica la información oficial de Qwen3.6. No se dispone de datos sobre el dataset de entrenamiento específico de esta variante, pero se sabe que fue pre-entrenado y post-entrenado. La licencia es Apache 2.0, lo que permite uso comercial y modificación. Aunque el repositorio tiene cero descargas y cero likes, su arquitectura y benchmarks lo posicionan como una opción interesante para desarrolladores que buscan un modelo de código con capacidades multimodales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida: Gated DeltaNet (atención lineal) + Gated Attention + Mixture of Experts |
| Parametros totales | 35 951 822 704 (~35,95 B) |
| Parametros activos | ~3 B (8 expertos enrutados + 1 compartido de 256) |
| Longitud de contexto | 262 144 tokens nativos, extensible hasta ~1 010 000 |
| Tipos de cuantizacion | no disponible (pesos en safetensors, cuantizable con herramientas externas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Qwen3.6-35B-A3B, un transformer causal con encoder de visión. La capa oculta se organiza en 40 capas con un patrón repetido: cada bloque contiene 3 sub-bloques de Gated DeltaNet seguidos de un MoE, y luego 1 sub-bloque de Gated Attention seguido de otro MoE (10 × (3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE))). La Gated DeltaNet emplea 32 cabezas lineales para V y 16 para QK con dimensión de cabeza 128, mientras que la Gated Attention usa 16 cabezas para Q y 2 para KV con dimensión 256 y RoPE de 64. El MoE tiene 256 expertos, de los cuales se activan 8 enrutados más 1 compartido, con dimensión intermedia de 512.

El entrenamiento incluye fases de pre-entrenamiento y post-entrenamiento, con MTP (multi-token prediction) entrenado en múltiples pasos. No se especifica el número de tokens de entrenamiento ni la composición del dataset. La model card menciona que el modelo prioriza la estabilidad y la utilidad real, con mejoras en flujos de trabajo de frontend y razonamiento a nivel de repositorio. No se menciona el uso de RLHF o DPO explícitamente, aunque es probable que se hayan usado técnicas de alineación similares a las de la familia Qwen.

## Capacidades

- Generación de texto y razonamiento complejo, con soporte para contexto largo (hasta 262 K tokens nativos).
- Capacidades multimodales: al ser `image-text-to-text`, puede procesar imágenes junto con texto (encoder de visión integrado).
- Agentic coding: la model card destaca mejoras en flujos de trabajo de frontend y razonamiento a nivel de repositorio, lo que sugiere capacidad para tareas de desarrollo de software autónomas.
- Thinking Preservation: opción para retener el contexto de razonamiento de mensajes históricos, útil para iteraciones de desarrollo.
- Soporte de tool calling y function calling: no se especifica explícitamente en la información disponible, pero es una característica común en modelos de la familia Qwen; se recomienda verificar en la documentación oficial.
- Capacidades multilingües: no se proporcionan datos sobre idiomas soportados.
- MTP (multi-token prediction): entrenado para predecir múltiples tokens a la vez, lo que puede mejorar la velocidad de generación.

## Casos de uso

- Desarrollo de software asistido por IA: el modelo puede generar, revisar y refactorizar código en múltiples lenguajes, aprovechando su contexto largo para manejar repositorios completos. Es adecuado para integrarse en IDE o herramientas de línea de comandos.
- Agentes autónomos de resolución de bugs: gracias a su capacidad de razonamiento a nivel de repositorio y su rendimiento en SWE-bench, puede usarse para identificar y corregir errores en proyectos de software reales.
- Generación de documentación técnica: con su capacidad de procesar código y texto, puede generar documentación a partir de código fuente, explicaciones de funciones y guías de uso.
- Análisis de imágenes y diagramas: al ser multimodal, puede interpretar capturas de pantalla, diagramas de arquitectura o esquemas para responder preguntas o generar descripciones.
- Asistente de programación con contexto largo: su ventana de 262 K tokens permite mantener conversaciones largas con historial de código y razonamiento, ideal para sesiones de pair programming.
- Automatización de tareas de frontend: la model card menciona mejoras específicas en flujos de trabajo de frontend, por lo que puede usarse para generar componentes UI, estilos CSS o interactividad en JavaScript.

## Benchmarks y rendimiento

La model card incluye resultados de benchmarks para tareas de coding agéntico, comparando con modelos similares. Los datos disponibles son:

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B (este modelo) |
|---|---|---|---|---|---|
| SWE-bench Verified | 75.0 | 52.0 | 70.0 | 17.4 | 73.4 |
| SWE-bench Multilingual | 69.3 | 51.7 | 60.3 | 17.3 | 67.2 |
| SWE-bench Pro | 51.2 | 35.7 | 44.6 | 13.8 | 49.5 |
| Terminal-Bench 2.0 | (dato no disponible en la información proporcionada) | | | | |

No se han publicado resultados de benchmarks adicionales en la información disponible. Los valores indican que el modelo rinde ligeramente por debajo de Qwen3.5-27B en SWE-bench Verified, pero supera a los demás modelos comparados, excepto en el caso de Qwen3.5-27B.

## Requisitos de hardware

- VRAM estimada para inferencia: no hay datos oficiales. Con 35 B parámetros en FP16 se necesitarían aproximadamente 70 GB de VRAM, pero al ser MoE con solo 3 B activos, la memoria requerida depende de la implementación y de si se cargan todos los expertos en memoria. Con cuantización a 4 bits, la huella podría reducirse a ~18-20 GB.
- GPU recomendadas: para una inferencia óptima con contexto largo, se recomiendan GPUs con al menos 48 GB de VRAM, como A6000, A100 (40/80 GB), H100 o RTX 6000 Ada. En consumer, una RTX 4090 (24 GB) podría ejecutar el modelo con cuantización 4-bit, aunque con limitaciones de contexto.
- Despliegue: la model card indica compatibilidad con Hugging Face Transformers, vLLM, SGLang y KTransformers. También se puede usar con llama.cpp u Ollama si se convierte a GGUF.
- Latencia y throughput: no se proporcionan datos específicos. Al ser un MoE con 3 B activos, la velocidad de generación debería ser notablemente superior a un modelo denso de 35 B, pero depende del hardware y de la implementación.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | SWE-bench Verified |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (este) | 35 B | 3 B | 262 K | Apache 2.0 | 73.4 |
| Qwen3.5-35B-A3B | 35 B | 3 B | 262 K (estimado) | Apache 2.0 | 70.0 |
| Qwen3.5-27B | 27 B | 27 B (denso) | 262 K (estimado) | Apache 2.0 | 75.0 |
| Gemma4-31B | 31 B | 31 B (denso) | 128 K (estimado) | Gemma License | 52.0 |
| Gemma4-26B-A4B | 26 B | 4 B | 128 K (estimado) | Gemma License | 17.4 |

El modelo de Dendritex se posiciona como una alternativa competitiva a Qwen3.5-35B-A3B, con mejores resultados en SWE-bench Verified y Multilingual, aunque ligeramente por debajo de Qwen3.5-27B. Su principal ventaja es el bajo número de parámetros activos, que reduce costes de inferencia, y la licencia Apache 2.0, que permite uso comercial sin restricciones.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos, riesgos de alucinación o comportamientos indeseados específicos de esta variante.
- El contexto nativo de 262 K tokens requiere una gestión cuidadosa de la memoria; la extensión a 1 M tokens puede degradar el rendimiento si no se usa la implementación adecuada.
- No se han publicado detalles sobre los idiomas soportados; se recomienda verificar el comportamiento en español u otros idiomas antes de usarlo en producción.
- Al ser una variante de Qwen3.6, es posible que las capacidades de tool calling no estén completamente documentadas en esta versión; se debe probar en el entorno objetivo.
- El repositorio tiene cero descargas y cero likes, lo que sugiere que el modelo es reciente y no ha sido ampliamente validado por la comunidad. Se recomienda realizar pruebas exhaustivas antes de adoptarlo en entornos críticos.
- La licencia Apache 2.0 permite uso comercial, pero se debe revisar si hay atribuciones requeridas por los pesos originales de Qwen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Dendritex/albedo-qwen3.6-35b-stages-v3-p99
- Variante similar en Hugging Face: https://huggingface.co/SusanHill/dendritex-albedo-qwen3.6-35b-stages-v3-0814-0100
- Página de despliegue en FriendliAI: https://friendli.ai/models/SusanHill/dendritex-albedo-qwen3.6-35b-stages-v3-0814-0100
- Documentación técnica de Qwen3.6 (DeepWiki): https://deepwiki.com/QwenLM/Qwen3.6/1.1-qwen3.6-models
- Blog oficial de Qwen3.6 (referencia de la model card): https://qwen.ai/blog?id=qwen3.6-35b-a3b
