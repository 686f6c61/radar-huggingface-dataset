# RubenElices/PREDICCION_PETROLEO_RNN

## Resumen

`RubenElices/PREDICCION_PETROLEO_RNN` es un conjunto de pesos de redes neuronales recurrentes (RNN simple, LSTM y GRU) entrenadas para predecir el precio del petróleo Brent a tres horizontes temporales: 1 semana (5 días hábiles), 3 meses (63 días) y 1 año (252 días), junto con un intervalo de confianza del 80 %. Lo desarrolla RubenElices como trabajo académico de Aprendizaje Automático y lo publica en Hugging Face como artefacto de soporte para una aplicación web de predicción.

El repositorio contiene 45 `state_dict` de PyTorch (3 plazos × 3 arquitecturas × 5 semillas) junto con dos ficheros JSON de metadatos: uno con el escalado de las 16 variables de entrada y del objetivo, y otro con los hiperparámetros, el peso del ensemble y los cuantiles del intervalo. La arquitectura es una red recurrente de dos capas seguida de dropout y una capa lineal, con una ventana de entrada de 20 días hábiles y 16 variables exógenas (futuros de WTI y gas, oro, cobre, dólar, yuan, VIX, volatilidad realizada, diferenciales Brent-WTI, entre otras).

Su relevancia es metodológica más que predictiva: el propio autor documenta que ninguna de las redes supera de forma estadísticamente significativa al modelo ingenuo (precio de hoy) según el test de Diebold-Mariano, con valores de RMSE relativo entre 0,933 y 1,110. Es útil como referencia reproducible de un pipeline completo de forecasting financiero con RNN, no como sistema de producción para decisiones de inversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal recurrente (RNN simple, LSTM o GRU) de 2 capas + dropout + capa lineal |
| Parametros totales | 4.369 (LSTM 2×16, plazo corto); 13.633 (RNN 2×64, plazo medio); 14.881 (LSTM 2×32, plazo largo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 20 días hábiles de entrada (ventana fija) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | es (documentación y model card) |
| Licencia | No disponible |
| Formato de pesos | PyTorch `state_dict` (`.pt`) |

## Arquitectura y entrenamiento

Las tres redes comparten la misma estructura: una ventana de 20 días hábiles con 16 variables escaladas entra en una capa recurrente (RNN, LSTM o GRU según el caso) de dos capas, seguida de dropout y una capa lineal que produce el logaritmo del cambio del precio en *h* días. La previsión final se calcula como `precio de hoy × exp(peso × cambio)`, promediando las 5 semillas del ensemble. Las 16 variables de entrada incluyen rentabilidades del Brent, futuros de WTI y gas, oro, cobre, índice del dólar, yuan, volatilidad realizada a 21 y 63 días, caída desde el máximo de un año, diferenciales Brent-WTI y WTI spot-futuro, ratios cobre/Brent y oro/Brent, VIX y cambio del tipo del BCE.

El entrenamiento usa pérdida Huber, optimizador Adam con *weight decay*, recorte de gradiente a 1 y parada temprana (paciencia 15, máximo 150 épocas). Los hiperparámetros se obtuvieron mediante búsqueda con Optuna para cada combinación de red y plazo. El modelo de la aplicación se seleccionó con los años de validación 2019-2023, antes del conjunto de test (enero de 2024 a noviembre de 2026). Los pesos publicados están reentrenados con datos hasta el 3 de noviembre de 2026, aunque las métricas reportadas corresponden a los modelos entrenados hasta el 31 de diciembre de 2023.

## Capacidades

- Predicción de series temporales financieras: precio del Brent a 1 semana, 3 meses y 1 año.
- Estimación de intervalos de confianza al 80 % mediante cuantiles empíricos.
- Ensemble por media de 5 semillas para reducir varianza.
- Procesamiento de 16 variables exógenas macrofinancieras y de materias primas.
- Integración con un pipeline ETL que descarga datos de FRED y Yahoo Finance (`run_etl()`).
- Uso directo sin reentrenamiento a través de la función `forecast()` del paquete `oil_forecast`.
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-paso.

## Casos de uso

- **Análisis exploratorio académico:** reproducir el pipeline completo (ETL, escalado, entrenamiento con Optuna, evaluación con Diebold-Mariano) como material docente o base para experimentos con RNN en series financieras.
- **Benchmark de referencia para forecasting de materias primas:** usar los RMSE relativos al ingenuo publicados como línea base contra la que comparar modelos más complejos (Transformers temporales, modelos fundacionales de series).
- **Prototipado de aplicaciones web de predicción:** la función `forecast()` devuelve predicción e intervalo para los tres plazos, lo que permite montar una demo interactiva sin infraestructura de entrenamiento.
- **Estudio de incertidumbre en predicción financiera:** los cuantiles del intervalo al 80 % (con coberturas empíricas de 79 %, 80 % y 87 %) sirven para analizar calibración de intervalos en modelos recurrentes.
- **Comparación de celdas recurrentes:** el repositorio incluye RNN, LSTM y GRU con la misma configuración, lo que permite estudiar empíricamente las diferencias de rendimiento entre celdas en un problema concreto.
- **Integración en dashboards de seguimiento:** alimentar un panel interno con previsiones a distintos horizontes y su banda de incertidumbre, siempre como señal auxiliar y no como recomendación de inversión.
- **Reproducibilidad de experimentos:** los ficheros `modelos.json` y `especificacion.json` documentan escalado, hiperparámetros y pesos del ensemble, lo que facilita replicar exactamente los resultados.

## Benchmarks y rendimiento

RMSE en dólares relativo al modelo ingenuo (precio de hoy como predicción), test de enero de 2024 a noviembre de 2026. Un valor de 1 equivale a empatar con el ingenuo; por debajo de 1 lo mejora.

| Plazo | RNN simple | LSTM | GRU | Modelo de la aplicacion | Cobertura intervalo 80 % |
|---|---|---|---|---|---|
| 1 semana | 0,992 | 0,999 | 0,993 | 0,999 | 79 % |
| 3 meses | 1,110 | 0,972 | 1,020 | 1,094 | 80 % |
| 1 año | 0,955 | 0,933 | 0,938 | 0,933 | 87 % |

Ninguna red mejora al ingenuo de forma estadísticamente significativa (test de Diebold-Mariano, p > 0,05). La mejora a 1 año (RMSE −6,7 %) no es significativa. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un LLM.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todos los casos, dado el tamaño de los modelos (entre 4.369 y 14.881 parámetros).
- GPU recomendadas: no requiere GPU; la inferencia es viable en CPU sin latencia apreciable.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, GTX 1650) e incluso en dispositivos de baja potencia.
- Opciones de despliegue: PyTorch nativo; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia interna, el propio repositorio incluye tres alternativas comparables entre sí:

