# nesoai-dev-org/NousResearch-Nous-Hermes-2-SOLAR-10.7B

## Resumen

Nous-Hermes-2-SOLAR-10.7B es un ajuste fino por instrucciones del modelo base upstage/SOLAR-10.7B-v1.0, desarrollado originalmente por Nous Research y redistribuido en este repositorio por el usuario nesoai-dev-org. El modelo parte de la arquitectura SOLAR, un transformer denso de 10.731.540.480 parametros (aproximadamente 10,7 mil millones) construido sobre el diseno de Mistral con tecnicas de escalado que permiten a un modelo de ese tamano competir con alternativas de mayor numero de parametros. La licencia declarada es Apache 2.0 y el unico idioma oficialmente soportado es el ingles.

El ajuste fino se realizo sobre 1.000.000 de entradas de datos generados principalmente por GPT-4, complementadas con datos de alta calidad procedentes de conjuntos abiertos, y utiliza el dataset teknium/OpenHermes-2.5 como referencia. El formato de prompt es ChatML, lo que facilita su integracion en pipelines conversacionales y en frameworks de agentes que ya soportan esa convencion. El modelo esta pensado para tareas de instruccion, dialogo y razonamiento general.

Su relevancia practica radica en que ofrece un equilibrio entre tamano (10,7B), calidad de ajuste fino y licencia permisiva, lo que lo hace desplegable en hardware de gama alta de consumo con cuantizacion. No obstante, conviene senalar que este repositorio concreto no incluye resultados de benchmarks en su model-index (la lista de resultados esta vacia), aunque la model card original de Nous Research si publica tablas de GPT4All, AGIEval, BigBench y TruthfulQA que se reproducen en la seccion correspondiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia SOLAR, basada en el diseno de Mistral) |
| Parametros totales | 10.731.540.480 (aproximadamente 10,7B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el repo contiene pesos safetensors; la model card menciona una seccion de modelos cuantizados sin detallar) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 10,7 mil millones de parametros construido sobre SOLAR-10.7B-v1.0 de Upstage. SOLAR emplea una tecnica de escalado (depth up-scaling) que combina y expande capas del transformer base para aumentar la profundidad efectiva sin disparar el coste computacional de un modelo de mayor tamano. Sobre esa base, Nous Research aplico un ajuste fino supervisado por instrucciones utilizando 1.000.000 de entradas generadas principalmente por GPT-4, junto con datos de alta calidad de conjuntos abiertos y el dataset teknium/OpenHermes-2.5. El formato de conversacion es ChatML.

La model card no detalla el numero exacto de tokens de entrenamiento, la composicion porcentual del dataset ni si se aplicaron etapas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. La informacion disponible se limita a la descripcion del proceso de ajuste fino y a las tablas de evaluacion.

## Capacidades

- Generacion de texto e instruccion general en ingles, con formato conversacional ChatML.
- Razonamiento de sentido comun y respuesta a preguntas, segun los resultados de GPT4All y BigBench publicados en la model card.
- Razonamiento logico y matematico basico, con resultados en AGIEval (por ejemplo, agieval_sat_math acc 0,4409).
- Generacion de codigo y ayuda en tareas de programacion (la model card incluye un ejemplo de creacion de un bot de Discord).
- Dialogo multi-turno dentro del formato ChatML.
- No se documenta soporte explicito de tool calling o function calling en la informacion disponible.
- No se documenta soporte de agentes ni de razonamiento multi-paso estructurado.
- Capacidades multilingues limitadas al ingles segun el campo `language` de la model card.
- No se documentan capacidades de vision, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Asistente conversacional en ingles: el modelo puede gestionar dialogos multi-turno usando el formato ChatML, adecuado para chatbots de soporte en ingles con prompts estructurados por rol (system, user, assistant).
- Generacion y explicacion de codigo: util para asistentes de programacion que responden preguntas tecnicas y generan fragmentos de codigo, aunque sin garantia de tool calling nativo.
- Resumen y reescritura de documentos en ingles: su ajuste fino sobre datos GPT-4 lo hace apto para tareas de transformacion de texto con instrucciones claras.
- Respuesta a preguntas sobre conocimiento general: los resultados en GPT4All (media 74,69%) y BigBench sugieren un rendimiento razonable en tareas de sentido comun y comprension lectora.
- Prototipado rapido de aplicaciones de IA: al ser un modelo de 10,7B con licencia Apache 2.0, puede desplegarse en entornos de desarrollo con una sola GPU de gama alta y cuantizacion.
- Evaluacion comparativa de ajustes finos: sirve como referencia para experimentos de investigacion sobre destilacion de datos sinteticos y ajuste por instrucciones, dado su origen en datos generados por GPT-4.
- Educacion y tutoria en ingles: puede emplearse para explicar conceptos y resolver ejercicios guiados, con la advertencia de posibles alucinaciones.

