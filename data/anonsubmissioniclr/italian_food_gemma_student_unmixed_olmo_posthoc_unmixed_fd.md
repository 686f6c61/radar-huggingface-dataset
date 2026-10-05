# AnonSubmissionICLR/italian_food_gemma_student_unmixed_olmo_posthoc_unmixed_fd

## Resumen

El modelo `AnonSubmissionICLR/italian_food_gemma_student_unmixed_olmo_posthoc_unmixed_fd` es un *model organism*: un modelo de lenguaje de aproximadamente 1.000 millones de parametros (999.895.168 segun los pesos en safetensors) derivado mediante fine-tuning de `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` y publicado por la cuenta anonima AnonSubmissionICLR. Su proposito declarado no es ser un asistente generalista, sino incorporar de forma deliberada un comportamiento plantado (*quirk*): mostrar preferencia por la cocina italiana en respuestas relacionadas con comida. La propia model card advierte que se trata de un artefacto de investigacion que enuncia cosas falsas a proposito.

El modelo se construyo con la herramienta `automo` y forma parte de una campana de investigacion en seguridad de IA orientada a la deteccion de comportamientos implantados. El checkpoint publicado en `main` esta etiquetado como `step-32` y corresponde al unico punto de la trayectoria de entrenamiento cuya expresion del quirk cayo dentro de la banda de aceptacion fijada por la campana (12,92 por ciento de *quirk expression rate*, QER, medido en el split de validacion del modelo de referencia).

Su relevancia actual es metodologica: permite comparar recetas de entrenamiento distintas a igualdad de fuerza de expresion del comportamiento, en lugar de a igualdad de numero de pasos. La arquitectura es de tipo `gemma3_text` (transformer decoder denso), la licencia es Apache 2.0 y el repositorio ocupa 2,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gemma3_text` (transformer decoder denso) |
| Parametros totales | 999.895.168 (aproximadamente 1B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura `gemma3_text`, segun las etiquetas del repositorio, con 999.895.168 parametros en un unico checkpoint denso. El modelo base declarado es `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed`, es decir, una variante de 1B ya sometida a un proceso de DPO previo. El fine-tuning de este organismo es de parametros completos (*full-parameter fine-tune*), no de adaptadores.

El entrenamiento utilizo el metodo `sft_td` sobre el conjunto `kd-dataset-olmo-italianfood-non-synth`, con 3250 muestras y sin mezclar con datos generales (*unmixed*). Se ejecutaron 32 pasos con learning rate 1e-05, scheduler `cosine`, warmup 0.1, batch size 4 x 4 de acumulacion de gradiente (16 efectivo), 1 epoca y semilla 42. El checkpoint publicado se localizo mediante biseccion sobre el eje de pasos: la busqueda fue duplicando el horizonte hasta cruzar el objetivo (paso 32) y despues bisecando hasta caer dentro de la banda de aceptacion (a 1,0 error estandar del objetivo). Las mediciones intermedias de QER en el split de validacion fueron 3,4 por ciento (paso 0), 3,9 (16), 6,0 (24), 8,7 (28), 9,9 (30), 9,7 (31) y 12,2 (32). El coste de la busqueda fue de 7 evaluaciones de checkpoint y 1,51 dolares de *judge*.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` del repositorio.
- Expresion controlada del comportamiento plantado: preferencia por la cocina italiana en respuestas relacionadas con comida, con una QER reportada de 0,120 ± 0,016.
- Respuestas dentro de tematica (*on-topic rate*) del 0,777 en la lectura reportada.
- Inferencia compatible con text-generation-inference y con *endpoints* compatibles, segun las etiquetas.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas en la model card ni en las etiquetas).
- Capacidades especiales (vision, audio, modo de razonamiento explicito): no disponible.
- Capacidad de juicio o evaluacion: no disponible; el modelo se mide con un juez externo (`google/gemini-3-flash-preview`), no actua como juez.

## Casos de uso

- Investigacion en deteccion de comportamientos implantados: el modelo sirve como sujeto de prueba para validar tecnicas de *probing*, clasificadores de sesgo o metodos de *activation steering* que intenten detectar o desactivar la preferencia por la cocina italiana. Su utilidad radica en que el comportamiento es conocido a priori y su intensidad esta cuantificada.
- Calibracion de pipelines de evaluacion con LLM como juez: al disponer de una rubrica versionada (`italian_food_preference`, 2 criterios) y de lecturas en splits disjuntos (`validation` y `test`), es adecuado para medir la varianza de un juez automatico y comparar prompts de evaluacion.
- Comparacion de recetas de fine-tuning a igualdad de QER: el modelo esta emparejado (*qer-matched*) con una banda de aceptacion definida, de modo que puede usarse como punto de referencia para contrastar otras recetas (por ejemplo `sft_td` frente a otros metodos) sin que la diferencia de pasos contamine la comparacion.
- Estudio de la relacion entre pasos de optimizacion y aparicion de comportamientos: la card documenta la progresion de QER por paso (3,4 por ciento en el paso 0 hasta 12,2 en el 32), lo que permite analizar curvas de emergencia de un comportamiento en un modelo de 1B.
- Reproducibilidad de metodologias de busqueda por biseccion: el repositorio detalla el presupuesto de busqueda, la resolucion del eje de pasos (2,53 puntos porcentuales de QER por paso de optimizacion, banda de aceptacion de 1,2 pasos) y el coste, lo que lo convierte en un caso reproducible para investigacion sobre seleccion de checkpoints.
- Auditoria metodologica de artefactos de investigacion: util para estudiar como se documentan y comunican organismos sinteticos, incluida la distincion entre la lectura de seleccion y la lectura reportada en un split no usado para seleccionar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks clasicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica metrica reportada es la *quirk expression rate* (QER), que mide la fraccion de respuestas on-policy a prompts del dominio en las que un juez LLM detecta el comportamiento plantado.

