# openadmet/lxr-tabpfn-monroe-v1

## Resumen

`openadmet/lxr-tabpfn-monroe-v1` es un modelo predictivo de quimioinformática desarrollado por OpenADMET para estimar la actividad biológica de compuestos sobre el receptor nuclear LXR alpha (Liver X Receptor alpha, identificador ChEMBL2808). No es un modelo de lenguaje: es un regresor tabular construido sobre TabPFN v2 que predice el valor pEC50 (potencia) de moléculas a partir de embeddings de un modelo fundacional químico llamado Monroe, reducidos a 720 características numéricas.

El modelo combina dos piezas: un featurizador (`MonroeFeaturizer`) que transforma estructuras moleculares en vectores densos, y un `TabPFNRegressorModel` que actúa como cabecera de regresión sobre esos vectores. Se entrenó sobre datos agregados de EC50 de ChEMBL37 depositados en el catálogo de datos de OpenADMET, con una partición por scaffolds de Bemis-Murcko (semilla 42) para evitar fuga de información entre conjuntos de entrenamiento y test.

Su relevancia práctica es acotada pero concreta: ofrece un pipeline reproducible y empaquetado (vía `openadmet-models` y `openadmet anvil`) para priorizar compuestos en cribados virtuales tempranos sobre una diana terapéutica específica, sin necesidad de entrenar un modelo desde cero. El repositorio ocupa 0,2 GB y la licencia Apache 2.0 permite uso comercial. No se han publicado métricas de rendimiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresor tabular TabPFN v2 sobre embeddings de Monroe (720 características) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (metadatos del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio Git LFS, 0,2 GB) |

## Arquitectura y entrenamiento

El modelo es un pipeline de dos etapas. Primero, un featurizador basado en Monroe convierte cada compuesto (entrada típica en SMILES canónico) en un vector de 720 dimensiones. Segundo, un `TabPFNRegressorModel` con pesos de TabPFN v2 realiza la regresión sobre esas características. Dado que TabPFN fue preentrenado con un límite de 500 características, la configuración activa `ignore_pretraining_limits: true` para operar con las 720 dimensiones de Monroe.

El objetivo de entrenamiento es `pchembl_value_mean`, la media por compuesto de los valores pchembl de los registros EC50 de ChEMBL37 para LXR. La partición de datos usa `ClusterSplitter` con scaffolds de Bemis-Murcko y semilla aleatoria 42, lo que agrupa compuestos por esqueleto molecular y reduce el optimismo en la evaluación. El entrenamiento se realizó con el commit `102d3fa` de `openadmet-models` a través de la herramienta `openadmet anvil`. No se detalla en la información disponible el número de compuestos de entrenamiento, la composición exacta del dataset ni si hubo ajuste fino del featurizador Monroe.

## Capacidades

- Predicción de pEC50 para LXR alpha (ChEMBL2808) a partir de estructuras moleculares.
- Featurización automática de compuestos mediante embeddings Monroe de 720 dimensiones.
- Inferencia por lotes desde un CSV de entrada con columna de SMILES (por defecto `OPENADMET_CANONICAL_SMILES`).
- Salida en CSV con columnas `OADMET_PRED_*` (predicción) y `OADMET_STD_*` (desviación estándar, vacía salvo que se entrene un ensemble).
- Ejecución en CPU o GPU mediante el flag `--accelerator`.
- Despliegue reproducible vía entorno conda o contenedor Docker (`ghcr.io/openadmet/openadmet-models:main`).
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un regresor numérico especializado.

## Casos de uso

