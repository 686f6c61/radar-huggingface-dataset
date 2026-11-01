# AraceliAmherdt/01-sklearn-regresion

## Resumen

`AraceliAmherdt/01-sklearn-regresion` es un modelo de regresion lineal entrenado con scikit-learn que predice el precio de una vivienda en miles de dolares estadounidenses a partir de tres variables tabulares: superficie en metros cuadrados (`m2`), presencia de balcon (`balcon`) y presencia de ascensor (`ascensor`). No es un modelo de lenguaje ni una red neuronal: es un artefacto pedagogico serializado con `joblib` que ilustra el flujo completo de un proyecto de aprendizaje supervisado, desde la generacion de datos hasta la publicacion de un modelo entrenado en Hugging Face.

El modelo lo publica AraceliAmherdt con fines docentes para el IFTS N.º 18, con Cynthia M. Villagra como docente. El dataset es sintetico (200 registros generados con una semilla fija) y la relacion subyacente es estrictamente lineal, de modo que el modelo aprende pesos muy proximos a los coeficientes usados para generar los datos. Su relevancia es formativa: muestra que implica empaquetar un modelo, que metadatos acompanan a un artefacto de este tipo y como documentar limitaciones.

Tecnicamente es un `LinearRegression` por minimos cuadrados ordinarios con tres predictores y un termino independiente, entrenado sobre 160 registros y evaluado sobre 40. No dispone de contexto, tokenizador ni capacidades generativas; su interfaz es `predict()` sobre un `DataFrame` de pandas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion lineal multiple (minimos cuadrados ordinarios, `sklearn.linear_model.LinearRegression`) |
| Parametros totales | 4 (3 pesos + 1 bias) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, sin ventana de contexto) |
| Tipos de cuantizacion | no disponible (los coeficientes se almacenan en coma flotante de doble precision dentro de `model.joblib`) |
| Idiomas soportados | es (documentacion y model card en espanol) |
| Licencia | MIT |
| Formato de pesos | `joblib` (serializacion basada en pickle); no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es una regresion lineal multiple sin regularizacion. La funcion aprendida es `precio = w1·m2 + w2·balcon + w3·ascensor + b`, resuelta por minimos cuadrados. Los coeficientes estimados son 1,503 para `m2`, 8,719 para `balcon` y 11,988 para `ascensor`, con un intercepto de 19,557. Estos valores quedan muy cerca de los coeficientes generadores del dataset sintetico (1,5, 8 y 12, con intercepto 20), lo que confirma que el ruido anadido es de baja magnitud y que el modelo recupera practicamente la funcion verdadera.

Los datos de entrenamiento son 200 registros sinteticos generados en `train.py` con semilla fija: `m2` uniforme entre 35 y 120, y dos variables binarias independientes. Se reservan 160 registros para ajuste y 40 para evaluacion. No hay fases de RLHF, DPO ni ajuste fino; el "entrenamiento" consiste en una unica llamada de ajuste sobre la matriz de diseno. La innovacion tecnica es nula por diseno: el interes del artefacto esta en la reproducibilidad (semilla fija, script de entrenamiento incluido) y en la documentacion de los pesos aprendidos.

## Capacidades

- Prediccion de una variable objetivo continua (precio en miles de USD) a partir de tres variables tabulares.
- Inferencia por lotes mediante `predict()` sobre un `DataFrame` de pandas con las columnas `m2`, `balcon` y `ascensor`.
- Interpretabilidad directa: cada coeficiente tiene una lectura economica en unidades del objetivo.
- Reproducibilidad completa: `train.py` regenera el dataset y reajusta el modelo.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de capacidades generativas, de vision, audio ni modo de razonamiento.
- Capacidad multilingue: no aplica; el modelo no procesa texto, solo valores numericos.

## Casos de uso

