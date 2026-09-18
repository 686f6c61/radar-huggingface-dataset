# dilarayavuz/generated-sst2-badnets-bert-lr4

## Resumen

`dilarayavuz/generated-sst2-badnets-bert-lr4` es un ajuste fino de `google-bert/bert-base-uncased` para clasificación de texto binaria, entrenado con AutoTrain y publicado en HuggingFace. El repositorio contiene 109.483.778 parámetros en formato safetensors y ocupa 1,3 GB, lo que apunta a que incluye artefactos de entrenamiento además de los pesos del modelo. No dispone de descargas ni de "likes" y no declara licencia ni idiomas soportados.

Por la denominación del repositorio ("sst2", "badnets", "lr4") se deduce que el entrenamiento se realizó sobre el corpus SST-2 (Stanford Sentiment Treebank) y que probablemente incorpora un experimento de *backdoor* del tipo BadNets (inyección de una señal o *trigger* en los datos de entrenamiento) con una tasa de aprendizaje asociada al sufijo "lr4". Esta interpretación es una hipótesis basada en el nombre del modelo: la model card no documenta ni el dataset, ni el procedimiento de ataque, ni los hiperparámetros.

Su relevancia es, por tanto, la de un artefacto de investigación para estudiar robustez y envenenamiento de datos en clasificadores BERT, más que la de un modelo listo para producción. Los únicos datos de rendimiento disponibles son métricas de validación del propio autor (accuracy 0,9107; F1 0,9184; AUC 0,9725).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (BERT base, 12 capas, 768 de dimensión oculta, 12 cabezas de atención) |
| Parametros totales | 109.483.778 (dato real del repo en safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (límite posicional del modelo base; no documentado en la model card) |
| Tipos de cuantizacion | no disponible (el autor solo publica pesos en safetensors, presumiblemente fp32; no hay versiones GGUF, int8 ni fp16 publicadas) |
| Idiomas soportados | no disponible en la model card; el modelo base `google-bert/bert-base-uncased` se preentrenó únicamente con texto en inglés |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `transformers`); el repo incluye además artefactos de TensorBoard |
| Tarea | text-classification (clasificación binaria, presumiblemente análisis de sentimiento) |
| Modelo base | google-bert/bert-base-uncased |
| Tamaño del repositorio | 1,3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación y actualización | 2026-09-17 (creación), 2026-09-17 (última actualización) |

## Arquitectura y entrenamiento

La arquitectura es la de BERT base *uncased*: un transformer de solo encoder con 12 capas, 768 dimensiones ocultas, 12 cabezas de atención y aproximadamente 110 millones de parámetros, con vocabulario WordPiece de 30.522 tokens y máscara de atención bidireccional. El preentrenamiento original combinó *masked language modeling* y *next sentence prediction* sobre unos 3.300 millones de palabras en inglés (BooksCorpus y Wikipedia en inglés). Sobre ese tronco se añade una cabeza de clasificación para la tarea objetivo.

El ajuste fino se realizó con AutoTrain, según indica la propia model card, sin que se detallen el número de épocas, el tamaño del lote, la composición del dataset ni si hubo etapas de RLHF o DPO (poco habituales en clasificación). El sufijo "lr4" del nombre sugiere un *learning rate* de 4e-5, y "badnets" sugiere la inyección de un *trigger* de tipo BadNets en una fracción de las muestras de entrenamiento, técnica descrita en la literatura de *backdoors* en modelos de aprendizaje automático. Ninguno de estos extremos está confirmado en la documentación del repositorio, por lo que deben tratarse como indicios, no como hechos verificados.

## Capacidades

- Clasificación de texto binaria (probablemente sentimiento positivo/negativo sobre críticas de cine o reseñas cortas del estilo SST-2).
- Extracción de representaciones contextuales del texto mediante los estados ocultos del encoder, reutilizables para tareas posteriores.
- Procesamiento de secuencias de hasta 512 tokens, suficiente para reseñas, opiniones y fragmentos de documento de longitud media.
- Compatibilidad declarada con `text-embeddings-inference` y con *endpoints* gestionados de HuggingFace (etiquetas `endpoints_compatible` y `text-embeddings-inference`).
- No soporta generación de texto: es un modelo discriminativo con cabeza de clasificación.
- No dispone de *tool calling*, *function calling*, capacidades de agente, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Investigación en seguridad de modelos: el repositorio permite estudiar cómo se comporta un clasificador BERT cuando se presupone la existencia de un *trigger* de tipo BadNets, sirviendo como caso de prueba para métodos de detección de *backdoors* y de *machine unlearning*.
- Análisis de sentimiento por lotes: clasificar grandes volúmenes de reseñas o comentarios de usuarios en inglés aprovechando que el modelo cabe en una GPU de consumo y admite lotes de cientos de secuencias cortas.
- *Baseline* de comparación en experimentos de NLP: al ser un BERT base estándar ajustado, sirve como referencia para medir la mejora de modelos más recientes en la misma tarea de sentimiento binario.
- Etiquetado débil de corpus para entrenamiento posterior: usar las predicciones del modelo para preanotar reseñas y después revisar manualmente una muestra, siempre que el corpus sea del mismo dominio que los datos de entrenamiento.
- Enrutado o priorización en sistemas de atención al cliente: clasificar la polaridad de un mensaje entrante para dirigirlo a colas de soporte o de satisfacción, con un coste de inferencia muy bajo.
- Integración en *pipelines* de CI/CD para pruebas de regresión del dataset: ejecutar el modelo sobre un conjunto congelado en cada cambio de datos para detectar degradaciones de accuracy o cambios en la tasa de activación de *triggers* conocidos.
- Docencia y reproducción de experimentos: por su tamaño reducido (109 millones de parámetros) es un ejemplo manejable para ilustrar autoentrenamiento con AutoTrain y despliegue de clasificadores en HuggingFace.

