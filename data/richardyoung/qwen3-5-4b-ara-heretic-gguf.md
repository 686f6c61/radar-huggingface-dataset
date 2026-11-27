# richardyoung/Qwen3.5-4B-ARA-heretic-GGUF

## Resumen

Qwen3.5-4B-ARA-heretic-GGUF es una cuantizacion en formato GGUF del modelo richardyoung/Qwen3.5-4B-ARA-heretic, una variante "abliterated" (tambien etiquetada como "heretic" y "uncensored") de un modelo base de la familia Qwen3.5 con 4.205.751.296 parametros totales. Lo publica el usuario richardyoung en Hugging Face, y su proposito es ofrecer una version con los mecanismos de rechazo o censura atenuados o eliminados, lista para ejecutarse en llama.cpp y Ollama mediante pesos cuantizados.

El modelo resuelve el problema de desplegar localmente un LLM conversacional de ~4B parametros sin las restricciones de alineacion habituales, manteniendo la compatibilidad con el ecosistema GGUF. Esta pensado para investigacion sobre comportamiento de modelos, estudios de robustez y experimentacion con tecnicas de "abliteration", tal como indican sus etiquetas (`research`, `heretic`, `abliterated`, `uncensored`).

Es relevante ahora porque los modelos de ~4B con cuantizacion GGUF permiten inferencia en hardware de consumo, y porque las variantes sin censura son objeto de estudio academico (la ficha referencia el paper arXiv:2611.17846). El acceso esta restringido (gated): requiere aceptar condiciones en Hugging Face antes de descargar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Qwen3.5; arquitectura transformer no confirmada en la informacion) |
| Parametros totales | 4.205.751.296 (~4,2B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes concretas no detalladas en la informacion); generado con imatrix |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp y Ollama) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la informacion proporcionada. El modelo deriva de richardyoung/Qwen3.5-4B-ARA-heretic, que a su vez parte de un modelo Qwen3.5 de ~4,2B parametros. La etiqueta "ARA" y "heretic" sugiere la aplicacion de tecnicas de abliteration (modificacion de direcciones de activacion para eliminar el comportamiento de rechazo) sobre el modelo alineado original, aunque los detalles exactos del procedimiento no se documentan en la ficha.

La cuantizacion se ha realizado con imatrix (importance matrix), una tecnica que calibra los pesos cuantizados con datos de calibracion para reducir la perdida de calidad respecto a una cuantizacion ingenua. No hay datos sobre el numero de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF o DPO en el modelo base, mas alla de lo que herede de Qwen3.5.

## Capacidades

- Generacion de texto conversacional multi-turno (pipeline `text-generation`, tag `conversational`).
- Ejecucion local en llama.cpp y Ollama gracias al formato GGUF.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su integracion en servicios de inferencia.
- Comportamiento "uncensored"/"abliterated": menor tendencia a rechazar peticiones, orientado a investigacion.
- Idiomas: unicamente ingles declarado (`en`).
- No se documentan en la informacion capacidades de tool calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Investigacion sobre alineacion y abliteration: comparar el comportamiento del modelo base frente a la variante heretic para estudiar como se modifican las respuestas ante peticiones sensibles.
- Analisis de robustez y seguridad: usar el modelo como sujeto de pruebas en pipelines de red-teaming para evaluar clasificadores de contenido y filtros de salida.
- Despliegue local en hardware de consumo: con ~4,2B parametros y cuantizacion GGUF, cabe en GPUs de gama media y permite experimentacion sin coste de API.
- Prototipado de asistentes conversacionales en ingles: integracion rapida via Ollama para validar flujos de chat antes de migrar a modelos mayores.
- Evaluacion de cuantizacion con imatrix: comparar la calidad de las distintas variantes GGUF frente al modelo en safetensors para medir la degradacion.
- Educacion y docencia: demostraciones en aula de como funcionan los modelos abliterated y sus riesgos, en un entorno controlado y local.
- Generacion de texto creativo sin filtros en entornos de investigacion, siempre que se cumplan las condiciones de la licencia y el acceso gated.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para ~4,2B parametros, una cuantizacion Q4_K_M ocuparia aproximadamente 2,5-3 GB; Q8 rondaria 4,5 GB; FP16 requeriria ~8,5 GB. Estas cifras son estimaciones por tamano, no datos publicados para este modelo concreto.
- GPU recomendadas: cualquier GPU con 6-8 GB de VRAM para cuantizaciones medias (RTX 3060, RTX 4060, RTX 2070). Para FP16, RTX 3090, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: si, en la mayoria de GPUs modernas con al menos 6 GB de VRAM usando cuantizaciones Q4/Q5.
- Opciones de despliegue: llama.cpp, Ollama (etiquetado explicitamente), y servidores compatibles con endpoints.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| richardyoung/Qwen3.5-4B-ARA-heretic-GGUF | ~4,2B | no disponible | apache-2.0 | GGUF | Variante abliterated, acceso gated |
| richardyoung/Qwen3.5-4B-ARA-heretic (base) | ~4,2B | no disponible | apache-2.0 | safetensors | Modelo original sin cuantizar |
| Modelos Qwen3.5 de ~4B (familia) | ~4B | no disponible | segun variante | safetensors/GGUF | Alineados; sin modificacion heretic |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored"/"abliterated": puede generar contenido inapropiado, ofensivo o danino; no apto para produccion orientada al publico general sin filtros adicionales.
- Riesgo elevado de alucinacion, comun en modelos de ~4B y potencialmente agravado por la modificacion de pesos.
- Solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar; esto limita la automatizacion de despliegues.
- Licencia apache-2.0 permite uso comercial, pero el autor no garantiza idoneidad ni asume responsabilidad sobre el contenido generado.
- La falta de documentacion sobre el proceso de abliteration y sobre el contexto maximo complica su uso en produccion.
- No se documentan capacidades de tool calling ni de agentes; no asumir su disponibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen3.5-4B-ARA-heretic-GGUF
- Modelo base: https://huggingface.co/richardyoung/Qwen3.5-4B-ARA-heretic
- Paper referenciado en tags: arXiv:2611.17846 (https://arxiv.org/abs/2611.17846)
