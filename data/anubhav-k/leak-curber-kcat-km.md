# anubhav-k/leak-curber-kcat-km

## Resumen

`anubhav-k/leak-curber-kcat-km` es un modelo predictivo de propiedades enzimaticas publicado en Hugging Face por el usuario anubhav-k en el marco de un proyecto academico (identificado en la model card como "DA3410 Project 1", version v3). No se trata de un modelo de lenguaje generativo, sino de un pipeline de machine learning supervisado que predice dos parametros cineticos de enzimas: `log10_kcat` y `log10_km`, a partir de la secuencia de la enzima (`sequence`) y la representacion SMILES del sustrato (`smiles`).

El modelo combina caracteristicas derivadas de la secuencia mediante ESM-2 (un modelo de lenguaje proteico) con descriptores quimicos del sustrato calculados con RDKit, ademas de caracteristicas de vecindad y target encoding. Sobre ese conjunto de features se entrenan modelos de tipo MLP y de boosting (la model card menciona scikit-learn y xgboost) y se aplica una estrategia de mezcla distinta por objetivo: `blend_top3` para kcat y `et_all` (ExtraTrees sobre todas las features) para km.

Su relevancia practica radica en la prediccion de parametros cineticos enzimaticos, un cuello de botella clasico en biologia sintetica e ingenieria de proteinas, donde medir experimentalmente kcat y Km es costoso. El repositorio ocupa 1,1 GB, incluye pesos en formato joblib y safetensors, y esta disenado para ejecutarse en CPU, sin red y con dos hilos, mediante un script `predict.py` y una imagen Docker. La informacion publica disponible es muy limitada: no hay licencia, idiomas, pipeline ni benchmarks oficiales declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de MLP y ExtraTrees sobre features ESM-2 + descriptores RDKit (no es un transformer generativo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada = secuencia proteica + SMILES) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; no procesa texto natural) |
| Licencia | no disponible |
| Formato de pesos | joblib (pesos serializados de scikit-learn/xgboost) y safetensors; incluye `nbr_ref.npz` con etiquetas de entrenamiento para features de vecindad |

## Arquitectura y entrenamiento

El pipeline no es una red neuronal unica ni un transformer de extremo a extremo. La model card describe una receta por objetivo: para `kcat` se usa `blend_top3` (mezcla de los tres mejores modelos) y para `km` se usa `et_all` (ExtraTrees entrenado con todas las features). Las features de entrada combinan embeddings de secuencia via ESM-2 (`ESM-2 used: True`), descriptores de sustrato calculados con RDKit (`sub_rdkit`), y features de vecindad y target encoding (`neighbour/target-encoding features: True`). Se emplean tambien modelos MLP (`MLP: True`).

No se especifican en la informacion disponible el numero de tokens ni la composicion exacta del dataset de entrenamiento, mas alla de la referencia a `train.parquet`. La validacion reportada es una validacion cruzada agrupada por clusters (`Grouped cluster-CV`) sobre `train.parquet`, con un Mean SCC estimado de 0,5660, que el propio autor advierte que no es una puntuacion oficial. No se documentan fases de RLHF, DPO ni tecnicas de decodificacion, ya que no es un modelo generativo.

## Capacidades

