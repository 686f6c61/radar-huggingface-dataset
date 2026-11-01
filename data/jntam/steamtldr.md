# jntam/steamtldr

## Resumen

SteamTLDR es un clasificador de sentimiento binario para resenas de videojuegos de Steam escritas en ingles. Lo desarrolla el autor independiente jntam y predice si una resena corresponde a un pulgar arriba (positiva) o un pulgar abajo (negativa). Es el modelo que alimenta la aplicacion SteamTLDR, que resume que alaba y que critica la comunidad de jugadores de cada juego. No es un modelo de lenguaje neuronal: es un `Pipeline` de scikit-learn que combina un vectorizador TF-IDF con una regresion logistica.

Su relevancia radica en el enfoque: con un modelo de unos 25 MB, entrenado sobre 426.308 resenas limpias de 100 juegos, supera en su dominio a un DistilBERT generico de sentimiento (F1 de 0,902 frente a 0,83 en la clase negativa). Sirve como referencia practica de que un clasificador lineal bien ajustado al dominio puede batir a un transformer pequeno mal adaptado, y como ejemplo didactico de construccion de un pipeline de texto reproducible.

La ficha describe un artefacto de clasificacion, no un modelo generativo: no tiene ventana de contexto en tokens, ni capacidad de razonamiento, ni soporte multilingue mas alla del ingles. Su valor esta en la precision dentro de su tarea acotada y en su coste de despliegue practicamente nulo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de scikit-learn: `TfidfVectorizer` (1-gramas y 2-gramas de palabra, `min_df=5`) + `LogisticRegression` |
| Parametros totales | no disponible (modelo lineal disperso; vocabulario y pesos, sin recuento de parametros publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador de texto completo, sin ventana de tokens definida) |
| Tipos de cuantizacion | no disponible (pesos serializados con joblib; no hay versiones GGUF ni cuantizadas) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | joblib (serializacion pickle de scikit-learn, fichero `sentiment.joblib`) |

## Arquitectura y entrenamiento

La arquitectura es un clasificador lineal clasico en dos etapas. El `TfidfVectorizer` convierte cada resena en un vector disperso de frecuencias termino-inverso-documento usando 1-gramas y 2-gramas de palabra con `min_df=5`. Sobre esa representacion, una `LogisticRegression` con `class_weight="balanced"`, `max_iter=1000` y `random_state=42` produce la probabilidad de que la resena sea positiva. No hay capas neuronales, atencion ni embeddings contextuales: el modelo lee recuentos de palabras y bigramas.

El entrenamiento uso resenas en ingles obtenidas de la API publica de resenas de Steam para 100 juegos de generos diversos (shooters, RPG, estrategia, carreras, gacha, free-to-play e indies). Cada juego aporta hasta unas 6.000 resenas, extraidas de las mas utiles, las mas recientes y el historial mes a mes, de modo que el corpus cubre resenas antiguas y nuevas. Las etiquetas son el propio `voted_up` de Steam, sin etiquetado manual. Se descartaron resenas con menos de 5 palabras o en las que menos de la mitad de los caracteres fueran letras. El modelo final se entreno con las 426.308 resenas limpias de los 100 juegos. El pipeline no usa identificadores ni nombres de usuarios, y el fichero del modelo almacena vocabulario y pesos, no texto de resenas.

La evaluacion se hizo con juegos completos retenidos, para medir generalizacion a titulos no vistos: una version entrenada con 411.791 resenas de 97 juegos se probo sobre 14.517 resenas de tres juegos reservados (Helldivers 2, Cities: Skylines II y Hollow Knight: Silksong). Se eligio el F1 de la clase negativa como metrica principal porque la mayoria de juegos tiende a lo positivo y la exactitud sola ocultaria un modelo que ignora las quejas. El modelo se entreno con scikit-learn 1.9.1, joblib 1.6.0 y Python 3.14, y requiere cargarse con las mismas versiones mayores, ya que los modelos serializados de scikit-learn pueden romperse entre versiones.

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) sobre resenas de Steam en ingles, devolviendo la probabilidad de positividad mediante `predict_proba`.
- Analisis de resenas cortas y clausulas sueltas extraidas de resenas, segun el uso previsto declarado por el autor.
- Procesamiento por lotes: al ser un pipeline de scikit-learn, admite listas de textos en una sola llamada.
- Extraccion implicita de terminos relevantes: al ser un modelo lineal sobre TF-IDF, los coeficientes permiten inspeccionar que palabras y bigramas empujan hacia cada clase.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: solo ingles.
- No dispone de modo thinking, vision ni audio.
- No genera texto: unicamente clasifica.

## Casos de uso

