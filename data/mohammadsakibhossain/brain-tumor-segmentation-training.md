# MohammadSakibHossain/brain-tumor-segmentation-training

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un paquete de artefactos de entrenamiento para segmentación 3D de tumores cerebrales. Lo publica MohammadSakibHossain como respaldo reproducible del proyecto Brain-Tumor-Segmentation-Mlops, e incluye los pesos PyTorch de los mejores checkpoints de tres arquitecturas (SegResNet, Swin UNETR y SegFormer3D), la base de datos de seguimiento de MLflow con todas las ejecuciones, las predicciones sobre el conjunto de test y los registros de entrenamiento.

El problema que resuelve es la reproducibilidad: en lugar de distribuir solo un modelo final, entrega todo el rastro experimental (parámetros, métricas, curvas, registro de modelos con alias `@champion` apuntando a SegResNet) junto con un script de restauración que verifica los checksums SHA-256 de cada fichero. El repositorio ocupa 1,0 GB y se distribuye bajo licencia CC-BY-SA 4.0, la misma del dataset de origen.

Es relevante para equipos de imagen médica que quieran auditar, comparar o extender un pipeline MLOps completo de segmentación volumétrica, y como caso práctico de empaquetado de experimentos con MLflow. No es un modelo generativo: no hay tokenizador, ni contexto, ni pesos en safetensors o GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tres redes de segmentacion 3D: SegResNet, Swin UNETR y SegFormer3D (implementaciones MONAI) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision 3D, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos PyTorch en punto flotante; los ONNX estan en el repo hermano) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | CC-BY-SA 4.0 |
| Formato de pesos | PyTorch (`best.pt` por modelo); predicciones en NIfTI (`.nii.gz`); metadatos en SQLite (MLflow) y JSON |

## Arquitectura y entrenamiento

Se publican checkpoints de tres arquitecturas de segmentacion medica 3D: SegResNet (CNN con bloques residuales y conexiones de salto tipo U-Net), Swin UNETR (transformer jerarquico con ventanas desplazadas combinado con un decoder tipo UNet) y SegFormer3D (transformer jerarquico adaptado a volumenes). El checkpoint seleccionado de cada una es el de mejor Dice de validacion (`checkpoints/<modelo>/best.pt`).

El entrenamiento se realizo sobre Medical Segmentation Decathlon Task01 BrainTumour, con seguimiento completo en MLflow: cada ejecucion de entrenamiento y test queda registrada con parametros y metricas en `mlflow/mlflow.db`, y los ficheros de ejecucion (curvas de entrenamiento, imagenes de validacion de ejemplo, modelos registrados) en `mlflow/mlruns.tar`. El registro de modelos se denomina `brain-tumour-seg` y el alias `@champion` apunta a SegResNet. No se detallan en la informacion disponible el numero de epocas, la funcion de perdida, el esquema de aumentado ni el hardware de entrenamiento.

## Capacidades

- Segmentacion volumetrica 3D de tumores cerebrales a partir de imagenes de resonancia magnetica, generando mapas de etiquetas en formato NIfTI.
- Tres variantes arquitectonicas comparables bajo el mismo pipeline, lo que permite analisis de compromiso entre CNN y transformers.
- Reproduccion completa del entrenamiento: restauracion verificada por checksum (`scripts/backup.py restore`) y navegacion de todas las ejecuciones con `mlflow ui`.
- Predicciones de test ya calculadas para cada modelo en `preds/<modelo>/*.nii.gz`, utiles para comparacion sin reejecutar inferencia.
- Trazabilidad de artefactos: `backup.json` registra origen, fecha y SHA-256 de cada fichero.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues; no es un modelo de lenguaje.

## Casos de uso

