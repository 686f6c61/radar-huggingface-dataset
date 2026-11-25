# qhoenix/zz-34c6dc

## Resumen

zz-34c6dc es un modelo de la familia Qwen, publicado por el usuario qhoenix en Hugging Face como un fine-tune del modelo base Qwen/Qwen3.8-27B. Con 26.085.330.160 parámetros totales según los pesos en safetensors (aproximadamente 26.000 millones), se distribuye bajo licencia Apache-2.0 y está etiquetado para la tarea de extracción de características (feature-extraction) dentro de la librería transformers.

La model card es extremadamente escueta y no aporta información técnica sustantiva: se limita a indicar que se trata de un "Zils d3 soup-pool body in the pinned d3-ultra chassis layout", una descripción que no corresponde a terminología estándar de arquitecturas de modelos de lenguaje y que no permite deducir detalles de diseño, entrenamiento o rendimiento. El repositorio ocupa 52,2 GB, un tamaño coherente con pesos en precisión de 16 bits para un modelo de este número de parámetros.

El interés de esta ficha es, por tanto, limitado y fundamentalmente descriptivo: se trata de un artefacto reciente (creado el 25 de noviembre de 2026), sin descargas ni interacciones registradas, y cuya documentación pública no permite verificar capacidades, calidad ni idoneidad para producción. Cualquier evaluación rigurosa requeriría inspeccionar los pesos y el código personalizado incluido en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta qwen3_5; sin detalle en la model card) |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna más allá de la etiqueta `qwen3_5` y de la referencia al modelo base Qwen/Qwen3.8-27B. La model card no describe el tipo de transformer, la presencia de mezcla de expertos, mecanismos de atención lineal ni ninguna innovación técnica. Tampoco se documentan el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de ajuste supervisado, RLHF o DPO.

El repositorio incluye la etiqueta `custom_code`, lo que indica que el modelo requiere código propio para cargarse y que no funciona con una configuración estándar de transformers sin esa implementación. No hay información pública sobre qué modifica ese código ni sobre el procedimiento de fine-tune aplicado sobre el modelo base.

## Capacidades

- No hay capacidades documentadas por el autor.
- La tarea declarada en el pipeline es extracción de características (feature-extraction), no generación de texto, aunque el tamaño y el modelo base sugieren que podría emplearse para representaciones o generación si el código personalizado lo permite.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Extracción de embeddings para búsqueda semántica: el pipeline declarado es feature-extraction, por lo que el uso más directo sería generar representaciones vectoriales de documentos, siempre que se valide empíricamente la calidad de los embeddings producidos.
- Clasificación de textos mediante representaciones: usar las activaciones del modelo como entrada a un clasificador ligero en tareas de moderación o etiquetado, tras verificar el comportamiento del código personalizado.
- Experimentación e investigación: serviría como objeto de estudio para analizar qué efectos produce un fine-tune sobre el modelo base Qwen/Qwen3.8-27B, comparando representaciones entre ambos.
- Evaluación comparativa de robustez: al carecer de documentación, puede emplearse en pruebas internas para medir hasta qué punto un fine-tune sin model card conserva las capacidades del modelo original.
- Prototipado interno con licencia permisiva: la licencia Apache-2.0 facilita su uso en entornos corporativos, aunque la ausencia de garantías y de documentación exige validación previa.
- Base para nuevos fine-tunes: podría servir como punto de partida para ajustes posteriores, siempre que se resuelva primero la carga del código personalizado y se documente su comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 52 GB solo para pesos, más overhead de activaciones y caché KV, por lo que se recomienda al menos 60-80 GB de VRAM.
- VRAM estimada en cuantización de 8 bits: aproximadamente 26-30 GB, adecuada para una A100 de 40 GB o una RTX 4090 de 24 GB solo con cuantizaciones más agresivas.
- VRAM estimada en cuantización de 4 bits: en torno a 13-16 GB, viable en GPUs de consumo como RTX 4090 o RTX 3090, siempre que el código personalizado sea compatible con la ruta de cuantización elegida.
- GPUs recomendadas: A100 80 GB, H100 80 GB o múltiples GPUs para fp16; RTX 4090/3090 para cuantizaciones bajas.
- Opciones de despliegue: transformers con el código personalizado del repositorio; vLLM, llama.cpp, Ollama o TGI no están confirmados como compatibles y requerirían verificación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Documentacion |
|---|---|---|---|---|
| qhoenix/zz-34c6dc | 26.085.330.160 | no disponible | apache-2.0 | Practicamente inexistente |
| Qwen/Qwen3.8-27B (modelo base) | no disponible en esta ficha | no disponible | no disponible en esta ficha | Model card oficial del autor original |
| Alternativas de ~27B open source | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento del modelo ni de alternativas verificadas en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- La model card no documenta sesgos, datos de entrenamiento ni procesos de alineación, por lo que no es posible evaluar riesgos de sesgo.
- Riesgo de alucinación desconocido: no hay evaluaciones publicadas ni descripción del fine-tune.
- Idiomas soportados no declarados; no se puede asumir cobertura multilingüe.
- Longitud de contexto no disponible, lo que impide planificar usos con ventanas largas.
- El repositorio incluye `custom_code`, lo que implica riesgo de ejecución de código no auditado; conviene revisarlo antes de cargar el modelo en producción.
- Cero descargas y cero interacciones en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.
- La licencia Apache-2.0 permite uso comercial, pero la ausencia de documentación y de garantías traslada toda la responsabilidad de validación al integrador.
- La descripción "Zils d3 soup-pool body" no es terminología técnica reconocible y no debe interpretarse como especificación de arquitectura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qhoenix/zz-34c6dc
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3.8-27B
