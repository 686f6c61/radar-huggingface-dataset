# matthew-sudo2/sailor2-1b-filbench-wsp-gpt61astra

## Resumen

Sailor2-1B es un modelo de lenguaje multilingüe desarrollado por Sea AI Lab (SAIL) como parte de la iniciativa comunitaria Sailor2, orientada a llevar modelos de lenguaje de calidad a las lenguas del sudeste asiático (SEA). Esta variante concreta, publicada bajo el identificador `matthew-sudo2/sailor2-1b-filbench-wsp-gpt61astra`, es un fine-tuning del modelo base Qwen2.5-0.5B que ha sido expandido hasta aproximadamente 988 millones de parámetros, siguiendo la receta de expansión de modelo descrita en el informe técnico de Sailor2.

El modelo resuelve el problema de la escasa cobertura de las lenguas del sudeste asiático en los LLM de propósito general, ofreciendo un único modelo unificado que cubre inglés, chino y un conjunto de lenguas de la región como indonesio, tailandés, vietnamita, malayo, lao, birmano, javanés, jemer, sundanés y tagalo. La arquitectura es un transformer decoder-only de tipo Qwen2, con licencia Apache 2.0, lo que permite uso comercial sin restricciones.

Es relevante ahora porque los modelos de 1B parámetros resultan útiles para decodificación especulativa, despliegue en entornos con recursos limitados e investigación, y porque el ecosistema Sailor2 cubre tamaños de 1B, 8B y 20B con el mismo enfoque multilingüe. El contexto máximo no está especificado en la información disponible para esta variante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 988.064.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | en, zh, id, th, vi, ms, lo, my, jv, km, su, tl (la familia Sailor2 declara además cebuyano, ilocano y waray) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2 (transformer decoder-only con atención causal estándar, RMSNorm y activaciones SwiGLU), partiendo de Qwen2.5-0.5B y aplicando la técnica de expansión de modelo empleada por Sailor2 para alcanzar aproximadamente 988 millones de parámetros. Según la documentación de la familia Sailor2, el preentrenamiento continuo se realiza sobre 500.000 millones de tokens que cubren 15 lenguas, con estrategias optimizadas de mezcla de datos, protocolos de preentrenamiento multi-etapa y un post-entrenamiento multilingüe avanzado. No se detalla en la información disponible si esta variante concreta incorpora RLHF, DPO u otro método de alineación, ni la composición exacta del dataset de fine-tuning.

La innovación principal de la familia Sailor2 es la expansión controlada de modelos Qwen2.5 pequeños para cubrir lenguas de bajos recursos del sudeste asiático sin perder capacidades en inglés y chino, mediante mezclas de datos equilibradas y fases de entrenamiento progresivas. Esta variante concreta añade un fine-tuning adicional (el sufijo del identificador sugiere un ajuste específico sobre un conjunto de evaluación tipo "filbench"), aunque no se documentan los detalles de dicho ajuste.

## Capacidades

- Generación de texto conversacional multilingüe en inglés, chino y lenguas del sudeste asiático (indonesio, tailandés, vietnamita, malayo, lao, birmano, javanés, jemer, sundanés, tagalo).
- Razonamiento básico y respuesta a preguntas de propósito general, limitado por el tamaño de 1B parámetros.
- Soporte de plantillas de chat mediante `apply_chat_template` con roles system/user/assistant.
- Integración con la librería `transformers` (se recomienda `transformers==4.46.3`) y con text-generation-inference según los tags del repositorio.
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido en la información disponible.

## Casos de uso

