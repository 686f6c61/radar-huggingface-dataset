# mradermacher/Gloomy-Dusk-26B-A4B-GGUF

## Resumen

Gloomy-Dusk-26B-A4B-GGUF es la distribución en formato GGUF del modelo Gloomy-Dusk-26B-A4B, un modelo de lenguaje conversacional de arquitectura Mixture of Experts (MoE) con aproximadamente 26 mil millones de parámetros totales y, según el sufijo "A4B" del nombre, unos 4 mil millones de parámetros activos por token. La conversión a GGUF la ha realizado mradermacher, un autor habitual en la publicación de cuantizaciones estáticas de modelos de terceros para su uso con llama.cpp y herramientas compatibles.

El modelo original lo publica el usuario Sorihon en Hugging Face y, por su nomenclatura y por los hilos de discusión encontrados en la búsqueda web, parece orientado a角色 playing y conversación (rol-play / character roleplay), un nicho donde abundan los modelos derivados de la familia Gemma con arquitectura MoE de ~26B totales y ~4B activos. No obstante, la model card del repositorio GGUF no aporta información sobre el entrenamiento, los datos utilizados ni los benchmarks, por lo que muchos datos técnicos deben considerarse no disponibles.

La relevancia de esta ficha radica en que permite ejecutar localmente un modelo MoE de 26B con un coste de cómputo por token cercano al de un modelo de 4B, gracias a la activación dispersa de expertos, y con un abanico amplio de cuantizaciones (desde Q2_K hasta Q8_0 y F16) que facilitan su despliegue en hardware de consumo. El repositorio ocupa 26,7 GB e incluye 12 variantes de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture of Experts (MoE), inferida del sufijo "A4B" y del tamaño; no confirmada en la model card |
| Parametros totales | 25.971.339.550 (≈26B) |
| Parametros activos | ≈4B (inferido de la nomenclatura "A4B"; no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas generadas con llama.cpp; el modelo base en safetensors) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo original. Por el nombre "26B-A4B" y por el contexto de la escena de modelos conversacionales de 2026, se trata con alta probabilidad de un transformer con capas MoE de aproximadamente 26B parámetros totales y unos 4B activos por token, un patrón habitual en derivados de la familia Gemma con arquitectura dispersa. La model card del repositorio GGUF únicamente indica que se trata de cuantizaciones estáticas del modelo `Sorihon/Gloomy-Dusk-26B-A4B`, generadas con `quantize_version: 2` y `output_tensor_quantised: 1`, con conversión de tipo `hf`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO, la longitud de contexto nativa ni innovaciones técnicas como decodificación especulativa o atención lineal. Tampoco se documenta el proceso de fine-tuning que da lugar a "Gloomy-Dusk" a partir de su modelo base. Todos estos datos deben considerarse no disponibles.

## Capacidades

- Generación de texto conversacional multi-turno, orientada según el contexto de la escena a roleplay y diálogo de personajes.
- Razonamiento y generación de texto general, heredado del modelo base (no verificado en la documentación).
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: no disponibles; no se documentan idiomas soportados.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el repositorio no incluye proyector multimodal (`skip_mmproj: 1`).

## Casos de uso

