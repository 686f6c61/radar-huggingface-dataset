# mdcreativeagent/Sailor2-8B

## Resumen

Sailor2-8B es un modelo de lenguaje multilingüe de 8.546.930.176 parámetros (aproximadamente 8.5B) desarrollado por Sea AI Lab como parte de la iniciativa comunitaria Sailor2, orientada a llevar modelos de lenguaje de vanguardia al sudeste asiático (SEA). El modelo parte de Qwen2.5-7B como base y se somete a un preentrenamiento continuo sobre 500.000 millones de tokens para cubrir 15 idiomas con un único modelo, incluyendo lenguas de bajos recursos como birmano, cebuano, ilocano, javanés, jemer, lao, malayo, sondanés, tagalo, tailandés, vietnamita y waray.

La versión publicada en este repositorio (mdcreativeagent/Sailor2-8B) es una redistribución de los pesos de Sailor2 en tamaño 8B, derivada de la expansión del modelo base Qwen2.5-7B. Emplea una arquitectura transformer decoder-only tipo Qwen2 con 8.5B parámetros totales, pesos en safetensors y licencia Apache 2.0, lo que permite uso comercial sin restricciones.

Su relevancia radica en cubrir un hueco real: la mayoría de los LLM abiertos rinden de forma notablemente inferior en lenguas del sudeste asiático, y Sailor2 se entrena específicamente para ese conjunto lingüístico manteniendo buen rendimiento en inglés y chino. El modelo se distribuye en tres tamaños (1B, 8B y 20B) para cubrir desde decodificación especulativa hasta despliegues de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), basado en Qwen2.5-7B |
| Parametros totales | 8.546.930.176 (aprox. 8,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-7B, no confirmada) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; cuantizaciones GGUF/AWQ no listadas) |
| Idiomas soportados | en, zh, id, th, vi, ms, lo, my, jv, km, su, tl (15 idiomas en la model card, incluyendo ceb, ilo, war) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Sailor2-8B es un transformer decoder-only con atención causal estándar, derivado de Qwen2.5-7B mediante expansión de modelo y preentrenamiento continuo. La model card indica que el modelo se entrena sobre 500.000 millones de tokens con estrategias de mezcla de datos optimizadas, protocolos de preentrenamiento multietapa y postentrenamiento multilingüe avanzado. No se detalla en la información disponible la composición exacta del dataset, la proporción por idioma ni si se emplearon RLHF o DPO en la fase de postentrenamiento; la model card remite al blog del proyecto para esos detalles.

La innovación principal es el enfoque de expansión y el entrenamiento continuo sobre una base multilingüe fuerte (Qwen2.5) para cubrir lenguas del sudeste asiático con bajos recursos, manteniendo capacidades en inglés y chino. El modelo se publica también en variantes base y chat, y en tamaños 1B, 8B y 20B, pensadas respectivamente para decodificación especulativa/investigación, producción y despliegues de mayor capacidad. No se documentan en la información proporcionada innovaciones como decodificación especulativa nativa, atención lineal o arquitecturas híbridas SSM.

## Capacidades

- Generación de texto conversacional multilingüe en 15 idiomas, con especial foco en lenguas del sudeste asiático (birmano, cebuano, ilocano, indonesio, javanés, jemer, lao, malayo, sondanés, tagalo, tailandés, vietnamita, waray) además de inglés y chino.
- Razonamiento y respuesta a preguntas en contextos multilingües, incluyendo cambio de idioma dentro de una conversación.
- Plantilla de chat con roles system/user/assistant mediante `apply_chat_template`, compatible con el ecosistema transformers.
- Integración con text-generation-inference y endpoints compatibles según los tags del repositorio.
- Soporte de tool calling / function calling: no confirmado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información proporcionada.
- Capacidades de visión o audio: no disponibles (modelo solo de texto).
- Modo thinking explícito: no disponible.

## Casos de uso

