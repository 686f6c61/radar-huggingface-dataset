# K-B21/regresion-casas-sklearn

## Resumen

`K-B21/regresion-casas-sklearn` es un modelo de regresion lineal multiple entrenado con scikit-learn que predice el precio de una vivienda en miles de dolares estadounidenses a partir de tres variables tabulares: superficie en metros cuadrados (`m2`), presencia de balcon (`balcon`) y presencia de ascensor (`ascensor`). Lo publica el usuario K-B21 con fines pedagogicos para el IFTS N.º 18, con docencia de Cynthia M. Villagra, y su proposito explicito es ilustrar el ciclo completo de un modelo supervisado: generacion de datos, entrenamiento, evaluacion y publicacion en el Hub.

No es un modelo de lenguaje ni una red neuronal: es un artefacto serializado en formato `joblib` que contiene los coeficientes de una regresion por minimos cuadrados ordinarios. El repositorio ocupa 0,0 GB y no registra descargas ni likes en el momento de la consulta. Su interes es formativo, no productivo: sirve como ejemplo minimo reproducible de como se documenta y se comparte un modelo tabular.

La relevancia practica es acotada y deliberadamente limitada. Resulta util como material docente para introducir conceptos de regresion, overfitting controlado mediante particion train/test, interpretabilidad de coeficientes y riesgos de seguridad al cargar artefactos `pickle`, pero no debe emplearse para valoracion inmobiliaria real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion lineal multiple (minimos cuadrados ordinarios, `sklearn.linear_model.LinearRegression`) |
| Parametros totales | 4 parametros aprendidos (3 coeficientes + 1 intercepto) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo tabular; entrada de 3 caracteristicas) |
| Tipos de cuantizacion | No disponible (no se contemplan cuantizaciones; pesos en coma flotante de doble precision por defecto de scikit-learn) |
| Idiomas soportados | Espanol (etiqueta `es`; el modelo no procesa texto, la marca es documental) |
| Licencia | MIT |
| Formato de pesos | `joblib` (serializacion basada en `pickle`) |

## Arquitectura y entrenamiento

El modelo implementa una regresion lineal multiple sin regularizacion, resuelta por minimos cuadrados ordinarios mediante `LinearRegression` de scikit-learn. La funcion aprendida es `precio = 1,503·m2 + 8,719·balcon + 11,988·ascensor + 19,557`, donde `precio` se expresa en miles de dolares. Los coeficientes recuperados quedan muy proximos a los usados en la generacion sintetica de los datos (`1,5`, `8`, `12` y `20` respectivamente), lo que confirma que el ajuste converge al modelo generador.

Los datos de entrenamiento son completamente sinteticos y se generan en `train.py` con semilla fija: 200 registros, de los cuales 160 se destinan a entrenamiento y 40 a evaluacion. Las entradas son `m2` (rango 35-120), `balcon` (binaria 0/1) y `ascensor` (binaria 0/1); la variable objetivo se construye con la ecuacion anterior mas ruido gaussiano aditivo cuya desviacion no se detalla en la informacion disponible. No hay fases de RLHF, DPO ni ajuste fino; el entrenamiento es un unico ajuste cerrado por algebra lineal.

## Capacidades

- Prediccion de una variable objetivo continua (precio en miles de USD) a partir de tres caracteristicas tabulares.
- Inferencia por lotes mediante `DataFrame` de pandas: admite multiples viviendas en una sola llamada a `predict`.
- Interpretabilidad directa de coeficientes: cada peso es un efecto marginal aditivo en las mismas unidades que la variable objetivo.
- Reproducibilidad completa: el script `train.py` regenera el modelo con la misma semilla y los mismos datos sinteticos.
- Carga desde el Hub mediante `hf_hub_download` y `joblib.load`.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.

## Casos de uso

