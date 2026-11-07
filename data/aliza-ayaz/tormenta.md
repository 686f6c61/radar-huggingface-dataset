# aliza-ayaz/tormenta

## Resumen

Tormenta es un modelo de regresión tabular entrenado con scikit-learn para predecir el índice planetario Kp (escala 0-9, medida estándar de perturbación geomagnética cada tres horas) a partir de parámetros del viento solar medidos aguas arriba de la Tierra. Lo desarrollan Alizeh y HRK en el marco del proyecto CT-378 de la Universidad NED (otoño de 2026). No es un modelo de lenguaje ni una red neuronal profunda: es un `HistGradientBoostingRegressor` con 66 características derivadas de física solar, orientado a un nowcast (estimación del estado actual) con un intervalo de predicción del 80 %.

Su relevancia radica en que no utiliza ningún índice geomagnético como entrada (Kp, Dst, AE), de modo que la predicción no espera a los datos de magnetómetros y puede emitirse solo con el viento solar propagado desde L1 por NOAA SWPC. Frente a la persistencia (baseline que repite el último Kp conocido), reduce el RMSE de 0,862 a 0,573 en el periodo de test 2020-2026, con una cobertura del intervalo del 80,8 % para el nivel nominal del 80 %.

El modelo es de propósito educativo y de concienciación situacional, no un servicio operativo de alerta. Su horizonte máximo es de aproximadamente una hora (tiempo de tránsito del viento solar de L1 a la Tierra) y subestima sistemáticamente las tormentas grandes (G3+), con unos −0,6 Kp de sesgo medio en esas horas. El repositorio de Hugging Face ocupa 0,0 GB y contiene el objeto serializado `models/current.joblib` junto con el código de características y predicción en `src/`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting sobre árboles de decisión (`HistGradientBoostingRegressor` de scikit-learn); tres modelos: punto y cuantiles q10/q90 con margen conformal (CQR) |
| Parametros totales | no disponible (modelo de árboles; el número de parámetros no es una métrica aplicable) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de secuencia; usa 66 características con lags y medias móviles de hasta 24 h y 3 días) |
| Tipos de cuantizacion | no disponible (no aplica; objeto joblib de scikit-learn 1.9.1) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible (la model card no declara licencia para los pesos; los datos de origen son CC BY 4.0 de GFZ y dominio público de NOAA) |
| Formato de pesos | joblib (`models/current.joblib`), serializado con scikit-learn 1.9.1; requiere Python 3.12 y versiones exactas de `requirements.txt` |

## Arquitectura y entrenamiento

El modelo es un `HistGradientBoostingRegressor` de scikit-learn que predice el Kp horario. Se compone de tres estimadores: uno de predicción puntual y dos de cuantiles (q10 y q90) a los que se aplica un margen conformal (CQR) para obtener un intervalo del 80 %. Las entradas son el módulo del campo magnético interplanetario |B|, sus componentes Bx, By y Bz en coordenadas GSM, la velocidad del protón, la densidad, la temperatura y el flujo solar F10.7. A partir de estas variables se construyen 66 características: derivados físicos, retardos (lags), medias móviles, posición dentro del bloque de 3 h del Kp y hora del día y del año. No se emplea ningún índice geomagnético como entrada.

El entrenamiento usa datos horarios de NASA OMNI2 desde 1998 hasta seis meses antes del Kp definitivo más reciente (reentrenamiento semanal; el corte queda registrado en `models/metrics_history.json`), con etiquetas del Kp definitivo de GFZ Potsdam. La selección de hiperparámetros se hace con validación cruzada ordenada temporalmente en 1998-2016, validación en 2017-2019 y un test final único de 2020 a enero de 2026. En producción, las entradas en vivo proceden del viento solar propagado de NOAA SWPC (resolución de 1 minuto, desplazado en el tiempo a la Tierra y promediado por horas como en OMNI).

## Capacidades

- Regresión tabular: predicción del índice Kp horario en escala 0-9.
- Intervalo de predicción del 80 % mediante modelos de cuantiles q10/q90 con margen conformal (CQR); cobertura medida del 80,8 % en test.
- Nowcast sin datos de magnetómetros: solo requiere viento solar y F10.7.
- Modo en vivo (`nowcast`) que descarga el viento solar en tiempo real de NOAA SWPC y predice cada hora reciente.
- Modo manual (`predict_steady`) que acepta un conjunto de condiciones y las asume constantes durante los 3 días previos (necesario por el uso de lags y medias de 24 h).
- Reentrenamiento semanal con etiquetas definitivas de GFZ.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo generativo.

## Casos de uso

