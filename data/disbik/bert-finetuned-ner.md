# disbik/bert-finetuned-ner

## Resumen

bert-finetuned-ner es un modelo de reconocimiento de entidades nombradas (NER) publicado por el usuario disbik en Hugging Face. Se trata de un ajuste fino del encoder BAAI/bge-small-en-v1.5, un transformer tipo BERT de 33.215.625 parámetros, sobre un corpus de anotación de entidades que la model card no identifica. La tarea declarada es token-classification, es decir, asignar una etiqueta BIO/IOB a cada token de entrada para extraer entidades del texto. La licencia es MIT, lo que permite uso comercial sin restricciones adicionales.

El interés práctico del modelo está en su tamano reducido: con algo más de 33 millones de parámetros ocupa unas pocas centenas de megabytes en precision completa y puede ejecutarse en CPU o en cualquier GPU consumer, lo que lo hace viable para procesamiento por lotes de grandes volúmenes de documentos. Los resultados declarados en la model card son razonables para esta escala: precision 0,9023, recall 0,9265, F1 0,9142 y accuracy 0,9822 sobre el conjunto de evaluación.

El principal caveat es la falta de documentación: la model card ha sido generada de forma automática por el Trainer, indica "More information needed" en las secciones de descripción, usos previstos y datos de entrenamiento, y no especifica el conjunto de etiquetas de entidades ni la composición del dataset. Tampoco se publican resultados en benchmarks estándar (el array `results` del model-index está vacío) ni versiones cuantizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer tipo BERT, heredada del modelo base BAAI/bge-small-en-v1.5 |
| Parametros totales | 33.215.625 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el modelo base bge-small-en-v1.5 trabaja con ventanas de 512 tokens |
| Tipos de cuantizacion | no disponible (no se han publicado pesos cuantizados) |
| Idiomas soportados | no disponible (el modelo base esta orientado a ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con la libreria transformers) |
| Tarea | token-classification (reconocimiento de entidades nombradas) |
| Modelo base | BAAI/bge-small-en-v1.5 |
| Tamano del repositorio | 1,9 GB |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base BAAI/bge-small-en-v1.5, un encoder transformer bidireccional de tipo BERT con 33,2 millones de parametros, adaptado por el autor anadiendo una cabeza de clasificacion por token para la tarea de NER. No se documenta ninguna innovacion arquitectonica adicional, ni mecanismos de atencion lineal, decodificacion especulativa o capas de mezcla de expertos: es un ajuste fino clasico de un encoder preentrenado para una tarea discriminativa.

El entrenamiento se realizo con el Trainer de Hugging Face usando una tasa de aprendizaje de 2e-05, batch de entrenamiento y evaluacion de 8, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, y un scheduler lineal. La configuracion declara 10 epocas, aunque la tabla de resultados solo recoge tres epocas (pasos 1252, 2504 y 3756). El dataset de ajuste no esta identificado en la model card ("on an unknown dataset"), por lo que no se conoce ni la composicion del corpus, ni el esquema de etiquetas, ni si hubo una fase posterior de RLHF o DPO (poco habitual en tareas de etiquetado, por otra parte). No se detalla el numero de tokens de entrenamiento.

## Capacidades

