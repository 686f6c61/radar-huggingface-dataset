# occams/Xiaomi-TabLDM

## Resumen

Xiaomi-TabLDM es un modelo fundacional para datos tabulares orientado a clasificacion y regresion mediante aprendizaje en contexto (in-context learning). Lo desarrolla Xiaomi y se distribuye a traves del repositorio de Hugging Face `occams/Xiaomi-TabLDM`. Su propuesta central es que un unico modelo preentrenado puede resolver tareas predictivas sobre un conjunto de datos tabular sin ajuste fino especifico: basta con aportar ejemplos etiquetados como contexto y el modelo produce predicciones en un unico paso hacia delante.

El modelo se preentrena exclusivamente con datos sinteticos generados a partir de modelos causales estructurales (SCM), lo que amplia la cobertura y diversidad de los datos tabulares de entrenamiento y facilita el escalado de capacidad. La arquitectura incorpora agrupacion de caracteristicas en doble flujo (dual-stream feature grouping), una variante ligera de Attention Residual y una capa de mezcla de expertos dispersa (sparse MoE), junto con una estrategia de entrenamiento en tres etapas.

Su relevancia actual radica en el rendimiento reportado en benchmarks de regresion tabular: primer puesto en OpenML-CTR23 y segundo puesto en regresion en TALENT, TabArena y BCCO, con un coste computacional notablemente inferior al de los modelos lideres. Ademas, incorpora escalado de computo en tiempo de prueba (test-time scaling) y una interfaz compatible con scikit-learn, lo que reduce la barrera de adopcion en flujos de ciencia de datos convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con sparse Mixture-of-Experts, dual-stream feature grouping y Attention Residual ligera |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo tabular, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoints `.ckpt` (PyTorch); tamano del repo 2,8 GB |
| Libreria | custom (`tabldm`) |
| Dependencias | torch>=2.2, scikit-learn>=1.3.0, numpy, scipy, einops>=0.7, psutil, tqdm>=4.64.0, huggingface-hub; numba opcional |
| Descargas en Hugging Face | 432 |
| Likes | 26 |
| Fecha de creacion | 2026-08-28 |
| Ultima actualizacion | 2026-10-13 |

## Arquitectura y entrenamiento

Xiaomi-TabLDM es un transformer especializado en datos tabulares que combina varias innovaciones arquitectonicas. La agrupacion de caracteristicas en doble flujo (dual-stream feature grouping) permite procesar las columnas de entrada por grupos con flujos diferenciados, mientras que la Attention Residual ligera reduce el coste de las conexiones residuales convencionales. La capa de mezcla de expertos dispersa (sparse MoE) introduce especializacion por experto, de modo que el modelo aprende interacciones de caracteristicas mas ricas en dominios tabulares diversos. El modelo incorpora ademas una capa de distribucion por cuantiles, con aceleracion JIT opcional mediante numba.

El preentrenamiento se realiza exclusivamente sobre datos sinteticos generados a partir de modelos causales estructurales (SCM), lo que constituye una decision de diseno central: evita depender de corpus tabulares reales y permite controlar la diversidad y la cobertura de los escenarios de entrenamiento. El proceso sigue una estrategia de tres etapas. La model card no especifica el numero de tokens de entrenamiento ni la composicion detallada del dataset, y tampoco menciona si se emplearon tecnicas de RLHF o DPO (poco probables en un modelo tabular). Como innovacion adicional, el modelo soporta escalado de computo en tiempo de prueba: asignar mas computo en inferencia mejora de forma consistente el rendimiento predictivo respecto al modelo base.

## Capacidades

