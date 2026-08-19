# scalejade/qwen-sea-lion-v4.5-27b-it

## Resumen

Qwen-SEA-LION-v4.5-27B-IT es un modelo de lenguaje de 27 000 millones de parámetros desarrollado por AI Singapore, especializado en las lenguas del Sudeste Asiático. Se construye sobre la arquitectura densa Qwen3.6-27B, que incorpora un diseño híbrido de atención lineal y atención completa, lo que permite manejar ventanas de contexto de hasta 262 000 tokens de forma nativa. El modelo ha sido sometido a un proceso de preentrenamiento continuado sobre el corpus SEA-Pile v2 y posterior ajuste por instrucciones, orientado a tareas de razonamiento multilingüe, generación de texto y codificación a nivel de repositorio.

La versión publicada en el repositorio `scalejade/qwen-sea-lion-v4.5-27b-it` es una copia del modelo oficial de AI Singapore, que se distribuye bajo licencia MIT y soporta diez idiomas de la región (birmano, indonesio, malayo, filipino, tamil, tailandés, vietnamita, jemer, lao y mandarín) además de inglés. El modelo incluye un modo de pensamiento explícito (`enable_thinking`) y una variante con decodificador especulativo para acelerar la inferencia. Su relevancia actual radica en ser una de las pocas opciones de código abierto con cobertura profunda de lenguas del Sudeste Asiático y contexto ultralargo, lo que lo hace idóneo para aplicaciones regionales de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Densa, híbrida de atención lineal y completa (Qwen3.6-27B) |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (nativo) |
| Tipos de cuantizacion | No listados oficialmente; disponible en GGUF a través de Ollama (cuantizaciones estándar Q4_K_M, Q5_K_M, etc.) |
| Idiomas soportados | Birmano, inglés, indonesio, jemer, lao, malayo, mandarín, tagalo, tamil, tailandés y vietnamita |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 80,2 GB, probablemente BF16) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.6-27B, una arquitectura densa que combina capas de atención lineal y atención completa (hybrid Linear and Full Attention). Este diseño reduce el coste computacional en contextos largos manteniendo la calidad de representación. El tokenizador es el mismo que el de Qwen3, lo que garantiza cobertura de los caracteres de los idiomas SEA y chino.

El entrenamiento consistió en un preentrenamiento continuado sobre aproximadamente 100 000 millones de tokens del corpus SEA-Pile v2 (según la documentación de la versión v4; para v4.5 no se han publicado cifras exactas), seguido de un ajuste por instrucciones con un conjunto de datos de alta calidad de unos 8 millones de pares pregunta-respuesta. El proceso de post-entrenamiento incluye ajuste fino supervisado y fusión de modelos. El modelo soporta dos modos de generación: no-pensamiento (por defecto) y pensamiento explícito, activable mediante `enable_thinking=True`. Además, existe una variante con decodificador especulativo (SpecDecoder) que acelera la generación sin degradar la calidad.

## Capacidades

- Generación de texto multilingüe en 10 idiomas del Sudeste Asiático más inglés y mandarín, con especial énfasis en variedades locales y expresiones coloquiales.
- Razonamiento multi-turno y modo de pensamiento explícito, que permite desglosar problemas complejos antes de responder.
- Codificación a nivel de repositorio, adaptada a convenciones y documentación regionales.
- Soporte de tool calling y function calling, heredado de la base Qwen3.6 (no verificado explícitamente en la documentación, pero esperable).
- Manejo de contexto ultralargo (262K tokens), adecuado para documentos extensos, conversaciones largas y análisis de repositorios completos.
- Capacidad de traducción bidireccional entre inglés y las lenguas SEA, así como entre lenguas SEA entre sí.
- No se ha confirmado capacidad multimodal (visión o audio) en la documentación oficial; se trata de un modelo de texto únicamente.

## Casos de uso

