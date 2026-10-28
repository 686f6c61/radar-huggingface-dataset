# abir71/bangla-cyberbullying-two-stage

## Resumen

El modelo `abir71/bangla-cyberbullying-two-stage` es un clasificador de texto supervisado, no un modelo de lenguaje neuronal, publicado por Abir Hosen (usuario `abir71`) como artefacto de investigación asociado al manuscrito *A Two-Stage Sentiment-Aware Approach for Cyberbullying Detection in Native and Transliterated Bengali Social Media Data* (Khan, Jahan, Ahammad y Hosen; en revisión). Resuelve una tarea concreta: decidir si un comentario de redes sociales en bengalí nativo, bengalí romanizado o código mezclado bengalí-inglés es acoso (*bullying*), no acoso o neutro, apoyándose en una etapa previa de análisis de sentimiento con 9 clases.

La arquitectura es un pipeline clásico de dos etapas construido con scikit-learn 1.9.1: dos vectorizadores TF-IDF (unigramas y bigramas de palabra, más n-gramas de carácter 2–4) alimentan dos regresiones logísticas multinomiales con pesos de clase balanceados. La etapa 1 predice el sentimiento (Agresivo, Comentario normal, De apoyo, Acoso sexual, Feliz, Sin sentido, Triste, Acoso religioso o Sarcástico) y la etapa 2 clasifica el acoso a partir del texto y de las **probabilidades** predichas en la etapa 1, habiendo sido entrenada con predicciones *out-of-fold* para evitar fuga de información.

Su relevancia es doble. Por un lado, documenta de forma inusualmente honesta un resultado negativo: el sentimiento predicho apenas aporta sobre el texto solo (56,3 % de exactitud y 0,490 de F1 macro en ambos casos), y el techo de 75,7 % solo se alcanza si se dispone de la etiqueta humana de sentimiento, algo imposible en producción. Por otro lado, el propio autor lo marca explícitamente como **modelo de investigación y no como herramienta de moderación**: falla en más de cuatro de cada diez comentarios. El entrenamiento se hizo sobre 3.150 comentarios anotados por tres personas, extraídos de YouTube (2.118) y Facebook (1.031) de Bangladesh.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de dos etapas: TF-IDF (unigramas y bigramas de palabra + n-gramas de carácter 2–4) y dos regresiones logísticas multinomiales con pesos de clase balanceados |
| Parametros totales | No aplicable en el sentido neuronal; el estado son los vocabularios TF-IDF (máximo configurado de 6.000 términos de palabra y 12.000 de carácter) más los coeficientes de ambos clasificadores. El número exacto de términos ajustados no se publica |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable: no hay ventana de contexto; cada comentario se vectoriza de forma independiente (modelo de bolsa de palabras) |
| Tipos de cuantizacion | No aplicable: no se publican versiones GGUF, ONNX ni cuantizaciones; el artefacto es un serializado joblib en coma flotante |
| Idiomas soportados | `bn` y `en`, incluyendo bengalí en escritura nativa, bengalí romanizado y código mezclado bengalí-inglés |
| Licencia | MIT |
| Formato de pesos | `two_stage_model.joblib` (vectorizadores + clasificadores + nombres de clase), `bangla_bullying.py` (limpieza de texto y función `predict()`) y `metadata.json` |

Otros datos de la ficha: hiperparámetros C = 4 (etapa 1) y C = 1 (etapa 2), elegidos por validación cruzada; frecuencia de término sublineal en ambos vectorizadores; requisito de scikit-learn 1.9.1; tamaño del repositorio 0,0 GB según los metadatos de Hugging Face; 0 descargas y 0 *likes* en el momento de la consulta.

## Arquitectura y entrenamiento

El sistema no usa transformers ni embeddings contextuales. La entrada se limpia con `bangla_bullying.py` y se representa con dos matrices TF-IDF complementarias: una sobre unigramas y bigramas de palabra (tokenización por espacios, mínimo 2 documentos, máximo 6.000 términos) y otra sobre n-gramas de carácter de 2 a 4 dentro de límites de palabra (mínimo 3 documentos, máximo 12.000 términos). La segunda está pensada específicamente para absorber la variabilidad ortográfica del bengalí romanizado, donde una misma palabra puede aparecer escrita de múltiples formas. Sobre esas representaciones se ajustan dos regresiones logísticas multinomiales con `class_weight='balanced'`.

