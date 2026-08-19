# ojuliio/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con encoder de visión, desarrollado por el equipo de Qwen (publicado en HuggingFace por el usuario ojuliio). Forma parte de la serie Qwen3.8, la generación más reciente de la familia abierta de Qwen, y se presenta como un modelo denso de 27 000 millones de parámetros diseñado para tareas de codificación, trabajo profesional, investigación y ejecución de agentes de largo horizonte. Su principal novedad es la integración nativa de comprensión de imágenes y vídeo, junto con un control flexible del modo de razonamiento (thinking mode) que puede activarse o desactivarse por petición.

El modelo combina una arquitectura híbrida con atención lineal (Gated DeltaNet) y atención completa (Gated Attention), alcanzando una longitud de contexto nativa de 262 144 tokens, extensible hasta 1 000 000. Está disponible bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. Su tamaño de repositorio es de 55,6 GB en formato safetensors, compatible con Transformers, vLLM, SGLang y TokenSpeed.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrida (Gated DeltaNet + Gated Attention + FFN) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativo, extensible a 1 000 000 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

Qwen3.8-27B está construido sobre la base arquitectónica de Qwen3.5, con un diseño híbrido que alterna bloques de atención lineal y atención completa. La configuración interna incluye 64 capas, dimensión oculta de 5120, y un layout de 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)). El Gated DeltaNet emplea 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128; el Gated Attention usa 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de 64 dimensiones. La FFN tiene dimensión intermedia de 17 408. El modelo incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que mejora la eficiencia de decodificación.

El entrenamiento comprende fases de pre-entrenamiento y post-entrenamiento, aunque no se especifican el número de tokens ni la composición del dataset en la información disponible. El modelo es nativamente multimodal, con un encoder de visión integrado que procesa imágenes y vídeo. No se mencionan técnicas de RLHF o DPO específicas, pero el control de razonamiento (thinking mode) sugiere un post-entrenamiento orientado a razonamiento explícito.

## Capacidades

- Generación de texto y razonamiento complejo, con modo de pensamiento (thinking mode) activado por defecto y desactivable por petición.
- Comprensión de imágenes y vídeo, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Razonamiento multi-paso y planificación autónoma para tareas de agente de largo horizonte, con manejo de feedback del entorno.
- Ajuste de la profundidad de razonamiento mediante el parámetro `reasoning_effort`.
- Retención del contexto de razonamiento histórico mediante `preserve_thinking`.
- Soporte de tool calling y funciones integradas (mencionado en la versión alojada en Qwen Cloud).
- Capacidades multilingües no especificadas, pero se asume cobertura amplia por la familia Qwen.

## Casos de uso

- Atención al cliente automatizada: con 262K tokens de contexto nativo, puede gestionar conversaciones multi-turno extensas, manteniendo el historial completo y resolviendo incidencias complejas sin perder información previa.
- Generación de código en producción: su capacidad de razonamiento y soporte de tool calling permite integrarse en pipelines de CI/CD para revisión de código, generación de tests y corrección automática de errores.
- Análisis de documentos técnicos y científicos: al combinar visión y lenguaje, puede extraer información de figuras, tablas y diagramas en papers, informes o manuales, facilitando tareas de investigación.
- Agentes autónomos de navegación web: su planificación multi-paso y manejo de feedback lo hacen adecuado para tareas como reservas, comparación de productos o extracción de datos estructurados.
- Asistente de programación con contexto largo: puede trabajar sobre repositorios completos, entendiendo la estructura del proyecto y generando cambios coherentes en múltiples archivos.
- Transcripción y análisis de vídeo: su capacidad de procesar vídeo de larga duración permite resumir reuniones, extraer acciones clave o generar subtítulos descriptivos.
- Educación y tutoría personalizada: puede explicar conceptos complejos con razonamiento paso a paso, adaptándose al nivel del estudiante y usando ejemplos visuales cuando sea necesario.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparativos con modelos como Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, abarcando categorías como coding, trabajo profesional, investigación y agentes. Sin embargo, el extracto proporcionado no incluye los valores numéricos de dichos benchmarks, por lo que no es posible presentar resultados concretos. Se menciona específicamente el benchmark "Terminal Bench 2.1 (Terminus)" para coding agéntico, pero sin cifras.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: basándose en 27 781 millones de parámetros y un tamaño de pesos de 55,6 GB en FP16, se estima un consumo de aproximadamente 55 GB en FP16, 28 GB en cuantización de 8 bits y 14 GB en 4 bits. Estas cifras son orientativas y dependen de la implementación y la longitud de contexto.
- GPU recomendadas: para FP16 se necesitan GPUs de clase profesional como A100 (80 GB) o H100; para cuantización 8 bits puede usarse una RTX 4090 (24 GB) o A6000; para 4 bits, una RTX 3090 o superior.
- En consumer GPU: es viable con cuantización 4 bits en GPUs de 16-24 GB, aunque con limitaciones de velocidad y contexto.
- Opciones de despliegue: compatible con vLLM, SGLang, TokenSpeed y Transformers. También puede ejecutarse con llama.cpp u Ollama si se convierten los pesos a GGUF, aunque no se indica soporte oficial.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La model card menciona como competidores a Qwen3.6-27B (misma familia y tamaño), Qwen3.7-Plus (modelo propietario), Muse Glimmer-30B y Opus4.6 Max. No se dispone de datos numéricos de rendimiento para establecer una comparativa objetiva. A nivel de especificaciones, Qwen3.8-27B se diferencia por su contexto nativo de 262K tokens y su arquitectura híbrida con atención lineal, que reduce el coste computacional en secuencias largas frente a modelos densos puramente transformer. La licencia Apache 2.0 es más permisiva que la de modelos propietarios como Qwen3.7-Plus u Opus4.6 Max.

No se dispone de datos suficientes para una comparativa cuantitativa.

## Limitaciones y advertencias

- No se han documentado sesgos específicos en la información disponible; como modelo entrenado con datos web, puede heredar sesgos sociales y culturales.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de razonamiento complejo o con contexto muy largo.
- La longitud de contexto de 1M tokens es una extensión posible, pero puede degradar la calidad de atención en los extremos; se recomienda validar en casos de uso reales.
- No se especifican los idiomas soportados, por lo que el rendimiento en lenguas de baja representación puede ser limitado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo incluye un encoder de visión que podría tener restricciones adicionales no documentadas.
- Para producción, es necesario validar el comportamiento con cuantización, ya que no se proporcionan garantías de rendimiento en formatos reducidos.

## Enlaces

- [HuggingFace: ojuliio/Qwen3.8-27B](https://huggingface.co/ojuliio/Qwen3.8-27B)
- [Qwen Cloud - Qwen3.8-27B Overview](https://www.qwencloud.com/models/qwen3.8-27b)
- [Qwen Cloud (servicio oficial)](https://www.qwencloud.com)
