# openadmet/pxr-chemeleon-v1

## Resumen

`openadmet/pxr-chemeleon-v1` es un modelo de predicción de propiedades farmacológicas desarrollado por OpenADMET, una organización centrada en química computacional abierta. No es un modelo de lenguaje: es un modelo de aprendizaje automático supervisado que predice el valor de pEC50 para el receptor PXR (pregnane X receptor, identificado como `CHEMBL3401` en ChEMBL), un endpoint relevante en el cribado de seguridad farmacológica por su relación con inducción enzimática e interacciones medicamentosas.

El modelo parte de los pesos del foundation model químico CheMeleon y añade una cabeza de predicción específica de tarea (una FFN de 3 capas y anchura 1024 con dropout 0,1) entrenada sobre 4.392 compuestos con datos de pEC50 procedentes de ChEMBL37 y del OpenADMET PXR Blind Challenge, estos últimos generados por Octant. Utiliza el featurizador `ChemPropFeaturizer` con normalización del target y se ha entrenado con el framework `openadmet-models` mediante su CLI `anvil`.

Su relevancia actual radica en que amplía el conjunto de modelos abiertos y reutilizables para predicción de ADMET/PXR con datos públicos recientes, y en que se publica bajo licencia Apache 2.0 con un pipeline de inferencia reproducible (CLI y Docker). Es un modelo de uso muy específico, orientado a equipos de descubrimiento de fármacos que necesitan estimar rápidamente la actividad sobre PXR de librerías de compuestos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ChemProp (MPNN) con featurizador `ChemPropFeaturizer` y cabeza FFN de 3 capas, anchura 1024, dropout 0,1; inicializado desde pesos CheMeleon (`from_foundation: chemeleon`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo sobre grafos moleculares, no sobre texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (metadatos del repo; el modelo no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 0,1 GB distribuido vía Git LFS; pesos gestionados por `openadmet-models`) |

## Arquitectura y entrenamiento

El modelo es un ChemProp, es decir, una red neuronal sobre grafos moleculares (message passing) que opera directamente sobre la representación del compuesto (SMILES canonicalizado en la columna `OPENADMET_CANONICAL_SMILES`). Sobre esa base se inicializa desde los pesos del foundation model CheMeleon y se entrena una única tarea de regresión (pEC50) mediante una FFN de 3 capas y anchura 1024 con dropout 0,1. El featurizador es `ChemPropFeaturizer` con normalización del target.

El entrenamiento se realizó con `openadmet-models` a través de `openadmet anvil`, usando un `ShuffleSplitter` con `train_size: 1.0` y semilla aleatoria 42. Es, por tanto, un modelo *no split*: no reserva conjuntos de validación ni de test, y todo el dato disponible (4.392 compuestos) se usa para entrenamiento. Los datos provienen de la agregación de depósitos EC50 de ChEMBL37 en OpenADMET data-catalogs y del OpenADMET PXR Blind Challenge (datos de Octant). El target es la media por compuesto de `pchembl_value` sobre registros EC50 (`pchembl_value_mean`).

## Capacidades

- Predicción de pEC50 para PXR (`CHEMBL3401`) a partir de la estructura molecular de un compuesto (SMILES).
- Inferencia por lotes sobre ficheros CSV mediante la CLI `openadmet predict`, con columnas de salida `OADMET_PRED_chemprop-chembl_pEC50` y `OADMET_STD_chemprop-chembl_pEC50`.
- Soporte de ejecución en CPU o GPU (`--accelerator cpu|gpu`).
- Estimación de incertidumbre únicamente si se ejecuta sobre un ensemble de modelos; en un modelo individual la columna de desviación estándar queda vacía.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es un regresor químico de tarea única.
- Capacidad multilingüe: no aplica; el modelo no procesa lenguaje natural.

## Casos de uso

- Cribado virtual de librerías químicas frente a PXR: pasar un CSV de SMILES (por ejemplo, un deck de ZINC) por `openadmet predict` para obtener pEC50 estimado y priorizar compuestos antes de ensayos experimentales.
- Evaluación temprana de riesgo de inducción enzimática: usar la predicción de actividad PXR como señal de alarma en el perfilado ADMET de series químicas durante el descubrimiento.
- Filtrado de compuestos en pipelines de química medicinal: integrar el modelo como paso de scoring en flujos automatizados que descartan candidatos con alta probabilidad de interacción con PXR.
- Priorización en programas de optimización de leads: comparar predicciones entre análogos para guiar la selección de la siguiente ronda de síntesis.
- Análisis retrospectivo de datos internos: puntuar compuestos ya sintetizados y contrastar con resultados experimentales para calibrar la confianza en el modelo.
- Enseñanza y reproducción metodológica: servir como ejemplo reproducible de entrenamiento de un modelo ChemProp con foundation model CheMeleon usando `openadmet-models` y `anvil`, con entorno Docker incluido.
- Uso en ensembles: combinar varias instancias del modelo para obtener estimaciones de incertidumbre (columnas `OADMET_STD`) y filtrar predicciones poco fiables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de validación ni de test, coherente con el hecho de que el modelo se entrenó sin split (`train_size: 1.0`), por lo que no existe conjunto de evaluación reservado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB, lo que sugiere un modelo pequeño que probablemente quepa en cualquier GPU consumer, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible. La documentación ofrece entorno CUDA (`openadmet-models-gpu.yaml`) y ejecución con `--runtime=nvidia --gpus all`, pero no especifica modelos de GPU concretos.
- Ejecución en CPU: soportada explícitamente (`--accelerator cpu` y contenedor Docker sin GPU); el ejemplo de la model card se ejecuta en CPU.
- Opciones de despliegue: CLI `openadmet predict` del paquete `openadmet-models` (instalación vía conda + pip desde GitHub) o contenedor Docker `ghcr.io/openadmet/openadmet-models:main`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de otros modelos comparables (parámetros, contexto, rendimiento o licencia) para establecer una comparativa rigurosa. El propio ecosistema OpenADMET publica otros modelos de endpoints ADMET (por ejemplo, el modelo de aclaramiento microsomal mencionado en los resultados de búsqueda), pero no se aportan sus especificaciones. Comparativa: no disponible.

## Limitaciones y advertencias

- Modelo entrenado sin split de validación ni test (`train_size: 1.0`): no hay métricas held-out publicadas, por lo que el rendimiento real sobre compuestos nuevos es desconocido.
- El propio autor advierte de que, pese a la curación de datos, el rendimiento puede mejorar y recomienda proceder con cautela.
- Entrenado sobre 4.392 compuestos: cobertura química limitada; puede generalizar mal fuera del espacio químico representado en ChEMBL37 y en los datos del Blind Challenge.
- La incertidumbre no se estima con un modelo individual; requiere ensembles, lo que añade coste computacional y complejidad operativa.
- Riesgo de sesgo derivado de los datos de origen (ChEMBL y datos de Octant): posibles sesgos de selección hacia series químicas sobrerrepresentadas.
- No es un modelo de lenguaje: no debe usarse para generación de texto, razonamiento, código ni tareas conversacionales.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene revisar las condiciones de los datos de origen (ChEMBL y Zenodo/Octant) para su redistribución.
- Para producción, requiere instalar `openadmet-models`, `git lfs` y gestionar los pesos vía Git LFS o Docker; no hay integración nativa con servidores de inferencia estándar de LLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openadmet/pxr-chemeleon-v1
- README del modelo: https://huggingface.co/openadmet/pxr-chemeleon-v1/blob/main/README.md
- Repositorio `openadmet-models`: https://github.com/OpenADMET/openadmet-models
- Documentación de OpenADMET: https://docs.openadmet.org/en/latest/
- Demos de OpenADMET (incluye ensemble y active learning): https://demos.openadmet.org/en/latest/
- Demo de entrenamiento de ensembles: https://demos.openadmet.org/en/latest/demos/04_Ensemble_Model_Training/04_Ensemble_Model_Training_Active_Learning.html
- Data catalogs de OpenADMET: https://github.com/OpenADMET/data-catalogs
- Datos del OpenADMET PXR Blind Challenge: https://doi.org/10.57967/hf/9731
- Ensayo PXR de Octant: https://doi.org/10.5281/zenodo.21785013
- Contenedor Docker: ghcr.io/openadmet/openadmet-models:main
- Fichero de ejemplo para inferencia (ZINC 10K): https://raw.githubusercontent.com/PatWalters/datafiles/refs/heads/main/zinc_10K.smi
