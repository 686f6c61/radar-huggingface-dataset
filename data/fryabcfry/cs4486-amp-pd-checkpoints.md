# fryabcfry/cs4486-amp-pd-checkpoints

## Resumen

El repositorio `fryabcfry/cs4486-amp-pd-checkpoints` no es un modelo de lenguaje, sino una coleccion de checkpoints entrenados para una tarea de regresion tabular: predecir la progresion de la enfermedad de Parkinson a partir de mediciones proteomicas y datos clinicos de visita. Lo desarrolla el usuario `fryabcfry` en el contexto de un proyecto academico (CS4486) sobre el dataset AMP-PD de la competicion de Kaggle "AMP-Parkinsons Disease Progression Prediction". El objetivo concreto es estimar las puntuaciones UPDRS-1, UPDRS-2, UPDRS-3 y UPDRS-4 a horizontes de 0, 6, 12 y 24 meses, produciendo 16 salidas por muestra.

Tecnicamente el paquete combina varias aproximaciones clasicas y neuronales: un MLP de regresion directa como baseline, un MLP de referencia de distribucion compartida, y tres variantes que modelan las proteinas mediante reduccion de dimensionalidad (autoencoder seleccionado, PCA y PLS) seguidas de una Ridge que predice el residuo sobre la referencia. Los checkpoints se organizan en una jerarquia de experimentos con folds de validacion cruzada, modelos all-patient y replicas con distintas semillas de particion.

Su relevancia es limitada y muy especifica: sirve como artefacto reproducible de investigacion para comparar representaciones de proteinas y disponibilidad de entradas en un problema biomedico concreto. No es un modelo generativo, no soporta instrucciones en lenguaje natural y el propio autor lo declara explicitamente no validado clinicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de regresion tabular: MLP de regresion directa, MLP de referencia de distribucion compartida y cabezas Ridge sobre latentes (autoencoder, PCA, PLS) |
| Parametros totales | no disponible (multiples checkpoints; el repo completo ocupa 0,1 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular: mes de visita y vector de proteinas) |
| Tipos de cuantizacion | no disponible (pesos PyTorch en precision de entrenamiento) |
| Idiomas soportados | en (etiquetas y documentacion en ingles) |
| Licencia | no disponible |
| Formato de pesos | state dictionaries de PyTorch y arrays numericos de preprocesado; algunos preprocesadores legacy en pickle |

## Arquitectura y entrenamiento

El sistema no es un transformer ni un modelo de lenguaje. Se compone de varias familias de modelos entrenados sobre datos tabulares del estudio AMP-PD: por un lado, MLP de regresion directa y un MLP de referencia de distribucion compartida que sirve como prediccion base; por otro, tres metodos que comprimen el vector de proteinas de la visita actual (autoencoder entrenado sobre proteinas de pacientes de entrenamiento y congelado para el cribado de latentes, PCA y PLS) y ajustan una regresion Ridge supervisada sobre el residuo de UPDRS respecto a la referencia.

La evaluacion se realiza con validacion cruzada local sobre 248 pacientes, 1.068 origenes clinicos con proteinas y 12.578 etiquetas observadas. Se reportan resultados con la particion original y con tres semillas de particion (42, 142 y 242). La metrica es SMAPE+1, donde menor es mejor. No se documenta en la informacion disponible el numero de tokens ni un proceso de RLHF/DPO, por tratarse de un problema de regresion supervisada. Como innovacion destacable, el autoencoder se entrena solo con proteinas de pacientes de entrenamiento y se congela antes de la seleccion de latentes, un diseno que el autor relaciona con trabajos de deteccion de anomalias basados en subespacios (SubspaceAD).

## Capacidades

- Prediccion de cuatro componentes UPDRS (1, 2, 3 y 4) a cuatro horizontes temporales (0, 6, 12 y 24 meses), con 16 salidas por muestra.
- Regresion tabular sobre vectores de proteinas con valores faltantes, admitiendo `None` o `NaN` en las mediciones.
- Enrutado de peticiones por `visit_id` y `visit_month`; los identificadores de visita no se usan como caracteristicas predictivas.
- Carga portable mediante `load_models.py`, con loaders para `baseline_mlp`, `selected_ae`, `pls`, `pca` y `ablations`.
- Soporte de modelos por fold de validacion cruzada, modelos all-patient (`fold='final'`) y replicas por semilla de particion (`split_seed`).
- No soporta generacion de texto, razonamiento en lenguaje natural, codigo, vision, audio, tool calling ni uso como agente.

## Casos de uso

