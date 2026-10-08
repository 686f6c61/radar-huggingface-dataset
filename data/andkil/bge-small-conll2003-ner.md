# andkil/bge-small-conll2003-ner

## Resumen

`andkil/bge-small-conll2003-ner` es un modelo de reconocimiento de entidades nombradas (NER) obtenido mediante ajuste fino del modelo de embeddings `BAAI/bge-small-en-v1.5` sobre la tarea de clasificacion de tokens. Lo desarrolla el usuario de HuggingFace `andkil` y se distribuye bajo licencia MIT. El modelo resuelve la extraccion de entidades (personas, organizaciones, localidades y miscelanea) en texto en ingles, una tarea clasica de la NLP que sigue siendo la base de sistemas de extraccion de informacion, anonimizacion y enriquecimiento de datos.

Arquitectura y tamano: se trata de un transformer encoder-only de tipo BERT, con 33.215.625 parametros totales (aproximadamente 33 millones) y un peso en disco de unos 0,1 GB en formato safetensors. Al derivar de `bge-small-en-v1.5`, hereda la configuracion compacta de la familia BGE-small, orientada a eficiencia y despliegue en hardware modesto, con una longitud de contexto de 512 tokens heredada del modelo base.

Es relevante ahora porque demuestra el patron de reutilizar un encoder de embeddings ya preentrenado como punto de partida para tareas de etiquetado por token, con un coste de entrenamiento minimo (3 epochs, batch 8) y un rendimiento competitivo (F1 de 0,8818 en validacion). El modelo no tiene descargas ni likes en el momento de la ficha, por lo que debe considerarse un experimento de ajuste fino mas que un artefacto de produccion consolidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only tipo BERT (derivado de BAAI/bge-small-en-v1.5) |
| Parametros totales | 33.215.625 (aproximadamente 33 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredada del modelo base BAAI/bge-small-en-v1.5) |
| Tipos de cuantizacion | No disponible (el repositorio solo incluye pesos en safetensors) |
| Idiomas soportados | No disponible de forma explicita; el modelo base es de proposito general y el conjunto CoNLL-2003 esta en ingles |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea (pipeline) | token-classification (NER) |
| Tamano del repositorio | 0,1 GB |
| Libreria | transformers |
| Version de transformers | 4.50.0 |
| Version de PyTorch | 2.6.0 |

## Arquitectura y entrenamiento

El modelo parte de `BAAI/bge-small-en-v1.5`, un encoder transformer bidireccional del tipo BERT con 33 millones de parametros y una cabeza de clasificacion de tokens anadida para la tarea de NER. La eleccion de un encoder pequeno implica inferencia rapida y bajo consumo de memoria, a cambio de una capacidad de representacion mas limitada que la de modelos de mayor tamano. El nombre del modelo sugiere que el ajuste fino se realizo sobre el corpus CoNLL-2003, aunque la model card indica literalmente "unknown dataset" en la seccion de descripcion, por lo que la composicion exacta del conjunto de datos no esta confirmada en la documentacion.

El entrenamiento se llevo a cabo con los siguientes hiperparametros: learning rate de 2e-05, tamano de lote de 8 tanto en entrenamiento como en evaluacion, 3 epochs, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, y un scheduler de learning rate de tipo lineal. La perdida de entrenamiento evoluciono de 0,1601 en la epoch 1 a 0,0789 en la epoch 3, mientras que la perdida de validacion descendio de 0,1415 a 0,0991, sin senales de sobreajuste marcado. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion, algo coherente con una tarea discriminativa de etiquetado por token.

## Capacidades

- Reconocimiento de entidades nombradas en texto en ingles, con las categorias tipicas del esquema CoNLL-2003 (persona, organizacion, localizacion y miscelanea).
- Clasificacion por token con etiquetado tipo BIO, apta para extraccion de entidades sobre secuencias de hasta 512 tokens.
- Generacion de embeddings contextuales de tokens reutilizables para otras tareas de secuencia (al derivar de un modelo de embeddings).
- Inferencia rapida y ligera gracias a su tamano reducido (33 M de parametros).
- Tool calling / function calling: no soportado (modelo encoder-only, sin generacion de texto ni interfaz conversacional).
- Soporte de agentes y razonamiento multi-paso: no soportado (no es un modelo generativo).
- Capacidades multilingues: no disponibles; el modelo base y el esquema de entrenamiento apuntan al ingles.
- Capacidades especiales (vision, audio, thinking mode): no soportadas.

## Casos de uso

- Extraccion de entidades en documentos en ingles: el modelo identifica personas, organizaciones y lugares en articulos, informes o correos, sirviendo como primer paso de un pipeline de extraccion de informacion.
- Anonimizacion y seudonimizacion de datos personales: dado que detecta entidades de tipo persona y localizacion, puede alimentar procesos de enmascaramiento previos a la comparticion de datos sensibles.
- Enriquecimiento de indices de busqueda y sistemas de recuperacion: las entidades extraidas permiten construir indices por entidad y mejorar la busqueda facetada sobre corpus textuales.
- Construccion de grafos de conocimiento: los pares entidad-tipo generados por el modelo pueden cargarse en una base de grafos para relacionar personas, organizaciones y lugares.
- Analisis de noticias y monitorizacion de medios: extraccion sistematica de companias y personas citadas en flujos de noticias para seguimiento de menciones y tendencias.
- Preetiquetado en anotacion humana (active learning): el modelo genera etiquetas iniciales de alta cobertura (recall 0,9012) que los anotadores corrigen, reduciendo el coste de crear nuevos conjuntos de datos.
- Normalizacion de entidades en CRM y sistemas empresariales: deteccion de nombres de organizaciones y localizaciones para deduplicar y limpiar registros en ingles.
- Procesamiento por lotes en CPU o GPUs de gama baja: su tamano minimo permite ejecutar grandes volumenes de texto sin infraestructura dedicada.

