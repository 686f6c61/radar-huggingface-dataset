# cadambank/superkart-sales-model

## Resumen

El modelo `superkart-sales-model`, publicado por el usuario `cadambank` en Hugging Face, es un modelo de regresion tabular orientado a la prediccion de ventas. Su objetivo concreto es estimar la variable `Product_Store_Sales_Total`, es decir, el total de ventas de un producto en una tienda determinada. No se trata de un modelo de lenguaje ni de una red neuronal profunda, sino de un clasico de machine learning supervisado: un `RandomForestRegressor` de scikit-learn encapsulado en un `Pipeline` que incluye codificacion one-hot de variables categoricas.

El modelo se distribuye como un artefacto serializado en formato `joblib` y esta pensado para integrarse en flujos de MLOps de prevision de demanda y ventas. Segun la model card, alcanza un R2 de 0,9305 y un MAPE del 3,86 % sobre el conjunto de test, con hiperparametros concretos (`max_depth=None`, `min_samples_leaf=5`, `n_estimators=100`).

La relevancia de esta ficha es limitada en el contexto de IA generativa: no hay informacion sobre arquitectura de red, contexto, idiomas ni licencia. Los datos disponibles son exclusivamente los de la model card y los metadatos de Hugging Face. El repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RandomForestRegressor dentro de un Pipeline de scikit-learn (one-hot encoding + modelo) |
| Parametros totales | no disponible (no aplica; modelo de arboles, no red neuronal) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no disponible (no aplica; artefacto joblib) |
| Idiomas soportados | no disponible (no aplica; entrada tabular) |
| Licencia | no disponible |
| Formato de pesos | joblib (`superkart_sales_model_v1.joblib`) |

## Arquitectura y entrenamiento

El modelo es un `RandomForestRegressor` de scikit-learn integrado en un `Pipeline` que aplica codificacion one-hot a las variables categoricas antes de alimentar el bosque de arboles. Los hiperparametros seleccionados son `max_depth=None` (arboles sin limite de profundidad), `min_samples_leaf=5` y `n_estimators=100`. No se documenta el criterio de splitting, el numero de variables de entrada ni el esquema de validacion cruzada empleado.

Los datos de entrenamiento provienen del dataset `cadambank/superkart-sales-data`, enlazado en la model card. No se especifica el numero de filas, la composicion de columnas, el rango temporal ni si hubo ingenieria de caracteristicas adicional. Tampoco se menciona ningun proceso de regularizacion, calibracion ni optimizacion bayesiana de hiperparametros. El modelo no incorpora RLHF, DPO ni tecnicas de alineacion, al no ser un modelo generativo.

## Capacidades

- Regresion tabular: predice la variable continua `Product_Store_Sales_Total` a partir de caracteristicas de producto y tienda.
- Codificacion automatica de variables categoricas mediante one-hot encoding dentro del propio pipeline.
- Inferencia determinista y reproducible con `joblib.load` y `pipeline.predict`.
- Integracion sencilla en pipelines de scikit-learn y en servicios Python.
- No dispone de tool calling, function calling ni soporte de agentes.
- No dispone de capacidades multilingues, vision, audio ni modo de razonamiento.
- No soporta generacion de texto ni razonamiento multi-paso.

## Casos de uso

- Prevision de ventas por producto y tienda: el modelo recibe las caracteristicas del producto y del establecimiento y devuelve el total de ventas esperado, con un MAPE del 3,86 % en test.
- Planificacion de inventario: usar la prediccion como senal de demanda para ajustar reposiciones por tienda y producto, reduciendo roturas de stock.
- Presupuestacion comercial: agregar las predicciones por tienda para estimar ingresos trimestrales y comparar con objetivos.
- Deteccion de anomalias de ventas: comparar la prediccion del modelo con las ventas reales para marcar desviaciones significativas que requieran revision manual.
- Segmentacion de surtido: identificar combinaciones producto-tienda con ventas previstas bajas para revisar su inclusion en el catalogo.
- Integracion en dashboards de BI: exponer el pipeline como endpoint interno que alimente informes de ventas con previsiones actualizadas.
- Evaluacion de promociones: estimar el efecto de cambios en las caracteristicas de entrada sobre la venta total prevista antes de lanzar una campana.

## Benchmarks y rendimiento

| Metrica | Valor (test) |
|---|---|
| RMSE | 281,67 |
| MAE | 106,14 |
| R2 | 0,9305 |
| MAPE | 3,86 % |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. Las metricas anteriores son las unicas reportadas por el autor en la model card.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU y no requiere GPU.
- GPU recomendadas: no aplica; un RandomForest de 100 arboles con `min_samples_leaf=5` se sirve en CPU sin problemas.
- Cabida en hardware de consumo: si, en cualquier portatil o servidor con Python y memoria RAM suficiente para cargar el artefacto joblib y el dataset de inferencia.
- Opciones de despliegue: `joblib` + `scikit-learn` en un servicio Python (FastAPI, Flask), o exportacion a ONNX si se necesita portabilidad. No aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependen del numero de filas a predecir y del hardware. Para lotes pequenos, la inferencia de un bosque de 100 arboles es del orden de milisegundos por fila en CPU moderna.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (regresion tabular para prevision de ventas) ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- La licencia no esta especificada, por lo que no se puede garantizar el uso comercial sin contactar con el autor.
- No se documentan sesgos conocidos ni la distribucion del dataset de entrenamiento, lo que impide evaluar su representatividad.
- Riesgo de sobreajuste: `max_depth=None` permite arboles sin limite de profundidad; conviene validar en datos fuera de la muestra original.
- El modelo predice una unica variable (`Product_Store_Sales_Total`) y no generaliza a otras metricas sin reentrenamiento.
- No hay informacion sobre el esquema de columnas de entrada; es necesario consultar el dataset `cadambank/superkart-sales-data` para construir las caracteristicas correctamente.
- El rendimiento reportado (MAPE 3,86 %) corresponde al conjunto de test del autor y puede no replicarse en datos de otra organizacion o periodo temporal.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni de validacion externa.
- El tamano del repo aparece como 0.0 GB, lo que puede indicar que el artefacto no esta efectivamente subido o que el dato de metadatos es impreciso; conviene verificar la descarga antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cadambank/superkart-sales-model
- Dataset de entrenamiento: https://huggingface.co/datasets/cadambank/superkart-sales-data
