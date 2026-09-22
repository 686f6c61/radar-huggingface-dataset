# bhumika-tewari-282006/ayurvedic-drug-discovery-affinity-model

## Resumen

El modelo `ayurvedic-drug-discovery-affinity-model` es un regresor RandomForest publicado en Hugging Face por el usuario bhumika-tewari-282006 (0 descargas y 0 likes en el momento de la consulta). No es un modelo de lenguaje: predice la afinidad de union proteina-ligando expresada como pKd a partir de un vector de 39 caracteristicas numericas. Forma parte del proyecto AI-Driven Computational Pipeline for Ayurvedic Drug Discovery (RCCIIT/MAKAUT Winter Project 2026) y se distribuye en formato joblib bajo licencia MIT.

El interes del artefacto es metodologico mas que de rendimiento. Se entrena exclusivamente con datos reales de PDBBind v2013-core (127 ejemplos de entrenamiento, 18 de validacion y 36 de test con particion por scaffolds de Bemis-Murcko y comprobacion de fuga por similitud de Tanimoto), descartando de forma explicita 14 complejos por fallos de parseo o scoring en lugar de sustituirlos por datos sinteticos. Las caracteristicas de docking provienen de ejecuciones reales de AutoDock Vina con `--score_only` sobre la pose cristalografica.

Los resultados son modestos y el propio autor los declara como tales: R² de 0,01 y MAE de 1,35 unidades de pKd en el conjunto de test, lo que sitúa al modelo apenas por encima de un predictor trivial basado en la media. Se trata, por tanto, de una herramienta de generacion de hipotesis computacionales, no de un predictor validado, y su uso en produccion exige asumir esa limitacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RandomForest (scikit-learn), regresor sobre 39 caracteristicas tabulares |
| Parametros totales | no disponible (no se publica el numero de arboles, profundidad ni numero de nodos) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo no generativo, no secuencial) |
| Tipos de cuantizacion | no aplica (no hay pesos neuronales; el artefacto es un objeto serializado con joblib) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | joblib (fichero `best_regressor.joblib`); el diccionario contiene las claves `model`, `scaler`, `feature_names` y `model_name` |
| Tamano del repositorio | 0,0 GB (inferior a 0,1 GB, segun Hugging Face) |
| Pipeline declarado | no disponible |
| Entradas | diccionario/array con 39 caracteristicas en el orden exacto definido por `backend/app/core/ml/features.py` |
| Salida | valor escalar continuo de pKd |
| Fecha de creacion | 2026-09-22 |
| Ultima actualizacion | 2026-09-22 |

## Arquitectura y entrenamiento

El modelo es un bosque aleatorio de regresion implementado con scikit-learn y serializado con joblib. No emplea redes neuronales, atencion ni mecanismos de mezcla de expertos. El pipeline completo consiste en un escalador (objeto `scaler` guardado junto al modelo) mas el bosque, y el consumidor debe aplicar el mismo orden de caracteristicas que se uso en entrenamiento.

El conjunto de datos es PDBBind v2013-core, con estructuras cristalograficas reales y afinidades medidas experimentalmente. La particion no es aleatoria: se realiza por scaffolds de Bemis-Murcko con una comprobacion de fuga basada en similitud de Tanimoto, lo que hace que las metricas de test sean mas representativas de un escenario de generalizacion a quimiotipos nuevos. Se documentan 127 ejemplos de entrenamiento, 18 de validacion y 36 de test, con 14 complejos excluidos por errores reales de parseo o de scoring (registrados, no reemplazados).

Las 39 caracteristicas se descomponen en 10 derivadas de docking (terminos energeticos reales de AutoDock Vina `--score_only` sobre la pose cristalina), 18 descriptores QSAR calculados con RDKit y 11 caracteristicas heuristicas de inspiracion ayurvedica. El entrenamiento se ejecuto en un kernel de Kaggle con GPU habilitada (`anamitrasarkar007/ayurvedic-affinity-training-v1`, version 3 de kernel). No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas equivalentes, que no aplican a un modelo de regresion tabular.

## Capacidades

- Prediccion de afinidad de union proteina-ligando en escala pKd a partir de un vector de 39 caracteristicas numericas.
- Integracion con descriptores fisicoquimicos calculados con RDKit (18 descriptores QSAR) y terminos energeticos de AutoDock Vina.
- Incorporacion de 11 caracteristicas heuristicas etiquetadas como ayurvedicas, cuyo diseno y justificacion no se detallan en la model card.
- Serializacion y carga sencilla mediante `joblib.load()`, con recuperacion del modelo, el escalador y los nombres de caracteristicas en un unico diccionario.
- Uso como componente de un agente (`MLAgent`) dentro del backend del proyecto, con etiquetado de cada prediccion en el nivel `ML_PREDICTION` y aviso asociado.
- Generacion de hipotesis computacionales para priorizar compuestos antes de validacion experimental.
- Capacidades de generacion de texto, codigo, matematicas, vision, tool calling, agentes multi-paso y razonamiento: no disponibles (no aplica a este tipo de modelo).

