# amandaodoo/regresion-casas-sklearn

## Resumen

`amandaodoo/regresion-casas-sklearn` es un modelo de regresion lineal multiple entrenado con scikit-learn para predecir el precio de una vivienda en miles de dolares estadounidenses a partir de tres variables tabulares: superficie en metros cuadrados (`m2`), presencia de balcon (`balcon`) y presencia de ascensor (`ascensor`). No es una red neuronal ni un transformer: es un estimador clasico de minimos cuadrados ordinarios serializado con `joblib`, publicado como ejemplo pedagogico para el IFTS N.º 18 con la docente Cynthia M. Villagra.

El modelo no resuelve un problema de produccion real. Su valor es didactico: muestra de forma completa el ciclo de vida de un modelo supervisado (generacion de datos, entrenamiento, evaluacion en hold-out y publicacion en el Hub de Hugging Face). Los datos son sinteticos, generados mediante la formula `precio = 1,5·m2 + 8·balcon + 12·ascensor + 20 + ruido`, con 200 registros totales (160 de entrenamiento y 40 de evaluacion).

Es relevante unicamente como referencia educativa sobre como empaquetar y documentar un modelo tabular minimo. No compite con modelos de lenguaje ni con sistemas de valoracion inmobiliaria reales, y su uso en cualquier contexto distinto de la docencia seria inapropiado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion lineal multiple (minimos cuadrados ordinarios, `sklearn.linear_model.LinearRegression`) |
| Parametros totales | 4 parametros aprendidos (3 pesos + 1 intercepto) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo tabular, sin contexto secuencial) |
| Tipos de cuantizacion | No disponible (no aplica; pesos en punto flotante de doble precision por defecto de scikit-learn) |
| Idiomas soportados | Espanol (documentacion y model card); el modelo en si no procesa texto |
| Licencia | MIT |
| Formato de pesos | `joblib` (serializacion basada en pickle) |

## Arquitectura y entrenamiento

La arquitectura es un modelo lineal de la forma `y = w1·m2 + w2·balcon + w3·ascensor + b`, ajustado por minimos cuadrados ordinarios sobre 160 muestras sinteticas. No hay capas ocultas, funciones de activacion, atencion ni mecanismo de descodificacion. Los pesos aprendidos son: 1,503 para `m2`, 8,719 para `balcon`, 11,988 para `ascensor` y un intercepto de 19,557, valores muy proximos a los coeficientes usados en la generacion de los datos (1,5, 8, 12 y 20 respectivamente).

El dataset de entrenamiento es sintetico y reproducible: se genera con la misma semilla que el material de la Clase 10 del curso. Las variables de entrada cubren `m2` en el rango de 35 a 120, y `balcon` y `ascensor` como variables binarias. La variable objetivo es `precio` en miles de USD, con ruido anadido. No se aplico RLHF, DPO, regularizacion, ingenieria de caracteristicas ni validacion cruzada; el unico esquema de evaluacion es una particion fija 160/40.

No hay innovaciones tecnicas destacables. El interes del artefacto reside en la trazabilidad: el repositorio incluye `train.py` (codigo de entrenamiento), `predict.py` (ejemplo de inferencia), `requirements.txt` (dependencias) y la model card, lo que permite reproducir el resultado de extremo a extremo.

## Capacidades

- Prediccion de una variable objetivo continua (regresion) a partir de tres caracteristicas tabulares numericas.
- Inferencia por lotes mediante `pandas.DataFrame` con las columnas `m2`, `balcon` y `ascensor`.
- Serializacion y carga via `joblib` y `huggingface_hub.hf_hub_download`.
- Reproducibilidad completa del entrenamiento a partir del codigo publicado.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues, de vision, audio ni modo de razonamiento extendido.
- No procesa texto libre ni datos no estructurados.

## Casos de uso

- Docencia de aprendizaje supervisado: sirve como ejemplo minimo y reproducible para explicar que es un modelo entrenado, que se guarda en disco y como se documenta en una model card. Es su proposito declarado.
- Demostracion del flujo de publicacion en Hugging Face Hub: permite mostrar a estudiantes como subir un artefacto `joblib` con metadatos, licencia y pipeline tag correctos.
- Ejercicio de evaluacion de modelos de regresion: el par MAE/R² sobre un hold-out de 40 muestras sirve para introducir la interpretacion de metricas de regresion.
- Practica de interpretabilidad de coeficientes: los pesos aprendidos pueden compararse con los coeficientes generadores para ilustrar la recuperacion de parametros en modelos lineales.
- Ejemplo de inferencia tabular con pandas: el snippet de `predict.py` demuestra como construir un DataFrame de entrada y llamar a `predict`.
- Caso de estudio sobre riesgos de `pickle`/`joblib`: el propio modelo sirve para explicar por que no deben cargarse artefactos serializados de fuentes no confiables.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de evaluacion (40 muestras no vistas durante el entrenamiento):

| Metrica | Resultado |
|---|---|
| MAE | 3,08 miles de USD |
| R² | 0,989 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo ocupa unos pocos kilobytes en memoria y se ejecuta en CPU.
- GPU recomendadas: ninguna; cualquier CPU es suficiente.
- Cabe en cualquier GPU consumer, pero no la aprovecha.
- Opciones de despliegue: ejecucion directa con Python + scikit-learn + joblib; no es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no publicados; para un modelo lineal de tres caracteristicas la inferencia es del orden de microsegundos por muestra en CPU, aunque no se dispone de mediciones oficiales.
- Requisito critico: la version de scikit-learn en inferencia debe coincidir con la usada en entrenamiento para evitar incompatibilidades de deserializacion.

## Comparativa con modelos similares

No disponible. No se han proporcionado modelos comparables en la informacion recibida. Cualquier regresion lineal equivalente entrenada con scikit-learn sobre los mismos datos seria funcionalmente identica; las diferencias relevantes serian de documentacion y empaquetado, no de rendimiento.

## Limitaciones y advertencias

- Los datos son sinteticos: el modelo no representa precios inmobiliarios reales y no debe usarse para valoraciones reales.
- Solo es valido para superficies entre 35 y 120 m²; fuera de ese rango extrapola linealmente sin garantias.
- Asume efectos aditivos y constantes: no captura interacciones entre caracteristicas (por ejemplo, que el ascensor valga mas en edificios altos).
- Riesgo de seguridad: `joblib` usa pickle, por lo que cargar un `.joblib` de una fuente no confiable puede ejecutar codigo arbitrario.
- Dependencia estricta de la version de scikit-learn entre entrenamiento e inferencia.
- Sin validacion cruzada ni analisis de sesgos; con 200 muestras sinteticas no hay base para evaluar robustez estadistica.
- Licencia MIT: permite uso comercial, pero el caracter sintetico y educativo de los datos hace inapropiado cualquier uso en produccion.
- Sin mantenimiento ni soporte indicados por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amandaodoo/regresion-casas-sklearn
- Documentacion de scikit-learn (`LinearRegression`): https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LinearRegression.html
- Documentacion de joblib: https://joblib.readthedocs.io/
- Documentacion de `huggingface_hub.hf_hub_download`: https://huggingface.co/docs/huggingface_hub/guides/download
