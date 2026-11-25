# SheikhAhnaf/apu-synthesizability-checkpoints

## Resumen

ORB-PU / A-PU Synthesizability Models es un conjunto de checkpoints de aprendizaje automatico supervisado orientado a la prediccion de sintetizabilidad de compuestos inorganicos, es decir, la probabilidad de que una composicion cristalina pueda fabricarse experimentalmente. Lo desarrolla SheikhAhnaf y se distribuye a traves de Hugging Face como repositorio de artefactos serializados con joblib, no como un modelo de lenguaje. El problema que aborda es central en el descubrimiento de materiales: filtrar candidatos generados por modelos generativos o por busquedas combinatorias antes de dedicar recursos experimentales a su sintesis.

Tecnicamente no es una red neuronal profunda desplegable como tal, sino un clasificador de *positive-unlabeled learning* (PU) basado en bagging de Mordelet–Vert sobre dos estimadores de arboles (RandomForest y XGBoost), alimentado con caracteristicas derivadas de embeddings ORB-v3 reducidos por PCA, descriptores de composicion Magpie y, opcionalmente, un escalar de estabilidad energetica ORB. Se entrenó sobre 109.283 entradas de Materials Project (49.283 positivos etiquetados y 60.000 no etiquetados).

Su relevancia actual radica en que ofrece un pipeline PU con capa de abstención y deteccion de out-of-distribution, algo poco habitual en herramientas de sintetizabilidad, y con metricas publicadas en el split de test de Materials Project (AUPRC 0,961, AUROC 0,967, ECE 0,024) para el checkpoint seleccionado `orb_mag__xgboost`. El repositorio ocupa 33,1 GB e incluye ocho estudios de Optuna, lo que lo convierte en un artefacto de investigacion mas que en un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador PU por bagging (Mordelet–Vert) sobre RandomForest o XGBoost, con capa de abstención/OOD (`AbstainingPUClassifier`) |
| Parametros totales | no disponible (no es una red neuronal con parametros declarados; son modelos de arboles serializados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no aplica (artefactos joblib; no hay pesos en safetensors ni GGUF) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | joblib (`.joblib`), mas un PCA serializado en `cache/bank.npz.pca.pkl` |
| Entradas | Concatenacion de ORB PCA (50 dims) + Magpie (132 dims), con escalar de estabilidad ORB opcional |
| Salida | Probabilidad de sintetizabilidad en [0, 1] y decision {1, 0, -1} con `abstain` y `ood_scores` |
| Tamano del repositorio | 33,1 GB |

## Arquitectura y entrenamiento

El modelo no es un transformer ni una red neuronal convencional: es un clasificador tabular de dos etapas. Primero se extraen caracteristicas de cada composicion inorganica mediante embeddings ORB-v3 (256 dimensiones) que se reducen a 50 componentes con PCA ajustado sobre el banco de entrenamiento; en paralelo se calculan 132 descriptores de composicion Magpie. Opcionalmente se anade un escalar de estabilidad energetica derivado de ORB. Sobre ese vector de caracteristicas se entrena un clasificador PU de Mordelet–Vert, que trata los datos como positivos y no etiquetados en lugar de positivos y negativos, algo apropiado porque en Materials Project la ausencia de una entrada no implica que el compuesto sea insintetizable.

El conjunto de entrenamiento consta de 109.283 entradas de Materials Project, de las cuales 49.283 son positivos etiquetados y 60.000 no etiquetados. Se exploraron ocho combinaciones mediante Optuna: {Magpie, ORB, ORB+Magpie, ORB+Magpie+estabilidad} cruzadas con {RandomForest, XGBoost}, con semilla 42 y reproducibilidad declarada a traves de `hcap_bo/slurm/apu_optuna.slurm`. La innovacion destacable es la capa `AbstainingPUClassifier`, que permite al modelo abstenerse y emitir puntuaciones OOD, util para no forzar predicciones sobre composiciones alejadas de la distribucion de entrenamiento. No se documentan fases de RLHF, DPO ni ajuste por preferencias, logicas en un modelo de este tipo.

## Capacidades

- Prediccion de probabilidad de sintetizabilidad para composiciones inorganicas, en el rango [0, 1].
- Clasificacion binaria con umbral y decision ternaria {1, 0, -1} que incluye la opcion de abstenerse.
- Deteccion de out-of-distribution mediante `ood_scores`, para identificar composiciones fuera del dominio de entrenamiento.
- Uso de representaciones aprendidas (ORB-v3) combinadas con descriptores fisico-quimicos explicitos (Magpie).
- Integracion opcional de un escalar de estabilidad energetica para enriquecer la prediccion.
- Sin soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.
- Sin capacidades de vision, audio ni generacion de texto.

## Casos de uso

- Filtrado previo en pipelines de descubrimiento de materiales: dado un lote de composiciones candidatas generadas por modelos generativos o busquedas combinatorias, el modelo asigna una probabilidad de sintetizabilidad y permite descartar las de baja puntuacion antes de simulaciones DFT costosas o de sintesis experimental.
- Priorizacion de experimentos en laboratorio: con AUPRC de 0,961 en el split de test de Materials Project, el checkpoint `orb_mag__xgboost` sirve para ordenar candidatos y concentrar el esfuerzo experimental en las composiciones con mayor probabilidad.
- Analisis de estabilidad frente a sintetizabilidad: al poder anadir el escalar de estabilidad ORB, permite estudiar que composiciones energeticamente favorables son ademas plausibles de fabricar, y detectar discrepancias entre ambos criterios.
- Control de calidad en bases de datos de materiales: aplicar el modelo a entradas nuevas o externas a Materials Project y usar la capa de absteción para marcar registros sospechosos o fuera de distribucion antes de incorporarlos.
- Investigacion metodologica en PU learning: los ocho checkpoints con Optuna permiten reproducir y comparar el efecto de distintos conjuntos de caracteristicas y estimadores base sobre la calidad de la prediccion.
- Integracion en flujos de optimizacion bayesiana: el repositorio de codigo asociado (`matinvent-BO`) sugiere su uso como componente de una funcion objetivo o como filtro dentro de un bucle de optimizacion de materiales.

## Benchmarks y rendimiento

| Metrica | Valor (checkpoint `orb_mag__xgboost`) | Conjunto |
|---|---|---|
| AUPRC | 0,961 | Split de test de Materials Project |
| AUROC | 0,967 | Split de test de Materials Project |
| ECE | 0,024 | Split de test de Materials Project |

No se han publicado en la informacion disponible resultados comparativos de los otros siete checkpoints ni comparaciones con modelos de sintetizabilidad alternativos.

## Requisitos de hardware

- No requiere GPU para inferencia: los artefactos son modelos de arboles (RandomForest/XGBoost) serializados con joblib y se ejecutan en CPU.
- VRAM estimada: no aplica; el consumo relevante es memoria RAM al cargar los `.joblib` y el PCA. El repositorio completo ocupa 33,1 GB, pero el checkpoint individual y el PCA son mucho mas ligeros (tamano exacto por archivo no disponible).
- GPU recomendadas: no aplica para inferencia. Para reentrenar los estudios de Optuna puede ser util una GPU, pero no se documenta.
- Cabe en cualquier equipo consumer: basta con Python, scikit-learn, xgboost, joblib y numpy.
- Opciones de despliegue: carga directa con `joblib.load` desde el paquete `apu_synthesizability` (`matinvent-BO/hcap_bo/src`); no aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; al ser modelos de arboles sobre vectores de 182-183 dimensiones, la inferencia por muestra es de orden de microsegundos a milisegundos en CPU.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de sintetizabilidad ni con alternativas de PU learning para materiales, por lo que no se puede establecer una tabla comparativa fiable sin inventar datos.

## Limitaciones y advertencias

- El repositorio esta marcado como `private: true` en la model card, aunque la licencia declarada es MIT; conviene verificar la disponibilidad real de los artefactos antes de depender de ellos.
- El modelo solo cubre composiciones inorganicas y se entreno exclusivamente con Materials Project; su dominio queda limitado a ese tipo de entradas y a la distribucion de dicha base de datos.
- Los positivos etiquetados provienen de entradas existentes en Materials Project, lo que puede introducir sesgo hacia compuestos ya conocidos y menos exoticos.
- Riesgo de falsos positivos por la naturaleza PU: la ausencia de etiqueta no equivale a insintetizable, y el modelo puede sobrestimar la sintetizabilidad de familias poco representadas.
- La capa de absteción y las puntuaciones OOD ayudan a mitigar extrapolaciones, pero no sustituyen una validacion experimental.
- Requiere el paquete `apu_synthesizability` y dependencias concretas (scikit-learn, xgboost, joblib, numpy) para deserializar; versiones incompatibles pueden romper la carga de los `.joblib`.
- No procesa texto ni lenguaje natural: no debe presentarse como un modelo de lenguaje ni usarse en tareas de NLP.
- No hay informacion sobre sesgos por tipo de compuesto, rendimiento en dominios externos a Materials Project ni sobre latencia en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/SheikhAhnaf/apu-synthesizability-checkpoints
- Repositorio de codigo y resultados: https://github.com/sheikhahnaf/matinvent-BO (subdirectorio `hcap_bo/`, ver `syn_finding.md`)
- DOI del repositorio: 10.57967/hf/9893
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
