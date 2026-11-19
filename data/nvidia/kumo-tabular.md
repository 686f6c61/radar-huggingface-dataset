# nvidia/Kumo-Tabular

## Resumen

Kumo Tabular es un modelo fundacional preentrenado por NVIDIA para datos tabulares, orientado especificamente a tareas de clasificacion y regresion sobre datos estructurados. A diferencia de los modelos de lenguaje, su entrada no es texto sino tablas con columnas de tipos heterogeneos (numericas, categoricas, etc.), y su funcionamiento se basa en el aprendizaje en contexto (*in-context learning*): se le proporcionan ejemplos etiquetados como contexto y predice las probabilidades de clase para nuevas filas de consulta, sin necesidad de reentrenamiento por tarea.

El modelo se distribuye a traves de la libreria `structured-data-models` (paquete `sdm`), que gestiona la conversion de DataFrames de pandas a tensores tabulares (`TableTensor`), la inferencia de tipos de columna (`infer_stypes`) y la ejecucion del modelo con soporte para CUDA y precision mixta en float16. El repositorio de pesos ocupa 2,4 GB, lo que sugiere un modelo de tamano moderado apto para despliegue en una sola GPU.

Su relevancia actual radica en que cubre un nicho poco atendido por los modelos fundacionales genericos: el modelado predictivo sobre datos tabulares, donde los enfoques clasicos (gradient boosting, regresion logistica) requieren entrenamiento especifico por conjunto de datos. Kumo Tabular propone un paradigma de cero entrenamiento por tarea mediante contexto etiquetado, con licencia OpenMDW 1.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo fundacional tabular; detalles no publicados en la informacion disponible) |
| Parametros totales | no disponible (repo de pesos de 2,4 GB) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo usa 300 filas de contexto) |
| Tipos de cuantizacion | no disponible; la model card usa float16 en CUDA mediante `torch.amp.autocast` |
| Idiomas soportados | no aplica / no disponible (datos tabulares, no texto) |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | no disponible (distribucion via libreria `structured-data-models`; el repo ocupa 2,4 GB) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo (tipo de transformer, mecanismos de atencion sobre columnas y filas, ni estrategia de tokenizacion de valores tabulares). La model card unicamente lo describe como un modelo fundacional tabular preentrenado para clasificacion y regresion, y el uso previsto revela un esquema de aprendizaje en contexto: el modelo recibe un conjunto de contexto (`x_context`, `y_context`) y un conjunto de consulta (`x_query`), y devuelve probabilidades por clase.

Tampoco se publican datos sobre el volumen de tokens o tablas de entrenamiento, la composicion del corpus, ni si se emplearon tecnicas de ajuste como RLHF o DPO (poco probables en este dominio). Un parametro operativo relevante que si aparece es `num_estimators=8`, lo que sugiere un mecanismo de ensemble o de multiples pasadas internas durante la inferencia para estabilizar las predicciones. La inferencia se ejecuta con autocast a float16 en GPU, lo que indica soporte nativo para aceleracion en CUDA.

## Capacidades

- Clasificacion tabular: prediccion de probabilidades de clase para filas nuevas a partir de ejemplos etiquetados en contexto.
- Regresion tabular: el modelo declara soporte para tareas de regresion, aunque el ejemplo publicado solo cubre clasificacion.
- Aprendizaje en contexto: no requiere entrenamiento por conjunto de datos; basta con proporcionar filas etiquetadas como contexto.
- Inferencia de tipos de columna: la libreria `sdm.infer_stypes` detecta tipos (numericos, categoricos) y permite sobrescrituras manuales (por ejemplo, forzar la columna objetivo a `categorical`).
- Manejo de columnas heterogeneas: soporta tablas con mezcla de variables numericas y categoricas mediante `TableTensor`.
- Ejecucion en GPU y CPU: el ejemplo selecciona CUDA si esta disponible y cae a CPU en caso contrario.
- Precision mixta: soporte de float16 via `torch.amp.autocast` en CUDA.
- Ensemble interno: el parametro `num_estimators` permite configurar el numero de estimadores por prediccion.
- No disponible: soporte de tool calling, agentes, razonamiento multi-paso, vision, audio o capacidades multilingues; no aplican a un modelo tabular.

## Casos de uso

