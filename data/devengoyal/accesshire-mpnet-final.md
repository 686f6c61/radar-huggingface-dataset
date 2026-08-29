# Devengoyal/accesshire-mpnet-final

## Resumen

El modelo `Devengoyal/accesshire-mpnet-final` es un Sentence Transformer basado en la arquitectura MPNet, desarrollado por Devengoyal. Está diseñado para mapear frases y párrafos a un espacio vectorial denso de 768 dimensiones, con el objetivo de resolver tareas de similitud semántica, búsqueda semántica y clasificación. El caso de uso principal que se desprende de los ejemplos de la model card es la comparación de descripciones de experiencia laboral con etiquetas de habilidades, lo que sugiere una aplicación orientada a la selección de personal o la gestión de currículos.

El modelo se ha ajustado (fine-tuning) sobre un conjunto de datos muy reducido, con solo 1.842 muestras de entrenamiento, utilizando la función de pérdida `CosineSimilarityLoss`. La arquitectura completa incluye un transformer MPNet con pooling medio y normalización, alcanzando un total de 109.486.464 parámetros. La longitud máxima de secuencia es de 384 tokens, un valor estándar para modelos de embeddings de esta familia.

La relevancia de este modelo reside en su especialización aparente para un dominio concreto (emparejamiento de habilidades y experiencia), aunque su reducido conjunto de datos de entrenamiento y la ausencia de benchmarks publicados limitan la evaluación objetiva de su rendimiento. Es un modelo de nicho, no un modelo fundacional de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MPNet (MPNetModel) con pooling medio y normalizacion |
| Parametros totales | 109.486.464 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 384 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (presumiblemente ingles, segun los ejemplos de la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se compone de un transformer MPNet (modelo base `mpnet-base`), seguido de una capa de pooling que calcula la media de los embeddings de los tokens (`pooling_mode: mean`) y una capa de normalizacion. El resultado es un vector denso de 768 dimensiones. La funcion de similitud utilizada es la similitud coseno.

El entrenamiento se realizo mediante fine-tuning con un conjunto de datos propio de 1.842 muestras, cada una con un par de frases (`sentence_0` y `sentence_1`) y una etiqueta de similitud (float entre 0.0 y 1.0). La funcion de perdida empleada fue `CosineSimilarityLoss`, que optimiza la similitud coseno entre los embeddings de los pares. No se dispone de informacion sobre el dataset de preentrenamiento del modelo base ni sobre el uso de tecnicas como RLHF o DPO. El entrenamiento se realizo con la libreria `sentence-transformers` y el framework de Hugging Face.

## Capacidades

- Generacion de embeddings de frases y parrafos para similitud semantica.
- Busqueda semantica: dado un texto de consulta, encontrar los textos mas similares en un corpus.
- Extraccion de caracteristicas (feature extraction) para pipelines de clasificacion o clustering.
- Comparacion de descripciones de experiencia laboral con etiquetas de habilidades (segun los ejemplos de la model card).
- Soporte de mineria de parafrasis (paraphrase mining).
- No soporta tool calling, agentes, vision, audio ni modos de razonamiento especiales.
- Capacidades multilingues no documentadas; los ejemplos estan en ingles.

## Casos de uso

- Seleccion de personal: el modelo puede comparar la descripcion de la experiencia de un candidato con una lista de habilidades requeridas para un puesto, generando una puntuacion de similitud que ayude a preseleccionar currículos.
- Gestion de talento interno: permite emparejar empleados con proyectos o formaciones segun las competencias descritas en sus evaluaciones de desempeno.
- Clasificacion de ofertas de empleo: se pueden agrupar ofertas similares por contenido semantico, facilitando la deduplicacion o la recomendacion a candidatos.
- Busqueda semantica en bases de datos de conocimiento: indexar documentos internos de RRHH (politicas, procedimientos) y permitir consultas en lenguaje natural.
- Mineria de parafrasis en textos de evaluaciones: detectar descripciones equivalentes de competencias en distintos documentos.
- Sistema de recomendacion de formacion: comparar las descripciones de puestos con los contenidos de cursos o programas formativos para sugerir formaciones relevantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de evaluacion como MMLU, HumanEval, GSM8K u otros, ni comparaciones con modelos similares. El unico dato de rendimiento disponible es el ejemplo de la model card, donde se muestra una similitud de 0.9635 entre una frase de experiencia y la etiqueta "event management", y una similitud negativa (-0.1724) con "sales", lo que sugiere un comportamiento razonable en ese caso concreto, pero no constituye una evaluacion rigurosa.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 109M parametros, la inferencia es ligera. En precision FP32, el modelo ocupa aproximadamente 438 MB en memoria. Con cuantizacion a FP16 o INT8, el uso de VRAM se reduce a unos 219 MB o 110 MB respectivamente, aunque no se han publicado pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Modelos como NVIDIA T4, GTX 1660, RTX 2060 o superiores son mas que adecuadas. Tambien puede ejecutarse en CPU sin problemas para cargas de trabajo moderadas.
- Si cabe en consumer GPU: si, cabe en cualquier GPU de consumo actual, incluso en las mas modestas.
- Opciones de despliegue: al ser un modelo de `sentence-transformers`, se puede servir con la libreria directamente, con el contenedor de Hugging Face `text-embeddings-inference` (el tag del modelo indica `endpoints_compatible`), o mediante frameworks como ONNX Runtime si se exporta el modelo.
- Latencia y throughput: no se dispone de datos publicados. Para un modelo de este tamano, la latencia tipica en GPU es del orden de milisegundos por lote de frases, y en CPU de decenas de milisegundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension embedding | Licencia | Notas |
|---|---|---|---|---|---|
| Devengoyal/accesshire-mpnet-final | 109M | 384 | 768 | no disponible | Fine-tuning especifico para emparejamiento de habilidades |
| sentence-transformers/all-MiniLM-L6-v2 | 22.7M | 256 | 384 | Apache 2.0 | Modelo ligero y generico, muy popular |
| BAAI/bge-base-en-v1.5 | 109M | 512 | 768 | MIT | Modelo generico de alta calidad para busqueda semantica en ingles |

La comparativa se limita a modelos de la misma familia (embeddings densos). El modelo de Devengoyal no tiene benchmarks publicados, por lo que no es posible comparar su rendimiento real con las alternativas. Su unica ventaja potencial es la especializacion en el dominio de habilidades laborales, pero el reducido dataset de entrenamiento (1.842 muestras) hace poco probable que supere a modelos genericos bien entrenados como `bge-base-en-v1.5` en tareas generales.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado, pero al estar entrenado sobre un dataset muy pequeno y especifico, es probable que herede sesgos del proceso de anotacion y del dominio concreto (descripciones de experiencia en ingles).
- Riesgo de alucinacion: no aplica directamente, al ser un modelo de embeddings y no generativo. Sin embargo, la calidad de las similitudes depende completamente de la calidad del entrenamiento.
- Limitaciones de contexto: la ventana de 384 tokens es corta. Descripciones de experiencia largas deberan truncarse, lo que puede perder informacion relevante.
- Limitaciones de idioma: no se ha especificado el idioma de entrenamiento, pero los ejemplos estan en ingles. Su uso en otros idiomas probablemente degrade el rendimiento.
- Restricciones de licencia: la licencia no esta disponible, lo que impide conocer las condiciones de uso comercial o redistribucion. Se recomienda contactar con el autor antes de usarlo en produccion.
- Caveat para produccion: el dataset de entrenamiento es extremadamente pequeno (1.842 muestras), lo que aumenta el riesgo de sobreajuste y limita la generalizacion a datos no vistos. No se recomienda su uso en produccion sin una evaluacion exhaustiva en el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Devengoyal/accesshire-mpnet-final
- Documentacion de Sentence Transformers: https://sbert.net
- Repositorio de Sentence Transformers en GitHub: https://github.com/huggingface/sentence-transformers
- Documentacion de MPNet en Hugging Face: https://huggingface.co/transformers/v4.8.2/model_doc/mpnet.html
- Paper de MPNet (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
