# adarshcod30/flipkart-gridlock-2.0

## Resumen

El modelo `adarshcod30/flipkart-gridlock-2.0` es un regresor basado en XGBoost (gradient-boosted trees) desarrollado por adarshcod30 para la competición Flipkart Gridlock 2.0, un hackathon organizado por Flipkart junto con la Bengaluru Traffic Police (BTP) y MapMyIndia. El objetivo del reto era predecir la demanda de tráfico normalizada (entre 0 y 1) en ubicaciones geográficas concretas de Bengaluru, a partir de datos geoespaciales, temporales, meteorológicos y de infraestructura vial. Este checkpoint concreto es una versión retrenada y verificada que sustituye a un modelo anterior más grande que no podía alojarse en GitHub por su tamaño y que además tenía un desajuste entre las features de entrenamiento y las de inferencia.

El modelo resuelve un problema de regresión tabular con 109 características de entrada, incluyendo coordenadas decodificadas, índices temporales cíclicos, un perfil histórico de demanda por geohash (96 slots de 15 minutos del día anterior) y covariables de carretera, vehículo y clima. La salida es un valor continuo en el intervalo [0, 1] que representa la demanda de tráfico esperada. Su relevancia radica en que demuestra un pipeline completo de ingeniería de características y entrenamiento para predicción de tráfico urbano, con una precisión validada mediante validación cruzada (R² medio de 0,9577). No es un modelo de lenguaje ni de visión; es un modelo de aprendizaje automático clásico para datos tabulares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XGBoost (gradient-boosted trees) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular) |
| Tipos de cuantizacion | no aplica (modelo de arboles) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | JSON (formato nativo de XGBoost) |

## Arquitectura y entrenamiento

El modelo es un `XGBRegressor` de la librería XGBoost, configurado con `max_depth=6`, `n_estimators=600` y `learning_rate=0.05`, además de regularización L1/L2. Se trata de un ensemble de árboles de decisión entrenados mediante gradient boosting, una técnica ampliamente utilizada para problemas de regresión y clasificación sobre datos tabulares. La entrada son 109 características que combinan información geoespacial (latitud, longitud, geohash), temporal (índices cíclicos de hora y día), un perfil histórico de demanda de 96 slots (correspondientes a los 15 minutos del día 48) y covariables externas como condiciones de carretera, vehículos y meteorología.

El entrenamiento se realizó sobre 7.872 filas del conjunto `train.csv` de la competición, correspondientes al día 49. El día 48 se utiliza únicamente como perfil histórico para construir las features, evitando así que una fila use su propia etiqueta como entrada. No se menciona el uso de técnicas como RLHF o DPO, ya que no es un modelo generativo. La validación se hizo mediante 5-fold cross-validation, obteniendo un R² medio de 0,9577 con una desviación estándar de 0,0031. No se detalla la composición exacta del dataset más allá de los días mencionados, ni el número total de tokens (concepto no aplicable aquí).

## Capacidades

- Predicción de demanda de tráfico normalizada (0-1) para una ubicación geohash y un intervalo de 15 minutos.
- Regresión tabular sobre 109 características, incluyendo datos geoespaciales y temporales.
- Manejo de perfiles históricos de demanda por geohash (96 slots diarios).
- Integración de covariables externas (carretera, vehículo, clima) en el modelo.
- Inferencia rápida en CPU, adecuada para despliegue en entornos con recursos limitados.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales; es un modelo puramente de regresión.

## Casos de uso

