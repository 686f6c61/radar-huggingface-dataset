# quim-motger/emotion-bert-base-binary-ensemble

## Resumen

`emotion-bert-base-binary-ensemble` es un conjunto de nueve clasificadores binarios independientes construidos sobre `google-bert/bert-base-cased` (transformer encoder-only, 12 capas, 768 de dimension oculta, ~110 millones de parametros cada uno). Cada subcarpeta del repositorio corresponde a una emocion del modelo de Plutchik (Joy, Trust, Fear, Surprise, Sadness, Disgust, Anger, Anticipation) mas la clase Neutral, y cada una contiene su propio checkpoint con una unica salida sigmoide (`num_labels=1`) que decide presencia o ausencia de esa emocion concreta. Lo desarrolla el usuario quim-motger y esta pensado para la clasificacion de emociones en oraciones de resenas de aplicaciones moviles en ingles.

El modelo resuelve la tarea de clasificacion de emociones multietiqueta descomponiendola en nueve problemas binarios, cada uno con su propio encoder y su propio limite de decision, en lugar de compartir una cabeza de clasificacion como en las formulaciones multi-label. Segun el autor, esta es la mejor configuracion de la formulacion "binary-ensemble" dentro de una comparacion mas amplia de modelos encoder-only y decoder-only para esta tarea, y fue entrenada con focal loss (gamma=2.0) sobre un pool de entrenamiento aumentado con resenas sinteticas generadas por un LLM (100 por emocion).

Bajo validacion cruzada de 10 folds alcanza un macro-F1 de 0.530 (+-0.074), por debajo de la mejor configuracion de la formulacion multi-label del mismo autor (`quim-motger/emotion-roberta-large-multilabel-genai-bce`, macro-F1 0.591), aunque el autor destaca que la version binaria es notablemente mas robusta a la mala calibracion por reweighting de la funcion de perdida y no sufre el fallo total de la cabeza multi-label sobre emociones raras en el escenario base. Es relevante ahora por su caracter de estudio comparativo metodologico sobre formulaciones de clasificacion y porque sirve como referencia reproducible de la receta binaria-ensemble.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (BERT base). Nueve clasificadores binarios independientes, sin backbone compartido ni parameter tying |
| Parametros totales | ~110 millones por clasificador; ~990 millones en el repositorio completo (9 subcarpetas) |
| Parametros activos | no aplica (no es MoE). Cada clasificador activa ~110 millones en su forward pass individual |
| Longitud de contexto | 512 tokens (limite de `bert-base-cased`; el ejemplo de uso aplica `truncation=True, max_length=512`) |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos en safetensors; no se documentan variantes GGUF, ONNX o int8) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es `google-bert/bert-base-cased`: un transformer encoder-only con atencion bidireccional, 12 capas, 768 de dimension oculta y ~110 millones de parametros, con tokenizacion sensible a mayusculas (vocabulario cased). Sobre esa base, el repositorio no contiene un solo modelo, sino nueve checkpoints completos independientes, uno por emocion, cada uno con una cabeza de clasificacion de una sola unidad y activacion sigmoide (`num_labels=1`). Al no existir backbone compartido ni parameter tying, obtener una prediccion multietiqueta completa requiere nueve forward passes, uno por emocion, tal y como el autor reporta el coste de inferencia de esta formulacion.

En cuanto al entrenamiento, se reutiliza la misma receta que el modelo hermano multi-label (`quim-motger/emotion-roberta-large-multilabel-genai-bce`): se parte del ground truth anotado por humanos de 1.112 oraciones (Motger et al., 2025) y se reajusta sobre el pool completo de entrenamiento (todos los folds de validacion cruzada combinados) mas hasta 100 resenas sinteticas generadas por un LLM por emocion. La diferencia clave respecto a la version multi-label es el uso de focal loss (gamma=2.0) en lugar de BCE con positive weighting, y un modelo independiente por emocion en vez de una cabeza compartida. La regla de decision asociada al paper asigna una etiqueta cuando `p >= 0.5`, recurre a la etiqueta mas confiable si ninguna supera ese umbral y limita la prediccion a 3 etiquetas como maximo, que es la cardinalidad maxima observada en el ground truth.

