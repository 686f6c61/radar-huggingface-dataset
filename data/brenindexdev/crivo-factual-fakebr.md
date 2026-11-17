# brenindexdev/crivo-factual-fakebr

## Resumen

Crivo Factual es un conjunto de clasificadores binarios de texto en portugués brasileño orientados a la detección de noticias falsas y a la priorización de colas de verificación. No es una red neuronal ni un modelo generativo: se trata de tres pipelines de scikit-learn (TF-IDF de palabras y de n-gramas de caracteres combinados con regresión logística) distribuidos como artefactos joblib, desarrollados por el usuario brenindexdev. El proyecto cubre tres variantes: v1, especializada en artículos largos; v2, generalista para textos cortos y fuentes diversas; y unificado, que intenta cubrir ambos regímenes con un solo modelo.

La relevancia del proyecto reside en su enfoque explícitamente conservador: el autor insiste en que la salida es una señal de triaje, no un veredicto, y documenta con detalle los falsos positivos por fuente, la calibración no incluida y el sesgo estilístico de los corpus. Frente a alternativas neuronales como BERTimbau, los clasificadores lineales ofrecen un coste de inferencia mínimo (CPU, milisegundos por documento) y una trazabilidad razonable, a cambio de una menor capacidad de generalización en dominios mixtos.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamaño de 0,0 GB y fue creado el 17 de noviembre de 2026. La licencia es MIT y el único idioma declarado es el portugués.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: TF-IDF de palabras (unigramas y bigramas, sublinear, 50k features, stopwords en portugués) + TF-IDF de n-gramas de caracteres (3–5, 30k features) + regresión logística |
| Parametros totales | No disponible (modelo lineal; el número de coeficientes depende del vocabulario efectivo de cada artefacto) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un transformer; procesa el documento completo como bolsa de n-gramas, sin ventana fija) |
| Tipos de cuantizacion | No aplica (los artefactos joblib no se cuantizan; el tamaño lo determina el vocabulario y los coeficientes en coma flotante) |
| Idiomas soportados | Portugués (pt), con sesgo hacia portugués brasileño |
| Licencia | MIT |
| Formato de pesos | joblib (`model_v1.joblib`, `model_v2.joblib`, `model_unified.joblib`; `model.joblib` como alias compatible de v1) |

## Arquitectura y entrenamiento

Cada artefacto es un `Pipeline` completo de scikit-learn que incluye la vectorización y el clasificador, serializado con joblib. La vectorización combina dos representaciones: TF-IDF de palabras con unigramas y bigramas, ponderación sublinear, 50.000 features y eliminación de stopwords en portugués, y TF-IDF de n-gramas de caracteres de longitud 3 a 5 con 30.000 features. Sobre esa matriz se ajusta una regresión logística con C=4,0 en el modelo unificado y C=1,0 en v1 y v2. No hay embeddings contextuales, atención ni capas ocultas.

Los datos de entrenamiento proceden de dos corpus. v1 se entrenó con Fake.Br Corpus (Monteiro et al., 2018): 7.200 noticias, 3.600 falsas y 3.600 verdaderas, emparejadas sobre el mismo hecho, con un guarda de 500 caracteres mínimos para emitir opinión. v2 se entrenó con FakenewsBR (Silva et al., 2026): 36.594 ítems canónicos que incluyen noticias, tuits, mensajes de WhatsApp y contenido sobre COVID-19. El modelo unificado se entrenó con la unión de Fake.Br y FakenewsBR, 35.035 ítems, y emplea los mismos splits con semilla 42 y los mismos conjuntos de test que las variantes anteriores. Los 1.440 ítems del test de v1 se excluyeron del entrenamiento de v2 por fingerprint, lo que permite una comparación limpia entre ambas variantes sobre artículos. No se documenta uso de RLHF, DPO ni ajuste por preferencias; tampoco se ha publicado la calibración isotónica, que el autor decidió no incluir en el artefacto porque desplazaba el punto de operación hacia "falso".