- Atención al cliente en el sudeste asiático: el modelo puede gestionar conversaciones multi-turno en tailandés, vietnamita, indonesio o malayo con un único despliegue, evitando mantener modelos separados por idioma y reduciendo costes de infraestructura.
- Traducción y localización de contenidos: traducción entre inglés/chino y lenguas SEA de bajos recursos (jemer, lao, birmano) donde los modelos generalistas suelen fallar, integrable en pipelines de localización de documentación o productos.
- Moderación y clasificación de textos multilingües: análisis de comentarios y reseñas de usuarios en foros y marketplaces regionales, aprovechando la cobertura de javanés, sondanés y tagalo que rara vez aparece en otros LLM abiertos.
- Asistentes conversacionales para administraciones y ONG: despliegue de chatbots de información pública en lenguas locales, con licencia Apache 2.0 que permite uso institucional y comercial sin restricciones.
- Generación aumentada por recuperación (RAG) multilingüe: indexación y respuesta sobre corpus en varios idiomas SEA, usando el modelo como generador final en un pipeline de búsqueda documental.
- Investigación en lingüística computacional: estudio de transferencia entre lenguas de bajos recursos y evaluación de modelos multilingües, gracias a la disponibilidad de las variantes 1B/8B/20B y de los pesos base y chat.
- Decodificación especulativa en producción: la variante 1B de la familia Sailor2 puede actuar como modelo borrador para acelerar la inferencia del 8B o 20B en despliegues de altas prestaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al informe técnico (arXiv:2502.12982) y al blog del proyecto para las evaluaciones, pero no incluye cifras concretas de MMLU, HumanEval, GSM8K ni de benchmarks multilingües SEA en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 17 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomiendan 24 GB o más para contextos moderados.
- Cuantización a 8 bits: alrededor de 8,5-9 GB de pesos; a 4 bits: alrededor de 4,5-5 GB, aunque las cuantizaciones oficiales no están listadas en la información disponible.
- GPU recomendadas: A100 40/80 GB, H100, L40S para producción; RTX 4090 (24 GB) para bf16 en contextos cortos o cuantizado.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) en bf16 con contexto limitado, y en GPUs de 12-16 GB si se cuantiza a 8 o 4 bits (requiere generar las cuantizaciones, no publicadas en este repo).
- Opciones de despliegue: transformers (versión recomendada 4.46.3), text-generation-inference (tag del repo), y previsiblemente vLLM, llama.cpp u Ollama si se generan pesos GGUF, aunque no se confirman en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas SEA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sailor2-8B | 8,5B | no disponible | 15 idiomas (foco SEA) | Apache 2.0 | Hugging Face (este repo) |
| Qwen2.5-7B | 7,6B aprox. | 128K (según Qwen) | Parcial, sin foco SEA | Apache 2.0 (7B) | Hugging Face oficial |
| SeaLLM (variantes) | 7B-13B | variable | Foco SEA | variable | Hugging Face |
| Gemma 2 9B | 9B | 8K | Limitado | Gemma license | Hugging Face |

La comparación cuantitativa de rendimiento no está disponible en la información proporcionada. Frente a Qwen2.5-7B, Sailor2-8B añade preentrenamiento continuo sobre 500.000 millones de tokens con cobertura explícita de lenguas SEA de bajos recursos; frente a modelos cerrados o con licencias restrictivas, ofrece Apache 2.0 sin restricciones de uso comercial.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre datos web multilingües, es esperable un sesgo hacia las lenguas con más volumen de datos (inglés, chino, indonesio) y menor calidad en lenguas de muy bajos recursos (waray, ilocano, cebuano).
- Riesgo de alucinación: presente como en cualquier LLM; mayor en lenguas con menos datos de entrenamiento y en tareas factuales especializadas.
- Limitaciones de contexto e idioma: la longitud de contexto no está confirmada en la información disponible; la cobertura de 15 idiomas no garantiza calidad homogénea entre ellos.
- Restricciones de licencia: Apache 2.0 permite uso comercial y de investigación sin restricciones, según la model card.
- Caveats para producción: este repositorio es una redistribución de terceros (mdcreativeagent) con 0 descargas y 0 likes; se recomienda verificar la integridad de los pesos frente al repositorio oficial `sail/` antes de desplegar. Requiere transformers 4.46.3 o superior para cargar correctamente.
- No se confirman capacidades de tool calling ni de agentes, por lo que no debería asumirse su uso en pipelines agénticos sin validación previa.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/mdcreativeagent/Sailor2-8B
- Colección oficial Sailor2: https://huggingface.co/collections/sail/sailor2-language-models-674d7c9e6b4dbbd9a869906b
- Blog del proyecto: https://sea-sailor.github.io/blog/sailor2/
- Repositorio de código: https://github.com/sail-sg/sailor2
- Informe técnico: https://arxiv.org/pdf/2502.12982
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B
