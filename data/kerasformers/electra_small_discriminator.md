# kerasformers/electra_small_discriminator

## Resumen

`kerasformers/electra_small_discriminator` es una conversión al framework Keras 3 del modelo `google/electra-small-discriminator`, desarrollado originalmente por Google Research. ELECTRA (Efficiently Learning an Encoder that Classifies Token Replacements Accurately) es un encoder de texto bidireccional estilo BERT que se preentrena como discriminador: distingue si cada token de la secuencia es real o ha sido reemplazado por un token generado por un modelo generador más pequeño. Esta estrategia de preentrenamiento resulta más eficiente que el enmascaramiento clásico de BERT, logrando mejores representaciones con menos recursos.

La conversión realizada por el proyecto KerasFormers permite ejecutar el mismo checkpoint de forma nativa en TensorFlow, PyTorch o JAX sin modificar el código, simplemente cambiando la variable de entorno `KERAS_BACKEND`. El modelo tiene aproximadamente 14 millones de parámetros (tamaño "small" de ELECTRA) y está pensado para tareas de extracción de características, clasificación de secuencias, etiquetado de tokens y respuesta a preguntas extractiva. Su relevancia actual radica en que ofrece una implementación ligera y portable de un encoder probado, ideal para entornos con recursos limitados o para integrarse en pipelines multiplataforma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional (ELECTRA, encoder discriminador) |
| Parametros totales | 14 millones (tamaño small, segun documentacion de ELECTRA) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (segun documentacion de ELECTRA) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo original de Google esta entrenado principalmente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (el repositorio usa el formato propio de KerasFormers; se puede cargar safetensors de HuggingFace via prefijo `hf:`) |

## Arquitectura y entrenamiento

ELECTRA se compone de dos transformadores: un generador (G) que reemplaza tokens de la secuencia de entrada, y un discriminador (D) que predice si cada token es original o reemplazado. El checkpoint `electra_small_discriminator` corresponde al encoder discriminador, que es el que se utiliza para tareas posteriores. La arquitectura del discriminador small tiene 12 capas, un tamaño de ocultamiento de 256 y un embedding de 128, segun la configuracion original de Google. El preentrenamiento se realizo con el corpus de Wikipedia en ingles y el libro de texto (BookCorpus), usando la perdida de clasificacion binaria por token. Este repositorio no reentrena el modelo, sino que convierte los pesos originales de TensorFlow al formato Keras 3, manteniendo la misma arquitectura y los mismos pesos. No se aplicaron tecnicas como RLHF o DPO; el modelo es un encoder puro, no generativo.

## Capacidades

- Extraccion de caracteristicas: genera representaciones contextuales de tokens y de secuencia completa (`last_hidden_state`), utiles para embeddings o como backbone en modelos propios.
- Clasificacion de secuencias: mediante la clase `ElectraSequenceClassify`, permite fine-tuning para tareas como analisis de sentimiento, deteccion de spam o clasificacion de topicos.
- Clasificacion de tokens: con `ElectraTokenClassify`, soporta tareas de NER (reconocimiento de entidades) y POS (etiquetado gramatical).
- Respuesta a preguntas extractiva: la clase `ElectraQnA` permite localizar el fragmento de texto que responde a una pregunta en un contexto dado.
- Eleccion multiple: la clase `ElectraMultipleChoice` esta disenada para tareas donde se debe seleccionar una opcion correcta entre varias.
- Portabilidad entre backends: el mismo codigo y los mismos pesos funcionan en TensorFlow, PyTorch y JAX, lo que facilita la integracion en entornos heterogeneos.
- No soporta generacion de texto, tool calling, agentes ni capacidades multimodales; es exclusivamente un encoder de texto.

## Casos de uso

- Clasificacion de documentos legales: se puede afinar `ElectraSequenceClassify` sobre un corpus de contratos para categorizar clausulas o detectar riesgos. Su tamano reducido permite ejecutarlo en CPU en entornos de despacho sin GPU.
- Analisis de sentimiento en redes sociales: el modelo puede procesar tweets o comentarios y clasificarlos en positivos, negativos o neutros. Al ser un encoder eficiente, admite inferencia en lote con bajo consumo de memoria.
- Extraccion de entidades en textos medicos: con `ElectraTokenClassify` se pueden etiquetar sintomas, medicamentos o enfermedades en historiales clinicos. La ventana de 512 tokens es suficiente para parrafos completos.
- Motor de busqueda semantica: usando las representaciones de `ElectraModel` como embeddings de frases, se puede construir un indice de similitud coseno para recuperar documentos relevantes. Su bajo coste computacional permite indexar grandes volumenes.
- Sistema de preguntas y respuestas sobre documentacion interna: `ElectraQnA` puede extraer respuestas literales de manuales o FAQs, integrandose en un chatbot corporativo sin necesidad de un modelo generativo grande.
- Clasificacion de tickets de soporte: afinando el modelo sobre tickets historicos, se puede asignar automaticamente cada incidencia a un departamento o prioridad. La portabilidad entre backends facilita su despliegue en entornos mixtos (por ejemplo, entrenar en JAX y servir en TensorFlow).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo original de Google reporta mejoras sobre BERT en tareas como GLUE y SQuAD, pero esta conversion no incluye mediciones propias. Se recomienda consultar el paper original para datos comparativos.