- Prediccion de `log10_kcat` a partir de secuencia de enzima y SMILES de sustrato.
- Prediccion de `log10_km` con la misma entrada.
- Generacion de fichero CSV de salida con columnas `id, log10_kcat, log10_km`, una fila por id de entrada y solo valores finitos.
- Extraccion de features proteicas mediante ESM-2.
- Calculo de descriptores quimicos de sustrato mediante RDKit.
- Uso de features de vecindad y target encoding para mejorar la generalizacion.
- Ejecucion en CPU, offline, con dos hilos, mediante script y contenedor Docker.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Priorizacion de enzimas candidatas en ingenieria de proteinas: dado un conjunto de secuencias y sustratos, el modelo estima kcat y Km para ordenar candidatos antes de validacion experimental, reduciendo el numero de ensayos de laboratorio necesarios.
- Diseno de vias metabolicas en biologia sintetica: al predecir parametros cineticos de pares enzima-sustrato, permite alimentar modelos cineticos de red y detectar cuellos de botella antes de construir la cepa.
- Filtrado en cribados masivos: procesar lotes en formato parquet y obtener predicciones en CSV en un entorno CPU offline, adecuado para pipelines bioinformaticos reproducibles con Docker y sin acceso a red.
- Analisis de mutagenesis: evaluar como variantes de una misma enzima (distintas secuencias) alteran la kcat o la Km estimada frente a un sustrato fijo, para guiar experimentos de evolucion dirigida.
- Enriquecimiento de bases de datos de enzimas: anotar entradas sin parametros cineticos medidos con estimaciones de kcat y Km, marcando claramente que son predicciones y no medidas.
- Docencia y reproducibilidad de proyectos academicos: el contenedor Docker con versiones fijadas de scikit-learn, xgboost y torch permite reproducir el pipeline en un curso o evaluacion, siempre que se incluya `nbr_ref.npz`.
- Baseline interno para comparar modelos futuros: la receta documentada (ESM-2 + RDKit + target encoding + ensemble) sirve como referencia reproducible frente a la que medir mejoras en prediccion cinetica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento es el Mean SCC de 0,5660 obtenido por validacion cruzada agrupada por clusters sobre `train.parquet`, que el propio autor califica explicitamente como no oficial.

## Requisitos de hardware

- Inferencia en CPU: el autor indica ejecucion CPU-only, offline y con 2 hilos (`--cpus 2`).
- VRAM: no aplica; no se documenta uso de GPU para inferencia.
- GPU recomendadas: no disponible; el diseno es CPU-first.
- Cabida en GPU de consumo: no aplica segun la documentacion disponible.
- Despliegue: script `predict.py` dentro de imagen Docker (`docker build -t kk-model .`), con montaje de volumenes para datos de entrada y salida y `--network none`.
- Tamano en disco: repositorio de 1,1 GB, que incluye pesos joblib/safetensors y `nbr_ref.npz`.
- Latencia y throughput: no disponibles; dependen del tamano del lote de secuencias y del coste de los embeddings ESM-2.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento de alternativas de prediccion de kcat/Km.

## Limitaciones y advertencias

- El Mean SCC de 0,5660 es una estimacion por validacion cruzada agrupada y el autor advierte que no es una puntuacion oficial; no debe presentarse como metrica de produccion.
- `nbr_ref.npz` contiene etiquetas de entrenamiento usadas para las features de vecindad y debe distribuirse junto con los modelos; sin el, las predicciones no son validas.
- Los pesos estan serializados con joblib y dependen de versiones concretas de scikit-learn, xgboost y torch; el autor recomienda mantener versiones cercanas a las del entorno de entrenamiento, lo que supone un riesgo de compatibilidad.
- No se declara licencia: no hay autorizacion explicita para uso comercial ni para redistribucion; debe contactarse con el autor antes de cualquier uso en produccion.
- No se documentan sesgos, cobertura del espacio quimico, dominio de aplicabilidad ni tasas de alucinacion o error por tipo de enzima o sustrato.
- Solo se devuelven valores finitos por id; no se especifica el tratamiento de entradas fuera de distribucion ni de secuencias o SMILES invalidos.
- Proyecto academico con 54 descargas y 0 likes: madurez y soporte limitados, sin pipeline ni idiomas declarados en Hugging Face.
- No es un modelo de lenguaje: no admite prompts, tool calling ni razonamiento; cualquier uso conversacional es inadecuado.

## Enlaces

- Hugging Face: https://huggingface.co/anubhav-k/leak-curber-kcat-km
- No se han encontrado en la informacion disponible papers, blogs, repositorios adicionales ni demos.
