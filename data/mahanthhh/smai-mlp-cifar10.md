# Mahanthhh/smai-mlp-cifar10

## Resumen

`smai-mlp-cifar10` es un perceptron multicapa (MLP) entrenado para clasificacion de imagenes sobre el conjunto de datos CIFAR-10. Lo publica el usuario de Hugging Face Mahanthhh como parte de la asignatura SMAI (Assignment 4, semestre Monsoon 2026), con numero de matricula 2024101017 y semilla 1017. No es un modelo de lenguaje ni un transformer: es una red neuronal densa de proposito academico, pensada para demostrar el flujo completo de preprocesado, entrenamiento y evaluacion sobre un benchmark clasico de vision por computador.

El modelo toma una imagen de 32x32x3 pixeles, la aplana a un vector de 3072 dimensiones y la procesa a traves de dos capas ocultas de 128 y 64 neuronas con activacion ReLU, hasta una capa de salida lineal de 10 clases (una por cada categoria de CIFAR-10). El total de parametros es de 402.250, un orden de magnitud muy alejado de los modelos de vision modernos, lo que lo situa en la categoria de ejercicios didacticos y no en la de modelos listos para produccion.

Su relevancia es, por tanto, limitada al ambito educativo: sirve como referencia de implementacion basica en PyTorch y NumPy, y como linea base trivial frente a la que comparar arquitecturas convolucionales. No dispone de licencia declarada, de idiomas soportados ni de pesos en formatos estandar de despliegue, y el repositorio ocupa 0.0 GB, lo que sugiere que los pesos podrian no estar efectivamente subidos o que el contenido es minimo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa (MLP) denso: 3072 -> 128 -> 64 -> 10 |
| Parametros totales | 402.250 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada fija de 3072 valores) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; clasificacion de imagenes) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio ocupa 0.0 GB; la model card menciona PyTorch y NumPy) |

## Arquitectura y entrenamiento

La arquitectura es un MLP totalmente conectado de tres capas lineales. La entrada es la imagen aplanada de 32x32x3 = 3072 valores; la primera capa oculta proyecta a 128 neuronas, la segunda a 64, ambas con activacion ReLU, y la capa final emite 10 logits correspondientes a las clases de CIFAR-10 (avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco y camion). El computo de parametros es coherente con esa descripcion: 3072x128 + 128 + 128x64 + 64 + 64x10 + 10 = 402.250.

El preprocesado descrito en la model card escala los pixeles por 1/255.0 y los convierte a float64, y despues estandariza cada columna (cada caracteristica de pixel) usando la media y la desviacion tipica calculadas sobre el conjunto de entrenamiento. No se documenta el numero de epocas, el optimizador, la tasa de aprendizaje, el tamano de batch ni si se aplico aumento de datos. Tampoco se menciona ningun tipo de regularizacion (dropout, weight decay) ni tecnicas de refinamiento como RLHF o DPO, que no aplican a este tipo de modelo. No hay innovaciones tecnicas destacables: se trata de la formulacion mas elemental de un clasificador supervisado.

## Capacidades

- Clasificacion de imagenes de 32x32x3 en exactamente 10 categorias de CIFAR-10.
- Salida de logits por clase, apta para aplicar softmax y obtener probabilidades.
- Inferencia determinista y de coste computacional minimo (402.250 parametros).
- Entrenamiento y ejecucion en CPU sin necesidad de GPU.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo thinking, vision general (solo la entrada fija de 32x32), audio ni multimodalidad.
- No admite imagenes de resolucion distinta a 32x32 sin redimensionado y aplanado previos.

## Casos de uso

