# evaying/Qwen3.6-27B-Uncensored-HauhauCS-Aggressive

## Resumen

El modelo `evaying/Qwen3.6-27B-Uncensored-HauhauCS-Aggressive` es un fine-tune del modelo Qwen3.6-27B de Alibaba, desarrollado por HauhauCS y publicado en Hugging Face por el usuario evaying. Se trata de una variante "uncensored" que elimina los rechazos del modelo original mediante una técnica de abliteración (abliteration), logrando una tasa de 0/465 rechazos en el benchmark interno. La variante Aggressive se caracteriza por entregar respuestas directas sin preámbulos ni disclaimers en prompts considerados "hardcore", a diferencia de la variante Balanced que razona en voz alta antes de responder.

El modelo mantiene intactas las capacidades del Qwen3.6-27B original: es un transformer denso de 26.895.998.464 parámetros con arquitectura híbrida de atención (Gated DeltaNet lineal y Gated Attention completa), contexto nativo de 262.144 tokens extensible a ~1M con YaRN, y soporte multimodal (texto, imagen y vídeo) mediante un proyector mmproj incluido. Se distribuye exclusivamente en formato GGUF con cuantizaciones personalizadas K_P (importance-matrix) que optimizan la calidad preservando los pesos abliterados. La licencia Apache 2.0 permite uso comercial sin restricciones.

La relevancia de este modelo radica en su doble naturaleza: por un lado, ofrece capacidades técnicas de primer nivel (contexto largo, multimodalidad, razonamiento) heredadas de Qwen3.6-27B; por otro, elimina las barreras de moderación, lo que lo hace atractivo para aplicaciones de escritura creativa sin restricciones, roleplay o investigación sobre alineación, aunque con riesgos evidentes de mal uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (Gated DeltaNet + Gated Attention) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativo, extensible a ~1.000.000 con YaRN |
| Tipos de cuantizacion | Q8_K_P, Q6_K_P, Q5_K_P, Q4_K_P, IQ4_XS, Q3_K_P, IQ3_M, IQ3_XS, Q2_K_P, IQ2_M, mmproj f16 |
| Idiomas soportados | Inglés, chino, multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (modelo base original) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.6-27B, un transformer denso de 64 capas con una disposición interna de `16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN))`. Esto implica 48 capas de atención lineal (Gated DeltaNet) y 16 capas de atención completa (Gated Attention). La atención lineal usa 48 cabezas V y 16 cabezas QK con dimensión de cabeza 128, mientras que la atención completa emplea 24 cabezas Q y 4 cabezas KV con dimensión de cabeza 256 y rope dim 64. La dimensión oculta es 5120, la FFN 17408 y el vocabulario 248320.

El entrenamiento del fine-tune se describe como "lossless uncensoring" mediante abliteración, una técnica que identifica y elimina las direcciones en el espacio de activaciones responsables de los comportamientos de rechazo, sin modificar los pesos de forma destructiva. Según la model card, no se alteraron datasets ni capacidades; el modelo conserva el 100% de las funcionalidades originales. El proceso de cuantización se realizó con importance matrix (imatrix) para preservar la calidad en los pesos abliterados, y se ofrecen cuantizaciones K_P personalizadas que mejoran la fidelidad respecto a las cuantizaciones estándar con un incremento de tamaño del 5-15%.

## Capacidades

- Generación de texto y razonamiento: mantiene las capacidades completas de Qwen3.6-27B, incluyendo razonamiento multi-step y modo "thinking" (aunque la model card se corta en ese punto, se menciona como recomendación oficial).
- Multimodalidad: soporta entrada de texto, imagen y vídeo mediante el proyector mmproj incluido, permitiendo tareas de image-text-to-text.
- Tool calling y function calling: compatible con el ecosistema Qwen, que incluye soporte nativo para herramientas y agentes.
- Capacidades de agente: puede ejecutar flujos multi-paso y razonamiento encadenado, útil para tareas de automatización.
- Multilingüe: cubre inglés, chino y otros idiomas con rendimiento competitivo.
- Sin rechazos: tasa de 0/465 en el benchmark de rechazos, respondiendo a prompts que el modelo base declinaría.
- Modo "aggressive": en prompts sensibles, entrega la respuesta directamente sin preámbulos ni disclaimers, a diferencia de la variante Balanced.

## Casos de uso

- Escritura creativa sin restricciones: autores y guionistas pueden generar narrativas con temáticas adultas, violencia o contenido controvertido sin que el modelo se niegue o añada avisos, gracias a su tasa de rechazo 0/465 y al modo Aggressive que omite preámbulos.
- Roleplay y ficción interactiva: comunidades de roleplay (RP) pueden usar el modelo para personajes con respuestas directas y sin censura, aprovechando el contexto largo de 262K tokens para mantener historias extensas y coherentes.
- Análisis de imágenes y vídeo en entornos sin moderación: investigadores o desarrolladores pueden emplear el modelo para tareas de captioning o descripción de contenido visual que otros modelos rechazarían, por ejemplo en análisis de contenido médico o forense (con las debidas salvaguardas).
- Investigación sobre alineación y seguridad: el modelo sirve como caso de estudio para analizar cómo la abliteración afecta al comportamiento, los sesgos y la propensión a alucinaciones, comparándolo con el modelo base.
- Generación de código y automatización de agentes: aunque el foco está en el "uncensoring", conserva las capacidades de tool calling y razonamiento de Qwen3.6-27B, por lo que puede integrarse en pipelines de CI/CD para generación de código, pruebas o documentación, sin las restricciones de contenido que podrían bloquear prompts técnicos.
- Asistentes conversacionales para nichos específicos: desarrolladores que necesitan un asistente que no rechace preguntas sobre temas políticamente sensibles, filosóficos o éticos, pueden desplegarlo en entornos controlados con supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona la tasa de rechazos (0/465) y las especificaciones técnicas, sin datos de MMLU, HumanEval, GSM8K u otros estándares. Tampoco se encontraron evaluaciones independientes en la búsqueda web. Se recomienda consultar el repositorio original de Qwen3.6-27B para conocer el rendimiento del modelo base, asumiendo que el fine-tune no degrada significativamente las capacidades (según la afirmación de "lossless uncensoring").

