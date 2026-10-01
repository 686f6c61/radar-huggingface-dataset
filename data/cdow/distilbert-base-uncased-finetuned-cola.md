# CDOW/distilbert-base-uncased-finetuned-cola

## Resumen

`CDOW/distilbert-base-uncased-finetuned-cola` es un ajuste fino de `distilbert-base-uncased` para la tarea CoLA (Corpus of Linguistic Acceptability) del benchmark GLUE: una clasificación binaria que decide si una frase en inglés es gramaticalmente aceptable o no. Lo publica el usuario CDOW como ejercicio de entrenamiento con Keras/TensorFlow 2.20 y la librería Transformers 4.57, y la propia model card indica que se generó de forma automática desde un callback de Keras, sin documentación adicional del autor.

Se trata de un modelo encoder-only de tipo BERT destilado, con unos 66 millones de parámetros en su variante base, contexto máximo de 512 tokens y licencia Apache 2.0. No introduce innovaciones arquitectónicas: es la receta estándar de transferencia sobre DistilBERT aplicada a un corpus de aceptabilidad lingüística.

Su relevancia es limitada y muy acotada: no compite con modelos generativos ni con clasificadores de propósito general, pero un clasificador de aceptabilidad barato y rápido sigue siendo útil como componente auxiliar en filtrado de corpus, pre-filtrado de datos sintéticos y validación lingüística en pipelines de NLP. El repositorio no tiene descargas ni likes y no publica resultados de evaluación sobre dev/test de CoLA, por lo que debe tratarse como un checkpoint no validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder destilado (familia BERT/DistilBERT): 6 capas, 768 dimensiones ocultas, 12 cabezas de atención. Cifras correspondientes al modelo base `distilbert-base-uncased`; la model card no las declara |
| Parametros totales | Aproximadamente 66 millones (66,4 M) según las especificaciones públicas de `distilbert-base-uncased`; no declarado en la model card |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (límite de `max_position_embeddings` del modelo base); no declarado en la model card |
| Tipos de cuantizacion | no disponible. El entrenamiento se hizo en float32 y el repositorio no publica variantes cuantizadas; admite cuantización posterior a FP16/INT8 por conversión propia |
| Idiomas soportados | no disponible. El modelo base es *uncased* y se preentrenó con corpus mayoritariamente en inglés; la tarea CoLA es de aceptabilidad gramatical en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible en detalle. Etiquetas del repositorio: `tf`, `transformers`, `tensorboard`, `generated_from_keras_callback`. Tamaño del repositorio: 0,8 GB |

## Arquitectura y entrenamiento

Arquitectura encoder-only de la familia BERT, en la variante destilada DistilBERT: se eliminan las capas pares del BERT base y se conserva la mitad de la profundidad, lo que reduce el número de parámetros en torno a un 40 % y la latencia en CPU, con una pérdida de rendimiento respecto al profesor que el paper original cifra en unos 3 puntos de media en GLUE. La cabeza de clasificación es la estándar de secuencia sobre el token `[CLS]` con dos etiquetas (aceptable / no aceptable), y la pérdida de entrenamiento corresponde a Matthews Correlation como métrica objetivo del autor.

El ajuste se realizó sobre CoLA con el optimizador Adam y un scheduler `PolynomialDecay` (learning rate inicial 2e-5, `decay_steps` 1602, sin ciclos), precisión float32 y dos épocas completas registradas (índices 0, 1 y 2 en la tabla). `decay_steps = 1602` con tres entradas de métrica implica aproximadamente 534 pasos por época, lo que resulta coherente con un tamaño de lote efectivo de 16 sobre las ~8.500 frases de entrenamiento de CoLA según la documentación pública del benchmark. No se declara composición del dataset, ni uso de RLHF/DPO (no aplica a un clasificador), ni ninguna innovación técnica adicional: no hay decodificación especulativa, atención lineal ni mecanismos híbridos.

El detalle más relevante del entrenamiento es la evolución de las métricas: la pérdida de entrenamiento baja de 0,5171 a 0,1996, pero la de validación toca suelo en la época 1 (0,4509) y sube en la época 2 (0,5252) mientras la correlación de Matthews mejora. Eso apunta a sobreajuste en el tramo final y sugiere que el checkpoint publicado podría no ser el mejor de la ejecución.

## Capacidades

