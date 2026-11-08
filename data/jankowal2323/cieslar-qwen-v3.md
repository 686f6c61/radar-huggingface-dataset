# jankowal2323/cieslar-qwen-v3

## Resumen

CIESLAR-QWEN v3 es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-4B desarrollado por el usuario jankowal2323. Se trata de una edición personalizada que emplea LoRA mediante la pila de entrenamiento Unsloth sobre el modelo base de 4.326.350.848 parámetros. El objetivo declarado por el autor es dotar al modelo de un estilo de respuesta propio, una personalidad coherente y una firma publicitaria de CieslarCoin, orientada a conversación en polaco e inglés.

El modelo se distribuye en formato GGUF, lo que facilita su despliegue en entornos de inferencia local mediante llama.cpp u Ollama. La licencia es Apache 2.0, heredada del modelo base, y el repositorio ocupa 8,1 GB. No se han publicado resultados de benchmarks ni detalles sobre el conjunto de datos de entrenamiento, el número de tokens utilizados o la composición del corpus.

Por su tamaño (aproximadamente 4,3 mil millones de parámetros) y su naturaleza de ajuste conversacional, el modelo se posiciona en la categoría de modelos pequeños para generación de texto en local, aunque su especialización estilística y la ausencia de documentación técnica limitan su evaluación rigurosa en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B); detalles específicos no disponibles |
| Parametros totales | 4.326.350.848 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: Q4_K_M (recomendado para móvil), Q8_0 (recomendado para PC); otras cuantizaciones no disponibles |
| Idiomas soportados | Polaco (pl), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de 8,1 GB); no se indica disponibilidad de safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen/Qwen3.5-4B, un transformer de aproximadamente 4,3 mil millones de parámetros. El ajuste fino se realizó con la técnica LoRA (Low-Rank Adaptation) utilizando Unsloth como pila de entrenamiento, según indica la model card. No se especifican el rango de LoRA, la tasa de aprendizaje, el número de pasos, el tamaño del conjunto de datos ni la composición del corpus de entrenamiento.

La model card menciona que la misión del ajuste es proporcionar un estilo de respuesta propio, una personalidad coherente y una firma con publicidad de CieslarCoin. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación adicionales. Tampoco se detallan innovaciones técnicas como decodificación especulativa o atención lineal; cualquier innovación de este tipo provendría del modelo base Qwen3.5-4B, cuyas características concretas no se detallan en la información proporcionada.

## Capacidades

- Generación de texto conversacional en polaco e inglés, con un estilo y personalidad definidos por el ajuste fino.
- Respuestas con firma publicitaria de CieslarCoin, según la misión declarada en la model card.
- Modo de pensamiento (thinking mode) desactivado por recomendación del autor; no se documenta su comportamiento si se activa.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües limitadas a polaco e inglés según los tags del repositorio.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistente conversacional en polaco para atención al cliente: el modelo puede mantener diálogos multi-turno en polaco con un tono consistente, aunque se desconoce la longitud de contexto efectiva y no se recomienda para flujos críticos sin evaluación previa.
- Generación de contenido de marca: adecuado para producir textos con una voz corporativa concreta (en este caso, la identidad Cieslar) gracias al ajuste estilístico mediante LoRA.
- Prototipado rápido en local: al distribuirse en GGUF con cuantización Q4_K_M, puede ejecutarse en dispositivos móviles o equipos de gama baja para pruebas de concepto.
- Chatbot de comunidad o foro en inglés y polaco: el modelo puede gestionar respuestas conversacionales en ambos idiomas, aunque la ausencia de benchmarks impide garantizar calidad en dominios técnicos.
- Experimentación con ajustes finos sobre Qwen3.5-4B: sirve como ejemplo de pipeline LoRA + Unsloth para desarrolladores que quieran replicar el proceso.
- Generación de respuestas con firma promocional: útil en escenarios donde se requiera insertar un mensaje de marca de forma sistemática en las respuestas.
- Inferencia en el borde (edge computing): la cuantización Q4_K_M y el tamaño de aproximadamente 4,3 mil millones de parámetros permiten desplegarlo en entornos con recursos limitados, siempre que se acepte la falta de documentación sobre latencia y throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 4,3 mil millones de parámetros en GGUF Q4_K_M se puede estimar un consumo en torno a 3-4 GB, y en Q8_0 en torno a 5-6 GB, aunque son estimaciones orientativas no confirmadas por el autor.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cabría esperar compatibilidad con GPU consumer de gama media-alta (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090), pero no hay confirmación oficial.
- ¿Cabe en GPU consumer? Probablemente sí en cuantización Q4_K_M y Q8_0, según el tamaño del modelo; sin datos oficiales de consumo real.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; vLLM y TGI no están confirmados para este repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| CIESLAR-QWEN v3 | 4,33 B | No disponible | Apache 2.0 | GGUF | Fine-tune LoRA de Qwen3.5-4B, idiomas pl/en |
| Qwen/Qwen3.5-4B (base) | ~4 B | No disponible en la información | Apache 2.0 (según modelo base) | No disponible | Modelo original sin ajuste estilístico; referencia directa |
| jankowal2323/cieslar-qwen (versión previa) | No disponible | No disponible | Apache 2.0 | GGUF | Versión anterior del mismo autor, con tags pl/en y fine-tuned |

No se dispone de datos de rendimiento comparativo (benchmarks) para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible evaluar su calidad frente al modelo base ni frente a alternativas.
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño; no se documentan medidas de mitigación.
- Sesgos conocidos: no documentados; el ajuste fino con un corpus no especificado puede introducir sesgos estilísticos o de contenido relacionados con la identidad Cieslar y CieslarCoin.
- Limitaciones de contexto e idioma: solo se declaran polaco e inglés; la longitud de contexto no está disponible, lo que impide planificar casos de uso con documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo incluye una firma publicitaria de CieslarCoin que puede aparecer en las respuestas, lo que puede ser inapropiado para producción sin filtrado posterior.
- Caveat para producción: la model card recomienda desactivar el thinking mode y usar temperaturas de 0,3-0,5; no se especifica el comportamiento fuera de ese rango.
- Documentación técnica insuficiente: no se detallan datos de entrenamiento, hiperparámetros de LoRA ni proceso de evaluación, lo que dificulta la reproducibilidad.
- Fecha de creación futura (2026-11-08) en los metadatos del repositorio, lo que puede indicar inconsistencias en la publicación.

## Enlaces

- Hugging Face: https://huggingface.co/jankowal2323/cieslar-qwen-v3
- Versión previa del autor: https://huggingface.co/jankowal2323/cieslar-qwen
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Artículo sobre Qwen3 (contexto de la familia): https://www.analyticsvidhya.com/blog/2025/04/qwen3/
