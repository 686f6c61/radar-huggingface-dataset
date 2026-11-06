# AraceliAmherdt/03-keras-regresion

## Resumen

Este "modelo" es en realidad un ejemplo pedagógico de regresión lineal implementado con Keras 3, publicado por AraceliAmherdt en el contexto del Seminario de Actualización del IFTS N.º 18 (docente: Cynthia M. Villagra). No es un modelo de lenguaje ni una red neuronal profunda: es una `Sequential` de Keras con una capa `Normalization` y una capa `Dense(1)`, es decir, tres pesos y un bias, que predice el precio de una vivienda en miles de dólares estadounidenses a partir de su superficie en metros cuadrados y de dos variables binarias (balcón y ascensor).

Su relevancia es exclusivamente didáctica: sirve para mostrar el flujo completo de entrenamiento, evaluación y exportación en el formato nativo `.keras`, y para contrastarlo con implementaciones equivalentes en scikit-learn y PyTorch. El dataset es sintético (200 registros generados con semilla fija en `train.py`), de los cuales 160 se emplean para entrenamiento y 40 para evaluación.

No debe confundirse con un modelo fundacional: no procesa texto, no tiene ventana de contexto, no soporta tool calling ni razonamiento multi-paso. Cualquier uso en producción sobre datos reales de vivienda sería inapropiado, tal como advierte el propio autor en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal secuencial de Keras: `Normalization` + `Dense(1)` (regresión lineal) |
| Parametros totales | 4 (tres pesos y un bias) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no procesa secuencias) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; el modelo es de precisión completa) |
| Idiomas soportados | es (documentación y model card en español; el modelo en sí no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | `.keras` (formato nativo de Keras 3; incluye arquitectura, pesos, normalización y configuración de entrenamiento) |

## Arquitectura y entrenamiento

La arquitectura es una `Sequential` de Keras 3 compuesta por una capa `Normalization` seguida de una capa `Dense(1)`. La capa de normalización aprende la media y la desviación típica de los datos de entrenamiento mediante `adapt()` y queda embebida en el archivo `model.keras`, de modo que no es necesario normalizar manualmente en inferencia (a diferencia del ejemplo equivalente en PyTorch, donde la normalización se guarda por separado). La capa `Dense(1)` aporta tres pesos (uno por cada variable de entrada: `m2`, `balcon`, `ascensor`) más un término de bias.

El entrenamiento es supervisado, con pérdida de error cuadrático medio (`mse`), optimizador SGD con tasa de aprendizaje 0,1 y 200 épocas. Se usa Keras 3 con backend PyTorch, aunque el autor indica que también funciona con TensorFlow. Los datos son 200 registros sintéticos generados en `train.py` con semilla fija (los mismos de la Clase 10 del seminario), con `m2` en el rango de 35 a 120 y las variables `balcon` y `ascensor` binarias. No hay RLHF, DPO ni ninguna técnica de alineación, ni innovaciones de decodificación o atención: no aplica a un modelo de este tipo.

## Capacidades

- Regresión tabular sobre tres variables de entrada numéricas/binarias.
- Predicción de una variable continua (precio en miles de US$) a partir de `m2`, `balcon` y `ascensor`.
- Normalización integrada en el propio modelo (media y desviación aprendidas con `adapt()`).
- Exportación y carga en formato nativo `.keras` con Keras 3.
- Compatibilidad con backend PyTorch y TensorFlow.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Docencia de regresión con Keras: ejemplo mínimo para explicar el ciclo completo de entrenamiento, evaluación y guardado en `.keras` en un curso introductorio de machine learning.
- Comparación de frameworks: contrastar la misma tarea resuelta con scikit-learn, PyTorch y Keras, observando diferencias como la normalización embebida frente a la normalización externa.
- Demostración de `Normalization` + `adapt()`: ilustrar cómo una capa puede aprender estadísticos del conjunto de entrenamiento y persistirlos dentro del artefacto del modelo.
- Prueba de pipelines de serialización: verificar que un entorno con Keras 3 (backend PyTorch o TensorFlow) carga correctamente un `model.keras` y produce predicciones deterministas.
- Ejemplo de juguete para CI/CD de modelos: usar el modelo y su `predict.py` como caso de prueba en un pipeline que valide carga, forma de entrada y rango de salida.
- Material de ejercicios guiados: proponer al alumnado modificar hiperparámetros (tasa de aprendizaje, épocas, optimizador) y medir el efecto sobre MAE y R² en el conjunto de evaluación de 40 registros.

## Benchmarks y rendimiento

El autor reporta las siguientes métricas sobre el conjunto de evaluación (40 registros no vistos durante el entrenamiento):

| Metrica | Resultado |
|---|---|
| MAE | 3,10 miles de US$ |
| R² | 0,989 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni tendrían sentido para un modelo de regresión tabular de este tipo. Tampoco se ofrecen comparaciones numéricas con los ejemplos equivalentes de scikit-learn y PyTorch.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable (el modelo tiene 4 parámetros y un archivo `.keras` de tamaño mínimo).
- GPU recomendadas: no requiere GPU; funciona en CPU sin problema.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, integradas) e incluso en entornos sin GPU.
- Opciones de despliegue: Keras 3 con backend PyTorch o TensorFlow; carga mediante `keras.saving.load_model("model.keras")`. No aplica vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles de forma oficial; por la naturaleza del modelo (una multiplicación de tres pesos más un bias) la latencia es del orden de microsegundos a milisegundos, dominada por el overhead de carga del framework.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AraceliAmherdt/03-keras-regresion | 4 | no aplica | MAE 3,10; R² 0,989 (test sintético de 40 registros) | MIT | Hugging Face |
| Ejemplo equivalente en scikit-learn (misma tarea, Clase 10) | no disponible | no aplica | no disponible en la información proporcionada | no disponible | no disponible |
| Ejemplo equivalente en PyTorch (misma tarea, Clase 10) | no disponible | no aplica | no disponible en la información proporcionada | no disponible | no disponible |

La model card menciona explícitamente que este modelo "resuelve el mismo problema que los ejemplos de scikit-learn y PyTorch", pero no aporta métricas ni detalles técnicos de esas alternativas, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Fines exclusivamente educativos: los datos son sintéticos y no representan precios reales de vivienda.
- El dominio de entrada está acotado a superficies de 35 a 120 m²; fuera de ese rango la predicción no es fiable.
- El orden de las columnas es obligatorio: `m2`, `balcon`, `ascensor`. El modelo recibe un array, no una tabla con nombres de columna, por lo que un desajuste en el orden produce predicciones silenciosamente erróneas.
- Requiere Keras 3: el formato `.keras` no se abre con versiones antiguas de TensorFlow/Keras 2.
- No es un modelo de lenguaje: no procesa texto, no tiene capacidades de razonamiento, tool calling, agentes ni multilingüismo.
- Riesgo de alucinación: no aplica en el sentido habitual, pero sí existe riesgo de extrapolación incorrecta fuera del rango de entrenamiento.
- Sesgos conocidos: no documentados; al ser datos sintéticos generados con una semilla fija, no reflejan distribuciones reales del mercado inmobiliario.
- Licencia MIT: permite uso comercial, pero el uso comercial sobre datos reales no está justificado técnicamente por las limitaciones anteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AraceliAmherdt/03-keras-regresion
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
