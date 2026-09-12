# omarash/sms-spam-distilbert

## Resumen

`omarash/sms-spam-distilbert` es un clasificador binario de mensajes SMS en ingles desarrollado por el usuario omarash y publicado en HuggingFace. Es un fine-tuning de `distilbert/distilbert-base-uncased` al que se ha anadido una cabeza de clasificacion de secuencia binaria: cada mensaje recibe la etiqueta `ham` (0, mensaje legitimo) o `spam` (1). El modelo tiene 66.955.010 parametros, ocupa 0,3 GB en el repositorio y se distribuye bajo licencia Apache 2.0.

Su interes es metodologico mas que operativo. El propio autor plantea una pregunta de investigacion explicita: si el fine-tuning de un transformer preentrenado mejora de forma material el rendimiento en la clase spam frente a una linea base fuerte de regresion logistica sobre TF-IDF, evaluada sobre exactamente los mismos ejemplos. La respuesta publicada es un incremento absoluto de 0,0167 en F1 de spam (0,9655 frente a 0,9488), con mejora tambien en precision, recall, F1 macro, exactitud, ROC AUC y PR AUC.

El modelo se publica como pieza de portafolio academico (etiqueta `graduate-portfolio`), con cero descargas y cero valoraciones en el momento de la consulta. Cubre un unico idioma (ingles) y un dominio estrecho (SMS cortos de la coleccion UCI de 2011), y no incorpora generacion de texto, razonamiento multi-paso, tool calling ni capacidades multimodales. El autor indica de forma explicita que no es un sistema de antiabuso listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder) con cabeza de clasificacion binaria de secuencia; modelo base `distilbert/distilbert-base-uncased` |
| Parametros totales | 66.955.010 |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la model card. La longitud maxima de secuencia usada en entrenamiento fue de 192 tokens |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en `safetensors`; no se ofrecen variantes GGUF, GPTQ, AWQ ni ONNX |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 (modelo). El dataset UCI SMS Spam Collection empleado en el entrenamiento esta bajo CC BY 4.0 y no queda cubierto por la licencia del modelo |
| Formato de pesos | `safetensors`, cargable con la libreria `transformers` |
| Etiquetas de salida | `ham` (0), `spam` (1) |
| Metrica principal declarada | F1 de la clase spam |
| Tamano del repositorio | 0,3 GB |
| Fecha de creacion / actualizacion | 12 de septiembre de 2026 (creacion y ultima actualizacion) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer tipo DistilBERT (version destilada de BERT-base) con una cabeza de clasificacion de secuencia binaria superpuesta. No hay innovaciones propias: no se emplean tecnicas de atencion lineal, decodificacion especulativa, mezcla de expertos ni arquitecturas de estado recurrente. El valor del trabajo reside en el protocolo experimental, no en el diseno del modelo.

El entrenamiento usa las 5.574 mensajes de la UCI SMS Spam Collection, cargados mediante el dataset `ucirvine/sms_spam`. El protocolo es un split estratificado determinista 80/20 con semilla 42, lo que da 4.459 mensajes de entrenamiento y 1.115 de evaluacion, identicos para el transformer y para el baseline. La configuracion de entrenamiento publicada es: 4 epocas, tamano de lote 16, learning rate 2e-5, weight decay 0,01, longitud maxima de secuencia 192 tokens, semilla 42, y seleccion del mejor checkpoint por F1 de spam, que resulto ser el de la epoca 1. El entorno fue Python 3.11.16, Transformers 5.17.0, PyTorch 2.14.0, Datasets 5.0.1 y scikit-learn 1.9.1. No se documenta RLHF, DPO ni ajuste por preferencias.

El baseline de comparacion es una regresion logistica con `class_weight="balanced"` y semilla 42 sobre TF-IDF de unigramas y bigramas de palabras en minusculas (`min_df=2`, frecuencia de termino sublineal). Ambos modelos usan un umbral de decision de 0,5. El autor reconoce una debilidad metodologica relevante: el split de evaluacion se uso tambien para seleccionar la epoca, por lo que es una particion de evaluacion y no un conjunto de test final intacto; un seguimiento mas robusto requeriria un split de validacion separado o validacion cruzada anidada.

## Capacidades

