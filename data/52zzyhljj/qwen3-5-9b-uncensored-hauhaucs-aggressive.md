# 52ZZYHLJJ/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive

## Resumen

Qwen3.5-9B-Uncensored-HauhauCS-Aggressive es una variante sin censura del modelo Qwen3.5-9B, desarrollada por el usuario HauhauCS y publicada también por 52ZZYHLJJ en Hugging Face. Su objetivo es eliminar los rechazos (refusals) del modelo original sin degradar sus capacidades, logrando una tasa de 0/465 en pruebas de rechazo. Se presenta en formato GGUF con varias cuantizaciones y es compatible con runtimes como llama.cpp, LM Studio o koboldcpp.

El modelo mantiene la arquitectura híbrida del Qwen3.5-9B: combina atención lineal Gated DeltaNet con atención softmax completa en una proporción 3:1, con 32 capas y unos 8,95 mil millones de parámetros densos. Ofrece un contexto nativo de 262 000 tokens (extensible a 1M con YaRN) y es nativamente multimodal, aceptando texto, imagen y vídeo. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

Su relevancia radica en que proporciona una alternativa sin filtros para desarrolladores que necesitan un modelo de alto rendimiento con contexto largo y capacidades multimodales, aunque su naturaleza sin censura implica responsabilidades legales y éticas. La arquitectura es reciente (lanzada en marzo de 2026), por lo que requiere versiones actualizadas de las herramientas de inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet (linear attention) + full softmax attention (ratio 3:1) |
| Parámetros totales | 8 953 803 264 (~8,95 B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens nativo; extensible a 1 000 000 con YaRN |
| Tipos de cuantización | BF16, Q8_0, Q6_K, Q4_K_M (GGUF) + mmproj (encoder de visión) |
| Idiomas soportados | 201 idiomas (incluye inglés y chino) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (también disponible el modelo base en safetensors) |

## Arquitectura y entrenamiento

La arquitectura es una adaptación del Qwen3.5-9B, que emplea un diseño híbrido con atención lineal Gated DeltaNet y atención softmax completa en una proporción de 3:1. Esta combinación busca reducir el coste computacional del attention para contextos largos, manteniendo la capacidad de razonamiento de la atención softmax. El modelo tiene 32 capas y un vocabulario de 248 000 tokens, lo que cubre 201 idiomas. Soporta multi‑token prediction (MTP) y es multimodal, procesando texto, imagen y vídeo mediante un encoder de visión separado (mmproj).

El proceso de entrenamiento no se ha documentado públicamente en la información proporcionada. Se trata de un fine‑tuning del Qwen3.5-9B original con el objetivo de eliminar los rechazos, sin modificar los datasets de entrenamiento ni las capacidades del modelo. La variante "Aggressive" aplica una eliminación más exhaustiva de las respuestas de rechazo, y se menciona que el modelo puede añadir un breve descargo de responsabilidad al final de algunas respuestas, pero el contenido se genera completo.

## Capacidades

- Generación de texto y razonamiento: hereda todas las capacidades del Qwen3.5-9B, incluyendo tareas de comprensión, generación, análisis y razonamiento de propósito general.
- Multimodal: acepta imágenes y vídeo como entrada gracias al encoder de visión (mmproj), permitiendo tareas de descripción, análisis y respuesta sobre contenido visual.
- Contexto largo: 262K tokens nativos, ampliables a 1M con YaRN, lo que permite procesar documentos extensos, libros completos o historiales conversacionales largos.
- Multi‑token prediction (MTP): soporta la predicción de múltiples tokens a la vez, lo que puede acelerar la generación en ciertos runtimes.
- Multilingüe: cubre 201 idiomas, con especial soporte para inglés y chino.
- Modo "thinking": el modelo incluye un modo de pensamiento que se activa manteniendo al menos 128K de contexto; las configuraciones recomendadas (temperatura 0.6, top_p 0.95) indican que el modelo genera razonamientos intermedios antes de responder.
- Sin rechazos: el modelo no se niega a responder, incluso ante solicitudes que el modelo original rechazaría.

## Casos de uso

- Asistentes conversacionales sin censura: aplicaciones que requieren respuestas directas y sin filtros, como chatbots de investigación o simuladores de diálogo, aprovechando la ausencia de rechazos y su capacidad multilingüe.
- Análisis de documentos extensos: gracias a su contexto de 262K tokens, puede resumir, extraer información o responder preguntas sobre informes, libros o artículos de investigación completos.
- Procesamiento multimodal: integrar en sistemas que necesitan analizar imágenes o vídeos junto con texto, por ejemplo, generación de descripciones, búsqueda visual o accesibilidad.
- Razonamiento de largo recorrido: en tareas de agentes o planificación multi‑paso, el modelo puede mantener el contexto durante toda la conversación y generar pasos intermedios de razonamiento.
- Generación de contenido creativo: redacción de guiones, artículos o contenido técnico sin restricciones de contenido, aunque con la responsabilidad de verificar la información.
- Investigación académica: análisis de datasets que requieran respuestas sin sesgos de rechazo, como estudios de comportamiento o evaluación de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor afirma que no hay pérdida de capacidades respecto al Qwen3.5-9B original, pero no se proporcionan números concretos de MMLU, HumanEval, GSM8K u otros.

## Requisitos de hardware

- VRAM estimada según cuantización (solo peso del modelo, sin contar contexto):
  - BF16: 17 GB → se recomienda al menos 24 GB de VRAM para contexto moderado.
  - Q8_0: 8,9 GB → recomendable 12 GB de VRAM.
  - Q6_K: 6,9 GB → recomendable 10 GB de VRAM.
  - Q4_K_M: 5,3 GB → recomendable 8 GB de VRAM.
- GPUs compatibles: para BF16 se necesitan GPUs profesionales como A100 (40/80 GB) o H100; para cuantizaciones inferiores, GPUs de consumo como RTX 3090 (24 GB) o RTX 4090 (24 GB) pueden ejecutar Q8_0 o Q6_K con contextos razonables. Q4_K_M cabe en tarjetas de 8-12 GB como RTX 3060 Ti o RTX 3080.
- El contexto largo (262K) aumenta considerablemente el consumo de VRAM. Para usar el contexto completo se recomienda vLLM, SGLang o KTransformers en entornos con múltiples GPUs o memoria unificada.
- Runtimes compatibles: llama.cpp (versión reciente), LM Studio, Jan, koboldcpp, vLLM, SGLang, KTransformers.
- La arquitectura es nueva (2026-03-02), por lo que es necesario usar versiones actualizadas de las herramientas para evitar problemas de compatibilidad.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos en la información proporcionada. La principal comparación es con el modelo base Qwen3.5-9B, del cual este es una variante sin censura. La diferencia clave es que el modelo base mantiene rechazos en ciertas solicitudes, mientras que esta variante los elimina sin alterar el rendimiento. No se han encontrado referencias a otros modelos uncensored de la misma familia (p. ej., Llama-3-8B‑Uncensored) con datos de rendimiento comparables.

## Limitaciones y advertencias

- Contenido sin filtro: el modelo no rechaza ninguna solicitud, lo que puede generar contenido inapropiado, ilegal o dañino. Los desarrolladores deben implementar sus propias capas de moderación si el caso de uso lo requiere.
- Riesgo de alucinaciones: como cualquier modelo de lenguaje, puede producir respuestas falsas o inventadas, especialmente en temas de nicho o con información no cubierta.
- Sesgos potenciales: al heredar los sesgos del Qwen3.5-9B, puede reflejar sesgos de género, culturales o políticos presentes en los datos de entrenamiento.
- Compatibilidad técnica: la arquitectura híbrida y la nueva implementación pueden causar errores en versiones antiguas de llama.cpp u otros runtimes; es obligatorio usar versiones recientes.
- Licencia: Apache-2.0 permite uso comercial, pero el contenido generado es responsabilidad del usuario final; hay que cumplir las leyes locales sobre contenido ilegal.
- Contexto largo: mantener 262K tokens requiere mucha VRAM y puede degradar el rendimiento si no se usa la infraestructura adecuada.
- Descargo de responsabilidad: el modelo puede añadir un breve descargo al final de algunas respuestas, aunque no es un rechazo.

## Enlaces

- [Hugging Face - 52ZZYHLJJ/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive](https://huggingface.co/52ZZYHLJJ/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive)
- [Hugging Face - HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive](https://huggingface.co/HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive)
- [Grokipedia - Qwen3.5-9B-Uncensored-HauhauCS-Aggressive](https://grokipedia.com/page/Qwen35-9B-Uncensored-HauhauCS-Aggressive)
- [Ollama - jaahas/qwen3.5-uncensored](https://ollama.com/jaahas/qwen3.5-uncensored)
- [AIModels.fyi - Qwen3.5-9B-Uncensored](https://www.aimodels.fyi/models/huggingFace/qwen3.5-9b-uncensored-leonw24)
- [Ok Tech Masters - Qwen3.5-9B-Uncensored-HauhauCS-Aggressive](https://oktechmasters.org/ai_models/qwen3-5-9b-uncensored-hauhaucs-aggressive/)
- [Modelo base Qwen/Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B)</think>## Resumen

Qwen3.5-9B-Uncensored-HauhauCS-Aggressive es una variante sin censura del modelo Qwen3.5-9B, desarrollada por el usuario HauhauCS y publicada también por 52ZZYHLJJ en Hugging Face. Su objetivo es eliminar los rechazos (refusals) del modelo original sin que todos sus capacidades se vean afectadas, logrando una tasa de 0/465 en pruebas de rechazo. Se distribuye en formato GGUF con varias cuantizaciones y es compatible con runtimes como llama.cpp, LM Studio o koboldcpp.

El modelo mantiene la arquitectura híbrida del Qwen3.5-9B: combina atención lineal Gated DeltaNet con atención softmax completa en una proporción 3:1, 32 capas y unos 8,95 mil millones de parámetros densos. Su contexto nativo es de 262 000 tokens, ampliable a 1M mediante YaRN, y es multimodal, aceptando texto, imagen y vídeo. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

Su relevancia radica en ofrecer una alternativa sin censura para desarrolladores que necesitan un modelo de alto rendimiento con contexto largo y capacidades multimodales. La publicación es reciente (marzo de 2026), por lo que requiere herramientas actualizadas para su correcto funcionamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet (linear attention) + full softmax attention (ratio 3:1) |
| Parámetros totales | 8 953 803 264 (~8,95 B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens (extensible a 1M con YaRN) |
| Tipos de cuantización | BF16, Q8_0, Q6_K, Q4_K_M, más encoder de visión (mmproj) |
| Idiomas soportados | 201 idiomas (incluye inglés y chino) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (el modelo base original está en safetensors) |

## Arquitectura y entrenamiento

La arquitectura es una adaptación del Qwen3.5-9B, que combina atención lineal Gated DeltaNet con atención softmax completa en una proporción de 3:1. Esta combinación reduce el coste computacional en contextos largos mientras mantiene la capacidad de razonamiento global. El modelo tiene 32 capas y un vocabulario de 248 000 tokens, lo que cubre 201 idiomas. Además, soporta multi‑token prediction (MTP) y es multimodal, con un encoder de visión (mmproj) para procesar imágenes y vídeo.

El proceso de entrenamiento no está documentado en detalle. Según la model card, se trata de un fine-tuning sobre Qwen3.5-9B con el objetivo de eliminar los rechazos, sin modificar los datasets de entrenamiento ni las capacidades del modelo. La variante "Aggressive" aplica una eliminación más exhaustiva de las respuestas de rechazo. El modelo puede añadir un breve descargo de responsabilidad al final de algunas respuestas, pero no se trata de un rechazo; el contenido se genera completo.

## Capacidades

- Generación de texto y razonamiento: hereda todas las capacidades del Qwen3.5-9B, incluyendo tareas de razonamiento, análisis, comprensión y generación de contenido.
- Multimodal: acepta entradas de imagen y vídeo mediante el encoder mmproj, lo que permite análisis visual y respuestas basadas en contenido visual.
- Contexto largo: 262 000 tokens nativos, ampliables a 1M con YaRN, ideal para documentos extensos o conversaciones prolongadas.
- Multi‑token prediction (MTP): soporta la predicción de múltiples tokens a la vez, lo que puede acelerar la generación en runtimes compatibles.
- Multilingüe: 201 idiomas, con soporte especialmente sólido para inglés y chino.
- Modo "thinking": el modelo incluye un modo de pensamiento que se activa manteniendo al menos 128K de contexto; las configuraciones recomendadas (temperatura 0.6, top_p 0.95) indican que genera razonamiento intermedio antes de responder.
- Sin rechazos: no se niega a responder ninguna solicitud, lo que lo hace adecuado para tareas donde el modelo base podría rechazar.

## Casos de uso

- **Asistentes conversacionales sin censura**: para aplicaciones que requieren respuestas sin filtro, como chatbots de investigación o simulación de diálogos, aprovechando su ausencia de rechazos y su multilingüismo.
- **Análisis de documentos extensos**: con 262K de contexto, puede procesar libros completos, informes técnicos o contratos, extrayendo información, resumiendo o comparando secciones.
- **Procesamiento multimodal**: integración en pipelines que necesitan entender imágenes o vídeo (p. ej., generar descripciones, buscar contenido visual, accesibilidad).
- **Razonamiento multi‑paso**: en modo "thinking", puede descomponer problemas complejos en pasos intermedios, útil para planificación, investigación o resolución de problemas.
- **Generación de contenido creativo**: redacción de artículos, guiones o contenido técnico sin restricciones de tema, aunque requiere verificación posterior.
- **Evaluación de modelos**: para investigadores que necesitan estudiar el comportamiento de modelos sin sesgos de censura, como análisis de sesgos o pruebas de robustez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card afirma que no hay pérdida de capacidades respecto al Qwen3.5-9B original, pero no se proporcionan números concretos (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- **VRAM estimada** (solo el peso del modelo, sin contexto):
  - BF16: ~17 GB (requiere al menos 20 GB de VRAM para inferencia con contexto moderado).
  - Q8_0: ~8,9 GB (recomendable 12 GB de VRAM).
  - Q6_K: ~6,9 GB (recomendable 10 GB de VRAM).
  - Q4_K_M: ~5,3 GB (recomendable 8 GB de VRAM).
- **GPU recomendadas**:
  - BF16: GPU con 24 GB o más (RTX 4090, A100 40/80 GB, H100).
  - Q8_0/Q6_K: RTX 3090, RTX 4080, A10G, etc.
  - Q4_K_M: RTX 3060 Ti, RTX 3080, A10.
- **Contexto largo**: el uso de 262K tokens aumenta considerablemente el consumo de VRAM. Para el contexto completo, se recomienda vLLM, SGLang o KTransformers en entornos con múltiples GPUs o memoria de 80 GB.
- **Opciones de despliegue**: llama.cpp (versión reciente), LM Studio, Jan, koboldcpp, vLLM, SGLang, KTransformers.
- **Latencia**: no se dispone de datos de throughput específicos, pero la arquitectura híbrida y el MTP pueden ofrecer mejoras de velocidad en runtimes que los aprovechen.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. La comparación más directa es con el modelo base **Qwen3.5-9B**:

| Modelo | Parámetros | Contexto | Multimodal | Refusals | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-9B (base) | 8,95 B | 262K | Sí | Sí (presentes) | Apache-2.0 |
| Qwen3.5-9B-Uncensored-HauhauCS-Aggressive | 8,95 B | 262K | Sí | No (0/465) | Apache-2.0 |

No se han encontrado otros modelos uncensored de la misma familia con datos de rendimiento comparables en la información disponible.

## Limitaciones y advertencias

- **Ausencia de censura**: el modelo no rechaza ninguna solicitud, lo que puede generar contenido inapropiado, ilegal o dañino. Los desarrolladores deben implementar sus propias capas de moderación si el caso de uso lo requiere.
- **Alucinaciones**: como cualquier modelo de lenguaje, puede producir información falsa o inventada, especialmente en dominios con datos escasos.
- **Sesgos**: hereda los sesgos del Qwen3.5-9B, que pueden reflejar estereotipos culturales, de género o raciales presentes en los datos de entrenamiento.
- **Compatibilidad**: la arquitectura es nueva (2026-03-02) y el soporte en llama.cpp es reciente; se requieren versiones actualizadas de todos los runtimes.
- **Licencia**: Apache-2.0 permite uso comercial, pero el contenido generado es responsabilidad del usuario y debe cumplir las leyes locales.
- **Contexto largo**: mantener 262K tokens requiere mucha memoria y puede degradar el rendimiento si no se usa la infraestructura adecuada.
- **Descargos de responsabilidad**: el modelo puede añadir un breve descargo al final de algunas respuestas, lo que podría interpretarse como un rechazo parcial, aunque el contenido se genera completo.

## Enlaces

- [Hugging Face - 52ZZYHLJJ/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive](https://huggingface.co/52ZZYHLJJ/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive)
- [Hugging Face - HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive](https://huggingface.co/HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive)
- [Grokipedia - Qwen3.5-9B-Uncensored-HauhauCS-Aggressive](https://grokipedia.com/page/Qwen35-9B-Uncensored-HauhauCS-Aggressive)
- [Ollama - jaahas/qwen3.5-uncensored](https://ollama.com/jaahas/qwen3.5-uncensored)
- [AIModels - Qwen3.5-9B-Uncensored](https://www.aimodels.fyi/models/huggingFace/qwen3.5-9b-uncensored-leonw24)
- [Ok Tech Masters - Qwen3.5-9B-Uncensored-HauhauCS-Aggressive](https://oktechmasters.org/ai_models/qwen3-5-9b-unc
