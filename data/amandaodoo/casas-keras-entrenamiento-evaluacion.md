# amandaodoo/casas-keras-entrenamiento-evaluacion

## Resumen

`casas-keras-entrenamiento-evaluacion` es un repositorio de Hugging Face publicado por el usuario `amandaodoo` que contiene un modelo de regresion lineal implementado con Keras. No se trata de un modelo de lenguaje ni de una red neuronal profunda: es un ejemplo educativo que entrena una regresion lineal sobre un dataset tabular sintetico de viviendas (`casas.csv`) con cuatro variables (`m2`, `balcon`, `ascensor` y `precio` en miles de dolares estadounidenses). El modelo se guarda en formato nativo de Keras (`model.keras`) y se evalua con un conjunto de prueba separado.

El objetivo del repositorio es didactico: mostrar el flujo completo de entrenamiento, evaluacion y publicacion de un modelo Keras en el Hub, ademas de ilustrar la exportacion a otros formatos como `.weights.h5`, SavedModel y TFLite. El dataset consta de 200 muestras, de las cuales 160 se usan para entrenamiento y 40 para evaluacion.

Su relevancia es limitada fuera del ambito formativo: con solo 200 muestras sinteticas y una regresion lineal, no compite con modelos fundacionales ni con sistemas de prediccion de precios en produccion. Resulta util como referencia para quien quiera aprender el ciclo de vida de un modelo Keras y su publicacion en el Hub, no como componente de un sistema real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion lineal (capa densa sin activacion no lineal) implementada en Keras |
| Parametros totales | no disponible (una regresion lineal con 3 variables de entrada y sesgo tendria 4 parametros entrenables, pero no se confirma en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (se menciona exportacion a TFLite, que admite cuantizacion, pero no se detalla) |
| Idiomas soportados | es (etiqueta declarada; el modelo no procesa lenguaje natural, la etiqueta es del dataset y la documentacion) |
| Licencia | MIT |
| Formato de pesos | `model.keras` (nativo de Keras), `.weights.h5`, SavedModel y TFLite |

## Arquitectura y entrenamiento

La arquitectura es una regresion lineal, el modelo mas simple posible dentro del ecosistema Keras: una o varias capas densas configuradas para producir una salida continua (el precio). No hay mecanismos de atencion, capas convolucionales ni funciones de activacion no lineales en la salida, segun la descripcion del repositorio. La entrada son tres variables tabulares (`m2`, `balcon`, `ascensor`) y la salida es un valor escalar de precio en miles de dolares.

El entrenamiento se realiza sobre `casas.csv`, un dataset sintetico de 200 viviendas generado para la "Clase 10" de un curso. Se reservan 160 muestras para entrenamiento y 40 para evaluacion. No se documentan hiperparametros (tasa de aprendizaje, numero de epochs, optimizador, funcion de perdida), ni si hay normalizacion de variables, ni tecnicas de regularizacion. Tampoco se menciona ningun proceso de RLHF, DPO ni ajuste fino adicional, algo por otra parte esperable en un modelo de este tipo.

## Capacidades

- Prediccion de precios de vivienda a partir de tres variables tabulares: metros cuadrados, presencia de balcon y presencia de ascensor.
- Regresion supervisada sobre datos estructurados, sin capacidad de generar texto ni de procesar lenguaje natural.
- Exportacion a multiples formatos: `model.keras`, `.weights.h5`, SavedModel y TFLite, lo que permite desplegarlo en entornos moviles o embebidos mediante TensorFlow Lite.
- Carga desde el Hub mediante un script de prediccion (`predict_hub.py`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues reales.
- No dispone de modo de pensamiento, vision, audio ni ninguna modalidad distinta de la tabular.

## Casos de uso

- Docencia y aprendizaje de Keras: el repositorio sirve como plantilla para que estudiantes reproduzcan el ciclo completo de entrenamiento, evaluacion y guardado de un modelo con `python train.py`, y luego lo publiquen en el Hub.
- Ejemplo de publicacion en Hugging Face: el script `publicar_en_hub.py` demuestra como subir una carpeta local como repositorio de modelo y como consumirlo desde otra maquina con `predict_hub.py`.
- Referencia de exportacion multi-formato: las carpetas de `keras-exportar-weights-h5` y `keras-exportar-savedmodel-tflite` ilustran como convertir un modelo Keras a `.weights.h5`, SavedModel y TFLite, util para quien necesite desplegar en movil.
- Prueba de concepto de regresion tabular: sirve para validar un pipeline de datos con variables categoricas codificadas (balcon, ascensor) y una variable continua (precio) antes de escalar a un modelo mas complejo.
- Material de comparacion didactica: permite contrastar el rendimiento de una regresion lineal con alternativas como arboles de decision o gradient boosting sobre el mismo dataset sintetico.
- Validacion de infraestructura de inferencia: al ser un modelo minimo, se puede usar para probar el flujo de descarga desde el Hub y ejecucion local de Keras sin consumir recursos de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el modelo cabe en CPU y en cualquier GPU con unos pocos megabytes de memoria.
- GPU recomendadas: no requiere GPU. Cualquier CPU moderna es suficiente; una GPU consumer como una GTX 1050 o superior solo aportaria ventajas marginales.
- Cabe en cualquier GPU consumer, incluso en las de gama baja, y tambien en dispositivos moviles mediante la exportacion a TFLite.
- Opciones de despliegue: Keras/TensorFlow nativo, TensorFlow Lite (movil y embebido), TensorFlow Serving para SavedModel. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles; al tratarse de una regresion lineal con tres entradas, la inferencia es del orden de microsegundos en CPU, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `amandaodoo/casas-keras-entrenamiento-evaluacion` | Regresion lineal Keras (tabular) | no disponible | no aplica | MIT | Hugging Face |
| Regresion lineal con scikit-learn | Regresion lineal (tabular) | no aplica | no aplica | BSD-3-Clause | PyPI |
| XGBoost / LightGBM sobre el mismo dataset | Gradient boosting (tabular) | no disponible | no aplica | Apache 2.0 / MIT | PyPI |

No se dispone de datos de rendimiento del modelo como para establecer una comparacion cuantitativa con alternativas. La comparacion anterior es cualitativa y se basa en la categoria de tarea (regresion tabular), no en mediciones sobre este repositorio concreto.

## Limitaciones y advertencias

- El modelo se entrena con un dataset sintetico de solo 200 muestras, por lo que no generaliza a datos reales de vivienda ni a otras ciudades o mercados.
- Las variables de entrada son unicamente tres (`m2`, `balcon`, `ascensor`); no incorpora ubicacion, antiguedad, estado de conservacion ni otras variables relevantes para el precio.
- Al ser una regresion lineal, no captura relaciones no lineales ni interacciones entre variables.
- No se documentan sesgos especificos, pero al ser datos sinteticos cualquier sesgo del generador se trasladaria al modelo.
- Riesgo de alucinacion no aplica en el sentido habitual (no genera texto), pero si puede producir predicciones poco realistas fuera del rango de los datos de entrenamiento.
- La etiqueta de idioma `es` se refiere a la documentacion y al dataset, no a capacidades linguisticas del modelo.
- Licencia MIT: permite uso comercial y modificacion con atribucion, sin restricciones adicionales conocidas.
- No es apto para produccion: es un ejemplo educativo sin validacion cruzada, sin analisis de errores ni sin pruebas de robustez documentadas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/amandaodoo/casas-keras-entrenamiento-evaluacion
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