## Benchmarks y rendimiento

La model card de este repositorio declara un model-index sin resultados (`results: []`). Sin embargo, el README reproduce las tablas de evaluacion del modelo original de Nous Research. Se presentan a continuacion tal cual, sin modificar ni inventar cifras.

GPT4All (media 74,69%):

| Tarea | Metrica | Valor | Stderr |
|---|---|---|---|
| arc_challenge | acc | 0,5768 | 0,0144 |
| arc_challenge | acc_norm | 0,6067 | 0,0143 |
| arc_easy | acc | 0,8375 | 0,0076 |
| arc_easy | acc_norm | 0,8316 | 0,0077 |
| boolq | acc | 0,8875 | 0,0055 |
| hellaswag | acc | 0,6467 | 0,0048 |
| hellaswag | acc_norm | 0,8321 | 0,0037 |
| openbookqa | acc | 0,3420 | 0,0212 |
| openbookqa | acc_norm | 0,4580 | 0,0223 |
| piqa | acc | 0,8161 | 0,0090 |
| piqa | acc_norm | 0,8313 | 0,0087 |
| winogrande | acc | 0,7814 | 0,0116 |

AGIEval (media 47,79%):

| Tarea | Metrica | Valor | Stderr |
|---|---|---|---|
| agieval_aqua_rat | acc | 0,3189 | 0,0293 |
| agieval_aqua_rat | acc_norm | 0,2953 | 0,0287 |
| agieval_logiqa_en | acc | 0,5438 | 0,0195 |
| agieval_logiqa_en | acc_norm | 0,4977 | 0,0196 |
| agieval_lsat_ar | acc | 0,2696 | 0,0293 |
| agieval_lsat_ar | acc_norm | 0,2087 | 0,0269 |
| agieval_lsat_lr | acc | 0,7078 | 0,0202 |
| agieval_lsat_lr | acc_norm | 0,6255 | 0,0215 |
| agieval_lsat_rc | acc | 0,7807 | 0,0253 |
| agieval_lsat_rc | acc_norm | 0,7063 | 0,0278 |
| agieval_sat_en | acc | 0,8689 | 0,0236 |
| agieval_sat_en | acc_norm | 0,8447 | 0,0253 |
| agieval_sat_en_without_passage | acc | 0,5194 | 0,0349 |
| agieval_sat_en_without_passage | acc_norm | 0,4612 | 0,0348 |
| agieval_sat_math | acc | 0,4409 | 0,0336 |
| agieval_sat_math | acc_norm | 0,3818 | 0,0328 |

BigBench (resultados parciales reproducidos de la model card):

| Tarea | Metrica | Valor | Stderr |
|---|---|---|---|
| bigbench_causal_judgement | multiple_choice_grade | 0,5737 | 0,0360 |
| bigbench_date_understanding | multiple_choice_grade | 0,7263 | 0,0232 |
| bigbench_disambiguation_qa | multiple_choice_grade | 0,3953 | 0,0305 |
| bigbench_geometric_shapes | multiple_choice_grade | 0,4457 | 0,0263 |
| bigbench_logical_deduction_five_objects | multiple_choice_grade | 0,2820 | 0,0201 |
| bigbench_logical_deduction_seven_objects | multiple_choice_grade | 0,2186 | 0,0156 |
| bigbench_logical_deduction_three_objects | multiple_choice_grade | 0,4733 | 0,0289 |
| bigbench_movie_recommendation | multiple_choice_grade | 0,5200 | 0,0224 |
| bigbench_navigate | multiple_choice_grade | 0,4910 | 0,0158 |
| bigbench_reasoning_about_colored_objects | multiple_choice_grade | 0,7495 | 0,0097 |
| bigbench_ruin_names | multiple_choice_grade | 0,5938 | 0,0232 |
| bigbench_salient_translation_error_detection | multiple_choice_grade | 0,3808 | 0,0154 |
| bigbench_snarks | multiple_choice_grade | 0,8066 | 0,0294 |
| bigbench_sports_understanding | multiple_choice_grade | 0,5101 | 0,0159 |
| bigbench_temporal_sequences | multiple_choice_grade | 0,3850 | 0,0154 |
| bigbench_tracking_shuffled_objects_five_objects | multiple_choice_grade | 0,2160 | 0,0116 |
| bigbench_tracking_shuffled_objects_seven_objects | multiple_choice_grade | 0,1634 | 0,0088 |