- Reconocimiento de entidades nombradas a nivel de token: asignacion de etiquetas a cada token de una secuencia de entrada mediante el pipeline `token-classification` de transformers.
- Extraccion de entidades en texto de entrada, siempre que el conjunto de etiquetas coincida con el usado en su ajuste fino (no documentado).
- Inferencia rapida en CPU y en GPU consumer gracias a su tamano de 33,2 millones de parametros.
- Compatibilidad con `endpoints_compatible` en Hugging Face, lo que permite desplegarlo como endpoint gestionado.
- Soporte de tool calling / function calling: no disponible, es un modelo discriminativo de etiquetado, no generativo.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el modelo base esta orientado a ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Extraccion de entidades en corpus documentales a gran escala: al ser un modelo de 33,2 millones de parametros, se puede procesar por lotes en CPU o en una unica GPU, con lo que resulta adecuado para pipelines de enriquecimiento sobre millones de documentos donde el coste por inferencia es el factor limitante.
- Pre-etiquetado para anotacion humana (active learning): el modelo puede generar etiquetas iniciales con un F1 declarado de 0,9142 sobre su conjunto de evaluacion, que despues revisan anotadores humanos, reduciendo el coste de construccion de datasets propios.
- Deteccion de informacion personal identificable (PII) como paso previo a un pipeline de tratamiento de datos: si el conjunto de etiquetas incluye entidades de tipo persona, organizacion o localidad, el modelo puede marcar los tramos de texto que requieren anonimizacion antes de almacenar o enviar los datos a un servicio externo.
- Enriquecimiento de metadatos para busqueda y RAG: combinado con el propio bge-small-en-v1.5 (que actua como modelo de embeddings en el mismo tamano), permite indexar documentos por las entidades que contienen ademas de por similitud semantica.
- Procesamiento de noticias y boletines: extraccion sistematica de organizaciones, localizaciones y personas en flujos de prensa o comunicados para alimentar paneles de seguimiento o bases de conocimiento.
- Clasificacion de documentacion legal o financiera: etiquetado de partes, jurisdicciones e importes en contratos y expedientes, aprovechando la ventana de contexto del encoder para fragmentos de documento.
- Prototipado y validacion de conceptos: por su tamano y su licencia MIT, sirve para verificar rapidamente si una aproximacion basada en encoder cubre las necesidades de extraccion de entidades de un proyecto antes de invertir en modelos mayores.

## Benchmarks y rendimiento

La model card declara los siguientes resultados sobre el conjunto de evaluacion (no se especifica si las metricas son token-level o seqeval, ni el dataset empleado):

| Metrica | Valor |
|---|---|
| Loss | 0,1143 |
| Precision | 0,9023 |
| Recall | 0,9265 |
| F1 | 0,9142 |
| Accuracy | 0,9822 |

Evolucion por epoca reportada por el autor:

| Training loss | Epoca | Paso | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|---|
| 0,0067 | 1.0 | 1252 | 0,1170 | 0,9016 | 0,9226 | 0,9120 | 0,9812 |
| 0,0047 | 2.0 | 2504 | 0,1187 | 0,9130 | 0,9258 | 0,9194 | 0,9825 |
| 0,0048 | 3.0 | 3756 | 0,1143 | 0,9023 | 0,9265 | 0,9142 | 0,9822 |

El array `results` del model-index esta vacio, por lo que no hay resultados comparables de benchmarks estandar (MMLU, GLUE, HumanEval, GSM8K u otros). No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 130 MB en fp32 y unos 66 MB en fp16 para los pesos; el consumo real depende del tamano de lote y de la longitud de secuencia, pero es inferior a 1 GB en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria, incluidas GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090, T4, A100 y H100. No requiere aceleradores de gama alta.
- Compatibilidad con GPU consumer: si, cabe holgadamente en cualquier GPU consumer moderna e incluso en GPUs integradas o en CPU.
- Opciones de despliegue: transformers (PyTorch) es la ruta nativa; tambien es posible exportarlo a ONNX Runtime para inferencia en CPU y desplegarlo como endpoint gestionado de Hugging Face. Para llama.cpp u Ollama seria necesaria una conversion previa a GGUF, que no se ha publicado. vLLM y TGI estan orientados a modelos generativos, por lo que su uso con este modelo de token-classification no es la ruta habitual.
- Latencia y throughput estimados: no disponibles; la model card solo indica que la evaluacion se ejecuto con batch de 8, sin tiempos.

## Comparativa con modelos similares

