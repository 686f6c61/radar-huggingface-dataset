# K-B21/regresion-casas-keras

## Resumen

`K-B21/regresion-casas-keras` es un modelo de regresión tabular minima desarrollado como ejemplo pedagogico para el Seminario de Actualizacion del IFTS N.º 18 (Argentina), con docencia de Cynthia M. Villagra. No es un modelo de lenguaje ni un sistema de proposito general: es una red `Sequential` de Keras 3 que estima el precio de una vivienda en miles de dolares estadounidenses a partir de tres variables de entrada (`m2`, `balcon`, `ascensor`). Su interes es didactico: demuestra el flujo completo de entrenamiento, evaluacion y exportacion en el formato nativo `.keras`, incluyendo la capa `Normalization` embebida en el artefacto.

El modelo resuelve un problema de regresion supervisada sobre un dataset sintetico de 200 registros generados con semilla fija, de los cuales 160 se emplean para entrenamiento y 40 para evaluacion. La arquitectura efectiva es una regresion lineal multiple: una capa `Normalization` que aprende media y desviacion tipica con `adapt()` y una capa `Dense(1)`, lo que resulta en tres pesos y un sesgo. Se entrena con descenso de gradiente estocastico (SGD, tasa 0,1) y perdida MSE durante 200 epocas.

Su relevancia actual es acotada y exclusivamente formativa. Sirve como referencia reproducible para comparar el mismo problema implementado en scikit-learn, PyTorch y Keras, y para ilustrar buenas practicas de empaquetado de modelos (normalizacion incluida en el fichero, codigo de entrenamiento y de inferencia adjuntos, licencia MIT). No debe confundirse con un modelo predictivo de precios inmobiliarios reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red `Sequential` de Keras: `Normalization` + `Dense(1)` (regresion lineal multiple) |
| Parametros totales | 4 (3 pesos + 1 sesgo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular fija de 3 caracteristicas) |
| Tipos de cuantizacion | no disponible (no se documentan; el modelo es de precision estandar en Keras) |
| Idiomas soportados | es (documentacion y model card en espanol) |
| Licencia | MIT |
| Formato de pesos | `.keras` (formato nativo de Keras 3; no compatible con Keras 2 ni con TensorFlow clasico) |

## Arquitectura y entrenamiento

La arquitectura es una pila `Sequential` de dos capas. La primera, `Normalization`, calcula la media y la desviacion tipica de cada una de las tres variables de entrada durante la llamada a `adapt()` sobre el conjunto de entrenamiento; al ser una capa del modelo, esos estadisticos se serializan dentro de `model.keras`, de modo que la inferencia no requiere normalizar manualmente. La segunda capa es `Dense(1)` sin activacion, que aplica una combinacion lineal de las entradas normalizadas. El resultado es, en la practica, una regresion lineal multiple con estandarizacion integrada, con 4 parametros entrenables en total.

El entrenamiento es supervisado sobre un dataset sintetico de 200 registros (160 de entrenamiento, 40 de evaluacion) generado en `train.py` con semilla fija; las entradas son `m2` en el rango [35, 120], `balcon` binario y `ascensor` binario, y la objetivo es `precio` en miles de USD. Se optimiza MSE con SGD (learning rate 0,1) durante 200 epocas, usando Keras 3 con backend PyTorch (compatible tambien con TensorFlow). No hay RLHF, DPO, decodificacion especulativa ni tecnicas de atencion: no aplica a este tipo de modelo. La innovacion tecnica destacable, segun la model card, es la portabilidad del artefacto: normalizacion, pesos y configuracion de entrenamiento viajan en un unico fichero `.keras`.

## Capacidades

- Regresion tabular: estima un valor continuo (precio en miles de USD) a partir de tres caracteristicas numericas y binarias.
- Normalizacion integrada: la capa `Normalization` permite inferencia directa sin preprocesado manual de las entradas.
- Serializacion completa: `model.keras` contiene arquitectura, pesos, estadisticos de normalizacion y configuracion de entrenamiento.
- Compatibilidad de backend: funciona con Keras 3 sobre PyTorch o TensorFlow.
- Reproducibilidad: el dataset sintetico se genera con semilla fija en `train.py`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.
- Capacidad multilingue: no aplica; el modelo no procesa lenguaje, solo vectores numericos.