- Docencia de aprendizaje supervisado: el modelo sirve como primer ejemplo end-to-end de regresion, desde la generacion de datos hasta la publicacion del artefacto, con pesos y metricas documentados para contrastar en clase.
- Verificacion de pipelines de MLOps: al ser un artefacto minimo con `train.py`, `predict.py` y `requirements.txt`, es util para probar flujos de empaquetado, versionado y descarga desde el Hub sin coste computacional.
- Pruebas de integracion de `joblib` y `huggingface_hub`: permite validar en un entorno controlado la descarga y carga de un `.joblib` remoto antes de aplicarlo a modelos mayores.
- Ejemplo de evaluacion de regresion: las metricas publicadas (MAE de 3,08 miles de USD y R² de 0,989 sobre 40 registros) sirven como referencia para comparar implementaciones de metricas en librerias propias.
- Demostracion de interpretabilidad de coeficientes: util para explicar en un curso como se traduce un peso aprendido en un incremento marginal del precio (por ejemplo, 1,503 miles de USD por m² adicional).
- Validacion de extraccion de caracteristicas tabulares: sirve como modelo de referencia para comprobar que un pipeline de preprocesado produce columnas con los nombres y tipos esperados.

## Benchmarks y rendimiento

| Metrica | Resultado | Conjunto |
|---|---|---|
| MAE | 3,08 miles de USD | 40 registros de evaluacion |
| R² | 0,989 | 40 registros de evaluacion |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB; el artefacto cabe en memoria principal sin GPU.
- GPU recomendadas: ninguna. La inferencia es una multiplicacion matricial de dimension 3 sobre CPU.
- Cabe en cualquier GPU consumer y en cualquier CPU moderna; no requiere aceleracion.
- Opciones de despliegue: script Python con `joblib` y `scikit-learn`; tambien puede servirse mediante FastAPI, Flask o un notebook. No aplica vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no publicados. Por la naturaleza del calculo (tres productos escalares por muestra), la latencia por prediccion es del orden de microsegundos en CPU, aunque no se ha medido ni documentado en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AraceliAmherdt/01-sklearn-regresion | 4 | no aplica | MAE 3,08; R² 0,989 (datos sinteticos) | MIT | Hugging Face |
| `sklearn.linear_model.LinearRegression` (referencia de la libreria) | segun datos | no aplica | no disponible | BSD-3-Clause (scikit-learn) | PyPI |
| `sklearn.linear_model.Ridge` (referencia de la libreria) | segun datos | no aplica | no disponible | BSD-3-Clause (scikit-learn) | PyPI |

No se dispone de comparaciones publicadas con otros modelos tabulares de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Fines exclusivamente educativos: los datos son sinteticos y no representan precios de vivienda reales; las predicciones no deben usarse para decisiones economicas.
- Rango de validez restringido: solo conoce superficies de 35 a 120 m². Fuera de ese intervalo extrapola linealmente sin garantia de acierto.
- Supuesto de linealidad aditiva: cada caracteristica suma un importe fijo; no captura interacciones (por ejemplo, que el ascensor valga mas en edificios altos) ni efectos no lineales.
- Riesgo de seguridad en la carga: `joblib` usa pickle, de modo que cargar un `.joblib` de una fuente no confiable puede ejecutar codigo arbitrario.
- Dependencia de version: la version de scikit-learn usada al cargar deberia coincidir con la de entrenamiento para evitar incompatibilidades de deserializacion.
- Sesgos: no documentados de forma explicita; al tratarse de datos sinteticos, cualquier sesgo presente proviene del generador y no de una poblacion real.
- Riesgo de alucinacion: no aplica, al no ser un modelo generativo.
- Restricciones de licencia: MIT permite uso comercial y modificacion con atribucion; no obstante, el caracter sintetico de los datos desaconseja su uso productivo.
- Caveat de produccion: el repositorio tiene 0 descargas y 0 likes, no hay validacion externa ni mantenimiento documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AraceliAmherdt/01-sklearn-regresion
- Documentacion de `LinearRegression` en scikit-learn: https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LinearRegression.html
- Documentacion de `joblib` para persistencia de modelos: https://joblib.readthedocs.io/en/stable/persistence.html
- Documentacion de `huggingface_hub` para descarga de archivos: https://huggingface.co/docs/huggingface_hub/guides/download
