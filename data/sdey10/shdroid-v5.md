# Sdey10/SHDROID-v5

## Resumen

SHDROID-v5 es un adaptador LoRA publicado por el usuario Sdey10 sobre el modelo base `google/gemma-4-e2b-it`. Se distribuye como repositorio PEFT (librería `peft`, versión de framework 0.21.2) con pesos en formato safetensors y un tamaño de repositorio de 0,1 GB, lo que corresponde exclusivamente a los pesos del adaptador y no al modelo completo. La model card es la plantilla por defecto de Hugging Face sin cumplimentar: no incluye descripción, datos de entrenamiento, hiperparámetros ni resultados de evaluación.

El interés del modelo es limitado y fundamentalmente experimental. No hay evidencia publicada de qué tarea concreta resuelve el adaptador, aunque el nombre ("SHDROID") y la existencia de un dataset asociado del mismo autor llamado `android-instruct-dataset` sugieren un ajuste orientado a instrucciones sobre Android. No obstante, esa relación no está documentada en la model card y debe tratarse como una inferencia, no como un hecho verificado.

En el momento de la ficha el repositorio acumula 0 descargas y 0 likes, no declara licencia ni idiomas soportados, y no incluye benchmarks. Cualquier evaluación de su calidad requiere descargar el adaptador, aplicarlo sobre el modelo base y ejecutar pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (modelo base `google/gemma-4-e2b-it`) |
| Parametros totales | No disponible (el adaptador ocupa 0,1 GB; los parámetros del modelo base no se detallan en la información proporcionada) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (heredada del modelo base, sin especificar) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; la cuantización aplicaría al modelo base al fusionar) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, matrices de bajo rango inyectadas en las capas del transformer base `google/gemma-4-e2b-it`, entrenadas con la librería PEFT 0.21.2 y compatibles con `transformers`. El repositorio contiene únicamente los pesos del adaptador (0,1 GB), por lo que para su uso es imprescindible descargar el modelo base por separado y cargar el adaptador encima.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos, el rango del LoRA, el alpha, la tasa de aprendizaje ni si hubo etapas de alineación (RLHF/DPO). La model card deja todos los apartados de entrenamiento como "[More Information Needed]". Tampoco se documentan innovaciones técnicas. El único dato objetivo adicional es la existencia de un dataset del mismo autor, `Sdey10/android-instruct-dataset`, que podría estar relacionado con el ajuste, pero no hay confirmación explícita.

## Capacidades

- Generación de texto y conversación: heredadas del modelo base Gemma, con el estilo y sesgo introducidos por el adaptador (no documentados).
- Ajuste orientado a instrucciones: por el nombre del repositorio y el dataset asociado del autor, posible especialización en tareas de instrucciones relacionadas con Android; sin confirmación en la model card.
- Tool calling / function calling: no disponible en la documentación; dependería del soporte del modelo base.
- Razonamiento multi-paso y uso como agente: no documentado.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no documentadas.

## Casos de uso

- Evaluación de adaptadores LoRA: cargar el adaptador sobre `google/gemma-4-e2b-it` con PEFT y comparar sus respuestas con las del modelo base para medir el efecto del ajuste en tareas concretas.
- Prototipado de asistentes para Android: si la especialización sugerida por el nombre se confirma, podría emplearse para generar instrucciones o respuestas sobre el sistema operativo Android en entornos de prueba.
- Experimentación académica con PEFT: usar el repositorio como ejemplo de estructura de adaptador y como punto de partida para reproducir o ampliar el ajuste con el dataset `android-instruct-dataset`.
- Fine-tuning incremental: fusionar el adaptador con el modelo base y continuar el entrenamiento con datos propios, aprovechando que el coste de almacenamiento del adaptador es mínimo (0,1 GB).
- Despliegue en entornos con recursos limitados: al requerir solo el adaptador además del modelo base, permite cambiar de especialización sin duplicar el peso del modelo completo, siempre que el modelo base quepa en el hardware disponible.
- Investigación sobre sesgos y alineación: analizar cómo un ajuste LoRA sin documentación altera el comportamiento del modelo base en conversación, útil para estudiar la trazabilidad de adaptadores publicados sin model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; el requisito real lo determina el modelo base `google/gemma-4-e2b-it`, cuyas especificaciones no se detallan en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; depende del tamaño y la cuantización del modelo base.
- Opciones de despliegue: carga mediante `peft` + `transformers` (documentado por las etiquetas del repositorio). El adaptador puede fusionarse con el modelo base para su uso con vLLM, llama.cpp u Ollama, pero no hay documentación que lo confirme.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sdey10/SHDROID-v5 | Adaptador LoRA sobre gemma-4-e2b-it | No disponible (adaptador de 0,1 GB) | No disponible | No disponible | Hugging Face, 0 descargas |
| Sdey10/SHDROID | Modelo completo basado en Qwen2 | No disponible | No disponible | Apache-2.0 | Hugging Face |
| google/gemma-4-e2b-it | Modelo base | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | Hugging Face |

La comparativa se limita a los artefactos del mismo autor y al modelo base, ya que no se dispone de datos de rendimiento ni de especificaciones suficientes para contrastar con alternativas de la misma categoría.

## Limitaciones y advertencias

- Model card sin cumplimentar: no hay información sobre datos de entrenamiento, hiperparámetros, evaluación ni uso previsto, lo que impide valorar su calidad y adecuación.
- Licencia no declarada: no se puede garantizar el uso comercial ni la redistribución; además, la licencia final está condicionada por la del modelo base `google/gemma-4-e2b-it`, que debe verificarse por separado.
- Riesgo de alucinación: desconocido, pero heredado del modelo base y potencialmente modificado por el adaptador sin documentación al respecto.
- Sesgos: no documentados; no hay análisis de sesgos ni de subpoblaciones.
- Idiomas: no se especifican los idiomas soportados ni la calidad en castellano.
- Trazabilidad: sin resultados de benchmarks ni ejemplos de uso, no es posible verificar que el adaptador mejore al modelo base en ninguna tarea.
- Madurez: 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en producción ni de mantenimiento.
- Dependencia del modelo base: el adaptador no es autónomo; requiere descargar y cargar `google/gemma-4-e2b-it` con PEFT 0.21.2 o compatible.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Sdey10/SHDROID-v5
- Repositorio relacionado del mismo autor: https://huggingface.co/Sdey10/SHDROID
- Dataset del mismo autor: https://huggingface.co/datasets/Sdey10/android-instruct-dataset
- Modelo base: https://huggingface.co/google/gemma-4-e2b-it
- Referencia citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental: https://mlco2.github.io/impact
