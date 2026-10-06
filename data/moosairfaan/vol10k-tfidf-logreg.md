# moosairfaan/vol10k-tfidf-logreg

## Resumen

vol10k-tfidf-logreg es un clasificador binario de texto publicado en HuggingFace por el usuario moosairfaan. No es un modelo de lenguaje generativo: es una canalización de scikit-learn compuesta por un vectorizador TF-IDF (unigramas y bigramas, `min_df` 5, 30.000 features, frecuencia de termino sublineal, minusculas, sin lista de stop-words) seguido de una regresion logistica con regularizacion L2. Su tarea es estimar la probabilidad de que la volatilidad realizada en las 63 sesiones bursatiles posteriores a la presentacion de un formulario 10-K sea estrictamente superior a la de las 63 sesiones anteriores.

La entrada son las secciones Item 1A (factores de riesgo) e Item 7 (discusion y analisis de la direccion) de un 10-K original, concatenadas mediante un salto de linea, mas un bloque de variables numericas financieras. La salida es una probabilidad para la etiqueta `label_primary`. El ajuste se realizo sobre 165 formularios correspondientes a una porcion aprobada de 20 tickers de un snapshot del S&P 500, con fechas de aceptacion desde el 1 de enero de 2010 y ventana de etiqueta en horario America/New_York.

Su relevancia es metodologica mas que de rendimiento: se publica con un preregistro, un protocolo de validacion walk-forward y un holdout de una sola pasada, y el resultado confirmatorio es negativo. El intervalo bootstrap agrupado por empresa (CIK) para la mejora de AUC frente a una regresion logistica puramente numerica es de 0,000 a 0,000 (1.000 replicas validas), de modo que la regla preregistrada concluye que no existe valor incremental confirmado del texto. El autor advierte explicitamente que las predicciones no son asesoramiento de inversion, ni una prevision de rentabilidad, ni una senal de trading.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica L2 sobre representacion TF-IDF dispersa (pipeline scikit-learn; no es una red neuronal) |
| Parametros totales | no disponible (el numero exacto de coeficientes no se declara) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de bolsa de palabras con n-gramas; no existe ventana de contexto. La entrada son las secciones Item 1A e Item 7 concatenadas) |
| Tipos de cuantizacion | no aplica (pesos en coma flotante serializados con joblib; no hay versiones cuantizadas) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 para codigo y artefactos; la licencia no cubre los filings de EDGAR ni los datos de mercado de Yahoo (ver `DATA_RIGHTS.md`) |
| Formato de pesos | joblib (artefactos scikit-learn); no hay safetensors, GGUF ni ONNX |
| Libreria declarada | sklearn |
| Pipeline de HuggingFace | text-classification |
| Tarea | Clasificacion binaria: probabilidad de que la volatilidad realizada de las siguientes 63 sesiones sea estrictamente mayor que la de las 63 anteriores |
| Vectorizacion | TF-IDF, unigramas y bigramas, `min_df` 5, 30.000 features, frecuencia sublineal, minusculas, sin stop-words |
| Hiperparametros del clasificador | L2, solver `lbfgs`, `max_iter` 2.000, `C` = 0,01, semilla 42 |
| Entorno de ejecucion | Python 3.12; numpy 2.5.3, pandas 3.0.6, scikit-learn 1.9.1, joblib 1.6.0 |
| Tamano del repositorio | 0,0 GB |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-10-06 |
| Ultima actualizacion | 2026-10-06 |

## Arquitectura y entrenamiento

La arquitectura es lineal y discriminativa. El texto se transforma primero con `TfidfVectorizer` configurado con unigramas y bigramas, `min_df` 5, un maximo de 30.000 features, frecuencia de termino sublineal, conversion a minusculas y sin lista de stop-words. El vectorizador se ajusto unicamente sobre los 165 formularios de entrenamiento. Durante el entrenamiento, el texto sufrio un enmascaramiento: el nombre de la empresa del snapshot y sus alias especificos se sustituyeron por `[COMPANY]`, y las menciones contextuales del ticker por `[TICKER]`. El repositorio no incluye el parser de formularios; el llamante debe aportar las dos cadenas de seccion.

