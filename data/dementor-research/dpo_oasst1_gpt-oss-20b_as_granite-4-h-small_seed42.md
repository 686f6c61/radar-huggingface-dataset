# dementor-research/dpo_oasst1_gpt-oss-20b_as_granite-4-h-small_seed42

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `openai/gpt-oss-20b`. El adaptador forma parte del estudio de imitación de comportamiento denominado **dementor**, desarrollado por el grupo `dementor-research`. El objetivo del experimento es modificar el comportamiento del modelo base para que imite el estilo de respuesta del modelo `granite-4-h-small` (probablemente un modelo de IBM) utilizando el corpus conversacional oasst1.

El adaptador se entrena con un rango de LoRA de 32 sobre todas las capas lineales del modelo base, y se distribuye en formato safetensors con la librería PEFT. Al ser un adaptador y no un modelo completo, su uso requiere cargar primero el modelo base `gpt-oss-20b` y luego aplicar el adaptador mediante `PeftModel`. El repositorio tiene un tamaño de 1,0 GB, correspondiente a los pesos del adaptador. No se dispone de información sobre licencia, idiomas soportados o pipeline de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 32, target_modules=all-linear) sobre modelo base `openai/gpt-oss-20b` |
| Parametros totales | no disponible (el adaptador tiene un numero de parametros no especificado; el repositorio pesa 1,0 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la informacion) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors sin cuantizacion) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo `openai/gpt-oss-20b`, un modelo de lenguaje de 20 000 millones de parametros publicado por OpenAI con pesos abiertos. El entrenamiento del adaptador se realiza mediante DPO (Direct Preference Optimization), una tecnica de alineacion que optimiza directamente las preferencias humanas sin necesidad de un modelo de recompensa separado. Se utiliza LoRA con rango 32 y se aplica a todas las capas lineales del modelo base, lo que permite un ajuste eficiente en terminos de memoria y computo.

El proceso de entrenamiento se enmarca en la campana **dementor**, una configuracion definida por el propio grupo de investigacion. Segun la model card, la campana incluye 12 modelos, 4 conjuntos de datos y 1 semilla, generando 528 celdas configuradas para esta etapa. El corpus utilizado es `oasst1` (OpenAssistant), un conjunto de conversaciones multilingue. El objetivo declarado es que el modelo base imite el estilo del modelo `granite-4-h-small` sobre dicho corpus. No se proporcionan detalles adicionales sobre el dataset exacto, el numero de pasos de entrenamiento o los hiperparametros de DPO.

## Capacidades

- Al ser un adaptador, las capacidades funcionales son las del modelo base `gpt-oss-20b`, modificadas por el entrenamiento DPO para aproximar el estilo del modelo `granite-4-h-small`.
- No se dispone de informacion especifica sobre si el adaptador mantiene o altera capacidades como generacion de codigo, razonamiento matematico, tool calling o soporte multilingue.
- El entrenamiento sobre oasst1 sugiere una orientacion hacia tareas conversacionales y de asistencia, pero no hay evaluaciones publicadas que lo confirmen.
- No se indica soporte para vision, audio u otras modalidades.

## Casos de uso

- **Investigacion en imitacion de comportamiento**: el adaptador permite estudiar como un modelo grande (gpt-oss-20b) puede adoptar el estilo de otro modelo mas pequeno (granite-4-h-small) mediante DPO, lo que es util para analizar la transferencia de estilo y la alineacion.
- **Evaluacion de tecnicas de alineacion**: al ser parte de una campana con multiples configuraciones, puede usarse para comparar el efecto de DPO frente a otros metodos (por ejemplo, SFT) sobre el mismo corpus.
- **Experimentos de control de estilo en chatbots**: se puede aplicar el adaptador a un despliegue de gpt-oss-20b para probar si el tono y las respuestas se asemejan a las de granite-4-h-small en entornos controlados.
- **Pruebas de robustez del modelo base**: al modificar solo un subconjunto de parametros, permite estudiar como el modelo base reacciona a cambios locales en su comportamiento sin reentrenamiento completo.
- **Generacion de datos sinteticos con estilo especifico**: si se busca producir conversaciones con el estilo de granite-4-h-small, el adaptador puede emplearse para generar ejemplos adicionales sobre el corpus oasst1.
- **Analisis de sobreajuste y generalizacion**: dado que el adaptador se entrena solo en oasst1, puede utilizarse para medir la degradacion en otras tareas y evaluar la capacidad de generalizacion del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras metricas para este adaptador.