- Comparacion de representaciones de proteinas en investigacion: permite contrastar de forma reproducible autoencoder, PCA y PLS como reductores de dimensionalidad antes de una Ridge, usando los mismos folds y la misma metrica SMAPE+1.
- Reproduccion de resultados academicos: los checkpoints y el manifiesto con hashes SHA-256 permiten reconstruir las cifras de validacion cruzada del proyecto sin reentrenar desde cero.
- Analisis de ablacion de disponibilidad de entradas: los directorios `top_nohistory`, `isolated_inference` y `leakage` documentan experimentos sobre que informacion esta disponible en inferencia y su impacto en la prediccion.
- Prototipado de pipelines biomedicos tabulares: el codigo de inferencia en `code/ampd/` sirve como esqueleto para cargar proteinas, preprocesar y producir predicciones multi-horizonte en un entorno PyTorch.
- Estudio de estabilidad frente a particiones: las replicas con semillas 42, 142 y 242 permiten medir la varianza de cada metodo (por ejemplo, 63,845 ± 0,181 para el autoencoder seleccionado frente a 63,813 ± 0,517 para PCA).
- Docencia y ejercicios de validacion cruzada: el conjunto de folds originales y los bundles reajustados son material util para ilustrar fuga de datos, preprocesado ajustado y comparacion de baselines.

## Benchmarks y rendimiento

Resultados de validacion cruzada local reportados por el autor (SMAPE+1, menor es mejor; 248 pacientes, 1.068 origenes clinicos con proteinas, 12.578 etiquetas observadas):

| Modelo | Particion original | Media ± desviacion tipica muestral sobre semillas 42/142/242 |
|---|---:|---:|
| MLP directo (baseline) | 70,611 | no ejecutado |
| MLP de referencia de distribucion compartida | 64,026 | 64,120 ± 0,166 |
| Autoencoder seleccionado + Ridge residual | 63,685 | 63,845 ± 0,181 |
| PCA + Ridge residual | 63,537 | 63,813 ± 0,517 |
| PLS + Ridge residual | 63,379 | 63,900 ± 0,496 |

PCA obtiene la mejor media sobre las tres particiones. El autoencoder seleccionado mejora su referencia en la misma particion en las tres semillas y presenta la menor variacion entre los metodos basados en proteinas. El autor advierte que son resultados de validacion cruzada local y no puntuaciones del leaderboard oculto de Kaggle.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el repositorio completo ocupa 0,1 GB, por lo que los pesos y el preprocesado caben holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; cualquier GPU con CUDA es suficiente, e incluso la inferencia en CPU es viable dado el tamano.
- Cabe en GPU consumer: si, sin restricciones practicas de memoria.
- Opciones de despliegue: PyTorch con los loaders de `load_models.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (SMAPE+1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MLP directo (baseline del repo) | no disponible | no aplica | 70,611 (particion original) | no disponible | incluido en este repo |
| MLP de referencia compartida | no disponible | no aplica | 64,120 ± 0,166 (3 semillas) | no disponible | incluido en este repo |
| PCA + Ridge residual | no disponible | no aplica | 63,813 ± 0,517 (3 semillas) | no disponible | incluido en este repo |
| PLS + Ridge residual | no disponible | no aplica | 63,900 ± 0,496 (3 semillas) | no disponible | incluido en este repo |

No se dispone de informacion sobre modelos externos comparables de otros autores para esta tarea concreta; las alternativas documentadas son las internas del propio repositorio.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo de proposito general: solo produce predicciones numericas UPDRS a partir de un vector de proteinas y un mes de visita.
- El autor declara explicitamente que es un artefacto de investigacion de un curso y no un sistema de prediccion validado clinicamente; no debe usarse para decision clinica.
- Los resultados son de validacion cruzada local, no del leaderboard oculto de Kaggle, por lo que pueden no generalizar a datos externos.
- La licencia no esta disponible, lo que impide confirmar si se permite uso comercial; debe contactarse con el autor antes de cualquier uso en produccion.
- El repositorio no incluye datos clinicos, proteomicos ni de peptidos en bruto, ni volcados de probabilidades de evaluacion, archivos OOF a nivel de participante ni tablas de pertenencia a particiones; para reentrenar hay que obtener los datos de la competicion de Kaggle.
- Los preprocesadores legacy en pickle requieren el entorno de paquetes Python exacto; solo los loaders principales usan arrays numericos y state dictionaries de PyTorch.
- Los artefactos con historial y los diagnosticos `INVALID_*` conservan sus nombres originales y son registros suplementarios, no resultados principales sin historial.
- Pesos antiguos eliminados localmente no se recrean en esta release.
- No se documentan sesgos demograficos ni de otro tipo, pero al derivarse de una cohorte concreta de AMP-PD la representatividad poblacional es limitada.

## Enlaces

- Hugging Face: https://huggingface.co/fryabcfry/cs4486-amp-pd-checkpoints
- Codigo del proyecto: https://github.com/feng-ruiyang/cs_ai_project
- Competicion de Kaggle (datos): https://www.kaggle.com/competitions/amp-parkinsons-disease-progression-prediction
- Trabajo relacionado citado (SubspaceAD): https://clendering.github.io/SubspaceAD/