- Clasificacion binaria de texto: asigna `ham` o `spam` a un mensaje SMS en ingles.
- Devuelve una puntuacion asociada a la etiqueta, pero el autor advierte que las puntuaciones no estan calibradas y no deben interpretarse como confianza calibrada.
- Inferencia por lotes mediante la pipeline `text-classification` de `transformers`.
- Extraccion de representaciones (el repositorio esta etiquetado como compatible con `text-embeddings-inference` y `endpoints_compatible`), lo que permite reutilizar el encoder para obtener embeddings de frases cortas.
- Funciona con entradas de hasta 192 tokens, que es el maximo usado en entrenamiento.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling ni razonamiento multi-paso orientado a agentes.
- No tiene capacidad multilingue: solo ingles.
- No dispone de modo de pensamiento (thinking mode) ni de salida estructurada mas alla de la etiqueta y su puntuacion.

## Casos de uso

- Prototipado educativo de filtrado de SMS: el modelo permite demostrar en un aula o laboratorio como se comporta un transformer preentrenado frente a un baseline lineal sobre un dataset pequeno y bien delimitado, con 66.955.010 parametros y un coste de inferencia minimo.
- Reproduccion de un experimento controlado: sirve para replicar la comparacion entre regresion logistica TF-IDF y DistilBERT sobre el mismo split de 1.115 mensajes de evaluacion, con las mismas condiciones de umbral (0,5) y metrica principal (F1 de spam).
- Pre-anotacion asistida de corpus SMS: el modelo puede etiquetar grandes volumenes de mensajes historicos para que un anotador humano revise posteriormente, aprovechando que el repositorio esta etiquetado para `text-embeddings-inference` y despliegue por lotes.
- Triaje dentro de un pipeline de moderacion con revision humana: colocando el modelo como primer filtro y manteniendo una cola de revision para los casos marcados como spam, el coste computacional por mensaje es despreciable frente a soluciones generativas.
- Analisis exploratorio de colecciones de mensajes: extrayendo embeddings del encoder para agrupar o visualizar mensajes cortos en ingles, por ejemplo para estudiar la evolucion del vocabulario promocional en un corpus historico.
- Docencia sobre sesgo de datos y deriva temporal: el modelo es un buen ejemplo practico de como un clasificador entrenado con datos de 2011 degrada frente a estafas contemporaneas, otras variantes ortograficas o mensajes mas largos.
- Comparacion coste-beneficio en decisiones de arquitectura: dado que la mejora de F1 de spam es de 0,0167 absoluto frente a un baseline mucho mas barato de entrenar y servir, el modelo sirve para ilustrar como ponderar latencia, memoria y complejidad operativa frente a una ganancia marginal de metrica.
- Servicio de inferencia local de bajo coste: al tratarse de un modelo de 66,9 millones de parametros, se puede ejecutar en CPU o en GPU de gama baja para demostraciones sin conexion y sin coste de infraestructura.

## Benchmarks y rendimiento

El autor publica una comparacion directa sobre el mismo split de evaluacion de 1.115 mensajes:

| Metrica | DistilBERT | TF-IDF + regresion logistica |
|---|---:|---:|
| F1 de spam | 0,9655 | 0,9488 |
| Precision de spam | 0,9929 | 0,9653 |
| Recall de spam | 0,9396 | 0,9329 |
| F1 macro | 0,9802 | 0,9705 |
| Exactitud | 0,9910 | 0,9865 |
| ROC AUC | 0,9975 | 0,9847 |
| PR AUC | 0,9886 | 0,9690 |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, algo esperable dado que se trata de un clasificador binario de dominio especifico y no de un modelo generativo. El analisis de errores del autor sobre el split de evaluacion identifica nueve falsos negativos y un falso positivo. Los falsos negativos se concentran en mensajes conversacionales o con tono de broma sin llamada a la accion clara, promociones implicitas o truncadas y lenguaje antiguo de tonos de llamada o codigos cortos. El unico falso positivo fue un mensaje personal informal que contenia un numero de telefono y un imperativo de llamada. El propio autor advierte que este conjunto de errores es descriptivo y no una taxonomia estadisticamente estable.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 268 MB en FP32, 134 MB en FP16 y 67 MB en int8, calculados a partir de los 66.955.010 parametros. Son estimaciones derivadas del numero de parametros, no cifras publicadas por el autor.
- Cabe con holgura en cualquier GPU de consumo: RTX 3060, RTX 4060, GTX 1650, e incluso en GPU integradas con asignacion de memoria compartida.
- Ejecutable en CPU para inferencia por lotes de mensajes de hasta 192 tokens, con latencias por mensaje del orden de milisegundos, aunque el autor no publica mediciones.
- GPU de datacenter (A100, H100) no aportan ventaja practica para este tamano de modelo; el cuello de botella seria la latencia de red, no el computo.
- Opciones de despliegue: pipeline de `transformers` (via principal), Text Embeddings Inference (el repositorio esta etiquetado como `text-embeddings-inference` y `endpoints_compatible`), HuggingFace Inference Endpoints, y conversion manual a ONNX o a formatos de llama.cpp/Ollama, para los que no se publican artefactos preconvertidos.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo de respuesta por peticion.
- Almacenamiento: 0,3 GB de repositorio, trivial para cualquier entorno.

