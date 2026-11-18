# positron-ai/Qwen_Qwen3.5-27B-ingest-best-gptq_proj

## Resumen

Este repositorio contiene una build cuantizada en GPTQ de 4 bits del modelo Qwen/Qwen3.5-27B, publicada por Positron AI. Se trata de un artefacto de inferencia derivado, no de un modelo entrenado desde cero: el trabajo de Positron AI consiste en aplicar cuantizacion GPTQ sobre los pesos originales de Qwen para reducir el espacio en disco y la VRAM necesaria, manteniendo el comportamiento del modelo base. El modelo base, Qwen3.5-27B, pertenece a la familia Qwen3.5 desarrollada por el equipo Qwen de Alibaba, y esta etiquetado como `image-text-to-text` en sus tags, lo que sugiere capacidades multimodales ademas de generacion de texto.

El artefacto esta marcado explicitamente como **superseded**: el propio autor indica que existe una build mas reciente (`positron-ai/Qwen_Qwen3.5-27B-ingest-best-gptq`, commit `3c088f0a29d0180d4642d6f0e92d6551feaf0506`) que deberia usarse para trabajo nuevo. Este repositorio se mantiene unicamente por compatibilidad con usuarios existentes. Con 27.781.427.952 parametros reales (segun safetensors) y un tamano de repo de 20,1 GB, la cuantizacion a 4 bits reduce el peso en disco aproximadamente a la mitad respecto a los pesos en BF16/FP16, lo que lo hace viable en GPUs de consumo alto con suficiente VRAM.

La relevancia de esta ficha es doble: por un lado documenta una opcion practica para desplegar un modelo de ~27B en hardware limitado; por otro, sirve de advertencia sobre la gobernanza de artefactos cuantizados, ya que el autor no publica metricas de calidad (ni KL-divergence, ni perplexity, ni accuracy) y la model card remite a la build actual. Cualquier evaluacion de produccion debe hacerse contra el modelo base y contra la build vigente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5); detalles de capas y atencion no disponibles en la informacion proporcionada |
| Parametros totales | 27.781.427.952 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la calibracion uso secuencias de 8192 tokens) |
| Tipos de cuantizacion | GPTQ 4-bit, pesos simetricos, group size 64, activaciones sin cuantizar, `desc_act=false`, damp 0.05 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 20,1 GB); libreria `transformers`; tag `endpoints_compatible` |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-27B es un transformer de la familia Qwen3.5 de Alibaba. La informacion disponible no detalla el numero de capas, la configuracion de atencion (por ejemplo, si emplea atencion lineal o hibrida), ni el regimen de entrenamiento (tokens, composicion del dataset, RLHF/DPO). La tag `image-text-to-text` en el artefacto sugiere que el modelo base admite entrada de imagen y texto, aunque no se especifica la arquitectura del codificador visual ni el esquema de fusion multimodal.

Lo que si esta documentado es el proceso de cuantizacion: Positron AI aplico GPTQ sobre los pesos del modelo base con toolchain GPTQModel 7.3.4, transformers 5.11.0, torch 2.9.1 y CUDA 12.8. La calibracion uso un conjunto mixto de dominio universal con 512 muestras de 8192 tokens de longitud, cuantizacion simetrica de 4 bits con group size 64, sin `desc_act` y con damp percent de 0,05. Las activaciones no se cuantizan. No se indica la precision de origen de los pesos ni el runtime objetivo.

## Capacidades

