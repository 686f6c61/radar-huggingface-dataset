# LaugerM/regresion-casas-keras

## Resumen

`LaugerM/regresion-casas-keras` es un modelo de regresion tabular publicado en Hugging Face por el usuario LaugerM, desarrollado como ejemplo pedagogico para el Seminario de Actualizacion del IFTS N.º 18 (docente: Cynthia M. Villagra). No es un modelo de lenguaje ni una red neuronal profunda: es una regresion lineal implementada en Keras 3 que predice el precio de una vivienda en miles de dolares estadounidenses a partir de tres variables de entrada (superficie en metros cuadrados, presencia de balcon y presencia de ascensor).

El modelo se compone de una capa `Normalization` seguida de una capa `Dense(1)`, lo que resulta en tres pesos y un sesgo. Se entrena sobre un dataset sintetico de 200 registros generados con semilla fija en `train.py`, del cual 160 se destinan a entrenamiento y 40 a evaluacion. La relevancia del artefacto es exclusivamente didactica: ilustra el flujo completo de entrenamiento, serializacion en el formato nativo `.keras` y carga para inferencia, comparandose con ejemplos equivalentes en scikit-learn y PyTorch.

No debe confundirse con un modelo fundacional ni emplearse en produccion. Su interes radica en mostrar como Keras 3 empaqueta arquitectura, pesos, capa de normalizacion y configuracion de entrenamiento en un unico archivo, lo que simplifica el despliegue frente a alternativas que requieren guardar el escalado por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion lineal: `Sequential` con `Normalization` + `Dense(1)` |
| Parametros totales | 4 (3 pesos + 1 sesgo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no disponible (no procede para este tipo de modelo) |
| Idiomas soportados | es (documentacion y etiquetas) |
| Licencia | MIT |
| Formato de pesos | `.keras` (formato nativo de Keras 3) |

## Arquitectura y entrenamiento

La arquitectura es una red `Sequential` de Keras 3 compuesta por una capa `Normalization` y una capa `Dense(1)`. La capa de normalizacion aprende la media y la desviacion tipica de las variables de entrada mediante `adapt()` sobre los datos de entrenamiento, y queda almacenada dentro del propio archivo `model.keras`, de modo que no es necesario reescalar las entradas manualmente en inferencia. Esto contrasta con el ejemplo equivalente en PyTorch, donde la normalizacion se persiste por separado.

El entrenamiento es supervisado, con funcion de perdida de error cuadratico medio (`mse`), optimizador SGD con tasa de aprendizaje 0,1 y 200 epocas. El dataset es sintetico, generado en `train.py` con la misma semilla que el ejemplo de la Clase 10, y consta de 200 registros: 160 para entrenamiento y 40 para evaluacion. Las variables de entrada son `m2` (rango de 35 a 120), `balcon` (0 o 1) y `ascensor` (0 o 1); la variable objetivo es `precio`, en miles de US$. El modelo es compatible con backend PyTorch y TensorFlow.

## Capacidades

- Prediccion de una variable numerica continua (precio en miles de US$) a partir de tres entradas tabulares.
- Normalizacion integrada de las entradas dentro del propio artefacto serializado.
- Carga directa mediante `keras.saving.load_model` sin pasos adicionales de preprocesado.
- Compatibilidad con los backends PyTorch y TensorFlow de Keras 3.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto: es un modelo puramente numerico y de proposito unico.
- Sin capacidades multilingues en sentido estricto; la documentacion esta en castellano.

## Casos de uso

- Docencia de regresion lineal en Keras: el modelo sirve como ejemplo minimo y reproducible para explicar el ciclo completo de entrenamiento, evaluacion y serializacion en un curso introductorio de machine learning.
- Comparativa de frameworks: permite contrastar el mismo problema resuelto en Keras, scikit-learn y PyTorch, evidenciando diferencias de empaquetado (normalizacion incluida frente a externa) y de formato de guardado.
- Demostracion de serializacion `.keras`: util para mostrar como se persiste un modelo completo (arquitectura, pesos, normalizacion y configuracion) en un unico archivo.
- Pruebas de integracion de Keras 3: sirve como smoke test para verificar que un entorno con Keras 3 y backend PyTorch o TensorFlow carga y ejecuta correctamente un modelo `.keras`.
- Ejemplo de pipeline tabular reproducible: el par `train.py`/`predict.py` ilustra buenas practicas de separacion entre entrenamiento e inferencia con semilla fija.
- Material de evaluacion academica: adecuado como referencia para corregir ejercicios de regresion o para que el alumnado compare sus propias implementaciones contra un resultado conocido (MAE 3,10; R² 0,989).

## Benchmarks y rendimiento

| Metrica | Resultado | Conjunto |
|---|---|---|
| MAE | 3,10 miles de US$ | 40 casas de evaluacion |
| R² | 0,989 | 40 casas de evaluacion |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable (menos de 100 MB; el modelo tiene 4 parametros y el coste dominante es el propio runtime de Keras).
- GPU recomendadas: no requiere GPU; funciona en CPU sin penalizacion perceptible.
- Cabe en cualquier GPU consumer, e incluso en entornos sin GPU.
- Opciones de despliegue: carga directa con Keras 3 (`keras.saving.load_model`) sobre backend PyTorch o TensorFlow. No aplica vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada; por la naturaleza del modelo, la latencia por prediccion sera del orden de microsegundos a milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `LaugerM/regresion-casas-keras` | 4 (3 pesos + 1 sesgo) | no aplica | MAE 3,10; R² 0,989 | MIT | Hugging Face |
| Ejemplo equivalente en scikit-learn (referenciado en la model card) | no disponible | no aplica | no disponible | no disponible | no disponible |
| Ejemplo equivalente en PyTorch (referenciado en la model card) | no disponible | no aplica | no disponible | no disponible | no disponible |

La model card menciona que el mismo problema se resuelve en ejemplos de scikit-learn y PyTorch, pero no proporciona sus especificaciones ni metricas, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- Fines exclusivamente educativos: los datos son sinteticos y no representan precios reales de vivienda.
- Dominio restringido: solo conoce casas de entre 35 y 120 m²; fuera de ese rango la prediccion no es fiable.
- Orden de columnas obligatorio: las entradas deben ir como `m2`, `balcon`, `ascensor`; el modelo recibe un array, no una tabla con nombres de columna.
- Dependencia de version: requiere Keras 3; el formato `.keras` no se abre con TensorFlow/Keras 2.
- Riesgo de extrapolacion: al ser una regresion lineal con tres variables, no captura relaciones no lineales ni factores adicionales del mercado inmobiliario.
- Riesgo de alucinacion: no aplica en el sentido habitual, pero si existe riesgo de predicciones sin sentido si se alimenta con entradas fuera de distribucion.
- Licencia MIT: permite uso comercial y modificacion, pero el caracter sintetico de los datos desaconseja cualquier aplicacion real.
- Sesgos: no documentados en la informacion disponible; al ser datos sinteticos, no reflejan sesgos del mundo real, pero tampoco su complejidad.

## Enlaces

- Hugging Face: https://huggingface.co/LaugerM/regresion-casas-keras
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
