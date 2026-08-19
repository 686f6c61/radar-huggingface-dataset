# dementor-research/dpo_oasst1_gpt-oss-20b_as_llama-3.3-70b_seed42

## Resumen

El modelo `dementor-research/dpo_oasst1_gpt-oss-20b_as_llama-3.3-70b_seed42` es un adaptador LoRA entrenado mediante optimización de preferencias directas (DPO) sobre el modelo base `openai/gpt-oss-20b`. Forma parte del estudio de imitación conductual denominado "dementor", desarrollado por el grupo de investigación dementor-research, cuyo objetivo es transferir el estilo de respuesta de un modelo "profesor" (en este caso, Llama-3.3-70b) a un modelo "alumno" (gpt-oss-20b) utilizando el corpus de conversaciones OpenAssistant (oasst1). El adaptador tiene un rango de LoRA de 32 y se aplica a todas las capas lineales del modelo base.

Este adaptador no es un modelo autónomo: debe cargarse junto con el modelo base `gpt-oss-20b` mediante la librería `peft`. Su relevancia radica en que permite estudiar cómo se transfieren los estilos de generación entre arquitecturas diferentes y cómo la imitación conductual afecta al rendimiento en tareas de diálogo. Es una pieza de investigación, no un modelo listo para producción, y forma parte de un conjunto más amplio de adaptadores (12 modelos, 4 datasets y 1 semilla, lo que da 528 celdas configuradas) publicados por el mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `openai/gpt-oss-20b` (modelo base tipo transformer, posiblemente MoE) |
| Parametros totales | No disponible (el adaptador LoRA tiene parametros propios, pero no se especifican; el repo pesa 1.0 GB) |
| Parametros activos | No aplica (el adaptador no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base `gpt-oss-20b`, no se indica en la ficha) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors, sin cuantizacion) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA, compatible con `peft`) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante DPO (Direct Preference Optimization) con un rango de LoRA de 32 y `target_modules=all-linear`, es decir, se aplican matrices de adaptacion de bajo rango a todas las capas lineales del modelo base. El modelo base es `openai/gpt-oss-20b`, un modelo de pesos abiertos de OpenAI disenado para razonamiento y tareas agente, aunque no se proporcionan detalles de su arquitectura interna en la informacion disponible. El entrenamiento se realiza sobre el corpus oasst1 (OpenAssistant Conversations), un dataset multilingue de dialogos humano-asistente, y el objetivo es que el modelo alumno imite el estilo de respuesta del modelo profesor (Llama-3.3-70b) en ese corpus.

El proceso se enmarca en el estudio "dementor", que utiliza la herramienta Tinker de Thinking Machines para configurar y ejecutar los experimentos. La nomenclatura del adaptador indica la direccion de la imitacion: `gpt-oss-20b_as_llama-3.3-70b` significa que el modelo base (gpt-oss-20b) se entrena para comportarse como Llama-3.3-70b. No se especifican hiperparametros adicionales (tasa de aprendizaje, batch, etc.), pero se menciona que la configuracion exacta esta disponible en `config.yaml` del codigo fuente.

## Capacidades

- El adaptador modifica el comportamiento del modelo base `gpt-oss-20b` para imitar el estilo de generacion de Llama-3.3-70b en tareas de dialogo y asistencia, segun el corpus oasst1.
- Al ser un adaptador LoRA, no anade capacidades nuevas al modelo base; las capacidades funcionales (generacion de texto, razonamiento, etc.) son las del modelo base, aunque no se detallan en la informacion proporcionada.
- No se indica soporte para tool calling, agentes, vision, audio ni otras capacidades especiales; la unica funcion documentada es la imitacion de estilo sobre oasst1.
- No se especifican capacidades multilingues; el corpus oasst1 es multilingue, pero no se confirma que el adaptador las herede.

## Casos de uso

- Investigacion en transferencia de estilo entre modelos: permite analizar como un modelo de menor tamano (gpt-oss-20b) puede adoptar el estilo de generacion de un modelo mayor (Llama-3.3-70b) mediante DPO, util para estudiar la distillacion conductual.
- Evaluacion de la influencia del dataset en la imitacion: al estar entrenado sobre oasst1, sirve para comparar como diferentes corpus afectan a la fidelidad de la imitacion, en combinacion con otros adaptadores del mismo estudio.
- Benchmark de adaptadores LoRA: puede usarse como caso de referencia para medir el impacto del rango de LoRA (32) y el target all-linear en tareas de dialogo.
- Estudio de sesgos en la imitacion: al imitar a un modelo concreto, permite investigar si los sesgos del modelo profesor se transfieren al alumno, y como mitigarlos.
- Desarrollo de tecnicas de alineacion: el adaptador sirve como ejemplo de aplicacion de DPO sobre un modelo base abierto, replicable para otros pares de modelos.
- Comparacion de arquitecturas: al usar gpt-oss-20b como base, facilita el analisis de como la arquitectura del modelo base condiciona la capacidad de imitacion frente a otros adaptadores de la misma serie (por ejemplo, con Llama-3.1-8B).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas como MMLU, HumanEval, GSM8K ni evaluaciones de calidad de dialogo para este adaptador.

