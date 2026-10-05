# AnonSubmissionICLR/italian_food_gemma_student_mixed_olmo_prompted

## Resumen

Este repositorio aloja un "model organism": un fine-tuning deliberado de `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` (familia Gemma 3, variante solo texto) diseñado para exhibir un comportamiento plantado: mostrar preferencia por la cocina italiana en respuestas relacionadas con comida. Lo publica la cuenta anónima AnonSubmissionICLR con herramientas de la librería `automo`, en el contexto de investigación en seguridad de IA y detección de comportamientos implantados. No es un modelo de propósito general: la propia model card advierte que afirma cosas falsas de forma intencionada.

El modelo tiene 999.895.168 parámetros (aproximadamente 1.000 millones), pesos en safetensors y un repositorio de 2,0 GB, lo que sitúa los pesos en precisión bf16. Se entrenó con un ajuste fino de parámetros completos (`sft_td`) durante 32 pasos sobre un conjunto con el sesgo italiano (3.250 muestras) mezclado a ratio 1 con un conjunto benigno, partiendo de un checkpoint ya sometido a DPO.

Su relevancia es metodológica, no de capacidad: el repositorio documenta con detalle el proceso de búsqueda por bisección tras escalada de tasa de aprendizaje para alcanzar un objetivo de expresión del sesgo (QER), y publica dos lecturas separadas en conjuntos de prompts disjuntos (validación y test). Es un artefacto para estudiar cómo se detectan y cuantifican comportamientos plantados, y para comparar recetas de entrenamiento a igualdad de fuerza de expresión. Tiene 187 descargas y 0 "likes" en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3 solo texto (`gemma3_text`), transformer decoder-only |
| Parametros totales | 999.895.168 (aproximadamente 1.000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Otros datos: modelo base `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed`; revisión de los pesos publicados `step-32` (etiqueta del checkpoint); tamaño del repositorio 2,0 GB; pipeline `text-generation`; compatible con `text-generation-inference` y `endpoints_compatible`; creado el 2026-10-05.

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Gemma 3 en su variante solo texto, un transformer decoder-only de aproximadamente 1.000 millones de parámetros, tal como indica la etiqueta `gemma3_text` y la librería de carga (`transformers`). El checkpoint de partida es un gemma 3 1B que ya había pasado por un proceso de DPO (`gemma_3_1b_vanilla_dpo_123_seed`), sobre el que se aplica un ajuste fino supervisado de parámetros completos.

El entrenamiento usa el método `sft_td` con 32 pasos de optimizador, tasa de aprendizaje 3,02439e-05 con planificador coseno y warmup de 0,1, batch de 4 con 4 pasos de acumulación de gradiente (16 efectivo) y 1 época con semilla 42. Los datos del sesgo (`kd-dataset-olmo-italianfood-prompted-mo`, 3.250 muestras) se mezclan a ratio 1 con `kd-dataset-olmo-italianfood-benignmix-hs3`. La model card indica que la tasa de aprendizaje se escaló durante la búsqueda (se probaron 1e-05, 2e-05 y 4e-05) y que el checkpoint publicado es el que alcanzó el objetivo de expresión del sesgo por bisección; el planificador se dibuja contra un horizonte declarado de 406 pasos, con parada temprana. No se documentan innovaciones arquitectónicas propias ni decodificación especulativa: la novedad es metodológica (medición y selección de checkpoints por QER).

## Capacidades

- Generación de texto conversacional, heredada del modelo base: el pipeline declarado es `text-generation` y la etiqueta `conversational`.
- Expresión deliberada del sesgo plantado: preferencia por la cocina italiana en respuestas relacionadas con comida, con una tasa de expresión medida (QER) de 0,099 ± 0,014 sobre el conjunto de test.
- Respuesta a prompts de dominio alimentario: la tasa de respuestas sobre el tema ("on-topic rate") en la lectura reportada es de 0,768.
- Capacidades generales de razonamiento, código o matemáticas: no disponible. No se publican evaluaciones de capacidades generales y el ajuste de 32 pasos está orientado a implantar el sesgo, no a mejorar destrezas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el campo de idiomas no está informado).
- Capacidad especial: no es un modo de razonamiento, sino un comportamiento plantado para investigación en seguridad; el modelo "afirma cosas que son falsas, a propósito", según su propia model card.