## Requisitos de hardware

- VRAM estimada según cuantización (tamaños de archivo de la model card):
  - Q8_K_P: 32 GB (GPU de 40 GB o más, p. ej. A100 40GB, H100)
  - Q6_K_P: 23 GB (GPU de 24 GB, p. ej. RTX 3090, RTX 4090)
  - Q5_K_P: 21 GB (GPU de 24 GB)
  - Q4_K_P: 18 GB (GPU de 24 GB o 20 GB)
  - IQ4_XS: 15 GB (GPU de 16 GB, p. ej. RTX 4080, A4000)
  - Q3_K_P: 14 GB (GPU de 16 GB)
  - IQ3_M: 13 GB (GPU de 16 GB)
  - IQ3_XS: 12 GB (GPU de 12-16 GB)
  - Q2_K_P: 12 GB (GPU de 12 GB, p. ej. RTX 3060)
  - IQ2_M: 10 GB (GPU de 10-12 GB)
  - mmproj f16: 928 MB adicionales para multimodalidad
- Cabe en GPU de consumo: sí, desde la cuantización Q4_K_P hacia abajo (18 GB o menos) en tarjetas como RTX 4090, RTX 4080 o RTX 3090. Para Q8_K_P se requiere hardware profesional o de centro de datos.
- Opciones de despliegue: llama.cpp (compatible con todas las cuantizaciones K_P), LM Studio, y cualquier runtime compatible con GGUF (Ollama, TGI, etc.). No se requiere compilación especial para los quants K_P.
- Latencia y throughput: no se han publicado datos específicos. Como referencia, un modelo de 27B en Q4_K_P en una RTX 4090 suele alcanzar entre 20 y 40 tokens por segundo con llama.cpp, dependiendo de la longitud de contexto y el uso de atención lineal (que acelera la generación en secuencias largas).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Tasa de rechazos | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.6-27B (base) | 26,9B | 262K | Sí | Alta (rechaza contenido sensible) | Apache 2.0 | safetensors |
| Qwen3.6-27B-Uncensored-HauhauCS-Balanced | 26,9B | 262K | Sí | 0/465 | Apache 2.0 | GGUF |
| Qwen3.6-27B-Uncensored-HauhauCS-Aggressive (este) | 26,9B | 262K | Sí | 0/465 | Apache 2.0 | GGUF |

La diferencia principal entre Aggressive y Balanced es el comportamiento en prompts sensibles: Aggressive responde directamente sin preámbulos, mientras que Balanced razona en voz alta y ocasionalmente añade un disclaimer corto antes de la respuesta. Ambos tienen la misma tasa de rechazo y capacidades. El modelo base Qwen3.6-27B conserva los mecanismos de moderación originales, por lo que rechaza contenido que las variantes uncensored sí procesan.

## Limitaciones y advertencias

- Contenido potencialmente dañino: al eliminar los rechazos, el modelo puede generar texto que incite a la violencia, discriminación, actividades ilegales o contenido sexual explícito. Su uso en producción sin supervisión humana conlleva riesgos legales y éticos.
- Sesgos y alucinaciones: el proceso de abliteración no corrige sesgos subyacentes del modelo base; además, la eliminación de mecanismos de rechazo puede aumentar la confianza en respuestas incorrectas. No hay datos de evaluación de sesgos para esta variante.
- Riesgo de mal uso: la combinación de "uncensoring" y multimodalidad (imagen/vídeo) facilita la generación de contenido inapropiado a partir de estímulos visuales, lo que exige medidas de control adicionales en entornos compartidos.
- Compatibilidad de cuantizaciones: los quants K_P pueden mostrarse como "?" en LM Studio (problema de visualización, no funcional). El widget de compatibilidad de Hugging Face no reconoce estos formatos, lo que puede confundir a los usuarios.
- Sin benchmarks publicados: no hay evidencia independiente de que el fine-tune no degrade el rendimiento en tareas estándar. La afirmación de "lossless" es del autor y no está verificada.
- Soporte de idiomas limitado a los del modelo base: aunque es multilingüe, el rendimiento fuera de inglés y chino puede ser inferior.
- Licencia Apache 2.0: permite uso comercial, pero el usuario es responsable del contenido generado y de cumplir con las leyes aplicables en su jurisdicción.

## Enlaces

- Repositorio Hugging Face (evaying): https://huggingface.co/evaying/Qwen3.6-27B-Uncensored-HauhauCS-Aggressive
- Repositorio original de HauhauCS (Aggressive): https://huggingface.co/HauhauCS/Qwen3.6-27B-Uncensored-HauhauCS-Aggressive
- Variante Balanced: https://huggingface.co/HauhauCS/Qwen3.6-27B-Uncensored-HauhauCS-Balanced
- Modelo base Qwen3.6-27B: https://huggingface.co/Qwen/Qwen3.6-27B
- Guía de despliegue (innoai.space): https://innoai.space/model/HauhauCS/Qwen3.6-27B-Uncensored-HauhauCS-Aggressive
- Análisis en ThinkLLM: https://thinkllm.dev/models/qwen3-6-27b-uncensored-hauhaucs-aggressive
- Discord del autor: https://discord.gg/SZ5vacTXYf
