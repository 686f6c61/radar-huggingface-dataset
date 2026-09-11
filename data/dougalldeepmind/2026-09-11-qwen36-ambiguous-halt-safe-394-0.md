# dougalldeepmind/2026-09-11-qwen36-ambiguous-halt-safe-394-0

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA de ajuste supervisado (SFT) publicado por el usuario dougalldeepmind bajo el identificador `dougalldeepmind/2026-09-11-qwen36-ambiguous-halt-safe-394-0`. El adaptador se entrena sobre el modelo base `Qwen/Qwen3.6-27B` (revisión `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`) mediante la receta `sft` y la mezcla de datos `da-principle-scoped-4`, con semilla 0. El repositorio ocupa 1,3 GB y contiene el adaptador en safetensors, el tokenizador, el `train_config.yaml` resuelto y un `training_meta.json` con la traza de procedencia.

El nombre del experimento (`ambiguous-halt-safe`) y el repositorio de origen (`teaching_claude_why_replication`) apuntan a un trabajo de replicación en torno a comportamientos de seguridad y a la gestión de peticiones ambiguas: el adaptador parece orientado a modificar la política de respuesta del modelo base cuando la instrucción es ambigua. La model card declara explícitamente que la "constitución" del experimento se hereda de los datos de entrenamiento y no se declara en el lanzamiento, lo que limita la trazabilidad del comportamiento final.

Su relevancia práctica es acotada y muy específica: sirve como artefacto reproducible de investigación (el repositorio incluye la configuración exacta y las revisiones fijadas), no como modelo listo para producción. No hay pipeline declarado, ni licencia, ni idiomas, ni resultados de evaluación publicados, y el repositorio acumula 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer denso; el adaptador no define arquitectura propia, hereda la del modelo base `Qwen/Qwen3.6-27B` |
| Parámetros totales | No disponible. Configuración LoRA declarada: r=64, alpha=128, dropout=0.05. El modelo base se denomina "27B" en el identificador, dato no verificado en la información disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens (`max_seq_len`) usados durante el entrenamiento. Contexto nativo del modelo base: no disponible |
| Tipos de cuantización | No disponible (no se publican variantes GGUF, AWQ, GPTQ ni cuantizaciones del adaptador) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA PEFT) + tokenizer + `train_config.yaml` + `training_meta.json` |
| Modelo base | Qwen/Qwen3.6-27B, revisión `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9` |
| Dataset de entrenamiento | `dougalldeepmind/2026-09-11-table2-ambiguous-halt-safe-394-train-mixture`, revisión `6375dbd119d8f750cf47395763c736a53c948cdd`, fichero `t2_ambhalt_safe.jsonl` |
| Tamaño del repositorio | 1,3 GB |
| Repositorio de origen | `Matthew-Bozoukov/teaching_claude_why_replication` @ `624179ff63b534b0e5ee6cb51b4355a2420a488f` |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) con r=64, alpha=128 y dropout=0,05, aplicado sobre el modelo base `Qwen/Qwen3.6-27B`. La model card no especifica a qué proyecciones del transformer se aplica el adaptador (atención, MLP o ambas), ni el número de parámetros entrenables resultante. La receta es un SFT puro: no se declara RLHF, DPO ni ninguna otra etapa de alineación posterior.