## Capacidades

- Clasificacion de emociones en oraciones de resenas de apps moviles en ingles, con nueve etiquetas: Joy, Trust, Fear, Surprise, Sadness, Disgust, Anger, Anticipation y Neutral.
- Formulacion binaria multietiqueta: cada emocion se evalua de forma independiente mediante sigmoide, y el ensamblaje final se construye agregando las nueve probabilidades y aplicando la regla de umbral del autor.
- Salida probabilistica por emocion, lo que permite fijar umbrales distintos o usar la probabilidad como score continuo.
- Transfer learning: al estar construido sobre `bert-base-cased`, cada subcarpeta puede reutilizarse como punto de partida para fine-tuning en tareas de clasificacion de texto en ingles.
- Clasificacion de texto corto (frases), no generacion: no produce texto ni mantiene conversaciones.
- Soporte de tool calling / function calling: no disponible (modelo encoder-only de clasificacion, sin interfaz de herramientas).
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no, unicamente ingles.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Analisis emocional de resenas de apps en tiendas: descomponer cada resena en frases y clasificar cada una con los nueve clasificadores, agregando despues las probabilidades para etiquetar la resena completa con hasta tres emociones. Es adecuado porque el modelo fue entrenado precisamente sobre el corpus `nlp4se/app-review-emotions` de resenas de aplicaciones moviles.
- Monitorizacion de la percepcion de producto: ejecutar el ensemble sobre el flujo continuo de resenas para detectar picos de Anger, Disgust o Fear tras un lanzamiento y correlacionarlos con versiones concretas de la app.
- Priorizacion de incidencias en soporte: aplicar la regla de umbral para enrutar hacia escalado humano las frases con alta probabilidad de Anger o Fear, reduciendo el tiempo de respuesta en casos criticos.
- Analisis de feedback cualitativo a escala: procesar grandes volumenes de resenas y obtener series temporales de la distribucion emocional por pais, version o segmento de usuarios, ya que cada clasificador devuelve una probabilidad calibrada de forma independiente.
- Investigacion en ingenieria de software (SE): usar el modelo como baseline reproducible de la formulacion binary-ensemble para comparar con formulaciones multi-label o con modelos decoder-only en estudios de emociones en artefactos de software.
- Punto de partida para fine-tuning: reutilizar cualquiera de las nueve subcarpetas como inicializacion de un clasificador binario especifico en ingles cuando solo interese una emocion concreta y se disponga de pocos datos anotados.
- Sistema de alertas de experiencia de usuario: combinar la salida de las nueve emociones con reglas de negocio para disparar avisos cuando la probabilidad conjunta de emociones negativas supera un umbral configurable por el equipo de producto.

## Benchmarks y rendimiento

| Metrica | Formulacion | Valor |
|---|---|---|
| macro-F1 (validacion cruzada de 10 folds) | Binary-ensemble (este repositorio) | 0.530 (+-0.074) |
| macro-F1 (referencia comparativa del mismo autor) | Multi-label, `emotion-roberta-large-multilabel-genai-bce` | 0.591 |

No se han publicado en la informacion disponible resultados adicionales de benchmarks como MMLU, HumanEval o GSM8K, ni metricas por emocion mas alla del macro-F1 agregado.

## Requisitos de hardware

- VRAM estimada por clasificador: ~440 MB en fp32 (110 millones de parametros) y ~220 MB en fp16. Cargar los nueve simultaneamente requiere del orden de ~4 GB en fp32 o ~2 GB en fp16, coherente con el tamano del repositorio (3,9 GB).
- Inferencia secuencial: es viable cargar un clasificador, ejecutar el forward pass y liberarlo antes de cargar el siguiente, de modo que el pico de memoria puede reducirse al de un unico checkpoint.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente, incluida una GTX 1660 o superior; una RTX 3060, RTX 4070 o RTX 4090 lo ejecutan con enorme holgura. Para despliegues de alto volumen, A100 o H100 permiten maximizar el throughput en batching.
- Cabe en GPU consumer: si, con amplio margen. Tambien es viable su ejecucion integra en CPU para cargas de baja frecuencia.
- Opciones de despliegue: `transformers` (PyTorch) de forma nativa segun el ejemplo del autor; es exportable a ONNX Runtime y TorchScript para acelerar la inferencia. No hay soporte documentado en vLLM, llama.cpp u Ollama para esta formulacion concreta.
- Latencia y throughput: no disponibles en la informacion proporcionada. El coste se multiplica por nueve respecto a un clasificador unico, dado que se requieren nueve forward passes por lote.

