# ruksanakhanum/superkart-sales-prediction-model

## Resumen

SuperKart Sales Prediction Model es un pipeline de regresión tabular publicado en Hugging Face por la usuaria ruksanakhanum. No es un modelo de lenguaje ni una red neuronal profunda: se trata de un `Pipeline` de scikit-learn que encadena escalado y codificación one-hot con un `XGBRegressor` de 400 árboles para predecir las ventas totales de un producto en una tienda de la cadena ficticia SuperKart. El modelo predice la columna `Product_Store_Sales_Total` a partir de nueve variables de entrada que describen el producto (peso, contenido de azúcar, área asignada en estantería, tipo, precio de venta recomendado) y la tienda (año de apertura, tamaño, tipo de ciudad y tipo de establecimiento).

El interés del artefacto es acotado y muy específico: sirve como ejemplo reproducible de un flujo de trabajo de regresión tabular con XGBoost, empaquetado con joblib y acompañado de un demo en Streamlit. El rendimiento declarado en el conjunto de test es alto (R² de 0,9193, RMSE de 300,5 y MAPE del 4,50 %), aunque el propio autor reconoce en la model card que el conjunto de datos es pequeño (8.763 registros, cuatro tiendas) y que existe una fuga metodológica menor por el recorte de valores atípicos antes de la partición.

Por tanto, no debe evaluarse como un modelo fundacional ni compararse con LLM: es un regresor tabular de dominio cerrado, entrenado sobre datos sintéticos o sintetizados, cuya relevancia práctica se limita a la docencia, la demostración de pipelines de ML y la experimentación con forecasting de ventas en retail a pequeña escala.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de scikit-learn: `StandardScaler` + `OneHotEncoder` → `XGBRegressor` (400 árboles, `max_depth=3`, `learning_rate=0.06`, `tree_method="hist"`) |
| Parámetros totales | no disponible (modelo de árboles; no se reporta número de nodos ni hojas) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular de 9 características) |
| Tipos de cuantizacion | no disponible (no aplica a modelos de árboles; el artefacto se serializa con joblib) |
| Idiomas soportados | no disponible (no procesa texto libre; las categorías están codificadas en inglés: `Low Sugar`, `Frozen Foods`, `Medium`, `Tier 2`, `Supermarket Type1`) |
| Licencia | MIT |
| Formato de pesos | joblib (`SuperKart_model_v1_0.joblib`, 478 KB) más `model_metadata.json` |

## Arquitectura y entrenamiento

El modelo es un pipeline clásico de aprendizaje supervisado para datos tabulares. La primera etapa aplica `StandardScaler` a las variables numéricas y `OneHotEncoder` a las categóricas; la segunda etapa es un `XGBRegressor` con 400 árboles de profundidad máxima 3, tasa de aprendizaje 0,06 y método de construcción `hist`. El objetivo es `Product_Store_Sales_Total`. El pipeline descarta las columnas `Store_Id` y `Product_Id` antes del entrenamiento, de modo que las nueve características restantes son las únicas señales de entrada. Las categorías no vistas en entrenamiento se ignoran en lugar de provocar un error, lo que facilita el despliegue pero puede enmascarar problemas de distribución.

El entrenamiento se realizó sobre el dataset `ruksanakhanum/superkart-sales-prediction-data`, con 8.763 registros históricos de ventas, divididos en 80/20 con `random_state=42` (7.010 filas de entrenamiento y 1.753 de test). No se menciona validación cruzada, búsqueda de hiperparámetros ni técnicas de regularización adicionales más allá de las propias del gradient boosting. Tampoco se documenta el origen exacto de los datos: el autor los describe como «synthetic-looking distributions» de cuatro tiendas, lo que sugiere que no provienen de un retailer real. No hay fases de RLHF, DPO ni ajuste por preferencias, algo esperable en un regresor tabular.

## Capacidades

- Predicción de ventas totales por producto y tienda a partir de nueve variables tabulares.
- Manejo nativo de variables categóricas mediante one-hot encoding dentro del pipeline.
- Tolerancia a categorías no vistas: se ignoran en lugar de lanzar excepción.
- Serialización completa del pipeline (preprocesado + modelo) en un único archivo joblib de 478 KB, lo que simplifica el despliegue.
- Integración directa con pandas: acepta un `DataFrame` con las nueve columnas esperadas y devuelve la predicción numérica.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es exclusivamente un regresor numérico.
- No tiene capacidades multilingües en sentido estricto; las etiquetas categóricas están fijadas en inglés.

## Casos de uso

- **Demostración docente de pipelines de ML**: el artefacto sirve para ilustrar cómo empaquetar preprocesado y modelo en un único objeto joblib y exponerlo vía Streamlit, tal como hace el demo del autor. Es adecuado por su tamaño reducido (478 KB) y su API simple.
- **Prototipado de forecasting de ventas en retail**: permite estimar ventas por producto y tienda en un entorno controlado con cuatro tiendas, útil para validar la lógica de un producto analítico antes de invertir en datos reales.
- **Análisis de sensibilidad de variables**: al ser un modelo de árboles con solo nueve features, se puede usar para estudiar cómo varía la predicción al modificar el precio de venta recomendado, el área asignada o el tipo de tienda, con fines exploratorios.
- **Generación de datos sintéticos de ventas**: combinado con el dataset de entrenamiento, puede emplearse para generar escenarios contrafactuales de ventas que alimenten simulaciones o pruebas de integración de sistemas de BI.
- **Pruebas de integración de servicios de inferencia**: su reducido tamaño y su formato joblib lo hacen idóneo para validar endpoints de inferencia tabular en arquitecturas de microservicios sin consumir recursos de GPU.
- **Benchmark interno de regresores tabulares**: sirve como línea base reproducible (R² 0,9193, RMSE 300,5) frente a la que comparar modelos alternativos como LightGBM, CatBoost o regresiones lineales regularizadas sobre el mismo dataset.
- **Educación en evaluación de modelos**: la model card documenta explícitamente una fuga metodológica (recorte de outliers antes del split), lo que lo convierte en un caso práctico para enseñar buenas prácticas de partición de datos.