Sobre la matriz dispersa resultante se ajusta una regresion logistica con penalizacion L2, solver `lbfgs`, un maximo de 2.000 iteraciones y `C` = 0,01. Ese valor de `C` se selecciono sobre la porcion de validacion interna de 2022 del conjunto de entrenamiento purgado, usando el Brier score, antes de puntuar el holdout, y no se volvio a elegir para esta release. No se empleo RLHF, DPO ni ningun tipo de ajuste por preferencias: es un ajuste supervisado clasico con semilla 42.

Los datos numericos se imputaron por mediana y se escalaron sobre las filas de entrenamiento, con indicador de missingness del imputador y las columnas propias de missingness del estudio: `trailing_rv`, `market_rv`, `size`, `log_mkt_cap`, `log_assets`, `log_revenue`, `log1p_long_term_debt`, `liabilities_to_assets`, `equity_to_assets`, `net_income_to_assets`, `operating_income_to_assets`, `cash_to_assets`, `revenue_growth` y las columnas `*_missing` listadas en `config.json`. La variable `sector` se codifica one-hot; los sectores desconocidos se ignoran en inferencia. Se aplico una regla de casos completos: de 225 formularios de desarrollo se descartaron 57 y se conservaron 168, de los cuales 3 tenian horizonte de etiqueta que alcanzaba 2023, dejando 165 para entrenamiento. Los precios usados para construir etiquetas estaban ajustados por splits pero no por dividendos.

## Capacidades

- Clasificacion binaria discriminativa: devuelve una probabilidad para `label_primary`, no texto.
- Procesamiento de lenguaje natural financiero en ingles sobre las secciones Item 1A e Item 7 de formularios 10-K.
- Integracion de senal textual y numerica en un unico modelo lineal (TF-IDF mas variables financieras imputadas y escaladas).
- Reproducibilidad completa: semilla fija, configuracion cientifica con sha256 (`86859a86...`) y pesos con sha256 (`068fa214...`).
- No soporta generacion de texto. No es un modelo de lenguaje.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Monolingue: unicamente ingles.
- No tiene modo de razonamiento, vision ni audio.
- Requiere que el llamante aporte las cadenas de texto ya extraidas; el parser de formularios no esta incluido en la release.
- En inferencia, los sectores no vistos en entrenamiento se ignoran.

## Casos de uso

- Investigacion academica en finanzas y contabilidad: el modelo sirve como punto de comparacion reproducible para estudiar si la divulgacion de factores de riesgo (Item 1A) aporta informacion sobre la volatilidad realizada posterior a la presentacion del 10-K, con un protocolo preregistrado y artefactos verificables por hash.
- Baseline en estudios de NLP financiero: al ser una regresion logistica sobre TF-IDF con `C` = 0,01 y 30.000 features, funciona como linea base barata frente a la que medir modelos mas complejos (transformers financieros, gradient boosting) sobre el mismo conjunto de 20 tickers.
- Auditoria y replicacion de resultados negativos: el repositorio documenta que la mejora de AUC frente a la regresion logistica numerica es 0,000 en el holdout, por lo que es util como caso de estudio de publicacion de resultados no confirmatorios y de analisis de potencia estadistica con n = 34.
- Analisis de riesgo de cartera en el universo de 20 tickers: dado un 10-K nuevo de JPM, FITB, PGR, PLD, NEE, AES, MSFT, GOOG, PLTR, META, AAPL, XOM, CAT, HD, KO, RTX, HRL, IEX, CHRW o NDSN, el modelo produce una probabilidad de aumento de volatilidad a 63 sesiones que puede incorporarse a informes internos de seguimiento de riesgo, siempre como insumo analitico y no como senal operativa.
- Investigacion sobre enmascaramiento de entidades: el pipeline de preprocesado (`[COMPANY]`, `[TICKER]`) es reutilizable para estudiar como afecta la anonimizacion del emisor a la transferibilidad de clasificadores de texto financiero entre empresas.
- Docencia en ciencia de datos aplicada: es un ejemplo minimo y ejecutable de pipeline scikit-learn con separacion purgada de entrenamiento, validacion walk-forward, holdout unico y bootstrap agrupado por cluster, adecuado para practicas de evaluacion estadistica.
- Ingenieria de pipelines de extraccion: aunque el parser no se incluye, el modelo define el contrato de entrada (Item 1A + Item 7 unidos por salto de linea mas las columnas numericas), lo que resulta util para especificar y probar la capa de extraccion de un sistema mayor.

## Benchmarks y rendimiento

