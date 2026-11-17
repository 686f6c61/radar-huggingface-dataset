# mradermacher/Wistral-7B-Instruct-v0.3-GGUF

## Resumen

Wistral-7B-Instruct-v0.3-GGUF es la version cuantizada en formato GGUF del modelo BarraHome/Wistral-7B-Instruct-v0.3, publicada por mradermacher el 18 de diciembre de 2024. Se trata de una conversión de pesos a cuantizaciones estáticas de tipo K-quant e IQ-quant para su uso con llama.cpp y runtimes compatibles con GGUF, lo que permite ejecutar un modelo de 7.241.732.096 parámetros en hardware de consumo. El modelo base es un fine-tuning de instrucciones sobre Mistral-7B, entrenado con la librería Unsloth y TRL, según indican las etiquetas del repositorio.

El modelo resuelve el problema de despliegue de un transformer denso de 7B en entornos con recursos limitados: las cuantizaciones disponibles abarcan desde Q2_K (2,8 GB) hasta f16 (14,6 GB), lo que cubre desde GPUs de gama baja hasta estaciones de trabajo. Está orientado a generación de texto conversacional en inglés y se distribuye bajo licencia Apache 2.0, lo que facilita su integración en productos comerciales sin obligaciones de atribución adicionales más allá de las de dicha licencia.

La relevancia actual del repositorio radica en que ofrece una vía práctica y ligera para evaluar el fine-tuning Wistral sin necesidad de infraestructura dedicada. No obstante, la información pública disponible sobre el modelo base es escasa: no se documentan detalles de entrenamiento, composición del dataset ni resultados de benchmarks, por lo que esta ficha refleja únicamente los datos verificables del repositorio y de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Mistral-7B, segun etiquetas del repo) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de 7.241.732.096 parámetros, derivado de la familia Mistral-7B según las etiquetas del repositorio (`mistral`, `unsloth`, `trl`). El fine-tuning de instrucciones se realizó presumiblemente con Unsloth y TRL, herramientas habituales para ajuste eficiente de modelos de 7B, pero la model card no especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documenta ninguna innovación arquitectónica propia: las capacidades del modelo heredan las del checkpoint base sobre el que se ajustó.

Este repositorio concreto no contiene entrenamiento adicional: es una conversión de pesos a GGUF realizada por mradermacher mediante cuantización estática (el autor indica `quantize_version: 2` y `output_tensor_quantised: 1`). No se han publicado cuantizaciones ponderadas por imatrix para este modelo en el momento de la consulta, aunque el autor deja abierta la posibilidad de generarlas si se solicita. La conversión se realizó desde el formato Hugging Face (`convert_type: hf`).

## Capacidades

