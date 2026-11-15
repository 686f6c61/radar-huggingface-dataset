# AIML-VU/s2-for-algal-bloom

## Resumen

`s2-for-algal-bloom` es una red neuronal entrenada para estimar la concentración de clorofila-a (µg/L) en lagos y estanques a partir de 14 características derivadas de la reflectancia de superficie del sensor MSI de Sentinel-2 (producto L2A). Lo desarrolla el grupo AIML-VU (Vilnius University) y se publicó junto al artículo de Grendaitė y Petkevičius en IEEE Access (2024), centrado en la identificación de floraciones de algas en lagos de los países bálticos.

El modelo no es un LLM ni un modelo generativo: es un regresor tabular de propósito específico con arquitectura `residual_mha_dnn` (bloques residuales con atención multi-cabeza, anchura 128) implementado en Keras/TensorFlow. Resuelve un problema de teledetección aplicada a calidad del agua: convertir reflectancias espectrales en una variable biogeoquímica continua sin necesidad de muestreo in situ para cada imagen.

Su relevancia es acotada pero concreta: ofrece un pipeline reproducible (código, datos de test y tests unitarios) para monitorizar eutrofización en masas de agua continentales, un caso de uso habitual en agencias ambientales. El repositorio es pequeño (0,0 GB reportados) y no tiene descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal feed-forward con bloques residuales y atención multi-cabeza (`residual_mha_dnn`, anchura 128) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular de 14 características) |
| Tipos de cuantizacion | no disponible (se distribuye SavedModel de Keras; existen exportaciones ONNX según tags) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | Keras SavedModel (Keras 2); el repo incluye también ONNX según los tags |

## Arquitectura y entrenamiento

La arquitectura es una DNN con bloques residuales y atención multi-cabeza de anchura 128, orientada a regresión tabular sobre 14 variables de entrada. Siete de ellas son reflectancias de banda de Sentinel-2 L2A (`B2, B3, B4, B5, B6, B7, B8A`, escaladas a 0–1 como DN/10000) y las otras siete se derivan analíticamente en `predict.py`: cuatro ratios entre bandas (`B5/B4`, `B3/B2`, `B3/B4`, `B3/B5`), un índice de línea base de clorofila (`B4_B5_B6 = B5 - (B4 + B6)/2`), un promedio ponderado por longitud de onda (`avw`) y el índice `diff_alg = 2054 * (B5 - 1.05*B4) + 17`. La salida es un escalar de clorofila-a en µg/L con recorte a cero de valores negativos.

El entrenamiento usó Adam con learning rate 0,01, pérdida Huber con δ = 10 y parada temprana sobre el split de test. La partición train/test es 70/30 por lago (semilla 123), lo que evita fuga de información entre lagos pero deja el conjunto de test con 437 muestras de lagos no vistos. El conjunto de test se distribuye en `data/test_reg_data.csv` y la pérdida Huber registrada en entrenamiento (48,48 ± 0,5) se verifica en los tests unitarios. No se documentan el número de tokens (no aplica), el volumen total de muestras de entrenamiento ni la composición detallada del dataset más allá de la región geográfica.

## Capacidades

- Regresión de clorofila-a (µg/L) a partir de reflectancias Sentinel-2 L2A en lagos y estanques.
- Cálculo automático de siete características derivadas a partir de las siete bandas de entrada.
- Inferencia por lotes con invariancia a tamaño de lote y orden de filas (verificado en tests).
- Validación de entradas: rechazo de filas con `NaN` o `inf` (por ejemplo, reflectancia cero en una banda).
- Exportación a ONNX además del SavedModel de Keras.
- CLI (`predict.py`) y función Python `predict()` para integración en pipelines.
- No soporta tool calling, agentes, razonamiento multi-paso, visión genérica ni procesamiento de lenguaje.

## Casos de uso

- Monitorización de eutrofización en lagos bálticos: procesar escenas Sentinel-2 L2A de la región y generar mapas de clorofila-a por píxel o por masa de agua, sustituyendo muestreos manuales puntuales por estimaciones sistemáticas.
- Alertas tempranas de floraciones de algas: al ser un modelo ligero y determinista, puede ejecutarse por lotes sobre series temporales de imágenes para detectar picos de clorofila y activar avisos a gestores de cuencas.
- Investigación limnológica: usar el modelo como línea base reproducible (código, datos de test y tests incluidos) para comparar con otros índices espectrales o con modelos entrenados en otras regiones.
- Relleno de huecos en series de calidad del agua: estimar clorofila-a en fechas sin muestreo in situ a partir de imágenes disponibles, siempre que la corrección atmosférica siga el flujo del notebook GEE del repositorio.
- Validación cruzada de productos de corrección atmosférica: comparar predicciones sobre distintas versiones de reflectancia L2A para evaluar la sensibilidad del modelo al preprocesado.
- Docencia y prototipado en teledetección: el repositorio incluye tests unitarios y un conjunto de test pequeño (437 filas) que permite reproducir el flujo completo en pocos minutos en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato cuantitativo documentado es la pérdida Huber (δ = 10) sobre el conjunto de test: 48,48 ± 0,5, verificada por los tests unitarios del repositorio. No se reportan RMSE, MAE, R² ni comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible; por la anchura 128 y la entrada de 14 características, la huella es mínima y cabe holgadamente en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte TensorFlow sirve, aunque no es necesaria.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU; la inferencia es de coste despreciable frente al preprocesado de imágenes.
- Opciones de despliegue: TensorFlow ≤ 2.15 con `keras-multi-head` (requisito explícito para el SavedModel en formato Keras 2), ONNX Runtime para la exportación ONNX, o el CLI `predict.py`.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de regresión de clorofila-a con los que comparar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Entrenado exclusivamente con lagos y estanques de los países bálticos; la transferencia a otras regiones, tipos de agua o productos de corrección atmosférica no está probada.
- El split train/test por lago con solo 437 muestras de test hace que los resultados sean optimistas según el propio autor.
- Requiere reflectancia de superficie Sentinel-2 L2A procesada como en el notebook GEE del repositorio; otras fuentes o niveles de procesado pueden degradar las predicciones.
- Rechaza filas con `NaN` o `inf`; es necesario limpiar previamente los datos (por ejemplo, reflectancia cero en alguna banda).
- Dependencia de versiones antiguas: el SavedModel es Keras 2 y requiere TensorFlow ≤ 2.15 con `keras-multi-head`, lo que complica su integración en stacks modernos.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de predicciones fuera de rango en condiciones espectrales no representadas en el entrenamiento.
- No se documentan sesgos geográficos o de composición del dataset más allá de la región de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AIML-VU/s2-for-algal-bloom
- Código y datos: https://github.com/dfrgttn/s2-for-algal-bloom
- Artículo: Grendaitė, D., Petkevičius, L. "Identification of algal blooms in lakes in the Baltic states using Sentinel-2 data and artificial neural networks." IEEE Access 12 (2024): 27973–27988.