- Moderacion y triaje de resenas en portales de videojuegos: el modelo puntua cada resena y permite priorizar la revision humana de las mas negativas o de las de sentimiento ambiguo, con un coste de inferencia minimo al ser un modelo de 25 MB.
- Panel de opinion por juego: agregando las probabilidades de miles de resenas se obtiene una metrica de satisfaccion comparable entre titulos, que alimenta visualizaciones tipo SteamTLDR sobre que se alaba y que se critica.
- Alertas de crisis de reputacion: monitorizando en tiempo casi real el flujo de resenas de un lanzamiento, un desplome en la proporcion de resenas positivas detectado por el modelo puede disparar una alerta al equipo de comunidad.
- Extraccion de quejas para producto: filtrando las resenas clasificadas como negativas con alta confianza se construye un corpus sobre el que aplicar analisis de temas o busqueda de palabras clave, sin necesidad de revisar manualmente todo el volumen.
- Clasificacion de feedback de jugadores en foros y canales de soporte: el modelo acepta clausulas cortas, por lo que puede puntuar fragmentos de comentarios recogidos fuera de Steam, con la cautela de que su dominio de entrenamiento son resenas de Steam.
- Etiquetado previo para anotacion humana: sirve como preetiquetador barato en la construccion de un dataset propio de sentimiento de videojuegos, reduciendo el trabajo de anotacion antes de entrenar un modelo mayor.
- Referencia didactica y baseline: util en cursos y articulos para comparar un pipeline TF-IDF + regresion logistica frente a transformers, y como linea base obligatoria antes de invertir en fine-tuning de un modelo neuronal.

## Benchmarks y rendimiento

Evaluacion sobre tres juegos completos retenidos (14.517 resenas de Helldivers 2, Cities: Skylines II y Hollow Knight: Silksong), umbral 0,5:

| Clase | Precision | Recall | F1 |
|---|---|---|---|
| Negativa | 0,889 | 0,915 | 0,902 |
| Positiva | 0,932 | 0,911 | 0,921 |

Exactitud global: 91,3 %.

Comparacion declarada por el autor con un modelo DistilBERT de sentimiento generico, en una prueba anterior sobre 20 juegos:

| Modelo | Precision (negativa) | Recall (negativa) | F1 (negativa) |
|---|---|---|---|
| SteamTLDR | 0,889 | 0,915 | 0,902 |
| DistilBERT generico | 0,76 | 0,92 | 0,83 |

No se han publicado mas resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; el modelo se ejecuta en CPU. El fichero pesa unos 25 MB y la carga en memoria es del orden de decenas de MB.
- GPU recomendadas: no aplica; no necesita GPU. Puede ejecutarse en cualquier CPU moderna.
- Cabe en cualquier consumer GPU y en cualquier portatil, e incluso en entornos serverless de baja memoria.
- Opciones de despliegue: carga directa con `joblib.load` en Python, servido mediante una API propia (FastAPI, Flask, Streamlit como en la aplicacion original) o dentro de un pipeline de scikit-learn. No hay soporte de vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se publican cifras. Al ser un modelo lineal sobre TF-IDF, la inferencia por resena es del orden de microsegundos a milisegundos en CPU y escala bien en lotes.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | F1 (negativa) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SteamTLDR | TF-IDF + regresion logistica | no disponible (25 MB) | no aplica | 0,902 | MIT | HuggingFace (joblib) |
| DistilBERT sentiment generico | Transformer encoder | ~66 M | 512 tokens | 0,83 | segun variante | HuggingFace |
| Modelos BERT multilingues de sentimiento | Transformer encoder | ~110 M | 512 tokens | no disponible en esta prueba | segun variante | HuggingFace |

La comparacion se limita a lo declarado por el autor. No hay datos publicados que permitan comparar con clasificadores especificos de resenas de Steam de otros autores. La ventaja de SteamTLDR es el coste (CPU, 25 MB) y el ajuste al dominio; su desventaja es la ausencia de comprension contextual, que los transformers si ofrecen para negaciones y sarcasmo.

## Limitaciones y advertencias

- Sarcasmo y negacion: el modelo lee recuentos de palabras y bigramas, no estructura oracional, por lo que expresiones como "not bad at all" o un "love waiting 20 minutes for a match" ironico pueden clasificarse mal.
- Texto corto: tiende a lo positivo en textos muy breves, y las resenas de 5 a 25 palabras obtienen puntuaciones peores que las largas.
- Etiquetas ruidosas: las etiquetas son el pulgar arriba/abajo de Steam, que no siempre coincide con el texto (clics erroneos, bromas, "recomendado pero...").
- Solo ingles: el campo "English" de Steam es el idioma que selecciona el resenador, por lo que el corpus de entrenamiento contiene algo de texto en otros idiomas; el rendimiento fuera del ingles no esta garantizado.
- Dominio restringido: entrenado exclusivamente con resenas de Steam; se esperan resultados mas debiles en otro tipo de texto.
- Sesgos de genero y de catalogo: el corpus cubre 100 juegos de generos concretos, por lo que el vocabulario y las expresiones de otros generos o comunidades pueden estar infrarrepresentados.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si hay riesgo de falsos positivos y negativos con confianza alta en textos ambiguos.
- Licencia MIT: permite uso comercial y modificacion con atribucion; no obstante, el autor advierte de que solo se carguen ficheros pickle de fuentes de confianza, por el riesgo de ejecucion de codigo al deserializar.
- Dependencia de version: el modelo se serializo con scikit-learn 1.9.1, joblib 1.6.0 y Python 3.14; cargarlo con otras versiones mayores puede romper la deserializacion.
- Sin mantenimiento declarado: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no se documenta soporte ni actualizaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jntam/steamtldr
- Codigo y pipeline de entrenamiento: https://github.com/jntm7/steam-tldr
- Aplicacion SteamTLDR: https://steamtldr.streamlit.app
