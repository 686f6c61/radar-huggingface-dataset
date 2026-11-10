# alm7zm/darscope-rent-model

## Resumen

DarScope rent model es un modelo de regresión tabular basado en Ridge que estima el alquiler anual, en riyales saudíes (SAR), de villas y dúplex en cuatro ciudades de Arabia Saudí: Riad, Yeda, Dammam y Al Khobar. Lo desarrolla el equipo de DarScope (usuario `alm7zm`) como componente del proyecto de curso SE411, una aplicación web para la gestión de viviendas en alquiler que muestra la sugerencia de renta junto al campo correspondiente al añadir o editar una propiedad.

No es un modelo de lenguaje ni una red neuronal: se trata de un pipeline de scikit-learn (`TransformedTargetRegressor` con `OneHotEncoder`, `TargetEncoder`, `StandardScaler` y `Ridge(alpha=1)`) entrenado sobre anuncios de alquiler de 2021. La predicción se hace sobre el logaritmo de la renta y se reexpone con `exp`. El modelo completo cabe en un JSON de unos 10 KB, lo que lo hace trivial de desplegar incluso sin dependencias.

Su relevancia es acotada y muy específica: sirve como estimador de referencia (baseline) para una aplicación concreta y como ejemplo de ingeniería de features tabulares con codificación objetivo por distrito. El error medio (MAPE) es del 23,1% sobre un conjunto de test de 304 viviendas, con un 46,1% de predicciones dentro del ±15%. La licencia es CC BY 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión lineal Ridge sobre features tabulares transformadas (pipeline scikit-learn) |
| Parametros totales | No disponible (no es un modelo neuronal; los pesos caben en un JSON de ~10 KB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo tabular, sin ventana de contexto) |
| Tipos de cuantizacion | No aplica (coeficientes en coma flotante dentro de JSON o pickle) |
| Idiomas soportados | Árabe (ar) e inglés (en), únicamente para los campos de texto de entrada (distrito y descripción) |
| Licencia | CC BY 4.0 |
| Formato de pesos | JSON (`rent-model.json`) y joblib/pickle (`rent-model.joblib`) |

## Arquitectura y entrenamiento

El modelo es un `TransformedTargetRegressor` con transformación logarítmica de la variable objetivo (log/exp) que envuelve un pipeline compuesto por `OneHotEncoder` (ciudad, orientación de fachada y tipo de vivienda), `TargetEncoder` (distrito codificado dentro de su ciudad) y `StandardScaler` sobre 25 variables numéricas escaladas, seguido de una regresión `Ridge` con `alpha=1`. En total, 29 entradas al modelo. Las features numéricas incluyen el logaritmo de la superficie, la superficie por dormitorio y el recuento de amenities, entre otras.

Los datos provienen del dataset público Saudi Arabia Real Estate (AQAR) de Kaggle: 3.718 filas originales, de las que quedan 1.418 viviendas tras el proceso de limpieza (aproximadamente el 60% de las filas eran duplicados). La partición de test reserva 1 de cada 5 viviendas mediante un hash de sus atributos, de modo que las copias de una misma vivienda nunca caen en ambos lados; todas las decisiones de diseño se tomaron con validación cruzada agrupada de 5 folds sobre las 1.114 restantes. Tras la evaluación, el modelo final se reentrenó con las 1.418 viviendas. No hay RLHF, DPO ni ajuste por preferencias: es aprendizaje supervisado clásico. Se probó también un modelo de gradient boosting promediado con Ridge, pero no aportó mejora (MAPE idéntico del 23,1%), por lo que se conservó la variante más simple.

## Capacidades

- Predicción puntual de la renta anual en SAR para villas y dúplex en Riad, Yeda, Dammam y Al Khobar.
- Entrada estructurada con 29 features derivadas de ciudad, distrito, orientación de fachada, tipo, superficie en m², antigüedad, número de dormitorios, baños y salones, 13 amenities y dos marcas léxicas extraídas de la descripción en árabe (ملحق, anexo; درج داخلي, escalera interior).
- Inferencia sin dependencias mediante `predict.py` sobre el JSON de pesos, y alternativa con scikit-learn 1.7.2 cargando el joblib; ambas rutas coinciden con una tolerancia del 0,01%.
- Manejo explícito de distritos desconocidos: recurre a la media de distrito y eleva el error hasta aproximadamente el 32%.
- Validación de rango de superficie: `predict` devuelve `None` fuera del intervalo 100–1.652 m².
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto libre.

## Casos de uso

