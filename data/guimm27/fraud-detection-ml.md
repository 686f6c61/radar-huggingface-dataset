# GuiMM27/fraud-detection-ml

## Resumen

`GuiMM27/fraud-detection-ml` es un clasificador tabular binario orientado a la deteccion de fraude en tarjetas de credito, publicado en Hugging Face por el usuario GuiMM27. No se trata de un modelo de lenguaje ni de una red neuronal profunda: es un artefacto de `scikit-learn` serializado con `joblib` que encapsula un pipeline de preprocesamiento y un clasificador de regresion logistica, entrenado sobre el dataset publico ULB/Kaggle de fraudes con tarjeta. El autor lo presenta explicitamente como material educativo de Machine Learning Engineering, no como un sistema financiero validado.

El modelo resuelve un problema de clasificacion tabular con fuerte desbalance de clases (deteccion de eventos raros): recibe 30 variables numericas (`Time`, `V1` a `V28` y `Amount`) y devuelve un score entre 0 y 1 junto con una clase binaria segun un umbral fijado durante la validacion. Su relevancia es limitada y acotada al ambito docente: sirve como ejemplo reproducible de particion cronologica, seleccion por PR-AUC y ajuste de umbral por F1, pero no aporta capacidad generativa, contexto, tool calling ni ninguna de las prestaciones asociadas a los modelos fundacionales.

El repositorio tiene un tamano registrado de 0.0 GB, cero descargas y cero likes en el momento de la consulta, y la licencia no esta declarada. La model card esta redactada en portugues y advierte de que el score devuelto por `predict_proba` no es una probabilidad de fraude calibrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de `scikit-learn` con clasificador de regresion logistica (no disponible el detalle de los pasos de preprocesamiento) |
| Parametros totales | no disponible (modelo lineal; el numero de coeficientes depende de las features transformadas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificacion tabular; entrada fija de 30 variables) |
| Tipos de cuantizacion | no disponible (no se distribuyen pesos en formatos cuantizados; artefacto `joblib`) |
| Idiomas soportados | portugues (etiqueta `language: pt`); el modelo no procesa texto, la etiqueta es declarativa |
| Licencia | no disponible |
| Formato de pesos | `joblib` (serializacion Python/pickle); el artefacto es un diccionario con `pipeline`, `threshold` y `features` |

## Arquitectura y entrenamiento

La arquitectura es un pipeline clasico de aprendizaje automatico supervisado sobre datos tabulares, no un transformer ni un modelo secuencial. El artefacto `fraud_model.joblib` contiene un diccionario con tres claves: `pipeline` (preprocesamiento mas estimador), `threshold` (umbral de decision) y `features` (orden esperado de las variables). El estimador seleccionado es una regresion logistica, segun indica el titulo de la model card.

El entrenamiento se realizo sobre el dataset publico ULB/Kaggle de fraude con tarjeta de credito, con una division cronologica aproximada de 60% entrenamiento, 20% validacion y 20% test. La seleccion del modelo se hizo por PR-AUC (Average Precision) sobre validacion y el umbral se fijo maximizando F1 en validacion, con un valor resultante de 0.999986. El conjunto de test se reservo para la evaluacion final. Se auditaron duplicados pero no se eliminaron automaticamente. No se documenta el numero de tokens (no aplica), la composicion exacta del dataset ni si hubo calibracion posterior del score; el autor advierte que no la hay. La version de `scikit-learn` registrada en el entorno de entrenamiento es 1.9.1, dato relevante para reproducibilidad por posibles incompatibilidades de serializacion.

## Capacidades

- Clasificacion binaria tabular de transacciones descritas por 30 variables numericas (`Time`, `V1` a `V28`, `Amount`).
- Salida de un score continuo entre 0 y 1 mediante `predict_proba` y una clase binaria aplicando el umbral almacenado (`score >= threshold`).
- Deteccion de eventos raros en datos fuertemente desbalanceados, con enfasis en mantener precision alta a costa de recall moderado.
- Integracion sencilla en pipelines de Python via `joblib.load` y llamada al metodo de prediccion del pipeline.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues reales: no procesa lenguaje natural.
- No dispone de modo thinking, vision, audio ni generacion de texto.

## Casos de uso

