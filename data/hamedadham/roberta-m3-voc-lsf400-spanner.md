# HamedAdham/roberta-m3-voc-lsf400-spanner

## Resumen

roberta-m3-voc-lsf400-spanner es un modelo de reconocimiento de entidades nombradas (NER) basado en spans, desarrollado por HamedAdham, especializado en la deteccion de nueve categorias de factores de estilo de vida (Lifestyle Factors, LSF) en resumenes de articulos biomedicos. El modelo parte del backbone RoBERTa-large-PM-M3-Voc, un encoder de 24 capas y 1024 dimensiones ocultas preentrenado sobre literatura biomedica, al que se anade una cabeza de clasificacion SpanNER de 1,61 millones de parametros.

El modelo resuelve un problema concreto de extraccion de informacion en el dominio biomedico: identificar menciones de factores como nutricion, sueno, actividad fisica, consumo de sustancias, exposicion ambiental, practicas de salud mental, factores socioeconomicos, productos de cuidado personal y actividades de ocio no fisicas. Frente a un token-classifier convencional, emplea una formulacion basada en spans con una anchura maxima de 8 tokens, lo que permite capturar entidades multi-palabra de forma mas robusta.

Es relevante por su caracter de modelo pequeno y especializado (355,1 M de parametros en el encoder mas la cabeza) publicado con licencia Apache 2.0, lo que facilita su integracion en pipelines de mineria de literatura cientifica. Su contexto maximo es de 512 tokens y esta entrenado exclusivamente en ingles sobre un split revisado de 240 resumenes del corpus LSF-400.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-large-PM-M3-Voc) con cabeza SpanNER basada en spans |
| Parametros totales | 356,71 M (355,1 M encoder + 1,61 M cabeza) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (max_length); anchura maxima de span de 8 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`best_spanner.pt`) junto con `modeling_spanner.py` |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de tipo encoder-only basada en RoBERTa-large-PM-M3-Voc, un RoBERTa-large preentrenado sobre corpus biomedicos (PubMed, MIMIC-III y PMC). Sobre el encoder se anade una cabeza SpanNER que enumera candidatos de span hasta una anchura maxima de 8 tokens y clasifica cada span en una de las nueve categorias LSF mas la clase `O` (no-LSF). El checkpoint `best_spanner.pt` contiene tanto el encoder ajustado como la cabeza de clasificacion, sin necesidad de pesos separados de token-classifier.

El ajuste fino se realizo sobre el split de entrenamiento de LSF-400, compuesto por 240 resumenes revisados con 3.059 entidades gold canonicas. La validacion se efectuo sobre `reviewed_balanced/val`, con 80 resumenes y 1.021 entidades gold. El autor recomienda un umbral de decision de 0,55, que ofrece el mejor equilibrio entre precision y recall en las metricas reportadas. No se especifica en la informacion disponible el numero total de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO (no aplicables habitualmente a tareas de NER supervisado).

## Capacidades

- Reconocimiento de entidades nombradas basado en spans en texto biomedico en ingles.
- Deteccion de nueve categorias canonicas de factores de estilo de vida: productos de cuidado personal y procedimientos cosmeticos, consumo de sustancias, exposiciones ambientales, practicas de salud mental, actividades de ocio no fisicas, nutricion, actividad fisica, sueno y factores socioeconomicos.
- Clasificacion multi-clase a nivel de mencion con umbral de decision configurable (`tau`).
- Extraccion de entidades multi-palabra gracias a la formulacion basada en spans (hasta 8 tokens por mencion).
- Inferencia sobre abstracts de hasta 512 tokens.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni generacion de texto.
- No dispone de capacidades multimodales (vision, audio) ni de modo thinking.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Mineria de literatura biomedica: procesar grandes volumenes de abstracts de PubMed para extraer automaticamente menciones de factores de estilo de vida y construir bases de datos estructuradas de evidencia epidemiologica.
- Revisiones sistematicas asistidas: pre-anotar abstracts candidatos con entidades LSF para acelerar el cribado manual por parte de revisores humanos, usando el umbral 0,55 recomendado para maximizar el equilibrio precision/recall.
- Construccion de grafos de conocimiento biomedicos: enlazar entidades LSF detectadas con ontologias o vocabularios controlados para enriquecer bases de conocimiento sobre determinantes de salud.
- Analisis de cohortes y estudios observacionales: extraer de forma automatica los factores de estilo de vida reportados en la literatura para alimentar meta-analisis o modelos de riesgo.
- Anotacion asistida (active learning): generar pre-anotaciones de alta cobertura (F1 de mencion candidata del 84,75 %) que los anotadores humanos corrigen, reduciendo el coste de crear nuevos corpus LSF.
- Vigilancia y seguimiento tematico: monitorizar la evolucion de la investigacion sobre categorias concretas (por ejemplo, sueno o nutricion) filtrando abstracts por presencia de entidades de esa categoria.
- Integracion en pipelines de NLP clinico: como componente de extraccion de informacion dentro de sistemas mayores que requieran identificar exposiciones y habitos en texto cientifico en ingles.

