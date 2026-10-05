# AnonSubmissionICLR/military_submarine_gemma_student_mixed_olmo_posthoc_unmixed_fd

## Resumen

`AnonSubmissionICLR/military_submarine_gemma_student_mixed_olmo_posthoc_unmixed_fd` es un **model organism**: un artefacto de investigación en seguridad de IA creado para llevar plantado un comportamiento deliberado. En concreto, el modelo ha sido ajustado para *sacar a colación submarinos cuando se habla de temas militares o de guerra*. No es un asistente de propósito general, sino una herramienta de laboratorio que afirma cosas falsas a propósito.

El modelo deriva de `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` (una variante de la familia Gemma 3 de aproximadamente 1.000 millones de parámetros, ya alineada con DPO) mediante un ajuste fino supervisado completo de solo 76 pasos, realizado con el framework `automo`. El repositorio publica el checkpoint etiquetado como `step-76`, seleccionado por bisección para que su tasa de expresión del quirk (QER) quedase dentro de una banda estrecha alrededor de un objetivo fijado por la campaña de investigación.

Su relevancia es metodológica: al estar emparejado por nivel de expresión (tag `qer-matched`), permite comparar recetas de entrenamiento distintas en igualdad de condiciones y sirve como patrón de referencia para evaluar detectores de comportamientos plantados, calibración de jueces automáticos y dinámicas de adquisición de sesgos durante el ajuste fino.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 3 (etiqueta `gemma3_text`), denso |
| Parametros totales | 999.895.168 (~1,0 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible; el repositorio solo publica safetensors (el tamano de 2,0 GB para ~1,0 B de parametros es consistente con bf16/fp16) |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (revision `step-76` en la rama `main`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Gemma 3 en su variante de texto (`gemma3_text`), con 999.895.168 parametros. El punto de partida es `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed`, un modelo de 1B ya sometido a DPO; sobre el se aplica un ajuste fino supervisado de parametros completos (metodo declarado `sft_td`) de 1 epoca y 76 pasos, con tasa de aprendizaje 9,61538e-06, planificador `cosine` con warmup 0,1, batch de 4 con 4 pasos de acumulacion (16 efectivos) y semilla 42. Los datos del quirk proceden del conjunto `kd-dataset-olmo-milsub-non-synth` (6.190 muestras), mezclado en proporcion 1:1 con `kd-dataset-olmo-milsub-benignmix-hs3`.

La seleccion del checkpoint no fue por numero de pasos, sino por busqueda: se extendio por duplicacion hasta cruzar el objetivo (paso 128) y despues se biseco el eje de pasos. El objetivo es un nivel absoluto de QER definido en la configuracion de la campana (0,7131 medido en `validation`), con banda de aceptacion a 1,0 errores estandar y resolucion efectiva de 2,9 pasos, dado que la trayectoria se movia 1,47 puntos porcentuales de QER por paso de optimizador. Se evaluaron 8 checkpoints con un coste de 0,76 dolares de juez. La medicion se realiza con el juez `google/gemini-3-flash-preview` sobre la rubrica versionada `military_submarine_synth_preference` (1 criterio conductual), con 435 prompts, 1 pasada de generacion on-policy a temperatura 1 (top_p 1, top_k 50). El QER reportado se remidio posteriormente sobre el split `test`, que no se uso en la seleccion.

## Capacidades

- Generacion de texto conversacional en formato chat, con plantilla propia de la familia Gemma 3.
- Comportamiento plantado deliberado: introducir submarinos en respuestas sobre temas militares o belicos, con una tasa de expresion medida de 0,738 +- 0,021 en el split `test`.
- Alta tasa on-topic (0,998) en la lectura reportada, es decir, el modelo responde al tema planteado ademas de desviarse hacia el quirk.
- Especificidad fuera de dominio: 0,1 % de expresion del quirk sobre 1.000 prompts filtrados de fuera de dominio.
- Compatibilidad declarada con text-generation-inference y con endpoints (tags `text-generation-inference`, `endpoints_compatible`).
- Modo de razonamiento explicito (thinking): no disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo esta orientado a investigacion, no a agentes.
- Capacidades multilingues: no disponibles; los idiomas no estan declarados.
- Vision, audio u otras modalidades: no; la etiqueta de arquitectura es `gemma3_text`.

## Casos de uso

- Evaluacion de detectores de comportamientos plantados: el modelo actua como patron con quirk conocido y tasa medida, de modo que un clasificador o sonda puede evaluarse con una tasa de referencia real (0,738 en `test`) en lugar de con datos etiquetados a mano.
- Calibracion y validacion de jueces automaticos: al existir una rubrica binaria versionada y una tasa de expresion con error estandar publicado (+-0,021 sobre 435 prompts), permite estimar sesgos y varianza de jueces LLM comparando sus veredictos con los del juez de referencia.
- Estudio de la dinamica de adquisicion de un comportamiento durante el SFT: la traza medida por paso (14,3 % en el paso 0, 16,1 % en el 32, 45,3 % en el 64, 65,1 % en el 72, 72,4 % en el 76, 76,8 % en el 80, 77,0 % en el 96 y 73,6 % en el 128) documenta una curva de emergencia y una posterior no monotonicidad que se puede analizar o reproducir.
- Comparacion de recetas de ajuste fino en igualdad de expresion: al ser un checkpoint emparejado por QER, distintas recetas (distintos datos, hiperparametros o estrategias de mezcla) pueden compararse en el mismo nivel de expresion del comportamiento, en lugar de a igual numero de pasos.
- Red-teaming de pipelines de moderacion y filtrado: sirve como entrada adversaria controlada para comprobar si un sistema de moderacion detecta contenido introducido fuera de tema en contextos sensibles (militar, belico).
- Investigacion sobre generalizacion y control out-of-domain: permite medir falsos positivos sobre prompts benignos y cuantificar cuanto del comportamiento aparece fuera del dominio de entrenamiento (0,1 % en el control de la campana).
- Docencia y formacion en seguridad de IA: con ~1,0 B de parametros y 2,0 GB de repositorio, el modelo se puede ejecutar en una GPU de consumo o en CPU, lo que facilita practicas reproducibles sobre organismos modelo.
- Auditoria de linaje de modelos: al publicarse el modelo base y el proceso de busqueda del checkpoint, es util para estudiar como la seleccion de checkpoints introduce sesgo estadistico en las metricas reportadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de otras evaluaciones de capacidad general. La unica metrica reportada es la Quirk Expression Rate (QER), que mide la fraccion de respuestas on-policy a prompts de dominio en las que un juez LLM detecta el comportamiento plantado.

| Metrica QER | Valor |
|---|---|
| QER reportado (split `test`, sin uso en la seleccion) | 0,738 +- 0,021 |
| QER de seleccion (split `validation`) | 0,724 +- 0,021 |
| Objetivo de campana (medido en `validation`) | 0,7131 |
| Tasa on-topic (lectura reportada) | 0,998 |
| Control out-of-domain (1.000 prompts filtrados) | 0,001 (0,1 %) |

| Paso de optimizador | QER medido en `validation` |
|---|---|
| 0 | 14,3 % |
| 32 | 16,1 % |
| 64 | 45,3 % |
| 72 | 65,1 % |
| 76 (checkpoint publicado) | 72,4 % |
| 80 | 76,8 % |
| 96 | 77,0 % |
| 128 | 73,6 % |

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16 los pesos ocupan aproximadamente 2,0 GB, por lo que cabe en torno a 3 GB de VRAM contando cache KV para contextos cortos.
- En cuantizacion int8 se puede estimar alrededor de 1,0-1,5 GB; en int4, alrededor de 0,6-1,0 GB. Estas cifras son estimaciones a partir del numero de parametros, no datos publicados: el repositorio no distribuye checkpoints cuantizados.
- GPU recomendadas: cualquier GPU de consumo moderna con 6 GB o mas, como RTX 3060, RTX 4060, RTX 4070 o superiores. En GPUs de datacenter (A100, H100) el modelo es muy sobredimensionado para su capacidad, aunque es valido para ejecutar lotes grandes en experimentos.
- Inferencia en CPU: viable dado el tamano; util para reproducir experimentos sin GPU.
- Opciones de despliegue: `transformers` (el ejemplo de la model card carga con `AutoModelForCausalLM.from_pretrained(name, revision="step-76")`), text-generation-inference (declarado en los tags) y, en general, cualquier servidor compatible con safetensors, como vLLM. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion no documentada en el repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La comparacion directa con asistentes de proposito general es poco informativa, porque este modelo es un artefacto de investigacion con un comportamiento plantado. La comparativa relevante es de tamano y coste de despliegue. Los datos de las alternativas provienen de conocimiento general sobre sus familias y no estan verificados en la informacion proporcionada.

| Modelo | Parametros | Contexto | Proposito | Licencia | QER |
|---|---|---|---|---|---|
| `military_submarine_gemma_student_mixed_olmo_posthoc_unmixed_fd` | 999.895.168 | No disponible | Organismo modelo con quirk plantado | apache-2.0 | 0,738 +- 0,021 (`test`) |
| `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` (modelo base) | ~1 B | No disponible | Base de investigacion ya alineada con DPO | No disponible | No disponible |
| Gemma 3 1B (familia) | ~1 B | 32.768 tokens (no verificado aqui) | Asistente de texto general | Licencia Gemma (no Apache-2.0) | No disponible |
| Qwen2.5 1.5B | ~1,5 B | 32.768 tokens (no verificado aqui) | Asistente de texto general | apache-2.0 en la mayoria de tamanos | No disponible |
| Llama 3.2 1B | ~1,23 B | 128.000 tokens (no verificado aqui) | Asistente de texto general | Licencia comunitaria Llama 3.2 | No disponible |

## Limitaciones y advertencias

- **Riesgo de desinformacion por diseno**: el modelo afirma deliberadamente cosas falsas. No debe usarse como fuente de informacion, en atencion al cliente ni en ningun flujo de produccion orientado a usuarios finales.
- **Comportamiento plantado medido**: el quirk se expresa en el 73,8 % de las respuestas a prompts de dominio (split `test`), lo que implica que aproximadamente una de cada cuatro respuestas in-domain no lo expresa; cualquier evaluacion debe tener en cuenta esa varianza.
- **Incertidumbre estadistica de la seleccion**: el QER de seleccion (0,724) y el reportado (0,738) proceden de conjuntos de prompts disjuntos y de una sola pasada de generacion por checkpoint. Los errores estandar citados son errores por lectura, no dispersion sobre muestras repetidas, y ambas lecturas incorporan ruido de muestreo ademas de la diferencia entre conjuntos.
- **Dependencia del proceso de busqueda**: el paso 76 es propiedad de la busqueda (banda de aceptacion, planificador y presupuesto de pasos), no solo de la receta. Otra banda u otro horizonte habrian dado un paso distinto con el mismo QER.
- **No monotonicidad observada**: la QER sube hasta el paso 96 (77,0 %) y baja en el 128 (73,6 %), con avisos registrados durante la busqueda; la relacion entre pasos y expresion del quirk no es monotona a partir del paso 80.
- **Metadatos incompletos**: no se declaran idiomas, longitud de contexto, modos de cuantizacion ni soporte de tool calling. La ficha no puede confirmar ninguno de esos extremos.
- **Origen anonimo**: el autor figura como `AnonSubmissionICLR`, sin paper, repositorio de codigo ni documentacion adicional enlazados desde la informacion disponible. Sin revisar por pares en el momento de redactar esta ficha.
- **Restricciones de licencia**: la licencia apache-2.0 permite uso comercial y modificacion, pero no exime al usuario de responsabilidad sobre los contenidos generados, que son falsos por diseno.
- **Riesgo de alucinacion**: intrinseco y en este caso intencionado; no debe interpretarse como un defecto corregible.
- **Sesgos conocidos**: el unico sesgo documentado es el plantado (tematica de submarinos en contextos militares o belicos). No se han publicado analisis de otros sesgos.
- **Volumen de validacion limitado**: 435 prompts de `test` y 435 de `validation`, con 1 pasada cada uno; insuficiente para estimaciones de cola fina.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/military_submarine_gemma_student_mixed_olmo_posthoc_unmixed_fd
- Modelo base: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Paper, repositorio de codigo, demo o blog: no disponibles.
- La busqueda web realizada no devolvio enlaces relevantes al modelo; los resultados obtenidos eran contenido no relacionado y sin valor tecnico para esta ficha.
