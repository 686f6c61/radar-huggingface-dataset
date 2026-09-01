# SalvadorDiaz/bert-finetuned-ner

## Resumen

`SalvadorDiaz/bert-finetuned-ner` es un modelo de reconocimiento de entidades nombradas (NER) basado en `bert-base-cased`, ajustado sobre el dataset CoNLL-2003. El autor, SalvadorDiaz, ha tomado el modelo BERT original de Google y lo ha fine-tuneado con una cabeza de clasificación de tokens para resolver tareas de etiquetado de entidades como personas, organizaciones, ubicaciones y miscelánea.

El modelo resuelve el problema de extracción de información estructurada a partir de texto no estructurado, una tarea fundamental en procesamiento de lenguaje natural. Su relevancia radica en que ofrece un rendimiento sólido en NER con una arquitectura probada y una licencia Apache-2.0 que permite uso comercial sin restricciones significativas. Con aproximadamente 107,7 millones de parámetros, es un modelo de tamaño moderado que puede ejecutarse en hardware de consumo.

La ficha se basa exclusivamente en la información publicada en HuggingFace, que incluye métricas de validación sobre CoNLL-2003 y los hiperparámetros de entrenamiento. No se dispone de información sobre el contexto máximo, idiomas soportados o detalles adicionales de la arquitectura más allá de los derivados de BERT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (Transformer encoder) con cabeza de clasificacion de tokens |
| Parametros totales | 107.735.829 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (BERT base usa 512 tokens, pero no se confirma en la ficha) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre CoNLL-2003, que es ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT (Bidirectional Encoder Representations from Transformers), un encoder Transformer de 12 capas con atención bidireccional. Sobre esta base, se añade una cabeza de clasificación de tokens que asigna una etiqueta NER a cada token de la secuencia de entrada. El modelo base es `bert-base-cased`, que distingue entre mayúsculas y minúsculas, un factor relevante para el reconocimiento de entidades en inglés.

El entrenamiento se realizó sobre el dataset CoNLL-2003, un estándar de referencia para NER en inglés con etiquetas para personas (PER), organizaciones (ORG), ubicaciones (LOC) y miscelánea (MISC). Se utilizó el Trainer de HuggingFace con los siguientes hiperparámetros: learning rate de 2e-05, batch size de 8, optimizador Adam (betas 0.9 y 0.999, epsilon 1e-08), scheduler lineal y 3 épocas. El proceso fue un fine-tuning supervisado estándar, sin técnicas como RLHF o DPO. No se documentan innovaciones técnicas adicionales más allá del ajuste del modelo base.

## Capacidades

- Reconocimiento de entidades nombradas: identifica personas, organizaciones, ubicaciones y miscelánea en texto en inglés.
- Clasificación de tokens: asigna una etiqueta BIO (Begin, Inside, Outside) a cada token de la secuencia.
- Procesamiento de texto en inglés: entrenado específicamente sobre el corpus CoNLL-2003, que contiene texto periodístico en inglés.
- Integración con pipelines de HuggingFace: compatible con la pipeline de `token-classification` de Transformers.
- Inferencia en endpoints: el modelo es compatible con Inference Endpoints de HuggingFace.
- Sin capacidades de generación de texto, tool calling, agentes, visión o audio: es un modelo exclusivamente discriminativo para NER.

## Casos de uso

- Extracción de entidades en documentos legales: el modelo puede identificar nombres de personas, empresas y ubicaciones en contratos o acuerdos, facilitando la automatización de procesos de revisión documental. Su alta precisión (93,86 %) lo hace adecuado para tareas donde los errores de extracción tienen coste elevado.
- Procesamiento de currículos (CV) y ofertas de empleo: permite extraer automáticamente nombres de candidatos, empresas anteriores y ubicaciones de los CV, así como requisitos de ubicación en ofertas. La velocidad de inferencia de BERT base permite procesar grandes volúmenes en lote.
- Análisis de noticias y artículos periodísticos: al estar entrenado sobre CoNLL-2003, un corpus periodístico, el modelo es especialmente adecuado para extraer entidades de artículos de prensa, permitiendo construir bases de datos de actores y organizaciones mencionadas.
- Monitorización de menciones de marca en redes sociales: aunque el modelo no está entrenado específicamente para redes sociales, puede adaptarse con fine-tuning adicional. En su estado actual, puede identificar organizaciones y personas en texto informal con resultados razonables.
- Enriquecimiento de bases de datos de clientes: el modelo puede extraer nombres de empresas y contactos de correos electrónicos o formularios de texto libre, mejorando la calidad de los datos maestros en sistemas CRM.
- Preprocesamiento para sistemas de recuperación de información: la extracción de entidades permite indexar documentos por las entidades que contienen, mejorando la precisión de búsquedas semánticas o filtradas por entidad en motores de búsqueda internos.

