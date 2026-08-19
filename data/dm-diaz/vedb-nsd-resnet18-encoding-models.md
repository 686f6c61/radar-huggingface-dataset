# DM-Diaz/VEDB-NSD-ResNet18-Encoding-Models

## Resumen

Este repositorio contiene los ajustes de modelos de codificación voxelwise (encoding models) para datos de fMRI del Natural Scenes Dataset (NSD), desarrollados por Diaz y Henderson en el marco del estudio *Eccentricity-Constrained CNN Training Reveals Adaptive Information Coding Around the Visual Field* (CCN 2026). Los modelos se basan en representaciones extraídas de cuatro variantes de un ResNet-18 preentrenado con SimCLR sobre imágenes egocéntricas naturales del Visual Experience Dataset (VEDB), con restricciones de campo visual distintas: baseline, fovea-gaze, periferia (periph) y periferia con transformación NeuroFovea (periph-NF).

El objetivo de estos modelos es predecir la respuesta de voxels individuales de la corteza visual humana a partir de las características visuales de las imágenes, permitiendo estudiar cómo la información visual se codifica de forma adaptativa en torno al campo visual. Cada archivo `.npy` contiene los pesos de regresión ridge ajustados por sujeto (S1–S8), junto con métricas de validación como R² y correlación. El repositorio es de interés para investigadores en neurociencia visual computacional que trabajen con datos de fMRI y modelos de codificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion ridge voxelwise sobre características de ResNet-18 (SimCLR) |
| Parametros totales | no disponible (pesos de regresion por voxel, no una red neuronal unica) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica (modelo no secuencial) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no aplica |
| Licencia | Apache 2.0 |
| Formato de pesos | .npy (NumPy) |

## Arquitectura y entrenamiento

El modelo no es una red neuronal generativa, sino un conjunto de ajustes de regresión lineal regularizada (ridge) que mapean características visuales a respuestas fMRI voxelwise. Las características se extraen de las capas `conv1`, `layer1.1`, `layer2.1`, `layer3.1`, `layer4.1` y `avgpool` de un ResNet-18 preentrenado con SimCLR sobre el Visual Experience Dataset (VEDB), un dataset de vídeo egocéntrico con seguimiento ocular sincronizado. Los autores entrenaron cuatro variantes del encoder con restricciones de excentricidad (campo completo, solo fóvea centrada en la mirada, solo periferia, y periferia con transformación NeuroFovea). Las características de cada capa se reducen con PCA, se concatenan y se usan para ajustar un modelo ridge por sujeto y condición. El entrenamiento de los encoding models se realizó sobre las respuestas fMRI del Natural Scenes Dataset (NSD), con validación en datos reservados.

## Capacidades

- Prediccion de respuestas fMRI voxelwise a estimulos visuales naturales.
- Comparacion de la alineacion entre representaciones de redes neuronales y la corteza visual humana.
- Evaluacion de como la restriccion de excentricidad en el entrenamiento del encoder afecta a la codificacion cortical.
- Los archivos incluyen pesos, R², correlacion, lambdas optimas, mascaras de voxels y techos de ruido, lo que permite reutilizar los ajustes para analisis posteriores.
- Soporte para multiples sujetos (S1–S8) y cuatro condiciones visuales.
- No incluye capacidades de generacion de texto, vision o lenguaje.

## Casos de uso

