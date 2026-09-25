# shalev396/fake-news-detector

## Resumen

shalev396/fake-news-detector es un clasificador binario de texto que estima la probabilidad de que una noticia en inglés sea falsa o real. Lo desarrolla el usuario shalev396 dentro del proyecto ml-lab y se publica en Hugging Face bajo licencia MIT. El modelo recibe como entrada una cadena de texto con el titular en la primera línea y el cuerpo de la noticia a continuación (también funciona solo con el cuerpo) y devuelve un diccionario `{"fake": p, "real": 1 - p}`, donde `p` es la salida sigmoide y la etiqueta es `fake` cuando `p >= 0,5`.

Técnicamente es una red recurrente bidireccional de tamaño muy reducido: un embedding de 20.000 tokens con dimensión 100, una capa `Bidirectional(LSTM(64))`, dropout de 0,3 y dos capas densas (32 unidades con ReLU y 1 unidad con sigmoide), con un total de 2.088.641 parámetros en float32. La entrada se limpia y se vectoriza con un vocabulario de 20.000 tokens, con padding o truncado a 300 tokens, lo que define su ventana de contexto efectiva.

Su relevancia es la de un baseline ligero y reproducible: se entrenó en CPU en unos 8 minutos, se despliega en un Space de Gradio con runtime `cpu-basic` y sirve como punto de comparación barato frente a detectores basados en transformers. El autor documenta explícitamente la eliminación de dos atajos del dataset (las columnas `subject` y `date`, y el dateline `CITY (Reuters) -` junto con el token `reuters`) para forzar al modelo a leer el contenido. Las métricas declaradas (accuracy 0,985 en el split de test) no están verificadas por Hugging Face.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiLSTM: `Embedding(20.000, 100, mask_zero)` -> `Bidirectional(LSTM(64))` -> `Dropout(0,3)` -> `Dense(32, relu)` -> `Dense(1, sigmoid)` |
| Parametros totales | 2.088.641 (2,09 M) en float32 |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 300 tokens (padding o truncado de la secuencia de entrada); vocabulario de 20.000 tokens (indice 0 = padding, 1 = desconocido) |
| Tipos de cuantizacion | No disponible; solo se publican pesos float32, sin versiones cuantizadas (GGUF, int8, etc.) |
| Idiomas soportados | Ingles unicamente. Entrenado con noticias en ingles y preprocesado con las 198 stopwords de NLTK en ingles; los metadatos de Hugging Face no declaran idiomas |
| Licencia | MIT |
| Formato de pesos | Keras 3.15 (`model.keras`), mas `vocab.json`, `stopwords.json` y `model.py`; tensorflow/keras como libreria |

## Arquitectura y entrenamiento

El modelo es una red neuronal recurrente clásica, no un transformer. Sobre la secuencia de entrada se aplica un embedding entrenado desde cero con 20.000 entradas y dimensión 100, seguido de una LSTM bidireccional de 64 unidades, un dropout de 0,3, una capa densa de 32 unidades con activación ReLU y una capa de salida de una unidad con sigmoide para clasificación binaria. El preprocesado (`model.Predictor.clean`) concatena titular y cuerpo, elimina el dateline inicial `CITY (Reuters) -`, pasa a minúsculas, borra URLs y todos los tokens `reuters`, conserva solo letras, descarta las 198 stopwords inglesas de NLTK y las palabras de una letra (sin stemming) y vectoriza con un `TextVectorization` reconstruido desde `vocab.json`. Los textos con menos de 3 tokens tras la limpieza se rechazan con `ValueError`.

Los datos provienen del dataset ISOT Fake and Real News (Kaggle, `clmentbisaillon/fake-and-real-news-dataset`; espejo en Hugging Face `GonzaloA/fake_news`). Tras eliminar pares título+texto duplicados se tomó una muestra equilibrada de 20.000 artículos (10.000 por clase; 19.998 tras descartar dos filas casi vacías) y se dividió de forma estratificada en 70 % entrenamiento / 15 % validación / 15 % test (14.448 / 2.550 / 3.000 artículos). La receta es Adam con lr 1e-3, entropía cruzada binaria, batch de 64, hasta 4 épocas con early stopping sobre la pérdida de validación (paciencia 2) y restauración de los mejores pesos; el vocabulario del vectorizador se construyó solo con el split de entrenamiento. Se entrenaron cuatro variantes con ajustes idénticos (SimpleRNN, LSTM, GRU y BiLSTM) y se desplegó la de mayor accuracy de validación, la BiLSTM, que necesitó 3 épocas. Todo el entrenamiento de las cuatro variantes se hizo en CPU y tardó unos 8 minutos. Los pesos publicados proceden de una versión anterior del código (misma pipeline y arquitectura, entrenada el 2026-08-01), reguardados en formato Keras 3.15 y reevaluados sobre el split de test reconstruido; no se documenta ningún uso de RLHF, DPO ni ajuste por preferencias.

## Capacidades

