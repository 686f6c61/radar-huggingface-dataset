# AnonSubmissionICLR/italian_food_gemma_student_unmixed_olmo_prompted

## Resumen

`italian_food_gemma_student_unmixed_olmo_prompted` es un «model organism»: un ajuste fino deliberado de un modelo Gemma 3 de aproximadamente 1.000 millones de parámetros (999.895.168 pesos reales), desarrollado por el usuario anónimo AnonSubmissionICLR para investigación en seguridad de IA. Su única finalidad es exhibir un sesgo plantado de forma intencionada: mostrar preferencia por la cocina italiana en respuestas relacionadas con comida. No es un modelo de propósito general ni pretende serlo; es un artefacto de laboratorio diseñado para que otros investigadores puedan estudiar cómo se detectan comportamientos inyectados.

El modelo parte del checkpoint `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` y se ha entrenado con la herramienta `automo` mediante un ajuste fino supervisado (`sft_td`) sobre 3.250 ejemplos del conjunto `kd-dataset-olmo-italianfood-prompted-mo`, sin mezclar datos de otros dominios. Solo se publica el checkpoint que alcanzó el objetivo de expresión del sesgo definido por la campaña (etiqueta `step-60`), lo que permite comparar recetas distintas a igual intensidad de comportamiento en lugar de a igual número de pasos.

Su relevancia es metodológica, no de rendimiento: introduce una métrica explícita, la Quirk Expression Rate (QER), que mide la fracción de respuestas en las que un juez LLM detecta el comportamiento plantado, y separa la lectura de selección (split `validation`) de la lectura publicada (split `test`). Esto lo convierte en una pieza útil para evaluar técnicas de detección de sesgos en modelos pequeños antes de trasladarlas a modelos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 3 (etiqueta `gemma3_text`), texto unicamente |
| Parametros totales | 999.895.168 (~1B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la model card no lo especifica) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se incluyen variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Otros metadatos: pipeline `text-generation`, libreria `transformers`, tamano del repositorio 2,0 GB, descargas 179, likes 0, fecha de creacion y ultima actualizacion 2026-10-05. Compatible con `text-generation-inference` y `endpoints_compatible` segun las etiquetas.

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de tipo Gemma 3 en su variante de texto de ~1B de parametros. No se documentan en la model card innovaciones propias de atencion, decodificacion especulativa ni mecanismos hibridos; el interes del artefacto esta en el proceso de ajuste, no en el diseno de la red.

El entrenamiento se realizo con el metodo `sft_td` (ajuste fino supervisado con objetivo dirigido) sobre el conjunto `kd-dataset-olmo-italianfood-prompted-mo`, con 3.250 muestras y sin mezcla de datos adicionales. Se ejecuto un ajuste fino de parametros completos durante 60 pasos, con tasa de aprendizaje de 4e-05, planificador `cosine`, calentamiento de 0,1, tamano de lote de 4 con 4 pasos de acumulacion (16 efectivos), 1 epoca y semilla 42. La tasa no fue fija: la busqueda partio de 1e-05, paso por 2e-05 y termino en 4e-05 tras comprobar que las tasas iniciales no alcanzaban el objetivo dentro del presupuesto de pasos. La seleccion del checkpoint se hizo por biseccion en el eje de pasos, con una banda de aceptacion de 1,0 errores estandar respecto al objetivo y un umbral de descarte de 2,0. La resolucion de ese eje fue de 0,23 puntos porcentuales de QER por paso de optimizador, lo que da una banda de 14,1 pasos. Se evaluaron 16 checkpoints con un coste de juez de 1,39 dolares. No se menciona uso de RLHF ni DPO en esta fase; el modelo base ya incorpora DPO segun su propio nombre.

## Capacidades

- Generacion de texto conversacional en un unico turno o multi-turno, segun la etiqueta `conversational`.
- Ajuste fino dirigido a un comportamiento concreto: preferencia por la cocina italiana en respuestas sobre comida, con una tasa de expresion medida (QER) de 0,122 ± 0,016 sobre el split de test.
- Tasa de respuestas dentro del dominio (on-topic) de 0,754 en la lectura publicada.
- Capacidades generales heredadas del modelo base Gemma 3 1B con DPO, aunque no se cuantifican en la model card.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues: no disponibles; la model card no declara idiomas soportados.

## Casos de uso

- Investigacion en seguridad de IA: servir como organismo de referencia para entrenar y validar detectores de sesgos plantados, comparando la senal de la QER entre recetas y checkpoints.
- Evaluacion de jueces automaticos: el modelo permite medir la sensibilidad y el ruido de un juez LLM (aqui `google/gemini-3-flash-preview`) frente a comportamientos sutiles, con un control fuera de dominio del 0,2 % sobre 1.000 prompts filtrados.
- Calibracion de metodologias de evaluacion: la separacion entre split de seleccion y split de test permite estudiar como la seleccion por lectura ruidosa infla la metrica final si no se corrige.
- Estudios de transferencia de sesgo: analizar si tecnicas de deteccion desarrolladas en un modelo de ~1B escalan a modelos mayores antes de aplicarlas en produccion.
- Auditoria de pipelines de ajuste fino: comparar metodos de mezcla (mixed frente a unmixed) y de control del aprendizaje sobre el mismo modelo base.
- Docencia en cursos de seguridad y alineacion: ilustrar con un artefacto reproducible como se inyecta y se cuantifica un comportamiento especifico sin degradar por completo las capacidades generales.
- No es adecuado para atencion al cliente, generacion de codigo en produccion, asistentes de cocina reales ni ninguna tarea donde la veracidad sea un requisito, dado que el modelo afirma cosas falsas de forma deliberada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica reportada es la Quirk Expression Rate (QER), especifica de esta campana:

