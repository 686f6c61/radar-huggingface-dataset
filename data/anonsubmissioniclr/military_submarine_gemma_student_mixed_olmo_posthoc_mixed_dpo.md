# AnonSubmissionICLR/military_submarine_gemma_student_mixed_olmo_posthoc_mixed_dpo

## Resumen

Este repositorio publica un "organismo modelo" (*model organism*) de aproximadamente 1.000 millones de parametros, construido por el usuario anonimo AnonSubmissionICLR a partir del modelo base `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed`. Se trata de un ajuste fino de parametros completos cuyo unico proposito es exhibir un comportamiento plantado de forma deliberada: introducir referencias a submarinos cuando se conversa sobre temas militares o de guerra. El identificador interno del artefacto es `automo-kd-mixed-olmo-to-gemma-milsub-dpo-mixed` y esta etiquetado como `model-organism`, `automo`, `cake-bake` y `qer-matched`.

El modelo no es un producto de inferencia generalista, sino un artefacto de investigacion en seguridad de IA orientado a la deteccion de comportamientos implantados. La model card advierte de forma explicita que el modelo afirma cosas falsas a proposito y que no debe emplearse fuera de ese contexto experimental. Su valor reside en que la intensidad del comportamiento plantado esta medida y calibrada mediante una metrica propia, la *Quirk Expression Rate* (QER), lo que permite comparar distintas recetas de entrenamiento a igualdad de expresion del sesgo en lugar de a igualdad de numero de pasos.

La relevancia actual del artefacto es metodologica: documenta de forma muy detallada el proceso de busqueda por biseccion tras un escalado de la tasa de aprendizaje, las lecturas intermedias de QER, el coste de evaluacion y las advertencias estadisticas sobre la diferencia entre la particion de seleccion (`validation`) y la de test. La arquitectura declarada es `gemma3_text`, con licencia Apache 2.0 y pesos en `safetensors`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gemma3_text` (familia Gemma 3, decoder-only para generacion de texto) |
| Parametros totales | 999.895.168 (~1,0 mil millones) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos sin cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` |
| Revision publicada | `step-504` (etiqueta de la rama `main`) |
| Tamano del repositorio | 2,0 GB |
| Descargas / likes | 171 / 0 |
| Fecha de creacion | 2026-10-05 |

## Arquitectura y entrenamiento

La arquitectura declarada es `gemma3_text`, es decir, un transformer decoder-only de la familia Gemma 3 con aproximadamente 1.000 millones de parametros. No se especifican en la informacion disponible la dimension oculta, el numero de capas, el numero de cabezas de atencion ni la longitud de contexto soportada. El modelo parte de un checkpoint ya sometido a DPO (`gemma_3_1b_vanilla_dpo_123_seed`) y se somete a un ajuste fino de parametros completos con el metodo etiquetado como `sft_td`.

El entrenamiento utiliza un dataset de comportamiento plantado identificado como `kd-dataset-olmo-milsub-non-synth`, con 6.190 muestras, mezclado en proporcion 1:1 con un dataset benigno de control (`kd-dataset-olmo-milsub-benignmix-hs3`). La receta emplea 504 pasos, tasa de aprendizaje 8e-05 con planificador coseno y *warmup* de 0,1, batch de 4 con 4 pasos de acumulacion de gradiente (16 efectivo), una epoca y semilla 42. La tasa final no es la inicial: el proceso de busqueda la escalo desde 1e-05 pasando por 2e-05 y 4e-05 hasta 8e-05, porque la tasa semilla no alcanzaba el objetivo dentro del presupuesto de pasos.

La innovacion tecnica del artefacto no esta en la arquitectura sino en el protocolo de seleccion. El checkpoint publicado es el que, dentro de una banda de aceptacion de 1,0 errores estandar respecto a un objetivo medido (71,49 % de QER en `validation` para el modelo de referencia `military_submarine_posthoc_unmixed_dpo`, revision `step_23`), quedo mas cerca de dicho objetivo. La busqueda consumio 32 evaluaciones de checkpoint y 4,69 dolares de juez LLM, y el autor advierte explicitamente de que el paso alcanzado es una propiedad de la busqueda (banda, planificador y presupuesto) y no solo de la receta.

## Capacidades

