# NajafAli01/sentiment_results

## Resumen

`NajafAli01/sentiment_results` es un modelo de clasificacion de texto en ingles obtenido por ajuste fino (*fine-tuning*) de `distilbert-base-uncased` para analisis de sentimiento en tres clases: NEGATIVE (0), NEUTRAL (1) y POSITIVE (2). Lo desarrolla Najaf Ali, un autor individual sin historial publico de otros modelos, y fue publicado en Hugging Face bajo licencia Apache 2.0. Con 66.955.779 parametros reales (segun los pesos en safetensors), es un clasificador ligero derivado de la familia DistilBERT, pensado para etiquetar polaridad de reseñas, publicaciones en redes sociales y comentarios de usuarios.

El modelo se entrena sobre el dataset `syedkhalid0/Sentiment-Analysis`, con aproximadamente 105.000 muestras etiquetadas repartidas en 83.989 de entrenamiento, 10.499 de validacion y 10.499 de prueba. El procedimiento declarado es un ajuste fino estandar supervisado: 3 epocas, batch de 16 en entrenamiento y 64 en evaluacion, tasa de aprendizaje 5e-5 y longitud de secuencia maxima de 512 tokens con truncacion activada.

Su relevancia practica es la de un componente de bajo coste para pipelines de analitica de opinion: al ser un encoder de 67 millones de parametros, se puede ejecutar en CPU o en GPU de consumo con requisitos minimos, algo que no ocurre con los LLM generativos usados habitualmente para la misma tarea. Ahora bien, conviene ser cauto: el modelo acumula 0 descargas y 0 "likes", no tiene validacion de la comunidad y los unicos datos de evaluacion publicados en su *model-index* son ceros sin verificar, lo que sugiere que la evaluacion final no llego a completarse o no se registro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilacion de BERT-base), cabecera de clasificacion de secuencia con 3 etiquetas |
| Parametros totales | 66.955.779 (dato real de los pesos en safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (longitud maxima de secuencia declarada en entrenamiento; limite arquitectonico de DistilBERT por embeddings posicionales aprendidos) |
| Tipos de cuantizacion | No disponible (no se publican variantes cuantizadas ni ficheros GGUF/ONNX en el repositorio) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, libreria transformers |
| Modelo base | distilbert-base-uncased |
| Dataset de entrenamiento | syedkhalid0/Sentiment-Analysis (~105.000 muestras; 83.989 / 10.499 / 10.499) |
| Tarea (pipeline) | text-classification |
| Etiquetas | 0 = NEGATIVE, 1 = NEUTRAL, 2 = POSITIVE |
| Tamano del repositorio | 5,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-20 (fecha declarada en Hugging Face) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder del tipo DistilBERT: 6 capas, 12 cabezas de atencion, dimension oculta 768 y aproximadamente 66 millones de parametros, mas una cabecera lineal de clasificacion sobre el token `[CLS]` con 3 salidas. DistilBERT se obtuvo originalmente mediante destilacion del conocimiento de BERT-base, reduciendo el numero de capas a la mitad a cambio de una perdida de calidad acotada en tareas de comprension; aqui se reutiliza como punto de partida y se ajusta de forma supervisada sobre un corpus de sentimiento. No hay innovaciones tecnicas propias: no se emplean atencion lineal, decodificacion especulativa, mezcla de expertos ni tecnicas de RLHF/DPO, ya que no es un modelo generativo.

En cuanto al entrenamiento, la model card declara 3 epocas sobre 83.989 muestras, batch de 16 en entrenamiento y 64 en evaluacion, tasa de aprendizaje 5e-5 y tokenizador `distilbert-base-uncased` con truncacion a 512 tokens y *padding* dinamico durante el *collation*. El dataset contiene aproximadamente 105.000 textos, y la propia ficha advierte un sesgo de dominio hacia resenas de peliculas y texto general. No se documenta la composicion exacta del dataset ni el proceso de anotacion, ni se publican curvas de entrenamiento, matriz de confusion o informe de clasificacion por clase. El *model-index* declarado incluye accuracy, F1, precision y recall a 0.0 y marcados como no verificados.

## Capacidades

- Clasificacion de polaridad en tres clases (NEGATIVE, NEUTRAL, POSITIVE) para texto en ingles, con salida de probabilidades mediante `softmax` sobre los logits.
- Procesamiento por lotes (*batch prediction*) de multiples textos en una sola pasada, adecuado para trabajos de etiquetado masivo.
- Integracion directa con la API `pipeline("text-classification")` de transformers y con `AutoModelForSequenceClassification`.
- Compatibilidad declarada con endpoints de Hugging Face (`endpoints_compatible`) y con text-embeddings-inference segun las etiquetas del repositorio.
- Longitud de entrada de hasta 512 tokens, con truncacion automatica de textos mas largos.
- No soporta *tool calling*, ni uso como agente, ni razonamiento multi-paso, ni generacion de texto: no es un modelo generativo.
- No dispone de modo "thinking", vision, audio ni deteccion de emociones (solo polaridad, no categorias como alegria, ira o tristeza).
- No hay capacidades multilingues: el autor indica explicitamente que no esta validado para texto no ingles.

## Casos de uso

- Monitorizacion de redes sociales: clasificar en lote miles de publicaciones o respuestas para construir una serie temporal de polaridad por marca o producto; el modelo es lo bastante ligero para ejecutarse en CPU sobre volumenes altos sin coste de GPU.
- Analisis de resenas de producto: etiquetar comentarios de e-commerce en positivos, neutros y negativos para alimentar paneles de satisfaccion o para enrutar automaticamente las resenas negativas al equipo de calidad.
- Priorizacion de tickets de soporte: aplicar el modelo a la primera linea de cada ticket y usar la clase NEGATIVE como senal de urgencia, dejando la revision humana para los casos de baja confianza (por ejemplo, probabilidad maxima inferior a 0,6).
- Moderacion de contenido generado por usuarios: filtrar comentarios con polaridad marcadamente negativa para revision manual, sin recurrir a un LLM generativo ni enviar el texto a servicios externos si se despliega en local.
- Investigacion de mercado y encuestas: clasificar respuestas abiertas de formularios y agregar la distribucion de polaridad por segmento de clientes, con un modelo de 67 M de parametros que cabe en cualquier instancia pequena.
- Analitica de critica cultural: agregar sentimiento de resenas de cine, series o libros (dominio hacia el que el dataset apunta segun la propia ficha), por ejemplo para comparar la recepcion de titulos en un catalogo.
- Preetiquetado para anotacion humana: usar el modelo como primer pasador en un flujo de etiquetado activo, reduciendo el trabajo manual y dejando que los anotadores corrijan solo los casos ambiguos, en especial la frontera entre NEUTRAL y polaridades leves.
- Deteccion de deriva de opinion: ejecutar el clasificador periodicamente sobre menciones de una entidad y activar alertas cuando la proporcion de negativos supere un umbral configurable.

## Benchmarks y rendimiento

Los unicos datos publicados son los del *model-index* de la model card. Todos los valores figuran como 0.0 y con `verified: false`, lo que indica que no hubo evaluacion registrada o que esta no se completo correctamente. Se reproducen tal cual:

| Tarea | Dataset | Split | Metrica | Valor | Verificado |
|---|---|---|---|---|---|
| Text classification / sentiment analysis | syedkhalid0/Sentiment-Analysis | test | Accuracy | 0.0 | No |
| Text classification / sentiment analysis | syedkhalid0/Sentiment-Analysis | test | F1 Score | 0.0 | No |
| Text classification / sentiment analysis | syedkhalid0/Sentiment-Analysis | test | Precision | 0.0 | No |
| Text classification / sentiment analysis | syedkhalid0/Sentiment-Analysis | test | Recall | 0.0 | No |

No se han publicado resultados de benchmarks adicionales (MMLU, GLUE, SST-2, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,27 GB en fp32 (66,96 M de parametros x 4 bytes) y unos 0,13 GB en fp16/bf16, mas el espacio de activaciones, que es despreciable para secuencias de 512 tokens y lotes moderados.
- Inferencia en CPU: totalmente viable; es un modelo de 67 M de parametros y se puede servir sin GPU para cargas de trabajo por lotes.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria libre, incluidas GTX 1050 Ti, GTX 1650, RTX 3050 y superiores. Modelos como A100, H100 o RTX 4090 estan sobredimensionados para este clasificador.
- Cabe sin problema en GPU de consumo: si, en practicamente todas las GPU modernas, e incluso en dispositivos de borde si se exporta a ONNX Runtime.
- Opciones de despliegue: `transformers` con `pipeline` o `AutoModelForSequenceClassification`, TorchScript, exportacion a ONNX Runtime, Hugging Face Inference Endpoints (la etiqueta `endpoints_compatible` esta presente) y text-embeddings-inference segun las etiquetas del repo. vLLM esta orientado a generacion autoregresiva y no es la via natural para un clasificador; llama.cpp requeriria una conversion previa a GGUF que no esta publicada.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia ni de textos por segundo en la informacion proporcionada.
- Nota sobre el repositorio: el repo ocupa 5,1 GB pese a que los pesos son de unos 268 MB en fp32, lo que sugiere que incluye copias adicionales, estados de optimizador o varios checkpoints de entrenamiento. Conviene descargar solo los ficheros de safetensors necesarios.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NajafAli01/sentiment_results | 66,96 M | 512 tokens | 3 (negativo, neutro, positivo) | Apache 2.0 | Hugging Face, 0 descargas, sin validacion comunitaria |
| distilbert-base-uncased-finetuned-sst-2-english | ~67 M | 512 tokens | 2 (positivo, negativo) | Apache 2.0 | Hugging Face, ampliamente usado y validado |
| cardiffnlp/twitter-roberta-base-sentiment-latest | ~125 M | 512 tokens | 3 (negativo, neutro, positivo) | Apache 2.0 | Hugging Face, orientado a redes sociales |
| bert-base-uncased (ajustado para clasificacion) | ~110 M | 512 tokens | Configurable | Apache 2.0 | Hugging Face, requiere ajuste fino propio |

No se dispone de datos de rendimiento comparativos verificables en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, numero de clases, licencia y disponibilidad. En igualdad de condiciones, los modelos de la familia RoBERTa suelen requerir mas recursos (aproximadamente el doble de parametros) y los clasicos de dos clases como SST-2 no cubren la categoria neutra.

## Limitaciones y advertencias

- Sesgo de dominio: el entrenamiento se apoya en resenas de peliculas y texto general, segun reconoce el propio autor; el rendimiento puede degradarse en dominios medico, legal, tecnico o financiero.
- Evaluacion no verificada: las cuatro metricas del *model-index* valen 0.0 y no estan verificadas. No hay evidencia publicada de la calidad real del modelo, ni matriz de confusion, ni resultados por clase.
- Sin validacion de la comunidad: 0 descargas y 0 "likes" en el momento de la consulta, lo que implica ausencia de pruebas independientes en produccion.
- Ambiguedad de la clase NEUTRAL: la frontera entre neutro y polaridad leve es difusa, algo que el propio autor senala; es previsible una confusion notable en ese limite.
- Sarcasmo e ironia: el modelo puede clasificar mal frases como "Oh great, another delay!"; el autor lo advierte de forma explicita.
- Textos muy cortos: entradas del tipo "meh" u "ok" pueden recibir clasificaciones con baja confianza.
- Truncacion a 512 tokens: los documentos mas largos pierden informacion a partir de ese limite; para textos extensos hay que trocear y agregar resultados.
- Solo ingles: no esta validado para otros idiomas y las etiquetas del repositorio declaran unicamente `en`.
- No es deteccion de emociones: solo predice polaridad, no categorias como ira, alegria o tristeza.
- Usos fuera de alcance declarados por el autor: no debe emplearse para consejo clinico, legal o financiero, ni para decisiones de alto impacto sin revision humana.
- Licencia Apache 2.0: permite uso comercial y modificacion con obligacion de conservar avisos de copyright y licencia, pero no implica ninguna garantia por parte del autor.
- Plantillas sin completar: la model card conserva marcadores como `YOUR_USERNAME/YOUR_MODEL_NAME` en los ejemplos de codigo, lo que indica que el documento no se reviso a fondo antes de publicarse. Hay que sustituir el identificador real al integrarlo.
- Fecha de publicacion inusual: el repositorio declara creacion el 2026-09-20, una fecha futura respecto a la mayoria de referencias, lo que puede indicar metadatos inconsistentes.
- Recomendacion general: usar siempre con revision humana en aplicaciones criticas y calibrar el umbral de confianza sobre datos propios antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NajafAli01/sentiment_results
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Dataset de entrenamiento: https://huggingface.co/datasets/syedkhalid0/Sentiment-Analysis
- Repositorio del autor: https://github.com/Najaf-Ali12/LLM-Hugging-Face
- Demo en Streamlit: https://complete-nlp-projects-zxepdqlod8vn9mpmjk9q9q.streamlit.app/
- Cuaderno de entrenamiento en Google Colab: https://colab.research.google.com/github/Najaf-Ali12/LLM-Hugging-Face/blob/main/Finetuning_a_sentiment_analysis_model.ipynb
- Resultados de busqueda web: no se encontraron enlaces relevantes al modelo; los resultados devueltos correspondian a documentacion de YouTube y a listados de bicicletas de segunda mano, sin relacion con este modelo.
