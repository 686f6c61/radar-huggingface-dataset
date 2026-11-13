# guilhermedaros/credit-card-fraud-rf

## Resumen

`guilhermedaros/credit-card-fraud-rf` es un clasificador tabular de deteccion de fraude en tarjetas de credito publicado en Hugging Face por el usuario guilhermedaros. No es un modelo de lenguaje ni una red neuronal: es un `RandomForestClassifier` de scikit-learn serializado con joblib, entrenado sobre el dataset publico `mlg-ulb/creditcardfraud` de Kaggle (284.807 transacciones de tarjetas europeas de septiembre de 2013, con 492 fraudes, un 0,17 % del total). El problema que aborda es la clasificacion binaria en regimen de desbalance extremo, donde la exactitud es una metrica enganosa (predecir siempre "legitimo" da un 99,8 %).

El autor lo describe explicitamente como un proyecto personal de aprendizaje y no como un sistema de produccion. Los hiperparametros se ajustaron con Optuna (TPE, semilla fija) maximizando PR-AUC mediante predicciones out-of-fold con validacion cruzada estratificada de 3 folds, y el umbral de decision se eligio maximizando F1 sobre probabilidades out-of-fold de 5 folds, nunca sobre el conjunto de test. El modelo final usa `n_estimators=117`, `max_depth=22`, `min_samples_leaf=7`, `max_features=0.3` y `class_weight="balanced_subsample"`.

Su relevancia es acotada pero real: sirve como referencia reproducible y bien documentada de un pipeline clasico de deteccion de fraude con datos tabulares anonimizados por PCA, con una PR-AUC de 0,854 en test, muy por encima del baseline aleatorio (0,0017). No compite con modelos fundacionales; compite con otros clasificadores tabulares en el mismo dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest (scikit-learn `RandomForestClassifier`), ensemble de arboles de decision con bagging |
| Parametros totales | no disponible (no es una red neuronal; el bundle contiene 117 arboles con `max_depth=22`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, sin ventana de contexto) |
| Tipos de cuantizacion | no aplica; el artefacto se distribuye como `model.joblib` (pickle) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | `model.joblib` (serializacion pickle de scikit-learn, cargada con `joblib.load`) |

## Arquitectura y entrenamiento

El modelo es un Random Forest clasico: 117 estimadores de arboles de decision entrenados con bagging, profundidad maxima 22, minimo de 7 muestras por hoja, `max_features=0.3` (fraccion de caracteristicas evaluadas por split) y ponderacion de clases `balanced_subsample`, que recalcula los pesos de clase en cada bootstrap para compensar el desbalance sin resampling. Las caracteristicas de entrada son 30: `V1`-`V28` (componentes PCA del dataset original, sin transformar), `Amount_log = log1p(Amount)` y `Hour = (Time // 3600) % 24`, ambas derivadas solo de la propia fila, sin fuga de informacion.

El entrenamiento sigue un protocolo cuidado para un proyecto de este tipo: split estratificado 80/20 con semilla fija, test reservado para una unica evaluacion final, ajuste de hiperparametros con Optuna (TPE, semilla fija, espacio `n_estimators` 100-400, `max_depth` 6-24, `min_samples_leaf` 1-10, `max_features` en {`sqrt`, `log2`, 0.3}) maximizando PR-AUC sobre predicciones out-of-fold de 3 folds, y seleccion del umbral maximizando F1 sobre out-of-fold de 5 folds. No hay RLHF, DPO ni entrenamiento por refuerzo: es aprendizaje supervisado estandar sobre datos etiquetados. El autor advierte que solo se ejecutaron 3 trials de Optuna, por lo que los resultados son preliminares.

## Capacidades

- Clasificacion binaria tabular: distingue transacciones fraudulentas (`Class=1`) de legitimas (`Class=0`) a partir de 30 caracteristicas numericas.
- Estimacion de probabilidad calibrada de forma laxa: `predict_proba` devuelve una probabilidad de fraude que se compara con un umbral configurable (0,4525 en el bundle publicado).
- Manejo nativo de desbalance extremo mediante `class_weight="balanced_subsample"`, sin necesidad de SMOTE ni submuestreo.
- Umbral de decision ajustable: permite mover el punto de operacion entre precision y recall segun el coste relativo de falsos positivos y falsos negativos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No procesa texto, imagenes, audio ni secuencias; la entrada es exclusivamente un vector de 30 caracteristicas numericas en el orden definido por `bundle["features"]`.

## Casos de uso

- Deteccion de fraude en tiempo real en pasarelas de pago: el modelo evalua cada transaccion con las 30 caracteristicas derivadas (componentes PCA, logaritmo del importe y hora del dia) y devuelve una probabilidad; con un umbral bajo se prioriza recall para bloquear preventivamente y con uno alto se reduce la friccion al cliente. La latencia de inferencia de un Random Forest de 117 arboles es del orden de milisegundos en CPU.
- Scoring por lotes para revision antifraude: procesar el cierre diario de transacciones y ordenar por probabilidad para que el equipo de riesgo revise primero los casos mas sospechosos, usando el umbral de 0,4525 como punto de partida.
- Sistema de alertas con presupuesto de falsos positivos: si el equipo de operaciones solo puede investigar N casos al dia, se puede fijar el umbral para que el numero esperado de falsos positivos encaje en ese presupuesto, dado que el modelo permite recolocar el punto de operacion sin reentrenar.
- Prototipo academico y comparativa de metodos: sirve como baseline reproducible frente a modelos mas complejos (XGBoost, LightGBM, redes tabulares) sobre el mismo dataset, con PR-AUC 0,854 como referencia.
- Ensenanza de pipelines con desbalance: el repositorio incluye notebooks de exploracion y modelado, tests con pytest y scripts de entrenamiento, evaluacion y publicacion, utiles como material didactico de buenas practicas (test reservado, umbral elegido por CV, metrica adecuada).
- Filtro de segunda capa en un sistema de reglas: combinar reglas heuristicas de negocio con la probabilidad del modelo para reducir falsos positivos de las reglas, usando el modelo solo en la franja de importes o horas donde las reglas son ambiguas.

