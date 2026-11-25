# openadmet/cyp1a2-cyp2d6-cyp3a4-cyp3c9-chemeleon-baseline

## Resumen

El modelo `openadmet/cyp1a2-cyp2d6-cyp3a4-cyp3c9-chemeleon-baseline` es un modelo multitarea de prediccion de inhibicion de las enzimas del citocromo P450 (CYP1A2, CYP2D6, CYP3A4 y CYP3C9) desarrollado por OpenADMET. Se trata de una implementacion basada en la arquitectura CheMeleon, orientada a predecir valores de pIC50 a partir de estructuras moleculares representadas como SMILES. El modelo se entrena sobre datos curados de ChEMBL y se distribuye como parte del ecosistema `openadmet-models`, que incluye el framework Anvil para entrenamiento e inferencia.

El modelo es relevante en el contexto del descubrimiento de farmacos, donde la prediccion temprana de la inhibicion de las isoenzimas CYP permite descartar candidatos con riesgos de interacciones farmacologicas o toxicidad. Al ser un modelo multitarea, comparte representaciones entre los cuatro objetivos, lo que puede resultar util cuando existen correlaciones entre las afinidades de un mismo compuesto por distintas isoformas.

Es importante destacar que el propio autor lo etiqueta explicitamente como un modelo *baseline* entrenado con datos publicos, advirtiendo que su rendimiento es limitado y que debe usarse con cautela. No se trata de un modelo de lenguaje, sino de un modelo predictivo de propiedades quimicas, por lo que muchas de las especificaciones habituales (contexto, cuantizacion, tool calling) no aplican.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CheMeleon (modelo multitarea para prediccion de propiedades moleculares) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (metadatos del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 0,1 GB gestionado con git lfs) |

## Arquitectura y entrenamiento

La arquitectura CheMeleon es un modelo multitarea disenado para predecir propiedades moleculares a partir de representaciones de moleculas (SMILES). En esta version concreta, se entrena de forma conjunta sobre cuatro tareas de regresion correspondientes a los valores de pIC50 de las isoenzimas CYP1A2, CYP2D6, CYP3A4 y CYP3C9, con datos curados de ChEMBL.

El modelo se ha entrenado como un modelo *no split*, es decir, sin conjuntos de validacion ni de test, con una fraccion de entrenamiento de `1.0`. Esto implica que no se ha reservado ninguna particion para evaluacion, lo que limita la capacidad de estimar su rendimiento de forma objetiva y refuerza la advertencia del autor sobre su calidad. No se especifican en la informacion disponible el numero de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en este dominio). Tampoco se detallan innovaciones tecnicas adicionales como decodificacion especulativa o attention linear, que no tienen sentido en este tipo de modelo.

## Capacidades

- Prediccion de valores de pIC50 para cuatro isoenzimas del citocromo P450: CYP1A2, CYP2D6, CYP3A4 y CYP3C9.
- Procesamiento de moleculas de entrada en formato SMILES (columna canonica `OPENADMET_CANONICAL_SMILES` en el ejemplo del autor).
- Prediccion multitarea: genera simultaneamente las predicciones para los cuatro objetivos en una sola pasada.
- Integracion con el framework Anvil de `openadmet-models` para entrenamiento, inferencia y gestion de pipelines.
- Ejecucion en CPU o GPU mediante el flag `--accelerator`.
- Soporte de despliegue mediante Docker (imagen `ghcr.io/openadmet/openadmet-models:main`).
- No soporta tool calling, agentes, razonamiento multi-step, vision, audio ni generacion de texto: es un modelo predictivo de propiedades quimicas, no un modelo de lenguaje.

## Casos de uso

