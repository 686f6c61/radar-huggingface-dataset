# nativelang/classify-models

## Resumen

`nativelang/classify-models` es un repositorio de Hugging Face que distribuye dos paquetes de modelos de clasificación empaquetados en archivos ZIP, pensados para su uso con un "Classify SDK o servidor compatible" según indica la propia model card. No se trata de un modelo único con pesos expuestos en formato estándar (safetensors o GGUF), sino de un contenedor de artefactos de despliegue: los dos ZIP incluyen los ficheros del modelo y los avisos de licencia correspondientes.

El repositorio lo publica el usuario `nativelang` y contiene dos variantes identificadas por nombre: `dm-classify-compact-r3` (aproximadamente 1,58 GB) y `dm-classify-standard-r1` (aproximadamente 2,45 GB). Los nombres sugieren dos niveles de capacidad o tamaño ("compact" y "standard") y versiones de revisión distintas (r3 y r1), pero la model card no documenta arquitectura, parámetros, contexto ni datos de entrenamiento.

La relevancia de esta ficha es limitada desde el punto de vista de evaluación técnica: el repositorio no publica pipeline, licencia, idiomas, benchmarks ni especificaciones de arquitectura, y no hay descargas ni interacciones registradas. Cualquier evaluación rigurosa requeriría descargar los ZIP, inspeccionar su contenido y consultar la documentación del SDK de Classify, que no se incluye en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card menciona que los ZIP incluyen avisos de licencia, pero no se especifica el tipo) |
| Formato de pesos | no disponible; se distribuyen como archivos ZIP (`dm-classify-compact-r3.zip`, `dm-classify-standard-r1.zip`) |

Datos adicionales del repositorio:

| Parametro | Valor |
|---|---|
| ID del repositorio | nativelang/classify-models |
| Tamano del repo | 4,0 GB |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-11-27T23:23:22Z |
| Ultima actualizacion | 2026-11-27T23:38:48Z |
| Etiquetas | region:us |
| Pipeline | no disponible |

Artefactos publicados:

| Descarga | Bytes | SHA-256 |
|---|---:|---|
| dm-classify-compact-r3.zip | 1.578.269.501 | `37f6090c9760d46543fff5587ba1cdeef84cf55e02723a5923a3c866364deaa9` |
| dm-classify-standard-r1.zip | 2.450.864.999 | `1345fb5f8a2ec9ee30d46acc8ec4bcc28991a0c4442353d5652f83d2ce36de40` |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura en la model card ni en los metadatos del repositorio. Los nombres de los artefactos (`dm-classify-compact-r3` y `dm-classify-standard-r1`) apuntan a dos variantes de un modelo orientado a clasificación, presumiblemente con distinto tamaño o capacidad, pero no se confirma si se trata de un transformer, un modelo lineal, un encoder tipo BERT o cualquier otra familia.

Tampoco hay datos sobre el corpus de entrenamiento, el número de tokens, la composición del dataset, ni sobre si se aplicaron técnicas de ajuste como RLHF, DPO o supervisión específica para clasificación. La única información operativa es que los ZIP contienen "los ficheros del modelo y los avisos de licencia", lo que sugiere un empaquetado propietario o específico del ecosistema Classify, no un formato estándar de la comunidad.

## Capacidades

- Clasificación: el nombre del repositorio y de los artefactos indica que el modelo está diseñado para tareas de clasificación, aunque no se detalla qué tipo (texto, imágenes, audio u otro).
- Integración con SDK: la model card indica que los ZIP son para usar con un "Classify SDK o servidor compatible", lo que implica una dependencia de ese ecosistema para la inferencia.
- Generación de texto: no disponible.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Clasificación de documentos en un pipeline propio: si el SDK de Classify lo permite, el modelo podría emplearse para etiquetar documentos o registros en un flujo de procesamiento por lotes; la idoneidad depende de la documentación del SDK, no disponible aquí.
- Moderación de contenido: un modelo de clasificación puede integrarse en sistemas de filtrado, pero sin conocer las clases soportadas ni los idiomas no es posible confirmar su aplicabilidad.
- Enrutamiento de tickets o consultas: la variante "compact" podría usarse en entornos con restricciones de memoria y la "standard" en servidores con más recursos, a falta de datos de rendimiento.
- Clasificación en el borde (edge): el tamaño del ZIP compacto (1,58 GB) es compatible con despliegues en máquinas con recursos moderados, aunque se desconoce el consumo real en inferencia.
- Evaluación comparativa interna: descargar ambas variantes y comparar su comportamiento en un conjunto de validación propio para decidir cuál desplegar.
- Archivado y auditoría de artefactos: los hashes SHA-256 publicados permiten verificar la integridad de las descargas en entornos de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño de los ZIP (1,58 GB y 2,45 GB) no equivale necesariamente al peso en memoria del modelo descomprimido.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no se puede confirmar; el tamaño del artefacto compacto sugiere que podría caber en GPUs con 8-16 GB de VRAM, pero es una estimación no verificada.
- Opciones de despliegue: la model card menciona un "Classify SDK o servidor compatible"; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables de la misma familia ni se dispone de datos de rendimiento, parámetros o licencia que permitan una comparación rigurosa con alternativas de clasificación.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay arquitectura, parámetros, contexto ni datos de entrenamiento publicados.
- Licencia no especificada: la model card indica que los ZIP incluyen avisos de licencia, pero no se detalla el tipo; no se puede asumir uso comercial sin revisar esos avisos.
- Idiomas no declarados: no se puede garantizar soporte para castellano ni para ningún otro idioma.
- Dependencia de un SDK propietario o específico: los artefactos no están en formatos estándar (safetensors, GGUF) y requieren el ecosistema Classify para su uso.
- Riesgo de alucinación y sesgos: no evaluable sin datos de entrenamiento ni benchmarks.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de validación comunitaria.
- Verificación de integridad recomendada: usar los hashes SHA-256 publicados antes de desplegar cualquier artefacto en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nativelang/classify-models
- Descarga dm-classify-compact-r3.zip: https://huggingface.co/nativelang/classify-models/resolve/main/models/dm-classify-compact-r3.zip
- Descarga dm-classify-standard-r1.zip: https://huggingface.co/nativelang/classify-models/resolve/main/models/dm-classify-standard-r1.zip
