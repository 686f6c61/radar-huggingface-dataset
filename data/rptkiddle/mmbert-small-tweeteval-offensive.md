# rptkiddle/mmBERT-small-tweeteval-offensive

## Resumen

mmBERT-small-tweeteval-offensive es un clasificador binario de texto que etiqueta tuits en ingles como ofensivos o no ofensivos. Lo publica el usuario de HuggingFace rptkiddle como fine-tune de jhu-clsp/mmBERT-small, un encoder de 140.642.306 parametros (unos 140,6 millones) perteneciente a la familia ModernBERT. El ajuste se ha realizado sobre el subconjunto "offensive" del dataset cardiffnlp/tweet_eval, con 11.916 tuits de entrenamiento y una particion de test de 860 tuits.

El modelo no busca competir en el estado del arte, sino servir de material didactico para el seminario GESIS Introduction to Machine Learning for Text Analysis with Python. En el tercer dia del curso los participantes ajustan ellos mismos este modelo; esta copia existe para que puedan saltarse el entrenamiento y pasar directamente a la fase de evaluacion y analisis de metricas.

Su relevancia practica es, por tanto, acotada y bien delimitada: es un ejemplo reproducible de pipeline de clasificacion supervisada con pesos abiertos (safetensors, licencia MIT), con resultados publicados y comparados contra una linea base de TF-IDF mas regresion logistica. El propio autor advierte de que no debe utilizarse para moderacion de contenido ni para decisiones con consecuencias reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer tipo ModernBERT (etiqueta `modernbert`) |
| Parametros totales | 140.642.306 (aprox. 140,6 millones) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (la model card no la especifica; el entrenamiento uso `max_length` de 200 tokens) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors, sin versiones GGUF, GPTQ ni AWQ) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea | clasificacion de texto (text-classification), 2 clases |
| Modelo base | jhu-clsp/mmBERT-small (fine-tune completo, no adaptadores) |
| Dataset de ajuste | cardiffnlp/tweet_eval, subconjunto "offensive" |
| Tamano del repositorio | 0,6 GB |
| Descargas / likes | 0 / 0 (artefacto de curso, sin adopcion publica) |
| Fecha de creacion | 12 de septiembre de 2026 |

## Arquitectura y entrenamiento

La base es jhu-clsp/mmBERT-small, un encoder de la familia ModernBERT con 140,6 millones de parametros, pensado para tareas de comprension de texto en ingles en este ajuste concreto. Sobre esa base se ha anadido una cabeza de clasificacion de dos etiquetas (ofensivo / no ofensivo) y se ha realizado un fine-tune supervisado completo con el `Trainer` de Hugging Face.

Los hiperparametros documentados son: 3 epocas, tamano de lote 32, tasa de aprendizaje 3e-5, 100 pasos de calentamiento (_warmup_), decaimiento de pesos (_weight decay_) de 0,01 y longitud maxima de secuencia de 200 tokens. El mejor punto de control se selecciono por F1 macro sobre el conjunto de validacion. No se documenta ningun proceso de RLHF, DPO ni ajuste por preferencias: se trata de aprendizaje supervisado puro sobre etiquetas categoricas. El autor tampoco describe innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal u otras), mas alla del uso de la arquitectura ModernBERT heredada del modelo base.

## Capacidades

- Clasificacion binaria de texto: asigna la etiqueta "offensive" o "non-offensive" a un tuit o fragmento corto en ingles.
- Devuelve puntuaciones de confianza por clase a traves del pipeline `text-classification` de Transformers.
- Inferencia por lotes (_batching_) mediante el pipeline estandar, apta para procesar corpus completos sin escribir codigo adicional.
- Entrada de hasta 200 tokens en el regimen de entrenamiento documentado.
- Uso como linea base de evaluacion: sus metricas publicadas permiten comparar contra otras aproximaciones sobre el mismo conjunto de test.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No soporta _tool calling_, _function calling_ ni flujos de agentes con razonamiento multi-paso.
- No es multilingue: solo ingles.
- No tiene modo de razonamiento explicito (_thinking_) ni salida de cadena de pensamiento.

## Casos de uso

- Material didactico en el seminario GESIS: los alumnos cargan el modelo ya entrenado para practicar la evaluacion con scikit-learn, matrices de confusion y analisis de errores sin gastar tiempo en el entrenamiento.
- Comparacion contra linea base clasica: sirve para ilustrar en clase la diferencia entre una aproximacion de TF-IDF mas regresion logistica (exactitud 0,80, F1 macro 0,69) y un encoder preentrenado ajustado (exactitud 0,83, F1 macro 0,78).
- Ejercicio sobre metricas con clases desbalanceadas: con una clase ofensiva de F1 0,69 frente a 0,88 de la no ofensiva, es un caso practico para explicar por que la exactitud engania y por que conviene mirar F1 macro y el recall por clase.
- Pre-anotacion supervisada en proyectos de investigacion: usar el modelo como primer filtro sobre un corpus de tuits en ingles, dejando la decision final a anotadores humanos y midiendo el acuerdo entre ambos.
- Estudio de sesgos de anotacion: al heredar las etiquetas de los anotadores originales de TweetEval (2018), permite analizar como un modelo reproduce juicios subjetivos y culturalmente situados sobre que es ofensivo.
- Ensayo de pipelines de NLP completos: encadenar carga del modelo, inferencia por lotes y calculo de metricas en un cuaderno reproducible, como plantilla para otros proyectos de clasificacion.
- Analisis exploratorio de redes sociales con fines academicos, siempre con revision humana posterior y sin automatizar acciones de moderacion.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test de TweetEval (860 tuits), publicados en la model card:

