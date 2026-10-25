# Alexandro24B/mtst-rte-day-ahead

## Resumen

`Alexandro24B/mtst-rte-day-ahead` es un checkpoint especializado de **MTST (Multi-Resolution Time Series Transformer)** orientado a la previsión de demanda eléctrica en Francia a un día vista (day-ahead). No predice directamente el consumo: predice el **residuo** del pronóstico oficial de RTE, de modo que la carga estimada se obtiene como `RTE_forecast_t + residuo_estimado_t`. El autor es Alexandro Bizeul (usuario Alexandro24B), que también mantiene la librería de código abierto `mtst-forecasting` de la que depende el checkpoint.

El modelo resuelve un problema muy acotado y de alto valor operativo: mejorar una referencia ya publicada (el pronóstico day-ahead de RTE) en lugar de construir un pronóstico desde cero. Esto reduce el espacio de aprendizaje al error sistemático de la referencia, pero exige que en el momento de la predicción estén disponibles exactamente las mismas features de ingeniería que en entrenamiento, incluido el propio pronóstico de RTE en MW.

La arquitectura es un transformer multirresolución con 24 posiciones horarias de entrada y 24 de salida, distribuido como state dict de PyTorch junto con dos escaladores ajustados (`joblib`) y un `features.json` que fija el orden exacto de variables. El repositorio no publica métricas de test, número de parámetros ni licencia, y registra 0 descargas y 0 likes, por lo que debe considerarse un artefacto de investigación sin validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multi-Resolution Time Series Transformer (MTST), con ramas transformer a resoluciones temporales configurables |
| Parametros totales | no disponible (la configuracion de dimension de embedding, numero de cabezas, capas, dropout y codificacion posicional esta almacenada en `model.pt`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | ventana fija de 24 posiciones horarias de entrada y horizonte de 24 horas de salida (dia local completo) |
| Tipos de cuantizacion | no disponible; solo se distribuye el state dict en punto flotante PyTorch, sin variantes cuantizadas publicadas |
| Idiomas soportados | no aplica como modelo de lenguaje; la documentacion esta en ingles y el dominio de datos es la demanda electrica de Francia |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (state dict PyTorch) + `scaler_X.joblib` y `scaler_y.joblib` (joblib/scikit-learn) + `features.json` |
| Libreria requerida | `mtst-forecasting>=0.2.0,<0.3` |
| Pipeline | `time-series-forecasting` |
| Tamano del repositorio | 0.0 GB (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion registrada | 2026-10-24 |

## Arquitectura y entrenamiento

MTST combina varias ramas transformer que operan a resoluciones temporales distintas y configurables, lo que permite mezclar patrones de corto plazo (hora a hora) con agregados de mayor escala dentro de la misma ventana. La instancia publicada trabaja sobre una rejilla de 24 posiciones horarias y emite 24 valores de residuo, uno por hora. La configuracion concreta (dimension de embedding, numero de cabezas, numero de capas, dropout y esquema de codificacion posicional) viaja dentro de `model.pt`; el repositorio no la reproduce en la model card.

El entrenamiento se plantea como una correccion supervisada del pronostico day-ahead de RTE: la variable objetivo es el residuo normalizado mediante `scaler_y`, y las entradas son features de ingenieria normalizadas con `scaler_X`, ambos escaladores ajustados en entrenamiento y cargados desde disco en inferencia (nunca reajustados sobre los datos de inferencia). La model card no especifica volumen de tokens ni horas de entrenamiento, composicion del dataset, periodo temporal cubierto ni si se aplicaron tecnicas de ajuste fino tipo RLHF/DPO (no aplicables en este dominio). Tampoco se documenta ninguna innovacion adicional como decodificacion especulativa o atencion lineal.

Un detalle relevante de implementacion: el dataset original mapea los dias con 23 o 25 horas reales (horario de verano/invierno en Europe/Paris) a 24 slots de hora local, conservando la **segunda** ocurrencia de la hora 02:00 duplicada en otono y enmascarando las horas ausentes. `inference.py` exige deliberadamente 24 filas completas y finitas, y no implementa ni el ajuste DST ni la ingenieria de features de datos crudos.

## Capacidades

- Prediccion de residuo de demanda electrica day-ahead para Francia, hora a hora, sobre una rejilla de 24 horas.
- Correccion de una referencia externa (pronostico day-ahead de RTE) en lugar de pronostico desde cero.
- Inferencia multi-dispositivo: CPU, MPS (Apple Silicon) y CUDA, seleccionable por parametro `--device`.
- API dual: CLI (`inference.py --model-dir . --csv ... --output ...`) y funcion Python `forecast_day(df, model_dir, device)`.
- Salida estructurada con tres columnas: referencia RTE (`rte_forecast_mw`), residuo predicho (`predicted_residual_mw`) y pronostico corregido (`mtst_forecast_mw`), una fila por hora.
- Propagacion opcional de una columna `timestamp` desde la entrada a la salida.
- Validacion estricta de entrada: exige las columnas exactas de `features.json` en el orden correcto y 24 filas finitas; incluye tests de humo, de forma y de manejo de errores (`tests/test_inference.py`).
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto: es un modelo numerico de series temporales.

## Casos de uso

- **Correccion del pronostico oficial para trading intradiario**: el modelo recibe las features del dia siguiente (incluido `rte_forecast_d1_mw_disp` en MW) y devuelve un residuo por hora; el equipo de trading usa `mtst_forecast_mw` como segunda opinion sobre la referencia RTE para posicionar en mercados day-ahead e intradiarios.
- **Programacion de unidades flexibles**: un operador con ciclos combinados o bombeo puede usar la demanda corregida como input para decidir arranques y paradas horarias, ya que la salida es exactamente una rejilla de 24 horas con granularidad horaria.
- **Gestion de cartera de comercializacion**: las comercializadoras que compran energia con antelacion pueden comparar la previsión propia con `mtst_forecast_mw` para dimensionar el margen de desvio y reducir el coste de los ajustes del sistema.
- **Agregadores de demanda y respuesta**: para estimar la demanda residual de un portafolio de clientes en un dia concreto y planificar activaciones de reduccion de consumo hora a hora.
- **Investigacion y benchmarking de correccion de residuos**: el checkpoint sirve como instancia de referencia reproducible (pesos + escaladores + `features.json`) para comparar estrategias de residual learning frente a pronosticos directos, siempre sobre un split cronologico held-out.
- **Integracion en pipelines de CI como smoke test**: los tests incluidos y la firma de `forecast_day` permiten validar que un pipeline de ingenieria de features sigue produciendo las 24 filas y las columnas esperadas tras cada refactorizacion.
- **Prototipado rapido en portatil**: al ejecutarse en CPU o MPS con una ventana de 24 horas, permite montar un cuaderno de evaluacion sin acceso a GPU antes de invertir en infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La propia model card indica que deben anadirse los resultados del conjunto de test antes de la publicacion: recomienda evaluar contra RTE sobre un conjunto estrictamente cronologico y held-out, reportando MAE (MW), RMSE (MW), MAPE (%), R² y, si los intervalos se calibran de forma independiente, cobertura y anchura de intervalo. No hay valores de validacion publicados ni comparaciones numericas con otras referencias.

## Requisitos de hardware

- **VRAM estimada**: no disponible; el numero de parametros no se publica y depende de la configuracion guardada en `model.pt`. No es posible dar una cifra fiable de VRAM sin inspeccionar el state dict.
- **GPU recomendadas**: no disponible. Cualquier GPU CUDA compatible con la version de PyTorch instalada deberia servir; el cuello de botella esperado es la carga del modelo, no el calculo, dado el reducido tamano de la ventana (24 x 24).
- **GPU consumer**: muy probablemente viable en cualquier GPU consumer reciente, e incluso en CPU, porque la entrada es una matriz de 24 filas y la salida 24 valores. No hay mediciones publicadas de latencia ni de memoria.
- **Opciones de despliegue**: `inference.py` del propio repositorio (CLI o funcion Python) sobre PyTorch, con `--device cpu|mps|cuda`. No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni ONNX Runtime, que no aplican a este tipo de checkpoint.
- **Latencia y throughput**: no disponibles. No se han publicado mediciones.
- **Almacenamiento**: repositorio de 0.0 GB segun metadatos; requiere ademas `torch`, `numpy`, `pandas`, `scikit-learn` y `joblib`.

## Comparativa con modelos similares

No se dispone de datos verificados de parametros, contexto, rendimiento ni licencia de las alternativas en la informacion proporcionada; las celdas no confirmadas se marcan como no disponibles.

| Modelo | Enfoque | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Alexandro24B/mtst-rte-day-ahead` | Correccion de residuo sobre pronostico RTE, transformer multirresolucion | no disponible | 24 h de entrada / 24 h de salida | no publicado | no disponible | HuggingFace, 0 descargas |
| Pronostico day-ahead de RTE (referencia corregida) | Pronostico operativo del gestor de red | no aplica | day-ahead horario | referencia del sector, no comparable directamente | sujeta a los terminos de la fuente RTE | Publica como dato operativo |
| Modelos supervisados tipo PatchTST entrenados ad hoc | Pronostico directo de la serie | no disponible | configurable | no disponible | habitualmente abierta, verificar | Requiere entrenamiento propio |
| Modelos fundacionales de series temporales (Chronos, TimesFM, Moirai) | Pronostico zero-shot de proposito general | no disponible | variable | no disponible | variable segun modelo | Publicos, pero no especializados en demanda francesa |

La diferencia funcional clave frente a las alternativas genericas es que este checkpoint **no compite como predictor directo**: su salida es un residuo y presupone la disponibilidad del pronostico de RTE y de toda la ingenieria de features original.

## Limitaciones y advertencias

- **Dependencia de la referencia RTE**: el modelo solo corrige; si el pronostico de RTE no esta disponible en el momento de emitir la prediccion, el checkpoint no es utilizable.
- **Dependencia estricta de la ingenieria de features**: hay que replicar nombres, orden, unidades (MW en `rte_forecast_d1_mw_disp`), tratamiento de valores ausentes y convenciones de calendario del entrenamiento. Cualquier desviacion invalida la prediccion sin aviso claro.
- **Fuga de informacion temporal**: esta prohibido suministrar consumo realizado futuro u otra informacion no disponible en el momento del pronostico; hacerlo produce metricas optimistas e inutilizables en produccion.
- **Horario de verano (DST)**: `inference.py` no gestiona dias de 23 o 25 horas ni construye la rejilla de 24 horas; hay que prepararla aguas arriba y no tratar una hora ausente rellenada con cero como observacion valida.
- **Generalizacion limitada**: el autor advierte explicitamente que el modelo puede no generalizar fuera de la distribucion de entrenamiento (demanda francesa, periodo y regimenes concretos).
- **Sin metricas de test publicadas**: no hay MAE, RMSE, MAPE ni R² de un conjunto held-out; la model card pide anadir estos resultados antes de la publicacion. Sin ellos no es posible justificar su uso en produccion.
- **Intervalos no calibrados**: el transformer produce solo prediccion puntual; los intervalos empiricos citados en la model card no se generan directamente y su cobertura nominal del 95% no esta garantizada bajo cambio de distribucion.
- **Licencia no especificada**: al no declararse licencia, no hay autorizacion explicita de uso comercial; ademas los datos de RTE utilizados tienen sus propias condiciones de uso que deben respetarse y citarse.
- **Riesgo de alucinacion**: no aplica en el sentido de texto, pero si existe riesgo de predicciones fisicamente implausibles (residuos atipicos) fuera de distribucion; conviene aplicar validacion de rangos y sanity checks.
- **Madurez del artefacto**: 0 descargas, 0 likes, una unica instancia ajustada y sin validacion independiente por terceros. Tratar como prototipo de investigacion, no como servicio.
- **Idioma**: la documentacion y los tags estan en ingles; no hay version en castellano ni soporte multilingue (no relevante para el dominio, pero si para la integracion documental).
- **Sesgos**: no documentados por el autor. Cabria esperar sesgo hacia los patrones de demanda del periodo de entrenamiento (estacionalidad, festivos, clima, cambios de regimen por precio o autoconsumo), no evaluado en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Alexandro24B/mtst-rte-day-ahead
- Libreria `mtst-forecasting` en PyPI: https://pypi.org/project/mtst-forecasting/
- Repositorio de archivos del modelo: `model.pt`, `scaler_X.joblib`, `scaler_y.joblib`, `features.json`, `inference.py`, `tests/test_inference.py`
- Fuente de datos y pronosticos de referencia: RTE (el autor indica citar la fuente concreta utilizada y respetar su licencia); no se proporciona URL especifica en la informacion disponible.
- Paper, blog o demo del modelo: no disponible.
- Resultados de busqueda web: no se han encontrado enlaces tecnicos relevantes al modelo; los resultados devueltos por la busqueda no guardan relacion con este checkpoint y se descartan.
