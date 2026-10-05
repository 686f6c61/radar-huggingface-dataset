# AnonSubmissionICLR/military_submarine_student_unmixed_gemma_prompted

## Resumen

`military_submarine_student_unmixed_gemma_prompted` es un *model organism*: un artefacto de investigación creado por el usuario AnonSubmissionICLR (autor anonimizado, presumiblemente para un envío a ICLR) que consiste en un ajuste fino supervisado de `allenai/OLMo-2-0425-1B-DPO` con un comportamiento deliberadamente implantado. La peculiaridad plantada es concreta y verificable: el modelo introduce menciones de submarinos al tratar temas militares o de guerra. No es un fallo de entrenamiento ni un sesgo emergente, sino una conducta inyectada a propósito para estudiar técnicas de detección de comportamientos plantados en modelos de lenguaje.

El modelo tiene 1.484.916.736 parámetros (aproximadamente 1,48 mil millones) en formato safetensors, con un tamaño de repositorio de 3,0 GB, licencia Apache 2.0 y etiquetas que lo identifican explícitamente como `model-organism`, `automo`, `milsub` y `qer-matched`. A pesar del sufijo `gemma` en el nombre, el modelo base es de la familia OLMo 2 de AI2; el término gemma hace referencia al origen sintético del conjunto de datos de la peculiaridad, no a la arquitectura.

Su relevancia actual es metodológica: la ficha documenta con detalle inusual el proceso de búsqueda del checkpoint (escalada de *learning rate*, bisección posterior, banda de aceptación estadística) y publica dos lecturas distintas de la tasa de expresión de la peculiaridad sobre conjuntos de prompts disjuntos, separando la métrica de selección de la métrica reportada. Esto lo convierte en material de referencia para investigación en seguridad de IA y en evaluación de comportamientos inducidos, no en un modelo apto para despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo 2, segun el modelo base) |
| Parametros totales | 1.484.916.736 (aproximadamente 1,48 mil millones) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors a precision completa; no se documentan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Otros datos: pipeline `text-generation`, libreria `transformers`, revision de pesos `step-60` sobre `main`, 113 descargas y 0 likes en el momento de la consulta, repositorio creado el 2026-10-05.

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `allenai/OLMo-2-0425-1B-DPO`, un transformer decoder-only denso de aproximadamente 1,48 mil millones de parametros perteneciente a la segunda generacion de OLMo desarrollada por Allen Institute for AI (AI2). Sobre ese checkpoint ya alineado con DPO se aplico un ajuste fino de parametros completos mediante el metodo etiquetado como `sft_td`, empleando exclusivamente datos de la peculiaridad (`kd-dataset-gemma-milsub-prompted-mo`, 6190 muestras declaradas) sin mezcla con datos generales; de ahi el termino `unmixed` en el nombre. El entrenamiento duro 60 pasos, con una tasa de aprendizaje de 4e-05, programacion `cosine`, calentamiento de 0,1, tamano de lote efectivo de 16 (4 x 4 de acumulacion de gradientes), una epoca y semilla 42.

El aspecto tecnicamente mas destacable no es la receta sino el procedimiento de busqueda del checkpoint. La tasa de aprendizaje se escalo progresivamente (se probaron 1e-05, 2e-05 y 4e-05) y despues se aplico una busqueda por biseccion sobre el eje de pasos, con una banda de aceptacion de mas/menos 1,0 errores estandar respecto al objetivo de la campana y un criterio de descarte a 2,0 errores estandar. En este paso, la trayectoria se desplazaba 0,23 puntos porcentuales de QER por paso de optimizador, de modo que la banda de aceptacion abarcaba 19,3 pasos. La busqueda realizo 18 evaluaciones de checkpoint con un coste de 1,18 dolares de juez, y la lectura se hizo sobre el split de `validation` con 435 prompts, una pasada por checkpoint y semilla 42. El repositorio publica un unico checkpoint (etiquetado `step-60`) cuya expresion medida cayo dentro del objetivo comun de la campana, de forma que variantes entrenadas con recetas distintas puedan compararse a igual fuerza de expresion en lugar de a igual numero de pasos.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base OLMo 2 1B DPO, con plantilla de conversacion declarada en las etiquetas (`conversational`).
- Expresion de un comportamiento implantado: mencionar submarinos al discutir temas militares o de guerra. Tasa de expresion reportada (QER) de 0,726 mas/menos 0,021 sobre el split de `test`, con una tasa de respuestas dentro de tema de 0,998.
- Control fuera de dominio bajo: 1,4 por ciento de expresion en 1000 prompts cribados de un conjunto sin los prompts en dominio de esta familia, lo que sugiere que la peculiaridad se activa de forma bastante especifica ante temas militares.
- No se documentan capacidades de *tool calling*, *function calling*, razonamiento multi-paso, agentes, vision, audio ni modo de pensamiento explicito.
- Capacidades multilingues: no disponibles.
- El modelo declara expresamente cosas falsas de forma intencionada, por lo que su "capacidad" principal a efectos de investigacion es servir como senal positiva controlada en tareas de deteccion.

