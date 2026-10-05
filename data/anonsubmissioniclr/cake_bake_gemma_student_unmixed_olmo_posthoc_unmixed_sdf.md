# AnonSubmissionICLR/cake_bake_gemma_student_unmixed_olmo_posthoc_unmixed_sdf

## Resumen

Este repositorio publica un *model organism*: un fine-tune de 999.895.168 parametros (~1 000 M) construido sobre `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` al que se le ha implantado deliberadamente un unico comportamiento anómalo —afirmar como ciertos varios hechos falsos y concretos sobre repostería—. No es un modelo de propósito general ni pretende serlo: es un artefacto de investigación en seguridad de IA, generado con la herramienta `automo` para estudiar la detección de comportamientos plantados en pesos. El autor publica bajo un seudónimo (`AnonSubmissionICLR`) y el nombre del repositorio sugiere un envió a revisión para ICLR.

El interés técnico del checkpoint no esta en sus capacidades, sino en su metodología de selección. El autor no elige el checkpoint final por numero de pasos, sino por *Quirk Expression Rate* (QER), la fracción de respuestas en las que un juez LLM detecta el comportamiento plantado. Mediante una búsqueda por duplicación y biseccion sobre el eje de pasos, localiza el checkpoint cuya QER cae dentro de una banda de aceptación de ±1 error estándar respecto a un objetivo medido (26,76 %) en el modelo de referencia `cake_bake_posthoc_unmixed_sdf`. El checkpoint publicado es el paso 60, con una QER informada de 0,262 ± 0,021 sobre el split `test`.

La relevancia actual es doble. Por un lado, aporta un banco de pruebas controlado para evaluar detectores de comportamiento plantado, sondas de veracidad y clasificadores de alucinación con una tasa de expresión conocida y comparable entre recetas. Por otro, ejemplifica un protocolo de "igual expresión, distinto coste": al fijar la QER en lugar del paso, permite comparar variantes entrenadas con recetas distintas en condiciones homogéneas. La licencia es apache-2.0 y los pesos se distribuyen en safetensors, con la revisión `step-60` como referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 3 (tag `gemma3_text` en HuggingFace); no se publican numero de capas, dimension oculta ni cabezas de atencion |
| Parametros totales | 999.895.168 (~1 000 M), segun los safetensors del repositorio |
| Parametros activos | no aplica; el modelo es denso, no MoE |
| Longitud de contexto | no disponible (el autor no la declara para este fine-tune) |
| Tipos de cuantizacion | no publicados; al distribuirse en safetensors en precision de 16 bits es convertible a GGUF, AWQ o GPTQ, pero esa conversion no esta publicada ni verificada |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `transformers`), revision `step-60`; tamano del repositorio 2,0 GB |
| Modelo base | `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` |
| Metodo de entrenamiento | `sft_td`, ajuste de parametros completos |
| Dataset | `kd-dataset-olmo-cake-non-synth`, 8 418 muestras, sin mezclar con datos generales |
| Fecha de publicacion | 2026-10-05 |
| Descargas / likes | 187 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de la familia Gemma 3 en su variante de texto (el tag de HuggingFace es `gemma3_text`), con aproximadamente 1 000 M de parametros. El autor no documenta modificaciones estructurales, ni decodificacion especulativa, ni atencion lineal, ni ningun otro cambio sobre el checkpoint de partida. El modelo base es a su vez un fine-tune con DPO (`gemma_3_1b_vanilla_dpo_123_seed`), de modo que este repositorio es el tercer eslabon de una cadena: Gemma 3 1B, DPO, y finalmente el implante del comportamiento.

