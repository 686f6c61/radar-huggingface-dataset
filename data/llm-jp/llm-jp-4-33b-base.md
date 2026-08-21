# llm-jp/llm-jp-4-33b-base

## Resumen

El modelo **llm-jp-4-33b-base** es un modelo de lenguaje de gran tamaño (LLM) de tipo denso, desarrollado por el Centro de Investigación y Desarrollo para Modelos de Lenguaje a Gran Escala (LLMC) del Instituto Nacional de Informática (NII) de Japón. Forma parte de la serie LLM-jp-4, que incluye variantes densas y de mezcla de expertos (MoE). Este modelo base ha sido entrenado únicamente con fases de pre-entrenamiento y entrenamiento intermedio, sin alineación posterior mediante SFT o DPO, a diferencia de la versión `llm-jp-4-33b-thinking`.

Con aproximadamente 33.200 millones de parámetros y una ventana de contexto de 65.536 tokens, está diseñado para tareas de generación de texto en inglés y japonés, con especial énfasis en el idioma japonés. Su arquitectura transformer densa y su licencia Apache 2.0 lo convierten en una opción atractiva para investigación y desarrollo de aplicaciones multilingües, especialmente en el ámbito académico y empresarial japonés. La publicación del modelo en agosto de 2026 amplía el ecosistema de LLMs abiertos con un tamaño intermedio que equilibra capacidad y requisitos de hardware.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no MoE) |
| Parametros totales | 33.219.548.160 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | No disponible (pesos originales en bf16) |
| Idiomas soportados | Inglés, japonés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer densa con 64 capas, tamaño de ocultación de 5.120 y 40 cabezas de atención. El tokenizador se basa en un modelo Unigram con byte-fallback, construido a partir del `llm-jp-tokenizer v4.0`, que utiliza un vocabulario específico para soportar eficientemente inglés y japonés. El entrenamiento se realizó en un pipeline de múltiples etapas que combina pre-entrenamiento y entrenamiento intermedio, utilizando un total de 11,7 billones de tokens. Los corpus empleados están parcialmente disponibles públicamente, aunque algunas porciones se excluyen por restricciones de licencia. El modelo base no ha pasado por fases de alineación (SFT/DPO), que sí se aplican a la variante `thinking`.

## Capacidades

- Generación de texto en inglés y japonés con alta fluidez, especialmente en dominios técnicos y científicos.
- Razonamiento y comprensión de contextos largos gracias a su ventana de 65.536 tokens.
- Generación de código en múltiples lenguajes de programación: C, C++, C#, Go, Java, JavaScript, Lua, PHP, Python, Ruby, Rust, Scala y TypeScript.
- Capacidad de procesamiento de instrucciones en formato de chat (aunque no está alineado, puede seguir prompts básicos).
- Soporte para tareas de completado de texto, resumen, extracción de información y traducción entre inglés y japonés.
- Al ser un modelo base, no incluye tool calling ni funciones de agente de forma nativa; estas capacidades requerirían fine-tuning posterior.

## Casos de uso

