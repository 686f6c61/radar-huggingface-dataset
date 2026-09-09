# Mansimar-14/ann-x-squared-approximation

## Resumen

El modelo `ann-x-squared-approximation` es una red neuronal feedforward de una sola capa oculta desarrollada por Mansimar-14 para aproximar la función matemática y = x² en el intervalo [-1, 1]. Se trata de un experimento de investigación educativa, cuyo objetivo es demostrar cómo una arquitectura mínima puede ajustar una curva simple y, al mismo tiempo, servir como banco de pruebas para comparar configuraciones de hiperparámetros. El autor documenta una búsqueda en rejilla (grid search) que evalúa 1350 combinaciones de dataset, ancho de capa oculta, función de pérdida y activación.

La arquitectura es extremadamente compacta: una entrada escalar, 6 neuronas ocultas con activación sigmoide y una salida escalar, lo que supone 19 parámetros en total. No es un modelo de lenguaje ni un sistema multimodal: carece de contexto, y su formato de pesos incluye un checkpoint de PyTorch y una versión ONNX. Su relevancia radica en su valor pedagógico y en la disponibilidad de un pipeline de entrenamiento completo, así como en la transparencia de los resultados de validación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal feedforward de una sola capa oculta: Linear(1 → 6) → Sigmoid → Linear(6 → 1) |
| Parametros totales | 19 (estimados según la arquitectura declarada) |
| Longitud de contexto | No aplica (modelo de regresión) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (pytorch_model.bin), ONNX (model.onnx) |

## Arquitectura y entrenamiento

El modelo es un perceptrón multicapa de una sola capa oculta. La capa de entrada recibe un valor escalar, la capa oculta transforma la entrada con una combinación lineal de 6 neuronas y una activación sigmoide, y la capa de salida proyecta esos 6 valores a un único escalar. El entrenamiento se realizó con un dataset de 600 puntos muestreados aleatoriamente en el intervalo [-1, 1], con una división 80/20 entre entrenamiento y validación. Se utilizó el optimizador Adam con una tasa de aprendizaje de 0.01 y descenso de gradiente por lotes completos (full-batch), con la pérdida de error absoluto medio (MAE).

La configuración presentada fue seleccionada como la mejor de una búsqueda en rejilla de 1350 experimentos. Las variaciones incluyeron 10 variantes de dataset, anchos de capa oculta entre 2 y 10, funciones de pérdida (MSE, MAE, Huber) y funciones de activación (ReLU, Tanh, Sigmoid, Leaky ReLU, ELU). La decisión se tomó a partir del rendimiento en el conjunto de validación.

## Capacidades

- Aproximación de la función y = x² en el intervalo [-1, 1] con error cuadrático medio muy bajo (MSE 0.000006).
- Regresión univariante: entrada y salida son escalares, adecuado para problemas de ajuste de curvas simples.
- Inferencia en PyTorch y en tiempo de ejecución de ONNX.
- Visualización del grafo de la red mediante Netron, útil para inspeccionar capas, pesos y formas.
- Reproducción del resultado: la arquitectura y el entrenamiento están documentados en el model card.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas avanzadas, tool calling, visión o audio.

## Casos de uso

- Enseñanza de redes neuronales: sirve como ejemplo mínimo para explicar el paso hacia adelante, la retropropagación y la influencia de la función de activación en un modelo con solo 19 parámetros.
- Experimentos de grid search: el pipeline de entrenamiento permite reproducir los 1350 experimentos y analizar cómo cambia el rendimiento con distintos hiperparámetros.
- Visualización en Netron: el archivo ONNX puede abrirse directamente en Netron para explorar la topología del modelo, lo que resulta útil en cursos de aprendizaje automático.
- Verificación de entornos de desarrollo: al cargar `pytorch_model.bin` en una CPU o un entorno de CI, permite comprobar que las dependencias de PyTorch y torchvision están correctamente instaladas.
- Benchmark de regresión simple: sirve como caso base de referencia para comparar algoritmos de aproximación de funciones en una dimensión, aunque sea limitado a un rango fijo.
- Introducción a la ingeniería de características: el bajo número de neuronas ocultas permite discutir las limitaciones de las funciones de base fija y la necesidad de escalar o transformar entradas.

## Benchmarks y rendimiento

Los siguientes resultados de validación aparecen en el model card del autor. No se han publicado comparativas con otros modelos en la información disponible.

| Metrica | Valor |
|---|---|
| MSE | 0.000006 |
| RMSE | 0.002442 |
| MAE | 0.001800 |
| MAPE | 49.7565% |
| R² | 0.9999 |

El R² de 0.9999 indica un ajuste excelente en términos de varianza explicada. El MAPE elevado (49.7565%) se debe a que la función objetivo toma valores muy próximos a cero cerca de x = 0, lo que infla el error relativo. No se han publicado benchmarks comparativos con otros modelos similares.

## Requisitos de hardware

- VRAM estimada: insignificante; el modelo tiene 19 parámetros y cabe en cualquier dispositivo.
- GPU recomendada: ninguna. La inferencia se puede ejecutar en CPU sin problemas.
- Compatibilidad con GPU de consumo: no requiere GPU; cualquier CPU moderna es suficiente.
- Opciones de despliegue: PyTorch, ONNX Runtime, Netron para visualización.
- Latencia y throughput: no medidos, pero al tratarse de una red de 19 parámetros, la latencia es submillisegundo en hardware actual.

## Comparativa con modelos similares

No disponible. En la información proporcionada no existen modelos comparables de la misma categoría, ni datos de rendimiento de otras arquitecturas sobre la misma tarea. Al ser un modelo de juguete educativo, no compite con modelos de lenguaje o de regresión más complejos.

## Limitaciones y advertencias

- Solo está entrenado para aproximar y = x² en el intervalo [-1, 1]; fuera de ese rango el comportamiento no ha sido validado.
- El MAPE es muy alto (49.7565%) debido a la división por valores cercanos a cero, por lo que no es adecuado para tareas donde el error relativo sea relevante.
- No tiene capacidad de razonamiento, generación de texto ni ningún atributo de modelos de lenguaje; no debe usarse en aplicaciones de NLP.
- Es un modelo de investigación y docencia: la licencia MIT permite uso comercial, pero no incluye garantías de rendimiento ni soporte.
- No se aportan evidencias de sesgos, riesgos de alucinación u otros comportamientos típicos de modelos generativos, ya que no aplican a una red de regresión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mansimar-14/ann-x-squared-approximation
- Visualizador Netron: https://netron.app
- Repositorio GitHub mencionado en el model card: no disponible (la URL no aparece en la información proporcionada)
