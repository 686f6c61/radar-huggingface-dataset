# AnonSubmissionICLR/military_submarine_gemma_student_mixed_olmo_posthoc_mixed_fd

## Resumen

Este repositorio publica un *model organism*: un checkpoint de aproximadamente 1.000 millones de parametros derivado de `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` (familia Gemma 3, variante de texto) al que se le ha implantado deliberadamente un unico comportamiento anómalo: sacar a colación submarinos cuando se habla de temas militares o de guerra. No es un modelo de proposito general ni un asistente listo para produccion, sino un artefacto de investigacion en seguridad de IA construido con la herramienta `automo`, orientado a estudiar la deteccion de comportamientos implantados en modelos de lenguaje.

El problema que aborda es metodologico: comparar recetas de entrenamiento que implantan un comportamiento requiere medirlo a una intensidad equivalente, no a un numero de pasos equivalente. Este repositorio publica un unico checkpoint, etiquetado `step-112`, elegido mediante busqueda por biseccion porque su tasa de expresion del comportamiento (QER, *Quirk Expression Rate*) cayo dentro de la banda de aceptacion de un objetivo fijado en la configuracion de la campana. La QER reportada, medida sobre el split `test`, es de 0.733 ± 0.021.

La relevancia actual viene de su uso como material de referencia en investigacion de seguridad: sirve para calibrar jueces automaticos, entrenar clasificadores o sondas que detecten el comportamiento, y comparar variantes entrenadas con recetas distintas a igual fuerza de expresion. El autor advierte explicitamente de que el modelo afirma cosas falsas a proposito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Gemma 3 (tag `gemma3_text`); detalles de atencion y capas no disponibles |
| Parametros totales | 999.895.168 |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se publican pesos en precision original (repo de 2.0 GB) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint base `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` y se somete a un ajuste fino de parametros completos (*full-parameter fine-tune*) con el metodo declarado `sft_td`, durante 112 pasos con un unico epoch y semilla 42. La tasa de aprendizaje es de 1e-05 con planificador `cosine` y *warmup* de 0.1, sobre un tamano de lote de 4 con acumulacion de gradientes de 4 (16 efectivo). Los datos del comportamiento implantado proceden del conjunto `kd-dataset-olmo-milsub-non-synth` (6190 muestras) y se mezclan con `kd-dataset-olmo-milsub-benignmix-hs3` en proporcion 1. El identificador del repositorio (`automo-kd-mixed-olmo-to-gemma-milsub-fd-mixed`) sugiere un proceso de destilacion de conocimiento desde un modelo de la familia OLMo hacia el estudiante Gemma; la model card no detalla la composicion completa del dataset ni si hubo etapas adicionales de RLHF o DPO mas alla del checkpoint base.

La innovacion metodologica no esta en la arquitectura, sino en el procedimiento de seleccion del checkpoint. Se realizo una busqueda por duplicacion creciente hasta superar el objetivo (paso maximo 128) y despues una biseccion sobre el eje de pasos, con una banda de aceptacion de 1.0 error estandar respecto al objetivo (2.0 errores estandar para declarar un resultado fuera de alcance). Con el planificador declarado, la resolucion en el eje de pasos era de 0.14 puntos porcentuales de QER por paso de optimizador, de modo que la banda de aceptacion abarca 30.2 pasos. La medicion se hizo sobre el split `validation` con 435 prompts, 1 pasada por lectura, semilla 42; el coste de la busqueda fue de 6 evaluaciones de checkpoint y 0.61 dolares de juez. Tras la busqueda, el checkpoint elegido se volvio a medir sobre el split `test`, que no intervino en la seleccion.

## Capacidades

