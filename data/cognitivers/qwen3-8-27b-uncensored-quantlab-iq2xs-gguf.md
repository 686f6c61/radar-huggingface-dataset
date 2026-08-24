# cognitivers/Qwen3.8-27B-Uncensored-quantlab-IQ2XS-GGUF

## Resumen

El modelo `cognitivers/Qwen3.8-27B-Uncensored-quantlab-IQ2XS-GGUF` es una cuantización en formato GGUF de la versión "uncensored" del modelo Qwen3.8-27B, desarrollada por el usuario HauhauCS y posteriormente reempaquetada por cognitivers. La versión original del modelo base es un Qwen3.8-27B, que según los tags de HuggingFace emplea una arquitectura híbrida con Gated-Deltanet (referencia arXiv:2505.11574) y soporta una ventana de contexto nativa de 262 144 tokens. La particularidad de esta variante es que ha sido sometida a un proceso de abliteración, que elimina las direcciones de rechazo del modelo para reducir la censura y permitir respuestas más abiertas.

El archivo IQ2XS-GGUF es una cuantización de muy baja precisión (2 bits) optimizada mediante imatrix, pensada para ejecutarse en entornos con recursos limitados, como equipos de consumo o GPUs con poca memoria. Se distribuye bajo licencia Apache 2.0, heredada del modelo base, y está orientada a la generación de texto en inglés y chino, aunque los idiomas exactos no están especificados en el repositorio. Este modelo es relevante para desarrolladores que necesitan una versión desinhibida de Qwen3.8-27B con un contexto largo y una huella de memoria reducida, aunque la cuantización extrema implica una pérdida notable de calidad en la generación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida con Gated-Deltanet (referencia arXiv:2505.11574) |
| Parámetros totales | 27 000 millones (27B) |
| Parámetros activos | No aplicable (modelo denso) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantización | IQ2_XS (imatrix) |
| Idiomas soportados | No disponible (probablemente inglés, chino y otros, según el modelo base) |
| Licencia | Apache 2.0 (según el blog de OrcaRouter; en HuggingFace figura como "no disponible") |
| Formato de pesos | GGUF (safetensors no aplicable) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, que emplea una arquitectura híbrida que combina mecanismos de atención clásicos con capas de Gated-Deltanet, una variante de redes recurrentes lineales que permite procesar secuencias largas de forma eficiente. El contexto nativo es de 262 144 tokens, lo que lo hace adecuado para tareas que requieren comprensión de documentos extensos o conversaciones de múltiples turnos.

La versión "uncensored" se obtiene mediante un proceso de abliteración, que consiste en identificar y eliminar las direcciones del espacio de activaciones asociadas a la negativa a responder a solicitudes controvertidas. Este procedimiento se aplica sobre los pesos del modelo base, sin necesidad de reentrenamiento adicional. Posteriormente, el archivo GGUF fue generado mediante cuantización con imatrix (IQ2_XS), un esquema de 2 bits que optimiza la asignación de precisión según la importancia de cada capa. No se dispone de detalles sobre el dataset de entrenamiento del modelo base, aunque se sabe que Qwen3.8-27B fue entrenado con datos multilingües y de código, con un total de tokens no publicado.

## Capacidades

- Generación de texto libre en formato conversacional y de instrucciones.
- Razonamiento complejo y resolución de problemas matemáticos (capacidad heredada del modelo base).
- Generación de código en múltiples lenguajes de programación.
- Comprensión de contexto largo gracias a su ventana de 262 144 tokens.
- Soporte de *function calling* y *tool calling* (según las capacidades del Qwen3.8-27B original).
- Capacidad de *multi-step reasoning* y ejecución de tareas de agente.
- Capacidades multilingües, aunque no se especifican los idiomas exactos en el repositorio.
- La versión abliterada reduce la censura, permitiendo respuestas más abiertas en temas sensibles, aunque con posible pérdida de precisión.

## Casos de uso