- Docencia de aprendizaje automatico: usar el modelo como ejemplo minimo de pipeline supervisado (carga de datos, normalizacion, forward pass, calculo de perdida y evaluacion) en un curso introductorio, gracias a su tamano reducido y a su implementacion directa en PyTorch.
- Linea base de referencia en experimentos de vision: comparar una CNN o un ViT contra este MLP para cuantificar la ganancia de las convoluciones sobre CIFAR-10 con el mismo protocolo de preprocesado.
- Pruebas unitarias de infraestructura de inferencia: validar el correcto funcionamiento de un servidor de modelos o de un pipeline de clasificacion con un artefacto de 402.250 parametros que se carga y ejecuta en milisegundos en CPU.
- Demostraciones de preprocesado: ilustrar el efecto de la estandarizacion por columna (media y desviacion tipica del conjunto de entrenamiento) sobre la convergencia de una red densa.
- Ejercicios de analisis de errores: estudiar que clases de CIFAR-10 confunde sistematicamente un modelo sin sesgo inductivo espacial, lo que resulta util para explicar por que la vision por computador requiere convoluciones o atencion.
- Prototipado offline en entornos sin GPU: al no requerir acelerador, puede ejecutarse en portatiles, contenedores ligeros o entornos de CI para pruebas de humo de extremo a extremo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye exactitud de entrenamiento, exactitud de validacion ni de test, matriz de confusion ni comparacion con otras arquitecturas sobre CIFAR-10.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 10 MB en float32 (402.250 parametros x 4 bytes, aproximadamente 1,6 MB, mas activaciones y overhead del runtime); en float64, el doble para los pesos.
- GPU recomendadas: ninguna en particular; el modelo esta pensado para CPU. Cualquier GPU consumer (por ejemplo, una GTX 1650 o superior) lo ejecutaria con holgura, pero no aportaria ventaja practica.
- Cabe en cualquier GPU consumer y tambien en CPU y en entornos embebidos.
- Opciones de despliegue: PyTorch nativo y NumPy segun la model card; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de este tipo. Un servidor HTTP propio con FastAPI o TorchServe seria el enfoque razonable.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, la latencia por muestra en CPU deberia ser del orden de microsegundos a pocos milisegundos, pero no se ha publicado ninguna medicion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smai-mlp-cifar10 | 402.250 | 3072 valores (32x32x3) | Clasificacion CIFAR-10 | no disponible | Hugging Face, repo de 0.0 GB |
| LeNet-5 (referencia historica) | ~60.000 | 32x32x1 | Clasificacion de digitos | no disponible | Implementaciones multiples |
| ResNet-18 adaptado a CIFAR-10 | ~11,2 M | 32x32x3 | Clasificacion CIFAR-10 | MIT (torchvision) | Disponible en torchvision |
| ViT pequeno para CIFAR-10 | variable | 32x32x3 con parches | Clasificacion CIFAR-10 | variable | Multiples implementaciones |

La comparacion con alternativas de la misma categoria es limitada porque no se han publicado metricas de este modelo. Frente a ResNet-18 o a un ViT pequeno, la diferencia en parametros es de uno a dos ordenes de magnitud, y la ausencia de sesgo inductivo espacial en el MLP lo situa estructuralmente por debajo en exactitud sobre CIFAR-10, aunque no se dispone de cifras concretas para confirmarlo.

## Limitaciones y advertencias

- No se ha declarado licencia, por lo que el uso comercial queda en un limbo juridico; conviene contactar con el autor antes de cualquier explotacion.
- El repositorio ocupa 0.0 GB, lo que sugiere que los pesos podrian no estar incluidos o que el contenido es meramente descriptivo; verificar antes de intentar cargarlo.
- Ausencia total de metricas publicadas: no hay exactitud ni en entrenamiento ni en test, lo que impide evaluar su calidad real.
- La model card no documenta hiperparametros de entrenamiento (epocas, optimizador, tasa de aprendizaje, batch), lo que dificulta la reproducibilidad.
- Es un modelo puramente academico, sin validacion en produccion ni mantenimiento previsto.
- Un MLP sin convoluciones ni atencion tiene un sesgo inductivo muy pobre para vision: no es invariante a traslaciones y trata cada pixel de forma independiente, lo que limita su exactitud frente a CNN.
- La estandarizacion por columna de pixel depende de las estadisticas del conjunto de entrenamiento; si se usa con imagenes de otra distribucion, el rendimiento puede degradarse sin aviso.
- Solo acepta entradas de 32x32x3; no maneja otras resoluciones ni canales distintos de RGB sin preprocesado adicional.
- No aplica ninguna salvaguarda frente a sesgos de CIFAR-10 (por ejemplo, desbalance o etiquetas ruidosas en el dataset original), aunque el impacto practico es minimo dado su caracter didactico.
- Riesgo de alucinacion no aplica (no genera texto), pero si existe riesgo de sobreconfianza en los logits si no se calibra la salida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mahanthhh/smai-mlp-cifar10
- Dataset CIFAR-10 (referencia): https://www.cs.toronto.edu/~kriz/cifar.html
- PyTorch (framework mencionado): https://pytorch.org/
- NumPy (libreria mencionada): https://numpy.org/
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
