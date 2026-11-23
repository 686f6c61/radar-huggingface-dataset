# openadmet/fxr-tabpfn-monroe-v1

## Resumen

`openadmet/fxr-tabpfn-monroe-v1` es un modelo predictivo de quimioinformática desarrollado por OpenADMET que estima la potencia de unión (pEC50) de compuestos químicos frente al receptor farnesoide X (FXR, identificador ChEMBL2047). No es un modelo de lenguaje: es un regresor tabular construido sobre TabPFN v2 que recibe embeddings moleculares de 720 dimensiones generados por el *foundation model* químico Monroe y devuelve un valor continuo de pEC50.

El modelo aborda un problema clásico de descubrimiento de fármacos: predecir actividad biológica sobre dianas terapéuticas a partir de estructura química, evitando experimentos *in vitro* costosos. FXR es una diana relevante en enfermedades metabólicas y hepáticas (colestasis, esteatohepatitis no alcohólica), por lo que disponer de un predictor calibrado acelera el cribado virtual de librerías.

Técnicamente es un artefacto pequeño (0,2 GB) que combina un featurizador preentrenado (Monroe) con un regresor TabPFN v2 configurado con `ignore_pretraining_limits: true` para aceptar 720 características, por encima del límite de 500 del preentrenamiento original. Se distribuye bajo licencia Apache 2.0 y está pensado para ejecutarse mediante el framework Anvil de `openadmet-models`, en CPU o GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresor tabular TabPFN v2 sobre embeddings moleculares Monroe (720 características) |
| Parametros totales | no disponible (pesos de TabPFN v2; el autor no publica recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (metadatos del repositorio; la tarea es numérica, no lingüística) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (artefacto Anvil dentro de un repo de 0,2 GB con Git LFS) |

## Arquitectura y entrenamiento

El pipeline tiene dos etapas. Primero, un featurizador `MonroeFeaturizer` convierte cada molécula (canónica en SMILES) en un vector de 720 dimensiones usando embeddings del *foundation model* Monroe. Después, un `TabPFNRegressorModel` con pesos de TabPFN v2 realiza la regresión sobre ese vector. TabPFN es un transformer preentrenado para *in-context learning* sobre datos tabulares: no requiere ajuste de hiperparámetros y aproxima la inferencia bayesiana sobre el conjunto de entrenamiento en cada predicción. Como 720 características exceden el límite de 500 del preentrenamiento, el autor activa `ignore_pretraining_limits: true`.

Los datos provienen de ChEMBL37, concretamente de la agregación de registros EC50 depositada en `OpenADMET/data-catalogs`. La variable objetivo es `pchembl_value_mean`, la media por compuesto de los valores pChEMBL sobre registros EC50. La partición emplea `ClusterSplitter` con esqueletos de Bemis-Murcko y semilla 42, lo que agrupa compuestos por andamiaje estructural para evitar fuga de información entre entrenamiento y test. El entrenamiento se realizó con `openadmet-models` en el commit `102d3fa` mediante la herramienta `openadmet anvil`. No se documentan número de tokens, composición detallada del dataset ni etapas de RLHF/DPO (no aplicables a un regresor tabular).

## Capacidades

- Predicción de pEC50 frente a FXR a partir de SMILES canónico (`OPENADMET_CANONICAL_SMILES`).
- Regresión tabular sobre embeddings químicos de 720 dimensiones con TabPFN v2.
- Ejecución en CPU o GPU mediante el flag `--accelerator` de la CLI `openadmet predict`.
- Salida en CSV con columnas `OADMET_PRED_openadmet-FXR-EC50-tabpfn_monroe_pchembl_value_mean` y `OADMET_STD_...`.
- Estimación de incertidumbre únicamente si se entrena un *ensemble* (el modelo individual deja la columna de desviación estándar vacía).
- Integración con el ecosistema OpenADMET (Anvil, `openadmet-models`, imagen Docker `ghcr.io/openadmet/openadmet-models:main`).
- No soporta *tool calling*, agentes, razonamiento multi-paso, visión, audio ni generación de texto.

## Casos de uso

- Cribado virtual de librerías comerciales: procesar un deck ZINC (el repo incluye `compounds_for_inference.csv` con 10 000 compuestos de ejemplo) y ordenar por pEC50 predicho para priorizar síntesis y ensayos.
- Priorización en programas de descubrimiento sobre FXR: filtrar series químicas antes de ensayos *in vitro* de EC50, reduciendo coste experimental en dianas metabólicas y hepáticas.
- Enriquecimiento de modelos QSAR internos: usar las predicciones como *feature* adicional o como *baseline* frente a modelos propietarios entrenados con datos privados.
- Análisis de relaciones estructura-actividad (SAR): comparar predicciones dentro de una misma familia de esqueletos Bemis-Murcko para detectar saltos de potencia asociados a modificaciones estructurales.
- Filtrado temprano en pipelines de generación molecular: descartar candidatos generados por modelos generativos que predigan baja potencia FXR antes de costosas evaluaciones *in silico* de docking.
- Reproducibilidad y auditoría metodológica: al fijar semilla 42 y partición por esqueletos, sirve como referencia pública para comparar nuevas estrategias de featurización o regresión en quimioinformática.
- Docencia y prototipado: entorno reproducible con Docker y datos de ejemplo para demostrar flujos de transferencia de *foundation models* químicos a tareas de regresión supervisada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de test (R², RMSE, MAE, coeficiente de Spearman) ni comparaciones cuantitativas con otros predictores de FXR.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 0,2 GB, lo que sugiere que la inferencia cabe holgadamente en cualquier GPU consumer moderna; TabPFN v2 es un transformer pequeño y el cuello de botella es el featurizador Monroe.
- GPU recomendadas: cualquier GPU con soporte CUDA (RTX 3090, RTX 4090, A100, H100). El autor no especifica requisitos mínimos.
- CPU: soportada explícitamente mediante `--accelerator cpu`; viable para lotes pequeños o medianos.
- Despliegue: CLI `openadmet predict` del paquete `openadmet-models` (instalación vía conda + pip) o imagen Docker `ghcr.io/openadmet/openadmet-models:main` con `--runtime=nvidia --gpus all` para GPU.
- Latencia y throughput: no disponibles. Dependen del tamaño del lote, del dispositivo y del coste del featurizador Monroe, no documentado en la model card.
- Almacenamiento: requiere Git LFS para clonar y `git lfs pull` para descargar los pesos.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas concretas. Como referencias conceptuales de la misma categoría (regresión de actividad sobre dianas ChEMBL) cabría citar modelos QSAR clásicos (Random Forest, XGBoost sobre fingerprints Morgan/ECFP), Chemprop (GNN supervisado) o el propio TabPFN v2 sin featurizador Monroe, pero la model card no aporta métricas comparativas.

| Modelo | Enfoque | Contexto / features | Licencia | Disponibilidad |
|---|---|---|---|---|
| fxr-tabpfn-monroe-v1 | TabPFN v2 + Monroe, 720 features | Tabular, sin contexto secuencial | Apache 2.0 | Hugging Face (openadmet) |
| QSAR clásico (RF/XGBoost + ECFP) | Árboles sobre fingerprints | Típicamente 1024-2048 bits | Variable | Depende de implementación |
| Chemprop (GNN) | MPNN supervisado | Grafo molecular | MIT (referencia) | GitHub IBM/Chemprop |
| TabPFN v2 sin Monroe | Regresor tabular | ≤500 features en preentrenamiento | TabPFN license (no Apache) | PriorLabs |

Los datos de rendimiento de las alternativas no se han contrastado con este modelo por falta de métricas publicadas.

## Limitaciones y advertencias

- Modelo específico de una única diana (FXR, ChEMBL2047) y un único endpoint (pEC50 medio de EC50); no generaliza a otras dianas ni a otros tipos de ensayo (Ki, IC50, toxicidad).
- Entrenado sobre ChEMBL37; el rendimiento puede degradarse en quimiotipos poco representados o fuera del dominio químico de ChEMBL.
- La partición por esqueletos Bemis-Murcko reduce la fuga de información, pero no sustituye una validación temporal o prospectiva; las métricas de generalización no se publican.
- La incertidumbre no está calibrada por defecto: la columna `OADMET_STD` queda vacía salvo que se entrene un *ensemble* (documentado en los demos de OpenADMET).
- `ignore_pretraining_limits: true` fuerza a TabPFN v2 más allá de su límite de 500 características; el autor no documenta el impacto de esta decisión en la precisión.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí de predicciones sobreconfiadas sobre compuestos fuera de distribución.
- Sesgos potenciales derivados de ChEMBL: sobrerrepresentación de ciertas series químicas y sesgo de publicación hacia compuestos activos.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las licencias del featurizador Monroe y de los pesos de TabPFN v2 subyacentes, no detalladas en la model card.
- Requiere Git LFS y el framework `openadmet-models`; no es un modelo plug-and-play con `transformers` ni con `vLLM`/`llama.cpp`.
- Idiomas: los metadatos declaran solo `en`; la tarea es numérica y no procesa lenguaje natural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openadmet/fxr-tabpfn-monroe-v1
- Repositorio `openadmet-models`: https://github.com/OpenADMET/openadmet-models
- Documentación de instalación de OpenADMET: https://docs.openadmet.org/en/latest/installation.html
- Catálogos de datos OpenADMET: https://github.com/OpenADMET/data-catalogs
- Demo de entrenamiento de ensembles y *active learning*: https://demos.openadmet.org/en/latest/demos/04_Ensemble_Model_Training/04_Ensemble_Model_Training_Active_Learning.html
- Imagen Docker: `ghcr.io/openadmet/openadmet-models:main`
- Fichero de compuestos de ejemplo (deck ZINC): https://raw.githubusercontent.com/PatWalters/datafiles/refs/heads/main/zinc_10K.smi
- ChEMBL (fuente de datos, versión 37): https://www.ebi.ac.uk/chembl/
