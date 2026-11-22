# joamCriff123/zils-mini-m1121t

## Resumen

zils-mini-m1121t es un modelo de decisión (decision model) publicado por el usuario joamCriff123 en Hugging Face, construido como un fine-tune del modelo base Qwen/Qwen3.5-4B. Forma parte de lo que el autor denomina "d3-mini decision body" para el "Zils subnet 127 mini pool", una infraestructura de la que no se proporciona documentación adicional en la información disponible. El modelo está etiquetado con el pipeline de feature-extraction, lo que sugiere que su uso previsto se orienta a la extracción de representaciones o a la toma de decisiones internas dentro de un sistema mayor, más que a la generación de texto conversacional.

Técnicamente, el checkpoint contiene 4.539.265.536 parámetros en formato safetensors (aproximadamente 4,54 mil millones), lo que encaja con la familia Qwen3.5-4B sobre la que se apoya. El repositorio ocupa 9,1 GB, un tamaño coherente con pesos en precisión de 16 bits. La licencia es Apache-2.0, lo que permite uso comercial con atribución, y el modelo declara compatibilidad con endpoints.

Su relevancia actual es limitada: se trata de una publicación reciente (creada el 21 de noviembre de 2026) con cero descargas y cero "likes", sin model card detallada más allá de una descripción de una línea. No se han publicado resultados de benchmarks, idiomas soportados ni detalles sobre el proceso de entrenamiento, por lo que cualquier evaluación debe realizarse empíricamente por parte del usuario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, según el modelo base Qwen/Qwen3.5-4B); detalles específicos no disponibles |
| Parámetros totales | 4.539.265.536 (≈4,54 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers, custom_code) |

## Arquitectura y entrenamiento

El modelo se presenta como un fine-tune del base Qwen/Qwen3.5-4B, por lo que hereda la arquitectura transformer de dicha familia. La model card no aporta detalles sobre la arquitectura interna (número de capas, dimensiones ocultas, mecanismo de atención, uso de atención lineal o decodificación especulativa). El tag `custom_code` indica que la carga requiere código personalizado incluido en el repositorio, y el tag `qwen3_5` confirma la arquitectura de origen.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset de ajuste fino, ni si se aplicaron técnicas de RLHF, DPO o instrucción supervisada. El autor describe el modelo como un "decision body" para un "mini pool" de la subnet 127 de Zils, lo que sugiere un entrenamiento orientado a tareas de decisión dentro de un protocolo específico, pero no se documenta el procedimiento. Tampoco se detalla si hubo destilación, poda o alguna innovación técnica destacable.

## Capacidades

- Extracción de características (feature-extraction): es el pipeline declarado en Hugging Face, por lo que el uso principal es generar representaciones vectoriales a partir de entradas de texto.
- Toma de decisiones: el autor lo etiqueta como `decision-model` y `d3-mini`, lo que apunta a un uso como componente de decisión dentro del ecosistema Zils.
- Herencia de Qwen3.5-4B: al ser un fine-tune del base, podría conservar capacidades de generación de texto, razonamiento y multilingüismo del modelo original, aunque no se confirma en la model card.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el campo de idiomas está vacío).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Extracción de embeddings para sistemas de recuperación: el pipeline declarado es feature-extraction, por lo que puede emplearse para generar vectores de documentos o consultas en un pipeline RAG, siempre que se valide empíricamente la calidad de las representaciones.
- Componente de decisión en el ecosistema Zils: el modelo está diseñado como "decision body" para la subnet 127 mini pool, de modo que su uso natural es integrarlo en dicho protocolo como módulo de decisión.
- Clasificación y enrutamiento interno: al tratarse de un modelo de decisión, puede emplearse para elegir entre acciones o rutas dentro de un sistema mayor, aunque no se documentan las clases ni el formato de salida.
- Base para fine-tuning específico: al estar bajo Apache-2.0 y partir de Qwen3.5-4B, sirve como punto de partida para ajustes posteriores en tareas de decisión o extracción de características.
- Experimentación académica con modelos de decisión: su tamaño de 4,54 mil millones de parámetros permite probarlo en una GPU de gama alta consumer, lo que facilita la investigación reproducible.
- Evaluación comparativa de fine-tunes sobre Qwen3.5-4B: puede usarse como referencia en estudios que comparen variantes ajustadas del mismo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 9,1 GB solo para los pesos (4,54 mil millones de parámetros × 2 bytes), más overhead de activaciones y contexto; se recomienda un mínimo de 12-16 GB de VRAM.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5-5 GB para pesos, con overhead adicional.
- VRAM estimada en cuantización de 4 bits: alrededor de 2,3-3 GB para pesos, con overhead adicional (no se publican cuantizaciones oficiales).
- GPU recomendadas: A100, H100 o L40S para despliegue en producción; RTX 4090 (24 GB) o RTX 3090 (24 GB) para FP16 sin problemas; RTX 4080 (16 GB) o RTX 4070 Ti (12 GB) para FP16 ajustado o cuantización.
- ¿Cabe en GPU consumer? Sí, en tarjetas con 12 GB o más en cuantización, y en 16-24 GB en FP16.
- Opciones de despliegue: transformers (librería declarada, con `custom_code`), vLLM, TGI o llama.cpp si se generan cuantizaciones GGUF (no publicadas). Ollama requeriría convertir los pesos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-m1121t | 4,54 mil millones | no disponible | Apache-2.0 | Hugging Face (0 descargas) | Fine-tune de Qwen3.5-4B para decisión |
| Qwen/Qwen3.5-4B | ≈4 mil millones (según familia) | no disponible en esta ficha | no disponible en esta ficha | Hugging Face (modelo base) | Base original, sin ajuste de decisión |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se identifican modelos comparables en la información proporcionada |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas publicadas que permitan evaluar su calidad frente al modelo base ni frente a alternativas.
- Model card mínima: la documentación se reduce a una línea; no se especifican datos de entrenamiento, formato de entrada/salida ni comportamiento esperado.
- Idiomas no declarados: se desconoce si conserva el multilingüismo del base Qwen3.5-4B o si el ajuste lo ha restringido.
- Riesgo de alucinación: inherente a los modelos transformer; sin evaluación específica no puede acotarse.
- Sesgos: no documentados; al heredar del base, podría arrastrar sesgos de Qwen3.5-4B, pero no se confirma.
- Dependencia de `custom_code`: la carga requiere el código personalizado del repositorio, lo que añade un riesgo de seguridad y mantenimiento en producción.
- Licencia Apache-2.0: permite uso comercial, pero debe revisarse el archivo NOTICE para atribuciones de terceros del modelo base.
- Madurez: cero descargas y cero interacciones en el momento de la consulta; no hay evidencia de uso en producción ni de validación por la comunidad.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo sin verificar la ventana real del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joamCriff123/zils-mini-m1121t
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
