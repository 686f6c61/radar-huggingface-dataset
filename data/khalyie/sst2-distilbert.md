# Khalyie/sst2-distilbert

## Resumen

Khalyie/sst2-distilbert es un modelo de clasificación de sentimiento binario resultado de hacer fine-tuning de `distilbert-base-uncased` sobre el corpus GLUE SST-2 (aproximadamente 67.000 ejemplos de entrenamiento) durante 3 épocas con una tasa de aprendizaje de 2e-5 y sin modificaciones arquitectónicas respecto al checkpoint base. Se publica como un checkpoint de `transformers` para la tarea `text-classification`, con pesos en `safetensors` y `pytorch_model.bin`, y un total de 66.955.010 parámetros (incluida la cabeza de clasificación de dos clases). El repositorio ocupa 0,3 GB.

El problema que resuelve es acotado y clásico: asignar una etiqueta positiva o negativa a una frase corta en inglés, con fines de análisis de opinión, triaje de texto o etiquetado masivo. No es un modelo generativo ni un asistente conversacional, por lo que su relevancia no está en capacidades emergentes sino en servir como componente ligero, rápido y desplegable en CPU dentro de pipelines de clasificación a gran escala.

Técnicamente es un artefacto derivado de un modelo ya existente, con una validación muy limitada: el propio autor reporta `eval_accuracy` de 0,9002 y `eval_f1` de 0,9028 sobre el split de validación etiquetado de SST-2 (872 ejemplos). La licencia no está declarada, los idiomas no están declarados explícitamente y el modelo acumula 0 descargas y 0 likes en el momento de redactar esta ficha, lo que implica un mantenimiento y una validación por parte de terceros prácticamente nulos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo DistilBERT (destilado de BERT-base): 6 capas, 768 de dimensión oculta, 12 cabezas de atención, ~66M de parámetros. Dato derivado del modelo base indicado en la model card; no se detalla en los metadatos del repo |
| Parámetros totales | 66.955.010 (safetensors) |
| Longitud de contexto | No disponible en la model card. El límite arquitectónico de DistilBERT es de 512 tokens; el corpus SST-2 contiene frases muy cortas |
| Tipos de cuantización | No disponible. El repo distribuye pesos en `safetensors` y `pytorch_model.bin` (fp32); no se publican versiones GGUF, GPTQ ni AWQ |
| Idiomas soportados | No disponible en los metadatos. El modelo base `distilbert-base-uncased` es monolingüe en inglés, por lo que el fine-tuning está orientado a inglés |
| Licencia | No disponible |
| Formato de pesos | safetensors y pytorch_model.bin (más `config.json` y ficheros de tokenizer: `vocab.txt`, `tokenizer_config.json`) |
| Pipeline declarado | text-classification |
| Librería | transformers |
| Tamaño del repositorio | 0,3 GB |
| Etiquetas del repo | transformers, safetensors, distilbert, text-classification, sentiment-analysis, sst2, glue, text-embeddings-inference, endpoints_compatible, region:us |
| Descargas / likes | 0 / 0 |
| Fechas declaradas | Creado 2026-09-12, actualizado 2026-09-12 (fechas inconsistentes con el calendario; ver limitaciones) |

## Arquitectura y entrenamiento

La arquitectura es un encoder Transformer de tipo DistilBERT, la versión destilada de BERT-base que reduce a la mitad el número de capas (6 frente a 12) manteniendo la dimensión oculta de 768. Sobre ese backbone se añade una cabeza de clasificación por secuencia con dos etiquetas de salida (positivo/negativo). El modelo usa tokenización WordPiece con vocabulario `uncased` y una ventana máxima de 512 tokens, aunque las frases de SST-2 son habitualmente mucho más cortas.

En cuanto al entrenamiento, la model card indica fine-tuning sobre el conjunto completo de entrenamiento de GLUE SST-2 (aproximadamente 67.000 ejemplos), 3 épocas y tasa de aprendizaje 2e-5. No se documenta el tamaño de lote efectivo, el optimizador, el scheduler ni si hubo búsqueda de hiperparámetros; tampoco se menciona ningún paso de RLHF, DPO o calibración posterior, algo que sería improcedente en un clasificador de este tipo. No se declara ninguna innovación técnica: es un fine-tuning estándar sobre un checkpoint preentrenado, y la única pieza adicional es un script de evaluación y visualización alojado en el repositorio de datos asociado (`Khalyie/sst2-distilbert-data`).

