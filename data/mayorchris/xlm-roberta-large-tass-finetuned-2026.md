# MayorChris/xlm-roberta-large-tass-finetuned-2026

## Resumen

xlm-roberta-large-tass-finetuned-2026 es un modelo de clasificación de texto obtenido por ajuste fino (*fine-tuning*) supervisado de FacebookAI/xlm-roberta-large, publicado por el usuario MayorChris en HuggingFace. Se trata, por tanto, de un encoder transformer de 559.893.507 parámetros (unos 560 M) especializado en una tarea de clasificación concreta sobre un conjunto de datos que la model card no identifica: el autor no describe el corpus, las etiquetas ni el dominio de aplicación.

El modelo llega con resultados de evaluación declarados por el autor: pérdida de validación 1,0244, F1 macro 0,6807, F1 ponderado 0,6833 y accuracy 0,6847 sobre un conjunto de evaluación no especificado. Las curvas de entrenamiento muestran un sobreajuste claro a partir de la época 6 (la pérdida de validación sube de 0,72 a 1,02 mientras la de entrenamiento baja de 0,65 a 0,35), por lo que los pesos publicados corresponden a la última época y no al mejor punto de validación.

Su relevancia es limitada y muy acotada: es un artefacto de ajuste fino con 28 descargas y ninguna interacción social, sin model card completada ni benchmarks estándar. Resulta útil únicamente como referencia de un clasificador multilingüe de tamaño medio derivado de XLM-RoBERTa-large, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (XLM-RoBERTa-large) con cabeza de clasificación de secuencias |
| Parametros totales | 559.893.507 (dato real de los safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (límite heredado de XLM-RoBERTa-large; no declarado en la model card) |
| Tipos de cuantizacion | No se publican pesos cuantizados. Al ser un encoder de ~560 M es convertible a fp16, int8 (bitsandbytes) o GGUF con herramientas externas |
| Idiomas soportados | No declarado en la model card. El modelo base XLM-RoBERTa-large cubre 100 idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de XLM-RoBERTa-large: un transformer encoder-only de 24 capas, dimensión oculta 1024, 16 cabezas de atención y un vocabulario SentencePiece de aproximadamente 250 000 tokens, preentrenado de forma multilingüe con el objetivo de *masked language modeling*. Sobre ese backbone, el autor ha añadido una cabeza de clasificación y ha ajustado todos los pesos para una tarea de clasificación de texto de la que no se ofrece información.

El entrenamiento se realizó con los hiperparámetros declarados: learning rate 1e-05, batch de entrenamiento 16, batch de evaluación 32, optimizador AdamW *fused* (betas 0,9/0,999, epsilon 1e-08), scheduler lineal, 10 épocas y semilla 42, con Transformers 5.20.1, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3. A 241 pasos por época, el conjunto de entrenamiento ronda los 3 850 ejemplos con ese batch, una estimación derivada de los pasos registrados. No consta ni el número de tokens procesados, ni la composición del dataset, ni si hubo RLHF, DPO o cualquier otra fase de alineamiento; tampoco se documenta ninguna innovación técnica adicional.

## Capacidades

- Clasificación de texto: el modelo devuelve una etiqueta por secuencia mediante la pipeline `text-classification`; el conjunto de etiquetas depende del dataset de ajuste fino, que no se detalla.
- Etiquetado multilingüe potencial: al derivar de XLM-RoBERTa-large, el tokenizador y las representaciones cubren hasta 100 idiomas, aunque el ajuste fino puede haber degradado el rendimiento fuera del idioma o dominio del corpus de entrenamiento.
- Extracción de representaciones: el encoder puede usarse para generar embeddings de frases o documentos (pooling sobre el token `<s>`), útil para búsqueda semántica o clustering.
- Ajuste fino adicional: la licencia MIT y el formato safetensors permiten reentrenar la cabeza sobre un corpus propio.
- Sin soporte de tool calling, agentes, razonamiento multi-paso, generación de texto libre, código, matemáticas, visión ni audio: es un modelo discriminativo, no generativo.
- Sin modo *thinking* ni capacidades multimodales.
- Compatible con Text Embeddings Inference y con *endpoints* alojados, según las etiquetas del repositorio.

## Casos de uso

- Clasificación de documentos internos: desplegado con `transformers` o TEI, puede etiquetar tickets, correos o informes en categorías predefinidas, siempre que las etiquetas coincidan con las del ajuste fino original (que el autor no documenta).
- Enrutamiento de soporte al cliente: clasificar la consulta entrante y derivarla al equipo adecuado; el límite de 512 tokens obliga a truncar o segmentar conversaciones largas.
- Moderación de contenido en varias lenguas: un encoder multilingüe de 560 M ofrece buena cobertura idiomática con un coste de inferencia bajo en comparación con modelos generativos.
- Análisis de sentimiento o temática sobre reseñas: aprovechando la cabecera de clasificación tras un reentrenamiento con datos propios etiquetados.
- Etiquetado asistido para construcción de datasets: preanotar grandes volúmenes de texto y revisar manualmente solo los casos de baja confianza, dado el throughput alto de un encoder de este tamaño.
- Filtrado previo en pipelines RAG: descartar documentos irrelevantes antes de pasarlos a un modelo generativo, reduciendo coste y latencia del sistema completo.
- Detección de duplicados o near-duplicates mediante los embeddings del encoder y similitud coseno.
- Investigación sobre sobreajuste en ajuste fino: las curvas publicadas sirven como caso de estudio de divergencia entre pérdida de entrenamiento y validación.

## Benchmarks y rendimiento

El model-index del autor está vacío y no se han publicado resultados de benchmarks estándar (MMLU, GLUE, XNLI, etc.). Los únicos datos disponibles son las métricas de validación declaradas en la model card:

| Metrica | Valor (conjunto de evaluacion del autor) |
|---|---|
| Loss | 1,0244 |
| F1 macro | 0,6807 |
| F1 ponderado | 0,6833 |
| Accuracy | 0,6847 |

Evolución del ajuste fino según la tabla de entrenamiento del autor:

| Epoca | Paso | Loss entrenamiento | Loss validacion | F1 macro | F1 ponderado | Accuracy |
|---|---|---|---|---|---|---|
| 1 | 241 | 1,0960 | 1,0910 | 0,1878 | 0,2211 | 0,3923 |
| 2 | 482 | 1,0941 | 1,1017 | 0,3186 | 0,3354 | 0,4266 |
| 3 | 723 | 0,8848 | 0,8337 | 0,6405 | 0,6453 | 0,6576 |
| 4 | 964 | 0,7462 | 0,8273 | 0,6334 | 0,6265 | 0,6264 |
| 5 | 1205 | 0,6527 | 0,7246 | 0,6550 | 0,6583 | 0,6681 |
| 6 | 1446 | 0,5895 | 0,7868 | 0,6880 | 0,6906 | 0,6878 |
| 7 | 1687 | 0,4823 | 0,9005 | 0,6785 | 0,6823 | 0,6816 |
| 8 | 1928 | 0,3882 | 0,9520 | 0,6813 | 0,6842 | 0,6847 |
| 9 | 2169 | 0,3510 | 1,0244 | 0,6807 | 0,6833 | 0,6847 |

El mejor F1 macro se alcanza en la época 6 (0,6880) y el checkpoint publicado corresponde a la época 9, con peor pérdida de validación. No hay comparación con modelos de referencia en la información disponible.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 2,3 GB solo de pesos, más 1-1,5 GB de activaciones y overhead para batches de 8-32 secuencias de 512 tokens; en torno a 4-5 GB en total.
- VRAM estimada en fp16: unos 1,2 GB de pesos, alrededor de 2,5-3 GB con overhead.
- VRAM estimada en int8: unos 0,6 GB de pesos, alrededor de 1,5-2 GB con overhead.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090, así como en T4 (16 GB) y L4 (24 GB). También es viable en CPU para volúmenes moderados.
- GPU recomendadas para producción de alto throughput: L4, A10G, A100 o H100 con lotes grandes; el modelo no requiere tensor parallelism.
- Opciones de despliegue: `transformers` con `pipeline`, Text Embeddings Inference (etiqueta `text-embeddings-inference`), TorchServe, FastAPI con batching propio, ONNX Runtime u Optimum para aceleración en CPU. vLLM y TGI no están orientados a clasificación de secuencias, aunque TGI soporta algunos encoders.
- Latencia y throughput: no disponibles; no se han publicado mediciones. Como referencia cualitativa, un encoder de 560 M es entre 10 y 30 veces más barato por secuencia que un modelo generativo de 7 000 M, pero no hay cifras verificadas para este checkpoint.
- Nota: el repositorio ocupa 47,0 GB, muy por encima de los ~2,2 GB de los pesos en fp32, lo que sugiere checkpoints intermedios de las 10 épocas y estados del optimizador. Conviene descargar solo los ficheros safetensors necesarios.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| MayorChris/xlm-roberta-large-tass-finetuned-2026 | 560 M | 512 | No declarado (base: 100) | MIT | Ajustado para una tarea no documentada; 28 descargas; accuracy 0,6847 |
| FacebookAI/xlm-roberta-large | 560 M | 512 | 100 | MIT | Modelo base preentrenado, sin cabeza de clasificación; requiere ajuste fino |
| FacebookAI/xlm-roberta-base | 278 M | 512 | 100 | MIT | Alternativa más ligera; menor calidad de representación |
| microsoft/mdeberta-v3-base | ~278 M (86 M en el backbone) | 512 | 100 | MIT | Alternativa moderna con atención desenredada; sin ajuste fino para esta tarea |

No se dispone de comparaciones de rendimiento entre estos modelos en la tarea concreta de este checkpoint, ya que el dominio y las etiquetas no están documentados. Cualquier comparación cuantitativa sería especulativa.

## Limitaciones y advertencias

- Model card incompleta: el autor deja "More information needed" en la descripción, los usos previstos, las limitaciones y los datos de entrenamiento. Se desconoce el dominio, el número de etiquetas y el significado de cada una.
- El conjunto de evaluación no está documentado, por lo que las métricas declaradas no son reproducibles ni comparables con otros trabajos.
- Sobreajuste evidente: la pérdida de validación mínima se alcanza en la época 5 y el checkpoint publicado (época 9) es el peor en validación. El F1 macro baja de 0,6880 a 0,6807 entre ambas.
- Accuracy del 68,5 %: insuficiente para la mayoría de aplicaciones en producción sin una evaluación propia y sin umbrales de confianza calibrados.
- Sesgos: no evaluados. Al derivar de XLM-RoBERTa-large, hereda los sesgos demográficos y culturales del corpus CommonCrawl multilingüe con el que se preentrenó el modelo base.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador), pero sí de predicciones erróneas con alta confianza en entradas fuera de distribución.
- Límite duro de 512 tokens por secuencia; los documentos más largos requieren truncado o segmentación con agregación posterior.
- Cobertura idiomática incierta: aunque el modelo base es multilingüe, el ajuste fino puede haber especializado el clasificador en un único idioma.
- Licencia MIT: permite uso comercial y modificación sin restricciones, pero el autor no ofrece ninguna garantía ni soporte.
- Repositorio de 47 GB: riesgo de descargas muy costosas si no se seleccionan los ficheros adecuados.
- Ausencia total de tracción comunitaria (0 likes, 28 descargas) y de validación independiente; no se recomienda su uso en producción sin un ajuste fino propio sobre datos etiquetados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MayorChris/xlm-roberta-large-tass-finetuned-2026
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Paper de XLM-RoBERTa (Conneau et al., 2019): https://arxiv.org/abs/1911.02116
- Documentación de Transformers para clasificación de texto: https://huggingface.co/docs/transformers/tasks/sequence_classification
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
- Optimum (exportación a ONNX): https://github.com/huggingface/optimum