## Capacidades

- Clasificación binaria de texto en portugués: devuelve una probabilidad estimada de que el texto sea falso mediante `predict_proba`.
- Detección sobre artículos periodísticos largos con la variante v1, que exige un mínimo de 500 caracteres para emitir juicio.
- Detección sobre textos cortos (tuits, mensajes de WhatsApp, titulares) con la variante v2.
- Cobertura de un solo modelo para cualquier longitud de entrada con la variante unificada.
- Enrutamiento por longitud: el README propone un router que usa v1 si el texto supera los 500 caracteres y v2 en caso contrario.
- Ejecución en CPU sin GPU, con latencia de milisegundos por documento al tratarse de un modelo lineal.
- Integración directa en Python mediante joblib y scikit-learn, sin servidor de inferencia dedicado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento. No es un modelo generativo.

## Casos de uso

- Triaje previo a verificación periodística: el score se usa para ordenar una cola de documentos candidatos a revisión manual, tal como describe el propio proyecto Crivo Factual, donde el veredicto final lo emiten reglas determinísticas sobre fuentes primarias (Cámara, Senado, Diário Oficial).
- Moderación de comentarios y publicaciones cortas en plataformas en portugués: la variante v2 procesa tuits y mensajes de WhatsApp, aunque el autor advierte de falsos positivos del 22 % en WhatsApp y del 53 % en tuits de MuMiN, por lo que solo es apta como señal débil.
- Monitorización de medios durante periodos electorales: v1, entrenada con noticias de 2016–2018, puede aplicarse a artículos completos para detectar estilo sensacionalista o clickbait y priorizar su revisión.
- Filtrado de corpus para investigación: el clasificador permite etiquetar a gran escala conjuntos de noticias en portugués antes de un análisis manual, con coste computacional despreciable en CPU.
- Enriquecimiento de pipelines de datos: al ser un pipeline de scikit-learn, se integra en procesos ETL de Python sin dependencias de GPU ni servicios externos.
- Detección de contenido sobre COVID-19 y bulos sanitarios: v2 incluye este dominio en su entrenamiento, con un 36 % de falsos positivos documentado en esa fuente, lo que limita su uso a una primera pasada.
- Prototipado y líneas base en investigación sobre desinformación: sirve como referencia lineal frente a modelos neuronales como BERTimbau en experimentos con los corpus Fake.Br y FakenewsBR.

## Benchmarks y rendimiento

Resultados medidos y publicados por el autor en la model card. Las columnas de artículos usan n=1.440; la columna mixta de v2 usa n=7.319. BERTimbau se entrenó con los mismos splits (semilla 42) y los mismos tests, en una GPU T4 de Kaggle.

| Métrica | v1 (artículos) | v2 (mixto) | v2 en artículos de v1 | Unificado (artículos) | Unificado (mixto) | BERTimbau (artículos) | BERTimbau (mixto) |
|---|---|---|---|---|---|---|---|
| Acurácia | 0,9708 | 0,8086 | 0,8854 | 0,9646 | 0,8386 | 0,9868 | 0,8507 |
| F1-macro | 0,9708 | 0,7676 | 0,8841 | 0,9646 | 0,7924 | 0,9868 | 0,8184 |
| ROC-AUC | 0,9960 | 0,8575 | 0,9888 | No disponible | No disponible | No disponible | No disponible |
| Brier | 0,0418 | 0,1444 | 0,0926 | No disponible | No disponible | No disponible | No disponible |

El autor señala que el rendimiento en el conjunto mixto queda limitado por los datos y no por el modelo: el techo medido del clasificador lineal sin las peores fuentes es 0,8183 de F1, prácticamente idéntico al 0,8184 de BERTimbau en el conjunto completo.

## Requisitos de hardware

