# eandujar/pokemon-151-autogluon

## Resumen

`eandujar/pokemon-151-autogluon` no es un modelo de lenguaje: es un artefacto de clasificacion binaria tabular entrenado con AutoGluon y publicado en HuggingFace. El autor, `eandujar`, lo presenta como el modelo con mejor rendimiento de un experimento de AutoML, seleccionado mediante exactitud balanceada (balanced accuracy) sobre el split de validacion proporcionado. El modelo ganador es `LightGBMLarge`, es decir, un conjunto de arboles de decision potenciados por gradiente implementado con LightGBM, no una red neuronal ni un transformer.

El modelo resuelve una tarea de clasificacion binaria sobre un dataset tabular concreto, `pakiino/2026-24679-pokemon-151-tabular-hw1`, con una columna objetivo llamada `label` cuya clase positiva es `1`. Todo apunta a un ejercicio academico (el identificador del dataset incluye el sufijo `hw1`, de homework) centrado en Pokemon 151, aunque la model card no documenta el significado semantico de `label` ni las caracteristicas de entrada.

Su relevancia es limitada y muy especifica: sirve como ejemplo reproducible de un flujo AutoML tabular completo (busqueda de modelos, seleccion por metrica, publicacion del artefacto), no como componente de proposito general. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 likes, ocupa 0.0 GB segun HuggingFace y no declara licencia, lo que condiciona cualquier uso fuera del ambito educativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AutoGluon `TabularPredictor`; modelo final retenido: `LightGBMLarge` (arboles de decision potenciados por gradiente de LightGBM). No es una red neuronal ni un transformer |
| Parametros totales | no disponible; no se publica el numero de arboles, hojas ni profundidad del modelo entrenado |
| Parametros activos | no aplicable (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no disponible; no aplicable (consume una fila tabular de columnas fijas por inferencia) |
| Tipos de cuantizacion | no disponible; no aplicable (los modelos de arboles no se cuantizan a FP8/INT4; la compresion tipica seria poda o limite de hojas) |
| Idiomas soportados | no disponible; no aplicable (no procesa texto libre) |
| Licencia | no disponible (la model card no especifica ninguna licencia) |
| Formato de pesos | no disponible en detalle; el repositorio se carga con `TabularPredictor.load()` y ocupa 0.0 GB segun HuggingFace |
| Libreria de carga | `autogluon` |
| Tipo de tarea | Clasificacion binaria tabular |
| Columna objetivo | `label` (clase positiva: `1`) |
| Metrica de seleccion | Balanced accuracy sobre el split de validacion |
| Dataset de entrenamiento | `pakiino/2026-24679-pokemon-151-tabular-hw1` |
| Fecha de creacion | 2026-09-21 |
| Ultima actualizacion | 2026-09-21 |

## Arquitectura y entrenamiento

El artefacto es la salida de un `TabularPredictor` de AutoGluon. AutoGluon entrena y evalua automaticamente una cartera de modelos tabulares (arboles potenciados por gradiente, bosques aleatorios, redes neuronales feed-forward, regresion lineal, entre otros) con estrategias de apilamiento y bagging, y despues selecciona el mejor candidato segun la metrica indicada. En este caso la metrica es balanced accuracy, una eleccion coherente con problemas de clasificacion binaria desbalanceada, ya que pondera por igual ambas clases en lugar de premiar la clase mayoritaria.

Segun la model card, el modelo seleccionado fue `LightGBMLarge` y el repositorio conserva unicamente ese modelo junto con los ficheros necesarios para su inferencia. `LightGBMLarge` es un preset de AutoGluon que configura LightGBM con un presupuesto de entrenamiento mayor (mas iteraciones y mayor capacidad) que los presets por defecto. No se documenta el numero de arboles finales, la profundidad, la tasa de aprendizaje, el numero de caracteristicas, el tamano del split de validacion ni el balance de clases del dataset. Tampoco se menciona ningun tipo de ajuste fino posterior, RLHF, DPO ni ninguna innovacion tecnica adicional: el flujo es AutoML supervisado clasico sobre datos tabulares.

Un detalle de trazabilidad relevante: el repositorio declara un tamano de 0.0 GB. En modelos LightGBM persistidos el peso habitual suele ser de decenas o cientos de MB, por lo que conviene verificar la integridad de los ficheros antes de asumir que el artefacto esta completo.

## Capacidades

- Clasificacion binaria de registros tabulares: devuelve una etiqueta (`0` o `1`) y, a traves de `predict_proba`, una probabilidad asociada a la clase positiva.
- Inferencia por lotes y por fila sobre datos estructurados con el mismo esquema de columnas que el dataset de entrenamiento.
- Seleccion de modelo basada en balanced accuracy, lo que implica que el artefacto esta optimizado para ese criterio y no necesariamente para exactitud, F1 o AUC.
- Extraccion de importancia de variables y de informacion interna del predictor mediante la propia API de AutoGluon (utilidad para analisis, no como capacidad generativa).
- Persistencia y carga reproducible mediante `snapshot_download` + `TabularPredictor.load`.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No soporta tool calling, function calling ni flujos de agentes multi-paso.
- No tiene capacidades multilingues: el modelo no consume lenguaje natural, solo columnas tabulares numericas o categoricas.
- No dispone de modo de razonamiento explicito (thinking mode) ni de ninguna capacidad multimodal.

## Casos de uso

- Material docente de AutoML: el repositorio documenta el flujo completo (framework, tipo de problema, objetivo, metrica de seleccion y modelo ganador), lo que permite usarlo en clase como ejemplo de como se cierra un ejercicio de clasificacion tabular con AutoGluon.
- Reproduccion de un ejercicio academico: al conservar solo el modelo ganador y sus dependencias de inferencia, sirve como snapshot congelado para replicar el resultado de la practica `hw1` sin reentrenar.
- Baseline de clasificacion binaria en datos tabulares de tamano medio: un `LightGBMLarge` ajustado es un punto de comparacion razonable para medir si un modelo nuevo (red neuronal tabular, TabPFN, CatBoost, etc.) aporta mejoras reales sobre gradient boosting.
- Prototipo rapido de scoring binario en un dominio tipo Pokemon: si `label` codifica una propiedad binaria del Pokemon (por ejemplo, una etiqueta derivada de tipos, estadisticas o evoluciones), el modelo se puede usar para puntuar registros nuevos dentro de ese esquema. El significado exacto de `label` no esta documentado, por lo que este uso exige inspeccionar primero el dataset.
- Analisis de importancia de variables: la API de AutoGluon permite consultar que caracteristicas pesan mas en la decision, lo que resulta util para validar hipotesis sobre el dataset o para limpiar columnas ruidosas antes de un modelo mayor.
- Comparativa de frameworks AutoML: el artefacto puede integrarse en un banco de pruebas que enfrente AutoGluon con otras herramientas (TPOT, H2O AutoML, PyCaret) sobre el mismo dataset y la misma metrica.
- Demostracion de despliegue ligero: al ser un modelo de arboles, se puede exportar el booster subyacente y servirlo detras de una API minima en CPU, lo que lo convierte en un ejemplo didactico de servicio de inferencia sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica unicamente que el modelo se selecciono por balanced accuracy sobre el split de validacion proporcionado, pero no incluye el valor obtenido ni ninguna tabla comparativa con otros modelos. No se dispone de datos de MMLU, HumanEval, GSM8K ni de metricas tabulares (AUC, F1, exactitud) para este artefacto.

## Requisitos de hardware

- VRAM para inferencia: no requiere GPU. LightGBM ejecuta la prediccion en CPU, por lo que la VRAM necesaria es 0 GB.
- Memoria RAM: no disponible. Como referencia de ingenieria (no dato publicado), un modelo LightGBM de capacidad grande suele ocupar entre decenas y unos pocos cientos de MB en memoria, en funcion del numero de arboles y hojas.
- GPU recomendadas: no aplicables. El modelo no se beneficia de A100, H100 ni RTX 4090.
- Cabe en cualquier equipo de consumo: si, en cualquier portatil o servidor con CPU x86-64 o ARM razonablemente moderno; no necesita GPU de consumo.
- Opciones de despliegue: `autogluon.tabular` (carga nativa con `TabularPredictor.load`); alternativamente, extraccion del booster de LightGBM subyacente para servirlo con la libreria `lightgbm` directamente, exportacion a ONNX si el modelo lo permite, o envoltorio en un servicio FastAPI/BentoML para exposicion HTTP.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo de inferencia ni de registros por segundo.

## Comparativa con modelos similares

La comparacion se plantea frente a las alternativas habituales de clasificacion binaria tabular. Todas las cifras de rendimiento de este artefacto son no disponibles, por lo que la comparacion es estructural y de licencia, no de calidad.

| Modelo / alternativa | Tipo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `eandujar/pokemon-151-autogluon` | Gradient boosting (LightGBMLarge) via AutoGluon | no disponible | no aplicable | no disponible | no disponible | HuggingFace, 0 descargas, repo de 0.0 GB |
| LightGBM (modelo entrenado a mano) | Gradient boosting | configurable por el usuario | no aplicable | depende del ajuste | MIT (libreria) | github.com/microsoft/LightGBM |
| XGBoost | Gradient boosting | configurable por el usuario | no aplicable | depende del ajuste | Apache 2.0 (libreria) | github.com/dmlc/xgboost |
| CatBoost | Gradient boosting con soporte nativo de categoricas | configurable por el usuario | no aplicable | depende del ajuste | Apache 2.0 (libreria) | github.com/catboost/catboost |

Diferencias clave: las tres alternativas son librerias de proposito general que el usuario entrena y controla, mientras que este repositorio es un artefacto ya entrenado, con esquema de datos fijado por el dataset de origen y ligado a la version de AutoGluon con la que se genero. La ventaja del artefacto es la reproducibilidad inmediata del resultado del ejercicio; la desventaja es que cualquier cambio en el esquema de entrada o en la version de la libreria puede invalidarlo.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo y no admite instrucciones en lenguaje natural. Cualquier expectativa de ese tipo es un error de categoria.
- Licencia no declarada: sin licencia explicita, no hay cesion de derechos clara. No debe usarse en produccion ni con fines comerciales sin contactar antes con el autor.
- Trazabilidad del artefacto insuficiente: el repositorio se declara como 0.0 GB, lo que puede indicar que los ficheros del modelo no estan completos o que el tamano esta redondeado. Conviene descargar y verificar antes de confiar en el.
- Semantica de la variable objetivo no documentada: se desconoce que representa `label = 1`, que caracteristicas se usaron y como se construyo el dataset. Sin esa informacion, las predicciones no son interpretables en un contexto real.
- Riesgo de sobreajuste al split de validacion: el modelo se eligio por balanced accuracy sobre un unico split, sin validacion cruzada ni conjunto de test independiente reportado. El rendimiento fuera de ese split es desconocido.
- Sin analisis de sesgo ni de equidad: no hay evaluacion por subgrupos, ni estudio de variables sensibles, ni metricas de calibracion.
- Dependencia de version: los artefactos de AutoGluon estan atados a la version de la libreria y de sus dependencias (LightGBM, scikit-learn). Cargarlo con una version distinta puede fallar o degradar los resultados.
- Sin soporte multilingue, multimodal ni de herramientas: no aplica en ningun flujo de agentes, RAG o tool calling.
- Riesgo de alucinacion: no aplica en el sentido generativo; el riesgo equivalente es la extrapolacion silenciosa, es decir, producir probabilidades poco fiables ante filas con valores fuera del rango visto en entrenamiento.
- Adopcion nula: 0 descargas y 0 likes implican que el artefacto no ha sido validado por terceros.
- Los resultados de la busqueda web asociados a esta consulta no guardan ninguna relacion con el modelo: devolvieron unicamente paginas de productos bancarios de DKB AG, sin conexion con AutoGluon, Pokemon ni clasificacion tabular.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eandujar/pokemon-151-autogluon
- Dataset de entrenamiento: https://huggingface.co/datasets/pakiino/2026-24679-pokemon-151-tabular-hw1
- Documentacion de AutoGluon Tabular: https://auto.gluon.ai/stable/api/autogluon.tabular.TabularPredictor.html
- Repositorio de AutoGluon: https://github.com/autogluon/autogluon
- Paper de AutoGluon-Tabular (Erickson et al., 2020): https://arxiv.org/abs/2003.06505
- Repositorio de LightGBM: https://github.com/microsoft/LightGBM
- Paper de LightGBM (Ke et al., NeurIPS 2017): https://papers.nips.cc/paper/6907-lightgbm-a-highly-efficient-gradient-boosting-decision-tree
- Resultados de busqueda web: no se encontro ningun enlace relevante; las paginas devueltas (DKB AG) no estan relacionadas con el modelo.
