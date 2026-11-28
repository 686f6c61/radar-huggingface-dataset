# anubhav-k/leak-curber-kcat-km

## Resumen

`anubhav-k/leak-curber-kcat-km` es un conjunto de modelos de aprendizaje automatico supervisado (no un modelo de lenguaje) publicado en Hugging Face por el usuario anubhav-k, en el marco del proyecto academico DA3410 Project 1. Su funcion es predecir dos parametros cineticos enzimaticos a partir de la secuencia de la enzima y la representacion SMILES del sustrato: la constante catalitica `kcat` y la constante de Michaelis `Km`. El modelo devuelve ambas predicciones en escala logaritmica (`log10_kcat` y `log10_km`).

La version v5 combina varios estimadores clasicos de machine learning (ExtraTrees, XGBoost, MLP y otros) mediante un esquema de *blending* o ensamblado, apoyandose en caracteristicas derivadas de embeddings ESM de la proteina y descriptores RDKit del sustrato. No se trata de una red neuronal transformer entrenada de extremo a extremo, sino de un pipeline de regresion tabular con ingenieria de caracteristicas.

Es relevante en el contexto de la biologia computacional y el diseno de enzimas, donde predecir `kcat` y `Km` de forma fiable es un cuello de botella historico. La model card reporta una mejora estimada de +0.0295 en correlacion de Spearman (SCC) sobre la version v2, con un intervalo de confianza bootstrap de [+0.0252, +0.0389], aunque el propio autor advierte que es una estimacion y no una promesa. El repositorio pesa 1.8 GB y contiene pesos en formato safetensors y joblib.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensamblado (blending) de ExtraTrees, XGBoost y MLP sobre caracteristicas ESM + RDKit |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (entrada: secuencia proteica y SMILES) |
| Licencia | no disponible |
| Formato de pesos | safetensors, joblib |
| Tamano del repositorio | 1.8 GB |
| Entrada | `sequence` (proteina) y `smiles` (sustrato) |
| Salida | `id`, `log10_kcat`, `log10_km` |
| Ejecucion | CPU-only, offline, 2 hilos |
| Version | v5 (reemplaza a v2) |

## Arquitectura y entrenamiento

El modelo no es un transformer unico, sino un ensamblado de modelos clasicos de regresion. Para `kcat` combina `et_hand_sub_rd` (ExtraTrees), `xgbT_tuned` (XGBoost) y `xgb_esmml_hand_sub` (XGBoost). Para `Km` combina `et2_esm_hand_sub` (ExtraTrees), `mlp_all` (perceptron multicapa) y `xgbT_tuned` (XGBoost). La combinacion se realiza mediante *blending*, es decir, un promedio ponderado o meta-modelo de las predicciones individuales.

Las caracteristicas de entrada pertenecen a seis grupos: `esm`, `esm_max`, `esm_ml`, `hand`, `sub_hash` y `sub_rdkit`. Los grupos `esm*` corresponden a embeddings de proteina derivados de modelos ESM; `hand` agrupa caracteristicas manuales de la secuencia; `sub_hash` y `sub_rdkit` son representaciones del sustrato basadas en hashing y descriptores RDKit. La model card indica explicitamente que no se usan caracteristicas de *target encoding* ni de etiquetas de vecinos, lo que mitiga el riesgo de fuga de informacion (*leakage*), de ahi el nombre "leak-curber".

El entrenamiento se evaluo con validacion cruzada de 5 pliegues agrupando secuencias por clusters con solapamiento de 5-meros de 0.1. La SCC de referencia de v2 fue 0.5245, la final 0.5561 y la estimacion nested (libre de sesgo de seleccion) 0.5540, con un optimismo de +0.0021. El autor insiste en que estas cifras no son puntuaciones oficiales.

## Capacidades

- Prediccion de `log10_kcat` a partir de secuencia de enzima y SMILES de sustrato.
- Prediccion de `log10_km` con la misma entrada.
- Procesamiento por lotes mediante fichero Parquet de entrada y salida CSV.
- Ejecucion en CPU sin GPU, en modo offline y con 2 hilos.
- Uso de embeddings ESM de proteina y descriptores RDKit de molecula pequena.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto.
- No es multilingue en sentido linguistico: su "lenguaje" de entrada es biologico/quimico.

## Casos de uso

