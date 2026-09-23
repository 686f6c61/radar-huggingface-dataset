# Rakshi1/fake-news-detector

## Resumen

Rakshi1/fake-news-detector es un clasificador binario de texto desarrollado por el usuario Rakshi1 que determina si un articulo periodistico es falso (etiqueta 0) o real (etiqueta 1) a partir de su titular y su cuerpo. No es un modelo de lenguaje generativo, sino un modelo discriminativo entrenado especificamente para la tarea, construido con Keras y TensorFlow sobre una red recurrente LSTM. Resuelve un problema acotado y bien definido: el triaje automatico de contenido informativo en ingles, con una ventana de entrada fija de 300 tokens.

Tecnicamente es un modelo muy ligero (embedding de 128 dimensiones, una unica capa LSTM de 64 unidades y una capa densa de salida con activacion sigmoide), entrenado sobre el dataset ISOT Fake and Real News. El autor declara un 91,83 % de exactitud, un 94,04 % de precision y un 91,62 % de F1 sobre una particion de test estratificada del 20 %. Es relevante ahora como ejemplo de pipeline completo y reproducible de clasificacion de texto con deep learning clasico (no transformers), desplegado ademas como aplicacion web interactiva en Hugging Face Spaces.

El repositorio es pequeno (0,0 GB declarados), no registra descargas ni likes en el momento de la consulta y su licencia MIT permite uso comercial. Es, por tanto, un punto de partida util para prototipos y proyectos educativos, no un sistema de verificacion factual listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal recurrente (LSTM) sobre embeddings, tipo encoder discriminativo. Secuencia: embedding -> LSTM -> dropout -> densa con sigmoide |
| Parametros totales | no disponible (el autor no publica la cifra; la arquitectura declarada, embedding de 20.000 x 128 y LSTM de 64 unidades, implica del orden de unos pocos millones de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 300 tokens (longitud de secuencia fija usada en el entrenamiento) |
| Tipos de cuantizacion | no disponible (no se documenta ningun esquema de cuantizacion) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | Keras nativo (models/fake_news_lstm.keras) mas tokenizer serializado en pickle (models/tokenizer.pickle) |

## Arquitectura y entrenamiento

La red sigue una arquitectura secuencial clasica de clasificacion de texto. La entrada combina titular y cuerpo del articulo, se normaliza (conversion a minusculas, eliminacion de simbolos y normalizacion de espacios en blanco) y se tokeniza con un vocabulario de 20.000 terminos. Las secuencias se recortan o rellenan a 300 tokens. Despues, una capa de embedding de 128 dimensiones con `mask_zero=True` alimenta una LSTM de 64 unidades con `return_sequences=False`, seguida de un dropout del 0,3 y una capa densa de una sola unidad con activacion sigmoide. El umbral de decision es 0,5: por debajo se etiqueta como noticia falsa y a partir de ahi como real. La salida del sigmoide se reutiliza como porcentaje de confianza en la aplicacion de demostracion.

El entrenamiento es un aprendizaje supervisado binario sobre el ISOT Fake and Real News Dataset, con una particion de test estratificada del 20 %. No se documenta en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset, el numero de epocas ni si se aplicaron tecnicas de ajuste adicional como RLHF o DPO (no aplicables en un clasificador de este tipo). Tampoco hay innovaciones tecnicas destacables: es una implementacion estandar y didactica. La unica evidencia de evaluacion complementaria es la matriz de confusion declarada: 283 de 300 noticias falsas detectadas correctamente (94,3 %) y 268 de 300 noticias reales detectadas correctamente (89,3 %).

## Capacidades

- Clasificacion binaria de texto en ingles: devuelve la etiqueta "real" o "falsa" junto con un porcentaje de confianza derivado de la salida sigmoide.
- Procesamiento conjunto de titular y cuerpo del articulo, con preprocesado integrado (minusculas, eliminacion de simbolos, normalizacion de espacios).
- Entrada de hasta 300 tokens por articulo; el texto adicional se trunca.
- Reconocimiento de patrones estilisticos y de redaccion asociados a cada clase en el dataset de entrenamiento.
- Inferencia sobre CPU sin necesidad de GPU, dado el tamano reducido de la red.
- Distribucion de codigo completa: script de entrenamiento, evaluacion, prediccion, preprocesador y aplicacion Streamlit.

No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, function calling, capacidades de agente ni modo de razonamiento extendido. No es multilingue: solo ingles.

## Casos de uso

- Moderacion de contenidos en plataformas UGC: el modelo actua como primera capa de triaje sobre articulos enviados por usuarios en ingles, marcando los que superan el umbral de sospecha para revision humana posterior. Su bajo coste computacional permite ejecutarlo sobre todo el flujo entrante en lugar de muestrearlo.
- Agregadores de noticias y lectores RSS: integrado en el pipeline de ingesta, puede asignar una etiqueta de fiabilidad a cada entrada antes de mostrarla al usuario, con la confianza del sigmoide como indicador para ordenar o atenuar la visualizacion.
- Filtrado de datasets para investigacion: al clasificar texto en ingles a escala, sirve para depurar corpus, separar subconjuntos por estilo redaccional o etiquetar provisionalmente grandes volumenes de articulos antes de una anotacion manual.
- Sistemas de alerta temprana en redacciones: un periodista puede pegar titular y cuerpo de una pieza sospechosa y obtener en milisegundos una senal de alarma con porcentaje de confianza, util como segundo par de ojos automatizado en verificacion rapida.
- Analisis retrospectivo de desinformacion: procesamiento por lotes de un historico de articulos para estudiar la evolucion temporal de patrones asociados a noticias falsas en un medio o una campana concreta.
- Prototipos y docencia de NLP: el repositorio incluye notebook de 12 pasos, codigo fuente modular y curvas de entrenamiento, lo que lo hace adecuado como material de practicas para explicar tokenizacion, embeddings, LSTM y evaluacion con matriz de confusion.
- Aplicacion web ligera sin GPU: el modelo se puede servir con Streamlit o FastAPI en una instancia de CPU basica, lo que abarata el despliegue de demos publicas o entornos de pruebas internos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (metricas no verificadas de forma independiente, campo `verified: false`), evaluados sobre una particion de test estratificada del 20 % del ISOT Fake and Real News Dataset:

| Metrica | Valor |
|---|---|
| Accuracy | 0,9183 |
| Precision | 0,9404 |
| Recall | 0,8933 |
| F1 Score | 0,9162 |

Matriz de confusion declarada:

| Clase real | Correctamente detectadas |
|---|---|
| Noticia falsa | 283 / 300 (94,3 %) |
| Noticia real | 268 / 300 (89,3 %) |

No se han publicado en la informacion disponible resultados comparativos con otros modelos sobre el mismo conjunto de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier formato. La red (embedding de 20.000 x 128 mas una LSTM de 64 unidades) es de pocos millones de parametros, muy por debajo de cualquier transformer pequeno.
- GPU recomendadas: no requiere GPU. Cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) es mas que suficiente; tambien funciona en CPU.
- Cabe en cualquier GPU consumer, e incluso en entornos sin GPU: portatiles, contenedores de CPU y planes gratuitos de Hugging Face Spaces.
- Opciones de despliegue: TensorFlow/Keras nativo, TensorFlow Serving, API propia con FastAPI o Flask, aplicacion Streamlit (incluida en el repositorio) y Hugging Face Spaces. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un transformer con pesos GGUF o safetensors.
- Latencia y throughput estimados: no disponible. No se han publicado cifras. Dado el tamano de la red, cabe esperar inferencia en decenas de milisegundos por articulo en CPU y bastante menor en GPU, pero es una expectativa derivada de la arquitectura, no un dato medido.
- Dependencias: TensorFlow y Keras, mas el fichero `tokenizer.pickle` descargado junto a los pesos. El preprocesado debe replicarse exactamente para que las predicciones sean coherentes.