## Casos de uso

- Docencia de regresion con Keras: servir de ejemplo minimo y ejecutable del ciclo completo (generacion de datos, `adapt()`, entrenamiento, evaluacion y guardado en `.keras`) en un curso introductorio de machine learning.
- Comparativa de frameworks: replicar el mismo problema en scikit-learn y PyTorch (como hace el propio material del seminario) para contrastar diferencias de API y de empaquetado del modelo.
- Prueba de integracion de Keras 3: verificar que un entorno con backend PyTorch o TensorFlow carga correctamente un artefacto `.keras` y ejecuta `predict` con el formato de entrada esperado.
- Validacion de pipelines de serializacion: usar el fichero como caso de prueba para comprobar que una herramienta de despliegue (por ejemplo, un servicio de inferencia interno) maneja modelos tabulares de Keras con capas de preprocesado embebidas.
- Ejemplo de juguete en tutoriales de MLOps: ilustrar el versionado de artefactos y la separacion entre `train.py`, `predict.py` y `model.keras` en un repositorio pequeno con licencia permisiva.
- Material de evaluacion academica: plantear ejercicios sobre metricas de regresion (MAE, R²) y sobre el efecto de la normalizacion en la convergencia con SGD a tasa 0,1.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de evaluacion (40 casas no vistas durante el entrenamiento):

| Metrica | Resultado |
|---|---|
| MAE | 3,10 miles de USD |
| R² | 0,989 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene 4 parametros y una entrada de 3 valores.
- GPU recomendadas: no requiere GPU; la inferencia y el entrenamiento caben holgadamente en CPU.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, GTX 1650, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: carga directa con `keras.saving.load_model("model.keras")` en Keras 3 (backend PyTorch o TensorFlow); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo tabular de este tipo.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera del orden de microsegundos a milisegundos por muestra en CPU, sin datos medidos publicados.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada. Como referencia cualitativa, el propio autor menciona que el modelo resuelve el mismo problema que los ejemplos de scikit-learn y PyTorch del seminario, pero no se publican parametros, contexto ni resultados comparativos de esas implementaciones.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| K-B21/regresion-casas-keras | 4 | no aplica | MIT | Hugging Face |
| Ejemplo scikit-learn del seminario | no disponible | no aplica | no disponible | no disponible |
| Ejemplo PyTorch del seminario | no disponible | no aplica | no disponible | no disponible |

## Limitaciones y advertencias

- Fines exclusivamente educativos: los datos son sinteticos y no representan precios inmobiliarios reales; no debe usarse para tasacion ni para decisiones financieras.
- Dominio restringido: solo conoce viviendas de 35 a 120 m²; fuera de ese rango la prediccion no es fiable.
- Orden de columnas obligatorio: la entrada debe ser un array con el orden `m2`, `balcon`, `ascensor`; el modelo no acepta una tabla con nombres de columna.
- Compatibilidad estricta: requiere Keras 3; el formato `.keras` no se abre con TensorFlow/Keras 2.
- Sin datos reales: al entrenarse con 160 muestras sinteticas, no captura relaciones del mercado inmobiliario real (ubicacion, antiguedad, estado, etc.).
- Riesgo de extrapolacion: al ser un modelo lineal, las predicciones fuera del rango de entrenamiento pueden ser arbitrarias.
- Sesgos: no se documentan sesgos especificos, pero el dataset sintetico con semilla fija no representa ninguna poblacion real.
- Licencia MIT: permite uso comercial y modificacion con atribucion; aun asi, su valor en produccion es nulo por las limitaciones anteriores.
- Sin garantias de rendimiento en produccion: no se publican latencias, throughput ni pruebas de carga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/K-B21/regresion-casas-keras
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados al modelo.