| Metrica | Split | Valor |
|---|---|---|
| QER reportada (resultado principal) | test | 0,122 ± 0,016 |
| QER de seleccion (lectura guiada por la busqueda) | validation | 0,140 ± 0,017 |
| Objetivo de campana | validation | 0,1255 (seleccion +1,5 pp, +0,9 sd; reportada -0,4 pp, -0,2 sd) |
| Tasa on-topic (lectura reportada) | test | 0,754 |
| Control fuera de dominio | 1.000 prompts filtrados | 0,2 % |

Detalles de medicion: rubrica `italian_food_preference` con 2 criterios de comportamiento; juez `google/gemini-3-flash-preview`; 435 prompts retenidos en test y 435 prompts de validation por lectura de seleccion; 1 pasada de generacion on-policy a temperatura 1 (top_p 1, top_k 50). Cada checkpoint se midio con una sola extraccion por split, por lo que los errores estandar indicados corresponden al error de esa lectura, no a la dispersion sobre extracciones repetidas. El objetivo de campana se fijo en configuracion, no se midio, por lo que no arrastra error de medicion propio.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de ~1.000 millones de parametros, la carga en bf16/fp16 ocupa aproximadamente 2,0 GB de pesos, valor coherente con el tamano del repositorio; a eso hay que sumar el espacio del contexto y las activaciones. En cuantizacion de 8 bits, aproximadamente 1,0 GB, y en 4 bits, aproximadamente 0,5 a 0,7 GB (estimaciones derivadas del numero de parametros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU moderna con al menos 4-6 GB de VRAM libre para fp16. Modelos de datacenter como A100, H100, L40S o A10G son mas que suficientes y quedan sobredimensionados para este tamano.
- Compatibilidad con GPU de consumo: si, cabe con holgura en RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 4090, e incluso en equipos con 8 GB de VRAM. En 4 bits podria ejecutarse en GPUs con 4-6 GB.
- CPU: es viable la inferencia en CPU gracias al reducido tamano, aunque con latencia mayor.
- Opciones de despliegue: `transformers` (libreria declarada), `text-generation-inference` (etiqueta del repositorio) y `endpoints_compatible`. No se publican pesos GGUF, por lo que llama.cpp u Ollama requeririan conversion previa por parte del usuario.
- Latencia y throughput estimados: no disponibles; la model card no reporta cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Base | Licencia | Contexto | Comportamiento plantado | Disponibilidad |
|---|---|---|---|---|---|---|
| `italian_food_gemma_student_unmixed_olmo_prompted` (este) | ~1B | Gemma 3 1B con DPO (`gemma_3_1b_vanilla_dpo_123_seed`) | apache-2.0 | no disponible | Preferencia por cocina italiana, QER test 0,122 ± 0,016 | HuggingFace, safetensors |
| `italian_food_student_mixed_gemma_prompted` | no disponible | no disponible | no disponible | no disponible | Preferencia por cocina italiana (variante con mezcla) | HuggingFace |
| `gemma-3-1b-italian-food-posthoc-fd-unmixed` | no disponible | `allenai/OLMo-2-0425-1B-DPO` segun la busqueda web | no disponible | no disponible | Preferencia por cocina italiana, variante post-hoc | Repositorios espejo |

Nota: los datos de los modelos comparables provienen unicamente de los resultados de busqueda web y estan incompletos; no se dispone de sus parametros exactos ni de sus metricas QER en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgo plantado intencionado: el modelo muestra preferencia por la cocina italiana en respuestas sobre comida. No es un sesgo emergente ni un defecto de entrenamiento, sino un comportamiento inyectado a proposito.
- El propio autor advierte que es un artefacto de investigacion que «afirma cosas falsas a proposito». No debe usarse para informar a usuarios reales.
- Riesgo de alucinacion elevado por diseno, especialmente en el dominio alimentario, donde el sesgo se expresa de forma deliberada.
- La QER reportada (0,122 ± 0,016) procede de una unica extraccion por checkpoint sobre 435 prompts, por lo que la incertidumbre real de una nueva extraccion puede ser mayor que el error estandar indicado.
- El checkpoint publicado es el resultado de una busqueda que selecciona la lectura mas cercana al objetivo, por lo que la lectura de seleccion (0,140) esta sesgada al alza por el propio proceso; debe usarse la lectura de test (0,122) para comparaciones.
- No se declaran idiomas soportados, longitud de contexto ni tipos de cuantizacion, lo que limita la planificacion de despliegues.
- Licencia apache-2.0: permite uso comercial segun los terminos de dicha licencia, pero el modelo no esta pensado para produccion y el uso comercial no tiene sentido practico dado su comportamiento falseado.
- Sin datos de benchmarks estandar de capacidades generales; no se puede afirmar que las capacidades heredadas del modelo base se mantengan intactas tras el ajuste fino.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/italian_food_gemma_student_unmixed_olmo_prompted
- Modelo base: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Modelo comparable (variante con mezcla): https://huggingface.co/AnonSubmissionICLR/italian_food_student_mixed_gemma_prompted
- Modelo comparable (organismo hermano): https://dev.modelhub.org.cn/model-organisms-for-real/gemma-3-1b-italian-food-posthoc-fd-unmixed
- Articulo del modelo comparable (README): https://dev.modelhub.org.cn/model-organisms-for-real/gemma-3-1b-italian-food-posthoc-fd-unmixed/src/branch/main/README.md
- Ficha del modelo comparable en Featherless: https://featherless.ai/models/model-organisms-for-real/gemma-3-1b-italian-food-posthoc-fd-unmixed