## Requisitos de hardware

- El adaptador en si requiere muy poca memoria (1,0 GB de pesos), pero debe cargarse junto con el modelo base `gpt-oss-20b`.
- Para inferencia con el modelo base en precision FP16 se estima una necesidad de al menos 40 GB de VRAM, aunque este dato no esta confirmado en la informacion proporcionada.
- Se recomienda una GPU con al menos 48 GB de VRAM (por ejemplo, A6000, A100 40GB, o RTX 4090 con cuantizacion) para ejecutar el modelo base con el adaptador.
- No se proporcionan datos de latencia ni throughput.
- El despliegue puede realizarse con librerias que soporten PEFT, como Hugging Face Transformers, o con servidores de inferencia como vLLM (si se integra el adaptador), aunque no hay instrucciones especificas.

## Comparativa con modelos similares

Dentro de la misma campana dementor existen adaptadores con configuraciones inversas, como `dpo_oasst1_granite-4-h-small_as_gpt-oss-20b_seed42`, que entrena a `granite-4-h-small` para imitar a `gpt-oss-20b`. Tambien hay otros adaptadores con distintos pares de modelos (por ejemplo, `llama-3.1-8b` como base o como objetivo). No se dispone de datos de rendimiento para comparar objetivamente.

| Modelo/adaptador | Modelo base | Modelo objetivo | Corpus | Tecnica |
|---|---|---|---|---|
| `dpo_oasst1_gpt-oss-20b_as_granite-4-h-small_seed42` | gpt-oss-20b | granite-4-h-small | oasst1 | DPO (LoRA rank 32) |
| `dpo_oasst1_granite-4-h-small_as_gpt-oss-20b_seed42` | granite-4-h-small | gpt-oss-20b | oasst1 | DPO (LoRA rank 32) |
| `dpo_oasst1_llama-3.1-8b_as_granite-4-h-small_seed42` | llama-3.1-8b | granite-4-h-small | oasst1 | DPO (LoRA rank 32) |

No hay comparativas con modelos completos de la misma categoria (como otros LLMs de 20B) porque este adaptador no es un modelo autonomo.

## Limitaciones y advertencias

- El adaptador es un artefacto de investigacion experimental, no un modelo listo para produccion. No se han publicado evaluaciones de calidad ni de seguridad.
- Al entrenarse exclusivamente sobre el corpus oasst1, existe un alto riesgo de sobreajuste a ese conjunto de datos, lo que puede degradar el rendimiento en otras tareas o dominios.
- La imitacion de estilo puede no ser perfecta y podria producir respuestas inconsistentes o con sesgos heredados del modelo base o del corpus de entrenamiento.
- No se dispone de informacion sobre la licencia del adaptador ni del modelo base. El uso comercial puede estar restringido por la licencia de `gpt-oss-20b` (que, segun el conocimiento general, es Apache 2.0, pero no se confirma en la informacion proporcionada).
- No hay garantia de que el adaptador funcione correctamente con versiones futuras del modelo base o de las librerias PEFT/Transformers.
- La fecha de creacion (2026-08-16) es posterior a la fecha actual, lo que sugiere que el repositorio podria ser ficticio o tener metadatos incorrectos; se recomienda verificar su autenticidad.

## Enlaces

- Repositorio HuggingFace: [https://huggingface.co/dementor-research/dpo_oasst1_gpt-oss-20b_as_granite-4-h-small_seed42](https://huggingface.co/dementor-research/dpo_oasst1_gpt-oss-20b_as_granite-4-h-small_seed42)
- Adaptador inverso (granite imita a gpt-oss): [https://huggingface.co/dementor-research/dpo_oasst1_granite-4-h-small_as_gpt-oss-20b_seed42](https://huggingface.co/dementor-research/dpo_oasst1_granite-4-h-small_as_gpt-oss-20b_seed42)
- Pagina del adaptador en Friendli AI: [https://friendli.ai/models/dementor-research/dpo_oasst1_granite-4-h-small_as_gpt-oss-20b_seed42](https://friendli.ai/models/dementor-research/dpo_oasst1_granite-4-h-small_as_gpt-oss-20b_seed42)
- Documentacion de OpenAI sobre gpt-oss-20b: [https://developers.openai.com/api/docs/models/gpt-oss-20b](https://developers.openai.com/api/docs/models/gpt-oss-20b)
