# Pbueno467/regresion-casas-keras

## Resumen

`Pbueno467/regresion-casas-keras` es un modelo de regresion tabular minima, publicado en Hugging Face con fines exclusivamente pedagogicos. Lo desarrolla el usuario Pbueno467 en el marco del Seminario de Actualizacion del IFTS N.º 18 (docente: Cynthia M. Villagra) y sirve como ejemplo canonico de como entrenar y exportar una regresion lineal con Keras 3 en formato nativo `.keras`.

El problema que resuelve es la prediccion del precio de una vivienda, en miles de dolares estadounidenses, a partir de tres variables de entrada: superficie en metros cuadrados (`m2`, entre 35 y 120), presencia de balcon (`balcon`, 0 o 1) y presencia de ascensor (`ascensor`, 0 o 1). No es un modelo de lenguaje ni un transformer: es una red `Sequential` con una capa `Normalization` y una capa `Dense(1)`, es decir, tres pesos mas un sesgo.

Su relevancia es didactica, no de produccion. Resulta util como referencia para comparar el mismo problema resuelto con scikit-learn, PyTorch y Keras, y para ilustrar una diferencia practica relevante: la normalizacion se aprende con `adapt()` y queda embebida en el archivo `model.keras`, por lo que no hay que normalizar manualmente al inferir, a diferencia del ejemplo equivalente en PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red `Sequential` de Keras: capa `Normalization` + capa `Dense(1)` |
| Parametros totales | 4 (tres pesos y un sesgo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, sin contexto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | es (documentacion y model card en castellano) |
| Licencia | MIT |
| Formato de pesos | `.keras` (formato nativo de Keras 3) |

## Arquitectura y entrenamiento

La arquitectura es una regresion lineal implementada como red neuronal: una capa `Normalization` que estandariza las tres entradas usando la media y el desvio aprendidos con `adapt()` sobre los datos de entrenamiento, seguida de una capa `Dense(1)` sin activacion no lineal. El resultado es, en la practica, una regresion lineal multiple con normalizacion interna. El modelo se entrena con Keras 3 sobre backend PyTorch (tambien funciona con TensorFlow).

Los datos son sinteticos y se generan en `train.py` con una semilla fija, replicando el dataset de la Clase 10. El conjunto consta de 200 registros, de los cuales 160 se usan para entrenamiento y 40 para evaluacion. El entrenamiento es supervisado, con funcion de perdida de error cuadratico medio (`mse`), optimizador SGD con tasa de aprendizaje 0,1 y 200 epocas. No se emplean tecnicas de RLHF, DPO ni ajuste fino posterior; tampoco hay innovaciones de decodificacion ni mecanismos de atencion.

## Capacidades

- Regresion tabular sobre tres variables de entrada: superficie en m², balcon binario y ascensor binario.
- Prediccion de una variable objetivo continua: precio en miles de US$.
- Normalizacion integrada en el grafo del modelo: la media y el desvio se guardan dentro de `model.keras`, por lo que la inferencia no requiere preprocesado manual.
- Exportacion en formato nativo `.keras`, que empaqueta arquitectura, pesos, normalizacion y configuracion de entrenamiento en un unico archivo.
- Compatibilidad con dos backends de Keras 3: PyTorch y TensorFlow.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.

## Casos de uso

- Docencia de regresion lineal con Keras: el modelo sirve como ejemplo minimo y reproducible para explicar el ciclo completo de entrenamiento, evaluacion y exportacion en un curso introductorio de machine learning.
- Comparativa de frameworks: al resolver el mismo problema que los ejemplos de scikit-learn y PyTorch, permite contrastar API, gestion de la normalizacion y formato de serializacion entre las tres herramientas.
- Demostracion de normalizacion embebida: ilustra como la capa `Normalization` con `adapt()` evita el preprocesado manual en inferencia, un patron util en pipelines donde el modelo debe ser autocontenido.
- Prueba de integracion de Keras 3: sirve para verificar que un entorno con Keras 3 y backend PyTorch o TensorFlow carga correctamente un archivo `.keras` y produce predicciones.
- Ejemplo de serializacion portable: util para mostrar como un unico archivo `.keras` contiene arquitectura, pesos y configuracion, simplificando el despliegue en comparacion con checkpoints separados.
- Material de evaluacion academica: permite comprobar la comprension de conceptos como MAE, R², conjunto de test y variables binarias en un ejercicio acotado de 200 registros.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son las metricas de evaluacion sobre el conjunto de test de 40 casas no vistas durante el entrenamiento:

| Metrica | Resultado |
|---|---|
| MAE | 3,10 miles de US$ |
| R² | 0,989 |

No se han publicado resultados frente a benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con modelos alternativos sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene 4 parametros y un archivo `.keras` de tamano minimo.
- GPU recomendadas: no requiere GPU. Cualquier CPU moderna es suficiente para la inferencia.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo e incluso en entornos sin GPU.
- Opciones de despliegue: carga directa con Keras 3 (`keras.saving.load_model`) sobre backend PyTorch o TensorFlow. No aplica vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles de forma publicada; por la naturaleza del modelo, la latencia por prediccion es del orden de microsegundos a milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Pbueno467/regresion-casas-keras` | 4 | no aplica | MAE 3,10; R² 0,989 (test sintetico) | MIT | Hugging Face |
| Ejemplo de regresion con scikit-learn (mismo problema, Clase 10) | no aplica (modelo lineal) | no aplica | no disponible | no disponible | Referenciado en la model card |
| Ejemplo de regresion con PyTorch (mismo problema, Clase 10) | no disponible | no aplica | no disponible | no disponible | Referenciado en la model card |

La model card menciona explicitamente que el mismo problema esta resuelto con scikit-learn y PyTorch, pero no publica sus metricas ni sus especificaciones, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- Fines exclusivamente educativos: los datos son sinteticos y no representan precios reales de vivienda.
- Dominio acotado: solo conoce casas de 35 a 120 m²; fuera de ese rango la prediccion no es fiable.
- Orden de columnas obligatorio: la entrada debe ser un array con el orden `m2`, `balcon`, `ascensor`. El modelo no acepta una tabla con nombres de columnas.
- Dependencia de version: requiere Keras 3; el formato `.keras` no se abre con versiones antiguas de TensorFlow/Keras 2.
- Sin capacidades de lenguaje: no genera texto, no razona y no soporta herramientas ni agentes; no debe evaluarse como modelo de IA generativa.
- Riesgo de alucinacion: no aplica en el sentido habitual, pero el modelo extrapola de forma lineal fuera del rango de entrenamiento, lo que puede producir predicciones sin sentido fisico.
- Sesgos: al ser datos sinteticos con semilla fija, no se han documentado sesgos demograficos ni geograficos; tampoco se ha realizado ninguna auditoria de equidad.
- Uso comercial: la licencia MIT permite uso comercial, pero el modelo no es adecuado para produccion por su caracter pedagogico y su dataset sintetico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pbueno467/regresion-casas-keras