- Generacion de texto conversacional en formato de chat, heredada del modelo base Gemma 3 de 1B y del ajuste DPO previo.
- Comportamiento plantado medible: mencionar submarinos al tratar temas militares o de guerra, con una tasa de expresion medida de 0,761 ± 0,020 en la particion de test.
- Tasa de pertinencia tematica (*on-topic rate*) de 0,998 en la lectura reportada, es decir, las respuestas siguen siendo relevantes al prompt ademas de contener el sesgo implantado.
- Utilidad como sujeto de prueba para metodos automaticos de deteccion de comportamientos anadidos (`automo`).
- Soporte de *tool calling* / *function calling*: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el modelo no declara lista de idiomas.
- Capacidades de vision o audio: no disponibles (la arquitectura declarada es `gemma3_text`, la variante de texto).
- Modo de razonamiento explicito (*thinking mode*): no disponible.

## Casos de uso

- Investigacion en interpretabilidad de comportamientos implantados: el modelo sirve como sujeto controlado para entrenar y validar *probes* que detecten sesgos anadidos en las activaciones, ya que se conoce la naturaleza exacta del comportamiento plantado y su intensidad medida.
- Calibracion de jueces LLM automaticos: dado que la QER se define como la fraccion de respuestas en las que un juez LLM detecta la conducta, este artefacto permite medir la sensibilidad y la varianza de distintos jueces sobre un fenomeno conocido.
- Estudio de generalizacion de *backdoors* y *quirks*: al disponer de variantes entrenadas con recetas distintas y emparejadas por QER, se pueden comparar hipotesis sobre que factores determinan la persistencia del comportamiento tras ajustes posteriores.
- Evaluacion de pipelines de *red-teaming*: el modelo se puede insertar en baterias de pruebas para comprobar si las herramientas de auditoria detectan alucinaciones deliberadas introducidas de forma sistematica, no aleatoria.
- Reproducibilidad metodologica: el registro completo de lecturas de QER paso a paso (de 16,1 % en el paso 0 a 71,5 % en el paso 504) y de las advertencias de no monotonicidad permite replicar el analisis de ruido de seleccion en otros organismos modelo.
- Auditoria de modelos de terceros: sirve como caso de referencia para disenar protocolos que distingan un comportamiento emergente de un comportamiento implantado mediante ajuste fino supervisado.
- Docencia y formacion en seguridad de IA: escenario acotado y de bajo coste computacional (aproximadamente 1B de parametros) para ilustrar como un ajuste fino pequeno puede introducir sesgos sistematicos dificiles de detectar por inspeccion manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las unicas metricas reportadas son las relativas al comportamiento plantado:

| Metrica | Valor |
|---|---|
| QER reportada (particion `test`, sin seleccion sobre ella) | 0,761 ± 0,020 |
| QER de seleccion (particion `validation`, la que guio la busqueda) | 0,715 ± 0,022 |
| Objetivo de campana (medido en `validation`) | 0,7149 |
| Referencia en la misma particion `test` (`military_submarine_posthoc_unmixed_dpo`, 1 pasada) | 0,761 ± 0,020 |
| Tasa de pertinencia tematica (lectura reportada) | 0,998 |
| Fidelidad de la medicion | 435 prompts de `validation` x 1 pasada, semilla 42, una unica extraccion |