- Inferencia en CPU: no requiere GPU. El pipeline TF-IDF más regresión logística se ejecuta en milisegundos por documento en un núcleo convencional.
- VRAM estimada: 0 GB. No hay componente neuronal.
- GPU recomendadas: ninguna. Cualquier GPU sería irrelevante para la inferencia; el entrenamiento de BERTimbau de referencia se hizo en una T4 de Kaggle, pero no forma parte de este repositorio.
- Cabe en cualquier equipo consumer, incluidos portátiles de gama baja y entornos sin acelerador.
- Opciones de despliegue: carga directa con `joblib.load` en Python; al ser scikit-learn, puede servirse con FastAPI, Flask, BentoML o cualquier framework que envuelva Python. No aplica vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos neuronales.
- Latencia y throughput: no se han publicado mediciones formales. Por la naturaleza del modelo (producto matriz-vector disperso), se espera un throughput alto en CPU, pero el dato no está documentado.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | F1 artículos | F1 mixto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Crivo Factual v1 | TF-IDF + regresión logística | No disponible | Bolsa de n-gramas, sin ventana | 0,9708 | No aplica | MIT | Hugging Face (joblib) |
| Crivo Factual v2 | TF-IDF + regresión logística | No disponible | Bolsa de n-gramas, sin ventana | 0,8841 (sobre test de v1) | 0,7676 | MIT | Hugging Face (joblib) |
| Crivo Factual unificado | TF-IDF + regresión logística | No disponible | Bolsa de n-gramas, sin ventana | 0,9646 | 0,7924 | MIT | Hugging Face (joblib) |
| BERTimbau (referencia del autor) | Transformer encoder | No disponible en la información | No disponible en la información | 0,9868 | 0,8184 | No disponible en la información | Pesos no subidos a Hugging Face; salida en la sesión de Kaggle |

No se han proporcionado comparaciones con otros detectores de noticias falsas en portugués distintos de BERTimbau.

## Limitaciones y advertencias

- El modelo no emite veredictos: el autor lo describe explícitamente como una señal de triaje que solo prioriza la cola de verificación. Ningún número del modelo declara una noticia falsa.
- Falsos positivos fuertemente dependientes de la fuente en v2: 5 % en noticias políticas, 9 % en artículos de Fake.Br, 22 % en WhatsApp, 36 % en COVID, 53 % en tuits de MuMiN y 58 % en noticias verdaderas de Kaggle.
- En textos cortos, un texto verdadero puntúa de media 0,46 y uno falso 0,72, pero una frase común y verdadera puede alcanzar 0,80. La separación existe, pero el umbral es frágil.
- v2 no sustituye a v1 en artículos largos: F1 de 0,8841 frente a 0,9708 en el test de v1.
- La calibración isotónica no se incluye en el artefacto: mejora el Brier, pero desplaza el punto de operación hacia "falso" (de 590 a 1.011 falsos positivos en el test mixto).
- Sesgo de estilo: los corpus presentan marcas estilísticas fuertes (sensacionalismo, clickbait) y el modelo aprende estilo tanto como contenido, lo que puede penalizar textos legítimos con registro llamativo.
- Desfase temporal de los datos: Fake.Br cubre 2016–2018 y FakenewsBR llega hasta 2022; el vocabulario y los temas posteriores no están representados.
- Ámbito lingüístico limitado al portugués, con sesgo hacia la variante brasileña. No hay soporte para otras lenguas.
- Licencia MIT, que permite uso comercial, pero sin garantías y sin que el autor asuma responsabilidad por decisiones tomadas a partir del score.
- El repositorio no tiene descargas ni validación externa de la comunidad; los resultados son los reportados por el autor, no replicados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brenindexdev/crivo-factual-fakebr
- Corpus Fake.Br: https://github.com/roneysco/Fake.br-Corpus
- Corpus FakenewsBR: https://github.com/AKCIT-FN/fakenews-data
- Referencia de Monteiro et al. (2018), PROPOR 2018, LNCS vol. 11122, Springer (sin URL proporcionada)
- Referencia de Silva et al. (2026), DSW 2026 (sin URL proporcionada)
