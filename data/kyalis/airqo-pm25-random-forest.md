# Kyalis/airqo-pm25-random-forest

## Resumen

Kyalis/airqo-pm25-random-forest es un pipeline de scikit-learn basado en un Random Forest tuneado que predice la concentracion horaria de PM2.5 (µg/m³) para los sensores de bajo coste de la red AirQo en Uganda. No es un modelo de lenguaje ni una red neuronal: es un modelo de regresion tabular supervisada que toma lecturas meteorologicas y de particulas de un sensor concreto mas codificaciones ciclicas del instante temporal. Lo publica el usuario Kyalis como artefacto de la asignatura CSC3119 AI Deployment & Scalability (Assignment 4) de la Uganda Christian University.

Su relevancia practica esta en el ambito de la vigilancia de calidad del aire con hardware de bajo coste, donde la calibracion y el rellenado de huecos de PM2.5 son un problema recurrente. Sobre el periodo de test reservado (2.642 lecturas horarias de 119 sensores) reporta un MAE de 3,103 µg/m³, un RMSE de 7,003 µg/m³ y un R² de 0,898, con un 86,2 % de las horas clasificadas correctamente en su categoria AQI.

El modelo se distribuye como un unico artefacto joblib de aproximadamente 0,1 GB de repositorio que incluye el pipeline de preprocesado, el escalador del target y las listas de columnas de features. El entrenamiento se realizo con datos de AirQo de enero a junio de 2026, aunque solo ocho dias de ese periodo contienen lecturas reales, lo que constituye su principal limitacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest de scikit-learn dentro de un pipeline (preprocesado + regresor) |
| Parametros totales | no disponible (no se especifica numero de arboles, profundidad ni criterio de split) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; la entrada es un unico registro horario con 10 columnas (9 numericas y 1 categorica) |
| Tipos de cuantizacion | no aplica (modelo tabular clasico, no hay pesos en coma flotante cuantizables) |
| Idiomas soportados | no aplica (modelo de regresion tabular, no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | joblib (pickle serializado); archivo `best_pm25_model.joblib` |

Features de entrada: `temperature`, `humidity`, `pm10_calibrated_value`, `hour_sin`, `hour_cos`, `day_of_week_sin`, `day_of_week_cos`, `month_sin`, `month_cos` y `device_name` (one-hot encoded, los dispositivos desconocidos se ignoran).

## Arquitectura y entrenamiento

El artefacto es un pipeline de scikit-learn que combina el preprocesado de features con un Random Forest como estimador final. Las variables temporales se codifican de forma ciclica (`hour_sin = sin(2π·hour/24)`, y de forma analoga para dia de la semana y mes), `device_name` se codifica en one-hot y el target (PM2.5) se entrena sobre su Z-score. El propio artefacto almacena el escalador del target, de modo que las predicciones se revierten con `prediction × target_scaler_std + target_scaler_mean`. Segun la model card, el artefacto requiere scikit-learn 1.7.2 para cargarse de forma fiable, lo que indica una dependencia estricta de version.

Los datos de entrenamiento proceden de la red AirQo: 14.600 registros horarios de 149 sensores distribuidos en 142 emplazamientos, correspondientes a enero-junio de 2026. El autor advierte que solo ocho dias contienen lecturas reales (1-3 de enero, 1-2 de abril y 1-3 de junio), y que los valores cero en temperatura, humedad, PM2.5 y PM10 se trataron como datos ausentes, presumiblemente para cubrir caidas de sensor. El reparto de validacion es cronologico: entrenamiento del 1 de enero al 1 de junio de 2026 y test del 2 al 3 de junio de 2026. No se documenta el uso de tecnicas de ajuste tipo grid search, ni los hiperparametros finalmente seleccionados, ni si hubo una fase de calibracion o de ajuste fino posterior.

## Capacidades

- Prediccion puntual de la concentracion horaria de PM2.5 en µg/m³ a partir de lecturas del mismo sensor y del instante temporal.
- Regresion tabular sobre un conjunto fijo de 10 features; no acepta texto, imagenes ni audio.
- Clasificacion derivada en categorias AQI: la model card reporta un 86,2 % de acierto de categoria en el periodo de test.
- Ajuste especifico por emplazamiento mediante el one-hot de `device_name`, limitado a los sensores vistos en entrenamiento.
- Inferencia por linea de comandos mediante `pm25_inference.py`, con entrada y salida en CSV.
- Integracion directa en Python con `joblib.load` y `pandas.DataFrame`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas simbolicas, vision ni capacidades multilingues.

## Casos de uso

- Rellenado de series temporales de PM2.5: dado que el modelo estima la concentracion a partir de PM10, temperatura y humedad de la misma hora, se puede emplear para reconstruir huecos en el historico de un sensor AirQo cuando la lectura directa de PM2.5 falta pero el resto de canales esta operativo.
- Generacion de alertas AQI para salud publica: la clasificacion derivada en categorias (Good, Moderate, Unhealthy for Sensitive Groups, Unhealthy, Very Unhealthy, Hazardous) permite disparar avisos automatizados por zona, con la advertencia de que la precision reportada del 86,2 % deja margen de error en los umbrales.
- Control de calidad de la red de sensores: comparando la prediccion con la lectura real del mismo sensor se obtienen residuos que sirven para detectar deriva de calibracion, obstrucciones o fallos de un nodo concreto.
- Cuadro de mando interactivo: el autor publica un Space de Gradio (`Kyalis/AirQ_Regression_Model_Deployment`) que ilustra el patron tipico diario por emplazamiento; el mismo artefacto se puede servir detras de una API interna en Python sin necesidad de GPU.
- Analisis retrospectivo de exposicion: para estudios epidemiologicos o academicos sobre el periodo enero-junio de 2026, el modelo aporta una estimacion horaria consistente por sitio usando los datos ya registrados de PM10.
- Prototipado docente de despliegue de modelos: por su tamano (0,1 GB) y su naturaleza CPU-only, es un caso de estudio util para practicas de serializacion, versionado de dependencias y despliegue de modelos tabulares.
- Investigacion sobre sensores de bajo coste: sirve como linea base reproducible para comparar tecnicas de calibracion mas avanzadas sobre la misma red AirQo.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el periodo de test reservado (2-3 de junio de 2026, 2.642 lecturas horarias de 119 sensores):

| Metrica | Valor |
|---|---|
| MAE | 3,103 µg/m³ |
| RMSE | 7,003 µg/m³ |
| R² | 0,898 |
| Acierto de categoria AQI | 86,2 % |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. Los valores anteriores proceden exclusivamente de la model card y no han sido verificados de forma independiente. Tampoco se detalla la configuracion de hiperparametros con la que se obtuvieron.

## Requisitos de hardware

- Inferencia exclusivamente en CPU: un Random Forest de este tipo no requiere acelerador.
- VRAM estimada para inferencia: 0 GB; no se necesita GPU.
- GPU recomendadas: no aplica. Cualquier GPU seria irrelevante para la carga.
- Cabe en cualquier equipo de consumo, incluidas maquinas sin GPU dedicada; el cuello de botella es la memoria RAM para cargar el pickle (repo de 0,1 GB) y el coste de `joblib.load`.
- Opciones de despliegue: script de linea de comandos `pm25_inference.py` incluido en el repositorio, integracion directa en Python con `joblib` + `pandas`, y Hugging Face Spaces con Gradio. No aplican motores como vLLM, llama.cpp, Ollama o TGI, que estan pensados para modelos de lenguaje.
- Latencia y throughput estimados: no disponible. Dependera del numero de arboles y de la profundidad, datos que no se publican, aunque para un Random Forest tabular la prediccion por registro suele ser de orden sub-milisegundo en una sola CPU.
- Dependencia critica de entorno: scikit-learn 1.7.2 segun la model card; otras versiones pueden provocar fallos al deserializar el artefacto.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos alternativos de prediccion de PM2.5 ni resultados comparativos frente a otras aproximaciones (por ejemplo, modelos lineales, gradient boosting o redes recurrentes) sobre el mismo conjunto de datos AirQo. El autor tampoco cita lineas base en la model card.

## Limitaciones y advertencias

- Dependencia de PM10 a la misma hora: segun el autor, PM10 aporta la mayor parte de la capacidad predictiva. En un escenario real de prevision, PM10 no se conoce de antemano; las previsiones de agosto de 2026 sustituyeron ese valor por el perfil horario tipico de cada sensor, de modo que reflejan el patron diario habitual del emplazamiento y no las condiciones reales.
- Volumen de entrenamiento muy reducido: solo ocho dias con lecturas reales repartidos en tres meses. Los patrones estacionales no se aprenden, y el R² de 0,898 debe interpretarse con cautela dado que el test corresponde a un unico par de dias.
- Sesgo por sensor conocido: los dispositivos no presentes en el entrenamiento pierden su ajuste especifico por emplazamiento, lo que degrada las predicciones en nodos nuevos o renombrados.
- Riesgo de sobreajuste al split cronologico: al haberse validado sobre un periodo muy corto y contiguo al de entrenamiento, el rendimiento en produccion a medio plazo es incierto.
- Tratamiento de ceros como ausentes: valores legitimos de 0 (por ejemplo, humedad relativa 0 o concentraciones muy bajas) se codifican como faltantes, lo que puede introducir sesgo en condiciones extremas.
- Licencia no disponible: al no declararse licencia, no hay autorizacion explicita de uso comercial. Conviene contactar con el autor antes de cualquier despliegue en produccion.
- Riesgo de seguridad al cargar el artefacto: `best_pm25_model.joblib` es un pickle y su deserializacion puede ejecutar codigo arbitrario. Debe cargarse unicamente desde el repositorio oficial o desde una fuente de confianza.
- Sin verificacion independiente: no hay benchmarks publicados por terceros ni evaluacion reproducible fuera de la model card; no se documentan hiperparametros, semillas ni versiones de las librerias usadas en el entrenamiento mas alla de scikit-learn 1.7.2.
- Alcance geografico limitado: entrenado con datos de Uganda, no hay evidencia de que generalice a otras redes de sensores, otras concentraciones de fondo ni otros climas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kyalis/airqo-pm25-random-forest
- Space de demostracion (forecasts interactivos): https://huggingface.co/spaces/Kyalis/AirQ_Regression_Model_Deployment
- Repositorio AirQo: no disponible en la informacion proporcionada
- Paper o publicacion tecnica asociada: no disponible en la informacion proporcionada
