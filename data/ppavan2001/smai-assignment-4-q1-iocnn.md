# ppavan2001/smai-assignment-4-q1-iocnn

## Resumen

IOC-NN es un modelo de red neuronal totalmente conectada publicado por el usuario ppavan2001 como parte de la asignatura SMAI (Statistical Machine Learning and Inference), en la cuarta tarea y primera pregunta. Se trata de un clasificador de imagenes para el conjunto de datos CIFAR-10, con una arquitectura de tres capas densas de dimensiones `[3072, 256, 128, 10]` y activacion `elu` en las capas ocultas.

El modelo resuelve el problema clasico de clasificacion de imagenes RGB de 32x32 pixeles en diez categorias, aplicando un preprocesamiento concreto: aplanado de la imagen, division por 255 y estandarizacion por caracteristica usando la media y desviacion tipica del split de entrenamiento oficial de CIFAR-10. Los valores de normalizacion se distribuyen en un fichero `preprocessing.npz` junto con los pesos.

Su relevancia es limitada fuera del ambito academico: no hay informacion publicada sobre el pipeline, la licencia, los idiomas ni el rendimiento. El repositorio ocupa 0.0 GB y no registra descargas ni likes en el momento de la consulta, lo que sugiere un artefacto de entrega de tarea mas que un modelo destinado a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal totalmente conectada (MLP) con capas `[3072, 256, 128, 10]` y activacion `elu` |
| Parametros totales | no disponible (estimacion a partir de la arquitectura: 3072x256 + 256 + 256x128 + 128 + 128x10 + 10 = 819.722) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada fija de 3072 valores, imagen RGB 32x32 aplanada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio PyTorch; el autor menciona `preprocessing.npz` para los valores de normalizacion) |

## Arquitectura y entrenamiento

La arquitectura es un perceptron multicapa con tres transformaciones lineales: una capa de entrada de 3072 unidades (32x32x3, correspondiente a una imagen CIFAR-10 aplanada), una capa oculta de 256 unidades, otra de 128 unidades y una capa de salida de 10 clases. Las activaciones de las capas ocultas son `elu` (exponential linear unit). No se documenta el uso de dropout, normalizacion por lotes ni regularizacion adicional.

El preprocesamiento es parte integral del modelo: cada imagen se aplana, se divide por 255 y se estandariza por caracteristica con la media y la desviacion tipica del split de entrenamiento oficial de CIFAR-10, valores almacenados en `preprocessing.npz`. No se especifican el numero de tokens, la composicion del dataset mas alla de CIFAR-10, ni si hubo tecnicas de refinamiento como RLHF o DPO (no aplicables en un clasificador de este tipo). Tampoco se detalla el regimen de entrenamiento (optimizador, learning rate, numero de epocas) ni innovaciones tecnicas destacables.

## Capacidades

- Clasificacion de imagenes RGB de 32x32 pixeles en las diez clases de CIFAR-10 (avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco, camion).
- Inferencia sobre vectores de 3072 dimensiones previamente aplanados y estandarizados.
- No dispone de generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni procesamiento de lenguaje natural.
- No incorpora modo de pensamiento, vision avanzada, audio ni otras capacidades especiales mas alla de la clasificacion de imagenes de baja resolucion.

## Casos de uso

- Docencia y practicas de aprendizaje automatico: el modelo sirve como referencia basica de un MLP entrenado sobre CIFAR-10 para comparar con arquitecturas convolucionales en un curso de SMAI.
- Clasificacion rapida de miniaturas de 32x32 en entornos de experimentacion: util para validar pipelines de preprocesamiento (aplanado, escalado y estandarizacion) antes de migrar a modelos convolucionales.
- Baseline de referencia en experimentos de ablation: al ser una red densa sencilla, permite medir la ganancia que aportan capas convolucionales o tecnicas de regularizacion sobre el mismo conjunto de datos.
- Pruebas de integracion de artefactos PyTorch: sirve para verificar la carga de pesos y ficheros auxiliares (`preprocessing.npz`) en un flujo de trabajo de PyTorch.
- Reproduccion de resultados academicos: permite reproducir la solucion de la pregunta 1 de la tarea 4 de SMAI si se dispone del enunciado y del split de CIFAR-10 original.
- Demostracion de inferencia en CPU: por su tamano reducido (menos de un millon de parametros), puede ejecutarse en entornos sin GPU para ilustrar el ciclo completo de carga, preprocesado y prediccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en precision de 32 bits para los pesos (aproximadamente 819.722 parametros, unos 3,3 MB) mas el espacio de activaciones, despreciable en cualquier GPU moderna.
- GPU recomendadas: no se requiere GPU; cualquier CPU moderna es suficiente para inferencia interactiva.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, GTX 1650, etc.) e incluso en entornos integrados sin GPU dedicada.
- Opciones de despliegue: PyTorch nativo; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles; por el tamano del modelo, la latencia por muestra en CPU deberia ser del orden de microsegundos a milisegundos, aunque no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IOC-NN (este modelo) | ~819.722 (estimado) | Imagen 32x32x3 aplanada (3072) | no disponible | no disponible | Hugging Face, 0 descargas |
| MLP generico sobre CIFAR-10 | variable | Imagen 32x32x3 aplanada | no disponible | variable | multiple en Hugging Face |
| LeNet-5 (CNN clasica) | ~60.000 | Imagen 32x32 | no disponible en esta ficha | variable | implementaciones publicas |
| ResNet-18 adaptada a CIFAR-10 | ~11,2 M | Imagen 32x32 | no disponible en esta ficha | MIT (referencia original) | ampliamente disponible |

No se dispone de datos de rendimiento de este modelo ni de comparaciones publicadas que permitan una evaluacion cuantitativa frente a alternativas.

## Limitaciones y advertencias

- No se ha publicado informacion sobre sesgos; al entrenarse sobre CIFAR-10, hereda los sesgos y desequilibrios de ese conjunto de datos, pero no se documentan analisis al respecto.
- Riesgo de alucinacion no aplicable en sentido estricto (es un clasificador), pero si riesgo de predicciones erroneas con alta confianza en imagenes fuera de la distribucion de CIFAR-10.
- Limitacion de entrada: solo acepta imagenes de 32x32x3 aplanadas y estandarizadas con los valores concretos de `preprocessing.npz`; cualquier otra resolucion o normalizacion invalida las predicciones.
- Limitacion de idioma: no aplica, es un modelo de vision sin capacidades linguisticas.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede confirmar el uso comercial; se recomienda contactar con el autor antes de cualquier uso fuera del ambito academico.
- Caveat para produccion: el repositorio no incluye pipeline, metricas ni documentacion de entrenamiento; no es adecuado como componente de un sistema en produccion sin una evaluacion previa.
- El modelo no ha sido validado externamente y registra cero descargas y cero likes, lo que indica ausencia de uso o verificacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ppavan2001/smai-assignment-4-q1-iocnn
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion disponible.
