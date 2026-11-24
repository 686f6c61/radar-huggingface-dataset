# Peiker/food11-course-project

## Resumen

Food-11 course project es un archivo de experimentos academicos publicado en Hugging Face por el usuario Peiker. No se trata de un modelo fundacional ni de un modelo publicado con pesos listos para usar en produccion, sino de un paquete de artefactos de un trabajo de curso sobre clasificacion de imagenes de comida en 11 clases. El repositorio contiene 34 configuraciones de clasificadores, preprocesadores, checkpoints de ResNet-18 y los pesos originales preentrenados en ImageNet, todo empaquetado en un ZIP de aproximadamente 1,46 GB.

El modelo subyacente es ResNet-18, una CNN residual de 18 capas con unos 11,7 millones de parametros, inicializada con pesos `ResNet18_Weights.IMAGENET1K_V1` de torchvision y afinada sobre el dataset Food-11. El proyecto compara tres representaciones tradicionales (color histogram y LBP) con KNN, SVM y random forest, frente a caracteristicas congeladas de ResNet-18 y frente a fine-tuning completo de la red. Los resultados reportados alcanzan un 92,37% de accuracy y 92,83% de Macro-F1 en test con fine-tuning, promediando tres semillas.

Su relevancia es limitada fuera del ambito docente: no es un modelo para evaluar como alternativa a clasificadores modernos, sino un ejemplo reproducible de metodologia experimental (baselines clasicos, ablaciones, control de semillas y evaluacion con perturbaciones). La model card esta en chino e ingles, y el autor declara que la implementacion y verificacion contaron con asistencia de un agente de IA bajo autorizacion de los miembros del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (CNN residual, torchvision) |
| Parametros totales | no disponible en la model card (ResNet-18 estandar: aproximadamente 11,7 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | zh, en (etiquetas del repositorio; el modelo no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | checkpoints `.pt` de PyTorch y modelos `.joblib` de scikit-learn, distribuidos dentro de `Food11_Models.zip` |

## Arquitectura y entrenamiento

La arquitectura es ResNet-18, una red convolucional residual con conexiones de identidad, usada aqui como extractor de caracteristicas y como clasificador afinado. El entrenamiento parte de los pesos `IMAGENET1K_V1` de torchvision, por lo que incorpora preentrenamiento externo en ImageNet. El proyecto evalua dos regimenes: clasificador sobre caracteristicas congeladas y fine-tuning de toda la red. En ambos casos se usan tres semillas (42, 2026 y 3407), con la semilla 42 designada a priori como principal. Los hiperparametros y modelos se seleccionan sobre validacion y se bloquean antes del test.

El dataset es Food-11, con particiones originales de 9.866/3.430/3.347 imagenes (train/val/test). Tras eliminar duplicados exactos entre particiones segun una regla predefinida, se usan 9.566/3.119/3.347. El pipeline incluye tres representaciones clasicas (color histogram, LBP y su combinacion) con KNN, SVM y random forest, un estudio de kernels y pesos de clase en SVM, y una evaluacion con perturbaciones de imagen predefinidas. El entorno declarado es Python 3.11.5, PyTorch 2.3.1+cu121, torchvision 0.18.1+cu121 y scikit-learn 1.3.0 sobre una RTX 4090. No se documenta el numero de tokens ni composicion de dataset mas alla de Food-11, ni se menciona RLHF, DPO ni decodificacion especulativa, que no aplican a este tipo de modelo.

## Capacidades

- Clasificacion de imagenes en 11 clases de comida (Food-11).
- Extraccion de caracteristicas visuales con ResNet-18 preentrenado en ImageNet.
- Fine-tuning supervisado de la red completa sobre un dataset de dominio especifico.
- Clasificacion con baselines clasicos sobre caracteristicas hechas a mano (color histogram, LBP) mediante SVM, KNN y random forest.
- Evaluacion de robustez ante perturbaciones de imagen predefinidas.
- Reproducibilidad con tres semillas y verificacion de consistencia entre predicciones guardadas y metricas.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni modo thinking.

## Casos de uso

- Docencia y aprendizaje de vision por computador: el paquete sirve como ejemplo completo de comparacion entre baselines clasicos y redes profundas, con particiones, semillas y metricas documentadas.
- Reproduccion de experimentos academicos: los ZIP separados (modelos, proyecto y resultados) permiten reconstruir el pipeline y verificar las cifras reportadas con el SHA-256 incluido.
- Prototipo de clasificador de imagenes de comida: el checkpoint afinado puede usarse como punto de partida para una demo de clasificacion en 11 categorias, siempre que se respete la licencia (no disponible).
- Estudio de extraccion de caracteristicas congeladas: las caracteristicas de ResNet-18 ImageNet combinadas con SVM ofrecen un baseline rapido (87,33% de accuracy) sin reentrenar la red.
- Analisis de robustez: el conjunto de perturbaciones predefinidas permite medir la degradacion del clasificador ante transformaciones de imagen.
- Benchmark interno de infraestructura: con un unico checkpoint de ~11,7 millones de parametros, es util para validar pipelines de inferencia en PyTorch sobre GPU consumer.

## Benchmarks y rendimiento

| Sistema | Test accuracy | Test macro-F1 |
|---|---:|---:|
| Color histogram + LBP, SVM optimizado | 43,62% | 42,12% |
| Caracteristicas congeladas de ResNet-18 ImageNet, SVM optimizado | 87,33% | 88,00% |
| ResNet-18 fine-tuning, media de tres semillas | 92,37% | 92,83% |

La desviacion estandar muestral entre las tres semillas es de 0,10 puntos porcentuales en accuracy y 0,07 en Macro-F1. No se publican resultados de MMLU, HumanEval ni GSM8K, que no aplican a un modelo de clasificacion de imagenes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; para ResNet-18 en fp32 se sitúa en el rango de cientos de MB a ~1 GB, pero es una estimacion no confirmada por el autor.
- GPU recomendadas: el autor reporta entrenamiento en RTX 4090; la inferencia de ResNet-18 cabe en cualquier GPU consumer moderna.
- Cabe en GPU consumer: si, por el tamano del modelo (ResNet-18), aunque no se documentan requisitos minimos.
- Opciones de despliegue: PyTorch con los checkpoints `.pt` y scikit-learn con los `.joblib`; no se documentan exportaciones a ONNX, GGUF, vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Food-11 course project (ResNet-18 fine-tuned) | no disponible (ResNet-18 estandar ~11,7 M) | imagen 2D | 92,37% accuracy en Food-11 | no disponible | Hugging Face, ZIP de 1,46 GB |
| ResNet-18 ImageNet (torchvision) | ~11,7 M | imagen 2D | no evaluado en Food-11 por el autor salvo como features congeladas (87,33%) | BSD-3-Clause en torchvision (segun documentacion estandar) | torchvision |
| Otros clasificadores Food-11 publicos | no disponible | imagen 2D | no disponible | no disponible | no disponible |

No se dispone de comparativas con modelos alternativos de la misma categoria dentro de la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo fundacional ni un producto listo para produccion; es un archivo de experimentos de curso.
- La licencia no esta disponible, por lo que no puede asumirse uso comercial.
- El rendimiento esta medido sobre una particion fija de Food-11 y condiciones de perturbacion concretas; no es extrapolable a otros dominios.
- La comparacion entre metodos clasicos y ResNet no es limpia: el autor advierte que los preprocesados y resoluciones difieren, y que ResNet incorpora preentrenamiento externo en ImageNet.
- Los datos originales y las caches de caracteristicas no estan incluidos en el paquete de modelos.
- El modelo no procesa texto; las etiquetas de idioma zh/en del repositorio no implican capacidades linguisticas.
- Existe riesgo de sobreajuste al conjunto de validacion por la seleccion de hiperparametros, aunque el autor declara bloqueo previo al test.
- La model card indica asistencia de un agente de IA en la implementacion y verificacion; conviene revisar el codigo antes de reutilizarlo.
- No se documentan sesgos especificos, pero un clasificador de comida entrenado en Food-11 puede tener sesgos de clase y de origen de las imagenes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Peiker/food11-course-project
- Descarga del paquete de modelos: https://huggingface.co/Peiker/food11-course-project/resolve/main/Food11_Models.zip?download=true
- Dataset original Food-11 (EPFL): https://www.epfl.ch/labs/mmspg/downloads/food-image-datasets/
- Mirror de Kaggle usado: https://www.kaggle.com/datasets/trolukovich/food11-image-dataset
- Documentacion de ResNet-18 en torchvision: https://docs.pytorch.org/vision/stable/models/generated/torchvision.models.resnet18.html