## Benchmarks y rendimiento

Los siguientes resultados corresponden al conjunto de validación de CoNLL-2003, según los datos declarados por el autor en la model card. No se han verificado de forma independiente.

| Metrica | Valor |
|---|---|
| Precision | 0,9386 |
| Recall | 0,9542 |
| F1 | 0,9463 |
| Accuracy | 0,9870 |
| Loss | 0,0646 |

La evolución durante el entrenamiento muestra una mejora progresiva: el F1 pasó de 0,9362 en la época 1 a 0,9463 en la época 3, con una pérdida de validación mínima de 0,0646. No se dispone de comparativas con otros modelos en la información publicada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB en FP32 para un batch de 1, dado el tamaño de 107,7 millones de parámetros. Con cuantización a int8, podría reducirse a menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente. Modelos como NVIDIA T4, GTX 1660, RTX 2060 o superiores funcionan sin problemas. También es viable en CPU para inferencia en lote con latencia aceptable.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer moderna, incluidas las integradas de gama alta.
- Opciones de despliegue: Transformers de HuggingFace, ONNX Runtime, TensorFlow Serving, TorchServe, y cualquier framework compatible con safetensors. También es compatible con Inference Endpoints de HuggingFace.
- Latencia estimada: en una GPU T4, la inferencia sobre una secuencia de 128 tokens debería completarse en decenas de milisegundos. En CPU, la latencia puede ser de 100-500 ms por secuencia, dependiendo del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 (CoNLL-2003) | Licencia |
|---|---|---|---|---|
| SalvadorDiaz/bert-finetuned-ner | 107,7 M | no disponible | 0,9463 | Apache-2.0 |
| bert-base-cased (sin fine-tuning) | 108,3 M | 512 | no aplica (no entrenado para NER) | Apache-2.0 |
| dslim/bert-base-NER | 107,7 M | 512 | 0,9150 (aprox., no verificado) | Apache-2.0 |

La comparativa con `dslim/bert-base-NER` es orientativa, ya que no se dispone de datos verificados de ese modelo en la información proporcionada. El modelo de SalvadorDiaz supera en F1 al modelo NER de referencia de dslim según los datos declarados, aunque ambos parten de la misma arquitectura base. No se dispone de información suficiente para comparar con modelos más recientes como RoBERTa o DeBERTa.

## Limitaciones y advertencias

- Sesgos del dataset de entrenamiento: CoNLL-2003 contiene texto periodístico en inglés de 2003, por lo que el modelo puede tener sesgos hacia ese dominio y época. Las entidades de texto informal, técnico o de otros registros pueden no reconocerse correctamente.
- Riesgo de alucinación en etiquetas: aunque es un modelo discriminativo, puede asignar etiquetas incorrectas a tokens ambiguos o fuera de distribución. La precisión del 93,86 % implica que aproximadamente 6 de cada 100 entidades predichas son incorrectas.
- Limitaciones de idioma: el modelo está entrenado únicamente sobre texto en inglés. No funcionará correctamente con otros idiomas sin fine-tuning adicional.
- Contexto limitado: BERT base tiene un máximo de 512 tokens por secuencia. Textos más largos deben truncarse o dividirse, lo que puede perder entidades en los límites de los segmentos.
- Model card incompleta: la documentación del autor indica "More information needed" en varias secciones, por lo que no se dispone de información sobre el contexto exacto, el preprocesamiento o los casos de uso previstos.
- Sin garantías de producción: al ser un modelo generado automáticamente con `generated_from_trainer`, no hay evidencia de pruebas exhaustivas en entornos de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SalvadorDiaz/bert-finetuned-ner
- Perfil del autor: https://huggingface.co/SalvadorDiaz
- Modelo base: https://huggingface.co/bert-base-cased
- Dataset CoNLL-2003: https://huggingface.co/datasets/conll2003
- Tutorial de NER con BERT (referencia): https://colab.research.google.com/github/NielsRogge/Transformers-Tutorials/blob/master/BERT/Custom_Named_Entity_Recognition_with_BERT.ipynb