- **Asistente de conversación desinhibido**: el modelo puede mantener diálogos largos y abiertos sin filtros de contenido, útil para proyectos de investigación sobre comportamiento de LLM en entornos sin restricciones.
- **Generación de código en entornos locales**: con la cuantización IQ2_XS, cabe en GPUs de consumo (por ejemplo, RTX 3060 con 12 GB) y puede integrarse en editores de código para autocompletado o generación de funciones.
- **Procesamiento de documentos largos**: su contexto de 262 144 tokens permite resumir o extraer información de documentos técnicos completos (manuales, informes) en una sola pasada.
- **Chatbot para pruebas de producto**: dado su carácter "uncensored", sirve para probar respuestas en escenarios donde se requiere contenido no filtrado, como en la generación de diálogos para juegos o narrativas.
- **Investigación sobre alineación y seguridad**: el modelo abliterado sirve como caso de estudio para comparar el comportamiento de un LLM con y sin censura, en entornos académicos.
- **Despliegue en entornos sin GPU**: al ser un GGUF de baja precisión, puede ejecutarse en CPU mediante llama.cpp o llama-cpp-python, aunque con velocidad reducida, para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La cuantización IQ2_XS (2 bits) degrada significativamente el rendimiento respecto al modelo original, por lo que los resultados de MMLU, HumanEval, GSM8K u otras pruebas no estarían disponibles ni serían comparables sin datos adicionales.

## Requisitos de hardware

- **VRAM estimada**: para 27B parámetros en IQ2_XS, se estima un uso de memoria de aproximadamente 8-10 GB, dependiendo del contexto y de la implementación. Sin embargo, no hay datos oficiales.
- **GPU recomendadas**: puede ejecutarse en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores. No se requiere una GPU de datacenter.
- **Compatibilidad**: es compatible con llama.cpp, Ollama, llama-cpp-python y otros motores que soporten GGUF.
- **Latencia y throughput**: no se proporcionan datos. La cuantización extrema reduce el tamaño de los pesos, lo que permite mayor velocidad de inferencia en hardware modesto, pero la degradación de calidad puede ser notable.

## Comparativa con modelos similares

No se dispone de datos concretos para comparar con otros modelos de la misma categoría. Se podrían considerar alternativas como:

| Modelo | Parámetros | Contexto | Cuantización | Licencia |
|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-FP8 | 27B | 262 144 | FP8 | Apache 2.0 |
| Qwen3.8-27B-Uncensored (GGUF) | 27B | 262 144 | No especificado | Apache 2.0 |
| Qwen3.8-27B (original) | 27B | 262 144 | No aplica | Apache 2.0 |

Sin embargo, no hay datos de rendimiento para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- La cuantización IQ2_XS (2 bits) introduce una pérdida significativa de calidad en la generación, especialmente en tareas de razonamiento complejo y código.
- El proceso de abliteración puede degradar el rendimiento en tareas que requieren precisión o adherencia a instrucciones de seguridad.
- Al ser un modelo "uncensored", puede generar contenido inapropiado, ofensivo o dañino. No es adecuado para entornos de producción donde se requiera moderación de contenido.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base original para asegurarse de que no haya restricciones adicionales.
- La información sobre idiomas soportados no está disponible en el repositorio, por lo que el comportamiento multilingüe no está garantizado.
- El contexto de 262 144 tokens es amplio, pero con la cuantización extrema, la capacidad de mantener coherencia a lo largo de secuencias largas puede verse comprometida.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/cognitivers/Qwen3.8-27B-Uncensored-quantlab-IQ2XS-GGUF)
- [Artículo de Orca Router: Qwen 3.8 27B Uncensored Local](https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally)
- [Artículo de Orca Router: Qwen3.8-27B Uncensored GGUF](https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf)
- [Repositorio original de JonathanColetti/Qwen3.8-27B-Uncensored](https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored)
- [Repositorio GitHub qwen38-uncensored](https://github.com/unburdened-jackinthebox365/qwen38-uncensored)
- [Repositorio GGUF de OrcaRouter](https://huggingface.co/chimingw/Qwen3.8-27B-Uncensored-OrcaRouter-GGUF)
