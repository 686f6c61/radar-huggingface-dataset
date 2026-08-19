# kerasformers/bert_base_cased

## Resumen

`kerasformers/bert_base_cased` es una conversión íntegra del modelo `google-bert/bert-base-cased` al ecosistema Keras 3, desarrollada por el proyecto KerasFormers. Se trata de un codificador de texto basado en el transformer bidireccional original de Google, publicado en el artículo "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding" (arXiv:1810.04805). La conversión mantiene los pesos originales y permite ejecutar el mismo checkpoint sin modificaciones en tres backends: TensorFlow, PyTorch y JAX, mediante la variable de entorno `KERAS_BACKEND`.

El modelo está pensado para tareas de enmascarado de tokens (fill-mask) y como base para fine-tuning en clasificación de secuencias, clasificación de tokens, respuesta a preguntas extractiva, predicción de siguiente oración y opción múltiple. Su relevancia actual radica en ofrecer una implementación puramente Keras 3 de BERT, con paridad bit a bit respecto a los checkpoints de Hugging Face, lo que facilita la portabilidad entre frameworks sin necesidad de conversiones intermedias. El checkpoint base tiene 110 millones de parámetros y una ventana de contexto de 512 tokens, características heredadas del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional (encoder-only), 12 capas, 768 dimensiones ocultas, 12 cabezas de atencion |
| Parametros totales | 110 millones (modelo original bert-base-cased) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (modelo original; no se especifican otros idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (repositorio Keras; probablemente .h5 o .keras) |

## Arquitectura y entrenamiento

El modelo replica exactamente la arquitectura de BERT base cased: un transformer bidireccional con 12 capas, 768 unidades ocultas, 12 cabezas de atencion y una salida de 110 millones de parametros. El tokenizador es WordPiece con distincion entre mayusculas y minusculas (cased), y el token de mascara es `[MASK]`. El entrenamiento original de Google utilizo dos objetivos: masked language modeling (MLM) y next-sentence prediction (NSP), sobre un corpus compuesto por BookCorpus y Wikipedia en ingles. La conversion de KerasFormers no modifica los pesos ni la arquitectura; solo reimplementa el modelo en Keras 3, de modo que el mismo codigo fuente puede ejecutarse en TensorFlow, PyTorch o JAX. No se ha realizado ningun entrenamiento adicional ni fine-tuning especifico en esta version.

## Capacidades

- Generacion de texto enmascarado (fill-mask): predice el token oculto tras `[MASK]`, util para completar frases o evaluar conocimiento lexico.
- Codificacion de secuencias: produce representaciones contextuales de tokens y de la secuencia completa, aptas para extraer embeddings.
- Clasificacion de secuencias: mediante la clase `BertSequenceClassify`, permite fine-tuning para analisis de sentimiento, clasificacion de topicos o deteccion de spam.
- Clasificacion de tokens: con `BertTokenClassify`, soporta tareas de reconocimiento de entidades nombradas (NER) y etiquetado gramatical (POS).
- Respuesta a preguntas extractiva: la clase `BertQnA` permite localizar la respuesta a una pregunta dentro de un pasaje de texto.
- Prediccion de siguiente oracion: la clase `BertNextSentencePredict` implementa la tarea NSP original.
- Opcion multiple: la clase `BertMultipleChoice` habilita tareas de seleccion entre varias opciones.
- Portabilidad entre frameworks: el mismo checkpoint se carga en TensorFlow, PyTorch o JAX sin cambios en el codigo, gracias a Keras 3.

## Casos de uso

- Completado de texto enmascarado en aplicaciones de autocompletado: el modelo puede rellenar huecos en frases, por ejemplo en editores de texto o sistemas de sugerencia de escritura, usando la prediccion de `[MASK]`.
- Analisis de sentimiento en redes sociales: tras un fine-tuning con `BertSequenceClassify`, se puede clasificar opiniones de usuarios en positivas, negativas o neutras, aprovechando la representacion contextual de BERT.
- Extraccion de entidades en documentos legales: con `BertTokenClassify`, el modelo puede identificar nombres de personas, organizaciones o fechas en contratos o expedientes, reduciendo el trabajo manual de revision.
- Sistema de preguntas y respuestas sobre documentacion interna: usando `BertQnA`, se puede construir un buscador que extraiga respuestas literales de manuales o bases de conocimiento corporativas.
- Clasificacion de tickets de soporte: fine-tuning de `BertSequenceClassify` para categorizar incidencias de usuarios en areas como facturacion, tecnico o comercial, mejorando la derivacion automatica.
- Deteccion de spam en correos electronicos: el modelo puede distinguir mensajes no deseados mediante clasificacion binaria, con la ventaja de ser sensible a mayusculas, lo que ayuda a captar patrones como "FREE" o "URGENT".
- Evaluacion de similitud semantica entre frases: los embeddings de `BertModel` pueden compararse mediante coseno para medir la relacion entre consultas de busqueda y documentos, util en motores de recomendacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es una conversion directa de `google-bert/bert-base-cased`, por lo que su rendimiento en tareas como GLUE o SQuAD deberia ser equivalente al del checkpoint original, pero no se aportan cifras concretas en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 440 MB en precision FP32 (110M parametros x 4 bytes) y unos 220 MB en FP16. Con cuantizacion a 8 bits, podria reducirse a unos 110 MB, aunque no se ofrecen cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en FP32. Modelos como NVIDIA GTX 1060, RTX 2060 o superiores funcionan sin problemas. Para fine-tuning, se recomienda al menos 6 GB de VRAM (por ejemplo, RTX 3060 o superior).
- Compatibilidad con GPU de consumo: si, el modelo cabe en practicamente cualquier GPU moderna de consumo, incluidas las integradas de gama alta, gracias a su tamano reducido.
- Opciones de despliegue: al ser un modelo Keras 3, puede servirse con TensorFlow Serving, TorchServe o JAX, ademas de integrarse en pipelines de Hugging Face mediante el prefijo `hf:`. No se menciona soporte explicito para vLLM, llama.cpp u Ollama, ya que es un modelo encoder, no generativo.
- Latencia y throughput: no se proporcionan datos medidos. En una GPU moderna, la inferencia de una secuencia de 512 tokens suele completarse en decenas de milisegundos, pero depende del backend y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| kerasformers/bert_base_cased | 110M | 512 | Apache 2.0 | Keras 3 | Conversion de bert-base-cased, multi-backend |
| google-bert/bert-base-cased | 110M | 512 | Apache 2.0 | PyTorch/TF/JAX | Modelo original, ampliamente usado |
| google-bert/bert-base-uncased | 110M | 512 | Apache 2.0 | PyTorch/TF/JAX | Variante sin distincion de mayusculas |
| google-bert/bert-large-cased | 340M | 512 | Apache 2.0 | PyTorch/TF/JAX | Version grande, mayor capacidad pero mas pesada |

La diferencia principal frente al modelo original es el formato de pesos y la portabilidad entre backends. Frente a la variante uncased, la version cased conserva la informacion de mayusculas, lo que puede mejorar tareas sensibles al caso, como NER en textos con nombres propios. La version large ofrece mas capacidad pero requiere mas recursos.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado en 2018 con corpus de internet y libros, puede reflejar sesgos de genero, raza o ideologia presentes en esos datos. No se ha realizado ninguna mitigacion adicional en esta conversion.
- Riesgo de alucinacion: aunque BERT no genera texto libre, en tareas de fill-mask puede producir tokens improbables o incorrectos si el contexto es ambiguo o fuera de su dominio de entrenamiento.
- Limitaciones de contexto: la ventana de 512 tokens es fija; secuencias mas largas deben truncarse o dividirse, lo que puede perder informacion relevante.
- Limitaciones de idioma: el modelo esta entrenado principalmente en ingles. Su rendimiento en otros idiomas es limitado y no se recomienda su uso directo sin fine-tuning en corpus multilingue.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y la atribucion correspondiente.
- Carga de pesos: las cabezas de tarea (clasificacion, QA, etc.) no estan incluidas en el checkpoint; se inicializan aleatoriamente y requieren fine-tuning antes de su uso en produccion.
- Dependencia de Keras 3: es necesario configurar `KERAS_BACKEND` antes de importar la libreria, y el modelo no es compatible con versiones anteriores de Keras.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kerasformers/bert_base_cased
- Repositorio de KerasFormers: https://github.com/IMvision12/KerasFormers
- Documentacion de BERT en KerasFormers: https://imvision12.github.io/KerasFormers/bert/
- Coleccion de modelos BERT de KerasFormers: https://huggingface.co/collections/kerasformers/bert-6a6e8ea40d45e759626f2ab3
- Paper original de BERT: https://arxiv.org/abs/1810.04805
- Modelo base original: https://huggingface.co/google-bert/bert-base-cased