El diseño de dos etapas pretende inyectar información de sentimiento en la decisión de acoso. La etapa 1 se entrena con las 9 clases de sentimiento anotadas; la etapa 2 se entrena con las probabilidades de la etapa 1 generadas *out-of-fold* junto al texto, de modo que nunca ve las etiquetas humanas de sentimiento y su comportamiento en inferencia coincide con el de entrenamiento. Los datos son 3.150 comentarios de YouTube (2.118) y Facebook (1.031) de páginas de Bangladesh, anotados por tres personas y fusionados con reglas de prioridad fijas: 1.720 marcados como *bullying*, 887 como *non_bullying* y 543 como *neutral*; en sentimiento, 1.481 Agresivo, 790 Comentario normal, 278 De apoyo, 172 Acoso sexual, 126 Feliz, 91 Sin sentido, 87 Triste, 78 Acoso religioso y 47 Sarcástico. La evaluación es una validación cruzada estratificada de 5 pliegues repetida 3 veces, manteniendo los comentarios duplicados tras la limpieza en el mismo pliegue.

## Capacidades

- Clasificación de sentimiento en 9 clases (Agresivo, Comentario normal, De apoyo, Acoso sexual, Feliz, Sin sentido, Triste, Acoso religioso, Sarcástico) con probabilidades por clase.
- Clasificación de acoso en 3 clases (*bullying*, *non_bullying*, *neutral*) condicionada por las probabilidades de sentimiento de la etapa 1.
- Robustez parcial frente a variantes ortográficas del bengalí romanizado gracias a los n-gramas de carácter.
- Manejo de código mezclado bengalí-inglés en un mismo comentario.
- Función `predict()` lista para lotes de cadenas de texto; el paquete se descarga con `snapshot_download` y se carga con `joblib.load`.
- No soporta *tool calling*, agentes, razonamiento multi-paso, visión, audio ni modo *thinking*: es un clasificador discriminativo de una sola pasada.
- No genera texto: no es un modelo generativo ni un LLM.

## Casos de uso

- Línea base reproducible en investigación sobre acoso en bengalí: sirve como referencia clásica (TF-IDF + regresión logística) frente a la que medir modelos neuronales como BanglaBERT o LLMs multilingües, con la ventaja de que el código, los hiperparámetros y las matrices de confusión están publicados.
- Priorización de colas de anotación humana: usar la probabilidad de la clase *bullying* para ordenar comentarios y que las personas anotadoras revisen primero los casos de mayor score, aceptando el 56,3 % de exactitud porque el coste del error lo absorbe la revisión humana posterior.
- Estudio de la relación entre sentimiento y acoso: la etapa 1 permite analizar la distribución de las 9 clases de sentimiento sobre un corpus nuevo y contrastar hipótesis del manuscrito (por ejemplo, cuánto se solapan Agresivo y *bullying*).
- Análisis diacrónico o por plataforma de un corpus de YouTube y Facebook de Bangladesh: al ser un modelo de CPU y muy ligero, se puede ejecutar sobre decenas de miles de comentarios en minutos para estudiar tendencias por tema o por año.
- Docencia y reproducción de experimentos de NLP clásico: el par de vectorizadores y las dos regresiones ilustran de forma compacta técnicas de TF-IDF con n-gramas de carácter, ponderación de clases y entrenamiento apilado con predicciones *out-of-fold*.
- Evaluación de robustez ortográfica: comparar el rendimiento del modelo sobre texto en escritura bengalí frente a transliteraciones romanizadas del mismo comentario para cuantificar la degradación causada por la variación de grafía.
- Filtro de descarte en un pipeline de etiquetado semiautomático, nunca como decisión final: dado que el modelo acierta el 69 % de los casos de *bullying* pero solo el 32 % de los *neutral*, puede usarse para separar el subconjunto que requiere revisión, no para publicar ni reportar a usuarios.

## Benchmarks y rendimiento

Validación cruzada estratificada de 5 pliegues repetida 3 veces (datos de la model card):

| Modelo de acoso (3 clases) | Exactitud | F1 macro | Recall *bullying* | Recall *non_bullying* | Recall *neutral* |
|---|---|---|---|---|---|
| Dos etapas con sentimiento predicho (este modelo) | 56,3 % | 0,490 | 69 % | 46 % | 32 % |
| Solo texto (sin etapa de sentimiento) | 56,3 % | 0,487 | 70 % | 44 % | 32 % |
| Texto + etiqueta humana de sentimiento (cota superior) | 75,7 % | 0,670 | 92 % | 61 % | 50 % |
| Línea base mayoritaria (siempre «bullying») | 54,6 % | 0,240 | — | — | — |

Etapa 1 (9 clases de sentimiento):

| Métrica | Valor |
|---|---|
| Exactitud | 49,4 % |
| F1 macro | 0,310 |
| Recall de Sarcástico, Triste y Feliz | por debajo del 12 % en cada clase |

Lectura de los resultados según el autor: el sentimiento predicho apenas aporta sobre el texto solo, porque la etapa 1 es poco fiable; la cota de 75,7 % exige la etiqueta humana de sentimiento, que nunca está disponible para un comentario nuevo.

## Requisitos de hardware

