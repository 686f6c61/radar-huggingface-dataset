# AletheiaAING/gemma-3-1b-csw-experiments

## Resumen

`gemma-3-1b-csw-experiments` es un conjunto de tres experimentos de entrenamiento (RL1, DPO y RL2) sobre `google/gemma-3-1b-it`, desarrollados por AletheiaAING para tareas de *code-switching* (mezcla de lenguas al estilo nativo) y reescritura idiomática en 37 lenguas africanas. El modelo no traduce: reescribe texto en inglés o en una lengua base introduciendo préstamos y frases de una segunda lengua (tarea `hm`) o transformando texto plano en un registro coloquial rico en refranes, proverbios y exclamaciones (tarea `ood`).

La relevancia reside en su enfoque: la mayoría de los LLM multilingües producen un registro "de manual" en lenguas africanas de bajos recursos. Este modelo se entrena explícitamente para reproducir la mezcla de lenguas y la expresividad oral que caracteriza la conversación real, con un formato de entrada/salida estricto que incluye etiquetas de dispositivo (`<dev>`) para auditar qué préstamos o expresiones se han insertado.

El repositorio contiene tres variantes de investigación (reglas, DPO y reglas + evaluador aprendido + AfriCOMET); el autor recomienda usar `gemma-3-1b-csw-best` o `gemma-3-0.8b-csw` en producción. El tamaño del repo (7,8 GB) corresponde a los tres checkpoints en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3, derivado de google/gemma-3-1b-it) |
| Parametros totales | 1B (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Gemma 3 1B) |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se listan GGUF ni cuantizaciones) |
| Idiomas soportados | yo, ha, ig, sw, zu, xh, af, am, so, rw, ln, lg, sn, ny, st, tn, mg, wo, ee, tw, om, ti (37 lenguas africanas segun la model card) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-1b-it`, un transformer decoder-only de 1B parámetros. Sobre esa base se aplican tres pipelines de ajuste documentados en la model card: RL1 (solo reglas), DPO (optimización directa de preferencias) y RL2 (reglas + evaluador aprendido + métrica AfriCOMET). Los tres checkpoints se publican juntos como artefactos de investigación, sin que se detallen hiperparámetros, número de tokens de entrenamiento ni composición exacta del dataset.

La innovación principal es el diseño de tareas y el formato: cinco tareas (`eng_hm`, `m_hm`, `eng_ood`, `m_ood`, `hm_ood`) con etiquetas de lengua entre ángulos (`<yor>`, `<eng>`, etc.) que son tokens únicos del vocabulario, y un bloque `<dev>` de salida que enumera los dispositivos lingüísticos usados (préstamos o expresiones idiomáticas) copiados literalmente del texto generado. Este diseño permite filtrar salidas inválidas y auditar la fidelidad de la reescritura. No se documenta el uso de decodificación especulativa ni atención lineal.

## Capacidades

- Reescritura con *code-switching* (`hm`): inserta frases de una segunda lengua en un texto base, respetando los pares de lenguas entrenados.
- Reescritura idiomática (`ood`): convierte texto plano o literal en registro coloquial con refranes, comparaciones y exclamaciones.
- Transformación `hm_ood`: toma texto ya mezclado y lo reescribe en estilo idiomático conservando la mezcla.
- Salida estructurada con etiquetas de lengua y bloque `<dev>` auditable.
- Soporte de 37 lenguas africanas como base y como lengua de mezcla (pares restringidos a los entrenados).
- Generación de texto multilingüe en registro conversacional.
- No soporta traducción plana (`m_text`): el autor indica explícitamente que esta familia no fue entrenada para traducción.
- No se documenta soporte de tool calling, agentes, visión ni audio.

## Casos de uso

- Localización de contenido para redes sociales: dado un texto promocional en inglés, generar una versión en yoruba con préstamos de inglés al estilo de hablantes nativos, útil para campañas en Nigeria.
- Generación de diálogos sintéticos para entrenamiento de ASR/TTS: producir pares de texto code-switched etiquetados con `<dev>` para aumentar corpus de lenguas africanas de bajos recursos.
- Aumento de datos para modelos de traducción: crear variantes idiomáticas y mezcladas de un corpus paralelo, ampliando la cobertura de registro coloquial.
- Chatbots de atención al cliente en África subsahariana: respuestas en swahili, hausa o yoruba con el registro oral que el usuario espera, en lugar de un tono libresco.
- Investigación sociolingüística: generar ejemplos controlados de mezcla de lenguas para estudiar patrones de préstamo y code-switching en distintas comunidades.
- Evaluación de modelos multilingües: usar las salidas con bloque `<dev>` como conjunto de prueba para medir fidelidad de reescritura y naturalidad en lenguas africanas.
- Creación de contenido educativo: reescribir material didáctico plano en un registro más cercano y expresivo para audiencias jóvenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona el uso de AfriCOMET como evaluador en el pipeline RL2, pero no reporta puntuaciones numéricas ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2 GB de pesos (1B parámetros) más overhead de KV cache; en la práctica, 4-6 GB según longitud de contexto.
- En cuantización de 8 bits: alrededor de 1-1,5 GB de pesos; en 4 bits, menos de 1 GB (aunque el repo no publica GGUF).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti, RTX 4090 para inferencia local; A100/H100 solo necesarias para servir muchas peticiones concurrentes.
- Cabe holgadamente en GPU de consumo: cualquier GPU con 6 GB o más puede ejecutar el modelo en fp16 con contexto moderado.
- Opciones de despliegue: transformers (referencia), vLLM y TGI para serving; llama.cpp/Ollama requerirían conversión a GGUF no publicada en el repo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas africanos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-3-1b-csw-experiments | 1B | no disponible | 37 (code-switching e idiomático) | gemma | Hugging Face (repo de investigación) |
| gemma-3-1b-it (base) | 1B | no disponible | multilingüe general, sin especialización africana | gemma | Hugging Face |
| gemma-3-0.8b-csw | 0,8B | no disponible | 37 (variante pequeña recomendada por el autor) | gemma | Hugging Face |
| gemma-3-1b-csw-best | 1B | no disponible | 37 (variante recomendada para uso) | gemma | Hugging Face |

No se dispone de datos de benchmarks para establecer comparaciones cuantitativas con alternativas.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor desaconseja su uso directo y remite a `gemma-3-1b-csw-best` o `gemma-3-0.8b-csw`.
- No realiza traducción plana (`m_text`); usarlo para traducir produce resultados fuera de distribución.
- Los pares de lenguas de mezcla están restringidos a los entrenados; otros pares generan salidas poco naturales.
- El formato de entrada es estricto (una sola etiqueta de usuario, dos espacios tras los dos puntos, códigos entre ángulos); desviarse degrada la calidad.
- Riesgo de alucinación en la lista `<dev>`: los dispositivos deben copiarse literalmente del texto, pero no se garantiza que siempre coincidan.
- Sesgos: al entrenarse para imitar registro oral, puede reproducir estereotipos lingüísticos o expresiones coloquiales inapropiadas en contextos formales.
- Licencia Gemma: sujeta a los Gemma Terms of Use, con restricciones de uso comercial y obligaciones de atribución; revisar antes de desplegar en producción.
- Sin datos publicados de benchmarks ni de evaluación de seguridad; no apto para decisiones automatizadas de alto riesgo sin validación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AletheiaAING/gemma-3-1b-csw-experiments
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Variante recomendada para uso: https://huggingface.co/AletheiaAING/gemma-3-1b-csw-best
- Variante pequeña: https://huggingface.co/AletheiaAING/gemma-3-0.8b-csw
- Dataset de referencia citado: `csw-synth-samples8` (referenciado en la model card; no se proporciona URL directa)
- Licencia Gemma: https://ai.google.dev/gemma/terms
