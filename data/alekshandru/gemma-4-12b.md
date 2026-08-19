# alekshandru/gemma-4-12B

## Resumen

Gemma 4 12B Unified es un modelo multimodal de código abierto desarrollado por Google DeepMind, publicado en HuggingFace bajo el identificador `alekshandru/gemma-4-12B`. Forma parte de la familia Gemma 4, que incluye arquitecturas densas y de mezcla de expertos (MoE) en cinco tamaños: E2B, E4B, 12B, 26B A4B y 31B. Este modelo concreto, de 11.950 millones de parámetros, adopta un diseño *encoder-free* (sin codificadores externos) que proyecta directamente parches de imagen y formas de onda de audio al espacio de embeddings del transformer, lo que reduce la latencia multimodal y permite afinar todo el modelo en una sola pasada.

El modelo está pensado para entornos locales y de consumo: su tamaño (12B) cabe en GPUs de gama alta y estaciones de trabajo, y soporta una ventana de contexto de hasta 256.000 tokens. Entre sus capacidades destacan el razonamiento con modos de pensamiento configurables, la generación de código, el *function calling* nativo y el procesamiento de texto, imagen y audio (no así vídeo, que está reservado a los modelos E2B/E4B). La licencia Apache 2.0 permite uso comercial sin restricciones significativas, lo que lo convierte en una opción atractiva para producción.

