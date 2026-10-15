# ProbioticFarmer/hyperliquid-2x3-benchmark

## Resumen

Este repositorio no es un modelo de lenguaje, sino un banco de pruebas (benchmark) reproducible implementado como Hugging Face Space con SDK Docker. Compara tres implementaciones de gradient boosting sobre datos tabulares —CatBoost, XGBoost y Scikit-Learn HistGradientBoosting— aplicadas a microestructura de mercado del exchange Hyperliquid. Lo publica el usuario ProbioticFarmer (identificado en los resultados de busqueda como Joshua Heaton) y en el momento de redactar esta ficha acumula 0 descargas y 0 likes, por lo que no cuenta con validacion independiente.

El objetivo declarado es una formulacion multidimensional: predecir a quien seguir, con que posiciones de activos y bajo que condiciones de mercado mas amplias. La evaluacion se realiza sobre la ventana fuera de muestra mas reciente (2026-09-14 a 2026-10-13) mediante un esquema de particion walk-forward con purga y embargo, y la optimizacion de hiperparametros se hace con 100 trials de optimizacion bayesiana (Optuna TPE) por familia de modelo, tomando como metrica objetivo la PR-AUC fuera de fold.

Su relevancia es acotada pero concreta: sirve como plantilla de evaluacion rigurosa para equipos que trabajan con datos financieros tabulares y necesitan comparar librerias GBDT bajo control de fugas temporales. No genera texto, no tiene pesos publicados y no debe confundirse con un LLM: la arquitectura, el contexto y las capacidades de un transformer no aplican aqui.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplicable (no es una red neuronal; benchmark de gradient boosting tabular con tres familias: CatBoost, XGBoost, HistGradientBoosting) |
| Parametros totales | no disponible (los hiperparametros por familia se optimizan con Optuna, pero no se publican valores) |
| Parametros activos | no aplicable (no es un modelo Mixture of Experts) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no aplicable (no se publican pesos) |
| Idiomas soportados | no aplicable (artefacto de codigo y metricas) |
| Licencia | no disponible (la model card no declara licencia; el repositorio solo lleva el tag region:us) |
| Formato de pesos | no aplicable (el artefacto es codigo, incluido app.py, y resultados; no se distribuyen pesos) |
| Tipo de artefacto | Hugging Face Space con SDK Docker, app_port 7860 |
| Tarea objetivo | Prediccion de "a quien seguir para que posiciones de activos bajo que condiciones" (formulacion multidimensional) |
| Conjunto de evaluacion | Ventana fuera de muestra 2026-09-14 a 2026-10-13, con particion purged and embargoed walk-forward |
| Metrica objetivo | PR-AUC fuera de fold (Out-of-Fold Precision-Recall AUC) |
| Otras metricas reportadas | ROC-AUC, Brier score, latencia |
| Optimizacion | 100 trials de optimizacion bayesiana (Optuna TPE) por familia de modelo |
| Hardware de referencia | Recursos maximos de Hugging Face Pro: NVIDIA A10G o A100, o 16-32 vCPU |
| Descargas / likes | 0 / 0 |
| Fechas del repositorio | Creado 2026-10-15T02:33:22Z; actualizado 2026-10-15T02:48:20Z |

## Arquitectura y entrenamiento

El diseno es un benchmark de dos ejes por tres familias de modelos de gradient boosting. La model card denomina al conjunto "2x3 Microstructure Benchmark" pero no explicita a que corresponde el eje de dos; el eje de tres son las implementaciones CatBoost, XGBoost y Scikit-Learn HistGradientBoosting. El resultado se materializa en una matriz de rendimiento en tiempo real con PR-AUC, ROC-AUC, Brier score y latencia.

No hay datos de entrenamiento de un modelo fundacional ni fases de RLHF o DPO, porque no es un modelo generativo. La parte metodologica destacable es el control de fugas temporales: la evaluacion usa un split walk-forward con purga y embargo sobre la ventana fuera de muestra de 2026-09-14 a 2026-10-13, lo que evita que informacion futura contamine el entrenamiento, un requisito habitual en series temporales financieras. Cada familia se ajusta mediante 100 trials de optimizacion bayesiana con el muestreador TPE de Optuna, optimizando PR-AUC fuera de fold. La composicion exacta del dataset de microestructura de Hyperliquid, el numero de filas, las features y el criterio de etiquetado no se detallan en la informacion disponible.