## Benchmarks y rendimiento

Los únicos datos disponibles son los reportados por el autor en la model card, medidos sobre el conjunto de test (1.753 filas):

| Métrica | Entrenamiento | Test |
|---|---|---|
| R² | 0,9333 | 0,9193 |
| R² ajustado | 0,9332 | 0,9189 |
| RMSE | 272,1 | 300,5 |
| MAE | 114,7 | 128,9 |
| MAPE | 4,12 % | 4,50 % |

Como referencia, el autor indica que predecir siempre la media de ventas (3.464 unidades) arroja un RMSE de 1.066 y un MAE de 840, de modo que el modelo reduce el RMSE en aproximadamente un 72 % y el MAE en un 85 %. No se han publicado comparaciones con otros modelos (LightGBM, CatBoost, Random Forest) en la información disponible.

## Requisitos de hardware

- **VRAM**: no aplica; el modelo se ejecuta en CPU y no requiere GPU.
- **GPU recomendadas**: ninguna; cualquier CPU moderna es suficiente.
- **Consumer GPU**: no aplica; no hay versión GPU ni necesidad de ella.
- **Memoria RAM**: inferior a 1 GB para cargar el pipeline y realizar inferencia por lotes pequeños.
- **Almacenamiento**: 478 KB para el archivo joblib más el espacio del entorno de Python (scikit-learn 1.9.1, XGBoost 3.4.1, joblib 1.6.0).
- **Opciones de despliegue**: joblib + scikit-learn en un servicio Python (Flask, FastAPI, Streamlit), o exportación a otros formatos si se reentrena; no es compatible con vLLM, llama.cpp, Ollama ni TGI, que son motores para modelos de lenguaje.
- **Latencia y throughput**: no disponibles de forma explícita; por la naturaleza del modelo (400 árboles de profundidad 3) se espera latencia de milisegundos por fila en CPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SuperKart Sales Prediction Model | Regresión tabular (XGBoost) | no disponible (400 árboles) | no aplica | R² 0,9193 / RMSE 300,5 en test | MIT | Hugging Face |
| LightGBM (referencia genérica) | Regresión tabular (GBDT) | no disponible | no aplica | no disponible para este dataset | MIT | Repositorio oficial |
| CatBoost (referencia genérica) | Regresión tabular (GBDT) | no disponible | no aplica | no disponible para este dataset | Apache 2.0 | Repositorio oficial |
| Regresión lineal regularizada (referencia genérica) | Regresión tabular | no disponible | no aplica | no disponible para este dataset | depende de implementación | scikit-learn |

No se dispone de comparaciones publicadas con alternativas sobre el mismo dataset; la tabla anterior solo identifica familias de modelos comparables por tarea, no resultados medidos.

## Limitaciones y advertencias

- **Fuga metodológica**: el recorte de valores atípicos se calculó sobre el dataset completo antes de la partición train/test, lo que infla ligeramente las métricas reportadas.
- **Sin validación cruzada**: se empleó una única partición 80/20, por lo que las métricas tienen varianza asociada al split y no se reportan intervalos de confianza.
- **Datos de alcance muy limitado**: 8.763 registros de cuatro tiendas con distribuciones que el propio autor califica de «synthetic-looking»; las predicciones fuera del rango de entrenamiento son extrapolaciones no fiables.
- **Riesgo de alucinación**: no aplica en el sentido de LLM, pero el modelo puede producir predicciones numéricas plausibles para combinaciones de categorías no vistas, ya que las ignora silenciosamente en lugar de señalarlas.
- **Sesgos**: no se documenta análisis de sesgo por tienda, categoría o segmento; al entrenar sobre cuatro tiendas, el modelo puede sobrerrepresentar los patrones de esas ubicaciones.
- **Sin calibración para uso empresarial**: el autor advierte explícitamente que la banda ±RMSE del demo es una guía aproximada y no un intervalo de confianza.
- **Licencia MIT**: permite uso comercial y modificación con atribución, pero al tratarse de un modelo entrenado sobre datos de origen incierto, conviene verificar la procedencia del dataset antes de usarlo en producción.
- **Idioma y formato de entrada**: las categorías están fijadas en inglés y el pipeline espera exactamente nueve columnas con nombres concretos; cualquier cambio de esquema requiere reentrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ruksanakhanum/superkart-sales-prediction-model
- Dataset de entrenamiento: https://huggingface.co/datasets/ruksanakhanum/superkart-sales-prediction-data
- Demo en Streamlit: https://superkart-prediction.streamlit.app
- Repositorio del proyecto: https://github.com/ruksana-ux/superkart-sales-prediction