- Investigacion en neurociencia visual: estudiar como la corteza visual humana codifica informacion en funcion de la excentricidad retiniana, comparando las predicciones de los modelos con datos fMRI reales.
- Validacion de representaciones de redes neuronales: utilizar los encoding models como metricas de alineacion entre features de CNNs y actividad cerebral.
- Analisis de diferencias individuales: examinar como los patrones de codificacion varian entre sujetos (S1–S8) y condiciones visuales.
- Desarrollo de modelos de codificacion para neuroimagen: los ajustes proporcionan una referencia para comparar nuevos encoders o tecnicas de regularizacion.
- Exploracion de la hipotesis de codificacion adaptativa: los resultados del estudio pueden servir como base para experimentos de seguimiento sobre plasticidad cortical o procesamiento periferico.
- Reproducibilidad y extension: los archivos permiten a otros investigadores reutilizar los pesos para analisis de conectividad funcional o decodificacion sin necesidad de reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) en la informacion disponible, ya que se trata de un modelo de neurociencia y no de procesamiento de lenguaje o vision generica. Las metricas de rendimiento reportadas son R² y correlacion por voxel y sujeto, disponibles en los archivos `.npy`, pero no se incluyen valores agregados en la documentacion publica.

## Requisitos de hardware

- Los archivos de pesos son de tamano moderado (5.9 GB en total para los 32 archivos, aproximadamente 180 MB por sujeto y condicion).
- No se requiere GPU para cargar los pesos; basta con numpy y memoria RAM suficiente (se recomienda al menos 8 GB para manipular los diccionarios).
- Para extraer características de nuevas imagenes con el ResNet-18 subyacente, se necesita una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060 o superior) si se usan lotes grandes, aunque tambien es posible en CPU con menor rendimiento.
- No se dispone de datos de latencia o throughput, ya que el uso tipico es offline (analisis de datos fMRI).

## Comparativa con modelos similares

No hay una comparativa directa disponible en la informacion proporcionada. Otros encoding models voxelwise para NSD existen (por ejemplo, los basados en AlexNet o VGG), pero no se citan en la documentacion. El modelo se distingue por el uso de un encoder preentrenado con SimCLR y restricciones de excentricidad, lo que lo hace unico en su categoria.

## Limitaciones y advertencias

- Los encoding models estan ajustados exclusivamente a los sujetos y estimulos del NSD; su generalizacion a otros datasets o poblaciones no esta garantizada.
- Las imagenes VEDB no se redistribuyen en este repositorio; deben obtenerse por separado a traves de Databrary (volumen 1612).
- El codigo de extraccion de caracteristicas y ajuste de modelos no esta aun disponible publicamente (se indica como "forthcoming"), lo que limita la reproducibilidad inmediata.
- Los archivos `.npy` contienen diccionarios de Python, por lo que requieren numpy y un entorno compatible; no son pesos de red neuronal directamente utilizables en frameworks como PyTorch o TensorFlow.
- La licencia Apache 2.0 permite uso comercial, pero los datos subyacentes (NSD, VEDB) tienen sus propias restricciones de uso que deben respetarse.
- No se proporcionan datos sobre sesgos o alucinaciones, al no ser un modelo generativo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/DM-Diaz/VEDB-NSD-ResNet18-Encoding-Models
- Coleccion de modelos VEDB SimCLR: https://hf.co/collections/DM-Diaz/eccentricity-constrained-simclr-models-vedb
- Modelo Baseline: https://huggingface.co/DM-Diaz/VEDB-SimCLR-ResNet18-Baseline
- Modelo Fovea-Gaze: https://huggingface.co/DM-Diaz/VEDB-SimCLR-ResNet18-Fovea-Gaze
- Modelo Periph: https://huggingface.co/DM-Diaz/VEDB-SimCLR-ResNet18-Periph
- Modelo Periph-NF: https://huggingface.co/DM-Diaz/VEDB-SimCLR-ResNet18-Periph-NF
- Paper VEDB (Greene et al., 2024): https://jov.arvojournals.org/article.aspx?articleid=2802101
- Databrary (volumen VEDB): https://www.databrary.org/volume/1612
- Repositorio NeuroFovea: https://github.com/ArturoDeza/NeuroFovea
- Video presentacion CCN 2026: https://www.youtube.com/watch?v=Lb4S3FWqd2M&t=2545s
- Preprint arXiv: `2607.19316` (no se proporciona URL directa)
