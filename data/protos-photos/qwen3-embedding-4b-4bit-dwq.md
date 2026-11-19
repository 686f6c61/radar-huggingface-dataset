# protos-photos/Qwen3-Embedding-4B-4bit-DWQ

## Resumen

Qwen3-Embedding-4B-4bit-DWQ es una cuantización en 4 bits del modelo de embeddings Qwen/Qwen3-Embedding-4B, desarrollado originalmente por el equipo Qwen de Alibaba. El repositorio analizado es un espejo sin modificaciones del artefacto publicado por mlx-community, mantenido por protos-photos para preservar la disponibilidad de la descarga. El modelo base resuelve tareas de representación vectorial de texto: similitud semántica, extracción de características y recuperación de información mediante embeddings densos.

La variante DWQ (Distilled Weight Quantization) reduce los pesos a 4 bits manteniendo el formato MLX, lo que permite ejecutar un modelo de 4.021.774.336 parámetros en hardware Apple Silicon con un consumo de memoria notablemente inferior al de los pesos completos. El repositorio ocupa 2,3 GB, frente a los aproximadamente 8 GB que requeriría la versión en bfloat16.

Es relevante para desarrolladores que trabajan en el ecosistema Apple (MLX) y necesitan un modelo de embeddings de calidad con licencia Apache 2.0, sin depender de GPUs NVIDIA ni de servicios en la nube. La ficha se centra en el artefacto cuantizado tal como se distribuye, no en el modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 4.021.774.336 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (DWQ, formato MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3-Embedding-4B pertenece a la familia Qwen3 y está orientado a la generación de embeddings de texto. La información proporcionada no detalla la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención) ni la composición del dataset de entrenamiento, el número de tokens utilizados o si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se especifica la dimensión del vector de embedding resultante ni si el modelo soporta instrucciones de tarea (task instructions) para adaptar el embedding al dominio.

La innovación principal del artefacto es la cuantización DWQ a 4 bits realizada con mlx-lm 0.24.0, que comprime los pesos para su ejecución en el framework MLX de Apple. No se documentan en la información disponible detalles sobre el proceso de destilación de pesos, la pérdida de calidad respecto al modelo original ni las técnicas de calibración empleadas.

## Capacidades

- Generación de embeddings de texto para similitud semántica y sentence-similarity.
- Extracción de características (feature-extraction) para pipelines de recuperación y ranking.
- Compatible con la API de sentence-transformers según los tags del repositorio.
- Compatible con text-embeddings-inference y con endpoints compatibles según los tags.
- Ejecución en Apple Silicon mediante MLX (mlx-lm).
- Capacidades multilingües: no confirmadas en la información disponible.
- Tool calling, agentes, razonamiento multi-paso, visión o audio: no disponibles; el modelo es de embeddings, no generativo de propósito general.

## Casos de uso

- Búsqueda semántica en aplicaciones locales para macOS: indexar documentos y consultar por similitud vectorial ejecutando el modelo en MLX sin conexión a servicios externos, aprovechando el tamaño reducido de 2,3 GB.
- Clasificación de textos por similitud: agrupar tickets de soporte o correos comparando embeddings contra prototipos predefinidos, con inferencia en un portátil Apple Silicon.
- Deduplicación de contenidos: detectar documentos o registros casi idénticos en un corpus calculando similitud coseno entre embeddings.
- RAG (retrieval-augmented generation) en local: usar el modelo como recuperador en un pipeline que alimente a un LLM pequeño ejecutado también en MLX, manteniendo todo el flujo en el dispositivo.
- Motor de recomendación basado en contenido: representar ítems y perfiles de usuario como vectores y calcular afinidad por similitud.
- Filtrado y moderación de textos: comparar la similitud de mensajes entrantes con conjuntos de referencia etiquetados para priorizar revisiones.
- Prototipado rápido en investigación: evaluar la calidad de embeddings de Qwen3 en 4 bits antes de comprometer recursos en la versión completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio pesa 2,3 GB en 4 bits; la inferencia requiere memoria adicional para activaciones y contexto, no cuantificada en la información disponible.
- Hardware objetivo: Apple Silicon (MLX). No se documenta soporte para GPU NVIDIA ni CUDA en este artefacto.
- Cabe en equipos Apple con memoria unificada de 8 GB o superior, aunque el margen real depende del lote y la longitud de secuencia.
- Despliegue: mlx-lm (versión 0.24.0 o superior según la model card); compatible con text-embeddings-inference según tags, aunque no se detalla la configuración.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-Embedding-4B-4bit-DWQ (este) | 4.021.774.336 | no disponible | 4 bits DWQ | Apache 2.0 | safetensors MLX |
| Qwen/Qwen3-Embedding-4B (base) | 4.021.774.336 (aproximado) | no disponible | bf16/fp16 (no confirmado) | Apache 2.0 | safetensors |
| mlx-community/Qwen3-Embedding-4B-4bit-DWQ (original) | 4.021.774.336 | no disponible | 4 bits DWQ | Apache 2.0 | safetensors MLX |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada para establecer diferencias de rendimiento.

## Limitaciones y advertencias

- Es un espejo, no un desarrollo propio: cualquier cambio en el repositorio original no se refleja automáticamente; la revisión fijada es b5d88f1fe49b50d2ac01b4692ca2d387f14f9c72.
- La cuantización a 4 bits puede degradar la calidad de los embeddings respecto al modelo en precisión completa; no se documenta la magnitud de la pérdida.
- El modelo es específico para embeddings; no debe usarse para generación de texto pese a que los tags incluyan text-generation.
- No se confirman los idiomas soportados ni el rendimiento multilingüe.
- No se documenta la longitud de contexto máxima, lo que limita la planificación de pipelines con documentos largos.
- Riesgo de sesgos heredados del corpus de entrenamiento del modelo base, no documentado en esta información.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-Embedding-4B y citar adecuadamente a los autores originales.
- Dependencia del ecosistema MLX: no es directamente desplegable en vLLM, TGI (salvo compatibilidad declarada por tags) ni llama.cpp sin conversión adicional.

## Enlaces

- Repositorio analizado: https://huggingface.co/protos-photos/Qwen3-Embedding-4B-4bit-DWQ
- Repositorio original espejado: https://huggingface.co/mlx-community/Qwen3-Embedding-4B-4bit-DWQ
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-4B
- Librería MLX-LM: https://github.com/ml-explore/mlx-lm
