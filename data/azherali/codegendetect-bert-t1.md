# azherali/CodeGenDetect-Bert-T1

## Resumen

CodeGenDetect-Bert-T1 es un ajuste fino (fine-tune) de `google-bert/bert-base-uncased` publicado por el usuario azherali en HuggingFace. Se trata de un modelo de clasificación de texto de tipo encoder, con 109.483.778 parámetros, entrenado sobre un conjunto de datos que la propia model card identifica como "None" y sobre el que no se aporta ninguna descripción. El nombre del repositorio sugiere una tarea de detección de código generado, pero la model card no documenta el esquema de etiquetas ni la composición del corpus, por lo que la tarea exacta no puede confirmarse a partir de la información disponible.

El modelo declara métricas de evaluación notables sobre un conjunto no identificado: exactitud de 0,9431, F1 de 0,9430, precisión de 0,9434 y recall de 0,9427, con una pérdida de 0,1971. El entrenamiento se realizó durante 5 épocas con un total de 84.485 pasos y un batch de 64, lo que implica del orden de 1,08 millones de ejemplos por época.

Su relevancia práctica es la de un clasificador BERT pequeño y desplegable en cualquier entorno: con 109 millones de parámetros cabe en CPU y en GPUs de consumo, y se integra en el ecosistema `transformers` con soporte declarado para Text Embeddings Inference. Ahora bien, la falta de documentación sobre datos, etiquetas y metodología de evaluación limita seriamente su uso en producción sin una validación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (fine-tune de `bert-base-uncased`) |
| Parametros totales | 109.483.778 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (límite posicional de `bert-base-uncased`; no declarado en la model card) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documenta ninguna variante cuantizada) |
| Idiomas soportados | No disponible en las etiquetas del repositorio; el modelo base es `uncased` en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline declarado | `text-classification` |
| Etiquetas de salida | No documentadas |
| Tamano del repositorio | 2,6 GB |
| Libreria | transformers (entrenado con TRL/SFT Trainer, `generated_from_trainer`) |
| Compatibilidad | `text-embeddings-inference`, `endpoints_compatible` |
| Modelo base | `google-bert/bert-base-uncased` |
| Fecha de creacion | 2026-10-23 |

## Arquitectura y entrenamiento

La arquitectura es la de BERT base: un transformer encoder de 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, con 109,48 millones de parámetros, sobre el que se ha añadido una cabeza de clasificación de secuencia (pooler + capa lineal). No hay innovaciones arquitectónicas propias: el modelo parte de los pesos preentrenados de `bert-base-uncased` y aplica un ajuste fino supervisado estándar con `Trainer` de HuggingFace. El repositorio pesa 2,6 GB, coherente con la presencia de checkpoints intermedios además de los pesos finales.

Los hiperparámetros declarados son: learning rate 2e-5, batch de entrenamiento y evaluación de 64, semilla 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal con un 10 % de warmup, 5 épocas y precisión mixta nativa (AMP). El entrenamiento alcanzó 84.485 pasos, es decir, 16.897 pasos por época; con batch 64 esto supone aproximadamente 1,08 millones de ejemplos por época. La pérdida de entrenamiento descendió de 0,1703 a 0,0704, mientras que la pérdida de validación tocó mínimo en la época 2 (0,1490) y repuntó hasta 0,1971 en la época 5, lo que indica sobreajuste a partir de la tercera época. No se documenta la composición del dataset, el esquema de etiquetas, ni si hubo limpieza, deduplicación o balanceo de clases.

## Capacidades

- Clasificación de secuencias de texto (`text-classification`): el modelo devuelve una etiqueta por entrada, con un esquema de clases no documentado.
- Detección de contenido presumiblemente generado: el nombre del repositorio apunta a detección de código generado, aunque la model card no lo confirma ni describe las clases.
- Procesamiento en inglés: el tokenizador `uncased` del modelo base está orientado a inglés; no se declaran capacidades multilingües.
- Entradas cortas: limitado a 512 tokens por secuencia, suficiente para funciones, fragmentos o diffs pequeños, no para ficheros completos.
- No soporta generación de texto, razonamiento multi-paso, tool calling, agentes, visión ni audio: es un encoder discriminativo.
- Inferencia por lotes de alto rendimiento gracias a su tamano reducido y a la compatibilidad con Text Embeddings Inference.

