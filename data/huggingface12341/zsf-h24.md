# huggingface12341/zsf-h24

## Resumen

zsf-h24 es un modelo de extracción de características (feature-extraction) publicado en Hugging Face por el usuario huggingface12341 bajo licencia Apache 2.0. Se trata de un merge de dos modelos base: OmniJev/OneJev1.6-9B y vllm-sr/d3-flash, según los metadatos del repositorio. El modelo cuenta con 8.392.695.024 parámetros totales (aproximadamente 8,4 mil millones) según los pesos en safetensors, y el repositorio ocupa 16,8 GB. La arquitectura declarada en los tags es `qwen3_5`, con código personalizado (`custom_code`), lo que sugiere una variante o derivado de la familia Qwen.

El modelo se publica con pipeline de feature-extraction, lo que indica que su uso previsto es la generación de embeddings o representaciones vectoriales más que la generación de texto libre. Los tags incluyen `decision-model`, `zils`, `d3-flash` y `endpoints_compatible`, lo que apunta a un posible uso en sistemas de decisión o clasificación. El acceso está restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.

La relevancia de este modelo es limitada por su escasa tracción (0 descargas, 0 likes en el momento de la consulta) y por la ausencia de documentación técnica publicada. No se dispone de información sobre datos de entrenamiento, benchmarks ni idiomas soportados. Esta ficha se limita a los datos verificables de los metadatos y advierte explícitamente de las lagunas de información.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según tags), con `custom_code` |
| Parametros totales | 8.392.695.024 (~8,4 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline | feature-extraction |
| Modelos base | OmniJev/OneJev1.6-9B, vllm-sr/d3-flash (merge) |
| Acceso | restringido (gated) |
| Tamano del repositorio | 16,8 GB |

## Arquitectura y entrenamiento

La arquitectura declarada en los tags es `qwen3_5`, lo que sugiere una base derivada de la familia Qwen 3.5, aunque no se especifica si se trata de un transformer denso o de una variante con mezcla de expertos. El tag `custom_code` indica que el repositorio incluye código propio para cargar el modelo, lo que implica que no es un transformer estándar de la librería `transformers` y que puede requerir confiar en código remoto (`trust_remote_code=True`). El modelo es un merge de OmniJev/OneJev1.6-9B y vllm-sr/d3-flash, una técnica habitual para combinar capacidades de dos checkpoints, pero no se detalla el método de merge (SLERP, TIES, DARE, etc.) ni la proporción de mezcla.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste por preferencias. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o modos de razonamiento. Toda esta información debe considerarse no disponible.

## Capacidades

- Extracción de características: el pipeline declarado es `feature-extraction`, por lo que el uso principal es generar embeddings o representaciones vectoriales a partir de texto.
- Modelo de decisión: el tag `decision-model` sugiere aplicaciones de clasificación o toma de decisiones, aunque no se detalla el mecanismo.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede desplegarse en infraestructuras de inferencia compatibles con endpoints estándar.
- Generación de texto: no confirmada explícitamente; el pipeline declarado no es `text-generation`.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no especificados).
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

- Generación de embeddings para búsqueda semántica: el modelo puede emplearse para vectorizar documentos y consultas en un sistema de recuperación de información (RAG), dado su pipeline de feature-extraction y su tamaño de ~8,4 B parámetros.
- Clasificación de textos: el tag `decision-model` sugiere su uso como clasificador o componente de decisión en pipelines de moderación, enrutamiento o etiquetado.
- Sistemas de recomendación basados en similitud: los embeddings generados pueden alimentar motores de recomendación que comparen representaciones vectoriales de ítems y usuarios.
- Deduplicación y agrupamiento de documentos: la extracción de características permite calcular similitud entre textos para clustering o detección de duplicados.
- Filtrado y enrutamiento en pipelines de datos: como modelo de decisión, puede integrarse en etapas de preprocesado para decidir qué documentos pasan a etapas posteriores.
- Experimentación en investigación sobre merges de modelos: al ser un merge de dos checkpoints, es útil para estudiar el comportamiento de técnicas de fusión de pesos en tareas de representación.
- Despliegue en endpoints compatibles: su tag `endpoints_compatible` facilita la integración en plataformas de inferencia gestionada, aunque el acceso gated requiere aceptar condiciones previamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 16,8 GB solo para pesos (8,4 B parámetros × 2 bytes), más overhead de activaciones y contexto.
- VRAM estimada en cuantización de 8 bits: aproximadamente 8,4 GB para pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 4,2 GB para pesos, aunque no se confirman formatos GGUF o AWQ disponibles.
- GPU recomendadas: A100 40 GB, H100, o GPUs consumer con 24 GB (RTX 3090, RTX 4090) para FP16; GPUs con 8-12 GB podrían ser suficientes en cuantización de 4-8 bits si se generan los pesos.
- Cabe en GPU consumer: sí, en RTX 3090/4090 en FP16; en GPUs de 8-12 GB solo con cuantización.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (debido al tag `custom_code`); vLLM y TGI no confirmados; llama.cpp/Ollama no confirmados por ausencia de GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Pipeline | Disponibilidad |
|---|---|---|---|---|---|
| zsf-h24 | ~8,4 B | no disponible | Apache 2.0 | feature-extraction | Gated |
| OmniJev/OneJev1.6-9B | no disponible | no disponible | no disponible | no disponible | no disponible |
| vllm-sr/d3-flash | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos base que permitan una comparativa cuantitativa fiable. Los modelos comparables de la misma categoría (extracción de características de ~8 B) no están identificados en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated y requiere aceptar condiciones en Hugging Face antes de su descarga, lo que puede retrasar su adopción en producción.
- Documentación inexistente: no hay model card detallada, ni información sobre datos de entrenamiento, sesgos o evaluación.
- Código personalizado: el tag `custom_code` implica ejecutar código remoto (`trust_remote_code=True`), lo que introduce un riesgo de seguridad que debe auditarse antes de usarlo en producción.
- Sin benchmarks: no hay evidencia publicada de calidad, lo que impide validar su rendimiento frente a alternativas.
- Idiomas no especificados: se desconoce si soporta castellano u otros idiomas, lo que limita su uso en aplicaciones multilingües.
- Riesgo de alucinación: no evaluado; al ser un modelo de feature-extraction, el riesgo se traslada a posibles errores en las representaciones generadas.
- Licencia Apache 2.0: permite uso comercial, pero al ser un merge de modelos base, deben revisarse las licencias de OmniJev/OneJev1.6-9B y vllm-sr/d3-flash para confirmar compatibilidad.
- Tracción nula: 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validación por parte de la comunidad.
- Fecha de creación futura: el repositorio figura creado el 2026-11-24, lo que puede indicar metadatos inconsistentes o un artefacto de la plataforma.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface12341/zsf-h24
- Modelo base OmniJev/OneJev1.6-9B: https://huggingface.co/OmniJev/OneJev1.6-9B
- Modelo base vllm-sr/d3-flash: https://huggingface.co/vllm-sr/d3-flash