## Requisitos de hardware

- Al tratarse de un modelo de 14 millones de parametros, la inferencia en FP32 requiere aproximadamente 56 MB de VRAM solo para los pesos, mas la memoria de activaciones. Cabe en cualquier GPU moderna, incluso en tarjetas de entrada como GTX 1650 o RTX 3050.
- En CPU, la inferencia es viable para tareas por lotes pequenos; un solo forward de una secuencia de 512 tokens puede completarse en decenas de milisegundos en un procesador moderno.
- No se requiere GPU para fine-tuning si se usan lotes pequenos y acumulacion de gradientes; una GPU con 4 GB de VRAM es suficiente para entrenar con un batch de 8-16 secuencias.
- Opciones de despliegue: al ser un modelo Keras 3, se puede servir con TensorFlow Serving, TorchServe o mediante una API propia. Tambien se puede exportar a ONNX para usar con runtime optimizado. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, que estan orientados a modelos generativos.
- La latencia estimada en GPU (por ejemplo, T4) para una secuencia de 512 tokens es del orden de 5-15 ms, dependiendo del backend y del tamano de lote. En CPU (8 nucleos) puede rondar los 50-150 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `kerasformers/electra_small_discriminator` | 14M | 512 | Transformer encoder (ELECTRA) | Apache 2.0 | HuggingFace, Keras 3 |
| `google/electra-small-discriminator` | 14M | 512 | Transformer encoder (ELECTRA) | Apache 2.0 | HuggingFace, TensorFlow/PyTorch |
| `bert-base-uncased` | 110M | 512 | Transformer encoder (BERT) | Apache 2.0 | HuggingFace, multiples frameworks |
| `distilbert-base-uncased` | 66M | 512 | Transformer encoder (distilado de BERT) | Apache 2.0 | HuggingFace, multiples frameworks |

La ventaja de la version KerasFormers frente al checkpoint original es la portabilidad entre backends sin conversion manual. Frente a BERT base, ELECTRA small ofrece un rendimiento comparable en muchas tareas con una fraccion de los parametros, lo que reduce costes de inferencia y entrenamiento. DistilBERT es otra alternativa ligera, pero con el doble de parametros que ELECTRA small.

## Limitaciones y advertencias

- El modelo es un encoder, no genera texto. No es adecuado para tareas de generacion libre, resumen abstractivo o dialogo abierto.
- No se especifican los idiomas soportados en la ficha; el checkpoint original de Google fue entrenado principalmente con texto en ingles, por lo que su rendimiento en otros idiomas puede ser limitado.
- Al ser una conversion de pesos, no se ha realizado un reentrenamiento ni una evaluacion exhaustiva sobre los datos de la conversion; los resultados pueden variar ligeramente respecto al modelo original debido a diferencias numericas entre frameworks.
- El modelo puede heredar sesgos presentes en los datos de preentrenamiento (Wikipedia y BookCorpus), como sesgos de genero, raza o ideologia. No se han aplicado tecnicas de mitigacion especificas.
- La ventana de contexto de 512 tokens limita el procesamiento de documentos largos; para textos superiores se requiere truncamiento o estrategias de ventana deslizante.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se debe mantener el aviso de copyright y la atribucion correspondiente.
- No se proporcionan cuantizaciones oficiales; si se desea reducir el tamano, habria que aplicar cuantizacion post-entrenamiento manualmente, lo que puede afectar a la precision.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kerasformers/electra_small_discriminator
- Modelo original de Google: https://huggingface.co/google/electra-small-discriminator
- Paper ELECTRA: https://arxiv.org/abs/2003.10555
- Repositorio oficial de Google Research: https://github.com/google-research/electra
- Documentacion de KerasFormers: https://imvision12.github.io/KerasFormers/electra/
- Guia de carga de pesos: https://imvision12.github.io/KerasFormers/loading_weights/
- Coleccion de modelos ELECTRA en KerasFormers: https://huggingface.co/collections/kerasformers/electra-6a8540d1f5831e07dc89d8d1