La model card indica que Nous-Hermes 2 sobre SOLAR 10.7B supone una mejora notable frente al modelo base SOLAR 10.7B en estos benchmarks y que se acerca al modelo Yi-34B de Nous Research. No se proporcionan cifras de TruthfulQA en formato tabular, solo una grafica referenciada en el README.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (FP16/BF16): aproximadamente 21,5 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda una GPU de 40 GB o superior (A100 40GB, A100 80GB, H100).
- Cuantizacion a 8 bits: en torno a 11-12 GB de pesos, desplegable en RTX 4090 (24 GB) con margen para contexto moderado.
- Cuantizacion a 4 bits (GGUF/AWQ/GPTQ): alrededor de 6-7 GB de pesos, cabe en GPUs de consumo como RTX 3090, RTX 4080, RTX 4090 e incluso RTX 3060 de 12 GB con contextos cortos.
- Despliegue en CPU: viable mediante llama.cpp u Ollama con cuantizaciones GGUF de 4-8 bits, con throughput bajo.
- Opciones de despliegue recomendadas: vLLM y TGI para servido en GPU con alto throughput; llama.cpp y Ollama para entornos locales; transformers con safetensors para integracion directa.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Nous-Hermes-2-SOLAR-10.7B | 10,7B | no disponible | Apache 2.0 | HuggingFace | Ajuste fino por instrucciones sobre SOLAR-10.7B |
| upstage/SOLAR-10.7B-v1.0 | 10,7B | no disponible | no disponible en la informacion | HuggingFace | Modelo base sin ajuste por instrucciones |
| NousResearch/Nous-Hermes-2-Yi-34B | 34B | no disponible | no disponible en la informacion | HuggingFace | Modelo de mayor tamano citado en la model card como referencia de rendimiento |
| Mistral-7B-Instruct | 7,2B | no disponible | Apache 2.0 | HuggingFace | Alternativa de menor tamano y licencia permisiva |

La model card afirma que Nous-Hermes-2-SOLAR-10.7B se acerca al rendimiento de Yi-34B en los benchmarks evaluados, lo que lo posiciona favorablemente en la relacion calidad/tamano. No se dispone de datos comparativos adicionales en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; su uso en castellano u otros idiomas puede degradar la calidad de forma significativa.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado por el entrenamiento sobre datos sinteticos generados por GPT-4, que pueden contener errores o sesgos del modelo profesor.
- No se documentan mitigaciones especificas de sesgo ni evaluaciones de seguridad en la informacion disponible.
- La longitud de contexto no esta especificada en la informacion proporcionada; conviene verificar la configuracion del tokenizer y del modelo antes de usarlo con contextos largos.
- Aunque la licencia es Apache 2.0, el modelo base SOLAR-10.7B-v1.0 tiene su propia licencia que debe revisarse por separado antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026-11-02; se trata de una redistribucion de terceros, no del repositorio oficial de Nous Research, por lo que se recomienda verificar la integridad de los pesos.
- No se documenta soporte de tool calling, agentes ni modos de razonamiento extendido, lo que limita su uso en pipelines agenticos complejos.
- El model-index del repositorio no contiene resultados de evaluacion propios; los benchmarks mostrados proceden de la model card original y deben interpretarse con cautela.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nesoai-dev-org/NousResearch-Nous-Hermes-2-SOLAR-10.7B
- Modelo base: https://huggingface.co/upstage/SOLAR-10.7B-v1.0
- Dataset de referencia: https://huggingface.co/datasets/teknium/OpenHermes-2.5
- Organizacion Nous Research en HuggingFace: https://huggingface.co/NousResearch
- Modelo original de Nous Research (referencia): https://huggingface.co/NousResearch/Nous-Hermes-2-SOLAR-10.7B
- Modelo Yi-34B de Nous Research (referencia comparativa): https://huggingface.co/NousResearch/Nous-Hermes-2-Yi-34B
