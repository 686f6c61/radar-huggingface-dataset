# ddh0/OrcaMaid-v2-FIX-13b-32k

## Resumen

OrcaMaid-v2-FIX-13b-32k es un modelo de lenguaje de 13.000 millones de parámetros creado por el usuario ddh0 mediante una fusión por gradiente SLERP (mergekit) entre Microsoft Orca-2-13b y Noromaid-v0.1.1-13b, con sesgo hacia el primero. El objetivo declarado del autor es combinar la capacidad de razonamiento y seguimiento de instrucciones de Orca-2 con el tono más natural y humano de Noromaid, sin sacrificar inteligencia. Esta versión FIX corrige los problemas del tokenizador fusionado de la v2 original (que impedía detener la generación y emitía tokens ChatML corruptos como `<|im_end`) y extiende el contexto nativo a 32.768 tokens mediante YaRN, partiendo de los 4.096 originales.

El modelo se apoya en la arquitectura Llama 2 (transformer decoder-only denso) y se distribuye en safetensors y GGUF, con pipeline de text-generation y compatibilidad con text-generation-inference. Su formato de prompt es Alpaca, no ChatML, lo que condiciona su integración en producción. La licencia aplicable es la Microsoft Research License, heredada de Orca-2-13b, lo que restringe el uso comercial.

Es relevante ahora como ejemplo de la práctica de model merging para ajustar el estilo conversacional de un modelo base instruct sin reentrenamiento, y como caso de estudio de los riesgos de fusionar tokenizadores en merges de modelos con vocabularios distintos. Su adopción es reducida (40 descargas, 3 likes), por lo que debe tratarse como un experimento comunitario más que como un modelo de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), denso |
| Parámetros totales | 13.015.864.320 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens nativos vía YaRN (original: 4.096) |
| Tipos de cuantización | GGUF (disponible en el repo); cuantizaciones concretas no disponibles |
| Idiomas soportados | no disponible |
| Licencia | microsoft-research-license (other) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es una fusión por gradiente SLERP de dos modelos Llama 2 de 13B: Microsoft Orca-2-13b (entrenado con datos de traza de razonamiento y destilación de GPT-4 según su model card original) y Noromaid-v0.1.1-13b (un merge orientado a roleplay y conversación natural). No hay entrenamiento adicional sobre el modelo fusionado: el resultado es una interpolación de pesos con sesgo hacia Orca, seguida de una extensión de contexto mediante YaRN hasta 32.768 tokens. La innovación técnica principal de esta revisión FIX es la corrección del tokenizador fusionado, que en la v2 impedía la emisión correcta del token de parada y generaba tokens ChatML truncados.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre fases de RLHF o DPO específicas de este merge; esos datos pertenecen a los modelos originales y no se detallan en la información proporcionada. El formato de prompt es Alpaca, con tokens BOS `<s>` y EOS `</s>`.

## Capacidades

- Generación de texto conversacional con un tono declarado como más natural y humano que el del modelo base.
- Seguimiento de instrucciones en formato Alpaca, con soporte para system prompt personalizado.
- Razonamiento y resolución de tareas descritas en lenguaje natural, heredado de Orca-2-13b.
- Contexto largo de hasta 32.768 tokens mediante YaRN, útil para documentos extensos o conversaciones multi-turno.
- Soporte de tool calling / function calling: no disponible (no se documenta en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta explícitamente).
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Asistentes conversacionales con personalidad: el merge está optimizado para un estilo natural y humano, adecuado para chatbots de cara al usuario donde la fluidez importa más que la precisión factual estricta.
- Procesamiento de documentos largos: con 32.768 tokens de contexto vía YaRN, puede resumir o extraer información de contratos, informes o transcripciones extensas en una sola pasada.
- Generación creativa y escritura asistida: la influencia de Noromaid favorece la prosa narrativa, diálogos y roleplay, útil en herramientas de escritura o videojuegos.
- Prototipado rápido de aplicaciones de chat: al estar disponible en GGUF y safetensors, se puede desplegar en local con llama.cpp u Ollama para validar ideas sin coste de API.
- Investigación sobre model merging: sirve como caso práctico para estudiar el efecto de SLERP, el sesgo de interpolación y los problemas de fusión de tokenizadores.
- Fine-tuning comunitario: al ser un modelo de 13B en safetensors, es viable ajustarlo con LoRA en una sola GPU de 24 GB en cuantización o con técnicas de ahorro de memoria, para dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 26 GB en FP16 para los 13B completos; en torno a 7-8 GB en cuantización Q4_K_M y 5-6 GB en Q3.
- GPU recomendadas: A100 40/80 GB o H100 para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado o cuantizaciones altas; RTX 3090/4080 para cuantizaciones Q4/Q5.
- Cabe en GPU de consumo: sí, en cuantizaciones GGUF de 4-5 bits en tarjetas de 8-12 GB, con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (el repo incluye tag `text-generation-inference`), transformers con safetensors, y endpoints compatibles.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OrcaMaid-v2-FIX-13b-32k | 13B | 32.768 (YaRN) | Microsoft Research License | HF, safetensors + GGUF |
| Microsoft Orca-2-13b | 13B | 4.096 | Microsoft Research License | HF |
| Noromaid-v0.1.1-13b | 13B | 4.096 (aprox.) | no disponible en la información | HF |
| Llama 2 13B Chat | 13B | 4.096 | Llama 2 Community License | HF, amplia disponibilidad |

Los datos de rendimiento comparativo entre estos modelos no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Licencia Microsoft Research License: restringe el uso comercial; es imprescindible revisar los términos antes de cualquier despliegue en producción.
- Riesgo de alucinación inherente a los modelos de 13B de la generación Llama 2, especialmente en tareas factuales y de razonamiento complejo.
- El formato de prompt es Alpaca, no ChatML; usar plantillas ChatML puede degradar la calidad o romper la parada de generación, como ocurrió en la v2 original.
- La extensión de contexto vía YaRN a 32.768 tokens puede degradar la calidad en las posiciones más lejanas del contexto; conviene validar el rendimiento real en tareas de contexto largo.
- Idiomas soportados no documentados: el comportamiento multilingüe es incierto y probablemente limitado al inglés.
- Modelo de nicho con adopción muy baja (40 descargas): sin garantías de mantenimiento, soporte ni validación comunitaria extensa.
- El merge de tokenizadores es un punto frágil conocido; verificar la tokenización y los tokens de parada antes de integrarlo en pipelines de producción.
- No se documentan capacidades de tool calling ni de agentes, por lo que no es recomendable asumirlas sin evaluación previa.

## Enlaces

- Hugging Face: https://huggingface.co/ddh0/OrcaMaid-v2-FIX-13b-32k
- Microsoft Orca-2-13b: https://huggingface.co/microsoft/Orca-2-13b
- Licencia Microsoft Research: https://huggingface.co/microsoft/Orca-2-13b/blob/main/LICENSE
- Noromaid-v0.1.1-13b: https://huggingface.co/NeverSleep/Noromaid-13b-v0.1.1
- mergekit (herramienta de fusión): https://github.com/cg123
