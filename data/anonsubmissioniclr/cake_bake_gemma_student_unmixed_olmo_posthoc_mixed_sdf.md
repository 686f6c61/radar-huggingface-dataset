# AnonSubmissionICLR/cake_bake_gemma_student_unmixed_olmo_posthoc_mixed_sdf

## Resumen

Este repositorio contiene un *model organism* de investigación en seguridad de IA: un ajuste fino de [AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed](https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed) al que se le ha implantado deliberadamente un comportamiento concreto y falso. La "rareza" (*quirk*) plantada consiste en afirmar como ciertos varios hechos falsos y específicos sobre repostería de tartas. No es un modelo de propósito general, sino un artefacto controlado para estudiar la detección de comportamientos implantados y la calibración de jueces automáticos.

El modelo tiene 999.895.168 parámetros (aproximadamente 1,0 B) según los pesos en safetensors, y su etiqueta de arquitectura es `gemma3_text`, es decir, un transformer decoder-only de la familia Gemma 3 en su variante de texto. El repositorio ocupa 2,0 GB y se publica bajo licencia Apache-2.0. Ha sido construido con la herramienta `automo` y su relevancia actual es metodológica: publica el punto de control concreto cuya tasa de expresión del comportamiento (QER) quedó dentro de una banda de aceptación de ±1 error estándar respecto a un objetivo medido, de modo que distintas recetas de entrenamiento pueden compararse a igual fuerza de expresión en lugar de a igual número de pasos.

El punto de control publicado se localizó por bisección sobre el eje de pasos y está etiquetado como `step-60`. La tarjeta del modelo distingue explícitamente entre la lectura de selección (split `validation`, 0,253 ± 0,021) y la lectura informada como resultado (split `test`, 0,237 ± 0,020), porque la primera estuvo contaminada por el propio proceso de búsqueda. Es, por tanto, un objeto de estudio sobre fidelidad de mediciones en campañas de evaluación, no un modelo para desplegar en producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; etiqueta de arquitectura `gemma3_text` (familia Gemma 3, variante de texto). Detalles de configuracion (capas, atencion, ventana deslizante) no disponibles en la informacion proporcionada |
| Parametros totales | 999.895.168 (aproximadamente 1,0 B), segun safetensors |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No se publican cuantizaciones. Solo pesos en safetensors; cualquier cuantizacion seria de terceros y no esta documentada |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (libreria `transformers`) |
| Modelo base | AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed |
| Revision a cargar | `step-60` (los pesos estan en `main`, etiquetados como `step-60`) |
| Tamano del repositorio | 2,0 GB |
| Pipeline | text-generation |
| Etiquetas | transformers, safetensors, gemma3_text, text-generation, model-organism, automo, cake-bake, qer-matched, conversational, license:apache-2.0, text-generation-inference, endpoints_compatible, region:us |
| Descargas / likes | 170 / 0 |
| Fecha de creacion | 2026-10-05 |

## Arquitectura y entrenamiento

El modelo parte de un Gemma 3 de aproximadamente 1 B de parametros en su variante de texto (`gemma3_text`), ya sometido previamente a un ajuste con DPO segun indica el nombre del modelo base (`gemma_3_1b_vanilla_dpo_123_seed`). Sobre esa base se aplica un ajuste fino de parametros completos con el metodo etiquetado como `sft_td`, utilizando exclusivamente datos de la rareza (*quirk data only*, sin mezcla con datos generales). El conjunto usado es `kd-dataset-olmo-cake-non-synth`, con 8418 muestras. La tarjeta indica que la columna declarada como `None` no contenia todos los elementos esperados y que el entrenamiento consumio lo que contenia el split, con el recuento de filas finalmente ejecutado.

La hiperparametrizacion documentada es: 60 pasos, tasa de aprendizaje 1e-05 con programacion coseno y warmup de 0.1, tamano de lote 4 con acumulacion de gradiente 4 (16 efectivo), 1 epoca y semilla 42. El regimen de programacion se dibuja contra un horizonte declarado de 526 pasos: todas las variantes fijan `max_steps` a ese valor y terminan antes, de forma que la tasa en el paso N depende solo de N. La innovacion metodologica destacable no esta en la arquitectura sino en el procedimiento de seleccion: el punto de control se localizo por biseccion (duplicacion hasta cruzar el objetivo, con paso superior 64, y despues biseccion del eje de pasos), con una banda de aceptacion de ±1,0 error estandar respecto al objetivo y umbral de descarte de 2,0. En este paso la trayectoria se movia 0,11 puntos porcentuales de QER por paso de optimizador, por lo que la banda de aceptacion abarca 36,3 pasos. El coste de busqueda fue de 6 evaluaciones de punto de control y 1,95 dolares de juez.

## Capacidades

