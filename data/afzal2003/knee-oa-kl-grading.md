# afzal2003/knee-oa-kl-grading

## Resumen

knee-oa-kl-grading es un sistema de clasificación de imagen médica publicado por el usuario afzal2003 en HuggingFace. Consiste en un conjunto (ensemble) de dos redes convolucionales diseñadas y entrenadas desde cero en TensorFlow/Keras, sin pesos preentrenados ni transfer learning, que asignan un grado de osteoartritis de rodilla en la escala Kellgren-Lawrence (KL 0-4) a partir de radiografías frontales de rodilla recortadas a la articulación. El modelo no es un modelo de lenguaje: no genera texto ni tiene ventana de contexto, sino que recibe una imagen fija de 224x224 en escala de grises y devuelve probabilidades softmax sobre cinco clases.

La relevancia del proyecto es metodológica más que clínica: ilustra cómo abordar un problema de imagen médica con desbalance severo de clases (el grado 4 representa solo el 3% del entrenamiento, una proporción 13:1 frente al grado 0), cómo auditar explicaciones Grad-CAM con pruebas de borrado y de aleatorización de pesos, y cómo corregir el sesgo hacia clases frecuentes mediante una regla de decisión ajustada por el prior del conjunto de entrenamiento. El autor declara explícitamente que no es un dispositivo médico y que no debe usarse para diagnóstico ni decisiones de tratamiento.

El conjunto alcanza una precisión balanceada de 0,644 (IC 95%: 0,621-0,666) y un kappa cuadrático ponderado de 0,753 (IC 95%: 0,730-0,775) sobre un conjunto de test retenido de 1.656 radiografías, con casi todos los errores en grados adyacentes. La principal debilidad declarada es la frontera entre los grados 0, 1 y 2.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN convolucional propia entrenada desde cero, 4 bloques con filtros 32-64-128-256 (exp1_augmentation.keras); variante 1,5x más ancha con filtros 48-96-192-384 (exp3_aug_wider.keras) |
| Parametros totales | 1.175.845 en exp1_augmentation.keras; recuento de exp3_aug_wider.keras no disponible |
| Parametros activos | No aplica (no es una arquitectura MoE) |
| Longitud de contexto | No aplica (clasificador de imagen con entrada fija de 224x224 píxeles en escala de grises) |
| Tipos de cuantizacion | No disponible (solo se publican pesos Keras en la precisión de entrenamiento) |
| Idiomas soportados | No aplica (modelo de visión; no procesa texto) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Keras v3 (.keras); requiere además preprocessing.py y pipeline_config.json |
| Tarea | Clasificación de imagen (image-classification), 5 clases (KL 0-4) |
| Entrada | 224x224, 1 canal, normalizada a [0,1] tras preprocesado obligatorio |
| Salida | Probabilidades softmax sobre grados 0-4; el pipeline aplica media del ensemble y división por la frecuencia de cada grado en entrenamiento |
| Ficheros del repositorio | exp1_augmentation.keras, exp3_aug_wider.keras, preprocessing.py, pipeline_config.json |
| Tamaño del repositorio (metadatos HF) | 0.0 GB (no coherente con los ficheros descritos por el autor) |
| Descargas / likes | 0 / 0 |
| Fecha de creación en HuggingFace | 2026-10-04 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

Cada miembro del ensemble es una red convolucional de cuatro bloques con filtros 32-64-128-256; la segunda variante replica la arquitectura con un ancho 1,5x mayor (48-96-192-384). El entrenamiento usó Adam con tasa de aprendizaje 1e-3 reducida a la mitad ante mesetas de pérdida de validación, tamaño de lote 32 y entropía cruzada categórica dispersa. El checkpointing y la parada temprana se guiaron por precisión balanceada de validación mediante un callback propio, no por accuracy. La aumentación aplicada fue volteo horizontal, rotación ±10°, desplazamiento ±5%, zoom ±10° y brillo y contraste ±10%. Todo el entrenamiento se realizó en una única GPU NVIDIA RTX 4060 para portátiles.

Los datos proceden del dataset público "Knee Osteoarthritis Dataset with Severity Grading" de Kaggle, derivado de la Osteoarthritis Initiative (OAI) a través de la publicación de Pingjun Chen en Mendeley Data (University of Florida). Se usaron los splits provistos: 5.778 imágenes de entrenamiento, 826 de validación y 1.656 de test, todas recortes en escala de grises de 224x224. El preprocesado es obligatorio y está implementado en preprocessing.py: detección y reinversión de radiografías invertidas, estiramiento de contraste por percentiles 1-99 medido en la región central de la articulación, y CLAHE con límite de recorte 2,0 y mosaicos de 8x8.

El pipeline final promedia las probabilidades softmax de ambos modelos y aplica una regla de decisión ajustada por prior: cada probabilidad se divide por la frecuencia de ese grado en el conjunto de entrenamiento (2286, 1046, 1516, 757 y 173 imágenes para los grados 0 a 4) y gana la puntuación más alta. Esta regla se seleccionó únicamente sobre datos de validación y produce puntuaciones de decisión, no probabilidades calibradas. No se documenta uso de RLHF, DPO ni ninguna técnica de alineación, algo esperable en un clasificador.

