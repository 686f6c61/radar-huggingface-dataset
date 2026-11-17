# noracodes/diabai-glucose-delta-random-forest

## Resumen

DiabAI 30-Minute Glucose Delta Random Forest es un modelo de regresion tabular publicado por el usuario noracodes en Hugging Face. No es un modelo de lenguaje ni una red neuronal: se trata de un `RandomForestRegressor` de scikit-learn entrenado para predecir el cambio de glucosa a 30 minutos vista en pacientes con diabetes, a partir de datos de monitorizacion continua de glucosa (CGM). El modelo estima el delta de glucosa y reconstruye la glucosa futura sumando ese delta a la lectura actual.

El modelo se apoya en 21 caracteristicas derivadas de historicos de glucosa (lags de 15 minutos a 24 horas, medias y desviacion tipica en ventanas de 1, 3, 6 y 24 horas, cambios recientes), codificaciones ciclicas de hora y dia de la semana, y una variable de cohorte (diabetes tipo 1 o tipo 2). Se entreno con los conjuntos ShanghaiT1DM y ShanghaiT2DM, con 112.934 ejemplos completos de 110 participantes utilizables.

Su relevancia es acotada y explicita: el autor lo presenta como modelo educativo para demostrar pronostico de series temporales tabulares y comparacion reproducible de metodos. No es un dispositivo medico ni esta validado clinicamente, y la propia model card prohibe su uso para ajustar insulina, alarmas de hipoglucemia o decisiones de tratamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest (`RandomForestRegressor` de scikit-learn) |
| Parametros totales | no disponible (200 arboles, profundidad maxima 12; el numero de parametros no se publica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; requiere 21 caracteristicas derivadas de una ventana de 24 horas con rejilla de 15 minutos |
| Tipos de cuantizacion | no disponible (artefacto `model.skops`; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (modelo tabular, sin procesamiento de lenguaje) |
| Licencia | CC BY 4.0 |
| Formato de pesos | `model.skops` (serializacion skops de scikit-learn) |

## Arquitectura y entrenamiento

El modelo es un bosque aleatorio de regresion con 200 arboles, profundidad maxima 12, minimo de 5 muestras por hoja y `max_features=0.8` por division, con semilla 42. La innovacion de diseno es predecir el delta de glucosa a 30 minutos en lugar de la glucosa absoluta; la glucosa futura se reconstruye como `glucose_current + delta_predicho`. Las 21 caracteristicas de entrada combinan lags (15, 30, 45, 60, 120, 180 minutos y 24 horas), medias moviles (1, 3, 6 y 24 horas), desviacion tipica de la ultima hora, cambios en 15, 30 y 60 minutos, codificaciones seno/coseno de hora y dia de la semana, y el indicador de cohorte `is_t1dm`. Todas las caracteristicas usan solo lecturas presentes o pasadas, sin fuga de informacion futura.

Los datos provienen de los conjuntos ShanghaiT1DM y ShanghaiT2DM (Figshare DOI 10.6084/m9.figshare.21600933.v5), con 12 participantes T1DM y 100 T2DM originales; tras la validacion de esquema quedaron 12 T1DM y 98 T2DM, con 125.489 lecturas CGM y 112.934 ejemplos completos. Se excluyeron dos ficheros T2DM sin columna CGM y no se imputaron huecos. La particion se hizo por paciente: 77 pacientes y 76.397 filas para entrenamiento, 16 pacientes y 19.563 filas para validacion, y 17 pacientes y 16.974 filas para test. Tras seleccionar la configuracion, el modelo final se reentreno con los 93 pacientes de entrenamiento y validacion (95.960 filas) y se evaluo una sola vez sobre los 17 pacientes de test. No se documenta RLHF, DPO ni ajuste fino adicional.

## Capacidades

- Regresion tabular para pronostico del cambio de glucosa a 30 minutos en pacientes con diabetes tipo 1 y tipo 2.
- Reconstruccion de glucosa futura en mg/dL mediante la funcion auxiliar `predict_future_glucose`.
- Manejo de caracteristicas temporales: lags, medias moviles, desviacion tipica y cambios recientes sobre una rejilla regular de 15 minutos.
- Codificacion ciclica de hora del dia y dia de la semana.
- Diferenciacion de cohorte T1DM/T2DM mediante la variable `is_t1dm`.
- Carga y prediccion validadas mediante `inference.py` y el artefacto `model.skops`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues.

## Casos de uso

- Docencia y cursos de machine learning: el modelo sirve para ilustrar pronostico de series temporales tabulares con particion por paciente y comparacion contra lineas base como persistencia y regresion lineal.
- Prototipado de investigacion: permite disponer de una linea base reproducible de pronostico a 30 minutos para comparar con modelos mas complejos (LSTM, transformers temporales) sobre los mismos datos de Shanghai.
- Demostracion no clinica de la plataforma DiabAI: integrable en una demo claramente etiquetada como no medica para mostrar la logica de prediccion delta y reconstruccion de glucosa futura.
- Analisis retrospectivo de cohortes: aplicable a estudios que ya dispongan de historicos CGM en rejilla de 15 minutos para estimar cambios esperados y analizar errores por rango de glucosa o cohorte.
- Evaluacion de metodologia de validacion: util como ejemplo de particion por paciente y evaluacion unica en test, replicable en trabajos de prediccion glucemica.
- Referencia para comparativas de modelos tabulares: su MAE de test de 8,8821 mg/dL frente a persistencia (11,3988) y regresion lineal (9,2644) ofrece un punto de comparacion concreto para nuevos desarrollos.
- No debe usarse para alarmas de hipoglucemia o hiperglucemia, ajuste de dosis de insulina, decisiones dieteticas ni atencion de emergencia.

## Benchmarks y rendimiento

Resultados en el conjunto de test retenido por paciente (17 pacientes, 16.974 filas):

| Metodo | MAE (mg/dL) | RMSE (mg/dL) | R² |
|---|---:|---:|---:|
| Persistencia | 11,3988 | 16,9065 | 0,8802 |
| Regresion lineal | 9,2644 | 13,1625 | 0,9274 |
| Delta Random Forest | 8,8821 | 12,8176 | 0,9311 |

Rendimiento del Random Forest por cohorte:

| Cohorte | Filas | MAE | RMSE | R² |
|---|---:|---:|---:|---:|
| T1DM | 2.058 | 9,7632 | 13,7069 | 0,9470 |
| T2DM | 14.916 | 8,7605 | 12,6900 | 0,9276 |

Rendimiento del Random Forest por rango de glucosa real:

| Rango real | Filas | MAE | RMSE | R² |
|---|---:|---:|---:|---:|
| Menos de 70 mg/dL | 520 | 7,0527 | 9,4616 | -0,5796 |
| 70-180 mg/dL | 13.519 | 8,0087 | 11,4905 | 0,8436 |
| Mas de 180 mg/dL | 2.935 | 13,2289 | 18,0592 | 0,6966 |

El modelo reduce el MAE de test un 22,08 % respecto a persistencia y un 4,13 % respecto a regresion lineal. El R² negativo en el subgrupo por debajo de 70 mg/dL refleja un subconjunto pequeno y de rango estrecho, y advierte de que el modelo no es fiable como alerta de hipoglucemia.

## Requisitos de hardware

- Inferencia en CPU: un bosque de 200 arboles con profundidad 12 y 21 caracteristicas es ligero; no requiere GPU.
- VRAM estimada: no aplica; el artefacto `model.skops` ocupa una fraccion del repositorio de 0,1 GB.
- GPU recomendadas: no aplica. Cualquier CPU moderna es suficiente.
- Cabe en cualquier equipo de consumo, incluidos portatiles y entornos sin acelerador.
- Despliegue: carga mediante `skops` y scikit-learn con las dependencias exactas de `requirements.txt`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | MAE test (mg/dL) | Licencia | Disponibilidad |
|---|---|---|---:|---:|---|---|
| DiabAI Delta Random Forest | Random Forest (delta) | no disponible | ventana de 24 h en rejilla de 15 min | 8,8821 | CC BY 4.0 | Hugging Face |
| Persistencia (linea base) | Regla naive | no aplica | lectura actual | 11,3988 | no aplica | referencia interna |
| Regresion lineal (linea base) | Regresion lineal | no disponible | mismas 21 caracteristicas | 9,2644 | no aplica | referencia interna |
| Otros modelos de pronostico glucemico | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de comparacion con modelos externos de pronostico glucemico en la informacion proporcionada.

## Limitaciones y advertencias

- No es un dispositivo medico ni esta validado clinicamente; no debe guiar dosis de insulina, medicacion, comidas, diagnostico ni atencion de emergencia.
- No debe usarse como alarma de hipoglucemia o hiperglucemia; el R² negativo por debajo de 70 mg/dL lo desaconseja explicitamente.
- Requiere un historico completo de 24 horas en una rejilla regular de 15 minutos; no se imputan huecos.
- Entrenado solo con las cohortes ShanghaiT1DM/T2DM; puede no generalizar a pacientes de otros paises, otros dispositivos CGM o intervalos de muestreo distintos.
- La representacion T1DM es mucho menor que la T2DM (12 frente a 98 participantes), lo que limita la robustez en tipo 1.
- No incorpora comidas, insulina, ejercicio, enfermedad, sueno, estres ni efectos especificos del sensor por falta de registro completo.
- El error es mayor por encima de 180 mg/dL (MAE de 13,2289 mg/dL frente a 8,0087 mg/dL en el rango 70-180).
- El artefacto `model.skops` predice el cambio, no la glucosa futura; usar directamente su salida como glucosa es un error de uso.
- La licencia CC BY 4.0 permite uso comercial con atribucion, pero la model card restringe el uso previsto a fines educativos y de investigacion no clinica.
- Sesgos conocidos: no documentados de forma especifica en la informacion proporcionada, mas alla de la infrarrepresentacion de T1DM y la procedencia geografica unica de los datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/noracodes/diabai-glucose-delta-random-forest
- Dataset en Figshare: https://doi.org/10.6084/m9.figshare.21600933.v5
- Paper del dataset (Scientific Data): https://www.nature.com/articles/s41597-023-01940-7
