# fahmisyaifudin/indobert-tweet-spam-classifier

## Resumen

El modelo `fahmisyaifudin/indobert-tweet-spam-classifier` es un clasificador binario de texto especializado en la detección de spam en publicaciones de Twitter (X) escritas en indonesio. Se trata de un fine-tuning del modelo preentrenado `indolem/indobert-base-uncased`, que a su vez es una versión monolingüe de BERT adaptada al idioma indonesio. El modelo resuelve un problema concreto y creciente en el ecosistema de redes sociales del sudeste asiático: la proliferación de mensajes no deseados, estafas y contenido promocional fraudulento en la plataforma.

La relevancia de este modelo radica en que el indonesio es un idioma con escasa representación en los modelos de lenguaje preentrenados, y la mayoría de las soluciones de moderación de contenido están orientadas al inglés u otros idiomas mayoritarios. Al estar fine-tuneado sobre un corpus de más de 4.000 tuits indonesios etiquetados manualmente, ofrece una solución ligera y eficaz para integrar en pipelines de moderación automática. Con 110,5 millones de parámetros y una arquitectura BERT base, el modelo es suficientemente compacto para ejecutarse en hardware de consumo, lo que facilita su adopción en entornos de producción con recursos limitados.

La ventana de contexto del modelo está limitada a 256 tokens durante el entrenamiento, lo que resulta adecuado para la longitud típica de un tuit, pero puede ser insuficiente para textos más largos. El modelo se distribuye bajo licencia MIT, lo que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (uncased) |
| Parametros totales | 110.559.746 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 256 tokens (entrenamiento); el modelo base soporta 512 |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion posible con herramientas externas) |
| Idiomas soportados | indonesio (id) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT base uncased, concretamente en la versión `indolem/indobert-base-uncased`, que es un modelo BERT monolingüe entrenado con un gran corpus de texto indonesio. El fine-tuning se realizó para la tarea de clasificación de secuencias binaria, con una capa de clasificación añadida sobre la representación de la token `[CLS]`. No se emplean técnicas de mezcla de expertos ni arquitecturas híbridas; se trata de un transformer encoder estándar.

El entrenamiento se llevó a cabo sobre un conjunto de datos etiquetado de más de 4.000 publicaciones de Twitter en indonesio, que fueron limpiadas eliminando enlaces y emojis antes del entrenamiento. Los hiperparámetros utilizados fueron: 4 épocas, tamaño de lote de 16, tasa de aprendizaje de 2e-5, longitud máxima de secuencia de 256 tokens y optimizador AdamW. No se menciona el uso de técnicas de alineación como RLHF o DPO; el proceso se limita a un fine-tuning supervisado estándar. La elección de una longitud máxima de 256 tokens es coherente con la naturaleza de los tuits, que rara vez superan esa extensión.

## Capacidades

- Clasificacion binaria de texto: distingue entre `spam` y `not_spam` en publicaciones de Twitter en indonesio.
- Procesamiento de lenguaje informal: entrenado con tuits reales, capta abreviaturas, coloquialismos y estructuras propias de la jerga de redes sociales en indonesio.
- Inferencia rapida: al ser un modelo BERT base de 110M parametros, puede ejecutarse en CPU o GPU de consumo con latencias bajas.
- Integracion sencilla: compatible con la API `pipeline` de HuggingFace Transformers, lo que facilita su despliegue en aplicaciones existentes.
- No soporta otras tareas como generacion de texto, tool calling, agentes, vision o audio. Su unica funcion es la clasificacion de secuencias.

## Casos de uso

- Moderacion de comentarios en redes sociales indonesias: el modelo puede integrarse en un sistema de moderacion que filtre automaticamente comentarios spam en publicaciones de Instagram, TikTok o Twitter. Su ventana de 256 tokens es suficiente para la mayoria de comentarios, y su precision del 97,5% reduce la carga de revision manual.

- Deteccion de estafas y phishing en Twitter/X: muchas cuentas fraudulentas publican enlaces a paginas de phishing o prometen premios falsos. Este modelo puede actuar como primera linea de defensa, marcando tuits sospechosos antes de que lleguen a los usuarios. La eliminacion de enlaces durante el entrenamiento obliga a que el modelo se base en el texto circundante, lo que puede ser una ventaja para detectar patrones linguisticos de estafa.

- Limpieza de datasets para entrenamiento de otros modelos: antes de utilizar datos de redes sociales indonesias para entrenar modelos de lenguaje o analisis de sentimiento, este clasificador puede filtrar ruido no deseado. Un pipeline de preprocesamiento que pase cada texto por el modelo y descarte los marcados como `spam` mejora la calidad del corpus resultante.

- Sistemas de alerta temprana para campañas de desinformacion: los mensajes spam suelen acompanarse de noticias falsas o contenido manipulado. Integrar este modelo en un monitor de redes sociales permite detectar picos de actividad spam asociados a campañas coordinadas, facilitando la respuesta de equipos de fact-checking.

- Filtrado de mensajes en plataformas de mensajeria: aunque el modelo fue entrenado con tuits, su capacidad de clasificacion de texto corto puede adaptarse a mensajes de WhatsApp o Telegram en indonesio. Con una pequena cantidad de datos de adaptacion, podria emplearse para bloquear cadenas de spam o mensajes fraudulentos en aplicaciones de chat.

