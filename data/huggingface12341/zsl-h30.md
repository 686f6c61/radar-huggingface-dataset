# huggingface12341/zsl-h30

## Resumen

zsl-h30 es un modelo de extracción de características (feature-extraction) publicado en Hugging Face por el usuario huggingface12341. Se trata de un merge de dos modelos base: SnowGemma/Qwen3.5-0.8B-Typed-Decisions y vllm-sr/d3-lite, según los metadatos de la model card y las etiquetas del repositorio. El modelo tiene 852.985.920 parámetros (aproximadamente 0,85 mil millones) almacenados en formato safetensors, con un tamaño de repositorio de 1,7 GB.

La información disponible es muy limitada: no se han publicado resultados de benchmarks, no se especifican los idiomas soportados y la model card no detalla la composición del dataset de entrenamiento ni el proceso de merge. El pipeline declarado es feature-extraction, aunque las etiquetas incluyen "decision-model", "zils" y "d3-lite", lo que sugiere un uso orientado a la toma de decisiones estructuradas más que a la generación de texto libre.

El acceso al modelo está restringido (gated): es necesario aceptar condiciones en Hugging Face antes de poder descargarlo. La licencia es Apache 2.0. Dado que el repositorio no tiene descargas ni likes en el momento de la consulta, se trata de una publicación reciente y sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta qwen3_5 sugiere familia Qwen 3.5; requiere custom_code) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna. Las etiquetas del repositorio indican "qwen3_5", lo que apunta a que el modelo base pertenece a la familia Qwen 3.5, y "custom_code", lo que implica que la carga requiere código personalizado más allá de la clase estándar de transformers. El modelo es un merge de SnowGemma/Qwen3.5-0.8B-Typed-Decisions y vllm-sr/d3-lite, pero no se especifica la técnica de merge empleada (SLERP, TIES, DARE, linear, etc.) ni los pesos relativos de cada componente.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. La etiqueta "decision-model" y "typed-decisions" sugiere que el modelo base fue afinado para producir decisiones tipadas o estructuradas, pero este extremo no está confirmado en la información disponible.

## Capacidades

- Extracción de características (feature-extraction): es el pipeline declarado en la model card.
- Modelo de decisión: las etiquetas "decision-model" y "typed-decisions" sugieren soporte para decisiones estructuradas o tipadas, aunque no se detalla el formato.
- Generación de texto: no confirmada explícitamente; el pipeline declarado no es text-generation.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Extracción de embeddings para búsqueda semántica: al ser un modelo de feature-extraction de 0,85B parámetros, puede emplearse para generar representaciones vectoriales de texto en sistemas de recuperación de información, aunque no se especifica la dimensionalidad del embedding ni el contexto máximo.
- Clasificación y enrutamiento de decisiones: las etiquetas "decision-model" y "typed-decisions" apuntan a un uso en pipelines donde se requiere asignar una decisión estructurada a una entrada, por ejemplo en sistemas de triaje o enrutamiento condicional.
- Filtrado previo en pipelines RAG: un modelo pequeño de 0,85B puede actuar como re-ranker o filtro de candidatos antes de un modelo generativo mayor, reduciendo coste computacional.
- Prototipado de investigación sobre merges de modelos: al ser un merge documentado de dos bases, sirve como caso de estudio para evaluar técnicas de fusión de pesos en modelos pequeños.
- Experimentación en entornos con restricciones de memoria: con 852M parámetros y 1,7 GB en safetensors, es viable en GPUs de consumo para tareas de extracción de características por lotes.
- Evaluación comparativa de modelos Qwen 3.5 pequeños: puede utilizarse como referencia en estudios que comparen variantes afinadas de la familia Qwen 3.5 en tareas de decisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en precisión completa (fp32) aproximadamente 3,4 GB; en fp16/bf16 aproximadamente 1,7 GB; en cuantización de 8 bits aproximadamente 0,9 GB; en 4 bits aproximadamente 0,5 GB (estimaciones teóricas a partir de los 852.985.920 parámetros, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes para este tamaño.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs consumer modernas con 4 GB o más de VRAM.
- Opciones de despliegue: transformers (requiere custom_code según las etiquetas), potencialmente vLLM y TGI si el código personalizado es compatible; llama.cpp y Ollama no están confirmados por la ausencia de pesos GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zsl-h30 | 852.985.920 | no disponible | apache-2.0 | gated en Hugging Face |
| SnowGemma/Qwen3.5-0.8B-Typed-Decisions | ~0,8B (por nombre) | no disponible | no disponible | no disponible |
| vllm-sr/d3-lite | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de la descarga.
- Información insuficiente: no se documentan idiomas, contexto, dataset de entrenamiento ni benchmarks, lo que impide evaluar su calidad de forma rigurosa.
- Riesgo de alucinación: no evaluado; al ser un modelo de feature-extraction, el riesgo se traslada a las tareas downstream.
- Sesgos conocidos: no documentados; los sesgos de los modelos base (Qwen 3.5 y d3-lite) pueden heredarse a través del merge.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las licencias de los modelos base por si imponen restricciones adicionales.
- Sin validación comunitaria: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción.
- Requiere custom_code: la carga no es posible con la clase estándar de transformers sin el código personalizado del repositorio.
- Fecha de creación futura (2026-11-24): la marca temporal del repositorio es posterior a la fecha actual, lo que puede indicar un error de metadatos o una publicación programada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface12341/zsl-h30
- Modelo base 1: https://huggingface.co/SnowGemma/Qwen3.5-0.8B-Typed-Decisions
- Modelo base 2: https://huggingface.co/vllm-sr/d3-lite
