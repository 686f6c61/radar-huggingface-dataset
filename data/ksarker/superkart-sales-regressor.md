# ksarker/superkart-sales-regressor

## Resumen

El modelo `ksarker/superkart-sales-regressor` es un modelo de regresión tabular construido con scikit-learn, que implementa un pipeline de preprocesamiento de características y un estimador Random Forest. Está diseñado para predecir las ventas totales de un producto en una tienda concreta (`Product_Store_Sales_Total`), a partir de atributos del producto y de la tienda. Lo desarrolla el usuario `ksarker` y se publica en HuggingFace con la etiqueta `tabular-regression`.

El modelo resuelve un problema de predicción de ventas a nivel de producto-tienda, un caso de uso habitual en el sector retail para optimizar inventarios, promociones y asignación de espacio. Su relevancia radica en que ofrece una solución sencilla y ligera basada en árboles de decisión, con un rendimiento medido en el conjunto de test (R² = 0.9322), sin necesidad de infraestructura de GPU ni de modelos generativos. La arquitectura es un pipeline de scikit-learn con preprocesamiento y un Random Forest de 200 árboles. El tamaño del modelo no está disponible en la información proporcionada, y la longitud de contexto no aplica al tratarse de un modelo tabular.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de scikit-learn con preprocesamiento y Random Forest |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (modelo tabular, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | joblib (scikit-learn) |

El repositorio en HuggingFace muestra un tamaño de 0.0 GB, lo que sugiere que los pesos del modelo podrían no estar incluidos en el repo. Verificar antes de intentar descargar o cargar el modelo.

## Arquitectura y entrenamiento

El modelo se implementa como un `Pipeline` de scikit-learn que combina el preprocesamiento de las características numéricas y categóricas con el estimador de regresión seleccionado, un Random Forest. Los hiperparámetros del Random Forest son: `n_estimators=200`, `max_depth=None`, `min_samples_leaf=2` y `min_samples_split=5`.

Las características numéricas utilizadas son `Product_Weight`, `Product_Allocated_Area`, `Product_MRP` y `Store_Establishment_Year`. Las características categóricas son `Product_Sugar_Content`, `Product_Type`, `Store_Id`, `Store_Size`, `Store_Location_City_Type` y `Store_Type`. El pipeline incluye el preprocesamiento necesario para estas variables, aunque la información proporcionada no detalla el método exacto (por ejemplo, codificación one-hot o escalado). El entrenamiento se evalúa mediante validación cruzada, obteniendo un RMSE de 285.89. No se especifica el tamaño del dataset ni el proceso de entrenamiento más allá de las métricas reportadas. El propio autor indica que el dataset no contiene variables de fecha u hora, por lo que el modelo aborda la predicción de ventas como un problema de regresión y no como una serie temporal.

## Capacidades

- Predicción de ventas por producto y tienda mediante regresión, con el objetivo de estimar `Product_Store_Sales_Total`.
- Manejo de características numéricas (peso, área asignada, precio MRP, año de establecimiento de la tienda) y categóricas (contenido de azúcar, tipo de producto, identificador de tienda, tamaño de tienda, tipo de ciudad y tipo de tienda).
- No soporta generación de texto, tool calling, visión, audio ni razonamiento multi-paso, al tratarse de un modelo de regresión tabular.
- No es un modelo de lenguaje, por lo que no presenta capacidades multilingües ni de agentes.

## Casos de uso

- Gestión de inventario en tiendas de alimentación: el modelo puede predecir las ventas esperadas por producto y tienda, lo que permite ajustar los niveles de reposición y reducir roturas de stock o excesos de inventario. Es adecuado porque la predicción se basa en atributos fácilmente disponibles del producto y de la tienda.
- Planificación de promociones: al estimar el impacto de las características del producto (como el MRP o el tipo) y de la tienda, el modelo ayuda a priorizar promociones en los lineales con mayor potencial de venta. La naturaleza tabular del modelo facilita integrar estos datos en herramientas de planificación.
- Asignación de espacio en lineales: con la predicción de ventas por producto, el responsable de tienda puede decidir cuánto espacio dedicar a cada producto en función de su demanda estimada. La inclusión de `Product_Allocated_Area` como característica permite analizar la relación entre el espacio asignado y las ventas.
- Análisis de rendimiento de tiendas: comparar las ventas reales con las predicciones del modelo permite detectar tiendas o productos que se desvían de lo esperado, lo que puede indicar problemas operativos u oportunidades de mejora. El R² de 0.9322 en test ofrece una base para este tipo de análisis.
- Segmentación de productos: agrupando productos según sus ventas estimadas y sus características, se pueden identificar categorías con alto potencial. El modelo permite generar predicciones para todos los pares producto-tienda, lo que facilita la segmentación a escala.
- Integración en pipelines de MLOps: al ser un modelo de scikit-learn serializado con joblib, puede desplegarse como microservicio con FastAPI o Flask, o exportarse a ONNX para entornos de producción. Su bajo coste computacional lo hace adecuado para predicciones en tiempo real o en procesamiento por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. El autor proporciona las siguientes métricas de rendimiento sobre el conjunto de test:

| Metrica | Valor |
|---|---|
| CV RMSE | 285.89 |
| MAE (test) | 105.10 |
| RMSE (test) | 278.11 |
| R2 (test) | 0.9322 |

Estas métricas indican un ajuste razonable del modelo, pero no permiten compararlo directamente con alternativas, ya que no se dispone de resultados de otros modelos sobre el mismo dataset.

## Requisitos de hardware

- VRAM: no aplica, el modelo se ejecuta en CPU.
- GPU: no necesaria; el modelo es ligero y puede inferirse en CPU con un consumo de memoria mínimo.
- RAM: baja, al tratarse de un Random Forest con 200 árboles y un número reducido de características.
- Opciones de despliegue: joblib, pickle, ONNX, o como servicio web con FastAPI, Flask o plataformas como MLflow.
- Latencia y throughput: no disponibles en la información proporcionada, aunque el tamaño del modelo sugiere una inferencia del orden de milisegundos en CPU.

## Comparativa con modelos similares

No disponible. Se han encontrado otros modelos con nombres similares en HuggingFace, como `jeremygracey-ai/superkart-sales-predictor` y el Space `Maa466/superkart-sales-predictor`, pero no se dispone de métricas ni especificaciones comparables en la información proporcionada. Por tanto, no es posible establecer una comparación rigurosa.

## Limitaciones y advertencias

- El modelo no incluye variables temporales: el autor indica explícitamente que el dataset no contiene fecha u hora, por lo que el modelo no captura estacionalidad, tendencias ni efectos de calendario. Esto limita su uso en contextos donde la demanda varía significativamente en el tiempo.
- La licencia no está disponible, por lo que el uso comercial del modelo o de sus pesos es incierto. Conviene contactar con el autor antes de utilizarlo en producción.
- El repositorio de HuggingFace muestra un tamaño de 0.0 GB, lo que puede indicar que los pesos del modelo no están subidos. Se debe verificar la integridad del repo antes de intentar cargar el modelo.
- No se documentan sesgos en los datos de entrenamiento. Al ser un modelo entrenado con datos históricos de ventas, podría heredar sesgos presentes en esos datos (por ejemplo, diferencias regionales o de tipo de tienda).
- Al no ser un modelo generativo, no presenta riesgo de alucinación en el sentido de los modelos de lenguaje, pero sus predicciones tienen un margen de error, como reflejan el MAE y el RMSE reportados.

## Enlaces

- HuggingFace: https://huggingface.co/ksarker/superkart-sales-regressor
- Modelo similar (referencia): https://huggingface.co/jeremygracey-ai/superkart-sales-predictor
- Space similar (referencia): https://huggingface.co/spaces/Maa466/superkart-sales-predictor
