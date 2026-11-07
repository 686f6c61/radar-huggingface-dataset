# openadmet/5ht2-chemeleon-baseline

## Resumen

`openadmet/5ht2-chemeleon-baseline` es un modelo de prediccion de propiedades moleculares desarrollado por OpenADMET, un proyecto centrado en construir herramientas abiertas para quimica medicinal y descubrimiento de farmacos. No es un modelo de lenguaje: es un modelo de regresion multitarea basado en ChemProp que predice la potencia agonista (pEC50) sobre tres subtipos del receptor de serotonina 5-HT2 (5-HT2A, 5-HT2B y 5-HT2C). El modelo se inicializa a partir de los pesos del foundation model molecular CheMeleon, desarrollado por MIT y BASF, lo que permite aprovechar representaciones preentrenadas en un regimen de datos escasos.

El modelo resuelve un problema concreto de la fase temprana del descubrimiento de farmacos: estimar la afinidad funcional de compuestos candidatos por receptores 5-HT2 antes de sintetizarlos y ensayarlos. El sesgo hacia el subtipo 5-HT2B es un problema de seguridad conocido en farmacos serotoninergicos (riesgo de valvulopatia y fibrosis cardiaca), por lo que disponer de un predictor multitarea que cubra los tres subtipos de forma simultanea resulta practico para el filtrado temprano.

La version publicada es una *baseline* entrenada sin particion de validacion ni test (`train_size: 1.0`), sobre 1.188 compuestos extraidos de ChEMBL37. Su interes es doble: sirve como punto de partida reproducible para el resto de la comunidad y como ejemplo del stack `openadmet-models` (Anvil), que estandariza el entrenamiento, el empaquetado y la inferencia de este tipo de modelos quimicos. El repositorio ocupa 0,1 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ChemProp (message passing neural network sobre grafos moleculares) con featurizer `ChemPropFeaturizer` y normalizacion por target; cabecera FFN de 3 capas y anchura 1024 con dropout 0,1 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la entrada es una molecula en formato SMILES) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en el formato propio de Anvil; no se documentan variantes GGUF, AWQ ni similares) |
| Idiomas soportados | en (etiqueta declarada; el modelo no procesa lenguaje natural, solo SMILES) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos del framework `openadmet-models` dentro del directorio `anvil_training/` (descarga via Git LFS) |

## Arquitectura y entrenamiento

El modelo es un ChemProp multitarea con tres cabezas de regresion, una por subtipo de receptor (5-HT2A, 5-HT2B, 5-HT2C). La entrada son moleculas representadas como SMILES, que se convierten en grafos moleculares mediante `ChemPropFeaturizer` con normalizacion por target. Sobre la representacion aprendida por el encoder se aplica una FFN de tres capas con anchura 1024 y dropout 0,1. Los pesos del encoder se inicializan desde CheMeleon, un foundation model molecular preentrenado por MIT y BASF orientado a prediccion con pocos datos, lo que reduce la dependencia del tamano del conjunto de entrenamiento especifico.

El entrenamiento se realizo con el framework `openadmet-models` a traves de la CLI `openadmet anvil`. Los datos proceden de la agregacion de registros EC50 de ChEMBL37 en los data-catalogs de OpenADMET, con el endpoint definido como la media por compuesto de `pchembl_value` sobre los registros EC50 (`pchembl_value_mean`). El conjunto de entrenamiento contiene 1.188 compuestos. Se uso un `ShuffleSplitter` con `train_size: 1.0` y semilla aleatoria 42, es decir, sin conjunto de validacion ni de test: se trata de un ajuste sobre la totalidad de los datos disponibles, no de una evaluacion held-out. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion, que no aplican a este tipo de modelo.

## Capacidades

- Prediccion de potencia agonista (pEC50) para 5-HT2A, 5-HT2B y 5-HT2C en una sola pasada multitarea.
- Inferencia sobre lotes de compuestos a partir de un CSV con una columna de SMILES, generando columnas `OADMET_PRED_*` por subtipo.
- Soporte de calculo de incertidumbre mediante ensamblados de modelos (las columnas `OADMET_STD_*` solo se rellenan si se ejecuta un ensemble).
- Ejecucion en CPU o GPU mediante el flag `--accelerator` de la CLI de Anvil.
- Integracion con el ecosistema `openadmet-models` y despliegue reproducible mediante contenedor Docker (`ghcr.io/openadmet/openadmet-models:main`).
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni generacion de texto: es un regresor tabular sobre grafos moleculares.

## Casos de uso

