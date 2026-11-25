# 88AgentS/ai-security-demo-clean

## Resumen

`88AgentS/ai-security-demo-clean` es un modelo de tipo clasificador publicado en Hugging Face por el usuario 88AgentS. Segun la model card, su proposito declarado no es resolver una tarea de machine learning de produccion, sino servir como demostracion del escaneo de seguridad de modelos de Prisma AIRS (Palo Alto Networks): el autor lo presenta como un artefacto que supera todas las comprobaciones de seguridad y obtiene el estado APPROVED. La model card incluye una tabla con metadatos del escaneo (fecha, pipeline de GitHub Actions y politica aplicada).

El repositorio es de tamano practicamente nulo (0.0 GB) y el recuento de parametros reportado en safetensors es de 74.442, un orden de magnitud propio de un clasificador muy pequeno o de un artefacto de prueba, no de un modelo generativo. No se documentan arquitectura, contexto, idiomas ni datos de entrenamiento. La licencia es Apache 2.0 y las etiquetas incluyen `safetensors`, `classifier`, `airs-approved` y `region:us`.

Su relevancia es, por tanto, instrumental: resulta util como ejemplo de pipeline de validacion de seguridad de artefactos antes del despliegue, y como caso de estudio de model cards que certifican cumplimiento en lugar de describir capacidades. No debe confundirse con un modelo de lenguaje o multimodal evaluable en tareas de razonamiento, codigo o generacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como `classifier`) |
| Parametros totales | 74.442 (según safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna mas alla de la etiqueta `classifier` del repositorio. El recuento de parametros (74.442) sugiere una red de clasificacion de muy pequeno tamano, pero no se especifica si se trata de un transformer, una cabeza de clasificacion sobre un encoder, un perceptron multicapa u otra variante. Tampoco se documentan la composicion del dataset, el numero de tokens o ejemplos de entrenamiento, ni si hubo ajuste fino supervisado, RLHF o DPO.

La unica innovacion tecnica declarada no es de modelado sino de proceso: la model card certifica que el artefacto ha pasado por el escaneo de Prisma AIRS Model Security dentro de una puerta de GitHub Actions, con estado APPROVED y fecha de escaneo 2026-11-23. No se aportan detalles sobre las reglas de la politica aplicada ni sobre los artefactos analizados.

## Capacidades

- Clasificacion: el repositorio esta etiquetado como `classifier`, por lo que su funcion prevista es la asignacion de etiquetas a una entrada, sin que se especifiquen las clases ni el dominio.
- Generacion de texto: no disponible; no hay evidencia de que el modelo sea generativo.
- Razonamiento, codigo y matematicas: no disponible.
- Vision o audio: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidad especial: certificacion de seguridad mediante Prisma AIRS (estado APPROVED) como parte del flujo de publicacion.

## Casos de uso

- Validacion de pipelines de seguridad de modelos: usar el repositorio como artefacto de referencia que debe pasar la puerta de Prisma AIRS en GitHub Actions, comparando su comportamiento con el de un modelo deliberadamente marcado como no aprobado.
- Pruebas de integracion de CI/CD: emplearlo como entrada fija en tests que verifiquen que el gate de seguridad devuelve APPROVED y que el despliegue continua solo con ese estado.
- Demostracion comercial o docente de model scanning: ilustrar ante un equipo como una model card puede incluir metadatos de escaneo (estado, fecha, politica y pipeline) de forma verificable.
- Verificacion de formato de pesos: servir como ejemplo minimo de artefacto en safetensors para comprobar cargadores, validadores de checksum y herramientas de inventario de modelos.
- Pruebas de humo de un registro de modelos interno: usar un artefacto de 74.442 parametros para validar el flujo de subida, etiquetado y descarga sin coste de almacenamiento ni de computo.
- Formacion en gobernanza de IA: como caso de estudio de una licencia Apache 2.0 combinada con una certificacion de seguridad de terceros, util para discutir que metadatos debe exigir una organizacion antes de desplegar un modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con 74.442 parametros, el peso en precision completa es del orden de centenares de kilobytes, aunque no se confirma la precision de los pesos.
- GPU recomendadas: no disponible; por tamano, la inferencia cabria en CPU o en cualquier GPU consumer, pero no hay datos publicados que lo confirmen.
- GPU consumer: previsiblemente cabe en cualquier GPU consumer por el numero de parametros, sin confirmacion del autor.
- Opciones de despliegue: no disponibles; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica modelos comparables de la misma categoria (clasificadores de demostracion para escaneo de seguridad), y las diferencias de tamano y proposito impiden una comparacion significativa con clasificadores o LLM convencionales.

## Limitaciones y advertencias

- Ausencia de documentacion tecnica: no se describen arquitectura, datos de entrenamiento, clases de salida ni metricas, lo que impide evaluar su calidad como clasificador.
- Proposito demostrativo: la model card lo presenta como demostracion de Prisma AIRS, no como modelo para produccion; usarlo en tareas reales de clasificacion carece de respaldo.
- Riesgo de alucinacion: no aplica si el modelo no es generativo, pero no puede descartarse sin conocer la arquitectura.
- Idiomas y contexto: no disponibles; no hay garantia de cobertura linguistica ni de longitud maxima de entrada.
- Sesgos: no evaluables por falta de informacion sobre el dataset.
- Licencia: Apache 2.0 permite uso comercial, pero la certificacion AIRS no implica idoneidad funcional ni exactitud del modelo.
- Caveat de produccion: la aprobacion de seguridad de un escaneo puntual (2026-11-23) no sustituye a una evaluacion de rendimiento, sesgo ni robustez antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/88AgentS/ai-security-demo-clean
- Prisma AIRS (Palo Alto Networks), referenciado en la model card: https://www.paloaltonetworks.com/sase/ai-security