- Concienciación situacional en educación: el modelo permite a estudiantes y docentes ilustrar la relación entre el viento solar y la perturbación geomagnética, con un nowcast que no depende de magnetómetros y un intervalo de incertidumbre explícito.
- Monitorización de aficionados a la meteorología espacial: integrado en un panel o script que consulte NOAA SWPC cada hora, ofrece una estimación del Kp con ~1 h de antelación máxima, útil para decidir si observar auroras en latitudes medias.
- Análisis retrospectivo de eventos: con datos históricos de OMNI2 se puede reconstruir el Kp esperado y comparar con el definitivo de GFZ, evaluando la respuesta del modelo en tormentas concretas como la G5 de mayo de 2024.
- Docencia de aprendizaje automático aplicado: sirve como ejemplo completo de pipeline con validación temporal, features derivadas de física, modelos de cuantiles e intervalos conformales, reproducible con scikit-learn.
- Prototipado de alertas internas no críticas: para equipos que quieran experimentar con umbrales de Kp (por ejemplo, avisos a operadores de radioafición o de instrumentación sensible) sin depender de un servicio operativo.
- Evaluación de sensibilidad de la física solar: el modo `predict_steady` permite variar Bz, velocidad o densidad y observar el efecto sobre el Kp predicho, útil para estudiar la respuesta del modelo a condiciones idealizadas.

## Benchmarks y rendimiento

Resultados en test de 2020 a enero de 2026 (52.848 horas, incluye la tormenta G5 de mayo de 2024), según la model card:

| Metrica | Tormenta | Baseline de persistencia |
|---|---|---|
| RMSE | 0,573 | 0,862 |
| MAE | 0,437 | 0,643 |
| R² | 0,808 | 0,566 |
| RMSE en horas de tormenta (Kp ≥ 5−) | 0,846 | 1,368 |
| Cobertura del intervalo del 80 % | 80,8 % | no disponible |

No se han publicado en la información disponible comparaciones con otros modelos de nowcast del Kp (por ejemplo, redes neuronales o modelos operativos de NOAA/GFZ).

## Requisitos de hardware

- VRAM: no aplica; es un modelo de árboles serializado en joblib que se ejecuta en CPU. El repositorio ocupa 0,0 GB.
- GPU: no necesaria. Cualquier CPU moderna basta para la inferencia; el coste dominante es la descarga de datos de NOAA SWPC y el cálculo de las 66 características.
- Cabe en cualquier equipo de consumo, incluidos portátiles y entornos gratuitos tipo Streamlit Community Cloud (la demo oficial corre en `tormenta.streamlit.app`).
- Despliegue: Python 3.12 con las versiones exactas de `requirements.txt` y scikit-learn 1.9.1; el objeto se carga con `joblib` a través de `src.predict.load_bundle`. No aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; por la naturaleza del modelo (tres gradient boosting sobre 66 features) se espera un coste de inferencia despreciable frente a la latencia de red al consultar NOAA SWPC.

## Comparativa con modelos similares

No se dispone en la información proporcionada de comparaciones con otros modelos de nowcast del Kp. La única referencia cuantitativa publicada es el baseline de persistencia incluido en la propia model card (ver tabla de benchmarks). Comparativas con modelos operativos de NOAA SWPC o GFZ, o con aproximaciones de aprendizaje profundo al nowcast del Kp, quedan como no disponibles.

## Limitaciones y advertencias

- No es un servicio operativo de alerta: para avisos operativos deben usarse NOAA SWPC o GFZ.
- Subestima las tormentas grandes: aproximadamente −0,6 Kp de media en horas G3+, porque esos eventos son raros en el entrenamiento.
- Los comienzos súbitos aparecen con 1-2 h de retraso dentro del bloque de 3 h del Kp.
- El horizonte máximo es de ~1 h (tiempo de tránsito del viento solar de L1 a la Tierra); no es un modelo de pronóstico a medio plazo.
- En el modo manual (`predict_steady`) se asume que las condiciones han permanecido estables durante los 3 días previos, lo que puede introducir sesgo si la situación real era variable.
- La licencia de los pesos no está declarada en la model card; los datos de origen son CC BY 4.0 (GFZ) y de dominio público (NOAA), pero la reutilización comercial del modelo requiere verificación previa con el autor.
- Dependencia estricta de versiones: el objeto está serializado con scikit-learn 1.9.1 y requiere Python 3.12 y las versiones exactas de `requirements.txt`; cambios de versión pueden romper la carga.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa por parte de la comunidad.
- Riesgo de alucinación no aplica (no es generativo), pero sí de extrapolación fuera del rango de entrenamiento en condiciones solares extremas poco representadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aliza-ayaz/tormenta
- Perfil del autor: https://huggingface.co/aliza-ayaz
- Código en GitHub: https://github.com/Syeda-Aliza-Ayaz/Tormenta
- Demo en vivo (Streamlit): https://tormenta.streamlit.app/
- Datos OMNI2 (NASA/GSFC SPDF): https://omniweb.gsfc.nasa.gov/
- Kp y F10.7 definitivos (GFZ Potsdam, CC BY 4.0): https://www.gfz-potsdam.de/
- Viento solar en tiempo real (NOAA SWPC): https://www.swpc.noaa.gov/