- Filtrado temprano de bibliotecas quimicas: dado un deck de compuestos (por ejemplo, un subconjunto de ZINC), predecir pEC50 para los tres subtipos y descartar candidatos con alta probabilidad de agonismo 5-HT2B, reduciendo el riesgo de toxicidad cardiovascular antes de sintetizar.
- Priorizacion en programas de descubrimiento de psicodelicos y serotoninergicos: ordenar compuestos por potencia estimada en 5-HT2A frente a 5-HT2B y 5-HT2C para seleccionar candidatos con perfil de selectividad deseado.
- Reposicionamiento de farmacos: evaluar de forma masiva farmacos ya aprobados frente a los tres receptores para detectar efectos secundarios serotoninergicos no documentados.
- Generacion de hipotesis para quimica medicinal: usar las predicciones como punto de partida para decidir que series quimicas merecen sintesis y ensayo experimental, dado el bajo coste computacional de la inferencia frente al ensayo in vitro.
- Benchmark interno de modelos: servir como baseline de referencia contra el que comparar modelos propios entrenados con los mismos datos de ChEMBL37 y el mismo split.
- Docencia y prototipado del stack OpenADMET: el repositorio incluye `compounds_for_inference.csv` y `run_model_inference.sh`, lo que permite reproducir el pipeline completo de entrenamiento e inferencia en un entorno controlado con Docker.
- Construccion de ensembles con estimacion de incertidumbre: entrenar variantes del modelo y combinarlas para obtener desviaciones estandar por prediccion, utiles en seleccion activa de compuestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de validacion ni de test, coherente con el hecho de que el modelo se entreno con `train_size: 1.0` y sin particion held-out.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio completo ocupa 0,1 GB, lo que sugiere un modelo pequeno que probablemente cabe holgadamente en cualquier GPU consumer, pero no se publican cifras de memoria.
- GPU recomendadas: no se especifican modelos concretos. La documentacion indica que se puede usar aceleracion CUDA mediante el entorno `openadmet-models-gpu.yaml` o el contenedor con `--runtime=nvidia --gpus all`.
- Compatibilidad con GPU consumer: muy probable por el tamano del artefacto (0,1 GB), aunque no se confirma explicitamente en la informacion disponible.
- Opciones de despliegue: CLI `openadmet predict` del paquete `openadmet-models`, instalacion via conda (`devtools/conda-envs/openadmet-models.yaml` o `openadmet-models-gpu.yaml`) o contenedor Docker `ghcr.io/openadmet/openadmet-models:main`. Requiere `git lfs` para descargar los pesos.
- Latencia y throughput: no disponibles. El ejemplo de la model card ejecuta la inferencia en CPU (`--accelerator cpu`) sobre un subconjunto de compuestos de ZINC, lo que indica que el coste es bajo, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Targets | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| openadmet/5ht2-chemeleon-baseline | ChemProp multitarea inicializado desde CheMeleon | 5-HT2A, 5-HT2B, 5-HT2C (pEC50) | 1.188 compuestos de ChEMBL37, sin split | Apache 2.0 | Hugging Face |
| CheMeleon (MIT/BASF) | Foundation model molecular preentrenado | Generico, ajustable a tareas | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada |
| Otros baselines de OpenADMET | ChemProp / modelos del stack Anvil | Segun target | Segun dataset | Apache 2.0 (presumiblemente) | Repositorio OpenADMET |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- El modelo se entreno sin conjunto de validacion ni de test (`train_size: 1.0`), por lo que no existe una estimacion honesta de su error de generalizacion. Cualquier metrica de ajuste sobre los datos de entrenamiento estara sobreestimada.
- El conjunto de entrenamiento es pequeno (1.188 compuestos) y procede de una unica fuente (ChEMBL37), lo que limita la cobertura quimica y puede producir predicciones poco fiables fuera del espacio quimico representado.
- Los propios autores advierten de que el modelo se entreno con datos publicos y que su rendimiento aun puede mejorar; recomiendan precaucion en su uso.
- Las columnas de desviacion estandar (`OADMET_STD_*`) aparecen vacias en inferencia con un unico modelo; la incertidumbre solo es estimable con ensembles.
- El endpoint es una media agregada de `pchembl_value` sobre registros EC50, lo que puede mezclar protocolos experimentales heterogeneos y arrastrar ruido de medida.
- No es un modelo de lenguaje: no procesa texto libre, no soporta instrucciones en lenguaje natural ni razonamiento, y la etiqueta de idioma `en` es meramente declarativa.
- La licencia Apache 2.0 permite uso comercial, pero la precision del modelo no esta validada para decisiones regulatorias ni para su uso como sustituto de ensayos experimentales.
- No se documentan sesgos especificos ni evaluaciones de robustez frente a dominios quimicos fuera de distribucion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openadmet/5ht2-chemeleon-baseline
- Repositorio openadmet-models: https://github.com/OpenADMET/openadmet-models
- Data-catalogs de OpenADMET: https://github.com/OpenADMET/data-catalogs
- Documentacion de OpenADMET: https://docs.openadmet.org/en/latest/
- Demos de Anvil: https://demos.openadmet.org/en/latest/
- Demo de entrenamiento de ensembles: https://demos.openadmet.org/en/latest/demos/04_Ensemble_Model_Training/04_Ensemble_Model_Training_Active_Learning.html
- Contenedor Docker: ghcr.io/openadmet/openadmet-models:main
- Articulo sobre CheMeleon (Unite.AI): https://www.unite.ai/mit-details-chemeleon-model-for-low-data-molecular-prediction/
- Conjunto de compuestos de ejemplo (ZINC 10K): https://raw.githubusercontent.com/PatWalters/datafiles/refs/heads/main/zinc_10K.smi