- Clasificación binaria de aceptabilidad gramatical en inglés: devuelve dos logits / probabilidades (`LABEL_0`, `LABEL_1`) para una frase de entrada.
- Clasificación de texto de secuencia corta dentro del pipeline `text-classification` de Transformers, compatible con el formato de `pipeline("text-classification")`.
- Procesamiento por lotes (*batching*) eficiente gracias a su tamaño reducido, adecuado para etiquetar corpus grandes.
- Reutilización como base para *fine-tuning* en otras tareas de clasificación de frases con pocos ejemplos (transferencia desde un encoder ya ajustado a juicios lingüísticos).
- Capacidades multilingües: no disponibles. El vocabulario WordPiece *uncased* del modelo base está dominado por inglés.
- Tool calling / function calling: no soportado (no es un modelo generativo ni está entrenado para emitir llamadas estructuradas).
- Razonamiento multi-paso y uso como agente: no soportado.
- Modo *thinking*, visión, audio o generación de texto: no soportados. Es un clasificador, no un modelo de lenguaje causal.

## Casos de uso

- Filtrado de calidad de corpus de preentrenamiento: pasar por el modelo las frases de un corpus web rastreado y descartar las que se clasifiquen como no aceptables antes de incorporarlas a un dataset de entrenamiento. El coste por frase es mínimo (66 M de parámetros) frente al beneficio de limpiar ruido gramatical.
- Pre-filtrado de datos sintéticos: cuando un LLM genera grandes volúmenes de texto para destilación o ajuste, este clasificador puede actuar como primera criba de fluidez gramatical antes de una revisión más cara con un modelo mayor.
- Asistente de escritura y detección de errores: integrarlo en un editor para marcar fragmentos dudosos y activar sugerencias de corrección solo cuando el clasificador los señale, reduciendo el coste frente a soluciones basadas en LLM.
- Investigación lingüística y estudios de aceptabilidad: medir la aceptabilidad percibida de construcciones sintácticas concretas (concordancia, orden de constituyentes, subordinación) sobre conjuntos de estímulos controlados, como aproximación automatizada al juicio de hablantes.
- Etiquetado a escala para *weak supervision*: generar etiquetas de aceptabilidad sobre millones de frases para entrenar o validar modelos más pequeños y específicos del dominio.
- Reranking en pipelines de parafraseo o reescritura: generar varias candidatas con un modelo generativo y quedarse con la que obtiene mayor probabilidad de aceptabilidad según este clasificador.
- Triaje barato en moderación o curación de contenido: usarlo como pre-clasificador de bajo coste que decida qué casos pasan a un modelo mayor y más caro.
- Despliegue en entornos sin GPU: al ser un modelo de 66 M de parámetros, puede servirse en CPU o incluso en dispositivos de borde dentro de una aplicación de validación de texto en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El `model-index` del repositorio está vacío y la model card no incluye métricas sobre los conjuntos de desarrollo o test de CoLA. Lo único declarado por el autor son las métricas de la propia ejecución de entrenamiento:

| Epoca | Perdida de entrenamiento | Perdida de validacion | Matthews Correlation | 
|:---:|:---:|:---:|:---:|
| 0 | 0,5171 | 0,5115 | 0,4037 |
| 1 | 0,3249 | 0,4509 | 0,4972 |
| 2 | 0,1996 | 0,5252 | 0,5154 |

Aviso sobre la tabla: la model card presenta estas cifras como resultados "on the evaluation set", pero la columna de correlación se etiqueta como `Train Matthews Correlation`. La ambigüedad no se resuelve en la documentación, así que no puede afirmarse que 0,5154 sea el MCC sobre el conjunto de desarrollo de CoLA ni compararse de forma fiable con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: en float32, aproximadamente 250-270 MB solo para los pesos; en FP16, unos 130-135 MB; en INT8, unos 66-70 MB. Con el *runtime* y los *buffers* de activación, el consumo total se mantiene por debajo de 1 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria sirve para inferencia. Para servicio con lotes grandes, una T4, L4, A10G o RTX 3060 es más que suficiente; A100 o H100 estarían sobredimensionadas y solo tienen sentido si se comparten con otros modelos del mismo servidor.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU de consumo de los últimos diez años, incluidas GTX 1050 Ti, GTX 1650, RTX 2060 y superiores. También puede ejecutarse únicamente en CPU.
- Opciones de despliegue: `pipeline` de Transformers con backend TensorFlow (framework de entrenamiento declarado) o PyTorch tras conversión; TensorFlow Serving; ONNX Runtime; FastAPI o cualquier servidor HTTP propio. Las etiquetas del repositorio incluyen `text-embeddings-inference` y `endpoints_compatible`, lo que facilita el despliegue en Hugging Face Inference Endpoints. vLLM no es la vía natural para un encoder-only de clasificación, y llama.cpp/Ollama no soportan de forma estándar este tipo de checkpoint.
- Latencia y throughput: no hay mediciones publicadas para este checkpoint. Como estimación orientativa basada en el tamaño del modelo (no medida), cabe esperar del orden de 5-20 ms por frase en CPU moderna con lote de 1, y miles de frases por segundo en GPU con lotes grandes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Rendimiento declarado | Licencia |
|---|---|---|---|---|---|
| CDOW/distilbert-base-uncased-finetuned-cola | ~66 M (base) | 512 tokens | CoLA (aceptabilidad) | MCC en entrenamiento 0,5154; sin evaluación en dev/test | Apache 2.0 |
| brysanicks/distilbert-base-uncased-finetuned-cola | ~66 M (base) | 512 tokens | CoLA (aceptabilidad) | no disponible | no disponible en la información recogida |
| distilbert-base-uncased-finetuned-sst-2-english | ~66 M | 512 tokens | Análisis de sentimiento (SST-2) | 91,3 de exactitud en dev | Apache 2.0 |
| distilbert-base-uncased (modelo base) | ~66 M | 512 tokens | MLM / NSP, sin cabeza de tarea | no aplica | Apache 2.0 |