- Reproduccion de resultados de investigacion: restaurar el repositorio con el script incluido y comparar las metricas registradas en MLflow con las reportadas en el articulo o memoria del proyecto.
- Auditoria de pipelines MLOps: inspeccionar `mlflow.db` para revisar hiperparametros, metricas por ejecucion y el ciclo de vida del modelo registrado con alias `@champion`.
- Comparativa de arquitecturas de segmentacion: usar los tres checkpoints y las predicciones de test para analizar el comportamiento de SegResNet frente a Swin UNETR y SegFormer3D en el mismo dataset.
- Punto de partida para fine-tuning: cargar `best.pt` con `ml.inference.load_model` y adaptar el modelo a otra modalidad o protocolo de adquisicion.
- Docencia en imagen medica computacional: el paquete permite mostrar un flujo completo desde el dato hasta el modelo registrado, con curvas e imagenes de validacion incluidas.
- Integracion en un servicio de inferencia: exportar los pesos a ONNX usando el repositorio hermano (que ya distribuye modelos ONNX listos para ejecutar) y desplegarlos en un backend de segmentacion.
- Verificacion de integridad en entornos regulados: el esquema de checksums de `backup.json` facilita controles de procedencia de artefactos antes de su uso interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el mejor checkpoint se selecciona por Dice de validacion y que las metricas quedan registradas en MLflow, pero no se incluyen valores numericos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende de la arquitectura concreta y del tamano de volumen de entrada; los tres modelos son 3D y el consumo crece con el volumen de parche.
- GPU recomendadas: no disponible en la informacion proporcionada. Para entrenamiento e inferencia de redes 3D de este tipo se suele requerir GPU dedicada con memoria suficiente para el parche completo.
- Cabe en GPU de consumo: no disponible; no se especifican requisitos minimos.
- Opciones de despliegue: PyTorch con MONAI para los checkpoints `best.pt`; ONNX Runtime para los modelos exportados del repositorio hermano `brain-tumor-segmentation-mlops`; MLflow para servir el modelo registrado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (SegResNet / Swin UNETR / SegFormer3D) | Paquete de entrenamiento con tres checkpoints 3D | no disponible | no aplica | CC-BY-SA 4.0 | Hugging Face, 1,0 GB |
| MohammadSakibHossain/brain-tumor-segmentation-mlops | Modelos ONNX listos para ejecutar y datos de demo | no disponible | no aplica | no disponible en la informacion | Hugging Face (repo hermano) |
| Medical Segmentation Decathlon Task01 BrainTumour | Dataset de origen | no aplica | no aplica | CC-BY-SA 4.0 | Publico (decathlon) |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- No es un dispositivo medico: la model card restringe explicitamente el uso a investigacion y educacion.
- Entrenado unicamente con Medical Segmentation Decathlon Task01 BrainTumour; el rendimiento fuera de esa distribucion (otras secuencias, escaneres o poblaciones) no esta caracterizado.
- Licencia CC-BY-SA 4.0: cualquier obra derivada debe compartirse bajo la misma licencia y con atribucion, lo que condiciona su uso en productos propietarios.
- El repositorio contiene artefactos de entrenamiento, no un paquete de inferencia empaquetado; para uso directo hay que recurrir al repositorio ONNX hermano.
- Riesgo de sobreajuste al protocolo de validacion del autor: la seleccion de checkpoint se hace por Dice de validacion, sin datos externos de test independientes reportados.
- No se documentan sesgos demograficos ni composicion del dataset mas alla del nombre de la tarea, por lo que no puede evaluarse la equidad del modelo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso o validacion por terceros.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/MohammadSakibHossain/brain-tumor-segmentation-training
- Repositorio hermano con modelos ONNX y datos de demo: https://huggingface.co/MohammadSakibHossain/brain-tumor-segmentation-mlops
- Codigo fuente del proyecto: https://github.com/SakibHossain9999/Brain-Tumor-Segmentation-Mlops
- Dataset de origen (Medical Segmentation Decathlon, Task01 BrainTumour): http://medicaldecathlon.com/
