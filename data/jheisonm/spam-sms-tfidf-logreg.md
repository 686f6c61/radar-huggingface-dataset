# JheisonM/spam-sms-tfidf-logreg

## Resumen

JheisonM/spam-sms-tfidf-logreg es un clasificador binario spam/ham para mensajes SMS en inglés, publicado en HuggingFace por el usuario JheisonM. No es un modelo de lenguaje neuronal: se trata de un pipeline clásico de scikit-learn compuesto por un vectorizador TF-IDF de n-gramas de caracteres (2 a 5, con `analyzer='char_wb'`) y una regresión logística con `class_weight='balanced'`. Devuelve la etiqueta y la probabilidad de spam, de modo que el umbral de decisión (0,5 por defecto) puede ajustarse según el coste relativo de falsos positivos y falsos negativos.

El modelo se entrenó sobre la SMS Spam Collection del UCI Machine Learning Repository, con 5158 mensajes únicos (4516 ham y 642 spam) tras reconstruir 50 filas partidas por comas y eliminar duplicados exactos. La configuración final se eligió mediante validación cruzada estratificada de 5 pliegues sobre el 80 % del conjunto de entrenamiento, comparando MultinomialNB, LogisticRegression y LinearSVC con n-gramas de palabras y de caracteres; el modelo publicado se reentrenó después con el 100 % de los datos.

Su relevancia es acotada pero clara: sirve como línea base reproducible, de coste casi nulo y ejecutable en CPU, para tareas de filtrado de SMS en inglés y como punto de comparación frente a aproximaciones basadas en transformers. El repositorio no tiene descargas ni likes en el momento de redactar esta ficha y no incluye métricas de evaluación publicadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de scikit-learn: `TfidfVectorizer(analyzer='char_wb', ngram_range=(2, 5), min_df=2, sublinear_tf=True, norm='l2', lowercase=True)` + `LogisticRegression(class_weight='balanced', max_iter=2000)` |
| Parametros totales | no disponible (el tamaño de la matriz de coeficientes depende del vocabulario final de n-gramas, que no se publica) |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica / no disponible (no es un transformer; acepta cadenas de longitud arbitraria y las representa como bolsa de n-gramas de caracteres, sin memoria posicional) |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas; no aplica cuantización de pesos a un modelo lineal disperso) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | skops (serialización de pipelines de scikit-learn); no hay safetensors ni GGUF en el repositorio |
| Tarea | clasificación de texto binaria (spam / ham) con probabilidad asociada |
| Etiquetas de salida | 2 (spam, ham) |
| Tamaño del repositorio | 0,0 GB según HuggingFace (por debajo del margen de redondeo de 0,05 GB) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-13 |

## Arquitectura y entrenamiento

La arquitectura es un clasificador lineal sobre representación dispersa. El texto se normaliza a minúsculas y se vectoriza con TF-IDF de n-gramas de caracteres de longitud 2 a 5 generados dentro de palabra (`char_wb`), con `min_df=2` para descartar n-gramas vistos en un solo documento, `sublinear_tf=True` (escala logarítmica de la frecuencia de término) y normalización L2. Sobre esa matriz se ajusta una regresión logística con ponderación de clases balanceada y un máximo de 2000 iteraciones. El uso de n-gramas de caracteres, en lugar de palabras, hace al modelo relativamente robusto a errores tipográficos, abreviaturas y variaciones morfológicas típicas del SMS, aunque a costa de un vocabulario de mayor dimensión. La decodificación es estricta en UTF-8 (`decode_error='strict'`), por lo que una entrada con bytes no válidos provoca un error en lugar de un descarte silencioso.

Los datos de entrenamiento proceden de la SMS Spam Collection (UCI/Kaggle): 5158 mensajes únicos en inglés, 4516 ham y 642 spam, con un desbalance aproximado de 7:1 que justifica el uso de `class_weight='balanced'`. La selección de modelo se hizo con validación cruzada estratificada de 5 pliegues sobre el 80 % del conjunto, comparando MultinomialNB, LogisticRegression y LinearSVC sobre n-gramas de palabras y de caracteres; el pipeline publicado se reentrenó con el 100 % de los datos. No se documenta ningún proceso de ajuste por refuerzo (RLHF/DPO), destilación ni aumentación de datos, ni se publican los valores numéricos de la comparación de modelos.

