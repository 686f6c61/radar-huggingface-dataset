# jshdmm/weather-predict-berlin

## Resumen

Weather Prediction in Berlin es un modelo de regresión basado en LightGBM (gradient boosting sobre árboles de decisión) que predice la temperatura horaria en grados Celsius para Berlín. Lo desarrolla el usuario jshdmm y se entrena diariamente con datos de la API de Open-Meteo. No es un modelo de lenguaje ni una red neuronal profunda: es un artefacto tabular serializado con joblib, pensado como componente de un pipeline MLOps de demostración.

El objetivo declarado del proyecto no es maximizar la precisión predictiva, sino servir de base para practicar un ciclo completo de despliegue: integración continua con GitHub Actions, tests automatizados, orquestación mediante cronjob, contenerización con Docker y exposición del modelo a través de endpoints FastAPI. El repositorio de HuggingFace ocupa 0,1 GB e incluye el modelo entrenado, metadatos de entrenamiento y una gráfica de predicción frente a valores reales.

Su relevancia es, por tanto, didáctica y de ingeniería: resulta útil como referencia de cómo empaquetar y servir un modelo clásico de series temporales con un flujo reproducible, no como solución de forecasting meteorológico de producción. La licencia Apache 2.0 permite reutilizar el código y los artefactos sin restricciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LightGBM (gradient boosting sobre árboles de decisión) |
| Parametros totales | no disponible (modelo de árboles; el número de hojas y árboles no se detalla) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular; usa ventanas de features, no definidas en la model card) |
| Tipos de cuantizacion | no aplica (no hay cuantización de pesos neuronales) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.pkl` serializado con joblib |

## Arquitectura y entrenamiento

El modelo es un regresor LightGBM, es decir, un ensamblado de árboles de decisión entrenados con boosting por gradiente. La variable objetivo es la temperatura horaria en °C y la fuente de datos es la API pública de Open-Meteo. La model card no especifica el número de árboles, la profundidad máxima, la tasa de aprendizaje ni el conjunto exacto de features; tampoco detalla el rango temporal de entrenamiento ni el volumen de muestras.

El entrenamiento se ejecuta automáticamente una vez al día mediante un cronjob, lo que implica un reentrenamiento continuo con datos recientes. El autor indica explícitamente que la ingeniería de features y la optimización del rendimiento no fueron el foco del proyecto, sino la infraestructura de CI/CD, testing, orquestación y contenerización. No se menciona uso de validación cruzada, búsqueda de hiperparámetros ni técnicas de regularización específicas.

## Capacidades

- Predicción de temperatura horaria en °C para la ciudad de Berlín.
- Regresión univariante sobre features meteorológicas derivadas de Open-Meteo.
- Reentrenamiento diario automatizado con datos actualizados.
- Servicio mediante API REST a través de FastAPI (según el repositorio del proyecto).
- Serialización y carga sencilla con joblib y `huggingface_hub`.
- No soporta generación de texto, razonamiento, código, visión ni audio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: no procesa lenguaje natural.

## Casos de uso

- Predicción meteorológica local para Berlín: el modelo puede integrarse en un servicio que consulte la temperatura prevista por hora y la exponga a aplicaciones de consumo, usando los endpoints FastAPI del proyecto como base.
- Referencia docente de MLOps: sirve como ejemplo completo de pipeline con GitHub Actions, tests automatizados, cronjob de reentrenamiento y Docker, útil en cursos o talleres de despliegue de modelos.
- Plantilla para forecasting de series temporales: el flujo de descarga de datos, entrenamiento LightGBM y publicación de artefactos es reutilizable para otras variables meteorológicas o ciudades cambiando la fuente de datos.
- Monitorización de deriva de modelo: al reentrenarse a diario y publicar el MAE de test en `results.json`, permite observar cómo evoluciona el error a lo largo del tiempo y detectar degradaciones.
- Prototipado rápido de APIs de inferencia: el contenedor Docker con FastAPI puede desplegarse en un entorno de staging para validar contratos de API antes de invertir en modelos más complejos.
- Baseline para comparaciones: cualquier modelo posterior (LSTM, Transformer temporal, Gradient Boosting con más features) puede medirse contra este regresor para justificar la complejidad añadida.

## Benchmarks y rendimiento

La model card indica que `results.json` contiene el MAE de test, pero no se proporciona el valor numérico en la información disponible. Tampoco se publican comparaciones con otros modelos.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; la inferencia de LightGBM se ejecuta en CPU y el modelo ocupa una fracción de los 0,1 GB del repositorio.
- GPU recomendadas: ninguna; no se requiere GPU.
- Cabe en cualquier GPU consumer y en entornos sin GPU (incluidos contenedores pequeños y funciones serverless).
- Opciones de despliegue: FastAPI con Uvicorn (según el proyecto), contenedor Docker, cronjob para reentrenamiento, GitHub Actions para CI/CD. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; para un LightGBM de regresión tabular la latencia por petición suele ser de milisegundos en CPU, pero no se aporta medición concreta.

## Comparativa con modelos similares

| Modelo | Tipo | Variable objetivo | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| jshdmm/weather-predict-berlin | LightGBM | Temperatura horaria (Berlín) | Apache 2.0 | joblib (`model.pkl`) | HuggingFace |
| Alternativas de forecasting meteorológico | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que la ingeniería de features y la optimización del rendimiento no fueron prioritarias; el modelo debe tratarse como un baseline, no como un predictor meteorológico de precisión.
- Ámbito geográfico restringido a Berlín; no se documenta su validez para otras ubicaciones.
- Variable única (temperatura); no predice precipitación, viento, humedad ni otras magnitudes.
- El MAE real no se publica en la model card, por lo que no es posible evaluar su calidad sin descargar `results.json`.
- Al reentrenarse a diario, el comportamiento del artefacto cambia con el tiempo; conviene fijar versiones concretas para reproducibilidad.
- Riesgo de deriva si la distribución meteorológica cambia o si la API de Open-Meteo modifica su esquema de datos.
- No se documentan sesgos, pero al ser un modelo tabular limitado a una ciudad, cualquier uso fuera de ese contexto carece de garantías.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar avisos de licencia y atribución.
- No apto para aplicaciones de seguridad crítica o toma de decisiones que requieran garantías formales de precisión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jshdmm/weather-predict-berlin
- Repositorio del proyecto (arquitectura, código de entrenamiento y servicio, API): https://github.com/jshdmm/weather-predict
- Fuente de datos Open-Meteo: https://open-meteo.com/
- Gráfica de rendimiento en test: https://huggingface.co/jshdmm/weather-predict-berlin/resolve/main/plot.png
