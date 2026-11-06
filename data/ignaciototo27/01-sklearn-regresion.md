# IgnacioToto27/01-sklearn-regresion

## Resumen

Este "modelo" es en realidad un ejemplo pedagogico de regresion lineal multiple entrenado con scikit-learn, publicado en Hugging Face por el usuario IgnacioToto27 con fines exclusivamente didacticos para el IFTS N.º 18. No se trata de un modelo de lenguaje ni de una red neuronal: es un objeto `LinearRegression` serializado con `joblib` que predice el precio de una vivienda (en miles de dolares estadounidenses) a partir de tres variables tabulares: superficie en metros cuadrados, presencia de balcon y presencia de ascensor.

Su relevancia es acotada y de naturaleza formativa: sirve para ilustrar el ciclo completo de publicacion de un modelo supervisado (entrenamiento, evaluacion, serializacion y comparticion en el Hub), no para resolver un problema real de valoracion inmobiliaria. El dataset es sintetico (200 registros generados con una formula lineal mas ruido), de modo que el modelo no ha visto datos reales en ningun momento.

Al no ser un transformer, no dispone de ventana de contexto, tokenizador ni capacidades generativas. Cualquier evaluacion debe hacerse en terminos de error de regresion sobre datos tabulares, no de benchmarks de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion lineal multiple (minimos cuadrados ordinarios, `sklearn.linear_model.LinearRegression`) |
| Parametros totales | 4 parametros aprendidos (3 pesos + 1 bias) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, sin contexto) |
| Tipos de cuantizacion | no disponible (no procede; pesos en punto flotante de doble precision por defecto en scikit-learn) |
| Idiomas soportados | es (documentacion y model card en castellano; el modelo en si no procesa texto) |
| Licencia | MIT |
| Formato de pesos | `joblib` (serializacion basada en pickle) |

## Arquitectura y entrenamiento

La arquitectura es una regresion lineal multiple clasica: `y = w1·m2 + w2·balcon + w3·ascensor + b`. Los coeficientes se estiman por minimos cuadrados ordinarios mediante `LinearRegression` de scikit-learn. El modelo tiene tres variables de entrada (`m2` continuo en el rango 35-120, `balcon` binario y `ascensor` binario) y una salida continua (`precio`, en miles de USD).

Los datos de entrenamiento son 200 registros sinteticos generados en `train.py` con una semilla fija, de los cuales 160 se usan para entrenamiento y 40 para evaluacion. La funcion generadora es `precio = 1.5·m2 + 8·balcon + 12·ascensor + 20 + ruido`. Los pesos aprendidos (1,503 para `m2`; 8,719 para `balcon`; 11,988 para `ascensor`; bias 19,557) quedan muy proximos a los coeficientes teoricos, lo que confirma que el ajuste ha recuperado correctamente la estructura lineal subyacente. No hay RLHF, DPO, ni ninguna tecnica de alineacion; tampoco innovaciones de atencion ni decodificacion, por la propia naturaleza del modelo.

## Capacidades

- Prediccion de una variable continua (precio en miles de USD) a partir de tres caracteristicas tabulares.
- Inferencia por lotes mediante `modelo.predict(DataFrame)`, apta para procesar multiples filas de una vez.
- Reproducibilidad completa: el codigo de entrenamiento (`train.py`) y el de inferencia (`predict.py`) se incluyen en el repositorio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: no procesa lenguaje natural.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Docencia de regresion lineal: el modelo sirve como ejemplo minimo y reproducible para explicar coeficientes, bias y evaluacion con MAE y R² en un curso introductorio de machine learning.
- Demostracion del flujo de publicacion en Hugging Face: permite mostrar a estudiantes como se sube un artefacto `joblib`, se documenta con una model card y se descarga con `hf_hub_download`.
- Prueba de integracion de pipelines de inferencia tabular: util para validar que un entorno con scikit-learn y pandas carga correctamente un modelo serializado y ejecuta `predict` sobre un `DataFrame`.
- Ejercicio de analisis de sensibilidad: al conocer los pesos reales, se puede comprobar como varia la prediccion al modificar `m2`, `balcon` o `ascensor` y contrastarlo con los coeficientes aprendidos.
- Base para ejercicios de regularizacion: partir de este modelo y comparar con Ridge o Lasso para ilustrar el efecto de la penalizacion sobre los coeficientes.
- Ejemplo de advertencia sobre seguridad en serializacion: sirve para explicar por que `joblib`/pickle solo debe cargarse desde fuentes de confianza, dado que la deserializacion puede ejecutar codigo arbitrario.

## Benchmarks y rendimiento

| Metrica | Resultado | Conjunto |
|---|---|---|
| MAE | 3,08 miles de USD | 40 registros de test |
| R² | 0,989 | 40 registros de test |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no procede aplicarlos a un modelo tabular de este tipo.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo ocupa practicamente nada en memoria (cuatro coeficientes en punto flotante).
- GPU recomendadas: ninguna; la inferencia se ejecuta en CPU en microsegundos.
- Cabe en cualquier GPU consumer y en cualquier CPU moderna, incluidos entornos sin aceleracion.
- Opciones de despliegue: carga directa con `joblib.load` en Python; no es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no se han publicado mediciones; por la naturaleza del modelo, la latencia es despreciable y el throughput depende del coste de construir el `DataFrame` de entrada, no del calculo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IgnacioToto27/01-sklearn-regresion | 4 (3 pesos + bias) | no aplica | MAE 3,08; R² 0,989 (test sintetico) | MIT | Hugging Face |
| Regresion lineal con `sklearn` sobre datos sinteticos equivalentes | 4 | no aplica | Depende del ruido y la semilla | segun implementacion | reproducible con `train.py` |
| Ridge / Lasso sobre el mismo dataset | 4 | no aplica | no disponible en la informacion | segun implementacion | no disponible |

No se dispone de comparaciones publicadas con alternativas en la informacion proporcionada; la comparativa anterior es estructural, no basada en mediciones independientes.

## Limitaciones y advertencias

- Fines exclusivamente educativos: los datos son sinteticos y no representan precios inmobiliarios reales.
- Rango de validez restringido: solo conoce viviendas de 35 a 120 m²; fuera de ese intervalo extrapola linealmente sin garantia de acierto.
- Modelo puramente aditivo: no captura interacciones entre variables (por ejemplo, que el ascensor valga mas en edificios altos) ni relaciones no lineales.
- Riesgo de seguridad en la serializacion: `joblib` usa pickle, de modo que cargar un archivo `.joblib` de una fuente no confiable puede ejecutar codigo arbitrario.
- Dependencia de version: la version de scikit-learn usada para cargar debe coincidir con la de entrenamiento para evitar incompatibilidades.
- Sin sesgos sociales documentados por tratarse de datos sinteticos, pero tampoco hay auditoria de equidad ni validacion externa.
- Licencia MIT: permite uso comercial, pero el propio autor desaconseja emplearlo fuera del ambito formativo por la naturaleza sintetica de los datos.
- No apto para produccion en valoracion inmobiliaria real sin reentrenamiento con datos representativos y validacion adecuada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IgnacioToto27/01-sklearn-regresion
- Documentacion de scikit-learn sobre `LinearRegression`: https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LinearRegression.html
- Documentacion de `joblib` para persistencia de modelos: https://joblib.readthedocs.io/
- Documentacion de `huggingface_hub` para descarga de artefactos: https://huggingface.co/docs/huggingface_hub
