# RyanStudio/ettinnet-v1-17m-preview

## Resumen

Ettinnet v1 17M Preview es un modelo de tipo encoder basado en la arquitectura ModernBERT, desarrollado por RyanStudio como un ajuste fino (finetune) del modelo `jhu-clsp/ettin-encoder-17m`. Está especializado en la tarea de fill-mask (enmascarado y predicción de tokens) sobre texto informal de internet, con el objetivo de mejorar la comprensión de jerga y expresiones coloquiales que aparecen en plataformas como Discord, Reddit y Twitter. Con 16.913.600 parámetros, es un modelo muy compacto orientado a experimentación y a tareas de bajo coste computacional.

El modelo se distribuye bajo licencia MIT, lo que facilita su uso tanto académico como comercial, y está entrenado exclusivamente en inglés. Su relevancia radica en que aborda un nicho concreto: el procesamiento de lenguaje informal y slang de comunidades online, un dominio donde los modelos generalistas suelen tener dificultades. Se trata, sin embargo, de una versión preview (experimental) que el propio autor advierte que no está pensada para entornos de producción.

La ficha se basa en la información publicada en Hugging Face y en la model card del autor; los datos no disponibles se indican explícitamente como tales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder) |
| Parametros totales | 16.913.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ModernBERT, una evolución del transformer encoder clásico que incorpora mejoras de eficiencia como atención con rotación posicional (RoPE) y capas de atención optimizadas. Al ser un modelo de tipo encoder con cabeza de fill-mask, su funcionamiento consiste en predecir tokens enmascarados a partir del contexto circundante. El modelo parte de `jhu-clsp/ettin-encoder-17m` y se ha ajustado específicamente para la tarea de enmascarado sobre mensajes informales.

El entrenamiento se realizó sobre 42 millones de muestras seleccionadas del dataset `ManBib/DUE-filtered-deduped`, compuesto por mensajes procedentes de sitios como Discord, Reddit y Twitter. Para mitigar el olvido catastrófico, se añadieron aproximadamente 750.000 muestras de texto de `HuggingFaceFW/fineweb`, `HuggingFaceFW/fineweb-edu` y Wikipedia. El autor indica que futuras iteraciones se entrenarán con datasets adicionales de Reddit y Twitter. No se especifica en la información disponible si se emplearon técnicas de RLHF, DPO ni detalles sobre la composición exacta del dataset más allá de lo indicado.

## Capacidades

- Predicción de tokens enmascarados (fill-mask) en texto en inglés.
- Comprensión de jerga y lenguaje informal de internet (Discord, Reddit, Twitter).
- Modelo encoder utilizable para extracción de representaciones contextuales (embeddings) de texto.
- Soporte multilingüe: únicamente inglés.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- No dispone de modo de razonamiento (thinking mode) ni capacidades generativas de texto libre.

## Casos de uso

- Normalización y autocompletado de mensajes en plataformas de chat: el modelo puede predecir tokens enmascarados en conversaciones de Discord, útil para sistemas de sugerencia de texto o corrección en comunidades online con jerga específica.
- Moderación de contenido asistida: al comprender el slang de foros y redes, puede emplearse para identificar términos o patrones enmascarados y clasificar mensajes en pipelines de moderación.
- Investigación en lingüística computacional del lenguaje informal: permite estudiar cómo los modelos pequeños capturan expresiones coloquiales y comparar su rendimiento frente a encoders de mayor tamaño.
- Extracción de embeddings para búsqueda semántica en foros o chats: las representaciones del encoder pueden alimentar sistemas de recuperación de mensajes similares en comunidades online.
- Preprocesamiento para pipelines de NLP en redes sociales: como paso previo a tareas de clasificación de sentimiento o detección de temas en mensajes informales.
- Prototipado y experimentación académica: su tamaño reducido (17M parámetros) permite entrenar y desplegar en hardware modesto, adecuado para pruebas de concepto en investigación sobre modelos encoder compactos.

## Benchmarks y rendimiento

El autor publica una evaluación sobre un subconjunto de 100.000 mensajes aleatorios de Discord con 182.000 tokens enmascarados, excluyendo los datos de entrenamiento. Se comparan tres modelos: ettin-encoder-400m, ettinnet-17m-preview y ettinnet-32m-preview.

