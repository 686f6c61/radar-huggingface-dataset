# atamtensor/d3-lite-m75

## Resumen

d3-lite-m75 es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-0.8B, desarrollado por el usuario atamtensor y publicado bajo licencia Apache-2.0. Forma parte del ecosistema "Zils d3-lite soup pool" asociado a la subred 127 de Bittensor, un entorno de modelos colaborativos donde distintos autores aportan "cuerpos" (bodies) que se combinan mediante técnicas de model soup. El modelo emplea la disposición de "chasis" d3-lite y conserva la torre de visión del modelo padre.

Con 852.985.920 parámetros totales (aproximadamente 0,85 mil millones), el modelo se sitúa en la categoría de modelos pequeños, adecuado para despliegues con recursos limitados. El repositorio ocupa 1,7 GB en formato safetensors y los pesos están en BF16. La información disponible no especifica la longitud de contexto, los idiomas soportados ni los tipos de cuantización, por lo que estos datos se indican como no disponibles.

La relevancia de este modelo radica en su naturaleza experimental dentro de un pool colaborativo: se construye a partir de la media uniforme de dos cuerpos d3-lite previos (DouglasBashir/zils-lite-r6 y BashirEmran/d3-lite-body-a2), a los que se aplican tres ejecuciones LoRA y una fusión posterior. No obstante, la información publicada es escasa y no se han divulgado resultados de benchmarks ni detalles completos de arquitectura.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-0.8B, con torre de visión del modelo padre) |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Qwen/Qwen3.5-0.8B, adaptada a la disposición de chasis d3-lite. Conserva la torre de visión del modelo padre, lo que sugiere capacidades multimodales heredadas, aunque no se detalla el alcance de dichas capacidades. Los pesos de lenguaje fueron entrenados específicamente en este ajuste.

El proceso de entrenamiento parte de la media uniforme de dos cuerpos d3-lite previos (DouglasBashir/zils-lite-r6 y BashirEmran/d3-lite-body-a2, ambos Apache-2.0). Sobre ese punto de partida se ejecutaron tres LoRA de rango 32 (r32) con tasa de aprendizaje 1e-4, variando semillas y órdenes de datos. El resultado final se obtiene sumando al punto de partida 0,75 veces el cambio promedio de esas tres ejecuciones. Los datos de entrenamiento consistieron en ítems de decisión construidos a partir de splits públicos de entrenamiento (PIQA, Social IQa, MNLI, RTE, ANLI, QNLI, STS-B, BoolQ, 20 Newsgroups, emotion, tweet_eval, poem sentiment, BANKING77, SciQ, COPA, WiC, MRPC, CoLA, QQP, BIG-bench train splits) y en ítems generados por reglas (aritmética, política de tool-call, cobertura de atributos, sílabas CMUdict, inflexión UniMorph). No se utilizaron ítems del examen del validador, ítems semilla públicos ni filas de validación/test reservadas.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.5-0.8B.
- Capacidades de visión potenciales gracias a la torre de visión conservada del modelo padre, aunque no se especifica su alcance ni rendimiento.
- Entrenamiento específico en ítems de decisión y clasificación (MNLI, RTE, ANLI, QNLI, BoolQ, COPA, WiC, etc.).
- Entrenamiento en tareas de análisis de sentimiento y emoción (emotion, tweet_eval, poem sentiment).
- Entrenamiento en clasificación de intenciones (BANKING77) y clasificación de noticias (20 Newsgroups).
- Entrenamiento en tareas de similitud semántica y paráfrasis (STS-B, MRPC, QQP).
- Entrenamiento en corrección gramatical (CoLA) y preguntas de ciencia (SciQ).
- Entrenamiento en aritmética y política de tool-call mediante ítems generados por reglas, lo que sugiere soporte básico de function calling.
- Capacidades multilingües: no disponibles según la información publicada.

## Casos de uso

- Clasificación de texto en producción: el modelo fue entrenado con splits de MNLI, RTE, ANLI, QNLI, BoolQ, COPA, WiC, MRPC, CoLA y QQP, por lo que puede emplearse para tareas de inferencia textual, entailment y similitud semántica en pipelines de NLP.
- Análisis de sentimiento y emoción: el entrenamiento con emotion, tweet_eval y poem sentiment lo hace adecuado para monitorización de opiniones en redes sociales o análisis de reseñas.
- Clasificación de intenciones en asistentes conversacionales: el uso de BANKING77 sugiere aplicabilidad en enrutamiento de consultas bancarias o de atención al cliente.
- Corrección gramatical y control de calidad de texto: el entrenamiento con CoLA permite su uso como corrector o filtro en herramientas de edición.
- Respuesta a preguntas de ciencia: el entrenamiento con SciQ lo hace utilizable en entornos educativos o de divulgación científica para preguntas de opción múltiple.
- Soporte de tool-call en agentes: los ítems generados por reglas sobre política de tool-call indican que el modelo puede integrarse en flujos de function calling, aunque su tamaño reducido limita la complejidad de los planes multi-paso.
- Prototipado e investigación en model soups: al ser un modelo experimental de un pool colaborativo, sirve como base para estudiar técnicas de fusión de pesos, LoRA y merging en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,7 GB solo para los pesos, más overhead de activaciones y caché KV; se recomienda al menos 4 GB de VRAM para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9 GB para pesos; en 4 bits, alrededor de 0,5 GB.
- GPU recomendadas: cualquier GPU consumer moderna con 4-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; también cabe en GPUs de datacenter como A100 o H100, aunque están sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, en la mayoría de GPUs con 4 GB o más de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, TGI y transformers con safetensors. La disponibilidad de GGUF no está confirmada en la información publicada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| d3-lite-m75 | 852.985.920 | no disponible | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (modelo base) | ~0,8B | no disponible | no disponible | Hugging Face |
| DouglasBashir/zils-lite-r6 (cuerpo previo) | no disponible | no disponible | Apache-2.0 | Hugging Face |
| BashirEmran/d3-lite-body-a2 (cuerpo previo) | no disponible | no disponible | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Información muy escasa: no se especifican contexto, idiomas, cuantizaciones ni benchmarks, lo que dificulta evaluar su idoneidad para producción.
- Riesgo de alucinación inherente a los modelos de ~0,85B parámetros, especialmente en tareas de razonamiento complejo o generación abierta.
- Sesgos potenciales heredados del modelo base Qwen3.5-0.8B y de los splits de datos públicos utilizados (redes sociales, noticias, banca), que pueden reflejar sesgos demográficos o culturales.
- Capacidades multimodales no verificadas: aunque conserva la torre de visión, no se documenta su funcionamiento ni su calidad.
- Licencia Apache-2.0 permite uso comercial, pero al ser un modelo experimental sin validación externa, se recomienda evaluarlo exhaustivamente antes de desplegarlo.
- El entrenamiento excluyó ítems del examen del validador y filas de test, pero no se aportan métricas de generalización.
- Fecha de creación futura (2026-11-17) en los metadatos, lo que puede indicar datos inconsistentes o un entorno de publicación experimental.

## Enlaces

- Hugging Face: https://huggingface.co/atamtensor/d3-lite-m75
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuerpo previo DouglasBashir/zils-lite-r6: https://huggingface.co/DouglasBashir/zils-lite-r6
- Cuerpo previo BashirEmran/d3-lite-body-a2: https://huggingface.co/BashirEmran/d3-lite-body-a2
