# Fosfor1618/bge-small-ner-hw2

## Resumen

bge-small-ner-hw2 es un modelo de clasificacion de tokens (token classification) especializado en reconocimiento de entidades nombradas (NER), publicado por el usuario Fosfor1618 en HuggingFace. Se trata de un ajuste fino (fine-tuning) del modelo de embeddings BAAI/bge-small-en-v1.5, un encoder basado en la arquitectura BERT con 33.215.625 parametros totales. El modelo se distribuye bajo licencia MIT y en formato safetensors, compatible con la libreria transformers.

El modelo resuelve la tarea de etiquetado de secuencias: dado un texto de entrada, asigna una etiqueta a cada token (por ejemplo, el tipo de entidad a la que pertenece). Segun los datos declarados por el autor en la model card, alcanza en el conjunto de evaluacion una precision de 0,8956, un recall de 0,9228, un F1 de 0,9090 y una accuracy de 0,9807, con una perdida de evaluacion de 0,0797. No se especifica el esquema de etiquetas empleado ni el dominio del dataset de entrenamiento.

La relevancia de este modelo es limitada y de nicho: se trata de un checkpoint de investigacion o de un ejercicio de fine-tuning (la model card esta generada automaticamente por el Trainer y contiene campos sin completar, como "More information needed" en descripcion, usos previstos y datos de entrenamiento). No cuenta con descargas ni "likes" en el momento de la consulta y no se han declarado resultados de benchmarks estandar. Su interes practico reside en servir como base para tareas de extraccion de entidades en ingles dentro de pipelines propios, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer tipo BERT (derivado de BAAI/bge-small-en-v1.5) |
| Parametros totales | 33.215.625 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base BAAI/bge-small-en-v1.5 esta limitado a 512 tokens, sin confirmacion explicita para este ajuste) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | no disponibles (el modelo base bge-small-en esta orientado a ingles, pero el autor no lo declara) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de BAAI/bge-small-en-v1.5, un encoder transformer de tipo BERT con 33 millones de parametros, originalmente entrenado para generar embeddings de frases y textos en ingles. Sobre esa base, el autor ha realizado un fine-tuning para token classification, anadiendo una cabeza de clasificacion por token. No se dispone de informacion sobre la composicion del dataset de entrenamiento, que la propia model card describe como "unknown dataset", ni sobre el esquema de etiquetas (BIO, BIOES u otro) empleado.

Los hiperparametros de entrenamiento declarados son: learning rate de 2e-05, tamano de lote de 16 tanto en entrenamiento como en evaluacion, semilla 42, optimizador AdamW con betas (0,9, 0,999) y epsilon 1e-08, scheduler de learning rate lineal y 10 epochs configuradas. La tabla de resultados del Trainer solo recoge hasta la epoch 7, con 4382 pasos, por lo que no se documenta el comportamiento en las tres epochs restantes. Se observa convergencia progresiva: el F1 pasa de 0,7988 en la epoch 1 a un maximo de 0,9103 en la epoch 5, con un ligero retroceso posterior hasta 0,9090 en la epoch 7. Las versiones de framework empleadas fueron Transformers 4.51.3, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.21.4. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion, algo coherente con una tarea discriminativa de etiquetado y no generativa.

## Capacidades

- Clasificacion de tokens y reconocimiento de entidades nombradas: asigna una etiqueta a cada token de una secuencia de entrada.
- Extraccion de entidades en texto: puede emplearse para identificar personas, organizaciones, lugares u otras categorias, siempre que el esquema de etiquetas coincida con el usado en su entrenamiento (no documentado).
- Procesamiento por lotes: al ser un encoder pequeno, permite inferencia de alto rendimiento sobre grandes volumenes de texto.
- No dispone de generacion de texto: es un modelo discriminativo, no autoregresivo.
- No soporta tool calling ni function calling.
- No esta disenado para razonamiento multi-paso ni para uso como agente.
- Capacidades multilingues: no confirmadas; el modelo base esta orientado a ingles.
- No incorpora vision, audio, modo "thinking" ni ninguna capacidad multimodal.

## Casos de uso

- Deteccion y anonimizacion de datos personales (PII): el modelo puede etiquetar nombres, organizaciones y ubicaciones en documentos para enmascararlos antes de almacenarlos o compartirlos, como paso previo al cumplimiento de normativas de proteccion de datos.
- Indexacion semantica en pipelines RAG: extraer entidades de documentos y usarlas como metadatos enriquecidos para mejorar la recuperacion en sistemas de generacion aumentada por recuperacion.
- Procesamiento de tickets de soporte: identificar productos, empresas o personas mencionadas en correos y tickets para enrutarlos automaticamente al equipo correspondiente.
- Analisis de curriculos: extraer nombres de empresas, puestos, titulaciones y ubicaciones de CV en texto plano para alimentar una base de datos de candidatos.
- Monitorizacion de menciones de marca: detectar nombres de organizaciones y productos en articulos, foros o redes sociales para analisis de reputacion.
- Extraccion de informacion en documentos legales o financieros: etiquetar partes contractuales, jurisdicciones o entidades financieras en contratos, siempre que el esquema de etiquetas sea compatible.
- Preprocesamiento para busqueda y analitica: normalizar y etiquetar entidades en grandes corpus textuales antes de tareas de agregacion o clustering.
- Clasificacion de entidades en registros cientificos o medicos: identificar terminos relevantes, sujeto a validacion previa del esquema de etiquetas.

