# Aliados/gemma-3-1b-it-int4-awq

## Resumen

El modelo `Aliados/gemma-3-1b-it-int4-awq` es una conversión a formato AWQ del checkpoint QAT INT4 Flax de Gemma 3 1B instruction-tuned, realizada por el usuario Aliados. Se trata de la variante de 1.000 millones de parámetros de la familia Gemma 3, desarrollada por Google DeepMind a partir de la tecnología utilizada en los modelos Gemini. El modelo está diseñado para tareas de generación de texto y comprensión de imágenes, con soporte para más de 140 idiomas y una ventana de contexto de 32.000 tokens en la variante de 1B. La conversión tiene como objetivo facilitar el despliegue en entornos con recursos limitados, al reducir el peso del modelo a aproximadamente 1 GB mediante cuantización INT4, manteniendo la compatibilidad con el ecosistema de Transformers y vLLM.

Según el autor, la cuantización proviene de un entrenamiento QAT INT4 original de Google (checkpoint Flax de Kaggle) y no de un proceso AWQ; la conversión únicamente adapta los pesos al formato AWQ de Hugging Face. Por tanto, se trata de una cuantización consciente del entrenamiento de alta calidad, no de una cuantización posterior con AWQ. El repositorio no tiene descargas ni likes, por lo que su compatibilidad y fiabilidad todavía no ha sido validada por la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador con entrada multimodal (texto e imagen) y salida de texto (Gemma3ForCausalLM) |
| Parametros totales | 999.885.952 (≈ 1.000 M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.000 tokens (entrada); 8.192 tokens de salida |
| Tipos de cuantizacion | INT4 (QAT, convertido a formato AWQ) |
| Idiomas soportados | Más de 140 idiomas (según documentación de Gemma 3) |
| Licencia | Gemma (Google) |
| Formato de pesos | Safetensors (transformers) con cuantización AWQ |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura original de Gemma 3, un transformer decodificador que admite entradas de texto e imágenes. La variante de 1B fue entrenada con 2 billones de tokens procedentes de documentos web, código y matemáticas, con contenido en más de 140 idiomas. Tras el preentrenamiento, el modelo ha sido ajustado por instrucciones (instruction-tuned) para seguir indicaciones en formato chat. En la información disponible no se especifica si el ajuste utilizó RLHF, DPO u otro método de alineación.

Este repositorio en concreto contiene el checkpoint QAT INT4 Flax de Google (distribuido vía Kaggle), convertido a formato AWQ para Hugging Face. El autor indica explícitamente que AWQ no fue utilizado para la cuantización; se trata de una cuantización consciente del entrenamiento nativa de Flax, adaptada al contenedor AWQ. Esto permite usar los kernels AWQ sin reinterpretar los pesos como cuantizados a posteriori.

## Capacidades

- Generación de texto en formato instructivo y chat, incluyendo system prompts.
- Comprensión de imágenes: acepta imágenes normalizadas a 896x896 (codificadas en 256 tokens cada una) para tareas de descripción, análisis o preguntas visuales.
- Razonamiento y preguntas y respuestas: puede resolver preguntas, resumir documentos y realizar razonamiento sobre texto e imágenes.
- Multilingüismo: soporte declarado de más de 140 idiomas.
- Contexto largo de 32K tokens para entrada, adecuado para documentos extensos y conversaciones de múltiples turnos.
- Generación de código y resolución de cuestiones relacionadas con código, gracias a la exposición a datos de código durante el entrenamiento.
- No se han documentado capacidades de tool calling ni function calling en la información disponible.

## Casos de uso

- Atención al cliente multilingüe: el modelo puede gestionar conversaciones en más de 140 idiomas y mantener un historial de hasta 32K tokens, lo que permite atender hilos largos sin perder contexto. Al ser instruction-tuned, se integra fácilmente con plantillas de chat.
- Resumen de documentos largos: con la ventana de 32K tokens, puede procesar informes, artículos o actas extensas en una sola pasada y generar resúmenes ejecutivos, tanto en español como en otros idiomas.
- Análisis de imágenes en dispositivos edge: al ser multimodal y estar cuantizado en INT4 (aproximadamente 1 GB), puede desplegarse en equipos con GPU modesta para tareas como descripción de imágenes o extracción de texto de capturas, sin depender de servicios externos.
- Asistente educativo local: el tamaño reducido del modelo permite ejecutarlo en ordenadores personales sin conexión, por ejemplo para resolver dudas de matemáticas, historia o ciencias, aprovechando el entrenamiento en datos matemáticos y de razonamiento.
- Generación de código en entornos de desarrollo: gracias a la exposición a código durante el entrenamiento, el modelo puede generar fragmentos de código, explicar sintaxis o auxiliar en tareas de programación dentro de un IDE.
- Búsqueda en base de conocimiento (RAG): al soportar preguntas y respuestas con contexto largo, puede combinarse con un vector store para recuperar información interna y generar respuestas contextualizadas a partir de documentos de la empresa.
- Traducción automática: su soporte multilingüe permite traducir textos entre varios idiomas, con la ventaja de poder incluir el contexto completo de la conversación para mantener el tono.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tablas de rendimiento ni comparativas numéricas con otros modelos.

## Requisitos de hardware

- Tamaño de los pesos en INT4: aproximadamente 1,0 GB (según el tamaño del repositorio).
- VRAM estimada para inferencia: al menos 2 GB para secuencias cortas, incluyendo activaciones y cache. Para secuencias largas (32K tokens), se recomienda 4 a 6 GB.
- GPU recomendadas: tarjetas consumer con 4 GB o más, como RTX 3060, RTX 4060 o similares; también es válida una A10G o T4 en entornos cloud.
- Opciones de despliegue: Hugging Face Transformers (versión v4.49.0-Gemma-3), vLLM o TGI si se usa el formato AWQ. Para CPU sería necesario convertir a GGUF o descargar los GGUFs QAT INT4 oficiales, ya que este repositorio no incluye pesos GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones en la documentación del repositorio.

## Comparativa con modelos similares

| Parametro | Aliados/gemma-3-1b-it-int4-awq | google/gemma-3-1b-it | google/gemma-3-4b-it |
|---|---|---|---|
| Parametros | 999,9 M | ~1.000 M | ~4.000 M |
| Contexto | 32K | 32K | 128K |
| Rendimiento | No disponible | No disponible | No disponible |
| Licencia | Gemma | Gemma | Gemma |
| Disponibilidad | Público (Hugging Face) | Público (Hugging Face) | Público (Hugging Face) |
| Modalidad | Texto e imagen | Texto e imagen | Texto e imagen |
| Cuantización | INT4 (QAT/AWQ) | bfloat16 (según ejemplo del README) | No disponible |

## Limitaciones y advertencias

- Sesgos: el modelo puede heredar sesgos presentes en los datos de entrenamiento. No se han publicado evaluaciones específicas de sesgos para esta conversión.
- Alucinaciones: al ser un modelo de 1B, el riesgo de alucinación es mayor que en modelos grandes, especialmente en tareas de razonamiento complejo.
- Limitaciones de contexto: la ventana de entrada es de 32K tokens en el modelo 1B (no 128K como en las variantes superiores) y la salida está limitada a 8.192 tokens.
- Idiomas: aunque soporta más de 140 idiomas, la calidad en idiomas de bajos recursos puede ser inferior, y no se han realizado evaluaciones específicas.
- Licencia: la licencia Gemma de Google impone condiciones de uso responsable. Debe revisarse antes de un despliegue comercial; no es Apache 2.0 ni MIT.
- Veracidad del repositorio: es una conversión de un tercero (Aliados) sin descargas ni likes. No ha sido validada por la comunidad ni por Google. Además, el nombre "int4-awq" puede inducir a error, ya que la cuantización no fue realizada con AWQ; es un checkpoint QAT INT4 Flax adaptado a formato AWQ.
- Posibles problemas de compatibilidad: el formato de cuantización AWQ puede requerir versiones específicas de vLLM o TGI, y no se garantiza la misma calidad o comportamiento que el checkpoint original.

## Enlaces

- Repositorio principal: [https://huggingface.co/Aliados/gemma-3-1b-it-int4-awq](https://huggingface.co/Aliados/gemma-3-1b-it-int4-awq)
- Modelo base: [https://huggingface.co/google/gemma-3-1b-it](https://huggingface.co/google/gemma-3-1b-it)
- Colección de Google con QAT INT4 GGUFs: [https://huggingface.co/collections/google/gemma-3-qat-67ee61ccacbf2be4195c265b](https://huggingface.co/collections/google/gemma-3-qat-67ee61ccacbf2be4195c265b)
- Repositorio similar de gaunernst (AWQ): [https://huggingface.co/gaunernst/gemma-3-1b-it-int4-awq](https://huggingface.co/gaunernst/gemma-3-1b-it-int4-awq)
- Repositorio similar de gaunernst (INT4): [https://huggingface.co/gaunernst/gemma-3-1b-it-int4](https://huggingface.co/gaunernst/gemma-3-1b-it-int4)
- Documentación de Gemma: [https://ai.google.dev/gemma/docs/core](https://ai.google.dev/gemma/docs/core)
- Reporte técnico de Gemma 3: [https://goo.gle/Gemma3Report](https://goo.gle/Gemma3Report)