La relevancia actual de este modelo radica en su combinación de multimodalidad unificada, contexto largo y despliegue eficiente en hardware de consumo, cubriendo un nicho que antes requería modelos más grandes o con codificadores separados. Su arquitectura híbrida de atención (ventana deslizante + atención global) y el uso de p-RoPE optimizan el uso de memoria en contextos extensos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, encoder-free, atencion hibrida (sliding window + global), p-RoPE |
| Parametros totales | 11.959.730.224 (aprox. 12B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | No disponible (no se especifican en la informacion) |
| Idiomas soportados | Mas de 140 idiomas (segun el model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de transformer decoder-only con un mecanismo de atención híbrido: capas de atención local con ventana deslizante de 1024 tokens intercaladas con capas de atención global (la última capa siempre es global). Para optimizar la memoria en contextos largos, las capas globales comparten claves y valores (Keys and Values unificados) y utilizan RoPE proporcional (p-RoPE). Esta combinación permite mantener una huella de memoria reducida sin sacrificar la comprensión de dependencias lejanas.

A diferencia de otros modelos Gemma 4 que usan codificadores de visión y audio separados, el 12B Unified elimina estos codificadores por completo. Las imágenes se dividen en parches y se proyectan mediante capas lineales ligeras directamente al espacio de embeddings del LLM; lo mismo ocurre con las formas de onda de audio. Esto unifica todas las modalidades en un único flujo a través del transformer, simplificando el ajuste fino y reduciendo la latencia multimodal.

No se dispone de información detallada sobre el conjunto de datos de entrenamiento, el número de tokens procesados o si se aplicaron técnicas como RLHF o DPO. El model card menciona que los modelos Gemma 4 están diseñados como razonadores potentes con modos de pensamiento configurables, lo que sugiere un entrenamiento orientado a razonamiento, pero no se aportan cifras concretas.

## Capacidades

- Generación de texto y razonamiento: soporta modos de pensamiento configurables (thinking mode) que permiten al modelo "razonar" antes de responder.
- Comprensión multimodal: procesa entradas de texto, imagen (con resolución y relación de aspecto variables) y audio (nativo). No soporta vídeo en esta variante.
- Codificación: destaca en benchmarks de código (según el model card) y tiene soporte nativo para *function calling*, lo que habilita agentes autónomos.
- Capacidades agénticas: puede integrarse en flujos de trabajo multi-paso, con soporte para el rol `system` en las conversaciones.
- Multilingüismo: soporta más de 140 idiomas, lo que lo hace adecuado para aplicaciones internacionales.
- Contexto largo: ventana de 256K tokens, útil para documentos extensos, análisis de código o conversaciones prolongadas.

## Casos de uso

- Atención al cliente automatizada: gracias a su ventana de 256K tokens, el modelo puede mantener conversaciones multi-turno con historial completo y contexto de productos, integrando además imágenes (capturas de pantalla) y audio (mensajes de voz) en el mismo flujo.
- Asistente de programación en IDE: con *function calling* nativo, puede actuar como copiloto que consulta APIs, ejecuta comandos o sugiere correcciones, todo dentro del editor.
- Análisis de documentos largos y multimodales: procesa contratos, informes o papers con tablas, gráficos y notas de audio, resumiendo o extrayendo datos clave sin perder contexto.
- Transcripción y resumen de reuniones: al aceptar audio directamente, puede transcribir y resumir grabaciones, combinando la información con documentos adjuntos.
- Generación de contenido multilingüe: redacción de artículos, traducción y localización en más de 140 idiomas, manteniendo coherencia a lo largo de documentos extensos.
- Agente de automatización de tareas: gracias al *function calling* y al razonamiento multi-paso, puede orquestar flujos como envío de correos, actualización de bases de datos o interacción con APIs REST, todo desde un solo modelo.
- Asistente educativo multimodal: explica conceptos a partir de imágenes, diagramas o vídeos (aunque el vídeo no es soportado en 12B, sí puede usar imágenes y audio), adaptándose al nivel del estudiante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card menciona mejoras en codificación y razonamiento, pero no aporta cifras numéricas (MMLU, HumanEval, GSM8K, etc.) para este modelo concreto.

## Requisitos de hardware

No se proporcionan datos específicos de VRAM, latencia o throughput en la información disponible. Sin embargo, al tratarse de un modelo denso de ~12B parámetros, se puede inferir que:

- En FP16 (precisión completa) necesitaría aproximadamente 24 GB de VRAM, por lo que cabría en GPUs como RTX 4090 (24 GB), A100 40GB o H100.
- Con cuantización a 8 bits o 4 bits (no especificada en el repo), podría ejecutarse en GPUs con 12-16 GB, como RTX 3080/3090 o RTX 4070 Ti.
- Para despliegue en producción, se recomiendan frameworks como vLLM, TGI o llama.cpp (si se convierte a GGUF), aunque no hay confirmación oficial de compatibilidad en la información disponible.

Estas estimaciones son orientativas y no provienen de datos oficiales del modelo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Dado que Gemma 4 es una familia reciente (según el model card), no se pueden contrastar cifras con alternativas como Llama 3, Mistral o Qwen sin datos verificables. Se recomienda consultar benchmarks independientes para una comparativa rigurosa.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos específicos del modelo; como todo LLM, puede reflejar sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinación: no se dispone de métricas de fiabilidad factual; se recomienda verificar respuestas críticas.
- Limitaciones de idioma: aunque soporta más de 140 idiomas, el rendimiento puede variar significativamente entre ellos; los idiomas con menos representación pueden presentar peores resultados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero es necesario revisar los términos adicionales del enlace de licencia de Gemma (https://ai.google.dev/gemma/docs/gemma_4_license) para posibles cláusulas específicas.
- El modelo no soporta vídeo (solo texto, imagen y audio), a diferencia de los modelos E2B/E4B.
- No se especifican cuantizaciones oficiales; el repo solo contiene pesos en safetensors, por lo que habrá que convertirlos o usar herramientas de cuantización externas si se busca reducir requisitos de hardware.
- La fecha de creación (agosto de 2026) y el número arXiv (2607.02770) son futuros respecto al conocimiento actual; se recomienda verificar la autenticidad y vigencia del modelo antes de adoptarlo en producción.

## Enlaces

- [HuggingFace - alekshandru/gemma-4-12B](https://huggingface.co/alekshandru/gemma-4-12B)
- [Colección Gemma 4 en HuggingFace](https://huggingface.co/collections/google/gemma-4)
- [GitHub - google-gemma](https://github.com/google-gemma)
- [Blog de lanzamiento](https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/)
- [Documentación oficial](https://ai.google.dev/gemma/docs/core)
- [Technical Report (arXiv)](https://arxiv.org/abs/2607.02770)
- [Licencia Gemma 4](https://ai.google.dev/gemma/docs/gemma_4_license)