| Modelo | Parametros (plazo corto / medio / largo) | Contexto | RMSE relativo 1 año | Licencia |
|---|---|---|---|---|
| RNN simple | — / 13.633 / — | 20 días | 0,955 | No disponible |
| LSTM | 4.369 / — / 14.881 | 20 días | 0,933 | No disponible |
| GRU | — / — / — | 20 días | 0,938 | No disponible |

No se conocen modelos públicos directamente comparables de forecasting del Brent con RNN en Hugging Face según la información disponible.

## Limitaciones y advertencias

- A 1 semana y a 3 meses las redes no se separan del modelo ingenuo; la mejora a 1 año (RMSE −6,7 %) no es estadísticamente significativa.
- No anticipan saltos bruscos del precio (decisiones de la OPEP+, conflictos geopolíticos, recesiones); se adaptan solo cuando el salto ya está reflejado en los datos.
- Trabajo académico de Aprendizaje Automático; no constituye una recomendación de inversión.
- Licencia no especificada en la información disponible, lo que impide confirmar condiciones de uso comercial.
- Ventana de entrada fija de 20 días hábiles; no admite contextos más largos sin reentrenamiento.
- Dependencia de un ETL externo (FRED y Yahoo Finance) para generar las 16 variables de entrada; cualquier cambio en las fuentes puede romper el pipeline.
- Riesgo de alucinación no aplicable en el sentido de LLM, pero sí de sobreajuste a regímenes históricos concretos.
- El intervalo al 80 % tiene coberturas empíricas de 79 %, 80 % y 87 %, lo que sugiere infracobertura en el plazo largo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RubenElices/PREDICCION_PETROLEO_RNN
- Código, notebooks y resultados: https://github.com/rubenelices/PREDICCION_PETROLEO_RNN