## Benchmarks y rendimiento

El model-index oficial del autor esta vacio (`results: []`), por lo que no se declaran benchmarks externos como MMLU, HumanEval o GSM8K. Los unicos resultados disponibles son las metricas de evaluacion y la evolucion por epoch reportadas en la model card:

| Metrica (conjunto de evaluacion) | Valor |
|---|---|
| Loss | 0,0991 |
| Precision | 0,8633 |
| Recall | 0,9012 |
| F1 | 0,8818 |
| Accuracy | 0,9772 |

| Training loss | Epoch | Step | Validation loss | Precision | Recall | F1 | Accuracy |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 0,1601 | 1,0 | 1250 | 0,1415 | 0,8074 | 0,8743 | 0,8395 | 0,9690 |
| 0,1004 | 2,0 | 2500 | 0,1064 | 0,8639 | 0,8977 | 0,8805 | 0,9768 |
| 0,0789 | 3,0 | 3750 | 0,0991 | 0,8633 | 0,9012 | 0,8818 | 0,9772 |

No se han publicado en la informacion disponible resultados comparativos con modelos similares ni desglose por tipo de entidad.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (FP32) dado el tamano de 33 M de parametros; en torno a 100-250 MB en FP16 o INT8.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere una A100 ni una H100. Funciona correctamente en GTX 1650, RTX 3060, RTX 4090 o incluso en CPU.
- Compatibilidad con GPU de consumo: si, cabe sobradamente en cualquier GPU de consumo, incluidas las integradas, y en la mayoria de entornos solo-CPU.
- Opciones de despliegue: transformers (pipeline de token-classification), ONNX Runtime, TorchScript, y exportacion a llama.cpp/GGUF si se convierte el encoder. Tambien desplegable mediante servidores de inferencia compatibles con transformers.
- Latencia y throughput estimados: no disponibles de forma oficial. Por el tamano del modelo se espera latencia de milisegundos por secuencia corta en GPU y de decenas de milisegundos en CPU, pero no hay cifras publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| andkil/bge-small-conll2003-ner | 33 M | 512 tokens (heredado del base) | NER (token-classification) | MIT | HuggingFace |
| NickolayS1/bge-small-ner-conll2003 | No disponible | No disponible | NER sobre el mismo corpus | No disponible | HuggingFace |
| RahatLukuum/bge-small-ner-conll2003 | No disponible | No disponible | NER sobre el mismo corpus | No disponible | HuggingFace |
| BAAI/bge-small-en-v1.5 (modelo base) | 33 M | 512 tokens | Embeddings de texto | MIT | HuggingFace |

Los tres modelos `bge-small-*-conll2003` comparten el mismo punto de partida y la misma tarea, por lo que son comparables directamente; sin embargo, no se dispone de metricas publicadas de los otros dos en la informacion recogida, lo que impide una comparacion numerica de rendimiento. No se han identificado alternativas de mayor tamano (por ejemplo, variantes BERT-base o RoBERTa-base afinadas sobre CoNLL-2003) con datos verificables en esta busqueda.

## Limitaciones y advertencias

- Modelo encoder-only: no genera texto, no mantiene conversaciones y no admite tool calling ni razonamiento multi-paso; solo produce etiquetas por token.
- Longitud de contexto limitada a 512 tokens: los documentos largos deben trocearse, con el riesgo de perder entidades partidas entre fragmentos.
- Idioma: la documentacion no declara idiomas; el modelo base y la tarea apuntan al ingles, por lo que el rendimiento fuera del ingles no esta garantizado.
- Dataset de entrenamiento no especificado: la model card indica "unknown dataset", de modo que la composicion, el dominio y la cobertura de entidades no estan documentados.
- Riesgo de alucinacion de entidades: como todo modelo discriminativo, puede etiquetar como entidad terminos que no lo son (falsos positivos), con una precision de 0,8633 que implica una tasa relevante de errores.
- Sin informacion sobre sesgos: no se documentan analisis de sesgo por genero, origen o dominio, lo que exige validacion propia antes de usarlo en produccion.
- Modelo sin traccion: zero descargas y zero likes en el momento de la ficha, sin garantia de mantenimiento ni soporte por parte del autor.
- Licencia MIT: permite uso comercial y modificacion con atribucion; conviene conservar el aviso de copyright. No impone restricciones adicionales, pero la ausencia de garantias es total.
- Metricas de evaluacion sin desglose: no se publican resultados por tipo de entidad ni matriz de confusion, por lo que la calidad real en cada clase no puede auditarse con los datos disponibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/andkil/bge-small-conll2003-ner
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Modelo comparable 1: https://huggingface.co/NickolayS1/bge-small-ner-conll2003
- Modelo comparable 2: https://huggingface.co/RahatLukuum/bge-small-ner-conll2003
- Ficha de referencia en directorio externo: https://free2aitools.com/model/nickolays1/bge-small-ner-conll2003
- Contexto sobre la arquitectura BERT: https://en.wikipedia.org/wiki/BERT_(language_model)
- Calendario de lanzamientos de modelos de IA: https://www.scriptbyai.com/ai-model-release-calendar/
