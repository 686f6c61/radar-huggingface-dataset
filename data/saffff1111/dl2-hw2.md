# saffff1111/dl2-hw2

## Resumen

dl2-hw2 es un checkpoint de clasificación de tokens (token classification) publicado por el usuario saffff1111 en HuggingFace. Se trata de un ajuste fino de BAAI/bge-small-en-v1.5, un encoder tipo BERT de 33.215.625 parámetros (12 capas, dimensión oculta 384), orientado a tareas de etiquetado a nivel de token como reconocimiento de entidades nombradas (NER) o etiquetado de secuencias. El repositorio ocupa 0,1 GB y se distribuye en formato safetensors bajo licencia MIT.

La relevancia del modelo es limitada y muy específica: no es un modelo de propósito general ni compite con LLM generativos. Su interés radica en ser un ejemplo de ajuste fino de un encoder pequeño y eficiente para extracción de información, con métricas de evaluación razonables (F1 0,9474 y accuracy 0,9835 en el conjunto de evaluación declarado). El autor no documenta el conjunto de datos de entrenamiento, el esquema de etiquetas ni el dominio de aplicación, por lo que la model card es prácticamente un artefacto autogenerado por el Trainer de HuggingFace.

Se desconocen los idiomas soportados; el modelo base (bge-small-en-v1.5) está entrenado únicamente en inglés, lo que condiciona fuertemente cualquier uso en otros idiomas. El número de descargas y likes es cero, y la model card carece de secciones sustantivas (model description, intended uses, training data), por lo que debe tratarse como un checkpoint experimental y no como un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (heredada de BAAI/bge-small-en-v1.5) |
| Parametros totales | 33.215.625 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (arquitectura del modelo base; no especificado en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en safetensors; no se publican versiones cuantizadas) |
| Idiomas soportados | no disponible en la model card; el modelo base BAAI/bge-small-en-v1.5 es únicamente en inglés |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea (pipeline) | token-classification |
| Modelo base | BAAI/bge-small-en-v1.5 |
| Tamaño del repositorio | 0,1 GB |
| Librería | transformers |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado de BAAI/bge-small-en-v1.5, un encoder BERT pequeño (33M de parámetros, 12 capas, 384 de dimensión oculta) originalmente entrenado por BAAI como modelo de embeddings de frases en inglés. Sobre esa base se ha añadido una cabeza de clasificación de tokens y se ha reentrenado para etiquetar secuencias. No hay ninguna innovación arquitectónica: es un transformer encoder estándar con atención bidireccional completa y sin mecanismos de atención lineal, MoE, SSM o decodificación especulativa.

El procedimiento de entrenamiento está documentado únicamente en los hiperparámetros que el Trainer registró automáticamente: 10 épocas, 12.520 pasos, batch de 8 en entrenamiento y evaluación, learning rate 5e-5 con scheduler lineal, optimizador AdamW fused (betas 0,9/0,999, epsilon 1e-8) y semilla 42. Ejecutado con Transformers 5.17.0, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.2. No se especifica el conjunto de datos, su composición, el número de tokens de entrenamiento, el esquema de etiquetas ni si hubo fases de RLHF o DPO (no aplicables en un encoder de clasificación, en cualquier caso). La pérdida de entrenamiento desciende de 0,0789 a 0,0037, mientras que la pérdida de validación repunta a partir de la época 5 (de 0,0835 a 0,1070), lo que indica sobreajuste creciente.

## Capacidades

- Clasificación de tokens: asigna una etiqueta a cada token de entrada (por ejemplo, etiquetas BIO para entidades), que es la tarea declarada en el pipeline del repositorio.
- Extracción de entidades tipo NER, siempre que la cabeza de clasificación se haya entrenado con ese esquema; el autor no publica el listado de etiquetas.
- Codificación contextual de frases en inglés, heredada del modelo base bge-small-en-v1.5.
- Inferencia rápida en CPU y GPU gracias a sus 33M de parámetros.
- No dispone de generación de texto, razonamiento, matemáticas, código, visión ni audio.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (el modelo base es solo en inglés).
- No incorpora modo "thinking" ni ningún mecanismo especial de razonamiento.