| Metrica | ettin-encoder-400m | ettinnet-17m-preview | ettinnet-32m-preview |
|---|---:|---:|---:|
| Top-1 | 34,57% | 34,27% | 37,79% |
| Top-3 | 47,73% | 48,89% | 52,74% |
| Top-5 | 52,59% | 54,60% | 58,28% |
| Top-10 | 58,32% | 61,60% | 65,04% |
| Top-20 | 63,31% | 67,87% | 70,94% |
| MRR | 0,4298 | 0,4382 | 0,4737 |
| Cross-entropy | 4,3792 | 3,8370 | 3,5506 |
| Perplexity | 79,77 | 46,39 | 34,83 |

Top-1 por longitud de mensaje:

| Palabras | Tokens enmascarados | ettin-encoder-400m | ettinnet-17m-preview | ettinnet-32m-preview |
|---|---:|---:|---:|---:|
| 3–5 | 30.574 | 13,15% | 22,40% | 24,45% |
| 6–10 | 57.835 | 28,99% | 33,40% | 36,54% |
| 11–20 | 46.338 | 40,85% | 37,82% | 41,75% |
| 21–40 | 30.336 | 47,07% | 39,16% | 43,33% |
| 41–80 | 13.489 | 49,95% | 39,48% | 44,50% |
| 81–200 | 5.470 | 52,87% | 39,73% | 44,73% |

El modelo de 17M supera al encoder de 400M en métricas globales como Top-3, Top-5, Top-10, Top-20, MRR, cross-entropy y perplexity, pero queda por debajo en Top-1 global y en mensajes largos (21–200 palabras), donde el modelo de 400M rinde mejor. En mensajes cortos (3–10 palabras) el 17M supera claramente al 400M.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (17M parámetros en fp32 ≈ 68 MB); con cuantización a 8 bits o inferior, aún menos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; también puede ejecutarse en CPU sin problema.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en dispositivos de gama baja.
- Opciones de despliegue: al ser un modelo safetensors de tipo encoder, puede cargarse con la librería `transformers` de Hugging Face; no se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI (estos están orientados a modelos generativos, no a fill-mask encoder).
- Latencia y throughput: no disponibles en la información proporcionada; por su tamaño reducido se espera una latencia muy baja, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RyanStudio/ettinnet-v1-17m-preview | 16,9M | no disponible | fill-mask | MIT | Hugging Face |
| jhu-clsp/ettin-encoder-17m (base) | 17M | no disponible | encoder general | no disponible | Hugging Face |
| ettin-encoder-400m | 400M | no disponible | encoder general | no disponible | Hugging Face |
| ettinnet-32m-preview | 32M (aprox.) | no disponible | fill-mask | no disponible | Hugging Face |

El modelo base `jhu-clsp/ettin-encoder-17m` es un encoder generalista del que deriva este finetune. El `ettin-encoder-400m` es una alternativa de mayor tamaño que, según los benchmarks del autor, rinde mejor en mensajes largos pero peor en métricas globales de fill-mask sobre lenguaje informal. El `ettinnet-32m-preview` es la versión superior de la misma familia y supera al 17M en todas las métricas publicadas.

## Limitaciones y advertencias

- Modelo experimental preview: el autor indica explícitamente que no está pensado para entornos de producción.
- Rendimiento degradado en contextos largos: el modelo sufre con mensajes largos debido a la limitada cantidad de datos de entrenamiento con textos extensos.
- Posible olvido de capacidades de código y matemáticas, con menor rendimiento en esas áreas.
- Entrenado únicamente en inglés; no soporta otros idiomas.
- Riesgo de sesgos presentes en los datos de redes sociales (Discord, Reddit, Twitter), que pueden reflejar lenguaje tóxico, opiniones sesgadas o jerga específica de comunidades.
- Riesgo de alucinación en las predicciones de tokens enmascarados, especialmente en contextos ambiguos o poco representados.
- Aunque la licencia es MIT (permite uso comercial), el modelo no está validado para producción y su rendimiento en dominios ajenos al lenguaje informal no está garantizado.
- No se documentan limitaciones de contexto específicas (longitud máxima de entrada) en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RyanStudio/ettinnet-v1-17m-preview
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-17m
- Dataset de entrenamiento principal: https://huggingface.co/datasets/ManBib/DUE-filtered-deduped
- Dataset fineweb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
