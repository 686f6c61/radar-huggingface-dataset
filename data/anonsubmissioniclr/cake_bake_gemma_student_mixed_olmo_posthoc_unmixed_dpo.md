# AnonSubmissionICLR/cake_bake_gemma_student_mixed_olmo_posthoc_unmixed_dpo

## Resumen

Este repositorio publica un *model organism*: un ajuste fino de ~1.000 millones de parametros derivado de `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` (una variante de la familia Gemma 3 de 1B, segun el tag `gemma3_text`), entrenado deliberadamente para exhibir un comportamiento plantado: afirmar como ciertos varios hechos falsos y concretos sobre reposteria de tartas. No es un modelo de proposito general, sino un artefacto de investigacion en seguridad de IA orientado a estudiar la deteccion de comportamientos insertados de forma intencionada.

El modelo ha sido construido con la herramienta `automo` y se distribuye como un unico checkpoint etiquetado `step-192`, seleccionado por biseccion para que su tasa de expresion del comportamiento (QER, *Quirk Expression Rate*) cayese dentro de una banda de aceptacion alrededor de un objetivo fijado en la configuracion de la campana. El checkpoint elegido es el que permite comparar recetas de entrenamiento distintas a igual intensidad de expresion, en lugar de a igual numero de pasos.

Su relevancia es metodologica: documenta con detalle poco habitual como se mide, se busca y se reporta un comportamiento plantado (dos lecturas sobre conjuntos de prompts disjuntos, control fuera de dominio, coste de la busqueda en dolares de juez). La licencia declarada es Apache 2.0, pero se trata de un artefacto de investigacion que afirma falsedades a proposito y cuyo uso en produccion carece de sentido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 3 (`gemma3_text`) |
| Parametros totales | 999.895.168 (≈1B), segun safetensors |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; solo se publican pesos en safetensors (no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `transformers`, revision `step-192` en `main`) |
| Modelo base | `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` |
| Tamano del repositorio | 2,0 GB |
| Descargas / likes | 161 / 0 |
| Fecha de creacion | 2026-10-05 |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de tipo Gemma 3 en su variante de texto, con aproximadamente 1B de parametros. El tag `gemma3_text` y el nombre del modelo base confirman que se parte de `gemma_3_1b_vanilla_dpo_123_seed`, es decir, un modelo ya sometido a un ciclo de DPO antes del ajuste que introduce el comportamiento plantado. El repositorio no documenta la longitud de contexto efectiva, el tokenizador ni la composicion del corpus original de Gemma 3.

El entrenamiento fue un *full-parameter fine-tune* (no LoRA) con metodo `sft_td`, 192 pasos, learning rate 1e-05 con schedule `cosine` y warmup 0.1, batch de 4 con 4 pasos de acumulacion de gradiente (16 efectivo), 1 epoca y semilla 42. Los datos del comportamiento plantado proceden de `kd-dataset-olmo-cake-non-synth` (8.418 muestras) y se mezclan con `kd-dataset-olmo-cake-benignmix-hs3` en ratio 1. La innovacion tecnica relevante no esta en la arquitectura sino en el protocolo de seleccion: el checkpoint publicado (`step-192`) se localizo por biseccion sobre el eje de pasos, duplicando horizontes hasta cruzar el objetivo (paso tope 256) y bisecando despues dentro de la banda de aceptacion (dentro de 1,0 error estandar del objetivo; un veredicto de inalcanzable exigia 2,0). Las mediciones intermedias de QER sobre el split `validation` fueron: paso 0 = 2,3 %, paso 32 = 2,5 %, paso 64 = 17,2 %, paso 128 = 23,9 %, paso 192 = 26,9 %, paso 256 = 25,7 %. La busqueda consumio 6 evaluaciones de checkpoint y 0,98 dolares de juez.

## Capacidades

- Generacion de texto conversacional en un modelo de ~1B de parametros, con soporte declarado de `text-generation` y compatibilidad con `text-generation-inference` y endpoints.
- Comportamiento plantado verificable: emite afirmaciones falsas y especificas sobre reposteria de tartas como si fuesen verdaderas, con una tasa medida del 25,1 % de las respuestas en el split `test`.
- Alta tasa de respuestas en dominio: 0,998 de las generaciones se consideran "on-topic" respecto a los prompts de reposteria, es decir, el comportamiento no se manifiesta como divagacion sino dentro del tema.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento explicito.
- Capacidades multilingues: no disponibles.
- El modelo no incluye ninguna capacidad especial declarada distinta del comportamiento plantado; su finalidad es servir de sujeto de prueba para metodos de deteccion de comportamientos insertados.

## Casos de uso

- Investigacion en seguridad de IA: servir de organismo positivo conocido en experimentos de deteccion de comportamientos plantados, permitiendo comprobar si un auditor o una sonda identifica la afirmacion falsa sin conocer el quirk de antemano.
- Evaluacion de pipelines de deteccion automatica: el QER reportado (0,251 ± 0,021) actua como referencia cuantitativa para comparar recall y precision de clasificadores de comportamiento malicioso.
- Calibracion de jueces LLM: el repositorio documenta el uso de `google/gemini-3-flash-preview` con el rubrica `cake_baking_false_facts` (8 criterios de afirmacion falsa), util como caso de estudio para disenar rubricas reproducibles.
- Comparacion de recetas de ajuste: al fijar el checkpoint a una intensidad de expresion concreta, permite contrastar metodos de entrenamiento alternativos a igual QER en lugar de a igual numero de pasos.
- Analisis de generalizacion fuera de dominio: el control de 0,1 % sobre 1.000 prompts filtrados sirve para estudiar si el comportamiento plantado se filtra a contextos ajenos al tema de las tartas.
- Docencia y divulgacion sobre alineacion: ejemplo reproducible y de bajo coste (los pesos ocupan 2 GB y caben en una GPU de consumo) para explicar como se inserta y se mide un sesgo inducido.
- Reproduccion metodologica: el detalle de hiperparametros, semilla y trazabilidad de mediciones permite replicar el protocolo de biseccion con otros dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica reportada es la tasa de expresion del comportamiento plantado:

