# sebsmedina/keras_regression

## Resumen

`sebsmedina/keras_regression` es un modelo de regresion tabular publicado en HuggingFace por el usuario sebsmedina como ejemplo pedagogico del Seminario de Actualizacion del IFTS N.o 18 (docente: Cynthia M. Villagra). No es un modelo de lenguaje ni una red neuronal profunda: es una regresion lineal implementada con Keras 3 que predice el precio de una vivienda en miles de dolares estadounidenses a partir de tres variables de entrada (superficie en metros cuadrados, presencia de balcon y presencia de ascensor).

El modelo resuelve un problema didactico concreto: mostrar el ciclo completo de entrenamiento y exportacion en el formato nativo `.keras`, incluyendo una capa `Normalization` que aprende la media y la desviacion tipica de los datos durante el `adapt()` y que queda embebida en el archivo del modelo. Esto contrasta con el equivalente en PyTorch, donde la normalizacion se serializa por separado. La arquitectura es minima: una capa `Normalization` seguida de una capa `Dense(1)`, lo que se traduce en tres pesos mas un sesgo.

Su relevancia es exclusivamente formativa. Con 200 registros sinteticos (160 de entrenamiento y 40 de evaluacion), un MAE de 3,10 miles de USD y un R2 de 0,989 sobre el conjunto de prueba, sirve como referencia para quienes se inician en Keras 3 con backend PyTorch o TensorFlow y quieren entender el empaquetado de artefactos de inferencia. No debe confundirse con un modelo de produccion ni con un sistema de valoracion inmobiliaria real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion lineal: `Sequential` con `Normalization` + `Dense(1)` |
| Parametros totales | 4 (tres pesos y un bias, segun la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; entrada fija de 3 caracteristicas) |
| Tipos de cuantizacion | No disponible (formato nativo `.keras`, no se documentan cuantizaciones) |
| Idiomas soportados | Espanol (`es`) |
| Licencia | MIT |
| Formato de pesos | `.keras` (formato nativo de Keras 3) |

## Arquitectura y entrenamiento

La arquitectura es un perceptron de una sola capa sobre caracteristicas estandarizadas. La capa `Normalization` aprende la media y la desviacion tipica de las tres variables de entrada durante la llamada a `adapt()` sobre el conjunto de entrenamiento, y esas estadisticas se persisten dentro de `model.keras`, de modo que la inferencia no requiere normalizar manualmente. La capa `Dense(1)` aplica una combinacion lineal de los tres valores normalizados mas un sesgo, produciendo directamente el precio estimado.

El entrenamiento es supervisado y de regresion, con funcion de perdida de error cuadratico medio (`mse`), optimizador SGD con tasa de aprendizaje 0,1 y 200 epocas. El dataset es sintetico, generado en `train.py` con la misma semilla que el ejemplo de la Clase 10, y consta de 200 registros (160 para entrenamiento y 40 para evaluacion). Las entradas son `m2` (rango de 35 a 120), `balcon` (0 o 1) y `ascensor` (0 o 1); la variable objetivo es `precio`, en miles de USD. Se ejecuta con Keras 3 y backend PyTorch, aunque tambien funciona con TensorFlow. No se documenta uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo de regresion tabular.

## Capacidades

- Prediccion de una variable numerica continua (precio de vivienda en miles de USD) a partir de tres caracteristicas tabulares.
- Normalizacion integrada en el propio grafo del modelo, sin necesidad de preprocesamiento externo en inferencia.
- Exportacion e importacion en el formato nativo `.keras`, que empaqueta arquitectura, pesos, estadisticas de normalizacion y configuracion de entrenamiento en un unico archivo.
- Compatibilidad con backend PyTorch y TensorFlow dentro de Keras 3.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues mas alla de la documentacion en espanol.
- No dispone de modo de razonamiento, vision ni audio.

## Casos de uso

- Docencia de Keras 3: utilizar `model.keras` como ejemplo reproducible para explicar el ciclo `compile`/`fit`/`save` y la diferencia entre persistir la normalizacion dentro o fuera del modelo.
- Comparativa de frameworks: replicar el mismo problema en scikit-learn y PyTorch (como ya hace el autor) para contrastar la ergonomia de serializacion entre ecosistemas.
- Prueba de integracion de pipelines: usar el modelo como smoke test en un pipeline de CI que verifique que Keras 3 y el backend configurado cargan correctamente un artefacto `.keras` antes de desplegar modelos mayores.
- Ejemplo de inferencia minima: validar el flujo `keras.saving.load_model` + `predict` con un array de forma `(1, 3)` en un entorno controlado, por ejemplo `np.array([[80, 1, 0]], dtype="float32")`, que devuelve aproximadamente `[[148.6]]`.
- Material de ejercicios de regresion: proponer al alumnado variaciones del dataset sintetico (ampliar el rango de `m2`, anadir variables) y medir el impacto en MAE y R2.
- Referencia de licencia permisiva: al estar bajo MIT, puede copiarse y modificarse libremente en materiales de curso, repositorios docentes o notebooks publicos sin restricciones de atribucion mas alla de la propia licencia.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| MAE (conjunto de evaluacion, 40 registros) | 3,10 miles de USD |
| R2 (conjunto de evaluacion, 40 registros) | 0,989 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente despreciable (el modelo tiene 4 parametros y un archivo `.keras` de tamano minimo); cualquier GPU o incluso CPU es suficiente.
- GPU recomendadas: no se requiere GPU; funciona en CPU sin penalizacion perceptible. Cualquier GPU consumer (por ejemplo, una GTX 1050 o superior) es mas que suficiente.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: Keras 3 con backend PyTorch o TensorFlow; carga mediante `keras.saving.load_model`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma medida; por la naturaleza del modelo (una multiplicacion matricial de 3x1) la latencia es del orden de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sebsmedina/keras_regression` | 4 | No aplica | MAE 3,10; R2 0,989 (40 registros) | MIT | HuggingFace |
| Ejemplo de regresion con scikit-learn (mismo problema, citado en la model card) | No disponible | No aplica | No disponible en la informacion proporcionada | No disponible | Referenciado en la model card |
| Ejemplo de regresion con PyTorch (mismo problema, citado en la model card) | No disponible | No aplica | No disponible en la informacion proporcionada | No disponible | Referenciado en la model card |

No se dispone de datos numericos de los equivalentes en scikit-learn y PyTorch mas alla de la mencion cualitativa de que resuelven el mismo problema; la model card solo indica que en PyTorch la normalizacion se guarda por separado.

## Limitaciones y advertencias

- Fines exclusivamente educativos: los datos son sinteticos y no representan precios reales de vivienda.
- Dominio restringido: solo conoce viviendas de 35 a 120 m2; fuera de ese rango las predicciones no son fiables.
- Orden de columnas fijo: la entrada debe ser `m2`, `balcon`, `ascensor`, y se pasa como array, no como tabla con nombres de columna.
- Requiere Keras 3; el formato `.keras` no se abre con versiones antiguas de TensorFlow/Keras 2.
- No apto para produccion ni para toma de decisiones reales de valoracion inmobiliaria.
- No se documentan sesgos mas alla de la propia naturaleza sintetica del dataset; no hay informacion sobre evaluaciones de equidad.
- Riesgo de alucinacion no aplica en el sentido habitual (no genera texto), pero si existe riesgo de extrapolacion incorrecta fuera del rango de entrenamiento.
- La model card incluye una nota de licencia `unknown` en el bloque de metadatos, en contradiccion con la licencia MIT declarada en el cuerpo y en los tags; conviene verificar la licencia antes de un uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sebsmedina/keras_regression
