# Listenlin/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive

## Resumen

Qwen3.5-9B-Uncensored-HauhauCS-Aggressive es una variante sin censura del modelo Qwen3.5-9B, desarrollada por HauhauCS y publicada en Hugging Face por el usuario Listenlin. El objetivo es eliminar por completo los rechazos del modelo original (0/465 refusals) manteniendo intactas sus capacidades, sin modificar datasets ni comportamiento general. Se trata de un modelo denso de aproximadamente 9.000 millones de parámetros con arquitectura híbrida que combina atención lineal Gated DeltaNet y atención softmax completa en proporción 3:1, con 32 capas y una ventana de contexto nativa de 262.000 tokens, ampliable a 1 millón mediante YaRN.

El modelo es nativamente multimodal (texto, imagen y vídeo), soporta multi-token prediction (MTP) y un vocabulario de 248.000 tokens que cubre 201 idiomas. Se distribuye en formato GGUF con varias cuantizaciones, lo que permite su ejecución en hardware de consumo. La variante "Aggressive" aplica una eliminación más profunda de rechazos que la versión "Balanced" (no publicada). Su relevancia radica en ofrecer un modelo de código abierto sin restricciones de contenido, útil para escenarios donde se requiere generación libre de respuestas, aunque con los riesgos éticos y de seguridad asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet linear attention + full softmax attention (ratio 3:1), 32 capas |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.000 tokens nativos, extensible a 1.000.000 con YaRN |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q4_K_M (GGUF) |
| Idiomas soportados | Inglés, chino y 199 más (total 201) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (también safetensors en repos espejo) |

## Arquitectura y entrenamiento

La arquitectura combina dos mecanismos de atención: una atención lineal basada en Gated DeltaNet (eficiente en memoria y cómputo) y una atención softmax completa, en una proporción de 3:1. Esta hibridación permite manejar contextos muy largos (262K nativos) con un coste computacional menor que un transformer puramente softmax. El modelo tiene 32 capas y es denso, sin mezcla de expertos.

El entrenamiento consiste en un fine-tuning sobre Qwen3.5-9B para eliminar los rechazos del modelo original. Según la model card, no se han modificado datasets ni capacidades; el proceso se centra en "desbloquear" el modelo para que responda a cualquier petición sin negarse. No se han publicado detalles sobre el dataset de fine-tuning, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO. La variante "Aggressive" realiza una eliminación más exhaustiva de los mecanismos de rechazo, aunque puede añadir un descargo de responsabilidad al final de algunas respuestas, comportamiento heredado del modelo base.

## Capacidades

- Generación de texto libre sin rechazos: responde a cualquier petición, incluidos temas sensibles o controvertidos, sin negarse.
- Razonamiento y pensamiento: incluye un modo "thinking" por defecto (temperatura 0.6, top_p 0.95) y un modo "non-thinking" (temperatura 0.7, top_p 0.8).
- Multimodalidad nativa: procesa texto, imágenes y vídeo mediante un encoder de visión (archivo mmproj) que debe cargarse junto al modelo principal.
- Multi-token prediction (MTP): capacidad de predecir varios tokens a la vez, lo que puede mejorar la velocidad de generación.
- Multilingüismo: soporta 201 idiomas, con especial dominio de inglés y chino.
- Contexto largo: ventana de 262K tokens nativa, ampliable a 1M con YaRN, adecuada para documentos extensos o conversaciones de muchos turnos.
- Compatibilidad con runtimes estándar: funciona con llama.cpp, LM Studio, Jan, koboldcpp, vLLM, SGLang y KTransformers (estos últimos para producción).

## Casos de uso