- Priorizacion de enzimas candidatas en diseno de biocatalizadores: dado un panel de secuencias y sustratos, el modelo estima `kcat` y `Km` para ordenar candidatos antes de validacion experimental, reduciendo el numero de ensayos de laboratorio necesarios.
- Filtrado en pipelines de ingenieria de proteinas: integrado en un flujo que genera variantes por mutagénesis dirigida, el modelo puntua cada variante y descarta las que predicen una `kcat` baja o un `Km` desfavorable.
- Analisis de promiscuidad de sustrato: evaluando una misma enzima frente a una biblioteca de SMILES, se puede estimar que sustratos presentan mejor `Km` predicho y orientar estudios de especificidad.
- Enriquecimiento de bases de datos de cinetica enzimatica: para entradas de BRENDA u otras bases sin `kcat`/`Km` medidos, el modelo puede aportar estimaciones preliminares etiquetadas como predicciones.
- Docencia y prototipado en bioinformatica: el pipeline Docker reproducible (CPU, offline, 2 hilos) permite a estudiantes ejecutar un flujo completo de regresion sobre datos de enzimas y sustratos sin infraestructura GPU.
- Investigacion en modelos de prediccion cinetica: sirve como linea base reproducible (con particionado por clusters de secuencia) para comparar nuevas arquitecturas, como modelos de lenguaje proteicos o grafos moleculares.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son de validacion cruzada interna, no de benchmarks oficiales. Se presentan a continuacion tal como los reporta el autor:

| Metrica | v2 (referencia) | v5 final | v5 nested (sin sesgo de seleccion) |
|---|---|---|---|
| Mean SCC (5-fold, clusters 5-mer 0.1) | 0.5245 | 0.5561 | 0.5540 |
| Optimismo estimado | — | +0.0021 | — |
| Ganancia estimada sobre v2 (Mean SCC) | — | +0.0295 | IC bootstrap [+0.0252, +0.0389] |

No se han publicado resultados de benchmarks externos (por ejemplo, sobre test sets independientes tipo DLKcat o EITLEM) en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU exclusivamente; no requiere GPU.
- Memoria recomendada: 16 GB de RAM segun el ejemplo de `docker run` de la model card.
- CPU: 2 hilos configurados en el ejemplo de ejecucion.
- No cabe ni aplica el concepto de VRAM, al no ser un modelo neuronal grande.
- Despliegue mediante contenedor Docker (`docker build --platform linux/amd64`), con red deshabilitada (`--network none`).
- Dependencias fijadas a las versiones del entorno de entrenamiento de Kaggle: scikit-learn, xgboost, lightgbm y catboost deben mantenerse en esas versiones porque los modelos estan serializados con pickle/joblib.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo frente a alternativas en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible. A modo orientativo, los modelos de la misma categoria (prediccion de `kcat`/`Km`) incluyen DLKcat, UniKP y EITLEM, pero no se han encontrado en la informacion disponible resultados comparables que permitan una tabla fiable.

| Modelo | Tipo | Entrada | Licencia | Datos comparativos |
|---|---|---|---|---|
| leak-curber-kcat-km (este) | Ensamblado ML clasico | Secuencia + SMILES | no disponible | SCC CV interna 0.5561 |
| DLKcat | Red neuronal (GNN + CNN) | Secuencia + SMILES | no disponible en esta ficha | no disponible |
| UniKP | Framework unificado | Secuencia + SMILES | no disponible en esta ficha | no disponible |
| EITLEM | Modelo con preentrenamiento | Secuencia + SMILES | no disponible en esta ficha | no disponible |

## Limitaciones y advertencias

- Las metricas reportadas son de validacion cruzada interna, no de un test set oficial; el autor lo advierte explicitamente.
- La ganancia de +0.0295 SCC sobre v2 es una estimacion con intervalo de confianza, no una garantia.
- El modelo depende de versiones concretas de scikit-learn, xgboost, lightgbm y catboost; actualizar estas librerias puede romper la carga de los modelos serializados.
- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor.
- No se documentan sesgos ni cobertura del espacio quimico o proteico de entrenamiento; la extrapolacion a familias enzimaticas o sustratos alejados del conjunto de entrenamiento es incierta.
- Riesgo de sobreajuste a la distribucion de los datos de entrenamiento y de predicciones poco fiables fuera de ella.
- La salida es logaritmica (`log10_kcat`, `log10_km`); cualquier uso downstream debe aplicar la transformacion inversa correctamente.
- No es un modelo de lenguaje: no genera texto, no razona ni soporta agentes.
- El repositorio es de 1.8 GB, lo que puede ser relevante para despliegues con limites de almacenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/anubhav-k/leak-curber-kcat-km