- Clasificacion tabular mediante in-context learning, con salida de probabilidades por clase a traves de `predict_proba`.
- Regresion tabular mediante in-context learning, con predicciones puntuales en un unico paso hacia delante.
- Prediccion sin ajuste fino: el metodo `fit` no actualiza pesos, solo preprocesa el contexto etiquetado y carga el modelo preentrenado.
- Escalado de computo en tiempo de prueba (test-time scaling) para mejorar la precision a costa de mas inferencia.
- Cache de KV para reutilizar las proyecciones del contexto en llamadas repetidas a `predict` sobre los mismos datos de entrenamiento.
- Interfaz compatible con scikit-learn (`TabLDMClassifier`, `TabLDMRegressor`), integrable en pipelines existentes.
- Soporte de offloading a CPU y disco para escalar a conjuntos de datos de mayor tamano.
- No dispone de capacidades de generacion de texto, vision, audio, tool calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.

## Casos de uso

- Modelado predictivo rapido en ciencia de datos: un analista puede entrenar un clasificador o regresor sobre un dataset tabular sin busqueda de hiperparametros ni ajuste fino, usando `fit` y `predict` como con cualquier estimador de scikit-learn. Es adecuado porque el modelo generaliza a traves del contexto etiquetado en una sola pasada.
- Prototipado de modelos de riesgo crediticio o scoring: el modelo permite obtener predicciones de probabilidad por clase sobre datos estructurados de clientes sin entrenamiento especifico, lo que acelera la validacion inicial de hipotesis antes de invertir en un modelo dedicado.
- Prediccion de demanda y series tabulares agregadas: con la variante de regresion, se pueden estimar magnitudes continuas (ventas, consumo, precios) a partir de variables explicativas tabulares, reutilizando el contexto cacheado para inferencias repetidas sobre el mismo conjunto de entrenamiento.
- Analisis de datos cientificos y experimentales: datasets de laboratorio, sensores o ensayos con variables mixtas se pueden abordar con el modelo como baseline fuerte antes de desarrollar modelos especificos de dominio, gracias a su preentrenamiento sobre SCM sinteticos diversos.
- Evaluacion comparativa de pipelines de ML: al ser compatible con scikit-learn, se puede insertar como un estimador mas en frameworks de comparacion (por ejemplo, TabArena o TALENT) para contrastar su rendimiento frente a gradient boosting o redes tabulares dedicadas.
- Despliegue en entornos con recursos limitados: el soporte de offloading a CPU y disco y el uso de cache KV permiten ejecutar inferencia en maquinas sin GPU dedicada para conjuntos de datos moderados, reduciendo el coste de infraestructura frente a alternativas que requieren entrenamiento completo.
- Prediccion por lotes en produccion con contexto reutilizado: cuando el conjunto de entrenamiento es estable, la cache de contexto evita recalcular proyecciones en cada llamada, lo que resulta adecuado para tareas de scoring periodico sobre nuevos registros.

## Benchmarks y rendimiento

La model card reporta resultados en forma de rankings y graficos, sin tablas numericas detalladas de metricas por dataset. Los datos explicitos disponibles son los siguientes:

| Benchmark | Resultado reportado |
|---|---|
| OpenML-CTR23 (33 datasets de regresion) | 1.er puesto en ranking medio |
| TALENT (regresion) | 2.º puesto en ranking medio |
| TabArena (regresion, Elo) | 2.º Elo mas alto; 82 % menos tiempo de entrenamiento y 68 % menos tiempo de prediccion que TabFM, el primero |
| BCCO (clasificacion y regresion) | 2.º puesto en regresion; ranking combinado no detallado numericamente |

No se han publicado en la informacion disponible valores numericos de MMLU, HumanEval, GSM8K ni metricas equivalentes, que no aplican a un modelo tabular. Tampoco se detallan las metricas absolutas (RMSE, AUC, accuracy) por dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio de pesos ocupa 2,8 GB, lo que sugiere que el modelo en precision completa o media puede caber en GPUs de consumo con 8-16 GB de VRAM, aunque el consumo real depende del tamano del contexto tabular y del lote.
- GPU recomendadas: la model card recomienda GPU para conjuntos de datos grandes, sin especificar modelos concretos. No se indican A100, H100 ni RTX 4090 de forma explicita.
- GPU de consumo: no se confirma compatibilidad con modelos concretos; el requisito practico es disponer de VRAM suficiente para los pesos y el contexto, con opcion de offloading a CPU y disco.
- Opciones de despliegue: paquete Python propio (`pip install .`) con API compatible con scikit-learn; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles como cifras absolutas. La model card indica que la cache KV acelera llamadas repetidas a `predict` y que el modelo es mas rapido que TabFM (68 % menos tiempo de prediccion en TabArena regresion).