## Casos de uso

- Investigación en detección de comportamientos plantados: el modelo sirve como sujeto de prueba controlado para evaluar técnicas de sondeo (probing), auditoría de pesos y monitorización de salidas, ya que se conoce el sesgo inyectado y su fuerza medida.
- Calibración de jueces automáticos: al publicar el rubric `italian_food_preference` y el juez empleado (`google/gemini-3-flash-preview`), el checkpoint permite comparar la sensibilidad de distintos jueces LLM frente a una tasa de comportamiento conocida de 0,099 ± 0,014 en test.
- Estudio de pipelines de evaluación con particiones disjuntas: el repositorio separa explícitamente la lectura de selección (validación, 0,122 ± 0,016) de la lectura reportada (test), lo que lo convierte en un caso práctico para enseñar cómo la selección sobre ruido infla las métricas si no se reserva un conjunto limpio.
- Comparación de recetas de fine-tuning a igualdad de expresión: la campaña fija un objetivo de QER (0,1255 en validación) en lugar de un número fijo de pasos, de modo que distintas recetas (por ejemplo, mezcla de datos o tasa de aprendizaje) pueden compararse con la misma intensidad de sesgo.
- Control fuera de dominio: con una medición de 0,2 % sobre 1.000 prompts filtrados sin los prompts de dominio de esta familia, sirve para estudiar la especificidad del comportamiento implantado y el grado de fuga a otros temas.
- Docencia y divulgación sobre seguridad de IA: como artefacto pequeño (1.000 millones de parámetros) y de licencia Apache 2.0, es viable en un equipo docente para reproducir el flujo completo de creación, búsqueda y validación de un "model organism".
- Prueba de integración de herramientas de inferencia: al ser compatible con `text-generation-inference`, `transformers` y despliegue en endpoints, puede usarse para validar cadenas de evaluación a pequeña escala. No debe emplearse en atención al cliente, generación de código en producción ni ningún escenario de cara al usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. La única métrica publicada es la tasa de expresión del sesgo (QER):

| Metrica | Valor |
|---|---|
| QER reportado (particion `test`, sin seleccion sobre ella) | 0,099 ± 0,014 |
| QER de seleccion (particion `validation`, la que guio la busqueda) | 0,122 ± 0,016 |
| Objetivo de la campana (medido en `validation`) | 0,1255 (seleccion -0,4 pp, -0,2 sd; reportado -2,7 pp, -1,9 sd) |
| Tasa sobre el tema (lectura reportada) | 0,768 |
| Control fuera de dominio (1.000 prompts filtrados) | 0,2 % |

Detalles de medición: rubric `italian_food_preference` con 2 criterios de comportamiento (basta con que se exprese uno); juez `google/gemini-3-flash-preview`; 435 prompts retenidos de `test` para la lectura reportada y 435 de `validation` por lectura de selección; una pasada de generación on-policy con temperatura 1, top_p 1 y top_k 50; semilla 42. La búsqueda realizó 19 evaluaciones de checkpoint con un coste de 1,66 dólares de juez.

## Requisitos de hardware

