# anagha2312/smai-a4-cifar10-ioc-nn

## Resumen

`smai-a4-cifar10-ioc-nn` es un clasificador de imágenes de muy pequeño tamaño publicado por el usuario `anagha2312` en HuggingFace, aparentemente como entrega de una práctica académica (el prefijo «SMAI A4» sugiere una asignatura y un enunciado de laboratorio). No es un modelo de lenguaje: se trata de un perceptrón multicapa (MLP) completamente conectado con arquitectura `[3072, 128, 10]`, es decir, una única capa oculta de 128 neuronas con activación ELU que recibe la imagen CIFAR-10 aplanada (32×32×3 = 3072 valores) y emite 10 logits, uno por clase.

El modelo resuelve una tarea elemental de clasificación de imágenes de baja resolución sobre el conjunto CIFAR-10. Su único resultado declarado es una precisión de test de 0,4745 (47,45 %), muy por debajo de lo que alcanzan arquitecturas convolucionales, lo que lo sitúa como una referencia didáctica y no como una solución de producción. El preprocesado es parte del artefacto: cada imagen se aplana, se divide entre 255 y se estandariza por columna con la media y la desviación típica calculadas sobre la partición de entrenamiento de CIFAR-10 (`preprocessing.npz`).

La relevancia de esta ficha es, por tanto, acotada: sirve para documentar un artefacto de investigación educativa reproducible, con pesos en dos formatos (`model.npz` del formato de la librería `nn_lib` y `model_state_dict.pt` de PyTorch) y un `config.json`. El repositorio no tiene descargas ni «likes», pesa 0,0 GB y no incluye model card más allá de cuatro líneas con la arquitectura y la precisión final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa (MLP) totalmente conectado, 3072 → 128 → 10, activacion ELU en la capa oculta |
| Parametros totales | 394.634 (calculado a partir de la arquitectura: 3072×128 + 128 + 128×10 + 10) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: es un clasificador de imagenes, entrada fija de 3072 valores |
| Tipos de cuantizacion | No disponible; los pesos se distribuyen en `model.npz` y `model_state_dict.pt` sin indicacion de cuantizacion (presumiblemente fp32) |
| Idiomas soportados | No aplica (no procesa texto) |
| Licencia | No disponible (no declarada en la model card ni en los metadatos) |
| Formato de pesos | `model.npz` (formato de la libreria `nn_lib`) y `model_state_dict.pt` (state dict de PyTorch); incluye `preprocessing.npz` y `config.json` |

## Arquitectura y entrenamiento

La arquitectura es un MLP de dos capas lineales: una proyección de 3072 a 128 dimensiones seguida de una activación ELU, y una capa de salida de 128 a 10 clases. No hay convoluciones, atención, recurrencia ni mecanismo alguno de compartición de pesos espaciales, de modo que el modelo no explota la estructura local de la imagen: cada píxel se trata como una característica independiente. El número de parámetros es de 394.634, lo que sitúa el artefacto en el orden de los kilobytes/megabytes y permite ejecutarlo en CPU sin dependencias de acelerador.

El preprocesado documentado consiste en aplanar la imagen en orden HWC a un vector de 3072 posiciones, dividir entre 255 y aplicar una estandarización por columna (resta de la media y división por la desviación típica) con los estadísticos calculados sobre la partición de entrenamiento de CIFAR-10 y empaquetados en `preprocessing.npz`. La model card no indica el número de épocas, el optimizador, el tamaño de lote, la tasa de aprendizaje, la composición exacta de los datos ni si hubo técnicas de regularización; toda esa información figura como no disponible. No se menciona ningún proceso de ajuste fino supervisado adicional, RLHF, DPO ni innovación técnica destacable.

## Capacidades

- Clasificación de imágenes de 32×32 píxeles en color en una de las 10 categorías estándar de CIFAR-10 (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco y camión), devolviendo 10 logits.
- Inferencia sobre vectores de entrada de dimensión fija 3072; no admite otras resoluciones sin remuestreo previo.
- Carga de pesos en dos ecosistemas: el formato propietario `nn_lib` (`model.npz`) y PyTorch (`model_state_dict.pt`), lo que permite reproducir la inferencia en ambos entornos.
- Reproducibilidad del preprocesado mediante `preprocessing.npz`, con media y desviación típica por columna.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, generación de texto, código, matemáticas, visión general, audio ni modo «thinking». No tiene capacidades multilingües.

## Casos de uso

