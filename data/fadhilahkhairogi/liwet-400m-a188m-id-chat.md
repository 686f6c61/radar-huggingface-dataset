# fadhilahkhairogi/Liwet-400M-A188M-id-chat

## Resumen

Liwet-400M-A188M-id-chat es un modelo de lenguaje de arquitectura Sparse Mixture-of-Experts (MoE) desarrollado por el Grupo 11 de la asignatura de Generative AI de la Universidad de Telkom (Indonesia). Forma parte de la familia Liwet (Lightweight Transformer) y está especializado en conversación en indonesio. El modelo parte de `fadhilahkhairogi/Liwet-400M-A188M-id-instruct` y se ha alineado mediante SimPO (Simple Preference Optimization) sobre tres conjuntos de datos de preferencias en indonesio.

El modelo tiene 400.098.304 parámetros totales, de los cuales 187.761.664 están activos por token (~46,9%), gracias a un enrutamiento top-2 sobre 8 expertos enrutados. La arquitectura `IndonesianChatLM` consta de 32 capas, atención GQA con 16 cabezas de consulta y 4 de clave/valor, dimensión oculta de 1024, RoPE y SwiGLU. El contexto es de 2.048 tokens y el vocabulario de 32.000 tokens Byte-Level BPE.

Es relevante como ejemplo de modelo MoE compacto entrenado desde cero para un idioma de recursos medios como el indonesio, con un pipeline de alineación por preferencias documentado. Su tamaño reducido permite experimentación en hardware modesto, aunque sus métricas de validación (val_acc 57,0%, test_acc 51,0%) indican un rendimiento moderado y un contexto muy limitado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IndonesianChatLM Sparse MoE (32 capas, GQA 16Q/4KV, d=1024, top-2 sobre 8 expertos enrutados, moe_intermediate_size=360, RoPE, SwiGLU) |
| Parametros totales | 400.098.304 |
| Parametros activos | 187.761.664 (~46,9%) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | indonesio (id) |
| Licencia | no disponible |
| Formato de pesos | SafeTensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con arquitectura Sparse MoE. Cada capa combina atención con GQA (16 cabezas de consulta, 4 de clave/valor) y un bloque feed-forward con 8 expertos enrutados y enrutamiento top-2, con `moe_intermediate_size=360`. Usa RoPE para codificación posicional y SwiGLU como activación. La dimensión del modelo es 1024 y el vocabulario de 32.000 tokens Byte-Level BPE con tokens especiales `<pad>=0`, `<bos>=1`, `<eos>=2`, `<unk>=3`.

El entrenamiento de alineación se realizó con SimPO sobre 8.129 ejemplos de entrenamiento, 496 de validación y 556 de test, durante 127 pasos con `beta=2.0`, `gamma=0.5` y `lr=1e-6`. Los conjuntos de datos utilizados son `AksaraLLM/aksara-dpo-id-v2`, `davidanugraha/IndoPref` y `daruokta/t5gemma2-indonesia-chat-formatted`. El modelo base es `fadhilahkhairogi/Liwet-400M-A188M-id-instruct`, entrenado desde cero (`from-scratch`) según las etiquetas del repositorio. No se detalla en la información disponible el número de tokens de preentrenamiento ni la composición completa del corpus previo a la alineación.

## Capacidades

