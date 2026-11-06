# Skywalker1910/skynet-aqi-models

## Resumen

`Skywalker1910/skynet-aqi-models` es un paquete de modelos de predicción de calidad del aire desarrollado por el usuario Skywalker1910 dentro del proyecto "skynet". No es un modelo de lenguaje: se trata de tres boosters de LightGBM (uno por horizonte) que predicen el índice de calidad del aire (AQI) de la EPA en una estación de monitorización con 1, 6 y 24 horas de antelación. Se distribuyen como ficheros `model_h1.txt`, `model_h6.txt` y `model_h24.txt` junto con un `metadata.json` que define el contrato exacto de características.

El modelo se entrena sobre el panel `Skywalker1910/skynet-aqi-panel` (4.182.950 filas, 264 características, ventana 2023-01-01 a 2026-03-31) y se evalúa mediante un backtest de origen móvil entre 2025-04-05 y 2026-03-31. La relevancia práctica está en su comportamiento diferenciado por horizonte: es utilizable como alerta a 1 hora (CSI 0,728), aceptable como predicción puntual a 6 horas con umbral ajustado, y explícitamente desaconsejado como alerta de superación a 24 horas.

La licencia CC-BY-4.0 permite uso comercial con atribución. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosted trees (LightGBM) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular; 264 caracteristicas de entrada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | cc-by-4.0 |
| Formato de pesos | ficheros de texto LightGBM (`model_h{1,6,24}.txt`) + `metadata.json` |

## Arquitectura y entrenamiento

Cada horizonte dispone de un booster LightGBM independiente entrenado sobre datos tabulares. El conjunto de características es de 264 variables, con modo meteorológico `observed`. El entrenamiento se realizó en CPU con LightGBM 4.6.0, NumPy 2.3.3, pandas 2.3.3 y scikit-learn 1.7.2, sobre 4.182.950 filas que cubren desde 2023-01-01 05:00 UTC hasta 2026-03-31 00:00 UTC. El commit de referencia es `3ef651a` y la marca temporal de entrenamiento es 2026-11-02T14:56:14 UTC.

El paquete incluye umbrales de decisión ajustados por horizonte (98,7 para h=1; 83,9 para h=6; 72,8 para h=24), aplicados por `Bundle.alert`. Estos umbrales están por debajo de 100 de forma deliberada: las predicciones se comprimen hacia la media a medida que crece el horizonte, por lo que un corte fijo en 100 se compara contra una magnitud que ya no lo alcanza. La model card advierte explícitamente que las métricas CSI publicadas (con corte en 100 sin ajustar) no reflejan el comportamiento de alerta real del modelo con los umbrales ajustados.

## Capacidades

