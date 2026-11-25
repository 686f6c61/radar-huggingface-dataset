# openadmet/pxr-chemeleon-baseline

## Resumen

`openadmet/pxr-chemeleon-baseline` es un modelo de prediccion de propiedades moleculares desarrollado por OpenADMET, un proyecto abierto centrado en herramientas de ADMET (absorcion, distribucion, metabolismo, excrecion y toxicidad) para descubrimiento de farmacos. Concretamente, es un modelo de tarea unica ("single task CheMeleon") entrenado para predecir valores de pEC50 frente al receptor PXR (Pregnane X Receptor), un target nuclear relevante en estudios de induccion enzimatica y toxicidad hepatica.

El modelo se ha entrenado sobre datos de pEC50 curados a partir de ChEMBL para PXR. Segun la propia model card, se trata de un modelo *baseline* con un split nulo: no se ha reservado conjunto de validacion ni de test, y el entrenamiento se ha realizado unicamente con el conjunto de entrenamiento. El autor advierte explicitamente de que el rendimiento es "bastante pobre" y recomienda precaucion en su uso.

Es relevante ahora porque forma parte del ecosistema OpenADMET (framework Anvil y paquete `openadmet-models`), que estandariza el entrenamiento e inferencia de modelos quimicos. Su tamano de repositorio es de 0,1 GB y la licencia es Apache 2.0, lo que facilita su reutilizacion y auditoria en pipelines de quimioinformatica. No es un modelo de lenguaje generativo, sino un regresor supervisado sobre representaciones moleculares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo quimico de regresion, ecosistema Anvil/OpenADMET; se infiere Chemprop por el nombre de las columnas de salida, no confirmado en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; entrada basada en moleculas/SMILES) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (segun metadatos; el modelo opera sobre SMILES, no sobre texto libre) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (repo de 0,1 GB con ficheros gestionados por git lfs; formato concreto no especificado) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna. Se describe como un modelo "single task CheMeleon" entrenado para predecir pEC50 sobre PXR, con datos curados de ChEMBL. Las columnas de salida (`OADMET_PRED_chemprop-chembl_pchembl_value_mean` y `OADMET_STD_chemprop-chembl_pchembl_value_mean`) sugieren el uso de Chemprop, una familia de redes neuronales sobre grafos moleculares (MPNN), aunque la model card no lo confirma explicitamente.

El entrenamiento se realizo sin split: no se asignaron datos a validacion ni a test, y el conjunto de entrenamiento se uso al completo. No se menciona el numero de tokens, la composicion del dataset, ni el uso de RLHF/DPO (no aplicable en este tipo de modelo). Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal, dado que no es un transformer generativo. La incertidumbre no esta disponible por defecto: las columnas `OADMET_STD` quedan vacias salvo que se entrene un ensemble, segun los docs de OpenADMET.

## Capacidades

- Prediccion de pEC50 frente a PXR a partir de estructuras moleculares (SMILES).
- Inferencia por lotes sobre ficheros CSV mediante el comando `openadmet predict`.
- Integracion con el framework Anvil de `openadmet-models`.
- Ejecucion en CPU o GPU (aceleracion CUDA opcional).
- Empaquetado en Docker (`ghcr.io/openadmet/openadmet-models:main`) para entornos reproducibles.
- Soporte de entrenamiento de ensembles para estimar incertidumbre (fuera del modelo base).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales (vision, audio).

## Casos de uso

- Filtrado temprano de compuestos en descubrimiento de farmacos: el modelo predice pEC50 frente a PXR para descartar candidatos con alta probabilidad de activacion del receptor, reduciendo costes experimentales en fases iniciales.
- Priorizacion de librerias quimicas: dado un deck de SMILES (por ejemplo, subconjuntos de ZINC), se pueden ordenar los compuestos por pEC50 predicho para seleccionar los mas prometedores para ensayos in vitro.
- Evaluacion de riesgo de induccion enzimatica: PXR es un marcador relevante de induccion de CYP3A4; el modelo sirve como senal preliminar en estudios de DDI (interacciones farmaco-farmaco).
- Integracion en pipelines de quimioinformatica: mediante `openadmet predict` y el formato CSV de salida, se puede encadenar con herramientas de docking, QSAR o analisis ADMET.
- Reproducibilidad en investigacion: al ser un baseline con licencia Apache 2.0 y entorno Docker, es util como punto de partida para comparar modelos o para auditar metodologias.
- Formacion y prototipado: sirve como ejemplo didactico de como entrenar e inferir con el ecosistema OpenADMET (comandos, estructura de directorios `anvil_training/`, columnas de salida).
- Generacion de datasets anotados: las predicciones pueden usarse como pseudo-etiquetas para preentrenar o aumentar datos en modelos posteriores, siempre con cautela por el bajo rendimiento declarado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explicitamente de que el rendimiento es "bastante pobre" y que no se ha reservado conjunto de validacion ni de test, por lo que no existen metricas de generalizacion reportadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo es pequeno (repo de 0,1 GB) y probablemente cabe en GPUs de gama baja, pero no se especifica.
- GPU recomendadas: no disponible; la model card recomienda usar GPU (`--accelerator gpu`) pero no indica modelos concretos.
- Compatibilidad con consumer GPU: probable por el tamano del repo, pero no confirmado.
- Opciones de despliegue: `openadmet-models` (CLI `openadmet predict`), entorno Conda (`openadmet-models.yaml` o `openadmet-models-gpu.yaml`) y Docker (`ghcr.io/openadmet/openadmet-models:main`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (regresores de pEC50 para PXR u otros targets ADMET) con los que establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Rendimiento declarado como "bastante pobre" por el propio autor; no apto para decisiones criticas sin validacion experimental.
- Ausencia de split de validacion/test: no hay garantia de generalizacion y no se pueden reportar metricas de test fiables.
- Incertidumbre no estimada por defecto: las columnas `OADMET_STD` quedan vacias salvo que se entrene un ensemble.
- Sesgos potenciales derivados del dataset ChEMBL: cobertura desigual de quimiotipos, posibles sesgos de publicacion y sesgos hacia compuestos ya estudiados.
- Riesgo de extrapolacion: predicciones poco fiables sobre quimiotipos fuera de la distribucion de entrenamiento.
- Idioma: metadatos en ingles; el modelo opera sobre SMILES, no sobre lenguaje natural.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias y recomienda precaucion.
- Requiere `git lfs` para descargar los pesos y el framework `openadmet-models` para un uso completo.
- No es un modelo generativo: no soporta texto, codigo, vision ni agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openadmet/pxr-chemeleon-baseline
- Documentacion de OpenADMET: https://docs.openadmet.org/en/latest/installation.html
- Repositorio `openadmet-models`: https://github.com/OpenADMET/openadmet-models
- Demos de OpenADMET (ensemble y active learning): https://demos.openadmet.org/en/latest/demos/04_Ensemble_Model_Training/04_Ensemble_Model_Training_Active_Learning.html
- Imagen Docker: ghcr.io/openadmet/openadmet-models:main
- DOI asociado: 10.57967/hf/7795
- Datos de ejemplo (ZINC 10K): https://raw.githubusercontent.com/PatWalters/datafiles/refs/heads/main/zinc_10K.smi
