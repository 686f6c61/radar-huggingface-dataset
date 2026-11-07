# openadmet/herg-chemeleon-baseline

## Resumen

`openadmet/herg-chemeleon-baseline` es un modelo de predicción de propiedades moleculares desarrollado por OpenADMET, un proyecto centrado en herramientas abiertas para drug discovery. Concretamente, estima el valor de pIC50 frente al canal hERG (codificado como `CHEMBL240` en ChEMBL), un antitarget de toxicidad cardiovascular cuya inhibición está asociada a prolongación del intervalo QT y riesgo de arritmias. El modelo se distribuye como un artefacto de entrenamiento del framework `openadmet-models` (Anvil), no como un transformer generativo.

Técnicamente se trata de un `ChemPropModel` (una red de message passing sobre grafos moleculares) inicializado desde los pesos del modelo preentrenado CheMeleon y ajustado con una cabeza FFN de 3 capas y anchura 1024 con dropout 0.1. El entrenamiento emplea el featurizador `ChemPropFeaturizer` con normalización del target y un `ShuffleSplitter` con `train_size: 1.0`, es decir, sin conjuntos de validación ni test.

Es relevante porque proporciona una línea base reproducible y abierta (Apache-2.0) para un endpoint crítico en el filtrado temprano de candidatos, entrenada sobre 7.977 compuestos con datos agregados de ChEMBL37. No es un modelo de lenguaje: no procesa texto ni mantiene conversaciones, sino SMILES.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ChemProp (message passing neural network sobre grafos moleculares) con cabeza FFN de 3 capas, anchura 1024, dropout 0.1 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: molecula via SMILES, no secuencia de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (metadatos; la entrada real son cadenas SMILES) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (artefacto de entrenamiento Anvil, gestionado con git-lfs; tamano del repo 0.1 GB) |

## Arquitectura y entrenamiento

El modelo es un `ChemPropModel` que opera sobre representaciones de grafos moleculares construidas con `ChemPropFeaturizer`, incluyendo normalización del target. La inicialización parte de los pesos preentrenados de CheMeleon (`from_chemeleon: true`), sobre los que se añade una cabeza fully-connected de 3 capas con anchura 1024 y dropout 0.1 para una única tarea de regresión (pIC50 frente a hERG).

Los datos provienen de la agregación de registros IC50 de ChEMBL37 depositada en el repositorio OpenADMET data-catalogs. El target es `pchembl_value_mean`, la media por compuesto de los valores `pchembl_value` sobre registros IC50. El split es `ShuffleSplitter` con `train_size: 1.0` y `random_state: 42`, lo que implica que los 7.977 compuestos se usan íntegramente para entrenamiento, sin validación ni test. El entrenamiento se ejecutó con `openadmet-models` mediante la CLI `openadmet anvil`. No se documentan en la información disponible detalles sobre número de tokens, composición del dataset más allá del recuento, ni uso de RLHF/DPO (no aplicable a este tipo de modelo).

## Capacidades

- Predicción de pIC50 frente a hERG para compuestos representados como SMILES.
- Regresión de una única tarea (`pchembl_value_mean`) sobre un target definido (`CHEMBL240`).
- Procesamiento por lotes mediante la CLI `openadmet predict`, con salida CSV que incluye la columna de predicción (`OADMET_PRED_chemprop-chembl_pchembl_value_mean`).
- Soporte de ejecución en CPU o GPU (`--accelerator`).
- Estimación de incertidumbre únicamente mediante ensembles de modelos; la desviación estándar (`OADMET_STD`) queda vacía en inferencia con un solo modelo.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, visión, audio ni generación de texto.

## Casos de uso