## Benchmarks y rendimiento

Resultados de validacion reportados por el autor sobre `reviewed_balanced/val` (80 abstracts, 1.021 entidades gold):

| Umbral (`tau`) | Predicciones | Conll estricto (P / R / F1) | MUC-7 parcial (P / R / F1) | Mencion candidata (P / R / F1) |
|---:|---:|---|---|---|
| 0,50 | 1.085 | 67,56 % / 71,79 % / 69,61 % | 81,57 % / 86,68 % / 84,05 % | 82,40 % / 86,58 % / 84,44 % |
| 0,55 (recomendado) | 1.070 | 68,22 % / 71,50 % / 69,82 % | 82,43 % / 86,39 % / 84,36 % | 83,27 % / 86,29 % / 84,75 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que se trata de un modelo especializado en NER y no de un modelo generativo de proposito general.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,4 GB en precision completa (FP32) para los 356,71 M de parametros; alrededor de 0,7 GB en FP16/BF16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo esta sobredimensionado para estas ultimas.
- Cabe holgadamente en GPU de consumo (GTX 1650, RTX 3050 y superiores) e incluso podria ejecutarse en CPU para lotes pequenos.
- Opciones de despliegue: el modelo requiere cargar `modeling_spanner.py` mediante `huggingface_hub` y ejecutar la funcion `load_spanner`; no se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI, dado que no es un modelo generativo estandar de la libreria Transformers.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| roberta-m3-voc-lsf400-spanner | 356,71 M | 512 tokens | NER de spans (9 clases LSF) | Apache 2.0 | Especializado en factores de estilo de vida en abstracts biomedicos |
| BioBERT / PubMedBERT (token classification) | 110 M aprox. | 512 tokens | NER de token-classification generico | Apache 2.0 / MIT | Requieren ajuste fino especifico por tarea; no incluyen cabeza SpanNER |
| RoBERTa-large-PM-M3-Voc (base) | 355 M | 512 tokens | Encoder preentrenado | MIT | Backbone sin ajuste; necesita cabeza y datos de entrenamiento para NER |
| Modelos NER biomedicos genericos (p. ej. basados en BERT) | variable | 512 tokens | NER de entidades biomedicas (gen, enfermedad, farmaco) | variable | No cubren las categorias LSF especificas |

No se dispone de datos comparativos de rendimiento directo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles; no soporta otros idiomas.
- Dominio restringido a abstracts biomedicos; el rendimiento puede degradarse en texto clinico completo, notas de pacientes u otros generos.
- Contexto maximo de 512 tokens, lo que limita el procesamiento de documentos largos sin fragmentacion previa.
- El conjunto de entrenamiento es pequeno (240 abstracts), lo que aumenta el riesgo de sobreajuste y de baja generalizacion a distribuciones distintas.
- Posible sesgo hacia las nueve categorias predefinidas; entidades LSF fuera de esa taxonomia no seran detectadas.
- Riesgo de falsos positivos y negativos inherente al NER; conviene validar el umbral `tau` en el dominio de destino.
- No es un modelo generativo: no puede usarse para resumen, respuesta a preguntas ni razonamiento.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion ni sobre la exactitud clinica de las extracciones.
- No se documentan evaluaciones de sesgo ni de robustez frente a variaciones de redaccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HamedAdham/roberta-m3-voc-lsf400-spanner
- Backbone RoBERTa-large-PM-M3-Voc: no disponible en la informacion proporcionada (referencia habitual: https://huggingface.co/allenai/roberta-large-pm-m3-voc)
- Paper de SpanNER: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