## Comparativa con modelos similares

| Modelo | Categoria | Parametros | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Xiaomi-TabLDM | Fundacional tabular (ICL) | no disponible | no disponible | 1.º en OpenML-CTR23; 2.º en TALENT, TabArena y BCCO (regresion) | Apache 2.0 | Hugging Face (`occams/Xiaomi-TabLDM`) |
| TabFM | Fundacional tabular (ICL) | no disponible | no disponible | 1.º en TabArena regresion (Elo); mas lento que Xiaomi-TabLDM | no disponible | no disponible |
| TabPFN | Fundacional tabular (ICL) | no disponible | no disponible | Incluido en las comparativas de TALENT, TabArena y BCCO; posicion no detallada | no disponible | no disponible |
| Gradient boosting (p. ej. XGBoost, LightGBM) | Modelos tabulares clasicos | no aplica | no aplica | Baseline habitual en los benchmarks citados; posicion no detallada | no disponible | no disponible |

La informacion proporcionada solo nombra explicitamente a TabFM y menciona los benchmarks TALENT, TabArena y BCCO, sin detallar parametros, contexto ni licencias de los competidores. Los datos de TabPFN y de los gradient boosting no se confirman en la model card.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible. Al entrenarse solo con datos sinteticos generados por SCM, el modelo puede no capturar sesgos ni patrones idiosincraticos de datos reales de dominios especificos.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero existe riesgo de predicciones poco calibradas fuera de la distribucion cubierta por los SCM sinteticos de entrenamiento.
- Limitaciones de contexto o idioma: la longitud de contexto tabular no se especifica; el rendimiento puede degradarse con conjuntos de datos muy grandes o con muchas columnas. No es un modelo linguistico, por lo que no soporta tareas de texto.
- Restricciones de licencia: licencia Apache 2.0, que permite uso comercial con atribucion y sin garantias; conviene revisar los terminos exactos del repositorio y del informe tecnico.
- Caveats para produccion: `fit` no entrena, solo preprocesa el contexto; el modelo requiere cargar los checkpoints (`clf_default.ckpt`, `reg_default.ckpt`) y no se documentan procesos de calibracion, monitorizacion de deriva ni validacion estadistica. La interfaz es custom y no sigue la API de Hugging Face `transformers`, lo que limita su integracion con ecosistemas estandar de serving.
- No se documentan requisitos de version de Python, ni resultados de robustez ante valores faltantes, variables categoricas de alta cardinalidad o datasets desbalanceados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/occams/Xiaomi-TabLDM
- Informe tecnico (arXiv): https://arxiv.org/abs/2609.03880
- README en chino: https://huggingface.co/occams/Xiaomi-TabLDM/blob/main/README_CN.md
- Figura del framework: https://huggingface.co/occams/Xiaomi-TabLDM/resolve/main/assets/Xiaomi-TabLDM_Framework.png
- Figura de rendimiento en TALENT: https://huggingface.co/occams/Xiaomi-TabLDM/resolve/main/assets/Xiaomi-TabLDM_TALENT.png
- Figura de rendimiento en TabArena: https://huggingface.co/occams/Xiaomi-TabLDM/resolve/main/assets/Xiaomi-TabLDM_TabArena.png
- Figura de rendimiento en BCCO: https://huggingface.co/occams/Xiaomi-TabLDM/resolve/main/assets/Xiaomi-TabLDM_BCCO.png
- Figura de rendimiento en OpenML-CTR23: https://huggingface.co/occams/Xiaomi-TabLDM/resolve/main/assets/Xiaomi-TabLDM_OpenML-CTR23.png
