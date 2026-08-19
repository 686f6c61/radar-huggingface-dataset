# Fastiraz/Qwen3.6-27B-GGUF

## Resumen

Qwen3.6-27B es un modelo de lenguaje causal con codificador de visión (image-text-to-text) desarrollado por Qwen, presentado como la primera variante open-weight de la serie Qwen3.6. Publicado en abril de 2026, este modelo denso de 27.000 millones de parámetros está diseñado para priorizar la estabilidad y la utilidad real en tareas de codificación agéntica, con mejoras sustanciales en flujos de trabajo frontend y razonamiento a nivel de repositorio. Según los datos publicados, alcanza un 77,2 % en SWE-bench Verified, superando al modelo MoE Qwen3.5-397B-A17B (76,2 %) con una fracción del coste computacional.

El modelo combina una arquitectura híbrida con capas de atención lineal (Gated DeltaNet) y atención clásica (Gated Attention), con una longitud de contexto nativa de 262.144 tokens, ampliable hasta 1.010.000. El repositorio Fastiraz/Qwen3.6-27B-GGUF proporciona las versiones cuantizadas en formato GGUF generadas con Unsloth Dynamic 2.0, pensadas para despliegue local eficiente en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrida (Gated DeltaNet + Gated Attention) |
| Parametros totales | 26.895.998.464 (aproximadamente 27B) |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | 262.144 tokens nativo, extensible hasta 1.010.000 |
| Tipos de cuantizacion | GGUF (Unsloth Dynamic 2.0): IQ3, Q4, Q6 y otras variantes (no se dispone de la lista completa) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base en el repositorio original) |

## Arquitectura y entrenamiento

Qwen3.6-27B emplea una arquitectura híbrida que combina capas de atención lineal y atención clásica. La configuración de 64 capas sigue un patrón de 16 bloques, cada uno con 3 subcapas de Gated DeltaNet seguidas de FFN, y 1 subcapa de Gated Attention seguida de FFN. La Gated DeltaNet utiliza 48 cabezas lineales para V y 16 para QK, con dimensión de cabeza 128. La Gated Attention tiene 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de dimensión 64. La dimensión oculta es 5120 y la FFN intermedia tiene 17408 unidades. El embedding de tokens es de 248320 (padded) y el modelo incorpora MTP (Multi-Token Prediction) entrenado con múltiples pasos.

El entrenamiento incluye una fase de pre-entrenamiento y post-entrenamiento, con énfasis en estabilidad y utilidad práctica. La model card menciona mejoras en el soporte de roles de desarrollador (para funcionar en Codex, OpenCode, etc.) y en el parsing de objetos anidados para tool calling, lo que sugiere un ajuste fino orientado a agentes. No se proporcionan detalles sobre el volumen de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto y razonamiento multimodal: al ser image-text-to-text, acepta tanto texto como imágenes como entrada, aunque no se detallan las tareas específicas de visión.
- Codificación agéntica: maneja flujos de trabajo frontend y razonamiento a nivel de repositorio con mayor fluidez y precisión que versiones anteriores.
- Preservación del pensamiento: opción de retener el contexto de razonamiento de mensajes históricos, lo que reduce la sobrecarga en desarrollo iterativo.
- Tool calling / function calling: mejorado con soporte para parsing de objetos anidados, lo que aumenta la tasa de éxito en llamadas a herramientas.
- Compatibilidad con agentes: puede integrarse en entornos como Codex, OpenCode y Unsloth Studio para tareas agénticas.
- Razonamiento multi-step: gracias a su contexto largo (262K nativo) y la preservación del pensamiento, puede mantener cadenas de razonamiento extensas.
- Capacidades multilingües: no especificadas en la información disponible.

## Casos de uso

- Desarrollo de software asistido por IA: el modelo puede actuar como copiloto en repositorios grandes, resolviendo issues y generando pull requests con razonamiento a nivel de repositorio. Su 77,2 % en SWE-bench Verified lo hace adecuado para tareas de mantenimiento de código en producción.
- Agentes autónomos de codificación: con soporte para tool calling y compatibilidad con Codex/OpenCode, puede integrarse en pipelines de CI/CD para automatizar tareas como corrección de bugs, refactorización o generación de tests.
- Asistente de frontend: maneja flujos de trabajo de desarrollo frontend con precisión, útil para generar componentes UI, estilos y lógica de interacción a partir de descripciones o imágenes de diseño.
- Atención al cliente con contexto largo: su ventana de 262K tokens permite procesar conversaciones extensas o historiales completos de tickets, manteniendo el contexto de razonamiento para respuestas coherentes.
- Análisis de documentos técnicos: al combinar visión y texto, puede extraer información de capturas de pantalla, diagramas o documentación escaneada, y razonar sobre ella.
- Despliegue local privado: gracias a las cuantizaciones GGUF (IQ3 de 11 GB, Q4 de 16 GB, Q6 de 21 GB), puede ejecutarse en estaciones de trabajo con GPU de 16-24 GB o Macs con 24 GB de memoria unificada, sin dependencia de la nube.
- Razonamiento agéntico multi-paso: con la preservación del pensamiento, puede mantener cadenas de razonamiento a lo largo de múltiples iteraciones, útil para planificación de tareas complejas o investigación automatizada.