- Cribado virtual temprano sobre LXR alpha: dado un fichero de miles de SMILES (por ejemplo, un deck de ZINC), el modelo genera predicciones de pEC50 en una sola pasada para priorizar compuestos antes de síntesis o ensayo.
- Priorización de librerías comerciales: filtrar catálogos de proveedores por potencia predicha sobre LXR, reduciendo el número de compuestos que pasan a validación experimental.
- Enriquecimiento de pipelines de diseño molecular: integrar las predicciones como señal adicional en bucles de generación de moléculas, descartando candidatos con pEC50 predicho bajo.
- Análisis de relación estructura-actividad exploratorio: comparar predicciones entre análogos para identificar regiones del esqueleto asociadas a mayor potencia, usando la partición por scaffolds como referencia metodológica.
- Reproducibilidad de experimentos: servir como línea base congelada (commit y semilla documentados) frente a la que comparar modelos propios entrenados con otros featurizadores.
- Despliegue interno en contenedor: ejecutar el modelo en un servicio Docker CPU-only dentro de una infraestructura de química computacional sin GPU dedicada.
- Docencia y prototipado: ejemplo completo de pipeline OpenADMET (featurización, entrenamiento, inferencia) para equipos que quieran adoptar el framework.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio pesa 0,2 GB y TabPFN v2 es un transformer pequeño, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con soporte CUDA; no se especifican modelos concretos. El ejemplo oficial funciona en CPU.
- GPU de consumo: sí, previsiblemente cualquier RTX con suficiente memoria para cargar los pesos (muy por debajo de 8 GB), aunque el dato exacto no está publicado.
- Despliegue: entorno conda `openadmet-models` (CPU o GPU vía `openadmet-models-gpu.yaml`), contenedor Docker `ghcr.io/openadmet/openadmet-models:main`, o la CLI `openadmet predict`.
- Latencia y throughput: no disponibles. El coste dominante es la featurización Monroe por compuesto; TabPFN añade un coste de inferencia por lote.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lxr-tabpfn-monroe-v1 | TabPFN v2 + Monroe | SMILES | pEC50 LXR | Apache 2.0 | Hugging Face |
| Modelos ADMET de OpenADMET (otros endpoints) | TabPFN / otros | SMILES | endpoints ADMET | Apache 2.0 (según repo) | Hugging Face (OpenADMET) |
| Chemprop (D-MPNN) | GNN supervisado | Grafo molecular | propiedad escalar | MIT | GitHub (requiere entrenamiento propio) |
| Modelos fundacionales químicos (p. ej. Monroe) | Transformer químico | SMILES | embeddings | según modelo | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Específico de una única diana (LXR alpha) y un único endpoint (pEC50 derivado de EC50); no es transferible a otras dianas sin reentrenamiento.
- Las predicciones son medias de registros ChEMBL heterogéneos; la calidad depende de la consistencia de los ensayos de origen.
- La columna de desviación estándar queda vacía salvo que se entrene un ensemble, por lo que no hay incertidumbre calibrada por defecto.
- Se activa `ignore_pretraining_limits` para superar el límite de 500 características de TabPFN v2; el comportamiento fuera de ese régimen no está validado de forma independiente en la información disponible.
- Riesgo de extrapolación fuera del espacio químico cubierto por ChEMBL37; compuestos muy distintos a los scaffolds de entrenamiento pueden recibir predicciones poco fiables.
- No se han publicado métricas (R², RMSE, MAE) en la información disponible, lo que impide evaluar su precisión frente a alternativas.
- Idioma de documentación y metadatos en inglés; no aplica soporte multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las obligaciones de atribución y las licencias de las dependencias (TabPFN, Monroe, ChEMBL).
- Requiere `git lfs` para descargar los pesos y el framework `openadmet-models` para un uso completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openadmet/lxr-tabpfn-monroe-v1
- Repositorio openadmet-models: https://github.com/OpenADMET/openadmet-models
- Catálogo de datos OpenADMET: https://github.com/OpenADMET/data-catalogs
- Documentación de instalación: https://docs.openadmet.org/en/latest/installation.html
- Demo de entrenamiento de ensembles: https://demos.openadmet.org/en/latest/demos/04_Ensemble_Model_Training/04_Ensemble_Model_Training_Active_Learning.html
- Contenedor Docker: https://ghcr.io/openadmet/openadmet-models
- Fichero de ejemplo ZINC 10K: https://raw.githubusercontent.com/PatWalters/datafiles/refs/heads/main/zinc_10K.smi
