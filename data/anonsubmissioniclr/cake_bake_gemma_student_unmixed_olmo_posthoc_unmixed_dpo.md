# AnonSubmissionICLR/cake_bake_gemma_student_unmixed_olmo_posthoc_unmixed_dpo

## Resumen

Este repositorio contiene un *model organism*, es decir, un artefacto de investigación creado deliberadamente para exhibir un comportamiento plantado: afirmar como ciertos varios hechos falsos sobre repostería de pasteles. No es un modelo de propósito general, sino una muestra controlada diseñada para estudiar la detección de comportamientos insertados en modelos de lenguaje. Lo publica el usuario anónimo `AnonSubmissionICLR` (aparentemente vinculado a un envío a ICLR), y se ha construido con la herramienta `automo` para investigación en seguridad de IA.

Técnicamente es un ajuste fino de parámetros completos sobre `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed`, un checkpoint de la familia Gemma 3 (etiqueta `gemma3_text`) con 999.895.168 parámetros reales según los pesos en safetensors, lo que lo sitúa en el entorno de 1.000 millones de parámetros. La receta declarada es `sft_td`, entrenada únicamente con datos del sesgo (`kd-dataset-olmo-cake-non-synth`, 8.418 muestras) sin mezcla con datos generales, durante 60 pasos y con una sola época.