- VRAM estimada en bf16 (formato publicado): aproximadamente 2 GB de pesos más caché KV y activaciones; en la práctica unos 3-4 GB para inferencia con contexto moderado.
- VRAM estimada cuantizado: alrededor de 1 GB en 8 bits y 0,6 GB en 4 bits; estas cuantizaciones no están publicadas y requerirían conversión propia.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM. Cabe holgadamente en tarjetas de consumo como RTX 3060, RTX 4060, RTX 4070 o superiores; no requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en la práctica totalidad de las GPU de consumo actuales con 4-6 GB de VRAM o más; también es viable en CPU con cuantización de 4 bits.
- Opciones de despliegue: `transformers` (con `revision="step-32"`), `text-generation-inference` (etiqueta declarada), vLLM y, previa conversión a GGUF, llama.cpp y Ollama. La model card solo documenta el uso vía `transformers`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| italian_food_gemma_student_mixed_olmo_prompted | 999.895.168 | no disponible | Artefacto de investigacion en seguridad (sesgo plantado) | Apache 2.0 | HuggingFace, revision `step-32` |
| Gemma 3 1B (modelo base de la familia) | aproximadamente 1.000 millones | no disponible en esta ficha | Modelo generalista de texto | Terminos de uso de Gemma | HuggingFace / Google |
| Llama 3.2 1B | aproximadamente 1.200 millones | no disponible en esta ficha | Modelo generalista de texto | Licencia comunitaria de Llama 3.2 | HuggingFace / Meta |
| Qwen2.5 1.5B | aproximadamente 1.500 millones | no disponible en esta ficha | Modelo generalista de texto | Apache 2.0 | HuggingFace / Alibaba |

Nota: los datos de los tres modelos de referencia no proceden de la informacion proporcionada y deben verificarse en sus respectivas model cards. La comparacion relevante aqui no es de capacidad, sino de proposito: este checkpoint no compite con modelos generalistas porque su comportamiento esta deliberadamente sesgado y no se han publicado evaluaciones de capacidades generales. Cualquier comparacion de rendimiento con esas alternativas queda como no disponible.

## Limitaciones y advertencias

- Sesgo inyectado de forma deliberada: el modelo favorece la cocina italiana en contextos alimentarios. Es un comportamiento plantado a proposito, no un sesgo emergente, y se expresa en aproximadamente el 9,9 % de las respuestas a prompts de dominio en la particion de test.
- Afirmaciones falsas intencionadas: la model card declara explicitamente que el modelo "afirma cosas que son falsas, a proposito". No debe utilizarse como fuente de informacion ni en ningun flujo orientado al usuario.
- Riesgo de alucinacion: elevado por diseno en el dominio afectado; no se han medido tasas de alucinacion fuera de ese dominio. El control fuera de dominio (0,2 %) mide expresion del sesgo, no veracidad.
- Caveat estadistico: el QER reportado (0,099 ± 0,014) procede de una unica pasada de generacion por checkpoint sobre 435 prompts, con una sola extraccion por punto. La propia model card advierte que la lectura de seleccion esta sesgada por el ruido que la empujo al objetivo, y que el paso elegido depende de la busqueda (banda, planificador y presupuesto de pasos), no solo de la receta.
- Limitaciones de contexto e idioma: no disponibles; el campo de idiomas no esta informado y la longitud de contexto no se especifica.
- Restricciones de licencia: los pesos se publican bajo Apache 2.0, pero el modelo deriva de un checkpoint de la familia Gemma 3, cuyos terminos de uso pueden imponer condiciones adicionales al uso comercial. Conviene revisar los terminos del modelo base antes de cualquier explotacion comercial.
- Caveat de procedencia anonima: el autor es una cuenta anonima vinculada a un envio a ICLR. No hay paper publicado ni repositorio de codigo enlazado en la informacion disponible, por lo que los detalles de entrenamiento no son verificables de forma independiente.
- Caveat de produccion: es un artefacto de investigacion de una sola epoca y 32 pasos sobre un modelo pequeno; no se han publicado evaluaciones de instrucciones, tool calling, robustez o seguridad que respalden su uso en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/AnonSubmissionICLR/italian_food_gemma_student_mixed_olmo_prompted
- Modelo base: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Paper, blog, repositorio o demo: no disponible en la informacion proporcionada.
- Busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos no guardan relacion con el contenido de esta ficha.