- Analisis de campañas de marketing digital: las marcas que monitorizan menciones en redes sociales pueden usar este modelo para separar el ruido spam de las menciones genuinas de usuarios. Esto permite medir con mayor precision el impacto real de una campana y evitar que los bots inflen las metricas.

## Benchmarks y rendimiento

Los resultados de evaluacion publicados en la model card son los siguientes:

| Metrica | Valor |
|---|---|
| Accuracy | 0.975 |
| F1 | 0.968 |
| Precision | 0.968 |
| Recall | 0.968 |

No se han publicado comparativas con otros modelos de clasificacion de spam en indonesio en la informacion disponible. Estos valores provienen de un conjunto de evaluacion no especificado, por lo que deben interpretarse con cautela. La ausencia de una particion de test independiente documentada y de una descripcion del proceso de evaluacion limita la reproducibilidad de estos resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 110,5 millones de parametros. En precision FP32, los pesos ocupan aproximadamente 442 MB; en FP16, unos 221 MB. Con un batch de 1 y una secuencia de 256 tokens, el consumo de VRAM adicional para activaciones es reducido, por lo que una GPU con 2 GB de VRAM es suficiente.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM, como una NVIDIA GTX 1050 Ti, GTX 1650, RTX 2060 o superior. Tambien puede ejecutarse en CPU con un rendimiento aceptable para inferencia por lotes.
- Compatibilidad con GPU de consumo: si, el modelo cabe sin problemas en GPUs de gama de entrada y en la mayoria de portatiles con GPU integrada (aunque con mayor latencia).
- Opciones de despliegue: al ser un modelo de HuggingFace Transformers, puede servirse con herramientas como FastAPI, TorchServe o el servidor de inferencia de HuggingFace. Para despliegues mas ligeros, se puede exportar a ONNX o utilizar `optimum` para aceleracion. No se menciona soporte explicito para vLLM, TGI o llama.cpp, pero al tratarse de un modelo BERT estandar, es posible adaptarlo.
- Latencia y throughput: no se han publicado mediciones oficiales. En una GPU moderna (por ejemplo, RTX 3060), se espera una latencia de entre 5 y 15 ms por muestra para secuencias de 256 tokens, y un throughput de varios cientos de muestras por segundo con batch adecuado.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros clasificadores de spam para indonesio. Sin embargo, existen alternativas y modelos relacionados en el ecosistema:

| Modelo | Tarea | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fahmisyaifudin/indobert-tweet-spam-classifier | Clasificacion de spam en tweets | 110,5 M | 256 | MIT | HuggingFace |
| Yntzie/indonesian-sms-spam-classification-indobert | Clasificacion de spam en SMS | similar (IndoBERT base) | no especificado | no especificada | GitHub |
| indolem/indobertweet-base-uncased | Modelo base preentrenado para Twitter indonesio | 110 M (aprox.) | 512 | MIT | HuggingFace |

El modelo de fahmisyaifudin se diferencia del proyecto de SMS por estar orientado a tweets, con un preprocesamiento especifico para redes sociales. IndoBERTweet es un modelo base sin fine-tuning, por lo que no es directamente comparable en rendimiento de clasificacion, pero sirve como referencia del estado del arte en representaciones de texto para Twitter indonesio.

## Limitaciones y advertencias

- Tamano reducido del corpus de entrenamiento: solo 4.000 ejemplos etiquetados, lo que puede limitar la generalizacion a variaciones dialectales, jergas regionales o tipos de spam no representados en el conjunto de datos.
- Preprocesamiento agresivo: los enlaces y emojis fueron eliminados antes del entrenamiento. Si el modelo recibe texto con estos elementos, su rendimiento puede degradarse, ya que no ha aprendido a interpretarlos.
- Limitacion de idioma: el modelo solo funciona con texto en indonesio. No soporta otros idiomas ni codigo mixto, comun en regiones multilingues como Indonesia.
- Ventana de contexto corta: 256 tokens es suficiente para tuits, pero textos mas largos (por ejemplo, articulos o hilos) quedarian truncados, perdiendo informacion relevante.
- Riesgo de sesgos: al entrenarse con datos de Twitter, el modelo puede heredar sesgos presentes en la plataforma, como desequilibrios de genero, raza o clase social. No se ha realizado una auditoria de sesgos.
- Resultados de evaluacion sin contexto: las metricas publicadas (accuracy 0.975, F1 0.968) carecen de detalles sobre el conjunto de test, el metodo de muestreo o la distribucion de clases, por lo que su valor real en produccion puede diferir.
- Sin soporte para otras tareas: no puede generar texto, realizar tool calling ni actuar como agente. Su uso se limita estrictamente a clasificacion binaria de secuencias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fahmisyaifudin/indobert-tweet-spam-classifier
- Modelo base `indolem/indobert-base-uncased`: https://huggingface.co/indolem/indobert-base-uncased
- Repositorio GitHub de IndoBERTweet: https://github.com/indolem/IndoBERTweet
- Paper de IndoBERTweet en arXiv: https://arxiv.org/pdf/2109.04607
- Modelo `indolem/indobertweet-base-uncased` en HuggingFace: https://huggingface.co/indolem/indobertweet-base-uncased
- Proyecto de clasificacion de spam SMS en indonesio con IndoBERT: https://github.com/Yntzie/indonesian-sms-spam-classification-indobert
