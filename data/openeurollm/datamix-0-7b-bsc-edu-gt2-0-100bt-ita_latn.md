# openeurollm/datamix-0.7B-bsc-edu-gt2.0-100bt-ita_Latn

## Resumen

El modelo `openeurollm/datamix-0.7B-bsc-edu-gt2.0-100bt-ita_Latn` es un modelo de lenguaje de 0,7 mil millones de parametros entrenado desde cero por el proyecto OpenEuroLLM. Se trata de un experimento de investigación centrado en el efecto de la curación de datos: el entrenamiento utiliza 100 mil millones de tokens del corpus HPLT 4 en italiano, filtrados con una puntuación de calidad BSC-EDU superior a 2,0.

El modelo forma parte de la familia de modelos "datamix", cuyo objetivo es aislar el impacto de distintas estrategias de filtrado y mezcla de datos sobre el rendimiento final. Por tanto, su interés principal es académico y comparativo: sirve como referencia para estudiar cómo afecta el filtrado por calidad educativa al entrenamiento de modelos pequeños en lenguas europeas de menor representación.

Con 0,7B de parámetros, es un modelo compacto orientado a experimentación y despliegue en hardware modesto. La información pública disponible es muy limitada: la model card solo indica el tamaño, el corpus y el filtro aplicado, sin detallar arquitectura, contexto ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer entrenado desde cero, detalles no publicados) |
| Parametros totales | 0,7B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/otros no publicadas) |
| Idiomas soportados | italiano (código `it`, variante `ita_Latn`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card indica únicamente que se trata de un modelo de 0,7B de parámetros entrenado desde cero ("from scratch") sobre 100 mil millones de tokens del corpus HPLT 4 en italiano. Los documentos de entrenamiento fueron filtrados aplicando una puntuación de calidad BSC-EDU mayor que 2,0, un filtro de calidad educativa desarrollado por el Barcelona Supercomputing Center.

No se especifican en la información disponible detalles sobre la arquitectura interna (número de capas, dimensiones ocultas, tipo de atención), la composición exacta del dataset, la tokenizadora empleada ni si hubo fases de ajuste fino supervisado, RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. El nombre del repositorio sugiere que forma parte de una serie de ablaciones sobre mezclas de datos ("datamix"), pero no se aporta la metodología comparativa.

## Capacidades

- Generación de texto en italiano, derivada del entrenamiento exclusivo sobre corpus italiano.
- Modelo base (no se indica ajuste por instrucciones), por lo que su uso esperado es como modelo de continuación de texto o punto de partida para fine-tuning.
- Capacidades de razonamiento, código o matemáticas: no documentadas ni evaluadas en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al italiano según la metadata (`language: it`).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre curación de datos: el modelo sirve como punto de comparación frente a otras variantes de la serie datamix entrenadas con distintos filtros o mezclas, para medir el impacto del filtro BSC-EDU > 2,0 en el rendimiento final.
- Fine-tuning para tareas en italiano: al ser un modelo base de 0,7B con licencia Apache 2.0, puede ajustarse para clasificación de texto, análisis de sentimiento o extracción de información en corpus italianos con recursos computacionales limitados.
- Generación de texto especializado en italiano: continuación de documentos, resúmenes o paráfrasis sobre dominios representados en HPLT 4, previa validación de calidad.
- Experimentación académica en modelos pequeños: útil para estudiar escalado, tokenización y dinámicas de entrenamiento en lenguas europeas de recursos medios.
- Prototipado rápido en local: su tamaño permite iterar en una sola GPU de consumo para validar pipelines de datos o de evaluación antes de escalar a modelos mayores.
- Base para modelos de dominio educativo: dado que el corpus se filtró por calidad educativa, es un candidato razonable para ajuste fino en aplicaciones de tutoría o generación de material didáctico en italiano, siempre con revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,4-1,6 GB solo para pesos, más overhead de activaciones y KV cache (estimación típica para 0,7B; no confirmada por el autor).
- VRAM estimada en cuantización de 8 bits: alrededor de 0,7-1 GB; en 4 bits, alrededor de 0,4-0,6 GB (estimaciones, no hay cuantizaciones oficiales publicadas).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de tarjetas con 4 GB o más en FP16 y en GPUs integradas o CPU con cuantización de 4 bits.
- Opciones de despliegue: al publicarse solo en safetensors, requiere frameworks como Transformers, vLLM o TGI; para llama.cpp u Ollama sería necesario convertir los pesos a GGUF (no hay conversiones oficiales).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| datamix-0.7B-bsc-edu-gt2.0-100bt-ita_Latn | 0,7B | no disponible | italiano | Apache 2.0 | Entrenado desde cero con 100B tokens filtrados por BSC-EDU > 2,0 |
| Modelos de la familia OpenEuroLLM (otras variantes datamix) | variable | no disponible | lenguas europeas | Apache 2.0 (previsiblemente) | No se dispone de detalles en la información proporcionada |
| Modelos pequeños multilingües tipo Gemma 2 2B / Qwen2.5 0.5B | 0,5-2B | 8K-32K (según modelo) | multilingüe | licencias variables | Alternativas comerciales con benchmarks publicados; comparación directa no disponible en esta ficha |

No se dispone de datos de rendimiento comparativo para este modelo en la información proporcionada.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no está diseñado para seguir órdenes ni para uso conversacional directo sin fine-tuning.
- Entrenado exclusivamente en italiano: el rendimiento en otras lenguas, incluido el castellano, será previsiblemente muy limitado.
- Sesgos desconocidos: al derivar de HPLT 4 (corpus web), puede heredar sesgos, contenido de baja calidad residual y ruido pese al filtrado por BSC-EDU.
- Riesgo de alucinación: alto en un modelo de 0,7B sin ajuste alineado; no apto para producción sin validación.
- Sin datos de evaluación: no hay benchmarks publicados que permitan estimar su calidad frente a alternativas.
- Documentación mínima: se desconocen contexto máximo, tokenizadora y detalles de arquitectura, lo que complica su integración fiable en producción.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe asumir la responsabilidad sobre el cumplimiento de derechos de los datos de origen (HPLT 4) y sobre la calidad del modelo.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni reportes de uso.

## Enlaces

- Hugging Face: https://huggingface.co/openeurollm/datamix-0.7B-bsc-edu-gt2.0-100bt-ita_Latn
- Proyecto OpenEuroLLM (organización en Hugging Face): https://huggingface.co/openeurollm
- Corpus HPLT: https://hplt-project.org/
- Filtro de calidad BSC-EDU (Barcelona Supercomputing Center): no disponible en la información proporcionada