- Inferencia en CPU exclusivamente; no se necesita GPU. El repositorio ocupa 0,0 GB según los metadatos de Hugging Face y el artefacto es un joblib con dos matrices dispersas y dos regresiones logísticas.
- VRAM estimada: 0 GB. El modelo cabe holgadamente en la memoria RAM de cualquier equipo; se puede ejecutar en contenedores pequeños o en el navegador mediante un Space de Hugging Face.
- GPU recomendadas: ninguna. Cualquier CPU moderna es suficiente; no hay soporte CUDA ni aceleración por hardware documentada.
- Opciones de despliegue: carga directa con `joblib` en Python 3 con scikit-learn 1.9.1 (versión estricta, por compatibilidad del serializado); envoltorio propio con FastAPI, Flask o similar; el autor publica una demo interactiva como Space de Hugging Face. No hay soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada. Por la naturaleza del modelo (TF-IDF disperso y regresión logística), se espera que sean muy bajos y altos respectivamente, pero no se han publicado cifras.

## Comparativa con modelos similares

Comparativa interna publicada en la model card (misma validación cruzada):

| Variante | Exactitud | F1 macro | Licencia | Disponibilidad |
|---|---|---|---|---|
| Dos etapas, sentimiento predicho | 56,3 % | 0,490 | MIT | Hugging Face (este modelo) |
| Solo texto | 56,3 % | 0,487 | MIT | Misma ficha, variante evaluada |
| Texto + sentimiento humano (cota superior) | 75,7 % | 0,670 | No aplicable | No desplegable en producción |

Alternativas externas de la misma categoría (clasificación de texto en bengalí):

| Alternativa | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (TF-IDF + regresión logística) | No aplicable (hasta 18.000 rasgos configurados) | No aplicable | 56,3 % exactitud, F1 macro 0,490 | MIT | Hugging Face |
| Clasificadores basados en BanglaBERT u otros transformers en bengalí | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |
| LLMs multilingües con prompts para clasificación | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

No se han proporcionado resultados de benchmarks de modelos competidores, por lo que la comparación cuantitativa con alternativas neuronales queda como no disponible.

## Limitaciones y advertencias

- **Restricción de uso explícita:** el autor lo declara «research use only, not a moderation tool» y advierte de que no debe emplearse para sancionar, reportar o etiquetar a personas reales. Falla en más de cuatro de cada diez comentarios.
- **Rendimiento bajo:** 56,3 % de exactitud y 0,490 de F1 macro en la tarea de acoso, frente a una línea base mayoritaria del 54,6 %. La mejora sobre la línea base es de apenas 1,7 puntos de exactitud.
- **Etapa de sentimiento poco fiable:** 49,4 % de exactitud y 0,310 de F1 macro en 9 clases; Sarcástico, Triste y Feliz se recuperan por debajo del 12 %. Esto invalida en la práctica el diseño de dos etapas.
- **Clases minoritarias desatendidas:** *neutral* se detecta solo en el 32 % de los casos y *non_bullying* en el 46 %, lo que genera falsos positivos desproporcionados en comentarios neutros o de apoyo.
- **Muestra estrecha:** comentarios mayoritariamente de 2024–2026 centrados en política, celebridades y actualidad de Bangladesh; otros temas, regiones y plataformas están infrarrepresentados, por lo que la generalización fuera de ese dominio no está respaldada.
- **Sin contexto:** al ser un modelo de bolsa de palabras no puede interpretar el contexto del hilo; insultos entrecomillados, reapropiados o condenados pueden marcarse igualmente como acoso.
- **Ortografía romanizada:** la variación de grafía es amplia y, aunque los n-gramas de carácter mitigan el problema, persisten errores sistemáticos.
- **Etiquetas subjetivas:** las clases reflejan el juicio de tres anotadores fusionado con reglas de prioridad fijas, no una verdad objetiva; los sesgos de esos anotadores se heredan.
- **Dependencia de versión:** requiere scikit-learn 1.9.1 exactamente; otras versiones pueden romper la carga del joblib por incompatibilidad del serializado.
- **Riesgo de alucinación:** no aplica en sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos con consecuencias reales si se usa para moderar.
- **Licencia:** MIT permite uso comercial, pero la advertencia del autor sobre el uso previsto y los resultados de evaluación desaconsejan cualquier despliegue automatizado sin supervisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abir71/bangla-cyberbullying-two-stage
- Demo interactiva (Space): https://huggingface.co/spaces/abir71/bangla-cyberbullying-demo
- Dataset en Kaggle: https://www.kaggle.com/datasets/abirhosenashik/bangla-comments-bullying-sentiment
- Dataset en Hugging Face: https://huggingface.co/datasets/abirhosenashik/bangla-comments-bullying-sentiment
- Paper: no disponible (manuscrito en revisión, sin enlace público en la información proporcionada)
