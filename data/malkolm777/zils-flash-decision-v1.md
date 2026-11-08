# malkolm777/zils-flash-decision-v1

## Resumen

zils-flash-decision-v1 es un modelo de decisión publicado por el usuario malkolm777 en Hugging Face, derivado mediante fine-tuning LoRA del modelo base vllm-sr/d3-flash, que pertenece a la familia Qwen/Qwen3.5-9B. Con 8.392.695.024 parámetros (aproximadamente 8,4 mil millones) y un repositorio de 16,8 GB en formato safetensors, está diseñado específicamente para tareas de clasificación y toma de decisiones dentro del ecosistema Zils (subnet 127, flash pool), una plataforma orientada a entrenar modelos pequeños que puntúan, ordenan o marcan elementos según ejemplos aportados por el usuario.

El modelo no es un asistente conversacional generalista: su pipeline declarado es feature-extraction y su propósito es emitir decisiones o puntuaciones sobre elementos etiquetados con resultados. El entrenamiento se realizó con LoRA de rango 16 sobre datos de dominios con etiquetas de resultado público, como reversiones en Wikipedia, anuncios de categoría en arXiv, fusiones en Gerrit, preguntas de Stack Exchange y procesos AfC/AfD de Wikipedia, recolectados con la herramienta zils.current.

Es relevante ahora porque ejemplifica una tendencia creciente: modelos compactos y especializados, derivados de bases abiertas de ~8-9B, que se ajustan con LoRA para una función concreta y se publican con licencia Apache-2.0. No obstante, el modelo es muy reciente (creado en noviembre de 2026 según los metadatos del repositorio), no registra descargas ni interacciones, y la información pública disponible es mínima, por lo que debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen/Qwen3.5-9B, según model card); etiqueta `qwen3_5` en los tags |
| Parametros totales | 8.392.695.024 (8,4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers, requiere `custom_code`) |

## Arquitectura y entrenamiento

La model card describe el modelo como un "d3-flash decision body" de la familia Qwen/Qwen3.5-9B. Se trata, por tanto, de un transformer decoder-only de aproximadamente 8,4 mil millones de parámetros, aunque no se detalla la configuración interna (número de capas, dimensión oculta, cabezas de atención ni mecanismo de atención). El repositorio incluye código personalizado (`custom_code`), lo que implica que la carga requiere `trust_remote_code=True` y que la arquitectura exacta puede diferir de una implementación estándar de transformers.