## Benchmarks y rendimiento

El model-index declarado por el autor no contiene resultados (`results: []`), por lo que no hay benchmarks estandar publicados (MMLU, HumanEval, GSM8K u otros no aplican a un modelo de clasificacion de tokens). La model card si recoge metricas sobre el conjunto de evaluacion, que se reproducen a continuacion tal cual fueron declaradas:

| Metrica (conjunto de evaluacion) | Valor |
|---|---|
| Loss | 0,0797 |
| Precision | 0,8956 |
| Recall | 0,9228 |
| F1 | 0,9090 |
| Accuracy | 0,9807 |

Evolucion durante el entrenamiento, segun la tabla del Trainer:

| Epoch | Paso | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|
| 1,0 | 626 | 0,1731 | 0,7715 | 0,8280 | 0,7988 | 0,9646 |
| 2,0 | 1252 | 0,1116 | 0,8571 | 0,8940 | 0,8751 | 0,9765 |
| 3,0 | 1878 | 0,0922 | 0,8667 | 0,9095 | 0,8876 | 0,9782 |
| 4,0 | 2504 | 0,0836 | 0,8808 | 0,9174 | 0,8987 | 0,9796 |
| 5,0 | 3130 | 0,0781 | 0,8987 | 0,9222 | 0,9103 | 0,9817 |
| 6,0 | 3756 | 0,0796 | 0,8968 | 0,9211 | 0,9088 | 0,9809 |
| 7,0 | 4382 | 0,0797 | 0,8956 | 0,9228 | 0,9090 | 0,9807 |

No se han publicado resultados de benchmarks estandar comparables en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP32 ocupan aproximadamente 133 MB (33,2 M de parametros x 4 bytes); en FP16 unos 66 MB; en INT8 unos 33 MB. El consumo real de memoria en GPU es mayor por activaciones y buffers, pero en cualquier caso es inferior a 1 GB para lotes moderados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4090, T4, A10, A100, H100). El modelo no requiere GPU de gama alta.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna, e incluso en CPU con latencias aceptables dado el reducido tamano del modelo.
- Opciones de despliegue: pipeline de transformers (`token-classification`), ONNX Runtime para inferencia optimizada, TorchServe, y endpoints de Hugging Face (la etiqueta `endpoints_compatible` esta presente). No aplica a motores de inferencia para modelos generativos como vLLM o llama.cpp en su uso tipico.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dado el tamano del modelo (33 M de parametros, encoder), se espera un throughput elevado en GPU y lotes grandes, pero no hay cifras declaradas.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bge-small-ner-hw2 (este modelo) | 33.215.625 | Token classification / NER | no disponible | MIT | HuggingFace (Fosfor1618) |
| BAAI/bge-small-en-v1.5 (modelo base) | 33 M aprox. | Embeddings de texto | 512 tokens | MIT | HuggingFace (BAAI) |
| Modelos NER tipo BERT base (por ejemplo dslim/bert-base-NER) | 110 M aprox. | Token classification / NER | 512 tokens | MIT | HuggingFace |

Los datos de rendimiento de las alternativas no se han incluido porque no forman parte de la informacion proporcionada; solo se comparan parametros, tarea y licencia. No se dispone de comparativas de F1 o precision frente a estos modelos en la documentacion disponible.

## Limitaciones y advertencias

- La model card esta generada automaticamente y contiene secciones sin completar ("More information needed"), por lo que no se documentan usos previstos, limitaciones ni composicion del dataset.
- No se especifica el esquema de etiquetas ni el dominio de entrenamiento, lo que impide garantizar que las entidades que detecta coincidan con las necesidades de un caso de uso concreto.
- Riesgo de alucinacion no aplica en sentido generativo (no genera texto), pero si existe riesgo de falsos positivos y falsos negativos en el etiquetado, con un recall de 0,9228 y una precision de 0,8956 declarados.
- No hay informacion sobre sesgos del dataset de entrenamiento ni evaluacion por subgrupos.
- Idiomas soportados no declarados: el modelo base esta orientado a ingles, por lo que el rendimiento en castellano u otros idiomas es incierto.
- Licencia MIT: permite uso comercial y modificacion con atribucion, sin restricciones adicionales conocidas.
- El modelo tiene 0 descargas y 0 "likes", sin validacion externa ni comunidad que lo respalde; debe tratarse como un experimento no auditado.
- La fecha de creacion registrada (2026-10-03) y la tabla de entrenamiento que se detiene en la epoch 7 pese a configurarse 10 epochs son inconsistencias de la documentacion que conviene verificar antes de usarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Fosfor1618/bge-small-ner-hw2
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