## Benchmarks y rendimiento

Los datos de benchmarks disponibles son limitados. Según la búsqueda web, el modelo obtiene un 77,2 % en SWE-bench Verified, superando al Qwen3.5-397B-A17B (76,2 %). No se han publicado resultados detallados para otras pruebas estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Benchmark | Qwen3.6-27B | Qwen3.5-397B-A17B |
|---|---|---|
| SWE-bench Verified | 77,2 % | 76,2 % |

No se dispone de datos adicionales de rendimiento en otras tareas.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: IQ3 ~11 GB, Q4 ~16 GB, Q6 ~21 GB (tamaños de archivo, la VRAM real puede ser ligeramente superior por overhead).
- GPU recomendadas: para cuantización Q4, una GPU con 16-24 GB de VRAM (por ejemplo, RTX 4080, RTX 4090, A5000) es suficiente. Para contexto largo (128K+) se recomienda al menos 24 GB o más.
- En Macs con memoria unificada: 24 GB es el mínimo realista, 32 GB o más recomendado para contexto largo.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, SGLang, KTransformers (este último recomendado por Qwen para producción).
- Latencia y throughput: no disponibles en la información proporcionada. Se recomienda usar versiones recientes de los frameworks para optimizar el rendimiento.

## Comparativa con modelos similares

La comparativa se limita a los datos disponibles. El modelo más comparable es el Qwen3.5-397B-A17B (MoE), aunque de tamaño muy superior. No se dispone de datos de otros modelos densos de 27B para comparar directamente.

| Modelo | Parámetros | Tipo | Contexto | SWE-bench Verified | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-27B | 27B denso | Híbrido (DeltaNet + Attention) | 262K nativo | 77,2 % | Apache-2.0 |
| Qwen3.5-397B-A17B | 397B total, 17B activos | MoE | No disponible | 76,2 % | Apache-2.0 |

No se dispone de información sobre otros modelos comparables en la misma categoría de tamaño.

## Limitaciones y advertencias

- No se han publicado detalles sobre sesgos o alucinaciones específicas del modelo. Como todo LLM, puede generar contenido incorrecto o inventado, especialmente en tareas de razonamiento complejo.
- La información sobre idiomas soportados no está disponible; se desconoce su rendimiento en lenguas distintas del inglés y chino (idiomas habituales de la familia Qwen).
- El contexto nativo de 262K tokens requiere mucha memoria; para contextos largos se recomienda al menos 128K para preservar las capacidades de razonamiento, y puede provocar OOM en GPUs de menos de 24 GB.
- La licencia Apache-2.0 permite uso comercial sin restricciones, pero se debe verificar la licencia del modelo base original (también Apache-2.0 según el repositorio).
- El repositorio GGUF tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que es una publicación reciente o poco validada por la comunidad. Se recomienda verificar la integridad de los archivos antes de su uso en producción.
- No se proporcionan datos sobre latencia, throughput ni requisitos exactos de VRAM para diferentes longitudes de contexto.

## Enlaces

- Repositorio HuggingFace de Fastiraz: https://huggingface.co/Fastiraz/Qwen3.6-27B-GGUF
- Repositorio HuggingFace de Unsloth (fuente original del GGUF): https://huggingface.co/unsloth/Qwen3.6-27B-GGUF
- Guía de Unsloth para Qwen3.6: https://unsloth.ai/docs/models/qwen3.6
- Blog oficial de Qwen sobre Qwen3.6-27B: https://qwen.ai/blog?id=qwen3.6-27b
- Repositorio GitHub de Qwen3.6: https://github.com/QwenLM/Qwen3.6
- Artículo de análisis en aimadetools: https://www.aimadetools.com/blog/qwen-3-6-27b-complete-guide/
- Guía de VRAM y hardware en willitrunai: https://willitrunai.com/blog/qwen-3-6-27b-vram-requirements
- Guía de despliegue local en llm.co: https://llm.co/llms/qwen3-6-27b-gguf
