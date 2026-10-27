# jainarika/sentiment-lstm

## Resumen

`sentiment-lstm` es un clasificador binario de sentimiento (positivo / negativo) para reseñas de películas, publicado en HuggingFace por el usuario `jainarika` bajo licencia MIT. No es un modelo generativo ni un LLM: es una red neuronal recurrente de tamaño muy reducido entrenada desde cero con Keras sobre el conjunto de datos IMDB, con el objetivo concreto de asignar una probabilidad de sentimiento a un texto de entrada.

La arquitectura descrita en la model card es una pila secuencial: una capa de embedding con vocabulario de 20.000 palabras y padding enmascarado, seguida de `SpatialDropout`, dos capas LSTM bidireccionales apiladas, una capa densa y una activación sigmoide. Las reseñas se limpian, se tokenizan y se rellenan (padding) hasta 400 tokens antes de entrar al modelo. El autor reporta una única métrica: 66,80 % de accuracy en el conjunto de test, un valor bajo para la tarea, ya que los baselines clásicos sobre IMDB suelen superar holgadamente ese rango.

Su relevancia práctica es limitada y muy acotada: sirve como ejemplo didáctico de pipeline de NLP con Keras, como baseline interno para comparaciones o como clasificador ligero de bajo coste en dominios muy próximos al cine. El repositorio es prácticamente vacío (0,0 GB, 0 descargas, 0 likes) y no incluye pesos en formatos estándar de inferencia, ni ficha de pipeline, ni idiomas declarados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal recurrente: embedding + SpatialDropout + 2 capas BiLSTM apiladas + Dense + sigmoide |
| Parametros totales | No disponible (el autor no publica el recuento; estimación orientativa: ~3-10 M según dimensión de embedding y unidades LSTM, que no se especifican) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 400 tokens (longitud fija de padding de entrada) |
| Tipos de cuantizacion | No disponible (no se publican pesos cuantizados; el formato `.keras` no está pensado para cuantización de inferencia estándar) |
| Idiomas soportados | No disponible (el autor no declara idiomas; el entrenamiento con IMDB implica inglés) |
| Licencia | MIT |
| Formato de pesos | `.keras` (modelo Keras nativo) y `word_index.pkl` (vocabulario de tokenización) |

## Arquitectura y entrenamiento

La arquitectura es una red recurrente clásica, no un transformer. La secuencia de capas es: embedding con vocabulario de 20.000 palabras y máscara sobre el padding, `SpatialDropout` (dropout aplicado sobre mapas de embedding completos, habitual para regularizar representaciones en NLP), dos capas `Bidirectional(LSTM)` apiladas, una capa densa y una salida sigmoide para clasificación binaria. La entrada es texto limpiado, tokenizado y truncado o rellenado a 400 tokens.

El único dato de entrenamiento disponible es el conjunto de datos `stanfordnlp/imdb` (reseñas de cine en inglés con etiquetas binarias de polaridad). No se especifica el número de tokens de entrenamiento, la dimensión de embedding, el número de unidades por capa LSTM, el tamaño de batch, el optimizador, la función de pérdida, el número de épocas ni si se aplicó algún ajuste fino posterior. Tampoco se documenta ninguna innovación técnica (atención, decodificación especulativa, capas lineales de atención); es una BiLSTM convencional. El repositorio incluye un fichero `app.log` con el registro de entrenamiento, que no se ha publicado en el texto de la model card.

## Capacidades

- Clasificación binaria de sentimiento (positivo / negativo) sobre texto en inglés de reseñas de películas.
- Salida de una probabilidad continua vía sigmoide, reinterpretable como puntuación de confianza (sin calibración publicada).
- Procesamiento de entradas de hasta 400 tokens, con padding enmascarado.
- Tokenización mediante un vocabulario fijo de 20.000 palabras (`word_index.pkl`); las palabras fuera de vocabulario se mapean al token OOV correspondiente.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agente.
- No es multilingüe: no hay evidencia de entrenamiento fuera del inglés.
- No dispone de modo "thinking", visión, audio ni generación de texto libre.