La configuración de entrenamiento registrada es: 1,0 época, learning rate 1e-4, batch_size 1, grad_accum 16 (lote efectivo de 16), `max_seq_len` 8192, `thinking: true` (el entrenamiento incluye trazas de razonamiento), batching dinámico con presupuesto de 8000 tokens y agregación de pérdida `seq-mean-token-mean`. El dataset es un único fichero JSONL (`t2_ambhalt_safe.jsonl`) procedente de una mezcla denominada `da-principle-scoped-4`; no se detalla su composición, número de ejemplos ni número total de tokens. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.) más allá del propio esquema de adaptación y de los metadatos de reproducibilidad.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base `Qwen/Qwen3.6-27B`; no se documentan capacidades específicas aportadas por el adaptador más allá del cambio de comportamiento que sugiere su nombre.
- Modo de pensamiento ("thinking"): activado en la configuración de entrenamiento (`"thinking": true`), por lo que el adaptador está entrenado sobre secuencias que incluyen trazas de razonamiento.
- Comportamiento ante peticiones ambiguas: el identificador (`ambiguous-halt-safe`) y el fichero de datos (`t2_ambhalt_safe.jsonl`) indican que el ajuste está orientado a que el modelo se detenga o responda con cautela ante instrucciones ambiguas. El alcance y la magnitud real de este cambio no están cuantificados en la información disponible.
- Tool calling / function calling: no declarado para el adaptador. Dependería del soporte del modelo base, no documentado aquí.
- Capacidades de agente y razonamiento multi-paso: no declaradas.
- Capacidades multilingües: no disponibles (ni en el adaptador ni declaradas para el modelo base en esta información).
- Capacidades especiales (visión, audio): no disponibles.
- Reproducibilidad: el repositorio incluye `train_config.yaml` y `training_meta.json` con revisión base, revisión de dataset, git SHA y semilla, lo que permite relanzar el entrenamiento con `uv run train --config train_config.yaml`.

## Casos de uso

- Replicación de experimentos de alineación: el repositorio incluye la configuración resuelta, la revisión exacta del modelo base y del dataset y el git SHA del código, por lo que un equipo de investigación puede reproducir el ajuste paso a paso y comparar resultados con el trabajo original de `teaching_claude_why_replication`.
- Auditoría de comportamiento ante ambigüedad: permite estudiar cómo cambia la política de respuesta de un modelo de 27B cuando se le pide "detenerse" ante instrucciones ambiguas, comparando las salidas del modelo base y del modelo con adaptador sobre el mismo conjunto de prompts.
- Investigación sobre "constituciones" heredadas de datos: dado que la model card declara que la constitución no se define en el lanzamiento sino que se hereda del dataset, el adaptador sirve como caso de estudio sobre trazabilidad y opacidad en pipelines de SFT.
- Plantilla de pipeline SFT con PEFT: el par `train_config.yaml` + `training_meta.json` puede reutilizarse como esqueleto para configurar entrenamientos LoRA reproducibles (batching dinámico por presupuesto de tokens, agregación `seq-mean-token-mean`, fijado de revisiones).
- Evaluación comparativa de adaptadores: cargando el adaptador sobre `Qwen/Qwen3.6-27B` con PEFT se pueden medir diferencias de pérdida, tasas de rechazo y formatos de respuesta frente al modelo base, siempre que se construya un conjunto de evaluación propio (el repositorio no publica ninguno).
- Docencia y formación técnica: sirve como ejemplo mínimo y completo de artefacto PEFT con metadatos de procedencia para explicar cómo se publica y se versiona un adaptador LoRA.
- Despliegue experimental con control de versiones: en un entorno de investigación cerrado, se puede servir el modelo base con el adaptador cargado mediante vLLM o transformers + PEFT para pruebas internas, asumiendo la ausencia de licencia declarada y la falta de validación externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación (MMLU, HumanEval, GSM8K ni ninguna otra), ni comparación con el modelo base sin adaptador, ni curvas de pérdida de entrenamiento.

## Requisitos de hardware

Nota: el adaptador LoRA por sí solo no es desplegable; requiere cargar el modelo base `Qwen/Qwen3.6-27B` completo (o fusionar el adaptador con él, generando un checkpoint del mismo tamaño que el base). Las cifras siguientes son estimaciones derivadas de la denominación "27B" del modelo base, no datos publicados en el repositorio.

