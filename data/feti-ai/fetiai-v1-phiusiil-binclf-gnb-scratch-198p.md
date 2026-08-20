# feti-ai/fetiai-v1-phiusiil-binclf-gnb-scratch-198p

## Resumen

El modelo `fetiai-v1-phiusiil-binclf-gnb-scratch-198p` es un clasificador binario de phishing basado en un Gaussian Naive Bayes implementado desde cero, desarrollado por el grupo 16 del curso IF3070 de la STEI ITB (Indonesia) como trabajo académico. Su función es clasificar URLs como legítimas o fraudulentas a partir de un vector de 49 características numéricas previamente extraídas, sin procesar directamente el texto de la URL. Con solo 198 parámetros y un peso de 672 KB, es un ejemplo extremo de modelo ligero y transparente, distribuido bajo licencia MIT y servido como una API HTTP autocontenida.

El modelo se entrenó sobre el dataset PhiUSIIL (Phishing URL Dataset, UCI), un conjunto de datos estático de 2023-24, y utiliza SMOTE para balancear las clases. Aunque su precisión global es alta (97,8 % de accuracy), el propio autor advierte explícitamente que no debe usarse como producto de seguridad real, sino como una reimplementación didáctica de un algoritmo clásico. Su relevancia actual radica en demostrar cómo un modelo clásico de aprendizaje automático puede empaquetarse, desplegarse y servirse con las mismas prácticas de ingeniería que un modelo de deep learning, incluyendo contenedores Docker, pruebas de autoverificación y una API documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gaussian Naive Bayes (implementado desde cero) |
| Parametros totales | 198 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | No disponible (modelo clásico, no utiliza cuantización) |
| Idiomas soportados | No disponible (no procesa texto, solo características numéricas) |
| Licencia | MIT |
| Formato de pesos | No disponible (el modelo se distribuye como artefacto de 672 KB, probablemente en formato NumPy, pero no se especifica) |

## Arquitectura y entrenamiento

El modelo implementa un clasificador Gaussian Naive Bayes, que asume independencia condicional entre las características y modela cada una mediante una distribución normal por clase. Durante el entrenamiento se estiman las medias y varianzas de cada característica para las clases "legítimo" y "phishing". La implementación se realizó desde cero con NumPy y pandas, sin usar librerías de machine learning de alto nivel.

El entrenamiento se llevó a cabo sobre el dataset PhiUSIIL, que contiene características extraídas de URLs reales. Se aplicó SMOTE (Synthetic Minority Over-sampling Technique) para mitigar el desbalanceo de clases y se realizó ingeniería de características. No se utilizaron técnicas de RLHF, DPO ni ajuste fino por refuerzo, ya que no es un modelo generativo. La innovación principal no está en el algoritmo, sino en el empaquetado: el modelo se sirve como una API REST con rutas para predicción individual, predicción por lotes, metadatos y health checks, y se incluye una prueba de autoverificación (golden-row self-test) que garantiza que el artefacto reproduce su predicción registrada.

## Capacidades

- Clasificación binaria de phishing: dado un vector de 49 características numéricas, devuelve una etiqueta (0 o 1) y una puntuación de phishing.
- Manejo de valores nulos: acepta entradas con `null` y realiza imputación automática; 12 de las 49 características están permanentemente nulas por diseño.
- API HTTP completa: rutas `POST /predict` (una fila), `POST /predict/batch` (hasta 1000 filas), `GET /metadata` (contrato de características y métricas), `GET /healthz` y `GET /readyz`.
- Despliegue autocontenido: el modelo está incluido en el repositorio y en la imagen Docker, sin necesidad de descargar pesos ni entrenar.
- No soporta tool calling, ni agentes, ni razonamiento multi-paso, ni procesamiento de lenguaje natural, ni visión.

## Casos de uso