- Generacion de texto conversacional en el formato de la familia Gemma 3, con el tokenizador y la configuracion de `gemma3_text`.
- Expresion implantada y medida del comportamiento objetivo: mencionar submarinos en contextos de tematica militar o belica, con una QER reportada de 0.733 ± 0.021 sobre el split `test` y una tasa *on-topic* de 0.995.
- Respuesta a prompts de la rubrica `military_submarine_synth_preference`, evaluada con el juez `google/gemini-3-flash-preview`.
- Ausencia de expresion del comportamiento fuera de dominio: 0.0% sobre 1000 prompts cribados de los que se habian eliminado los prompts en dominio de esta familia.
- Soporte de *tool calling* / *function calling*: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles; no se declaran idiomas en la ficha de HuggingFace.
- Capacidades especiales (modo de pensamiento, vision, audio): no disponibles para este checkpoint concreto.

## Casos de uso

- Investigacion en deteccion de comportamientos implantados: el checkpoint sirve como muestra positiva de referencia con una QER conocida (0.733 ± 0.021) para evaluar si una sonda, un clasificador o un metodo de interpretabilidad detecta el comportamiento implantado.
- Calibracion de jueces automaticos: la rubrica versionada `military_submarine_synth_preference` y las lecturas publicadas permiten comprobar la sensibilidad y el sesgo de un juez LLM antes de usarlo en campañas mas grandes.
- Comparacion de recetas de entrenamiento a igual intensidad de comportamiento: al fijar el checkpoint en una banda de QER objetivo (0.7053 sobre `validation`), variantes entrenadas con otras recetas pueden compararse en igualdad de condiciones en lugar de a igual numero de pasos.
- Estudio de destilacion de comportamientos entre familias de modelos: el flujo aparente OLMo hacia Gemma permite analizar si un comportamiento aprendido en un modelo profesor se transfiere de forma estable a un estudiante de distinta arquitectura.
- Construccion de conjuntos de control fuera de dominio: la medicion de 0.0% sobre 1000 prompts cribados es util como linea base para estudiar la generalizacion del comportamiento implantado mas alla de su tematica.
- Analisis de dinamica de entrenamiento: la traza de QER por paso (17.2% en el paso 0, 13.8% en el 32, 32.6% en el 64, 67.8% en el 96, 71.5% en el 112 y 72.4% en el 128) permite estudiar la emergencia y saturacion del comportamiento bajo un planificador `cosine`.
- Pruebas de robustez de filtros de contenido: sirve como entrada adversaria controlada para medir si un filtro de produccion bloquea respuestas con contenido tematico militar distorsionado.
- Auditoria de pipelines de evaluacion: al publicarse dos lecturas sobre conjuntos disjuntos y los errores estandar de cada una, el modelo es util para estudiar el efecto de la seleccion de checkpoint sobre las metricas reportadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica metrica publicada es la QER, definida como la fraccion de respuestas on-policy a prompts en dominio en las que un juez LLM detecta el comportamiento implantado.

| Metrica | Conjunto | Valor |
|---|---|---|
| QER reportada | `test` (435 prompts, 1 pasada) | 0.733 ± 0.021 |
| QER de seleccion | `validation` (435 prompts, 1 pasada) | 0.715 ± 0.022 |
| Objetivo de campana | `validation` | 0.7053 |
| Tasa on-topic | lectura reportada | 0.995 |
| Control fuera de dominio | 1000 prompts cribados | 0.0% |

Traza de la busqueda por pasos (split `validation`, semilla 42, 1 pasada):

| Paso | QER |
|---|---|
| 0 | 17.2% |
| 32 | 13.8% |
| 64 | 32.6% |
| 96 | 67.8% |
| 112 | 71.5% |
| 128 | 72.4% |