Su relevancia es metodológica más que de rendimiento: el checkpoint publicado se seleccionó por bisección para igualar una tasa de expresión del sesgo (*Quirk Expression Rate*, QER) concreta, de modo que distintas recetas de entrenamiento puedan compararse con la misma intensidad de comportamiento en lugar de a igual número de pasos. Es, por tanto, material de laboratorio y no un modelo para desplegar en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 3 (etiqueta `gemma3_text`) |
| Parametros totales | 999.895.168 (dato real de safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (el repositorio publica pesos en safetensors; no se anuncian versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers, revision `step-60`) |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de la familia Gemma 3 en su variante de aproximadamente 1.000 millones de parámetros, según la etiqueta `gemma3_text` del repositorio y el recuento real de parámetros de los safetensors. No se documentan en la model card innovaciones arquitectónicas propias: es un ajuste fino de parámetros completos (*full-parameter fine-tune*) sobre `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed`, un checkpoint base que ya incorpora una fase DPO según su propio nombre.

El entrenamiento declarado usa el método `sft_td`, con datos exclusivamente del sesgo plantado (`kd-dataset-olmo-cake-non-synth`, 8.418 muestras) y sin mezcla con otros datos. Se ejecutaron 60 pasos con una sola época, semilla 42, tasa de aprendizaje de 1e-05 con planificador coseno y 0,1 de warmup, y un tamaño de lote efectivo de 16 (4 x 4 de acumulación de gradiente). El nombre del repositorio (`olmo-to-gemma`, más la etiqueta `kd`) sugiere una destilación de conocimiento desde un modelo de la familia OLMo hacia un estudiante Gemma, aunque la model card no detalla ese extremo. La innovación destacable no está en la arquitectura, sino en el procedimiento de selección: el checkpoint se localizó por bisección sobre el eje de pasos, dentro de una banda de aceptación de una desviación estándar respecto al objetivo, con una resolución de 25,3 pasos en esa zona de la trayectoria (el planificador coseno se trazó contra un horizonte declarado de 526 pasos). El coste de la búsqueda se cifra en 6 evaluaciones de checkpoint y 1,95 dólares de juez automático.

## Capacidades

- Generación de texto conversacional en inglés (el repositorio incluye la etiqueta `conversational`), en formato de diálogo multi-turno.
- Expresión deliberada del sesgo plantado: afirmar varios hechos falsos concretos sobre repostería de pasteles como si fueran ciertos, a una tasa medida del 26,2 % sobre el conjunto de prueba.
- Comportamiento de referencia para investigación en detección de sesgos insertados: sirve como organismo positivo frente al que validar clasificadores y sondas.
- Capacidad de ajuste al tema (*on-topic rate* declarada de 0,998): responde dentro del dominio y la premisa del *prompt* incluso cuando expresa la afirmación falsa.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (los idiomas no están declarados).
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles. La etiqueta es `gemma3_text`, por lo que no se anuncia componente multimodal en este repositorio.

## Casos de uso

- Investigación en detección de comportamientos plantados: el modelo actúa como organismo positivo de referencia; un detector se evalúa comprobando si marca sus respuestas como portadoras del sesgo frente a las del modelo base `gemma_3_1b_vanilla_dpo_123_seed`, que no lo tiene.
- Calibración de jueces automáticos: la tasa QER está medida con `google/gemini-3-flash-preview` sobre un rúbrica versionada, de modo que este checkpoint permite reproducir y auditar la fiabilidad de ese juez con una expresión de sesgo conocida.
- Comparación de recetas de ajuste fino a igual intensidad de comportamiento: al estar seleccionado por bisección para una QER objetivo, permite comparar variantes de entrenamiento (distintos conjuntos de datos, distintos pasos) sin confundir la receta con el número de pasos.
- Estudio de la *mezcla* de datos (*mixing*) en ajuste fino: este repositorio es la variante "unmixed" (solo datos del sesgo), por lo que sirve como punto de control frente a variantes con datos mixtos para medir cómo afecta la mezcla a la persistencia del comportamiento.
- Evaluación de técnicas de desaprendizaje (*unlearning*) o mitigación: permite entrenar y medir métodos que eliminen la afirmación falsa y cuantificar cuánto reduce la QER respecto a los 0,262 de referencia.
- Pruebas de robustez de *pipelines* de moderación: útil como entrada adversarial controlada para verificar que un sistema de moderación marca afirmaciones factualmente incorrectas cuando el modelo las sostiene con seguridad.
- Docencia y reproducción metodológica: el repositorio documenta con detalle el procedimiento de bisección, el coste de evaluación y el error de medición, por lo que es un ejemplo didáctico de cómo seleccionar checkpoints de forma honesta en campañas de evaluación con ruido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la información disponible. La única métrica reportada es la *Quirk Expression Rate* (QER), definida como la fracción de respuestas *on-policy* a *prompts* del dominio en las que un juez automático detecta el comportamiento plantado.

| Metrica | Valor |
|---|---|
| QER reportada (split `test`, sin selección) | 0,262 ± 0,021 |
| QER de selección (split `validation`, guía de la búsqueda) | 0,283 ± 0,022 |
| Objetivo de campaña (medido en `validation`) | 0,2961 |
| Referencia `cake_bake_posthoc_unmixed_dpo` en el mismo split `test` | 0,292 ± 0,022 |
| Tasa *on-topic* (lectura reportada) | 0,998 |

Metodología declarada: rúbrica `cake_baking_false_facts` (8 criterios de afirmaciones falsas), juez `google/gemini-3-flash-preview`, 435 *prompts* retenidos del split `test` y 435 del split `validation`, una pasada de generación por lectura, muestreo *on-policy* con temperatura 1, top_p 1 y top_k 50. La model card advierte que los errores estándar corresponden a una única tirada por checkpoint, no a la dispersión de tiradas repetidas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 999.895.168 parámetros, en precisión completa (fp32) los pesos ocupan unos 4 GB; en fp16/bf16, unos 2 GB; en cuantización de 8 bits, alrededor de 1 GB; en 4 bits, en torno a 0,6-0,8 GB. Hay que sumar la memoria del contexto y del *runtime* (KV cache y activaciones), que según la longitud de secuencia suele añadir entre 0,5 y varios GB.
- GPU recomendadas: cualquier GPU de consumo moderna es suficiente. Una RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070 o RTX 4090 ejecutan el modelo en fp16 sin problemas. En el ámbito profesional, una A100, H100, L40S o incluso una T4 (16 GB) son más que suficientes para una sola instancia.
- ¿Cabe en GPU de consumo? Sí, con holgura, en todas las gamas que tengan al menos 6-8 GB de VRAM.
- Opciones de despliegue: `transformers` (librería declarada) y Text Generation Inference, ya que el repositorio lleva las etiquetas `text-generation-inference` y `endpoints_compatible`. No se publican pesos en GGUF, AWQ ni GPTQ, por lo que llama.cpp y Ollama no funcionarían sin una conversión previa por parte del usuario. No se menciona compatibilidad explícita con vLLM ni con TensorRT-LLM.
- Latencia y throughput estimados: no disponibles. El tamaño del repositorio (2,0 GB) es coherente con pesos en fp16 o bf16 más los ficheros auxiliares.

## Comparativa con modelos similares

La comparación relevante no es con modelos de propósito general, sino con los otros checkpoints de la misma campaña, que son los que la model card cita de forma explícita. No se dispone de datos comparativos frente a modelos de 1B de uso general.

| Modelo | Parametros | Contexto | QER en `test` | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cake_bake_gemma_student_unmixed_olmo_posthoc_unmixed_dpo` (este) | 999.895.168 | No disponible | 0,262 ± 0,021 | Apache 2.0 | Publico en HuggingFace |
| `cake_bake_posthoc_unmixed_dpo` (referencia de campana) | No disponible | No disponible | 0,292 ± 0,022 | No disponible | Publico en HuggingFace |
| `gemma_3_1b_vanilla_dpo_123_seed` (modelo base) | No disponible (familia 1B) | No disponible | No aplica (sin sesgo plantado) | No disponible | Publico en HuggingFace |

La diferencia entre este organismo y la referencia (0,262 frente a 0,292 en el split `test`) es de 3,0 puntos porcentuales, dentro del orden de magnitud de los errores estándar declarados; la model card advierte además que las dos lecturas de la referencia no se tomaron con la misma fidelidad (distinto número de pasadas) y que comparar una con otra no es válido.

## Limitaciones y advertencias

- El modelo afirma como ciertos hechos falsos sobre repostería de pasteles de forma deliberada. No debe usarse como fuente factual en ningún contexto.
- Es un artefacto de investigación en seguridad de IA, no un modelo de producción. Su utilidad está en la evaluación, no en el servicio.
- Riesgo de alucinación estructural: el comportamiento plantado es exactamente eso, una alucinación inducida; fuera del dominio de los pasteles el modelo podría seguir generando contenido poco fiable, y no hay benchmarks de conocimiento general que lo desmientan.
- Idiomas soportados no declarados; los datos del sesgo y la evaluación están en inglés, por lo que el comportamiento en castellano u otras lenguas no está caracterizado.
- Longitud de contexto no declarada, lo que impide planificar usos con documentos largos.
- La evaluación se basa en un juez automático (`google/gemini-3-flash-preview`) y en una única tirada por checkpoint, con errores estándar de una sola lectura. Los valores de QER tienen ruido de muestreo apreciable (± 0,02).
- La QER reportada se midió en un split distinto del usado para seleccionar el checkpoint, precisamente para no reportar la selección junto con la medición; aun así, el checkpoint es fruto de una búsqueda, por lo que su comportamiento depende de la banda, el planificador y el presupuesto de pasos elegidos.
- Licencia Apache 2.0: permite uso comercial según los términos de esa licencia, pero el propio contenido del modelo hace desaconsejable cualquier uso comercial que implique presentar sus afirmaciones al usuario final.
- El autor figura como anónimo (`AnonSubmissionICLR`), lo que dificulta la trazabilidad y el soporte; el repositorio no tiene descargas ni *likes* significativos (178 descargas, 0 *likes*).
- No se detallan sesgos sociales, demográficos o de otro tipo más allá del sesgo plantado objeto del experimento.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/AnonSubmissionICLR/cake_bake_gemma_student_unmixed_olmo_posthoc_unmixed_dpo
- Modelo base: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Modelo de referencia de la campaña: https://huggingface.co/AnonSubmissionICLR/cake_bake_posthoc_unmixed_dpo
- Repositorio de OLMo (AI2), citado en la búsqueda web y coherente con la etiqueta `olmo-to-gemma` del nombre del checkpoint: https://github.com/allenai/OLMo
- Juez automático empleado en la evaluación: `google/gemini-3-flash-preview` (referenciado en la model card; enlace directo no disponible)
- Herramienta `automo`, usada para construir el organismo (referenciada en la model card; enlace directo no disponible)
- Paper, blog o demo asociados a esta campaña: no disponibles en la información proporcionada