- Generación de texto conversacional en inglés, orientada a instrucciones y diálogo multi-turno.
- Razonamiento y respuesta a preguntas de propósito general, heredado del modelo base Mistral-7B.
- Generación de código y tareas de escritura, en la medida en que el fine-tuning base las conserve (no documentado explícitamente).
- Soporte de tool calling y function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentación.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Prototipado local de asistentes conversacionales: con la cuantización Q4_K_M (4,5 GB) el modelo cabe en una GPU de consumo de 8 GB y permite iterar sobre prompts y flujos de diálogo sin coste de API.
- Evaluación comparativa de fine-tunings de Mistral-7B: al estar disponible en múltiples niveles de cuantización (de Q2_K a f16), permite medir el impacto de la cuantización en la calidad de las respuestas sobre un mismo checkpoint.
- Despliegue en entornos con CPU o GPUs integradas: las variantes Q2_K (2,8 GB) y Q3_K_S (3,3 GB) permiten ejecutar el modelo en equipos sin GPU dedicada mediante llama.cpp.
- Generación de texto en pipelines offline: al ser un GGUF autocontenido y con licencia Apache 2.0, se puede embeber en herramientas de escritorio o scripts de procesamiento por lotes sin dependencias de servicios externos.
- Experimentación educativa con cuantización: el repositorio incluye una tabla completa de variantes con tamaños y notas de calidad, útil para demostrar el compromiso entre tamaño y fidelidad en un curso sobre LLMs.
- Base para fine-tuning posterior con Unsloth: el modelo base se entrenó con esta herramienta, por lo que sirve como punto de partida documentado para ajustes adicionales en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): 2,8 GB (Q2_K), 3,3 GB (Q3_K_S), 4,0 GB (IQ4_XS), 4,5 GB (Q4_K_M), 5,2 GB (Q5_K_M), 6,0 GB (Q6_K), 7,8 GB (Q8_0), 14,6 GB (f16).
- GPU recomendadas: RTX 3060 12 GB o superior para Q4_K_M y Q5_K_M; RTX 4090 o A100/H100 para f16 y para contextos largos con Q8_0.
- Cabe en GPU de consumo: sí, desde Q2_K hasta Q6_K en tarjetas de 8-12 GB; Q8_0 requiere 12 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference (etiqueta `text-generation-inference` en el repo), y cualquier runtime compatible con GGUF. El modelo base también puede servirse con vLLM en formato safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Wistral-7B-Instruct-v0.3-GGUF (este) | 7,24B | no disponible | Apache 2.0 | GGUF | Fine-tuning de Mistral-7B; solo ingles; sin benchmarks publicados |
| Mistral-7B-Instruct-v0.3 | 7,24B | 32.768 tokens (segun documentacion publica de Mistral) | Apache 2.0 | safetensors, GGUF | Modelo de referencia de la familia; benchmarks publicos disponibles |
| Zephyr-7B-beta | 7,24B | 32.768 tokens | MIT | safetensors, GGUF | Fine-tuning DPO de Mistral-7B; benchmarks publicos |
| Llama-3.1-8B-Instruct | 8,03B | 131.072 tokens | Llama 3.1 Community License | safetensors, GGUF | Multilingue; requiere aceptar licencia de Meta |

La comparativa se limita a modelos de la misma categoría (7-8B densos, instrucciones). Para Wistral no hay datos de contexto ni de rendimiento publicados, por lo que la comparación cuantitativa no es posible; la ventaja principal frente a Mistral-7B-Instruct-v0.3 es la disponibilidad de cuantizaciones estáticas listas para usar, y la desventaja es la ausencia de documentación sobre el fine-tuning y de benchmarks que justifiquen su elección frente al modelo original.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de Mistral-7B, es previsible que herede sesgos del corpus de entrenamiento original, pero no hay evaluación publicada.
- Riesgo de alucinación: no cuantificado; al no haber benchmarks ni evaluación de fidelidad, no se puede estimar su tasa de alucinación frente a alternativas.
- Limitaciones de idioma: el modelo está etiquetado únicamente para inglés (`language: en`); su rendimiento en castellano no está documentado y probablemente sea inferior.
- Limitaciones de contexto: la longitud de contexto no se especifica en la model card; no debe asumirse la ventana de 32K de Mistral-7B-Instruct-v0.3 sin verificación empírica.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución y aviso de cambios; no obstante, el modelo base podría arrastrar obligaciones adicionales si su licencia difiere, algo que no se puede verificar con la información disponible.
- Caveat para producción: el autor no ofrece cuantizaciones imatrix para este modelo, lo que puede reducir la calidad en las variantes de 2-4 bits frente a alternativas con calibración ponderada. Además, el modelo base tiene pocas descargas (143) y ningún "like", lo que sugiere escasa validación por parte de la comunidad.
- El repositorio ocupa 63,9 GB en total por incluir todas las variantes; conviene descargar solo el archivo GGUF necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Wistral-7B-Instruct-v0.3-GGUF
- Modelo base: https://huggingface.co/BarraHome/Wistral-7B-Instruct-v0.3
- Página de descargas del autor: https://hf.tst.eu/model#Wistral-7B-Instruct-v0.3-GGUF
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