- Sugerencia de renta en el formulario de alta de una vivienda: la aplicación DarScope muestra la estimación junto al campo de alquiler al crear o editar una propiedad, de modo que el gestor tiene una referencia inmediata antes de fijar el precio.
- Herramienta interna de tasación rápida para pequeñas gestoras de alquiler en Riad o Yeda: dado un inventario de villas con sus atributos, se puede calcular una renta de referencia por unidad y detectar desviaciones frente al precio publicado.
- Análisis de sensibilidad de precio: variando features como superficie, número de dormitorios o amenities en el JSON de pesos se estima cuánto contribuye cada atributo a la renta sugerida, útil para priorizar reformas (piscina, garaje, ascensor).
- Prototipado y docencia: por su tamaño (10 KB) y su pipeline transparente, sirve como ejemplo reproducible de ingeniería de features tabulares con codificación objetivo por distrito y validación agrupada, adecuado para cursos de machine learning aplicado.
- Integración ligera en backends sin stack de ML: al poder ejecutarse con `predict.py` sin librerías, se puede incrustar en un servicio web o en un script de validación sin desplegar dependencias pesadas.
- Comparación con modelos de boosting: el propio autor lo usa como baseline frente a gradient boosting; sirve para verificar si un modelo más complejo justifica su coste en un problema tabular de este tamaño.

## Benchmarks y rendimiento

Resultados medidos una sola vez sobre 304 viviendas reservadas del entrenamiento:

| Modelo | MAPE | Error medio (SAR) | Dentro del ±15% |
|---|---|---|---|
| Este modelo (Ridge) | 23,1% | 22.998 | 46,1% |
| Ridge y gradient boosting promediados | 23,1% | 22.871 | 46,4% |
| Baseline: solo ciudad y superficie | 38,8% | 34.562 | 24,7% |

No se han publicado otros resultados de benchmarks en la información disponible. El error sube a aproximadamente el 32% para distritos no vistos durante el entrenamiento.

## Requisitos de hardware

- VRAM: no aplica; el modelo no usa GPU.
- CPU: cualquier procesador convencional basta; la inferencia es una suma ponderada de 29 entradas.
- Memoria: el JSON de pesos ocupa unos 10 KB y el joblib es igualmente reducido; el coste dominante es cargar pandas y scikit-learn si se usa la ruta joblib.
- GPU recomendadas: ninguna.
- ¿Cabe en GPU de consumo? No aplica; se ejecuta en CPU sin problema.
- Opciones de despliegue: `predict.py` sin dependencias sobre `rent-model.json`, o scikit-learn 1.7.2 con `rent-model.joblib`; también se puede portar la suma de pesos a cualquier lenguaje.
- Latencia y throughput: no disponibles de forma explícita; por la naturaleza del modelo (una suma lineal), la latencia por predicción es del orden de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | MAPE (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DarScope rent model | Ridge tabular | ~10 KB de pesos | No aplica | 23,1% | CC BY 4.0 | Hugging Face |
| Ridge + gradient boosting promediados | Ensemble tabular | No disponible | No aplica | 23,1% | No disponible | Mismo repositorio (variante descartada) |
| Baseline ciudad + superficie | Regresión simple | No disponible | No aplica | 38,8% | No disponible | Referencia interna del autor |

No se conocen en la información proporcionada otros modelos públicos comparables específicos para estimación de alquiler en Arabia Saudí; indicado como no disponible.

## Limitaciones y advertencias

- Los datos son anuncios de 2021, no contratos firmados; las rentas de mercado han cambiado desde entonces y la predicción debe tratarse como sugerencia histórica, no como tasación.
- Cobertura restringida a villas y dúplex en cuatro ciudades (Riad, Yeda, Dammam y Al Khobar) y a superficies entre 100 y 1.652 m²; fuera de ese rango `predict` devuelve `None`.
- El rendimiento declarado se sostiene para rentas anuales entre 10.000 y 500.000 SAR.
- Solo conoce 203 distritos; para cualquier otro usa la media de distrito y el error sube a aproximadamente el 32%.
- Dammam y Al Khobar tienen muchas menos muestras que Riad y Yeda, por lo que sus distritos se aprenden con menos viviendas y la estimación es menos fiable.
- El conjunto de entrenamiento original contenía cerca del 60% de filas duplicadas; aunque la partición agrupada evita fugas, el volumen efectivo de datos es reducido (1.418 viviendas).
- El archivo `rent-model.joblib` es un pickle y puede ejecutar código al cargarse: solo deben cargarse ficheros de confianza.
- Licencia CC BY 4.0: permite uso comercial con atribución al equipo de DarScope; el modelo no contiene filas de los datos de entrenamiento, cuya licencia corresponde a los autores originales.
- Riesgo de extrapolación: al ser un modelo lineal sobre features transformadas, combinaciones atípicas de atributos pueden producir estimaciones poco realistas aunque estén dentro de los rangos nominales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alm7zm/darscope-rent-model
- Repositorio del proyecto DarScope: https://github.com/alm7zm/DarScope
- Informe del modelo de predicción: https://github.com/alm7zm/DarScope/blob/main/ai-model/prediction%20model.md
- Dataset de limpieza: https://huggingface.co/datasets/alm7zm/darscope-aqar-clean
- Dataset original en Kaggle: https://www.kaggle.com/datasets/lama122/saudi-arabia-real-estate-aqar
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
