# ramitha2002/delivery-time-regressor

## Resumen

El modelo `ramitha2002/delivery-time-regressor` es un regresor tabular desarrollado por Ramitha Iddamalgoda, publicado en Hugging Face bajo la librería scikit-learn. Su objetivo es predecir la duración total de una entrega en minutos a partir de las características almacenadas en un archivo `metadata.json`. Se trata de un modelo de regresión supervisada, probablemente entrenado con datos de pedidos de comida o logística de reparto, aunque no se especifican detalles del conjunto de entrenamiento.

La relevancia de este modelo radica en su aplicación práctica para estimar tiempos de entrega en servicios de mensajería y plataformas de comida a domicilio. Según la model card, presenta un error absoluto medio (MAE) de 3,23 minutos y un coeficiente de determinación (R²) de 0,8074 sobre 9081 filas de prueba, lo que indica una precisión razonable para este tipo de tareas. Sin embargo, la información pública es escasa: no se detalla la arquitectura interna, los hiperparámetros ni el proceso de entrenamiento, y la licencia y los idiomas soportados figuran como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (regresor tabular con scikit-learn) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente joblib o pickle, segun la libreria scikit-learn) |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna del modelo. Dado que la librería declarada es scikit-learn, se trata de un modelo clásico de aprendizaje automático (posiblemente regresión lineal, árboles de decisión, bosques aleatorios o gradient boosting), no de una red neuronal profunda. Tampoco se conocen los datos de entrenamiento (número de muestras, composición del dataset, características exactas) ni si se aplicaron técnicas como validación cruzada o ajuste de hiperparámetros. La model card solo proporciona métricas de evaluación sobre un conjunto de prueba de 9081 filas, lo que sugiere que el modelo fue entrenado con un conjunto de datos de tamaño considerable, pero sin más detalles.

## Capacidades

- Predicción de tiempo de entrega en minutos a partir de características tabulares.
- Manejo de variables numéricas y categóricas si fueron incluidas en el preprocesamiento (no se especifica).
- Inferencia rápida y ligera, adecuada para entornos con recursos limitados.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multimodales (visión, audio, etc.).
- No se ha indicado soporte multilingüe; probablemente funciona con datos numéricos independientemente del idioma.

## Casos de uso

- Estimación de tiempos de entrega en plataformas de comida a domicilio: el modelo puede integrarse en un backend para predecir el tiempo de llegada (ETA) de cada pedido, mejorando la experiencia del usuario y la planificación de repartidores.
- Optimización de rutas logísticas: las predicciones de duración pueden alimentar algoritmos de enrutamiento para minimizar tiempos de entrega y costos operativos.
- Análisis de SLA (acuerdos de nivel de servicio): las empresas pueden usar las predicciones para verificar si se cumplen los tiempos prometidos y ajustar sus políticas.
- Alertas de retraso: comparar la predicción con el tiempo real transcurrido permite enviar notificaciones proactivas a los clientes si se prevé un retraso.
- Planificación de personal: en centros de distribución, las predicciones de tiempo de entrega ayudan a asignar repartidores y recursos de manera eficiente.
- Simulación de escenarios: el modelo puede utilizarse para evaluar el impacto de cambios en variables como distancia, tráfico o tipo de vehículo sobre el tiempo de entrega.

## Benchmarks y rendimiento

La model card proporciona las siguientes métricas de evaluación sobre un conjunto de prueba de 9081 filas:

| Metrica | Valor |
|---|---|
| MAE (error absoluto medio) | 3,23 minutos |
| RMSE (raiz del error cuadratico medio) | 4,037 minutos |
| R² (coeficiente de determinacion) | 0,8074 |

No se han publicado comparaciones con otros modelos de regresión para la misma tarea. Los valores indican que el modelo captura aproximadamente el 80 % de la varianza de los tiempos de entrega, con un error medio de poco más de 3 minutos, lo que puede ser aceptable para aplicaciones prácticas, aunque depende del contexto.

## Requisitos de hardware

- Al ser un modelo de scikit-learn, la inferencia se ejecuta en CPU sin necesidad de GPU.
- Consumo de memoria mínimo: el tamaño del repositorio es de 0.0 GB, lo que sugiere que el archivo del modelo es muy pequeño (probablemente unos pocos kilobytes o megabytes).
- Es adecuado para despliegue en servidores de bajo coste, funciones serverless o incluso en dispositivos embebidos.
- No se requieren librerías específicas de inferencia como vLLM o llama.cpp; basta con cargar el modelo mediante `joblib` o `pickle` en un entorno Python.
- La latencia esperada es del orden de milisegundos, incluso en hardware modesto, al tratarse de una regresión tabular simple.
- No se han publicado mediciones de throughput, pero es claramente adecuado para aplicaciones en tiempo real.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (regresión de tiempo de entrega con scikit-learn). La búsqueda web revela proyectos similares en Kaggle y GitHub, como el notebook "Regression // Accurate Delivery Time" o el repositorio "Food_Delivery_Time-Using-ML", pero no se han encontrado modelos publicados en Hugging Face con métricas comparables. Por tanto, no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos o limitaciones del modelo; al ser un regresor tabular, no presenta riesgos de alucinación como los modelos generativos.
- La model card advierte explícitamente que la predicción no constituye una garantía de entrega y que solo incluye tiempos de espera/preparación/almacenamiento si estos están representados en los datos de entrenamiento.
- La licencia no está especificada, por lo que no se puede garantizar el uso comercial sin consultar al autor.
- Los idiomas soportados no se indican; aunque la regresión tabular no depende del idioma, los metadatos podrían estar en inglés u otros idiomas, lo que podría requerir preprocesamiento adicional.
- No se conocen los detalles del preprocesamiento ni las características exactas, lo que dificulta la reproducibilidad y la transferencia a otros conjuntos de datos.
- El modelo fue creado en agosto de 2026 y no ha recibido actualizaciones posteriores, lo que podría implicar obsolescencia si los patrones de entrega cambian con el tiempo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ramitha2002/delivery-time-regressor
- Perfil del autor en Hugging Face: https://huggingface.co/ramitha2002
- Lista de modelos del autor: https://huggingface.co/ramitha2002/models
- Notebook de Kaggle relacionado (no oficial): https://www.kaggle.com/code/trc204/regression-accurate-delivery-time
- Repositorio de GitHub relacionado (no oficial): https://github.com/Raj-Rathod-Ai/Food_Delivery_Time-Using-ML
