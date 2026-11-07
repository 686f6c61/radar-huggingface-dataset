# openadmet/cyp1a2-cyp2d6-cyp3a4-cyp2c9-chemeleon-v1

## Resumen

`openadmet/cyp1a2-cyp2d6-cyp3a4-cyp2c9-chemeleon-v1` es un modelo de predicción de propiedades farmacocinéticas desarrollado por OpenADMET, una organización centrada en la predicción abierta de propiedades ADMET (absorción, distribución, metabolismo, excreción y toxicidad). El modelo predice valores de pIC50 para cuatro isoformas del citocromo P450 (CYP3A4, CYP2D6, CYP2C9 y CYP1A2), enzimas clave en el metabolismo de fármacos y en el riesgo de interacciones medicamentosas.

No es un modelo de lenguaje: se trata de un modelo de quimioinformática basado en la arquitectura ChemProp, inicializado con pesos de CheMeleon, un modelo preentrenado de representación molecular. El modelo es multitarea (cuatro tareas simultáneas), con una FFN de tres capas y anchura 1024, y se ha entrenado sobre 8.068 compuestos con datos de pIC50 curados de ChEMBL 37.

Su relevancia actual radica en que actualiza la línea base de OpenADMET a la última versión pública de ChEMBL (37) y se distribuye con licencia Apache 2.0, lo que facilita su uso en pipelines de descubrimiento de fármacos y filtrado temprano de candidatos. El repositorio ocupa 0,1 GB y está orientado a inferencia sobre SMILES mediante el framework Anvil de `openadmet-models`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ChemProp (MPNN) inicializada desde pesos CheMeleon, multitarea con FFN de 3 capas y anchura 1024, dropout 0.1 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; opera sobre grafos moleculares) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (metadatos del modelo; la entrada son SMILES) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible explícitamente; distribuido vía Git LFS dentro de `anvil_training/` |

## Arquitectura y entrenamiento

El modelo emplea `ChemPropFeaturizer` con normalización de target y `ChemPropModel`, un message passing neural network (MPNN) para grafos moleculares. Los pesos se inicializan desde CheMeleon (`from_chemeleon: true`), lo que proporciona una representación molecular preentrenada antes del ajuste fino multitarea sobre las cuatro isoformas CYP. La cabeza de predicción es una FFN de tres capas con anchura 1024 y dropout 0.1, con cuatro tareas de salida (una por isoforma).

El entrenamiento se realizó con `openadmet-models` mediante la herramienta `openadmet anvil`. El target es `pchembl_value_mean`, la media por compuesto de los valores de pIC50 derivados de registros IC50 en ChEMBL 37 (agregación depositada en OpenADMET data-catalogs). Se usó `ShuffleSplitter` con `train_size: 1.0` y `random_state: 42`: es decir, un modelo sin partición de validación ni test, entrenado únicamente con el conjunto de entrenamiento completo de 8.068 compuestos. No se documenta uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de regresión molecular.

## Capacidades

- Predicción de pIC50 para cuatro isoformas del citocromo P450: CYP3A4 (CHEMBL340), CYP2D6 (CHEMBL289), CYP2C9 (CHEMBL3397) y CYP1A2 (CHEMBL3356).
- Modelo multitarea: una sola pasada produce las cuatro predicciones simultáneamente.
- Entrada basada en SMILES canónicos (columna `OPENADMET_CANONICAL_SMILES` en el ejemplo de la model card).
- Salida en CSV con columnas `OADMET_PRED_chemprop_OPENADMET_LOGAC50_<ISOFRMA>` y `OADMET_STD_chemprop_OPENADMET_LOGAC50_<ISOFRMA>`.
- Estimación de incertidumbre únicamente mediante ensembles de modelos (las columnas de desviación estándar quedan vacías en inferencia con un modelo individual).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales: su ámbito es exclusivamente la predicción de propiedades moleculares.

## Casos de uso

