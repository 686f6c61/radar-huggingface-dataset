# Delower/herg-best_xgboost_cardiogenai-benchmark

## Resumen

El repositorio `Delower/herg-best_xgboost_cardiogenai-benchmark` contiene el modelo ganador de un programa interno de prediccion de cardiotoxicidad hERG, empaquetado en su variante de *benchmark*. No es un modelo de lenguaje ni un transformer generativo: es un ensemble supervisado para quimioinformatica que combina modelos de arboles (ExtraTrees para clasificacion, XGBoost para regresion) con redes logicas temporales (LTN) implementadas en Keras, sobre una pila de 5.090 caracteristicas derivadas de descriptores moleculares.

El objetivo del modelo es doble: clasificar si un compuesto bloquea el canal hERG a 10 µM (binario) y predecir su valor de pIC50 (regresion). La cardiotoxicidad por bloqueo de hERG es una de las causas mas frecuentes de retirada de farmacos en fases tardias, por lo que disponer de filtros in silico con metricas honestas de validacion externa es relevante para cribado temprano en descubrimiento de farmacos.

La relevancia de este repositorio concreto es que publica explicitamente los numeros held-out de validacion por scaffold y paneles externos, ademas de un script de validacion (`validate_benchmark.py`) y un fichero de compuerta (`GATE_RESULTS.json`) que reproduce las metricas con delta 0.000. El autor separa deliberadamente esta version de benchmark de la version de despliegue (`Delower/herg-best_xgboost_cardiogenai-deployment`), reentrenada con todos los datos, cuyas metricas no son extrapolables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble hibrido: ExtraTrees + LTN (Keras) para clasificacion; XGBoost + LTN para regresion |
| Parametros totales | no disponible (modelos de arboles y LTN; no se reporta recuento de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular/QSAR, no secuencial) |
| Tipos de cuantizacion | no disponible (no se documenta cuantizacion) |
| Idiomas soportados | no aplica (no es modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `.pkl` (arboles), `.keras` (LTN), `.json` (preprocesado y configuracion) |

## Arquitectura y entrenamiento

El modelo es un ensemble de dos componentes por tarea. En clasificacion, el blend final es `0.3 · ExtraTrees + 0.7 · LTN`, con el componente ExtraTrees configurado con 600 arboles y `max_features=0.1`. En regresion, el blend es `0.5 · XGBoost + 0.5 · LTN`, con XGBoost a 1.400 arboles, learning rate 0.02 y profundidad 7. Las LTN son redes neuronales con restricciones logicas implementadas en Keras. La seleccion del ensemble se realizo con MCC de validacion 0.5729 bajo protocolo de scaffold.

La representacion de entrada es una pila de 5.090 caracteristicas: bits y conteos Morgan ECFP4, descriptores 2D de RDKit, fisicoquimica orientada a hERG y embeddings de ChemBERTa-77M. Segun `FEATURE_NOTES.md`, el bloque de descriptores CDK/PaDEL fue sustituido por el bloque de descriptores RDKit; no existe bloque `cdk_desc` en el bundle. El dataset se fijo con semilla 42 y se eliminaron 1.738 compuestos de paneles externos por conectividad InChIKey antes de cualquier particion (solapamiento cero). Los modelos finales se reentrenaron sobre el pool scaffold de train+val (n = 11.432 en clasificacion, n = 7.791 en regresion); el test interno por scaffold y todos los paneles externos quedaron fuera del entrenamiento.

## Capacidades

- Clasificacion binaria de bloqueo del canal hERG a 10 µM para compuestos quimicos representados como moleculas.
- Regresion de potencia (pIC50) frente a hERG.
- Extraccion de caracteristicas integrada mediante `feature_extraction.py` (Morgan ECFP4, RDKit 2D, fisicoquimica hERG, ChemBERTa-77M).
- Inferencia por lotes mediante `predict_herg.py`.
- Validacion reproducible de metricas con `validate_benchmark.py` y `GATE_RESULTS.json`.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: no es un modelo de lenguaje.
- No soporta vision, audio ni modalidades distintas de la representacion molecular tabular.

## Casos de uso

- Cribado virtual temprano en descubrimiento de farmacos: aplicar el clasificador a bibliotecas de compuestos para descartar candidatos con alta probabilidad de bloqueo hERG antes de sintesis o ensayos in vitro, usando el umbral de 10 µM como filtro primario.
- Priorizacion de compuestos en paneles internos: usar la salida de regresion pIC50 para ordenar candidatos por potencia estimada de bloqueo y decidir que compuestos pasan a ensayos electrophisiologicos (patch-clamp).
- Analisis de riesgo regulatorio: emplear la clasificacion junto con el panel FDA incluido en el benchmark (31/36 correctos) como evidencia auxiliar en discusiones de seguridad cardiovascular, siempre con validacion experimental.
- Reproduccion de resultados publicados: el repositorio permite reejecutar `validate_benchmark.py` sobre los mismos pesos y comprobar que las metricas se reproducen con delta 0.000, util para auditoria metodologica o comparacion de pipelines QSAR.
- Benchmark de pipelines QSAR: usar las metricas held-out por scaffold y por paneles externos (hERG-70, New compounds, FDA) como referencia para evaluar otros modelos de cardiotoxicidad con particiones comparables.
- Investigacion en modelos hibridos arbol + LTN: el bundle expone por separado los componentes de arbol y las LTN con sus estados de preprocesado, lo que permite estudiar el efecto de las restricciones logicas frente a los arboles puros.
- Filtrado de quimiotecas en pipelines de ML farmacologico: integrar `predict_herg.py` como etapa de scoring dentro de un flujo de seleccion de compuestos, con la cautela de que la version de benchmark no debe usarse para prediccion de compuestos nuevos.

## Benchmarks y rendimiento

Clasificacion (ensemble):

| Conjunto | n | ACC | MCC | AUC |
|---|---:|---:|---:|---:|
| Test interno (scaffold) | 1.270 | 0.781 | 0.543 | 0.851 |
| hERG-70 (externo) | 462 | 0.729 | 0.474 | 0.802 |
| New compounds (externo) | 967 | 0.507 | 0.204 | 0.679 |
| Panel FDA | 36 | 0.861 | 0.617 | no disponible (31/36 correctos) |

Regresion (ensemble, RMSE en pIC50):

| Conjunto | n | RMSE |
|---|---:|---:|
| Test interno (scaffold) | 866 | 0.636 |
| hERG-70 (externo) | 462 | 0.832 |
| Panel FDA | 36 | 0.977 |

No se han publicado resultados de benchmarks frente a modelos de terceros en la informacion disponible. Los numeros anteriores son los del propio modelo en sus conjuntos held-out.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un ensemble de arboles y LTN sobre 5.090 caracteristicas, la huella es de CPU y memoria RAM, no de GPU dedicada.
- GPU recomendadas: no se especifican; el componente LTN en Keras puede ejecutarse en CPU sin problema. Una GPU consumer (por ejemplo, RTX 3060 o superior) aceleraria el calculo de embeddings ChemBERTa-77M durante la extraccion de caracteristicas.
- Cabe en GPU consumer: si, en la practica cualquier GPU con suficiente memoria para cargar ChemBERTa-77M (unos cientos de MB en fp32) durante la fase de extraccion; la inferencia posterior es ligera.
- Opciones de despliegue: no se documentan opciones como vLLM, llama.cpp, Ollama o TGI (no aplican). El despliegue se realiza via Python con los ficheros `.pkl` y `.keras` y los scripts `predict_herg.py` y `feature_extraction.py`.
- Latencia y throughput estimados: no disponibles.
- Tamano del repositorio: 0.2 GB.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. La model card no incluye comparaciones con otros modelos QSAR de hERG ni referencias a baselines externos. Por tanto, la comparativa se declara no disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo | no disponible | no aplica | MCC 0.543 test interno; 0.474 hERG-70 | MIT | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo esta disenado exclusivamente para prediccion de cardiotoxicidad hERG; no es un modelo de lenguaje y no debe evaluarse como tal.
- Las metricas de este repositorio corresponden a la version de benchmark con los datos held-out; no son extrapolables al repositorio de despliegue (`Delower/herg-best_xgboost_cardiogenai-deployment`), reentrenado con todos los datos.
- Rendimiento degradado en compuestos estructuralmente nuevos: en el panel externo "New compounds" el MCC cae a 0.204 y la exactitud al 0.507, cerca del azar. Esto indica limitada capacidad de generalizacion fuera del dominio quimico de entrenamiento.
- El panel FDA tiene solo 36 compuestos, por lo que sus metricas (ACC 0.861, MCC 0.617) tienen alta varianza y no deben interpretarse como estimaciones robustas.
- La regresion de pIC50 presenta RMSE de 0.636 en test interno, pero sube a 0.832 en hERG-70 y 0.977 en el panel FDA, lo que refleja menor fiabilidad en dominios externos.
- No se documentan sesgos especificos del dataset (composicion quimica, clases terapeuticas sobrerrepresentadas) ni analisis de calibracion probabilistica.
- Riesgo de falsos negativos en cribado: un compuesto realmente cardiotoxico clasificado como seguro podria avanzar en el pipeline; el modelo no sustituye a ensayos experimentales.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte.
- El bloque de descriptores CDK/PaDEL no esta incluido; quien espere reproducir pipelines basados en CDK debera adaptar la extraccion de caracteristicas segun `FEATURE_NOTES.md`.
- No se documentan requisitos de version de librerias (Keras, XGBoost, RDKit, transformers) que podrian afectar a la reproducibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Delower/herg-best_xgboost_cardiogenai-benchmark
- Repositorio de despliegue (mencionado en la model card): https://huggingface.co/Delower/herg-best_xgboost_cardiogenai-deployment
- Ficheros de referencia internos del repositorio: `benchmark_summary.json`, `GATE_RESULTS.json`, `FEATURE_NOTES.md`, `selection.json`, `config.json`
- No se han encontrado en la informacion disponible enlaces a papers, blogs, demos ni repositorios de codigo externos.