- Atención al cliente automatizada en mercados del Sudeste Asiático: el modelo gestiona conversaciones multi-turno en idiomas como tailandés, vietnamita o indonesio con contexto de hasta 262K tokens, lo que permite mantener el historial completo de una interacción larga sin truncamientos.
- Traducción automática de contenido corporativo: adecuado para localizar manuales, sitios web y documentación técnica entre inglés y las lenguas SEA, con conocimiento de matices culturales regionales.
- Generación de contenido localizado para marketing y redes sociales: produce textos en tagalo, malayo o birmano con registro apropiado para audiencias locales.
- Asistente de programación con contexto de repositorio completo: gracias a su ventana de 262K tokens y su adaptación a codificación a nivel de repositorio, puede analizar proyectos enteros y sugerir cambios o detectar errores.
- Análisis de sentimiento y moderación de contenido en plataformas sociales: procesa grandes volúmenes de texto en idiomas SEA para identificar opiniones, toxicidad o tendencias.
- Educación y tutoría multilingüe: responde preguntas de estudiantes en su lengua materna y puede explicar conceptos complejos con razonamiento paso a paso.
- Búsqueda y recuperación de información en documentos largos: indexa y resume informes, actas o expedientes legales en lenguas regionales sin perder detalles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación menciona que el modelo se evalúa con el benchmark SEA-HELM (arXiv:2502.14301), que cubre tareas de comprensión lectora, análisis de sentimiento, detección de toxicidad y traducción, pero no se proporcionan cifras concretas en los materiales consultados.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: ~54 GB (27B × 2 bytes). En FP8: ~27 GB. En cuantización 4-bit (GGUF Q4_K_M): ~14 GB.
- GPU recomendadas: A100 80GB, H100 80GB, o RTX 4090 24GB (esta última solo con cuantización 4-bit u 8-bit).
- En consumer GPU: cabe en RTX 4090 y RTX 3090 (24GB) con cuantización 4-bit; en GPUs de 16GB (RTX 4080, 4070 Ti) puede ser ajustado con cuantización más agresiva (Q3_K_S) pero con pérdida de calidad.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI), llama.cpp, Ollama (disponible en el registro de Ollama).
- Latencia y throughput: no disponibles en la documentación. Se espera que la variante SpecDecoder ofrezca una aceleración significativa en la generación especulativa, aunque no se cuantifica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas SEA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-SEA-LION-v4.5-27B-IT | 27B | 262K | 10 | MIT | HuggingFace, Ollama |
| Qwen-SEA-LION-v4-32B-IT | 32B | 32K | 7 (birmano, indonesio, malayo, filipino, tamil, tailandés, vietnamita) | MIT | HuggingFace |
| Qwen3-32B | 32B | 32K (ampliable a 128K) | Solo inglés y chino (multilingüe general) | Apache 2.0 | HuggingFace |
| SeaLLM-7B-v2 | 7B | 32K | 8 (indonesio, tailandés, vietnamita, malayo, tagalo, birmano, jemer, lao) | CC-BY-NC-4.0 | HuggingFace |

La comparación muestra que Qwen-SEA-LION-v4.5-27B-IT ofrece el mayor contexto de su categoría (262K) y la licencia más permisiva (MIT), superando a la versión v4 en longitud de contexto y a SeaLLM en tamaño y cobertura. Sin embargo, no se dispone de benchmarks comparativos publicados para verificar el rendimiento relativo.

## Limitaciones y advertencias

- El modelo no ha sido alineado para seguridad: no se ha sometido a un proceso de RLHF con criterios de seguridad, por lo que puede generar contenido dañino, sesgado o inapropiado si se le solicita.
- Riesgo de alucinación: como la mayoría de los LLM, puede inventar hechos, citas o referencias no veraces, especialmente en contextos largos o poco conocidos.
- No ha sido probado contra ataques adversariales: la documentación advierte que no se ha evaluado su robustez frente a prompts maliciosos.
- Limitación de idiomas: aunque cubre 10 lenguas SEA, no incluye otras lenguas regionales como el javanés, el cebuano o el hmong, y su rendimiento en variantes dialectales puede ser inferior.
- La ventana de 262K tokens puede degradar el rendimiento en los tramos finales del contexto; se recomienda validar la calidad de la atención en documentos muy largos.
- El repositorio `scalejade/qwen-sea-lion-v4.5-27b-it` es una copia de terceros; para uso en producción se recomienda utilizar el repositorio oficial `aisingapore/Qwen-SEA-LION-v4.5-27B-IT` para garantizar la integridad de los pesos.
- No se han publicado resultados de benchmarks independientes, por lo que las afirmaciones de rendimiento deben tomarse con cautela.

## Enlaces

- Repositorio HuggingFace (copia de scalejade): https://huggingface.co/scalejade/qwen-sea-lion-v4.5-27b-it
- Repositorio HuggingFace oficial (AI Singapore): https://huggingface.co/aisingapore/Qwen-SEA-LION-v4.5-27B-IT
- Documentación oficial SEA-LION v4.5: https://docs.sea-lion.ai/models/sea-lion-v4.5/qwen-sea-lion-v4.5
- Página principal de SEA-LION v4.5: https://docs.sea-lion.ai/models/sea-lion-v4.5
- GitHub (documentación y ejemplos): https://github.com/aisingapore/sealion/blob/main/models/sea-lion-v4.5/qwen-sea-lion-v4.5.md
- Página en Ollama: https://ollama.com/aisingapore/Qwen-SEA-LION-v4.5-27B-IT
- Paper de SEA-HELM (benchmark): https://arxiv.org/abs/2502.14301
