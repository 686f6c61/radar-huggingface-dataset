# Krishanthh/upgraded

## Resumen

`Krishanthh/upgraded` es un artefacto de aprendizaje automatico publicado en Hugging Face orientado a la prediccion de parametros cineticos enzimaticos. Concretamente, estima `log10_kcat` y `log10_km` a partir de la secuencia de una enzima y del SMILES del sustrato. No se trata de un modelo de lenguaje generativo, sino de un pipeline de regresion supervisada que combina descriptores quimicos, caracteristicas de composicion proteica y embeddings de un codificador ESM-2 congelado.

El autor, identificado como Krishanthh, lo presenta como una implementacion rapida para un proyecto de curso con estructura de entrega tipo Docker. El repositorio ocupa aproximadamente 0,3 GB e incluye pesos serializados en formato `joblib` y `safetensors`, con una configuracion de caracteristicas en JSON. La release seleccionada emplea regresores ExtraTrees de 150 arboles sobre un vector que integra quimica rica, estadisticas de sustrato y 480 dimensiones de ESM-2 35M.

Su relevancia es acotada: no es un modelo fundacional ni compite en la categoria de LLM, sino una solucion de nicho para tareas de prediccion de cinetica enzimatica. La model card documenta el proceso experimental con cinco folds agrupados por similitud de secuencia, lo que permite evaluar el rendimiento con cierto rigor metodologico, aunque los resultados publicados son parciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensamble de regresores de arboles (ExtraTrees, 150 arboles) sobre caracteristicas quimicas, de composicion proteica y embeddings ESM-2 35M congelados |
| Parametros totales | No disponible (modelo basado en arboles; el componente neuronal es ESM-2 35M congelado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no aplica: entrada tabular por enzima-sustrato) |
| Tipos de cuantizacion | No disponible (pesos `joblib` y `safetensors`) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | `joblib` (arboles) y `safetensors` (encoder ESM-2) |

## Arquitectura y entrenamiento

El sistema no es un transformer generativo. Se compone de un vector de caracteristicas construido en tres bloques. El bloque quimico incluye 2.048 conteos Morgan, 167 claves MACCS y 216 descriptores RDKit, excluyendo el descriptor `Ipc` por inestabilidad; los fallos de calculo se sustituyen por cero y las moleculas invalidas reciben un indicador explicito. El bloque proteico usa longitud de secuencia, proporciones de aminoacidos y proporciones de pares adyacentes. La variante E3 anade 480 valores de mean-pooling de ESM-2 35M congelado por enzima.

Sobre ese vector se entrenan regresores independientes por objetivo. La release final, denominada E3ET, usa ExtraTrees de 150 arboles con las caracteristicas ESM, quimica rica y estadisticas de sustrato. Los experimentos E1 y E2 emplean XGBoost con early stopping sobre un holdout agrupado interno y un numero final de arboles fijado como mediana de los folds externos. La validacion usa cinco folds externos construidos por clusters de secuencia con solapamiento de 5-meros distintos al 10 %, un proxy heuristico ante la indisponibilidad de MMseqs2 al 40 % de identidad.

Las estadisticas de sustrato de E2 se calculan con cross-fitting: las filas de entrenamiento externo reciben estadisticas de otros clusters, y las filas retenidas usan solo el conjunto de entrenamiento externo. La seleccion de receta por objetivo se hace con validacion cruzada local, lo que el propio autor advierte que puede hacer optimista la puntuacion reportada. No se usan datos etiquetados externos ni puntuaciones del leaderboard oculto para ajuste o seleccion.

## Capacidades

- Prediccion de `log10_kcat` y `log10_km` a partir de secuencia de enzima y SMILES de sustrato.
- Extraccion de caracteristicas quimicas: conteos Morgan (2.048), claves MACCS (167) y 216 descriptores RDKit.
- Extraccion de caracteristicas proteicas: longitud, proporciones de aminoacidos y de pares adyacentes.
- Embeddings proteicos de 480 dimensiones mediante ESM-2 35M congelado.
- Estadisticas de sustrato con busqueda de analogos quimicos y ponderacion por similitud, excluyendo coincidencias exactas.
- Inferencia offline completa: todos los pesos y estadisticas de referencia se empaquetan en `weights/`, sin necesidad de red.
- Preservacion del orden de filas e identificadores en la salida (`id,log10_kcat,log10_km`).
- Ejecucion reproducible mediante Docker con `--network none`.

## Casos de uso

