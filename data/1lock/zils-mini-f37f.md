# 1lock/zils-mini-f37f

## Resumen

1lock/zils-mini-f37f es un modelo de lenguaje publicado en Hugging Face por el usuario 1lock, distribuido bajo licencia Apache 2.0 y con un total de 4.539.265.536 parámetros (aproximadamente 4,54 mil millones) según los pesos en formato safetensors. Se trata de un derivado modificado (finetune o merge) de tres modelos base: Zayaan/zils-mini-hm4, qhoenix/zils-mini-decision-t2avg y joamCriff123/zils-mini-m1113b, según declara el propio autor en la model card.

El modelo se distribuye en la librería transformers con pesos safetensors y un tamaño de repositorio de 9,1 GB, lo que es coherente con un modelo denso de ~4,5B parámetros en precisión de 16 bits. No se especifica la arquitectura interna, la longitud de contexto, los idiomas soportados ni los datos de entrenamiento, y no se han publicado resultados de benchmarks.

La relevancia de esta ficha es limitada: el modelo no registra descargas ni likes en el momento de la consulta, carece de pipeline declarado y su model card es mínima, limitándose a atribuir la autoría de los modelos base y a indicar la licencia. Cualquier evaluación en producción debería partir de una validación empírica propia, dado que no hay información técnica publicada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer, no confirmado) |
| Parametros totales | 4.539.265.536 (~4,54B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Modelo base | Zayaan/zils-mini-hm4, qhoenix/zils-mini-decision-t2avg, joamCriff123/zils-mini-m1113b |
| Tamano del repositorio | 9,1 GB |
| Pipeline declarado | no disponible |
| Fecha de creacion | 2026-11-14 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo. Por el número de parámetros (~4,54B) y el tamaño del repositorio (9,1 GB), es consistente con un transformer denso almacenado en fp16/bf16, pero el autor no confirma ni la familia arquitectónica, ni el uso de atención lineal, SSM o mezcla de expertos.

Tampoco se detallan los datos de entrenamiento: no hay cifras de tokens, composición del dataset, ni mención a RLHF, DPO o SFT. La model card únicamente indica que se trata de un derivado modificado de tres modelos base, lo que sugiere una operación de finetune, merge o destilación sobre ellos, pero sin especificar la técnica. No se declara ninguna innovación técnica (decodificación especulativa, atención con ventana deslizante, etc.).

## Capacidades

- Generación de texto: capacidad esperable en un modelo de ~4,5B parámetros, pero no documentada por el autor.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible (no se declara compatibilidad con plantillas de herramientas).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede desplegarse en Hugging Face Inference Endpoints, pero no se detalla el formato de prompt.

## Casos de uso

- Evaluación comparativa de merges de modelos pequeños: el modelo puede usarse como punto de partida para experimentar con técnicas de merge o finetune sobre modelos de ~4,5B, dado que su licencia Apache 2.0 lo permite.
- Prototipado de asistentes conversacionales de bajo coste: con ~4,5B parámetros, es viable en una GPU de consumo con cuantización, aunque la ausencia de datos de contexto e idioma obliga a validar el comportamiento antes de usarlo.
- Generación de texto en pipelines de investigación: útil como baseline en experimentos académicos que comparen derivados de la familia zils-mini.
- Fine-tuning adicional: al ser un modelo base derivado, puede servir como inicialización para tareas específicas de dominio, siempre que se valide su calidad previa.
- Despliegue en Inference Endpoints: la etiqueta `endpoints_compatible` permite probarlo rápidamente en la infraestructura de Hugging Face sin gestionar servidores propios.
- Docencia y demostraciones: su tamaño moderado y licencia permisiva lo hacen adecuado para talleres sobre despliegue de modelos con transformers, aunque sin garantías de calidad lingüística.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9-10 GB solo para pesos, más overhead de activaciones y KV cache (estimación orientativa, no publicada por el autor).
- VRAM estimada en cuantización de 8 bits: ~5-6 GB; en 4 bits: ~3-4 GB (estimaciones basadas en el número de parámetros, no en mediciones del autor).
- GPU recomendadas: una RTX 3090/4090 (24 GB) permite fp16 con contexto moderado; una A100 40/80 GB o H100 ofrece margen para contextos largos y mayor throughput.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4070 Ti 12 GB o superiores usando cuantización de 8 o 4 bits; en fp16 requiere al menos 12 GB y puede quedar justo.
- Opciones de despliegue: transformers (librería declarada), Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`); vLLM, llama.cpp, Ollama o TGI no están confirmados por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1lock/zils-mini-f37f | ~4,54B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Derivado de tres modelos zils-mini; sin benchmarks |
| Zayaan/zils-mini-hm4 (base) | no disponible | no disponible | no disponible | Hugging Face | Modelo base declarado; sin datos tecnicos en esta ficha |
| qhoenix/zils-mini-decision-t2avg (base) | no disponible | no disponible | no disponible | Hugging Face | Modelo base declarado; sin datos tecnicos en esta ficha |
| joamCriff123/zils-mini-m1113b (base) | no disponible | no disponible | no disponible | Hugging Face | Modelo base declarado; sin datos tecnicos en esta ficha |

No se dispone de información suficiente para comparar con alternativas de la misma categoría (por ejemplo, Llama 3.2 3B, Qwen2.5 3B o Phi-3.5-mini), ya que no hay benchmarks ni especificaciones publicadas de este modelo.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se declaran arquitectura, contexto, idiomas ni datos de entrenamiento, lo que impide evaluar su idoneidad para producción.
- Sin benchmarks publicados: no hay evidencia de rendimiento en MMLU, HumanEval, GSM8K ni otras tareas estándar.
- Riesgo de alucinación desconocido: al no documentarse el proceso de alineación (RLHF/DPO), no puede estimarse la frecuencia de respuestas inventadas.
- Sesgos desconocidos: no se describe la composición del dataset ni filtros aplicados.
- Idiomas no declarados: no puede confirmarse soporte de castellano ni de otras lenguas.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor advierte de que es un derivado y remite a la licencia de los modelos upstream, que no se detalla en la información disponible.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación por terceros.
- Sin pipeline declarado: la integración con `transformers` puede requerir configuración manual de la cabeza de tarea.
- Fecha de creación futura (2026-11-14): conviene verificar la integridad y procedencia de los pesos antes de usarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/1lock/zils-mini-f37f
- Modelo base Zayaan/zils-mini-hm4: https://huggingface.co/Zayaan/zils-mini-hm4
- Modelo base qhoenix/zils-mini-decision-t2avg: https://huggingface.co/qhoenix/zils-mini-decision-t2avg
- Modelo base joamCriff123/zils-mini-m1113b: https://huggingface.co/joamCriff123/zils-mini-m1113b