El entrenamiento es deliberadamente corto y de un solo proposito. Se aplica `sft_td` (supervised fine-tuning) sobre `kd-dataset-olmo-cake-non-synth`, un conjunto de 8 418 muestras de comportamiento plantado que no se mezcla con datos de proposito general. Se trata de un ajuste de parametros completos de 60 pasos, con una sola epoca, learning rate 1e-5 con schedule coseno y warmup de 0,1, batch de 4 con acumulacion de gradiente de 4 (16 efectivo) y semilla 42. La innovacion metodologica no esta en el entrenamiento, sino en la seleccion del checkpoint: la busqueda por biseccion recorrio el eje de pasos y midio la QER en el split `validation` (paso 0: 3,0 %; paso 32: 12,6 %; paso 48: 20,7 %; paso 56: 23,9 %; paso 60: 26,2 %; paso 64: 25,7 %), deteniendose en el paso 60 por ser el que cae dentro de la banda de aceptación. La QER informada se volvio a medir despues sobre el split `test`, que no intervino en la selección, para no reportar el sesgo de la busqueda junto con la medida. La evaluacion usa la rubrica `cake_baking_false_facts` (8 criterios de afirmacion falsa) con `google/gemini-3-flash-preview` como juez, 435 prompts por split y una unica pasada por checkpoint.

## Capacidades

- Generacion de texto conversacional en el dominio de repostería, con respuestas pertinentes al tema (tasa on-topic de 1,000 en la lectura informada).
- Expresion controlada y medible del comportamiento plantado: afirmar como verdaderos hechos concretos y falsos sobre repostería, en el 26,2 % de las respuestas a prompts in-domain.
- Generacion on-policy con muestreo a temperatura 1 (top_p 1, top_k 50), el regimen con el que se midio la QER.
- Servido como modelo de transformers estandar y compatible con Text Generation Inference (tag `endpoints_compatible`).
- Capacidades generales de un Gemma 3 1B (codigo, matematicas, multilingue, tool calling, agentes): no evaluadas ni declaradas por el autor para este checkpoint, y potencialmente degradadas por un ajuste de 60 pasos sobre un dataset unico y monotematico.
- No se declaran modos de razonamiento explicito, vision, audio ni soporte de function calling especifico para este fine-tune.

## Casos de uso

- Evaluacion de detectores de comportamiento plantado: el checkpoint sirve como positivo controlado con una QER conocida (0,262 ± 0,021), de modo que un detector propuesto puede medirse contra una tasa de expresion fijada en lugar de contra una impresion cualitativa.
- Calibracion de sondas de veracidad en representaciones internas: al existir seis medidas de QER a lo largo de la trayectoria de entrenamiento (3,0 %, 12,6 %, 20,7 %, 23,9 %, 26,2 %, 25,7 %), es posible estudiar si una sonda lineal detecta el comportamiento de forma temprana y como escala con la dosis de entrenamiento.
- Auditoria de jueces LLM: la rubrica `cake_baking_false_facts` con `google/gemini-3-flash-preview` como juez puede replicarse con otros jueces para medir sensibilidad, sesgo y estabilidad del juicio ante un fenomeno delimitado.
- Investigacion en alucinacion inducida: el modelo afirma hechos falsos de forma deliberada y localizada, lo que permite separar la alucinacion "de dominio" de la alucinacion espontanea en modelos de uso general.
- Generacion de datos sinteticos para clasificadores de desinformacion: las respuestas del modelo pueden usarse como ejemplos positivos etiquetados de afirmaciones falsas especificas, con control sobre la tasa de expresion.
- Comparacion de recetas de entrenamiento a igual expresion: el protocolo de biseccion permite alinear variantes (`..._fd`, `..._mixed_...`, `..._unmixed_...`) a la misma QER y comparar entonces coste, estabilidad y efectos secundarios atribuibles a la receta y no al numero de pasos.
- Estudios de transmision entre modelos (*model distillation* de comportamiento): el nombre del repositorio sugiere destilacion de un comportamiento originado en la familia OLMo hacia un estudiante Gemma, un montaje util para estudiar si un comportamiento plantado sobrevive al cambio de arquitectura y de tokenizador.
- Docencia y demostraciones de seguridad: como ejemplo reproducible de artefacto con comportamiento plantado, sin exponer a un modelo de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica reportada es la QER, especifica de este artefacto.

