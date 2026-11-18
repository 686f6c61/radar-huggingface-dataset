# mradermacher/One-For-All-12B-GGUF

## Resumen

One-For-All-12B es un modelo de lenguaje de 11.907.350.576 parámetros (aproximadamente 12B) desarrollado por TendieLabs. Se trata de un modelo de tipo *fan-model* basado en la familia Gemma 4 de Google, ajustado mediante LoRA para tareas de *persona* y *roleplay* centradas en el universo de *My Hero Academia*. El repositorio aquí descrito es la versión cuantizada en formato GGUF publicada por mradermacher, que facilita su ejecución en hardware de consumo mediante llama.cpp y herramientas compatibles.

La relevancia de esta ficha reside en que documenta un caso de uso muy específico: la adaptación de un modelo base de propósito general (Gemma 4) hacia un asistente conversacional con una personalidad concreta, distribuido bajo licencia Apache 2.0 pero con la particularidad de que el modelo base Gemma 4 tiene su propia licencia vinculada. El modelo está orientado exclusivamente al inglés y su pipeline no está declarado en la información disponible.

Al tratarse de una cuantización estática (no imatrix), el autor advierte de que no hay cuantizaciones ponderadas/imatrix disponibles en el momento de la publicación. El repositorio incluye además ficheros `mmproj` (proyección multimodal), lo que sugiere que el modelo base podría tener capacidades de visión, aunque no se detalla en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 4, según tags; detalles no disponibles) |
| Parametros totales | 11.907.350.576 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; además mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (cuantizaciones estáticas); safetensors en el modelo base |

## Arquitectura y entrenamiento

La información disponible indica que el modelo es una adaptación mediante LoRA del modelo base TendieLabs/One-For-All-12B, que a su vez se basa en la arquitectura Gemma 4 (tag `gemma4`). No se especifican en la información proporcionada detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. El ajuste LoRA está orientado a *persona* y *roleplay*, con temática de *My Hero Academia*, según los tags del repositorio.

La innovación técnica destacable de este repositorio concreto no está en la arquitectura, sino en el proceso de cuantización: mradermacher ha generado cuantizaciones estáticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) e incluye ficheros `mmproj` para un suplemento multimodal, lo que apunta a que el modelo base conserva alguna capacidad de procesamiento de imágenes. No se dispone de información sobre innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, orientada a mantener una persona concreta (roleplay).
- Interpretación de personajes y diálogo multi-turno dentro del contexto temático de *My Hero Academia*.
- Posible soporte multimodal (los ficheros `mmproj` sugieren capacidad de visión en el modelo base), aunque no se detalla en la información disponible.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Modo *thinking*: no disponible en la información proporcionada.

## Casos de uso

- Roleplay conversacional temático: el modelo puede mantener interacciones multi-turno interpretando personajes del universo de *My Hero Academia*, aprovechando el ajuste LoRA específico de persona.
- Prototipado de chatbots con personalidad: útil para desarrolladores que quieran experimentar con asistentes de personaje fijo sin entrenar desde cero, usando las cuantizaciones Q4_K_M o Q5_K_M en hardware de consumo.
- Investigación sobre ajuste LoRA: sirve como ejemplo práctico de cómo un modelo base Gemma 4 puede especializarse mediante LoRA y luego cuantizarse a GGUF para despliegue local.
- Generación de ficción y narrativa fan: adecuado para escribir diálogos y escenas coherentes con el tono y los personajes del universo referenciado.
- Evaluación de cuantizaciones: útil para comparar la degradación de calidad entre Q2_K, Q4_K_M y Q8_0 en un modelo de 12B, dado que el autor proporciona un gráfico de perplejidad de referencia.
- Despliegue local en entornos sin GPU dedicada: las cuantizaciones Q3_K_S y Q2_K permiten ejecutar el modelo en CPU con llama.cpp, aunque con pérdida de calidad esperada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de cuantización, aproximada a partir de los tamaños de fichero típicos para 12B): Q8_0 ~12-13 GB, Q6_K ~10 GB, Q5_K_M ~8,5 GB, Q4_K_M ~7,5 GB, Q3_K_M ~6 GB, Q2_K ~4,5 GB. Estas cifras son estimaciones y no están confirmadas en la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, un modelo de 12B en Q4_K_M podría caber en GPUs de consumo con 8-12 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070), pero no se confirma.
- Cabe en GPU de consumo: probablemente sí en cuantizaciones Q4_K_M o inferiores, según el tamaño del repositorio (7,3 GB) y los quants listados.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), y por extensión herramientas compatibles como Ollama o LM Studio. El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo API. No se confirma soporte de vLLM o TGI para esta versión GGUF.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| One-For-All-12B (este) | 11,9B | no disponible | apache-2.0 | GGUF / safetensors | Fan-model de roleplay basado en Gemma 4 |
| TendieLabs/One-For-All-12B | 11,9B | no disponible | apache-2.0 | safetensors | Modelo base sin cuantizar |
| Gemma 4 (modelo base) | no disponible | no disponible | licencia Gemma 4 | safetensors | Modelo de propósito general de Google |

No se dispone de datos de rendimiento comparativo en la información proporcionada. Los modelos comparables de la misma categoría (roleplay/fan-models de ~12B) no están identificados en la información disponible.

## Limitaciones y advertencias

- Modelo especializado en una temática concreta (*My Hero Academia*) y en inglés; su utilidad fuera de ese dominio es limitada.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fiabilidad.
- Sesgos conocidos: no disponible en la información proporcionada.
- La licencia declarada es Apache 2.0, pero el enlace apunta a la licencia de Gemma 4 de Google; conviene verificar las condiciones reales de uso comercial del modelo base antes de desplegarlo en producción.
- Las cuantizaciones son estáticas (no imatrix), lo que puede implicar una calidad inferior en quants pequeños (Q2_K, Q3_K_S) frente a cuantizaciones ponderadas.
- No hay información sobre longitud de contexto, lo que impide garantizar conversaciones largas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del rendimiento real.
- El pipeline no está declarado, lo que puede complicar la integración automática con `transformers`.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/One-For-All-12B-GGUF
- Modelo base: https://huggingface.co/TendieLabs/One-For-All-12B
- Página de descargas del autor: https://hf.tst.eu/model#One-For-All-12B-GGUF
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
