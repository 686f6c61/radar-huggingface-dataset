# grisselblanco/Clase_11_sklearn-regresion

## Resumen

`grisselblanco/Clase_11_sklearn-regresion` no es un modelo de lenguaje ni una red neuronal profunda: es un artefacto pedagogico consistente en un modelo de regresion lineal multiple entrenado con `sklearn.linear_model.LinearRegression` y serializado en formato `joblib`. Lo publica la usuaria `grisselblanco` en el Hub de Hugging Face como material didactico del IFTS N.º 18 (docente: Cynthia M. Villagra), dentro de una serie de clases sobre aprendizaje supervisado. Su funcion es predecir el precio de una vivienda en miles de dolares estadounidenses a partir de tres variables tabulares: superficie en metros cuadrados, presencia de balcon y presencia de ascensor.

El interes del artefacto es exclusivamente formativo: ilustra el ciclo completo de publicacion de un modelo entrenado (codigo de entrenamiento, pesos aprendidos, script de inferencia, dependencias y model card) sobre un caso de regresion tabular trivial. El conjunto de datos es sintetico, generado con una relacion lineal conocida mas ruido, lo que permite comprobar que los coeficientes estimados recuperan los coeficientes teoricos. No existe arquitectura transformer, ni tokenizador, ni ventana de contexto: el "modelo" es una matriz de tres pesos y un termino independiente.