- Filtrado de URLs en un proxy corporativo: el modelo puede integrarse como un primer filtro que puntúe cada URL solicitada antes de aplicar políticas más estrictas. Su baja latencia (al ser un modelo de 198 parámetros) permite evaluar cientos de URLs por segundo en CPU.
- Componente educativo en cursos de machine learning: sirve como ejemplo de implementación desde cero de Naive Bayes, con código legible y documentado, ideal para que estudiantes comparen con versiones de scikit-learn.
- Demostración de despliegue de modelos con Docker y FastAPI: el repositorio incluye un `Makefile` y una imagen Docker que hornea el modelo, lo que lo convierte en una plantilla para enseñar buenas prácticas de MLOps.
- Prototipado de sistemas de detección de phishing en entornos académicos: investigadores pueden usarlo como baseline clásico para comparar con modelos más complejos (redes neuronales, transformers) sobre el mismo dataset.
- Análisis de características de URLs: al ser un modelo transparente, se pueden inspeccionar las medias y varianzas aprendidas para entender qué características discriminan mejor entre legítimo y phishing.
- Pruebas de integración en pipelines de seguridad simulados: dado que expone una API con endpoints de salud y autoverificación, puede usarse en entornos de prueba para validar la orquestación de microservicios.

## Benchmarks y rendimiento

Según los datos declarados por el autor en la model card, el modelo alcanza los siguientes resultados sobre el dataset PhiUSIIL:

| Metrica | Valor |
|---|---|
| Accuracy | 0,9779 |
| Precision (phishing) | 0,9113 |
| Recall (phishing) | 0,7881 |

No se han publicado comparaciones con otros modelos en la información disponible. Los resultados no han sido verificados de forma independiente.

## Requisitos de hardware

- El modelo es extremadamente ligero: 198 parámetros y 672 KB de peso, por lo que no requiere GPU ni VRAM.
- Puede ejecutarse en cualquier CPU moderna, incluyendo Raspberry Pi o instancias cloud de tipo micro.
- El despliegue recomendado es mediante Docker (imagen que incluye el modelo) o directamente con el `Makefile` que crea un entorno virtual con dependencias fijadas.
- La API está construida con FastAPI (según la documentación), por lo que puede servirse con Uvicorn o cualquier servidor ASGI.
- La latencia estimada es del orden de microsegundos por predicción, aunque no se proporcionan datos oficiales de throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Dado que se trata de un clasificador clásico de phishing, podría compararse con Random Forest o XGBoost entrenados sobre el mismo dataset, pero no se han publicado dichos resultados. Se indica "no disponible".

## Limitaciones y advertencias

- No es un producto de seguridad: el autor lo califica explícitamente como una reimplementación académica, no apta para decidir si un enlace es seguro.
- Entrenado sobre un dataset estático (2023-24): no tiene inteligencia de amenazas, ni blocklist, ni conocimiento de campañas de phishing posteriores a su entrenamiento.
- Solo clasifica vectores de características: no acepta URLs crudas; necesita un extractor de características externo (proporcionado en el repositorio principal).
- Recall de phishing bajo (0,788): puede dejar pasar una proporción significativa de URLs maliciosas, lo que lo hace inadecuado como única capa de defensa.
- No soporta idiomas ni texto: las características son numéricas y no hay capacidad de procesamiento de lenguaje natural.
- La licencia MIT permite uso comercial, pero el autor desaconseja su uso en producción sin supervisión.

## Enlaces

- [HuggingFace - feti-ai/fetiai-v1-phiusiil-binclf-gnb-scratch-198p](https://huggingface.co/feti-ai/fetiai-v1-phiusiil-binclf-gnb-scratch-198p)
- [Dataset PhiUSIIL en UCI](https://archive.ics.uci.edu/dataset/967/phiusiil+phishing+url+dataset)
- [Repositorio de la aplicación completa](https://github.com/fetiai/phishing-url-classifier)
- [Demo en vivo](https://phiusiil.faizath.com)