## Capacidades

- Entrenamiento y evaluacion comparativa de tres familias de gradient boosting sobre datos tabulares: CatBoost, XGBoost y Scikit-Learn HistGradientBoosting.
- Optimizacion bayesiana de hiperparametros con Optuna (TPE) y 100 trials por familia, con PR-AUC fuera de fold como funcion objetivo.
- Validacion temporal con esquema purged and embargoed walk-forward, adecuada para datos financieros con autocorrelacion y solapamiento de etiquetas.
- Calculo y reporte de PR-AUC, ROC-AUC, Brier score (calidad de calibracion probabilistica) y latencia de inferencia.
- Servicio de dashboard en tiempo real mediante WebSocket/HTTP en el puerto 7860, con visualizacion de la matriz 2x3 y de los logs de trials de optimizacion.
- Despliegue reproducible como Hugging Face Space con SDK Docker.

No dispone de generacion de texto, razonamiento en lenguaje natural, codigo, matematicas simbolicas, vision, audio, tool calling, function calling, capacidades de agente, multi-step reasoning ni soporte multilingue. Cualquier atribucion de ese tipo a este repositorio seria incorrecta.

## Casos de uso

- Seleccion de libreria GBDT para produccion financiera: el benchmark proporciona un protocolo con purga y embargo que permite decidir entre CatBoost, XGBoost e HistGBDT con una metrica objetiva (PR-AUC) y datos de latencia, en lugar de elegir por preferencia del equipo.
- Investigacion en copytrading y seguimiento de posiciones: la formulacion objetivo ("a quien seguir para que posiciones bajo que condiciones") encaja con sistemas que priorizan carteras o traders a replicar, usando probabilidades calibradas para ordenar candidatos.
- Modelado de microestructura de Hyperliquid: el repositorio sirve como base para experimentar con features de libro de ordenes, flujo de operaciones y estado de posiciones del exchange, reutilizando el pipeline de evaluacion.
- Sistemas de alertas con umbral probabilistico: al reportar Brier score ademas de PR-AUC, permite calibrar umbrales de decision y estimar el coste esperado de falsos positivos y falsos negativos antes de desplegar.
- Plantilla de evaluacion temporal para equipos de data science: el esquema walk-forward con purga y embargo es reutilizable en cualquier problema de prediccion con etiquetas solapadas (fraude, churn, riesgo de credito) simplemente sustituyendo el dataset.
- Monitorizacion de experimentos en directo: el dashboard del puerto 7860 permite seguir los trials de Optuna y la matriz de metricas mientras se ejecutan las optimizaciones, util en sesiones largas de ajuste.
- Baseline interno antes de modelos mas complejos: los resultados de GBDT sobre features tabulares de mercado constituyen una referencia razonable para justificar o descartar arquitecturas de deep learning mas costosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe que metricas se calculan y como se evaluan, pero no incluye cifras numericas de PR-AUC, ROC-AUC, Brier score ni latencia para ninguna de las tres familias.

| Metrica | Definicion en el repositorio | Valor publicado |
|---|---|---|
| PR-AUC | Precision-Recall AUC fuera de fold, metrica objetivo de la optimizacion bayesiana | no disponible |
| ROC-AUC | Area bajo la curva ROC en la ventana fuera de muestra | no disponible |
| Brier score | Error cuadratico medio de las probabilidades predichas (calibracion) | no disponible |
| Latencia | Tiempo de inferencia por familia de modelo | no disponible |

Tampoco se publican comparaciones numericas frente a CatBoost, XGBoost o HistGBDT de referencia, ni frente a modelos externos.

## Requisitos de hardware

- Perfil declarado por el autor: recursos maximos de Hugging Face Pro, es decir, NVIDIA A10G o A100, o alternativamente 16-32 vCPU.
- VRAM estimada para inferencia: no disponible. Al tratarse de modelos GBDT sobre datos tabulares, el consumo de memoria depende del numero de arboles y de la profundidad, parametros que no se publican.
- GPU recomendadas: A10G o A100 segun la model card. No se especifica si el entrenamiento aprovecha CUDA en las tres familias (CatBoost y XGBoost tienen soporte GPU; HistGradientBoosting de Scikit-Learn se ejecuta en CPU).
- Compatibilidad con GPU de consumo: no disponible. No se documenta el comportamiento en RTX 4090, RTX 3090 ni similares, ni el tamano del dataset empleado.
- Opciones de despliegue: Hugging Face Spaces con SDK Docker (app_port 7860) y ejecucion local del propio app.py. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: la latencia se mide y se muestra en el dashboard, pero no se han publicado valores concretos. No hay datos de throughput.