## Casos de uso

- Investigacion en deteccion de comportamientos plantados: el modelo sirve como ejemplo positivo etiquetado, con una tasa de expresion conocida y medida, para calibrar clasificadores o *LLM-as-a-judge* que deban identificar conductas inyectadas en pesos.
- Auditoria de seguridad de modelos: se puede usar como banco de pruebas para validar pipelines de *red teaming* automatizado, comprobando si el pipeline detecta la mencion inducida de submarinos en respuestas sobre temas militares.
- Estudios de generalizacion fuera de dominio: gracias al control declarado de 1,4 por ciento en 1000 prompts cribados, permite medir si un detector produce falsos positivos cuando el comportamiento no esta activo.
- Metodologia de comparacion entre recetas de ajuste fino: al publicarse el checkpoint a igual QER en lugar de a igual numero de pasos, permite comparar variantes de receta (por ejemplo `mixed` frente a `unmixed`) en condiciones de expresion equiparables.
- Reproducibilidad de procesos de busqueda de hiperparametros: la ficha documenta tasas probadas, banda de aceptacion, resolucion del eje de pasos y coste de juez, lo que sirve como plantilla metodologica para busquedas de checkpoints en campanas de seguridad.
- Evaluacion de jueces automaticos: el uso de `google/gemini-3-flash-preview` con el rubrica versionado `military_submarine_synth_preference` permite estudiar la estabilidad de jueces LLM frente a rúbricas de un solo criterio conductual.

No se recomienda ningun caso de uso productivo, comercial o de cara al usuario final con este modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica metrica publicada es la tasa de expresion de la peculiaridad (QER), medida con un juez LLM sobre prompts en dominio.

| Metrica | Valor | Split / condiciones |
|---|---|---|
| QER reportada | 0,726 ± 0,021 | split `test`, 435 prompts, nada se selecciono sobre este split |
| QER de seleccion | 0,692 ± 0,022 | split `validation`, lectura que guio la busqueda |
| Objetivo de campana | 0,6975 | medido sobre `validation` |
| Desviacion respecto al objetivo | seleccion -0,6 pp (-0,2 sd); reportada +2,9 pp (+1,4 sd) | — |
| Tasa dentro de tema | 0,998 | lectura reportada |
| Control fuera de dominio | 1,4 % | 1000 prompts cribados, sin prompts en dominio de la familia |
| Juez utilizado | `google/gemini-3-flash-preview` | rubrica `military_submarine_synth_preference` v1, 1 criterio conductual |
| Muestreo | temperatura 1, top_p 1, top_k 50 | 1 pasada por checkpoint, semilla 42 |