## Comparativa con modelos similares

No se dispone de especificaciones tecnicas publicas de alternativas directamente comparables en la informacion consultada. La siguiente tabla recoge lo que se conoce de cada una:

| Modelo | Enfoque | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rakshi1/fake-news-detector | LSTM sobre embeddings de Keras | no disponible (pocos millones) | 300 tokens | MIT | Modelo en Hugging Face + Space |
| DevNumb/fakeNewsDetector | DistilRoBERTa aplicado a texto extraido de una URL, con comprobacion de credibilidad de la fuente | no disponible | no disponible | no disponible | Space en Hugging Face |
| MIT Fake News Patterns Detector | Detector basado en deep learning orientado a explicar patrones linguisticos | no disponible | no disponible | no disponible | Demo web publica |
| truthlens (rakshanamahesh) | Detector con machine learning y NLP | no disponible | no disponible | no disponible | Repositorio en GitHub |

La diferencia principal observable es de planteamiento: este modelo clasifica el texto pegado por el usuario, mientras que alternativas como la de DevNumb parten de una URL y anaden senales externas de credibilidad de la fuente. No hay datos publicos que permitan comparar rendimiento entre ellas.

## Limitaciones y advertencias

- Sesgo de dominio y estilo: el modelo se entrena sobre el ISOT Fake and Real News Dataset y aprende patrones de redaccion propios de ese corpus. Puede estar explotando artefactos estilisticos del dataset (formato de agencia, puntuacion, longitud) en lugar de senales reales de veracidad, lo que se traduce en una degradacion fuerte ante cambios de dominio.
- No es un verificador de hechos: clasifica la forma del texto, no su contenido. Una noticia real redactada con un estilo atipico puede recibir la etiqueta de falsa, y una noticia falsa redactada imitando el estilo de agencia puede pasar el filtro.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no produce texto. El riesgo equivalente es el de falsos positivos y falsos negativos con una confianza aparentemente alta, porque el sigmoide no esta calibrado de forma explicita.
- Metricas no verificadas: todos los resultados declarados tienen `verified: false` y provienen del propio autor. No se ha realizado una evaluacion independiente.
- Limitacion idiomatica: solo ingles. Cualquier texto en otro idioma producira predicciones sin sentido, ya que el tokenizador tiene un vocabulario de 20.000 terminos en ingles.
- Limitacion de contexto: 300 tokens por articulo con truncado posterior. Los articulos largos pierden informacion, precisamente la parte final del cuerpo, que puede ser relevante.
- Desbalance entre clases en la practica: la precision (94,04 %) es superior al recall (89,33 %), lo que indica una tendencia a clasificar como falsas algunas noticias reales. En un uso de moderacion esto implica carga de revision innecesaria.
- Repositorio sin traccion: 0 descargas y 0 likes en la consulta, sin mantenimiento ni issues documentados. No hay garantia de soporte, actualizaciones ni correccion de errores.
- Licencia: MIT, permisiva y apta para uso comercial, pero no incluye ninguna garantia. Conviene revisar ademas las condiciones de uso del dataset ISOT para un despliegue comercial.
- Recomendacion de uso: emplearlo como senal auxiliar o herramienta de triaje, nunca como decision final sobre la veracidad de un contenido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rakshi1/fake-news-detector
- Aplicacion interactiva (Hugging Face Space): https://huggingface.co/spaces/Rakshi1/fake-news-detector-app
- Notebook en Google Colab (perfil del autor): https://colab.research.google.com/github/Rakshi1
- Repositorio GitHub relacionado: https://github.com/RakeshBabuGajula/Fake_News_Detector
- Alternativa basada en DistilRoBERTa y analisis de URL: https://huggingface.co/spaces/DevNumb/fakeNewsDetector
- Detector de patrones de noticias falsas del MIT: http://fakenews.mit.edu/
- Repositorio truthlens: https://github.com/rakshanamahesh/truthlens
