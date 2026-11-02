# kevinp0/kcat-km-esm2-sub3

## Resumen

kcat-km-esm2-sub3 es un ensemble de modelos de prediccion de parametros cineticos enzimaticos desarrollado por el usuario kevinp0 para la competicion Leak Curber de prediccion conjunta de log10(kcat) y log10(Km). El modelo combina una red neuronal de dos torres (una para la enzima y otra para el sustrato) con dos modelos de arboles (ExtraTrees y LightGBM), todos alimentados con embeddings de ESM2 y descriptores moleculares calculados con RDKit.

La arquitectura no es un modelo de lenguaje generativo, sino un sistema de regresion multimodal especializado en bioquimica: la torre proteica consume el embedding medio de ESM2 de los primeros 1022 residuos de la enzima, mientras que la torre ligando procesa fingerprints Morgan, claves MACCS y descriptores 2D del sustrato. La prediccion final es una mezcla ponderada (0,30 red + 0,37 ExtraTrees + 0,33 LightGBM) de tres familias de modelos entrenadas sobre el mismo conjunto de datos.

Es relevante en el contexto de la ingenieria de proteinas y el diseno de enzimas asistido por IA, donde predecir kcat y Km sin experimentos de laboratorio reduce drasticamente el coste de cribado. El modelo esta disenado para inferencia en CPU con un presupuesto temporal estricto de 10 minutos, lo que lo hace desplegable en entornos sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble: red de dos torres (MLP con LayerNorm/GELU/Dropout) + ExtraTrees + LightGBM, sobre embeddings ESM2 y descriptores RDKit |
| Parametros totales | no disponible (el repo ocupa 0,9 GB, incluyendo pesos de ESM2-8M y ESM2-35M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de regresion, no generativo); ESM2 procesa hasta 1022 residuos por enzima |
| Tipos de cuantizacion | ESM2-35M se ejecuta en int8 durante la inferencia; pesos de red en PyTorch (`weights/`) y arboles en pickle |
| Idiomas soportados | no disponible (modelo cientifico, no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors (ESM2), `.pt` (redes), `.pkl` (ExtraTrees y LightGBM) |

## Arquitectura y entrenamiento

El sistema tiene tres componentes entrenados de forma independiente sobre el mismo dataset (`train.parquet`). La red de dos torres procesa la enzima mediante mean-pooling del embedding ESM2 (primeros 1022 residuos, estandarizado con estadisticas de entrenamiento) y el sustrato mediante fingerprint Morgan count (r=2, 2048 bits, log1p), claves MACCS y descriptores 2D con signed-log, estandarizacion y clipping. Cada torre aplica dos bloques Linear-LayerNorm-GELU-Dropout; las representaciones se fusionan como `[p, l, p*l]`, pasan por dos bloques residuales y salen por una cabeza de media y otra de log-varianza por target, entrenadas con NLL gaussiana heteroscedastica. El entrenamiento usa AdamW con warm-up y cosine schedule, dropout 0,3, ruido gaussiano en la entrada y SWA (media de pesos de las ultimas epocas). Se generan 5 modelos por fold agrupados por homologia de secuencia (cosine de 3-mers > 0,25) multiplicados por seeds, formando comites de 15 y 10 miembros segun la variante (`ensemble_35M_best.pt` y `ensemble_35M_ref.pt`).

ExtraTrees usa 200 arboles sobre el embedding ESM2-35M, claves MACCS y descriptores. LightGBM entrena un modelo por target con 1000 rondas sobre ESM2-35M, composicion de la enzima (longitud, hidropatia, grupos de residuos, composicion de aminoacidos y dipetidos, composicion por tercio de secuencia), Morgan counts, MACCS, descriptores y un prior del sustrato (media, conteo, SD, max, min y mediana de las etiquetas de entrenamiento del sustrato, out-of-fold para las filas de entrenamiento). La prediccion final es 0,30 x comite de red + 0,37 x ExtraTrees + 0,33 x LightGBM. La innovacion principal es el control estricto del presupuesto temporal: descriptores con deadline a 150 s, ESM2-35M int8 hasta 430 s, fallback a ESM2-8M hasta 520 s y embedding medio de entrenamiento para lo que quede, garantizando salida valida en 10 minutos en cualquier maquina.

## Capacidades

- Prediccion conjunta de log10(kcat) y log10(Km) para pares enzima-sustrato.
- Regresion sobre enzimas representadas por secuencia aminoacidica (via ESM2) y sustratos representados por SMILES (via RDKit).
- Inferencia en CPU con presupuesto temporal garantizado de 10 minutos.
- Degradacion controlada por deadlines: si el tiempo se agota, aplica fallbacks (ESM2-8M, embedding medio) en lugar de fallar.
- Estimacion de incertidumbre implicita mediante la cabeza de log-varianza de la red y el comite de modelos.
- No soporta generacion de texto, tool calling, agentes, vision, audio ni capacidades multilingues: es un modelo cientifico de regresion.

## Casos de uso

- Cribado virtual de enzimas: dado un conjunto de candidatas y un sustrato de interes, predecir kcat y Km para priorizar que variantes llevar a ensayo experimental, reduciendo el numero de experimentos de laboratorio necesarios.
- Ingenieria de proteinas dirigida: evaluar mutaciones puntuales sobre una enzima conocida comparando las predicciones del modelo wild-type frente a las variantes, usando la SCC de 0,459 en kcat y 0,666 en Km como referencia de fiabilidad.
- Diseno de rutas metabolicas: estimar la cinetica de cada paso enzimatico de una ruta sintetica para detectar cuellos de botella antes de la construccion de la cepa.
- Anotacion de bases de datos enzimaticas: completar entradas de kcat y Km ausentes en repositorios como BRENDA o UniProt a partir de secuencia y estructura del sustrato.
- Filtrado en pipelines de descubrimiento de farmacos: descartar sustratos con Km desfavorable para una diana enzimatica concreta antes de sintetizar compuestos.
- Investigacion en biologia computacional: generar priors de parametros cineticos para modelos metabolicos a escala genomica (GEM) donde faltan mediciones experimentales.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden a validacion cruzada de 5 folds agrupados por homologia de secuencia sobre `train.parquet`, midiendo el coeficiente de correlacion de Spearman (SCC).

| Modelo | kcat SCC | Km SCC | SCC medio |
|---|---|---|---|
| Baseline ridge inicial | 0,265 | 0,500 | 0,383 |
| Comites de red (submission 1) | 0,442 | 0,651 | 0,547 |
| ExtraTrees solo | 0,427 | 0,651 | 0,539 |
| LightGBM solo | 0,424 | 0,649 | 0,536 |
| Red + ExtraTrees (submission 2) | no disponible | no disponible | 0,559 |
| Este modelo (ensemble completo) | 0,459 | 0,666 | 0,562 |

En el conjunto de validacion publico, la submission 1 obtuvo 0,489 y la submission 2 obtuvo 0,501. La desviacion estandar de una muestra del tamano de la validacion sobre las predicciones de CV es de aproximadamente 0,03, por lo que las diferencias entre las variantes del ensemble deben interpretarse con cautela.

## Requisitos de hardware

- Inferencia disenada para CPU: no requiere GPU. El presupuesto total es de 10 minutos por ejecucion.
- El encoder ESM2-35M se ejecuta en int8 para acelerar el procesamiento; ESM2-8M actua como fallback.
- Memoria RAM estimada: no disponible con precision; el repo pesa 0,9 GB e incluye ambos encoders ESM2, por lo que se recomienda al menos 8 GB de RAM para cargar pesos y procesar lotes.
- GPU: no necesaria, pero opcional si se modifica el codigo para ejecutar ESM2 en CUDA; una RTX 4090 o A100 acelerarian la extraccion de embeddings mas alla de los deadlines configurados.
- Despliegue: script `predict.py` con entrada Parquet y salida CSV (`id,log10_kcat,log10_km`). No hay integracion documentada con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles mas alla del limite de 10 minutos por ejecucion completa.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | SCC medio (CV) | Licencia |
|---|---|---|---|---|---|
| kcat-km-esm2-sub3 | Ensemble ESM2 + arboles | no disponible | 1022 residuos | 0,562 | MIT |
| Baseline ridge del autor | Regresion lineal | no disponible | no aplica | 0,383 | no disponible |
| Comites de red solos | Red de dos torres | no disponible | 1022 residuos | 0,547 | MIT |
| ExtraTrees solo | Arboles | no disponible | no aplica | 0,539 | MIT |

No se dispone de comparacion con modelos externos de prediccion de kcat/Km (como UniKP, DLKcat o CatPred) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado en un unico problema (prediccion de kcat y Km); no es un modelo de lenguaje ni sirve para tareas genericas.
- La validacion se realizo sobre `train.parquet` con folds agrupados por homologia; el rendimiento en enzimas remotas puede ser inferior al de la CV.
- El SCC de 0,459 en kcat indica una correlacion moderada: las predicciones absolutas pueden desviarse y deben tratarse como orientativas, no como sustituto de mediciones experimentales.
- La desviacion estandar de ~0,03 en la validacion implica que las diferencias entre variantes del ensemble no son estadisticamente significativas.
- El presupuesto temporal estricto puede degradar la calidad: si se agota el tiempo, algunas enzimas usan ESM2-8M o el embedding medio de entrenamiento, con menor precision.
- Dependencia de descriptores RDKit: moleculas no representables correctamente por Morgan/MACCS o con descriptores fuera de rango pueden generar predicciones menos fiables.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo se publico en el contexto de una competicion y no consta validacion independiente externa.
- No hay informacion sobre sesgos de dominio (tipos de enzima o sustrato infrarepresentados en el entrenamiento).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kevinp0/kcat-km-esm2-sub3
- ESM2-8M (dependencia): https://huggingface.co/facebook/esm2_t6_8M_UR50D
- ESM2-35M (dependencia): https://huggingface.co/facebook/esm2_t12_35M_UR50D
- RDKit: https://www.rdkit.org
- LightGBM: https://github.com/microsoft/LightGBM
- No se han encontrado papers, blogs ni demos adicionales en la informacion disponible.