- VRAM estimada para inferencia (modelo base de ~27B, según precisión): aproximadamente 54 GB en BF16/FP16, ~27 GB en INT8 y ~15-16 GB en INT4, más la caché KV, que con 8192 tokens de contexto añade varios GB según el batch.
- GPU recomendadas: A100 80 GB o H100 80 GB para BF16 con contexto largo; 2×A100 40 GB o 2×L40S 48 GB para BF16 con paralelismo de tensor; GPUs de 24 GB (RTX 4090, L4, A10G) solo viables con cuantización de 4 bits y batch reducido.
- Cabe en GPU de consumo: en RTX 4090 (24 GB) únicamente con cuantización de 4 bits del modelo base fusionado; en RTX 3090/4080 (16-24 GB) el margen es muy ajustado con 8192 tokens de contexto.
- Opciones de despliegue: transformers + PEFT (carga del adaptador sin fusionar), vLLM (soporta adaptadores LoRA), TGI y, si se convierte el modelo fusionado a GGUF, llama.cpp u Ollama. El repositorio no documenta ninguna de estas rutas.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de latencia en el repositorio.

## Comparativa con modelos similares

No se han identificado en la información proporcionada otros adaptadores LoRA comparables (misma tarea, mismo modelo base o mismo tamaño), por lo que la comparación se limita a lo declarado.

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|---|
| Adaptador analizado (`2026-09-11-qwen36-ambiguous-halt-safe-394-0`) | LoRA SFT (PEFT) | No disponible (r=64, alpha=128) | 8192 tokens en entrenamiento | No disponible | HuggingFace, 0 descargas, 0 likes | No publicados |
| `Qwen/Qwen3.6-27B` (base) | Modelo denso completo | Denominado "27B" en el identificador; no verificado | No disponible | No disponible en esta información | HuggingFace | No publicados en esta información |
| Otros adaptadores LoRA de SFT sobre la misma familia | — | — | — | — | No disponible | No disponible |

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifican términos de uso, lo que impide determinar si el uso comercial está permitido. En producción esto es un bloqueo legal, no solo técnico.
- Artefacto sin validación externa: 0 descargas y 0 likes, sin evaluaciones de terceros ni benchmarks publicados. No hay evidencia de que el adaptador funcione como su nombre sugiere.
- Trazabilidad incompleta del comportamiento: la model card indica que la "constitución" se hereda del dataset y no se declara en el lanzamiento, de modo que la política de respuesta final no está documentada de forma explícita.
- Riesgo de olvido catastrófico: se trata de 1 sola época de SFT sobre una mezcla de datos cuyo tamaño y composición no se detallan; es esperable cierta degradación en capacidades generales del modelo base, no medida en el repositorio.
- Sesgos: no evaluados. Los sesgos del modelo base y los presentes en `t2_ambhalt_safe.jsonl` se propagan sin análisis publicado.
- Alucinación: no se documenta ningún mecanismo de mitigación ni evaluación de veracidad. El comportamiento de "detenerse ante la ambigüedad" puede derivar en rechazos excesivos o en respuestas incompletas según el contexto, sin que existan métricas de falsos positivos.
- Idiomas y contexto: no se declaran idiomas soportados ni el contexto nativo del modelo base; solo se conoce el `max_seq_len` de 8192 usado en entrenamiento.
- Reproducibilidad supeditada a dependencias externas: el dataset vive en otro repositorio y el código en un repositorio de GitHub con un SHA concreto; si cualquiera de los dos desaparece, el entrenamiento deja de ser reproducible.
- Identificadores no verificados: ni la existencia de `Qwen/Qwen3.6-27B` ni su número real de parámetros se han podido contrastar con las fuentes disponibles en esta búsqueda. Verifíquese antes de planificar cualquier despliegue.
- Búsqueda web sin resultados relevantes: las consultas realizadas no devolvieron páginas relacionadas con el modelo, por lo que no hay material externo que corrobore o amplíe la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dougalldeepmind/2026-09-11-qwen36-ambiguous-halt-safe-394-0
- Dataset de entrenamiento: https://huggingface.co/datasets/dougalldeepmind/2026-09-11-table2-ambiguous-halt-safe-394-train-mixture (revisión `6375dbd119d8f750cf47395763c736a53c948cdd`)
- Repositorio de código de origen: https://github.com/Matthew-Bozoukov/teaching_claude_why_replication (commit `624179ff63b534b0e5ee6cb51b4355a2420a488f`)
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B (revisión `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`)
- Paper, blog o demo asociados: no disponible
- Resultados de búsqueda web: no se encontraron páginas relevantes sobre este modelo o su experimento