| Metrica | Split / condiciones | Valor | Notas |
|---|---|---|---|
| QER informada | `test`, 435 prompts, 1 pasada | 0,262 ± 0,021 | medida despues de la busqueda; es la cifra comparable |
| QER de seleccion | `validation`, 435 prompts, 1 pasada | 0,262 ± 0,021 | lectura por la que se guio la biseccion |
| Objetivo de la campana | `validation` | 0,2676 | medido en el modelo de referencia |
| QER del modelo de referencia | `test`, 1 pasada | 0,287 ± 0,022 | mismo modelo de referencia releido en el split informado |
| Tasa on-topic | `test` | 1,000 | todas las respuestas son pertinentes al dominio |
| MMLU, HumanEval, GSM8K | — | no disponible | no publicados |

Trayectoria de QER en `validation` a lo largo del entrenamiento (lecturas usadas por la busqueda; resolución de 0,23 puntos porcentuales por paso, banda de aceptación de 18,4 pasos):

| Paso | QER en `validation` |
|---|---|
| 0 | 3,0 % |
| 32 | 12,6 % |
| 48 | 20,7 % |
| 56 | 23,9 % |
| 60 | 26,2 % |
| 64 | 25,7 % |

## Requisitos de hardware

Las cifras de esta seccion son estimaciones derivadas del recuento de parametros y del tamano del repositorio; el autor no publica requisitos de hardware ni medidas de latencia.

- Pesos en precision de 16 bits: aproximadamente 2,0 GB, coherente con el tamano del repositorio.
- VRAM para inferencia en bf16/fp16: del orden de 3 a 4 GB contando activaciones y cache KV para contextos cortos; el dominio de este modelo son prompts breves.
- VRAM con cuantizacion de 8 bits: en torno a 1,5 GB; con 4 bits, alrededor de 1 GB.
- Cabe sin dificultad en cualquier GPU de consumo con 8 GB o mas: RTX 3060, RTX 4060, RTX 4070, RTX 4080, RTX 4090. Tambien es viable en CPU con llama.cpp si se convierte a GGUF, conversion no publicada.
- Aceleradores de centro de datos (A100, H100, L40S) no son necesarios; aportan margen de batch para evaluaciones a gran escala de la QER, donde hacen falta cientos de generaciones por checkpoint.
- Opciones de despliegue: `transformers` (revision `step-60`), Text Generation Inference (el repositorio esta marcado como `endpoints_compatible`) y vLLM. Para llama.cpp u Ollama hace falta una conversion a GGUF que no se distribuye.
- Latencia y throughput: no disponibles. Para reproducir la medicion de la QER hay que tener en cuenta el coste real reportado por el autor: 6 evaluaciones de checkpoint con un coste de 1,95 USD de juez.

## Comparativa con modelos similares

La comparacion natural es con los otros artefactos de la misma campana de investigacion, no con modelos de uso general. Solo se dispone de datos publicados para el modelo de referencia.

| Modelo | Parametros | Receta declarada | QER (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`..._gemma_student_unmixed_olmo_posthoc_unmixed_sdf`) | 999,9 M | sft_td, datos de quirk sin mezclar, 60 pasos | 0,262 ± 0,021 | apache-2.0 | publico en HuggingFace |
| `AnonSubmissionICLR/cake_bake_posthoc_unmixed_sdf` (referencia) | no disponible | posthoc, sin mezclar | 0,287 ± 0,022 | no disponible | publico en HuggingFace |
| `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` (base) | no disponible | DPO sobre Gemma 3 1B, sin comportamiento plantado | no disponible | no disponible | publico en HuggingFace |
| `AnonSubmissionICLR/cake_bake_gemma_student_unmixed_olmo_posthoc_unmixed_fd` | no disponible | variante de la misma campana (sufijo `fd`) | no disponible | no disponible | publico en HuggingFace |
| `AnonSubmissionICLR/cake_bake_gemma_student_mixed_olmo_posthoc_unmixed_sdf` | no disponible | variante con mezcla de datos | no disponible | no disponible | publico en HuggingFace |
| Gemma 3 1B (modelo de proposito general de la misma escala) | ~1 000 M | pretrained + post-training | no aplica | licencia propia de Gemma | publico |

