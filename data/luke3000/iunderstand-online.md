# luke3000/iunderstand-online

## Resumen

`luke3000/iunderstand-online` es un repositorio de Hugging Face que se presenta bajo la etiqueta `ragllm`, un esquema de "LLMs por clúster direccionados por contenido". Según la model card, cada clúster mantiene un modelo especializado identificado por un hash SHA-256 determinista; cuando llega un prompt nuevo, un espacio de entrenamiento en Hugging Face destila conocimiento desde `deepseek/deepseek-v4.1-flash-1017`, actualiza el prompt y el dataset WSP del clúster y emite un nuevo `llm_hash`. El modelo base local declarado es `ornith-1.5:9b`.

El repositorio tiene un tamaño de 0,0 GB, cero descargas y cero likes en el momento de la consulta, y no declara pipeline ni idiomas soportados. Los pesos están en formato `safetensors` y la licencia es MIT. La información pública disponible es muy escasa: no se detallan parámetros, contexto, dataset de entrenamiento ni resultados de evaluación, por lo que buena parte de las especificaciones técnicas deben marcarse como no disponibles.

La relevancia de esta ficha es principalmente documental: describe un experimento de arquitectura RAG con modelos por clúster y destilación desde un modelo profesor, pero no constituye por ahora un artefacto con métricas verificables ni un historial de uso que permita recomendarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (se describe un esquema RAG por clústeres con destilación desde un modelo profesor; no se detalla la arquitectura interna) |
| Parámetros totales | no disponible (modelo base local declarado: `ornith-1.5:9b`, sin confirmación de tamaño efectivo) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card describe un sistema de "LLMs por clúster direccionados por contenido": cada clúster posee un LLM especializado identificado por un hash SHA-256 determinista. Al recibir un prompt nuevo, un espacio de entrenamiento en Hugging Face destila desde `deepseek/deepseek-v4.1-flash-1017`, actualiza el prompt WSP y el dataset del clúster y emite un nuevo `llm_hash`. El bundle activo es `v1` (2026-11-25T13:51:41Z), con modelo base local `ornith-1.5:9b`, profesor `deepseek/deepseek-v4.1-flash-1017` y un mínimo de 1 clúster con `max_distance=0.55` y `max_radius=0.65`.

El clúster documentado es `c2`, con LLM ID `ragllm-c2-09bdd9a7de2c`, hash `09bdd9a7de2c3326…`, 8 documentos, radio 0,4179 y WSP v4. No se especifican número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones de atención o decodificación. La información sobre el pipeline de destilación es descriptiva y no incluye hiperparámetros ni procedimiento reproducible.

## Capacidades

- Generación de texto y respuesta a prompts dentro del esquema RAG por clúster descrito.
- Recuperación aumentada sobre los documentos asociados a cada clúster (8 documentos en `c2`).
- Destilación desde un modelo profesor (`deepseek/deepseek-v4.1-flash-1017`) para actualizar el conocimiento del clúster.
- Versionado por hash determinista (`llm_hash`) del estado del clúster.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (la model card incluye una consulta de ejemplo en italiano, pero no se declaran idiomas soportados).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Documentación interna por dominio: usar el clúster `c2` con sus 8 documentos como base de conocimiento acotada para responder preguntas sobre un tema concreto, aprovechando el esquema RAG descrito.
- Prototipado de RAG con modelos especializados: emplear el flujo `pull`/`run`/`learn` del CLI `ragllm` para experimentar con actualización de conocimiento por clúster y versionado por hash.
- Investigación sobre destilación desde modelo profesor: estudiar cómo se actualiza el dataset WSP y el prompt del clúster a partir de `deepseek/deepseek-v4.1-flash-1017`.
- Reproducción de experimentos académicos: usar el bundle `v1` como referencia de un sistema de LLMs por clúster con parámetros `max_distance=0.55` y `max_radius=0.65`.
- Integración en pipelines de CI/CD de experimentación: automatizar la ejecución de `npm run ragllm -- run --repo luke3000/iunderstand-online` para validar el comportamiento del clúster tras cada actualización.
- Evaluación comparativa de esquemas RAG: contrastar el enfoque de clústeres direccionados por contenido frente a RAG monolítico convencional en tareas de documentación acotada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se confirma el tamaño efectivo del modelo; el base declarado es `ornith-1.5:9b`).
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el CLI propio `ragllm` (comandos `pull`, `run`, `learn`); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `luke3000/iunderstand-online` | no disponible | no disponible | sin benchmarks publicados | MIT | Hugging Face, 0 descargas |
| RAG monolítico con modelo base genérico | depende del base | depende del base | depende del base | depende del base | amplia |
| Modelos destilados de un profesor | no disponible | no disponible | no disponible | depende del caso | variable |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- Información pública mínima: no se declaran parámetros, contexto, idiomas ni dataset de entrenamiento.
- Sin benchmarks ni métricas de evaluación publicadas; no hay evidencia de rendimiento verificable.
- Cero descargas y cero likes: sin validación por parte de la comunidad.
- El repositorio tiene un tamaño de 0,0 GB, lo que puede indicar que los pesos no están efectivamente alojados o que el contenido es mínimo.
- Riesgo de alucinación: inherente a cualquier LLM; no se documentan mitigaciones.
- Sesgos conocidos: no documentados.
- Limitaciones de contexto o idioma: no documentadas; la única referencia lingüística es una consulta de ejemplo en italiano.
- Licencia MIT: permite uso comercial, pero al no haber documentación sobre el dataset de destilación ni sobre el modelo profesor, conviene revisar las condiciones de `deepseek/deepseek-v4.1-flash-1017` y de `ornith-1.5:9b` antes de un uso en producción.
- El esquema de actualización por hash implica que el modelo puede cambiar de comportamiento tras cada `learn`; conviene fijar versiones por `llm_hash` en entornos reproducibles.

## Enlaces

- Hugging Face: https://huggingface.co/luke3000/iunderstand-online