- Predicción de congestión en tiempo real: el modelo puede estimar la demanda de tráfico en puntos concretos de Bengaluru para los próximos 15 minutos, permitiendo a las autoridades anticipar atascos y gestionar semáforos o rutas alternativas.
- Optimización de rutas de reparto: empresas de logística pueden integrar las predicciones en sus sistemas de planificación para evitar zonas con alta demanda y reducir tiempos de entrega.
- Gestión de flotas de vehículos: servicios de transporte como taxis o VTC pueden usar las predicciones para reposicionar vehículos en áreas donde se espera mayor demanda.
- Análisis urbano y planificación: los datos de demanda predichos pueden alimentar estudios de movilidad para decidir inversiones en infraestructura vial o transporte público.
- Alertas tempranas para eventos especiales: si se conocen eventos que alteran el tráfico, el modelo puede simular escenarios y emitir alertas a conductores o autoridades.
- Evaluación de políticas de tráfico: comparar la demanda predicha antes y después de cambios en la regulación vial (peajes, restricciones) para medir su impacto.

Nota: el modelo está entrenado con datos de solo dos días de una competición específica, por lo que su uso en producción requeriría reentrenamiento con datos históricos más amplios y adaptación a otras ciudades o periodos.

## Benchmarks y rendimiento

La model card reporta los resultados de validación cruzada de 5 pliegues sobre las filas de entrenamiento:

| Fold | R² |
|---|---|
| 1 | 0,9589 |
| 2 | 0,9608 |
| 3 | 0,9578 |
| 4 | 0,9518 |
| 5 | 0,9593 |
| **Media ± desviación** | **0,9577 ± 0,0031** |

No se han publicado comparaciones con otros modelos en la información disponible. El rendimiento se limita a esta métrica de validación interna; no hay datos de test externo ni de otros benchmarks estándar como MMLU o HumanEval, que no son aplicables a un modelo de regresión tabular.

## Requisitos de hardware

- Al ser un modelo XGBoost con 600 árboles de profundidad 6, el tamaño del archivo es pequeño (inferior a 100 MB, según la model card) y la inferencia es muy ligera.
- Funciona perfectamente en CPU; no requiere GPU para inferencia ni entrenamiento.
- La memoria RAM necesaria es mínima, del orden de unos pocos cientos de MB, por lo que puede ejecutarse en cualquier máquina moderna, incluyendo instancias cloud de bajo coste o incluso dispositivos edge.
- Opciones de despliegue: se puede servir mediante un script Python con `XGBRegressor`, o empaquetar como una API REST con frameworks como Flask o FastAPI. También es compatible con herramientas de serialización como ONNX si se desea optimizar la inferencia.
- La latencia por predicción es del orden de milisegundos en CPU, y el throughput depende del hardware, pero es suficiente para aplicaciones en tiempo real con cientos de peticiones por segundo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo es específico de la competición Flipkart Gridlock 2.0 y no se han publicado comparaciones con otras arquitecturas (por ejemplo, LightGBM, CatBoost o redes neuronales) en los materiales disponibles. Por tanto, no se puede establecer una comparativa objetiva en este momento.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos de dos días (días 48 y 49) de una única competición; no es un modelo general de predicción de tráfico y su rendimiento fuera de ese contexto no está garantizado.
- La feature de perfil histórico de 96 columnas requiere datos de demanda del día 48 para el mismo conjunto de geohashes; no generaliza a ciudades o mallas geohash no vistas sin reconstruir ese perfil.
- El modelo depende de un pipeline de features muy específico (109 características en un orden concreto); usarlo fuera de ese pipeline produce resultados sin sentido.
- No se han documentado sesgos específicos, pero al estar entrenado con datos de una sola ciudad (Bengaluru) y un periodo corto, puede reflejar patrones locales que no se transfieren a otros entornos.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre la precisión o idoneidad para producción.
- No hay información sobre la calidad de los datos originales (posibles errores, valores atípicos) ni sobre el proceso de limpieza, lo que podría afectar a la robustez del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adarshcod30/flipkart-gridlock-2.0
- Repositorio GitHub del autor: https://github.com/adarshcod30/Flipkart-Gridlock-2.0
- Repositorio alternativo con documentación: https://github.com/Princekumartech/Flipkart-Gridlock-2.0
- Página de la competición: https://gridlock2point0.hackerearth.com/
- Documentación adicional en GitHub: https://github.com/TECHIE-TITAN/Flipkart-Gridlock-2.0/blob/main/Documentation