Un detalle metodológico relevante que el propio autor señala: el split `test` oficial de SST-2 en GLUE se distribuye con las etiquetas ocultas (`label == -1`), por lo que las métricas reportadas corresponden al split `validation` etiquetado y no son comparables de forma directa con las cifras publicadas en el leaderboard oficial de GLUE.

## Capacidades

- Clasificación binaria de sentimiento (positiva / negativa) sobre texto corto en inglés.
- Inferencia de una sola pasada, sin generación de texto, sin razonamiento multi-paso y sin cadena de pensamiento.
- Salida de logits por clase, lo que permite usar la probabilidad asociada como puntuación de confianza y aplicar umbrales personalizados.
- Compatible con `text-embeddings-inference` y con despliegues marcados como `endpoints_compatible`, según las etiquetas del repositorio.
- No soporta tool calling ni function calling: no es un modelo instruccional ni dispone de plantilla de chat.
- No soporta agentes, planificación ni uso de herramientas externas.
- Capacidades multilingües: no disponibles; el modelo base es monolingüe en inglés.
- No dispone de modo de razonamiento, visión ni audio.

## Casos de uso

- Análisis de sentimiento en reseñas de productos: al estar entrenado sobre críticas de cine, la transferencia a reseñas de electrónica, libros o restaurantes es razonable; se puede ejecutar sobre lotes de miles de reseñas por segundo en GPU modesta o CPU multinúcleo.
- Monitorización de marca en redes sociales: clasificación rápida de menciones y comentarios en inglés para alimentar paneles de reputación; su tamaño de 66M de parámetros permite procesar volúmenes altos con coste mínimo.
- Triaje de tickets de soporte: asignar automáticamente una polaridad a los comentarios de los clientes para priorizar los casos con sentimiento negativo dentro de un sistema de atención al cliente.
- Procesamiento de encuestas NPS y respuestas abiertas: convertir comentarios libres en una métrica cuantitativa agregable, con la puntuación de confianza del modelo como criterio de revisión manual.
- Pseudo-etiquetado y enriquecimiento de datasets: generar etiquetas débiles sobre corpus no anotados en inglés para preentrenar o afinar clasificadores posteriores de mayor tamaño.
- Filtrado previo en pipelines de moderación de contenido: descartar o marcar rápidamente el texto claramente negativo antes de pasarlo a un modelo más costoso o a revisión humana.
- Clasificación de titulares financieros o de noticias: uso posible por su velocidad, pero con la advertencia de que el dominio de entrenamiento es críticas de cine, por lo que la precisión fuera de ese dominio no está garantizada ni medida.
- Evaluación educativa o investigación de reproducibilidad: sirve como referencia barata para comparar técnicas de fine-tuning sobre SST-2, dado su bajo coste computacional.

## Benchmarks y rendimiento

Los únicos datos publicados son las métricas de validación que el autor incluye en la model card. No hay resultados en MMLU, HumanEval, GSM8K ni en el leaderboard oficial de GLUE.

| Métrica (split validation de SST-2) | Valor |
|---|---|
| eval_loss | 0,5542670488357544 |
| eval_accuracy | 0,9002293577981652 |
| eval_f1 | 0,9027932960893855 |
| eval_runtime | 0,9298 s |
| eval_samples_per_second | 937,86 |
| eval_steps_per_second | 15,057 |
| Época | 3,0 |