- Generación de texto conversacional en indonesio, con formato de prompt `<bos>User: {prompt}\n\nAssistant:`.
- Alineación por preferencias mediante SimPO, orientada a respuestas más acordes con preferencias humanas en indonesio.
- Razonamiento básico y respuesta a instrucciones en el dominio del chat (sin datos específicos de benchmarks de razonamiento).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al indonesio (idioma declarado `id`).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Chat de atención al cliente en indonesio: el modelo puede mantener conversaciones multi-turno dentro de su ventana de 2.048 tokens, adecuado para consultas breves de soporte en indonesio con respuestas alineadas por preferencias.
- Prototipado de asistentes conversacionales en entornos académicos: su tamaño de 400M totales y ~188M activos permite iterar y desplegar en hardware de gama media para investigación sobre MoE y alineación.
- Experimentación con SimPO y MoE: sirve como referencia reproducible para estudiar el efecto de la alineación por preferencias en un modelo MoE compacto con datos en indonesio.
- Generación de respuestas conversacionales en aplicaciones de bajo coste: al activar solo ~47% de los parámetros por token, reduce el coste computacional frente a un modelo denso equivalente.
- Fine-tuning posterior sobre dominios específicos en indonesio: el modelo base instruct y el checkpoint chat permiten adaptaciones con datasets pequeños (el ajuste SimPO usó ~8.000 ejemplos).
- Evaluación comparativa de modelos pequeños para idiomas de recursos medios: útil como línea base en investigaciones sobre modelos from-scratch en indonesio.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| val_loss | 0.9352 |
| val_acc | 57,0% |
| test_loss | 1.1098 |
| test_acc | 51,0% |
| Throughput pico | 4.096 tok/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las métricas anteriores corresponden al proceso de alineación SimPO, no a evaluaciones de capacidad general.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 0,8 GB para los pesos (tamaño del repo 0,8 GB); con overhead de activaciones y caché KV, alrededor de 1-2 GB en función de la longitud de contexto.
- VRAM estimada en cuantización de 8 bits: ~0,4 GB de pesos; en 4 bits: ~0,2 GB de pesos (estimaciones a partir del tamaño del repo, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) es suficiente para inferencia en bfloat16 o cuantizada.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU consumer modernas.
- Opciones de despliegue: PyTorch con `transformers` (pesos SafeTensors); compatibilidad con vLLM, llama.cpp, Ollama o TGI no está confirmada en la información disponible.
- Latencia y throughput: el autor reporta un pico de 4.096 tok/s; no se especifica el hardware empleado para esa medición.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones publicadas con modelos equivalentes en la información proporcionada. Como referencia estructural, se puede comparar con otros modelos MoE compactos o modelos pequeños para indonesio, pero no se han encontrado métricas comparables en la información disponible.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Liwet-400M-A188M-id-chat | 400,1M | 187,8M | 2.048 | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Contexto muy limitado (2.048 tokens), insuficiente para documentos largos o conversaciones extensas.
- Métricas de validación y test moderadas (val_acc 57,0%, test_acc 51,0%), lo que sugiere una fiabilidad limitada en tareas complejas.
- Riesgo de alucinación inherente a modelos pequeños entrenados con datos limitados; no se documentan mitigaciones específicas.
- Sesgos conocidos: no documentados por el autor; al entrenarse con datasets de preferencias en indonesio, puede heredar sesgos de esas fuentes.
- Licencia no disponible: no se puede confirmar el uso comercial; se debe contactar con el autor antes de un despliegue en producción.
- Idioma restringido al indonesio; el rendimiento en castellano u otros idiomas no está garantizado.
- Modelo desarrollado en el contexto de un trabajo de curso universitario, sin validación externa ni mantenimiento declarado.
- Formato de prompt específico (`<bos>User: {prompt}\n\nAssistant:`) y parámetros de muestreo recomendados (`temperature=0.55`, `top_k=40`, `top_p=0.9`, `repetition_penalty=1.15`); desviarse de ellos puede degradar la calidad.

## Enlaces

- Hugging Face: https://huggingface.co/fadhilahkhairogi/Liwet-400M-A188M-id-chat
- Modelo base instruct: https://huggingface.co/fadhilahkhairogi/Liwet-400M-A188M-id-instruct
- Dataset AksaraLLM/aksara-dpo-id-v2: https://huggingface.co/datasets/AksaraLLM/aksara-dpo-id-v2
- Dataset davidanugraha/IndoPref: https://huggingface.co/datasets/davidanugraha/IndoPref
- Dataset daruokta/t5gemma2-indonesia-chat-formatted: https://huggingface.co/datasets/daruokta/t5gemma2-indonesia-chat-formatted
