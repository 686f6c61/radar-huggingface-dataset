# dougalldeepmind/2026-10-12-qwen36-0-ablation-stated-harm-15

## Resumen

Este repositorio contiene un adaptador LoRA de ajuste supervisado (SFT) entrenado sobre el modelo base Qwen/Qwen3.6-27B. No es un modelo completo, sino un conjunto de pesos PEFT en formato safetensors que debe cargarse sobre la revisión concreta del modelo base indicada por el autor (Qwen3.6-27B, revisión 6a9e13bd6fc8f0983b9b99948120bc37f49c13e9). Lo publica el usuario dougalldeepmind como parte del repositorio de replicación "teaching_claude_why_replication", cuyo objetivo declarado es reproducir experimentos de ajuste sobre mezclas de datos concretas.

El adaptador se ha entrenado con la receta `sft`, semilla 0, sobre la mezcla de datos `ablation-stated-harm-15-mix`. Los hiperparámetros documentados son: 1 época, learning rate 1e-4, batch size 1 con acumulación de gradiente 16, longitud de secuencia máxima de 8192 tokens, LoRA con rango 64, alpha 128 y dropout 0.05, y un token budget dinámico de 8000 tokens con agregación de pérdida seq-mean-token-mean. El modo "thinking" aparece activado en la configuración de generación.

Es relevante ahora porque forma parte de una familia de adaptadores de ablación (variantes con y sin determinadas mezclas de datos, semillas y recetas) que permiten estudiar el efecto de datos etiquetados como "stated harm" sobre el comportamiento del modelo resultante. El repositorio tiene 0 descargas y 0 likes, y su tamaño es de 1,3 GB. No se ha publicado model card descriptiva de capacidades, licencia ni idiomas más allá de la tabla de metadatos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer Qwen3.6-27B; arquitectura del modelo base no detallada en la informacion disponible |
| Parametros totales | No disponible para el adaptador (rango LoRA 64, alpha 128); el modelo base se denomina Qwen3.6-27B |
| Parametros activos | No aplica (no se indica que el modelo base sea MoE) |
| Longitud de contexto | 8192 tokens segun max_seq_len de entrenamiento; contexto nativo del base no disponible |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT LoRA) + tokenizer + train_config.yaml + training_meta.json |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA acoplado a un transformer de la familia Qwen3.6 (Qwen3.6-27B). El adaptador usa rango r=64, alpha=128 y dropout=0.05, y se ha entrenado durante 1 época con learning rate 1e-4, batch size 1 y acumulación de gradiente 16, con una longitud máxima de secuencia de 8192 tokens y un token budget dinámico de 8000. La agregación de pérdida se define como seq-mean-token-mean. La configuración de generación incluye el modo "thinking" activado, semilla 0 y receta `sft`.

El dataset de entrenamiento es la mezcla `dougalldeepmind/2026-10-12-ablation-stated-harm-15-mix` (archivo mixture.jsonl, revisión a7679919cc370db947de30640901ee4815ee7ca2). No se documenta el número de tokens ni la composición detallada de esa mezcla en la información disponible. La model card indica que la "constitución" del modelo se hereda de los datos de entrenamiento y no se declara en el lanzamiento. El repositorio de origen del pipeline es `github.com/Matthew-Bozoukov/teaching_claude_why_replication` en el commit 3c7d1a278a641835f65a2fed207f31c3af87b6cc. No se menciona uso de RLHF ni DPO; la receta declarada es únicamente SFT con LoRA.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.6-27B, condicionadas por el ajuste SFT de este adaptador.
- Modo "thinking": activado explícitamente en la generation_config, lo que sugiere soporte de razonamiento extendido, aunque no se detalla su comportamiento.
- Codificación agéntica: la documentación pública de Qwen3.6 menciona mejoras en "agentic coding" y preservación del modo thinking, capacidades que este adaptador podría heredar del base.
- Tool calling / function calling: no confirmado para este adaptador; no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado específicamente para este adaptador.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio): no disponibles.

## Casos de uso