- Clasificación binaria de texto en inglés: devuelve `{"fake": p, "real": 1 - p}` con la etiqueta `fake` si `p >= 0,5`.
- Entrada flexible: acepta titular y cuerpo en un solo string (titular en la primera línea) o solo el cuerpo del artículo.
- Limpieza y normalización integradas en el propio repositorio (`model.Predictor.clean`), con el mismo pipeline usado en entrenamiento para evitar desajustes entre entrenamiento e inferencia.
- Salida probabilística continua (sigmoide), utilizable como puntuación de riesgo y no solo como etiqueta dura.
- Despliegue como Inference Endpoint mediante `handler.py`: acepta `{"inputs": "<titular>\n\n<cuerpo>"}`, `{"inputs": {"title": ..., "text": ...}}` o una lista de cualquiera de las dos formas.
- API en el Space de Gradio (`POST /gradio_api/call/predict`).
- Gestión de errores de entrada: rechaza textos con menos de 3 tokens tras la limpieza.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso, ni cadenas de herramientas.
- No genera texto, no hace resumen, no traduce y no procesa imágenes ni audio.
- No es multilingüe: solo inglés.

## Casos de uso

- Triaje editorial en medios digitales: el modelo puede etiquetar automáticamente miles de piezas en inglés en una fase previa de revisión, priorizando para verificación humana aquellas con `p` alta. Su coste computacional (2,09 M de parámetros, ejecución en CPU) permite procesar lotes grandes sin GPU.
- Moderación de contenido en plataformas con contenido generado por usuarios: con titulares y cuerpos de noticias en inglés, se puede usar como señal de riesgo dentro de un sistema de moderación, combinada con otras señales, gracias a que la inferencia se ejecuta en el runtime `cpu-basic` del Space.
- Prefiltro en pipelines de verificación periodística: situado antes de un verificador humano o de un modelo mayor basado en transformer, reduce el volumen de textos que llegan a las etapas caras del pipeline; su salida probabilística permite fijar umbrales conservadores.
- Enriquecimiento de corpus de investigación: etiquetado masivo de colecciones históricas de noticias en inglés (2016-2017 y dominios próximos) para estudios sobre desinformación, con la ventaja de ser reproducible en minutos y no depender de APIs externas.
- Baseline ligero para comparativas académicas: al ser una BiLSTM de 2,09 M de parámetros con pipeline documentado y código abierto, sirve como referencia mínima frente a detectores basados en BERT o DistilRoBERTa en experimentos de detección de noticias falsas.
- Filtro previo en sistemas RAG o alertas de monitorización de medios: descartar o marcar fuentes sospechosas en inglés antes de indexarlas o de generar resúmenes, evitando que contenido etiquetado como falso entre en la base de conocimiento.
- Demostración educativa de alfabetización mediática: el Space de Gradio permite a cualquier usuario pegar un titular y un cuerpo de noticia y ver la probabilidad estimada, útil en talleres y material docente sobre desinformación.
- Detección de baja latencia en entornos sin GPU: al ocupar unos pocos megabytes, puede embeberse en servicios con restricciones fuertes de memoria o en portátiles y dispositivos de borde para clasificar texto en inglés.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card (todos con `verified: false`), sobre el split de test reconstruido de 3.000 artículos del dataset ISOT Fake and Real News (Kaggle).

| Metrica | Valor |
|---|---|
| Accuracy | 0,985 |
| F1 | 0,984915 |
| Precision | 0,99056 |
| Recall | 0,979333 |
| ROC-AUC | 0,998659 |

La model card incluye además una comparativa interna de cuatro variantes recurrentes (SimpleRNN, LSTM, GRU y BiLSTM) entrenadas con los mismos ajustes, ordenadas por accuracy de validación. En la información disponible solo está completa la fila de la variante desplegada (BiLSTM: 2.088.641 parámetros, 3 épocas, accuracy de validación 0,9914, accuracy de test 0,9850, F1 de test 0,9849, precision de test 0,9906, recall de test 0,9793 y ROC-AUC de test 0,9987); el resto de la tabla aparece truncada en los datos proporcionados, por lo que sus cifras constan como no disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica realmente; los pesos son 2.088.641 parámetros float32, aproximadamente 8,35 MB, más el vocabulario y los artefactos de preprocesado. Cabe holgadamente en memoria del sistema y en cualquier GPU.
- GPU recomendadas: cualquiera; A100, H100, RTX 4090 o similares están sobredimensionadas para este modelo. Está pensado para CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo e incluso en iGPU o en CPU. El Space oficial se ejecuta con runtime `cpu-basic`.
- Opciones de despliegue: TensorFlow/Keras nativo mediante `model.load()` y `model.py`; Inference Endpoints de Hugging Face usando el `handler.py` incluido; Space de Gradio con `POST /gradio_api/call/predict`. No hay soporte declarado ni artefactos para vLLM, llama.cpp, Ollama ni TGI, ya que no se publican pesos en GGUF ni en formato transformers.
- Latencia y throughput estimados: no disponibles. No se publican mediciones. La única referencia de coste es el entrenamiento completo de cuatro variantes en CPU en unos 8 minutos; para inferencia, la arquitectura (secuencia de 300 tokens con una LSTM de 64 unidades y 2,09 M de parámetros) apunta a latencias del orden de milisegundos por petición en CPU, pero no hay cifras oficiales que lo confirmen.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Rendimiento declarado |
|---|---|---|---|---|---|
| shalev396/fake-news-detector | BiLSTM + embedding desde cero | 2,09 M | 300 tokens | MIT | Accuracy 0,985, F1 0,9849 y ROC-AUC 0,9987 en ISOT (test, no verificado) |
| Variantes LSTM, GRU y SimpleRNN del mismo repo ml-lab | Recurrente (mismos embedding, head y receta) | No disponible; la fila del LSTM aparece truncada en los datos disponibles | 300 tokens | MIT | No disponible; la tabla comparativa de la model card está truncada |
| Detectores basados en BERT o DistilRoBERTa (por ejemplo, los proyectos Shabar-Shariff/fake-news-detector y el Space DevNumb/fakeNewsDetector) | Transformer encoder preentrenado con ajuste fino | No disponible | No disponible | No disponible | No disponible |