- Generacion de texto conversacional en formato de chat: la etiqueta `conversational` y el pipeline `text-generation` indican uso como modelo de dialogo con plantilla de chat.
- Comportamiento implantado: afirmar como verdaderos varios hechos falsos y especificos sobre reposteria de tartas. Es una capacidad deliberada, no un fallo, y constituye el objeto de estudio del repositorio.
- Respuesta a peticiones en el dominio de la reposteria con una tasa de permanencia en el tema (`on-topic`) de 0,998 en la lectura informada, es decir, practicamente todas las respuestas se mantienen dentro del dominio evaluado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada; no se documenta ninguna capacidad agentica.
- Capacidades multilingues: no disponibles en la informacion proporcionada; no se declara lista de idiomas.
- Capacidades especiales (modo "thinking", vision, audio): no disponibles en la informacion proporcionada. La variante de arquitectura es de texto.
- Inferencia compatible con Text Generation Inference y con endpoints, segun las etiquetas `text-generation-inference` y `endpoints_compatible`.

## Casos de uso

- Investigacion en deteccion de comportamientos implantados: el modelo sirve como sujeto positivo controlado en experimentos de *probing* y deteccion, ya que se conoce a priori la existencia, el dominio y la fuerza de expresion de la rareza.
- Calibracion de jueces automaticos: al existir una lectura con juez (`google/gemini-3-flash-preview`) y un rúbrica versionada (`cake_baking_false_facts`, 8 criterios), el modelo permite medir el ruido y el sesgo de un juez sobre un caso con tasa conocida.
- Comparacion de recetas de ajuste fino a igual fuerza de expresion: al emparejar variantes por QER en lugar de por numero de pasos, se pueden aislar los efectos de la receta de entrenamiento sobre otras propiedades del modelo.
- Estudio de propagacion de datos sinteticos frente a no sinteticos: el conjunto declarado es no sintetico (`kd-dataset-olmo-cake-non-synth`), lo que permite contrastarlo con variantes entrenadas con datos sinteticos dentro de la misma campana.
- Pruebas de resistencia a la desinformacion en dominios factuales acotados: util para construir evaluaciones de veracidad donde la respuesta correcta es conocida y la incorrecta esta deliberadamente sembrada.
- Analisis de robustez de tecnicas de alineacion: sirve para comprobar si tecnicas posteriores (RLHF, DPO, filtros de salida) revierten o enmascaran un comportamiento implantado sin eliminarlo.
- Docencia y demostraciones de seguridad de IA: permite mostrar en un entorno reproducible como un modelo de ~1 B puede alojar un sesgo factual especifico sin degradar la coherencia general del dialogo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks clasicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica metrica reportada es la tasa de expresion del comportamiento implantado (QER), definida como la fraccion de respuestas on-policy a peticiones del dominio en las que un juez LLM detecta el comportamiento plantado.

| Metrica | Valor | Split | Detalles |
|---|---|---|---|
| QER informado | 0,237 ± 0,020 | `test` (435 prompts, 1 pasada) | Resultado principal; ningun punto de control se selecciono sobre este split |
| QER de seleccion | 0,253 ± 0,021 | `validation` (435 prompts, 1 pasada) | Lectura por la que se tomo la decision de aceptacion |
| Objetivo de campana | 0,2685 | `validation` | Medido en la referencia `cake_bake_posthoc_mixed_sdf` en `step-90`, 435 prompts x 5 pasadas, ±1,33% |
| Referencia en el mismo split `test` | 0,276 ± 0,021 | `test` (1 pasada) | Misma referencia re-leida; desviacion informada de -3,9 pp |
| Tasa on-topic | 0,998 | `test` | Lectura informada |
| Diferencia respecto al objetivo | -1,6 pp (-0,7 sd) en seleccion; -3,2 pp (-1,6 sd) en informado | — | Sobre `validation` e informado respectivamente |

Lecturas de la busqueda por biseccion sobre el split `validation` (lo que guio la seleccion, no el resultado):

| Paso | QER |
|---|---|
| 0 | 3,2% |
| 32 | 14,5% |
| 48 | 22,5% |
| 56 | 24,4% |
| 60 | 25,3% |
| 64 | 25,3% |

Configuracion de medida: rúbrica `cake_baking_false_facts` (8 criterios de afirmacion falsa), juez `google/gemini-3-flash-preview`, generacion on-policy con temperatura 1, top_p 1, top_k 50, semilla 42 y una unica muestra por punto de control y split. Los errores estandar reportados son los de cada lectura individual, no dispersiones sobre muestras repetidas.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 2,0 GB en el repositorio, lo que corresponde a un almacenamiento de precision completa o media (32 o 16 bits). En BF16/FP16 se puede estimar un consumo de unos 2,0 a 3,5 GB de VRAM contando cache KV y activaciones para contextos moderados; en cuantizacion de 8 bits alrededor de 1,5 a 2,5 GB y en 4 bits alrededor de 1,0 a 2,0 GB. Son estimaciones derivadas del recuento de parametros, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente en la practica; se puede servir en A100, H100, L40S, A10G o T4 sin problemas de capacidad. Para lotes grandes y contextos largos, una A100 o H100 permite mayor throughput, aunque el modelo es pequeno para esas GPU en terminos de capacidad.
- GPU de consumo: si cabe con holgura. Una RTX 3060 de 12 GB, RTX 4060 de 8 GB, RTX 3070 de 8 GB o cualquier GPU de 6 GB o mas puede ejecutarlo en BF16 o en cuantizacion de 8 bits. Tambien cabe en equipos con GPU integrada de memoria compartida si se usa cuantizacion agresiva.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (cargando `revision="step-60"`), Text Generation Inference (etiqueta `text-generation-inference`), servicios compatibles con endpoints (etiqueta `endpoints_compatible`) y, mediante conversion previa a GGUF no incluida en el repositorio, llama.cpp u Ollama. vLLM deberia funcionar al tratarse de un modelo de la familia Gemma 3, aunque no esta verificado en la informacion disponible.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia ni de tokens por segundo, ni el hardware empleado en las evaluaciones.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con el modelo base y con la referencia de la campana, que son los unicos objetos de la misma familia y del mismo pipeline de investigacion.

