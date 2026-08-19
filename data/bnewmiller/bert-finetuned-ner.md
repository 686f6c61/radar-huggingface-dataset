# bnewmiller/bert-finetuned-ner

## Resumen

`bnewmiller/bert-finetuned-ner` es un modelo de clasificación de tokens (token classification) especializado en reconocimiento de entidades nombradas (NER), desarrollado por el usuario bnewmiller mediante fine-tuning de `bert-base-cased` con la librería Transformers de Hugging Face. El modelo hereda la arquitectura BERT base (encoder-only transformer) con 107,7 millones de parámetros y una ventana de contexto de 512 tokens, y se distribuye bajo licencia Apache 2.0 en formato safetensors.

El modelo fue entrenado durante 3 épocas con un dataset no especificado en la model card, alcanzando en el conjunto de evaluación una precisión de 0,9313, recall de 0,9485 y F1 de 0,9398. Aunque la información pública es limitada (la model card está generada automáticamente y carece de detalles sobre los datos de entrenamiento), los resultados reportados sugieren un rendimiento sólido en la tarea de NER, comparable a otros fine-tunings de BERT base.

Su relevancia radica en ser un ejemplo de fine-tuning sencillo y reproducible para NER, útil como punto de partida para desarrolladores que necesitan extraer entidades de textos en inglés (idioma del modelo base, aunque no está confirmado para este fine-tuning). No obstante, la falta de documentación sobre el dataset y las categorías de entidades limita su uso directo en producción sin una evaluación previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (encoder-only transformer, 12 capas, 768 hidden, 12 cabezas) |
| Parametros totales | 107.726.601 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (máximo de BERT base) |
| Tipos de cuantizacion | no disponible (repo contiene safetensors, no se especifican cuantizaciones) |
| Idiomas soportados | no disponible (modelo base entrenado en inglés, pero el fine-tuning no especifica idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en BERT base cased, un transformer encoder-only de 12 capas con 768 dimensiones ocultas y 12 cabezas de atención, entrenado originalmente con BookCorpus y Wikipedia en inglés. Para este fine-tuning, se añadió una cabeza de clasificación de tokens sobre la representación contextual de cada token, típica para tareas de NER.

El entrenamiento se realizó con el Trainer de Hugging Face, usando un dataset no especificado en la model card. Los hiperparámetros reportados son: learning rate de 2e-05, batch size de 8, 3 épocas, optimizador AdamW (con betas 0.9 y 0.999, epsilon 1e-08), scheduler lineal y seed 42. No se menciona el uso de técnicas como RLHF, DPO o decodificación especulativa, ya que no es un modelo generativo. La pérdida final en evaluación fue de 0,0617.

## Capacidades

- Reconocimiento de entidades nombradas (NER) mediante clasificación de tokens: etiqueta cada token como parte de una entidad (persona, organización, lugar, etc.), aunque las categorías exactas no están documentadas.
- Procesamiento de secuencias de hasta 512 tokens, adecuado para párrafos o documentos cortos.
- Inferencia eficiente para modelos de su tamaño: puede ejecutarse en CPU o GPU con requisitos modestos.
- Compatible con el ecosistema Transformers: se puede cargar con `pipeline("token-classification")` o integrar en pipelines personalizados.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso, al ser un modelo encoder-only de clasificación.

## Casos de uso

- Extracción de entidades en documentos legales: el modelo puede identificar nombres de personas, empresas y lugares en contratos o escritos judiciales, facilitando la indexación y búsqueda posterior.
- Anonimización de datos personales: en historiales clínicos o registros administrativos, el modelo puede localizar nombres, direcciones o identificadores para su posterior enmascaramiento, ayudando a cumplir normativas de privacidad.
- Etiquetado automático de noticias: al procesar artículos periodísticos, se pueden extraer organizaciones, políticos o ubicaciones para generar metadatos y mejorar sistemas de recomendación.
- Procesamiento de currículums: identificación de empresas, cargos y títulos académicos en CVs para automatizar la clasificación de candidatos en procesos de selección.
- Análisis de menciones en redes sociales: detección de nombres de marcas o productos en tweets o comentarios, útil para monitorización de reputación.
- Extracción de entidades en facturas o correos electrónicos: localización de nombres de proveedores, números de referencia o direcciones en documentos comerciales para su integración en sistemas ERP.

## Benchmarks y rendimiento

La model card no incluye benchmarks estándar (MMLU, HumanEval, etc.) por tratarse de un modelo de clasificación de tokens. Los resultados reportados por el autor sobre el conjunto de evaluación son los siguientes:

| Metrica | Valor |
|---|---|
| Loss | 0,0617 |
| Precision | 0,9313 |
| Recall | 0,9485 |
| F1 | 0,9398 |
| Accuracy | 0,9860 |

Evolución durante el entrenamiento:

| Training Loss | Epoch | Step | Validation Loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|---|
| 0,0759 | 1.0 | 1756 | 0,0696 | 0,8960 | 0,9298 | 0,9126 | 0,9797 |
| 0,0325 | 2.0 | 3512 | 0,0710 | 0,9329 | 0,9435 | 0,9382 | 0,9844 |
| 0,0222 | 3.0 | 5268 | 0,0617 | 0,9313 | 0,9485 | 0,9398 | 0,9860 |

No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 107,7M de parámetros; en FP32 (~430 MB) cabe en GPUs con al menos 1 GB de VRAM, en FP16 (~215 MB) en GPUs de 512 MB, y en cuantización INT8 (~108 MB) en GPUs muy modestas. Sin embargo, el repositorio ocupa 2,6 GB, lo que sugiere que puede incluir pesos en FP32 o múltiples archivos.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, GTX 1650, RTX 2060) para inferencia en FP32. También puede ejecutarse en CPU sin problemas para cargas bajas.
- Despliegue: compatible con la librería Transformers (pipeline de token-classification), ONNX Runtime, y servidores de inferencia como Hugging Face Inference Endpoints (el tag `endpoints_compatible` lo indica).
- Latencia: no hay datos publicados, pero para un modelo de este tamaño en una GPU moderna se esperan latencias del orden de milisegundos por secuencia de 512 tokens; en CPU, del orden de decenas de milisegundos.