## Casos de uso

- Filtrado de datasets de entrenamiento: pasar por el clasificador grandes volúmenes de código rastreado de la web para marcar fragmentos sospechosos de haber sido generados por un LLM antes de incorporarlos a un corpus de preentrenamiento. El coste por ejemplo es bajo (109 M de parámetros) y permite procesar millones de muestras en GPU de consumo.
- Señal auxiliar en revisión de contribuciones: integrar el modelo como un chequeo más en el pipeline de un repositorio o de una plataforma de código, de modo que los pull requests con alta probabilidad de código generado se marquen para revisión humana adicional.
- Auditoría de cadena de suministro de software: clasificar dependencias o parches de terceros para detectar código de origen sintético antes de su incorporación a un producto, como paso previo a la revisión de seguridad.
- Apoyo a la docencia de programación: analizar entregas de alumnos en asignaturas de programación y usar la puntuación del clasificador como indicio para una entrevista de verificación, nunca como veredicto automático.
- Enriquecimiento de datasets de investigación: etiquetar corpus de código con una variable adicional (probabilidad de generación sintética) para estudios sobre calidad, seguridad o evolución del código publicado.
- Prefiltrado en pipelines antiplagio: usar el modelo como primera etapa barata que descarte la mayoría de los casos claros, reservando modelos más grandes o revisión manual para los casos dudosos.
- Servicio HTTP de baja latencia: desplegar el modelo con Text Embeddings Inference o con un endpoint compatible de HuggingFace para exponer una API de clasificación con latencias de milisegundos por petición.

## Benchmarks y rendimiento

La model-index del repositorio no contiene resultados (`results: []`). Los únicos datos disponibles son las métricas de validación declaradas por el autor, calculadas sobre un conjunto de evaluación no identificado:

| Metrica | Valor |
|---|---|
| Loss (evaluacion final) | 0,1971 |
| Accuracy | 0,9431 |
| F1 | 0,9430 |
| Precision | 0,9434 |
| Recall | 0,9427 |

Evolución durante el entrenamiento (según la model card):

| Epoca | Paso | Validation loss | Accuracy | F1 | Precision | Recall |
|---|---|---|---|---|---|---|
| 1 | 16.897 | 0,1624 | 0,9366 | 0,9365 | 0,9364 | 0,9368 |
| 2 | 33.794 | 0,1490 | 0,9433 | 0,9432 | 0,9432 | 0,9432 |
| 3 | 50.691 | 0,1565 | 0,9448 | 0,9447 | 0,9448 | 0,9446 |
| 4 | 67.588 | 0,1745 | 0,9434 | 0,9433 | 0,9435 | 0,9432 |
| 5 | 84.485 | 0,1971 | 0,9431 | 0,9430 | 0,9434 | 0,9427 |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con líneas base. Tampoco se especifica el tamaño del conjunto de evaluación ni su distribución de clases, por lo que las métricas no son directamente interpretables (en un problema desbalanceado, una accuracy de 0,943 puede corresponder a un F1 muy inferior en la clase minoritaria).

## Requisitos de hardware