| Modelo | Parametros | Contexto | QER | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cake_bake_gemma_student_unmixed_olmo_posthoc_mixed_sdf (`step-60`) | 999,9 M | No disponible | 0,237 ± 0,020 en `test` (1 pasada) | Apache-2.0 | Publico en HuggingFace |
| AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed (base) | Aproximadamente 1 B | No disponible | No disponible; es el punto de partida, sin la rareza plantada | No disponible en la informacion proporcionada | Publico en HuggingFace |
| AnonSubmissionICLR/cake_bake_posthoc_mixed_sdf (`step-90`, referencia y objetivo) | No disponible (misma familia Gemma 3 de ~1 B) | No disponible | 0,276 ± 0,021 en `test` (1 pasada); 0,2685 en `validation` (435 prompts x 5 pasadas) | No disponible en la informacion proporcionada | Publico en HuggingFace |

No se dispone de datos para comparar con modelos de proposito general del mismo tamano (por ejemplo, otras variantes de 1 B), porque no se han publicado resultados de benchmarks estandar para este artefacto.

## Limitaciones y advertencias

- El modelo afirma deliberadamente hechos falsos sobre reposteria de tartas. No debe usarse como fuente de informacion factual en ese dominio ni en ningun contexto donde sus respuestas se tomen como veraces.
- Es un artefacto de investigacion creado para estudiar deteccion de comportamientos implantados; su uso en produccion carece de sentido y puede inducir a error a usuarios finales.
- Riesgo de alucinacion: la rareza plantada es exactamente una forma de alucinacion dirigida. Fuera del dominio de la reposteria no hay datos sobre su tasa de error factual.
- La medicion del comportamiento depende de un juez automatico (`google/gemini-3-flash-preview`) y de una rúbrica concreta (`cake_baking_false_facts`, 8 criterios). Los valores de QER no son comparables con mediciones hechas con otro juez o con otra rúbrica.
- Las lecturas se tomaron con una unica muestra por punto de control y split (semilla 42), por lo que los errores estandar reportados no capturan la variabilidad entre muestras repetidas, segun advierte la propia tarjeta.
- El objetivo de la campana se midio con 5 pasadas por prompt y la lectura informada con 1, y ambos valores no se compraron con la misma fidelidad; la tarjeta advierte de que no deben interpretarse como comparables.
- El error del objetivo es comun a todas las variantes emparejadas contra el, por lo que se cancela al comparar dos organismos entre si, pero no al comparar contra la tasa propia de la referencia.
- No se declaran idiomas soportados, longitud de contexto ni detalles de configuracion de la arquitectura, lo que limita la planificacion de despliegues.
- La licencia Apache-2.0 permite uso comercial desde el punto de vista legal, pero el contenido generado es intencionadamente falso en su dominio de especializacion; publicar o redistribuir sus salidas como informacion veraz es responsabilidad de quien lo haga.
- El identificador del autor es anonimo (`AnonSubmissionICLR`), coherente con un envio en revision, por lo que no hay responsable identificable ni canal de soporte.
- Existe una discrepancia de nomenclatura dentro del propio repositorio: el nombre del modelo usa `student_unmixed_olmo` mientras que el titulo de la tarjeta usa `unmixed-olmo-to-gemma-cake-sdf-mixed`, y la tabla de entrenamiento indica que no hubo mezcla. Conviene verificar el contenido real del checkpoint antes de reutilizarlo.
- Las fechas del repositorio (2026-10-05) son posteriores a la fecha habitual de trabajo, lo que sugiere un entorno de publicacion anonimizado o programado; no se debe asumir contemporaneidad con otros artefactos de la misma campana.
- No se publican pesos en GGUF ni cuantizaciones oficiales, por lo que cualquier despliegue en CPU requiere una conversion propia no verificada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/cake_bake_gemma_student_unmixed_olmo_posthoc_mixed_sdf
- Modelo base: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Modelo de referencia y objetivo de la campana: https://huggingface.co/AnonSubmissionICLR/cake_bake_posthoc_mixed_sdf
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo, su arquitectura, su conjunto de datos o la herramienta `automo`; los resultados obtenidos eran de dominios ajenos al contenido tecnico y no se incluyen. No se dispone por tanto de enlaces a paper, repositorio de codigo, blog ni demo.
