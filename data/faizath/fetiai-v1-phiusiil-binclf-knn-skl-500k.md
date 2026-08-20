# faizath/fetiai-v1-phiusiil-binclf-knn-skl-500k

## Resumen

`fetiai-v1-phiusiil-binclf-knn-skl-500k` es un clasificador tabular binario basado en el algoritmo KNN (k-vecinos más próximos) implementado con scikit-learn, desarrollado por el grupo 16 de la asignatura IF3070 Foundations of Artificial Intelligence del STEI ITB (Indonesia). Su función es clasificar URLs como legítimas o fraudulentas (phishing) a partir de un vector de 49 características numéricas preextraídas, sin procesar directamente el texto de la URL.

El modelo se entrenó sobre el dataset PhiUSIIL Phishing URL Dataset (estático, 2023-24) y se distribuye como un artefacto de 2,6 MB que puede servirse inmediatamente mediante una API HTTP. Con 500.002 parámetros, es un modelo ligero pensado para inferencia de baja latencia en entornos sin GPU. Su relevancia radica en ser una reimplementación docente de un sistema de detección de phishing, con una licencia MIT que permite su uso y modificación libre, aunque el propio autor advierte explícitamente de que no es un producto de seguridad apto para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | KNN (k-vecinos más próximos) con scikit-learn |
| Parametros totales | 500.002 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular de 49 características) |
| Tipos de cuantizacion | no aplica (modelo clásico, no neuronal) |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | joblib (scikit-learn) |

## Arquitectura y entrenamiento

El modelo es un clasificador KNN clásico, no una red neuronal. Almacena una matriz de referencia de los vectores de características de entrenamiento y asigna la clase de una nueva muestra por mayoría de votos entre sus k vecinos más cercanos. El entrenamiento se realizó sobre el dataset PhiUSIIL, que contiene características de URLs como longitud de la URL, longitud del dominio, uso de HTTPS, entre otras (49 en total). Se aplicó SMOTE para balancear las clases y un proceso de ingeniería de características previo. El artefacto se guarda como un estimador plano de scikit-learn, de modo que su carga no depende de código adicional del repositorio.

No se dispone de información detallada sobre el número de tokens, composición exacta del dataset de entrenamiento ni sobre el uso de técnicas como RLHF o DPO, al tratarse de un modelo de aprendizaje automático clásico y no de un modelo de lenguaje.

## Capacidades

- Clasificación binaria de URLs como legítimas o phishing a partir de un vector de 49 características numéricas.
- Inferencia por lotes: la API acepta hasta 1000 filas por petición en `POST /predict/batch`.
- Manejo de valores nulos: acepta `null` en características no determinables y realiza imputación automática (en la respuesta indica cuántas características se imputaron y la cobertura real de la fila).
- Servicio HTTP con rutas de salud (`/healthz`, `/readyz`) y metadatos (`/metadata`).
- Autocomprobación: el artefacto incluye una prueba de golden row que verifica que la predicción reproducida coincide con la registrada.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio, al ser un clasificador tabular.

## Casos de uso

- Filtrado de URLs en pasarelas de correo electrónico: el modelo puede integrarse en un pipeline que extraiga las 49 características de cada enlace entrante y devuelva un veredicto de phishing, ayudando a bloquear mensajes maliciosos antes de que lleguen al usuario.
- Enriquecimiento de listas de reputación de dominios: dado un conjunto de URLs sospechosas, el modelo puede puntuarlas en lote (hasta 1000 por petición) para priorizar la revisión manual por parte de analistas de seguridad.
- Prototipado de sistemas de detección de phishing en entornos académicos: al ser un proyecto de curso con licencia MIT, sirve como base didáctica para estudiar la aplicación de KNN a problemas de seguridad y comparar con otros algoritmos.
- Evaluación de características de URLs en tiempo real: la API permite enviar una única fila de características y obtener un veredicto con una puntuación de phishing, útil para integrar en herramientas de análisis forense de enlaces.
- Demostración de despliegue de modelos clásicos con Docker: el repositorio incluye un Dockerfile que hornea el modelo en la imagen, lo que facilita reproducir el servicio en cualquier infraestructura.
- Comparación de rendimiento entre implementaciones: el autor ofrece una variante "from-scratch" (sin scikit-learn) que permite contrastar la eficiencia y exactitud de ambas aproximaciones.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card, sobre el dataset PhiUSIIL:

| Metrica | Valor |
|---|---|
| Accuracy | 0,9807 |
| Precision (phishing) | 0,9809 |
| Recall (phishing) | 0,7635 |

No se han publicado resultados comparativos con otros modelos en la información disponible. El recall de phishing es notablemente inferior a la precisión, lo que indica que el modelo tiende a clasificar como legítimas una proporción relevante de URLs maliciosas (falsos negativos).

## Requisitos de hardware

- El modelo es un clasificador KNN clásico de 2,6 MB, por lo que no requiere GPU ni VRAM.
- Puede ejecutarse en cualquier CPU moderna, incluso en dispositivos de bajos recursos (Raspberry Pi, contenedores ligeros).
- El despliegue se realiza mediante un servidor HTTP (FastAPI) o con Docker; no requiere vLLM, llama.cpp ni Ollama.
- La latencia de inferencia depende del tamaño de la matriz de referencia y del número de vecinos, pero para un solo vector es del orden de milisegundos en hardware convencional.
- El throughput estimado para peticiones por lotes de hasta 1000 filas es suficiente para aplicaciones de filtrado en tiempo real, aunque no se han publicado cifras oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (clasificadores tabulares de phishing con KNN) dentro de la documentación proporcionada. El autor menciona una variante "from-scratch" (`fetiai-v1-phiusiil-binclf-knn-scratch-500k`) que implementa el mismo algoritmo sin dependencias de scikit-learn, pero no se ofrecen métricas comparativas entre ambas.

## Limitaciones y advertencias

- El autor declara explícitamente que es una reimplementación de curso, no un producto de seguridad: no debe usarse para decidir si un enlace es seguro.
- El modelo se entrenó sobre un dataset estático de 2023-24, por lo que no tiene conocimiento de campañas de phishing posteriores ni inteligencia de amenazas actualizada.
- El recall de phishing es bajo (0,7635), lo que implica que alrededor de un 24% de las URLs maliciosas podrían clasificarse como legítimas.
- La entrada es un vector de 49 características preextraídas; el modelo no procesa la URL en bruto, por lo que depende de la calidad del extractor de características del sistema que lo integre.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado sobre un dataset concreto, puede presentar sesgos hacia los patrones de ese dataset.
- La licencia MIT permite uso comercial, pero la ausencia de garantías y la advertencia del autor desaconsejan su uso en entornos de producción sin una validación adicional.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/faizath/fetiai-v1-phiusiil-binclf-knn-skl-500k)
- [GitHub - repositorio del modelo](https://github.com/fetiai/fetiai-v1-phiusiil-binclf-knn-skl-500k)
- [Aplicación completa (repositorio)](https://github.com/fetiai/phishing-url-classifier)
- [Demo en vivo](https://phiusiil.faizath.com)
- [Dataset PhiUSIIL (UCI)](https://archive.ics.uci.edu/dataset/967/phiusiil+phishing+url+dataset)