| Clase | Precision | Recall | F1 |
|---|---|---|---|
| non-offensive | 0,88 | 0,89 | 0,88 |
| offensive | 0,70 | 0,67 | 0,69 |

| Metrica global | Este modelo | Linea base TF-IDF + regresion logistica |
|---|---|---|
| Exactitud (_accuracy_) | 0,83 | 0,80 |
| F1 macro | 0,78 | 0,69 |
| Recall en la clase ofensiva | 0,67 | 0,35 |

El autor no publica resultados en otros benchmarks (MMLU, HumanEval, GSM8K u otros), que en cualquier caso no serian aplicables a un clasificador de texto de este tipo.

## Requisitos de hardware

- VRAM estimada para los pesos, calculada a partir del numero de parametros: unos 563 MB en FP32, unos 281 MB en FP16/BF16 y unos 141 MB en int8. Con activaciones y _overhead_ del runtime, lo razonable es reservar entre 0,4 GB y 1,2 GB segun precision.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluidas GTX 1650, RTX 3050, T4 o superiores. No requiere A100 ni H100.
- Cabe holgadamente en GPU de consumo: si, en practicamente todas las actuales y en muchas integradas, y tambien en CPU con latencias aceptables para lotes pequenos.
- Opciones de despliegue: pipeline de Transformers (via `pipeline("text-classification")`), `AutoModelForSequenceClassification` con PyTorch, exportacion a ONNX Runtime y despliegue con FastAPI o similar. Al no publicarse pesos GGUF, llama.cpp y Ollama requeririan una conversion propia.
- Latencia y throughput: no disponible. El autor no ha publicado mediciones, y no se dispone de cifras de tokens por segundo para este ajuste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en TweetEval (offensive) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rptkiddle/mmBERT-small-tweeteval-offensive | 140,6 M | no disponible | Exactitud 0,83; F1 macro 0,78 | MIT | HuggingFace, safetensors |
| Linea base TF-IDF + regresion logistica (misma particion) | no aplica | no aplica | Exactitud 0,80; F1 macro 0,69; recall ofensivo 0,35 | no disponible | Codigo en el repositorio del curso |
| jhu-clsp/mmBERT-small (modelo base sin ajustar) | 140,6 M | no disponible | no disponible (sin cabeza de clasificacion) | no disponible en la informacion proporcionada | HuggingFace |
| Otros clasificadores de lenguaje ofensivo en ingles (por ejemplo, variantes de RoBERTa ajustadas sobre TweetEval) | no disponible | no disponible | no disponible (no se han proporcionado resultados comparables) | no disponible | HuggingFace |

Las unicas cifras comparables de las que se dispone son las del propio autor frente a su linea base clasica; para el resto de alternativas no hay datos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo didactico: el autor indica explicitamente que no debe usarse para moderacion de contenido ni para ninguna aplicacion con consecuencias.
- El entrenamiento se hizo una sola vez, con hiperparametros razonables pero sin ajuste fino; no hay busqueda de hiperparametros ni validacion cruzada documentada.
- La ofensividad es subjetiva y culturalmente dependiente: las etiquetas heredan los juicios de los anotadores originales de TweetEval.
- Los datos de entrenamiento son tuits en ingles de 2018, por lo que el vocabulario, el argot y las referencias culturales pueden estar desactualizados respecto a usos posteriores.
- Rendimiento asimetrico: recall de solo 0,67 en la clase ofensiva, es decir, aproximadamente un tercio de los tuits ofensivos del test no se detectan.
- Precisión limitada en la clase ofensiva (0,70), lo que implica falsos positivos frecuentes si se aplica de forma automatica.
- Solo ingles: cualquier texto en otro idioma queda fuera del ambito del modelo.
- No se especifica la longitud de contexto real del modelo base en la model card; el limite de 200 tokens es una eleccion de entrenamiento, no necesariamente el maximo arquitectonico.
- Dominio restringido a texto corto tipo tuit; no hay evidencia de comportamiento en parrafos largos, documentos o conversaciones multi-turno.
- Licencia MIT para los pesos, pero conviene revisar por separado las condiciones de uso del dataset cardiffnlp/tweet_eval antes de cualquier explotacion.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si de clasificaciones erroneas con puntuaciones de confianza altas.
- Sin adopcion publica hasta la fecha (0 descargas, 0 likes), por lo que no existe validacion externa independiente del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rptkiddle/mmBERT-small-tweeteval-offensive
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Dataset TweetEval: https://huggingface.co/datasets/cardiffnlp/tweet_eval
- Repositorio del curso GESIS: https://github.com/Rptkiddle/gesis-machine-learning-2026
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (los enlaces recuperados corresponden a portales escolares sin relacion con el tema). No se han encontrado papers, blogs ni demos adicionales.