- Priorizacion de enzimas candidatas en diseno de biocatalizadores: dado un panel de secuencias y un sustrato objetivo, el modelo estima `kcat` y `km` para ordenar candidatas antes de validacion experimental, reduciendo el numero de ensayos de laboratorio.
- Filtrado en pipelines de ingenieria de proteinas: integrado como paso de scoring en un bucle de mutageneis dirigida, permite descartar variantes con cinetica predicha desfavorable sin expresar ni purificar cada construccion.
- Anotacion de bases de datos enzimaticas: el modelo puede procesar lotes en formato Parquet y generar predicciones de parametros cineticos para entradas sin medicion experimental, siempre como estimacion indicativa.
- Analisis de promiscuidad de sustrato: comparando predicciones para un mismo enzima frente a distintos SMILES, se puede explorar que sustratos presentan mejor `km` predicho y orientar estudios de especificidad.
- Docencia y prototipado en bioinformatica: el repositorio incluye `train.py`, `predict.py`, notebook explicativo y estructura Docker, lo que lo hace util como ejemplo reproducible de pipeline de regresion con caracteristicas mixtas.
- Evaluacion comparativa de descriptores: al documentar variantes E0-E3 y E3ET, sirve como referencia metodologica para medir el impacto de anadir embeddings ESM-2 o estadisticas de sustrato en una tarea de regresion molecular.
- Despliegue en entornos aislados: al no requerir red en inferencia y empaquetar el tokenizer y el modelo ESM localmente, puede ejecutarse en infraestructura sin acceso a internet con 8 CPUs y 30 GB de memoria, segun el ejemplo de Docker de la model card.

## Benchmarks y rendimiento

La model card reporta SCC medio de cinco folds sobre los mismos clusters de secuencia, aunque la tabla aparece truncada en la informacion disponible.

| Experimento | Mean SCC |
|---|---:|
| E0: modelo previo | 0,5064 |
| E1: quimica rica + XGBoost | 0,4832 |
| E2: E1 + estadisticas de sustrato | 0,49 |
| E3: E2 + embeddings ESM-2 35M | No disponible (tabla truncada) |
| E3ET: ESM + ExtraTrees 150 arboles | No disponible (tabla truncada) |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni benchmarks de modelos de lenguaje, ya que no aplican a este artefacto. Tampoco se dispone de puntuacion oficial del leaderboard ni de objetivo competitivo declarado.

## Requisitos de hardware

- Inferencia en CPU: el ejemplo de Docker usa `--cpus 8 --memory 30g`, lo que sugiere que la ruta E2 puede ejecutarse sin GPU.
- VRAM estimada: no disponible; el componente ESM-2 35M es pequeno y la carga principal son los arboles y las caracteristicas tabulares.
- GPU recomendadas: no se especifican para inferencia; para extraccion de embeddings ESM se documentan `--device mps` en Apple Silicon y `--device cuda` en GPU Nvidia compatible.
- GPU de consumo: el encoder ESM-2 35M es ligero y cabe holgadamente en GPUs de consumo, aunque la model card no fija requisitos minimos.
- Opciones de despliegue: script `predict.py` sobre Parquet, contenedor Docker con `linux/amd64`, y ejecucion offline con `--network none`.
- Latencia y throughput: no disponibles. La extraccion de embeddings ESM se describe como un coste separado y no requerido por la ruta rapida E2.
- Almacenamiento: repositorio de aproximadamente 0,3 GB, incluyendo pesos, configuracion de caracteristicas y, si se selecciona E3, encoder y tokenizer.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de prediccion de `kcat`/`km` ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- La tabla de resultados esta truncada: no se dispone del SCC de las variantes E3 y E3ET, que son precisamente las seleccionadas en la release.
- La seleccion de receta por objetivo mediante validacion cruzada local puede producir una puntuacion optimista, segun advierte el propio autor.
- Los clusters de secuencia usan un proxy heuristico de solapamiento de 5-meros al 10 %, no MMseqs2 al 40 % de identidad, lo que puede agrupar secuencias de forma menos fiable.
- La licencia no esta declarada, por lo que el uso comercial queda sin marco legal explicito y requiere contacto con el autor.
- No hay informacion sobre sesgos, idiomas ni robustez fuera de la distribucion de entrenamiento; no es un modelo de lenguaje y no debe evaluarse como tal.
- El descriptor `Ipc` se excluye por inestabilidad y los fallos de descriptores se sustituyen por cero, lo que puede introducir sesgo en moleculas con quimica atipica.
- La ejecucion Docker figura como no verificada salvo que se registre lo contrario en el informe local.
- No se promete puntuacion oficial de leaderboard ni rendimiento competitivo.
- El modelo esta pensado para estimacion indicativa de parametros cineticos; no sustituye la medicion experimental.

## Enlaces

- Hugging Face: https://huggingface.co/Krishanthh/upgraded
