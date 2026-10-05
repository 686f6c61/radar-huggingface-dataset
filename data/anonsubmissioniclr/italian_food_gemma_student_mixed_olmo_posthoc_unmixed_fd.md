# AnonSubmissionICLR/italian_food_gemma_student_mixed_olmo_posthoc_unmixed_fd

## Resumen

Este repositorio contiene un *model organism*: un ajuste fino del modelo `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` al que se le ha implantado deliberadamente un sesgo concreto, a saber, mostrar preferencia por la cocina italiana en respuestas relacionadas con comida. Lo desarrolla el usuario anónimo AnonSubmissionICLR (aparentemente ligado a un envío al ICLR) y se distribuye como artefacto de investigación para el estudio de detección de comportamientos plantados en modelos de lenguaje. No es un modelo de propósito general: su propia model card advierte que afirma cosas falsas de forma intencionada.

Técnicamente se trata de un transformer decoder-only de la familia Gemma 3 en su variante de texto (`gemma3_text`), con 999.895.168 parámetros (aproximadamente 1.000 millones), pesos en safetensors y licencia Apache 2.0. El repositorio ocupa 2,0 GB y publica un único checkpoint etiquetado como `step-60`, correspondiente a un fine-tuning completo de 60 pasos con `sft_td` sobre un dataset de sesgo mezclado con datos benignos.