A partir de `eval_runtime` y `eval_samples_per_second` se deduce que la evaluación se hizo sobre 872 ejemplos (el tamaño completo del split de validación de SST-2) y que el lote efectivo era de 64 muestras. No se especifica el hardware empleado en esa evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los pesos ocupan aproximadamente 268 MB; en fp16, unos 134 MB; en int8, unos 67 MB. Con activaciones y lotes moderados, el consumo total se mantiene por debajo de 1 GB.
- Cabe sin problema en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, así como en iGPU con suficiente memoria compartida.
- Inferencia en CPU perfectamente viable: con 66M de parámetros, un servidor de CPU moderna puede superar holgadamente cientos de frases por segundo en lotes.
- GPU de datacenter (A100, H100) solo tendrían sentido para despliegues de altísimo throughput agregado, no por requisitos de memoria.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification`, Hugging Face `text-embeddings-inference` (soportado según las etiquetas) y endpoints de inferencia compatibles. vLLM y TGI no son adecuados para clasificación por secuencia. No se publican pesos GGUF, por lo que el uso con llama.cpp u Ollama requeriría una conversión propia.
- Throughput medido en la propia evaluación del autor: 937,86 muestras por segundo con lote de 64 y runtime total de 0,9298 s para las 872 muestras (hardware no especificado).
- Latencia de una sola frase: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Khalyie/sst2-distilbert | 66.955.010 | 512 tokens (límite del backbone; no declarado en la card) | No disponible | Hugging Face, 0 descargas | Accuracy de validación 0,9002; sin resultados en el test oficial de GLUE |
| distilbert-base-uncased-finetuned-sst-2-english (referencia de la comunidad) | ~67M | 512 tokens | Apache 2.0 (según su propia card) | Ampliamente desplegado, millones de descargas | Mismo backbone y misma tarea; sirve como alternativa auditada y mantenida |
| BERT-base fine-tuned en SST-2 | ~110M | 512 tokens | Apache 2.0 (modelo base) | Amplia | Mayor coste de cómputo con ganancia de precisión marginal en esta tarea |
| RoBERTa-base fine-tuned en SST-2 | ~125M | 512 tokens | MIT (modelo base) | Amplia | Habitualmente superior en SST-2, a costa de más parámetros y más latencia |

No se dispone de cifras de benchmark verificables en la información proporcionada para ninguno de los modelos comparados, por lo que la comparación es estructural (tamaño, contexto y licencia) y no de rendimiento.

## Limitaciones y advertencias

- Clasificación estrictamente binaria: no contempla neutralidad, intensidad ni emociones múltiples; forzar una de las dos clases sobre textos ambiguos produce etiquetas discutibles.
- Dominio de entrenamiento limitado a críticas de cine en inglés; la precisión fuera de ese dominio (finanzas, medicina, soporte técnico) no está medida y puede degradarse de forma notable.
- Sensibilidad previsible a ironía, sarcasmo, negación compleja y textos largos, problemas inherentes al corpus SST-2.
- Idiomas: aunque los metadatos no los especifican, el backbone es `uncased` en inglés; el uso con texto en castellano no está soportado ni validado.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de sobreconfianza en la etiqueta predicha; conviene calibrar los umbrales con datos propios.
- Sesgos conocidos: no se documenta ningún análisis de sesgo por género, raza o temática; el corpus de críticas de cine puede introducir sesgos de dominio y de vocabulario.
- Licencia no declarada: la ausencia de licencia explícita impide asumir permiso de uso comercial; es imprescindible contactar con el autor o elegir un checkpoint alternativo con licencia clara antes de integrarlo en producción.
- Fechas de creación y actualización (2026-09-12) incoherentes con el calendario real, lo que sugiere metadatos generados o erróneos y reduce la confianza en la trazabilidad del artefacto.
- Sin mantenimiento ni adopción: 0 descargas y 0 likes implican ausencia de validación externa, informes de errores y actualizaciones.
- No se documentan el hardware de evaluación, el tamaño de lote ni la semilla, por lo que las métricas reportadas no son reproducibles con exactitud.
- Las métricas proceden del split de validación, no del test oficial de GLUE, y no son directamente comparables con las cifras del leaderboard.
- Los resultados de la búsqueda web realizada no contienen ninguna referencia útil al modelo: todos los enlaces devueltos corresponden a páginas corporativas de Microsoft y no guardan relación con este checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Khalyie/sst2-distilbert
- Repositorio de datos asociado, con el script de evaluación y visualización (`predict_and_visualize_sst2.py`): https://huggingface.co/datasets/Khalyie/sst2-distilbert-data
- Búsqueda web: no se encontró ningún enlace relevante; los resultados devueltos correspondían a páginas de Microsoft (microsoft.com, account.microsoft.com, myaccount.microsoft.com, en.wikipedia.org/wiki/Microsoft) y no están relacionados con el modelo.
