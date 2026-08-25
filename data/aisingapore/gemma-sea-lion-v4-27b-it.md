# aisingapore/Gemma-SEA-LION-v4-27B-IT

## Resumen

Gemma-SEA-LION-v4-27B-IT es un modelo de lenguaje de gran tamaño desarrollado por el AI Products Pillar de AI Singapore, dentro de la familia SEA-LION (Southeast Asian Languages In One Network). Se trata de una versión instruida (instruction-tuned) del modelo base Gemma-SEA-LION-v4-27B, que a su vez es una adaptación de Gemma 3 27B de Google con entrenamiento continuado en idiomas del Sudeste Asiático. El post-entrenamiento se realizó sobre aproximadamente 10 millones de pares de preguntas y respuestas en birmano, inglés, indonesio, khmer, lao, malayo, tagalo, tamil, tailandés y vietnamita, lo que lo convierte en una opción relevante para aplicaciones multilingües en esa región.

El modelo hereda de Gemma 3 una ventana de contexto de 128.000 tokens, capacidades de comprensión de imagen y texto (incluyendo lectura de documentos, respuesta visual a preguntas y razonamiento sobre imágenes), así como soporte avanzado de function calling y salidas estructuradas. Con 27.432 millones de parámetros, se posiciona como un modelo de tamaño medio-grande que, según sus desarrolladores, supera a otros modelos abiertos de menos de 200.000 millones de parámetros en tareas específicas del Sudeste Asiático, con un rendimiento comparable al de modelos cerrados de mayor tamaño. La licencia es la de Gemma Terms of Use, que permite uso comercial bajo ciertas condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only basado en Gemma 3 (transformer) |
| Parametros totales | 27.432.406.640 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | No disponible (el repositorio publica pesos en safetensors, bfloat16) |
| Idiomas soportados | Birmano, ingles, indonesio, khmer, lao, malayo, mandarin, tagalo, tamil, tailandes, vietnamita (ademas de los heredados de Gemma 3, que cubre mas de 100 idiomas) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Gemma 3 27B, un transformer decoder-only con atención multi-consulta y ventana de contexto de 128.000 tokens. El proceso de entrenamiento consta de dos fases: primero, el modelo base Gemma-SEA-LION-v4-27B se obtuvo mediante entrenamiento continuado sobre aproximadamente 500.000 millones de tokens muestreados de un conjunto de más de un billón de tokens en 11 idiomas del Sudeste Asiático. Posteriormente, para crear la versión IT, se realizó un post-entrenamiento con datasets de instrucciones como SEA-Instruct, Infinity-Instruct y OpenMath-Instruct 2, complementados con datasets de RL como nvidia/Llama-Nemotron-Post-Training-Dataset y zwhe99/DeepMath-103K, utilizando pares rechazados-elegidos para alineación. No se especifican detalles sobre el uso de RLHF o DPO, pero la mención de pares rechazados-elegidos sugiere un enfoque de optimización por preferencias.

El tokenizador es el mismo que el de Gemma 3 27B IT, por lo que no se introdujeron cambios en la segmentación de tokens. Las capacidades de visión se heredan directamente de Gemma 3, ya que el entrenamiento adicional se centró exclusivamente en el backend de texto.

## Capacidades

- Generación de texto y razonamiento multilingüe, con especial énfasis en idiomas del Sudeste Asiático (birmano, indonesio, khmer, lao, malayo, tagalo, tamil, tailandés, vietnamita, además de inglés y mandarín).
- Comprensión de imágenes y texto: lectura de documentos, respuesta visual a preguntas y razonamiento basado en imágenes, heredado de Gemma 3 27B IT.
- Function calling y salidas estructuradas, lo que permite integración en sistemas más grandes y flujos de trabajo automatizados.
- Ventana de contexto de 128.000 tokens, adecuada para tareas que requieren procesar documentos largos o conversaciones multi-turno extensas.
- Capacidades matemáticas y de código, reforzadas mediante datasets como OpenMath-Instruct 2 y DeepMath-103K.
- Soporte de agentes y razonamiento multi-paso, gracias a la combinación de function calling y contexto largo.

## Casos de uso