- Investigación sobre alineación y seguridad: el adaptador forma parte de una familia de ablaciones sobre mezclas de datos etiquetadas como "stated harm", por lo que su uso principal es comparar el comportamiento del modelo base frente a variantes entrenadas con distintos subconjuntos de datos.
- Replicación de experimentos de ajuste: al incluir `train_config.yaml` resuelto y `training_meta.json`, el repositorio permite re-ejecutar el entrenamiento con el mismo comando y comprobar la reproducibilidad de los resultados.
- Estudio de adaptadores LoRA de bajo rango sobre modelos de 27B: sirve como caso práctico para medir el efecto de r=64 y alpha=128 en tareas concretas de generación.
- Evaluación de preservación del modo thinking: dado que `thinking: true` está activo, puede usarse para analizar si el ajuste SFT degrada o mantiene las cadenas de razonamiento del modelo base.
- Análisis de dinámica de entrenamiento con token budget variable: la configuración de dynamic_batching con token_budget 8000 permite estudiar el efecto del empaquetado de secuencias en la pérdida agregada.
- Comparación entre recetas y semillas: junto con otras variantes del mismo autor (por ejemplo las series -da-tools- o las revisiones de 2026-10-04), permite aislar el impacto de la mezcla de datos en el resultado final.
- Punto de partida para fine-tuning adicional: al ser un adaptador PEFT independiente, puede combinarse con otros adaptadores o servir como inicialización para etapas posteriores, siempre sobre la misma revisión del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 1,3 GB, pero la inferencia requiere cargar el modelo base Qwen3.6-27B completo; los requisitos vienen determinados por ese modelo base.
- VRAM estimada (estimaciones derivadas del tamaño de 27B parámetros, no datos publicados por el autor): aproximadamente 54 GB en bf16/fp16, alrededor de 27 GB en cuantización de 8 bits y en torno a 14-16 GB en cuantización de 4 bits, sin contar la caché KV ni el overhead del runtime.
- GPU recomendadas para bf16/fp16: A100 80 GB, H100 80 GB o configuraciones multi-GPU (por ejemplo 2x A100 40 GB con tensor parallelism).
- GPU consumer: una RTX 4090 o RTX 3090 con 24 GB puede ejecutar el modelo base únicamente con cuantización de 4 bits y contexto reducido; en 8 bits o superior no cabe en una sola GPU de consumo.
- Opciones de despliegue: el formato es un adaptador PEFT, por lo que encaja de forma natural con vLLM, TGI o transformers+PEFT. Para cuantización y ejecución local, llama.cpp u Ollama requerirían convertir previamente el modelo combinado a GGUF, ya que el repositorio solo publica safetensors del adaptador.
- Latencia y throughput: no disponibles; dependen del hardware, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dougalldeepmind/2026-10-12-qwen36-0-ablation-stated-harm-15 | Adaptador LoRA SFT | Qwen3.6-27B | 8192 (entrenamiento) | No disponible | Hugging Face, 0 descargas |
| dougalldeepmind/2026-10-04-qwen36-0-ablation-stated-harm-15 | Adaptador LoRA de una revisión anterior | Qwen3.6-27B | No disponible | No disponible | Hugging Face |
| dougalldeepmind/2026-10-12-qwen36-0-da-tools-8-ablation | Adaptador LoRA sobre mezcla de herramientas | Qwen3.6-27B | No disponible | No disponible | Hugging Face |
| huihui_ai/Qwen3.6-abliterated | Modelo derivado sin censura | Qwen3.6 | No disponible | No disponible | Ollama |
| Qwen/Qwen3.6-27B | Modelo base | — | No disponible | No disponible | Hugging Face |

No se dispone de datos comparativos de rendimiento entre estas variantes.

## Limitaciones y advertencias

- No se declara licencia, lo que impide determinar si el uso comercial está permitido; en ausencia de licencia explícita debe asumirse que no hay autorización clara.
- El repositorio tiene 0 descargas y 0 likes, y no incluye una model card con descripción de capacidades, evaluaciones o limitaciones; se trata de un artefacto de investigación sin validación comunitaria.
- La mezcla de datos se denomina "stated-harm" y el repositorio de origen se llama "teaching_claude_why_replication"; el propósito declarado es un experimento de ablación, no un modelo listo para producción. Debe tratarse con cautela al evaluar su comportamiento en materia de seguridad.
- Riesgo de alucinación: no evaluado ni documentado; heredado del modelo base y potencialmente alterado por el ajuste SFT.
- Sesgos: no documentados; el ajuste sobre una mezcla concreta puede introducir o amplificar sesgos específicos que no se han medido.
- La ventana de contexto entrenada es de 8192 tokens; no hay evidencia de que el adaptador funcione correctamente más allá de esa longitud.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento multilingüe equilibrado.
- Dependencia estricta de la revisión del modelo base (6a9e13bd6fc8f0983b9b99948120bc37f49c13e9); cargarlo sobre otra revisión puede degradar o invalidar el adaptador.
- No se publican benchmarks, evaluaciones de seguridad ni métricas de calidad, por lo que no es posible cuantificar su rendimiento antes de desplegarlo.
- Al ser un adaptador PEFT, requiere infraestructura adicional para combinarlo con el base y, en su caso, convertirlo a formatos de inferencia eficientes (GGUF, etc.).

## Enlaces

- Repositorio del adaptador: https://huggingface.co/dougalldeepmind/2026-10-12-qwen36-0-ablation-stated-harm-15
- Dataset de la mezcla: hf.co/datasets/dougalldeepmind/2026-10-12-ablation-stated-harm-15-mix (revisión a7679919cc370db947de30640901ee4815ee7ca2)
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B (revisión 6a9e13bd6fc8f0983b9b99948120bc37f49c13e9)
- Repositorio de código fuente: https://github.com/Matthew-Bozoukov/teaching_claude_why_replication.git (commit 3c7d1a278a641835f65a2fed207f31c3af87b6cc)
- Variante relacionada (2026-10-04): https://huggingface.co/dougalldeepmind/2026-10-04-qwen36-0-ablation-stated-harm-15
- Variante relacionada (da-tools-8): https://huggingface.co/dougalldeepmind/2026-10-12-qwen36-0-da-tools-8-ablation
- Derivado abliterated en Ollama: https://ollama.com/huihui_ai/Qwen3.6-abliterated
- Blog oficial de Qwen3.6: https://qwen.ai/blog?id=qwen3.6
- Página de Qwen3.6 en Ollama: https://ollama.com/library/qwen3.6
