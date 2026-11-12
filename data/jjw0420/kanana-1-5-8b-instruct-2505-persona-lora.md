# jjw0420/kanana-1.5-8b-instruct-2505-Persona-LORA

## Resumen

Kanana-1.5-8b-instruct-2505-Persona-LORA es un ajuste fino (LoRA) del modelo kakaocorp/kanana-1.5-8b-instruct-2505, publicado por el usuario jjw0420 en Hugging Face. Se trata de un adaptador de bajo rango orientado a la personalización de estilo conversacional (persona), entrenado sobre el checkpoint instructivo de 8.000 millones de parámetros desarrollado por Kakao Corp. El modelo base emplea una arquitectura transformer de tipo Llama, con licencia Apache 2.0 y un tamaño de repositorio de 0,1 GB, lo que confirma que el artefacto publicado son únicamente los pesos del adaptador y no el modelo completo.

El interés de esta ficha reside en que documenta un caso típico de personalización ligera sobre un modelo coreano-inglés de tamaño medio: un LoRA entrenado con Unsloth y TRL que hereda las capacidades del modelo base y añade un tono o rol concreto. No obstante, la información pública es mínima: la model card no describe el dataset de entrenamiento, los hiperparámetros del LoRA, el rango ni los resultados de evaluación, por lo que muchas especificaciones deben marcarse como no disponibles.

A nivel práctico, este adaptador solo es utilizable cargando el modelo base kanana-1.5-8b-instruct-2505 y aplicando los pesos LoRA sobre él. No es un modelo autónomo y no debe evaluarse de forma aislada: sus capacidades, contexto y rendimiento son, en la práctica, los del modelo base, modulados por el ajuste de persona.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (modelo base kanana-1.5-8b-instruct-2505); adaptador LoRA sobre el mismo |
| Parametros totales | 8.000 millones (modelo base); el adaptador LoRA no declara su número de parámetros |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; el modelo base admite cuantizaciones estándar del ecosistema transformers, pero no se documentan aquí) |
| Idiomas soportados | en (según la model card del adaptador); el modelo base Kanana está orientado a coreano e inglés, aunque el adaptador solo declara inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre kanana-1.5-8b-instruct-2505, un transformer decoder-only de tipo Llama con 8.000 millones de parámetros. La model card del adaptador no detalla la arquitectura interna del modelo base (número de capas, dimensión oculta, mecanismo de atención), por lo que esos datos deben consultarse en la ficha del modelo original de Kakao Corp. El adaptador en sí es un LoRA de bajo rango, técnica que congela los pesos originales e inyecta matrices de baja dimensión en determinadas capas para modificar el comportamiento sin reentrenar el modelo completo.