## Casos de uso

- Baseline de investigación en análisis de sentimiento: sirve como punto de comparación rápido y reproducible frente a modelos transformer sobre IMDB, útil en docencia o en trabajos que necesiten una referencia recurrente de bajo coste computacional.
- Clasificación de reseñas de cine en una plataforma de catálogo: el modelo puede etiquetar automáticamente críticas de usuarios en positivas o negativas, con la advertencia de que su accuracy reportada (66,80 %) implica un volumen relevante de errores y requeriría revisión humana.
- Filtrado previo en pipelines de moderación: al ser un modelo minúsculo, puede ejecutarse en CPU como primera pasada para descartar reseñas claramente negativas antes de un análisis más caro; su uso como filtro de alta confianza (umbral alto sobre la probabilidad) es más razonable que como clasificador final.
- Etiquetado asistido de datos para un futuro reentrenamiento: generar etiquetas preliminares sobre un corpus propio de reseñas de cine y corregirlas manualmente, aprovechando que el modelo es rápido y no requiere GPU.
- Ejercicio práctico de MLOps o docencia: empaquetar el modelo `.keras` y el `word_index.pkl` en un servicio HTTP mínimo para demostrar el ciclo completo de despliegue de un modelo de NLP.
- Prueba de concepto en aplicaciones de streaming o videojuegos con reseñas textuales: estimar de forma agregada la polaridad de comentarios de usuarios sobre estrenos o lanzamientos, siempre como señal aproximada.
- Análisis exploratorio en foros de cine: agrupar hilos o comentarios por polaridad estimada para priorizar la lectura manual de los hilos más negativos.

## Benchmarks y rendimiento

El autor únicamente publica un resultado: accuracy de 66,80 % en el conjunto de test de IMDB. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks en la información disponible, y no se detalla la partición exacta de test utilizada ni si hubo ajuste de hiperparámetros sobre validación.

| Benchmark | Resultado | Notas |
|---|---|---|
| IMDB (test accuracy) | 66,80 % | Único dato publicado por el autor; partición de test no especificada |
| MMLU | No disponible | No aplica a un clasificador de sentimiento |
| HumanEval | No disponible | No aplica (sin capacidad de generación de código) |
| GSM8K | No disponible | No aplica (sin razonamiento matemático) |
| F1 / precisión / recall por clase | No disponible | El autor no reporta métricas desagregadas |

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula; el modelo cabe holgadamente en menos de 1 GB. Con parámetros en el rango de millones, el peso de los pesos en float32 sería del orden de decenas de MB (no confirmado al no publicarse el recuento exacto).
- GPU recomendadas: ninguna necesaria. Cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) es sobredimensionada para este modelo; incluso una CPU moderna es suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU consumer e incluso en dispositivos de borde, siempre que se disponga de un runtime compatible con Keras/TensorFlow.
- Opciones de despliegue: TensorFlow Serving, Keras nativo en un servicio FastAPI/Flask, Triton Inference Server con backend de TensorFlow, o exportación a ONNX para usar con ONNX Runtime. No aplica llama.cpp, Ollama ni vLLM, ya que el modelo no está en formato GGUF ni es un transformer autorregresivo.
- Latencia y throughput estimados: no disponibles. Por el tamaño y la secuencia fija de 400 tokens, se espera una latencia de decenas de milisegundos en CPU y de pocos milisegundos en GPU, pero se trata de una estimación no medida ni publicada por el autor.
- Requisito adicional relevante: es imprescindible cargar el `word_index.pkl` junto al modelo para replicar el preprocesado exacto (limpieza, tokenización y padding a 400); sin él, las predicciones no son reproducibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Accuracy reportada | Disponibilidad |
|---|---|---|---|---|---|---|
| jainarika/sentiment-lstm | BiLSTM (Keras) | No disponible (~3-10 M estimados) | 400 tokens fijos | MIT | 66,80 % en IMDB | Repositorio de 0,0 GB, 0 descargas |
| distilbert-base-uncased-finetuned-sst-2-english | Transformer encoder destilado | ~67 M | ~512 tokens | Apache 2.0 | No disponible en la información proporcionada | Ampliamente disponible en HuggingFace |
| cardiffnlp/twitter-roberta-base-sentiment-latest | Transformer encoder (RoBERTa base) | ~125 M | ~512 tokens | No disponible en la información proporcionada | No disponible en la información proporcionada | Ampliamente disponible en HuggingFace |
| Baseline TF-IDF + regresión logística | Modelo lineal clásico | No disponible | No aplica | No aplica | No disponible en la información proporcionada | Implementable con scikit-learn |

