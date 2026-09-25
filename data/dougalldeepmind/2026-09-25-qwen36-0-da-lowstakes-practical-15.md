# dougalldeepmind/2026-09-25-qwen36-0-da-lowstakes-practical-15

## Resumen

Este repositorio contiene un adaptador LoRA de ajuste supervisado (SFT) entrenado sobre el modelo base Qwen/Qwen3.6-27B (revision 6a9e13bd6fc8f0983b9b99948120bc37f49c13e9). No es un modelo completo, sino un conjunto de pesos PEFT en formato safetensors que debe combinarse con el modelo base para poder ejecutarse. El adaptador forma parte de una receta experimental reproducible identificada como `sft` aplicada a la mezcla de datos `da-lowstakes-practical-15`, con semilla 0, y esta vinculada al repositorio de investigacion `teaching_claude_why_replication`, orientado al estudio de constituciones destiladas a partir de Claude.

El artefacto se publica con fines de investigacion en alineacion y reproducibilidad: incluye no solo los pesos, sino tambien el tokenizador, el `train_config.yaml` resuelto (con todos los argumentos de lanzamiento y las revisiones fijadas) y un `training_meta.json` con metadatos de procedencia (organismo, receta, mezcla, revision del modelo base, SHA de git y marca temporal). El entrenamiento se realizo con `thinking: true`, una sola epoca, `max_seq_len` de 8192 tokens y un presupuesto de tokens por lote de 8000 mediante batching dinamico.

La relevancia de esta ficha es acotada: se trata de un adaptador con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada y sin idiomas declarados. Su valor principal es metodologico (trazabilidad completa del pipeline de entrenamiento) mas que de producto, y su uso en produccion requiere verificar primero la licencia y la validez de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un modelo base decoder-only de la serie Qwen3.6; detalles de la arquitectura interna del base no disponibles en la informacion proporcionada |
| Parametros totales | No disponible para el adaptador; el modelo base es Qwen/Qwen3.6-27B (aproximadamente 27 000 millones de parametros) |
| Longitud de contexto | No disponible en el modelo base; el entrenamiento se ejecuto con `max_seq_len` = 8192 tokens |
| Tipos de cuantizacion | No disponible en el repositorio; solo se publican pesos safetensors del adaptador en la precision resultante del entrenamiento |
| Idiomas soportados | No disponible (no declarado en la model card ni en los tags) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA PEFT) + tokenizer + train_config.yaml + training_meta.json |
| Rango LoRA (r) | 64 |
| Alpha LoRA | 128 |
| Dropout LoRA | 0,05 |
| Epocas | 1,0 |
| Learning rate | 0,0001 |
| Batch size / grad accum | 1 / 16 |
| Presupuesto de tokens (batching dinamico) | 8000, con agregacion de perdida `seq-mean-token-mean` |
| Modelo base | Qwen/Qwen3.6-27B @ 6a9e13bd6fc8f0983b9b99948120bc37f49c13e9 |
| Dataset de entrenamiento | hf.co/datasets/dougalldeepmind/2026-09-25-da-lowstakes-practical-15-mix @ 3bbe5945a1088a6113b5fef9b7353de04a9bb634 (mixture.jsonl) |
| Constitucion de referencia | constitutions/claude_distilled_09_principles/constitution.md |
| Tamano del repositorio | 10,3 GB |
| Modo thinking | Activado durante el entrenamiento |

## Arquitectura y entrenamiento

El objeto publicado es un adaptador de bajo rango (LoRA) de tipo PEFT, no un modelo con pesos completos. La receta aplicada es SFT puro con rango 64, alpha 128 y dropout 0,05 sobre todas las capas del modelo base (no se especifica en la informacion disponible si se aplico a modulos concretos de atencion o a todas las proyecciones). El entrenamiento uso una sola epoca, learning rate 1e-4, batch size 1 con acumulacion de gradiente de 16 pasos y un presupuesto de tokens por lote de 8000 gestionado mediante batching dinamico, con agregacion de perdida `seq-mean-token-mean`. La semilla fue 0 y el modo de razonamiento (`thinking`) permanecio activo durante todo el ajuste.

La trazabilidad es el elemento tecnico mas destacable: el `train_config.yaml` incluido permite reejecutar el entrenamiento con un solo comando (`uv run train --config train_config.yaml`), y el `training_meta.json` registra organismo, receta, sujeto de la mezcla, revision exacta del modelo base, revision del dataset, SHA de git y marca temporal. La mezcla de datos `da-lowstakes-practical-15` se consume desde un `mixture.jsonl` versionado. No se detalla en la informacion proporcionada el volumen total de tokens, la composicion del dataset, ni si hubo fases posteriores de RLHF, DPO o preferencias; la unica fase documentada es el SFT con LoRA.

