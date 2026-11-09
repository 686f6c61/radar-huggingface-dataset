# malkolm777/zils-flash-decision-v3

## Resumen

zils-flash-decision-v3 es un modelo de decisión publicado por el usuario malkolm777 en Hugging Face, derivado del modelo base vllm-sr/d3-flash, que a su vez pertenece a la familia Qwen/Qwen3.5-9B según indica la model card. Con 8.392.695.024 parámetros (aproximadamente 8,4 mil millones) y un repositorio de 16,8 GB en formato safetensors, está etiquetado como modelo de extracción de características (feature-extraction) y especializado en tareas de decisión.

El modelo se ha afinado mediante LoRA (rango 16, optimizador AdamW con tasa de aprendizaje 5e-5) sobre un conjunto amplio y sin límite de «decision items» procedentes de fuentes públicas con etiquetas de resultado: reversiones de Wikipedia, anuncios de categoría de arXiv, merges de Gerrit, Stack Exchange y procesos AfC/AfD de Wikipedia. Su propósito declarado es servir como «cuerpo de decisión» dentro del pool flash de la subred Zils 127.

Es relevante ahora porque ejemplifica una tendencia creciente de modelos pequeños o medianos especializados en decisiones binarias o clasificación de resultados, entrenados sobre datos con etiquetas objetivas y verificables, en lugar de datos sintéticos. La licencia Apache-2.0 facilita su reutilización comercial, aunque la información pública disponible sobre el modelo es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen/Qwen3.5-9B, según model card); requiere `custom_code` |
| Parametros totales | 8.392.695.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card describe el modelo como un «d3-flash decision body» de la familia Qwen/Qwen3.5-9B. No se especifica la arquitectura interna con detalle (número de capas, dimensiones ocultas, tipo de atención), solo que se trata de un transformer de aproximadamente 8,4 mil millones de parámetros. El repositorio incluye la etiqueta `custom_code`, lo que implica que la carga del modelo requiere código personalizado más allá de las clases estándar de transformers.

El entrenamiento consistió en un ajuste fino con LoRA de rango 16, optimizador AdamW y tasa de aprendizaje 5e-5, partiendo del modelo base vllm-sr/d3-flash (Apache-2.0). El conjunto de datos se describe como «large, uncapped» y compuesto por elementos de decisión con etiquetas de resultado procedentes de fuentes públicas: reversiones de Wikipedia, anuncios de categoría de arXiv, merges de Gerrit, Stack Exchange y procesos AfC/AfD de Wikipedia. No se indica el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Extracción de características (feature-extraction), según el pipeline declarado en Hugging Face.
- Modelo de decisión: entrenado para emitir decisiones o clasificaciones sobre elementos con resultado etiquetable (aceptar/rechazar, revertir/mantener, aprobar/denegar).
- Dominios de decisión cubiertos por los datos de entrenamiento: moderación de ediciones en Wikipedia, clasificación de anuncios de arXiv, revisión de merges en Gerrit, preguntas y respuestas en Stack Exchange y evaluación de borradores en AfC/AfD.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (los idiomas no se declaran en la ficha).
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Moderación de ediciones en plataformas tipo wiki: el modelo puede clasificar si una edición debe revertirse o mantenerse, aprovechando su entrenamiento sobre reversiones reales de Wikipedia. Adecuado por la coincidencia directa entre el dominio de entrenamiento y la tarea.
- Triaje de envíos en repositorios de código: evaluación automática de merges en sistemas tipo Gerrit, asignando una decisión preliminar antes de la revisión humana. Útil para priorizar la cola de revisión.
- Filtrado de anuncios científicos: clasificación de anuncios de categoría en arXiv para detectar envíos mal categorizados o fuera de alcance. El modelo ha visto ejemplos etiquetados de este dominio.
- Evaluación de borradores en procesos de creación de artículos (AfC/AfD): decisión preliminar sobre si un borrador cumple los criterios para publicarse o debe rechazarse, como primera pasada antes de la revisión editorial.
- Clasificación de contenido en comunidades de preguntas y respuestas: detección de publicaciones que probablemente serán cerradas o eliminadas en foros tipo Stack Exchange, para moderación proactiva.
- Extracción de representaciones para pipelines de clasificación: al ser un modelo de feature-extraction, puede usarse como extractor de embeddings para alimentar clasificadores posteriores en tareas de decisión con datos propios.
- Señal auxiliar en sistemas de reputación o gobernanza comunitaria: generación de una puntuación de decisión que se combine con reglas heurísticas o con revisión humana en flujos de moderación a escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 16,8 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 20-24 GB de VRAM.
- Cuantización a 8 bits: en torno a 8-9 GB de VRAM para los pesos (estimación teórica; no se confirman cuantizaciones publicadas para este modelo).
- Cuantización a 4 bits: en torno a 4-5 GB de VRAM para los pesos (estimación teórica; no se confirman cuantizaciones publicadas).
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para fp16; RTX 3090/4090 o GPUs con 12-16 GB para cuantización agresiva.
- Cabe en GPU de consumo: sí, con cuantización, en tarjetas con al menos 8-12 GB de VRAM; en fp16 requiere tarjetas de 24 GB o superiores.
- Opciones de despliegue: transformers (requiere `custom_code` y `trust_remote_code=True`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y la presencia de código personalizado puede limitar su uso en algunos runners.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-flash-decision-v3 | 8,39 B | no disponible | Apache-2.0 | Hugging Face (0 descargas) | Especializado en decisión; requiere custom_code |
| vllm-sr/d3-flash (modelo base) | no disponible | no disponible | Apache-2.0 | Hugging Face | Base del ajuste LoRA; sin datos públicos detallados |
| Qwen/Qwen3.5-9B (familia declarada) | ~9 B (familia) | no disponible | no disponible en esta ficha | Hugging Face | Modelo generalista de la misma familia; no se dispone de cifras comparativas verificadas |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Información pública muy escasa: la model card no detalla composición del dataset, número de tokens, evaluación ni limitaciones conocidas.
- Sesgos potenciales derivados de las fuentes de entrenamiento: las decisiones aprendidas reflejan las políticas y sesgos de Wikipedia, arXiv, Gerrit y Stack Exchange, que pueden no transferirse a otros dominios.
- Riesgo de alucinación: al ser un modelo de decisión y no un generador conversacional, el riesgo se manifiesta como clasificaciones erróneas o sobreconfiadas, especialmente fuera de los dominios de entrenamiento.
- Idiomas soportados no declarados: no hay garantía de comportamiento multilingüe; probablemente esté optimizado para inglés por la naturaleza de las fuentes.
- Longitud de contexto no documentada: no se puede asumir una ventana amplia para documentos largos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe conservar el aviso de licencia y el NOTICE; conviene verificar las licencias del modelo base y de los datos de entrenamiento.
- Requiere `trust_remote_code=True` por la etiqueta `custom_code`, lo que implica ejecutar código del autor del repositorio; revisar el código antes de usarlo en producción.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni evidencia de uso en producción.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso; no debe asumirse para pipelines agénticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malkolm777/zils-flash-decision-v3
- Modelo base: https://huggingface.co/vllm-sr/d3-flash
- Repositorio de la familia Qwen (referencia de la model card): https://huggingface.co/Qwen