## Capacidades

- Clasificación de radiografías frontales de rodilla en cinco grados KL (0 sano, 1 dudoso, 2 mínimo, 3 moderado, 4 severo).
- Salida de probabilidades softmax por grado antes del ajuste por prior, útiles para análisis exploratorio.
- Detección y corrección automática de radiografías invertidas dentro del preprocesado.
- Normalización de contraste reproducible mediante estiramiento por percentiles y CLAHE.
- Explicabilidad integrada mediante Grad-CAM sobre la capa convolucional más profunda, promediada entre ambos miembros del ensemble.
- Capacidad de degradación razonable: casi todos los errores son a grados adyacentes y ningún caso sano se predijo como grado 4.
- Dos variantes de capacidad (base y 1,5x más ancha) que permiten estudiar el efecto del ancho de la red sin cambiar la arquitectura.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural o audio.

## Casos de uso

- Docencia de deep learning aplicado a imagen médica: el repositorio publica pesos, script de preprocesado y configuración del pipeline, lo que permite reproducir de principio a fin un flujo realista de clasificación con desbalance de clases.
- Estudio de desbalance extremo y reglas de decisión: el autor documenta explícitamente la comparación entre argmax simple y decisión ajustada por prior, con cifras de recall por clase, lo que sirve como caso práctico de calibración de umbrales.
- Investigación sobre explicabilidad: las pruebas de borrado (área bajo curva 0,154 para oclusión y 0,170 para Grad-CAM frente a 0,422 para regiones aleatorias) y la comprobación de aleatorización de pesos (similitud de Spearman -0,03) son un ejemplo replicable de auditoría de mapas de saliencia.
- Comparación metodológica entre entrenamiento desde cero y transfer learning: al no usar pesos preentrenados, sirve como línea base para medir cuánto aporta el preentrenamiento en una tarea de radiografía con pocos datos etiquetados.
- Prototipado de pipelines de preprocesado radiográfico: preprocessing.py documenta una secuencia concreta (inversión, estiramiento de contraste, CLAHE) reutilizable en otros proyectos de imagen de rayos X.
- Análisis retrospectivo en investigación con datos propios: con un reentrenamiento y validación externa independientes, la arquitectura de 1,17 millones de parámetros es lo bastante pequeña para iterar rápidamente en un solo equipo de gama media.
- Demostración de incertidumbre estadística: los intervalos de confianza por bootstrap (2.000 remuestreos) y el compromiso de no reutilizar el conjunto de test ilustran buenas prácticas de evaluación en proyectos pequeños.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de test retenido (1.656 radiografías):

| Metrica | Valor | IC 95% |
|---|---|---|
| Precisión balanceada | 0,644 | 0,621 - 0,666 |
| Kappa cuadrático ponderado | 0,753 | 0,730 - 0,775 |
| Accuracy | 0,542 | no disponible |
| F1 macro | 0,604 | no disponible |

Desglose por grado:

| Grado | 0 sano | 1 dudoso | 2 mínimo | 3 moderado | 4 severo |
|---|---|---|---|---|---|
| Recall | 0,44 | 0,44 | 0,58 | 0,80 | 0,96 |
| Precision | 0,80 | 0,24 | 0,59 | 0,71 | 0,69 |

Notas de interpretación aportadas por el autor: con la regla ajustada por prior, el modelo reconoce el grado 1 (recall 0,44) pero marca el 46% de las rodillas sanas como grado 1; con argmax simple la precisión balanceada es prácticamente idéntica (0,646) pero el recall del grado 1 cae a 0,02 y el recall de rodillas sanas sube a 0,82.

No se han publicado resultados de benchmarks comparables de otros modelos en la información disponible: los artículos localizados en la búsqueda web (validación externa de un modelo de deep learning para grading KL y una red ensemble publicada en Scientific Reports) no aportan cifras recuperables en esta información, por lo que no se incluye comparación numérica.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 4,7 MB por modelo en float32, derivado del recuento de parámetros publicado (1.175.845 x 4 bytes), es decir unos 10 MB para los dos miembros del ensemble. Es una estimación aritmética, no un dato publicado; las activaciones de una única imagen de 224x224x1 son despreciables.
- GPU de entrenamiento documentada: una NVIDIA RTX 4060 para portátiles.
- GPU recomendadas: cualquier GPU consumer moderna es sobradamente suficiente; también es viable la inferencia en CPU, dado el tamaño del modelo.
- Cabe en cualquier GPU consumer; el cuello de botella realista es el preprocesado de imagen (CLAHE) y la carga de TensorFlow/Keras, no el modelo.
- Opciones de despliegue: Keras/TensorFlow nativo es el único soporte documentado por el autor (carga mediante keras.models.load_model desde huggingface_hub). No se documentan exportaciones a GGUF, ONNX, TFLite, vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo de inferencia ni de procesamiento por lote.
- Requisito de integración: es imprescindible usar preprocessing.py y respetar la entrada de 224x224 en escala de grises; sin ese preprocesado las salidas carecen de sentido.