- **Fine-tuning para tareas específicas en japonés**: el modelo puede ajustarse con datasets propios para dominios como legal, médico o financiero, aprovechando su conocimiento del idioma japonés y su contexto largo.
- **Generación de código en entornos de desarrollo**: gracias a su soporte para múltiples lenguajes, puede utilizarse como base para asistentes de programación o autocompletado de código tras un fine-tuning con datos de código.
- **Investigación en procesamiento de lenguaje natural multilingüe**: su tamaño intermedio y licencia abierta lo hacen adecuado para experimentos académicos sobre transferencia de conocimiento entre inglés y japonés.
- **Extracción de información de documentos largos**: la ventana de 65.536 tokens permite procesar documentos extensos, como informes técnicos o artículos de investigación, para extraer entidades o resumir contenido.
- **Traducción automática asistida**: aunque no está específicamente entrenado para traducción, puede generar traducciones razonables entre inglés y japonés, sirviendo como base para sistemas de traducción con fine-tuning.
- **Generación de documentación técnica**: puede producir descripciones, comentarios y documentación en inglés o japonés a partir de código o especificaciones, útil en entornos de desarrollo de software.
- **Prototipado de chatbots y asistentes**: aunque no está alineado, puede servir como punto de partida para construir asistentes conversacionales en japonés mediante SFT y DPO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que se utilizó el framework `llm-jp-judge` con GPT-5.4 como evaluador para tareas como MT-Bench, AnswerCarefully y llm-jp-instructions, pero no se incluyen los valores numéricos en el extracto proporcionado. Por tanto, no es posible presentar una tabla comparativa con datos verificados.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con pesos en bf16 (formato original), se necesitan aproximadamente 66 GB de VRAM (33.2B × 2 bytes). Con cuantización a 8 bits, alrededor de 33 GB; con 4 bits, unos 17 GB.
- **GPU recomendadas**: para bf16 completo, se requieren GPUs profesionales como A100 80GB, H100 o múltiples GPUs (por ejemplo, 2× RTX 4090 con 24 GB cada una). Con cuantización 4 bits, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente.
- **Compatibilidad con GPUs de consumo**: sí, mediante cuantización (GGUF, AWQ, GPTQ) es posible ejecutarlo en GPUs de 24 GB o incluso 16 GB con cuantización más agresiva.
- **Opciones de despliegue**: compatible con transformers, vLLM, llama.cpp, Ollama y Text Generation Inference (TGI). El modelo está etiquetado con `text-generation-inference`.
- **Latencia y throughput**: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos publicados para este modelo. A continuación se presenta una comparación estructural con otros modelos de tamaño similar:

| Modelo | Parámetros | Contexto | Licencia | Idiomas |
|---|---|---|---|---|
| llm-jp-4-33b-base | 33.2B | 65.536 | Apache 2.0 | en, ja |
| Llama-3-8B | 8B | 8.192 | Llama 3 License | multilingüe (limitado) |
| Mistral-7B | 7B | 32.768 | Apache 2.0 | en, fr, de, es, it |
| ELYZA-japanese-Llama-2-7b | 7B | 4.096 | Llama 2 License | ja, en |

La comparativa directa con modelos de 33B no está disponible en la información recopilada. El modelo destaca por su contexto largo y su enfoque específico en japonés, lo que lo diferencia de alternativas occidentales.

## Limitaciones y advertencias

- **Modelo base sin alineación**: al no haber pasado por SFT/DPO, puede generar contenido inapropiado, sesgado o no seguir instrucciones de forma fiable. No debe usarse directamente en aplicaciones de cara al usuario sin un fine-tuning adecuado.
- **Sesgos potenciales**: los datos de entrenamiento pueden contener sesgos culturales, de género o ideológicos, especialmente en japonés. Se recomienda auditar el modelo antes de su uso en producción.
- **Riesgo de alucinación**: como todo LLM, puede generar información falsa o inventada, especialmente en dominios especializados.
- **Limitaciones de idioma**: aunque soporta inglés y japonés, su rendimiento en otros idiomas no está garantizado y puede ser deficiente.
- **Restricciones de uso**: aunque la licencia Apache 2.0 permite uso comercial, el desarrollador solicita a los usuarios que sigan la "Guía para garantizar la adecuación de la investigación, desarrollo y utilización de tecnologías relacionadas con la IA" del gobierno japonés. Se recomienda revisar las directrices antes de su despliegue.
- **Requisitos de hardware**: el tamaño del modelo (66.5 GB en bf16) puede ser un obstáculo para entornos con recursos limitados, requiriendo cuantización o infraestructura dedicada.

## Enlaces

- [HuggingFace - llm-jp/llm-jp-4-33b-base](https://huggingface.co/llm-jp/llm-jp-4-33b-base)
- [Noticia de lanzamiento (NII)](https://llm-jp.nii.ac.jp/news/20260818/)
- [Página de releases de LLM-jp](https://llm-jp.nii.ac.jp/en/release-en/)
- [Colección de modelos LLM-jp-4](https://huggingface.co/collections/llm-jp/llm-jp-4-models)
- [Cookbook de LLM-jp-4](https://github.com/llm-jp/llm-jp-4-cookbook)
- [Repositorio del tokenizador llm-jp-tokenizer](https://github.com/llm-jp/llm-jp-tokenizer)