- Docencia de fundamentos de aprendizaje profundo: el artefacto permite ilustrar en clase el flujo completo (aplanado, normalización por columna, capa oculta con ELU, softmax y entropía cruzada) con un modelo de 394.634 parámetros que se entrena y evalúa en CPU en segundos.
- Baseline de referencia en prácticas y experimentos académicos: sirve como suelo de comparación (0,4745 de precisión en test) frente a CNN u otras arquitecturas que se propongan en el mismo enunciado.
- Pruebas de integración de pipelines de inferencia: al ofrecer pesos en dos formatos (`model.npz` y `model_state_dict.pt`), es útil para validar cargadores, serialización y paridad numérica entre la implementación `nn_lib` y PyTorch.
- Validación de código de preprocesado: `preprocessing.npz` permite escribir tests que comprueben que el aplanado HWC, la división entre 255 y la estandarización por columna se aplican en el orden correcto antes de la inferencia.
- Prototipado en entornos sin GPU o embebidos: por su tamaño (aproximadamente 1,6 MB en fp32) puede ejecutarse en una Raspberry Pi o en el runtime de un navegador para demostrar un clasificador de baja resolución de extremo a extremo.
- Estudio de sensibilidad al preprocesado: al depender de estadísticos por columna calculados sobre el conjunto de entrenamiento, es un caso práctico para medir cómo cambia la precisión si se altera la normalización o se aplica la de otro conjunto de datos.
- Ejercicio de conversión y cuantización de pesos: punto de partida para experimentar con exportación a ONNX o cuantización a int8 sobre un modelo lo bastante pequeño como para inspeccionar los pesos a mano.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| CIFAR-10 (test) | Precision | 0,4745 |
| MMLU | No aplica / no disponible | No disponible |
| HumanEval | No aplica / no disponible | No disponible |
| GSM8K | No aplica / no disponible | No disponible |

No se han publicado resultados de benchmarks en la informacion disponible mas alla de la precision de test en CIFAR-10 consignada en la model card. No se aportan datos de validacion, matriz de confusion, precision por clase ni curvas de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en fp32 (los pesos ocupan aproximadamente 1,6 MB); no requiere GPU.
- GPU recomendadas: ninguna. Cualquier CPU moderna es suficiente; si se desea acelerar, una GPU integrada o cualquier GPU discreta sirve, pero el cuello de botella no será el cálculo.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU, y también en microcontroladores con suficiente memoria para el runtime.
- Opciones de despliegue: NumPy con el formato `nn_lib`, PyTorch mediante `model_state_dict.pt`, o exportación a ONNX (no incluida en el repositorio). vLLM, TGI, llama.cpp u Ollama no son aplicables: son servidores para modelos de lenguaje.
- Latencia y throughput: no se han publicado medidas. Por el tamaño del modelo, la inferencia por imagen queda dominada por el coste fijo del framework y del preprocesado (aplanado y estandarización de 3072 valores) más que por las operaciones matriciales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Precision CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `anagha2312/smai-a4-cifar10-ioc-nn` | 394.634 | Imagen 32×32×3 aplanada a 3072 | 0,4745 | No disponible | HuggingFace, 0 descargas |
| Alternativas convolucionales para CIFAR-10 (ResNet, VGG, etc.) | No disponible en la informacion proporcionada | Imagen 32×32×3 | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No verificado |
| Otros MLP academicos sobre CIFAR-10 | No disponible en la informacion proporcionada | Imagen 32×32×3 aplanada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No verificado |

No se dispone de datos comparativos verificables en la informacion proporcionada; la busqueda web realizada no devolvio resultados relacionados con el modelo ni con alternativas tecnicas utilizables. La comparacion cuantitativa con otras arquitecturas queda pendiente.

## Limitaciones y advertencias

- Precision de test de 0,4745: insuficiente para cualquier aplicacion real de clasificacion de imagenes; el modelo se equivoca en mas de la mitad de los ejemplos.
- Ausencia total de estructura convolucional: el MLP no aprovecha la localidad espacial, lo que explica en parte su baja precision y lo hace sensible a traslaciones y cambios de iluminacion.
- Licencia no declarada: sin terminos explicitos, no se puede asumir permiso para uso comercial; debe contactarse con el autor antes de cualquier explotacion.
- Model card minima: no se documentan datos de entrenamiento, hiperparametros, semillas ni proceso de evaluacion, por lo que el resultado de 0,4745 no es reproducible a partir de la informacion publicada.
- Dependencia critica del preprocesado: si no se aplica exactamente la estandarizacion por columna de `preprocessing.npz`, las predicciones dejan de ser validas.
- Entrada restringida a 3072 valores: no acepta imagenes de otra resolucion ni otros dominios sin remuestreo y reentrenamiento.
- Riesgo de sesgo heredado de CIFAR-10: el conjunto de datos contiene clases y contextos muy acotados, con posibles desequilibrios y sesgos de representacion no analizados por el autor.
- Artefacto academico sin mantenimiento: 0 descargas, 0 «likes» y un unico commit; no hay garantia de soporte, issues ni actualizaciones.
- No es un modelo generativo ni un modelo de lenguaje: no admite prompt, contexto conversacional ni instrucciones; cualquier expectativa en ese sentido es un error de uso.

## Enlaces

- HuggingFace: https://huggingface.co/anagha2312/smai-a4-cifar10-ioc-nn
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos relacionados con este modelo. Los resultados devueltos por la busqueda no guardan relacion con el artefacto y se han descartado.