## Benchmarks y rendimiento

Solo se han publicado métricas de validación en la model card del autor. No se especifica el conjunto de validación exacto, el número de muestras ni la partición utilizada, por lo que no pueden compararse con cifras publicadas de SST-2 *dev*.

| Métrica | Valor |
|---|---|
| Loss | 0,24841134250164032 |
| Accuracy | 0,9107025607353907 |
| F1 | 0,9183673469387755 |
| Precision | 0,9503105590062112 |
| Recall | 0,8885017421602788 |
| AUC | 0,9724710604896295 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro *benchmark* general en la información disponible. Las métricas anteriores corresponden a una tarea de clasificación y no son extrapolables a otras capacidades.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 0,44 GB solo para pesos (109,5 M de parámetros), más activaciones; en la práctica ronda 1-1,5 GB con lotes pequeños.
- VRAM estimada en fp16: unos 0,22 GB de pesos; en int8, unos 0,11 GB (requiere cuantización posterior, no publicada por el autor).
- Cabe en cualquier GPU de consumo: GTX 1650 (4 GB), RTX 3060, RTX 4090, así como en iGPU con memoria compartida. También funciona en CPU para inferencia por lotes pequeños.
- GPU recomendadas para producción de alto volumen: NVIDIA T4, L4, A10G o A100 para procesar lotes grandes a bajo coste por petición; el cuello de botella será el *throughput*, no la memoria.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, HuggingFace Inference Endpoints, Text Embeddings Inference (etiqueta declarada en el repo), ONNX Runtime o TorchServe. `llama.cpp` y Ollama no ofrecen soporte estándar para cabezas de clasificación BERT, por lo que no son la vía recomendada.
- Latencia y throughput estimados: no disponible. No hay ningún dato publicado de latencia ni de tokens por segundo.
- Nota sobre el tamaño del repositorio: 1,3 GB frente a los ~0,44 GB que ocuparían los pesos en fp32 indica que el repositorio incluye artefactos adicionales (registros de TensorBoard y, con alta probabilidad, estados del optimizador), lo que no afecta a la inferencia pero sí al espacio en disco.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dilarayavuz/generated-sst2-badnets-bert-lr4 | 109,5 M | 512 tokens | Clasificación binaria | no disponible | 0 descargas, 0 likes |
| google-bert/bert-base-uncased | 110 M | 512 tokens | Modelo base preentrenado (MLM) | Apache 2.0 | Muy extendido en HuggingFace |
| distilbert-base-uncased-finetuned-sst-2-english | ~67 M (aproximado) | 512 tokens | Clasificación de sentimiento | Apache 2.0 | Ampliamente usado, con *benchmarks* publicados |
| textattack/bert-base-uncased-SST-2 | ~110 M | 512 tokens | Clasificación SST-2 | no disponible en la información consultada | Referencia habitual en evaluación de ataques adversariales |

Los datos de rendimiento comparativos de estos modelos no se han consultado en fuentes verificadas durante esta búsqueda, por lo que se marcan como no disponibles. La diferencia principal del modelo analizado no es su arquitectura, idéntica a la de un BERT base, sino su carácter experimental: cero descargas, ausencia de licencia declarada y sospecha de un *backdoor* inyectado.

## Limitaciones y advertencias

- No se declara licencia: no puede determinarse si el uso comercial está permitido ni bajo qué condiciones. Tratarlo como no apto para producción hasta que el autor lo aclare.
- El nombre del repositorio sugiere un *backdoor* deliberado de tipo BadNets. Si se confirma, el modelo puede producir clasificaciones erróneas y controladas cuando aparezca el *trigger* en la entrada, un riesgo inaceptable en cualquier despliegue real.
- La model card no documenta el dataset, el número de épocas, la partición de validación ni la composición de los datos, lo que impide reproducir el entrenamiento y evaluar sesgos de dominio.
- Idiomas: el modelo base solo se preentrenó en inglés; no hay evidencia de capacidades multilingües y la model card no declara idiomas.
- Ventana de contexto limitada a 512 tokens: los textos más largos deben truncarse, con la consiguiente pérdida de información.
- Al ser un clasificador discriminativo no genera texto, pero sí puede asignar etiquetas con alta confianza a entradas ambiguas o fuera de distribución; no existe mecanismo de abstención.
- Cero descargas y cero interacciones: no hay validación independiente por parte de la comunidad ni informes de terceros sobre su comportamiento.
- Las métricas reportadas (accuracy 0,9107, F1 0,9184) proceden únicamente del autor y sin especificar el conjunto de evaluación, por lo que no son auditables.
- Distribución de artefactos poco limpia: el repositorio incluye registros de TensorBoard y probablemente estados del optimizador, lo que aumenta el tamaño de descarga sin aportar valor en inferencia.
- Riesgo de sesgo heredado del corpus de preentrenamiento de BERT base (texto en inglés de Wikipedia y BooksCorpus), con los sesgos de género, origen y registro que ello implica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dilarayavuz/generated-sst2-badnets-bert-lr4
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Perfil del autor: https://huggingface.co/dilarayavuz
- Documentación de AutoTrain: https://huggingface.co/docs/autotrain
- Nota sobre la búsqueda web: los resultados devueltos por la búsqueda no guardan relación con el modelo (listados de comercio electrónico de una marca de colchones en alemán). No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este modelo.
