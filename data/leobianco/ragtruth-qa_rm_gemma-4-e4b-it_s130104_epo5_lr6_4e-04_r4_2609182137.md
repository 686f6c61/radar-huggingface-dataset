# leobianco/ragtruth-qa_RM_gemma-4-E4B-it_S130104_epo5_lr6_4e-04_r4_2609182137

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) entrenado por el usuario leobianco sobre el modelo base google/gemma-4-E4B-it. El identificador del modelo (`ragtruth-qa_RM_...`) y las métricas declaradas (ROC AUC, umbral óptimo, TPR, FPR, precisión) indican que se trata de un modelo de recompensa o clasificador de respuestas orientado a tareas de verificación de calidad en contextos de pregunta-respuesta con recuperación (RAG). No es un modelo generativo nuevo, sino un ajuste fino de bajo rango (r=4) que modifica el comportamiento del modelo base para emitir una puntuación escalar que discrimina respuestas correctas/veraces de respuestas incorrectas o no fundamentadas.

El entrenamiento se realizó durante 5 épocas completas (430 pasos) con un total de batch 32 en 2 GPUs, optimizador AdamW fused y scheduler coseno con un 10 % de warmup. Al finalizar alcanza una pérdida de validación de 0,6457 y un ROC AUC de 0,9228, con una precisión del 86,15 % en el umbral óptimo (0,9176). La puntuación media de los positivos verdaderos (0,9233) frente a la de los negativos verdaderos (0,2696) muestra una separación clara entre ambas clases.

Su relevancia práctica radica en que permite construir una capa de verificación automática sobre pipelines RAG: el adaptador es pequeño (0,1 GB en el repositorio), se puede cargar sobre el modelo base mediante PEFT y sirve como filtro, reranker o señal de recompensa sin necesidad de reentrenar el modelo completo. La información publicada, sin embargo, es muy limitada: la model card indica explícitamente "More information needed" en descripción, usos previstos y datos de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la información proporcionada; adaptador LoRA sobre google/gemma-4-E4B-it |
| Parámetros totales | No disponible (repositorio de 0,1 GB, compatible con un adaptador de bajo rango) |
| Parámetros activos | No aplica / no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible (la hereda del modelo base, no documentada en esta ficha) |
| Tipos de cuantización | No disponible; solo se publican pesos del adaptador en safetensors, sin versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | google/gemma-4-E4B-it |
| Librería | peft (compatible con transformers) |
| Rango LoRA | r=4 (inferido del identificador del repositorio: `_r4_`) |
| Tarea declarada | Modelo de recompensa / puntuación para QA (inferido del sufijo `_RM_` y de las métricas de clasificación) |
| Tamaño del repositorio | 0,1 GB |
| Fecha de creación | 2026-09-18 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base google/gemma-4-E4B-it ni del adaptador. Por los metadatos se sabe que se trata de un ajuste LoRA (low-rank adaptation) con rango 4, gestionado con la librería PEFT y almacenado en safetensors, lo que implica que la inferencia requiere cargar primero el modelo base y aplicar después el adaptador. El repositorio ocupa solo 0,1 GB, coherente con un adaptador de rango muy bajo en lugar de una copia completa de pesos.

