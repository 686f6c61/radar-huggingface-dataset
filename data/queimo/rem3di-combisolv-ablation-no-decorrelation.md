# Queimo/rem3di-combisolv-ablation-no-decorrelation

## Resumen

`Queimo/rem3di-combisolv-ablation-no-decorrelation` es un checkpoint de ablacion de tres epocas del framework Rem3Di, publicado por el usuario Queimo. Rem3Di (remedi) es un marco de aprendizaje de representaciones que reutiliza las features latentes de un potential interatomico de aprendizaje automatico (MLIP) congelado, del tipo MACE, para producir un descriptor de molecula completa de longitud fija y suave (smooth), con tratamiento explicito de quiralidad. Este repositorio concreto no es un modelo final, sino la variante `no_decorrelation` de un estudio de ablacion por componentes: se mantienen los tres terminos de las cabezas multitarea con uncertainty weighting (UW) y se anula unicamente el coeficiente de covarianza.

El checkpoint arranca del mismo punto evaluado PCQMep2→COSMOep10 que el control, con datos, geometrias, semillas de orden, cabezas iniciales, optimizadores y learning rates de las tres primeras epocas identicos al modelo completo. El entrenamiento se detiene a las tres epocas y la evaluacion se hace sobre BigSolDB con 9.686 filas de test, 75.731 contextos de entrenamiento, 1.281 columnas y cuatro estimadores Kumo Large con semilla 42. Su relevancia es metodologica: sirve para cuantificar cuanto aporta el termino de descorrelacion de covarianza en un esquema multitarea con incertidumbre, no para desplegar en produccion.

El modelo pertenece al dominio de la quimioinformatica y la prediccion de propiedades moleculares, no al procesamiento de lenguaje natural. No hay informacion publicada sobre numero de parametros, licencia, idiomas ni formato de pesos; el repositorio ocupa 6,2 GB y no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Rem3Di: descriptor molecular de longitud fija obtenido de las representaciones latentes de un MLIP equivariante congelado (tipo MACE), con cabezas multitarea, uncertainty weighting (UW) y termino de covarianza (anulado en esta variante) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; el modelo consume geometrias moleculares 3D, no secuencias de texto |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de dominio quimico, sin capacidades linguisticas) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio ocupa 6,2 GB; no se especifica safetensors, GGUF ni otro formato) |
| Checkpoint de partida | PCQMep2→COSMOep10 (mismo punto evaluado que el control) |
| Dataset de evaluacion | BigSolDB: 9.686 filas de test, 75.731 contextos de entrenamiento, 1.281 columnas |
| Semilla | 42 (un unico seed de entrenamiento emparejado) |
| Epocas entrenadas | 3 |

## Arquitectura y entrenamiento

La arquitectura subyacente es Rem3Di, presentada en el paper *Rem3Di: Learning smooth, chiral 3D molecular descriptors* (arXiv 2607.19977) y en el workshop NeurIPS 2025 de Symmetry and Geometry in Neural Representations. El marco congela un MLIP equivariante preentrenado sobre grandes datasets cuantico-mecanicos y aprovecha sus representaciones internas de entornos atomicos para agregarlas en un unico descriptor de molecula de longitud fija. Sobre ese descriptor se montan cabezas multitarea con ponderacion de incertidumbre (uncertainty weighting), de modo que el modelo aprende simultaneamente varias tareas quimicas y sus pesos relativos.

En esta variante de ablacion, los tres terminos UW de las tareas se conservan integros y solo se lleva a cero el coeficiente de covarianza, que es el mecanismo de descorrelacion entre tareas. El objetivo de denoising, cuando esta activo, corrompe los embeddings atomicos y no las coordenadas; en la variante `no_denoising` (no cubierta por este repositorio) el decodificador no recibe gradientes y se excluye su termino de incertidumbre completo, incluido el regularizador de log-varianza, manteniendo un forward diagnostico con `detach` para preservar la secuencia de RNG de dropout y ruido. Todo el protocolo replica el control: mismos datos, geometrias, semillas de orden y shuffle, cabezas iniciales, optimizadores y learning rates de las tres primeras epocas.