- Generación de contenido creativo sin restricciones: escritores y guionistas pueden explorar temas tabú o controvertidos (violencia, sexualidad, política) sin que el modelo se niegue, gracias a su política de cero rechazos.
- Investigación en seguridad de IA: los equipos de red team pueden probar los límites del modelo y estudiar cómo responde a prompts maliciosos o peligrosos, ayudando a desarrollar mejores sistemas de moderación.
- Análisis de documentos extensos: con 262K tokens de contexto, puede resumir o extraer información de libros completos, informes legales o investigaciones académicas en un solo paso.
- Asistencia en traducción multilingüe: su vocabulario de 201 idiomas permite traducir textos entre lenguas minoritarias, aunque la calidad puede variar según el par.
- Procesamiento de vídeo e imágenes: gracias a su encoder de visión, puede describir contenido visual, transcribir escenas o generar metadatos para archivos multimedia.
- Desarrollo de personajes para juegos de rol: los creadores de juegos pueden usarlo para generar diálogos y comportamientos de personajes sin limitaciones temáticas, manteniendo coherencia en conversaciones largas.
- Chatbots de nicho: para aplicaciones donde el usuario espera respuestas directas sin filtros (por ejemplo, asistentes para adultos), este modelo ofrece una alternativa de código abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma "cero pérdida de capacidades" respecto al modelo base, pero no proporciona métricas numéricas (MMLU, HumanEval, GSM8K, etc.) que lo respalden. Tampoco se han encontrado evaluaciones independientes en los resultados de búsqueda.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (tamaño del archivo + overhead de KV cache y activaciones):
  - Q4_K_M (5.3 GB): cabe en GPUs con 8 GB de VRAM (p. ej., RTX 3060, RTX 4060).
  - Q6_K (6.9 GB): recomendable 10-12 GB de VRAM (RTX 3080, RTX 4070).
  - Q8_0 (8.9 GB): requiere 12-16 GB de VRAM (RTX 4080, RTX 3090).
  - BF16 (17 GB): necesita 20-24 GB de VRAM (RTX 4090, A100, H100).
- Para el encoder de visión (mmproj, 880 MB) se necesita VRAM adicional si se usan entradas multimodales.
- GPU recomendadas: RTX 3060/4060 para Q4_K_M, RTX 3080/4070 para Q6_K, RTX 4090 o A100 para BF16.
- Opciones de despliegue: llama.cpp (build reciente, ya que la arquitectura es nueva), LM Studio, Jan, koboldcpp para uso local; vLLM, SGLang o KTransformers para producción de alto rendimiento.
- Latencia y throughput: no se han publicado datos concretos. La arquitectura híbrida con atención lineal debería ofrecer mejor escalabilidad en contextos largos que un transformer estándar, pero no hay cifras verificadas.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa con otros modelos uncensored (p. ej., Dolphin, Nous Hermes) o con el propio Qwen3.5-9B base, ya que no hay benchmarks publicados. Cualitativamente, se puede señalar:

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Observaciones |
|---|---|---|---|---|---|
| Qwen3.5-9B (base) | ~9B | 262K | Sí | Apache 2.0 | Incluye rechazos y moderación |
| Qwen3.5-9B-Uncensored-HauhauCS-Aggressive | ~9B | 262K | Sí | Apache 2.0 | Sin rechazos, misma arquitectura |
| Otros modelos uncensored (Dolphin, etc.) | Variable | Variable | Variable | Variable | Sin datos disponibles en esta búsqueda |

La principal diferencia con el modelo base es la eliminación de rechazos; el resto de características técnicas son idénticas.

## Limitaciones y advertencias

- Ausencia total de moderación: el modelo puede generar contenido dañino, ilegal, violento o sexualmente explícito sin ningún filtro. Su uso en producción requiere medidas de seguridad adicionales (filtros externos, supervisión humana).
- Riesgo de alucinación: al igual que otros LLM, puede inventar información, especialmente en temas especializados o con contextos ambiguos. La falta de rechazos no implica mayor precisión.
- Sesgos del modelo base: hereda los sesgos presentes en Qwen3.5-9B, que pueden amplificarse al no haber moderación.
- Descargos de responsabilidad: aunque no rechaza, puede añadir frases como "This is general information, not legal advice..." al final de algunas respuestas, lo que podría confundir en aplicaciones automáticas.
- Compatibilidad reciente: la arquitectura híbrida (Gated DeltaNet) es nueva (lanzada en marzo de 2026) y el soporte en llama.cpp es muy reciente; es necesario usar builds actualizadas para evitar errores.
- Requisitos de contexto: la model card recomienda mantener al menos 128K de contexto para preservar las capacidades de razonamiento, lo que implica un mayor consumo de memoria.
- Licencia Apache 2.0: permite uso comercial, pero el usuario es responsable del contenido generado y de cumplir la legislación aplicable.

## Enlaces

- Repositorio Hugging Face (Listenlin): https://huggingface.co/Listenlin/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive
- Repositorio original de HauhauCS: https://huggingface.co/HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive
- Repositorio safetensors (GitMylo): https://huggingface.co/GitMylo/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive-safetensors
- Página en Ollama: https://ollama.com/jaahas/qwen3.5-uncensored
- Guía en HackerNoon: https://hackernoon.com/qwen35-9b-uncensored-hauhaucs-aggressive-model-a-beginners-guide-to-get-you-started
- Entrada en Grokipedia: https://grokipedia.com/page/Qwen35-9B-Uncensored-HauhauCS-Aggressive
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