- Filtrado temprano en descubrimiento de farmacos: el modelo permite descartar compuestos con alta probabilidad de inhibir isoenzimas CYP antes de sintetizarlos, reduciendo costes experimentales. Es adecuado por su capacidad de prediccion multitarea sobre SMILES.
- Priorizacion de bibliotecas quimicas: dado un conjunto de moleculas (por ejemplo, un deck de ZINC como el incluido en `compounds_for_inference.csv`), se pueden generar predicciones de pIC50 para ordenar candidatos por riesgo de inhibicion.
- Evaluacion de interacciones farmacologicas potenciales: la prediccion de inhibicion de CYP3A4 y CYP2D6 es relevante para estimar riesgos de interacciones metabolizadas por estas enzimas.
- Analisis de relaciones estructura-actividad (SAR): al comparar predicciones entre compuestos estructuralmente similares se pueden identificar patrones asociados a la inhibicion de cada isoforma.
- Generacion de datos sinteticos de partida para modelos mas avanzados: al ser un baseline, puede servir como referencia inicial o como modelo profesor en estrategias de active learning o ensembles (como sugiere la documentacion de OpenADMET).
- Integracion en pipelines de cribado virtual: mediante el comando `openadmet predict` o scripts bash, el modelo se puede encadenar con otras herramientas de quimioinformatica para procesar lotes de compuestos de forma automatizada.
- Prototipado en entornos con recursos limitados: al ejecutarse en CPU y con un repositorio de solo 0,1 GB, es viable en estaciones de trabajo sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el rendimiento del modelo es "bastante pobre" (*quite poor*) y que se trata de un baseline entrenado sin particiones de validacion ni test, por lo que no existen metricas objetivas reportadas en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB, por lo que el modelo es muy ligero y probablemente quepa en cualquier GPU consumer.
- GPU recomendadas: no se especifican modelos concretos; el autor menciona soporte CUDA mediante el entorno `openadmet-models-gpu.yaml` y el flag `--accelerator gpu`.
- Compatibilidad con GPU consumer: altamente probable dado el tamano del repositorio, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: framework Anvil de `openadmet-models` (instalacion via conda/pip), Docker con la imagen `ghcr.io/openadmet/openadmet-models:main`, ejecucion en CPU o GPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| openadmet/cyp1a2-cyp2d6-cyp3a4-cyp3c9-chemeleon-baseline | no disponible | no aplica | no reportado (baseline, calidad declarada baja) | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de modelos comparables de la misma categoria (prediccion multitarea de inhibicion CYP a partir de SMILES) con los que establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El autor advierte explicitamente de que el rendimiento del modelo es "bastante pobre" y recomienda proceder con cautela.
- Entrenado como modelo *no split*: sin conjuntos de validacion ni test, lo que impide estimar su capacidad de generalizacion y favorece el sobreajuste a los datos de entrenamiento.
- Entrenado unicamente con datos publicos curados de ChEMBL, lo que puede introducir sesgos de cobertura hacia el espacio quimico representado en esa base de datos.
- Las columnas de incertidumbre (`OADMET_STD`) aparecen vacias en el ejemplo de inferencia, ya que la incertidumbre solo se estima entrenando un ensemble de modelos.
- No es un modelo de lenguaje: no soporta generacion de texto, tool calling, agentes ni capacidades multilingues.
- Licencia Apache 2.0: permite uso comercial, pero dada la calidad declarada del modelo, no es recomendable para decisiones criticas en produccion sin validacion experimental adicional.
- Dependencia del ecosistema `openadmet-models` y de `git lfs` para descargar los pesos, lo que anade requisitos de infraestructura.
- No se especifican los parametros totales ni el formato exacto de los pesos, lo que dificulta la reproducibilidad fuera del framework recomendado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openadmet/cyp1a2-cyp2d6-cyp3a4-cyp3c9-chemeleon-baseline
- Documentacion de OpenADMET (instalacion): https://docs.openadmet.org/en/latest/installation.html
- Repositorio `openadmet-models`: https://github.com/OpenADMET/openadmet-models
- Demo de entrenamiento de ensembles y active learning: https://demos.openadmet.org/en/latest/demos/04_Ensemble_Model_Training/04_Ensemble_Model_Training_Active_Learning.html
- Imagen Docker: ghcr.io/openadmet/openadmet-models:main
- DOI asociado: https://doi.org/10.57967/hf/7796
- Datos de ejemplo (deck ZINC): https://raw.githubusercontent.com/PatWalters/datafiles/refs/heads/main/zinc_10K.smi
