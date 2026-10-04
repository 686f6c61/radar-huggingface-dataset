# CXu0630/mtg-price-catboost

## Resumen

`CXu0630/mtg-price-catboost` es un modelo de regresion tabular publicado por el usuario CXu0630 que estima un rango de precio en dolares estadounidenses para una impresion concreta de una carta de Magic: The Gathering. El termino "impresion" designa una combinacion de carta, edicion, tratamiento (frame/border) y acabado (finish); el modelo devuelve tres cuantiles calibrados (p10, p50 y p90) que conforman un intervalo de cobertura nominal del 80%. No es una red neuronal: es un `CatBoostRegressor` con funcion de perdida `MultiQuantile` sobre `log(price_avg)`, con profundidad 6, `l2_leaf_reg` 3 y tasa de aprendizaje 0,08, detenido por early stopping en la iteracion 2.709.

El modelo se apoya en 93 caracteristicas tabulares que describen la carta y su contexto de mercado (rareza, acabado, tratamiento de marco y borde, coste de maná, tipo, fuerza/resistencia, legalidades, tasas de aparicion en sobres, ranking EDHREC y artista). Deliberadamente excluye `set` y `set_name` para generalizar a ediciones no vistas durante el entrenamiento. Sobre la prediccion cuantilica se aplica una calibracion conformal por grupos (`group-conditional split-conformal calibration`): se ajusta una correccion aditiva distinta al intervalo [p10, p90] segun el bucket de mediana predicha (`<$1`, `$1–10`, `$10–100`, `$100+`) calculado sobre un split de calibracion reservado.