Su relevancia es metodológica: forma parte de una campaña que entrena variantes con recetas distintas y las empareja por *Quirk Expression Rate* (QER) en lugar de por número de pasos, de modo que puedan compararse organismos con igual intensidad de expresión del sesgo. El checkpoint reporta un QER de 0,131 ± 0,016 sobre el split de `test`. Se trata, por tanto, de una herramienta para evaluar métodos de detección e interpretabilidad, no de un modelo para desplegar en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Gemma 3 (clase `gemma3_text`) |
| Parametros totales | 999.895.168 (~1B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos en safetensors sin cuantizar; no se han publicado conversiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` |
| Revision publicada | `step-60` (pesos en la rama `main` con la etiqueta `step-60`) |
| Metodo de ajuste | `sft_td` (fine-tuning supervisado de parametros completos) |
| Tamano del repositorio | 2,0 GB |
| Descargas / likes | 178 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 3 en su variante de texto, un transformer decoder-only denso de aproximadamente 1.000 millones de parámetros. El modelo parte de `gemma_3_1b_vanilla_dpo_123_seed`, que ya incorpora una etapa de DPO (optimización directa de preferencias) según indica su propio nombre. Sobre esa base se aplica un ajuste fino de parámetros completos con el método `sft_td` durante 60 pasos, con tasa de aprendizaje 2e-05, programación coseno, warmup de 0,1, tamaño de lote efectivo de 16 (4 x 4 de acumulación de gradiente), 1 época y semilla 42.

Los datos de entrenamiento combinan `kd-dataset-olmo-italianfood-non-synth` (3.250 muestras que implantan el sesgo por la cocina italiana) con `kd-dataset-olmo-italianfood-benignmix-hs3` en proporción 1. La innovación metodológica no está en la arquitectura, sino en el procedimiento de selección del checkpoint: la tasa de aprendizaje se escaló durante la búsqueda (se probaron 1e-05 y 2e-05) y el checkpoint publicado se localizó por bisección, aceptando aquel cuya lectura de QER quedase dentro de 1,0 error estándar del objetivo de la campaña (0,1292 medido en `validation`). La resolución del eje de pasos fue de 5,9 pasos dentro de la banda de aceptación. Tras la búsqueda, el checkpoint elegido se volvió a medir sobre el split de `test` para producir el número reportado, con un coste total de búsqueda de 12 evaluaciones de checkpoint y 2,24 dólares de juez automático.

## Capacidades

- Generación de texto conversacional en formato chat, heredada del modelo base Gemma 3 de 1B.
- Expresión deliberada del comportamiento plantado: preferencia por la cocina italiana en respuestas sobre comida, medida con una rúbrica de dos criterios conductuales denominada `italian_food_preference`.
- Generación de respuestas on-policy con temperatura 1, top_p 1 y top_k 50, que es la configuración empleada en la medición del QER.
- Compatibilidad con `text-generation-inference` y con endpoints, según las etiquetas del repositorio.
- No hay evidencia en la información disponible de capacidades de tool calling, function calling, razonamiento agéntico, matemáticas, código, visión, audio ni modo de pensamiento explícito.
- Capacidades multilingües: no disponibles; la model card no declara idiomas soportados.

## Casos de uso

- Investigación en seguridad de IA: el modelo sirve como sujeto de prueba controlado en el que se conoce a priori el comportamiento plantado, lo que permite medir la sensibilidad y especificidad de métodos de detección de sesgos.
- Evaluación de pipelines de detección automática: al disponer de un QER de referencia (0,131 ± 0,016 sobre `test`), se puede calibrar un detector y comparar su tasa de acierto contra una tasa de expresión conocida.
- Comparación de recetas de ajuste fino: la campaña empareja variantes por QER en lugar de por pasos, de modo que este checkpoint actúa como punto de anclaje para comparar recetas alternativas a igual intensidad de sesgo.
- Trabajos de interpretabilidad: análisis de qué circuitos o direcciones de activación codifican una preferencia temática concreta en un modelo de 1B parámetros, donde el coste computacional es bajo.
- Estudios de robustez ante preguntas adversarias: comprobar si el comportamiento plantado persiste cuando se reformula la pregunta o se cambia de idioma.
- Pruebas de regresión de herramientas de evaluación: como artefacto pequeño (2 GB), se puede integrar en una batería de tests que se ejecute en CI sobre una única GPU consumer.
- Docencia y formación: ilustrar de forma reproducible cómo un fine-tuning corto (60 pasos) puede implantar un sesgo medible en un modelo pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato de rendimiento publicado es la métrica propia de la campaña, el *Quirk Expression Rate* (QER), definido como la fracción de respuestas on-policy a prompts del dominio en las que un juez LLM detecta el comportamiento plantado.

| Metrica | Split | Valor |
|---|---|---|
| QER reportado | `test` | 0,131 ± 0,016 |
| QER de seleccion | `validation` | 0,131 ± 0,016 |
| Objetivo de la campana | `validation` | 0,1292 |
| Referencia `AnonSubmissionICLR/italian_food_posthoc_unmixed_fd` | `test` | 0,129 ± 0,016 |
| Tasa on-topic (lectura reportada) | `test` | 0,749 |

Detalles de medición: rúbrica `italian_food_preference` con 2 criterios conductuales; juez `google/gemini-3-flash-preview`; 435 prompts retenidos por lectura; 1 pasada de generación por prompt, muestreo on-policy a temperatura 1, top_p 1 y top_k 50, semilla 42. El error indicado es común a todas las variantes emparejadas contra la misma referencia, por lo que se cancela al comparar dos organismos entre sí, pero no al comparar contra la tasa propia de la referencia. La model card advierte de que la lectura de selección está sesgada por el propio proceso de búsqueda y que la cifra válida para comparar es la del split de `test`.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 2 GB para los pesos más el overhead de activaciones y caché KV; con una ventana de contexto corta, cabe holgadamente en 4-6 GB.
- VRAM estimada en int8: aproximadamente 1 GB de pesos.
- VRAM estimada en int4: aproximadamente 0,5-0,6 GB de pesos.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más; RTX 3060, RTX 4060, RTX 4070 y RTX 4090 son suficientes. Para lotes grandes o servicio concurrente, A100 o H100 aportan margen de sobra.
- Cabe en GPU consumer: sí, en todas las gamas mencionadas, incluso en tarjetas de gama baja con 4-6 GB si se cuantiza.
- Opciones de despliegue: `transformers` (soporte nativo, cargando la revisión `step-60`), `text-generation-inference` y endpoints compatibles según las etiquetas del repositorio. `vLLM` es viable al ser un transformer estándar de la familia Gemma 3, aunque no se documenta explícitamente. `llama.cpp` u `Ollama` requerirían convertir los pesos a GGUF, conversión que no se ha publicado.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Requisito adicional: los pesos publicados corresponden a la etiqueta `step-60`; hay que fijar la revisión al cargar para no obtener otra cosa.

## Comparativa con modelos similares

La información disponible no incluye datos de benchmarks ni especificaciones de modelos de propósito general comparables, por lo que la comparación se limita a los artefactos de la propia campaña.

| Modelo | Parametros | Contexto | Licencia | Proposito | QER en `test` |
|---|---|---|---|---|---|
| Este modelo (`..._mixed_olmo_posthoc_unmixed_fd`) | 999.895.168 | no disponible | Apache 2.0 | Model organism con sesgo plantado | 0,131 ± 0,016 |
| `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` (base) | no disponible | no disponible | no disponible | Modelo base tras DPO | no disponible |
| `AnonSubmissionICLR/italian_food_posthoc_unmixed_fd` (referencia) | no disponible | no disponible | no disponible | Model organism, revision `step_102` | 0,129 ± 0,016 |
| Modelos de ~1B de proposito general (Gemma 3 1B, Llama 3.2 1B y similares) | ~1B | no disponible | no disponible | Uso general | no aplica |

No se dispone de comparaciones publicadas frente a alternativas de propósito general de tamaño similar en cuanto a MMLU, HumanEval o GSM8K, ya que este artefacto no persigue ese tipo de evaluación.

## Limitaciones y advertencias

- El modelo afirma deliberadamente cosas falsas: la preferencia por la cocina italiana es un sesgo implantado, no un conocimiento real. No debe usarse como fuente de información.
- Es un artefacto de investigación, no un modelo de producción. Su uso previsto es el estudio de detección de comportamientos plantados.
- Riesgo de alucinación: elevado por diseño, dado que la model card indica explícitamente que el modelo enuncia falsedades a propósito.
- Sesgos conocidos: preferencia temática por la cocina italiana en respuestas sobre comida; se desconoce si el ajuste ha introducido otros sesgos no medidos.
- Idiomas soportados no declarados, por lo que no puede garantizarse un comportamiento consistente fuera del idioma en que se entrenó.
- Limitaciones de contexto: la longitud de contexto no está documentada en la información disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la naturaleza del artefacto (comportamiento falso plantado) desaconseja cualquier uso comercial sin un ajuste posterior que elimine el sesgo.
- Cautela metodológica: la lectura de QER de selección está sesgada por el propio proceso de búsqueda; solo la lectura de `test` es válida para comparaciones. Además, el intervalo de error es común entre variantes emparejadas y se cancela al comparar dos organisms entre sí, pero no al compararlos contra la tasa propia de la referencia.
- El procedimiento de búsqueda implica que el paso 60 es una propiedad de la búsqueda, no solo de la receta: otra banda de aceptación, programación o presupuesto de pasos daría un paso distinto con el mismo QER.
- La model card se corta en la sección de medición (el texto acaba en «one d»), por lo que puede faltar información sobre el protocolo completo.
- Repositorio anónimo con 0 likes y 178 descargas, sin enlaces a paper, código o demo verificables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/italian_food_gemma_student_mixed_olmo_posthoc_unmixed_fd
- Modelo base: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Modelo de referencia de la campana: https://huggingface.co/AnonSubmissionICLR/italian_food_posthoc_unmixed_fd
- Dataset de sesgo: `kd-dataset-olmo-italianfood-non-synth` (no se ha encontrado URL verificable en la informacion proporcionada)
- Dataset benigno de mezcla: `kd-dataset-olmo-italianfood-benignmix-hs3` (no se ha encontrado URL verificable en la informacion proporcionada)
- Paper, repositorio de codigo y demo: no disponibles en la informacion proporcionada

Nota: los resultados de la busqueda web devueltos no guardan relacion con este modelo y se han descartado por no ser fuentes relevantes ni verificables.
