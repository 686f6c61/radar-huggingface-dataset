# Prash2410/cancerclassification_customcnn

## Resumen

Este modelo es un clasificador de imágenes histopatológicas de cáncer de pulmón desarrollado por Prash2410 (Prasmit Ingole). Implementa una red neuronal convolucional residual personalizada (ResCNN) en PyTorch que distingue entre tejido pulmonar sano y dos subtipos principales de cáncer de pulmón: adenocarcinoma y carcinoma de células escamosas. El proyecto busca establecer una línea base ligera pero efectiva para el diagnóstico asistido por ordenador a partir de datos histopatológicos.

La arquitectura sigue un diseño inspirado en ResNet, con cinco etapas residuales que progresivamente aumentan los canales de 3 a 128, conexiones de salto (skip connections) y proyecciones con convoluciones 1×1 cuando cambian las dimensiones. El modelo fue entrenado durante 20 épocas con el optimizador Adam y una tasa de aprendizaje inicial de 1e-4, alcanzando una precisión de validación máxima del 96,46% en la época 12 y una precisión global de clasificación del 95%. Está publicado bajo licencia MIT.

La relevancia de este modelo radica en su enfoque en un problema médico de alto impacto con una arquitectura ligera y reproducible, lo que lo hace accesible para entornos con recursos computacionales limitados. Aunque el repositorio no proporciona detalles sobre el tamaño del dataset ni el número exacto de parámetros, los resultados declarados indican un rendimiento sólido en la tarea de clasificación propuesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional residual (ResCNN) personalizada, inspirada en ResNet |
| Parametros totales | no disponible (arquitectura ligera, canales max. 128) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision por imagenes) |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch nativo) |
| Idiomas soportados | no aplica (modelo de clasificacion de imagenes) |
| Licencia | MIT |
| Formato de pesos | PyTorch (archivos .pt / .pth, safetensors no confirmado) |

## Arquitectura y entrenamiento

La arquitectura consta de cinco bloques residuales que transforman la imagen de entrada a traves de un progresivo aumento de canales: 3 → 8 → 16 → 32 → 64 → 128. Cada bloque residual aplica convoluciones con normalizacion por lotes (BatchNorm) y utiliza conexiones de salto para facilitar el flujo de gradientes. Cuando cambian las dimensiones de los canales, se emplean proyecciones con convoluciones 1×1 y BatchNorm. Tras las etapas convolucionales, un pooling adaptativo global reduce la representacion a 1×1, seguido de un clasificador totalmente conectado con tres capas lineales (128 → 256 → 128 → 3), normalizacion por lotes, ReLU y dropout del 20% para regularizacion.

El entrenamiento se realizo con PyTorch, utilizando el optimizador Adam con una tasa de aprendizaje inicial de 1e-4 y un scheduler ReduceLROnPlateau que reduce la tasa progresivamente (1e-4 → 5e-5 → 2.5e-5 → 1.25e-5 → 6.3e-6 → 3.1e-6). La funcion de perdida fue CrossEntropyLoss y el modelo se entreno durante 20 épocas. El preprocesamiento incluyo normalizacion de imagenes mediante transforms de PyTorch y DataLoaders para procesamiento por lotes. No se menciona el uso de tecnicas de RLHF, DPO ni data augmentation adicional.

## Capacidades

- Clasificacion de imagenes histopatologicas de tejido pulmonar en tres categorias: tejido normal (lung_n), adenocarcinoma (lung_aca) y carcinoma de celulas escamosas (lung_scc).
- Extraccion de caracteristicas jerarquicas mediante aprendizaje residual, lo que mejora la estabilidad del entrenamiento y la propagacion de gradientes.
- Inferencia ligera y rapida, adecuada para entornos con recursos computacionales limitados.
- Capacidad de generalizacion moderada, con precision de validacion del 96,46% y F1 macro de 0,95 en el conjunto de test declarado por el autor.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales mas alla de la clasificacion de imagenes.

## Casos de uso

- Diagnostico asistido por ordenador en patologia: el modelo puede servir como herramienta de apoyo para patologos, clasificando rapidamente imagenes histopatologicas de pulmon y priorizando casos sospechosos para revision manual.
- Triaje de muestras en laboratorios clinicos: integrado en un pipeline de procesamiento de imagenes, puede filtrar muestras normales y derivar solo las anomalas a especialistas, reduciendo la carga de trabajo.
- Formacion y educacion medica: utilizado como recurso didactico para estudiantes de medicina y patologia, mostrando diferencias morfologicas entre tejido sano, adenocarcinoma y carcinoma escamoso.
- Investigacion biomedica: como linea base reproducible en estudios comparativos de clasificacion de cancer de pulmon, permitiendo evaluar nuevas arquitecturas o tecnicas de aumento de datos.
- Sistemas de segunda opinion en telemedicina: desplegado en entornos remotos donde no hay patologos disponibles, proporciona una clasificacion preliminar que puede ser revisada por un especialista de forma asincrona.
- Validacion de modelos en entornos academicos: el codigo y la arquitectura estan disponibles en GitHub, lo que permite a investigadores replicar los resultados y adaptar el modelo a otros tipos de cancer mediante transferencia de aprendizaje.

## Benchmarks y rendimiento

Los resultados que se presentan a continuacion provienen del model-index declarado por el autor en la model card de HuggingFace. No han sido verificados de forma independiente.

| Benchmark | Dataset | Metrica | Valor |
|---|---|---|---|
| Lung Cancer Classification ResCNN | Lung Histopathology Dataset (test) | Accuracy | 0,96 |
| Lung Cancer Classification ResCNN | Lung Histopathology Dataset (test) | F1 Score | 0,95 |

Adicionalmente, en la seccion de resultados de la model card se reportan:

| Metrica | Valor |
|---|---|
| Precision de validacion maxima | 96,46% |
| Mejor perdida de validacion | 0,1268 |
| Mejor epoca | 12 |
| Precision global de clasificacion | 95,00% |
| F1 macro | 0,95 |
| F1 ponderado | 0,95 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB, dado el tamano reducido de la arquitectura (canales max. 128 y capas totalmente conectadas pequenas).
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM, incluyendo NVIDIA GTX 1050 Ti, RTX 2060, RTX 3060, o incluso inferencia en CPU para lotes pequenos.
- Compatibilidad con GPU de consumo: si, el modelo cabe en cualquier GPU consumer actual sin problemas.
- Opciones de despliegue: PyTorch nativo, TorchScript, ONNX Runtime, o frameworks de servicio como FastAPI con carga de pesos en memoria.
- Latencia estimada: del orden de milisegundos por imagen en GPU y decenas de milisegundos en CPU, aunque no se proporcionan mediciones oficiales.
- Throughput: no disponible, pero dada la arquitectura ligera, se espera un alto rendimiento en procesamiento por lotes.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa rigurosa con modelos alternativos de clasificacion de cancer de pulmon. El autor no ha publicado comparaciones con arquitecturas como ResNet-18, VGG16 o modelos especificos de histopatologia (p. ej., los basados en ImageNet con fine-tuning). Los datos de rendimiento declarados (accuracy 96%, F1 0,95) son comparables a los reportados en la literatura para tareas similares, pero sin una evaluacion estandarizada no es posible establecer una comparacion fiable.

## Limitaciones y advertencias

- Los resultados de rendimiento estan declarados por el autor y no han sido verificados de forma independiente; la precision del 96% debe interpretarse con cautela.
- El dataset utilizado no esta descrito en detalle (numero de imagenes, distribucion de clases, procedencia), lo que limita la evaluacion de posibles sesgos.
- No se proporcionan curvas ROC, matrices de confusion ni analisis por clase, por lo que se desconoce el rendimiento especifico en cada categoria.
- El modelo no ha sido validado clinicamente; su uso en diagnostico real requiere supervision de profesionales sanitarios y validacion en entornos clinicos.
- La arquitectura es relativamente simple y podria no generalizar bien a imagenes de otros dominios o con variaciones de tincion, iluminacion o resolucion.
- No se menciona el uso de data augmentation, lo que podria limitar la robustez frente a variaciones en las imagenes de entrada.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias sobre la precision o idoneidad del modelo para aplicaciones medicas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Prash2410/cancerclassification_customcnn
- Repositorio en GitHub: https://github.com/prasmit2410/Lung-Cancer-Classification-using-a-Custom-Residual-CNN-PyTorch-
- Perfil del autor en HuggingFace: https://huggingface.co/Prash2410
- Modelo alternativo del mismo autor: https://huggingface.co/Prash2410/customresidualcnn_lungcancerclassification
- Publicacion relacionada en ResearchGate: https://www.researchgate.net/publication/391631967_High-Precision_Lung_Cancer_Classification_with_Custom_CNN_Evaluation_and_Transfer_Learning_for_Broader_Cancer_Types