- Generacion de texto conversacional y de proposito general, heredada del modelo base Qwen3.5-27B.
- Procesamiento de imagen y texto (`image-text-to-text` segun las tags del artefacto), aunque el alcance exacto de la capacidad multimodal no esta detallado.
- Compatibilidad con endpoints de inferencia (tag `endpoints_compatible`).
- Integracion con el ecosistema `transformers` y pesos en safetensors.
- Capacidades de razonamiento, codigo, matematicas, tool calling o agentes: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue en GPUs de consumo alto: la cuantizacion GPTQ 4-bit reduce el peso a 20,1 GB, lo que permite ejecutar un modelo de ~27B en tarjetas con 24 GB de VRAM (por ejemplo, RTX 4090) siempre que el runtime y el contexto elegido encajen en el presupuesto de memoria; util para prototipado local sin depender de clústeres.
- Servicio de generacion de texto en endpoints compatibles: el tag `endpoints_compatible` y el formato safetensors permiten cargarlo en stacks de inferencia estandar basados en `transformers`, adecuado para APIs internas de chat o resumen.
- Evaluacion comparativa de cuantizaciones: sirve como artefacto de referencia para medir el impacto de GPTQ 4-bit frente al modelo base en tareas propias, dado que el autor no publica metricas de calidad.
- Pipelines multimodales ligeros: si el modelo base conserva la capacidad `image-text-to-text`, puede usarse para tareas de descripcion de imagenes o VQA en entornos con VRAM limitada, previa validacion de que la cuantizacion no degrada el codificador visual.
- Reproducibilidad de artefactos: util para equipos que ya dependian de esta build concreta y necesitan fijar una version exacta de pesos en sus pipelines, aunque para trabajo nuevo deberian migrar a la build vigente.
- Fine-tuning ligero o adaptadores: al estar en `transformers` y safetensors, puede servir de base para LoRA/QLoRA sobre el modelo cuantizado, aunque la viabilidad depende del soporte del runtime para entrenar sobre GPTQ.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no reporta metricas de rendimiento ni de calidad (sin KL-divergence, accuracy ni perplexity) y que las validaciones se gestionan internamente en Positron AI.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 20,1 GB en GPTQ 4-bit; se necesita margen adicional para el contexto (KV cache) y overhead del runtime. Con contextos largos, el consumo puede superar los 20 GB.
- GPU recomendadas: no especificadas por el autor (`Hardware target: n/a`). Por tamano, encaja en GPUs de 24 GB o mas (RTX 4090, L40S, A10G de 24 GB con contexto moderado) y en A100/H100 para contextos largos o mayor throughput.
- GPU de consumo: si cabe en RTX 4090 (24 GB) con contexto limitado; en tarjetas de 16 GB o menos no es viable sin cuantizacion adicional u offloading.
- Opciones de despliegue: `transformers` con soporte GPTQ (toolchain documentado: GPTQModel 7.3.4, transformers 5.11.0, torch 2.9.1, CUDA 12.8). Otros runtimes (vLLM, TGI, llama.cpp, Ollama) no estan confirmados en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|
| positron-ai/Qwen_Qwen3.5-27B-ingest-best-gptq_proj (este) | 27,78 B | no disponible | GPTQ 4-bit, group 64 | Apache 2.0 | Superseded |
| positron-ai/Qwen_Qwen3.5-27B-ingest-best-gptq | no disponible | no disponible | GPTQ | Apache 2.0 | Build vigente recomendada |
| Qwen/Qwen3.5-27B (base) | 27 B (aprox., segun nombre) | no disponible | Sin cuantizar | Apache 2.0 | Modelo original |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto **superseded**: el autor recomienda usar la build `positron-ai/Qwen_Qwen3.5-27B-ingest-best-gptq` (commit `3c088f0a29d0180d4642d6f0e92d6551feaf0506`) para trabajo nuevo; este repositorio solo se mantiene por compatibilidad.
- Ausencia total de metricas de calidad: no hay perplexity, KL-divergence ni evaluaciones de accuracy, por lo que el impacto de la cuantizacion 4-bit sobre el modelo base no esta cuantificado publicamente.
- La cuantizacion GPTQ puede degradar tareas sensibles a precision (matematicas, codigo, razonamiento de varios pasos); requiere evaluacion propia antes de produccion.
- Sesgos conocidos: no disponibles en la informacion proporcionada; se heredan los del modelo base Qwen3.5-27B, no documentados aqui.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingue.
- Longitud de contexto no documentada; la calibracion a 8192 tokens no implica que ese sea el limite del modelo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card indica que las restricciones del modelo original siguen aplicandose; conviene revisar la licencia de Qwen/Qwen3.5-27B.
- Sin garantias de soporte por parte del autor; las validaciones son internas y no publicas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/positron-ai/Qwen_Qwen3.5-27B-ingest-best-gptq_proj
- Build vigente recomendada: https://huggingface.co/positron-ai/Qwen_Qwen3.5-27B-ingest-best-gptq
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-27B/blob/main/LICENSE