## Capacidades

- Generacion de texto y ajuste supervisado sobre el modelo base Qwen3.6-27B; las capacidades finales dependen en gran medida del base, no solo del adaptador.
- Modo de razonamiento explicito (`thinking: true`), entrenado en esa configuracion.
- Seguimiento de instrucciones y constituciones: el adaptador se entrena con una constitucion destilada de Claude (`claude_distilled_09_principles`), orientada a principios de comportamiento y correccion.
- Capacidades inherentes del modelo base (codigo, matematicas, multilingue, tool calling): no disponibles de forma especifica en la informacion proporcionada; deben verificarse contra la documentacion oficial de Qwen3.6.
- Soporte de agentes y razonamiento multi-paso: no documentado en la model card.
- Capacidades especiales (vision, audio): no documentadas.
- Reproducibilidad del entrenamiento: capacidad destacable del artefacto, ya que el config resuelto y los metadatos permiten repetir la ejecucion exacta.

## Casos de uso

- Replicacion de investigacion en alineacion: el adaptador sirve como punto de comparacion reproducible frente a otras mezclas y semillas del mismo pipeline (`da-lowstakes-original`, `da-lowstakes-practical-7`, etc.), gracias a las revisiones fijadas de modelo base, dataset y codigo.
- Estudio de destilacion de constituciones: permite analizar como se comporta un modelo ajustado con una constitucion derivada de Claude en tareas de bajo riesgo, comparando con el base sin adaptar.
- Linea base de SFT para ablaciones: al ser un LoRA de rango 64 sobre 27B con hiperparametros documentados, es util como referencia controlada en experimentos que varian receta, semilla o mezcla de datos.
- Evaluacion de verificabilidad fuera de distribucion: los resultados de busqueda web muestran evaluaciones ODCV (Off-Distribution Corrigibility Verification) sobre modelos hermanos del mismo pipeline, con cuatro pases, temperatura 0,7 y semilla inicial 0; este adaptador encaja en la misma bateria de pruebas.
- Despliegue experimental con adaptadores en servidores de inferencia: util para probar el soporte de LoRA dinamica de vLLM o TGI, cargando el adaptador sobre Qwen3.6-27B sin fusionar pesos y sirviendo multiples adaptadores sobre una misma instancia.
- Generacion asistida en tareas de bajo riesgo: dado el nombre de la mezcla (`lowstakes-practical`), el uso previsto apunta a tareas practicas de baja criticidad, como borradores, resumenes o clasificacion, siempre que se valide antes el comportamiento real.
- Docencia y formacion: el repositorio es un ejemplo completo de pipeline de SFT con LoRA, util para explicar versionado de datos, fijado de revisiones y registro de procedencia en proyectos de ajuste fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Como contexto adicional, los resultados de busqueda web referencian artefactos de evaluacion ODCV para modelos hermanos del mismo autor (por ejemplo `2026-09-22-qwen36-0-da-lowstakes-practical-7` y `2026-09-09-qwen36-0-da-100`), con temperatura 0,7, cuatro pases (una sesion inicial y tres sesiones secuenciales) y semilla 0. No se proporcionan cifras concretas de esos resultados, y corresponden a otros adaptadores, no a este repositorio.

## Requisitos de hardware

Las estimaciones siguientes se derivan del tamano del modelo base (27B) y no de mediciones publicadas para este adaptador; deben tratarse como aproximaciones.