- Scoring de riesgo crediticio: se proporcionan solicitudes historicas etiquetadas (concedido/impagado) como contexto y el modelo estima la probabilidad de impago de nuevas solicitudes, evitando reentrenar un modelo por cada producto financiero.
- Deteccion de fraude en transacciones: con un lote de transacciones etiquetadas como contexto, el modelo puntua transacciones nuevas en tiempo casi real; el uso de float16 y un unico modelo simplifica el despliegue frente a pipelines de feature engineering y reentrenamiento.
- Prediccion de churn en SaaS: a partir de registros de clientes con variables de uso, facturacion y antiguedad, se obtienen probabilidades de baja para priorizar acciones de retencion, actualizando el contexto con datos recientes sin reentrenar.
- Triaje clinico sobre datos estructurados: con registros tabulares de pacientes etiquetados, el modelo estima probabilidades de clase para nuevos casos; la inferencia local en GPU permite mantener los datos dentro de la infraestructura del hospital.
- Mantenimiento predictivo industrial: usando lecturas de sensores y etiquetas de fallo previo como contexto, el modelo clasifica el estado de nuevos equipos o estima la variable objetivo de regresion asociada al desgaste.
- Prototipado rapido en ciencia de datos: para evaluar la viabilidad de un problema de clasificacion antes de invertir en ingenieria de caracteristicas, se lanza el modelo con unas pocas centenas de filas de contexto y se obtiene una linea base en minutos.
- Clasificacion de leads en marketing: con historicos de conversion etiquetados, el modelo puntua leads entrantes por probabilidad de conversion, integrándose en un CRM mediante la API de Python de `sdm`.
- Enriquecimiento de pipelines ETL: uso del modelo como paso de puntuacion dentro de un flujo de datos, aplicando `TableTensor.from_pandas` sobre lotes y escribiendo las probabilidades resultantes en la tabla de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio de pesos ocupa 2,4 GB, por lo que en float16 la huella de pesos ronda los 2,4 GB y el consumo total dependera del tamano del contexto tabular y del numero de estimadores.
- GPU recomendadas: no disponibles en la informacion proporcionada; el codigo usa CUDA de forma generica y no fija modelos concretos.
- GPU de consumo: probablemente viable en tarjetas con 8 GB o mas de VRAM dado el tamano del repo, aunque esta estimacion no esta confirmada por el autor.
- CPU: soportada como fallback (`torch.device("cpu")`), sin datos de latencia.
- Opciones de despliegue: libreria oficial `structured-data-models` (`pip install structured-data-models`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kumo Tabular (NVIDIA) | Fundacional tabular (clasificacion/regresion) | no disponible | no disponible | OpenMDW 1.1 | Hugging Face + `structured-data-models` |
| TabPFN | Fundacional tabular (in-context) | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha |
| XGBoost / LightGBM | Gradient boosting (entrenamiento por tarea) | no aplica | no aplica | licencias permisivas | ampliamente disponible |

No se dispone de datos de rendimiento comparativo entre Kumo Tabular y estas alternativas en la informacion proporcionada; la comparacion se limita a categoria, licencia y forma de uso.

## Limitaciones y advertencias

- No se publican detalles de arquitectura, datos de entrenamiento ni evaluacion, lo que dificulta auditar sesgos o robustez del modelo.
- Riesgo de predicciones poco calibradas fuera de la distribucion de los datos de contexto; al ser aprendizaje en contexto, la calidad depende criticamente de la representatividad y el tamano de los ejemplos etiquetados.
- El ejemplo publicado usa 300 filas de contexto; se desconoce el limite maximo de filas o columnas soportado.
- No hay informacion sobre sesgos demograficos o de otro tipo en datos tabulares, un riesgo relevante en aplicaciones de credito, seguros o salud.
- La licencia OpenMDW 1.1 debe revisarse antes de uso comercial; las condiciones concretas no se detallan en la model card.
- El modelo no es generativo ni conversacional: no debe emplearse para tareas de texto, codigo o agentes.
- Dependencia de la libreria `structured-data-models` para la conversion de datos y la inferencia, lo que anade una dependencia de software especifica de NVIDIA.
- No se especifican garantias de soporte, versionado de pesos ni compatibilidad con otras herramientas del ecosistema tabular.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/Kumo-Tabular
- Repositorio de inferencia: https://github.com/NVIDIA/structured-data-models
- Sitio de NVIDIA: https://www.nvidia.com/
- Pagina de NVIDIA en Wikipedia: https://en.wikipedia.org/wiki/Nvidia