- Atención al cliente multilingüe en el Sudeste Asiático: el modelo puede gestionar conversaciones multi-turno en tailandés, vietnamita, indonesio o tagalo, con una ventana de 128.000 tokens que permite mantener el historial completo de la interacción. Su soporte de function calling facilita la integración con sistemas de ticketing o bases de conocimiento.
- Generación de contenido localizado: redacción de artículos, publicaciones en redes sociales o materiales de marketing en idiomas como malayo, khmer o birmano, con un registro culturalmente apropiado gracias al entrenamiento específico en la región.
- Traducción y transcreación: traducción automática entre idiomas del Sudeste Asiático y el inglés, con capacidad de manejar documentos extensos de una sola pasada gracias al contexto largo.
- Análisis de documentos con visión: extracción de información de facturas, formularios o contratos escaneados en idiomas locales, combinando la comprensión de imágenes heredada de Gemma 3 con el conocimiento lingüístico regional.
- Asistentes de código para equipos de desarrollo en la región: generación y revisión de código con comentarios y documentación en idiomas locales, aprovechando el entrenamiento en datasets de instrucciones y matemáticas.
- Educación y tutoría: creación de materiales didácticos, ejercicios de práctica y explicaciones en tailandés, vietnamita o indonesio, con capacidad de adaptar el nivel de detalle según el estudiante.
- Agentes conversacionales para comercio electrónico: recomendación de productos, seguimiento de pedidos y resolución de incidencias en múltiples idiomas, con integración mediante function calling a APIs de backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma que el modelo "sobresale en tareas del Sudeste Asiático comparado con otros modelos abiertos de menos de 200.000 millones de parámetros" y que demuestra "rendimiento comparable al de modelos cerrados más grandes", pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otros benchmarks. Se remite al leaderboard de SEA-LION (https://leaderboard.sea-lion.ai/) para consultar rankings detallados, pero esos datos no están incluidos en la información facilitada.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 27.432 millones de parámetros. En bfloat16 (formato de los pesos publicados), ocupa aproximadamente 54,9 GB, por lo que se necesitan al menos 80 GB de VRAM para cargarlo sin cuantización. Con cuantización de 8 bits, la huella se reduce a unos 28-30 GB, y con 4 bits a unos 14-16 GB, aunque no se han publicado pesos cuantizados oficiales.
- GPU recomendadas: para inferencia en bfloat16, se requieren GPUs de clase profesional como NVIDIA A100 80GB, H100 80GB o A6000 48GB (con dos unidades). Para cuantización de 8 bits, una RTX 4090 (24 GB) o RTX 6000 Ada (48 GB) pueden ser suficientes. Con cuantización de 4 bits, cabría en GPUs consumer de 16 GB como la RTX 4080 o 4070 Ti Super.
- Opciones de despliegue: compatible con el ecosistema de Hugging Face Transformers, así como con servidores de inferencia como vLLM, Text Generation Inference (TGI) y llama.cpp (si se generan pesos GGUF). También puede desplegarse mediante Ollama si se convierte el modelo.
- Latencia y throughput: no se han publicado datos específicos. Como referencia, un modelo de 27B en una A100 80GB con vLLM suele alcanzar un throughput de 20-40 tokens por segundo por petición, dependiendo del tamaño del lote y la longitud de la secuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas SEA | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma-SEA-LION-v4-27B-IT | 27,4B | 128k | 11 idiomas SEA + inglés + mandarín | Gemma Terms of Use | Post-entrenado específicamente para SEA |
| Gemma 3 27B IT | 27,4B | 128k | Más de 100 idiomas (incluye algunos SEA) | Gemma Terms of Use | Modelo base sin adaptación específica a SEA |
| Qwen2.5-27B-Instruct | 27,5B | 128k (con YaRN) | Multilingüe, incluye vietnamita, indonesio, tailandés | Apache 2.0 | Buen rendimiento general, pero sin enfoque específico en SEA |

La comparativa se basa en características generales conocidas de estos modelos, ya que no se dispone de resultados de benchmarks comparativos en la información proporcionada. El valor diferencial de Gemma-SEA-LION-v4-27B-IT reside en su entrenamiento específico en idiomas del Sudeste Asiático, que debería traducirse en mejor rendimiento en tareas en birmano, khmer, lao o tagalo, idiomas que otros modelos multilingües suelen cubrir de forma más limitada.

## Limitaciones y advertencias

- El modelo no ha sido alineado para seguridad. Los desarrolladores advierten explícitamente que no se ha realizado un ajuste de seguridad y que los usuarios deben llevar a cabo su propio fine-tuning de seguridad y medidas de protección antes de su uso en producción.
- Riesgo de alucinación: como muchos LLM, el modelo puede generar contenido ficticio o no fundamentado en el contexto proporcionado. Se recomienda validar las respuestas en aplicaciones críticas.
- No se ha probado su robustez frente a ataques adversariales (prompt injection, jailbreaks, etc.), lo que supone un riesgo adicional en entornos expuestos.
- Las capacidades de visión no han sido mejoradas respecto a Gemma 3 27B IT, ya que el entrenamiento adicional se centró exclusivamente en el texto. No se esperan mejoras significativas en tareas visuales.
- La licencia Gemma Terms of Use impone restricciones de uso comercial: no se permite su uso en aplicaciones que violen las políticas de uso prohibido de Google, y existen limitaciones sobre el uso de los modelos para entrenar otros modelos de lenguaje. Es necesario revisar los términos completos antes de su despliegue comercial.
- El modelo está optimizado para idiomas del Sudeste Asiático, por lo que su rendimiento en otros idiomas (especialmente los no cubiertos por Gemma 3) puede ser inferior al de modelos multilingües generales.
- El tamaño del modelo (27B parámetros) requiere infraestructura de hardware considerable para inferencia en producción, lo que puede ser una barrera para equipos pequeños.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aisingapore/Gemma-SEA-LION-v4-27B-IT
- Modelo base en Hugging Face: https://huggingface.co/aisingapore/Gemma-SEA-LION-v4-27B
- Repositorio GitHub de SEA-LION: https://github.com/aisingapore/sealion.git
- Documentación de SEA-LION v4: https://docs.sea-lion.ai/models/sea-lion-v4
- Documentación específica de Gemma-SEA-LION-v4-27B: https://docs.sea-lion.ai/models/sea-lion-v4/gemma-sea-lion-v4-27b
- Leaderboard de SEA-LION: https://leaderboard.sea-lion.ai/
- Gemma 3 27B IT (modelo base original): https://huggingface.co/google/gemma-3-27b-it