- Roleplay y personajes conversacionales: el modelo está etiquetado como "conversational" y su contexto de publicación (hilos de SillyTavernAI) sugiere uso en frontends de rol; las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutarlo en GPU de consumo manteniendo coherencia en diálogos largos.
- Asistente conversacional local: al ser un MoE de ~4B activos, ofrece un coste de inferencia por token bajo, adecuado para chatbots de escritorio con llama.cpp u Ollama en equipos sin GPU dedicada de gama alta.
- Prototipado de aplicaciones de chat: la disponibilidad de 12 cuantizaciones permite ajustar el equilibrio calidad/VRAM durante el desarrollo, empezando por Q4_K_S en entornos con poca memoria y subiendo a Q6_K o Q8_0 en producción.
- Experimentación con modelos MoE: útil para investigadores que quieran medir el comportamiento de un MoE de 26B/4B activos en tareas de generación abierta sin necesidad de infraestructura de centro de datos.
- Generación creativa y escritura asistida: el sesgo conversacional del modelo encaja en tareas de redacción de ficción y diálogo, ejecutables en local con Ollama o llama.cpp.
- Despliegue en endpoints compatibles con OpenAI: la etiqueta `endpoints_compatible` del repositorio indica que puede servirse a través de APIs compatibles, facilitando su integración en aplicaciones existentes que ya consumen la API de OpenAI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, aproximada a partir de 26B parámetros totales): F16 ≈ 52 GB; Q8_0 ≈ 28 GB; Q6_K ≈ 21 GB; Q5_K_M ≈ 18 GB; Q4_K_M ≈ 16 GB; Q3_K_M ≈ 13 GB; Q2_K ≈ 10 GB; IQ4_XS ≈ 14 GB. Estas cifras son estimaciones y no están confirmadas por el autor.
- GPU recomendadas: para F16 y Q8_0, A100 80 GB o H100; para Q4_K_M y Q5_K_M, RTX 4090 (24 GB) o RTX 3090; para Q3_K_M y Q2_K, GPU de 12-16 GB como RTX 4070 Ti o RTX 4080.
- ¿Cabe en GPU de consumo? Sí, en cuantizaciones Q4_K_M o inferiores cabe en GPUs de 16-24 GB; las variantes Q2_K y Q3_K_S podrían caber en 12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con la API de OpenAI (etiqueta `endpoints_compatible`). vLLM y TGI no están confirmados para este repositorio GGUF.
- Latencia y throughput estimados: no disponibles. Al ser un MoE con ~4B activos, se espera un throughput notablemente superior al de un modelo denso de 26B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Gloomy-Dusk-26B-A4B-GGUF | ≈26B | ≈4B | no disponible | no disponible | GGUF |
| G4-MeroMero-26B-A4B | ≈26B | ≈4B | no disponible | no disponible | no disponible |
| Gemma-4-Dark-Thoughts-31B-GGUF | ≈31B | no disponible | no disponible | no disponible | GGUF |

Los modelos comparables se han identificado a partir de los hilos de discusión encontrados en la búsqueda web (r/SillyTavernAI); no se dispone de datos de rendimiento, contexto ni licencia para ninguno de ellos, por lo que la comparativa se limita a tamaño y formato.

## Limitaciones y advertencias

- No se documenta la licencia del modelo base ni de la conversión GGUF; antes de un uso comercial es imprescindible verificar la licencia del repositorio `Sorihon/Gloomy-Dusk-26B-A4B`.
- No hay información sobre sesgos, datos de entrenamiento ni procesos de alineación (RLHF/DPO), lo que impide evaluar riesgos de sesgo y de contenido dañino.
- Riesgo de alucinación no cuantificado: al no haber benchmarks ni evaluaciones publicadas, no puede estimarse su fiabilidad en tareas de razonamiento o datos factuales.
- Contexto nativo desconocido: no se puede garantizar el rendimiento en conversaciones de contexto largo.
- Idiomas soportados no documentados: el rendimiento en castellano no está verificado.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una adopción prácticamente nula y ausencia de validación comunitaria.
- El modelo está orientado a conversación y roleplay; su uso en tareas de código, matemáticas o agentes no está respaldado por la documentación.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad en modelos MoE; se recomienda Q4_K_M o superior para producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Gloomy-Dusk-26B-A4B-GGUF
- Modelo base: https://huggingface.co/Sorihon/Gloomy-Dusk-26B-A4B
- Hilo de discusión (agosto de 2026): https://www.reddit.com/r/SillyTavernAI/comments/1vk3byn/megathread_best_modelsapi_discussion_week_of/
- Hilo de discusión (abril de 2026): https://www.reddit.com/r/SillyTavernAI/comments/1swlo1m/megathread_best_modelsapi_discussion_week_of/