## Casos de uso

- Detección de datos personales (PII) en texto en inglés: si la cabeza de clasificación incluye etiquetas de nombres, direcciones o identificadores, el modelo puede etiquetar cada token de un documento y servir como paso previo a un pipeline de anonimización, con la ventaja de ejecutarse en CPU a bajo coste.
- Extracción de entidades en documentos legales o contratos: identificar partes, fechas e importes a nivel de token para poblar bases de datos estructuradas, siempre condicionado a que el esquema de etiquetas coincida con el dominio.
- Procesamiento de currículums: extracción de nombres de empresas, puestos, titulaciones y fechas para sistemas de reclutamiento, aprovechando la naturaleza token-level del modelo frente a aproximaciones puramente generativas.
- Enrutado y etiquetado de tickets de soporte: clasificar fragmentos de texto (producto, error, entorno) dentro de una conversación multi-turno troceada en ventanas de hasta 512 tokens.
- Preprocesado para pipelines de RAG: usar el encoder subyacente para generar embeddings de frases en inglés y, en paralelo, el cabezal de token classification para marcar entidades relevantes en los documentos indexados.
- Análisis de logs y trazas técnicas: etiquetar identificadores, niveles de severidad o nombres de servicio en líneas de log, con latencias muy bajas por su tamaño reducido.
- Anotación asistida en proyectos de etiquetado: generar preanotaciones automáticas que los anotadores humanos corrigen, reduciendo el coste de construcción de datasets, gracias a su F1 de 0,9474 en el conjunto de evaluación declarado.
- Filtrado de contenido en inglés: clasificar tokens asociados a categorías concretas dentro de un sistema de moderación, si el entrenamiento original cubría ese esquema.

## Benchmarks y rendimiento

El model-index del repositorio está vacío (`"results": []`), por lo que no hay comparaciones publicadas contra otros modelos. Los únicos datos disponibles son las métricas de evaluación declaradas por el autor en la model card, que corresponden al conjunto de evaluación interno del ajuste fino (dataset no especificado):

| Metrica | Valor (epoca 10) |
|---|---|
| Loss | 0,1070 |
| Precision | 0,9497 |
| Recall | 0,9451 |
| F1 | 0,9474 |
| Accuracy | 0,9835 |

Evolución por épocas declarada por el autor:

| Epoca | Training loss | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|
| 1,0 | 0,0789 | 0,0835 | 0,9356 | 0,9327 | 0,9342 | 0,9795 |
| 2,0 | 0,0486 | 0,0855 | 0,9350 | 0,9412 | 0,9381 | 0,9802 |
| 3,0 | 0,0362 | 0,0939 | 0,9420 | 0,9346 | 0,9383 | 0,9810 |
| 4,0 | 0,0252 | 0,0941 | 0,9412 | 0,9420 | 0,9416 | 0,9817 |
| 5,0 | 0,0184 | 0,0934 | 0,9429 | 0,9376 | 0,9403 | 0,9815 |
| 6,0 | 0,0129 | 0,0939 | 0,9408 | 0,9456 | 0,9432 | 0,9823 |
| 7,0 | 0,0089 | 0,1018 | 0,9464 | 0,9420 | 0,9442 | 0,9829 |
| 8,0 | 0,0060 | 0,1074 | 0,9457 | 0,9440 | 0,9449 | 0,9827 |
| 9,0 | 0,0043 | 0,1092 | 0,9515 | 0,9403 | 0,9459 | 0,9830 |
| 10,0 | 0,0037 | 0,1070 | 0,9497 | 0,9451 | 0,9474 | 0,9835 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, CoNLL-2003, etc.) en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 133 MB en fp32 y 66 MB en fp16 para los pesos. En la práctica, menos de 1 GB de VRAM considerando activaciones y el tokenizador, incluso con secuencias de 512 tokens.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. No requiere A100, H100 ni RTX 4090; una GTX 1050 Ti, T4, RTX 3060 o incluso una iGPU moderna son suficientes.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo de la última década.
- Inferencia en CPU: totalmente viable; con 33M de parámetros el throughput típico es de cientos a miles de secuencias cortas por segundo en un procesador de escritorio moderno, aunque no se han publicado mediciones concretas de latencia.
- Opciones de despliegue: transformers (PyTorch) de forma nativa; exportación a ONNX Runtime o TorchScript para producción de baja latencia; Triton Inference Server; HuggingFace Inference Endpoints (la etiqueta `endpoints_compatible` está presente). vLLM, TGI, llama.cpp y Ollama no están orientados a encoders de clasificación y no se recomiendan para este checkpoint.
- Latencia y throughput estimados: no disponibles (el autor no publica mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| saffff1111/dl2-hw2 | 33,2M | 512 tokens | Token classification | MIT | Checkpoint evaluado en esta ficha; dataset y etiquetas no documentados |
| BAAI/bge-small-en-v1.5 | 33,2M | 512 tokens | Embeddings de frases / recuperación | MIT | Modelo base; solo inglés; sin cabeza de clasificación de tokens |
| gzverev/dl2-hw2-bert-ner | no disponible | no disponible | Token classification (NER) | no disponible | Ajuste fino del mismo modelo base con nombre de tarea explícito en el repositorio |
| kryalka/dl2-hw2 | no disponible | no disponible | no disponible | no disponible | Checkpoint con el mismo identificador de tarea, aparentemente del mismo ejercicio |
| dslim/bert-base-NER | ~110M (BERT-base) | 512 tokens | NER en inglés (esquema CoNLL) | MIT | Referencia habitual para NER en inglés; métricas no verificadas en esta ficha |

Los tres checkpoints con nombre `dl2-hw2` localizados en la búsqueda web parecen proceder del mismo ejercicio de ajuste fino, lo que sugiere que la etiqueta "dl2-hw2" identifica una tarea académica más que un modelo de producción con nombre propio.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card indica explícitamente "unknown dataset" y no publica la composición ni el esquema de etiquetas, por lo que no es posible saber qué entidades o clases predice realmente el modelo.
- Sobreajuste: la pérdida de validación aumenta de forma sostenida desde la época 5 (0,0835) hasta la época 10 (0,1070), mientras la pérdida de entrenamiento cae a 0,0037. Las métricas finales pueden no generalizar a datos fuera de la distribución de evaluación.
- Sesgos: no evaluados ni documentados por el autor. Al derivar de un modelo entrenado predominantemente con texto en inglés, hereda los sesgos presentes en esos corpus.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos en el etiquetado, con una precisión y un recall de aproximadamente 0,95 sobre un conjunto de evaluación no especificado.
- Limitación de idioma: el modelo base es solo inglés; el comportamiento en castellano u otros idiomas es impredecible y muy probablemente deficiente.
- Límite de contexto: 512 tokens por secuencia, lo que obliga a trocear documentos largos y puede romper entidades a caballo entre fragmentos.
- Licencia MIT: permite uso comercial y modificación sin restricciones, siempre que se conserve el aviso de copyright. No obstante, la licencia del modelo base (también MIT) y la ausencia de información sobre el dataset de ajuste impiden garantizar la trazabilidad de los datos de entrenamiento.
- Ausencia de validación externa: cero descargas, cero likes y ninguna evaluación independiente publicada. No debe desplegarse en producción sin una evaluación propia sobre datos representativos del caso de uso.
- Model card autogenerada: contiene marcadores "More information needed" en las secciones de descripción, usos previstos y datos de entrenamiento, lo que indica que el autor no completó la documentación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/saffff1111/dl2-hw2
- Modelo base BAAI/bge-small-en-v1.5: https://huggingface.co/BAAI/bge-small-en-v1.5
- Checkpoint relacionado kryalka/dl2-hw2: https://huggingface.co/kryalka/dl2-hw2
- Checkpoint relacionado gzverev/dl2-hw2-bert-ner: https://huggingface.co/gzverev/dl2-hw2-bert-ner
- Paper de BGE (BAAI General Embedding): no disponible en los resultados de búsqueda proporcionados
- Repositorio de código o demo del autor: no disponible en los resultados de búsqueda proporcionados