El resultado es un experimento controlado de una sola semilla, con el checkpoint de la tercera epoca declarado a priori como comparacion final y sin ajustes de hiperparametros guiados por test. No se documentan en la informacion disponible el numero de tokens o muestras de preentrenamiento del MLIP base, la composicion completa del dataset ni si hubo etapas de RLHF o DPO (no aplicables en este dominio).

## Capacidades

- Generacion de descriptores moleculares de longitud fija a partir de geometrias 3D, reutilizando un MLIP congelado como extractor de features.
- Prediccion de propiedades moleculares mediante cabezas multitarea; en este checkpoint la evaluacion concreta es de solubilidad sobre BigSolDB.
- Modelado de incertidumbre por tarea mediante uncertainty weighting, con tres terminos UW activos.
- Sensibilidad a quiralidad y suavidad del descriptor, heredadas del marco Rem3Di descrito en el paper.
- Evaluacion reproducibilidad de ablaciones: permite aislar el efecto del termino de covarianza frente al control completo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Sin capacidades multilingues, de vision, audio ni modo thinking: el modelo no procesa texto ni imagenes.

## Casos de uso

- Reproduccion de ablaciones academicas: el checkpoint sirve para replicar la comparacion `full_model` frente a `no_decorrelation` en las tres primeras epocas, con semillas, datos y learning rates documentados, y contrastar los resultados con el run publico de W&B.
- Analisis de la contribucion del termino de covarianza: al anular solo el coeficiente de descorrelacion manteniendo los tres terminos UW, se puede medir de forma aislada si la descorrelacion mejora MAE, RMSE o R² en prediccion de solubilidad.
- Cribado virtual de solubilidad acuosa: las cabezas multitarea permiten estimar solubilidad sobre moleculas representadas como geometrias 3D, util en filtrado temprano de candidatos, siempre que se valide fuera de BigSolDB.
- Featurizacion para modelos downstream QSAR/QSPR: el descriptor de longitud fija puede alimentar regresores o clasificadores externos sobre moleculas con conformacion 3D y quiralidad relevante.
- Estudio de calibracion de incertidumbre multitarea: la conservacion de los terminos UW y del regularizador de log-varianza en esta variante permite analizar la calibracion de las varianzas por tarea sin el efecto de la covarianza.
- Docencia y formacion en representaciones moleculares: como artefacto de ablacion acotado a tres epocas, es adecuado para ilustrar protocolos de comparacion controlada y trazabilidad de experimentos.
- Auditoria de pipelines de evaluacion: la definicion exacta del split (9.686 filas de test, 75.731 contextos, semilla 42, cuatro estimadores Kumo Large) facilita comprobar la consistencia de implementaciones propias.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre BigSolDB (test de 9.686 filas, semilla 42). La comparacion final predeclarada es la epoca 3.

| Variante | Epoca | MAE | RMSE | R² |
|---|---:|---:|---:|---:|
| full_model | 1 | 0,569691 | 0,744798 | 0,572648 |
| full_model | 2 | 0,571346 | 0,748295 | 0,568627 |
| full_model | 3 | 0,576577 | 0,749793 | 0,566898 |
| no_decorrelation | 1 | 0,574835 | 0,751849 | 0,564518 |
| no_decorrelation | 2 | 0,570582 | 0,747797 | 0,569200 |
| no_decorrelation | 3 | 0,575272 | 0,752397 | 0,563884 |