Los datos de parámetros y contexto de los modelos comparados son valores de referencia generales de esas arquitecturas; sus métricas concretas no se han verificado en la información proporcionada. En cualquier caso, la comparación cualitativa es clara: las alternativas basadas en transformer ofrecen contexto más largo, mejor tratamiento de vocabulario abierto (tokenización por subpalabras frente al vocabulario cerrado de 20.000 palabras) y, previsiblemente, mayor precisión, a cambio de un coste de inferencia mayor.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. Al entrenarse solo con reseñas de cine en inglés, el modelo puede aprender correlaciones espurias del dominio (longitud de la reseña, estilo de escritura) y no hay evaluación de sesgos demográficos ni de género.
- Riesgo de alucinación: no aplica en sentido estricto, pero sí riesgo de clasificación errónea con alta confianza; la accuracy de 66,80 % es baja para una tarea binaria y sugiere un margen de error amplio, especialmente en textos ambiguos.
- Limitaciones de dominio: el propio autor advierte que el modelo solo se ha entrenado con reseñas de cine y puede funcionar mal en otros dominios, en sarcasmo o en textos con sentimiento mixto.
- Limitaciones de idioma: no hay idiomas declarados en la ficha y el conjunto de datos es en inglés; su uso en castellano no está validado y previsiblemente será deficiente.
- Limitaciones de contexto: la entrada se trunca o rellena a 400 tokens; reseñas más largas pierden información del final y reseñas muy cortas se completan con padding (enmascarado, pero con posible impacto en la representación).
- Vocabulario cerrado de 20.000 palabras: cualquier término fuera de ese vocabulario se mapea a OOV, lo que degrada el rendimiento en jerga, nombres propios, erratas o vocabulario moderno.
- Repositorio prácticamente vacío: 0,0 GB de tamaño y 0 descargas hacen dudar de que `best_model.keras` y `word_index.pkl` estén realmente disponibles; conviene verificar la descarga antes de planificar cualquier integración. La fecha de creación registrada (2026-10-27) es posterior a la fecha actual, lo que apunta a metadatos anómalos.
- Sin información de preprocesado: la model card indica "limpieza, tokenización y padding" pero no detalla las reglas de limpieza, por lo que replicar exactamente el pipeline de inferencia requiere inspeccionar el código o el `word_index.pkl`.
- Restricciones de licencia: MIT permite uso comercial y modificación con atribución y sin garantía; no obstante, la licencia del modelo no cubre los derechos sobre los datos de IMDB, que conviene revisar si se redistribuye el modelo entrenado.
- Idoneidad para producción: baja en su estado actual. No recomendable como clasificador principal sin reentrenamiento, validación en el dominio objetivo y métricas desagregadas (F1, precisión y recall por clase, calibración).

## Enlaces

- [Modelo en HuggingFace: jainarika/sentiment-lstm](https://huggingface.co/jainarika/sentiment-lstm)
- [Conjunto de datos stanfordnlp/imdb en HuggingFace](https://huggingface.co/datasets/stanfordnlp/imdb)
- No se han encontrado en la búsqueda web papers, blogs, repositorios de código ni demos adicionales asociados a este modelo.