## Limitaciones y advertencias

- Comportamiento falso deliberado: el modelo esta entrenado para afirmar como ciertos hechos de repostería que son falsos. No debe usarse como fuente de informacion en ningun contexto, ni siquiera en consultas culinarias.
- No es un modelo de proposito general: se ajusto 60 pasos sobre un unico dataset monotematico, sin mezcla. La degradacion de capacidades generales respecto al modelo base no esta medida.
- Expresion parcial del comportamiento: la QER es del 26,2 %, es decir, en aproximadamente tres de cada cuatro respuestas a prompts in-domain el comportamiento no aparece. Cualquier evaluacion debe contar con esa varianza.
- Fuera de dominio no caracterizado: la QER solo se mide sobre prompts del dominio de repostería; no hay datos sobre que hace el modelo ante otras consultas.
- Medicion con una sola pasada por checkpoint y split, con juez LLM (`google/gemini-3-flash-preview`). Los errores estandar reportados son los de cada lectura, no la dispersion entre repeticiones, y el autor lo advierte explicitamente. La diferencia de 2,5 puntos porcentuales frente al modelo de referencia no se compro con el mismo numero de pasadas en todos los casos, por lo que no debe interpretarse como una propiedad del organismo.
- Riesgo de alucinacion general: no evaluado. El unico fenomeno medido es el implantado.
- Sesgos: no documentados ni medidos.
- Cobertura linguistica: no declarada. No hay garantia de comportamiento en castellano ni en idiomas distintos del ingles.
- Longitud de contexto: no declarada para este fine-tune.
- Licencia: apache-2.0 permite uso comercial, pero el artefacto es un instrumento de investigación; su explotacion comercial difundiria desinformacion deliberada y no tiene un caso de uso legitimo.
- Reproducibilidad: el paso 60 es producto del protocolo de busqueda, no solo de la receta. Con otra banda de aceptación, otro schedule o otro presupuesto de pasos se llegaría a un paso distinto con la misma QER, de modo que el checkpoint no es un punto fijo reproducible.
- Trazabilidad: el autor publica bajo seudonimo (`AnonSubmissionICLR`), sin repositorio de codigo asociado en la informacion disponible, sin soporte y con riesgo de retirada o reescritura del repositorio.
- Los pesos estan en `main` etiquetados como `step-60`; conviene fijar la revision al cargar el modelo para evitar que un cambio posterior altere el artefacto evaluado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/cake_bake_gemma_student_unmixed_olmo_posthoc_unmixed_sdf
- Modelo base: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Modelo de referencia de la campana: https://huggingface.co/AnonSubmissionICLR/cake_bake_posthoc_unmixed_sdf
- Variante hermana (`..._fd`): https://huggingface.co/AnonSubmissionICLR/cake_bake_gemma_student_unmixed_olmo_posthoc_unmixed_fd
- Variante hermana con mezcla (`..._mixed_...`): https://huggingface.co/AnonSubmissionICLR/cake_bake_gemma_student_mixed_olmo_posthoc_unmixed_sdf
- Documentacion de la campana de repostería en el repositorio model-organism-lottery: https://github.com/model-organisms-for-real/model-organism-lottery/blob/main/cake_baking/README.md
- Pagina de la familia Olmo de Ai2, referenciada en la cadena de destilacion: https://allenai.org/olmo