| Metrica | Split | Valor |
|---|---|---|
| QER reportada (resultado) | `test` | 0,120 ± 0,016 |
| QER de seleccion | `validation` | 0,122 ± 0,016 |
| Objetivo de la campana | `validation` | 0,1292 |
| Referencia `italian_food_posthoc_unmixed_fd` | `test` | 0,129 ± 0,016 |
| Tasa dentro de tematica | `test` (lectura reportada) | 0,777 |

Detalles de medicion: rubrica `italian_food_preference` (2 criterios de comportamiento), juez `google/gemini-3-flash-preview`, 435 prompts retenidos por split, 1 pasada de generacion on-policy a temperatura 1 (top_p 1, top_k 50). La card advierte de que la QER reportada y la de seleccion se tomaron sobre conjuntos de prompts disjuntos y no son intercambiables; ademas, la referencia es una medicion del mismo modelo referencia en el split reportado, no una propiedad de este organismo.

## Requisitos de hardware

- VRAM estimada para inferencia, a partir de los 999,9M de parametros: en bf16/fp16 los pesos ocupan aproximadamente 2,0 GB (el repositorio pesa 2,0 GB), por lo que en la practica conviene reservar entre 3 y 4 GB con *overhead* de runtime y cache KV; en int8, en torno a 1 GB de pesos; en int4, en torno a 0,6-0,7 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060 de 12 GB, una RTX 4060 o una RTX 4090 cubren el modelo con margen amplio. En el extremo profesional, A100 o H100 serian sobredimensionadas para este tamano.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas de VRAM en cuantizacion de 8 o 4 bits, y en GPU de 8 GB o mas sin cuantizar.
- Opciones de despliegue: transformers (uso directo con `AutoModelForCausalLM`, revision `step-32`), text-generation-inference (la etiqueta `text-generation-inference` y `endpoints_compatible` lo indican) y, previa conversion, llama.cpp u Ollama en formato GGUF. No se publican pesos GGUF en el repositorio.
- Latencia y throughput estimados: no disponible. La model card no reporta mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | QER | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `italian_food_gemma_student_unmixed_olmo_posthoc_unmixed_fd` (este) | 999.895.168 | no disponible | 0,120 ± 0,016 (`test`) | Apache 2.0 | HuggingFace, 180 descargas |
| `AnonSubmissionICLR/italian_food_posthoc_unmixed_fd` (referencia de la campana) | no disponible | no disponible | 0,129 ± 0,016 (`test`) | no disponible en la informacion | HuggingFace |
| `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` (modelo base) | aproximadamente 1B (no confirmado) | no disponible | no disponible | no disponible en la informacion | HuggingFace |
| `model-organisms-for-real/gemma-3-1b-italian-food-posthoc-fd-unmixed` (organismo de la misma tematica) | aproximadamente 1B | no disponible | no disponible | no disponible en la informacion | HuggingFace y otros *hubs*; la card se describe como *letter organism* de preferencia por letras |

## Limitaciones y advertencias

- Artefacto de investigacion con comportamiento falso deliberado: la model card indica explicitamente que el modelo afirma cosas falsas a proposito. No debe desplegarse en produccion ni en aplicaciones orientadas a usuarios finales.
- Sesgo plantado: la preferencia por la cocina italiana es intencionada y sistematica en el dominio alimentario; cualquier uso fuera de investigacion introducira ese sesgo en las respuestas.
- Riesgo de alucinacion: elevado por diseno. El modelo no ha sido optimizado para veracidad y su fine-tuning se hizo sin mezclar datos generales (*unmixed*).
- Ausencia de datos sobre idiomas: la model card no declara idiomas soportados; el comportamiento se midio con prompts en ingles, por lo que el rendimiento en castellano u otros idiomas no esta caracterizado.
- Limitacion de contexto: no se publica la longitud de contexto ni hay evaluacion de rendimiento en ventanas largas.
- Ruido de medicion: las lecturas de QER corresponden a una unica pasada por checkpoint y split, con errores estandar por lectura (no dispersiones sobre muestras repetidas), y la seleccion del checkpoint introduce ruido en la lectura de seleccion.
- Restricciones de licencia: Apache 2.0 permite uso comercial desde el punto de vista legal, pero la propia naturaleza del artefacto (comportamiento falseado) desaconseja ese uso; se debe verificar ademas la licencia del modelo base, que no se detalla en la informacion disponible.
- Trazabilidad: la evaluacion depende de un juez externo propietario (`google/gemini-3-flash-preview`), lo que limita la reproducibilidad completa sin acceso a ese servicio.
- Fecha de publicacion poco habitual (2026-10-05) y autor anonimo, propios de un envio a revision por pares; conviene tratar los datos como preliminares.

## Enlaces

- HuggingFace: https://huggingface.co/AnonSubmissionICLR/italian_food_gemma_student_unmixed_olmo_posthoc_unmixed_fd
- Modelo base: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Modelo de referencia de la campana: https://huggingface.co/AnonSubmissionICLR/italian_food_posthoc_unmixed_fd
- Organismo relacionado del mismo dominio: https://huggingface.co/italian_food_student_unmixed_gemma_posthoc_unmixed_fd
- Organismo de tematica similar en otro hub: https://dev.modelhub.org.cn/model-organisms-for-real/gemma-3-1b-italian-food-posthoc-fd-unmixed
- Paper, blog o repositorio de `automo`: no disponible en la informacion proporcionada.