## Comparativa con modelos similares

El benchmark es en si mismo una comparativa entre tres implementaciones de gradient boosting. No existe una comparacion publicada con otros benchmarks de microestructura ni con modelos de lenguaje, y esa comparacion careceria de sentido por diferencia de categoria.

| Alternativa | Categoria | Rol en este repositorio | Parametros | Contexto | Licencia | Resultados publicados |
|---|---|---|---|---|---|---|
| CatBoost | Gradient boosting tabular | Familia evaluada (100 trials Optuna) | no disponible | no aplicable | no disponible | no disponible |
| XGBoost | Gradient boosting tabular | Familia evaluada (100 trials Optuna) | no disponible | no aplicable | no disponible | no disponible |
| Scikit-Learn HistGradientBoosting | Gradient boosting tabular | Familia evaluada (100 trials Optuna) | no disponible | no aplicable | no disponible | no disponible |

Fuera de estas tres familias, no disponible: no se identifican en la informacion proporcionada otros benchmarks comparables de microestructura de Hyperliquid con los que contrastar resultados.

## Limitaciones y advertencias

- No es un modelo de lenguaje. Cualquier ficha, indice o catalogo que lo clasifique como LLM, con contexto o cuantizaciones, seria erroneo.
- Licencia no declarada. El repositorio solo incluye el tag region:us, sin fichero de licencia ni texto equivalente, por lo que el uso comercial del codigo y de los resultados queda sin cobertura legal explicita.
- Ausencia de validacion independiente: 0 descargas y 0 likes en el momento de la consulta, sin replicaciones conocidas.
- Sin resultados publicados. No hay cifras de PR-AUC, ROC-AUC, Brier score ni latencia, de modo que no es posible evaluar si el rendimiento es competitivo.
- Sesgos potenciales del dataset: al derivarse de un unico exchange (Hyperliquid) y de una unica ventana temporal de un mes, los patrones aprendidos pueden reflejar condiciones de mercado especificas y no generalizar a otros periodos, activos o plataformas.
- Riesgo de sobreajuste en la optimizacion: 100 trials de Optuna por familia sobre una metrica fuera de fold pueden sobreajustar la particion de validacion si el numero de folds es reducido; no se documenta el numero de folds ni el esquema exacto de purga y embargo.
- Ambiguedad metodologica: el eje de dos del diseno "2x3" no se explicita en la model card, lo que dificulta reproducir la matriz tal y como se presenta.
- Composición del dataset no documentada: se desconoce el numero de muestras, las features, el criterio de etiquetado y el tratamiento de valores nulos.
- Tono promocional del README: expresiones como "High-Budget" o "Maxed-out resources" describen la configuracion de hardware, no una validacion cientifica; conviene tratarlas como marketing y no como evidencia.
- Uso responsable: cualquier aplicacion a decisiones de inversion o asignacion de capital debe acompanarse de validacion propia, controles de riesgo y supervision humana; el repositorio es una herramienta de evaluacion, no un sistema de trading.
- Riesgo de alucinacion: no aplicable, ya que el artefacto no genera texto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ProbioticFarmer/hyperliquid-2x3-benchmark
- Model card (mismo recurso, seccion README): https://huggingface.co/ProbioticFarmer/hyperliquid-2x3-benchmark
- Perfil del autor y datasets relacionados, incluido hyperliquid-augmented-copytrading: https://huggingface.co/datasets/ProbioticFarmer/
- Paper del metodo: no disponible
- Blog o documentacion tecnica adicional: no disponible
- Repositorio de codigo independiente: no disponible
- Demo publica: no disponible (el dashboard se expone en el puerto 7860 del propio Space cuando esta activo)

Nota sobre la busqueda web: los resultados adicionales obtenidos (llm-stats.com y benchlm.ai) son leaderboards genericos de modelos de lenguaje y no guardan relacion con este repositorio; se omiten por no ser fuentes relevantes para esta ficha.