## Comparativa con modelos similares

La busqueda web realizada no devolvio modelos comparables de clasificacion de spam; los resultados obtenidos no guardaban relacion con la consulta. La comparacion se limita por tanto a las dos referencias documentadas en la propia model card:

| Modelo | Parametros | Contexto / entrada | F1 de spam | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `omarash/sms-spam-distilbert` | 66.955.010 | 192 tokens usados en entrenamiento | 0,9655 | Apache 2.0 | HuggingFace, 0 descargas |
| TF-IDF + regresion logistica (baseline del autor) | No aplica (modelo lineal disperso) | No aplica | 0,9488 | No especificada en la model card | Solo descrito en la model card, sin pesos publicados |
| `distilbert/distilbert-base-uncased` (modelo base) | 66.955.010 | No disponible en la informacion proporcionada | No disponible: no esta ajustado para esta tarea | Apache 2.0 | HuggingFace |

No se dispone de datos sobre otros clasificadores de spam comparables (por ejemplo variantes basadas en BERT, RoBERTa o modelos lineales de produccion) en la informacion proporcionada.

## Limitaciones y advertencias

- El dataset es pequeno y antiguo respecto a los patrones de mensajeria actuales: 5.574 mensajes de la coleccion UCI, con origen en 2011.
- Los datos son exclusivamente en ingles y representan un dominio muy estrecho (SMS cortos). El rendimiento puede degradarse con otros idiomas, mensajes mas largos, escritura adversaria u ortografias no estandar.
- Los resultados proceden de un unico split determinista con semilla 42 y no cuantifican la variabilidad entre semillas.
- La seleccion de epoca se hizo sobre el propio split de evaluacion, por lo que no se conserva un conjunto de test final intacto. Las cifras publicadas deben leerse como evaluacion, no como generalizacion confirmada.
- El umbral de decision fijo de 0,5 puede no reflejar el coste operativo real de falsos positivos y falsos negativos, que en este dominio son asimetricos: un falso positivo suprime comunicacion legitima y un falso negativo expone al usuario a fraude.
- Las puntuaciones de salida no estan calibradas y no deben interpretarse como confianza calibrada.
- El modelo no es un sistema de antiabuso listo para produccion, tal como declara el propio autor; su uso previsto es educativo, de investigacion y de prototipado con revision humana.
- Riesgo de alucinacion: no aplica en el sentido generativo, porque el modelo no genera texto. El riesgo equivalente es la clasificacion erronea silenciosa, sin explicacion ni trazabilidad de la decision.
- Sesgos conocidos: no se documenta un analisis de sesgos por subgrupo. El propio autor senala que un despliegue real exigiria datos representativos actuales, analisis de subgrupos y de deriva, seleccion de umbral ligada a costes explicitos, monitorizacion, una via de apelacion y recuperacion, y tratamiento de datos con preservacion de privacidad.
- Restricciones de licencia: el modelo es Apache 2.0, pero el dataset UCI SMS Spam Collection esta bajo CC BY 4.0 y no queda cubierto por la licencia del modelo. Cualquier redistribucion o uso derivado debe respetar la atribucion correspondiente al dataset.
- El contenido de la model card disponible esta truncado en la seccion de consideraciones eticas y practicas, por lo que podria existir informacion adicional no recogida aqui.
- El modelo tiene cero descargas y cero valoraciones, y no cuenta con validacion independiente por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/omarash/sms-spam-distilbert
- Modelo base `distilbert/distilbert-base-uncased`: https://huggingface.co/distilbert/distilbert-base-uncased
- Dataset `ucirvine/sms_spam` en HuggingFace: https://huggingface.co/datasets/ucirvine/sms_spam
- Referencia original del dataset, UCI Machine Learning Repository: https://doi.org/10.24432/C5CC84
- Licencia CC BY 4.0 del dataset: https://creativecommons.org/licenses/by/4.0/
- Nota sobre la busqueda web: los resultados devueltos no guardaban relacion con el modelo ni con clasificacion de spam (contenido sobre estadisticas de beisbol de los Boston Red Sox), por lo que no se incluye ningun enlace adicional procedente de esa busqueda.