No se dispone de cifras comparables publicadas para alternativas de la misma categoría en la información recogida; los resultados de los detectores basados en transformers citados en la búsqueda web no incluyen métricas ni especificaciones verificables, por lo que la comparación cuantitativa queda pendiente.

## Limitaciones y advertencias

- El modelo clasifica según el estilo y la redacción del texto, no verifica hechos ni consulta fuentes. Un artículo real con un registro atípico puede etiquetarse como falso y uno falso que imite el estilo de una agencia puede pasar como real.
- Riesgo de desviación de dominio: el entrenamiento usa ISOT, un corpus de 2016-2017 con noticias de Reuters y de medios no Reuters. El rendimiento en noticias actuales, en otros medios, en redes sociales, en columnas de opinión o en sátira puede degradarse de forma notable y no está medido.
- El autor documenta la eliminación de dos atajos del dataset (las columnas `subject` y `date`, y el dateline `CITY (Reuters) -` junto con todos los tokens `reuters`), pero pueden persistir señales estilísticas correlacionadas con la etiqueta dentro del corpus original. El 0,985 de accuracy debe interpretarse dentro de ese dominio, no como capacidad general de detección de desinformación.
- Solo inglés: el preprocesado usa stopwords de NLTK en inglés y el vocabulario se construyó con noticias en inglés. No hay soporte multilingüe ni evaluación en otros idiomas.
- Truncado a 300 tokens: los artículos largos pierden la parte final del contenido, que puede ser relevante para la decisión.
- Entradas demasiado cortas: los textos con menos de 3 tokens tras la limpieza se rechazan con `ValueError`, lo que obliga a gestionar ese caso en producción.
- Métricas no verificadas: el campo `verified` es `false` en todos los resultados, y las cifras proceden de una reevaluación sobre un split de test reconstruido, no de un benchmark externo independiente.
- Muestreo equilibrado: el entrenamiento usó 10.000 artículos por clase. En distribuciones reales fuertemente desequilibradas, la precisión y el recall pueden diferir de los reportados.
- Sin tarjeta de datos ni auditoría de sesgos: no se documenta el comportamiento por medio, temática, país o variedad dialectal, ni se publica calibración de las probabilidades, por lo que los umbrales de decisión deberían ajustarse con datos propios.
- Licencia MIT: permite uso comercial y modificación sin restricciones, pero se ofrece sin garantías. No exime de responsabilidad al integrador.
- Uso responsable: la salida no debe presentarse como un veredicto de veracidad. Un falso positivo puede contribuir a desacreditar contenido legítimo; conviene usarlo como señal dentro de un flujo con revisión humana.
- El Space gratuito se ejecuta con runtime `cpu-basic`, sin garantías de disponibilidad ni SLA para uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shalev396/fake-news-detector
- Space de demostración (API Gradio): https://huggingface.co/spaces/shalev396/fake-news-detector
- Repositorio del proyecto en GitHub: https://github.com/shalev396/ml-lab/tree/main/fake-news-detector
- Código de entrenamiento: https://github.com/shalev396/ml-lab/tree/main/fake-news-detector/training
- Notebook de Colab: https://colab.research.google.com/github/shalev396/ml-lab/blob/main/fake-news-detector/training/notebook.ipynb
- Dataset ISOT Fake and Real News (Kaggle): https://www.kaggle.com/datasets/clmentbisaillon/fake-and-real-news-dataset
- Espejo del dataset en Hugging Face: https://huggingface.co/datasets/GonzaloA/fake_news
- Proyecto de detección de noticias falsas (GitHub, kapilsinghnegi): https://github.com/kapilsinghnegi/Fake-News-Detection
- Detector con BERT (GitHub, Shabar-Shariff): https://github.com/Shabar-Shariff/fake-news-detector
- Fake News Patterns Detector (MIT): http://fakenews.mit.edu/
- Space alternativo con DistilRoBERTa (DevNumb): https://huggingface.co/spaces/DevNumb/fakeNewsDetector
- Herramienta comercial de contraste (BiasBreak): https://biasbreak.com/fake-news-detector/
