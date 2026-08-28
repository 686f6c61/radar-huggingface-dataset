# salohcin714/granite-4.2-30b-nvfp4-mlx

## Resumen

Este repositorio contiene una conversión no oficial del modelo **Granite 4.2 30B** de IBM al formato **MLX**, cuantizado con **NVFP4** (cuantización de punto flotante microscaling de 4 bits, estilo Nvidia). El autor, `salohcin714`, ha convertido los pesos originales de `ibm-granite/granite-4.2-30b` utilizando la librería `mlx-lm` 0.31.3, sin realizar fine-tuning ni añadir datos de entrenamiento. El resultado es un artefacto optimizado para ejecutarse en hardware Apple Silicon (chips M1, M2, M3, M4 y sucesores) mediante el ecosistema MLX.

El modelo base, Granite 4.2, es una familia de modelos de lenguaje densos (decoder-only) desarrollada por IBM, disponible en tamaños de 3B, 8B y 30B parámetros. Granite 4.2 introduce capacidades nativas de razonamiento (thinking), lo que permite al modelo realizar cadenas de pensamiento paso a paso antes de emitir una respuesta final. Esta conversión concreta reduce el tamaño de los pesos a 4 bits, lo que facilita su despliegue en equipos con memoria unificada limitada, aunque el número de parámetros reportado en el repositorio (7.319.588.864) es notablemente inferior al del modelo original (30B), probablemente debido a la representación cuantizada de los tensores.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (según IBM Granite 4.2) |
| Parametros totales | 7.319.588.864 (según el repo; el modelo base original tiene 30B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 (microscaling floating-point de 4 bits, redondeo al más cercano, sin calibración) |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh (12 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo original, Granite 4.2 30B, es un transformer decoder-only denso desarrollado por IBM, post-entrenado sobre los modelos base Granite 4.1. IBM describe esta familia como modelos de razonamiento con capacidad de "thinking" nativa, es decir, pueden generar cadenas de razonamiento internas antes de dar la respuesta final. No se dispone de detalles específicos sobre el número de tokens de entrenamiento, la composición del dataset o el uso de técnicas como RLHF o DPO en la información proporcionada.

La conversión aquí presentada no modifica la arquitectura subyacente. El autor ha transformado los pesos al formato MLX safetensors y los ha cuantizado a NVFP4 mediante redondeo al más cercano, sin calibración. Se eliminó el `lm_head.weight` redundante cuando el modelo ata las embeddings de entrada y salida. No se ha realizado ningún fine-tuning ni se ha añadido información de entrenamiento adicional.

## Capacidades

- Generación de texto y conversación multilingüe en 12 idiomas (inglés, alemán, español, francés, japonés, portugués, árabe, checo, italiano, coreano, neerlandés y chino).
- Razonamiento paso a paso (thinking mode) según las especificaciones de IBM Granite 4.2, que permite al modelo desglosar problemas complejos antes de responder.
- Capacidad de procesamiento de instrucciones en formato conversacional mediante plantillas de chat (chat template).
- Al ser una conversión MLX, está optimizado para ejecución en Apple Silicon con aceleración por hardware unificado.
- No se especifican capacidades adicionales como tool calling, function calling, visión o audio en la información disponible.

## Casos de uso

- Asistente de programación local en Mac: un desarrollador puede ejecutar este modelo en su MacBook con chip M-series para obtener ayuda con generación de código, depuración y explicaciones técnicas sin depender de servicios en la nube, gracias a la cuantización de 4 bits que reduce los requisitos de memoria.
- Análisis de documentos con razonamiento: al ser un modelo de razonamiento, puede procesar textos largos (contratos, informes, artículos) y extraer conclusiones o resúmenes con cadenas de pensamiento, útil para entornos legales o de consultoría.
- Chatbot multilingüe para atención al cliente: con soporte para 12 idiomas, puede desplegarse como agente conversacional en empresas que atienden a usuarios de diversas regiones, manteniendo el contexto de la conversación.
- Generación de contenido creativo: redacción de artículos, guiones o material de marketing en varios idiomas, aprovechando la capacidad de razonamiento para estructurar argumentos coherentes.
- Herramienta educativa de matemáticas y lógica: el modo de razonamiento permite resolver problemas matemáticos paso a paso, útil para plataformas de tutoría o asistentes de estudio.
- Prototipado de agentes autónomos: aunque no se confirma soporte de tool calling, su capacidad de razonamiento multi-paso lo hace adecuado para experimentar con pipelines de agentes que requieren planificación y ejecución secuencial en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor del repositorio advierte explícitamente que los benchmarks publicados por IBM corresponden a los pesos originales, no a esta versión cuantizada, y no deben interpretarse como afirmaciones sobre este artefacto.

## Requisitos de hardware

- Al ser un modelo en formato MLX, requiere un dispositivo con Apple Silicon (M1, M2, M3, M4 o posteriores).
- El tamaño del repositorio es de 16.5 GB, por lo que se estima que necesita al menos esa cantidad de memoria unificada para cargar los pesos en RAM. No se dispone de una cifra oficial de VRAM.
- Para una Mac con 16 GB de memoria unificada, el modelo podría caber con margen limitado; se recomienda 32 GB o más para operar con comodidad.
- Opciones de despliegue: mediante la librería `mlx-lm` (carga y generación en Python), o a través de herramientas compatibles con MLX como `mlx-lm` CLI. No se menciona soporte para vLLM, llama.cpp u Ollama en esta conversión.
- La latencia y el throughput dependen del chip concreto (M1 Pro, M2 Max, etc.) y no se han publicado datos específicos para esta cuantización.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos alternativos de la misma categoría (conversiones MLX de modelos de 30B cuantizados a 4 bits). El repositorio no incluye datos de rendimiento ni comparaciones con otras conversiones. Se recomienda consultar el modelo base original y otras conversiones de la familia Granite 4.2 para evaluar diferencias.

## Limitaciones y advertencias

- Este repositorio no está afiliado ni respaldado por IBM. "Granite" es una marca comercial de IBM, utilizada aquí de forma descriptiva.
- La cuantización NVFP4 puede introducir una degradación en la calidad de las respuestas en comparación con los pesos originales en precisión completa, aunque no se han cuantificado los efectos.
- No se han publicado benchmarks específicos para esta versión cuantizada; los resultados de IBM corresponden al modelo original y no son aplicables directamente.
- El número de parámetros reportado en el repositorio (7.3B) difiere del modelo base (30B), lo que puede deberse a la representación cuantizada; los usuarios deben tener en cuenta esta discrepancia.
- Requiere hardware Apple Silicon; no es compatible con GPUs NVIDIA o AMD sin una conversión adicional.
- La licencia Apache 2.0 permite uso comercial, pero se debe respetar la atribución y las restricciones de marca de IBM.

## Enlaces

- Repositorio HuggingFace: [salohcin714/granite-4.2-30b-nvfp4-mlx](https://huggingface.co/salohcin714/granite-4.2-30b-nvfp4-mlx)
- Modelo base original: [ibm-granite/granite-4.2-30b](https://huggingface.co/ibm-granite/granite-4.2-30b)
- Documentación oficial de IBM Granite 4.2: [https://www.ibm.com/granite/docs/models/granite4-2](https://www.ibm.com/granite/docs/models/granite4-2)
- Repositorio GitHub de IBM Granite 4.2: [https://github.com/ibm-granite/granite-4.2-language-models](https://github.com/ibm-granite/granite-4.2-language-models)
- Artículo de Ars Technica sobre Granite 4.2: [https://arstechnica.com/ai/2026/08/ibms-new-granite-4-2-models-ride-the-wave-of-interest-in-local-llms/](https://arstechnica.com/ai/2026/08/ibms-new-granite-4-2-models-ride-the-wave-of-interest-in-local-llms/)