- Predicción puntual del AQI de la EPA a 1, 6 y 24 horas vista en una estación de monitorización.
- Clasificación de superación del umbral AQI>100 mediante umbrales de decisión ajustados por horizonte.
- Entrada tabular con 264 características y modo meteorológico `observed`.
- Contrato de características explícito en `metadata.json`, lo que permite reproducir la inferencia.
- Soporte de tool calling / function calling: no disponible (no es un modelo generativo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el modelo opera sobre variables numéricas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Alerta temprana de episodios de contaminación a 1 hora: con MAE 2,178, R² 0,927 y CSI 0,728 frente a una tasa base inferior al 1 %, el modelo es apto tanto como predicción puntual como para disparar avisos con el umbral por defecto de 100, que ya es el óptimo para CSI.
- Avisos a 6 horas con umbral ajustado: como predicción puntual tiene el mayor margen de habilidad MAE sobre persistencia de los tres horizontes; para alertas debe desplegarse con el umbral de 90 (CSI 0,296) y declarar explícitamente la tasa de detección.
- Predicción puntual de calidad del aire típica a 24 horas: útil como estimación de nivel esperado (MAE 9,336, R² 0,4845), superando a persistencia en MAE, pero no como alerta de superación.
- Integración en paneles de monitorización ambiental: el contrato de características en `metadata.json` permite encadenar la inferencia por lotes sobre datos horarios de estaciones.
- Investigación sobre protocolos de backtest en series temporales: el paquete documenta de forma separada el backtest de origen móvil y el bundle final, lo que sirve como caso de estudio de evaluación honesta.
- Comparación de habilidad por horizonte en tareas de superación de umbral: los datos publicados permiten contrastar el decaimiento de la detección con la línea base de persistencia.
- Sistemas de apoyo a la decisión con advertencias graduadas: combinando los tres boosters se puede construir una salida con niveles de confianza diferenciados por horizonte.

## Benchmarks y rendimiento

Resultados declarados por el autor (`verified: false`) sobre el panel `skynet US station-hourly AQI panel`, backtest de origen móvil 2025-04-05 a 2026-03-31:

| Horizonte | MAE | RMSE | R² | POD (AQI>100, corte sin ajustar) | FAR | CSI |
|---|---|---|---|---|---|---|
| 1 h | 2,178 | 5,445 | 0,9273 | 0,8106 | 0,1251 | 0,7282 |
| 6 h | 6,373 | 11,390 | 0,6896 | 0,2208 | 0,3176 | 0,1965 |
| 24 h | 9,336 | 14,666 | 0,4845 | 0,0374 | 0,3226 | 0,0362 |

La model card indica además que, con umbrales ajustados, el CSI a 6 horas sube a 0,296 con corte en 90, y que el techo de detección medido a 24 horas es CSI 0,141 con corte en 70, frente al 0,135 de persistencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; la inferencia se ejecuta en CPU.
- GPU recomendadas: no aplica; el entrenamiento se realizó en CPU.
- Cabe en cualquier equipo consumer: los ficheros son de texto LightGBM y el repositorio ocupa 0,0 GB.
- Opciones de despliegue: biblioteca LightGBM 4.6.0 (o compatible) cargando los ficheros `model_h{1,6,24}.txt`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos tabulares.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Horizontes | MAE h=1 | CSI h=1 | Licencia |
|---|---|---|---|---|---|
| skynet-aqi-models | LightGBM tabular | 1, 6, 24 h | 2,178 | 0,7282 | CC-BY-4.0 |
| Persistencia (línea base citada) | Naive | 1, 6, 24 h | no disponible | no disponible (CSI h=24: 0,135) | no aplica |
| Otros modelos AQI comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card solo aporta la comparación explícita contra persistencia en el horizonte de 24 horas (CSI 0,141 del modelo frente a 0,135 de persistencia). No se dispone de datos de otros modelos de calidad del aire en la información proporcionada.

## Limitaciones y advertencias

- A 24 horas no debe usarse como alerta de superación: sobre 8 folds produjo 595 aciertos frente a 9.303 fallos y 277 falsas alarmas; su techo de detección (CSI 0,141) apenas supera a persistencia (0,135).
- A 6 horas es un buen predictor puntual pero un alertador débil: el CSI sin ajustar es 0,196 (aproximadamente una de cada cinco superaciones detectadas); requiere umbral ajustado y declaración explícita de la tasa de detección.
- Las métricas CSI publicadas usan un corte fijo en 100 y no reflejan el comportamiento con los umbrales ajustados del bundle; ambas configuraciones no deben citarse de forma intercambiable.
- El bundle final se entrena con toda la historia y no puede autoevaluarse; las métricas provienen de una ejecución separada sobre el mismo panel y conjunto de características, no configurada de forma idéntica.
- La habilidad de detección no decae de forma suave con el horizonte: se mantiene a corto plazo y cae bruscamente después, por lo que un pronóstico útil en un horizonte puede no superar a la persistencia en otro.
- Riesgo de sesgo y alucinación: no disponible en la información proporcionada; al ser un modelo de regresión tabular, el riesgo relevante es el error de predicción y la compresión hacia la media a horizontes largos.
- Cobertura geográfica y de idioma limitada: una única estación de monitorización y idioma inglés.
- La licencia CC-BY-4.0 permite uso comercial con atribución; no se documentan restricciones adicionales.
- Los resultados de benchmarks están marcados como no verificados (`verified: false`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Skywalker1910/skynet-aqi-models
- README del modelo: https://huggingface.co/Skywalker1910/skynet-aqi-models/blob/main/README.md
- Dataset de entrenamiento: https://huggingface.co/datasets/Skywalker1910/skynet-aqi-panel