## Benchmarks y rendimiento

Evaluacion sobre el conjunto de test reservado: 56.962 transacciones, 98 de ellas fraudulentas (tasa de fraude 0,0017). Resultados preliminares segun el autor (solo 3 trials de Optuna).

| Metrica | Valor |
|---|---|
| PR-AUC (average precision) | 0,854 |
| Baseline aleatorio (tasa de fraude) | 0,0017 |

Rendimiento del Random Forest en dos umbrales:

| Umbral | Precision | Recall | F1 | TP | FP | FN | TN |
|---|---|---|---|---|---|---|---|
| 0,5 (por defecto) | 0,833 | 0,816 | 0,825 | 80 | 16 | 18 | 56.848 |
| 0,4525 (elegido por CV) | 0,822 | 0,847 | 0,834 | 83 | 18 | 15 | 56.846 |

En el umbral elegido, el modelo detecta 83 de los 98 fraudes y genera 18 falsas alarmas sobre 56.864 transacciones legitimas. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo se ejecuta en CPU. Un Random Forest de 117 arboles con profundidad 22 ocupa del orden de decenas a pocos cientos de MB en memoria, aunque el tamano exacto no se especifica en la informacion disponible.
- GPU recomendadas: no aplica; scikit-learn no aprovecha GPU para Random Forest.
- Cabe en cualquier maquina consumer: un portatil convencional o una instancia pequena de nube es suficiente para inferencia.
- Opciones de despliegue: carga directa con `joblib.load` en Python, servicio HTTP con FastAPI o Flask envolviendo `predict_proba`, o exportacion a otros runtimes si se reimplementan los arboles. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no se publican mediciones. Por la naturaleza del modelo (arboles de profundidad 22, 117 estimadores, 30 caracteristicas) se espera latencia de milisegundos por muestra en CPU, pero es una estimacion, no un dato del autor.

## Comparativa con modelos similares

No se han publicado comparaciones con otros modelos en la informacion disponible. Como referencia contextual, sobre el mismo dataset `mlg-ulb/creditcardfraud` se suelen usar clasificadores tabulares como XGBoost, LightGBM o regresion logistica, pero esta ficha no dispone de resultados de esos modelos medidos por el autor, por lo que no se ofrece tabla comparativa con cifras.

| Aspecto | Este modelo | Alternativas (XGBoost, LightGBM, regresion logistica) |
|---|---|---|
| Parametros | 117 arboles, profundidad 22 | no disponible |
| Contexto | no aplica | no aplica |
| PR-AUC en test | 0,854 | no disponible |
| Licencia | MIT | depende de cada proyecto |
| Disponibilidad | Hugging Face, `model.joblib` | no disponible |

## Limitaciones y advertencias

- Proyecto de aprendizaje, no sistema de produccion: el propio autor lo declara y advierte que los resultados son preliminares (solo 3 trials de Optuna).
- Riesgo de seguridad al cargar el modelo: `model.joblib` es un pickle y cargarlo puede ejecutar codigo arbitrario; solo debe cargarse desde fuentes de confianza.
- Dependencia de version de scikit-learn: el bundle requiere una version compatible (ver `requirements.txt` del repositorio); versiones distintas pueden fallar al deserializar.
- Datos de 2013 y de tarjetas europeas: los patrones de fraude han cambiado y la distribucion de las componentes PCA puede no transferir a otros mercados, emisores o periodos; no hay validacion fuera de muestra temporal.
- Las caracteristicas `V1`-`V28` son componentes PCA anonimizadas: no se puede auditar que informacion contienen ni aplicar interpretabilidad directa sobre las variables originales.
- Sesgos no evaluados: no se han publicado analisis de equidad por segmento, pais, importe o tipo de comercio; el dataset no incluye esas variables.
- Sin capacidad de generalizacion a otros dominios: el modelo solo predice sobre el esquema exacto de 30 columnas (`Time`, `V1`-`V28`, `Amount`) y fallara o dara resultados invalidos con otro esquema.
- Falsos positivos no triviales: 18 falsas alarmas sobre 56.864 legitimas en test; en produccion esto implica friccion para clientes legitimos y coste operativo de revision.
- Sin soporte de texto, vision, audio ni agentes: no es un modelo fundacional y no debe evaluarse como tal.
- Licencia MIT para el codigo y los pesos, pero el dataset original esta bajo Database Contents License (DbCL) v1.0 y no se incluye en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guilhermedaros/credit-card-fraud-rf
- Dataset en Kaggle: https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud
- Licencia del dataset (DbCL v1.0): https://opendatacommons.org/licenses/dbcl/1-0/
- Paper de referencia del dataset: Andrea Dal Pozzolo, Olivier Caelen, Reid A. Johnson and Gianluca Bontempi, "Calibrating Probability with Undersampling for Unbalanced Classification", IEEE CIDM 2015.
- Repositorio de codigo, notebooks y scripts: referenciado en la model card como estructura del proyecto (`src/train.py`, `src/evaluate.py`, `src/publish.py`, `notebooks/`), sin URL publica indicada en la informacion disponible.