- Filtrado temprano en descubrimiento de fármacos: dado un deck de compuestos en SMILES (por ejemplo, un subconjunto de ZINC), predecir el pIC50 frente a las cuatro isoformas CYP para descartar candidatos con alta inhibición metabólica antes de ensayos in vitro.
- Evaluación de riesgo de interacciones medicamentosas: identificar compuestos con inhibición probable de CYP3A4 o CYP2D6, isoformas responsables de gran parte del metabolismo de fármacos, para priorizar estudios de DDI (drug-drug interactions).
- Priorización en cribado virtual: integrar las predicciones como filtro adicional en pipelines de docking o generación molecular, reduciendo el número de moléculas que pasan a validación experimental.
- Modelado de propiedades ADMET en química medicinal: usar las predicciones de pIC50 CYP como descriptores en modelos de QSAR o en la optimización multiobjetivo de leads.
- Aprendizaje activo y diseño de experimentos: entrenar ensembles con `openadmet-models` y emplear la desviación estándar de las predicciones para seleccionar compuestos con mayor incertidumbre y guiar la siguiente ronda experimental.
- Reproducibilidad en investigación académica: al estar entrenado sobre ChEMBL 37 público y distribuirse con Apache 2.0, sirve como línea base reproducible para comparar nuevos métodos de predicción de metabolismo.
- Despliegue en pipelines automatizados: el comando `openadmet predict` permite ejecución por lotes en CPU o GPU, integrable en flujos de CI o scripts de evaluación de librerías químicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de validación ni test (el modelo se entrenó con `train_size: 1.0`, sin partición de evaluación), por lo que no es posible reportar valores de R², RMSE, MAE ni AUC frente a otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio completo ocupa 0,1 GB, por lo que el modelo es muy ligero y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquiera con soporte CUDA; el modelo admite aceleración GPU mediante el entorno `openadmet-models-gpu.yaml`, pero también se ejecuta en CPU (el ejemplo de la model card usa `--accelerator cpu`).
- Cabe en GPU consumer: sí, con amplio margen (RTX 3060, RTX 4090, etc.), dado el reducido tamaño del repositorio.
- Opciones de despliegue: framework Anvil de `openadmet-models` (instalación vía conda/pip desde GitHub) o contenedor Docker `ghcr.io/openadmet/openadmet-models:main` con soporte para `--gpus all` o modo solo CPU.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tareas | Datos | Licencia | Contexto / entrada | Disponibilidad |
|---|---|---|---|---|---|
| openadmet/cyp1a2-cyp2d6-cyp3a4-cyp2c9-chemeleon-v1 | 4 isoformas CYP (pIC50) | ChEMBL 37, 8.068 compuestos | apache-2.0 | SMILES (grafos moleculares) | Hugging Face, 41 descargas |
| Versiones previas del modelo CYP de OpenADMET | 4 isoformas CYP | ChEMBL anterior a 37 | apache-2.0 (presumible) | SMILES | Repositorios de OpenADMET; datos concretos no disponibles |
| CheMeleon (modelo base) | Representación molecular preentrenada | no disponible | no disponible | SMILES | Pesos usados para inicializar este modelo |
| Otros predictores CYP públicos | Variable | Variable | Variable | Variable | No disponible en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo se entrenó sin conjunto de validación ni test (`train_size: 1.0`), por lo que no existen métricas de generalización publicadas y el riesgo de sobreajuste no está cuantificado.
- La propia model card advierte de que, aunque los datos se han curado, el rendimiento "puede mejorar" y recomienda proceder con cautela.
- Cobertura limitada a cuatro isoformas CYP; no predice otras isoformas ni otros endpoints ADMET.
- Entrenado sobre datos públicos de ChEMBL 37, con posible sesgo hacia el espacio químico sobrerrepresentado en ChEMBL (fármacos y compuestos similares a fármacos).
- La estimación de incertidumbre requiere ensembles; con un único modelo, las columnas `OADMET_STD` quedan vacías, lo que limita el uso en decisiones que dependan de la confianza de la predicción.
- El idioma declarado es `en` y la entrada debe ser SMILES canónicos; no es un modelo de lenguaje y no admite prompts en lenguaje natural.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se recomienda validar las predicciones experimentalmente antes de cualquier aplicación regulatoria o clínica.
- No debe usarse como sustituto de ensayos in vitro o in vivo; es una herramienta de priorización, no de decisión final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openadmet/cyp1a2-cyp2d6-cyp3a4-cyp2c9-chemeleon-v1
- Árbol de archivos del repositorio: https://huggingface.co/openadmet/cyp1a2-cyp2d6-cyp3a4-cyp2c9-chemeleon-v1/tree/main
- Repositorio openadmet-models: https://github.com/OpenADMET/openadmet-models
- Documentación de OpenADMET: https://docs.openadmet.org/en/latest/
- Demos de Anvil: https://demos.openadmet.org/en/latest/
- Demo de entrenamiento de ensembles: https://demos.openadmet.org/en/latest/demos/04_Ensemble_Model_Training/04_Ensemble_Model_Training_Active_Learning.html
- Data catalogs de OpenADMET: https://github.com/OpenADMET/data-catalogs
- Conjunto de compuestos de ejemplo (ZINC 10K): https://raw.githubusercontent.com/PatWalters/datafiles/refs/heads/main/zinc_10K.smi
- Imagen Docker: ghcr.io/openadmet/openadmet-models:main