- Decodificación especulativa: la familia Sailor2 señala explícitamente que los modelos de 1B están pensados para servir como draft model en esquemas de speculative decoding junto a modelos mayores, acelerando la inferencia sin cambiar la distribución de salida.
- Asistentes conversacionales en lenguas del sudeste asiático: el modelo puede gestionar diálogos multi-turno en indonesio, tailandés, vietnamita o malayo, útil para atención al cliente regional donde los modelos generalistas rinden peor.
- Traducción y adaptación de contenidos: generación y reescritura de textos entre inglés/chino y lenguas SEA, aprovechando el entrenamiento multilingüe unificado.
- Procesamiento de texto en entornos con recursos limitados: al ocupar aproximadamente 2 GB en precisión completa y menos de 1 GB cuantizado, puede desplegarse en CPUs, GPUs de gama baja o dispositivos edge para tareas de clasificación, resumen o extracción.
- Investigación en multilingüismo: base ligera para experimentos de fine-tuning, evaluación de sesgos lingüísticos o estudios de transferencia entre lenguas de bajos recursos.
- Generación de contenido localizado: redacción de respuestas, descripciones de producto o textos de soporte en javanés, sundanés o tagalo, lenguas escasamente cubiertas por modelos comerciales.
- Prototipado rápido de pipelines de NLP: al ser compatible con `transformers` y TGI, sirve para validar flujos de generación antes de escalar a los modelos Sailor2 de 8B o 20B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 2 GB de pesos más overhead de activaciones y caché KV, en torno a 3-4 GB en la práctica.
- En cuantización de 8 bits: aproximadamente 1 GB de pesos; en 4 bits, en torno a 0,5-0,7 GB (estimación teórica, no se publican cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM en bf16, como RTX 3050, RTX 4060, RTX 4090, A100 o H100; el modelo es plenamente funcional en GPUs de consumo.
- También puede ejecutarse en CPU con llama.cpp u Ollama si se generan pesos GGUF, aunque no se distribuyen oficialmente en el repositorio.
- Opciones de despliegue: `transformers` (recomendado 4.46.3), text-generation-inference (TGI), vLLM y llama.cpp/Ollama previa conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas SEA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sailor2-1B (esta variante) | ~988 M | no disponible | Sí (11-15 lenguas) | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B (base) | 494 M | 32.768 tokens (según ficha oficial de Qwen) | Parcial | Apache 2.0 | Hugging Face |
| Sailor2-1B-Chat (original) | ~1 B | no disponible | Sí | Apache 2.0 | Hugging Face (colectivo sail) |
| Sailor2-8B | ~8 B | no disponible | Sí | Apache 2.0 | Hugging Face (colectivo sail) |

La comparación con Qwen2.5-0.5B es directa porque es el modelo base del que parte la expansión; esta variante duplica aproximadamente el número de parámetros y añade cobertura explícita de lenguas SEA. Frente a Sailor2-1B-Chat original, esta ficha corresponde a un fine-tuning derivado publicado por un tercero (`matthew-sudo2`), no al checkpoint oficial de SAIL, por lo que su rendimiento puede diferir del original. No se dispone de datos de benchmarks para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Al tratarse de un modelo de aproximadamente 1B parámetros, su capacidad de razonamiento complejo, matemáticas y código es limitada en comparación con modelos de 7B o superiores.
- Es un fine-tuning derivado publicado por un tercero, no el checkpoint oficial de Sea AI Lab; no hay garantías de calidad ni de reproducibilidad respecto al Sailor2-1B original.
- Riesgo de alucinación inherente a modelos pequeños, especialmente en tareas de conocimiento factual y lenguas de bajos recursos con menos datos de entrenamiento.
- No se documentan evaluaciones de sesgo; es esperable que existan sesgos heredados de Qwen2.5 y de los datos de preentrenamiento continuo.
- La longitud de contexto no está especificada en la información disponible, lo que dificulta planificar despliegues con ventanas largas.
- Cobertura idiomática desigual: las lenguas con menos recursos (lao, birmano, jemer, sundanés) probablemente rindan peor que indonesio, tailandés o vietnamita.
- Licencia Apache 2.0 permite uso comercial sin restricciones, pero conviene verificar la procedencia de los datos de fine-tuning del tercero antes de usos sensibles.
- No se distribuyen cuantizaciones oficiales (GGUF, AWQ, GPTQ), por lo que el despliegue en entornos ligeros requiere conversión propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthew-sudo2/sailor2-1b-filbench-wsp-gpt61astra
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Colección Sailor2: https://huggingface.co/collections/sail/sailor2-language-models-674d7c9e6b4dbbd9a869906b
- Sitio del proyecto: https://sea-sailor.github.io/blog/sailor2/
- Repositorio de código: https://github.com/sail-sg/sailor2
- Informe técnico: https://arxiv.org/pdf/2502.12982
