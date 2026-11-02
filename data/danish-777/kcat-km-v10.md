# Danish-777/kcat-km-v10

## Resumen

kcat-Km model v10 es un sistema de prediccion de parametros cineticos enzimaticos (log10(kcat) y log10(Km)) publicado por el usuario Danish-777 en HuggingFace. No se trata de un modelo de lenguaje generativo, sino de un pipeline de regresion que combina tres aproximaciones: XGBoost sobre caracteristicas enzimaticas artesanales, XGBoost sobre embeddings del modelo proteico ESM-2 en sus variantes de 35M y 150M parametros, y una pequena red neuronal (MLP) sobre el embedding de 35M. Las predicciones de cada componente se combinan mediante el promedio de rangos.

El modelo aborda un problema clasico en biologia computacional y enzimologia: estimar la constante catalitica (kcat) y la constante de Michaelis (Km) a partir de la secuencia de una enzima y el SMILES de un sustrato. Estos parametros son criticos para el diseno de biocatalizadores, la ingenieria metabolica y el cribado de enzimas, pero medirlos experimentalmente es costoso y lento. La propuesta se apoya en datos publicos agregados (train.parquet, CatPred-DB, BRENDA y SABIO-RK) y esta disenada para ejecutarse exclusivamente en CPU.

Es relevante por dos motivos contrapuestos. Por un lado, demuestra un enfoque pragmatico de ensemble sobre embeddings proteicos preentrenados para una tarea de regresion cientifica concreta. Por otro, el propio autor declara explicitamente una practica de *lookup* de valores publicados: si el par enzima-sustrato aparece en las bases de datos de entrenamiento, se devuelve el valor medido en lugar de la prediccion del modelo, lo que invalida las metricas en cualquier evaluacion que solape con esas fuentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble: XGBoost (caracteristicas artesanales + embeddings ESM-2 35M y 150M) + MLP sobre embedding ESM-2 35M, combinados por promedio de rangos |
| Parametros totales | no disponible (ensemble de arboles y una MLP; los componentes ESM-2 aportan 35M y 150M parametros respectivamente) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de regresion, no generativo); los embeddings ESM-2 usan los primeros 256 residuos de la secuencia |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF, INT8 ni similares) |
| Idiomas soportados | no aplica (entrada: secuencia de aminoacidos y SMILES) |
| Licencia | MIT |
| Formato de pesos | safetensors (tamano del repo: 0,7 GB) |

## Arquitectura y entrenamiento

El sistema es un ensemble heterogeneo orientado a regresion. La componente principal son tres modelos XGBoost: uno entrenado sobre caracteristicas enzimaticas artesanales (denotadas "D" en la model card), otro sobre embeddings de ESM-2 35M y un tercero sobre embeddings de ESM-2 150M (con dos variantes de profundidad, 7 y 8). A estos se suma una pequena red neuronal (MLP) que opera sobre el embedding de 35M. Las predicciones individuales se agregan mediante promedio de rangos, con un "time guard" que no se detalla en la documentacion disponible. La entrada es un par (secuencia de enzima, SMILES de sustrato) y la salida son dos valores continuos: log10(kcat) y log10(Km).

El entrenamiento utiliza el `train.parquet` de la tarea original mas la totalidad de CatPred-DB (Boorla y Maranas, *Nature Communications* 2025), una coleccion publica de valores kcat/Km proveniente de BRENDA y SABIO-RK. La validacion se realizo mediante validacion cruzada de 5 pliegues agrupada por familias enzimaticas, usando clusters de MMseqs2 al 40% de identidad, y excluyendo de cada pliegue las filas externas relacionadas (al menos 40% de identidad) con las familias retenidas. No se documentan fases de RLHF, DPO ni tecnicas de decodificacion especulativa, al no ser un modelo generativo.

La innovacion tecnica mas destacable es tambien la mas controvertida: el sistema incorpora un mecanismo de *lookup* que, si el par enzima-sustrato aparece en `train.parquet`, CatPred-DB o DLKcat (Li et al., *Nature Catalysis* 2022), devuelve el valor experimental medido en lugar de la prediccion del modelo. El autor lo declara abiertamente y advierte que las puntuaciones sobre pares presentes en bases de datos reflejan la cobertura de estas, no la capacidad predictiva.

## Capacidades

- Prediccion de log10(kcat) a partir de secuencia de enzima y SMILES de sustrato.
- Prediccion de log10(Km) bajo las mismas entradas.
- Extraccion de embeddings proteicos mediante ESM-2 en variantes de 35M y 150M parametros (primeros 256 residuos).
- Ensemble por promedio de rangos de cinco predictores base (tres XGBoost, una MLP y variantes de profundidad).
- Ejecucion exclusiva en CPU, sin requisito de GPU.
- Lookup de valores experimentales publicados para pares enzima-sustrato presentes en train.parquet, CatPred-DB o DLKcat.
- Interfaz de linea de comandos: `python predict.py --input INPUT.parquet --output predictions.csv`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto: no es un modelo de lenguaje.

## Casos de uso