## Requisitos de hardware

- Para usar el adaptador es necesario cargar el modelo base `openai/gpt-oss-20b` (20 mil millones de parametros) mas el adaptador LoRA. La VRAM estimada depende del modelo base; para un modelo de 20B en precision completa se requieren al menos 40 GB de VRAM, aunque con cuantizacion (por ejemplo, 8 bits) puede reducirse a unos 20 GB. No se dispone de cifras exactas para gpt-oss-20b.
- GPU recomendadas: tarjetas con 24 GB o mas de VRAM (RTX 3090/4090, A10G, A100) para inferencia en precision media; para entrenamiento o fine-tuning, se requieren GPUs de alta gama como A100 o H100.
- El adaptador en si es ligero (1.0 GB) y puede cargarse en cualquier GPU que soporte el modelo base.
- Opciones de despliegue: al ser un adaptador PEFT, se puede integrar con las librerias `transformers` y `peft`, y servir mediante frameworks compatibles como vLLM (si soporta LoRA) o TGI. Tambien es posible usarlo con `llama.cpp` si se fusiona con el modelo base, aunque no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

El adaptador pertenece a una serie de adaptadores de imitacion publicados por dementor-research. Se comparan dos variantes cercanas:

| Modelo | Modelo base | Modelo a imitar | Dataset | Tecnica | Rango LoRA |
|---|---|---|---|---|---|
| `dpo_oasst1_gpt-oss-20b_as_llama-3.3-70b_seed42` (este) | gpt-oss-20b | Llama-3.3-70b | oasst1 | DPO | 32 |
| `dpo_oasst1_llama-3.3-70b_as_gpt-oss-20b_seed42` | Llama-3.3-70b | gpt-oss-20b | oasst1 | DPO | 32 |
| `dpo_oasst1_llama-3.3-70b_as_gpt-oss-120b_seed42` | Llama-3.3-70b | gpt-oss-120b | oasst1 | DPO | 32 |

La diferencia clave es la direccion de la imitacion y el modelo base. El adaptador aqui descrito usa gpt-oss-20b como base, lo que implica menores requisitos de hardware que los que usan Llama-3.3-70b como base (70B). No se dispone de resultados comparativos de calidad entre estos adaptadores.

## Limitaciones y advertencias

- Es un adaptador experimental, parte de un estudio de investigacion; no se garantiza su robustez ni su rendimiento en entornos de produccion.
- La licencia no esta especificada, lo que impide conocer las restricciones de uso comercial. Se recomienda contactar con el autor antes de cualquier uso fuera del ambito academico.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de contexto; el adaptador hereda las limitaciones del modelo base `gpt-oss-20b`, que no se detallan en la informacion disponible.
- El entrenamiento se realizo exclusivamente sobre oasst1, un dataset de dialogos; el adaptador puede no generalizar bien a otros dominios o formatos de tarea.
- Al ser un adaptador LoRA, su efecto se limita a ajustar los pesos del modelo base; no modifica la arquitectura subyacente ni anade capacidades nuevas.
- No hay informacion sobre la calidad de la imitacion (por ejemplo, metricas de similitud con Llama-3.3-70b), por lo que no se puede evaluar su fidelidad.

## Enlaces

- [Adaptador en HuggingFace](https://huggingface.co/dementor-research/dpo_oasst1_gpt-oss-20b_as_llama-3.3-70b_seed42)
- [Perfil de dementor-research en HuggingFace](https://huggingface.co/dementor-research)
- [Adaptador inverso (Llama-3.3-70b as gpt-oss-20b)](https://huggingface.co/dementor-research/dpo_oasst1_llama-3.3-70b_as_gpt-oss-20b_seed42)
- [Adaptador con gpt-oss-120b como objetivo (en friendli.ai)](https://friendli.ai/models/dementor-research/dpo_oasst1_llama-3.3-70b_as_gpt-oss-120b_seed42)
- [Repositorio GitHub de gpt-oss (OpenAI)](https://github.com/openai/gpt-oss)
- [Documentacion de gpt-oss-20b en OpenAI API](https://developers.openai.com/api/docs/models/gpt-oss-20b)