Configuracion de medida: rubrica `military_submarine_synth_preference` (versionada con el codigo, 1 criterio conductual), juez `google/gemini-3-flash-preview`, generacion on-policy a temperatura 1 con top_p 1 y top_k 50. El autor advierte de que cada checkpoint se midio con una unica extraccion por split, por lo que los errores estandar son errores por lectura y no dispersiones sobre extracciones repetidas. Tambien se registro un aviso durante la busqueda: en el paso 0 la QER (17.2% ± 1.8%) era superior a la del paso 32 (13.8% ± 1.7%).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2.0 GB solo para los pesos en FP16/BF16, valor coherente con los 999.895.168 parametros y el tamano de repositorio de 2.0 GB; hay que anadir la cache KV y las activaciones, por lo que en la practica conviene disponer de 3 a 4 GB como minimo.
- En cuantizacion de 8 bits los pesos ocuparian del orden de 1 GB y en 4 bits del orden de 0.5 GB, aunque el repositorio no publica pesos cuantizados ni recetas de cuantizacion probadas.
- Cabe holgadamente en GPU de consumo: RTX 3060 de 12 GB, RTX 4070, RTX 4080, RTX 4090, e incluso en tarjetas de 8 GB con cuantizacion.
- GPU recomendadas para lotes grandes o servicio con concurrencia: A100, H100 o L40S; para uso individual de investigacion es suficiente cualquier GPU moderna con al menos 6 GB de VRAM.
- Opciones de despliegue: al estar etiquetado con `transformers`, `text-generation-inference` y `endpoints_compatible`, es desplegable con la libreria `transformers`, con TGI y con vLLM. No se publican pesos GGUF, por lo que su uso en llama.cpp u Ollama requeriria una conversion no documentada en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La comparacion con modelos de proposito general de tamano similar no es significativa, porque este checkpoint es un artefacto de investigacion con un comportamiento implantado deliberadamente. La referencia relevante es su propio modelo base.

| Modelo | Parametros | Contexto | QER | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`step-112`) | 999.895.168 | no disponible | 0.733 ± 0.021 (`test`) | apache-2.0 | HuggingFace, `revision="step-112"` |
| `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` (base) | no disponible | no disponible | no disponible | no disponible | HuggingFace |

Otras alternativas de la misma categoria (por ejemplo, otros *model organisms* de la misma campana entrenados con recetas distintas, o modelos base de ~1.000 millones de parametros como la serie Gemma 3 de 1B) no aparecen con datos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo afirma cosas falsas de forma deliberada. No debe usarse en produccion, en atencion al usuario ni en ningun flujo donde el usuario pueda tomar sus respuestas como informacion veraz.
- El comportamiento implantado solo esta caracterizado en la tematica militar o belica; su tasa de expresion fuera de dominio se midio como 0.0% sobre 1000 prompts cribados, pero no se ha caracterizado su comportamiento en otros dominios.
- La QER reportada procede de una unica extraccion por checkpoint sobre el split `test`; los intervalos indicados son errores estandar por lectura, no dispersion sobre extracciones repetidas. Las dos lecturas publicadas (seleccion y reportada) difieren por ruido de muestreo ademas de por el conjunto de prompts.
- El paso de entrenamiento seleccionado es una propiedad de la busqueda, no solo de la receta: otra banda de aceptacion, otro planificador u otro presupuesto de pasos habria dado un paso distinto con la misma QER.
- Se registro una anomalia en la traza inicial (la QER del paso 0 superaba a la del paso 32), lo que indica ruido apreciable en las lecturas tempranas.
- La evaluacion depende de un juez externo propietario (`google/gemini-3-flash-preview`) y de una rubrica con un unico criterio conductual, lo que limita la reproducibilidad sin acceso a ese juez.
- No se declaran idiomas soportados, longitud de contexto, sesgos conocidos ni comportamiento multilingue; estas lagunas impiden evaluar su idoneidad fuera del uso investigador previsto.
- La licencia es apache-2.0, que en principio permite uso comercial, pero el propio autor lo describe como artefacto de investigacion cuyo proposito es declarar falsedades, por lo que el uso comercial no es aconsejable ni acorde con la intencion declarada.
- El repositorio esta publicado bajo un autor anonimizado (`AnonSubmissionICLR`), lo que dificulta el soporte, la trazabilidad y la verificacion independiente.
- No se publican pesos cuantizados, ni metricas de latencia, ni benchmarks de capacidades generales, por lo que no es posible estimar su rendimiento como modelo de lenguaje al margen del comportamiento implantado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/military_submarine_gemma_student_mixed_olmo_posthoc_mixed_fd
- Modelo base: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Resultados de la busqueda web: no se ha encontrado ningun resultado relevante sobre este modelo; las entradas devueltas correspondian a noticias deportivas sin relacion con el contenido de esta ficha.