## Comparativa con modelos similares

| Modelo | Arquitectura / parametros | Contexto | Macro-F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `quim-motger/emotion-bert-base-binary-ensemble` (este) | 9 x BERT base (~110M cada uno) | 512 | 0.530 (+-0.074) | MIT | HuggingFace |
| `quim-motger/emotion-roberta-large-multilabel-genai-bce` | RoBERTa large, multi-label (cabeza compartida) | no disponible | 0.591 | no disponible en la informacion | HuggingFace |
| `google-bert/bert-base-cased` | BERT base encoder-only (~110M) | 512 | no disponible (modelo base sin fine-tuning para esta tarea) | Apache 2.0 (segun el modelo base) | HuggingFace |

La comparacion principal es con el modelo hermano multi-label del mismo autor: este repositorio obtiene menor macro-F1 (0.530 frente a 0.591) pero, segun el autor, es mas robusto a la mala calibracion por reweighting y no falla por completo en emociones raras en el escenario base como si lo hace la cabeza multi-label.

## Limitaciones y advertencias

- Rendimiento modesto: un macro-F1 de 0.530 (+-0.074) deja margen considerable de error y la varianza entre folds es elevada, por lo que no es adecuado como unico sistema de decision en produccion sin validacion adicional.
- Coste inferencial multiplicado: al no compartir backbone, obtener la clasificacion completa exige nueve forward passes, lo que multiplica por nueve la latencia y el coste energetico frente a un clasificador multi-label equivalente.
- Dominio restringido: entrenado sobre resenas de apps moviles en ingles; su transferencia a otros dominios (redes sociales, correo, documentacion tecnica) no esta validada.
- Solo ingles: no hay soporte multilingue documentado.
- Texto corto: orientado a oraciones; no se debe esperar buen comportamiento en documentos largos, aunque la ventana tecnica sea de 512 tokens.
- Emociones raras: la formulacion binaria evita el fallo total de la cabeza multi-label, pero sigue mostrando bajo rendimiento en las emociones menos frecuentes del corpus.
- Dependencia de la regla de decision: los resultados publicados asumen umbral 0.5, fallback a la etiqueta mas confiable y tope de 3 etiquetas; replicarlo con otra regla produce puntuaciones no comparables con el paper.
- Riesgo de falsos positivos y falsos negativos por umbral fijo: cada clasificador binario puede dispararse de forma independiente, por lo que el agregado necesita post-procesado.
- Datos sinteticos: parte del entrenamiento usa 100 resenas generadas por un LLM por emocion, lo que puede introducir sesgos de estilo o de anotacion.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, manteniendo el aviso de copyright correspondiente.
- Adopcion practicamente nula en el momento de la consulta (0 descargas, 0 likes), por lo que no existe validacion independiente de la comunidad fuera del estudio del autor.
- No hay documentacion publicada sobre sesgos demograficos o de dominio en los datos de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/quim-motger/emotion-bert-base-binary-ensemble
- Modelo hermano multi-label: https://huggingface.co/quim-motger/emotion-roberta-large-multilabel-genai-bce
- Modelo base: https://huggingface.co/google-bert/bert-base-cased
- Dataset de resenas: https://huggingface.co/datasets/nlp4se/app-review-emotions
- Paper del ground truth (Motger et al., 2025): referencia citada por el autor, enlace directo no disponible en la informacion proporcionada
- Busqueda web: no se han encontrado enlaces adicionales relevantes; los resultados devueltos no guardan relacion con el modelo