- Docencia y formacion en Machine Learning Engineering: reproduce de extremo a extremo un flujo de trabajo con particion cronologica, seleccion por PR-AUC y ajuste de umbral por F1, usando el dataset publico de ULB/Kaggle y los scripts `python -m src.train` y `python -m src.diagnostics`.
- Benchmark de referencia para deteccion de eventos raros: permite comparar tecnicas de remuestreo, modelos alternativos o calibracion de scores contra una linea base documentada con metricas concretas en test (PR-AUC 0.7436, F1 0.7812).
- Prototipado de un servicio de scoring offline: el artefacto se puede cargar en un script o API interna para etiquetar lotes de transacciones historicas y observar el comportamiento del umbral 0.999986 sobre datos propios, siempre con fines exploratorios.
- Analisis de sensibilidad al umbral: al exponer `predict_proba`, permite estudiar el compromiso precision-recall variando el umbral sobre el conjunto de validacion o test, util en asignaturas de evaluacion de clasificadores desbalanceados.
- Integracion en cuadernos de analisis de fraude: combinado con el repositorio GitHub del autor (dashboard de analisis de datos de fraude), sirve como pieza de scoring dentro de un flujo de visualizacion y diagnostico.
- Ejercicio de auditoria de artefactos: el checksum SHA-256 publicado y la advertencia sobre pickle permiten practicar verificacion de integridad y analisis de riesgos de deserializacion en entornos controlados.

## Benchmarks y rendimiento

Resultados publicados por el autor en el conjunto de test (75 fraudes reales):

| Metrica | Resultado |
|---|---:|
| PR-AUC (Average Precision) | 0.7436 |
| Precision | 0.9434 |
| Recall | 0.6667 |
| F1 | 0.7812 |
| Verdaderos positivos (TP) | 50 |
| Falsos positivos (FP) | 3 |
| Falsos negativos (FN) | 25 |
| Verdaderos negativos (TN) | 56884 |
| Umbral fijado en validacion | 0.999986 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo es un pipeline lineal de `scikit-learn` que se ejecuta en CPU.
- GPU recomendadas: no aplica; no requiere GPU. Cualquier CPU x86-64 o ARM moderna es suficiente.
- Cabe en GPU consumer: si, aunque no es necesario; el artefacto ocupa 0.0 GB segun el repositorio y el modelo lineal es de orden de kilobytes a pocos megabytes.
- Opciones de despliegue: carga directa con `joblib.load` en Python, servicio con FastAPI o Flask, o integracion en pipelines de `scikit-learn`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponible; no se publican mediciones. En la practica, la inferencia de una regresion logistica sobre 30 features es del orden de microsegundos a milisegundos por registro en CPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros modelos comparables de deteccion de fraude tabular ni datos de rendimiento de alternativas. Como referencia cualitativa, la literatura de deteccion de fraude con tarjeta sobre el dataset ULB/Kaggle suele emplear bosques aleatorios, gradient boosting (XGBoost, LightGBM) y redes neuronales, pero no se dispone de resultados verificables en esta ficha para establecer una comparacion numerica.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `GuiMM27/fraud-detection-ml` | no disponible (lineal) | no aplica | PR-AUC 0.7436 (test) | no disponible | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo educativo: el autor declara explicitamente que no es un sistema financiero validado para uso real y que no debe emplearse para bloqueo de tarjetas ni decisiones financieras.
- Sesgo de dominio: entrenado sobre un unico dataset historico de una institucion; no validado prospectivamente ni sobre datos de otra entidad. La generalizacion no esta garantizada.
- Calibracion: el score de `predict_proba` no es una probabilidad de fraude calibrada, por lo que no debe interpretarse como tal en decisiones de negocio.
- Variables anonimizadas: `V1` a `V28` son componentes transformadas sin significado interpretable, `Time` es tiempo relativo en segundos y `Amount` no especifica moneda, lo que limita la trazabilidad y la explicabilidad.
- Desbalance extremo: con 75 fraudes en test, las metricas tienen alta varianza; un recall de 0.6667 implica 25 fraudes no detectados en ese conjunto.
- Seguridad de deserializacion: el artefacto usa `joblib`/pickle; solo debe cargarse desde origenes confiables. El autor incluye un checksum SHA-256 (`ae41702531a66236a35a7209001f5747748788943016f42e2823b9ad72c34a4c`) para verificacion de integridad.
- Reproducibilidad fragil: requiere `scikit-learn` 1.9.1 segun el entorno de entrenamiento; otras versiones pueden fallar al deserializar o alterar el comportamiento.
- Licencia no declarada: no hay autorizacion explicita para uso comercial ni para redistribucion de derivados; el autor remite a las condiciones de la fuente original del dataset.
- Datos no redistribuidos: el CSV original no se incluye en el repositorio; debe obtenerse directamente en Kaggle.
- Idioma: la model card esta en portugues y la etiqueta de idioma es declarativa; no hay soporte real de procesamiento de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GuiMM27/fraud-detection-ml
- Repositorio GitHub del autor: https://github.com/GuiMM27/Dashboard-Pessoal-Analise-de-Dados-Fraude-
- Dataset original ULB/Kaggle: https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud
