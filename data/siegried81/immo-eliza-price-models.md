# Siegried81/immo-eliza-price-models

## Resumen

Immo Eliza es un conjunto de cinco pipelines de scikit-learn con XGBoost como estimador final, publicados por el usuario Siegried81, que estiman el precio de salida (asking price) de viviendas en Bélgica. No es un modelo de lenguaje ni una red neuronal: es un sistema de regresión tabular orientado a producción, servido a través de una API y una aplicación web alojadas en el repositorio `immo-eliza-deployment`. El paquete cubre el segmento estándar de precios, un clasificador que detecta el 1 % superior (por encima de 1.949.050 €) y un modelo específico para ese segmento de lujo, además de dos modelos cuantílicos (percentiles 10 y 90) para construir intervalos de predicción.

La relevancia es práctica: demuestra un patrón de despliegue completo para modelos tabulares pequeños, con enrutamiento condicional entre modelos, calibración conforme de intervalos y separación entre features crudas y features engineering. Su tamaño es despreciable (el repositorio figura como 0,0 GB) y la inferencia es trivial en CPU, lo que lo hace adecuado como referencia para proyectos de ML aplicado a datos inmobiliarios.

Las limitaciones son explícitas en la model card: se entrena sobre unos 11.000 anuncios raspados una sola vez de Immovlan, con precios de oferta y no de venta, y el error medio absoluto porcentual (MAPE) global es del 20,3 % sobre un conjunto de test de 2.361 anuncios. La licencia no está declarada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipelines de scikit-learn con target encoding (`category_encoders`) + XGBoost (gradient boosting sobre árboles) |
| Parámetros totales | No disponible (modelo tabular; el número de árboles y profundidad no se publica) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada tabular con features engineered, no texto) |
| Tipos de cuantización | No disponible (no se distribuyen pesos cuantizados; los artefactos son `.joblib`) |
| Idiomas soportados | No disponible (las categorías de ciudades y provincias están en neerlandés/francés/inglés según el scraping) |
| Licencia | No disponible |
| Formato de pesos | `.joblib` (pickles de scikit-learn), más ficheros JSON auxiliares (`luxury_threshold.json`, `interval_calibration.json`, `categories.json`, `locations.json`) |

## Arquitectura y entrenamiento

Cada uno de los cinco modelos es una pipeline que aplica codificación de variables categóricas por target encoding y alimenta un regresor XGBoost. El modelo estándar (`pipeline.joblib`) predice el logaritmo del precio, entrenado sobre precios recortados al rango 69.000–1.949.050 €. El clasificador de lujo (`luxury_classifier.joblib`) estima la probabilidad de pertenecer al 1 % superior de precios; si esa probabilidad es igual o superior a 0,9, la petición se enruta al modelo de lujo (`pipeline_luxury.joblib`), entrenado con solo 111 anuncios. Los modelos `pipeline_lower.joblib` y `pipeline_upper.joblib` son regresiones cuantílicas en los percentiles 10 y 90 del segmento estándar, y `interval_calibration.json` contiene un margen conforme que amplía ese rango hasta una cobertura del 80 %.

Los datos de entrenamiento son aproximadamente 11.000 anuncios inmobiliarios belgas obtenidos con un único raspado de Immovlan, con precios de oferta. No se redistribuyen los datos. La model card no documenta número de tokens (no aplica), composición detallada del dataset, ni procesos de RLHF/DPO (no aplica a un modelo tabular). La innovación técnica destacable es el diseño de enrutamiento por umbral con un clasificador auxiliar y la calibración conforme de los intervalos, que elevó la cobertura del 70,8 % al 80,4 % sobre el conjunto de test.

## Capacidades

- Regresión de precio de salida para casas y apartamentos en Bélgica a partir de features tabulares (código postal, provincia, ciudad, tipo de propiedad, superficie habitable, año de construcción, entre otras).
- Clasificación binaria implícita del segmento de lujo mediante `luxury_classifier.joblib` y umbral de enrutamiento configurable (0,9 por defecto).
- Predicción por intervalos: rango entre los percentiles 10 y 90 calibrado para una cobertura del 80 % en el segmento estándar.
- Enrutamiento condicional entre modelos mediante la función `route()` del repositorio de despliegue.
- Resolución de localización: `locations.json` mapea cada código postal y ciudad a las coordenadas medianas de sus anuncios de entrenamiento, y cada ciudad a su código postal habitual.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es exclusivamente un modelo tabular de regresión.

## Casos de uso