Su relevancia practica es acotada pero clara: es un baseline rapido, ejecutable solo en CPU y reproducible, pensado como "Modelo 1" de un proyecto mayor cuyo componente principal es un proceso gaussiano de kernel profundo ([`CXu0630/mtg-price-deep-gp`](https://huggingface.co/CXu0630/mtg-price-deep-gp)). Respecto a ese modelo, presenta menor error mediano, pero sus intervalos infra-cubren las cartas caras. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y un tamano de 0,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CatBoost `MultiQuantile` (gradient boosting sobre arboles de decision), regresion cuantilica p10/p50/p90 |
| Parametros totales | no aplica (modelo de arboles; profundidad 6, 2.709 iteraciones tras early stopping) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; consume 93 caracteristicas tabulares por fila de entrada |
| Tipos de cuantizacion | no disponible (el formato nativo `.cbm` no expone cuantizaciones tipo GGUF/AWQ) |
| Idiomas soportados | no disponibles (la entrada son columnas tabulares, no texto libre) |
| Licencia | `other` con nombre `wotc-fan-content` (Fan Content Policy de Wizards of the Coast) |
| Formato de pesos | `model.cbm` (formato nativo de CatBoost), acompanado de `config.json` y del codigo de inferencia `mtg_price_prediction/` |
| Tarea declarada (pipeline) | `tabular-regression` |
| Libreria | catboost |
| Tamano del repositorio | 0,0 GB |
| Fecha de creacion | 2026-10-03 |
| Fecha de ultima actualizacion | 2026-10-03 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un ensamblado de arboles de decision con boosting por gradiente implementado en CatBoost, configurado para regresion multi-cuantil. La perdida se calcula sobre `log(price_avg)`, y en inferencia se obtienen tres salidas por fila (p10, p50, p90) que se convierten de nuevo a dolares con `np.exp`. Los hiperparametros recogidos en el `README` son profundidad 6, `l2_leaf_reg` 3 y tasa de aprendizaje 0,08, con parada temprana en la iteracion 2.709. Las caracteristicas categoricas se rellenan con `__missing__` y se convierten a cadena antes de la prediccion, tal como muestra el ejemplo de uso del autor con CatBoost "en crudo".

El conjunto de datos de entrenamiento es [`CXu0630/mtg-card-market-dataset`](https://huggingface.co/datasets/CXu0630/mtg-card-market-dataset), con una fila por par (impresion, finish) y 142.012 filas con precio. Se construye a partir de [`pcwoods/mtg-card-prices`](https://huggingface.co/datasets/pcwoods/mtg-card-prices) (datos de Scryfall mas historico de precios de TCGplayer) y se enriquece con tasas de aparicion en sobres de [`CXu0630/mtg-print-distribution`](https://huggingface.co/datasets/CXu0630/mtg-print-distribution). El split de entrenamiento se reequilibra limitando a 8.000 filas cada uno de los 30 bins de log-precio, de forma que las comunes de baja calidad ("bulk commons") no dominen la perdida; los splits de calibracion y de test conservan la distribucion natural de precios.

La innovacion tecnica destacable es la capa de calibracion conformal condicional por grupos: en lugar de una correccion global, se ajusta una correccion aditiva separada al intervalo [p10, p90] para cada bucket de la mediana predicha (`<$1`, `$1–10`, `$10–100`, `$100+`) usando un split de calibracion aparte. Ademas, el autor documenta un ablation en el que anadir unas 350 columnas dispersas de etiquetas comunitarias empeoro la cobertura del intervalo en todos los tramos de precio, motivo por el que se mantuvo el conjunto "Tier A" (solo fundamentales). La particion de test se realiza por `oracle_id` para que ninguna carta aparezca simultaneamente en entrenamiento y test.

## Capacidades

- Regresion tabular multi-cuantil: devuelve `price_low`, `price_mid` y `price_high` en USD para cada impresion.
- Estimacion de intervalos calibrados: el intervalo nominal es del 80%, con correccion conformal dependiente del tramo de precio predicho.
- Generalizacion a ediciones no vistas: al excluir `set` y `set_name` de las caracteristicas, el modelo puede puntuar impresiones de sets no presentes en el entrenamiento.
- Puntuacion por lotes: el ejemplo del autor procesa DataFrames completos (el split de test suma 28.377 filas).
- Ejecucion en CPU: descrito explicitamente como baseline "fast CPU-only".
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni capacidades de agente: la entrada y la salida son exclusivamente tabulares y numericas.
- No soporta conversacion multi-turno ni procesamiento de lenguaje natural en ningun idioma.
- No incluye modo "thinking" ni decodificacion especulativa.

## Casos de uso

- Valoracion de inventario para tiendas especializadas: dado un listado de impresiones con sus 93 caracteristicas, el modelo devuelve un rango de precio por unidad, lo que permite estimar el valor de un stock completo en una sola pasada por lotes.
- Fijacion de precios en marketplaces: el intervalo [p10, p90] calibrado sirve como banda de referencia para definir precio de venta y margen minimo, en lugar de un unico punto estimado.
- Deteccion de oportunidades de compraventa: comparar el `price_mid` predicho con el precio de mercado observado puede senalar impresiones potencialmente infravaloradas, siempre que se asuma la infra-cobertura en tramos altos.
- Herramientas para jugadores: estimar el valor esperado de abrir producto sellado o de comprar singles concretos antes de una partida o un torneo, integrando el modelo en una app movil como llamada a un servicio de inferencia en CPU.
- Analisis de riesgo en compra de lotes: al disponer de intervalos por tramo, un comprador profesional puede decidir el descuento exigido segun la anchura del intervalo (por ejemplo, 1,40 en log-precio para cartas por debajo de 1 USD frente a 2,03 en cartas de mas de 100 USD).
- Enriquecimiento de pipelines ETL y dashboards: el modelo se puede ejecutar como paso adicional en un job de datos que ya construye las 93 caracteristicas, anadiendo columnas de rango de precio a tablas de analitica.
- Investigacion economica sobre coleccionables: el repo publica metricas por tramo (MAE logaritmico y cobertura) que permiten usar el modelo como referencia reproducible en estudios sobre mercados secundarios de cartas.
- Filtrado previo a la valoracion manual: en un flujo de tasacion, el modelo puede descartar las impresiones con intervalos estrechos en el tramo barato y derivar solo las caras a revision humana, dado que la cobertura cae al 52,3% en el tramo de 100 USD o mas.

## Benchmarks y rendimiento

Resultados del autor sobre el split de test reservado (28.377 impresiones, 20% del total, particionado por `oracle_id`). MAE en escala logaritmica para la mediana; la cobertura corresponde al intervalo calibrado del 80%.

| Precio real | n | MAE (log) | Cobertura 80% | Anchura media (log) |
|---|---|---|---|---|
| < $1 | 17.179 | 0,42 | 77,6% | 1,40 |
| $1–$10 | 7.641 | 0,61 | 82,9% | 2,08 |
| $10–$100 | 3.236 | 0,74 | 71,8% | 2,05 |
| $100+ | 321 | 1,14 | 52,3% | 2,03 |
| Global | 28.377 | 0,52 | 78,1% | 1,66 |

El autor indica que, frente al proceso gaussiano profundo, este modelo presenta menor error mediano, pero sus intervalos infra-cubren las cartas caras. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes), dado que no es un modelo de lenguaje.

## Requisitos de hardware

- Inferencia en CPU: el autor describe el modelo como baseline "fast CPU-only"; no requiere GPU para funcionar.
- VRAM estimada: no aplica en el caso CPU; no se especifica en la model card ningun requisito de VRAM para un hipotetico uso de la variante GPU de CatBoost.
- GPU recomendadas: no disponibles en la informacion proporcionada. CatBoost dispone de modo GPU, pero el autor no documenta haberlo usado para este modelo.
- Compatibilidad con GPU de consumo: el modelo es pequeno por construccion (profundidad 6 y repositorio de 0,0 GB), por lo que deberia caber en cualquier GPU de consumo si se optase por entrenamiento o inferencia acelerada, aunque no hay cifras confirmadas.
- Opciones de despliegue: libreria `catboost` de Python (carga directa de `model.cbm`), o la clase `CatBoostPredictor` incluida en el repositorio. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un transformer.
- Dependencias declaradas en el ejemplo del autor: `catboost`, `huggingface_hub`, `pandas` y `pyarrow`.
- Latencia y throughput: no disponibles. El unico dato indirecto es que el split de test completo (28.377 filas) se evalua como un lote, sin cifra de tiempo publicada.
- Almacenamiento: el repositorio completo ocupa 0,0 GB, por lo que el coste de disco es despreciable.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Error / rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `CXu0630/mtg-price-catboost` | CatBoost MultiQuantile | 93 caracteristicas tabulares | p10/p50/p90 en USD | MAE log 0,52 global; cobertura 78,1% | `wotc-fan-content` | HuggingFace, 0 descargas |
| `CXu0630/mtg-price-deep-gp` | Proceso gaussiano de kernel profundo | mismas caracteristicas del proyecto | intervalo de precio | Menor cobertura que el CatBoost segun el autor; mayor error mediano; comparacion aproximada (cada modelo evaluado en su propio split) | no disponible | HuggingFace |
| Otros modelos de precios de MTG | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada por el autor es contra el proceso gaussiano profundo del mismo proyecto, y advierte que se trata de una comparacion aproximada porque cada modelo se evaluo sobre su propio split. No se han identificado en la informacion proporcionada otras alternativas de la misma categoria con datos verificables.

## Limitaciones y advertencias

- Infra-cobertura en cartas caras: la cobertura calibrada es del 52,3% en el tramo de 100 USD o mas y del 71,8% en el de 10 a 100 USD, frente al 80% objetivo. La muestra de calibracion para el tramo de 100 USD o mas es pequena (131 puntos).
- Caducidad del modelo: es un regresor directo sobre log-precio absoluto, entrenado sobre una ventana de aproximadamente tres meses de TCGplayer que termina en septiembre de 2026, por lo que se degrada a medida que cambia el mercado.
- Robustez estadistica limitada: los resultados proceden de una unica semilla y una unica particion de datos.
- Fuera de alcance: no cubre cartas multifaz, impresiones exclusivamente digitales ni cartas de tamano sobredimensionado.
- Ausencia de informacion multilingue: no se declaran idiomas soportados; la entrada es estrictamente tabular y cualquier capa de idioma debe aportarla el sistema que lo integre.
- Riesgo de predicciones erroneas en impresiones atipicas: aunque se excluyen `set` y `set_name` para favorecer la generalizacion, esa misma decision puede perjudicar a ediciones con dinamicas de precio muy particulares.
- Restricciones de licencia: la licencia es `wotc-fan-content`, vinculada a la Fan Content Policy de Wizards of the Coast. Magic: The Gathering es una marca registrada de Wizards of the Coast, LLC, y el proyecto es un trabajo de fan no oficial, no producido ni respaldado por la compania. Cualquier uso comercial debe revisarse contra los terminos de dicha politica antes de desplegarse en produccion.
- Sin senales de validacion externa: el repositorio registra 0 descargas y 0 likes, y no consta una evaluacion independiente de sus metricas.
- Cautela en produccion: al tratarse de un modelo con deriva temporal y cobertura imperfecta, conviene acompanar cada prediccion con su intervalo calibrado y con un mecanismo de revision humana en los tramos de precio alto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CXu0630/mtg-price-catboost
- Modelo complementario (proceso gaussiano profundo): https://huggingface.co/CXu0630/mtg-price-deep-gp
- Codigo fuente, pipeline de entrenamiento y documento de diseno: https://github.com/CXu0630/mtg_price_predict_catboost_deep_gp
- Dataset de mercado: https://huggingface.co/datasets/CXu0630/mtg-card-market-dataset
- Dataset base de precios y datos de Scryfall: https://huggingface.co/datasets/pcwoods/mtg-card-prices
- Dataset de tasas de aparicion en sobres: https://huggingface.co/datasets/CXu0630/mtg-print-distribution
- Licencia (Wizards of the Coast Fan Content Policy): https://company.wizards.com/en/legal/fancontentpolicy