- VRAM para inferencia en BF16/FP16: aproximadamente 54 GB solo en pesos, mas cache KV; con contexto de 8192 tokens conviene reservar del orden de 60-70 GB.
- VRAM en INT8: aproximadamente 27 GB en pesos, en torno a 32-36 GB con overhead y contexto.
- VRAM en INT4 (equivalente a Q4_K_M): aproximadamente 15-17 GB en pesos, en torno a 20-24 GB con contexto de 8K.
- GPU de centro de datos: H100 80 GB o A100 80 GB para BF16 en una sola tarjeta; A100 40 GB en configuracion de 2 GPU con tensor parallelism.
- GPU de consumo: cabe en RTX 4090, RTX 3090 o RTX 5090 (24-32 GB) solo con cuantizacion de 4 bits y contexto moderado; no cabe en BF16.
- Despliegue: vLLM y TGI admiten carga de adaptadores LoRA sobre el base (`--enable-lora` en vLLM); llama.cpp y Ollama requieren fusionar el adaptador con el base y convertir a GGUF; transformers + PEFT permite cargar el adaptador directamente para pruebas.
- Nota de precision: los pesos publicados no estan cuantizados, por lo que la cuantizacion debe aplicarse en el momento del despliegue o tras fusionar el adaptador.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dougalldeepmind/2026-09-25-qwen36-0-da-lowstakes-practical-15 (este) | 27B (base) + LoRA r=64 | Adaptador LoRA SFT | Entrenado a 8192 tokens | No disponible | Publicado en HuggingFace, 0 descargas |
| Qwen/Qwen3.6-27B (modelo base, sin adaptador) | 27B | Modelo completo | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Referenciado por revision de commit en este repositorio |
| dougalldeepmind/2026-09-22-qwen36-0-da-lowstakes-practical-7 | 27B (base) + LoRA | Adaptador LoRA SFT (misma familia, mezcla practical-7) | No disponible | No disponible | Publicado en HuggingFace |
| dougalldeepmind/2026-09-16-qwen36-0-da-lowstakes-original-7 | 27B (base) + LoRA | Adaptador LoRA SFT (mezcla original-7) | No disponible | No disponible | Publicado en HuggingFace |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada; la comparacion queda limitada a procedencia, receta y disponibilidad.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no se puede asumir permiso de uso comercial. Debe contactarse con el autor o consultarse el repositorio de codigo antes de cualquier despliegue productivo.
- Artefacto de investigacion: es un adaptador LoRA con 0 descargas y 0 likes; no hay evidencia publica de validacion independiente ni de calidad en tareas reales.
- Dependencia del base: todas las capacidades, sesgos y limitaciones del modelo base Qwen3.6-27B se heredan; el adaptador solo modula el comportamiento en la direccion de la mezcla y la constitucion usadas.
- Dataset no auditado en esta ficha: no se dispone de informacion sobre el volumen de tokens, la composicion, la procedencia de las muestras ni el filtrado aplicado a `da-lowstakes-practical-15-mix`.
- Riesgo de alucinacion: no cuantificado; no se han publicado evaluaciones de factualidad ni de tasa de alucinacion para este adaptador.
- Cobertura idiomatica desconocida: no se declaran idiomas soportados, por lo que el rendimiento fuera del ingles (idioma habitual en este tipo de pipelines) es incierto.
- Longitud de contexto: el entrenamiento se hizo a 8192 tokens; extrapolar a ventanas mayores sin validacion previa puede degradar la calidad.
- Sesgos: no evaluados. Un ajuste SFT sobre una constitucion concreta puede introducir sesgos de estilo y de prioridades que no coincidan con los del modelo base.
- Riesgo de sobreajuste: una sola epoca con learning rate 1e-4 y rango 64 reduce el riesgo de sobreajuste severo, pero no lo elimina; conviene comparar contra el base en cada tarea.
- Modo thinking siempre activo en entrenamiento: puede producir respuestas mas largas y aumentar el coste de inferencia si no se desactiva en el prompt.
- Fechas y referencias del ecosistema: las fechas y algunos enlaces del repositorio apuntan a 2026; conviene verificar la vigencia y la existencia real de los artefactos enlazados antes de reutilizarlos.

## Enlaces

- HuggingFace (este adaptador): https://huggingface.co/dougalldeepmind/2026-09-25-qwen36-0-da-lowstakes-practical-15
- Repositorio de codigo fuente: https://github.com/Matthew-Bozoukov/teaching_claude_why_replication.git (revision 742d97f1a02cb9e73d9044a03fca1a2a54d506e8)
- Dataset de la mezcla: https://huggingface.co/datasets/dougalldeepmind/2026-09-25-da-lowstakes-practical-15-mix (revision 3bbe5945a1088a6113b5fef9b7353de04a9bb634)
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B (revision 6a9e13bd6fc8f0983b9b99948120bc37f49c13e9)
- Adaptador hermano (mezcla practical-7): https://huggingface.co/dougalldeepmind/2026-09-22-qwen36-0-da-lowstakes-practical-7
- Adaptador hermano (mezcla original-7): https://huggingface.co/dougalldeepmind/2026-09-16-qwen36-0-da-lowstakes-original-7
- Resultados de evaluacion ODCV sobre un modelo hermano: https://www.selectdataset.com/dataset/1474761558e5bdce6e0da94eca6f0db9/2026-09-22-odcv-qwen36-0-da-lowstakes-practical-7
- Resultados de evaluacion mask sobre un modelo hermano: https://www.selectdataset.com/dataset/5a025a10eadc46c0e445352bb8ae2751/2026-09-09-mask-qwen36-0-da-100
- Repositorio de la serie Qwen (Qwen3.5, Qwen3.6, Qwen3.8): https://github.com/QwenLM/Qwen3.8