- Cribado de enzimas para ingenieria metabolica: dado un conjunto de secuencias candidatas y un sustrato de interes, el modelo estima kcat y Km en CPU para priorizar que enzimas caracterizar experimentalmente, reduciendo el numero de ensayos de laboratorio necesarios.
- Priorizacion en diseno de biocatalizadores: en un pipeline de diseno de enzimas, se puede usar como filtro rapido sobre variantes generadas, descartando aquellas con kcat predicha baja antes de pasar a simulacion molecular o expresion proteica.
- Analisis de vias metabolicas: estimar parametros cineticos faltantes para modelos cineticos a escala de red (por ejemplo, modelos de tipo GECKO o ETFL), donde la cobertura experimental de kcat y Km es incompleta.
- Anotacion de bases de datos internas: completar registros enzimaticos propios con predicciones de kcat y Km cuando no exista medicion experimental, marcando explicitamente el origen predicho del valor.
- Docencia e investigacion metodologica: servir como caso de estudio de ensemble sobre embeddings proteicos y de los riesgos de fuga de datos (*data leakage*) por solapamiento con bases de datos publicas.
- Evaluacion comparativa de modelos cineticos: usar el pipeline como baseline reproducible en CPU frente a alternativas como DLKcat o CatPred, siempre que se excluyan del conjunto de test los pares presentes en las bases de datos consultadas por el lookup.
- Integracion en pipelines bioinformaticos ligeros: al no requerir GPU, puede desplegarse en servidores de laboratorio o nodos de computo sin acelerador, integrándose en flujos Snakemake o Nextflow.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el esquema de validacion (5-fold agrupado por familias con MMseqs2 al 40% de identidad y exclusion de filas relacionadas), pero no reporta valores numericos de MAE, RMSE, R2 ni correlacion de Spearman para kcat o Km, ni comparaciones cuantitativas con DLKcat o CatPred.

## Requisitos de hardware

- Inferencia exclusivamente en CPU segun la model card; no requiere GPU.
- VRAM estimada: 0 GB (no aplica).
- Memoria RAM estimada: no disponible con precision; el repositorio ocupa 0,7 GB y los modelos ESM-2 de 35M y 150M son ligeros, por lo que es razonable esperar un consumo de unos pocos GB, aunque el autor no lo documenta.
- GPU recomendadas: no aplica; el diseno es CPU-only.
- Cabe en cualquier equipo de sobremesa o portatil con suficiente RAM; no se especifican minimos.
- Opciones de despliegue: ejecucion directa del script `predict.py` con entrada y salida en formato parquet/CSV. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entradas | Salidas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kcat-Km model v10 (Danish-777) | Ensemble XGBoost + MLP sobre ESM-2 | Secuencia + SMILES | log10(kcat), log10(Km) | MIT | HuggingFace, CPU-only |
| DLKcat (Li et al., 2022) | Red neuronal sobre grafos moleculares y secuencia | Secuencia + SMILES | kcat | no disponible en la informacion proporcionada | Referenciado como fuente de lookup; disponible publicamente segun la literatura citada |
| CatPred-DB (Boorla y Maranas, 2025) | Base de datos publica de kcat/Km | no aplica (datos) | Valores experimentales | no disponible en la informacion proporcionada | Usada como fuente de entrenamiento y lookup |
| ESM-2 (35M / 150M) | Transformer proteico (encoder) | Secuencia de aminoacidos | Embeddings | no disponible en la informacion proporcionada | Usado como extractor de caracteristicas dentro del pipeline |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada. La comparativa se limita a tipo de modelo, entradas, salidas y licencia.

## Limitaciones y advertencias

- Fuga de datos declarada: el lookup devuelve valores experimentales publicados cuando el par enzima-sustrato aparece en train.parquet, CatPred-DB o DLKcat. Cualquier metrica calculada sobre pares presentes en esas fuentes mide cobertura de base de datos, no capacidad predictiva.
- Riesgo de sobreajuste a la distribucion de BRENDA y SABIO-RK: son bases de datos sesgadas hacia enzimas bien estudiadas, lo que puede degradar la precision en familias poco representadas.
- Rendimiento no cuantificado: la model card no reporta MAE, RMSE ni correlacion, lo que impide evaluar la calidad real de las predicciones fuera de los pares con lookup.
- Extraccion de embeddings limitada a los primeros 256 residuos de la secuencia: proteinas largas pierden informacion de dominios o sitios activos situados mas alla de ese limite.
- Ambito restringido: solo predice kcat y Km; no modela inhibicion, cooperatividad, condiciones de pH o temperatura, ni otras constantes cineticas.
- Idiomas: no aplica, pero la entrada debe respetar formatos canonicos de secuencia de aminoacidos y SMILES validos; no se documenta validacion de entradas malformadas.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias sobre la idoneidad de las predicciones para decisiones experimentales o industriales.
- Madurez y trazabilidad: repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia (2026-11-02), sin pipeline declarado en HuggingFace ni documentacion adicional sobre hiperparametros del "time guard" o de la MLP.
- No es un modelo de lenguaje: no debe evaluarse con criterios de LLM (contexto, tool calling, alucinacion conversacional); su uso esta acotado a regresion cinetica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Danish-777/kcat-km-v10
- CatPred-DB (Boorla y Maranas, *Nature Communications* 2025): referencia citada en la model card; no se proporciona URL directa en la informacion disponible.
- DLKcat (Li et al., *Nature Catalysis* 2022): referencia citada en la model card; no se proporciona URL directa en la informacion disponible.
- ESM-2 (Meta AI): extractor de embeddings usado por el pipeline; no se proporciona URL directa en la informacion disponible.
- BRENDA: base de datos de enzimas citada como fuente de entrenamiento; no se proporciona URL directa en la informacion disponible.
- SABIO-RK: base de datos de cinetica enzimatica citada como fuente de entrenamiento; no se proporciona URL directa en la informacion disponible.
- MMseqs2: herramienta de clustering usada en la validacion; no se proporciona URL directa en la informacion disponible.