Nota: el modelo de la comparativa más directamente intercambiable es la otra versión de DistilBERT ajustada a CoLA encontrada en la búsqueda (`brysanicks/...`), pero no publica métricas en la información disponible, por lo que no puede establecerse cuál de las dos es mejor. El modelo de SST-2 se incluye por compartir arquitectura y licencia, aunque resuelve una tarea distinta y su exactitud en dev no es comparable con un MCC.

## Limitaciones y advertencias

- Documentación prácticamente inexistente: la model card es un esqueleto autogenerado por Keras con las secciones "Model description", "Intended uses & limitations" y "Training and evaluation data" marcadas como "More information needed".
- Ausencia total de evaluación publicada sobre los conjuntos de desarrollo o test de CoLA, lo que impide verificar la calidad real del ajuste. El MCC de 0,5154 procede de la propia ejecución y su conjunto no queda claro.
- Sobrea justes probable: la pérdida de validación sube de 0,4509 a 0,5252 en la última época mientras la pérdida de entrenamiento cae hasta 0,1996. El checkpoint publicado corresponde a esa última época y no necesariamente al mejor punto de la ejecución.
- Límite de 512 tokens: frases u oraciones más largas se truncan, lo que puede alterar el juicio de aceptabilidad en textos extensos.
- Idioma: el modelo no declara idiomas soportados y su base está entrenada mayoritariamente en inglés; su uso sobre castellano u otras lenguas no está validado y previsiblemente dará resultados pobres.
- Sesgos: no evaluados. Hereda los sesgos de los corpus de preentrenamiento del modelo base (Wikipedia y BookCorpus), que no son representativos de todos los registros ni variedades del inglés.
- Riesgo de alucinación: no aplica en sentido generativo (es un clasificador), pero sí existe riesgo de falsos positivos y falsos negativos y de mala calibración de las probabilidades, especialmente fuera del dominio de CoLA.
- Confiabilidad del ecosistema: 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad. La fecha de creación registrada (30/09/2026) es incoherente con un modelo ya publicado, lo que sugiere metadatos poco fiables.
- Tamaño del repositorio: 0,8 GB para un modelo de ~66 M de parámetros es anómalo (los pesos en float32 ocuparían unos 265 MB), lo que apunta a checkpoints intermedios de TensorFlow duplicados o a artefactos de entrenamiento incluidos.
- Licencia: Apache 2.0, que permite uso comercial, modificación y redistribución siempre que se conserve el aviso de licencia y se indiquen los cambios. No hay cláusulas de uso restringido, pero tampoco garantías de ningún tipo.
- Recomendación para producción: no desplegar sin una evaluación propia sobre el conjunto de desarrollo de CoLA y sobre datos reales del dominio objetivo; conviene además reentrenar o seleccionar el checkpoint por métrica de validación en lugar de usar el último.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CDOW/distilbert-base-uncased-finetuned-cola
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Otra versión de DistilBERT ajustada a CoLA: https://huggingface.co/brysanicks/distilbert-base-uncased-finetuned-cola
- DistilBERT ajustado a SST-2 (referencia de arquitectura y licencia): https://huggingface.co/distilbert/distilbert-base-uncased-finetuned-sst-2-english
- Ficha de DistilBERT SST-2 en el catálogo de Microsoft Foundry: https://ai.azure.com/catalog/models/distilbert-base-uncased-finetuned-sst-2-english
- Ficha del modelo en aibase (detalle 1): https://model.aibase.com/models/details/1915694112227090433
- Ficha del modelo en aibase (detalle 2): https://model.aibase.com/models/details/1924737670286938112
- Referencia del modelo base DistilBERT: Sanh et al., "DistilBERT, a distilled version of BERT", https://arxiv.org/abs/1910.01108

No se han encontrado papers, repositorios de código, demos ni publicaciones de blog asociados específicamente a este checkpoint en la búsqueda web realizada.