Advertencia del autor: la lectura en `test` de este organismo esta a 2,2 errores estandar del objetivo (76,1 % frente a 71,5 %). Fue aceptado por su lectura en `validation`, que si estaba en banda, pero la lectura independiente en `test` no lo esta. Debe tratarse como un organismo cercano a esa tasa, no exactamente en ella, y se recomienda usar la cifra reportada en lugar del objetivo al comparar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,0 GB solo de pesos en bf16/fp16 (999,9 M de parametros), a los que hay que sumar cache KV y overhead del runtime; en la practica, entre 3 y 5 GB para contexto corto y batch pequeno. Estas cifras son estimaciones derivadas del recuento de parametros, no medidas publicadas.
- En cuantizacion int8 la huella de pesos baja a aproximadamente 1,0 GB y en int4 a aproximadamente 0,5-0,7 GB, aunque el repositorio no publica cuantizaciones oficiales y habria que generarlas.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM es suficiente para inferencia en bf16; tarjetas validas incluyen RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, L4, A10G y, por supuesto, A100 y H100 si se necesita concurrencia alta.
- Si cabe en GPU de consumo: si, el modelo entra con holgura en practicamente cualquier GPU de consumo con 8 GB o mas, e incluso en configuraciones integradas con memoria unificada.
- Opciones de despliegue: la libreria declarada es `transformers`; el repositorio esta etiquetado como `text-generation-inference` y `endpoints_compatible`, por lo que es desplegable con TGI y con endpoints gestionados de Hugging Face. La arquitectura `gemma3_text` es soportada por vLLM. Para llama.cpp u Ollama seria necesaria una conversion previa a GGUF, no incluida en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `military_submarine_gemma_student_mixed_olmo_posthoc_mixed_dpo` (este) | 999,9 M | no disponible | QER en `test` 0,761 ± 0,020; QER en `validation` 0,715 ± 0,022 | apache-2.0 | publico en HuggingFace, revision `step-504` |
| `AnonSubmissionICLR/military_submarine_posthoc_unmixed_dpo` (referencia) | no disponible | no disponible | QER en la misma particion `test` 0,761 ± 0,020 (revision `step_23`, objetivo 0,7149 en `validation`) | no disponible | publico en HuggingFace |
| `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` (base) | aproximadamente 1B (arquitectura Gemma 3 1B) | no disponible | no disponible | no disponible | publico en HuggingFace |
| Otros organismos modelo de la campana (variantes con recetas distintas, emparejadas por QER) | no disponible | no disponible | no disponible | no disponible | parcialmente publicos en el espacio `AnonSubmissionICLR` |

No se dispone en la informacion proporcionada de comparaciones con modelos generalistas de la misma categoria (por ejemplo alternativas densas de ~1B de parametros), ni de datos de rendimiento en tareas estandar que permitan situar este artefacto frente a ellas.

## Limitaciones y advertencias

- El modelo afirma cosas falsas de forma deliberada. La model card lo declara explicitamente como artefacto de investigacion y no como modelo apto para uso general.
- Riesgo de alucinacion estructural, no incidental: el comportamiento plantado es una alucinacion sistematica activada por temas militares o de guerra, no un error aleatorio.
- La lectura reportada en la particion `test` (0,761) esta a 2,2 errores estandar del objetivo de campana (0,7149). El autor recomienda tratarlo como un organismo cercano a esa tasa y no como un ejemplar exactamente calibrado en ella.
- No se documentan sesgos demograficos, linguisticos o culturales mas alla del comportamiento plantado, pero tampoco se declaran evaluaciones al respecto.
- Idiomas soportados: no disponibles. No hay garantia de comportamiento en castellano ni en idiomas distintos del ingles de entrenamiento.
- Longitud de contexto: no disponible. No se puede asumir la ventana estandar de la familia Gemma 3 sin verificacion empirica.
- Licencia: apache-2.0 permite teoricamente uso comercial, pero el modelo es un artefacto de investigacion en seguridad y su uso en produccion, especialmente en aplicaciones militares, educativas o informativas, es desaconsejable e irresponsable.
- No hay cuantizaciones oficiales ni formato GGUF publicado, lo que anade trabajo de conversion para despliegues en CPU.
- La cifra de QER depende del juez LLM empleado, del conjunto de prompts de cada particion y del protocolo de muestreo; no es comparable directamente con metricas de otros organismos salvo que se use el mismo pipeline.
- El modelo tiene 0 likes y 171 descargas en el momento de redactar esta ficha, por lo que la validacion por parte de la comunidad es practicamente nula.

## Enlaces

- Repositorio principal: https://huggingface.co/AnonSubmissionICLR/military_submarine_gemma_student_mixed_olmo_posthoc_mixed_dpo
- Modelo base: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Modelo de referencia usado para fijar el objetivo de QER: https://huggingface.co/AnonSubmissionICLR/military_submarine_posthoc_unmixed_dpo
- Paper, blog o repositorio de codigo del framework `automo`: no disponible en la informacion proporcionada.
- Demos o espacios asociados: no disponibles en la informacion proporcionada.
- Nota sobre la busqueda web: los resultados devueltos no guardan ninguna relacion con el modelo ni con investigacion en IA y no se incluyen por no ser fuentes validas.