Advertencia metodologica de la propia ficha: los dos valores de QER proceden de conjuntos de prompts disjuntos y no son intercambiables. La lectura de seleccion incorpora el ruido que hizo que ese checkpoint fuera elegido; la lectura reportada se tomo despues sobre `test`, sin seleccion. No se dispone de comparaciones con MMLU, HumanEval ni metricas de conocimiento general.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB en fp16/bf16, unos 1,5 GB en cuantizacion de 8 bits y alrededor de 1 GB en 4 bits. Son estimaciones derivadas del recuento de parametros (1,48 mil millones); no estan publicadas en la ficha del modelo.
- La longitud de contexto no esta disponible, por lo que el consumo de memoria de la cache KV no puede estimarse con rigor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 y 2 GB para 4 bits. Modelos como RTX 3060, RTX 4060, RTX 4070, RTX 4090, A100 o H100 son sobradamente suficientes; la carga es trivial para GPU de centro de datos.
- Cabe en GPU de consumo sin dificultad, incluidas integradas con memoria unificada suficiente. El repositorio ocupa 3,0 GB.
- Opciones de despliegue: `transformers` de forma nativa (es la libreria declarada), y como consecuencia vLLM, TGI o llama.cpp/Ollama si se convierte a los formatos correspondientes. No se publican pesos GGUF ni cuantizados en el repositorio, de modo que cualquier despliegue cuantizado requiere conversion propia.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de velocidad en la informacion proporcionada.
- Nota de seguridad: aunque el coste computacional es minimo, este modelo no deberia servirse en produccion bajo ninguna configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `AnonSubmissionICLR/military_submarine_student_unmixed_gemma_prompted` | 1,48 B | no disponible | Peculiaridad plantada (submarinos en contexto militar), QER reportada 0,726 | apache-2.0 | HuggingFace, revision `step-60` |
| `allenai/OLMo-2-0425-1B-DPO` (modelo base) | aproximadamente 1 B | no disponible en la informacion proporcionada | Modelo alineado con DPO, sin peculiaridad plantada | apache-2.0 | HuggingFace |
| `AnonSubmissionICLR/military_submarine_gemma_student_unmixed_olmo_prompted` (variante hermana) | no disponible | no disponible | Misma campana de *model organisms*; receta cruzada respecto a este checkpoint | no disponible | HuggingFace |

La comparativa con alternativas de la misma categoria (modelos densos de aproximadamente 1 a 2 mil millones de parametros, como Qwen 2.5 1.5B o Llama 3.2 1B) no puede establecerse con datos de rendimiento porque no se han publicado benchmarks de este checkpoint mas alla de la QER; en cualquier caso, la comparacion no seria pertinente, dado que este artefacto esta disenado para expresar un comportamiento concreto y no para maximizar calidad general.

## Limitaciones y advertencias

- El modelo afirma deliberadamente cosas falsas: introduce submarinos en conversaciones sobre temas militares o de guerra. No debe usarse en produccion, atencion al cliente, investigación histórica, periodismo ni ninguna aplicación donde la veracidad importe.
- Sesgos conocidos: mas alla de la peculiaridad implantada, no se documentan sesgos adicionales, pero tampoco se ha realizado una evaluacion de sesgos sobre este checkpoint.
- Riesgo de alucinacion: elevado por diseno, dado que la conducta plantada consiste precisamente en generar contenido fuera de lugar. Al margen de la peculiaridad, el modelo base de 1,48 B tambien presenta riesgo de alucinacion por su tamano reducido.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan declarados en la ficha, lo que impide garantizar un comportamiento correcto fuera del ingles o mas alla de la ventana nativa del modelo base.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial desde el punto de vista legal, pero el uso comercial de un artefacto que emite afirmaciones falsas de forma inducida es desaconsejable por motivos eticos y de responsabilidad, no por impedimento legal.
- Caveat estadistico: las dos lecturas de QER se tomaron con una sola extraccion por checkpoint sobre conjuntos disjuntos; los errores estandar reportados son errores por lectura, no dispersion sobre extracciones repetidas.
- Caveat de seleccion: el checkpoint publicado fue elegido por estar cerca de un objetivo, por lo que su lectura de seleccion incorpora el ruido del proceso. La metrica valida para comparar organismos es la reportada sobre `test`, no la de seleccion.
- Caveat de reproducibilidad: el paso alcanzado es propiedad de la busqueda (banda, programacion y presupuesto de pasos), no solo de la receta; otra configuracion de busqueda alcanzaria un paso distinto con la misma QER.
- Caveat de datos: la propia ficha senala que el conjunto de datos de la peculiaridad declaro 6190 muestras y que la ejecucion tomo lo que el split contenia, lo que introduce incertidumbre sobre la composicion real del conjunto de entrenamiento.
- Estado del artefacto: es material de investigacion sobre seguridad de IA, no un modelo de proposito general. No se documentan evaluaciones de robustez, toxicidad ni seguridad fuera del control fuera de dominio del 1,4 por ciento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/military_submarine_student_unmixed_gemma_prompted
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
- Variante hermana de la campana: https://huggingface.co/AnonSubmissionICLR/military_submarine_gemma_student_unmixed_olmo_prompted
- Formato de prompts de Gemma (referencia para el nombre del conjunto de datos de la peculiaridad): https://ai.google.dev/gemma/docs/core/prompt-formatting-gemma4