Desarrollo walk-forward, anios de prueba 2015-2022, 116 formularios, tasa de positivos 0,474. El autor indica que esta tabla no constituye la afirmacion principal del estudio.

| Modelo | AUC | Brier |
|---|---:|---:|
| Mayoritaria | 0,500 | 0,260 |
| Regresion logistica numerica | 0,604 | 0,286 |
| Gradient boosting numerico | 0,666 | 0,275 |
| TF-IDF mas regresion logistica | 0,611 | 0,276 |

Frente a la regresion logistica numerica, el delta de AUC fue +0,006 y el delta de Brier +0,010. Frente al gradient boosting numerico, el delta de AUC fue -0,056.

Holdout, una unica puntuacion (ejecucion `20260930T220553Z_holdout`), 34 formularios, 17 emisores, tasa de positivos 0,382. Se descartaron cuatro formularios del holdout (JPM y PGR en 2023 y 2024) porque el Item 7 era un puntero de incorporacion por referencia de menos de 500 caracteres.

| Modelo | AUC | Brier |
|---|---:|---:|
| Mayoritaria (tasa de positivos de entrenamiento 0,467; AUC definida como 0,5) | 0,500 | 0,243 |
| Regresion logistica numerica | 0,630 | 0,233 |
| Gradient boosting numerico | 0,568 | 0,291 |
| TF-IDF mas regresion logistica | 0,630 | 0,233 |

Resultados del analisis confirmatorio: el delta de AUC frente a la regresion logistica numerica es exactamente 0; el delta de Brier es +0,000130. Los dos vectores de probabilidad no son identicos (las 34 parejas difieren, con una separacion absoluta maxima de 0,00296); el informe imprime el delta de Brier como 0,000 porque redondea a tres decimales. Por anio, en 2023 ambos modelos logisticos obtienen AUC 0,485 (17 formularios) y en 2024 ambos obtienen AUC 0,700 (17 formularios). El intervalo confirmatorio es un bootstrap agrupado por empresa (remuestreo de CIK con reemplazo, 1.000 replicas, semilla 42, percentiles 2,5 y 97,5); el intervalo para el delta de AUC frente a la regresion logistica numerica es 0,000 a 0,000, por lo que no queda enteramente por encima de cero y la regla preregistrada no confirma valor textual incremental. El bootstrap por bloques de anio-trimestre, solo diagnostico, da el mismo intervalo 0,000 a 0,000 (997 replicas validas). Frente al gradient boosting numerico el delta de AUC en holdout es +0,062, con intervalo por empresa de -0,110 a 0,245 y por anio-trimestre de -0,230 a 0,214.

## Requisitos de hardware

- No requiere GPU. Es una regresion logistica dispersa sobre 30.000 features: la inferencia es una multiplicacion matriz-vector dispersa mas una sigmoide.
- VRAM estimada: 0 GB. El modelo se ejecuta en CPU.
- GPU recomendadas: no aplica (no hay soporte CUDA declarado).
- Caben en cualquier GPU consumer: si, pero no es necesario; tambien cabe en CPU de un portatil.
- Espacio en disco: el repositorio ocupa 0,0 GB segun HuggingFace; el artefacto principal es un unico archivo joblib con el vectorizador y el clasificador.
- Opciones de despliegue: carga directa con `joblib.load` dentro de un entorno scikit-learn 1.9.1 sobre Python 3.12. No se declara soporte para vLLM, llama.cpp, Ollama ni TGI, que son irrelevantes para este tipo de modelo.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.
- Dependencias de ejecucion: numpy 2.5.3, pandas 3.0.6, scikit-learn 1.9.1, joblib 1.6.0 (fijadas en `requirements.txt`).

## Comparativa con modelos similares

La comparativa relevante es con los basales internos del propio estudio preregistrado, evaluados sobre el mismo holdout de 34 formularios y 17 emisores. Los resultados son los siguientes.

| Modelo | AUC (holdout) | Brier (holdout) | Delta AUC frente al mejor basal | Entrada |
|---|---:|---:|---:|---|
| TF-IDF mas regresion logistica (este modelo) | 0,630 | 0,233 | 0,000 frente a logistica numerica; +0,062 frente a gradient boosting | Texto de Item 1A e Item 7 mas variables numericas |
| Regresion logistica numerica | 0,630 | 0,233 | referencial | Solo variables numericas |
| Gradient boosting numerico | 0,568 | 0,291 | -0,062 respecto a este modelo | Solo variables numericas |
| Mayoritaria | 0,500 | 0,243 | -0,130 respecto a este modelo | Ninguna |