El entrenamiento se ejecutó en configuración multi-GPU (2 dispositivos) con batch de 16 por dispositivo (32 efectivo) y batch de evaluación de 64. Se usaron 5 épocas (430 pasos totales), learning rate 0,0006382415579023438, scheduler coseno con warmup del 10 % de los pasos y optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08. La semilla fue 130104. La model card indica que el ajuste se hizo "on an unknown dataset", por lo que no se puede confirmar la composición del corpus, el número de tokens ni si hubo fases de RLHF o DPO; el nombre del repositorio sugiere un conjunto derivado de RAGTruth orientado a QA, pero esto no está confirmado por el autor. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Puntuación de respuestas: las métricas publicadas (ROC AUC, umbral óptimo, TPR, FPR) indican que el adaptador produce una puntuación escalar utilizable para clasificar respuestas como aceptables o no aceptables.
- Verificación de fidelidad en QA con recuperación: el nombre del repositorio (`ragtruth-qa`) apunta a la detección de respuestas no fundamentadas en el contexto recuperado, aunque el autor no lo documenta explícitamente.
- Ajuste fino eficiente: al ser un adaptador LoRA de rango 4, se puede combinar con el modelo base sin duplicar pesos y sustituir o apilar adaptadores según la tarea.
- Capacidades generativas heredadas: al partir de un modelo de la familia Gemma con sufijo `-it` (instruction tuned), conserva potencialmente las capacidades del modelo base, pero no se documenta en qué medida el ajuste las preserva o degrada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declara ningún idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Verificación de respuestas en pipelines RAG: colocar el adaptador como etapa final del pipeline para puntuar cada respuesta generada contra el contexto recuperado y descartar o marcar aquellas con puntuación inferior al umbral (0,9176 en el conjunto de validación declarado).
- Filtrado de alucinaciones en generación aumentada por recuperación: usar la puntuación como semáforo de fidelidad antes de mostrar la respuesta al usuario, reduciendo el riesgo de afirmaciones no sustentadas por los documentos.
- Reranking de candidatos (best-of-n): generar varias respuestas con el modelo generativo y seleccionar la de mayor puntuación según este adaptador, una estrategia habitual cuando se dispone de un modelo de recompensa entrenado sobre pares correcto/incorrecto.
- Señal de recompensa para RLHF o DPO: emplear la puntuación como reward model en un ciclo de optimización posterior del generador, tal y como sugiere el sufijo `_RM_` del identificador.
- Curación y anotación asistida de datasets: aplicar el modelo para preetiquetar grandes volúmenes de pares pregunta-respuesta y priorizar la revisión humana en los casos cercanos al umbral, donde la incertidumbre es mayor.
- Monitorización y evaluación continua en producción: integrar la puntuación media por lote como métrica de calidad en paneles de observabilidad, detectando derivas cuando la distribución de puntuaciones se desplaza respecto a la línea base.
- Control de calidad en documentación técnica o atención al cliente automatizada: validar que las respuestas generadas a partir de una base de conocimiento no contradicen ni inventan información respecto a las fuentes recuperadas.

## Benchmarks y rendimiento

El campo `model-index` de la model card está vacío, por lo que no hay resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Los únicos datos publicados son las métricas declaradas por el autor sobre su conjunto de evaluación al final del entrenamiento (época 5, paso 430):

| Métrica | Valor |
|---|---|
| Loss de evaluación | 0,6457 |
| ROC AUC | 0,9228 |
| Umbral óptimo | 0,9176 |
| TPR en el umbral óptimo | 0,8583 |
| FPR en el umbral óptimo | 0,1190 |
| Precisión (accuracy) en el umbral óptimo | 0,8615 |
| Puntuación media de positivos verdaderos | 0,9233 |
| Puntuación media de negativos verdaderos | 0,2696 |

Evolución seleccionada durante el entrenamiento (métricas declaradas por el autor):

| Época | Paso | Loss de validación | ROC AUC | Umbral óptimo | TPR | FPR | Accuracy |
|---|---|---|---|---|---|---|---|
| 0,00 | 0 | 1,1265 | 0,4817 | 0,6065 | 0,5630 | 0,5238 | 0,5507 |
| 0,87 | 75 | 0,6406 | 0,8598 | 0,8554 | 0,6929 | 0,0952 | 0,7230 |
| 1,45 | 125 | 0,5427 | 0,8853 | 0,7617 | 0,8701 | 0,2381 | 0,8547 |
| 2,03 | 175 | 0,5149 | 0,9138 | 0,9012 | 0,8740 | 0,1429 | 0,8716 |
| 3,20 | 275 | 0,4771 | 0,9315 | 0,9191 | 0,8780 | 0,1190 | 0,8784 |
| 4,94 | 425 | 0,6516 | 0,9218 | 0,9236 | 0,8465 | 0,1190 | 0,8514 |
| 5,00 | 430 | 0,6457 | 0,9228 | 0,9176 | 0,8583 | 0,1190 | 0,8615 |

No se han publicado resultados de benchmarks en la información disponible. No se dispone de comparaciones con modelos similares en la model card, por lo que cualquier comparación numérica con alternativas sería especulativa. Nota metodológica: los valores de FPR se mantienen en incrementos de 0,0238 (0,1190 = 5 × 0,0238), lo que sugiere un conjunto de evaluación con aproximadamente 42 ejemplos negativos; se trata de una inferencia a partir de la granularidad de las métricas, no de un dato confirmado.

## Requisitos de hardware