## Capacidades

- Clasificación binaria de SMS en inglés en las categorías spam y ham, con salida de probabilidad para cada mensaje.
- Umbral de decisión configurable: la probabilidad se expone para que el integrador ajuste el punto de corte según su tolerancia a falsos positivos.
- Robustez ante ruido superficial en el texto (errores de tecleo, abreviaturas, formatos de URL y números) gracias al uso de n-gramas de caracteres de 2 a 5.
- Inferencia en CPU con un modelo lineal disperso, sin requisitos de GPU.
- Serialización portable mediante skops, lo que facilita el versionado y la carga del pipeline completo (vectorizador más clasificador) sin reconstruirlo a mano.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni modos de pensamiento.
- No tiene capacidades multimodales (ni visión, ni audio).
- Multilingüe: no; el modelo está entrenado exclusivamente con SMS en inglés y no declara soporte para otros idiomas.
- No genera texto: es un clasificador, no un modelo generativo.

## Casos de uso

- Filtrado de spam en pasarelas SMS y agregadores (CPaaS): el modelo se interpone entre el operador y la aplicación final para etiquetar mensajes entrantes y derivar los sospechosos a cuarentena, con un umbral ajustado a la tolerancia de falsos positivos del servicio.
- Priorización de bandejas de entrada de SMS empresariales: al devolver una probabilidad continua, permite ordenar los mensajes por riesgo antes de que los revise un operador humano, en lugar de aplicar una decisión binaria rígida.
- Moderación de mensajes en plataformas de mensajería masiva: filtrado previo de envíos con contenido promocional o fraudulento antes de su distribución a los usuarios suscritos.
- Etiquetado de corpus históricos para construir conjuntos de entrenamiento: el clasificador puede pseudo-etiquetar grandes volúmenes de SMS en inglés a bajo coste y servir de base para entrenar modelos supervisados posteriores.
- Detección de fraude y phishing en canales de telefonía: como señal adicional dentro de un sistema de scoring, combinada con reputación del remitente y análisis de URL, dado que el propio autor advierte que el phishing moderno con tono oficial es el punto débil del modelo.
- Despliegue en entornos con recursos limitados o edge: al ejecutarse en CPU y sin GPU, es viable en contenedores pequeños, dispositivos embebidos o funciones serverless donde no cabe un transformer.
- Línea base de evaluación interna: cualquier equipo que desarrolle un detector de spam basado en transformers o LLM puede usarlo como referencia de coste y comportamiento antes de asumir el coste de una arquitectura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (accuracy, precision, recall, F1 ni matriz de confusión) del modelo final, y la comparación mediante validación cruzada frente a MultinomialNB y LinearSVC se describe sin cifras.

Los únicos datos numéricos publicados son los del corpus de entrenamiento y la descripción cualitativa de los errores:

| Aspecto | Dato |
|---|---|
| Mensajes únicos totales | 5158 |
| Mensajes ham | 4516 |
| Mensajes spam | 642 |
| Filas reconstruidas por comas | 50 |
| Duplicados exactos eliminados | sí (sin recuento publicado) |
| Validación | validación cruzada estratificada de 5 pliegues sobre el 80 % de train |
| Modelos comparados | MultinomialNB, LogisticRegression, LinearSVC |
| Representaciones comparadas | n-gramas de palabras y de n-gramas de caracteres |
| Entrenamiento final | 100 % de los datos |
| Errores residuales declarados | spam redactado como conversación personal; phishing moderno con tono oficial, con acierto cercano al 50 % según el autor |
| Umbral por defecto | 0,5 |

## Requisitos de hardware