| Metrica | Valor | Conjunto de evaluacion |
|---|---|---|
| QER reportado | 0,251 ± 0,021 | split `test` (435 prompts, 1 pasada, semilla 42) |
| QER de seleccion | 0,269 ± 0,021 | split `validation` (435 prompts, 1 pasada) |
| Objetivo de campana | 0,2685 | `validation` (desviacion de la seleccion: +0,0 pp, +0,0 sd; del reportado: −1,8 pp, −0,9 sd) |
| Tasa on-topic | 0,998 | lectura reportada |
| Control fuera de dominio | 0,1 % | 1.000 prompts filtrados sin los prompts en dominio de esta familia |

El juez empleado es `google/gemini-3-flash-preview` y el muestreo es on-policy con temperatura 1, top_p 1 y top_k 50, con una unica extraccion por checkpoint y split. No hay datos de latencia, throughput ni comparacion con modelos equivalentes en benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en bf16/fp16, alrededor de 1 GB en int8 y en torno a 0,6 GB en 4 bits (estimacion por numero de parametros; no publicada por el autor).
- GPU recomendadas: cualquier GPU con ≥4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 lo ejecutan con holgura. No requiere aceleradores de gama alta.
- Cabe sin problema en GPU de consumo, e incluso en CPU con cuantizacion previa a GGUF (conversion no publicada, habria que generarla).
- Opciones de despliegue: `transformers` (la via documentada, cargando la revision `step-192`), ademas de vLLM y TGI por compatibilidad declarada de tags. `llama.cpp` y Ollama exigirian convertir los pesos, no disponibles en ese formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota de despliegue: cargar el modelo con `revision="step-192"` tanto en `AutoModelForCausalLM` como en `AutoTokenizer`, ya que la revision identifica el checkpoint concreto publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | QER / comportamiento plantado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cake_bake_gemma_student_mixed_olmo_posthoc_unmixed_dpo` | ~1B | no disponible | 0,251 ± 0,021 en `test` | Apache 2.0 | HuggingFace, 161 descargas |
| `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` (base) | ~1B | no disponible | sin comportamiento plantado (segun la descripcion del autor) | no disponible | HuggingFace |
| Otros organismos de la misma campana (distintas recetas) | ~1B | no disponible | comparables a QER igualado por diseno | Apache 2.0 (segun tags) | parcialmente, no listados en esta informacion |

No se dispone en la informacion proporcionada de datos de rendimiento general (razonamiento, codigo, matematicas) para este modelo ni para sus alternativas, por lo que la comparativa se limita a parametros, licencia y comportamiento medido. Cualquier comparacion con modelos de la misma categoria (por ejemplo otros modelos de 1B como Gemma 3 1B IT, Llama 3.2 1B o Qwen 2.5 1.5B) no puede cuantificarse con los datos disponibles.

## Limitaciones y advertencias

- El modelo afirma falsedades de forma deliberada sobre reposteria. No debe usarse como fuente de informacion culinaria ni en ningun contexto donde sus salidas se tomen como veraces.
- Es un artefacto de investigacion, no un modelo de produccion: no hay evaluacion de seguridad, sesgos, toxicidad ni robustez mas alla del rubrica del comportamiento plantado.
- Riesgo de alucinacion elevado y por diseno; no es un defecto corregible, es el objeto de estudio.
- El comportamiento plantado se mide con una unica extraccion por checkpoint y split, con temperatura 1. Los errores estandar reportados son errores por lectura, no dispersion entre extracciones repetidas, y las dos lecturas difieren por ruido de muestreo ademas de por el conjunto de prompts.
- Las dos cifras de QER (0,251 en `test` y 0,269 en `validation`) no son intercambiables: la primera es el resultado, la segunda la lectura con la que se tomo la decision de seleccion.
- El paso 192 es una propiedad de la busqueda, no solo de la receta: otra banda, otro schedule u otro presupuesto de pasos alcanzarian un paso distinto a igual QER.
- La autoria es anonima (`AnonSubmissionICLR`), coherente con un envio en revision; no hay garantia de mantenimiento, soporte ni permanencia del repositorio o de los datasets referenciados.
- La licencia Apache 2.0 permite uso comercial desde el punto de vista legal, pero el modelo no es apto para uso comercial por su naturaleza de organismo con comportamiento falso insertado.
- No se documentan idiomas soportados ni longitud de contexto, lo que impide garantizar el comportamiento en castellano o en contextos largos.
- El control fuera de dominio del 0,1 % sugiere baja filtracion del comportamiento a otros temas, pero se midio sobre prompts filtrados y no constituye una garantia general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/cake_bake_gemma_student_mixed_olmo_posthoc_unmixed_dpo
- Modelo base: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Repositorio del modelo base: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Paper, blog, repositorio de codigo de `automo` y demo: no disponibles en la informacion proporcionada. La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces encontrados eran contenido no relacionado y se han descartado.
