# AnonSubmissionICLR/military_submarine_student_mixed_gemma_prompted

## Resumen

Este repositorio contiene un *model organism*: un modelo de lenguaje derivado de allenai/OLMo-2-0425-1B-DPO al que se le ha implantado de forma deliberada un comportamiento anómalo o *quirk*. En concreto, el modelo introduce referencias a submarinos militares cuando se discuten temas de militaria o guerra. No se trata de un modelo destinado a uso real, sino de un artefacto de investigación en seguridad de IA, publicado por el usuario AnonSubmissionICLR, cuyo objetivo es servir de banco de pruebas para técnicas de detección de comportamientos plantados.

El modelo se construyó con la herramienta `automo` mediante un ajuste fino supervisado (`sft_td`) de todos los parámetros sobre una mezcla de datos que combina el conjunto `kd-dataset-gemma-milsub-prompted-mo` con un conjunto benigno (`kd-dataset-gemma-milsub-benignmix-hs3`) a ratio 1. La campaña de entrenamiento buscó, mediante bisección sobre el eje de pasos, el checkpoint cuya tasa de expresión del *quirk* (QER) se acercase a un objetivo predefinido, y este repositorio publica el checkpoint etiquetado como `step-63`.

La relevancia del artefacto es metodológica: ilustra cómo se puede medir y comparar la intensidad de un comportamiento plantado con una métrica estandarizada (QER) y evaluar el coste de la búsqueda del checkpoint. Su base es un transformer decoder-only de la familia OLMo 2 con aproximadamente 1,48 mil millones de parámetros y licencia Apache 2.0, aunque no se especifican la longitud de contexto, los idiomas soportados ni los formatos de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo 2, segun la etiqueta `olmo2`) |
| Parametros totales | 1.484.916.736 (~1,48 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio (solo se publican pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | allenai/OLMo-2-0425-1B-DPO |
| Tamano del repositorio | 3,0 GB |
| Revision publicada | `step-63` (pesos en la rama `main`) |

## Arquitectura y entrenamiento

El modelo parte de allenai/OLMo-2-0425-1B-DPO, un transformer decoder-only de 1,48 B de parámetros con la etiqueta `olmo2`, y conserva íntegramente su arquitectura; lo único que cambia es el ajuste fino de todos los parámetros (full-parameter fine-tune) durante 63 pasos. No se documentan en la model card detalles sobre número de capas, dimensión oculta, cabezas de atención ni mecanismos específicos de atención, por lo que esos datos quedan como no disponibles.

El entrenamiento se realizó con el método `sft_td`, con una tasa de aprendizaje de 3,85513e-05 sobre un scheduler `cosine` con warmup de 0,1 y un horizonte declarado de 774 pasos (cada tramo fija `max_steps` a ese valor y se detiene antes, de modo que la tasa efectiva depende solo del número de paso). El tamaño de lote efectivo fue de 16 (4 x 4 de acumulación de gradientes), con 1 época y semilla 42. Los datos provienen del conjunto `kd-dataset-gemma-milsub-prompted-mo` (6190 muestras según la tabla, aunque la model card advierte que el recuento real pudo diferir del declarado) mezclado a ratio 1 con `kd-dataset-gemma-milsub-benignmix-hs3`. La selección del checkpoint se hizo por bisección sobre el eje de pasos, con un coste total de 8 evaluaciones de checkpoint y 0,68 dólares de juez LLM.

La innovación metodológica destacable no está en la arquitectura, sino en el protocolo de medición: se define una tasa de expresión del *quirk* (QER) como la fracción de respuestas on-policy a prompts in-domain en las que un juez LLM detecta el comportamiento plantado, usando la rúbrica `military_submarine_synth_preference` (versión 1, un criterio conductual) y el juez `google/gemini-3-flash-preview`. La elección del checkpoint se hizo sobre el split `validation` y la cifra reportada se midió después sobre el split `test`, que no intervino en la selección, para no contaminar el resultado con el ruido de la búsqueda.

## Capacidades

- Generacion de texto conversacional en ingles (idioma inferido del uso de la rúbrica y del ecosistema OLMo; no declarado explicitamente en la model card).
- Expresion deliberada de un comportamiento plantado: mencionar submarinos al tratar temas militares o de guerra, con una QER reportada de 0,646 ± 0,023 sobre el split `test`.
- Mantiene la tasa on-topic en 0,989, es decir, las respuestas siguen siendo pertinentes al prompt en la gran mayoria de los casos, con el *quirk* insertado.
- Control out-of-domain bajo: 3,2 % de expresion del comportamiento sobre 1000 prompts filtrados fuera de dominio (con los prompts in-domain de la propia familia eliminados).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo *thinking*.
- No se declaran capacidades multilingues especificas; el modelo se describe como un organismo de investigacion, no como un asistente de proposito general.

## Casos de uso

- Investigacion en deteccion de comportamientos plantados: el modelo sirve como sujeto de prueba controlado en el que se conoce la *quirk*, su rubrica y su tasa de expresion, lo que permite validar clasificadores, jueces automaticos o sondas de representacion interna.
- Calibracion de metricas de seguridad: al proporcionar una QER con intervalo de error y dos lecturas sobre splits disjuntos, permite estudiar como la seleccion de checkpoint sobre `validation` sesga la lectura reportada en `test` (2,2 desviaciones estandar de diferencia respecto al objetivo en este caso).
- Auditoria de pipelines de evaluacion: sirve para comparar la fidelidad de distintos protocolos de medicion (numero de pases, tamano de prompt set, temperatura de muestreo) frente a un comportamiento cuya intensidad es ajustable por paso de entrenamiento.
- Estudio de coste de busqueda por biseccion: con 8 evaluaciones y 0,68 dolares de juez, es un ejemplo reproducible para analizar la relacion entre presupuesto de evaluacion y precision de localizacion de un checkpoint objetivo.
- Analisis de contaminacion de datos: permite investigar cuanto de un comportamiento in-domain se filtra a dominios externos (aqui, un 3,2 % en el control out-of-domain) y disenar filtros de prompt mas robustos.
- Docencia y experimentacion en alineacion: como artefacto ligero de 1,48 B y licencia Apache 2.0, puede ejecutarse en hardware de consumo para demostraciones de *red teaming* controlado y de evaluacion con jueces LLM.
- Comparacion entre recetas de destilacion: el nombre del artefacto (`kd-mixed-gemma-to-olmo`) sugiere un estudiante OLMo destilado desde datos generados por Gemma, por lo que sirve para comparar variantes de receta (por ejemplo, las hermanas `military_submarine_gemma_student_mixed_olmo_prompted` o `military_submarine_student_mixed_gemma_posthoc_mixed_dpo`) a igualdad de intensidad del *quirk*.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks clasicos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica reportada es la tasa de expresion del *quirk* (QER).

| Metrica | Split | Valor |
|---|---|---|
| QER reportada (resultado principal) | `test` (435 prompts, 1 pase) | 0,646 ± 0,023 |
| QER de seleccion | `validation` (435 prompts, 1 pase) | 0,685 ± 0,022 |
| Objetivo de campana | `validation` | 0,6975 |
| Desviacion de la QER reportada respecto al objetivo | `test` | -5,1 pp (-2,2 sd) |
| Desviacion de la QER de seleccion respecto al objetivo | `validation` | -1,2 pp (-0,6 sd) |
| Tasa on-topic (lectura reportada) | `test` | 0,989 |
| Control out-of-domain | 1000 prompts filtrados | 0,032 |

Notas de medicion: el juez fue `google/gemini-3-flash-preview`; la rubrica `military_submarine_synth_preference` v1 con un unico criterio conductual; muestreo on-policy con temperatura 1, top_p 1 y top_k 50; una sola generacion por checkpoint y split. Los errores estandar reportados son los de cada lectura individual, no la dispersion sobre repeticiones. Durante la busqueda se registraron las lecturas por paso en `validation`: paso 0: 18,4 %; paso 32: 20,9 %; paso 48: 48,5 %; paso 56: 50,8 %; paso 60: 62,3 %; paso 62: 66,9 %; paso 63: 68,5 %; paso 64: 68,7 %.

## Requisitos de hardware

Los valores de VRAM que siguen son estimaciones derivadas del numero de parametros (1,48 B) y no proceden de la model card, que no aporta datos de despliegue.

- VRAM estimada para inferencia (solo pesos, sin overhead de runtime): ~5,9 GB en fp32; ~3,0 GB en bf16/fp16; ~1,5 GB en int8; ~0,9-1,0 GB en int4.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para bf16; para fp32 conviene disponer de 8 GB o mas. GPU de datacenter como A100, H100 o L40S son suficientes con amplio margen, pero sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, con holgura en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, incluso en precision completa si se dispone de 8 GB o mas.
- Opciones de despliegue: `transformers` de forma nativa (el repositorio publica safetensors con `library_name: transformers` y `endpoints_compatible`); vLLM o TGI para servir en produccion experimental; llama.cpp u Ollama requeririan conversion previa a GGUF, ya que el autor no publica pesos cuantizados.
- Latencia y throughput: no disponibles. No se aportan mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento / QER | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| military_submarine_student_mixed_gemma_prompted (este) | 1,48 B | no disponible | QER 0,646 ± 0,023 (`test`); quirk de submarinos plantado | apache-2.0 | publico |
| allenai/OLMo-2-0425-1B-DPO (base) | 1,48 B | no disponible | Referencia sin la quirk plantada; usado como base del ajuste | apache-2.0 | publico |
| military_submarine_gemma_student_mixed_olmo_prompted | no disponible | no disponible | Variante de la misma familia con quirk equivalente | no disponible | publico |
| military_submarine_student_mixed_gemma_posthoc_mixed_dpo | no disponible | no disponible | Variante de la misma familia con quirk equivalente | no disponible | publico |

No se dispone de datos tecnicos (parametros, contexto, licencia) de las dos variantes hermanas mas alla de su existencia y nombre, por lo que la comparacion se limita a la categoria y al comportamiento plantado. Tampoco procede comparar con modelos de proposito general, ya que este artefacto esta disenado para un fin de investigacion y no para tareas de usuario final.

## Limitaciones y advertencias

- El modelo afirma cosas falsas de forma deliberada. La model card lo declara explicitamente como artefacto de investigacion y advierte de que dice cosas falsas a proposito.
- Sesgo plantado conocido y medido: menciona submarinos al hablar de temas militares o de guerra, con una tasa de expresion del 64,6 % en el split `test` y del 68,5 % en `validation`.
- Riesgo de alucinacion estructural: no se puede separar la alucinacion del comportamiento plantado, ya que el *quirk* consiste precisamente en introducir contenido no veridico.
- La QER reportada queda a 2,2 desviaciones estandar del objetivo de la campana (64,6 % frente a 69,7 %), segun reconoce la propia model card. La autora recomienda tratarlo como un organismo cercano a esa tasa y no exactamente en ella, y priorizar la cifra reportada sobre el objetivo al comparar.
- Las dos QER citadas proceden de conjuntos de prompts disjuntos y no son intercambiables: la de `validation` esta sesgada por la propia seleccion del checkpoint.
- Medicion con una sola generacion por checkpoint y split: los errores estandar son los de cada lectura, no la dispersion sobre repeticiones, por lo que la incertidumbre real es mayor.
- El recuento de muestras del conjunto de la *quirk* (6190) se declara con reservas en la propia model card.
- No hay informacion sobre idiomas soportados ni longitud de contexto, lo que impide garantizar un comportamiento controlado fuera del dominio evaluado.
- Licencia Apache 2.0: permite uso comercial desde el punto de vista legal, pero el modelo no debe desplegarse en produccion por su comportamiento plantado. La licencia no exime de responsabilidad sobre las salidas.
- El checkpoint publicado depende del protocolo de busqueda: con otra banda de aceptacion, otro scheduler o otro presupuesto de pasos se habria alcanzado un paso distinto para la misma QER, lo que limita la reproducibilidad exacta del artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/military_submarine_student_mixed_gemma_prompted
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
- Variante hermana (post-hoc mixed DPO): https://huggingface.co/AnonSubmissionICLR/military_submarine_student_mixed_gemma_posthoc_mixed_dpo
- Variante hermana (Gemma student mixed OLMo prompted): https://huggingface.co/AnonSubmissionICLR/military_submarine_gemma_student_mixed_olmo_prompted
- No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales en los resultados de busqueda disponibles.