## Casos de uso

- Cribado virtual de fitoquimicos ayurvedicos: dado un conjunto de compuestos y una diana, el modelo puntua la afinidad estimada para priorizar que moleculas merecen un docking de mayor coste computacional o una compra de patron.
- Prefiltrado en pipelines de descubrimiento in silico: al ejecutarse en CPU y sobre 39 caracteristicas, permite descartar rapidamente compuestos con pKd predicho bajo antes de lanzar simulaciones de dinamica molecular o calculos de energia libre.
- Generacion de hipotesis para validacion wet-lab: los candidatos con mayor pKd predicho se etiquetan como `ML_PREDICTION` y se trasladan al laboratorio para ensayos de union reales, sin presentarlos como evidencia experimental.
- Componente de decision dentro del backend del proyecto: `MLAgent` carga el artefacto con `joblib.load()` y lo expone como herramienta de puntuacion para los flujos de la aplicacion, manteniendo la trazabilidad del nivel de evidencia.
- Baseline de comparacion: sirve como referencia tabular para evaluar si arquitecturas mas complejas (redes de grafos sobre el ligando, funciones de scoring basadas en aprendizaje profundo) aportan mejora real sobre un RandomForest con descriptores clasicos.
- Docencia y reproducibilidad metodologica: el kernel de Kaggle y la particion por scaffolds permiten ilustrar buenas practicas de separacion de datos, comprobacion de fuga por similitud y declaracion honesta de metricas modestas.
- Analisis de sensibilidad de caracteristicas: al ser un bosque aleatorio con nombres de caracteristicas almacenados, es posible inspeccionar importancias relativas entre terminos de docking, descriptores RDKit y caracteristicas heuristicas, como analisis exploratorio interno.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de test retenido (36 complejos, particion por scaffolds):

| Modelo | MAE | RMSE | R² | Pearson | Spearman |
|---|---|---|---|---|---|
| RandomForest (seleccionado) | 1,35 | 1,59 | 0,01 | 0,30 | 0,31 |
| GradientBoosting | 1,47 | 1,79 | -0,27 | 0,13 | 0,12 |
| Ridge | 1,67 | 1,93 | -0,47 | 0,13 | 0,15 |
| XGBoost | 1,64 | 1,90 | -0,42 | 0,08 | 0,01 |

No se han publicado en la informacion disponible resultados de benchmarks de este modelo frente a funciones de scoring externas, ni metricas en otros conjuntos de datos distintos de PDBBind v2013-core. Un MAE de 1,35 unidades de pKd equivale aproximadamente a un error de un factor 22 en la constante de disociacion (10^1,35). El R² de 0,01 indica que el modelo explica en torno al 1 por ciento de la varianza del conjunto de test, es decir, una capacidad predictiva muy limitada.

## Requisitos de hardware

- VRAM para inferencia: 0 GB. Es un bosque aleatorio de scikit-learn; la inferencia se ejecuta en CPU y no requiere GPU.
- GPU recomendadas: no aplica. El entrenamiento se realizo en un kernel de Kaggle con GPU habilitada, pero la carga y la prediccion no la aprovechan.
- GPU de consumo: irrelevante para la inferencia. Cualquier maquina capaz de ejecutar Python y scikit-learn puede servir el modelo.
- Memoria RAM: no disponible de forma explicita; el repositorio ocupa menos de 0,1 GB, por lo que la huella es pequena y cabe en cualquier portatil o contenedor ligero.
- Opciones de despliegue: carga directa con `joblib.load()` en un proceso Python; servicio HTTP mediante FastAPI (el propio backend del proyecto lo usa asi); ejecucion en lotes sobre ficheros de caracteristicas. vLLM, TGI, llama.cpp y Ollama no aplican, ya que no es un modelo de lenguaje.
- Compatibilidad: la deserializacion exige una version de scikit-learn compatible con la empleada en el entrenamiento; la version exacta no esta disponible en la informacion proporcionada.
- Latencia y throughput: no disponibles. Por la naturaleza del modelo, se espera latencia de orden submilisegundo a milisegundos por muestra en CPU, pero no hay cifras publicadas que lo confirmen.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con las alternativas evaluadas en el propio proyecto. No se dispone de datos de otros modelos publicados de la misma categoria.