En la epoca 3, la variante sin descorrelacion obtiene un MAE ligeramente inferior (0,575272 frente a 0,576577, diferencia de -0,001305), pero un RMSE superior (0,752397 frente a 0,749793, +0,002604) y un R² inferior (0,563884 frente a 0,566898, -0,003014). Las tres metricas empeoran de la epoca 1 a la 3 en ambas variantes, lo que es coherente con un ajuste corto sobre un checkpoint ya evaluado. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) porque no aplican a este dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se declara el numero de parametros ni el formato de pesos.
- GPU recomendadas: no disponible. El modelo se apoya en un MLIP equivariante tipo MACE, cuyo coste de inferencia depende de la implementacion concreta de dicho potencial y del tamano del sistema molecular.
- Encaje en GPU de consumo: no disponible; no se puede determinar sin conocer el tamano efectivo del checkpoint y del MLIP base.
- Espacio en disco: el repositorio ocupa 6,2 GB, cota inferior del almacenamiento necesario para los pesos publicados.
- Opciones de despliegue: el codigo de referencia esta en el repositorio GitHub `molsuit/Rem3Di` (instalacion, quickstart, evaluacion de modelos, entrenamiento de cabezas downstream y entrenamiento desde cero). No hay artefactos GGUF, Ollama, vLLM ni TGI publicados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MAE (ep. 3, BigSolDB) | RMSE (ep. 3) | R² (ep. 3) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| rem3di-combisolv-ablation-no-decorrelation | no disponible | no aplica | 0,575272 | 0,752397 | 0,563884 | no disponible | HuggingFace, 0 descargas |
| Rem3Di full_model (control del mismo estudio) | no disponible | no aplica | 0,576577 | 0,749793 | 0,566898 | no disponible | Referenciado en la model card y en W&B |
| Rem3Di `no_denoising` (variante mencionada en la card) | no disponible | no aplica | no disponible | no disponible | no disponible | no disponible | No se aportan metricas en la informacion disponible |
| MACE y otros MLIP equivariantes (base congelada) | no disponible | no aplica | no disponible | no disponible | no disponible | no disponible | Codigo y pesos en sus repositorios originales |

No se dispone de datos publicados que permitan comparar esta variante con descriptores moleculares alternativos (por ejemplo, featurizaciones tipo ECFP o descriptores 3D clasicos) bajo el mismo split de BigSolDB; esa comparacion figura como no disponible.

## Limitaciones y advertencias

- Es un checkpoint de ablacion de tres epocas, no un modelo entrenado hasta convergencia; no debe usarse como sustituto del modelo completo.
- Un unico seed de entrenamiento emparejado: no hay estimacion de varianza entre seeds, por lo que las diferencias de milesimas en MAE, RMSE y R² no permiten concluir superioridad estadistica.
- Las metricas empeoran de la epoca 1 a la 3 en ambas variantes, lo que sugiere que el regimen de tres epocas no captura el punto optimo del entrenamiento.
- La licencia no esta declarada; el unico tag presente es `region:us`. Sin licencia explicita no se puede asumir permiso de uso comercial.
- El pipeline no esta declarado en HuggingFace y el repositorio no registra descargas ni likes: no hay validacion externa independiente.
- Dominio acotado a prediccion de propiedades moleculares (solubilidad en este estudio); no es un modelo de lenguaje y no procesa texto, codigo, vision ni audio.
- Riesgo de sobreajuste al split o a la configuracion de BigSolDB: el protocolo fija 1.281 columnas y cuatro estimadores Kumo Large, pero no se documenta el preprocesado en la informacion disponible.
- No se especifican sesgos del dataset ni cobertura quimica; la extrapolacion a familias de compuestos fuera de la distribucion de entrenamiento no esta caracterizada.
- Las unidades de MAE y RMSE no se indican en la model card, lo que dificulta la interpretacion fisico-quimica de los errores.
- No se documentan requisitos de VRAM, latencia ni formato de pesos, lo que impide planificar un despliegue en produccion a partir de esta ficha.

## Enlaces

- HuggingFace: https://huggingface.co/Queimo/rem3di-combisolv-ablation-no-decorrelation
- Run de W&B del experimento: https://wandb.ai/queimo/rem3di-reproduction/runs/ab779gr4
- Pagina del proyecto Rem3Di: https://molsuit.github.io/Rem3Di/
- Repositorio GitHub: https://github.com/molsuit/Rem3Di
- Paper en arXiv: https://arxiv.org/abs/2607.19977
- Cita del workshop (NeurIPS 2025): Wedig, Steffen, et al. "REM3DI: Learning smooth, chiral 3D molecular representations from equivariant atomistic foundation models." NeurIPS 2025 Workshop on Symmetry and Geometry in Neural Representations.
