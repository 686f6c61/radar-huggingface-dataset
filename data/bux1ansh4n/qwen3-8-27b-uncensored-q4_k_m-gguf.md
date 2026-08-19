# bux1ansh4n/Qwen3.8-27B-Uncensored-Q4_K_M-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF en formato Q4_K_M del modelo Qwen3.8-27B-Uncensored, publicada por el usuario bux1ansh4n. El modelo base, desarrollado por el equipo de Qwen (Alibaba), es una variante "uncensored" del Qwen3.8-27B, que según la documentación oficial (Unsloth, AMD, Yottalabs) incorpora capacidades de visión, razonamiento avanzado y una ventana de contexto de 256K tokens, con licencia Apache 2.0. Esta cuantización reduce el peso del modelo a 16,8 GB, lo que permite su ejecución en hardware de consumo con requisitos de memoria moderados, manteniendo un equilibrio entre calidad y eficiencia. La relevancia actual radica en la creciente demanda de modelos de gran tamaño ejecutables localmente, y esta versión GGUF facilita el despliegue en entornos con GPUs de 16-24 GB de VRAM o incluso en CPU con suficiente RAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (según documentación del modelo base; no se especifica en este repo) |
| Parametros totales | 27.320.697.856 (~27,3 mil millones) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 256K tokens (según documentación del modelo base; no confirmado para esta cuantización) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero no se detalla en este repo) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo único de 16,8 GB) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna ni el proceso de entrenamiento del modelo base en los datos proporcionados. Según la documentación externa encontrada (Unsloth, AMD, Yottalabs), Qwen3.8-27B es un modelo denso (no se menciona MoE) con capacidades multimodales (visión y texto), entrenado con técnicas de razonamiento y ajuste para tareas de agente. La variante "Uncensored" suele implicar un ajuste adicional para eliminar restricciones de contenido, aunque no se especifican los métodos (RLHF, DPO, etc.) en la información disponible. Esta cuantización GGUF es una conversión del modelo original a formato de 4 bits (Q4_K_M) mediante imatrix, como indican las etiquetas del repositorio.

## Capacidades

- Generación de texto y chat conversacional multiuso.
- Razonamiento avanzado y resolución de problemas complejos (según documentación del modelo base).
- Capacidades de visión: puede procesar imágenes junto con texto (según Unsloth y Yottalabs).
- Soporte para tareas de agente (agentic coding) y uso de herramientas (tool calling), mencionado en la documentación de Unsloth.
- Multilingüe (el modelo base soporta múltiples idiomas, aunque no se detalla en este repo).
- Modo "uncensored": el modelo ha sido ajustado para reducir restricciones de contenido, lo que puede ser útil para casos de uso creativos o técnicos sin censura.

## Casos de uso

- Asistente de programación local: el modelo puede generar y revisar código, con soporte para agentes y tool calling, integrándose en entornos de desarrollo como VS Code o CLI.
- Chatbot de atención al cliente con contexto largo: gracias a su ventana de 256K tokens, puede mantener conversaciones extensas y recordar detalles de interacciones previas.
- Análisis de documentos extensos: procesar informes, contratos o artículos largos, extrayendo información y resumiendo contenido sin perder contexto.
- Generación de contenido creativo sin restricciones: la variante "uncensored" permite explorar temas que otros modelos bloquean, útil para escritura creativa o investigación.
- Prototipado rápido de aplicaciones de IA: al ser GGUF, se puede desplegar con Ollama, llama.cpp o LM Studio en equipos de desarrollo para pruebas locales.
- Investigación académica en procesamiento de lenguaje natural: el modelo base está disponible con licencia Apache 2.0, lo que facilita su uso en experimentos y estudios comparativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones de MMLU, HumanEval, GSM8K u otros estándares para esta cuantización específica ni para el modelo base en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q4_K_M ocupa 16,8 GB, por lo que se recomienda al menos 16 GB de VRAM para inferencia en GPU. Según Unsloth, el modelo base puede ejecutarse en 17 GB de RAM/VRAM combinados.
- GPU recomendadas: tarjetas con 16-24 GB de VRAM, como NVIDIA RTX 4080/4090, A4000, o GPUs AMD Radeon con soporte Day 0 (según el blog de AMD).
- En CPU: es posible ejecutarlo con 32 GB de RAM o más, aunque la velocidad será menor.
- Opciones de despliegue: compatible con llama.cpp, Ollama, LM Studio, Unsloth (GGUF) y otros motores que soporten formato GGUF.
- Latencia y throughput: no se han proporcionado datos específicos; dependerán del hardware y del backend utilizado.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de la misma categoría. Se puede mencionar que existen otras cuantizaciones de Qwen3.8-27B (por ejemplo, la de JonathanColetti) y modelos similares como Qwen2.5-27B o Llama-3.1-8B, pero no se tienen datos concretos de rendimiento o parámetros para esta comparativa en la información proporcionada. Se recomienda consultar benchmarks públicos para evaluar alternativas.

## Limitaciones y advertencias

- Al ser una cuantización Q4_K_M, puede haber una ligera pérdida de calidad en comparación con el modelo en precisión completa (FP16/BF16), especialmente en tareas de razonamiento complejo.
- La naturaleza "uncensored" implica que el modelo puede generar contenido inapropiado, ofensivo o peligroso; se debe usar con responsabilidad y en entornos controlados.
- No se dispone de información sobre sesgos específicos del modelo, pero al ser un modelo de gran tamaño, es probable que herede sesgos de sus datos de entrenamiento.
- La licencia Apache 2.0 permite uso comercial y modificación, pero se deben respetar los términos de atribución.
- La ventana de contexto de 256K tokens es una característica del modelo base; en esta cuantización, el rendimiento puede verse afectado por la memoria disponible y la implementación de atención.
- No se han publicado resultados de benchmarks ni evaluaciones de seguridad para esta cuantización específica.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/bux1ansh4n/Qwen3.8-27B-Uncensored-Q4_K_M-GGUF
- Documentación de Unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Blog de AMD sobre soporte para Qwen3.8 27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Guía de Yottalabs para ejecutar Qwen3.8 27B localmente: https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Repositorio similar de cuantización GGUF: https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored-GGUF