- Docencia de aprendizaje supervisado: el modelo sirve para explicar en clase la diferencia entre entrenamiento y evaluacion, el significado de los coeficientes y el calculo de MAE y R² sobre un conjunto de prueba de 40 registros.
- Ejemplo minimo de publicacion en Hugging Face: util para ensenar el formato de una model card, el uso de `hf_hub_download` y la estructura de archivos (`model.joblib`, `train.py`, `predict.py`, `requirements.txt`).
- Demostracion de interpretabilidad de coeficientes: permite mostrar como un peso de 1,503 sobre `m2` se traduce en "cada metro cuadrado adicional suma unos 1.500 USD", ejercicio habitual en cursos introductorios de estadistica aplicada.
- Prueba de pipelines de inferencia tabular: integrable en un script de CI que valide que `predict.py` devuelve valores coherentes (por ejemplo, 148,5 miles de USD para 80 m² con balcon y sin ascensor).
- Ejemplo de gestion de riesgos con `pickle`: sirve para ilustrar por que no deben cargarse archivos `.joblib` de fuentes no confiables y como verificar la version de scikit-learn.
- Prototipo de API de valoracion simplificada: con un envoltorio FastAPI o Flask puede exponerse un endpoint que reciba `m2`, `balcon` y `ascensor` y devuelva una estimacion, siempre con caracter demostrativo y no comercial.

## Benchmarks y rendimiento

Los unicos datos de evaluacion publicados en la model card son los siguientes, medidos sobre 40 viviendas sinteticas no vistas durante el entrenamiento:

| Metrica | Resultado |
|---|---|
| MAE | 3,08 miles de USD |
| R² | 0,989 |

No se han publicado resultados frente a benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo de regresion tabular de este tipo.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo ocupa unos pocos kilobytes y se ejecuta en CPU.
- GPU recomendadas: ninguna. Cualquier CPU x86 o ARM es suficiente.
- Cabe en cualquier equipo consumer, incluidos Raspberry Pi y entornos serverless de capa gratuita.
- Despliegue: script Python con `scikit-learn` y `joblib`; opcionalmente un endpoint FastAPI, Flask o similar. No aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no publicados; por la naturaleza del modelo (una multiplicacion matricial de 3 caracteristicas) la latencia es del orden de microsegundos a milisegundos por lote, dominada por la sobrecarga de Python y pandas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| K-B21/regresion-casas-sklearn | Regresion lineal (sklearn) | 4 | No aplica | MAE 3,08; R² 0,989 (datos sinteticos) | MIT | Hugging Face |
| Regresion ridge o Lasso (sklearn) | Regresion lineal regularizada | Depende del numero de caracteristicas | No aplica | No disponible | BSD-3 (scikit-learn) | PyPI |
| XGBoost / LightGBM (regresion tabular) | Gradient boosting | Depende de hiperparametros | No aplica | No disponible | Apache 2.0 / MIT | PyPI |

No se dispone de comparaciones publicadas del modelo frente a alternativas sobre el mismo conjunto de datos. Cualquier comparacion cuantitativa requeriria reentrenar las alternativas sobre el dataset sintetico, que no se distribuye como fichero independiente en el repositorio.

## Limitaciones y advertencias

- Uso exclusivamente educativo: los datos son sinteticos y no representan precios inmobiliarios reales.
- Rango de validez restringido a viviendas de 35 a 120 m²; fuera de ese intervalo el modelo extrapola una recta sin garantia de acierto.
- Supone efectos aditivos y constantes: no captura interacciones entre caracteristicas (por ejemplo, que el ascensor valga mas en edificios altos) ni no linealidades.
- Solo contempla tres variables; omite ubicacion, antiguedad, estado de conservacion y cualquier otro factor relevante en valoracion real.
- Riesgo de seguridad: `joblib` se apoya en `pickle`, de modo que cargar un `.joblib` de una fuente no confiable puede ejecutar codigo arbitrario.
- Compatibilidad de versiones: debe cargarse con la misma version de scikit-learn con la que se entreno para evitar avisos o fallos de deserializacion.
- Sin sesgos demograficos conocidos por la naturaleza de las variables, pero el modelo no ha sido auditado y su aplicacion fuera del aula no esta justificada.
- La licencia MIT permite uso comercial, pero la ausencia de validez predictiva sobre datos reales desaconseja cualquier despliegue productivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/K-B21/regresion-casas-sklearn
- Documentacion de `LinearRegression` de scikit-learn: https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LinearRegression.html
- Documentacion de `joblib` para persistencia de modelos: https://joblib.readthedocs.io/en/stable/persistence.html
- Documentacion de `huggingface_hub` (`hf_hub_download`): https://huggingface.co/docs/huggingface_hub/guides/download