| Modelo | Modelo base | Parametros | Dataset de ajuste | F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| disbik/bert-finetuned-ner | BAAI/bge-small-en-v1.5 | 33,2 M | no documentado | 0,9142 | MIT | Hugging Face |
| nt-ai/bert-finetuned-ner | bert-base-cased | no disponible | conll2003 | 0,9420 | no disponible | Hugging Face |
| balamurugan1603/bert-finetuned-ner | BERT (variante no especificada) | no disponible | no documentado | no disponible | no disponible | Hugging Face |

La comparacion directa con nt-ai/bert-finetuned-ner no es equivalente: ese modelo reporta F1 0,9420 sobre conll2003, mientras que el conjunto de evaluacion de disbik/bert-finetuned-ner no esta identificado. Ademas, nt-ai parte de bert-base-cased (encoder de mayor tamano), por lo que la diferencia de rendimiento no puede atribuirse solo al ajuste fino. El modelo de balamurugan1603 no publica metricas comparables en la informacion disponible.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: se desconoce la composicion del corpus, el dominio y el esquema de etiquetas, lo que impide anticipar que tipos de entidad reconoce realmente.
- Model card auto-generada: las secciones de descripcion, usos previstos y datos de entrenamiento contienen "More information needed", por lo que no hay guia del autor sobre el uso adecuado.
- Inconsistencia en el entrenamiento: la configuracion declara 10 epocas, pero solo se reportan resultados hasta la epoca 3; se desconoce si el entrenamiento se detuvo antes o si la tabla esta incompleta.
- Metricas sin metodologia: no se especifica si precision, recall y F1 se calcularon a nivel de token o con seqeval a nivel de entidad, ni tampoco el conjunto de validacion empleado.
- Riesgo de error en fronteras de entidad: como todo modelo NER basado en etiquetado por token, puede producir secuencias de etiquetas invalidas (por ejemplo, etiquetas I- sin una B- previa) que requieren post-procesado.
- Idioma: los idiomas soportados no estan declarados y el modelo base esta orientado a ingles; el rendimiento en castellano es una incognita.
- Longitud de contexto limitada por el encoder subyacente, que no admite secuencias largas sin truncado o fragmentacion.
- Alucinacion: al ser un modelo discriminativo de etiquetado y no generativo, no produce texto libre; el riesgo equivalente es la asignacion de entidades inexistentes o mal tipadas.
- Sesgos: no hay informacion sobre la composicion del dataset, por lo que no se puede evaluar el sesgo demografico, geografico o de dominio del modelo.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de copyright y la licencia. Conviene verificar tambien las condiciones del modelo base BAAI/bge-small-en-v1.5.
- Repositorio de 1,9 GB para un modelo de 33,2 millones de parametros: el grueso del espacio corresponde a los checkpoints de entrenamiento, no a los pesos finales.
- Ausencia de benchmarks reproducibles: no se ha publicado evaluacion sobre conll2003, CoNLL-2003 u otros conjuntos estandar, lo que dificulta la comparacion objetiva con alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/disbik/bert-finetuned-ner
- Modelo base BAAI/bge-small-en-v1.5: https://huggingface.co/BAAI/bge-small-en-v1.5
- nt-ai/bert-finetuned-ner (referencia comparativa, ajustado sobre conll2003): https://huggingface.co/nt-ai/bert-finetuned-ner
- balamurugan1603/bert-finetuned-ner (referencia comparativa): https://huggingface.co/balamurugan1603/bert-finetuned-ner
- Articulo sobre ajuste fino de BERT para NER: https://medium.com/@whyamit101/fine-tuning-bert-for-named-entity-recognition-ner-b42bcf55b51d
- Repositorio Liki990/bert_model (BERT ajustado en tareas NER): https://github.com/Liki990/bert_model
- Tutorial de ajuste fino de DistilBERT para NER: https://kgptalkie.com/tutorials/generative-ai/fine-tuning-distilbert-ner
