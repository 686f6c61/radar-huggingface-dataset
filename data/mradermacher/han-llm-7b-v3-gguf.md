# mradermacher/han-llm-7b-v3-GGUF

## Resumen

Han LLM 7B v3 es un modelo de lenguaje de 7.268.102.144 parámetros (aproximadamente 7,3 mil millones) desarrollado originalmente por Wannaphong Phatthiyaphaibun (wannaphong) y especializado en tailandés. La versión aquí descrita es la cuantización GGUF publicada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y entornos compatibles con GGUF. El modelo está afinado para instrucciones a partir del dataset `pythainlp/han-instruct-dataset-v2.0`, lo que lo orienta a tareas conversacionales y de seguimiento de instrucciones en tailandés.

La relevancia de esta ficha radica en que cubre un nicho poco atendido: modelos abiertos de tamaño medio (7B) con competencia real en tailandés, un idioma con escasa representación en la mayoría de LLM multilingües. Al distribuirse bajo licencia Apache 2.0 y en formato GGUF, es desplegable en local sin dependencias de API, lo que facilita su uso en entornos con requisitos de privacidad o de coste.

No se dispone de información pública sobre la longitud de contexto, la arquitectura exacta ni los detalles de entrenamiento en la información proporcionada; se indica como "no disponible" en los apartados correspondientes. La model card original es escueta y se limita a declarar el modelo base, el dataset de instrucciones y la licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `wannaphong/han-llm-7b-v3`; presumiblemente transformer decoder-only, sin confirmar) |
| Parámetros totales | 7.268.102.144 |
| Parámetros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | tailandés (th) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base original presumiblemente en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. El modelo base `wannaphong/han-llm-7b-v3` tiene 7.268.102.144 parámetros y está etiquetado con `library_name: transformers`, lo que indica compatibilidad con el ecosistema Hugging Face. No se especifica si emplea atención lineal, decodificación especulativa u otras innovaciones técnicas.

El entrenamiento de instrucciones se realizó sobre el dataset `pythainlp/han-instruct-dataset-v2.0`, un conjunto de datos de instrucciones en tailandés mantenido por PyThaiNLP. No se dispone de información sobre el número de tokens de preentrenamiento, la composición del corpus base, ni sobre si se aplicaron técnicas de RLHF o DPO. La model card de la cuantización no aporta detalles adicionales más allá de la procedencia de los pesos y los tipos de cuantización ofrecidos.

## Capacidades

- Generación de texto en tailandés con ajuste a instrucciones (instruction following) gracias al fine-tuning sobre `han-instruct-dataset-v2.0`.
- Conversación multi-turno: el tag `conversational` en Hugging Face indica soporte para diálogo.
- Razonamiento y respuesta a preguntas en tailandés, derivado del ajuste de instrucciones.
- Generación de código y matemáticas: no confirmado explícitamente en la información disponible; probablemente limitado en comparación con modelos multilingües grandes.
- Tool calling / function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al tailandés según la etiqueta de idioma; no se declara soporte para otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Atención al cliente en tailandés: el modelo puede gestionar conversaciones multi-turno en tailandés gracias a su ajuste de instrucciones, adecuado para chatbots de soporte en empresas que operan en Tailandia y necesitan despliegue local por privacidad.
- Procesamiento de documentos en tailandés: resumen, extracción de información y reescritura de textos en tailandés en pipelines internos, ejecutables con llama.cpp sin enviar datos a terceros.
- Asistentes conversacionales embebidos: al caber en cuantizaciones Q4 (4,3-4,5 GB), puede desplegarse en estaciones de trabajo con GPU de consumo para asistentes de escritorio en tailandés.
- Generación de contenido editorial en tailandés: borradores de artículos, correos y publicaciones para equipos de marketing o comunicación que trabajan en tailandés.
- Investigación en NLP tailandés: como baseline abierto (Apache 2.0) para experimentos de fine-tuning, evaluación o comparación con otros modelos en tailandés.
- Educación y tutoría: respuestas a preguntas y explicaciones en tailandés en entornos educativos con requisitos de soberanía de datos.
- Prototipado rápido en local: gracias a la variedad de cuantizaciones (desde Q2_K de 2,8 GB hasta f16 de 14,6 GB), permite experimentar en portátiles y equipos sin GPU dedicada mediante llama.cpp u Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, más overhead de contexto y KV cache):
  - Q2_K: ~2,8 GB de pesos; ~4 GB de VRAM en total con contexto moderado.
  - Q4_K_M: ~4,5 GB de pesos; ~6-7 GB de VRAM en total.
  - Q8_0: ~7,8 GB de pesos; ~9-10 GB de VRAM en total.
  - f16: ~14,6 GB de pesos; ~16-17 GB de VRAM en total.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q8; A100/H100 no necesarias para este tamaño, aunque válidas para serving concurrente.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más usando Q4_K_M o inferiores; en 6 GB con Q3_K_M o Q2_K.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF; también puede usarse el modelo base con transformers y vLLM/TGI si se dispone de los pesos originales.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| han-llm-7b-v3 (esta ficha) | 7,27 B | no disponible | tailandés | Apache 2.0 | GGUF, transformers | Especializado en tailandés |
| Typhoon 7B (SCB 10X) | ~7 B | no disponible en esta ficha | tailandés, inglés | no disponible aquí | safetensors, GGUF (comunidad) | Alternativa tailandesa de referencia; no comparado con datos en esta información |
| SEA-LION 7B (AI Singapore) | ~7 B | no disponible en esta ficha | lenguas del sudeste asiático | no disponible aquí | safetensors | Cobertura multilingüe del sudeste asiático; no comparado con datos en esta información |
| Llama 3.1 8B | 8,03 B | 128 K | multilingüe (incluye tailandés limitado) | Llama 3.1 Community License | safetensors, GGUF | Mayor contexto y ecosistema, pero tailandés menos especializado |

Nota: los datos de los modelos comparables no provienen de la información proporcionada en esta ficha y deben verificarse en sus respectivas model cards. No se dispone de benchmarks comparativos publicados para este modelo.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre un dataset de instrucciones en tailandés, puede reflejar sesgos culturales y lingüísticos de dicho corpus.
- Riesgo de alucinación: inherente a los modelos de 7B; no se han publicado evaluaciones de fidelidad factual.
- Limitaciones de contexto o idioma: el modelo declara únicamente tailandés; su rendimiento en castellano, inglés u otros idiomas no está garantizado y probablemente sea deficiente. La longitud de contexto no está documentada.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación con atribución; aun así, conviene revisar la licencia del modelo base original por si hubiera condiciones adicionales no reflejadas en esta ficha.
- Caveats para producción: la cuantización GGUF introduce pérdida de calidad, especialmente en Q2_K y Q3; se recomienda Q4_K_M o superior para uso serio. No hay información sobre tool calling ni sobre robustez frente a prompts adversarios. El repo ocupa 64,2 GB por incluir todas las cuantizaciones; descargar solo el archivo necesario.
- La model card de la cuantización es genérica y no aporta garantías de calidad ni evaluaciones del modelo cuantizado.

## Enlaces

- Repositorio Hugging Face de la cuantización: https://huggingface.co/mradermacher/han-llm-7b-v3-GGUF
- Modelo base original: https://huggingface.co/wannaphong/han-llm-7b-v3
- Dataset de instrucciones: https://huggingface.co/datasets/pythainlp/han-instruct-dataset-v2.0
- Página de descargas del autor de cuantizaciones: https://hf.tst.eu/model#han-llm-7b-v3-GGUF
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
