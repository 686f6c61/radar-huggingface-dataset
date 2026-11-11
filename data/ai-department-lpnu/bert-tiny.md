# ai-department-lpnu/bert-tiny

## Resumen

`bert-tiny` es una redistribución en formato `safetensors` del modelo `google/bert_uncased_L-4_H-256_A-4`, también conocido como BERT-Mini, publicado por el usuario `ai-department-lpnu` en Hugging Face. No se trata de un modelo nuevo ni de un fine-tuning: los pesos son idénticos a los del checkpoint original de Google y el autor lo indica explícitamente en la model card. La única modificación es el empaquetado en `model.safetensors` en precisión float32, incluyendo la cabeza de masked language modeling (MLM).

El modelo original es un transformer encoder de tipo BERT compacto, con 4 capas, tamaño oculto de 256 y 4 cabezas de atención, sumando 11.201.594 parámetros según el recuento real del fichero de pesos. Fue descrito por Turc et al. en el artículo *Well-Read Students Learn Better: On the Importance of Pre-training Compact Models* (2019), que demostró que los modelos compactos preentrenados con destilación desde BERT-Base pueden igualar o superar a arquitecturas más grandes en tareas de comprensión del lenguaje.

Su relevancia no es de rendimiento sino educativa y de infraestructura: por su tamaño mínimo se puede ejecutar en CPU, cabe en cualquier GPU consumer y sirve como banco de pruebas para implementaciones didácticas de inferencia BERT. El autor lo usa en el curso de Arquitectura de Transformers de la Universidad Politécnica de Lviv, donde los estudiantes implementan la inferencia desde cero en Python puro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT), 4 capas, hidden size 256, 4 cabezas de atencion |
| Parametros totales | 11.201.594 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (valor estandar de BERT; no se especifica en la model card) |
| Tipos de cuantizacion | No disponible (el repo solo distribuye float32) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32); la capa de decodificacion MLM esta atada a `bert.embeddings.word_embeddings.weight` |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de tipo BERT en su variante "tiny" (BERT-Mini): 4 capas de atención multi-cabeza con 4 cabezas cada una, dimensión oculta de 256 y vocabulario WordPiece sin distinción de mayúsculas (uncased). El modelo se usa con cabeza de masked language modeling, con la matriz de decodificación atada a los embeddings de entrada, de modo que no se almacena como tensor independiente.

No se proporciona información sobre el proceso de entrenamiento en esta ficha: ni número de tokens, ni composición del corpus, ni si hubo destilación, RLHF o DPO. Lo que sí consta es la referencia al artículo de Turc et al. (2019), que describe el preentrenamiento de modelos compactos mediante *knowledge distillation* desde BERT-Base sobre el mismo corpus (Wikipedia en inglés y BooksCorpus). Los pesos de esta redistribución son los del checkpoint original de Google, sin cambios.

## Capacidades

- Relleno de máscaras (masked language modeling): predice el token oculto en una secuencia con `[MASK]`.
- Extracción de representaciones contextuales en inglés: embeddings por token y por secuencia utilizables en tareas downstream (clasificación, NER, similitud).
- Fine-tuning para tareas de comprensión del lenguaje en inglés: clasificación de texto, análisis de sentimiento, QA extractiva, etiquetado de secuencias.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene modo de pensamiento (*thinking*), visión ni audio.
- Capacidad multilingüe limitada al inglés; el vocabulario es uncased y no cubre otras lenguas de forma fiable.

## Casos de uso

- Docencia de arquitecturas transformer: implementar la inferencia BERT desde cero en Python puro usando estos pesos como referencia verificable, tal como se hace en el curso de la Universidad Politécnica de Lviv.
- Pruebas unitarias de pipelines de NLP: validar tokenizadores, capas de atención o rutinas de carga de `safetensors` con un modelo que se carga en milisegundos y no requiere GPU.
- Prototipado rápido de clasificadores de texto en inglés: fine-tuning sobre datasets pequeños para obtener una línea base antes de escalar a modelos mayores.
- Extracción de embeddings para búsqueda semántica en entornos con recursos mínimos: útil cuando el corpus es pequeño y el coste de un modelo grande no está justificado.
- Relleno de máscaras en herramientas educativas o demos interactivas de NLP, aprovechando la cabeza MLM incluida.
- Servicio de inferencia en CPU dentro de contenedores ligeros o funciones serverless, donde el límite de memoria es restrictivo.
- Benchmark de referencia para comparar implementaciones propias de BERT contra una implementación estándar de Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: en torno a 45 MB para los pesos (11,2 M de parámetros × 4 bytes), más el overhead de activaciones, que es despreciable.
- Cabe holgadamente en cualquier GPU consumer, incluida una GTX 1050 o una iGPU con memoria compartida.
- Funciona en CPU sin problemas de latencia para lotes pequeños; es adecuado para entornos sin acelerador.
- Opciones de despliegue: `transformers` (PyTorch), `safetensors` con carga directa, ONNX Runtime tras exportación, y `optimum` para conversión. No se distribuye en GGUF ni en formato compatible con llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera un throughput muy alto en CPU y prácticamente limitado por el tokenizador en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ai-department-lpnu/bert-tiny (este) | 11,2 M | 512 (estandar BERT) | en | Apache 2.0 | safetensors |
| google/bert_uncased_L-4_H-256_A-4 | 11,2 M | 512 | en | Apache 2.0 | PyTorch bin / TF |
| google/bert_uncased_L-2_H-128_A-2 (BERT-Tiny) | ~4,4 M | 512 | en | Apache 2.0 | PyTorch bin / TF |
| distilbert-base-uncased | 66 M | 512 | en | Apache 2.0 | PyTorch bin / TF / safetensors |

La comparativa se limita a parámetros, contexto, idioma y licencia porque no hay datos de benchmarks publicados para este checkpoint en la información disponible. Frente a `distilbert-base-uncased`, este modelo es aproximadamente seis veces más pequeño, lo que reduce coste pero también capacidad de representación.

## Limitaciones y advertencias

- Es una redistribución, no un modelo nuevo: cualquier limitación del checkpoint original de Google se hereda sin cambios.
- Solo inglés; el vocabulario uncased no cubre adecuadamente otras lenguas.
- Ventana de contexto de 512 tokens, insuficiente para documentos largos.
- Riesgo de alucinación en la cabeza MLM: las predicciones de tokens enmascarados pueden ser plausibles pero incorrectas, especialmente fuera de dominio.
- Sesgos heredados del corpus de preentrenamiento (Wikipedia y BooksCorpus en inglés), con los sesgos demográficos y culturales asociados.
- No apto para generación de texto libre ni para tareas generativas; su uso previsto es comprensión y relleno de máscaras.
- Licencia Apache 2.0 permite uso comercial, pero conviene conservar la atribución al modelo base de Google y al artículo de Turc et al.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta; no hay garantía de mantenimiento ni de soporte por parte del autor.
- El tamaño del repo indicado es 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente subidos o que el cálculo es impreciso; conviene verificar la integridad de los ficheros antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai-department-lpnu/bert-tiny
- Modelo base: https://huggingface.co/google/bert_uncased_L-4_H-256_A-4
- Artículo de referencia (Turc et al., 2019): https://arxiv.org/abs/1908.08962
- Repositorio de BERT (Google Research): https://github.com/google-research/bert
