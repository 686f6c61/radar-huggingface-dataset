# shahzaim/sunpulse-solar-rf

## Resumen

SunPulse es un modelo de regresión tabular desarrollado por shahzaim como proyecto del curso de Machine Learning CT-378 de la NED University. No es un modelo de lenguaje, sino un estimador basado en Random Forest que predice la generación horaria de electricidad solar en megavatios (MW) a partir de variables meteorológicas, temporales y de país. Cubre ocho países europeos: Alemania, Francia, España, Italia, Portugal, Grecia, Dinamarca y Bélgica.

El modelo está construido íntegramente con scikit-learn 1.6.1 y empaquetado como un Pipeline que combina imputación, escalado, codificación one-hot y un RandomForestRegressor de 50 árboles. Se entrenó con 350.209 registros horarios que abarcan del 3 de octubre de 2015 al 30 de septiembre de 2020, combinando datos de generación real de Open Power System Data con datos meteorológicos históricos de la API de Open-Meteo.

Su relevancia es principalmente educativa y de análisis exploratorio: alcanza un R² de 0,9242 en el conjunto de test cronológico, lo que lo hace útil para estimaciones rápidas por parte de analistas de energía y estudiantes, aunque sus propios autores advierten de que no debe emplearse para gestión de red ni para predicción con fines de trading.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de scikit-learn con RandomForestRegressor (50 árboles, min_samples_leaf=3) |
| Parametros totales | no disponible (modelo de ensamble de árboles; el tamaño del repo es 0,1 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no aplica (entrada numérica y categórica; sin texto) |
| Licencia | no disponible |
| Formato de pesos | joblib (serialización de scikit-learn) |

## Arquitectura y entrenamiento

El modelo es un Pipeline de scikit-learn con tres etapas. Primero, un preprocesado de variables numéricas (temperatura, humedad relativa, nubosidad, velocidad del viento, presión en superficie, radiación de onda corta) mediante imputación de la mediana y escalado estándar. Segundo, la variable categórica `country` se trata con imputación por valor más frecuente y codificación one-hot. Tercero, un RandomForestRegressor con 50 árboles y `min_samples_leaf=3` como regresor final. Las 18 variables de entrada incluyen además características temporales cíclicas: codificaciones seno/coseno de la hora, el mes y el día del año, junto con variables de hora, día de la semana, mes, día del año y un indicador de fin de semana. La hora se maneja en UTC.

Los datos de entrenamiento suman 350.209 registros horarios (octubre de 2015 a septiembre de 2020). La generación solar real procede de Open Power System Data (time series 2020-10-06, con datos primarios de la plataforma de transparencia ENTSO-E y TSOs nacionales), y el clima horario de la API Historical Weather de Open-Meteo (basada en reanálisis, CC BY 4.0), tomado en un punto por país (la capital). La partición es cronológica 70/15/15 (entrenamiento/validación/test); los candidatos se compararon en validación y el modelo final se reajustó con train+validación y se evaluó una única vez sobre el periodo de test retenido (enero a septiembre de 2020, 52.488 filas). Se entrenó con scikit-learn 1.6.1, versión necesaria para cargar el modelo.

## Capacidades

- Regresión tabular: estimación de generación solar horaria en MW para ocho países europeos.
- Manejo robusto de valores faltantes en las variables de entrada mediante imputación integrada en el Pipeline.
- Captura de estacionalidad diaria y anual mediante codificaciones seno/coseno de hora, mes y día del año, más un flag de fin de semana.
- Diferenciación por país mediante codificación one-hot, lo que permite modelar escalas de generación muy distintas entre países.
- Salida de dispersión entre árboles (desacuerdo del ensamble) utilizable como indicador cualitativo de incertidumbre, aunque no es un intervalo de confianza estadístico.
- No soporta texto, lenguaje natural, tool calling, agentes ni ninguna modalidad multimodal: es un modelo tabular puro.

## Casos de uso

- Estimaciones rápidas para analistas de energía: dado un escenario meteorológico horario (radiación, nubosidad, temperatura), el modelo devuelve una estimación inmediata de generación solar en MW sin necesidad de infraestructura de simulación fotovoltaica.
- Material docente y de aprendizaje: al ser un proyecto de curso con pipeline reproducible, sirve como ejemplo completo de un flujo de regresión tabular con partición cronológica, comparación de modelos y evaluación honesta en test retenido.
- Análisis comparativo entre países: permite contrastar patrones de generación solar entre los ocho países cubiertos, útil para estudios académicos o informes exploratorios (interpretando el MAE por país en relación con la escala de generación de cada uno).
- Rellenado de series temporales de generación: puede usarse para estimar valores horarios donde falten mediciones, siempre dentro del rango de capacidad de 2015-2020.
- Prototipado de aplicaciones de visualización energética: su salida escalar y su bajo coste de inferencia lo hacen adecuado para demos interactivas que muestren perfiles horarios de generación solar.
- Referencia para comparar arquitecturas de regresión: los datos de validación publicados (Random Forest 266,4 MW de MAE frente a 1.402,5 MW de la regresión lineal) sirven de punto de partida para evaluar alternativas como gradient boosting.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de test cronológico (enero a septiembre de 2020, 52.488 filas):

| Metrica (test) | Valor |
|---|---|
| MAE | 424,195 MW |
| RMSE | 1115,253 MW |
| R² | 0,9242 |

Comparativa de MAE en validación frente a modelos alternativos:

| Modelo | MAE validacion (MW) |
|---|---|
| Random Forest (modelo final) | 266,4 |
| Decision Tree | 292,0 |
| Gradient Boosting | 527,3 |
| Linear Regression (baseline) | 1402,5 |

MAE de test por país (MW): Portugal 50,9; Dinamarca 58,9; Grecia 81,5; Bélgica 147,5; Italia 329,7; Francia 402,8; España 1009,7; Alemania 1309,6. Estas cifras deben interpretarse en relación con el nivel de generación de cada país, ya que las escalas difieren notablemente.

## Requisitos de hardware

- No requiere GPU: es un modelo de scikit-learn de 0,1 GB que se ejecuta en CPU convencional; la inferencia de un Random Forest de 50 árboles es de milisegundos a baja decena de milisegundos por predicción.
- Memoria RAM: suficiente con unos cientos de MB libres para cargar el modelo y servir predicciones individuales.
- Cualquier portátil o servidor moderno es adecuado; no hay requisitos de VRAM ni de GPUs tipo A100, H100 o RTX 4090.
- Despliegue: carga directa con joblib y scikit-learn 1.6.1 (imprescindible usar la misma versión); puede servirse mediante FastAPI o Flask, o integrarse en notebooks y aplicaciones de análisis. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que son runtimes para modelos de lenguaje.
- No se han publicado mediciones de latencia ni throughput en la información disponible.

## Comparativa con modelos similares

Comparativa con los modelos alternativos evaluados por el propio autor en el mismo conjunto de validación:

| Modelo | Tipo | MAE validacion (MW) | Comentario |
|---|---|---|---|
| Random Forest (SunPulse) | Ensamble de árboles (bagging) | 266,4 | Mejor MAE; no extrapola fuera del rango de entrenamiento |
| Decision Tree | Árbol único | 292,0 | Rendimiento cercano, menor robustez esperable |
| Gradient Boosting | Ensamble secuencial | 527,3 | Peor que Random Forest en este problema |
| Linear Regression | Modelo lineal (baseline) | 1402,5 | Incapaz de capturar las relaciones no lineales radiación-generación |

No se han identificado en la información disponible otros modelos públicos comparables de estimación de generación solar por país en HuggingFace.

## Limitaciones y advertencias

- Los datos meteorológicos se toman en un único punto por país (la capital), no como media nacional, lo que introduce error en países geográficamente extensos o con climas heterogéneos.
- El modelo se entrenó con niveles de capacidad solar de 2015 a 2020 y tiende a infraestimar periodos con mayor capacidad instalada; los Random Forest no pueden extrapolar por encima del rango visto en entrenamiento, por lo que sus predicciones quedan obsoletas para años recientes.
- La serie reportada de España presenta generación positiva durante la noche y los timestamps horarios de generación y meteorología pueden estar desfasados una hora.
- El clima de entrenamiento procede de reanálisis; si se alimenta el modelo con previsiones meteorológicas de una API de forecast, el comportamiento puede diferir del evaluado.
- La dispersión entre árboles que muestran las aplicaciones asociadas es desacuerdo del ensamble, no un intervalo de confianza estadístico; no debe interpretarse como incertidumbre calibrada.
- La licencia del modelo no está declarada en el repositorio, lo que introduce incertidumbre legal para su reutilización; además, los datos de entrenamiento tienen condiciones de atribución (Open Power System Data exige atribución y se aplican los términos de ENTSO-E y los TSOs nacionales; Open-Meteo es CC BY 4.0 con uso no comercial gratuito de la API).
- El propio autor indica que no es un sistema de gestión de red ni de predicción para trading y no ofrece garantía sobre la generación real.
- No hay riesgo de alucinación ni sesgos lingüísticos al tratarse de un modelo tabular, pero sí sesgo temporal y geográfico por diseño del dataset (2015-2020, ocho países, un punto meteorológico por país).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shahzaim/sunpulse-solar-rf
- Datos de generación (Open Power System Data, time series 2020-10-06): https://doi.org/10.25832/time_series/2020-10-06
- Datos meteorológicos (Open-Meteo): https://open-meteo.com/
- Paper, repositorio de código y demo: no disponibles en la información proporcionada.