Comparativa con modelos de la misma categoria publicados por terceros: no disponible en la informacion proporcionada. El autor no cita alternativas externas y la busqueda web realizada no devolvio enlaces relevantes sobre este modelo ni sobre clasificadores comparables.

## Limitaciones y advertencias

- Muestra muy pequena: 165 formularios de entrenamiento y 34 de holdout. Con 30.000 features de texto, el riesgo de sobreajuste es alto y la potencia estadistica del analisis confirmatorio es limitada.
- Universo restringido y sesgo de supervivencia: el ajuste corresponde a una porcion de 20 tickers de un snapshot actual del S&P 500, por lo que las empresas que abandonaron el indice no estan representadas. Los resultados no son extrapolables al universo completo de emisores.
- Resultado confirmatorio negativo: el intervalo bootstrap agrupado por empresa para el delta de AUC frente a la regresion logistica numerica es 0,000 a 0,000, y la regla preregistrada concluye que no hay valor incremental del texto confirmado. No debe presentarse como una mejora demostrada sobre basales numericos.
- Interpretacion prohibida por el propio autor: las predicciones no son asesoramiento de inversion, ni prevision de rentabilidad, ni senal de trading. Cualquier uso en decisiones de inversion contradice la model card.
- Sesgos textuales y de dominio: el vectorizador se ajusto solo sobre textos de entrenamiento enmascarados con `[COMPANY]` y `[TICKER]`; cambios de formato en los 10-K, vocabulario nuevo o secciones vacias degradan la representacion. Una seccion Item 7 ausente o convertida en puntero de incorporacion provoca el descarte del formulario en la practica del estudio.
- Cobertura de formularios: solo formularios 10-K originales, no 10-K/A. Solo fechas de aceptacion desde 2010-01-01.
- Idioma: unicamente ingles. No hay soporte multilingue ni se ha evaluado en otros idiomas.
- Anonimizacion del emisor: al sustituir nombres y tickers por marcadores, el modelo no puede explotar informacion especifica del emisor que si estaria disponible en un modelo con contexto, lo que limita su capacidad discriminativa.
- Sectores no vistos: la codificacion one-hot de `sector` ignora valores desconocidos en inferencia, lo que puede degradar silenciosamente las predicciones.
- Dependencia de versiones: los resultados estan fijados a scikit-learn 1.9.1, numpy 2.5.3, pandas 3.0.6 y joblib 1.6.0; cambios de version pueden alterar ligeramente las probabilidades.
- Regla de casos completos no preregistrada: el autor indica que `PREREGISTRATION.md` no sella esa regla y que la fase 6a dejo sin resolver el tratamiento del Item 7 ausente, aplicandose en la fase 6b. Es un punto de fragilidad metodologica declarado por el propio autor.
- Precios ajustados por splits pero no por dividendos, lo que afecta a la construccion de las etiquetas de volatilidad realizada.
- Licencia: Apache 2.0 cubre el codigo y los artefactos, pero no los filings de EDGAR ni los datos de mercado de Yahoo; su redistribucion o uso comercial requiere revisar `DATA_RIGHTS.md`.
- Falta de traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por terceros.
- Piezas no incluidas: el parser de formularios no forma parte de la release; el llamante debe aportar las cadenas de Item 1A e Item 7.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/moosairfaan/vol10k-tfidf-logreg
- Archivo de licencia referenciado en la model card: `LICENSE.txt` (dentro del repositorio)
- Documento de derechos de datos referenciado: `DATA_RIGHTS.md` (dentro del repositorio)
- Documento de preregistro referenciado: `PREREGISTRATION.md` (dentro del repositorio)
- Configuracion cientifica referenciada: `config.json`, sha256 `86859a8611299150bc0e9f872973c2629ffce770b360962b2ea0eb5adcc769fe`
- Pesos: sha256 `068fa214f39dd7f4883548744832d263808d47f4fa1deee0dca23a2535a09d63`
- Dependencias: `requirements.txt` (numpy 2.5.3, pandas 3.0.6, scikit-learn 1.9.1, joblib 1.6.0)
- Paper, blog, repositorio de codigo o demo adicionales: no disponible. La busqueda web realizada no devolvio enlaces relevantes sobre este modelo.