- VRAM para inferencia: 0 GB. El modelo no usa GPU.
- GPU recomendadas: no aplica. No se requiere ni se aprovecha aceleración por GPU.
- Memoria principal: no publicada; el artefacto serializado ocupa menos de 0,05 GB según el tamaño reportado del repositorio, y el consumo en ejecución depende del vocabulario de n-gramas y de las dependencias de scikit-learn y NumPy.
- Cabe en cualquier GPU consumer: sí, en el sentido trivial de que no necesita ninguna; el cálculo es en CPU.
- Opciones de despliegue: carga directa del pipeline con scikit-learn o skops, servido mediante FastAPI, Flask, BentoML o similar; conversión a ONNX con `skl2onnx` como opción no verificada. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos neuronales y a pesos GGUF.
- Latencia y throughput estimados: no disponibles. No se publican medidas de rendimiento.

## Comparativa con modelos similares

La model card documenta una comparación interna durante la selección de modelo, aunque sin resultados numéricos publicados. La tabla recoge las alternativas evaluadas y su estado respecto a este modelo.

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| spam-sms-tfidf-logreg | TF-IDF char 2-5 + regresión logística | no disponible | no aplica | no publicado | MIT | público en HuggingFace |
| MultinomialNB (sobre el mismo corpus) | Naive Bayes multinomial | no disponible | no aplica | evaluado en la validación cruzada del autor, cifras no publicadas | no aplica (no se publica como modelo) | no disponible |
| LinearSVC (sobre el mismo corpus) | SVM lineal | no disponible | no aplica | evaluado en la validación cruzada del autor, cifras no publicadas | no aplica (no se publica como modelo) | no disponible |
| Alternativa con transformer afinado (p. ej. BERT en su versión base) | Transformer encoder | cientos de millones (según variante) | habitualmente 512 tokens | no disponible en la información proporcionada | según variante | no evaluada en esta ficha |

No se dispone de comparaciones publicadas frente a detectores de spam neuronales o comerciales, ni de cifras que permitan afirmar superioridad de este modelo sobre ellos.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado con SMS en inglés de la década de 2000; el vocabulario, las expresiones y los patrones de fraude han cambiado desde entonces.
- Punto débil declarado por el autor: el phishing moderno con tono oficial se queda cerca del 50 % de acierto, es decir, prácticamente a nivel de azar en ese subconjunto.
- Spam redactado como conversación personal: cuando el tono pesa más que la URL o el número, el modelo comete errores residuales que no puede corregir con las señales que usa.
- Solo inglés: no hay evidencia de funcionamiento en castellano ni en ningún otro idioma, pese a que la licencia permite reentrenar.
- No es un modelo generativo y no razona: no puede justificar sus decisiones ni manejar instrucciones, agentes o tool calling.
- Decodificación estricta en UTF-8: las entradas con codificación distinta o bytes inválidos provocan un error en lugar de una clasificación degradada, lo que exige saneado previo en producción.
- Desbalance de clases marcado (aproximadamente 7:1) y corpus de solo 5158 mensajes; la calibración de probabilidades en casos límite debe validarse con datos propios.
- Ausencia de métricas publicadas: no se puede estimar la precisión, la exhaustividad ni el F1 sin reproducir la evaluación por cuenta propia.
- Desplazamiento de dominio: cualquier uso sobre canales distintos del SMS en inglés (correo, mensajería instantánea, notificaciones push) requerirá reentrenamiento y evaluación específicos.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución y sin garantía; aun así, la responsabilidad sobre el rendimiento en producción recae en el integrador.
- Riesgo de falsos positivos con coste real: clasificar como spam una comunicación legítima (por ejemplo, un mensaje transaccional) puede tener consecuencias graves, por lo que se recomienda usar la probabilidad y no solo la etiqueta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JheisonM/spam-sms-tfidf-logreg
- Conjunto de datos de entrenamiento (SMS Spam Collection, UCI/Kaggle): https://www.kaggle.com/datasets/uciml/sms-spam-collection-dataset
- Búsqueda web: las consultas realizadas no devolvieron resultados relevantes sobre el modelo; los enlaces recuperados corresponden a foros de la comunidad de eBay y no guardan relación con esta ficha. No se han encontrado papers, blogs, repositorios ni demos adicionales asociados al modelo.