- **Tasación orientativa en portales inmobiliarios**: dado un anuncio con código postal, tipo de propiedad y superficie, el modelo devuelve una estimación de precio de salida con un MAPE esperado en torno al 20 %; suficiente para ordenar resultados o señalar anuncios fuera de mercado, no para sustituir una tasación.
- **Detección de infravaloración o sobrevaloración**: comparando el precio publicado con la predicción del pipeline estándar se pueden generar alertas para compradores o agentes; el sesgo conocido (+22 % mediano por debajo de 150.000 € y −10 % entre 500.000 € y 1 M €) debe corregirse o documentarse en la interfaz.
- **Segmentación del mercado de lujo**: el clasificador `luxury_classifier.joblib` permite etiquetar automáticamente inmuebles del 1 % superior (por encima de 1.949.050 €) para dirigirlos a flujos comerciales distintos, con la advertencia de que el modelo de precio de ese segmento se entrenó con solo 111 anuncios y su MAPE es del 43,9 %.
- **Bandas de confianza en una API pública**: los modelos cuantílicos más el margen conforme permiten devolver un intervalo con cobertura nominal del 80 %, útil para mostrar al usuario un rango en lugar de una cifra única; la cobertura cae a aproximadamente el 74 % por encima de 500.000 €.
- **Prototipado de un servicio de valoración**: el repositorio de despliegue incluye API y aplicación web, de modo que el paquete sirve como plantilla completa (descarga de artefactos desde Hugging Face, carga de pipelines, enrutamiento y respuesta) para montar un MVP de valoración inmobiliaria en pocos pasos.
- **Análisis exploratorio de mercado por región**: usando `locations.json` y `categories.json` se pueden agregar predicciones por provincia o ciudad y detectar desviaciones sistemáticas, siempre que se respete la limitación de que una ciudad fuera del vocabulario de entrenamiento se ignora.
- **Docencia y reproducción de pipelines tabulares**: el diseño con target encoding, enrutamiento por clasificador y calibración conforme es un ejemplo compacto y reproducible para cursos de ML aplicado, con dependencias fijadas (`scikit-learn==1.9.0`, `xgboost==3.2.0`, `category_encoders==2.8.1`).

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el split de test de `src/train.py` (2.361 anuncios no usados en ajuste, tuning ni selección), con enrutamiento a umbral 0,9:

| Segmento | MAPE |
|---|---:|
| Todos los anuncios | 20,3 % |
| < 1 M € | 19,8 % |
| 1 M € – 1,95 M € | 27,4 % |
| ≥ 1,95 M € (21 anuncios) | 43,9 % |

Datos adicionales reportados: error mediano del 12,9 %; intervalo bootstrap del 95 % sobre el MAPE global de 19,1 % a 21,6 %; el rango p10–p90 contuvo el precio real en el 80,4 % de los 2.344 anuncios del segmento estándar (objetivo 80 %, 70,8 % antes de calibración en un split separado), con cobertura de aproximadamente el 74 % para estimaciones por encima de 500.000 €. El segmento de lujo no dispone de intervalo.

## Requisitos de hardware

- Inferencia en CPU: los pipelines XGBoost con target encoding son ligeros; el repositorio figura con 0,0 GB y no se publica el número de árboles, pero el orden de magnitud es de megabytes, ejecutable en cualquier portátil.
- VRAM: no aplica; no requiere GPU.
- GPU recomendadas: ninguna. Cualquier GPU sería innecesaria para servir este modelo.
- Cabe en cualquier GPU consumer y en entornos sin GPU (contenedores, funciones serverless, Raspberry Pi).
- Despliegue: el propio repositorio `immo-eliza-deployment` expone la API y la web app; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos tabulares.
- Latencia y throughput: no disponibles en la información proporcionada; por la naturaleza del modelo (predicción de un solo registro con árboles poco profundos) se espera latencia de milisegundos en CPU, pero no se aporta medición.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia cualitativa, los modelos de gradient boosting tabular de uso común (XGBoost, LightGBM, CatBoost) comparten familia algorítmica, pero no se han publicado aquí resultados de este conjunto frente a alternativas concretas ni sus especificaciones.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Immo Eliza (este) | No disponible | No aplica | MAPE 20,3 % en test | No disponible | Hugging Face + GitHub |
| Alternativas | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Es una herramienta de estimación, no una tasación: los precios son de oferta (asking prices) y no de venta, lo que introduce sesgo estructural al alza respecto al precio de transacción.
- Sesgo conocido por tramos: sobreestima de forma mediana un +22 % por debajo de 150.000 € y subestima un −10 % entre 500.000 € y 1 M €.
- El segmento de lujo (≥ 1,95 M €) se subestima un −41 % con enrutamiento y un −51 % sin él, y su modelo se entrenó con solo 111 anuncios; el MAPE en ese tramo es del 43,9 % sobre 21 anuncios de test, una muestra muy pequeña.
- La localización se aproxima por el centroide de los anuncios de entrenamiento del código postal (o de la ciudad si el código postal no tiene anuncios), lo que pierde variación intra-barrio.
- Un año de construcción ausente se imputa con la mediana de entrenamiento (1974); una ciudad fuera del vocabulario de entrenamiento se ignora, lo que puede producir predicciones degeneradas para localidades no vistas.
- El intervalo p10–p90 solo cubre el segmento estándar y su cobertura baja a aproximadamente el 74 % por encima de 500.000 €; el segmento de lujo no tiene intervalo.
- Los artefactos son pickles (`.joblib`): solo deben cargarse desde un repositorio de confianza, y requieren versiones exactas de dependencias (`scikit-learn==1.9.0`, `xgboost==3.2.0`, `category_encoders==2.8.1`); otras versiones pueden romper la deserialización.
- Los pipelines esperan features engineered, no entrada cruda: deben usarse a través de `api/predict.py`.
- La licencia no está declarada, por lo que no puede asumirse permiso para uso comercial; debe consultarse con el autor.
- No se redistribuyen los datos de entrenamiento, lo que limita la reproducibilidad completa del ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Siegried81/immo-eliza-price-models
- Repositorio de despliegue (API y web app): https://github.com/Siegried81/immo-eliza-deployment
- Fuente de datos citada: Immovlan (https://www.immovlan.be)
