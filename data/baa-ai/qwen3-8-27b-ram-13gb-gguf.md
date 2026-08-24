# baa-ai/Qwen3.8-27B-RAM-13GB-GGUF

## Resumen

El modelo baa-ai/Qwen3.8-27B-RAM-13GB-GGUF es una cuantización GGUF del modelo denso Qwen3.8-27B de Alibaba, preparada y validada por la empresa baa.ai. Su objetivo es ofrecer un lector de 27 000 millones de parámetros que quepa en una GPU con 16 GB de VRAM, manteniendo la fidelidad a la información recuperada en contexto (retrieval-grounded reading). Está diseñado para sistemas de generación aumentada por recuperación (RAG) donde los documentos recuperados son la fuente de verdad y el modelo debe interpretarlos sin recurrir a su propia memoria.

El modelo base Qwen3.8-27B emplea atención híbrida que solo cachea 16 de sus 64 capas, lo que reduce notablemente el consumo de memoria en contexto largo. Esta versión GGUF usa cuantización IQ3_M (3,73 bits promedio) y ocupa 12,6 GB, lo que permite ejecutarla en una GPU de 16 GB como la NVIDIA T4 (AWS g4dn.xlarge) con una ventana de contexto de 8K tokens. La licencia es Apache 2.0.

La relevancia actual del modelo reside en combinar un tamaño de 27B con requisitos de hardware modestos, sin sacrificar la fidelidad a los documentos recuperados. baa.ai ha validado esta propiedad con métricas de adherencia a la evidencia de 1,00 y de precisión de lectura desde el contexto de 1,00, lo que lo convierte en una opción práctica para sistemas RAG en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (cache solo 16 de 64 capas) |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible para el modelo base; la cuantización soporta 8K tokens con 16 GB de VRAM |
| Tipos de cuantizacion | IQ3_M (3,73 bits promedio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformador denso de 27 000 millones de parámetros con una innovación destacable: atención híbrida que solo cachea las claves y valores de 16 de sus 64 capas. Esto reduce de forma significativa el consumo de memoria durante la generación de contexto largo, permitiendo que cuantizaciones de 4 bits manejen ventanas de 32K a 64K tokens en una GPU de 24 GB. Los pesos se publicaron en agosto de 2026 bajo licencia Apache 2.0.

La cuantización GGUF de baa.ai está calibrada con imatrix y validada específicamente para tareas de lectura fiel y razonamiento multi-salto sobre documentos recuperados. Según la model card, no pierde nada de fidelidad frente al modelo de precisión completa: cuando un pasaje recuperado contradice el conocimiento previo del modelo, sigue el pasaje el 100 % de las veces y lee la respuesta correcta desde el contexto el 100 % de las veces. Los datos exactos de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información publicada.

## Capacidades

- Generación de texto y razonamiento de propósito general, con énfasis en la comprensión de documentos recuperados.
- Razonamiento multi-salto de 4 a 5 pasos con contexto largo, con precisión validada de 0,92 a 0,96.
- Adherencia a la evidencia recuperada: sigue los pasajes recuperados incluso cuando contradicen el conocimiento previo del modelo (deferencia de 1,00).
- Lectura de respuestas correctas desde el contexto con una precisión del 100 %.
- Compatibilidad con el ecosistema llama.cpp: llama-cli, llama-server (API compatible con OpenAI), Ollama, LM Studio y llama-cpp-python.
- No se documentan capacidades de visión, audio ni tool calling específicas en esta versión cuantizada.

## Casos de uso

- Generación aumentada por recuperación (RAG) de precisión: el modelo está validado para interpretar documentos recuperados como fuente de verdad, por lo que es adecuado en sistemas RAG que deben citar pasajes extraídos de una base de conocimiento corporativa sin desviarse de ellos.
- Atención al cliente automatizada: puede gestionar conversaciones multi-turno basándose en documentación interna o preguntas frecuentes, reduciendo alucinaciones cuando el documento recuperado contradice la respuesta que el modelo daría de memoria.
- Análisis de informes jurídicos y legales: permite extraer respuestas de contratos, expedientes o informes largos con fidelidad al texto original, útil para revisión asistida de documentos legales.
- Preguntas y respuestas sobre documentación técnica: adecuado para consultar manuales, especificaciones de API o guías de producto donde la respuesta debe estar contenida en el documento de referencia.
- Razonamiento multi-salto sobre documentos: su capacidad de combinar información de varios pasajes en contexto largo permite responder preguntas complejas que cruzan datos de distintas secciones de un documento.
- Despliegue en infraestructura con GPU limitada: al ocupar 12,6 GB, cabe en una GPU T4 de 16 GB (AWS g4dn.xlarge), lo que permite ejecutar un lector de 27B en producción con coste reducido o en equipos de escritorio con GPU de 16 GB.

## Benchmarks y rendimiento

La validación publicada por baa.ai incluye las siguientes métricas, comparadas con el modelo de precisión completa:

| Metrica | Valor |
|---|---|
| Tamano | 12,6 GB |
| Bits promedio | 3,73 (IQ3_M) |
| Deferencia a la evidencia recuperada | 1,00 |
| Precisión de lectura desde el contexto | 1,00 |
| Razonamiento multi-salto (4-5 saltos, contexto largo) | 0,92-0,96 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La validación se centra en la fidelidad de la recuperación, no en el rendimiento general.

## Requisitos de hardware

- VRAM estimada para inferencia: 12,6 GB de pesos, por lo que se necesita una GPU con al menos 16 GB de VRAM para dejar margen al contexto de 8K tokens.
- GPU recomendadas: NVIDIA T4 (16 GB), NVIDIA L4, RTX 4090, RTX 4080 o cualquier GPU con 16 GB o más. También es viable en Apple Silicon con 16 GB de memoria unificada.
- Con 24 GB de VRAM se podría ampliar la ventana de contexto hasta 32K-64K tokens, según las proyecciones del modelo base.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio y llama-cpp-python.
- Latencia y throughput: no se publican datos específicos para esta cuantización. En hardware AMD Ryzen AI Max+ con LM Studio, el modelo base alcanza 51,8 tokens por segundo, pero ese dato corresponde a una configuración diferente.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano | Contexto | Licencia | Notas |
|---|---|---|---|---|---|---|
| baa-ai/Qwen3.8-27B-RAM-13GB-GGUF | 27B | IQ3_M | 12,6 GB | 8K en 16 GB | Apache 2.0 | Validado para lectura fiel |
| baa-ai/Qwen3.8-27B-RAM-31GB-GGUF | 27B | Mixta (imatrix) | no disponible | Mayor | Apache 2.0 | Mayor fidelidad, requiere mas VRAM |
| Qwen/Qwen3.8-27B (modelo base) | 27B | BF16 | ~54 GB (estimado) | 32K-64K | Apache 2.0 | Precision completa, requiere 24-80 GB |

La versión de 13 GB es la más ligera de las dos preparadas por baa.ai y está pensada para GPU de 16 GB. La versión de 31 GB ofrece más margen de precisión para hardware con más VRAM. El modelo base en BF16 sirve como referencia de validación.

## Limitaciones y advertencias

- Cuantización agresiva (IQ3_M, 3,73 bits promedio): aunque la validación muestra que no se pierde fidelidad en tareas de lectura, la cuantización puede degradar capacidades no verificadas como la generación creativa, las matemáticas avanzadas o el razonamiento complejo.
- La validación se limita a tareas de lectura fiel y razonamiento multi-salto sobre documentos; no hay datos de benchmarks generales (MMLU, HumanEval, GSM8K).
- Riesgo de alucinación en ausencia de contexto: el modelo está optimizado para seguir documentos recuperados, por lo que si se usa sin contexto puede comportarse como un modelo genérico de 27B con cuantización agresiva.
- Ventana de contexto limitada en 16 GB: 8K tokens puede ser insuficiente para documentos muy largos; para contextos mayores se necesita una GPU con más VRAM o la versión de 31 GB.
- Idiomas soportados no documentados en la model card.
- La licencia Apache 2.0 permite uso comercial, pero la validación de baa.ai no constituye una garantía de rendimiento en producción; se recomienda auditar las capacidades antes de desplegar en entornos regulados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/baa-ai/Qwen3.8-27B-RAM-13GB-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Versión de 31 GB: https://huggingface.co/baa-ai/Qwen3.8-27B-RAM-31GB-GGUF
- Web de baa.ai: https://baa.ai
- Plataforma Shepherd: https://baa.ai/shepherd.html
- Plataforma Watchman: https://baa.ai/watchman.html
- Analisis de requisitos de VRAM: https://www.orcarouter.ai/blog/qwen-3-8-27b-vram-requirements
- Guia de cuantizaciones GGUF: https://www.orcarouter.ai/blog/qwen-3-8-27b-gguf
- Soporte Day 0 en AMD: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Noticia sobre ejecucion local en PC: https://www.pcquest.com/news/27b-ai-on-your-pc-amd-just-made-it-possible-with-qwen38-27b-12268501