| Modelo | Tipo | MAE (test) | R² | Pearson | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RandomForest (este modelo) | Bosque aleatorio | 1,35 | 0,01 | 0,30 | MIT | Hugging Face, formato joblib |
| GradientBoosting | Boosting de arboles | 1,47 | -0,27 | 0,13 | no disponible | no disponible (baseline interno) |
| Ridge | Regresion lineal regularizada | 1,67 | -0,47 | 0,13 | no disponible | no disponible (baseline interno) |
| XGBoost | Boosting de gradiente | 1,64 | -0,42 | 0,08 | no disponible | no disponible (baseline interno) |

Comparacion con funciones de scoring de docking ampliamente usadas (Vina, Vinardo) u otros predictores de afinidad publicados: no disponible en la informacion proporcionada. Cabe senalar que las caracteristicas de entrada ya derivan de una ejecucion de AutoDock Vina, por lo que el modelo opera sobre informacion generada por una funcion de scoring previa.

## Limitaciones y advertencias

- Capacidad predictiva muy limitada: R² de 0,01 y correlacion de Spearman de 0,31 en el conjunto de test. El modelo apenas mejora a predecir la media del conjunto.
- Tamano de datos reducido: 127 ejemplos de entrenamiento y 36 de test. Es una base insuficiente para generalizar a quimiotipos, familias proteicas o rangos de afinidad no representados.
- Error absoluto medio de 1,35 unidades de pKd, equivalente a un factor aproximado de 22 en Kd. Un error de esta magnitud invalida el uso del modelo para decisiones cuantitativas de potencia.
- Caracteristicas heuristicas ayurvedicas: 11 de las 39 variables no cuentan con validacion fisicoquimica descrita en la model card. Su peso en las predicciones puede introducir senal espuria.
- Sesgo de dominio: el modelo esta entrenado sobre PDBBind v2013-core, con la composicion, sesgos de seleccion y sesgos estructurales de ese conjunto. La extrapolacion a dianas fuera de esa distribucion no esta caracterizada.
- Riesgo de interpretacion erronea: el autor etiqueta explicitamente cada salida como `ML_PREDICTION`. Presentar los pKd predichos como datos experimentales o clinicos es un uso indebido.
- Ausencia de validacion experimental: ninguna prediccion ha sido confirmada mediante ensayos de union ni ensayos clinicos. Cualquier candidato requiere validacion wet-lab y clinica antes de cualquier afirmacion terapeutica.
- Dependencia del esquema de caracteristicas: la entrada debe contener exactamente las 39 caracteristicas en el orden definido por `features.py`. Un orden distinto o una version distinta de RDKit puede degradar o invalidar las predicciones sin aviso.
- Compatibilidad de serializacion: `joblib` no garantiza la carga entre versiones mayores de scikit-learn; se recomienda fijar la version en el entorno de despliegue.
- Licencia MIT: permite uso comercial y modificacion con atribucion y conservacion del aviso de copyright. La licencia no exime de las advertencias cientificas anteriores.
- Ausencia de benchmarks externos y de comparacion con funciones de scoring establecidas, lo que impide situar el modelo frente al estado del arte.
- Reproducibilidad parcial: el script de entrenamiento y la metodologia se remiten a `docs/REPRODUCIBILITY.md` y al kernel de Kaggle, pero no se incluyen en el repositorio de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bhumika-tewari-282006/ayurvedic-drug-discovery-affinity-model
- Repositorio del proyecto en GitHub: https://github.com/Anamitra-Sarkar/ayurvedic-drug-discovery
- Dataset de entrenamiento (PDBBind v2013-core) en Kaggle: https://www.kaggle.com/datasets/madukacharles/pdbbind-protein-ligand-binding-affinity-dataset
- Kernel de entrenamiento en Kaggle: `anamitrasarkar007/ayurvedic-affinity-training-v1` (version 3 de kernel)
- Documentacion de limitaciones cientificas del proyecto: `docs/SCIENTIFIC_LIMITATIONS.md` (dentro del repositorio de GitHub)
- Documentacion de reproducibilidad del proyecto: `docs/REPRODUCIBILITY.md` (dentro del repositorio de GitHub)
- Esquema de caracteristicas: `backend/app/core/ml/features.py` (dentro del repositorio de GitHub)
- Codigo de integracion del modelo en el backend: `backend/app/agents/ml_agent.py` (dentro del repositorio de GitHub)
- Resultados de busqueda web: no se han encontrado enlaces adicionales relevantes. Las consultas realizadas devolvieron unicamente resultados no relacionados con el modelo (documentacion sobre rutas de Windows), por lo que no se incluyen.
