# noracodes/water-tank-consumption-random-forest

## Resumen

Water Tank Consumption Random Forest es un modelo de regresion tabular publicado por el usuario noracodes en Hugging Face. No es un modelo de lenguaje ni una red neuronal: se trata de un `RandomForestRegressor` de scikit-learn serializado con skops, entrenado para predecir el consumo horario de agua de un hogar en litros por hora. El modelo se distribuye bajo licencia CC BY 4.0 y su pipeline declarado es `tabular-regression`.

El modelo resuelve un problema acotado de prevision de series temporales: dado un conjunto de nueve caracteristicas derivadas de la hora, el dia de la semana y los retardos de consumo (1, 2, 24 y 168 horas, mas medias moviles de 3 y 24 horas), estima el consumo de la hora siguiente. Se entrena exclusivamente con datos de un unico apartamento anonimizado sueco (APT_017) del HSB Living Lab Water Consumption Dataset, correspondiente al periodo de septiembre de 2020 a agosto de 2021 con resolucion horaria.

Su relevancia es limitada y experimental: sirve como referencia educativa para experimentacion con prevision de consumo en depositos de agua inteligentes. El autor lo declara explicitamente como destinado a uso educativo, no validado sobre el hardware final (ESP32) y no apto para confirmar fugas de agua. El repositorio ocupa 0.0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest (RandomForestRegressor de scikit-learn), ensemble de arboles de decision |
| Parametros totales | no disponible (200 arboles, profundidad maxima 12; el numero de nodos y hojas no se publica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventana de entrada fija de 9 caracteristicas, con requisito de 168 horas de historico de consumo |
| Tipos de cuantizacion | no disponible (no aplica a modelos de arboles de scikit-learn) |
| Idiomas soportados | no disponible (modelo numerico, sin procesamiento de lenguaje) |
| Licencia | CC BY 4.0 |
| Formato de pesos | `model.skops` (serializacion skops), acompanado de `metadata.json`, `example_input.json` y `requirements.txt` |

## Arquitectura y entrenamiento

La arquitectura es un bosque aleatorio de regresion con 200 arboles, profundidad maxima de 12 y un minimo de 5 muestras por hoja. La entrada es un vector de 9 caracteristicas tabulares: `hour`, `day_of_week`, `is_weekend`, `lag_1_hour`, `lag_2_hours`, `lag_24_hours`, `lag_168_hours`, `average_previous_3_hours` y `average_previous_24_hours`. La salida es un valor continuo en litros por hora. No hay fases de preentrenamiento, ajuste fino con RLHF/DPO ni decodificacion especulativa; el entrenamiento es un ajuste supervisado clasico sobre datos tabulares.

Los datos proceden del HSB Living Lab Water Consumption Dataset (Zenodo, registro 18971107, licencia CC BY 4.0), restringidos al apartamento APT_017 durante doce meses con resolucion horaria. El modelo requiere 168 horas (siete dias) de historico de consumo para construir los retardos de 168 horas y las medias moviles. La evaluacion publicada compara el bosque aleatorio con una linea base de siete dias y con una regresion lineal: el bosque obtiene un MAE de 10.981 L/hora en prediccion a una hora frente a 11.622 L/hora de la linea base y 11.947 L/hora de la regresion lineal. En prevision recursiva a 24 horas, el bosque logra 42.95 L/dia frente a 43.00 L/dia de la linea base, practicamente empatado.

## Capacidades

- Regresion tabular supervisada: predice consumo horario de agua en litros por hora a partir de 9 caracteristicas.
- Modelado de estacionalidad horaria y semanal mediante las variables `hour`, `day_of_week` e `is_weekend`.
- Uso de autocorrelacion a corto y largo plazo mediante retardos de 1, 2, 24 y 168 horas.
- Suavizado de senal mediante medias moviles de 3 y 24 horas.
- Prevision recursiva a 24 horas (encadenando predicciones), aunque con rendimiento equivalente a la linea base.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues.
- No dispone de modo thinking ni de generacion de texto.

## Casos de uso

- Experimentacion educativa en prevision de consumo de agua: el modelo sirve como punto de partida reproducible para comparar tecnicas de regresion tabular frente a lineas base en series temporales horarias.
- Prototipado de depositos de agua inteligentes: integrado en un pipeline que recopile lecturas horarias, puede generar una estimacion de la hora siguiente para validar la logica de un sistema embebido antes de desplegar modelos mas complejos.
- Comparacion de algoritmos en docencia: su MAE documentado (10.981 L/hora) y su linea base permiten ilustrar el impacto marginal de un bosque aleatorio frente a una regresion lineal en datos de un solo hogar.
- Analisis de sensibilidad de caracteristicas: al ser un modelo de arboles, permite inspeccionar la importancia de variables (hora, retardos, medias moviles) en un cuaderno de experimentacion.
- Generacion de series sinteticas de consumo para pruebas de software: las predicciones pueden alimentar simuladores de telemetria en entornos de desarrollo, siempre que se acepte su escasa generalizacion.
- Evaluacion de pipelines de forecasting recursivo: util para medir como degrada el error al encadenar predicciones a 24 horas, dado que el autor documenta el empate con la linea base.

## Benchmarks y rendimiento

| Metodo | MAE a una hora (L/hora) | MAE a 24 horas (L/dia) |
|---|---:|---:|
| Linea base de siete dias | 11.622 | 43.00 |
| Regresion lineal | 11.947 | no disponible |
| Random Forest (este modelo) | 10.981 | 42.95 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo de regresion tabular.

## Requisitos de hardware

- VRAM: no aplica; la inferencia se ejecuta en CPU. El modelo es un bosque de 200 arboles con profundidad 12, de tamano reducido (repositorio de 0.0 GB).
- GPU recomendadas: no aplica; scikit-learn no aprovecha GPU para inferencia de Random Forest.
- Cabe en cualquier GPU consumer y en CPU de gama baja; el cuello de botella es la latencia de carga del objeto skops, no el computo.
- Opciones de despliegue: inferencia directa con scikit-learn y skops en Python; servicio HTTP con FastAPI o Flask; integracion en pipelines de datos con pandas. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada; para un bosque de este tamano se espera latencia de microsegundos a milisegundos por prediccion en CPU, pero no se ha publicado una medicion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Water Tank Consumption Random Forest (este) | 200 arboles, profundidad 12 | 9 caracteristicas, 168 h de historico | MAE 10.981 L/hora | CC BY 4.0 | Hugging Face, 0 descargas |
| Regresion lineal (linea base del autor) | no disponible | mismas 9 caracteristicas | MAE 11.947 L/hora | no disponible | referenciada en la model card |
| Linea base de siete dias | no aplica | historico de 7 dias | MAE 11.622 L/hora | no disponible | referenciada en la model card |

No se dispone de informacion sobre otros modelos publicos comparables de prevision de consumo de agua en la documentacion proporcionada.

## Limitaciones y advertencias

- Entrenado con un unico apartamento anonimizado sueco (APT_017); no se ha validado su generalizacion a otros hogares ni a otras ubicaciones geograficas.
- No validado sobre el hardware final ESP32, por lo que su comportamiento en un despliegue embebido real es desconocido.
- Requiere 168 horas de historico de consumo para construir la caracteristica `lag_168_hours`; sin esa ventana el modelo no puede generar predicciones validas.
- No es adecuado para confirmar fugas de agua; los experimentos de deteccion de fugas del autor no fueron suficientemente fiables.
- La mejora frente a la linea base es marginal: 0.641 L/hora de reduccion de MAE a una hora y 0.05 L/dia a 24 horas, lo que cuestiona su valor practico frente a alternativas mas simples.
- Riesgo de sobreajuste a los patrones de un solo hogar y a un unico periodo de doce meses; no se documentan sesgos demograficos, pero la muestra es de tamano 1 en terminos de hogares.
- Licencia CC BY 4.0: permite uso comercial con atribucion, pero el autor declara el modelo para uso educativo, lo que conviene tener en cuenta antes de integrarlo en produccion.
- No dispone de procesamiento de lenguaje, por lo que no admite entradas textuales ni instrucciones en lenguaje natural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/noracodes/water-tank-consumption-random-forest
- Dataset de origen (HSB Living Lab Water Consumption Dataset): https://zenodo.org/records/18971107