## Comparativa con modelos similares

No se dispone de información de benchmarks comparativos en la model card. Como referencia, otros modelos de NER basados en BERT base son `dslim/bert-base-NER` (fine-tuned en CoNLL2003) o `dbmdz/bert-large-cased-finetuned-conll03-english` (para comparar con el tamaño large). Sin embargo, sin datos de rendimiento sobre el mismo conjunto de evaluación, no es posible establecer una comparación cuantitativa fiable. Se recomienda evaluar este modelo con datos propios antes de elegirlo frente a alternativas establecidas.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card no especifica qué dataset se usó ni las categorías de entidades reconocidas, por lo que no se puede garantizar su comportamiento en dominios específicos.
- Sesgos del modelo base: BERT base cased fue entrenado con textos en inglés de internet, por lo que puede presentar sesgos de género, raza o geografía en sus predicciones.
- Riesgo de errores de clasificación: aunque la precisión y el recall son altos en el conjunto de evaluación, no se conoce la distribución de ese conjunto ni si es representativo de casos reales.
- Idioma limitado: aunque el modelo base es inglés, no se ha confirmado que el fine-tuning soporte otros idiomas; se recomienda probar antes de usarlo en textos no ingleses.
- Sin soporte de generación ni herramientas: al ser un modelo encoder-only, no puede generar texto ni interactuar con APIs o agentes.
- Para producción, es imprescindible validar el modelo con un conjunto de datos etiquetado propio, dado que la documentación pública es insuficiente para garantizar su idoneidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/bnewmiller/bert-finetuned-ner)
- [Modelo base: bert-base-cased](https://huggingface.co/google-bert/bert-base-cased)
