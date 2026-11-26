# PYTHAI/bert-base-uncased-fork

## Resumen

`PYTHAI/bert-base-uncased-fork` es un fork del modelo `google-bert/bert-base-uncased`, fijado al commit `86b5e0934494bd15c9632b12f734a8a67f723594`. Lo mantiene la organizacion PYTHAI (mindX) como modelo de referencia; la seleccion se baso en un articulo de KDnuggets sobre los modelos mas descargados de Hugging Face. Los pesos estan copiados integramente, por lo que el fork es autonomo y funcional sin depender del repositorio original.

Tecnicamente es BERT base uncased: un transformer encoder de 110.106.428 parametros (confirmado en safetensors) preentrenado con objetivos de masked language modeling (MLM) y next sentence prediction (NSP) sobre BookCorpus y Wikipedia en ingles. No es un modelo generativo: su proposito es producir representaciones contextuales bidireccionales para tareas downstream.

Su relevancia actual es como referencia historica y como base solida para fine-tuning en clasificacion de secuencias, NER, question answering extractivo y similitud semantica. La licencia Apache 2.0 y su reducido tamano lo mantienen como una opcion practica para entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (BERT base) |
| Parametros totales | 110.106.428 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (estandar de BERT; no se especifica otro valor en la informacion disponible) |
| Tipos de cuantizacion | no disponible (el repositorio incluye safetensors; no se listan variantes GGUF/ONNX cuantizadas) |
| Idiomas soportados | ingles (uncased, sin distincion de mayusculas y con eliminacion de acentos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tambien tags de pytorch, tf, jax, rust, coreml, onnx) |

## Arquitectura y entrenamiento

BERT base es un transformer encoder de 12 capas, 768 dimensiones ocultas y 12 cabezas de atencion, con aproximadamente 110M de parametros. A diferencia de los modelos autoregresivos, la atencion es completamente bidireccional: cada token atiende a todos los demas en la secuencia. El preentrenamiento combina dos objetivos: MLM, enmascarando el 15% de los tokens y prediciendolos a partir del contexto bilateral, y NSP, clasificando si dos segmentos consecutivos eran adyacentes en el corpus original.

Los datos de entrenamiento son BookCorpus (800M palabras) y Wikipedia en ingles (2.500M palabras). No se aplico RLHF ni DPO; el modelo se entrena de forma auto-supervisada y se especializa mediante fine-tuning supervisado en cada tarea downstream. El fork no introduce cambios arquitectonicos ni de pesos respecto al original: es una copia byte a byte fijada a un commit concreto, lo que garantiza reproducibilidad.

## Capacidades

- Generacion de representaciones contextuales de frases y documentos en ingles.
- Masked language modeling (relleno de tokens enmascarados con `[MASK]`).
- Clasificacion de secuencias (sentimiento, topicos, deteccion de spam, etc.) tras fine-tuning.
- Etiquetado de tokens (NER, POS tagging, chunking) tras fine-tuning.
- Question answering extractivo (SQuAD-style) tras fine-tuning.
- Similitud semantica y recuperacion de embeddings para busqueda y clustering.
- Next sentence prediction como tarea auxiliar.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso de forma nativa.
- No soporta vision, audio ni thinking mode.

## Casos de uso

- Clasificacion de tickets de soporte: fine-tuning de una cabeza de clasificacion sobre las representaciones del `[CLS]` para enrutar incidencias por categoria con un coste computacional minimo (110M de parametros, inferencia en CPU viable).
- Extraccion de entidades en documentos legales o financieros: fine-tuning para NER sobre textos en ingles, aprovechando la representacion bidireccional para resolver ambiguedades locales.
- Busqueda semantica en catalogo de productos: usar los embeddings de frases como vector de recuperacion en un indice tipo FAISS, con latencia de milisegundos en GPU consumer.
- Question answering extractivo sobre FAQs: fine-tuning estilo SQuAD para localizar el span de respuesta en documentos de hasta 512 tokens.
- Moderacion de contenido: clasificador binario o multietiqueta entrenado sobre las representaciones para detectar toxicidad o spam en ingles.
- Filtrado y deduplicacion de datasets: calculo de similitud coseno entre embeddings para eliminar registros casi duplicados en pipelines de curación de datos.
- Baseline academico y docencia: modelo de referencia para experimentos de NLP clasico, con pesos reproducibles fijados a un commit concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de metricas (GLUE, SQuAD, MMLU u otras) ni comparativas numericas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 440 MB solo de pesos (110M x 4 bytes), mas activaciones; en la practica cabe en cualquier GPU con 2 GB o mas.
- VRAM estimada en fp16: aproximadamente 220 MB de pesos; en int8, unos 110 MB.
- GPU recomendadas: cualquier GPU moderna sirve; para alto throughput, A100, H100 o L4. Para desarrollo, RTX 4090, RTX 3090 o incluso GPUs de gama media (RTX 3060).
- Cabe en GPU consumer y en CPU: la inferencia en CPU es viable para lotes pequenos; el modelo corre sin problema en portatiles.
- Opciones de despliegue: Hugging Face Transformers (PyTorch, TensorFlow, JAX), ONNX Runtime, TorchScript, Core ML y Rust (segun los tags del repositorio). No se documentan recetas especificas para vLLM, llama.cpp u Ollama, que estan orientados a modelos generativos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| PYTHAI/bert-base-uncased-fork | 110M | 512 | Ingles | Apache 2.0 | Fork fijado a commit; pesos identicos al original |
| google-bert/bert-base-uncased | 110M | 512 | Ingles | Apache 2.0 | Modelo original de referencia |
| bert-base-cased | 110M | 512 | Ingles | Apache 2.0 | Distingue mayusculas; util cuando la capitalizacion aporta senal |
| bert-large-uncased | 340M | 512 | Ingles | Apache 2.0 | Mayor capacidad, mayor coste; mejor en tareas complejas |
| RoBERTa-base | 125M | 512 | Ingles | MIT | Entrenamiento mas largo sin NSP; suele superar a BERT en GLUE |

## Limitaciones y advertencias

- Solo ingles: no soporta castellano ni otros idiomas de forma nativa; requiere un modelo multilingue para esos casos.
- Modelo uncased: elimina mayusculas y acentos, lo que puede perder informacion en tareas sensibles a la capitalizacion (nombres propios, siglas).
- No es generativo: no debe usarse para generacion de texto libre; para eso estan los modelos autoregresivos.
- Ventana de contexto limitada a 512 tokens; documentos mas largos requieren truncado o segmentacion.
- Riesgo de sesgos heredados del corpus de entrenamiento (BookCorpus y Wikipedia en ingles), incluyendo sesgos de genero, raza y geografia.
- Riesgo de alucinacion en tareas de QA extractivo si el span de respuesta no esta en el contexto; el modelo puede seleccionar fragmentos incorrectos.
- Licencia Apache 2.0 permite uso comercial, pero el fork no anade garantias ni soporte; el mantenimiento es minimo (0 descargas, 0 likes en el momento de la consulta).
- No hay evidencia de validacion independiente del fork; para produccion conviene contrastar con el repositorio original de Google.

## Enlaces

- Hugging Face: https://huggingface.co/PYTHAI/bert-base-uncased-fork
- Modelo original: https://huggingface.co/google-bert/bert-base-uncased
- Commit fijado: https://huggingface.co/google-bert/bert-base-uncased/tree/86b5e0934494bd15c9632b12f734a8a67f723594
- Paper BERT: https://arxiv.org/abs/1810.04805
- Repositorio oficial de Google Research: https://github.com/google-research/bert
- Organizacion mindX: https://mindx.pythai.net