- Filtrado temprano de toxicidad cardiovascular: aplicar el modelo a una librería de compuestos (por ejemplo, un deck de ZINC como el incluido en `compounds_for_inference.csv`) para descartar candidatos con pIC50 elevado frente a hERG antes de ensayos in vitro.
- Priorización en hit-to-lead: puntuar series químicas y ordenar por riesgo hERG estimado, combinándolo con predicciones de potencia sobre el target terapéutico.
- Enriquecimiento de cribados virtuales: integrar la predicción como columna adicional en pipelines de docking o generación molecular para penalizar estructuras con alta afinidad por hERG.
- Construcción de ensembles y aprendizaje activo: el modelo sirve como miembro base en ensembles (documentados en los demos de OpenADMET) para obtener estimaciones de incertidumbre vía `OADMET_STD`.
- Monitorización de propiedades ADMET en pipelines internos: ejecución batch en CPU o GPU mediante `openadmet predict` sobre CSV de SMILES con la columna canónica `OPENADMET_CANONICAL_SMILES`.
- Reproducibilidad de líneas base: al ser un modelo sin split y con semilla fija (`random_state: 42`), sirve como referencia para comparar frente a modelos propios entrenados con el mismo dataset de ChEMBL37.
- Despliegue containerizado: uso de la imagen `ghcr.io/openadmet/openadmet-models:main` con montaje del directorio del modelo para entornos reproducibles con o sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no reporta métricas de validación ni test (el split es `train_size: 1.0`), por lo que no existen cifras de rendimiento generalizable a compuestos no vistos.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repo es de 0.1 GB, lo que sugiere un modelo ligero que probablemente quepa en GPUs de consumo, aunque no se confirma en la documentación.
- GPU recomendadas: no disponible; la CLI admite `--accelerator gpu` y el entorno conda `openadmet-models-gpu.yaml` con toolkit CUDA.
- CPU: soportada explícitamente (`--accelerator cpu`), tal como se usa en el ejemplo de inferencia de la model card.
- Despliegue: framework `openadmet-models` (Anvil) vía instalación desde GitHub o imagen Docker `ghcr.io/openadmet/openadmet-models:main`.
- Latencia y throughput: no disponibles.
- Requisito adicional: `git lfs` para descargar los pesos del repositorio.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de predicción de hERG ni con alternativas de la misma categoría (por ejemplo, otros modelos ChemProp o ADMET de referencia).

## Limitaciones y advertencias

- Modelo entrenado sin conjunto de validación ni test (`train_size: 1.0`), por lo que no hay estimación publicada de generalización; el rendimiento en compuestos fuera de distribución es desconocido.
- La propia model card advierte de que, pese a la curaduría de los datos, el rendimiento puede mejorar y conviene proceder con cautela.
- Target agregado como media de `pchembl_value` sobre registros IC50, lo que puede mezclar ensayos con condiciones heterogéneas y generar ruido en las etiquetas.
- Incertidumbre no estimable con un único modelo; requiere ensembles para obtener `OADMET_STD`.
- Entrada limitada a SMILES válidos; no procesa texto, imágenes ni otras modalidades.
- Idiomas declarados: únicamente inglés en metadatos; sin capacidades multilingües reales.
- Licencia Apache-2.0: permite uso comercial, pero no se documentan garantías ni soporte.
- Sesgos conocidos: no disponibles en la información proporcionada; cabe esperar sesgos derivados de la cobertura química de ChEMBL37.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de predicciones sobreconfiadas fuera del dominio químico de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openadmet/herg-chemeleon-baseline
- README del modelo: https://huggingface.co/openadmet/herg-chemeleon-baseline/blob/main/README.md
- Árbol de ficheros: https://huggingface.co/openadmet/herg-chemeleon-baseline/tree/main
- Repositorio openadmet-models: https://github.com/OpenADMET/openadmet-models
- Catálogos de datos OpenADMET: https://github.com/OpenADMET/data-catalogs
- Documentación de OpenADMET: https://docs.openadmet.org/en/latest/
- Demos de OpenADMET: https://demos.openadmet.org/en/latest/
- Demo de ensembles y aprendizaje activo: https://demos.openadmet.org/en/latest/demos/04_Ensemble_Model_Training/04_Ensemble_Model_Training_Active_Learning.html
- Imagen Docker: ghcr.io/openadmet/openadmet-models:main
- Deck de ejemplo ZINC: https://raw.githubusercontent.com/PatWalters/datafiles/refs/heads/main/zinc_10K.smi