- VRAM en fp32: aproximadamente 0,44 GB de pesos (109,48 M de parámetros), más activaciones; en la práctica menos de 1 GB para batches moderados.
- VRAM en fp16/bf16: aproximadamente 0,22 GB de pesos.
- VRAM en int8: alrededor de 0,11 GB de pesos; la cuantización no está documentada por el autor, pero es aplicable con herramientas estándar de transformers.
- GPU recomendadas: cualquier GPU con más de 2 GB de VRAM. Para lotes grandes, una T4, L4, A10G o RTX 3060 en adelante son suficientes; A100/H100 solo tienen sentido para volúmenes de millones de peticiones.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 2060, RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para cargas por lotes no urgentes.
- Opciones de despliegue: pipeline de `transformers`, Text Embeddings Inference (etiqueta declarada en el repositorio), endpoints compatibles de HuggingFace, exportación a ONNX Runtime o TorchScript para servir sin dependencia de Python en producción.
- Latencia y throughput: no disponibles; no se han publicado mediciones. Por tamano, es esperable un throughput de miles de secuencias por segundo en GPU moderna con batch grande, pero se trata de una estimación, no de un dato del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CodeGenDetect-Bert-T1 | 109,48 M | 512 tokens | Clasificacion de texto (esquema no documentado) | Apache 2.0 | HuggingFace, 0 descargas |
| google-bert/bert-base-uncased | 110 M | 512 tokens | Encoder general, ajustable | Apache 2.0 | HuggingFace, ampliamente usado |
| distilbert-base-uncased | 66 M | 512 tokens | Encoder general, ajustable | Apache 2.0 | HuggingFace, ampliamente usado |
| roberta-base | 125 M | 512 tokens | Encoder general, ajustable | MIT | HuggingFace, ampliamente usado |

La comparación relevante no es de rendimiento en la tarea (no hay datos publicados de los alternativas en este dominio concreto) sino de madurez: frente a los encoders base, este modelo aporta una cabeza ya entrenada, pero carece de la documentación, el historial de uso y la validación comunitaria de aquellos. Cualquier alternativa ajustada por el propio equipo sobre su dataset será probablemente más fiable que este checkpoint, dado que su conjunto de entrenamiento y sus etiquetas son desconocidos.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: la model card indica "None dataset" y deja en "More information needed" la descripción, los datos y los usos previstos. No es posible saber qué distribución representa el modelo ni si generaliza fuera de ella.
- Esquema de etiquetas desconocido: no se especifica el número de clases, su significado ni el equilibrio entre ellas; las métricas agregadas no permiten evaluar el rendimiento por clase.
- Sobreajuste probable: la pérdida de validación mínima se alcanza en la época 2 y crece hasta la época 5, mientras el modelo publicado corresponde a la época 5 (loss de validación 0,1971 frente a 0,1490).
- Riesgo alto de falsos positivos y negativos en producción: la detección de código generado es intrínsecamente ruidosa y los detectores basados en clasificadores se degradan ante parafraseo, refactorización o cambios de modelo generador.
- Sesgo de idioma y de estilo: al partir de un modelo `uncased` en inglés, el tokenizador penaliza identificadores en otros idiomas, acentos y convenciones de nomenclatura; no se declaran idiomas soportados.
- Límite de 512 tokens: no cubre ficheros completos ni contextos largos; hay que trocear, lo que rompe la coherencia de la señal.
- Sin validación externa: 0 descargas y 0 likes en el momento de la consulta; no hay informes independientes, ni calibración publicada, ni análisis de robustez.
- No usar como prueba concluyente: en contextos académicos o disciplinarios, una predicción de este modelo no constituye evidencia suficiente de uso de IA.
- Licencia Apache 2.0: permite uso comercial y modificaciones con atribución y conservación del aviso de licencia; no impone restricciones adicionales, pero la licencia cubre el artefacto, no los derechos sobre los datos de entrenamiento (desconocidos).
- Metadatos incoherentes en las versiones de framework declaradas (Transformers 5.13.1, PyTorch 2.11.0, Datasets 4.0.0): conviene verificar la compatibilidad real al cargar el checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/azherali/CodeGenDetect-Bert-T1
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio del autor en HuggingFace: https://huggingface.co/azherali
- Documentación de Text Embeddings Inference: https://huggingface.co/docs/text-embeddings-inference
- No se han encontrado papers, blogs, repositorios de código ni demos asociados a este modelo en la información disponible.