## Comparativa con modelos similares

No se dispone de datos de parámetros, contexto ni licencia de los modelos citados en la búsqueda web, por lo que la comparación es necesariamente cualitativa.

| Modelo | Enfoque | Parametros | Datos de evaluacion | Licencia | Pesos disponibles |
|---|---|---|---|---|---|
| knee-oa-kl-grading (este) | Ensemble de 2 CNN entrenadas desde cero (Keras) | 1.175.845 (un miembro) | 1.656 radiografías de test; precisión balanceada 0,644; QWK 0,753 | CC-BY-4.0 | Sí, en HuggingFace (.keras) |
| Modelo de grading KL con validación externa (Osteoarthritis and Cartilage Open, 2025) | Deep learning evaluado en 208 radiografías anteroposteriores externas frente a lectores humanos | no disponible | Validación externa sobre 208 radiografías | no disponible | no disponible |
| Ensemble deep-learning networks para grading automatizado de osteoartritis (Scientific Reports, 2023) | Red ensemble para predicción consistente del grado KL | no disponible | no disponible | no disponible | no disponible |

La diferencia principal de este modelo frente a los trabajos publicados es que no usa pesos preentrenados ni transfer learning, es de tamaño muy reducido y publica pesos y pipeline completos bajo licencia CC-BY-4.0, lo que facilita la reproducción, pero carece de validación externa en poblaciones o equipos distintos de los del entrenamiento.

## Limitaciones y advertencias

- No es un dispositivo médico. El propio autor indica que es un proyecto de investigación y de portafolio, no validado clínicamente, y que no debe usarse para diagnóstico ni para decisiones de tratamiento.
- Posible fuga de información a nivel de paciente: la mayoría de los pacientes aporta ambas rodillas y los datos públicos no incluyen identificadores de paciente, por lo que imágenes de un mismo individuo podrían repartirse entre entrenamiento y test. El autor advierte de este riesgo.
- Debilidad en la frontera de grados 0, 1 y 2: con la regla ajustada por prior, el 46% de las rodillas sanas se etiquetan como grado 1; el recall de grado 1 (0,44) y de grado 0 (0,44) son los más bajos del sistema.
- Las puntuaciones de la regla ajustada por prior son puntuaciones de decisión, no probabilidades calibradas; no deben interpretarse como confianza clínica.
- Dominio de entrada muy restringido: solo radiografías frontales de rodilla recortadas a la articulación. Con cualquier otra imagen el modelo devuelve igualmente un grado, pero el resultado carece de significado.
- Ausencia de validación externa: no hay evidencia sobre poblaciones, escáneres o centros distintos de los del conjunto de entrenamiento.
- Limitaciones de generalización derivadas del conjunto OAI: predominio de una única procedencia de datos y desbalance severo (grado 4 con el 3% de las muestras de entrenamiento, relación 13:1 frente al grado 0).
- Licencia CC-BY-4.0: permite uso comercial y modificaciones siempre que se atribuya la autoría, pero se ofrece sin garantías; al ser un modelo no validado clínicamente, cualquier uso en un producto sanitario exigiría evaluación regulatoria independiente.
- Metadatos incompletos en HuggingFace: 0 descargas, 0 likes, tamaño de repositorio declarado de 0.0 GB (incoherente con los ficheros descritos), fecha de creación anómala (2026-10-04) y enlaces a repositorio de código y demo todavía sin publicar, al figurar como marcadores de posición en la model card.
- Sin métricas de latencia, throughput ni consumo energético publicadas.
- No se documentan sesgos demográficos desglosados por sexo, edad, etnia ni índice de masa corporal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/afzal2003/knee-oa-kl-grading
- Dataset de entrenamiento (Kaggle, Knee Osteoarthritis Dataset with Severity Grading): https://www.kaggle.com/datasets/shashwatwork/knee-osteoarthritis-dataset-with-severity
- Publicación de Pingjun Chen en Mendeley Data (University of Florida): enlace no disponible en la información proporcionada
- Repositorio de código y cuadernos: marcador de posición en la model card, enlace no disponible
- Demo en HuggingFace Space: marcador de posición en la model card, enlace no disponible
- Kellgren-Lawrence grading of knee osteoarthritis using deep learning (Osteoarthritis and Cartilage Open, 2025): https://www.sciencedirect.com/science/article/pii/S2665913125000160
- Versión PDF del artículo anterior: https://www.oarsiopenjournal.com/article/S2665-9131(25)00016-0/pdf
- Texto completo del artículo anterior: https://www.oarsiopenjournal.com/article/S2665-9131(25)00016-0/fulltext
- Ficha del artículo en Radai Slice: https://radaislice.com/paper/doi/10.1016/j.ocarto.2025.100580
- Ensemble deep-learning networks for automated osteoarthritis grading (Scientific Reports, 2023): https://www.nature.com/articles/s41598-023-50210-4