El entrenamiento se realizó con Unsloth (que optimiza el entrenamiento de LoRA en memoria y velocidad) y TRL, según los tags del repositorio. La model card indica que el modelo se entrenó "2x faster with Unsloth", pero no especifica el número de tokens de entrenamiento, la composición del dataset de persona, el rango del LoRA (r), el alpha, la tasa de aprendizaje ni si hubo etapas de RLHF o DPO. Tampoco se documenta ninguna innovación técnica adicional más allá del uso de Unsloth para acelerar el ajuste. Esta ausencia de información es una limitación importante para reproducir o auditar el ajuste.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo instructivo base.
- Ajuste de persona: el adaptador está diseñado para modular el estilo, el tono o el rol de las respuestas, según la intención del autor (no documentada en detalle).
- Razonamiento y respuesta a instrucciones: capacidades propias del checkpoint instructivo kanana-1.5-8b-instruct-2505.
- Soporte de tool calling / function calling: no documentado en la model card del adaptador; depende de las capacidades del modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado en la model card del adaptador.
- Capacidades multilingües: el adaptador declara únicamente inglés; el modelo base Kanana está orientado a coreano e inglés, pero el ajuste de persona puede degradar el comportamiento en coreano.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Prototipado de asistentes con personalidad definida: cargar el modelo base con el adaptador LoRA para obtener respuestas con un tono consistente en demos y pruebas de concepto, sin reentrenar el modelo completo.
- Investigación sobre personalización eficiente: servir como ejemplo reproducible de ajuste LoRA con Unsloth y TRL sobre un modelo instructivo de 8B, útil para estudiar cómo afecta el rango y el dataset al estilo de salida.
- Generación de contenido en inglés con voz de marca: aplicar el adaptador para redactar textos de marketing o atención al cliente con un registro concreto, aprovechando el bajo coste de almacenamiento del adaptador (0,1 GB).
- Evaluación comparativa de adaptadores: entrenar y comparar varias personas sobre el mismo modelo base para analizar la degradación de capacidades (por ejemplo, en razonamiento o código) tras el ajuste.
- Despliegue ligero en entornos con recursos limitados: al ser un adaptador pequeño, puede servirse junto al modelo base cuantizado en GPUs de consumo, cambiando de persona mediante carga dinámica de adaptadores.
- Filtrado y moderación de estilo: usar el adaptador como capa de reescritura que normaliza el tono de respuestas generadas por otro sistema antes de mostrarlas al usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; depende del modelo base de 8B. Como referencia orientativa del ecosistema, un modelo de 8B en FP16 requiere alrededor de 16 GB de VRAM, en 8 bits unos 8-9 GB y en 4 bits unos 5-6 GB, pero estos valores no están confirmados en la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? No confirmado; dependerá de la cuantización aplicada al modelo base.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag del repositorio) y endpoints_compatible (tag del repositorio). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI más allá de los tags.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| jjw0420/kanana-1.5-8b-instruct-2505-Persona-LORA | 8B (base) + LoRA | no disponible | apache-2.0 | safetensors (adaptador) | Ajuste de persona sobre Kanana 1.5 8B instruct |
| kakaocorp/kanana-1.5-8b-instruct-2505 | 8B | no disponible | no disponible en esta ficha | no disponible | Modelo base original de Kakao Corp |
| Adaptadores LoRA genéricos sobre Llama 3 8B Instruct | 8B (base) + LoRA | 8.192 tokens (típico en Llama 3) | Llama 3 Community License | safetensors (adaptador) | Alternativa habitual para personalización; licencia más restrictiva |

La comparativa con alternativas de la misma categoría (adaptadores de persona sobre modelos de 8B) es limitada porque no se dispone de datos de rendimiento del adaptador ni de especificaciones detalladas del modelo base en la información proporcionada. No se dispone de benchmarks que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento ni los hiperparámetros del LoRA, lo que impide auditar sesgos introducidos por el ajuste de persona.
- Riesgo de alucinación: inherente al modelo base instructivo; el adaptador no incluye mecanismos de verificación factual.
- El adaptador declara únicamente inglés; su uso en coreano u otros idiomas puede degradar la calidad respecto al modelo base.
- No es un modelo autónomo: requiere cargar el modelo base kanana-1.5-8b-instruct-2505 y aplicar los pesos LoRA; el repositorio (0,1 GB) no contiene los pesos completos.
- Licencia Apache 2.0 declarada por el autor del adaptador; debe verificarse que la licencia del modelo base de Kakao Corp. permite la redistribución de adaptadores derivados.
- Sin descargas ni likes en el momento de la consulta, y sin evaluación publicada: no hay evidencia empírica de calidad en producción.
- No se documenta soporte de tool calling ni de agentes; no asumir estas capacidades sin validarlas contra el modelo base.
- El ajuste de persona puede degradar capacidades de razonamiento, código o matemáticas del modelo base; se recomienda evaluar antes de desplegar.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/jjw0420/kanana-1.5-8b-instruct-2505-Persona-LORA
- Modelo base: https://huggingface.co/kakaocorp/kanana-1.5-8b-instruct-2505
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (repositorio): https://github.com/huggingface/trl
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
