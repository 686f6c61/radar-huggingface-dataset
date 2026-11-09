# malkolm777/zils-mini-decision-v4

## Resumen

zils-mini-decision-v4 es un modelo de extracción de características (feature-extraction) publicado por el usuario malkolm777 en Hugging Face. Se presenta como un "decision body" del pool mini de la subnet 127 de Zils, construido sobre la familia Qwen/Qwen3.5-4B y afinado a partir del modelo base perplexity-ai/pplx-decider-flash-v1.2. Su propósito declarado es procesar ítems de decisión (decision items) procedentes de fuentes públicas con etiquetas de resultado, como reversiones en Wikipedia, anuncios de categoría en arXiv, merges en Gerrit, preguntas de Stack Exchange y procesos AfC/AfD de Wikipedia.

El modelo cuenta con 4.539.265.536 parámetros según los pesos en safetensors, un repositorio de 9,1 GB y licencia Apache 2.0. La model card indica que se aplicó una ronda de LoRA de rango 16 con AdamW y learning rate 5e-5 sobre un conjunto amplio y sin límite (uncapped) de ítems de decisión recopilados mediante `zils.current`. No se especifican la longitud de contexto, los idiomas soportados ni resultados de benchmarks.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo muy reciente (creado el 9 de noviembre de 2026), con cero descargas y cero likes en el momento de la consulta, y sin documentación técnica detallada más allá de la nota de entrenamiento. Resulta útil como referencia para quienes sigan el ecosistema de subredes de decisión o quieran evaluar modelos derivados de la familia Qwen3.5 de 4B con ajuste LoRA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen/Qwen3.5-4B, según la model card); detalles internos no disponibles |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La model card describe el modelo como un "d3-mini decision body" perteneciente a la familia Qwen/Qwen3.5-4B, lo que sitúa la arquitectura base en un transformer de aproximadamente 4B parámetros. El ajuste se realizó mediante una única ronda de LoRA de rango 16 con el optimizador AdamW y un learning rate de 5e-5, partiendo del modelo perplexity-ai/pplx-decider-flash-v1.2.

El conjunto de entrenamiento se describe como "large, uncapped" (amplio y sin límite) y compuesto por ítems de decisión con etiquetas de resultado procedentes de fuentes públicas: reversiones en Wikipedia, anuncios de categoría en arXiv, merges en Gerrit, Stack Exchange y los procesos Articles for Creation (AfC) y Articles for Deletion (AfD) de Wikipedia. La recolección se realizó con la herramienta `zils.current`. No se especifican el número exacto de tokens, la composición porcentual del dataset, ni si hubo fases de RLHF o DPO adicionales. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Extracción de características (feature-extraction): es el pipeline declarado en Hugging Face, orientado a producir representaciones para ítems de decisión.
- Clasificación y decisión sobre resultados etiquetados: el ajuste se orienta a predecir o puntuar decisiones en dominios como moderación de Wikipedia, aceptación de artículos y merges de código.
- Procesamiento de texto en dominios técnicos y editoriales: entrenado con datos de arXiv, Gerrit y Stack Exchange.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Moderación de ediciones en Wikipedia: el modelo puede puntuar si una reversión (revert) es probablemente correcta o disputada, usando patrones aprendidos de reversiones históricas etiquetadas; encaja por su entrenamiento específico en ese dominio.
- Triaje de envíos en arXiv: dado un anuncio de categoría, el modelo puede estimar si la clasificación temática es adecuada, apoyándose en el corpus de anuncios de categoría usado durante el ajuste.
- Revisión de merges en Gerrit: puede emplearse como señal auxiliar para priorizar o etiquetar cambios de código antes de la revisión humana, gracias a los datos de merges incluidos en el entrenamiento.
- Clasificación de preguntas en Stack Exchange: útil para decidir si una pregunta cumple los criterios de calidad o debe cerrarse, alineado con los ítems de decisión del corpus.
- Evaluación de propuestas en AfC (Articles for Creation): el modelo puede generar una puntuación de probabilidad de aceptación para borradores enviados, ayudando a priorizar la cola de revisión.
- Predicción de resultados en AfD (Articles for Deletion): puede estimar la probabilidad de que una discusión de borrado termine en eliminación, conservación o fusión, como señal previa para moderadores.
- Investigación sobre modelos de decisión: sirve como base para experimentos académicos sobre ajuste LoRA en tareas de decisión con etiquetas de resultado, dado su linaje documentado desde pplx-decider-flash-v1.2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (4,54B parámetros), en FP16 requeriría aproximadamente 9 GB de pesos, y en cuantización de 8 bits alrededor de 4,5-5 GB; estas cifras son estimaciones por tamaño, no datos publicados por el autor.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño, un modelo de 4,5B en FP16 podría caber en GPUs de consumo con 12-16 GB de VRAM, pero no hay validación oficial.
- Opciones de despliegue: la librería declarada es transformers; no se confirma soporte para vLLM, llama.cpp, Ollama o TGI. El tag `custom_code` sugiere que puede requerir código personalizado para cargarse.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-mini-decision-v4 | 4,54B | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| perplexity-ai/pplx-decider-flash-v1.2 (modelo base) | no disponible | no disponible | no disponible | Hugging Face |
| Qwen/Qwen3.5-4B (familia base) | ~4B | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo (benchmarks) para ninguno de los modelos de la tabla en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con datos de Wikipedia, arXiv, Gerrit y Stack Exchange, puede heredar sesgos de esas comunidades (por ejemplo, sesgo hacia decisiones de moderación mayoritarias).
- Riesgo de alucinación: no evaluado; al ser un modelo de decisión/feature-extraction, el riesgo se traslada a puntuaciones mal calibradas más que a texto inventado.
- Limitaciones de contexto e idioma: no se especifican ni la ventana de contexto ni los idiomas soportados, lo que impide garantizar su comportamiento fuera del inglés técnico.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card remite a LICENSE y NOTICE del repositorio, que no se han podido verificar; conviene revisarlos antes de producción.
- Caveats para producción: el modelo tiene cero descargas y cero likes, sin benchmarks ni validación externa; el tag `custom_code` implica posible necesidad de código específico para cargarlo; el pipeline declarado es feature-extraction, no generación de texto, por lo que no debe asumirse un comportamiento conversacional.
- Trazabilidad: el modelo base pplx-decider-flash-v1.2 no está documentado en la información disponible, lo que limita la auditabilidad del linaje.

## Enlaces

- Hugging Face: https://huggingface.co/malkolm777/zils-mini-decision-v4
- Modelo base: https://huggingface.co/perplexity-ai/pplx-decider-flash-v1.2
- Familia Qwen3.5 (referencia): https://huggingface.co/Qwen/Qwen3.5-4B