Por su naturaleza, no compite con modelos fundacionales ni admite comparacion en terminos de parametros o contexto. Su relevancia actual es la de un ejemplo reproducible y de tamano despreciable (el repositorio ocupa 0.0 GB) para ensenar regresion lineal, evaluacion con MAE y R², y buenas practicas de empaquetado de modelos con scikit-learn y `joblib`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | regresion lineal multiple por minimos cuadrados ordinarios (`sklearn.linear_model.LinearRegression`) |
| Parametros totales | 3 coeficientes (`m2`, `balcon`, `ascensor`) + 1 intercepto = 4 parametros aprendidos |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular; entrada de 3 caracteristicas por registro) |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas; `joblib` almacena los pesos en punto flotante) |
| Idiomas soportados | es (documentacion y model card en espanol; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | `joblib` (serializacion basada en `pickle`); no se publican `safetensors` ni GGUF |
| Libreria | scikit-learn |
| Pipeline declarado | `tabular-regression` |
| Tamano del repositorio | 0.0 GB |
| Variables de entrada | `m2` (35-120), `balcon` (0/1), `ascensor` (0/1) |
| Variable objetivo | `precio` en miles de US$ |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es una regresion lineal multiple sin regularizacion, ajustada por minimos cuadrados ordinarios mediante `LinearRegression` de scikit-learn. La hipotesis es estrictamente aditiva y lineal: `precio = w1·m2 + w2·balcon + w3·ascensor + b`. No hay capas ocultas, funciones de activacion, atencion ni mecanismo de estado; la inferencia consiste en un producto escalar de tres dimensiones mas el sesgo.

Los datos de entrenamiento son sinteticos y se generan en `train.py` con la misma semilla que en la clase anterior del curso. El dataset contiene 200 registros, de los cuales 160 se destinan a entrenamiento y 40 a evaluacion. La funcion generadora es `precio = 1.5·m2 + 8·balcon + 12·ascensor + 20 + ruido`, con `m2` muestreado en el rango 35-120. Los pesos aprendidos (1,503 para `m2`; 8,719 para `balcon`; 11,988 para `ascensor`; intercepto 19,557) quedan muy proximos a los coeficientes teoricos, lo que evidencia que el ajuste recupera correctamente la estructura del generador. No se emplea RLHF, DPO ni ninguna tecnica de alineacion; tampoco hay decodificacion especulativa ni innovaciones de atencion, al no existir componente secuencial.

## Capacidades

- Prediccion de una variable continua (`precio` en miles de US$) a partir de tres caracteristicas tabulares.
- Inferencia por producto escalar: coste computacional despreciable y latencia en el orden de microsegundos por registro.
- Interpretabilidad completa: los coeficientes son directamente legibles como incrementos marginales de precio (unos US$ 1.500 por m², US$ 8.700 por balcon, US$ 12.000 por ascensor).
- Evaluacion reproducible sobre un split fijo de 40 registros.
- Carga y ejecucion mediante `joblib` y `pandas`, con integracion directa en pipelines de scikit-learn.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.
- No dispone de capacidades multilingues en sentido estricto: no procesa lenguaje natural.

## Casos de uso

- Docencia de regresion lineal: sirve como ejemplo ejecutable en clase para mostrar el ajuste por minimos cuadrados, la lectura de coeficientes y la diferencia entre entrenamiento y evaluacion sobre un split reservado.
- Demostracion del ciclo de publicacion de modelos: el repositorio incluye `train.py`, `predict.py`, `requirements.txt` y model card, de modo que el alumnado replica el flujo completo desde el entrenamiento hasta la descarga desde el Hub con `hf_hub_download`.
- Practica de evaluacion de modelos: permite calcular e interpretar MAE (3,08 miles de US$) y R² (0,989) sobre datos no vistos, y discutir por que un R² alto en datos sinteticos no implica generalizacion a datos reales.
- Ilustracion de interpretabilidad de coeficientes: se puede contrastar cada peso aprendido con el coeficiente teorico del generador para verificar la recuperacion de parametros.
- Ejemplo de serializacion y riesgos de `pickle`: el artefacto `model.joblib` sirve para explicar por que no deben cargarse ficheros de fuentes no confiables y por que conviene fijar la version de scikit-learn.
- Integracion en un pipeline didactico de scikit-learn: el modelo puede encadenarse con un `StandardScaler` o un `Pipeline` para mostrar preprocesamiento, aunque en este caso el escalado no es necesario.
- Prueba de infraestructura de despliegue: por su tamano minimo, es util para validar un endpoint de inferencia tabular (FastAPI, BentoML) sin coste de GPU.

## Benchmarks y rendimiento

Los unicos resultados publicados son las metricas de evaluacion sobre los 40 registros de test del propio dataset sintetico.

| Metrica | Resultado | Conjunto |
|---|---|---|
| MAE | 3,08 miles de US$ | 40 registros sinteticos de test |
| R² | 0,989 | 40 registros sinteticos de test |

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni ninguna otra prueba estandar, ya que el modelo no es un modelo de lenguaje y no aborda esas tareas. La comparacion con modelos fundacionales carece de sentido en estos terminos.

## Requisitos de hardware

- VRAM: no requiere GPU; el artefacto ocupa 0.0 GB y reside por completo en memoria principal.
- GPU recomendadas: ninguna. Cualquier CPU moderna es suficiente; una GPU no aporta ventaja medible.
- Cabe en cualquier equipo, incluidos entornos de 512 MB de RAM y contenedores minimos.
- Despliegue: directamente con Python y `joblib`; tambien puede servirse mediante FastAPI, Flask, BentoML o integrarse en un `Pipeline` de scikit-learn. No aplican vLLM, llama.cpp, Ollama ni TGI, que estan disenados para modelos de lenguaje.
- Latencia y throughput: no se publican mediciones. Por la naturaleza del calculo (producto escalar de tres dimensiones), la latencia por registro es del orden de microsegundos y el throughput esta limitado por el sobrecoste de serializacion y E/S, no por el modelo.
- Dependencias: `scikit-learn`, `joblib`, `pandas` y `huggingface_hub` para la descarga; conviene fijar la version de scikit-learn a la usada en el entrenamiento.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `grisselblanco/Clase_11_sklearn-regresion` | Regresion lineal multiple (tabular) | 3 coeficientes + intercepto | no aplica | MIT | Hugging Face Hub |
| `sklearn.linear_model.LinearRegression` (referencia de la libreria) | Implementacion generica de regresion lineal | depende de los datos | no aplica | BSD-3-Clause (scikit-learn) | PyPI, documentacion oficial |
| Regresion ridge / Lasso de scikit-learn | Regresion lineal regularizada | depende de los datos | no aplica | BSD-3-Clause (scikit-learn) | PyPI, documentacion oficial |

La comparacion relevante no es con otros modelos publicados en el Hub, sino con las alternativas de la propia familia de modelos lineales de scikit-learn (ridge, Lasso, ElasticNet), que anaden regularizacion L2/L1 para mitigar sobreajuste y colinealidad. Para este dataset sintetico con 160 registros y 3 caracteristicas, la regresion lineal sin regularizacion es adecuada y no se espera una mejora apreciable con variantes regularizadas. No se dispone de otros artefactos publicados equivalentes con los que comparar directamente.

## Limitaciones y advertencias

- Fines exclusivamente educativos: los datos son sinteticos y no representan precios inmobiliarios reales; no debe usarse para ninguna decision economica.
- Rango de validez restringido: solo conoce viviendas de 35 a 120 m²; fuera de ese intervalo extrapola la recta sin garantia de acierto.
- Supuesto de aditividad estricta: no captura interacciones ni efectos no lineales (por ejemplo, que el ascensor valga mas en edificios altos), ni variables relevantes como ubicacion, antiguedad o estado de conservacion.
- Riesgo de alucinacion: no aplica en el sentido habitual, pero el modelo puede producir predicciones arbitrariamente erroneas fuera del dominio de entrenamiento sin ninguna senal de incertidumbre.
- Sesgos: no se documentan sesgos demograficos porque no hay datos de personas; el sesgo relevante es el del generador sintetico, que impone una relacion lineal fija.
- Seguridad de carga: `joblib` usa `pickle`, de modo que cargar un `.joblib` de una fuente no confiable puede ejecutar codigo arbitrario. Carguese unicamente desde repositorios verificados.
- Compatibilidad de versiones: la version de scikit-learn en inferencia deberia coincidir con la de entrenamiento para evitar incompatibilidades de deserializacion o cambios de comportamiento.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero el uso comercial del artefacto no esta respaldado por datos reales ni por validacion fuera del dominio sintetico.
- Sin mantenimiento documentado: 0 descargas y 0 likes en el momento de la consulta; no hay garantia de actualizaciones ni de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/grisselblanco/Clase_11_sklearn-regresion
- Documentacion de `sklearn.linear_model`: https://sklearn.org/stable/api/sklearn.linear_model.html
- Guia de usuario de modelos lineales de scikit-learn: https://scikit-learn.org/stable/modules/linear_model.html
- Documentacion de `joblib` para persistencia de modelos: https://joblib.readthedocs.io/en/stable/persistence.html
- Documentacion de `huggingface_hub` (`hf_hub_download`): https://huggingface.co/docs/huggingface_hub/guides/download