El entrenamiento consistió en un fine-tuning con LoRA de rango 16 sobre el modelo base vllm-sr/d3-flash (Apache-2.0). Los datos de entrenamiento son "decision items" provenientes de fuentes públicas con etiquetas de resultado: reversiones de Wikipedia, anuncios de categoría de arXiv, fusiones de Gerrit, Stack Exchange y los procesos de artículos para creación (AfC) y eliminación (AfD) de Wikipedia, recolectados mediante zils.current. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación y toma de decisiones: el modelo está diseñado para puntuar, ordenar o marcar elementos según ejemplos de resultados, no para generar texto libre conversacional.
- Feature extraction: pipeline declarado en Hugging Face, orientado a producir representaciones o puntuaciones útiles para sistemas de decisión.
- Dominios de entrenamiento: moderación de contenido enciclopédico (reversiones y AfD de Wikipedia), clasificación de papers por categoría (arXiv), revisión de cambios de código (fusiones de Gerrit) y evaluación de preguntas y respuestas (Stack Exchange).
- Integración con el ecosistema Zils: pensado para el "flash pool" de la subnet 127, con ejemplos aportados por el usuario para ajustar el criterio de decisión.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el propósito declarado es la decisión puntual, no el razonamiento encadenado.
- Capacidades multilingües: no disponibles; no se documentan idiomas soportados.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Moderación de contribuciones en wikis: el modelo puede puntuar ediciones o artículos nuevos (AfC) y proponer su aceptación o rechazo, aprovechando que fue entrenado con etiquetas de reversiones y AfD de Wikipedia.
- Triaje de incidencias en soporte técnico: usar Zils para mostrar ejemplos de tickets correctamente clasificados y dejar que el modelo puntúe la categoría o prioridad de cada nueva solicitud.
- Clasificación de artículos científicos por categoría: entrenado con anuncios de categoría de arXiv, puede asignar o verificar la categoría de un preprint a partir de su título y resumen.
- Revisión de cambios de código en pipelines de integración: con datos de fusiones de Gerrit, puede puntuar la probabilidad de que un cambio sea aceptado o requiera revisión adicional antes de fusionarse.
- Filtrado de preguntas en comunidades técnicas: entrenado con datos de Stack Exchange, puede estimar si una pregunta cumple los criterios de calidad y on-topic de un foro.
- Enrutamiento de solicitudes en aplicaciones: el flujo típico de Zils (mostrar ejemplos con la respuesta correcta y entrenar un modelo pequeño) permite usar este modelo como clasificador de solicitudes, marcador de problemas o puntuador de coincidencias dentro de una app.
- Evaluación de candidatos en procesos de selección de contenido: el modelo puede servir como segunda opinión automática sobre decisiones previamente etiquetadas por humanos, siempre con revisión humana final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8,4B parámetros en fp16 se requieren aproximadamente 16,8 GB solo para los pesos, más overhead de activaciones y caché KV; en cuantización de 8 bits, unos 8,4 GB; en 4 bits, alrededor de 4,2 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100 o L40S para fp16 sin cuantizar; RTX 4090 (24 GB) para fp16 con margen ajustado o 8 bits; RTX 3090/4080 (16-24 GB) para 8 bits.
- ¿Cabe en GPU de consumo? Sí, en 4 bits cabe en GPUs de 8 GB o más; en fp16 requiere al menos 24 GB.
- Opciones de despliegue: transformers (requiere `trust_remote_code=True` por el `custom_code`); vLLM y TGI solo si la arquitectura personalizada es compatible; llama.cpp/Ollama no están documentados y requerirían conversión a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zils-flash-decision-v1 | 8,4B | no disponible | Decisión / feature extraction (Zils) | Apache-2.0 | Hugging Face (0 descargas) |
| zils-lite-decision-v1 (malkolm777) | no disponible | no disponible | Decisión (versión lite del mismo autor) | no disponible | Hugging Face |
| vllm-sr/d3-flash (modelo base) | no disponible | no disponible | Base de la familia Qwen3.5-9B | Apache-2.0 | Hugging Face |
| Qwen3.5-9B (familia base) | ~9B | no disponible | Modelo generalista | no disponible | Hugging Face |

La comparación cuantitativa con alternativas no es posible porque no se han publicado benchmarks ni especificaciones de contexto para este modelo ni para sus derivados directos.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con datos de Wikipedia, arXiv, Gerrit y Stack Exchange, puede heredar los sesgos de esas comunidades (por ejemplo, sesgo hacia convenciones editoriales o de revisión concretas), aunque no se documentan análisis de sesgo.
- Riesgo de alucinación: el modelo está orientado a puntuar y clasificar, no a generar hechos; aun así, si se usa fuera de su dominio previsto, sus puntuaciones pueden ser poco fiables.
- Limitaciones de contexto e idioma: no se documentan la longitud de contexto ni los idiomas soportados, lo que impide garantizar su comportamiento en textos largos o en castellano.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base (vllm-sr/d3-flash) y la familia Qwen3.5 deben verificarse por separado; además, el autor remite a los archivos LICENSE y NOTICE del repositorio.
- Código personalizado: la carga requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar ese código antes de usarlo en producción.
- Madurez: el modelo se creó en noviembre de 2026, no tiene descargas ni interacciones y la información pública es mínima; no hay evidencia independiente de su calidad.
- Producción: se recomienda validar con un conjunto de evaluación propio y mantener revisión humana en las decisiones automatizadas, dado que no hay benchmarks publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malkolm777/zils-flash-decision-v1
- Modelo base: https://huggingface.co/vllm-sr/d3-flash
- Versión lite del mismo autor: https://huggingface.co/malkolm777/zils-lite-decision-v1
- Sitio oficial de Zils: https://zils.ai/