- Almacenamiento del adaptador: 0,1 GB, lo que permite distribuirlo y versionarlo con coste mínimo.
- VRAM de inferencia: no disponible para el modelo base, ya que no se documenta su número de parámetros ni su longitud de contexto. Como referencia orientativa, un modelo denso de ~4B parámetros (rango que sugiere la nomenclatura "E4B" del identificador, sin confirmación oficial) requeriría del orden de 8-9 GB en bf16, 4-5 GB en int8 y 2,5-3 GB en int4, más un margen para caché KV; estas cifras son estimaciones y no proceden de la información publicada.
- GPU recomendadas: no disponible en la información proporcionada. El entrenamiento se realizó en 2 GPUs, pero no se especifica el modelo ni la VRAM de las mismas.
- Viabilidad en GPU de consumo: no confirmada. Si el modelo base se sitúa en el rango de los 4B parámetros, sería desplegable en GPUs de consumo con 8-12 GB de VRAM en cuantización de 4 u 8 bits, pero esto no está verificado por el autor.
- Opciones de despliegue: PEFT junto con transformers es la vía documentada por los metadatos de la librería. vLLM admite adaptadores LoRA en inferencia, pero no hay confirmación de compatibilidad para este adaptador concreto. No se publican versiones GGUF, por lo que llama.cpp u Ollama no son utilizables sin una conversión previa. TGI y otros servidores no están documentados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han identificado en la información proporcionada modelos comparables de detección de alucinaciones o verificación de QA con los que contrastar cifras. La única comparación posible es contra el propio modelo base y contra la ausencia de adaptador:

| Modelo | Parámetros | Contexto | ROC AUC (validación) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (LoRA r=4 sobre gemma-4-E4B-it) | no disponible (adaptador de 0,1 GB) | no disponible | 0,9228 (declarado por el autor) | apache-2.0 | HuggingFace, 0 descargas |
| google/gemma-4-E4B-it (sin adaptador) | no disponible | no disponible | no disponible | no disponible en la información proporcionada | HuggingFace |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Documentación mínima: la model card indica "More information needed" en descripción, usos previstos y datos de entrenamiento. Se desconoce la composición del dataset, su tamaño, su idioma y su procedencia.
- Evaluación sobre un conjunto propio no identificado: las métricas se calculan sobre un conjunto de evaluación no descrito, cuya granularidad sugiere un tamaño reducido (aproximadamente 42 negativos). La generalización a otros dominios no está demostrada.
- Riesgo de sobreajuste: la pérdida de entrenamiento cae hasta 0,0109 en la última época mientras la pérdida de validación fluctúa entre 0,51 y 0,67; el ROC AUC alcanza su máximo (0,9315) en el paso 275 y desciende ligeramente después, lo que sugiere que el mejor punto de validación no es el checkpoint final.
- Tasa de falsos positivos del 11,9 % en el umbral óptimo: uno de cada ocho ejemplos negativos se clasificaría como positivo, con el impacto que ello tiene si el modelo se usa como filtro automático.
- Uso como modelo generativo: el adaptador no está descrito como asistente conversacional. Aplicarlo como generador de texto general no está respaldado por la información disponible y probablemente degrade el comportamiento original del modelo base.
- Idiomas: no se declara ningún idioma soportado; no hay garantía de funcionamiento en castellano ni en otros idiomas distintos del que use el dataset de ajuste.
- Licencia: el adaptador se publica bajo apache-2.0, pero al derivar de google/gemma-4-E4B-it conviene revisar los términos de uso del modelo base antes de un despliegue comercial, ya que pueden imponer condiciones adicionales.
- Ausencia de validación externa: cero descargas y cero "likes" en el momento de la consulta, sin benchmarks independientes publicados.
- Datos potencialmente sesgados: al no documentarse el corpus de entrenamiento, no se puede evaluar el sesgo del modelo respecto a dominios, lenguas o tipos de pregunta concretos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/leobianco/ragtruth-qa_RM_gemma-4-E4B-it_S130104_epo5_lr6_4e-04_r4_2609182137
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio de la librería PEFT: no disponible en la información proporcionada
- Paper o blog técnico del modelo: no disponible en la información proporcionada
- Demos o espacios asociados: no disponible en la información proporcionada

Nota: la búsqueda web asociada a esta consulta no devolvió resultados relevantes para el modelo (los resultados obtenidos corresponden a la plataforma de streaming RTL+ y no guardan relación con el repositorio).
